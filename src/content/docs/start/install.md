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
stores measurements in RRD files on disk. Four things have to exist before it runs.

| Component | Why it is needed |
|---|---|
| A security-supported PHP version meeting the manifest | Runs the web interface and the poller |
| MySQL or MariaDB | Holds devices, templates, users, and the poller cache |
| RRDtool | Creates and updates the round-robin archives, and renders graphs |
| net-snmp | Provides the client tools and libraries used to query devices |

PHP also needs a set of extensions: `pdo_mysql`, `gd`, `sockets`, `gmp`,
`intl`, `mbstring`, `pcntl`, and `posix` among them. The full list is in
[Requirements](/reference/requirements/).

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
when the net-snmp command line tools are available. A missing required extension
blocks an installer step later, and some fail in ways that do not name themselves:
without `gmp`, 64-bit interface counters misbehave rather than error.

PHP reads one configuration file on the command line and another under the web
server, and the poller runs under the first while the interface runs under the
second. Three values have to be right in **both**: `memory_limit` at 400M or more,
`max_execution_time` at 60 seconds or more, and `date.timezone` set to a real zone
rather than left empty. An unset `date.timezone` is the most common reason an
otherwise correct install refuses to proceed.

## Step 2: create the database and its user

Create one database, and one user with rights to that database. The user also
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

The directories that must be writable fall into two groups.

| Group | Directories | Writable when |
|---|---|---|
| During install | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Only while installing or upgrading |
| Always | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, the system temporary directory | For the life of the install |

The RRD directory has to be writable for the life of the install too. It holds your
history, so give it the care you would give a database directory.

Serve the application root, and put those data directories out of reach. They sit
inside the application tree by default and none of them should be fetchable over
HTTP. Move them outside the document root and point the configuration at the new
locations, or deny them in the web server configuration. An exposed RRD directory
hands your entire measurement history to anyone who guesses a filename.

**Check it.** Become the poller user, write a file into each always-group directory,
then delete it. A permission that looks right in `ls -l` can still be denied by
SELinux or AppArmor, and writing the file is the only check that covers that. Then
request a file under the log directory over HTTP. You want a refusal.

### If you cloned the repository rather than unpacking a release

A release archive ships with its dependencies already in place. A source checkout
does not, and the application will fail on its first request without them,
because `include/global.php` loads Composer's autoloader.

```bash
composer install --no-dev --optimize-autoloader
```

## Step 4: write the configuration file

Copy the distributed configuration file into place and set the database host, name,
user, and password from step 2. Two other values matter on a first install:
`url_path`, the path the application is served under with leading and trailing
slashes, and `poller_id`, which is `1` on a main server and something else only on
a remote collector.

Leave the remote collector block commented out. You are not building one yet;
[Remote data collection](/concepts/remote-data-collection/) covers it when you are.
Every other setting has a working default, so read
[Configuration](/reference/configuration/) before changing any of them.

**Check it.** Load the site root in a browser. Reaching the installer means PHP ran
and the file parsed. A database error here means the credentials are wrong, and it
is far easier to read now than in a log later.

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
6. Data source profile and poller interval.
7. Template selection: which device templates to load.
8. Table conversion, confirmation, and the install itself.

Sub-step 6 is the one that is hard to undo. The profile you pick decides the step
and the archive set written into every RRD file created afterwards, and editing the profile does not migrate existing files. Retention changes need
a separate, tested migration; they do not always require discarding history. If peaks matter, make
sure the profile keeps maxima and not only averages: read [Data sources and
round-robin archives](/concepts/data-sources-and-rras/) before clicking past it.
The interval offered there is either every minute or every five minutes, and
whichever you pick has to match what you schedule next.

## Step 7: schedule the poller

The poller has to be started from outside. It decides internally whether a given
run is due, so starting it more often than the collection interval is safe. Either
schedule it once a minute from cron or a systemd timer:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

or run the shipped daemon under a service manager instead. The daemon exists
because cron is awkward to make highly available; one server does not need it.

Schedule the launcher at least as often as the configured collection interval. A
poller scheduled every five minutes while the configuration says every minute
produces a graph full of gaps and no error message.

**Check it.** Run one cycle by hand as the poller user:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` skips the guard that refuses a run coming too soon after the last one.
You want a clean finish with a summary line. Then leave the scheduler alone for two
intervals and confirm a second run happened without you.

## Step 8: change the default credentials

The shipped schema seeds an administrator account named `admin` with the password
`admin`, flagged so that the first login forces a change. It also seeds a disabled
guest account. Change the password before the instance is reachable by anyone else,
which means before you attach it to a network others can route to.

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
| 64-bit counters produce nonsense | `gmp` missing | `php -m` |
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
