---
title: Data query XML
description: The elements of a data query resource file, the field attributes for SNMP and script queries, and how the parser reads them.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 14
---

A data query definition is an XML file under `resource/`. The `snmp_query` table
holds a row per query; its `xml_path` column points at the file. Parsing is
`get_data_query_array()` in `lib/data_query.php`, which calls `xml2array()` from
`lib/xml.php`. Inherited from Cacti 1.2.x.

## The file

Three directories ship query definitions.

| Directory | Query kind | Executed by |
|---|---|---|
| `resource/snmp_queries/` | SNMP query | SNMP walks and gets from the poller |
| `resource/script_queries/` | Script query | A command line, once per field |
| `resource/script_server/` | Script server query | An included PHP function, once per field |

The root element name is not read. Shipped files use `<interface>`, `<query>`,
`<poller>`, `<webseer>`, and `<gexport>`, and all parse identically, because
`xml2array()` returns the children of the root.

`xml_path` may contain the tokens `<path_cacti>`, `<path_snmpget>`, and
`<path_php_binary>`, substituted before the file is opened. The resolved path must
lie under `<base_path>/resource`, checked with `cacti_path_is_within()`. A path
outside is refused with a `SECURITY:` log entry and the query returns nothing.

### Parser behaviour

`xml2array()` builds a nested array keyed by tag name, with
`XML_OPTION_CASE_FOLDING` off. Two consequences:

- Tag names are case sensitive.
- Sibling elements sharing a tag name collapse; the last one wins. Every field
  element under `<fields>` therefore needs a distinct name, which is the same
  requirement as being a usable field name.

Attributes are not read. Everything is element text.

## Query elements

Common to both kinds.

| Element | Required | Meaning |
|---|---|---|
| `name` | No | Query name. Shown on the data query form |
| `description` | No | Free text. Present in shipped files, not read by the parser's callers |
| `comment` | No | Free text. Same |
| `fields` | Yes | Container for the field elements |
| `index_order` | No | Colon-separated field names, in preference order, from which the sort field is chosen |
| `index_order_type` | No | `numeric`, `alpha`, `alphabetic`, or `alphanumeric`. Any other value logs a `REINDEX` warning |
| `index_title_format` | No | Title template. `\|chosen_order_field\|` is replaced with `\|query_<sort field>\|` |
| `index_type` | No | `nonunique` waives the uniqueness check on sort field candidates |
| `index_transient` | No | `true` means missing indexes are expected and raise no orphan |
| `index_orphan_removal` | No | `true` removes orphaned data sources instead of masking them |

When `index_order` is absent, `calculate_or_set_index_order()` sets it to the name
of the first field whose `source` is `index`. When `index_order_type` is absent and
the file is not a script query, a `REINDEX` warning says index changes will not be
detected.

### SNMP query only

| Element | Required | Meaning |
|---|---|---|
| `oid_index` | Yes | OID walked to enumerate indexes |
| `oid_num_indexes` | No | OID read with a get to count indexes. Without it, the Index Count reindex method counts `oid_index` entries |
| `oid_index_parse` | No | `OID/REGEXP:<pattern>`. Extracts the index from each returned OID. Default is `/.*\.([0-9]+)$/`, the last octet |
| `value_index_parse` | No | `VALUE/REGEXP:<pattern>`. Keeps only the indexes whose walked value matches |

`value_index_parse` runs with `pcre.backtrack_limit` and `pcre.recursion_limit`
lowered to 10000. A pattern that exceeds them is logged as

```
ERROR: Malformed or complex regex in Data Query (ReDoS prevented): <pattern>
```

and its index is dropped.

### Script and script server query only

| Element | Required | Meaning |
|---|---|---|
| `script_path` | Yes | Command to run. May contain `\|path_cacti\|` and `\|path_php_binary\|` |
| `script_function` | Script server only | Function name, appended to the path for the script server's include-then-call contract |
| `script_server` | Script server only | Presence switches the query to the script server. Shipped files set `php` |
| `arg_index` | Yes | Argument that asks for the index list |
| `arg_query` | Yes | Argument that asks for one field's values. The field's `query_name` is appended |
| `arg_get` | Yes | Argument that asks for one field at one index |
| `arg_num_indexes` | No | Argument that asks for the index count |
| `arg_prepend` | No | Prepended to every call. Carries `\|host_*\|` substitutions |
| `output_delimiter` | No | Separator between index and value in a line of output |
| `output_delimeter` | No | The same, misspelled. Both spellings are accepted, and this one is tested first |

Field output is matched with `/(.*?)<delimiter>(.*)/`. The first capture is the
index, the second is the value. A line matching neither spelling is dropped, so a
file declaring no delimiter at all collects nothing.

When `script_server` is present, `query_script_host()` rewrites `script_path` to

```
"|path_php_binary|" -q <script_path>
```

`arg_prepend` is where a script query receives device context. The stock
`host_cpu.xml` passes the whole SNMP configuration:

```xml
<arg_prepend>|host_hostname| |host_id| |host_snmp_version|:|host_snmp_port|:|host_snmp_timeout|:|host_ping_retries|:|host_max_oids|:|host_snmp_community|:|host_snmp_username|:|host_snmp_password|:|host_snmp_auth_protocol|:|host_snmp_priv_passphrase|:|host_snmp_priv_protocol|:|host_snmp_context|</arg_prepend>
```

Substitution and escaping are `get_script_query_path()`, described in
[Data input methods](/reference/data-input-methods/).

## Field elements

Each child of `<fields>` is one field. The element name is the field name, used in
`host_snmp_cache.field_name`, in `|query_<name>|` substitutions, and in
`index_order`.

| Element | Applies to | Meaning |
|---|---|---|
| `name` | Both | Friendly name. Shown in the interface field lists |
| `direction` | Both | `input`, `output`, or `input-output`. Required |
| `query_name` | Script | The token passed after `arg_query` or `arg_get` |
| `oid` | SNMP | Base OID |
| `method` | SNMP | `walk` or `get` |
| `source` | SNMP | How to derive the value. See below |
| `output_format` | SNMP | `hex`, `ascii`, or anything else for the guess behaviour |
| `oid_suffix` | SNMP | Appended after the index |
| `oid_index_parse` | SNMP | Per-field override of the query-level index pattern |
| `oid_rewrite_pattern` | SNMP | `OID/REGEXP:<pattern>` applied to the built OID |
| `oid_rewrite_replacement` | SNMP | Replacement for the above. Both must be present |
| `rewrite_index` | SNMP | Index expression built from other fields. See below |
| `rewrite_value` | Both | Value translation map |

A field missing `direction` raises an error on the graph creation page:

```
Error Parsing Data Query Resource XML file for Data Query '<name>' with id '<id>'.  Field Name '<field>' missing a 'direction' attribute
```

### direction

| Value | Walked during a data query | Available as a graph data source |
|---|---|---|
| `input` | Yes | No |
| `output` | No | Yes |
| `input-output` | Yes | Yes |

Only `input` and `input-output` fields are read when the query runs. Output fields
are collected every poller cycle instead, one poller item each. Only `input` and
`input-output` fields are eligible to be the sort field.

### method

`walk` issues one SNMP walk of `oid` and derives an index from each returned OID.
`get` issues one get per index at `oid.<index>`.

`query_snmp_host()` overrides a declared `walk` to `get` when the field has
`rewrite_index` or `oid_suffix` and its `source` is not `index`, logging

```
Fixing wrong 'method' field for '<field>' since 'rewrite_index' or 'oid_suffix' is defined
```

### source

| Form | Effect |
|---|---|
| `value` | The SNMP value, unchanged |
| `index` | With no `oid` on the field, the index itself becomes the value |
| `VALUE/REGEXP:<pattern>` | `preg_replace` on the value, keeping capture group 1 |
| `VALUE/TEST:<match>:<then>:<else>` | `strcmp` against the value, yielding one of the two literals |
| `VALUE/TABLE:<k>:<v>:<k>:<v>...` | Table lookup on the value. A miss yields `N/A` |
| `VALUE/HEX2IP:<offset>:<length>` | Strips `:` and `HEX-`, takes a substring, and renders it as dotted decimal |
| `OID/REGEXP:<pattern>` | `preg_replace` on the OID, keeping capture group 1 |
| `OID2HEX/REGEXP:<pattern>` | The same, then each numeric part is converted to two hex digits |
| `OIDVALUE/REGEXP:<pattern>:<replacement>` | `preg_replace` on the OID with an explicit replacement |

The `value` test is `preg_match('/^value/i', ...)`, so every `VALUE/` form is
handled inside that branch. Two field names are special-cased there:
`ifOperStatus` and `ifAdminStatus` are normalised to `Up`, `Down`, `notPresent`, or
`Testing` regardless of what `source` says.

### rewrite_index

An index expression made of dot-separated parts. Each part is either a literal,
`|index|` for the walked index, or `|query_<field>|` for another field's value at
that index. The result must match `/^[0-9.]*$/` or the index is skipped with a
warning. Referenced fields must already have been processed in this run, which
makes the order of the field elements load-bearing.

### rewrite_value

A translation map. `rewrite_snmp_enum_value()` expects an array of items each
carrying `match` and `replace`; an item missing either is logged as bogus and
skipped. A `match` of `REGEXP:<pattern>` or `REGEXPNC:<pattern>` is treated as a
pattern, case-insensitive for the `NC` form; anything else is anchored as an exact
match. The first match wins.

Because sibling tags of the same name collapse in the parser, each item needs its
own element name.

## Sort field selection

`get_ordered_index_type_list()` builds the candidate list. A field qualifies when
its `direction` is `input` or `input-output`, and either its `oid` equals the
query's `oid_index`, or its name appears in `index_order`. Candidates are then
tested against `host_snmp_cache` for uniqueness and coverage, and against
`index_order_type` for shape. `index_type` of `nonunique` waives the uniqueness
test. When `index_order` names exactly one field, that field is returned without
further checking.

The reasoning behind the checks, and what happens when a device changes which field
is chosen, is in [Data queries and indexes](/concepts/data-queries-and-indexes/).

## Worked example: SNMP

Trimmed from `resource/snmp_queries/net-snmp_disk.xml`.

```xml
<interface>
	<name>Get Monitored Partitions</name>
	<oid_index>.1.3.6.1.4.1.2021.9.1.1</oid_index>
	<index_order>dskPath:dskDevice:dskIndex</index_order>
	<index_order_type>numeric</index_order_type>
	<index_title_format>|chosen_order_field|</index_title_format>

	<fields>
		<dskIndex>
			<name>Index</name>
			<method>walk</method>
			<source>value</source>
			<direction>input</direction>
			<oid>.1.3.6.1.4.1.2021.9.1.1</oid>
		</dskIndex>
		<dskPath>
			<name>Mount Point</name>
			<method>walk</method>
			<source>value</source>
			<direction>input</direction>
			<oid>.1.3.6.1.4.1.2021.9.1.2</oid>
		</dskPath>
		<dskTotal>
			<name>Total Space</name>
			<method>walk</method>
			<source>value</source>
			<direction>output</direction>
			<oid>.1.3.6.1.4.1.2021.9.1.6</oid>
		</dskTotal>
	</fields>
</interface>
```

Running the query walks `.1.3.6.1.4.1.2021.9.1.1` for the index list, then walks
`dskIndex` and `dskPath`, taking the last OID octet as the index for each. It does
not walk `dskTotal`, which is an output field. The sort field is `dskPath` if its
values are unique and cover every index, otherwise `dskDevice`, otherwise
`dskIndex`. Graph titles become the chosen field's value.

## Worked example: script

Trimmed from `resource/script_queries/unix_disk.xml`.

```xml
<interface>
	<name>Get Unix Mounted Partitions</name>
	<script_path>perl |path_cacti|/scripts/query_unix_partitions.pl</script_path>
	<arg_index>index</arg_index>
	<arg_query>query</arg_query>
	<arg_get>get</arg_get>
	<arg_num_indexes>num_indexes</arg_num_indexes>
	<output_delimiter>:</output_delimiter>
	<index_order>dskDevice</index_order>
	<index_order_type>alphabetic</index_order_type>
	<index_title_format>|chosen_order_field|</index_title_format>

	<fields>
		<dskDevice>
			<name>Device Name</name>
			<direction>input</direction>
			<query_name>device</query_name>
		</dskDevice>
		<dskTotal>
			<name>Total Blocks</name>
			<direction>output</direction>
			<query_name>total</query_name>
		</dskTotal>
	</fields>
</interface>
```

The calls this produces, before escaping:

| Purpose | Command |
|---|---|
| Index count | `perl <base>/scripts/query_unix_partitions.pl num_indexes` |
| Index list | `perl <base>/scripts/query_unix_partitions.pl index` |
| Field values | `perl <base>/scripts/query_unix_partitions.pl query device` |
| One value | `perl <base>/scripts/query_unix_partitions.pl get device "<index>"` |

`index` returns one index per line. `query` returns one `index:value` line per
index. `get` returns one value. `index_order` names one field, so `dskDevice` is
the sort field: the single-candidate case returns before any uniqueness or value
testing runs.

## Script server variant

The same file for the script server declares a function and drops the interpreter
from the path. From `resource/script_server/netsnmp_lmsensors_fan.xml`:

```xml
<query>
	<name>Net-SNMP - Sensors - Get Fan Sensors</name>
	<script_path>|path_cacti|/scripts/ss_netsnmp_lmsensors.php</script_path>
	<script_function>ss_netsnmp_lmsensors</script_function>
	<script_server>php</script_server>
	<arg_prepend>|host_id| fan</arg_prepend>
	<arg_index>index</arg_index>
	<arg_query>query</arg_query>
	<arg_get>get</arg_get>
	<output_delimeter>:</output_delimeter>
	...
</query>
```

Note `output_delimeter` here and `output_delimiter` in the previous example. Both
work. Files that ship in Kadupul use both spellings, and neither is being removed.

That file also has no `arg_num_indexes`. For a script server query that means the
Index Count reindex method is unsupported rather than emulated:

```
<arg_num_indexes> missing in XML file, 'Index Count Changed' not supported
```
