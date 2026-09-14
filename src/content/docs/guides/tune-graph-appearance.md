---
title: Tune graph appearance
description: Axis scaling, units, colour and legend settings, and what to change when a graph is technically correct and still unreadable.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 17
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

A graph nobody can read is not doing its job, however correct the numbers are. Four
things decide readability: what the vertical axis does, what units are printed, what
the colours separate, and what the legend says. This page is about changing them
deliberately.

Graph settings live in two places. A graph template sets them for every graph made
from it. An individual graph can override them, and doing so detaches that field
from the template. Change the template unless you mean to make one graph different.

## Scale

Auto scaling is a checkbox with four modes underneath it, and the modes are not
equivalent.

| Mode | Behaviour | Limits used |
|---|---|---|
| Alt autoscale, ignoring limits | Scales to the data's own minimum and maximum | Neither |
| Alt autoscale max | Scales the top to the data | Lower limit only |
| Alt autoscale min | Scales the bottom to the data | Upper limit only |
| Alt autoscale, accepting both | Scales within the limits given | Both |

The field help says that ticking auto scale makes both limits be ignored. That is
true of the first mode only. The other three pass the relevant limit through, which
is the whole reason they exist. If you want a traffic graph that always starts at
zero but finds its own ceiling, that is the second mode with a lower limit of zero,
not the first.

With auto scale off, the upper and lower limits you set are used directly.

**Rigid boundaries** stops the axis expanding past your limits when the data goes
outside them. Without it, a limit is a hint the tool may override. With it, a value
above the ceiling is drawn clipped. Use it when a fixed axis matters more than seeing
the outlier, and know that you are choosing to hide the outlier.

**Logarithmic scaling** is for data that spans orders of magnitude. There is a
separate switch for SI unit labels on a logarithmic axis; it only takes effect when
logarithmic is also on. Linear axes use SI notation anyway.

## Units

**Base** decides what a kilo means. 1000 for traffic, rates and counts. 1024 for
memory and disk.

Only the exact values 1000 and 1024 are passed to the graphing tool. Anything else
is silently dropped and you get the default of 1000. A base of `1,024` or `1024 `
with a stray space is the same as not setting it, and nothing tells you.

**Unit exponent** pins the axis multiplier so it stops moving. Set it to 3 and the
axis reads in thousands at every zoom level, which is what you want for two graphs
that have to be compared side by side.

Only non-negative integers reach the graphing tool here. The field help mentions
using -6 to display in micro units; a negative value does not pass the check and is
dropped. If you need a negative exponent, scale the data with a CDEF instead.

**Unit length** reserves horizontal space for the axis labels. Increase it when your
labels are being clipped, usually after you have pinned an exponent.

**Alternative Y grid** produces a metric grid with enough decimals to separate values
that differ in the third place. It is the right answer for a graph that sits between
69.998 and 70.001 and looks like a flat line. It can fight with the auto scale modes,
so change one at a time.

**Unit grid value** sets the grid step directly. Reach for it last; the automatic
grid is usually better than a hand-picked one.

## A second axis

A right axis is defined as a scale and a shift relative to the left one. It does not
give you two independent axes for two unrelated series; it gives you a second
labelling of the same data, which is how you put Celsius and Fahrenheit, or bits and
bytes, on one picture.

It takes its own label and its own format string. Axis formatters, which can render
values as numbers, timestamps or durations, are available on both axes and require
RRDtool 1.4 or later. On an older tool they are stored and never emitted, so the
setting appears to do nothing.

## Colour and contrast

Each drawn item has a type, a colour and an opacity. The full item vocabulary is in
[Graph items](/reference/graph-items/); the types that matter for readability are
these.

| Type | Drawn as |
|---|---|
| AREA | Filled from the axis up |
| AREA:STACK | Filled, stacked on whatever is below |
| LINE1, LINE2, LINE3 | Lines of increasing width |
| LINE:STACK | A line, stacked |
| TICK | A mark along the axis, for state |
| HRULE, VRULE | A horizontal or vertical reference line |

Opacity is a hexadecimal alpha from `00` to `FF`, offered in ten percent steps. A
filled area at full opacity hides everything behind it. Drop it to 40 or 50 percent
when an area and a line have to share space, and leave stacked areas opaque, because
a translucent stack reads as a different colour per band and defeats the point.

Line width is a decimal and the field requires the decimal places: `2.00`, not `2`.
Dashes and a dash offset are available for the case where two series must be
distinguishable in print or by a colour-blind reader. A dashed line and a solid line
survive photocopying; two similar colours do not.

Three rules of thumb that survive contact with real graphs:

- One series to a colour across the whole page. If inbound is blue on one graph, it
  is blue on all of them.
- Fill for the thing you are measuring, line for the thing you are comparing it
  against. A filled area with a threshold line over it reads instantly.
- Do not use a colour to mean two things. A red line for errors and a red area for
  traffic on the same picture is a graph that has to be explained.

## Legend

The legend usually carries more information than the shape does, and it is where
most readability is won or lost.

**Text format** is the label. It accepts device and data query substitutions, so a
legend can print the port name or the device description instead of a generic data
source name. There are length limits behind this: a maximum title length setting
that defaults to 110 characters, and a data query field length that defaults to 40.
A long interface alias is truncated to that second figure.

**GPRINT presets** decide the number format. Three ship:

| Preset | Format | Use for |
|---|---|---|
| Normal | `%8.2lf %s` | Anything with a magnitude suffix, two decimals |
| Exact Numbers | `%8.0lf` | Counts, no suffix, no decimals |
| Load Average | `%8.2lf` | Small numbers where a suffix would be noise |

A count printed with Normal reads `1.20 k` when you wanted `1203`. That single
choice is behind most complaints about legends being useless.

**Consolidation function** is per legend item: average, minimum, maximum or last.
The legend for a link should carry current, average and maximum, because average
alone hides saturation. See [Read your first graph](/start/first-graph/) for why.

**Hard return** ends the legend line after an item. Without them the legend wraps
wherever it happens to fit and columns do not line up.

**Auto padding** pads legend text so the columns align. It pads the drawn items
(areas, stacks and lines) to the longest of their labels. Two caveats come with it:
the setting's own help notes it slows rendering and is not accurate on every graph
shape. It works best on the ordinary pattern of one drawn item followed by its
legend items. Consistent label lengths help it more than switching it on does.

**Text alignment** sets the alignment of subsequent legend lines. A hard return on
the same item cancels it, which is a surprise worth knowing once.

**Legend position** (north, south, west, east) and **legend direction** (top down or
bottom up) require RRDtool 1.4 or later. Below that they are stored and ignored.
Bottom-up direction is the one that makes a stacked graph's legend match the order
of the bands.

Thumbnails are drawn with the legend suppressed entirely. A graph that only makes
sense with its legend will not survive on a thumbnail page.

## Size

Height and width are the plot area, not the image. The legend, the axis labels and
the title are added outside those numbers, so a 700 by 200 graph with a twelve-line
legend produces a much taller image. Defaults for new templates are 700 wide and 200
high, and both are settable globally.

Widening the plot area is usually the better fix for a crowded graph than shrinking
the font. More horizontal pixels means more distinct sample buckets, which is real
resolution rather than the appearance of it.

**Slope mode** joins samples with sloped lines instead of steps. It looks smoother
and it costs you the ability to see exactly where a sample sits. **No gridfit**
turns off the snapping of grid lines to pixels, which gives smoother output at the
cost of crispness; it is already off for vector formats.

## Defaults that apply everywhere

Some things are not worth setting per graph.

| Setting | What it covers |
|---|---|
| Font selection method | Whether fonts come from the theme or from explicit settings |
| Title, legend, axis and unit font sizes | Each settable separately |
| Custom watermark | Text at the bottom centre of every graph |
| Disable tool watermark | Removes the graphing tool's own advertisement |
| Default graph height and width | Applied to new graph templates |
| Image format | PNG or SVG |

Set fonts and watermark once, globally, before building templates. Changing them
later does not require touching a single graph.

## When a graph is correct and nobody can read it

Work down this list. Each row is a symptom and the change that fixes it.

| Symptom | Change |
|---|---|
| Flat line that should show variation | Alternative Y grid, or a fixed axis range around the real values |
| One spike flattens everything else | Logarithmic scaling, or an upper limit with rigid boundaries |
| Two graphs look the same but are not | Pin the unit exponent and set the same limits on both |
| Axis in the wrong magnitude | Base is not exactly 1000 or 1024, so it was dropped |
| Legend numbers meaningless | Wrong GPRINT preset for the kind of number |
| Legend columns ragged | Hard returns missing, or label lengths wildly different |
| Bands indistinguishable in a stack | Colours too close, or translucent stacked areas |
| Everything the same colour | Colour template missing on a generated graph |
| Lines lost against the fill | Reduce the area's opacity, or raise the line width |
| Labels clipped on the axis | Increase unit length |
| Fine detail invisible | Increase the width, not the height |

## Failure modes

| Symptom | Usual cause |
|---|---|
| Base setting appears to do nothing | Value is not exactly 1000 or 1024 |
| Negative unit exponent appears to do nothing | Only non-negative integers are passed through |
| Limits ignored with auto scale on | The first auto scale mode is the one that ignores them |
| Legend position or axis formatter has no effect | RRDtool older than 1.4 |
| Data above the ceiling vanishes | Rigid boundaries clipping, as configured |
| SI units checkbox does nothing | It only applies when logarithmic scaling is also on |
| Template change does not reach a graph | That field was overridden on the graph and is now detached |
| Graph unreadable only as a thumbnail | Thumbnails are rendered with no legend |
