---
title: Install
description: What Kadupul needs to run, and the order to put it together in.
sidebar:
  order: 2
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Work through this once, in order. Each step ends with a check. Do the check before
moving on: every failure listed here is cheap to find now and expensive to find
after the poller has been running for a week.

## What you need first

Kadupul is a PHP application that stores configuration in MySQL or MariaDB and
stores measurements in RRD files on disk. This page describes a new main-server
installation from the current `main` source, not an upgrade or the archived LTS
line. Four things have to exist before it runs.

| Component | Why it is needed |
|---|---|
| PHP 8.4 or newer, on a security-supported release | Runs the web interface and the poller |
| MySQL or MariaDB | Holds devices, templates, users, and the poller cache |
| RRDtool | Creates and updates the round-robin archives, and renders graphs |
| net-snmp | Provides the client tools and libraries used to query devices |

PHP also needs the extensions required by
[the application manifest](https://github.com/kadupulhq/kadupul/blob/main/composer.json),
including `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`,
`pcntl`, `posix`, and `sqlite3`. Install them for both the command-line and web
runtimes. [Requirements](/reference/requirements/) distinguishes Composer
requirements from the installer’s separate checks.

## Step 1: install the runtime

Install PHP with its extensions, your database server, RRDtool, and net-snmp from
your distribution's packages.

**Check it.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` must list the required extensions. The PHP `snmp` extension is optional
when the net-snmp command-line tools are available. Composer checks its own
required extensions during dependency installation; the web installer has a
separate extension check. A runtime fallback does not remove a Composer requirement.

The command-line and web-server PHP configurations can differ. Check both.
The installer recommends `memory_limit` of at least 400M and
`max_execution_time` of at least 60 seconds; it also accepts their unlimited
values (`-1` and `0`, respectively). Values below those recommendations produce
warnings, while a missing `date.timezone` is an error. Set an explicit timezone,
such as `UTC`, and use `php --ini` to identify the command-line configuration.

## Step 2: create the database and its user

Create one empty database, and one user with rights to that database. For a
local database, run this SQL as a database administrator, replacing the example
password before use:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Use the matching database account host if PHP connects from another machine.
The user also
needs read access to the server's time zone tables, which live in the `mysql`
database. That is the one grant outside its own schema, and the check below
fails without it.

The database server also needs its time zone tables populated, and the Kadupul user
needs to read them. Nothing about a monitoring system suggests this, and it is not
optional.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Check it.** Log in as the Kadupul database user and run:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

A non-zero count returned without a permission error is what you want. Zero means
the tables were never loaded; an error means the user cannot read them. Both stop
the installer.

Four of the server's own settings matter enough to fix now.

| Setting | Wanted | Why |
|---|---|---|
| `max_allowed_packet` | 16M or more | Large syncs between the main server and remote collectors |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Device descriptions contain multi-byte characters |
| `innodb_file_per_table` | On | Keeps table spaces separate and manageable |
| `innodb_buffer_pool_size` | Around a quarter of system memory | Keeps the working set in memory |

The installer reports its own reading of these and flags what falls short, so you
need not take the table on trust. [Tune database
performance](/guides/tune-database-performance/) goes further once you have load.

## Step 3: unpack it, fix ownership, and serve it

Put the application somewhere your web server can serve, then decide which system
user owns it. That decision matters more than the location. Two processes write
here: the web server, and whatever schedules the poller. Run both as the same user.
Run the poller unprivileged and give both processes the access they need.
Incorrect ownership or modes can prevent later updates even when graphs render.

### If you cloned the repository rather than unpacking a release

A Git checkout needs both PHP dependencies and generated browser assets. With
the repository’s `mise.toml` runtimes installed, run from the repository root:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer populates `include/vendor/` and restores pinned compatibility files.
The npm build creates assets under `include/js/`, `include/fa/`, and
`include/vendor/flag-icons/`. Composer alone is not sufficient for a source install.

A dependency-complete offline bundle is a separate build artifact. A generic
GitHub source archive is not that bundle. Follow the
[offline build and verification procedure](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation)
when the target host has no internet access.

Prepare the writable paths after installing dependencies:

| Group | Directories | Writable when |
|---|---|---|
| During install | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Only while installing or upgrading |
| During install | `include/vendor/csrf/`, or the configured `path_csrf_secret` location | The installer must create the installation-specific secret; preserve it afterward |
| Always | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, the system temporary directory | For the life of the install |
| Symfony runtime | `var/cache`, and `var/log` if file logging is configured | For the PHP runtime and cache-warming user |

The RRD directory has to be writable for the life of the install too. It holds your
history, so give it the care you would give a database directory.

The current migration still needs legacy login, installer, and plugin routes.
For this combined installation, serve the repository root with explicit rules
that deny access to private directories, configuration, dependencies and runtime
state. Do not switch the entire installation to `public/`: that would remove
legacy routes still in use. Symfony’s separate endpoint has different routing;
see [the migration instructions](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

For Nginx, start from the repository’s
[Nginx location rules](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf),
adapting the root and PHP-FPM upstream. Keep deny rules before generic PHP
handling and preserve PATH_INFO for `/app.php/...`. Nginx does not read
`.htaccess`. Keep RRD files, logs and secrets inaccessible over HTTP; verify the
actual server configuration instead of assuming file permissions prevent serving.

**Check it.** Become the poller user, write a file into each always-group directory,
then delete it. A permission that looks right in `ls -l` can still be denied by
SELinux or AppArmor, and writing the file is the only check that covers that. Then
request a file under the log directory over HTTP. You want a refusal.

## Step 4: write the configuration file

For a new installation, copy the distributed configuration file:

```bash
cp include/config.php.dist include/config.php
```

Do not overwrite an existing installation’s configuration. Set the database host, name,
user, and password from step 2. Two other values matter on a first install:
`url_path`, the path the application is served under with leading and trailing
slashes, and `poller_id`, which is `1` on a main server and something else only on
a remote collector.

Leave the remote collector block commented out. You are not building one yet;
[Remote data collection](/concepts/remote-data-collection/) covers it when you are.
Every other setting has a working default, so read
[Configuration](/reference/configuration/) before changing any of them.

Configure a deployment-specific `APP_SECRET` in the PHP process environment
for Symfony features that use it. The bootstrap defaults to `APP_ENV=prod` and
`APP_DEBUG=0` and does not load `.env` files. This is separate from the legacy
installer’s CSRF secret.

**Check it.** Check syntax without displaying credentials:

```bash
php -l include/config.php
```

Import the schema in the next step before opening the installer in a browser.

## Step 5: import the schema

The installer expects the tables to exist already. Load the shipped schema into
the database you created:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Do this once, against an empty database. This is not an upgrade script; importing
it into a populated database can fail or leave conflicting and partial data.

## Step 6: run the installer

Open the site in a browser and work through it. The installer walks a fixed
sequence, and each step gates the next:

1. Welcome and licence.
2. Dependency check: PHP version and extensions, the PHP settings from step 1 for
   both the command line and the web server, the time zone tables, and the database
   settings from step 2. Errors block the next button. Warnings do not, but read
   them.
3. Installation type: a new main server, or a remote collector.
4. Permission check: the directories from step 3, tested by writing to them.
5. Binary locations: the paths to PHP, RRDtool, and the net-snmp tools.
6. Data source profile and launcher interval.
7. Template selection: which device templates to load.
8. Table conversion, confirmation, and the install itself.

Sub-step 6 is the one that is hard to undo. The profile you pick decides the step
and the archive set written into every RRD file created afterwards, and editing the profile does not migrate existing files. Retention changes need
a separate, tested migration; they do not always require discarding history. If peaks matter, make
sure the profile keeps maxima and not only averages: read [Data sources and
round-robin archives](/concepts/data-sources-and-rras/) before clicking past it.
The launcher interval offered there is one minute or five minutes. The data
source profile sets the collection interval; the launcher and profile must be
configured consistently.

## Step 7: change the default credentials

The shipped schema seeds an administrator account named `admin` with the password
`admin`, flagged so that the first login forces a change. It also seeds a disabled
guest account. Change the password before the instance is reachable by anyone else,
which means before you attach it to a network others can route to.

## Step 8: schedule the poller

The poller has to be started from outside. Configure its collection interval and
launcher interval consistently; the poller supports one-minute or five-minute
launcher intervals and has a guard against ordinary runs arriving too soon. For
a one-minute launcher, install this entry in the unprivileged poller user’s
crontab, replacing `php` and the application path with their absolute paths:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

or run the shipped `cactid.php` daemon using `service/cactid.service`, adjusted
for your installation path and unprivileged user. Use one launcher: disable the
cron job or timer when using the daemon.

Match the actual schedule to the configured launcher interval. For sub-minute
collection profiles, the launched poller runs collection cycles within that
interval; do not try to express a sub-minute cadence with this cron entry.

**Check it.** Run one cycle by hand as the poller user:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` skips the early-run timing guard. Use this manual check with the
scheduler stopped so it does not overlap a scheduled run. It does not bypass
other maintenance or safety checks. You want a clean finish with a summary line.
Then enable the scheduler and leave it alone for two intervals; confirm that
another run happened without you.

## What goes wrong

These are the failures a first install actually hits.

| Symptom | Cause | Where to look |
|---|---|---|
| Installer blocks on PHP settings that look correct | The web server and the command line read different `php.ini` files | `php --ini`, and the file the web SAPI reports |
| Installer blocks on time zones | Time zone tables not loaded, or the Kadupul user cannot read them | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Permission step fails on a directory that looks writable | Wrong owner, or SELinux and AppArmor | Write a file as the poller user |
| Install completes, no data ever arrives | Poller never scheduled | Run `poller.php --force --debug` by hand |
| Data for a few cycles, then nothing | Poller running as the wrong user, leaving files the web user cannot update | Owner of the files in the RRD directory |
| Graphs full of small gaps | Scheduled interval and configured interval disagree | The crontab, against the configured interval |
| Composer refuses installation | PHP is below 8.4 or a manifest-required extension is missing | `php -v`, `php -m`, and Composer’s error output |
| Poller cannot run more than one process | `pcntl` or `posix` missing | `php -m` |

[Logging](/reference/logging/) covers where each records itself. [Troubleshoot
missing data](/guides/troubleshoot-missing-data/) covers the case where the install
is fine and one device is not.

## Before you expose it

The poller runs as a system user and executes RRDtool and your collection scripts.
Treat the install as something that runs commands, because it does.

- Serve it over TLS.
- Do not leave the default administrator password in place, even briefly.
- Restrict the database user to its own database.
- Keep the RRD and log directories out of the document root.
- Leave the guest account disabled unless you decide otherwise.

[Secure an internet-facing install](/guides/secure-an-internet-facing-install/) has
the rest. Next: [Add your first device](/start/first-device/).
