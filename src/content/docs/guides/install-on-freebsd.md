---
title: Install on FreeBSD
description: Prepare FreeBSD services, PHP extensions and local storage for an isolated Kadupul evaluation.
banner:
  content: Kadupul is pre-alpha. This platform procedure has not been validated end to end.
---

## Select and prepare the host

Use a release listed in [FreeBSD's supported-release table](https://www.freebsd.org/security/)
and plan its upgrades through 2027. OS support does not prove Kadupul compatibility.
Install PHP 8.4+, MySQL or MariaDB, RRDtool, Net-SNMP and a web server using the
[Packages and Ports handbook](https://docs.freebsd.org/en/books/handbook/ports/).
The `php84-extensions` defaults are not the full application extension list;
install missing modules, including `pcntl` for CLI, before dependency installation.

## Check runtime and configure services

Check the selected CLI interpreter and tools:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Check web PHP separately. For packaged PHP-FPM, configure its pool and web-server
upstream before enabling the `php_fpm` service. FreeBSD uses rc services, not systemd;
follow the [service handbook](https://docs.freebsd.org/en/books/handbook/config/).
Follow [installation](/start/install/) for the database, configuration, schema and
browser assets. Match tool versions to the application's `mise.toml`; those pins
are not evidence that mise's runtime installers work on FreeBSD.

## Schedule and verify as service accounts

Use one cron launcher with absolute executable paths and the configured interval;
do not install the Linux systemd unit. Validate POSIX identity, directory locking,
ownership and explicit UID/GID trust as each web/poller account before collection.
For jails, verify networking, mounts and required permissions inside the jail.
Run one non-overlapping cycle, inspect retained queue rows and graph timestamps,
then rehearse matched backup restoration. A successful process start is insufficient.
See [requirements](/reference/requirements/) and [backup](/guides/back-up-and-restore/).

Application baseline checked on 26 October 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
