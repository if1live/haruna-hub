import { parse } from "@aws-sdk/util-arn-parser";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { AdminIndex } from "../layouts/admin";
import { FunctionDefinitionModel, FunctionUrlModel } from "../models";
import {
  AwsService,
  DatabaseService,
  FunctionDefinitionService,
  FunctionUrlService,
  LookupService,
} from "../services";
import type { MyBindings } from "../types";

export const resource = "/lookup" as const;
export const app = new Hono<{ Bindings: MyBindings }>();

const indexLocation = `/admin${resource}`;

const functionNameValidator = zValidator(
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
  const db = DatabaseService.connect(c.env);
  const list_naive = await LookupService.load(db);
  const list = list_naive.map((entry) => {
    const definition = entry.definition
      ? FunctionDefinitionModel.create(entry.definition)
      : null;

    const url = entry.url ? FunctionUrlModel.create(entry.url) : null;

    return {
      definition,
      url,
    };
  });

  await db.destroy();
  return c.html(<AdminIndex list={list} />);
});

// TODO: 전체 갱신은 무식하지만 확실한 방법
app.post("/truncate", async (c) => {
  const db = DatabaseService.connect(c.env);
  await FunctionDefinitionService.reset(db);
  await FunctionUrlService.reset(db);
  await db.destroy();
  return c.redirect(indexLocation);
});

app.post("/reset", functionArnValidator, async (c) => {
  const validated = c.req.valid("query");
  const { functionArn } = validated;

  const db = DatabaseService.connect(c.env);

  await FunctionUrlService.deleteByFunctionArn(db, functionArn);
  await db.destroy();
  return c.redirect(indexLocation);
});

app.post("/synchronize/list", regionValidator, async (c) => {
  const validated = c.req.valid("query");
  const { region } = validated;

  const client = AwsService.createLambdaClient(region, c.env);
  const db = DatabaseService.connect(c.env);

  const founds = await FunctionDefinitionService.retrieve(client);
  const _results = await FunctionDefinitionService.synchronize(db, founds);
  await db.destroy();

  return c.redirect(indexLocation);
});

app.post("/synchronize/url", functionArnValidator, async (c) => {
  const validated = c.req.valid("query");
  const { functionArn } = validated;
  const parsed = parse(functionArn);
  const region = parsed.region;
  const functionName = parsed.resource.split(":")[1];

  const client = AwsService.createLambdaClient(region, c.env);
  const db = DatabaseService.connect(c.env);

  const founds = await FunctionUrlService.retrieve(client, functionName);
  const first = founds[0];
  const _result = first
    ? await FunctionUrlService.synchronize(db, first)
    : null;

  await db.destroy();

  return c.redirect(indexLocation);
});

// 디버깅 목적으로 상세 정보 뜯을 방법 열어두기
app.get("/inspect", functionNameValidator, async (c) => {
  const validated = c.req.valid("query");
  const { functionName } = validated;

  const db = DatabaseService.connect(c.env);

  const definition = await FunctionDefinitionService.findByFunctionName(
    db,
    functionName,
  );
  const arn = definition?.functionArn;

  const url = arn ? await FunctionUrlService.findByFunctionArn(db, arn) : null;

  const payload = {
    definition: definition ?? null,
    url: url ?? null,
  };
  await db.destroy();

  // biome-ignore lint/suspicious/noExplicitAny: TODO
  return c.json(payload as any);
});
