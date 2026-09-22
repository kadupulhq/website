---
title: Send email notifications
description: Configure outbound mail in Kadupul, test it, and understand which events actually generate a message without installing a plugin.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 22
---

:::caution[Validate before use]
The source is available, but there is no supported Kadupul release or migration
path. Test these procedures on an isolated copy with backups before relying on
them. See [project status](/project/status/).
:::

Set the transport up first, send the test message, then find out what will and
will not reach your inbox. The last part surprises people: a stock install sends
mail about its own health, not about your data.

## Pick a transport

This page describes the current legacy mail path on main. The administrator
notification migration in PR #196 is not merged at the audited revision. Three
transports are available under **Settings → Mail/Reporting/DNS**.

| Method | What it uses | Needs |
|---|---|---|
| PHP mail function | Whatever the PHP runtime is configured to call | A working local MTA and a correct `php.ini` |
| Sendmail | A binary you name by path | The path set, and the poller user able to execute it |
| SMTP | A direct network conversation with a mail server | Host, port, optional credentials, optional encryption |

Sendmail is hidden on Windows installs; the setting and its path field are
removed from the page there.

SMTP exposes server replies directly, which can help diagnose delivery problems.
PHP mail and Sendmail can also report failures; they depend on local runtime/MTA
configuration and logs. Acceptance by any transport does not prove inbox delivery.

### SMTP settings

| Setting | Notes |
|---|---|
| Hostname | Several hosts may be given, separated by semicolons, for failover |
| Port | Defaults to 25 |
| Username | Leave blank to send unauthenticated. A blank username disables authentication outright |
| Password | Only consulted when a username is set |
| Security | `None`, `SSL` or `TLS`. `TLS` selects STARTTLS; `SSL` selects implicit TLS on connect |
| Timeout | Seconds |

Check these behaviors before debugging transport failures.

**Choosing `None` disables opportunistic encryption as well.** It does not mean
"encrypt if you can". It means the connection stays in the clear even if the
server offers STARTTLS.

**A port in the hostname does not disable the selected encryption.** The sender
sets PHPMailer's security mode separately from its optional hostname-prefix
rewrite. The runtime audit delivered with STARTTLS using both `localhost` plus a
port setting and `localhost:2525`. A plain hostname and separate port field are
easier to inspect; explicit host schemes and failover configurations need their
own validation.

**An out-of-range timeout is not clamped to your value.** A timeout that is
empty, negative, or above 300 is replaced with 5 seconds, not with the setting's
own default. A typo here produces a mailer that gives up much faster than the
page suggests.

## Set the sender

Configure a valid From address and name accepted by your mail service. Callers
can supply their own sender, so the defaults are not mandatory overrides for
every message.

`send_mail()` rejects a missing sender with `ERROR: From Email Address Not Set`
when neither the caller nor the settings provides one. The lower-level `mailer()`
has a generated-address fallback, but it is not reached through that empty-sender
wrapper path. Do not rely on a generated address to make the settings test or
administrator notifications work.

Word wrap is configurable. If it is blank or negative it falls back to 76
characters rather than to the setting's default, and anything above 9999 is
capped.

## Test it

The settings page has a test action. It sends to the test email address, which is
a separate field from anything else. Leave that field blank and the test has no
recipient and fails with a message telling you so.

For SMTP, **Ping Mail Server** optionally probes the server before sending. It
is an SMTP connection/greeting/authentication check, not an ICMP ping. A failed
probe prevents the test message from being sent.

The legacy probe has a STARTTLS defect: selecting TLS can make it start TLS at
connection time instead of sending the SMTP `STARTTLS` command. That probe can
fail against a working STARTTLS server even though actual message delivery works.
Set **Ping Mail Server** to **No** to test the sender directly while retaining
TLS; do not turn off encryption to work around a probe failure. Check the sender's
result and the receiving server independently.

An empty test recipient is rejected. The test recipient and primary administrator
address are separate settings; a successful test does not validate administrator
notification policy.

## Read the log

Calls that reach the transport send step log under `MAILER`, including method,
resolved addresses, subject and elapsed time. Failures add the mailer error and
can produce a backtrace. Earlier address-validation failures use their own error
path; `send_mail()` can return a missing-sender error before that logging occurs.
A missing send-summary line does not uniquely mean no caller attempted mail.

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
admin. Four policy conditions must hold:

1. A primary admin account is set.
2. The "notify primary admin" option is on.
3. The configured account id resolves to an existing user.
4. That account has an email address.

Each policy failure has a distinct warning. Valid policy is still not delivery:
the sender and transport must also work. The current `admin_email()` wrapper does
not return a delivery result to its caller.

The events that reach it are about the system, not about your measurements. A
polling cycle exceeding its interval. The poller running out of sync with its
interval. Processes overrunning a cycle. Output rows left in the poller output
table. An invalid path to the collector binary. A plugin that was auto-disabled
after an error. A poller whose hostname will not resolve. A missing core include
file. The maximum poller runtime exceeded. A second data collector appearing.
Boost detecting an overrun.

Some call sites debounce repeated notices, but there is no single global rate
limit or retry queue inside `admin_email()`. Suppression and retry behavior must
be checked for the particular event.

### Scheduled reports

Reports deliver selected graphs on a schedule; they do not evaluate threshold
crossings. Configure and preview a small report before enabling a broad digest.

1. Choose the report owner and verify which graphs that account can access.
   Rendering uses the owner's graph permissions. A missing owner account causes
   the report to be disabled.
2. Set the report's To and optional Bcc recipients, subject, and sender. These are
   independent of the test address and primary-admin notification policy. An empty
   subject falls back to the report name.
3. Add graph, device, tree or text items. Set graph timespans, dimensions and image
   handling. Reports support inline or attached images; they are not always inline.
4. Set the first scheduled time, interval and enabled flag. Preview the content,
   then check a controlled delivery before relying on the schedule.

The main poller's end-of-run hook launches `poller_reports.php`; a second cron
entry is normally unnecessary. A normal report run selects enabled reports whose
`mailtime` is earlier than its start time. Future and disabled reports are skipped.
Successful delivery updates `lastsent` and advances `mailtime` from the previous
scheduled time. If that computed next time is still past, it is clamped to the
current time, so long downtime can leave the report due again on the next pass.

`poller_reports.php --force` bypasses its process-registration guard and selects
all enabled reports, including future ones. It still advances their schedules and
does not include disabled reports. Do not use it as a single-report test or as
routine scheduling. Use the selected report's send action for a targeted check.

Current reporting has two delivery limitations:

- A transport failure leaves `mailtime` and `lastsent` unchanged, but the report
  poller still exits 0 and increments its `Reports` statistic. That statistic
  counts processing attempts, not accepted messages. Inspect report/mailer errors
  and `lastsent`; exit status alone does not establish delivery.
- **Maximum E-Mail Size** is present in settings but is not enforced by this send
  path. Keep reports small and respect the receiving service's limit; do not rely
  on that setting to reject oversized mail.

Reports use an HTML body. Image attachments are generated from current RRD data
for the selected time range, not from a historical screenshot captured at the
scheduled instant. A preview does not prove SMTP acceptance, and SMTP acceptance
does not prove the recipient displayed the images or received the message.

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

Core capabilities at the audited revision:

| You want | Stock install | Needs a plugin |
|---|---|---|
| Mail when the poller is unhealthy | Yes | No |
| Mail when a plugin breaks | Yes | No |
| A scheduled graph digest | Yes | No |
| A summary after device discovery | Yes | No |
| Mail when a temperature exceeds 40 | No | Yes |
| Mail when an interface saturates | No | Yes |
| Escalation, acknowledgement, on-call routing | No | Yes |

See [Install and vet plugins](/guides/install-and-vet-plugins/) before adding
one. A plugin’s selection, schedule and delivery behavior depend on that plugin;
measure its collection overhead and validate its notification policy.

## Templating in a message body

Where a message body is built from a template, a few tokens are substituted
before sending: `<SUBJECT>`, `<TO>`, `<CC>`, `<FROM>` and `<REPLYTO>`.
The subject itself accepts `|date_time|`. Bodies that contain a graph
token switch attachment handling into an inline mode so the image renders in the
message rather than arriving as a file.

This matters when you write a report body. A graph token in a plain text body
has nothing to render into.

## Failure modes

| Symptom | Usual cause |
|---|---|
| Test says no recipient address is set | The test email field is blank |
| Test reports a ping failure and sends nothing | Check connectivity and credentials; the legacy STARTTLS probe defect can also reject a working server |
| Unsure whether TLS was used | Verify the transport/session evidence; a colon in the hostname alone does not disable the selected security mode |
| Connection is plain even though the server offers STARTTLS | Security is set to `None`, which disables opportunistic TLS |
| Mailer gives up after about five seconds | Timeout empty, negative, or above 300, so it fell back to 5 |
| Mail from the poller works, mail from the web interface does not | Two different users, two different environments. Check both against the same MTA |
| System warnings never arrive | Check primary-admin selection, account existence, notification policy, recipient address, sender and transport |
| Nothing arrives when a value goes out of range | Expected. Core has no threshold engine |
| Messages arrive but land in spam | Check sender authorization, domain authentication and recipient filtering; transport acceptance does not settle those checks |
