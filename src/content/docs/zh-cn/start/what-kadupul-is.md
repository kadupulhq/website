---
title: "Kadupul 简介"
description: "通过 SNMP 和脚本查询设备，将测量值存入 RRD 文件，并生成图表。"
banner:
  content: "Kadupul 处于预览开发阶段。源代码已公开，但尚无受支持的发行版，也没有经过验证的生产迁移方案。请勿用于生产环境。"
---

Kadupul 是 Cacti 的独立分支。它定期查询设备，并使用 RRDtool 存储测量值和绘制图表。

本页提供简要介绍。更多细节请参阅完整的英文页面。 [English](/start/what-kadupul-is/)

## Kadupul 简介

- PHP 应用提供用户界面和安装程序。
- MySQL 或 MariaDB 保存配置、用户信息和轮询器缓存。
- RRD 文件按照配置的保留期限和汇总规则保存测量值，不会永久保留全部原始数据。
- 调度器启动轮询器。采集脚本以轮询器系统账户的权限执行。

## 入门

先建立隔离的测试环境，再添加设备。确认数据正常到达后再解读图表。保留备份，并验证恢复过程。

- [安装](/zh-cn/start/install/)
- [添加第一台设备](/zh-cn/start/first-device/)
- [阅读第一张图表](/zh-cn/start/first-graph/)
