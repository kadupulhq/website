---
title: Mitwirken
description: Was das Projekt benötigt, nach welchen technischen Standards eine Änderung geschrieben wird und nach welchem Maßstab sie beurteilt wird.
banner:
  content: Kadupul befindet sich in der Pre-Alpha-Phase. Der Quellcode ist verfügbar, aber es gibt keine unterstützte Veröffentlichung und keinen validierten Migrationsweg für den Produktivbetrieb. Nicht produktiv einsetzen.
sidebar:
  order: 6
---

Der Quellcode ist verfügbar und das Repository dokumentiert einen Beitragsprozess. Lesen Sie vor Beginn die [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md). Diskutieren Sie wesentliche Änderungen zuerst im Issue-Tracker.

## Der Standard

Halten Sie jeden Pull-Request auf einen einzigen Zweck fokussiert. Reproduzieren Sie einen Fehler, bevor Sie ihn beheben, verifizieren Sie das geänderte Verhalten und fügen Sie die Validierungsbefehle sowie Ergebnisse bei. Bewahren Sie öffentliche Schnittstellen, es sei denn, die Änderung umfasst eine dokumentierte Migration.

## Technische Standards

Befolgen Sie die Regeln für den Zweig, den Sie ändern. Prüfen Sie den aktuellen Leitfaden für Mitwirkende und die CI-Konfiguration, anstatt davon auszugehen, dass beide Zweige dieselben Regeln verwenden.

### Stil

Auf `main` folgen bearbeitete PHP-Dateien dem Standard PHP-FIG PER-CS 2.0. Formatieren Sie jede betroffene Datei in einem separaten Whitespace-Commit um und prüfen Sie sie mit `tests/tools/check_php_style.sh`. Der Zweig `lts/1.2` behält die vorgelagerte Formatierung bei.

### Statische Analyse

Führen Sie die für den Zielzweig erforderlichen Prüfungen aus. Diese Website schreibt kein PHPStan-Level, keine Protokollierungsschnittstelle und keine Autoloading-Migration vor, die das Repository nicht übernommen hat.

### Tests

Verifizieren Sie das durch den Patch geänderte Verhalten. Fügen Sie einen Regressionsfall für eine Fehlerbehebung hinzu und zeigen Sie die verwendeten Befehle. Das Bestehen nicht zusammenhängender Tests validiert den Fix nicht.

### Abhängigkeiten

Erklären Sie, warum eine Abhängigkeit benötigt wird, prüfen Sie deren Lizenz und aktualisieren Sie das entsprechende Manifest sowie das Lockfile. Befolgen Sie die Abhängigkeits- und Validierungsregeln des Repositories.

### Commits und Pull-Requests

Verwenden Sie Conventional Commits und zeichnen Sie jeden Commit mit `git commit -s` gemäß dem [Developer Certificate of Origin](https://developercertificate.org/) ab. Trennen Sie Formatierungen von Verhaltensänderungen, damit beide unabhängig voneinander überprüft werden können.

## Der übernommene Verzeichnisbaum erfüllt diese Standards nicht

Der Verzeichnisbaum enthält übernommene Formatierungs- und Implementierungsmuster. Die Umstellung wird durch die Regeln des Zielzweigs gesteuert, nicht durch eine pauschale Neufassung des gesamten Projekts.

### Welche Regel gewinnt also?

Befolgen Sie die `CONTRIBUTING.md` des Zielzweigs. Auf `main` gilt die PER-CS-Regel für bearbeitete Dateien; auf `lts/1.2` behalten Sie den übernommenen Stil bei.

## Dokumentation

Überprüfen Sie Behauptungen anhand der Implementierung und verwenden Sie Material, dessen Lizenz die Aufnahme gestattet. Kopieren Sie keine Prosa von Drittanbietern, ohne deren Lizenz zu prüfen. Melden Sie Sicherheitsbefunde über den [vertraulichen Meldeprozess](/de/project/security/).

## Kompatibilität

Plugin-Schnittstellen, Vorlagen, Datenbankkompatibilität und RRD-Daten sind Veröffentlichungsziele. Dokumentieren Sie jede Schnittstellenänderung und stellen Sie Nachweise zur Migration und Kompatibilität bereit. Siehe [Kompatibilität mit Cacti](/de/project/compatibility-with-cacti/).
