---
title: Symptom index
description: A lookup table from what you observe to the page that explains it, so you can find the right documentation without knowing which part of the system is at fault.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 18
---

An index from observation to explanation. Find the row that matches what you can
see, read the cause, follow the link.

This page does not diagnose anything. It routes. The procedures live on the pages
it points at, and [Troubleshoot missing data](/guides/troubleshoot-missing-data/)
is the one to start from when more than one row looks like a match.

Rows are grouped by what you were looking at when you noticed, not by which
component is at fault. That is deliberate: you know the former and not the latter.

## Graphs

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Graph is blank, no error | Nothing collected yet, or no data source behind the graph | [Read your first graph](/start/first-graph/) |
| Graph is blank on a device that used to work | Collection stopped; the file is not being written | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| Graph has gaps | No value arrived within the heartbeat | [Time and intervals](/concepts/time-and-intervals/) |
| Narrow gaps scattered across many devices at once | Poller finishing late | [Scale the poller](/guides/scale-the-poller/) |
| Gaps only at high load | RRD maximum fixed from a stale discovered speed | [Monitor a switch](/guides/monitor-a-switch/) |
| Line ends a few minutes before now | The current interval is not complete | [Read your first graph](/start/first-graph/) |
| Line is flat at zero | The device is answering and reporting zero | [Read your first graph](/start/first-graph/) |
| Line is flat at a large, steady, implausible number | Counter stored as a gauge | [Data sources and archives](/concepts/data-sources-and-rras/) |
| Counter shows an impossible spike | 32-bit counter wrapping, or a device reboot | [Remove spikes from data](/guides/remove-spikes-from-data/) |
| Values an order of magnitude out | Wrong data source type, or 32-bit counters on a fast port | [Monitor a switch](/guides/monitor-a-switch/) |
| Peak visible at four hours, absent at one week | Consolidation into a coarser archive | [How graphs are drawn](/concepts/how-graphs-are-drawn/) |
| Peaks gone from every long window | The profile keeps averages only | [Manage data retention](/guides/manage-data-retention/) |
| Legend maximum lower than the drawn peak | The legend reduces the drawn series, not the stored samples | [Read your first graph](/start/first-graph/) |
| A legend number changed after an unrelated template edit | Legend items inherit the consolidation function above them | [How graphs are drawn](/concepts/how-graphs-are-drawn/) |
| A graph asks for maxima and gets averages, silently | The file has no archive of maxima; the nearest is used | [How graphs are drawn](/concepts/how-graphs-are-drawn/) |
| Two graphs of one link disagree by a few percent | Different axis base, or different consolidation | [Tune graph appearance](/guides/tune-graph-appearance/) |
| Stacked graph shows an outage as an idle period | The stack substitutes zero for unknown | [Read your first graph](/start/first-graph/) |
| Graph correct but unreadable | Scale, units, colour or legend settings | [Tune graph appearance](/guides/tune-graph-appearance/) |
| Aggregate graph total changes when members are added | The aggregate rebuilt over a different member set | [Build aggregate graphs](/guides/build-aggregate-graphs/) |
| Graph points at a data source you did not expect | Template reapplied, or the port reindexed | [Templates](/concepts/templates/) |

## Devices and collection

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Device shows unknown or down, data still arrives | Availability method fails while collection works | [Add your first device](/start/first-device/) |
| Device shows up, nothing collects | Availability set to none, or an empty community string | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| Device saves cleanly, no system description | Wrong credentials, or the agent restricts the subtree | [Add your first device](/start/first-device/) |
| `snmpget` works from your workstation, not from Kadupul | Different firewall path, or agent source restrictions | [SNMP](/reference/snmp/) |
| Device answers by hand, times out under the poller | Per-device timeout too short for the path | [SNMP](/reference/snmp/) |
| Data query returns no interfaces | Agent view excludes the table, or a reindex is due | [Data queries and indexes](/concepts/data-queries-and-indexes/) |
| Every sample unknown on a 64-bit traffic template | The high capacity counters are not populated | [Monitor a switch](/guides/monitor-a-switch/) |
| First sample unknown, then fine | Normal. A rate needs two readings | [Add your first device](/start/first-device/) |
| Port history attached to the wrong port after maintenance | The index resolved to `ifIndex` | [Data queries and indexes](/concepts/data-queries-and-indexes/) |
| A port's graph went flat after a card was pulled | The data source was orphaned by an empty index | [Monitor a switch](/guides/monitor-a-switch/) |
| Poller logs a warning about bad SNMP indexes | Active data sources with no index resolved | [Poller lifecycle](/reference/poller-lifecycle/) |
| A collection script works by hand and not under the poller | Output contract, environment, or the input whitelist | [Write a data collection script](/guides/write-a-data-collection-script/) |
| One field missing from a multi-value script | The whole timestamp is discarded, not the one field | [Data input methods](/reference/data-input-methods/) |
| Discovery found fewer devices than expected | Range, SNMP version or timeout in the discovery rule | [Discover devices automatically](/guides/discover-devices-automatically/) |

## The poller

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Poller takes longer than its interval | Collector CPU, device latency, or one oversized device | [Scale the poller](/guides/scale-the-poller/) |
| Log says processes were detected as overrunning | A previous run had not finished when the next started | [Scale the poller](/guides/scale-the-poller/) |
| Log says configured to run too often | The scheduler starts the poller faster than the interval allows | [Poller lifecycle](/reference/poller-lifecycle/) |
| Log says out of sync with the poller interval | The scheduler entry or the service, not the poller | [Poller lifecycle](/reference/poller-lifecycle/) |
| Log says the poller output table was not empty | Values arrived that could not be matched, or were incomplete | [Poller lifecycle](/reference/poller-lifecycle/) |
| Run time flat while one device is always late | A process is assigned whole devices and cannot split one | [Scale the poller](/guides/scale-the-poller/) |
| Missing samples on a rotating set of devices | Database connection limit reached | [Tune database performance](/guides/tune-database-performance/) |
| Thread count in the interface has no effect | The PHP collector forces threads to 1 | [Spine, the C collector](/reference/spine/) |
| Poller run duration climbing week over week | The estate outgrew the current concurrency | [Monitor Kadupul itself](/guides/monitor-kadupul-itself/) |
| No poller statistics line in the log at all | Nothing is scheduling the poller | [Logging](/reference/logging/) |

## Configuration that did not take

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Configuration change had no effect | The poller reads a precomputed work list, not your settings | [The poller cache](/concepts/the-poller-cache/) |
| New community string ignored | Same. Rebuild the work list | [The poller cache](/concepts/the-poller-cache/) |
| Corrected OID still polls the old one | Same | [The poller cache](/concepts/the-poller-cache/) |
| Retention profile edit changed nothing | Existing files keep the shape they were created with | [Manage data retention](/guides/manage-data-retention/) |
| Row count and aggregation level cannot be edited | The profile is in use by a data source | [Manage data retention](/guides/manage-data-retention/) |
| Interface shows one heartbeat, the file behaves as another | The profile changed and the files were never tuned | [Manage data retention](/guides/manage-data-retention/) |
| Template edit did not reach existing graphs | Not everything propagates, and device templates never do | [Templates](/concepts/templates/) |
| A setting changed on the settings page did not reach a collector | Collector process and thread counts are per collector | [Scale the poller](/guides/scale-the-poller/) |
| A remote collector is still running the old configuration | Replication is periodic | [Remote data collection](/concepts/remote-data-collection/) |
| Setting the server SQL mode changed nothing | The session mode is adjusted on connect | [Tune database performance](/guides/tune-database-performance/) |

## Users and access

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| User cannot see a device they should | No graph or tree permission grants it, and there is no deny to remove | [Permissions and access](/concepts/permissions-and-access/) |
| User can see a device they should not | A group grants it; access is a union | [Audit who can see what](/guides/audit-who-can-see-what/) |
| Tree looks different to two accounts | Trees are filtered per account | [Organize devices with trees](/guides/organize-devices-with-trees/) |
| Permission change landed later than expected | The permission set is cached | [Permissions and access](/concepts/permissions-and-access/) |
| A read-only account can still change things | A realm grants the page even when object permission does not | [Manage users and permissions](/guides/manage-users-and-permissions/) |
| Revoked access still works | Session or cache not invalidated yet | [Audit who can see what](/guides/audit-who-can-see-what/) |
| Cannot tell who can see a device | There is no single lookup; use the effective policy view | [Audit who can see what](/guides/audit-who-can-see-what/) |
| A page is missing from a user's menu | The realm that gates it is not granted | [Realms and permissions](/reference/realms-and-permissions/) |

## Files and storage

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| RRD file does not exist | Creation failure, changed path, or missing/deleted file | [Troubleshoot missing data](/guides/troubleshoot-missing-data/) |
| Gaps starting at the moment of a maintenance window | A file was created by the wrong user | [File layout](/reference/file-layout/) |
| File modification time is old but graphs are current | Deferred writes. The interface flushes before drawing | [High volume writes](/concepts/high-volume-writes/) |
| Disk grew four times faster than estimated | The estimate counted archives but not consolidation functions | [Manage data retention](/guides/manage-data-retention/) |
| Disk filling and no obvious data growth | Log volume, or archive tables left by a failed flush | [Monitor Kadupul itself](/guides/monitor-kadupul-itself/) |
| RRDtool reports a file as damaged | Truncation, a partial write, or a filesystem event | [Recover a corrupted RRD](/guides/recover-a-corrupted-rrd/) |
| Updates rejected as older than the last one | Two writers, or a clock that stepped backwards | [Time and intervals](/concepts/time-and-intervals/) |
| A restored backup has data in the database and not in the files | The two were captured at different moments | [Back up and restore](/guides/back-up-and-restore/) |
| Not sure how much disk the next thousand devices need | Derive it from the profile and the data source count | [Capacity planning](/guides/capacity-planning/) |

## Database and interface performance

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Interface slow on pages that list things | Stale index statistics | [Tune database performance](/guides/tune-database-performance/) |
| Everything slow including the interface | Buffer pool too small for the working set | [Tune database performance](/guides/tune-database-performance/) |
| Graphs slow on the hour | A bulk flush competing with graph reads | [Tune database performance](/guides/tune-database-performance/) |
| Collector inserts failing under load | Memory table size limit reached | [Tune database performance](/guides/tune-database-performance/) |
| A collection pass that took 30 seconds now takes minutes | Lock waits being retried rather than failing | [Tune database performance](/guides/tune-database-performance/) |
| A bulk flush lost a batch | A statement over the server packet limit is not retried | [Tune database performance](/guides/tune-database-performance/) |
| The deferred write buffer never returns to empty | The flush cannot keep up with the insert rate | [Monitor Kadupul itself](/guides/monitor-kadupul-itself/) |
| Database growing steadily with a fixed device count | Per-period statistics, or an unpurged runtime table | [Monitor Kadupul itself](/guides/monitor-kadupul-itself/) |

## Templates, imports and plugins

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| An import created less than the file contained | An import option suppressed part of it | [Import and export templates](/guides/import-and-export-templates/) |
| An export is missing the data it graphed | Exports carry definitions, not measurements | [Import and export templates](/guides/import-and-export-templates/) |
| A package refuses to install | Signature or version check | [Import and export templates](/guides/import-and-export-templates/) |
| A plugin broke a page it does not own | Plugins run inside the process with full access | [Plugins](/concepts/plugins/) |
| A disabled plugin still affects behaviour | Disabled is not the same as absent | [Install and vet plugins](/guides/install-and-vet-plugins/) |
| A custom template collects nothing | The data template and the data input do not agree on fields | [Create custom templates](/guides/create-custom-templates/) |

## Install, upgrade and migration

| Symptom | Most common cause | Where it is explained |
|---|---|---|
| Schema audit refuses to run | The code version and the database version disagree | [Tune database performance](/guides/tune-database-performance/) |
| Something worked before the upgrade and not after | A changed default, or a template that was replaced | [Upgrade safely](/guides/upgrade-safely/) |
| History missing after moving to a new server | The RRD tree was not moved, or was moved as the wrong user | [Migrate to new hardware](/guides/migrate-to-new-hardware/) |
| Install checks fail on PHP extensions or versions | Missing extension, or a version below the floor | [Requirements](/reference/requirements/) |
| No mail arrives for any event | Outbound mail not configured, or nothing generates that event | [Send email notifications](/guides/send-email-notifications/) |
| Public install receiving unauthenticated requests | Endpoints that answer before authentication are reachable | [Secure an internet-facing install](/guides/secure-an-internet-facing-install/) |

## When no row matches

Four pages answer "what is this thing" rather than "why is it broken".

- [Glossary](/reference/glossary/) for a term you do not recognise.
- [Settings](/reference/settings/) for a setting name, its type and its default.
- [Architecture](/concepts/architecture/) for which part owns the behaviour.
- [Documentation map](/map/) for the whole set, grouped by purpose.
