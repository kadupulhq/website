---
title: Import and export templates
description: What an export file actually contains, why a package is signed, and
  the ways an import quietly does less than you asked.
banner:
  content: This is inherited 1.2.31 documentation. A supported Kadupul release
    or migration path is not yet available. Validate procedures before use.
sidebar:
  order: 18
slug: 1.2.31/guides/import-and-export-templates
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Moving a template between installs looks like moving a file. It is not. The file
is a set of definitions addressed by hash, and the import is a merge against
whatever the destination already has under those hashes.

Read [Templates](/1.2.31/concepts/templates/) first if you are not clear on what a
template is against what a graph is.

## What an export contains

An export is XML. Each object in it is keyed by a hash that encodes three things:
a two-character type code, a four-character version code, and the object's own
32-character identity hash.

That identity is the whole mechanism. On import, the destination looks up each
hash in its own tables. A match means update in place. No match means create.
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
together. Files whose names contain `scripts/` or `resource/` are written under
the install root. Everything else in the bundle is treated as template XML and
imported the same way a plain export would be.

Packages are signed, and the signature is checked twice.

1. The bundle carries a public key and a signature over its own body. The key
   must be one of the keys the install trusts. A package that names no signer is
   rejected rather than being treated as trusted by default.
2. Each embedded file carries its own signature, verified against the same key
   before any file is written.

A signing key below 2048 bits is refused before verification is attempted. The
older trusted key is verified with SHA-1 and the current one with SHA-256; the
code picks by key length.

Nothing in the import path lets you skip a signature. If a package does not
verify, the import stops and no file is written. That is the intended behaviour,
not an obstacle to work around.

## Doing it from the command line

Preview first, always. Preview parses the file, resolves every hash, and reports
what it would change, without writing to the database and without writing any
file.

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
Read that list before you import. It is the only warning you get that a package
is about to overwrite a script you edited.

## The import options that change behaviour

| Option | Effect |
|---|---|
| `--preview` | Parse and report. No database write, no file write. |
| `--info` | Package only. Print the package metadata and stop. |
| `--with-profile` | Use the system default data source profile. |
| `--profile-id=N` | Use a specific profile. Exclusive with `--with-profile`. |
| `--remove-orphans` | Delete graph items not present in the incoming template. |
| `--replace-svalues` | Overwrite suggested value patterns with the package's. |

The data source profile choice matters more than it looks. The profile sets the
polling interval, the consolidation, and the retention of any data source created
from the imported template. Import with the wrong profile and every new data
source gets the wrong archive layout. Existing RRD files are not rewritten to
match.

If no profile is named, the import uses the profile marked default. If a named
profile id does not exist, the template importer warns and falls back to the
default; the package importer treats it as fatal and stops.

## Traps

**`--remove-orphans` edits existing graphs.** It does not only prune the
template. It deletes the matching graph items from every graph already built
from that template. Those items, and the position they held, do not come back.
Preview first and read the count.

**A file from a newer install is refused.** The version code in each hash is
compared against the version codes the running install knows. A code that ranks
above the running version fails the import with "Generated with a newer version".
There is no forward compatibility and no partial import; the whole file is
rejected. Export from the old install, not the new one.

**An unknown type code fails the same way.** A file carrying an object type this
install does not have, usually from a plugin that is not installed here, fails
with "Cannot locate type code" rather than skipping that object.

**Import is a merge, not a replace.** An object whose hash already exists is
updated field by field. Fields absent from the incoming XML are left at their
current values. Two imports of slightly different versions of the same template
leave you with the union, not the second one.

**Data input methods are re-validated on the way in.** A command line containing
shell metacharacters is refused at import, with the object logged and skipped,
because import is a separate write path from the form that would also have
refused it. A template that imported on an older install may not import here.

**Package file names are checked before they are used.** Names containing `..`,
a NUL byte, or an absolute path are skipped with a warning and the rest of the
package continues. A package that quietly installs fewer files than it lists is
telling you something about where it came from.

**Package import caps its own run time.** The importer sets a 50 second execution
limit and lifts the memory limit. A very large package can hit the time limit on
slow storage even from the command line.

**Package import runs on the main collector only.** It refuses to start on a
remote collector. The template importer is more forgiving: it switches to the
main database and carries on.

**Hashes collide across installs by design.** That is the point. It also means an
import can update a template you did not intend to touch, because it shares an
identity with something in the incoming file. Preview output names every object
it would change. Read it.
