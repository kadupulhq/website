---
title: Monitor Kadupul itself
description: Which numbers tell you the monitoring system is healthy, which of them Kadupul already records about itself, the thresholds worth watching, and what each symptom arrives before.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 29
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
carries the latest elapsed time (`total_time`), minimum, maximum, running average
and poll count. `total_time` is replaced, not accumulated; the other timing
aggregates do not form a time series. An average
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
| `DataSources` | Selected poller cache item count; not a count of successful measurements |
| `RRDsProcessed` | Direct-path successful file/timestamp acknowledgements; not distinct files or proof of physical disk persistence |

The settings row is per collector. Collector 1 writes `stats_poller`; every other
collector writes `stats_poller_` followed by its id.

Compare these metrics only with the collection mode and source cadence understood.
A direct-write retry can acknowledge several timestamps for one file in a run.
Deferred writes follow a different path. A falling ratio is a reason to inspect
collection errors, retained queue age/depth and actual RRD timestamps, not proof
that values arrived but were not written.

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

The last three listed statistics are log-based. If you want a trend on
maintenance duration, the log is the only source.

The deferred write detail row is the one worth knowing about when a flush is slow.
It breaks the run into phases: fetching records, cycling results, resolving the
file name and template, reading the file's last update, the update itself, and the
delete. That tells you whether a slow flush is the database or the storage, which
is otherwise a guess.

### The shipped self-monitoring device package

A device package for monitoring the collector itself ships with the code, as
`install/templates/Cacti_Stats.xml.gz`. Its names carry the upstream branding; see
[Coming from Cacti](/guides/coming-from-cacti/).

It is not loaded by the schema. It is imported during installation when you select
it, or afterwards from the template import page. See
[Import and export templates](/guides/import-and-export-templates/).

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
row count and average row length from the server's own table metadata, which are database metadata estimates rather than exact live InnoDB row counts.

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
Validate the configured agent integration and access controls before exposing it;
this page does not validate an SNMP listener deployment.

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
exits. Uncollected work can leave gaps, while accepted queue samples can remain
for later retry. Inspect retained and rejected samples separately.

### Thresholds

| Run time | State | What it precedes |
|---|---|---|
| Under 60% of budget | Timing headroom only | Other collection/storage failures can still exist |
| 60% to 85% | Watch | A bad day, a slow device, or a discovery run pushes it over |
| Over 85% | Act | Overruns on any variation in device response time |
| Over 100% | Failing now | Abandoned work, gaps scattered across many devices |

The 60 and 85 percent lines are recommendations, not settings. The budget itself is
the code's own arithmetic.

### The trend matters more than the value

Investigate even one near-budget run when it causes missing samples. A run time climbing week over week is a capacity
plan, and it is the reason to graph the number rather than read it.

Three growth patterns and what each means:

| Pattern | Cause |
|---|---|
| Steps up when devices are added | Linear growth. Expected. Project it forward |
| Climbs with no configuration change | A device answering more slowly, or the database getting slower |
| Sawtooth, worse at one time of day | Something scheduled is competing. Look at what runs on the hour |

[Scale the poller](/guides/scale-the-poller/) covers which limit you hit, and
[Capacity planning](/guides/capacity-planning/) covers projecting it forward.

### The signal that survives the run

An overrun is cut off and the run reports it once. The next run counts collector
processes that were never closed out and warns that processes were detected as
overrunning a polling cycle. That warning is the better signal, because it survives
the run that produced it and appears whether or not anyone was watching the log at
the time.

Investigate any nonzero count against live processes and recent restarts or
maintenance. A stale process record does not identify the underlying failure.

### The collector heartbeat

Separately, the poller checks every enabled collector's last status time. A
collector whose last status is older than twice the poller interval is marked with
a failure status, logged, and an admin notification is attempted subject to a per-collector 1800-second
debounce. Actual delivery depends on configured recipients and mail transport.

That is the check that catches a collector which stopped entirely rather than one
running late. It only runs if some collector is still running, so it cannot catch
the case where the last collector stops.

**An install with one collector has nothing watching it.** Something outside
Kadupul has to check that the poller ran. The absence of the statistics line is the
check; write it against the log, or against the file modification time of a data
source you know is on a short step.

## Cache staleness

The collector reads a precomputed work list rather than your configuration. See
[The poller cache](/concepts/the-poller-cache/) for why. Staleness there is the
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

**Trend the count of cache rows.** Creation, deletion, disable/re-enable, whitelist
changes, reindexing and cache rebuilds can change it. A count that moves when nothing was created is worth a look. A count
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
to their history; see [Monitor a switch](/guides/monitor-a-switch/).

After bulk changes, verify effective cache entries and rebuild when needed:

```bash
php cli/rebuild_poller_cache.php
```

The current `--host-id` filter can rebuild unrelated enabled devices; see
[application #197](https://github.com/kadupulhq/kadupul/issues/197). Do not assume
it scopes a diagnostic rebuild to one device.

## RRD write behaviour

Two failure modes, depending on which path you are on.

### Direct writes

`RRDsProcessed` counts successful file/timestamp acknowledgements in the direct
path. One file can contribute more than once when retained timestamps drain.
Inspect it together with queue age, errors and the file's last update; it is not
a unique-file count or a stable ratio to all cache items.

A nonempty output queue can reflect writer failure, active maintenance, incomplete
fields or stale mappings. The warning lists a limited set of affected ids, but
does not delete every listed row. Valid pending samples are retained for retry.
Orphan cleanup removes samples for missing sources/hosts, and samples without a
matching cache item can expire after a grace period of five times the greater of
60 seconds and the base poller interval. Rejected updates have a separate handling
path. Investigate before rebuilding or deleting anything.

Incomplete fields can defer a timestamp rather than discarding it immediately.
Verify mappings and expected output names, then inspect the retained/rejected
sample state. See [Troubleshoot missing data](/guides/troubleshoot-missing-data/).

### Deferred writes

When writes are deferred, four numbers matter and the shipped package graphs all of
them.

| Number | Healthy | What a bad value precedes |
|---|---|---|
| Run duration | Well under the configured maximum runtime, 1200 seconds by default | A flush that never finishes; archive tables accumulate |
| Buffer rows after a run | Back near zero | The buffer grows without bound and files fall further behind |
| Queue age and database free space | Within the tested outage/recovery budget | Backlog growth or insert failures; diagnose persistence per path |
| Peak memory | Under the per-process limit, 1 GB by default | The flush process dies mid-run |

Two triggers start a flush: a timer, defaulting to an hour, or the buffer passing a
record count, defaulting to a million. Whichever comes first.

**Know which trigger is firing.** On a large install the record count fires long
before the timer, and raising the interval then changes nothing. The arithmetic is
in [Capacity planning](/guides/capacity-planning/).

**Watch for accumulating archive tables.** A flush renames the buffer aside and
drains the copy, dropping it when the run completes. A run that does not complete
leaves the copy behind for the next run to pick up. One is normal during a flush.
Several standing between flushes means the flush is losing.

**A graph alone does not prove freshness.** Graph-triggered flushing can update
the requested data source while unrelated files remain behind; it can also fail.
Check actual file timestamps and pending queues.
Anything reading the files directly, backups included, sees them as they are. See
[High volume writes](/concepts/high-volume-writes/) and
[Back up and restore](/guides/back-up-and-restore/).

## Database growth

Most of the schema is definitions and stays small. What grows is listed in
[Tune database performance](/guides/tune-database-performance/). What matters here
is which of it cleans itself.

### Cleaned automatically

| Table | Retention |
|---|---|
| Collector process registry | Completed rows deleted at the start of the next cycle |
| Results in flight | Acknowledged rows removed; valid failed writes retained, with separate orphan/rejection handling |
| Realtime results | Rows older than 300 seconds; cached images older than two hours |
| Hourly statistics cache | The configured hourly duration, defaulting to 60 minutes |
| Deferred write archive tables | Successfully drained tables can be removed; inspect retained tables after failures |
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
[Capacity planning](/guides/capacity-planning/). The feature is optional. Leave it
off if nothing reads it.

**The poller cache changes with source configuration, active state, queries and
whitelist/rebuild behavior.** It is the table that decides how heavy a collection pass is, so its row
count is the estate size number worth graphing.

**The SNMP index cache grows on ports times fields times devices.** A switch with
400 ports and an eight-field query is 3,200 rows from one device.

### The measurement

The interface includes a per-table report of row count, average row length, data
length and index length. InnoDB row counts are estimates; this is a useful place to start when the database has
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
[Logging](/reference/logging/).

**Trend the daily rotated file size.** It is a single number and it moves when
something starts complaining. A log that doubles with no configuration change is
usually a device that started failing in a way the poller reports every cycle.

**Watch the collector standard error file separately.** It holds whatever the
collector processes printed. Fatal errors may also appear in PHP, service or
application logs depending on configuration. Investigate contents and freshness;
an empty file alone does not prove healthy collection.

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
| Results table not empty | Investigate persistence and age | Source behaviour | Retained backlog, mapping or writer problems |
| `RRDsProcessed` against `DataSources` | Interpret by mode, cadence and retries | Recommendation | Possible collection/storage changes |
| Recached device count | Sustained non-zero | Recommendation | Poll window growth from reindex churn |
| Deferred flush duration | Against the 1200s maximum runtime | Source constant | Archive tables accumulating |
| Deferred buffer rows after a run | Should return near zero | Recommendation | Files falling further behind |
| Deferred queue age and free disk | Within recovery budget | Recommendation | Backlog growth or failed writes |
| Flush trigger | Record cap of 1,000,000 or the timer | Source constant | Changing the wrong setting |
| Daily log size | Doubling with no change | Recommendation | Disk exhaustion, or a device failing loudly |
| Log verbosity | Anything above LOW is temporary | Source guidance | Disk exhaustion |
| Poller cache row count | Compare with configuration and active/query state | Recommendation | Unexpected cache changes |
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
| Whether a graph is correct | Nothing can measure this. See [Read your first graph](/start/first-graph/) |

Use independent freshness checks so failure of Kadupul itself cannot suppress
its own alert. Treat every proposed threshold as a starting point to validate
against the estate, not a guarantee that lower values mean healthy collection.
