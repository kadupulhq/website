---
title: Schreibvorgänge mit hohem Volumen
description: Warum RRD-Aktualisierungen eher durch die Anzahl als durch die Größe der Schreibvorgänge begrenzt werden, was deren Bündelung bringt und was sie an Aktualität kostet.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 10
---

RRD-Aktualisierungen berühren viele Dateien und können durch Speicherlatenz und E/A-Operationen
begrenzt werden, nicht nur durch die Übertragungsbandbreite. Verzögerte Schreibvorgänge, auch
Boost genannt, sammeln Stichproben in der Datenbank und bündeln Aktualisierungen für jede Datei.
Messen Sie Writer und Datenbank vor der Auswahl: Lücken in Graphen weisen nicht automatisch auf
einen Speicherengpass hin.

## Der Standardpfad

Kollektoren fügen Ergebnisse in die aktive Warteschlange `poller_output` ein. Der Writer gruppiert
Stichproben nach Datei und Zeitstempel, aktualisiert die RRD und verfolgt die Bestätigung, bevor
er berechtigte Stichproben entfernt. Fehlgeschlagene Schreibvorgänge können Zeilen für erneute
Versuche hinterlassen, sodass die Warteschlange nicht auf den aktuellen Polling-Durchlauf beschränkt ist.

In der überprüften Version verwendet diese Warteschlange InnoDB. Der Vorab-Check der Erfassung
weist eine MEMORY-Warteschlange ab; ein Datenbankneustart verwirft festgeschriebene Zeilen nicht
von Natur aus, wie es bei einer MEMORY-Tabelle der Fall wäre. Die Dauerhaftigkeit hängt weiterhin
von der Datenbankkonfiguration, dem Speicherzustand und Sicherungen ab. Siehe
[Sicher aktualisieren](/de/guides/upgrade-safely/) für Warteschlangenmigration und Speicherprüfungen.

Als grobe Lastschätzung bedeuten 10.000 einzelne Dateien, die alle 300 Sekunden aktualisiert werden,
durchschnittlich etwa 33 Dateiaktualisierungen pro Sekunde. Tatsächliche Schreibvorgänge treten in
Spitzen auf; mehrere Datenquellenfelder können sich eine Datei teilen, Schritte können sich
unterscheiden und die Befehlsanzahl entspricht nicht der physischen Festplatten-E/A-Zahl. Vergleichen
Sie die gemessene Writer-Latenz und das Warteschlangenalter mit dem verfügbaren Polling-Zeitfenster.

## Was die Bündelung ändert

Wenn verzögerte Schreibvorgänge aktiviert sind, stuft die Erfassung Stichproben in
`poller_output_boost` für die spätere Verarbeitung ein. Der Batch-Writer gruppiert Stichproben nach
Datenquelle in Zeitstempel-Reihenfolge und kann mehrere Zeitstempel in einem einzigen RRDtool-Aktualisierungsbefehl
senden. Zwölf Stichproben passen möglicherweise in einen Befehl, dies garantiert jedoch keinen
einzelnen physischen Schreibvorgang auf der Festplatte.

Die konfigurierte maximale Argumentlänge begrenzt Aktualisierungszeichenfolgen; der Standardwert ist 2.000.
Sie beeinflusst die Bündelung. Schließen Sie aus dieser Einstellung nicht auf eine bestimmte Grenze des
Betriebssystems: Lokale bestätigte Schreibvorgänge verwenden einen RRDtool-Befehlsdatenstrom, und der
tatsächliche Transport sowie die unterstützte Befehlsgröße spielen eine Rolle.

Der Scheduler wird normalerweise berechtigt, wenn sein Timer fällig ist (standardmäßig 60 Minuten)
oder die geschätzte Zeilenanzahl des Puffers den konfigurierten Schwellenwert überschreitet (standardmäßig
1.000.000). Die Zeilenschätzung umfasst Live- und Archivtabellen. Ein Aufruf des Schedulers muss
dennoch stattfinden, und Prozessprüfungen, Vorbereitungen oder Writer-Fehler können die Arbeit verzögern.
Erzwungene Durchläufe, das Leeren nach der Deaktivierung und Bedarfsaktualisierungen von Graphen sind
zusätzliche Pfade; die Standardeinstellungen stellen keine Ein-Stunden-Aktualitätsgarantie dar.

Ein Intervall, das null oder keine positive Ganzzahl ist, wird durch 120 Minuten ersetzt;
der normale Standardwert beträgt 60 Minuten.

## Die Rotation und warum es sie gibt

Das Batch-Setup erstellt eine leere Tabelle, die dem Live-Puffer entspricht, und tauscht die Namen dann
mit einer einzelnen `RENAME TABLE`-Anweisung aus. Die alte Live-Tabelle wird zu einem Archiv mit
Zeitstempel und Erzeuger zielen auf den Ersatz. Dies trennt den Batch von neuen Einfügungen, aber
Datenbanksperren und Ressourcenkonflikte können die Erfassung dennoch verzögern.

Worker verarbeiten aktuelle und beibehaltene Archive. Der übergeordnete Prozess prüft den Abschluss
und Status der untergeordneten Prozesse; fehlgeschlagene oder nicht überprüfbare Durchläufe behalten
Archive für Wiederholungsversuche bei. Während einer berechtigten Bereinigung können leere Archive
gelöscht und verbleibende Stichproben wieder in den Live-Puffer eingereiht werden, bevor ein Archiv
gelöscht wird. Ein nicht leeres Archiv wird nicht einfach verworfen, weil der Prozess beendet wurde.
Überprüfen Sie sowohl Live- als auch Archiv-Warteschlangen bei der Diagnose eines Rückstands.

Dies ist eine Wiederholungsbehandlung, keine universelle Garantie für Absturzsicherheit. Datenbankfehler,
gleichzeitige Aktivitäten, Speicherfehler und Konsistenz von Sicherungen müssen im jeweiligen
Betriebsumfeld weiterhin validiert werden.

## Warum das Anzeigen eines Graphen seine Dateien aktualisieren kann

Der normale Graphpfad kann vor dem Rendern versuchen, bedarfsgesteuerte Aktualisierungen für jede vom
Graphen referenzierte Datenquelle durchzuführen. Er leert nicht bedingungslos jede anstehende Stichprobe:
Kollektorprüfungen, Echtzeit-/Quell-/Fehlerausgabepfade, aktive Polling-Grenzwerte, Abfragebeschränkungen
und Aktualisierungsfehler beeinflussen, was ausgeführt wird. Kürzliche oder fehlgeschlagene Stichproben
können in der Warteschlange verbleiben.

Ein Graph, der aktuell aussieht, beweist daher nicht, dass der gesamte RRD-Baum aktuell ist, und das
Anfordern eines Graphen garantiert keine erfolgreiche Wiedergabe. Überprüfen Sie Writer-Fehler,
Warteschlangenalter und tatsächliche RRD-Zeitstempel. Reine Dateisicherungen lassen ausstehende
Datenbankstichproben aus; siehe [Sichern und Wiederherstellen](/de/guides/back-up-and-restore/).

## Welche Kompromisse Sie eingehen

**Aktualität der Dateien.** Stichproben verbleiben in der Datenbank, bis sie erfolgreich verarbeitet
wurden. Eine fehlerfreie, timergesteuerte Installation kann ungefähr um ein Leerungsintervall
hinterherhinken; ein fehlerhafter oder zu klein dimensionierter Writer kann länger verzögert sein.
Sichern Sie anstehende Warteschlangen und Dateien konsistent.

**Ein zweiter Zeitplan.** Überwachen Sie Polling und Leerung separat. Beobachten Sie Live-Zeilen,
beibehaltene Archive, das Alter der ältesten Stichprobe, fehlgeschlagene Worker und den Durchsatz
des Writers. Eine Live-Tabelle muss nicht leer werden, während Erzeuger noch Daten einfügen, und eine
Rotation allein kann sie kleiner erscheinen lassen, ohne dass RRD-Aktualisierungen abgeschlossen wurden.

**Reihenfolge.** RRD-Dateien akzeptieren nach neueren Aktualisierungen keine älteren Zeitstempel.
Der moderne Boost-Pfad überspringt Aktualisierungen aus der Vergangenheit, und der Legacy-Pfad filtert
Zeitstempel anhand der letzten Aktualisierung der Datei. Ein als erfolgreich bestätigter Befehl kann
daher alte Daten überspringen; eine späte Zustellung garantiert nicht, dass eine Stichprobe im Graphen erscheint.

**Betriebliche Angriffsfläche.** Es gibt einen Datenbankpuffer, einen Leerungsprozess mit Speicherbegrenzung,
optionale parallele Worker sowie beibehaltene Archive oder wieder eingereihte Stichproben, die überwacht
werden müssen. Lokale Writer-Fehler behalten Stichproben im Allgemeinen für Wiederholungsversuche bei,
dies begründet jedoch keine durchgängige Verlustfreiheit. Für den Remote-Wiederherstellungspfad siehe
[Entfernte Datenerfassung](/de/concepts/remote-data-collection/).

## Wann es sich lohnt

Erwägen Sie verzögerte Schreibvorgänge, wenn Messungen zeigen, dass der RRD-Writer der Engpass ist und
die Datenbank Kapazitäten für Pufferung und Batch-Abfragen hat. Es beseitigt keine Gerätelatenz und
repariert keine überlastete Datenbank. Vergleichen Sie Durchsatz, Warteschlangenalter, Dateiaktualität
und Ressourcennutzung vor und nach der Aktivierung.

Der Hauptpoller aktiviert verzögertes Aktualisieren automatisch, wenn ein aktivierter entfernter
Datensammler konfiguriert ist. Diese Einstellung allein begründet jedoch keine validierte Remote-Speicher-
oder Wiederherstellungsumgebung; beachten Sie die Grenzen in
[Entfernte Datenerfassung](/de/concepts/remote-data-collection/).

## Eine andere Funktion mit demselben Namen

Gerenderte Graphbilder können ebenfalls zwischengespeichert werden. Das Zwischenspeichern von Bildern
reduziert wiederholtes Rendern; verzögerte Schreibvorgänge bündeln Datenbankstichproben in RRD-Aktualisierungen.
Ihre Einstellungen sind getrennt, ihre Ausführungspfade interagieren jedoch: Graphanforderungen können
ausstehende Stichproben prüfen, bevor ein zwischengespeichertes Bild verwendet wird, und erfolgreiche
Aktualisierungen können dazu führen, dass ein neues Bild gerendert wird. Bewerten Sie die Bildaktualität
getrennt von der Warteschlangen- und RRD-Aktualität.
