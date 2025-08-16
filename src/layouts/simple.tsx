import { parse } from "@aws-sdk/util-arn-parser";
import type { User } from "@supabase/supabase-js";
import type { FC } from "hono/jsx";
import { SiteLayout } from "./layout";

type Site = {
  arn: string;
  url: string;
};

export const Top: FC<{
  user: User | undefined;
  pubFunctions: Site[];
  privFunctions: Site[];
}> = (props) => {
  const { pubFunctions, privFunctions, user } = props;

  return (
    <SiteLayout>
      <img src="/static/title-01.webp" class="img-fluid" alt="haruna" />

      {user ? (
        <>
          <h3>priv http/https</h3>
          <SiteList sites={privFunctions} />
        </>
      ) : null}

      <h3>pub http/https</h3>
      <SiteList sites={pubFunctions} />
    </SiteLayout>
  );
};

const SiteList: FC<{ sites: Site[] }> = (props) => {
  const { sites } = props;
  return (
    <table class="table table-sm table-hover">
      <thead>
        <tr>
          <th>name</th>
          <th>link</th>
          <th>link (new tab)</th>
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

  return (
    <tr>
      <td>{name}</td>
      <td>
        <a href={url}>goto</a>
      </td>
      <td>
        <a href={url} target="_blank">
          new tab
        </a>
      </td>
    </tr>
  );
};
