import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin, sql } from "kysely";
import { TablePrefixPlugin } from "kysely-plugin-prefix";
import type { DataSource } from "typeorm";
import type { BaseDataSourceOptions } from "typeorm/data-source/BaseDataSourceOptions.js";
import { entities } from "../../entities";
import { DialectFactory } from "../../src/connectors";
import type { DB } from "../../src/tables";

type EntityList = Exclude<BaseDataSourceOptions["entities"], undefined>;

const createDataSource = async (
  type: "sqlite",
  entities: EntityList,
): Promise<DataSource> => {
  const { DataSource } = await import("typeorm");
  const { SnakeNamingStrategy } = require("typeorm-naming-strategies");
  const namingStrategy = new SnakeNamingStrategy();
  const skel = {
    // biome-ignore lint/suspicious/noExplicitAny: TODO
    entities: entities as any,
    namingStrategy,
  } as const;

  switch (type) {
    case "sqlite":
      return new DataSource({
        type: "better-sqlite3",
        database: ":memory:",
        ...skel,
      });
    default:
      throw new Error("do not reach");
  }
};

export const initialize = async <T>(
  db: Kysely<T>,
  type: "sqlite",
  entities: EntityList,
) => {
  const dataSource = await createDataSource(type, entities);
  await dataSource.initialize();

  const builder = dataSource.driver.createSchemaBuilder();
  const sqlInMemory = await builder.log();
  const queries = sqlInMemory.upQueries.map((x) => x.query);

  await dataSource.destroy();

  for (const line of queries) {
    const input = line as unknown as TemplateStringsArray;
    const compiled = sql<unknown>(input).compile(db);
    await db.executeQuery(compiled);
    console.log(line);
  }
};

const synchronize = async <T = DB>(db: Kysely<T>) => {
  await initialize(db, "sqlite", entities);
};

const create = <T = DB>() => {
  const dialect = DialectFactory.create(":memory:");
  const plugins = [
    new ParseJSONResultsPlugin(),
    new CamelCasePlugin(),
    new TablePrefixPlugin({ prefix: "haruna" }),
  ];
  const db = new Kysely<T>({
    dialect,
    plugins,
    log: ["query", "error"],
  });
  return db;
};

export const KyselyTestKit = {
  create,
  synchronize,
};
