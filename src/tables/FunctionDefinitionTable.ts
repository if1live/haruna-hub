import type { Selectable } from "kysely";
import type { KyselifyEntity } from "kysely-typeorm";
import type { FunctionDefinitionEntity } from "../../entities";

export const name: FunctionDefinitionEntity.KyselyName = "functionDefinition";
export type Table = KyselifyEntity<FunctionDefinitionEntity.MyEntity>;
export type Row = Selectable<Table>;
