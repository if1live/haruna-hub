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
  const result = decodeAuthTokenFromCookie(cookie);
  return result?.user;
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

type AuthToken = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User;
};

const decodeAuthTokenFromCookie = (cookie: string): AuthToken | undefined => {
  const cookies = parseCookieHeader(cookie);
  const authToken = extractAuthToken(cookies);
  if (!authToken) {
    return;
  }

  const base64Encoded = authToken.replace("base64-", "");
  const base64Decode = Buffer.from(base64Encoded, "base64").toString("utf8");
  const authTokenObj = JSON.parse(base64Decode);
  return authTokenObj as AuthToken;
};

export const verify = async (c: Context) => {
  // const sb = createSupabaseClient(c);
  // const { data, error } = await sb.auth.getUser();
  // if (error) throw error;
  // return data.user;

  const cookie = c.req.header("Cookie") ?? "";
  const result = decodeAuthTokenFromCookie(cookie);
  if (!result) {
    return;
  }

  const { access_token, user } = result;
  const iss = `${c.env.SUPABASE_URL}/auth/v1`;
  const jwks = getJWKS(iss);
  const { payload } = await jwtVerify(access_token, jwks, {
    issuer: iss,
    algorithms: ["ES256"],
  });

  // payload 안에 유저 관련 정보가 꽤 들어있지만
  // user에 있는 일부 속성이 빠져있어서 둘다 리턴한다
  // accessToken은 용도에 맞게 정보가 빠져있는듯
  return { user, payload };
};
