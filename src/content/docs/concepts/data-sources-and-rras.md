---
title: Data sources and round-robin archives
description: What actually gets stored, and why the decisions you make at creation time are permanent.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

A data source is one thing being measured over time. Bytes in on port 3. Load
average on a server. Each data source maps to one RRD file.

## The decisions that are permanent

An RRD file is allocated at creation. Its structure cannot be changed afterwards
without rebuilding the file and losing history. Three choices are fixed at that
moment.

**The step.** How often a value is expected, usually 300 seconds. Feed it more often
and the extra samples are discarded. Feed it less often and gaps appear.

**The data source type.** `GAUGE` stores the value as given, for things like
temperature. `COUNTER` stores the rate of change, for things that only ever increase,
like interface byte counts, and handles the wrap when the counter rolls over.
`DERIVE` is a counter that may go down. Choosing `GAUGE` for a counter produces
graphs that are wrong in a way that looks plausible, which is the worst kind of wrong.

**The archives.** How many samples to keep at which resolutions, and which
consolidation function to use for each. This is what decides whether you can answer
a question in two years.

## The heartbeat

The heartbeat is how long the archive will wait past the expected step before it
gives up and records unknown. At twice the step, one missed poll is tolerated and
interpolated, and two missed polls become a gap.

This is why a poller that consistently runs slightly late produces a graph full of
small gaps. The data arrived, just past the heartbeat.

## Consolidation

When samples are older than the finest archive, they are consolidated into coarser
buckets. The function that does it is chosen per archive, and each function answers
a different question.

- `AVERAGE` answers "what was typical".
- `MAX` answers "how bad did it get".
- `MIN` answers "did it ever drop out".

If you only keep averages, you cannot later ask about peaks. The peaks were never
written down. This is the single most common regret in a long-lived installation,
and it cannot be fixed retroactively.

## Unknown is a real value

An RRD distinguishes zero from unknown, and so should you. Zero means the device
said zero. Unknown means nothing arrived. Collapsing the two makes an outage look
like idleness.
