---
title: Coming from Cacti
description: What carries over, what you should check, and what is not promised.
sidebar:
  order: 1
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Kadupul aims to preserve compatibility with Cacti across four surfaces. These are goals,
not evidence that a particular migration works. There is currently no supported
production migration path; use an isolated rehearsal with the exact versions and
extensions you intend to carry forward.

| Surface | Intent |
|---|---|
| Plugin API | Plugins written for Cacti load and run |
| Templates | Device, graph, and data templates import unchanged |
| Database schema | Recognizable, and migratable without exporting to an interchange format |
| RRD files | Preserve recorded history; verify format portability and storage access |

Preserve the database, RRD files, configuration, plugins and local code as a
matched backup before testing. Native RRD files may require dump/restore when
moving between incompatible architectures; that conversion can preserve history.
It is different from creating empty replacement RRDs. See
[Back up and restore](/guides/back-up-and-restore/) and
[Migrate to new hardware](/guides/migrate-to-new-hardware/).

## What to check before migrating

- **Exact revisions and dependencies.** Record the source and target versions,
  runtimes, database version, plugins and template packages. Review
  [installation requirements](/reference/requirements/) and
  [upgrade procedures](/guides/upgrade-safely/); the existence of an upgrade
  script is not proof that your source version is supported.
- **Plugins and templates.** Test the operations you rely on, including imports,
  hooks and collection. A plugin loading or a template importing successfully is
  only part of that evidence. See [Plugin validation](/guides/install-and-vet-plugins/)
  and [Template import and export](/guides/import-and-export-templates/).
- **Local modifications.** Inventory patches, scripts and integrations before
  applying them to the target. Reconcile them against the new source and repeat
  the relevant tests.
- **Poller and storage.** Verify the selected collector, service-user permissions,
  RRD paths and queue behavior. The maintained Spine source/build status still
  needs confirmation; inherited compatibility does not establish support. See
  [Scale the poller](/guides/scale-the-poller/).
- **Cutover and rollback.** Stop competing writers for the final matched backup,
  validate restored history and fresh collection in isolation, and prepare a
  rollback that restores code, database and configuration together. Do not infer
  upgrade success from exit status alone: see the
  [reported upgrade CLI defect](https://github.com/kadupulhq/kadupul/issues/240).
  Record the completed checks and unresolved limitations before considering a
  cutover; a rehearsal does not create a supported production migration path.

## What is not promised

Compatibility is not a commitment to stay identical forever. Where the two diverge,
the intent is that the divergence is documented rather than silent. A fork that
promised permanent identity would be pointless, and one that changed things quietly
would be worse.
