---
title: High volume writes
description: Why RRD updates are limited by write count rather than write size,
  what batching them buys, and what it costs in freshness.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 10
slug: 1.2.31/concepts/high-volume-writes
---

An RRD update is a small write at a scattered offset in a file that never grows. The
number that matters is updates per second, not bytes per second. A few hundred bytes
per data source per interval is nothing. A few thousand separate files touched in the
same second is a storage problem.

This is the limit you hit that the rest of the system does not warn you about. The
poller finishes on time, the database is idle, and the graphs still have gaps.

## The default path

The poller writes its results into an in-flight results table. A pass reads that table,
groups the values by file, and issues one update per file.

That is the floor. One write per data source per interval, and there is no way to batch
across the interval, because this interval's sample does not exist until this interval
happens.

Two properties of that table are worth knowing. It is an in-memory table, so a database
restart discards whatever was in flight. And it holds only the current pass, so its
size is a function of the estate rather than of time.

The arithmetic is simple enough to do on the back of an envelope. Divide your data
source count by your step in seconds. Ten thousand data sources on a 300 second step is
about thirty-three file updates a second, each to a different file. Compare that against
what your storage does in small random writes. If it is comfortable, nothing on this
page applies to you.

## What batching changes

With deferred writes enabled, the poller stops calling the RRD writer. It inserts the
samples into a buffer table on disk instead, and returns.

Later, a separate pass takes one data source at a time, reads every buffered sample for
it in time order, and sends them as a single update command carrying many timestamps.
An hour of samples for one file becomes one write instead of twelve.

How many timestamps fit in one command is bounded by a configured argument length,
because the command has to fit within the operating system's limit on argument size.
That setting is not a tuning knob so much as a compatibility one.

The flush runs when either of two conditions is met: a timer elapses (one hour by
default), or the buffer exceeds a row count (one million by default). Whichever comes
first.

## The rotation, and why it is there

Draining a table the poller is still inserting into would mean contending with the
poller for the same rows. So the flush does not drain the buffer. It renames the buffer
aside to a timestamped archive table and puts a fresh empty table in its place, in one
statement.

The poller keeps inserting into the new table and never notices. The flush drains the
archive at its own pace and drops it only when the run completes. If the run does not
complete, the archive survives and the next run picks it up alongside the current one.

This is why the flush can take a long time without stalling collection, and why a
crashed flush loses nothing that was committed.

## Why the graphs are still right

The files can be an hour behind and the web interface still shows current data. Drawing
a graph flushes that one data source's buffered samples first, then reads the file.

This is what makes the mode usable. It is also what makes the staleness invisible from
the one place you are most likely to look. **The interface is not evidence that the
files are current.** Anything that reads the files directly, which includes your
backups, sees them as they actually are.

## What you trade away

**Freshness of the files.** Up to a full flush interval of data lives in the database
and not in the RRD tree. A snapshot of the RRD tree alone is an incomplete backup, and
restoring it discards whatever was buffered. See
[Back up and restore](/1.2.31/guides/back-up-and-restore/).

**A second clock.** You now have a polling interval and a flush interval, and problems
can hide in either. A flush that cannot keep up shows as a buffer table that grows
between runs rather than returning to empty.

**Ordering.** RRD files do not accept writes older than their last update. Because the
flush applies samples late, a sample that arrives after the file has moved past its
timestamp is discarded rather than inserted. The flush orders samples by time and skips
past updates for exactly this reason. Under deferred writes, a collector that delivers
a backlog very late may find the file has already moved on.

**Operational surface.** A buffer table to watch, a flush process with its own memory
limit, optional parallel flush processes, and archive tables that should not be
accumulating.

What you do *not* trade away is durability of the buffered samples themselves. The
buffer table is on disk and transactional. Samples that were committed survive a
database restart and a failed flush. The exposure is that the files are behind, not
that the data is gone.

## When it is worth it

Reach for it when the disk is the limit. The signature is a poller run that finishes
comfortably, a database that is not busy, and storage that is saturated during the
write phase.

It is not a fix for a slow database, slow devices, or a poller that cannot finish. It
moves work from the storage tree to the database, so a database that is already the
bottleneck gets worse rather than better.

It stops being optional the moment you have a second data collector, because that is
how a collector's samples reach the main install at all. See
[Remote data collection](/1.2.31/concepts/remote-data-collection/).

The reasoning to apply is a comparison, not a rule. Batching turns many small writes
into few large ones and charges you an hour of file staleness plus a buffer to operate.
If the small writes were not hurting, you have paid the price and bought nothing.

## A different feature with the same name

Rendered graph images can also be cached, and that setting lives beside the deferred
write settings. It solves an unrelated problem: the CPU cost of drawing the same graph
for many viewers. Turning one on does not turn the other on, and neither one implies
anything about the other.
