---
title: Error and log messages
description: The error, warning and fatal strings Kadupul writes to its log,
  what each one means, and where to look next.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 20
slug: 1.2.31/reference/messages
---

:::caution[Planned interface]
The Kadupul labels on this page describe the pending
[application branding change](https://github.com/kadupulhq/kadupul/pull/13).
They are not the literal output of the current main branch or the archived
1.2.31 source. Configuration keys and other technical identifiers are unchanged.
:::


Use this reference to interpret application log messages. Search for a distinctive
phrase in your message; product labels vary between builds.

For where the log lives, the line format, verbosity levels, selective debug and
rotation, read [Logging](/1.2.31/reference/logging/). This page is the message list
only.

## How to read these tables

Messages are normalized patterns, not verbatim quotations. `<application>` stands
for the product label printed by your build. Other `<name>` placeholders represent
values interpolated at runtime. Search for the text surrounding placeholders.
Technical identifiers, including log filenames and function names, remain unchanged.

The subsystem headings follow the log's environment tag, which is the word after
the timestamp on each line.

## Coverage

The tables cover severity-marked application messages and selected interface
notifications. Related end-of-run statistics messages share a row.

They do not cover:

* Informational and debug lines that carry no severity marker.
  Most appear only above the low verbosity level and describe normal progress.
* Messages from Spine, which is a separate C program with its own log format.
  See [Spine](/1.2.31/reference/spine/).
* Messages from plugins, which write through the same function with their own
  environment tag.
* PHP's own warnings and fatals, which go to the web server error log, not here.

Interface messages, the coloured banners the web interface shows after an
action, come from a separate registry of 83 entries. All 83 are listed at the
end of this page.

## Poller

Tag `POLLER`. Written by `poller.php`, `cmd.php`, and the poller library.

### Startup and shutdown

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: The <application> Data Collector is currently disabled!` | `poller_enabled` is off. | Settings, Poller tab. |
| `WARNING: System Polling is Disabled!  Therefore, data collection from the poller will be suspended till re-enabled.` | Same condition, reported by the master poller. | Settings, Poller tab. |
| `WARNING: Poller <id> is Disabled.  Therefore, data collection for this Poller will be suspended till it's re-enabled.` | One data collector is disabled while others run. | The collector's own record under Data Collectors. |
| `ERROR: The spine path: <path> is invalid.  Poller can not continue!` | `poller_type` selects spine and `path_spine` does not point at an executable file. | `path_spine` in Settings, Paths. |
| `FATAL: The first host in the host range is invalid!` | `cmd.php` was given a non-numeric or out of range first host argument. | The command line that started `cmd.php`. |
| `FATAL: The last host in the host range is invalid!` | Same, for the last host argument. | The command line. |
| `FATAL: The first host must always be less or equal to the last host!` | The host range runs backwards. | The command line. |
| `FATAL: The poller needs to be a positive numeric value` | `cmd.php` was given a bad poller id. | The command line. |
| `WARNING: <application> Master Poller process terminated by user` | The master poller caught an interrupt or termination signal. | Expected after Ctrl-C or a service stop. |
| `WARNING: <application> Poller process terminated by user` | A `cmd.php` child caught the same. | As above. |
| `WARNING: Termination poller process with pid '<pid>'` | The master is killing a child during shutdown. | As above. |
| `WARNING: <application> Daemon PID[<pid>] Terminated on Device[<hostname>]` | The `cactid` service process exited. Tag `CACTID`. | The service unit and the system log. |

### Timing and overrun

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: <application> Polling Cycle Exceeded Poller Interval by <seconds> seconds` | One cycle took longer than `poller_interval`. | Process and thread counts, slow devices, script timeouts. |
| `WARNING: cmd.php poller has run over its polling interval and therefore is ending` | A `cmd.php` child abandoned its remaining work. | The same. |
| `WARNING: <task> is out of sync with the Poller Interval!  The Poller Interval is '<seconds>' seconds, with a maximum of a '<seconds>' second <task>, but <seconds> seconds have passed since the last poll!` | `cron_interval` and `poller_interval` disagree with the schedule that actually launches the poller. | The crontab or systemd timer against Settings, Poller. |
| `WARNING: There are <n> processes detected as overrunning a polling cycle, please investigate` | Collector processes from an earlier cycle are still alive. | The process registry and the devices those processes held. |
| `ERROR: Process being killed due to timeout! (<tasktype>, <taskname>, <taskid>, Process <pid>, Time <elapsed>, Timeout <limit>, Timestamp <now>)` | A registered background process passed its timeout. | The matching Background Timeout setting on the Poller tab. |
| `ERROR: Process killed due to timeout! (<tasktype>, <taskname>, <taskid>, <pid>)` | Same, from the sweep that runs at poller start. | As above. |
| `WARNING: Refusing to kill registered process with a reserved system PID! (<tasktype>, <taskname>, <taskid>, <pid>)` | The registry holds a pid low enough to belong to the system. | A corrupt `processes` table. |
| `ERROR: Failed registering process.  Invalid pid found.  Unable to kill! (<tasktype>, <taskname>, <taskid>, <pid>)` | Registration found an unusable pid. | As above. |
| `WARNING: Detected process that is exited and did not unregister first! (<tasktype>, <taskname>, <taskid>, <pid>)` | A process died without cleaning up its registry row. | The log around its exit for the real cause. |
| `ERROR: Detected process that is gone and did not unregister first! (<tasktype>, <taskname>, <taskid>, <pid>)` | Same, found by the start-of-run sweep. | As above. |
| `WARNING: Refusing to start an invalid background executable` | A background task named a binary that failed validation. | `path_php_binary` and the task's own path setting. |
| `WARNING: Unable to start a background process` | The fork or spawn failed. | System process limits and memory. |

### Collected values

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: Invalid Response(s), Errors[<n>] Device[<id>] Thread[1] DS[<ids>]` | One or more data sources on a device returned something unusable in this cycle. | The named data sources, then the device. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] OID:<oid>, output: <output>` | An SNMP get returned a value RRDtool cannot store. | The OID on the device. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] OID:<oid>, output: U` | The same, where the value came back unknown. | As above. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] SCRIPT: <command>, output: <output>` | A script data source returned something unusable. | Run the command by hand as the poller user. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] SCRIPT: <command>, output: U` | The same, with no value. | As above. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] SERVER: <command>, output: <output>` | A script server data source returned something unusable. | The script and the `PHPSVR` lines around it. |
| `WARNING: Invalid Response, Device[<id>] DS[<id>] SERVER: <command>, output: U` | The same, with no value. | As above. |
| `Device[<id>] DS[<id>] ERROR: Invalid SNMP Data Source.  Please either delete it from the database, or correct it.` | A poller cache row claims SNMP but carries no usable OID. | The data source, then rebuild the poller cache. |
| `Device[<id>] DS[<id>] ERROR: Invalid polling option: <action>` | A poller cache row holds an action code that does not exist. | Rebuild the poller cache. |
| `WARNING: Invalid output! MULTI DS[<local_data_id>] Encountered [<value>] Expected [<names>]` | A multi-value data source returned names that do not match the data source items. | The script output against the data template's item names. |
| `WARNING: Long Responses Errors[<n>] DS[<ids>]` | Output exceeded what the poller can store. Only checked when `poller_debug` is on. | Trim the script output. |
| `WARNING: Poller Output Table not Empty.  Issues: <count>, <list>` | Rows remained in `poller_output` at the end of a cycle. | The listed data sources. |
| `WARNING: There are <n> Data Sources not returning all data leaving rows in the poller output table.  Details to follow.` | The summary line before the per-template detail. | The lines that follow it. |
| `WARNING: Data Template '<name>' is impacted by lack of complete information` | The per-template detail for the line above. | That template's data input method. |
| `WARNING: You have <n> Devices with bad SNMP Indexes.  Devices: <list> totalling <n> Data Sources.  Please Either Re-Index, Delete or Disable these Data Sources.` | Data sources point at index values the device no longer reports. | Reindex the listed devices. |
| `Device[<id>] ERROR: HOST EVENT: Device is DOWN Message: <reason>` | A device crossed `ping_failure_count`. | The reason text, then the device's availability settings. |
| `WARNING: Unable to open session for System Mib collection for Device[<id>]` | The four-hourly system MIB collection could not open an SNMP session. | The device's SNMP credentials. |
| `WARNING: PollerID:<id> has an invalid hostname:<hostname>.  It is not reachable via DNS!` | A data collector's hostname does not resolve. | DNS, then the collector record. |
| `ERROR: Invalid URL passed to call_remote_data_collector: <url>` | A remote collector RPC was built with a URL that failed validation. Tag `SECURITY`. | The collector's hostname and URL path. |

### Recache

| Message | Condition | Where to look |
|---|---|---|
| `Device[<id>] DQ[<id>] RECACHE WARNING: Result from Script Server not valid. Partial Result: <output>` | A reindex through the script server returned unusable output. | The data query's script. |
| `Device[<id>] DQ[<id>] RECACHE ERROR: Invalid reindex option: <action>` | A reindex cache row holds an action code that does not exist. | Rebuild the poller cache. |
| `STATS: Poller:<id> RecacheTime:<seconds> DevicesRecached:<n>` | Normal end-of-recache summary. Tag `RECACHE`. | Nothing, unless the time is growing. |

### Poller commands

Tag `PCOMMAND`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Unknown poller command issued` | A row in `poller_command` holds a command code the script does not implement. | The `poller_command` table. |
| `ERROR: Poller Command processing timed out after processing '<command>'` | The command pass passed `commands_timeout`. | That setting, and the command that was running. |
| `WARNING: Killing Commands <task> PID <pid> due to another due to signal or overrun.` | A previous command run was still alive. Tag `CLEANUP`. | Whether commands are taking longer than a cycle. |
| `WARNING: Rebuild poller cache terminated by user` | The poller cache rebuild caught a signal. Tag `PUSHOUT`. | Expected on Ctrl-C. |
| `WARNING: Killing Cleanup <task> PID <pid> due to another due to signal or overrun.` | A previous rebuild was still alive. Tag `PUSHOUT`. | Whether the last rebuild finished. |
| `WARNING: RRDfile Cleanup Poller terminated by user` | The cleanup pass caught a signal. Tag `CLEANUP`. | Expected on shutdown. |

### Recovery

Tag `POLLER`, on a remote data collector recovering after the main server was
unreachable.

| Message | Condition | Where to look |
|---|---|---|
| `RECOVERY ERROR: Retaining local rows because their data-source ownership could not be verified.` | Local rows name data sources this collector does not own. | Whether devices moved between collectors. |
| `RECOVERY ERROR: Main collector did not acknowledge the Boost batch; retaining local rows.` | The handoff to the main server was not confirmed. Rows stay for the next attempt. | Connectivity to the main database. |
| `RECOVERY ERROR: Unable to remove acknowledged local Boost rows; they will be retried idempotently.` | The delete after a confirmed handoff failed. | Local database permissions and disk. |
| `RECOVERY WARNING: Recovery Poller terminated by user` | The recovery pass caught a signal. | Expected on shutdown. |
| `RECOVERY STATS: Time:<seconds> Records:<n>` | Normal end-of-recovery summary. | Nothing. |

### Statistics

These carry no error. They are the lines to watch when judging whether a
collection cycle is healthy.

| Message | Condition |
|---|---|
| `STATS: Time:<seconds> Method:<cmd.php or spine> Processes:<n> Threads:<n> Hosts:<n> HostsPerProcess:<n> DataSources:<n> RRDsProcessed:<n>` | End of every poller run. |
| `MAINT STATS: Time:<seconds>` | End of a maintenance pass. |
| `RECACHE STATS`, `BOOST STATS`, `DSSTATS STATS`, `RRDCHECK STATS`, `SPIKEKILL STATS`, `DSDEBUG STATS`, `RRDSTRUCT STATS`, `ANALYSIS STATS`, `BATCHFIX STATS` | End of the matching background task. The `CHILD` and `DETAIL` variants report one worker rather than the whole run. |

## Script server

Tag `PHPSVR`. The long-lived PHP process spine uses for script server data
inputs.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: Script file '<path>' resolves outside the allowed script roots. Rejected.` | A data input named a script outside `scripts/` and the configured script paths. | The data input method's command. |
| `WARNING: Script file '<path>' could not be resolved. Rejected.` | The path does not resolve to a real file. | The same. |
| `WARNING: PHP Script File to be included, does not exist` | The include file is absent. | The data input method's command and `$scripts_path`. |
| `WARNING: Function does not exist  INC: '<file>' FUNC: '<function>' PARMS: '<parameters>'` | The named function is missing from the script. | The script. |
| `WARNING: Function '<function>' not introspectable. Rejected.` | Reflection on the function failed. | The script. |
| `WARNING: Refusing to dispatch PHP internal function '<function>' from script server.` | A data input named a PHP builtin rather than a script function. | The data input method. |
| `WARNING: Function '<function>' has no source file. Rejected.` | The function is not defined in a file on disk. | The script. |
| `WARNING: Function '<function>' defined outside the allowed script roots ('<file>'). Rejected.` | The function's file lies outside the allowed roots. | The script's location. |
| `WARNING: Script Server count not parse '<parameters>' for <function>` | The parameter string could not be split. | Quoting in the data input method. |
| `WARNING: Script Server terminated with signal '<signal>' in file:'<file>', function:'<function>', params:'<parameters>'` | The script server died while running that call. | The script for a crash or an exit. |
| `WARNING: Script Server received signal '<signal>' in file:'<file>', function:'<function>', params:'<parameters>'` | A signal arrived mid-call and was handled. | As above. |
| `WARNING: Input Expected, parent process <pid> should have sent non-blank line` | The parent sent an empty line. | The spine process that owns this script server. |
| `WARNING: Input Expected, unable to check parent process` | The parent could not be inspected. | As above. |
| `WARNING: Parent (<pid>) of Script Server (<pid>) has been lost, forcing exit` | The owning spine process is gone. | Why spine exited. |

## RRDtool and RRD files

Tags `POLLER`, `BOOST`, `RRDCHECK`, `DSSTATS`, `MAINT`, `REALTIME`.

### Running RRDtool

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: RRDtool executable not found, not executable or error in path '<path>'.  No output written to RRDfile.` | `path_rrdtool` does not point at a runnable binary. Nothing is being written to any RRD file. | `path_rrdtool` in Settings, Paths. |
| `ERROR: Detected RRDtool Crash on '<command>'.  Last command was '<command>'` | The RRDtool pipe died mid-command. | The command shown, usually a malformed graph or update. |
| `FATAL: RRDtool Restart Attempts Exceeded. Giving up on '<command>'.` | RRDtool crashed repeatedly on the same command. | That command. |
| `ERROR: RRDtool was unable to fork.  Likely RRDtool can not be found or system out of resources.  Blocking subsequent messages.` | The fork failed in the statistics or check pass. Further copies of this message are suppressed. | `path_rrdtool`, then process and memory limits. |

### RRD file paths and creation

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Invalid RRD file path for local_data_id: <id>.` | The stored path failed validation before an update. | That data source's path field. |
| `ERROR: Invalid RRD file path in poller cache for local_data_id: <id>.` | Same, reading from the poller cache. | Rebuild the poller cache. |
| `ERROR: Invalid RRD file path in boost cache.` | Same, in a boost row with no usable id. | The boost tables. |
| `ERROR: Invalid RRD file path in boost update cache for local_data_id: <id>.` | Same, during the boost update pass. | The data source's path field. |
| `ERROR: Invalid RRD data source name for local_data_id: <id>.` | A data source item name failed validation. | The data template's item names. |
| `ERROR: Invalid RRD data source bounds for local_data_id: <id>.` | Minimum or maximum failed validation. | The data template's item bounds. |
| `ERROR: Invalid RRD update time for local_data_id: <id>.` | The update timestamp failed validation. | Clock skew on the collector. |
| `ERROR: Invalid RRD update data source name for local_data_id: <id>.` | The update named an item that failed validation. | The data template. |
| `ERROR: Invalid RRD update template or value set for local_data_id: <id>.` | The update template and values do not agree. | The data template and the collected output. |
| `ERROR: Invalid RRD update value set for local_data_id: <id>.` | The value list failed validation. | As above. |
| `ERROR: There are no RRA's assigned to local_data_id: <id>.` | The data source's profile carries no RRAs, so no file can be created. | The data source profile. |
| `ERROR: Unable to create directory '<path>'` | The RRA subdirectory could not be made. | Ownership and permissions on `rra/`. |
| `ERROR: Unable to create directory due to missing write permissions '<path>'` | The parent directory is not writable. | As above. |
| `ERROR: Unable to set directory permissions for '<path>'` | `chmod` on a new RRA directory failed. | Whether the poller runs as the owner. |
| `WARNING: Poller has not created structured path '<path>' yet.` | A structured path directory does not exist yet. Benign on a first run. | Recurs only if the poller cannot create it. |
| `ERROR: Unable to set ownership for '<path>'` | `chown` on a new RRD file failed. | Whether the poller runs as root or as the file owner. |
| `ERROR: Unable to set group for '<path>'` | `chgrp` failed. | As above. |
| `ERROR: RRD file '<path>' does not exist for ownership assignment` | The file vanished between creation and the ownership step. | Concurrent cleanup or maintenance. |
| `WARNING: Unable to set owner for '<path>'` | The boost path does the same work and failed. | As above. |
| `WARNING: Unable to set group for '<path>'` | As above. | As above. |

### RRDtool proxy

Tag varies. All proxy messages carry the `CACTI2RRDP` prefix.

| Message | Condition | Where to look |
|---|---|---|
| `CACTI2RRDP ERROR: Unable to create socket to connect to RRDtool Proxy Server` | The local socket could not be created. | System socket limits. |
| `CACTI2RRDP ERROR: Unable to connect to RRDtool Proxy Server #<n>` | The proxy did not answer. `#1` is the primary, `#2` the backup. | `rrdp_server` and `rrdp_port`, then the proxy itself. |
| `CACTI2RRDP ERROR: Unable to connect to RRDtool proxy.` | The connection failed at command time. | As above. |
| `CACTI2RRDP ERROR: Public RSA Key Exchange - Time-out while reading` | The proxy did not send its key in time. | Network latency and the proxy's load. |
| `CACTI2RRDP ERROR: Invalid RSA public key returned by proxy.` | The key did not parse. | The proxy's key files. |
| `CACTI2RRDP ERROR: Mismatch RSA Fingerprint.` | The proxy's key does not match the configured fingerprint. | `rrdp_fingerprint`, and whether the proxy's key was regenerated. |
| `CACTI2RRDP ERROR: Session closed by Proxy.` | The proxy hung up. | The proxy's own log. |
| `CACTI2RRDP ERROR: Data Transfer - Time-out while reading.` | The proxy stopped responding mid-command. | The proxy's load. |
| `CACTI2RRDP ERROR: Proxy message encryption failed.` | Encrypting the outbound message failed. | The PHP OpenSSL extension. |
| `CACTI2RRDP ERROR: Proxy message decryption failed: ###<packet>###` | The reply would not decrypt. | Key mismatch between the two sides. |

### Boost

Tag `BOOST`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Boost Cache Directory is not writable!  Can not cache images` | `boost_png_cache_directory` cannot be written. | Permissions on that directory. |
| `ERROR: Boost Cache Directory does not exist! Can not cache images` | It does not exist. | Create it, or clear the setting. |
| `ERROR: Boost Cache Directory variable is not set! Can not cache images` | Image caching is on with no directory set. | `boost_png_cache_directory`. |
| `ERROR: Boost PNG Cache Directory '<path>' is outside of <application> base path. Purge aborted.` | The purge refused to delete outside the install. | That setting. |
| `WARNING: Boost log '<path>' is not writable!` | `path_boost_log` cannot be written. | Permissions, or clear the setting. |
| `WARNING: Boost Debug Log <path> is not writable.  Change the path to a writable location` | The same check at startup. | As above. |
| `WARNING: Boost Poller forced by command line.` | The boost poller was started with `--force`. | Expected. |
| `WARNING: Boost Poller terminated by user` | It caught a signal. | Expected on shutdown. |
| `WARNING: Killing Boost <task> PID <pid> due to another boost process starting.` | A previous boost run was still alive. | Whether boost takes longer than `boost_rrd_update_interval`. |
| `WARNING: Detected Poller Boost Overrun, Possible Boost Poller Crash` | A boost run did not record its completion. Tag `BOOST SVR`. | The log around the previous run. |
| `WARNING: RRD On Demand Updater Exceeded Runtime Limits. Continuing to Process!!!` | The run passed `boost_rrd_update_max_runtime` and kept going. | That setting, and the backlog size. |
| `ERROR: Boost child refused to run without a valid parent run identifier.` | A boost child was started without its parent's run id. | Stale processes from an aborted run. |
| `WARNING: Boost child exited without recording completion; retaining archive tables.` | A child died. Its rows are kept for the next run. | The log around the child's exit. |
| `WARNING: Boost retained archive tables because the child run was incomplete or reported an RRD update failure.` | At least one child failed. Nothing is dropped. | The RRD update warnings in the same run. |
| `WARNING: Boost retained shard <n> through local data ID <id> because one or more RRD updates failed.` | One shard failed part way. | The data source named. |
| `ERROR: Failed to retrieve archive table name` | The archive table could not be identified. | The boost tables. |
| `ERROR: Failed to retrieve archive table name - check poller` | The same, at the start of a run. | As above. |
| `ERROR: Failed to retrieve any rows from archive tables` | The archive tables were empty when rows were expected. | As above. |
| `WARNING: Boost ignored an unexpected archive-like table name.` | A table matching the archive pattern was not one boost created. | Leftover tables in the database. |
| `ERROR: Boost rejected a handoff containing data sources not assigned to this poller.` | A remote collector sent rows for data sources it does not own. | Whether devices moved between collectors. |
| `WARNING: Boost staging ignored one or more duplicate sample keys.` | Two rows carried the same data source and timestamp. | Duplicate poller output, usually overlapping cycles. |
| `WARNING: Boost archive forwarding encountered duplicate sample keys for Local Data ID '<id>'.` | The same, during forwarding. | As above. |
| `WARNING: Boost retained staged rows for Local Data ID '<id>' because the handoff was not fully acknowledged.` | Rows are held rather than dropped. | Connectivity to the main database. |
| `WARNING: Skipping <local_data_id>:<rrd_name> due to duplicate record...` | Two identical samples in one update batch. | As above. |
| `WARNING: Stale Poller Data Found! Item Time:'<time>', RRD Time:'<time>' Ignoring Value!` | A sample is older than the file's last update. Only logged at high verbosity. | Clock skew, or a poller run that overtook itself. |
| `WARNING: RRD Update Warning '<output>' for Local Data ID '<id>'` | RRDtool printed something on an update. | The quoted RRDtool text. |
| `ERROR: Unable to create directory '<path>'` | The boost updater could not create an RRA directory. | Permissions on `rra/`. |

### RRD file check and statistics

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: RRDcheck - no rrd data returned - '<file>'` | The checker read the file and got nothing. Tag `RRDCHECK`. | The file, and whether its data source still collects. |
| `WARNING: Killing rrdcheck <task> PID <pid> due to another due to signal or overrun.` | A previous check run was still alive. | `rrdcheck_interval` against how long a pass takes. |
| `WARNING: rrdcheck Poller terminated by user` | The pass caught a signal. | Expected on shutdown. |
| `WARNING: RRDcheck interval set to 'boost' and boost not enabled, resetting to default of 4 hours` | `rrdcheck_interval` is `boost` while `boost_rrd_update_enable` is off. | Either setting. |
| `ERROR: Invalid RRD file path for DSStats local_data_id: <id>, path: <path>.` | The statistics pass rejected a stored path. Tag `DSSTATS`. | The data source's path field. |
| `ERROR: Invalid RRD data source name for DSStats local_data_id: <id>, name: <name>.` | The same, for an item name. | The data template. |
| `WARNING: File does not exist!  DS[<id>], FILE[<path>]` | The statistics pass found no file. | Whether the poller ever created it. |
| `WARNING: Data Source '<name>' is damaged and contains no path.  Please delete and re-create both the Graph and Data Source.` | The data source row has an empty path. | That data source. |
| `ERROR: Output from local_data_id <id>, for RRDfile DS Name '<name>', is invalid.  It outputs was : '<value>'. Please check your script or data input method for errors.` | A stored value is not a number. | The data input method. |
| `WARNING: Unknown RRDtool Data Type '<type_id>', For '<name>'` | A data source item holds a type code that does not exist. | The data template. |
| `WARNING: Killing DSStats <task> PID <pid> due to signal or overrun.` | A previous statistics run was still alive. | `dsstats_daily_interval` against run time. |
| `WARNING: DSStats Poller terminated by user` | The pass caught a signal. | Expected on shutdown. |
| `WARNING: Daily update interval set to 'boost' and boost not enabled, resetting to default of 1 hour` | `dsstats_daily_interval` is `boost` while boost is off. | Either setting. |

### Data source debug and repair

Tag `DSDEBUG`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: RRDfile repair command failed for DS[<id>] Command[<command>] Output[<output>]` | An `rrdtool tune` repair failed. | The quoted output. |
| `ERROR: RRDfile Repair Command Failed for DS[<id>] Output[Unable to write RRDfile]` | The file is not writable. | Permissions on the file. |
| `ERROR: RRDfile Repair Command Could not be run for DS[<id>] Output[No tune recommendation found]` | Debug found nothing to repair. | Run the data source debug first. |
| `ERROR: RRDfile Repair Command Could not be run for DS[<id>] Output[No Data Source debug information found]` | No debug record exists for that data source. | As above. |

### Spike removal

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: SpikeKill failed for <file>.  Message is <errors>` | A kill failed. Tag `SPIKEKILL`. | The quoted message. |
| `WARNING: Removed '<n>' Spikes from '<file>', Method:'<method>'` | A kill succeeded. Logged at warning level so it is visible. Tag `WEBUI`. | Nothing. |

### Realtime graphs

Tag `REALTIME` or `POLLER`.

| Message | Condition | Where to look |
|---|---|---|
| `FATAL: Realtime Cache Directory '<path>' Does Not Exist!` | `realtime_cache_path` is missing. | That setting. |
| `FATAL: Realtime Cache Directory '<path>' is Not Writable!` | It exists but the web server cannot write it. | Permissions. |
| `ERROR: Realtime rejected invalid RRD path for local_data_id <id>, realtime path: <path>, source path: <path>.` | A path failed validation before the realtime copy. | The data source's path field. |
| `ERROR: Realtime skipped RRD create with control characters for local_data_id <id>.` | The create arguments held control characters. | The data source name and path. |
| `WARNING: Unable to locate the Realtime Hash for Realtime Graph` | The request carried no matching cache entry. | Usually a stale browser tab. |

### RRD file maintenance

Tag `MAINT`.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: RRDfile Maintenance is unable to remove <file> from <path>!` | Deleting an orphaned file failed. | Permissions on `rra/`. |
| `WARNING: RRDfile Maintenance is unable to move <file> to <target>!` | Archiving failed. | Permissions on `rrd_archive`. |
| `ERROR: RRDfile Maintenance unable to create directory '<path>'` | The archive directory could not be made. | `rrd_archive`. |
| `WARNING RRDfile Maintenance rejected invalid RRDproxy path <name>!` | A proxy-held filename failed validation. | The data source's path. |
| `WARNING RRDfile Maintenance is unable to remove <name> from the RRDproxy!` | The proxy refused the delete. | The proxy's own log. |
| `WARNING RRDfile Maintenance is unable to move <name> to the RRDproxy Archive!` | The proxy refused the move. | As above. |

### RRD file tools

Tags `RFLOAT` and `SYSTEM`, from `cli/float_rrdfiles.php` and
`cli/batchgapfix.php`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Unable to dump file <path> to XML` | `rrdtool dump` failed. | The file, and `path_rrdtool`. |
| `WARNING: Range float FAILED for RRDfile <path>.  Message is <response>` | The conversion failed. | The quoted message. |
| `WARNING: Unable to open file <path> for writing` | The temporary file could not be created. | Disk space and permissions. |
| `WARNING: Unable to write to RRDfile <path>` | The rewrite failed. | Permissions on the file. |
| `WARNING: RRDfile does not exist <path>` | The named file is gone. | The data source's path field. |
| `WARNING: RRDfile Data Float Tool terminated by user` | The tool caught a signal. | Expected. |
| `WARNING: Killing Cleanup <task> PID <pid> due to another due to signal or overrun.` | A previous run was still alive. | Whether the last run finished. |

## SNMP

Tags `SNMP`, `SNMPAGENT`, `POLLER`, `SECURITY`.

### Queries

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: SNMP Error:'<error>', Device:'<hostname>', OID:'<oid>'` | The library returned an error for that OID. | The quoted error, then the device's credentials. |
| `WARNING: SNMP Error:'Timeout', Device:'<hostname>', OID:'<oid>'` | No reply within the timeout. Only logged at high verbosity. | `snmp_timeout` and `snmp_retries`, then the device. |
| `WARNING: SNMP Error:'Error in packet.  Response message would have been too large.', Device:'<hostname>', OID:'<oid>'` | The agent could not fit the reply in one packet. | Lower `snmp_bulk_walk_size` or `max_get_size`. |
| `WARNING: SNMP Agent exploit attempted on SNMP agent from host ip: <ip> with oid: <oid>` | An OID failed validation before being sent. Tag `SECURITY`. | Where the OID came from. |

### Ping

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: ICMP Ping Error: cacti_gethostbyname failed for <hostname>` | The device hostname does not resolve. | DNS, then the device record. |
| `WARNING: UDP Ping Error: cacti_gethostbyname failed for <hostname>` | The same, on the UDP path. | As above. |
| `WARNING: TCP Ping Error: cacti_gethostbyname failed for <hostname>` | The same, on the TCP path. | As above. |
| `WARNING: sockets support not enabled in PHP, falling back to SNMP ping` | ICMP was requested but PHP has no sockets extension. | Install the extension, or set `ping_method` to something else. |

### SNMP agent

Tag `SNMPAGENT`. Kadupul's own agent, not a monitored device.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: SNMPAgent: <exception message>` | Any exception inside the agent. The quoted text is the exception's own message. | The quoted text. |
| `ERROR: Unknown event: <notification> (<mib>)` | A notification name has no definition. | The MIB, and whether it loaded. |
| `ERROR: Unknown event severity: "<severity>" for <notification> (<mib>)` | The notification's severity is not one the agent knows. | The MIB. |
| `ERROR: Incomplete number of varbinds given for event: <notification> (<mib>)` | The caller supplied fewer varbinds than the notification declares. | The plugin or core call that raised it. |
| `WARNING: No notification receivers configured for event: <notification> (<mib>), severity: <severity>` | The event fired with nowhere to send it. | The notification receivers list. |

## Database

Tag `DBCALL`.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: The DB has gone away during a query.  Retry to connect and query in 5 seconds.` | The connection dropped mid-query. Retried automatically. | The database server's `wait_timeout` and its own log. |
| `ERROR: Too many Lock/Deadlock errors occurred! SQL:'<sql>'` | Retries on a locked or deadlocked statement were exhausted. Only written at debug verbosity. | The quoted statement, and concurrent writers. |
| `ERROR: A DB <operation> Too Large!, Error: <errno>, SQL: '<sql>'` | The statement or its result exceeded a server limit. Debug verbosity. | `max_allowed_packet`. |
| `ERROR: A DB <operation> Too Large!, Error: <message>` | The same, with the driver's message. | As above. |
| `ERROR: A DB <operation> Failed!, Error: <errno>, SQL: '<sql>'` | A statement failed. Debug verbosity. | The quoted statement. |
| `ERROR: A DB <operation> Failed!, Error: <message>` | The same, with the driver's message. This is the one that appears at normal verbosity. | The quoted message. |
| `ERROR: SQL Save Failed for Table '<table>'.  SQL:'<sql>'` | A save through the generic table writer failed. | The quoted statement. |
| `ERROR: Column: <column> contains an invalid value: <value>` | A value failed the column's validation before the write. | The form or script that supplied it. |
| `WARNING: Requested column not found in SQL result: "<column>"` | Code asked for a column the query did not return. Debug verbosity. | A schema change, or a plugin. |
| `WARNING: db_qstr() called without a valid database connection. Escaping may be unsafe.` | A value was quoted before the connection existed. | The call order in the script that triggered it. |
| `ERROR: Failed to initialize mysqldump process for database '<database>'` | The backup could not start `mysqldump`. | Whether `mysqldump` is on the path. |
| `ERROR: mysqldump failed with exit code <code> for database '<database>'` | The dump ran and failed. | The exit code and the database credentials. |

### Schema audit and upgrade

Tag `UPGRADE`, from `cli/audit_database.php`.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: <application> Upgrade Encountered Errors.  Messages below.  Details are below, but also in <application> upgrade log.` | The upgrade finished with errors. | The lines that follow, and the upgrade log. |
| `WARNING: <application> Plugin <name> Upgrade Encountered Errors.` | One plugin's upgrade failed. | That plugin. |
| `WARNING: Plugin <name> lacks an upgrade function.` | The plugin's setup file defines no upgrade entry point. | The plugin author. |
| `WARNING: Plugin <name> lacks a setup file.` | No setup file was found. | The plugin's installation. |
| `WARNING: Plugin <name> lacks an INFO file.  Can not upgrade!` | No INFO file was found. | As above. |
| `ANALYSIS STATS: Analyzing <application> Tables Complete.  Total time <seconds> seconds.` | End of `cli/analyze_database.php`. | Nothing. |

### Sequence checks

| Message | Condition | Where to look |
|---|---|---|
| `WARN: Found <n> Bad Sequences in <table> Table` | Ordering columns hold values outside the expected range. High verbosity. Tag `WEBUI`. | The repair action on that page. |
| `WARN: Found <n> Duplicated Sequences in <table> Table` | Two rows share an ordering value. | As above. |
| `WARN: Found <n> Sequences in graph_tree Table` | The same check on trees. Tag `TREE`. | The tree. |

## Authentication and access control

Tags `AUTH`, `SECURITY`, `WEBUI`.

### Login and session

| Message | Condition | Where to look |
|---|---|---|
| `FATAL: No authentication attempted and not supported.` | The login page ran with no usable authentication method. | `auth_method`. |
| `FATAL: CSPRNG failed. Cannot generate secure authentication token.` | The system random source failed. Login cannot proceed. | The operating system's entropy source. |
| `FATAL: CSPRNG failed. Cannot generate secure placeholder password for user copy.` | The same, while copying a user. | As above. |
| `ERROR: No username passed with Web Basic Authentication enabled.` | The web server did not set a remote user. | The web server's authentication configuration. |
| `WARNING: Username <name> not found in basic mapfile.` | Basic authentication mapping did not cover this user. | `path_basic_mapfile`. |
| `WARNING: User attempted to access <application> from unknown URL` | The password change page was reached from a host the install does not recognise. | `$url_path` and the reverse proxy. |
| `ERROR: Browser did not return the <application> session cookie during CSRF validation; verify url_path and cacti_cookie_domain.` | The session cookie was not sent back. | `$url_path` and `$cacti_cookie_domain`. |
| `Session "<id>" start failed! <backtrace>` or `Session "<id>" restart failed! <backtrace>` | The PHP session could not start, or could not restart after regeneration. The severity here sits in the environment field, which the call sets to `WARNING:`, not in the message. | The session save path and its permissions. |
| `ERROR: Invalid <application> User ID <id> is being used in a permission that does not exist` | A permission row names a user that is gone. | The permission tables. |
| `WARNING: Invalid view parameter '<view>' in is_view_allowed()` | A page asked about a view name that does not exist. | The plugin or page that called it. |

### Request handling

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: Attempt to use GET method for POST operations from IP <ip>` | A state-changing action arrived as a GET. | Bookmarks, link prefetching, or a scan. |
| `WARNING: Rejected non-POST request to data_input.php?action=whitelist_update` | The whitelist update was requested without a POST. | As above. |
| `WARNING: Rejected non-POST request to remove a Graph Item Input` | The same, for a graph item input delete. | As above. |
| `WARNING: Request variable 'action' was passed as array in <script>.` | `action` arrived as an array rather than a string. | The caller. |
| `ERROR: Invalid remote client IP Address found in header (<header>).` | A trusted proxy header held something that is not an address. Debug verbosity. | `$proxy_headers` and the proxy in front. |
| `ERROR: Invalid remote agent client IP Address.  Exiting` | The remote agent endpoint was reached from an address it does not accept. | The collector's address, and `$proxy_headers`. |
| `WARNING: PTR record for <ip> resolves to <name> but forward lookup does not match. Rejecting.` | Forward-confirmed reverse DNS failed for a remote agent caller. Tag `SECURITY`. | DNS for the collector. |
| `ERROR: Invalid field name in build_where_from_array: <field>` | A filter named a column that failed validation. Tag `SECURITY`. | The page or plugin that built the filter. |
| `ERROR: An attempt was made to perform a SQL Injection in Graph Automation from client address '<ip>'` | An automation rule field failed validation. Tag `SECURITY`. | The rule, and the address. |
| `ERROR: An attempt was made to perform a SQL Injection in Tree automation from client address '<ip>'` | The same, on tree rules. | As above. |

### Graph input ownership

These all come from the same class of check: a graph item input must belong to
the template it claims. Tag `SECURITY`.

| Message | Condition |
|---|---|
| `ERROR: Graph save refused an invalid graph input field` | A save named a field that is not an input of that template. |
| `ERROR: Graph save refused an invalid graph input value` | A save carried a value that failed validation. |
| `ERROR: Graph input save refused a cross-template relationship` | An input was saved against a different template's item. |
| `ERROR: Graph input delete refused a cross-template relationship` | The same, on delete. |
| `ERROR: Graph template duplication refused an invalid Graph Item Input field` | A duplicate carried an input field that does not belong. |
| `ERROR: Graph template duplication refused invalid input ownership` | A duplicate carried an input owned by another template. |
| `ERROR: Graph template import refused an invalid Graph Item Input field` | The same, on import. |
| `ERROR: Graph template import refused an invalid Graph Item hash` | An item hash failed validation. |
| `ERROR: Graph template import refused an unresolved Graph Item Input relationship` | An input referenced an item the import did not create. |
| `ERROR: Graph template import refused invalid input relationships before the write pass` | The pre-write check failed. |
| `ERROR: push_out_graph_input() refused an invalid graph input field` | Pushing a template change out to its graphs hit a bad field. |
| `ERROR: push_out_graph_input() refused an invalid graph input value` | The same, for a value. |
| `ERROR: Graph rendering refused an invalid graph input field` | Rendering hit a bad field. |

## Import and export

Tag `IMPORT`.

### Packages

| Message | Condition | Where to look |
|---|---|---|
| `FATAL: Unable to parse package XML structure.` | The package's outer XML did not parse. | The file, and whether it is truncated. |
| `FATAL: Unable to parse XML structure.` | A template XML inside the package did not parse. | As above. |
| `FATAL: Unable to read <application> Package <filename>` | The file could not be read. | Permissions and the upload directory. |
| `FATAL: Unable to open file <filename>` | The file could not be opened. | As above. |
| Package public key rejected | The package key does not match the built-in trusted key set checked by `is_cacti_public_key()`. | Where the package came from. |
| `FATAL: Could not Verify Signature.` | The signature check failed. | As above. |
| `FATAL: Could not Verify Signature for file: <name>` | One file inside the package failed its check. | As above. |
| `FATAL: Package signature validation failed for <file>` | The validation pass failed. | As above. |
| `FATAL: File has been Tampered with.` | Content does not match the signature. | Do not install it. |
| `WARNING: Skipping package file with path traversal attempt: <name>` | A package entry tried to write outside the install. Skipped, not fatal. | The package. Treat it as hostile. |
| `WARNING: Skipping package file with absolute path: <name>` | A package entry carried an absolute path. Skipped. | As above. |
| `FATAL: Unable to create directory: <path>` | Extraction could not create a directory. | Permissions on the install tree. |
| `FATAL: Unable to create temporary package import file` | The upload could not be staged. | The temporary directory and disk space. |
| `FATAL: Unable to write temporary package import file` | The staged file could not be written. | As above. |

### Templates

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Import or Preview failed for XML file <name>!` | The template import failed. | The lines above it for the reason. |
| `ERROR: <hash_version> Current <application> Version does not exist!` | The file names a version this install does not know. | The XML's version attribute. |
| `ERROR: <hash_version> hash version does not exist!` | The hash carries a version code that is not defined. | The XML. |
| `ERROR: <hash_version_code> > <current_version_code>` | The detail line for the message below. | The XML. |
| `ERROR: <hash_version> hash version is for a newer <application>!` | The file was exported by a newer version. | Export it again from a matching version. |
| `<function> ERROR type or version not found for hash: <hash>` | A hash did not decompose into a type and version. | The XML. |
| `<function> ERROR wrong hash format for hash: <hash>` | A hash is the wrong shape. | The XML. |
| `ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters` | The data input command holds characters the install does not allow. | `allow_unsafe_metachars`, and the command itself. |
| `WARNING: Suggested Values Array for Graph Template Empty` | The template carried no suggested values. High verbosity. | Usually harmless. |
| `WARNING: Suggested Values Array for Data Template Empty` | The same, for a data template. | As above. |

### Export

Tag `WEBUI`. All of these mean the same thing: export walked a reference that
points at a row that is gone.

| Message | Condition |
|---|---|
| `ERROR: Invalid Graph Template found in Database for Template <name>[<id>] GTGid: <id>.  Please run database repair script to identify and/or correct.` | A graph template's graph record is missing. |
| `ERROR: Invalid Data Template found in Database.  Please run database repair script to identify and/or correct.` | A data template reference is dangling. |
| `ERROR: Invalid Data Input Method found in Data Template.  Please run database repair script to identify and/or correct.` | The data template names a data input method that is gone. |
| `ERROR: Invalid CDEF found in Graph Template.  Please run database repair script to identify and/or correct.` | A graph item names a missing CDEF. |
| `ERROR: Invalid GPRINT preset found in Graph Template.  Please run database repair script to identify and/or correct.` | A graph item names a missing GPRINT preset. |
| `ERROR: Invalid Data Source Profile found during Data Template export.  Please run database repair script to identify and/or correct.` | The data template names a missing profile. |
| `ERROR: Invalid Device Template found during Export.  Please run database repair script to identify and/or correct.` | A device template reference is dangling. |
| `ERROR: Invalid Data Query found during Export.  Please run database repair script to identify and/or correct.` | A data query reference is dangling. |

The repair script is `cli/repair_database.php`. See
[Command line tools](/1.2.31/reference/command-line-tools/).

## Data queries and templates

Tags `REINDEX`, `PCACHE`, `AUTOM8`, `WEBUI`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: <application> Data Query DQ[<id>] XML file may be missing or not readable.` | The data query's XML file is gone or unreadable. | The path on the data query, under `resource/`. |
| `FATAL: Malicious path traversal detected in Data Query script path: <path>` | A data query script path tried to escape the script roots. | The data query definition. |
| `ERROR: Malformed or complex regex in Data Query (ReDoS prevented): <regex>` | A field parse regex was rejected before it could run away. | The data query XML. |
| `ERROR: Re-Indexing failed due to a NULL sort field for Device[<id>] and DQ[<id>].  Can not continue with Re-Index.` | The data query has no sort field set. | The data query's index settings. |
| `WARNING: Sort Field has Changed for Device[<id>] and DQ[<id>].  Old Sort:<field>, New Sort:<field>.  Re-mapping issues may occur!` | The sort field changed between reindexes. | Whether graphs now point at the wrong index. |
| `WARNING: Unknown index_order_type of <type> found for Device[<id>], DQ[<id>].  Permitted types are [alpha:numeric:alphanumeric].  Data collection can be impacted.` | The XML declares an ordering type that does not exist. | The data query XML. |
| `WARNING: Missing index_order_type XML tag for Device[<id>], DQ[<id>].  Permitted types [alpha:numeric:alphanumeric].  If a monitored object changes it's index, those changes will not be detected.` | The XML omits the tag. | As above. |
| `WARNING: Graph Item Issue for Graph: <id>, Template: <id>, Items: <n>/<n>` | A graph has a different item count from its template. | Resave the graph from its template. |
| `WARNING: Graph Template with ID <id> Does not have any Graph Items` | The template is empty. | The template. |
| `ERROR: Unable to parse graph_template_id with value <value>` | A template id arrived in an unusable form. | The page or filter that supplied it. |
| `ERROR: Suggested value column error.  Column <field> for Data Template ID <id> is not a compatible field name for tables data_template_data and data_template_rrd.  Please correct this suggested value mapping` | A suggested value names a column that does not exist. | The data template's suggested values. |

### Poller cache and the input whitelist

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Failed to parse input whitelist file: <path>` | The whitelist JSON did not parse. | `$input_whitelist`. |
| `WARNING: Data input script not found in input whitelist file: <path>` | A data input command has no whitelist entry. | Run `cli/input_whitelist.php --update`. |
| `ERROR: Whitelist entry failed validation for Data Input: <name> DI[<id>].  Data Collection will not run.  Run CLI command input_whitelist.php --audit and --update to remediate.` | The stored signature does not match the current command. Collection stops for that input. | Run the audit, then the update. |
| `WARNING: Whitelist entry missing for Data Input: <name> DI[<id>].  Run CLI command input_whitelist.php --update to remediate.` | No entry exists yet. | Run the update. |
| `WARNING: Data Input <id> failing validation check.` | The input failed its check during a poller cache rebuild. | The data input method. |
| `WARNING: Repopulate Poller Cache found DI[<id>] not Passing Input Whitelist Validation for DS[<id>].  Database may be corrupted` | The same, seen from the rebuild. | As above. |
| `WARNING: Repopulate Poller Cache found Data Input Missing for Data Source <id>.  Database may be corrupted` | A data source names a data input that is gone. | `cli/repair_database.php`. |
| `WARNING: Poller Cache updated Device[<id>], Field[<field>], Old[<old>], New[<new>]` | A device field changed and the cache was updated. Medium verbosity. | Nothing. |
| `WARNING: function push_out_host() discovered more than a single host` | A push that expected one device matched several. | The device id passed in. |
| `WARNING: Unable to open session for System Mib collection for Device[<id>]` | See the Poller section above. | |
| `ERROR: Invalid or non-executable PHP binary path configured: <path>` | `path_php_binary` or `$php_path` is wrong. | Those settings. |
| `ERROR: Rejected an empty PHP binary.` | The same, with nothing configured. | As above. |
| `ERROR: Rejected PHP binary starting with dash: <path>` | The configured binary looks like a command line option. | As above. |
| `WARNING: Deprecated script push_out_hosts.php. Please use rebuild_poller_cache.php.` | The old script name was used. It re-executes the new one. | Update the caller. |
| `WARNING: Could not find <application> default matching hash for unknown system hash "<hash>" for <data_input_id>.  No repair performed.` | A repair pass met a hash it does not recognise. | The data input method. |

## Automation

Tag `AUTOM8`.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: Main <application> database <hostname> offline or in recovery.  Can not run automation` | A remote collector cannot reach the main database. | Connectivity and the main server. |
| `ERROR: Network ID <id> not found in automation_networks` | The named network is gone. | The networks list. |
| `ERROR: Network ID <id> not found for notification` | The same, at notification time. | As above. |
| `ERROR: Automation can not run for Network '<name>' since the SNMP ID is not set.` | The network has no SNMP option set selected. | That network's definition. |
| `WARNING: The Network ID: <id> is disabled.  You must use the 'force' option to force it's execution.` | A disabled network was asked to run. | Enable it, or pass `--force`. |
| `WARNING: Automation Process <pid> is still running for Network ID: <id>` | A previous discovery has not finished. | How long discovery takes against its schedule. |
| `WARNING: Process <pid> claims to be running but not found for Network ID: <id>` | The status row says running but the process is gone. | Clear the network's status. |
| `WARNING: IP address '<address>' is not a valid IP address.` | A discovered or supplied address failed validation. | The network's ranges. |
| `WARNING: Automation Rule[<name>] for Device[<id>] - DQ[<id>] includes a SQL column <column> that is not found for the Device.  Can not continue.` | A rule matches on a data query field the device does not have. | The rule's match clause. |
| `ERROR: Device[<id>], GT[<id>] Graph not added due to missing data sources.` | The graph template needs data sources that were not created. | The data template and the device. |
| `ERROR: Device[<id>], GT[<id>] Graph not added due to whitelist check failure.` | The data input behind the graph is not whitelisted. | Run `cli/input_whitelist.php --update`. |
| `ERROR: Device[<id>], GT[<id>], DQ[<id>], Index[<index>], Rule[<id>] Graph not added due to missing data sources.` | The same, for a data query graph. | As above. |
| `ERROR: Device[<id>], GT[<id>], DQ[<id>], Index[<index>], Rule[<id>] Graph not added due to whitelist failure.` | The same. | As above. |
| `WARNING: <function> Parent[<id>] Tree Item - Not Added` | A tree parent node could not be created. | The tree rule. |
| `WARNING: <function> Device[<id>] Tree Item - Not Added` | A device node could not be added. | As above. |
| `WARNING: <function> Site[<id>] Tree Item - Not Added` | A site node could not be added. | As above. |
| `WARNING: <function> Graph[<id>] Tree Item - Not Added` | A graph node could not be added. | As above. |
| `WARNING: Unable to send Automation Notification Email.  No Primary Admin User Account specified.` | `admin_user` is unset. | Settings, Authentication. |
| `WARNING: Unable to send Automation Notification Email.  The Primary Admin User Account does not exist.` | `admin_user` names a deleted account. | As above. |
| `WARNING: Unable to send Automation Notification Email.  The Primary Admin User Account does not have an Email Address.` | That account has no address. | The account. |
| `WARNING: Automation had problems sending to '<email>' for <status>.  The error was '<error>'` | The send failed. | The quoted error, then the mail settings. |

## Remote data collectors

Tag `REPLICATE`. The resource cache that lets remote collectors update
themselves.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Remote Data Collector ID[<id>] to be Sync'd does not exist!` | The named collector is gone. | The Data Collectors list. |
| `ERROR: Unable to connect to Remote Data Collector <name>` | The collector did not answer. | Its hostname, its database credentials, and the network. |
| `ERROR: Unable to read the <type> path '<path>'` | A source path for the cache is unreadable. | Permissions on the install tree. |
| `FATAL: Unable to write to the <type> path '<path>'` | A destination path is not writable. | Permissions on the collector. |
| `ERROR: Cache in cannot write to '<path>', purge this location` | A cached file could not be written. | Permissions, then clear the resource cache. |
| `ERROR: Unable to write file '<path>' for PHP Syntax verification` | The syntax check could not stage its temporary file. | The temporary directory. |
| `ERROR: PHP Source File '<path>' from Cache has an error while checking syntax (<exit>) while executing: '<php> -l <file>'` | A cached PHP file does not parse. | The file, and whether the cache is corrupt. |
| `ERROR: PHP Source File '<path>': <output>` | The detail line for the message above. | The quoted output. |
| `ERROR: Directory does not exist '<path>'` | A cache target directory is missing. | The install tree on the collector. |
| `WARNING: Cache cannot update permissions on '<path>'` | `chmod` on a cached file failed. | File ownership on the collector. |
| `WARNING: Unable to read file '<path>' into <application> resource cache.` | A source file could not be read into the cache. | Permissions on the main server. |
| `WARNING: INFO file does not exist for plugin directory '<path>'` | A plugin directory has no INFO file, so it cannot be replicated. | That plugin. |
| `WARNING: Replicate Out Unable to get Table Schema for <table>.  Table does not exist!` | A table to replicate is missing on the collector. | Run the collector's database upgrade. |
| `WARNING: Another Sync Operations is already running` | A sync was requested while one runs. Tag `POLLER`. | Wait, or clear the stale status. |
| `STATS: Poller ID <id> fully Replicated` | A sync finished. Tag `POLLER`. | Nothing. |
| `WARNING: Some selected Remote Data Collectors in [<ids>] failed synchronization by user <username>, Successful/Failed[<n>/<n>].  See log for details.` | A bulk sync partly failed. Tag `WEBUI`. | The per-collector lines above it. |

## Maintenance and log rotation

Tag `MAINT`.

| Message | Condition | Where to look |
|---|---|---|
| `<application> Log Rotation - ERROR: Could not rename <name> Log "<file>" to "<file>-<ext>"` | The rename step of rotation failed. | Permissions on the log directory. |
| `<application> Log Rotation - ERROR: Permissions issue.  Please check your <name> Log directory : <dir>` | The directory is not writable. | As above. |
| `<application> Log Rotation - ERROR: Permissions issue.  Please check your <name> Log as directory or file are not writable : <path>` | Neither the file nor its directory can be written. | As above. |
| `<application> Log Rotation - ERROR: Can not purge <name> Log : <file>` | An expired log could not be deleted. | As above. |

Rotation runs only when `logrotate_enabled` is on and
`$disable_log_rotation` is false. See [Logging](/1.2.31/reference/logging/).

## Mail

Tags `MAILER`, `CMDPHP MAILER`, `SYSTEM`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: No recipient address set!!` | A send was attempted with no recipient. | The report, or the automation notification address. |
| `ERROR: <mailer error>` | The mail library's own error, passed through. Tag `MAILER` or `CMDPHP MAILER`. | The quoted text, then Settings, Mail. |
| `WARNING: Primary Admin account does not have an email address!  Unable to send administrative Email.` | `admin_user` has no address. | That account. |
| `WARNING: Primary Admin account set to an invalid user!  Unable to send administrative Email.` | `admin_user` names a deleted account. | Settings, Authentication. |
| `WARNING: Primary Admin account notifications disabled!  Unable to send administrative Email.` | `notify_admin` is off. | Settings, Mail. |
| `WARNING: Primary Admin account not set!  Unable to send administrative Email.` | `admin_user` is unset. | Settings, Authentication. |

## Plugins

Tag `PLUGIN` or `WEBUI`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: Attempted inclusion of invalid plugin file <file> from <plugin> with the hook name <hook>` | A hook registration named a file outside the plugin. Tag `SECURITY`. | That plugin. |
| `WARNING: Function "<function>" does not exist in <plugin>/<file> for hook "<hook>"` | A registered hook points at a missing function. Medium verbosity. | The plugin. |
| `WARNING: Plugin hook '<function>' from Plugin '<plugin>' must return the calling array or variable, and it is not doing so.  Please report this to the Plugin author.` | A filter hook returned nothing. | The plugin author. |
| `WARNING: The function 'api_plugin_status_run' API has changed.  Please add the <plugin> attribute to the last position` | A plugin calls the old signature. | The plugin author. |
| `WARNING: Not running hook <hook> for plugin <plugin> as its not a supported Remote Hook` | A remote collector skipped a hook not marked safe to run there. | Expected on remote collectors. |
| `WARNING: Plugin '<plugin>' is attempting to call '<function>' improperly in function '<caller>'` | A plugin called an internal function the wrong way. | The plugin author. |
| `WARNING: Registering Realm for Plugin <plugin> and Filenames <files> is ambiguous.  Using first matching Realm.  Contact the plugin owner to resolve this issue.` | Two realms claim the same file. | The plugin author. |
| `WARNING: Loading plugin INFO file failed.  Parsing INI file failed.` | The INFO file is malformed. | That file. |
| `WARNING: Loading plugin INFO file failed.  INFO file not readable.` | Permissions. | The file's mode and owner. |
| `WARNING: Loading plugin INFO file failed.  INFO file does not exist.` | It is missing. | The plugin's installation. |

## Forms and internal state

Tag `WEBUI` or none. These point at a template or plugin defect rather than a
configuration problem.

| Message | Condition | Where to look |
|---|---|---|
| `WARNING: <application> Form field '<field>' does not include a 'value' Column.  Using default.` | A form definition omits `value`. | The page or plugin that defines the form. |
| `WARNING: <application> Form field '<field>' does not include a 'default' Column.  Using empty string.` | It omits `default`. | As above. |
| `WARNING: <application> Form field '<field>' does not include a 'default' Column.  Using '0'.` | The same, on a numeric field. | As above. |
| `WARNING: <application> Form field '<field>' does not include a 'default' Column.  Using ''.` | The same, on a checkbox group. | As above. |
| `WARNING: <application> Form field '<field>' does not include a sub_checkbox 'value' Column.  Using default` | The same, on a sub-checkbox. | As above. |
| `ERROR: Field Name: <field> includes Method: <method> does not include a value 'value' element.` | A field of that method type must carry a value and does not. | As above. |
| `ERROR: <application> Error Message Id '<id>' Not Defined` | Code raised an interface message id that is not in the registry. | The page or plugin that raised it. |
| `ERROR: unable to determine current_page` | Page resolution failed. | The request URL. |
| `WARNING: Key <application> Include File <path> missing.  Please locate and replace this file` | A core include is absent. | The installation. |
| `ERROR: Invalid format file path rejected: <path>` | A report format file path failed validation. Tag `REPORTS`. | The report's format setting. |
| `ERROR: Copy node requires either a host or a graph, Function copy_node` | A tree copy carried neither. | The tree operation. |
| `ERROR: Copy node host data invalid, Function copy_node` | The device data failed validation. | As above. |
| `ERROR: Copy node site data invalid, Function copy_node` | The site data failed validation. | As above. |
| `ERROR: Copy node graph data invalid, Function copy_node` | The graph data failed validation. | As above. |
| `ERROR: Copy node parent data invalid, Function copy_node` | The parent data failed validation. | As above. |
| `ERROR: Invalid BranchID: '<id>', Function create_node` | A tree branch id failed validation. | The tree. |
| `ERROR: Invalid TreeID: '<id>', Function delete_node` | A tree id failed validation. | As above. |
| `ERROR: Invalid NodeID: '<id>', Function delete_node` | A node id failed validation. | As above. |
| `ERROR: Invalid NodeID: '<id>', Function move_node` | The same, on move. | As above. |
| `ERROR: Invalid Parent Node '<id>' for NodeID: '<id>', Function move_node` | The move target is not a valid parent. | As above. |
| `ERROR: Invalid TreeID: '<id>', Function rename_node` | The same, on rename. | As above. |
| `ERROR: Invalid NodeID: '<id>', Function rename_node` | As above. | As above. |

## Process execution

Tag `SYSTEM` or `POLLER`.

| Message | Condition | Where to look |
|---|---|---|
| `ERROR: cacti_exec() rejected binary starting with dash: <binary>` | A command path looks like an option. | The setting that supplied the path. |
| `ERROR: cacti_exec() failed to spawn: <binary>` | The process could not be started. | Whether the file exists and is executable. |
| `ERROR: cacti_exec() timed out after <seconds>s: <binary>` | The command passed its timeout. | The command, and the relevant timeout setting. |
| `WARNING: cacti_exec() stderr: <output>` | The command wrote to standard error. | The quoted output. |
| `WARNING: exec_with_timeout stderr: <output>` | The same, from the poller's helper. Medium verbosity. | As above. |
| `ERROR: cacti_temp_file: tempnam failed` | A temporary file could not be created. | The temporary directory and disk space. |
| `WARNING: SIGHUP Signal for pid: <pid> is not supported on Windows` | A signal was sent on a platform that has none. | Expected on Windows. |
| `WARNING: Unknown Signal Number <signal> in posix_kill` | Code asked for a signal that is not mapped. | The caller. |

## Bundled scripts

Tag `LMSENSORS`, from `scripts/ss_netsnmp_lmsensors.php`. Included because the
strings are distinctive and the script ships with the install.

| Message | Condition |
|---|---|
| `ERROR: Device with ID <id> not found!` | The device id passed to the script does not exist. |
| `ERROR: Device with ID <id> has an invalid Sensor Type of <type>` | The sensor type argument is not one the script handles. |
| `ERROR: Device with ID <id> has an empty request type` | No request type was passed. |
| `ERROR: Device with ID <id> has an invalid request of <request>` | The request type is not `index`, `query` or `get`. |
| `ERROR: Device with ID <id> has an empty get or query data request.` | The data argument is missing. |
| `ERROR: Device with ID <id> has an invalid get or query data request of <request>` | The data argument names an unknown field. |
| `WARNING: Device with ID <id> Does not appear to have lmsensors installed!` | The device returned no lm-sensors tree. |
| `WARNING: Device with ID <id> appears to have invalid snmpwalk data returned!` | The walk returned data the script cannot parse. |

## Interface messages

These are the banners the web interface shows after an action. They do not
reach the log. They come from a registry of 83 entries, raised by id through
`raise_message()`; a caller may also pass its own text, which is not listed
here because it is built at the call site.

Levels are info, error, or CSRF.

### Numbered entries

| Id | Message | Level |
|---|---|---|
| 1 | `Save Successful.` | info |
| 2 | `Save Failed.` | error |
| 3 | `Save Failed due to field input errors (Check red fields).` | error |
| 4 | `Passwords do not match, please retype.` | error |
| 5 | `You must select at least one field.` | error |
| 6 | `You must have built in user authentication turned on to use this feature.` | error |
| 7 | `XML parse error.` | error |
| 8 | `The directory highlighted does not exist.  Please enter a valid directory.` | error |
| 9 | `The <application> log file must have the extension '.log'` | error |
| 10 | `Data Input for method does not appear to be whitelisted.` | error |
| 11 | `Data Source does not exist.` | error |
| 12 | `Username already in use.` | error |
| 13 | `The SNMP v3 Privacy Passphrases do not match` | error |
| 14 | `The SNMP v3 Authentication Passphrases do not match` | error |
| 15 | `XML: <application> version does not exist.` | error |
| 16 | `XML: Hash version does not exist.` | error |
| 17 | `XML: Generated with a newer version of <application>.` | error |
| 18 | `XML: Cannot locate type code.` | error |
| 19 | `Username already exists.` | error |
| 20 | `Username change not permitted for designated template or guest user.` | error |
| 21 | `User delete not permitted for designated template or guest user.` | error |
| 22 | `User delete not permitted for designated graph export user.` | error |
| 23 | `Data Template includes deleted Data Source Profile.  Please resave the Data Template with an existing Data Source Profile.` | error |
| 24 | `Graph Template includes deleted GPrint Prefix.  Please run database repair script to identify and/or correct.` | error |
| 25 | `Graph Template includes deleted CDEFs.  Please run database repair script to identify and/or correct.` | error |
| 26 | `Graph Template includes deleted Data Input Method.  Please run database repair script to identify.` | error |
| 27 | `Data Template not found during Export.  Please run database repair script to identify.` | error |
| 28 | `Device Template not found during Export.  Please run database repair script to identify.` | error |
| 29 | `Data Query not found during Export.  Please run database repair script to identify.` | error |
| 30 | `Graph Template not found during Export.  Please run database repair script to identify.` | error |
| 31 | `Graph not found.  Either it has been deleted or your database needs repair.` | error |
| 32 | `SNMPv3 Auth Passphrases must be 8 characters or greater.` | error |
| 33 | `Some Graphs not updated. Unable to change device for Data Query based Graphs.` | error |
| 34 | `Unable to change device for Data Query based Graphs.` | error |
| 35 | `Some settings not saved. Check messages below.  Check red fields for errors.` | error |
| 36 | `The file highlighted does not exist.  Please enter a valid file name.` | error |
| 37 | `All User Settings have been returned to their default values.` | info |
| 38 | `Suggested Field Name was not entered.  Please enter a field name and try again.` | error |
| 39 | `Suggested Value was not entered.  Please enter a suggested value and try again.` | error |
| 40 | `You must select at least one object from the list.` | error |
| 41 | `Device Template updated.  Remember to Sync Devices to push all changes to Devices that use this Device Template.` | info |
| 42 | `Save Successful. Settings replicated to Remote Data Collectors.` | info |
| 43 | `Save Failed.  Minimum Values must be less than Maximum Value.` | error |
| 44 | `Unable to change password.  User account not found.` | error |

### Named entries

| Key | Message | Level |
|---|---|---|
| `input_save_wo_ds` | `Data Input Saved.  You must update the Data Templates referencing this Data Input Method before creating Graphs or Data Sources.` | info |
| `input_save_w_ds` | `Data Input Saved.  You must update the Data Templates referencing this Data Input Method before the Data Collectors will start using any new or modified Data Input - Input Fields.` | info |
| `input_field_save_wo_ds` | `Data Input Field Saved.  You must update the Data Templates referencing this Data Input Method before creating Graphs or Data Sources.` | info |
| `input_field_save_w_ds` | `Data Input Field Saved.  You must update the Data Templates referencing this Data Input Method before the Data Collectors will start using any new or modified Data Input - Input Fields.` | info |
| `clog_invalid` | `Log file specified is not a <application> log or archive file.` | info |
| `clog_remove` | `Log file specified was <application> archive file and was removed.` | info |
| `clog_purged` | `<application> log purged successfully` | info |
| `clog_permissions` | `Unable to clear log, no write permissions` | error |
| `clog_missing` | `Unable to clear log, file does not exist` | error |
| `password_change` | `If you force a password change, you must also allow the user to change their password.` | error |
| `nopassword` | `You are not allowed to change your password.` | error |
| `nopasswordlen` | `Unable to determine size of password field, please check permissions of db user` | error |
| `nopasswordinc` | `Unable to increase size of password field, please check permission of db user` | error |
| `nodomainpassword` | `LDAP/AD based password change not supported.` | error |
| `password_success` | `Password successfully changed.` | info |
| `csrf_timeout` | `CSRF Timeout, refreshing page.` | CSRF |
| `csrf_ptimeout` | `CSRF Timeout occurred due to inactivity, page refreshed.` | error |
| `mg_mailtime_invalid` | `Invalid timestamp. Select timestamp in the future.` | error |
| `poller_sync` | `Data Collector(s) synchronized for offline operation` | info |
| `poller_notfound` | `Data Collector(s) not found when attempting synchronization` | error |
| `poller_noconnect` | `Unable to establish MySQL connection with Remote Data Collector.` | error |
| `poller_nosync` | `Data Collector synchronization must be initiated from the main <application> server.` | error |
| `poller_nomain` | `Synchronization does not include the Central <application> Database server.` | error |
| `poller_nodupe` | `When saving a Remote Data Collector, the Database Hostname must be unique from all others.` | error |
| `poller_dbhost` | `Your Remote Database Hostname must be something other than 'localhost' for each Remote Data Collector.` | error |
| `poller_paths` | `Path variables on this page were only saved locally.` | info |
| `reports_save` | `Report Saved` | info |
| `reports_save_failed` | `Report Save Failed` | error |
| `reports_item_save` | `Report Item Saved` | info |
| `reports_item_save_failed` | `Report Item Save Failed` | error |
| `reports_graph_not_found` | `Graph was not found attempting to Add to Report` | error |
| `reports_not_owner` | `Unable to Add Graphs.  Current user is not owner` | error |
| `reports_add_error` | `Unable to Add all Graphs.  See error message for details.` | error |
| `reports_no_graph` | `You must select at least one Graph to add to a Report.` | error |
| `reports_graphs_added` | `All Graphs have been added to the Report.  Duplicate Graphs with the same Timespan were skipped.` | info |
| `resource_cache_rebuild` | `Poller Resource Cache cleared.  Main Data Collector will rebuild at the next poller start, and Remote Data Collectors will sync afterwards.` | info |
| `permission_denied` | `Permission Denied.  You do not have permission to the requested action.` | error |
| `page_not_defined` | `Page is not defined.  Therefore, it can not be displayed.` | error |
| `custom_error` | `Unexpected error occurred` | error |

A message id with no registry entry and no session text produces
`Message Not Found.` at error level, and writes
`ERROR: Kadupul Error Message Id '<id>' Not Defined` to the log.
