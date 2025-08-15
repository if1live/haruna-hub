import { parse } from "@aws-sdk/util-arn-parser";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Kysely } from "kysely";
import { z } from "zod";
import {
  AwsService,
  DatabaseService,
  FunctionDefinitionService,
  FunctionUrlService,
} from "../services";
import type { DB } from "../tables";
import type { MyBindings } from "../types";

export const resource = "/lookup" as const;
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
