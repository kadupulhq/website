---
title: Configuration
description: Which settings live in the config file on disk and which live in
  the database, and what each group controls.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 3
slug: 1.2.31/reference/configuration
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/1.2.31/reference/rrdproxy/).
:::

Configuration is split in two. A small file on disk holds what the application
needs before it can reach a database. Everything else lives in the database and is
edited through the web interface.

Inherited from Cacti 1.2.x.

## The config file

`include/config.php`, created by copying `include/config.php.dist`. It is plain
PHP and sets globals. Read at the start of every request and every CLI run.

### Database connection

| Variable | Default in the template |
|---|---|
| `$database_type` | `'mysql'` |
| `$database_default` | `'cacti'` |
| `$database_hostname` | `'localhost'` |
| `$database_username` | `'cactiuser'` |
| `$database_password` | `'cactiuser'` |
| `$database_port` | `'3306'` |
| `$database_retries` | `5` |
| `$database_ssl` | `false` |
| `$database_ssl_key` | `''` |
| `$database_ssl_cert` | `''` |
| `$database_ssl_ca` | `''` |
| `$database_persist` | `false` |

### Remote data collector

The same set prefixed `$rdatabase_`, pointing at the main server. Commented out in
the template. They have no effect unless this install is a remote poller.

`$rdatabase_type`, `$rdatabase_default`, `$rdatabase_hostname`,
`$rdatabase_username`, `$rdatabase_password`, `$rdatabase_port`,
`$rdatabase_retries`, `$rdatabase_ssl`, `$rdatabase_ssl_key`,
`$rdatabase_ssl_cert`, `$rdatabase_ssl_ca`.

### Identity and web paths

| Variable | Default | Purpose |
|---|---|---|
| `$poller_id` | `1` | This system's poller id. `1` is the main web server. |
| `$url_path` | `'/cacti/'` | URL prefix the install is served under. |
| `$cacti_session_name` | `'Cacti'` | Session name. Must contain alphabetic characters. |
| `$cacti_cookie_domain` | unset | Cookie domain. Must match the browser-visible host or a parent of it. Leave unset for a host-only cookie. |
| `$cacti_db_session` | `false` | Store sessions in the database, for load balancing. |
| `$disable_log_rotation` | `false` | For packagers who manage rotation externally. |

To isolate two installs from each other, use `$url_path` and
`$cacti_session_name`, not the cookie domain.

### Optional paths

Commented out in the template. They matter mostly on remote pollers, where scripts
and resources are not under the main web root.

| Variable | Purpose |
|---|---|
| `$scripts_path` | Alternate location for data input scripts. |
| `$resource_path` | Alternate location for resource files. |
| `$config['purifier_cache_path']` | HTMLPurifier definition cache. Must exist and be writable by the web server user. Falls back to `cache/purifier` under the install path. |
| `$input_whitelist` | Path to the data input whitelist JSON file. |
| `$php_path` | Explicit path to the PHP binary. |
| `$php_snmp_support` | Set `false` to disable the PHP SNMP extension. Defaults to `class_exists('SNMP')`. |
| `$path_csrf_secret` | External CSRF secret file. Must be outside the document root, its parent must exist, and it must hold between 32 and 4096 bytes. Web requests never create it. |

### Client address and proxies

`$proxy_headers` controls which request headers may be trusted for the client
address. `REMOTE_ADDR` is always checked.

| Value | Effect |
|---|---|
| `null` or `false` | Use `REMOTE_ADDR` only. |
| `true` | Use every allowed header. The template advises against this. |
| array | Use only the named headers. |

Headers that may be named: `X-Forwarded-For`, `X-Client-IP`, `X-Real-IP`,
`X-ProxyUser-Ip`, `CF-Connecting-IP`, `True-Client-IP`, `HTTP_X_FORWARDED`,
`HTTP_X_FORWARDED_FOR`, `HTTP_X_CLUSTER_CLIENT_IP`, `HTTP_FORWARDED_FOR`,
`HTTP_FORWARDED`, `HTTP_CLIENT_IP`.

A header a client can set is a header a client can forge. Name one only when a
proxy you control rewrites it on every request.

### Language

| Variable | Purpose |
|---|---|
| `$i18n_handler` | Default i18n handler when the database does not set one. Use the numeric value of a `CACTI_LANGUAGE_HANDLER` constant. |
| `$i18n_force_language` | Force one language regardless of anything else, as a string such as `'es-ES'`. |
| `$i18n_log` | File for general i18n call logging. |
| `$i18n_text_log` | File for translation call logging. |

### Developer debug flags

Commented-out `define()` blocks, off by default:
`DEBUG_READ_CONFIG_OPTION`, `DEBUG_READ_CONFIG_OPTION_DB_OPEN`, `DEBUG_SQL_CMD`,
`DEBUG_SQL_FLOW`, `DEBUG_SQL_CONNECT`.

## Database-held settings

Everything else is a row in the `settings` table, read through
`read_config_option()` and written through `set_config_option()`. Per-user
overrides live in `settings_user` and are read through `read_user_setting()`.

The web interface presents these as ten tabs. Each tab holds one or more
collapsible sections.

| Tab | Internal key | Covers |
|---|---|---|
| General | `general` | Logging, language, security headers, automation, graph template defaults |
| Paths | `path` | Binary and log file locations |
| Device Defaults | `snmp` | Defaults applied to newly created devices |
| Poller | `poller` | Collection intervals, process counts, background timeouts |
| Data | `data` | Statistics, RRD file checking, storage layout, RRDtool proxy |
| Visual | `visual` | Themes, tables, trees, fonts, log viewer |
| Authentication | `authentication` | Auth method, password policy, LDAP |
| Performance | `boost` | On-demand RRD updating and image caching |
| Spikes | `spikes` | Spike detection and removal defaults |
| Mail/Reporting/DNS | `mail` | Email transport, report presets, DNS |

### Paths

| Section | Settings |
|---|---|
| Required Tool Paths | `path_snmpwalk`, `path_snmpget`, `path_snmpbulkwalk`, `path_snmpgetnext`, `path_snmptrap`, `path_rrdtool`, `path_php_binary` |
| Logging | `path_cactilog`, `path_stderrlog`, `logrotate_enabled`, `logrotate_frequency`, `logrotate_retain` |
| Alternate Poller Path | `path_spine`, `path_spine_config` |
| RRD Cleaner | `rrd_autoclean`, `rrd_autoclean_method`, `rrd_archive` |

The poller exits with an error if `poller_type` selects spine and `path_spine`
does not point at an existing file.

### General

| Section | Controls |
|---|---|
| Log Settings | Log destination and verbosity, input validation logging, data source tracing, and per-file, per-plugin, and per-device selective debug |
| Internationalization (i18n) | Language support and detection, preferred processor, client timezone handling, date format and separator |
| Other Settings | RRDtool version and gradient support, graph permission method, graph and data source creation method, inline help, deletion verification, drag and drop |
| Site Security | `force_https`, `allow_unsafe_https`, `allow_unsafe_metachars`, and the Content-Security-Policy settings `content_security_policy_script`, `content_security_report_uri`, `content_security_alternate_sources` |
| Automation | `automation_graphs_enabled`, `automation_tree_enabled`, and the notification address settings |
| Graph Template Defaults | `default_test_source`, `default_image_format`, `default_graph_height`, `default_graph_width` |

### Device Defaults

Applied when a device is created, not retroactively.

| Section | Settings |
|---|---|
| General Defaults | `default_template`, `default_site`, `default_poller`, `device_threads`, `reindex_method`, `default_interface_speed` |
| SNMP Defaults | `snmp_version`, `snmp_community`, `snmp_port`, `snmp_timeout`, `snmp_retries`, and the v3 settings `snmp_security_level`, `snmp_auth_protocol`, `snmp_username`, `snmp_password`, `snmp_priv_protocol`, `snmp_priv_passphrase`, `snmp_context`, `snmp_engine_id` |
| Availability/Reachability | `availability_method`, `ping_method`, `ping_port`, `ping_timeout`, `ping_retries` |
| Up/Down Settings | `ping_failure_count`, `ping_recovery_count` |

### Poller

| Setting | Controls |
|---|---|
| `poller_enabled` | Whether collection runs at all. |
| `poller_type` | Which collector binary is used. |
| `poller_interval` | Seconds between collection passes. |
| `cron_interval` | How often the scheduler invokes the poller. |
| `poller_sync_interval` | Remote data collector synchronization frequency. |
| `process_leveling` | Distribute devices across processes by item count rather than by count of devices. |
| `concurrent_processes` | Collector processes per run. |
| `max_threads` | Threads per collector process. |
| `php_servers` | PHP script server processes. |
| `script_timeout` | Timeout for scripts and the script server. |
| `automatic_reindex` | Schedule for reindexing every device. |
| `snmp_bulk_walk_size`, `max_get_size` | SNMP request sizing. |
| `enable_snmp_agent` | Kadupul's own SNMP agent. |
| `poller_refresh_output_table` | Rebuild the `poller_output` MEMORY table each cycle. |
| `disable_cache_replication` | Stop replicating the resource cache to remote collectors. |
| `spine_log_level` | Whether invalid responses are logged individually. |
| `remote_agent_timeout` | Timeout for the remote agent RPC. |
| `oid_increasing_check_disable` | Skip the increasing-OID check on walks. |
| `poller_debug` | Debug output width. |

The Background Timeout section sets a timeout for each background task:
`reports_timeout`, `dsstats_timeout`, `rrdcheck_timeout`, `commands_timeout`,
`maintenance_timeout`, `spikekill_timeout`, plus `commands_processes`.

`poller_interval` and `cron_interval` must agree with the scheduler entry that
actually runs the poller. The poller logs a warning and mails the primary admin
when they drift apart.

### Data

| Section | Controls |
|---|---|
| Data Sources Statistics | `dsstats_enable`, `dsstats_parallel`, `dsstats_daily_interval`, `dsstats_hourly_duration`, `dsstats_major_update_time`, `dsstats_poller_mem_limit` |
| RRDfile Check | `rrdcheck_enable`, `rrdcheck_parallel`, `rrdcheck_interval` |
| Data Storage Settings | `storage_location` |
| Structure RRDfile Paths | `extended_paths`, `extended_paths_type`, `extended_paths_hashes` |
| RRDtool Proxy Server | `rrdp_server`, `rrdp_port`, `rrdp_fingerprint`, and the backup set `rrdp_load_balancing`, `rrdp_server_backup`, `rrdp_port_backup`, `rrdp_fingerprint_backup` |

Changing `extended_paths` does not move existing files. `cli/structure_rra_paths.php`
does that.

### Performance

| Setting | Controls |
|---|---|
| `boost_rrd_update_enable` | On-demand RRD updating. Required when remote data collectors exist. |
| `boost_rrd_update_interval` | How often every RRD file is flushed regardless of demand. |
| `boost_parallel` | Concurrent boost processes. |
| `boost_rrd_update_max_records` | Records processed per run. |
| `boost_rrd_update_max_records_per_select` | Data source items fetched per pass. |
| `boost_rrd_update_string_length` | Maximum argument length handed to RRDtool. |
| `boost_poller_mem_limit` | Memory limit for boost and the poller. |
| `boost_rrd_update_max_runtime` | Wall clock limit for the update script. |
| `boost_redirect` | Write poller output straight into `poller_output_boost`. |
| `path_boost_log` | Boost debug log. |
| `boost_png_cache_enable`, `boost_png_cache_directory` | Graph image caching. |

The poller forces `boost_rrd_update_system_enable` and `boost_redirect` on when
more than one poller exists.

### Authentication

| Section | Settings |
|---|---|
| General | `auth_method`, `auth_cache_enabled` |
| Special Users | `admin_user`, `guest_user`, `user_template` |
| Basic Authentication | `basic_auth_fail_message`, `path_basic_mapfile` |
| Local Account Complexity | `secpass_minlen`, `secpass_reqmixcase`, `secpass_reqnum`, `secpass_reqspec`, `secpass_forceold`, `secpass_expireaccount`, `secpass_expirepass`, `secpass_history` |
| Account Locking | `secpass_lockfailed`, `secpass_unlocktime` |
| LDAP General | `ldap_server`, `ldap_port`, `ldap_port_ssl`, `ldap_version`, `ldap_network_timeout`, `ldap_bind_timeout`, `ldap_encryption`, `ldap_tls_certificate`, `ldap_referrals`, `ldap_mode`, `ldap_dn`, `ldap_group_require`, `ldap_debug` |
| LDAP Group | `ldap_group_dn`, `ldap_group_attrib`, `ldap_group_member_type` |
| LDAP Search | `ldap_search_base`, `ldap_search_filter`, `ldap_specific_dn`, `ldap_specific_password` |
| LDAP CN | `cn_full_name`, `cn_email` |

Complexity, expiry, and locking settings apply to local accounts. They do not
reach an external directory.

### Visual

Themes (`selected_theme`), table paging and autocomplete, tree width, device
dropdown domain stripping, title and field length limits, log viewer paging and
exclusion regex, realtime graph settings, business hours shading, and the RRDtool
graph options: watermark, date format, font selection method, and a size and font
pair for title, legend, axis, and unit text.

### Spikes

Detection and replacement defaults used by both the web spike kill action and
`cli/removespikes.php`: `spikekill_method`, `spikekill_avgnan`,
`spikekill_deviations`, `spikekill_percent`, `spikekill_outliers`,
`spikekill_number`, `spikekill_backupdir`. The batch section adds
`spikekill_batch`, `spikekill_basetime`, `spikekill_templates`, and
`spikekill_purge`.

### Mail/Reporting/DNS

`base_url` for links in mail, the transport settings (`settings_how` selects PHP
mail, sendmail, or SMTP, each with its own section), report presets
(`reports_default_image_format`, `reports_max_attach`, `reports_log_verbosity`,
`reports_allow_ln`), and DNS resolution (`settings_dns_primary`,
`settings_dns_secondary`, `settings_dns_timeout`).

## Per-user settings

`settings_user` rows override system settings for one account. The user settings
form is grouped as General, Time Spanning/Shifting, Graph Thumbnail Settings, Tree
Settings, and Graph Fonts. Several user settings default to the current system
value, so changing the system setting moves the default for anyone who has not
set their own.

## Settings the poller writes back

The poller stores state in the same `settings` table. These are not meant to be
edited by hand.

| Name | Written by |
|---|---|
| `poller_lastrun_<id>` | Start time of the last run for that poller. |
| `poller_mibsrun_<id>` | Last system MIB collection, refreshed every four hours. |
| `active_profiles` | Count of distinct active data source profiles, cached for the collector. |
| `total_snmp_ports` | Count of distinct SNMP ports in the poller cache. |
| `path_webroot` | Web root, recalculated each run. |
| `date` | Timestamp used when rendering graphs. |
| `host_status_cache` | Hash of the device status distribution, used to detect change. |
| `stats_recache_<id>` | Recache statistics for the last run. |
