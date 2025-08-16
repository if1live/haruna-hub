import type SQLitePkg from "better-sqlite3";
import { PostgresDialect, SqliteDialect } from "kysely";
import type PostgresPkg from "pg";

// kysely는 db를 생성하는 함수를 dialect 생성 시점에 넣을 수 있다.
// database engine import를 await import로 사용하는거때문에
// db생성 코드가 전부 async/await 로 바뀌는거 피하고 싶어서 이렇게 구현
type CreateEngineFn<T> = () => Promise<T>;

type SQLiteParamters = [filename: string, options?: SQLitePkg.Options];
const createEngine_sqlite = (
  ...args: SQLiteParamters
): CreateEngineFn<SQLitePkg.Database> => {
  const [filename, options] = args;
  return async () => {
    const { default: SQLite } = await import("better-sqlite3");
    return new SQLite(filename, options);
  };
};

type PostgresParameters = Required<
  ConstructorParameters<typeof PostgresPkg.Pool>
>;
const createEngine_postgres = (
  ...args: PostgresParameters
): CreateEngineFn<PostgresPkg.Pool> => {
  const [opts] = args;
  return async () => {
    const { Pool } = await import("pg");
    return new Pool(opts);
  };
};

type Args_Generic<Tag, Input> = { _tag: Tag; input: Input };
type Args_Sqlite = Args_Generic<"sqlite", SQLiteParamters>;
type Args_Postgres = Args_Generic<"postgres", PostgresParameters>;
type Args = Args_Sqlite | Args_Postgres;

const create_sqlite = (filename: string, options?: SQLitePkg.Options) => {
  const fn = createEngine_sqlite(filename, options);
  const dialect = new SqliteDialect({ database: fn });
  return dialect;
};

const create_postgres = (options: PostgresPkg.PoolConfig) => {
  const fn = createEngine_postgres(options);
  const dialect = new PostgresDialect({ pool: fn });
  return dialect;
};

const parse_sqlite = (url: URL): Args_Sqlite => {
  const pathname = url.pathname.startsWith("/")
    ? url.pathname.slice(1, url.pathname.length)
    : url.pathname;

  return {
    _tag: "sqlite",
    input: [pathname],
  };
};

const parse_postgres = (url: URL): Args_Postgres => {
  // 서버리스 환경에서는 커넥션 숫자가 제한된다.
  // awa lambda, cloudflare worker, ...
  const connectionLimit = 1;
  const opts: PostgresParameters[0] = {
    connectionString: url.toString(),
    max: connectionLimit,
  };

  return {
    _tag: "postgres",
    input: [opts],
  };
};

export const parse = (input: string): Args => {
  if (input === ":memory:") {
    return {
      _tag: "sqlite",
      input: [":memory:"],
    };
  }

  try {
    const url = new URL(input);
    switch (url.protocol) {
      case "sqlite:":
        return parse_sqlite(url);
      case "postgres:":
      case "postgresql:":
        return parse_postgres(url);
      default:
        throw new Error(`Unsupported database URL: ${url.href}`);
    }
  } catch (_e) {
    throw new Error(`Unsupported database URL: ${input}`);
  }
};

export const create = (input: string): SqliteDialect | PostgresDialect => {
  const parsed = parse(input);
  switch (parsed._tag) {
    case "sqlite":
      return create_sqlite(...parsed.input);
    case "postgres":
      return create_postgres(...parsed.input);
  }
};

export const inMemory = () => create_sqlite(":memory:");
