import { Callout, Code, CodeBlock, Flow, NextPage, PageHeader, Section, Steps, Table } from "../_components/learn-ui";

export default function StreamingPage() {
  return (
    <>
      <PageHeader
        eyebrow="4 / ストリーミング UI"
        lead="返答が一文字ずつ流れ、途中で再読み込みしても続きから表示される。これは eve のイベントストリームと useEveAgent() フックの組み合わせで実現しています。"
        title="文字が流れて、途切れても続く理由"
      />

      <Section title="全体像">
        <Flow
          nodes={[
            { title: "eve のワークフロー", detail: "起きたことを 1 行ずつ記録" },
            { title: "NDJSON ストリーム", detail: "GET /eve/v1/session/:id/stream", accent: true },
            { title: "useEveAgent()", detail: "イベントを読んで状態を組み立てる" },
            { title: "React の画面", detail: "messages と view を描画" },
          ]}
        />
      </Section>

      <Section title="1. サーバーは「起きたこと」を行単位で流す">
        <p>
          ストリームは改行区切りの JSON(NDJSON)で、1 行が 1 つの記録です。記録には 2 種類あります。
        </p>
        <Table
          head={["種類", "中身", "例"]}
          rows={[
            ["コミット", "状態が変わった事実。まとめて 1 行で届くので、中途半端な状態は見えない", "ターン終了、ツール実行完了、承認リクエスト"],
            ["プログレス", "状態には影響しない途中経過", "返答テキストの差分(content.delta)、推論の途中"],
          ]}
        />
        <CodeBlock title="ストリームの中身(イメージ)">
          {`
{"progress":{"type":"content.delta","data":{"partId":"part_3","delta":"月別の"}}}
{"progress":{"type":"content.delta","data":{"partId":"part_3","delta":"売上は"}}}
{"at":"2026-11-01T07:30:00Z","facts":[{"type":"turn.settled", ...}]}
`}
        </CodeBlock>
        <p>
          画面に文字が少しずつ出るのは、この <Code>content.delta</Code> を受け取るたびに表示を伸ばしているからです。
        </p>
      </Section>

      <Section title="2. useEveAgent() が状態を組み立てる">
        <p>
          画面のコードはストリームを直接読みません。<Code>eve/react</Code> の <Code>useEveAgent()</Code>{" "}
          が接続・再接続・イベントの解釈を引き受け、React で使いやすい形にして返します。
        </p>
        <CodeBlock title="app/_components/agent-chat.tsx(抜粋)">
          {`
const agent = useEveAgent({
  prewarm: hasInputText,                // 入力し始めたら裏でセッションを準備
  initialSession: sessionId === undefined ? undefined : { sessionId, streamIndex: 0 },
  resume: sessionId !== undefined,      // URL にセッションがあれば履歴を再生して追従
});

agent.messages   // 描画用のメッセージ一覧(テキスト、ツール、承認など)
agent.view       // セッション全体の状態。activeTurn() や openInteractions() で問い合わせる
agent.status     // "ready" | "busy" | "resuming" など
agent.send(...)  // 送信
agent.respond(...) // 承認や質問への回答
`}
        </CodeBlock>
        <Callout title="view はイミュータブルなスナップショット">
          <Code>agent.view</Code> はイベントが届くたびに作り直される読み取り専用の状態です。
          <Code>eve/events</Code> の <Code>activeTurn(view)</Code>、<Code>callState(view, callId)</Code>{" "}
          のような関数で「いまどのツールが動いているか」「承認待ちか」を問い合わせ、画面の表示を決めています。
        </Callout>
      </Section>

      <Section title="3. Markdown をストリーミングのまま描画する">
        <p>
          返答の Markdown は <Code>streamdown</Code> というライブラリで描画しています。書きかけの表やコードブロックが途中で崩れないよう、未完成の構文を補いながら描画してくれるので、文字が流れている最中でも表がきれいに表示されます。日本語向けのプラグイン(<Code>@streamdown/cjk</Code>)も入っています。
        </p>
      </Section>

      <Section title="4. 再読み込みしても続きから見える理由">
        <Steps
          steps={[
            {
              title: "会話はサーバーに保存されている",
              body: "ストリームの各行はワークフロー側に保存されています。ブラウザが持っているのは「どこまで読んだか」だけです。",
            },
            {
              title: "URL にセッション ID を入れる",
              body: (
                <>
                  最初のメッセージが受け付けられると、URL を <Code>/s/&lt;sessionId&gt;</Code>{" "}
                  に書き換えます。このとき Next.js のルーターを通さず <Code>History.replaceState</Code>{" "}
                  を直接呼んでいます。ルーター経由だと画面が作り直され、流れている最中のストリームが切れてしまうためです。
                </>
              ),
            },
            {
              title: "開き直したら最初から読み直す",
              body: (
                <>
                  <Code>/s/[sessionId]</Code> のページは <Code>streamIndex: 0</Code> と{" "}
                  <Code>resume: true</Code> で接続し、保存済みの行をすべて再生してから、まだ続いているターンに追従します。
                </>
              ),
            },
            {
              title: "接続が切れても自動で再接続",
              body: "通信が切れたら、読み終えた次の行から接続し直します。長い処理でも、同じイベントを重複して受け取ることはありません。",
            },
          ]}
        />
        <Callout kind="tip" title="画面を閉じても処理は止まらない">
          ページを閉じて切れるのはブラウザとの接続だけで、サーバーのターンは動き続けます。止めたいときは停止ボタン(<Code>agent.cancel()</Code>)を使います。
        </Callout>
      </Section>

      <Section title="5. 処理中に追加の指示を送る(steer)">
        <p>
          返答の途中で次のメッセージを送ると、このアプリは <Code>turnPolicy: "steer"</Code>{" "}
          で送ります。eve は進行中のターンに割り込み、同じターンの中で修正を反映します。「やっぱり四半期別で」と途中で言い直せるのはこのためです。
        </p>
      </Section>

      <NextPage current="/learn/streaming" />
    </>
  );
}
