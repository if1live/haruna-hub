export * from "./tables.js";

import { FunctionDefinitionTable, FunctionUrlTable } from "./tables.js";

export interface DB {
  [FunctionDefinitionTable.name]: FunctionDefinitionTable.Table;
  [FunctionUrlTable.name]: FunctionUrlTable.Table;
}
