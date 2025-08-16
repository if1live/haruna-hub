import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from "kysely";
import { TablePrefixPlugin } from "kysely-plugin-prefix";
import { entities } from "../../entities";
import { DialectFactory, KyselyTestKit } from "../../src/connectors";
import type { DB } from "../../src/tables";

const synchronize = async <T = DB>(db: Kysely<T>) => {
  await KyselyTestKit.initialize(db, entities);
};

const create = <T = DB>() => {
  const dialect = DialectFactory.inMemory();
  const plugins = [
    new ParseJSONResultsPlugin(),
    new CamelCasePlugin(),
    new TablePrefixPlugin({ prefix: "haruna" }),
  ];
  const db = new Kysely<T>({
    dialect,
    plugins,
    // log: ["query", "error"],
  });
  return db;
};

export const TestKysely = {
  create,
  synchronize,
};
