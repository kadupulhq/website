---
title: Questions
description: Answers about installation, compatibility, and licensing.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 7
---

## Installation

### Is Kadupul ready for production?

No. It is in pre-alpha with no supported release or migration path.
See [Status](/project/status/).

### What does it need to run?

A PHP web server, MySQL or MariaDB, RRDtool, and a scheduled collector.
See [Requirements](/reference/requirements/) for the versions and extensions.

## Compatibility

### Will my plugins, templates, and RRD files work?

Preserving them is a release goal. Validate the components you depend on before
planning a cutover. See [Compatibility](/project/compatibility/) and
[Migration](/guides/migration/).

### Does it support Spine and the RRDtool proxy?

The application contains integration code for both. They are separately maintained
components. See [Spine](/reference/spine/) and [RRDtool proxy](/reference/rrdproxy/)
for the interfaces and limitations.

## Licensing

### What license covers the software?

GPL-3.0-or-later. Dependencies retain their own license terms.
See [License](/project/license/).

### What license covers the documentation?

CC BY-SA 4.0. Credit the project and license adaptations under the same terms.
The site's code is GPL-3.0-or-later.

## Taking part

### How do I report a vulnerability?

Privately through GitHub Security Advisories on the affected repository.
See [Security policy](/project/security/).

### How do I propose a change?

Read [Contributing](/project/contributing/) and discuss the intended change in the
repository. Documentation pages include an edit link for corrections.
