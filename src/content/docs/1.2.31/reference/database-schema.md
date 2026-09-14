---
title: Database schema
description: The Kadupul tables that matter, what each one holds, and how data
  sources, templates, graphs and the poller cache join together.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 6
slug: 1.2.31/reference/database-schema
---

Kadupul inherits the Cacti 1.2.x schema: 113 tables in `cacti.sql`. Most of them
are leaf tables for one feature. This page covers the ones you need to read or
join against, grouped by what they belong to.

Everything is InnoDB with `ROW_FORMAT=Dynamic` except eight `MEMORY` tables:
`automation_ips`, `automation_processes`, `data_source_stats_hourly_cache`,
`data_source_stats_hourly_last`, `poller_output`,
`poller_output_boost_local_data_ids`, `poller_output_boost_processes` and
`processes`. Their contents do not survive a database restart.

## Three conventions that run through the schema

Learn these once and most tables read themselves.

| Convention | Meaning |
|---|---|
| `local_*_id` | A pointer from an instance row back to the template row it was created from. `0` means the row is itself a template, or is not templated. |
| `t_<column>` | Per-instance override flag for `<column>`. When `t_<column>` is empty the column is still templated and a template push overwrites it. When it is set, the instance owns that value. |
| `hash` | A 32-character identity used by template export and import to match an incoming template against one already installed. |

The same table therefore holds both templates and instances. `data_template_data`
with `local_data_id = 0` is a data template definition; the same table with
`local_data_id = 41` is data source 41. `graph_templates_graph` and
`graph_templates_item` work the same way with `local_graph_id`.

## Devices and collection

| Table | Purpose |
|---|---|
| `host` | One row per device. Address, SNMP credentials, ping settings, availability method, and the up/down status counters the poller maintains. |
| `host_template` | Named device template. `class` groups templates in the interface. |
| `host_template_graph` | Graph templates attached to a device template. |
| `host_template_snmp_query` | Data queries attached to a device template. |
| `host_graph` | Graph templates attached to one device. |
| `host_snmp_query` | Data queries attached to one device, with the sort field, title format, and reindex method. |
| `host_snmp_cache` | Result of running a data query against a device: one row per device, query, field name and index. This is the index cache graphs are built from. |
| `sites` | Physical site a device belongs to, with address and coordinates. |
| `poller` | Data collectors. Holds each remote collector's database connection details and its last run statistics. |

`host.status` is maintained by the poller, not by a foreign key. `status_fail_date`,
`status_rec_date`, `status_event_count` and `status_last_error` are the audit
trail behind a device showing as down.

## Data queries

| Table | Purpose |
|---|---|
| `snmp_query` | A data query. `xml_path` points at the XML file that defines the walk; `data_input_id` names the input method that runs it. |
| `snmp_query_graph` | A query type inside a data query, bound to one graph template. |
| `snmp_query_graph_rrd` | Maps a query output field name to a data template item for that query type. |
| `snmp_query_graph_sv` | Suggested value patterns for graph fields on a query type. |
| `snmp_query_graph_rrd_sv` | Suggested value patterns for data source fields on a query type. |

## Data input methods

| Table | Purpose |
|---|---|
| `data_input` | An input method. `type_id` picks SNMP Get, SNMP Query, Script/Command, Script Query, Script Server or Script Server Query; `input_string` is the command line for script types. |
| `data_input_fields` | Input and output fields of a method. `input_output` is `in` or `out`; `update_rra` marks an output field as one that is written to the RRD file. |
| `data_input_data` | The value bound to one input field for one `data_template_data` row. This is where a data source's arguments actually live. |

## Templates

| Table | Purpose |
|---|---|
| `graph_templates` | Graph template name and hash. |
| `graph_templates_graph` | Graph-level properties: title, height, width, limits, scaling, axis and legend options. Template row when `local_graph_id = 0`, graph row otherwise. |
| `graph_templates_item` | One row per graph item, ordered by `sequence`. Holds the item type, colour, CDEF, VDEF, consolidation function and text. |
| `graph_template_input` | A named input that ties several graph items to one editable field. `column_name` is the `graph_templates_item` column the input edits. |
| `graph_template_input_defs` | Which graph template items belong to which input. |
| `graph_templates_gprint` | Named GPRINT format presets, referenced by `graph_templates_item.gprint_id`. |
| `data_template` | Data template name and hash. |
| `data_template_data` | Data source properties: name, RRD step, data source profile, input method, and the `data_source_path` of the RRD file. |
| `data_template_rrd` | One row per data source item, meaning one DS inside the RRD file. Holds the DS name, type, heartbeat, minimum and maximum, and the input field it is fed by. |

## Graphs and trees

| Table | Purpose |
|---|---|
| `graph_local` | One row per graph. `id` is the `local_graph_id` used everywhere else. Records the graph template, device, data query and index it came from. |
| `graph_tree` | A tree. |
| `graph_tree_items` | Nodes in a tree. Self-referential through `parent` and ordered by `position`. A node is a header, a device, or a graph depending on which of `title`, `host_id`, `local_graph_id` is set. |
| `aggregate_graphs` | An aggregate graph and the graph template it aggregates. |
| `aggregate_graphs_items` | Member graphs of an aggregate. |
| `aggregate_graphs_graph_item` | Per-item overrides on an aggregate graph. |
| `aggregate_graph_templates` | Aggregate template definitions, with `aggregate_graph_templates_graph` and `aggregate_graph_templates_item` holding their graph and item rows. |

## Data sources

| Table | Purpose |
|---|---|
| `data_local` | One row per data source. `id` is the `local_data_id`. Records the data template, device, data query and SNMP index. |
| `data_source_profiles` | Step, heartbeat and x-files-factor applied to new RRD files. |
| `data_source_profiles_rra` | RRA definitions for a profile: steps, rows and timespan. |
| `data_source_profiles_cf` | Consolidation functions a profile creates RRAs for. |
| `poller_data_template_field_mappings` | Cache of which data source names belong to which data template field. |
| `data_source_stats_hourly` | Rolling hourly average and peak per data source item, with `_daily`, `_weekly`, `_monthly` and `_yearly` siblings. |
| `data_source_stats_hourly_cache` | Timestamped raw samples feeding the hourly rollup. `MEMORY`. |
| `data_source_stats_hourly_last` | Last raw and last calculated value per data source item. `MEMORY`. |
| `data_source_purge_temp` | RRD files found on disk during a purge scan, with `in_cacti` marking whether the database still knows about them. |
| `data_source_purge_action` | Queued delete or archive action for a scanned file. |
| `rrdcheck` | Findings from the RRD file consistency check. |
| `data_debug` | Captured output of the data source debugger. |

## Poller runtime

| Table | Purpose |
|---|---|
| `poller_item` | The poller cache. One row per thing to collect, with the device's SNMP credentials denormalised into it so the collector needs no join. |
| `poller_output` | Values handed back by the collector, drained into RRD files and deleted. `MEMORY`. |
| `poller_output_realtime` | The same for realtime graphing, kept on disk because it is read back by the web tier. |
| `poller_reindex` | One row per reindex assertion. The collector evaluates `op` against `assert_value` each cycle and triggers a data query rerun when it fails. |
| `poller_time` | Start and end timestamp per collector process, one row per PID per run. |
| `poller_command` | Queued commands for a collector, keyed by collector, action and command. |
| `poller_resource_cache` | Files replicated out to remote collectors, with their md5sum and contents. |
| `processes` | Registered background processes so an administrator can see what is running. `MEMORY`. |
| `poller_output_boost` | Values held back by boost until the next RRD write window. |
| `poller_output_boost_local_data_ids` | Work queue of data sources a boost child has claimed. `MEMORY`. |
| `poller_output_boost_processes` | Boost child process registry. `MEMORY`. |

## Presets

| Table | Purpose |
|---|---|
| `cdef` | A named CDEF. `system` marks the built-in ones. |
| `cdef_items` | The CDEF's RPN tokens in `sequence` order. `type` says whether `value` is a function, an operator, a special data source, another CDEF, or a literal string. |
| `vdef` | A named VDEF. |
| `vdef_items` | The VDEF's tokens, same shape as `cdef_items`. |
| `colors` | The colour palette. `hex` is unique; `read_only` marks the built-in entries. |
| `color_templates` | A named colour template, with its ordered entries in `color_template_items`. |

## Users and permissions

| Table | Purpose |
|---|---|
| `user_auth` | Accounts. Holds the password hash, realm, the four `policy_*` defaults, lockout counters and password history. |
| `user_auth_perms` | Per-user grant on one object. `type` selects graph, tree, device or graph template. |
| `user_auth_realm` | Per-user grant on a permission realm, meaning a section of the interface. |
| `user_auth_group` | Groups, carrying the same `policy_*` and display defaults as a user. |
| `user_auth_group_members` | Group membership. |
| `user_auth_group_perms` | Per-group object grants. |
| `user_auth_group_realm` | Per-group realm grants. |
| `user_auth_cache` | Remember-me tokens, one per user per hostname. |
| `user_auth_row_cache` | Cached row counts per user for permission-filtered lists. |
| `user_domains` | Login domains and their type, with `user_domains_ldap` holding the LDAP server, bind mode and search settings for each. |
| `user_log` | Login attempts, with result and source address. |
| `sessions` | Database-backed PHP sessions. |
| `settings` | System settings, one name and value per row. |
| `settings_user` | Per-user setting overrides. |
| `settings_user_group` | Per-group setting defaults. |
| `settings_tree` | Per-user expanded and collapsed state of tree nodes. |

`user_auth.policy_graphs`, `policy_trees`, `policy_hosts` and
`policy_graph_templates` decide whether the matching `user_auth_perms` rows are
a deny list or an allow list. Reading the perms table without the policy gives
the wrong answer.

## Plugins

| Table | Purpose |
|---|---|
| `plugin_config` | Installed plugins: directory, version, author, and `status` for installed, enabled or disabled. |
| `plugin_hooks` | Hook registrations. One row per hook name with the file and function to call. |
| `plugin_realms` | Permission realms a plugin adds, and the files each realm covers. |
| `plugin_db_changes` | Schema changes a plugin made, so uninstalling can reverse them. |

## Automation

| Table | Purpose |
|---|---|
| `automation_networks` | Subnet definitions to scan, with schedule and SNMP option set. |
| `automation_ips` | Addresses within a scanned network. `MEMORY`. |
| `automation_devices` | Devices found by a scan, before they are added. |
| `automation_snmp` | A named group of SNMP option sets, with `automation_snmp_items` holding the individual credential sets tried in order. |
| `automation_templates` | Match rules that map a discovered device's SNMP system variables onto a device template. |
| `automation_graph_rules` | Rules that create graphs on a matching device, with `automation_graph_rule_items` holding the graph items. |
| `automation_tree_rules` | Rules that place a matching device on a tree, with `automation_tree_rule_items` holding the placement items. |
| `automation_match_rule_items` | Shared match expressions used by the graph and tree rules. |
| `automation_processes` | Active discovery processes. `MEMORY`. |

## SNMP agent

| Table | Purpose |
|---|---|
| `snmpagent_mibs` | Registered MIB files. |
| `snmpagent_cache` | Parsed OID to name, type and access mapping from those MIBs. |
| `snmpagent_cache_notifications` | Notification definitions and their attributes. |
| `snmpagent_cache_textual_conventions` | Textual conventions from the MIBs. |
| `snmpagent_managers` | Notification receivers. |
| `snmpagent_managers_notifications` | Which notifications go to which receiver. |
| `snmpagent_notifications_log` | Notifications sent. |

## Reporting and miscellany

| Table | Purpose |
|---|---|
| `reports` | A scheduled report: recipients, format, interval and graph layout. |
| `reports_items` | Report contents. `item_type` selects a graph, a tree branch, or free text. |
| `external_links` | Links and embedded pages added to the navigation. |
| `version` | The schema version, one row. |

## The relationship people actually need

Four tables carry the whole collection path. Getting the joins right matters
more than anything else on this page.

### local\_data\_id

`data_local.id` is the `local_data_id`. It is the identity of a data source and
the join key for almost everything downstream.

```sql
CREATE TABLE data_local (
  id               int(10) unsigned NOT NULL auto_increment,
  data_template_id mediumint(8) unsigned NOT NULL default '0',
  host_id          mediumint(8) unsigned NOT NULL default '0',
  snmp_query_id    mediumint(8) NOT NULL default '0',
  snmp_index       varchar(255) NOT NULL default '',
  orphan           tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY (id)
);
```

`data_local` holds no names and no settings. It is the anchor row saying "this
data source exists, it came from this template, it belongs to this device, and
within its data query it is this index."

### data\_template\_data

One row per data source, plus one row per data template. The discriminator is
`local_data_id`.

| `local_data_id` | `data_template_id` | What the row is |
|---|---|---|
| `0` | non-zero | The data template definition. |
| non-zero | non-zero | A data source created from that template. |
| non-zero | `0` | A data source with no template. |

`local_data_template_data_id` on an instance row points at the `id` of the
template row it was created from. That is the pointer a template push follows.

The columns worth knowing:

| Column | Holds |
|---|---|
| `name` | The name pattern, with `\|host_description\|` style variables unresolved. |
| `name_cache` | The same name with variables resolved. Search on this one. |
| `data_source_path` | Path to the RRD file. |
| `rrd_step` | Polling interval in seconds. |
| `data_source_profile_id` | Which profile supplied the RRAs when the file was created. |
| `active` | `on` when the data source is polled. |
| `data_input_id` | The input method that collects it. |

Arguments to the input method live in `data_input_data`, keyed by
`data_template_data_id` and `data_input_field_id`. Nothing else stores them.

### data\_template\_rrd

One row per data source item, which is one DS inside the RRD file. A data source
with three DS names has three rows.

```sql
SELECT dtr.data_source_name, dtr.data_source_type_id, dtr.rrd_heartbeat
FROM data_template_rrd AS dtr
WHERE dtr.local_data_id = ?;
```

`UNIQUE KEY duplicate_dsname_contraint (local_data_id, data_source_name,
data_template_id)` is what stops two items in one data source claiming the same
DS name.

Graph items point here, not at `data_local`. `graph_templates_item.task_item_id`
is a `data_template_rrd.id`. To go from a graph to the data sources it reads:

```sql
SELECT DISTINCT dtr.local_data_id
FROM graph_templates_item AS gti
INNER JOIN data_template_rrd AS dtr
ON gti.task_item_id = dtr.id
WHERE gti.local_graph_id = ?
AND dtr.local_data_id > 0;
```

The `dtr.local_data_id > 0` test is not optional. Without it you also collect the
template rows.

### poller\_item

The poller cache. Generated from the three tables above, never edited by hand,
and rebuilt by `rebuild_poller_cache.php`.

```sql
PRIMARY KEY (local_data_id, rrd_name)
```

Device credentials are copied into each row so the collector reads one table and
makes no joins. That is also why changing a device's SNMP settings requires a
cache rebuild before the change takes effect.

| Column | Holds |
|---|---|
| `action` | `0` SNMP, `1` script or command, `2` script server. |
| `arg1` | The OID for SNMP actions, the full command line for script actions. |
| `rrd_name` | The DS name this row feeds. |
| `rrd_num` | How many rows exist for this data source. |
| `rrd_path` | The RRD file to write. |
| `rrd_step` / `rrd_next_step` | Polling interval and the countdown to the next collection. |
| `present` | Set to `0` at the start of a rebuild and back to `1` as rows are regenerated; rows still at `0` afterwards are deleted. |

How many rows a data source gets depends on its input type:

| Input type | Rows in `poller_item` |
|---|---|
| SNMP Get | One, with `rrd_name` set. |
| SNMP Query, Script Query, Script Server Query | One per output field, each with its own `rrd_name` and `arg1`. |
| Script/Command, Script Server, single output field | One, with `rrd_name` set. |
| Script/Command, Script Server, several output fields | One, with `rrd_name` empty. The script returns `name:value` pairs and the parser splits them. |

That last case surprises people writing queries: a data source can be polled and
have no `poller_item` row bearing its DS name.

### poller\_output

The return path. The collector inserts `(local_data_id, rrd_name, time,
output)`; `poller.php` reads it, writes the values into RRD files, and deletes
the rows. Rows left behind are a sign the drain did not finish.

```sql
SELECT po.local_data_id, po.rrd_name, po.output, po.time
FROM poller_output AS po
INNER JOIN poller_item AS pi
ON pi.local_data_id = po.local_data_id
AND pi.rrd_name = po.rrd_name;
```

`poller_output` is a `MEMORY` table. It does not survive a database restart, and
anything in it at that moment is lost.

### Putting it together

Every data source on one device, with its file path and its poller cache rows:

```sql
SELECT dl.id AS local_data_id,
       dtd.name_cache,
       dtd.data_source_path,
       dtd.rrd_step,
       pi.rrd_name,
       pi.action
FROM data_local AS dl
INNER JOIN data_template_data AS dtd
ON dtd.local_data_id = dl.id
LEFT JOIN poller_item AS pi
ON pi.local_data_id = dl.id
WHERE dl.host_id = ?
ORDER BY dtd.name_cache, pi.rrd_name;
```

A `NULL` in `pi.rrd_name` means the data source exists but is not being polled:
either `dtd.active` is not `on`, the device is disabled, or the poller cache is
stale.
