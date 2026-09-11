---
title: Back up and restore
description: Three things have to be captured together or the backup is not a backup, and the order they go back in matters.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 7
---

:::caution[Nothing to back up yet]
Kadupul has not shipped. This page states the intended backup contract so it can
be argued with before there is a running system to lose.
:::

A Kadupul backup has three parts. Any one of them alone restores nothing useful.

| Part | What it holds | Where it lives |
|---|---|---|
| Database | Devices, templates, users, permissions, the poller cache, and the path of every RRD file | MySQL or MariaDB |
| RRD files | Every measurement ever kept | The RRA directory, by default `rra/` under the install |
| Configuration | Database credentials, paths, collector configuration, plugin and script code | `include/config.php`, the spine configuration file, `plugins/`, `scripts/`, `resource/` |

## Why a database-only backup is worthless

The database holds no historical archive. Not a summary of it, not a recent
window. The exception is deferred samples: with Boost enabled, recent readings
sit in the database until they are flushed to the files.
None. See [Architecture](/concepts/architecture/) for why.

Restore the database alone and you get a system that knows about four hundred
devices, has every graph defined, and draws every one of them empty. It will
start collecting again from the moment you start the poller, and the history is
gone.

## Why an RRD-only backup is also worthless

The reverse fails for a different reason. An RRD file does not know what it
measures. It is a numbered file containing numbered data sources.

The mapping from "bytes in on port 3 of switch 12" to a path on disk lives in the
database, in a column on the data source. Restore the file tree alone and you
have several thousand files full of numbers, with no way to work out which is
which short of reverse engineering them by hand.

The two are one backup. Treat them that way.

## Consistency between them

This is where most backup procedures are quietly wrong.

The poller writes to RRD files continuously. A file copied while an update is in
progress can be captured mid-write. The database is being written at the same
time. If you dump the database at 02:00 and start copying files at 02:20, the two
halves describe different moments, and every data source created or deleted in
between is a mismatch.

Deferred RRD writes make it worse and more interesting. In that mode the poller
does not write RRD files on every pass. Results accumulate in a durable database
table and are flushed in bulk later. So the database can legitimately be ahead of
the RRD files by up to the flush interval, holding real measurements that are not
on disk anywhere else.

Pick one of these. In descending order of preference:

**Filesystem snapshot.** Quiesce the database, take an atomic snapshot of both
the database directory and the RRA directory, release. This is the only approach
that gets a genuinely consistent pair without stopping collection for long.

**Stop the poller.** Stop the launcher, flush any deferred writes, dump the
database, copy the RRA tree, start the launcher. You lose the samples for the
duration, which appear as a gap.

```sh
set -euo pipefail

APP=/path/to/kadupul
DEST=/var/backups/kadupul            # outside the served tree
DB=$(php -r 'require "'"$APP"'/include/config.php"; echo $database_default;')
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"

# Stop the launcher first, then flush deferred writes.
php "$APP/poller_boost.php" --force

# Wait for collectors and any other RRD writer to finish before touching files.

( umask 077
  mysqldump --single-transaction --routines "$DB" > "$DEST/db-$STAMP.sql"
  tar -C "$APP" -cf "$DEST/rra-$STAMP.tar" rra )
```

Three things in that are not decoration. The destination is outside the
application directory, because a dump written next to the application can
overwrite the shipped `cacti.sql` schema file and, if the directory is served,
publish your database credentials over HTTP. The database name comes from the
configuration rather than being assumed. And `set -e` with a restrictive `umask`
means a failed dump stops the script instead of leaving a truncated file that
looks like a backup.

**Accept the skew and record it.** Whichever part you capture first is the older
one, and neither order makes a live pair consistent on its own. Write down the
window; that is what makes the result recoverable.

Dump the database first and copy the files second, and the files are newer. A
data source deleted inside the window is still in the dump but its file is gone,
leaving a reference the poller will recreate. A data source created inside the
window arrives as a file the database does not know about, which is inert.

Copy the files first and dump the database second, and the database is newer. A
data source created inside the window is in the dump with no file behind it,
which the poller recreates empty.

Neither order loses history that existed before the window. What both lose is
the samples collected during it, and a snapshot of the whole volume avoids that
where the filesystem supports one.

## What is in the backup that you did not think about

Device credentials are in the database in cleartext. The poller cache carries
SNMP community strings and SNMPv3 usernames, passwords and passphrases as plain
columns, because the collector needs them on every pass. The configuration file
carries the database password.

A Kadupul backup is therefore a credential store for every device you monitor.
Encrypt it at rest, restrict who can read it, and do not push it to a
general-purpose file share.

## Restore order

Order matters because each step depends on the one before it.

1. **Restore the configuration first.** Without database credentials and the RRA
   path, nothing else can be checked. If the restore is onto different hardware,
   fix the paths now rather than after.

2. **Restore the RRD tree.** Put it where the configuration says it is. Check
   ownership and mode: the poller writes these files as the poller user, and the
   web interface reads them as the web server user. A restore that preserves
   content but not ownership produces a system that graphs fine and collects
   nothing.

3. **Restore the database.** The version table in the dump must match the code
   you are restoring onto. A dump from an older release restored onto newer code
   sends the web interface to the installer, which is correct behaviour but not
   what you want in the middle of a recovery. Restore matching code first.

4. **Rebuild the poller cache.** The cache is derived, and a restore is exactly
   the situation where it can be stale. Rebuilding costs one run and removes a
   whole category of confusing symptom.

5. **Start the poller, then check one file.** Confirm that an RRD file's last
   update time moves after the first run. If the graphs are populated to the
   restore point and then flat, the poller is not writing, and you have a
   permissions problem from step 2.

## Traps

**RRD files reject updates in the past.** An RRD file will not accept a sample at
or before the timestamp it already holds. Restoring an older set of files against
a newer database does not backfill; the poller resumes at the current time and
the interval between the backup and the restore is a permanent gap. This is also
why you cannot merge two backups by copying files between them.

**Check whether your stored paths are tokenised before rewriting anything.**
Generated data sources store the path as `<path_rra>/name.rrd`, and the token is
expanded at read time from the RRD path setting. For those, moving the install
means changing the setting and rebuilding the poller cache, not rewriting rows.
Paths that were entered by hand are stored literally and do need rewriting.
Check before you run an update across the table, because rewriting tokenised
paths into absolute ones is the change that makes the next move harder.

**Remote collectors have their own configuration file.** Each one holds its own
database credentials and collector id. They are not in the central database
backup. Capture them per host.

**Plugin data is in the same database.** Plugins create their own tables at
install time, so a full database dump covers them. Plugin code is not in the
database. If you restore the database without the matching `plugins/` directory,
the install will disable what it cannot find.

**A backup you have not restored is a hypothesis.** Restore into a scratch
instance on a schedule. The failure mode this catches most often is not
corruption; it is a backup that was only ever capturing one of the three parts.
