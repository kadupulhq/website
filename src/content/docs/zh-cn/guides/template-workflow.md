---
title: "使用并验证模板"
description: "选择模板身份、预览导入并验证传播，同时保留 RRD 历史。"
banner:
  content: "Kadupul 处于预 Alpha 阶段。请在隔离的测试环境中验证这些步骤。翻译草稿，尚待语言审核。"
---

## 选择合适的定义

设备模板提供图表模板和数据查询；数据模板定义测量输入和存储。如果需要独立身份，可以复制一个接近需求的模板，然后检查共享依赖项。复制并不意味着每个引用的输入或配置文件都独立了。更改使用中的定义前，请保存导出文件，以及一致的数据库和 RRD 备份集。参阅模板概念。

## 先预览，再审慎应用

在隔离安装中，检查 XML 来源、目标身份和所选存储配置文件。从应用程序根目录预览普通模板 XML：

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

当前 `main` 会对不可读输入、格式错误的 XML 和已记录的对象失败返回非零状态。同时检查诊断和逐对象结果；导入可能更新现有身份。包导入使用单独的文件写入路径。参阅导入与导出。

## 检查派生对象和历史

应用后，检查有代表性的设备、本地图表项映射、覆盖设置和采集值。设备模板关联的更改需要执行单独的同步操作。保存数据模板不会重塑现有 RRD；更改步长、heartbeat 或保留期前，请检查实际文件。协调恢复前停止写入进程，必要时恢复一致的备份集。参阅自定义模板和保留期。

[模板概念](/zh-cn/concepts/templates/) · [导入与导出](/zh-cn/guides/import-and-export-templates/) · [自定义模板](/zh-cn/guides/create-custom-templates/) · [保留期](/zh-cn/guides/manage-data-retention/)

于 2026 年 10 月 26 日核查的应用程序基准： [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
