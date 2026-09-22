---
title: Remove spikes from data
description: Preview spike corrections, preserve recovery copies, and verify changes to retained RRD samples.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 19
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

:::danger[This rewrites history; recovery requires a backup]
Spike removal dumps the archive, edits values, restores a temporary sibling file
and replaces the original after validation. There is no automatic undo. Preserve
and verify a recovery copy, run `--dryrun` first, and confirm the target samples
before committing a change.
:::

A spike here means one or two samples so much larger than everything around them
that the vertical axis scales to them and the rest of the graph flattens into the
baseline. The measurement is wrong, and it is also loud.

## Where they come from

Most spikes on a counter-based data source are arithmetic, not measurement.
A counter data source stores a rate computed from the difference between two
readings. Anything that makes the second reading much larger than the first,
relative to the time between them, can produce a false rate. Counter resets,
incorrect wrap handling, an interface re-index that moves readings onto the wrong
data source, or timestamp errors can cause this. A normal counter wrap is not
itself proof of a bad sample; verify the data-source type and input readings.

See [Data sources and RRAs](/concepts/data-sources-and-rras/) for how the rate is
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
| `fill` | Unknown and zero-valued samples inside a stated time window | Yes |

`stddev` and `variance` hunt. `float` and `fill` do what you tell them inside a
range you name, and both fail immediately if you do not give a start and an end.

`fill` is not limited to missing data: it can replace measured zeroes with
nonzero values. Do not use it on a range containing valid idle or zero readings
unless that alteration is intentional.

The variance method drops the top and bottom N samples before computing the
average it compares against, where N is the outliers setting. That is what stops
the spike from inflating the threshold meant to catch it.

Whatever is selected gets replaced, and there are three replacements.

| Replacement | Result |
|---|---|
| `last` | The last known good value. The default. |
| `avg` | A calculated average for the field/archive; the calculation depends on the method. |
| `nan` | Unknown for statistical methods; see the window-method limitation below. |

Unknown records that a usable measurement is unavailable. `last` and `avg`
substitute values that can look measured to someone reading the graph later.
Choose the replacement deliberately and verify the actual stored result.

**Window-method limitation:** `float` and `fill` currently accept `--avgnan=nan`
but leave the selected values unchanged, despite returning success. Do not rely
on that combination. Statistical methods with optional time bounds can replace
detected outliers with unknown, but are not equivalent to blanking a whole window.
Tracked in [#237](https://github.com/kadupulhq/kadupul/issues/237).

## Preview, then commit

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

A dry run dumps the RRD and analyzes it without rewriting the live file. It still
needs a usable work directory and maintenance access. A preview does not reserve
the file until a later commit: new samples or changed options can change the
result. The windowed example still uses statistical selection; it does not remove
every value in that window.

The time arguments accept either a Unix timestamp or a date string. A string that
cannot be parsed is rejected before rewriting. Use Unix timestamps when timezone
interpretation would otherwise be ambiguous.

## What actually happens to the file

Worth knowing before you run it on something you care about.

1. The file is dumped to XML in the backup directory.
2. Comments are stripped and every archive is scanned for the statistics.
3. Selected values are replaced in the XML.
4. The original file is copied into the backup directory.
5. The edited XML is restored to a private sibling, validated, and renamed over
   the original while preserving its owner, group and mode.

Step 4 is the safety net, and it is not optional: if the copy fails, the restore
does not run. That copy, not any command line flag, is what you would restore
from. Its name is based on the original and may receive a unique suffix to avoid
overwriting an existing artifact. `--backup` additionally requests a persistent
recovery snapshot. Read the reported paths and verify the copies before relying
on them.

The operation requires trusted local POSIX directories and maintenance locking;
writable mode bits alone are insufficient. It refuses unsupported storage and a
configured rrdcached endpoint. Stop external writers, which do not participate in
Kadupul's lock protocol. Run as the intended storage-owning service account.
See [installation requirements](/reference/requirements/) for storage access.

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
| Max kills per RRA | 5 | Intended ceiling; currently not reliably enforced |
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

**Do not rely on Max kills per RRA as a safety boundary.** Review the complete
preview and use a narrow time window. The implementation resets its counter per
row rather than maintaining an archive-wide count.
In a test with one field and one archive, `--number=1` still replaced three peaks
with unknown and reported zero total changes. NaN edits are also missing from the
summary counter. Verify stored values, not just the message. Tracked in
[#238](https://github.com/kadupulhq/kadupul/issues/238).

**A consolidated value cannot be recovered.** Older archives hold one value per
bucket, already averaged. Replacing that value does not restore the true
measurement for the bucket; it substitutes a plausible one. The further back you
go, the more the correction is a guess.

**The backup directory must be configured and trusted.** The dump and recovery
copies go there. Missing, unsafe or unverifiable directories are rejected; do not
make a directory world-writable to bypass a failure.

**Keep your own change record as well as application logs.** Record the operator,
command, time range, backup paths and before/after checks. Summary counts alone
are insufficient evidence of what changed.

**Run as the intended service account.** Successful replacement preserves file
ownership and mode. Root is not a shortcut around the directory trust checks;
verify that normal polling can still update the result.

**Removing the spike does not fix the graph if the data source is wrong.** If an
interface re-index moved values onto the wrong data source, the spike is a
symptom. See [Troubleshoot missing data](/guides/troubleshoot-missing-data/)
before you start editing archives.
