---
title: Datenaufbewahrung verwalten
description: Aufbewahrung und Auflösung wählen, Speicherbedarf schätzen und Änderungen an bestehenden RRD-Dateien planen.
banner:
  content: Kadupul ist Pre-Alpha. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 24
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor
Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Die Aufbewahrung wird bei der Dateierstellung konfiguriert und bleibt bei normalen Aktualisierungen unverändert. Eine spätere
Bearbeitung des Profils ändert nur das Aussehen der nächsten Datei und lässt jede bestehende
Datei exakt so, wie sie war. Klären Sie dies, bevor Sie zehntausend Datenquellen
erstellen, da spätere Änderungen explizite Dateipflege oder Migration erfordern.

Lesen Sie zuerst [Datenquellen und Archive](/de/concepts/data-sources-and-rras/), falls Ihnen
die Begriffe Schritt (Step), Heartbeat, Archiv und Konsolidierung noch nicht vertraut sind.

## Was ein Profil enthält

Ein Datenquellenprofil ist die Aufbewahrungsrichtlinie. Ein Profil, eine Speicherform.

| Feld | Bedeutung |
|---|---|
| Abfrageintervall (Step) | Wie oft ein Wert erwartet wird, in Sekunden |
| Heartbeat | Maximal zulässiges Intervall zwischen Aktualisierungen, bevor die Eingabe als unbekannt behandelt wird |
| X-Files-Faktor | Wie viel eines Konsolidierungsfensters unbekannt sein darf, bevor der konsolidierte Wert unbekannt ist |
| Konsolidierungsfunktionen | Welche von `AVERAGE`, `MIN`, `MAX`, `LAST` beibehalten werden |
| Archive | Eine Zeile pro Auflösung, jeweils mit einer Aggregationsstufe und einer Zeilenanzahl |
| Standard | Ob neue Datenquellen dieses Profil wählen |

Der Schritt (Step) entspricht standardmäßig dem Poller-Intervall. Ein Profil, dessen Schritt feiner ist als das
Abfrageintervall, kann keine Details wiederherstellen, die nie abgetastet wurden. Ob seine Zeilen
unbekannt sind, hängt von Heartbeat und RRDtool-Normalisierung ab.

## Was mitgeliefert wird

Drei Profile werden standardmäßig bereitgestellt. Alle drei behalten alle vier Konsolidierungsfunktionen
bei.

| Profil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Das 5-Minuten-Profil ist der Standard.

Jedes verfügt über vier Archive. Die Aggregationsstufe wird als Schrittmultiplikator ausgedrückt,
sodass die reale Auflösung der Multiplikator mal dem Profilschritt ist, und die Zeitspanne ist
diese Auflösung mal der Zeilenanzahl.

### 5 Minute Collection

| Archiv | Multiplikator | Zeilen | Auflösung | Zeitspanne |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 Minuten | ca. 2 Tage |
| Weekly | 6 | 700 | 30 Minuten | ca. 14 Tage |
| Monthly | 24 | 775 | 2 Stunden | ca. 64 Tage |
| Yearly | 288 | 797 | 1 Tag | ca. 2 Jahre 2 Monate |

### 1 Minute Collection

| Archiv | Multiplikator | Zeilen | Auflösung | Zeitspanne |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 Minute | ca. 2 Tage |
| Weekly | 15 | 1440 | 15 Minuten | 15 Tage |
| Monthly | 60 | 8784 | 1 Stunde | ca. 366 Tage |
| Yearly | 720 | 7305 | 12 Stunden | ca. 10 Jahre |

### 30 Second Collection

| Archiv | Multiplikator | Zeilen | Auflösung | Zeitspanne |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 Sekunden | ca. 1 Tag |
| Weekly | 30 | 1346 | 15 Minuten | ca. 14 Tage |
| Monthly | 120 | 1445 | 1 Stunde | ca. 60 Tage |
| Yearly | 480 | 4380 | 4 Stunden | 2 Jahre |

Die Namen sind Bezeichnungen, kein Verhalten. Nichts erzwingt, dass das Archiv namens
"Yearly" tatsächlich ein Jahr speichert.

## Wie das Profil zu einer Datei wird

Bei der Erstellung werden die Archive und Konsolidierungsfunktionen des Profils gelesen und
in einen create-Befehl umgewandelt. Der Schritt stammt aus dem gespeicherten `rrd_step`
der Datenquelle, der normalerweise aus ihrem Profil gefüllt wird. Jedes enthaltene Datenquellenelement steuert eine Definitionszeile
bei, die Namen, Typ, Heartbeat, Minimum und Maximum enthält. Jedes Archiv
steuert eine Zeile pro Konsolidierungsfunktion bei, die Funktion, X-Files-Faktor, Multiplikator und Zeilenanzahl enthält.

Vier Archive mal vier Konsolidierungsfunktionen ergeben sechzehn Archivdefinitionen
in der Datei. Diese Multiplikation verbraucht den Festplattenspeicher.

Wenn die Datei bereits existiert, stoppt der normale Erstellungspfad, ohne sie neu zu schreiben.
Profilbearbeitungen migrieren Dateien nicht automatisch. Explizite Wartungswerkzeuge sind
eine separate Operation, die weiter unten beschrieben wird.

## Eine Richtlinie auswählen

Drei Fragen, in dieser Reihenfolge.

**Was ist die feinste Frage, die Sie jemals stellen werden?** Das legt den Schritt fest. Ein
30-Sekunden-Schritt beantwortet "was geschah während dieser 90-Sekunden-Spitze". Ein 5-Minuten-Schritt
kann das niemals beantworten, für keine darunter erstellte Datei. Feinere Schritte kosten Poller-Arbeit in
jedem Zyklus sowie Speicherplatz.

**Wie weit zurück werden Sie fragen?** Das legt die Zeilenanzahl des täglichen Archivs fest. Die meisten
Installationen benötigen ein paar Tage mit voller Auflösung und begnügen sich danach
mit gröberen Daten.

**Welche Fragen überstehen die Konsolidierung?** Das legt die Konsolidierungsfunktionen
fest. `AVERAGE` beantwortet, was typisch war. `MAX` beantwortet, wie schlimm es wurde.
`MIN` beantwortet, ob jemals ein Ausfall auftrat. `LAST` beantwortet, was der Endwert im
Fenster war, was für Werte wichtig ist, die Zustände statt Raten darstellen.

Das Weglassen einer von vier Konsolidierungsfunktionen reduziert die Nutzlast gespeicherter Werte
neuer Dateien um ein Viertel bei jeder Auflösung. Es ist auch das
Bedauern, über das Administratoren später schreiben. Behalten Sie `MAX` bei, es sei denn, Sie sind sicher, dass niemand
jemals nach einem Spitzenwert fragen wird.

## Die Festplatte dimensionieren

Die Größe einer Datei ergibt sich aus den gewählten Zahlen. Aus der in
der Benutzeroberfläche verwendeten Größenberechnung:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Die Schnittstelle verwendet 284 und 300 Bytes als feste Overhead-Schätzungen. Betrachten Sie dies
als Dimensionierungsnäherung, nicht als exakte Beschreibung jedes RRDtool-Dateiformats.
Jeder gespeicherte Wert belegt 8 Bytes, und die Gesamtzahl der Zeilen ist die Summe der Zeilenanzahlen über
die Archivdefinitionen des Profils vor der Multiplikation mit den Konsolidierungsfunktionen.
Messen Sie repräsentative Dateien mit dem installierten RRDtool, bevor Sie den Speicher dimensionieren.

Für eine Datei mit einer einzelnen Datenquelle und allen vier Konsolidierungsfunktionen:

| Profil | Gesamtzahl Zeilen | Ungefähre Dateigröße |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multiplizieren Sie mit der Anzahl der erwarteten Datenquellen, nicht mit der Anzahl der Graphen. Ein
Graph kann Felder aus einer oder mehreren Dateien kombinieren. Zählen Sie die tatsächlichen RRD-Dateien
und die darin enthaltenen Datenquellenelemente.

Zwanzigtausend Datenquellen auf dem Standardprofil entsprechen etwa 1,8 GB. Dieselben
zwanzigtausend auf dem 1-Minuten-Profil entsprechen etwa 13 GB. Dieses Verhältnis spiegelt
sowohl die Auflösung als auch die unterschiedlichen Aufbewahrungsspannen der Profile wider, nicht den Schritt allein.
Eine feinere Erfassung erhöht auch die Schreibhäufigkeit. Siehe [Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/), bevor Sie
einen feinen Schritt in großem Maßstab wählen.

Sowohl der Profil- als auch der Archiv-Editor zeigen eine berechnete Größe an, während Sie die Zahlen ändern.
Nutzen Sie diese. Bei der Arithmetik kann man sich leicht um den Faktor vier vertun.

## Was das Ändern eines Profils bewirkt und was nicht

Das ist der Teil, der Administratoren historische Daten kostet.

| Änderung | Auswirkung auf neue Dateien | Auswirkung auf bestehende Dateien |
|---|---|---|
| Ein Archiv hinzufügen oder entfernen | Angewendet | Keine |
| Eine Zeilenanzahl ändern | Angewendet | Keine |
| Eine Aggregationsstufe ändern | Angewendet | Keine |
| Eine Konsolidierungsfunktion hinzufügen oder entfernen | Angewendet | Keine |
| Den Schritt ändern | Neue Datenquellen erben ihn; Erstellung nutzt ihren gespeicherten Schritt | Keine automatische Dateimigration |
| Den Heartbeat ändern | Erstellung nutzt gespeicherte Datenquellenelement-Metadaten; siehe unten | Kein automatisches Dateituning |
| Das Profil löschen | Verweigert, solange eine Vorlage oder Datenquelle darauf verweist, und für das Standardprofil | Keine |

**Das Ändern des Heartbeats eines verwendeten Profils aktualisiert nur die Metadaten.** Das Speichern eines neuen
Heartbeats hinterlegt diesen im Profil und in den Datenquellenelementen von Vorlagen und
lokalen Datenquellen, die das Profil verwenden; andere Vorlagen werden nicht geändert.

Das Speichern passt bestehende RRD-Dateien nicht an. Sichern Sie Metadaten ebenso wie Dateien,
und vergleichen Sie das Profil, die Vorlagenelemente, lokale Datenquellenelemente und die tatsächliche
`rrdtool info`-Ausgabe nach der Heartbeat-Wartung.

Das Dienstprogramm `cli/update_heartbeat.php` des Hauptkollektors kann bestehende Dateien anpassen
und Metadaten aktualisieren. Beginnen Sie mit `--help`, `--list-heartbeats`,
`--list-data-templates` und `--list-profiles`. Der neue Heartbeat muss unterstützt werden
und mindestens das Doppelte des konfigurierten Poller-Intervalls betragen. Verwenden Sie `--data-template-id`,
um die Auswahl einzugrenzen; das Dienstprogramm bietet keine Dry-Run-Option.

Ohne `--force` müssen die ausgewählten Profile bereits den angeforderten
Heartbeat besitzen. Mit `--force` ändern sich auch gemeinsam genutzte Profilwerte, inventarisieren Sie daher
alle deren Benutzer, bevor Sie fortfahren. `--prev-heartbeat` filtert Datenbankwerte, nicht
den aus jeder RRD gelesenen Heartbeat: Nach einem teilweisen Speichern im Web kann die Auswahl des alten
Dateiwerts zu keinen Treffern führen. Überprüfen Sie die Auswahl und inspizieren Sie die resultierenden
Dateien. Der isolierte Test passte seine bestehende Datei erfolgreich von 600 auf 900 an,
nachdem ihre Profil-Metadaten angeglichen wurden.

Zwei weitere Fallstricke liegen direkt daneben.

**Der Editor schränkt strukturelle Änderungen ein, sobald ein Profil in Verwendung ist.** Sobald
eine reale Datenquelle mit einem Profil existiert, werden Schritt, X-Files-Faktor, Konsolidierungsfunktionen,
Archiv-Zeilenanzahlen und Aggregationsstufen im Editor schreibgeschützt;
Bedienelemente zum Hinzufügen/Löschen von Archiven werden ebenfalls ausgeblendet. Duplizieren Sie das Profil und
bearbeiten Sie die Kopie. Diese Schnittstellenbeschränkungen stellen keine serverseitige
Validierung übermittelter Anfragen dar.

**Verweise neu zuweisen, bevor ein Profil gelöscht wird.** Die Liste deaktiviert die Auswahl,
wenn eine Vorlage oder lokale Datenquelle ein Profil verwendet, und der Server weigert sich,
ein Profil zu löschen, auf das noch verwiesen wird.

## Datenquellen zwischen Profilen verschieben

Es gibt eine Massenaktion für Datenvorlagen zum Ändern des Profils. Sie schreibt das
im Template erfasste Profil, den Schritt und den Heartbeat neu und beschränkt
sich bewusst auf Vorlagenzeilen. Datenquellen, die bereits existieren, sind nicht enthalten.

Die Sequenz für eine echte Migration lautet daher:

1. Das neue Profil erstellen und dessen berechnete Größe prüfen.
2. Die Datenvorlage darauf ausrichten.
3. Akzeptieren, dass alles ab jetzt Erstellte die neue Struktur verwendet.
4. Separat entscheiden, was mit den bereits vorhandenen Dateien geschehen soll.

Schritt vier bietet mehrere Optionen, abhängig von der Änderung und der installierten RRDtool-Version.

**Unverändert lassen.** Unterschiedliche Aufbewahrungsstrukturen können nebeneinander existieren. Halten Sie die
Abfrage-Metadaten jeder bestehenden Datenquelle konsistent mit ihrer Datei; das bloße Ändern einer
Datenbank-Profilreferenz migriert weder deren Schritt noch Felder oder Archive.

**Neu aufbauen.** Die Datenquelle löschen und neu erstellen. Schnell, und die Historie ist verloren.

**Zusammenfügen (Splice).** Das Befehlszeilen-Hilfsprogramm Splice führt eine alte Datei in eine neue zusammen und
kann dabei die Auflösung ändern, vorausgesetzt, die neue Datei besitzt bereits den
korrekten Schritt. Es verfügt über einen Dry-Run-Modus. Verwenden Sie diesen auf einer Kopie, bevor Sie ihn auf
wichtige Daten anwenden.

**RRDtool-Wartung.** Abhängig von der installierten Version und der gewünschten Änderung können
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) oder
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) eine
bestehende Datei anpassen, während beizubehaltende Daten erhalten bleiben. Stoppen Sie konkurrierende Schreibprozesse, bewahren Sie
ein Backup auf und verifizieren Sie das Ergebnis an einer Kopie. Diese Operationen stellen keine Details
wieder her, die bereits durch Konsolidierung verworfen wurden.

## Externe Profile

Eine Datenquelle kann auf ein externes Profil gesetzt werden, das einen Schritt von Null erfasst.
Dies besagt, dass die Datei außerhalb des normalen Pfads verwaltet wird, und die Datenquellenliste
zeigt sie als extern an, anstatt ein Intervall anzugeben. Nutzen Sie dies für Dateien, die ein anderer
Prozess schreibt. Verwenden Sie es nicht im Sinne von "keine Richtlinie", da die Aufbewahrung weiterhin
der entspricht, mit der die Datei erstellt wurde; sie wird nur nirgendwo beschrieben, wo Sie es sehen können.

## Fehlerbilder

| Symptom | Häufige Ursache |
|---|---|
| Eine Profilbearbeitung scheint wirkungslos zu sein | Erwartetes Verhalten. Bestehende Dateien behalten die Struktur, mit der sie erstellt wurden |
| Zeilenanzahl und Aggregationsstufe können nicht bearbeitet werden | Das Profil wird von mindestens einer Datenquelle verwendet. Duplizieren Sie es |
| Die Oberfläche zeigt einen Heartbeat, die Datei verhält sich nach einem anderen | Der Profil-Heartbeat wurde geändert und die Dateien wurden nie angepasst |
| Neue Datenquellen schlagen bei der Erstellung fehl, Protokoll meldet keine Archive zugewiesen | Das Profil wurde gelöscht, während Datenquellen noch darauf verwiesen |
| Das feinste Archiv ist voller unbekannter Werte | Fehlende Aktualisierungen, Heartbeat und Konsolidierungsregeln prüfen |
| Eine Woche von Graphen weist alle paar Stunden Lücken auf | Heartbeat liegt zu nah am Schritt für einen Poller, der sich verspätet |
| Gestern sichtbare Spitzen fehlen in der Monatsansicht | Nur `AVERAGE` wird beibehalten, oder das `MAX`-Archiv wurde verworfen, um Platz zu sparen |
| Speicherplatz wuchs viermal schneller als geschätzt | Die Schätzung zählte Archive, aber keine Konsolidierungsfunktionen |
| Eine gewünschte Auflösung fehlt im Dropdown-Menü für neue Archive | Der Editor bietet ein feinstes Archiv beim Profilschritt an, danach nur noch Auswahlen, die gröber als bestehende Archive sind |
