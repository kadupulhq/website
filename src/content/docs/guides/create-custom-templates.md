---
title: Create custom templates
description: How to build a data template and a graph template by hand, when to copy one instead, and what editing a template later does to graphs and files that already exist.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 11
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Building a template from scratch is a two step job. The data template decides what
is stored. The graph template decides what is drawn. They are edited separately and
they fail in different ways, so keep them separate in your head while you work.

Read [Templates](/concepts/templates/) first if the four template kinds are not yet
distinct to you.

## Copy first, build second

Start from an existing template whenever one is close. Both template lists carry a
Duplicate action that gives the copied template a new identity and name. It does
not automatically duplicate every dependency: graph items can still reference the
original data-template items, and data-template copies can share input methods and
profiles. Inspect and remap those references when you need independent behavior.

Build from scratch only when no existing template shares your data shape. Copying is
a useful starting point, but validate its archive layout, heartbeat, graph units
and data source types against the new measurement. Similar appearance does not
prove the same collection semantics.

The one case where copying is the wrong instinct is when you want the two templates
to stay in step. A copy does not track its source. If you need one definition
covering two similar cases, use a single template and expose the difference as an
input, not two templates you promise to edit together.

## Build the data template

A data template holds three things.

**The data input method.** What produces the numbers. An SNMP OID, a script, or a
data query. This field is always taken from the template and cannot be overridden on
an individual data source.

**The data source profile.** The polling interval and the archive layout: how many
samples are kept at full resolution, how they are consolidated, and how long the
coarser buckets are retained. The profile is applied when the RRD file is created and
does not automatically reshape existing files when edited. Database profile and
heartbeat state can still be checked or changed later; inspect the actual RRD.

**One or more data source items.** Each item is one series inside the RRD file.

| Field | What it decides | Watch for |
|---|---|---|
| Internal data source name | The name inside the RRD file | 19 characters maximum, and effectively permanent once files exist |
| Data source type | `GAUGE`, `COUNTER`, `DERIVE`, `ABSOLUTE`, and others depending on the RRDtool version | A counter stored as a gauge graphs as a rising staircase |
| Minimum | Values below this are recorded as unknown | `U` means no minimum |
| Maximum | Values above this are recorded as unknown | `U` means no maximum; choose realistic limits for unexpected derived rates |
| Heartbeat | How long a gap can be before the interval is unknown | Profile-specific; inspect the selected profile and RRD file |
| Output field | Which field of the data input method feeds this item | Must match, or the item is never written |

Name the internal data source for the measurement, not for the device or the
template. `bytes_in` survives a rename of everything around it. Getting this wrong is
expensive because changing it later does not rename anything inside existing files.

## Build the graph template

A graph template has graph level options and an ordered list of items.

The graph level options are the title, the vertical label, the base value (1000 for
most things, 1024 for memory and disk), the size, and the image format. The base
value is the one people get wrong; it decides where the axis puts its multipliers.

The item list is the drawing program. Items are rendered in order, and order is the
part of a graph template that takes the longest to get right.

| Item type | Draws |
|---|---|
| `AREA` | A filled region from the axis |
| `AREA:STACK` | A filled region starting at the top of the previous one |
| `LINE1`, `LINE2`, `LINE3` | A line, in increasing thickness |
| `LINE:STACK` | A line stacked on the previous item |
| `TICK` | A mark along an edge, for on and off style data |
| `HRULE`, `VRULE` | A fixed horizontal or vertical reference line |
| `GPRINT` | A number in the legend, using a consolidation function |
| `COMMENT` | Literal legend text |
| `LEGEND`, `LEGEND_CAMM` | A grouped legend block |
| `TEXTALIGN` | Alignment for the legend text that follows |

Data-driven drawing items point at a data source item on a data template.
Literal comments, alignment and fixed rules need not reference a series. That pointer is
what ties the two templates together, and it is why the data template has to exist
first.

A working minimum is one `AREA` or `LINE` item per series, followed by `GPRINT`
items for current, average, and maximum. Stacking is the common trap: a stacked item
only makes sense if the item before it is also part of the same stack, and stacking
onto an unknown value hides the entire stack above it.

## Expose per graph overrides deliberately

Graph item inputs let one field of one or more graph items become editable on each
individual graph. A color, a legend string, a rule value. Everything else stays
under template control.

Expose an input when its value needs to differ per graph. Record which fields
remain inherited and review overrides when updating the template. Graph-level
per-instance flags and graph-item inputs are separate mechanisms.

## Editing a template later

This is the part worth reading twice, because the two halves of a template behave
differently.

### Graph changes apply at once

Saving a graph template propagates controlled fields into child graph records.
Per-instance flags and graph-item inputs can preserve overrides, so not every
change reaches every child. Inspect the saved child settings and render a fresh
graph to verify the result; cached images may lag. This does not rewrite RRD history.

### Stored structure does not change

The archive layout and series are defined when an RRD is created; changing
template records alone is not an RRD conversion. The file is created once, and creation is skipped for a path that already
exists.

The normal editor restricts in-use structural changes, including input method,
internal name and type, and hides add/remove controls in relevant in-use views.
Do not treat the following as a supported recipe to bypass those controls. When
configuration changes are allowed or made through other paths, verify both layers:

| Change | Effect on existing data sources | Effect on existing RRD files |
|---|---|---|
| Add a data source item | The item appears in the configuration | No new series in the file |
| Rename the internal data source name | The name changes in the configuration | The old name stays inside the file |
| Change minimum or maximum | Controlled child values can be updated | Inspect actual limits; a database save alone is not proof that the RRD was tuned |
| Change type from `GAUGE` to `COUNTER` | The new type is stored | The file keeps the original type |
| Change the data source profile | Propagation depends on per-instance flags and the save path | Existing archives are not automatically reshaped |
| Change the data input method | Applies to every data source | No change to the file |

Configuration and files can disagree. Use the data-source comparison tools and
inspect RRDtool metadata instead of assuming a graph proves consistency. Some
header changes can be reconciled with a reviewed tune operation; structural changes
need an explicit conversion plan. Backup, staged restore or carefully validated
splicing can preserve some history, so reconciliation does not always require
discarding it. See [RRD recovery](/guides/recover-a-corrupted-rrd/) and
[Data sources and round-robin archives](/concepts/data-sources-and-rras/).

The practical rule: get the internal names, types, and profile right before you create
the first data source from a template. Rehearse later changes on a representative
copy before propagating them to existing children.

### Which fields get overwritten

Every templated field carries a flag saying whether it is controlled by the template
or set per instance. When the flag says the template controls it, saving the template
writes that field onto every existing child, overwriting whatever was there. When the
flag says per instance, the template leaves the field alone.

Two consequences catch people out.

Clearing a per instance flag hands the field back to the template, and the next save
overwrites every customization anyone made on every graph or data source built from
it. There is no confirmation and no undo.

The file path of a data source is never templated. It stays whatever it was, even
when everything around it changes.

## Traps

**A data source item no graph item uses may not reach the file.** For a data source
built from a template, the series written into a new RRD file are the ones a graph
template item refers to. Add a fourth item to the data template, forget to add a graph
item that draws it, and the value is collected and dropped. Add the graph item first,
or at least before the data sources are created.

**Two items with the same internal name.** The second one wins somewhere and loses
somewhere else. Check names across the whole data template before saving.

**A renamed output field.** Item mappings use field identities, while multi-output
scripts emit names. Verify the script output and mappings together after a rename;
a mismatch can leave samples incomplete or unknown. See
[Collection scripts](/guides/write-a-data-collection-script/).

**The base value.** Choose decimal or binary scaling to match the displayed units
and labels. It controls prefix scaling, not the underlying measurement; 1024-based
memory displays and decimal storage-capacity displays can both be intentional.

**Editing a stock template in place.** Upgrades may replace templates that ship with
the system. Duplicate first, edit the copy, and point your devices at the copy.
