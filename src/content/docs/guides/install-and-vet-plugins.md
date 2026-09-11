---
title: Install and vet plugins
description: How plugins attach themselves to the application, what to read before you trust one, and why installing a plugin is equivalent to granting shell access.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 13
---

:::caution[Not yet possible]
Kadupul has not shipped. There is nowhere to install a plugin today. This page
describes the plugin architecture as it is intended to ship, and the review a
third-party plugin deserves before it is installed anywhere.
:::

Start here, because everything else on this page follows from it.

**A plugin runs as part of the application, with the application's privileges.** Its
code is included into the same PHP process that serves the web interface and into
the processes that run the poller. It holds the same database credentials, reads and
writes the same files, and executes with the same operating system account. There is
no sandbox, no privilege separation, and no code signing check at install time.

Installing a plugin is a decision of the same weight as giving someone a shell
account on the server. Treat it that way.

## How a plugin attaches

A plugin is a directory under the installation's `plugins` directory. The directory
name is the plugin's identity: it has to match the name declared inside the plugin,
contain no spaces, and consist only of letters, digits, the underscore, and the hyphen.

Two files do the work.

**`INFO`** is an INI file describing the plugin: its name, long name, version,
author, homepage, the minimum core version it supports, and any capabilities it
claims. A plugin declaring a minimum core version newer than the running one is
marked incompatible and will not install.

**`setup.php`** defines two functions the installer requires, named after the
plugin directory:

| Function | Required for |
|---|---|
| `plugin_<name>_version()` | Returning the version, author, and homepage |
| `plugin_<name>_install()` | Registering hooks and realms |

Installation includes `setup.php`, records the plugin, and calls the install
function. Hook and realm registration is only accepted from a function whose name
looks like an install, upgrade, or setup routine; a call from anywhere else is
refused and logged. After the install function returns, the plugin's configuration
check decides whether it is ready to enable or is parked as needing configuration.

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
| Create database tables | Recorded so uninstall can drop them |
| Add columns to existing tables, including core tables | Recorded so uninstall can drop them |
| Register permission realms | New sections of the interface with their own access control |
| Grant itself realms on install | The primary administrator and the installing account can be granted the new realm automatically |
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

**Read `setup.php` end to end.** It is usually short. It tells you every hook the
plugin registers, every realm it declares, and every schema change it makes. If you
read nothing else, read this.

**List the hooks and ask why.** A graph annotation plugin hooking user save is
worth a question. So is a reporting plugin hooking the poller. The hook list is a
statement of scope, and a scope wider than the described feature is the first thing
to be suspicious of.

**Search for the dangerous calls.** Command execution, dynamic evaluation,
deserialization of untrusted input, file writes outside its own directory, and
network calls to hosts you did not expect:

```sh
grep -rnE 'exec|shell_exec|passthru|system|proc_open|popen|eval|unserialize|assert' plugins/<name>/
grep -rnE 'curl_|file_get_contents\(.*https?://|fsockopen' plugins/<name>/
```

Hits are not automatically wrong. A collection plugin that runs a command is doing
its job. A hit you cannot explain is the problem.

**Check how it builds SQL.** Values concatenated into a query string, rather than
passed as parameters, are the single most common flaw in plugin code. Grep for the
database helpers and look at what is inside the string.

**Check how it emits output.** Values printed into HTML without escaping, in a
plugin reachable by an unauthenticated page, is the second most common flaw.

**Check the realms it registers.** Note whether it auto-grants them on install and
to whom. A realm is a new access-controlled surface, and it inherits none of your
existing policy.

**Check the declared minimum core version.** A plugin last updated against a much
older release will install if its declared minimum permits it, and then call
functions that have changed.

**Read what it does at uninstall.** Tables it created are dropped, along with their
data. Know that before you install, not on the day you remove it.

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
5. Enable it, then watch the log. Plugin problems show up as hook warnings about
   missing functions or about a hook that failed to return its argument.

Install on a test instance first. A plugin that adds a column to a core table is not
something you want to discover on production.

## Traps

**Disabled is not inert.** Disabling a plugin stops most of its hooks, but the ones
that supply settings pages and configuration arrays keep running, and its files keep
being included. Disabling is a feature switch, not a containment measure. If you do
not trust a plugin, uninstall it and remove its directory.

**Uninstall destroys data.** Tables the plugin created are dropped and columns it
added are removed. Export anything you care about first.

**Plugin order is load-bearing.** When two plugins transform the same value, the
order decides the result. Reordering plugins to fix one thing can silently change
another.

**The poller runs plugins too.** A hook on the poller path runs once per cycle, in
every poller process. Slow code there consumes the polling interval, and the symptom
is graphs with gaps, which nobody connects to a plugin.

**Auto-granted realms accumulate.** Each install can add a realm to the primary
administrator. Review the administrator's realm list occasionally rather than
assuming it is what you set.

**Upgrading the core can strand a plugin.** The declared minimum version says the
oldest core the plugin supports. It says nothing about the newest. Re-check your
plugins before a core upgrade, not after.

**A plugin can grant access.** It can register realms, and it holds the database
credentials that reach the user and permission tables. No permission you configure
constrains a plugin. The only control is which plugins you install, which is why
plugin administration should be held by very few accounts.
