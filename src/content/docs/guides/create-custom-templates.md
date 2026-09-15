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
Duplicate action that produces an independent copy under a new name. Nothing links
the copy back to the original.

Build from scratch only when no existing template shares your data shape. Copying is
faster, and more importantly it inherits decisions someone already got right: the
archive layout, the heartbeat, the legend spacing, the choice of `COUNTER` over
`GAUGE`.

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
is not revisited afterwards.

**One or more data source items.** Each item is one series inside the RRD file.

| Field | What it decides | Watch for |
|---|---|---|
| Internal data source name | The name inside the RRD file | 19 characters maximum, and effectively permanent once files exist |
| Data source type | `GAUGE`, `COUNTER`, `DERIVE`, `ABSOLUTE`, and others depending on the RRDtool version | A counter stored as a gauge graphs as a rising staircase |
| Minimum | Values below this are recorded as unknown | `U` means no minimum |
| Maximum | Values above this are recorded as unknown | `U` means no maximum, which lets counter wraps through as huge spikes |
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

Each drawing item points at a data source item on the data template. That pointer is
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

Expose an input when the value genuinely differs per graph and a human has to choose
it. A per graph override is a field that will drift, will not be reviewed, and will
not be corrected when you fix the template. Two exposed colors are useful. Twelve
exposed fields mean you do not have a template any more, you have a form.

## Editing a template later

This is the part worth reading twice, because the two halves of a template behave
differently.

### Graph changes apply at once

Graphs are drawn on demand from the template plus the current data. Change a color,
a label, an item order, or the vertical axis, and every existing graph built from
that template shows the change the next time it is rendered. Nothing is regenerated
and nothing is lost.

### Stored structure does not change

The archive layout and the set of series inside an RRD file are fixed when the file
is created. The file is created once, and creation is skipped for a path that already
exists.

So changing a data template gives you a split result:

| Change | Effect on existing data sources | Effect on existing RRD files |
|---|---|---|
| Add a data source item | The item appears in the configuration | No new series in the file |
| Rename the internal data source name | The name changes in the configuration | The old name stays inside the file |
| Change minimum or maximum | The new limit is stored | Enforced on new samples only |
| Change type from `GAUGE` to `COUNTER` | The new type is stored | The file keeps the original type |
| Change the data source profile | New data sources use it | Existing archives keep their layout |
| Change the data input method | Applies to every data source | No change to the file |

The configuration and the files disagree after a change like this, and the disagreement
is silent. Graphs keep drawing from what the file holds while the editor shows what
you meant. Reconciling the two means rebuilding the files and losing their history,
which is a decision to make on purpose. See
[Data sources and round-robin archives](/concepts/data-sources-and-rras/).

The practical rule: get the internal names, types, and profile right before you create
the first data source from a template. Everything else is cheap to change later.

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

**A renamed output field.** Renaming an output field on the data input method breaks
the mapping to the data source item. Collection keeps running and the value stops
being stored.

**The base value.** A network template with a base of 1024, or a memory template with
a base of 1000, produces an axis that is wrong by a few percent and a legend that
quietly disagrees with every other tool you own.

**Editing a stock template in place.** Upgrades may replace templates that ship with
the system. Duplicate first, edit the copy, and point your devices at the copy.
