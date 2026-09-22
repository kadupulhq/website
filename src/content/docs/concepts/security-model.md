---
title: Security model
description: Where untrusted data enters Kadupul, which process runs with which privilege, what the database account can do, and which boundaries the code enforces rather than assumes.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 12
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

Request helpers live in `lib/html_utility.php`. `get_filter_request_var()` defaults
to integer validation, but it also has special cases for empty, undefined and regex
values. A caller still needs to check whether a value is required and appropriate
for the operation. Filtering does not establish authorization.

`set_request_var()` caches a value in `$_CACTI_REQUEST` and mirrors it into the
request arrays. `get_nfilter_request_var()` reads that cache or the raw request and
does not itself validate or write the value. Later reads can therefore observe a
previously stored value, and read order matters.

With `log_validation` enabled, `get_request_var()` logs certain uncached request
reads. Direct superglobal reads and `get_nfilter_request_var()` are not all covered.
It is diagnostic assistance, not complete validation auditing or enforcement.

### SNMP values

Data-query discovery stores selected indexed values in `host_snmp_cache`; ordinary
SNMP polling results follow the sample path. `data_query_format_record()` in `lib/data_query.php`
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
[RRDtool integration](/reference/rrdtool-integration/) are the boundary here.
Device data must remain untrusted. Validation and escaping are properties of each
call site; the presence of helpers is not proof that every consumer uses them
correctly. Check both the command structure and the substituted argument.

### Script output

The `popen()` branch of `exec_poll()` reads with `fgets(..., 8192)`, returning at most
8,191 bytes or the first newline. Its `shell_exec()` fallback has different output
behavior, and script-server collection follows another path.

`prepare_validate_result()` recognizes numeric and unknown values, hexadecimal
forms and some multi-field output shapes. It can also strip text to obtain a numeric
value; it is not a universal strict scalar filter. Subsequent parsing and RRDtool
validation matter too. See [Data input methods](/reference/data-input-methods/).

Output checks do not sandbox a script that has already executed. Review the command,
input whitelist and operating-system privileges before enabling collection.

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

Packages may then write selected files. Accepted names start with `scripts/` or
`resource/`, optionally beneath a valid `plugins/<name>/` prefix. The importer rejects
NUL, traversal and absolute paths and resolves containment under the installation
root; merely containing a directory name is insufficient. Destination writability
also controls whether the write succeeds. A package that passes verification writes
executable PHP into the install tree by design. Signature verification establishes accepted signing identity and integrity, not
that code is harmless. Realm authorization, path containment, selected files,
filesystem permissions and command-whitelist policy also matter.

Both mechanisms sit behind realm 17. The stock Template Editor role holds realm 17
and realm 2 (Data Input Methods). An account with those permissions can define collection commands, subject to
validation and whitelist handling. That is what the role is for, and it is worth knowing before
granting it. See [Import and export templates](/guides/import-and-export-templates/)
for the validated workflow and known limitations.

## What runs with which privilege

| Process | Started by | Runs as | Does |
|---|---|---|---|
| Web interface | The web server | The web server user | Reads and writes the database, renders graphs through RRDtool, writes RRD files on demand, writes package files during import |
| `poller.php` | Configured scheduler or service | Scheduler/service account | Reads the poller cache, launches collectors, writes RRD files |
| `cmd.php` | Poller or realtime collection path | Launching account | Performs SNMP gets and collection commands |
| `script_server.php` | Collector | Launching account | Includes a PHP file and calls a function in its own process |
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

**The web process can write RRD files.** Graph requests can trigger on-demand Boost
updates and file creation. A warning that defers one directory-creation path to the
poller does not make web write access universally optional. The current storage
preflight and maintenance coordination also check account access and trusted numeric
UID/GID configuration. Root-run creation attempts to match storage ownership, but
failures can be logged. See [Upgrade safely](/guides/upgrade-safely/).

The web and scheduled poller accounts can differ. Realtime collection launched from
a web request can inherit the web account, so command execution is not restricted
to the scheduled poller's identity. The inherited Spine integration requires separate
validation against the actual binary; this page does not establish a supported build.

## What the database account needs

Processes using the same database configuration normally share its account. Remote
collectors can have separate local and central credentials; deployment-specific
configuration may differ. Inspect actual grants for every configured account.

| Requirement | Why |
|---|---|
| Full DML on the Kadupul schema | Ordinary operation |
| DDL on the Kadupul schema | Upgrades and runtime operations such as Boost table rotation, temporary tables and plugin lifecycle changes |
| `SELECT` on `mysql.time_zone_name` | Site and data collector timezone lists read that table directly |

Do not remove DDL privileges on the assumption that only upgrades need them. The
application does not universally switch to a separate migration identity; account
separation requires deployment-specific validation of all affected runtime paths.

`include/config.php` contains database credentials and remote collectors can also
hold central `$rdatabase_*` credentials. Filesystem permissions, HTTP access rules,
PHP handler configuration and backup protection all matter. PHP normally executes
the file rather than serving its source, but that is not a substitute for protecting
it from direct disclosure. See
[Secure an internet-facing install](/guides/secure-an-internet-facing-install/).

Device credentials are stored the same way. `host.snmp_community`,
`host.snmp_password`, and `host.snmp_priv_passphrase` are ordinary columns, written
by `api_device_save()` through `form_input_validate()` with no encryption step, and
copied onto `poller_item` rows for the poller to read. Read access to the relevant tables can expose stored device credentials; it does
not imply access to every possible external credential source. User passwords are the exception:
`compat_password_hash()` uses PHP's `password_hash()` with `PASSWORD_DEFAULT`, and
a legacy MD5 hash that still verifies is rehashed on next login.

## Enforced, and merely conventional

This is the distinction that matters most when reasoning about a change.

### Code mechanisms and their scope

| Boundary | Mechanism |
|---|---|
| Authentication | Common interface pages use `include/auth.php`; specialized endpoints have their own handling |
| CSRF | Shared web bootstrap configures token handling; malformed token arrays are rejected. Check each endpoint and dispatch path rather than assuming universal coverage |
| CLI-only scripts | `include/cli_check.php` answers `404` and exits when the SAPI is not `cli` |
| Data query XML location | `cacti_path_is_within()` against `<base_path>/resource`, logged and refused otherwise |
| Package authenticity | Signature against a compiled-in key, minimum 2048 bits, per-file signatures |
| Package file placement | Invalid names rejected; allowed script/resource prefixes and resolved root containment checked |
| Script server targets | `realpath()` containment, plus the function checks above |
| Shell arguments | Escaping, structured command helpers and validators where applied; inspect the actual call site |
| RRDtool arguments | Control-character and shape validators in `lib/functions.php` |
| SQL | Prepared helpers bind values; dynamic SQL, identifiers and non-prepared calls still require review |
| Remote agent callers | Source address must match an enabled row in `poller`, by exact IP or by a forward-confirmed reverse lookup |

### Deployment and call-site responsibilities

| Boundary | Why it is not enforced |
|---|---|
| Request filtering | A page chooses `get_filter_request_var()` or does not. `log_validation` reports, it does not block |
| Output escaping | `html_escape()` and `html_purify()` are applied per call site |
| Authorization per page | The realm check uses `$user_auth_realm_filenames`, keyed on filename. An unmapped page does not receive a positive realm check from that map alone. Additional endpoint/object checks may apply; plugin pages must register and enforce their access policy |
| Directory denial | The `.htaccess` files under `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, and `cache/*` are Apache directives. Under nginx, or under Apache with `AllowOverride` off, none of them apply |
| Security headers on static files | `.htaccess.dist` is shipped unrenamed. PHP header emission depends on its response path and settings; static responses depend on actual server/proxy configuration |
| Separation of web and poller users | A convention, not a requirement |
| Permissions on `include/config.php` | Set by whoever installed it |

The `index.php` redirect stubs in `resource/` and its subdirectories stop a
directory listing. They are not access control and do not stop a direct request for
a named file.

## Endpoints that answer before authentication

These are examples of specialized entry points, not an exhaustive inventory of
public endpoints. Absence of the common include does not establish absence of
authentication or authorization elsewhere in the request path.

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
function returns false outright when at most one enabled collector row is returned, so that case is rejected by this function. Second, when the match is
by hostname rather than by exact IP, the reverse lookup is confirmed by a forward
lookup before it is accepted.

`get_client_addr()` reads `REMOTE_ADDR` and nothing else unless `$proxy_headers` is
set in `include/config.php`. The shipped default is `null`. Enabling supported proxy headers changes the ordered sources from which a valid
client address is selected. Use only headers controlled by the trusted ingress
proxy, and prevent clients from bypassing or supplying those values themselves. This is the single configuration line that most
changes the meaning of every address-based decision in the system, including
remote agent authorization and the addresses recorded in the log.

## Guest access

The `guest_user` setting names an account whose permissions are used for graph
pages without a login. It defaults to no user, and graph viewing then requires
authentication like everything else. Setting it publishes whatever that account may
see, to anyone who can reach the web server. That is the intent of the feature. The account still exists in the user records; the guest setting is what makes its
applicable graph permissions usable without a normal login. Verify actual requests
and object permissions, not just the configured account name.

## How to reason about a change

Ask three questions in order.

Which process will run this, and as which user? The answer for a data input method
is normally the launching collector's operating-system account; web-triggered
collection can differ from scheduled collection.

What does the data touch on its way through? A value from a device that only ever
lands in an RRD file has crossed one boundary. The same value in a graph title has
crossed two, and in a script argument, three.

Is the boundary I am relying on enforced or conventional? If it is conventional,
the code you are writing is the enforcement.

Related reading: [Permissions and access](/concepts/permissions-and-access/) for
the authorization model itself, [Data input methods](/reference/data-input-methods/)
for the execution contract and the input whitelist, and
[Remote data collection](/concepts/remote-data-collection/) for what a data
collector does with the trust it is given.
