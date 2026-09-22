---
title: Monitor a virtualization host
description: What a hypervisor exposes over SNMP, what ships for ESXi, and why counting guests, CPU and memory on a virtualized estate is harder than it looks.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 27
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

The shipped ESXi package collects host measurements and guest inventory counts.
It does not provide per-guest CPU, memory or contention measurements. Verify the
objects exposed by your hypervisor version before selecting graphs.

## What ships

One hypervisor device template ships: **ESXi Device**. It is a device package, so
`install/templates/ESXi_Device.xml.gz` contains its scripts and data-query files.
Follow [Import and export templates](/guides/import-and-export-templates/) and verify
the import completed, including file deployment. Select the device template,
inspect discovery, and explicitly create the desired graphs; importing the package
or associating a device template alone does not create them.

| Ships | Purpose |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Discovers processors and reads per-processor load |
| `resource/snmp_queries/esxi_hw.xml` | Discovers hardware components and reads their state |
| `resource/snmp_queries/interface.xml` | The standard interface statistics query |
| `resource/script_server/host_disk.xml` | Mounted partitions, through the Host Resources storage table |
| `scripts/ss_esxi_vhosts.php` | Bundled inside `install/templates/ESXi_Device.xml.gz`; counts guests, powered-on guests, and guest tools status |
| `scripts/ss_multicpu_avg.php` | Averages per-processor load into one number |
| `scripts/ss_hstats.php` | Reads polling statistics Kadupul already holds for the device |
| `scripts/ss_host_disk.php` | Backs the partitions query |

No dedicated device package ships for Hyper-V, KVM/libvirt, Xen or Proxmox in this
checkout. Generic Linux/Windows templates may cover host metrics supported by their
agents; hypervisor-specific collection requires suitable templates and collectors. See
[Write a data collection script](/guides/write-a-data-collection-script/).

## Turn on the agent first

Review the existing agent configuration and use instructions for your ESXi version.
The package notes include a factory reset; it is not a routine prerequisite and
would erase existing SNMP configuration. For a community-based setup, the following
commands set agent values; replace the examples and preserve any required existing
communities when setting the community list.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

The first command displays configuration; the last enables the agent. The community
option replaces its configured list. Check required firewall access from the poller
and consult the [ESXCLI SNMP command reference](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
These commands configure community-based polling; they do not configure SNMPv3.
Verify from the machine the poller runs on before adding the device.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

If the first works and the third returns nothing, inspect the SNMP error, access
policy and agent support; an empty walk alone does not identify the cause. The
bundled guest script uses SNMPv1, so a successful v2c probe does not validate its
collection path. Empty guest walks produce zero counts, not necessarily graph gaps;
see [the empty-result bug](https://github.com/kadupulhq/kadupul/issues/245).

## What the host exposes

| Area | Subtree | Gives you |
|---|---|---|
| Processors | `.1.3.6.1.2.1.25.3.3.1` | Load for each processor exposed by the agent |
| Hardware components | `.1.3.6.1.2.1.25.3.2.1` | Component index, description and state |
| Storage | `.1.3.6.1.2.1.25.2.3.1` | Datastores and local filesystems, as the agent chooses to report them |
| Interfaces | `.1.3.6.1.2.1.2` and `.1.3.6.1.2.1.31` | Traffic, errors, status |
| Guest inventory | `.1.3.6.1.4.1.6876` | Per-guest power state and guest tools status |

The first four are the standard Host Resources and interface tables, the same ones a
Linux host answers with. See [Monitor a Linux server](/guides/monitor-a-linux-server/)
for how those behave and which disk table to prefer.

The fifth is the vendor subtree used by the shipped guest-count script.

## The graph templates

| Graph | Source | Reads |
|---|---|---|
| ESXi - CPU | Data query | Load for one discovered processor |
| ESXi - MultiCPU Average | Script | Mean of every processor's load |
| ESXi - Hardware | Data query | State of one discovered component |
| ESXi - VHosts | Script | Guest counts and guest tools status |
| Host MIB - Processes | Fixed OID | Process count on the host |
| Host MIB - Logged in Users | Fixed OID | Session count on the host |
| Device - Uptime | Script | Uptime as Kadupul last recorded it |
| Device - Polling Time | Script | How long Kadupul took to poll this device |
| Interface graphs | Data query | Traffic, errors, packets, status per interface |

The processor query reads load per discovered entry. Do not assume its row count
matches the host's hardware thread count: the packaged index pattern accepts only
one- or two-digit indexes and rejects 100 or greater, even on a host with few CPUs.
Compare discovery with a raw walk; see [the CPU-index bug](https://github.com/kadupulhq/kadupul/issues/246).
The average script independently walks processor loads and averages returned rows.

Device - Uptime and Device - Polling Time read Kadupul's stored device record.
The uptime helper returns the stored SNMP uptime without extrapolating elapsed time;
polling time describes Kadupul's collection work. An old stored value does not prove
current reachability. If collection stops, these helpers do not generate new samples.

## The counting problems

This is the part that makes virtualization different from a physical server, and none
of it is solved by a graph template.

**Guests move.** A guest that migrates to another host disappears from the first host's
inventory and appears on the second's. Independently timed samples may temporarily
double-count or omit that guest. Count changes alone do not prove migration: use
hypervisor inventory identities and events to explain them.

**Resources are shared, so per-guest attribution is an estimate.** The host reports
physical processor load. It does not report which guest caused it. Dividing host CPU by
guest count produces a number that is arithmetically correct and answers no question
anyone asked.

**Overcommit makes allocation and use different quantities.** Assigned virtual CPUs can
exceed physical cores, and assigned memory can exceed physical memory, deliberately. A
graph of assigned resources describes allocation rather than measured demand.
Compare it with physical capacity, configured limits and actual use.

**Contention does not appear in these tables.** The measurements that tell you a guest
is being starved, the time it spent waiting for a physical processor and the memory the
host reclaimed from it, are not in what this template collects. A host at 60 percent
CPU with badly contended guests looks identical here to a host at 60 percent CPU with
happy ones.

**Guest and host measurements answer different questions.** Guest utilization alone
may not explain host scheduling delays. Correlate guest/application measurements
with hypervisor contention metrics rather than deriving attribution from host load.

### What to do instead

| Question | Where the answer is |
|---|---|
| Is the host saturated | Host processor load, from the host |
| Is a guest saturated | Inside the guest, plus a contention metric the hypervisor holds |
| How many guests are running | Host guest inventory, as a count |
| Is the estate over capacity | Not from these graphs. It needs placement data the host does not expose |
| Did a guest move | Hypervisor inventory identities and migration events; count steps alone are insufficient |

Monitor guests as their own devices for anything about the guest, and monitor the host
for anything about the host. Resist building per-guest graphs from host-level numbers:
they are derived, they look authoritative, and they are wrong in ways nobody can spot
later.

## Traps in the shipped guest count

The guest inventory script is worth understanding before you rely on its output.

**It walks with SNMP version 1 and the community string only.** The version is fixed in
the script and the v3 credentials on the device are not passed. A device configured for
v3 can collect through other paths while guest collection fails. Guest collection may
still succeed if that agent independently accepts the stored community over v1;
selecting v3 on the device does not itself determine the outcome. Empty guest walks
are returned as zeros. Check this protocol mismatch without downgrading an agent's
security policy to accommodate the helper.

**The count comes from the power state table.** The number reported as the guest total
is the number of entries returned by a walk of the power state subtree, not of a
separate inventory object. A guest that the host lists but that has no power state entry
is not counted.

**Powered-on is matched on state text.** After trimming and lowercasing, only
`powered on` and `poweredon` increment the running count. Other representations do
not; compare the raw agent response before interpreting a zero.

**Guest tools classification has a confirmed defect.** The literal `not installed`
is counted as running because its match starts at offset zero. Unrecognized text
also falls through to running. Do not treat that count as proof of healthy tools;
see [the tools-status bug](https://github.com/kadupulhq/kadupul/issues/244).

**It walks three times per call.** It reads the power-state table twice, then the
tools table, so even its own counts are not an atomic inventory snapshot. On a host
with many guests, measure that collection cost. If the poller is tight, this is a candidate for a longer interval before
it is a candidate for more threads. See [Scale the poller](/guides/scale-the-poller/).

The script normally emits all five named values, including zeros for empty walks.
A failed walk can therefore yield a syntactically complete but misleading sample.
For incomplete output, the PHP output processor checks the fields required by the
associated data source and withholds incomplete timestamp groups; it does not
necessarily discard them immediately. See [The poller cache](/concepts/the-poller-cache/).

## Traps in the rest

**The processor average hides imbalance.** A host with one pinned core and 63 idle ones
averages low. Keep validated per-processor graphs where that matters. The average
helper also returns `load:0` for an empty walk, indistinguishable from measured idle
CPU; correlate it with collection status and the known empty-result bug.

**Processor indexes are positional.** They are discovered by walking the processor
table. If agent indexes change, verify identity mappings before trusting continuity.
The packaged one-/two-digit restriction is a separate discovery defect.

**Storage entries are whatever the agent calls storage.** Expect datastores mixed with
things you did not want, in allocation units that need multiplying. This is the Host
Resources behaviour, not an ESXi quirk. Verify cached allocation units before
interpreting bytes; the shared script has a [known conversion defect](https://github.com/kadupulhq/kadupul/issues/243)
for invalid negative samples or missing multipliers.

**Interface names on a hypervisor are stable until they are not.** A driver update or a
reconfiguration can renumber them. See [Monitor a switch](/guides/monitor-a-switch/) for
how the index is chosen and why it matters.

**The scripts run on the poller host.** They reach the hypervisor themselves, using the
device ID passed by the cached command. The guest and CPU-average helpers fetch the
current device row on each call; a community change does not require rebuilding
those command arguments. Other collectors may embed credentials in their work
items. See [The poller cache](/concepts/the-poller-cache/).

## Failure modes

| Symptom | Usual cause |
|---|---|
| Everything collects except guest counts | The device is configured for SNMP v3 and the guest script speaks v1 |
| Guest count is right, powered-on count is zero | Check the exact power-state text and whether the second walk succeeded |
| Guest count drops to zero and recovers | Check failed/empty walks; the helper can emit a complete line of zeros |
| Processor graphs appear and then stop after a hardware change | Check changed indexes and the packaged restriction to one or two digits |
| Host CPU flat and low while guests are slow | Check collection failures as well as contention; an empty average walk is reported as zero |
| Datastore graphs include partitions you did not ask for | The agent reports them as storage |
| Uptime graph looks wrong after a poller outage | It reports Kadupul's last recorded value, not a live read |
| Total guests across hosts jumps during maintenance | Guests migrating are briefly counted twice, or not at all |
