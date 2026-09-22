---
title: Manage users and permissions
description: How accounts, groups, and per-object permissions fit together, and how to build a read-only operator account that actually stays read-only.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 12
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
and its policies. If no user can be created and a guest account is configured,
an authenticated arrival can use that guest identity. Without either usable
account, access is denied; guest fallback is not automatic anonymous access. Set the template account before you enable
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

Console Access controls console entry and navigation; it is not an umbrella check
required by every configuration page. Pages also enforce their own mapped realms.
For example, granting Settings can allow its URL even without Console Access.
A viewing account must lack the individual administrative realms as well as
Console Access. Password/profile flows may remain available independently.

The realm list is grouped into roles you can apply in one action rather than ticking
individually: a normal viewing role, a template editing role, a general
administration role covering devices, graphs, and trees, and a system administration
role covering settings, users, and logs. Roles are a starting point that writes a
set of realms onto the account. They are not a live link, so changing a role later
does not change accounts you already created from it.

Plugins add their own realms. Installing a plugin can grant its realm to the primary
administrator and to whoever installed it, and to nobody else. See
[Install and vet plugins](/guides/install-and-vet-plugins/).

## Per-object permissions

Four kinds of object carry permissions: graphs, devices, graph templates, and trees.

For each kind, an account carries a default policy and a list of exceptions.

| Policy | Meaning |
|---|---|
| Allow | Everything is permitted except the objects listed |
| Deny | Nothing is permitted except the objects listed |

Use Deny with an explicit list for limited access, across the user and its enabled
groups. Denying new devices alone does not guarantee their graphs are hidden:
graph/template defaults, direct grants, and the selected graph-permission method
can still allow them. Allow includes new objects automatically unless an applicable
exception excludes them.

### How graph permission is decided

A graph is attached to a device and built from a graph template, so three separate
permissions could apply to it. Which combination counts is an installation-wide
setting with four options.

| Method | A graph is visible when |
|---|---|
| Permissive | The account is allowed the graph, or the device, or the graph template |
| Restrictive | The account is allowed the graph, or both the device and the graph template |
| Device based | The account is allowed the graph or the device |
| Graph template based | The account is allowed the graph or the graph template |

Permissive is the default and is the one that surprises people. Under permissive,
granting a graph template grants every graph built from it, on every device,
including devices the account was never given. If you intend permissions to follow
devices, choose the device based method, set graph defaults to Deny, and remove
unintended graph grants from both the user and its groups. Direct graph grants
remain effective in that mode.

The current Settings help describes Restrictive as requiring all three grants and
omits the graph-grant alternative from Device based and Graph template based. The
table above describes the implemented permission checks; verify actual access when
changing the method. See
[issue #222](https://github.com/kadupulhq/kadupul/issues/222).

Device based and graph template based exist because the first two get slow on large
installations. They are also considerably easier to reason about.

## Groups

A group carries the same four policies and the same four exception lists as a user,
and users are placed into it.

Effective graph access is the union of the results calculated for the user and
each enabled group. In Restrictive mode, the device-and-template combination is
evaluated within each source: a device grant in one group plus a template grant
on the user does not combine into that pair. A group cannot
take away something the account already has. If you need to remove access, remove it
from the account and from every group that grants it.

Disabling a group removes its grants and invalidates members' permission caches;
other grants still apply. Disabling an account clears persisted login credentials,
cached permission rows, and server-side sessions. Protected requests also recheck
whether the account is enabled or locked. A page already loaded in a browser is
not erased by revocation. If guest access is enabled, a revoked session may still
reach guest-capable graph pages as a guest. Check a login-required endpoint and
the guest policy separately when validating revocation.

Put the permissions on groups. Put people in groups. Per-user exception lists are
where permission models go to rot, because nobody audits a hundred of them.

## Trees and graphs interact

Tree permission and graph permission are checked separately.

Tree permission decides whether the tree appears at all. Graph permission decides
what the account sees once inside it. Being granted a tree does not grant its
contents, and being granted a graph does not require being granted a tree.

Tree rendering checks branch contents and descendant branches against the
account's allowed graphs, devices, and sites. Two accounts can therefore see
different tree contents. Do not treat the resulting shape as a complete report of
effective access or assume that hiding a branch revokes direct graph access.

This is usually what you want. It also means a tree is a poor auditing tool. To
check what an account can see, inspect its policies and lists, not its tree view.

## The two accounts most installations need

### Read-only operator

The person who watches graphs and does not change anything.

| Setting | Value |
|---|---|
| Realms | View Graphs; add only specifically reviewed viewing/profile realms |
| Console Access | Not granted |
| Graph policy | Deny, with no direct graph grants unless deliberately needed |
| Device policy | Deny, with their devices listed in the granting user/group |
| Graph template policy | Deny, with grants only where the chosen graph method needs them |
| Tree policy | Deny, with their trees listed |
| Group | Grant through reviewed groups; keep the user's defaults at Deny too |

Check the account's effective realms across all enabled groups. Do not grant
Settings, Users/Groups, template editing, device/graph management, or plugin
administration merely because Console Access is absent. For device-scoped viewing,
use Device based with explicit device grants and no broader direct graph grants.

Validate with a dedicated test account and separate browser session: confirm an
allowed graph, a denied graph, and denied administrative URLs. Test a group grant
and its removal as well as the user's own policies.

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

**Auditing only the policy editor or tree view.** Inspect policies, exception
lists, enabled group memberships, and realms together. Then exercise representative
allowed and denied requests using a dedicated account with the intended grants;
do not borrow another person's password.

**Editing the template account.** Changing it does not retroactively change accounts
already created from it. Those accounts have to be fixed individually, or moved into
a group that carries the correct permissions.

**Revoking by removing one grant.** Access is a union across the account and every
group. Removing it in one place removes nothing if another place still grants it.

**Confusing disabling with deleting a directory account.** An existing disabled
account is rejected; template provisioning applies when an account is absent.
Deleting a directory-backed account can therefore allow it to be provisioned
again if directory authentication and the template configuration still permit it.
Review the external directory and local account together.
