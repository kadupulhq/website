---
title: Monitor environmental sensors
description: Graph temperature, humidity, airflow, power and UPS state over
  SNMP, find the right OIDs on a vendor MIB, and give the readings graph
  settings that suit a measurement rather than a counter.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 23
slug: 1.2.31/guides/monitor-environmental-sensors
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Sensor readings are measurements, not counters. Everything that makes them
awkward follows from that: the scaling is arbitrary, the index is unstable, and
a graph tuned for traffic will draw them badly.

Check what already ships before you write anything.

## What ships

Only four data query definitions live in the tree's own query directory, and
none of them is environmental.

| Shipped SNMP query | Covers |
|---|---|
| `interface.xml` | Network interfaces |
| `host_disk.xml` | Host Resources storage |
| `net-snmp_disk.xml` | UCD declared partitions |
| `net-snmp_devio.xml` | UCD block device I/O |

Sensor coverage arrives two other ways.

**Script server queries, shipped in the tree.** Three definitions read the
net-snmp lmSensors tables through a bundled PHP script.

| Query | Table |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Each table has the same three columns: index, name, reading. The script walks
them and returns the sensor name as the index label.

Two conversions happen inside that script, not in a graph. Temperature and
voltage readings are divided by 1000, because the MIB reports milli-units. Fan
readings are not scaled, because they are already RPM. Voltage also gets a
signed correction: a reading above 2147483647 has 4294967296 subtracted from it,
which recovers a negative rail from an unsigned SNMP integer.

If you build your own query against those same tables, you own both conversions.

**Device packages, shipped as importable archives.** Several carry their own
query XML and write it into the query directories at import time. The ones that
matter here:

| Package | Brings |
|---|---|
| SNMP UPS | UPS-MIB input and output line queries, plus fixed-OID templates for battery, runtime, temperature and alarms |
| AKCP Device | Script queries for temperature, humidity, airflow and 4-20 mA sensors |
| APC InfraStruXure PDU | Queries for breaker and phase statistics |
| APC InfraStruXure InRow CRAC | Queries for unit and group statistics, including temperatures, humidity, airflow and fan speed |
| BayTech PDU | An outlet query and a three-phase circuit query, with current, voltage, power and temperature |

Import the matching package before you write a query by hand. The work is
already done, and the package also carries the scaling definitions its graphs
need.

## The two shapes a sensor takes

Every sensor is one of two things, and the choice determines the whole build.

**A fixed OID.** One scalar value at one address, the same address on every
device of that type. Battery temperature. Total output power. Use a fixed-OID
data source: an SNMP get against a literal OID, and one data source per reading.

**A table.** An unknown number of readings discovered per device. Rack probes,
outlet strips, per-phase measurements. Use a data query, which walks the table,
learns the index, and lets you pick which rows become graphs.

The shipped UPS package uses both, and it is worth copying that split. Things
there is exactly one of are fixed OIDs. Things there are several of are queries.

| UPS reading | Shape | OID |
|---|---|---|
| Battery temperature | Fixed | `.1.3.6.1.2.1.33.1.2.7.0` |
| Estimated runtime remaining | Fixed | `.1.3.6.1.2.1.33.1.2.3.0` |
| Time on battery | Fixed | `.1.3.6.1.2.1.33.1.2.2.0` |
| Battery voltage | Fixed | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarms present | Fixed | `.1.3.6.1.2.1.33.1.6.1.0` |
| Input voltage, current, power, frequency | Query | `.1.3.6.1.2.1.33.1.3.3.1` |
| Output voltage, current, power, load | Query | `.1.3.6.1.2.1.33.1.4.4.1` |

Every one of those data sources is a `GAUGE`. None is a counter. The shipped
templates give them a 60 second step with a 600 second heartbeat, a minimum of
zero, and no maximum, except temperature, which has no minimum either because a
sensor can legitimately read below zero.

## Find the OIDs

Walk the device before you write anything. You are looking for three things: a
table of readings, a parallel table of labels, and whatever multiplier the
vendor chose.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
snmpwalk -v2c -c public probe.example.net .1.3.6.1.4.1.<vendor>
```

Load the vendor MIB so the walk returns names rather than numbers. It is the
only practical way to tell a reading apart from a threshold or a status code
sitting next to it in the same table.

```bash
snmptranslate -Td -OS .1.3.6.1.2.1.33.1.2.7
```

The MIB definition is where the scaling is documented. A vendor that reports
tenths of a degree will say so in the object's description or units clause, and
nowhere else. Guessing from a single reading is how a probe at 23.5 degrees ends
up graphed as 235.

Standard MIBs cover more than people expect. UPS-MIB at `.1.3.6.1.2.1.33` is
generic across vendors. ENTITY-SENSOR-MIB gives a sensor value with its own
scale and precision fields alongside it. Check for those before reaching for an
enterprise subtree.

Walk the device twice, some hours apart, before you commit to a table. If the
index moved, you have a reindex problem to solve now rather than after you have
built forty graphs.

## Build a fixed-OID data source

A fixed-OID sensor needs a data template using the SNMP get data input, with the
OID as a literal value and one data source item in it. Set the type to `GAUGE`,
give the minimum a real value only when the sensor genuinely cannot go below it,
and leave the maximum undefined unless the vendor documents a ceiling.

A wrong maximum is silent. Readings above it are stored as unknown, and the
graph shows a gap where the interesting event was.

## Build a data query

A query needs an index OID, a way to turn each walked OID into an index, and one
field per column you want.

The UPS output query is a short worked example. It indexes on the line table,
parses the index off the end of each returned OID with a regular expression, and
declares one input field for the index and four output fields for voltage,
current, power and load. Each output field names the column OID and nothing
else. See [Data queries and indexes](/1.2.31/concepts/data-queries-and-indexes/) for how
the index is chosen and stored.

Pick a reindex method deliberately. The choices are none, on uptime going
backwards, on the index count changing, and verifying every field. Sensor tables
are the case where the weaker methods fail: unplug one probe from a rack unit and
plug in another, and the count may not change while every reading behind the
index now belongs to a different sensor. Full verification costs SNMP work on
every cycle. For a probe with a handful of sensors, pay it.

## Scale the value

Decide where the conversion happens, and only put it in one place.

| Where | When to use it |
|---|---|
| In the collection script | The raw unit is never wanted. The lmSensors script divides by 1000 here |
| In a CDEF on the graph item | The raw value is worth storing, and the display unit is a presentation choice |

A CDEF is the usual answer for a vendor multiplier. The shipped packages carry
exactly this: a `Divide By 10` definition built from three items, the current
data source, the string `10`, and the division operator. The PDU and CRAC
packages add a `Divide By 100` alongside it. The UPS package adds one that turns
timeticks into minutes by dividing by 6000.

Storing the raw reading and dividing on the graph keeps the RRD file honest and
lets you fix a wrong multiplier later without losing history. Scaling before
storage is permanent. If you are unsure which the vendor meant, store raw.

Do not apply the conversion twice. A CDEF on a graph whose script already scaled
the value is the most common wrong sensor graph, and it looks plausible.

## Give it graph settings that suit a measurement

The defaults on a traffic graph template are wrong for a sensor in four ways.

| Setting | Traffic | Sensor |
|---|---|---|
| Data source type | `COUNTER` | `GAUGE` |
| Base value | 1000, so the axis reads in k and M | Still 1000, but the prefix is meaningless on degrees |
| Autoscale | Wanted, since the range is unknown | Usually unwanted, since the range is known |
| Upper and lower limit | Ignored | The whole point |

Set an explicit upper and lower limit and a vertical label that names the real
unit. The shipped UPS temperature graph does this: a lower limit of 0, an upper
limit of 100, and `C` as the vertical label.

The autoscale option is a set of choices, not a switch. The one the shipped
temperature graph uses scales to the maximum while honouring the lower limit, so
the floor stays pinned at zero and the ceiling follows the data. Pick the variant
that keeps the boundary you care about:

| Option | Effect |
|---|---|
| Autoscale ignoring limits | Both ends float. Use when you have no idea of the range |
| Autoscale accepting a lower limit | Floor pinned, ceiling floats. The usual choice for temperature |
| Autoscale accepting an upper limit | Ceiling pinned, floor floats |
| Autoscale with both limits | Both honoured |

There is also a rigid boundaries option that stops the axis expanding when a
value falls outside the limits you set. Turn it on when a fixed axis matters more
than seeing the excursion, and leave it off when it does not, because a rigid
graph draws an out-of-range reading as nothing at all.

Leave the unit exponent alone unless you know you want it. Forcing everything
onto one prefix is useful for a rate and confusing for a humidity reading.

### Consolidation matters more here than on traffic

An interface counter averaged over an hour still tells you roughly what happened.
A temperature averaged over an hour hides the ten minute excursion that mattered.
Make sure the storage profile behind these data sources keeps a `MAX` archive,
and read the graph's maximum rather than its average.

The peak cannot be recovered later if it was never written. See
[Manage data retention](/1.2.31/guides/manage-data-retention/) and
[Data sources and archives](/1.2.31/concepts/data-sources-and-rras/).

## When there is no MIB worth using

Plenty of environmental gear speaks Modbus, a serial protocol, or an HTTP API,
and its SNMP agent exposes nothing useful. Those need a script data input. The
script runs on the poller host, not on the device, and reaching the device is the
script's problem. See
[Write a data collection script](/1.2.31/guides/write-a-data-collection-script/) for the
output contract.

Return `U` rather than `0` when a sensor is unreachable. A probe that went offline
is not a probe reading zero degrees.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Temperature graphed as a number ten or a hundred times too large | Vendor multiplier not divided out |
| Temperature graphed ten times too small | Divided twice, once in the script and once in a CDEF |
| A voltage rail reads as billions | An unsigned SNMP integer holding a negative value, uncorrected |
| Sensor graphs go flat after a probe is swapped | The table reindexed and the data source now points at a different sensor |
| Readings above a threshold appear as gaps | A maximum was set on the data source and real values exceed it |
| Axis labelled in k or M on a degree reading | Base value and unit settings inherited from a traffic template |
| An excursion is invisible on a week view | Only `AVERAGE` archives are kept |
| A query returns no indexes | The index OID is a column, not the table, or the index parse expression matches nothing |
| The lmSensors queries find nothing on a Linux host | The agent has no lmSensors support compiled or enabled |
