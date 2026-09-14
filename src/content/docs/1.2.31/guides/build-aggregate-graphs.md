---
title: Build aggregate graphs
description: Combine many graphs into one, choose between a stacked view and a
  total, and keep the result honest when members are added and removed over
  time.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 16
slug: 1.2.31/guides/build-aggregate-graphs
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

An aggregate graph draws several existing graphs on one canvas. It stores no data of
its own. Every line on it is read from the member data sources when the image is
drawn, which is what makes aggregates cheap to build and slow to trust.

## When it helps

Aggregation is worth it when the question is about the set rather than the members.
Total egress across six uplinks. Every port on a stack in one picture. Free space
across a storage tier. If the question is "which one", you want a page of small
graphs instead, because an aggregate of forty ports is forty lines and nobody reads
forty lines.

## Two hard constraints

**Every member must use the same graph template.** Selecting graphs from two
different templates is refused, and the refusal lists the templates so you can see
which one is the odd one out.

**Non-templated graphs cannot be aggregated.** A graph built by hand, with no graph
template behind it, is not a candidate. Convert it to a template first, or rebuild
it from one.

Both checks run before anything is created, so you find out at selection time.

## How the graph is assembled

The member graphs' items are copied into one new graph, member by member, in the
order you selected them. Each copied item is disconnected from its source template,
so editing the original template later does not reach into the aggregate.

Some items are dropped in the copy. Horizontal rules are not carried over, because a
rule per member is meaningless. Percentile comment lines are dropped for the same
reason.

You get a per-item table of controls, applied to the corresponding item of every
member:

| Control | Effect |
|---|---|
| Skip | The item is not copied at all |
| Total | The item takes part in the totalling calculation |
| Color template | Colours are assigned per member from a list |
| Graph item type | Override AREA, LINE1, LINE2, LINE3, STACK per item |
| CDEF | Apply a maths function to every member's copy of that item |

Plus one conversion applied to the whole graph:

| Graph type | Result |
|---|---|
| Keep Graph Types | Members keep the types their template gave them |
| Keep Type and STACK | First member as-is, the rest stacked onto it |
| Convert to AREA/STACK | First member an area, the rest stacked |
| Convert to LINE1, LINE2, LINE3 | Every member an overlaid line of that width |
| Convert to LINE1/STACK, LINE2/STACK, LINE3/STACK | Stacked, drawn with visible line edges |

## Totals against stacks

These answer different questions and they are not interchangeable.

A **stack** shows composition. Each member is drawn on top of the one below, so the
top edge is the sum and each band's thickness is one member's contribution. You can
see which member is responsible for a change.

A **total** adds a computed series whose value is the sum across members. It is one
line, and it tells you the aggregate figure without saying where it came from.

You can have both, and the totalling settings decide what appears in the legend:

| Totals setting | Legend shows |
|---|---|
| No Totals | Only the members |
| Print All Legend Items | Every member's legend and the totalling lines |
| Print Totaling Legend Items Only | Only the totalling lines |

With totals turned on, there is a second choice: total similar data sources, or
total all of them. On a traffic graph, "similar" sums inbound with inbound and
outbound with outbound, giving two totals. "All" sums every data source on the graph
into one number, which on the same traffic graph adds inbound to outbound and gives
you a figure that is rarely what anyone wanted.

Totalling works by rewriting the CDEF on each participating item so it operates over
the matching set of data sources rather than its own, and that rewrite is applied to
the legend items too, so the printed numbers are the totals rather than one member's
value.

"Totals only" deserves an explanation, because the graph still has to read the member
data to add it up. The member items are kept as data definitions and given a system
CDEF that multiplies them by zero, so they contribute to the total and draw nothing.
If you ever see an unexplained CDEF named `_MAKE 0` in the list, that is what it is
for. Do not delete it.

## Legends

A member's legend text is prefixed so you can tell the members apart. The default
prefix is the device description, which is usually what you want when the members
are one graph per device. When the members are ports on one device, change it to a
data query field so the legend reads the port name.

The available substitution tokens are listed on the creation form, built from the
input fields of the data query behind the graph template.

With "total all data sources" selected, the prefix replaces the member's legend text
rather than being added to it, because each member's own label is not meaningful
once everything has been summed into one number.

Two legend tokens are rewritten during assembly. A current value becomes an
aggregate current or an aggregate sum, and a maximum becomes an aggregate peak or an
aggregate sum peak, depending on the totalling type. This is why a legend on an
aggregate can print a different statistic from the one the member graph printed with
what looks like the same format string.

## Colours

A colour template is a list of colours, and members take them in order. When there
are more members than colours in the template, the list wraps around and colours
repeat. Two members sharing a colour on a forty-line graph is not a bug you can fix
by reordering; it is a template that is too short.

An item with no colour template keeps the colour its source graph had, which on a
set of identically-templated graphs means every member is the same colour. That is
the single most common reason a new aggregate is unreadable.

See [Tune graph appearance](/1.2.31/guides/tune-graph-appearance/) for contrast and
opacity.

## Members come and go

This is where aggregates go wrong quietly.

**The member list is explicit.** It is a stored list of graphs, not a query. A new
port discovered next week, or a new device matching the same template, does not
join. Somebody has to add it. An aggregate labelled "all uplinks" is only all uplinks
on the day it was built.

**The graph has no history of its own.** Every line is read from member data sources
at draw time. Add a member today and last month's total changes, because last month
is recomputed from the members present now. Remove a member and its past disappears
from the picture entirely. The graph is always an answer about the current
membership, applied to the whole time axis.

Say so on the graph if the membership changes often. A title that names the set and
the date it was last reviewed saves an argument later.

**Any change rebuilds every item.** Adding or removing a member, or pushing an
aggregate template, deletes the aggregate's graph items and re-creates them from the
member list. Anything you hand-edited on the aggregate's own items is gone. Make the
change through the aggregate's settings, which are stored and re-applied, rather than
by editing the resulting items.

**A deleted member leaves debris until it is pruned.** When a member graph is
deleted, the membership row and the now-dangling items are removed by a cleanup pass
rather than at once. Between the two, the aggregate can render short or produce an
error from the graphing tool.

**Unknowns punch through a stack.** A member that stops reporting records unknown,
not zero, and a stack containing an unknown drops for that interval. The graph
appears to show a sudden fall in total traffic when what happened is that one poll
failed. Check the members before believing a cliff edge. See
[Read your first graph](/1.2.31/start/first-graph/) on gaps against zeroes.

## Ordering

The item order decides the stacking order and the legend order. Four options:

| Order | Groups by |
|---|---|
| No Reordering | Selection order, items copied member by member |
| Data Source, Graph | All members' first data source, then all members' second |
| Graph, Data Source | Each member's full item set together |
| Base Graph Order | The order the source graph template defines |

On a traffic aggregate, data-source-first groups every inbound line together and
every outbound line together, which is usually easier to read than alternating.

## Templates

An aggregate template holds the settings above so several aggregates can share them.
Changing the template pushes the settings out to every aggregate using it, which
rebuilds each one's items.

An aggregate created without a template can be migrated onto one later, but only
when the aggregates being migrated all use a single graph template and a matching
aggregate template already exists. An aggregate can also be converted back to a
normal graph, which detaches it from the aggregate machinery and leaves the items
where they are.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Selection refused before anything is created | Members span two graph templates, or are not templated at all |
| Every line the same colour | No colour template chosen on the drawn items |
| Colours repeat across members | More members than the colour template holds |
| Total is roughly double what it should be | Total all data sources on a graph that has both directions |
| Legend prints a different statistic than the member graph did | Aggregate rewrote the current and maximum tokens |
| Hand edits to the aggregate's items vanish | A member change or template push rebuilt every item |
| A historic total changed without anyone touching history | Membership changed; the graph is recomputed from current members |
| Sudden cliff in a stacked total | One member recorded unknown for those intervals |
| Graph errors after a device was deleted | Dangling member items awaiting the cleanup pass |
