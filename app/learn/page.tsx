import {
  BoxIcon,
  FileTextIcon,
  HandIcon,
  HistoryIcon,
  MessagesSquareIcon,
  WrenchIcon,
} from "lucide-react";
import {
  Callout,
  Card,
  CardGrid,
  Code,
  CodeBlock,
  NextPage,
  PageHeader,
  Section,
  Table,
} from "./_components/learn-ui";

export default function LearnOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="1 / eve とは"
        lead="eve は Vercel が 2026 年 6 月に公開した、AI エージェントを作るためのオープンソースのフレームワークです。キャッチコピーは「Web アプリにとっての Next.js を、エージェントのために」。"
        title="eve は「エージェント版の Next.js」"
      />

      <Section title="ひとことで言うと">
        <p>
          Next.js が「<Code>app/</Code> にファイルを置けばページになる」ように、eve は「
          <Code>agent/</Code> にファイルを置けばエージェントの能力になる」フレームワークです。
          エージェントに必要な裏側(会話の保存、途中で止まっても再開できる実行、コードを安全に動かす場所、Slack
          などへの接続)は eve 側が用意してくれるので、作る側は「何をするエージェントか」に集中できます。
        </p>
        <CodeBlock title="このアプリの agent/ フォルダ">
          {`
agent/
├── instructions.md        ← 役割や口調(システムプロンプト)。Markdown で書くだけ
├── agent.ts               ← 使うモデルの設定
├── tools/
│   ├── show_chart.ts      ← ファイル名がそのままツール名 "show_chart" になる
│   └── send_report.ts     ← 承認が必要なツール
├── sandbox/
│   ├── sandbox.ts         ← サンドボックスに Python を入れる準備
│   └── workspace/samples/ ← サンドボックスに最初から置くファイル
└── channels/eve.ts        ← Web からの接続とその認証
`}
        </CodeBlock>
      </Section>

      <Section title="eve が最初から用意してくれるもの">
        <CardGrid>
          <Card icon={<FileTextIcon />} title="ファイル規約による定義">
            指示は Markdown、ツールは TypeScript 1 ファイル。登録用のコードを書かなくても、置いた時点で認識されます。
          </Card>
          <Card icon={<HistoryIcon />} title="耐久実行(Durable execution)">
            会話の各ステップが保存されるので、サーバーが落ちても再デプロイしても、続きから再開できます。
          </Card>
          <Card icon={<BoxIcon />} title="サンドボックス">
            エージェントごとに隔離された Linux 環境があり、AI が書いたコードを安全に実行できます。
          </Card>
          <Card icon={<HandIcon />} title="人間の承認(Human-in-the-loop)">
            ツールに <Code>approval</Code> を付けるだけで、実行前に止まって人の判断を待ちます。何日でも待てます。
          </Card>
          <Card icon={<MessagesSquareIcon />} title="チャネル">
            同じエージェントを Web、Slack、Discord、Teams、cron などから呼べます。
          </Card>
          <Card icon={<WrenchIcon />} title="開発体験">
            <Code>npm run dev</Code> でターミナル UI とホットリロード。評価(evals)やトレースも標準装備です。
          </Card>
        </CardGrid>
      </Section>

      <Section title="ほかの AI ライブラリとの違い">
        <p>
          AI SDK や Mastra、LangGraph でも同じことはできますが、「中断と再開」「コード実行環境」「承認待ち」「複数チャネル」は自分で組み合わせる必要があります。eve はこれらを最初から揃えて、ファイルを置くだけで有効にしているのが一番の違いです。
        </p>
        <Table
          head={["", "eve", "Vercel AI SDK", "Mastra", "LangGraph"]}
          rows={[
            ["位置づけ", "フレームワーク+実行基盤", "LLM 呼び出しの土台(eve もこの上で動く)", "TS のエージェント FW", "グラフ型のエージェント FW"],
            ["定義の書き方", "ディレクトリと Markdown", "コード", "コード", "コード(状態グラフ)"],
            ["中断と再開", "標準", "自前で実装", "ワークフローで対応", "チェックポインタで対応"],
            ["コード実行環境", "標準", "なし", "別途用意", "別途用意"],
            ["動かす場所", "Vercel が最も楽。セルフホストも可", "どこでも", "どこでも", "どこでも"],
          ]}
        />
      </Section>

      <Section title="いまの段階(2026 年 11 月時点)">
        <Table
          head={["項目", "内容"]}
          rows={[
            ["ライセンス", "Apache-2.0(github.com/vercel/eve)"],
            ["このアプリのバージョン", <Code key="v">eve 0.84.1</Code>],
            ["成熟度", "0.x 系。0.84.0 ではストリームの形式やフック、承認 API がまとめて変わるなど、破壊的変更が頻繁です"],
            ["必要な環境", "Node.js 24 以上。ローカルで Python などを動かすなら Docker"],
            ["デプロイ先", "Vercel(推奨)、または eve build / eve start で Node サービスとしてセルフホスト"],
          ]}
        />
        <Callout kind="warn" title="バージョンは固定しておくのが安全">
          変更の速いフレームワークなので、本格的に使うなら <Code>package.json</Code>{" "}
          でバージョンを固定し、アップデートは CHANGELOG を読んでから上げるのがおすすめです。
        </Callout>
      </Section>

      <NextPage current="/learn" />
    </>
  );
}
