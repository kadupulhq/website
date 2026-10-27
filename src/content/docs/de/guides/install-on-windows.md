---
title: "Von einem Windows-Host installieren"
description: "Kadupul unter Linux auf Windows evaluieren und native Windows-Hindernisse verstehen."
banner:
  content: "Kadupul ist Vor-Alpha. Dieses Plattformverfahren wurde nicht durchgängig validiert. Übersetzungsentwurf ohne sprachkundige Prüfung."
---

## Ausführungsumgebung wählen

Aktuelles `main` benötigt PHP 8.4+, `pcntl` und `posix`; natives Windows-PHP erfüllt diese Unix-Anforderungen nicht. Umgehen Sie Composers Plattformprüfungen nicht. Verwenden Sie eine Linux-VM oder evaluieren Sie WSL 2 auf einer von Microsoft unterstützten Windows-Version. Dies sind von Windows gehostete Linux-Installationen, keine validierten nativen IIS-Bereitstellungen. Siehe PHP-Plattformgrenzen.

## Linux vorbereiten und installieren

Führen Sie für WSL Folgendes in einer administrativen PowerShell aus und starten Sie bei Aufforderung neu:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Bestätigen Sie Version 2. Richten Sie das Linux-Konto ein und folgen Sie der Installation innerhalb von Linux für Datenbank, PHP-Erweiterungen, Assets, Webserver und Zeitplanung. Code und RRD-Speicher gehören ins Linux-Dateisystem, nicht unter `/mnt/c/`. Siehe Microsofts WSL- und Dateisystemhinweise.

## Lebenszyklus und Wiederherstellung prüfen

Verwenden Sie eigene unprivilegierte Konten und genau einen Erfassungsstarter. Prüfen Sie Speichervertrauen, Erfassung, Diagrammzeitstempel und Neustartverhalten nach Host-Neustart oder WSL-Abschaltung. Eine Desktopsitzung garantiert keine dauerhafte Erfassung. Sichern Sie Datenbank, Konfiguration und RRDs gemeinsam. Destruktive RRD-Wartung und automatische lokale Löschung/Archivierung sind unter nativem Windows weiterhin nicht verfügbar; Linux-Verhalten validiert sie nicht. Siehe Voraussetzungen und Sicherung.

[PHP-Grenzen](https://www.php.net/manual/en/pcntl.installation.php) · [Installation](/de/start/install/) · [Microsofts WSL-Leitfaden](https://learn.microsoft.com/en-us/windows/wsl/install) · [Dateisystemhinweise](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Voraussetzungen](/de/reference/requirements/) · [Sicherung](/de/guides/back-up-and-restore/)

Anwendungsstand am 26. Oktober 2026 geprüft: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
