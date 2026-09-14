---
title: Monitor Kadupul itself
description: Which numbers tell you the monitoring system is healthy, which of
  them Kadupul already records about itself, the thresholds worth watching, and
  what each symptom arrives before.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 29
slug: 1.2.31/guides/monitor-kadupul-itself
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A monitoring system that is quietly failing looks exactly like a network that is
quietly working. Graphs draw. Nothing errors. Samples go missing a few at a time
and nobody notices until somebody asks about last Tuesday.

Six things are worth watching. Kadupul already records most of them about itself,
in two places that behave very differently, and the difference decides whether you
have a number or a trend.

## The two places, and why it matters

**Settings rows hold the last run only.** Each completed run replaces a row in the
settings table with its own statistics. There is exactly one value, and the
previous one is gone. Read it and you know how the last run went. You cannot know
whether it was better or worse than a month ago.

**The collector row holds lifetime aggregates.** The data collector's own row
carries total time, minimum, maximum, average, and a poll count, updated on every
run. Those are aggregates over the life of the collector, not a series. An average
across ten thousand runs moves slowly enough to hide a doubling that happened last
week.

Neither is history. History exists only if something samples those values on an
interval and stores them, which is what the shipped self-monitoring device package
does. Until you set that up, you have the current value and the log.

## What is recorded

### The run statistics line

Every completed run writes one line to the application log, under the `SYSTEM`
tag, and the same text into a settings row.

```
STATS: Time:34.5162 Method:spine Processes:8 Threads:8 Hosts:1043 HostsPerProcess:131 DataSources:41182 RRDsProcessed:20591
```

| Field | What it tells you |
|---|---|
| `Time` | Elapsed seconds for the run. The number to trend |
| `Method` | Which collector ran |
| `Processes`, `Threads` | The concurrency actually used, which is the collector's row and not the settings preset |
| `Hosts`, `HostsPerProcess` | The division of work |
| `DataSources` | Values the run expected |
| `RRDsProcessed` | Files actually written |

The settings row is per collector. Collector 1 writes `stats_poller`; every other
collector writes `stats_poller_` followed by its id.

`DataSources` against `RRDsProcessed` is the pair to read together. The ratio is a
property of your estate, because several fields land in one file. What matters is
that the ratio holds steady. A run where `RRDsProcessed` falls while `DataSources`
does not is a run where values arrived and files were not written.

### The other statistics lines

Each subsystem that runs at the end of a cycle writes its own line, with the same
`STATS:` prefix and its own settings row.

| Subsystem | Line shape | Settings row |
|---|---|---|
| Recache | `Poller:… RecacheTime:… DevicesRecached:…` | `stats_recache_<id>` |
| Deferred RRD writes | `Time:… RRDUpdates:…` | `stats_boost`, and one per child process |
| Deferred write detail | Timing broken out per phase | `stats_detail_boost`, cleared every run |
| Data source statistics | `Time:… Type:… Threads:… RRDfiles:… DSSes:…` plus RRDtool user, system and real time | `stats_dsstats_<type>` |
| Archive checking | The same shape | `stats_rrdcheck_<type>` |
| Spike removal | `Time:… Graphs:… Purges:… Kills:…` | `stats_spikekill` |
| Maintenance | `MAINT STATS: Time:…` | None. Log only |
| Archive purging | `RRDMAINT STATS: Time:… Purged:… Archived:…` | None. Log only |
| Log rotation | `LOGMAINT STATS: Time:… Rotated:… Removed:… Days Retained:…` | None. Log only |

The last three exist in the log and nowhere else. If you want a trend on
maintenance duration, the log is the only source.

The deferred write detail row is the one worth knowing about when a flush is slow.
It breaks the run into phases: fetching records, cycling results, resolving the
file name and template, reading the file's last update, the update itself, and the
delete. That tells you whether a slow flush is the database or the storage, which
is otherwise a guess.

### The shipped self-monitoring device package

A device package for monitoring the collector itself ships with the code, as
`install/templates/Cacti_Stats.xml.gz`. Its names carry the upstream branding; see
[Coming from Cacti](/1.2.31/guides/coming-from-cacti/).

It is not loaded by the schema. It is imported during installation when you select
it, or afterwards from the template import page. See
[Import and export templates](/1.2.31/guides/import-and-export-templates/).

What it contains:

| Part | What it is |
|---|---|
| One device template | Applied to the install itself, added as a device |
| Script data inputs | PHP scripts that read the application's own tables rather than SNMP |
| A data query | Discovers the data collectors, so a multi-collector install graphs each one |
| Graph templates | Poller runtime, poller items, devices, collector runtime and settings, recache statistics, deferred write runtime, updates, memory, record count, table size, average row size and timing detail, graph exports, users, logins and sessions |

The scripts read the same tables the interface reads. One of them counts poller
cache rows grouped by collection type, so you get separate SNMP, script and script
server counts rather than one total. Others read the deferred write buffer's size,
row count and average row length from the server's own table metadata, which is
the only place those numbers exist.

**Set it up on day one, not on the day you need it.** The point of the package is
turning point-in-time values into history, and history cannot be created
retroactively. An install that adds it after six months has six months of blank
archive and no answer to "when did this start".

A second shipped package monitors the operating system of the machine Kadupul runs
on: CPU, load, memory, processes, users and partitions. It reads the host, not the
application. Both are worth having and they answer different questions.

### The SNMP agent

Kadupul can expose its own statistics over SNMP, which is how you get them into
another monitoring system. The recache time is one of the objects it publishes.
Enable it deliberately; it is another listener.

## Poller run duration

The number that moves first and explains the most.

### The budget

The poller derives its own deadline:

```
poller_runs = cron_interval / poller_interval
budget      = poller_runs * poller_interval - 2
```

At the shipped defaults, both intervals are 300 seconds and the budget is 298. A
run that passes it is cut off mid-collection, its statistics are written, and it
exits. Work that had not finished is abandoned.

### Thresholds

| Run time | State | What it precedes |
|---|---|---|
| Under 60% of budget | Healthy | Nothing |
| 60% to 85% | Watch | A bad day, a slow device, or a discovery run pushes it over |
| Over 85% | Act | Overruns on any variation in device response time |
| Over 100% | Failing now | Abandoned work, gaps scattered across many devices |

The 60 and 85 percent lines are recommendations, not settings. The budget itself is
the code's own arithmetic.

### The trend matters more than the value

One run near the budget is noise. A run time climbing week over week is a capacity
plan, and it is the reason to graph the number rather than read it.

Three growth patterns and what each means:

| Pattern | Cause |
|---|---|
| Steps up when devices are added | Linear growth. Expected. Project it forward |
| Climbs with no configuration change | A device answering more slowly, or the database getting slower |
| Sawtooth, worse at one time of day | Something scheduled is competing. Look at what runs on the hour |

[Scale the poller](/1.2.31/guides/scale-the-poller/) covers which limit you hit, and
[Capacity planning](/1.2.31/guides/capacity-planning/) covers projecting it forward.

### The signal that survives the run

An overrun is cut off and the run reports it once. The next run counts collector
processes that were never closed out and warns that processes were detected as
overrunning a polling cycle. That warning is the better signal, because it survives
the run that produced it and appears whether or not anyone was watching the log at
the time.

Treat any non-zero count as a fault. It has no benign explanation.

### The collector heartbeat

Separately, the poller checks every enabled collector's last status time. A
collector whose last status is older than twice the poller interval is marked with
a failure status, logged, and the primary administrator is mailed at most once
every 1800 seconds.

That is the check that catches a collector which stopped entirely rather than one
running late. It only runs if some collector is still running, so it cannot catch
the case where the last collector stops.

**An install with one collector has nothing watching it.** Something outside
Kadupul has to check that the poller ran. The absence of the statistics line is the
check; write it against the log, or against the file modification time of a data
source you know is on a short step.

## Cache staleness

The collector reads a precomputed work list rather than your configuration. See
[The poller cache](/1.2.31/concepts/the-poller-cache/) for why. Staleness there is the
reason a change appears to do nothing, and it is the one item on this page the
system does not measure.

**There is no computed staleness delta.** Nothing compares the work list against
the configuration it was built from and reports the difference. The cache viewer
lists what is in the cache; it does not tell you what should be.

What you do have:

| Signal | What it shows |
|---|---|
| Per-row last updated timestamp | When that cache entry was last written |
| Per-row present flag | Whether the entry is still considered live |
| A cache change hash, per collector | Rewritten whenever the cache changes. Remote collectors compare it to decide whether to resync |
| The collector's sync state | A requires-sync flag, a last sync time, and a per-collector sync interval defaulting to two hours |

Practical checks that follow from those:

**Trend the count of cache rows.** It should change only when you create or delete
data sources. A count that moves when nothing was created is worth a look. A count
that does not move after a bulk creation means the cache was not rebuilt.

**Trend the oldest last-updated timestamp.** Entries far older than your last
configuration change are entries nothing has revisited.

**Watch the recache statistics.** The recache line reports how many devices were
recached and how long it took. A sustained non-zero device count means data queries
are being re-run every cycle, which costs poll window. An always-zero count on an
estate with changing hardware means reindexing is not happening.

Automatic periodic reindexing exists as a setting and **defaults to disabled**. The
choices are daily, weekly or monthly, run at midnight. Per-data-query reindex
methods are a separate setting and are the ones that actually keep ports attached
to their history; see [Monitor a switch](/1.2.31/guides/monitor-a-switch/).

After any bulk configuration change, rebuild rather than wonder:

```bash
php cli/rebuild_poller_cache.php
php cli/rebuild_poller_cache.php --host-id=42
```

## RRD write behaviour

Two failure modes, depending on which path you are on.

### Direct writes

The run statistics line's `RRDsProcessed` count is the measurement. Trend it
against `DataSources`. A drop in files written with no drop in data sources
expected means values arrived and did not reach the files.

The system also reports the two conditions that cause that, both as warnings:

| Warning | Meaning | What it precedes |
|---|---|---|
| The results table was not empty | Values arrived that could not be matched to a work list entry, or arrived incomplete | Those data sources silently miss samples every cycle |
| Data sources are not returning all data | Named data templates where the field count did not match | The same, scoped to a template you can go and fix |

The second one names the data template, which is the part that makes it
actionable. A data source expecting four values that gets three has its whole
timestamp discarded, not the one field. See
[Troubleshoot missing data](/1.2.31/guides/troubleshoot-missing-data/).

The first one lists the affected data source ids, up to twenty of them, and then
deletes the rows. If you have more than twenty, the log names twenty and the rest
are gone. Raise this to a fault the first time it appears rather than the fifth.

### Deferred writes

When writes are deferred, four numbers matter and the shipped package graphs all of
them.

| Number | Healthy | What a bad value precedes |
|---|---|---|
| Run duration | Well under the configured maximum runtime, 1200 seconds by default | A flush that never finishes; archive tables accumulate |
| Buffer rows after a run | Back near zero | The buffer grows without bound and files fall further behind |
| Buffer table size against the server's maximum | Comfortably under | Insert failures, which lose samples rather than delaying them |
| Peak memory | Under the per-process limit, 1 GB by default | The flush process dies mid-run |

Two triggers start a flush: a timer, defaulting to an hour, or the buffer passing a
record count, defaulting to a million. Whichever comes first.

**Know which trigger is firing.** On a large install the record count fires long
before the timer, and raising the interval then changes nothing. The arithmetic is
in [Capacity planning](/1.2.31/guides/capacity-planning/).

**Watch for accumulating archive tables.** A flush renames the buffer aside and
drains the copy, dropping it when the run completes. A run that does not complete
leaves the copy behind for the next run to pick up. One is normal during a flush.
Several standing between flushes means the flush is losing.

**The interface is not evidence.** Drawing a graph flushes that data source first,
so the web interface shows current data while the files are an hour behind.
Anything reading the files directly, backups included, sees them as they are. See
[High volume writes](/1.2.31/concepts/high-volume-writes/) and
[Back up and restore](/1.2.31/guides/back-up-and-restore/).

## Database growth

Most of the schema is definitions and stays small. What grows is listed in
[Tune database performance](/1.2.31/guides/tune-database-performance/). What matters here
is which of it cleans itself.

### Cleaned automatically

| Table | Retention |
|---|---|
| Collector process registry | Completed rows deleted at the start of the next cycle |
| Results in flight | Rows deleted as they are consumed |
| Realtime results | Rows older than 300 seconds; cached images older than two hours |
| Hourly statistics cache | The configured hourly duration, defaulting to 60 minutes |
| Deferred write archive tables | Dropped when the run that drains them completes |
| Deferred write detail statistics | Cleared every run |
| Authentication caches | On a schedule, and truncated entirely when the cache is turned off |
| Removed data sources and their files | 1,000 rows per maintenance pass, with a setting choosing delete or archive |

### Not cleaned automatically

**The user activity log has no automatic purge.** There is no retention setting and
no maintenance pass that touches it. The only path that removes rows is a manual
action in the interface. On a busy install with many accounts it grows for the life
of the system.

Check its row count on the same schedule you check anything else, and clear it as a
maintenance task. A table nothing prunes is a table that eventually shows up as a
slow page.

**Per-period statistics grow with the estate, not with time.** Five rollup tables
each hold one row per data source field. That is a fixed size for a fixed estate,
and a large one: see the arithmetic in
[Capacity planning](/1.2.31/guides/capacity-planning/). The feature is optional. Leave it
off if nothing reads it.

**The poller cache grows with data sources and shrinks only when they are
deleted.** It is the table that decides how heavy a collection pass is, so its row
count is the estate size number worth graphing.

**The SNMP index cache grows on ports times fields times devices.** A switch with
400 ports and an eight-field query is 3,200 rows from one device.

### The measurement

The interface includes a per-table report of row count, average row length, data
length and index length, which is the right place to start when the database has
grown and you do not know where. Trend the total monthly rather than reading it
once.

## Log volume

The log is one file and everything goes through it. Two settings decide how fast it
fills.

| Setting | Default | Effect |
|---|---|---|
| Verbosity | LOW | Statistics and errors only |
| Rotation | On, daily, keeping 7 files | Rotated by the maintenance pass, not by the system rotator |

The setting's own description warns that anything above LOW exhausts disk quickly
on a system of any size. That is not caution about neatness. A poller run at DEBUG
on a few thousand devices writes a line per item per cycle.

Rules that follow:

**Never leave the global verbosity raised.** Raise it, capture the run, lower it.
The retained count is 7 by default and clamped to a maximum of 365, so a week at
DEBUG can rotate the evidence away before you read it.

**Use selective debug instead.** Debug can be raised for named files, for a named
plugin, or for a list of device ids during collection only. That is the difference
between reading one device's poll and reading ten thousand. See
[Logging](/1.2.31/reference/logging/).

**Trend the daily rotated file size.** It is a single number and it moves when
something starts complaining. A log that doubles with no configuration change is
usually a device that started failing in a way the poller reports every cycle.

**Watch the collector standard error file separately.** It holds whatever the
collector processes printed, which is the only place a fatal error inside a
collection script is visible. It rotates with the same settings and it is empty on
a healthy system.

If a distribution package installs its own rotation rule, turn the built-in
rotation off in the configuration file rather than running both.

## The thresholds, in one table

Source constants are the code's own numbers. Recommendations are operational
judgment and you should adjust them.

| What to watch | Threshold | Kind | What it precedes |
|---|---|---|---|
| Run duration against budget | 60% watch, 85% act | Recommendation | Overruns, then scattered gaps |
| Budget itself | `runs x interval - 2`, 298s at defaults | Source constant | Work abandoned mid-run |
| Overrunning process count | Any non-zero | Source behaviour | Already failing |
| Collector last status age | Twice the poller interval | Source constant | A collector that stopped |
| Results table not empty | Any occurrence | Source behaviour | Silent per-data-source loss |
| `RRDsProcessed` against `DataSources` | Ratio should hold steady | Recommendation | Values arriving, files not written |
| Recached device count | Sustained non-zero | Recommendation | Poll window growth from reindex churn |
| Deferred flush duration | Against the 1200s maximum runtime | Source constant | Archive tables accumulating |
| Deferred buffer rows after a run | Should return near zero | Recommendation | Files falling further behind |
| Deferred buffer against the table limit | Comfortably under | Source behaviour | Insert failures, lost samples |
| Flush trigger | Record cap of 1,000,000 or the timer | Source constant | Changing the wrong setting |
| Daily log size | Doubling with no change | Recommendation | Disk exhaustion, or a device failing loudly |
| Log verbosity | Anything above LOW is temporary | Source guidance | Disk exhaustion |
| Poller cache row count | Should move only when you change things | Recommendation | A cache that was not rebuilt |
| Activity log row count | Unbounded by design | Source behaviour | A slow page, eventually |

## What is not measured

Stated so you do not go looking.

| Not measured | Do this instead |
|---|---|
| Whether the poller cache is stale relative to the configuration | Rebuild after bulk changes and trend the row count |
| Whether an RRD file is behind the database | Read the file's last update directly, not the interface |
| Whether the last collector stopped | An external check on the statistics line or a file timestamp |
| Per-device collection time over time | The device's polling time is stored as a current value; graph it to get a series |
| Disk free under the archive tree | The operating system. The self-monitoring package for the host covers it |
| Whether a graph is correct | Nothing can measure this. See [Read your first graph](/1.2.31/start/first-graph/) |

The first and the third are the two worth solving outside Kadupul. Everything else
on this page the system will tell you, if something is sampling it.
