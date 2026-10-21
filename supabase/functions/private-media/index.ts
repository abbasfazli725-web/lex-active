import { privateMedia } from "./handler.ts";
Deno.serve((request) =>
  privateMedia(request, {
    url: Deno.env.get("SUPABASE_URL")!,
    serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    origin: Deno.env.get("APP_ORIGIN") ?? "https://abbasfazli725-web.github.io",
  }),
);
