import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { localEnv } from "./local-env.mjs";
const env = localEnv(),
  db = new pg.Client({
    host: "127.0.0.1",
    port: 54322,
    user: "postgres",
    password: env.LOCAL_DB_PASSWORD,
    database: "postgres",
  });
await db.connect();
try {
  await db.query(
    "create schema if not exists private;create table if not exists private.local_migration_history(name text primary key,sha256 text not null,applied_at timestamptz not null default now())",
  );
  for (const name of readdirSync("supabase/migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const sql = readFileSync(`supabase/migrations/${name}`, "utf8"),
      hash = createHash("sha256").update(sql).digest("hex");
    const { rows } = await db.query(
      "select sha256 from private.local_migration_history where name=$1",
      [name],
    );
    if (rows.length) {
      if (rows[0].sha256 !== hash)
        throw Error(
          `Applied migration changed: ${name}. Create a new migration instead.`,
        );
      continue;
    }
    try {
      await db.query("begin");
      await db.query(
        sql.replace(/^begin;\s*$/gim, "").replace(/^commit;\s*$/gim, ""),
      );
      await db.query(
        "insert into private.local_migration_history(name,sha256)values($1,$2)",
        [name, hash],
      );
      await db.query("commit");
      console.log(`Applied ${name}`);
    } catch (e) {
      await db.query("rollback");
      throw e;
    }
  }
  await db.query("notify pgrst,'reload schema'");
} finally {
  await db.end();
}
