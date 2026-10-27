---
title: Install from a Windows host
description: Evaluate Kadupul in Linux on a Windows host and understand the native Windows blockers.
banner:
  content: Kadupul is pre-alpha. This platform procedure has not been validated end to end.
---

## Choose the execution environment

Current `main` requires PHP 8.4+, `pcntl` and `posix`; native Windows PHP cannot
satisfy those Unix-extension requirements. Do not bypass Composer's platform checks.
Use a Linux VM, or evaluate WSL 2 on a Windows version supported by Microsoft.
These are Linux installations hosted by Windows, not validated native IIS deployments.
See [PHP platform limits](https://www.php.net/manual/en/pcntl.installation.php).

## Prepare Linux, then install

For WSL, run this in administrator PowerShell and restart if requested:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Confirm version 2. Complete Linux account setup, then follow
[installation](/start/install/) inside Linux for the database, PHP extensions,
assets, web server and scheduler. Keep code and RRD storage in the Linux filesystem,
not under `/mnt/c/`. See [Microsoft's WSL guide](https://learn.microsoft.com/en-us/windows/wsl/install)
and [filesystem guidance](https://learn.microsoft.com/en-us/windows/wsl/filesystems).

## Check lifecycle and recovery

Use dedicated unprivileged accounts and one collection launcher. Verify storage
trust, polling, graph timestamps and restart behavior after a host reboot or WSL
shutdown. Do not assume a desktop session keeps collection running. Back up database,
configuration and RRDs together. Native Windows destructive RRD maintenance and
automatic local purge/archive remain unavailable; Linux behavior does not validate
them. See [requirements](/reference/requirements/) and
[backup](/guides/back-up-and-restore/).

Application baseline checked on 26 October 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
