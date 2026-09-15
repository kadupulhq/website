---
title: Discover devices automatically
description: Scan a network range, match found devices to a template, and let
  rules build the graphs and tree branches, with a dry run first so you find out
  what it would create before it creates it.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 15
slug: 1.2.31/guides/discover-devices-automatically
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

Everything is IPv4. The range maths uses 32-bit integer conversion throughout, so
there is no IPv6 path here.

The network and broadcast addresses are excluded. A `/24` scans 254 addresses, from
`.1` to `.254`. A single address entry scans one. Addresses whose last octet is 255
are skipped during the scan as well.

Before a scan starts, every address in the range is written into a work table, one
row per address, and threads claim rows from it. A `/16` writes 65534 rows before
the first ping. That is a real cost, and it is why a scan of a large sparse range is
slow even when nothing answers.

Each range needs an SNMP options set attached. A range with none is logged as an
error and skipped, not scanned without SNMP.

## Pace the scan

| Setting | What it does | Default |
|---|---|---|
| Discovery Threads | Parallel workers claiming addresses | 1 |
| Run Limit | The discovery is terminated after this long | 20 minutes |
| Schedule Type | Manual, daily, weekly, monthly, or monthly on a day | Manual |
| Ping Method | ICMP, TCP, TCP closed, or UDP | From the global setting |
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
   is marked done. Nothing is created twice.
3. Ping, using the configured method.
4. If it answers, try SNMP and collect `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` and uptime.
5. Match the collected system data against the device rules.

An address that pings but does not answer SNMP is recorded as found and alive. An
address that answers SNMP but matches no device rule is recorded as found, with its
system data, and nothing is created. Both land in the discovered devices list.

Duplicate suppression is on by default. If a `sysName` has already been seen on
another address in this scan, or already exists on a device with a different
hostname, the address is skipped. That is the right default for a router with many
addressed interfaces and the wrong one for identical appliances behind separate NAT
addresses, which is what the same-sysName option exists to turn off.

Existing devices can have their data queries re-run during a scan. That is off by
default, and it only applies to devices that are currently up.

## Device rules decide the template

A device rule maps system data to a device template. Each rule carries a pattern for
`sysDescr`, `sysObjectID` and `sysName`; a rule matches when every pattern it
specifies matches, and each pattern is tried both as a regular expression and as a
substring. Rules are evaluated in sequence order and the first match wins.

No match means no device. The address is recorded in the discovered devices list
with whatever system data was collected, and that list is where you write the rule
you were missing.

Put specific rules above general ones. A rule matching the substring `Linux` placed
above a vendor rule will claim every appliance that mentions Linux in its
description.

## Dry run before you let it create anything

The device creation switch on a range is off by default. Leave it off.

Run the scan, then read the discovered devices list. It shows you every address that
answered, what SNMP said about it, and which device template the rules picked. That
is the entire decision the automation would have made, visible before it acts.

Force a scan from the command line rather than waiting for a schedule:

```bash
php poller_automation.php --network=3 --force --debug
```

The debug flag prints the per-address decisions as they happen. The master process,
which launches every enabled range whose schedule is due, is a separate mode:

```bash
php poller_automation.php -M
```

Check three things in the result before switching creation on.

* The device count is what you expected. A count far higher than your asset list
  usually means the range is wider than you thought.
* The templates chosen are right. A column of the same generic template on
  everything means your rules are not matching.
* Nothing important is absent. A device missing from the list answered neither ping
  nor SNMP, and switching creation on will not change that.

## Graph and tree rules

Once a device exists, graph rules and tree rules decide what is built on it. They
run when a device is created by discovery, and on demand from the CLI.

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
patterns are passed through unquoted; everything else is quoted, so a numeric
comparison against a field holding text compares as text.

Two behaviours are worth knowing before you debug a rule that does nothing.

**A rule with no match items matches nothing.** The filter falls back to a clause
that is deliberately always false rather than one that is always true. A rule you
half-built does not quietly apply to your entire estate, which is the safer of the
two failures but does look like a broken rule.

**A rule referring to a field the device has not discovered is abandoned.** If a
rule filters on a data query field that is not in that device's cache, the run logs
a warning naming the field and stops processing that rule for that device. The usual
cause is a rule written against one data query being evaluated on a device whose
query returned a different field set.

The rule edit page lists the objects a rule currently matches. That list is the dry
run for rules, and it is the same query the automation runs. Check it before
enabling a rule, and check it again after editing one.

Tree rules follow the same shape and place devices or graphs under headers built
from fixed strings.

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
the utility refuses to run against everything by accident.

For each matching device, the run does three things in order:

1. Creates graphs for every graph template attached to the device that does not
   already have a graph.
2. Runs each attached data query's graph rules.
3. Applies tree rules.

Re-running is close to idempotent. A graph template that already has a graph on that
device is skipped with a log line rather than duplicated.

One thing is skipped silently enough to confuse: a graph template with a field
marked overridable that has no default value is not eligible for automation. The run
logs that it was not added because an overridable field has no default, and moves
on. If a template you expect never appears, that is the first thing to check. See
[Templates](/1.2.31/concepts/templates/) for what an overridable field is.

## Traps

**Automation creates, it does not tidy up.** Deleting a device does not withdraw the
graphs a rule made for it, and disabling a rule does not remove what it already
built. Plan removal separately.

**A scan that is killed looks like a clean one.** The run limit terminates the
discovery wherever it got to. The totals recorded are the totals of the work that
finished, and nothing marks the result as partial. Compare the address count scanned
against the size of the range.

**Rules run against the data query cache, not the device.** A graph rule that
matches nothing often means the data query never ran, or ran and found no indexes.
Check the discovered index table before rewriting the rule.

**Notification mail reports the difference, not the state.** A range can send mail
when it finishes, comparing what is there now against what was there before. It is
the only part of this that tells you a device appeared without you asking.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Scan finds nothing on a populated range | Ping method blocked, or the range excludes the addresses you meant |
| Range refuses to scan, error in the log | No SNMP options set attached to it |
| Devices found but none created | Creation switch off, or no device rule matched |
| Everything gets the same generic template | Rule order, with a general rule above the specific ones |
| Only some addresses scanned | Run limit reached and the discovery terminated |
| One device per router instead of one per interface, or the reverse | The same-sysName duplicate suppression setting |
| Rule matches nothing and the log warns about a column | The rule filters on a field this device's data query did not return |
| Graph template never created by a rule | An overridable field on it has no default value |
