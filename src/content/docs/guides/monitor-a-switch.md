---
title: Monitor a switch
description: Discover a switch's ports, graph the right counters, and pick an index so port history stays attached to the port after a card reseat.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 2
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A switch is the case data queries exist for. You do not know how many ports there
are, the count changes, and every port needs its own data source. See
[Templates](/concepts/templates/) for what a data query is; this page is about
getting one right.

## Before you start

Confirm the device answers from its assigned collector, preferably as the poller
user. Substitute your configured read-only credentials. Numeric OIDs avoid a
dependency on locally installed MIB names.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Use SNMP v2c or v3. The 64-bit interface counters are SMIv2 objects and cannot be
retrieved over v1. A v1 device gives you the 32-bit counters and nothing else.

## Choose a device template

The device template decides which data queries and graph templates are offered when
you add the device. Kadupul inherits the template set Cacti ships, which includes a
generic SNMP device template and a number of vendor ones.

Port discovery comes from the same place whichever you pick: the interface data
query, defined in `resource/snmp_queries/interface.xml`. If no template matches your
hardware, take the generic one and attach the interface query to it.

## Run the data query

The query walks `ifIndex` to find the ports and reads `ifNumber` to know how many to
expect. Then it collects a field set per port.

| Field | OID | Used for |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | The SNMP table position |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Short port name, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Longer description |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | The interface description you configured |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Port MAC |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Speed in bit/s, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Speed in Mbit/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up or down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | 32-bit byte counters |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | 64-bit byte counters |

Run the query once against the device. It returns a table of discovered ports. Read
that table before creating anything, because it is the evidence for every decision
below.

## Pick the 64-bit counters

The interface query offers several traffic graph templates. The ones worth knowing:

| Graph template | Reads |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | The same, with a 95th percentile line |
| In/Out Bits (64-bit, BW) | The same, against the interface speed |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Take a 64-bit template unless you have a reason not to. A 32-bit octet counter holds
4294967295. A gigabit port at line rate fills that in about 34 seconds. At a 300
second step, the poller cannot distinguish one wrap from seven, and `COUNTER` only
corrects a single wrap between samples. The graph is not noisy in a way that looks
wrong; it is quietly low.

Check the counters are actually populated before you build hundreds of graphs. The
high capacity objects are optional and some agents leave them empty.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

An empty or failed walk needs investigation: check the returned error, access
view and agent support. It does not uniquely establish what every later sample
or graph will contain.

## Check the stored maximum after speed changes

When the data source uses a query-speed maximum, its creation resolves the
speed from cached discovery data. `ifHighSpeed` is preferred, `ifSpeed` is used when it is
absent, and a configured default applies when both are zero.

That value is written into the file. A port discovered at 100 Mbit and later
negotiated up can end up with a ceiling below its real traffic, and RRDtool records
processed rates above that ceiling as unknown. Compare the cached speed, data
source definition and actual file with `rrdtool info`. Updating discovery does
not by itself prove the existing file was tuned. If gaps begin after a speed
change, inspect those values before planning a supported file update.

## The index decision

This is the part that costs history when it is wrong.

Each data source records two things about its port: which field identifies it (the
index type) and that field's value. On every reindex, the port is found again by
asking which SNMP index currently carries that value in that field. The data source
follows the value, not the table position.

So the question is which field carries the value.

The interface query declares a preference order: `ifName`, then `ifDescr`, then
`ifHwAddr`, then `ifIndex`. Kadupul normally chooses from candidates with enough distinct cached values
and no duplicate identities. The raw index has special handling; inspect the
actual selected type instead of assuming the preference list guarantees stability.

| Field | Survives | Fails when |
|---|---|---|
| `ifName` | Reboots, reseats, renumbering | The agent leaves it blank, or repeats it across stack members |
| `ifDescr` | Usually the same on switch hardware | On servers it is a kernel name and can change |
| `ifHwAddr` | Reboots | A replaced card has new MACs, which is the case you were guarding against |
| `ifIndex` | Nothing worth relying on | Reseat, reboot or firmware change renumbers the table |

If the query falls through to `ifIndex`, treat that as a finding rather than a
result. Inspect why earlier candidates were not selected,
and your port history is now attached to a number the switch is free to reassign.

The tests run against whatever the device returned during that discovery. Discover a
chassis with a line card pulled, and a field that looked unique across the partial
set may not be unique across the full one. Discover when the hardware is complete.

## Reindex method

Set per device, per data query. It decides when Kadupul re-reads the index fields.

| Method | Triggers on | Cost |
|---|---|---|
| None | Nothing; manual or scripted only | Free |
| Uptime | The device's SNMP uptime going backwards | One comparison per cycle |
| Index Count | The number of discovered indexes changing | One count per cycle |
| Verify All | A cached identity assertion fails | Checks known indexes during polling; cost grows with that set |

Uptime is the default and it suits most switches, because a reboot is the event that
renumbers indexes. Index Count catches a card added or removed without a reboot, but
not a swap that leaves the count unchanged. Verify All can detect changed identities at known indexes, but it does not
guarantee discovery of new ports. Measure its cost before fleet-wide use.

Reindexing does not run against a device that is down or disabled. A card reseat that
also takes the device offline needs a trigger or explicit rerun once reachable.
A successful availability check does not prove that queued reindex work finished.

To rerun a selected device and query, replace both ids with the installed ids.
Omit `--qid` to run all queries associated with that device:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` broadens the run to all enabled devices. Avoid overlapping reindex
runs and do not interrupt them. `--force` bypasses process registration and
refreshes title caches, but it does not bypass down/disabled-device checks. The
command can report completion for a skipped query, so inspect discovery results,
resolved indexes and polling OIDs afterward.

## When a port disappears

Do not assume a missing port automatically stops collection. Current reindex
code can reset an orphan flag and retain the old polling OIDs when an identity
is unresolved and no source changes index. Compare the stored identity with the
new discovery cache and disable an affected source until the mapping is verified.
See [Data queries and indexes](/concepts/data-queries-and-indexes/).

The interface XML does not request orphan removal. Even queries that do request
it remove polling/Boost entries, not the data source and RRD history themselves.
When a port returns, rerun discovery and verify the resolved index before resuming.

## Large chassis

Two per-device settings matter once port counts get high. Inspect the configured OIDs per SNMP request and per-device thread count.
Batching support and effective concurrency depend on the collector and agent;
PHP `cmd.php` and Spine do not provide identical threading behavior.

Change one at a time and watch the poller runtime, because both trade device load
against wall clock.

## Failure modes

| Symptom | Cause |
|---|---|
| Graphs created, every sample unknown | 64-bit counters not implemented, or the device is on SNMP v1 |
| Counters jump to absurd values | 32-bit counter wrapping more than once per interval |
| Gaps only at high load | RRD maximum fixed from a stale discovered speed |
| Port history attached to the wrong port after maintenance | Unstable identity, stale mapping, or unresolved orphan handling; verify the identity and OIDs |
| Poller logs a warning about bad SNMP indexes | Data sources left with no index; reindex, delete or disable them |
| Ports discovered, nothing collecting | Data sources with an empty index produce no poller cache entries |
