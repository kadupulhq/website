---
title: Templates
description: How one definition covers a hundred devices, and what happens when you change it.
sidebar:
  order: 3
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Templates exist so that adding the hundredth switch costs the same as adding the
second. There are four kinds, and they stack.

**Data templates** define what to collect and how to store it: the fields, their
types, their bounds, the storage profile, and which input method fetches the
numbers. Per-object fields and existing RRD files can differ from the current
template; the template is not proof of the file layout.

**Graph templates** define how to draw it: which items, in which order, which
colours, which legend lines, and what the axis says.

**Device templates** bundle the data queries and graph templates that suit a class
of hardware, so choosing the right one when adding a device does most of the work.

**Data queries** handle the case where you do not know in advance how many things
there are. A switch has some number of ports, discovered by walking the device, and
a data query records indexed results for graph creation. Discovery alone does not
create a fixed number of graphs or data sources.

## How they stack

The four are not four layers of the same thing. Each names the next one down by
pointing at it.

| Kind | Points at | Produces |
|---|---|---|
| Device template | Graph templates, and data queries | Nothing directly. It is a list of what to offer for a device |
| Data query | Graph definitions and mappings for indexed results | Discovered rows; selected graph creation can create or reuse data sources |
| Graph template | Data template fields where an item needs data | A graph that can reference multiple data sources |
| Data template | An input method and a storage profile | Data-source metadata; an RRD is created when the write path needs it |

Data-bearing template items refer to template fields; instantiated items are mapped
to local fields. Text and constant items need not have a data-source reference.
Graph creation resolves those mappings, and later retemplating or item changes can
also alter them. Graph creation can reuse compatible data sources instead of
creating a new file for every graph.

## Templated, or per object

Many graph-level and data-source fields have companion flags on the template row.
For those fields, the flag governs the normal push to linked children. Other fields,
graph items and input mappings have separate propagation rules.

| Flag | Meaning | On save |
|---|---|---|
| Clear | The field is templated | Written down onto every child, overwriting whatever was there |
| Set | The field is per object | Left alone on every child |

The flag is per field. A graph template can push its axis label
onto linked graphs while leaving each one's title and vertical limit to
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
| Input method | No, and marked always templated | The template save handler explicitly updates linked data-source rows |
| Path to the RRD file | No, and marked never templated | Normal template pushes exclude it; retemplating preserves the existing path |

Path preservation protects the existing association with history during normal
template changes. It does not mean paths cannot be edited or relocated through
other administrative operations. Review file identity before changing them.

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
| Graph item added, removed or repointed at another field | Operation-dependent | Matching, adding, deleting and remapping use different paths; verify the resulting local item mappings |
| Data template field, templated | Yes, on save | Written onto every data source from that template |
| Data template input field values | When templated | Template and child per-object flags, query index fields and host-field rules constrain propagation |
| Data template storage profile, step, archives | Database only | Existing files keep the structure they were created with |
| Fields added to a data template | Database only | Existing files have nowhere to put them |
| Device template contents | Separate synchronization | Editing associations alone does not synchronize every existing device |

Database propagation depends on the save path and override rules. Updating template
metadata does not by itself migrate existing RRD files; file maintenance is a
separate operation. Some structural controls are read-only in the in-use data-template
editor. See [Create custom templates](/guides/create-custom-templates/).

## Device templates have an explicit synchronization path

Editing a device template's associations changes what it offers to new devices.
Existing devices use a separate reapply/synchronize operation. The bulk helper normally
selects devices in Up or Recovering state unless its caller includes down devices;
check the operation's selection before assuming every device was updated.

Synchronization adds missing graph-template associations, refreshes selected data
queries and can remove unused graph-template associations that are no longer needed.
It does not directly delete existing graphs just because their template was removed
from the device template. It also invokes automation and plugin hooks, so it is not
limited to association bookkeeping and may cause configured graph automation to run.

Review the resulting device associations and graphs after synchronization. They are
not necessarily a permanent union of every template version ever applied.

## Indexes, and why ports move

A data query has to decide which discovered thing matches which existing data source.
That is the index. Numeric indexes can change after hardware or configuration changes.
A suitable stable field can help preserve identity, but interface names can also be
renamed or reused. Verify uniqueness, persistence and the reindex behavior on the
actual device; no field name alone guarantees continuity.

This decision looks trivial when you make it and expensive when you get it wrong.
It is also made per device per run rather than once for the query, so two identical
switches can end up keyed on different fields. How the field is chosen, what
happens when an index disappears, and what it costs to detect renumbering are in
[Data queries and indexes](/concepts/data-queries-and-indexes/).

## Changing a template later

Graph changes affect subsequent rendering after the relevant save and propagation
complete. Overrides and image caching can affect what a viewer sees, so do not assume
every graph changes immediately. Inspect a representative child graph and its item
mappings; see [Tune graph appearance](/guides/tune-graph-appearance/).

Saving a data template does not automatically reshape existing RRD files. The file's
actual data-source definitions and archives can disagree with the database profile.
Inspect both before maintenance; creating a replacement file is only one option.

Depending on the change, supported RRDtool tuning, archive resizing or controlled
dump/restore work can preserve some or all existing history. Those operations have
limits and need backups and verification; they do not reconstruct data that was never
stored. Deleting and recreating a file loses its history and is not the mandatory
solution for every mismatch. See [Manage data retention](/guides/manage-data-retention/)
and [Data sources and round-robin archives](/concepts/data-sources-and-rras/).

## Other things called templates

Four more objects carry the word and do not behave like the four above. Colour
templates are named palettes applied to graph items. Aggregate templates describe
how several graphs combine into one. Automation templates match discovered devices
to a device template. Graph preset definitions supply reusable legend formats.

None of them sit in the stack described here. They are worth knowing about mainly
so that a search result mentioning a template is read as the right kind.
