import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import type { Kysely } from "kysely";
import * as R from "remeda";
import z from "zod";
import { LambdaAdmin } from "./controllers";
import { createLambdaClient } from "./instances";
import { AdminIndex } from "./layouts/adminIndex";
import { Top } from "./layouts/simple";
import {
  FunctionDefinitionService,
  FunctionUrlService,
  LookupService,
} from "./services";
import { withDatabase } from "./services/DatabaseService";
import type { DB } from "./tables";
import type { MyBindings } from "./types";

export const app = new Hono<{ Bindings: MyBindings }>();

const robotsTxt = `
User-agent: *
Disallow: /
`.trimStart();

const _prefix_api = "/api" as const;
const _prefix_site = "/s" as const;
const prefix_admin = "/admin" as const;

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

app.get("/robots.txt", async (c) => {
  return c.text(robotsTxt);
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
    const client = createLambdaClient(validated.region, c.env);
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
    const client = createLambdaClient(validated.region, c.env);
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

app.get("/", async (c) => {
  const execute = async (db: Kysely<DB>) => {
    const founds = await LookupService.load(db);
    const list = founds
      .map((x) => {
        const url = x.url?.functionUrl;
        if (!url) {
          return null;
        }
        return {
          arn: x.definition.functionArn,
          url,
        };
      })
      .filter(R.isNonNullish);
    return c.html(<Top functions={list} />);
  };

  return withDatabase(execute)(c.env);
});

// 운영 최상위
const adminIndex = `${prefix_admin}/` as const;

app.get(`${prefix_admin}`, async (c) => c.redirect(adminIndex));
app.get(`${prefix_admin}/`, async (c) => c.html(<AdminIndex />));
app.route(`${prefix_admin}${LambdaAdmin.resource}`, LambdaAdmin.app);
