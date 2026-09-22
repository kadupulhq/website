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
| Heartbeat | A field inside an RRD | Maximum allowed gap between updates; creation reads the data-source field definition |

For example, a 60-second launcher and 10-second polling interval produce six
passes per invocation. A 300-second launcher and 300-second polling interval
produce one. Do not configure the launcher interval below the polling interval:
60/300 computes zero passes. Use one scheduler, and stop it before a manual
`--force` run. See [Installation](/start/install/).

Editing a profile does not automatically migrate existing files. Heartbeat can
be tuned; step changes require a planned migration using the installed RRDtool's
supported tools. Check both database definitions and `rrdtool info` afterward.

## When they agree

A data source whose step equals the polling interval is eligible on each pass,
subject to device state, cache contents and runtime limits. The shipped default
uses 300 seconds for both. Eligibility does not guarantee a successful reading.

## When the step is longer than the interval

The PHP collector uses `rrd_next_step` on each work-list row when multiple active
schedules require it. It selects rows at or below zero, then updates countdowns
for its collector and host range. Rows whose step equals the polling interval
stay at zero. Other rows decrement by the polling interval; on underflow, the
reset depends on invocation mode: a normal sub-launcher pass resets to step minus
interval, while equal launcher/poller intervals and the all-host path reset to
the full step. Do not assume that a ten-minute step always means every other
five-minute invocation; inspect actual due rows and update timestamps.

With **Balance Process Load** enabled, cache construction assigns offsets to
successive data sources on a device using the step and polling interval. Fields
of the same source share an offset. This can spread eligible work across passes,
but does not guarantee equal runtime: device latency, timeouts and scripts differ.
The launcher also aligns inconsistent field countdowns within a data source.

Before concluding an item is broken because it produced nothing during one
pass, check its due state and subsequent passes. See
[The poller cache](/concepts/the-poller-cache/) for rebuild limits.

## When the step is shorter than the interval

A shorter step cannot create measurements that the collector never took.
Kadupul warns while building the cache when collection is too slow for the step;
resolve the polling settings and rebuild the affected cache.

This mismatch does not guarantee a comb-shaped graph. RRDtool can normalize
less frequent updates into smaller steps when heartbeat permits, but that does
not restore missing measurement detail.

## Heartbeat is not always twice the step

The heartbeat is the maximum permitted interval between updates before input is
treated as unknown. RRD creation reads the heartbeat from the data-source field definition, which
can inherit profile/template settings. It is not an extra grace period added to
the step; inspect the actual field and file when they differ from the profile.

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

RRDtool normalizes updates into fixed step boundaries. Values between boundaries
can contribute to more than one primary data point. Heartbeat, explicit unknowns
and bounds affect valid input; archive consolidation applies its own unknown-data
threshold. A step need not contain a separate raw sample to hold a known value.

Counter values become rates over elapsed update time, subject to counter resets,
wrap handling and bounds. Gauges are normalized over time too. Short peaks can
be diluted or missed entirely by sampling; sustained values or boundary-aligned
updates need not be reduced. Archive settings cannot reconstruct detail that was
never collected or was lost during normalization.

## Which clock decides

For ordinary `cmd.php` collection, SQL `CURRENT_TIMESTAMP()` supplies the
output timestamp when a batch is inserted. This is not a device-provided timestamp
or an exact measurement of when the device answered. Other collection backends
and realtime paths must be checked separately.

The PHP collector buffers its results and write them in batches, flushing on a change of
device or when the buffer fills. The timestamp is evaluated once per batch, so
every value in one batch carries the same one.

The consequences are not obvious, so they are worth spelling out.

**The device clock does not timestamp these SNMP samples.** The collector
uses database insertion time. Device time can still matter to a script or to
the meaning of a particular metric, so this is not a general reason to ignore
clock synchronization.

**A wrong clock on a collector or its database does shift the data.** Values get
stamped into the wrong slots, and on a file that is already partly written, an
update whose time is not after the last one is refused outright. If timestamps move backwards behind the file’s last update, new updates cannot
advance that file until their timestamps exceed it. Check the database clock,
collector clock and file timestamp; a collector clock change alone does not
necessarily change database-generated timestamps.

**Time inside a cycle becomes jitter.** A device polled near the end of a long run
is stamped later than one polled at the start, even though both belong to the same
cycle. On a heavily loaded collector that jitter can become a meaningful fraction
of the interval, and it is one of the ways a heartbeat set too close to the step
starts producing gaps.

**The timezone of the database sits in the middle of the round trip.** The
timestamp is written as a database timestamp and converted back to an absolute
time by the database when it is read. Inconsistent session timezone handling can change that interpretation. Verify
the write/read session settings and epoch conversion when diagnosing a shift;
a display timezone change alone does not establish that stored history moved.

## Readings are assembled by timestamp

A data source with more than one field, such as an interface with bytes in and
bytes out, may use separate SNMP work-list items or a script returning several named
values. Parsed fields are grouped by data source and timestamp for an RRD update.

A set that is not complete is held back rather than written short, until the expected field count is satisfied. This is an assembly check, not a
guarantee that every field contains a valid numeric value; explicit unknowns
can still be written. Normally both halves are in the same batch and share
a timestamp, so this is invisible. Batches inserted within the same timestamp second can still match. When fields
receive different timestamps, the groups may remain incomplete and produce no
update. Current code retains incomplete groups across cycles, then logs and
expires them after `5 * max(60, poller_interval)` seconds. A read-page boundary
is extended to include its final timestamp group.

Updates are also sorted into ascending time order before being written, because a
file will not accept a value older than its last update.

## Deferred writes keep their timestamps

When RRD writes are deferred and applied in bulk later, the recorded timestamp
travels with the value and the batch is written in time order. A noon timestamp is retained when an update is attempted at one o’clock; it is
not replaced with flush time. RRDtool still normalizes accepted updates into its
step boundaries.

A backlog can advance a file through queued timestamps newer than its last
update. It cannot backfill arbitrary holes behind that timestamp. The Boost
writer filters samples at or before the file’s last update, so a drained queue
does not prove that every sample was applied. See
[High-volume writes](/concepts/high-volume-writes/) and the
[RRDtool update reference](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Deferred
writes still depend on successful storage and valid timestamp ordering; they
do not guarantee recovery from every failure. Inspect retained and rejected
output when a backlog does not clear.

## When the cycle does not finish

The PHP collector checks elapsed runtime between work items and ends its item
loop once it exceeds the polling interval, logging a warning. This is not a hard
interrupt at the deadline: an in-progress operation can overrun before that check. The items
it had not reached produce no values that cycle. A gap between valid updates can be bridged when heartbeat and archive
thresholds permit. Explicit unknown values and other failures can still leave
gaps. Repeated overruns are evidence to investigate capacity, timeouts and
collection errors, not proof that every visible gap has the same cause.

[Scale the poller](/guides/scale-the-poller/) covers what to do about it. The
ordering of a run, including the overrun guards, is in
[Poller lifecycle](/reference/poller-lifecycle/).
