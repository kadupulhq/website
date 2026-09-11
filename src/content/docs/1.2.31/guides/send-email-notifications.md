---
title: Send email notifications
description: Configure outbound mail in Kadupul, test it, and understand which
  events actually generate a message without installing a plugin.
banner:
  content: Kadupul has not shipped. These pages describe the system as it is
    intended to ship.
sidebar:
  order: 22
slug: 1.2.31/guides/send-email-notifications
---

:::caution[Not yet possible]
Kadupul has not shipped, so none of this can be done today. The page states the
intent so it can be held to it.
:::

Set the transport up first, send the test message, then find out what will and
will not reach your inbox. The last part surprises people: a stock install sends
mail about its own health, not about your data.

## Pick a transport

Three transports are available. The choice lives in the mail settings.

| Method | What it uses | Needs |
|---|---|---|
| PHP mail function | Whatever the PHP runtime is configured to call | A working local MTA and a correct `php.ini` |
| Sendmail | A binary you name by path | The path set, and the poller user able to execute it |
| SMTP | A direct network conversation with a mail server | Host, port, optional credentials, optional encryption |

Sendmail is hidden on Windows installs; the setting and its path field are
removed from the page there.

Prefer SMTP. It is the only one of the three where a failure produces a specific
error you can act on. The PHP mail function fails through a stack you do not
control, and its errors arrive as a generic false.

### SMTP settings

| Setting | Notes |
|---|---|
| Hostname | Several hosts may be given, separated by semicolons, for failover |
| Port | Defaults to 25 |
| Username | Leave blank to send unauthenticated. A blank username disables authentication outright |
| Password | Only consulted when a username is set |
| Security | `None`, `SSL` or `TLS`. `TLS` selects STARTTLS; `SSL` selects implicit TLS on connect |
| Timeout | Seconds |

Two behaviours here are worth knowing before you debug anything.

**Choosing `None` disables opportunistic encryption as well.** It does not mean
"encrypt if you can". It means the connection stays in the clear even if the
server offers STARTTLS.

**The security choice rewrites the hostname, but only if the hostname has no
colon in it.** With `SSL` or `TLS` selected, the scheme is prepended to the host.
If you typed `mail.example.net:587` into the hostname field, the colon suppresses
that rewrite and the encryption you selected is not applied the way you expect.
Put the port in the port field.

**An out-of-range timeout is not clamped to your value.** A timeout that is
empty, negative, or above 300 is replaced with 5 seconds, not with the setting's
own default. A typo here produces a mailer that gives up much faster than the
page suggests.

## Set the sender

A From address and a From name are configured once and used for every message.
If the From address is left blank, an address is generated from the server
hostname. That address is almost always rejected or silently filed as spam by
anything with a filtering policy, so set it.

Word wrap is configurable. If it is blank or negative it falls back to 76
characters rather than to the setting's default, and anything above 9999 is
capped.

## Test it

The settings page has a test action. It sends to the test email address, which is
a separate field from anything else. Leave that field blank and the test has no
recipient and fails with a message telling you so.

For SMTP, the test can probe the server before sending. That probe connects,
says hello, and authenticates if a username is set. Each of those three steps
reports its own failure with the server's last reply attached, which is the most
useful diagnostic the system produces. You can turn the probe off; if you do, a
connection failure shows up only as a send failure.

If the probe fails, no message is sent at all. The output says so rather than
implying the mail was queued.

## Read the log

Every send writes one line to the log under a mailer source, whether it worked or
not. The line carries the method used, the resolved from, to, cc and bcc strings,
the elapsed time in seconds, and the subject. On failure it also carries the
mailer's own error text and a backtrace.

That line is the fastest way to answer "did it try, and what did the server say".
Check it before changing settings.

## What actually sends mail

This is the part to read before promising anyone alerts.

| Source | Goes to | Triggered by |
|---|---|---|
| System notifications | The primary admin account's email address | Poller and system health events |
| Scheduled reports | The recipients on each report | The report scheduler |
| Discovery notifications | A per-network address, or the automation default, or the primary admin | The end of a network discovery run |
| Test message | The test email address | You, from the settings page |

### System notifications

These go to one recipient: the email address on the account named as primary
admin. Three conditions all have to hold or nothing is sent, and the failure is
logged rather than shown.

1. A primary admin account is set.
2. The "notify primary admin" option is on.
3. That account has an email address.

Each failure writes a distinct warning to the log, so the log tells you which of
the three is missing.

The events that reach it are about the system, not about your measurements. A
polling cycle exceeding its interval. The poller running out of sync with its
interval. Processes overrunning a cycle. Output rows left in the poller output
table. An invalid path to the collector binary. A plugin that was auto-disabled
after an error. A poller whose hostname will not resolve. A missing core include
file. The maximum poller runtime exceeded. A second data collector appearing.
Boost detecting an overrun.

### Scheduled reports

Reports are a graph delivery mechanism. A report holds a set of graphs, a
schedule, and a recipient list, and its own poller builds and sends the message.
Graphs are attached inline, so the body is HTML.

A report tells you what the graphs looked like. It does not tell you that
something crossed a line.

### Discovery notifications

An automation network can send a summary after a discovery run: the network name
and range, when it started, how long it took, and counts of existing and new
devices, with a table of each. Useful, and unrelated to alerting.

## Thresholds are not in core

There is no threshold engine. Nothing in a stock install watches a data source
value and emails you when it crosses a number. Search the tree for the word and
what you find is conditional support: a check for whether a threshold plugin is
enabled, and a database column that may or may not exist. Core is written to
cooperate with that plugin, not to replace it.

So the honest summary is:

| You want | Stock install | Needs a plugin |
|---|---|---|
| Mail when the poller is unhealthy | Yes | No |
| Mail when a plugin breaks | Yes | No |
| A scheduled graph digest | Yes | No |
| A summary after device discovery | Yes | No |
| Mail when a temperature exceeds 40 | No | Yes |
| Mail when an interface saturates | No | Yes |
| Escalation, acknowledgement, on-call routing | No | Yes |

See [Install and vet plugins](/1.2.31/guides/install-and-vet-plugins/) before adding
one. A threshold plugin reads every data source you own on every cycle, which
makes it a poller-performance decision as much as a notification one.

## Templating in a message body

Where a message body is built from a template, a few tokens are substituted
before sending: the subject, and the resolved to, cc, from and reply-to strings.
The subject itself accepts a date and time token. Bodies that contain a graph
token switch attachment handling into an inline mode so the image renders in the
message rather than arriving as a file.

This matters when you write a report body. A graph token in a plain text body
has nothing to render into.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Test says no recipient address is set | The test email field is blank |
| Test reports a ping failure and sends nothing | SMTP host, port, or credentials wrong. The server's reply is in the message |
| Encryption selected but the connection is plain | A colon in the hostname field suppressed the scheme rewrite |
| Connection is plain even though the server offers STARTTLS | Security is set to `None`, which disables opportunistic TLS |
| Mailer gives up after about five seconds | Timeout empty, negative, or above 300, so it fell back to 5 |
| Mail from the poller works, mail from the web interface does not | Two different users, two different environments. Check both against the same MTA |
| System warnings never arrive | No primary admin set, notification option off, or that account has no email address. The log names which |
| Nothing arrives when a value goes out of range | Expected. Core has no threshold engine |
| Messages arrive but land in spam | The From address is the generated hostname default. Set a real one |
