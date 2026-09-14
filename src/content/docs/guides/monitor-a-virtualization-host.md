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

A hypervisor over SNMP gives you the host. It gives you very little about the guests,
and what it does give you is a list, not a measurement. Plan around that before
building graphs, because the graphs are easy and the counting is not.

## What ships

One hypervisor device template ships: **ESXi Device**. It is a device package, so
installing it also installs the scripts and data queries it depends on rather than
expecting them to already be present.

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

Nothing ships for Hyper-V, KVM or libvirt, Xen, or Proxmox. Those are a device
template you build, on top of whatever their agent exposes. See
[Write a data collection script](/guides/write-a-data-collection-script/).

## Turn on the agent first

The package carries the host-side setup in its own notes. On the hypervisor:

```
esxcli system snmp set -r
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

The first command resets the agent's configuration, the last enables it. Verify from
the machine the poller runs on, not from your workstation, before adding the device.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net sysDescr.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

If the first works and the third returns nothing, the host is answering but the guest
inventory subtree is not exposed. Every guest-related graph below will stay empty and
the device will otherwise look healthy.

## What the host exposes

| Area | Subtree | Gives you |
|---|---|---|
| Processors | `.1.3.6.1.2.1.25.3.3.1` | One load value per logical processor |
| Hardware components | `.1.3.6.1.2.1.25.3.2.1` | Component index, description and state |
| Storage | `.1.3.6.1.2.1.25.2.3.1` | Datastores and local filesystems, as the agent chooses to report them |
| Interfaces | `.1.3.6.1.2.1.2` and `.1.3.6.1.2.1.31` | Traffic, errors, status |
| Guest inventory | `.1.3.6.1.4.1.6876` | Per-guest power state and guest tools status |

The first four are the standard Host Resources and interface tables, the same ones a
Linux host answers with. See [Monitor a Linux server](/guides/monitor-a-linux-server/)
for how those behave and which disk table to prefer.

The fifth is the vendor's own subtree and is the only part that knows guests exist.

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

The processor query indexes on the processor table and reads load per entry, so a host
with 64 logical processors discovers 64 indexes and can carry 64 graphs. The average
graph exists because that is rarely what you want to look at.

The last two read from Kadupul's own record of the device rather than from the device.
Uptime is the value stored at the last availability check, and polling time is Kadupul
measuring itself. They are useful and they are not hypervisor metrics. If the poller
stops, both go stale in a way that looks like the host reporting something.

## The counting problems

This is the part that makes virtualization different from a physical server, and none
of it is solved by a graph template.

**Guests move.** A guest that migrates to another host disappears from the first host's
inventory and appears on the second's, with no event anywhere in the graph. Two host
graphs step in opposite directions at the same moment and neither is wrong. Any total
built by adding hosts together double counts during the migration window and any per
host trend is really a trend in placement decisions.

**Resources are shared, so per-guest attribution is an estimate.** The host reports
physical processor load. It does not report which guest caused it. Dividing host CPU by
guest count produces a number that is arithmetically correct and answers no question
anyone asked.

**Overcommit makes allocation and use different quantities.** Assigned virtual CPUs can
exceed physical cores, and assigned memory can exceed physical memory, deliberately. A
graph of assigned resource has no ceiling worth drawing and tells you about your
configuration rather than your load.

**Contention does not appear in these tables.** The measurements that tell you a guest
is being starved, the time it spent waiting for a physical processor and the memory the
host reclaimed from it, are not in what this template collects. A host at 60 percent
CPU with badly contended guests looks identical here to a host at 60 percent CPU with
happy ones.

**The guest's own view is wrong in a specific direction.** A guest measuring its own CPU
does not see the time it was not scheduled. Utilisation inside the guest can read low
while the application is slow. That is not a collection bug and no amount of polling the
guest fixes it.

### What to do instead

| Question | Where the answer is |
|---|---|
| Is the host saturated | Host processor load, from the host |
| Is a guest saturated | Inside the guest, plus a contention metric the hypervisor holds |
| How many guests are running | Host guest inventory, as a count |
| Is the estate over capacity | Not from these graphs. It needs placement data the host does not expose |
| Did a guest move | Inventory count steps on two hosts at once |

Monitor guests as their own devices for anything about the guest, and monitor the host
for anything about the host. Resist building per-guest graphs from host-level numbers:
they are derived, they look authoritative, and they are wrong in ways nobody can spot
later.

## Traps in the shipped guest count

The guest inventory script is worth understanding before you rely on its output.

**It walks with SNMP version 1 and the community string only.** The version is fixed in
the script and the v3 credentials on the device are not passed. A device configured for
v3 collects processors, hardware and interfaces normally and returns zeros for every
guest field. The device looks healthy. This is the most likely reason a VHosts graph is
flat at zero.

**The count comes from the power state table.** The number reported as the guest total
is the number of entries returned by a walk of the power state subtree, not of a
separate inventory object. A guest that the host lists but that has no power state entry
is not counted.

**Powered-on is matched on the state text.** Guests are counted as running when their
state reads as powered on. A firmware version that words the state differently reports
every guest as not running, with no error.

**Guest tools status is bucketed by text as well**, into running, not running, and not
installed. The same caution applies.

**It walks three times per poll.** On a host with many guests, on a short interval, that
cost is real. If the poller is tight, this is a candidate for a longer interval before
it is a candidate for more threads. See [Scale the poller](/guides/scale-the-poller/).

The script emits five values in one line, which means all five have to arrive for any of
them to be written. A partial return discards the whole timestamp.

## Traps in the rest

**The processor average hides imbalance.** A host with one pinned core and 63 idle ones
averages low. Keep the per-processor graphs for hosts where that matters, and accept the
graph count.

**Processor indexes are positional.** They are discovered by walking the processor
table. Hardware changes renumber them, and a graph then follows a different physical
processor than it did before, with no visible break.

**Storage entries are whatever the agent calls storage.** Expect datastores mixed with
things you did not want, in allocation units that need multiplying. This is the Host
Resources behaviour, not an ESXi quirk.

**Interface names on a hypervisor are stable until they are not.** A driver update or a
reconfiguration can renumber them. See [Monitor a switch](/guides/monitor-a-switch/) for
how the index is chosen and why it matters.

**The scripts run on the poller host.** They reach the hypervisor themselves, using the
credentials stored on the device. A community string changed on the device page does not
reach them until the work list is rebuilt.
See [The poller cache](/concepts/the-poller-cache/).

## Failure modes

| Symptom | Usual cause |
|---|---|
| Everything collects except guest counts | The device is configured for SNMP v3 and the guest script speaks v1 |
| Guest count is right, powered-on count is zero | The power state text does not match what the script looks for |
| Guest count drops to zero and recovers | The guest subtree stopped answering for one cycle; all five fields are lost together |
| Processor graphs appear and then stop after a hardware change | The processor indexes were renumbered |
| Host CPU flat and low while guests are slow | Contention, which these tables do not expose |
| Datastore graphs include partitions you did not ask for | The agent reports them as storage |
| Uptime graph looks wrong after a poller outage | It reports Kadupul's last recorded value, not a live read |
| Total guests across hosts jumps during maintenance | Guests migrating are briefly counted twice, or not at all |
