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

An isolated worker would need an explicit interface and validation of its results.
That can preserve privilege isolation, but it is not the mechanism used here: the
plugin file is included and its function is called in the application process.

## What the plugin inherits

Plugin code runs as the calling operating-system account, with access to the process's
database connection and filesystem permissions. A web caller may also have a session;
a CLI caller does not necessarily have one. The plugin mechanism supplies no separate
identity, sandbox, or signature verification.

User and group permissions govern application access; they do not contain arbitrary
plugin PHP. Database grants, filesystem permissions and process restrictions still
limit what that process can do. Review the plugin before installation and keep the
application account's privileges limited.

## Two calling styles

| Style | The application | A plugin that returns nothing |
|---|---|---|
| Notification | Passes arguments, ignores the result | Return value is unused; side effects and exceptions still matter |
| Transformation | Passes a value, uses what comes back | Can replace the value with null and break downstream callers |

The transformation style is what lets a plugin add a button, extend an action list, or
alter a graph. It is also where plugins become entangled: two plugins on the same point
each see the previous one's output in the configured plugin order.

The dispatcher warns about an array becoming a non-array, or a previously nonempty
value becoming null-like, only when multiple matching hook rows are present. That
check is not a complete validation of the hook contract; a single plugin can corrupt
a value without this warning.

## Registration is state, not discovery

Hooks live in a table: which plugin, which hook name, which file, which function,
enabled or not. Install, upgrade and setup routines can register hooks; registration
is not limited to the first installation.

The alternative would be discovery at request time, which means scanning the plugin
directory and including every plugin's code to ask what it wants. A single page reaches
many hook points. Including everything to find out that nothing is attached is the
expensive answer, so the application asks the table, caches the answer for the request,
and includes only the file a matching row names.

That choice has a cost worth knowing. The table can disagree with the filesystem. A
plugin directory deleted by hand leaves its rows behind. Missing notification
callbacks can produce debounced warnings; the transformation dispatcher has no
equivalent missing-callback warning. A quiet log does not prove registration is sound.

Order comes from the plugin's registration order and is adjustable. A transformation
chain is therefore ordered by something an administrator controls.

## What a plugin may reach for

| Capability | Note |
|---|---|
| Create its own tables | Recorded, so uninstall can drop them |
| Add columns to existing tables, core ones included | Recorded, so uninstall can remove them |
| Register permission realms | New access-controlled sections of the interface |
| Declare dependencies on other plugins | Version checked before install |
| Run on remote collectors | Dispatch depends on the hook, calling style, capabilities and connection state |

The recorded schema changes are the reason uninstall is destructive. The application
can drop tracked tables and columns, data included. It also invokes the plugin
uninstall callback before cleanup. That callback can make other changes; untracked
changes are not automatically reversed, and the plugin source directory remains.

Realms registered by a plugin are held by users and groups the same way core realms
are. New realms can also grant access to the primary administrator and current
session user when registration requests it. Review the resulting grants after install
and upgrade; do not assume your existing policy covers the new surface.
See [Permissions and access](/concepts/permissions-and-access/).

## What the guards actually protect

There are guards, and reading them tells you what the threat model is.

The file a hook names is resolved inside that plugin's own directory. A path that
escapes is refused and logged as a security event. A plugin's directory name is
restricted to letters, digits, the underscore, and the hyphen. Registration of hooks and
realms is accepted only from a function whose name looks like an install, upgrade, or
setup routine; a call from anywhere else is refused and logged.

The path guard constrains which file a hook row can include. The registration check
only examines a caller function name for install, upgrade or setup; it does not
authenticate a lifecycle operation. Plugin code can use such a name on an ordinary
page load, so this convention is not a security boundary.

They do nothing about what the plugin's own code does once it runs. They are not a
containment boundary and were not built as one.

## Disabled is not off

A few hook kinds are registered in an enabled state at install time: the ones that
supply settings pages, configuration arrays, and form definitions. A plugin has to be
configurable before it is turned on, so those run either way.

A disabled plugin therefore still has code being included and executed on some page
loads. Disabling is a feature switch, and direct plugin URLs also need review. If you
suspect malicious code, isolate the installation and review the removal procedure
before invoking uninstall, which itself executes plugin code. Removing source files
alone does not clean up registrations or reverse database changes.

## Remote collectors get a narrower surface

A plugin declares its capabilities in its information file: whether it works when the
collector can reach the main install, whether it works when it cannot, and whether it
participates in collection.

On a collector, listed hooks are checked against capability requirements. Unlisted
transformation hooks still dispatch; unlisted notification hooks can dispatch when
online or when the plugin declares offline management/view support. Skips are not
universally logged. This is routing logic, not a blanket allowlist or isolation
boundary; inspect the exact dispatcher and connection state for the hook you use.

The reason is that a collector is a different environment. Its configuration is a
replica that may be hours old, and it may have no link to the central database at all.
A hook written on the assumption that the central database is one query away is wrong
there, so the model requires the plugin to say which assumptions it makes rather than
inferring them. See [Remote data collection](/concepts/remote-data-collection/).

## The poller is the expensive place to hook

A hook on the polling path runs when its call site is reached. Its frequency depends
on the event, process and collector routing; not every hook runs in every process
every cycle. Slow code on a frequent path consumes the polling interval and can
contribute to graph gaps.

A hook on a page renders once for one person who is already waiting. The two look the
same in the registration table and differ by orders of magnitude in cost.

## Why the surface looks uneven

The hook API exposes call sites with different purposes and argument shapes.

That is why the list is wide and irregular, why some points hand you a value to change
and others only tell you an event happened, why the arguments differ in shape from one
hook to the next. A declared minimum core version does not establish compatibility
with every hook: inspect each call site's arguments and return expectations, and
exercise the plugin on the target version. The CLI compatibility and realm-grant
limitations documented in [Install and vet plugins](/guides/install-and-vet-plugins/)
also apply; successful installation alone is not compatibility evidence.

The practical reading: a plugin is coupled to the core version it was written against,
much more tightly than its declared minimum suggests. Re-check plugins before a core
upgrade rather than after.
