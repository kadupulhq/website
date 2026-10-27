---
title: "在 FreeBSD 上安装"
description: "为隔离评估准备 FreeBSD 服务、PHP 扩展和本地存储。"
banner:
  content: "Kadupul 处于预 Alpha 阶段。本平台流程尚未经过端到端验证。翻译草稿，尚待语言审核。"
---

## 选择并准备主机

使用 FreeBSD 支持版本表中列出的版本，并规划持续到 2027 年的升级。操作系统受支持不代表 Kadupul 已兼容。按照 Packages and Ports 手册安装 PHP 8.4+、MySQL 或 MariaDB、RRDtool、Net-SNMP 和 Web 服务器。`php84-extensions` 的默认配置不是应用所需扩展的完整列表；安装依赖项前补齐缺失模块，包括 CLI 的 `pcntl`。

## 检查运行环境并配置服务

检查所选 CLI 解释器和工具：

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

分别检查 Web PHP。对于软件包形式的 PHP-FPM，在启用 `php_fpm` 服务前配置其进程池和 Web 服务器上游连接。FreeBSD 使用 rc 服务，而不是 systemd；请遵循服务手册。数据库、配置、模式和浏览器资源按照安装指南设置。工具版本应匹配应用的 `mise.toml`；这些固定版本并不能证明 mise 运行环境安装器可以在 FreeBSD 上工作。

## 以服务账户调度和验证

只使用一个 cron 启动机制，配置绝对可执行文件路径和指定间隔；不要安装 Linux systemd 单元。采集前以每个 Web/轮询器账户验证 POSIX 身份、目录锁、所有权和显式 UID/GID 信任。使用 jail 时，在 jail 内检查网络、挂载和所需权限。运行一次不重叠的周期，检查保留的队列行和图表时间戳，然后演练一致备份集的恢复。进程成功启动还不够。参阅系统要求和备份。

[FreeBSD 支持版本](https://www.freebsd.org/security/) · [软件包与 Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [FreeBSD 服务](https://docs.freebsd.org/en/books/handbook/config/) · [安装](/zh-cn/start/install/) · [系统要求](/zh-cn/reference/requirements/) · [备份](/zh-cn/guides/back-up-and-restore/)

于 2026 年 10 月 26 日核查的应用程序基准： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
