---
title: Data queries and indexes
description: How one walk of a device becomes many data sources, what an index really is, and what happens when a device renumbers itself.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 5
---

A plain data source needs you to know what you are measuring before you configure
it. That works for load average. It does not work for switch ports, disks,
temperature sensors, or virtual machines, because the list changes and you do not
control it.

A data query discovers the available objects. Graph creation, either manual or
through configured automation, selects which objects get data sources; a query
run alone does not create every possible graph.

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
answer to "what does this device have", cached until the next run. Graph selection uses that cache, but graph-creation tooling can also attach or
rerun a query. Inspect discovery results before adding graphs.

## The index is an identity problem

The position in an SNMP table is not a name. It is a slot number the agent hands
out, and agents reorder slots after a reboot, a card reseat, a firmware upgrade, or
a configuration change that removes an interface. If a data source remembers only
"slot 3", the day slot 3 becomes a different port is the day three months of
history quietly attaches to the wrong thing.

Kadupul stores the index type and identifying value, together with the currently
resolved SNMP index. Reindexing uses the identity to look up the current table
position; manually overridden index types have separate handling.

On every run of the query it looks up the current slot for that field value.

| Outcome | What happens |
|---|---|
| Same slot | Nothing to do |
| Different slot | The data source is remapped to the new slot, and its graphs follow |
| Value no longer present | Orphan handling depends on the query and code path; verify the resulting flag and polling OIDs rather than assuming collection stopped |

Reindexing normally preserves the data source and its existing history. The
`index_transient` option treats missing identities as expected and skips ordinary
orphan marking. `index_orphan_removal` removes affected polling entries and Boost
output; it does not delete the data source or RRD file itself.

Current orphan handling has a defect: when an identity disappears and no other
source changes index, the no-change branch can clear the orphan flag again while
leaving the previous index and polling OIDs in place. Do not rely on automatic
orphan masking to prevent collection from a reused port index. Verify the stored
identity against discovery and disable the affected data source until resolved.

## Choosing the field to key on

Not every field makes a usable key. The query definition supplies an ordered
preference list, and Kadupul walks it and takes the first candidate that survives
a set of checks.

| Check | Why it exists |
|---|---|
| The field is `input` or `input-output` | Identifying fields must be available in discovery |
| No two indexes share a value | A duplicate key cannot identify one row |
| The count of distinct values equals the count of indexes | Rejects incomplete candidate coverage |

These checks have exceptions: a single declared candidate returns directly, and
the raw index OID is accepted separately. `index_type=nonunique` skips duplicate
rejection but does not skip the distinct-value count check. Inspect the selected
field and cached values; the XML type label alone is not evidence of validation.

The interface query prefers `ifName`, then `ifDescr`, then the hardware address,
then the raw index. That order is deliberate. `ifName` is short and stable on most
platforms. `ifDescr` is stable but sometimes carries the slot number in the text,
which defeats the purpose. The raw index is last because keying on it is barely
better than not keying at all.

Here is the part that catches people. The choice is made per device per run, from
that device's current data. Missing cached values or duplicate names can make `ifName` unsuitable and
cause fallback to `ifDescr`. A blank field does not by itself establish which
check failed; inspect the actual discovery rows. Two identical switches can end up keyed on different fields, and a
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

| Method | What it checks | Limits and cost |
|---|---|---|
| None | No automatic assertion | Query reruns must come from a manual or another explicit action |
| Uptime | Uptime has not gone backwards | Requires usable SNMP; misses changes without an uptime rollback |
| Index Count | Current count matches cached indexes | A count OID can be cheap; without one the implementation counts a walk or script result. Same-count changes can be missed |
| Verify All | Known keyed values still match at their cached indexes | Work grows with the cached set; does not guarantee detection of newly added indexes or semantic changes that preserve those values |

Verify All checks assertions during polling; it does not unconditionally rerun
the whole discovery query every cycle. Measure its cost on representative devices
before broad use. Uptime is a common default, but it provides no assertion when
SNMP is disabled. The query definition can supply its own uptime or count source.

## Reindexing is asynchronous

A failed assertion does not reindex on the spot. It writes a command, and a
separate pass after the collection cycle picks that command up and reruns the
query. The practical effects are worth holding on to.

The detecting cycle can still use the old cache, so a value can land on the
wrong series before reindexing completes. Uptime-related spike suppression
replaces single-value output with unknown when its flag is set; it is not a
guarantee for all multi-value output or every index change.

A reindex will not run against a device that is down or disabled. A device that
renumbered while unreachable still needs an assertion or explicit rerun after
it becomes reachable. The first successful poll alone does not prove remapping
has completed. `--force` does not override the down/disabled checks.

Once the query reruns, the data sources that moved get their poller cache entries
rewritten, which is what actually redirects collection. That mechanism is
[The poller cache](/concepts/the-poller-cache/), and a query rerun is one of the
few things that maintains it automatically.

For the operational side, adding a query to a device and reading the results, see
[Monitor a switch](/guides/monitor-a-switch/).
