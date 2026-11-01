import { Callout, Code, CodeBlock, Flow, NextPage, PageHeader, Section, Table } from "../_components/learn-ui";

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        eyebrow="2 / このアプリの構成"
        lead="Next.js のチャット画面と eve のエージェントが、ひとつの Vercel プロジェクトに同居しています。つなぎ役は next.config.ts の withEve() です。"
        title="画面とエージェントの関係"
      />

      <Section title="リクエストの通り道">
        <Flow
          nodes={[
            { title: "ブラウザ", detail: "useEveAgent() が /eve/v1/* を呼ぶ" },
            { title: "Next.js", detail: "画面と proxy.ts のパスワード確認" },
            { title: "eve サービス", detail: "/eve/v1/* を受けて会話を実行", accent: true },
            { title: "AI Gateway", detail: "モデルを呼ぶ" },
          ]}
        />
        <p>
          ブラウザから見ると、画面もエージェントの API も同じドメインにあります。実際には{" "}
          <Code>withEve()</Code> がデプロイ時に eve を別サービスとして組み込み、<Code>/eve/v1/*</Code>{" "}
          へのリクエストだけをそちらに回しています。同じドメインなので CORS の設定が要らず、ブラウザのログイン情報もそのまま届きます。
        </p>
        <CodeBlock title="next.config.ts">
          {`
import { withEve } from "eve/next";

const nextConfig: NextConfig = {};

// agent/ を見つけて /eve/v1/* にマウントする。
// ローカルでは eve の開発サーバーも一緒に起動する。
export default withEve(nextConfig);
`}
        </CodeBlock>
      </Section>

      <Section title="ファイルと役割">
        <Table
          head={["ファイル", "役割"]}
          rows={[
            [<Code key="1">agent/instructions.md</Code>, "日本語のデータアナリストという役割、分析の手順、グラフは英語ラベルにすることなどのルール"],
            [<Code key="2">agent/agent.ts</Code>, "使うモデル。環境変数 EVE_MODEL で差し替え可能。既定は無料枠の Nemotron 3.5 Lightning"],
            [<Code key="3">agent/sandbox/sandbox.ts</Code>, "サンドボックスの準備。Python の仮想環境に pandas と matplotlib を入れる"],
            [<Code key="4">agent/sandbox/workspace/</Code>, "サンドボックスの /workspace に最初から置くファイル(サンプルの sales.csv)"],
            [<Code key="5">agent/tools/show_chart.ts</Code>, "サンドボックス内の PNG を読み出して画面に返す"],
            [<Code key="6">agent/tools/send_report.ts</Code>, "レポート送信。毎回人間の承認が必要"],
            [<Code key="7">agent/channels/eve.ts</Code>, "Web からの接続の認証。DEMO_PASSWORD の Basic 認証"],
            [<Code key="8">proxy.ts</Code>, "画面側のパスワード保護(Next.js の proxy)"],
            [<Code key="9">app/_components/agent-chat.tsx</Code>, "チャット画面。useEveAgent() で会話を管理"],
            [<Code key="10">app/_components/agent-message.tsx</Code>, "メッセージの描画。ツールの実行状況、承認ボタン、グラフ表示"],
          ]}
        />
      </Section>

      <Section title="ツールはアプリ側、コード実行はサンドボックス側">
        <p>
          eve には「アプリのプロセス」と「サンドボックス」という 2 つの実行場所があります。ここを押さえると構成が見えやすくなります。
        </p>
        <Table
          head={["", "アプリのプロセス", "サンドボックス"]}
          rows={[
            ["動くもの", "tools/*.ts の execute()", "AI が書いた Python、bash コマンド"],
            ["環境変数", "見える(REPORT_WEBHOOK_URL など)", "見えない(明示的に渡したものだけ)"],
            ["このアプリでの例", "send_report が Webhook に送信", "pandas で集計、matplotlib でグラフ作成"],
          ]}
        />
        <p>
          AI が書いたコードは、秘密情報が見えない隔離環境で動きます。外部への送信のように危ないことは、自分で書いたツールにだけ許し、さらに承認を挟む、という分担です。
        </p>
        <CodeBlock title="agent/tools/show_chart.ts(抜粋)">
          {`
async execute({ path, caption }, ctx) {
  const sandbox = await ctx.getSandbox();          // このセッションのサンドボックス
  const png = await sandbox.readBinaryFile({ path }); // AI が保存した PNG を読む
  return { path, caption, pngBase64: Buffer.from(png).toString("base64") };
},
// モデルには「表示した」とだけ伝え、画像の中身でコンテキストを埋めない
toModelOutput({ path }) {
  return { type: "text", value: \`Displayed \${path} to the user.\` };
},
`}
        </CodeBlock>
        <Callout kind="tip" title="toModelOutput がポイント">
          ツールの戻り値は「画面に渡すもの」と「モデルに見せるもの」を分けられます。グラフの画像データは画面には必要ですが、モデルに渡すとトークンの無駄なので、短い説明だけを渡しています。
        </Callout>
      </Section>

      <Section title="パスワード保護のしくみ">
        <p>
          画面は <Code>proxy.ts</Code> が、エージェントの API は <Code>agent/channels/eve.ts</Code>{" "}
          の <Code>httpBasic()</Code> が、同じ <Code>DEMO_PASSWORD</Code>{" "}
          で守っています。ブラウザは最初に入力した Basic 認証の情報を同じドメインへのリクエストに自動で付けるので、ログインは 1 回で済みます。
        </p>
        <Callout title="なぜ 2 か所で確認しているのか">
          Vercel 上では <Code>/eve/v1/*</Code> が Next.js を通らずに eve のサービスへ直接届きます。そのため、API 側でも独自に認証する必要があります。eve は認証が設定されていない本番リクエストを拒否する設計(fail-closed)です。
        </Callout>
      </Section>

      <NextPage current="/learn/architecture" />
    </>
  );
}
