---
title: Monitor environmental sensors
description: Graph temperature, humidity, airflow, power and UPS state over SNMP, find the right OIDs on a vendor MIB, and give the readings graph settings that suit a measurement rather than a counter.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 23
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Temperature, humidity and instantaneous power are measurements, usually stored as
`GAUGE`. Cumulative energy or event totals may require a counter type instead.
Check each object's units, identity and semantics before choosing a template.

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

**Script-server queries, bundled in the Net-SNMP device package.** Import
`install/templates/NetSNMP_Device.xml.gz` to deploy its three lmSensors query XML
files under `resource/script_server/`. The helper
`scripts/ss_netsnmp_lmsensors.php` also exists in the source checkout.

| Query | Table |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

The helper uses index, name and reading columns. The query indexes on numeric
`sensorDevice`; `sensorName` supplies a display name that the helper truncates to
18 characters. Names are not guaranteed unique sensor identities.

The normal `get sensorReading` path returns raw values: millidegrees for the legacy
temperature object, millivolts for voltage, and RPM for fans. The thermal graph
applies a `Divide by 1000` CDEF. The voltage graph has no CDEF despite its Volts
label, a [confirmed scaling bug](https://github.com/kadupulhq/kadupul/issues/247).

The separate `query sensorReading` path scales temperature and voltage, and attempts
signed voltage conversion using the incorrect constant 4294967294. It can also
[throw on unavailable readings](https://github.com/kadupulhq/kadupul/issues/248).
Do not infer stored units from this discovery output.

The helper still uses legacy temperature column `.2.1.3`. Current upstream
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
deprecates that unsigned object in favor of signed column `.2.1.4`; verify support
and negative-temperature behavior on the actual agent before adapting a template.

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

Inspect the matching package before writing a query by hand. Follow
[Import and export templates](/guides/import-and-export-templates/), verify file
deployment and discovery, then explicitly create the desired graphs. Package
presence does not prove device compatibility or correct scaling; the UPS and
lmSensors defects below need attention.

## The two shapes a sensor takes

For SNMP collection, distinguish scalar objects from indexed table instances.

**A fixed OID.** One scalar value at one address, the same address on every
device of that type. Battery temperature. Total output power. Use a fixed-OID
data source: an SNMP get against a literal OID, and one data source per reading.

**A table.** An unknown number of readings discovered per device. Rack probes,
outlet strips, per-phase measurements. Use a data query, which walks the table,
learns the index, and lets you pick which rows become graphs.

The shipped UPS package uses both. Follow the MIB's object structure: a device
with only one current probe may still expose it as an indexed table row.

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
template archive declares a 60-second step and 600-second heartbeat, a minimum of
zero, and no maximum, except temperature, which has no minimum. Check the imported
profile and actual RRD configuration; these declarations do not establish the
running poll cadence. A valid negative reading also needs a graph axis that shows it.

## Find the OIDs

Walk the device before you write anything. You are looking for three things: a
table of readings, a parallel table of labels, and whatever multiplier the
vendor chose, plus validity/status objects where available.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Replace the example host and community with configured values and run probes from
the poller. Load the matching MIB and dependencies to inspect names, units and
semantics; vendor object documentation can also explain numeric OIDs. A nearby
threshold or status code is not interchangeable with a measurement.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

The MIB definition is where the scaling is documented. A vendor that reports
tenths of a degree will say so in the object's description or units clause, and
in associated vendor documentation. Guessing from one reading can turn 23.5 degrees
into a graph of 235.

Standard MIBs cover more than people expect. UPS-MIB at `.1.3.6.1.2.1.33` is
generic across vendors. ENTITY-SENSOR-MIB gives a sensor value with its own
scale and precision fields alongside it. Check for those before reaching for an
enterprise subtree.

Compare discovery across representative reboots and probe changes in a test
installation. Two unchanged walks alone do not prove index stability. Record stable
sensor identities where available before creating long-lived graphs.

## Build a fixed-OID data source

A fixed-OID sensor needs a data template using the SNMP get data input, with the
OID as a literal value and one data source item in it. Set the type to `GAUGE`,
give the minimum a real value only when the sensor genuinely cannot go below it,
and leave the maximum undefined unless the vendor documents a ceiling.

Values outside RRD data-source bounds become unknown. Set those bounds in the
stored raw units, not the graph's converted units; otherwise valid readings can
be lost before a display CDEF is applied.

## Build a data query

A query needs an index OID, a way to turn each walked OID into an index, and one
field per column you want.

The UPS output query is a short worked example. It indexes on the line table,
parses the index off the end of each returned OID with a regular expression, and
declares one input field for the index and four output fields for voltage,
current, power and load. Output definitions include method, source, direction and
column OID. A column OID can be a valid index-walk root; matching the query's
parser and the actual returned OIDs is what matters. See [Data queries and indexes](/concepts/data-queries-and-indexes/) for how
the index is chosen and stored.

Pick a reindex method deliberately. The choices are none, on uptime going
backwards, on the index count changing, and Verify All Fields. Sensor tables
are the case where the weaker methods fail: unplug one probe from a rack unit and
plug in another, and the count may not change while every reading behind the
index now belongs to a different sensor. Full verification costs SNMP work on
each cycle. Verify which identity fields the query can check: unchanged numeric
indexes or duplicate/truncated labels cannot prove that a physical probe is the
same one. Refresh discovery and review graph associations after replacement.

## Scale the value

Decide where the conversion happens, and only put it in one place.

| Where | When to use it |
|---|---|
| In the collection script | Use a documented collector contract; lmSensors get currently returns raw units |
| In a CDEF on the graph item | The raw value is worth storing, and the display unit is a presentation choice |

A CDEF is the usual answer for a vendor multiplier. The shipped packages carry
definitions such as `Divide By 10`, built from the current data source, `10`, and
division. Apply them only to objects with the corresponding raw unit.

The UPS package has [incorrect power and time CDEFs](https://github.com/kadupulhq/kadupul/issues/249):
its On Battery series divides seconds by 6000 instead of 60, and input/output Watts
series divide watts by 10. For a conforming agent, 600 seconds should display as
10 minutes and 1000 watts as 1000 watts. Battery voltage and line current do require
division by 10; estimated runtime is already minutes. See
[RFC 1628's UPS object units](https://www.rfc-editor.org/rfc/rfc1628.html).

Storing the raw reading and dividing on the graph keeps the RRD file honest and
lets you correct a display multiplier without rewriting raw history, provided the
samples survived data-source bounds and retention. Collector-side conversion
changes the stored unit and may discard precision; document it. Unexplained raw
readings should not be presented as a verified engineering unit.

Do not apply the conversion twice. A CDEF on a graph whose script already scaled
the value can produce a plausible but incorrect reading.

## Give it graph settings that suit a measurement

Choose settings for the measurement instead of copying traffic defaults blindly.

| Setting | Traffic | Sensor |
|---|---|---|
| Data source type | `COUNTER` | `GAUGE` |
| Base value | 1000, so the axis reads in k and M | Still 1000, but the prefix is meaningless on degrees |
| Autoscale | Wanted, since the range is unknown | Usually unwanted, since the range is known |
| Upper and lower limit | Depend on autoscale mode | Choose a useful visible range |

Set an explicit upper and lower limit and a vertical label that names the real
unit. The shipped UPS temperature graph does this: a lower limit of 0, an upper
limit of 100, and `C` as the vertical label.

The autoscale option is a set of choices, not a switch. The one the shipped
temperature graph uses passes a lower limit with `--alt-autoscale-max`; it does
not pass the stored upper limit of 100. Without rigid boundaries, an out-of-range
reading can expand a passed limit. A configured limit is not automatically pinned. Pick the variant
that keeps the boundary you care about:

| Option | Effect |
|---|---|
| Autoscale ignoring limits | Both ends float. Use when you have no idea of the range |
| Autoscale accepting a lower limit | Passes the lower limit; maximum follows data |
| Autoscale accepting an upper limit | Passes the upper limit; minimum follows data |
| Autoscale with both limits | Passes both limits; expansion still depends on rigid mode |

There is also a rigid boundaries option that stops the axis expanding when a
value falls outside the limits you set. Turn it on when a fixed axis matters more
than seeing the excursion, and leave it off when it does not, because a rigid
graph can clip an excursion outside the displayed range. This does not delete the
stored sample. See the [RRDtool graph limits reference](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

For degrees or percent where SI prefixes would confuse readers, consider a units
exponent of 0. Base 1000 controls prefix steps; it does not itself disable prefixes
or convert measurement units.

### Consolidation matters more here than on traffic

An interface counter averaged over an hour still tells you roughly what happened.
A temperature averaged over an hour hides the ten minute excursion that mattered.
Make sure the storage profile behind these data sources keeps a `MAX` archive,
and configure the plotted series to read the appropriate `MAX` consolidation.
A legend maximum over an `AVERAGE` series does not recover the original peak.

Even a MAX archive only preserves peaks represented in collected samples; it
cannot recover an excursion between polls or values rejected before storage. See
[Manage data retention](/guides/manage-data-retention/) and
[Data sources and archives](/concepts/data-sources-and-rras/).

## When there is no MIB worth using

Plenty of environmental gear speaks Modbus, a serial protocol, or an HTTP API,
and its SNMP agent exposes nothing useful. Those need a script data input. The
script runs on the poller host, not on the device, and reaching the device is the
script's problem. See
[Write a data collection script](/guides/write-a-data-collection-script/) for the
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
| An excursion is invisible on a week view | Check the selected consolidation, retained resolution, poll interval and rejected samples |
| A query returns no indexes | Check returned OIDs, parser matches, access restrictions and object support; a column root can be valid |
| The lmSensors queries find nothing on a Linux host | Check agent support, access, exposed sensor rows and exact SNMP errors |
