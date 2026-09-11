---
title: Status
description: Where the project actually is, stated plainly.
sidebar:
  order: 4
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Kadupul has not shipped. There is no release and no installable artifact. The
source is available: the fork is taken from Cacti 1.2.31 with its full history,
and Cacti's later 1.2.x security fixes are backported on top.

Source available and supported release are different claims. Nothing here is
packaged, nothing is tested as a whole, and there is no upgrade path from an
existing Cacti install. Do not run it in production.

## What is decided

- The project forks Cacti.
- It is licensed GPL-3.0-or-later.
- It stays API compatible with Cacti for the foreseeable future.

## What is not decided

- **The fork point.** Cacti's current release is 1.2.32, and its development line is
  1.3.0. These are meaningfully different starting positions and the choice has not
  been made.
- **Release cadence**, governance, and how contributions will be handled.

## About these pages

This documentation is written from the Cacti source, which is GPL licensed, rather
than adapted from Cacti's documentation, which carries no license and therefore
grants no right to create derivative works. Anything here that is wrong is wrong on
its own merits.

Pages that describe behavior not yet implemented say so at the top.
