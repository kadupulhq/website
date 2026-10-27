---
title: "为什么创建这个分支"
description: "用于 2026–2027 年规划的独立开发重点与迁移验收标准。"
sidebar:
  order: 1
banner:
  content: "Kadupul 处于预 Alpha 阶段。请在隔离的测试安装中验证这些步骤。翻译草稿，尚待语言审核。"
---

Kadupul 是独立的 Cacti 分支，自行决定开发、发布和支持安排。以下优先事项指导 2026–2027 年的规划，不是交付日期，也不是已经适用于生产环境的证据。

## 开发重点

应用的 `main` 分支要求 PHP 8.4+，并将 Symfony 7.4 服务与旧版 Web、轮询器和 CLI 路径结合使用。`lts/1.2` 维护分支有单独的要求。迁移旨在明确用例边界、授权、失败处理和验证，同时保留必要的采集与绘图契约。存在现代服务或测试套件通过，并不能证明整个工作流已完成迁移。参阅架构说明。

## 兼容性与迁移

保留插件、模板、模式和 RRD 历史是发布目标，需要针对具体版本提供证据。每次迁移都必须确定当前生效的写入路径，保留适用的维护修复，并考虑排队或运行中的工作。在隔离副本上使用一致的备份集演练安装、恢复和模式更改。目前还没有经过验证的生产迁移路径。参阅兼容性和项目状态。

这些优先事项描述的是 Kadupul，而不是其他项目的计划或与其维护者达成的协议。Kadupul 与 The Cacti Group 没有从属或认可关系。

[架构](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [兼容性](/zh-cn/project/compatibility-with-cacti/) · [项目状态](/zh-cn/project/status/)

于 2026 年 10 月 26 日核查的应用基准： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
