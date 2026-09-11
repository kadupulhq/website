---
title: Migrate to new hardware
description: Moving a running install to another server without losing history,
  in the order that keeps each step verifiable.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 20
slug: 1.2.31/guides/migrate-to-new-hardware
---

:::caution[Nothing to migrate yet]
Kadupul has not shipped, so there is no install to move. This page records the
intended procedure and the places where paths and ownership have to be corrected
on the far side.
:::

A migration is a restore onto a machine that differs from the one the backup came
from. Everything in [Back up and restore](/1.2.31/guides/back-up-and-restore/) applies
here; this page covers only what is different because the destination is not the
source.

Three things differ, and each has its own failure.

| Difference | What it breaks |
|---|---|
| Different paths | Stored file paths in the database and in the poller cache |
| Different user and group ids | The poller can read the files but cannot write them |
| Different runtime versions | The schema and the code fall out of step |

## Before you touch anything

Build the destination first and get it to the point where a fresh install would
work: database server running, PHP present, RRDtool present, the collector
binary built, the web server serving the document root. Do not run the installer.
You are going to replace the database, and a half-installed schema is harder to
diagnose than an empty one.

Match the code version exactly. The database dump carries a `version` table that
records the version it came from. Restore a dump onto newer code and the web
interface sends you to the installer, which is correct behaviour and not what you
want mid-migration. Install the same version you are leaving, migrate, confirm it
works, then upgrade as a separate exercise using
[Upgrade safely](/1.2.31/guides/upgrade-safely/).

Decide the install path now. Keeping it identical on both machines removes most
of the work below. If you cannot, read the paths section before you start.

## Order of operations

Each step checks the one before it, so do not reorder them.

1. **Stop collection on the source.** Stop the launcher and let any in-flight run
   finish. If deferred RRD writes are enabled, flush them; those results live in
   a database table and are not on disk yet.

2. **Take the backup.** Database, RRD tree, configuration, captured together.
   The consistency rules in
   [Back up and restore](/1.2.31/guides/back-up-and-restore/) are the whole point.

3. **Move the RRD tree.** See below for how.

4. **Move the database.**

5. **Move the code, the configuration and everything the configuration points
   at.** That includes `plugins/`, `scripts/`, `resource/`, and any local file a
   data input method calls.

6. **Correct paths and ownership on the destination.**

7. **Rebuild the poller cache.**

8. **Start the poller and watch one file.**

## Carrying the RRD tree

An RRD file is a binary file with an internal layout that depends on how it was
written. Copying it byte for byte is the fast path and works when both machines
agree on that layout. Between two current 64-bit Linux servers it normally does.
Between machines that differ in endianness or word size it does not, and the
symptom is a file that opens and reads as nonsense rather than a file that fails
to open.

If you are not sure the two agree, convert instead of copying. RRDtool's own dump
and restore produce a portable text form; Kadupul uses the same pair internally
when it has to rewrite an archive.

```sh
# on the source
rrdtool dump file.rrd > file.xml

# on the destination
rrdtool restore file.xml file.rrd
```

Confirm before you commit to the slow path. Copy one file, run `rrdtool info` on
it on the destination, and check the last update time and the data source names
look right. If they do, copy the tree.

Whichever way you carry them, preserve the directory structure exactly. Nested
subdirectories under the RRA directory are not decoration; the path of each file
is recorded per data source, and a flattened tree breaks every one of them.

## The database

A dump and a load. Two things to check on the far side.

The character set and collation must match what the source used. A schema loaded
under a different default collation produces tables that work until something
compares a string, which is a symptom that shows up weeks later.

The storage engine matters for a handful of tables. Some of them are memory
tables by design, holding collector results in flight and statistics caches.
Those come back empty and repopulate on their own. Do not convert them to a
durable engine to make the migration look tidier; they are memory tables because
they are written on every collection pass.

## Paths on the far side

This is where migrations go wrong, because most of it is invisible until the
first collection run.

**The RRA path.** Each data source records its file path, and the install root is
written as a token rather than an absolute path. Changing the RRA directory means
correcting the setting, not rewriting every row. A path that was stored with the
root already expanded, which happens when someone set a custom path by hand, does
have to be corrected per row.

**The poller cache holds absolute paths.** When the cache is built, the token is
expanded and the full path is written into the cache row. Change the RRA
directory and the cache still points at the old one. The poller keeps running and
writes nothing you can find. Rebuild it.

```sh
php cli/rebuild_poller_cache.php
```

**Settings that hold paths.** Each of these is stored in the database, so each
one arrives from the old machine pointing at the old machine's layout. Check all
of them before the first run: the RRDtool binary, the collector binary and its
configuration file, the PHP binary, the SNMP tools, the log paths, the default
font, and the spike removal backup directory.

**Data input methods hold command lines.** They use a token for the install root,
so a move that keeps the layout needs nothing. A move that changes it needs each
one checked. The same applies to the resource XML files behind data queries.

**Remote collectors have their own configuration file**, holding their own
database credentials and their own collector id. They are not in the central
dump. If the central database moved to a new address, every remote collector's
configuration has to be updated to point at it, and then the resources pushed out
again.

```sh
php cli/poller_replicate.php
```

## Ownership and permissions

The poller writes RRD files as the account that runs it. The web interface reads
them as the web server account. A copy that preserved numeric ids across machines
with different `/etc/passwd` entries gives you files owned by the wrong account.

The failure is specific and worth recognising: graphs draw correctly, showing
every sample up to the moment of the migration, and then go flat. That is not a
collection problem. That is the poller failing to write, and it is a permissions
problem every time.

Check ownership of the RRA directory itself and of the nested subdirectories, not
just a sample file. New files are created in those directories during collection,
so a directory the poller cannot write into fails for data sources that did not
exist at migration time even when the existing files are fine.

## Cutover with minimal loss

There is no way to make the gap zero, because an RRD file will not accept a
sample at or before a timestamp it already holds. You cannot run both systems and
merge afterwards. Whatever the new install collects during a parallel run has to
be thrown away, and whatever the old one collected after the backup is lost.

So minimise the window rather than trying to eliminate it.

1. Do a full rehearsal ahead of time with a backup from the day before. Copy
   everything, correct every path, start the poller, confirm a file updates. This
   surfaces the permission and path problems while both systems are still
   running.
2. Leave the rehearsal copy in place. Its RRD files are now stale by a day, and
   that is fine; you are going to overwrite them.
3. For the real cutover, stop collection on the source, take the backup, copy
   only what changed, correct nothing (you did that in the rehearsal), and start.

A rehearsed cutover is minutes. An unrehearsed one is however long it takes to
find the first wrong path, and collection is stopped the entire time.

## Verify in this order

1. The web interface loads and does not redirect to the installer. If it does,
   the code version and the database version disagree.
2. A device shows as up. That is the collector reaching the network.
3. An RRD file's last update time moves after the first collection run. Check the
   file on disk, not the graph.
4. A graph drawn over the last hour shows a line, not a gap.

Step 3 failing after step 2 succeeds is the ownership problem. Step 4 failing
after step 3 succeeds is the web server account, not the poller account.

## Traps

**Do not run both installs against the same RRD tree.** Two pollers writing the
same files produce rejected updates and gaps, not merged data.

**Do not restore an older RRD tree over a newer database.** The files will not
backfill. Collection resumes at the current time and the interval between the two
is a permanent hole.

**The backup contains device credentials in cleartext.** Moving hardware means
those credentials travel across a network and sit on two machines. Encrypt the
transfer and delete the copy on the old machine once you are done.

**Plugin tables are in the database; plugin code is not.** Restore the database
without the matching `plugins/` directory and the install disables what it cannot
find, which looks like data loss and is not.

**If RRD files are handled by a proxy rather than stored locally**, the file tree
is not on either machine and most of this page does not apply. Move the proxy or
repoint the setting; do not copy a local `rra/` directory that only holds
leftovers.

**Decommission the old machine last, and not on the same day.** Leave it powered
off but intact until the new one has collected a full retention cycle of the
shortest archive. The failures that take a week to notice are the ones you need
the old files for.
