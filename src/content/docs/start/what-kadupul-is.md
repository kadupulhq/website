---
title: What Kadupul is
description: Collection, storage, architecture and project limits for 2026–2027 planning.
sidebar:
  order: 1
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

Kadupul is a network monitoring and graphing application. It collects measurements
through SNMP and scripts, stores time series in RRD files and renders graphs with
RRDtool. This overview was checked on 26 October 2026 against application revision
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Project status for 2026–2027

Kadupul is pre-alpha, with no supported production release or validated production
migration path. Use an isolated test installation. The dates in this documentation
are planning context, not delivery commitments. Check the [project status](/project/status/)
before choosing a revision to evaluate.

## Collection and scheduling

An external scheduler starts the poller. The poller reads a prepared collection
list, invokes the PHP collector or a compatible Spine build, and processes results.
Collection intervals are configurable; five minutes is an example, not a universal
rule. A launcher can run several shorter collection cycles within its interval.
Timeouts, retries and device latency all consume that time budget.
See [poller lifecycle](/reference/poller-lifecycle/).

## Retention and storage

An RRD file has a storage layout chosen at creation. Recent measurements can retain
more detail than older consolidated values; retention is bounded by the configured
archives. It does not preserve every sample forever. Unknown values represent
missing or unusable observations, not zero. Database queues, logs and statistics
can grow even when existing RRD files remain a fixed size.
See [data sources and archives](/concepts/data-sources-and-rras/).

## Graphs and shared terms

A device is a monitored endpoint. A data query discovers items such as interfaces.
A data source describes a measurement and its storage; a graph describes how to
render data. Templates reuse definitions, and trees organize navigation. These are
separate records: review deletion choices and dependencies before removing them.
Graphs are generated from retained data on request; image caching can reuse a
rendered result. See the [glossary](/reference/glossary/).

## Installation components

A working installation combines the PHP web application, MySQL or MariaDB, RRD
storage, RRDtool and a collection launcher. Device credentials and configuration
live in the database or protected configuration files. Back up code, configuration,
database queues and RRD history as a matched set, then rehearse restoration.
A database dump alone does not restore historical graphs.
See [backup and recovery](/guides/back-up-and-restore/).

## Main and the Symfony migration

Application `main` requires PHP 8.4 or newer and combines Symfony 7.4 services with
legacy web, poller and CLI entry points. The `lts/1.2` maintenance line has separate
requirements. Migrated routes coexist with legacy routes; a Symfony service does
not prove that its old workflow has been retired. Source checkouts need locked PHP
dependencies and generated browser assets. Use the application's `mise.toml` runtimes.
See the [migration guide](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md).

## Accounts, plugins and storage access

Device and graph visibility depend on user and group permissions. Plugins run as
trusted application code with the process account's access; they are not sandboxed.
Review their provenance, hooks and install/uninstall behavior before enabling them.
Local Unix RRD writers require POSIX identity checks and explicit trust settings
when web and poller accounts differ. Windows does not support destructive local
RRD maintenance. See [plugin evaluation](/guides/install-and-vet-plugins/).

## Suitable uses and limits

Evaluate Kadupul for network interfaces, device counters, environmental sensors and
other measurements available through collection methods you can validate. It is
self-hosted software that requires database, web and scheduler maintenance.
Core numerical polling is not a log store, distributed tracing system or general
high-cardinality label-query engine. Threshold alerting depends on suitable plugins;
verify their compatibility instead of assuming alerts work immediately after install.

## Origin, name and compatibility

Kadupul is an independent Cacti fork, licensed GPL-3.0-or-later, without affiliation
or endorsement from The Cacti Group. Its Sinhala name, කඩුපුල්, refers to
*Epiphyllum oxypetalum*, a night-flowering cactus. Preserving plugin interfaces,
templates, schemas and existing RRD history is a release goal that requires evidence
for each source revision and plugin combination. See
[compatibility](/project/compatibility-with-cacti/).

## Start with one verified device

Follow [installation](/start/install/), [first device](/start/first-device/) and
[first graph](/start/first-graph/) in order. Check logs, collection timestamps and
usable values before trusting the picture. Measure cycle duration and queued work
with your devices before expanding. Use [concepts](/concepts/architecture/) to
understand the design and [requirements](/reference/requirements/) for prerequisites.
