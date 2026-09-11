---
title: Data queries and indexes
description: How one walk of a device becomes many data sources, what an index really is, and what happens when a device renumbers itself.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 5
---

A plain data source needs you to know what you are measuring before you configure
it. That works for load average. It does not work for switch ports, disks,
temperature sensors, or virtual machines, because the list changes and you do not
control it.

A data query solves that by asking the device. One query definition, applied to a
hundred switches, produces however many data sources each switch happens to
justify.

## What a query definition contains

A data query is an XML description with three parts: where the list of things
lives, what to read about each one, and how to decide which thing is which.

The interface query that ships with Kadupul is the worked example. It walks
`.1.3.6.1.2.1.2.2.1.1` to enumerate interfaces, and then reads a set of named
fields at each returned position. Every field declares a direction.

| Direction | Meaning | Interface examples |
|---|---|---|
| `input` | Read for identification and naming. Not collected over time | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | A value worth collecting every cycle | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Both | `ifOperStatus`, `ifAdminStatus` |

Fields also declare how to read the value. Most take it verbatim; some apply a
regular expression to pull a number out of an SNMP enumeration, and some ask for
the value to be decoded as text rather than as raw bytes.

Running the query stores one row per index per field: the device, the query, the
field name, the value, and the position the value came from. That table is the
answer to "what does this device have", cached until the next run. Creating graphs
reads from the cache; it does not talk to the device.

## The index is an identity problem

The position in an SNMP table is not a name. It is a slot number the agent hands
out, and agents reorder slots after a reboot, a card reseat, a firmware upgrade, or
a configuration change that removes an interface. If a data source remembers only
"slot 3", the day slot 3 becomes a different port is the day three months of
history quietly attaches to the wrong thing.

So Kadupul stores two things on each data source: which field it is keyed on, and
that field's value at the time the data source was created. The slot number is
derived, not remembered.

On every run of the query it looks up the current slot for that field value.

| Outcome | What happens |
|---|---|
| Same slot | Nothing to do |
| Different slot | The data source is remapped to the new slot, and its graphs follow |
| Value no longer present | The data source is flagged an orphan and stops collecting |

An orphan keeps its file and its history. It is masked, not deleted, because a
missing index is more often a device in a strange state than a decommissioned
port. A query definition can opt out of that in either direction: it can declare
that its indexes come and go normally, in which case a missing one is expected and
no orphan is raised, or it can declare that orphans should be removed outright.

## Choosing the field to key on

Not every field makes a usable key. The query definition supplies an ordered
preference list, and Kadupul walks it and takes the first candidate that survives
a set of checks.

| Check | Why it exists |
|---|---|
| The field is an input field | Output fields are measurements, not identifiers |
| No two indexes share a value | A duplicate key cannot identify one row |
| The count of distinct values equals the count of indexes | A field blank on some indexes cannot cover all of them |
| The values match the declared type, numeric or alphabetic | Catches a field that holds the wrong kind of data |

A definition can waive the uniqueness check by declaring its indexes non-unique,
for cases where the duplicate is real and tolerable.

The interface query prefers `ifName`, then `ifDescr`, then the hardware address,
then the raw index. That order is deliberate. `ifName` is short and stable on most
platforms. `ifDescr` is stable but sometimes carries the slot number in the text,
which defeats the purpose. The raw index is last because keying on it is barely
better than not keying at all.

Here is the part that catches people. The choice is made per device per run, from
that device's current data. A switch where one port has a blank `ifName` fails the
count check for `ifName`, and the whole device silently falls through to
`ifDescr`. Two identical switches can end up keyed on different fields, and a
device can change which field it uses between runs. Kadupul logs a warning when
the chosen field changes, because that is the moment remapping errors become
possible.

The chosen field usually also names the graphs, through a title format that
references it. If your graph titles change character across a fleet, the sort
field is where to look.

## Detecting that a reindex is needed

Rerunning a data query against every device on every cycle would be expensive and
mostly pointless, since most devices renumber nothing for years. Instead each
device and query pair carries a reindex method, which is a cheap assertion checked
during normal collection. When the assertion fails, a reindex is queued.

| Method | What it asserts | Cost per cycle | Misses |
|---|---|---|---|
| None | Nothing | Zero | Everything. Reindexing is manual or driven by automation |
| Uptime | The device's uptime has not gone backwards | One extra read per device | Renumbering without a reboot, such as a hot swap |
| Index Count | The number of indexes still matches | One extra read per device | A swap that keeps the count the same |
| Verify All | The keyed field still holds the same value at every index | One read per index per device | Nothing, at real expense |

Uptime is what the command line device tooling selects when nothing is specified.
It is a good default because a reboot is when renumbering usually happens, and
because the cost does not grow with port count. It has one blind spot worth
knowing: the check reads uptime over SNMP, so a device with SNMP disabled produces
no assertion at all and will never reindex itself, however the method is set.

Index Count grows no more expensive with port count either, and it catches the
common case of a port appearing or disappearing. It cannot see a rename or a
reshuffle that preserves the total.

Verify All is the only one that catches everything, and it is the only one whose
cost scales with the size of the device. On a 48 port switch it multiplies that
device's reads by roughly the port count, every cycle, forever. It earns its keep
on a small number of devices that genuinely churn. Applied fleet-wide it is how a
poller stops finishing inside its interval.

## Reindexing is asynchronous

A failed assertion does not reindex on the spot. It writes a command, and a
separate pass after the collection cycle picks that command up and reruns the
query. The practical effects are worth holding on to.

The cycle that detects the change still collects against the old index. One cycle
of data can land on the wrong data source. When the trigger is an uptime rollback,
Kadupul writes unknown instead of a value for that device, because a counter
across a reboot is meaningless and a false spike is worse than a gap.

A reindex will not run against a device that is down or disabled. A device that
renumbered while unreachable gets its reindex when it comes back, not before.

Once the query reruns, the data sources that moved get their poller cache entries
rewritten, which is what actually redirects collection. That mechanism is
[The poller cache](/concepts/the-poller-cache/), and a query rerun is one of the
few things that maintains it automatically.

For the operational side, adding a query to a device and reading the results, see
[Monitor a switch](/guides/monitor-a-switch/).
