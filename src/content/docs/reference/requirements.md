---
title: Requirements
description: Versions and extensions, stated precisely.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Requirements are subject to validation before the first supported release.

## Runtime

| Component | Requirement | Absent |
|---|---|---|
| PHP | 8.1 or newer | Nothing runs |
| Database | MySQL or MariaDB, InnoDB available | Nothing runs |
| RRDtool | A local binary, or a reachable remote RRDtool | No graphs, no storage |
| net-snmp | Command line tools, unless the PHP SNMP extension is present | No SNMP collection |
| Web server | PHP as a module or through FPM | No interface |
| Scheduler | cron, Windows Task Scheduler, or the shipped systemd unit | No collection |
| Collector | The shipped PHP collector, or Spine | No collection |

## PHP

Two lists of extensions exist and they are not the same list. The dependency
manifest declares what the package requires. The installer checks a different set
at run time. Both are given below.

### Declared by the manifest

| Extension | Used for | Missing |
|---|---|---|
| `PDO` | The whole database layer | No database access |
| `pdo_mysql` | PDO's MySQL driver | No database access |
| `mysqlnd` | The native driver PDO's MySQL driver is built against | No database access |
| `Phar` | Archive handling expected by the dependency tooling | Package tooling fails |
| `dom` | XML documents | Import, export and data query definitions fail |
| `xml` | XML parsing | Import, export and data query definitions fail |
| `gd` | Image generation | No error image when RRDtool fails, no graph images embedded in reports |
| `gmp` | Arbitrary precision arithmetic in the bundled SNMP disk scripts | Those scripts fall back to floating point and lose precision on 64-bit counters |
| `intl` | Locale-aware number formatting | Falls back to older formatting |
| `json` | Settings, API payloads, the data input whitelist file | Widespread failure |
| `ldap` | LDAP and Active Directory authentication | Only local and web basic authentication |
| `mbstring` | Multibyte strings in device and graph text | Non-ASCII text corrupts |
| `openssl` | Package signature verification on import, and TLS | Signed packages cannot be verified |
| `pcntl` | Process control. The collector and several CLI tools fork | No concurrency |
| `posix` | User, group and process identity | No ownership correction, no ICMP privilege raise |
| `sockets` | Reachability checks, and the connection to a remote RRDtool | No ICMP, UDP or TCP ping, no remote RRDtool |
| `sqlite3` | An in-memory working table in the RRD splice tool | That tool falls back to PHP arrays and runs slower |

`gmp`, `intl` and `sqlite3` are guarded by a run-time check and have fallbacks.
The manifest requires them anyway, so a package build fails without them even
though the application would start.

### Checked by the installer

| Extension | Used for | Missing |
|---|---|---|
| `ctype` | Character class tests in input validation | Validation fails |
| `date` | Date and time handling | Nothing runs |
| `filter` | Request variable validation | Nothing runs |
| `gd` | Image generation | As above |
| `gmp` | As above | As above |
| `hash` | HMAC and constant-time comparison for tokens | Token and CSRF handling fail |
| `intl` | As above | As above |
| `json` | As above | As above |
| `ldap` | As above | As above |
| `mbstring` | As above | As above |
| `openssl` | As above | As above |
| `pcre` | Regular expressions | Nothing runs |
| `PDO` | As above | As above |
| `pdo_mysql` | As above | As above |
| `session` | Web sessions | No login |
| `simplexml` | XML parsing | Import, export and data query definitions fail |
| `sockets` | As above | As above |
| `spl` | Standard library interfaces | Nothing runs |
| `standard` | PHP's core function set | Nothing runs |
| `xml` | As above | As above |
| `zlib` | Compressing commands sent to a remote RRDtool | Remote RRDtool fails |

On Unix the list adds `posix` and `pcntl`. On Windows it adds `com_dotnet`
instead.

`date`, `pcre`, `spl`, `standard` and `json` are part of every supported PHP
build. They are checked so the report is explicit, not because they are commonly
absent.

Four names appear in the manifest and not in the installer check: `Phar`, `dom`,
`mysqlnd` and `sqlite3`. Ten appear in the installer check and not the manifest.
Satisfying one list does not satisfy the other.

### Optional

| Extension or feature | Used for | Absent |
|---|---|---|
| `snmp` | In-process SNMP | Kadupul runs the net-snmp command line tools instead |
| `gettext` | Translation catalogues | English only |
| TrueType support in `gd` | Text in the generated error image | The image renders without text |

The PHP SNMP extension can also be switched off in the configuration file while
installed. The installer advises against installing it where SNMPv3 over IPv6 is
required. Which path a given call takes is in [SNMP](/reference/snmp/).

### PHP settings

| Setting | Recommended | Status when unmet |
|---|---|---|
| `memory_limit` | 400 MB, or unlimited | Warning |
| `max_execution_time` | 60 seconds, or unlimited | Warning |
| `date.timezone` | Any real zone | Error. The check fails when it is unset |

CLI runs raise `memory_limit` and `max_execution_time` themselves. The web
interface does not.

The installer's own version check compares against a floor inherited from a much
older release and will pass on versions the manifest rejects. The manifest is the
gate that matters.

## Database

| Item | Requirement |
|---|---|
| Engine | MySQL or MariaDB |
| Version | The tuning check targets MySQL 5.6 and later, MariaDB 10.0 and later |
| Table engine | InnoDB for persistent tables |
| `poller_output` | MEMORY. The collector converts it back if it finds any other engine |
| Time zone tables | `mysql.time_zone_name` populated |
| Account grant | SELECT on `mysql.time_zone_name` |

An unpopulated or inaccessible time zone table is a hard error at install. The
reason is that collection timestamps are produced and converted by the database,
not by the device and not by PHP. See
[Time and intervals](/concepts/time-and-intervals/).

The installer also reports on a set of MySQL tuning variables. Those are advice,
not requirements, and the install proceeds without them.

## RRDtool

| Item | Requirement |
|---|---|
| Binary | Path set in the settings. Local, or reached through a remote RRDtool |
| Versions selectable | 1.3, 1.4, 1.5, 1.6, 1.7, 1.7.1, 1.7.2, 1.8 |
| 1.5 or later | Needed before `DCOUNTER` and `DDERIVE` are offered as data source types |

The configured version changes which arguments Kadupul emits. Setting it higher
than the installed binary produces command failures rather than a version warning.
Details are in [RRDtool integration](/reference/rrdtool-integration/).

A remote RRDtool replaces the local binary with a TCP connection and needs
`sockets` and `zlib` at both ends.

## net-snmp

Five binaries, each with its own path setting.

| Binary | Setting |
|---|---|
| `snmpget` | `path_snmpget` |
| `snmpgetnext` | `path_snmpgetnext` |
| `snmpwalk` | `path_snmpwalk` |
| `snmpbulkwalk` | `path_snmpbulkwalk` |
| `snmptrap` | `path_snmptrap` |

Required when the PHP SNMP extension is absent or switched off. Kadupul does not
bundle an SNMP implementation of its own.

## Web server

| Expectation | Detail |
|---|---|
| PHP execution | As a server module, or through FPM |
| URL prefix | Must match `$url_path` in the configuration file |
| Denied paths | Eleven directories must not be reachable over HTTP |
| Rewrite rules | None needed |

The eleven directories ship with `.htaccess` files that deny everything. nginx and
any Apache configured with `AllowOverride None` ignore those files entirely and
need equivalent rules in the server configuration. The list, and the reason each
one is on it, is in [File layout](/reference/file-layout/).

## Scheduler

The collector is started from outside. Nothing in the web interface starts it.

| Platform | Mechanism |
|---|---|
| Unix | cron, or the shipped systemd unit for the collector daemon |
| Windows | Task Scheduler |

The schedule has to match the configured polling interval. A mismatch produces a
graph full of gaps rather than an error.

## Filesystem

These are checked for writability at install, and on every run when the
installation is a remote data collector.

| Path | Written by |
|---|---|
| The system temporary directory | Several tools |
| `log/` | The application log |
| `cache/boost/` | Deferred RRD writes and cached images |
| `cache/mibcache/` | The MIB cache and its lock file |
| `cache/purifier/` | The HTML purifier's serializer cache |
| `cache/realtime/` | Per-session realtime graph files |
| `cache/spikekill/` | Spike removal working files |

`resource/snmp_queries/`, `resource/script_server/`, `resource/script_queries/`
and `scripts/` are checked at install, and on every run on a remote data
collector.

`rra/` is not in either list and is the one that matters most. Both the web
interface and the collector create RRD files there, so both accounts need to
write it.

### Ownership

| Case | Result |
|---|---|
| The creating process runs as root | The new file, and any new directory under a structured path layout, takes the owner and group of `rra/` |
| The creating process does not run as root | The file takes that process's own ownership, and nothing corrects it later |

An installation where the web interface and the collector run as different
unprivileged accounts will produce files one of them cannot update. Nothing
reports this; the symptom is a flat graph.

## Privilege

Raw ICMP needs a privileged socket. The ping path raises its effective user id to
zero for the duration of the socket and drops back afterwards. Where that is not
possible, ICMP is unavailable and reachability has to be checked over UDP, TCP, or
SNMP.

No other part of Kadupul requires privilege.

## On the PHP version

PHP 8.1 is the floor because that is what the version 1.2.x manifest declares. It is
not a recommendation. 8.1 reached end of security support in December 2025, so run
a supported release and treat the floor as the oldest thing that works, not the
right thing to deploy.
