---
title: Manage data retention
description: Choose retention and resolution, estimate storage, and plan changes to existing RRD files.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 24
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Retention is configured at file creation and stays unchanged during normal updates. Editing the
profile later changes what the next file looks like and leaves every existing
file exactly as it was. Get this right before you create ten thousand data
sources, because later changes require explicit file maintenance or migration.

Read [Data sources and archives](/concepts/data-sources-and-rras/) first if the
terms step, heartbeat, archive and consolidation are not already familiar.

## What a profile holds

A data source profile is the retention policy. One profile, one storage shape.

| Field | Meaning |
|---|---|
| Polling interval (step) | How often a value is expected, in seconds |
| Heartbeat | Maximum permitted interval between updates before the input is treated as unknown |
| X-Files Factor | How much of a consolidation window may be unknown before the consolidated value is unknown |
| Consolidation functions | Which of `AVERAGE`, `MIN`, `MAX`, `LAST` are kept |
| Archives | One row per resolution, each with an aggregation level and a row count |
| Default | Whether new data sources pick this profile |

The step defaults to the poller interval. A profile whose step is finer than the
polling interval cannot recover detail that was never sampled. Whether its rows
are unknown depends on heartbeat and RRDtool normalization.

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

At creation, the profile's archives and consolidation functions are read and
turned into a create command. The step comes from the data source's stored
`rrd_step`, normally populated from its profile. Each included data source item contributes a definition line
carrying its name, type, heartbeat, minimum and maximum. Each archive
contributes one line per consolidation function, carrying the function, the
X-Files Factor, the multiplier and the row count.

Four archives times four consolidation functions is sixteen archive definitions
in the file. That multiplication is where the disk goes.

If the file already exists, the normal create path stops without rewriting it.
Profile edits do not migrate files automatically. Explicit maintenance tools are
a separate operation, described below.

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

Dropping one of four consolidation functions reduces the stored-value payload of
new files by a quarter at every resolution. It is also the
regret people write in later. Keep `MAX` unless you are certain no one will ever
ask about a peak.

## Size the disk

The size of one file follows from the numbers you chose. From the sizing used in
the interface:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

The interface uses 284 and 300 bytes as fixed overhead estimates. Treat this as
a sizing approximation, not an exact description of every RRDtool file format.
Each stored value is 8 bytes, and total rows is the sum of the row counts across
the profile's archive definitions before multiplying by consolidation functions.
Measure representative files with the installed RRDtool before sizing storage.

For a single-data-source file with all four consolidation functions:

| Profile | Total rows | Approximate file size |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiply by the number of data sources you expect, not by the number of graphs. A
graph can combine fields from one file or several files. Count the actual RRD
files and the data source items inside each.

Twenty thousand data sources on the default profile is roughly 1.8 GB. The same
twenty thousand on the 1 Minute profile is roughly 13 GB. This ratio reflects
both resolution and the profiles' different retention spans, not the step alone.
Finer collection also increases write frequency. See [High-volume writes](/concepts/high-volume-writes/) before choosing
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
| Change the step | New data sources inherit it; creation uses their stored step | No automatic file migration |
| Change the heartbeat | Creation uses stored data-source item metadata; see save bugs below | No automatic file tuning |
| Delete the profile | Removes the definitions needed for subsequent creation | Existing file remains, but dangling database references can break later creation |

**Avoid changing the heartbeat through an in-use profile's edit form for now.**
Two bugs affect this path:

- The form disables step, but the save handler only stores the profile heartbeat
  when step is submitted. A tested save of 900 left the profile at 600 while
  changing the local data-source metadata to 900. Tracked in
  [#232](https://github.com/kadupulhq/kadupul/issues/232).
- If a template also references the profile, the propagation query can update
  unrelated templates through their shared `local_data_id=0`. In the same test,
  another template's heartbeat changed from 1200 to 900. Tracked in
  [#233](https://github.com/kadupulhq/kadupul/issues/233).

Neither change tuned the existing RRD file. Back up metadata as well as files,
and compare the profile, template items, local data-source items and actual
`rrdtool info` output after heartbeat maintenance.

The main collector's `cli/update_heartbeat.php` utility can tune existing files
and update metadata. Start with `--help`, `--list-heartbeats`,
`--list-data-templates` and `--list-profiles`. The new heartbeat must be supported
and at least twice the configured poller interval. Use `--data-template-id` to
limit selection; the utility has no dry-run option.

Without `--force`, the selected profiles must already have the requested
heartbeat. With `--force`, shared profile values also change, so inventory all
their users before proceeding. `--prev-heartbeat` filters database values, not
the heartbeat read from each RRD: after a partial web save, selecting the old
file value can match nothing. Verify the selection and inspect the resulting
files. The isolated test successfully tuned its existing file from 600 to 900
after its profile metadata was aligned.

Two more traps sit next to that one.

**The editor restricts structural changes once a profile is in use.** As soon as
a real data source exists on a profile, step, X-Files Factor, consolidation
functions, archive row counts and aggregation levels become read-only in the
editor; archive add/delete controls are also hidden. Duplicate the profile and
edit the copy. These interface restrictions do not constitute server-side
validation of submitted requests.

**Keep profiles while anything references them.** The list disables selection
when a template or local data source uses a profile. However, the server's bulk
delete handler currently accepts a submitted in-use ID and removes its archives
and functions without reassigning those references. Existing files survive, but
subsequent creation fails because no archives are assigned. Do not bypass the
disabled control; inventory and reassign references before deleting. Tracked in
[#234](https://github.com/kadupulhq/kadupul/issues/234).

## Moving data sources between profiles

There is a bulk action on data templates to change the profile. It rewrites the
template's recorded profile, step and heartbeat, and it deliberately restricts
itself to template rows. Data sources that already exist are not included.

So the sequence for a real migration is:

1. Build the new profile and check its computed size.
2. Point the data template at it.
3. Accept that everything created from now on uses the new shape.
4. Decide, separately, what to do about the files you already have.

Step four has several options, depending on the change and installed RRDtool version.

**Leave them.** Different retention shapes can coexist. Keep each existing data
source's polling metadata consistent with its file; changing a database profile
reference alone does not migrate its step, fields or archives.

**Rebuild.** Delete and recreate the data source. Fast, and history is gone.

**Splice.** The command line splice utility merges an old file into a new one and
can change resolution while doing it, provided the new file already has the
correct step. It has a dry run mode. Use it, on a copy, before you use it on
anything you care about.

**RRDtool maintenance.** Depending on the installed version and desired change,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) or
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) can alter an
existing file while preserving retained data. Stop competing writers, keep a
backup and verify the result on a copy. These operations do not recreate detail
already discarded by consolidation.

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
| The finest archive is full of unknowns | Check missing updates, heartbeat and consolidation rules |
| A week of graphs has gaps every few hours | Heartbeat too close to the step for a poller that runs late |
| Peaks visible yesterday are gone in the month view | Only `AVERAGE` is kept, or the `MAX` archive was dropped to save space |
| Disk grew four times faster than estimated | The estimate counted archives but not consolidation functions |
| A desired resolution is absent from the new-archive dropdown | The editor offers a finest archive at the profile step, then only choices coarser than existing archives |
