import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import {
  getClient,
  configured,
  configurationError,
  projectUrl,
  accountStorageKey,
} from "./client";
import { KEY } from "../model";
type Auth = {
  client: SupabaseClient | null;
  user: User | null;
  ready: boolean;
  error: string;
  storageKey: string;
  recovery: boolean;
  clearRecovery: () => void;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(!configured),
    [error, setError] = useState(configurationError),
    [recovery, setRecovery] = useState(false);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  useEffect(() => {
    if (!configured) return;
    let live = true;
    let unsubscribe = () => {};
    getClient()
      .then(async (supabase) => {
        if (!live || !supabase) return;
        setClient(supabase);
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!live) return;
          setUser(session?.user ?? null);
          setReady(true);
          if (event === "PASSWORD_RECOVERY") setRecovery(true);
        });
        unsubscribe = () => subscription.unsubscribe();
        const { data, error } = await supabase.auth.getSession();
        if (!live) return;
        if (error)
          setError(
            "Your account session could not be restored. Sign in again; local records are preserved.",
          );
        setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (live) {
          setReady(true);
          setError(
            "Account connection unavailable. Local records are preserved.",
          );
        }
      });
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);
  return (
    <Context.Provider
      value={{
        client,
        user,
        ready,
        error,
        storageKey:
          user && projectUrl ? accountStorageKey(projectUrl, user.id) : KEY,
        recovery,
        clearRecovery: () => setRecovery(false),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const context = useContext(Context);
  if (!context) throw Error("Missing account provider");
  return context;
}
