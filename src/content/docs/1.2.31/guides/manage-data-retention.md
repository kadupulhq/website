---
title: Manage data retention
description: Choose how long Kadupul keeps data and at what resolution, size the
  disk for it, and understand why the choice is fixed for the life of each file.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 24
slug: 1.2.31/guides/manage-data-retention
---

:::caution[Not yet possible]
Kadupul has not shipped, so none of this can be done today. The page states the
intent so it can be held to it.
:::

Retention is decided once per file, at creation, and is then fixed. Editing the
profile later changes what the next file looks like and leaves every existing
file exactly as it was. Get this right before you create ten thousand data
sources, because afterwards the only fixes are rebuild or splice.

Read [Data sources and archives](/1.2.31/concepts/data-sources-and-rras/) first if the
terms step, heartbeat, archive and consolidation are not already familiar.

## What a profile holds

A data source profile is the retention policy. One profile, one storage shape.

| Field | Meaning |
|---|---|
| Polling interval (step) | How often a value is expected, in seconds |
| Heartbeat | How long the file waits past the step before recording unknown |
| X-Files Factor | How much of a consolidation window may be unknown before the consolidated value is unknown |
| Consolidation functions | Which of `AVERAGE`, `MIN`, `MAX`, `LAST` are kept |
| Archives | One row per resolution, each with an aggregation level and a row count |
| Default | Whether new data sources pick this profile |

The step defaults to the poller interval. A profile whose step is finer than the
poller interval cannot be filled; the extra rows stay unknown forever.

## What ships

Three profiles come out of the box. All three keep all four consolidation
functions.

| Profile | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

The 5 Minute profile is the default.

Each has four archives. The aggregation level is expressed as a step multiplier,
so the real resolution is the multiplier times the profile step, and the span is
that resolution times the row count.

### 5 Minute Collection

| Archive | Multiplier | Rows | Resolution | Span |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minutes | about 2 days |
| Weekly | 6 | 700 | 30 minutes | about 14 days |
| Monthly | 24 | 775 | 2 hours | about 64 days |
| Yearly | 288 | 797 | 1 day | about 2 years 2 months |

### 1 Minute Collection

| Archive | Multiplier | Rows | Resolution | Span |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minute | about 2 days |
| Weekly | 15 | 1440 | 15 minutes | 15 days |
| Monthly | 60 | 8784 | 1 hour | about 366 days |
| Yearly | 720 | 7305 | 12 hours | about 10 years |

### 30 Second Collection

| Archive | Multiplier | Rows | Resolution | Span |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 seconds | about 1 day |
| Weekly | 30 | 1346 | 15 minutes | about 14 days |
| Monthly | 120 | 1445 | 1 hour | about 60 days |
| Yearly | 480 | 4380 | 4 hours | 2 years |

The names are labels, not behaviour. Nothing enforces that the archive called
"Yearly" holds a year.

## How the profile becomes a file

At creation, the profile is read once and turned into a create command. The step
comes from the profile. Each data source item contributes a definition line
carrying its name, type, heartbeat, minimum and maximum. Each archive
contributes one line per consolidation function, carrying the function, the
X-Files Factor, the multiplier and the row count.

Four archives times four consolidation functions is sixteen archive definitions
in the file. That multiplication is where the disk goes.

If the file already exists, creation stops and does nothing. There is no path
that rewrites an existing file to match a changed profile. That is the whole
reason this page exists.

## Choosing a policy

Three questions, in this order.

**What is the finest question you will ever ask?** That sets the step. A 30
second step answers "what happened during that 90 second blip". A 5 minute step
cannot, ever, for any file created under it. Finer steps cost poller work on
every cycle as well as disk.

**How far back will you ask it?** That sets the daily archive's row count. Most
installs want a couple of days at full resolution and are then happy with
coarser data.

**Which questions survive consolidation?** That sets the consolidation
functions. `AVERAGE` answers what was typical. `MAX` answers how bad it got.
`MIN` answers whether it ever dropped out. `LAST` answers what the final value in
the window was, which matters for readings that are states rather than rates.

Dropping a consolidation function is the most effective way to shrink files,
because it removes a quarter of the rows at every resolution. It is also the
regret people write in later. Keep `MAX` unless you are certain no one will ever
ask about a peak.

## Size the disk

The size of one file follows from the numbers you chose. From the sizing used in
the interface:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

The 284 bytes are the file header. Each data source in the file adds a 300 byte
header of its own. Each stored value is 8 bytes, and total rows is the sum of the
row counts across every archive.

For a single-data-source file with all four consolidation functions:

| Profile | Total rows | Approximate file size |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiply by the number of data sources you expect, not by the number of graphs. A
graph with four lines is usually one file with four data sources, which is
cheaper than four files.

Twenty thousand data sources on the default profile is roughly 1.8 GB. The same
twenty thousand on the 1 Minute profile is roughly 13 GB. That ratio is the real
cost of a finer step, and it is paid in random write I/O every cycle as well as
in bytes. See [High-volume writes](/1.2.31/concepts/high-volume-writes/) before choosing
a fine step at scale.

Both profile and archive editors show a computed size as you change the numbers.
Use them. The arithmetic is easy to get wrong by a factor of four.

## What changing a profile does, and does not do

This is the part that costs people history.

| Change | Effect on new files | Effect on existing files |
|---|---|---|
| Add or remove an archive | Applied | None |
| Change a row count | Applied | None |
| Change an aggregation level | Applied | None |
| Add or remove a consolidation function | Applied | None |
| Change the step | Applied | None |
| Change the heartbeat | Applied | Database updated, file not |
| Delete the profile | Its archives and functions go with it | None |

The heartbeat row deserves a closer look, because it is the one case that is
half-applied. Changing a profile's heartbeat updates the recorded heartbeat for
every data source using that profile, and then warns you that the files
themselves were not touched. The interface and the file now disagree. Correct the
files with the command line heartbeat utility, or with the tuning facility, and
do it in the same maintenance window. A disagreement here is invisible until
someone reads the wrong number out of the database and believes it.

Two more traps sit next to that one.

**Archive rows and levels lock once the profile is in use.** As soon as a real
data source exists on a profile, the row count and aggregation level of its
archives become read-only in the editor. Duplicate the profile and edit the copy.

**Deleting a profile leaves its data sources pointing at nothing.** The profile,
its archives and its function list are removed, and the data sources that
referenced it are not touched. The next time one of those needs a file created,
creation fails with a log line saying the data source has no archives assigned.
Reassign before deleting.

## Moving data sources between profiles

There is a bulk action on data templates to change the profile. It rewrites the
template's recorded profile, step and heartbeat, and it deliberately restricts
itself to template rows. Data sources that already exist are not included.

So the sequence for a real migration is:

1. Build the new profile and check its computed size.
2. Point the data template at it.
3. Accept that everything created from now on uses the new shape.
4. Decide, separately, what to do about the files you already have.

Step four has three honest answers.

**Leave them.** Two shapes coexisting is untidy and harmless. Graphs read
whatever each file holds.

**Rebuild.** Delete and recreate the data source. Fast, and history is gone.

**Splice.** The command line splice utility merges an old file into a new one and
can change resolution while doing it, provided the new file already has the
correct step. It has a dry run mode. Use it, on a copy, before you use it on
anything you care about.

There is no fourth option. Nothing in the system converts a file in place.

## External profiles

A data source can be set to an external profile, which records a step of zero.
That says the file is managed outside the normal path, and the data source list
shows it as external rather than quoting an interval. Use it for files another
process writes. Do not use it to mean "no policy", because the retention is still
whatever the file was built with; it just is not described anywhere you can see.

## Failure modes

| Symptom | Usual cause |
|---|---|
| A profile edit appears to do nothing | Expected. Existing files keep the shape they were created with |
| Row count and aggregation level cannot be edited | The profile is in use by at least one data source. Duplicate it |
| The interface shows one heartbeat, the file behaves as another | The profile heartbeat changed and the files were never tuned |
| New data sources fail to create, log says no archives assigned | The profile was deleted while data sources still referenced it |
| The finest archive is full of unknowns | The profile step is finer than the poller interval |
| A week of graphs has gaps every few hours | Heartbeat too close to the step for a poller that runs late |
| Peaks visible yesterday are gone in the month view | Only `AVERAGE` is kept, or the `MAX` archive was dropped to save space |
| Disk grew four times faster than estimated | The estimate counted archives but not consolidation functions |
| A new archive was rejected as too coarse or too fine | The first archive must be at the profile step, and each additional one must be coarser than every existing one |
