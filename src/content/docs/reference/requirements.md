---
title: Requirements
description: Runtime, storage and deployment requirements for 2026–2027 planning.
sidebar:
  order: 1
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Checked on 26 October 2026 against application revision
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).
Use this baseline for 2026–2027 planning; it is not a release or support commitment.

## Runtime

`main` requires PHP 8.4 or newer and combines Symfony 7.4 with legacy entry points.
The `lts/1.2` line has separate requirements. Install MySQL or MariaDB, RRDtool,
and a PHP collector or compatible Spine build. Source builds use the versions in
`mise.toml` through `mise exec`; install locked dependencies rather than updating them.

## PHP

The manifest requires these extensions in addition to PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`,
`mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

The installer separately checks `ctype`, `date`, `filter`, `hash`, `pcre`,
`session`, `simplexml`, `spl`, `standard` and `zlib`, among others. On Unix it
checks `posix` and CLI `pcntl`; on Windows it checks `com_dotnet`. Passing the
installer does not prove that Composer's requirements are satisfied.
Check CLI and web PHP separately. Set `date.timezone`; the installer recommends
`memory_limit=400M` and `max_execution_time=60` or unlimited values. Optional
`snmp` enables in-process queries; `gettext` enables translation catalogues.

## Database

Use a vendor-maintained MySQL or MariaDB release and validate it with the target
revision. Old installer thresholds for MySQL 5.6 and MariaDB 10.0 do not establish
2026–2027 support. Current `main` uses InnoDB for `poller_output`,
`poller_output_boost` and `poller_output_realtime`; some coordination tables
still use MEMORY. Do not convert every table to one engine. Populate
`mysql.time_zone_name` and grant the application account SELECT access to it.
See [database tuning](/guides/tune-database-performance/).

## RRDtool

Configure the executable's absolute path and match the configured version to the
installed binary. `DCOUNTER` and `DDERIVE` require RRDtool 1.5 or newer.
Local Unix storage requires POSIX identity checks and working directory `flock`.
Stop external writers and cache daemons before exclusive maintenance.
The inherited proxy path exists, but is not a validated deployment guarantee.
See [RRDtool integration](/reference/rrdtool-integration/).

## net-snmp

Install Net-SNMP tools when PHP `snmp` is absent or disabled. Configure
`path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` and
`path_snmptrap` with the corresponding executable paths. Test the selected path
with your device's SNMP version, including SNMPv3 over IPv6 where applicable;
the inherited installer cautions against PHP `snmp` for that combination.
See [SNMP](/reference/snmp/).

## Web server

Serve PHP through the configured web runtime and use TLS. Preserve legacy routes
alongside `/app.php/...`; do not switch the entire document root to `public/`
while legacy pages remain. Configure PATH_INFO for the compatibility entry point.
Nginx ignores `.htaccess`; apply explicit deny rules for source, configuration,
dependencies, tools, tests, secrets and runtime state before PHP handling.
Match the URL prefix to `$url_path`. See [file layout](/reference/file-layout/).

## Scheduler

Use one launcher: cron, Task Scheduler, or the shipped collector daemon service.
Match its cadence to the configured launcher interval. Sub-minute collection
runs inside that interval; cron alone does not provide a sub-minute schedule.
Run checks as the poller account with the regular launcher stopped to avoid
overlap. See [installation](/start/install/).

## Filesystem

Grant only the required accounts access to effective RRD paths, logs, caches and
Symfony runtime directories. The default RRD directory is `rra/`.
Separate Unix web/poller accounts require explicit numeric
`rrd_maintenance_trusted_uids` and, for writable groups,
`rrd_maintenance_trusted_gids` in `include/config.php`. Every listed group member
must be trusted. Normal permissions still apply; world-writable storage is rejected.
Use identical trust settings across writers and check both accounts before upgrading.
See [storage upgrade prerequisites](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md).

## Privilege

Run the web process and poller as dedicated unprivileged accounts. Raw ICMP needs
additional operating-system privilege; use TCP, UDP or SNMP checks when unavailable.
Do not run the whole application as root to enable ping. Windows lacks the ACL
validation required for destructive local RRD maintenance; ordinary updates use
synchronous RRDtool acknowledgements. Unix throughput evidence does not validate
Windows capacity.

## On the PHP version

For 2026–2027 planning, PHP 8.4 receives active support through 31 December 2026
and security fixes through 31 December 2028. PHP 8.5 receives active support
through 31 December 2027 and security fixes through 31 December 2029.
These are [PHP upstream dates](https://www.php.net/supported-versions.php),
not a Kadupul compatibility matrix. Test newer runtimes with locked dependencies
before adoption. Symfony's own lower PHP minimum does not lower Kadupul's 8.4 floor.
Recheck upstream schedules and the target revision before deployment.
