---
title: Capacity planning
description: Work out the disk, memory, poll window and database size an install needs from the number of devices and data sources it will carry, with the arithmetic shown so you can redo it for your own numbers.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 30
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

[Manage data retention](/guides/manage-data-retention/) sizes one file. This page
sizes the whole install: disk, write rate, poll window, database and memory, from
two counts you already have.

Data source counts are useful, but device latency, script cost and archive layout also matter. One switch with 400
monitored ports outweighs fifty servers with three graphs each. Measure both the number of items and the cost of collecting them.

## The four inputs

Gather these before doing any arithmetic. Three are counts; the fourth is a choice.

| Symbol | What it is | Where it comes from |
|---|---|---|
| `S` | RRD files. One per data source | Count of data sources |
| `F` | Data source fields. The `DS` lines across all files | Count local data source items and verify actual RRD definitions |
| `C` | Poller cache rows | Row count of `poller_item` |
| `P` | Retention profile | Your choice of data source profile |

Do not derive `F` from `SUM(poller_item.rrd_num)`: query rows repeat the number of
outputs, while a multi-output script can have one row with `rrd_num = 1`.
For a database inventory, count distinct `(local_data_id, data_source_name)` pairs
in `data_template_rrd` with `local_data_id > 0`, restricted to the active estate.
Reconcile that inventory against actual files: templates, missing files, custom
paths and stale definitions can otherwise distort the estimate.

`F` helps estimate disk. `S` decides write rate. `C` decides how much
database you need in flight. They are not the same number and substituting one for
another is the usual way an estimate comes out four times wrong.

The relationship between them depends on how a data source collects:

| Collection type | Cache rows per data source | Fields per cache row |
|---|---|---|
| SNMP query, script query | One per output field | One |
| Single-value SNMP or script | One | One |
| Multi-value script | One | Several, parsed out of one string |

For an SNMP-heavy estate, `C` is close to `F`. For a script-heavy one, `C` is
smaller.

### A concrete estate

The three scales worked through below all use the same shape, multiplied by ten
each time. An access switch with 24 monitored ports, in and out, is 24 files and
48 fields. A server with eight graphed things is 8 files and 16 fields.

| Scale | Devices | `S` files | `F` fields | `C` cache rows |
|---|---|---|---|---|
| A | 100 | 2,000 | 4,000 | 4,000 |
| B | 1,000 | 20,000 | 40,000 | 40,000 |
| C | 10,000 | 200,000 | 400,000 | 400,000 |

## Disk for the RRD tree

### The formula

The profile editor estimates size using three constants: a 284 byte file
header, a 300 byte header per data source in the file, and 8 bytes per stored
value.

```
file bytes = 284 + fields_in_file * (300 + total_rows * 8 * consolidation_functions)
```

`total_rows` is the sum of the row counts across every archive in the profile.
`consolidation_functions` is how many of `AVERAGE`, `MIN`, `MAX` and `LAST` the
profile keeps. The product of those two is the multiplication people forget.

Across a whole install:

```
tree bytes = S * 284 + F * (300 + total_rows * 8 * consolidation_functions)
```

This is the editor's estimate, not an exact portable RRD file-size formula.
Measure representative files and filesystem allocation on the target platform.
Sum separately for different field counts and archive layouts, and allow space
for backups, XML dumps, staged restores and filesystem overhead.

### The shipped profiles

The three profiles used in this example keep all four consolidation functions, so every one of
them multiplies its row count by four.

| Profile | Step | Archive rows | Rows x 8 x 4 | Bytes per field |
|---|---|---|---|---|
| 5 Minute Collection | 300s | 2,872 | 91,904 | 92,204 |
| 30 Second Collection | 30s | 10,071 | 322,272 | 322,572 |
| 1 Minute Collection | 60s | 20,429 | 653,728 | 654,028 |

Row counts are the shipped archive definitions. The bytes column is derived: rows
times 8 bytes times 4 functions, plus the 300 byte per-field header.

The 1 Minute profile costs roughly seven times the 5 Minute profile per field. Not
five. The archives are not a straight multiple of each other.

### Three scales

Derived from the table above, at one field per `DS` line.

| Scale | 5 Minute | 1 Minute | 30 Second |
|---|---|---|---|
| A, 4,000 fields | 369 MB | 2.6 GB | 1.3 GB |
| B, 40,000 fields | 3.7 GB | 26 GB | 13 GB |
| C, 400,000 fields | 37 GB | 262 GB | 129 GB |

### The property that makes this easy

The tree does not grow after creation. Every archive is allocated in full when the
file is made, which is why a new data source shows eleven months of empty space.
Existing allocation stays stable under ordinary updates, but explicit resize,
rebuild or storage-layout changes can change it.

That cuts both ways. Editing a profile alone does not rewrite existing files; explicit conversion
or resizing requires separate validation and a backup. See [Manage data retention](/guides/manage-data-retention/).

## Write rate

Fields for one file at one timestamp collapse into a single update. So the write
rate is files per step, not fields per step.

```
updates per second = S / step
```

| Scale | 5 minute step | 1 minute step | 30 second step |
|---|---|---|---|
| A, 2,000 files | 7 | 33 | 67 |
| B, 20,000 files | 67 | 333 | 667 |
| C, 200,000 files | 667 | 3,333 | 6,667 |

These are average logical updates at a uniform step, not measured physical IOPS.
Mixed steps require summing each group separately. Filesystem caching, archive
updates, batching and deferred writes affect actual disk operations and latency.

Storage pressure can cause latency, retained queue growth and update errors even
when collection finishes on time. Inspect those signals before diagnosing gaps.
[High volume writes](/concepts/high-volume-writes/) explains the shape of it and
what deferred writes trade away.

Two limitations of these estimates:

- A fivefold cadence increase multiplies logical update demand for the affected
  files by five. Disk depends on the chosen archive layout, not cadence alone.
- No table here establishes the throughput of a particular disk. Benchmark
  representative collection and flush work on the intended storage.

## The poll window

### The budget

The poller derives its own deadline from two settings:

```
poller_runs = cron_interval / poller_interval
budget      = poller_runs * poller_interval - 2
```

With the shipped defaults, both intervals are 300 seconds, `poller_runs` is 1, and
the budget is 298 seconds. A run that passes the budget is cut off, and the work
not yet collected can leave gaps; samples already queued can remain for later
acknowledgement rather than being discarded.

### The requirement

A collector process is assigned whole devices. It cannot split one. So a run is
bounded from below by two separate things:

```
run >= max(device poll time)
run >= sum(device poll times) / parallelism
```

Parallelism depends on the collector:

| Collector | Parallelism |
|---|---|
| `cmd.php` | processes |
| Spine | processes x threads |

The PHP collector forces its thread count to 1 at the start of every run,
whatever the field says. Scaling it means more processes.
[Spine, the C collector](/reference/spine/) has the difference in full.

Require the larger of the two lower bounds to sit comfortably under the budget.
Comfortably means with room for the slowest device on its worst day, not with two
seconds to spare.

### Measure the device, do not guess it

The one input that cannot be derived is how long a device takes. Measure it:

```bash
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout --readonly
```

This is an inherited example, not a validated Kadupul Spine deployment.
`--readonly` does not prove side-effect-free execution: scripts and device requests
still run. Test only against isolated fixture devices with production producers
and notifications excluded. Take a handful of devices across the range of sizes you actually have and
use the mean for the fleet arithmetic and the maximum for the lower bound.

### Three scales

Worked at three seconds per device, which is a placeholder, not a measurement.
Substitute your own.

| Scale | Device-seconds | Collector | Parallelism | Run | Under 298s |
|---|---|---|---|---|---|
| A, 100 devices | 300 | `cmd.php`, 4 processes | 4 | 75s | Yes |
| B, 1,000 devices | 3,000 | `cmd.php`, 8 processes | 8 | 375s | No |
| B, 1,000 devices | 3,000 | Spine, 8 x 8 | 64 | 47s | Yes |
| C, 10,000 devices | 30,000 | Spine, 16 x 20 | 320 | 94s | Yes |

These are idealized arithmetic examples, not measured capacity limits. The source
recommends at most twice the CPU core count for PHP processes; it does not prove
a universal saturation threshold. Spine thread multiplication is not evidence of
linear speedup or of an available validated build.
[Scale the poller](/guides/scale-the-poller/) covers which limit you actually hit.

### The constraint scale C hits

Threads are not free. Each spine thread holds a database connection, and so does
each script server:

```
estimated worker connections = processes * (threads + script_servers)
```

With 16 processes, 20 threads and one script server, that estimate is 336
worker connections before parent processes, web requests and maintenance.
Measure peak connections and memory consumption; do not treat the formula as an
upper bound. Missing samples alone do not diagnose connection exhaustion.

## Database size

Four things in the database scale with the estate. Everything else is definitions
and stays small.

### The poller cache

One row per `C`, holding the device address, the SNMP credentials, the expanded
file path and the arguments, all denormalised so the collector needs no join. It
carries seven secondary indexes.

Measure representative row/index allocation on the actual database version and
character set. A 2 KB-per-row allowance would produce 8 MB, 80 MB and 800 MB for
these example scales, but it is a planning assumption, not a proven ceiling.
Include fragmentation, indexes, growth and maintenance headroom.

### Results in flight

The current `poller_output` queue is InnoDB and retains unacknowledged samples.
Its declared 512-character output width is not a fixed MEMORY-row allocation.
Measure actual InnoDB data/index bytes per queued row and allow for redo/binlog,
transaction and temporary-work overhead.

A full collection pass is not the worst-case backlog: writer failures can retain
many passes. Estimate retained rows from arrival rate and the maximum outage you
plan to tolerate, then measure recovery drain rate while new samples arrive.
Monitor oldest pending timestamps and free disk space. Increasing a heap-table
limit does not fix this queue's capacity. See
[Tune database performance](/guides/tune-database-performance/).

### The deferred write buffer

With deferred writes on, results accumulate in a durable table and flush on
whichever comes first: a timer, defaulting to an hour, or a row count, defaulting
to a million.

```
rows accumulated per hour = C * 3600 / step
```

| Scale | Rows per hour at a 300s step | Which trigger fires |
|---|---|---|
| A | 48,000 | The hourly timer |
| B | 480,000 | The hourly timer |
| C | 4,800,000 | The record cap, about every 12 minutes |

Derived. The useful part is the last column. Past roughly 83,000 cache rows on a
300 second step, the record cap governs and the interval setting stops being the
thing that decides when a flush happens. Operators who raise the interval to
reduce flush frequency at that size find nothing changes.

Verify the configured ingestion path before counting database writes. Direct
boost insertion is not a universal promise that every result is inserted into
both queues. The hourly arithmetic assumes one row per cache item per step and
no graph-triggered flush, retained failures or mixed source cadences.

### Per-period statistics

Statistics collection is optional. When it is on, five rollup tables each hold one
row per data source field.

```
persistent rows = 5 * F
```

| Scale | Rows |
|---|---|
| A | 20,000 |
| B | 200,000 |
| C | 2,000,000 |

Derived from the table shape: the rollups are keyed on data source and field name.
There is an additional `MEMORY` cache holding raw samples for the configured hourly
duration, which scales the same way.

Leave the feature off if nothing reads it. Measure its size relative to retained queues and other application tables.

### The one that surprises people

The SNMP index cache holds one row per index, per queried field, per device. A
switch with 400 ports and a query returning eight fields per port is 3,200 rows
from one device. It is indexed heavily because everything that builds a graph name
reads it.

It scales on ports and fields, not on devices, and it is not in the `C` count.

## Memory

Budget simultaneous peak use. Configuration limits are not reservations, and
some buffers are allocated per operation or table rather than once globally.

```
RAM >= buffer pool
     + actual concurrent MEMORY and temporary-table allocations
     + boost processes x boost memory limit
     + connections x per-connection buffers
     + page cache for the hot part of the RRD tree
     + the operating system
```

| Term | How to size it | Notes |
|---|---|---|
| Buffer pool | Active working set within available RAM | Leave room for other services and caches |
| MEMORY and temporary tables | Actual concurrent workload | The InnoDB queue is not sized by these limits |
| Deferred write processes | Parallel processes times the per-process limit, defaulting to 1 GB each | Only when deferred writes are on |
| Per-connection buffers | The connection count from the poll window section, times the sort and join buffers | Allocated per connection, so the multiplier is the trap |
| Page cache | Measure hot-file behavior | Whole-tree residency is not required for every workload |

Two collector facts worth knowing before budgeting:

**The poller and the PHP collector run with no PHP memory limit.** They set it to
unlimited at startup. There is no knob to cap them, so their footprint is whatever
the estate makes it.

**The deferred write process is the one with a limit.** It defaults to 1 GB per
process, and the number of parallel processes is configurable. That product is a configured ceiling for those PHP processes, not an allocation
that is necessarily resident; measure actual and peak process memory.

A tree larger than RAM does not imply that every logical update requires a
physical seek. Measure cache behavior, flush latency and storage operations under
representative load rather than deriving IOPS directly from file size.

## What does not scale linearly

Five things break the straight multiplication above. Check each before trusting a
projection.

| Thing | Why it bends |
|---|---|
| Poll window | A process takes whole devices, so one oversized device sets a floor that more processes cannot lower |
| Deferred write flushes | Past the record cap, the flush trigger changes and so does the buffer's steady-state size |
| Database connections | Threads multiply connections, and the server limit is a cliff rather than a slope |
| Page cache | Working set and writeback behavior affect physical I/O; the full tree need not fit |
| Index cache | Scales on ports times fields, which is unrelated to your device count |

## Reserve for growth

Three reservations worth making at provisioning time rather than later.

**Disk headroom on the RRD tree.** Growth is a step function: adding data sources
adds their full allocation the moment the files are created. A bulk discovery run
that creates 20,000 one-field files on the example 5 Minute profile has an
editor estimate of about 1.85 GB; two fields per file roughly doubles it. Keep enough free space for the largest single creation you expect.

**Poll window headroom.** A run at 90 percent of budget has no room for a device
that starts answering slowly. Use 60 percent as an illustrative planning target, not a tested universal ceiling and the
remainder as the margin that absorbs a bad day.

**Connection headroom.** The formula covers collectors. It does not cover
interactive logins, scheduled reports, or anything a plugin opens.

## Where these numbers came from

Stated plainly so you can check them.

| Number | Source |
|---|---|
| 284, 300 and 8 byte constants | The sizing function behind the profile editor |
| Archive row counts per profile | The shipped profile definitions |
| Four consolidation functions per shipped profile | The shipped profile definitions |
| Budget formula | The poller's own runtime calculation |
| Parallelism per collector | The poller's process launch arithmetic |
| Connection formula | [Scale the poller](/guides/scale-the-poller/) |
| Results table row shape | The table declaration |
| Flush triggers and their defaults | The deferred write settings |
| Rows per rollup table | The statistics table keys |

Everything in the scale tables is arithmetic performed here on those inputs. The three seconds per device, per-row storage allowances, concurrency efficiency
and headroom targets are assumptions. None of the tables is a capacity benchmark.

Once the install exists, stop projecting and start measuring. See
[Monitor Kadupul itself](/guides/monitor-kadupul-itself/) for which of these
numbers the system already records about itself, and
[Tune database performance](/guides/tune-database-performance/) for database
measurement and maintenance considerations.
