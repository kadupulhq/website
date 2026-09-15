---
title: Command line tools
description: Every script in the cli directory, what it does, and the arguments the most useful ones accept.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 2
---

Kadupul inherits the Cacti 1.2.x `cli/` directory: 45 scripts plus an `index.php`
that redirects to the site root. They exist for work the web interface handles
badly: bulk changes, scheduled maintenance, and recovery when the interface itself
is the broken thing.

## Conventions

All scripts are run with the PHP CLI binary. They refuse to run under a web server
SAPI and return HTTP 404 if reached over the web.

```
php -q /path/to/kadupul/cli/add_device.php --description="core-sw-1" --ip=10.0.0.1
```

| Convention | Detail |
|---|---|
| Help | `--help`, `-H`, `-h` |
| Version | `--version`, `-V`, `-v` |
| Argument form | `--name=value`, one argument per token |
| Exit | Non-zero on argument or validation failure |

Two habits worth keeping. Run these as the user the poller runs as; a script run as
root can leave files the poller cannot write, and that shows up later as gaps in
graphs with no obvious cause. Read what a script does before pointing it at
production, because several change data in bulk with no confirmation step.

## Devices, graphs, and trees

| Script | Purpose |
|---|---|
| `add_device.php` | Create a device from a device template, with SNMP and availability settings. |
| `change_device.php` | Change attributes on one device, a comma-separated list of devices, or every device listed in a CSV file. |
| `remove_device.php` | Delete devices matched by description, IP, or id list. |
| `add_datasource.php` | Attach a data template to a device as a new data source. |
| `add_data_query.php` | Associate a data query with a device and set its reindex method. Reindexes if already associated. |
| `add_graph_template.php` | Associate a graph template with a device. |
| `add_graphs.php` | Create graphs, either graph template (`cg`) graphs or data query (`ds`) graphs. |
| `remove_graphs.php` | Remove graphs selected by graph template, device template, device, or name regex. |
| `add_tree.php` | Create a tree, or add a header, site, device, or graph node to an existing tree. |
| `host_update_template.php` | Reapply the current device template to one device or to all devices. |

## Users and permissions

| Script | Purpose |
|---|---|
| `add_perms.php` | Grant a user access to a graph, tree, device, or graph template. |
| `copy_user.php` | Copy a local user and their settings to a new username. Local accounts only. |

## Poller and cache maintenance

| Script | Purpose |
|---|---|
| `rebuild_poller_cache.php` | Repopulate the poller cache for all devices or a selected subset, in parallel threads. |
| `push_out_hosts.php` | Deprecated. Logs a warning and re-executes `rebuild_poller_cache.php` with the same arguments. |
| `poller_reindex_hosts.php` | Force a data query reindex for a device or for all devices. |
| `reorder_data_query.php` | Re-order data queries for a device or for the whole system. |
| `poller_data_sources_reapply_names.php` | Recalculate data source names for the selected data templates. |
| `poller_graphs_reapply_names.php` | Reapply graph naming rules to existing graphs in bulk. |
| `poller_output_empty.php` | Deprecated. Drains the `poller_output` table into RRD files until it is empty. |
| `poller_replicate.php` | Synchronize remote data collectors, in whole or by data class. |

## Installation and upgrade

| Script | Purpose |
|---|---|
| `install_cacti.php` | Unattended install or upgrade, driven by flags or by an INI or JSON settings file. |
| `upgrade_database.php` | Command line equivalent of the web database upgrade, with an option to force a starting version. |

## Database maintenance

| Script | Purpose |
|---|---|
| `analyze_database.php` | Recalculate the cardinality of indexes in the database. |
| `audit_database.php` | Scan the schema against a reference and report or repair what differs. |
| `repair_database.php` | Repair tables and template corruption, optionally rebuilding indexes from the creation syntax. |
| `convert_tables.php` | Convert tables to InnoDB, to `utf8mb4_unicode_ci`, or to latin1, with an optional size cap. |
| `fix_mediumint.php` | Widen the auto-increment columns that overflow on long-lived, very large installs. |
| `repair_graphs.php` | Repair the graph to data source relationship for a device, data template, or graph template. |
| `repair_templates.php` | Repair graph and data templates that lack a hash. Not expected to be needed on a modern install. |
| `remove_broken_graphs.php` | Report, then optionally remove, graphs that have no data sources. |

## RRD file maintenance

| Script | Purpose |
|---|---|
| `removespikes.php` | Remove spikes from one named RRD file using a chosen detection and replacement method. |
| `batchgapfix.php` | Fill gaps across a date range for many devices, in parallel threads. |
| `float_rrdfiles.php` | Float a data range in selected RRD files through `rrdtool dump` and `rrdtool import`. |
| `splice_rrd.php` | Merge two RRD files into a third. Also changes an RRD file's step when the new file already has the wanted step. |
| `structure_rra_paths.php` | Convert a system from legacy RRA paths to structured paths. Interactive, and requires boost. |
| `update_heartbeat.php` | Change the heartbeat on RRD files and update the database to match. |

## Import and packaging

| Script | Purpose |
|---|---|
| `import_template.php` | Import an XML template file, with preview and data source profile options. |
| `import_package.php` | Import a signed package file, with an option to print the package info section instead. |

## Security and integrity

| Script | Purpose |
|---|---|
| `md5sum.php` | Create or verify the `.md5sum` manifest of installed files. |
| `input_whitelist.php` | Audit or update the data input whitelist file, and optionally push changed input strings out. |
| `refresh_csrf.php` | Rotate the CSRF secret. Invalidates in-flight forms, so run it outside production hours. |

## Automation and plugins

| Script | Purpose |
|---|---|
| `apply_automation_rules.php` | Run the automation rules against devices selected by id, hostname, or description. |
| `plugin_manage.php` | Install, uninstall, enable, or disable one or more plugins. |

## Diagnostics and developer tools

| Script | Purpose |
|---|---|
| `sqltable_to_php.php` | Export a table's schema as Cacti save-schema syntax, for use in a plugin's `setup.php`. |

---

## add_device.php

```
add_device.php --description=[description] --ip=[IP] --template=[ID] [--notes="[]"] [--disable]
    [--poller=[id]] [--site=[id]] [--external-id=[S]] [--proxy] [--threads=[1]]
    [--avail=[ping]] --ping_method=[icmp] --ping_port=[N/A, 1-65534] --ping_timeout=[N] --ping_retries=[2]
    [--version=[0|1|2|3]] [--community=] [--port=161] [--timeout=500]
    [--username= --password=] [--authproto=] [--privpass= --privproto=] [--context=] [--engineid=]
    [--quiet]
```

`--description` and `--ip` are required.

| Argument | Documented default | Meaning |
|---|---|---|
| `--description` | none | Name shown on graphs. |
| `--ip` | none | Address or FQDN. |
| `--template` | `0` | Device template id. |
| `--location` | `''` | Physical location. |
| `--notes` | `''` | Free text. Enclose in double quotes. |
| `--external-id` | `''` | Identifier used to align this device with another system. |
| `--disable` | `0` | `1` adds the device with checks disabled. |
| `--poller` | `0` | Data collector id. |
| `--site` | `0` | Site id. |
| `--threads` | `1` | Threads used to poll the device. |
| `--proxy` | off | Permit a second device with the same IP. |
| `--avail` | `pingsnmp` | One of `none`, `snmp`, `ping`, `pingsnmp`, `pingorsnmp`. |
| `--ping_method` | `tcp` | One of `icmp`, `tcp`, `udp`. |
| `--ping_port` | `''` | 1 to 65534. |
| `--ping_retries` | `2` | Communication attempts before the device is down. |
| `--ping_timeout` | database setting | Milliseconds. |
| `--version` | `1` | SNMP version `0`, `1`, `2`, or `3`. `0` disables SNMP. |
| `--community` | `''` | SNMP v1 and v2 community. |
| `--port` | `161` | SNMP port. |
| `--timeout` | `500` | SNMP timeout. |
| `--username`, `--password` | `''` | SNMP v3 auth user and passphrase. |
| `--authproto` | `''` | SNMP v3 authentication protocol. |
| `--privpass`, `--privproto` | `''` | SNMP v3 privacy passphrase and protocol. |
| `--context`, `--engineid` | `''` | SNMP v3 context and engine id. |
| `--max_oids` | `10` | 1 to 60 OIDs per SNMP Get. |
| `--bulk_walk` | `-1` | Bulk walk chunk size, 1 to 60. `-1` auto-tunes. |
| `--list-host-templates` | | Print device template ids and exit. |
| `--list-communities` | | Print known communities and exit. |
| `--quiet` | | Return the value only, for batch use. |

`--version` with no value prints the script version and exits. `--version=N` sets
the SNMP version. The two uses are distinguished by whether any other argument
was given.

## change_device.php

```
change_device.php --id=<device-id> [device attribute arguments] [--force] [--quiet]
change_device.php --file=<path> [--force] [--quiet]
```

Takes the same device attribute arguments as `add_device.php` and applies them to
existing devices. `--id` accepts a comma-separated list. `--id` and `--file` are
mutually exclusive.

| Argument | Meaning |
|---|---|
| `--id` | Device id, or a comma-separated list of them. |
| `--file` | CSV file with a header row of per-device overrides. |
| `--disable` | `1` or `on` disables checks, `0` or `off` enables them. |
| `--force` | Skip the CSV confirmation prompt. |
| `--quiet` | Suppress output and skip the CSV confirmation prompt. |

CSV rules, as stated by the script: the first column must be `id`; column names
must be unique; every row must have the same field count; empty cells mean "no
override" and cannot clear a field; duplicate device ids are rejected; rows with
no changes are skipped. Rows are saved one at a time, so earlier successful rows
stay applied if a later row fails.

## add_graphs.php

```
add_graphs.php --graph-type=[cg|ds] --graph-template-id=[ID] --host-id=[ID]
    [--graph-title=title] [graph options] [--force] [--quiet]
```

For graph template (`cg`) graphs:

| Argument | Meaning |
|---|---|
| `--input-fields` | `"[data-template-id:]field-name=value ..."`. The data template id is optional and disambiguates two input fields with the same name. |
| `--force` | Create the graph even if one already exists. |

For data query (`ds`) graphs:

| Argument | Meaning |
|---|---|
| `--snmp-query-id` | Data query id. |
| `--snmp-query-type-id` | Query type id within that data query. |
| `--snmp-field` | Field to match on. May be repeated. |
| `--snmp-value` | Exact value to match. May be repeated. |
| `--snmp-value-regex` | Regular expression to match instead of an exact value. |
| `--graph-title` | Defaults to whatever the graph or data template specifies. |
| `--reindex-method` | `0\|None`, `1\|Uptime`, `2\|Index`, `3\|Fields`. Not changed if the data query is already associated. |

List options: `--list-hosts`, `--list-graph-templates [--host-template-id=ID]`,
`--list-input-fields --graph-template-id=ID`, `--list-snmp-queries`,
`--list-query-types --snmp-query-id=ID`, `--list-snmp-fields --host-id=ID
[--snmp-query-id=ID]`, `--list-snmp-values --host-id=ID [--snmp-query-id=ID]
--snmp-field=Field`.

## remove_graphs.php

```
remove_graphs.php --graph-template-id=ID [--host-template-id=ID] [--host-id=ID]
    [--graph-regex=R] [--force] [--preserve]
```

| Argument | Meaning |
|---|---|
| `--graph-template-id` | Required. Repeat the argument for more than one. |
| `--host-template-id` | Narrow to one or more device templates. Repeatable. |
| `--host-id` | Narrow to one or more devices. Repeatable. |
| `--graph-regex` | Narrow by graph name regular expression. |
| `--all` | Remove all graphs. Other selection arguments are ignored. |
| `--force` | Actually remove. Without it, the script only counts. |
| `--preserve` | Keep the data sources. The default is to remove them. |
| `--list` | List each graph that would be removed. Mutually exclusive with `--force`. |

## remove_device.php

```
remove_device.php --description='S' | --ip='S' | --id=N,N,N,... [--confirm] [--quiet]
```

At least one selector is required. `--description` and `--ip` may each be a
substring or a regular expression. Nothing is deleted without `--confirm`.

## rebuild_poller_cache.php

```
rebuild_poller_cache.php [--threads=N] [--host-id=N] [--host-template-id=N]
    [--data-template-id=N] [--debug]
```

| Argument | Default | Meaning |
|---|---|---|
| `--threads` | `5` | Parallel rebuild threads. |
| `--host-id` | all | Rebuild one device. |
| `--host-template-id` | all | Rebuild every device on one device template. |
| `--data-template-id` | all | Rebuild every data source on one data template. |
| `--debug` | off | Verbose output. |

`--type` and `--child` exist but are set by the parent process when it spawns
threads. Do not pass them by hand.

## poller_reindex_hosts.php

```
poller_reindex_hosts.php --id=[host_id|all] [--qid=[ID|all]] [--host-descr=[description]] [--debug]
```

| Argument | Default | Meaning |
|---|---|---|
| `--id` | none | Device id, or `all`. |
| `--qid` | `all` | Restrict to one data query id. |
| `--host-descr` | none | Filter devices by description. SQL filters are honoured. |
| `--force` | off | Force graph and data source suggested name re-mapping for every item. |
| `--debug` | off | Verbose output. |

`-id`, `-qid`, and `-host-descr` are accepted as single-dash aliases.

## import_template.php

```
import_template.php --filename=[filename] [--with-profile | --profile-id=N]
```

| Argument | Meaning |
|---|---|
| `--filename` | Required. Path to the XML file. |
| `--preview` | Show what would be imported, then stop. |
| `--with-profile` | Use the default system data source profile. |
| `--profile-id` | Use a specific data source profile id. |
| `--remove-orphans` | Delete elements absent from the new version of the template. |
| `--replace-svalues` | Replace all data query suggested value patterns with the imported ones. |

`import_package.php` takes the same options plus `--info`, which prints the
package info section instead of importing.

## update_heartbeat.php

```
update_heartbeat.php --new-heartbeat=N [--data-template-id=id] [--prev-heartbeat=N] [--force] [--debug]
```

| Argument | Meaning |
|---|---|
| `--new-heartbeat` | Required. Seconds. Must match a heartbeat Kadupul offers, and be at least twice the poller interval. |
| `--data-template-id` | Restrict to data sources on one data template. |
| `--prev-heartbeat` | Restrict to data sources currently on this heartbeat. |
| `--force` | Update the data source profile to match instead of exiting when the two disagree. |
| `--debug` | Verbose output. |

List options: `--list-data-templates`, `--list-heartbeats`, `--list-profiles`. The
help text states the supported heartbeat range as 20 to 172800 seconds.

## removespikes.php

```
removespikes.php --rrdfile=F [--method=stddev] [--avgnan] [--stddev=N]
    [--outliers=N | --outlier-start='YYYY-MM-DD HH:MM' --outlier-end='YYYY-MM-DD HH:MM']
    [--percent=N] [--number=N] [--dryrun] [--debug] [--html]
```

Defaults for every optional argument come from the database when not given on the
command line.

| Argument | Short | Meaning |
|---|---|---|
| `--rrdfile` | `-R` | Required. Path to the RRD file. |
| `--method` | `-M` | `stddev`, `variance`, `fill`, or `float`. |
| `--avgnan` | `-A` | Replacement value: `last`, `avg`, or `nan`. |
| `--stddev` | `-S` | Standard deviations allowed either side. |
| `--percent` | `-P` | Sample to sample variation allowed. |
| `--number` | `-n` | Maximum spikes removed from the file. |
| `--outlier-start`, `--outlier-end` | | Window whose data is excluded from the average. |
| `--outliers` | `-O` | Count of outliers ignored when averaging. |
| `--dryrun` | `-D` | Report what would change; write nothing. |
| `--backup` | | Back up the original file first. |
| `--html` | | Format output for a browser. |
| `--debug` | `-d` | Verbose output. |

## convert_tables.php

```
convert_tables.php [--innodb] [--utf8] [--latin1] [--table=N] [--size=N] [--rebuild] [--dynamic] [--debug]
```

One or more of `--innodb`, `--utf8`, `--latin1` is required. MEMORY tables are not
converted to InnoDB.

| Argument | Short | Default | Meaning |
|---|---|---|---|
| `--innodb` | `-i` | | Convert MyISAM tables to InnoDB. |
| `--utf8` | `-u` | | Convert non-UTF8 tables to `utf8mb4_unicode_ci`. |
| `--latin1` | `-l` | | Convert non-latin1 tables to latin1. |
| `--table` | `-t` | all | Change a single named table. |
| `--skip-innodb` | `-n` | | Space-separated list of tables to leave as they are. |
| `--size` | `-s` | 1,000,000 rows | Largest table, in records, that will be converted. |
| `--rebuild` | `-r` | | Compress or optimize existing InnoDB tables. |
| `--dynamic` | | | Convert to Dynamic row format where available. |
| `--local` | | | Act on the remote data collector when run from one. |
| `--force` | `-f` | | Convert regardless of table size. |
| `--debug` | `-d` | | Verbose output. |

`--local` appears on several maintenance scripts (`analyze_database.php`,
`convert_tables.php`, `fix_mediumint.php`, `repair_database.php`,
`upgrade_database.php`) and has the same meaning on each.
