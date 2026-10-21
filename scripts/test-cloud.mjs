import { spawnSync } from "node:child_process";
import { localEnv } from "./local-env.mjs";
const local = localEnv(),
  env = {
    ...process.env,
    VITE_SUPABASE_URL: "http://127.0.0.1:54321",
    VITE_SUPABASE_PUBLISHABLE_KEY: local.LOCAL_ANON_KEY,
    VITE_BASE_PATH: "/lex-active/",
    TEST_PRODUCTION: "1",
    TEST_PORT: "5177",
    TEST_CLOUD: "1",
  };
for (const args of [
  ...(process.argv.includes("--no-build")?[]:[["run", "build"]]),
  ["exec", "--", "playwright", "test", "tests/cloud.spec.ts"],
]) {
  const result = spawnSync("npm", args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
