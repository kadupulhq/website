---
title: Manage users and permissions
description: How accounts, groups, and per-object permissions fit together, and
  how to build a read-only operator account that actually stays read-only.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 12
slug: 1.2.31/guides/manage-users-and-permissions
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Permissions answer two separate questions, and mixing them up is the source of most
confusion.

1. **Which parts of the interface may this account reach?** Answered by permission
   realms.
2. **Which devices, graphs, and trees may this account see?** Answered by per-object
   permissions and default policies.

An account can hold every realm and still see no graphs. An account can be allowed
every graph and still be unable to reach the console. The two systems do not
substitute for each other.

## A word about the word "realm"

The word is used for two unrelated things.

| Used for | Meaning |
|---|---|
| Authentication realm | Where the account's password is checked: local, web server basic auth, or a named directory |
| Permission realm | A section of the interface the account may reach |

They appear on the same user editing page. When someone says an account is "in the
wrong realm" they almost always mean the first one, and when someone says an account
"is missing a realm" they almost always mean the second.

## Authentication realms

Accounts are local by default. Other authentication methods can be configured for
the installation as a whole: the web server's own basic authentication, a directory
server, or several directory servers at once, each appearing as its own named realm
at the login prompt.

Two settings matter when a directory is in play.

**The template user.** New accounts created on first successful directory login are
copied from a designated template account, taking its realms, its group memberships,
and its policies. Without a template account, new arrivals fall back to the
permissions of the guest account. Set the template account before you enable
directory authentication, not after the first twenty people log in.

**The guest user.** An account nominated to supply permissions for unauthenticated
viewing. Leave it unset unless you want anonymous access, and if you do set it, give
it the narrowest possible realm and policy combination.

Directory authentication controls who gets in. It does not control what they can
see. Everything below still applies.

## Permission realms

A realm is a section of the interface. Holding a realm lets the account open the
pages that belong to it. The two that matter most are:

| Realm | Grants |
|---|---|
| View Graphs | The graph viewer |
| Console Access | The administrative console at all |

Everything else sits behind Console Access. An account that can reach graphs but
holds no Console Access realm has no configuration surface, which is exactly what
you want for most people.

The realm list is grouped into roles you can apply in one action rather than ticking
individually: a normal viewing role, a template editing role, a general
administration role covering devices, graphs, and trees, and a system administration
role covering settings, users, and logs. Roles are a starting point that writes a
set of realms onto the account. They are not a live link, so changing a role later
does not change accounts you already created from it.

Plugins add their own realms. Installing a plugin can grant its realm to the primary
administrator and to whoever installed it, and to nobody else. See
[Install and vet plugins](/1.2.31/guides/install-and-vet-plugins/).

## Per-object permissions

Four kinds of object carry permissions: graphs, devices, graph templates, and trees.

For each kind, an account carries a default policy and a list of exceptions.

| Policy | Meaning |
|---|---|
| Allow | Everything is permitted except the objects listed |
| Deny | Nothing is permitted except the objects listed |

Deny with an explicit list is the setting to reach for. It fails closed: a device
added next month is invisible until someone grants it. Allow with an exception list
fails open, and every new device is visible to everyone with that policy until
someone notices.

### How graph permission is decided

A graph is attached to a device and built from a graph template, so three separate
permissions could apply to it. Which combination counts is an installation-wide
setting with four options.

| Method | A graph is visible when |
|---|---|
| Permissive | The account is allowed the graph, or the device, or the graph template |
| Restrictive | The account is allowed the graph, or both the device and the graph template |
| Device based | The account is allowed the device |
| Graph template based | The account is allowed the graph template |

Permissive is the default and is the one that surprises people. Under permissive,
granting a graph template grants every graph built from it, on every device,
including devices the account was never given. If you intend permissions to follow
devices, choose the device based method and stop maintaining graph level exceptions
entirely.

Device based and graph template based exist because the first two get slow on large
installations. They are also considerably easier to reason about.

## Groups

A group carries the same four policies and the same four exception lists as a user,
and users are placed into it.

Effective access is the union. An account is allowed an object if its own policy and
exception list permit it, or if any group it belongs to permits it. A group cannot
take away something the account already has. If you need to remove access, remove it
from the account and from every group that grants it.

Disabling a group removes its grants from every member at once, which makes a group
a better revocation handle than a pile of individual edits. Disabling an account
clears its cached permissions and its sessions immediately.

Put the permissions on groups. Put people in groups. Per-user exception lists are
where permission models go to rot, because nobody audits a hundred of them.

## Trees and graphs interact

Tree permission and graph permission are checked separately.

Tree permission decides whether the tree appears at all. Graph permission decides
what the account sees once inside it. Being granted a tree does not grant its
contents, and being granted a graph does not require being granted a tree.

Branches containing nothing the account may see are hidden, and the check descends:
a branch whose sub-branches are all empty for this account is itself hidden. The
practical result is that two people looking at the same tree see two different
shapes, and neither sees an empty folder hinting at what they are missing.

This is usually what you want. It also means a tree is a poor auditing tool. To
check what an account can see, inspect its policies and lists, not its tree view.

## The two accounts most installations need

### Read-only operator

The person who watches graphs and does not change anything.

| Setting | Value |
|---|---|
| Realms | View Graphs, and any log viewing or profile realm you want them to have |
| Console Access | Not granted |
| Graph policy | Deny, with the devices or templates they need listed |
| Device policy | Deny, with their devices listed |
| Tree policy | Deny, with their trees listed |
| Group | Yes, grant through a group rather than on the account |

Without Console Access there is no configuration surface to protect, so the
remaining permissions are about scope rather than safety.

### Administrator

Console Access plus the administration roles. Be deliberate about two realms that
are administrative in a stronger sense than the rest: the one covering users and
groups, and the one covering plugin administration. Either lets an account grant
itself everything else.

Grant plugin administration to the smallest possible number of people. A plugin runs
with the privileges of the application, so being able to install one is equivalent
to being able to run arbitrary code.

## Traps

**Permissive graph permission plus a graph template grant.** The most common way an
operator ends up seeing every device in the estate. Check the graph permission method
before you decide what to grant.

**Allow as a default policy.** New objects are visible immediately, to everyone
carrying that policy, with no notification. Use deny.

**Auditing by logging in as the user.** You cannot, and impersonation would defeat
the point. Read the account's four policies and four lists.

**Editing the template account.** Changing it does not retroactively change accounts
already created from it. Those accounts have to be fixed individually, or moved into
a group that carries the correct permissions.

**Revoking by removing one grant.** Access is a union across the account and every
group. Removing it in one place removes nothing if another place still grants it.

**Relying on a disabled account staying gone.** Disabling clears sessions and cached
permissions, but if the account is backed by a directory and the directory still has
the user, review whether a fresh login can recreate it from the template account.
