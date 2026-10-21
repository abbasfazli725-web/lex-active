import type { SupabaseClient } from "@supabase/supabase-js";
import { KEY } from "../model";
export function publicConfiguration(
  url: string,
  key: string,
): { url: string; key: string } | null {
  if (!url && !key) return null;
  if (!url || !key)
    throw Error(
      "Cloud configuration is incomplete. The deployment needs both public Supabase environment variables.",
    );
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" &&
    !(
      ["127.0.0.1", "localhost"].includes(parsed.hostname) &&
      parsed.protocol === "http:"
    )
  )
    throw Error("The Supabase connection must use HTTPS.");
  if (key.startsWith("sb_secret_"))
    throw Error(
      "A secret key cannot be used in the frontend. Use the publishable key.",
    );
  if (!key.startsWith("sb_publishable_")) {
    try {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.role !== "anon") throw Error();
    } catch {
      throw Error(
        "Use a public publishable key or legacy anon key, never a service-role key.",
      );
    }
  }
  return { url: parsed.origin, key };
}
export const callbackUrl = () =>
  new URL(import.meta.env.BASE_URL, window.location.origin).href;
export const accountStorageKey = (url: string, userId: string) =>
  `${KEY}:account:${new URL(url).hostname}:${userId}`;
let configuration: ReturnType<typeof publicConfiguration> = null;
export let configurationError = "";
try {
  configuration = publicConfiguration(
    import.meta.env.VITE_SUPABASE_URL || "",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
  );
} catch (e) {
  configurationError =
    e instanceof Error ? e.message : "Invalid cloud configuration.";
}
export const projectUrl = configuration?.url;
export const configured = Boolean(configuration);
let clientPromise: Promise<SupabaseClient> | null = null;
export async function getClient(): Promise<SupabaseClient | null> {
  if (!configuration) return null;
  if (!clientPromise) {
    const current = configuration;
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(current.url, current.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      }),
    );
  }
  return clientPromise;
}
