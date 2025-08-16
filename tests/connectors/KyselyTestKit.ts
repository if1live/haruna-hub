import { type Kysely, SqliteAdapter, sql } from "kysely";
import type { DataSource } from "typeorm";
import type { BaseDataSourceOptions } from "typeorm/data-source/BaseDataSourceOptions.js";

type EntityList = Exclude<BaseDataSourceOptions["entities"], undefined>;

type EngineType = "sqlite";

const createDataSource = async (
  type: EngineType,
  entities: EntityList,
): Promise<DataSource> => {
  const { DataSource } = await import("typeorm");
  const { SnakeNamingStrategy } = await import("typeorm-naming-strategies");
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

const getAdapter = <T>(db: Kysely<T>): EngineType => {
  const adapter = db.getExecutor().adapter;
  if (adapter instanceof SqliteAdapter) {
    return "sqlite";
  }
  // else...
  throw new Error("not supported adapter", {
    cause: { type: adapter.constructor.name },
  });
};

const initialize = async <T>(db: Kysely<T>, entities: EntityList) => {
  const type = getAdapter(db);
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
  }
};

export const KyselyTestKit = {
  initialize,
};
