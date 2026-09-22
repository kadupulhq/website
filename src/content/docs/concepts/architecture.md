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

Kadupul's web application, database, scheduled collection and RRD storage have
different jobs, but their execution paths overlap. Knowing which operation failed
helps narrow an investigation; a working interface does not prove collection works.

**The web interface** is a PHP application. It manages configuration and renders or
serves cached graphs. Some web actions also trigger collection, such as realtime
graph requests, and normal graph requests can trigger pending RRD updates.

**The database** holds configuration, permissions, operational state, the poller cache
and measurement queues. Collected values can remain there while awaiting an RRD write
or retry; it is not only a configuration store.

**The poller** coordinates scheduled work and collector children. Results pass through
database queues before the normal or deferred writer updates RRD files.

**The RRD files** hold bounded historical series. A data source normally has one RRD
containing its fields; graph creation can reuse sources, and creating metadata does
not guarantee that the file already exists.

## The boundaries

| Boundary | What crosses it | Carried by |
|---|---|---|
| Interface to database | Configuration, sessions, authorization, cached work and operational data | SQL; the database may be remote |
| Interface to files | Graph reads, cached images, and eligible on-demand RRD updates or creation | Filesystem and RRDtool |
| Poller to database | Work lists, collected values, retained queues, status and countdowns | SQL |
| Collection to devices | SNMP, collection scripts and reachability checks | Network or local commands; web-triggered collection is also possible |
| Writer to files | Grouped samples, possibly several timestamps per update | RRDtool commands and acknowledged pipes |
| Database server to RRD files | No direct RRD update in the normal application path | Application writer code coordinates the two stores |

Database rows associate a data source with a device and its configured file path.
RRDtool files describe series and archives; they do not replace that application
mapping. Network traffic is not limited to device polling: database connections,
remote collectors and other configured integrations can cross hosts too.

Back up database state, pending samples and RRD files consistently. A database-only
restore does not restore the historical RRD contents, and a file-only restore omits
configuration and unflushed samples. Moving files without reconciling paths can cause
missing-file errors or retained writes; it is not a guaranteed silent collection
failure. See [Back up and restore](/guides/back-up-and-restore/) and
[Migrate to new hardware](/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Why long-term history uses RRD files

Long-term graph history is stored in RRDs, but measurement queues are in the database.
The normal in-flight queue is InnoDB in this revision, and deferred writes retain
samples in Boost tables. Failed writes or delayed remote delivery can grow those
queues. See [High volume writes](/concepts/high-volume-writes/).

An RRD allocates a defined number of rows at selected resolutions. Normal updates
reuse that space instead of appending history indefinitely. The file size is bounded
for an unchanged layout; adding data sources, changing layouts, retaining recovery
copies or accumulating queues still increases total storage requirements.

The tradeoff is retention chosen in advance. Once fine-grained history has expired or
been consolidated, a later layout change cannot recreate the discarded detail. See
[Data sources and round-robin archives](/concepts/data-sources-and-rras/).

Configuration and operational state use the database because the application needs
shared updates and relational queries. This does not mean every relationship is
enforced by a database foreign key, or that a row store necessarily grows forever;
it describes this application's division of responsibility.

## Two paths, sharing two parts

A normal page or graph request typically follows this path:

1. A browser sends a request; PHP loads configuration and connects to the database.
2. The request applies authentication and the relevant realm/object authorization.
3. Console actions read or update configuration and may trigger additional work.
4. A graph request can check pending Boost samples and an image cache, or assemble
   an RRDtool command and read the configured files. See
   [How graphs are drawn](/concepts/how-graphs-are-drawn/).
5. Realtime graph requests can launch the realtime collector and use separate
   temporary data. A flat graph alone does not prove an empty file or successful
   collection and rendering.

A scheduled poll typically follows this path:

1. The scheduler starts the poller, which checks enable state, timing and storage.
2. It selects due work from the poller cache and launches collector children.
3. Children query devices or run collection scripts and stage results in the database.
4. The applicable writer processes grouped samples, using deferred queues when
   configured and retaining retryable failures.
5. Operational status and scheduling state are updated in the database.

See [Poller lifecycle](/reference/poller-lifecycle/) for ordering and failure handling.
These paths share database and storage resources and can contend for them. Restarting
the web server does not repair a separately scheduled poller, but web requests can
participate in collection and writing; diagnose the actual failing process.

## What runs as which user

| Process | Runs as | Started by |
|---|---|---|
| PHP web application | Web server or PHP-FPM pool account | Web server |
| Scheduled poller | Scheduler's configured account | cron, Task Scheduler, or configured service |
| RRDtool | Normally inherits the launching process's account | Web, poller or maintenance path |
| Collection scripts | Normally inherit their collector's account | Scheduled or web-triggered collection |

All participating writer accounts need appropriate access to the configured storage.
Normal data-source creation writes metadata; the RRD can be created later when a
writer needs it. A missing file can indicate that collection has not reached this
point, as well as a path, trust, permission or creation failure.

Some root-run creation paths attempt to apply the RRA directory's owner and group.
These attempts can fail and log errors; they are not a substitute for configuring
service accounts correctly. Non-root ownership follows operating-system rules,
including directory group inheritance and ACLs. Validate storage permissions and
numeric trusted UID/GID settings under every web and poller writer account. See
[Upgrade safely](/guides/upgrade-safely/).

The reviewed PHP ICMP implementation invokes the operating system's ping utility.
Its ability to send probes depends on that utility and OS policy; the presence of
legacy effective-UID helpers does not mean each ICMP probe elevates PHP to root.
Do not run the application as root merely to enable ping. Check the actual command,
account and error output; TCP or UDP checks have different reachability semantics.

## The work list is precomputed

The poller cache stores resolved collection work so each run need not derive every
command from template relationships. Configuration operations can rebuild affected
entries; explicit rebuild tools are available when needed.

Changes represented in cached fields need to reach those entries before collection
uses them. Other settings are read separately, so not every configuration change
requires a manual cache rebuild. Inspect cache contents, collection errors and remote
replication state rather than assuming one cause. See
[The poller cache](/concepts/the-poller-cache/) and
[Remote data collection](/concepts/remote-data-collection/).

## Where things usually break

| Symptom | Useful checks |
|---|---|
| Interface works, graphs are flat | Scheduler runs, collection errors, queues, sample freshness and graph window |
| Poller runs, files do not advance | Writer acknowledgement/errors, storage trust and permissions, deferred backlog |
| One data source is flat | Device response, cache row, file mapping, unknown samples and drawing expressions |
| Configuration change appears ineffective | Save result, template overrides, affected cache entries and replication |
| Regular gaps | Timing, heartbeat, timeouts, device availability and write failures |
| Unexpected graph shape | Generated command, CDEF/CF choices, actual file data, image cache and mapping |
| Port history appears attached to another interface | Query identity, renumbering and reindex results |
| Account sees console but no graphs | Graph-page realm, object authorization and requested graph identity |
| Collectors differ | Assignment, replicated configuration, local overrides and connection state |
| Everything is slow | Database waits, writer/storage contention, collector runtime and web workload |
| Data-source metadata exists but file does not | First collection/write, configured path, trust and creation errors |

These are starting points, not diagnoses. Follow the evidence across the relevant
boundary and verify the result after a change. See
[Troubleshoot missing data](/guides/troubleshoot-missing-data/).
