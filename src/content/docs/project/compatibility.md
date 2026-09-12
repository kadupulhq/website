---
title: Compatibility
description: Plugin, template, database, and RRD compatibility goals.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Kadupul aims to preserve existing plugin APIs, template formats, database
interfaces, and RRD data. These are compatibility goals pending release validation.

## What to check

Test the plugins and templates you use against the intended release. Confirm that
graphs, collection scripts, and recorded data work before a cutover. Keep a backup
and a rollback path.

Compatibility limits and interface changes must be documented with each release.
See [Migration](/guides/migration/) and [Status](/project/status/).
