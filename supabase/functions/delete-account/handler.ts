import { createClient } from "@supabase/supabase-js";
export type DeleteConfig = { url: string; serviceKey: string; origin: string };
export async function deleteAccount(
  request: Request,
  config: DeleteConfig,
): Promise<Response> {
  const origin = request.headers.get("origin");
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": config.origin,
    "Access-Control-Allow-Headers":
      "authorization,apikey,x-client-info,content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };
  const reply = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  if (origin && origin !== config.origin)
    return reply({ error: "Origin not allowed" }, 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "Use POST" }, 405);
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return reply({ error: "Authentication required" }, 401);
  const admin = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user)
    return reply({ error: "Authentication required" }, 401);
  let confirmation;
  try {
    confirmation = (await request.json()).confirmation;
  } catch {
    return reply({ error: "Invalid request" }, 400);
  }
  if (confirmation !== "DELETE")
    return reply({ error: "Explicit DELETE confirmation required" }, 400);
  const userId = data.user.id;
  try {
    for (const bucket of ["avatars", "progress-photos"]) {
      const removeFolder = async (prefix: string): Promise<void> => {
        for (;;) {
          const { data, error } = await admin.storage
            .from(bucket)
            .list(prefix, { limit: 100, offset: 0 });
          if (error) throw error;
          if (!data.length) break;
          const files: string[] = [];
          for (const entry of data) {
            const path = `${prefix}/${entry.name}`;
            if (entry.id) files.push(path);
            else await removeFolder(path);
          }
          if (files.length) {
            const { error } = await admin.storage.from(bucket).remove(files);
            if (error) throw error;
          } else break;
        }
      };
      await removeFolder(userId);
    }
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return reply({ deleted: true });
  } catch {
    return reply(
      {
        error:
          "Account deletion could not finish. Retry before clearing device records.",
      },
      500,
    );
  }
}
