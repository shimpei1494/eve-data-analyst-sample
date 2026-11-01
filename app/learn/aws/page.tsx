import { Callout, Code, CodeBlock, Flow, NextPage, PageHeader, Section, Steps, Table } from "../_components/learn-ui";

export default function AwsPage() {
  return (
    <>
      <PageHeader
        eyebrow="6 / AWS で動かすなら"
        lead="結論から言うと、AWS でも同じことはできます。eve は eve build と eve start で普通の Node サービスとして動かせるからです。ただし、Vercel が自動で用意していた部品を、自分で選んで組み立てることになります。"
        title="同じアプリを AWS で動かすには"
      />

      <Section title="Vercel の部品を AWS に置き換える">
        <p>
          eve が外部に頼っているのは、主に「会話の保存と再開」「モデル」「サンドボックス」の 3 つです。それぞれ AWS 側の候補は次のとおりです。
        </p>
        <Table
          head={["役割", "Vercel では", "AWS での置き換え", "メモ"]}
          rows={[
            [
              "eve の実行",
              "Services / Functions(withEve が自動で設定)",
              "ECS(EC2 起動タイプ)か EC2 で eve start を常駐",
              "Lambda は不向き。長時間のストリームと、プロセス内のキューを前提にしているため",
            ],
            [
              "会話の保存と再開",
              "Vercel Workflows",
              "1 台なら標準のファイル保存(EBS)。複数台なら Postgres 版を RDS / Aurora PostgreSQL で",
              <>
                Postgres 版は公式の <Code>@workflow/world-postgres</Code>(5.0.4 以降)
              </>,
            ],
            [
              "モデル",
              "AI Gateway(キー不要)",
              "Amazon Bedrock",
              <>
                <Code>@ai-sdk/amazon-bedrock</Code> を使い、IAM ロールで認証。AI Gateway をキー付きで使い続けることも可能
              </>,
            ],
            [
              "サンドボックス",
              "Vercel Sandbox(Firecracker)",
              "EC2 上の Docker。または AgentCore Code Interpreter などをカスタムプロバイダとして自作",
              "Fargate では Docker デーモンを動かせないので、標準の Docker サンドボックスは使えない",
            ],
            [
              "ルーティング",
              "withEve() が /eve/v1/* を振り分け",
              "ALB または CloudFront",
              <>
                <Code>/eve/</Code> と <Code>/.well-known/workflow/</Code> の両方をパスを変えずに転送する
              </>,
            ],
            ["画面(Next.js)", "Vercel", "同じコンテナ、または Amplify Hosting", "同じドメインに揃えると CORS 設定が不要"],
            [
              "認証",
              "vercelOidc() と Basic 認証",
              <>
                Cognito + <Code>oidc()</Code>、または今と同じ <Code>httpBasic()</Code>
              </>,
              "vercelOidc() は Vercel の外では使えない",
            ],
            ["定期実行", "Cron Jobs に自動変換", "eve start の中で実行。複数台なら 1 台以外で無効化", "外から呼ぶなら EventBridge Scheduler"],
            ["秘密情報", "Environment Variables", "Secrets Manager / SSM Parameter Store", "ECS のタスク定義から環境変数として渡す"],
            ["ログとトレース", "Vercel のダッシュボード", "OpenTelemetry → CloudWatch / X-Ray(ADOT)", "eve は OpenTelemetry に対応"],
          ]}
        />
      </Section>

      <Section title="構成案 1:まずは 1 台で動かす">
        <p>個人のデモや社内の小さな用途なら、EC2 を 1 台立てて全部載せるのがいちばん簡単です。</p>
        <Flow
          nodes={[
            { title: "CloudFront / ALB", detail: "HTTPS と転送" },
            { title: "EC2(1 台)", detail: "next start + eve start + Docker", accent: true },
            { title: "Amazon Bedrock", detail: "モデル呼び出し" },
          ]}
        />
        <Steps
          steps={[
            {
              title: "EC2 に Node.js 24 と Docker を入れる",
              body: "サンドボックスは同じマシンの Docker コンテナとして作られます。",
            },
            {
              title: "同じマシンで eve build する",
              body: (
                <>
                  ビルド時に Docker が見えると、サンドボックスの準備(pandas などのインストール)を済ませたイメージが作られます。Dockerfile の <Code>RUN eve build</Code>{" "}
                  では Docker が見えないので、その場合は <Code>DockerSandbox.environment()</Code> を明示します。
                </>
              ),
            },
            {
              title: "会話データをディスクに残す",
              body: (
                <>
                  会話の状態は <Code>.eve/.workflow-data</Code> に保存されます。EBS に置き、インスタンスを作り直しても消えないようにします。
                </>
              ),
            },
            {
              title: "モデルを Bedrock に切り替える",
              body: "EC2 の IAM ロールに Bedrock の呼び出し権限を付ければ、API キーを置かずに済みます。",
            },
          ]}
        />
      </Section>

      <Section title="構成案 2:複数台で本格的に動かす">
        <Flow
          nodes={[
            { title: "ALB + Cognito", detail: "ログインと振り分け" },
            { title: "ECS(EC2 起動タイプ)", detail: "eve start を複数タスク", accent: true },
            { title: "Aurora PostgreSQL", detail: "会話の保存と再開" },
            { title: "Bedrock / Code Interpreter", detail: "モデルとコード実行" },
          ]}
        />
        <p>
          複数台にすると、標準のファイル保存では「キューに入れたプロセス自身しか処理を受け取れない」ため、Postgres 版の保存先が必要になります。サンドボックスも台数に合わせて増やす必要があるので、AgentCore Code Interpreter のようなマネージドなコード実行環境をカスタムプロバイダとしてつなぐ選択肢が出てきます。
        </p>
        <Callout title="カスタムプロバイダは自作になる">
          eve が標準で持っているサンドボックスは Vercel、Docker、just-bash の 3 つだけです。AWS のサービスを使う場合は{" "}
          <Code>defineSandboxProvider()</Code> で、コマンド実行・ファイルの読み書き・停止と再開を自分で実装します。AgentCore Code Interpreter は 1 セッション最大 8 時間で、セッションをまたいでファイルを残す仕組みは自分で考える必要があります。
        </Callout>
      </Section>

      <Section title="このアプリを AWS に移すときに変えるコード">
        <CodeBlock title="agent/agent.ts">
          {`
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { defineAgent } from "eve";

export default defineAgent({
  model: bedrock(process.env.BEDROCK_MODEL_ID!), // Bedrock のモデル ID か推論プロファイルの ARN
  modelContextWindowTokens: 200_000, // AI Gateway 以外ではモデルの情報を取れないので明示
});
`}
        </CodeBlock>
        <CodeBlock title="agent/sandbox/sandbox.ts">
          {`
import { DockerSandbox } from "eve/sandbox/docker";

// 今の DefaultSandbox は Vercel 上では Vercel Sandbox を選ぶ。
// AWS では Docker を明示しておくと、ビルド環境の違いで迷わない。
export default DockerSandbox.environment({
  prepare: async (sandbox) => { /* python3-venv、pandas、matplotlib を入れる(今と同じ) */ },
});
`}
        </CodeBlock>
        <p>
          ほかに、<Code>agent/channels/eve.ts</Code> から <Code>vercelOidc()</Code> を外します。ツール、指示、画面のコードはそのまま使えます。
        </p>
      </Section>

      <Section title="AWS で動かすときの注意点">
        <Callout kind="warn" title="eve のバージョンアップで進行中の会話が止まる">
          Vercel 以外では、eve のバージョンを上げると、古いバージョンで始まった会話は続きを処理できなくなります(履歴は読めます)。Vercel Workflows はデプロイごとに古い会話を古いコードへ振り分けてくれますが、自前の環境にはその仕組みがありません。バージョンは固定し、上げるときは進行中の会話がないタイミングを選びます。
        </Callout>
        <Table
          head={["気をつけること", "理由"]}
          rows={[
            ["ロードバランサーのアイドルタイムアウト", "返答のストリームは長くつながったままになる。eve はハートビートを送るが、ALB の設定も確認する"],
            ["ビルドと実行の場所", "Docker サンドボックスの準備済みイメージはビルドしたマシンに作られる"],
            ["コールバックの公開アドレス", "サブエージェントなどのコールバックは、プライベート IP や 127.0.0.1 宛てを拒否する"],
            ["使えない機能", "デプロイ済みエージェントの自己修正(self-modification)は Vercel 専用"],
          ]}
        />
      </Section>

      <Section title="結局どちらがいいか">
        <Table
          head={["", "Vercel", "AWS"]}
          rows={[
            ["始めるまでの手間", "リポジトリをつなぐだけ", "サーバー、DB、ネットワーク、権限の設計が必要"],
            ["会話の再開とアップグレード", "デプロイをまたいでも自動で続く", "バージョン固定と運用ルールで対応"],
            ["向いているケース", "まず試したい、小さく始めたい", "社内ネットワークのシステムにつなぎたい、データを AWS から出したくない、Bedrock を使う決まりがある"],
          ]}
        />
        <p>
          eve の書き方(<Code>agent/</Code> のファイル)はどちらでも同じなので、Vercel で作って試し、必要になったら AWS に移す、という順番でも大きな書き直しは不要です。
        </p>
      </Section>

      <Section title="参考にした資料">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>eve 0.84.1 同梱ドキュメント(Self-Host eve、Sandbox、Custom Sandbox Providers、Agent configuration、Execution model and durability)</li>
          <li>
            <a className="underline underline-offset-4" href="https://useworkflow.dev/docs/worlds" rel="noopener" target="_blank">
              Workflow SDK: Worlds
            </a>
          </li>
          <li>
            <a className="underline underline-offset-4" href="https://aws.amazon.com/bedrock/agentcore/pricing/" rel="noopener" target="_blank">
              Amazon Bedrock AgentCore の料金
            </a>
          </li>
          <li>
            <a className="underline underline-offset-4" href="https://github.com/vercel/eve/discussions/3109" rel="noopener" target="_blank">
              eve Discussions #3109(自前サーバーで多数の eve エージェントを動かす事例)
            </a>
          </li>
        </ul>
      </Section>

      <NextPage current="/learn/aws" />
    </>
  );
}
