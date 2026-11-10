---
title: apth CLI を GitHub で公開しました
summary: apth CLI のバイナリを、GitHub の公開リポジトリ appthrust/cli から認証なしで入手できるようになりました。最初の公開リリースは apth-v0.1.0 です。
publishedAt: 2026-11-10T12:00:00+09:00
category: announcement
tags: [apth, cli]
---
AppThrust の開発者向け CLI「apth」のバイナリを、GitHub の公開リポジトリで配布するようになりました。GitHub のアカウントやトークンがなくても入手できます。

- リポジトリ: [https://github.com/appthrust/cli](https://github.com/appthrust/cli)
- 最初の公開リリース: [apth-v0.1.0](https://github.com/appthrust/cli/releases/tag/apth-v0.1.0)
- リリース一覧: [https://github.com/appthrust/cli/releases](https://github.com/appthrust/cli/releases)

## 変わること

- これまで apth の入手方法はプラットフォームの管理者に確認する必要がありましたが、公開リポジトリから直接インストールできるようになりました。
- 対応環境は Linux と macOS の amd64 / arm64 です。
- 各リリースにはチェックサムの一覧（SHA256SUMS）が付いており、インストールスクリプトはダウンロードしたファイルをこの一覧と照合します。

## インストール

次のコマンドで、最新のリリースが `~/.local/bin` にインストールされます。

```sh
curl -fsSL https://raw.githubusercontent.com/appthrust/cli/main/install.sh | sh -s -- apth
```

- バージョンを固定するときは、末尾にバージョンを付けます（例: `sh -s -- apth v0.1.0`）。
- インストール先を変えるときは、環境変数 `APTH_INSTALL_DIR` を指定します。
- 手動でダウンロードするときは、リリースのページからアーカイブと SHA256SUMS を取得します。

インストールしたら、`apth --help` で動作を確認し、`apth login` でログインします。

## 必要な対応

すでに apth を使っている場合、対応は必要ありません。新しいバージョンは同じコマンドで入れ直せます。

## 注意点

- このリポジトリで公開しているのはバイナリだけで、ソースコードは含まれていません。
- `~/.local/bin` にパスが通っていない場合は、シェルの PATH に追加してください。
