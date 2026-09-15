---
title: How graphs are drawn
description: The path from a round-robin file to a rendered image, and why the same stored numbers can produce very different pictures.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 4
---

Nothing is drawn in advance. A graph is a command, assembled from database
configuration at the moment somebody asks for the image, and run against the RRD
files on disk. Once you know how the command is assembled, most graph surprises
stop being surprises.

## The order of operations

1. Choose the time window.
2. Choose which archive inside each RRD file to read.
3. Emit one `DEF` per data source item and consolidation function used.
4. Emit any `CDEF` and `VDEF` expressions the items reference.
5. Emit the drawing and printing items, in their configured sequence.
6. Hand the whole thing to RRDtool.

Steps 2 and 3 are where two graphs of the same measurements start to diverge.

## Choosing an archive

A data source keeps several archives at different resolutions. See
[Data sources and round-robin archives](/concepts/data-sources-and-rras/) for why.
At render time Kadupul takes the archives attached to the graph and computes each
one's real span as step times steps times rows. An archive qualifies if that span
covers the requested window and also reaches from now back to the start of the
window. Among the qualifying archives, the one with the fewest steps wins, which is
the finest resolution that still reaches far enough back.

Two things follow from this.

Widening the window changes the resolution. A spike plainly visible on a four hour
graph can be absent from a one week graph of the same data, because the week graph
reads a coarser archive where that spike was averaged in with its neighbours. The
data did not change. The archive did.

The graph also ends slightly before now. When no explicit end time is given, the
end is one consolidated interval back, because the current interval has not
finished yet and its bucket is not complete.

## The items

A graph is an ordered list of items. Each one becomes a line in the RRDtool
command, in sequence, and the sequence matters for more than layout.

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
is drawn at zero rather than failing the render. A rule sitting flat on the axis
usually means its value did not resolve, not that the threshold is zero.

`VRULE` takes either a Unix timestamp or an `hours:minutes` pair. A negative hours
component is read as an offset back from now instead of a wall clock time.

## Two jobs, one word

Consolidation function is used for two different things, and the same four names,
`AVERAGE`, `MIN`, `MAX` and `LAST`, appear in both places.

The first job is archive selection. A `DEF` names a file, a data source inside it,
and a consolidation function. That function decides which archive is read. Ask for
`MAX` and you read the archive of maxima.

The second job is legend arithmetic. A `GPRINT` reduces the whole drawn window to
one printed number, and its function decides how. That reduction happens over
whatever series was already read; it is aggregation, not storage.

So a `GPRINT` showing `MAX` over a `DEF` read with `AVERAGE` prints the largest
five minute average in the window, not the largest sample ever taken. Those are
different numbers, and on a busy link they are very different numbers. Both
readings are legitimate. Only one is probably what you meant.

## The silent fallback

Before emitting a `DEF`, Kadupul checks which consolidation functions the RRD file
actually contains. If the requested one is missing, it uses the first one the file
does have.

This is the single most useful thing on this page. A graph item configured to draw
`MAX`, attached to a data source whose profile only stores averages, draws averages
and says nothing. The graph is not wrong in any way the interface can show you. It
is answering a question you did not ask. If peaks matter, the archives have to
exist before the graph item can read them, and archives cannot be added after the
fact.

## GPRINT borrows its neighbour's archive

A plain `GPRINT` has no archive of its own. It reuses the consolidation function of
the most recent `AREA`, `STACK` or line item that drew the same data source in that
graph. Only the fixed variants, the ones tied to a specific function, set their own.

That means reordering items in a graph template can change what a legend reports
without anyone touching the legend. Put a `LINE` reading `MAX` above the `GPRINT`
block and those legends now summarise maxima. Move it below and they summarise
averages again. If a number in a legend changes after an unrelated template edit,
check the item order first.

## CDEFs and VDEFs

Both transform data before it is drawn. They are not interchangeable.

| | CDEF | VDEF |
|---|---|---|
| Produces | A series, one value per time slot | One value for the whole window |
| Can be drawn as a line or area | Yes | No |
| Built from | Functions, arithmetic operators, other CDEFs, special data sources, literals | One function applied to one reference |
| Nesting | A CDEF may reference another CDEF | A VDEF may not contain arithmetic |

A CDEF is a stack expression evaluated in reverse Polish order. The vocabulary is
large and is listed in full in [Graph items](/reference/graph-items/): arithmetic, comparison and conditional operators, trigonometry, aggregation
across data sources, stack manipulation, and the time functions that let a
definition know where it sits on the x-axis. `UN` and `UNKN` are the ones worth
learning early, because converting unknown to something drawable is how most
stacked graphs avoid holes.

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

Two practical limits fall out of the scalar nature. A `GPRINT` backed by a VDEF
takes no consolidation function argument, because the VDEF already decided the
reduction. And the CSV export path skips VDEF-backed items entirely, since an
export is a table of series and a VDEF is not a series. A graph whose legend is
built from VDEFs will export with fewer columns than it appears to have.

## Why the same data looks different

Everything below changes the picture without changing a single stored sample.

| Choice | Effect |
|---|---|
| Window length | Selects a different archive, so a different resolution |
| Consolidation function on the `DEF` | Reads peaks, troughs, averages, or last values |
| A missing archive | Falls back to whichever function the file has |
| `AREA` versus `STACK` | Absolute heights versus cumulative heights |
| Item order | Overpainting, stack order, and which archive a `GPRINT` borrows |
| Base 1000 or 1024 | Relabels the axis. The values are identical |
| Autoscale mode, rigid limits, logarithmic scale | Changes the y-axis, which changes how large a change looks |

When two graphs of the same data disagree, the disagreement is almost always in
this table rather than in the RRD files. Compare the two rendered commands before
suspecting the collection. For a walkthrough of doing exactly that, see
[Troubleshoot missing data](/guides/troubleshoot-missing-data/).
