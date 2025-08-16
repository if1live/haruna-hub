import type { Kysely } from "kysely";
import { afterAll, assert, beforeAll, describe, it } from "vitest";
import { type DB, FunctionUrlTable, toSqlJson } from "../../src/tables";
import { KyselyTestKit } from "./KyselyTestKit";

describe("KyselyTestKit#kysely.sqlite", () => {
  describe("happy-path", () => {
    let db: Kysely<DB>;

    beforeAll(async () => {
      db = KyselyTestKit.create();
      await KyselyTestKit.synchronize(db);
    });

    afterAll(async () => {
      await db.destroy();
    });

    it("simple", async () => {
      const payload = { key: "value" };
      const row: FunctionUrlTable.NewRow = {
        functionArn:
          "arn:aws:lambda:us-east-1:123456789012:function:my-function",
        functionUrl: "https://example.com/my-function",
        payload: toSqlJson(payload),
      };
      await db.insertInto(FunctionUrlTable.name).values(row).execute();

      const actual = await db
        .selectFrom(FunctionUrlTable.name)
        .selectAll()
        .executeTakeFirstOrThrow();

      assert.equal(actual.functionArn, row.functionArn);
      assert.equal(actual.functionUrl, row.functionUrl);
      assert.deepEqual(actual.payload, payload);
    });
  });
});
