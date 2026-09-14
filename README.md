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

## Languages

English keeps its existing URLs. Additional locales are Simplified Chinese
(`/zh-cn/`), Hindi (`/hi/`), Spanish (`/es/`), Modern Standard Arabic (`/ar/`),
French (`/fr/`), German (`/de/`) and Japanese (`/ja/`). Arabic uses right-to-left
layout. English fallback content retains its own language and direction.

Each additional locale includes a homepage, introductory summary, project-status
summary, security-policy summary, error page and generated documentation map.
The summaries link to the complete English pages. Other pages, including archived
documentation, use Starlight's English fallback with a translated notice. These
are initial translations awaiting fluent-speaker review, not complete translations
of the reference manual.

- Edit translated Markdown under `src/content/docs/<locale>/`, using the same
  paths as English pages. Keep command names, settings and filenames unchanged.
- Edit site labels in `src/i18n/locales.mjs` and interface/version notices in
  `src/content/i18n/<language>.json`. Chinese uses the language tag `zh-CN` there.
- `npm run build:map` generates the map for every locale, marking English-only
  entries. Do not edit generated maps by hand.
- `src/i18n/translations.json` records the English source SHA-256 for each summary
  or translation. When English changes, review and update the translation before
  updating its recorded hash. Keep `review: draft` until a fluent reviewer checks it.
- `npm run check:locales` checks built routes, switches, navigation, fallback,
  text direction and translation source hashes. Stale translations produce warnings
  so English corrections can ship independently. Use `npm run check:locales --
  --strict-drift` to require synchronized translations. `npm run check:all` includes
  the standard checks.

The prose linter checks structure in every language and applies English editorial
rules only to English content. Project policies and error pages are excluded from
version snapshots in every locale; existing English archives are preserved.

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
