import { createServer } from "node:http";
import { privateMedia } from "../supabase/functions/private-media/handler.ts";
import { deleteAccount } from "../supabase/functions/delete-account/handler.ts";
import { localEnv } from "./local-env.mjs";
const env = localEnv();
createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    const request = new Request(`http://127.0.0.1:54325${req.url}`, {
      method: req.method,
      headers: req.headers,
      ...(body.length ? { body } : {}),
      duplex: "half",
    });
    const result = await (
      req.url?.split("?")[0] === "/functions/v1/private-media"
        ? privateMedia
        : deleteAccount
    )(request, {
      url: "http://127.0.0.1:54321",
      serviceKey: env.LOCAL_SERVICE_ROLE_KEY,
      origin: "http://127.0.0.1:5177",
    });
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end("Local function error");
  }
}).listen(54325, "0.0.0.0", () =>
  console.log(
    "Local account-deletion and private-media handlers listening; no secrets logged.",
  ),
);
