---
title: Architecture
description: The four moving parts, and which one is usually at fault.
sidebar:
  order: 1
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/reference/rrdproxy/).
:::

Kadupul has four parts. Knowing which one you are looking at shortens most
debugging sessions to a few minutes.

**The web interface** is a PHP application. It writes configuration to the database
and reads RRD files to draw graphs. It does not collect anything.

**The database** holds configuration and state: devices, templates, users,
permissions, and the poller cache. It does not hold measurements.

**The poller** runs on a schedule, reads its work list from the database, queries
devices, and writes the results into RRD files. This is where collection happens.

**The RRD files** hold the measurements. One file per data source, fixed size,
on disk.

## The boundaries

Five of the pairings carry traffic. One carries none, and that one explains more
than the others.

| Boundary | What crosses it | Carried by |
|---|---|---|
| Interface to database | Configuration reads and writes, sessions, permission checks, and the work list the interface precomputes for the poller | SQL |
| Interface to files | Reads, at the moment somebody asks for a graph. Creating a data source also creates its file here | The local filesystem; the inherited remote RRDtool socket is unsupported |
| Poller to database | Reads the work list. Writes collected values, device status, and per-item countdowns | SQL |
| Poller to devices | SNMP requests, script invocations, reachability checks | The network. The only leg that leaves the host |
| Poller to files | One update per data source per interval | RRDtool, spawned per command or held open as a pipe |
| Database to files | Nothing | |

The empty row is the load-bearing one. The database never opens an RRD file and
RRDtool never opens the database. Every join between a measurement and its
meaning happens in PHP, in the middle, using a path string held in a database
column. Nothing on disk records which device a file belongs to.

Two consequences follow. A database backup without `rra/` restores an
installation that knows about ten thousand graphs and can draw none of them. And
moving RRD files without telling the database produces data sources that look
configured, collect nothing, and report no error, because the path in the row is
the only copy of that fact.

## Why measurements are not in the database

Because the files never grow. A round-robin archive is allocated once, at creation,
with room for a defined number of samples at each resolution. When it fills, the
oldest sample is overwritten. A thousand data sources consume the same disk in year
five as in week one.

The shape of the work is also wrong for a table. Collection produces one small
write per data source per interval, at a known offset in a known file, with no
transaction to coordinate and nothing to index. A row store would carry an index,
a transaction log, and a row count that climbs forever, in exchange for query
flexibility that graphing does not use.

This is a deliberate trade. You get predictable capacity and fast graphing. You give
up the ability to ask questions you did not plan for, because resolution you did not
allocate is gone for good. Which resolutions you get, and what it costs to keep
more of them, is in
[Data sources and round-robin archives](/concepts/data-sources-and-rras/).

Configuration goes in the database for the opposite reasons. It is small, it is
queried in ways nobody can predict, it needs referential integrity, and several
processes write it at once.

## Two paths, sharing two parts

A request and a poll use the same four parts and never touch each other.

The request path:

1. A browser asks for a page or a graph image.
2. PHP reads `include/config.php`, connects to the database, and checks the
   session and the realm the page requires.
3. Console pages read and write the configuration tables.
4. A graph image is assembled into an RRDtool command from database configuration,
   then run against files in `rra/`. See
   [How graphs are drawn](/concepts/how-graphs-are-drawn/).
5. Nothing is collected. A graph request that returns a flat line has read the
   file correctly and found nothing in it.

The poll path:

1. The scheduler starts the poller.
2. It reads its work list from a cache table rather than from the configuration.
3. It divides the list across child processes.
4. Children talk to devices and write their results into a results table.
5. A pass reads that table, groups the values by file, and issues one RRDtool
   update per file. See [High volume writes](/concepts/high-volume-writes/).
6. Device status and countdowns go back to the database.

The ordering of a full run, with its overrun guards, is in
[Poller lifecycle](/reference/poller-lifecycle/).

The two paths meet only at the database and at `rra/`. This is why the interface
can be perfectly healthy while collection is dead, and why restarting the web
server fixes nothing about a poller.

## What runs as which user

| Process | Runs as | Started by |
|---|---|---|
| The web interface | The web server or PHP-FPM pool user | The web server |
| The poller | Whatever account the scheduler uses | cron, Windows Task Scheduler, or the shipped systemd unit |
| RRDtool | Inherited from whichever of the two spawned it | The interface or the poller |
| Collection scripts | Inherited from the poller | The poller |

Both the interface and the poller create RRD files, so both need to write into
`rra/`. If they run as different accounts and the directory permissions only suit
one of them, data sources created through the interface will not be updatable by
the poller, or the reverse.

Kadupul handles part of this at creation. When the creating process is running as
root, a new RRD file, and any new directory under a structured path layout, is
given the owner and group of `rra/` itself rather than root's. When the creating
process is not root, the file simply gets that process's own ownership, and
nothing corrects it later.

Raw ICMP needs privilege that neither account normally has. The ping code raises
its effective user id to zero for the duration of the socket and drops back
afterwards. A poller with no route to root cannot use ICMP at all and has to fall
back to a UDP or TCP reachability check.

## The work list is precomputed

The poller does not work out what to collect each run. That would mean resolving
several joins per value, on every interval, for every device. Instead the answer
is written down flat in a cache table when configuration changes, and the poller
reads that.

The consequence is the part that surprises people: **changing configuration does not
change collection until the cache is rebuilt.** Most "my change did nothing" reports
are this. What the cache holds, what rewrites it, and the three different
mechanisms that produce the same silent symptom are in
[The poller cache](/concepts/the-poller-cache/).

## Where things usually break

| Symptom | Part at fault | Look at |
|---|---|---|
| Interface is fine, graphs are flat everywhere | Poller | Whether the scheduler ran it at all |
| Poller runs, RRD files not updating | Filesystem permissions, or the poller account | Ownership of `rra/` against the poller's user |
| One data source flat, others fine | Poller cache, or the device | Whether a work list row exists for it |
| Configuration change had no effect | Poller cache | [The poller cache](/concepts/the-poller-cache/) |
| Graph has small regular gaps | Poller overrunning its interval, or a heartbeat set too close to the step | [Time and intervals](/concepts/time-and-intervals/) |
| Graph draws the wrong shape from correct data | Graph definition, not collection | [How graphs are drawn](/concepts/how-graphs-are-drawn/) |
| Ports renumbered and history followed the wrong one | Data query index choice | [Data queries and indexes](/concepts/data-queries-and-indexes/) |
| Account sees the console but no graphs | Object permissions, not realms | [Permissions and access](/concepts/permissions-and-access/) |
| Change took effect on one collector and not another | Remote collector out of sync | [Remote data collection](/concepts/remote-data-collection/) |
| Everything slow under load | Database, or the poller not finishing inside its interval | [High volume writes](/concepts/high-volume-writes/) |
| Data source exists, file does not | Whichever process created it could not write `rra/` | Ownership again |

The pattern in this table is that the interface is rarely at fault and is almost
always where the symptom appears. Start from the boundary nearest the symptom and
work outward.
