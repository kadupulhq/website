---
title: A worked example, start to finish
description: One switch taken from an empty install to a graph you can trust, naming every decision along the way and what the alternative would have cost.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 28
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Every other page here is a slice. This one joins them. It takes a single device
from nothing to a graph and names the decision at each step, what was chosen, and
what the alternative would have broken.

The device is `sw-ac-03.example.net`, a 48-port access switch with four uplinks.
The goal is traffic on the four uplinks, correct at a week's zoom, with continuity
checked after a line card is reseated. Device behavior must be verified; this is an
illustrative procedure, not a recorded live-switch test.

Follow the links rather than expecting this page to re-explain them. It is the
spine, not the body.

## The eleven decisions

| # | Decision | Chosen | If you chose otherwise |
|---|---|---|---|
| 1 | Where to test reachability from | The poller host | A firewall path you never tested |
| 2 | SNMP version | v2c | v1 has no 64-bit counters |
| 3 | Availability method | SNMP uptime | ICMP ping needs a raw socket |
| 4 | Device template | Generic SNMP, interface query attached | Vendor template is fine; the query is the same |
| 5 | Retention profile | 5 Minute Collection | Compare actual profile retention and collection cost |
| 6 | When to run the data query | Before creating anything | You build on an index you never looked at |
| 7 | Counter width | 64-bit | A gigabit port wraps a 32-bit counter in 34 seconds |
| 8 | Index field | `ifName` | `ifIndex` moves when the chassis renumbers |
| 9 | Reindex method | Uptime | None misses reboots, Verify All adds checks; measure the cost |
| 10 | How many ports first | Four | Forty-eight is unreadable when something is wrong |
| 11 | How long to wait | Two intervals | Rates require successive valid samples and completed buckets |

The rest of the page is those eleven in order, with the commands.

## 1. Prove the device answers, from the right machine

Run this on the poller host. Replace the example hostname and community with your
configured values; `public` is illustrative.

```bash
snmpget -v2c -c public sw-ac-03.example.net .1.3.6.1.2.1.1.1.0
```

**Why from there.** The poller host and your desk are usually on different paths
through the firewall, and many agents restrict by source address. A check that
passes at your desk and fails from the poller is the single most common way to
spend an afternoon on a device that was never reachable.

A timeout here ends the exercise. Fix it on the device or the network. Nothing in
the interface makes an unreachable device answer.

Then check the table you actually want, because a device can answer `sysDescr` and
still refuse the interface table.

```bash
snmpwalk -v2c -c public sw-ac-03.example.net .1.3.6.1.2.1.31.1.1.1.1
snmpwalk -v2c -c public sw-ac-03.example.net .1.3.6.1.2.1.31.1.1.1.6
snmpwalk -v2c -c public sw-ac-03.example.net .1.3.6.1.2.1.31.1.1.1.10
```

These walks check `ifName`, `ifHCInOctets` and `ifHCOutOctets`. Confirm the same
uplink indexes are present in all three. One accessible column does not establish
coverage of every interface or both counter directions.

**If a counter walk is empty.** Check the exact SNMP response, access restrictions
and agent support. Do not conclude from an empty walk alone that the hardware lacks
high-capacity counters, or create graphs for objects you have not verified. See
[Monitor a switch](/guides/monitor-a-switch/).

## 2. SNMP v2c, not v1

The 64-bit interface counters are SMIv2 objects. SNMP v1 cannot carry them at all.
A v1 device gives you the 32-bit counters and nothing else, and decision 7 below is
then made for you, badly.

v3 is the other correct answer. It costs more configuration and gives authentication
and privacy. Use it where the community string travelling in clear text matters.
[SNMP](/reference/snmp/) has the credential fields.

## 3. Availability by SNMP uptime, not ping

Availability is how Kadupul decides the device is up. It is independent of whether
collection works, and the two disagree more often than people expect.

Choose an SNMP method for a device you are polling over SNMP, because it tests the
thing you depend on.

**What ICMP would have cost.** An ICMP ping needs a raw socket, which needs
privilege the web and poller users do not normally hold. A device that answers
`ping` from your shell can still be reported down by the poller while its data
arrives perfectly. You then have a device marked down, graphs that work, and no
obvious explanation.

**What "none" would have cost.** A device with no availability check is always
considered up. Every downstream diagnostic that starts with "is the device up" now
returns yes, unconditionally, and tells you nothing.

The full list of methods is in [Add your first device](/start/first-device/).

## 4. Device template: generic is enough here

A device template is a bundle of associations. It decides which graph templates and
data queries are offered. It creates nothing by itself.

Take a vendor template if one matches the hardware. Take the generic SNMP one if
none does, and attach the interface data query to it. Port discovery comes from the
same place either way.

**Before creating graphs.** Review the selected template and associated queries.
Changing a template does not prove obsolete associations were removed; check the
resulting device configuration before proceeding.

**What picking right does not do.** It does not create a graph. People stop here,
see an empty device, and conclude the template failed. [Templates](/concepts/templates/)
sets out what a template does and does not propagate.

## 5. Retention: the 5 Minute profile

The profile decides the step, the heartbeat, the consolidation functions kept, and
the archive sizes. New files use these settings at creation. Existing RRDs do not
automatically follow every profile edit; inspect the actual file and use a reviewed
propagation, tuning or resize procedure when changing it.

The shipped 5 Minute Collection profile is the default used in this example. It
keeps four consolidation functions, including MAX. A MAX series can preserve peaks
present in collected samples at retained resolutions; it cannot recover bursts
missed between polls.

**What the 1 Minute profile would have cost.** Roughly seven times the disk per data
source for the shipped profiles, whose retention spans also differ. Polling five
times as often increases collection frequency, but total runtime cost depends on
the collector and device. Choose based on the resolution you actually need. The numbers are on
[Manage data retention](/guides/manage-data-retention/), and the whole-system version
is [Capacity planning](/guides/capacity-planning/).

**Why to plan now.** RRD changes require deliberate handling, and finer historical
samples cannot be recreated later. Some structural changes can preserve existing
history; see the retention and recovery procedures before recreating files.

## 6. Run the data query and read what came back

A switch is the case data queries exist for. You do not know how many ports there
are, the count changes, and each port needs its own data source.

Refresh the interface query through the device's query controls, or explicitly
reindex the test device. Then inspect its cached fields and values. The list
commands below read `host_snmp_cache`; they do not themselves perform a fresh walk.
An interface row is not necessarily a physical port.

```bash
php cli/add_graphs.php --list-snmp-queries
# Example IDs only: select your device and its interface query from the lists.
host_id=42
query_id=1
php cli/poller_reindex_hosts.php --id="$host_id"
php cli/add_graphs.php --list-snmp-fields --host-id="$host_id" --snmp-query-id="$query_id"
php cli/add_graphs.php --list-snmp-values --host-id="$host_id" --snmp-query-id="$query_id" --snmp-field=ifName
php cli/add_graphs.php --list-query-types --snmp-query-id="$query_id"
php cli/add_graphs.php --list-graph-templates
```

**Read the result before creating anything.** That table is the evidence for
decisions 7 and 8. Creating graphs first and inspecting later means you have already
committed to whatever the index resolution picked.

Check three things in it:

| Check | Why |
|---|---|
| Every uplink you want is present | A port in a shut state may still appear; a port behind an agent view restriction will not |
| `ifName` is populated on every row | Decision 8 depends on it |
| `ifHighSpeed` reads 1000 or 10000, not 0 | Decision 7's ceiling comes from it |

The third one is the trap. The RRD maximum for a traffic data source is taken from
the speed discovered at the moment the file is created, and written into the file.
If the stored bound remains based on an earlier 100-Mbit speed after a change to
gigabit, valid higher rates can become unknown. Verify the actual maximum and
update it through a supported procedure when needed.
The graph then gaps at high load and looks healthy when quiet.

## 7. The 64-bit counters

The interface query offers several traffic templates. Take a 64-bit one.

**What 32-bit would have cost.** A 32-bit octet counter holds 4294967295. A gigabit
port at line rate fills that in about 34 seconds. On a 300 second step the poller
cannot tell one wrap from seven, and the counter type corrects only a single wrap
between samples. The graph is not obviously broken. It is quietly low, and it stays
quietly low for as long as nobody checks the arithmetic against a port counter on
the switch.

This is why step 1 walked `ifHCInOctets`. If that walk was empty, you do not have
this choice, and a 32-bit template on a gigabit port is a known-wrong graph rather
than a graph.

## 8. The index: `ifName`

This is the decision that costs history when it is wrong.

Each data source records which field identifies its port and that field's value. On
every reindex, the port is found again by asking which SNMP index currently carries
that value in that field. The data source follows the value, not the table position.

The interface query declares a preference order, `ifName`, then `ifDescr`, then
`ifHwAddr`, then `ifIndex`, and takes the first field that is populated on every
discovered port and unique across them.

Prefer a field whose identity remains stable on this device. `ifName` can survive
an index renumbering, but names may change or be reused; test representative changes
and review the chosen field rather than assuming continuity.

**What falling through to `ifIndex` costs.** SNMP interface indexes are not stable.
A card reseat, a reboot or a firmware change renumbers the table. Your port history
then reattaches to whichever port inherited that number. The graph keeps drawing.
The data is wrong and nothing reports it.

Treat a fall-through to `ifIndex` as a finding. It means every field above it failed
on this device, and the reason is worth knowing before you do the other 200 switches.

**Discover the chassis complete.** The uniqueness test runs against whatever the
device returned during that discovery. Discover with a line card pulled and a field
that looked unique across the partial set may not be unique across the full one.

[Data queries and indexes](/concepts/data-queries-and-indexes/) has the identity
argument in full.

## 9. Reindex on uptime

The reindex method decides when the index fields are read again. Set per device, per
data query.

Uptime-based reindexing triggers on a detected decrease in SNMP uptime. Some index
changes occur without that decrease, so this method does not cover every reseat or
configuration change. Verification and refresh have collection costs to measure.

**What None would have cost.** The index is never re-read. A reboot that renumbers
the table leaves every data source pointing at a stale position until somebody
notices and reindexes by hand.

**Verify All Fields.** This adds checks for the query's verification fields.
Measure its work for the actual query and collector; it is not a universal full
walk or a fixed multiplier of the poll window. Unchanged numeric identities alone
cannot detect a physical port being replaced.

Index Count sits between them. It catches a card added or removed without a reboot,
and misses a swap that leaves the count unchanged.

To force one:

```bash
php cli/poller_reindex_hosts.php --id=42
```

## 10. Create four graphs, not forty-eight

Create graphs for the four uplinks. Creating a graph from a data query creates the
data source behind it, and creating the data source is what writes an entry into the
collector's work list. Nothing is collected until that entry exists.

The list options above give you the ids; pass them back in.

```bash
# Set these from the listings above; they are installation-specific IDs.
: "${host_id:?Set the device ID}"
: "${query_id:?Set the interface query ID}"
: "${graph_template_id:?Set the selected 64-bit graph template ID}"
: "${query_type_id:?Set the matching query graph type ID}"
php cli/add_graphs.php --graph-type=ds --host-id="$host_id" \
  --graph-template-id="$graph_template_id" --snmp-query-id="$query_id" \
  --snmp-query-type-id="$query_type_id" --snmp-field=ifName \
  --snmp-value=Gi1/0/49 --reindex-method=1
```

Repeat for each verified uplink name. Check the per-device query's reindex setting
explicitly: `--reindex-method` initializes a new association but does not change
an existing one in this CLI path.

**Why four.** You are proving the path works. Four rows in a log are readable and
forty-eight are not, and if three of four work you have learned something specific
about the fourth. Once the four are collecting cleanly, the other ports are a bulk
operation. [Discover devices automatically](/guides/discover-devices-automatically/)
covers doing this at fleet scale.

## 11. Wait two poller intervals

Start with at least two successful counter readings spanning completed RRD buckets.
Rate calculation needs successive values, but poll timing, heartbeat, step alignment
and graph consolidation affect when data becomes visible. A second unknown sample
alone does not diagnose a fault. Continue with the checks below.

## 12. Verify, in this order

Use these checks together; no single check proves the entire collection path.

**The poller ran.** One statistics line per completed run, in the application log. No
line means you should inspect scheduling, logging configuration, permissions and
errors; it does not by itself prove the scheduler never ran. See [Logging](/reference/logging/).

**The file exists.** Creation and update are separate operations. A present RRD can
contain only unknown values; a missing file can reflect path, permission, deletion
or creation failures. Neither state establishes its full collection history.
[File layout](/reference/file-layout/) has where it lives.

**The file is current.**

```bash
rrdtool last /path/to/rra/sw_ac_03_traffic_in_117.rrd
```

Compare the timestamp with the configured cadence, clock and any deferred-write
queue. Recency alone does not prove that samples are numeric.

**The file has the shape you asked for.**

```bash
rrdtool info /path/to/rra/sw_ac_03_traffic_in_117.rrd
```

Read four things out of it: the step, the heartbeat, the data source type, and the
maximum. The step should match the profile. The type should be a counter. The
maximum should reflect the port speed you saw in decision 6. A ceiling derived from
100 Mbit on a port now running at gigabit is decision 6's trap, caught here before
it costs you anything.

**The values are real numbers.** Inspect an appropriate recent range using
`rrdtool fetch` with the intended consolidation function; unknown values may appear
as `NaN`. `rrdtool info` describes structure and is not a sample-history check. If
values remain unknown, work [Troubleshoot missing data](/guides/troubleshoot-missing-data/) from step 4,
because at this point the device answers and the poller runs.

## 13. Read the graph correctly

Open a recent window first. Archive choice depends on the requested range, graph
width, step and available RRAs; a four-hour view does not guarantee one rendered
point per original sample.

Three things about it are normal:

| What you see | Why |
|---|---|
| The line ends a few minutes before now | The current interval is not complete, so its bucket is not drawn |
| Most of the archive is empty | The archive is allocated in full at creation and fills over time |
| The first sample is missing | A rate needs two readings |

Then widen to a week, and expect the peak to drop. The week view reads a coarser
archive where an AVERAGE series smooths peaks. Four minutes at full capacity and
56 minutes idle averages about 6.7% over an hour. Use the appropriate retained MAX
series to examine sampled peaks; averages alone do not preserve their shape.

Three readings to avoid:

**An average is not a peak.** If you care about saturation, read a graph built on the
maximum. That works because decision 5 kept all four consolidation functions. Had you
dropped `MAX` to save disk, the peaks were never written down and no graph could
recover them.

**A gap is not a zero.** Missing samples, rejected values, insufficient coverage
and graph expressions can all create gaps. A numeric zero is different, but should
still be interpreted in the context of collection and graph transformations.

**Two graphs scale independently.** A small bump and a large one look identical when
each graph scales to its own data. Check the axis, and check its base, because a
graph can label in thousands or in units of 1024.

[Read your first graph](/start/first-graph/) covers all three properly, and
[How graphs are drawn](/concepts/how-graphs-are-drawn/) explains why the same stored
numbers make different pictures.

## What this example deliberately skipped

Each of these is a real decision. Some can follow the pilot, while access controls should be established before
other users or exposed services depend on it.

| Skipped | When you need it |
|---|---|
| Error and discard graphs | As soon as the traffic graph is trusted. Same query, different template |
| A tree placement | Before the device count passes what a list can hold. [Organize devices with trees](/guides/organize-devices-with-trees/) |
| Permissions | Before anyone but you logs in. [Manage users and permissions](/guides/manage-users-and-permissions/) |
| Deferred RRD writes | When storage is the limit, not before. [High volume writes](/concepts/high-volume-writes/) |
| A second data collector | When the collecting side is the limit. [Scale the poller](/guides/scale-the-poller/) |
| Custom templates | When nothing shipped fits. [Create custom templates](/guides/create-custom-templates/) |

## The same eleven decisions at 200 switches

Reuse the tested configuration where devices match, but repeat discovery and
capacity checks for the fleet. Permissions and access policy belong in the pilot,
not after other users begin using the installation.

- Decisions 2, 3 and 4 become device template and discovery rule settings. See
  [Discover devices automatically](/guides/discover-devices-automatically/).
- Decision 5 becomes a profile assignment on the data template, before the first
  bulk creation rather than after.
- Decisions 8 and 9 are properties of the data query and the per-device reindex
  method, so they apply themselves.
- Decisions 10 and 11 become a pilot: take three switches through this page
  completely, then bulk-create the rest.
- Decision 12 becomes something you watch continuously rather than once. See
  [Monitor Kadupul itself](/guides/monitor-kadupul-itself/).

The failure mode at scale is skipping decision 6 on the assumption that every device
in a model family discovers identically. They do not, and the evidence is one query
run per device that you already have.
