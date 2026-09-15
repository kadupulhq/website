---
title: Monitor a Windows host
description: Graph CPU, disks, interfaces and uptime on Windows over the SNMP
  service, which Host Resources objects carry the data, and what to do when SNMP
  is not an option.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 14
slug: 1.2.31/guides/monitor-a-windows-host
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Windows over SNMP gives you interfaces, processors, storage and a couple of counts.
It does not give you load average, memory graphs or a declared partition list,
because the objects those come from are a net-snmp extension and Windows does not
implement them. Most of the work on a Windows host is knowing what is missing and
where the replacement lives.

## What the SNMP service exposes

The Windows SNMP service is an optional component. Microsoft has listed it as
deprecated for several releases, it is not installed by default, and on recent
builds it may not be offered at all. Check that it is present before planning
around it.

What it answers, once running:

| Area | Subtree | Gives you |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Description, uptime, contact, name, location |
| Interfaces | `.1.3.6.1.2.1.2` and `.1.3.6.1.2.1.31` | Traffic, errors, status |
| Host Resources | `.1.3.6.1.2.1.25` | Processors, storage, process count, logged-in users |
| LAN Manager | `.1.3.6.1.4.1.77` | Windows service and share data |

Kadupul's shipped Windows templates read the first three. Nothing in the shipped
set reads the LAN Manager subtree, so do not treat its presence as a sign that
graphs will appear.

Two configuration items on the host decide whether you get anything: the community
string, and the list of managers the agent will accept packets from. A host set to
accept SNMP from a single manager address answers that manager and drops everything
else, including your test from a laptop.

Verify each area from the poller host before building graphs.

```bash
snmpget  -v2c -c public win.example.net sysDescr.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

The second walk is processor load, the third is the storage description list. If the
first works and the other two return nothing, the agent is answering but Host
Resources is not being served, and no template will fix that.

## Add the device

Use the Windows device template. It carries three data queries and the graph
templates that go with them.

| Data query | Backed by | Reads |
|---|---|---|
| SNMP - Interface Statistics | `resource/snmp_queries/interface.xml` | `IF-MIB`, walked directly |
| SNMP - Get Processor Information | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Get Mounted Partitions | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

The disk and processor queries are script server queries despite their names. They
run inside the poller process and issue their own SNMP calls, using the credentials
the device record holds. The interface query is a plain SNMP query. The practical
consequence is that a broken PHP script server stops disk and CPU collection on
Windows while interface graphs carry on.

## What you get without a data query

Two graph templates read one fixed OID each.

| Graph | OID | Stored as |
|---|---|---|
| Host MIB - Processes | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Host MIB - Logged in Users | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Two more read nothing from the device at all. The uptime and polling time graphs
call `scripts/ss_hstats.php` and return a column from Kadupul's own device record:
`snmp_sysUpTimeInstance` for uptime, the recorded poll duration for polling time.
They are a picture of what the poller last stored, not a fresh query. An uptime
graph that keeps climbing while the host is unreachable is this, working as built.

## The Host Resources tables

### Processors

`hrProcessorLoad`, at `.1.3.6.1.2.1.25.3.3.1.2`, returns one entry per logical
processor. The walk supplies both the index and the value, so a 32-thread server
discovers 32 indexes and, if you graph all of them, 32 data sources.

The value is a percentage already. The MIB defines it as an average over the last
minute, which means a five minute poll samples a one minute average once every five
minutes and shows you neither. Treat it as a coarse occupancy signal. If you need
real CPU accounting on Windows, SNMP is not the road.

### Storage

`hrStorageTable`, at `.1.3.6.1.2.1.25.2.3.1`, is the only storage source. The query
reads six columns.

| Column | OID | Direction |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Index |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Index, and the label you see |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Input, the multiplier |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Output |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Output |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Output |

Size and used are counts of allocation units, not bytes. The script multiplies each
by the allocation unit size cached for that index, so the graph reads in bytes.

Two things follow from that, and both bite on Windows.

**The table is not a list of disks.** The agent reports whatever it considers
storage. On Windows that includes physical memory and virtual memory alongside the
fixed drives. Discover a host and you get `C:\`, `D:\`, `Physical Memory` and
`Virtual Memory` in one list. Graph what you want and leave the rest; there is no
filter in the query.

**The counters are signed 32-bit.** A volume large enough to push the allocation
unit count past 2147483647 comes back negative. The script detects a negative value
and adds 4294967296 before multiplying, which recovers the true figure up to the
next wrap. If the allocation unit size is missing or not numeric in that case, the
sample is recorded as unknown rather than guessed.

If you ever attach the plain SNMP flavour of the partition query instead of the
script server one, you lose that correction. The plain query stores the raw column
values and leaves the multiplication to the graph template.

## Where Windows differs from Linux

| Thing | Linux with net-snmp | Windows |
|---|---|---|
| Load average | `.1.3.6.1.4.1.2021.10.1.3` | Not implemented, and not a Windows concept |
| Memory | `.1.3.6.1.4.1.2021.4` | Appears as `hrStorage` rows, not a memory graph |
| CPU | UCD percentages, or `hrProcessorLoad` | `hrProcessorLoad` only |
| Disk list | `dskTable` you declare, or `hrStorage` | `hrStorage` only, unfiltered |
| Disk I/O | `diskIOTable` | Nothing shipped reads it |
| Interface names | Kernel names, short | Long adapter descriptions, often duplicated |

The whole `.1.3.6.1.4.1.2021` subtree is absent. Attaching a net-snmp graph template
to a Windows device produces graphs that collect nothing, with no error on the page.
The log records the failed gets. See
[Troubleshoot missing data](/1.2.31/guides/troubleshoot-missing-data/) for reading that
back.

### Interfaces

The interface query is the same one a switch uses. Its index preference order is
`ifName`, then `ifDescr`, then `ifHwAddr`, then `ifIndex`, and it takes the first
field that is present on every discovered interface and unique across them.

Windows is the platform where that falls through most often. Two identical NICs in
one server can return the same `ifDescr` with only a trailing instance number to
separate them, and some agents leave `ifName` empty. Virtual adapters from a
hypervisor, a VPN client or a container runtime add entries that come and go. If the
query resolves to `ifIndex`, your port history is attached to a number Windows
reassigns freely.

Read the discovered table before creating graphs, and see
[Monitor a switch](/1.2.31/guides/monitor-a-switch/) for how the choice is made and what
reindexing costs.

Uptime is the default reindex trigger, and it works: a Windows reboot moves SNMP
uptime backwards and the indexes get re-read. A driver update or an adapter
disabled in place does not reboot the host, so it does not trigger anything.

## When SNMP is not available

Plenty of Windows estates have no SNMP service to enable. The replacement is a
script data input.

Two facts decide how you write it.

**The script runs on the machine the poller runs on.** Reaching the Windows host is
your script's problem: WinRM, an agent, an HTTP endpoint, a share, whatever you
already operate. Kadupul does not care how the number arrives.

**The poller reads standard output and nothing else.** Exit status is not consulted.
Print a number, or `U` for no reading this cycle. Do not print `0` when you mean
"could not measure".

If you need one value per interface, disk or service instead of a single number, the
same script mechanism has an indexed form. A script query answers four questions:
list the indexes, count them, return a field for every index, and return one field
for one index. The shipped Windows disk and CPU queries are exactly that shape, and
`resource/script_queries/host_cpu.xml` is a worked example that calls a PHP script
rather than the script server.

A PHP script used often should be written for the script server, which loads it into
the running poller instead of starting a PHP process for every data source every
cycle. See
[Write a data collection script](/1.2.31/guides/write-a-data-collection-script/) for the
output contract and the naming limits.

## Failure modes

| Symptom | Usual cause |
|---|---|
| System description reads back, nothing else collects | Host Resources not served, or the manager list rejects the poller |
| No response at all from a host that is up | The agent's accepted manager list, or a host firewall rule on UDP 161 |
| Partition list includes memory | Expected; the agent reports memory as storage |
| A large volume graphs negative or unknown | 32-bit allocation unit count wrapping, uncorrected because the allocation unit size is missing |
| Disk and CPU stop, interfaces keep going | Script server fault; the interface query does not use it |
| Net-snmp templates attached, every sample unknown | The UCD subtree does not exist on Windows |
| Interface history follows the wrong adapter after a change | Index resolved to `ifIndex` because names were blank or duplicated |
| Uptime climbs while the host is unreachable | That graph reads the stored device record, not the device |
