---
title: Install and vet plugins
description: How plugins attach themselves to the application, what to read before you trust one, and why installing a plugin is equivalent to granting shell access.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 13
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Start here, because everything else on this page follows from it.

**A plugin runs as part of the application, with the application's privileges.** Its
code is included into the same PHP process that serves the web interface and into
the processes that run the poller. It holds the same database credentials, reads and
writes the same files, and executes with the same operating system account. There is
no plugin sandbox, privilege separation, or plugin signature check at install
time. The process account and its database/filesystem permissions determine the
actual access; installing a plugin does not inherently grant root privileges.

Installing a plugin is a decision of the same weight as giving someone a shell
account on the server. Treat it that way.

## How a plugin attaches

A plugin is a directory under the installation's `plugins` directory. The directory
name is the plugin's identity: it has to match the name declared inside the plugin,
contain no spaces, and consist only of letters, digits, the underscore, and the hyphen.

Two files do the work.

**`INFO`** is an INI file describing the plugin: its name, long name, version,
author, homepage, the minimum core version it supports, and any capabilities it
claims. The management listing marks a plugin incompatible when its declared
minimum core version is newer than the running version. Do not assume every
installation path enforces that result: the current CLI can install it anyway.
Check `compat` in `INFO` before invoking the CLI. See
[issue #223](https://github.com/kadupulhq/kadupul/issues/223).

**`setup.php`** defines two functions the installer requires, named after the
plugin directory:

| Function | Required for |
|---|---|
| `plugin_<name>_version()` | Returning the version, author, and homepage |
| `plugin_<name>_install()` | Registering hooks and realms |

Installation includes `setup.php`, records the plugin, and calls the install
function. Hook and realm registration checks whether the calling function's name
contains `install`, `upgrade`, or `setup`; this is a convention check, not a trust
boundary. After installation, an optional configuration check determines whether
the plugin is installed but disabled (status 4) or needs configuration (status 2).
With no configuration-check callback, an existing `setup.php` is treated as ready.
Enabling runs the check again and sets status 1 only when it passes.

## Hooks

Registration writes a row per hook: the hook name, the file to include, and the
function to call. When the application reaches that point in its own code, it
includes the file and calls the function.

Hooks exist throughout the application. A partial sense of the range:

| Area | Examples |
|---|---|
| Poller | Before the run, after the run, when output is processed, when a device's status changes |
| Graph rendering | Adding buttons, altering the image, changing graph options |
| Navigation | Page titles, tabs, menu entries |
| Objects | Device removal, data source removal, graph removal, data query execution |
| Users | User edit, user save, user removal, group actions |
| Configuration | Settings pages, configuration arrays, form definitions |

There are two calling styles. One passes arguments to the plugin and ignores what
comes back. The other passes a value through the plugin and uses what it returns, so
a plugin that forgets to return its argument breaks the feature it hooked. The
application logs a warning when it detects this, but only when more than one plugin
is attached to the hook.

Hook order follows plugin order, which is adjustable. Two plugins hooking the same
transformation point see each other's output, in an order you control and neither of
them knows about.

The file a hook names is resolved inside that plugin's own directory. A path that
escapes the directory is refused and logged as a security event.

## What a plugin may change

| Capability | Notes |
|---|---|
| Create database tables | Tables created through the tracking helper are recorded for uninstall cleanup |
| Add columns to existing tables, including core tables | Columns added through the tracking helper are recorded for cleanup |
| Register permission realms | New sections of the interface with their own access control |
| Auto-grant new realms | With registration auto-grant enabled, grants go to the configured primary admin and current session user, if present |
| Require other plugins | Declared dependencies are version checked before install |
| Run on remote pollers | Governed by capabilities the plugin declares |

Nothing in that list is unusual for a plugin system. All of it is worth knowing
before you run someone else's code inside your monitoring system.

## Before you trust a third-party plugin

Do this before installing, on a copy of the code, on a machine that is not the
monitoring server.

**Confirm where it came from.** A named upstream repository, a release you can
identify, a tag or commit you can point at. "Found it on a forum" is not provenance.
If the plugin ships as an archive, get the corresponding source and confirm the two
match.

**Read `setup.php` end to end.** It is usually short. Follow the files and callbacks it loads as well: registration and schema changes
can be delegated, and top-level code runs as soon as the file is included.

**List the hooks and ask why.** A graph annotation plugin hooking user save is
worth a question. So is a reporting plugin hooking the poller. The hook list is a
statement of scope, and a scope wider than the described feature is the first thing
to be suspicious of.

**Search for the dangerous calls.** Command execution, dynamic evaluation,
deserialization of untrusted input, file writes outside its own directory, and
network calls to hosts you did not expect:

```sh
plugin_dir='plugins/myplugin' # Replace with the plugin directory you are reviewing.
rg -n 'exec|shell_exec|passthru|system|proc_open|popen|eval|unserialize|assert' "$plugin_dir"
rg -n 'curl_|file_get_contents\(.*https?://|fsockopen' "$plugin_dir"
```

Hits are not automatically wrong. A collection plugin that runs a command is doing
its job. A hit you cannot explain is the problem.

**Check how it builds SQL.** Values concatenated into a query string, rather than
passed as parameters, need review. Search for database helpers and inspect how
untrusted values reach each query.

**Check how it emits output.** Values printed into HTML without escaping, in a
page, can introduce cross-site scripting. Check escaping in authenticated pages
as well as anonymous ones.

**Check the realms it registers.** Note whether it auto-grants them on install and
to whom. A realm is a new access-controlled surface, and it inherits none of your
existing policy.

**Check the declared minimum core version.** A plugin last updated against a much
older release will install if its declared minimum permits it, and then call
functions that have changed.

**Read what it does at uninstall.** The plugin callback runs before core cleanup.
Tracked tables are dropped with their data and tracked columns are removed;
custom schema or file changes may need plugin-specific cleanup. Back up those
objects before removal.

## Installing

Once you have decided:

1. Back up the database. A plugin's install routine can alter core tables.
2. Unpack the plugin into its own directory under `plugins`, with the directory name
   matching the plugin's declared name.
3. Install it from the plugin management page. Installation is separate from
   enabling.
4. Review the realms it registered, and grant them deliberately rather than leaving
   whatever the install granted. See
   [Manage users and permissions](/guides/manage-users-and-permissions/).
5. Enable it, confirm its recorded state, then exercise its actual feature and
   inspect logs. Not every missing callback or bad return produces a warning, so
   a quiet log is not proof that all hooks worked.

Install on a test instance first. A plugin that adds a column to a core table is not
something you want to discover on production.

## Command-line lifecycle

Use one plugin and one action at a time while validating:

```sh
php cli/plugin_manage.php --plugin=myplugin --install
php cli/plugin_manage.php --plugin=myplugin --enable
php cli/plugin_manage.php --plugin=myplugin --disable
php cli/plugin_manage.php --plugin=myplugin --uninstall
```

Replace `myplugin` with the reviewed directory name. Installation and enabling
are separate, though the CLI also accepts `--install --enable`. Use repeated
`--plugin` options for multiple plugins, and verify each resulting state. There
is no dry-run option. The CLI's success messages and exit status do not establish
compatibility or successful configuration.

Do not rely on `--allperms` to grant existing plugin realms. It re-registers them,
but the current registration code only auto-grants when creating a new realm.
A realm initially registered without auto-grant can remain unassigned after
`--install --allperms`. Review and grant it explicitly in user/group management.
This flag is intended for administrative accounts, not every user. See
[issue #224](https://github.com/kadupulhq/kadupul/issues/224).

## Traps

**Disabled is not inert.** Disabling a plugin stops most of its hooks, but the ones
named `config_settings`, `config_arrays`, and `config_form` retain their active
status. Their files can still be included and their callbacks run. Other hook
registrations are disabled. Disabling also does not delete PHP files or guarantee
that a plugin's direct URLs are unavailable.

Uninstalling invokes plugin code too. If a plugin is suspected of being malicious,
isolate the installation and review the removal procedure before invoking its
uninstall callback.

**Uninstall removes tracked data, not the plugin directory.** The normal path
runs the plugin callback, removes hooks, realm definitions, user/group realm
grants, and the configuration row, then drops tracked tables and columns. Plugin
source files remain on disk. Untracked changes are not automatically reversed.
Export anything you need before uninstalling, then review remaining files.

**Plugin order is load-bearing.** When two plugins transform the same value, the
order decides the result. Reordering plugins to fix one thing can silently change
another.

**The poller runs plugins too.** Call frequency depends on the hook: some are
per poller run, others are per device/status/output event. Remote capability and
connection checks can further limit dispatch. Measure the plugin on the relevant
poller path; slow callbacks can consume the polling interval.

**Realm grants depend on registration and lifecycle.** New realms may be granted
automatically, depending on the registration flag. Disabling preserves realm
definitions and grants; normal uninstall removes them. Review grants after an
install or upgrade rather than assuming prior assignments cover new realms.

**Upgrading the core can strand a plugin.** The declared minimum version says the
oldest core the plugin supports. It says nothing about the newest. Re-check your
plugins before a core upgrade, not after.

**A plugin can grant access.** It can register realms, and it holds the database
credentials that reach the user and permission tables. No permission you configure
constrains a plugin. The only control is which plugins you install, which is why
plugin administration should be held by very few accounts.
