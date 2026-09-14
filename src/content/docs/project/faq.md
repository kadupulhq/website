---
title: Questions
description: Short answers to what newcomers and existing Cacti users ask first, with a link to the page that answers each one properly.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 7
---

Short answers. Each one links to the page that covers it in full.

## The project

### Can I install it today?

The source is available for development and isolated testing. There is no
supported release or validated production installation path.

The install and how-to pages require validation against the code you use.
See [Status](/project/status/).

### Is it production ready?

No. The repository describes Kadupul as pre-alpha and not ready for production.
Release status does not tell us whether anyone has deployed development code.

### Is this a replacement for Cacti?

No, and it is not trying to be. Cacti is an actively maintained project with a large
installed base. Kadupul is a fork that intends to make structural changes Cacti would
reasonably decline to make, because Cacti has users to protect and Kadupul has none.

Kadupul maintains its own forks and support channels. See
[Why this fork exists](/project/why-this-fork/).

### Then why fork at all?

Because the changes worth making are ones a twenty-year-old project with a change-window
installed base is right to turn down: replacing subsystems that keep producing the same
class of defect, raising the language floor, and changing internal shapes. Doing that in
a fork costs nobody an upgrade they did not ask for.

That page also says what the fork is not: a disagreement with Cacti's maintainers, and
not a clean break from users.

### Which Cacti version does it fork from?

The application derives from Cacti 1.2.31. The repository maintains `main` and
`lts/1.2` lines with different release goals. See [Status](/project/status/).

### Who maintains it?

The Kadupul project maintains the repository. Use its issue tracker and
[contribution process](/project/contributing/) for project work.

### Is there a roadmap? A release cadence? A support policy?

The repository has release goals, a versioning policy and a contribution process.
There is no supported production release yet. See [Status](/project/status/) for
the distinction between planned versions and published artifacts.

### Is it affiliated with The Cacti Group?

No. Kadupul is not affiliated with or endorsed by The Cacti Group. It describes itself
as a fork of Cacti because that is a factual statement about where the code came from.
Cacti is their project and their name.

### What is the name about?

Kadupul is the Sinhala name for a night-flowering cactus. Cacti takes its name from the
plant family; Kadupul is one species inside it. The name says where the project came
from without claiming to stand in for the whole of it. The longer version is in
[What Kadupul is](/start/what-kadupul-is/).

## Coming from Cacti

### Will my plugins work?

That is the intent. The plugin API is one of four compatibility goals. Loading
and running a Cacti plugin unchanged must be demonstrated for the versions in use.

Compatibility is a goal, not blanket evidence for every plugin. Check the plugins
and versions you actually depend on before planning a migration.
See [Compatibility with Cacti](/project/compatibility-with-cacti/) and
[Coming from Cacti](/guides/coming-from-cacti/).

### Will my RRD files work?

Preserving RRD history is a compatibility goal. The files hold history you cannot
regenerate. Validate reading existing files on a copy before any migration.

Any migration that asks you to discard and recreate them is asking for something you
should refuse. See [Coming from Cacti](/guides/coming-from-cacti/).

### Will my templates and my database carry over?

Templates are meant to import unchanged. The schema is meant to stay recognisable and
migratable without an export to an interchange format. These are goals requiring
validation, as with plugins and RRD files.

### Where Kadupul and Cacti differ, how will I find out?

By it being written down. The failure mode the project is trying to avoid is not
divergence, which is the point of a fork. It is divergence nobody documented, which
turns every upgrade into an investigation.

### Does it work with Spine?

Kadupul will maintain a Spine fork alongside the PHP collector. Its repository
location and validated builds are not yet documented here. Spine is built and
installed separately. The inherited integration includes the
`poller_type` and path settings, the parent poller's command line, the settings
Spine reads, and the tables it writes.

Validate your Kadupul and Spine versions together before a cutover. Report problems
in the [Kadupul issue tracker](https://github.com/kadupulhq/kadupul/issues). See
[Spine, the C collector](/reference/spine/) for configuration and build guidance.

### Does it work with the RRDtool proxy?

Kadupul does not use the Cacti organization's proxy daemon. Use local RRDtool
storage. The [RRDtool proxy reference](/reference/rrdproxy/) records the inherited
client protocol; it is not a supported deployment option. A Kadupul-owned
replacement must be established and validated before proxy deployment is documented.

### What does it need to run?

A web server with PHP, MySQL or MariaDB, RRDtool, and something to run the poller on a
schedule. The versions and extensions are on
[Requirements](/reference/requirements/).

## Licensing

### What licence is the software under?

GPL-3.0-or-later.

### Cacti says GPL-2. How can a fork be GPL-3?

The inherited application license permits GPL version 2 or later. Kadupul uses
the later-version option for its distribution. Dependencies retain their own
license terms. See [License](/project/license/).

### What licence is this documentation?

CC BY-SA 4.0. The site's own code stays GPL-3.0-or-later with the rest of the project.
Reuse the text if you credit the project and license what you build the same way.

### Where did these pages come from?

These pages describe behavior from the application source. Third-party prose
requires its own license review before reuse.

That constraint applies to contributions as well. Documentation changes source their
claims from code. See [Contributing](/project/contributing/).

## Taking part

### How do I report a vulnerability?

Privately, through GitHub Security Advisories on the affected repository. Not as a
public issue.

Unreleased code may be deployed and can contain vulnerabilities. Report privately
regardless of release status. See [Security policy](/project/security/).

### A vulnerability I find here probably affects Cacti too. What happens?

Report it privately to Kadupul. Kadupul maintainers own triage and remediation
for this project and coordinate disclosure with other affected maintainers when
needed. Reporters do not need to use another organization's support process.

### How do I contribute?

Read [Contributing](/project/contributing/) and the contributor guide on your
target branch. Discuss substantial changes before implementing them.

### I found something wrong on this site.

Good. Every page here was written from source, and anything wrong is wrong on its own
merits. Each page has an edit link.
