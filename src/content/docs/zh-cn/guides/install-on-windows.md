---
title: "从 Windows 主机安装"
description: "在 Windows 托管的 Linux 中评估 Kadupul，并了解原生 Windows 的阻碍。"
banner:
  content: "Kadupul 处于预 Alpha 阶段。本平台流程尚未经过端到端验证。翻译草稿，尚待语言审核。"
---

## 选择执行环境

当前 `main` 要求 PHP 8.4+、`pcntl` 和 `posix`；原生 Windows PHP 无法满足这些 Unix 扩展要求。不要绕过 Composer 的平台检查。请使用 Linux 虚拟机，或在 Microsoft 支持的 Windows 版本上评估 WSL 2。这些是由 Windows 托管的 Linux 安装，而不是经过验证的原生 IIS 部署。参阅 PHP 平台限制。

## 准备 Linux 后安装

使用 WSL 时，在管理员 PowerShell 中运行以下命令，并在提示时重启：

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

确认版本为 2。完成 Linux 账户设置，然后在 Linux 内按照安装指南配置数据库、PHP 扩展、资源、Web 服务器和调度程序。将代码和 RRD 存储放在 Linux 文件系统中，不要放在 `/mnt/c/` 下。参阅 Microsoft 的 WSL 和文件系统指南。

## 检查生命周期与恢复

使用专用非特权账户和一种采集启动机制。检查存储信任、轮询、图表时间戳，以及主机重启或 WSL 关闭后的启动行为。不要假定桌面会话会保证采集持续运行。一起备份数据库、配置和 RRD。原生 Windows 仍不支持破坏性 RRD 维护和自动本地清理或归档；Linux 的行为无法验证这些功能。参阅系统要求和备份。

[PHP 限制](https://www.php.net/manual/en/pcntl.installation.php) · [安装](/zh-cn/start/install/) · [Microsoft WSL 指南](https://learn.microsoft.com/en-us/windows/wsl/install) · [文件系统](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [系统要求](/zh-cn/reference/requirements/) · [备份](/zh-cn/guides/back-up-and-restore/)

于 2026 年 10 月 26 日核查的应用程序基准： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
