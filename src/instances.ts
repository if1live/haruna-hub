import { LambdaClient } from "@aws-sdk/client-lambda";
import { createServerClient } from "@supabase/ssr";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { createRemoteJWKSet } from "jose";
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

// 요청 헤더를 간단히 파싱해서 getAll() 형태로 변환
function parseCookieHeader(header?: string) {
  if (!header) return [] as { name: string; value: string }[];
  return header.split(";").map((p) => {
    const i = p.indexOf("=");
    const name = decodeURIComponent(p.slice(0, i).trim());
    const value = decodeURIComponent(p.slice(i + 1));
    return { name, value };
  });
}

export const createSupabaseClient = (c: Context<{ Bindings: MyBindings }>) => {
  const secure = new URL(c.req.url).protocol === "https:";

  return createServerClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie"));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure,
          });
        });
      },
    },
  });
};

// jwks는 매번 생성하는걸 피하고 싶은데 iss는 env로 넘어온다.
// 하드코딩으로 박는거 피하려고 map 사용
const jwksByIss = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

// example: "https://xxxx.supabase.co/auth/v1"
export const getJWKS = (iss: string) => {
  let jwks = jwksByIss.get(iss);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${iss}/.well-known/jwks.json`));
    jwksByIss.set(iss, jwks);
  }
  return jwks;
};
