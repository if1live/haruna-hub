import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createSupabaseClient } from "../instances";
import { AuthIndex } from "../layouts/auth";
import { AuthService } from "../services";
import type { MyBindings } from "../types";

export const app = new Hono<{ Bindings: MyBindings }>();
export const resource = "/auth";

const emailLoginValidator = zValidator(
  "form",
  z.object({
    email: z.email(),
    password: z.string().min(6).max(100),
  }),
);

app.get("", async (c) => {
  const user = AuthService.getUserFromContext(c);
  return c.html(<AuthIndex user={user} />);
});

app.post("login", emailLoginValidator, async (c) => {
  const validated = c.req.valid("form");
  const sb = createSupabaseClient(c);

  const { error } = await sb.auth.signInWithPassword(validated);
  if (error) return c.text(error.message, 400);

  return c.redirect("/auth");
});

app.post("logout", async (c) => {
  const sb = createSupabaseClient(c);
  await sb.auth.signOut();
  return c.redirect("/auth");
});

app.get("verify", async (c) => {
  // 정석적인 방법은 supabase client 사용하는건데
  // cookie를 뜯어서 직접 얻는건 가능한데 이렇게 하면 검증이 안붙은 야매 인증
  // const sb = createSupabaseClient(c);
  // const { data: { user } } = await sb.auth.getUser();
  const user = AuthService.verify(c);
  if (!user) {
    return c.json({ message: "no user" });
  }
  return c.json(user);
});
