---
title: "Vorlagen verwenden und prüfen"
description: "Identitäten wählen, Importe vorab prüfen und Weitergabe ohne Verlust der RRD-Historie kontrollieren."
banner:
  content: "Kadupul ist Vor-Alpha. Prüfen Sie die Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf ohne sprachkundige Prüfung."
---

## Passende Definitionen wählen

Gerätevorlagen bieten Diagrammvorlagen und Datenabfragen; Datenvorlagen definieren Messeingaben und Speicherung. Duplizieren Sie eine ähnliche Vorlage für eine eigene Identität und prüfen Sie gemeinsam genutzte Abhängigkeiten. Ein Duplikat macht nicht jede referenzierte Eingabe oder jedes Profil unabhängig. Bewahren Sie vor Änderungen verwendeter Definitionen einen Export und eine zusammengehörige Datenbank-/RRD-Sicherung auf. Siehe Vorlagenkonzepte.

## Vorschau prüfen und bewusst anwenden

Prüfen Sie in einer isolierten Installation XML-Herkunft, Zielidentitäten und Speicherprofil. Starten Sie die Vorschau für einfaches Vorlagen-XML im Anwendungsverzeichnis:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

Aktuelles `main` meldet unlesbare Eingaben, fehlerhaftes XML und erfasste Objektfehler mit einem Status ungleich null. Prüfen Sie auch Diagnosen und Objektergebnisse; ein Import kann vorhandene Identitäten ändern. Paketimporte verwenden einen separaten Dateischreibpfad. Siehe Import und Export.

## Abgeleitete Objekte und Historie prüfen

Prüfen Sie danach repräsentative Geräte, lokale Zuordnungen der Diagrammelemente, Überschreibungen und erfasste Werte. Geänderte Gerätevorlagenzuordnungen benötigen einen eigenen Synchronisierungsvorgang. Das Speichern einer Datenvorlage ändert bestehende RRD-Strukturen nicht; prüfen Sie die tatsächliche Datei vor Änderungen an Schritt, Heartbeat oder Aufbewahrung. Stoppen Sie Schreibprozesse vor koordinierter Wiederherstellung und stellen Sie bei Bedarf den zusammengehörigen Sicherungssatz wieder her. Siehe eigene Vorlagen und Aufbewahrung.

[Vorlagenkonzepte](/de/concepts/templates/) · [Import und Export](/de/guides/import-and-export-templates/) · [Eigene Vorlagen](/de/guides/create-custom-templates/) · [Aufbewahrung](/de/guides/manage-data-retention/)

Anwendungsstand am 26. Oktober 2026 geprüft: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
