---
title: Read your first graph
description: What the lines actually mean, and the three mistakes that make
  people misread them.
sidebar:
  order: 4
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/start/first-graph
---

A graph here is not a picture of your data. It is a picture of a summary of your
data, and knowing which summary matters.

## What you are looking at

Every graph is drawn from a round-robin archive. The archive stores recent samples
at full resolution and older samples consolidated into coarser buckets. When you
zoom out to a year, you are not seeing every five-minute sample. You are seeing one
value per bucket, chosen by a consolidation function.

That function is usually the average. It can also be the maximum or the minimum.
This matters more than anything else on the page.

## The three mistakes

**Reading an average as a peak.** A link that sat at 100 percent for four minutes
out of every hour shows as a modest average. The traffic was still saturated. If
you care about saturation, look at a graph built on the maximum, not the average.

**Reading a gap as a zero.** A gap means no data arrived. It does not mean the value
was zero. Kadupul records unknown as unknown precisely so the two stay distinguishable.
A line that drops to the axis and a line that stops are different events.

**Comparing two graphs with different vertical scales.** Two graphs side by side will
each scale to their own data. A small bump and a large one can look identical.
Check the axis before concluding anything.

## Reading the legend

The legend carries the numbers that matter more than the shape does. Current is the
most recent sample. Average and maximum are computed across the window you are
viewing, not across all time, so they change as you zoom.

## When a graph looks wrong

Work backwards in this order, because each step rules out everything below it.

1. Is the device answering right now?
2. Is the poller running, and finishing inside its interval?
3. Does the RRD file have a recent update time?
4. Is the graph reading the data source you think it is?

Most reports of a broken graph stop at step two.
