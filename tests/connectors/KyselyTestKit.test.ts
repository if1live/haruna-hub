import { type Insertable, Kysely } from "kysely";
import type { Generated, KyselifyEntity } from "kysely-typeorm";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { afterAll, assert, beforeAll, describe, it } from "vitest";
import { DialectFactory, KyselyTestKit } from "../../src/connectors";

const tableName = "sample";

@Entity({ name: tableName })
class SampleEntity {
  @PrimaryGeneratedColumn()
  id!: Generated<number>;

  @Column()
  text!: string;
}

const entities = [SampleEntity];

type Table = KyselifyEntity<SampleEntity>;

type Database = {
  [tableName]: Table;
};

describe("KyselyTestKit", () => {
  let db: Kysely<Database>;

  beforeAll(async () => {
    db = new Kysely<Database>({ dialect: DialectFactory.inMemory() });
    await KyselyTestKit.initialize(db, entities);
  });

  afterAll(async () => {
    await db.destroy();
  });

  it("simple", async () => {
    const row: Insertable<Table> = {
      text: "hello",
    };
    await db.insertInto("sample").values(row).execute();

    const actual = await db
      .selectFrom("sample")
      .selectAll()
      .executeTakeFirstOrThrow();
    assert.equal(row.text, actual.text);
  });
});
