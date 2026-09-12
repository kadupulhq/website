---
title: Tune database performance
description: Which tables grow, what the maintenance scripts actually do, and
  the server settings that decide whether a collection run finishes.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 21
slug: 1.2.31/guides/tune-database-performance
---

:::caution[Nothing to tune yet]
Kadupul has not shipped, so there is no database under load. This page records
the intended behaviour of the maintenance tooling and the settings that govern
it,
:::

The database is not where measurements live. See
[Architecture](/1.2.31/concepts/architecture/) if that is new. It is where definitions,
credentials, the collector's work list, and results in flight live, and on a
large install the last two are what hurt.

Before tuning anything, work out which limit you hit. A collection run that
overruns its interval is usually the collector, not the database; start with
[Scale the poller](/1.2.31/guides/scale-the-poller/). Come here when the symptom points
at the database: lock waits in the log, the interface slow on pages that list
things, or memory tables filling up.

## The tables that grow

Most tables in the schema are definitions and stay small. These do not.

| Table | Grows with | Engine |
|---|---|---|
| `poller_item` | One row per data source item, per collector | InnoDB |
| `host_snmp_cache` | One row per index per queried field per device | InnoDB |
| `poller_output` | Results in flight during a single pass | Memory |
| `poller_output_boost` | Results waiting to be written to disk | InnoDB |
| `poller_output_realtime` | Real-time graph requests | InnoDB |
| `poller_reindex` | Data query re-index checks per device | InnoDB |
| `data_source_stats_*` | One row per data source per period | Mixed |

`poller_item` is the collector's work list and the one that decides how heavy a
collection pass is. It carries the device address, the SNMP credentials, the
expanded RRD file path and the arguments, all denormalised, because the collector
reads it once per pass and cannot afford a join.

`host_snmp_cache` is the one that surprises people. A switch with 400 ports and a
query returning eight fields per port is 3200 rows from one device. It is indexed
heavily for the same reason: everything that builds a graph name reads it.

## The memory tables

Several tables are declared as memory tables on purpose. They hold results in
flight and statistics caches, and they are written on every pass.

Two consequences follow, and both matter.

They are lost on a database restart. That is intended. A collection pass that was
in flight is lost with them and shows as one gap.

They are capped by the server's memory table size limit, not by disk. Exceed it
and inserts fail. On an install with deferred RRD writes enabled, the results
table is the one to watch: it fills between flushes, and a flush that is late or
failing means it keeps filling.

The documented recommendation is to allow the memory table limit to reach a
noticeable fraction of system memory, along with the same allowance for temporary
tables. The other lever is the width of the output column in the results tables:
narrower rows mean more of them fit.

## Deferred writes are a database tradeoff

Turning on deferred RRD writes moves load. Instead of writing every RRD file
every pass, results accumulate in a durable table and are flushed in bulk. Disk
seeks go down. Database volume goes up, sharply.

The settings that govern the flush:

| Setting | Default | What it controls |
|---|---|---|
| Update interval | 1 hour | How often everything is flushed regardless |
| Maximum records | 1,000,000 | Row count that triggers an early flush |
| Data source items per pass | 50,000 | How much one flush pass reads at a time |
| Number of processes | 1 | Parallel flush processes |
| Memory limit | 1 GB | Per flush process |
| Maximum run time | 20 minutes | Warns in the log if exceeded |

Raising the items-per-pass value makes flushes faster and makes graphing slower
while one is running, because both compete for the same tables. If graphs go slow
on the hour, that is the setting to lower first.

There is also an option to insert collector results straight into the durable
table, skipping the memory table. It is documented as removing about a quarter of
the time in each collection pass. It also removes the memory table as a buffer,
so the durable table absorbs the full write rate.

See [High volume writes](/1.2.31/concepts/high-volume-writes/) for the shape of the
tradeoff.

## The maintenance scripts

Two scripts, doing different things, with names close enough to confuse.

### Recalculating index statistics

```sh
php cli/analyze_database.php
```

This runs an analyze over every table in the database. It recalculates index
cardinality, which is what the query planner uses to decide between an index and
a scan. Stale statistics on a large install produce a planner that picks a scan
on a table with millions of rows, and the symptom is one page that used to be
fast and is now not.

It writes nothing to your data. If binary logging is on, it analyzes without
writing to the log so replicas are not disturbed. Run it on a schedule; it is
cheap and it is the first thing to try when a specific query went slow without
the data changing shape.

Run from a remote collector it operates on the main database by default. Pass
`--local` to act on the collector's own.

### Auditing the schema

```sh
# report only
php cli/audit_database.php --report

# print the statements without running them
php cli/audit_database.php --alters

# run them
php cli/audit_database.php --repair
```

This compares the live schema against a canonical record of what every table,
column and index should be, and produces the statements needed to close the gap.
It also normalises storage engine and row format while it is there: a table still
on the older engine is moved to InnoDB with dynamic rows, and the table's existing
collation is preserved rather than reset.

It refuses to run when the code version and the database version disagree, and
tells you to upgrade first. That guard is correct. Do not work around it by
passing `--upgrade` unless upgrading is what you meant to do.

Use `--alters` before `--repair`, every time. A schema repair on a large table is
a long-running alter that locks, and you want to know which tables are in the
list before you start rather than during.

A separate repair utility handles table-level corruption and damaged template
records. That is a different job from a schema audit; reach for it when the
symptom is a table the server reports as broken, not a column that is the wrong
width.

## Server settings that matter

These come from the recommendations the install itself checks. Values are
starting points, not answers; the right number depends on the size of the box.

| Variable | Recommendation | Why |
|---|---|---|
| `innodb_buffer_pool_size` | About a quarter of system memory | Holds tables and indexes in memory. Size it against the on-disk size of the database directory. |
| `max_heap_table_size` | A noticeable fraction of system memory | Caps the memory tables. Too small and collector inserts fail. |
| `tmp_table_size` | Same allowance | Keeps subquery temporaries in memory. |
| `max_allowed_packet` | 16 MB or more | Collector synchronisation moves large blocks to remote collectors. |
| `max_connections` | 100 or more | Collector processes multiply: processes times threads plus script servers plus one, with headroom for logins. |
| `innodb_file_per_table` | On | Keeps tablespaces separate and manageable. |
| `innodb_flush_log_at_timeout` | 3 seconds or more | Makes disk writes more sequential on high I/O systems. |
| `innodb_io_capacity` | 5000 on SSD | Roughly 200 times the number of drives on spinning disks. |
| `join_buffer_size`, `sort_buffer_size` | Modest | Allocated per connection. The sum of the per-connection buffers plus the server's own memory should stay under 80 percent. |
| `character_set_server` | `utf8mb4` | Some characters need more than one byte. |
| `collation_server` | `utf8mb4_unicode_ci` | The matching collation. |

The per-connection buffers are the ones people get wrong. They look like a free
speedup until you multiply them by the connection count from the row above.

## How the application behaves when the database struggles

Worth knowing, because the symptoms are distinctive.

**Lock waits and deadlocks are retried.** A statement that fails on a deadlock,
a lock wait timeout, or a lock table error is retried after a short pause, up to
around 30 attempts, before it gives up and logs. So a database under lock
pressure does not fail loudly. It gets slower, and a collection pass that used to
finish in 30 seconds takes four minutes. Look for the retry messages in the log
before concluding the collector is slow.

**A dropped connection is retried too.** The connection is re-established after a
pause and the statement runs again, a few times. Again, the symptom is latency,
not an error.

**An oversized statement is not retried.** A statement that exceeds the server's
packet limit is logged and abandoned. If that happens during a bulk flush, the
results in that batch are lost. This is the reason the packet size
recommendation exists.

**The session SQL mode is adjusted on connect.** Strict modes and a few others
are removed from whatever the server hands out, and a small set is added. Setting
them globally on the server will not make the application behave differently, so
do not spend time there.

## Traps

**Analyze is not repair, and repair is not upgrade.** Three scripts, three jobs.
Running the wrong one because the symptom is vague wastes a maintenance window.

**Do not convert the memory tables to a durable engine.** They are memory tables
because they are rewritten every pass. Converting them moves the whole collection
write rate onto disk.

**A schema repair on a large table locks it.** Preview with `--alters`, size the
window against the largest table in the list, and do it when collection is
stopped if you can.

**The retry behaviour hides the problem.** By the time something reports a
failure, it has already been slow for a while. Watch collection run duration, not
just error counts.

**Growth is driven by the number of data source items, not the number of
devices.** One device with a 400-port query outweighs 50 devices with three
graphs each. Count rows in the collector's work list, not entries in the device
list.

**Statistics collection is optional and it costs rows.** The per-period
statistics tables hold one row per data source per period. On a large install
that is a real table. Leave the feature off if nothing reads it.
