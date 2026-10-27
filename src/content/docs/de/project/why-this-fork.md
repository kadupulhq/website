---
title: "Warum dieser Fork existiert"
description: "Unabhängige Entwicklungsprioritäten und Migrationskriterien für 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul ist Vor-Alpha. Prüfen Sie Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf ohne sprachkundige Prüfung."
---

Kadupul ist ein unabhängiger Cacti-Fork mit eigenen Entwicklungs-, Veröffentlichungs- und Supportentscheidungen. Diese Prioritäten leiten die Planung 2026–2027; sie sind keine Liefertermine oder Belege für Produktionsreife.

## Entwicklungsprioritäten

Anwendungszweig `main` benötigt PHP 8.4+ und verbindet Symfony-7.4-Dienste mit bisherigen Web-, Poller- und CLI-Pfaden. Die Wartungslinie `lts/1.2` hat eigene Voraussetzungen. Die Migration soll Anwendungsfallgrenzen, Autorisierung, Fehlerbehandlung und Verifikation ausdrücklich festlegen und erforderliche Erfassungs- und Diagrammverträge erhalten. Ein moderner Dienst oder eine erfolgreiche Testsuite belegt nicht die Migration eines vollständigen Ablaufs. Siehe Architektur.

## Kompatibilität und Migration

Plugins, Vorlagen, Schemata und RRD-Historie zu erhalten ist ein Veröffentlichungsziel mit versionsspezifischem Nachweisbedarf. Jede Migration muss den aktiven Schreibpfad benennen, anwendbare Wartungskorrekturen erhalten und wartende oder laufende Arbeit berücksichtigen. Erproben Sie Installation, Wiederherstellung und Schemaänderungen auf einer isolierten Kopie mit zusammengehörigen Sicherungen. Ein validierter Produktionsmigrationsweg existiert derzeit nicht. Siehe Kompatibilität und Projektstatus.

Diese Prioritäten beschreiben Kadupul, keine Pläne eines anderen Projekts oder Vereinbarung mit dessen Verantwortlichen. Kadupul ist weder mit The Cacti Group verbunden noch von ihr gebilligt.

[Architektur](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Kompatibilität](/de/project/compatibility-with-cacti/) · [Projektstatus](/de/project/status/)

Anwendungsstand am 26. Oktober 2026 geprüft: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
