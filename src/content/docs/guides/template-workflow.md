---
title: Use and validate templates
description: Choose template identities, preview imports and verify propagation without losing RRD history.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
---

## Choose the right definitions

Device templates offer graph templates and data queries; data templates define
measurement inputs and storage. Duplicate a close match when you need a separate
identity, then inspect shared dependencies. A duplicate does not make every referenced
input or profile independent. Preserve an export and a matched database/RRD backup
before changing used definitions. See [template concepts](/concepts/templates/).

## Preview, then apply deliberately

On an isolated installation, inspect the XML's source, destination identities and
chosen storage profile. From the application root, preview plain template XML:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

Current `main` reports unreadable input, malformed XML and recorded object failures
with a nonzero status. Check diagnostics and per-object results too; an import can
update existing identities. Package imports have a separate file-writing path.
See [import and export](/guides/import-and-export-templates/).

## Verify children and history

Check representative devices, local graph-item mappings, overrides and collected
values after applying. Device-template association changes need their separate
synchronization operation. A data-template save does not reshape existing RRDs;
inspect the real file before changing step, heartbeat or retention. Stop writers
before coordinated recovery and restore the matched backup set if necessary.
See [custom templates](/guides/create-custom-templates/) and
[retention](/guides/manage-data-retention/).

Application baseline checked on 26 October 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
