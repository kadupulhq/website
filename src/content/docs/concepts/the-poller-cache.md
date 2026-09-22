---
title: The poller cache
description: Why the collector reads a precomputed work list instead of your configuration, and why that is the usual reason a change appears to do nothing.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 6
---

[Architecture](/concepts/architecture/) introduces the poller cache in a sentence:
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

## What the cache stores

The cache precomputes collection instructions. It reduces repeated configuration
resolution, but it does not eliminate joins or live device state.

| Held in the row | Why it is there |
|---|---|
| Which collector owns it | Each collector selects only its own rows |
| The action: SNMP, script, or script server | Decides which code path runs |
| Hostname, SNMP version, port, timeout, community or credentials | Cached collection connection fields; live host state is also read |
| The OID, or the full script command line | Already substituted, ready to run |
| The path to the RRD file | Already resolved |
| The field name inside that file, and how many fields a complete reading has | Lets output be matched and validated |
| The step, and a countdown to the next time this item is due | See [Time and intervals](/concepts/time-and-intervals/) |

`cmd.php` joins `poller_item` to `host`, filters disabled devices, and uses live
device fields for availability and reindex checks. Cached OIDs, commands and RRD
metadata still need to match the intended data source.

Cached credentials are a snapshot, but saving changed credentials through the
device API normally refreshes the affected cache. Direct database edits bypass
that path and can leave a stale snapshot. Verify the actual cache rather than
assuming every credential change requires a manual rebuild.

The RRD path is a snapshot too. Moving files, or changing where files live, leaves
every cached row pointing at the old location.

## What writes it

The cache is maintained incrementally, by the operations that know they changed
something.

| Operation | Rows rewritten |
|---|---|
| Saving a device | Changes to connection fields, collector or disabled state trigger a pushout; unchanged collection fields can use the quick-save path |
| Saving a data source | That data source's rows |
| Creating graphs and data sources from a template | The rows created |
| A data query run that moved or resolved an index | Only the data sources that changed |
| Rebuild CLI | Enabled devices processed by its workers; the current `--host-id` forwarding defect prevents relying on device isolation |

Rewriting is not a blind insert. The rows for the data sources being rebuilt are
first marked absent, then the new set is written, then anything still marked
absent is deleted. That is what removes rows for a field that no longer exists.
The buffer sweep is scoped by collector and data source ids. That protects
unrelated sources in the ordinary targeted path; it is not a guarantee about
concurrent rebuilds or failed database writes. Verify the resulting rows after
a rebuild, including a nearby unaffected device when investigating scope.

## Rows that are never written

Some configurations produce no new cache row. Check logs as well as the graph.

The builder skips disabled devices, but bulk **Disable** preserves existing
cache rows and collection filters the device out. A rebuild while disabled can
remove rows. Bulk **Enable** reuses a populated cache or primes it when empty;
an extra device save is not generally required. An existing partial or stale
cache still needs investigation.

An SNMP item whose device has no usable SNMP configuration produces none. No
version, an out of range version, or an empty community on version 1 or 2 and the
row is skipped rather than written as a row that will fail every cycle.

When an input whitelist is configured, a missing file or rejected input prevents
new rows for that input. A committed rebuild still sweeps its stale rows. Without
an `input_whitelist` configuration, this check permits inputs; it is not an
always-enabled protection. Review the rejected command and configured policy
before changing the whitelist.

The interface can still show a data source whose cache is empty. Its graph may
retain old history or show gaps; a flat zero line is not a reliable indicator.
Missing credentials and rejected inputs are configuration conditions to resolve.

## Why a change can appear to do nothing

Three different mechanisms produce the same symptom.

**The row was not rebuilt.** You changed something the interface does not treat as
affecting collection, or you changed it outside the interface. The cache still
holds the old answer. A rebuild can refresh the cached fields after the intended configuration is verified.

**The row was never built.** Covered above. A rebuild resolves this too, but only
after the underlying condition is fixed, and diagnostics may appear in the logs rather than on the graph.

**The value is collected and then discarded.** Multi-value output is mapped through the template field definitions, and
unreferenced fields can be skipped during parsing. Check the expected field
names, mappings and graph associations; this rule is not a blanket discard of
all numeric samples without a graph reference. A cache rebuild cannot repair
an incorrect output contract.

## The blunt instrument

For a single device, use **Repopulate Poller Cache** on its legacy device
page. That action calls the device-scoped `push_out_host()` path. Check the
resulting rows and diagnostics afterward.

The current `rebuild_poller_cache.php` parent accepts `--host-id`, but does not
forward that filter to its worker command. A purported single-device CLI rebuild
can therefore rebuild other enabled devices. Do not rely on that option for
isolation until the application defect is fixed.

A broad CLI rebuild is available from the application root, run as the poller user:

```bash
php cli/rebuild_poller_cache.php
```

It processes enabled devices; it is not a repair for every hostless or disabled
source. This writes collection tables and can take time. Avoid overlapping
rebuilds and do not interrupt it. The CLI's `--force` overrides its
process-registration guard, so it is not a routine repair option.

Rebuilding refreshes derived state; it does not repair device reachability,
move RRD files, fix rejected input commands, or recover lost history. Inspect the
resulting cache, logs and subsequent collection before calling the repair done.

Kadupul records when the cache last changed, which is what lets other parts of the
system notice they need to reread it.

## Multiple collectors

With more than one collector, each row belongs to exactly one of them, and the
rows are pushed to that collector's own database as well as the central one.

If a remote collector is unreachable when you save a change, the change lands
centrally and not remotely, and Kadupul says so: it asks for a full sync once the
collector is back. Until that sync, the remote collector is running an older work
list than the interface is showing you. A collector-specific discrepancy is a reason to inspect replication status,
connectivity and each collector’s local cache.

The ordering in a full run, including where the cache is read and when reindex
commands are drained, is in
[Poller lifecycle](/reference/poller-lifecycle/). For scaling collectors, see
[Scale the poller](/guides/scale-the-poller/).
