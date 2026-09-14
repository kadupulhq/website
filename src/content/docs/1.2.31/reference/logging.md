---
title: Logging
description: Where the Kadupul log goes, what each verbosity level includes, how
  selective debug and rotation work, and why the poller output is not the log.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 9
slug: 1.2.31/reference/logging
---

Kadupul has one application log. Everything the web interface, the poller and
the maintenance scripts have to say goes through a single function and lands in
one file, optionally also in syslog. Inherited from Cacti 1.2.x.

## Destinations

| Setting | Default | Holds |
|---|---|---|
| `path_cactilog` | `<base path>/log/cacti.log` | The application log. |
| `path_stderrlog` | `<base path>/log/cacti_stderr.log` | Standard output and standard error of collector processes. |
| `log_destination` | `1` | Where log lines go. |

`log_destination`:

| Value | Meaning |
|---|---|
| 1 | Logfile only |
| 2 | Logfile and syslog or eventlog |
| 3 | Syslog or eventlog only |

An empty `path_cactilog` falls back to `<base path>/log/cacti.log` rather than
disabling the log.

## Line format

```
2026-09-10 14:02:17 - WEBUI NOTE: some message text
```

| Part | Source |
|---|---|
| Timestamp | `CACTI_DATE_TIME_FORMAT` when defined, otherwise `Y-m-d H:i:s`. Written in the system timezone, not the browser's. |
| Environment | The `environ` argument, defaulting to `CMDPHP`. |
| Message | The caller's text, with line breaks collapsed. |

Poller lines carry more:

```
2026-09-10 14:02:17 - POLLER: Poller[1] PID[28114] some message text
```

A message that is empty or only whitespace is discarded before anything else
happens.

### Environment tags

The tag is a free string, so plugins add their own. The ones a stock install
produces most often:

| Tag | Written by |
|---|---|
| `POLLER` | `poller.php` and the collectors. |
| `CMDPHP` | Default for anything that does not set a tag. |
| `WEBUI` | The web interface. |
| `AUTH`, `SECURITY` | Login, session and permission events. |
| `SYSTEM` | Maintenance and system-level events. |
| `BOOST` | The boost RRD update path. |
| `AUTOM8` | Automation and discovery. |
| `IMPORT`, `UPGRADE` | Template import and database upgrade. |
| `MAINT` | `poller_maintenance.php`, including log rotation. |
| `SNMP`, `PING` | Collection protocol failures. |
| `REPLICATE` | Remote data collector synchronisation. |
| `DBCALL`, `DSTRACE`, `DSDEBUG` | Developer diagnostics. |

Tags matter because the log viewer's filters match on message text, not on the
tag. Filtering by tag means filtering on the string.

## Verbosity

`log_verbosity`, defaulting to `2`:

| Value | Name | Includes |
|---|---|---|
| 1 | NONE | Nothing in the logfile. Syslog only, if selected. |
| 2 | LOW | Statistics and errors. |
| 3 | MEDIUM | Statistics, errors and results. |
| 4 | HIGH | Statistics, errors, results and major I/O events. |
| 5 | DEBUG | Statistics, errors, results, I/O and program flow. |
| 6 | DEVEL | Developer debug level. |

Each `cacti_log()` call may carry a level. The rules:

* A call with no level is always logged.
* At verbosity 1 through 5, a call is logged when its level is at or below the
  configured verbosity.
* Setting `log_verbosity` to `1` suppresses the logfile completely, whatever
  level individual calls carry. Syslog is unaffected.

DEVEL is not a superset. At verbosity 6, calls tagged DEVEL are logged and calls
at LOW or below are logged, but calls tagged MEDIUM, HIGH and DEBUG are
suppressed. DEVEL is a separate channel for developer tracing, not one more step
up the ladder.

Anything above LOW fills a disk quickly on a system of any size. The setting's
own description says so.

## Syslog

Reached when `log_destination` is `2` or `3`. Classification is by substring
match on the message, then by whether that class is enabled:

| Substring in message | Class | Setting | Default | Syslog priority |
|---|---|---|---|---|
| `ERROR:` | error | `log_perror` | on | `LOG_CRIT` |
| `WARNING:` | warning | `log_pwarn` | off | `LOG_WARNING` |
| `STATS:` | statistic | `log_pstats` | off | `LOG_INFO` |
| `NOTICE:` | notice | `log_pstats` | off | `LOG_INFO` |

A message carrying none of those four markers never reaches syslog, at any
destination setting. Messages are logged under the identifier `Cacti`, with
facility `LOG_SYSLOG` on Unix and `LOG_USER` on Windows.

## Selective debug

Three settings raise the level for part of the system without raising it
globally. Use these instead of turning the whole log to DEBUG.

| Setting | Selects by | Effect |
|---|---|---|
| `selective_debug` | File name | Every call from the named files is treated as DEBUG. |
| `selective_plugin_debug` | Plugin directory | Every call from a file under the named plugin is treated as DEBUG. |
| `selective_device_debug` | Device id | Every call about the named devices is logged during collection. |

`selective_debug` and `selective_plugin_debug` are multi-select lists in the
interface. The matched level is computed once per process and cached, so a change
takes effect on the next poller run, not mid-run.

### Selective device debug

`selective_device_debug` is a comma-separated list of device ids held in one
setting, and the form caps the field at 30 characters. That leaves room for a
handful of devices; it is a troubleshooting tool, not a policy.

During collection, `cmd.php` replaces the log level of every message about a
listed device with `POLLER_VERBOSITY_NONE`, which is the lowest value and so
always passes the verbosity gate. The effect is that one device is logged in
full while the rest of the system stays at its configured level.

It applies during collection only. The web interface does not consult it.

Add and remove devices from the device list actions rather than by editing the
setting text, which keeps the list well formed.

## Rotation

Rotation is done by `poller_maintenance.php`, not by the system logrotate, unless
you turn it off.

| Setting | Default | Meaning |
|---|---|---|
| `logrotate_enabled` | on | Rotate at all. |
| `logrotate_frequency` | `1` | `1` daily, `7` weekly, `30` monthly. |
| `logrotate_retain` | `7` | Rotated files to keep. `0` never removes any. Values are clamped to 0 through 365. |

Both `path_cactilog` and `path_stderrlog` are rotated.

The rotated name is the log path with yesterday's date appended:

```
cacti.log-20260909
cacti.log-20260909-1
```

The `-1` form appears when the first name already exists, counting up to 99.

Rotation preserves the original file's owner, group and permissions on the new
empty file. It logs a `LOGMAINT STATS:` line recording how many files were
rotated and removed.

Setting `$disable_log_rotation = true;` in `config.php` skips the built-in
rotation entirely, which is the option to use when a distribution package
installs its own `logrotate.d` rule. It is a file setting, not a database
setting, so a packager can set it without touching a running install's data.

When rotation cannot proceed it says why rather than failing silently. A missing
file logs "Skipped missing"; an unwritable file or directory logs a permissions
error naming the path.

## The log viewer

The interface reads the file from the end. The filters match on message text:

| Value | Filter | Matches on |
|---|---|---|
| -1 | All | everything |
| 1 | Stats | `STATS` |
| 2 | Warnings | `WARN` |
| 3 | Warnings++ | `WARN`, `ERROR`, `DEBUG`, ` SQL` |
| 4 | Errors | `ERROR` |
| 5 | Errors++ | `ERROR`, `DEBUG`, ` SQL` |
| 6 | Debug | `DEBUG`, excluding `SQL` |
| 7 | SQL Calls | `SQL` |
| 8 | AutoM8 | `AUTOM8` |
| 9 | Non Stats | everything without `STATS` |
| 10 | Boost | `BOOST` |
| 11 | Device Up/Down | `HOST EVENT`, `] is recovering!`, `] is down!` |
| 12 | Recaches | `ASSERT FAILED`, `Recache Event` |

These are substring tests against the whole line. A message containing the word
`ERROR` anywhere shows under Errors regardless of what wrote it.

| Setting | Default | Effect |
|---|---|---|
| `log_refresh_interval` | 60 seconds | How often the tail view refreshes. |
| `clog_exclude` | empty | Regular expression whose matches are hidden from the viewer. Hides lines from display; does not stop them being written. |

The "All Lines" choice in the viewer is capped by a separate setting, defaulting
to 1000 lines, so "all" means "the last thousand" unless that is raised.

## The application log is not the poller output

Three different things get called "the poller log". They are separate.

| Thing | Where | Contains |
|---|---|---|
| Application log | `path_cactilog` | Text messages from every part of the system, including the poller's own statistics and errors. |
| Collector standard error | `path_stderrlog` | Whatever the collector processes write to stdout and stderr. |
| Poller output | `poller_output` table | Collected values on their way into RRD files. Not text, not a log, and deleted as soon as it is consumed. |

A missing value shows up in all three differently. `poller_output` will simply
have no row for it. The application log will carry a `WARNING:` at whatever
verbosity that failure was logged at, often `HIGH`. The standard error log will
have anything a script printed on the way out, which is the only place a fatal
error inside a collection script is visible.

The standard error redirect is appended with `>>` and only set up on non-Windows
systems, and only when `path_stderrlog` is non-empty. On Windows, collector
output is discarded.

`spine_log_level` controls how much the spine collector says about values it
could not use:

| Value | Meaning |
|---|---|
| 0 | None. No error counts. |
| 1 | Summary. Count of output errors per device. |
| 2 | Detailed. Every error. |

It defaults to `0`, so invalid data is silent until you raise it.
