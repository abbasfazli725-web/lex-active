import { loadEnv } from "vite";
const env = loadEnv("production", process.cwd(), "VITE_");
const url = process.env.VITE_SUPABASE_URL ?? env.VITE_SUPABASE_URL,
  key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url && !key) {
  console.log(
    "Device-only build: Supabase public environment variables are not configured.",
  );
  process.exit(0);
}
if (!url || !key)
  throw Error(
    "Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before building cloud accounts.",
  );
const parsed = new URL(url);
if (
  parsed.protocol !== "https:" &&
  !(
    ["localhost", "127.0.0.1"].includes(parsed.hostname) &&
    parsed.protocol === "http:"
  )
)
  throw Error("Supabase must use HTTPS outside local development.");
if (key.startsWith("sb_secret_"))
  throw Error(
    "A server secret was supplied to a public frontend variable. Remove it and use the publishable key.",
  );
if (!key.startsWith("sb_publishable_")) {
  let role;
  try {
    role = JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role;
  } catch {}
  if (role !== "anon")
    throw Error(
      "Only a public publishable key or legacy anon key is allowed in the frontend.",
    );
}
console.log(
  "Public Supabase build configuration validated. Credential values are not logged.",
);
