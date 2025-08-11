import type { Kysely } from "kysely";
import { type DB, FunctionDefinitionTable, FunctionUrlTable } from "../tables";

export const load = async (db: Kysely<DB>) => {
  const list_definition = await db
    .selectFrom(FunctionDefinitionTable.name)
    .selectAll()
    .execute();

  const list_url = await db
    .selectFrom(FunctionUrlTable.name)
    .selectAll()
    .execute();

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
