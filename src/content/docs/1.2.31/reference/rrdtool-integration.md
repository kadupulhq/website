---
title: RRDtool integration
description: Which RRDtool subcommands Kadupul issues, how each command line is
  assembled and validated, the difference between pipe and per-command
  execution, and what changes with the configured RRDtool version.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 13
slug: 1.2.31/reference/rrdtool-integration
---

:::caution[Inherited RRDtool proxy behavior]
RRDtool proxy deployment is unsupported in Kadupul. Use local RRDtool storage
(`storage_location = 0`). Proxy settings, protocol descriptions and workflows
on this page document inherited behavior, not a supported deployment or migration
path. See [RRDtool proxy](/1.2.31/reference/rrdproxy/).
:::

All of it lives in `lib/rrd.php`. Inherited from Cacti 1.2.x.

## Subcommands issued

| Subcommand | Issued by | Purpose |
|---|---|---|
| `create` | `rrdtool_function_create()` | Build a new RRD file from the data source's profile. |
| `update` | `rrdtool_function_update()` | Write one sample set per timestamp. |
| `fetch` | `rrdtool_function_fetch()` | Read values back for the interface, dsstats and export. |
| `graph` | `rrdtool_function_graph()` | Render a graph. |
| `graphv` | `rrdtool_function_graph()` | Same, when the caller sets `graphv` and wants the metadata form. |
| `xport` | `rrdtool_function_graph()` | Produce the CSV and JSON exports. |
| `info` | `rrdtool_function_info()` | Read a file's structure for comparison against the database. |
| `dump` | `rrd_datasource_add()`, `rrd_rra_delete()`, `rrd_rra_clone()` | Get XML to edit before restoring. |
| `restore` | `rrdtool_execute_restore_command()` | Write a modified XML dump back to an RRD file. |
| `tune` | `rrdtool_function_tune()`, `rrdtool_tune()` | Change heartbeat, bounds, DS type, or rename a DS. |
| `resize` | `rrdtool_tune()` | Change an RRA's row count. |
| `last` | `rrdtool_execute_path_command('last', ...)` | Read a file's last update time. |

Five more verbs appear in the source but are not RRDtool subcommands. They are
understood only by the RRDtool proxy: `file_exists`, `is_dir`, `mkdir`, `unlink`
and `archive`. On a local install the equivalents are PHP's own `file_exists()`,
`is_dir()`, `mkdir()` and the maintenance code's own delete and move.

## Execution modes

`rrdtool_execute()` dispatches on the `storage_location` setting.

| `storage_location` | Name | Function |
|---|---|---|
| 0 | Local | `__rrd_execute()` |
| 1 | RRDtool Proxy Server | `__rrd_proxy_execute()` |

Setting `$config['force_storage_location_local'] = true` forces the local path
regardless. `rrd_init()` and `rrd_close()` dispatch the same way.

### Per-command execution

With no pipe open, `__rrd_execute()` starts one RRDtool process per command:

```
<path_rrdtool> -
```

It writes the command line followed by `\r\nquit\r\n` to the child's stdin,
closes stdin, and reads stdout. The trailing `quit` is what makes the process
exit, so every command costs a fork.

Before starting it, the function checks that `path_rrdtool` is both a file and
executable. When it is not, it logs

```
ERROR: RRDtool executable not found, not executable or error in path '<path>'.  No output written to RRDfile.
```

and returns nothing. Nothing else in the call chain treats that as fatal, so a
wrong `path_rrdtool` shows up as missing data rather than a crash.

### Pipe execution

A long-running process opens one RRDtool once and reuses it.

```php
$rrdtool_pipe = rrd_init();
// ... many rrdtool_execute(..., $rrdtool_pipe) calls ...
rrd_close($rrdtool_pipe);
```

`__rrd_init()` opens `popen("<path_rrdtool> - ", 'w')`, or with output
suppressed when `$output_to_term` is false: `> nul` on Windows,
`> /dev/null 2>&1` elsewhere. Every subsequent command is a line written into
that handle. Nothing is read back, so a pipe-mode command cannot return output.

Callers that use a pipe: `poller.php`, `poller_boost.php`,
`poller_maintenance.php`, `poller_realtime.php`, `rrdcleaner.php`,
`utilities.php`, `cli/poller_output_empty.php`, and the boost, dsstats and
rrdcheck libraries.

When a pipe write fails, `__rrd_execute()` assumes RRDtool has crashed:

```
ERROR: Detected RRDtool Crash on '<command>'.  Last command was '<last>'
```

It closes the pipe, calls `rrd_init()` for a fresh one, and retries. After five
attempts it gives up on that command with

```
FATAL: RRDtool Restart Attempts Exceeded. Giving up on '<command>'.
```

The retained `$last_command` exists for exactly this message, because the command
that segfaults RRDtool is usually the one before the one that fails to write.

### Proxy execution

`__rrd_proxy_init()` opens a TCP socket to `rrdp_server`:`rrdp_port`, or, when
`rrdp_load_balancing` is `on`, picks at random between the primary and
`rrdp_server_backup`:`rrdp_port_backup`. A connection failure falls through to
the other one.

The handshake exchanges RSA public keys, terminated by `_EOT_\r\n`. The proxy's
returned key is fingerprinted and compared against `rrdp_fingerprint` (or
`rrdp_fingerprint_backup`). A mismatch closes the socket and returns false.

The session then sends two control commands that are not RRDtool subcommands:
`setenv RRD_DEFAULT_FONT '<path>'` when `path_rrdtool_default_font` is set, and
`setcnn encryption off`. Whether the proxy accepts the second decides whether the
rest of the session is encrypted.

The payload encryption is RSA-OAEP with SHA-1 wrapping a 256-bit AES key, then
AES-CBC with an all-zero IV. The wire format is a three hex digit length, the
base64 RSA-wrapped key, and the base64 ciphertext. The implementation is on
phpseclib 3 but deliberately reproduces the phpseclib 2 wire format so existing
proxies keep working.

Closing sends an encrypted `quit` before shutting the socket.

## Command assembly

`RRD_NL` is `" \\\n"`: a space, a backslash, a newline. Commands are built as
multi-line strings joined with it. `__rrd_execute()` collapses them back with
`str_replace("\\\n", ' ', $command_line)` before sending, so the continuation is
for readability and for the print-source view, not for RRDtool.

Every command line is logged at `POLLER_VERBOSITY_DEBUG` as

```
CACTI2RRD: <path_rrdtool> <command line>
```

`rrdtool_execute()` also accepts an array. The first element is used verbatim and
every later element is passed through `cacti_escapeshellarg()` before being
joined with spaces.

### Output flags

The fourth constant family in `include/global_constants.php`.

| Constant | Value | Behaviour |
|---|---|---|
| `RRDTOOL_OUTPUT_NULL` | 0 | Return nothing. |
| `RRDTOOL_OUTPUT_STDOUT` | 1 | Read stdout and return it. |
| `RRDTOOL_OUTPUT_STDERR` | 2 | Read the merged stream and print it. |
| `RRDTOOL_OUTPUT_GRAPH_DATA` | 3 | Read stdout and return it. Used for image bytes. |
| `RRDTOOL_OUTPUT_BOOLEAN` | 4 | Proxy only. |
| `RRDTOOL_OUTPUT_RETURN_STDERR` | 5 | Read the merged stream and return it. |

`2` and `5` append `2>&1` to the command, but only on a non-Windows host and only
when no pipe is in use. A non-numeric flag falls back to `RRDTOOL_OUTPUT_STDOUT`.

Under those two flags the function recognises two success shapes: output whose
bytes 1 to 3 are `PNG` returns the string `OK`, and output starting `<?xml`
returns `SVG/XML Output OK`.

### Output trimming

`rrdtool_trim_output()` removes what RRDtool appends when driven through `-`,
where it merges stderr onto stdout for batch parsing. On Windows it right-trims
the characters `OK \n\r`. Elsewhere it truncates at the last occurrence of
`OK u:`.

## Validation before execution

Because commands go to RRDtool's stdin as text, a value containing a newline
would become a second command. These guards are in `lib/functions.php`.

| Function | Rule |
|---|---|
| `cacti_has_control_chars()` | Matches `[\x00-\x1F\x7F]`. |
| `cacti_rrdtool_valid_path()` | Non-empty string with no control characters. |
| `cacti_rrdtool_valid_path_token()` | The above, and no whitespace. |
| `cacti_rrdtool_valid_ds_name()` | `^[a-zA-Z0-9_-]{1,19}$`. |
| `cacti_rrdtool_valid_ds_template()` | Every colon-separated part is a valid DS name. |
| `cacti_rrdtool_valid_bound()` | `U`, or a decimal with optional sign and exponent. |

`rrdtool_build_path_command()` requires the verb to match `^[A-Za-z0-9_-]+$`, the
path to be a valid path token, and the suffix to be free of control characters.
It returns `false` rather than a command when any of those fail, and
`rrdtool_execute_path_command()` returns `false` without calling RRDtool.

`escape_command()` is a no-op that returns its argument. Escaping is done per
argument at the point each argument is built.

## create

`rrdtool_function_create()` will not overwrite. Unless called with
`$show_source`, it checks for an existing file first and returns `-1` when one is
there.

RRAs come from the data source profile. With none attached it logs

```
ERROR: There are no RRA's assigned to local_data_id: <id>.
```

and returns false.

The command is assembled as:

```
create <path> \
--start 0 --step <rrd_step> \
DS:<name>:<type>:<heartbeat>:<min>:<max> \
...
RRA:<cf>:<xff>:<steps>:<rows> \
...
```

DS types are `$data_source_types`: 1 GAUGE, 2 COUNTER, 3 DERIVE, 4 ABSOLUTE,
5 COMPUTE. When the configured RRDtool version is 1.5 or newer, 6 DCOUNTER and
7 DDERIVE are added. Consolidation functions are 1 AVERAGE, 2 MIN, 3 MAX,
4 LAST.

Maximum handling, in order:

| Case | Result |
|---|---|
| `U` | Left as `U`. |
| `\|query_ifSpeed\|` or `\|query_ifHighSpeed\|` | Replaced with the interface speed from `rrdtool_function_interface_speed()`. |
| Any other `\|query_*\|` | Resolved through `substitute_snmp_query_data()`. |
| Numeric and not greater than the minimum | `U` for GAUGE and ABSOLUTE, otherwise minimum plus 1. |
| Minimum and maximum both 0 | Maximum becomes `U`. |

When `extended_paths` is on, the parent directory is created first, with
`mkdir(..., 0775, true)` locally or the proxy's `mkdir` pseudo-command remotely.
A web request that cannot write to `rra/` logs a warning and leaves the directory
to the poller.

Running as root, the new file and every new directory under `rra/` are chowned
and chgrped to match `rra/` itself.

## update

One `update` per timestamp, per file:

```
update <path> [--skip-past-updates] --template <ds>:<ds>:... <time>:<value>:<value>:...
```

An empty timestamp becomes `N:`. A non-numeric timestamp is refused with

```
ERROR: Invalid RRD update time for local_data_id: <id>.
```

Values are normalised before they go out. A null, an empty string, or anything
non-numeric becomes `U`. A numeric value has `,` replaced with `.`, which sidesteps
`LC_NUMERIC` locale behaviour without truncating 64-bit counter precision. Data
source names not used by any graph are skipped.

The file is created on demand: when it does not exist, `update` calls
`rrdtool_function_create()` first.

## fetch

```
fetch <path> <cf> -s <start> -e <end> [-r <resolution>]
```

The consolidation function must be one of `AVERAGE`, `MIN`, `MAX`, `LAST`, and
both times must be numeric, or the function returns an empty array without
running anything. With `$resolution` at 0, `rrdtool_function_get_resstep()`
picks one.

The first output line is the data source names. Each later line is
`<timestamp>: <value> <value> ...`. `nan` and `-nan` in any case become `U` when
`$show_unknown` is set and are dropped otherwise.

`boost_fetch_cache_check()` runs first so a boost install flushes pending
updates into the file before it is read.

## graph and xport

`rrdtool_function_graph()` builds three strings and concatenates them:
`$graph_opts` (the switches), `$graph_defs` (DEF, CDEF and VDEF lines), and
`$txt_graph_items` (the drawing instructions). Which command runs depends on the
caller's `$graph_data_array`:

| Key set | Command | Output flag |
|---|---|---|
| `export_csv` | `xport` | `RRDTOOL_OUTPUT_STDOUT` |
| `get_error` | `graph` | `RRDTOOL_OUTPUT_STDERR` |
| `export` | `graph` | `RRDTOOL_OUTPUT_NULL` |
| `export_realtime` | `graph` | `RRDTOOL_OUTPUT_GRAPH_DATA`, also written to the named file at mode 0644 |
| `graphv` | `graphv` | `RRDTOOL_OUTPUT_GRAPH_DATA` unless overridden |
| none of the above | `graph` | `RRDTOOL_OUTPUT_GRAPH_DATA` unless overridden |
| `print_source` | none | The assembled command line is printed instead |

`print_source` also reports the command length in characters, and warns when a
Windows host exceeds 8191.

The plugin hook `rrd_graph_graph_options` can rewrite all three strings before
execution.

`rrdtool_escape_string()` escapes `"` and `:` for RRDtool text arguments, and
`%` as well when called with `$ignore_percent` false.

## Version-dependent behaviour

The configured version is `get_rrdtool_version()`, which reads the
`rrdtool_version` setting and normalises it: `rrd-` prefix stripped and a
trailing `.x` turned into `.0`. Default `1.4.0`.

| Setting value | Label |
|---|---|
| `1.3.0` | RRDtool 1.3+ |
| `1.4.0` | RRDtool 1.4+ |
| `1.5.0` | RRDtool 1.5+ |
| `1.6.0` | RRDtool 1.6+ |
| `1.7.0` | RRDtool 1.7+ |
| `1.7.1` | RRDtool 1.7.1+ |
| `1.7.2` | RRDtool 1.7.2+ |
| `1.8.0` | RRDtool 1.8+ |

What the value changes:

| Version | Effect |
|---|---|
| 1.3 and newer, strictly greater | The watermark font option is emitted. |
| 1.4 and newer | `--legend-position`, `--legend-direction`, `--left-axis-formatter`, `--right-axis-formatter` and `--border` are emitted. Below 1.4 they are silently dropped. |
| 1.5 and newer | `update` carries `--skip-past-updates`; DS types DCOUNTER and DDERIVE become available. |

This is a declared value, not a probe. `get_installed_rrdtool_version()` exists
separately and runs `<path_rrdtool> -v`, matching `^RRDtool ([0-9.]+) `, but the
command builders use the declared one. Setting it higher than the binary in use
produces RRDtool errors on options the binary does not know; setting it lower
silently drops features.

## Fonts and locale

`__rrd_init()` puts `RRD_DEFAULT_FONT` into the environment when
`path_rrdtool_default_font` is set, then calls `rrdtool_set_language()`, which
sets `LANG` to the current locale with `-` replaced by `_` and `.UTF-8`
appended. `rrdtool_reset_language()` restores the previous value.

Per-command execution overrides that for two verbs. A command line beginning
`fetch` or `info` is run with `LANG=en_EN.UTF-8`, because those two outputs are
parsed and must not be localised.

`rrdtool_function_set_font()` emits one `--font <TYPE>:<size>:<font>` per type,
where the types are `TITLE`, `AXIS`, `LEGEND`, `UNIT` and `WATERMARK`. Sizes at
or below 4, and non-numeric sizes, are replaced with 12 for the title and 8 for
everything else. A title on a legend-less graph is scaled to 70 percent.

Theme colours come from the selected theme's `include/themes/<theme>/rrdtheme.php`
as `--color <TAG>#<HEX>` lines. A `CactiColorMode` cookie of `dark`, `light` or
`dark-dimmed` selects the matching `rrdcolors_*` and `rrdborder_*` arrays, with a
fall back to the plain ones when the variant is absent.

## tune and resize

`rrdtool_function_tune()` does not go through `rrdtool_execute()`. It builds and
`popen()`s the command itself:

```
<path_rrdtool> tune <path> [--heartbeat <ds>:<n>] [--minimum <ds>:<n>]
    [--maximum <ds>:<n>] [--data-source-type <ds>:<type>] [--data-source-rename <ds>:<new>]
```

Each argument after the verb is `cacti_escapeshellarg()`ed. Nothing runs when no
option applies, or when the file is missing.

`rrdtool_tune()` is the comparison-driven variant. It takes the differences
computed against `rrdtool info` output and either prints the commands or runs
them, one `tune` and one `resize` per difference, each rejected if it contains a
control character.

`resize` writes to `resize.rrd`, which the caller then renames over the original.
Locally RRDtool writes that file into the PHP process's current working
directory, so the code looks for it at `getcwd() . '/resize.rrd'`. Under a proxy
the command runs on the remote host, so it looks beside the RRD file instead.
