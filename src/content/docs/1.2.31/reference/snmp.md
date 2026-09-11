---
title: SNMP
description: Which SNMP versions, authentication and privacy protocols Kadupul
  supports, the port, timeout, retry and OID-count settings, and how failures
  are reported.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 8
slug: 1.2.31/reference/snmp
---

Kadupul talks SNMP two ways: through PHP's SNMP extension, or by running the
net-snmp command line binaries. Which one it uses for a given call is decided per
call, not configured. Everything below is inherited from Cacti 1.2.x.

## Versions

`host.snmp_version` and `poller_item.snmp_version`:

| Value | Meaning |
|---|---|
| 0 | Not in use. SNMP collection is disabled for the device. |
| 1 | SNMP v1 |
| 2 | SNMP v2c |
| 3 | SNMP v3 |

The default for new devices comes from the `snmp_version` setting, which ships
as `2`. The `host` table column defaults to `1`.

Version `2` is sent to the binaries as `2c`, which net-snmp prefers.

A device with `snmp_version` of `0`, or with an empty community on a version
other than 3, produces no `poller_item` rows at all. The poller cache builder
drops it rather than generating a call that will fail every cycle.

## Version 3 security

The security level is not stored. It is derived from which credentials are
present, every time a call is made:

| Condition | Security level |
|---|---|
| Privacy protocol is `[None]`, or the privacy passphrase is empty, and the auth passphrase is empty or the auth protocol is `[None]` | `noAuthNoPriv` |
| Privacy protocol is `[None]`, or the privacy passphrase is empty, and an auth passphrase and protocol are set | `authNoPriv` |
| A privacy protocol other than `[None]` and a non-empty privacy passphrase | `authPriv` |

There is an `snmp_security_level` setting, defaulting to `authPriv`, but it only
seeds the interface for new devices. The derivation above is what the calls
actually use.

### Authentication protocols

`host.snmp_auth_protocol`, a `char(6)` column:

| Value | Protocol |
|---|---|
| `[None]` | none |
| `MD5` | HMAC-MD5 |
| `SHA` | HMAC-SHA-1 |
| `SHA224` | HMAC-SHA-224 |
| `SHA256` | HMAC-SHA-256 |
| `SHA384` | HMAC-SHA-384 |
| `SHA512` | HMAC-SHA-512 |

Default for new devices is `MD5`.

### Privacy protocols

`host.snmp_priv_protocol`, a `char(7)` column:

| Value | Protocol |
|---|---|
| `[None]` | none |
| `DES` | DES |
| `AES` | AES |
| `AES128` | AES-128 |
| `AES192` | AES-192 |
| `AES192C` | AES-192, Cisco variant |
| `AES256` | AES-256 |
| `AES256C` | AES-256, Cisco variant |

Default for new devices is `DES`.

The SHA-224 and above digests, and the AES variants beyond plain AES, are passed
straight to net-snmp. Whether they work depends on the net-snmp build; Kadupul
does not test for support before using one.

### Context and engine ID

| Column | Length | Command line flag | Note |
|---|---|---|---|
| `snmp_context` | 64 | `-n` | Omitted when empty. |
| `snmp_engine_id` | 64 | `-e` | Omitted when empty. Leave it empty to use the engine ID defined per notification receiver. |

## Port, timeout and retries

| Setting | Column | Default | Unit |
|---|---|---|---|
| `snmp_port` | `host.snmp_port` | `161` | UDP port |
| `snmp_timeout` | `host.snmp_timeout` | `500` | milliseconds |
| `snmp_retries` | none | `3` | attempts |

Retries are a system setting, not a per-device column. There is no
`host.snmp_retries`.

Timeouts are stored in milliseconds and converted at the point of use:

| Path | Conversion |
|---|---|
| PHP extension | milliseconds times 1000, giving microseconds. |
| net-snmp binary | milliseconds divided by 1000, rounded up, giving whole seconds. |

The rounding matters. Any timeout at or below 1000 milliseconds becomes `-t 1`
on the binary path, so 200 and 900 behave identically there. The device form says
as much: the timeout does not apply when PHP SNMP support is in use, because the
extension handles it differently.

An empty port falls back to `161`. A retry count of `0` or a non-numeric value
falls back to the `snmp_retries` setting, and to `3` if that setting is also
empty.

## OIDs per request

| Setting | Column | Default | Range offered |
|---|---|---|---|
| `max_get_size` | `host.max_oids` | `10` | 1 to 60 |
| `snmp_bulk_walk_size` | `host.bulk_walk_size` | `10` for the setting, `-1` for the column | 10 to 200 for the setting, 1 to 60 for the device |

`max_oids` is the number of OIDs packed into a single Get request. The
device-level value is what the poller uses; the `max_get_size` setting is the
default for new devices and the fallback for scripts and plugins calling the SNMP
API directly.

A single-OID Get forces `max_oids` to `1` regardless of either value. Batching
only applies where there is more than one OID to fetch.

`bulk_walk_size` is the max-repetitions value on a bulk walk. Two of its values
are not counts:

| Value | Meaning |
|---|---|
| `-1` | Auto detect on every reindex. |
| `0` | Auto detect and store on the first reindex. |
| 1 to 60 | Use this max-repetitions value. |

A max-repetitions value of `0` or less at call time is replaced with `10`.

Setting this too high is the common failure. Lower-powered devices refuse
oversized packets outright, and a value above the path MTU causes fragmentation.

## Which path a call takes

`snmp_get_method()` picks the PHP extension or a net-snmp binary. The first
matching rule wins:

| Order | Condition | Path |
|---|---|---|
| 1 | PHP SNMP support unavailable or disabled in `config.php` | binary |
| 2 | Hex string output requested | binary |
| 3 | Version 3 | binary |
| 4 | A walk, and `path_snmpbulkwalk` exists | binary |
| 5 | Version 1 and `snmpget()` exists | PHP extension |
| 6 | Version 2 and `snmp2_get()` exists | PHP extension |
| 7 | anything else | binary |

Rule 3 is the one people trip over: every SNMP v3 call shells out, whatever the
PHP extension reports. Credentials therefore appear on a command line, and the
binary paths below have to be correct for v3 to work at all.

PHP SNMP support is detected at startup as `function_exists('snmpget')` and
`class_exists('SNMP')`. Setting `$php_snmp_support = false;` in `config.php`
turns it off and forces every call onto the binaries. When the extension is
absent, a bundled class under `include/vendor/phpsnmp/` provides the same
interface over the binaries.

### Binary paths

| Setting | Binary |
|---|---|
| `path_snmpget` | `snmpget` |
| `path_snmpgetnext` | `snmpgetnext` |
| `path_snmpwalk` | `snmpwalk` |
| `path_snmpbulkwalk` | `snmpbulkwalk` |
| `path_snmptrap` | `snmptrap` |

Output formatting is fixed, not configurable. Gets use `-O fntevU`; walks use
`-O QnU`. Add `x` to either when hex output is requested.

## IPv6

An address containing a colon is wrapped in square brackets before the port is
appended, so the SNMP library does not read the port as another hextet. This
happens on both paths and needs no configuration.

## Availability

`host.availability_method` decides what "up" means. SNMP participates in five of
the seven options:

| Value | Method | Uses SNMP |
|---|---|---|
| 0 | None | no |
| 1 | Ping and SNMP uptime | yes |
| 2 | SNMP uptime | yes |
| 3 | Ping | no |
| 4 | Ping or SNMP uptime | yes |
| 5 | SNMP description | yes |
| 6 | SNMP getNext | yes |

Default for new devices is `2`, SNMP uptime.

Ping method, for the options that use it:

| Value | Method |
|---|---|
| 1 | ICMP |
| 2 | UDP |
| 3 | TCP |
| 4 | SNMP |
| 5 | TCP, port expected closed |

`host.status` is `1` down, `2` recovering, `3` up. `ping_failure_count`
(default 2) and `ping_recovery_count` (default 3) are the number of consecutive
polling intervals needed to move between them.

### Uptime selection

When both `sysUpTime` and `snmpEngineTime` are available, Kadupul prefers engine
time only when it is at least the system uptime and does not look like a Unix
timestamp. Some agents return wall-clock time for `snmpEngineTime`; a value
within five years of now is rejected as such and `sysUpTime` is used instead.

## How failures are reported

There is no SNMP error table. Failures surface in three places.

### The returned value

A failed Get returns the string `U`. RRDtool reads `U` as unknown, so a failed
poll leaves a gap in the graph rather than a zero. A failed walk returns an empty
array.

`cacti_snmp_options_sanitize()` returns `U` without attempting the call when any
of these hold:

* version is `0` or not numeric
* `max_oids`, port, retries or timeout is not numeric
* the community is empty on a version other than 3

### The log

Every failure writes one line in a fixed shape:

```
WARNING: SNMP Error:'<reason>', Device:'<hostname>', OID:'<oid>'
```

The verbosity it is logged at depends on where the failure happened:

| Failure | Environment | Level |
|---|---|---|
| PHP extension Get or Getnext threw | caller's environment | always logged |
| Binary path returned `Timeout` | `SNMP` | `HIGH` |
| Binary path returned `(tooBig)` | `SNMP` | `HIGH` |
| Session call failed | `SNMP` | `HIGH` |

So a device timing out is invisible at the default `LOW` verbosity. Raise the
generic log level, or put the device in selective device debug, before concluding
nothing is being logged.

The reason text for a session failure is built in this order: a timeout is
reported as `Timeout (<n> ms)` using the session's own timeout; otherwise the
session error message; otherwise the suppressed PHP warning; otherwise
`Error Number <n>`. A failed session open commonly reports errno `0` and an empty
message, which is why the suppressed warning is captured at all.

Five OIDs are exempt from failure logging, because the devices that do not
implement them are common enough that the noise was worse than the signal:

```
.1.3.6.1.2.1.47.1.1.1.1.2
.1.3.6.1.4.1.9.9.68.1.2.2.1.2
.1.3.6.1.4.1.9.9.46.1.6.1.1.5
.1.3.6.1.4.1.9.9.46.1.6.1.1.14
.1.3.6.1.4.1.9.9.23.1.2.1.1.6
```

### The device record

The poller writes `host.status`, `status_event_count`, `status_fail_date`,
`status_rec_date` and `status_last_error`. `status_last_error` is a 255-character
column and holds the most recent reason, which is what the device list shows.

## Values that are discarded

Walk results containing any of these substrings are dropped before the result is
returned:

| String |
|---|
| `End of MIB` |
| `No Such` |
| `No more` |

An agent that returns `No Such Object` for an index therefore yields a shorter
index list, not an error. A data query that suddenly returns fewer indexes than
before is worth checking against this.

Type prefixes such as `counter32:`, `gauge:`, `float:`, `ipaddress:`, `string:`
and `integer:` are stripped from values. `hex-string:` is trimmed to `hex-` and
kept, so hex values stay distinguishable.

## Other settings

| Setting | Default | Effect |
|---|---|---|
| `oid_increasing_check_disable` | off | Turns off net-snmp's check that OIDs increase during a walk. Needed for agents that return an out-of-order tree, at the cost of losing protection against a walk that never ends. |
| `remote_agent_timeout` | 5 seconds | How long the central web server waits on a remote data collector for device information. Options are 5, 10, 15, 20, 30 and 60. |
