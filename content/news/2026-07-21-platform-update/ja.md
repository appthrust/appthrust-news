---
title: 2026年7月21日のアップデート
summary: Application Branch の作成とブランチごとの設定・公開、apth でのクラスタ操作の確認が加わりました。
publishedAt: 2026-07-21T10:00:00+09:00
category: release
tags: [dashboard, apth, sdk, cluster]
---
今回のアップデートに含まれる主な変更をお知らせします。

## Application Branch

- **Application Branch の作成**: [Dashboard]({{.PlatformAPIURL}}) の Application の画面で、本番、ステージング、プレビュー、開発などの役割を持つ Application Branch を作成できるようになりました。ソースのブランチとコミット、配置先の Placement Zone、有効期限 (TTL) を指定でき、既存の Application Branch をコピーして作ることもできます。
- **ブランチごとの設定と公開**: Application Branch の詳細ページで、コンポーネントの設定キーをブランチごとに編集し、その Application Branch から公開 (Publish) できるようになりました。値は機密として保存することもできます。

## apth CLI と SDK

- **クラスタ操作の確認**: `apth clusters operations get <operation-id>` で、クラスタに対する操作の詳細を確認できるようになりました。
- **Go SDK での Application Branch の操作**: Go SDK から、Application Branch の作成、更新、削除と、配置先やコンポーネント設定の変更を行えるようになりました。

## 修正

- Application の一覧で、Ready とは関係のない状態をもとにアプリケーションが Degraded と表示されることがある問題を修正しました。
- 画面の幅が狭いときに、Application の詳細ページのタブが画面からはみ出す問題を修正しました。タブは横にスクロールできます。
- ブラウザの「戻る」「進む」で Project の詳細ページを行き来したとき、中断された古い読み込みが残ってエラーになることがある問題を修正しました。
- 作成が終わっていないクラスタで、承認済みの削除やロールバックが作成の完了を待ったまま進まなくなる問題を修正しました。
- 実行中の操作の対象クラスタが削除されると、その操作が終わらないまま残る問題を修正しました。操作は失敗として終了します。
