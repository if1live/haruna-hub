import type { User } from "@supabase/supabase-js";
import type { Context } from "hono";
import { jwtVerify } from "jose";
import { getJWKS } from "../instances";

const parseCookieHeader = (header?: string): Map<string, string> => {
  if (!header) {
    return new Map<string, string>();
  }

  const entries = header.split(";").map((p) => {
    const i = p.indexOf("=");
    const name = decodeURIComponent(p.slice(0, i).trim());
    const value = decodeURIComponent(p.slice(i + 1));
    return [name, value] as const;
  });
  return new Map(entries);
};

export const getUserFromContext = (c: Context): User | undefined => {
  const cookie = c.req.header("Cookie") ?? "";
  return getUserFromCookie(cookie);
};

const extractAuthToken = (cookies: Map<string, string>): string | undefined => {
  for (const entry of cookies) {
    const [name, value] = entry;
    if (name.startsWith("sb-") && name.endsWith("-auth-token")) {
      return value;
    }
  }

  return;
};

export const getUserFromCookie = (cookie: string): User | undefined => {
  const cookies = parseCookieHeader(cookie);
  const authToken = extractAuthToken(cookies);
  if (!authToken) {
    return;
  }

  const base64Encoded = authToken.replace("base64-", "");
  const base64Decode = Buffer.from(base64Encoded, "base64").toString("utf8");
  const authTokenObj = JSON.parse(base64Decode);
  const user = authTokenObj.user as User;
  return user;
};

export const verify = async (c: Context) => {
  const cookie = c.req.header("Cookie") ?? "";
  const cookies = parseCookieHeader(cookie);
  const authToken = extractAuthToken(cookies);
  if (!authToken) {
    return;
  }

  const base64Encoded = authToken.replace("base64-", "");
  const base64Decode = Buffer.from(base64Encoded, "base64").toString("utf8");
  const authTokenObj = JSON.parse(base64Decode);
  const _accessToken = authTokenObj.access_token as string;
  const user = authTokenObj.user as User;

  // TODO: 인증 어떻게 구현할까?
  const iss = `${c.env.SUPABASE_URL}/auth/v1`;
  const jwks = getJWKS(iss);
  const { payload } = await jwtVerify(authToken, jwks, {
    issuer: iss,
    algorithms: ["ES256"],
  });
  console.log(payload);

  return user;
};
