---
title: Spine, the C collector
description: What Spine is, how it differs from the PHP collector, the configuration it reads, its threading model, and when it is worth installing.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 15
---

Spine is a collector written in C. It does the same job as `cmd.php`: read the
poller cache, talk to devices, write raw values into a database table. It does that
job with threads rather than with more processes.

**Spine is not part of Kadupul.** It is a separate project,
spine,
licensed LGPL-2.1-or-later. Kadupul does not ship it. What
Kadupul provides is compatibility: the contract between the parent poller and the
collector is a command line and a set of database tables, and Kadupul keeps its half
of that contract so an existing Spine build keeps working.

Everything on this page describes either Kadupul's side of that contract
or behaviour read from the Spine source. Where a fact is Spine's
rather than Kadupul's, it can change without Kadupul knowing.

## Selecting it

The `poller_type` setting chooses the collector.

| Value | Collector |
|---|---|
| 1 | `cmd.php` |
| 2 | `spine` |

Option 2 is removed from the dropdown when `path_spine` is set but the file it names
is missing or not executable, so the setting cannot normally be pointed at a binary
that is not there. `poller.php` checks again at the start of every run: if
`poller_type` is 2 and `path_spine` does not exist, it logs, mails the primary admin,
and exits without collecting.

Two path settings matter.

| Setting | Meaning |
|---|---|
| `path_spine` | The Spine binary. |
| `path_spine_config` | The Spine configuration file. Optional. |

Both live under Alternate Poller Path on the Paths settings tab. See
[Configuration](/reference/configuration/).

## How the poller invokes it

`poller.php` builds one command per process chunk and launches it in the background.
With Spine selected:

```
<path_spine> [-C <path_spine_config>] --poller=<id> --first=<id> --last=<id> [--mibs]
```

`-C` is added only when `path_spine_config` is set and the file exists. On a remote
collector, `--mode=<connection>` is appended, carrying online, offline, or recovery.
When `path_stderrlog` is set on a non-Windows host, the process has its stderr
appended to that file.

Before launching, `poller.php` changes its working directory to the directory holding
the Spine binary, and changes back to `path_webroot` after the launch loop. The first
of those matters because of how Spine finds its configuration file, below.

The parent waits 100 ms between launches and then drains `poller_output` exactly as it
would for `cmd.php`. See [Poller lifecycle](/reference/poller-lifecycle/) for the
surrounding run.

## Command line

From `spine --help`:

| Option | Effect |
|---|---|
| `-h`, `--help` | Print the help listing. |
| `-f`, `--first=X` | Start polling at device id X. |
| `-l`, `--last=X` | Stop polling at device id X. |
| `-H`, `--hostlist=X` | Poll a comma separated list of device ids. |
| `-p`, `--poller=X` | Run as poller id X. |
| `-t`, `--threads=X` | Override the thread count held in the database. |
| `-C`, `--conf=F` | Read configuration from file F. |
| `-O`, `--option=S:V` | Override the database setting S with value V. |
| `-M`, `--mibs` | Refresh device system MIB data. |
| `-N`, `--mode=online` | Remote collector operating mode: online, offline, or recovery. |
| `-R`, `--readonly` | Collect, but write no output to the database. |
| `-S`, `--stdout` | Log to standard output. |
| `-P`, `--pingonly` | Ping and update device status only. |
| `-V`, `--verbosity=V` | NONE, LOW, MEDIUM, HIGH, DEBUG, or 1 to 5. |

Either both of `--first` and `--last`, or a `--hostlist`, selects a subset. With
neither, Spine processes every device.

`--readonly` is the option worth knowing about when diagnosing: it collects without
writing results, so it can be run against a live install without disturbing it.

## Configuration, from two places

Spine reads its settings from two sources, and the split is the part that surprises
people. Credentials come from a file. Everything else comes from the database.

### The configuration file

The file holds database connection details and little else. Without `-C`, Spine
searches, in order: the current directory, `/etc/`, `/etc/cacti/`, then `../etc/`, for
`spine.conf`. This is why `poller.php` changes directory to the binary's directory
before launching it.

The distributed file documents these keys:

| Key | Meaning |
|---|---|
| `DB_Host` | Hostname, or a socket path on Unix. |
| `DB_Database` | Database name. |
| `DB_Port` | Database port. |
| `DB_User` | Database user. |
| `DB_Pass` | Database password. |
| `DB_UseSSL`, `DB_SSL_Key`, `DB_SSL_Cert`, `DB_SSL_CA` | TLS to the database. |
| `SNMP_Clientaddr` | Bind SNMP to a specific local address. |
| `Cacti_Log` | Path to the log file. |
| `RDB_Host`, `RDB_Database`, `RDB_Port`, `RDB_User`, `RDB_Pass`, `RDB_UseSSL`, `RDB_SSL_Key`, `RDB_SSL_Cert`, `RDB_SSL_CA` | The same set for the central database, used by a remote collector. |

A remote collector holds both: `DB_*` names its own local database, `RDB_*` names the
central one. That mirrors the two connections described in
[Remote data collection](/concepts/remote-data-collection/).

### The settings table

Everything else is read from the `settings` table, which is what the web interface
writes. Configuring the poller in the interface configures Spine.

| Setting | Used for |
|---|---|
| `availability_method`, `ping_method`, `ping_retries`, `ping_timeout`, `ping_failure_count`, `ping_recovery_count` | Reachability checks. |
| `snmp_retries`, `max_get_size` | SNMP behaviour. Spine caps `max_get_size` at 128 and falls back to 25 when it is not set. |
| `poller_interval`, `active_profiles`, `total_snmp_ports` | What to poll and when. |
| `concurrent_processes` | How many sibling processes exist, used to pace thread sleeps. |
| `script_timeout` | Script and script server timeout. Floor of 5 seconds, default 25. |
| `php_servers` | Script server processes per Spine process. Clamped to the range 1 to 15, with a fallback of 2 when the setting is absent. |
| `path_php_binary` | The interpreter for the script server. |
| `log_verbosity`, `log_destination`, `path_cactilog`, `log_perror`, `log_pwarn`, `log_pstats`, `spine_log_level`, `selective_device_debug` | Logging. |
| `default_datechar`, `default_date_format` | Log timestamp format. |
| `boost_redirect`, `boost_rrd_update_enable` | Whether to also write to `poller_output_boost`. |
| `path_webroot` | Locating scripts. |

The thread count is the exception: it is read from the `threads` column of this
collector's row in the `poller` table, not from `settings`, and Spine caps that value at
100. `--threads` on the command line is read before the database and suppresses the
lookup entirely.

Spine also writes one setting back. After probing which SNMP authentication and
privacy protocols its Net-SNMP build supports, it stores the answer in `settings` under
`spine_capabilities`, so the interface can offer only protocols that will work.

## Threads against processes

The PHP collector and Spine divide work at different levels.

| | `cmd.php` | Spine |
|---|---|---|
| Unit the parent hands out | A contiguous range of device ids | The same |
| Parallelism inside a process | None | One thread per device, bounded by a semaphore |
| Thread setting | Overwritten with 1 at the start of every run | Honoured, capped at 100 |
| Script servers per process | One, not configurable | `php_servers`, 1 to 15 |
| Script timeout | Not applied | Applied |
| Database connections per process | 1 | 1, plus one per thread, plus one per script server |
| Distribution | Ships with the code | Built and installed separately |

Spine starts a thread per device and a semaphore holds the number of running threads
at the configured limit. A device whose `device_threads` column is greater than 1 gets
that many threads instead of one, with its poller items divided between them, so a
single large device is not stuck behind one thread. Spine reduces `device_threads` to
the device's poller item count when the device has fewer items than threads, and to 1
when the run is ping only.

Each thread opens its own database connection out of a pool sized to the thread count.
This is where the connection arithmetic in
[Scale the poller](/guides/scale-the-poller/) comes from, and it is the first limit a
large thread count runs into.

Everything above is per process. Processes are still allocated by `poller.php` in
contiguous device id ranges, so a single device never spans two processes no matter
which collector is in use.

## What it writes

Spine's output contract is the database, not RRD files. It never calls RRDtool and
never talks to the [RRD proxy](/reference/rrdproxy/).

| Table | What goes in it |
|---|---|
| `poller_output` | One row per collected value. |
| `poller_output_boost` | The same rows again when `boost_redirect` and `boost_rrd_update_enable` are both on. |
| `poller_item` | `rrd_next_step` bookkeeping, so items on a longer step come due on a later cycle. |
| `host` | Reachability, error state, availability counters, and system MIB values on a `--mibs` run. |
| `poller_time` | A row per process, which is how the parent counts started and finished collectors. |

`process_poller_output()` in the parent turns those rows into RRD updates. That code
does not know or care which collector produced them.

## Reachability and privileges

Spine performs its own reachability checks rather than shelling out. It implements ICMP,
UDP, TCP, TCP-to-a-closed-port, and SNMP, selected per device by the availability and
ping method settings.

ICMP needs a raw socket, which needs privilege. The upstream install instructions have
the binary owned by root and set-user-id. On Linux builds with libcap support, Spine
drops to the invoking user and retains only `cap_net_raw` rather than staying root for
the whole run.

That is a set-user-id binary reading database credentials from a file. Both halves of
that deserve the treatment in [Security model](/concepts/security-model/): the
configuration file holds a password and should be readable only by the account the
poller runs as.

A Windows note from upstream: Windows has no TCP socket send timeout, so TCP ping
there does not retry, and the first failure marks the device down.

## When it is chosen

Spine is worth the install when the run time problem is waiting rather than computing.

Reach for it when:

- Devices are slow to answer and the run time is dominated by round trips. Threads
  overlap waiting; processes do too, but at much higher cost each.
- A single device is large enough to be the long pole. Per-device threads are the only
  mechanism that divides one device, and they are Spine only.
- The process count needed with `cmd.php` is above roughly twice the CPU core count,
  which is the point where more PHP processes stop helping.

Stay on `cmd.php` when:

- Run times are comfortably inside the interval. There is nothing to buy.
- The database connection limit is already tight. Threads multiply connections.
- You do not want a compiled dependency to track separately from the application.

The [Scale the poller](/guides/scale-the-poller/) guide walks the measurement that
decides this, rather than guessing from device count.

## Building it

Upstream builds with Autotools:

```sh
./bootstrap
./configure
make
make install
```

Then set `path_spine` to the installed binary, put a configuration file where Spine
will find it, and set `poller_type` to Spine. Upstream's README carries the current
instructions, the privilege setup, and the Windows procedure. Kadupul does not restate
them, because Kadupul does not build Spine and cannot keep the copy accurate.

## What compatibility means here

Kadupul's promise is that the interface Spine expects does not move: the `poller_type`
and path settings, the command line above, the settings Spine reads, and the shape of
`poller_output`, `poller_item`, `poller_time`, and `host`. See
[Compatibility](/project/compatibility/).

It is not a promise that any particular Spine version works, and it is not a support
relationship. A Spine defect is an upstream defect and belongs in
the Spine project. If Kadupul breaks the contract, that is
Kadupul's defect and gets written down.
