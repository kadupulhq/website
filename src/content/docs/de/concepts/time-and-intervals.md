---
title: Zeit und Intervalle
description: Abfrageintervall, RRD-Schrittweite, Heartbeat und Zeitabweichung, und warum der Zeitstempel eines Messwerts mehr entscheidet als erwartet.
sidebar:
  order: 7
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
---

Die Datenerfassung umfasst drei Takte: den Ausführungszyklus des Starters, das Abfrageintervall innerhalb jedes Durchlaufs und die RRD-Schrittweite. Sie erfordern kompatible Einstellungen.

| Zahl | Gehört zu | Verwendung |
|---|---|---|
| Starter-Intervall | Cron, Aufgabenplanung oder `cactid.php` | Muss mit `cron_interval` übereinstimmen, von `poller.php` als 60 oder 300 Sekunden interpretiert |
| Abfrageintervall | Erfassungsdurchläufe | `poller.php` berechnet eine ganzzahlige Anzahl von Durchläufen pro Starter-Intervall |
| Schrittweite | Einer RRD-Datei | Basis-Normalisierungsintervall, bei der Erstellung aus dem Datenquellenprofil übernommen |
| Heartbeat | Einem Feld in der RRD | Maximal zulässige Lücke zwischen Aktualisierungen; liest bei der Erstellung die Felddefinition |

Ein 60-Sekunden-Starter und ein 10-Sekunden-Abfrageintervall ergeben beispielsweise sechs Durchläufe pro Aufruf. Ein 300-Sekunden-Starter und ein 300-Sekunden-Intervall ergeben einen. Konfigurieren Sie das Starter-Intervall niemals kleiner als das Abfrageintervall: 60/300 errechnet null Durchläufe. Nutzen Sie nur einen Scheduler und stoppen Sie ihn vor einem manuellen `--force`-Lauf. Siehe [Installation](/de/start/install/).

Das Bearbeiten eines Profils migriert bestehende Dateien nicht automatisch. Der Heartbeat kann angepasst werden; Schrittweitenänderungen erfordern eine geplante Migration mit den Werkzeugen von RRDtool. Prüfen Sie Datenbankdefinitionen und `rrdtool info` im Anschluss.

## Wenn sie übereinstimmen

Eine Datenquelle, deren Schrittweite dem Abfrageintervall entspricht, ist in jedem Durchlauf an der Reihe, vorbehaltlich des Gerätezustands, des Cache-Inhalts und der Laufzeitgrenzen. Die Standardkonfiguration nutzt 300 Sekunden für beide. Die Berechtigung garantiert keine erfolgreiche Messung.

## Wenn die Schrittweite länger als das Intervall ist

Der PHP-Kollektor nutzt `rrd_next_step` für jede Zeile der Arbeitsliste, wenn mehrere aktive Zeitpläne dies erfordern. Er wählt Zeilen bei oder unter null aus und aktualisiert die Zähler für seinen Kollektor- und Hostbereich. Zeilen, deren Schrittweite dem Abfrageintervall entspricht, verbleiben bei null. Andere Zeilen verringern sich um das Abfrageintervall; bei einem Unterschreiten hängt das Zurücksetzen vom Modus ab: Ein normaler Sub-Starter-Durchlauf setzt auf Schrittweite minus Intervall zurück, während gleiche Intervalle und der Gesamthost-Pfad auf die volle Schrittweite zurücksetzen. Gehen Sie nicht davon aus, dass ein Zehn-Minuten-Schritt immer jeden zweiten Fünf-Minuten-Aufruf bedeutet; prüfen Sie fällige Zeilen und Zeitstempel.

Wenn **Prozesslast ausgleichen** aktiviert ist, weist der Cache-Aufbau aufeinanderfolgenden Datenquellen eines Geräts Versätze anhand von Schrittweite und Abfrageintervall zu. Felder derselben Quelle teilen sich einen Versatz. Dies kann die Arbeit verteilen, garantiert jedoch keine gleichen Laufzeiten: Latenzen, Timeouts und Skripte unterscheiden sich. Der Starter gleicht zudem inkonsistente Zähler innerhalb einer Datenquelle ab.

Bevor Sie folgern, dass ein Element defekt ist, weil es in einem Durchlauf nichts erzeugte, prüfen Sie Fälligkeit und Folgezyklen. Siehe [Der Poller-Cache](/de/concepts/the-poller-cache/) für Neuerstellungsgrenzen.

## Wenn die Schrittweite kürzer als das Intervall ist

Eine kürzere Schrittweite kann keine Messwerte erzeugen, die der Kollektor nie erfasst hat. Kadupul warnt beim Cache-Aufbau, wenn die Erfassung zu langsam für die Schrittweite ist; bereinigen Sie die Einstellungen und bauen Sie den Cache neu auf.

Diese Diskrepanz führt nicht zwingend zu einem kammartigen Diagramm. RRDtool kann seltenere Aktualisierungen in kleinere Schritte normalisieren, sofern der Heartbeat dies erlaubt, stellt aber keine fehlenden Messdetails wieder her.

## Der Heartbeat ist nicht immer das Doppelte der Schrittweite

Der Heartbeat ist das maximal zulässige Intervall zwischen Aktualisierungen, bevor eine Eingabe als unbekannt gewertet wird. Die RRD-Erstellung liest den Heartbeat aus der Definition des Datenquellenfelds, die Profileinstellungen erben kann. Es handelt sich um keine zusätzliche Nachfrist; prüfen Sie Feld und Datei, falls sie vom Profil abweichen.

Die mitgelieferten Profile folgen keiner einheitlichen Regel.

| Profil | Schrittweite | Heartbeat | Grenze des Aktualisierungsintervalls |
|---|---|---|---|
| Fünf Minuten | 300 | 600 | 10 Minuten |
| Eine Minute | 60 | 600 | 10 Minuten |
| Dreißig Sekunden | 30 | 1200 | 20 Minuten |

Dies sind mitgelieferte Profilwerte, keine Ausfallerkennungstimer. Explizit unbekannte Eingaben können Lücken erzeugen, bevor der Heartbeat abläuft; Normalisierung und Archivgrenzen beeinflussen die Sichtbarkeit. Ein größerer Heartbeat toleriert größere Lücken. Liegt er beim oder unter dem normalen Intervall, bleibt kein Spielraum für Verzögerungen.

Prüfen Sie Datei und Profil. Bestehende RRDs können von geänderten Datenbankdefinitionen abweichen; die Dateiprüfung meldet solche Abweichungen. Beachten Sie die [RRDtool-Heartbeat-Definition](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) und die [Tuning-Referenz](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) vor Eingriffen.

## Was gespeichert wird, entspricht nicht der Geräteausgabe

RRDtool normalisiert Aktualisierungen auf feste Schrittgrenzen. Werte zwischen Grenzen können zu mehr als einem primären Datenpunkt beitragen. Heartbeat, unbekannte Werte und Grenzwerte beeinflussen gültige Eingaben; die Archivkonsolidierung wendet eigene Schwellenwerte an. Ein Schritt benötigt keinen separaten Rohwert, um gültig zu sein.

Zählerwerte werden über die verstrichene Zeit zu Raten umgerechnet, unter Berücksichtigung von Überläufen und Grenzwerten. Pegelwerte werden ebenfalls über die Zeit normalisiert. Kurze Spitzen können durch die Abtastung abgeschwächt werden oder ganz verloren gehen. Archiveinstellungen können keine Details wiederherstellen, die nie erfasst wurden.

## Welche Uhr entscheidet

Bei gewöhnlicher `cmd.php`-Erfassung liefert SQL `CURRENT_TIMESTAMP()` den Ausgabezeitstempel beim Einfügen eines Batches. Dies ist kein Gerätezeitstempel und keine exakte Messung des Antwortzeitpunkts. Andere Erfassungs-Backends und Echtzeitpfade müssen separat geprüft werden.

Der PHP-Kollektor puffert Ergebnisse und schreibt sie in Batches, wobei bei einem Gerätewechsel oder vollem Puffer geleert wird. Der Zeitstempel wird einmal pro Batch ausgewertet, sodass alle Werte eines Batches denselben tragen.

Die Konsequenzen sind nicht offensichtlich, daher lohnt sich die Erläuterung.

**Die Geräte-Uhr stempelt diese SNMP-Werte nicht.** Der Kollektor nutzt die Einfügezeit der Datenbank. Die Gerätezeit kann für Skripte oder bestimmte Metriken weiterhin wichtig sein, dies ist also kein Grund, die Zeitsynchronisierung zu vernachlässigen.

**Eine falsche Uhr auf dem Kollektor oder seiner Datenbank verschiebt die Daten.** Werte landen in falschen Zeitfenstern, und bei bereits beschriebenen Dateien wird eine Aktualisierung verweigert, deren Zeit nicht nach der letzten liegt. Wandern Zeitstempel hinter die letzte Aktualisierung zurück, verharrt die Datei, bis neuere Werte eintreffen. Prüfen Sie Datenbankuhr, Kollektoruhr und Dateizeitstempel; eine Kollektor-Anpassung allein ändert nicht zwingend die Datenbank-Zeitstempel.

**Zeit innerhalb eines Zyklus wird zu Jitter.** Ein am Ende eines Laufs abgefragtes Gerät erhält einen späteren Zeitstempel als ein am Anfang abgefragtes, obwohl beide zum selben Zyklus gehören. Bei hoher Last kann dieser Jitter einen beträchtlichen Teil des Intervalls ausmachen und bei knappem Heartbeat Lücken verursachen.

**Die Zeitzone der Datenbank liegt mitten auf dem Hin- und Rückweg.** Der Zeitstempel wird als Datenbank-Zeitstempel geschrieben und beim Lesen wieder in absolute Zeit gewandelt. Uneinheitliche Zeitzoneneinstellungen in Sitzungen können diese Interpretation verändern. Prüfen Sie Sitzungseinstellungen und Epochen-Umwandlungen; eine bloße Änderung der Anzeige-Zeitzone beweist nicht, dass gespeicherte Daten gewandert sind.

## Messwerte werden nach Zeitstempel zusammengeführt

Eine Datenquelle mit mehreren Feldern, wie ein Interface mit eingehenden und ausgehenden Bytes, kann separate SNMP-Einträge oder ein Skript mit mehreren Rückgabewerten nutzen. Gelesene Felder werden für die RRD-Aktualisierung nach Datenquelle und Zeitstempel gruppiert.

Ein unvollständiger Satz wird zurückgehalten, bis die erwartete Feldanzahl erreicht ist, statt unvollständig geschrieben zu werden. Dies ist eine Vollständigkeitsprüfung, keine Garantie für numerische Gültigkeit; explizit unbekannte Werte können dennoch geschrieben werden. Normalerweise liegen beide Hälften im selben Batch und teilen denselben Zeitstempel. Batches innerhalb derselben Sekunde können ebenfalls zusammenfinden. Bei unterschiedlichen Zeitstempeln bleiben Gruppen unvollständig und erzeugen kein Update. Aktueller Code behält unvollständige Gruppen über Zyklen hinweg und verwirft sie nach `5 * max(60, poller_interval)` Sekunden mit einer Protokollmeldung. Eine Leseseitengrenze wird erweitert, um die letzte Zeitstempelgruppe einzuschließen.

Aktualisierungen werden vor dem Schreiben zudem aufsteigend nach Zeit sortiert, da eine Datei keinen Wert akzeptiert, der älter als ihr letzter Stand ist.

## Verzögerte Schreibvorgänge behalten ihren Zeitstempel

Werden RRD-Schreibvorgänge verzögert und gesammelt angewendet, reist der aufgezeichnete Zeitstempel mit dem Wert mit und der Batch wird zeitlich sortiert geschrieben. Ein Mittags-Zeitstempel bleibt erhalten, wenn die Aktualisierung um ein Uhr versucht wird; er wird nicht durch die Leerungszeit ersetzt. RRDtool normalisiert akzeptierte Aktualisierungen weiterhin auf seine Schrittgrenzen.

Ein Rückstau kann eine Datei durch neuere Zeitstempel voranbringen. Er kann jedoch keine Lücken hinter dem letzten Zeitstempel auffüllen. Der Boost-Writer filtert Werte am oder vor dem letzten Dateistand heraus; eine geleerte Warteschlange beweist nicht, dass jeder Wert übernommen wurde. Siehe [Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/) und die [RRDtool-Aktualisierungsreferenz](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Verzögerte Schreibvorgänge hängen von erfolgreicher Speicherung ab; sie garantieren keine Wiederherstellung nach jedem Fehler. Prüfen Sie zurückgehaltene und verworfene Ausgaben, wenn sich Rückstände nicht auflösen.

## Wenn der Zyklus nicht abschließt

Der PHP-Kollektor prüft die verstrichene Laufzeit zwischen Aufgaben und beendet seine Schleife, sobald das Abfrageintervall überschritten wird, unter Ausgabe einer Warnung. Dies ist kein harter Abbruch zur Frist: Eine laufende Operation kann vor dieser Prüfung überziehen. Nicht erreichte Elemente liefern in diesem Zyklus keine Werte. Lücken können überbrückt werden, wenn Heartbeat und Archivschwellenwerte dies zulassen. Wiederholte Überläufe sind Anlass, Kapazitäten, Timeouts und Erfassungsfehler zu untersuchen, kein Beweis dafür, dass jede Lücke dieselbe Ursache hat.

Unter [Poller skalieren](/de/guides/scale-the-poller/) erfahren Sie, wie Sie dem begegnen. Den Ablauf eines Laufs samt Schutzmechanismen beschreibt der [Poller-Lebenszyklus](/de/reference/poller-lifecycle/).
