import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { SyncEngine } from "./sync";
import type { Pending, Transport, WriteResult, SyncStatus } from "./sync";
import { initial, id } from "../model";
import type { State } from "../model";
import { canonical, mergeDeviceRecords, mergeConcurrentState } from "./records";
const food = (calories = 400) => ({
  id: "food",
  date: "2026-10-21",
  name: "Meal",
  meal: "Lunch",
  calories,
  protein: 20,
  carbs: 50,
  fat: 10,
});
function server() {
  const rows = new Map<
      string,
      {
        revision: number;
        payload: unknown;
        kind: Pending["kind"];
        recordId: string;
      }
    >(),
    ops = new Map<string, WriteResult>();
  let failAfterCommit = false;
  return {
    rows,
    dropAck: () => {
      failAfterCommit = true;
    },
    transport: {
      async read() {
        return [...rows.values()];
      },
      async write(p) {
        if (ops.has(p.operationId)) return ops.get(p.operationId)!;
        const current = rows.get(p.id),
          revision = current?.revision ?? 0;
        if (revision !== p.expectedRevision)
          return {
            status: "conflict",
            revision,
            payload: current?.payload ?? null,
          };
        rows.set(p.id, {
          kind: p.kind,
          recordId: p.recordId,
          revision: revision + 1,
          payload: p.payload,
        });
        const result: WriteResult = { status: "saved", revision: revision + 1 };
        ops.set(p.operationId, result);
        if (failAfterCommit) {
          failAfterCommit = false;
          throw Error("Lost response");
        }
        return result;
      },
    } as Transport,
  };
}
function device(transport: Transport, scope = id()) {
  let state = structuredClone(initial),
    status: SyncStatus = { state: "local", pending: 0, conflicts: [] };
  const engine = new SyncEngine(
    scope,
    state,
    transport,
    (s) => {
      state = s;
    },
    (s) => {
      status = s;
    },
  );
  return {
    engine,
    get state() {
      return state;
    },
    get status() {
      return status;
    },
  };
}
describe("offline sync and account safety", () => {
  it("retries a committed write with a lost response without duplicating it", async () => {
    const s = server(),
      d = device(s.transport);
    await d.engine.capture({ ...initial, foods: [food()] });
    s.dropAck();
    await d.engine.sync();
    expect(d.status.state).toBe("error");
    expect(await d.engine.pending()).toHaveLength(1);
    await d.engine.sync();
    expect(await d.engine.pending()).toHaveLength(0);
    expect(s.rows.get("food:food")?.revision).toBe(1);
    d.engine.close();
  });
  it("preserves offline changes after reopening its IndexedDB queue", async () => {
    const s = server(),
      scope = id(),
      d = device(s.transport, scope);
    await d.engine.capture({ ...initial, foods: [food()] });
    d.engine.close();
    const reopened = new SyncEngine(
      scope,
      { ...initial, foods: [food()] },
      s.transport,
      () => {},
      () => {},
    );
    await reopened.sync();
    expect(s.rows.get("food:food")?.revision).toBe(1);
    reopened.close();
  });
  it("requires explicit conflict resolution between two devices", async () => {
    const s = server(),
      a = device(s.transport),
      b = device(s.transport);
    await a.engine.capture({ ...initial, foods: [food()] });
    await a.engine.sync();
    await b.engine.sync();
    await a.engine.capture({ ...a.state, foods: [food(500)] });
    await b.engine.capture({ ...b.state, foods: [food(600)] });
    await a.engine.sync();
    await b.engine.sync();
    expect(b.status.state).toBe("conflict");
    expect(b.state.foods[0].calories).toBe(600);
    await b.engine.resolve("food:food", "cloud");
    await b.engine.sync();
    expect(b.state.foods[0].calories).toBe(500);
    a.engine.close();
    b.engine.close();
  });
  it("does not resurrect a cloud tombstone from a stale device", async () => {
    const s = server(),
      a = device(s.transport),
      b = device(s.transport);
    await a.engine.capture({ ...initial, foods: [food()] });
    await a.engine.sync();
    await b.engine.sync();
    await a.engine.capture({ ...a.state, foods: [] });
    await a.engine.sync();
    await b.engine.sync();
    expect(b.state.foods).toEqual([]);
    await b.engine.capture({ ...b.state, theme: "Midnight" });
    await b.engine.sync();
    expect(s.rows.get("food:food")?.payload).toBeNull();
    a.engine.close();
    b.engine.close();
  });
  it("never silently imports anonymous data or overwrites an existing account version", () => {
    const account = { ...initial, foods: [food(500)] },
      guest = { ...initial, foods: [food(200), { ...food(300), id: "other" }] };
    const before = canonical(guest),
      merged = mergeDeviceRecords(account, guest);
    expect(merged.foods).toHaveLength(2);
    expect(merged.foods.find((f) => f.id === "food")?.calories).toBe(500);
    expect(canonical(guest)).toBe(before);
    expect(initial.foods).toEqual([]);
  });
  it("keeps another tab’s local edits while applying a cloud pull", () => {
    const expected = { ...initial, foods: [food(400)] },
      current = { ...initial, foods: [food(600)] },
      incoming = { ...initial, foods: [food(500)], theme: "Midnight" as const };
    const merged = mergeConcurrentState(expected, current, incoming);
    expect(merged.foods[0].calories).toBe(600);
    expect(merged.theme).toBe("Midnight");
  });
  it("keeps changes made while an older network write is in flight", async () => {
    const s = server();
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    let signal!: () => void;
    const started = new Promise<void>((r) => (signal = r));
    let gated = true;
    const transport: Transport = {
      ...s.transport,
      async write(p) {
        if (gated) {
          gated = false;
          signal();
          await gate;
        }
        return s.transport.write(p);
      },
    };
    const d = device(transport);
    await d.engine.capture({ ...initial, foods: [food(400)] });
    const syncing = d.engine.sync();
    await started;
    const capture = d.engine.capture({ ...initial, foods: [food(700)] });
    release();
    await syncing;
    await capture;
    await d.engine.sync();
    expect(d.state.foods[0].calories).toBe(700);
    expect(
      (s.rows.get("food:food")?.payload as ReturnType<typeof food>).calories,
    ).toBe(700);
    d.engine.close();
  });
});
it("does not delete another tab’s records or pending edits while an older write is in flight", async () => {
  const s = server(),
    scope = id();
  let disk: State = { ...initial, foods: [food(400)] };
  let release!: () => void, signal!: () => void;
  const gate = new Promise<void>((r) => (release = r)),
    started = new Promise<void>((r) => (signal = r));
  let gated = true;
  const oldTransport: Transport = {
    ...s.transport,
    async write(p) {
      if (gated) {
        gated = false;
        signal();
        await gate;
      }
      return s.transport.write(p);
    },
  };
  const apply = (state: State) => {
    disk = state;
  };
  const a = new SyncEngine(
    scope,
    disk,
    oldTransport,
    apply,
    () => {},
    () => true,
    () => disk,
  );
  await a.capture(disk);
  const pending = a.sync();
  await started;
  const b = new SyncEngine(
    scope,
    disk,
    s.transport,
    apply,
    () => {},
    () => true,
    () => disk,
  );
  disk = { ...disk, foods: [food(700)] };
  await b.capture(disk);
  release();
  await pending;
  expect(disk.foods[0].calories).toBe(700);
  expect(await b.pending()).toHaveLength(1);
  await b.sync();
  expect(disk.foods[0].calories).toBe(700);
  expect(
    (s.rows.get("food:food")?.payload as ReturnType<typeof food>).calories,
  ).toBe(700);
  a.close();
  b.close();
});
