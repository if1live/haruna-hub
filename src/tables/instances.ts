import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
  WithSchemaPlugin,
} from "kysely";
import { TablePrefixPlugin } from "kysely-plugin-prefix";
import { DialectFactory } from "../connectors";
import type { DB } from "./types";

export const createKysely = (url: string): Kysely<DB> => {
  const dialect = DialectFactory.create(url);

  const plugins_common = [
    new ParseJSONResultsPlugin(),
    new CamelCasePlugin(),
    new TablePrefixPlugin({ prefix: "haruna" }),
  ];
  const plugins =
    dialect instanceof PostgresDialect
      ? [...plugins_common, new WithSchemaPlugin("infra")]
      : plugins_common;

  const db = new Kysely<DB>({
    dialect,
    plugins,
  });
  return db;
};
