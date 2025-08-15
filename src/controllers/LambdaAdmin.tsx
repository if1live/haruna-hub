import { parse } from "@aws-sdk/util-arn-parser";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Kysely } from "kysely";
import { z } from "zod";
import {
  AdminLambdaDetailsPage,
  AdminLambdaListPage,
} from "../layouts/adminLambda";
import {
  AwsService,
  DatabaseService,
  FunctionDefinitionService,
  FunctionUrlService,
  LookupService,
} from "../services";
import type { DB } from "../tables";
import type { MyBindings } from "../types";

export const resource = "/lambda" as const;
export const app = new Hono<{ Bindings: MyBindings }>();

const indexLocation = `/admin${resource}`;

const _functionNameValidator = zValidator(
  "query",
  z.object({
    functionName: z.string(),
  }),
);

const functionArnValidator = zValidator(
  "query",
  z.object({
    functionArn: z.string(),
  }),
);

const regionValidator = zValidator(
  "query",
  z.object({
    region: z.string(),
  }),
);

app.get("/", async (c) => {
  const execute = async (db: Kysely<DB>) => {
    const list_naive = await LookupService.load(db);
    const list = list_naive
      .map((entry) => {
        return {
          definition: entry.definition,
          url: entry.url ?? null,
        };
      })
      .sort((a, b) => {
        const x = a.definition.lastModified;
        const y = b.definition.lastModified;
        return y.getTime() - x.getTime();
      });
    return c.html(<AdminLambdaListPage list={list} />);
  };
  return DatabaseService.withDatabase(execute)(c.env);
});

app.get("/:arn/", async (c) => {
  const arn = c.req.param("arn");

  const execute = async (db: Kysely<DB>) => {
    const entry = await LookupService.find(db, arn);
    return c.html(
      <AdminLambdaDetailsPage
        definition={entry.definition}
        url={entry.url ?? null}
      />,
    );
  };
  return DatabaseService.withDatabase(execute)(c.env);
});

// TODO: 전체 갱신은 무식하지만 확실한 방법
app.post("/truncate", async (c) => {
  const execute = async (db: Kysely<DB>) => {
    await FunctionDefinitionService.reset(db);
    await FunctionUrlService.reset(db);
    return c.redirect(indexLocation);
  };
  return DatabaseService.withDatabase(execute)(c.env);
});

app.post("/reset", functionArnValidator, async (c) => {
  const validated = c.req.valid("query");
  const { functionArn } = validated;

  const execute = async (db: Kysely<DB>) => {
    await FunctionUrlService.deleteByFunctionArn(db, functionArn);
    return c.redirect(indexLocation);
  };
  return DatabaseService.withDatabase(execute)(c.env);
});

app.post("/synchronize/list", regionValidator, async (c) => {
  const validated = c.req.valid("query");
  const { region } = validated;

  const execute = async (db: Kysely<DB>) => {
    const client = AwsService.createLambdaClient(region, c.env);
    const founds = await FunctionDefinitionService.retrieve(client);
    const _results = await FunctionDefinitionService.synchronize(
      db,
      region,
      founds,
    );
    return c.redirect(indexLocation);
  };
  return DatabaseService.withDatabase(execute)(c.env);
});

app.post("/synchronize/url", functionArnValidator, async (c) => {
  const validated = c.req.valid("query");
  const { functionArn } = validated;
  const parsed = parse(functionArn);
  const region = parsed.region;
  const functionName = parsed.resource.split(":")[1];

  const execute = async (db: Kysely<DB>) => {
    const client = AwsService.createLambdaClient(region, c.env);
    const founds = await FunctionUrlService.retrieve(client, functionName);
    const first = founds[0];
    const _result = first
      ? await FunctionUrlService.synchronize(db, first)
      : null;
    return c.redirect(indexLocation);
  };
  return DatabaseService.withDatabase(execute)(c.env);
});
