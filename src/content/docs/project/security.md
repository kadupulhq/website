---
title: Security policy
description: How to report a vulnerability, and how reports will be handled.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 5
---

Report vulnerabilities privately, including findings against unreleased source.
Development code can be deployed, and inherited defects may affect other projects.

The repository's [security policy](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md)
is the source of truth for this process.

## Reporting

Use [GitHub private vulnerability reporting](https://github.com/kadupulhq/kadupul/security/advisories/new)
for the application. Do not open a public issue or publish a fix before private
triage. Include the affected version or commit, reproduction steps, required
configuration, and whether authentication is needed to reach the issue.

Maintainers aim to acknowledge reports within three working days. This is an
acknowledgement target, not a promised fix date.

## What gets embargoed and what does not

Report privately first. Maintainers assess exploitability and deployment exposure
before deciding how to publish a fix. An unreleased branch is not automatically
safe to discuss publicly.

For shared-code vulnerabilities, maintainers contact affected projects through
private security channels before publishing an advisory or fix and agree on a
coordinated disclosure timeline. Include related private reports when available.

## Credit

Discuss attribution and publication timing during private triage. Follow the
repository policy and the agreed disclosure timeline.

## Inherited issues

Inherited vulnerabilities belong in the same private reporting process. Kadupul
maintainers own remediation for Kadupul and coordinate with other affected
maintainers.

## Scope

The policy covers the application, poller, installer and repository packaging.
It excludes third-party plugins, RRDtool, Net-SNMP, the web server, database, and
issues that require an administrator to act against their own installation.
There is no supported release yet; reports against source are welcome.
