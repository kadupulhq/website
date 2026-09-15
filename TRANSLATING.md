# Translation workflow

Weblate adoption is tracked in [issue #3](https://github.com/kadupulhq/website/issues/3).
The repository preparation currently covers site labels. A Weblate instance has
not been selected or connected. Interface strings, documentation summaries,
regional inheritance and automatic review-history export remain pending. Do not
treat this preparation as completion of the issue or as evidence of fluent review.

## Site catalogs

Edit `translations/site/en.json` for English source labels and the matching locale
file for translations. These are flat JSON catalogs, with one stable key per
label. Preserve placeholders and the names Kadupul and Cacti. Labels are plain
text; HTML is rejected. Empty or missing translations use the English source.

Run `npm run translations:build` after catalog edits, then `npm run build:map` if
map labels changed, and `npm run check:all`. Commit the catalogs and generated
outputs together. Do not edit `src/i18n/messages.json` or
`public/site-translation-status.json` directly. CI checks both without rewriting
them, before the build can run.

The published `/site-translation-status.json` report covers only the 15 site
labels in each of the 21 non-English locales. It separates missing, draft,
needs-update and reviewed units. It does not count framework interface strings,
summaries, archived pages or full manual translations. Existing documentation
summary tracking remains in `src/i18n/translations.json`.

`translations/site-reviews.json` records the source and target SHA-256 for each
unit. Existing translations start as draft. Source changes produce needs-update;
target edits invalidate approval and return the unit to draft. Changing one source
label does not invalidate unrelated labels. Missing translations remain missing.
Review hashes are never refreshed by the generator.

An eventual reviewed entry also requires a reviewer identity, UTC timestamp
(`YYYY-MM-DDTHH:mm:ssZ`) and HTTPS link to Weblate history. The manifest is an
audit record reviewed in Git, not cryptographic proof of human approval. Until
Weblate review export is connected and tested, keep every entry draft. AI output
must remain draft or a suggestion; only a fluent reviewer may approve it.

## Connect Weblate

After the project owner selects an instance, create a Kadupul website project
with translation review enabled and restrict approval permission to reviewers.
Record its actual URL here after testing it. Use the instance's GitHub integration
with access limited to this repository, and configure the first component:

| Setting | Value |
| --- | --- |
| Component | Site labels (`site`) |
| Source repository | `https://github.com/kadupulhq/website.git` |
| Source branch | `main` |
| Version control system | GitHub pull requests |
| Push branch | `translations/weblate` |
| File mask | `translations/site/*.json` |
| Monolingual base file | `translations/site/en.json` |
| Source language | English (`en`) |
| File format | JSON file (`json`), flat keys |
| Template for new translations | Empty |

Limit translation creation to the supported locales in `src/i18n/locales.mjs`.
Verify Weblate's detected language mappings against the URL prefixes and language
tags in README, especially `es-419`, `fr-ca`, `pt-pt`, `pt-br` and `zh-cn`.
Keep review metadata outside the component file mask. Do not scan generated
`messages.json` as a second component.

JSON has no persistent review flags. Enable Weblate's add-on for flagging unchanged
translations when source strings change, then test its behavior on the chosen
instance. Export approval identity, date and history together with source/target
hashes into the translation PR; a translated string alone is not approved.

Use managed Weblate credentials or CI secrets; never put tokens in clone URLs,
catalogs, logs or documentation. Do not give translation automation permission to
push to `main`. The proposed workflow requires a maintainer to regenerate output
in the translation branch and run checks before merge; automatic generation and
review export are not installed yet.

Reference: [JSON format](https://docs.weblate.org/en/latest/formats/json.html),
[review workflows](https://docs.weblate.org/en/latest/workflows.html), and
[GitHub integration](https://docs.weblate.org/en/latest/admin/code-hosting.html).

## Synchronization and review

Before editing a translation in Git, have Weblate commit and push pending work,
then pull the translation branch. After merging its PR, tell Weblate to pull
`main`. Do not force-push over unexported translator work. For conflicts, pause
component editing, retain both contributions during resolution, run the checks,
merge with history preserved, and resume after Weblate has imported the result.

A contributor should select a language and an untranslated or needs-update unit,
consult the English source and glossary, and save a translation or suggestion.
A fluent reviewer checks meaning, placeholders, terminology and regional style,
then approves through Weblate. The resulting PR must retain contributor commits
and the exported approval record. Do not squash away that history. This round trip
must be demonstrated before the integration is marked ready.

Site-label source edits can ship while their translations are stale; the report
keeps them in the review queue. The existing stricter check for stale project-policy
summaries is still active. A safe English fallback for urgent policy updates needs
implementation before claiming that issue #3's urgent-fix acceptance test passes.

## Glossary and regional style

Preserve product names (Kadupul, Cacti, Spine, RRDtool and Net-SNMP), commands,
configuration keys, filenames, versions and code examples. Translate explanations
around them. Distinguish a poller from a scheduler, and retention from consolidation;
do not describe RRD storage as keeping every sample forever. Translate pre-alpha
warnings without implying a supported release or validated migration.

Use consistent polite Japanese and Korean prose. Preserve Yoruba tone marks and
underdots. Use Modern Standard Arabic and verify right-to-left layout with code
and English fallback text. Fluent reviewers must validate technical terminology
in Sinhala, Hausa and Swahili as well as in the other locales.

Regional catalogs currently contain explicit translations. They do not inherit
approval or automatically copy parent changes. Use Spanish suggestions for es-419,
French suggestions for fr-ca, and compare pt-pt with pt-br while preserving local
usage. Portuguese `ficheiros`/`utilizadores` and Brazilian `arquivos`/`usuários`
are intentional differences. Shared inheritance, regional overrides and a Weblate
glossary component remain work for issue #3.

## Remaining acceptance work

- Connect the selected Weblate instance and verify all 22 language mappings.
- Migrate interface/version/search strings with an explicit English source.
- Author shared English summary sources before migrating the existing localized
  summaries; they are not translations of the full English manual.
- Add regional inheritance with explicit overrides and source-change tracking.
- Export real review history, test the contributor-to-reviewer-to-PR round trip,
  and verify that source changes invalidate review inside Weblate.
- Extend CI validation to interface markup, links and protected code identifiers.
- Publish separate summary, full-page and English-fallback coverage, and support
  urgent English policy fixes through a safe fallback.
