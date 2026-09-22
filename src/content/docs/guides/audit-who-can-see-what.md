---
title: Audit who can see what
description: A procedure for answering "what can this account see" and "who can see this device" with evidence, using the effective policy view rather than guessing from a tree.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 26
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

This page is about proving an answer, not about designing a policy. For how the model
is built, see [Manage users and permissions](/guides/manage-users-and-permissions/).
For why it is shaped that way, see
[Permissions and access](/concepts/permissions-and-access/).

## Why there is no single lookup

An account's access to one graph is a function of six things: its own default policy,
its own exception list, the default policy of every enabled group it belongs to, those
groups' exception lists, one installation-wide setting that decides which of the
graph's three identities count, and whether authentication is switched on at all.

Effective graph policy is a union across the account and enabled groups. An enabled
group can add access but cannot override another source's grant. Exception rows can
exclude objects under an Allow default or grant them under a Deny default. Audit
all contributing sources before planning revocation.

Use the permission views to locate relevant policies and contributors, then verify
actual access. The display and authorization code are separate implementations:
a [confirmed Restrictive-mode display bug](https://github.com/kadupulhq/kadupul/issues/263)
can invert the Graph Perms result when the template policy defaults to Deny. Neither
the label nor its tooltip is sufficient audit evidence on its own.

## Before you start, write down two things

**Is authentication enabled?** If the installation is set to no authentication, every
ordinary graph-policy checks bypass per-user restrictions. Record the exposed
routes and the installation's operating mode before interpreting user policies;
this does not establish that every application check or external control is bypassed.

**Which graph permission method is set?** This is one setting for the whole
installation and it changes what the answer depends on.

| Method | A graph is visible when |
|---|---|
| Permissive | The graph, or the device, or the graph template is allowed |
| Restrictive | The graph is allowed, or both the device and the graph template are |
| Device based | The graph or the device is allowed |
| Graph template based | The graph or the graph template is allowed |

Under permissive, a single graph template grant makes every graph built from that
template visible on every device. That is the setting most audits are called to
explain. It is also the default.

In Restrictive mode, evaluate each source separately: a device grant on one group
and a template grant on another do not form the required pair. Direct graph grants
remain effective in every method. The current Settings help also has a
[known wording defect](https://github.com/kadupulhq/kadupul/issues/222).

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

The Effective Policy value is a computed explanation, not a raw exception row.
It can read **Granted**, **Restricted**, or **Unknown**, with contributing policy
information. Because the display has a known mismatch with authorization, treat
it as a diagnostic aid rather than a certified verdict. A grant from the account itself is labelled
as the user. A grant from a group is labelled with the group's name. Where something
grants and something else restricts, both appear, under **Granted By** and
**Restricted By**.

Record the reason string together with default policies, exception rows, enabled
groups, permission method, tested account and actual access results. The reason can
help identify a policy to inspect, but a misleading tooltip can name a grant that
does not actually authorize the graph.

Two entries in that column need interpreting.

**Restricted with a grant present.** The account has a grant, and a separate rule is
suppressing the object anyway. The per-account setting that hides disabled devices
produces this: the grant stands, the object is hidden from that account's views.

**Unknown.** The display did not produce a grant/restriction explanation. Investigate
the underlying inputs and verify access; it is not a reliable authorization result.

### Filtering

Each permission tab filters by name and can show either the whole estate or only the
objects currently associated with the account. The "all objects" view is the one to use
for an audit, because it shows what is not granted as well as what is. The associated
view answers a different question and will not reveal an over-broad default policy.

## Who can see this device

There is no per-device list of accounts. The permission tabs run from an account or a
group outward, never from an object back. So this question is answered by enumeration,
and the order matters if you want it to finish.

1. **Define the object and operation.** Viewing a device's graphs is different from
   opening or editing its Console record. List the graph IDs and routes in scope;
   check realms, enabled/locked state and view settings as well as object policy.
2. **Read the installation-wide method.** Use the table above. Direct graph grants
   matter in every method; device permission alone does not settle all cases.
3. **Enumerate enabled groups and members.** Inspect their defaults and graph,
   device and template exceptions. Apply the method within each source, then union
   the results. A device grant alone is insufficient in Restrictive mode.
4. **Inspect each candidate account's own policies.** Include Allow defaults without
   exception rows and direct graph grants; a groups-only sweep misses these.
5. **Verify actual graph access.** Use a dedicated test account with the relevant
   policy and a separate browser session. Test allowed and denied graph IDs through
   the list and direct routes, and inspect content. Record which identity served
   the request; HTTP 200 alone can also contain a denial or login page.
6. **Check guest access separately.** Inspect the configured guest identity and
   test guest-capable routes without an authenticated session. A nominated guest
   does not imply that every route permits anonymous access.
7. **Inspect account-provisioning templates.** Directory/domain settings can choose
   template identities for new accounts. Record the applicable template and test
   the provisioning path in isolation; do not assume every new login copies the
   same account or that later template edits change existing users.

Steps 6 and 7 are the two that get skipped and the two that produce surprises.

A disabled group grants nothing to anyone, so it can be skipped. A disabled account
may retain policy configuration while authenticated access is revoked. Record
configured entitlement separately from usable access, and check any guest fallback
without attributing that guest response to the disabled identity.

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
an account with an Allow default and no exceptions can see without also evaluating
that default, the selected method and other controls. Use rows and defaults to
identify cases to test; corroborate the Effective Policy display with actual access.
:::

## What the tree does not tell you

A tree hides branches that hold nothing the account may see, and the check descends, so
a branch whose sub-branches are all empty for that account disappears too. Two people
open the same tree and see two different shapes.

**A tree view is therefore not a report of access.** It reports what the account may
see *and* somebody placed on that tree. An object granted but not filed on any tree is
absent from that tree but may remain accessible through permitted list or direct
routes. Realm/view controls and actual graph authorization still apply.

Tree permission and graph permission are also separate axes. Being allowed a tree does
not grant its contents. Being allowed a graph does not require being allowed a tree.
Auditing one tells you nothing about the other. See
[Organize devices with trees](/guides/organize-devices-with-trees/).

The administration UI is not a substitute for an authenticated test session. Use an
authorized dedicated account or a cooperating user's session without sharing their
password. Record both positive and negative cases, and do not rely solely on the
Effective Policy column.

## After a permissions change

Permission answers are cached in the session. Changing an account's permissions marks
its cached answers stale, and the next page it loads rebuilds them rather than waiting
for a fresh login. Changing a group does the same for every member.

Disabling an account goes further: its stored logins are dropped and its session ends.

Revocation is the case to verify rather than assume. Because access is a union and
other sources may still grant access, removing one grant may leave access unchanged.
Also distinguish removing a grant under Deny from removing an exclusion under Allow:
the latter expands access.

After any change, inspect stored/default policy and display explanations, then test
actual access for an intended revocation, a retained grant and an unrelated object.
Check an existing session as well as a fresh login and a guest-capable route where
applicable. Keep the identity and response-content evidence with the audit.

## A revocation checklist

| Step | Why |
|---|---|
| Interpret each exception before editing it | Removing an Allow-default exclusion grants access; removing a Deny-default exception revokes that source |
| Check the account's default policy for that object kind | An allow default grants without any row |
| Repeat for every enabled group the account belongs to | Any one of them restores the access |
| Consider removing the account from the group instead | One edit, and it survives the next change to the group's lists |
| Compare policy evidence with actual permitted and denied requests | The display can disagree with authorization |
| Check guest identity, groups and guest-capable routes | Anonymous access is a separate path to verify |

Disabling a group removes its grants from every member at once, which makes a group a
useful revocation mechanism when those group grants are the intended scope. Other
user/group grants can still authorize access; verify the resulting requests.

## Failure modes

| Symptom | Cause |
|---|---|
| Everyone can see everything, no rows exist | Authentication is off, or every policy is allow with empty lists |
| An operator sees devices nobody granted them | Permissive method plus a graph template grant |
| Removing a grant changed nothing | Another user/group source still grants it, or the edit removed an exclusion instead |
| A tab is missing from the account page | The graph permission method hides the tab it does not consult |
| The tree looks correct, access is wrong | The tree hides what is empty; it does not report access |
| A new account arrived with permissions nobody assigned | It was copied from the template account on first directory login |
| Anonymous visitors see graphs | A guest account is nominated |
| Effective Policy disagrees with expected access | Check hide-disabled behavior and the known Restrictive display defect; verify requests |
| Effective Policy reads Unknown | No display explanation was produced; investigate and verify actual access |
| An audit of the exception tables missed an account entirely | That account has an allow default and stores no rows |
