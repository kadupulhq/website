---
title: Install
description: What Kadupul needs to run, and the order to put it together in.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/start/install
---

:::caution[Nothing to install yet]
Kadupul has not shipped. This page records the shape of the install so the
requirements can be reviewed and argued with before there is code to match them.
:::

## What you need first

Kadupul is a PHP application that stores configuration in MySQL or MariaDB and
stores measurements in RRD files on disk. Four things have to exist before it runs.

| Component | Why it is needed |
|---|---|
| PHP 8.1 or newer | Runs the web interface and the poller |
| MySQL or MariaDB | Holds devices, templates, users, and the poller cache |
| RRDtool | Creates and updates the round-robin archives, and renders graphs |
| net-snmp | Provides the client tools and libraries used to query devices |

PHP also needs a set of extensions. The ones that matter most are `pdo_mysql` for
the database, `gd` for image work, `snmp` and `sockets` for collection, `gmp` for
large counter arithmetic, `intl` and `mbstring` for text handling, and `pcntl` and
`posix` so the poller can fork.

## The order to do it in

1. **Install the runtime.** PHP with its extensions, your database server, RRDtool,
   and net-snmp.
2. **Create the database and a user.** Give that user rights to one database only.
   Kadupul does not need and should not have rights to anything else.
3. **Load the schema.**
4. **Configure the connection.** Database host, name, user, and password.
5. **Point the web server at the directory.** Serve the application root. Keep the
   directories that hold logs, RRD files, and caches outside the document root, or
   deny them explicitly.
6. **Schedule the poller.** Once a minute, from cron or a systemd timer. The poller
   decides internally whether it is time to collect.
7. **Finish setup in the browser**, then change the default credentials before the
   instance is reachable by anyone else.

## Before you expose it

The poller runs as a system user and executes RRDtool and your collection scripts.
Treat the install as something that runs commands, because it is.

* Serve it over TLS.
* Do not leave the default administrator password in place, even briefly.
* Restrict the database user to its own database.
* Keep the RRD and log directories out of the document root.
