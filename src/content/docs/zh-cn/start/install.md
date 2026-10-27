---
title: "安装"
description: "Kadupul 运行所需的环境以及安装配置顺序。"
sidebar:
  order: 2
banner:
  content: "Kadupul 处于预 Alpha 阶段。请在隔离的测试环境中验证这些步骤。本文为翻译草稿，尚待熟练使用该语言的人员审核。"
---

:::caution[使用前请先验证]
源代码已公开，但目前尚无受支持的 Kadupul 发行版或迁移路径。在依赖这些步骤之前，请在带有备份的隔离副本上进行测试。参见[项目状态](/zh-cn/project/status/)。
:::

请按顺序完整执行一次本流程。每个步骤均以验证检查结束。在继续下一步之前务必完成检查：此处列出的所有故障在当下排查成本极低，而一旦轮询器运行一周后再去排查，成本将十分高昂。

有关主机特定的前提条件，请参阅 [Windows 主机上的 Linux](/zh-cn/guides/install-on-windows/) 和 [FreeBSD](/zh-cn/guides/install-on-freebsd/)。这些操作步骤并不能证明已完成端到端验收测试。

## 前提条件

Kadupul 是一个 PHP 应用程序，它将配置存储在 MySQL 或 MariaDB 中，并将度量数据保存在磁盘上的 RRD 文件中。本页面介绍了基于当前 `main` 分支源代码全新安装主服务器的过程，而非版本升级或已归档的 LTS 分支。在运行之前，必须具备四个组件。

| 组件 | 为什么需要它 |
|---|---|
| PHP 8.4 或更高版本，且处于安全支持期内的发行版 | 运行 Web 界面和轮询器 |
| MySQL 或 MariaDB | 存储设备、模板、用户以及轮询器缓存 |
| RRDtool | 创建和更新轮转归档数据，并渲染图表 |
| net-snmp | 提供用于查询设备的客户端工具和库 |

PHP 还需要[应用程序清单](https://github.com/kadupulhq/kadupul/blob/main/composer.json)中要求的扩展，包括 `pdo_mysql`、`gd`、`sockets`、`gmp`、`intl`、`ldap`、`mbstring`、`pcntl`、`posix` 和 `sqlite3`。请同时为命令行和 Web 运行时环境安装它们。[运行环境要求](/zh-cn/reference/requirements/)区分了 Composer 依赖要求与安装程序的单独检查。

## 步骤 1：安装运行时环境

从发行版软件包仓库中安装 PHP 及其扩展、数据库服务器、RRDtool 和 net-snmp。

**执行检查。**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` 必须列出所有必需的扩展。当 net-snmp 命令行工具可用时，PHP `snmp` 扩展是可选的。Composer 在安装依赖项期间会检查自身所需的扩展；Web 安装程序则有独立的扩展检查。运行时的回退机制并不能免除 Composer 的依赖要求。

命令行与 Web 服务器的 PHP 配置可能存在差异。请两项均作检查。安装程序建议将 `memory_limit` 设置为至少 400M，并将 `max_execution_time` 设置为至少 60 秒；它也接受无限制的值（分别为 `-1` 和 `0`）。低于这些建议值会产生警告，而缺少 `date.timezone` 则属于严重错误。请设置显式的时区，例如 `UTC`，并使用 `php --ini` 确认命令行配置文件的位置。

## 步骤 2：创建数据库及其用户

创建一个空数据库，以及一个对该数据库拥有权限的用户。对于本地数据库，请以数据库管理员身份运行以下 SQL，并在使用前替换示例密码：

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

如果 PHP 从另一台机器连接，请使用匹配的数据库账户主机。

数据库服务器还需要填充其时区表，并且 Kadupul 用户需要对 `mysql` 数据库中的这些表具有读取权限。这是在其自身架构之外唯一需要授予的权限。监控系统本身通常不会显式提示这一点，但它不是可选项；如果不配置，下方的检查将会失败。

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**执行检查。** 以 Kadupul 数据库用户身份登录并运行：

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

返回非零计数且没有权限错误即符合要求。返回零意味着时区表从未加载；出现错误则意味着该用户无法读取它们。这两种情况都会阻断安装程序。

服务器本身的四项设置至关重要，需要在此时修正。

| 设置项 | 期望值 | 原因 |
|---|---|---|
| `max_allowed_packet` | 16M 或更高 | 主服务器与远程采集器之间的大量同步 |
| `character_set_server`、`collation_server` | `utf8mb4`、`utf8mb4_unicode_ci` | 设备描述包含多字节字符 |
| `innodb_file_per_table` | 开启（On） | 保持表空间独立且易于管理 |
| `innodb_buffer_pool_size` | 约占系统内存的四分之一 | 将工作集保留在内存中 |

安装程序会报告其读取到的这些设置并标记不合规项，因此无需盲目相信上表。[调优数据库性能](/zh-cn/guides/tune-database-performance/)在系统承载负载后提供了更深入的说明。

## 步骤 3：解压程序、修正所有权并配置服务

将应用程序放置在 Web 服务器可以提供服务的位置，然后决定由哪个系统用户拥有它。这个决定比存放位置更重要。有两个进程在此处执行写入操作：Web 服务器，以及调度轮询器的机制。请以同一用户运行这两个进程。以非特权用户运行轮询器，并赋予这两个进程所需的访问权限。即使图表能正常渲染，错误的所有权或权限模式也会阻碍后续更新。

### 如果你是克隆仓库而非解压发布包

Git 检出既需要 PHP 依赖项，也需要生成的浏览器静态资源。在安装了仓库的 `mise.toml` 运行时之后，从仓库根目录运行：

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer 会填充 `include/vendor/` 并恢复锁定的兼容性文件。npm 构建会在 `include/js/`、`include/fa/` 和 `include/vendor/flag-icons/` 下生成资源。仅凭 Composer 无法完成源码安装。

包含完整依赖项的离线包是一个单独的构建构件。通用的 GitHub 源码归档包并不是离线包。当目标主机无法访问互联网时，请遵循[离线构建与验证步骤](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation)。

安装依赖项后准备可写路径：

| 分组 | 目录 | 何时需要可写 |
|---|---|---|
| 安装期间 | `resource/snmp_queries`、`resource/script_server`、`resource/script_queries`、`scripts` | 仅在安装或升级期间 |
| 安装期间 | `include/vendor/csrf/`，或已配置的 `path_csrf_secret` 位置 | 安装程序必须创建特定于该安装的密钥；之后予以保留 |
| 始终 | `log`、`cache/boost`、`cache/mibcache`、`cache/realtime`、`cache/spikekill` 以及系统临时目录 | 整个安装运行生命周期内 |
| Symfony 运行时 | `var/cache`，以及在配置了文件日志时的 `var/log` | 供 PHP 运行时和缓存预热用户使用 |

RRD 目录在整个安装运行生命周期内也必须保持可写。它保存着你的历史数据，因此请像对待数据库目录一样给予妥善维护。

当前的迁移阶段仍需要旧版登录、安装程序和插件路由。对于这种混合式安装，在提供仓库根目录的服务时需配置明确规则，拒绝访问私有目录、配置文件、依赖项和运行时状态。不要将整个安装根目录切换为 `public/`：这会移除仍在使用的旧版路由。Symfony 的独立端点具有不同的路由；请参阅[迁移说明文档](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md)。

对于 Nginx，请参考仓库中的 [Nginx location 规则](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf)，并调整 root 路径和 PHP-FPM upstream。在通用 PHP 处理之前保留拒绝规则，并为 `/app.php/...` 保留 PATH_INFO。Nginx 不会读取 `.htaccess`。请确保 RRD 文件、日志和密钥无法通过 HTTP 访问；验证实际的服务器配置，而不要假设文件权限能够阻止 Web 服务提供访问。

**执行检查。** 切换为轮询器用户，在每个“始终”分组目录下写入一个文件，然后将其删除。在 `ls -l` 中看起来正常的权限仍可能被 SELinux 或 AppArmor 拒绝，而写入文件是唯一能检验这一点的检查。接着通过 HTTP 请求日志目录下的文件，期望得到拒绝访问响应。

## 步骤 4：编写配置文件

对于全新安装，请复制自带的分发配置文件：

```bash
cp include/config.php.dist include/config.php
```

请勿覆盖现有安装的配置。根据步骤 2 设置数据库主机、库名、用户名和密码。初次安装时还有另外两个重要设置：`url_path`，即应用程序提供服务的路径，带有前导和尾随斜杠；以及 `poller_id`，在主服务器上为 `1`，仅在远程采集器上为其他值。

保持远程采集器配置块的注释状态。你目前尚未构建采集器；[远程数据采集](/zh-cn/concepts/remote-data-collection/)会在需要时详细介绍。所有其他设置均具备正常工作的默认值，因此在更改任何配置前请先阅读[配置](/zh-cn/reference/configuration/)。

在 PHP 进程环境中配置部署专属的 `APP_SECRET`，供使用它的 Symfony 功能使用。引导程序默认使用 `APP_ENV=prod` 和 `APP_DEBUG=0`，且不加载 `.env` 文件。这与旧版安装程序的 CSRF 密钥是相互独立的。

**执行检查。** 在不显示凭据的情况下检查语法：

```bash
php -l include/config.php
```

在浏览器中打开安装程序之前，请先在下一步中导入数据库架构。

## 步骤 5：导入数据库架构

安装程序要求表已预先存在。将自带的数据库架构加载到你创建的数据库中：

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

请仅在空数据库上执行一次此操作。这不是升级脚本；将其导入已有数据的数据库中可能会失败，或者留下冲突和不完整的数据。

## 步骤 6：运行安装程序

在浏览器中打开站点并按向导操作。安装程序按照固定顺序执行，每一步都是下一步的前提：

1. 欢迎与许可证。
2. 依赖项检查：PHP 版本及扩展、步骤 1 中针对命令行和 Web 服务器的 PHP 设置、时区表以及步骤 2 中的数据库设置。错误会阻断“下一步”按钮。警告不会阻断，但务必仔细阅读。
3. 安装类型：全新的主服务器，或远程采集器。
4. 权限检查：步骤 3 中的各个目录，通过实际写入进行测试。
5. 二进制文件路径：PHP、RRDtool 以及 net-snmp 工具的路径。
6. 数据源配置文件与启动器间隔。
7. 模板选择：要加载哪些设备模板。
8. 表转换、确认以及安装本身。

该列表中第 6 项是难以撤销的操作。你选择的配置决定了后续创建的每个 RRD 文件中写入的步长（step）和归档集，修改配置并不会自动迁移现有文件。保留周期的调整需要单独且经过测试的迁移流程；它们并不总是需要丢弃历史数据。如果峰值数据很重要，请确保配置文件保留最大值而不仅仅是平均值：在点击跳过之前，请先阅读[数据源与轮转归档（RRA）](/zh-cn/concepts/data-sources-and-rras/)。此处提供的启动器间隔为 1 分钟或 5 分钟。数据源配置文件定义了采集间隔；启动器与配置文件必须保持一致。

## 步骤 7：更改默认凭据

自带的架构预置了一个名为 `admin`、密码为 `admin` 的管理员账户，并标记为首次登录时强制修改密码。它还预置了一个禁用的访客账户。在实例可被任何其他人访问之前更改密码，这意味着必须在将其接入他人可路由的网络之前完成更改。

## 步骤 8：配置轮询器计划任务

轮询器必须从外部启动。请保持其采集间隔与启动器间隔一致；轮询器支持 1 分钟或 5 分钟的启动器间隔，并具备防止常规轮询过早到达的保护机制。对于 1 分钟启动器，请在非特权轮询器用户的 crontab 中添加此条目，并将 `php` 和应用程序路径替换为绝对路径：

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

或者使用 `service/cactid.service` 运行自带的 `cactid.php` 守护进程，并根据你的安装路径和非特权用户进行调整。仅使用一种启动器：在使用守护进程时，请禁用 cron 任务或计时器。

使实际调度计划与配置的启动器间隔相匹配。对于亚分钟级（sub-minute）采集配置，启动的轮询器会在该间隔内运行采集周期；请勿尝试使用此 cron 条目来表达亚分钟级的节奏。

**执行检查。** 以轮询器用户身份手动运行一个周期：

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` 会跳过过早运行的时序保护。请在调度器停止时执行此手动检查，以免与计划运行重叠。它不会绕过其他维护或安全检查。期望的结果是正常运行结束并附带一行摘要信息。然后启用调度器并观察两个周期；确认无需人工干预即可成功执行下一次运行。

## 常见问题与排查

以下是初次安装时实际会遇到的故障。

| 现象 | 原因 | 排查位置 |
|---|---|---|
| 安装程序卡在看起来正常的 PHP 设置上 | Web 服务器和命令行读取了不同的 `php.ini` 文件 | `php --ini`，以及 Web SAPI 报告的文件 |
| 安装程序卡在时区检查上 | 时区表未加载，或者 Kadupul 用户无法读取它们 | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| 权限检查在看似可写的目录上失败 | 所有者错误，或受制于 SELinux 和 AppArmor | 以轮询器用户身份写入文件 |
| 安装顺利完成，但始终没有数据进入 | 轮询器从未被调度 | 手动运行 `poller.php --force --debug` |
| 采集了几个周期的数据后停止更新 | 轮询器以错误用户运行，遗留了 Web 用户无法更新的文件 | RRD 目录中文件的所有者 |
| 图表中出现大量细小断点 | 调度间隔与配置的间隔不一致 | 检查 crontab 与配置间隔是否吻合 |
| Composer 拒绝安装 | PHP 低于 8.4 或缺少清单所需的扩展 | `php -v`、`php -m` 和 Composer 的错误输出 |
| 轮询器无法运行多个进程 | 缺少 `pcntl` 或 `posix` | `php -m` |

[日志记录](/zh-cn/reference/logging/)介绍了各组件记录日志的位置。[排查缺失数据](/zh-cn/guides/troubleshoot-missing-data/)涵盖了安装本身正常但单台设备异常的情况。

## 对外公开服务前

轮询器以系统用户身份运行，并执行 RRDtool 和你的采集脚本。请将该安装视为能够执行命令的系统，因为它的确如此。

- 通过 TLS 提供服务。
- 切勿保留默认管理员密码，哪怕只是短暂保留。
- 将数据库用户限制在其自身数据库内。
- 将 RRD 和日志目录置于文档根目录之外。
- 除非另有决定，否则保持访客账户处于禁用状态。

[保护面向互联网的安装](/zh-cn/guides/secure-an-internet-facing-install/)提供了其余的安全准则。下一步：[添加第一台设备](/zh-cn/start/first-device/)。
