# eve データアナリスト(承認付きデータ分析デモ)

[eve](https://eve.dev) の特徴を 1 画面で見せるデモです。

- **サンドボックスでのコード実行**: 添付した CSV をエージェントが pandas / matplotlib で分析し、グラフを画面に表示します。
- **人間の承認(Human-in-the-loop)**: 分析結果をチームへ送る `send_report` は、承認ボタンを押すまで実行されません。
- **耐久実行**: 会話は `/s/<sessionId>` の URL で保存されます。承認待ちのままブラウザを閉じても、同じ URL を開けば続きから承認・再開できます。

## 構成

```
agent/
  instructions.md          エージェントの役割(日本語のデータアナリスト)
  agent.ts                 モデル設定
  channels/eve.ts          Web からの接続の認証(DEMO_PASSWORD)
  sandbox/sandbox.ts       サンドボックスに Python + pandas + matplotlib を用意
  sandbox/workspace/samples/sales.csv   サンプルデータ(架空の EC 売上 2025 年分)
  tools/show_chart.ts      サンドボックス内の PNG を画面に表示
  tools/send_report.ts     レポート送信(毎回承認が必要)
app/                       Next.js のチャット画面(eve の Web Chat を日本語化・拡張)
proxy.ts                   DEMO_PASSWORD によるサイト全体のパスワード保護
```

## デモ用 CSV

`demo-data/` に 3 パターンのデモ CSV と質問例があります。詳しくは [demo-data/README.md](demo-data/README.md) を参照してください。

## ローカルで動かす

必要なもの: Node.js 24 以上、Docker(サンドボックスで Python を動かすため)、モデルの認証情報。

```bash
npm install
npm run dev        # http://localhost:3000
```

モデルの認証情報は次のどちらかです。

- Vercel AI Gateway: `.env.local` に `AI_GATEWAY_API_KEY=...` を書くか、`npx eve link` で Vercel プロジェクトにつなぐ
- 直接プロバイダ: `agent/agent.ts` の `model` を変更する([Agents](https://eve.dev/docs/agent-config))

Docker が無いとサンドボックスは just-bash(Python なし)になり、グラフは作れません。

## Vercel(Hobby プラン)にデプロイ

1. GitHub に push して Vercel で Import する(または `npx eve deploy`)
2. Vercel のプロジェクト設定で環境変数を追加する
   - `DEMO_PASSWORD`: デモ用パスワード(ユーザー名は `demo`)。未設定だと本番のチャットは 401 で拒否されます
   - `REPORT_WEBHOOK_URL`(任意): Slack / Discord の Incoming Webhook URL。未設定ならデモモードで、承認後も実際には送信しません
   - `EVE_MODEL`(任意): 使うモデル。未設定なら AI Gateway の無料枠で使える `nvidia/nemotron-3.5-lightning-free`
3. モデルは AI Gateway 経由なので、Vercel 上では API キー不要です

### モデルについて

AI Gateway の無料枠では一部のモデルしか使えません(一覧は https://vercel.com/ai-gateway/models?freeTier=true )。対象外のモデルを指定すると「Free tier users do not have access to this model」になります。既定の `nvidia/nemotron-3.5-lightning-free` は無料でツール呼び出しにも対応していますが、提供元がプロンプトをモデル改善に使う場合があるため、機密データは添付しないでください。AI Gateway のクレジットを購入すれば、`EVE_MODEL` に `openai/gpt-6-luna-fast` や `anthropic/claude-opus-5.5` などを指定して再デプロイするだけで切り替えられます。

Hobby の無料枠(2026 年 10 月時点): Sandbox は月 5 CPU 時間・1 セッション最大 45 分、Workflow イベントは月 50,000。超過すると課金ではなく 30 日停止です。Hobby は非商用利用のみです。

## デモの流れ

1. 「サンプルの売上データで月別の売上推移をグラフにして」を押す(または CSV を添付して質問)
2. エージェントがサンドボックスで Python を実行し、表とグラフを返す
3. 「この結果をチームに共有して」と送ると、承認カードが出て止まる
4. ブラウザを閉じて同じ URL を開き直しても承認カードが残っている。承認すると送信が実行される
