---
title: Discover devices automatically
description: Scan a network range, match found devices to a template, and let rules build the graphs and tree branches, with device creation disabled for an initial discovery pass.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 15
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Automation is two separate machines that are easy to confuse. Discovery walks a
range of addresses and decides what is a device. Rules decide what gets built for a
device once it exists. You can run either without the other, and most of the damage
people do with automation comes from switching both on at once and finding out
afterwards.

## Define the range

A network range is a comma-separated list. Each entry is one of three forms.

| Form | Example | Notes |
|---|---|---|
| CIDR | `192.168.1.0/24` | Also accepts a dotted mask, `192.168.1.0/255.255.255.0` |
| Wildcard | `192.168.*.*` | Converted internally to the equivalent CIDR |
| Single address | `192.168.1.10` | Scans exactly that address |

Start-to-end ranges written as `192.168.1.10-192.168.1.50` are rejected with an
error. They are not supported.

Use non-overlapping ranges, including across networks that can run concurrently.
The work table has a global unique key on the IP address; a duplicate can reject
an entire insert batch, omitting other addresses in that batch. See
[issue #207](https://github.com/kadupulhq/kadupul/issues/207).

Everything is IPv4. The range maths uses 32-bit integer conversion throughout, so
there is no IPv6 path here.

The network and broadcast addresses are excluded. A `/24` scans 254 addresses, from
`.1` to `.254`. A single address entry scans one. Addresses whose last octet is 255
are skipped during the scan as well.

Before a scan starts, every address in the range is written into a work table, one
row per address, and threads claim rows from it. A `/16` writes 65534 rows before
the first ping. That is a real cost, and it is why a scan of a large sparse range is
slow even when nothing answers.

Attach an SNMP options set to each range. Master mode logs an error and skips a
range whose SNMP set ID is zero. A targeted run does not apply that same guard;
starting it directly does not make missing SNMP options usable.

## Pace the scan

| Setting | What it does | Default |
|---|---|---|
| Discovery Threads | Parallel workers claiming addresses | 1 |
| Run Limit | The discovery is terminated after this long | 20 minutes |
| Schedule Type | Manual, daily, weekly, monthly, or monthly on a day | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP, or SNMP | From the global setting |
| Ping Retries, Timeout | Per-address failure cost | From the global settings |

Threads and run limit interact badly if you do not think about them. Fifty threads
against a `/16` is a port scan as far as any intrusion detection system is
concerned. One thread against the same range will hit the run limit and be killed
partway through, leaving a partial result that looks like a complete one.

Size the range so a scan finishes inside the limit at a thread count your network
tolerates. Several small ranges beat one large one, because each gets its own
schedule and its own limit.

## What a scan does per address

1. Resolve a name. Alternate DNS servers can be given as a space-delimited list; if
   none are set, the poller's own resolver is used. NetBIOS lookup is an optional
   fallback when DNS returns nothing.
2. Check whether the address or that name is already a device. If it is, the address
   is marked done. This suppresses an existing device found by those values; it
   is not a guarantee against concurrent creation or differing aliases.
3. Ping, using the configured method. The SNMP method bypasses the separate ping.
4. If ping answers, or the SNMP method is selected, try SNMP and collect `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` and uptime.
5. Match the collected system data against the device rules.

An address that pings but does not answer SNMP is recorded as found and alive. An
address that answers SNMP but matches no device rule is recorded as found, with its
system data, and nothing is created. Both land in the discovered devices list.

Duplicate suppression is on by default. If a `sysName` has already been seen on
another address in this network's stored discovery records, or exists on a device with a different
hostname, the address is skipped. That is the right default for a router with many
addressed interfaces and the wrong one for identical appliances behind separate NAT
addresses, which is what the same-sysName option exists to turn off.

Existing devices can have their data queries re-run during a scan. That is off by
default, and it applies to devices recorded as up or recovering. Discovery uses their
stored status for this decision; it does not freshly probe an existing device.

## Device rules decide the template

A device rule maps system data to a device template. Each rule carries a pattern for
`sysDescr`, `sysObjectID` and `sysName`. The matcher filters on each system field
that the device returned as nonempty; blank rule patterns match any value. Rules
are evaluated in sequence order and the first match wins.

Use simple literal substrings and verify the selected template in the discovery
results. The current SQL matcher wraps regex patterns in literal `/` characters,
so an anchored pattern such as `^Linux.*fixture$` fails even when the database's
regex operator matches it directly. The substring fallback does not repair that
case. See [issue #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE`
also treats `%` and `_` as wildcards.

No match means no device. The address is recorded in the discovered devices list
with whatever system data was collected, and that list is where you write the rule
you were missing.

Put specific rules above general ones. A rule matching the substring `Linux` placed
above a vendor rule will claim every appliance that mentions Linux in its
description.

## Preview discovery before enabling creation

The device creation switch on a new range is off by default. Leave it off for
the initial pass, and disable the option to rerun existing devices' data queries.
This pass still updates discovery records, scan statistics, and logs, and can send
configured notifications. It does not preview graph or tree rule execution.

Run the scan, then read the discovered devices list. It shows recorded discoveries,
their collected SNMP data, and the matched template where available. Existing
devices, suppressed duplicates, and skipped addresses need not appear there.
Review the per-address debug output as well as the list.

Force a scan from the command line rather than waiting for a schedule:

```bash
php poller_automation.php --network=3 --force --debug
```

The debug flag prints the per-address decisions as they happen. The master process,
which launches enabled ranges whose schedule is due, is a separate mode:

```bash
php poller_automation.php -M
```

The targeted `--force` command also runs a disabled network. Adding `--force` to
master mode bypasses the schedule check and can launch disabled networks too.
Use the targeted form when validating one range.

Check three things in the result before switching creation on.

- The device count is what you expected. A count far higher than your asset list
  usually means the range is wider than you thought.
- The templates chosen are right. A column of the same generic template on
  everything means your rules are not matching.
- Nothing important is absent. For a missing device, check range expansion, worker
  completion, existing-device and duplicate suppression, ping policy, and SNMP
  results. Absence from the list alone does not establish that it is unreachable.

## Graph and tree rules

Once a device exists, graph rules and tree rules decide what is built on it.
Discovery can invoke this automation after creating a device, and the CLI can
apply it to existing devices. Individual graph and tree rules must be enabled.
The global graph/tree automation switches govern particular creation hooks;
they are not a blanket prohibition on explicit CLI automation.

A graph rule has three parts: which devices it applies to, which discovered indexes
within a data query it applies to, and which graph type to create. Both matching
parts are built from rule items, and a rule item is a field, an operator and a
pattern, joined by `AND` or `OR` with brackets.

| Operator group | Members |
|---|---|
| Substring | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Equality | matches, is not equal to |
| Numeric | is less than, less than or equal, greater than, greater than or equal |
| Presence | is unknown, is not unknown, is empty, is not empty |
| Pattern | matches regular expression, does not match regular expression |

These become a SQL `WHERE` clause. The regular expression operators are the
database's regular expression dialect, not PCRE, so a pattern that works in
`preg_match` will not necessarily work here. Numeric comparisons against numeric
patterns are passed through unquoted; everything else is quoted, and the database
applies its type-conversion rules. Test numeric filters against the actual cached
values; these values are commonly stored as text. Substring operators use SQL
`LIKE`, where `%` and `_` have wildcard meanings.

Two behaviours are worth knowing before you debug a rule that does nothing.

**An empty device/object filter matches nothing, but an empty index filter
matches all cached indexes.** The device-selection filter falls back to a false
condition when it has no match items. Once a graph rule matches a device, however,
removing all its graph-index conditions leaves the data query unfiltered. For
example, removing an `ifDescr = eth0` condition can also create a graph for `lo`.
Disable the rule while editing its index conditions.

**A rule referring to a field the device has not discovered is abandoned.** If a
rule filters on a data query field that is not in that device's cache, the run logs
a warning naming the field and stops processing that rule for that device. The usual
cause is a rule written against one data query being evaluated on a device whose
query returned a different field set.

The rule edit page lists candidate objects and graphs. Review those lists before
enabling a rule and after editing it. They are selection previews, not a full
execution dry run: data-source checks, existing-graph detection, creation hooks,
and tree insertion still happen during execution. The CLI has no dry-run option.

Tree rules have separate device and graph leaf types and a selected destination
tree and parent. Header steps can use fixed strings or values from device/graph
fields. Field-derived headers apply a case-insensitive PHP regex replacement;
literal `\n` sequences in the result split it into successive nested headers.
This replacement syntax differs from the SQL regex used for object matching.
Existing headers and leaves are reused at the same tree and parent; changing the
path can add another placement without removing the old one.

## Apply rules to devices that already exist

Discovery is not the only way in. Rules can be run against devices already in the
system, selected by id, hostname or description:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Hostname and description are matched as a regular expression when the value is a
valid one, and always also as a substring. At least one of the three is required;
calling it without selectors exits with an error. When selectors are combined,
they are joined with `AND`. Use space-separated positive device IDs for a narrow
selection; comma-separated IDs are not supported. Patterns can still be broad,
and the SQL `LIKE` fallback treats `%` and `_` as wildcards.

The selector query does not automatically exclude disabled devices. `--debug`
adds diagnostics but still performs creation. No matching devices is a successful
no-op, so exit status alone does not establish that anything was created.

For each matching device, the run does three things in order:

1. Attempts creation for attached graph templates that have no graph on the
   device, subject to template eligibility and data-source checks.
2. Runs enabled graph rules for attached data queries using their stored index
   cache. This step does not itself rerun discovery; refresh the data query first
   if the cache is missing or stale.
3. Applies enabled device-leaf tree rules.

New graph creation can invoke graph-leaf tree rules when global tree automation
is enabled. The CLI does not reapply those rules to graphs it finds already
created. A new or changed graph-leaf rule therefore does not backfill existing
graphs just because the CLI is rerun. See
[issue #211](https://github.com/kadupulhq/kadupul/issues/211). Verify their placement
separately; do not
delete and recreate historical graphs merely to trigger the creation hook.

Repeated runs suppress an existing non-indexed graph by device and graph template.
Indexed graphs are checked by device, data query, graph type, and index. This
prevents duplicate creation in sequential runs; it is not a concurrency guarantee.
Check the graph list and tree after a run, along with `AUTOM8` log messages for
skipped graphs, invalid data, or creation failures.

One thing is skipped silently enough to confuse: a graph template with a field
marked overridable that has no default value is not eligible for automation. The run
logs that it was not added because an overridable field has no default, and moves
on. If a template you expect never appears, that is the first thing to check. See
[Templates](/concepts/templates/) for what an overridable field is.

## Traps

**Disabling a rule does not undo its work.** It does not remove graphs or tree
entries already created. Device deletion has separate graph and data-source
cleanup behavior; review the deletion options before removing a device.

**A scan that is killed looks like a clean one.** The run limit terminates the
discovery wherever it got to. The totals recorded are the totals of the work that
finished, and nothing marks the result as partial. Compare the address count scanned
against the size of the range.

**Rules run against the data query cache, not the device.** A graph rule that
matches nothing often means the data query never ran, or ran and found no indexes.
Check the discovered index table before rewriting the rule.

**Notification mail includes existing and new discoveries.** A range can send mail
when it finishes, grouping its recorded discoveries by whether each IP appeared
in the pre-scan snapshot. This is not proof that every requested address was scanned.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Scan finds nothing on a populated range | Ping blocked, SNMP failure, exclusions, or duplicate suppression |
| Range refuses to scan, error in the log | No SNMP options set attached to it |
| Devices found but none created | Creation switch off, or no device rule matched |
| Everything gets the same generic template | Rule order, with a general rule above the specific ones |
| Only some addresses scanned | Run limit reached, or overlapping ranges rejected an address batch |
| One device per router instead of one per interface, or the reverse | The same-sysName duplicate suppression setting |
| Rule matches nothing and the log warns about a column | The rule filters on a field this device's data query did not return |
| Graph template never created by a rule | Missing required default, invalid data-source output, or creation failure |
| Unexpected graphs for additional interfaces | Graph-index filter is empty or broader than intended |
| New tree rule does not place existing graphs | CLI does not backfill graph-leaf rules for existing graphs |
