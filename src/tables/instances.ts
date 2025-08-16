import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
  type RawBuilder,
  sql,
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

// https://kysely.dev/docs/recipes/extending-kysely
export const toSqlJson = <T>(obj: T): RawBuilder<T> =>
  sql`${JSON.stringify(obj)}`;

/**
 * kysely-typeorm + json field 사용할때 쓰는거
 * insert하려면 field은 RawBuilder<T> 객체로 넣어야하는데
 * RowBuilder<T>로 넣으면 kysely-typeorm으로 유도된 타입과 다르다고 컴파일이 안된다.
 * 컴파일 통과시키려고 강제로 끼워맞춤
 */
export const convertSqlJson = <T>(obj: T): T => {
  const builder = sql`${JSON.stringify(obj)}`;
  return builder as unknown as T;
};
