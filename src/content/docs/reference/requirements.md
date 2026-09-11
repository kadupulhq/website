---
title: Requirements
description: Versions and extensions, stated precisely.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Inherited from Cacti 1.2.x and subject to change once Kadupul picks its fork point.

## Runtime

| Component | Requirement |
|---|---|
| PHP | 8.1 or newer |
| Database | MySQL or MariaDB |
| Graphing | RRDtool |
| Collection | net-snmp |

## PHP extensions

Cacti 1.2.x declares these in its manifest. Kadupul inherits the list.

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`,
`openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`

A few are easy to overlook and fail in ways that do not name themselves clearly:

- `gmp` is used for large counter arithmetic. Without it, 64-bit counters misbehave.
- `pcntl` and `posix` let the poller fork. Without them it cannot run concurrently.
- `sqlite3` is required even though the main database is MySQL.

## On the PHP version

PHP 8.1 is the floor because that is what the Cacti 1.2.x manifest declares. It is
not a recommendation. 8.1 reached end of security support in December 2025, so run
a supported release and treat the floor as the oldest thing that works, not the
right thing to deploy.
