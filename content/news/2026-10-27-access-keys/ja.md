---
title: Project のアクセスキーで API キーを発行できるようになりました
summary: Project の「設定」にある「アクセスキー」と `apth access-keys` で、アプリの API を呼ぶための API キーを発行し、無効化や失効ができるようになりました。
publishedAt: 2026-10-27T11:00:00+09:00
category: feature
tags: [iam, apth]
---
ローカル開発や外部サービスなどからアプリの API を呼ぶための API キー（アクセスキー）を、Project で発行できるようになりました。

## できること

- API を公開するアプリの Space ごとに、スコープと有効期間を選んでキーを発行できます。
- キーを一時的に無効にしたり、失効したりできます。失効は取り消せません。失効前に交換済みのトークンは、失効後もしばらく使える場合があります。
- Project の管理者はすべてのキーを管理でき、Project 外のサービスに渡す「サービス用キー」も発行できます。

## 使い方

1. [Dashboard]({{.PlatformAPIURL}}) で Project の「設定」にある「アクセスキー」を開きます。
2. 「キーを作成」から Space とスコープを選んで作成します。
3. 表示されたキーを「キーをコピー」で保存します。キーが表示されるのはこの 1 回だけです。
4. 止めるときは、キーのメニューから「無効にする」か「失効する」を選びます。
5. apth では `apth access-keys create --project <Project> --space <Space> --scope <スコープ>` で発行し、`disable`、`enable`、`revoke` で同じ操作ができます。

## 注意点

- 使える Space がない Project では、キーを作成できません。
- キーは短時間だけ有効なトークンに交換して使います。交換には `apth access-keys exchange` も使えます。
