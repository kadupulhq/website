---
title: Add your first device
description: Get one device polling, and confirm the data is arriving before you build anything on top of it.
sidebar:
  order: 3
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Add one device, confirm it is answering, and only then move on. Most trouble with a
monitoring system traces back to a device that was never really answering in the
first place.

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Pick a device you can afford to get wrong. A switch you own, on a network you
control, with SNMP already enabled. Do not start with the device somebody is
asking you about.

## Before you start

For this SNMP example, the device must answer queries from its assigned
collector. Run the checks on that collector, preferably as the poller user; a
request from your laptop can take a different firewall path. Replace the example
address and community with the read-only credentials configured on your device.
Numeric OIDs below also work when local MIB name files are not installed.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

If that returns a description string, continue. If it times out, fix that first.
No amount of configuration in the web interface will make an unreachable device
answer.

Then check the table you actually want to graph, because a device can answer
`sysDescr` and still refuse the interface table.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

The second OID is the `ifDescr` column. You want one row per exposed interface.
An empty result can mean a restricted SNMP view or an unsupported table; an
authorization error points to credentials or access policy. Inspect the returned
error before changing the device or Kadupul configuration.

Two facts about SNMP versions decide things later, so settle them now.

| Version | What it means for you |
|---|---|
| v1 | No Counter64 support. Fast links can wrap 32-bit octet counters multiple times between polls, making the rate ambiguous |
| v2c | Supports Counter64 when the agent exposes it; community strings are sent in clear text |
| v3 | Supports authentication and encryption with `authPriv`; choosing v3 alone does not enable both |

Prefer v3 with `authPriv` where supported, or v2c on a restricted management
network. Select the 64-bit interface graph type as well as the SNMP version.
If the device only speaks v1, consider the polling interval and traffic rate in the
failure table at the bottom of this page. [SNMP](/reference/snmp/) covers the
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

1. In the legacy **Devices** page (`host.php`), choose **Add**. Device creation
   and graph setup still use this page during the Symfony migration. Enter a
   description, hostname or address, assigned collector, SNMP version, and credentials.
2. Set the availability method you chose.
3. Choose the device template.
4. Save, confirm the device is enabled, and read its availability/SNMP panel.
   A saved database record is not evidence that collection has succeeded.

## What the device template decides

A device template associates graph templates and data queries with the device.
Applying it also runs data queries to populate their indexes. With graph
automation disabled, those associations do not by themselves create graphs.
When graph automation is enabled, template/query hooks can create graphs under
matching rules; inspect the existing graphs before adding another copy.

Changing a template can alter associations and run those hooks again. It is not
a reset of existing graphs or data sources. Check the selected template and
queried indexes before applying it to a device that already has history.

A data query is the part that finds the repeating things: interfaces, disks,
sensors. It walks a table on the device and produces one index per row, which is
why you pick interfaces from a list rather than typing OIDs.
[Templates](/concepts/templates/) and [Data queries and
indexes](/concepts/data-queries-and-indexes/) cover both properly.

## Read the status panel

When the device is saved with an SNMP availability method, Kadupul opens a session
and reports back. This is the check that matters, and it is the one people skip.

| What you see | What it means |
|---|---|
| System and uptime queries succeed | The panel can read basic SNMP metadata. This does not yet prove interface collection |
| Location or Contact is empty | These optional metadata fields may be unset; emptiness alone is not a collection failure |
| SNMP not in use | No community or username on the device, or the version is set to none |
| Session SNMP error | Session setup failed; inspect the displayed error, credentials, protocol and connection settings |
| System SNMP error | Reading `sysDescr` failed; check the returned error, agent view, credentials and reachability |
| Host SNMP error | Neither description nor uptime came back |
| Uptime shown as `U` | Uptime was not readable. Some devices genuinely do not report it |

If the availability method includes ping, a separate ping result appears below.
Read both. A device can pass one and fail the other, and which one fails tells you
where to look.

A blank system description does not prove that collection is failing. The code
accommodates agents with an empty description and usable uptime. Disabled
devices bypass the availability check, and non-SNMP availability methods do not
show this SNMP panel. Verify the actual query and poller cache next.

## Create the data sources and graphs

For a new device without automation-created graphs, the next step is to create
the graph and its data source. Check **Data Source List** and **View Poller Cache**
on the device page instead of assuming they are empty.

From the device page, choose **Create Graphs for this Device**.
For a switch this means running the interface data query, picking the interfaces
you care about, and choosing a graph type for them. Pick two or three interfaces,
not all forty-eight. You are proving the path works, and a small first batch is far
easier to read in the next step.

An indexed graph associates data sources with the chosen interface and prepares
their poller-cache entries; compatible existing sources can be reused. The graph
creation response is not proof of polling. Check that the cache contains the
expected device, interface OIDs and RRD path.

## Confirm it is collecting

Wait for scheduled collection cycles, then check both timestamps and values.
An empty graph can mean startup normalization, an unknown value or failed
collection. Two counter readings are necessary to calculate a rate, but two
poller runs do not guarantee a completed, valid archive bucket.

Check three things, in this order.

**The poller ran.** Look for the end-of-run summary in the configured log. If it
is absent, check scheduling, log destination and permissions, and whether the
poller exited before completing. See [Logging](/reference/logging/).

**The file exists and is recent.** Copy the actual RRD path from the data source or poller cache; do not guess
it from the hostname. Paths and names can be customized. See
[File layout](/reference/file-layout/). Ask RRDtool when the file was last written:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

The timestamp should advance on successful writes. A recent timestamp can still
accompany an unknown value, and buffered writes can delay the on-disk timestamp.
For `rrdcached` or Boost, check that component’s flush state as well.

**The value is not unknown.** `lastupdate` shows the latest supplied values; for
a counter these are counters, not computed traffic rates. Inspect completed rows
from `fetch` for finite rates. Startup timing, step alignment, heartbeat, bounds
and the archive’s unknown-data threshold all affect when a usable row appears.
Do not diagnose a fault from the first two rows alone. If unknowns persist, inspect
the collected values, data-source type, heartbeat and poller errors.

## Common first failures

| Symptom | Usual cause |
|---|---|
| Saves, but system-description lookup reports an error | Check credentials, agent view and collector reachability; an empty description alone is not sufficient evidence |
| Session SNMP error from Kadupul, `snmpget` works from your laptop | Firewall path differs, or the agent restricts by source address |
| Device shows down, but SNMP data arrives | Availability set to ICMP ping, which cannot open a raw socket |
| Description appears, no data | Poller not scheduled, or running as a user that cannot write the RRD directory |
| Data query returns no interfaces | Agent view excludes the interface table, or the device needs a reindex |
| First value unknown, then fine | Normal for a counter. It needs two readings to produce a rate |
| Unknown values persist | Failed collection, invalid values, type/bounds mismatch, heartbeat or archive normalization |
| Data for a while, then gaps | Poller taking longer than its interval, or the device rate limiting SNMP |
| Counter rates are implausible | Multiple 32-bit wraps, a counter reset, units or data-source settings; use supported 64-bit counters on fast links |
| Interfaces graph the wrong ports after a reboot | Indexes shifted. The data query needs a reindex method that notices |

The last one is worth understanding before you have a hundred switches: SNMP
interface indexes are not guaranteed stable across a reboot or a module change. The
reindex method on a data query is what keeps a graph pointed at the same physical
port. [Data queries and indexes](/concepts/data-queries-and-indexes/) explains the
choices.

When you have one device collecting cleanly, add the rest in bulk rather than one
at a time. [Discover devices automatically](/guides/discover-devices-automatically/)
and the command line tools in [Command line
tools](/reference/command-line-tools/) both beat repeating this page fifty times.

Next: [Read your first graph](/start/first-graph/).
