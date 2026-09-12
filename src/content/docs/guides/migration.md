---
title: Migration
description: What carries over, what you should check, and what is not promised.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

:::caution[Not yet possible]
Kadupul has not shipped, so there is no migration to perform. This page states the
intent so it can be held to it.
:::

This guide covers moving from Cacti to its fork, Kadupul.

Kadupul aims to preserve existing interfaces and data. In practice that
is a promise about four surfaces.

| Surface | Intent |
|---|---|
| Plugin API | Existing compatible plugins load and run |
| Templates | Device, graph, and data templates import unchanged |
| Database schema | Recognizable, and migratable without exporting to an interchange format |
| RRD files | Read in place, with no conversion step |

Your RRD files are the part worth caring about most. They hold history you cannot
regenerate. Any migration that asks you to discard and recreate them is asking for
something you should refuse.

## What to check before migrating

- **Your plugins.** Compatibility is the intent, but an untested plugin is an
  unverified claim. Check the ones you actually depend on.
- **Local modifications.** Anything you patched into your source installation by hand is
  yours to carry forward. Nobody else knows it exists.
- **Your poller.** If you run the C poller rather than the PHP one, confirm its
  status before you plan a cutover.

## What is not promised

Compatibility is not a commitment to stay identical forever. Where the two diverge,
the intent is that the divergence is documented rather than silent. A fork that
promised permanent identity would be pointless, and one that changed things quietly
would be worse.
