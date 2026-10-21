import { readFileSync } from "node:fs";
export const localEnv = () =>
  Object.fromEntries(
    readFileSync("supabase/.local.env", "utf8")
      .trim()
      .split("\n")
      .map((line) => {
        const at = line.indexOf("=");
        return [line.slice(0, at), line.slice(at + 1)];
      }),
  );
