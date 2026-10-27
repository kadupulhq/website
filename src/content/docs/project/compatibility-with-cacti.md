---
title: Compatibility with Cacti
description: Compatibility scope, verification evidence and limits for 2026–2027 planning.
sidebar:
  order: 2
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Compatibility is a release goal, not a claim that every Cacti version, plugin or
template works unchanged. Kadupul remains pre-alpha. Evaluate the exact source
revision and the components you use before relying on the behavior.

## What that covers

Check plugin hooks, argument/return behavior and permissions; template identities,
input mappings and propagation; schema/default/reference semantics; and existing
RRD paths, fields, archives and retained values. A matching database profile does
not prove the RRD file has the same layout. Plugins run as trusted application code,
not in a sandbox. See [templates](/concepts/templates/) and
[plugin evaluation](/guides/install-and-vet-plugins/).

## What it means in practice

Record the application branch/revision, PHP and locked dependencies, plugin versions,
schema state and storage configuration. Test collection, graph rendering,
authorization, failures and recovery on an isolated restored copy. Include remote
collectors and background work when used. Document intentional differences and
remaining gaps; tests cover only the paths they exercise.
See [upgrade rehearsal](/guides/upgrade-safely/) and [backup](/guides/back-up-and-restore/).

## What it is not

There is no blanket binary, schema or plugin compatibility guarantee, no supported
production release and no validated production migration path. A code-only rollback
cannot undo schema or RRD changes; recovery may require the matched backup set.
Use the project's maintained sources and record provenance rather than assuming
another project's archives form a tested Kadupul bundle. Kadupul is not affiliated
with or endorsed by The Cacti Group. See [status](/project/status/).

Application baseline checked on 26 October 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
