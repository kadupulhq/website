---
title: "Installare da un host Windows"
description: "Valutare Kadupul in Linux su Windows e comprendere gli ostacoli del Windows nativo."
banner:
  content: "Kadupul è pre-alfa. Questa procedura di piattaforma non è stata convalidata dall’inizio alla fine. Bozza di traduzione in attesa di revisione linguistica."
---

## Scegliere l’ambiente di esecuzione

L’attuale `main` richiede PHP 8.4+, `pcntl` e `posix`; PHP nativo Windows non soddisfa questi requisiti Unix. Non aggirate i controlli di piattaforma Composer. Usate una VM Linux oppure valutate WSL 2 su una versione Windows supportata da Microsoft. Sono installazioni Linux ospitate da Windows, non distribuzioni IIS native convalidate. Consultate i limiti PHP.

## Preparare Linux e installare

Per WSL, eseguite questo in PowerShell amministratore e riavviate se richiesto:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Confermate la versione 2. Completate l’account Linux e seguite l’installazione dentro Linux per database, estensioni PHP, risorse, server web e pianificatore. Tenete codice e RRD nel file system Linux, non sotto `/mnt/c/`. Consultate le guide Microsoft a WSL e ai file system.

## Verificare ciclo di vita e recupero

Usate account dedicati non privilegiati e un solo avvio della raccolta. Verificate fiducia dello spazio di archiviazione, polling, timestamp grafici e riavvio dopo un riavvio dell’host o arresto WSL. Non presumete che una sessione desktop mantenga la raccolta. Salvate insieme database, configurazione e RRD. Manutenzione distruttiva RRD ed eliminazione/archiviazione locale automatica restano indisponibili su Windows nativo; il comportamento Linux non le convalida. Consultate requisiti e backup.

[Limiti PHP](https://www.php.net/manual/en/pcntl.installation.php) · [Installazione](/it/start/install/) · [Guida Microsoft WSL](https://learn.microsoft.com/en-us/windows/wsl/install) · [File system](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Requisiti](/it/reference/requirements/) · [Backup](/it/guides/back-up-and-restore/)

Base applicativa verificata il 26 ottobre 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
