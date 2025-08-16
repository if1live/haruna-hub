import type { Kysely } from "kysely";
import { createKysely, type DB } from "../tables";
import type { MyBindings } from "../types";

export const withDatabase = <T>(fn: (db: Kysely<DB>) => Promise<T>) => {
  return async (env: MyBindings) => {
    const db = createKysely(env.HYPERDRIVE.connectionString);
    try {
      return await fn(db);
    } finally {
      await db.destroy();
    }
  };
};
