---
title: Recover a corrupted RRD
description: How to tell a damaged round-robin archive from a misconfigured one, how to inspect a file, how dump and restore repairs it, and what history you can keep when the file has to be rebuilt.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 25
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Genuine file corruption is rare. Most files reported as corrupt are intact and
disagree with the database, or cannot be written by the poller, or stopped receiving
values for a reason that has nothing to do with the file. Work out which of those you
have before you touch anything, because the repair for one makes the others worse.

:::danger[Preserve the original]
**Copy the file before every repair on this page.** Restore into a separate candidate
and inspect it before replacing the live file. Shrinking an archive or deleting one
discards retained history. Changing a maximum affects later input validation; it does
not retroactively erase stored samples. There is no automatic undo in an RRD.
:::

## 1. Name the failure

| What you see | Usually means | Go to |
|---|---|---|
| Graph draws an error instead of a picture | The file is missing, unreadable, or the directory is not writable | Step 2 |
| Graph is empty but no error | No usable values in the selected range, or a graph definition problem | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| Graph stops at a fixed moment and never resumes | Poller, permissions, or heartbeat | Step 3 |
| Graph has data but the shape changed without a config change | The file and the database disagree | Step 4 |
| Retained values are all unknown | Collection, timing, limits or data source configuration need checking | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| `rrdtool` refuses to read the file | Missing path, access failure, incompatible format or damage | Steps 2 and 3, then 5 |

Kadupul turns the first case into a readable message rather than a broken image,
distinguishing a directory it cannot write from a file it cannot write, and reporting an
absent file as the poller possibly not having run yet. That message is a hint, not a
diagnosis: deletion, a changed path or an incomplete restore can also leave it missing.

## 2. Inspect the file

Two views are available on the data source's own page, both switched on per session.
The debug view prints the `rrdtool create` command Kadupul would issue for this data
source today. The info view is the one that matters here: it reads the file with
`rrdtool info`, reads the data source definition from the database, and prints the
differences. Where a difference can be reconciled without rebuilding, it prints the
`rrdtool tune` or `rrdtool resize` command that would do it, as text for you to run
rather than running it.

From a shell, the same first step:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

The header gives the step, the last update time, every data source name with its type,
heartbeat, minimum and maximum, and every archive with its consolidation function, row
count and resolution. If this command errors, retain the error and check the path,
permissions and RRDtool compatibility before diagnosing corruption. A successful
`info` reads metadata; also inspect `fetch` output and test a dump to check the history.

## 3. Check the mechanical causes first

| Check | Why it comes before repair |
|---|---|
| File ownership and mode | A file created by root during maintenance is unwritable by the poller from that moment on |
| Directory ownership and mode | The poller cannot create a replacement file in a directory it cannot write |
| Free space and inodes | A full filesystem produces short writes that look like damage |
| Whether a second writer exists | Concurrent or out-of-order updates can fail or invalidate a maintenance snapshot; inspect the logs |

Run maintenance as the account that owns and updates the RRD, and preserve its mode,
owner and group. Stop all writers before copying or replacing files, including remote
collectors, scheduled jobs and manual maintenance. Drain pending writes only after
their producers stop. Plain shell commands do not acquire Kadupul's storage locks.
See [storage requirements](/reference/requirements/) and the quiescing procedure in
[Back up and restore](/guides/back-up-and-restore/).

## 4. Read what the checker already found

Kadupul can check graph-linked data sources on enabled devices on a schedule and
record what it finds; this is not an inventory of every file on disk. It is off by
default. The interface says where to switch it on: Configuration -> Settings -> Data.

| Setting | Default | Effect |
|---|---|---|
| Enable RRDfile Check | off | Nothing is checked until this is set |
| Check Frequency | 4 hours | Also offers 1 hour, 24 hours, or running after each boost cycle |
| Number of RRDfile Check Processes | 1 process | Splits the file list across parallel workers |
| RRDChecker Timeout | 1 hour | The run is killed past this |

Findings accumulate in a list with the device, the data source, the internal data
source id, the message, and the date. You can filter by age and search the text, and
you can purge the list once you have acted on it.

The messages it can record, and what each one means:

| Message | Meaning |
|---|---|
| RRDfile does not exist | The file was never created, was moved or deleted, or the configured path changed |
| RRDfile is not writable | The poller user cannot write the file |
| RRDfile modify time older than hour | Nothing has been written for at least an hour |
| Last update value in RRDfile is older than 1 hour | The file's own last update stamp is stale, which is stronger evidence than the modify time |
| The RRDfile step does not match the Data Source Profile step | The file was created under a different interval |
| There are more, or less, Data Sources in the database than in the RRDfile | The template gained or lost fields after the file was created |
| The Data Source '...' exists in RRDfile, but not in database | Names the field, from the file's side |
| Data Source name '...' exists in the Database, but not in RRDfile | Names the field the poller is writing that has no home in the file |
| The RRDfile Minimal Heart... is lower than polling interval | The checker flags heartbeat less than or equal to the polling interval; late samples may become unknown |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | The file's heartbeat is below the profile heartbeat; this check does not flag a larger one |
| Stale values for last 24 hours, or last hour | Every sample read back in that window was unknown |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Partial collection failure |
| No data returned, maybe corrupted Data Source | A fetch against the file returned nothing at all |

The check corrects the database's recorded step and heartbeat to match the profile as
it goes, which resolves drift between the profile and the data source rows but does not
touch the file. Count mismatches between file and database are reported rather than
repaired, because either side could be the wrong one.

## 5. Dump, edit, restore

RRDtool can serialise a readable file to XML and rebuild a candidate from it.
This can help with a known structural mismatch, but does not reconstruct lost samples
or guarantee that a damaged file can be parsed. Kadupul also uses dump/restore helpers
for structural changes. The local restore helper builds a temporary sibling and
renames it over the destination after success; this does not provide a backup.

With writers stopped, run this as the RRD owner. Replace the example path with the
actual data source path. The private work directory is created beside the source so
the candidate is on the same filesystem:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Choose a fetch range and consolidation function that contain known retained data;
the last hour is only an example. Compare source and candidate data source names,
step, archives, last-update timestamp and sample values. An unchanged dump/restore
can alter binary layout, so compare values rather than requiring identical file hashes.

Keep the original copy. Only after validation, restore the candidate's required mode,
owner and group and rename it to the live path while writers remain stopped. Verify
that the poller account can read and update it before resuming collection. This example
stops before installation so a readable but incorrect candidate is not installed.

The XML and candidate require additional disk space. A failed dump can leave partial
XML; do not restore it. Check access, free space and the reported error. If the original
cannot be dumped after those checks, restore a known-good backup instead. RRDtool's
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) allows overwriting
the destination; the staged example deliberately uses a new destination.

## 6. What survives, and what does not

| Damage | History recoverable |
|---|---|
| File unwritable, otherwise intact | Retained history survives. Missed updates are not recovered merely by fixing access |
| Heartbeat, minimum or maximum wrong | Yes. `rrdtool tune` changes the header without touching stored values |
| Step wrong | Requires an explicit, validated conversion; changing the database profile alone does not convert the file |
| Data source missing from the file | The existing fields keep their history. The new field starts empty |
| Archive deleted or never created | No. A resolution that was never stored cannot be reconstructed |
| Archive rows reduced by a shrinking resize | No. The dropped rows are gone at the moment the command runs |
| Truncated file, dump fails | No. Restore from backup |
| Header intact, tail truncated | Do not assume an apparently readable header means a complete dump; use a verified backup if dumping fails |

Changing the poller interval or moving a data source to another retention profile
does not automatically reshape existing files. RRDtool also exposes structural
[`tune` operations](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), including a
step option; validate conversion behavior for your installed version and archive
layout instead of assuming a lossless interval change. See
[Data sources and archives](/concepts/data-sources-and-rras/) and
[Manage data retention](/guides/manage-data-retention/). Raising a maximum with `tune`
is safe; lowering one records every later value above the new ceiling as unknown.

## 7. Rebuild while keeping what can be kept

Kadupul ships a splice utility that can populate a new file from an older readable
one. Treat its result as a candidate: it can fill gaps and replace legitimate zeros,
so it is not a lossless copy of measured history. Run from the application root on
the main data collector, using isolated copies in trusted writable directories.

Create `new.rrd` with the intended structure inside the private `$work` directory
from step 5, then preview the merge:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Both input files must already exist and pass the utility's writability checks.
The new file supplies the structure. Without `--finrrd`, the output is the new file's
path plus `.new`; use a fresh explicit output path to avoid replacing an earlier
candidate. `--dryrun` parses and merges using temporary XML and, when available,
SQLite storage, but skips the final RRD restore. It does not prove that the final
restore will succeed. Remove `--dryrun` to produce the separate candidate.
Avoid `--owner` during previews and run as the required service account; check the
output's actual ownership before installation.

:::caution[The splice treats zero as a hole]
The merge walks the new file and, for every slot holding unknown **or zero**, looks for
the nearest matching value in the old file and writes that instead. A genuine zero in
the new file is therefore replaced by old data. On anything that legitimately reads zero
for long stretches, an idle port, a queue that empties, a counter at rest, inspect the
result before you put it in place. The old file's unknowns are also filled using
preceding values, so the merged output can invent continuity across missing data.
:::

After splicing, put the file where the data source expects it, with the ownership the
poller needs, and check that the graph draws.

## 8. Filling gaps, and why to think twice

| Utility | What it writes |
|---|---|
| `cli/batchgapfix.php` | Fills a date range across many devices in parallel, using either the last known value or an average |
| `cli/float_rrdfiles.php` | Floats a range in selected graphs through the same dump and restore path |

Both invent measurements. Nothing was collected at those timestamps, and afterwards
nothing in the file separates the invented values from the real ones. Use them when you
know the gap was not an outage: a poller stopped for maintenance, a migration window.
Never on anything feeding a capacity or billing calculation. The same caution applies to
[removing spikes](/guides/remove-spikes-from-data/).

## 9. Automated debugging of one data source

For one data source behaving oddly, Kadupul can run a debug check across the next few
polling cycles and report a verdict: whether the file exists, whether it and its
directory are writable, which account owns it against which account the poller runs as,
whether the data source is active, whether the file matches the data source definition,
whether the last update moved after a poll, and whether the values were usable. Its
repair action is narrow. It runs the `rrdtool tune` recommendations the comparison
produced and nothing else, declining and logging why when the list is empty or the file
is unwritable. It does not recreate files, add data sources, or change archives.

## 10. Deletion is a separate hazard

Kadupul tracks archive files whose data source no longer exists and offers to remove
them. It can also be set to act automatically when a data source is deleted, with two
methods: delete, or move to an archive directory.

:::danger[Delete is permanent]
The delete method removes the file from disk. There is no recycle step and the data is
not in the database. If you are not certain every listed file is genuinely orphaned,
set the method to archive, which moves files into a directory you nominate, and sweep
that directory by hand later.
:::

A file can look orphaned without being orphaned. A data source moved to a new path, a
partly finished restore, or a device rebuilt under a new id all leave files nothing
points at. Check the list against your own record of what changed first.

## Failure modes

| Symptom | Cause |
|---|---|
| Repair succeeded, graph still empty | Check access, selected time range, data collection and graph definition |
| `rrdtool dump` errors on the file | Check the path, access, storage and format before concluding it is damaged |
| Tune applied, nothing changed | Header changes do not retroactively fill historical unknown samples; verify both file and database definitions |
| Narrow gaps everywhere after an interval change | The files still carry the old step and heartbeat |
| Spliced file has old data where the new file read zero | Expected. The splice fills zeros as well as unknowns |
| Checker list grows and never shrinks | Findings are recorded until purged; fixing the cause does not clear them |

Back up the archive directory and the database together, on one schedule, and test the
restore. Recovery is limited to what that backup retained at its capture time. See
[Back up and restore](/guides/back-up-and-restore/).
