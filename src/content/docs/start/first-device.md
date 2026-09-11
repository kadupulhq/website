---
title: Add your first device
description: Get one device polling, and confirm the data is arriving before you build anything on top of it.
sidebar:
  order: 3
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
---

Add one device, confirm it is answering, and only then move on. Most trouble with a
monitoring system traces back to a device that was never really answering in the
first place.

## Before you start

The device must be reachable and must answer SNMP. Confirm that from the machine
Kadupul runs on, not from your laptop. The two often have different firewall paths.

```bash
snmpget -v2c -c public switch.example.net sysDescr.0
```

If that returns a description string, continue. If it times out, fix that first.
No amount of configuration in the web interface will make an unreachable device
answer.

## Add it

1. Create the device with its hostname, SNMP version, and community or credentials.
2. Choose a device template that matches the hardware. The template decides which
   data queries and graphs are available.
3. Save, and read the status line. It reports the SNMP round trip and the system
   description read back from the device.

A device that saves cleanly but reports no system description is not being polled.
Treat that as a failure even though nothing showed an error.

## Confirm it is collecting

Give it two poller intervals, then check that the data source has a recent update
time. A graph drawn before any data exists is empty, which looks identical to a
graph of a device that is down. Waiting for the second interval removes that
ambiguity.

## Common first failures

| Symptom | Usual cause |
|---|---|
| Saves, but no system description | Wrong community string, or SNMP v3 credentials rejected |
| Description appears, no data | Poller not scheduled, or running as a user that cannot write the RRD directory |
| Data for a while, then gaps | Poller taking longer than its interval, or the device rate limiting SNMP |
| Counters that jump absurdly | 32-bit counter wrapping on a fast interface, use 64-bit counters |
