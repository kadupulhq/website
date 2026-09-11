---
title: Secure an internet-facing install
description: What to change before a monitoring system with shell access to your
  network answers requests from the public internet.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 9
slug: 1.2.31/guides/secure-an-internet-facing-install
---

:::caution[Nothing to expose yet]
Kadupul has not shipped. This page records the intended security posture and the
settings that control it. Treat it as a checklist to review, not a procedure to
run.
:::

Start with the honest answer: put it behind a VPN. Kadupul holds the SNMP
credentials for every device you monitor, in cleartext, and it runs commands on
its own host as part of normal operation. There is no configuration that makes it
a good thing to have on the public internet.

If you are going to do it anyway, this is the list.

## TLS

Terminate TLS at the web server or a proxy in front of it. Kadupul does not
listen on a socket of its own.

Then turn on the setting that redirects plain HTTP requests to HTTPS. It is off
by default. Without it, a login form is served over HTTP and a password crosses
the wire in the clear before anything else has a chance to matter.

The session cookie's Secure flag is set based on whether the current request is
encrypted. Two consequences:

* Behind a TLS-terminating proxy, the application sees a plain HTTP request and
  does not set the flag unless you tell it to trust a forwarded-protocol header.
  Trust is configured in the configuration file, by naming the specific headers
  your proxy sets.
* Do not set that trust to "all headers". The configuration file offers it and
  the file's own comment advises against it. A client can send any header it
  likes, and trusting all of them lets a client assert both its own address and
  the connection's protocol.

Name the exact headers your proxy sets, and make sure the proxy strips those same
headers from inbound requests.

The HttpOnly and SameSite=Strict flags are set on the session cookie regardless.

## Default credentials

The shipped schema contains one administrative account named `admin` whose
password hash is the MD5 of the string `admin`. It is flagged to require a change
at first login. Confirm the change happened rather than assuming it did. The
prompt that enforces it is skipped under web basic authentication, where the web
server has already decided who the user is.

Then look at the credentials that are not user accounts:

* The database account defaults to `cactiuser` with the password `cactiuser` in
  the shipped configuration template.
* The automation subsystem ships default SNMP options containing the community
  strings `public` and `private`, and an SNMPv3 username and password pair.
  These are scan defaults, not device configuration, but they are the strings
  your discovery will try first.

Password policy is configurable. The defaults require eight characters and mixed
case. Expiry and account lockout after repeated failures are both available and
both off by default. On an internet-facing install, turn lockout on.

## Database privileges

The account Kadupul uses needs full rights inside its own database and one grant
outside it:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

That second grant is not optional. Timezone handling reads that table, and the
installer refuses to proceed without it. It is also the entire justification for
the account touching anything outside its own database, so if you see broader
grants, they were added by somebody and can come off.

Scoping notes that matter:

* Bind the database to localhost, or to a private interface, and not to the
  address the web server answers on.
* Give each remote data collector its own database account. Their credentials
  live in the central database and in their own configuration file, so a
  compromised collector should not be a compromised central database.
* The connection supports TLS, configured with a key, certificate and CA path in
  the configuration file. Use it whenever the database is not on the same host.
* Make the configuration file readable by the web server user and writable by
  nobody, once the install is finished. The installer needs to write it. Nothing
  at runtime does.
* The CSRF secret can be stored in a file instead of the database. If you use
  that option, the file must be outside the document root. This is stated as a
  requirement, not a suggestion.

## Keep data directories out of the document root

By default the RRA directory, the log directory and the cache directories all sit
underneath the install, which is underneath the document root. Deny-all
`.htaccess` files ship in each of them.

Those files only work on Apache, and only when the configuration allows an
override in that directory. On nginx they are inert. On a misconfigured Apache
they are inert. An inert deny-all in front of the log directory means anyone can
read your application log, which carries device names, usernames, query text and
failure detail.

Do both of these:

**Move the directories.** The RRA path, the log path, and the standard error log
path are all settings. Point them somewhere outside the document root. This
survives a change of web server and a change of Apache configuration, and it also
removes the upgrade hazard described in
[Upgrade safely](/1.2.31/guides/upgrade-safely/).

**Deny them at the web server anyway.** Belt and braces. The directories that
ship with a deny-all rule are the ones to cover:

| Directory | Why |
|---|---|
| `rra/` | Measurement files |
| `log/` | Application log, including query and error detail |
| `cache/*` | Rendered images, MIB cache, template cache |
| `scripts/` | Data collection scripts, readable as source |
| `cli/` | Command line tools that are not meant to be reachable over HTTP |
| `mibs/`, `contrib/` | No reason to be served |

There is also an optional file of security response headers for static assets.
PHP responses set their own headers in code; static files do not, unless you
enable that file or put the same directives in the server configuration.

A content security policy is configurable. The default script policy permits
inline JavaScript without a nonce, because plugins rely on it. The stricter nonce
mode is report-only for now. Turn reporting on and read the reports before
assuming a stricter policy would hold.

## The poller executes commands

This is the part that changes the threat model.

Collection is not only SNMP. A data input method can define a command line, and
the poller runs it. The command line is stored in the poller cache and executed
by the collector on every interval, as the collector's operating system user.
With the C collector, script-based collection runs through long-lived script
server processes for the same reason.

So the following permissions are equivalent to a shell on the poller host:

| Permission | Why |
|---|---|
| Data Input Methods | Defines the command line directly |
| Import Templates | An imported template or package can carry a data input method |
| Plugin Administration | Plugin code runs in the application |
| Settings/Utilities | Controls the paths to the binaries that get executed |

Grant them to nobody who does not already have shell on that host. A read-only
user who can view graphs is a different thing entirely, and that is the role
almost every account should have.

Two controls exist and both are worth using:

**Metacharacter restriction.** Shell metacharacters in data input command strings
are blocked by default. There is a setting to allow them, which exists for old
definitions that used shell pipelines. Leave it off. If you have definitions that
need it, move the pipeline into a script under the scripts directory and call the
script.

**The input whitelist.** A file, named in the configuration file, holding the
approved command strings keyed by data input method. When it is set, graphs and
data sources cannot be created from a data input method whose command string is
not on the list, and editing a definition invalidates its entry until the file is
regenerated. Regenerating is a command line step, which is the point: it needs
shell access on the host, not an administrative session in the browser.

The check runs again when the poller cache is rebuilt. A data input that fails it
produces no poller items, and any rows it left behind are deleted on the next
flush, so the command is never handed to the poller. Creation and execution are
both gated, not just creation.

```sh
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update
```

It is off unless you configure it. On an internet-facing install, configure it.
It raises the cost of a browser-side administrative compromise, because putting a
new command into collection now also needs filesystem write access on the poller
host. It is still not a substitute for restricting who holds the permissions in
the table above, since an attacker who can reach an already-approved command
string does not need to add one.

## Authentication

Four methods ship. Which are available depends on the PHP extensions present.

| Method | Where users are checked | Notes |
|---|---|---|
| Built-in | The local database | Passwords, policy and lockout are all handled locally |
| Web basic | The web server | Kadupul trusts whatever the server says the user is |
| LDAP | A single directory | Requires the PHP LDAP extension |
| Multiple LDAP/AD domains | Several directories | Same requirement |

Authentication cannot be turned off. Earlier versions had a no-authentication
mode; it was removed, and an install still configured for it is migrated to local
authentication.

Points to check:

* **Web basic authentication delegates everything.** If the web server is
  misconfigured to allow an unauthenticated path, Kadupul has no second opinion.
  Verify the server's rules cover every entry point, including image and export
  endpoints.
* **The "keep me signed in" cookie** is enabled by default and persists across
  browser sessions. It expires after ninety days of non-use. On an
  internet-facing install, decide deliberately whether you want it.
* **Set the guest user to nobody** unless you specifically want anonymous graph
  viewing. It defaults to no user, which is the right default; confirm it was not
  changed during setup.
* **Put multi-factor authentication in front of it.** There is no MFA in the
  application. An identity-aware proxy or an SSO gateway is where it goes.

## Remote data collector endpoints

If you run remote collectors, the central install exposes an endpoint they call.
It does not authenticate with a user session. It authorises by resolving the
calling address and matching it against the hostnames of registered collectors,
logging failures under a security category.

Two things follow. First, that endpoint should not be reachable from the public
internet; restrict it at the web server to the collector addresses. Second, the
client address it checks is the one derived from the request, so the
forwarded-header trust configured earlier applies here too. Trusting headers you
do not control lets a caller assert a collector's address.

Separately, the setting that allows self-signed certificates and hostname
mismatches when the central server talks to a collector is on by default. Issue
real certificates for your collectors and turn it off.

## Minimum checklist

1. TLS terminated, HTTP redirected to HTTPS, forwarded-protocol trust limited to
   named headers your proxy sets and strips.
2. Default admin password changed and confirmed. Account lockout on.
3. Database account holding rights to its own database plus the one timezone
   grant, nothing more. Database not reachable from outside the host.
4. RRA, log and cache directories moved outside the document root, and denied at
   the web server as well.
5. Configuration file not writable at runtime. CSRF secret file, if used, outside
   the document root.
6. Data Input Methods, Import Templates and Plugin Administration granted to
   nobody without shell on the poller host. Metacharacter restriction on. Input
   whitelist configured.
7. Remote collector endpoint restricted by address. Certificate checking on.
8. MFA in a proxy in front of the whole thing.
