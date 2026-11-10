---
title: apth CLI でアプリケーションの作成から公開までをターミナルで行えるようになりました
summary: apth にブラウザーでのデバイスログインと `apth apps` コマンドが加わり、アプリケーションの作成、公開、環境変数とログの確認をターミナルで行えます。AI コーディングエージェント向けのスキルも同梱しました。
publishedAt: 2026-09-29T11:00:00+09:00
updatedAt: 2026-11-10T12:00:00+09:00
category: feature
tags: [apth, cli, apps]
---
開発者向け CLI の apth で、ログインからアプリケーションの作成、公開までをターミナルで進められるようになりました。Dashboard を開かずに作業したい開発者や、AI コーディングエージェントに作業を任せたいチームに向けた機能です。

## できること

- `apth login` が表示する URL とコードをブラウザーで承認してログインできます。トークンは画面に表示されません。`apth whoami` は、保存したトークンがまだ使えるかを確認します。
- `apth apps create` で、テンプレートからリポジトリ、Web コンポーネント、PostgreSQL をまとめて作成します。`--publish` を付けると公開 URL も用意します。
- `apth apps get` で準備状況と公開 URL を確認し、`apth apps wait` ですべてのコンポーネントが準備でき、公開 URL が応答するまで待てます。
- `apth apps env` で環境変数を、`apth apps logs` で最近のログを扱えます。
- 同梱のスキルを `apth skills install` で Claude Code、Codex、OMP に入れると、エージェントが apth で作成から公開までを進める手順を参照できます。ネットワークへの接続は不要です。

## 使い方

1. `apth login --api-url <URL> --project <Project>` を実行します。URL には [Dashboard]({{.PlatformAPIURL}}) のアドレスを指定します。
2. 表示された URL をブラウザーで開き、コードを確かめて「Approve」を押します。
3. `apth apps create my-app --template nextjs-postgres --publish --wait` を実行します。`--publish` を付けずに作成したアプリケーションは、あとから `apth apps publish my-app --wait` で公開できます。
4. `apth apps get my-app` で公開 URL を確認します。
5. 環境変数は `apth apps env set my-app KEY=VALUE` で設定します。指定しなかった変数はそのまま残ります。

## 注意点

- テンプレートから作成するには、Project にアプリ作成用の GitHub 接続が必要です。
- 秘密にしたい値は `--sensitive KEY` を付けて設定すると、以後は表示されません。
- apth は [GitHub の appthrust/cli](https://github.com/appthrust/cli) から入手できます。
