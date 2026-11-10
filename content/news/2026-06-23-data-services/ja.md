---
title: カタログから MySQL や Kafka などのデータサービスをアプリケーションに追加できるようになりました
summary: Dashboard の「カタログ」から、MySQL、Kafka、OpenSearch、ClickHouse、S3 互換のバケットなどをアプリケーションのコンポーネントとして作成できます。開発向けと本番向けの構成はプリセットから選べます。
publishedAt: 2026-06-23T11:00:00+09:00
category: feature
tags: [catalog, data]
---
データベースやメッセージング、検索などのデータサービスを、Dashboard の「カタログ」からアプリケーションのコンポーネントとして追加できるようになりました。

## できること

- PostgreSQL、MySQL、Redis（Valkey）、バケット（S3 互換）、ClickHouse、Kafka、OpenSearch から選べます。
- PostgreSQL、MySQL、ClickHouse、Kafka、OpenSearch では、開発・検証向けの単一構成と、本番向けの冗長構成をプリセットから選べます。
- ストレージクラスのように通常は変更しない項目は、「詳細設定」にまとめてあります。

## 使い方

1. [Dashboard]({{.PlatformAPIURL}}) のサイドバーで「カタログ」を開きます。
2. 「コンポーネント」タブでサービスの「配置」を押し、Project とアプリケーションを選んで「続行」を押します。
3. 「表示名」を入力し、構成と設定を選んで「作成」を押します。

## 注意点

- 作成には、Project の「管理者」か「編集者」のロールが必要です。
- Redis 互換のキャッシュ（Valkey）はベータです。
- カタログに表示されていても、環境によっては利用できないサービスがあります。Kafka と OpenSearch は、プラットフォームの管理者が有効にした環境でだけ動作します。サービスの「詳細」に表示される「必要な機能」が Project のクラスターで使えるかどうかは、プラットフォームの管理者に確認してください。
