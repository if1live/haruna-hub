import { parse } from "@aws-sdk/util-arn-parser";
import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Site = {
  arn: string;
  url: string;
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
