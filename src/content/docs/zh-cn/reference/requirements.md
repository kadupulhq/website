---
title: "系统要求"
description: "用于 2026–2027 年规划的运行环境、存储和部署要求。"
sidebar:
  order: 1
banner:
  content: "Kadupul 处于预 Alpha 阶段。请在隔离的测试环境中验证这些步骤。本文为翻译草稿，尚待熟练使用该语言的人员审核。"
---

于 2026 年 10 月 26 日对照下方应用程序修订版本核查。本基准用于 2026–2027 年规划，不构成发布或支持承诺。
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## 运行环境

`main` 要求 PHP 8.4 或更高版本，并将 Symfony 7.4 与旧版入口结合使用。`lts/1.2` 分支有单独的要求。请安装 MySQL 或 MariaDB、RRDtool，以及 PHP 采集器或兼容的 Spine 构建版本。从源码构建时，通过 `mise exec` 使用 `mise.toml` 中指定的版本；安装锁定的依赖项，不要更新依赖版本。

## PHP

除 PHP 外，依赖清单还要求以下扩展：

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

安装程序还会单独检查 `ctype`、`date`、`filter`、`hash`、`pcre`、`session`、`simplexml`、`spl`、`standard` 和 `zlib` 等扩展。在 Unix 上检查 `posix` 和 CLI 的 `pcntl`；在 Windows 上检查 `com_dotnet`。通过安装程序检查并不意味着满足 Composer 的要求。请分别检查命令行 PHP 和 Web PHP。设置 `date.timezone`；安装程序建议使用 `memory_limit=400M` 和 `max_execution_time=60`，或设为无限制。可选的 `snmp` 扩展支持进程内查询；`gettext` 启用翻译目录。

## 数据库

使用由供应商维护的 MySQL 或 MariaDB 版本，并与目标代码修订版本一起验证。安装程序中 MySQL 5.6 和 MariaDB 10.0 的旧版本门槛不能证明它们在 2026–2027 年受到支持。当前 `main` 中的 `poller_output`、`poller_output_boost` 和 `poller_output_realtime` 使用 InnoDB；部分协调表仍使用 MEMORY。不要把所有表都转换为同一种存储引擎。填充 `mysql.time_zone_name`，并授予应用程序账户对该表的 SELECT 权限。

## RRDtool

配置可执行文件的绝对路径，并使配置的版本与已安装的二进制文件版本一致。`DCOUNTER` 和 `DDERIVE` 要求 RRDtool 1.5 或更高版本。Unix 本地存储需要 POSIX 身份检查，以及可正常工作的目录 `flock` 锁。在独占维护前，停止外部写入进程和缓存守护进程。旧版代理路径仍然存在，但不代表部署方式已得到验证。

## net-snmp

当 PHP `snmp` 扩展缺失或被禁用时，安装 Net-SNMP 工具。将 `path_snmpget`、`path_snmpgetnext`、`path_snmpwalk`、`path_snmpbulkwalk` 和 `path_snmptrap` 配置为对应可执行文件的路径。使用设备的 SNMP 版本测试选定的路径，适用时包括通过 IPv6 使用 SNMPv3；旧版安装程序不建议在这种组合下使用 PHP `snmp`。

## Web 服务器

通过已配置的 Web 运行环境执行 PHP，并使用 TLS。在支持 `/app.php/...` 的同时保留旧版路由；只要仍有旧版页面，就不要将整个文档根目录改为 `public/`。为兼容入口配置 PATH_INFO。Nginx 不读取 `.htaccess`；请在 PHP 处理规则之前明确配置拒绝访问规则，保护源码、配置、依赖项、工具、测试、机密信息和运行时状态。URL 前缀必须与 `$url_path` 一致。

## 调度程序

只使用一种启动机制：cron、任务计划程序，或随附的采集器守护进程服务。启动频率应与配置的启动间隔一致。小于一分钟的采集周期在该间隔内部运行；仅靠 cron 无法提供这种调度频率。以轮询器账户运行检查，并停止常规启动机制，以免任务重叠。

## 文件系统

仅向需要的账户授予实际 RRD 路径、日志、缓存和 Symfony 运行时目录的访问权限。默认 RRD 目录为 `rra/`。Unix 的 Web 与轮询器使用不同账户时，需要在 `include/config.php` 的 `rrd_maintenance_trusted_uids` 中明确列出数字用户 ID；对于可写组，还要在 `rrd_maintenance_trusted_gids` 中列出数字组 ID。列出组的所有成员都必须可信。普通文件权限仍然适用；系统拒绝任何人都可写的存储。所有写入进程必须使用相同的信任配置，升级前请分别检查两个账户。

## 权限

使用专用的非特权账户运行 Web 进程和轮询器。原始 ICMP 需要额外的操作系统权限；无法获得这些权限时，使用 TCP、UDP 或 SNMP 检查。不要为了启用 ping 而以 root 身份运行整个应用程序。Windows 尚无破坏性本地 RRD 维护所需的 ACL 验证；普通更新使用 RRDtool 的同步确认。Unix 吞吐量证据不能用于验证 Windows 的容量。

## 关于 PHP 版本

规划 2026–2027 年环境时，PHP 8.4 的主动支持持续到 2026 年 12 月 31 日，安全修复持续到 2028 年 12 月 31 日。PHP 8.5 的主动支持持续到 2027 年 12 月 31 日，安全修复持续到 2029 年 12 月 31 日。这些是 PHP 上游项目的日期，不是 Kadupul 的兼容性矩阵。采用更新的运行环境前，请使用锁定依赖项进行测试。Symfony 自身较低的 PHP 最低版本要求不会降低 Kadupul 的 8.4 下限。部署前请重新核查上游计划和目标修订版本。

[数据库调优](/zh-cn/guides/tune-database-performance/) · [RRDtool 集成](/zh-cn/reference/rrdtool-integration/) · [SNMP](/zh-cn/reference/snmp/) · [文件布局](/zh-cn/reference/file-layout/) · [安装](/zh-cn/start/install/) · [存储升级前提条件](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [PHP 支持的版本](https://www.php.net/supported-versions.php)
