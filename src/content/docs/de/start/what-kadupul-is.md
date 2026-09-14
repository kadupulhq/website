---
title: "Was ist Kadupul?"
description: "Geräte mit SNMP und Skripten abfragen, Messwerte in RRD-Dateien speichern und als Diagramme darstellen."
banner:
  content: "Kadupul befindet sich in der Pre-Alpha-Phase. Der Quellcode ist verfügbar, aber es gibt keine unterstützte Veröffentlichung und keinen validierten Migrationsweg für den Produktivbetrieb. Nicht produktiv einsetzen."
---

Kadupul ist ein unabhängiger Fork von Cacti. Es fragt Geräte regelmäßig ab und verwendet RRDtool zum Speichern und Darstellen der Messwerte.

Diese Seite ist eine kurze Einführung. Weitere Einzelheiten stehen auf der vollständigen englischen Seite. [English](/start/what-kadupul-is/)

## Was ist Kadupul?

- Eine PHP-Anwendung stellt die Oberfläche und das Installationsprogramm bereit.
- MySQL oder MariaDB speichert Konfiguration, Benutzer und den Poller-Cache.
- RRD-Dateien speichern Messwerte gemäß den eingestellten Aufbewahrungs- und Konsolidierungsregeln. Sie bewahren nicht alle Daten unbegrenzt auf.
- Ein Zeitplaner startet den Poller. Erfassungsskripte laufen mit den Rechten seines Systembenutzers.

## Erste Schritte

Beginnen Sie mit einer isolierten Testinstallation, fügen Sie ein Gerät hinzu und prüfen Sie den Dateneingang, bevor Sie Diagramme auswerten. Erstellen Sie Sicherungen und testen Sie die Wiederherstellung.

- [Installation](/de/start/install/)
- [Das erste Gerät hinzufügen](/de/start/first-device/)
- [Das erste Diagramm lesen](/de/start/first-graph/)
