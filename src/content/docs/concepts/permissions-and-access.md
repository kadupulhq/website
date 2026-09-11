---
title: Permissions and access
description: Why access is split into two independent systems, why a permission is stored as a default plus exceptions, and why a tree looks different to every account.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 8
---

Access is two systems that do not talk to each other. One decides which parts of the
interface an account may open. The other decides which devices, graphs, and trees an
account may see. Holding every realm grants no graphs. Being allowed every graph
opens no console.

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

A realm is a section of the interface, identified by a number. Pages ask whether the
current account holds their realm number. That is the whole mechanism.

Numbers, rather than filenames, because a realm covers several pages and pages get
renamed. The number survives; the file list behind it is a mapping that can change
without touching any account.

An account's realms come from itself and from every group it belongs to, combined as
a union. Roles are sets of realm numbers applied in one action. A role writes its
numbers onto the account and is then finished: it is a starting point, not a live
link, so an account created from a role does not change when the role does.

Plugins add realms of their own, stored separately and held by accounts exactly like
core realms. A plugin therefore ships new access-controlled surface that your existing
policy says nothing about. See [Plugins](/concepts/plugins/).

## Objects are stored as a default plus exceptions

Four kinds of object carry permissions: graphs, devices, graph templates, and trees.

For each kind, an account (or a group) holds one default policy and a list of
exceptions. An exception is a single row: who, which object, which kind. The row is
identical in both policy modes. The policy decides what the row means.

This is the load-bearing decision in the whole model. Only divergence from the default
is stored. An installation where everyone sees everything stores nothing. An account
allowed five devices out of four thousand stores five rows. Whichever way the estate
leans, the stored data stays the size of the interesting part rather than the size of
the estate.

## Why both policy modes exist

| Mode | Meaning | Behaviour when a device is added |
|---|---|---|
| Allow, with exceptions | Everything except the listed objects | The new device is immediately visible |
| Deny, with exceptions | Nothing except the listed objects | The new device is invisible until granted |

Neither mode is a safer version of the other. They describe different shapes.

"Everyone in networking, except the two racks that belong to finance" is two rows under
allow and four thousand under deny. "This contractor, and only these five devices" is
five rows under deny and four thousand under allow. Forcing one mode would mean that
half of all real policies could only be written by listing the entire estate, and a
list that long is never maintained.

The trade is in the failure direction. Allow fails open. Deny fails closed. That is
not a defect of allow; it is the price of being able to express "everything except" at
all. Choose deny when you can express what you want with it, and understand that
choosing allow means accepting that tomorrow's device is visible today.

## Access is a union, and there is no deny

Effective access is evaluated for the account's own policy and for every enabled group
it belongs to, and an object is permitted if any one of them permits it.

A group can only ever add. There is no way to say "allowed everywhere, except by
members of this group". This is a deliberate narrowing: a model with both grants and
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
| Restrictive | Are the required ones all allowed? | Three |
| Device based | Is the device allowed? | One |
| Graph template based | Is the template allowed? | One |

The first two are the expressive ones and the source describes them as having
scalability problems on very large installations. The last two exist as an escape from
that cost. They also happen to be far easier to reason about, which is the more useful
reason to choose one.

Permissive is the default, and it is the setting that surprises people. Under
permissive, allowing a graph template allows every graph built from it, on every
device, including devices the account was never granted. The model is behaving exactly
as described. The description is just not what most people assume.

## Permissions are compiled into queries

Every list in the interface is a paginated query. A page showing twenty of four
thousand graphs cannot fetch four thousand rows and drop the ones the account may not
see, because then the count is wrong, the page boundaries are wrong, and the work
scales with the estate rather than with the page.

So the policies and exception lists are turned into join and where clauses and handed
to the database. The permission model is shaped the way it is partly because it has to
survive that translation. Sets of ids and a default flag compile into SQL. Arbitrary
per-object logic does not.

One shortcut follows directly. An account whose policy is allow and which holds no
exceptions of that kind can see everything of that kind, and the whole construction is
skipped. The simplest policy is also the cheapest, which is a large part of why most
installations never notice any of this.

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
*and someone put on that tree*. To audit access, read the policies and the lists.

## Caching, and why changes land at odd moments

Permission answers are cached in the session, because the alternative is re-asking the
same question on every page. An administrator's change marks the affected account's
cached answers stale, and the next page that account loads rebuilds them rather than
waiting for a fresh login.

Disabling an account goes further: its stored logins are dropped and its session ends.

This is why a permission change sometimes appears to take effect instantly and
sometimes appears to take effect on the next click. Both are the same mechanism.
