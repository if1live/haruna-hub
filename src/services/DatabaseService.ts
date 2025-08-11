import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
  WithSchemaPlugin,
} from "kysely";
import { TablePrefixPlugin } from "kysely-plugin-prefix";
import { Pool } from "pg";
import type { DB } from "../tables";
import type { MyBindings } from "../types";

export const connect = (env: MyBindings): Kysely<DB> => {
  // TODO: 더 멀쩡한 방법을 알고싶은데
  const url = env.DATABASE_URL;

  const plugins = [
    new ParseJSONResultsPlugin(),
    new CamelCasePlugin(),
    new TablePrefixPlugin({ prefix: "haruna" }),
    new WithSchemaPlugin("infra"),
  ];

  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: url,
      max: 1,
    }),
  });
  const db = new Kysely<DB>({
    dialect,
    plugins,
  });
  return db;
};

export const withDatabase = <T>(fn: (db: Kysely<DB>) => Promise<T>) => {
  return async (env: MyBindings) => {
    const db = connect(env);
    try {
      return await fn(db);
    } finally {
      await db.destroy();
    }
  };
};
