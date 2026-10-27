---
title: "Windows ホストからインストールする"
description: "Windows 上の Linux で Kadupul を評価し、ネイティブ Windows の障害を理解します。"
banner:
  content: "Kadupul はプレアルファ段階です。このプラットフォーム手順は一連の動作を通して検証されていません。翻訳草稿であり、言語レビューが必要です。"
---

## 実行環境を選ぶ

現在の `main` は PHP 8.4+、`pcntl`、`posix` を要求します。ネイティブ Windows PHP はこれらの Unix 拡張要件を満たしません。Composer のプラットフォーム確認を回避しないでください。Linux VM を使うか、Microsoft がサポートする Windows で WSL 2 を評価してください。これは Windows をホストとする Linux のインストールであり、検証済みのネイティブ IIS 配置ではありません。PHP の制限を参照してください。

## Linux を準備してインストールする

WSL では管理者 PowerShell で次を実行し、要求されたら再起動します。

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

バージョン 2 を確認してください。Linux アカウントの設定を済ませ、Linux 内でインストール手順に従ってデータベース、PHP 拡張、資産、Web サーバー、スケジューラーを構成します。コードと RRD は `/mnt/c/` 配下ではなく Linux ファイルシステムに保存してください。Microsoft の WSL とファイルシステムの案内を参照してください。

## ライフサイクルと復旧を確認する

専用の非特権アカウントと一つの収集起動機構を使います。ストレージの信頼設定、ポーリング、グラフのタイムスタンプ、ホスト再起動や WSL 終了後の起動動作を確認してください。デスクトップセッションで収集が続くとは限りません。データベース、設定、RRD を一緒にバックアップします。破壊的な RRD 保守と自動ローカル削除/アーカイブはネイティブ Windows では引き続き利用できず、Linux の動作では検証できません。動作要件とバックアップを参照してください。

[PHP の制限](https://www.php.net/manual/en/pcntl.installation.php) · [インストール](/ja/start/install/) · [Microsoft WSL ガイド](https://learn.microsoft.com/en-us/windows/wsl/install) · [ファイルシステム](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [動作要件](/ja/reference/requirements/) · [バックアップ](/ja/guides/back-up-and-restore/)

2026 年 10 月 26 日に確認したアプリケーションの基準： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
