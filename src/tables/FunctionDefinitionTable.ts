import type { Generated, Selectable } from "kysely";

export const name = "functionDefinition";

export type Table = {
  id: Generated<number>;
  functionName: string;
  functionArn: string;
  payload: unknown;
};

export type Row = Selectable<Table>;
