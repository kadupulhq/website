---
title: Why this fork exists
description: Kadupul’s independent development priorities and migration goals.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 1
---

Kadupul is an independent fork of Cacti. It has its own development priorities,
release decisions and support channels.

## Development priorities

- Replace subsystems that repeatedly produce the same class of defect.
- Use a newer language baseline and maintained libraries.
- Change internal interfaces where needed to improve reliability and maintenance.

These are Kadupul's goals. They do not describe another project's plans or imply
an agreement with its maintainers.

## Compatibility and migration

It is also not a clean break from users. [Compatibility](/project/compatibility-with-cacti/)
is a commitment rather than a courtesy. Plugins, templates, and the RRD files
holding history you cannot regenerate are meant to keep working, and where they
stop working that gets written down.

Kadupul is not affiliated with or endorsed by The Cacti Group.
