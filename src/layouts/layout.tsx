import type { FC } from "hono/jsx";

export const MyNavBar: FC = () => {
  return (
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          Haruna Hub
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="/admin/">
                Admin
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export const Layout: FC = (props) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Haruna Hub</title>
        <link rel="icon" href="/static/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/static/icon.png" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr"
          crossorigin="anonymous"
        />
      </head>
      <body>
        {props.children}
        <script
          src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js"
          integrity="sha256-tnaO7U86+Ftzp1BUcBvWDhfKxxiu8rf2slTl4OIEVhY="
          crossorigin="anonymous"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
          crossorigin="anonymous"
        ></script>
      </body>
    </html>
  );
};

export const AdminLayout: FC = (props) => {
  return (
    <Layout>
      <MyNavBar />
      <div class="container">{props.children}</div>
    </Layout>
  );
};
