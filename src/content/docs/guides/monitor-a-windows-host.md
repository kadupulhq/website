---
title: Monitor a Windows host
description: Graph CPU, disks, interfaces and uptime on Windows over the SNMP service, which Host Resources objects carry the data, and what to do when SNMP is not an option.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 14
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Windows over SNMP gives you interfaces, processors, storage and a couple of counts.
The built-in Microsoft agent does not provide the Net-SNMP UCD templates' load,
memory and configured-disk objects. Memory can still be graphed through storage
rows when the agent exposes them. Third-party agents may expose different objects;
check the actual agent before choosing templates.

## What the SNMP service exposes

The Windows SNMP service is deprecated and optional. For Windows 10 and 11,
Microsoft documents installation through Optional features or Windows capabilities;
a legacy DISM feature-name error alone does not prove it is unavailable. Check the
instructions for your Windows edition and build before planning around it. See
[Microsoft's SNMP installation guidance](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Check which of these subtrees your installed agent exposes:

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

Verify each area from the poller host before building graphs. Replace the example
host and community with your configured values; `public` is illustrative.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

The second walk is processor load, the third is the storage description list. If the
first works and the other two return nothing, check access restrictions, agent
support and the returned SNMP error. An empty walk alone does not establish that
the entire Host Resources module is absent.

## Add the device

Import `install/templates/Windows_Device.xml.gz` if its templates are missing,
following [Import and export templates](/guides/import-and-export-templates/).
Select the Windows device template, verify query discovery, then explicitly create
the desired graphs. A device-template association alone does not create them.
The package carries three data queries and their associated graph templates.

| Data query | Backed by | Reads |
|---|---|---|
| SNMP - Interface Statistics | `resource/snmp_queries/interface.xml` | `IF-MIB`, walked directly |
| SNMP - Get Processor Information | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Get Mounted Partitions | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

The disk and processor queries are script server queries despite their names. They
run in a separate, long-lived PHP script-server process and issue SNMP calls with the credentials
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
They read stored measurements, not a fresh SNMP response. The helper does not add
elapsed time to uptime: an unchanged stored value remains unchanged. These graphs
alone do not establish current reachability.

## The Host Resources tables

### Processors

`hrProcessorLoad`, at `.1.3.6.1.2.1.25.3.3.1.2`, returns one entry per logical
processor exposed by the agent. The walk supplies the indexes; do not assume that
its row count always equals the machine's advertised hardware thread count.

The value is a percentage already. The MIB defines it as an average over the last
minute, which means a five minute poll samples a one minute average once every five
minutes. That is a sampled one-minute average, not a continuous five-minute average.
See the [Host Resources MIB definition](https://www.rfc-editor.org/rfc/rfc2790.html).
Use a collection method and interval appropriate to the detail you need.

### Storage

The shipped storage query uses `hrStorageTable`, at `.1.3.6.1.2.1.25.2.3.1`. It
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
by the allocation unit size cached for that index when both values are valid.
Verify that cached multiplier before interpreting the result as bytes.

Two things follow from that, and both bite on Windows.

**The table is not a list of disks.** The agent reports whatever it considers
storage. Depending on the agent, physical memory and virtual memory may appear
alongside fixed drives. Labels such as `C:\`, `D:\`, `Physical Memory` and
`Virtual Memory` are examples, not guaranteed rows. Select the rows you want to
graph; the query XML does not filter them by storage type.

**Large or invalid storage values need verification.** The MIB defines size and
used as nonnegative Integer32 values. An agent returning a negative value is outside
that range; do not assume a universal wrap correction. The current script uses
`(abs(value) + 2147483647) * allocation_units`, which is not unsigned 32-bit
reinterpretation. With a missing multiplier it can return raw units for positive
values or raise a PHP type error for negative values. Treat affected samples as
unreliable, verify the agent and cached allocation units, and reindex after fixing
discovery. See the [storage conversion bug](https://github.com/kadupulhq/kadupul/issues/243).

If you ever attach the plain SNMP flavour of the partition query instead of the
script server one, conversion follows a different path: the plain query stores raw
column values and leaves multiplication to the graph template. Switching queries
is not proof that an invalid agent value has been repaired.

## Where Windows differs from Linux

| Thing | Linux with net-snmp | Built-in Windows agent / shipped templates |
|---|---|---|
| Load average | `.1.3.6.1.4.1.2021.10.1.3` | No UCD load-average objects |
| Memory | `.1.3.6.1.4.1.2021.4` | Can be graphed from exposed `hrStorage` rows |
| CPU | UCD percentages, or `hrProcessorLoad` | `hrProcessorLoad` only |
| Disk list | `dskTable` you declare, or `hrStorage` | `hrStorage` only, unfiltered |
| Disk I/O | `diskIOTable` | Nothing shipped reads it |
| Interface names | Kernel names, short | Long adapter descriptions, often duplicated |

The built-in Microsoft agent does not supply the UCD `.1.3.6.1.4.1.2021` subtree.
Attaching templates for unsupported objects does not make them collect data.
Check the poller log and actual SNMP responses; a third-party agent may differ. See
[Troubleshoot missing data](/guides/troubleshoot-missing-data/) for reading that
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
[Monitor a switch](/guides/monitor-a-switch/) for how the choice is made and what
reindexing costs.

With uptime-based reindexing, a detected decrease in SNMP uptime triggers a new
query. Adapter changes can occur without that decrease and go undetected by this
method. Check the query's configured reindex method and refresh discovery after
changes; see [Data queries and indexes](/concepts/data-queries-and-indexes/).

## When SNMP is not available

Plenty of Windows estates have no SNMP service to enable. The replacement is a
script data input.

Two facts decide how you write it.

**The script runs on the machine the poller runs on.** Reaching the Windows host is
your script's problem: WinRM, an agent, an HTTP endpoint, a share, whatever you
already operate. Kadupul does not care how the number arrives.

**Return measurements on standard output.** The PHP poller's external-command
path does not use the exit status as the measurement. Print a number, or `U` for
no reading this cycle; keep diagnostics off standard output. Do not print `0` when you mean
"could not measure".

If you need one value per interface, disk or service instead of a single number, the
same script mechanism has an indexed form. A script query answers four questions:
list the indexes, count them, return a field for every index, and return one field
for one index. The shipped Windows disk and CPU queries are exactly that shape, and
`resource/script_queries/host_cpu.xml` is a worked example that calls a PHP script
rather than the script server.

A PHP script can use the script server to reuse a separate PHP process across
requests. It must follow the script-server function contract. See
[Write a data collection script](/guides/write-a-data-collection-script/) for the
output contract and the naming limits.

## Failure modes

| Symptom | Usual cause |
|---|---|
| System description reads back, nothing else collects | Check object support, access restrictions and the specific SNMP error |
| No response at all from a host that is up | The agent's accepted manager list, or a host firewall rule on UDP 161 |
| Partition list includes memory | Expected; the agent reports memory as storage |
| A large volume graphs negative or unknown | Invalid agent values or missing/stale allocation units; verify raw values and the known conversion bug |
| Disk and CPU stop, interfaces keep going | Script server fault; the interface query does not use it |
| Net-snmp templates attached, every sample unknown | The selected agent does not expose the UCD objects required by those templates |
| Interface history follows the wrong adapter after a change | Index resolved to `ifIndex` because names were blank or duplicated |
| Uptime repeats an old value | Check whether the device record is stale; the helper does not extrapolate uptime |
