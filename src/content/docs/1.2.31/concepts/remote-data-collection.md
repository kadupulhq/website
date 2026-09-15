---
title: Remote data collection
description: Why collection distributes and storage does not, what a remote
  collector owns, and what it costs to have a second copy of the configuration.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 9
slug: 1.2.31/concepts/remote-data-collection
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/1.2.31/reference/rrdproxy/).
:::

Collection is the part that does not fit on one machine. Most of a polling run is
spent waiting for devices to answer, and waiting does not compress. You can overlap
more of it with more processes and threads, up to the point where the collecting host
runs out of CPU or the round trip to a distant site dominates everything.

A remote collector is the same code with a different collector id, polling a subset of
devices. Each device names the collector responsible for it. That assignment is the
whole partition: a collector polls its devices and no others.

For the question of *when* to reach for one, see
[Scale the poller](/1.2.31/guides/scale-the-poller/). This page is about what one is.

## Why a collector carries its own database

A collector that reads its work list from the central database over the network stops
collecting when the network stops. That is the opposite of what you wanted a remote
collector for.

So it carries a local database holding its own copy of the configuration: settings,
templates, data input methods, data queries, its slice of the poller cache, its
devices, the plugin configuration, and the user and permission tables. That copy is
pushed out from the main install. The collector does not author it.

Path settings are excluded from the copy, along with the per-run statistics the main
install keeps for itself. Paths are properties of a machine, not of the installation.

## Replication is periodic, so configuration lags

The main install checks which collectors are due for a synchronisation and pushes to
them. Due means one of three things: the collector has never been synchronised, its
interval has elapsed, or something marked it as needing one.

The default interval is two hours. This is the consistency model, and it is worth
stating without hedging: **a configuration change at the main install is not live on a
remote collector until replication runs.** Adding a device to a remote collector,
changing a template, rebuilding the poller cache; none of it reaches the collector
immediately.

This is the single largest behavioural difference between one poller and several, and
it is the source of most "my change did nothing" reports on a distributed install.
There is a command line tool to force a synchronisation rather than waiting.

## Three connection modes

A collector decides at startup how it is going to behave, based on whether the central
database answers and whether it is holding samples that have not been delivered.

| Mode | Condition | Behaviour |
|---|---|---|
| Online | The central database answers | Results go straight to the main install |
| Offline | The central database does not answer | Results accumulate locally |
| Recovery | Local buffered results are waiting | Deliver the backlog, then resume |

Offline is not an error state. It is the designed behaviour of a collector whose link
is down, and it is why a collector has a local database at all. Collection continues
against the replicated configuration, which is as current as the last successful
synchronisation.

## How results reach the main install

Results do not travel as RRD writes. They travel as rows.

Deferred RRD writing is required when there is more than one collector, and adding a
second collector turns the setting on by itself rather than letting the installation
run in a state that cannot work. See [High volume writes](/1.2.31/concepts/high-volume-writes/)
for what that mode does.

Online, a collector inserts its samples directly into the central buffer table. The
main install flushes them into RRD files on its own schedule, exactly as it would for
samples it collected itself. The collector's samples are not special once they arrive.

Offline, the collector inserts into its own local buffer instead. When the link
returns, a recovery pass moves the backlog across and deletes locally only the rows the
main install acknowledged. A delivery that fails partway leaves the undelivered rows
where they are rather than assuming success.

Before a handoff is accepted, the samples are checked against the collector's device
assignment. A batch containing data sources that belong to another collector is
rejected and logged. Two collectors polling the same device is a configuration mistake,
and the guard makes it a visible one rather than a data corruption one.

## Storage does not distribute

The inherited proxy-based workflow keeps RRD files central and expects collectors
to reach them through the RRDtool proxy. That workflow is unsupported in Kadupul;
do not treat it as deployment guidance. A validated multi-collector storage path
using local RRDtool must be documented before recommending a replacement.

This is the part people are most often surprised by, so it is worth being direct about
it. **Remote collectors distribute the waiting, not the writing.** If the limit you hit
was the disk under the RRD tree, adding collectors makes it worse: you now have several
machines feeding samples into one database and one storage tree, faster than before.

## What else flows back

A collector owns the operational state of its devices. Reachability, the last error,
round trip times, poll counts, availability. It writes those locally as it polls and
pushes them to the main install in bulk, overwriting the stored row there.

So what the main install shows for a device's reachability is the collector's view, as
of the last successful push. A collector that is offline has a current view of its own
devices that nobody at the main install can see.

The main install tracks collectors the same way a collector tracks devices. A collector
that has not reported within twice the polling interval is treated as gone.

## Failure modes

| What fails | What happens | What you notice |
|---|---|---|
| Link to the main install | Collector goes offline, keeps polling, buffers locally | Graphs stop advancing; data arrives late, not lost |
| The collector itself | Its devices are not polled | Gaps on that collector's devices only |
| Replication | The collector runs an older configuration | Changes appear not to take effect |
| The central database | Every collector goes offline at once | All graphs stop; buffers grow everywhere |
| Two collectors on one device | The unexpected handoff is rejected | A log entry, not corrupted files |

The recurring shape is that a distributed install turns outages into delays. Samples
arrive late rather than not at all. That is an improvement over one poller, and it
makes the graphs harder to read during an incident, because a flat line might mean the
device is down or might mean the collector has not delivered yet.

## What it costs

Against a single central poller:

**You gain** parallel device round trips across machines, polling that happens near the
devices instead of across a WAN, and collection that survives the main install being
unreachable.

**You pay** with a configuration replica that lags by hours, a second database to
operate, monitor, and back up per collector, a deferred-write mode that is no longer
optional, and a central database that now takes concurrent writes from every collector.

The honest summary is that a remote collector is a machine you now have to run. One
poller with more processes is a setting. A collector is infrastructure, with its own
database, its own credentials, its own clock, and its own version of the truth for
however long replication has not run.
