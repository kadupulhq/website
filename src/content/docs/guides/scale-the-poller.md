---
title: Scale the poller
description: What to change when collection stops finishing inside its interval, and how to tell which limit you actually hit.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 6
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Scaling the poller is one question: does a collection run finish before the next
one starts? Everything below is about answering that and then moving the answer
back to yes.

Read [Architecture](/concepts/architecture/) first if you are not clear on which
part does the collecting.

## The two clocks

There are two intervals and they are not the same setting.

| | What it is | Allowed values |
|---|---|---|
| Launcher interval | How often the operating system starts the collector, from cron or from the `cactid` service | 60 or 300 seconds |
| Poller interval | Base collection cadence; individual data source steps can be longer | 10, 15, 20, 30, 60 or 300 seconds |

When the poller interval is shorter than the launcher interval, one launch
performs several collection passes in a loop. The number of passes is the
launcher interval divided by the poller interval.

The budget for the whole launch is derived from those two numbers: passes
multiplied by the poller interval, minus two seconds. That is the wall clock the
run is measured against.

## What happens when a run overruns

Three distinct things, and they produce three distinct log lines.

**The run is cut off.** When the elapsed time passes the budget, the poller logs
that the maximum runtime was exceeded, writes its statistics, and exits. Work
that has not produced a sample can leave a gap. Samples already accepted into
the durable queue can remain pending for a later successful RRD write; an overrun
does not imply every unflushed measurement was discarded. Inspect queue depth and
logs alongside the graph, and do not clear retained rows to make the next run look clean.

**The next run notices the wreckage.** At startup the poller counts process rows
that were never closed out and warns that processes were detected as overrunning
a polling cycle. Investigate unfinished or stale process records and actual
running children; the warning alone does not identify the bottleneck.

**The clocks drift apart.** If more time passed since the last run than the
budget allows, the poller warns that the launcher is out of sync with the poller
interval. This one is usually the launcher, not the poller: a cron entry at the
wrong frequency, a stopped service, or a host that was asleep.

These paths call the admin notification helper. Delivery depends on configured
recipients, notification controls and functioning mail transport; a log warning
does not prove that an email arrived. See [Email notifications](/guides/send-email-notifications/).

There is a fourth case that is not an overrun. If the poller is started again
sooner than it expects, it logs that it is configured to run too often and exits
without collecting. `--force` bypasses that timing check; use it only during a
controlled diagnostic with scheduled and other manual launches stopped. It does
not add capacity or make overlapping collection safe.

## The statistics line

Every completed run writes one statistics line to the log. It carries the
elapsed time, the collection method, the process and thread counts, the number
of devices, devices per process, data sources, and RRD files processed.

Trend elapsed time, tail latency, queue depth and failed updates. Investigate even
an isolated near-budget run when it causes gaps; sustained growth helps identify
when capacity or collection behavior needs to change.

## Processes and threads

Two dials, and they do different things.

| Dial | Unit of work it divides | Which collector uses it |
|---|---|---|
| Processes | Devices, split into contiguous ranges of device id | Both |
| Threads | Items within one device | Spine only |

The consequence is the part people trip on: **a process is assigned whole
devices.** One device with five thousand data sources cannot be spread across
processes. It lands in one process and that process takes as long as it takes.
Adding processes does nothing for it.

Both values are held per data collector, not globally. The values on the settings
page are presets applied when a new data collector is created. Changing the
preset does not change an existing collector.

There is also a per-device thread count, which is how a single large device gets
divided. It applies only to the C collector.

Balance Process Load uses accumulated item counts to choose boundaries between
whole devices in device-id order. It does not split one device or guarantee equal
item counts, and item count is not execution time. Compare per-process timing
before and after enabling it on an isolated representative workload.

## The PHP collector versus the C collector

The PHP collector, `cmd.php`, ships with the application. Kadupul plans to
maintain a Spine fork, but its source location and validated builds are not yet
documented. Use PHP until that evidence is available. The Spine comparisons,
thread settings and commands below describe inherited behavior, not an available
or supported Kadupul deployment.

| | PHP collector | Spine |
|---|---|---|
| Parallelism | Processes only | Processes and threads |
| Thread setting | Forced to 1 regardless of configuration | Honoured |
| Script server | One per process, not configurable | 1 to 15 per process, configurable |
| Script timeout | Not applied | Applied, default 25 seconds |
| Install | Ships with the code | Planned fork; no validated Kadupul build documented |

The forced thread count is worth stating plainly: if the collector is set to the
PHP one, the runtime thread variable is set to 1; this does not rewrite the stored
collector thread setting. Scaling the PHP collector can involve more
processes, and the guidance in the source is to stay at or under twice the CPU
core count.

Spine configuration and command behavior require validation against the exact
binary being evaluated. The PHP application source alone does not establish its
configuration search order, thread behavior or side effects.

Inherited examples for an isolated Spine evaluation, not validated Kadupul commands:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` is intended to avoid result writes. It still contacts devices and
runs collection scripts; validate its side effects in an isolated test first.

## Database connections

Threads are not free. Each spine thread holds its own database connection, and so
does each script server.

```
estimated worker connections = processes * (threads + script_servers)
```

This is the estimate in the application settings help, not a measured upper bound.
Sum it across collectors and add capacity for poller parents, web requests,
maintenance and other clients. Measure actual peak connections and rejected
connections before choosing the database limit; increasing it also consumes resources.

Connection exhaustion can cause missing samples, but rotating gaps are not a
unique diagnosis. Confirm it with database connection metrics and application errors.

## Deferred RRD writes

There is a mode that stops the poller from writing to RRD files on every pass.
Results accumulate in a database table instead and are flushed in bulk, either on
a timer or when a graph asks for the file. It trades a large number of small
writes for a small number of large ones.

Two facts about it that matter operationally:

- It is required when you have remote data collectors. This is not advice, it is
  a condition the software states.
- The buffer table is durable, not in-memory, so unflushed samples survive a
  restart. They also mean your RRD files are behind your database. See
  [Back up and restore](/guides/back-up-and-restore/) before you snapshot
  anything.

The main in-flight `poller_output` queue is also InnoDB in this revision. Storage
preflight rejects a MEMORY queue; increasing the heap-table limit does not resolve
that refusal. With producers stopped and a matched backup retained, convert an
inherited unsuitable queue explicitly, then check storage as each service account:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

These are separate operations. Preserve pending rows and monitor database disk
space and queue age as well as row count. See [Upgrade safely](/guides/upgrade-safely/)
for queue selection, service-account trust checks and restart prerequisites.

## When to move to remote collectors

A remote data collector is a second machine running the same code with a
different collector id, polling a subset of devices and writing results back to
the central database.

Move to one when the bottleneck is on the collecting side rather than the storing
side:

- The poller host's CPU is saturated during a run and idle between runs.
- Round-trip latency to a group of devices dominates the run, and that group sits
  behind one link.
- A site is on the far end of a WAN you do not want to poll across.
- You need isolated-site collection, and have validated offline buffering and
  recovery for that collector before relying on it.

Remote collectors do not remove central database or RRD write limits. Measure
central ingestion and flush capacity before increasing collection throughput;
extra producers can increase an existing backlog.

Each collector carries its own process and thread counts, its own database
credentials, and a synchronisation interval, which defaults to two hours. There
is a command line tool to force a full synchronisation rather than waiting.

The central install can replicate the web site and plugin code out to remote
collectors so they update themselves. That replication can be turned off if you
deploy code some other way.

## Which limit did you hit

Use this table to form hypotheses, then verify them with logs and measurements.
Several limits can occur together. Spine options remain unvalidated here.

| Observation | Limit | What to change |
|---|---|---|
| Launcher out of sync warning, poller otherwise fast | Scheduling delay, prior overrun or host interruption | Inspect launch history and process state |
| Run time flat, one device always late | Slow responses, expensive scripts or concentrated work | Time its input methods and review timeout/retry behavior |
| Run time scales with device count, CPU saturated | Collector CPU pressure | Measure whether more processes help; consider collector placement |
| Run time scales with device count, CPU idle | Network, script or database waits | Measure wait sources before changing concurrency |
| Missing samples on a rotating set of devices | Connections, timeouts or other collection failures | Check errors, connection metrics and retained queues |
| Run time fine, RRD writes slow, disk busy | Storage | Deferred RRD writes, or faster disk |
| Everything slow including the web interface | Database | Buffer pool size, then the database host |

Two traps worth naming.

**Changing the base interval is not the same as changing every data source step.**
Reconcile profiles, cached item steps and RRD heartbeat/step definitions. Rebuilding
the cache does not reshape existing RRD files. See
[Data retention](/guides/manage-data-retention/) and
[Time and intervals](/concepts/time-and-intervals/).

**A faster interval multiplies everything.** Going from 300 seconds to 60 does
not make the work five times cheaper. Sources configured for that faster cadence
are collected more often; sources retaining longer steps need not run on every
base pass. Measure the resulting load rather than assuming every pass has equal work.
