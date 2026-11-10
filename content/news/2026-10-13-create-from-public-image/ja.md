---
title: 公開イメージからアプリケーションを作れるようになりました
summary: 公開されているコンテナイメージなら、レジストリの認証情報を登録せずに apth からアプリケーションを作れます。Dashboard では、コンテナのポートをイメージの EXPOSE から検出します。
publishedAt: 2026-10-13T11:00:00+09:00
category: feature
tags: [apth, dashboard, images]
---
公開されているコンテナイメージなら、レジストリの認証情報を登録せずにアプリケーションを作れるようになりました。

## できること

- `apth apps create --image` に公開イメージを指定するだけで作成できます。
- 認証が必要なイメージでは作成を止め、実行すべき `apth registries create` のコマンドを案内します。
- Dashboard では、イメージの `EXPOSE` にある TCP ポートが 1 つなら自動で使います。
- ポートを判別できないときは、ポートの指定か Dockerfile への `EXPOSE` の追加を案内します。

## 使い方

1. `apth apps create my-app --image 'ghcr.io/acme/app:v1.10.1'` を実行します。
2. 認証が必要と表示されたら、案内されたコマンドの `REGISTRY_CONNECTION_ID` を、イメージを取得できるレジストリ接続の ID に置き換えて実行し、作成し直します。
3. [Dashboard]({{.PlatformAPIURL}}) でアプリケーションを作成するときの「コンテナポート」は「イメージから検出（EXPOSE）」が既定です。別のポートは「ポートを指定」で設定します。

## 注意点

- apth では、`--port` を省略するとテンプレートの既定ポートを使い、`EXPOSE` は使いません。
- Dashboard で選べるのは、Project に登録済みのイメージです。
- apth の入手方法は、プラットフォームの管理者に確認してください。
