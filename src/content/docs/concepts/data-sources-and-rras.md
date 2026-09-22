---
title: Data sources and round-robin archives
description: What gets stored, how retention works, and why profile edits do not migrate existing RRD files.
sidebar:
  order: 2
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

A Kadupul data source groups measurements over time and normally maps to one RRD
file. Each named field inside that file is also called a data source (DS) by RRDtool.
Distinguish the application object from its fields when comparing counts or settings.

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

Creation records these definitions in the file. Database metadata and actual file
definitions can subsequently diverge; inspect the file with `rrdtool info` rather
than assuming the current template describes it exactly.

<span id="the-decisions-that-are-permanent"></span>

## Creation decisions and later maintenance

An RRD file is allocated at creation. Profile edits do not migrate existing
files. RRDtool provides tuning and resizing operations that can preserve stored
data, but they need separate validation and backups. The normal create path checks for an existing file and returns without replacing
it. That protection does not prohibit explicit tuning or migration. A template save
alone does not update the layout of existing files.

Four choices are recorded at that moment.

**The step.** How often a value is expected, usually 300 seconds. RRDtool normalizes updates onto step boundaries; more frequent readings are
not simply discarded. Whether slower updates produce unknown data depends on
the heartbeat and consolidation rules. The step
normally comes from the data source profile. File creation reads the data source's
stored step and the referenced profile's archives, so verify both when changing
metadata or planning a migration.

**The data source type.** See below. This is the one that fails quietly.

**The bounds.** A minimum and maximum constrain acceptable values; for rate-producing
DS types, those limits apply to the calculated rate, not the raw counter total.
Out-of-range data becomes unknown rather than being clamped. Query-based maxima can
resolve interface-speed placeholders; not every interface source automatically gets
a correct link-speed limit. Check template units and the actual file definition.

Creation has specific normalization branches. For a literal maximum at or below the
minimum, GAUGE and ABSOLUTE use an undefined maximum; other types use minimum plus
one. Query substitutions take a separate branch. A later zero/zero check changes the
maximum only, and earlier normalization may already have changed it. Do not treat
this as a general validator or assume both bounds become undefined.

**The archives.** How many samples to keep at which resolutions, and which
consolidation function to use for each. This is what decides whether you can answer
a question in two years.

## Data source types

| Type | Stores | Fits |
|---|---|---|
| `GAUGE` | A level, normalized to the file step | Temperature, load average, memory in use, queue depth |
| `COUNTER` | Rate of change per second, correcting for the counter wrapping at 32 or 64 bits | Interface octets, packet and error counts |
| `DERIVE` | Rate of change per second, allowed to be negative | A counter that can legitimately go down or be reset |
| `ABSOLUTE` | The value as given, divided by the time since the last reading | A count that the device resets every time you read it |
| `COMPUTE` | A value calculated from other fields in the same file rather than collected | A derived field, such as a total or a ratio |

Kadupul exposes `DCOUNTER` and `DDERIVE` when the configured RRDtool version is
1.5 or later. They accept floating-point counters; DCOUNTER also detects counting
direction and resets, so it is not simply COUNTER with decimals. The table describes
RRDtool semantics, not proof that every type is supported by every Kadupul editor or
creation path; validate the generated definition, especially for COMPUTE expressions.
See the upstream [RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Getting the type wrong

These examples illustrate mismatches; their visibility depends on the data and bounds.

`GAUGE` on an increasing counter graphs its level instead of throughput. It may climb
until a wrap or reset; that can be noticeable but is not guaranteed to look obviously
wrong over a short window.

`COUNTER` interprets decreases using wrap correction, so a reset can become a large
positive rate or be rejected by its maximum. `DERIVE` with a minimum of zero rejects
negative rates, including genuine wraps; choose it only when that tradeoff fits the
metric. A maximum does not distinguish every reset from a legitimate wrap.

`COUNTER` on a gauge is the dangerous one. The stored value becomes the change in
the gauge divided by the elapsed time. A device sitting steadily at 40 degrees
records zero. A one degree rise across five minutes records 0.0033. The graph may look plausible while measuring change instead of temperature. That
rate is useful only if it is the quantity you intended; it does not represent the
original gauge level.

`ABSOLUTE` on a counter that does not reset on read is the same class of quiet
failure in the other direction, producing values that scale with how long the
device has been up.

The rule this suggests is to decide the type from how the device produces the
number, not from what the number means. Whether a reading is a rate is a property
of the counter, not of the metric.

## The heartbeat

The heartbeat is the maximum permitted time between updates for a field before
RRDtool treats the interval as unknown. It is measured between updates, not as
extra time added after the step.

Read the configured profile and the actual file. The shipped five-minute profile
uses a 600-second heartbeat, the one-minute profile also uses 600 seconds, and
the thirty-second profile uses 1,200 seconds. Missing-poll tolerance therefore
cannot be described by one fixed count; normalization and consolidation also
affect which graph intervals are unknown.

The heartbeat is per field, not per file. Profile values inform metadata, but file
creation reads the local item heartbeat, which may differ from the profile. The shipped profiles do not use a single ratio, and the reasoning behind
each, along with what a heartbeat set too close to the step does, is in
[Time and intervals](/concepts/time-and-intervals/).

## Consolidation

As updates arrive, RRDtool also consolidates them into coarser buckets; it does not
wait for the finest archive to expire. The function is chosen per archive, and each function answers
a different question.

- `AVERAGE` summarizes the contributing primary data points.
- `MAX` keeps their largest value.
- `MIN` keeps their smallest value.
- `LAST` keeps their last value under RRDtool consolidation rules.

These operate on normalized primary data points, not necessarily the original raw
readings. A MAX archive cannot recover an instantaneous peak already averaged within
a primary interval; MIN is not a reliable detector of every outage.

A file stores one archive per function per resolution, so keeping all four at four
resolutions means sixteen archives and four times the value payload of keeping
averages alone with the same rows. Header and preparation-state overhead also uses
space. All three shipped profiles select four functions; choose retention according
to the questions and capacity requirements of your deployment.

If you only keep averages, you cannot later ask about peaks. The peaks were never
written down. This is the single most common regret in a long-lived installation,
and it cannot be fixed retroactively.

Some drawing-item paths substitute an available function when the requested one is
missing; other paths can fail. Verify the generated DEF and actual archives as
described in [How graphs are drawn](/concepts/how-graphs-are-drawn/).

## Unknown is a real value

An RRD distinguishes zero from unknown. Zero can be a reported level or a calculated
rate, such as an unchanged counter. Unknown can result from missing updates, heartbeat
expiry, explicit unknown input, rejected bounds or insufficient consolidation data.
Replacing unknown with zero can make missing or invalid measurements look like idleness.

Unknown propagates through consolidation under a threshold set per archive. The
shipped profiles set it at half: a coarse slot built from partly missing inputs
stays a real number until more than half of its inputs are unknown, at which point
the whole slot goes unknown. Visibility depends on bucket alignment, heartbeat,
normalization, consolidation and graph presentation. There is no universal outage
duration that guarantees a gap appears or disappears in every archive.

Unknown is also what the bounds produce. A reading above the configured maximum is
not clipped to the maximum. A counter reset may produce an out-of-range rate and
a gap, but bounds do not catch every reset. Unknown data alone does not identify
the cause; compare collection errors and timestamps.

## Sizing

For an unchanged layout, the archive value payload is the total slots across all
archives, times the number of fields, times eight bytes. Total file and deployment
size also includes headers, preparation state, filesystem allocation, queues and
backups. Explicit layout maintenance can change file size.

The three shipped profiles differ more than their names suggest.

| Profile | Step | Slots per field | Payload per field | Relative cost |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11,488 | about 90 KiB | 1 |
| 30 Second Collection | 30 s | 40,284 | about 315 KiB | 3.5 |
| 1 Minute Collection | 60 s | 81,716 | about 640 KiB | 7 |

A two-field interface data source doubles each of those. Ten thousand interfaces
on the five minute profile has roughly 1.8 GB of archive value payload. The same
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
At full collection cadence, a thirty-second step produces ten times as many sample
intervals as a five-minute step. Batching, shared fields, due-work selection and
failed retries affect command and physical write counts; they are not a fixed ratio. See
[High volume writes](/concepts/high-volume-writes/).

## Which fields reach the file

A data source built from a data template gets a field in the file only for the
fields some graph item references in the normal creation path. Update code can
exclude unreferenced template fields; whether they are collected depends on the
input method and cache, not merely whether a line is visible. A data source with no template gets every field, on
the grounds that there may be no graph to ask.

A reference need not draw a visible line: inspect graph-item mappings as well as the
cache and file definition. Adding a template field alone does not establish that
collection, graph mapping and storage are all ready. Rebuilding the cache addresses
collection metadata; it does not add fields to an existing RRD.

It also means adding a field to a template does not automatically add it to
existing files, even once a graph item references it. Adding a field requires
explicit maintenance or migration. Depending on the installed RRDtool version,
tuning can add data sources while retaining existing data; deleting and recreating
a file loses its history. See [Manage data retention](/guides/manage-data-retention/)
for the maintenance options and checks.
