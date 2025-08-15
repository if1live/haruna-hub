import type { User } from "@supabase/supabase-js";
import type { FC } from "hono/jsx";
import { SiteLayout } from "./layout";

export const AuthIndex: FC<{ user: User | undefined }> = (props) => {
  const { user } = props;

  if (!user) {
    return (
      <SiteLayout>
        <UserLogin />
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <UserCurrent user={user} />
    </SiteLayout>
  );
};

const UserLogin: FC = () => {
  return (
    <>
      <h1>login</h1>

      <form method="post" action="/auth/login">
        <div class="mb-3">
          <input
            type="text"
            class="form-control"
            name="email"
            placeholder="email"
          />
        </div>
        <div class="mb-3">
          <input
            type="password"
            class="form-control"
            name="password"
            placeholder="password"
          />
        </div>
        <button type="submit" class="btn btn-primary">
          로그인
        </button>
      </form>
    </>
  );
};

const UserCurrent: FC<{ user: User }> = (props) => {
  const { user } = props;

  return (
    <>
      <h1>user</h1>

      <dl>
        <dt>id</dt>
        <dd>{user.id}</dd>
        <dt>email</dt>
        <dd>{user.email}</dd>
      </dl>

      <a href="/auth/verify">verify</a>

      <form method="post" action="/auth/logout">
        <button type="submit" class="btn btn-danger">
          로그아웃
        </button>
      </form>
    </>
  );
};
