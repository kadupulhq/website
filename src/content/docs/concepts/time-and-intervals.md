---
title: Time and intervals
description: Polling interval, RRD step, heartbeat and clock skew, and why the timestamp on a sample decides more than people expect.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 7
---

Collection involves three clocks: the launcher cadence, the polling interval
inside each invocation, and the RRD step. They need compatible settings.

| Number | Belongs to | How it is used |
|---|---|---|
| Launcher interval | Cron, Task Scheduler or `cactid.php` | Must match `cron_interval`, interpreted by `poller.php` as 60 or 300 seconds |
| Polling interval | Collection passes | `poller.php` computes an integer number of passes per launcher interval |
| Step | An RRD file | Base normalization interval, set from the data source profile at creation |
| Heartbeat | A field inside an RRD | Maximum allowed gap between updates, initially taken from the profile |

For example, a 60-second launcher and 10-second polling interval produce six
passes per invocation. A 300-second launcher and 300-second polling interval
produce one. Do not configure the launcher interval below the polling interval:
60/300 computes zero passes. Use one scheduler, and stop it before a manual
`--force` run. See [Installation](/start/install/).

Editing a profile does not automatically migrate existing files. Heartbeat can
be tuned; step changes require a planned migration using the installed RRDtool's
supported tools. Check both database definitions and `rrdtool info` afterward.

## When they agree

If a data source's step equals the polling interval, every cycle collects it.
There is no scheduling to do, and the shipped default has both at five minutes for
exactly that reason.

## When the step is longer than the interval

A data source on a ten minute step, in an installation that polls every five
minutes, should be read every other cycle. Kadupul handles that with a countdown
stored on each work list row. Only rows whose countdown has reached zero are
selected; every row in range then has the polling interval subtracted from its
countdown, and a row that falls below zero is reset to its step minus one
interval.

Left alone, that scheme would make every long-step item come due in the same
cycle, producing a heavy cycle followed by light ones. Process leveling exists to
prevent that. It gives the long-step data sources on one device staggered starting
offsets, spread across the number of cycles that fit inside their step, so the
work lands evenly.

This is worth knowing because it means a data source can be correctly configured,
correctly cached, and still produce nothing on the cycle you happen to be
watching. Before concluding an item is broken, check whether it was due.

## When the step is shorter than the interval

A shorter step cannot create measurements that the collector never took.
Kadupul warns while building the cache when collection is too slow for the step;
resolve the polling settings and rebuild the affected cache.

This mismatch does not guarantee a comb-shaped graph. RRDtool can normalize
less frequent updates into smaller steps when heartbeat permits, but that does
not restore missing measurement detail.

## Heartbeat is not always twice the step

The heartbeat is the maximum permitted interval between updates before input is
treated as unknown. It comes from the profile when the data source is created;
it is not an extra grace period added to the step.

The shipped profiles do not follow one rule.

| Profile | Step | Heartbeat | Update interval limit |
|---|---|---|---|
| Five minute | 300 | 600 | 10 minutes |
| One minute | 60 | 600 | 10 minutes |
| Thirty second | 30 | 1200 | 20 minutes |

These are shipped profile values, not an outage-detection timer. Explicit
unknown inputs can create gaps before heartbeat expires; missing updates,
normalization and archive thresholds affect what becomes visible. A larger
heartbeat tolerates a longer gap between valid updates. At or below the normal
update interval, it leaves little or no tolerance for delay.

Check the actual file as well as its profile. Existing RRDs can differ from
edited database definitions; the file audit reports such drift. Review the
[RRDtool heartbeat definition](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html)
and [tuning reference](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) before
planning file changes.

## What is stored is not what the device said

RRDtool places values on fixed step boundaries. A sample that arrives between two
boundaries is apportioned across the slots it spans, and a slot that receives no
sample within the heartbeat becomes unknown rather than being filled in.

For a counter this is the whole point: the stored value is a rate, computed
against the elapsed time between updates, so a slightly late reading still yields
a correct rate. For a gauge it is a mild surprise. A brief spike sampled just off
a boundary is spread across two slots and looks smaller than it was. Peaks are
never quite as sharp in the file as they were on the wire, and no archive setting
recovers that.

## Which clock decides

The timestamp on a sample does not come from the device, and it does not come from
the moment the device answered. It is supplied by the database when the collected
values are inserted.

Collectors buffer their results and write them in batches, flushing on a change of
device or when the buffer fills. The timestamp is evaluated once per batch, so
every value in one batch carries the same one.

The consequences are not obvious, so they are worth spelling out.

**The device clock does not timestamp these SNMP samples.** The collector
uses database insertion time. Device time can still matter to a script or to
the meaning of a particular metric, so this is not a general reason to ignore
clock synchronization.

**A wrong clock on a collector or its database does shift the data.** Values get
stamped into the wrong slots, and on a file that is already partly written, an
update whose time is not after the last one is refused outright. A collector whose
clock jumps backwards stops recording until real time catches up.

**Time inside a cycle becomes jitter.** A device polled near the end of a long run
is stamped later than one polled at the start, even though both belong to the same
cycle. On a heavily loaded collector that jitter can become a meaningful fraction
of the interval, and it is one of the ways a heartbeat set too close to the step
starts producing gaps.

**The timezone of the database sits in the middle of the round trip.** The
timestamp is written as a database timestamp and converted back to an absolute
time by the database when it is read. Changing that configuration underneath a
running installation changes where values land.

## Readings are assembled by timestamp

A data source with more than one field, such as an interface with bytes in and
bytes out, is collected as separate work list items producing separate results.
They are reassembled into one update by matching their timestamps.

A set that is not complete is held back rather than written short, so that a file
never records a half reading. Normally both halves are in the same batch and share
a timestamp, so this is invisible. Batches inserted within the same timestamp second can still match. When fields
receive different timestamps, the groups may remain incomplete and produce no
update. Current code retains incomplete groups across cycles, then logs and
expires them after `5 * max(60, poller_interval)` seconds. A read-page boundary
is extended to include its final timestamp group.

Updates are also sorted into ascending time order before being written, because a
file will not accept a value older than its last update.

## Deferred writes keep their timestamps

When RRD writes are deferred and applied in bulk later, the recorded timestamp
travels with the value and the batch is written in time order. A sample collected
at noon and written at one o'clock still lands in the noon slot.

A successfully drained backlog can therefore fill in earlier history. Deferred
writes still depend on successful storage and valid timestamp ordering; they
do not guarantee recovery from every failure. Inspect retained and rejected
output when a backlog does not clear.

## When the cycle does not finish

A collector that passes the polling interval mid-run stops and logs it. The items
it had not reached produce no values that cycle. A gap between valid updates can be bridged when heartbeat and archive
thresholds permit. Explicit unknown values and other failures can still leave
gaps. Repeated overruns are evidence to investigate capacity, timeouts and
collection errors, not proof that every visible gap has the same cause.

[Scale the poller](/guides/scale-the-poller/) covers what to do about it. The
ordering of a run, including the overrun guards, is in
[Poller lifecycle](/reference/poller-lifecycle/).
