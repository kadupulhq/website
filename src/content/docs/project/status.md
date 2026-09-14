---
title: Status
description: Where the project actually is, stated plainly.
sidebar:
  order: 4
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Kadupul is pre-alpha. The source is available, but there is no supported release
or validated production migration path. Do not run it in production.

This page was checked against the repository on 14 September 2026.

## What is decided

- The application derives from Cacti 1.2.31. The `lts/1.2` branch takes fixes and
  hardening; the development line is `main`.
- The versioning policy names `v1.3.0` as the first planned application release
  with the rename and new features, and `v1.2.32` as the LTS version on `lts/1.2`.
  A version named in that policy is not proof of a published release.
- Kadupul will maintain a Spine fork. Its source location and validated builds
  still need to be published in the component documentation.
- Kadupul is licensed GPL-3.0-or-later.
- Preserving plugin interfaces, templates, database compatibility and RRD data
  is a release goal. Compatibility needs evidence for each migration.
- Builds, downloads and support use Kadupul's own maintained sources. Inherited
  compatibility names do not identify supported download locations.

The repository includes automated tests, packaging code and migration assessment
tooling. Their presence does not establish that installation, migration and all
plugins have been validated together.

## What is not decided

There is no published support commitment for a production release. Do not infer
release dates or compatibility guarantees from the planned version numbers.
Follow the repository's contribution process for proposed changes.

## About these pages

The guides describe inherited and current implementation behavior. They are not
proof of a supported deployment. The `1.2.31` documentation is an archived snapshot,
not a Kadupul release artifact.

Use the repository's [README](https://github.com/kadupulhq/kadupul/blob/main/README.md),
[versioning policy](https://github.com/kadupulhq/kadupul/blob/main/VERSIONING.md),
[release list](https://github.com/kadupulhq/kadupul/releases), and
[security policy](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md)
for current project commitments.
