---
title: "動作要件"
description: "2026–2027 年の計画に向けた実行環境、ストレージ、デプロイの要件です。"
sidebar:
  order: 1
banner:
  content: "Kadupul はプレアルファ段階です。隔離したテスト環境で手順を検証してください。この翻訳は草稿であり、言語に精通した方のレビューを待っています。"
---

2026 年 10 月 26 日に、下記のアプリケーションリビジョンと照合しました。2026–2027 年の計画の基準であり、リリースやサポートの確約ではありません。
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## 実行環境

`main` は PHP 8.4 以降を必要とし、Symfony 7.4 と従来のエントリーポイントを併用します。`lts/1.2` 系列の要件は別です。MySQL または MariaDB、RRDtool、および PHP コレクターまたは互換性のある Spine ビルドをインストールしてください。ソースからビルドする場合は、`mise exec` を通じて `mise.toml` のバージョンを使い、依存関係は更新せずロック済みのものをインストールしてください。

## PHP

マニフェストは PHP に加えて以下の拡張機能を要求します。

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

インストーラーは別途、`ctype`、`date`、`filter`、`hash`、`pcre`、`session`、`simplexml`、`spl`、`standard`、`zlib` などを確認します。Unix では `posix` と CLI の `pcntl`、Windows では `com_dotnet` を確認します。インストーラーを通過しても、Composer の要件を満たす証明にはなりません。CLI と Web の PHP を別々に確認してください。`date.timezone` を設定してください。インストーラーは `memory_limit=400M` と `max_execution_time=60`、または無制限の値を推奨します。任意の `snmp` 拡張はプロセス内クエリを、`gettext` は翻訳カタログを有効にします。

## データベース

ベンダーが保守している MySQL または MariaDB のリリースを使い、対象リビジョンで検証してください。インストーラーに残る MySQL 5.6、MariaDB 10.0 という古い基準は、2026–2027 年のサポートを示しません。現在の `main` では `poller_output`、`poller_output_boost`、`poller_output_realtime` に InnoDB を使いますが、一部の調整用テーブルは MEMORY を使います。すべてのテーブルを同じエンジンに変換しないでください。`mysql.time_zone_name` にデータを読み込み、アプリケーションアカウントにその SELECT 権限を付与してください。

## RRDtool

実行ファイルの絶対パスを設定し、設定上のバージョンをインストール済みのものに合わせてください。`DCOUNTER` と `DDERIVE` には RRDtool 1.5 以降が必要です。Unix のローカルストレージには POSIX の識別情報確認と、正常に動作するディレクトリの `flock` が必要です。排他的な保守の前に、外部の書き込みプロセスとキャッシュデーモンを停止してください。従来のプロキシ経路は存在しますが、検証済みデプロイの保証ではありません。

## net-snmp

PHP `snmp` がない場合や無効な場合は、Net-SNMP ツールをインストールしてください。`path_snmpget`、`path_snmpgetnext`、`path_snmpwalk`、`path_snmpbulkwalk`、`path_snmptrap` にそれぞれの実行ファイルのパスを設定します。対象機器の SNMP バージョンで選択した経路をテストし、該当する場合は IPv6 上の SNMPv3 も確認してください。従来のインストーラーは、この組み合わせでの PHP `snmp` の使用を推奨していません。

## Web サーバー

設定済みの Web 実行環境で PHP を実行し、TLS を使ってください。`/app.php/...` とともに従来のルートを維持し、従来のページが残る間はドキュメントルート全体を `public/` に変更しないでください。互換エントリーポイントには PATH_INFO を設定します。Nginx は `.htaccess` を読みません。PHP 処理より前に、ソース、設定、依存関係、ツール、テスト、秘密情報、実行時状態へのアクセスを明示的に拒否してください。URL プレフィックスは `$url_path` に合わせます。

## スケジューラー

起動には cron、タスクスケジューラ、付属のコレクターデーモンサービスのいずれか一つを使ってください。起動頻度は設定済みの起動間隔に合わせます。1 分未満の収集処理はその間隔の内部で動作し、cron だけではその頻度を指定できません。通常の起動機構を停止してからポーラーのアカウントで確認し、処理の重複を防いでください。

## ファイルシステム

実際の RRD パス、ログ、キャッシュ、Symfony の実行時ディレクトリには、必要なアカウントだけにアクセスを許可してください。既定の RRD ディレクトリは `rra/` です。Unix で Web とポーラーのアカウントを分ける場合、`include/config.php` の `rrd_maintenance_trusted_uids` に数値 ID を明示し、書き込み可能なグループは `rrd_maintenance_trusted_gids` にも指定する必要があります。記載したグループの全メンバーを信頼できなければなりません。通常のアクセス権も必要です。誰でも書き込めるストレージは拒否されます。すべての書き込みプロセスで同じ信頼設定を使い、アップグレード前に両アカウントを確認してください。

## 権限

Web プロセスとポーラーは専用の非特権アカウントで実行してください。Raw ICMP には追加の OS 権限が必要です。利用できない場合は TCP、UDP、SNMP の確認を使ってください。ping を有効にするためにアプリケーション全体を root で実行しないでください。Windows にはローカル RRD の破壊的な保守に必要な ACL 検証がなく、通常の更新には RRDtool の同期確認応答を使います。Unix のスループットの証拠では Windows の処理能力を検証できません。

## PHP のバージョンについて

2026–2027 年の計画では、PHP 8.4 のアクティブサポートは 2026 年 12 月 31 日まで、セキュリティ修正は 2028 年 12 月 31 日までです。PHP 8.5 はそれぞれ 2027 年 12 月 31 日、2029 年 12 月 31 日までです。これは PHP プロジェクトの日程であり、Kadupul の互換性一覧ではありません。新しい実行環境は採用前にロック済み依存関係でテストしてください。Symfony 自体の PHP 最低要件が低くても、Kadupul の最低バージョン 8.4 は変わりません。デプロイ前に上流の日程と対象リビジョンを再確認してください。

[データベース調整](/ja/guides/tune-database-performance/) · [RRDtool 統合](/ja/reference/rrdtool-integration/) · [SNMP](/ja/reference/snmp/) · [ファイル配置](/ja/reference/file-layout/) · [インストール](/ja/start/install/) · [ストレージのアップグレード前提条件](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [サポート対象の PHP バージョン](https://www.php.net/supported-versions.php)
