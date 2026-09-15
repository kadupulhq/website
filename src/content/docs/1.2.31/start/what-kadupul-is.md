---
title: What Kadupul is
description: A short, honest description of what the software does, what it does
  not do, and who it suits.
sidebar:
  order: 1
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
slug: 1.2.31/start/what-kadupul-is
---

Kadupul asks your network devices how they are doing, at a fixed interval, forever.
It keeps the answers, and it draws them as graphs.

That is the whole idea. A switch reports how many bytes crossed a port. A server
reports its load average. Kadupul records those numbers every five minutes and
keeps years of them in a fixed amount of disk. When somebody asks why the link was
slow last Tuesday, the answer is already recorded.

These four pages are a tutorial. Read them in order, once. They take you from
nothing to a graph you can defend in a meeting. Everything you might want to look
up afterwards lives in [Concepts](/1.2.31/concepts/architecture/) and
[Reference](/1.2.31/reference/requirements/).

## What it does

* **Polls.** Reads values from devices over SNMP, or by running a script you supply.
* **Stores.** Writes each value into a round-robin archive, which holds recent data
  at full detail and older data at decreasing detail, in a file that never grows.
* **Graphs.** Renders those archives as time-series images you can read at a glance.
* **Organizes.** Groups devices into trees, applies templates so a hundred switches
  are configured once, and controls who can see what.

The loop never changes. A scheduler starts the poller, the poller reads a cached
list of things to collect, collectors talk to devices, and the values land in RRD
files. Graphs are drawn on demand from those files, not stored in advance. If you
want that loop in detail, it is in [Poller lifecycle](/1.2.31/reference/poller-lifecycle/).

## The shape of a working install

Four parts, on one machine to begin with.

| Part | What it holds | What breaks if it is wrong |
|---|---|---|
| Web application | The interface, and the installer | Nobody can configure or view anything |
| Database | Devices, templates, users, and the poller cache | The poller has nothing to collect |
| RRD files on disk | Measurements consolidated within the configured retention windows | Graphs are empty, and the history is gone |
| Scheduler | Starts the poller on time | Data stops, silently |

A healthy installation is quiet in a specific way. The poller finishes inside its
interval. Every enabled device reports up. Graphs run to within one interval of
now, with no gaps. The log records the end of each run and little else.

Measure cycle duration with your devices, latency, scripts and hardware.
A five minute collection interval needs enough headroom to finish before the
next cycle, including timeouts and retries.

Disk use is close to flat. An RRD file is allocated at creation and does not grow
afterwards, so your storage plan is decided the day you choose a data source
profile, not gradually over three years. Database growth also depends on logs, queued samples, statistics and plugins.
Monitor those tables as well as configuration. Adding a hundred devices adds disk in a predictable lump.

## The words you will meet

Six terms carry most of the system. You will meet all of them on the next three
pages, so it is worth fixing them now.

| Term | What it is |
|---|---|
| Device | One thing being polled, with an address and SNMP credentials |
| Data query | A walk of a table on a device, producing one row per interface, disk, or sensor |
| Data source | One thing being measured over time, and the RRD file that holds it |
| Graph | A drawing instruction, run against RRD files when somebody asks for the image |
| Template | A pattern applied to many devices, data sources, or graphs at once |
| Tree | The navigable hierarchy you put devices and graphs into |

A device is not a data source, and a data source is not a graph. That separation is
the reason one graph can draw five devices, and the reason deleting a graph does
not delete the history behind it. The full list is in the
[Glossary](/1.2.31/reference/glossary/).

## What it does not do

Being clear about this saves you time.

* It is not a log system. It records numbers over time, not events or text.
* It is not an alerting system on its own. Thresholds and notification come from
  plugins, the same way they do in Cacti.
* It is not agentless in the modern sense. Something on the device has to answer,
  usually an SNMP daemon.
* It does not do distributed tracing, APM, or anything that assumes you control the
  application code.
* It does not handle high cardinality. There is no label or tag dimension you can
  slice after the fact. One measurement is one file, decided in advance.
* It does not accept pushed metrics as its normal mode. Kadupul asks; the device
  answers.

The permanent decisions are worth knowing before you start, because they cannot be
undone later. The step, the data source type, and the set of archives are written
into an RRD file when it is created. If you keep only averages, you can never ask
about peaks afterwards, because the peaks were never written down.
[Data sources and round-robin archives](/1.2.31/concepts/data-sources-and-rras/) covers
what to choose and why.

## Who it suits

| You | Kadupul |
|---|---|
| Run switches, routers, firewalls, UPS units, sensors | Fits. This is the case it was built for. |
| Need interface counters going back three years | Fits. Fixed disk, no retention bill. |
| Must keep the data on hardware you control | Fits. It is a PHP application and some files. |
| Instrument your own services with labels and tags | Look elsewhere. High cardinality is the wrong shape here. |
| Want alerting to work the moment you install it | Partly. Plan on a plugin. |
| Want a hosted product with no maintenance | Look elsewhere. You will be running cron, a database, and a web server. |

Kadupul suits you if you run network gear, you need years of interface counters,
and you would rather own the data than rent it. It suits you less if you are
instrumenting your own microservices, where a metrics system built for high
cardinality will serve you better.

## The name

Kadupul (කඩුපුල්) is the Sinhala name for *Epiphyllum oxypetalum*, a cactus that
flowers at night. The bloom opens after dark and wilts before dawn, which is why the
same plant is also called queen of the night.

It being a cactus is the point. Cacti takes its name from the plant family. Kadupul
is one species inside that family, so the name says where the project came from
without claiming to stand in for the whole of it.

The mark places a four-point metric trace at the center of the bloom.

## Its relationship to Cacti

Kadupul is a fork of Cacti. It keeps Cacti's data
model, its plugin interface, and its templates. If you know Cacti, you already know
Kadupul. See [Compatibility with Cacti](/project/compatibility-with-cacti/) for what
that promise covers and where it stops.

Kadupul is not affiliated with or endorsed by The Cacti Group.

## Where to go after these four pages

The documentation is split by what you are trying to do, not by subsystem.

| Section | Use it when |
|---|---|
| [Start here](/1.2.31/start/install/) | You are doing this for the first time. Read in order. |
| [How-to guides](/1.2.31/guides/monitor-a-switch/) | You have a specific job: add a Windows host, build a tree, remove a spike. |
| [Concepts](/1.2.31/concepts/architecture/) | Something behaved oddly and you want to know why it is designed that way. |
| [Reference](/1.2.31/reference/requirements/) | You need an exact name, default, or argument. |
| [Project](/project/status/) | You want to know where the fork stands and what it promises. |

Three concept pages repay reading early, before you have a hundred devices and a
decision you cannot reverse: [Data sources and round-robin
archives](/1.2.31/concepts/data-sources-and-rras/), [Templates](/1.2.31/concepts/templates/), and
[Time and intervals](/1.2.31/concepts/time-and-intervals/).

Next: [Install](/1.2.31/start/install/).
