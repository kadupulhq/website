---
title: "FreeBSD にインストールする"
description: "隔離評価のために FreeBSD サービス、PHP 拡張、ローカルストレージを準備します。"
banner:
  content: "Kadupul はプレアルファ段階です。このプラットフォーム手順は一連の動作を通して検証されていません。翻訳草稿であり、言語レビューが必要です。"
---

## ホストを選び準備する

FreeBSD のサポート対象表にあるリリースを使い、2027 年までのアップグレードを計画してください。OS のサポートは Kadupul の互換性の証明ではありません。Packages and Ports ハンドブックに従い PHP 8.4+、MySQL または MariaDB、RRDtool、Net-SNMP、Web サーバーをインストールします。`php84-extensions` の既定値は全拡張を網羅しません。依存関係のインストール前に CLI 用 `pcntl` など不足するモジュールを追加してください。

## 実行環境を確認しサービスを構成する

選んだ CLI インタープリターとツールを確認します。

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Web PHP は別に確認してください。パッケージ版 PHP-FPM は、`php_fpm` サービスを有効にする前にプールと Web サーバーの接続先を設定します。FreeBSD は systemd ではなく rc サービスを使うため、サービスハンドブックに従ってください。データベース、設定、スキーマ、ブラウザー資産はインストール手順に従います。ツールはアプリケーションの `mise.toml` に合わせますが、固定バージョンは mise のランタイムインストーラーが FreeBSD で動く証拠ではありません。

## サービスアカウントでスケジュールと検証を行う

絶対実行パスと設定した間隔で一つの cron 起動機構を使い、Linux の systemd ユニットは入れないでください。収集前に各 Web/ポーラーアカウントで POSIX 識別情報、ディレクトリロック、所有権、明示的な UID/GID の信頼を確認します。jail では内部のネットワーク、マウント、必要権限を確認してください。重ならない一周期を実行し、保持されたキュー行とグラフ時刻を調べ、対応するバックアップの復元を練習します。プロセス起動の成功だけでは不十分です。動作要件とバックアップを参照してください。

[サポート対象の FreeBSD](https://www.freebsd.org/security/) · [Packages と Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [FreeBSD サービス](https://docs.freebsd.org/en/books/handbook/config/) · [インストール](/ja/start/install/) · [動作要件](/ja/reference/requirements/) · [バックアップ](/ja/guides/back-up-and-restore/)

2026 年 10 月 26 日に確認したアプリケーションの基準： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
