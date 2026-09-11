---
title: Questions
description: Short answers to what newcomers and existing Cacti users ask first, with a link to the page that answers each one properly.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is intended to ship.
sidebar:
  order: 7
---

Short answers. Each one links to the page that covers it in full.

## The project

### Can I install it today?

No. Kadupul has not shipped. There is no release, no installable artifact, and no
tarball. What exists is the name, the identity, this documentation site, and the
decision to fork.

The install and how-to pages describe the system as it is intended to ship, which is
why every page carries a banner saying so. See [Status](/project/status/).

### Is it production ready?

See above. Nothing has been released, so nothing has been run in production by anyone.

### Is this a replacement for Cacti?

No, and it is not trying to be. Cacti is an actively maintained project with a large
installed base. Kadupul is a fork that intends to make structural changes Cacti would
reasonably decline to make, because Cacti has users to protect and Kadupul has none.

Fixes that suit upstream go upstream. See
[Why this fork exists](/project/why-this-fork/).

### Then why fork at all?

Because the changes worth making are ones a twenty-year-old project with a change-window
installed base is right to turn down: replacing subsystems that keep producing the same
class of defect, raising the language floor, and changing internal shapes. Doing that in
a fork costs nobody an upgrade they did not ask for.

That page also says what the fork is not: a disagreement with Cacti's maintainers, and
not a clean break from users.

### Which Cacti version does it fork from?

Not decided. Cacti's release line and its development line are meaningfully different
starting positions, and the choice has not been made. See [Status](/project/status/).

### Who maintains it?

Governance is not settled and there is nothing yet to govern. The
[Contributing](/project/contributing/) page records the standard a change would be held
to, which is a different thing from a project structure. Treating this as answered when
it is not would be dishonest.

### Is there a roadmap? A release cadence? A support policy?

None of those exist. Release cadence, governance, and how contributions will be handled
are listed under what is not decided on the [Status](/project/status/) page, and this
site does not invent commitments the project has not made.

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

That is the intent. The plugin API is one of four surfaces the compatibility promise
covers, and a plugin written for Cacti is meant to load and run unchanged.

It is intent, not evidence. Nothing has shipped, so no plugin has been tested against
it. Check the plugins you actually depend on before planning anything.
See [Compatibility with Cacti](/project/compatibility-with-cacti/) and
[Coming from Cacti](/guides/coming-from-cacti/).

### Will my RRD files work?

That is the part the promise cares about most. RRD files hold history you cannot
regenerate, and they are meant to be read in place with no conversion step.

Any migration that asks you to discard and recreate them is asking for something you
should refuse. See [Coming from Cacti](/guides/coming-from-cacti/).

### Will my templates and my database carry over?

Templates are meant to import unchanged. The schema is meant to stay recognisable and
migratable without an export to an interchange format. Both are in the same promise as
plugins and RRD files.

### Where Kadupul and Cacti differ, how will I find out?

By it being written down. The failure mode the project is trying to avoid is not
divergence, which is the point of a fork. It is divergence nobody documented, which
turns every upgrade into an investigation.

### Does it work with Spine?

That is the intent. Spine is a separate upstream project, not a Kadupul component, and
Kadupul has not forked it. What Kadupul keeps is its half of the contract: the
`poller_type` and path settings, the command line the parent poller builds, the settings
Spine reads, and the tables it writes.

If you run Spine rather than the PHP collector, confirm its status before planning a
cutover. See [Spine, the C collector](/reference/spine/).

### Does it work with the RRDtool proxy?

Same answer and same caveat. The proxy daemon is a separate upstream project. Kadupul
documents and keeps the client side of the protocol. See
[RRDtool proxy](/reference/rrdproxy/).

### What does it need to run?

A web server with PHP, MySQL or MariaDB, RRDtool, and something to run the poller on a
schedule. The versions and extensions are on
[Requirements](/reference/requirements/).

## Licensing

### What licence is the software under?

GPL-3.0-or-later.

### Cacti says GPL-2. How can a fork be GPL-3?

Because Cacti's file headers grant version 2 "or, at your option, any later version",
and the headers are the operative grant. No file in the tree is version 2 only. Kadupul
takes the later-version option.

Version 3 also resolves a conflict already present upstream, where a declared
`GPL-2.0-only` in `composer.json` contradicts both the file headers and a shipped
GPL-3.0-or-later dependency. The reasoning is set out on [License](/project/license/).

### What licence is this documentation?

CC BY-SA 4.0. The site's own code stays GPL-3.0-or-later with the rest of the project.
Reuse the text if you credit the project and license what you build the same way.

### Where did these pages come from?

From reading the Cacti source, which is GPL licensed. Not from Cacti's documentation,
which carries no licence at all and therefore grants no right to create derivative
works from it.

That constraint applies to contributions as well. Documentation changes source their
claims from code. See [Contributing](/project/contributing/).

## Taking part

### How do I report a vulnerability?

Privately, through GitHub Security Advisories on the affected repository. Not as a
public issue.

There is no release yet, so there is nothing deployed to find a vulnerability in. The
process exists so it is in place before it is needed, including which findings get
embargoed and which are fixed in the open. See
[Security policy](/project/security/).

### A vulnerability I find here probably affects Cacti too. What happens?

It gets reported to The Cacti Group through their disclosure process as well. Forking
is not a reason to leave upstream users exposed.

### How do I contribute?

There is no code to contribute to yet. [Contributing](/project/contributing/) records
the engineering standards and the review standard a change would be held to, so both
are stated before the first patch rather than argued about after it.

### I found something wrong on this site.

Good. Every page here was written from source, and anything wrong is wrong on its own
merits. Each page has an edit link.
