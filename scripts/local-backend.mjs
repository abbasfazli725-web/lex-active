import { randomBytes, createHmac } from "node:crypto";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const envFile = "supabase/.local.env";
if (!existsSync(envFile)) {
  const secret = randomBytes(32).toString("hex"),
    password = randomBytes(24).toString("hex");
  const jwt = (role) => {
    const data = [
      { alg: "HS256", typ: "JWT" },
      {
        role,
        iss: "supabase-local",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 315360000,
      },
    ]
      .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
      .join(".");
    return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
  };
  writeFileSync(
    envFile,
    `LOCAL_DB_PASSWORD=${password}\nLOCAL_JWT_SECRET=${secret}\nLOCAL_ANON_KEY=${jwt("anon")}\nLOCAL_SERVICE_ROLE_KEY=${jwt("service_role")}\n`,
    { mode: 0o600 },
  );
}
const args = [
  "compose",
  "--env-file",
  envFile,
  "-f",
  "supabase/local/compose.yml",
];
const run = (more, input) => {
  const r = spawnSync("docker", [...args, ...more], {
    input,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.status !== 0)
    throw Error(
      (r.stderr || "Local stack command failed.").replace(
        /(password|secret|key)=[^\s]+/gi,
        "$1=[redacted]",
      ),
    );
  return r.stdout;
};
run(["up", "-d", "--wait", "db", "mailpit"]);
run(
  [
    "exec",
    "-T",
    "db",
    "sh",
    "-c",
    'psql -U postgres -v lex_password="$POSTGRES_PASSWORD"',
  ],
  readFileSync("supabase/local/bootstrap.sql"),
);
run(["up", "-d", "auth", "rest", "storage", "gateway"]);
async function wait(path) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:54321${path}`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw Error(`Local service did not become ready: ${path}`);
}
await wait("/auth/v1/health");
await wait("/storage/v1/status");
run(
  [
    "exec",
    "-T",
    "db",
    "sh",
    "-c",
    'psql -U postgres -v lex_password="$POSTGRES_PASSWORD"',
  ],
  readFileSync("supabase/local/bootstrap.sql"),
);
console.log(
  "Local PostgreSQL, Supabase Auth, PostgREST, Storage and mail inbox are running. No credential values were printed.",
);
