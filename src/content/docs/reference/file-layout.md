---
title: File layout
description: What lives in each Kadupul directory, which ones the poller writes to, which must never be served over HTTP, and which hold data worth backing up.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 11
---

The tree is inherited from Cacti 1.2.x. Paths below are relative to the install
root, which the code calls `$config['base_path']`.

## Top level directories

| Directory | Contents |
|---|---|
| `cache/` | Working files for boost, the MIB cache, HTMLPurifier, realtime graphs and spike kill. Five subdirectories. |
| `cli/` | 45 command line scripts plus an `index.php` that redirects to the site root. |
| `contrib/` | Third party contributions. Not part of the running system. |
| `docs/` | `audit_schema.sql`, `security-headers.md`, and a security policy note. |
| `formats/` | Four `.format` files used for graph formatting presets. |
| `images/` | Static images served to the browser. |
| `include/` | Configuration, global arrays, constants, form definitions, settings, session handling, page headers, themes, fonts, JavaScript and the Composer vendor tree. |
| `install/` | The installer, its templates, and one upgrade script per schema version. |
| `lib/` | The libraries. 57 of them, plus an `index.php`. Everything substantive lives here. |
| `locales/` | Translation catalogues and the scripts that build them. |
| `log/` | `cacti.log` and `cacti_stderr.log`. |
| `mibs/` | The three Kadupul MIB files: `CACTI-MIB`, `CACTI-BOOST-MIB`, `CACTI-SNMPAGENT-MIB`. |
| `plugins/` | Installed plugins, one directory each. Ships empty apart from `index.php`. |
| `resource/` | Data query XML definitions. Three subdirectories: `snmp_queries`, `script_queries`, `script_server`. |
| `rra/` | RRD files. Ships with only an `.htaccess`. |
| `scripts/` | Data collection scripts, 31 of them. Perl and PHP. |
| `service/` | A systemd unit for the Spine daemon and a README. |
| `tests/` | The test suite. Not installed. |

Web entry points, the poller, and `script_server.php` sit in the root itself.

## Directory roles in detail

### `include/`

| Path | Role |
|---|---|
| `include/config.php` | Database credentials, `$url_path`, and optional path overrides. Created by the installer from `config.php.dist`. Not in version control. |
| `include/config.php.dist` | Template for the above. |
| `include/global.php` | Builds `$config`, loads the libraries, starts the session. |
| `include/global_constants.php` | Every `define()`. |
| `include/global_arrays.php` | Enumerations: realms, input types, RRDtool versions, timespans. |
| `include/global_settings.php` | Every setting, with its type, default and description. |
| `include/global_form.php` | Form field definitions for the edit pages. |
| `include/vendor/` | Composer packages. Ignored by git and installed from `composer.lock`. |
| `include/themes/` | One directory per theme. Each may carry an `rrdtheme.php`. |

### `$config` path variables

`include/global.php` derives these. Three can be overridden from
`include/config.php`.

| Variable | Default | Overridable |
|---|---|---|
| `base_path` | The install root, derived from `include/`'s location | no |
| `library_path` | `<base_path>/lib` | no |
| `include_path` | `<base_path>/include` | no |
| `rra_path` | `<base_path>/rra` | no |
| `scripts_path` | `<base_path>/scripts` | yes, `$scripts_path` |
| `resource_path` | `<base_path>/resource` | yes, `$resource_path` |
| `input_whitelist` | unset | yes, `$input_whitelist` |
| `url_path` | `$url_path` from config, else empty | yes, `$url_path` |

`$scripts_path` and `$resource_path` exist so a remote data collector can hold
its scripts and query definitions somewhere other than under the web root. The
script server treats both `base_path` and `scripts_path` as allowed roots when it
validates an include file.

## What the poller writes

| Path | Written by | Contents |
|---|---|---|
| `rra/` | The RRD update path in `lib/rrd.php` | RRD files, one per data source. |
| `log/cacti.log` | `cacti_log()` | The application log. |
| `log/cacti_stderr.log` | Backgrounded processes | Standard error from spawned children. |
| `cache/boost/` | boost | Cached graph images and staged RRD updates. |
| `cache/mibcache/` | `snmpagent_mibcache.php` | `mibcache.tmp` and `mibcache.lock`. |
| `cache/realtime/` | The realtime graph path | Short lived per-session RRD and image files. |
| `cache/spikekill/` | spike kill | Working files for spike removal. |
| `cache/purifier/` | HTMLPurifier, via `lib/html.php` | Its serializer cache. |

`lib/installer.php` checks these for writability on every install and on every
run of a remote data collector: the system temp directory, `log/`,
`cache/boost/`, `cache/mibcache/`, `cache/purifier/`, `cache/realtime/` and
`cache/spikekill/`. It checks `resource/snmp_queries/`,
`resource/script_server/`, `resource/script_queries/` and `scripts/` at install
time, and on every run when the install is a remote data collector.

### RRD file paths

A data source's path is stored in `data_template_data.data_source_path` using the
`<path_rra>` token, which expands to `$config['rra_path']`. With the
`extended_paths` setting off, files land directly in `rra/`. With it on,
`extended_paths_type` picks one of four shapes:

```
<path_rra>/<host_id>/<local_data_id>.rrd
<path_rra>/<host_id>/<data_query_id>/<local_data_id>.rrd
<path_rra>/<hash_id>/<host_id>/<local_data_id>.rrd
<path_rra>/<hash_id>/<host_id>/<data_query_id>/<local_data_id>.rrd
```

`hash_id` is `host_id` modulo the `extended_paths_hashes` setting. Changing the
setting does not move existing files; `cli/structure_rra_paths.php` does that.

When the poller runs as root it chowns and chgrps new RRD files and new
structured directories to the owner and group of `rra/` itself.

## Directories that must not be served

Eleven directories ship with an `.htaccess` that denies everything. Under Apache
2.4 it is `Require all denied`; the file carries an `Order Allow,Deny` fallback
for 2.2.

| Directory | Why |
|---|---|
| `cache/boost/` | Cached images and staged data. |
| `cache/mibcache/` | MIB cache and lock file. |
| `cache/purifier/` | Purifier serializer cache. |
| `cache/realtime/` | Per-session graph output. |
| `cache/spikekill/` | Spike kill working files. |
| `cli/` | Command line scripts. |
| `contrib/` | Unreviewed third party files. |
| `log/` | Contains the application log. |
| `mibs/` | MIB sources. |
| `rra/` | Every RRD file on the system. |
| `scripts/` | Collection scripts, several of which take arguments. |

`log/.htaccess` adds two further blocks: a `<Files .htaccess>` deny, and a
`<FilesMatch "\.(log)$">` deny.

On a web server that ignores `.htaccess`, which includes nginx and any Apache
configured with `AllowOverride None`, these files do nothing. Deny those paths in
the server configuration instead.

Directories without an `.htaccess` carry an `index.php` that either redirects to
the site root or produces nothing, so a directory listing cannot be obtained.
`rra/` has an `.htaccess` but no `index.php`.

`.htaccess.dist` at the root is a different thing: an optional security header
overlay, not an access denial. Renaming it to `.htaccess` makes Apache apply
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and a narrow
Content-Security-Policy to the static files that never reach PHP. PHP responses
already emit the full header set from `CactiSecureHeaders::emitHeaders()`. A
distribution that manages Apache centrally should put the same directives in its
own config file rather than enable this one.

## What to back up

| Path | Why |
|---|---|
| The database | Every definition: devices, templates, graphs, trees, users, settings. |
| `rra/` | All collected history. Nothing else holds it. |
| `include/config.php` | Credentials and path overrides. Not in version control. |
| `resource/` | Data query XML. Gitignored, so a source checkout will not restore customised files. |
| `scripts/` | Collection scripts. Gitignored below the shipped set. |
| `plugins/` | Installed plugins and their own data. |
| `include/themes/` | Any theme directory beyond the eleven shipped ones. |
| The input whitelist file | Wherever `$input_whitelist` points. Often outside the tree. |

`log/` and `cache/` are reproducible. `rra/` is not; there is no second copy of
the time series.

## Gitignored paths

Worth knowing before restoring from a source checkout, because a clean clone will
not contain them.

```
include/config.php
log/**
rra/**
cache/**
plugins/**
resource/**
scripts/**
include/themes/*        (the eleven shipped themes are re-included)
include/vendor/*
locales/po/*.mo
```

The shipped contents of `resource/` and `scripts/` are tracked despite the wide
ignore, because they were added before it. Anything added later needs `git add -f`.
