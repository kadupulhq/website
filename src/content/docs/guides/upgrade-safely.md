---
title: Upgrade safely
description: Rehearse an upgrade, preserve matched backups, check storage and schema state, and plan a coordinated rollback.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 8
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

An upgrade changes three things at different times and with different reversibility.

| Changes | Reversible | How |
|---|---|---|
| Code, dependencies and configuration | From a retained copy | Restore the matching revision and settings |
| Database schema and queued samples | From a matched backup | Restore the database; there is no automatic reverse migration |
| RRD files | From a matched backup | Restore retained history; samples absent from the backup cannot be recreated by rollback |

The procedure exists to keep those three in step.

## Before you start

**Take the full backup.** All three parts, consistent with each other. Follow
[Back up and restore](/guides/back-up-and-restore/). Stop all writers before the
final capture and keep the protected backup until upgrade acceptance.

**Record the current revision and schema version.** Include dependencies, local
changes, plugins and configuration. Multiple source revisions can report the same
schema version. Rehearse the target revision against an isolated restored copy.

**Check every plugin.** Inspect its compatibility declaration, code and dependencies,
then test the functions you need against the target revision. A minimum version
declaration alone does not establish compatibility. See
[Plugin validation](/guides/install-and-vet-plugins/).

**Check the runtime.** PHP version, PHP extensions, and the database server
version. Check the target's [requirements](/reference/requirements/) before
deployment. Do not assume the schema CLI performs every web-installer check.

**Check that the database account can change the schema.** At runtime the account
needs to read and write within its own database. At upgrade time it also needs to
create, alter and drop tables and indexes. Installs that tightened the grant after
setup discover this here.

**Stop every producer.** Stop scheduled collection, remote collectors, web-triggered
collection and manual maintenance; wait for in-flight work to finish. Drain deferred
writes only after producers stop, and preserve any unacknowledged queue rows with
the matching backup. Keep producers stopped through deployment and schema validation.

## Replace the application

An overlay copy has specific limits:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Without it, `cp -a /path/to/new-release /path/to/kadupul` creates
`kadupul/new-release/` and leaves every file of the old application exactly where
it was. The upgrade appears to have worked, the interface still runs the old
code, and the first sign of trouble is the schema migration refusing to match a
version you thought you had replaced.

A copy over the top retains files absent from the new tree, including obsolete
application files. It can overwrite any matching paths, so inspect the artifact
instead of assuming configuration or data is excluded. Prefer a reviewed staged
tree with matching dependencies, configuration and plugins. If switching releases
through a symlink, validate the effective RRA path and storage access before the
switch; the current bootstrap derives it from the application directory plus `/rra`.
A symlink switch alone is not a database rollback.

**Check what you are actually running before you go on.**

```bash
cat /path/to/kadupul/include/cacti_version
```

If that does not report the release you just deployed, stop. Everything after
this point assumes the intended code is deployed. Also compare the source revision
or artifact checksum with the release record; the version string alone is not enough.

## The schema migration

The database carries its own version, separate from the version in the code.
Replacing the code does not change it.

Legacy authenticated pages redirect to the installer when code and database versions
disagree. This is not a universal guard for every endpoint or CLI, and matching
version strings do not prove every migration completed. Check schema state directly.

The installer and CLI run ordered migration steps. Before the normal schema
upgrade, check the durable queue and service-account storage access. If an inherited
`poller_output` queue is not InnoDB, convert it explicitly with writers stopped and
the backup retained:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Then run this under every actual web and poller account:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

The two flags are separate operations and cannot be combined. Queue conversion
preserves pending samples; do not truncate rows to pass a check. Resolve ownership
and numeric trusted UID/GID configuration using [storage requirements](/reference/requirements/).
Online remote collectors normally select the main queue; use `--local` only for an
intentional local queue check or conversion. Once those checks pass, run the schema
upgrade from the application root:

```sh
php cli/upgrade_database.php
```

Run it as the configured service account with required filesystem access and
database privileges. A successful root check does not prove service-account access.
There is a `--forcever` option to set the starting version explicitly,
which exists for re-running a migration during pre-release testing. It is not
part of a normal upgrade and using it to skip a failed step will leave the schema
half-migrated.

Capture the exit status and output, then verify the database version and required
schema changes. The current CLI can reject an unknown or unsupported legacy starting
version yet exit 0; a successful shell status alone is insufficient. If migration
fails partway, keep producers stopped and restore the matched backup set instead
of attempting to skip the failed step.

## What breaks plugins

The web installer's plugin checks can disable incompatible or missing plugins.
Do not assume the schema CLI performs the same plugin lifecycle checks.

**The declared minimum version is above the new core version.** Disabled. This is
the normal case and it is the one your pre-upgrade check should have caught.

**The plugin directory, its setup file, or its declaration file is missing.**
Disabled. A plugin whose files were removed while it was still marked enabled in
the database falls here.

**The plugin has no declaration file at all.** It can fail the installer compatibility
check. Test a maintained compatible plugin package rather than assuming it can be
re-enabled unchanged.

There is a fourth case that is not a breakage. Functionality that was once a
plugin and has since moved into the core is removed outright, not disabled: its
hooks and permission entries are stripped and its row deleted. If you see a
plugin vanish rather than turn grey, check the migration logs and the specific
plugin's disposition before concluding that equivalent features are available.

Disabling a plugin is different from uninstalling it. Plugin hooks and migrations
can change their own tables and permissions; retain matching plugin code and data
and verify the specific upgrade path. Do not promise universal data preservation.

## Rollback planning

Decide the rollback before you start, because the decision is different depending
on how far you get.

| Failure point | Roll back by |
|---|---|
| Code replaced, no state-changing operation or writer ran | Restore the prior code, dependencies and configuration after confirming state is unchanged |
| Queue conversion or migration started, including partial failure | Stop writers and restore matching code, configuration, database and RRD backups |
| Migration completed, application misbehaves | Stop writers and restore the matched backup set; account for samples collected after the backup |
| Only a plugin is broken | Keep it disabled while assessing repair versus coordinated rollback against acceptance criteria |

The rule underneath the table: code and schema roll back together or not at all.
Old code against a new schema is not a supported state. Do not rely on the web
version check to prevent every incompatible operation.

Give yourself a time box. Decide in advance how long you will spend debugging
before you restore, and hold to it. The backup gets less useful the longer the
system runs half-upgraded.

## Why RRD files are the part you must not lose

Do not assume deployment, maintenance or resumed collection leaves RRDs unchanged.
Back them up together with the database and restore the matched set when rolling
back state changes. Retained queue samples may not yet exist in those files.
A verified RRD backup can recover its captured history; a missing sample cannot
be reconstructed merely by restoring schema or code. See
[Data sources and round-robin archives](/concepts/data-sources-and-rras/) for why
the resolution inside them cannot be reconstructed either.

Three specific ways people lose them during an upgrade:

**Deploying by replacing the install directory.** The RRA directory defaults to a
subdirectory of the install. Removing the old directory and unpacking the new one
in its place can delete retained measurements. Preserve the RRA tree through a
tested storage arrangement before replacing the application. Validate the effective
`$config['rra_path']`, nested paths and service-account trust checks; this revision
does not provide a general database setting for an arbitrary local RRA root.

**Deploying from a checkout or a package that owns the whole tree.** Same failure,
automated. Confirm what your deployment method considers deletable.

**Fixing permissions with a recursive change of ownership.** Harmless to the data
but it can leave the poller unable to write, which shows up as a system that
graphs history perfectly and collects nothing new.

## After the upgrade

1. Inspect upgrade output, database version and required schema changes, then
   confirm the interface loads. An absent redirect alone is insufficient.
2. Finish the planned remote-collector code/configuration upgrades and validate
   their database targets while their producers remain stopped.
3. Repeat service-account storage checks, resume the designated collectors, and
   verify representative RRD last-update times and usable retained values.
4. Check the log for the run statistics line and compare the elapsed time against
   what it was before. A new release can change collection cost.
5. Re-enable the plugins that were disabled, one at a time, after installing
   versions that declare compatibility with the new core.
6. Check retained queue depth, remote collection and plugin jobs over the agreed
   acceptance window. Keep the rollback backup until those checks pass.
