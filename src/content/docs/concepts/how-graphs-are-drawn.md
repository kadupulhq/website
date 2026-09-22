---
title: How graphs are drawn
description: The path from a round-robin file to a rendered image, and why the same stored numbers can produce very different pictures.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 4
---

A normal image request can assemble an RRDtool command from graph configuration and
read the referenced RRD files. A valid cached image can also satisfy the request, and
on-demand Boost processing may update files before rendering. See
[High volume writes](/concepts/high-volume-writes/) for freshness limits.

## The order of operations

For a request that proceeds to command generation:

1. Resolve the requested window and graph configuration.
2. Estimate resolution from database profiles and select consolidation functions.
3. Emit deduplicated `DEF` references for the required fields and functions.
4. Emit referenced `CDEF` and `VDEF` expressions.
5. Emit drawing and printing items in configured sequence, with applicable options
   and plugin changes.
6. Let RRDtool read the actual files and render the result.

## Choosing an archive

Kadupul consults database profile rows when calculating archive spans and graph
options. Its automatic estimate considers step times steps times rows, requested
coverage and archive step count; explicit archive selection follows a separate path.
These profile calculations do not inspect every actual archive in every file and
can disagree with existing files after a profile change.

The generated `DEF` specifies the file, data-source name and consolidation function.
RRDtool chooses an available archive at an appropriate resolution and may further
consolidate data for the graph's width and time window. The application estimate is
not a guarantee that a particular physical archive is read. See the upstream
[RRDtool data-definition documentation](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Widening a window or changing image width can change the displayed resolution.
An average-based coarser series can hide a short spike even though a finer archive
still contains it. Compare the actual file layout and command, not only the profile.
See [Data sources and round-robin archives](/concepts/data-sources-and-rras/).

When the caller supplies no end time, the normal renderer initially uses the main
poller's last-run offset from now, falling back to the polling interval when that
value is unavailable or in the future. Later code also has a consolidated-interval
fallback, but it is not the universal default. An explicit end time overrides this
normal initialization; a graph ending behind now does not by itself identify the
selected archive or prove that the latest samples were written.

## The items

A graph is an ordered list of items. Command generation can omit items, reuse
definitions or expand an item into several instructions. Drawing order matters
for more than layout.

| Item | Draws | Notes |
|---|---|---|
| `AREA` | Filled region from the axis to the value | Later areas paint over earlier ones |
| `STACK` | Filled region starting at the top of the previous item | Emitted as an area with a stack flag |
| `LINE1`, `LINE2`, `LINE3` | A line one, two, or three pixels wide | Can be dashed |
| `LINE:STACK` | A line drawn on top of the running stack total | |
| `TICK` | Marks along an edge of the plot | Useful for state, not magnitude |
| `GPRINT` | Nothing. Prints one number into the legend | |
| `COMMENT` | Nothing. Prints literal legend text | Long comments wrap |
| `HRULE` | A horizontal line at a fixed value | |
| `VRULE` | A vertical line at a fixed time | |
| `TEXTALIGN` | Nothing. Sets alignment for the legend text that follows | |

The full list, including which configuration columns apply to which type, is in
[Graph items](/reference/graph-items/).

`AREA` and `STACK` are the pair people get wrong. An area starts at zero, so two
areas overlap and the taller one hides the shorter. A stack starts where the
previous item ended, so the visible height of the second band is its own value but
its top edge is the total. Read a stacked graph as a band height, not as a
y-axis position, or you will misread every series except the bottom one.

`HRULE` takes a value that can contain template substitutions. Non-numeric
characters are stripped from the result, and if nothing numeric survives, the rule
is drawn at zero rather than failing the render. A rule sitting at zero can be intentional or a failed substitution. Inspect the
resolved command before deciding which. The numeric filter can also alter a string
that contains units or unsupported numeric notation.

`VRULE` takes either a Unix timestamp or an `hours:minutes` pair. A negative hours
component is read as an offset back from now instead of a wall clock time.

## Two jobs, one word

Consolidation function is used for two different things, and the same four names,
`AVERAGE`, `MIN`, `MAX` and `LAST`, appear in both places.

The first job is archive selection. A `DEF` names a file, a data source inside it,
and a consolidation function. That function constrains the archive family requested. Ask for
`MAX` and RRDtool needs matching stored consolidation data, subject to the application
fallback described below and resolution selection.

The second job is legend arithmetic. A `GPRINT` reduces the whole drawn window to
one printed number, and its function decides how. That reduction happens over
whatever series was already read; it is aggregation, not storage.

So a `GPRINT` showing `MAX` over a `DEF` read with `AVERAGE` prints the largest
value of that average-based series over the rendered window, not necessarily the
largest raw sample. Five minutes is only an example; the effective resolution varies. Those are
different numbers, and on a busy link they are very different numbers. Both
readings are legitimate. Only one is probably what you meant.

## The silent fallback

For item types that use the best-function helper, Kadupul reads the file
consolidation functions and uses the requested one if present, otherwise the first
reported one. If none are obtained for a valid local data source, the helper falls
back to AVERAGE. Fixed GPRINT variants take a separate path and do not use this
helper, so this is not a universal promise that every missing function is repaired.

A drawing item requesting `MAX` can therefore end up reading averages when its
file contains only AVERAGE archives. Inspect the generated `DEF` and `rrdtool info`
output. Archive maintenance can change an existing layout, but adding an archive
cannot reconstruct historical peaks discarded by earlier averaging. See
[Manage data retention](/guides/manage-data-retention/).

## GPRINT borrows its neighbour's archive

A plain `GPRINT` has no archive of its own. It reuses the consolidation function of
the most recent matching `AREA`, `STACK`, line or `TICK` item, keyed by data-source
name and local template-field identity. If there is no preceding match, it uses the
best-function helper with its own configured function. Fixed variants use their own
configured function directly.

That means reordering items in a graph template can change what a legend reports
without anyone touching the legend. Put a `LINE` reading `MAX` above the `GPRINT`
block and matching legends can summarise maxima. Move it below and the earlier
matching item, or the no-match fallback, determines the input series instead. If a number in a legend changes after an unrelated template edit,
check the item order first.

## CDEFs and VDEFs

Both transform data before it is drawn. They are not interchangeable.

| | CDEF | VDEF |
|---|---|---|
| Produces | A series, one value per time slot | A value and, for some functions, an associated time |
| Can be drawn as a line or area | Yes | A scalar can supply a constant level |
| Built from | Functions, arithmetic operators, other CDEFs, special data sources, literals | One function applied to one reference |
| Nesting | A CDEF may reference another CDEF | A VDEF may not contain arithmetic |

A CDEF is a stack expression evaluated in reverse Polish order. The vocabulary is
large and is listed in full in [Graph items](/reference/graph-items/): arithmetic, comparison and conditional operators, trigonometry, aggregation
across data sources, stack manipulation, and time functions that let a
definition know where it sits on the x-axis. `UN` and `UNKN` are the ones worth
learning early. Replacing unknown values with zero can avoid visual gaps but also
hide missing measurements; make that presentation choice explicit.

CDEFs also read special references rather than a fixed data source name. One
resolves to the current item's data source, which is what makes a single CDEF
reusable across every item in a template. Others resolve to all data sources on
the graph, or to all similar ones, with or without duplicates, which is how a
total line is built without naming its inputs.

A VDEF collapses a series to a scalar: maximum, minimum, average, standard
deviation, first, last, total, a percentile, or the slope, intercept and
correlation of a least squares fit. RRDtool does not support arithmetic inside a
VDEF, so when a VDEF needs a computed input, Kadupul builds it on the item's CDEF
instead of on the raw data source. That is the intended route for arithmetic: do
the maths in a CDEF, then reduce it in a VDEF.

A `GPRINT` backed by a VDEF takes no consolidation function argument: the VDEF
already supplied the reduction. VDEFs can also supply scalar drawing values; RRDtool
supports a VDEF-backed line. See the upstream
[graph-element documentation](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

CSV export selects supported drawing types as series columns; legend items are not
exported as equivalent columns. Contrary to an earlier description, the current code
does not generally skip VDEF-backed drawing items. It can emit an invalid `XPORT` of
a scalar VDEF: an isolated RRDtool test renders a VDEF line successfully but rejects
that export. See [application bug #273](https://github.com/kadupulhq/kadupul/issues/273).
Use series-backed drawing items for export and verify the resulting columns.

## Why the same data looks different

Everything below changes the picture without changing a single stored sample.

| Choice | Effect |
|---|---|
| Window length and image width | Can change archive selection and additional consolidation |
| Consolidation function on the `DEF` | Reads peaks, troughs, averages, or last values |
| A missing consolidation function | Some item paths substitute another function; others can fail |
| `AREA` versus `STACK` | Absolute heights versus cumulative heights |
| Item order | Overpainting, stack order, and which archive a `GPRINT` borrows |
| Base 1000 or 1024 | Relabels the axis. The values are identical |
| Autoscale mode, rigid limits, logarithmic scale | Changes the y-axis, which changes how large a change looks |

When graphs disagree, compare rendered commands, actual file identities and layouts,
cache state and sample freshness. These presentation choices are useful checks, but
they do not exclude collection, storage or mapping errors. For a walkthrough of doing exactly that, see
[Troubleshoot missing data](/guides/troubleshoot-missing-data/).
