---
title: Time and intervals
description: Polling interval, RRD step, heartbeat and clock skew, and why the timestamp on a sample decides more than people expect.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 7
---

There are two intervals, not one, and they belong to different things. How often
the collector runs is a property of the installation. How often a data source
expects a value is a property of that data source, fixed into its file at
creation. Most timing confusion comes from treating them as the same number.

| Number | Belongs to | Set by | Changeable later |
|---|---|---|---|
| Polling interval | The whole installation | A setting, from ten seconds up to five minutes | Yes |
| Step | One data source | Its profile, at creation | Not without rebuilding the file |
| Heartbeat | One field in one data source | Its profile, at creation | Only by tuning the file |

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

This one cannot be made to work. A data source whose step is shorter than the
polling interval is asking for samples more often than anything runs. Kadupul
detects it while building the work list, logs a warning, and mails the
administrator saying to lower the polling interval to match and rebuild the cache.

The file is not damaged by this. It simply has more slots than there are values to
fill them, so the graph is a comb.

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

The short-step profiles are deliberately forgiving, because at a thirty second
step a single slow device would otherwise punch a hole in a graph every time it
hesitated. The trade is that an outage takes twenty minutes to show up as a gap
rather than one. If you want outages visible promptly on a fast-stepping data
source, that is a decision to make at profile creation, not afterwards.

The failure mode at the other end is worse. A heartbeat at or below the polling
interval means that any jitter at all crosses the threshold, so the file records
unknown constantly and the graph is mostly holes. Kadupul's file audit reports
this case by name.

That audit is also where step and heartbeat drift shows up. If a profile is edited
after its data sources exist, the database can be brought back into agreement with
the profile, but the files cannot: their step was written at creation. The audit
reports the disagreement rather than pretending to fix it.

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

**A device with a wrong clock still graphs correctly.** Its notion of time never
enters the pipeline. This is genuinely useful: you do not have to fix NTP on a
thousand switches to trust your graphs.

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
a timestamp, so this is invisible. When they are split across batches they carry
different timestamps, neither group is complete, and that cycle produces nothing
for that data source. The leftovers are swept at the start of the next cycle.

Updates are also sorted into ascending time order before being written, because a
file will not accept a value older than its last update.

## Deferred writes keep their timestamps

When RRD writes are deferred and applied in bulk later, the recorded timestamp
travels with the value and the batch is written in time order. A sample collected
at noon and written at one o'clock still lands in the noon slot.

That is the property that makes deferred writing safe. It is also why a backlog
shows up as a graph that stops at the present and then fills in behind you, rather
than as data compressed into the moment it was flushed.

## When the cycle does not finish

A collector that passes the polling interval mid-run stops and logs it. The items
it had not reached produce no values that cycle. One such cycle is interpolated
away if the heartbeat allows it. A collector that overruns consistently produces a
graph full of small gaps, which reads as a flaky network and is actually a
capacity problem.

[Scale the poller](/guides/scale-the-poller/) covers what to do about it. The
ordering of a run, including the overrun guards, is in
[Poller lifecycle](/reference/poller-lifecycle/).
