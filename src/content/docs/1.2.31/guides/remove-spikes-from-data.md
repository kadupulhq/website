---
title: Remove spikes from data
description: How to take a false peak out of an archive so the rest of the graph
  is readable again, and why that edit cannot be undone.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 19
slug: 1.2.31/guides/remove-spikes-from-data
---

:::caution[Nothing to edit yet]
Kadupul has not shipped, so there is no archive to correct. This page records the
intended behaviour of the spike removal tool, inherited from Cacti 1.2.x.
:::

:::danger[This rewrites history and there is no undo]
Spike removal dumps the archive, edits the values, and restores the result over
the original file. The samples it replaces are gone. Run it with `--dryrun`
first, every time, and make sure the backup directory is set and writable.
:::

A spike here means one or two samples so much larger than everything around them
that the vertical axis scales to them and the rest of the graph flattens into the
baseline. The measurement is wrong, and it is also loud.

## Where they come from

Most spikes on a counter-based data source are arithmetic, not measurement.
A counter data source stores a rate computed from the difference between two
readings. Anything that makes the second reading much larger than the first,
relative to the time between them, produces a rate that never happened. A device
reboot that resets the counter, a counter that wraps, an interface re-index that
moves a value onto a different data source, a delayed sample that lands with a
short interval: all of them show up the same way.

See [Data sources and RRAs](/1.2.31/concepts/data-sources-and-rras/) for how the rate is
derived.

Fix the cause where you can. Removing the spike is cosmetic; it does not stop the
next one.

## The four methods

The tool works on the whole file: it dumps every archive in the RRD file, decides
which values to replace, and restores the result.

| Method | What it selects | Needs a window |
|---|---|---|
| `stddev` | Values more than N standard deviations from the mean | No |
| `variance` | Values more than N percent above the mean after outliers are dropped | No |
| `float` | Everything inside a stated time window | Yes |
| `fill` | Gaps inside a stated time window | Yes |

`stddev` and `variance` hunt. `float` and `fill` do what you tell them inside a
range you name, and both fail immediately if you do not give a start and an end.

The variance method drops the top and bottom N samples before computing the
average it compares against, where N is the outliers setting. That is what stops
the spike from inflating the threshold meant to catch it.

Whatever is selected gets replaced, and there are three replacements.

| Replacement | Result |
|---|---|
| `last` | The last known good value. The default. |
| `avg` | The data source average. |
| `nan` | Unknown. The graph shows a gap. |

`nan` is the honest one. It says a value was there and it was wrong. `last` and
`avg` both invent a number that reads as real to anyone looking at the graph
later. Pick `nan` unless you have a reason not to.

## Preview, then commit

```sh
# see what would be changed, touch nothing
php cli/removespikes.php --rrdfile=/path/to/file.rrd --method=stddev --dryrun

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=float --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

# commit
php cli/removespikes.php --rrdfile=/path/to/file.rrd --method=stddev --avgnan=nan
```

A dry run performs the dump and the full analysis and prints the statistics and
the proposed changes. It does not write the XML back and does not touch the RRD
file. It is the same code path up to the point of writing, so what it reports is
what would happen.

The time arguments accept either a Unix timestamp or a date string. A string that
cannot be parsed is rejected before anything runs.

## What actually happens to the file

Worth knowing before you run it on something you care about.

1. The file is dumped to XML in the backup directory.
2. Comments are stripped and every archive is scanned for the statistics.
3. Selected values are replaced in the XML.
4. The original file is copied into the backup directory.
5. The edited XML is restored over the original path, forcing an overwrite.

Step 4 is the safety net, and it is not optional: if the copy fails, the restore
does not run. That copy, not any command line flag, is what you would restore
from. It is named after the original file and lands in the configured backup
directory, so check that setting before you need it.

## Settings that control the defaults

Command line arguments win. Anything you leave out comes from the system
settings, and per-user settings override the system ones when the tool is run
from the interface.

| Setting | Default | What it does |
|---|---|---|
| Removal method | Variance with outliers removed | Which method to use |
| Replacement method | Last known good | What replaces a removed value |
| Number of standard deviations | 10 | Threshold for the `stddev` method |
| Variance percentage | 1000 | Threshold for the `variance` method |
| Variance number of outliers | 5 | High and low samples dropped before averaging |
| Max kills per RRA | 5 | Ceiling on replacements per archive |
| RRDfile backup directory | `cache/spikekill/` under the install | Where the dump and the copy go |
| Backup retention | 3 months | How long copies are kept |

There is also a batch mode: a schedule (every 6, 12, 24 or 48 hours), a base
time, and a list of graph templates to act on. Batch mode is off by default.
Turning it on means the system edits archives without anyone looking at the
result. Restrict the template list tightly if you turn it on at all.

## Traps

**The threshold defaults are deliberately loose.** Ten standard deviations and a
1000 percent variance are wide. A run that reports no spikes has probably not
failed; it has told you the values are within the band you asked for. Tighten the
threshold rather than switching methods at random.

**Max kills per RRA limits what one run does.** The `stddev` and `variance`
methods stop after that many replacements per archive. A file with a long run of
bad samples needs a window-based method, not repeated hunting runs.

**A consolidated value cannot be recovered.** Older archives hold one value per
bucket, already averaged. Replacing that value does not restore the true
measurement for the bucket; it substitutes a plausible one. The further back you
go, the more the correction is a guess.

**The backup directory must be set and writable.** The dump file and the pre-write
copy both go there. An empty setting leaves the tool deriving paths from an empty
string, which is not a state you want to discover mid-run.

**Every run is logged with who ran it and with which parameters.** That is
deliberate. Spike removal changes recorded history, so it leaves a record of who
changed it.

**The file must be writable by the account running the command.** The tool checks
and refuses up front. Running it as root on a file owned by the poller user
leaves you with a file the poller can no longer update.

**Removing the spike does not fix the graph if the data source is wrong.** If an
interface re-index moved values onto the wrong data source, the spike is a
symptom. See [Troubleshoot missing data](/1.2.31/guides/troubleshoot-missing-data/)
before you start editing archives.
