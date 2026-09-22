---
title: Read your first graph
description: What the lines actually mean, and the three mistakes that make people misread them.
sidebar:
  order: 4
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

A graph here is not a picture of your data. It is a picture of a summary of your
data, and knowing which summary matters.

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

## What you are looking at

Every graph is drawn from a round-robin archive. The archive stores recent samples
at full resolution and older samples consolidated into coarser buckets. When you
zoom out to a year, you are not seeing every five-minute sample. You are seeing one
value per bucket, chosen by a consolidation function.

That function is usually the average. It can also be the maximum or the minimum.
This matters more than anything else on the page.

For an ordinary on-demand graph request, Kadupul assembles an
RRDtool command from the graph's configuration and runs it against the files on
disk. Three kinds of line go into that command and it helps to know which is which.

| Part | What it does |
|---|---|
| A definition | Names a file, a data source inside it, and a consolidation function |
| A drawing item | Turns one series into a line, an area, or a band in a stack |
| A legend item | Prints one number, computed over the window you are viewing |

The whole assembly is described in [How graphs are
drawn](/concepts/how-graphs-are-drawn/). You do not need it today. You need to know
that the graph definition and requested time range determine the image.
Caching and real-time graph paths can behave differently.

## Start with the last four hours

Start with a short recent window. The selected archive depends on retention,
step and graph resolution; four hours does not guarantee raw or unconsolidated
data. Even the finest archive contains time-normalized values. Use the graph’s
debug command and `rrdtool info` to check the requested function and available
archive steps before comparing values.

Two features of a fresh graph are normal and alarm people anyway.

**The line can end before now.** The current bucket may be incomplete.
Collection timing, buffering and normalization can also delay the visible endpoint.
Check advancing update timestamps rather than treating a fixed lag as proof of health.

**The first stretch may be missing.** A data source created an hour ago has an hour
of data and eleven months of nothing. The archive is allocated in full at creation,
so the empty part is real storage waiting to be used.

## Then widen it, and watch the peak change

Widen the range to a week. Peaks can shrink when the graph selects coarser
averages. For example, if utilization is 100% for five minutes and zero for the
remaining 55 minutes, the hourly average is about 8.3%. A four-minute burst in
an otherwise idle hour averages about 6.7%. Short peaks may already be smoothed
inside the original sampling interval.

Consolidation discards detail. If fine-resolution history has expired, zooming
back in cannot reconstruct it from an average archive.

This is the first of the three mistakes, and the one that costs the most arguments.

**Reading an average as a peak.** If you care about saturation, look at a graph
built on the maximum, not the average. That only works if the archives hold maxima.
If only coarse averages remain, the original peaks cannot be reconstructed.
A MAX archive preserves maxima of its input time-normalized points, not an
unobserved instantaneous peak between polls.

There is a quiet failure here worth knowing. If a graph item asks for maxima and
the file does not have them, Kadupul’s selection helper can fall back to the first available function,
or AVERAGE when it cannot determine the available functions. The picture looks fine. It is answering a different question.

**Reading a gap as a zero.** A gap represents an unknown plotted value. Causes
include missing updates, explicit unknown input, rejected values and graph
expressions. It does not uniquely identify an unavailable device.

Heartbeat is the maximum permitted time between updates, not extra time added
to the step. For example, a 300-second step with a 600-second heartbeat permits
at most 600 seconds between updates, not 900. Archive unknown-data thresholds
also affect visible gaps. See [RRDtool’s data-source definitions](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html)
and [Time and intervals](/concepts/time-and-intervals/).

Beware of stacked graphs here. Some templates substitute zero for unknown values in their graph expressions.
On those graphs an outage and an idle period look the same by design. Check an
unstacked view before concluding a service went quiet.

**Comparing two graphs with different vertical scales.** Two graphs side by side will
each scale to their own data. A small bump and a large one can look identical.
Check the axis before concluding anything.

While you are looking at the axis, check its base. A graph can label in thousands
or in units of 1024. The stored numbers are identical; only the labels move. The difference depends on the prefix: 1024 versus 1000 is 2.4% for one power
and grows at larger prefixes. Also check bits versus bytes, graph expressions
and consolidation; a percentage difference alone does not identify the cause.

## Reading the legend

The legend carries the numbers that matter more than the shape does. “Current” is normally the LAST reduction of the selected series, which need
not be a measurement taken at the instant you view the graph. Average and maximum are computed across the window you are
viewing, not across all time, so they change as you zoom.

The shipped legend entries are minimum, maximum, average, and last, which is
labelled current. Two things about them surprise people.

**A legend number is a reduction of what was drawn, not of what was stored.** A
maximum printed over a series read with averages is a maximum of those derived
averages at the selected resolution. It is not the largest sample ever taken. On a busy link those are
very different numbers, and both are legitimate answers to different questions.

**Check which series the legend uses.** Plain GPRINT entries can inherit a
preceding plotted item’s series; dedicated minimum, maximum, average and last
items have separate handling. Reordering items in a graph template can therefore
change what the legend reports without anyone editing the legend. If a number
changes after an unrelated template edit, check the item order first.

## When a graph looks wrong

Check the collection path in this order; more than one stage can have a fault.

1. Is the device answering right now?
2. Is the poller running, and finishing inside its interval?
3. Does the RRD file have a recent update time?
4. Is the graph reading the data source you think it is?

Concretely:

**Step 1.** Run the same `snmpget` you ran when you added the device, from the
assigned collector. If it fails, resolve that collection failure before judging
the graph.

**Step 2.** Look for the end-of-run summary. If it is absent, check scheduling,
the configured log destination and early poller failures. A run longer than the
interval can delay updates; compare the resulting update gap with heartbeat.

**Step 3.** Ask RRDtool directly:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` reports the last update timestamp, including updates with unknown values;
buffered writes can delay it. Use `lastupdate` and `fetch` to inspect values as
described in the device guide. `info` tells you the step, the heartbeat,
the data source type, and which archives exist. If the file has no archive of
maxima, that settles the peak question above.

**Step 4.** Turn on graph debug mode and read the command the graph produces. It
names the files, the data sources inside them, and the consolidation function for
each. A graph pointing at a different data source than you assume is common after
templates have been reapplied or interfaces reindexed.

## Symptoms and what they usually mean

| What you see | Usually |
|---|---|
| Flat line at zero | Could be a real zero or an expression replacing unknown with zero |
| Line stops, then resumes | An unknown value interrupted the plotted series; check collection and graph expressions |
| Small gaps throughout | Poller finishing late, or a heartbeat set too close to the step |
| Peak visible at four hours, absent at one week | Check archive resolution and consolidation before assuming data loss or a collection fault |
| Legend maximum lower than the drawn peak | The legend is reducing a different series than you think |
| Whole graph empty, no error | No data source behind it, or nothing collected yet |
| Values an order of magnitude out | Wrong data source type, or 32-bit counters wrapping |
| Two graphs of one link disagree slightly | Different axis base, or different consolidation |

[Troubleshoot missing data](/guides/troubleshoot-missing-data/) takes the same path
in more depth. [Tune graph appearance](/guides/tune-graph-appearance/) covers
changing what a graph looks like once you trust what it says.

That is the tutorial. You have an install, a device that answers, and a graph you
can read. From here, [How-to guides](/guides/monitor-a-switch/) handle specific
jobs, and [Concepts](/concepts/architecture/) explain why the system behaves the
way it does.
