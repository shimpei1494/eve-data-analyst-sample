import { Callout, Code, CodeBlock, NextPage, PageHeader, Section, Steps, Table } from "../_components/learn-ui";

export default function TurnPage() {
  return (
    <>
      <PageHeader
        eyebrow="3 / 1 ターンの流れ"
        lead="「月別の売上推移をグラフにして」と送ってから、承認を経て送信されるまでに、裏側で何が起きているかを順に追います。"
        title="質問から承認・再開まで"
      />

      <Section title="セッション・ターン・ステップ">
        <p>eve の会話は 3 つの単位でできています。</p>
        <Table
          head={["単位", "意味", "このアプリでは"]}
          rows={[
            ["セッション", "会話全体。何日も続けられる", "URL の /s/<sessionId> 1 つ分"],
            ["ターン", "ユーザーの 1 メッセージと、それで起きる作業すべて", "「グラフにして」から返答が終わるまで"],
            ["ステップ", "ターンの中の保存点。モデル呼び出し 1 回と、続くツール実行", "「Python を実行」「グラフを表示」など 1 回ずつ"],
          ]}
        />
        <p>
          セッションは 1 本の耐久ワークフローとして動き、ステップごとに状態が保存されます。途中でサーバーが止まっても、最後に保存したステップから再開できます。
        </p>
      </Section>

      <Section title="実際の流れ">
        <Steps
          steps={[
            {
              title: "メッセージを送る",
              tag: "ブラウザ",
              body: (
                <>
                  <Code>useEveAgent().send()</Code> が <Code>POST /eve/v1/session</Code>{" "}
                  を送ります。サーバーはすぐに <Code>202</Code> と <Code>sessionId</Code>{" "}
                  を返し、画面の URL が <Code>/s/&lt;sessionId&gt;</Code> に変わります。
                </>
              ),
            },
            {
              title: "モデルが考え、ツールを選ぶ",
              tag: "ステップ 1",
              body: "instructions.md の指示に従い、まずサンドボックスでデータの形を確かめようと、組み込みの bash ツールを呼びます。",
            },
            {
              title: "サンドボックスで Python を実行",
              tag: "ステップ 2〜",
              body: (
                <>
                  <Code>/workspace/.venv/bin/python</Code> で pandas の集計と matplotlib の描画を行い、PNG を{" "}
                  <Code>/workspace/charts/</Code> に保存します。失敗したらエラーを読んで書き直します。
                </>
              ),
            },
            {
              title: "show_chart で画像を画面へ",
              tag: "自作ツール",
              body: "ツールがサンドボックスから PNG を読み出し、画面がそれをチャットの中に表示します。",
            },
            {
              title: "返答を書いてターン終了",
              body: "表と解説が少しずつ画面に流れてきます。ターンが終わってもセッションは開いたまま、次のメッセージを待ちます。",
            },
          ]}
        />
      </Section>

      <Section title="承認待ちで止まって、あとで再開する">
        <p>
          続けて「この結果をチームに共有して」と送ると、モデルは <Code>send_report</Code>{" "}
          を呼ぼうとします。このツールには承認ポリシーが付いているので、実行前にターンが止まります。
        </p>
        <CodeBlock title="agent/tools/send_report.ts(抜粋)">
          {`
approval: {
  request: always(),   // 毎回必ず人に聞く(once() なら 1 回承認すれば以後は聞かない)
  prompt: ({ input }) => \`レポート「\${input.title}」をチームに送信しますか?\`,
},
async execute({ title, body }) {
  // 承認されたときだけここに来る
},
`}
        </CodeBlock>
        <Steps
          steps={[
            {
              title: "承認リクエストが記録される",
              body: (
                <>
                  ストリームに <Code>interaction.opened</Code> と <Code>turn.paused</Code>{" "}
                  が流れ、画面に承認カードが出ます。
                </>
              ),
            },
            {
              title: "ワークフローは止まったまま待つ",
              body: "サーバーは処理を抱えたまま待つのではなく、状態を保存して眠ります。数秒でも数日でも同じです(セッションの既定の期限は、最後のやり取りから 30 日)。",
            },
            {
              title: "ブラウザを閉じても消えない",
              body: (
                <>
                  承認待ちの状態はサーバー側に保存されています。同じ <Code>/s/&lt;sessionId&gt;</Code>{" "}
                  を開き直すと、履歴が再生され、承認カードがもう一度表示されます。
                </>
              ),
            },
            {
              title: "承認するとその場所から再開",
              body: (
                <>
                  ボタンを押すと <Code>agent.respond()</Code> が回答を送り、止まっていたステップから{" "}
                  <Code>execute()</Code> が実行されます。拒否すると実行されず、モデルには拒否された理由が伝わります。
                </>
              ),
            },
          ]}
        />
        <Callout kind="tip" title="二重実行を防ぐしくみ">
          1 つのセッションで有効な「再開の手がかり」は常に 1 つだけです。古い画面から承認を送っても拒否されるので、同じ承認で 2 回送信されることはありません。ただし、メール送信や決済のように 1 回きりにしたい処理には、別途冪等キーを付けることが推奨されています。
        </Callout>
      </Section>

      <NextPage current="/learn/turn" />
    </>
  );
}
