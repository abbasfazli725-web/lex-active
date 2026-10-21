import { openDB } from "idb";
import type { IDBPDatabase } from "idb";
import type { SupabaseClient } from "@supabase/supabase-js";
import { id, initial } from "../model";
import type { State } from "../model";
import {
  canonical,
  recordKey,
  recordsFromState,
  stateFromRecords,
} from "./records";
import type { Kind, CloudRecord, Records } from "./records";
export type Pending = {
  id: string;
  kind: Kind;
  recordId: string;
  payload: unknown;
  expectedRevision: number;
  operationId: string;
  conflict?: { revision: number; payload: unknown };
};
export type WriteResult =
  | { status: "saved"; revision: number }
  | { status: "conflict"; revision: number; payload: unknown };
export type Transport = {
  read: () => Promise<CloudRecord[]>;
  write: (p: Pending) => Promise<WriteResult>;
};
export type SyncStatus = {
  state:
    | "local"
    | "syncing"
    | "synced"
    | "offline"
    | "pending"
    | "conflict"
    | "error";
  pending: number;
  conflicts: Pending[];
  error?: string;
  lastSynced?: string;
};
export function supabaseTransport(
  client: SupabaseClient,
  accountId: string,
): Transport {
  return {
    async read() {
      const { data, error } = await client.rpc("sync_catalog", {
        p_account_id: accountId,
      });
      if (error) throw Error(error.message);
      if (
        !Array.isArray(data) ||
        data.some(
          (r) =>
            !r ||
            !["workout", "routine", "food", "preferences", "drafts"].includes(
              r.kind,
            ) ||
            typeof r.recordId !== "string" ||
            !Number.isSafeInteger(r.revision),
        )
      )
        throw Error("Invalid sync response; local records were preserved.");
      return data;
    },
    async write(p) {
      const { data, error } = await client.rpc("sync_write", {
        p_account_id: accountId,
        p_kind: p.kind,
        p_record_id: p.recordId,
        p_payload: p.payload,
        p_expected_revision: p.expectedRevision,
        p_operation_id: p.operationId,
      });
      if (error) throw Error(error.message);
      if (
        !data ||
        !["saved", "conflict"].includes(data.status) ||
        !Number.isSafeInteger(data.revision)
      )
        throw Error("Invalid sync acknowledgement.");
      return data;
    },
  };
}
export class SyncEngine {
  private db: Promise<IDBPDatabase>;
  private tail: Promise<void> = Promise.resolve();
  private disposed = false;
  private desired: State;
  constructor(
    scope: string,
    state: State,
    private transport: Transport,
    private apply: (s: State, expected: State) => State | void,
    private report: (s: SyncStatus) => void,
    private online: () => boolean = () => navigator.onLine,
    private readDevice?: () => State,
  ) {
    this.desired = state;
    this.db = openDB(`lex-active-sync:${scope}`, 1, {
      upgrade(db) {
        db.createObjectStore("meta");
        db.createObjectStore("outbox", { keyPath: "id" });
      },
    });
  }
  private schedule(work: () => Promise<void>) {
    this.tail = this.tail
      .then(async () => {
        if (!this.disposed) await work();
      })
      .catch(async (e) => {
        if (!this.disposed) {
          const rows = await this.pending().catch(() => []);
          this.report({
            state: "error",
            pending: rows.length,
            conflicts: rows.filter((r) => r.conflict),
            error:
              e instanceof Error
                ? e.message
                : "Cloud sync unavailable. Device records are safe.",
          });
        }
      });
    return this.tail;
  }
  async pending(): Promise<Pending[]> {
    return (await this.db).getAll("outbox");
  }
  private async captureCurrent() {
    if (this.readDevice) this.desired = this.readDevice();
    const db = await this.db,
      tx = db.transaction(["meta", "outbox"], "readwrite"),
      meta = tx.objectStore("meta"),
      outbox = tx.objectStore("outbox");
    const before: Records =
        (await meta.get("snapshot")) ?? recordsFromState(initial),
      after = recordsFromState(this.desired),
      revisions: Record<string, number> = (await meta.get("revisions")) ?? {};
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)]))
      if (canonical(before[key]) !== canonical(after[key])) {
        const existing: Pending | undefined = await outbox.get(key);
        const r = after[key] ?? before[key];
        await outbox.put({
          id: key,
          kind: r.kind,
          recordId: r.recordId,
          payload: after[key]?.payload ?? null,
          expectedRevision: existing?.expectedRevision ?? revisions[key] ?? 0,
          operationId: id(),
          ...(existing?.conflict ? { conflict: existing.conflict } : {}),
        });
      }
    await meta.put(after, "snapshot");
    await tx.done;
  }
  capture(state: State) {
    this.desired = state;
    return this.schedule(async () => {
      await this.captureCurrent();
      await this.reportQueue();
    });
  }
  private async reportQueue() {
    if (this.disposed) return;
    const rows = await this.pending();
    this.report({
      state: rows.some((r) => r.conflict)
        ? "conflict"
        : rows.length
          ? "pending"
          : this.online()
            ? "synced"
            : "offline",
      pending: rows.length,
      conflicts: rows.filter((r) => r.conflict),
    });
  }
  sync() {
    return this.schedule(async () => {
      await this.captureCurrent();
      if (!this.online()) {
        const rows = await this.pending();
        this.report({
          state: "offline",
          pending: rows.length,
          conflicts: rows.filter((r) => r.conflict),
        });
        return;
      }
      const before = recordsFromState(this.desired);
      this.report({
        state: "syncing",
        pending: (await this.pending()).length,
        conflicts: [],
      });
      const db = await this.db;
      for (const row of await this.pending()) {
        if (this.disposed) return;
        if (row.conflict) continue;
        const result = await this.transport.write(row);
        if (this.disposed) return;
        const tx = db.transaction(["outbox", "meta"], "readwrite"),
          outbox = tx.objectStore("outbox"),
          meta = tx.objectStore("meta");
        if (result.status === "saved") {
          const revisions = (await meta.get("revisions")) ?? {};
          revisions[row.id] = Math.max(revisions[row.id] ?? 0, result.revision);
          await meta.put(revisions, "revisions");
          const latest: Pending | undefined = await outbox.get(row.id);
          if (latest?.operationId === row.operationId)
            await outbox.delete(row.id);
          else if (latest && latest.expectedRevision <= row.expectedRevision)
            await outbox.put({
              ...latest,
              expectedRevision: result.revision,
              operationId: id(),
            });
        } else {
          const latest: Pending | undefined = await outbox.get(row.id);
          if (latest && latest.expectedRevision <= row.expectedRevision)
            await outbox.put({
              ...latest,
              conflict: { revision: result.revision, payload: result.payload },
            });
        }
        await tx.done;
      }
      const remote = await this.transport.read();
      if (this.disposed) return;
      if (this.readDevice) this.desired = this.readDevice();
      const knownRevisions: Record<string, number> =
        (await db.get("meta", "revisions")) ?? {};
      const rows = await this.pending(),
        pendingKeys = new Set(rows.map((r) => r.id)),
        current = recordsFromState(this.desired),
        applied = new Map<string, CloudRecord>();
      for (const r of remote) {
        const key = recordKey(r.kind, r.recordId);
        if (r.revision < (knownRevisions[key] ?? 0)) continue;
        if (
          pendingKeys.has(key) ||
          canonical(before[key]) !== canonical(current[key])
        )
          continue;
        if (r.payload === null) delete current[key];
        else
          current[key] = {
            kind: r.kind,
            recordId: r.recordId,
            payload: r.payload,
          };
        applied.set(key, r);
      }
      const merged = stateFromRecords(current);
      if (this.disposed) return;
      const accepted = this.apply(merged, this.desired) ?? merged;
      this.desired = accepted;
      const acceptedRecords = recordsFromState(accepted);
      for (const [key, r] of applied)
        if (
          canonical(acceptedRecords[key]?.payload ?? null) !==
          canonical(r.payload)
        )
          applied.delete(key);
      const tx = db.transaction("meta", "readwrite"),
        meta = tx.objectStore("meta"),
        snapshot: Records =
          (await meta.get("snapshot")) ?? recordsFromState(initial),
        revisions = (await meta.get("revisions")) ?? {};
      for (const [key, r] of applied) {
        revisions[key] = r.revision;
        if (r.payload === null) delete snapshot[key];
        else snapshot[key] = current[key];
      }
      await meta.put(revisions, "revisions");
      await meta.put(snapshot, "snapshot");
      await tx.done;
      await this.captureCurrent();
      const remaining = await this.pending();
      this.report({
        state: remaining.some((r) => r.conflict)
          ? "conflict"
          : remaining.length
            ? "pending"
            : "synced",
        pending: remaining.length,
        conflicts: remaining.filter((r) => r.conflict),
        lastSynced: remaining.length ? undefined : new Date().toISOString(),
      });
    });
  }
  resolve(key: string, choice: "device" | "cloud") {
    return this.schedule(async () => {
      const db = await this.db,
        row: Pending | undefined = await db.get("outbox", key);
      if (!row?.conflict) return;
      const tx = db.transaction(["meta", "outbox"], "readwrite"),
        meta = tx.objectStore("meta"),
        outbox = tx.objectStore("outbox");
      await meta.put(row, `conflict-backup:${row.operationId}`);
      const revision = row.conflict.revision;
      if (choice === "device")
        await outbox.put({
          ...row,
          expectedRevision: revision,
          operationId: id(),
          conflict: undefined,
        });
      else {
        await outbox.delete(key);
        const current = recordsFromState(this.desired);
        if (row.conflict.payload === null) delete current[key];
        else
          current[key] = {
            kind: row.kind,
            recordId: row.recordId,
            payload: row.conflict.payload,
          };
        const merged = stateFromRecords(current);
        this.desired = this.apply(merged, this.desired) ?? merged;
        const snapshot = (await meta.get("snapshot")) ?? {};
        if (row.conflict.payload === null) delete snapshot[key];
        else snapshot[key] = current[key];
        await meta.put(snapshot, "snapshot");
      }
      const revisions = (await meta.get("revisions")) ?? {};
      revisions[key] = revision;
      await meta.put(revisions, "revisions");
      await tx.done;
      await this.reportQueue();
    });
  }
  async idle() {
    await this.tail;
  }
  close() {
    this.disposed = true;
    void this.tail.then(async () => {
      (await this.db).close();
    });
  }
}
