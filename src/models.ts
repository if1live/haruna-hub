import { parse } from "@aws-sdk/util-arn-parser";
import type {
  FunctionDefinitionTable,
  FunctionUrlTable,
} from "./tables/index.js";

const parse_functionArn = (functionArn: string) => {
  return parse(functionArn).resource.replace("function:", "");
};

// db에서 그대로 읽은것에 필요한 속성 몇개 더 넣어서 쓰고 싶다
export type FunctionDefinitionModel = FunctionDefinitionTable.Row & {
  display_functionArn: string;
};

export const FunctionDefinitionModel = {
  create(input: FunctionDefinitionTable.Row): FunctionDefinitionModel {
    return {
      ...input,
      display_functionArn: parse_functionArn(input.functionArn),
    };
  },
};

export type FunctionUrlModel = FunctionUrlTable.Row & {
  display_functionArn: string;
};

export const FunctionUrlModel = {
  create(input: FunctionUrlTable.Row): FunctionUrlModel {
    return {
      ...input,
      display_functionArn: parse_functionArn(input.functionArn),
    };
  },
};
