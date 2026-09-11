---
title: Contributing
description: What the project needs, and the standard a change is held to.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 5
---

:::caution[Not open yet]
There is no code to contribute to. Governance and review are not settled. This page
records the intended standard.
:::

## The standard

A change is judged on whether it works, whether it is verified, and whether it
matches the code around it.

**Verified means evidence.** A passing test that does not exercise the behavior you
changed is not evidence. For a bug fix, reproduce the failure first, then show the
same case passing.

**Match the surrounding code.** A file written in two styles is harder to read than
one written entirely in the worse style. Converting a pattern is its own change,
proposed separately, so a reviewer can accept or decline it without also rejecting
the fix it was bundled with.

**One purpose per change.** A fix fixes. A refactor refactors. Bundling them means
rejecting one rejects both.

## Documentation

Documentation changes are welcome and are held to one hard rule.

Source claims from the Kadupul or Cacti source code. Do not adapt Cacti's
documentation. It carries no license, which means all rights reserved, and copying
it into this project would create an infringing derivative work. Facts about how
software behaves are free to write down. Somebody else's prose describing those
facts is not.

## Compatibility

Kadupul stays API compatible with Cacti for the foreseeable future. A change that
breaks a plugin, a template, or an existing RRD file needs to say so plainly and
justify itself. Silent divergence is the failure mode worth avoiding.
