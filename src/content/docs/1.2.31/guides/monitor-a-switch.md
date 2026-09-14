---
title: Monitor a switch
description: Discover a switch's ports, graph the right counters, and pick an
  index so port history stays attached to the port after a card reseat.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 2
slug: 1.2.31/guides/monitor-a-switch
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A switch is the case data queries exist for. You do not know how many ports there
are, the count changes, and every port needs its own data source. See
[Templates](/1.2.31/concepts/templates/) for what a data query is; this page is about
getting one right.

## Before you start

Confirm the device answers, from the machine the poller runs on.

```bash
snmpwalk -v2c -c public switch.example.net ifName
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
4294967295\. A gigabit port at line rate fills that in about 34 seconds. At a 300
second step, the poller cannot distinguish one wrap from seven, and `COUNTER` only
corrects a single wrap between samples. The graph is not noisy in a way that looks
wrong; it is quietly low.

Check the counters are actually populated before you build hundreds of graphs. The
high capacity objects are optional and some agents leave them empty.

```bash
snmpwalk -v2c -c public switch.example.net ifHCInOctets
```

An empty walk means every sample will be recorded as unknown, and the graph will be
a flat gap rather than an error.

## The maximum is fixed at creation

A traffic data source takes its maximum from the speed discovered at the moment the
RRD file was created. `ifHighSpeed` is preferred, `ifSpeed` is used when it is
absent, and a configured default applies when both are zero.

That value is written into the file. A port discovered at 100 Mbit and later
negotiated up can end up with a ceiling below its real traffic, and RRDtool records
anything above the ceiling as unknown. If a port starts showing gaps at high load
after a speed change, this is the first thing to check.

## The index decision

This is the part that costs history when it is wrong.

Each data source records two things about its port: which field identifies it (the
index type) and that field's value. On every reindex, the port is found again by
asking which SNMP index currently carries that value in that field. The data source
follows the value, not the table position.

So the question is which field carries the value.

The interface query declares a preference order: `ifName`, then `ifDescr`, then
`ifHwAddr`, then `ifIndex`. Kadupul takes the first one that passes two tests
against the values the device returned during discovery.

1. Every discovered port has a value for it.
2. No two ports share a value.

| Field | Survives | Fails when |
|---|---|---|
| `ifName` | Reboots, reseats, renumbering | The agent leaves it blank, or repeats it across stack members |
| `ifDescr` | Usually the same on switch hardware | On servers it is a kernel name and can change |
| `ifHwAddr` | Reboots | A replaced card has new MACs, which is the case you were guarding against |
| `ifIndex` | Nothing worth relying on | Reseat, reboot or firmware change renumbers the table |

If the query falls through to `ifIndex`, treat that as a finding rather than a
result. It means every field above it failed one of the two tests on this device,
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
| Verify All | Every polling cycle | The setting's own description calls it very expensive |

Uptime is the default and it suits most switches, because a reboot is the event that
renumbers indexes. Index Count catches a card added or removed without a reboot, but
not a swap that leaves the count unchanged. Verify All is for a handful of devices
that misbehave, not for a fleet.

Reindexing does not run against a device that is down or disabled. A card reseat that
also takes the device offline gets reindexed on the first cycle after it answers
again, not during the outage.

To force one:

```bash
php cli/poller_reindex_hosts.php --id=42
php cli/poller_reindex_hosts.php --id=all
```

## When a port disappears

If the index value is gone from the discovered set, the data source is marked an
orphan rather than deleted. It stops collecting and its RRD file is left where it is.
Put the port back, reindex, and it reattaches with history intact.

A data query can declare that orphans should be removed outright. The interface query
does not, which is the behaviour you want.

## Large chassis

Two per-device settings matter once port counts get high. The number of OIDs issued
per SNMP get request defaults to 10; raising it cuts round trips on a device with
several hundred ports. The number of threads used for the device defaults to 1.

Change one at a time and watch the poller runtime, because both trade device load
against wall clock.

## Failure modes

| Symptom | Cause |
|---|---|
| Graphs created, every sample unknown | 64-bit counters not implemented, or the device is on SNMP v1 |
| Counters jump to absurd values | 32-bit counter wrapping more than once per interval |
| Gaps only at high load | RRD maximum fixed from a stale discovered speed |
| Port history attached to the wrong port after maintenance | Index resolved to `ifIndex` |
| Poller logs a warning about bad SNMP indexes | Data sources left with no index; reindex, delete or disable them |
| Ports discovered, nothing collecting | Data sources with an empty index produce no poller cache entries |
