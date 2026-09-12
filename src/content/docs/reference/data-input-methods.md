---
title: Data input methods
description: The six ways Kadupul collects a value, the input and output fields each one takes, and the output each one must return.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 10
---

A data input method describes how one value reaches a data source. It is a row in
`data_input` with a type, an input string, and a set of `data_input_fields` rows
split into inputs and outputs.

## Types

Constants are defined in `include/global_constants.php`. Names are from
`$input_types` in `include/global_arrays.php`.

| id | Constant | Name | Poller action |
|---|---|---|---|
| 1 | `DATA_INPUT_TYPE_SCRIPT` | Script/Command | `POLLER_ACTION_SCRIPT` (1) |
| 2 | `DATA_INPUT_TYPE_SNMP` | SNMP Get | `POLLER_ACTION_SNMP` (0) |
| 3 | `DATA_INPUT_TYPE_SNMP_QUERY` | SNMP Query | `POLLER_ACTION_SNMP` (0) |
| 4 | `DATA_INPUT_TYPE_SCRIPT_QUERY` | Script Query | `POLLER_ACTION_SCRIPT` (1) |
| 5 | `DATA_INPUT_TYPE_PHP_SCRIPT_SERVER` | Script Server | `POLLER_ACTION_SCRIPT_PHP` (2) |
| 6 | `DATA_INPUT_TYPE_QUERY_SCRIPT_SERVER` | Script Server Query | `POLLER_ACTION_SCRIPT_PHP` (2) |

Only types 1 and 5 can be created in the interface. The `type_id` dropdown on
`data_input.php` is populated from `$input_types_script`, which holds those two.
When an existing method has another type, `data_edit()` adds that one type back to
the dropdown so the method can be opened without changing it.

Types 3, 4 and 6 are driven by a data query XML file, not by the method's own
input string. Types 2, 3, 4 and 6 are represented by four system methods whose
hashes are listed in `$hash_system_data_inputs`:

| Hash | Name | Type |
|---|---|---|
| `3eb92bb845b9660a7445cf9740726522` | Get SNMP Data | 2 |
| `bf566c869ac6443b0c75d1c32b5a350e` | Get SNMP Data (Indexed) | 3 |
| `80e9e4c4191a5da189ae26d0e237f015` | Get Script Data (Indexed) | 4 |
| `332111d8b54ac8ce939af87a7eac0c06` | Get Script Server Data (Indexed) | 6 |

`get_nonsystem_data_input()` refuses to open any method with one of these hashes
for editing.

## Fields

One row per field in `data_input_fields`.

| Column | Meaning |
|---|---|
| `data_name` | Name used in the input string and in script output. Max 50 chars. |
| `name` | Friendly name shown in forms. Max 200 chars. |
| `input_output` | `in` or `out`. |
| `update_rra` | Output fields only. `on` means the value is written to the RRD file. |
| `sequence` | Order of occurrence in the input string. `0` means not in use. |
| `type_code` | Input fields only. Marks the field as a device field. |
| `regexp_match` | Input fields only. `preg_match` pattern the entered value must satisfy. |
| `allow_nulls` | Input fields only. `on` permits an empty value. |

The field edit form drops `update_rra` for input fields, and drops
`regexp_match`, `allow_nulls` and `type_code` for output fields.

For type 1 and type 5 methods, the input field name is a dropdown, not a textbox.
The choices come from parsing `<name>` markers out of the method's `input_string`
with `/<([_a-zA-Z0-9]+)>/` and discarding anything listed in
`$registered_cacti_names`, which contains only `path_cacti`. For every other case
the name is a free textbox.

## Input string

The input string is the command line, with input field values in angle brackets.

```
perl <path_cacti>/scripts/unix_users.pl <username>
```

`get_full_script_path()` builds the executable string per data source:

1. Each `<data_name>` is replaced with that data source's stored value, passed
   through `cacti_escapeshellarg()`. An empty value becomes `''`.
2. `<path_cacti>`, `<path_snmpget>` and `<path_php_binary>` are replaced with
   `$config['base_path']`, the `path_snmpget` setting and the `path_php_binary`
   setting.
3. Any `<...>` marker still left is stripped by
   `preg_replace('/(<[A-Za-z0-9_]+>)+/', '', ...)`.

It returns `false` for types 2 and 3, which have no path.

On save, `cacti_input_string_is_safe()` strips every `<name>` marker (bare, or
wrapped in single or double quotes) and then inspects what remains. A bare `<` or
`>` is rejected unconditionally. The remaining set is rejected unless the
`allow_unsafe_metachars` setting is `on`:

```
[;&|`$\<newline><carriage return>'"<>(){}]
```

Input strings are capped at 255 characters by the form.

## Special type codes (device fields)

An input field whose `type_code` matches one of these is filled from the device
record rather than typed per data source. The list is `VALID_HOST_FIELDS` in
`include/global_form.php`, and plugins may extend it through the
`valid_host_fields` hook.

```
hostname, host_id, location, snmp_community, snmp_username, snmp_password,
snmp_auth_protocol, snmp_priv_passphrase, snmp_priv_protocol, snmp_context,
snmp_engine_id, snmp_version, snmp_port, snmp_timeout, external_id
```

Saving an input field whose `data_name` matches one of these names while
`type_code` is empty is a validation error. The form says the field requires the
matching special type code.

The system SNMP methods also use codes outside that list: `snmp_oid` on
Get SNMP Data, and `index_type`, `index_value` and `output_type` on the indexed
methods. These are read by name elsewhere and are not covered by the
`VALID_HOST_FIELDS` check.

### How the poller cache picks them up

`update_poller_cache()` in `lib/utility.php` collects device fields with

```sql
WHERE (type_code LIKE "snmp_%" OR type_code IN("hostname", "host_id"))
```

once against the data source's own `data_template_data_id` and once against the
parent template's. The data source values win; template values fill gaps. The
merged set is passed to `api_poller_cache_item_add()` as `$host_field_override`,
where it is merged over the row read from `host`. So a populated special field
overrides the device's own column for that one poller item.

`api_poller_cache_item_add()` returns nothing for a disabled device. For
`POLLER_ACTION_SNMP` it also returns nothing when `host_id` is 0, when
`snmp_version` is outside 1 to 3, or when the community is empty on a version
other than 3.

## Variable substitution elsewhere

These run on titles and other display strings, not on the poller command line.
They are in `lib/variables.php`.

| Function | Marker | Source |
|---|---|---|
| `substitute_host_data()` | `\|host_<column>\|` | The `host` row plus the joined site name. |
| `substitute_snmp_query_data()` | `\|query_<field>\|` | `host_snmp_cache` for that device, query and index. |
| `substitute_data_input_data()` | `\|input_<data_name>\|` | `data_input_data` values for the data source's input fields. |
| `substitute_script_query_path()` | `\|path_cacti\|`, `\|path_php_binary\|` | `$config['base_path']` and the `path_php_binary` setting. |

`substitute_host_data()` recognises `host_id`, `host_hostname`,
`host_description`, `host_site`, `host_notes`, `host_location`,
`host_polling_time`, `host_avg_time`, `host_cur_time`, `host_availability`,
`host_uptime`, `host_snmp_community`, `host_snmp_version`, `host_snmp_username`,
`host_snmp_password`, `host_snmp_auth_protocol`, `host_snmp_priv_passphrase`,
`host_snmp_priv_protocol`, `host_snmp_context`, `host_snmp_engine_id`,
`host_snmp_port`, `host_snmp_timeout`, `host_snmp_sysDescr`,
`host_snmp_sysObjectID`, `host_snmp_sysContact`, `host_snmp_sysLocation`,
`host_snmp_sysName`, `host_snmp_sysUpTimeInstance`, `host_ping_retries`,
`host_max_oids` and `host_external_id`. `host_management_ip` is kept as an alias
of `host_hostname`.

The escape characters are arguments, so the same function serves both `|name|`
display strings and the `|name|` markers in a data query's script arguments.

## Output contract

The poller reads one line. `exec_poll()` takes `fgets($fp, 8192)` from a `popen`
handle; `exec_poll_php()` takes `fgets($pipes[1], 8192)` from the script server.
Anything after the first line is discarded.

### Single value

A bare number, or `U` for unknown. `prepare_validate_result()` also accepts a
hexadecimal string and converts it with `hexdec()`. Anything else is passed
through `strip_alpha()`, and a failure there makes the poller substitute `U` and
record the data source in its error list.

### Multiple values

Space separated `name:value` pairs, where each name is an output field's
`data_name`.

```
users:14 load:0.42 procs:198
```

`prepare_validate_result()` accepts `:` or `!` as the separator and requires the
delimiter count to equal the space count plus one. `process_poller_output()` then
splits on whitespace, splits each token on `:`, and maps the name to a
`data_template_rrd.data_source_name`. A value that is neither numeric nor `U`
nor hexadecimal becomes `U`. Unmapped names are dropped.

When the output has no `:` at all and the data source has more than one output
field, the poller writes `U` for every field and logs the expected form:

```
WARNING: Invalid output! MULTI DS[<id>] Encountered [<output>] Expected[<field>:value ...]
```

Only output fields with `update_rra = on` count toward the data source's field
count. `update_poller_cache()` counts them, and when exactly one exists it stores
that data source item's name on the poller item, which is what makes single value
output legal.

## Per type

### Script/Command (1)

`arg1` is the full path from `get_full_script_path()`. `cmd.php` runs it through
`exec_poll()`, which uses `popen()` where available and `shell_exec()` otherwise.

### Script Server (5)

`arg1` is the same string from `get_full_script_path()`, but it is written to the
script server's stdin rather than executed. `cmd.php` starts one server per run:

```
<path_php_binary> -q <base_path>/script_server.php --environ=cmd --poller=<id> --mode=<connection>
```

The server reads a line and splits it on spaces into three parts: the include
file, the function name, and everything else as parameters.

```
<script file> <function> <arg> <arg> ...
```

Parameters are parsed by `parseArgs()`, which honours single and double quotes
and backslash escaping. The server replies with one line: `trim($result)`, or
`U` on any failure. `exec_poll_php()` treats any reply containing `ERROR` as `U`.

The server rejects the call, answering `U`, when any of these hold:

| Check | Condition |
|---|---|
| Path containment | `realpath()` of the include file is not under `$config['base_path']` or `$config['scripts_path']`. |
| File | The resolved include file does not exist. |
| Function | `function_exists()` is false after the include. |
| Internal | `ReflectionFunction::isInternal()` is true. |
| Function source | The function's defining file is not under an allowed root. |
| Parse | `parseArgs()` cannot parse the parameter string. |

`quit` shuts the server down. It also exits once `MAX_POLLER_RUNTIME` seconds
have passed since start, and when it detects its parent process is gone.

When `proc_open()` is not in use, `exec_poll_php()` falls back to prefixing the
command with the `path_php_binary` setting and running it with `popen()`.

### SNMP Get (2)

No path. `arg1` is the `snmp_oid` special field's value. `cmd.php` calls
`cacti_snmp_session_get()` against a session opened from the poller item's own
SNMP columns. A non-numeric result goes through `prepare_validate_result()`; a
failure yields `U` and marks the data source.

### SNMP Query (3)

One poller item per output field. The OID comes from the data query XML:

```
<oid of the field>.<snmp_index>[.<oid_suffix>]
```

An output whose field has no `oid` in the XML produces no poller item. Each item
carries `num_rrd_items` equal to the number of outputs, so the poller expects
name/value output across the set.

### Script Query (4) and Script Server Query (6)

One poller item per output field. `arg1` is built by `get_script_query_path()`:

```
<script_path> <arg_prepend> <arg_get> <query_name> "<snmp_index>"
```

For type 6 the script path is the XML's `script_path` followed by its
`script_function`, matching the script server's include-then-function contract.

`get_script_query_path()` splits the argument string on whitespace and on quoted
runs, applies `substitute_host_data()` with `|` on both sides to each part, then
`cacti_escapeshellarg()`s it. The script path itself is put through
`substitute_script_query_path()` and rejected outright if it still contains `..`,
which is logged as

```
FATAL: Malicious path traversal detected in Data Query script path: <path>
```

and then `cacti_escapeshellcmd()`ed.

Reindexing uses the same builder with `arg_index` and `arg_num_indexes`, and
field discovery uses `arg_query` plus the field's `query_name`. Field output is
split on `output_delimeter` or `output_delimiter` (both spellings are accepted)
into index and value.

## Input whitelist

When `$input_whitelist` is set in `include/config.php`, the poller checks every
method through `data_input_whitelist_check()` before building poller items.

| State | Result |
|---|---|
| Setting absent | Everything is allowed. |
| Setting present, file missing | Nothing is allowed. |
| Setting present, file parsed | The method's hash must map to its current input string. |

A method that fails the check produces no poller items. On a commit pass, the
buffer flush still runs, so rows that used to pass are deleted rather than
stranded.

`data_input.php` shows the verification state on the edit form and warns when the
input string changes that `cli/input_whitelist.php` must be rerun with `--audit`
and `--update`.

## Editing consequences

`data_input_save_message()` counts the templates and data sources attached to a
method and raises a different message for each case. Output field editing is
disabled once any data source uses the method.
