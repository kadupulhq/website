---
title: Organize devices with trees
description: How to structure graph trees so navigation and permissions still work at a few thousand devices, and where to model site and location instead.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 4
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A tree is how people find a graph. At twenty devices any structure works. At two
thousand, the structure you chose is the whole experience, and it is also the thing
standing between a contractor and every device you own.

Decide both at once. Retrofitting permissions onto a hierarchy built for browsing is
the expensive version of this task.

## What a tree is made of

A tree is a named, ordered set of nodes. Keep nesting shallow enough to browse;
the creation paths reviewed here do not enforce a 30-level limit. There are four
kinds of content.

| Node | Holds | Behaviour |
|---|---|---|
| Header | A title | A folder. Groups other nodes and nothing else |
| Site | A reference to a site record | Expands to that site's devices, grouped by device template |
| Device | A reference to one device | Expands to that device's graphs |
| Graph | A reference to one graph | A leaf |

Header and graph nodes are static. You put something in, it stays there. Site and
device nodes are references, and they show whatever the referenced thing currently
has. That difference decides how much maintenance the tree costs you.

## Prefer nodes that maintain themselves

A header called "Amsterdam" containing thirty device nodes is thirty pieces of
maintenance. Every new device is a tree edit, and the edit is the step people forget.

A site node pointing at the Amsterdam site is one node. It lists the devices assigned
to that site, grouped by device template, and a device added to the site appears
without anyone touching the tree.

The same applies one level down. A device node expands into that device's graphs on
its own. Adding individual graph nodes gives you control over ordering and costs you
a tree edit every time a graph is created.

Build with site and device nodes. Reach for graph nodes only for a deliberately
curated view, such as a dashboard branch that should hold six specific graphs and
never grow.

## Model location as a site, not a header

A site is a record, not a label. It carries a name, a street address, city, state,
postal code, country, timezone, and coordinates.

Devices can have a site assignment or remain unassigned. They also have a free-text location field, which is
short and unvalidated, and an external identifier field for tying the device to
whatever inventory system is the source of truth.

Put the physical place in the site record. Use the location field for the position
inside the site, the rack or the room. The tree then references the site, and the
address only exists once.

Modelling a site as a header branch works and costs you the address, the coordinates,
the automatic device listing, and the ability to ask which devices are in Amsterdam
without parsing a tree.

## Device grouping style

A device node groups its graphs one of two ways, chosen per node.

| Style | Result |
|---|---|
| Graph Template | Graphs grouped by what they are: traffic, errors, disk |
| Data Query Index | Graphs grouped by which thing they measure: one branch per port |

Graph Template suits a server, where there are a dozen graphs of different kinds.
Data Query Index suits a switch, where there are four hundred graphs of four kinds
and you want to open a port rather than open a category.

## Sorting

Each node sets how its children are ordered: inherit from the parent, manual, or
alphabetic, natural, or numeric ordering.

The CLI defaults new nodes to alphabetic child sorting, even when the tree uses
natural sorting. Pass `--sort-method=natural` for headers whose children should
use that order. The web editor also supports inheritance.

Natural ordering is the one to reach for with equipment names. Alphabetic puts
`port10` before `port2`. Natural does not. Manual ordering is worth the effort at the
top level, where you want a fixed order that matches how people think, and is not
worth it lower down.

## Permissions, and the shape they force

Four kinds of object can be granted: trees, devices, graphs, and graph templates.
Each user and each group carries a default policy per kind, and the grants are
exceptions to it.

| Policy | Grants mean |
|---|---|
| Allow | Everything is visible except the listed items |
| Deny | Nothing is visible except the listed items |

The part that shapes your hierarchy: **a tree is granted whole.** There is no grant
on a branch. If a user can see the tree, they can see the tree.

Content has a second permission filter. Device nodes are checked against device
access, graph content against graph access, and empty header branches can be
pruned. Site nodes list the viewer's allowed devices, but a site label can remain
even when its device list is empty. Do not treat an empty or hidden navigation
branch as proof that a graph URL is inaccessible; test access with the intended
account.

Two consequences follow.

**Use device grants for content, with tree access for navigation.** A shared tree
pruned per viewer can avoid maintaining duplicate structures. Device grants do not
replace the tree grant or the Graphs viewing realm, and direct graph grants can
still expose content beyond the allowed devices.

**Use a separate tree only when the shape differs, not when the content does.** A
network operations tree organised by site and a capacity planning tree organised by
device role are two shapes over the same devices, and both are worth having. A
"customer A tree" that is the shared tree with everything else removed is a
maintenance burden that device permissions already handle.

## Graph permission method

One system-wide setting decides how the three graph-level grants combine.

| Method | A user sees a graph when |
|---|---|
| Permissive | They have access to the graph, the device, or the graph template |
| Restrictive | They have access to the graph, or both the device and graph template |
| Device Based | They have access to the graph or the device |
| Graph Template Based | They have access to the graph or the graph template |

Permissive is the default. The setting's own description records that Permissive and
Restrictive both have scalability problems on very large installs, because both
evaluate all three permission categories. Device Based can simplify device-oriented
access, but direct graph grants remain effective. Set graph defaults to Deny and
remove unintended graph grants from the user and every enabled group if content
should follow device permissions.

These formulas correct the Settings help tracked in
[#222](https://github.com/kadupulhq/kadupul/issues/222). Effective access combines
the user's result with results from enabled groups. See
[Manage users and permissions](/guides/manage-users-and-permissions/) for the
group rules and access checks.

Decide this before you start granting, because changing it later changes what every
existing user can see.

## Building it from the command line

Tree construction is repetitive and worth scripting.

```bash
php cli/add_tree.php --type=tree --name='Operations' --sort-method=natural
```

Use the returned tree ID and the IDs from the list commands in subsequent calls.
The following IDs are examples, not values to copy unchanged:

```bash
php cli/add_tree.php --type=node --node-type=header --tree-id=2 \
  --name='Europe' --sort-method=natural
php cli/add_tree.php --type=node --node-type=host --tree-id=2 --parent-node=5 \
  --host-id=42 --host-group-style=2
```

**Create site nodes in the web tree editor for now.** The advertised
`--node-type=site --site-id=ID` command rejects `--site-id`. The CLI also lacks the
site type mapping, and its generic save helper does not persist the site ID.
The editor's site-copy path does preserve it. Tracked in
[#235](https://github.com/kadupulhq/kadupul/issues/235).

**Verify parent IDs before creating nodes.** The CLI currently accepts a missing
parent and reports success while storing an orphan node. Use `--list-trees` and
`--list-nodes --tree-id=ID` to resolve IDs, confirm the parent belongs to the target
tree, and inspect the resulting node. Tracked in
[#236](https://github.com/kadupulhq/kadupul/issues/236).

Permissions the same way.

```bash
php cli/add_perms.php --user-id=7 --item-type=host --item-id=42
```

The list options on both scripts print the identifiers you need. Treat
`add_perms.php` as adding an exception to the account's configured policy: under
Allow, a listed item is excluded; under Deny, it is included. Check defaults and
group membership before interpreting the result as a grant.

## A structure that holds up

A shape worth starting from, for an installation that expects to grow:

- Top level: how the organisation is split. Region, business unit, or customer.
- Second level: site nodes. One per physical place.
- Inside a site: device nodes, grouped by device template automatically.
- Device nodes: Data Query Index for anything with many ports, Graph Template for
  everything else.
- One extra tree per genuinely different question, such as a role-based or
  service-based view.
- Permissions on devices, with the graph permission method set to Device Based.

The test of a structure is whether adding a device requires a tree edit. If it does,
the structure will drift, because at some point somebody will skip the edit.
