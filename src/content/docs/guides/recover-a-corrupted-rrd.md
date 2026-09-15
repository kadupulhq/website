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

:::danger[Repairs overwrite in place]
The restore path described below replaces the target file. `rrdtool tune` on a
maximum, `rrdtool resize` when shrinking, and deleting an archive from a dump all
discard data permanently. **Copy the file before every repair on this page.** There is
no undo and no version history in an RRD.
:::

## 1. Name the failure

| What you see | Usually means | Go to |
|---|---|---|
| Graph draws an error instead of a picture | The file is missing, unreadable, or the directory is not writable | Step 2 |
| Graph is empty but no error | No value has ever been written | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| Graph stops at a fixed moment and never resumes | Poller, permissions, or heartbeat | Step 3 |
| Graph has data but the shape changed without a config change | The file and the database disagree | Step 4 |
| Values are present and all unknown | Collection failure, not corruption | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| `rrdtool` refuses to read the file at all | Real corruption | Step 5 |

Kadupul turns the first case into a readable message rather than a broken image,
distinguishing a directory it cannot write from a file it cannot write, and reporting an
absent file as the poller not having run yet. That last one is accurate: the file is
created on the first successful write.

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
count and resolution. If this command errors, you have real corruption: go to step 5.
If it succeeds, the file is readable and your problem is one of the other kinds.

## 3. Check the mechanical causes first

| Check | Why it comes before repair |
|---|---|
| File ownership and mode | A file created by root during maintenance is unwritable by the poller from that moment on |
| Directory ownership and mode | The poller cannot create a replacement file in a directory it cannot write |
| Free space and inodes | A full filesystem produces short writes that look like damage |
| Whether a second writer exists | Two collectors writing one file produce skipped updates and a clean log |

Run every maintenance command as the poller user. Most permanent damage on this page
starts with a repair run as root that left a file the poller could no longer touch.

## 4. Read what the checker already found

Kadupul can walk every archive on a schedule and record what it finds. It is off by
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
| The RRDfile Minimal Heart... is lower than polling interval | The heartbeat cannot tolerate one late poll, so gaps are guaranteed |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | The file disagrees with the profile |
| Stale values for last 24 hours, or last hour | Every sample read back in that window was unknown |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Partial collection failure |
| No data returned, maybe corrupted Data Source | A fetch against the file returned nothing at all |

The check corrects the database's recorded step and heartbeat to match the profile as
it goes, which resolves drift between the profile and the data source rows but does not
touch the file. Count mismatches between file and database are reported rather than
repaired, because either side could be the wrong one.

## 5. Dump, edit, restore

This is the repair path for anything structural. RRDtool can serialise a file to XML
and rebuild a file from that XML, and every change Kadupul makes to an existing file's
shape goes through that pair: adding a data source, deleting an archive, and cloning an
archive under a different consolidation function.

By hand:

```bash
cp  /path/to/rra/42/1337.rrd /var/tmp/1337.rrd.bak
rrdtool dump /path/to/rra/42/1337.rrd > /var/tmp/1337.xml
# edit /var/tmp/1337.xml
rrdtool restore -f /var/tmp/1337.xml /path/to/rra/42/1337.rrd
```

`-f` overwrites without asking. That is the flag Kadupul's own helpers pass, and why
the backup on the first line is not optional. The XML holds every stored value as text,
so it is far larger than the file; Kadupul's in-place helpers write it beside the RRD
and delete it afterwards, which means the archive directory needs the room and has to be
writable by whoever runs the repair. And a dump that fails is itself the diagnosis: if
`rrdtool dump` cannot parse the file, the header or the data blocks are damaged and
editing cannot help.

## 6. What survives, and what does not

| Damage | History recoverable |
|---|---|
| File unwritable, otherwise intact | Yes, entirely. Fix ownership and the next poll resumes |
| Heartbeat, minimum or maximum wrong | Yes. `rrdtool tune` changes the header without touching stored values |
| Step wrong | No, not in place. The file must be rebuilt, and old samples can be spliced in |
| Data source missing from the file | The existing fields keep their history. The new field starts empty |
| Archive deleted or never created | No. A resolution that was never stored cannot be reconstructed |
| Archive rows reduced by a shrinking resize | No. The dropped rows are gone at the moment the command runs |
| Truncated file, dump fails | No. Restore from backup |
| Header intact, tail truncated | Sometimes. A dump may still yield usable XML for what survived |

The third row catches people. An RRD's step and archive layout are fixed at creation, so
changing the poller interval, or moving a data source to a different retention profile,
does not reshape files that already exist. See
[Data sources and archives](/concepts/data-sources-and-rras/) and
[Manage data retention](/guides/manage-data-retention/). Raising a maximum with `tune`
is safe; lowering one records every later value above the new ceiling as unknown.

## 7. Rebuild while keeping what can be kept

When the file has to be recreated, you do not have to lose the history. Kadupul ships a
splice utility that merges an old file into a new one.

```bash
php cli/splice_rrd.php --oldrrd=/var/tmp/1337.rrd.bak \
                       --newrrd=/path/to/rra/42/1337.rrd \
                       --finrrd=/var/tmp/1337.merged.rrd --dryrun
```

Both input files must already exist. The new file supplies the structure, which makes
this the supported way to change a file's step: create a file with the step you want,
let the poller write to it, then splice the old one in behind it. Without `--finrrd` the
result is written beside the new file with a timestamp appended. `--owner` sets
ownership and needs root. `--dryrun` does the whole merge and writes nothing.

:::caution[The splice treats zero as a hole]
The merge walks the new file and, for every slot holding unknown **or zero**, looks for
the nearest matching value in the old file and writes that instead. A genuine zero in
the new file is therefore replaced by old data. On anything that legitimately reads zero
for long stretches, an idle port, a queue that empties, a counter at rest, inspect the
result before you put it in place.
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
| Repair succeeded, graph still empty | The repair ran as root and the poller can no longer write the file |
| `rrdtool dump` errors on the file | Real corruption. Restore from backup |
| Tune applied, nothing changed | Only one of the file and the database moved. Both have to |
| Narrow gaps everywhere after an interval change | The files still carry the old step and heartbeat |
| Spliced file has old data where the new file read zero | Expected. The splice fills zeros as well as unknowns |
| Checker list grows and never shrinks | Findings are recorded until purged; fixing the cause does not clear them |

Back up the archive directory and the database together, on one schedule, and test the
restore. A working backup turns every row of the step 6 table into "yes". See
[Back up and restore](/guides/back-up-and-restore/).
