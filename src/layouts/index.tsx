import { parse } from "@aws-sdk/util-arn-parser";
import type { FC } from "hono/jsx";

type Site = {
  arn: string;
  url: string;
};

const Layout: FC = (props) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Haruna Hub</title>
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
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
          crossorigin="anonymous"
        ></script>
      </body>
    </html>
  );
};

const MyNavBar: FC = () => {
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

export const Top: FC<{
  functions: Site[];
}> = (props) => {
  const { functions } = props;
  return (
    <Layout>
      <MyNavBar />
      <div class="container">
        <img src="/static/title-01.webp" class="img-fluid" alt="haruna" />
        <h2>http/https</h2>
        <SiteList sites={functions} />
      </div>
    </Layout>
  );
};

const SiteList: FC<{ sites: Site[] }> = (props) => {
  const { sites } = props;
  return (
    <table class="table table-sm table-hover">
      <thead>
        <tr>
          <th>name</th>
          <th>location</th>
          <th>etc</th>
        </tr>
      </thead>
      <tbody>
        {sites.map((site) => (
          <SiteElement site={site} />
        ))}
      </tbody>
    </table>
  );
};

const SiteElement: FC<{
  site: Site;
}> = (props) => {
  const { arn, url } = props.site;

  const parsed = parse(arn);
  const name = parsed.resource.split(":")[1];
  const location = `${parsed.partition}:${parsed.region}:${parsed.service}`;

  const data = {
    arn,
  };

  return (
    <tr>
      <td>
        <a href={url} target="_blank">
          {name}
        </a>
      </td>
      <td>{location}</td>
      <td>
        <details>
          <summary>data</summary>
          <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </details>
      </td>
    </tr>
  );
};
