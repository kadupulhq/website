---
title: Contributing
description: What the project needs, the engineering standards a change is written to, and the standard it is judged by.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 6
---

:::caution[Not open yet]
The source is available but the project is not open to contributions yet.
Governance and review are not settled. This page records the intended standard.
:::

## The standard

A change is judged on whether it works, whether it is verified, and whether it
matches the code around it.

**Verified means evidence.** A passing test that does not exercise the behavior you
changed is not evidence. For a bug fix, reproduce the failure first, then show the
same case passing.

**Match the surrounding code.** A file written in two styles is harder to read than
one written entirely in the worse style. Converting a pattern is its own change,
proposed separately, so a reviewer can accept or decline it without also rejecting
the fix it was bundled with.

**One purpose per change.** A fix fixes. A refactor refactors. Bundling them means
rejecting one rejects both.

## Engineering standards

These are the standards for code written here. They are current PHP practice, not
the conventions of the codebase Kadupul forked. Coding standards are one of the
things a project with a large installed base is right to leave alone and a fork is
free to change. See [Why this fork exists](/project/why-this-fork/).

### Style

| Rule | Standard |
|---|---|
| Formatting | PER Coding Style 2.0, the current evolution of PSR-12 |
| Indentation | Four spaces |
| Autoloading | PSR-4, for all new code |
| Logging | PSR-3, through `LoggerInterface` |
| Strict types | `declare(strict_types=1);` at the top of every new file |
| Types | Parameters and returns typed, including scalars |

Formatting is enforced by `php-cs-fixer` with a PER-CS ruleset, run in CI. A
formatter that runs in CI means style never becomes a review topic, which is the
point of having one. Do not argue with it in a pull request; run it.

Log through the PSR-3 interface rather than writing to a log file directly.
`psr/log` is already in the dependency set on Cacti's development line, so this is
not a dependency to justify.

### Static analysis

PHPStan runs in CI at a high level. The exact level is fixed by the project and is
not a per-change decision.

New code adds no baseline entries. A baseline is a record of debt already taken on,
not a place to put debt you are adding now. If new code cannot pass the configured
level, that is a signal about the design, not about the analyser.

### Tests

New behaviour needs tests. Every bug fix needs a test, and that test reproduces the
failure before the fix lands. A test written after the fix, which passes the first
time it is run, has demonstrated nothing.

This is the same rule as **verified means evidence** above, stated as a mechanism.

### Dependencies

Prefer a maintained library over hand-rolling. This is a deliberate difference from
the inherited codebase, which implements a great deal by hand that is available and
better tested elsewhere.

That is not a licence to add dependencies freely. Every addition is justified in the
pull request: what it replaces, why the hand-rolled version is not adequate, and what
the maintenance position of the library is. A dependency is a commitment, and one
that is abandoned in two years costs more than the code it saved.

### Commits and pull requests

| Expectation | Detail |
|---|---|
| Commit format | Conventional Commits |
| Sign-off | DCO required. `git commit -s` |
| Granularity | One logical change per commit |
| Pull request scope | One purpose |

A pull request states intent, scope, risk, and the verification evidence. Keep it
short. A one-line fix does not need nine bullet points, and a description that reads
as generated costs a reviewer's trust for no gain.

Structure a patch so it can be reviewed commit by commit. Mechanical work, such as a
formatter pass or a rename, goes in its own commit so a reviewer can read past it
quickly rather than hunting for the real change inside it.

## The inherited tree does not meet these standards

Stating it plainly is better than letting people discover it.

The code Kadupul forked uses tabs, is largely untyped, predates most of the standards
above, and does not autoload. New code and substantially rewritten code meets the
standards. Existing files are not reformatted wholesale.

The reason is not tidiness losing an argument to inertia. A wholesale reformat would
turn every future port of an upstream Cacti fix into a manual conflict resolution.
Kadupul intends to keep taking fixes from upstream for a long time, and a diff that
disagrees with upstream on every line of whitespace makes that expensive forever.
That cost is not worth paying for consistency.

Files get converted when they are being rewritten anyway. Doing it then is free,
because the diff is already large and the conflict was already going to happen.

### So which rule wins?

The two rules above point in opposite directions, and the resolution is explicit:

- **Editing an existing file:** match that file. Its indentation, its brace style, its
  error handling, its control flow. Do not introduce four-space indentation or strict
  types into a file that has neither.
- **Writing a new file, or rewriting an existing one:** apply the standards above in
  full.

A file half-converted is worse than either state, and it hides the real change from a
reviewer.

## Documentation

Documentation changes are welcome and are held to one hard rule.

Source claims from the Kadupul or Cacti source code. Do not adapt Cacti's
documentation. It carries no license, which means all rights reserved, and copying
it into this project would create an infringing derivative work. Facts about how
software behaves are free to write down. Somebody else's prose describing those
facts is not.

If you did not read it in the source, do not write it down. Settings, flags, verbs,
and defaults get quoted from the code that implements them.

## Compatibility

Kadupul stays API compatible with Cacti for the foreseeable future. A change that
breaks a plugin, a template, or an existing RRD file needs to say so plainly and
justify itself. Silent divergence is the failure mode worth avoiding.
