---
title: Graph items
description: Every graph item type Kadupul can place on a graph, the consolidation functions, and the CDEF and VDEF vocabulary available when building them.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 7
---

A graph is an ordered list of items. Each row in `graph_templates_item` becomes
one or more arguments on the RRDtool graph command line, in `sequence` order.
This page lists what those rows can be.

Everything here is inherited from Cacti 1.2.x. Two parts of the vocabulary
depend on the installed RRDtool version and are called out where that applies.

## Item types

`graph_templates_item.graph_type_id` holds the numeric id. The column names in
the interface come from the same table.

| Id | Name | Emits | Draws |
|---|---|---|---|
| 1 | `COMMENT` | `COMMENT` | Text in the legend. No data source. |
| 2 | `HRULE` | `HRULE` | Horizontal line at a fixed value. |
| 3 | `VRULE` | `VRULE` | Vertical line at a fixed time. |
| 4 | `LINE1` | `LINE1` | One pixel line. |
| 5 | `LINE2` | `LINE2` | Two pixel line. |
| 6 | `LINE3` | `LINE3` | Three pixel line. |
| 7 | `AREA` | `AREA` | Filled area from zero. |
| 8 | `AREA:STACK` | `AREA:...:STACK` | Filled area stacked on the item before it. |
| 9 | `GPRINT` | `GPRINT` | Legend value using the item's own consolidation function. |
| 10 | `LEGEND` | nothing | Shorthand. Expands on save. See below. |
| 11 | `GPRINT:LAST` | `GPRINT:...:LAST` | Legend value, consolidation fixed to `LAST`. |
| 12 | `GPRINT:MAX` | `GPRINT:...:MAX` | Legend value, consolidation fixed to `MAX`. |
| 13 | `GPRINT:MIN` | `GPRINT:...:MIN` | Legend value, consolidation fixed to `MIN`. |
| 14 | `GPRINT:AVERAGE` | `GPRINT:...:AVERAGE` | Legend value, consolidation fixed to `AVERAGE`. |
| 15 | `LEGEND_CAMM` | nothing | Shorthand. Expands on save. See below. |
| 20 | `LINE:STACK` | `LINE<width>:...:STACK` | Line stacked on the item before it, using `line_width`. |
| 30 | `TICK` | `TICK` | Tick marks along an edge. `value` is passed through as the fraction argument. |
| 40 | `TEXTALIGN` | `TEXTALIGN` | Sets alignment for the legend text that follows. |

The interface sorts the list alphabetically by name, so the ids are not the
display order.

### LEGEND and LEGEND_CAMM are not stored

Selecting `LEGEND` or `LEGEND_CAMM` writes several `GPRINT` rows and no row of
that type. Nothing in the database ever has `graph_type_id` 10 or 15 after a
save, and the graph renderer has no case for them.

| Shorthand | Expands to, in order |
|---|---|
| `LEGEND` | `GPRINT` `LAST` with text `Cur:`, `GPRINT` `AVERAGE` with text `Avg:`, `GPRINT` `MAX` with text `Max:` and a hard return |
| `LEGEND_CAMM` | `GPRINT` `LAST` `Cur:`, `GPRINT` `AVERAGE` `Avg:`, `GPRINT` `MIN` `Min:`, `GPRINT` `MAX` `Max:` and a hard return |

Both write `color_id` 0 on every item they create.

### Which columns apply to which type

| Column | Applies to |
|---|---|
| `task_item_id` | Every type that reads data. Points at a `data_template_rrd.id`, not a data source. |
| `color_id`, `alpha` | `AREA`, `AREA:STACK`, `LINE1/2/3`, `LINE:STACK`, `TICK`, `HRULE`, `VRULE`. |
| `line_width` | `LINE:STACK` only. The fixed line types carry their width in the name. |
| `dashes`, `dash_offset` | `LINE1`, `LINE2`, `LINE3`, `LINE:STACK`, `HRULE`, `VRULE`. Ignored elsewhere. |
| `consolidation_function_id` | `GPRINT`. The four fixed `GPRINT` variants ignore it. |
| `cdef_id`, `vdef_id` | Any item with a data source. |
| `text_format` | Legend text. On `COMMENT` it is the whole comment. |
| `gprint_text` | Read through `gprint_id` and appended after `text_format` on `GPRINT` items. |
| `hard_return` | Appends a line break to the legend entry. |
| `textalign` | `TEXTALIGN` only. |
| `value` | `HRULE` threshold, `VRULE` time, `TICK` fraction, and the shift amount when `shift` is set. |
| `shift` | `AREA`, `AREA:STACK`, `LINE1/2/3`, `LINE:STACK`. Emits a `SHIFT` after the item when set and `value` is non-zero. |
| `sequence` | Ordering. Items are rendered in this order and stacking depends on it. |

### Type-specific behaviour worth knowing

**`AREA`** emits a gradient built from twenty bands instead of a plain `AREA`
when the `enable_rrdtool_gradient_support` setting is on. The end colour is the
item colour darkened by 40 percent.

**`AREA:STACK`** emits `AREA:...:STACK`, not RRDtool's deprecated `STACK`
command.

**`HRULE`** strips non-numeric characters from `value` after variable
substitution. If nothing numeric remains the rule is drawn at `0` rather than
failing the graph.

**`VRULE`** accepts two forms in `value`. A plain number is used as a Unix
timestamp. A `H:M` pair is resolved against today when `H` is positive, and as
"this many hours and minutes ago" when `H` is negative.

**`COMMENT`** is word-wrapped at the `max_title_length` setting minus 20
characters, and a comment that wraps becomes several `COMMENT` arguments. An
empty comment is emitted as a single space, because RRDtool rejects an empty one.

**`GPRINT`** drops the consolidation function from the command line when
`vdef_id` is set, since a VDEF has already reduced the series to one value.

**CSV and XPORT export** only emit `AREA`, `AREA:STACK`, `LINE1`, `LINE2`,
`LINE3` and `STACK` items, and only when `vdef_id` is `0`. Items backed by a VDEF
are skipped, because `XPORT` cannot reference one. Every other type is dropped
from an export.

## Consolidation functions

`graph_templates_item.consolidation_function_id`:

| Id | Function |
|---|---|
| 1 | `AVERAGE` |
| 2 | `MIN` |
| 3 | `MAX` |
| 4 | `LAST` |

The same four ids appear in `data_source_profiles_cf`, which decides which RRAs
a new RRD file gets. An item asking for a consolidation function the file has no
RRA for will not find data.

## Data source types

`data_template_rrd.data_source_type_id`, the DS type written into the RRD file:

| Id | Type | Available |
|---|---|---|
| 1 | `GAUGE` | always |
| 2 | `COUNTER` | always |
| 3 | `DERIVE` | always |
| 4 | `ABSOLUTE` | always |
| 5 | `COMPUTE` | always |
| 6 | `DCOUNTER` | RRDtool 1.5 or newer |
| 7 | `DDERIVE` | RRDtool 1.5 or newer |

The version test runs at page load, so the two extra types appear in the
interface only when the RRDtool binary reports 1.5 or above.

## Colour and transparency

`alpha` is a two-character hex value appended to the colour. The interface
offers eleven steps:

| Value | Opacity |
|---|---|
| `00` | 0% |
| `19` | 10% |
| `33` | 20% |
| `4C` | 30% |
| `66` | 40% |
| `7F` | 50% |
| `99` | 60% |
| `B2` | 70% |
| `CC` | 80% |
| `E5` | 90% |
| `FF` | 100% |

`FF` is the default on `graph_templates_item.alpha`. Colours themselves come
from the `colors` table, which enforces a unique hex value per row.

## GPRINT presets

`graph_templates_gprint` holds named format strings. `graph_templates_item.gprint_id`
picks one, and its text is appended after the item's `text_format`.

| Name | Format |
|---|---|
| Normal | `%8.2lf %s` |
| Exact Numbers | `%8.0lf` |
| Load Average | `%8.2lf` |

## CDEF

A CDEF is a list of `cdef_items` rows joined with commas in `sequence` order,
producing an RPN expression. Each item's `type` says how to read its `value`.

| `type` | Meaning | `value` holds |
|---|---|---|
| 1 | Function | Index into the function list below. |
| 2 | Operator | Index into the operator list below. |
| 4 | Special Data Source | One of the placeholder names below. |
| 5 | Another CDEF | A `cdef.id`. Resolved recursively. |
| 6 | Custom String | Literal text, inserted as written. |

### Operators

| Index | Operator |
|---|---|
| 1 | `+` |
| 2 | `-` |
| 3 | `*` |
| 4 | `/` |
| 5 | `%` |

### Functions

Listed in the order they are indexed. The index is what `cdef_items.value`
stores, so inserting into this list renumbers everything after it.

`SIN`, `COS`, `LOG`, `EXP`, `FLOOR`, `CEIL`, `LT`, `LE`, `GT`, `GE`, `EQ`, `IF`,
`MIN`, `MAX`, `LIMIT`, `DUP`, `EXC`, `POP`, `UN`, `UNKN`, `PREV`, `INF`,
`NEGINF`, `NOW`, `TIME`, `LTIME`, `ADDNAN`, `TREND`, `TRENDNAN`, `PREDICT`,
`PREDICTSIGMA`, `PREDICTPERC`, `SQRT`, `ATAN`, `ATAN2`, `POW`, `ISINF`,
`MINNAN`, `MAXNAN`, `DEG2RAD`, `RAD2DEG`, `ABS`, `REV`, `SMIN`, `SMAX`,
`MEDIAN`, `STDEV`, `PERCENT`, `COUNT`, `STEPWIDTH`, `NEWDAY`, `NEWWEEK`,
`NEWMONTH`, `NEWYEAR`, `DEPTH`, `COPY`, `INDEX`, `ROLL`

`ROUND` is appended to the list when the installed RRDtool reports 1.8.0 or
newer. Because it is appended rather than inserted, existing CDEFs are unaffected.

### Special data sources

These placeholders are substituted at render time with the DEF names of the
graph's own data. They are what makes a CDEF reusable across graphs.

| Placeholder | Resolves to |
|---|---|
| `CURRENT_DATA_SOURCE` | The data source of the item this CDEF is attached to. |
| `CURRENT_DATA_SOURCE_PI` | That item's polling interval. |
| `ALL_DATA_SOURCES_NODUPS` | Every data source on the graph, duplicates removed. |
| `ALL_DATA_SOURCES_DUPS` | Every data source on the graph, duplicates kept. |
| `SIMILAR_DATA_SOURCES_NODUPS` | Data sources on the graph sharing this item's DS name, duplicates removed. |
| `SIMILAR_DATA_SOURCES_NODUPS_PI` | The polling interval of that same set. |
| `SIMILAR_DATA_SOURCES_DUPS` | The same set with duplicates kept. |
| `CURRENT_DS_MINIMUM_VALUE` | The item's data source minimum. |
| `CURRENT_DS_MAXIMUM_VALUE` | The item's data source maximum. |
| `CURRENT_GRAPH_MINIMUM_VALUE` | The graph's lower limit. |
| `CURRENT_GRAPH_MAXIMUM_VALUE` | The graph's upper limit. |
| `COUNT_ALL_DS_NODUPS` | Count of all data sources, duplicates removed. |
| `COUNT_ALL_DS_DUPS` | Count of all data sources, duplicates kept. |
| `COUNT_SIMILAR_DS_NODUPS` | Count of similar data sources, duplicates removed. |
| `COUNT_SIMILAR_DS_DUPS` | Count of similar data sources, duplicates kept. |

The `DUPS` and `NODUPS` pair matters on a graph where two items read the same
RRD file. `NODUPS` counts that file once.

### Shipped CDEFs

| Name |
|---|
| Turn Bytes into Bits |
| Make Stack Negative |
| Make Per 5 Minutes |
| Total All Data Sources |
| Multiply by 1024 |
| Total All Data Sources, Multiply by 1024 |

## VDEF

A VDEF reduces a series to a single value. The structure matches a CDEF:
`vdef_items` rows joined with commas in `sequence` order. Three of the five item
types apply.

| `type` | Meaning | `value` holds |
|---|---|---|
| 1 | Function | Index into the VDEF function list. |
| 4 | Special Data Source | `CURRENT_DATA_SOURCE`, the only one available. |
| 6 | Custom String | Literal text, such as a percentile argument. |

`type` 5 resolves another VDEF recursively, the same way a CDEF does.

### Functions

| Index | Function |
|---|---|
| 1 | `MAXIMUM` |
| 2 | `MINIMUM` |
| 3 | `AVERAGE` |
| 4 | `STDEV` |
| 5 | `LAST` |
| 6 | `FIRST` |
| 7 | `TOTAL` |
| 8 | `PERCENT` |
| 9 | `PERCENTNAN` |
| 10 | `LSLSLOPE` |
| 11 | `LSLINT` |
| 12 | `LSLCORREL` |

`CURRENT_DATA_SOURCE` is the only special data source a VDEF accepts. RRDtool
does not allow arithmetic inside a VDEF, so anything more involved has to be
done in a CDEF first and referenced from there.

### Shipped VDEFs

| Name |
|---|
| Maximum |
| Minimum |
| Average |
| Last (Current) |
| First |
| Total: Current Data Source |
| 95th Percentage: Current Data Source |

## Text alignment

`TEXTALIGN` items carry one of these in `textalign`, and it applies to the
legend text after them:

| Value | Alignment |
|---|---|
| empty | None |
| `left` | Left |
| `right` | Right |
| `justified` | Justified |
| `center` | Center |
