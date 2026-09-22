---
title: High volume writes
description: Why RRD updates are limited by write count rather than write size, what batching them buys, and what it costs in freshness.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 10
---

RRD updates touch many files and can be limited by storage latency and I/O operations,
not just transfer bandwidth. Deferred writes, also called Boost, collect samples in
the database and batch updates for each file. Measure the writer and database before
choosing it: graph gaps alone do not identify a storage bottleneck.

## The default path

Collectors insert results into the in-flight `poller_output` queue. The writer groups
samples by file and timestamp, updates the RRD, and tracks acknowledgement before
removing eligible samples. Failed writes can leave rows for retry, so the queue is
not restricted to the current polling pass.

In the reviewed revision, this queue uses InnoDB. Collection preflight rejects a
MEMORY queue; a database restart does not inherently discard committed rows as it
would for a MEMORY table. Durability still depends on database configuration, storage
health and backups. See [Upgrade safely](/guides/upgrade-safely/) for queue migration
and storage checks.

As a rough load estimate, 10,000 distinct files updated every 300 seconds imply about
33 file updates per second on average. Actual writes arrive in bursts; multiple data
source fields can share one file, steps can differ, and command count does not equal
physical disk I/O count. Compare measured writer latency and queue age with the
available polling window.

## What batching changes

With deferred writes enabled, collection stages samples in `poller_output_boost` for
later processing. The batch writer groups samples by data source in timestamp order
and can send several timestamps in one RRDtool update command. Twelve samples may fit
in one command, but this does not guarantee one physical disk write.

The configured maximum argument length bounds update strings; the default is 2,000.
It affects batching. Do not infer a particular operating-system limit from this
setting: local acknowledged writes use an RRDtool command stream, and the actual
transport and supported command size matter.

The scheduler normally becomes eligible when its timer is due (60 minutes by default)
or the estimated buffer row count exceeds the configured threshold (1,000,000 by
default). The row estimate includes live and archive tables. A scheduler invocation
must still occur, and process checks, preparation or writer failures can delay work.
Forced runs, draining after disabling, and on-demand graph updates are additional paths;
the defaults are not a one-hour freshness guarantee.

The scheduler also has known defects in its disabled-mode collector query and
numeric-zero interval fallback. See
[application bug #270](https://github.com/kadupulhq/kadupul/issues/270).
Use an explicit valid interval and inspect the resulting state; the normal default
is 60 minutes, not the defective fallback case.

## The rotation, and why it is there

The batch setup creates an empty table matching the live buffer, then swaps names
with a single `RENAME TABLE` statement. The old live table becomes a timestamped
archive and producers target the replacement. This separates the batch from new
inserts, but database locks and resource contention can still delay collection.

Workers process current and retained archives. The parent checks child completion and
status; failed or unverifiable runs retain archives for retry. During eligible cleanup,
empty archives can be dropped and remaining samples can be requeued into the live
buffer before dropping an archive. A nonempty archive is not simply discarded because
the process ended. Inspect both live and archive queues when diagnosing a backlog.

This is retry handling, not a universal crash-safety guarantee. Database errors,
concurrent activity, storage faults and backup consistency still need validation in
the deployment being operated.

## Why viewing a graph can update its files

The normal graph path can attempt on-demand updates for each data source referenced by
the graph before rendering. It does not flush every pending sample unconditionally:
collector checks, realtime/source/error-output paths, active polling cutoffs, query
limits and update failures affect what runs. Recent or failed samples may remain queued.

A graph that looks current therefore does not prove the entire RRD tree is current,
and requesting a graph does not guarantee successful replay. Check writer errors,
queue age and actual RRD timestamps. File-only backups omit pending database samples;
see [Back up and restore](/guides/back-up-and-restore/).

## What you trade away

**Freshness of the files.** Samples remain in the database until successfully processed.
A healthy timer-driven installation may lag roughly a flush interval; a failed or
undersized writer can lag longer. Back up pending queues and files consistently.

**A second schedule.** Monitor polling and flushing separately. Observe live rows,
retained archives, oldest sample age, failed workers and writer throughput. A live
table need not become empty while producers are still inserting, and rotation alone
can make it look smaller without completing any RRD updates.

**Ordering.** RRD files do not accept older timestamps after newer updates. The modern
Boost path uses skip-past-updates, and the legacy path filters timestamps against the
file's last update. A command acknowledged as successful can therefore skip old data;
late delivery does not guarantee that a sample appears in the graph.

**Operational surface.** There is a database buffer, a flush process with a memory
limit, optional parallel workers, and retained archives or requeued samples to monitor.
Local writer failures generally retain samples for retry, but this does not establish
end-to-end losslessness. In particular, the remote recovery path has a confirmed
unchecked-insert/deletion defect; see
[Remote data collection](/concepts/remote-data-collection/) and
[application bug #268](https://github.com/kadupulhq/kadupul/issues/268).

## When it is worth it

Consider deferred writes when measurement shows the RRD writer is the bottleneck and
the database has capacity for buffering and batch queries. It does not remove device
latency or repair an overloaded database. Compare throughput, queue age, file freshness
and resource use before and after enabling it.

The main poller automatically enables deferred updating when an enabled remote data
collector is configured. That setting alone does not establish a validated remote
storage or recovery deployment; use the limits in
[Remote data collection](/concepts/remote-data-collection/).

## A different feature with the same name

Rendered graph images can also be cached. Image caching reduces repeated rendering;
deferred writes batch database samples into RRD updates. Their settings are distinct,
but their execution paths interact: graph requests can check pending samples before
using a cached image, and successful updates can cause a new image to be rendered.
Evaluate image freshness separately from queue and RRD freshness.
