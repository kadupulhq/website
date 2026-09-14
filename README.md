# Kadupul website

Documentation site for [Kadupul](https://github.com/kadupulhq/kadupul), built with
[Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Develop

```bash
npm install
npm run dev      # local server with hot reload
npm run build    # static output in dist/
npm run preview  # serve the built output
```

Node 22.12 or newer. The pinned version is in `.node-version`.

Run `npm run check:all` before submitting changes. This runs type checks, prose
checks, regression tests, the static build, and internal link validation. CI and
deployment use the same command.

## How the docs are organized

Pages follow [Diátaxis](https://diataxis.fr), which separates documentation by what
the reader is trying to do:

| Section | Answers |
|---|---|
| `start/` | "Teach me", read in order, once |
| `guides/` | "Help me do this specific thing" |
| `concepts/` | "Help me understand why" |
| `reference/` | "Tell me exactly", looked up, never read through |
| `project/` | Status, license, and scope of the Cacti compatibility promise |

Mixing these is the usual reason documentation feels unusable. A reference page that
explains its reasoning is slow to look things up in, and a tutorial that lists every
option is impossible to follow.

## Versioning

`main` is the live documentation and the only thing you edit. Archived versions
live in `src/content/docs/<slug>/`, are generated, and are frozen once cut. Fixing
something in an archived version means editing that version's own file on purpose,
not editing `main` and expecting it to flow backwards.

Pages under `project/` and the site-wide `404.md` page are excluded from
versioning. Project pages always serve the latest copy.

The snapshot is cut by the build. If you are part way through a large documentation
change, comment out the `starlightVersions` block first, or any `npm run build`
will freeze a half-written version. Delete the generated directory and rebuild if
that happens.

## Writing rules

- Every page states what it is for in its `description`. That text is the meta
  description and the search result, so write it for a stranger.
- Pages describing behavior that does not exist yet carry a `banner` or a `:::caution`
  saying so. Documenting unbuilt software as though it were shipped is how docs lose
  their credibility permanently.
- Verify claims against the target Kadupul source version. Check the license
  before adapting any third-party prose.

## License

| What | Licence | File |
|---|---|---|
| Documentation in `src/content/docs/` | CC BY-SA 4.0 | `LICENSE-docs` |
| Site code, config, styles, scripts | GPL-3.0-or-later | `LICENSE` |

CC BY-SA 4.0 is listed by Creative Commons as one-way compatible with GPLv3, so
documentation text can move into the GPL-licensed project tree. The reverse does
not hold.
