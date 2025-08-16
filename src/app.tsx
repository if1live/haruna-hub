import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { Kysely } from "kysely";
import * as R from "remeda";
import { isWorkerd } from "std-env";
import z from "zod";
import { AuthController, LambdaAdmin } from "./controllers";
import { getLambdaClient } from "./instances";
import { AdminIndex } from "./layouts/adminIndex";
import { Top } from "./layouts/simple";
import {
  AuthService,
  FunctionDefinitionService,
  FunctionUrlService,
  LookupService,
} from "./services";
import { withDatabase } from "./services/ConnectorService";
import type { DB } from "./tables";
import type { MyBindings } from "./types";

// 로컬 환경에서는 .dev.vars를 환경변수로 적당히 대응하기
let localEnv: Map<string, string> | null = null;
if (!isWorkerd) {
  const fs = await import("node:fs/promises");
  const text = await fs.readFile(".dev.vars", "utf-8");
  const entries = text
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((x) => {
      const [key, value] = x.split("=");
      return [key, value] as const;
    });
  localEnv = new Map(entries);
}

export const app = new Hono<{ Bindings: MyBindings }>();

const robotsTxt = `
User-agent: *
Disallow: /
`.trimStart();

const _prefix_api = "/api" as const;
const _prefix_site = "/s" as const;
const prefix_admin = "/admin" as const;

app.use("*", prettyJSON());

const loggerMiddlewareObj = logger();
app.use(async (c, next) => (isWorkerd ? next() : loggerMiddlewareObj(c, next)));

app.use("*", async (c, next) => {
  if (!localEnv) {
    return next();
  }

  for (const [key, value] of localEnv.entries()) {
    // biome-ignore lint/suspicious/noExplicitAny: TODO
    (c.env as any)[key] = value;
  }

  // node.js로 돌릴떄는 적당히 db 가라치기
  // TODO: .dev.vars에 있는 DATABASE_URL 쓰는게 나을지도?
  c.env.HYPERDRIVE = {
    connectionString: "sqlite:sqlite.db",
  };

  return next();
});

app.use("/admin/*", async (c, next) => {
  const user = AuthService.getUserFromContext(c);
  if (!user) {
    return c.text("Unauthorized", 401);
  }

  if (user.email !== "libsora25@gmail.com") {
    return c.text("Forbidden", 403);
  }

  return next();
});

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
    const client = getLambdaClient(validated.region, c.env);
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
    const client = getLambdaClient(validated.region, c.env);
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
  const user = AuthService.getUserFromContext(c);

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

    const privList = user ? list : [];

    return c.html(
      <Top pubFunctions={[]} privFunctions={privList} user={user} />,
    );
  };

  return withDatabase(execute)(c.env);
});

app.route(AuthController.resource, AuthController.app);

// 운영 최상위
const adminIndex = `${prefix_admin}/` as const;
app.get(`${prefix_admin}`, async (c) => c.redirect(adminIndex));
app.get(`${prefix_admin}/`, async (c) => c.html(<AdminIndex />));
app.route(`${prefix_admin}${LambdaAdmin.resource}`, LambdaAdmin.app);
