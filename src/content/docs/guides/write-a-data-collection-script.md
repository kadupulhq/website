---
title: Write a data collection script
description: How to make the poller run your own program and store what it prints, and the contract that program has to honor.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 10
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

When a device has no SNMP OID for the thing you care about, a script can collect it.
The PHP poller runs the command, validates its output and queues it for an RRD write.
This guide describes the `cmd.php` external-script path; validate Spine and script
server behavior separately for your deployment.

## The contract

| The poller does | The poller does not |
|---|---|
| Run your command line once per data source, per interval | Run it once for all data sources |
| Normally read the first line through `popen` | Treat multiline output as a supported measurement format |
| Trim surrounding whitespace and quotes | Strip a log message you printed first |
| Accept numbers, `U` and some hexadecimal forms | Reliably reject every malformed value or attached unit |
| Store a value per polling interval | Accept a burst of back-dated values |

Standard error is not used as the measurement. `exec_poll` ignores the exit status:
printing `42` and exiting nonzero can still produce `42`. With `popen`, the read is
bounded by `fgets(..., 8192)`; without it, the fallback uses `shell_exec` and can return
multiple lines. Emit only one short measurement line. The external-script helper
itself does not enforce a per-command timeout, so bound the collection operation.

On a handled failure, print `U` (or a named `U` for every output) and stop. Never
print diagnostics on stdout: the validator can strip text from `warning 42` or
`42%` and accept `42`, rather than marking it unknown.

## Single value

If your data input method defines exactly one output field that writes to the RRD
file, the poller already knows which data source name the value belongs to. Print
the bare number.

```sh
#!/bin/sh
set -eu
PATH=/usr/bin:/bin
export PATH

# One argument: the mount point to measure.
[ "$#" -eq 1 ] && [ -n "$1" ] || { printf 'U\n'; exit 0; }
target=$1

used=$(LC_ALL=C df -Pk "$target" 2>/dev/null | awk 'NR==2 {print $3}') || used=''

if [ -z "$used" ]; then
        printf 'U'
        exit 0
fi

printf '%s' "$used"
```

These examples report 1024-byte blocks. Configure matching graph units and use a
GAUGE data source. They do not implement a timeout; bound `df` externally if mounts
can block.

No trailing newline is required, and a trailing newline does no harm. Nothing else
may appear on the line.

## Multiple values

If the data input method defines more than one output field that writes to the RRD
file, a bare number is ambiguous and the poller rejects it. Print space separated
`name:value` pairs instead.

```sh
#!/bin/sh
set -eu
PATH=/usr/bin:/bin
export PATH

[ "$#" -eq 1 ] && [ -n "$1" ] || { printf 'used:U avail:U\n'; exit 0; }
target=$1

line=$(LC_ALL=C df -Pk "$target" 2>/dev/null | awk 'NR==2 {print $3, $4}') || line=''

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
so verify that every expected field actually receives a value. Missing or unmapped
outputs can also interact with retained-sample checks; a quiet log does not prove
correct field mapping.

Two rules follow from how the output is validated:

- Use a colon between name and value. Nothing else.
- Use exactly one space between pairs. The validator counts colons and spaces and
  expects one more colon than internal space. The PHP poller trims trailing
  whitespace before validation, so a trailing space is accepted; an internal
  double space fails this check. Use the canonical format rather than relying on
  permissive edge cases. Names must not contain spaces.

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

Input field values are shell escaped before substitution. An existing stored empty
value is passed as an empty quoted argument. A placeholder without a matching input
row can remain unresolved and then be removed, shortening the argument list.
Validate both the argument count and empty values:

```sh
[ "$#" -eq 1 ] && [ -n "$1" ] || { printf 'U\n'; exit 0; }
```

A placeholder that matches no input field is also removed. A misspelled placeholder
therefore silently shortens the argument list.

## What forking costs

The poller starts one process per script data source per interval. A shell script
that calls `df` and `awk` starts three. Five hundred script data sources on a
300 second interval is 1,500 processes every five minutes, and the poller has to
finish all of them inside the interval or the cycle overruns.

The cost is per data source, not per device. A device with twelve script data
sources costs twelve invocations. To collect related values together, consider one
multi-output data source or a suitable data query/plugin, and measure the resulting
collection cost.

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
   Creating its database definition does not guarantee a writable RRD exists;
   verify file creation and successful updates during collection.
4. **The graph** reads the RRD file.

See [Templates](/concepts/templates/) for how the layers stack, and
[Data sources and round-robin archives](/concepts/data-sources-and-rras/) for what
the type and maximum actually do to your numbers.

## Failure modes worth knowing

**The script prints a warning first.** The normal `popen` path reads that line;
it can become unknown or be reduced to a misleading number. Send diagnostics
to standard error or a protected log, never to standard output.

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

**A counter goes backwards.** Investigate wrap, device reset, parsing errors or
changed units. Do not silently clamp a legitimate cumulative counter. Select the
appropriate data source type and realistic limits, then inspect retained rates.

**The command never reaches the poller cache.** Check that the input method and
source are active and, when a whitelist is configured, that the reviewed command
is allowed. A missing or mismatched whitelist can prevent cache population.
See [The poller cache](/concepts/the-poller-cache/).

**The script is slow.** The poller has one interval to finish everything. A script
that waits ten seconds for a timeout is holding a slot in that budget. Put a hard
timeout inside the script, shorter than the polling interval, and print `U` when it
expires.
