---
title: Contributing
description: What the project needs, the engineering standards a change is written to, and the standard it is judged by.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 6
---

The source is available and the repository documents a contribution process.
Read [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md)
before starting. Discuss substantial changes in the issue tracker first.

## The standard

Keep each pull request focused on one purpose. Reproduce a bug before fixing it,
verify the changed behavior, and include the validation commands and results.
Preserve public interfaces unless the change includes a documented migration.

## Engineering standards

Follow the rules for the branch you are changing. Check its current contributor
guide and CI configuration rather than assuming both branches use the same rules.

### Style

On `main`, edited PHP files follow PHP-FIG PER-CS 2.0. Reformat each affected file
in a separate whitespace-only commit and check it with
`tests/tools/check_php_style.sh`. The `lts/1.2` branch keeps upstream formatting.

### Static analysis

Run the checks required by the target branch. This site does not prescribe a
PHPStan level, a logging interface or an autoloading migration that the repository
has not adopted.

### Tests

Verify the behavior changed by the patch. Include a regression case for a bug fix
and show the commands used. Passing unrelated tests does not validate the fix.

### Dependencies

Explain why a dependency is needed, check its license, and update the appropriate
manifest and lockfile. Follow the repository's dependency and validation rules.

### Commits and pull requests

Use Conventional Commits and sign off each commit with `git commit -s` under the
[Developer Certificate of Origin](https://developercertificate.org/).
Separate formatting from behavior changes so each can be reviewed independently.

## The inherited tree does not meet these standards

The tree contains inherited formatting and implementation patterns. Conversion is
controlled by the target branch's rules, not by a blanket rewrite of the project.

### So which rule wins?

Follow `CONTRIBUTING.md` on the target branch. On `main`, the edited-file PER-CS
rule applies; on `lts/1.2`, preserve the inherited style.

## Documentation

Verify claims against the implementation and use material whose license permits
its inclusion. Do not copy third-party prose without checking its license.
Report security findings through the [private reporting process](/project/security/).

## Compatibility

Plugin interfaces, templates, database compatibility and RRD data are release
goals. Document any interface change and provide migration and compatibility
evidence. See [Compatibility with Cacti](/project/compatibility-with-cacti/).
