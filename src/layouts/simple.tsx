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

      <table class="table table-sm table-hover">
        {user && privFunctions.length > 0 ? (
          <SiteList title="priv site" sites={privFunctions} />
        ) : null}
        {pubFunctions.length > 0 ? (
          <SiteList title="pub site" sites={pubFunctions} />
        ) : null}
      </table>
    </SiteLayout>
  );
};

const SiteList: FC<{
  title: string;
  sites: Site[];
}> = (props) => {
  const { title, sites } = props;
  return (
    <>
      <thead>
        <tr>
          <th>{title}</th>
          <th>link</th>
          <th>link (new tab)</th>
        </tr>
      </thead>
      <tbody>
        {sites.map((site) => (
          <SiteElement site={site} />
        ))}
      </tbody>
    </>
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
