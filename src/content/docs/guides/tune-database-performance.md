---
title: Tune database performance
description: Which tables grow, what the maintenance scripts actually do, and the server settings that decide whether a collection run finishes.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 21
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

The database holds definitions, credentials, the collector's work list and
measurements awaiting acknowledgement by the RRD writer. Those pending samples
may be the only copy of recent measurements. Preserve them while investigating
performance. See [Architecture](/concepts/architecture/).

Before tuning anything, work out which limit you hit. A collection run that
overruns its interval is usually the collector, not the database; start with
[Scale the poller](/guides/scale-the-poller/). Come here when the symptom points
at the database: lock waits in the log, the interface slow on pages that list
things, or memory tables filling up.

## The tables that grow

Most tables in the schema are definitions and stay small. These do not.

| Table | Grows with | Engine |
|---|---|---|
| `poller_item` | One row per data source item, per collector | InnoDB |
| `host_snmp_cache` | One row per index per queried field per device | InnoDB |
| `poller_output` | Pending measurements, including retained failed writes | InnoDB |
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

## Durable queues and memory tables

The main `poller_output` queue must use InnoDB. Storage preflight rejects a MEMORY
queue; increasing `max_heap_table_size` does not fix that refusal. Preserve pending
rows and use the explicit conversion/check procedure in
[Upgrade safely](/guides/upgrade-safely/) with producers stopped and backups retained.

Inspect actual engines in the restored schema. Remaining MEMORY statistics/cache
tables lose their contents on restart and have engine-specific limits, but that is
not a reason to discard measurement queues or convert unrelated tables blindly.
Deferred-write queues consume database disk space; monitor row counts, oldest pending
timestamps and free space. A failed flush can retain a growing backlog.

Do not narrow output columns merely to save memory: truncating a multi-field
measurement can corrupt its meaning. Match schema definitions and validate actual
output lengths before changing them.

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

Raising the items-per-pass value can change throughput, memory use and graph latency
while one is running, because both compete for the same tables. If graphs go slow
on the hour, that is the setting to lower first.

Direct insertion into the boost queue changes the ingestion path. The normal
queue is already durable; this is not a MEMORY-to-disk choice. Any speedup is
workload-dependent. Benchmark throughput, queue age and failures before relying
on historical percentage estimates.

See [High volume writes](/concepts/high-volume-writes/) for the shape of the
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

ANALYZE updates optimizer statistics and can consume resources or contend with
other work; it does not intentionally change measurement rows. Use query plans
and timings to decide whether statistics need refreshing rather than assuming a
full-database analysis is always cheap.

The current binary-log branch emits `ANALYZE TABLE NO_WRITE_TO_BINLOG ...`, which
has the keywords in the wrong order for MariaDB. Inspect per-table results and
logs rather than trusting command completion. Test the exact server version and
replication behavior before scheduling it.

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
Review engine and row-format changes in the proposed SQL. They apply to tables
with generated alterations. The code adds `CHARSET` derived from the existing
collation's character-set prefix; it does not explicitly preserve the full
collation name. Check resulting table and column definitions.

If loading the canonical audit schema fails, the current report can still print
`Audit was clean` and exit 0. Treat any preceding fatal error as failure. Do not
derive a baseline from the database being diagnosed merely to silence the error.

It refuses to run when the code version and the database version disagree, and
tells you to upgrade first. That guard is correct. Do not work around it by
passing `--upgrade` unless upgrading is what you meant to do.

Use `--report` and `--alters` before `--repair`, and verify that the canonical
audit tables are loaded and match the intended version. Retain a matched backup
and stop producers for a planned schema-changing maintenance window. A schema repair on a large table is
a long-running alter that locks, and you want to know which tables are in the
list before you start rather than during.

A separate repair utility handles table-level corruption and damaged template
records. That is a different job from a schema audit; reach for it when the
symptom is a table the server reports as broken, not a column that is the wrong
width.

## Server settings that matter

Review these against the installed database version and workload; installer
recommendations are not universal capacity or durability guarantees.

| Variable | Recommendation | Why |
|---|---|---|
| `innodb_buffer_pool_size` | Size from the active working set and available RAM | Leave room for the OS, web/PHP workers and database connection buffers. |
| `max_heap_table_size` | Inspect actual MEMORY tables | Does not size the InnoDB measurement queues. |
| `tmp_table_size` | Measure temporary-table workload | Limits and spill behavior depend on server version and temporary-table engine. |
| `max_allowed_packet` | Accommodate measured statement sizes | Review both server/client limits and batch sizes. |
| `max_connections` | Measure peak clients plus headroom | Include collectors, script servers, web requests and maintenance. |
| `innodb_file_per_table` | Review tablespace layout | A setting change does not automatically reorganize existing tables. |
| Redo/binlog flush settings | Preserve the required durability policy | Do not trade acknowledged measurements for throughput without an explicit recovery policy. |
| `innodb_io_capacity` | Match measured storage capability | A fixed SSD value does not describe every storage system. |
| `join_buffer_size`, `sort_buffer_size` | Keep allocations within a measured memory budget | Concurrent operations can multiply memory use. |
| Character set/collation | Preserve compatible schema definitions | Inspect table/column definitions as well as server defaults. |

Flush settings interact with commit and binary-log durability. Consult the
[MariaDB InnoDB variables reference](https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-system-variables)
for the deployed version; the old blanket recommendation to increase the flush
interval is not a safe performance default.

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
pause and the statement runs again, a few times. Retries can add latency and ultimately fail; inspect both timing and errors.

**An oversized statement is not retried.** A statement that exceeds the server's
packet limit is logged and abandoned. If that happens during a bulk flush, the
database helper returns failure. Whether samples remain depends on the caller
and its acknowledgement path; do not infer loss or successful persistence from
the packet error alone. Inspect retained queues and resolve the failed operation.

**The session SQL mode is adjusted on connect.** Strict modes and a few others
are removed from whatever the server hands out, and a small set is added. Setting
them globally does not guarantee the same application session mode. Inspect
`@@SESSION.sql_mode` through the actual application connection; modes not removed
by bootstrap can still affect behavior.

## Traps

**Analyze is not repair, and repair is not upgrade.** Three scripts, three jobs.
Running the wrong one because the symptom is vague wastes a maintenance window.

**Do not treat all runtime tables alike.** The measurement queue requires InnoDB.
Other cache/statistics tables need their own preservation and rebuild policy.

**A schema repair on a large table locks it.** Preview with `--alters`, size the
window against the largest table in the list, and do it when collection is
stopped and a tested rollback plan available.

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
