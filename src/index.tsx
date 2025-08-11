import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { prettyJSON } from "hono/pretty-json";
import z from "zod";
import { LookupAdmin } from "./controllers";
import {
  AwsService,
  FunctionDefinitionService,
  FunctionUrlService,
} from "./services";
import type { MyBindings } from "./types";

const _prefix_api = "/api" as const;
const _prefix_site = "/s" as const;
const prefix_admin = "/admin" as const;

const app = new Hono<{ Bindings: MyBindings }>();
app.use("*", prettyJSON());

/*
app.use("/admin/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_ID,
    password: c.env.ADMIN_PW,
  });
  return auth(c, next);
});
*/

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
    const list = await FunctionDefinitionService.retrieve(client);
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
    const list = await FunctionUrlService.retrieve(
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

app.route(`${prefix_admin}${LookupAdmin.resource}`, LookupAdmin.app);

export default app;
