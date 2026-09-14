---
title: Coming from Cacti
description: What carries over, what you should check, and what is not promised.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
slug: 1.2.31/guides/coming-from-cacti
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Kadupul stays API compatible with Cacti for the foreseeable future. In practice that
is a promise about four surfaces.

| Surface | Intent |
|---|---|
| Plugin API | Plugins written for Cacti load and run |
| Templates | Device, graph, and data templates import unchanged |
| Database schema | Recognizable, and migratable without exporting to an interchange format |
| RRD files | Read in place, with no conversion step |

Your RRD files are the part worth caring about most. They hold history you cannot
regenerate. Any migration that asks you to discard and recreate them is asking for
something you should refuse.

## What to check before migrating

* **Your plugins.** Compatibility is the intent, but an untested plugin is an
  unverified claim. Check the ones you actually depend on.
* **Local modifications.** Anything you patched into your Cacti install by hand is
  yours to carry forward. Nobody else knows it exists.
* **Your poller.** If you run the C poller rather than the PHP one, confirm its
  status before you plan a cutover.

## What is not promised

Compatibility is not a commitment to stay identical forever. Where the two diverge,
the intent is that the divergence is documented rather than silent. A fork that
promised permanent identity would be pointless, and one that changed things quietly
would be worse.
