import {
  type FunctionConfiguration,
  type FunctionUrlConfig,
  LambdaClient,
  ListFunctionsCommand,
  ListFunctionUrlConfigsCommand,
} from "@aws-sdk/client-lambda";
import type { MyBindings } from "../types";

type LambdaClientFn = (region: string, env: MyBindings) => LambdaClient;

const createLambdaClient_prod: LambdaClientFn = (region, env) => {
  return new LambdaClient({
    region,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
};

const createLambdaClient_localhost: LambdaClientFn = (region, env) => {
  return new LambdaClient({
    region,
    endpoint: env.LAMBDA_URL,
  });
};

export const createLambdaClient = (region: string, env: MyBindings) =>
  env.LAMBDA_URL === undefined
    ? createLambdaClient_prod(region, env)
    : createLambdaClient_localhost(region, env);

export const loadListFunctions = async (
  client: LambdaClient,
): Promise<FunctionConfiguration[]> => {
  // TODO: 페이징 구현? 당장은 함수가 그정도로 많지 않을거다
  const output = await client.send(
    new ListFunctionsCommand({
      MaxItems: 100,
    }),
  );
  const list = output.Functions ?? [];
  return list;
};

export const loadFunctionUrlConfig = async (
  client: LambdaClient,
  functionName: string,
): Promise<FunctionUrlConfig[]> => {
  try {
    const output = await client.send(
      new ListFunctionUrlConfigsCommand({
        FunctionName: functionName,
      }),
    );

    // 배포를 여러개 하면 다른값이 나올수 있는듯? 근데 나는 하나만 쓸거니까
    const list = output.FunctionUrlConfigs ?? [];
    return list;
  } catch (e) {
    console.error(e);
    return [];
  }
};
