---
title: Monitor a Linux server
description: Graph CPU, memory, disk and load on a Linux host over net-snmp, what snmpd has to expose for it to work, and how to reach for a script when SNMP does not cover it.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 3
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A Linux host with net-snmp gives you most of what you want without writing anything.
The work is in getting `snmpd` to expose the right subtrees, and in knowing which of
the two overlapping disk MIBs you are looking at.

## What snmpd has to expose

Kadupul reads four areas. All of them have to be inside the view your community or
v3 user is granted.

| Area | Subtree | Gives you |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Description, uptime, contact, name, location |
| Interfaces | `.1.3.6.1.2.1.2` and `.1.3.6.1.2.1.31` | Traffic, errors, status |
| Host Resources | `.1.3.6.1.2.1.25` | Processes, logged-in users, storage, processors |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Load average, memory, CPU time, disk I/O, declared partitions |

Several distributions ship a default `snmpd.conf` that grants a view covering only
the system subtree. The device then answers, reports a system description, and
collects nothing. That combination is the most common first failure on a Linux host,
and it looks identical to a template problem.

Verify each area from the poller host before building graphs.

```bash
snmpget  -v2c -c public server.example.net sysDescr.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

If the second and third return nothing while the first works, the view is the
problem, not Kadupul.

## Add the device

Use the net-snmp device template. It carries the data queries and graph templates
below, so choosing it at creation time does most of the work.

## What you get without a data query

These graph templates read a single fixed OID each. They apply to every host, so no
discovery is involved.

| Graph | OID | Stored as |
|---|---|---|
| Load average, 1 minute | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Load average, 5 minute | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Load average, 15 minute | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Memory total | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memory free | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memory buffers | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memory cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU user | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU system | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU idle | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupts | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Context switches | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processes | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Logged-in users | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

The memory objects are in kilobytes. The shipped memory graph applies a conversion
so the axis reads in bytes. If you build your own graph from these OIDs, you own that
conversion.

The three CPU objects sum to roughly 100 and are stored as gauges. They give you
utilisation, not CPU time, so a graph built on them answers "how busy" and not "how
many seconds of work".

## What needs a data query

| Query | Discovers | Backed by |
|---|---|---|
| SNMP - Get Mounted Partitions | Everything the agent calls storage | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Get Monitored Partitions | Only partitions declared in `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Get Processor Information | One entry per CPU | Host Resources processor load |
| Net-SNMP - Get Device I/O | Block devices | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Interface Statistics | Network interfaces | `IF-MIB` |

### Which disk query to use

They are not two views of the same data.

The Host Resources query walks whatever the agent decides to report as storage. On
most Linux hosts that includes physical memory, swap, tmpfs mounts and the real
filesystems, all in one list. Sizes come back in allocation units, and the query
reads the allocation unit size as a separate field so the graph can multiply. You get
everything without configuring anything, and you also get a long list of entries you
do not want.

The net-snmp query reads the UCD disk table, which contains only the filesystems you
named in `snmpd.conf`. Nothing appears until you declare it.

```
disk /      10%
disk /var   10%
includeAllDisks 10%
```

A net-snmp partition query that returns no indexes almost always means those lines
are missing, not that the query is broken.

Prefer the Host Resources query when you want coverage and will prune. Prefer the
net-snmp one when you want a short, deliberate list that does not grow every time
somebody adds a container mount.

### Interfaces

The interface data query on a server behaves the same as on a switch, with one
difference worth planning for: `ifDescr` on Linux is the kernel interface name, which
can change across a reboot or a driver update. See
[Monitor a switch](/guides/monitor-a-switch/) for how the index is chosen and why it
matters.

## When SNMP does not cover it

Some things have no MIB worth using. A queue depth, an application counter, a number
in a file. Those need a script data input.

Two facts decide how you write it.

**The script runs on the machine the poller runs on, not on the monitored host.**
Reaching the target is your script's problem: SSH, an HTTP call, an agent, whatever
you already run.

**The poller reads standard output and nothing else.** Exit status is not consulted.

The output contract:

| Output | Meaning |
|---|---|
| `42` or `3.7` | A single value for a single data source |
| `U` | No value this cycle, recorded as unknown |
| `in:1420 out:980` | Several values, one per data source |

For the multi-value form, pairs are separated by single spaces and the name is
separated from the value by a colon. The parser counts delimiters against spaces, so
a value containing a space breaks the whole line, and a trailing space does the same.
Emit exactly one space between pairs and no trailing whitespace.

Data source names must match `[a-zA-Z0-9_-]` and be at most 19 characters. The whole
output line is stored in a 512 character column, so a script that prints a diagnostic
alongside the numbers will lose data.

Return `U` rather than `0` when you cannot measure something. Zero is a reading and
gets graphed as one. See
[Data sources and archives](/concepts/data-sources-and-rras/) for why the two are
kept apart.

### Script server

A plain script is executed once per data source per interval. For a script written in
PHP, the script server form loads it into the running poller instead, which removes a
PHP startup from every poll. On a host with a few dozen script data sources that is
the difference between a poller that fits its interval and one that does not.

### The whitelist trap

If a data input whitelist file is in use, the poller compares each data input's
command string against the recorded one. A command string that changed without the
whitelist being regenerated stops producing poller cache entries, and the data source
goes quiet with no error on the graph. The log says so; the interface does not.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update
```

## Failure modes

| Symptom | Usual cause |
|---|---|
| System description reads back, nothing else collects | `snmpd` view limited to the system subtree |
| Net-SNMP partition query finds no indexes | No `disk` or `includeAllDisks` lines in `snmpd.conf` |
| Host Resources partitions include RAM and tmpfs | Expected; the agent reports them as storage |
| Memory graph off by a factor of 1024 | Building on the raw OIDs without the conversion |
| Script returns a value on the command line, poller records unknown | Output format, trailing whitespace, or a data source name over 19 characters |
| Script works as you, fails from the poller | It runs as the poller user, with that user's environment and credentials |
