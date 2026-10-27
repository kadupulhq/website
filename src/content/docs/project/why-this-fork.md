---
title: Why this fork exists
description: Independent development priorities and migration acceptance criteria for 2026–2027.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 1
---

Kadupul is an independent Cacti fork with its own development, release and support
decisions. The following priorities guide 2026–2027 planning; they are not release
dates or evidence of production readiness.

## Development priorities

Application `main` requires PHP 8.4+ and combines Symfony 7.4 services with legacy
web, poller and CLI paths. The `lts/1.2` maintenance line has separate requirements.
Migration aims to make use-case boundaries, authorization, failure handling and
verification explicit while retaining required collection and graphing contracts.
A modern service or a passing test suite does not prove a whole workflow is migrated.
See [architecture](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md).

## Compatibility and migration

Preserving plugins, templates, schemas and RRD history is a release goal that needs
version-specific evidence. Each migration must identify its active write path,
preserve applicable maintenance fixes and account for queued or in-flight work.
Rehearse installation, recovery and any schema changes on an isolated copy with
matched backups. There is no validated production migration path today.
See [compatibility](/project/compatibility-with-cacti/) and [status](/project/status/).

These priorities describe Kadupul, not another project's plans or an agreement
with its maintainers. Kadupul is not affiliated with or endorsed by The Cacti Group.

Application baseline checked on 26 October 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
