---
title: "Voraussetzungen"
description: "Voraussetzungen für Laufzeit, Speicherung und Bereitstellung zur Planung für 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
---

Am 26. Oktober 2026 anhand der unten verlinkten Anwendungsrevision geprüft. Diese Grundlage dient der Planung für 2026–2027 und ist keine Veröffentlichungs- oder Supportzusage.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Laufzeit

`main` benötigt PHP 8.4 oder neuer und verbindet Symfony 7.4 mit bisherigen Einstiegspunkten. Für `lts/1.2` gelten eigene Voraussetzungen. Installieren Sie MySQL oder MariaDB, RRDtool und einen PHP-Kollektor oder einen kompatiblen Spine-Build. Verwenden Sie für Builds aus dem Quellcode die Versionen aus `mise.toml` über `mise exec`; installieren Sie die gesperrten Abhängigkeiten, ohne sie zu aktualisieren.

## PHP

Das Manifest verlangt zusätzlich zu PHP diese Erweiterungen:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Der Installer prüft unter anderem zusätzlich `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` und `zlib`. Unter Unix prüft er `posix` und CLI-`pcntl`, unter Windows `com_dotnet`. Ein bestandener Installationscheck belegt nicht, dass Composers Anforderungen erfüllt sind. Prüfen Sie CLI- und Web-PHP getrennt. Setzen Sie `date.timezone`; der Installer empfiehlt `memory_limit=400M` und `max_execution_time=60` oder unbegrenzte Werte. Die optionale Erweiterung `snmp` ermöglicht Abfragen im Prozess, `gettext` aktiviert Übersetzungskataloge.

## Datenbank

Verwenden Sie eine vom Anbieter gepflegte MySQL- oder MariaDB-Version und prüfen Sie sie mit der Zielrevision. Alte Installer-Schwellen für MySQL 5.6 und MariaDB 10.0 belegen keinen Support für 2026–2027. Auf `main` verwenden `poller_output`, `poller_output_boost` und `poller_output_realtime` InnoDB; einige Koordinationstabellen verwenden weiterhin MEMORY. Stellen Sie nicht alle Tabellen auf dieselbe Engine um. Befüllen Sie `mysql.time_zone_name` und gewähren Sie dem Anwendungskonto SELECT-Zugriff darauf.

## RRDtool

Konfigurieren Sie den absoluten Programmpfad und gleichen Sie die eingestellte Version mit der installierten ab. `DCOUNTER` und `DDERIVE` benötigen RRDtool 1.5 oder neuer. Lokaler Unix-Speicher benötigt POSIX-Identitätsprüfungen und funktionierendes `flock` für Verzeichnisse. Stoppen Sie externe Schreibprozesse und Cache-Daemons vor exklusiver Wartung. Der bisherige Proxy-Pfad existiert, stellt aber keine Zusicherung einer geprüften Bereitstellung dar.

## net-snmp

Installieren Sie Net-SNMP-Werkzeuge, wenn PHP `snmp` fehlt oder deaktiviert ist. Setzen Sie `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` und `path_snmptrap` auf die jeweiligen Programmpfade. Prüfen Sie den gewählten Pfad mit der SNMP-Version des Geräts, gegebenenfalls einschließlich SNMPv3 über IPv6; der bisherige Installer rät bei dieser Kombination von PHP `snmp` ab.

## Webserver

Führen Sie PHP über die konfigurierte Web-Laufzeit aus und verwenden Sie TLS. Behalten Sie bisherige Routen neben `/app.php/...` bei; stellen Sie nicht das gesamte Dokumentenwurzelverzeichnis auf `public/` um, solange bisherige Seiten benötigt werden. Konfigurieren Sie PATH_INFO für den Kompatibilitätseinstiegspunkt. Nginx ignoriert `.htaccess`; sperren Sie Quellcode, Konfiguration, Abhängigkeiten, Werkzeuge, Tests, Geheimnisse und Laufzeitdaten durch ausdrückliche Regeln vor der PHP-Verarbeitung. Das URL-Präfix muss `$url_path` entsprechen.

## Zeitplanung

Verwenden Sie genau einen Startmechanismus: cron, Aufgabenplanung oder den mitgelieferten Kollektor-Daemondienst. Stimmen Sie dessen Takt auf das konfigurierte Startintervall ab. Abfragen im Abstand von weniger als einer Minute laufen innerhalb dieses Intervalls; cron allein bietet diesen Takt nicht. Führen Sie Prüfungen als Poller-Konto aus und stoppen Sie den regulären Startmechanismus, um Überschneidungen zu vermeiden.

## Dateisystem

Gewähren Sie nur erforderlichen Konten Zugriff auf die tatsächlichen RRD-Pfade, Protokolle, Caches und Symfony-Laufzeitverzeichnisse. Das RRD-Standardverzeichnis ist `rra/`. Getrennte Unix-Web-/Poller-Konten benötigen explizite numerische IDs in `rrd_maintenance_trusted_uids` und bei schreibberechtigten Gruppen in `rrd_maintenance_trusted_gids` in `include/config.php`. Jedes Mitglied dieser Gruppen muss vertrauenswürdig sein. Normale Berechtigungen gelten weiterhin; für alle beschreibbarer Speicher wird abgelehnt. Verwenden Sie für alle Schreibprozesse dieselben Vertrauenseinstellungen und prüfen Sie vor Upgrades beide Konten.

## Berechtigungen

Betreiben Sie Webprozess und Poller mit eigenen unprivilegierten Konten. Raw-ICMP benötigt zusätzliche Betriebssystemrechte; verwenden Sie andernfalls TCP-, UDP- oder SNMP-Prüfungen. Führen Sie nicht die gesamte Anwendung als root aus, um Ping zu ermöglichen. Windows fehlt die ACL-Prüfung für destruktive lokale RRD-Wartung; gewöhnliche Aktualisierungen verwenden synchrone RRDtool-Bestätigungen. Unix-Durchsatzmessungen belegen keine Windows-Kapazität.

## Zur PHP-Version

Für die Planung 2026–2027 erhält PHP 8.4 aktive Wartung bis zum 31. Dezember 2026 und Sicherheitskorrekturen bis zum 31. Dezember 2028. PHP 8.5 erhält aktive Wartung bis zum 31. Dezember 2027 und Sicherheitskorrekturen bis zum 31. Dezember 2029. Dies sind Termine des PHP-Projekts und keine Kadupul-Kompatibilitätsmatrix. Prüfen Sie neuere Laufzeiten vor der Einführung mit den gesperrten Abhängigkeiten. Symfonys niedrigere PHP-Mindestversion senkt Kadupuls Mindestversion 8.4 nicht. Prüfen Sie vor der Bereitstellung erneut die offiziellen Zeitpläne und die Zielrevision.

[Datenbankoptimierung](/de/guides/tune-database-performance/) · [RRDtool-Integration](/de/reference/rrdtool-integration/) · [SNMP](/de/reference/snmp/) · [Dateistruktur](/de/reference/file-layout/) · [Installation](/de/start/install/) · [Voraussetzungen für Speicher-Upgrades](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Unterstützte PHP-Versionen](https://www.php.net/supported-versions.php)
