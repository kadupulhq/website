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

Node 20.19 or newer. The pinned version is in `.node-version`.

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

## Writing rules

- Every page states what it is for in its `description`. That text is the meta
  description and the search result, so write it for a stranger.
- Pages describing behavior that does not exist yet carry a `banner` or a `:::caution`
  saying so. Documenting unbuilt software as though it were shipped is how docs lose
  their credibility permanently.
- Source claims from the Cacti source, which is GPL licensed. Do not adapt Cacti's
  documentation, which carries no license and grants no right to derivative works.

## License

Site content and configuration are GPL-3.0-or-later, matching the project.
