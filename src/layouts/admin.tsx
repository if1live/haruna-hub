import { parse } from "@aws-sdk/util-arn-parser";
import type { FC } from "hono/jsx";
import type { FunctionDefinitionModel, FunctionUrlModel } from "../models";
import { Layout } from "./layout";
import { MyNavBar } from "./simple";

export const AdminIndex: FC<{
  list: Array<{
    definition: FunctionDefinitionModel | null;
    url: FunctionUrlModel | null;
  }>;
}> = (props) => {
  const { list } = props;
  return (
    <Layout>
      <MyNavBar />
      <div class="container">
        <h1>lookup</h1>

        {list.map((entry, index) => {
          const key = `${entry.definition?.functionArn ?? "no-arn"}-${index}`;
          return (
            <FunctionElement
              key={key}
              definition={entry.definition}
              url={entry.url}
            />
          );
        })}

        <div>
          <div class="btn-group">
            <SynchronizeListButton region="ap-northeast-1" />
            <SynchronizeListButton region="ap-northeast-2" />
          </div>
          <TruncateListButton />
        </div>
      </div>
    </Layout>
  );
};

const FunctionElement: FC<{
  definition: FunctionDefinitionModel | null;
  url: FunctionUrlModel | null;
}> = (props) => {
  const dataUrl = props.url;
  const dataFn = props.definition;

  const functionName = dataFn?.functionName ?? "<BLANK>";
  const functionArn = dataFn?.functionArn ?? "<BLANK>";

  const parsed = parse(functionArn);
  const { region } = parsed;
  const inspectUrl = `/admin/lookup/inspect?functionName=${functionName}&region=${region}`;

  return (
    <>
      <h2>
        <a href={inspectUrl}>{functionName}</a>
      </h2>

      <div class="ui small labels">
        {dataUrl ? <div class="ui violet label">url</div> : null}
      </div>

      <dl>
        <dt>short function arn</dt>
        <dd>{dataFn?.display_functionArn}</dd>

        {dataUrl ? (
          <>
            <dt>function url</dt>
            <dd>
              <a href={dataUrl.functionUrl}>{dataUrl.functionUrl}</a>
            </dd>
          </>
        ) : null}
      </dl>

      <details>
        <summary>aws function definition</summary>
        <pre>{JSON.stringify(dataFn?.payload, null, 2)}</pre>
      </details>

      {dataUrl ? (
        <details>
          <summary>aws function url</summary>
          <pre>{JSON.stringify(dataUrl?.payload, null, 2)}</pre>
        </details>
      ) : null}

      <div class="btn-group">
        <SynchronizeUrlButton arn={functionArn} />
        {dataUrl ? <ResetFunctionButton arn={functionArn} /> : null}
      </div>
    </>
  );
};

const SynchronizeListButton: FC<{ region: string }> = (props) => {
  const { region } = props;
  return (
    <form
      method="post"
      action={`/admin/lookup/synchronize/list?region=${region}`}
    >
      <button class="btn btn-outline-secondary" type="submit">
        synchronize: {region}
      </button>
    </form>
  );
};

const TruncateListButton: FC = () => {
  return (
    <form method="post" action="/admin/lookup/truncate">
      <button class="btn btn-danger" type="submit">
        truncate
      </button>
    </form>
  );
};

const SynchronizeUrlButton: FC<{ arn: string }> = (props) => {
  const url = `/admin/lookup/synchronize/url?functionArn=${props.arn}`;
  return (
    <form method="post" action={url}>
      <button class="btn btn-outline-secondary" type="submit">
        url
      </button>
    </form>
  );
};

const ResetFunctionButton: FC<{ arn: string }> = (props) => {
  const url = `/admin/lookup/reset?functionArn=${props.arn}`;
  return (
    <form method="post" action={url}>
      <button class="btn btn-danger" type="submit">
        reset
      </button>
    </form>
  );
};
