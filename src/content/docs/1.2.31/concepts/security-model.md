---
title: Security model
description: Where untrusted data enters Kadupul, which process runs with which
  privilege, what the database account can do, and which boundaries the code
  enforces rather than assumes.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 12
slug: 1.2.31/concepts/security-model
---

A monitoring system is an awkward thing to defend, for three reasons that have
nothing to do with code quality.

It holds credentials for everything it watches. SNMP communities, v3 usernames and
passphrases, and whatever else a device needs are stored so the poller can use them
unattended. There is no human to type them in every five minutes.

It runs commands on a schedule. Collecting a value that SNMP does not expose means
running a script, and the definition of that script is configuration, stored in the
database and editable through the interface.

It ingests data that the machines it watches produce. An interface description, a
disk mount point, a sensor name: all of it arrives from the device, and all of it
ends up in the database, in graph titles, and in arguments handed to other programs.
A compromised switch is an input source, not only a victim.

None of these are defects. They are what the job requires. What follows is where
each one lands in the architecture.

## Where untrusted input enters

Four entry points, in rough order of how much an operator controls them.

| Entry point | Source | Where it goes |
|---|---|---|
| HTTP parameters | Anyone who can reach the web server | The database, page output, and SQL |
| SNMP values | The polled device | `host_snmp_cache`, graph titles, RRD bounds, script arguments |
| Script output | A local script, or whatever it talked to | `poller_output`, then RRD files |
| Uploaded templates and packages | Whoever holds the import realm | Template rows, and for packages, files on disk |

### HTTP parameters

The request layer is `lib/html_utility.php`. `get_filter_request_var()` runs a
value through `filter_var()` with a declared filter, defaulting to
`FILTER_VALIDATE_INT`, and kills the request with an input error when the value
fails. `get_nfilter_request_var()` returns the value untouched, for cases where the
caller intends to validate it some other way.

Both write the result back into `$_REQUEST`, `$_GET`, and `$_POST` through
`set_request_var()`. A later unfiltered read of the same name therefore returns the
filtered value, which is convenient and also means the read order matters.

Nothing forces a page to call the filtering variant. The `log_validation` setting
exists for exactly this: with it on, every read of a request variable that was not
filtered first is logged. Treat it as an audit tool for your own plugins, not as a
control.

### SNMP values

A data query walks a device, and every value it gets back is written to
`host_snmp_cache` as a string. `data_query_format_record()` in `lib/data_query.php`
applies two transformations before storage: an optional `rewrite_value` map from
the query definition, and `bin2hex()` on any value whose encoding
`mb_detect_encoding()` cannot identify. That second one is a guard against binary
octet strings, not against hostile content.

From there the value travels. It names graphs through
`substitute_snmp_query_data()`. It can set an RRD maximum, because a data template
may declare its maximum as `|query_ifSpeed|`. It becomes an argument to a script
query, where `get_script_query_path()` passes each part through
`cacti_escapeshellarg()` first.

The escaping and the RRDtool validators described in
[RRDtool integration](/1.2.31/reference/rrdtool-integration/) are the boundary here.
Device data is not trusted; it is escaped at each point where it crosses into
another program. That is a per-call-site property, which is the part worth holding
on to: it holds where it is applied.

### Script output

`exec_poll()` reads one line, at most 8192 bytes, and everything after the first
line is discarded. `prepare_validate_result()` accepts a number, `U`, or a
hexadecimal string, and turns anything else into `U`. A script cannot return a
value that reaches an RRD file without passing that filter.

That constrains the data. It does not constrain the script, which already ran.

### Templates and packages

Two different mechanisms share one realm.

A **template import** is plain XML with no signature. It creates templates, data
queries, and data input methods. A data input method is a command line, so this is
a path from an uploaded file to something the poller will execute. `lib/import.php`
runs `cacti_input_string_is_safe()` on any imported `input_string` and refuses the
method when it contains shell metacharacters, logging

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

A **package import** is signed. `import_validate_signature()` reads the package's
embedded public key and compares it against the two keys compiled into
`lib/import.php`; a key that is neither of those fails. A package with no
`<publickey>` element is read as claiming the older of those two, and then has to
produce a signature that verifies against it. `import_read_package_data()` refuses
any key below 2048 bits before attempting verification, which the older key, at 512
bits, does not clear. Each contained file carries its own signature, verified
separately.

Packages may then write files. A file whose name contains `scripts/` or
`resource/` is written under the installation path. The name is checked for NUL
bytes, for `..` path segments, and for an absolute path, and a file failing any of
those is skipped with a warning. A package that passes verification writes
executable PHP into the install tree by design. The signature is the whole of the
control.

Both mechanisms sit behind realm 17. The stock Template Editor role holds realm 17
and realm 2 (Data Input Methods). An account with that role can define what the
poller executes. That is what the role is for, and it is worth knowing before
handing it out as a mild permission.

## What runs with which privilege

| Process | Started by | Runs as | Does |
|---|---|---|---|
| Web interface | The web server | The web server user | Reads and writes the database, renders graphs through RRDtool, writes RRD files on demand, writes package files during import |
| `poller.php` | cron | The cron user | Reads the poller cache, launches collectors, writes RRD files |
| `cmd.php` or spine | `poller.php` | The same user | Performs SNMP gets, executes script command lines |
| `script_server.php` | `cmd.php` or spine | The same user | Includes a PHP file and calls a function in its own process |
| RRDtool | Either the web process or the poller | Whichever called it | Reads and writes files under `rra/` |

Two of those deserve a closer look.

**The script server is not a sandbox.** It includes the target file into a
long-running PHP process and calls a function in it. That function shares the
process, its memory, and its database connection. The checks in
`script_server.php` decide whether the call happens at all: `realpath()` of the
include file must resolve under `$config['base_path']` or `$config['scripts_path']`,
the function must exist after the include, `ReflectionFunction::isInternal()` must
be false, and the function's defining file must also be under an allowed root. Once
those pass, the code runs with the poller's full privilege. A Script Server method
is a way of running PHP inside Kadupul, not a way of running PHP next to it.

**The web process writes RRD files.** `rrdtool_function_create()` runs from the
interface as well as the poller, and under `extended_paths` it creates the parent
directory too. A web request that cannot write to `rra/` logs a warning and leaves
the work to the poller, so this is not a hard requirement. It is, however, why
`rra/` ends up writable by the web server user on many installations. When the
creating process runs as root, the new file is chowned to match `rra/` itself,
which keeps ownership consistent without narrowing who may write there.

The web user and the poller user are frequently the same account. Nothing requires
that and nothing prevents it.

## What the database account needs

The credentials in `include/config.php` are a single account used by the web
interface, the poller, and every command line tool.

| Requirement | Why |
|---|---|
| Full DML on the Kadupul schema | Ordinary operation |
| DDL on the Kadupul schema | Upgrades run `ALTER TABLE` and `CREATE TABLE` from the interface, through `db_install_execute()` |
| `SELECT` on `mysql.time_zone_name` | Site and data collector timezone lists read that table directly |

The DDL requirement is the one with consequences. Because the upgrade path runs
from the web interface, the account the web interface uses can alter the schema at
any time, not only during an upgrade. Separating a low-privilege runtime account
from a high-privilege upgrade account is not something the code supports.

`include/config.php` holds that password in plain text and lives inside the
document root. On a remote data collector it also holds `$rdatabase_*`, the
credentials for the central database. File permissions are the only thing
protecting it.

Device credentials are stored the same way. `host.snmp_community`,
`host.snmp_password`, and `host.snmp_priv_passphrase` are ordinary columns, written
by `api_device_save()` through `form_input_validate()` with no encryption step, and
copied onto `poller_item` rows for the poller to read. Read access to the database
is read access to every device credential. User passwords are the exception:
`compat_password_hash()` uses PHP's `password_hash()` with `PASSWORD_DEFAULT`, and
a legacy MD5 hash that still verifies is rehashed on next login.

## Enforced, and merely conventional

This is the distinction that matters most when reasoning about a change.

### Enforced by code

| Boundary | Mechanism |
|---|---|
| Authentication | `include/auth.php`, included by every interface page but the six listed below |
| CSRF | A token validated before dispatch on every POST |
| CLI-only scripts | `include/cli_check.php` answers `404` and exits when the SAPI is not `cli` |
| Data query XML location | `cacti_path_is_within()` against `<base_path>/resource`, logged and refused otherwise |
| Package authenticity | Signature against a compiled-in key, minimum 2048 bits, per-file signatures |
| Package file placement | NUL, `..`, and absolute paths rejected |
| Script server targets | `realpath()` containment, plus the function checks above |
| Shell arguments | `cacti_escapeshellarg()` at each construction site |
| RRDtool arguments | Control-character and shape validators in `lib/functions.php` |
| SQL | Prepared statements through the `db_*_prepared()` family |
| Remote agent callers | Source address must match an enabled row in `poller`, by exact IP or by a forward-confirmed reverse lookup |

### Conventional, and therefore your problem

| Boundary | Why it is not enforced |
|---|---|
| Request filtering | A page chooses `get_filter_request_var()` or does not. `log_validation` reports, it does not block |
| Output escaping | `html_escape()` and `html_purify()` are applied per call site |
| Authorization per page | The realm check uses `$user_auth_realm_filenames`, keyed on filename. A page absent from that map gets realm 0, and realm 0 skips the check. Plugin pages rely on the plugin registering its realm |
| Directory denial | The `.htaccess` files under `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, and `cache/*` are Apache directives. Under nginx, or under Apache with `AllowOverride` off, none of them apply |
| Security headers on static files | `.htaccess.dist` is shipped unrenamed. PHP responses get the full set from `CactiSecureHeaders::emitHeaders()`; static assets get nothing until you enable the overlay or put the directives in the server config |
| Separation of web and poller users | A convention, not a requirement |
| Permissions on `include/config.php` | Set by whoever installed it |

The `index.php` redirect stubs in `resource/` and its subdirectories stop a
directory listing. They are not access control and do not stop a direct request for
a named file.

## Endpoints that answer before authentication

Six files do not include `include/auth.php`.

| File | Behaviour |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | The login surface itself |
| `csp_report.php` | Receives browser CSP violation reports |
| `service_check.php` | Answers `success` or `fail` after one query against `version`. A liveness probe with no authentication |
| `link.php` | Loads an external link row, then checks `is_realm_allowed($page['id'] + 10000)` itself |
| `remote_agent.php` | The data collector RPC, authorized by source address |

`remote_agent.php` is the one to think about. Its authorization is
`remote_client_authorized()`, which compares `get_client_addr()` against the
hostnames and addresses in the `poller` table. There is no shared secret. A caller
whose address matches an enabled data collector row can invoke the agent's actions:
poll data, run a data query, ping a device, perform SNMP gets and walks, request
graph data, and run network discovery. Two protections shape this. First, the
function returns false outright when only one data collector is defined, so a
single-server install never accepts remote agent calls. Second, when the match is
by hostname rather than by exact IP, the reverse lookup is confirmed by a forward
lookup before it is accepted.

`get_client_addr()` reads `REMOTE_ADDR` and nothing else unless `$proxy_headers` is
set in `include/config.php`. The shipped default is `null`. Setting it makes
Kadupul believe a header, which is correct behind a proxy that overwrites that
header and wrong anywhere else. This is the single configuration line that most
changes the meaning of every address-based decision in the system, including
remote agent authorization and the addresses recorded in the log.

## Guest access

The `guest_user` setting names an account whose permissions are used for graph
pages without a login. It defaults to no user, and graph viewing then requires
authentication like everything else. Setting it publishes whatever that account may
see, to anyone who can reach the web server. That is the intent of the feature. It
is also a permission grant that does not appear in any user list.

## How to reason about a change

Ask three questions in order.

Which process will run this, and as which user? The answer for a data input method
is the poller's user, not the browsing operator's.

What does the data touch on its way through? A value from a device that only ever
lands in an RRD file has crossed one boundary. The same value in a graph title has
crossed two, and in a script argument, three.

Is the boundary I am relying on enforced or conventional? If it is conventional,
the code you are writing is the enforcement.

Related reading: [Permissions and access](/1.2.31/concepts/permissions-and-access/) for
the authorization model itself, [Data input methods](/1.2.31/reference/data-input-methods/)
for the execution contract and the input whitelist, and
[Remote data collection](/1.2.31/concepts/remote-data-collection/) for what a data
collector does with the trust it is given.
