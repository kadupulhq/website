---
title: Command line tools
description: What ships in the cli directory and when you would reach for it.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Cacti 1.2.x ships 46 command line scripts. Kadupul inherits them. They exist for the
work the web interface is bad at: bulk changes, scheduled maintenance, and recovery
when the interface itself is the thing that is broken.

## The ones worth knowing

**Bulk creation.** Adding devices, data sources, graphs, trees, and permissions from
a script. This is how you onboard a few hundred devices without clicking.

**Poller maintenance.** Rebuilding the poller cache, reindexing devices, and
reapplying names to data sources and graphs. The cache rebuild is the one you will
reach for most, because a configuration change that appears to do nothing is usually
a stale cache.

**Database maintenance.** Analyzing and auditing the schema. Useful after an upgrade
or when the interface is reporting something inconsistent.

## Two habits worth keeping

Run them as the same user the poller runs as. A maintenance script run as root can
leave files the poller cannot write, and the failure appears later as gaps in graphs
with no obvious cause.

Read what a script does before running it against production. These tools change
data in bulk, which is the point of them, and several have no confirmation step.

:::note
Per-script documentation is not written yet. It will be, sourced from the code
rather than inherited.
:::
