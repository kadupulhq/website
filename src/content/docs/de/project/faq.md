---
title: Fragen
description: Kurze Antworten auf die ersten Fragen von Neueinsteigern und bestehenden Cacti-Benutzern, mit einem Link zur Seite, die jede Frage ausführlich beantwortet.
banner:
  content: Kadupul befindet sich in der Pre-Alpha-Phase. Der Quellcode ist verfügbar, aber es gibt keine unterstützte Veröffentlichung und keinen validierten Migrationsweg für den Produktivbetrieb. Nicht produktiv einsetzen.
sidebar:
  order: 7
---

Kurze Antworten. Jede verlinkt auf die Seite, die das Thema ausführlich behandelt.

## Das Projekt

### Kann ich es heute installieren?

Der Quellcode ist für die Entwicklung und isolierte Tests verfügbar. Es gibt keine unterstützte Veröffentlichung und keinen validierten Installationspfad für den Produktivbetrieb.

Die Installations- und Anleitungserklärungen erfordern eine Validierung anhand des Codes, den Sie verwenden. Siehe [Status](/de/project/status/).

### Ist es bereit für den Produktivbetrieb?

Nein. Das Repository beschreibt Kadupul als Pre-Alpha und nicht produktionsreif. Der Veröffentlichungsstatus gibt keine Auskunft darüber, ob jemand Entwicklungscode im Einsatz hat.

### Ist dies ein Ersatz für Cacti?

Kadupul ist ein unabhängiger Fork mit eigenen Entwicklungsprioritäten und Supportkanälen. Es befindet sich in der Pre-Alpha-Phase; eine Migration erfordert eine Validierung für die jeweils verwendeten Versionen und Erweiterungen. Siehe [Umstieg von Cacti](/de/guides/coming-from-cacti/).

### Warum ein separates Projekt?

Kadupul bietet Raum, Subsysteme zu ersetzen, die Mindestanforderungen an die Sprache anzuheben und interne Schnittstellen unter einer eigenen Veröffentlichungspolitik zu ändern. Siehe [Warum dieser Fork existiert](/de/project/why-this-fork/).

### Von welcher Cacti-Version stammt der Fork ab?

Die Anwendung leitet sich von Cacti 1.2.31 ab. Das Repository pflegt die Zweige `main` und `lts/1.2` mit unterschiedlichen Veröffentlichungszielen. Siehe [Status](/de/project/status/).

### Wer pflegt es?

Das Kadupul-Projekt pflegt das Repository. Verwenden Sie den Issue-Tracker und den [Beitragsprozess](/de/project/contributing/) für Projektarbeiten.

### Gibt es eine Roadmap? Einen Release-Rhythmus? Eine Support-Richtlinie?

Das Repository hat Release-Ziele, eine Versionierungsrichtlinie und einen Beitragsprozess. Es gibt noch keine unterstützte Produktionsveröffentlichung. Siehe [Status](/de/project/status/) für die Unterscheidung zwischen geplanten Versionen und veröffentlichten Artefakten.

### Ist es mit The Cacti Group verbunden?

Nein. Kadupul ist weder mit The Cacti Group verbunden noch wird es von dieser unterstützt. Es beschreibt sich selbst als Fork von Cacti, da dies eine sachliche Aussage über den Ursprung des Codes ist. Cacti ist deren Projekt und deren Name.

### Was bedeutet der Name?

Kadupul ist der singhalesische Name für einen nachts blühenden Kaktus. Cacti hat seinen Namen von der Pflanzenfamilie; Kadupul ist eine einzelne Art darin. Der Name verweist auf die Herkunft des Projekts, ohne zu beanspruchen, das Ganze zu repräsentieren. Die längere Fassung finden Sie unter [Was Kadupul ist](/de/start/what-kadupul-is/).

## Umstieg von Cacti

### Werden meine Plugins funktionieren?

Das ist die Absicht. Die Plugin-API ist eines von vier Kompatibilitätszielen. Das Laden und Ausführen eines Cacti-Plugins ohne Änderungen muss für die verwendeten Versionen nachgewiesen werden.

Kompatibilität ist ein Ziel, kein pauschaler Beweis für jedes Plugin. Prüfen Sie die Plugins und Versionen, von denen Sie tatsächlich abhängen, bevor Sie eine Migration planen. Siehe [Kompatibilität mit Cacti](/de/project/compatibility-with-cacti/) und [Umstieg von Cacti](/de/guides/coming-from-cacti/).

### Werden meine RRD-Dateien funktionieren?

Die Erhaltung des RRD-Verlaufs ist ein Kompatibilitätsziel. Die Dateien enthalten historische Daten, die Sie nicht neu erzeugen können. Validieren Sie das Einlesen vorhandener Dateien anhand einer Kopie vor jeder Migration.

Jede Migration, die verlangt, diese zu verwerfen und neu anzulegen, verlangt etwas, das Sie ablehnen sollten. Siehe [Umstieg von Cacti](/de/guides/coming-from-cacti/).

### Werden meine Vorlagen und meine Datenbank übernommen?

Vorlagen sollen unverändert importiert werden können. Das Schema soll wiedererkennbar bleiben und ohne Export in ein Zwischenformat migriert werden können. Dies sind Ziele, die wie bei Plugins und RRD-Dateien eine Validierung erfordern.

### Wie erfahre ich, wo sich Kadupul und Cacti unterscheiden?

Indem es aufgeschrieben wird. Das Fehlermuster, das das Projekt vermeiden möchte, ist nicht das Auseinanderdriften an sich, das der Zweck eines Forks ist. Es ist ein Auseinanderdriften, das niemand dokumentiert hat, wodurch jedes Upgrade zu einer Untersuchung wird.

### Funktioniert es mit Spine?

Kadupul wird neben dem PHP-Kollektor einen Spine-Fork pflegen. Dessen Repository-Standort und validierte Builds sind hier noch nicht dokumentiert. Spine wird separat gebaut und installiert. Die übernommene Integration umfasst die Einstellungen für `poller_type` und Pfade, die Befehlszeile des übergeordneten Pollers, die Einstellungen, die Spine liest, und die Tabellen, in die es schreibt.

Validieren Sie Ihre Kadupul- und Spine-Versionen vor einer Umstellung gemeinsam. Melden Sie Probleme im [Kadupul-Issue-Tracker](https://github.com/kadupulhq/kadupul/issues). Siehe [Spine, der C-Kollektor](/de/reference/spine/) für Konfigurations- und Build-Hinweise.

### Funktioniert es mit dem RRDtool-Proxy?

Kadupul verwendet den Proxy-Daemon der Cacti-Organisation nicht. Verwenden Sie lokalen RRDtool-Speicher. Die [RRDtool-Proxy-Referenz](/de/reference/rrdproxy/) dokumentiert das übernommene Client-Protokoll; sie stellt keine unterstützte Bereitstellungsoption dar. Ein Kadupul-eigener Ersatz muss etabliert und validiert werden, bevor ein Proxy-Einsatz dokumentiert wird.

### Was wird für den Betrieb benötigt?

Ein Webserver mit PHP, MySQL oder MariaDB, RRDtool und eine Möglichkeit, den Poller nach einem Zeitplan auszuführen. Die Versionen und Erweiterungen finden Sie unter [Anforderungen](/de/reference/requirements/).

## Lizenzierung

### Unter welcher Lizenz steht die Software?

GPL-3.0-or-later.

### Cacti nennt GPL-2. Wie kann ein Fork unter GPL-3 stehen?

Die übernommene Anwendungslizenz erlaubt die GPL Version 2 oder neuer. Kadupul nutzt die Option der späteren Version für seinen Vertrieb. Abhängigkeiten behalten ihre eigenen Lizenzbedingungen. Siehe [Lizenz](/de/project/license/).

### Unter welcher Lizenz steht diese Dokumentation?

CC BY-SA 4.0. Der Code der Website verbleibt unter der GPL-3.0-or-later zusammen mit dem Rest des Projekts. Verwenden Sie den Text wieder, wenn Sie das Projekt nennen und das, was Sie erstellen, auf die gleiche Weise lizenzieren.

### Woher stammen diese Seiten?

Diese Seiten beschreiben das Verhalten anhand des Anwendungsquellcodes. Texte von Drittanbietern erfordern vor der Wiederverwendung eine eigene Lizenzprüfung.

Diese Einschränkung gilt auch für Beiträge. Dokumentationsänderungen leiten ihre Aussagen aus dem Code ab. Siehe [Mitwirken](/de/project/contributing/).

## Teilnehmen

### Wie melde ich eine Sicherheitslücke?

Vertraulich über GitHub Security Advisories im betroffenen Repository. Nicht als öffentliches Issue.

Unveröffentlichter Code kann bereitgestellt worden sein und Schwachstellen enthalten. Melden Sie diese unabhängig vom Veröffentlichungsstatus vertraulich. Siehe [Sicherheitsrichtlinie](/de/project/security/).

### Eine Sicherheitslücke, die ich hier finde, betrifft wahrscheinlich auch Cacti. Was passiert dann?

Melden Sie diese vertraulich an Kadupul und geben Sie an, was Sie über den gemeinsamen Code wissen. Die Kadupul-Maintainer übernehmen die Einstufung und Behebung für Kadupul gemäß der [Sicherheitsrichtlinie des Repositories](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Wie trage ich bei?

Lesen Sie [Mitwirken](/de/project/contributing/) und den Leitfaden für Mitwirkende auf Ihrem Zielzweig. Besprechen Sie wesentliche Änderungen, bevor Sie sie umsetzen.

### Ich habe einen Fehler auf dieser Website gefunden.

Gut. Jede Seite hier wurde anhand des Quellcodes verfasst, und jeder Fehler ist aus eigenem Grund falsch. Jede Seite enthält einen Bearbeitungslink.
