---
title: Remote data collection
description: Why collection distributes and storage does not, what a remote collector owns, and what it costs to have a second copy of the configuration.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 9
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/reference/rrdproxy/).
:::

Collection is the part that does not fit on one machine. Most of a polling run is
spent waiting for devices to answer, and waiting does not compress. You can overlap
more of it with more processes and threads, up to the point where the collecting host
runs out of CPU or the round trip to a distant site dominates everything.

A remote collector is the same code with a different collector id, polling a subset of
devices. Each device names the collector responsible for it. That assignment is the
normal scheduling partition. Keep the device assignment and replicated poller cache
consistent; this scheduling choice is not proof that every result write enforces
collector ownership.

For the question of *when* to reach for one, see
[Scale the poller](/guides/scale-the-poller/). This page is about what one is.

## Why a collector carries its own database

A collector that reads its work list from the central database over the network stops
collecting when the network stops. That is the opposite of what you wanted a remote
collector for.

So it carries a local database holding its own copy of the configuration: settings,
templates, data input methods, data queries, its slice of the poller cache, its
devices, the plugin configuration, and the user and permission tables. That copy is
pushed out from the main install. Treat the main install as the configuration
authority, while the collector maintains local operational state and machine settings.

Path settings are excluded from the copy, along with the per-run statistics the main
install keeps for itself. Paths are properties of a machine, not of the installation.

## Replication is periodic, so configuration lags

The main poller checks enabled remote collectors with a nonlocal database host and a
nonzero synchronization interval. A collector is due if it has never synchronized,
its interval has elapsed, or it is marked as requiring synchronization. A zero
interval excludes it from this periodic check, even when marked as requiring sync.

The global default is two hours; a collector can have its own interval. This is not
a guarantee that every change waits two hours: device and plugin operations also
have targeted replication paths. Successful propagation depends on that operation,
connectivity and the selected tables. Check the collector's actual configuration and
cache rather than assuming either immediate consistency or a fixed delay.

Full replication can be requested from the main collector with
`php cli/poller_replicate.php --force`, when enabled remote collectors are configured.
See [Scale the poller](/guides/scale-the-poller/) and
[Migrate to new hardware](/guides/migrate-to-new-hardware/) for operational context.

## Three connection modes

A collector decides at startup how it is going to behave, based on whether the central
database answers and whether it is holding samples that have not been delivered.

| Mode | Condition | Behaviour |
|---|---|---|
| Online | Central database connects and no local Boost backlog is detected | Result writes target the central database |
| Offline | Central connection fails or is forced offline | Collection uses local buffering, if local services remain healthy |
| Recovery | Central database connects and local Boost rows remain | New samples remain local while a background process attempts backlog transfer |

Offline is not an error state. It is the designed behaviour of a collector whose link
is down, and it is why a collector has a local database at all. Collection continues
against the configuration available locally. Local database capacity, device access,
scheduler health and usable credentials are still required; offline mode does not
guarantee uninterrupted collection or eventual delivery.

## How results reach the main install

Results do not travel as RRD writes. They travel as rows.

Deferred RRD writing is required when there is more than one collector, and adding an
enabled remote collector causes the main poller to enable deferred updating.
The startup path also enables system Boost and redirection when multiple collector
records exist. These settings do not by themselves validate a working deployment.
See [High volume writes](/concepts/high-volume-writes/) for what that mode does.

Online, a collector inserts its samples directly into the central buffer table. The
main install flushes them into RRD files on its own schedule, exactly as it would for
samples it collected itself. The collector's samples are not special once they arrive.

Offline and during recovery, samples accumulate in the local Boost queue. When the
central database is reachable again, `poller_recovery.php` attempts to insert buffered
rows into the central Boost queue with `INSERT IGNORE`.

:::caution[Recovery is not verified lossless]
In the reviewed revision, recovery does not check the central insert results before
deleting local rows through the batch timestamp. An isolated failure probe confirmed
that a failed insert is followed by a local deletion attempt and an increased inserted
counter. See [application bug #268](https://github.com/kadupulhq/kadupul/issues/268).
Retain a matched backup of buffered data and investigate recovery write failures;
a counter increase is not acknowledgement of delivery. This page does not establish
a validated multi-collector recovery procedure.
:::

The recovery inserts carry data-source identifiers, names, timestamps and values;
they do not check those rows against collector assignments. Do not rely on a universal
handoff rejection to protect against stale assignments or overlapping producers.
Validate assignments and cache state before enabling collection.

## Storage does not distribute

The inherited proxy-based workflow keeps RRD files central and expects collectors
to reach them through the RRDtool proxy. That workflow is unsupported in Kadupul;
do not treat it as deployment guidance. A validated multi-collector storage path
using local RRDtool must be documented before recommending a replacement.

This is the part people are most often surprised by, so it is worth being direct about
it. **Remote collectors distribute the waiting, not the writing.** If the limit you hit
was the disk under the RRD tree, extra collection capacity does not remove that
limit. More incoming samples can increase the central database and writer backlog.

## What else flows back

A collector owns the operational state of its devices. Reachability, the last error,
round trip times, poll counts, availability. It writes those locally as it polls and
pushes selected operational columns to the main install in bulk. This updates
those columns, not the entire device configuration row.

So what the main install shows for a device's reachability is the collector's view, as
of the last successful push. A collector that is offline has a current view of its own
devices that nobody at the main install can see.

The main install tracks collectors the same way a collector tracks devices. A collector
liveness helper considers an enabled remote collector up only when its last-status
timestamp is less than twice the configured polling interval old. This check does not
prove sample delivery, successful replication or current graphs.

## Failure modes

| What fails | What happens | What you notice |
|---|---|---|
| Link to the main install | Collector can continue locally while its database and scheduler remain healthy | Delayed graphs and a growing queue; delivery and loss must be checked |
| The collector itself | Its assigned devices may no longer be polled | Missing samples; diagnose scheduler, device and collector state |
| Replication | The collector runs an older configuration | Changes appear not to take effect |
| The central database | Remote processes can enter offline mode when connection setup fails | Central ingestion is disrupted; remote buffering depends on local health |
| Overlapping or stale assignments | More than one producer may submit related samples | No universal handoff rejection; inspect assignments, timestamps and write errors |

Buffering can turn some outages into delays, but it does not make delivery lossless.
Check queue age, database capacity, recovery errors and the resulting RRD timestamps.
A flat graph alone cannot distinguish a device outage from delayed or failed delivery.

## What it costs

Against a single central poller:

**You gain** parallel device round trips across machines, polling that happens near the
devices instead of across a WAN, and the ability to continue local collection while
the main install is unreachable, subject to the recovery and local-health limits above.

**You pay** with configuration replication that can lag, a second database to
operate, monitor, and back up per collector, a deferred-write mode that is no longer
optional, and a central database that now takes concurrent writes from every collector.

The honest summary is that a remote collector is a machine you now have to run. One
poller with more processes is a setting. A collector is infrastructure, with its own
database, its own credentials, its own clock, and its own version of the truth for
however long replication has not run.
