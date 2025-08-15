import { LambdaClient } from "@aws-sdk/client-lambda";
import type { MyBindings } from "./types";

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
