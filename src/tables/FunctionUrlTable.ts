import type { Selectable } from "kysely";
import type { KyselifyEntity } from "kysely-typeorm";
import type { FunctionUrlEntity } from "../../entities";

export const name: FunctionUrlEntity.KyselyName = "functionUrl";
export type Table = KyselifyEntity<FunctionUrlEntity.MyEntity>;
export type Row = Selectable<Table>;
