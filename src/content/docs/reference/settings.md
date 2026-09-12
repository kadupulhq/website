---
title: Settings
description: Every setting Kadupul stores, grouped by the tab it appears under, with its type and its default.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 19
---

:::caution[Planned interface]
The Kadupul labels on this page describe the pending
[application branding change](https://github.com/kadupulhq/kadupul/pull/13).
They are not the literal output of the current main branch or the archived
1.2.31 source. Configuration keys and other technical identifiers are unchanged.
:::


The enumeration of every setting. For where settings live, how the two stores
relate, and what each group is for, read [Configuration](/reference/configuration/).
This page does not repeat that.

The application has 46 variables in the config file, 255 system settings
in the database, 40 per-user settings, and 2 more per-user settings that appear
only when the account holds the matching realm.

## Reading the tables

The `Name` column is the key: the variable name in `include/config.php`, or the
`settings.name` value in the database. It is what `read_config_option()` takes
and what a CLI script or a support thread will name. The `Setting` column is the
label on the form.

| Type | Form control | Stored as |
|---|---|---|
| text | Single line input | String |
| text area | Multi-line input | String |
| password | Masked input | String |
| file path | Path input, checked for an existing file | String |
| directory path | Path input, checked for an existing directory | String |
| select | Dropdown of fixed values | The option key |
| multi-select | Dropdown accepting several values | Comma separated keys |
| boolean | Checkbox | `on` when checked, empty when not |
| boolean group | Several checkboxes under one label | One row per checkbox |
| font | Font file or Pango font-config name | String |
| hidden | Not rendered; set by the poller | String |

An empty `Default` cell means the source states no default. A setting with no
default and no saved row reads back as an empty string.

## Config file variables

`include/config.php`, copied from `include/config.php.dist`. Defaults below are
the values the template ships with. A `#` in the Default column means the line
is commented out in the template and the variable is unset until you uncomment
it.

### Database connection

| Name | Controls | Type | Default |
|---|---|---|---|
| `$database_type` | Database driver. | string | `mysql` |
| `$database_default` | Database name. | string | `cacti` |
| `$database_hostname` | Database host. | string | `localhost` |
| `$database_username` | Database user. | string | `cactiuser` |
| `$database_password` | Database password. | string | `cactiuser` |
| `$database_port` | Database port. | string | `3306` |
| `$database_retries` | Connection attempts before giving up. | integer | `5` |
| `$database_ssl` | Use TLS for the connection. | boolean | `false` |
| `$database_ssl_key` | Client key file. | string | `''` |
| `$database_ssl_cert` | Client certificate file. | string | `''` |
| `$database_ssl_ca` | Certificate authority file. | string | `''` |
| `$database_persist` | Use a persistent connection. | boolean | `false` |

### Remote data collector connection

The same set pointed at the main server. Commented out in the template. No
effect unless this install is a remote poller. Note that there is no
`$rdatabase_persist`.

| Name | Default |
|---|---|
| `$rdatabase_type` | `# 'mysql'` |
| `$rdatabase_default` | `# 'cacti'` |
| `$rdatabase_hostname` | `# 'localhost'` |
| `$rdatabase_username` | `# 'cactiuser'` |
| `$rdatabase_password` | `# 'cactiuser'` |
| `$rdatabase_port` | `# '3306'` |
| `$rdatabase_retries` | `# 5` |
| `$rdatabase_ssl` | `# false` |
| `$rdatabase_ssl_key` | `# ''` |
| `$rdatabase_ssl_cert` | `# ''` |
| `$rdatabase_ssl_ca` | `# ''` |

### Identity, paths, and session

| Name | Controls | Type | Default |
|---|---|---|---|
| `$poller_id` | This system's poller id. `1` is the main web server. | integer | `1` |
| `$url_path` | URL prefix the install is served under. | string | `/cacti/` |
| `$cacti_session_name` | Session name. Must contain alphabetic characters. | string | `Cacti` |
| `$cacti_cookie_domain` | Cookie domain. Unset gives a host-only cookie. | string | `# 'cacti.net'` |
| `$cacti_db_session` | Store sessions in the database. | boolean | `false` |
| `$disable_log_rotation` | Turn off internal log rotation for packagers who rotate externally. | boolean | `false` |
| `$scripts_path` | Alternate location for data input scripts. | string | `# '/var/www/html/cacti/scripts'` |
| `$resource_path` | Alternate location for resource files. | string | `# '/var/www/html/cacti/resource/'` |
| `$config['purifier_cache_path']` | HTMLPurifier definition cache. Falls back to `cache/purifier` under the install path. | string | `# '/var/cache/cacti/purifier'` |
| `$input_whitelist` | Path to the data input whitelist JSON file. | string | `# '/usr/local/etc/cacti/input_whitelist.json'` |
| `$php_path` | Explicit path to the PHP binary. | string | `# '/bin/php'` |
| `$php_snmp_support` | Set `false` to stop using the PHP SNMP extension. Defaults to `class_exists('SNMP')`. | boolean | `# false` |
| `$path_csrf_secret` | External CSRF secret file. Must sit outside the document root and hold 32 to 4096 bytes. | string | `# '/usr/share/cacti/resource/csrf-secret.php'` |

### Client address and language

| Name | Controls | Type | Default |
|---|---|---|---|
| `$proxy_headers` | Which request headers may be trusted for the client address. `false` or `null` uses `REMOTE_ADDR` only, `true` uses every allowed header, an array names the ones to accept. `REMOTE_ADDR` is always checked. | mixed | `null` |
| `$i18n_handler` | Default i18n handler when the database does not set one. Numeric value of a `CACTI_LANGUAGE_HANDLER` constant. | integer | `null` |
| `$i18n_force_language` | Force one language regardless of anything else, such as `'es-ES'`. | string | `null` |
| `$i18n_log` | File for general i18n call logging. | string | `null` |
| `$i18n_text_log` | File for translation call logging. | string | `null` |

### Developer debug defines

Commented out in the template. Each is a `define(..., true)` guarded by
`if (!defined(...))`.

| Name | Emits |
|---|---|
| `DEBUG_READ_CONFIG_OPTION` | Every `read_config_option()` call. |
| `DEBUG_READ_CONFIG_OPTION_DB_OPEN` | Config option reads that had to open the database. |
| `DEBUG_SQL_CMD` | Every SQL statement. |
| `DEBUG_SQL_FLOW` | SQL call flow. |
| `DEBUG_SQL_CONNECT` | Connect and disconnect activity, plus the first execute on each connection. |

## Paths tab

### Required tool paths

Each is checked for an existing binary when saved.

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `path_snmpwalk` | snmpwalk Binary Path | Path to the `snmpwalk` binary. | file path | |
| `path_snmpget` | snmpget Binary Path | Path to the `snmpget` binary. | file path | |
| `path_snmpbulkwalk` | snmpbulkwalk Binary Path | Path to the `snmpbulkwalk` binary. | file path | |
| `path_snmpgetnext` | snmpgetnext Binary Path | Path to the `snmpgetnext` binary. | file path | |
| `path_snmptrap` | snmptrap Binary Path | Path to the `snmptrap` binary. | file path | |
| `path_rrdtool` | RRDtool Binary Path | Path to the `rrdtool` binary. | file path | |
| `path_php_binary` | PHP Binary Path | Path to the PHP binary. | file path | |

### Logging

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `path_cactilog` | Kadupul Log Path | The application log file. Blank falls back to `<path_cacti>/log/cacti.log`. | file path | `<base path>/log/cacti.log` |
| `path_stderrlog` | Poller Standard Error Log Path | Where collector standard error is redirected. | file path | `<base path>/log/cacti_stderr.log` |
| `logrotate_enabled` | Rotate the Kadupul Log | Rotate the log on a schedule. | boolean | `on` |
| `logrotate_frequency` | Rotation Frequency | `1` daily, `7` weekly, `30` monthly. | select | `1` |
| `logrotate_retain` | Log Retention | Log files kept. `0` never removes any. Range 0 to 365. | text | `7` |

### Alternate poller path

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `path_spine` | Spine Binary File Location | Path to the Spine binary. | file path | |
| `path_spine_config` | Spine Config File Path | Path to the Spine configuration file. Spine looks in its working directory, then `/etc`, when unset. | file path | |

### RRD cleaner

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `rrd_autoclean` | RRDfile Auto Clean | Archive or delete RRD files when their data sources are removed. | boolean | |
| `rrd_autoclean_method` | RRDfile Auto Clean Method | `1` delete, `3` archive. | select | `1` |
| `rrd_archive` | Archive directory | Where archived RRD files are moved. | directory path | `<base path>/rra/archive/` |

## General tab

### Log settings

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `log_destination` | Log Destination | `1` logfile only, `2` logfile and syslog or eventlog, `3` syslog or eventlog only. | select | `1` |
| `log_verbosity` | Generic Log Level | Detail written to the log. `1` none, `2` low, `3` medium, `4` high, `5` debug, `6` developer debug. | select | `2` |
| `log_validation` | Log Input Validation Issues | Record request fields read without going through input validation. | boolean | |
| `data_source_trace` | Data Source Tracing | Developer option. Traces data source creation and its uniqueness checks. | boolean | |
| `selective_debug` | Selective File Debug | Files treated as though in debug mode regardless of the generic level. | multi-select | |
| `selective_plugin_debug` | Selective Plugin Debug | Plugins whose files are treated as though in debug mode. | multi-select | |
| `selective_device_debug` | Selective Device Debug | Comma separated device ids put in debug mode during collection only. | text | |
| `poller_log` | Syslog/Eventlog Item Selection | Which classes of message reach syslog or the eventlog. | boolean group | |

`poller_log` writes one row per checkbox.

| Name | Setting | Default |
|---|---|---|
| `log_pstats` | Statistics | |
| `log_pwarn` | Warnings | |
| `log_perror` | Errors | `on` |

### Internationalization

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `i18n_language_support` | Language Support | `0` disabled, `1` enabled, `2` enabled in strict mode. Strict mode falls back to English unless every installed plugin supports the requested language. | select | `1` |
| `i18n_default_language` | Language | System default language. | select | `en-US` |
| `i18n_auto_detection` | Auto Language Detection | Offer the browser's language at login when it is supported. `0` disabled, `1` enabled. | select | `1` |
| `i18n_language_handler` | Preferred Language Processor | Which translation processor to use. The first one found is used when unset. | select | `0` |
| `client_timezone_support` | Client TimeZone Support | Render dates in the browser's timezone. `0` disabled, `1` enabled. | select | `0` |
| `default_date_format` | Date Display Format | System default date format. `0` MM-DD-YYYY, `1` Mon-DD-YYYY, `2` DD-MM-YYYY, `3` DD-Mon-YYYY, `4` YYYY-MM-DD, `5` YYYY-Mon-DD. | select | `4` |
| `default_datechar` | Date Separator | System default date separator. `0` hyphen, `1` slash, `2` dot. | select | `0` |

### Other settings

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `site_location_filter` | Show only site specific locations | Limit the location list to locations present at the device's site. | boolean | |
| `default_has` | Has Graphs/Data Sources Checked | Pre-check the Has Graphs and Has Data Sources filters. | boolean | |
| `rrdtool_version` | RRDtool Version | Which RRDtool version is installed. Values run `1.3.0` through `1.8.0`. | select | `1.4.0` |
| `enable_rrdtool_gradient_support` | Enable Gradient Support | Gradients on AREA and STACK items. | boolean | |
| `graph_auth_method` | Graph Permission Method | `1` permissive, `2` restrictive, `3` device based, `4` graph template based. | select | `1` |
| `grds_creation_method` | Graph/Data Source Creation Method | `0` simple, `1` advanced. Advanced keeps the legacy creation paths. | select | `0` |
| `hide_form_description` | Show Form/Setting Help Inline | Show field help inline instead of on hover. | boolean | |
| `local_documentation` | Local Page Help Only | Point page help at the local `docs` directory rather than the hosted site. | boolean | |
| `deletion_verification` | Deletion Verification | Prompt before deleting an item. | boolean | `on` |
| `ds_preselected_delete` | Data Source Preservation Preset | Preselect deleting related data sources when removing graphs. | boolean | `on` |
| `graphs_auto_unlock` | Graphs Auto Unlock | Do not lock graphs, so their data sources can be edited directly. | boolean | |
| `hide_console` | Hide Kadupul Dashboard | Hide the console for external link use. | boolean | |
| `drag_and_drop` | Enable Drag-N-Drop | Drag and drop on the interfaces that support it. | boolean | `on` |

### Site security

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `force_https` | Force Connections over HTTPS | Redirect plain HTTP to HTTPS. | boolean | |
| `allow_unsafe_https` | Allow Unsafe Remote Data Collector HTTPS | Accept self signed certificates and hostname mismatches when talking to a remote data collector. | boolean | `on` |
| `allow_unsafe_metachars` | Allow Unsafe Metacharacters in Data Input Methods | Permit shell metacharacters in data input methods. Unchecked, quotation marks, curly brackets, vertical bars, backslashes, and backticks are rejected; greater-than and less-than remain allowed for `<path_cacti>` and input parameters. | boolean | |
| `content_security_policy_script` | Content-Security Script Policy | The `script-src` policy. `0` allows non-nonced inline JavaScript, `unsafe-eval` allows that plus `unsafe-eval`, `nonce-report` is nonce mode with reporting only. | select | |
| `content_security_report_uri` | CSP Violation Report URI | Where browsers POST violation reports in the nonce modes. Empty uses `<url_path>/csp_report.php`. | text | |
| `content_security_alternate_sources` | Content-Security Alternate Sources | Space delimited domains permitted as image, CSS, and JavaScript sources. Wildcards and a protocol are accepted, as in `*.mydomain.com` or `https://*.example.com`. | text | |

`content_security_report_uri` is defined twice in the source array. The second
definition wins, which is the one described above.

### Automation

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `automation_graphs_enabled` | Enable Automatic Graph Creation | Let automation create graphs on save. Manual rule runs work either way. | boolean | `on` |
| `automation_tree_enabled` | Enable Automatic Tree Item Creation | Let automation create tree items on save. | boolean | `on` |
| `automation_email` | Automation Notification To Email | Recipient for automation notifications when the network does not set one. Blank uses the primary admin. | text | |
| `automation_fromname` | Automation Notification From Name | From name for automation notifications. | text | |
| `automation_fromemail` | Automation Notification From Email | From address for automation notifications. | text | |

### Graph template defaults

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `default_test_source` | Graph Template Test Data Source | Test a data source before creating its graph. A source returning no valid data yields no graph. | boolean | |
| `default_image_format` | Graph Template Image Format | `1` PNG, `3` SVG. | select | `3` |
| `default_graph_height` | Graph Template Height | Height in pixels for new graph templates. | text | `200` |
| `default_graph_width` | Graph Template Width | Width in pixels for new graph templates. | text | `700` |

## Device Defaults tab

Applied when a device is created. Changing them does not touch existing devices.

### General defaults

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `default_template` | Template | Device template for new devices. | select | |
| `default_site` | Site | Site for new devices. | select | `1` |
| `default_poller` | Poller | Data collector for new devices. | select | `1` |
| `device_threads` | Device Threads | Threads per device, 1 to 10. Spine only. | select | `1` |
| `reindex_method` | Re-index Method for Data Queries | `0` none, `1` uptime goes backwards, `2` index count changes, `3` verify every cycle. | select | `1` |
| `default_interface_speed` | Default Interface Speed | Mbps assumed when `ifSpeed` and `ifHighSpeed` are absent or zero. Values 100 through 100000. | select | `1000` |

### SNMP defaults

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `snmp_version` | Version | `0` not in use, `1`, `2`, or `3`. | select | `2` |
| `snmp_community` | Community | Read community. | text | `public` |
| `snmp_security_level` | Security Level | `noAuthNoPriv`, `authNoPriv`, or `authPriv`. | select | `authPriv` |
| `snmp_auth_protocol` | Auth Protocol (v3) | `[None]`, `MD5`, `SHA`, `SHA224`, `SHA256`, `SHA384`, `SHA512`. | select | `MD5` |
| `snmp_username` | Auth User (v3) | v3 authorization user. | text | |
| `snmp_password` | Auth Passphrase (v3) | v3 authorization passphrase. | password | |
| `snmp_priv_protocol` | Privacy Protocol (v3) | `[None]`, `DES`, `AES`, `AES128`, `AES192`, `AES192C`, `AES256`, `AES256C`. | select | `DES` |
| `snmp_priv_passphrase` | Privacy Passphrase (v3) | v3 privacy passphrase. | password | |
| `snmp_context` | SNMP Context (v3) | v3 context. | text | |
| `snmp_engine_id` | SNMP Engine ID (v3) | v3 engine id. Empty uses the id defined per notification receiver. | text | |
| `snmp_port` | Port Number | UDP port. | text | `161` |
| `snmp_timeout` | Timeout | Milliseconds. | text | `500` |
| `snmp_retries` | Retries | Retry count. | text | `3` |

### Availability and reachability

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `availability_method` | Downed Device Detection | How a device is judged available. `0` none, `1` ping and SNMP uptime, `2` SNMP uptime, `3` ping, `4` ping or SNMP uptime, `5` SNMP description, `6` SNMP getNext. | select | `2` |
| `ping_method` | Ping Type | `1` ICMP, `2` UDP, `3` TCP, `5` TCP closed. | select | `2` |
| `ping_port` | Ping Port | Port for TCP and UDP pings. TCP sends a SYN. UDP needs either a connection or a port unreachable error. | text | `23` |
| `ping_timeout` | Ping Timeout Value | Milliseconds, used for SNMP, ICMP, UDP, and TCP. ICMP rounds up to the nearest second. TCP and UDP timeouts on Windows are set by the operating system. | text | `400` |
| `ping_retries` | Ping Retry Count | Attempts before a device is marked down. | text | `1` |

### Up and down settings

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `ping_failure_count` | Failure Count | Polling intervals a device must be down before it is logged and reported down. | text | `2` |
| `ping_recovery_count` | Recovery Count | Polling intervals a device must stay up before it returns to up. | text | `3` |

## Poller tab

### General

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `poller_enabled` | Data Collection Enabled | Whether collection runs at all. | boolean | `on` |
| `enable_snmp_agent` | SNMP Agent Support Enabled | Populate the SNMP agent tables with device and system information. Does not start the agent. | boolean | `on` |
| `poller_type` | Poller Type | `1` cmd.php, `2` spine. Takes effect at the next interval. Option `2` disappears when `path_spine` is set but not executable. | select | `1` |
| `poller_sync_interval` | Poller Sync Interval | Seconds between remote collector checks, as a preset for new pollers. `0` is manual only. | select | `7200` |
| `poller_interval` | Poller Interval | Seconds between collection passes. Changing it requires repopulating the poller cache. | select | `300` |
| `cron_interval` | Cron/Daemon Interval | How often the scheduler starts the collector. | select | `300` |
| `process_leveling` | Balance Process Load | Distribute poller items evenly across processes rather than devices. | boolean | `on` |
| `poller_debug` | Debug Output Width | Warn when collected output exceeds what can be stored. | boolean | |
| `oid_increasing_check_disable` | Disable increasing OID Check | Skip the increasing-OID check while walking a tree. | boolean | |
| `remote_agent_timeout` | Remote Agent Timeout | Seconds the central web server waits on a remote collector RPC. `5`, `10`, `15`, `20`, `30`, or `60`. | select | `5` |
| `snmp_bulk_walk_size` | SNMP Bulkwalk Fetch Size | OIDs returned per `snmpbulkwalk`. `10` to `200`. | select | `10` |
| `max_get_size` | SNMP Get OID Limit | OIDs per `snmpget` when the SNMP API is called directly from a script or plugin. Devices set their own. | text | `10` |
| `poller_refresh_output_table` | Refresh Poller Table Per Cycle | Rebuild the `poller_output` memory table each cycle. Single poller systems only. | boolean | |
| `disable_cache_replication` | Disable Resource Cache Replication | Stop replicating the resource cache to remote collectors. | boolean | |

### Additional data collector settings

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `spine_log_level` | Invalid Data Logging | `0` none, `1` summary per device, `2` detail per error. | select | `0` |
| `php_servers` | Number of PHP Script Servers | Script server processes per spine process. 1 to 15. Spine only. | text | `1` |
| `script_timeout` | Script and Script Server Timeout Value | Seconds spine waits on a script. Spine only. | text | `25` |

### Periodic all device re-index

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `automatic_reindex` | Re-Index All Device Schedule | `0` disabled, `1` daily, `2` weekly on Sunday, `3` monthly on Sunday. Runs at midnight. | select | `0` |

### Background timeouts and concurrency

Seconds before the named background script is killed.

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `reports_timeout` | Report Generation Timeout | Report generation. `60` to `1200`. | select | `300` |
| `dsstats_timeout` | Data Source Statistics Timeout | Data source statistics. `60` to `3600`. | select | `300` |
| `rrdcheck_timeout` | RRDChecker Timeout | RRD file check. `300` to `14400`. | select | `3600` |
| `commands_timeout` | Poller Commands Timeout | Background commands, which reindex devices and prune devices from remote collectors. `60` to `1200`. | select | `300` |
| `commands_processes` | Poller Command Concurrent Processes | Concurrent command processes, at most one per host in the pool. 1 to 20. | select | `1` |
| `maintenance_timeout` | Maintenance Background Generation Timeout | Maintenance. `60` to `3600`. | select | `300` |
| `spikekill_timeout` | Spikekill Background Generation Timeout | Batch spike removal. `60` to `28800`. | select | `3600` |

### Data collector defaults

Presets only. From 1.2 onward the live values are held on the data collector.

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `concurrent_processes` | Data Collector Processes | Concurrent processes per collector. With `cmd.php`, no more than twice the CPU core count. With spine, keep it low and raise threads instead. | text | `1` |
| `max_threads` | Threads per Process | Threads per process. Database connections needed are collectors times processes times threads plus script servers, on top of connections for user logins. | text | `1` |

## Data tab

### Data source statistics

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `dsstats_enable` | Enable Data Source Statistics Collection | Collect data source statistics. | boolean | |
| `dsstats_parallel` | Number of DSStats Processes | Concurrent processes, 1 to 20. | select | `1` |
| `dsstats_daily_interval` | Daily Update Frequency | Minutes between daily statistics updates, `60` through `1440`, or `boost` to run after boost. | select | `60` |
| `dsstats_hourly_duration` | Hourly Average Window | Window making up the hourly average, in minutes, `60` through `360`. A wide window makes a large memory table. | select | `60` |
| `dsstats_major_update_time` | Maintenance Time | When weekly, monthly, and yearly data are updated. Format `HH:MM [am/pm]`. | text | `12:00am` |
| `dsstats_poller_mem_limit` | Memory Limit for Data Source Statistics Data Collector | Megabytes, `32` upward. | select | `1024` |

### RRD file check

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `rrdcheck_enable` | Enable RRDfile Check | Run the RRD file checker. | boolean | |
| `rrdcheck_parallel` | Number of RRDfile Check Processes | Concurrent processes, 1 to 20. | select | `1` |
| `rrdcheck_interval` | Check Frequency | Minutes between checks: `60`, `240`, `1440`, or `boost` to run after boost. | select | `240` |

### Data storage

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `storage_location` | Location | `0` local, `1` RRDtool proxy server. | select | `0` |

### Structured RRD file paths

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `extended_paths` | Enable Structured Paths | Give each device its own RRD subdirectory. Existing files are not moved; `cli/structure_rra_paths.php` does that. | boolean | |
| `extended_paths_type` | Directory Pattern | `device`, `device_dq`, `hash_device`, or `hash_device_dq`. Changing it needs another run of the structured path script. | select | `device` |
| `extended_paths_hashes` | Max Device Hash Directories | Device directories created from hashed device ids. Lowering it leaves the empty directories behind. | text | `100` |

### RRDtool proxy server

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `rrdp_server` | Proxy Server | Hostname or IP of the proxy. | text | |
| `rrdp_port` | Proxy Port Number | TCP port for the encrypted channel. | text | `40301` |
| `rrdp_fingerprint` | RSA Fingerprint | Fingerprint of the proxy's current public key. Required to establish trust. | text | |

### RRDtool proxy server backup

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `rrdp_load_balancing` | Load Balancing | Spread requests across both proxies when both answer. | boolean | |
| `rrdp_server_backup` | Proxy Server | Hostname or IP of the backup proxy, for a proxy running in MSR mode. | text | |
| `rrdp_port_backup` | Proxy Port Number | TCP port for the backup proxy. | text | `40301` |
| `rrdp_fingerprint_backup` | RSA Fingerprint | Fingerprint of the backup proxy's public key. | text | |

## Visual tab

### Theme

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `selected_theme` | Theme | Which theme skins the interface. The list is the directories under `include/themes`. | select | `modern` |

### Tables

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `num_rows_table` | Rows Per Page | Rows shown in a table. | select | `30` |
| `autocomplete_enabled` | Autocomplete Enabled | Populate long select lists through autocomplete callbacks. `1` yes, `0` no. Forced off on the Classic theme. | select | `1` |
| `autocomplete_rows` | Autocomplete Rows | Rows returned per autocomplete match. Bounded by PHP's `max_input_vars`. | select | `30` |

### Trees

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `min_tree_width` | Minimum Tree Width | Pixels the tree contracts to. | text | `170` |
| `max_tree_width` | Maximum Tree Width | Pixels the tree expands to before branches scroll. | text | `300` |
| `tree_site_includes_templates` | Site Graph Template Expansion | Include the graph templates branch as a site sub-branch. | boolean | `on` |

### Filters

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `strip_domain` | Strip Domains from Device Dropdowns | Strip the domain from hostnames in device filter dropdowns. | boolean | |

### Graph, data source, and data query

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `max_title_length` | Maximum Title Length | Longest permitted graph or data source title. | text | `110` |
| `max_data_query_field_length` | Data Source Field Length | Longest data query field. | text | `40` |

### Graph creation

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `default_graphs_new_dropdown` | Default Graph Type | Preselected type on the create graphs page. `-2` all types, `-1` by template or data query. | select | `-2` |

### Log management

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `num_rows_log` | Default Log Tail Lines | Lines of the log tailed by default. `-1` is all lines. | select | `500` |
| `max_display_rows` | Maximum number of rows per page | Lines tailed when All lines is selected. | text | `1000` |
| `log_refresh_interval` | Log Tail Refresh | Seconds between log display updates. | select | `60` |

### Log viewer

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `clog_exclude` | Exclusion Regex | Lines matching this regex are hidden from the viewer. | text area | |

### Real-time graphs

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `realtime_enabled` | Enable Real-time Graphing | Allow real-time mode. | boolean | `on` |
| `realtime_gwindow` | Graph Timespan | Seconds of history shown on a real-time graph. | select | `60` |
| `realtime_interval` | Minimum Refresh Interval | Shortest supported gap between updates. Also written into the RRD file. Raise it for devices that cache their counters, or the graphs come out with gaps. | select | `10` |
| `realtime_cache_path` | Cache Directory | Where real-time RRD and PNG files are cached. Managed by the poller and written by the web server. | directory path | `<base path>/cache/realtime/` |

### RRDtool graph options

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `graph_watermark` | Custom Watermark | Text at the bottom centre of every graph. | text | `Generated by Cacti®` |
| `graph_dateformat` | Custom Date Format | Format applied to `\|date_time\|` on a graph. | text | `D d M H:i:s T Y` |
| `rrdtool_watermark` | Disable RRDtool Watermark | Suppress RRDtool's own advertisement, where the installed version allows it. | boolean | |
| `font_method` | Font Selection Method | `0` system, `1` theme. | select | `1` |
| `path_rrdtool_default_font` | Default Font | Pango font-config name used for all graphs when fonts are not theme controlled. Blank leaves fonts to each object. | font | |
| `title_size` | Title Font Size | Points. | text | `10` |
| `title_font` | Title Font Setting | TrueType font file or Pango font-config value. | font | |
| `legend_size` | Legend Font Size | Points. | text | `8` |
| `legend_font` | Legend Font Setting | TrueType font file or Pango font-config value. | font | |
| `axis_size` | Axis Font Size | Points. | text | `7` |
| `axis_font` | Axis Font Setting | TrueType font file or Pango font-config value. | font | |
| `unit_size` | Unit Font Size | Points. | text | `7` |
| `unit_font` | Unit Font Setting | TrueType font file or Pango font-config value. | font | |

### Business hours

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `business_hours_start` | Start of Business Day | Format `hh:mm`. | text | `08:00` |
| `business_hours_end` | End of Business Day | Format `hh:mm`. | text | `18:00` |
| `business_hours_hideWeekends` | Hide Weekends | Shade business hours on weekdays only. | boolean | |
| `business_hours_enable` | Show business hours | Shade business hours on RRD graphs. | boolean | |
| `business_hours_color` | Color to use for business hours | RGBA hex. | text | `ccccccff` |

## Authentication tab

### General

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `auth_method` | Authentication Method | `1` builtin, `2` web basic, `3` LDAP, `4` multiple LDAP or AD domains. Options `3` and `4` appear only when PHP has `ldap_connect()`. | select | `1` |
| `auth_cache_enabled` | Support Authentication Cookies | Honour Keep me signed in. The cookie expires after 90 days of non-use. | boolean | `on` |

### Special users

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `admin_user` | Primary Admin | Account that receives system notification mail. Needs an email address set. | select | `1` |
| `guest_user` | Guest User | Account used for anonymous graph viewing. | select | `0` |
| `user_template` | User Template | Account copied when a web basic or LDAP user first logs in. Selecting an account disables it from logging in. | select | `0` |

### Basic authentication

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `basic_auth_fail_message` | Basic Auth Login Failure Message | Shown when the basic username cannot be mapped to an account. Text or HTML. | text area | |
| `path_basic_mapfile` | Basic Auth Mapfile | CSV mapping basic account names to login accounts. | file path | |

### Local account complexity

These apply to local accounts. They do not reach an external directory.

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `secpass_minlen` | Minimum Length | Shortest permitted password. | text | `8` |
| `secpass_reqmixcase` | Require Mix Case | Require upper and lower case. | boolean | `on` |
| `secpass_reqnum` | Require Number | Require a digit. | boolean | `on` |
| `secpass_reqspec` | Require Special Character | Require a special character. | boolean | `on` |
| `secpass_forceold` | Force Complexity Upon Old Passwords | Apply the rules to existing passwords at login, forcing a change when they fail. | boolean | |
| `secpass_expireaccount` | Expire Inactive Accounts | Days of inactivity before an account is disabled. `0` disables the policy. The admin account is exempt. | select | `0` |
| `secpass_expirepass` | Expire Password | Days before a password expires. `0` disables. | select | `0` |
| `secpass_history` | Password History | Old passwords remembered and refused. `0` disables, up to 12. | select | `0` |

### Account locking

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `secpass_lockfailed` | Lock Accounts | Failed attempts in one hour before the account locks. `0` disables, up to 6. | select | `0` |
| `secpass_unlocktime` | Auto Unlock | Minutes before a locked account unlocks. The correct password does not unlock it early. Maximum 1440. | select | `60` |

### LDAP general

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `ldap_server` | Server(s) | Space delimited hostnames or addresses, tried left to right. | text | |
| `ldap_port` | Port Standard | TCP port for non-SSL, including LDAP with TLS. | text | `389` |
| `ldap_port_ssl` | Port SSL | TCP port for LDAPS. | text | `636` |
| `ldap_version` | Protocol Version | `2` or `3`. | select | `3` |
| `ldap_network_timeout` | Connect Timeout | Seconds. | text | `2` |
| `ldap_bind_timeout` | Bind Timeout | Seconds. | text | `5` |
| `ldap_debug` | LDAP Debug Mode | Log extra detail during bind and search. | boolean | |
| `ldap_encryption` | Encryption | `0` none, `1` LDAPS, `2` LDAP with TLS. LDAP with TLS requires version 3. | select | `0` |
| `ldap_tls_certificate` | TLS Certificate Requirements | Never, hard, demand, allow, or try. Stored as the PHP `LDAP_OPT_X_TLS_*` value. | select | `LDAP_OPT_X_TLS_NEVER` |
| `ldap_referrals` | Referrals | `0` disabled, `1` enabled. Disabling can speed up searches. | select | `0` |
| `ldap_mode` | Mode | `0` no searching, `1` anonymous searching, `2` specific searching. | select | `0` |
| `ldap_dn` | Distinguished Name (DN) | DN template with `<username>` substituted at login, such as `uid=<username>,ou=people,dc=domain,dc=local` or the AD form `<username>@win2kdomain.local`. Used in no-searching mode and when group membership is required. | text | |
| `ldap_group_require` | Require Group Membership | Require group membership to authenticate. Fails closed when the group settings are incomplete. | boolean | |

### LDAP group

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `ldap_group_dn` | Group Distinguished Name (DN) | DN of the group a user must belong to. | text | |
| `ldap_group_attrib` | Group Member Attribute | Attribute holding member names. Its values must match the form the distinguished name setting produces. | text | |
| `ldap_group_member_type` | Group Member Type | `1` full distinguished name, `2` username. | select | `1` |

### LDAP search

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `ldap_search_base` | Search Base | Base for the directory search, such as `dc=win2kdomain,dc=local`. | text | |
| `ldap_search_filter` | Search Filter | Filter locating the user, with `<username>` substituted from the login prompt. | text | |
| `ldap_specific_dn` | Search Distinguished Name (DN) | Bind DN used for specific searching. | text | |
| `ldap_specific_password` | Search Password | Bind password used for specific searching. | password | |

### LDAP CN

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `cn_full_name` | Full Name | Directory attribute copied into the full name on user creation. `displayname` on Windows. | text | |
| `cn_email` | Email | Directory attribute copied into the email address. `mail` on Windows. | text | |

## Performance tab

### On-demand RRD update

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `boost_rrd_update_enable` | Enable On-demand RRD Updating | Update RRD files on request rather than every cycle. Required when remote data collectors exist. Disabling takes effect after the next cycle. | boolean | |
| `boost_rrd_update_system_enable` | System Level RRD Updater | Set by the poller, not by hand. A full poller run must pass before on-demand updating can be cleared. | hidden | |
| `boost_rrd_update_interval` | How Often Should Boost Update All RRDs | Minutes after which every RRD file is flushed regardless of demand. `30` through `360`. | select | `60` |
| `boost_parallel` | Number of Boost Processes | Concurrent boost processes, 1 to 20. | select | `1` |
| `boost_rrd_update_max_records` | Maximum Records | Rows in the boost output table that force an update. | text | `1000000` |
| `boost_rrd_update_max_records_per_select` | Maximum Data Source Items Per Pass | Data source items fetched per pass. Lower it when graphing or polling slows during an update. | select | `50000` |
| `boost_rrd_update_string_length` | Maximum Argument Length | Longest argument handed to RRDtool, bounded by the operating system. | text | `2000` |
| `boost_poller_mem_limit` | Memory Limit for Boost and Poller | Megabytes, `256` through `3072` and above. | select | `1024` |
| `boost_rrd_update_max_runtime` | Maximum RRD Update Script Run Time | Seconds after which the boost poller logs a warning. `1200` through `4800`. | select | `1200` |
| `boost_redirect` | Enable direct population of poller_output_boost table | Insert straight into `poller_output_boost`, which the source states cuts about 25 percent from each poll cycle. | boolean | |
| `path_boost_log` | Boost Debug Log | When set, RRD update output from the boost poller is written here. | file path | |

### Image caching

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `boost_png_cache_enable` | Enable Image Caching | Cache rendered graph images. | boolean | |
| `boost_png_cache_directory` | Location for Image Files | Where cached images go. Purged by the poller as they expire. | directory path | `<base path>/cache/boost/` |

## Spikes tab

Defaults for both the interface action and `cli/removespikes.php`.

### Spike kill

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `spikekill_method` | Removal Method | `1` standard deviation, `2` variance with outliers removed. | select | `2` |
| `spikekill_avgnan` | Replacement Method | `avg` the data source average, `nan` unknown, `last` the last known good value. | select | `last` |
| `spikekill_deviations` | Number of Standard Deviations | Deviations above the average that count as a spike. `3` to `200`. The source recommends no lower than 5. | select | `10` |
| `spikekill_percent` | Variance Percentage | Percent above the adjusted average that counts as a spike. `100` to `500000`. | select | `1000` |
| `spikekill_outliers` | Variance Number of Outliers | High and low samples dropped before the variance average is taken, from each end. `3` to `1000`. | select | `5` |
| `spikekill_number` | Max Kills Per RRA | Spikes removed from one RRA. `1` to `100`. | select | `5` |
| `spikekill_backupdir` | RRDfile Backup Directory | Where originals are copied before a kill. | directory path | `<base path>/cache/spikekill/` |

### Batch spike kill

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `spikekill_batch` | Removal Schedule | `0` disabled, `6` or `12` hourly, `24` once a day, `48` every other day. | select | `0` |
| `spikekill_basetime` | Base Time | When the batch starts. | text | `12:00am` |
| `spikekill_templates` | Graph Templates to Spike Kill | Graph templates the batch acts on. | multi-select | |
| `spikekill_purge` | Backup Retention | Seconds a backup RRD file is kept. | select | `7856352` (about 91 days) |

## Mail/Reporting/DNS tab

### URL linking

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `base_url` | Server Base URL | Base used for links in outgoing mail, including the subdirectory. | text | `http://` plus the system hostname plus `$url_path` |

### Emailing

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `notify_admin` | Notify Primary Admin of Issues | Mail the primary admin when the system hits problems. | boolean | |
| `settings_test_email` | Test Email | Address the test message is sent to. | text | |
| `settings_how` | Mail Services | `0` PHP `mail()`, `1` sendmail, `2` SMTP. Sendmail is removed on Windows. | select | `0` |
| `settings_ping_mail` | Ping Mail Server | Ping the mail server before sending the test message. `0` yes, `1` no. | select | `0` |
| `settings_from_email` | From Email Address | From address on outgoing mail. | text | |
| `settings_from_name` | From Name | From name on outgoing mail. | text | |
| `settings_wordwrap` | Word Wrap | Characters before a line wraps. `0` disables wrapping. | text | `120` |

### Sendmail

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `settings_sendmail_path` | Sendmail Path | Path to sendmail. Used only when sendmail is the selected service. Removed on Windows. | file path | |

### SMTP

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `settings_smtp_host` | SMTP Hostname | Host or address. Several separated by semicolons give failover. | text | `localhost` |
| `settings_smtp_port` | SMTP Port | Port. | text | `25` |
| `settings_smtp_username` | SMTP Username | Blank when the server needs no authentication. | text | |
| `settings_smtp_password` | SMTP Password | Blank when the server needs no authentication. | password | |
| `settings_smtp_secure` | SMTP Security | `none`, `ssl`, or `tls`. | select | `none` |
| `settings_smtp_timeout` | SMTP Timeout | Seconds. | text | `10` |

### Reporting presets

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `reports_default_image_format` | Default Graph Image Format | Image type for inline graphs on a new report. Inline PNG always; inline JPEG and GIF appear when the GD extension is loaded. | select | `1` |
| `reports_max_attach` | Maximum E-Mail Size | Bytes, message plus attachments. | select | `10485760` |
| `reports_log_verbosity` | Poller Logging Level for Kadupul Reporting | Detail the reporting poller writes. Same scale as `log_verbosity`. | select | `2` |
| `reports_allow_ln` | Enable Lotus Notes (R) tweak | Apply the handling Lotus Notes clients need. | boolean | |

### DNS

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `settings_dns_primary` | Primary DNS IP Address | Resolver for reverse lookups. | text | |
| `settings_dns_secondary` | Secondary DNS IP Address | Second resolver. | text | |
| `settings_dns_timeout` | DNS Timeout | Milliseconds. Kadupul uses a PHP resolver, not the system one. | text | `500` |

## Per-user settings

Rows in `settings_user`, read through `read_user_setting()`. Several default to
the current system value, so moving the system setting moves the default for
anyone who has not chosen their own.

### General

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `selected_theme` | Theme | Theme for this account. | select | system `selected_theme` |
| `default_view_mode` | Default View Mode | Graph page mode on arrival. | select | `1` |
| `client_timezone_support` | TimeZone Support | Which timezone dates and graphs use. `0` server, `1` browser. | select | `0` |
| `user_language` | User Language | Interface language. | select | new-user default language |
| `show_graph_title` | Show Graph Title | Render the title as page text so the browser can search it. | boolean | |
| `hide_disabled` | Hide Disabled | Hide disabled devices and graphs outside the console. | boolean | `on` |
| `show_aggregates` | Show Device Aggregates | Show an aggregate graph alongside the device graphs it draws from. | boolean | `on` |
| `enable_hscroll` | Enable Horizontal Scrolling | Scroll tables sideways instead of hiding columns responsively. | boolean | |
| `default_date_format` | Date Display Format | Date format for this account. | select | system `default_date_format` |
| `default_datechar` | Date Separator | Date separator for this account. | select | system `default_datechar` |
| `page_refresh` | Page Refresh | Seconds between automatic page refreshes. `15`, `20`, `30`, `60`, or `300`. | select | `300` |
| `preview_graphs_per_page` | Preview Graphs Per Page | Graphs per page in preview mode. | select | `10` |
| `realtime_mode` | Realtime View Mode | `1` inline, `2` new window. Present only for accounts holding the realtime realm. | select | `1` |
| `user_auto_logout_time` | Auto Log Out Time | Seconds of console inactivity before logout. `-1` uses the system setting. Present only for accounts holding the matching realm, and hidden when web basic authentication or authentication cookies are in use. Options above PHP's `session.gc_maxlifetime` are removed. | select | `session.gc_maxlifetime`, capped at 2147483 |

### Time spanning and shifting

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `default_rra_id` | Default Time Range | RRA used in the rare cases one must be named. | select | `1` |
| `default_timespan` | Default Timespan | Timespan preselected on graph pages. | select | `7` |
| `default_timeshift` | Default Timeshift | Timeshift preselected on graph pages. | select | `7` |
| `allow_graph_dates_in_future` | Allow Graph to extend to Future | Let a graph's end date run past now. | boolean | `on` |
| `first_weekdayid` | First Day of the Week | First day on weekly graphs. | select | Monday |
| `day_shift_start` | Start of Daily Shift | Format `hh:mm`. | text | `07:00` |
| `day_shift_end` | End of Daily Shift | Format `hh:mm`. | text | `18:00` |

### Graph thumbnails

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `thumbnail_sections` | Thumbnail Sections | Which views show thumbnails. | boolean group | |
| `num_columns` | Preview Thumbnail Columns | Columns in preview mode, 1 to 6. | select | `2` |
| `num_columns_tree` | Tree View Thumbnail Columns | Columns in tree mode, 1 to 6. | select | `2` |
| `default_height` | Thumbnail Height | Pixels. | text | `100` |
| `default_width` | Thumbnail Width | Pixels. | text | `300` |

`thumbnail_sections` writes one row per checkbox.

| Name | Setting | Default |
|---|---|---|
| `thumbnail_section_preview` | Preview Mode | `on` |
| `thumbnail_section_tree_2` | Tree View | |

### Tree

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `default_tree_id` | Default Tree | Tree opened in tree mode. | select | `0` |
| `treeview_graphs_per_page` | Graphs Per Page | Graphs per page in tree mode. | select | `10` |
| `expand_hosts` | Expand Devices | Expand a device's graph templates and data queries on the tree. | boolean | |
| `tree_site_includes_templates` | Site Graph Template Expansion | Include the graph templates branch as a site sub-branch. | boolean | system `tree_site_includes_templates` |
| `tree_history` | Tree History | Remember tree position between visits and logins. | boolean | `on` |
| `min_tree_width` | Minimum Tree Width | Pixels. | text | system `min_tree_width` |
| `max_tree_width` | Maximum Tree Width | Pixels. | text | system `max_tree_width` |

### Graph fonts

Ignored unless `custom_fonts` is on.

| Name | Setting | Controls | Type | Default |
|---|---|---|---|---|
| `custom_fonts` | Use Custom Fonts | Use this account's fonts instead of the system defaults. | boolean | |
| `title_size` | Title Font Size | Points. | text | `12` |
| `title_font` | Title Font File | Font file. | font | |
| `legend_size` | Legend Font Size | Points. | text | `10` |
| `legend_font` | Legend Font File | Font file. | font | |
| `axis_size` | Axis Font Size | Points. | text | `8` |
| `axis_font` | Axis Font File | Font file. | font | |
| `unit_size` | Unit Font Size | Points. | text | `8` |
| `unit_font` | Unit Font File | Font file. | font | |

## Settings the poller writes

The poller stores run state in the same `settings` table. They are not settings
in the sense of the rest of this page, and editing them by hand does nothing
useful. [Configuration](/reference/configuration/) lists them.
