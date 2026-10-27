---
title: "Auf FreeBSD installieren"
description: "FreeBSD-Dienste, PHP-Erweiterungen und lokalen Speicher zur isolierten Evaluierung vorbereiten."
banner:
  content: "Kadupul ist Vor-Alpha. Dieses Plattformverfahren wurde nicht durchgängig validiert. Übersetzungsentwurf ohne sprachkundige Prüfung."
---

## Host auswählen und vorbereiten

Verwenden Sie eine in FreeBSDs Supporttabelle aufgeführte Version und planen Sie Upgrades bis 2027. Betriebssystemsupport belegt keine Kadupul-Kompatibilität. Installieren Sie PHP 8.4+, MySQL oder MariaDB, RRDtool, Net-SNMP und einen Webserver nach dem Packages-and-Ports-Handbuch. Die Vorgaben von `php84-extensions` decken nicht alle Anwendungserweiterungen ab; installieren Sie fehlende Module einschließlich `pcntl` für CLI vor den Abhängigkeiten.

## Laufzeit prüfen und Dienste konfigurieren

Prüfen Sie den gewählten CLI-Interpreter und die Werkzeuge:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Prüfen Sie Web-PHP getrennt. Konfigurieren Sie bei paketiertem PHP-FPM Pool und Webserver-Anbindung vor Aktivierung von `php_fpm`. FreeBSD nutzt rc-Dienste statt systemd; folgen Sie dem Dienstehandbuch. Folgen Sie der Installation für Datenbank, Konfiguration, Schema und Browserassets. Stimmen Sie Werkzeugversionen mit der `mise.toml` der Anwendung ab; diese Pins belegen nicht, dass mises Laufzeitinstaller unter FreeBSD funktionieren.

## Als Dienstkonten planen und prüfen

Verwenden Sie genau einen cron-Starter mit absoluten Programmpfaden und dem konfigurierten Intervall, keine Linux-systemd-Unit. Prüfen Sie POSIX-Identität, Verzeichnissperren, Eigentum und ausdrückliches UID/GID-Vertrauen als jedes Web-/Poller-Konto vor der Erfassung. Prüfen Sie bei Jails Netzwerk, Mounts und Rechte innerhalb der Jail. Führen Sie einen überschneidungsfreien Zyklus aus, prüfen Sie behaltene Warteschlangenzeilen und Diagrammzeitstempel und erproben Sie die Wiederherstellung zusammengehöriger Sicherungen. Ein erfolgreicher Prozessstart genügt nicht. Siehe Voraussetzungen und Sicherung.

[Unterstützte FreeBSD-Versionen](https://www.freebsd.org/security/) · [Packages und Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [FreeBSD-Dienste](https://docs.freebsd.org/en/books/handbook/config/) · [Installation](/de/start/install/) · [Voraussetzungen](/de/reference/requirements/) · [Sicherung](/de/guides/back-up-and-restore/)

Anwendungsstand am 26. Oktober 2026 geprüft: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
