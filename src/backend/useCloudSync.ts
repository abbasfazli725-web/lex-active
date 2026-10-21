import { useEffect, useRef, useState } from "react";
import { load } from "../model";
import type { State } from "../model";
import { useAuth } from "./Auth";
import { supabaseTransport, SyncEngine } from "./sync";
import type { SyncStatus } from "./sync";
export function useCloudSync(
  state: State,
  apply: (s: State, expected: State) => State | void,
) {
  const { client, user, storageKey } = useAuth();
  const engine = useRef<SyncEngine | null>(null),
    applyRef = useRef(apply),
    latest = useRef(state),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  applyRef.current = apply;
  latest.current = state;
  const [status, setStatus] = useState<SyncStatus>({
    state: "local",
    pending: 0,
    conflicts: [],
  });
  useEffect(() => {
    if (!client || !user) return;
    const active = new SyncEngine(
      storageKey,
      latest.current,
      supabaseTransport(client, user.id),
      (s, expected) => applyRef.current(s, expected),
      setStatus,
      () => navigator.onLine,
      () => load(storageKey),
    );
    engine.current = active;
    void active.sync();
    const sync = () => void active.sync();
    window.addEventListener("online", sync);
    window.addEventListener("focus", sync);
    const interval = setInterval(sync, 30000);
    return () => {
      engine.current = null;
      clearTimeout(timer.current);
      clearInterval(interval);
      window.removeEventListener("online", sync);
      window.removeEventListener("focus", sync);
      active.close();
    };
  }, [client, user?.id, storageKey]);
  return {
    status,
    capture: (next: State) => {
      const e = engine.current;
      if (!e) return;
      void e.capture(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void e.sync(), 750);
    },
    sync: () => void engine.current?.sync(),
    flush: async () => {
      const e = engine.current;
      if (!e) throw Error("Sign in before using cloud features.");
      await e.sync();
      if ((await e.pending()).length)
        throw Error(
          "Some device changes are still queued or conflicted. Review cloud sync before sharing.",
        );
    },
    resolve: async (key: string, choice: "device" | "cloud") => {
      await engine.current?.resolve(key, choice);
      void engine.current?.sync();
    },
  };
}
