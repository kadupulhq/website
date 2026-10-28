---
title: 监控 Windows 主机
description: 通过 SNMP 服务在 Windows 上绘制 CPU、磁盘、接口和运行时间图表，哪些主机资源对象承载数据，以及在 SNMP 不可用时的替代方案。
banner:
  content: Kadupul 处于 pre-alpha 阶段。请在独立的测试安装中验证这些流程。这是一份草稿翻译，正在等待流利使用该语言的人员进行审核。
sidebar:
  order: 14
---

:::caution[使用前请验证]
源代码已公开，但目前没有受支持的 Kadupul 版本或迁移路径。在依赖这些流程之前，请在带有备份的独立副本上进行测试。请参阅[项目状态](/zh-cn/project/status/)。
:::

通过 SNMP，Windows 可以提供网络接口、处理器、存储及若干计数器。内置的 Microsoft 代理不暴露 net-snmp UCD 模板所需的负载、内存和磁盘对象。如果代理暴露了存储行，依然可以通过存储行绘制内存图表。第三方代理可能会提供其他对象；在选择模板之前，请核查实际运行的代理。

## SNMP 服务提供的内容

Windows SNMP 服务已被弃用且为可选组件。对于 Windows 10 和 11，Microsoft 记录了通过可选功能或 Windows 功能进行安装的步骤；较旧的 DISM 功能名称错误本身并不代表该功能不可用。请查阅适用于您 Windows 版本的具体说明。请参阅 [Microsoft 的 SNMP 安装指南](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider)。

检查您安装的代理暴露了哪些子树：

| 区域 | 子树 | 提供的内容 |
|---|---|---|
| 系统 | `.1.3.6.1.2.1.1` | 描述、运行时间、联系人、名称、位置 |
| 接口 | `.1.3.6.1.2.1.2` 和 `.1.3.6.1.2.1.31` | 流量、错误、状态 |
| 主机资源 | `.1.3.6.1.2.1.25` | 处理器、存储、进程数、已登录用户数 |
| LAN Manager | `.1.3.6.1.4.1.77` | Windows 服务与共享数据 |

Kadupul 附带的 Windows 模板会读取前三个区域。附带套件中没有任何内容读取 LAN Manager 子树。

主机上的两项配置决定了您能否接收数据：团体名字符串（community string）以及代理接受数据包的管理器列表。配置为仅接受单一管理器地址 SNMP 的主机仅会响应该管理器，并丢弃其余所有请求。

在创建图表之前，请从轮询器主机检查各个区域。将示例主机和团体名替换为您配置的实际值；`public` 仅用于说明。

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

第二个 walk 命令读取处理器负载，第三个命令读取存储描述列表。如果第一个命令有效而另外两个命令未返回任何内容，请检查访问限制、代理支持情况以及返回的 SNMP 错误信息。

## 添加设备

如果模板缺失，请根据[导入和导出模板](/zh-cn/guides/import-and-export-templates/)导入 `install/templates/Windows_Device.xml.gz`。选择 Windows 设备模板，核实查询发现，然后显式创建所需图表。该软件包包含三个数据查询及其关联的图表模板。

| 数据查询 | 支持依据 | 读取内容 |
|---|---|---|
| SNMP - 接口统计信息 | `resource/snmp_queries/interface.xml` | `IF-MIB`，直接遍历 |
| SNMP - 获取处理器信息 | `resource/script_server/host_cpu.xml` | 通过 `scripts/ss_host_cpu.php` 读取 `hrProcessorLoad` |
| SNMP - 获取挂载点 | `resource/script_server/host_disk.xml` | 通过 `scripts/ss_host_disk.php` 读取 `hrStorageTable` |

尽管名称如此，磁盘和处理器查询实际上是脚本服务器查询。它们在独立的持久 PHP 脚本服务器进程中运行，并使用设备记录的凭据执行 SNMP 调用。接口查询是纯 SNMP 查询。实际影响在于：故障的 PHP 脚本服务器会中断 Windows 上的磁盘和 CPU 收集，而接口图表仍会正常运行。

## 无需数据查询即可获取的内容

两个图表模板各自读取单一固定 OID。

| 图表 | OID | 存储类型 |
|---|---|---|
| 主机 MIB - 进程数 | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| 主机 MIB - 已登录用户数 | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

另外两个图表根本不从设备读取数据。运行时间和轮询时间图表调用 `scripts/ss_hstats.php`，并从 Kadupul 自身的设备记录中返回一列：运行时间对应 `snmp_sysUpTimeInstance`，轮询时间对应记录的轮询耗时。它们读取的是存储的测量值，而不是最新的实时 SNMP 响应。

## 主机资源表

### 处理器

在 `.1.3.6.1.2.1.25.3.3.1.2` 下的 `hrProcessorLoad` 返回代理暴露的每个逻辑处理器的一个条目。walk 提供索引；切勿假设行数始终等于宣称的硬件线程数。

该值本身已是百分比。MIB 将其定义为过去一分钟内的平均值。请参阅 [Host Resources MIB 定义](https://www.rfc-editor.org/rfc/rfc2790.html)。

### 存储

附带的存储查询使用 `.1.3.6.1.2.1.25.2.3.1` 下的 `hrStorageTable`。它读取六列。

| 列 | OID | 作用方向 |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | 索引 |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | 索引与显示标签 |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | 输入，乘数 |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | 输出 |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | 输出 |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | 输出 |

大小和已用空间是分配单元计数，而不是字节数。当两个值均有效时，脚本会将每个值乘以该索引缓存的分配单元大小。

在 Windows 上有两点经常引发问题：

**该表不是硬盘驱动器列表。** 代理会报告它视为存储的所有内容。取决于代理，物理内存和虚拟内存可能会与固定磁盘驱动器一起出现。类似 `C:\`, `D:\`, `Physical Memory` 与 `Virtual Memory` 这样的标签只是示例，并非绝对保证存在的行。请按需选择要绘制图表的行。

**大容量或无效存储数值需要核实。** MIB 将大小和使用量定义为非负 Integer32。返回负值的代理解析已超出该范围。当前脚本使用 `(abs(value) + 2147483647) * allocation_units`，但这并不构成无符号 32 位重新解释。请将受影响的值视为不可靠，并在修复发现后重新索引。请参阅[存储转换缺陷](https://github.com/kadupulhq/kadupul/issues/243)。

## Windows 与 Linux 的不同之处

| 特性 | 带有 net-snmp 的 Linux | 内置 Windows 代理 / 附带模板 |
|---|---|---|
| 平均负载 | `.1.3.6.1.4.1.2021.10.1.3` | 无 UCD 平均负载对象 |
| 内存 | `.1.3.6.1.4.1.2021.4` | 可从暴露的 `hrStorage` 行中绘图 |
| CPU | UCD 百分比或 `hrProcessorLoad` | 仅 `hrProcessorLoad` |
| 磁盘列表 | 您声明的 `dskTable` 或 `hrStorage` | 仅 `hrStorage`，未做过滤 |
| 磁盘 I/O | `diskIOTable` | 附带组件均不读取该项 |
| 接口名称 | 内核名称，简短 | 冗长的适配器描述，通常存在重复 |

内置的 Microsoft 代理不提供 UCD 子树 `.1.3.6.1.4.1.2021`。请参阅[排查缺失数据故障](/zh-cn/guides/troubleshoot-missing-data/)。

### 网络接口

接口查询与交换机使用的查询完全相同。其索引偏好顺序为 `ifName`，接着是 `ifDescr`，再者是 `ifHwAddr`，最后是 `ifIndex`。它会选择每个发现的接口上存在且唯一的第一个字段。

Windows 是该机制最常失效的平台。两块相同的网卡可能返回相同的 `ifDescr`，且部分代理会将 `ifName` 留空。当查询回退到 `ifIndex` 时，您的接口历史记录将绑定到一个 Windows 可随时自由重新分配的数字上。

请参阅[监控交换机](/zh-cn/guides/monitor-a-switch/)与[数据查询与索引](/zh-cn/concepts/data-queries-and-indexes/)。

## 当 SNMP 不可用时

许多 Windows 安装未启用 SNMP 服务。替代方案是使用脚本输入。

两项事实决定了您编写脚本的方式：

**脚本在运行轮询器的机器上运行。** 访问 Windows 主机是您脚本的职责：WinRM、代理程序、HTTP 端点、网络共享或任何您运行的机制。

**在标准输出上输出测量值。** PHP 轮询器的外部命令路径不使用退出状态作为测量值。输出一个数字，或者在当前周期无测量值时输出 `U`。当您意在表示测量失败时，请勿输出 `0`。

如果您需要按接口、按磁盘或按服务获取值而不是单个数字，相同的脚本机制提供了索引形式。`resource/script_queries/host_cpu.xml` 是一个实用的示例，它调用 PHP 脚本而不是脚本服务器。

有关输出契约和命名约束，请参阅[编写数据收集脚本](/zh-cn/guides/write-a-data-collection-script/)。

## 故障模式

| 症状 | 常见原因 |
|---|---|
| 读取了系统描述，但未采集其他内容 | 检查对象支持情况、访问限制以及特定的 SNMP 报错 |
| 在线主机完全无响应 | 代理的受信任管理器列表或主机防火墙在 UDP 161 端口的规则 |
| 分区列表包含内存 | 正常现象；代理将内存报告为存储 |
| 大卷显示为负数或未知 | 无效代理数值或过期的分配单元；检查已知转换缺陷 |
| 磁盘和 CPU 停止采集，接口继续运行 | 脚本服务器故障；接口查询不依赖脚本服务器 |
| 分配了 Net-snmp 模板，每个测量值均为 unknown | 所选代理不提供这些模板所需的 UCD 对象 |
| 更改后接口历史记录跟随了错误的网卡 | 由于名称为空或重复，索引回退到了 `ifIndex` |
| 运行时间重复显示旧值 | 检查设备记录是否过旧；辅助组件不会对运行时间做外推 |
