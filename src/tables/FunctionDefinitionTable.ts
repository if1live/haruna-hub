import type { Insertable, Selectable } from "kysely";
import type { KyselifyEntity } from "kysely-typeorm";
import type { FunctionDefinitionEntity } from "../../entities";

export const name: FunctionDefinitionEntity.KyselyName = "functionDefinition";
export type Table = KyselifyEntity<FunctionDefinitionEntity.MyEntity>;

export type Row = Selectable<Table>;
export type NewRow = Insertable<Table>;
export type RowUpdate = Partial<Row>;
