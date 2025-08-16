import { strict as assert } from "node:assert";
import {
  Generated,
  Kysely,
  ParseJSONResultsPlugin,
  SqliteAdapter,
  sql,
} from "kysely";
import { afterAll, beforeAll, describe, it } from "vitest";
import { DialectFactory } from "../../src/connectors";

interface User {
  id: Generated<number>;
  name: string;
}
const User = {
  async prepare(db: Kysely<Database>) {
    await db.schema
      .createTable("user")
      .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
      .addColumn("name", "varchar(255)", (col) => col.notNull().unique())
      .execute();
  },
};

interface Database {
  user: User;
}

describe("DialectFactory", async () => {
  const dialect = DialectFactory.create(":memory:");
  // 플러그인으로 테스트 꺠지는거 피하려고 직접 객체 만듬
  const db = new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
  });

  beforeAll(async () => {});

  afterAll(async () => {
    await db.destroy();
  });

  describe("core", () => {
    it("sqlite", () => {
      const adapter = db.getExecutor().adapter;
      assert.ok(adapter instanceof SqliteAdapter === true);
    });
  });

  describe("simple", () => {
    beforeAll(async () => User.prepare(db));
    afterAll(async () => db.schema.dropTable("user").execute());

    it("insert", async () => {
      await db
        .insertInto("user")
        .values([{ name: "foo" }, { name: "bar" }])
        .execute();
    });

    it("find all", async () => {
      const founds = await db.selectFrom("user").selectAll().execute();
      assert.equal(founds.length, 2);
    });

    it("find: foo", async () => {
      const found_foo = await db
        .selectFrom("user")
        .where("name", "=", "foo")
        .selectAll()
        .executeTakeFirstOrThrow();

      assert.equal(found_foo.name, "foo");
    });
  });

  describe("raw query", () => {
    it("ok", async () => {
      type Row = { v: number };
      const compiledQuery =
        sql<Row>`select 1+2 as v, datetime('now') as now`.compile(db);
      const output = await db.executeQuery(compiledQuery);
      assert.equal(output.rows[0]?.v, 3);
    });
  });
});
