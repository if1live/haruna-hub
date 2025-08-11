import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { prettyJSON } from "hono/pretty-json";
import z from "zod";
import { fixture } from "./fixture";
import { Top } from "./layouts";
import { AwsService } from "./services";
import type { MyBindings } from "./types";
import { Pool } from "pg";

const app = new Hono<{ Bindings: MyBindings }>();
app.use("*", prettyJSON());

app.use("/admin/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_ID,
    password: c.env.ADMIN_PW,
  });
  return auth(c, next);
});

app.get(
  "/aws/functions/immediate",
  zValidator(
    "query",
    z.object({
      region: z.string(),
    }),
  ),
  async (c) => {
    const validated = c.req.valid("query");
    const client = AwsService.createLambdaClient(validated.region, c.env);
    const list = await AwsService.loadListFunctions(client);
    return c.json(list);
  },
);

app.get(
  "/aws/urls/immediate",
  zValidator(
    "query",
    z.object({
      region: z.string(),
      functionName: z.string(),
    }),
  ),
  async (c) => {
    const validated = c.req.valid("query");
    const client = AwsService.createLambdaClient(validated.region, c.env);
    const list = await AwsService.loadFunctionUrlConfig(
      client,
      validated.functionName,
    );
    return c.json(list);
  },
);

app.get("/supabase", async (c) => {
  const env = c.env;
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  const { data, error } = await supabase.from("countries").select("*");
  if (error) throw error;
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});

/*
app.get("/", (c) => {
  // TODO: 대충 가공. 하드코딩 아닌거로 갈아타기
  const list = fixture.urls_apne2.map((item) => {
    return {
      arn: item.FunctionArn ?? "",
      url: item.FunctionUrl ?? "",
    };
  });
  return c.html(<Top functions={list} />);
});
*/

app.get("/admin/", async (c) => {
  return c.html("TODO: admin");
});

app.get("/showcases/pg", async (c) => {
  // TODO: 더 멀쩡한 방법을 알고싶은데
  const url = c.env.DATABASE_URL;
  const db = new Pool({
    connectionString: url,
    // Cloudflare Workers에선 커넥션 너무 많이 열지 말 것
    // (과도하면 드문 데드락/타임아웃 이슈 가능)
    max: 1,
    idleTimeoutMillis: 30_000,
  });
  const { rows } = await db.query<{ now: string }>("select now()");
  await db.end();

  return Response.json({ time: rows[0].now });
});

export default app;
