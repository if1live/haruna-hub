import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import type { MyBindings } from "./types";
import { createLambdaClient } from "./instances";
import { ListFunctionsCommand } from "@aws-sdk/client-lambda";

const app = new Hono<{ Bindings: MyBindings }>();

app.use("/auth/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_ID,
    password: c.env.ADMIN_PW,
  });
  return auth(c, next);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/query", async (c) => {
  const client = createLambdaClient(c.env);
  // TODO: 페이징 구현? 당장은 함수가 그정도로 많지 않을거다
  const output = await client.send(
    new ListFunctionsCommand({
      MaxItems: 100,
    }),
  );
  const list = output.Functions ?? [];
  console.log(list);
  return c.json(list);
});

export default app;
