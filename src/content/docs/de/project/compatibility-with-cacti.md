---
title: "Kompatibilität mit Cacti"
description: "Kompatibilitätsumfang, Verifikationsnachweise und Grenzen für die Planung 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul ist Vor-Alpha. Prüfen Sie Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf ohne sprachkundige Prüfung."
---

Kompatibilität ist ein Veröffentlichungsziel und keine Aussage, dass jede Cacti-Version, jedes Plugin oder jede Vorlage unverändert funktioniert. Kadupul bleibt Vor-Alpha. Prüfen Sie die genaue Quellrevision und verwendeten Komponenten, bevor Sie sich auf das Verhalten verlassen.

## Was das umfasst

Prüfen Sie Plugin-Hooks, Argument-/Rückgabeverhalten und Berechtigungen; Vorlagenidentitäten, Eingabezuordnungen und Weitergabe; Schema-, Standardwert- und Referenzsemantik sowie bestehende RRD-Pfade, Felder, Archive und gespeicherte Werte. Ein passendes Datenbankprofil beweist nicht denselben Aufbau der RRD-Datei. Plugins laufen als vertrauenswürdiger Anwendungscode, nicht in einer Sandbox. Siehe Vorlagen und Plugin-Prüfung.

## Was das praktisch bedeutet

Erfassen Sie Anwendungszweig und Revision, PHP und gesperrte Abhängigkeiten, Plugin-Versionen, Schemazustand und Speicherkonfiguration. Prüfen Sie Erfassung, Diagrammrendering, Autorisierung, Fehler und Wiederherstellung auf einer isolierten wiederhergestellten Kopie. Berücksichtigen Sie gegebenenfalls entfernte Kollektoren und Hintergrundarbeit. Dokumentieren Sie beabsichtigte Unterschiede und offene Lücken; Tests decken nur ausgeführte Pfade ab. Siehe Upgrade-Probe und Sicherung.

## Was es nicht garantiert

Es gibt keine pauschale Binär-, Schema- oder Plugin-Kompatibilitätsgarantie, keine unterstützte Produktionsversion und keinen validierten Produktionsmigrationsweg. Ein reines Code-Rollback macht Schema- oder RRD-Änderungen nicht rückgängig; die Wiederherstellung kann den zusammengehörigen Sicherungssatz benötigen. Verwenden Sie die gepflegten Projektquellen und dokumentieren Sie deren Herkunft, statt Archive eines anderen Projekts als geprüftes Kadupul-Paket anzusehen. Kadupul ist weder mit The Cacti Group verbunden noch von ihr gebilligt. Siehe Projektstatus.

[Vorlagen](/de/concepts/templates/) · [Plugin-Prüfung](/de/guides/install-and-vet-plugins/) · [Upgrade-Probe](/de/guides/upgrade-safely/) · [Sicherung](/de/guides/back-up-and-restore/) · [Projektstatus](/de/project/status/)

Anwendungsstand am 26. Oktober 2026 geprüft: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
