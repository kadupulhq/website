---
title: Data sources and round-robin archives
description: What actually gets stored, and why the decisions you make at
  creation time are permanent.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/concepts/data-sources-and-rras
---

A data source is one thing being measured over time. Bytes in on port 3. Load
average on a server. Each data source maps to one RRD file.

One file is not always one number. A data source can carry several fields, and an
interface is the ordinary case: bytes in and bytes out share a file, are collected
as separate work items, and are written together as one update. What they share is
a step, a set of archives, and a fate. You cannot keep one of them longer than the
other, because retention is a property of the file and not of the field.

## What is inside the file

An RRD file is a header and two lists.

The first list is the fields: a name, a type, a heartbeat, and a minimum and
maximum for each. The second is the archives: a consolidation function, how many
steps of raw data go into one slot, how many slots there are, and how much of a
slot may be unknown before the slot itself becomes unknown.

Every number in both lists is written at creation and read on every update
afterwards. None of it is configuration in the sense that the database is
configuration. It is file format.

## The decisions that are permanent

An RRD file is allocated at creation. Its structure cannot be changed afterwards
without rebuilding the file and losing history. Kadupul will not rewrite a file
that already exists; the create path checks, finds the file, and returns without
touching it. A data template edited two years in changes what the next file looks
like and nothing about the ten thousand already on disk.

Four choices are fixed at that moment.

**The step.** How often a value is expected, usually 300 seconds. Feed it more often
and the extra samples are discarded. Feed it less often and gaps appear. The step
comes from the data source profile, which is also where the archives come from, so
the two are chosen together and cannot be chosen apart.

**The data source type.** See below. This is the one that fails quietly.

**The bounds.** A minimum and a maximum, either of which may be undefined. A sample
outside the range is recorded as unknown rather than clamped. Kadupul fills these in
from the data template, and for an interface it substitutes the discovered link
speed into the maximum, which is what discards the impossible spike a counter reset
would otherwise produce. It also repairs a nonsensical pair before writing it: a
maximum at or below the minimum becomes undefined for a gauge and the minimum plus
one otherwise, and a minimum and maximum both at zero become undefined.

**The archives.** How many samples to keep at which resolutions, and which
consolidation function to use for each. This is what decides whether you can answer
a question in two years.

## Data source types

| Type | Stores | Fits |
|---|---|---|
| `GAUGE` | The value as given | Temperature, load average, memory in use, queue depth |
| `COUNTER` | Rate of change per second, correcting for the counter wrapping at 32 or 64 bits | Interface octets, packet and error counts |
| `DERIVE` | Rate of change per second, allowed to be negative | A counter that can legitimately go down or be reset |
| `ABSOLUTE` | The value as given, divided by the time since the last reading | A count that the device resets every time you read it |
| `COMPUTE` | A value calculated from other fields in the same file rather than collected | A derived field, such as a total or a ratio |

RRDtool 1.5 added `DCOUNTER` and `DDERIVE`, which behave as their namesakes but
accept a fractional input. Kadupul offers them only when the configured RRDtool
version is 1.5 or later.

### Getting the type wrong

Two of the four mistakes announce themselves and two do not.

`GAUGE` on a counter is obvious. You graph the raw counter, which climbs forever,
rescales the axis, and looks nothing like traffic.

`COUNTER` on something that decreases is obvious after the first incident. RRDtool
treats any decrease as a wrap and adds the counter's full range back, so a small
drop becomes a spike of billions. This is the spike that people write scripts to
remove. `DERIVE` with a minimum of zero is the usual fix, because it discards
negative rates instead of inventing enormous positive ones.

`COUNTER` on a gauge is the dangerous one. The stored value becomes the change in
the gauge divided by the elapsed time. A device sitting steadily at 40 degrees
records zero. A one degree rise across five minutes records 0.0033. The graph is
smooth, the units look sane, the axis is plausible, and every number on it is
meaningless. Nothing in the file, the interface, or the logs says so.

`ABSOLUTE` on a counter that does not reset on read is the same class of quiet
failure in the other direction, producing values that scale with how long the
device has been up.

The rule this suggests is to decide the type from how the device produces the
number, not from what the number means. Whether a reading is a rate is a property
of the counter, not of the metric.

## The heartbeat

The heartbeat is how long the file will wait past the expected step before it
gives up and records unknown for that field. At twice the step, one missed poll is
tolerated and interpolated, and two missed polls become a gap.

This is why a poller that consistently runs slightly late produces a graph full of
small gaps. The data arrived, past the heartbeat.

The heartbeat is per field, not per file, and it comes from the profile alongside
the step. The shipped profiles do not use a single ratio, and the reasoning behind
each, along with what a heartbeat set too close to the step does, is in
[Time and intervals](/1.2.31/concepts/time-and-intervals/).

## Consolidation

When samples are older than the finest archive, they are consolidated into coarser
buckets. The function that does it is chosen per archive, and each function answers
a different question.

* `AVERAGE` answers "what was typical".
* `MAX` answers "how bad did it get".
* `MIN` answers "did it ever drop out".
* `LAST` answers "what was the final reading in that bucket".

A file stores one archive per function per resolution, so keeping all four at four
resolutions means sixteen archives and four times the disk of keeping averages
alone. The shipped profiles all keep four functions, which is the expensive choice
made on your behalf, and it is the right default.

If you only keep averages, you cannot later ask about peaks. The peaks were never
written down. This is the single most common regret in a long-lived installation,
and it cannot be fixed retroactively.

It is also silent at render time. A graph item asking for `MAX` against a file that
holds only averages does not fail. It reads averages and says nothing, which is
covered in [How graphs are drawn](/1.2.31/concepts/how-graphs-are-drawn/).

## Unknown is a real value

An RRD distinguishes zero from unknown, and so should you. Zero means the device
said zero. Unknown means nothing arrived. Collapsing the two makes an outage look
like idleness.

Unknown propagates through consolidation under a threshold set per archive. The
shipped profiles set it at half: a coarse slot built from partly missing inputs
stays a real number until more than half of its inputs are unknown, at which point
the whole slot goes unknown. A brief outage therefore dents the daily archive and
vanishes entirely from the yearly one. A long outage survives into every archive.

Unknown is also what the bounds produce. A reading above the configured maximum is
not clipped to the maximum, it is discarded. On an interface whose maximum is the
link speed, a counter reset produces a gap rather than a spike, which is the
intended outcome and looks identical to an outage.

## Sizing

Disk is decided entirely at creation, by arithmetic you can do in advance. RRDtool
stores eight bytes per value, so a file's payload is the total number of slots
across every archive, times the number of fields, times eight.

The three shipped profiles differ more than their names suggest.

| Profile | Step | Slots per field | Payload per field | Relative cost |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11,488 | about 90 KiB | 1 |
| 30 Second Collection | 30 s | 40,284 | about 315 KiB | 3.5 |
| 1 Minute Collection | 60 s | 81,716 | about 640 KiB | 7 |

A two-field interface data source doubles each of those. Ten thousand interfaces
on the five minute profile is roughly 1.8 GB and stays roughly 1.8 GB. The same
ten thousand on the one minute profile is closer to 13 GB, and the reason is not
the step by itself; that profile also keeps a much deeper monthly archive and a
ten year yearly one.

What each archive actually covers is worth checking against its name. The five
minute profile's archives are labelled Daily, Weekly, Monthly and Yearly, and the
spans they hold are 50 hours, 14.6 days, 64.6 days and 2.2 years. The names
describe the graph preset each archive was sized for, not the retention. If you
need to answer a question about last April at five minute resolution, the label
will tell you that you can and the archive will not.

Write load moves with the profile too, and it arrives well before the disk does.
Every data source is one small write per step, so a thirty second profile issues
ten times the writes of a five minute one across the same estate. See
[High volume writes](/1.2.31/concepts/high-volume-writes/).

## Which fields reach the file

A data source built from a data template gets a field in the file only for the
fields some graph item references. Fields nothing draws are collected and dropped
before the file is written. A data source with no template gets every field, on
the grounds that there may be no graph to ask.

This is why adding a field to a data template and waiting for numbers to appear
does not work until something draws it. Rebuilding the poller cache does not fix
it, because the work list was never wrong.

It also means a field added to a template after the files exist has nowhere to go
in those files, even once a graph item references it. The file was created with
the fields it was created with. Adding one is a rebuild, with the same loss of
history as any other structural change.
