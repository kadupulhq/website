---
title: Poller lifecycle
description: What happens on a poller run, in order, from the scheduler invoking poller.php to values landing in RRD files.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 4
---

Three programs are involved. `poller.php` is the parent: it decides what to run,
launches collector processes, and drains their output. The collector is either
`cmd.php` or the spine binary; it reads the poller cache, talks to devices, and
writes raw values to a database table. `process_poller_output_batch()` in `lib/poller.php`
coordinates the writer; `process_poller_output()` parses pending values into RRD
updates and tracks their acknowledgement.

This page describes `poller.php` with `cmd.php` as the collector. Spine follows the
same contract with the database.

This describes current-main behavior. The output retention and acknowledgement
path differs from the inherited Cacti 1.2.x implementation.

## Invocation

```
php -q /path/to/kadupul/poller.php [--poller=N] [--force] [--debug]
```

| Argument | Short | Effect |
|---|---|---|
| `--poller` | `-p` | Poller id to run as. Cast to an integer. Defaults to `$poller_id` from the config file. |
| `--force` | | Skip the too-soon check described below. |
| `--debug` | `-d` | Raise log verbosity and print loop timings. |
| `--version` | `-V`, `-v` | Print version and exit. |
| `--help` | `-H`, `-h` | Print usage and exit. |

Use one scheduler: cron/Task Scheduler or `cactid.php`. The daemon reads
`cron_interval` as its launch frequency. Match the configured scheduler interval
to the actual launcher; stop scheduled collection before a manual forced run.
`--force` bypasses the too-soon guard, not disabled-poller checks or writer
failures, and is not an overlap lock. See [Installation](/start/install/).

## Phase 1: startup

In order.

| Step | Detail |
|---|---|
| 1 | `include/cli_check.php` runs. A non-CLI SAPI gets HTTP 404. Memory limit and execution time are lifted. |
| 2 | Libraries load: `poller`, `data_query`, `rrd`, `dsstats`, `dsdebug`, `boost`, `reports`, `rrdcheck`. |
| 3 | A remote poller with an online connection switches its database handle to the main server. |
| 4 | If the `poller` table has no `dbhost` column, the install predates 1.0. The poller logs and exits 0. |
| 5 | Arguments are parsed. |
| 6 | The poller's own `hostname` and `dbhost` rows are filled in if blank, `localhost`, or `127.0.0.1`. |
| 7 | If more than one poller exists, `boost_rrd_update_system_enable` and `boost_redirect` are forced on. |
| 8 | `poller_enabled_check()`. If `poller_enabled` is off, or this poller's `disabled` flag is `on`, it updates `last_status` and exits 1. |
| 9 | Queue/storage preflight validates the InnoDB retry queue for the primary and online remote collectors, and local RRD storage for the primary. Failure exits 1 before collection. |
| 10 | `SIGTERM` and `SIGINT` handlers install. On signal they kill every process listed as running in `poller_time`, truncate that table, and exit. |
| 11 | Start time recorded. |
| 12 | `poller_table_maintenance()` creates `poller_output_boost`, `poller_output_boost_processes`, and `poller_output_realtime` if any is missing. |
| 13 | The `poller_top` plugin hook fires. |
| 14 | On an online connection, `update_resource_cache()` refreshes the resource cache for remote collectors. |

## Phase 2: timing decisions

| Value | Source |
|---|---|
| `poller_interval` | Setting. Seconds between collection passes. |
| `poller_lastrun_<id>` | Setting written by the previous run. |
| `poller_mibsrun_<id>` | Setting. If more than 14400 seconds old, this run collects system MIBs and the timestamp is updated. |
| `cron_interval` | Setting, coerced to 60 if it equals 60, otherwise to 300. |
| `max_step` | Largest `step` across data source profiles in use. |
| `concurrent_processes` | The poller row's `processes` column, falling back to the `concurrent_processes` setting. Floored at 1. |
| `process_leveling` | Setting. |

Derived:

```
poller_runs        = int(cron_interval / poller_interval)
MAX_POLLER_RUNTIME = poller_runs * poller_interval - 2
```

Use compatible settings: the launcher interval must be at least the collection
interval and an integer multiple of it. For example, 60/10 runs six collection
passes per invocation; 300/300 runs one. A 60-second launcher setting with a
300-second collection setting computes zero passes.

With no `poller_interval`, `poller_runs` is 1, the interval is 300, and
`MAX_POLLER_RUNTIME` is 298.

`active_profiles` is then computed and written back as a setting, because both
`cmd.php` and spine read it:

| Condition | `active_profiles` |
|---|---|
| `poller_interval != max_step` | Forced to 2 |
| `cron_interval == poller_interval` | Count of distinct `data_source_profile_id` in `data_template_data` with a local data id |
| Otherwise | Count of distinct `rrd_next_step` in `poller_item` |

When `active_profiles` is 1 every item is due on every pass, and the collector
skips the `rrd_next_step` arithmetic entirely.

Two guards follow:

| Guard | Behaviour |
|---|---|
| Running too often | If a previous run is recorded, `(start - lastrun) * 1.3 < MAX_POLLER_RUNTIME`, and `--force` was not given, log and exit 0 without a collection cycle. |
| Running too rarely | If a previous run is recorded and `start - lastrun - 10 > MAX_POLLER_RUNTIME`, log a warning and mail the primary admin. The run continues. |

`poller_lastrun_<id>` is then written, and `poller_lastrun` as well for poller 1.
PHP's execution limit is set to `MAX_POLLER_RUNTIME + 1` and its memory limit to
unlimited.

## Phase 3: pre-run housekeeping

| Step | Detail |
|---|---|
| 1 | `poller_item` rows for one `local_data_id` that disagree on `rrd_next_step` are set to the minimum of the group. Disagreement produces partial updates. |
| 2 | Distinct SNMP ports are counted into the `total_snmp_ports` setting, so spine can skip port-ordering work when there is only one. |
| 3 | `poller_item` rows are counted by action into the poller row's `snmp`, `script`, and `server` columns, and `status` is set to 1. |
| 4 | `poller_data_template_field_mappings` is refreshed. It maps a data input field name to the data source names it feeds, and `process_poller_output()` uses it to parse multi-value output. |

## Phase 4: the collection loop

Repeated `poller_runs` times. One pass is one collection cycle.

### Launch

| Step | Detail |
|---|---|
| 1 | Select device ids for this poller where `disabled` and `deleted` are both empty, ordered by id. Poller 1 prepends id 0, the bucket for data sources not attached to any device. |
| 2 | `path_webroot` is rewritten to this run's directory. |
| 3 | `max_threads` comes from the poller row, forced to 1 when `poller_type` is 1. |
| 4 | Rows in `poller_time` with no end time mean processes that overran the previous cycle. They are logged and the primary admin is mailed. All registry rows for this poller are then deleted; the warning itself does not terminate the old processes. |
| 5 | Inspect leftover `poller_output` rows, reporting up to 20 data source ids with debounced notification. Online remote pollers inspect rows older than 600 seconds; offline remote connections skip that inspection. An inspection failure exits 1 before launching collectors. |
| 6 | Retain valid pending samples for retry. Remove orphan rows whose data source/device no longer exists. Device-attached rows without matching cache entries expire only after `5 * max(60, poller_interval)` seconds, allowing temporary cache rebuilds. This path does not swap away the pending table. |
| 7 | If `poller_enabled` is off, the loop logs a warning and does nothing else. |
| 8 | `hosts_per_process = ceil(devices / concurrent_processes)`, excluding poller 1’s host-id-zero bucket. |
| 9 | If `poller_type` selects spine and `path_spine` does not exist, log, mail, and exit. |
| 10 | Build the command. Spine: the spine binary, plus `-C <path_spine_config>` when that file exists. Otherwise `<path_php_binary> -q cmd.php`. When `path_stderrlog` is set on a non-Windows host, stderr is appended to it. Remote pollers add `--mode=<connection>`. |
| 11 | Walk the device list, launching a background collector per chunk with `--poller=N --first=<id> --last=<id>`, and `--mibs` when this run collects MIBs. 100 ms between launches. |

With `process_leveling` on, a chunk closes when its accumulated data source count
reaches `total_items / concurrent_processes` rather than when its device count
reaches `hosts_per_process`. The device id 0 bucket never closes a chunk.

### Drain

Poller 1 sets the `date` setting. The batch helper opens the writer when output
is pending, obtains the writer lease for local storage, and bounds writes by the
parent deadline. It then loops:

| Condition | Action |
|---|---|
| Finished collectors < started | Call `process_poller_output_batch()` on pending output. If that pass took under a second, sleep one second. |
| Elapsed > `MAX_POLLER_RUNTIME` | Log, mail, send an SNMP notification, fire the `poller_exiting` hook, record stats, break. |
| Finished collectors >= started | Fire the `poller_finishing` hook, drain the remainder, record stats, break. |

"Finished" means a `poller_time` row with a non-zero `end_time`. A remote poller
whose connection is not online truncates `poller_output` instead of processing it.
Local writer batches close their pipe after processing. A proxy pipe can be
reused, and any remaining pipe is closed at the end of the loop.

### After the cycle

| Step | Detail |
|---|---|
| 1 | If `poller_command` holds rows for this poller, `poller_commands.php` runs in the background. Otherwise `stats_recache_<id>` is written with zeros. |
| 2 | `poller_push_data_to_main()` sends this poller's records upstream. |
| 3 | If the cycle finished inside `poller_interval` and more cycles remain: on poller 1, `snmpagent_poller_bottom()`, `dsstats_poller_bottom()`, `dsdebug_poller_bottom()`, and `boost_poller_bottom()` run; then the `poller_bottom` hook; then the process sleeps the remaining time, fires `poller_top`, and recounts polling items. |
| 4 | If the cycle overran `poller_interval`, that is logged and mailed, and no sleep happens. |

## Phase 5: the collector

`cmd.php`, once per launched process.

| Step | Detail |
|---|---|
| 1 | Parse `--poller`, `--first`, `--last`, `--mibs`, `--mode`, `--debug`. Reject a non-numeric or negative range, or a first id above the last. |
| 2 | `record_cmdphp_started()` inserts a `poller_time` row. This is how the parent counts processes. |
| 3 | A remote poller with no devices records completion and exits -1. |
| 4 | Read `poller_interval`, `cron_interval`, and `active_profiles`. |
| 5 | Select `poller_item` rows joined to `host` for this poller and host range, ordered by `host_id`. When `active_profiles` is not 1, restrict to `rrd_next_step <= 0`, then decrement `rrd_next_step` across the range so items on longer steps come due later. |
| 6 | If any selected item uses a PHP script action, start `script_server.php` over `proc_open` and keep it for the whole process. |
| 7 | For each item, in host order, do the work below. |
| 8 | Flush the last buffer, record the final device's polling time, shut down the script server, and log `Time`, `Poller`, `Devices`, `Items`, `Errors`. |
| 9 | Devices with no poller items at all are pinged for up and down status only. |
| 10 | `record_cmdphp_done()` sets `end_time` on the `poller_time` row. The database connection closes and the process exits 0. |

### Per item

| Step | Detail |
|---|---|
| On a device change | Flush buffered output, write the previous device's `polling_time`, log `Device[id] Time[s] Items[n] Errors[n]`, and log the failing data source ids when `spine_log_level` is 1. |
| On a new device | `ping_and_reindex_check()`. It pings by the device's availability method, calls `update_host_status()` with up or down, runs any reindex the data query's reindex method calls for, and collects system MIBs when `--mibs` was passed. |
| If the device is down | Skip every item for it. |
| If the device is up | Collect by action: SNMP directly, `exec_poll()` for a script, or `exec_poll_php()` through the script server for a PHP script. |
| Buffering | Append `(local_data_id, rrd_name, CURRENT_TIMESTAMP(), value)`. Flush to `poller_output` on device changes and when the buffer counter exceeds 2000. When `boost_redirect` and `boost_rrd_update_enable` are both on, the same rows also go to `poller_output_boost`. |
| Overrun | If elapsed time passes `poller_interval`, log and stop the loop. |

When the SNMP restart check sets spike suppression, single-value output is
replaced with `U`. Multi-value output has separate parsing; this is not a blanket
guarantee that every restart-related counter spike is suppressed.

## Phase 6: output to RRD

`process_poller_output_batch()` runs inside the parent on poller 1 during the
drain loop. A busy maintenance lease, failed writer startup, failed queue query,
or unacknowledged write defers work. Background retries are bounded; the final
drain bypasses the retry delay. Deferred writes or cleanup failures make the
parent exit 1 after end-of-run work.

| Step | Detail |
|---|---|
| 1 | Join pending rows to `poller_item` by data source id and field name, and to `data_local`. Read pages ordered by data source id, timestamp and field name, normally 40000 rows; extend a page to complete its final timestamp group. |
| 2 | Load field mappings and assemble updates by RRD path and timestamp. Incomplete groups remain pending rather than being written short. |
| 3 | Ask `boost_poller_on_demand()` whether to write directly or hand off to Boost. A failed handoff retains the rows. |
| 4 | For direct writes, track acknowledgement per path and timestamp. Unacknowledged samples remain pending; later pages do not advance that path past retained samples. Terminal rejections have separate bounded rejection handling. |
| 5 | Publish direct-write data-source statistics, debug data and the `poller_output` hook only for accepted samples, so retrying retained writes does not replay those side effects. |
| 6 | Delete consumed rows using their exact data source, field, timestamp and output values. Incomplete or unparseable groups older than `5 * max(60, poller_interval)` seconds are logged and expired. Continue through the remaining pages. |

An empty queue and a successful parent exit are different observations. Check
both the exit status and writer diagnostics; a poller summary alone does not
prove that every RRD update succeeded.

### Value parsing

| Input form | Result |
|---|---|
| Numeric | Stored as the value for `rrd_name`. |
| `U` with a non-empty `rrd_name` | Stored as unknown. |
| Hexadecimal | Converted to decimal. Values over 8 hex digits on a 32-bit build use bcmath; without bcmath the value becomes `U`. |
| Contains `:` | Multi-value. Each `name:value` pair maps through the field mapping to a data source name. A non-numeric value becomes `U`. Data source names no graph item references are skipped. |
| Anything else | Logged as `Invalid output! MULTI DS[...]` with the expected field list, and every expected field is written as `U`. |

### Pending and rejected samples

Pending output is retry state, not disposable scratch data. Do not empty the
queue to hide a writer error. Investigate the writer, storage permissions and
maintenance state first. `poller_output_rejected` holds bounded terminal-rejection
records; it is distinct from the retry queue. These database queues are not a
backup or a promise of unlimited retention.

## Phase 7: end of run

Poller 1, in order: `multiple_poller_boost_check()`, `poller_replicate_check()`,
`snmpagent_poller_bottom()`, `boost_poller_bottom()`, `dsstats_poller_bottom()`,
`dsdebug_poller_bottom()`, `reports_poller_bottom()`, `spikekill_poller_bottom()`,
`automation_poller_bottom()`, `poller_maintenance()`, `rrdcheck_poller_bottom()`,
the `poller_bottom` hook, `bad_index_check()`, `host_status_cache_check()`,
`poller_heartbeat_check()`.

Other pollers: flush boost if the connection is in recovery, then
`automation_poller_bottom()`, `poller_maintenance()`, and the `poller_bottom` hook.

| Function | What it does |
|---|---|
| `bad_index_check()` | Only on a MIB run. Reports devices with active data sources whose `snmp_index` is empty. |
| `host_status_cache_check()` | Hashes the device status distribution and, when it differs from last time, updates `time_last_change_device` and `time_last_change_site_device`. |
| `poller_heartbeat_check()` | Marks any enabled poller whose `last_status` is older than twice the poller interval with status 6, logs it, and mails the primary admin at most once every 1800 seconds. |

## Tables the run touches

| Table | Role |
|---|---|
| `poller` | One row per data collector. Holds process and thread counts, item counts by type, status, and last status time. |
| `poller_item` | The poller cache. One row per value to collect, with the RRD path, RRD name, action, and step scheduling. |
| `poller_time` | Process registry for the current cycle. A row with no end time is a running collector. |
| `poller_output` | InnoDB queue of raw values awaiting processing or retry. Successful draining normally empties it; failed writes can leave valid samples between cycles. |
| `poller_output_rejected` | Bounded records of terminally rejected output. |
| `poller_output_boost` | The same values written for boost to consume. |
| `poller_command` | Queued reindex and recache work, drained by `poller_commands.php`. |
| `poller_data_template_field_mappings` | Data input field name to data source name, used to parse multi-value output. |
| `host` | Device status, last polling time. |
| `data_local` | Links a data source to its device, data template, data query, and index. |
