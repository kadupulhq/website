---
title: What Kadupul is
description: A short, honest description of what the software does, what it does not do, and who it suits.
sidebar:
  order: 1
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Kadupul asks your network devices how they are doing, at a fixed interval, forever.
It keeps the answers, and it draws them as graphs.

That is the whole idea. A switch reports how many bytes crossed a port. A server
reports its load average. Kadupul records those numbers every five minutes and
keeps years of them in a fixed amount of disk. When somebody asks why the link was
slow last Tuesday, the answer is already recorded.

## What it does

- **Polls.** Reads values from devices over SNMP, or by running a script you supply.
- **Stores.** Writes each value into a round-robin archive, which holds recent data
  at full detail and older data at decreasing detail, in a file that never grows.
- **Graphs.** Renders those archives as time-series images you can read at a glance.
- **Organizes.** Groups devices into trees, applies templates so a hundred switches
  are configured once, and controls who can see what.

## What it does not do

Being clear about this saves you time.

- It is not a log system. It records numbers over time, not events or text.
- It is not an alerting system on its own. Thresholds and notification come from
  plugins, the same way they do in Cacti.
- It is not agentless in the modern sense. Something on the device has to answer,
  usually an SNMP daemon.
- It does not do distributed tracing, APM, or anything that assumes you control the
  application code.

## Who it suits

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

Kadupul is a fork of [Cacti](https://github.com/Cacti/cacti). It keeps Cacti's data
model, its plugin interface, and its templates. If you know Cacti, you already know
Kadupul. See [Compatibility with Cacti](/project/compatibility-with-cacti/) for what
that promise covers and where it stops.

Kadupul is not affiliated with or endorsed by The Cacti Group.
