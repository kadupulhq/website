---
title: The poller cache
description: Why the collector reads a precomputed work list instead of your
  configuration, and why that is the usual reason a change appears to do
  nothing.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 6
slug: 1.2.31/concepts/the-poller-cache
---

[Architecture](/1.2.31/concepts/architecture/) introduces the poller cache in a sentence:
the work list is precomputed, and the collector reads that rather than your
configuration. This page is about what that decision actually costs you.

## What the collector would otherwise have to do

Working out what to collect for one value means resolving a chain. The data source
points at a device and a data template. The template points at a data input. The
data input has fields, some of them overridden per device, some inherited from the
template. If the data source came from a data query, the current index has to be
resolved through the query cache. Then the SNMP credentials have to come off the
device, unless a field overrides them.

That is several joins for one value. A modest install has tens of thousands of
values and one cycle every five minutes. Doing the resolution at collection time
would mean the database, not the network, decides how many devices you can
monitor.

So the resolution happens once, when something changes, and the answer is written
down flat.

## One row, no joins

Each row in the cache is a complete, self-contained instruction. Nothing in it
needs to be looked up.

| Held in the row | Why it is there |
|---|---|
| Which collector owns it | Each collector selects only its own rows |
| The action: SNMP, script, or script server | Decides which code path runs |
| Hostname, SNMP version, port, timeout, community or credentials | So no join to the device is needed |
| The OID, or the full script command line | Already substituted, ready to run |
| The path to the RRD file | Already resolved |
| The field name inside that file, and how many fields a complete reading has | Lets output be matched and validated |
| The step, and a countdown to the next time this item is due | See [Time and intervals](/1.2.31/concepts/time-and-intervals/) |

During collection the only thing joined is the device's disabled flag. Everything
else in the row is used as written.

The copy of the credentials is the part that surprises people. The community
string in the cache is a snapshot taken when the row was built. Fixing a wrong
community on the device page does not fix any existing row; it fixes the row that
gets built the next time something writes that row.

The RRD path is a snapshot too. Moving files, or changing where files live, leaves
every cached row pointing at the old location.

## What writes it

The cache is maintained incrementally, by the operations that know they changed
something.

| Operation | Rows rewritten |
|---|---|
| Saving a device | Every row belonging to that device |
| Saving a data source | That data source's rows |
| Creating graphs and data sources from a template | The rows created |
| A data query run that moved or resolved an index | Only the data sources that changed |
| A full rebuild | Everything |

Rewriting is not a blind insert. The rows for the data sources being rebuilt are
first marked absent, then the new set is written, then anything still marked
absent is deleted. That is what removes rows for a field that no longer exists.
The important detail is that the sweep is scoped to the data sources being
rebuilt, so a partial rebuild can never delete somebody else's rows, and equally
can never clean up rows it was not asked to look at.

## Rows that are never written

Some configurations produce no row at all, quietly.

A disabled device produces none. That is intended, and it is also why re-enabling
a device does nothing on its own: there is nothing left to run. The device has to
be saved, so its rows get built again.

An SNMP item whose device has no usable SNMP configuration produces none. No
version, an out of range version, or an empty community on version 1 or 2 and the
row is skipped rather than written as a row that will fail every cycle.

A data source whose data input fails the input whitelist produces none. The
whitelist exists so that a database compromise cannot turn the poller into a
command execution service, and it fails closed. The rebuild still runs its delete
sweep, so a data input that stops passing validation has its rows removed rather
than stranded.

In each case, the interface shows the data source. The graph shows a flat line.
Nothing in the configuration looks wrong, because the configuration is not wrong.
The work list just does not contain it.

## Why a change can appear to do nothing

Three different mechanisms produce the same symptom.

**The row was not rebuilt.** You changed something the interface does not treat as
affecting collection, or you changed it outside the interface. The cache still
holds the old answer. This covers most cases, and a rebuild resolves it.

**The row was never built.** Covered above. A rebuild resolves this too, but only
after the underlying condition is fixed, and the absence of an error message is
the confusing part.

**The value is collected and then discarded.** For a data source built from a data
template, fields that no graph item references are dropped before the file is
written. Adding a field to a data template and expecting numbers to appear does
not work until a graph item uses the field. This one a rebuild will not fix,
because the work list is correct; the discard happens later.

## The blunt instrument

A full rebuild walks every data source and rewrites the entire cache. It is safe
and it is idempotent. It is also proportional to the size of the install, and it
is a write-heavy operation against tables the running collector is reading.

That is the trade. The incremental path is fast and can be incomplete. The full
rebuild is complete and expensive. Reach for the full rebuild when you cannot
explain a discrepancy, not as routine maintenance, and not on a schedule.

Kadupul records when the cache last changed, which is what lets other parts of the
system notice they need to reread it.

## Multiple collectors

With more than one collector, each row belongs to exactly one of them, and the
rows are pushed to that collector's own database as well as the central one.

If a remote collector is unreachable when you save a change, the change lands
centrally and not remotely, and Kadupul says so: it asks for a full sync once the
collector is back. Until that sync, the remote collector is running an older work
list than the interface is showing you. A configuration change that took effect on
one collector and not another is nearly always this.

The ordering in a full run, including where the cache is read and when reindex
commands are drained, is in
[Poller lifecycle](/1.2.31/reference/poller-lifecycle/). For scaling collectors, see
[Scale the poller](/1.2.31/guides/scale-the-poller/).
