---
title: Audit who can see what
description: A procedure for answering "what can this account see" and "who can
  see this device" with evidence, using the effective policy view rather than
  guessing from a tree.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 26
slug: 1.2.31/guides/audit-who-can-see-what
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

This page is about proving an answer, not about designing a policy. For how the model
is built, see [Manage users and permissions](/1.2.31/guides/manage-users-and-permissions/).
For why it is shaped that way, see
[Permissions and access](/1.2.31/concepts/permissions-and-access/).

## Why there is no single lookup

An account's access to one graph is a function of six things: its own default policy,
its own exception list, the default policy of every enabled group it belongs to, those
groups' exception lists, one installation-wide setting that decides which of the
graph's three identities count, and whether authentication is switched on at all.

Access is a union across the account and its groups. A group can only add. No row
anywhere says "denied", so finding one grant does not end the search and finding one
gap does not either.

Reading the four tables and working it out by hand is possible and is a bad idea. The
interface already evaluates the same logic the graph viewer uses, and prints the
result per object. Use that.

## Before you start, write down two things

**Is authentication enabled?** If the installation is set to no authentication, every
permission check returns true for everyone. Nothing else on this page applies. Confirm
this first, because an audit of an installation in that state has exactly one finding.

**Which graph permission method is set?** This is one setting for the whole
installation and it changes what the answer depends on.

| Method | A graph is visible when |
|---|---|
| Permissive | The graph, or the device, or the graph template is allowed |
| Restrictive | The graph is allowed, or both the device and the graph template are |
| Device based | The device is allowed |
| Graph template based | The graph template is allowed |

Under permissive, a single graph template grant makes every graph built from that
template visible on every device. That is the setting most audits are called to
explain. It is also the default.

The setting changes the interface: under device based the template permission tab is
hidden, and under graph template based the device permission tab is hidden. If a tab
you expect is not there, the method is why.

## What can this account see

Open the account and work through its tabs. Each of the permission tabs lists objects
of one kind with an **Effective Policy** column.

| Tab | Answers |
|---|---|
| Permissions | Which sections of the interface the account may open |
| Group Membership | Which groups it belongs to, and which exist that it does not |
| Graph Perms | Per graph: granted or restricted, and by what |
| Device Perms | Per device: granted or restricted, and by what |
| Template Perms | Per graph template: granted or restricted |
| Tree Perms | Per tree: granted or restricted |

The Effective Policy value is the finished answer for that object, not the stored row.
It reads **Granted**, **Restricted**, or **Unknown**, and it carries a reason that names
every principal and level that contributed. A grant from the account itself is labelled
as the user. A grant from a group is labelled with the group's name. Where something
grants and something else restricts, both appear, under **Granted By** and
**Restricted By**.

That reason string is the evidence to record in an audit. "Granted" on its own does not
say which group to edit; the reason does.

Two entries in that column need interpreting.

**Restricted with a grant present.** The account has a grant, and a separate rule is
suppressing the object anyway. The per-account setting that hides disabled devices
produces this: the grant stands, the object is hidden from that account's views.

**Unknown.** No rule reached a conclusion for that object. Treat it as a finding to
investigate rather than as a denial.

### Filtering

Each permission tab filters by name and can show either the whole estate or only the
objects currently associated with the account. The "all objects" view is the one to use
for an audit, because it shows what is not granted as well as what is. The associated
view answers a different question and will not reveal an over-broad default policy.

## Who can see this device

There is no per-device list of accounts. The permission tabs run from an account or a
group outward, never from an object back. So this question is answered by enumeration,
and the order matters if you want it to finish.

1. **Read the installation-wide method.** If it is device based, the device permission
   alone settles it and you can stop after step 3. If it is permissive, a graph
   template grant can reach this device's graphs without any device permission at all,
   so you must also check template grants.
2. **Start with groups, not users.** Groups carry the same four policies and four
   exception lists as accounts, and most real grants live there. For each group, open
   its Device Perms tab and read the device's row. A group that grants it grants it to
   every enabled member.
3. **List the members of every group that granted it.** That is your first set of
   accounts, obtained without looking at any account individually.
4. **Then check accounts with per-account exceptions or a permissive default.** These
   are the ones the group sweep missed. An account whose device policy is allow can see
   the device without any row existing anywhere.
5. **Under the permissive method, repeat for graph templates.** Any account or group
   allowed a template used on this device can see those graphs.
6. **Check the guest account.** If one is nominated, unauthenticated visitors hold its
   permissions, and it will not appear in any list of people.
7. **Check the template account.** It does not itself see anything, but every account
   created by a first directory login is copied from it. If it grants the device, the
   next new arrival gets it.

Steps 6 and 7 are the two that get skipped and the two that produce surprises.

A disabled group grants nothing to anyone, so it can be skipped. A disabled account
holds its grants but cannot use them; whether that counts as access is a decision for
your audit, not for the software. Record it either way.

## Reading the stored data directly

The stored form is small and worth knowing, for spot checks and for bulk reporting.

Default policies live as columns on the account row and on the group row: one each for
graphs, devices, graph templates and trees. Exceptions live in two tables of the same
shape, one keyed by account and one keyed by group, each row naming an object id and a
type.

| Type | Object |
|---|---|
| 1 | Graph |
| 2 | Tree |
| 3 | Device |
| 4 | Graph template |

An exception row means the same thing in both directions and the policy decides which:
under allow it is an exclusion, under deny it is a grant. A row read without its
policy is meaningless, which is the trap in every hand-written audit query.

:::caution[Stored rows are not the answer]
These tables give you the exceptions, not effective access. They cannot tell you what
an account with an allow policy and no rows can see, which is everything. Use them to
find the accounts and groups worth opening, then read the Effective Policy column for
the verdict.
:::

## What the tree does not tell you

A tree hides branches that hold nothing the account may see, and the check descends, so
a branch whose sub-branches are all empty for that account disappears too. Two people
open the same tree and see two different shapes.

**A tree view is therefore not a report of access.** It reports what the account may
see *and* somebody placed on that tree. An object granted but not filed on any tree is
invisible in the tree and fully accessible everywhere else, including in the graph list
and by direct link.

Tree permission and graph permission are also separate axes. Being allowed a tree does
not grant its contents. Being allowed a graph does not require being allowed a tree.
Auditing one tells you nothing about the other. See
[Organize devices with trees](/1.2.31/guides/organize-devices-with-trees/).

Impersonation is not available, so "log in as them and look" is not a method here
either. Read the Effective Policy column.

## After a permissions change

Permission answers are cached in the session. Changing an account's permissions marks
its cached answers stale, and the next page it loads rebuilds them rather than waiting
for a fresh login. Changing a group does the same for every member.

Disabling an account goes further: its stored logins are dropped and its session ends.

Revocation is the case to verify rather than assume. Because access is a union and
nothing denies, removing one grant removes nothing if another grant still stands.

After any change, re-read the Effective Policy column for a sample of the objects you
intended to affect, and for at least one you did not. Confirming the change landed is
half the check; confirming it did not spread is the other half.

## A revocation checklist

| Step | Why |
|---|---|
| Remove the account's own exception rows for the object | The obvious grant |
| Check the account's default policy for that object kind | An allow default grants without any row |
| Repeat for every enabled group the account belongs to | Any one of them restores the access |
| Consider removing the account from the group instead | One edit, and it survives the next change to the group's lists |
| Re-read the Effective Policy for that object | The only evidence that it worked |
| Check the guest account if the object should not be public | It is not in the member list of anything |

Disabling a group removes its grants from every member at once, which makes a group a
better revocation handle than a row of individual edits.

## Failure modes

| Symptom | Cause |
|---|---|
| Everyone can see everything, no rows exist | Authentication is off, or every policy is allow with empty lists |
| An operator sees devices nobody granted them | Permissive method plus a graph template grant |
| Removing a grant changed nothing | A group still grants it |
| A tab is missing from the account page | The graph permission method hides the tab it does not consult |
| The tree looks correct, access is wrong | The tree hides what is empty; it does not report access |
| A new account arrived with permissions nobody assigned | It was copied from the template account on first directory login |
| Anonymous visitors see graphs | A guest account is nominated |
| Effective Policy reads Restricted although a grant exists | A separate rule is suppressing it, such as hiding disabled devices |
| Effective Policy reads Unknown | No rule concluded. Investigate rather than assuming denial |
| An audit of the exception tables missed an account entirely | That account has an allow default and stores no rows |
