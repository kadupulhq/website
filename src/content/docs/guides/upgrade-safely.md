---
title: Upgrade safely
description: What an upgrade actually changes, which parts can be rolled back, and the one part that cannot.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 8
---

:::caution[Nothing to upgrade yet]
Kadupul has not shipped, so there is no version to upgrade from. This page records
the intended procedure, inherited from how Cacti 1.2.x behaves.
:::

An upgrade changes three things at different times and with different reversibility.

| Changes | Reversible | How |
|---|---|---|
| Code on disk | Yes | Put the old code back |
| Database schema | Only from a backup | Restore the dump you took first |
| RRD files | No | There is no undo, so do not touch them |

The procedure exists to keep those three in step.

## Before you start

**Take the full backup.** All three parts, consistent with each other. Follow
[Back up and restore](/guides/back-up-and-restore/). An upgrade is the one time
you are guaranteed to want it.

**Record the current version.** You need it to know which schema migrations will
run and to know what to roll back to.

**Check every plugin.** Each plugin declares, in a file in its directory, the
minimum core version it works with. Compare that against the version you are
moving to. Anything declaring a minimum above the new version will be disabled
during the upgrade. Find out now, not from a ticket about a missing tab.

**Check the runtime.** PHP version, PHP extensions, and the database server
version. A new release can raise a floor. The installer checks these and refuses
to proceed, which is better than the alternative but still an outage if you meet
it at 22:00.

**Check that the database account can change the schema.** At runtime the account
needs to read and write within its own database. At upgrade time it also needs to
create, alter and drop tables and indexes. Installs that tightened the grant after
setup discover this here.

**Stop the poller.** The launcher first, then confirm no collection process is
still running. A poller writing into a schema that is being altered underneath it
produces errors that are difficult to attribute afterwards.

## Replace the application

The trailing dot matters more than anything else on this page.

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Without it, `cp -a /path/to/new-release /path/to/kadupul` creates
`kadupul/new-release/` and leaves every file of the old application exactly where
it was. The upgrade appears to have worked, the interface still runs the old
code, and the first sign of trouble is the schema migration refusing to match a
version you thought you had replaced.

A copy over the top leaves anything the new release does not ship: your
configuration, your plugins, and the RRD tree. That is usually what you want, but
it also means files removed upstream stay behind. If you would rather not carry
them, stage the release beside the install, copy the configuration and plugins
into the staged copy, and swap a symlink. Rollback is then swapping it back.

**Check what you are actually running before you go on.**

```bash
php -r 'require "/path/to/kadupul/include/global.php"; print CACTI_VERSION . "\n";'
```

If that does not report the release you just deployed, stop. Everything after
this point assumes the code has changed.

## The schema migration

The database carries its own version, separate from the version in the code.
Replacing the code does not change it.

The moment those two disagree, the web interface stops serving pages and redirects
every request to the installer. This is deliberate and it is the safety
interlock: you cannot accidentally run new code against an old schema.

The installer walks the migration steps between the two versions in order. There
is also a command line path, which is what you want for an unattended or scripted
upgrade:

```sh
php cli/upgrade_database.php
```

Run it as a user that can write a PHP session file, typically the web server user
or root. There is a `--forcever` option to set the starting version explicitly,
which exists for re-running a migration during pre-release testing. It is not
part of a normal upgrade and using it to skip a failed step will leave the schema
half-migrated.

The migration is the part that has no rollback of its own. If it fails partway,
your recovery is the database dump, not a reverse migration.

## What breaks plugins

The upgrade actively disables plugins. Three cases, and they read differently in
the log.

**The declared minimum version is above the new core version.** Disabled. This is
the normal case and it is the one your pre-upgrade check should have caught.

**The plugin directory, its setup file, or its declaration file is missing.**
Disabled. A plugin whose files were removed while it was still marked enabled in
the database falls here.

**The plugin has no declaration file at all.** Treated as legacy and not
compatible. Older plugins written before the declaration existed are in this
category permanently.

There is a fourth case that is not a breakage. Functionality that was once a
plugin and has since moved into the core is removed outright, not disabled: its
hooks and permission entries are stripped and its row deleted. If you see a
plugin vanish rather than turn grey, it was absorbed, and its features are now
somewhere in the interface.

Plugin data survives all of this. Plugins create their own tables in the same
database, so the tables are still there when a compatible version is installed.
What you lose is the plugin being enabled, and any permissions tied to it.

## Rollback planning

Decide the rollback before you start, because the decision is different depending
on how far you get.

| Failure point | Roll back by |
|---|---|
| Code replaced, migration not started | Restoring the old code. Nothing else changed |
| Migration failed partway | Restoring the old code and the database dump together |
| Migration completed, application misbehaves | Restoring the old code and the database dump together |
| Migration completed, only a plugin is broken | Do not roll back. Fix or remove the plugin |

The rule underneath the table: code and schema roll back together or not at all.
Old code against a new schema is not a supported state and the version interlock
will not let the interface start anyway.

Give yourself a time box. Decide in advance how long you will spend debugging
before you restore, and hold to it. The backup gets less useful the longer the
system runs half-upgraded.

## Why RRD files are the part you must not lose

The RRD files do not participate in the upgrade. No migration touches them and no
rollback restores them. They sit there through the whole thing.

That makes them both the safest and the most dangerous part.

Safest, because a failed upgrade does not damage them. Dangerous, because they
are the only copy of your history. The database can be rebuilt from a dump. The
code can be re-downloaded. A deleted RRD file is years of measurement that no
other part of the system holds, and nothing can regenerate it. See
[Data sources and round-robin archives](/concepts/data-sources-and-rras/) for why
the resolution inside them cannot be reconstructed either.

Three specific ways people lose them during an upgrade:

**Deploying by replacing the install directory.** The RRA directory defaults to a
subdirectory of the install. Removing the old directory and unpacking the new one
in its place deletes every measurement you have. Move the RRA tree outside the
install directory before your first upgrade, and configure the path.

**Deploying from a checkout or a package that owns the whole tree.** Same failure,
automated. Confirm what your deployment method considers deletable.

**Fixing permissions with a recursive change of ownership.** Harmless to the data
but it can leave the poller unable to write, which shows up as a system that
graphs history perfectly and collects nothing new.

## After the upgrade

1. Confirm the interface loads without redirecting to the installer. That is the
   schema and the code agreeing.
2. Start the poller and wait one full interval.
3. Check one RRD file's last update time and confirm it moved.
4. Check the log for the run statistics line and compare the elapsed time against
   what it was before. A new release can change collection cost.
5. Re-enable the plugins that were disabled, one at a time, after installing
   versions that declare compatibility with the new core.
6. Upgrade remote data collectors. They run the same code and are subject to the
   same version check. Leaving one behind means it stops working against the
   central database, not that it keeps working in a degraded way.
