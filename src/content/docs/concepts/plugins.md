---
title: Plugins
description: Why the extension surface is a list of named call-out points, what a plugin inherits by running inside the process, and what the guards around it do and do not stop.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 11
---

A plugin is code that the application includes into its own process and calls at named
points. Every other property of the plugin model follows from that one sentence.

For what to read before installing somebody else's plugin, see
[Install and vet plugins](/guides/install-and-vet-plugins/).

## Why it runs inside the process

Look at what plugins are for. Adding a column to a list the application is rendering.
Changing a graph's options before it is drawn. Acting on a device being deleted.
Attaching a tab. Every one of those is an edit to something the application is holding
in memory at that instant.

Handing that to a separate process means serialising it, waiting, and then trusting
whatever comes back. You have paid for isolation and not received it, because the
returned value is used regardless.

So the plugin file is included and its function is called. It receives what the caller
had, and it runs with what the caller had.

## What the plugin inherits

The same database connection and credentials. The same file access. The same operating
system account. The same session. There is no sandbox, no separate identity, and no
signature check.

This is not an oversight to be fixed with configuration. **A permission system running
inside a process cannot constrain code running in that same process.** The plugin can
read the permission tables, write them, and call the functions that check them. No
setting you make about users and groups applies to a plugin.

The control is the decision to install it. That is the entire control.

## Two calling styles

| Style | The application | A plugin that returns nothing |
|---|---|---|
| Notification | Passes arguments, ignores the result | Is contained |
| Transformation | Passes a value, uses what comes back | Breaks the feature it hooked |

The transformation style is what lets a plugin add a button, extend an action list, or
alter a graph. It is also where plugins become entangled: two plugins on the same point
each see the previous one's output, in an order neither of them knows about.

The application logs a warning when a transformation hook fails to return its argument,
but only when more than one plugin is attached to that point. A single plugin quietly
eating a value produces a missing feature and no explanation.

## Registration is state, not discovery

Hooks live in a table: which plugin, which hook name, which file, which function,
enabled or not. Registration happens once, at install time, from the plugin's setup
file.

The alternative would be discovery at request time, which means scanning the plugin
directory and including every plugin's code to ask what it wants. A single page reaches
many hook points. Including everything to find out that nothing is attached is the
expensive answer, so the application asks the table, caches the answer for the request,
and includes only the file a matching row names.

That choice has a cost worth knowing. The table can disagree with the filesystem. A
plugin directory deleted by hand leaves its rows behind, and the application logs a
warning each time it looks for a function that is no longer there.

Order comes from the plugin's registration order and is adjustable. A transformation
chain is therefore ordered by something an administrator controls.

## What a plugin may reach for

| Capability | Note |
|---|---|
| Create its own tables | Recorded, so uninstall can drop them |
| Add columns to existing tables, core ones included | Recorded, so uninstall can remove them |
| Register permission realms | New access-controlled sections of the interface |
| Declare dependencies on other plugins | Version checked before install |
| Run on remote collectors | Only for capabilities it declares |

The recorded schema changes are the reason uninstall is destructive. The application
knows what the plugin created because the plugin told it, and removal undoes exactly
that list, data included.

Realms registered by a plugin are held by users and groups the same way core realms
are. A plugin therefore introduces surface that your existing policy has never seen.
See [Permissions and access](/concepts/permissions-and-access/).

## What the guards actually protect

There are guards, and reading them tells you what the threat model is.

The file a hook names is resolved inside that plugin's own directory. A path that
escapes is refused and logged as a security event. A plugin's directory name is
restricted to letters, digits, the underscore, and the hyphen. Registration of hooks and
realms is accepted only from a function whose name looks like an install, upgrade, or
setup routine; a call from anywhere else is refused and logged.

Read those together and the intent is clear. They stop the hook table from being used
as a file inclusion primitive, and they stop a plugin from quietly registering new
attachment points during ordinary page loads.

They do nothing about what the plugin's own code does once it runs. They are not a
containment boundary and were not built as one.

## Disabled is not off

A few hook kinds are registered in an enabled state at install time: the ones that
supply settings pages, configuration arrays, and form definitions. A plugin has to be
configurable before it is turned on, so those run either way.

A disabled plugin therefore still has code being included and executed on some page
loads. Disabling is a feature switch. If you do not trust a plugin, uninstall it and
remove the directory.

## Remote collectors get a narrower surface

A plugin declares its capabilities in its information file: whether it works when the
collector can reach the main install, whether it works when it cannot, and whether it
participates in collection.

On a collector, a hook runs only if it is one of a known set of hooks permitted there
*and* the plugin claims the matching capability. Everything else is skipped and logged.

The reason is that a collector is a different environment. Its configuration is a
replica that may be hours old, and it may have no link to the central database at all.
A hook written on the assumption that the central database is one query away is wrong
there, so the model requires the plugin to say which assumptions it makes rather than
inferring them. See [Remote data collection](/concepts/remote-data-collection/).

## The poller is the expensive place to hook

A hook on the polling path runs every cycle, in every poller process. Slow code there
consumes the interval, and the symptom is gaps in graphs, which nobody attributes to a
plugin.

A hook on a page renders once for one person who is already waiting. The two look the
same in the registration table and differ by orders of magnitude in cost.

## Why the surface looks uneven

There is no designed API underneath this. The set of hooks is the set of places where
something needed one.

That is why the list is wide and irregular, why some points hand you a value to change
and others only tell you an event happened, why the arguments differ in shape from one
hook to the next, and why a plugin's only compatibility statement is the oldest core
version it claims to support. There is no contract for an individual hook, and nothing
tells a plugin that a hook it depends on has changed meaning.

The practical reading: a plugin is coupled to the core version it was written against,
much more tightly than its declared minimum suggests. Re-check plugins before a core
upgrade rather than after.
