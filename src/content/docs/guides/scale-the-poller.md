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
| Poller interval | How often a data source is sampled | 10, 15, 20, 30, 60 or 300 seconds |

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
that had not finished is abandoned. The affected data sources get no sample for
that interval, which appears on the graph as a gap, not a zero.

**The next run notices the wreckage.** At startup the poller counts process rows
that were never closed out and warns that processes were detected as overrunning
a polling cycle. A non-zero count here is the clearest signal that you are over
budget, because it survives the run that produced it.

**The clocks drift apart.** If more time passed since the last run than the
budget allows, the poller warns that the launcher is out of sync with the poller
interval. This one is usually the launcher, not the poller: a cron entry at the
wrong frequency, a stopped service, or a host that was asleep.

All three also email the primary admin account, if one is set with a valid
address.

There is a fourth case that is not an overrun. If the poller is started again
sooner than it expects, it logs that it is configured to run too often and exits
without collecting. Run it by hand with `--force` to override that check.

## The statistics line

Every completed run writes one statistics line to the log. It carries the
elapsed time, the collection method, the process and thread counts, the number
of devices, devices per process, data sources, and RRD files processed.

Trend that elapsed time. A single run near the budget is noise. A run time that
climbs week over week is a capacity plan.

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

An option called Balance Process Load distributes poller items evenly across
processes rather than splitting device ids into equal-sized ranges. Turn it on
when your devices are wildly different sizes, which is most networks.

## The PHP collector versus the C collector

Two collectors ship. `cmd.php` is PHP. `spine` is a C program using pthreads.

| | PHP collector | Spine |
|---|---|---|
| Parallelism | Processes only | Processes and threads |
| Thread setting | Forced to 1 regardless of configuration | Honoured |
| Script server | One per process, not configurable | 1 to 15 per process, configurable |
| Script timeout | Not applied | Applied, default 25 seconds |
| Install | Ships with the code | Separate build, path configured before it can be selected |

The forced thread count is worth stating plainly: if the collector is set to the
PHP one, the thread setting is overwritten with 1 at the start of every run. Any
number you put in the field is discarded. Scaling the PHP collector means more
processes, and the guidance in the source is to stay at or under twice the CPU
core count.

Spine reads its runtime options from the same settings the web interface writes,
so most of what you configure applies to both. It reads database credentials from
its own configuration file, searched for in the current directory, then `/etc`,
then `/etc/cacti`, then `../etc`, unless you pass a path explicitly.

Spine can be driven by hand, which is the fastest way to time one device:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` collects without writing results, which makes it safe to run
alongside a live poller.

## Database connections

Threads are not free. Each spine thread holds its own database connection, and so
does each script server.

```
connections = processes * (threads + script_servers + 1)
```

That is per data collector. Sum it across collectors, then add headroom for
interactive logins, then compare against the server's connection limit. The
recommended floor for that limit is 100, and a busy install with several threads
per process passes it quickly.

Running out of connections does not look like a connection error in the graphs.
It looks like missing samples on a rotating set of devices, because the threads
that failed to connect are different every run.

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

The in-flight results table, separate from the buffer, is a memory table. Size
the server's heap table limit for it, or inserts fail under load and you lose the
samples in that pass.

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
- You need collection to continue when the central site is unreachable.

Do not move to one to fix a slow database or a slow disk under the RRD tree. Both
of those get worse with remote collectors, because every collector writes into
the same database.

Each collector carries its own process and thread counts, its own database
credentials, and a synchronisation interval, which defaults to two hours. There
is a command line tool to force a full synchronisation rather than waiting.

The central install can replicate the web site and plugin code out to remote
collectors so they update themselves. That replication can be turned off if you
deploy code some other way.

## Which limit did you hit

Work down this table. Each row rules out the ones below it.

| Observation | Limit | What to change |
|---|---|---|
| Launcher out of sync warning, poller otherwise fast | Nothing is running the poller on time | The cron entry or the service, not the poller |
| Run time flat, one device always late | Single device too large for one process | Per-device threads, spine, or split the device |
| Run time scales with device count, CPU saturated | Collector CPU | More processes, or a remote collector |
| Run time scales with device count, CPU idle | Device round-trip latency | More threads, which means spine |
| Missing samples on a rotating set of devices | Database connections | Connection limit, or fewer threads |
| Run time fine, RRD writes slow, disk busy | Storage | Deferred RRD writes, or faster disk |
| Everything slow including the web interface | Database | Buffer pool size, then the database host |

Two traps worth naming.

**Changing the poller interval does not take effect until the poller cache is
rebuilt.** The cache carries the step for each item. Change the interval, rebuild
the cache, and expect a discontinuity in the affected RRD files.

**A faster interval multiplies everything.** Going from 300 seconds to 60 does
not make the run five times shorter. It makes five runs happen where one did, each
doing the same work, inside the same launcher window.
