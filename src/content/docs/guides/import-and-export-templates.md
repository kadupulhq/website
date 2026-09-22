---
title: Import and export templates
description: What an export file actually contains, why a package is signed, and the ways an import quietly does less than you asked.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 18
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Moving a template between installs looks like moving a file. It is not. The file
is a set of definitions addressed by hash, and the import is a merge against
whatever the destination already has under those hashes.

Read [Templates](/concepts/templates/) first if you are not clear on what a
template is against what a graph is.

## What an export contains

An export is XML. Each object in it is keyed by a hash that encodes three things:
a two-character type code, a four-character version code, and the object's own
32-character identity hash.

That identity is the whole mechanism. On import, the destination looks up each
hash in its own tables. A match normally means update in place; a new supported identity creates an
object. Built-in data input methods have compatibility handling, and profile
selection can override the exported profile.
Names are not used for matching, so renaming a template on either side changes
nothing about how it merges.

Four things can be exported on their own.

| Type | Backed by |
|---|---|
| Device template | `host_template` |
| Graph template | `graph_templates` |
| Data template | `data_template` |
| Data query | `snmp_query` |

Exporting with dependencies follows the references outward and pulls in
everything the chosen object needs: data templates behind graph template items,
the data input method behind a data template or data query, CDEFs and VDEFs used
by graph items, GPRINT presets, and the data source profile. Inherited CDEFs are
followed recursively, and the resolver orders them so the leaves import first.

Export without dependencies and you get one object whose references point at
hashes the destination may not have.

## What an export does not contain

This list is longer than people expect.

**No measurements.** Not one sample. A template is a definition.

**No devices, graphs or data sources.** Exporting a graph template does not
export the graphs built from it.

**No script files.** A data input method of the script type carries its command
line, with the install root written as a `<path_cacti>` token. The script it
points at stays on the source machine.

**No data query XML.** A data query carries the path to its resource XML file,
again as a token. The file itself is not in the export. On import the destination
checks that path and records the result as found, missing or not readable. An
import that reports missing is not an error that stops anything; it produces a
data query that cannot run until you copy the file across by hand.

Packages exist to close those last two gaps.

## Packages

A package is a gzip-compressed XML bundle that carries template XML and files
together. File destinations must be within `scripts/` or `resource/` under the
install root, or those directories under `plugins/PLUGIN_NAME/`. Containment
checks also reject paths that escape through symlinks. Merely containing the text
`scripts/` or `resource/` is not sufficient. Other safe bundle entries are parsed
as template XML rather than copied to arbitrary destinations.

Packages are signed, and the signature is checked twice.

1. The bundle carries a public key and a signature over its own body. The key
   must exactly match a built-in trusted public key. A package that names no signer is
   rejected rather than being treated as trusted by default.
2. Each embedded file carries its own signature, verified against the same key
   before any file is written.

A signing key below 2048 bits is refused before verification is attempted. The
legacy built-in key is only 512 bits, so its packages fail this check even though
the key still appears in the trust list. The current built-in key uses SHA-256.
Ask for a package signed with the supported key if an older bundle is rejected.
`--info` verifies the bundle before returning metadata; it stops before the
separate per-file signature loop.

The package importer has no signature-bypass option. Bundle verification and all
embedded file-signature checks finish before the import starts writing files.
Passing those checks does not make the later import atomic: destination failures
or template errors can still leave only part of the package installed. Review
both object results and file statuses.

## Doing it from the command line

Run previews on a disposable copy first. They inspect object identities and
report proposed changes, but the current template preview is not guaranteed to
leave the database unchanged. A compatibility path for legacy built-in SNMP
input fields invokes database repair even with `--preview`. Package previews use
the same template importer; they skip embedded file writes but can reach that
repair path too. See [issue #215](https://github.com/kadupulhq/kadupul/issues/215).
Keep a backup before previewing unfamiliar templates.

```sh
# look at a package's metadata without importing it
php cli/import_package.php --filename=pkg.xml.gz --info

# see what would change
php cli/import_package.php --filename=pkg.xml.gz --preview
php cli/import_template.php --filename=template.xml --preview

# do it
php cli/import_template.php --filename=template.xml --profile-id=2
```

For a package, preview also reports, per file, whether the destination is
writable and whether the incoming content differs from what is already there.
Read that list before you import and keep copies of locally modified files.
Template CLI preview output currently contains HTML and uses an imported-results
heading even when rows say `[preview]`. Inspect the row results; the heading is
not evidence that the requested import took place. See
[issue #217](https://github.com/kadupulhq/kadupul/issues/217).

## The import options that change behaviour

| Option | Effect |
|---|---|
| `--preview` | Report proposed changes; skips normal object/file writes, but the legacy repair path can still change the database. |
| `--info` | Package only. Verify the bundle, print metadata, and stop before per-file validation/import. |
| `--with-profile` | Use the system default data source profile. |
| `--profile-id=N` | Use a specific existing profile. Supply this or `--with-profile`, not both. |
| `--remove-orphans` | Delete graph items not present in the incoming template. |
| `--replace-svalues` | Overwrite suggested value patterns with the package's. |

The data source profile choice matters more than it looks. The profile sets the
polling interval, the consolidation, and the retention of any data source created
from the imported template. Import with the wrong profile and every new data
source gets the wrong archive layout. Existing RRD files are not rewritten to
match.

If no profile is named, the import uses the profile marked default. If a named
profile id does not exist, the template importer warns and falls back to the
default; the package importer treats it as fatal and stops. Avoid combining the
two profile-selection flags: the package CLI rejects them, while the template
CLI warns and can then fail to resolve a profile.

## Traps

**`--remove-orphans` edits existing graphs.** It does not only prune the
template. It deletes the matching graph items from every graph already built
from that template. The importer then retemplates affected graphs.
Use an isolated preview to inspect the listed orphan items and retain a backup
for restoring the prior definitions.

**A file from a newer install is refused.** The version code in each hash is
compared against the version codes the running install knows. A code that ranks
above the running version fails the import with "Generated with a newer version".
This hash-validation pass occurs before normal object persistence for that XML
file. It is not a rollback guarantee for an entire package: earlier files may
already have been written or imported. Use an export version supported by the
destination.

**An unknown type code fails the same way.** A file carrying an object type this
install does not have, usually from a plugin that is not installed here, fails
with "Cannot locate type code" rather than skipping that object.

**Import is a merge, not a replace.** An object whose hash already exists is
updated field by field. Fields absent from the incoming XML are left at their
current values. Two imports of slightly different versions of the same template
do not amount to an exact replacement. This is not a universal union operation:
association lists and suggested-value handling have their own update behavior,
and `--remove-orphans` explicitly deletes graph items.

**Data input methods are re-validated on the way in.** A command line containing
shell metacharacters is refused at import, with the object logged and skipped,
because import is a separate write path from the form that would also have
refused it. A template that imported on an older install may not import here.

**Package file names are checked before they are used.** Names containing a `..`
path segment, a NUL byte, or an absolute path are skipped with a warning and the rest of the
package continues. A package that quietly installs fewer files than it lists is
telling you something about where it came from.

**Package import changes PHP resource limits.** It requests a 50-second PHP
execution limit and removes the PHP memory limit. This is not a dependable
50-second elapsed-time deadline: PHP/platform timing rules can exclude time
spent in database or filesystem operations. It is also not a decompressed-package
size limit; see [issue #110](https://github.com/kadupulhq/kadupul/issues/110).

**Package import runs on the main collector only.** It refuses to start on a
remote collector. The template importer is more forgiving: it switches to the
main database and carries on.

**Hashes collide across installs by design.** That is the point. It also means an
import can update a template you did not intend to touch, because it shares an
identity with something in the incoming file. Preview output names every object
it would change. Read it.


**A successful CLI exit does not establish a successful template import.** The
plain-template CLI can return exit status 0 for malformed XML without importing
an object. Check the per-object results and application log, and verify the
intended template in the destination. Do not use exit status alone as the success
condition in unattended import scripts. See
[issue #216](https://github.com/kadupulhq/kadupul/issues/216).
