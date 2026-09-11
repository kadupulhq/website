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
types, and the archive layout. Every data source created from a data template shares
that structure.

**Graph templates** define how to draw it: which items, which colors, which legend,
what the axis says.

**Device templates** bundle the data queries and graph templates that suit a class
of hardware, so choosing the right one when adding a device does most of the work.

**Data queries** handle the case where you do not know in advance how many things
there are. A switch has some number of ports, discovered by walking the device, and
a data query turns that walk into one data source per port.

## Indexes, and why ports move

A data query has to decide which discovered thing matches which existing data source.
That is the index. Index by the SNMP table position and a card reseat renumbers
everything, silently attaching three months of port 3 history to what is now port 7.
Index by something stable, such as the interface name, and it survives.

This decision looks trivial when you make it and expensive when you get it wrong.

## Changing a template later

Changes to how a graph is drawn apply immediately, because graphs are rendered on
demand.

Changes to how data is stored do not. The archive layout was fixed when each RRD
file was created. Changing the data template changes what new files look like, and
leaves existing files exactly as they were. Reconciling the two means rebuilding the
files and accepting the loss of history, which is a decision to make deliberately
rather than discover.
