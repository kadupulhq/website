---
title: Datenquellen und Round-Robin-Archive
description: Was gespeichert wird, wie die Vorhaltung funktioniert und warum Profilbearbeitungen bestehende RRD-Dateien nicht migrieren.
sidebar:
  order: 2
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
---

Eine Kadupul-Datenquelle fasst Messwerte über die Zeit zusammen und ist normalerweise genau einer RRD-Datei
zugeordnet. Jedes benannte Feld innerhalb dieser Datei wird von RRDtool ebenfalls als Datenquelle (DS) bezeichnet.
Unterscheiden Sie beim Vergleichen von Anzahlen oder Einstellungen zwischen dem Anwendungsobjekt und seinen Feldern.

Eine Datei entspricht nicht immer einer einzelnen Zahl. Eine Datenquelle kann mehrere Felder enthalten,
und eine Netzwerkschnittstelle ist der Regelfall: Eingehende und ausgehende Bytes teilen sich eine Datei,
werden als getrennte Arbeitsschritte erfasst und gemeinsam in einem einzigen Schreibvorgang aktualisiert.
Gemeinsam sind ihnen ein Intervallschritt (Step), ein Satz von Archiven und ein Schicksal: Sie können
eines der Felder nicht länger aufbewahren als das andere, da die Vorhaltezeit eine Eigenschaft der Datei
und nicht des einzelnen Felds ist.

## Was sich in der Datei befindet

Eine RRD-Datei besteht aus einem Datei-Header und zwei Listen.

Die erste Liste enthält die Felder: einen Namen, einen Typ, ein Heartbeat-Intervall sowie jeweils ein Minimum
und ein Maximum. Die zweite Liste enthält die Archive: eine Konsolidierungsfunktion, wie viele Rohdatenschritte
in einen Slot einfließen, wie viele Slots vorhanden sind und wie viel von einem Slot unbekannt sein darf,
bevor der Slot selbst als unbekannt gilt.

Bei der Erstellung werden diese Definitionen in die Datei geschrieben. Datenbankmetadaten und tatsächliche
Dateidefinitionen können danach voneinander abweichen; untersuchen Sie die Datei mit `rrdtool info`,
anstatt davon auszugehen, dass die aktuelle Vorlage sie exakt beschreibt.

<span id="the-decisions-that-are-permanent"></span>

## Erstellungsentscheidungen und spätere Wartung

Eine RRD-Datei wird bei ihrer Erstellung fest zugewiesen. Profiländerungen migrieren bestehende Dateien
nicht. RRDtool bietet Anpassungs- und Größenänderungsoperationen, die gespeicherte Daten erhalten können,
diese erfordern jedoch gesonderte Validierungen und Backups. Der reguläre Erstellungspfad prüft,
ob eine Datei bereits existiert, und bricht ab, ohne sie zu ersetzen. Dieser Schutz verhindert jedoch
keine expliziten Anpassungen oder Migrationen. Das bloße Speichern einer Vorlage aktualisiert das Layout
bestehender Dateien nicht.

Vier Parameter werden in diesem Moment festgeschrieben:

**Der Schritt (Step).** Wie oft ein Wert erwartet wird, üblicherweise alle 300 Sekunden. RRDtool normalisiert
Aktualisierungen auf Schrittgrenzen; häufigere Messwerte werden nicht einfach verworfen. Ob langsamere
Aktualisierungen unbekannte Daten erzeugen, hängt von den Heartbeat- und Konsolidierungsregeln ab. Der Schritt
stammt normalerweise aus dem Datenquellenprofil. Die Dateierstellung liest den gespeicherten Schritt der
Datenquelle und die Archive des referenzierten Profils aus; überprüfen Sie daher beides bei Änderungen
an Metadaten oder bei Migrationsplanungen.

**Der Datenquellentyp.** Siehe unten. Dies ist die Einstellung, die unbemerkt zu Fehlern führt.

**Die Grenzwerte.** Ein Minimum und ein Maximum grenzen zulässige Werte ein; bei ratenbildenden
DS-Typen gelten diese Grenzwerte für die berechnete Rate, nicht für den rohen Zählerstand. Werte außerhalb
des gültigen Bereichs werden zu unbekannt (unknown), anstatt abgeschnitten zu werden. Abfragebasierte
Maximalwerte können Platzhalter für Schnittstellengeschwindigkeiten auflösen; nicht jede Schnittstellendatenquelle
erhält automatisch ein korrektes Verbindungstempolimit. Prüfen Sie Vorlageneinheiten und die tatsächliche Dateidefinition.

Die Erstellung verfügt über spezifische Normalisierungszweige. Bei einem literalen Maximum, das gleich oder
kleiner als das Minimum ist, verwenden GAUGE und ABSOLUTE ein undefiniertes Maximum; andere Typen setzen
Minimum plus eins. Abfragesubstitutionen folgen einem separaten Zweig. Eine spätere Null/Null-Prüfung ändert
ausschließlich das Maximum, und frühere Normalisierungen haben es möglicherweise bereits angepasst. Betrachten
Sie dies nicht als universelle Validierung und gehen Sie nicht davon aus, dass beide Grenzen undefiniert werden.

**Die Archive.** Wie viele Messwerte bei welchen Auflösungen vorgehalten werden sollen und welche
Konsolidierungsfunktion für jedes einzelne verwendet wird. Dies entscheidet darüber, ob Sie eine Frage
in zwei Jahren noch beantworten können.

## Datenquellentypen

| Typ | Speichert | Verwendungszweck |
|---|---|---|
| `GAUGE` | Einen Pegelwert, normalisiert auf den Dateischritt | Temperatur, Systemlast, Speichernutzung, Warteschlangentiefe |
| `COUNTER` | Änderungsrate pro Sekunde, mit Überlaufkorrektur bei 32 oder 64 Bit | Schnittstellen-Oktette, Paket- und Fehlerzähler |
| `DERIVE` | Änderungsrate pro Sekunde, kann auch negativ sein | Ein Zähler, der legitim sinken oder zurückgesetzt werden kann |
| `ABSOLUTE` | Den angegebenen Wert, geteilt durch die Zeit seit der letzten Messung | Ein Zähler, den das Gerät bei jedem Lesevorgang zurücksetzt |
| `COMPUTE` | Einen Wert, der aus anderen Feldern derselben Datei berechnet statt erfasst wird | Ein abgeleitetes Feld, wie eine Summe oder ein Verhältnis |

Kadupul stellt `DCOUNTER` und `DDERIVE` bereit, wenn die konfigurierte RRDtool-Version 1.5 oder
neuer ist. Sie akzeptieren Fließkommazähler; DCOUNTER erkennt zudem Zählrichtung und Rücksetzungen,
ist also nicht bloß ein COUNTER mit Dezimalstellen. Die Tabelle beschreibt RRDtool-Semantiken und garantiert
nicht, dass jeder Typ von jedem Kadupul-Editor oder Erstellungspfad unterstützt wird; validieren Sie
die generierte Definition, insbesondere bei COMPUTE-Ausdrücken. Siehe die offizielle
[RRDtool-Erstellungsreferenz](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Die Wahl des falschen Typs

Diese Beispiele veranschaulichen Fehlkonfigurationen; ihre Sichtbarkeit hängt von den Daten und Grenzen ab.

`GAUGE` auf einem kontinuierlich steigenden Zähler zeichnet den absoluten Stand statt des Durchsatzes auf.
Der Wert steigt möglicherweise bis zu einem Überlauf oder Reset an; das kann auffallen, sieht aber
über ein kurzes Betrachtungsfenster nicht zwingend fehlerhaft aus.

`COUNTER` interpretiert Verringerungen mittels Überlaufkorrektur, sodass ein Reset zu einer enormen
positiven Rate führen oder durch das Maximum verworfen werden kann. `DERIVE` mit einem Minimum von null
schließt negative Raten einschließlich echter Überläufe aus; wählen Sie diesen Typ nur, wenn dieser Kompromiss
zur Metrik passt. Ein Maximum unterscheidet nicht jeden Reset von einem regulären Überlauf.

`COUNTER` auf einem Pegelwert (Gauge) ist der gefährliche Fall. Der gespeicherte Wert wird zur Änderung
des Pegels geteilt durch die verstrichene Zeit. Ein Gerät mit konstanter Temperatur von 40 Grad
zeichnet null auf. Ein Anstieg um ein Grad über fünf Minuten zeichnet 0,0033 auf. Das Diagramm wirkt
möglicherweise plausibel, misst aber Änderungen statt der eigentlichen Temperatur. Diese Rate ist nur dann
nützlich, wenn genau diese Messgröße beabsichtigt war; sie repräsentiert nicht den ursprünglichen Temperaturwert.

`ABSOLUTE` auf einem Zähler, der sich beim Lesen nicht zurücksetzt, erzeugt denselben lautlosen Fehler
in umgekehrter Richtung: Es entstehen Werte, die proportional zur bisherigen Betriebszeit des Geräts wachsen.

Die daraus resultierende Regel lautet: Bestimmen Sie den Typ danach, wie das Gerät die Zahl liefert,
nicht danach, was die Zahl fachlich bedeutet. Ob ein Messwert eine Rate darstellt, ist eine Eigenschaft
des Zählers, nicht der Metrik.

## Der Heartbeat

Der Heartbeat ist die maximal zulässige Zeitspanne zwischen zwei Aktualisierungen eines Feldes,
bevor RRDtool das Intervall als unbekannt einstuft. Er wird zwischen zwei Aktualisierungen gemessen,
nicht als zusätzliche Pufferzeit nach dem Intervallschritt.

Prüfen Sie das konfigurierte Profil und die tatsächliche Datei. Das mitgelieferte Fünf-Minuten-Profil
verwendet einen Heartbeat von 600 Sekunden, das Ein-Minuten-Profil ebenfalls 600 Sekunden und das
Dreißig-Sekunden-Profil 1.200 Sekunden. Die Toleranz gegenüber verpassten Abfragen lässt sich daher
nicht durch einen einzelnen festen Multiplikator ausdrücken; auch Normalisierung und Konsolidierung
beeinflussen, welche Diagrammintervalle als unbekannt dargestellt werden.

Der Heartbeat gilt pro Feld, nicht pro Datei. Profilwerte dienen als Vorgabe für Metadaten, aber die
Dateierstellung liest den lokalen Heartbeat des Eintrags aus, der vom Profil abweichen kann. Die mitgelieferten
Profile verwenden kein einheitliches Verhältnis. Die Begründung für die jeweiligen Werte und die Auswirkungen
eines zu nah am Schritt gewählten Heartbeats finden Sie unter
[Zeit und Intervalle](/de/concepts/time-and-intervals/).

## Konsolidierung

Sobald Aktualisierungen eintreffen, konsolidiert RRDtool diese auch in gröbere Zeitfenster; es wartet
nicht, bis das feinste Archiv abgelaufen ist. Die Funktion wird pro Archiv ausgewählt, und jede Funktion
beantwortet eine andere Fragestellung:

- `AVERAGE` fasst die beitragenden Primärdatenpunkte zusammen.
- `MAX` behält deren Höchstwert.
- `MIN` behält deren Minimalwert.
- `LAST` behält deren letzten Wert gemäß den RRDtool-Konsolidierungsregeln.

Diese Funktionen wirken auf normalisierte Primärdatenpunkte, nicht zwingend auf die ursprünglichen
Rohablesungen. Ein MAX-Archiv kann keine kurzzeitigen Spitzen wiederherstellen, die bereits innerhalb eines
primären Intervalls gemittelt wurden; MIN eignet sich nicht als verlässlicher Detektor für jeden Teilausfall.

Eine Datei speichert ein Archiv pro Funktion und Auflösung. Das Vorhalten aller vier Funktionen bei vier
Auflösungen bedeutet daher sechzehn Archive und die vierfache Nutzdatenmenge im Vergleich zu reinen
Durchschnitten bei gleicher Zeilenzahl. Header und Vorbereitungsstatus beanspruchen zusätzlichen Speicherplatz.
Alle drei mitgelieferten Profile wählen vier Funktionen aus; stimmen Sie die Vorhaltezeit auf die Fragen
und Kapazitätsanforderungen Ihrer Bereitstellung ab.

Wenn Sie nur Durchschnitte speichern, können Sie später keine Spitzenwerte mehr ermitteln. Diese wurden
schlicht nie aufgezeichnet. Dies ist das häufigste Versäumnis in langlebigen Installationen und lässt sich
nachträglich nicht mehr korrigieren.

Einige Zeichenpfade ersetzen eine fehlende Funktion durch eine verfügbare; andere Pfade brechen ab.
Überprüfen Sie das generierte DEF und die tatsächlichen Archive wie in
[Wie Diagramme gezeichnet werden](/de/concepts/how-graphs-are-drawn/) beschrieben.

## Unbekannt ist ein echter Messwert

Ein RRD unterscheidet präzise zwischen Null und Unbekannt (unknown). Null kann ein gemeldeter Füllstand
oder eine berechnete Rate sein, beispielsweise bei einem unveränderten Zähler. Unbekannt entsteht durch
fehlende Aktualisierungen, abgelaufene Heartbeats, explizit unbekannte Eingaben, verworfene Grenzwerte
oder unzureichende Konsolidierungsdaten. Das Ersetzen von Unbekannt durch Null lässt fehlende oder ungültige
Messwerte wie Inaktivität erscheinen.

Unbekannt pflanzt sich bei der Konsolidierung gemäß einem Schwellenwert fort, der pro Archiv festgelegt ist.
Die Standardprofile setzen diesen auf die Hälfte: Ein gröberer Slot aus teilweise fehlenden Eingabewerten
bleibt eine gültige Zahl, bis mehr als die Hälfte seiner Eingaben unbekannt sind; ab diesem Punkt wird
der gesamte Slot als unbekannt markiert. Die Sichtbarkeit hängt von Slot-Ausrichtung, Heartbeat,
Normalisierung, Konsolidierung und Diagrammdarstellung ab. Es gibt keine pauschale Ausfallzeit, die das
Auftreten oder Verschwinden einer Lücke in jedem Archiv garantiert.

Unbekannt ist auch das Resultat von Grenzwertüberschreitungen. Ein Messwert über dem konfigurierten Maximum
wird nicht auf das Maximum gekappt. Ein Zähler-Reset kann eine unzulässige Rate und somit eine Lücke erzeugen,
doch Grenzwerte fangen nicht jeden Reset ab. Unbekannte Daten allein verraten die Ursache nicht; vergleichen
Sie Erfassungsfehler und Zeitstempel.

## Dimensionierung

Bei unverändertem Layout entspricht die Nutzdatenmenge der Archive der Gesamtzahl aller Slots über alle
Archive hinweg, multipliziert mit der Anzahl der Felder und mit acht Bytes. Die tatsächliche Dateigröße
umfasst zusätzlich Datei-Header, Vorbereitungszustände, Dateisystem-Zuordnungen, Warteschlangen und Backups.
Manuelle Eingriffe in das Layout können die Dateigröße verändern.

Die drei mitgelieferten Profile weichen deutlicher voneinander ab, als ihre Namen vermuten lassen:

| Profil | Schritt | Slots pro Feld | Nutzdaten pro Feld | Relativer Aufwand |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | ca. 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | ca. 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | ca. 640 KiB | 7 |

Eine Datenquelle für Schnittstellen mit zwei Feldern verdoppelt diese Werte. Zehntausend Schnittstellen
im Fünf-Minuten-Profil belegen rund 1,8 GB an Archiv-Nutzdaten. Dieselben zehntausend Schnittstellen im
Ein-Minuten-Profil beanspruchen knapp 13 GB. Der Grund liegt nicht allein im Schrittintervall; dieses Profil
enthält zudem ein deutlich tieferes Monatsarchiv und ein zehnjähriges Jahresarchiv.

Der tatsächliche Zeitraum eines Archivs sollte stets gegen seinen Namen geprüft werden. Die Archive des
Fünf-Minuten-Profils heißen Daily, Weekly, Monthly und Yearly; die tatsächlichen Zeitspannen betragen
jedoch 50 Stunden, 14,6 Tage, 64,6 Tage und 2,2 Jahre. Die Bezeichnungen beschreiben die Diagrammvorgabe,
für die das Archiv ausgelegt wurde, nicht die tatsächliche Vorhaltezeit. Wenn Sie Daten vom vergangenen
April in Fünf-Minuten-Auflösung benötigen, verspricht das Label Verfügbarkeit, das Archiv liefert sie nicht.

Auch die Schreiblast hängt unmittelbar vom Profil ab und belastet das System lange vor dem Speicherplatz.
Bei voller Erfassungsfrequenz erzeugt ein 30-Sekunden-Schritt zehnmal so viele Abtastintervalle wie ein
5-Minuten-Schritt. Bündelung, gemeinsame Felder, Auswahl fälliger Arbeiten und Fehlversuche beeinflussen
Befehlsanzahl und physische Schreiboperationen; sie stehen in keinem starren Verhältnis. Siehe
[Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/).

## Welche Felder in die Datei gelangen

Eine Datenquelle, die aus einer Datenvorlage erstellt wird, erhält im regulären Erstellungspfad nur für
diejenigen Felder einen Platz in der Datei, die von mindestens einem Diagrammelement referenziert werden.
Der Aktualisierungscode kann nicht referenzierte Vorlagenfelder ausschließen; ob sie erfasst werden,
hängt von Eingabemethode und Cache ab, nicht bloß von der Sichtbarkeit einer Linie. Eine Datenquelle ohne
Vorlage erhält vorsorglich jedes Feld, da kein Diagramm vorab bekannt ist.

Eine Referenz muss keine sichtbare Linie zeichnen: Prüfen Sie Diagrammelement-Zuordnungen ebenso wie Cache
und Dateidefinition. Das bloße Hinzufügen eines Feldes zu einer Vorlage garantiert nicht, dass Erfassung,
Diagrammzuordnung und Speicherung betriebsbereit sind. Das Neuerstellen des Caches aktualisiert
Erfassungsmetadaten; es fügt einer bestehenden RRD-Datei keine neuen Felder hinzu.

Das bedeutet auch: Ein neues Feld in einer Vorlage erweitert bestehende Dateien nicht automatisch, selbst
wenn ein Diagrammelement darauf verweist. Das Hinzufügen erfordert gezielte Wartung oder Migration.
Je nach installierter RRDtool-Version kann eine Anpassung Felder unter Beibehaltung der Altdaten ergänzen;
das Löschen und Neuerstellen einer Datei vernichtet die Historie. Siehe
[Datenvorhaltung verwalten](/de/guides/manage-data-retention/) für Wartungsoptionen und Prüfschritte.
