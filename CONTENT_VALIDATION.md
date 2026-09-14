# Content validation

Reviewed on 14 September 2026.

## Sources and scope

The application baseline was `kadupulhq/kadupul` main commit
`7410d2d898e9fa6413c8169deb8805efd03c0936`, verified against GitHub before
inspection. Source was inspected in a separate temporary snapshot; the application
checkout was not changed. The inherited `release/1.2.31` manifest also declares
PHP `>=8.0`.

All documentation pages received structural, prose and built-link checks. Manual
review focused on project status, contribution and security policies, installation,
runtime requirements, storage and retention, operational safety, component
availability, and consistency between current and archived pages.

## Corrections and evidence

| Area | Correction | Evidence |
|---|---|---|
| Project status | Removed claims that no code, tests or contribution process exist; distinguished release targets from supported releases | Application README, CONTRIBUTING.md, CHANGELOG.md, VERSIONING.md and GitHub release list |
| Security reporting | Required private triage for unreleased and inherited vulnerabilities; removed unsupported disclosure promises | Application SECURITY.md |
| PHP requirements | Corrected the manifest floor to 8.0 and separated it from security support | composer.json and [PHP support policy](https://www.php.net/supported-versions.php) |
| TLS proxy setup | Distinguished client-address header trust from PHP HTTPS state and Secure cookies | include/global.php cookie setup and lib/functions.php get_client_addr() |
| RRD retention | Removed claims that history is kept forever, faster samples are simply discarded, and retention changes always destroy history | [RRD creation](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html), [tuning](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), [resizing](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html), and application RRD/profile code |
| Heartbeat | Defined the maximum interval between updates instead of an additional grace period after the step | RRDtool documentation and cacti.sql profile values |
| Installation | Added the archived tutorial's missing schema import; corrected import and scheduling descriptions | cacti.sql, installer and poller code |
| Contribution rules | Matched main's edited-file PER-CS rule and LTS formatting policy; removed unverified tooling mandates | CONTRIBUTING.md on the reviewed main commit |
| Spine | Described a planned Kadupul-maintained fork, without inventing a repository URL or available release | Maintainer instruction during review; no accessible Spine repository found in the organization |
| CLI and file references | Removed an unavailable audit tool and clarified reserved endpoint mappings | Source file inventory and include/global_arrays.php |
| ESXi package | Confirmed the guest-count script is embedded in the compressed template package | install/templates/ESXi_Device.xml.gz |
| Licensing | Removed unversioned header counts and assertions about a different dependency tree | Application license/manifest and [Creative Commons compatibility list](https://creativecommons.org/compatible-licenses/) |

The static command check inspected 86 PHP command examples across current and
archived pages. Their referenced executable files and option names were present
in the inspected source. This was a source-text check, not execution of commands.

## Validation and limits

`npm run check:all` passes: type checks, prose checks, 33 regression tests, static
build and internal links. Existing Astro warnings about the empty i18n collection
and overlapping 404 route remain.

No installation, device polling, migration, backup restoration or destructive
maintenance procedure was executed. The large settings, message and schema
reference tables were not exhaustively verified row by row. External source links
were checked selectively. This review is not certification of production readiness
or complete compatibility with every supported tool version.

Archived pages received explicit factual corrections and release-status notices;
they were not regenerated as snapshots of current application behavior.
