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

Nothing is drawn in advance. When you ask for the image, Kadupul assembles an
RRDtool command from the graph's configuration and runs it against the files on
disk. Three kinds of line go into that command and it helps to know which is which.

| Part | What it does |
|---|---|
| A definition | Names a file, a data source inside it, and a consolidation function |
| A drawing item | Turns one series into a line, an area, or a band in a stack |
| A legend item | Prints one number, computed over the window you are viewing |

The whole assembly is described in [How graphs are
drawn](/concepts/how-graphs-are-drawn/). You do not need it today. You need to know
that the image is computed fresh each time, which is why the same data can produce
two different pictures.

## Start with the last four hours

Look at a short window first. At four hours you are reading the finest archive, one
point per stored sample, with no consolidation in the way. That is the closest
thing to raw data you will get, and it is the window where a problem you already
know about should be plainly visible.

Two features of a fresh graph are normal and alarm people anyway.

**The line ends slightly before now.** The current interval has not finished, so its
bucket is not complete and is not drawn. A graph that ends five minutes ago on a
five minute interval is healthy.

**The first stretch may be missing.** A data source created an hour ago has an hour
of data and eleven months of nothing. The archive is allocated in full at creation,
so the empty part is real storage waiting to be used.

## Then widen it, and watch the peak change

Now ask for a week of the same data. On a busy link, the peak you saw at four hours
will be lower, or gone.

Nothing was lost and nothing is broken. The week graph reads a coarser archive,
where your peak was averaged together with its quiet neighbours. A link that sat at
100 percent for four minutes out of every hour is a run of twelve five-minute
samples, one of which is near the top. Averaged into an hourly bucket, that hour
reads as roughly a tenth of capacity. The traffic was still saturated.

This is the first of the three mistakes, and the one that costs the most arguments.

**Reading an average as a peak.** If you care about saturation, look at a graph
built on the maximum, not the average. That only works if the archives hold maxima.
If the data source profile kept averages only, the peaks were never written down
and no graph can recover them.

There is a quiet failure here worth knowing. If a graph item asks for maxima and
the file does not have them, the nearest available function is used instead and
nothing says so. The picture looks fine. It is answering a different question.

**Reading a gap as a zero.** A gap means no data arrived. It does not mean the value
was zero. Kadupul records unknown as unknown precisely so the two stay
distinguishable. A line that drops to the axis and a line that stops are different
events: the first is a device reporting no traffic, the second is a device that did
not report.

A gap appears when nothing arrives within the heartbeat, which is the grace period
past the expected step. So the size of a gap tells you something. One missing
sample on a tolerant profile is interpolated and you never see it. A graph stippled
with small gaps usually means the poller is finishing late, not that the network is
flapping. [Time and intervals](/concepts/time-and-intervals/) covers the arithmetic.

Beware of stacked graphs here. A stack has to convert unknown into something
drawable or the whole band above it collapses, so many templates substitute zero.
On those graphs an outage and an idle period look the same by design. Check an
unstacked view before concluding a service went quiet.

**Comparing two graphs with different vertical scales.** Two graphs side by side will
each scale to their own data. A small bump and a large one can look identical.
Check the axis before concluding anything.

While you are looking at the axis, check its base. A graph can label in thousands
or in units of 1024. The stored numbers are identical; only the labels move. Two
graphs of the same interface that disagree by about seven percent usually disagree
about this and nothing else.

## Reading the legend

The legend carries the numbers that matter more than the shape does. Current is the
most recent sample. Average and maximum are computed across the window you are
viewing, not across all time, so they change as you zoom.

The shipped legend entries are minimum, maximum, average, and last, which is
labelled current. Two things about them surprise people.

**A legend number is a reduction of what was drawn, not of what was stored.** A
maximum printed over a series read with averages is the largest five-minute average
in the window. It is not the largest sample ever taken. On a busy link those are
very different numbers, and both are legitimate answers to different questions.

**A plain legend entry inherits the consolidation function of the item above it.**
It has no archive of its own. Reordering items in a graph template can therefore
change what the legend reports without anyone editing the legend. If a number
changes after an unrelated template edit, check the item order first.

## When a graph looks wrong

Work backwards in this order, because each step rules out everything below it.

1. Is the device answering right now?
2. Is the poller running, and finishing inside its interval?
3. Does the RRD file have a recent update time?
4. Is the graph reading the data source you think it is?

Most reports of a broken graph stop at step two.

Concretely:

**Step 1.** Run the same `snmpget` you ran when you added the device, from the
machine Kadupul runs on. If it fails, this is not a graph problem.

**Step 2.** Read the log for the end-of-run summary. A run that is not there did not
happen. A run that took longer than the interval explains gaps by itself.

**Step 3.** Ask RRDtool directly:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` tells you whether data is arriving. `info` tells you the step, the heartbeat,
the data source type, and which archives exist. If the file has no archive of
maxima, that settles the peak question above.

**Step 4.** Turn on graph debug mode and read the command the graph produces. It
names the files, the data sources inside them, and the consolidation function for
each. A graph pointing at a different data source than you assume is common after
templates have been reapplied or interfaces reindexed.

## Symptoms and what they usually mean

| What you see | Usually |
|---|---|
| Flat line at zero | The device is answering and reporting zero. Not a failure |
| Line stops, then resumes | Collection stopped. Check the poller before the device |
| Small gaps throughout | Poller finishing late, or a heartbeat set too close to the step |
| Peak visible at four hours, absent at one week | Consolidation. Working as designed |
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
