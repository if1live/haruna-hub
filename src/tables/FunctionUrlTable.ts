import type { Generated, Selectable } from "kysely";

export const name = "functionUrl";

export type Table = {
  id: Generated<number>;
  functionArn: string;
  functionUrl: string;
  payload: unknown;
};

export type Row = Selectable<Table>;
