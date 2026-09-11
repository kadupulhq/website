---
title: License
description: GPL-3.0-or-later, and the reasoning behind it.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Kadupul is distributed under **GPL-3.0-or-later**.

## Why version 3 is available

Cacti's source headers grant the program "either version 2 of the License, or (at
your option) any later version". That is GPL-2.0-or-later, and the headers are the
operative grant. Across the 442 core PHP files in Cacti's development branch, 420
carry that text verbatim, 21 carry no header, and one names no version at all. No
file in the tree is version 2 only.

Kadupul takes the later-version option.

## Why version 3 is the better choice

Cacti's `composer.json` declares `GPL-2.0-only`, which contradicts its own file
headers. It also conflicts with a dependency Cacti already ships,
`greew/oauth2-azure-provider`, which is GPL-3.0-or-later and cannot be combined with
version 2 only. Every other dependency is MIT or BSD-3-Clause, both compatible with
version 3.

Moving to version 3 resolves that conflict rather than creating one.

## Attribution

Upstream copyright notices stay as they are in every file carried over. Version 3
applies to the work as distributed by this project.
