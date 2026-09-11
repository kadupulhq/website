---
title: Capacity planning
description: Work out the disk, memory, poll window and database size an install needs from the number of devices and data sources it will carry, with the arithmetic shown so you can redo it for your own numbers.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 30
---

:::caution[Not yet possible]
Kadupul has not shipped, so none of these numbers can be measured on a running
system yet. The formulas come from the shipped defaults and the code that uses
them. The arithmetic done here is labelled where it is derived rather than read.
:::

[Manage data retention](/guides/manage-data-retention/) sizes one file. This page
sizes the whole install: disk, write rate, poll window, database and memory, from
two counts you already have.

Everything here scales on data sources, not on devices. One switch with 400
monitored ports outweighs fifty servers with three graphs each. Plan on the first
number and the second takes care of itself.

## The four inputs

Gather these before doing any arithmetic. Three are counts; the fourth is a choice.

| Symbol | What it is | Where it comes from |
|---|---|---|
| `S` | RRD files. One per data source | Count of data sources |
| `F` | Data source fields. The `DS` lines across all files | Sum of `rrd_num` over the poller cache |
| `C` | Poller cache rows | Row count of `poller_item` |
| `P` | Retention profile | Your choice of data source profile |

`F` is the one that decides disk. `S` decides write rate. `C` decides how much
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

The profile editor computes a file's size from three constants: a 284 byte file
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

The first term is noise. The second is the answer.

### The shipped profiles

All three shipped profiles keep all four consolidation functions, so every one of
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
Provision once, at creation, and the number does not move until you add data
sources.

That cuts both ways. There is no path that rewrites an existing file to match a
changed profile, so an under-provisioned tree cannot be shrunk by editing the
policy. See [Manage data retention](/guides/manage-data-retention/).

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

Derived by division. Each of those is a small write at a scattered offset in a file
that never grows, so compare the number against what your storage does in small
random writes, not against its sequential throughput.

This is the limit nothing warns you about. The poller finishes on time, the
database is idle, and the graphs still have gaps.
[High volume writes](/concepts/high-volume-writes/) explains the shape of it and
what deferred writes trade away.

Two rules of thumb that follow from the arithmetic rather than from measurement:

- A step five times finer multiplies the write rate by five and the disk by about
  seven. Both, not one.
- Scale C on a 5 minute step is already past what a single spinning disk does.
  Scale B on a 30 second step is in the same place.

## The poll window

### The budget

The poller derives its own deadline from two settings:

```
poller_runs = cron_interval / poller_interval
budget      = poller_runs * poller_interval - 2
```

With the shipped defaults, both intervals are 300 seconds, `poller_runs` is 1, and
the budget is 298 seconds. A run that passes the budget is cut off, and the work
that had not finished produces a gap rather than a zero.

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

`--readonly` collects without writing results, so it is safe alongside a live
poller. Take a handful of devices across the range of sizes you actually have and
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

Scale B is where the PHP collector runs out. Adding processes past twice the CPU
core count stops helping, and the guidance in the source says so.
[Scale the poller](/guides/scale-the-poller/) covers which limit you actually hit.

### The constraint scale C hits

Threads are not free. Each spine thread holds a database connection, and so does
each script server:

```
connections = processes * (threads + script_servers + 1)
```

Scale C at 16 processes and 20 threads is 16 x 22, which is 352 connections from
one collector before anybody logs in. That is past a common default server limit.
Raise the limit, cut the thread count, or split the estate across data collectors.

Running out of connections does not look like a connection error. It looks like
missing samples on a rotating set of devices, because the threads that failed to
connect are different every run.

## Database size

Four things in the database scale with the estate. Everything else is definitions
and stays small.

### The poller cache

One row per `C`, holding the device address, the SNMP credentials, the expanded
file path and the arguments, all denormalised so the collector needs no join. It
carries seven secondary indexes.

The declared column widths put a ceiling of about 1.5 KB on a row if every
variable column were full. Real rows are far shorter. Budget 2 KB per row including
indexes as a ceiling and measure the real figure once you have one.

| Scale | `C` rows | Ceiling |
|---|---|---|
| A | 4,000 | 8 MB |
| B | 40,000 | 80 MB |
| C | 400,000 | 800 MB |

Derived from the declared widths, deliberately pessimistic.

### Results in flight

The results table is a `MEMORY` table with a fixed row shape: a data source id, a
19 character name, a timestamp, and a 512 character output column. `MEMORY` stores
`VARCHAR` at its declared maximum rather than its actual length, so the row
footprint is set by the declaration.

That makes the character set part of the sizing. At one byte per character a row
is about 0.6 KB. At `utf8mb4`'s four bytes per character it is about 2.2 KB.
`utf8mb4` is the recommended server character set, so provision against the larger
figure.

| Scale | Worst-case rows | At 2.2 KB |
|---|---|---|
| A | 4,000 | 9 MB |
| B | 40,000 | 88 MB |
| C | 400,000 | 880 MB |

Derived. The worst case is a full pass landing before the drain catches up, which
is what you size the server's memory table limit against. The same allowance is
wanted for temporary tables, so double it when budgeting memory.

Exceeding the limit does not degrade. Inserts fail and the samples in that pass are
lost. See [Tune database performance](/guides/tune-database-performance/).

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

One more multiplier: when results are written straight into the durable table as
well as the in-flight one, every value is inserted twice per cycle.

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

Leave the feature off if nothing reads it. At scale C it is the largest table in
the install.

### The one that surprises people

The SNMP index cache holds one row per index, per queried field, per device. A
switch with 400 ports and a query returning eight fields per port is 3,200 rows
from one device. It is indexed heavily because everything that builds a graph name
reads it.

It scales on ports and fields, not on devices, and it is not in the `C` count.

## Memory

Add the pieces. They do not overlap.

```
RAM >= buffer pool
     + memory table limit + temporary table limit
     + boost processes x boost memory limit
     + connections x per-connection buffers
     + page cache for the hot part of the RRD tree
     + the operating system
```

| Term | How to size it | Notes |
|---|---|---|
| Buffer pool | About a quarter of system memory, checked against the database's on-disk size | The recommendation the install itself checks |
| Memory and temporary table limits | Twice the results-in-flight figure above | Both get the same allowance |
| Deferred write processes | Parallel processes times the per-process limit, defaulting to 1 GB each | Only when deferred writes are on |
| Per-connection buffers | The connection count from the poll window section, times the sort and join buffers | Allocated per connection, so the multiplier is the trap |
| Page cache | Whatever fraction of the tree you want resident | Not provisionable at scale C |

Two collector facts worth knowing before budgeting:

**The poller and the PHP collector run with no PHP memory limit.** They set it to
unlimited at startup. There is no knob to cap them, so their footprint is whatever
the estate makes it.

**The deferred write process is the one with a limit.** It defaults to 1 GB per
process, and the number of parallel processes is configurable. That product is a
real allocation on the poller host.

The page cache line is the one that bites at scale. A 37 GB tree does not sit in
memory on a machine sized for the database, so every RRD update is a real disk
operation. That is the same conclusion the write rate section reached by a
different route, which is a reason to trust it.

## What does not scale linearly

Five things break the straight multiplication above. Check each before trusting a
projection.

| Thing | Why it bends |
|---|---|
| Poll window | A process takes whole devices, so one oversized device sets a floor that more processes cannot lower |
| Deferred write flushes | Past the record cap, the flush trigger changes and so does the buffer's steady-state size |
| Database connections | Threads multiply connections, and the server limit is a cliff rather than a slope |
| Page cache | Fine until the tree stops fitting, then every write becomes a seek |
| Index cache | Scales on ports times fields, which is unrelated to your device count |

## Reserve for growth

Three reservations worth making at provisioning time rather than later.

**Disk headroom on the RRD tree.** Growth is a step function: adding data sources
adds their full allocation the moment the files are created. A bulk discovery run
that creates 20,000 data sources on the 5 Minute profile takes 1.8 GB the same
afternoon. Keep enough free space for the largest single creation you expect.

**Poll window headroom.** A run at 90 percent of budget has no room for a device
that starts answering slowly. Treat 60 percent as the working ceiling and the
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

Everything in the scale tables is arithmetic performed here on those inputs. The
three seconds per device is a placeholder and the only figure in the page that is
neither read nor derived.

Once the install exists, stop projecting and start measuring. See
[Monitor Kadupul itself](/guides/monitor-kadupul-itself/) for which of these
numbers the system already records about itself, and
[Tune database performance](/guides/tune-database-performance/) for the per-table
size report.
