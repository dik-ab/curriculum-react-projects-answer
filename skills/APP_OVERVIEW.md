# React共通フロントエンドの概要

このリポジトリは、カリキュラム回答コードのReactフロントエンド集です。

## Todo

- 場所: `apps/todo`
- 画面: 1画面
- 機能: Todo一覧、追加、完了切替、削除
- API: `GET/POST/PATCH/DELETE /todos`
- バックエンド差し替え: `.env` の `VITE_API_URL` を変更する

## SNS

- 場所: `apps/sns`
- 画面: 登録、ログイン、メール確認、タイムライン、ユーザーページ、チャット、設定
- 機能: 投稿、いいね、フォロー、DM、プロフィール編集
- API: `/auth`, `/posts`, `/users`, `/conversations`
- リアルタイム: Socket.IO client
- バックエンド差し替え: `.env` の `VITE_API_URL` を変更する

## 開発時の注意

- Reactは共通ですが、TodoとSNSは別Viteアプリです。
- バックエンドを切り替える場合は、APIのレスポンス形を共通仕様に合わせてください。
- Playwrightで確認するときは、対象アプリを起動してから `http://localhost:5173/` を開きます。

