---
title: File layout
description: What lives in the current hybrid application tree, which paths are writable, which must stay private, and what belongs in a backup.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 11
---

Paths on this page are relative to the install root, which legacy code calls
`$config['base_path']`. Current `main` is a hybrid tree: most pages and polling
commands still use the inherited application layout, while migrated routes use
Symfony code under `src/`, `config/`, `templates/`, `public/` and `bin/`.

Do not infer a safe document root from directory names alone. During the
migration, legacy entry points in the repository root must remain reachable.
`public/index.php` is the Symfony front controller, but `public/` is not yet a
complete replacement document root for the whole installation.

## Top-level directories

| Directory | Contents and role |
|---|---|
| `assets/` | Source branding artwork and generation notes. It is not the legacy browser asset directory. |
| `bin/` | Symfony console entry point and compatibility CLI helpers. Never expose it over HTTP. |
| `cache/` | Runtime image, MIB, realtime-graph and spike-removal state. See [Writable and runtime paths](#writable-and-runtime-paths). |
| `cli/` | Legacy administration and maintenance commands. |
| `config/` | Symfony bootstrap, services, routes, package configuration and translation catalogues. |
| `contrib/` | Third-party contributions that are not part of the normal runtime. |
| `docker/` | Container entry point, cron and PHP/FPM configuration used by the project environment. |
| `docs/` | Application-repository architecture, migration, security and testing notes. These are separate from this GitHub Pages site. |
| `formats/` | Graph formatting presets. |
| `images/` | Static images used by legacy browser pages. |
| `include/` | Legacy configuration and bootstrap files, global definitions, browser assets, themes and the Composer vendor directory. |
| `install/` | Web installer, templates and schema upgrade scripts. |
| `lib/` | Legacy application, poller, storage and integration libraries. |
| `LICENSES/` | License texts for the source distribution. |
| `locales/` | Legacy gettext catalogues and their build tooling. |
| `log/` | Default application and poller-error logs. Configured log paths may point elsewhere. |
| `mibs/` | The `CACTI-MIB`, `CACTI-BOOST-MIB` and `CACTI-SNMPAGENT-MIB` sources. |
| `plugins/` | Installed legacy plugins, one directory per plugin. The repository ships only its guard file. |
| `public/` | Symfony front controller. It is only one entry path while legacy routing remains. |
| `resource/` | SNMP query, script-query and script-server definitions. |
| `rra/` | Default local RRD storage. External proxy storage and custom data-source paths can put data elsewhere. |
| `scripts/` | Legacy data-collection scripts. |
| `service/` | Service unit and operational notes for the Spine daemon. |
| `src/` | Namespaced Symfony/domain/application/infrastructure PHP code. |
| `templates/` | Twig templates for migrated Symfony pages. |
| `tests/` | Automated tests and validation harnesses. Do not deploy them as web content. |
| `tools/` | Build, dependency, migration, security and offline-verification tools. |
| `var/` | Ignored Symfony runtime state such as environment caches and logs. |

Legacy web entry points, pollers and `script_server.php` remain in the repository
root. See [Architecture](/website/concepts/architecture/) for the runtime
boundaries; a deployment must account for both parts of the tree.

## Important `include/` paths

| Path | Role |
|---|---|
| `include/config.php` | Installation-specific database, URL and optional path configuration. The installer creates it from `config.php.dist`; git ignores it. |
| `include/config.php.dist` | Versioned configuration template. |
| `include/global.php` | Legacy bootstrap that constructs `$config` and loads the procedural runtime. Migrated Symfony requests do not use it. |
| `include/global_constants.php` | Legacy constants. |
| `include/global_arrays.php` | Legacy enumerations and option maps. |
| `include/global_settings.php` | Setting definitions, defaults and form metadata; a definition does not by itself prove a runtime consumer. |
| `include/global_form.php` | Legacy edit-form field definitions. |
| `include/vendor/` | Composer dependencies, installed from `composer.lock` into a non-default vendor path. |
| `include/themes/` | Shipped and locally installed legacy themes. |

## `$config` path variables

`include/global.php` derives these values for the legacy runtime. Symfony code
uses its own kernel paths and trusted adapters where it has been migrated.

| Variable | Default | Configuration |
|---|---|---|
| `base_path` | Install root derived from `include/` | Derived, not configured |
| `library_path` | `<base_path>/lib` | Derived |
| `include_path` | `<base_path>/include` | Derived |
| `rra_path` | `<base_path>/rra` | Derived; individual data sources and proxy storage can differ |
| `scripts_path` | `<base_path>/scripts` | `$scripts_path` in `include/config.php` |
| `resource_path` | `<base_path>/resource` | `$resource_path` in `include/config.php` |
| `input_whitelist` | Unset | `$input_whitelist` in `include/config.php` |
| `path_csrf_secret` | `include/vendor/csrf/csrf-secret.php` | `$path_csrf_secret` may select a file elsewhere |
| `url_path` | `/cacti/` as shipped; `/` when the configured value is empty | `$url_path` in `include/config.php` |

Remote collectors can place scripts and query definitions outside the install
root. Treat every configured external path as part of the installation's
permission, web-exposure and backup review.

## Writable and runtime paths

The installer always checks the system temporary directory, `log/`, and four
cache directories:

| Default path | Runtime use |
|---|---|
| `cache/boost/` | Optional rendered-graph image cache. Deferred RRD samples themselves are held in database queue tables, not this directory. |
| `cache/mibcache/` | SNMP-agent MIB cache and lock state. |
| `cache/realtime/` | Short-lived per-session realtime RRD and PNG files. |
| `cache/spikekill/` | Spike-removal working files and, depending on settings, backups of original RRD files. |
| `log/` | Default application and poller-error logs. The `path_cactilog` and `path_stderrlog` settings can move the files. |
| `rra/` | Default local RRD storage. Installer validation also accounts for the selected local or proxy storage configuration. |

There is no `cache/purifier/` in the audited tree. Package-import preview creates
HTMLPurifier with its definition cache disabled.

For a primary installation, `resource/snmp_queries/`,
`resource/script_server/`, `resource/script_queries/`, `scripts/` and the CSRF
secret destination are install-time checks. For a remote-poller installation,
the installer classifies those paths as continuously writable so synchronization
can update them. Do not grant broad write access to the entire application tree.

Configured paths can replace several defaults. Review the effective settings,
service account and filesystem mounts on the actual host instead of copying a
permission list from this page.

## RRD file paths

A data source path is stored in `data_template_data.data_source_path`. The
`<path_rra>` token expands to `$config['rra_path']`. With structured paths off,
new default names include the cleaned host description, data-source name and
local data ID directly under `rra/`.

With structured paths on, `extended_paths_type` selects one of these shapes:

```text
<path_rra>/<host_id>/<local_data_id>.rrd
<path_rra>/<host_id>/<data_query_id>/<local_data_id>.rrd
<path_rra>/<hash_id>/<host_id>/<local_data_id>.rrd
<path_rra>/<hash_id>/<host_id>/<data_query_id>/<local_data_id>.rrd
```

`hash_id` is `host_id` modulo `extended_paths_hashes`. A missing data-query ID is
represented as zero when a new path is generated. Changing these settings does
not by itself relocate existing files. Before running
`cli/structure_rra_paths.php`, inspect the current database paths and filesystem,
confirm the target settings, and take a coordinated database and RRD backup. The
command has no dry-run phase: its required `--proceed` option starts moving files
and updating database paths.

When a local-storage poller running as root creates structured directories and
RRD files, it attempts to copy ownership from `rra/`. At the audited revision,
the directory group comparison reads the owner twice, so verify group ownership
independently; see [application issue #287](https://github.com/kadupulhq/kadupul/issues/287).

## Paths that must stay private

The audited tree contains deny `.htaccess` files in these 17 directories:

```text
bin/
cache/boost/
cache/mibcache/
cache/realtime/
cache/spikekill/
cli/
config/
contrib/
log/
mibs/
rra/
scripts/
src/
templates/
tests/
tools/
var/
```

The older guard files include Apache 2.4 and 2.2 directives. The newer Symfony
and tool guards use `Require all denied`. Nginx ignores all of them, and Apache
also ignores them when overrides are disabled. Mirror the deny policy in the
virtual-host configuration and verify it with HTTP requests.

The list of `.htaccess` files is not a complete allowlist. For example,
`docker/` and repository metadata do not carry these per-directory guards but
must not be served. A redirecting or empty `index.php` only affects a directory
request; it does not prevent a client from requesting a known file. Prefer an
explicit server policy that exposes required legacy entry points and static
assets while denying source, configuration, tests, tools, runtime data,
dependency metadata and dotfiles.

Root `.htaccess.dist` is an optional security-header overlay. It adds headers to
PHP and static responses when renamed to `.htaccess`; it does not implement the
directory deny policy above. PHP responses also emit application security
headers. Centrally managed Apache deployments should place equivalent directives
in their virtual-host configuration.

## What to back up

Start with the data and configuration required to reconstruct the installation:

| Path or system | Why |
|---|---|
| Database | Devices, templates, graphs, users, settings and deferred-output queues. Coordinate it with RRD storage for a consistent recovery point. |
| Effective RRD storage | Collected time-series history, whether under `rra/`, at custom data-source paths or behind the configured proxy. |
| `include/config.php` and deployment environment | Database, URL, path and Symfony environment configuration. Protect credentials as secrets. |
| CSRF secret destination | Preserve the configured secret file when continuity is required; it may live outside the tree. |
| `resource/` and configured `resource_path` | Shipped and locally added query definitions. |
| `scripts/` and configured `scripts_path` | Shipped and locally added collection scripts. |
| `plugins/` | Installed plugin code plus any plugin-owned files; inspect each plugin for database or external state too. |
| `include/themes/` | Local themes and custom styling. |
| Input whitelist | The file selected by `$input_whitelist`, often outside the install root. |
| Operationally valuable logs and spike backups | Logs are evidence, and `cache/spikekill/` may contain original RRD backups until its purge policy removes them. |

Most realtime images, generated caches, installed dependencies and Symfony cache
files can be regenerated. That does not make every file under `cache/`, `log/`
or `var/` safe to discard without inspection. Confirm queue state, incident
retention needs, plugin behavior and the restore procedure for your deployment.

## Gitignored paths

The repository broadly ignores installation-specific and generated content,
including:

```text
include/config.php
.env
.env.local
include/vendor/
vendor/
node_modules/
log/**
rra/**
cache/**
plugins/**
resource/**
scripts/**
include/themes/*
var/*
dist/
build/
coverage/
```

Negated rules and already tracked files preserve shipped scripts, resources,
themes, cache guards and selected placeholders. A clean clone therefore restores
versioned defaults, not local additions or runtime state. Back up local content
explicitly rather than relying on whether `git status` displays it.

At the audited application revision, `.gitignore` also contains a residual merge
marker; see [application issue #286](https://github.com/kadupulhq/kadupul/issues/286).
The interpreted policy above excludes that unintended line.
