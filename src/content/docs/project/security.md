---
title: Security policy
description: How to report a vulnerability, and how reports will be handled.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 5
---

:::caution[No release to report against]
Kadupul has no release, so there is nothing deployed to find a vulnerability in.
This page states the intended process so it exists before it is needed.
:::

## Reporting

Report privately, through GitHub Security Advisories on the affected repository.
Do not open a public issue for a vulnerability.

A report is more useful with the affected version or commit, the conditions needed
to reach the code, and what an attacker gains. A proof of concept helps. An
unreproducible report is hard to act on and harder to prioritize.

## What gets embargoed and what does not

Not every security finding needs to be private, and treating them all the same
wastes time.

| Situation | Handling |
|---|---|
| Affects a released version | Private advisory until a fix is available |
| Pre-authentication, any released version | Private, and treated as the highest priority |
| Affects only the development branch, never released | Public issue, fixed in the open |
| Hardening with no exploitable path | Public issue |

A development branch is not a release. Nobody is running it in production, so
there is no embargo to protect and fixing it in public is faster.

## Credit

Reporters get credit in the advisory unless they ask not to. A reporter's own
write-up is theirs. Maintainer analysis gets appended as clearly labeled notes
rather than replacing what the reporter wrote.

## Inherited issues

Kadupul forks Cacti, so it inherits Cacti's code and any unfixed defects in it.
A vulnerability found in Kadupul that also affects Cacti will be reported to
The Cacti Group through their disclosure process as well. Forking is not a reason
to leave upstream users exposed.
