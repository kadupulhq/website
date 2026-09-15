---
title: RRDtool proxy
description: Historical reference for the inherited RRDtool proxy client and protocol. Proxy deployment is unsupported.
banner:
  content: Kadupul is pre-alpha. Validate these procedures in an isolated test installation.
sidebar:
  order: 16
---

**Proxy deployment is unsupported. Use local RRDtool storage.** Kadupul does not
use the Cacti organization's proxy daemon. A Kadupul-owned replacement must be
established and validated before proxy deployment is documented.

The following socket details describe inherited behavior for historical diagnostics.
RRDtool opens filesystem paths locally. The inherited proxy client instead sent
RRDtool command text over TCP to a daemon beside the RRD files and received its
output. This is not an installation or configuration recommendation.

This page documents the client half only: what Kadupul sends, what it expects back, and
which settings control it. All of it is read from `lib/rrd.php`, inherited from Cacti
1.2.x. Nothing here was read from the daemon's source, so where the daemon's behaviour
is implied rather than observed, the page says so.

## Historical configuration

The `storage_location` setting picks the path.

| Value | Label | Behaviour |
|---|---|---|
| 0 | Local | Run RRDtool as a child process. |
| 1 | RRDtool Proxy Server | Open a socket and send commands to the daemon. |

`rrd_init()`, `rrdtool_execute()`, and `rrd_close()` each dispatch on it, so the choice
applies to every RRDtool call in the application. Setting
`$config['force_storage_location_local'] = true` in the configuration file overrides the
database setting and forces local execution.

The connection settings live on the Data settings tab.

| Setting | Meaning | Default |
|---|---|---|
| `rrdp_server` | Hostname or address of the proxy. | |
| `rrdp_port` | TCP port. | `40301` |
| `rrdp_fingerprint` | Expected fingerprint of the proxy's RSA public key. | |
| `rrdp_load_balancing` | Spread requests across both proxies. | off |
| `rrdp_server_backup` | Hostname or address of the second proxy. | |
| `rrdp_port_backup` | TCP port of the second proxy. | `40301` |
| `rrdp_fingerprint_backup` | Expected fingerprint of the second proxy's key. | |

See [Configuration](/reference/configuration/) for where these sit among the rest.

## Opening a session

`__rrd_proxy_init()` creates a TCP socket and connects. With `rrdp_load_balancing` on,
it picks between the primary and the backup at random; with it off, it tries the primary
first. Either way, a failed connection falls through to the other server before giving
up.

The handshake exchanges public keys:

1. Kadupul writes its own RSA public key, followed by the terminator `_EOT_\r\n`. The
   key is the 2048-bit pair the application generates for itself on first use and keeps
   in `settings` as `rsa_public_key` and `rsa_private_key`.
2. It reads until it sees the same terminator, and treats what arrives as the proxy's
   public key.
3. It fingerprints that key and compares the result against `rrdp_fingerprint`, or
   `rrdp_fingerprint_backup` for the second server.

A mismatch closes the socket and fails the session. This is the whole of the
authentication: the fingerprint you configure is what decides whether a given daemon is
trusted. Getting it wrong in the permissive direction means talking to whatever answers
on that port.

The session then sends two control commands that RRDtool itself does not understand:

| Command | Purpose |
|---|---|
| `setenv RRD_DEFAULT_FONT '<path>'` | Sent only when `path_rrdtool_default_font` is set. |
| `setcnn encryption off` | Asks the proxy to drop encryption for the rest of the session. |

Whether the proxy accepts the second one decides whether the remainder of the session is
encrypted. Closing the session sends `quit` and shuts the socket down.

## The verbs

Two groups. The first is RRDtool's own subcommands, which the proxy passes through:
`create`, `update`, `fetch`, `graph`, `graphv`, `xport`, `info`, `dump`, `restore`,
`tune`, `resize`, and `last`. Those are covered in
[RRDtool integration](/reference/rrdtool-integration/).

The second group is filesystem operations that exist only because the files are on the
far side of the socket. Locally, these are PHP function calls. Over a proxy, they have
to become commands.

| Verb | Local equivalent | Sent by |
|---|---|---|
| `file_exists` | `file_exists()` | `rrdtool_file_exists()`, and the create and update paths before deciding whether to build a file |
| `is_dir` | `is_dir()` | `rrdtool_function_create()`, before creating a parent directory |
| `mkdir` | `mkdir(..., 0775, true)` | `rrdtool_function_create()`, when `extended_paths` is on |
| `unlink` | The maintenance code's own delete | `poller_maintenance.php`, removing an orphaned file |
| `archive` | The maintenance code's own move | `poller_maintenance.php`, archiving an orphaned file |

All five are called through `rrdtool_execute_path_command()` with the
`RRDTOOL_OUTPUT_BOOLEAN` flag, which exists for the proxy and has no local meaning.

Every call site branches on `storage_location` and picks the verb or the PHP function.
A code path that reaches for the PHP function unconditionally is a bug on a proxied
install, and it fails in the quiet direction: the check reports on the local filesystem,
which does not hold the file.

## Paths are rewritten

Before a command goes out, the configured `rra_path` is replaced with `.` throughout the
command line. A local path of `/var/www/html/cacti/rra/12/34.rrd` leaves as
`./12/34.rrd`.

The consequence is worth stating plainly. **The proxy resolves paths relative to its own
RRD directory, and the two machines do not need the same layout.** What must match is the
structure under the RRD root, because everything below that point is sent verbatim.

The same substitution collapses the `\\\n` continuations the command builder uses for
readability into single spaces.

## The wire

| Element | Value |
|---|---|
| End of packet | `_EOP_\r\n` |
| End of sequence | `_EOT_\r\n` |
| Compression | Command lines of 8192 bytes or more are gzipped before encryption. A reply starting with the gzip magic bytes is unzipped. |
| Key wrapping | RSA-OAEP with SHA-1, wrapping a 256-bit AES key |
| Payload | AES-CBC with an all-zero IV |
| Framing | Three hex digits of length, then the base64 wrapped key, then the base64 ciphertext |

The implementation runs on phpseclib 3 but reproduces phpseclib 2's wire format
deliberately, including its truncation of oversized Rijndael keys to 32 bytes, so that
proxies built against the older library keep working.

The crypto here is dated. SHA-1 in the OAEP construction and a fixed all-zero IV are both
choices nobody would make in a new protocol. They are kept because the far end is a
separate program on a release cycle Kadupul does not control, and changing either side
alone breaks every install. Treat the proxy link as something to keep on a trusted
network rather than as a protected channel across one you do not trust.

## Reading the reply

Kadupul reads until the end-of-sequence terminator, splits on the end-of-packet
terminator, decrypts each piece, and appends it to the output. It stops early when the
accumulated output contains `OK u` or `ERROR:`.

That stop condition is the RRDtool batch-mode acknowledgement, which means the proxy is
expected to be driving RRDtool through its stdin the same way the local path does.

The output flag then decides what the caller receives.

| Flag | Result |
|---|---|
| `RRDTOOL_OUTPUT_NULL` | Nothing. |
| `RRDTOOL_OUTPUT_STDOUT`, `RRDTOOL_OUTPUT_GRAPH_DATA` | Everything up to `OK u`, right-trimmed. |
| `RRDTOOL_OUTPUT_STDERR`, `RRDTOOL_OUTPUT_RETURN_STDERR` | `OK` for output that looks like a PNG or a GIF, `SVG/XML Output OK` for output starting `<?xml`, otherwise the text is returned or printed. |
| `RRDTOOL_OUTPUT_BOOLEAN` | True when the output contains `OK u`. |

A non-numeric flag falls back to `RRDTOOL_OUTPUT_STDOUT`.

## Failure

A connection that cannot be made logs `CACTI2RRDP ERROR: Unable to connect to RRDtool
Proxy Server #<n>` and, once both servers have been tried, returns false. Callers treat
that the way they treat a missing RRDtool binary: no output, no exception. Missing data
is how it shows up.

Decryption failures log the offending packet. A session closed by the proxy mid-reply
logs and stops reading.

There is no retry loop equivalent to the local path's RRDtool restart handling. A
proxied command that fails, fails once.

## What this means for remote collection

The proxy is the mechanism behind a statement made in
[Remote data collection](/concepts/remote-data-collection/): collection distributes and
storage does not.

A remote collector does not hold RRD files. It sends collected values to the central
database as rows, and the main install writes them. Where the proxy fits is the other
direction: any machine that needs to read or write the RRD tree and does not have it
mounted reaches it over this socket. The deferred-write path checks for it: a remote
collector whose `storage_location` is Local fails that check rather than writing into a
directory that is not the real RRD tree.

Two things this does not buy you:

- **It does not distribute storage.** Every proxied command lands on one daemon holding
  one tree. Adding collectors adds load to that tree.
- **It is not faster than a local disk.** A command that was a function call becomes a
  round trip, encrypted, over a network. The reason to use it is that the files are
  elsewhere, not that it performs better.

The backup server and `rrdp_load_balancing` spread requests across two proxies. Both
proxies must be serving the same RRD tree for that to mean anything, which is a
statement about your storage rather than about this setting.
