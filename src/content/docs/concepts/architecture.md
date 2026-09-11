---
title: Architecture
description: The four moving parts, and which one is usually at fault.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

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

## Why measurements are not in the database

Because the files never grow. A round-robin archive is allocated once, at creation,
with room for a defined number of samples at each resolution. When it fills, the
oldest sample is overwritten. A thousand data sources consume the same disk in year
five as in week one.

This is a deliberate trade. You get predictable capacity and fast graphing. You give
up the ability to ask questions you did not plan for, because resolution you did not
allocate is gone for good.

## The poller cache

The poller does not work out what to collect each run. That would mean querying the
configuration tables on every interval for every device. Instead the work list is
precomputed into a cache table, and the poller reads that.

The consequence is the part that surprises people: **changing configuration does not
change collection until the cache is rebuilt.** Most "my change did nothing" reports
are this.

## Where things usually break

| Symptom | Part at fault |
|---|---|
| Interface is fine, graphs are flat | Poller |
| Poller runs, RRD files not updating | Filesystem permissions, or the poller user |
| Configuration change had no effect | Poller cache |
| Everything slow under load | Database, or poller overrunning its interval |
