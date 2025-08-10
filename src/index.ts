import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { prettyJSON } from "hono/pretty-json";
import z from "zod";
import { AwsService } from "./services";
import type { MyBindings } from "./types";

const app = new Hono<{ Bindings: MyBindings }>();
app.use("*", prettyJSON());

app.use("/auth/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_ID,
    password: c.env.ADMIN_PW,
  });
  return auth(c, next);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
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

export default app;
