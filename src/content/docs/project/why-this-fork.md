---
title: Why this fork exists
description: The reason Kadupul is a separate project, stated without complaint about the one it came from.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 1
---

Kadupul forks Cacti in order to make changes Cacti would reasonably decline.

Cacti is more than twenty years old and runs in places where an upgrade is a
scheduled event with a change window. A project in that position is right to be
careful. Keeping a low language floor, preserving interfaces people built against,
and weighing every structural change against the installed base are the correct
instincts for that software and those users.

Kadupul takes the other side of the same trade. The work it exists to do is
structural rather than incremental:

- Replacing subsystems that have produced the same class of defect repeatedly,
  instead of fixing each instance as it is found.
- Moving to a newer language floor, and using maintained libraries for work the
  codebase currently does by hand.
- Changing internal shapes where the current shape is the reason a category of bug
  keeps coming back.

Every one of those is a reasonable thing for a mature project to turn down. None
of this says otherwise. They are simply easier to attempt somewhere with no
installed base to protect and no release promises to keep.

## What this is not

This is not a disagreement with Cacti's maintainers, and it is not an attempt to
replace Cacti. Kadupul does not send patches upstream. The licence moved to
GPL-3.0-or-later, which makes that a one-way door, and a fix written against a
changed internal shape would not apply to Cacti anyway. Security is the
exception in one direction only: a vulnerability that also affects stock Cacti
is reported to Cacti privately, because that protects every Cacti install rather
than only this fork.

It is also not a clean break from users. [Compatibility](/project/compatibility-with-cacti/)
is a commitment rather than a courtesy. Plugins, templates, and the RRD files
holding history you cannot regenerate are meant to keep working, and where they
stop working that gets written down.

Kadupul is not affiliated with or endorsed by The Cacti Group.
