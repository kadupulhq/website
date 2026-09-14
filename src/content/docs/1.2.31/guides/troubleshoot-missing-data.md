---
title: Troubleshoot missing data
description: A step by step procedure for gaps and flat graphs, working from
  device reachability through poller scheduling, the poller cache, filesystem
  permissions and the heartbeat.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 5
slug: 1.2.31/guides/troubleshoot-missing-data
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Work the steps in order. Each one rules out everything below it, which is what keeps
this from turning into guesswork. Most reports resolve at step 3 or step 4.

Before starting, answer one question, because it tells you where to enter the
sequence.

| Scope | Start at |
|---|---|
| One data source on one device | Step 4 |
| Every graph on one device | Step 1 |
| Every graph on every device | Step 3 |
| Graphs that used to work, stopped at a known moment | Step 4, then step 8 |

Distinguish a gap from a flat line first. A gap means no value arrived. A flat line
means a value arrived and it was the same one. They have almost no causes in common.
See [Read your first graph](/1.2.31/start/first-graph/) if you are not sure which you have.

## 1. Is the device answering

From the machine the poller runs on, not from your workstation.

```bash
snmpget -v2c -c public device.example.net sysDescr.0
```

A timeout here ends the investigation. Nothing downstream can fix an unreachable
device.

Two traps live at this step.

**The availability method may not be testing what you think.** A device can be
configured to be judged by ping, by SNMP, by both, or by neither. A device set to no
availability check is always considered up.

**An SNMP check with no community string passes.** When availability is judged by
SNMP and the device has an empty community on v1 or v2c, the check is recorded as
satisfied and the device is marked up without a request being made. A device that was
added with the community left blank looks healthy and collects nothing.

A device is not marked down on the first failure. It takes a configured number of
consecutive failed polls, which defaults to two. Between the failure and the status
change, the graph already has a gap that the device status does not explain.

Timeouts are short by default: SNMP 500 milliseconds with three retries, ping 400
milliseconds. A device across a slow path, or one that rate limits SNMP, answers
correctly by hand and times out under the poller. Raise the per-device timeout before
concluding it is down.

## 2. Is the device enabled

A disabled device produces no work list entries at all. It stays in the interface,
keeps its graphs, and collects nothing. Check this before reading any logs.

## 3. Is the poller running, and finishing

Two separate settings have to agree: how often the poller expects to run, and how
often the scheduler actually starts it. Both default to 300 seconds. Setting one
without the other is a common cause of system-wide gaps.

Symptoms in the log and what they mean:

| Log message | Meaning |
|---|---|
| Configured to run too often | The scheduler is starting the poller faster than the interval allows |
| Out of sync with the Poller Interval | More time passed since the last run than the interval permits |
| Polling cycle exceeded poller interval by N seconds | The run finished, late |
| Processes detected as overrunning a polling cycle | A previous run had not finished when the next started |

A poller that overruns produces small, scattered gaps rather than a clean outage,
because some data sources arrive after their heartbeat. That pattern is distinctive
and is worth learning to recognise: gaps that appear on many devices at once, a few
samples wide, with no correlated device event.

If the poller is overrunning, the levers are the number of concurrent processes, the
per-device thread count, and reducing what is being collected. Confirm which by
looking at the per-device polling times before changing anything.

## 4. Is the data source in the work list

This is where most single data source reports end.

The poller does not consult the configuration tables each run. It reads a precomputed
work list, described in [Architecture](/1.2.31/concepts/architecture/). That list holds a
snapshot: the hostname, the SNMP credentials and version, the port and timeout, the
OID or command, the RRD file path, and how many values the data source expects.

Everything in that snapshot is stale until the list is rebuilt. A community string
changed on the device page, an OID corrected in a template, a data source renamed:
none of it reaches the poller until then.

```bash
php cli/rebuild_poller_cache.php --host-id=42
php cli/rebuild_poller_cache.php
```

Three conditions remove a data source from the list entirely, with no error shown on
the graph.

**An empty index.** A data source created by a data query whose index no longer
resolves produces no entry. The poller logs a warning naming the devices with bad
indexes and the number of data sources affected. The fix is to reindex, or to delete
or disable the data source. See
[Monitor a switch](/1.2.31/guides/monitor-a-switch/) for how indexes are resolved.

**A data input failing the whitelist.** If a data input whitelist file is in use, a
command string that no longer matches the recorded one stops the data source being
scheduled. The log says so and the interface does not.

```bash
php cli/input_whitelist.php --audit
```

**An inactive data source.** A data source can be switched off without being deleted.

## 5. Did a value arrive

Turn on invalid data logging. It defaults to off, which means per-data-source
collection failures are invisible in the default configuration. Set it to detailed,
run a cycle, and read the log.

For a single device, raise the log level for that device alone rather than globally.
The selective device debug setting takes a comma separated list of device
identifiers and raises verbosity for those devices during collection only. This is
the difference between reading one device's poll and reading ten thousand.

What you are looking for is a line naming the data source and the value it returned.
`U` means the device did not answer that OID, or the script returned nothing usable.

## 6. Did the value get written

A value can arrive and still not reach the file.

A write happens only when every value the data source expects has arrived for that
timestamp. A data source with four fields that returns three has its whole timestamp
discarded, and the partial rows stay in the output table. Kadupul reports this.

| Log message | Meaning |
|---|---|
| Poller output table not empty | Values arrived that could not be matched to a work list entry, or were incomplete |
| Data sources not returning all data | Named data templates where the field count did not match |

Partial returns are the sharp case, because the device is clearly answering. One
missing field in a multi-value script or a partially implemented MIB takes out the
whole data source, not the one field alone.

## 7. Can the poller write the file

The RRD file is created on the first successful update, not when the data source is
created. **A missing file can mean creation failed, the path changed, or a file was removed.** That is
a useful signal, because it separates "never worked" from "stopped working" in one
check.

```bash
ls -l /path/to/rra/device_traffic_in_42.rrd
```

Run maintenance commands as the poller user. A file created by root that the poller
user cannot write produces gaps starting at the moment of the maintenance, with
nothing in the poller log pointing at the cause.

## 8. Check the archive against what the database expects

An RRD file's structure is fixed at creation. The configuration in the database can
be changed afterwards, and the two then disagree. The file wins, because the file is
what holds the data.

Kadupul can compare the two and report the differences, including the tune commands
that would reconcile them. Run that comparison for any data source whose behaviour
changed without its configuration changing.

The differences worth acting on:

**Heartbeat.** The maximum permitted interval between updates before RRDtool
treats the data as unknown. Compare the actual file with its profile: shipped
five-minute and one-minute profiles use 600 seconds, while the thirty-second
profile uses 1,200 seconds. Do not assume every profile uses twice the step, or
that a fixed number of missed polls always produces a visible gap.

```bash
php cli/update_heartbeat.php --list-heartbeats
php cli/update_heartbeat.php --new-heartbeat=600
```

That command updates both the file and the database. Changing one alone puts them
back out of step.

**Step.** If the file's step and the configured interval disagree, samples are
discarded or interpolated. This happens after a poller interval change without a work
list rebuild.

**Maximum.** RRDtool records any value above a data source's maximum as unknown. For
interface traffic the maximum is derived from the speed discovered when the file was
created, so a port that was slower then can have a ceiling below its current traffic.
The graph then gaps at high load and looks fine when quiet.

## 9. If it is flat rather than gapped

A flat line means values arrived and did not change.

| Cause | How to tell |
|---|---|
| The counter on the device genuinely stopped | Walk the OID twice, a minute apart, by hand |
| Stored as `GAUGE` when it should be `COUNTER` | The line sits at a large, steady, implausible number |
| Values clipped at the maximum | Flat at exactly the ceiling, or unknown above it |
| The graph is reading a different data source than you think | Check what the graph item points at |

The second one is worth checking early on anything hand-built. A counter stored as a
gauge produces a plausible looking graph of the wrong thing, which is harder to
notice than an obviously broken one.

## 10. Two things that hide from this procedure

**On-demand RRD updating.** When it is enabled, updates are buffered and the files
are written when a graph is requested or when a refresh interval elapses, which
defaults to an hour. The file's modification time is then not evidence of anything.
Check the buffer, not the file.

**Timestamps that are not newer.** An update whose timestamp is not later than the
last one already in the file is skipped rather than reported as an error. Two pollers
writing the same file, or a clock stepping backwards, produces gaps with a clean log.
If the gaps started when a second data collector was added, or after a time
correction, this is the first thing to check.

## Quick reference

| Symptom | Most likely step |
|---|---|
| Everything stopped at once | 3 |
| One device stopped, others fine | 1 |
| A change had no effect | 4 |
| Narrow gaps scattered across many devices | 3, then 8 |
| Gaps only under load | 8, maximum |
| Data source never worked, RRD file absent | 7, then 4 |
| A port's graph went flat after maintenance | 4, empty index |
| Flat at an implausible steady value | 9 |
