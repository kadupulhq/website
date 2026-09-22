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

Validation includes type checks, prose checks, 72 regression tests, the static
build, internal links and checks across 22 locales. The i18n collection is now
populated; the existing overlapping 404 route warning remains. The 105 translated
summaries and error pages are tracked against English source hashes and await
fluent-speaker review. These checks verify structure and routing, not native-level
translation quality or completeness of the translated manual.

No installation, device polling, migration, backup restoration or destructive
maintenance procedure was executed. The large settings, message and schema
reference tables were not exhaustively verified row by row. External source links
were checked selectively. This review is not certification of production readiness
or complete compatibility with every supported tool version.

Archived pages received explicit factual corrections and release-status notices;
they were not regenerated as snapshots of current application behavior. The
retention correction was applied consistently to the current and archived guide.

## Automated review follow-up

Checked review and inline comments at 08:13 UTC on 2026-09-14, ten minutes after
the preceding PR update. The review targeted an earlier revision. Applicable
findings were addressed in current and archived documentation: polling schedule
wording, archived step numbering and navigation, conditional compatibility and
Spine claims, profile-specific heartbeat guidance, missing-file diagnosis, and
unsupported inherited proxy workflows. The link checker now validates HTML file
aliases and resolves relative links at each alias URL, with regression tests.

The suggestion to grant Pages write access to the build job was not applied:
the pinned configure-pages action reads an existing site with enablement disabled.
Its action manifest and API client were inspected, and `enablement: false` is now
explicit. The deployment job retains the write permission it needs.

The follow-up also excludes localized error pages from the sitemap and adds
`noindex`, filters utility routes from orphan diagnostics, normalizes browser URL
control characters, and rejects missing or incomplete locale dictionaries.

Coverage is measured with V8/c8 across every first-party executable source file,
including scripts, configuration and the rendered Astro footer. All 72 tests pass
with 100% statements, branches, functions and lines, enforced per file in CI.
Framework integration boundaries are stubbed in isolated configuration tests;
the production build exercises the real integrations. The build produced 3,168
pages; 384,319 internal links and 123,411 anchors passed validation. HTML and LCOV
reports are retained as CI artifacts and sent to Sonar through CI analysis.

The canonical URL and robots sitemap retain the existing `kadupul.org` domain.
The earlier proposed `.net` change had no verified ownership or migration evidence
in the website or infrastructure repositories and was reverted. The map CLI test
now compares every generated map and restores its original content; `npm test`
builds first so its CLI integration checks work from a fresh checkout.

Policy source drift now fails ordinary validation and deployment; non-policy
translations retain warnings, with strict mode available for all source drift.

Sonar confirmed 100% new-code coverage. The local CLI path-injection reports incorrectly
assumed an externally exposed command runner: these local maintainer commands
intentionally accept directory arguments, run with the invoking user's filesystem
permissions, and receive fixed repository paths in CI. Each report was reviewed
and classified as a false positive in Sonar with this rationale. No scanning rule
or executable source file was excluded.

The fresh automated review identified stale-map masking and incomplete frozen
locale exclusions. Validation now compares generated maps without writing files,
before the build can regenerate them. Tests cover stale English and translated
maps, unchanged output after failure, validation ordering, and all 22 locales in
the frozen policy/error exclusions. The archive status banners and reported
French-Canadian/Brazilian Portuguese wording were corrected. The full validation
suite passes with 72 tests and 100% coverage in all four metrics.

The next re-review's remaining guard and wording fixes are also addressed:
required numeric-region interface labels cannot be removed or emptied, rendered
localized error pages must retain an exact robots `noindex` directive, and the
prose linter rejects unterminated frontmatter. Regression fixtures cover each
failure case. The remaining archived banner, Brazilian Portuguese article, and
historical proxy introduction were corrected. All 72 tests and the complete build,
link and locale checks pass with 100% coverage in every metric.

## GitHub Pages link audit (2026-09-21)

The configured `kadupul.org` destination returned HTTP 200 with a Squarespace
“Coming Soon” page, including for documentation paths. GitHub Pages was disabled.
The maintainer requested GitHub Pages; it is now enabled for the website repository
at `https://kadupulhq.github.io/website/`. This supersedes the earlier canonical-domain
finding above. Publication uses the existing Actions workflow on pushes to `main`.

The site base, canonical URLs, sitemap and robots sitemap now target Pages.
Markdown links and images receive the project base during rendering; current and
archived homepage actions include it explicitly. Link and locale checks validate
the served base and reject origin-root destinations. Application README links use
the same Pages URL. No custom-domain ownership or DNS change is assumed.

The audit includes all rendered languages and archived pages, first-party README
relative targets, external source destinations, and generated edit links. External
HTTP success alone was insufficient: the parked domain required inspecting the
response content. Example URLs and authenticated private-report destinations are
not treated as publicly accessible documentation pages.

## Installation section validation (2026-09-21)

Reviewed `start/install.md` against application commit
`661a57ff43ebf275e6b07211d4284dd727103959` on `main`. Corrected the current PHP
floor in the installation and requirements pages, added the missing npm asset
build, distinguished an offline bundle from a source archive, documented CSRF
secret creation and Symfony writable state, and moved the browser check after
schema import. The guide now distinguishes PHP warnings from errors, includes
new-database/account and configuration-copy steps, and changes default credentials
before scheduling collection. Scheduler guidance covers the one-minute launcher
setting, exclusive daemon/cron ownership, and stopping the scheduler for a forced
manual cycle.

Evidence: `composer.json`, `include/global_constants.php`,
`include/config.php.dist`, `lib/utility.php`, `lib/installer.php`, `cacti.sql`,
`poller.php`, `service/cactid.service`, `config/bootstrap.php`,
`docs/symfony-migration.md`, and `tests/e2e/nginx.conf` at that application commit.
The referenced migration instructions also explain the required repository-root
legacy deployment during the Symfony transition and the separate `APP_SECRET`.

Ran the existing behavior harness with a separate disposable Compose project,
`kadupul-doc-install-validation`, and removed its containers and volumes afterward.
The environment was Debian 13, PHP 8.4.25, MariaDB 10.11, RRDtool 1.7.2 and
net-snmp 5.9.4. The fresh CLI installer returned zero, authenticated admin access
returned HTTP 200 with the console layout, and a reachable-device poller cycle
returned zero with five RRDs processed and ten RRD acknowledgements. All 34
scenarios were captured with a complete manifest and no harness error.

This was a fresh observation capture with runtime assertions, not a comparison
against previously approved goldens or proof of upstream parity. The harness uses
a controlled configuration and seeds an authentication fixture after installation;
it does not validate the documented manual password-change interaction. Browser
installer screens, distribution package commands, Nginx deployment, SELinux or
AppArmor policy, real cron timing, and offline-host recovery were not exercised.
Archived LTS instructions were not changed by this current-main audit.

## Device onboarding and first graph validation (2026-09-21)

Reviewed `start/first-device.md` and `start/first-graph.md` against application
commit `661a57ff43ebf275e6b07211d4284dd727103959`. Corrected SNMP version and
Counter64 guidance, collector-side numeric OID checks, optional device metadata,
conditional graph automation, and the legacy device/graph entry points. Collection
checks now distinguish raw counter updates from normalized archive values and
account for buffered writes. Graph guidance corrects heartbeat timing, archive
selection and information loss, average arithmetic, unknown values, axis scaling,
and consolidation-function/legend behavior.

Source evidence includes `lib/api_device.php`, `lib/api_automation.php`, `host.php`,
`cli/add_graphs.php`, `lib/functions.php`, `lib/rrd.php`, and
`include/global_arrays.php`. RRDtool semantics were also checked against its
[creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) and
[graph data reference](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

The disposable Compose project `kadupul-doc-device-validation` uses the existing
behavior harness installation and deterministic SNMP fixture. The probe creates
an SNMPv2c device and indexed eth0 `In/Out Bits (64-bit)` graph through the CLI,
checks authenticated device-page access, query and poller caches, forces two
polling cycles, and requests the graph image. All assertions passed: one data
source, 23 interface-query cache rows, advancing RRD update timestamps with
numeric input/output counters, and an HTTP 200 SVG image parsed successfully as
XML. Changing the fixture community to an invalid value made the authenticated
web availability endpoint report an SNMP error. Containers and volumes were
removed afterward; the application worktree remains unchanged.

Separate RRDtool 1.7.2 diagnostics confirmed that a 120-second update gap exceeds
a 90-second heartbeat even with a 60-second step, producing unknown rows. Two
COUNTER readings five seconds apart advanced `lastupdate` while the first
completed 60-second archive row remained unknown. These are standalone RRDtool
diagnostics, not application collection evidence.

Validation limits: device and graph creation used CLI commands, not interactive
browser form submission. Closely spaced forced polls do not establish a finite
normalized traffic rate or real scheduler timing. No physical switch, SNMPv3,
remote collector, automation-rule execution, long-term retention, or visual
browser rendering was exercised. An initial probe incorrectly required PNG;
the installed graph template returns SVG. A direct PHP failure-case invocation
also lacked the web endpoint's includes; the corrected probe uses the actual
`host.php?action=ping_host&id=...` endpoint.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,404 internal links including 123,474 anchor targets, and zero broken links.
The existing 42 translation freshness warnings remain separate from this audit.
A final prose-only correction was checked with the prose linter and
`git diff --check`. No pre-commit gate was run, as requested.

## Polling and scheduling validation (2026-09-21)

Reviewed `reference/poller-lifecycle.md` and `concepts/time-and-intervals.md`
against application commit `661a57ff43ebf275e6b07211d4284dd727103959`.
The lifecycle page described an obsolete delete-before-write path and MEMORY
queue replacement. It now covers the InnoDB/storage preflight, acknowledgement
tracking, retained retries, incomplete-group expiry, bounded rejection handling,
and writer-failure exit status. Scheduling guidance distinguishes launcher
cadence from collection interval, integer pass calculation, early exit, and the
limits of `--force`. Timing guidance removes unsupported claims about inevitable
graph gaps, fixed outage visibility delays, and next-cycle queue deletion.

Source evidence: `poller.php`, `cmd.php`, `cactid.php`, `lib/poller.php`,
`lib/rrd_maintenance.php`, `lib/api_poller.php`, and the shipped profile rows in
`cacti.sql`. RRDtool creation and tuning references support the file-timing
clarifications; profile edits do not automatically migrate existing files.

An isolated `kadupul-doc-polling-validation` Compose project used the existing
behavior harness installer and default Linux device. Seven runtime assertions
passed: baseline collection exited 0; an early invocation exited 0 with a
scheduling message, no RRD updates and unchanged last-run state; global and
per-collector disable each exited 1 despite `--force`; a late invocation warned
and continued with exit 0; injected RRDtool failure exited 1 and retained five
samples; recovery exited 0, wrote five RRD update commands and emptied the queue.
Fresh device collection was disabled for recovery, demonstrating that the writes
came from retained samples. Test containers and volumes were removed afterward.

The probe used controlled database settings and manual launches. It did not run
real cron, Task Scheduler or the daemon, exercise sub-minute multi-pass timing,
Spine, remote collectors, concurrent writers, signal handling, long-term expiry,
or terminal-rejection limits. Those paths received source review only. The
application worktree remains unchanged; documentation edits remain local.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,448 internal links including 123,474 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. Final prose-only source
clarifications passed the prose linter and `git diff --check`. The pre-commit
gate was skipped as requested.

## Poller-cache maintenance validation (2026-09-21)

Reviewed `concepts/the-poller-cache.md` and the cache-related sections of
`guides/troubleshoot-missing-data.md` against application commit
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected claims that collection uses
no joins, credential saves require manual rebuilding, and disabled devices never
retain cache rows or cannot resume through Enable. Documented the optional nature
of the input whitelist, scoped stale-row cleanup, and the limits of broad rebuilds.

Source evidence: `lib/api_device.php`, `lib/api_poller.php`, `lib/utility.php`,
`cmd.php`, `host.php`, `cli/rebuild_poller_cache.php`, and its deprecated worker
wrapper `cli/push_out_hosts.php`. Device saves compare collection fields before
choosing a quick save or pushout. Bulk Disable preserves cache rows; Enable
reuses existing rows or primes an empty cache. A configured missing whitelist
rejects inputs, whereas an unconfigured whitelist permits them.

Found an application defect in CLI rebuild scope: `pushout_master_handler()`
uses `--host-id` to count hosts, but `pushout_launch_child()` omits that argument.
Workers consequently select enabled devices without the requested host filter.
The documentation no longer recommends this option for isolated device repair;
it points to the legacy device page's **Repopulate Poller Cache** action, which
calls `push_out_host()` with the selected device id. The application defect has
not been fixed in this documentation audit. It is tracked in
[application issue #197](https://github.com/kadupulhq/kadupul/issues/197).

The disposable `kadupul-doc-cache-validation` project installed the application,
created a deterministic SNMP device and indexed interface graph, and verified:
bulk disable preserves rows; enable reuses them; enable rebuilds a cache emptied
while disabled; saving changed credentials through `api_device_save()` refreshes
cached credentials; a committed rebuild with a configured missing whitelist
removes stale entries; rebuilding with normal configuration restores them.

The scope-defect reproduction enabled a second device and placed a recognizable
stale hostname in its cache. Running `rebuild_poller_cache.php --host-id=<first>`
with one worker refreshed that second device too, confirming the source finding.
An earlier test with the second device disabled was insufficient to establish
isolation and is superseded by this two-enabled-device reproduction. Containers
and volumes were removed after the probe.

Limits: direct device API calls and CLI commands were exercised, not interactive
browser form submissions. The recommended device-page repopulate action received
source review only. Remote replication, concurrent rebuilds, full-fleet scale,
and the remaining non-cache troubleshooting sections were not validated here.
The application worktree remains unchanged; documentation edits remain local.

Final website `check:all` passed: 86 tests with 100% coverage, 3,168 generated
pages, 384,470 internal links including 123,474 anchor targets, and zero broken
links. The existing 42 translation freshness warnings remain. `git diff --check`
passed. The pre-commit gate was skipped as requested.

## Data-query and reindex validation (2026-09-21)

Reviewed `concepts/data-queries-and-indexes.md` and `guides/monitor-a-switch.md`
against application commit `661a57ff43ebf275e6b07211d4284dd727103959`. Corrected
the distinction between discovery and graph creation, stored versus resolved
indexes, candidate-selection exceptions, reindex-method cost and coverage,
asynchronous timing, and the down/disabled limits of `--force`. The switch guide
now uses collector-side numeric OIDs and configured credentials, narrows the CLI
example by device and query, and asks operators to inspect actual RRD bounds
after speed changes. Orphan-removal options do not delete the data source or RRD
history themselves.

Source evidence: `lib/data_query.php`, `lib/poller.php`, `lib/rrd.php`,
`cmd.php`, `cli/poller_reindex_hosts.php`, and
`resource/snmp_queries/interface.xml`. The guides no longer claim that Verify All
reruns discovery every cycle or detects every possible change.

The disposable `kadupul-doc-reindex-validation` project used the existing
installer and deterministic SNMP fixture. Ordinary query reruns passed. A
synthetic stale index of 777 was remapped to the real interface index 2 in both
`data_local` and `graph_local`. Down and disabled devices retained their discovery
cache despite explicit `--force` reruns. These checks used real SNMP rediscovery
with controlled database state, not physical switch renumbering.

A synthetic missing stored identity exposed a confirmed application defect: with
`index_type=ifName`, an absent identity and no moved source, the query finished
with the old index 2, `orphan=0`, and unchanged polling OIDs. The no-index-changes
branch clears orphan flags after the earlier missing-identity branch sets them.
Filed [bug #198](https://github.com/kadupulhq/kadupul/issues/198), labeled `bug`
and assigned to `somethingwithproof`. No duplicate issue or applicable open
milestone was found. The application defect remains unfixed; the guides disclose
it and advise checking mappings before resuming affected sources.

Limits: no wrong-port measurement was collected, no physical port disappeared,
and no packet-level reindex cost was measured. Automatic assertion triggering,
queued command timing, remote collectors, XML type-validation edge cases,
Spine, orphan-removal variants and interactive browser flows received no runtime
coverage. Containers and volumes were removed, and the application worktree
remains unchanged. Documentation changes remain local.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,492 internal links including 123,474 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check`
passed. The pre-commit gate was skipped as requested.

## Email and administrator-notification validation (2026-09-21)

Reviewed `guides/send-email-notifications.md` and the mail-preflight entry in
`reference/settings.md` against application commit
`661a57ff43ebf275e6b07211d4284dd727103959`. PR #196, the Symfony administrator
notification migration, was still open at audit time, so these results concern
the current legacy path, not that PR's proposed behavior.

Corrected the guide's claims that an embedded hostname port disables selected
TLS, every caller gets a generated sender fallback, every attempted send has a
full transport log, and only SMTP can report a useful error. Documented the
existing-account policy check, separate test/admin recipients, transport
acceptance versus inbox delivery, and event-specific debounce behavior. The
SMTP test is a protocol probe, not an ICMP ping.

Source evidence: `lib/functions.php` (`admin_email`, `send_mail`, `mailer`,
`ping_mail_server`, `email_test`, and `debounce_run_notification`),
`include/global_settings.php`, the legacy settings `send_test` handler, and
administrator-notification call sites in `poller.php`.

The disposable `kadupul-doc-mail-validation` installation used a local SMTP sink
inside its application container, bound to loopback and sending no external mail.
The sink advertised STARTTLS and used a fixture certificate explicitly trusted
by the PHP client. Four messages were accepted: plain SMTP with opportunistic
TLS disabled, a valid administrator warning, STARTTLS delivery with a separate
port, and STARTTLS delivery with an embedded hostname port. Disabled notification
policy, unset/missing administrator accounts and a missing administrator address
sent nothing. Missing sender and test-recipient checks returned errors.

The same server exposed a confirmed legacy probe defect: with Security TLS and
Ping Mail Server enabled, `email_test()` failed during connect and sent no
message, while the direct sender successfully negotiated STARTTLS. The sink
observed non-SMTP handshake bytes on the failed probe. Filed
[bug #200](https://github.com/kadupulhq/kadupul/issues/200) with native type `Bug`,
the `bug` label and assignee `somethingwithproof`. No duplicate report, applicable
organization project or open milestone was found. The application defect remains
unfixed. The guide recommends bypassing the optional probe while retaining TLS
and verifying actual sending.

Limits: no external provider, authenticated SMTP, implicit TLS, failover hosts,
PHP mail/Sendmail, actual inbox placement or interactive browser submission was
tested. Scheduled reports, discovery mail and threshold plugins were not exercised.
The production functions and settings-test handler were called directly. The
controlled sink validates protocol behavior, not production deliverability.
Containers and volumes were removed; the application worktree remains unchanged.
Documentation edits remain local and unpublished.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,492 internal links including 123,474 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check`
passed. The pre-commit gate was skipped as requested.

## Scheduled-report validation (2026-09-21)

Reviewed scheduled reporting in `guides/send-email-notifications.md` and the
reporting settings in `reference/settings.md` against application commit
`661a57ff43ebf275e6b07211d4284dd727103959`. Expanded the guide to cover owner graph
permissions, To/Bcc selection, inline versus attached images, due/enabled
selection, schedule advancement, the effect of `--force`, and delivery limits.
Clarified that the timeout is evaluated by process registration on a later run,
not a PHP execution deadline.

Source evidence: `poller_reports.php`, `lib/reports.php`, `lib/html_reports.php`,
`lib/poller.php::register_process_start()`, and the reporting definitions in
`include/global_settings.php` and `include/global_arrays.php`.

The disposable `kadupul-doc-report-validation` installation polled its default
Linux device to create real RRD data and generated a report with a graph. The
local SMTP sink received a valid PNG MIME part, the intended To header, two RCPT
commands for To/Bcc, and no exposed Bcc header. Normal scheduling sent only the
due enabled report; future and disabled reports were skipped. A forced run sent
the future enabled report and advanced its schedule while continuing to skip the
disabled report. A missing owner caused its report to be disabled with no mail.

Two defects were reproduced and filed with native type `Bug`, label `bug`, and
assignee `somethingwithproof`:

- [#202](https://github.com/kadupulhq/kadupul/issues/202): after a refused local
  SMTP connection, the report poller exited 0 and recorded `Reports:1`. The sink
  received no new message, while `mailtime` and `lastsent` remained unchanged.
  The statistic measures attempts, not accepted messages.
- [#203](https://github.com/kadupulhq/kadupul/issues/203): with the supported
  1,048,576-byte maximum selected, a report containing one graph and twenty
  60,000-character text items delivered 1,664,197 bytes of MIME content. The
  declared maximum-size setting is not consumed by the current send path.

The initial fixture insert failed because its SQL used an unquoted reserved
column name; that test-fixture error was corrected before the completed run.
No external messages were sent. The sink was configured to accept fixture mail;
its behavior does not represent an external provider's policy. Interactive report
creation, permissions across multiple owners, calendar/DST boundaries, long
backlogs, timeout termination, image-conversion variants and lost SMTP
acknowledgements were not runtime-tested. Containers and volumes were removed.
The application code remains unchanged; both defects are outstanding and the
documentation changes remain local.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,492 internal links including 123,474 anchor targets, and zero broken links.
Final prose-only settings clarifications passed the prose linter and
`git diff --check`. The 42 existing translation freshness warnings remain.
The pre-commit gate was skipped as requested.

## Automatic discovery validation — 2026-09-21

Reviewed `guides/discover-devices-automatically.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected the discovery preview's side
effects, SNMP-only availability checks, stored up/recovering status for existing
devices, duplicate suppression scope, force behavior, missing-device diagnosis,
and device deletion and notification claims. Documented the range-overlap and
regex-matching limitations.

Source evidence: `poller_automation.php`, `lib/api_automation.php`,
`lib/api_device.php`, and the automation tables in `cacti.sql`.

The disposable `kadupul-doc-discovery-validation` installation scanned only its
single Docker SNMP fixture address. Creation disabled recorded the fixture's
system data and matching template without adding a host. A repeat scan retained
one discovery record. Enabling creation added one device, and a subsequent scan
recognized it without adding another.

Database-backed checks invoked the actual application functions:

- The anchored rule `^Linux.*fixture$` returned no template for
  `Linux deterministic SNMP fixture`, although the direct SQL regex control
  matched. A literal substring rule selected the template.
- Priming `192.0.2.1,192.0.2.0/30` queued only `192.0.2.1`; the non-overlapping
  `/30` control queued both `.1` and `.2`. No workers or probes ran for these
  documentation-only addresses. The global IP primary key and plain batch INSERT
  explain the omitted address.

The first fixture run could not launch workers because `path_webroot` was unset.
The fixture was corrected to `/var/www/html` before the completed run. This setup
failure was not counted as a successful discovery test.

Runtime scope excludes large subnets, concurrent workers/networks, unreachable
hosts, alternate DNS/NetBIOS, SNMPv3, scheduling boundaries, timeout termination,
notification delivery, and graph/tree rule execution. Cross-network overlap is a
source/schema finding, not a concurrency test. Containers and volumes were
removed, and application code remains unchanged. Documentation is local and
unpublished. The pre-commit gate was skipped as requested.

Filed [#206](https://github.com/kadupulhq/kadupul/issues/206) for regex matching
and [#207](https://github.com/kadupulhq/kadupul/issues/207) for overlapping ranges.
Both have native type `Bug`, label `bug`, assignee `somethingwithproof`, and
reproduction, environment, revision, severity, impact, workaround, and acceptance
criteria. No applicable organization project or open milestone was available.
The relevant defective expressions also remain in the current GitHub source.

Website `check:all` passed after regenerating the documentation map: 86 tests
with 100% coverage, 3,168 generated pages, 384,492 internal links including
123,474 anchor targets, and zero broken links. The 42 existing translation
freshness warnings remain. `git diff --check` passed.


## Graph and tree automation rules validation — 2026-09-21

Reviewed the graph/tree rule sections of
`guides/discover-devices-automatically.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Clarified selection versus execution
previews, enabled rules versus global creation hooks, SQL wildcard/numeric
semantics, fixed and field-derived tree headers, CLI selector intersection,
cached-index use, graph eligibility, repeat suppression, and graph-tree backfill.

Source evidence: `cli/apply_automation_rules.php`, the rule filter builders,
graph and tree executors and `automation_update_device()` in
`lib/api_automation.php`, and the graph creation hook in `lib/template.php`.

The disposable `kadupul-doc-rules-validation` installation queried its local SNMP
fixture to populate Interface data-query indexes, then ran the actual CLI:

- Missing selectors and an invalid zero device ID exited 1.
- Empty device filters, unavailable index fields, and disabled graph rules
  created no graphs.
- With an enabled device match and `ifDescr = eth0`, the explicit CLI created one
  indexed graph even with the global graph-creation switch off. Repeating the
  command left one graph.
- Removing all index conditions created the second graph for `lo`. An empty
  index filter is not the same as an empty device filter.
- New enabled device and graph tree rules were added after both graphs existed.
  The CLI created the device header/leaf but zero graph leaves. Calling the
  production graph-tree executor directly for an existing graph created its
  matching header/leaf. Repeating both paths left four tree items, with no
  duplicates.
- Combining the selected device ID with a nonmatching description produced a
  successful no-op, confirming selector intersection.

Filed [#211](https://github.com/kadupulhq/kadupul/issues/211) for the CLI's missing
existing-graph tree pass. It has native type `Bug`, label `bug`, assignee
`somethingwithproof`, environment, affected revision, severity, reproduction,
expected/actual behavior, workaround, and acceptance criteria. No applicable
organization project or open milestone was available. The current GitHub source
still has the same omission.

The initial tree fixture insert used a nonexistent `graph_tree.hash` column;
that setup error was corrected and the complete run passed. Runtime coverage does
not include interactive rule editing, non-indexed template creation, dynamic
header replacement, complex Boolean expressions, concurrent creation, disabled
device selection, or cross-poller propagation. Those documentation details are
source-reviewed only. The application code is unchanged. Documentation remains
local and unpublished, and the pre-commit gate was skipped as requested.

Containers and volumes were removed. Website `check:all` passed: 86 tests with
100% coverage, 3,168 generated pages, 384,492 internal links including 123,474
anchor targets, and zero broken links. The 42 existing translation freshness
warnings remain. `git diff --check` passed.


## Template import/export validation — 2026-09-21

Reviewed `guides/import-and-export-templates.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected preview side effects, signing
key acceptance, bundle-info verification scope, allowed package destinations,
partial imports, profile selection, orphan handling, PHP resource limits, and
CLI output/success interpretation.

Source evidence: `cli/import_template.php`, `cli/import_package.php`,
`lib/export.php`, `lib/import.php`, and
`lib/functions.php::repair_system_data_input_methods()`.

The disposable `kadupul-doc-import-validation` installation exercised:

- Production export of a simple host template, preview of a renamed definition,
  import updating the same hash/ID, and repeat import without a duplicate.
  The simple preview left the original name unchanged.
- A seven-byte malformed file (`<cacti>`) returned exit 0, printed only its byte
  count, emitted no stderr, and created no templates.
- Export of the built-in Get SNMP Data method with its port field changed to a
  noncanonical legacy hash. With canonical and noncanonical port rows seeded in
  the database, `--preview` deleted the noncanonical row (255) and retained the
  canonical row (40). The compatibility repair path bypasses the preview guard.
- The repository's signed `Generic_SNMP_Device.xml.gz` bundle passed metadata
  inspection and preview. Modifying its metadata while retaining its original
  signatures caused `--info` to fail with exit 1. No trust bypass or signing key
  was used.
- A nonexistent package profile failed with exit 1; a nonexistent plain-template
  profile warned and used the system default in preview.
- Plain-template preview emitted HTML and imported-results wording, while package
  preview produced plain text. The simple template's persisted state confirmed
  that its preview had not applied the requested name change.

Filed three reports, all with native type `Bug`, label `bug`, assignee
`somethingwithproof`, environment, affected revision, severity, reproduction,
expected/actual results, workaround, and acceptance criteria:

- [#215](https://github.com/kadupulhq/kadupul/issues/215): preview performs legacy
  input-field database repair.
- [#216](https://github.com/kadupulhq/kadupul/issues/216): malformed-template CLI
  failure is reported as exit 0. Related closed issue #70 covered web/package
  callers rather than this remaining CLI path.
- [#217](https://github.com/kadupulhq/kadupul/issues/217): template preview passes
  its flag as the renderer's web-output argument.

The relevant repair and CLI call sites remain in current GitHub source. No
applicable organization project or open milestone was available. Existing issue
#110 covers package decompression limits and is linked from the guide.

Runtime scope excludes package file installation, a signed package exercising
legacy repair, dependent-mapping repair, per-file signature corruption, alternate
signing keys, orphan deletion, graph/data-template merge variants, web UI import,
and remote collectors. These paths were not claimed as runtime-tested. No
application code was changed. Documentation remains local and unpublished; the
pre-commit gate was skipped as requested.

Containers and volumes were removed. Website `check:all` passed: 86 tests with
100% coverage, 3,168 generated pages, 384,492 internal links including 123,474
anchor targets, and zero broken links. The 42 existing translation freshness
warnings remain. `git diff --check` passed.


## Users and permissions validation — 2026-09-21

Reviewed `guides/manage-users-and-permissions.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected direct graph grants in all
permission modes, evaluation within each user/group policy source, independent
page realms, the restricted-operator recipe, guest/template fallback, revocation
semantics, and permission-audit guidance.

Source evidence: `lib/auth.php`, `include/auth.php`, `auth_login.php`,
`include/global_settings.php`, and user/group administration helpers.

The disposable `kadupul-doc-permissions-validation` installation used a dedicated
local account with Deny defaults and an existing fixture graph. Production
`is_graph_allowed()` checks in fresh processes covered twenty combinations:
no grants, graph only, device only, template only, and device plus template,
each under all four methods. Direct graph permission allowed access in every
method. Device-only permission allowed Permissive and Device Based; template-only
permission allowed Permissive and Graph Template Based; no grants denied all.
Device plus template allowed all methods.

Group checks confirmed that an enabled group's device grant allowed graph access,
disabling that group removed its grant, and a direct user graph grant still
allowed access. Under Restrictive, a device grant in the group and a template
grant on the user did not combine into an allowed pair.

HTTP checks used the account's real login and session. Graph viewing was available
with View Graphs. Settings without its realm showed Permission Denied (HTTP 200);
adding only the Settings realm made the page accessible while Console Access
remained absent. No settings mutation was submitted. After `user_disable()`, zero
stored sessions remained for the account and the old browser session was required
to log in for Settings. The intervening graph URL returned HTTP 200 without a
login form; its response body was not retained, so it is not evidence of continued
authorized graph access. A direct check found no configured guest account. The
earlier guest-fallback explanation for that response was unsupported and has
been withdrawn. Guest fallback is documented conditionally from source only.

Filed [#222](https://github.com/kadupulhq/kadupul/issues/222) for Settings help that
misstates Restrictive and omits the direct-graph alternative in the two based
modes. The report has native type `Bug`, labels `bug` and `documentation`, assignee
`somethingwithproof`, revision, environment, severity, reproduction matrix,
expected/actual behavior, workaround, and acceptance criteria. The current GitHub
help retains the discrepancy. No applicable organization project or open
milestone was available.

Two fixture expectations were revised before the completed run: the denial
page is titled Permission Denied, and HTTP status alone does not classify the
post-revocation graph response. The final assertion used the login form returned
by Settings. Post-revocation graph-content access remains unvalidated.

Runtime scope excludes LDAP/basic authentication, fresh disabled-account login,
remember-me cookies, actual configuration writes, plugin realms, tree pruning,
direct image/export endpoint authorization, and concurrent requests already in
flight during revocation. Those paths are not claimed as runtime-tested. The
application code is unchanged. Documentation remains local and unpublished;
the pre-commit gate was skipped as requested.

Containers and volumes were removed. Website `check:all` passed: 86 tests with
100% coverage, 3,168 generated pages, 384,492 internal links including 123,474
anchor targets, and zero broken links. The 42 existing translation freshness
warnings remain. `git diff --check` passed.


## Plugin lifecycle validation — 2026-09-21

Reviewed `guides/install-and-vet-plugins.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Clarified CLI compatibility limits,
configuration callbacks, hook registration conventions, tracked versus untracked
schema changes, disable/uninstall behavior, realm assignments, CLI commands,
and poller hook frequency. Replaced absolute review claims with checks that also
cover included files and delegated callbacks.

Source evidence: `lib/plugins.php`, `cli/plugin_manage.php`, `plugins.php`, and
`lib/functions.php::cacti_plugin_path()`.

The disposable `kadupul-doc-plugins-validation` installation received a synthetic
plugin only inside its container. Its install callback registered a filter and
configuration hook, registered a realm without auto-grant, created a tracked
fixture table with one data row, and added a tracked column to the fixture host
table. No third-party plugin or external service was used.

Runtime checks confirmed:

- `compat = 99.0.0` caused the production compatibility helper to return false,
  but the actual CLI installed the plugin, ran its schema changes, and recorded
  status 4. The INFO compatibility value was then changed to 1.2 in the fixture
  before the remaining checks.
- `--install --allperms` on the existing realm returned 0 with administrative
  permission wording, but the configured admin's realm grant count remained zero.
- Installed/disabled state skipped the ordinary filter; enabling transformed
  `input` into `input-plugin`; disabling restored the unmodified result.
- The disabled plugin's `config_settings` callback still executed, with its hook
  status active while the ordinary filter hook was disabled.
- Normal uninstall ran its callback, removed plugin configuration, hooks, realm
  definitions and a seeded user grant, dropped the tracked table and column, and
  removed schema-tracking rows. The plugin source directory remained on disk.

Filed [#223](https://github.com/kadupulhq/kadupul/issues/223) for CLI core-version
compatibility enforcement and [#224](https://github.com/kadupulhq/kadupul/issues/224)
for existing-realm allperms assignment. Both have native type `Bug`, label `bug`,
assignee `somethingwithproof`, revision, environment, severity, reproduction,
expected/actual behavior, workaround, and acceptance criteria. The corresponding
CLI call patterns remain in current GitHub source. No applicable organization
project or open milestone was available.

Runtime scope excludes manual web management, dependent-plugin version failures,
remote collectors/replication, hook ordering between plugins, malformed hook
returns, direct plugin URL access, malicious code containment, and untracked
schema cleanup. These paths are source-reviewed or left unvalidated, not claimed
as runtime-tested. The application code is unchanged. Documentation remains local
and unpublished, and the pre-commit gate was skipped as requested.

Containers and volumes were removed. Website `check:all` passed: 86 tests with
100% coverage, 3,168 generated pages, 384,558 internal links including 123,540
anchor targets, and zero broken links. The 42 existing translation freshness
warnings remain. `git diff --check` passed.

## Aggregate graph validation — 2026-09-21

Reviewed `guides/build-aggregate-graphs.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected rebuild ordering and deleted
member cleanup claims, qualified source-template updates, explained duplicate-free
totalling and percentile reconstruction, and removed an unconditional claim about
how unknown samples appear in stacks.

Source evidence: `lib/aggregate.php`, `lib/api_aggregate.php`, `lib/api_graph.php`,
`graphs.php`, and `aggregate_graphs.php`.

The disposable `kadupul-doc-aggregate-validation` fixture used PHP 8.4.25,
MariaDB 10.11, RRDtool 1.7.2, and local SNMP interface graphs for `lo` and `eth0`.
Production aggregate helpers ran against its real database. Runtime checks confirmed:

- Creating an aggregate added no data sources and copied the two members' items.
- Creation with member order `6,5` stored that order. Rebuilding with No Reordering
  changed membership to `5,6` and changed copied-item order.
- Rebuilding discarded a manual copied-item text edit.
- Explicit disassociation and association changed membership from two to one and
  back to two.
- Graph-only deletion of member 5 retained its aggregate membership row. Pruning
  removed that row but left all 12 copied items referencing its retained data
  source items. A subsequent explicit rebuild removed those references.
- Conversion to an ordinary graph removed aggregate registration while preserving
  its graph items.

Filed [#226](https://github.com/kadupulhq/kadupul/issues/226) for rebuild ordering
and [#227](https://github.com/kadupulhq/kadupul/issues/227) for deletion cleanup.
Both have native type `Bug`, label `bug`, assignee `somethingwithproof`, component,
severity, environment, source revision, reproduction, expected/actual behavior,
cause, workaround, and acceptance criteria. No applicable organization project or
open repository milestone was available. Local reproduction artifacts are
`/tmp/validate-kadupul-aggregate.py`, `/tmp/kadupul-aggregate-validation.json`, and
`/tmp/kadupul-aggregate-runtime.log`.

Runtime scope excludes browser form selection, rendered graph pixels, numeric
totals/percentiles, unknown-sample rendering, color templates, all ordering modes,
aggregate-template migration/propagation, and concurrent membership changes. Those
paths are source-reviewed or remain unvalidated, not claimed as runtime-tested.
The application worktree remains clean; fixture containers and volumes were
removed. Documentation remains local and unpublished, and the pre-commit gate was
skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,580 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.

## Graph appearance validation — 2026-09-21

Reviewed `guides/tune-graph-appearance.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected template field ownership,
autoscale limit wording, base-value validation/comparison, line-width controls,
negative-exponent workarounds, and the grid-step/label-factor syntax. Cross-checked
the existing line-type and width definitions in `reference/graph-items.md`.

Source evidence: `lib/rrd.php`, `lib/template.php`, `lib/html_form_template.php`,
`lib/functions.php`, `graphs.php`, `graphs_items.php`, `graph_templates_items.php`,
and `include/global_form.php`.

The disposable `kadupul-doc-appearance-validation` fixture used PHP 8.4.25,
MariaDB 10.11, RRDtool 1.7.2, one local SNMP interface graph and a deterministic
GAUGE RRD. Runtime checks used production option/graph generation and template
push helpers against the real database:

- Autoscale modes 1–4 emitted neither limit, lower only, upper only, and both
  limits respectively. Disabling autoscale passed both supplied limits.
- Unit exponent `-6` was omitted; positive `3` was emitted. Real RRDtool accepted
  both the generated command and a control with explicit `--units-exponent=-6`,
  producing valid 803x290 SVG images. This establishes option acceptance, not a
  visible difference: automatic scaling may choose the same prefix.
- Renderer base comparison accepted `1000`, `1024`, and `1024 `; it omitted
  `1,024` and `2048`. Save-form integer validation was source-reviewed separately.
- SI-unit output depended on logarithmic mode. Rigid and no-legend options,
  plus explicit width/height overrides, appeared as expected.
- With saved width 5, LINE1/2/3 generated their fixed-width commands; LINE:STACK
  generated LINE5. Editor source exposes the width field for all four types.
- A template push overwrote local width 333 with shared width 777 when `t_width`
  was empty. With `t_width='on'`, the local width remained 333 despite template
  width 888. Local edits do not automatically detach a field.

Filed [#228](https://github.com/kadupulhq/kadupul/issues/228) for negative
exponents, [#229](https://github.com/kadupulhq/kadupul/issues/229) for the ignored
line-width control, and [#230](https://github.com/kadupulhq/kadupul/issues/230)
for autoscale help. All have native type `Bug`, label `bug`, assignee
`somethingwithproof`, component, severity, environment, source revision,
reproduction, expected/actual behavior, cause, workaround and acceptance criteria.
The help issue also has label `documentation`. No applicable organization project
or open repository milestone was available.

Local evidence: `/tmp/validate-kadupul-appearance.py`,
`/tmp/kadupul-appearance-validation.json`, and
`/tmp/kadupul-appearance-runtime.log`. Runtime scope excludes interactive form
submission, pixel-level styling comparisons, numeric clipping boundaries, all
legend substitutions, right-axis transformations and old RRDtool versions.
Those paths are source-reviewed or remain unvalidated, not claimed as tested.
The application code is unchanged. Documentation remains local and unpublished;
the pre-commit gate was skipped as requested.

Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,646 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. The final counter-wrap
prose clarification was separately linted after the full checks started.
`git diff --check` passed.

## Corrupted-RRD recovery validation — 2026-09-21

Reviewed `guides/recover-a-corrupted-rrd.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected corruption diagnosis,
staged restore instructions, writer coordination, ownership/mode requirements,
history guarantees, checker scope and heartbeat conditions, splice output naming
and temporary work during dry-run. Internal documentation links target website
routes; external RRDtool references point to the official restore and tune manuals.

Source evidence: `cli/splice_rrd.php`, `lib/rrd_maintenance.php`, `lib/rrd.php`,
`lib/rrdcheck.php`, `lib/dsdebug.php`, `include/global_settings.php` and
`include/global_arrays.php`. Checker scheduling, automated repair and orphan
cleanup descriptions were source-reviewed, not exercised through the browser.

The disposable `kadupul-doc-recovery-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2, with SQLite enabled for splice. Two synthetic
single-field GAUGE RRDs used step 60, heartbeat 120 and one 40-row AVERAGE archive.
Actual commands confirmed:

- Staged dump/restore preserved every fetched sample and the original file digest.
- An intact file with mode 000 failed `info` with `Permission denied`; restoring
  access left its original digest unchanged.
- Malformed XML was rejected without changing the original RRD.
- Splice dry-run reported `new.rrd.new`, preserved both input digests and created
  no final RRD. It still used temporary intermediates.
- Committed splice created that `.new` output, replaced a zero and an unknown
  with the old value 10, preserved a nonzero new value 20 and left both inputs intact.

A root/owner dry-run probe was refused by the storage lease before ownership
handling, leaving the output owner and bytes unchanged. This does not validate
that downstream ownership code or establish an ownership-mutation bug.
Cross-step conversion, multiple fields/archives, truncated-file salvage, injected
rename failures, concurrency, remote storage and Windows were not runtime-tested.
The guide's shell examples passed `bash -n`; dump/restore and splice components
were exercised, but the complete manual recovery/install workflow was not run
verbatim and no candidate was installed into a production system.

Filed [website #13](https://github.com/kadupulhq/website/issues/13), with native
type `Bug`, labels `bug` and `documentation`, and assignee `somethingwithproof`.
The report includes component, severity, environment, revisions, reproduction,
expected/actual behavior, evidence, workaround, scope limits and acceptance
criteria. No organization project or open website milestone was available.

Local evidence: `/tmp/validate-kadupul-recovery.py`,
`/tmp/kadupul-recovery-validation.json` and `/tmp/kadupul-recovery-runtime.log`.
Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,690 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
Changes remain local and unpublished; the pre-commit gate was skipped as requested.

## Hardware migration validation — 2026-09-21

Reviewed `guides/migrate-to-new-hardware.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected durable-queue requirements,
final restore overrides, all-producer quiescing, isolated rehearsals, effective
RRA paths, numeric storage trust settings, conditional remote replication,
RRD compatibility checks and overconfident diagnosis/history guarantees.
Documentation links use website routes; the architecture-transfer reference
points to RRDtool's official dump manual.

Source evidence: `docs/upgrading-rrd-storage.md`, `docs/migration.md`,
`cli/upgrade_database.php`, `cli/rebuild_poller_cache.php`,
`cli/poller_replicate.php`, `include/global.php`, `include/config.php.dist`,
`lib/functions.php` and `lib/rrd_maintenance.php`.

The disposable `kadupul-doc-migration-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2. Actual service-account CLI/database calls confirmed:

- Fresh InnoDB queue and local storage passed `--check-rrd-storage` for UID/GID 33.
- After placing one synthetic pending sample in `poller_output` and changing its
  engine to MEMORY, storage checks exited 1 and required InnoDB.
- `--migrate-poller-queue` converted the queue without changing the sample;
  subsequent storage checks passed.
- A private logical database dump restored the pending sample and replaced a
  rehearsal destination RRDtool path with the source path from the dump.
- `cli/poller_replicate.php` exited 1 when no enabled remote collector existed.

These are fixture-level checks, not a complete two-host hardware migration.
Cross-architecture RRD conversion, full path/cache relocation, actual remote
replication, service-account remapping, concurrent cutover, plugin migration and
production acceptance were not runtime-tested. Five shell examples passed `sh -n`;
the complete cutover procedure was not executed verbatim.

Filed [website #14](https://github.com/kadupulhq/website/issues/14) with native
type `Bug`, labels `bug` and `documentation`, and assignee `somethingwithproof`.
The report includes component, severity, revisions, environment, reproduction,
expected/actual behavior, evidence, workaround, acceptance criteria and scope.
No open website milestone or organization project was available.

Local evidence: `/tmp/validate-kadupul-migration.py`,
`/tmp/kadupul-migration-validation.json`, `/tmp/kadupul-migration-runtime.log`.
Fixture containers and volumes were removed; the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,756 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
Changes remain local and unpublished; the pre-commit gate was skipped as requested.

Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,580 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.

## Data retention validation — 2026-09-21

Reviewed `guides/manage-data-retention.md` and related retention statements in
`concepts/data-sources-and-rras.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Clarified stored data-source step versus
profile archives, sizing estimates, structural UI restrictions, heartbeat
maintenance, deletion protection and explicit file migration. Corrected the
concept page's claims that consolidation waits for the finest archive to expire
and that adding a field necessarily loses all history.

Source evidence: `data_source_profiles.php`, `data_templates.php`, `lib/rrd.php`,
`cli/update_heartbeat.php`, `cli/splice_rrd.php`, and `cacti.sql`. The linked
[RRDtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) and
[resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) documentation was
checked for maintenance capabilities and link availability; these operations
remain version-dependent and require separate migration validation.

The disposable `kadupul-doc-retention-validation` installation used PHP 8.4.25,
MariaDB 10.11, RRDtool 1.7.2, authenticated HTTP requests and a local SNMP interface
data source. An initial fixture run failed because the test query did not quote
the reserved column `rows`; after correcting that test-only query, runtime
validation passed:

- Installed steps, heartbeats, archive multipliers and row counts matched all
  three documented shipped profiles. Each kept four consolidation functions.
- The real duplicate action copied four archive definitions and four functions.
- The resulting RRD had step 300 and sixteen RRAs. Calling the normal create
  helper again returned -1 and preserved its SHA-256 digest.
- The in-use profile page disabled step but kept heartbeat editable. An HTTP
  save with heartbeat 900 and no step left profile heartbeat 600, set local
  item heartbeat 900 and changed an unrelated template's sentinel heartbeat
  from 1200 to 900. The existing RRD remained byte-for-byte unchanged at 600.
- A create-definition preview used the updated local item heartbeat 900.
- The CLI's old-heartbeat filter matched database state, not the RRD's 600, and
  returned nonzero for that no-match selection. After aligning only the fixture
  profile to 900, a template-scoped CLI run returned 0 and real `rrdtool info`
  confirmed heartbeat 900 in the existing file.
- An authenticated bulk-delete POST accepted the in-use profile ID, removed its
  definitions and left references behind. A new creation definition returned
  false; the existing RRD remained readable.

Filed [#232](https://github.com/kadupulhq/kadupul/issues/232) for incomplete
heartbeat saving, [#233](https://github.com/kadupulhq/kadupul/issues/233) for
cross-template heartbeat propagation, and
[#234](https://github.com/kadupulhq/kadupul/issues/234) for in-use profile deletion.
All have native type `Bug`, label `bug`, assignee `somethingwithproof`, component,
severity, environment, source revision, reproduction, expected/actual behavior,
cause, workaround and acceptance criteria. No applicable organization project or
open repository milestone was available.

Local evidence: `/tmp/validate-kadupul-retention.py`,
`/tmp/kadupul-retention-validation.json`, and `/tmp/kadupul-retention-runtime.log`.
Runtime scope excludes browser JavaScript execution, numerical consolidation
accuracy, long-term retention expiry, splice/resize migrations, external files,
remote collectors, concurrent writers and CLI forced-update scope. HTTP saves
used the fields a disabled-step form submits; no interactive browser action is
claimed. The application code is unchanged. Documentation remains local and
unpublished; the pre-commit gate was skipped as requested.

Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,602 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.

## Tree organization validation — 2026-09-21

Reviewed `guides/organize-devices-with-trees.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected CLI site-node creation,
parent validation, alphabetic node defaults, example-ID handling, optional site
assignment and the unsupported claim of an enforced 30-level creation limit.
Aligned the graph permission formulas with the earlier permissions audit and
existing issue #222; clarified tree navigation versus content permissions and
policy-dependent permission exceptions.

Source evidence: `cli/add_tree.php`, `cli/add_perms.php`, `lib/api_tree.php`,
`lib/html_tree.php`, `lib/auth.php`, `tree.php`, and `include/global_constants.php`.

The disposable `kadupul-doc-trees-validation` installation used PHP 8.4.25 and
MariaDB 10.11. Actual CLI and production helper calls confirmed:

- A new naturally sorted tree ordered `port2` before `port10`. New CLI headers
  still recorded alphabetic sorting for their own children unless overridden.
- Device and graph nodes were saved under the selected parent. Device grouping
  style 2 persisted, and `--list-nodes` reported the structure.
- The advertised site command returned 1 with `Invalid Argument: (--site-id)`
  and created no row. A direct generic-helper probe with a non-header type value
  of 4 and a valid site ID created a row with site/host/graph IDs all zero.
- The editor's `api_tree_copy_node()` path preserved the same site reference.
- The production allowed-site-device lookup returned device 1, then devices 1
  and 2 after a second enabled fixture device was assigned to the site, without
  adding an explicit tree item for device 2.
- CLI creation with nonexistent parent 999999 exited 0 and stored that parent
  in an orphan header row.

The first fixture run stopped because its expected error wording differed from
the CLI's actual wording. A subsequent run stopped at a visibility assertion
while fixture devices were disabled. After correcting the test and enabling only
its test devices, the full run passed. No polling or external network probes ran.

Filed [#235](https://github.com/kadupulhq/kadupul/issues/235) for incomplete site
creation and [#236](https://github.com/kadupulhq/kadupul/issues/236) for orphan
creation. Both have native type `Bug`, label `bug`, assignee `somethingwithproof`,
component, severity, environment, revision, reproduction, expected/actual behavior,
cause, workaround and acceptance criteria. No applicable organization project or
open repository milestone was available.

Local evidence: `/tmp/validate-kadupul-trees.py`,
`/tmp/kadupul-trees-validation.json`, and `/tmp/kadupul-trees-runtime.log`.
Runtime scope excludes browser drag-and-drop, concurrent edits, deep nesting,
all sort modes, group-specific pruning and direct graph endpoint authorization.
Permission formulas reuse the prior audit's evidence; this turn does not claim
a new permission matrix or access-isolation test. The application code is
unchanged. Documentation remains local and unpublished; the pre-commit gate was
skipped as requested.

Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,624 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.

## Backup and restore validation — 2026-09-21

Reviewed `guides/back-up-and-restore.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected the incomplete backup example,
writer/flush ordering, partial-output handling, live-skew history claims,
snapshot assumptions, RRD field naming and overconfident restore diagnosis.
The revised example captures configuration/code, uses the actual RRA path and a
private client option file, stages incomplete outputs separately, and checksums
the captured set before renaming it. Its Bash syntax check passed.

Source evidence: `include/config.php.dist`, `lib/rrd.php`, `poller_boost.php`, and
the existing installation harness. The official
[mysqldump manual](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
supports the documented transaction/schema-change limitations; the guide links
that source and notes engine-specific backup requirements.

The disposable `kadupul-doc-backup-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2. It had no scheduled writers. A local interface
data source was created through application code and its production-created RRD
received deterministic counter updates. The fixture then captured all database
tables, that representative RRD, `include/config.php` and a code marker without
printing configuration or dump contents.

Runtime checks confirmed:

- The database dump was created with mode 0600.
- After independent changes to a device description, RRD samples and code marker,
  restoring the database and archives recovered the original description and
  code marker, preserved the configuration hash, and restored the RRD byte for
  byte according to SHA-256.
- The restored RRD rejected an update at its existing last timestamp, then
  accepted a later update and advanced its last-update time.
- A deliberately failed dump under `set -e` returned nonzero and skipped the
  subsequent success marker, yet its redirected output file still existed.

Filed [website #12](https://github.com/kadupulhq/website/issues/12) for the guide's
incomplete recipe and consistency claims. It has native type `Bug`, labels `bug`
and `documentation`, assignee `somethingwithproof`, component, severity,
environment, source revisions, reproduction, expected/actual behavior, evidence,
workaround and acceptance criteria. No applicable organization project or open
website milestone was available. Corrections remain local, so the issue stays open.

Local evidence: `/tmp/validate-kadupul-backup.py`,
`/tmp/kadupul-backup-validation.json`, and `/tmp/kadupul-backup-runtime.log`.
The fixture tested the component restore operations, not the entire revised
shell recipe verbatim. Scope excludes live snapshots, writer races, Boost replay,
rrdcached, remote storage, encryption/transport, full deployment reconstruction,
account grants outside the application database and post-restore poller behavior.
The resumed-update check used RRDtool directly. The application code is unchanged;
documentation remains local and unpublished, and the pre-commit gate was skipped.

Fixture containers and volumes were removed and the application worktree is clean.
Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,624 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.

## Spike removal validation — 2026-09-21

Reviewed `guides/remove-spikes-from-data.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected window-method replacement,
replacement limits/counts, measured-zero handling, matching preview/commit
examples, recovery-copy semantics, atomic replacement, storage prerequisites and
ownership preservation. Updated the description and regenerated documentation maps.

Source evidence: `cli/removespikes.php`, `lib/spikekill.php`,
`include/global_settings.php`, and `docs/testing/spikekill-safety.md`. Existing
issues #76 (backup flag) and #99 (Windows support) were checked to avoid duplicates;
this turn does not close those issues or claim Windows validation.

The disposable `kadupul-doc-spikes-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2. Its local RRD held one GAUGE field and one
AVERAGE RRA at a 60-second step, with ordinary values 10, three separated peaks
1000, a measured zero and an unknown interval. Actual CLI calls confirmed:

- Dry-run preserved the live RRD SHA-256 digest.
- `float --avgnan=nan` returned 0 but left the selected peak at 1000;
  `fill --avgnan=nan` returned 0 but left its selected zero unchanged.
- `stddev --stddev=1 --number=1 --avgnan=nan --backup` replaced all three peaks
  with unknown in the same archive, yet reported `Total Spikes 0`.
- Two retained recovery RRD copies matched the original digest. Successful
  replacement preserved mode/UID/GID `644:33:33`.
- `fill --avgnan=last` changed the measured zero to 10, confirming that it is not
  restricted to unknown samples.
- Missing window arguments and an invalid date returned nonzero without changing
  the live file.

The initial run incorrectly expected a no-op XML round trip to preserve binary
layout; it can change the file hash without changing samples. After changing
that assertion to inspect retained values and restoring the original fixture
before the limit test, the complete run passed. No production RRD was touched.

Filed [#237](https://github.com/kadupulhq/kadupul/issues/237) for ineffective NaN
window replacement and [#238](https://github.com/kadupulhq/kadupul/issues/238) for
replacement limits and counts. Both have native type `Bug`, label `bug`, assignee
`somethingwithproof`, component, severity, environment, revision, reproduction,
expected/actual behavior, cause, workaround and acceptance criteria. No applicable
organization project or open repository milestone was available.

Local evidence: `/tmp/validate-kadupul-spikes.py`,
`/tmp/kadupul-spikes-validation.json`, and `/tmp/kadupul-spikes-runtime.log`.
Runtime scope excludes multiple fields/archives, variance-method numerical
behavior, all replacement combinations, browser/batch execution, retention cleanup,
concurrent writers, injected restore failures, Windows and remote/cache storage.
Those paths are source-reviewed or remain unvalidated, not claimed as tested.
The application code is unchanged. Documentation remains local and unpublished;
the pre-commit gate was skipped as requested.
## Upgrade validation — 2026-09-21

Reviewed `guides/upgrade-safely.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected matched-backup rollback,
RRD recovery, deployment overlays and storage paths, source versus schema version,
all-producer quiescing, durable queue conversion, per-account storage checks,
CLI acceptance, plugin lifecycle scope and remote restart ordering. Regenerated
documentation maps after updating the description.

Source evidence: `cli/upgrade_database.php`, `docs/upgrading-rrd-storage.md`,
`include/auth.php`, `include/cacti_version`, `lib/installer.php` and the upgrade
scripts. Source review distinguishes legacy authenticated-page redirects and
web-installer plugin checks from the schema CLI's narrower behavior.

The disposable `kadupul-doc-upgrade-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2. Actual commands confirmed:

- Current schema 1.2.31 returns a successful already-current no-op.
- An unknown version marker 1.2.999 is rejected in output but exits 0 and remains
  unchanged. A 0.6.0 marker is also refused with exit 0. The fixture restored its
  original marker after testing; these were not actual historical schemas.
- Combined storage-check and queue-conversion flags are rejected with exit 1;
  standalone storage checks pass under service UID/GID 33.
- Overlay copying synthetic files retains obsolete files absent from the new tree.

Filed [application #240](https://github.com/kadupulhq/kadupul/issues/240) for
successful exit status on rejected versions and
[website #15](https://github.com/kadupulhq/website/issues/15) for unsafe upgrade
guidance. Both have native type `Bug`, label `bug`, assignee `somethingwithproof`,
and complete component/severity/version/environment/reproduction/evidence/workaround/
acceptance metadata. The website report also has `documentation`. No applicable
open milestones or organization projects were available.

Local evidence: `/tmp/validate-kadupul-upgrade.py`,
`/tmp/kadupul-upgrade-validation.json`, `/tmp/kadupul-upgrade-runtime.log`.
Runtime scope excludes real historical migrations, injected partial migration
failure, release symlink deployment, plugin upgrades and remote upgrades.
Five shell examples passed `bash -n`; the full upgrade/rollback procedure was not
executed verbatim. Fixture containers and volumes were removed. Application code
is unchanged.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,822 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
Changes remain local and unpublished; the pre-commit gate was skipped as requested.
## Collection-script validation — 2026-09-21

Reviewed `guides/write-a-data-collection-script.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected PHP-poller output scope,
numeric stripping, ignored exit status, trailing whitespace, empty arguments,
multi-output collection, file creation and whitelist prerequisites. Both shell
examples now emit explicit unknown values for omitted/empty arguments, set PATH,
select 1024-byte blocks and state that they do not implement a timeout.

Source evidence: `cmd.php`, `lib/poller.php`, `lib/functions.php`,
`lib/utility.php`, `lib/template.php` and `script_server.php`.
The disposable `kadupul-doc-scripts-validation` installation used PHP 8.4.25,
MariaDB 10.11 and RRDtool 1.7.2. Actual helper calls confirmed:

- `trim` plus `prepare_validate_result` accepts a trailing space on a paired line
  but rejects an internal double space.
- `warning 42` and `42%` are accepted as 42 after numeric stripping.
- The normal popen helper reads only the first line and returns printed 42 even
  when the child exits 7.
- Original shell examples exit without stdout when the argument is omitted;
  normal and nonexistent paths exercise their existing numeric/unknown branches.

Revised shell examples were run separately on macOS for normal, nonexistent,
empty and omitted paths; all passed. This does not validate blocked filesystem
timeouts or portability to every supported shell/platform.
Runtime scope excludes Spine, shell_exec fallback, script-server lifecycle,
placeholder expansion, full poller/field-mapping integration and RRD writes.
Those statements are source-reviewed or unvalidated rather than claimed as tested.

Filed [website #16](https://github.com/kadupulhq/website/issues/16), native type
`Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`, with
component, severity, revisions, environment, reproduction, evidence, workaround,
scope and acceptance criteria. No open website milestone or organization project
was available. No application bug is inferred from intentional numeric stripping.

Local evidence: `/tmp/validate-kadupul-scripts.py`,
`/tmp/kadupul-scripts-validation.json`, `/tmp/kadupul-scripts-runtime.log` and
`/tmp/kadupul-scripts-original-guide.md`. Fixture containers and volumes were
removed; application worktree remains clean. Changes are local and unpublished;
the pre-commit gate was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,844 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Poller scaling validation — 2026-09-21

Reviewed `guides/scale-the-poller.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected MEMORY-queue tuning,
runtime versus stored PHP thread count, whole-device process leveling, connection
estimates, base cadence versus source steps, retained samples, forced launches,
diagnostic certainty and remote/Spine qualifications.

Source evidence: `poller.php`, `include/global_settings.php`,
`include/global_arrays.php`, `cacti.sql`, `lib/rrd_maintenance.php` and
`cli/upgrade_database.php`. Process leveling selects contiguous whole-device
boundaries using item counts, not measured execution time. The PHP branch sets
the runtime thread variable to 1 without rewriting collector configuration.

Reused existing same-revision migration evidence from
`/tmp/kadupul-migration-validation.json`: the Linux Docker fixture (PHP 8.4.25,
MariaDB 10.11, RRDtool 1.7.2) refused a MEMORY queue and converted it to InnoDB
without losing its synthetic pending sample. That test was run during the migration
audit, not repeated here. No new fixture or load benchmark was launched.
Actual balancing performance, forced concurrent launches, notification delivery,
Spine, remote buffering/recovery and peak database connections remain unvalidated.

Filed [website #17](https://github.com/kadupulhq/website/issues/17) with native
type `Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`.
Metadata includes component, severity, revisions, environment, reproduction,
evidence, scope, workaround and acceptance criteria. No open website milestone
or organization project was available. The application worktree remains clean;
documentation changes are local and unpublished. Pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,932 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Database performance validation — 2026-09-21

Reviewed `guides/tune-database-performance.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected durable queue guidance,
MEMORY-table scope, workload-dependent sizing, flush durability, analysis costs,
schema baseline acceptance, collation guarantees, packet failures and session modes.
Reviewed official MariaDB InnoDB variable documentation for the durability guidance.

Source evidence: `cli/analyze_database.php`, `cli/audit_database.php`,
`lib/database.php`, `include/global_settings.php`, `cacti.sql` and durable-queue
preflight. Existing same-revision migration evidence confirms the queue requires
InnoDB and conversion preserves its pending sample; that test was not repeated.

New disposable `kadupul-doc-dbtuning-validation` fixture: PHP 8.4.25, MariaDB 10.11,
RRDtool 1.7.2, service UID/GID 33. Exact binlog-branch SQL
`ANALYZE TABLE NO_WRITE_TO_BINLOG version` returned false through `db_execute`;
the corrected `ANALYZE NO_WRITE_TO_BINLOG TABLE version` returned true.
This tested the emitted statements, not an end-to-end binlog-enabled CLI run.

Actual `cli/audit_database.php --report` in the fixture lacking its runtime
canonical SQL baseline printed `FATAL: Failed to find Audit Schema`, then
`Audit was clean, no errors or warnings`, with exit 0. The source checkout has
`docs/audit_schema.sql`; the defect is failure handling when the runtime baseline
is unavailable. No repair was attempted, and a valid-baseline control was not run.

Filed application [#241](https://github.com/kadupulhq/kadupul/issues/241) and
[#242](https://github.com/kadupulhq/kadupul/issues/242), plus
[website #18](https://github.com/kadupulhq/website/issues/18). All have native
type `Bug`, label `bug`, assignee `somethingwithproof`, component, severity,
revision/environment, reproduction, evidence, workaround and acceptance criteria.
Website #18 also has `documentation`. No open milestones or organization projects
were available. No performance benchmark, packet-failure injection, restart
durability test, remote analysis or collation-changing repair was performed.

Local evidence: `/tmp/validate-kadupul-dbtuning.py`,
`/tmp/kadupul-dbtuning-validation.json`, `/tmp/kadupul-dbtuning-runtime.log`.
Fixture containers and volumes were removed; application worktree remains clean.
Documentation changes are local and unpublished; pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,954 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Capacity planning validation — 2026-09-21

Reviewed `guides/capacity-planning.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected field-count inventory,
editor-size versus physical allocation, logical updates versus physical IOPS,
durable backlog sizing, connection arithmetic, memory limits versus allocations,
unvalidated Spine examples and unsupported hardware/row-size ceilings.

Source evidence: `lib/utility.php`, `data_source_profiles.php`, `cacti.sql`,
`poller.php`, `cmd.php` and `include/global_settings.php`. A two-field query can
emit two rows each with rrd_num=2; a two-field ordinary script can emit one row
with rrd_num=1. SUM(rrd_num) is therefore not a valid field inventory. These are
source-derived counterexamples, not newly created runtime cache fixtures.

Recomputed editor arithmetic through mise Python 3.12.12 and checked shipped
archive definitions: row totals 2,872/10,071/20,429; estimated bytes per field
92,204/322,572/654,028. With 2,000 files and 4,000 fields, the 5-minute estimate
is 369,384,000 bytes. The 16-process, 20-thread, one-script-server worker estimate
is 336 before other clients. Evidence: `/tmp/kadupul-capacity-arithmetic.json`.
Prior same-revision queue fixture evidence is reused; no new database fixture,
Spine execution, live collection, filesystem allocation, IOPS, row-size or throughput
benchmark was run. The guide now labels such estimates and assumptions explicitly.

Filed [website #19](https://github.com/kadupulhq/website/issues/19), native type
`Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`, with
component, severity, revisions, environment, reproduction, evidence, workaround,
scope and acceptance criteria. No open website milestone or organization project
was available. Application worktree remains clean. Changes are local and unpublished;
pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,954 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Self-monitoring validation — 2026-09-21

Reviewed `guides/monitor-kadupul-itself.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected direct-path file/timestamp
acknowledgement counts, latest versus cumulative collector timing, pending-sample
retention and orphan cleanup, cache-rebuild scope, graph freshness and operational
threshold certainty. Qualified notification delivery, InnoDB metadata estimates,
cache-count changes and diagnostic log interpretation.

Source evidence: `poller.php`, `lib/poller.php`, `lib/utility.php`, `cacti.sql`.
Direct writes count successful `completed[path][timestamp]` entries, not distinct
RRD paths; `total_time` is replaced by the latest loop duration. Valid pending
samples survive the nonempty-output warning; orphan cleanup has narrower predicates.
The known cache-filter bug #197 is linked using prior runtime evidence, not retested.

Parsed `install/templates/Cacti_Stats.xml.gz` with mise Python 3.12.12: valid XML,
package Cacti Stats version 1.2.31, nine embedded file entries. This does not
establish package import success or graph completeness. No live collection,
package import, mail delivery, SNMP-agent deployment, retention sweep, replay,
graph flush or load benchmark was run. Findings are source/package inspection;
unchanged ancillary subsystem claims were not exhaustively runtime-tested.

Filed [website #20](https://github.com/kadupulhq/website/issues/20) with native
type `Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`,
including component, severity, revisions, environment, reproduction, source
evidence, workaround, scope and acceptance criteria. No open website milestone
or organization project was available. Application worktree remains clean;
changes are local and unpublished. Pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,954 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Custom-template validation — 2026-09-21

Reviewed `guides/create-custom-templates.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Corrected duplicated-template
dependencies, override-aware child propagation, in-use structural editor controls,
profile/limit configuration versus actual RRD state, recovery without mandatory
history loss, data-independent graph items and script field-name mapping.

Source evidence: `lib/api_graph.php::api_duplicate_graph`,
`lib/api_data_source.php::api_duplicate_data_source`, `lib/template.php` push
helpers, `data_templates.php` save/UI paths and `lib/rrd.php`. Graph-item copies
retain task references; data-template copies retain input/profile dependencies.
Push helpers update controlled child fields; per-instance flags exempt others.
The in-use editor's readOnly state disables selected structural controls.

This was source validation, not a new runtime duplication, UI save or propagation
test. Prior same-revision appearance and RRD-recovery audits provide related
override/recovery evidence and were not rerun. No full template lifecycle,
duplicate-name enforcement, direct POST bypass, actual tune or field rename was
runtime-tested in this section. No application bug is inferred from these paths.

Filed [website #21](https://github.com/kadupulhq/website/issues/21) with native
type `Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`,
including component, severity, revisions, environment, reproduction, evidence,
workaround, scope and acceptance criteria. No open website milestone or organization
project was available. Application worktree remains clean; changes are local and
unpublished. Pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
384,998 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
## Linux monitoring validation — 2026-09-21

Reviewed `guides/monitor-a-linux-server.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`, the packaged Net-SNMP templates and
official Net-SNMP snmpd.conf/UCD MIB documentation. Corrected symbolic probe OID,
overconfident access diagnosis, package/import prerequisites, fixed data-template
versus graph scope, legacy CPU percentage objects, explicit disk selection versus
includeAllDisks, script name/whitespace rules, script-server process scope and
reviewed whitelist update selection.

Decoded `install/templates/NetSNMP_Device.xml.gz` with mise Python 3.12.12 and
parsed its embedded `NetSNMP_Device.xml`. The guide's fixed OIDs occur in that
template. Evidence: `/tmp/kadupul-linux-package-template.xml`. This was not package
signature verification or installation. Source evidence also includes
`data_templates.php`, `cmd.php`, `lib/functions.php` and `cli/input_whitelist.php`.
Prior same-revision collection-script validation confirms trailing-space trimming;
that fixture was not rerun. Shell command blocks passed `bash -n`.

No live Linux SNMP agent, target coverage, authentication/view configuration,
disk-index discovery, graph rendering, whitelist update or script-server runtime
was exercised. Net-SNMP manual findings are linked in the guide; package presence
does not prove deployment success.

Filed [website #22](https://github.com/kadupulhq/website/issues/22), native type
`Bug`, labels `bug` and `documentation`, assigned to `somethingwithproof`, with
component, severity, revisions, environment, reproduction, evidence, workaround,
scope and acceptance criteria. No open website milestone or organization project
was available. Application worktree remains clean. Changes are local and unpublished;
pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,064 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Windows monitoring validation — 2026-09-21

Reviewed `guides/monitor-a-windows-host.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`, the seven-file Windows template
package, Microsoft's SNMP installation guidance and RFC 2790. Corrected memory
availability, numeric probe OID, package import and graph creation, script-server
process boundaries, stored uptime, CPU row-count assumptions, storage conversion
and reindex guidance. Documentation navigation continues to use GitHub Pages.

An isolated PHP 8.4.25 probe selected through mise executed the unchanged function
definitions from `scripts/ss_host_disk.php` with SNMP, plugin and database stubs.
For a sample of 42 and allocation units 4096 it returned 172032 (control). Missing
units returned the raw string 42. Negative -1 with missing units raised TypeError.
Negative -2147483648 and -1 with units 4096 returned 17592186040320 and
8796093022208 respectively. The formula is `abs(value) + 2147483647`, not the
unsigned correction promised in the original guide. The embedded package script
also contains this formula. Reproducer: `/tmp/windows-disk-probe.php` and the
application issue. Negative values violate the MIB's nonnegative size/used range;
no universal agent-overflow policy was inferred.

Filed [application #243](https://github.com/kadupulhq/kadupul/issues/243) and
[website #23](https://github.com/kadupulhq/website/issues/23), verified native type
`Bug`, labels `bug` plus `php` or `documentation`, and assignee
`somethingwithproof`. Reports include severity, component, revisions, environment,
reproduction, actual/expected behavior, evidence, workaround, acceptance criteria
and scope. No open milestones or organization projects were available.

This was source/package inspection and a stubbed helper probe, not a Windows SNMP
service, package signature/import, database or full cmd.php/Spine/script-server
lifecycle test. The application worktree remains clean; its reported defect is
unfixed. Website corrections are local and unpublished. Pre-commit was skipped
as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,108 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Virtualization monitoring validation — 2026-09-21

Reviewed `guides/monitor-a-virtualization-host.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Decoded the nine embedded files in
`install/templates/ESXi_Device.xml.gz` and inspected its guest/CPU helpers, query
XML and template input commands. Also reviewed `lib/data_query.php`,
`lib/poller.php`, the standalone CPU helper and the official ESXCLI command
reference. Corrected import/graph-creation instructions, destructive reset in the
routine setup example, numeric probe OID, zero-versus-missing output, credential
refresh, CPU discovery limits, tools status, migration evidence and incomplete
output retention. Documentation navigation remains on GitHub Pages.

An isolated mise PHP 8.4.25 probe executed unchanged extracted guest and CPU
functions with database/SNMP/config stubs. `not installed` at offset zero was
reported as tools running; a prefixed value was counted as not installed. Running
and not-running controls passed; unrecognized text fell through to running.
Three empty guest walks produced five zeros, and empty CPU results were identical
to an observed idle CPU (`load:0`); loads 20 and 80 returned 50. A v3 device still
caused three v1 guest walks while the CPU helper used v3. The packaged CPU regex
matched indexes 9 and 99 but rejected 100 and 196608; source discovery keeps only
matching indexes. Evidence: `/tmp/kadupul-esxi-probe.php`,
`/tmp/kadupul-esxi-probe.jsonl`, and the issue reproducers.

Filed application [#244](https://github.com/kadupulhq/kadupul/issues/244),
[#245](https://github.com/kadupulhq/kadupul/issues/245) and
[#246](https://github.com/kadupulhq/kadupul/issues/246), plus documentation
[#24](https://github.com/kadupulhq/website/issues/24). All assigned to
`somethingwithproof` with native type `Bug`, `bug` label and appropriate `php` or
`documentation` labels. Reports include component, severity, revisions,
environment, reproducible evidence, expected/actual results, workaround, scope and
acceptance criteria. No open milestones or organization projects were available.
The guide also links previously reported shared storage bug #243.

No live ESXi agent, SNMP network, package signature/import, database, full
poller/script-server lifecycle or RRD/graph test was performed. Shell examples
passed `bash -n`; no host configuration commands were executed. The application
worktree remains clean and reported defects remain unresolved. Documentation
changes are local and unpublished. Pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,152 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Environmental sensor validation — 2026-09-21

Reviewed `guides/monitor-environmental-sensors.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Decoded the Net-SNMP, SNMP UPS, AKCP,
APC PDU, APC InRow CRAC and BayTech PDU packages to inspect query files and relevant
templates. Reviewed `scripts/ss_netsnmp_lmsensors.php`, query identity settings,
`lib/rrd.php`, upstream LM-SENSORS-MIB, RFC 1628 and the RRDtool graph reference.
Corrected package prerequisites, raw-versus-display units, invalid vendor OID shell
placeholder, UPS conversion advice, index-root diagnosis, graph bounds, identity
limits and MAX consolidation guidance. Documentation navigation remains on GitHub
Pages.

An isolated mise PHP 8.4.25 probe executed unchanged extracted lmSensors functions
with database/SNMP stubs. Temperature 23500 returned raw 23500 from get and 23.5
from query. Voltage 12000 returned raw 12000 versus query 12; unsigned 4294955296
returned raw data versus query -11.998 because its subtraction constant is off by
two. Empty temperature and invalid voltage returned U from get but raised TypeError
in query sensorReading. Fan 1500 remained 1500 in both paths. The package function
has equivalent logic; its differences from source are comments. Evidence:
`/tmp/kadupul-sensor-probe.php` and `/tmp/kadupul-sensor-probe.jsonl`.

Package graph inspection confirmed temperature uses Divide by 1000 while all
voltage items have cdef_id=0 despite the Volts label. UPS CDEF inspection and
Python arithmetic showed 600 seconds displayed as 0.1 rather than 10 minutes,
and 1000-watt input/output samples scaled to 100 rather than 1000 watts. Compared
with RFC 1628's object units; evidence `/tmp/kadupul-ups-scaling.json`. These are
source/template and arithmetic findings, not rendered graph measurements.

Filed application [#247](https://github.com/kadupulhq/kadupul/issues/247),
[#248](https://github.com/kadupulhq/kadupul/issues/248) and
[#249](https://github.com/kadupulhq/kadupul/issues/249), plus website
[#25](https://github.com/kadupulhq/website/issues/25). Verified native type Bug,
assignee `somethingwithproof`, bug labels and applicable php/documentation labels.
Reports include component, severity, revisions, environment, reproduction,
expected/actual results, evidence, workaround, acceptance criteria and limits.
No open milestones or organization projects were available.

No live sensors, SNMP network, package signature/import, database, RRD rendering
or full poller/script-server lifecycle was tested. Shell examples passed bash -n.
The application worktree remains clean and defects remain unresolved. Documentation
changes are local and unpublished. Pre-commit was skipped as requested.

Website `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,174 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Cacti migration guidance and documentation batch — 2026-09-21

Reviewed `guides/coming-from-cacti.md` against the application README,
`cli/upgrade_database.php` and the existing same-revision backup, migration,
upgrade and RRD validation evidence at application revision
`661a57ff43ebf275e6b07211d4284dd727103959`. Clarified compatibility intent versus
supported migration, history-preserving RRD format conversion, matched backups
and rollback, exact-version rehearsals, plugin/template validation and poller
status. Added GitHub Pages navigation to the detailed procedures and linked the
previously reproduced upgrade exit-status defect #240.

Filed [website #26](https://github.com/kadupulhq/website/issues/26), verified native
Bug type, bug/documentation labels and assignee `somethingwithproof`, with full
reproduction, expected/actual behavior, revisions, environment, severity, scope,
workaround and acceptance criteria. No new application defect or runtime migration
claim was inferred; prior fixture evidence was not rerun.

Prepared this guide with the accumulated documentation audit changes for one PR
against `main`. The batch contains 39 Markdown files, approximately 5,300 changed
lines, and no application-code or dependency changes. GitHub's August 27, 2026
announcement removed the former 300-file/20,000-line Copilot review ceiling; this
batch also fits below those former limits. Detailed subsystem evidence and runtime
limitations are recorded in the dated sections above. Local temporary evidence paths
identify session artifacts; they are not committed artifacts or published URLs.
Pre-commit remains skipped by user instruction; the other Git hooks are retained.

Final batch `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,328 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Worked switch example validation — 2026-09-21

After opening documentation batch PR #27, started a separate local branch
`docs/validate-worked-example` from `0c9e500f5cc985435e91125c3247f2c5fff60548`.
Reviewed `guides/worked-example.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`, especially `cli/add_graphs.php`,
`lib/api_automation_tools.php` and `lib/rrd.php`, plus the already validated switch,
retention, reindex, first-graph and recovery guides. No new application defect was
inferred or application code changed.

Corrected symbolic SNMP probes, missing output-counter checks, cached listings
versus live discovery, unquoted shell placeholders, installation-specific query
IDs, existing-association reindex settings, retention-change claims, port identity
guarantees, counter timing, RRD existence/recency interpretation, archive selection
and utilization arithmetic. Four saturated minutes out of sixty is about 6.7%,
not 10%. Examples passed bash -n; creation commands were not executed. Internal
documentation navigation remains on GitHub Pages.

Filed [website #28](https://github.com/kadupulhq/website/issues/28), native Bug type,
labels bug/documentation and assignee `somethingwithproof`, with component,
severity, revisions, environment, reproduction, actual/expected results,
workaround, acceptance criteria and scope. No milestone/project was established.
No live-switch, SNMP network, graph-creation, RRD or fleet test was performed;
prior subsystem fixtures were not rerun. These changes remain local and are not
included in PR #27. Pre-commit remains skipped as requested.

Worked-example `check:all` passed: 86 tests with 100% coverage, 3,168 generated
pages, 385,328 internal links including 123,562 anchor targets, zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.
PR #27's separate CI website checks also passed; its analysis step was still running
at handoff. Copilot completed review with no findings and recommended approval
(review state COMMENTED, not a formal approving review). No merge was performed.


## Access-audit guide validation — 2026-09-21

Reviewed `guides/audit-who-can-see-what.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`, especially `lib/auth.php`
(get_permission_string, get_policy_where, get_policy_join_select, user_disable),
`user_admin.php`, and the prior same-revision permissions fixture matrix. Corrected
direct graph grants in Device/Template Based modes, Restrictive pairs within each
source, device enumeration, policy-aware exception removal, guest/provisioning
scope and actual access verification. Display labels and tooltips are no longer
presented as definitive proof. Documentation navigation remains on GitHub Pages.

An isolated mise PHP 8.4.25 probe executed the unchanged get_permission_string
function with settings/translation stubs. Under Restrictive and all Deny defaults,
no direct graph grant plus a device grant and no template grant displayed Granted.
Adding the template grant changed the display to Restricted. Inspected authorization
SQL and the prior is_graph_allowed matrix have the opposite, intended results.
This is a display/authorization mismatch, not a demonstrated authorization bypass.
Evidence: `/tmp/kadupul-permission-display-probe.php`,
`/tmp/kadupul-permission-display-probe.jsonl`, and the complete issue reproducer.
No new database, browser/session or HTTP authorization fixture was run.

Filed [application #263](https://github.com/kadupulhq/kadupul/issues/263) and
[website #29](https://github.com/kadupulhq/website/issues/29), native type Bug,
assignee `somethingwithproof`, bug plus php/security or documentation labels.
Reports include component, severity, revisions, environment, reproducible evidence,
expected/actual behavior, workaround, acceptance criteria and limits. No open
milestones or organization projects were available. Application defect remains
unresolved; application worktree is unchanged.

The previous batch PR #27 now has build and both Sonar checks passing, no unresolved
review threads, and Copilot's no-findings review. It remains unmerged. This guide and
the worked-example changes are local on `docs/validate-worked-example`, outside PR
#27. Pre-commit remains skipped as requested.

Access-audit `check:all` passed: 86 tests with 100% coverage, 3,168 generated pages,
385,328 internal links including 123,562 anchor targets, and zero broken links.
The 42 existing translation freshness warnings remain. `git diff --check` passed.


## Internet-facing security guidance validation — 2026-09-21

Reviewed `guides/secure-an-internet-facing-install.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: global/bootstrap/settings, authentication,
installer, whitelist/cache, remote-agent and secure-header source, plus the checked-in
Nginx example and migration notes. Corrected RRA-path configurability, private-path
inventory, asset exceptions, DB-account isolation claims, config ownership, basic-auth
scope, legacy-mode handling, whitelist update selection and cache timing. Linked Apache
and PHP primary documentation; GitHub Pages navigation remains intact.

Pure PHP 8.4.25 calls to CactiSecureHeaders::buildCspPolicy confirmed legacy
unsafe-inline and nonce-based policy construction. Header-name selection for nonce
versus nonce-report was inspected in source. No HTTP/browser CSP enforcement,
plugin compatibility, live proxy, network exposure, database-grant mutation,
whitelist update or penetration test was performed. Shell block passed bash -n.

Filed [application #265](https://github.com/kadupulhq/kadupul/issues/265) for Settings
help that describes existing nonce enforcement as future functionality, and
[website #30](https://github.com/kadupulhq/website/issues/30) for guide inaccuracies.
Both have native Bug type, bug/documentation labels (plus php for the application),
assignee `somethingwithproof`, component, severity, revisions, reproduction,
expected/actual results, evidence, workaround, acceptance criteria and scope.
No new exploit or vulnerability was demonstrated. No applicable open milestone or
organization project was available. Changes remain local outside PR #27;
pre-commit skipped as requested.

Security-guide `check:all` passed: 86 tests, 100% coverage, 3,168 pages,
385,372 internal links (123,562 with anchors), zero broken links; 42 existing
translation freshness warnings remain. `git diff --check` passed.


## Permissions concept validation — 2026-09-21

Reviewed `concepts/permissions-and-access.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`, including get_policy_where,
is_realm_allowed, get_simple_graph_perms, user_disable and realm registration.
Reused the prior same-revision authorization matrix and display mismatch probe;
no new database/browser/runtime authorization test was performed.

Corrected direct graph grants in Device/Template Based modes, Restrictive pairing
within each source before union, two versus one exception categories, enabled-group
realm scope, stored exceptions versus default policies, exclusions versus global
denial, query-shortcut scope, and session/guest evidence. Linked known application
issues #222 and #263 and the GitHub Pages audit guide. No new application defect
was inferred. Application worktree remains unchanged.

Filed [website #31](https://github.com/kadupulhq/website/issues/31), verified native
Bug type, bug/documentation labels and assignee `somethingwithproof`, with
component, severity, revisions, reproduction, expected/actual results, evidence,
workaround, acceptance criteria and limits. No milestone/project was established.
These corrections remain local alongside the worked example, access-audit and
security guides on `docs/validate-worked-example`, outside PR #27. Pre-commit
remains skipped at the user's request.

Permissions-concept `check:all` passed: 86 tests, 100% coverage, 3,168 pages,
385,394 internal links (123,562 with anchors), zero broken links. The 42 existing
translation freshness warnings remain. `git diff --check` passed.


## Plugin concept validation — 2026-09-21

Reviewed concepts/plugins.md and its linked install-and-vet-plugins guide against
application revision 661a57ff43ebf275e6b07211d4284dd727103959, particularly lib/plugins.php
hook dispatch, remote routing, entrypoint naming, realm registration, uninstall and
tracked schema cleanup. Corrected process privilege/isolation claims, notification
side effects, transformation warnings, repeated registration, missing-callback logs,
uninstall callback/source-file behavior, realm grants, disabled/direct URL scope,
remote routing exceptions and call-site-dependent polling frequency.

Reused the earlier same-revision isolated plugin lifecycle evidence in this report;
no fresh plugin installation, remote runtime or adversarial execution was performed.
The original unquoted plugins/<name>/ operand passes bash -n but fails an isolated
execution probe before rg runs: the shell attempts to read a file named name.
Replaced it with a quoted plugin_dir variable; both guide shell blocks pass bash -n.
Application source remains unchanged. GitHub Pages navigation is retained.

Filed website [#32](https://github.com/kadupulhq/website/issues/32), verified native
Bug type, bug/documentation labels and assignee somethingwithproof. Report includes
component, severity, revisions, environment, reproduction, expected/actual behavior,
evidence, workaround, acceptance criteria and verification limits. No new application
vulnerability was demonstrated; no milestone/project was established. Changes remain
local outside PR #27; pre-commit remains skipped as requested.

Plugin-concept check:all passed: 86 tests, 100% coverage, 3,168 pages,
385,416 internal links (123,562 with anchors), zero broken links. The 42 existing
translation freshness warnings remain. git diff --check passed.


## Remote data collection concept validation — 2026-09-21

Reviewed concepts/remote-data-collection.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: include/global.php connection selection,
poller.php scheduling/Boost/replication checks, cmd.php result routing,
lib/poller.php replication/status/liveness helpers, targeted device/plugin replication,
poller_recovery.php transfer loop and lib/database.php failure returns.

Corrected periodic replication eligibility and targeted updates, connection-mode
precedence, Boost activation, selected-column status pushes and liveness limits.
Removed unsupported lossless-delivery and universal collector-ownership-check claims;
preserved the unsupported proxy warning and linked GitHub Pages operational guides.

An isolated PHP 8.4.25 probe executes the unchanged recovery while loop with database
stubs. One failed central insert is followed by a local DELETE attempt, while the
inserted counter increases to one. Evidence: /tmp/kadupul-remote-recovery-probe.php.
The probe tests the final packet failure branch; partial-packet failure was inspected
in source. No live remote database outage, production loss, multi-collector deployment
or RRD replay was tested. Application source remains unchanged.

Filed application [#268](https://github.com/kadupulhq/kadupul/issues/268) for unchecked
recovery writes followed by local deletion, and website
[#33](https://github.com/kadupulhq/website/issues/33) for incorrect guarantees.
Both reports have verified native Bug type, bug label, appropriate php/documentation
label, assignee somethingwithproof, component, severity, revisions, environment,
reproduction, expected/actual behavior, evidence, workaround, acceptance criteria and
limits. No new exploit or authorization bypass was demonstrated. No milestone/project
was established. Changes remain local outside PR #27; pre-commit skipped by request.

Full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,460 internal links
(123,562 with anchors), zero broken links; 42 existing translation freshness warnings
remain. After final prose cleanup, build and link checks passed again with the same
counts. git diff --check passed.


## High-volume writes concept validation — 2026-09-21

Reviewed concepts/high-volume-writes.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: schema and queue preflight,
poller_boost.php scheduling/rotation/child completion, and lib/boost.php archive
requeue, sample deletion, on-demand graph paths and RRDtool update handling.
Replaced obsolete MEMORY queue claims with InnoDB/retry behavior; distinguished
command batching from physical I/O, threshold estimates from exact counts, normal
intervals from maximum staleness, rotation from completed writes and acknowledged
commands from late samples skipped by RRDtool. Qualified graph freshness and crash
handling, linked known remote recovery limitations and retained Pages navigation.

An unchanged-function PHP 8.4.25 probe at /tmp/kadupul-boost-scheduler-probe.php
confirmed boost_time_to_run queries nonexistent pollers in its disabled branch,
then clears system-enable on a failed count. Schema defines poller. Numeric-zero
fallback stores 120 minutes while scheduling an initial delay of 120 seconds.
Normal before-timer, timer-due, over-threshold and forced-run cases returned expected
results. The probe uses configuration/database stubs; it is not a live database or
multi-collector scheduling test. No new Boost flush, crash, concurrency, graph request
or remote replay was exercised. Application source remains unchanged.

Filed application [#270](https://github.com/kadupulhq/kadupul/issues/270) and website
[#34](https://github.com/kadupulhq/website/issues/34), both verified native Bug type,
bug label, php/documentation labels respectively and assignee somethingwithproof.
Reports include component, severity, revisions, environment, reproduction,
expected/actual results, evidence, workaround, acceptance criteria and limits.
No exploit demonstrated; no milestone/project established. Local documentation is
outside PR #27; pre-commit remains skipped as requested.

Full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,504 internal links
(123,562 with anchors), zero broken links. The 42 existing translation freshness
warnings remain; git diff --check passed.


## Templates concept validation — 2026-09-21

Reviewed concepts/templates.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: lib/template.php creation/reuse and push
helpers, data_templates.php save paths and structural editor controls,
lib/api_device.php device template application/synchronization, and lib/boost.php
image-cache handling. Reused prior same-revision custom-template, graph appearance
and retention/recovery findings; no fresh live template or RRD maintenance test ran.

Corrected discovery/cardinality and delayed file creation, field flags versus other
propagation paths, input-method save handling, path preservation, device sync selection
and removal of unused associations, automation/plugin hooks, index stability, cached
rendering and alternatives to destructive file recreation. Existing graph deletion is
not implied by removal of a device-template association. GitHub Pages links point to
the custom-template, appearance and retention guides.

Filed website [#35](https://github.com/kadupulhq/website/issues/35), verified native
Bug type, bug/documentation labels, and assignee somethingwithproof. Report contains
component, severity, revisions, environment, reproduction, expected/actual behavior,
evidence, workaround, acceptance criteria and limits. No new application defect was
inferred. No milestone/project established. Application worktree unchanged; local
changes remain outside PR #27; pre-commit skipped by request.

The first validation caught an incorrect appearance-guide route introduced during
editing. Corrected it to /guides/tune-graph-appearance/ and restarted all checks
against the final source.

Final full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,570 internal links (123,562 with anchors), zero broken links. The 42 existing translation freshness warnings remain; git diff --check passed.


## Graph-rendering concept validation — 2026-09-21

Reviewed concepts/how-graphs-are-drawn.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: lib/rrd.php renderer/resolution/CSV paths,
lib/functions.php consolidation fallback and numeric filtering, lib/boost.php image
cache, and upstream RRDtool rrdgraph_data/rrdgraph_graph primary documentation.
Corrected cache assumptions, profile estimates versus actual archive selection,
main-poller-derived default end time, item-specific fallback, GPRINT matching and
no-match behavior, VDEF drawing and CSV restrictions, and archive-maintenance limits.
Links include GitHub Pages Boost/retention guidance and upstream references.

An isolated temporary RRD fixture used RRDtool 1.11.0 with a GAUGE, 60-second step,
AVERAGE archive and three samples. A MAXIMUM VDEF rendered as LINE1 in a 481x155 SVG
(exit 0); XPORT of the same scalar failed (exit 1, Cannot shift a VDEF). Python 3.12.12
through mise orchestrated the fixture; its temporary files were removed. The application
renderer maps VDEF drawing items to scalar names and selects export columns by drawing
type without the claimed skip. No fresh end-to-end HTTP/database export, browser cache
or archive selection matrix was tested. Application code remains unchanged.

Filed application [#273](https://github.com/kadupulhq/kadupul/issues/273) and website
[#36](https://github.com/kadupulhq/website/issues/36), verified native Bug type,
bug label, php/documentation labels respectively and assignee somethingwithproof.
Reports include component, severity, revisions, environment, reproduction,
expected/actual results, evidence, workaround, acceptance criteria and limits.
No exploit demonstrated; no milestone/project established. Changes remain local
outside PR #27; pre-commit skipped by request.

Full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,614 internal links (123,562 with anchors), zero broken links. The 42 existing translation freshness warnings remain; git diff --check passed.


## Architecture concept validation — 2026-09-21

Reviewed concepts/architecture.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: graph_realtime.php/poller_realtime.php,
poller.php/cmd.php and durable queues, lib/boost.php, lib/rrd.php creation/ownership,
lib/rrd_maintenance.php trust/account checks and lib/ping.php ICMP implementation.
Reused prior same-revision queue, realtime, storage and graph audit evidence; no new
live collection, HTTP realtime request, ownership change or ping privilege test ran.

Corrected measurement queues versus historical storage, web-triggered collection and
writes, deferred RRD creation, network boundaries, retry/backlog implications,
consistent backups, request/poller overlap, account/trust requirements, OS ping
invocation and configuration/cache scope. Replaced definitive symptom diagnoses with
investigation checks. Renamed the misleading storage heading while retaining its old
anchor for existing links. Navigation targets GitHub Pages guides and concepts.

Filed website [#37](https://github.com/kadupulhq/website/issues/37), verified native
Bug type, bug/documentation labels and assignee somethingwithproof, with component,
severity, revisions, environment, reproduction, expected/actual behavior, evidence,
workaround, acceptance criteria and limits. No new application defect or exploit was
inferred. No milestone/project established. Application worktree unchanged; local
changes remain outside PR #27; pre-commit skipped by request.

Full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,570 internal links (123,562 with anchors), zero broken links. After the final heading/anchor adjustment, build, link and locale checks passed again; rendered heading and legacy anchor were verified. The 42 existing translation freshness warnings remain; git diff --check passed.


## Data-source/RRA concept validation — 2026-09-21

Reviewed concepts/data-sources-and-rras.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: lib/rrd.php creation, interface-speed
substitution, bounds and unused-field handling; include/global_arrays.php type map;
cacti.sql profile/archive/function rows; upstream RRDtool rrdcreate semantics.
Reused prior same-revision retention/migration evidence; no new live counter-reset,
COMPUTE creation, consolidation-boundary, polling or file-migration test ran.

Corrected object/field terminology, creation versus explicit maintenance, normalized
values/rates, conditional bound substitution and normalization, heartbeat source,
consolidation extrema, unknown-data interpretation, payload versus total disk,
intervals versus physical writes and graph references versus visible drawing.
Kept the old permanent-decisions anchor while replacing the misleading heading.
Preserved accurate profile numbers and GitHub Pages links.

Recomputed shipped SQL through mise Python 3.12.12: per-field slots
11,488 / 40,284 / 81,716, payload KiB 89.75 / 314.71875 / 638.40625,
and 10,000 two-field payload GB 1.83808 / 6.44544 / 13.07456. These are archive
value payloads, not measured total storage. No new application defect inferred.

Filed website [#38](https://github.com/kadupulhq/website/issues/38), verified native
Bug type, bug/documentation labels, assignee somethingwithproof, and report metadata
covering component, severity, revisions, environment, reproduction, expected/actual
behavior, evidence, workaround, acceptance criteria and limits. No exploit
demonstrated; no milestone/project established. Application code unchanged. Changes
remain local outside PR #27; pre-commit skipped by request.

Full check:all passed: 86 tests, 100% coverage, 3,168 pages, 385,570 internal links (123,562 with anchors), zero broken links. The 42 existing translation freshness warnings remain; git diff --check passed.


## Security-model concept validation — 2026-09-22

Reviewed concepts/security-model.md against application revision
661a57ff43ebf275e6b07211d4284dd727103959: request helpers in lib/html_utility.php,
exec_poll and result parsing, import signature/path handling, auth/CSRF bootstrap,
remote-agent enabled-collector/address handling, account/storage trust and runtime
Boost DDL. Reused prior same-revision package, collection-script, security-guide,
permissions and storage evidence. Read application SECURITY.md private-reporting
requirements; no new exploit, bypass or application vulnerability was established.

Corrected request read/cache/logging scope, script-output/backend distinctions,
package containment and layered controls, web-triggered collection/writes, runtime
DDL requirements, configuration protection, conditional enforcement, illustrative
endpoint inventory, proxy-header configuration and guest-account interpretation.
GitHub Pages links connect the operational import, upgrade and security guides.
No new live package import, adversarial execution, authorization request,
database-grant change or penetration test was performed. Application code unchanged.

Filed website [#39](https://github.com/kadupulhq/website/issues/39), verified native
Bug type, bug/documentation labels and assignee somethingwithproof. Report includes
component, severity, revisions, environment, reproduction, expected/actual behavior,
evidence, workaround, acceptance criteria and limits. No milestone/project established.
Changes remain local outside PR #27; pre-commit skipped by request.

Full check:all passed after correcting one prose-lint word: 86 tests, 100% coverage, 3,168 pages, 385,658 internal links (123,562 with anchors), zero broken links. The 42 existing translation freshness warnings remain; git diff --check passed.


## Time-and-intervals concept validation — 2026-09-22

Reviewed `concepts/time-and-intervals.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: `cmd.php` due-row query,
countdown update and SQL insertion timestamp, `lib/api_poller.php` process
leveling and short-step warning, `poller.php` field alignment, `lib/poller.php`
output grouping and epoch conversion, `lib/rrd.php` field heartbeat at creation,
and `lib/boost.php` past-update filtering. Checked RRDtool's current creation
and update references.

Corrected unconditional every-cycle/every-other-cycle wording and documented
mode-dependent countdown resets and leveling limits. Clarified heartbeat's
field source, SQL-generated timestamps, database versus collector clock effects,
RRDtool normalization, multi-field assembly, backlog ordering and last-update
limits, and the PHP collector's overrun check. GitHub Pages navigation links
point to the poller-cache and high-volume-writes concepts; the external update
reference points to upstream RRDtool. No live collector, clock-skew, RRD
migration or backlog failure was run; no new application defect was inferred.

Filed website [#42](https://github.com/kadupulhq/website/issues/42), verified
with native Bug type, `bug`/`documentation` labels and assignee
`somethingwithproof`. It includes component, severity, affected revision,
environment, reproduction, expected/actual behavior, evidence, workaround,
verification and limits. No milestone/project was established. The application
worktree is unchanged. Documentation changes remain local outside PR #27;
pre-commit was skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages, 385,702 internal
links (123,562 anchors), zero broken. The 42 existing translation freshness
warnings remain; `git diff --check` passed.


## Logging reference validation — 2026-09-22

Reviewed `reference/logging.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: `lib/functions.php`
`cacti_log()`, selective logging and viewer tail/filter functions,
`poller_maintenance.php` rotation and cleanup, `poller.php` collector redirection
and retained output handling, and logging settings in `include/global_settings.php`.

Corrected the destination/verbosity ordering, selective-debug scope,
retention-by-age semantics, 30-day frequency, conditional stderr redirection,
viewer scan behavior, and failed/deferred poller-output retention. Replaced
unconditional missing-value and Spine-silence claims with diagnostic checks.

An isolated PHP 8.4.25 probe invoked the unchanged
`logrotate_file_clean()` function with logging/count helpers stubbed. With
`cacti.log` active, cleanup deleted a separate writable
`backup-cacti.log-20200101` in the same temporary directory. Probe source:
`/tmp/kadupul-log-clean-probe.php`; output: `UNRELATED_FILE_DELETED`. The
probe removed the temporary files. No full scheduled maintenance or production
log rotation was run. Application code remains unchanged. The logging reference
links the reproduced application issue and warns about dated lookalike files.

Filed application [#280](https://github.com/kadupulhq/kadupul/issues/280) for
cleanup of unrelated dated files and website
[#43](https://github.com/kadupulhq/website/issues/43) for inaccurate logging
guidance. Both have verified native Bug type, `bug` plus `php` or
`documentation` labels, assignee `somethingwithproof`, component, severity,
affected revision, environment, reproduction, expected/actual behavior,
evidence, workaround, acceptance criteria and limits. No milestone/project was
established. Documentation changes remain local outside PR #27; pre-commit was
skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages, 385,702 internal
links (123,562 anchors), zero broken. After the final rotation note, prose,
build and link checks passed again with the same page/link counts. The 42
existing translation freshness warnings remain; `git diff --check` passed.


## Configuration reference validation — 2026-09-22

Reviewed `reference/configuration.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: `include/config.php.dist`
bootstrap variables and installer PHP allowlist, `include/global.php` local/remote
database connection calls, `include/global_settings.php` tabs and poller options,
`poller.php` remote/queue handling, and Symfony `APP_SECRET` configuration in
`config/packages/framework.yaml`.

Corrected the exhaustive file/database split: Symfony environment and file-backed
secrets also participate in configuration. Added the installer probe allowlist,
explained the remote-main retry argument uses `$database_retries` rather than
`$rdatabase_retries`, and marked `poller_refresh_output_table` as a legacy
form-only option with no current runtime reader. Clarified that launcher/poller
intervals can differ when the launcher contains an integer number of passes.
Navigation links point to the GitHub Pages installation and time concepts.

Filed application [#281](https://github.com/kadupulhq/kadupul/issues/281)
for the ignored remote retry value and
[#282](https://github.com/kadupulhq/kadupul/issues/282) for the inert,
misleading poller-output refresh setting. Filed website
[#44](https://github.com/kadupulhq/website/issues/44) for the documentation
claims. All three have verified native Bug type, `bug` plus `php` or
`documentation` labels, assignee `somethingwithproof`, component, severity,
revision, environment, reproduction, expected/actual behavior, evidence,
workaround, acceptance criteria and limits. No milestone/project was established.
This was a source audit: no remote outage, installer probe, queue refresh or live
setting change was run. Application code remains unchanged; documentation changes
remain local outside PR #27; pre-commit skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages and 385,746
internal links (123,562 anchors), zero broken. After adding the issue links,
prose, build and link checks passed again with the same counts. The 42 existing
translation freshness warnings remain; `git diff --check` passed.


## Data-input-methods reference validation — 2026-09-22

Reviewed `reference/data-input-methods.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: input types and fields,
`lib/functions.php` command substitution and output validation, `lib/poller.php`
script execution and RRD field mapping, `cmd.php` collection dispatch, and
`lib/utility.php` input controls. Reused prior same-revision collection-script
and poller-cache evidence. No live collector, script-server request or RRD update
was run.

Corrected the one-line output statement for the ordinary `shell_exec()` fallback,
explained that multi-value fields need `name:value` even though the initial
validator recognizes another delimiter, and made input-policy guidance depend
on inspecting commands and resulting cache rows. Added the application issue
link for the delimiter mismatch. The page does not claim that a configured
policy file alone proves every method was vetted. The application code remains
unchanged.

Filed application [#284](https://github.com/kadupulhq/kadupul/issues/284)
for the accepted-but-unmapped output delimiter and website
[#45](https://github.com/kadupulhq/website/issues/45) for inaccurate
documentation. Both have verified native Bug type, `bug` plus `php` or
`documentation` labels, assignee `somethingwithproof`, component, severity,
revision, environment, reproduction, expected/actual behavior, evidence,
workaround, acceptance criteria and limits. No milestone/project was established.
Potential security implications discovered in the same input-control review
are excluded from public issue details pending private triage under the
application security policy. Documentation changes remain local outside PR #27;
pre-commit skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages, 385,746 internal
links (123,562 anchors), zero broken. After adding the application link, prose,
build and link checks passed again with the same counts. The 42 existing
translation freshness warnings remain; `git diff --check` passed.


## Graph-items reference validation — 2026-09-22

Reviewed `reference/graph-items.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: graph-item type maps in
`include/global_arrays.php`, editor shorthand handling, `lib/rrd.php` CF choice,
CDEF substitution, VDEF creation and export selection, and RRDtool graph/XPORT
primary references. Reused prior same-revision VDEF fixture and application
[#273](https://github.com/kadupulhq/kadupul/issues/273); no new HTTP export or
database graph edit was performed.

Corrected the claim that CSV/XPORT skips VDEF-backed drawing items: the current
export branch selects AREA, fixed LINE and legacy STACK types without a VDEF
guard, so a scalar can reach `XPORT` and fail. Clarified generic GPRINT's
selection of a related drawing item's CF, RRD-step substitution for
`CURRENT_DATA_SOURCE_PI` and similar placeholders, UI shorthand scope, and
source versus file duplicate semantics. Linked application #273 and the GitHub
Pages graph concept; upstream RRDtool graph and XPORT references were checked.

Filed website [#46](https://github.com/kadupulhq/website/issues/46), verified
with native Bug type, `bug`/`documentation` labels and assignee
`somethingwithproof`. The report includes component, severity, revisions,
environment, reproduction, expected/actual behavior, evidence, workaround,
acceptance criteria and limits. No new application defect was inferred and no
milestone/project was established. Application worktree unchanged; documentation
changes remain local outside PR #27; pre-commit skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages, 385,768 internal
links (123,562 anchors), zero broken. The 42 existing translation freshness
warnings remain; `git diff --check` passed.


## RRDtool-integration reference validation — 2026-09-22

Reviewed `reference/rrdtool-integration.md` against application revision
`661a57ff43ebf275e6b07211d4284dd727103959`: `lib/rrd.php` local
execution, `rrd_init()` and acknowledged command responses, update/fetch
paths, `lib/rrd_maintenance.php` lease coordination, `lib/poller.php` retained
output and `lib/boost.php` on-demand fetch behavior. Reused earlier same-revision
RRD maintenance and Boost source evidence; no new live writer failure, queue
replay, RRDCACHED test or proxy deployment was run.

Corrected legacy write-only versus acknowledged pipe behavior, local boolean
results, maintenance ownership, response timeout/error handling and failed
sample retention. Qualified missing-binary, fetch-flush and locale-formatted
numeric claims, and noted the tuning guard against `RRDCACHED_ADDRESS`. GitHub
Pages links point to recovery and high-volume-writes guidance. No new
application defect was inferred; application code remains unchanged.

Filed website [#47](https://github.com/kadupulhq/website/issues/47), verified
with native Bug type, `bug`/`documentation` labels and assignee
`somethingwithproof`. The report includes component, severity, revisions,
environment, reproduction, expected/actual behavior, evidence, workaround,
acceptance criteria and limits. No milestone/project was established. Changes
remain local outside PR #27; pre-commit skipped by request.

Full `check:all` passed: 86 tests, 100% coverage, 3,168 pages, 385,812 internal
links (123,562 anchors), zero broken. The 42 existing translation freshness
warnings remain; `git diff --check` passed.
