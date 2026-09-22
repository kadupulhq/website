---
title: Permissions and access
description: Why access is split into two independent systems, why a permission is stored as a default plus exceptions, and why a tree looks different to every account.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 8
---

Access has separate realm and object-policy checks. Realms control which interface
functions an account may use; object policies determine permitted graphs, devices,
templates and trees. A request can depend on both. Realm grants do not themselves
grant graphs, and graph grants do not themselves grant Console functions. Account
state, authentication mode and view settings also matter.

This page explains why the model is shaped that way. For the mechanics of building an
account, see [Manage users and permissions](/guides/manage-users-and-permissions/).

## Why two systems

The two questions are not the same kind of question.

Reaching a page is about code. Either the account may run the device editor or it may
not, and there is one answer for the whole installation. Seeing a device is about
data. There are thousands of devices and the answer differs for each one.

Merging them would mean a permission per page per object, which is the product of two
lists that both grow. Splitting them means one list of interface sections, fixed and
small, and one set of per-object rules. The cost of the split is that both have to be
configured, and an account misconfigured in either one looks broken in the same way.

## Realms are a fixed numbered list

A realm identifies an interface permission by number. Core mappings associate pages
with realms, while plugins can register additional realms. Check the required
realms and identity for the actual route rather than treating page access as a
complete object-authorization decision.

Numbers, rather than filenames, because a realm covers several pages and pages get
renamed. The number survives; the file list behind it is a mapping that can change
without touching any account.

An account's realms come from itself and from enabled groups it belongs to, combined as
a union. Roles are sets of realm numbers applied in one action. A role writes its
numbers onto the account and is then finished: it is a starting point, not a live
link, so an account created from a role does not change when the role does.

Plugins add realms of their own, stored separately and held by accounts exactly like
core realms. A plugin therefore ships new access-controlled surface that your existing
policy must explicitly review. See [Plugins](/concepts/plugins/).

## Objects are stored as a default plus exceptions

Four kinds of object carry permissions: graphs, devices, graph templates, and trees.

For each kind, an account (or a group) holds one default policy and a list of
exceptions. An exception is a single row: who, which object, which kind. The row is
identical in both policy modes. The policy decides what the row means.

This is the load-bearing decision in the whole model. Only divergence from the default
is stored in the exception tables. Allow defaults with no exceptions can grant
broad policy access without exception rows; the account, defaults and realm rows
still exist. Five explicitly allowed devices under a Deny device default require
five device exceptions, but other graph grants and methods can affect visibility. Whichever way the estate
leans, the stored data stays the size of the interesting part rather than the size of
the estate.

## Why both policy modes exist

| Mode | Meaning | Behaviour when a device is added |
|---|---|---|
| Allow, with exceptions | Objects of that kind except listed exclusions | The device policy permits the new object; other checks still apply |
| Deny, with exceptions | Only listed objects of that kind | This source grants no new device; other sources or graph grants may permit access |

The defaults differ in how they handle new objects. Choose the policy scope and
failure behavior deliberately; neither describes the entire request's access checks.

"Everyone in networking, except the two racks that belong to finance" is two rows under
allow and four thousand under deny. "This contractor, and only these five devices" is
five rows under deny and four thousand under allow. Forcing one mode would mean that
half of all real policies could only be written by listing the entire estate, and a
list that long is never maintained.

An Allow default includes newly added objects of its kind unless excluded. A Deny
default requires an explicit exception from that source. These are default-policy
semantics, not guarantees about error handling. Review other users/groups and graph
permission methods before concluding that a Deny device default hides its graphs.

## Access is a union, and there is no deny

Effective access is evaluated for the account's own policy and for every enabled group
it belongs to. For graph access, apply the selected graph method within each source
first, then union those results. Under Restrictive, a device grant in one group
and a template grant in another do not form the required pair.

There is no group deny that overrides a grant from another source. An exclusion
under an Allow default still removes that source's contribution; it is not a global
deny. Removing such an exclusion expands access, unlike removing a grant under Deny. This is a deliberate narrowing: a model with both grants and
denials needs precedence rules, and precedence rules are where permission systems
become impossible to audit by reading them.

The consequences are worth stating plainly.

Revoking access means removing it from the account and from every group that grants
it. Removing it in one place removes nothing if another place still grants it.

Disabling a group removes its grants from every member at once, which makes a group a
better revocation handle than a pile of individual edits.

You cannot answer "what can this account see" by looking at one row. You have to
combine the account's four policies and four lists with the same from each group.

## Why graph permission has four methods

A graph has three identities. It is itself, it belongs to a device, and it was built
from a graph template. All three can carry permissions, so the model has to decide
which combination counts. The decision is one installation-wide setting.

| Method | The question it asks | Exception sets consulted |
|---|---|---|
| Permissive | Is any one of the three allowed? | Three |
| Restrictive | Is the graph allowed, or are both device and template allowed within one source? | Three |
| Device based | Is the graph or the device allowed? | Two |
| Graph template based | Is the graph or the template allowed? | Two |

These rules describe the implemented authorization checks. The Settings help has a
[known discrepancy](https://github.com/kadupulhq/kadupul/issues/222). Direct graph
grants remain effective in all four methods; choosing Device based does not suppress
them. Measure performance with the actual policy and estate rather than assuming
an exception-set count predicts query cost.

Permissive is the default, and it is the setting that surprises people. Under
permissive, allowing a graph template allows every graph built from it, on every
device, including devices the account was never granted. The model is behaving exactly
as described. The description is just not what most people assume.

## Permissions are compiled into queries

Graph-list permission filtering is incorporated into database queries. A page showing twenty of four
thousand graphs cannot fetch four thousand rows and drop the ones the account may not
see, because then the count is wrong, the page boundaries are wrong, and the work
scales with the estate rather than with the page.

So the policies and exception lists are turned into join and where clauses and handed
to the database. The permission model is shaped the way it is partly because it has to
survive that translation. Sets of ids and a default flag compile into SQL. Arbitrary
per-object logic does not.

The graph path has a shortcut for broad graph permissions, including a user's
Allow graph default with no graph exceptions. Do not generalize it to every object
kind or every route. Realm, account-state and view checks still need verification;
permission-query optimization is not a substitute for access testing.

## Trees are a separate axis

Tree permission and graph permission are checked independently. Being granted a tree
does not grant its contents. Being granted a graph does not require being granted a
tree.

A tree is a presentation of objects, not a container that owns them. The same graph
can appear on five trees. If a tree granted its contents, then editing a tree would be
editing permissions, and anyone allowed to organise graphs would be allowed to publish
them.

What the tree does instead is hide what is empty. A branch is shown when it holds
something the account may see, and the check descends: a branch whose sub-branches are
all empty for this account is itself hidden. Two people open the same tree and see two
different shapes, and neither sees a placeholder hinting at what the other has.

That emptiness check is not free. It walks the branch and asks the graph and device
questions for what it finds, recursively. A deep tree and an expensive graph permission
method combine badly, which is another reason the coarse methods exist.

The auditing consequence matters more than the performance one. **A tree view is not a
report of what an account can access.** It is a report of what an account can access
*and someone put on that tree*. To audit access, inspect policies and verify actual
permitted and denied requests. The Effective Policy display has a
[confirmed Restrictive-mode bug](https://github.com/kadupulhq/kadupul/issues/263), so
its label and tooltip cannot be the only evidence. See
[Audit who can see what](/guides/audit-who-can-see-what/).

## Caching, and why changes land at odd moments

Permission answers are cached in the session, because the alternative is re-asking the
same question on every page. An administrator's change marks the affected account's
cached answers stale, and the next page that account loads rebuilds them rather than
waiting for a fresh login.

Disabling an account clears persisted login credentials, cached permissions and
server-side sessions. Protected requests also check enabled/locked state; a page
already loaded in a browser is not erased. Guest-capable routes may resolve a
separate guest identity when configured, so a successful response alone does not
prove the disabled account retains access.

Verify changes using existing and fresh sessions, checking both retained and revoked
access and recording response content and identity. Do not use HTTP status alone
as proof of authorization, or assume that every cache consumer refreshes identically.
