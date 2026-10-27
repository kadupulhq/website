---
title: "Was Kadupul ist"
description: "Datenerfassung, Speicherung, Architektur und Projektgrenzen für die Planung 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne sprachkundige Prüfung."
---

Kadupul ist eine Anwendung zur Netzwerküberwachung und grafischen Darstellung. Sie erfasst Messwerte über SNMP und Skripte, speichert Zeitreihen in RRD-Dateien und zeichnet Diagramme mit RRDtool. Diese Übersicht wurde am 26. Oktober 2026 anhand der unten verlinkten Anwendungsrevision geprüft.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Projektstatus für 2026–2027

Kadupul ist Vor-Alpha. Es gibt weder eine unterstützte Produktionsversion noch einen validierten Migrationsweg in die Produktion. Nutzen Sie eine isolierte Testinstallation. Datumsangaben in dieser Dokumentation dienen der Planung und sind keine Lieferzusagen. Prüfen Sie den Projektstatus, bevor Sie eine Revision zur Evaluierung auswählen.

[Projektstatus](/de/project/status/)

## Erfassung und Zeitplanung

Ein externer Zeitplaner startet den Poller. Dieser liest eine vorbereitete Erfassungsliste, ruft den PHP-Kollektor oder einen kompatiblen Spine-Build auf und verarbeitet die Ergebnisse. Erfassungsintervalle sind konfigurierbar; fünf Minuten sind ein Beispiel, keine allgemeine Regel. Ein Starter kann mehrere kürzere Erfassungszyklen innerhalb seines Intervalls ausführen. Zeitüberschreitungen, Wiederholungen und Gerätelatenz verbrauchen dieses Zeitbudget.

[Poller-Ablauf](/de/reference/poller-lifecycle/)

## Aufbewahrung und Speicherung

Das Speicherlayout einer RRD-Datei wird bei ihrer Erstellung festgelegt. Neuere Messwerte können mehr Details behalten als ältere zusammengefasste Werte; die Aufbewahrung ist durch die konfigurierten Archive begrenzt. Nicht jede Messung bleibt für immer erhalten. Unbekannte Werte stehen für fehlende oder unbrauchbare Beobachtungen, nicht für null. Datenbankwarteschlangen, Protokolle und Statistiken können wachsen, während bestehende RRD-Dateien ihre feste Größe behalten.

[Datenquellen und Archive](/de/concepts/data-sources-and-rras/)

## Diagramme und gemeinsame Begriffe

Ein Gerät ist ein überwachter Endpunkt. Eine Datenabfrage entdeckt Elemente wie Schnittstellen. Eine Datenquelle beschreibt einen Messwert und seine Speicherung; ein Diagramm beschreibt die Darstellung. Vorlagen verwenden Definitionen wieder, Bäume strukturieren die Navigation. Es sind getrennte Datensätze: Prüfen Sie Löschoptionen und Abhängigkeiten vor dem Entfernen. Diagramme entstehen auf Anfrage aus aufbewahrten Daten; der Bildcache kann eine gerenderte Darstellung wiederverwenden.

[Glossar](/de/reference/glossary/)

## Bestandteile einer Installation

Eine funktionierende Installation verbindet PHP-Webanwendung, MySQL oder MariaDB, RRD-Speicher, RRDtool und einen Erfassungsstarter. Gerätezugangsdaten und Konfiguration liegen in der Datenbank oder geschützten Konfigurationsdateien. Sichern Sie Code, Konfiguration, Datenbankwarteschlangen und RRD-Historie als zusammengehörigen Satz und erproben Sie die Wiederherstellung. Ein Datenbankdump allein stellt historische Diagramme nicht wieder her.

[Sicherung und Wiederherstellung](/de/guides/back-up-and-restore/)

## Main und die Symfony-Migration

Der Anwendungszweig `main` benötigt PHP 8.4 oder neuer und verbindet Symfony-7.4-Dienste mit bisherigen Web-, Poller- und CLI-Einstiegspunkten. Die Wartungslinie `lts/1.2` hat eigene Voraussetzungen. Migrierte und bisherige Routen bestehen nebeneinander; ein Symfony-Dienst belegt nicht die Stilllegung des alten Ablaufs. Quellcode-Checkouts benötigen gesperrte PHP-Abhängigkeiten und erzeugte Browserressourcen. Verwenden Sie die Laufzeiten aus der `mise.toml` der Anwendung.

[Migrationsleitfaden](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Konten, Plugins und Speicherzugriff

Die Sichtbarkeit von Geräten und Diagrammen hängt von Benutzer- und Gruppenrechten ab. Plugins laufen als vertrauenswürdiger Anwendungscode mit den Zugriffsrechten des Prozesskontos, ohne Sandbox. Prüfen Sie Herkunft, Hooks und Installations-/Deinstallationsverhalten vor dem Aktivieren. Lokale Unix-RRD-Schreibprozesse benötigen POSIX-Identitätsprüfungen und ausdrückliche Vertrauenseinstellungen bei getrennten Web- und Poller-Konten. Windows unterstützt keine destruktive lokale RRD-Wartung.

[Plugin-Prüfung](/de/guides/install-and-vet-plugins/)

## Geeignete Einsätze und Grenzen

Evaluieren Sie Kadupul für Netzwerkschnittstellen, Gerätezähler, Umgebungssensoren und andere über prüfbare Erfassungsmethoden zugängliche Messwerte. Es ist selbst gehostete Software und erfordert Datenbank-, Webserver- und Zeitplanerwartung. Die numerische Kernerfassung ist kein Protokollspeicher, verteiltes Tracing-System oder allgemeines Abfragesystem für Labels hoher Kardinalität. Schwellwertalarme benötigen geeignete Plugins; prüfen Sie deren Kompatibilität, statt Alarmierung direkt nach der Installation vorauszusetzen.

## Herkunft, Name und Kompatibilität

Kadupul ist ein unabhängiger Cacti-Fork unter GPL-3.0-or-later, ohne Verbindung zu oder Billigung durch The Cacti Group. Sein singhalesischer Name කඩුපුල් bezeichnet *Epiphyllum oxypetalum*, einen nachts blühenden Kaktus. Plugin-Schnittstellen, Vorlagen, Schemata und vorhandene RRD-Historie zu erhalten ist ein Veröffentlichungsziel, das für jede Quellrevision und Plugin-Kombination belegt werden muss.

[Kompatibilität](/de/project/compatibility-with-cacti/)

## Mit einem geprüften Gerät beginnen

Folgen Sie Installation, erstem Gerät und erstem Diagramm in dieser Reihenfolge. Prüfen Sie Protokolle, Erfassungszeitstempel und brauchbare Werte, bevor Sie dem Bild vertrauen. Messen Sie mit Ihren Geräten Zyklusdauer und wartende Arbeit vor einer Erweiterung. Die Konzepte erklären das Design, die Voraussetzungen nennen die benötigten Komponenten.

[Installation](/de/start/install/) · [Erstes Gerät](/de/start/first-device/) · [Erstes Diagramm](/de/start/first-graph/) · [Konzepte](/de/concepts/architecture/) · [Voraussetzungen](/de/reference/requirements/)
