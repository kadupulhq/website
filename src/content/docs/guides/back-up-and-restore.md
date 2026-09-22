---
title: Back up and restore
description: Three things have to be captured together or the backup is not a backup, and the order they go back in matters.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 7
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A complete Kadupul recovery set has three parts. Partial backups can recover
configuration or measurements, but cannot reproduce the whole installation.

| Part | What it holds | Where it lives |
|---|---|---|
| Database | Devices, templates, users, permissions, the poller cache, and the path of every RRD file | MySQL or MariaDB |
| RRD files | Retained measurements and consolidated archives | The RRA directory, by default `rra/` under the install |
| Configuration | Database credentials, paths, collector configuration, plugin and script code | `include/config.php`, the spine configuration file, `plugins/`, `scripts/`, `resource/` |

## What a database-only backup can recover

The database holds graph definitions and monitoring configuration, while RRD files
hold the historical graph archives. With Boost enabled, recent readings can also
sit in database queues until they are flushed to files. Preserve those queues as
part of the database backup. See [Architecture](/concepts/architecture/).

Restore the database alone and you get a system that knows about four hundred
devices, has every graph defined, and draws every one of them empty. It will
start collecting again from the moment you start the poller, and the history is
gone.

## What an RRD-only backup is missing

An RRD file contains named data sources, archive definitions and values, but not
the full Kadupul device, query, graph and permission metadata needed to reconnect
those values to the application.

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

**Coordinated snapshot.** Use the database engine's supported backup or quiescing
procedure and coordinate it with snapshots of all RRD storage and application
configuration. A filesystem snapshot alone does not establish consistency across
separate volumes, remote collectors, pending queues or an active database.

**Quiesced logical backup.** Disable scheduled launchers and other producers,
wait for already-running collectors to finish, then flush deferred writes and
wait for the flush workers. Keep configuration changes, maintenance and other
RRD writers stopped throughout capture. Collection pauses can leave missing
samples; their appearance depends on heartbeat and consolidation.

Before running the example, complete those quiescing steps and verify queue/worker
state. `poller_boost.php --force` returning zero alone is not proof of a complete
flush: an already-registered Boost process can cause it to exit without doing the
work. Coordinate any rrdcached service or remote storage separately.

This Bash example assumes local storage, a database account configured in a
private client option file, and an RRA directory containing all managed RRDs.
Replace every path. Inventory custom absolute RRD paths, symlink targets,
external configuration and remote collectors and capture them separately too.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

The application archive includes configuration and matching code. Record the
source revision, database and RRDtool versions, actual storage paths and writer
shutdown/flush status alongside the set. The example excludes ordinary logs,
cache and Git metadata; review those exclusions for your installation.

Only a successfully captured and checksummed set receives the final directory
name. A failed command can still leave a truncated file inside `.partial-*`;
`set -e` stops subsequent commands but does not remove output already created.
Do not promote that directory to a completed backup. Checksums detect later
changes, not logical completeness; a restore test is still required.

`--single-transaction` covers transactional tables, not a consistent snapshot of
nontransactional plugin tables or concurrent schema changes. Keep writers and
schema changes stopped, or use an engine-appropriate backup method. Resume
collection only after confirming capture has finished and storage is usable.
See the [mysqldump documentation](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
for transaction and privilege requirements. The earlier recipe's omissions are
tracked in [website #12](https://github.com/kadupulhq/website/issues/12).

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

Either order can lose pre-window history if a needed file is deleted before it
is copied. It can also capture a partially written file or inconsistent queued
samples. Recording skew documents a limitation; it does not make an inconsistent
pair complete or guarantee recoverability.

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
   you are restoring onto. Keep all launchers and writers disabled until the
   restored components have been checked together. A dump from an older release restored onto newer code
   sends the web interface to the installer, which is correct behaviour but not
   what you want in the middle of a recovery. Restore matching code first.

4. **Rebuild the poller cache.** The cache is derived, and a restore is exactly
   the situation where it can be stale. Rebuilding costs one run and removes a
   whole category of confusing symptom.

5. **Start the poller, then check one file.** Confirm that an RRD file's last
   update time moves after the first run. If the graphs are populated to the
   restore point and then flat, inspect collection results, queues, timestamps,
   paths and permissions. A flat graph alone does not identify the cause.

## Traps

**RRD files reject updates in the past.** An RRD file will not accept a sample at
or before the timestamp it already holds. Restoring an older set of files against
a newer database does not by itself backfill lost samples. Retained deferred
queues or other sources may contain recoverable readings, but replay requires
separate validation and timestamp ordering. Without those readings, collection
resumes with a gap. This is also
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
