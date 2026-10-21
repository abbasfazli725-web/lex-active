import { createClient } from "@supabase/supabase-js";
export async function privateMedia(
  request: Request,
  config: { url: string; serviceKey: string; origin: string },
): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": config.origin,
    "Access-Control-Allow-Headers":
      "authorization,apikey,x-client-info,content-type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Cache-Control": "no-store",
  };
  const error = (message: string, status: number) =>
    new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  const origin = request.headers.get("origin");
  if (origin && origin !== config.origin)
    return error("Origin not allowed", 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return error("Use POST", 405);
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return error("Authentication required", 401);
  const admin = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error: authError } = await admin.auth.getUser(token);
  if (authError || !data.user) return error("Authentication required", 401);
  let path: unknown;
  try {
    path = (await request.json()).path;
  } catch {
    return error("Invalid request", 400);
  }
  if (
    typeof path !== "string" ||
    !/^[a-f0-9-]{36}\/[a-zA-Z0-9._-]+$/.test(path)
  )
    return error("Invalid media path", 400);
  const caller = createClient(config.url, config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const permission = await caller.rpc("can_read_private_photo", {
    p_path: path,
  });
  if (permission.error || permission.data !== true)
    return error("Photo unavailable", 403);
  const file = await admin.storage.from("progress-photos").download(path);
  if (file.error) return error("Photo unavailable", 404);
  return new Response(file.data, {
    headers: {
      ...headers,
      "Content-Type": "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
