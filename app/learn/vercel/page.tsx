import { BoxIcon, ClockIcon, KeyRoundIcon, NetworkIcon, RouteIcon, ServerIcon } from "lucide-react";
import { Callout, Card, CardGrid, Code, NextPage, PageHeader, Section, Table } from "../_components/learn-ui";

export default function VercelPage() {
  return (
    <>
      <PageHeader
        eyebrow="5 / Vercel の機能"
        lead="eve 自体は Vercel 以外でも動きますが、Vercel にデプロイすると裏側の部品がすべて Vercel のマネージドサービスに置き換わり、設定なしで動きます。"
        title="どの機能が何を楽にしているか"
      />

      <Section title="使っている Vercel の機能">
        <CardGrid>
          <Card icon={<RouteIcon />} title="Vercel Workflows → 中断と再開">
            会話の各ステップの保存と再開を担当します。承認待ちで何日止まっても、再デプロイしても続きから動くのはこのおかげです。ローカルでは同じ仕組みが <Code>.eve/.workflow-data</Code> にファイルで保存されます。
          </Card>
          <Card icon={<NetworkIcon />} title="AI Gateway → モデル呼び出し">
            <Code>&quot;nvidia/nemotron-3.5-lightning-free&quot;</Code> のような文字列だけで、さまざまなプロバイダのモデルを呼べます。Vercel 上ではプロジェクトの OIDC トークンで認証されるので、API キーの設定が要りません。
          </Card>
          <Card icon={<BoxIcon />} title="Vercel Sandbox → コード実行">
            Firecracker の microVM で、AI が書いた Python を隔離して実行します。<Code>sandbox.ts</Code> の準備処理(pandas のインストールなど)はテンプレートとして保存され、セッションごとにそこから起動します。
          </Card>
          <Card icon={<ServerIcon />} title="Services(Build Output)→ 同居デプロイ">
            <Code>withEve()</Code> が、Next.js アプリと eve のサービスを 1 つのプロジェクトとして出力し、<Code>/eve/v1/*</Code> を eve 側に回すルーティングを書き出します。
          </Card>
          <Card icon={<KeyRoundIcon />} title="OIDC → サービス間の認証">
            eve の内部呼び出しや AI Gateway への接続は、Vercel が発行する OIDC トークンで行われます。<Code>vercelOidc()</Code> はこれを検証する認証です。
          </Card>
          <Card icon={<ClockIcon />} title="Cron Jobs → スケジュール実行">
            このアプリでは使っていませんが、<Code>agent/schedules/</Code> に定義した定期実行は、デプロイ時に Vercel Cron Jobs に変換されます。
          </Card>
        </CardGrid>
      </Section>

      <Section title="Vercel 以外で動かす場合との比較">
        <Table
          head={["部品", "Vercel 上", "セルフホスト(eve start)"]}
          rows={[
            ["耐久実行", "Vercel Workflows(自動)", "ローカルのファイル保存。複数台にするなら共有キューの仕組みが別途必要"],
            ["モデル", "AI Gateway(キー不要)", "AI_GATEWAY_API_KEY か、各プロバイダの API キー"],
            ["サンドボックス", "Vercel Sandbox", "Docker(ビルド時に Docker がないと全セッションが失敗する)"],
            ["スケジュール", "Cron Jobs に自動変換", "各プロセスで実行。複数台なら 1 台以外で無効化"],
            ["認証", "vercelOidc() が使える", "httpBasic() や JWT、OIDC などを自分で設定"],
          ]}
        />
      </Section>

      <Section title="Hobby プラン(無料)で使える量">
        <Table
          head={["項目", "無料で使える量"]}
          rows={[
            ["Sandbox", "月 5 CPU 時間、作成 5,000 回、1 セッション最大 45 分、同時 10 個"],
            ["Workflow", "月 50,000 イベント、書き込み 1 GB"],
            ["Functions", "月 4 CPU 時間、1 回の実行は最大 300 秒"],
            ["AI Gateway", "無料クレジットはあるが、使えるのは無料枠対象のモデルのみ"],
          ]}
        />
        <Callout kind="warn" title="超えたらどうなるか">
          Hobby では上限を超えても課金はされず、その機能が 30 日間止まります。また、Hobby は非商用・個人利用に限られます。
        </Callout>
        <Callout title="GPT や Claude を使いたくなったら">
          AI Gateway のクレジットを購入して有料枠に移り、Vercel の環境変数 <Code>EVE_MODEL</Code>{" "}
          を <Code>anthropic/claude-opus-5.5</Code> などに変えて再デプロイすれば切り替わります。
        </Callout>
      </Section>

      <NextPage current="/learn/vercel" />
    </>
  );
}
