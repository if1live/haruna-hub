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
  const result = await AuthService.verify(c);
  if (!result) {
    return c.json({ message: "no user" });
  }

  const { user } = result;
  return c.json({
    id: user.id,
    email: user.email,
  });
});
