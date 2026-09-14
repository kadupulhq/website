---
title: Glossary
description: Definitions of the domain terms that appear throughout Kadupul, in
  alphabetical order.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 5
slug: 1.2.31/reference/glossary
---

Terms as Kadupul uses them, inherited from Cacti 1.2.x. Where a term comes from
RRDtool, the definition is the one Kadupul relies on, not the whole of RRDtool's.

## Aggregate

A graph built by combining several graphs that share one source graph template
into a single image. An aggregate template holds the settings; an aggregate graph
is one instance of it. Each contributing graph gets a GPRINT prefix so its legend
lines can be told apart.

## Boost

The on-demand RRD update subsystem. With boost on, collected values are written to
a database table instead of straight into RRD files, and the files are updated
when a graph is requested or when the boost interval elapses. It is required when
more than one data collector exists, and the poller turns it on by itself in that
case.

## CDEF

A math function applied to one graph item before it is drawn or printed. Kadupul
stores CDEFs as an ordered list of items (functions, operators, special data
sources, custom strings, or another CDEF) and hands the result to RRDtool. A CDEF
changes what a graph item shows; it does not change what is stored.

## Consolidation function

The rule an RRA uses to reduce several samples into one stored row. The four
Kadupul offers are `AVERAGE`, `MIN`, `MAX`, and `LAST`. A graph can only show a
consolidation function for which an RRA exists in the file.

## Data query

A definition, held in an XML file, that discovers a list of things on a device and
produces one data source per thing. The XML names the OID or script that lists
indexes and the fields to read for each index. Interface tables are the usual
example: one query yields a data source per interface.

## Data source

One RRD file plus the database rows that describe it: which device it belongs to,
which data template it came from, what to collect, and how often. A data source
may hold more than one value per sample, one per data source item in the file.

## Data template

A reusable data source definition. It fixes the data input method, the data source
items, and the data source profile, and every data source created from it inherits
those. Changing the template can push the change out to its data sources.

## Device template

A named set of graph templates and data queries that a device starts with. It
decides what Kadupul tries to graph for a device, not how the device is reached.
`cli/host_update_template.php` reapplies a template to devices created earlier.

## GPRINT

A graph item that prints a computed number into the legend rather than drawing a
line. A GPRINT preset supplies the format string, so the same formatting can be
reused across templates. `GPRINT:AVERAGE`, `GPRINT:LAST`, `GPRINT:MAX`, and
`GPRINT:MIN` name the consolidation function used for the printed value.

## Graph template

A reusable graph definition: the ordered list of graph items, the axis and legend
options, and the size. Graphs created from a template follow it, so a change to
the template reaches every graph made from it.

## Heartbeat

The number of seconds an RRD file will wait for a sample before recording unknown
data. Set it longer than the step when a data source is unreliable and you prefer
carried-forward values to gaps. Kadupul's heartbeat list runs from 20 to 172800
seconds, and a heartbeat should be at least twice the poller interval.

## Index

The identifier a data query assigns to one discovered item, stored as
`snmp_index` on the data source. It is what ties an RRD file to a particular
interface, disk, or sensor across polling cycles. An index that changes on the
device without a reindex leaves the data source pointing at the wrong thing.

## Poller cache

The `poller_item` table: one row per value to collect, holding the device, the
action, the arguments, the RRD path and name, and the step scheduling. The
collector reads only this table, so a configuration change has no effect until the
cache is rebuilt. `cli/rebuild_poller_cache.php` rebuilds it.

## RRA

Round Robin Archive. One fixed-size ring inside an RRD file, defined by its
consolidation function, its aggregation level (how many samples fill one row), and
its row count. A file normally holds several RRAs so that recent data is kept at
full resolution and older data at coarser resolution.

## Realm

A numbered permission area used to decide whether an account may reach a page or
an action. Realm 8 is console access, 7 is viewing graphs, 5 is graphs, 4 is
trees, 3 is sites, devices and data. Plugins register their own realms above 100.

## Step

The interval, in seconds, at which a data source expects a sample, and the
resolution of its RRD file's first RRA. It is set by the data source profile.
Changing a step does not change existing files; `cli/splice_rrd.php` handles that.

## Tree

An ordered hierarchy used to navigate graphs. A tree holds header, site, device,
and graph nodes, and has its own sorting type. Permissions can be granted on a
tree, so trees are also how graph visibility is often organised.

## VDEF

A math function that reduces a graph item to a single value for the legend, such
as a maximum or a percentile. A VDEF applies to the legend only. A CDEF applies to
the drawn item as well.
