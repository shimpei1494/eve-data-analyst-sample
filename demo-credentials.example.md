# デモのログイン情報(テンプレート)

このファイルをコピーして `demo-credentials.md` という名前で保存し、パスワードを書き込んでください。
`demo-credentials.md` は `.gitignore` に入っているので、Git にはコミットされません。

```bash
cp demo-credentials.example.md demo-credentials.md
```

| 項目 | 値 |
|---|---|
| ユーザー名 | `demo`(固定) |
| パスワード | (Vercel の環境変数 `DEMO_PASSWORD` に設定した値をここに書く) |
| 本番 URL | |

パスワードを変えるときは、Vercel の Settings → Environment Variables で `DEMO_PASSWORD` を更新して再デプロイしてください。
