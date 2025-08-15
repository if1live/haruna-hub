import { parse } from "@aws-sdk/util-arn-parser";
import type { FC } from "hono/jsx";
import type { FunctionDefinitionModel, FunctionUrlModel } from "../models";
import { AdminLayout } from "./layout";

const SynchronizeListButton: FC<{ region: string }> = (props) => {
  const { region } = props;
  return (
    <form
      method="post"
      action={`/admin/lambda/synchronize/list?region=${region}`}
    >
      <button class="btn btn-outline-secondary" type="submit">
        synchronize: {region}
      </button>
    </form>
  );
};

const TruncateListButton: FC = () => {
  return (
    <form method="post" action="/admin/lambda/truncate">
      <button class="btn btn-danger" type="submit">
        truncate
      </button>
    </form>
  );
};

const SynchronizeUrlButton: FC<{ arn: string }> = (props) => {
  const url = `/admin/lambda/${props.arn}/synchronize/url`;
  return (
    <button class="btn btn-outline-secondary" type="submit" hx-post={url}>
      url
    </button>
  );
};

const ResetFunctionButton: FC<{ arn: string }> = (props) => {
  const url = `/admin/lambda/reset?functionArn=${props.arn}`;
  return (
    <form method="post" action={url}>
      <button class="btn btn-danger" type="submit">
        reset
      </button>
    </form>
  );
};

export const AdminLambdaListPage: FC<{
  list: Array<{
    definition: FunctionDefinitionModel;
    url: FunctionUrlModel | null;
  }>;
}> = (props) => {
  return (
    <AdminLayout>
      <table class="table table-hover">
        <thead>
          <tr>
            <th>name</th>
            <th>url</th>
            <th>region</th>
            <th>last modified</th>
          </tr>
        </thead>
        <tbody>
          {props.list.map((item, _index) => {
            const dataFn = item.definition;
            const _dataUrl = item.url;

            const arn = dataFn.functionArn;
            const parsed = parse(arn);

            return (
              <tr>
                <td key={arn}>
                  <a href={`/admin/lambda/${arn}/`}>{dataFn.functionName}</a>
                  <span>&nbsp;</span>
                  <BadgeGroup url={Boolean(_dataUrl)} />
                </td>
                <td>
                  {_dataUrl ? <a href={_dataUrl.functionUrl}>link</a> : null}
                </td>
                <td>{parsed.region}</td>
                <td>{dataFn.lastModified.toISOString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div>
        <div class="btn-group">
          <SynchronizeListButton region="ap-northeast-1" />
          <SynchronizeListButton region="ap-northeast-2" />
        </div>
        <TruncateListButton />
      </div>
    </AdminLayout>
  );
};

export const AdminLambdaDetailsPage: FC<{
  definition: FunctionDefinitionModel;
  url: FunctionUrlModel | null;
}> = (props) => {
  const dataUrl = props.url;
  const dataFn = props.definition;

  const functionName = dataFn.functionName;
  const functionArn = dataFn.functionArn;

  return (
    <AdminLayout>
      <h2>{functionName}</h2>

      <div>
        <BadgeGroup url={Boolean(dataUrl)} />
      </div>

      <dl>
        {dataUrl ? (
          <>
            <dt>function url</dt>
            <dd>
              <a href={dataUrl.functionUrl}>{dataUrl.functionUrl}</a>
            </dd>
          </>
        ) : null}
      </dl>

      <details open>
        <summary>aws function definition</summary>
        <pre>{JSON.stringify(dataFn?.payload, null, 2)}</pre>
      </details>

      {dataUrl ? (
        <details open>
          <summary>aws function url</summary>
          <pre>{JSON.stringify(dataUrl?.payload, null, 2)}</pre>
        </details>
      ) : null}

      <div class="btn-group">
        <SynchronizeUrlButton arn={functionArn} />
        {dataUrl ? <ResetFunctionButton arn={functionArn} /> : null}
      </div>
    </AdminLayout>
  );
};

const BadgeGroup: FC<{
  url?: boolean;
}> = (props) => {
  return (
    <>{props.url ? <span class="badge text-bg-primary">url</span> : null}</>
  );
};
