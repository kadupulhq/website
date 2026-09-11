---
title: Write a data collection script
description: How to make the poller run your own program and store what it
  prints, and the contract that program has to honor.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 10
slug: 1.2.31/guides/write-a-data-collection-script
---

:::caution[Not yet possible]
Kadupul has not shipped. Nothing on this page can be run today. It describes the
contract the poller is intended to keep, so the contract can be held to.
:::

When a device has no SNMP OID for the thing you care about, you write a script. The
poller runs it, reads one line from its standard output, and stores what it finds.
That is the whole mechanism. Almost every problem people have with collection
scripts comes from assuming it does more.

## The contract

| The poller does | The poller does not |
|---|---|
| Run your command line once per data source, per interval | Run it once for all data sources |
| Read the first line of standard output | Read the second line, or any line after it |
| Trim surrounding whitespace and quotes | Strip a log message you printed first |
| Accept a number, `U`, or a hexadecimal string | Accept prose, units, or a percent sign attached to a number |
| Store a value per polling interval | Accept a burst of back-dated values |

Standard error is not captured. The exit code is not read. A script that fails and
exits non-zero, but prints nothing, is indistinguishable from a script that hangs
and is cut off. Both leave the interval unknown.

That is the correct outcome, so lean into it. On any failure path, print `U` and
stop. Never print an error message where a value belongs.

## Single value

If your data input method defines exactly one output field that writes to the RRD
file, the poller already knows which data source name the value belongs to. Print
the bare number.

```sh
#!/bin/sh
set -eu

# One argument: the mount point to measure.
target=${1:?}

used=$(df -P "$target" 2>/dev/null | awk 'NR==2 {print $3}') || used=''

if [ -z "$used" ]; then
        printf 'U'
        exit 0
fi

printf '%s' "$used"
```

No trailing newline is required, and a trailing newline does no harm. Nothing else
may appear on the line.

## Multiple values

If the data input method defines more than one output field that writes to the RRD
file, a bare number is ambiguous and the poller rejects it. Print space separated
`name:value` pairs instead.

```sh
#!/bin/sh
set -eu

target=${1:?}

line=$(df -P "$target" 2>/dev/null | awk 'NR==2 {print $3, $4}') || line=''

if [ -z "$line" ]; then
        printf 'used:U avail:U'
        exit 0
fi

set -- $line
printf 'used:%s avail:%s' "$1" "$2"
```

Each name has to match an output field name on the data input method, exactly. The
poller looks the name up to find which data source inside the RRD file it belongs
to. A name it does not recognize is discarded without an error against that value,
so a typo shows up as a flat unknown line on one series and nothing in the log.

Two rules follow from how the output is validated:

* Use a colon between name and value. Nothing else.
* Use exactly one space between pairs. The validator counts colons and spaces and
  expects one more colon than space. A double space, a trailing space, or a name
  containing a space fails the whole line, not only the pair that caused it.

A value inside a pair must be numeric, `U`, or hexadecimal. Anything else is stored
as unknown for that name while its neighbors on the same line are stored normally.

## What the poller passes in

Your command line is stored as a template on the data input method. Angle bracket
placeholders are filled in before execution.

| Placeholder | Filled with |
|---|---|
| `<path_cacti>` | The installation directory |
| `<path_php_binary>` | The configured PHP binary |
| `<path_snmpget>` | The configured `snmpget` binary |
| `<any_input_field>` | The value entered for that input field on the data source |

Input field values are shell escaped before substitution. A field left empty is
removed from the command line rather than passed as an empty argument, so your
script sees fewer arguments than you wrote, not a blank one. Validate positionally
and fail closed:

```sh
target=${1:?}
```

A placeholder that matches no input field is also removed. A misspelled placeholder
therefore silently shortens the argument list.

## What forking costs

The poller starts one process per script data source per interval. A shell script
that calls `df` and `awk` starts three. Five hundred script data sources on a
300 second interval is 1,500 processes every five minutes, and the poller has to
finish all of them inside the interval or the cycle overruns.

The cost is per data source, not per device. A device with twelve script data
sources costs twelve forks, and collecting all twelve values in one invocation is
not something the poller will do for you. If you find yourself writing twelve
scripts that each open the same SSH connection, you want a data query or a plugin,
not more scripts.

Two things reduce the cost.

**Split the work across poller processes.** The poller divides devices among a
configurable number of concurrent processes. This spreads the forks over more CPUs.
It does not reduce their number.

**Use the script server for PHP.** A PHP collection script can be registered so the
poller loads it into a long lived PHP process instead of executing it. Each poller
process starts one such server, feeds it one request per line on standard input,
and reads one line of output back. The interpreter starts once per poller run
rather than once per value. A script written for the server is a normal PHP file
that defines a function; the server includes the file and calls the function by
name, and the function returns the same string a command line script would print.

The trade is isolation. A command line script that crashes affects one value. A
function running inside the script server shares a process with every other script
server call in that poller process, so a fatal error or an infinite loop is a
larger problem. Keep server side scripts short and defensive.

## How the output becomes a data source

Four objects sit between your script and an RRD file.

1. **The data input method** holds the command line and declares input fields and
   output fields. Output fields are the names you print before each colon.
2. **The data template** maps each output field to a data source item: an internal
   name, a type (`GAUGE`, `COUNTER`, `DERIVE`, `ABSOLUTE`), a minimum, and a
   maximum. The internal name is what ends up inside the RRD file and is limited to
   19 characters.
3. **The data source** is one instance of that template, attached to one device.
   Creating it creates the RRD file.
4. **The graph** reads the RRD file.

See [Templates](/1.2.31/concepts/templates/) for how the layers stack, and
[Data sources and round-robin archives](/1.2.31/concepts/data-sources-and-rras/) for what
the type and maximum actually do to your numbers.

## Failure modes worth knowing

**The script prints a warning first.** Only the first line is read, so the warning
becomes the value, fails validation, and the interval goes unknown. Send diagnostics
to standard error or a file, never to standard output.

**The script works on the command line and not from the poller.** The poller runs
as the web or poller service account, with a different environment and often no
useful `PATH`. Set `PATH` explicitly at the top of the script and use absolute paths
for anything unusual. Test by running the script as that account.

**A value has units attached.** `42%` and `1.2M` are not numbers. Non-numeric
characters are stripped in some cases and the whole value is discarded in others,
and which one happens is not worth relying on. Print digits.

**The output is long.** Collected output is stored in a database column with a fixed
width. Output wider than that column is flagged, and a long line is almost always a
sign that the script printed something it should not have.

**A counter goes backwards.** That is a `COUNTER` wrapping or a device rebooting,
not a script bug. Do not clamp it in the script. Set a sane maximum on the data
source item and let the storage layer record the spike as unknown.

**The script is slow.** The poller has one interval to finish everything. A script
that waits ten seconds for a timeout is holding a slot in that budget. Put a hard
timeout inside the script, shorter than the polling interval, and print `U` when it
expires.
