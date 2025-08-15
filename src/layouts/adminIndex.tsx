import type { FC } from "hono/jsx";
import { AdminLayout } from "./layout";

export const AdminIndex: FC = () => {
  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard.</p>

      <ul>
        <li>
          <a href="/admin/lambda">lambda</a>
        </li>
      </ul>
    </AdminLayout>
  );
};
