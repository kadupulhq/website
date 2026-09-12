---
title: Contributing
description: How to prepare a focused, verified change.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 6
---

Discuss substantial changes in the repository before implementation. Keep each
pull request focused on one purpose.

## Code

Match the surrounding code and the repository's formatter configuration. Avoid
unrelated formatting changes. Preserve public interfaces unless the change
explicitly includes a documented migration.

Reproduce bugs before fixing them and verify the behavior changed. Include the
commands and results needed for a reviewer to assess the patch. Use maintained
dependencies when justified and explain what each new dependency replaces.

## Commits and review

Use Conventional Commits and sign off commits with `git commit -s` under the
Developer Certificate of Origin. Submit pull requests to the Kadupul repository.
Explain the resulting behavior, relevant compatibility effects, and validation.

## Documentation

Verify claims against the implementation. Quote settings, flags, and defaults
accurately. Write original prose and include only material whose license permits
its use. See [License](/project/license/).

## Security

Follow the [security policy](/project/security/) for vulnerability reports.
