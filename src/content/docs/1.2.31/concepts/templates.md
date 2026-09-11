---
title: Templates
description: How one definition covers a hundred devices, and what happens when
  you change it.
sidebar:
  order: 3
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/concepts/templates
---

Templates exist so that adding the hundredth switch costs the same as adding the
second. There are four kinds, and they stack.

**Data templates** define what to collect and how to store it: the fields, their
types, their bounds, the storage profile, and which input method fetches the
numbers. Every data source created from a data template shares that structure.

**Graph templates** define how to draw it: which items, in which order, which
colours, which legend lines, and what the axis says.

**Device templates** bundle the data queries and graph templates that suit a class
of hardware, so choosing the right one when adding a device does most of the work.

**Data queries** handle the case where you do not know in advance how many things
there are. A switch has some number of ports, discovered by walking the device, and
a data query turns that walk into one data source per port.

## How they stack

The four are not four layers of the same thing. Each names the next one down by
pointing at it.

| Kind | Points at | Produces |
|---|---|---|
| Device template | Graph templates, and data queries | Nothing directly. It is a list of what to offer for a device |
| Data query | A graph template per discovered thing | One data source and one graph per index |
| Graph template | Data template fields, one per graph item | One graph |
| Data template | An input method and a storage profile | One data source, and one file |

Graph items point at data template fields, not at data sources, which is what lets
one graph template serve every device using the data template it references.
Resolving the item to an actual file happens when the graph is created, not when
the template is edited.

## Templated, or per object

Every field a template can control carries a companion flag on the template row.
The flag decides what happens to that field on every child when the template is
saved.

| Flag | Meaning | On save |
|---|---|---|
| Clear | The field is templated | Written down onto every child, overwriting whatever was there |
| Set | The field is per object | Left alone on every child |

The flag is per field. A graph template can push its colours and its axis label
onto a thousand graphs while leaving each one's title and vertical limit to
whoever created it. That mixture is the normal case, not an exception.

Two properties of this design catch people out.

The flag lives on the template, and it decides only what the next save does. Marking
a field per object after a push has already flattened it does not restore anything.
The old per-object values are gone; the flag protects future ones.

The reverse is worse. Clearing the flag on a field that has been per object for
years arms a single save to overwrite that field on every child at once, with the
template's value, which is often a placeholder nobody has looked at.

### Not every field has a flag

A field takes part only if a flag exists for it. At the data source level, four do
and two deliberately do not.

| Field | Flag | Behaviour |
|---|---|---|
| Name | Yes | Templated or per object |
| Active | Yes | Templated or per object |
| Step | Yes | Templated or per object |
| Storage profile | Yes | Templated or per object |
| Input method | No, and marked always templated | The template decides, and no child may differ |
| Path to the RRD file | No, and marked never templated | No push can reach it |

The path is the important absence. A push that rewrote paths would detach every
child from its history in one action, so the mechanism to do it does not exist
rather than being switched off. Re-templating a data source onto a different data
template preserves the path for the same reason.

Fields on a data source item all carry a flag: the field's name, its type, its
heartbeat, its minimum, its maximum, and which input field feeds it.

## Graph inputs are the other direction

A graph template can declare a named input that ties several graph items to one
editable field, so that editing one value on a graph updates every item that shares
it. That is the mechanism behind a single colour or legend setting covering a group
of related items.

The value it pushes is not the template's. It reads the current value off the other
items that belong to the input and pushes that. A graph input therefore propagates
sideways among a graph's own items rather than downward from the template, which is
why editing one can change a graph that the template has not touched.

## What propagates, and when

| Change | Reaches existing objects | How |
|---|---|---|
| Graph template field, templated | Yes, on save | Written onto every graph from that template |
| Graph template field, per object | No | The child keeps its own value |
| Graph item appearance | Yes, on save | Colour, transparency, item type, line width, dashes, CDEF, VDEF, shift, consolidation function, alignment, text and legend format |
| Graph item added, removed or repointed at another field | Yes, on save | Every child's item list is rebuilt, matching items by the template item they came from and adding whatever is missing |
| Data template field, templated | Yes, on save | Written onto every data source from that template |
| Data template input field values | Yes, on save | Except the data query index fields, which must stay per data source |
| Data template storage profile, step, archives | Database only | Existing files keep the structure they were created with |
| Fields added to a data template | Database only | Existing files have nowhere to put them |
| Device template contents | No | Nothing happens to existing devices until you re-apply it |

The split in that table is the whole page. Everything that is only a database row
propagates. Everything that is a decision baked into a file on disk does not.

## Device templates do not propagate at all

A device template is a list of associations, and associating is a one-time act
performed when a device is created or re-templated. Adding a graph template to a
device template changes what the next device offers and does nothing to the four
hundred devices already using it.

Re-applying a device template across existing devices is a separate, explicit
operation. It adds any missing data query and graph template associations, runs the
data queries, and stops there. It adds and never removes. Taking a graph template
out of a device template and re-applying it does not delete a single graph.

That is the safe behaviour, and it is also why a device template drifts. What a
device has is the union of every version of the template it has ever been through,
plus anything added by hand.

## Indexes, and why ports move

A data query has to decide which discovered thing matches which existing data source.
That is the index. Index by the SNMP table position and a card reseat renumbers
everything, silently attaching three months of port 3 history to what is now port 7.
Index by something stable, such as the interface name, and it survives.

This decision looks trivial when you make it and expensive when you get it wrong.
It is also made per device per run rather than once for the query, so two identical
switches can end up keyed on different fields. How the field is chosen, what
happens when an index disappears, and what it costs to detect renumbering are in
[Data queries and indexes](/1.2.31/concepts/data-queries-and-indexes/).

## Changing a template later

Changes to how a graph is drawn apply immediately, because graphs are rendered on
demand. There is no stored image to invalidate and no migration to run. A colour
changed on a template is a colour changed on every graph the next time anyone looks.

Changes to how data is stored do not apply at all. The structure was fixed when each
RRD file was created, and the create path refuses to touch a file that exists.
Changing the data template changes what new files look like, and leaves existing
files exactly as they were.

The database and the files then disagree, and both readings of the truth are used
for different things. The file decides what is stored. The database row decides what
the interface tells you is stored. Kadupul's file audit exists to report that
disagreement rather than to paper over it.

Reconciling the two means rebuilding the files and accepting the loss of history,
which is a decision to make deliberately rather than discover. What a rebuild costs,
and what the archive layout buys you in the first place, is in
[Data sources and round-robin archives](/1.2.31/concepts/data-sources-and-rras/).

## Other things called templates

Four more objects carry the word and do not behave like the four above. Colour
templates are named palettes applied to graph items. Aggregate templates describe
how several graphs combine into one. Automation templates match discovered devices
to a device template. Graph preset definitions supply reusable legend formats.

None of them sit in the stack described here. They are worth knowing about mainly
so that a search result mentioning a template is read as the right kind.
