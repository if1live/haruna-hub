import { serve } from "@hono/node-server";
import { app } from "./app";

// cloudflare worker 개발환경과 맞춤
const port = 8787;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://127.0.0.1:${info.port}`);
});
