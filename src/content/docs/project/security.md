---
title: Security policy
description: How to report vulnerabilities privately.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 5
---

## Reporting

Report privately through
[GitHub Security Advisories](https://github.com/kadupulhq/kadupul/security/advisories/new).
Do not open a public issue or publish a fix before private triage.

Include the affected version or commit, configuration, reproduction steps, and
whether the issue is reachable before authentication.

## Handling

Maintainers assess exploitability and exposure before deciding when to publish.
Unreleased code can still be deployed, so an unreleased version does not make a
finding safe to disclose publicly. Ordinary hardening without an exploitable path
can be discussed publicly after triage.

If a finding affects other projects, maintainers coordinate private disclosure
with those projects. Reports may receive credit in an advisory with the reporter's
consent.

## Supported versions

There is no supported release yet. This policy applies to the available source.
