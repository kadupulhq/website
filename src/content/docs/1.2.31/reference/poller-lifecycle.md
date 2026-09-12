---
title: Poller lifecycle
description: What happens on a poller run, in order, from the scheduler invoking
  poller.php to values landing in RRD files.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 4
slug: 1.2.31/reference/poller-lifecycle
---

Three programs are involved. `poller.php` is the parent: it decides what to run,
launches collector processes, and drains their output. The collector is either
`cmd.php` or the spine binary; it reads the poller cache, talks to devices, and
writes raw values to a database table. `process_poller_output()` in `lib/poller.php`
turns those raw values into RRD updates.

This page describes `poller.php` with `cmd.php` as the collector. Spine follows the
same contract with the database.

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
| 9 | `SIGTERM` and `SIGINT` handlers install. On signal they kill every process listed as running in `poller_time`, truncate that table, and exit. |
| 10 | Start time recorded. |
| 11 | `poller_table_maintenance()` creates `poller_output_boost`, `poller_output_boost_processes`, and `poller_output_realtime` if any is missing. |
| 12 | The `poller_top` plugin hook fires. |
| 13 | On an online connection, `update_resource_cache()` refreshes the resource cache for remote collectors. |

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
poller_runs        = cron_interval / poller_interval
MAX_POLLER_RUNTIME = poller_runs * poller_interval - 2
```

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
| Running too often | If a previous run is recorded, `(start - lastrun) * 1.3 < MAX_POLLER_RUNTIME`, and `--force` was not given, log and exit. |
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
| 4 | Rows in `poller_time` with no end time mean processes that overran the previous cycle. They are logged and the primary admin is mailed. Completed rows are deleted. |
| 5 | Leftover `poller_output` rows for this poller are logged (first 20 data source ids), mailed, and deleted. On a remote poller only rows older than 600 seconds count, because other collectors insert asynchronously. Data left here means a previous cycle never got a complete set of values for those data sources. |
| 6 | On poller 1 with `poller_refresh_output_table` on and only one poller, `poller_output` is swapped for a fresh table and converted back to the MEMORY engine if the swapped-in copy is not already MEMORY. |
| 7 | If `poller_enabled` is off, the loop logs a warning and does nothing else. |
| 8 | `hosts_per_process = ceil(devices / concurrent_processes)`. |
| 9 | If `poller_type` selects spine and `path_spine` does not exist, log, mail, and exit. |
| 10 | Build the command. Spine: the spine binary, plus `-C <path_spine_config>` when that file exists. Otherwise `<path_php_binary> -q cmd.php`. When `path_stderrlog` is set on a non-Windows host, stderr is appended to it. Remote pollers add `--mode=<connection>`. |
| 11 | Walk the device list, launching a background collector per chunk with `--poller=N --first=<id> --last=<id>`, and `--mibs` when this run collects MIBs. 100 ms between launches. |

With `process_leveling` on, a chunk closes when its accumulated data source count
reaches `total_items / concurrent_processes` rather than when its device count
reaches `hosts_per_process`. The device id 0 bucket never closes a chunk.

### Drain

Poller 1 sets the `date` setting and opens a pipe to RRDtool with `rrd_init()`.
Then it loops:

| Condition | Action |
|---|---|
| Finished collectors \< started | Call `process_poller_output()` on whatever has arrived so far. If that pass took under a second, sleep one second. |
| Elapsed > `MAX_POLLER_RUNTIME` | Log, mail, send an SNMP notification, fire the `poller_exiting` hook, record stats, break. |
| Finished collectors >= started | Fire the `poller_finishing` hook, drain the remainder, record stats, break. |

"Finished" means a `poller_time` row with a non-zero `end_time`. A remote poller
whose connection is not online truncates `poller_output` instead of processing it.
Poller 1 closes the RRDtool pipe when the loop ends.

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
| Buffering | Append `(local_data_id, rrd_name, CURRENT_TIMESTAMP(), value)`. Flush to `poller_output` at 2000 rows. When `boost_redirect` and `boost_rrd_update_enable` are both on, the same rows also go to `poller_output_boost`. |
| Overrun | If elapsed time passes `poller_interval`, log and stop the loop. |

A device whose SNMP agent restarted mid-cycle has `U` written in place of the
value, so the RRA records unknown rather than a false reading.

## Phase 6: output to RRD

`process_poller_output()` runs inside the parent, on poller 1, repeatedly during
the drain loop.

| Step | Detail |
|---|---|
| 1 | Select up to 40000 rows joining `poller_output` to `poller_item` and `data_local`, ordered by `local_data_id`. This brings `rrd_path`, `rrd_name`, and `rrd_num` alongside the value. |
| 2 | Load `poller_data_template_field_mappings` once per process. |
| 3 | Parse each value into an update array keyed by RRD path and then by timestamp. |
| 4 | Discard any timestamp where the number of parsed values is below that data source's `rrd_num`. A partial set waits for the rest rather than writing a short update. |
| 5 | Delete the consumed `poller_output` rows, in batches of 10000 data source ids. |
| 6 | `dsstats_poller_output()` and `dsdebug_poller_output()` run, then the `poller_output` plugin hook. |
| 7 | `boost_poller_on_demand()` decides where the values go. With boost off it returns true and `rrdtool_function_update()` writes the RRD files now, through the pipe the parent opened. With boost on the values are handed to the boost table and written later. |
| 8 | If rows remain, the function calls itself for the next chunk. |

### Value parsing

| Input form | Result |
|---|---|
| Numeric | Stored as the value for `rrd_name`. |
| `U` with a non-empty `rrd_name` | Stored as unknown. |
| Hexadecimal | Converted to decimal. Values over 8 hex digits on a 32-bit build use bcmath; without bcmath the value becomes `U`. |
| Contains `:` | Multi-value. Each `name:value` pair maps through the field mapping to a data source name. A non-numeric value becomes `U`. Data source names no graph item references are skipped. |
| Anything else | Logged as `Invalid output! MULTI DS[...]` with the expected field list, and every expected field is written as `U`. |

### The once-per-run integrity check

The first time a recursive pass finds no collector processes running, the parent
also deletes `poller_output` rows whose `local_data_id` no longer exists in
`data_local`, and reports data sources whose distinct value count never matches
`rrd_num`. Those rows are deleted too, grouped by data template, with the template
named in the log.

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
| `poller_output` | Raw collected values awaiting parsing. Normally a MEMORY table, and normally empty between cycles. |
| `poller_output_boost` | The same values written for boost to consume. |
| `poller_command` | Queued reindex and recache work, drained by `poller_commands.php`. |
| `poller_data_template_field_mappings` | Data input field name to data source name, used to parse multi-value output. |
| `host` | Device status, last polling time. |
| `data_local` | Links a data source to its device, data template, data query, and index. |
