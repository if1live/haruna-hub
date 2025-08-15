import type { Kysely } from "kysely";
import type { DB } from "../tables";
import * as FunctionDefinitionService from "./FunctionDefinitionService";
import * as FunctionUrlService from "./FunctionUrlService";

export const load = async (db: Kysely<DB>) => {
  const list_definition = await FunctionDefinitionService.findAll(db);
  const list_url = await FunctionUrlService.findAll(db);

  const map_url = new Map<string, (typeof list_url)[number]>();
  for (const x of list_url) {
    map_url.set(x.functionArn, x);
  }

  const entries = list_definition.map((definition) => {
    const url = map_url.get(definition.functionArn);
    return { definition, url };
  });

  return entries;
};

export const find = async (db: Kysely<DB>, arn: string) => {
  const definition = await FunctionDefinitionService.findByFunctionArnOrThrow(
    db,
    arn,
  );
  const url = await FunctionUrlService.findByFunctionArn(db, arn);
  return { definition, url };
};
