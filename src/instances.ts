import { LambdaClient } from "@aws-sdk/client-lambda";
import type { MyBindings } from "./types";

type LambdaClientFn = (env: MyBindings) => LambdaClient;

const createLambdaClient_prod: LambdaClientFn = (env) => {
  return new LambdaClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
};

const createLambdaClient_localhost: LambdaClientFn = (env) => {
  return new LambdaClient({
    endpoint: env.LAMBDA_URL,
    region: env.AWS_REGION,
  });
};

export const createLambdaClient = (env: MyBindings) =>
  env.LAMBDA_URL === undefined
    ? createLambdaClient_prod(env)
    : createLambdaClient_localhost(env);
