# React共通フロントエンド回答コード

TodoアプリとSNSアプリのReactフロントエンドをまとめた回答コードです。バックエンドは別リポジトリで起動します。

## アプリ構成

```text
curriculum-react-projects-answer/
├── apps/
│   ├── todo/  # Todo React + Vite（http://localhost:5173）
│   └── sns/   # SNS React + Vite（http://localhost:5173）
└── skills/
    └── APP_OVERVIEW.md
```

## Todoフロントエンド

対応バックエンド:

- `curriculum-todo-nestjs-answer`（API: `http://localhost:3000`）
- `curriculum-todo-spring-answer`（API: `http://localhost:8000`）

```bash
cd apps/todo
pnpm install
cp .env.example .env
pnpm run dev
```

`.env` の `VITE_API_URL` を、使うバックエンドに合わせて変更します。

```text
VITE_API_URL=http://localhost:3000
```

ブラウザで `http://localhost:5173/` を開き、Todoの一覧・追加・完了切替・削除を確認します。

## SNSフロントエンド

対応バックエンド:

- `curriculum-sns-nestjs-answer`（API: `http://localhost:3000`）
- `curriculum-sns-spring-answer`（API: `http://localhost:8000`、Socket.IO: `http://localhost:8001`）

```bash
cd apps/sns
pnpm install
cp .env.example .env
pnpm run dev
```

`.env` の `VITE_API_URL` を、使うバックエンドに合わせて変更します。

```text
VITE_API_URL=http://localhost:3000
```

Spring Boot版につなぐ場合は次のようにします。

```text
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8001
```

SNSの認証はHttpOnly Cookie方式です。Reactはトークンを `localStorage` に保存せず、API呼び出しではCookieを送るために `credentials: "include"` を使います。

ブラウザで `http://localhost:5173/` を開き、登録、メール確認、ログイン、投稿、いいね、フォロー、チャット、プロフィール編集を確認します。

## ポート

| 役割 | Todo/NestJS | Todo/Spring | SNS/NestJS | SNS/Spring |
|---|---:|---:|---:|---:|
| React | 5173 | 5173 | 5173 | 5173 |
| API | 3000 | 8000 | 3000 | 8000 |
| Socket.IO | - | - | 3000 | 8001 |
| PostgreSQL | 5432 | 5432 | 5432 | 5432 |

TodoとSNSを同時に起動する場合は、片方のReactを `pnpm run dev -- --port 5174` のように別ポートへ変更してください。
