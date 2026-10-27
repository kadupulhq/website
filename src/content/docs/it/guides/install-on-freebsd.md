---
title: "Installare su FreeBSD"
description: "Preparare servizi, estensioni PHP e spazio locale FreeBSD per una valutazione isolata."
banner:
  content: "Kadupul è pre-alfa. Questa procedura di piattaforma non è stata convalidata dall’inizio alla fine. Bozza di traduzione in attesa di revisione linguistica."
---

## Scegliere e preparare l’host

Usate una versione nella tabella delle versioni FreeBSD supportate e pianificate gli aggiornamenti fino al 2027. Il supporto del sistema non prova la compatibilità Kadupul. Installate PHP 8.4+, MySQL o MariaDB, RRDtool, Net-SNMP e un server web seguendo il manuale Packages and Ports. I valori predefiniti di `php84-extensions` non coprono tutte le estensioni applicative; installate i moduli mancanti, incluso `pcntl` per CLI, prima delle dipendenze.

## Controllare l’ambiente e configurare i servizi

Controllate l’interprete CLI e gli strumenti scelti:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Controllate PHP web separatamente. Per PHP-FPM in pacchetto configurate pool e collegamento del server web prima di abilitare `php_fpm`. FreeBSD usa servizi rc, non systemd; seguite il manuale dei servizi. Seguite l’installazione per database, configurazione, schema e risorse browser. Allineate gli strumenti al `mise.toml` dell’applicazione; quei vincoli non provano che gli installer runtime di mise funzionino su FreeBSD.

## Pianificare e verificare con gli account di servizio

Usate un solo avvio cron con percorsi assoluti e intervallo configurato; non installate l’unità systemd Linux. Con ogni account web/poller verificate identità POSIX, blocco delle directory, proprietà e fiducia UID/GID esplicita prima della raccolta. Nelle jail controllate rete, mount e permessi dall’interno. Eseguite un ciclo senza sovrapposizioni, ispezionate righe mantenute in coda e timestamp grafici, poi provate il ripristino di un backup coerente. Il solo avvio riuscito non basta. Consultate requisiti e backup.

[Versioni FreeBSD supportate](https://www.freebsd.org/security/) · [Packages e Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Servizi FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Installazione](/it/start/install/) · [Requisiti](/it/reference/requirements/) · [Backup](/it/guides/back-up-and-restore/)

Base applicativa verificata il 26 ottobre 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
