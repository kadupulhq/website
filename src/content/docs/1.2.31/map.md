---
title: Documentation map
description: Every page on this site, grouped by what it is for, so you can see
  the whole from anywhere in it.
sidebar:
  order: 0
slug: 1.2.31/map
---

Sixty-odd pages, grouped by what you are trying to do. The four groups are not
interchangeable: a reference page makes a poor tutorial, and a tutorial that lists
every option is impossible to follow.

## Start here

Read in order, once. Takes you from nothing to a graph you can read.

* [What Kadupul is](/1.2.31/start/what-kadupul-is/). A short, honest description of what the software does, what it does not do, and who it suits.
* [Install](/1.2.31/start/install/). What Kadupul needs to run, and the order to put it together in.
* [Add your first device](/1.2.31/start/first-device/). Get one device polling, and confirm the data is arriving before you build anything on top of it.
* [Read your first graph](/1.2.31/start/first-graph/). What the lines actually mean, and the three mistakes that make people misread them.

## How-to guides

Task pages for someone who already has it running and has a specific goal.

* [Migration](/1.2.31/guides/migration/). What carries over, what you should check, and what is not promised.
* [Monitor a switch](/1.2.31/guides/monitor-a-switch/). Discover a switch's ports, graph the right counters, and pick an index so port history stays attached to the port after a card reseat.
* [Monitor a Linux server](/1.2.31/guides/monitor-a-linux-server/). Graph CPU, memory, disk and load on a Linux host over net-snmp, what snmpd has to expose for it to work, and how to reach for a script when SNMP does not cover it.
* [Organize devices with trees](/1.2.31/guides/organize-devices-with-trees/). How to structure graph trees so navigation and permissions still work at a few thousand devices, and where to model site and location instead.
* [Troubleshoot missing data](/1.2.31/guides/troubleshoot-missing-data/). A step by step procedure for gaps and flat graphs, working from device reachability through poller scheduling, the poller cache, filesystem permissions and the heartbeat.
* [Scale the poller](/1.2.31/guides/scale-the-poller/). What to change when collection stops finishing inside its interval, and how to tell which limit you actually hit.
* [Back up and restore](/1.2.31/guides/back-up-and-restore/). Three things have to be captured together or the backup is not a backup, and the order they go back in matters.
* [Upgrade safely](/1.2.31/guides/upgrade-safely/). What an upgrade actually changes, which parts can be rolled back, and the one part that cannot.
* [Secure an internet-facing install](/1.2.31/guides/secure-an-internet-facing-install/). What to change before a monitoring system with shell access to your network answers requests from the public internet.
* [Write a data collection script](/1.2.31/guides/write-a-data-collection-script/). How to make the poller run your own program and store what it prints, and the contract that program has to honor.
* [Create custom templates](/1.2.31/guides/create-custom-templates/). How to build a data template and a graph template by hand, when to copy one instead, and what editing a template later does to graphs and files that already exist.
* [Manage users and permissions](/1.2.31/guides/manage-users-and-permissions/). How accounts, groups, and per-object permissions fit together, and how to build a read-only operator account that actually stays read-only.
* [Install and vet plugins](/1.2.31/guides/install-and-vet-plugins/). How plugins attach themselves to the application, what to read before you trust one, and why installing a plugin is equivalent to granting shell access.
* [Monitor a Windows host](/1.2.31/guides/monitor-a-windows-host/). Graph CPU, disks, interfaces and uptime on Windows over the SNMP service, which Host Resources objects carry the data, and what to do when SNMP is not an option.
* [Discover devices automatically](/1.2.31/guides/discover-devices-automatically/). Scan a network range, match found devices to a template, and let rules build the graphs and tree branches, with a dry run first so you find out what it would create before it creates it.
* [Build aggregate graphs](/1.2.31/guides/build-aggregate-graphs/). Combine many graphs into one, choose between a stacked view and a total, and keep the result honest when members are added and removed over time.
* [Tune graph appearance](/1.2.31/guides/tune-graph-appearance/). Axis scaling, units, colour and legend settings, and what to change when a graph is technically correct and still unreadable.
* [Import and export templates](/1.2.31/guides/import-and-export-templates/). What an export file actually contains, why a package is signed, and the ways an import quietly does less than you asked.
* [Remove spikes from data](/1.2.31/guides/remove-spikes-from-data/). How to take a false peak out of an archive so the rest of the graph is readable again, and why that edit cannot be undone.
* [Migrate to new hardware](/1.2.31/guides/migrate-to-new-hardware/). Moving a running install to another server without losing history, in the order that keeps each step verifiable.
* [Tune database performance](/1.2.31/guides/tune-database-performance/). Which tables grow, what the maintenance scripts actually do, and the server settings that decide whether a collection run finishes.
* [Send email notifications](/1.2.31/guides/send-email-notifications/). Configure outbound mail in Kadupul, test it, and understand which events actually generate a message without installing a plugin.
* [Monitor environmental sensors](/1.2.31/guides/monitor-environmental-sensors/). Graph temperature, humidity, airflow, power and UPS state over SNMP, find the right OIDs on a vendor MIB, and give the readings graph settings that suit a measurement rather than a counter.
* [Manage data retention](/1.2.31/guides/manage-data-retention/). Choose how long Kadupul keeps data and at what resolution, size the disk for it, and understand why the choice is fixed for the life of each file.
* [Recover a corrupted RRD](/1.2.31/guides/recover-a-corrupted-rrd/). How to tell a damaged round-robin archive from a misconfigured one, how to inspect a file, how dump and restore repairs it, and what history you can keep when the file has to be rebuilt.
* [Audit who can see what](/1.2.31/guides/audit-who-can-see-what/). A procedure for answering "what can this account see" and "who can see this device" with evidence, using the effective policy view rather than guessing from a tree.
* [Monitor a virtualization host](/1.2.31/guides/monitor-a-virtualization-host/). What a hypervisor exposes over SNMP, what ships for ESXi, and why counting guests, CPU and memory on a virtualized estate is harder than it looks.
* [A worked example, start to finish](/1.2.31/guides/worked-example/). One switch taken from an empty install to a graph you can trust, naming every decision along the way and what the alternative would have cost.
* [Monitor Kadupul itself](/1.2.31/guides/monitor-kadupul-itself/). Which numbers tell you the monitoring system is healthy, which of them Kadupul already records about itself, the thresholds worth watching, and what each symptom arrives before.
* [Capacity planning](/1.2.31/guides/capacity-planning/). Work out the disk, memory, poll window and database size an install needs from the number of devices and data sources it will carry, with the arithmetic shown so you can redo it for your own numbers.

## Concepts

Why the system works the way it does. Read for understanding, not to perform a task.

* [Architecture](/1.2.31/concepts/architecture/). The four moving parts, and which one is usually at fault.
* [Data sources and round-robin archives](/1.2.31/concepts/data-sources-and-rras/). What actually gets stored, and why the decisions you make at creation time are permanent.
* [Templates](/1.2.31/concepts/templates/). How one definition covers a hundred devices, and what happens when you change it.
* [How graphs are drawn](/1.2.31/concepts/how-graphs-are-drawn/). The path from a round-robin file to a rendered image, and why the same stored numbers can produce very different pictures.
* [Data queries and indexes](/1.2.31/concepts/data-queries-and-indexes/). How one walk of a device becomes many data sources, what an index really is, and what happens when a device renumbers itself.
* [The poller cache](/1.2.31/concepts/the-poller-cache/). Why the collector reads a precomputed work list instead of your configuration, and why that is the usual reason a change appears to do nothing.
* [Time and intervals](/1.2.31/concepts/time-and-intervals/). Polling interval, RRD step, heartbeat and clock skew, and why the timestamp on a sample decides more than people expect.
* [Permissions and access](/1.2.31/concepts/permissions-and-access/). Why access is split into two independent systems, why a permission is stored as a default plus exceptions, and why a tree looks different to every account.
* [Remote data collection](/1.2.31/concepts/remote-data-collection/). Why collection distributes and storage does not, what a remote collector owns, and what it costs to have a second copy of the configuration.
* [High volume writes](/1.2.31/concepts/high-volume-writes/). Why RRD updates are limited by write count rather than write size, what batching them buys, and what it costs in freshness.
* [Plugins](/1.2.31/concepts/plugins/). Why the extension surface is a list of named call-out points, what a plugin inherits by running inside the process, and what the guards around it do and do not stop.
* [Security model](/1.2.31/concepts/security-model/). Where untrusted data enters Kadupul, which process runs with which privilege, what the database account can do, and which boundaries the code enforces rather than assumes.

## Reference

Looked up, not read through. Precise and scannable.

* [Requirements](/1.2.31/reference/requirements/). Versions and extensions, stated precisely.
* [Command line tools](/1.2.31/reference/command-line-tools/). Every script in the cli directory, what it does, and the arguments the most useful ones accept.
* [Configuration](/1.2.31/reference/configuration/). Which settings live in the config file on disk and which live in the database, and what each group controls.
* [Poller lifecycle](/1.2.31/reference/poller-lifecycle/). What happens on a poller run, in order, from the scheduler invoking poller.php to values landing in RRD files.
* [Glossary](/1.2.31/reference/glossary/). Definitions of the domain terms that appear throughout Kadupul, in alphabetical order.
* [Database schema](/1.2.31/reference/database-schema/). The Kadupul tables that matter, what each one holds, and how data sources, templates, graphs and the poller cache join together.
* [Graph items](/1.2.31/reference/graph-items/). Every graph item type Kadupul can place on a graph, the consolidation functions, and the CDEF and VDEF vocabulary available when building them.
* [SNMP](/1.2.31/reference/snmp/). Which SNMP versions, authentication and privacy protocols Kadupul supports, the port, timeout, retry and OID-count settings, and how failures are reported.
* [Logging](/1.2.31/reference/logging/). Where the Kadupul log goes, what each verbosity level includes, how selective debug and rotation work, and why the poller output is not the log.
* [Data input methods](/1.2.31/reference/data-input-methods/). The six ways Kadupul collects a value, the input and output fields each one takes, and the output each one must return.
* [File layout](/1.2.31/reference/file-layout/). What lives in each Kadupul directory, which ones the poller writes to, which must never be served over HTTP, and which hold data worth backing up.
* [Realms and permissions](/1.2.31/reference/realms-and-permissions/). Every authorization realm in Kadupul, the page each one gates, and the object permissions and policy values that decide what a user can see.
* [RRDtool integration](/1.2.31/reference/rrdtool-integration/). Which RRDtool subcommands Kadupul issues, how each command line is assembled and validated, the difference between pipe and per-command execution, and what changes with the configured RRDtool version.
* [Data query XML](/1.2.31/reference/data-query-xml/). The elements of a data query resource file, the field attributes for SNMP and script queries, and how the parser reads them.
* [Spine, the C collector](/1.2.31/reference/spine/). What Spine is, how it differs from the PHP collector, the configuration it reads, its threading model, and when it is worth installing.
* [RRDtool proxy](/1.2.31/reference/rrdproxy/). How Kadupul writes RRD files that live on another machine, the verbs it sends over the wire, and what that changes about remote collection.
* [Plugin hook API](/1.2.31/reference/plugin-hook-api/). The files a plugin must ship, the functions it calls to register itself, the argument and return contract of the two dispatchers, and every hook name the source fires with where it fires and what it passes.
* [Symptom index](/1.2.31/reference/symptom-index/). A lookup table from what you observe to the page that explains it, so you can find the right documentation without knowing which part of the system is at fault.
* [Settings](/1.2.31/reference/settings/). Every setting Kadupul stores, grouped by the tab it appears under, with its type and its default.
* [Error and log messages](/1.2.31/reference/messages/). The error, warning and fatal strings Kadupul writes to its log, what each one means, and where to look next.

## Project

What this project is, where it stands, and the terms it is offered under.

* [Project goals](/project/goals/). The reason Kadupul is a separate project, stated without complaint about the one it came from.
* [Compatibility](/project/compatibility/). The scope of the API compatibility promise.
* [License](/project/license/). GPL-3.0-or-later, and the reasoning behind it.
* [Status](/project/status/). Where the project actually is, stated plainly.
* [Security policy](/project/security/). How to report a vulnerability, and how reports will be handled.
* [Contributing](/project/contributing/). What the project needs, the engineering standards a change is written to, and the standard it is judged by.
* [Questions](/project/faq/). Short answers to what newcomers and operators ask first, with a link to the page that answers each one properly.
