---
title: Compatibility with Cacti
description: The scope of the API compatibility promise.
sidebar:
  order: 2
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Kadupul stays API compatible with Cacti for the foreseeable future.

## What that covers

Plugins, templates, the database schema, and RRD files on disk. Something written
against Cacti is meant to keep working, and history already recorded is meant to be
read in place rather than converted.

## What it means in practice

Where Kadupul and Cacti diverge, the divergence gets documented. The failure mode
worth avoiding is not divergence, which is the point of a fork. It is divergence
nobody wrote down, which turns every upgrade into an investigation.

## What it is not

It is not a promise of permanent identity, and it is not a claim of endorsement.

Kadupul is not affiliated with or endorsed by The Cacti Group. Cacti is their
project and their name. Kadupul describes itself as a fork of Cacti because that is
a factual statement about its origin, and for no other reason.
