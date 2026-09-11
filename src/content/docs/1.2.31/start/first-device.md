---
title: Add your first device
description: Get one device polling, and confirm the data is arriving before you
  build anything on top of it.
sidebar:
  order: 3
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/start/first-device
---

Add one device, confirm it is answering, and only then move on. Most trouble with a
monitoring system traces back to a device that was never really answering in the
first place.

:::caution[Nothing to add yet]
Kadupul has not shipped. Follow this page as the intended sequence, not as
something you can carry out today.
:::

Pick a device you can afford to get wrong. A switch you own, on a network you
control, with SNMP already enabled. Do not start with the device somebody is
asking you about.

## Before you start

The device must be reachable and must answer SNMP. Confirm that from the machine
Kadupul runs on, not from your laptop. The two often have different firewall paths.

```bash
snmpget -v2c -c public switch.example.net sysDescr.0
```

If that returns a description string, continue. If it times out, fix that first.
No amount of configuration in the web interface will make an unreachable device
answer.

Then check the table you actually want to graph, because a device can answer
`sysDescr` and still refuse the interface table.

```bash
snmpwalk -v2c -c public switch.example.net ifDescr
```

You want one line per interface. An empty result, or an authorization error, means
the agent's view excludes that subtree. That is a change on the device, not here.

Two facts about SNMP versions decide things later, so settle them now.

| Version | What it means for you |
|---|---|
| v1 | No 64-bit counters. A gigabit interface will wrap and produce nonsense |
| v2c | 64-bit counters, community string sent in the clear |
| v3 | Authentication and privacy, more to configure and more to get wrong |

Use v2c or v3. If the device only speaks v1, expect the counter problems in the
failure table at the bottom of this page. [SNMP](/1.2.31/reference/snmp/) covers the
credential fields in full.

## Decide three things before you open the form

**The credentials.** Exactly the ones you tested above, including the port if it is
not the default.

**The availability method.** This is how Kadupul decides the device is up, and it
is independent of whether collection works. The shipped choices are none, ping,
SNMP uptime, SNMP description, SNMP getNext, and two combinations of ping with SNMP
uptime, one requiring both and one accepting either.

Prefer an SNMP method for a device you are polling over SNMP. It tests the thing
you depend on. ICMP ping needs a raw socket, which needs privilege the web and
poller users do not normally have, so a device that answers `ping` from your shell
can still be reported down. A TCP ping against a port you know is open avoids that.

**The device template.** Choose one that matches the hardware.

## Add it

1. Create the device with its hostname or address, SNMP version, and community or
   credentials.
2. Set the availability method you chose.
3. Choose the device template.
4. Save, and read the status panel it shows you.

## What the device template decides

A device template is a bundle of associations, not a bundle of graphs. Applying one
associates a set of graph templates and data queries with the device. It does not
create a single data source or a single graph on its own.

That matters in two directions. Picking the wrong template does not corrupt
anything, because nothing has been created yet; you change the template and
reapply. And picking the right template does not finish the job, because you still
have to create graphs from what it made available.

A data query is the part that finds the repeating things: interfaces, disks,
sensors. It walks a table on the device and produces one index per row, which is
why you pick interfaces from a list rather than typing OIDs.
[Templates](/1.2.31/concepts/templates/) and [Data queries and
indexes](/1.2.31/concepts/data-queries-and-indexes/) cover both properly.

## Read the status panel

When the device is saved with an SNMP availability method, Kadupul opens a session
and reports back. This is the check that matters, and it is the one people skip.

| What you see | What it means |
|---|---|
| System, Uptime, Hostname, Location, Contact, all filled in | The session worked. Continue |
| SNMP not in use | No community or username on the device, or the version is set to none |
| Session SNMP error | The session could not be opened at all. Address, port, or firewall |
| System SNMP error | The session opened but `sysDescr` did not come back. Usually a view restriction |
| Host SNMP error | Neither description nor uptime came back |
| Uptime shown as `U` | Uptime was not readable. Some devices genuinely do not report it |

If the availability method includes ping, a separate ping result appears below.
Read both. A device can pass one and fail the other, and which one fails tells you
where to look.

A device that saves cleanly but reports no system description is not being polled.
Treat that as a failure even though nothing showed an error.

## Create the data sources and graphs

The device is now known and reachable. It is still not collecting anything, because
no data source exists yet.

From the device's own page, create graphs from what its template made available.
For a switch this means running the interface data query, picking the interfaces
you care about, and choosing a graph type for them. Pick two or three interfaces,
not all forty-eight. You are proving the path works, and a small first batch is far
easier to read in the next step.

Creating a graph from a data query creates the data source behind it, and creating
the data source is what puts an entry into the poller cache. Nothing is collected
until that entry exists.

## Confirm it is collecting

Give it two poller intervals, then check that the data source has a recent update
time. A graph drawn before any data exists is empty, which looks identical to a
graph of a device that is down. Waiting for the second interval removes that
ambiguity.

Check three things, in this order.

**The poller ran.** The log records the end of each run with a summary. No entries
means nothing is being scheduled, and that is an install problem, not a device
problem. See [Logging](/1.2.31/reference/logging/).

**The file exists and is recent.** Default file names are built from the device
description, the data source name, and an internal id, under the RRD directory; see
[File layout](/1.2.31/reference/file-layout/). Ask RRDtool when the file was last written:

```bash
rrdtool last /path/to/rra/switch_example_net_traffic_in_12.rrd
```

The timestamp should be within one interval of now. A file that exists with a
creation-time timestamp means the poller created it and never fed it.

**The value is not unknown.** Two consecutive real numbers are what you are after.
A counter data source has nothing to report on its first sample, because a rate
needs two readings, so the first interval producing unknown is normal. The second
one producing unknown is not.

## Common first failures

| Symptom | Usual cause |
|---|---|
| Saves, but no system description | Wrong community string, or SNMP v3 credentials rejected |
| Session SNMP error from Kadupul, `snmpget` works from your laptop | Firewall path differs, or the agent restricts by source address |
| Device shows down, but SNMP data arrives | Availability set to ICMP ping, which cannot open a raw socket |
| Description appears, no data | Poller not scheduled, or running as a user that cannot write the RRD directory |
| Data query returns no interfaces | Agent view excludes the interface table, or the device needs a reindex |
| First value unknown, then fine | Normal for a counter. It needs two readings to produce a rate |
| Every value unknown | Data source type is wrong, or the device returns a string where a number is expected |
| Data for a while, then gaps | Poller taking longer than its interval, or the device rate limiting SNMP |
| Counters that jump absurdly | 32-bit counter wrapping on a fast interface, use 64-bit counters |
| Interfaces graph the wrong ports after a reboot | Indexes shifted. The data query needs a reindex method that notices |

The last one is worth understanding before you have a hundred switches: SNMP
interface indexes are not guaranteed stable across a reboot or a module change. The
reindex method on a data query is what keeps a graph pointed at the same physical
port. [Data queries and indexes](/1.2.31/concepts/data-queries-and-indexes/) explains the
choices.

When you have one device collecting cleanly, add the rest in bulk rather than one
at a time. [Discover devices automatically](/1.2.31/guides/discover-devices-automatically/)
and the command line tools in [Command line
tools](/1.2.31/reference/command-line-tools/) both beat repeating this page fifty times.

Next: [Read your first graph](/1.2.31/start/first-graph/).
