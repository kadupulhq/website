---
title: Secure an internet-facing install
description: What to change before a monitoring system with shell access to your network answers requests from the public internet.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 9
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Start with the honest answer: put it behind a VPN. Kadupul holds the SNMP
credentials for every device you monitor, in cleartext, and it runs commands on
its own host as part of normal operation. There is no configuration that makes it
a good thing to have on the public internet.

The checks below help assess an isolated installation. They do not establish a
supported or secure public deployment; keep the project-status limitation above
when interpreting the results.

## TLS

Terminate TLS at the web server or a proxy in front of it. Kadupul does not
listen on a socket of its own.

Then turn on the setting that redirects plain HTTP requests to HTTPS. It is off
by default. Without it, a login form is served over HTTP and a password crosses
the wire in the clear before anything else has a chance to matter.

The application sets the session cookie's Secure flag when PHP receives a nonempty
`$_SERVER['HTTPS']` value other than `off`. Behind a TLS-terminating proxy,
configure the trusted web server or FastCGI layer to represent HTTPS correctly,
and verify the resulting `Set-Cookie` header in a browser.

`$proxy_headers` controls client-address resolution. It does not set the HTTPS
server variable or enable Secure cookies. Trust only the address headers your
proxy sets, strip client-supplied copies, and prevent direct access to the backend.
Enforce HTTP-to-HTTPS redirects at the public proxy before credentials are sent.

The application sets HttpOnly and SameSite=Strict on its session cookie. Verify
the actual cookie and redirect behavior at the deployment boundary; these flags
do not establish that all other cookies share the same configuration. See the
[PHP session configuration reference](https://www.php.net/manual/en/session.configuration.php).

## Default credentials

The shipped schema contains one administrative account named `admin` whose
password hash is the MD5 of the string `admin`. It is flagged to require a change
at first login. Confirm the change happened rather than assuming it did. The
prompt that enforces it is skipped under web basic authentication, where the web
server has already decided who the user is.

Then look at the credentials that are not user accounts:

- The database account defaults to `cactiuser` with the password `cactiuser` in
  the shipped configuration template.
- The automation subsystem ships default SNMP options containing the community
  strings `public` and `private`, and an SNMPv3 username and password pair.
  These are scan defaults, not device configuration, but they are the strings
  your discovery will try first.

Password policy is configurable. The defaults require eight characters and mixed
case. Expiry and account lockout after repeated failures are both available and
both off by default. On an internet-facing install, turn lockout on.

## Database privileges

The installation example uses database-scoped privileges plus timezone-table
access. Replace these illustrative account/database names and review grants for
the actual deployment and maintenance tasks:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

That second grant is not optional. Timezone handling reads that table, and the
installer checks for access and populated timezone data. Review additional grants
against actual maintenance and collector requirements before removing them;
this example is not proof that every deployment needs exactly the same privileges.

Scoping notes that matter:

- Bind the database to localhost, or to a private interface, and not to the
  address the web server answers on.
- Give each remote data collector its own database account. Their credentials
  live in the central database and in their own configuration file, so a
  separate accounts improve attribution and revocation. They do not themselves
  isolate a compromised collector if its grants still permit central writes.
- The connection supports TLS, configured with a key, certificate and CA path in
  the configuration file. Use it whenever the database is not on the same host.
- Make the configuration file readable by the web server user and writable by
  neither the web nor poller service user during normal operation. Keep it owned
  by an administrative account. Remote-poller setup specifically checks whether
  it can update the file; do not assume every primary-server install needs the
  same temporary write permissions.
- The CSRF secret can be stored in a file instead of the database. If you use
  that option, the file must be outside the document root. This is stated as a
  requirement, not a suggestion.

## Keep data directories out of the document root

In a repository-root deployment, private data and source directories can sit below
the served root. Several directories carry `.htaccess` denial rules; inventory
the actual checkout and server configuration rather than assuming every path is
covered. The current partial framework migration also means switching the whole
site to `public/` without its legacy routes is not a complete deployment procedure.

Those files only work on Apache, and only when the configuration allows an
override in that directory. On nginx they are inert. On a misconfigured Apache
they are inert. An inert deny-all in front of the log directory means anyone can
read your application log, which carries device names, usernames, query text and
failure detail. Apache documents the required override behavior in its
[.htaccess guide](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Do both of these:

**Verify storage paths before moving data.** Log destinations are configurable,
but `include/global.php` sets the RRA base to the installation's `rra` directory;
there is no generic RRA-directory UI setting. A separately mounted storage layout
can preserve that expected path, but filesystem placement alone does not prevent
HTTP access through a served directory or symlink. Check existing data-source paths,
service permissions, backups and HTTP denial together. Do not relocate cache trees
without verifying how their consumers resolve files. See
[Migrate to new hardware](/guides/migrate-to-new-hardware/) and
[Upgrade safely](/guides/upgrade-safely/).

**Deny private paths at the web server.** Adapt the source's
[repository-root Nginx example](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
to the actual URL prefix and server; denial rules must take precedence over generic
PHP handling. This list is an inventory aid, not a drop-in server configuration:

| Directory | Why |
|---|---|
| `rra/` | Measurement files |
| `log/` | Application log, including query and error detail |
| `cache/` | Inspect intended asset access; block execution of PHP in cache paths |
| `scripts/` | Collection code must not be directly served or invoked over HTTP |
| `cli/` | Command line tools that are not meant to be reachable over HTTP |
| `mibs/`, `contrib/`, `docs/` | Internal resources and documentation |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Application internals, state and tooling |
| Dotfiles, dependency manifests, internal include/bootstrap PHP | Repository metadata and internal entry points |

Preserve required public assets such as `include/js` and `include/themes`; a blanket
block on all includes can break the UI. Verify denial using harmless test paths and
check that responses do not disclose source or file contents. Do not test by fetching
real secrets into a terminal or log.

There is also an optional file of security response headers for static assets.
PHP responses set their own headers in code; static files do not, unless you
enable that file or put the same directives in the server configuration.

A content security policy is configurable. The default script policy permits
inline JavaScript without a nonce, because plugins rely on it. The stricter nonce
mode exposed in Settings is report-only. The header implementation also accepts
`nonce` enforcement, despite the [outdated Settings help](https://github.com/kadupulhq/kadupul/issues/265).
Enforcement and report-only mode are distinct; inspect headers and test all required
pages/plugins before changing modes. Implemented enforcement is not evidence of
complete nonce compatibility.

## The poller executes commands

This is the part that changes the threat model.

Collection is not only SNMP. A data input method can define a command line, and
the poller runs it. The command line is stored in the poller cache and executed
by the collector on every interval, as the collector's operating system user.
PHP script-server inputs use a separate long-lived PHP process. External-command
and script-server inputs are different paths; do not assume every script runs
inside that server or that a C collector has been validated for this checkout.

Treat the following permissions as highly privileged code-execution configuration
surfaces. Their exact effects depend on enabled features and validation controls:

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
not on the list. Changing an approved command makes it fail comparison until the
reviewed whitelist is updated. Regenerating is a command line step, which is the point: it needs
shell access on the host, not an administrative session in the browser.

The check runs again when the poller cache is rebuilt. A data input that fails it
produces no poller items, and any rows it left behind are deleted on the next
committed rebuild/flush. This gates creation and cache population; it is not an
instant cancellation mechanism for already-running work or proof that every
collector reloads a changed whitelist before each execution. Verify the committed
cache state and the collector's behavior after a policy change.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

An unscoped `--update` accepts the current command definitions into the whitelist;
do not use it as a substitute for reviewing them. Protect the whitelist and its
parent directory from service-user writes. It is off unless configured. See
[Write a data collection script](/guides/write-a-data-collection-script/) for the
selection and output details.
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

The Settings selector exposes these authenticated methods, not legacy mode zero.
The authentication bootstrap attempts to migrate a legacy no-auth configuration
back to local authentication, but lower-level authorization helpers still contain
mode-zero branches. Verify the stored method, configured identities and actual
protected routes rather than treating the absent UI choice as universal proof.

Points to check:

- **Web basic delegates identity validation.** Kadupul reads server-authenticated
  identity variables when this mode is selected and still applies account mapping,
  enabled-state and authorization rules. A missing identity is not automatically
  an administrator. Configure the server to authenticate every intended route and
  prevent clients from supplying trusted identity variables; verify image/export
  routes and deliberate guest behavior separately.
- **Support for "keep me signed in"** is enabled by default. A persistent token is
  created when the user chooses that option after authentication, rather than for
  every session automatically. It expires after ninety days of non-use. On an
  internet-facing install, decide deliberately whether you want it.
- **Set the guest user to nobody** unless you specifically want anonymous graph
  viewing. It defaults to no user, which is the right default; confirm it was not
  changed during setup.
- **Put multi-factor authentication in front of it.** There is no MFA in the
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

1. TLS terminated, HTTP redirected before login, PHP HTTPS state configured by
   the trusted server, and Secure cookies verified. Client-address headers limited
   to those the proxy sets and strips.
2. Default admin password changed and confirmed. Account lockout on.
3. Database grants reviewed for installation, maintenance and collector roles;
   timezone access verified and database network access restricted to required clients.
4. Storage paths verified, private directories and metadata denied at the web server,
   and required static assets still functional.
5. Configuration file not writable at runtime. CSRF secret file, if used, outside
   the document root.
6. Data Input Methods, Import Templates and Plugin Administration granted to
   nobody without shell on the poller host. Metacharacter restriction on. Input
   whitelist configured.
7. Remote collector endpoint restricted by address. Certificate checking on.
8. MFA in a proxy in front of the whole thing.
