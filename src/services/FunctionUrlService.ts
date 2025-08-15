import {
  type FunctionUrlConfig,
  type LambdaClient,
  ListFunctionUrlConfigsCommand,
} from "@aws-sdk/client-lambda";
import type { Kysely } from "kysely";
import { FunctionUrlModel } from "../models";
import { type DB, FunctionUrlTable } from "../tables";

const table = FunctionUrlTable.name;

export const retrieve = async (
  client: LambdaClient,
  functionName: string,
): Promise<FunctionUrlConfig[]> => {
  const output = await client.send(
    new ListFunctionUrlConfigsCommand({
      FunctionName: functionName,
    }),
  );

  // 배포를 여러개 하면 다른값이 나올수 있는듯? 근데 나는 하나만 쓸거니까
  const list = output.FunctionUrlConfigs ?? [];
  return list;
};

export const synchronize = async (db: Kysely<DB>, input: FunctionUrlConfig) => {
  const functionArn = input.FunctionArn ?? "";

  const found = await db
    .selectFrom(table)
    .selectAll()
    .where("functionArn", "=", functionArn)
    .executeTakeFirst();

  if (!found) {
    const result = await db
      .insertInto(table)
      .values({
        functionArn,
        functionUrl: input.FunctionUrl ?? "",
        payload: JSON.stringify(input),
      })
      .execute();
    return result;
  }

  const result = await db
    .updateTable(table)
    .where("functionArn", "=", functionArn)
    .set({
      functionUrl: input.FunctionUrl ?? "",
      payload: JSON.stringify(input),
    })
    .execute();
  return result;
};

export const reset = async (db: Kysely<DB>) => {
  await db.deleteFrom(table).execute();
};

export const findByFunctionArn = async (db: Kysely<DB>, arn: string) => {
  const found = await db
    .selectFrom(table)
    .selectAll()
    .where("functionArn", "=", arn)
    .executeTakeFirst();
  if (!found) {
    return found;
  }

  const model = FunctionUrlModel.create(found);
  return model;
};

export const deleteByFunctionArn = async (db: Kysely<DB>, arn: string) => {
  await db.deleteFrom(table).where("functionArn", "=", arn).execute();
};

export const findAll = async (db: Kysely<DB>) => {
  const rows = await db.selectFrom(FunctionUrlTable.name).selectAll().execute();
  const models = rows.map(FunctionUrlModel.create);
  return models;
};
