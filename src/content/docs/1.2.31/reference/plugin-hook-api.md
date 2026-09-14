---
title: Plugin hook API
description: The files a plugin must ship, the functions it calls to register
  itself, the argument and return contract of the two dispatchers, and every
  hook name the source fires with where it fires and what it passes.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 17
slug: 1.2.31/reference/plugin-hook-api
---

The API lives in `lib/plugins.php`. The management page is `plugins.php`. Inherited
from Cacti 1.2.x, and this page describes that code.

For why the model works the way it does, see [Plugins](/1.2.31/concepts/plugins/).

## File layout

A plugin is a directory under `plugins/`. The management page scans that directory
and treats a subdirectory as a plugin when it contains `setup.php`.

| Path | Required | Purpose |
|---|---|---|
| `plugins/<dir>/` | Yes | The directory name is the plugin's identity. It is the `directory` column in `plugin_config` and the `name` column in `plugin_hooks`. |
| `plugins/<dir>/setup.php` | Yes | Entry point. Included by install, uninstall and config-check. Must define the lifecycle functions below. |
| `plugins/<dir>/INFO` | Yes in practice | INI file read for version, compatibility, dependencies and remote capabilities. Without it the plugin is reported at status `-4` and cannot be installed. |
| `plugins/<dir>/<any>.php` | No | Hook implementation files. Named per hook registration and included on dispatch. |

The directory name is constrained. `cacti_plugin_path()` in `lib/functions.php`
rejects any name not matching `^[A-Za-z0-9_-]+$`, then `realpath()`s
`<base_path>/plugins/<dir>` and resolves the relative file inside it through
`validate_relative_path_within()`. A file reference that escapes the plugin's own
directory returns `false` and the include is skipped.

Two further name rules are enforced at display time:

| Condition | Status |
|---|---|
| Directory name contains a space | `-3` |
| Directory name differs from `INFO`'s `name`, case-insensitively | `-2` |
| Directory name contains `plugin_` | Install refuses and asks for a rename |

## The INFO file

`parse_ini_file($file, true)` with a required `[info]` section. Anything outside
`[info]` is ignored by `plugin_load_info_file()`.

| Field | Read by | Meaning |
|---|---|---|
| `name` | `plugin_load_info_defaults()` | Must match the directory name, case-insensitively. Defaults to `ucfirst(<dir>)`. |
| `longname` | `plugin_load_info_defaults()` | Display name. Defaults to `ucfirst(<dir>)`. |
| `version` | `plugin_load_info_defaults()` | Display only. The installed version comes from `plugin_<dir>_version()`, not from here. |
| `author` | `plugin_load_info_defaults()` | Display only. |
| `homepage` | `plugin_load_info_defaults()` | Falls back to the `webpage` field, then to the string `Not Stated`. |
| `webpage` | `plugin_load_info_defaults()` | Older spelling of `homepage`. |
| `compat` | `plugin_is_compatible()`, `plugin_load_info_defaults()` | Minimum core version. Compared with `cacti_version_compare(CACTI_VERSION, $info['compat'], '<')`. A missing or too-high value sets status `-1`. |
| `requires` | `api_plugin_get_dependencies()` | Space-separated tokens. `name:version` requires that minimum version, a bare `name` requires the plugin at any version. |
| `capabilities` | `api_plugin_remote_capabilities()` | Space-separated `flag:0` or `flag:1` pairs. Matched with `strpos($capabilities, "$capability:1")`. |
| `directory` | `plugin_load_info_defaults()` | Defaults to the containing directory's basename. |
| `status` | `plugin_load_info_defaults()` | Overwritten by the loader. Not something a plugin sets. |

`requires` is parsed by splitting on spaces, then on `:`. A dependency is satisfied
when `api_plugin_minimum_version()` finds the dependency's `plugin_config.version`
at or above the requested version, and `api_plugin_installed()` reports a status of
1 or higher.

## setup.php

`setup.php` is included by name through `cacti_plugin_path($plugin, 'setup.php')`.
Four function names are looked up by string, with the directory name interpolated.

| Function | Called from | Required | Contract |
|---|---|---|---|
| `plugin_<dir>_version()` | `api_plugin_install()` | Yes | Returns an array. `longname`, `author` and `version` are read. `homepage` is read, falling back to `webpage`, then to `Not Stated`. Absence aborts the install with a message. |
| `plugin_<dir>_install()` | `api_plugin_install()` | Yes | Registers hooks and realms and creates tables. Absence aborts the install with a message. |
| `plugin_<dir>_check_config()` | `api_plugin_check_config()` | No | Returns true when the plugin is configured. A missing function is treated as true. Gates both the post-install status and `api_plugin_enable()`. |
| `plugin_<dir>_uninstall()` | `api_plugin_uninstall()` | No | Runs before hooks, realms and rows are removed. |

There is no upgrade entry point in `lib/plugins.php`. Status 3 exists in the status
name list as `Awaiting Upgrade`, but no code in the API sets it and the management
page's action column has no case for it.

Hook implementation functions are plain global functions. Their names are whatever
the plugin passes to `api_plugin_register_hook()`, with no naming rule enforced.

## Registration functions

Signatures read from `lib/plugins.php`.

```php
api_plugin_register_hook($plugin, $hook, $function, $file, $enable = false)
api_plugin_register_realm($plugin, $file, $display, $admin = true)
api_plugin_db_table_create($plugin, $table, $data)
api_plugin_db_add_column($plugin, $table, $column)
api_plugin_drop_table($table)
api_plugin_db_changes_remove($plugin)
```

Both register functions start with `api_plugin_valid_entrypoint($plugin, __FUNCTION__)`,
which walks `debug_backtrace()` and tests frame 2's function name against
`/(install|upgrade|setup)/i`. A call from anywhere else logs

```
WARNING: Plugin '<plugin>' is attempting to call '<function>' improperly in function '<caller>'
```

and returns `false` without registering anything. Registration is an install-time
operation and calling it from a hook does not work.

### api\_plugin\_register\_hook

| Argument | Meaning |
|---|---|
| `$plugin` | Directory name. Written to `plugin_hooks.name`. |
| `$hook` | Hook name from the table below. |
| `$function` | Global PHP function to call. |
| `$file` | Path relative to the plugin's directory, resolved by `cacti_plugin_path()` at dispatch. |
| `$enable` | Force `status = 1` on insert. |

On a first insert the status is 0, except for `config_settings`, `config_arrays` and
`config_form`, which are inserted enabled so a plugin can contribute settings before
it is active. On a repeat call the row is updated, and the status is raised to 1 when
any other hook for the same plugin is already enabled.

Every registration, removal and status change calls `api_plugin_replicate_config()`,
which pushes the plugin tables out to every remote poller seen within two poller
intervals.

## The hook system

Two dispatchers, with different contracts. Both are in `lib/plugins.php`.

| | `api_plugin_hook()` | `api_plugin_hook_function()` |
|---|---|---|
| Signature | `api_plugin_hook($name, ...)` | `api_plugin_hook_function($name, $parm = NULL)` |
| Plugin receives | One array: element 0 is the hook name, element 1 the first extra argument | The value itself |
| Plugin return | Discarded | Becomes the input to the next plugin, and the dispatcher's return |
| Dispatcher returns | Its own `func_get_args()`, unchanged | The chained value |
| Chaining | No | Yes, in `plugin_config.id` order |

Neither dispatcher passes by reference. A plugin that mutates its argument array in
place changes nothing the caller sees. Under `api_plugin_hook_function()` the only
way to affect the caller is the return value, and only where the call site uses it.

### Dispatch

Both follow the same path.

1. Return immediately when `IN_CACTI_INSTALL` is defined or `plugin_hooks` does not
   exist.
2. Query `plugin_hooks` joined to `plugin_config` for rows with `status = 1` and the
   requested hook name, ordered by `plugin_config.id`. The result is cached in a
   static array for the rest of the request.
3. Skip any plugin listed in `$plugins_integrated`.
4. Resolve `plugin_hooks.file` through `cacti_plugin_path()`. A rejected path logs
   `ERROR: Attempted inclusion of invalid plugin file ... ` at level `SECURITY` and
   the row is skipped. A resolved path is `include_once`d if it exists.
5. Call the function when `function_exists()` says it is there. Otherwise log a
   debounced warning.

`plugin_config.id` order is what the up and down arrows on the management page set,
through `api_plugin_moveup()` and `api_plugin_movedown()`.

### The return warning

`api_plugin_hook_function()` records whether its input was an array and whether it
was empty. After each plugin call, if an array came back as a non-array, or a
non-empty value came back null, it logs

```
WARNING: Plugin hook '<function>' from Plugin '<plugin>' must return the calling
array or variable, and it is not doing so.  Please report this to the Plugin author.
```

The log line is emitted only when more than one plugin is attached to that hook. One
plugin swallowing a value produces a missing feature and no log entry.

### Wrappers

```php
do_hook($name)               // $data = func_get_args(); return api_plugin_hook($name, $data);
do_hook_function($name, $parm = NULL)
api_user_realm_auth($filename = '')
```

`do_hook()` collects its own arguments and passes the whole array as a single extra
argument, so a plugin called through it receives
`array(0 => '<name>', 1 => array('<name>', ...))`. The nesting is one level deeper
than calling `api_plugin_hook()` directly.

### Remote pollers

On a poller with `poller_id > 1`, `api_plugin_run_plugin_hook()` and
`api_plugin_run_plugin_hook_function()` check the plugin's `capabilities` string
before calling. A plugin with no `capabilities` field runs unconditionally. A plugin
that declares them runs only when `api_plugin_status_run()` matches the hook against
the required capability list and the current `$config['connection']` value of
`online`, `offline` or `recovery`.

The two required-capability maps are hardcoded in `lib/plugins.php`.

| Capability | Meaning in the maps |
|---|---|
| `remote_collect` | Poller output and stats hooks |
| `remote_poller` | `poller_bottom` |
| `online_view` / `offline_view` | Read-only UI hooks |
| `online_mgmt` / `offline_mgmt` | Action-list and management UI hooks |

`offline_mgmt:1` is accepted in place of `offline_view` and, in the code as written,
in place of `online_view` as well.

After a `config_arrays` or `config_insert` hook on an offline or recovery collector,
the global `$menu` is restored to its pre-hook value unless the plugin declares
`offline_mgmt`.

## Hook table

Enumerated by searching every `.php` file in the tree outside `include/vendor/` for
calls to `api_plugin_hook`, `api_plugin_hook_function`, `do_hook` and
`do_hook_function`. That produced 176 matching lines. Removing the definitions in
`lib/plugins.php` and one comment in a test leaves 169 call sites carrying **142
distinct hook names**: 140 written as a string literal on the call line,
`substitute_host_data` written on the line below the opening parenthesis, and
`graph_buttons_thumbnails` reached through a variable. The list is believed complete
for 1.2.x. Nothing outside `include/vendor/` dispatches a hook from a non-PHP file.

In the **Via** column, `hook` is `api_plugin_hook()` and `fn` is
`api_plugin_hook_function()`. For `hook` rows, **Receives** describes element 1 of
the array the plugin function is given; element 0 is always the hook name. **Return**
says whether the call site uses what comes back.

| Hook | Via | Fires at | Receives | Return |
|---|---|---|---|---|
| `add_graph_template_to_host` | fn | `cli/add_graph_template.php`, `cli/host_update_template.php`, `host.php` graph-template add, `lib/api_device.php` `api_device_update_host_template()` | `array('host_id', 'graph_template_id')` | Discarded |
| `api_device_new` | fn | `lib/api_device.php` `api_device_save()`, after the row is written | The saved `host` row plus `id` | Discarded |
| `api_device_save` | fn | `lib/api_device.php` `api_device_save()`, before `sql_save()` | The `host` row about to be saved | Used |
| `auth_alternate_realms` | fn | `include/auth.php`, when `auth_method != 0` | Nothing | Discarded |
| `auth_profile_reset` | hook | `auth_profile.php` `api_auth_clear_user_settings()` | Nothing | Discarded |
| `auth_profile_reset_value` | fn | `auth_profile.php` `api_auth_clear_user_setting()`, for an unknown setting name | Setting name | Discarded |
| `auth_profile_run_action` | fn | `auth_profile.php`, action dispatch | The `tab` request variable | Discarded |
| `auth_profile_save` | hook | `auth_profile.php` save | Nothing | Discarded |
| `auth_profile_tabs` | fn | `auth_profile.php`, tab construction | Tab array, key => `array('display', 'url')` | Used |
| `auth_profile_update_data` | fn | `auth_profile.php`, update action | Current tab name | Discarded |
| `boost_poller_bottom` | hook | `poller_boost.php`, end of a boost run | Nothing | Discarded |
| `cacti_stats_update` | fn | `poller.php` `log_cacti_stats()` | Performance data array | Discarded |
| `change_password_title` | fn | `auth_changepassword.php`, page header | Default title string | Used |
| `clog_regex_array` | fn | `lib/clog_webapi.php` `clog_get_regex_array()` | Array of `array('name', 'regex', 'func')` | Used |
| `config_arrays` | hook | `include/global_arrays.php`, last statement | Nothing | Discarded |
| `config_form` | hook | `include/global_form.php`, last statement | Nothing | Discarded |
| `config_insert` | hook | `include/global.php`, after bootstrap | Nothing | Discarded |
| `config_settings` | hook | `include/global_settings.php`, last statement | Nothing | Discarded |
| `console_after` | hook | `index.php`, after console content | Nothing | Discarded |
| `console_before` | hook | `index.php`, before console content | Nothing | Discarded |
| `copy_user` | fn | `lib/auth.php` `user_copy()` | `array('template_id', 'new_id')` | Discarded |
| `create_complete_graph_from_template` | fn | `lib/template.php` `create_complete_graph_from_template()` | The graph save array including `id`, `graph_template_id`, `snmp_query_id`, `snmp_index`, `snmp_query_graph_id` | Discarded |
| `custom_denied` | fn | `include/auth.php` and `permission_denied.php` | `OPER_MODE_NATIVE` | Used, compared against `OPER_MODE_RESKIN` |
| `custom_login` | fn | `auth_login.php` | `OPER_MODE_NATIVE` | Used, compared against `OPER_MODE_RESKIN` |
| `custom_logout_message` | fn | `logout.php` | `OPER_MODE_NATIVE` | Used, compared against `OPER_MODE_RESKIN` |
| `custom_password` | fn | `auth_changepassword.php` | `OPER_MODE_NATIVE` | Used, compared against `OPER_MODE_RESKIN` |
| `custom_version_info` | fn | `utilities.php`, technical support page | Nothing | Discarded |
| `customize_graph` | fn | `graph_view.php` and `graphs.php` list rows, for non-templated graphs only | One graph row | Used |
| `customize_template_details` | fn | `graph_view.php` and `graphs.php` list rows, for non-templated graphs only | Graph template details array | Used |
| `data_input_sql_where` | fn | `data_input.php`, list filter | SQL `WHERE` fragment | Used |
| `data_source_action_array` | fn | `data_sources.php`, action dropdown | Action array, id => label | Used |
| `data_source_action_bottom` | fn | `data_sources.php`, after actions run | `array(<drp_action>, <selected_items>)` | Discarded |
| `data_source_action_execute` | fn | `data_sources.php`, for an unrecognised action | The `drp_action` value | Discarded |
| `data_source_action_prepare` | fn | `data_sources.php`, action confirmation form | `array('drp_action', 'ds_list', 'ds_array')` | Discarded |
| `data_source_edit_bottom` | hook | `data_sources.php`, end of the edit form | Nothing | Discarded |
| `data_source_edit_top` | hook | `data_sources.php`, start of the edit page after input validation | Nothing | Discarded |
| `data_source_remove` | fn | `lib/api_data_source.php` `api_data_source_remove()` and `api_data_source_remove_multi()` | Array of `local_data_id` | Discarded |
| `data_source_to_poller_items` | fn | `lib/utility.php` `update_poller_cache()`, for an unhandled input type | `array('poller_items', 'data_source', 'data_input')` | Used, when the returned `poller_items` is an array larger than the current one |
| `data_sources_table` | fn | `data_sources.php`, per list row | One data source row | Used |
| `device_action_array` | fn | `host.php`, action dropdown | Action array, id => label | Used |
| `device_action_bottom` | fn | `host.php`, after actions run | `array(<drp_action>, <selected_items>)` | Discarded |
| `device_action_execute` | fn | `host.php`, for an unrecognised action | The `drp_action` value | Discarded |
| `device_action_prepare` | fn | `host.php`, action confirmation form | `array('drp_action', 'host_list', 'host_array')` | Discarded |
| `device_change_javascript` | hook | `host.php`, inside the edit page's script block | Nothing | Discarded |
| `device_display_text` | fn | `host.php`, device list columns | Column array, key => `array('display', 'align', 'sort', 'tip')` | Used |
| `device_edit_pre_bottom` | hook | `host.php`, before the edit form closes | Nothing | Discarded |
| `device_edit_top_links` | hook | `host.php`, edit page link row | Nothing | Discarded |
| `device_filter_end` | hook | `host.php`, end of the filter box | Nothing | Discarded |
| `device_filter_start` | hook | `host.php`, start of the filter box | Nothing | Discarded |
| `device_filters` | fn | `host.php`, request variable validation | Filter definition array passed to `validate_store_request_vars()` | Used |
| `device_remove` | fn | `lib/api_device.php` `api_device_remove()` and `api_device_remove_multi()` | Array of device ids | Discarded |
| `device_sql_where` | fn | `host.php` `get_device_records()` | SQL `WHERE` fragment | Used |
| `device_table_bottom` | hook | `host.php`, after the device table | Nothing | Discarded |
| `device_table_replace` | fn | `host.php`, only when `device_display_text` changed the column count | The device rows | Discarded |
| `device_template_change` | fn | `lib/api_device.php` `api_device_update_host_template()` | `array('device_id', 'device_template_id')` | Discarded |
| `device_template_edit` | hook | `host_templates.php`, edit form | Nothing | Discarded |
| `device_template_top` | hook | `host_templates.php`, top of the page | Nothing | Discarded |
| `device_top` | hook | `host.php`, after the action array is built | Nothing | Discarded |
| `draw_navigation_text` | fn | `lib/functions.php` `draw_navigation_text()` | The global `$navigation` array | Used |
| `expand_title` | fn | `lib/variables.php` `expand_title()` | `array('host_id', 'snmp_query_id', 'snmp_index', 'title')` | Used, the `title` key only |
| `export_action` | fn | `lib/export.php` `get_item_xml()`, for an unknown dependency type | `array('dep_id', 'dep_type', 'xml_text')` | Used, the `xml_text` key only |
| `fgc_contextoption` | fn | `lib/functions.php` `get_default_contextoption()` | Stream context option array | Used |
| `get_friendly_name` | fn | `lib/import.php` `hash_to_friendly_name()`, for an unknown type | `array('hash', 'type', 'prepend')` | Discarded. The caller then reads its own unmodified `$param['prepend']`, so a plugin cannot change the result |
| `get_template_account` | fn | `lib/functions.php` `get_template_account()` | User id | Used. A return equal to the input is treated as no plugin present |
| `global_settings_update` | fn | `settings.php`, after settings are saved | Nothing | Discarded |
| `graph` | fn | `graph.php`, before any output | Nothing | Discarded |
| `graph_buttons` | hook | `graph.php` in the `view` and `zoom` actions, and `lib/html.php` `graph_drilldown_icons()` at its default `$type` | `array('hook', 'local_graph_id', 'rra', 'view_type')`, with `tree_id` and `branch_id` added from `graph_drilldown_icons()` | Discarded |
| `graph_buttons_thumbnails` | hook | `lib/html.php` `graph_drilldown_icons()`, when called from the thumbnail area with that `$type` | `array('hook', 'local_graph_id', 'rra', 'view_type', 'tree_id', 'branch_id')` | Discarded |
| `graph_edit_after` | fn | `graphs.php`, end of the edit page | The `id` request variable, or nothing when there is no `id` | Discarded |
| `graph_image` | fn | `graph_image.php` and `graph_json.php`, before rendering | Nothing | Discarded |
| `graph_items_remove` | fn | `data_sources.php`, before data template items are deleted | `data_template_rrd` ids rekeyed `id => id` | Discarded |
| `graph_tree_page_buttons` | fn | `lib/html_tree.php` `grow_right_pane_tree()` | `array('treeid', 'leafid', 'mode', 'timespan', 'starttime', 'endtime')` | Discarded |
| `graphs_action_array` | fn | `graphs.php`, action dropdown | Action array, id => label | Used |
| `graphs_action_bottom` | fn | `graphs.php`, after actions run | `array(<drp_action>, <selected_items>)` | Discarded |
| `graphs_action_execute` | fn | `graphs.php`, for an unrecognised action | The `drp_action` value | Discarded |
| `graphs_action_prepare` | fn | `graphs.php`, action confirmation form | `array('drp_action', 'graph_list', 'graph_array')` | Discarded |
| `graphs_item_array` | fn | `graphs.php`, graph item list | The graph item rows | Used |
| `graphs_new_top_links` | hook | `graphs_new.php`, link row | Nothing | Discarded |
| `graphs_remove` | fn | `lib/api_graph.php` `api_graph_remove()` and `api_graph_remove_multi()` | Array of `local_graph_id` | Discarded |
| `graphs_sql_where` | fn | `graphs.php`, list filter | SQL `WHERE` fragment | Used |
| `help_page` | fn | `lib/html.php` `html_help_page()` | Array of page => help file name | Used |
| `hmib_get_cpu` | fn | `scripts/ss_host_cpu.php` | `array('host_id', 'arg', 'index')` | Used |
| `hmib_get_cpu_indexes` | fn | `scripts/ss_host_cpu.php`, three call sites | `array('host_id')` | Used |
| `hmib_get_disk` | fn | `scripts/ss_host_disk.php` | `array('host_id', 'arg', 'index')` | Used |
| `host_edit_bottom` | hook | `host.php`, bottom of the edit page | Nothing | Discarded |
| `host_edit_top` | hook | `host.php`, top of the edit page | Nothing | Discarded |
| `host_save` | fn | `host.php`, after a device is saved | `array('host_id')` | Discarded |
| `import_action` | fn | `lib/import.php` `import_xml_data()`, for an unknown type | `array('hash', 'xml_array', 'hash_cache', 'type', 'version')` | Used, the `hash_cache` key is merged into the caller's cache |
| `is_console_page` | fn | `lib/html.php` `is_console_page()` | The URL | Used. Any return differing from the input marks the URL a console page |
| `login_after` | hook | `auth_login.php`, after the form | Nothing | Discarded |
| `login_before` | fn | `auth_login.php`, inside the form | `array('error', 'error_msg', 'username', 'user_enabled', 'action')` | Discarded |
| `login_options_navigate` | fn | `lib/auth.php` `auth_login_redirect()`, for an unrecognised `login_opts` | The `login_opts` value | Discarded |
| `login_process` | fn | `lib/auth.php` `local_auth_login_process()` | `false` | Used as a gate. A true return skips the built-in password check |
| `login_realms` | fn | `auth_login.php`, when `auth_method` is 3 | Realm array, id => `array('name', 'selected')` | Used |
| `login_title` | fn | `auth_login.php`, page header | Default title string | Used |
| `logout_post_session_destroy` | hook | `logout.php`, after the session is destroyed | Nothing | Discarded |
| `logout_pre_session_destroy` | hook | `logout.php`, before the session is destroyed | Nothing | Discarded |
| `nav_login_after` | hook | `lib/functions.php` `draw_login_status()`, two call sites | Nothing | Discarded |
| `nav_login_before` | hook | `lib/functions.php` `draw_login_status()`, two call sites | Nothing | Discarded |
| `page_bottom` | hook | `include/bottom_footer.php` | Nothing | Discarded |
| `page_buttons` | fn | `graph.php`, `view` action | `array('lgid', 'leafid', 'mode', 'rraid')` | Discarded |
| `page_head` | hook | `lib/html.php` `html_common_header()`, end of the document head | Nothing | Discarded |
| `page_title` | fn | `include/top_header.php`, `include/top_graph_header.php`, `include/top_general_header.php` | `draw_navigation_text('title')` | Used |
| `poller_bottom` | hook | `poller.php`, three call sites: the end of each polling loop, and once in each branch of the final block | Nothing | Discarded |
| `poller_exiting` | fn | `poller.php`, when `MAX_POLLER_RUNTIME` is exceeded and the poller is about to exit | Nothing | Discarded |
| `poller_finishing` | hook | `poller.php`, once per run, when every scheduled poller process has finished | Nothing | Discarded |
| `poller_output` | fn | `lib/poller.php` `process_poller_output()`, before the RRD update | The RRD update array | Discarded |
| `poller_remote_maint` | hook | `poller_maintenance.php`, when `poller_id > 1` | Nothing | Discarded |
| `poller_top` | hook | `poller.php`, twice: before the polling loop, and at the top of each later iteration after the sleep | Nothing | Discarded |
| `remote_agent` | fn | `remote_agent.php`, for an unrecognised action | The `action` request variable | Used as a gate. A false return prints `Unknown Agent Request` |
| `replicate_out` | fn | `lib/api_device.php` `api_device_replicate_out()` and `lib/poller.php` `replicate_out()` | `array('remote_poller_id', 'rcnn_id', 'class')`. `class` is `all` from the first site | Discarded |
| `resolve_dependencies` | fn | `lib/export.php` `resolve_dependencies()`, for an unknown type | `array('type', 'id', 'dep_array')` | Used, the `dep_array` key only |
| `rrd_graph_graph_options` | fn | `lib/rrd.php` `rrdtool_function_graph()`, before the command runs | `array('graph_opts', 'graph_defs', 'txt_graph_items', 'graph_id', 'start', 'end')` | Used |
| `run_data_query` | fn | `lib/data_query.php` `run_data_query()`, four call sites | `array('host_id', 'snmp_query_id')` at three sites; `array('result', 'host_id', 'snmp_query_id')` at the unknown-type site | Discarded at three sites. Used at the unknown-type site, the `result` key only |
| `settings_bottom` | hook | `settings.php`, bottom of the page | Nothing | Discarded |
| `snmpagent_cache_install` | hook | `lib/snmpagent.php` `snmpagent_cache_install()` | Nothing | Discarded |
| `substitute_host_data` | fn | `lib/variables.php` `substitute_host_data()` | `array('string', 'l_escape_string', 'r_escape_string', 'host_id')` | Used, the `string` key only. The caller indexes the return without checking it, so a plugin that returns something else is a fatal error |
| `top_graph_header_tabs` | hook | `lib/html.php` `html_show_tabs_left()`, two call sites | Nothing | Discarded |
| `top_graph_jquery_function` | fn | `lib/html_tree.php` `grow_dhtml_trees()` | Nothing | Used, printed into the page |
| `top_graph_refresh` | fn | `include/global_session.php` | `read_user_setting('page_refresh')` on graph pages, the current `$refresh` on plugin pages | Used |
| `tree_after` | fn | `lib/html_tree.php` `grow_right_pane_tree()`, when a leaf is selected | String, the host name and leaf id joined by a comma | Discarded |
| `tree_view_page_end` | fn | `graph.php` and `lib/html_tree.php` `grow_right_pane_tree()` | Nothing | Discarded |
| `update_data_source_title_cache` | fn | `lib/variables.php` `update_data_source_title_cache()`, two call sites | `local_data_id` | Discarded |
| `user_admin_action` | fn | `user_admin.php`, for an unrecognised action | The `action` request variable | Used as a gate. A false return runs the built-in page |
| `user_admin_edit` | fn | `user_admin.php`, user edit page | User id, or 0 for a new user | Discarded |
| `user_admin_run_action` | fn | `user_admin.php`, for an unrecognised tab | The `tab` request variable | Used as a gate. A true return also renders the realms editor |
| `user_admin_setup_sql_save` | fn | `user_admin.php`, before `sql_save()` | The `user_auth` row about to be saved | Used |
| `user_admin_tab` | hook | `user_admin.php`, tab row | Nothing | Discarded |
| `user_admin_user_save` | hook | `user_admin.php`, after a user is saved | Nothing | Discarded |
| `user_group_admin_action` | fn | `user_group_admin.php`, for an unrecognised action | The `action` request variable | Used as a gate |
| `user_group_admin_edit` | fn | `user_group_admin.php`, group edit page | Group id, or 0 for a new group | Discarded |
| `user_group_admin_run_action` | fn | `user_group_admin.php`, for an unrecognised tab | The `tab` request variable | Used as a gate |
| `user_group_admin_save` | hook | `user_group_admin.php`, after a group is saved | Nothing | Discarded |
| `user_group_admin_setup_sql_save` | fn | `user_group_admin.php`, before `sql_save()` | The `user_auth_group` row about to be saved | Used |
| `user_group_admin_tab` | hook | `user_group_admin.php`, tab row | Nothing | Discarded |
| `user_group_remove` | fn | `user_group_admin.php`, per group being deleted | Group id | Discarded |
| `user_remove` | fn | `lib/auth.php` `user_remove()` | User id | Discarded |
| `utilities_action` | fn | `utilities.php`, for an unrecognised action | The `action` request variable | Used as a gate. A false return runs the built-in page |
| `utilities_array` | hook | `utilities.php`, before the utilities list is rendered | Nothing | Discarded |
| `utilities_list` | hook | `utilities.php`, after the utilities list | Nothing | Discarded |
| `utilities_tab` | hook | `utilities.php`, technical support page tab row | Nothing | Discarded |
| `valid_host_fields` | fn | `include/global_form.php` | The default alternation string `(hostname\|host_id\|location\|snmp_community\|...)` | Used |

### Names with no dispatch site

Three hook names appear in the remote-capability maps in `lib/plugins.php` but are
not dispatched anywhere in 1.2.x. Registering against them does nothing.

| Name | Appears in |
|---|---|
| `top_header` | `api_plugin_run_plugin_hook_function()` capability map |
| `top_graph_header` | `api_plugin_run_plugin_hook_function()` capability map |
| `update_host_status` | `api_plugin_run_plugin_hook()` capability map |

The map in `api_plugin_run_plugin_hook()` also lists `page_head` twice, once at the
start and once at the end. Both entries carry the same value, so the duplicate has
no effect.

### The built-in registrations

Two rows ship in `cacti.sql` under the plugin name `internal`, with an empty `file`
column because the functions live in `lib/plugins.php`.

| Hook | Function |
|---|---|
| `config_arrays` | `plugin_config_arrays()` |
| `draw_navigation_text` | `plugin_draw_navigation_text()` |

`internal` is exempt from the file include step in both dispatchers.

## Realms

A realm is a named permission tied to one or more filenames. `plugin_realms.id + 100`
is the realm id, which is why plugin realms start at 101.

```php
api_plugin_register_realm($plugin, $file, $display, $admin = true)
```

| Argument | Meaning |
|---|---|
| `$file` | One filename, or several separated by commas. Every listed file is gated by this realm. |
| `$display` | Text shown in the user and group permission editors. |
| `$admin` | When true, the realm is granted immediately to the `admin_user` setting's account and to the session user. |

The function first looks for an existing realm for this plugin matching any of the
listed filenames. One match updates that row's `display` and `file`. More than one
match logs

```
WARNING: Registering Realm for Plugin <plugin> and Filenames <file> is ambiguous.
Using first matching Realm.  Contact the plugin owner to resolve this issue.
```

and then merges the extras into the first, moving `user_auth_realm` and
`user_auth_group_realm` rows across. No match inserts a new row.

### How a page is gated

`api_plugin_load_realms()` runs from `plugin_config_arrays()` on the `config_arrays`
hook. It reads `plugin_realms` and fills two globals: `$user_auth_realm_filenames`,
mapping each filename to its realm id, and `$user_auth_realms`, mapping each realm id
to its display text.

`include/auth.php` then looks up `get_current_page()` in
`$user_auth_realm_filenames` and refuses the request when the user does not hold that
realm. A plugin page gets its permission check by including `./include/auth.php` and
having registered a realm naming that file. There is no per-page call to make.

Two helpers are available inside a page:

```php
api_plugin_user_realm_auth($filename = '')   // true when the current user holds the realm for that file
api_user_realm_auth($filename = '')          // thin wrapper on the same
```

Both `basename()` the argument before the lookup, then call `is_realm_allowed()`.

`api_plugin_remove_realms($plugin)` deletes the plugin's realms along with every
`user_auth_realm` and `user_auth_group_realm` row pointing at them. See
[Realms and permissions](/1.2.31/reference/realms-and-permissions/) for the core realm list.

## Database helpers

```php
api_plugin_db_table_create($plugin, $table, $data)
api_plugin_db_add_column($plugin, $table, $column)
api_plugin_drop_table($table)
api_plugin_db_changes_remove($plugin)
```

Both creation helpers record what they did in `plugin_db_changes`, with `method`
set to `create` or `addcolumn`. That table is what makes an uninstall able to undo
schema changes without the plugin's cooperation.

`api_plugin_db_table_create()` checks `db_is_safe_identifier($table)`, returns
silently on a bad name, and does nothing when the table already exists. `$data` is
passed to `db_table_create()` in `lib/database.php`:

| Key | Required | Shape |
|---|---|---|
| `columns` | Yes | Array of column definitions |
| `type` | Yes | Storage engine, validated by `db_is_safe_table_option()` |
| `primary` | No | Column name or array of names |
| `keys` | No | Array of `array('name', 'columns')` |
| `unique_keys` | No | Same shape as `keys` |
| `comment` | No | Rejected if it contains control characters |
| `charset`, `collate`, `row_format` | No | Validated by `db_is_safe_table_option()` |

A column definition:

```php
array(
    'name'           => 'id',
    'type'           => 'mediumint(8)',
    'unsigned'       => true,
    'NULL'           => false,
    'auto_increment' => true,
)
```

`db_is_safe_column_definition()` requires `name` to match `^[A-Za-z0-9_]+$` and
`type` to pass `db_is_safe_column_type()`. `after` must be a safe identifier,
`on_update` must be exactly `CURRENT_TIMESTAMP`, and `default` and `comment` must be
free of control characters. Anything else makes the whole create or alter return
`false`.

`api_plugin_db_add_column()` takes one such definition, checks the column is not
already present with `SHOW COLUMNS`, and records an `addcolumn` row.

`api_plugin_drop_table()` drops the table on the local database and then on every
remote poller through `api_plugin_drop_remote_table()`. It does not clear the
`plugin_db_changes` row.

`api_plugin_db_changes_remove()` replays the recorded changes in reverse: every
`create` row is dropped locally and remotely, then every `addcolumn` row is dropped
with `ALTER TABLE ... DROP`. Both sets of rows are then deleted.

## Lifecycle

| Action | Function | Effect |
|---|---|---|
| Install | `api_plugin_install()` | Checks dependencies, includes `setup.php`, reads `plugin_<dir>_version()`, replaces the `plugin_config` row, runs `plugin_<dir>_install()`, then sets status to 4 or 2 depending on `api_plugin_check_config()` |
| Enable | `api_plugin_enable()` | Runs `api_plugin_check_config()`. On success sets every `plugin_hooks` row for the plugin to status 1 and `plugin_config.status` to 1. On failure nothing changes |
| Disable | `api_plugin_disable()` | Sets `plugin_hooks.status` to 4 for every hook except `config_settings`, `config_arrays` and `config_form`, and `plugin_config.status` to 4 |
| Uninstall | `api_plugin_uninstall()` | Includes `setup.php`, runs `plugin_<dir>_uninstall()`, deletes hooks, realms, the `plugin_config` row, and by default the recorded schema changes |

Status values, from the management page's list:

| Status | Name |
|---|---|
| `-5` | Plugin directory missing |
| `-4` | No `INFO` file |
| `-3` | Directory name contains a space |
| `-2` | Directory name does not match `INFO`'s `name` |
| `-1` | Not Compatible |
| `0` | Not Installed |
| `1` | Active |
| `2` | Awaiting Configuration |
| `3` | Awaiting Upgrade |
| `4` | Installed |

### What survives a disable

Disable changes two things: the hook rows' status, and the plugin's own status.
Nothing else is touched.

| State | Survives disable | Survives uninstall |
|---|---|---|
| `plugin_config` row, including installed version | Yes | No |
| `plugin_hooks` rows | Yes, at status 4 | No |
| `config_settings`, `config_arrays`, `config_form` hooks | Yes, still at status 1 | No |
| `plugin_realms` rows | Yes | No |
| Realm grants in `user_auth_realm` and `user_auth_group_realm` | Yes | No |
| Tables created through `api_plugin_db_table_create()` | Yes | No, unless uninstalled with `$tables = false` |
| Columns added through `api_plugin_db_add_column()` | Yes | No, same exception |
| Rows the plugin wrote to core tables | Yes | Yes. Nothing removes them |
| Settings the plugin registered through `config_settings` | Yes | Yes, the `settings` rows are not cleaned up |

A disabled plugin keeps its three configuration hooks live, so its settings pages and
menu entries can still appear. That is deliberate: those three are inserted enabled
by `api_plugin_register_hook()` and exempted by name from `api_plugin_disable_hooks()`.

`api_plugin_disable_hooks_all()` sets every hook including those three to status 0.
It is reached from `api_plugin_disable_all()`, which the management page does not
call.

Uninstall protection is one-directional. `plugin_required_for_others()` blocks the
uninstall of a plugin whose directory name appears in another installed plugin's
`requires`. Disable has no such check.

## Version and compatibility

Two version declarations, read from different places, used for different things.

| Declaration | Source | Used for |
|---|---|---|
| Plugin version | `plugin_<dir>_version()`, written to `plugin_config.version` at install | Dependency checks by `api_plugin_minimum_version()` |
| Plugin version, displayed | `INFO`'s `version` | The management page only |
| Minimum core version | `INFO`'s `compat` | `plugin_is_compatible()` and the status calculation |

`plugin_is_compatible()` returns `array('compat' => false, 'requires' => 'Legacy Plugin')`
when the `INFO` file cannot be loaded, and otherwise compares `CACTI_VERSION`
against `compat`. A plugin with no `compat` field is treated as incompatible.

Dependency versions are compared with `cacti_version_compare($version, $plugin_version, '<=')`,
against the dependency's `plugin_config.version`. A dependency listed without a
version passes the version test unconditionally and is checked only for being
installed.

There is no maximum version declaration and no per-hook versioning. A plugin's whole
compatibility statement is the one `compat` value.

## Tables

| Table | Holds |
|---|---|
| `plugin_config` | One row per installed plugin: `directory`, `name`, `status`, `author`, `webpage`, `version`. `id` is the dispatch order |
| `plugin_hooks` | One row per registered hook: `name` (the plugin directory), `hook`, `file`, `function`, `status` |
| `plugin_realms` | One row per realm: `plugin`, `file`, `display`. Realm id is `id + 100` |
| `plugin_db_changes` | One row per recorded schema change: `plugin`, `table`, `column`, `method` |

`plugin_clean_old_plugin_info()` deletes hook, schema-change and realm rows whose
plugin has no `plugin_config` row, sparing `internal`.

## Integrated plugins

`include/plugins.php` defines `$plugins_integrated`, a list of plugin names whose
function is built into the core:

```
snmpagent, clog, settings, boost, dsstats, watermark, ssl, ugroup, domains,
jqueryskin, secpass, logrotate, realtime, rrdclean, nectar, aggregate, autom8,
discovery, spikekill, superlinks, debug
```

Both dispatchers skip any plugin whose name is on that list, and the management page
refuses to install, enable, or reorder one. A new plugin must not reuse any of these
directory names.
