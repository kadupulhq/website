---
title: Migrate to new hardware
description: Moving a running install to another server without losing history, in the order that keeps each step verifiable.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 20
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/reference/rrdproxy/).
:::

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A migration is a restore onto a machine that differs from the one the backup came
from. Everything in [Back up and restore](/guides/back-up-and-restore/) applies
here; this page covers only what is different because the destination is not the
source.

Three things differ, and each has its own failure.

| Difference | What it breaks |
|---|---|
| Different paths | Stored file paths in the database and in the poller cache |
| Different user and group ids | File access and storage trust checks can fail |
| Different runtime versions | Extensions, database behavior and RRD compatibility can differ |

## Before you touch anything

Build the destination first and get it to the point where a fresh install would
work: database server running, required PHP extensions present, RRDtool present,
the selected collector available, and the web server configured. Keep its poller,
scheduled jobs, remote replication and outbound notifications disabled. Do not run the installer.
You are going to replace the database, and a half-installed schema is harder to
diagnose than an empty one.

Match the application revision and dependencies exactly, including local changes
and plugins. The database `version` table records the schema version, not every
source change; matching that value alone is insufficient. An installer redirect
can indicate a schema mismatch or an incomplete restore. Install the same code you
are leaving, migrate, confirm it
works, then upgrade as a separate exercise using
[Upgrade safely](/guides/upgrade-safely/).

Decide the install path now. Keeping it identical on both machines removes most
of the work below. If you cannot, read the paths section before you start.

## Order of operations

Each step checks the one before it, so do not reorder them.

1. **Stop all producers on the source and destination.** Stop scheduled, remote,
   web-triggered and manual collection and maintenance; let in-flight runs finish.
   Drain deferred writes only after producers stop. Preserve any unacknowledged
   queue rows with the matching database and RRD backup; do not truncate them.

2. **Take the backup.** Database, RRD tree, configuration, captured together.
   The consistency rules in
   [Back up and restore](/guides/back-up-and-restore/) are the whole point.

3. **Move the RRD tree.** See below for how.

4. **Move the database.**

5. **Move the code, the configuration and everything the configuration points
   at.** That includes `plugins/`, `scripts/`, `resource/`, and any local file a
   data input method calls.

6. **Reapply destination configuration after the final restore.** Correct paths,
   database endpoints, service ownership and numeric storage trust settings.

7. **Rebuild the poller cache.**

8. **Run storage checks as every service account, then start collection only on
   the destination.** Watch representative files and retained queue depth.

## Carrying the RRD tree

An RRD file is a binary file with an internal layout that depends on how it was
written. A binary copy requires a compatible architecture and RRDtool format;
matching operating-system names or word size alone is not proof. Incompatibility
can produce read errors. Validate copied files using the destination's RRDtool.

If you are not sure the two agree, convert instead of copying. RRDtool's own dump
and restore produce a portable text form; Kadupul uses the same pair internally
when it has to rewrite an archive.

On the source, with writers stopped, use a new private staging directory:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Transfer the completed XML securely. Restore on the destination to a new candidate:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Repeat for every file that needs conversion and check every command's exit status.
Do not install partial dumps or unverified candidates. RRDtool documents XML as
the [architecture-transfer format](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Confirm before you commit to the slow path. Copy one file, run `rrdtool info` on
it on the destination, and compare step, archives, last-update time and data source
names. Compare `fetch` results over a known populated interval as well. Repeat for
representative archive layouts before transferring the tree, then verify the full
file inventory. See [RRD recovery](/guides/recover-a-corrupted-rrd/) for candidate
validation and ownership requirements.

Whichever way you carry them, preserve the directory structure exactly. Nested
subdirectories under the RRA directory are not decoration; the path of each file
is recorded per data source, and a flattened tree breaks every one of them.

## The database

A dump and a load. Two things to check on the far side.

Inspect restored table character sets, collations and storage engines, not just
server defaults. Preserve source definitions and verify compatibility with the
destination database version before cutover.

**Collector queues are not disposable caches.** The current `poller_output` queue
must use InnoDB. Storage preflight refuses a MEMORY queue. Preserve its rows and
the boost and realtime queues until samples are acknowledged; an RRD backup may
not contain those measurements yet. Do not assume a restored MEMORY table is empty:
a logical dump may contain inserts that repopulate it.

With writers stopped and backups retained, an inherited non-InnoDB queue can be
converted explicitly:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Run the storage check under every actual web and poller account. It checks local
storage access and the selected queue; success as root does not establish service
access. Online remote collectors normally target the main queue; use `--local`
only when intentionally checking their local queue. Other runtime/cache tables
need an explicit preservation or rebuild plan. See
[storage requirements](/reference/requirements/).

## Paths on the far side

This is where migrations go wrong, because most of it is invisible until the
first collection run.

**The RRA path.** Standard data source paths use the `<path_rra>` token. In this
revision, bootstrap derives `$config['rra_path']` from the application directory
plus `/rra`; it is not a general database setting for selecting an arbitrary local
directory. Confirm the effective path before moving files. Absolute custom paths
must be checked and corrected individually. Preserve nested directory layouts.

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
font, and the spike removal backup directory. Also review paths and environment
values in configuration files, service units, scheduled jobs and the web server.

**Data input methods hold command lines.** They use a token for the install root,
so a move that keeps the layout needs nothing. A move that changes it needs each
one checked. The same applies to the resource XML files behind data queries.

**Remote collectors have their own configuration file**, holding their own
database credentials and their own collector id. They are not in the central
dump. If the central database moved, update the relevant endpoints and validate
each collector's connection. Full replication is a separate operation, run on
the main collector only when enabled remote collectors are configured:

```sh
php cli/poller_replicate.php
```

Without an enabled remote collector this command exits with an error. Do not add
it to a single-collector migration as a required success check. Validate remote
configuration and replication before allowing remote collection to resume.

## Ownership and permissions

The poller writes RRD files as the account that runs it. The web interface reads
them as the web server account. A copy that preserved numeric ids across machines
with different `/etc/passwd` entries gives you files owned by the wrong account.

Graphs that stop at migration time can indicate permissions, stale paths, missing
collection, timestamps or rejected samples. Inspect the poller logs and retained
queues before choosing a repair; the graph alone does not identify the cause.

Check ownership of the RRA directory itself and of the nested subdirectories, not
just a sample file. New files are created in those directories during collection,
so a directory the poller cannot write into fails for data sources that did not
exist at migration time even when the existing files are fine. Remap
`rrd_maintenance_trusted_uids` and `rrd_maintenance_trusted_gids` in
`include/config.php` to the destination's actual numeric identities and check
trusted directory ancestors. See [storage requirements](/reference/requirements/).

## Cutover with minimal loss

An RRD rejects updates at or before its last-update timestamp. This constrains
replay; it does not prove that every migration must lose samples. Gap size depends
on sampling times, downtime and which queued measurements were preserved. This
procedure uses one collection owner and does not merge independently collected
rehearsal history into the final archive set.

1. Do a full rehearsal ahead of time with a backup from the day before. Copy
   everything, correct every path, and test updates against isolated fixture
   devices with notifications disabled. Record the destination changes as a
   repeatable procedure. Stop rehearsal writers when testing finishes.
2. Keep the rehearsal isolated. Replace its database and RRDs with the final
   matched backup; do not mix rehearsal rows or queued samples into that restore.
3. For cutover, stop source producers and drain or preserve pending samples,
   then capture and transfer the final backup. Reapply destination overrides:
   restoring the database brings source paths back into `settings`, and restoring
   configuration files can replace rehearsal endpoints and trust settings too.
4. Rebuild the poller cache, run the storage checks, verify the file inventory,
   and enable destination collection only after those checks pass.

Measure the rehearsal duration and allow time for validation and rollback. Keep
the source stopped until cutover succeeds or a controlled rollback selects it
as the collection owner again.

## Verify in this order

1. The web interface loads without an installer redirect. Investigate code/schema
   mismatch, database connectivity or incomplete restoration if it redirects.
2. A fixture device responds to a new collection attempt; a restored "up" status
   alone may be stale.
3. An RRD file's last update time moves after the first collection run. Check the
   file on disk, not the graph.
4. A graph drawn over the last hour shows a line, not a gap.

If step 3 fails, inspect paths, permissions, storage preflight, queue depth and
RRDtool errors. If step 4 fails, inspect retained values, graph definitions,
selected time range and web-account access. One successful file does not verify
every device, data input method or remote collector.

## Traps

**Do not run both installs against the same RRD tree.** Two pollers writing the
same files produce rejected updates and gaps, not merged data.

**Do not restore an older RRD tree over a newer database.** The files will not
backfill. Collection resumes at the current time and the interval between the two
is a permanent hole.

**The backup contains device credentials in cleartext.** Moving hardware means
those credentials travel across a network and sit on two machines. Restrict backup
access and encrypt the transfer. Retain the protected rollback copy until acceptance
and the retention policy permit decommissioning; do not delete it during cutover.

**Plugin tables are in the database; plugin code is not.** Restore the database
without matching plugin code and dependencies can break plugin pages, hooks or
jobs. Check each required plugin explicitly.

**Existing proxy storage is outside this migration procedure.** Proxy deployment
is unsupported. Locate and back up the actual RRD files, then validate a separate
migration to local storage on an isolated copy. A local `rra/` directory may
contain only leftovers.

**Decommission the old machine last, and not on the same day.** Leave it powered
off or with all producers disabled, and preserve its matched backup until the
new system's required collection, graphing, remote and plugin checks pass. Set
the observation period from the workloads and rollback policy; one shortest
archive cycle is not evidence that every subsystem works.
