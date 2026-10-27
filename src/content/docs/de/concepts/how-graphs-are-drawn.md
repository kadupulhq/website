---
title: Wie Diagramme gezeichnet werden
description: Der Weg von einer Round-Robin-Datei zum gerenderten Bild und warum dieselben gespeicherten Zahlen sehr unterschiedliche Bilder erzeugen können.
sidebar:
  order: 4
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
---

Eine normale Bildanforderung kann einen RRDtool-Befehl aus der Diagrammkonfiguration zusammensetzen und die referenzierten RRD-Dateien lesen. Ein gültiges zwischengespeichertes Bild kann die Anforderung ebenfalls erfüllen, und eine bedarfsgesteuerte Boost-Verarbeitung kann Dateien vor dem Rendern aktualisieren. Siehe [Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/) für Aktualitätsgrenzen.

## Die Reihenfolge der Operationen

Für eine Anforderung, die zur Befehlsgenerierung übergeht:

1. Gewünschtes Zeitfenster und Diagrammkonfiguration auflösen.
2. Auflösung aus Datenbankprofilen schätzen und Konsolidierungsfunktionen auswählen.
3. Deduplizierte `DEF`-Referenzen für die erforderlichen Felder und Funktionen ausgeben.
4. Referenzierte `CDEF`- und `VDEF`-Ausdrücke ausgeben.
5. Zeichen- und Druckelemente in konfigurierter Reihenfolge mit anwendbaren Optionen und Plugin-Änderungen ausgeben.
6. RRDtool die tatsächlichen Dateien lesen und das Ergebnis rendern lassen.

## Auswahl eines Archivs

Kadupul zieht Zeilen des Datenbankprofils heran, wenn es Archivspannen und Diagrammoptionen berechnet. Seine automatische Schätzung berücksichtigt Schrittzeiten mal Schritte mal Zeilen, angeforderte Abdeckung und Archiv-Schrittanzahl; die explizite Archivwahl folgt einem separaten Pfad. Diese Profilberechnungen prüfen nicht jedes tatsächliche Archiv in jeder Datei und können nach einer Profiländerung von bestehenden Dateien abweichen.

Das generierte `DEF` gibt Datei, Datenquellenname und Konsolidierungsfunktion an. RRDtool wählt ein verfügbares Archiv mit passender Auflösung und kann Daten für Diagrammbreite und Zeitfenster weiter konsolidieren. Die Anwendungsschätzung ist keine Garantie dafür, dass ein bestimmtes physisches Archiv gelesen wird. Siehe die vorgelagerte [RRDtool-Datendefinitions-Dokumentation](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Das Erweitern eines Fensters oder Ändern der Bildbreite kann die angezeigte Auflösung ändern. Eine gröbere Durchschnittsserie kann eine kurze Spitze verbergen, obwohl ein feineres Archiv sie noch enthält. Vergleichen Sie tatsächlichen Dateiinhalt und Befehl, nicht nur das Profil. Siehe [Datenquellen und Round-Robin-Archive](/de/concepts/data-sources-and-rras/).

Gibt der Aufrufer keine Endzeit an, nutzt der normale Renderer anfangs den Zeitversatz des letzten Laufs des Hauptpollers gegenüber jetzt, mit Rückgriff auf das Abfrageintervall, falls dieser Wert fehlt oder in der Zukunft liegt. Späterer Code besitzt auch einen Rückgriff auf konsolidierte Intervalle, doch ist dies kein universeller Standard. Eine explizite Endzeit überschreibt diese Initialisierung; ein Diagramm, das vor jetzt endet, beweist weder das gewählte Archiv noch das Schreiben neuester Werte.

## Die Elemente

Ein Diagramm ist eine geordnete Liste von Elementen. Die Befehlsgenerierung kann Elemente auslassen, Definitionen wiederverwenden oder ein Element in mehrere Befehle aufteilen. Die Zeichenreihenfolge ist für mehr als das Layout entscheidend.

| Element | Zeichnet | Hinweise |
|---|---|---|
| `AREA` | Gefüllter Bereich von der Achse bis zum Wert | Spätere Bereiche überdecken frühere |
| `STACK` | Gefüllter Bereich beginnend am oberen Rand des vorherigen Elements | Als Bereich mit Stack-Flag ausgegeben |
| `LINE1`, `LINE2`, `LINE3` | Eine Linie mit einem, zwei oder drei Pixeln Breite | Kann gestrichelt sein |
| `LINE:STACK` | Eine Linie oben auf der laufenden Stapelsumme | |
| `TICK` | Markierungen entlang eines Diagrammrands | Nützlich für Zustände, nicht Größen |
| `GPRINT` | Nichts. Druckt eine Zahl in die Legende | |
| `COMMENT` | Nichts. Druckt buchstäblichen Legendentext | Lange Kommentare werden umgebrochen |
| `HRULE` | Eine horizontale Linie bei einem festen Wert | |
| `VRULE` | Eine vertikale Linie zu einem festen Zeitpunkt | |
| `TEXTALIGN` | Nichts. Bestimmt die Ausrichtung des folgenden Legendentexts | |

Die vollständige Liste, einschließlich der Frage, welche Konfigurationsspalten für welchen Typ gelten, finden Sie unter [Diagrammelemente](/de/reference/graph-items/).

`AREA` und `STACK` sind das Paar, bei dem sich viele irren. Eine Fläche beginnt bei null, sodass zwei Flächen überlappen und die höhere die niedrigere verdeckt. Ein Stapel beginnt dort, wo das vorherige Element endete; die sichtbare Höhe des zweiten Bandes entspricht seinem eigenen Wert, seine Oberkante jedoch der Gesamtsumme. Lesen Sie ein gestapeltes Diagramm als Bandhöhe, nicht als y-Achsenposition, sonst lesen Sie jede Serie außer der untersten falsch ab.

`HRULE` akzeptiert einen Wert, der Vorlagensubstitutionen enthalten kann. Nicht-numerische Zeichen werden aus dem Ergebnis entfernt, und wenn nichts Numerisches verbleibt, wird die Linie bei null gezeichnet statt das Rendern abzubrechen. Eine Linie bei null kann beabsichtigt sein oder auf einer fehlgeschlagenen Substitution beruhen. Prüfen Sie den aufgelösten Befehl vor einer Bewertung. Der numerische Filter kann zudem Zeichenketten verändern, die Einheiten oder nicht unterstützte Zahlenschreibweisen enthalten.

`VRULE` akzeptiert entweder einen Unix-Zeitstempel oder ein `hours:minutes`-Paar. Ein negativer Stundenwert wird als Versatz zurück von jetzt interpretiert statt als Uhrzeit.

## Zwei Aufgaben, ein Wort

Konsolidierungsfunktion wird für zwei verschiedene Aufgaben verwendet, und dieselben vier Namen, `AVERAGE`, `MIN`, `MAX` und `LAST`, tauchen an beiden Stellen auf.

Die erste Aufgabe ist die Archivwahl. Ein `DEF` benennt eine Datei, eine Datenquelle darin und eine Konsolidierungsfunktion. Diese Funktion schränkt die angeforderte Archivfamilie ein. Wer nach `MAX` fragt, benötigt passende gespeicherte Konsolidierungsdaten in RRDtool, vorbehaltlich des unten beschriebenen Anwendungs-Rückgriffs und der Auflösungswahl.

Die zweite Aufgabe ist die Legenden-Arithmetik. Ein `GPRINT` reduziert das gesamte gezeichnete Fenster auf eine einzige gedruckte Zahl, und seine Funktion bestimmt die Methode. Diese Reduktion erfolgt über die bereits gelesene Serie; es ist Aggregation, keine Speicherung.

Ein `GPRINT`, das `MAX` über ein mit `AVERAGE` gelesenes `DEF` anzeigt, druckt daher den größten Wert dieser durchschnittsbasierten Serie über das gerenderte Fenster, nicht zwingend den größten Rohwert. Fünf Minuten sind nur ein Beispiel; die effektive Auflösung variiert. Das sind unterschiedliche Zahlen, und auf einer ausgelasteten Leitung unterscheiden sie sich erheblich. Beide Messwerte sind legitim. Nur einer war wahrscheinlich gemeint.

## Der stille Rückgriff

Für Elementtypen, die den Best-Function-Helper nutzen, liest Kadupul die Dateikonsolidierungsfunktionen und verwendet die angeforderte, falls vorhanden, andernfalls die erste gemeldete. Werden für eine gültige lokale Datenquelle keine ermittelt, greift der Helper auf AVERAGE zurück. Feste GPRINT-Varianten nutzen einen separaten Pfad und verwenden diesen Helper nicht, sodass dies kein universelles Versprechen darstellt, dass jede fehlende Funktion korrigiert wird.

Ein Zeichenelement, das `MAX` anfordert, kann daher am Ende Durchschnitte lesen, wenn seine Datei nur AVERAGE-Archive enthält. Prüfen Sie das generierte `DEF` und die Ausgabe von `rrdtool info`. Die Archivwartung kann bestehende Layouts ändern, doch das Hinzufügen eines Archivs kann historische Spitzen nicht rekonstruieren, die durch frühere Mittelwertbildung verworfen wurden. Siehe [Datenaufbewahrung verwalten](/de/guides/manage-data-retention/).

## GPRINT übernimmt das Archiv seines Nachbarn

Ein einfaches `GPRINT` besitzt kein eigenes Archiv. Es übernimmt die Konsolidierungsfunktion des letzten passenden `AREA`-, `STACK`-, Linien- oder `TICK`-Elements, zugeordnet nach Datenquellenname und lokaler Vorlagenfeld-Identität. Gibt es keinen vorherigen Treffer, nutzt es den Best-Function-Helper mit seiner eigenen konfigurierten Funktion. Feste Varianten nutzen ihre eigene konfigurierte Funktion direkt.

Das bedeutet, dass das Ändern der Elementreihenfolge in einer Diagrammvorlage die Ausgabe einer Legende verändern kann, ohne dass jemand die Legende anfasst. Platzieren Sie eine `LINE`, die `MAX` liest, über dem `GPRINT`-Block, fassen passende Legenden Maxima zusammen. Verschieben Sie sie nach unten, bestimmt stattdessen das vorherige passende Element oder der Fallback die Eingabeserie. Ändert sich eine Zahl nach einer unabhängigen Vorlagenänderung, prüfen Sie zuerst die Reihenfolge der Elemente.

## CDEFs und VDEFs

Beide transformieren Daten vor dem Zeichnen. Sie sind nicht austauschbar.

| | CDEF | VDEF |
|---|---|---|
| Erzeugt | Eine Serie, ein Wert pro Zeitschlitz | Einen Wert und für manche Funktionen eine zugehörige Zeit |
| Kann als Linie oder Fläche gezeichnet werden | Ja | Ein Skalar kann ein konstantes Niveau liefern |
| Aufgebaut aus | Funktionen, arithmetischen Operatoren, anderen CDEFs, speziellen Datenquellen, Literalen | Einer Funktion auf eine Referenz angewendet |
| Schachtelung | Ein CDEF darf ein anderes CDEF referenzieren | Ein VDEF darf keine Arithmetik enthalten |

Ein CDEF ist ein Stapelausdruck, der in umgekehrter polnischer Notation ausgewertet wird. Der Wortschatz ist umfangreich und vollständig unter [Diagrammelemente](/de/reference/graph-items/) aufgeführt: Arithmetik, Vergleichs- und Bedingungsoperatoren, Trigonometrie, Aggregation über Datenquellen, Stack-Operationen und Zeitfunktionen, die einer Definition mitteilen, wo sie auf der x-Achse liegt. `UN` und `UNKN` sollte man früh kennenlernen. Das Ersetzen unbekannter Werte durch null kann optische Lücken vermeiden, verbirgt aber fehlende Messungen; treffen Sie diese Darstellungsentscheidung bewusst.

CDEFs lesen zudem spezielle Referenzen statt fester Datenquellennamen. Eine verweist auf die Datenquelle des aktuellen Elements, wodurch ein einzelnes CDEF über jedes Element einer Vorlage hinweg wiederverwendbar wird. Andere verweisen auf alle Datenquellen des Diagramms oder auf alle gleichartigen, mit oder ohne Duplikate, wodurch eine Summenlinie entsteht, ohne ihre Eingänge namentlich zu nennen.

Ein VDEF reduziert eine Serie auf einen Skalar: Maximum, Minimum, Durchschnitt, Standardabweichung, erster, letzter Wert, Summe, ein Perzentil oder Steigung, Achsenabschnitt und Korrelation einer linearen Regression. RRDtool unterstützt keine Arithmetik innerhalb eines VDEF. Benötigt ein VDEF eine berechnete Eingabe, baut Kadupul diese auf dem CDEF des Elements statt auf der Rohdatenquelle auf. Dies ist der vorgesehene Weg für Berechnungen: Führen Sie die Mathematik in einem CDEF durch und reduzieren Sie sie anschließend in einem VDEF.

Ein durch ein VDEF gestütztes `GPRINT` erfordert kein Konsolidierungsfunktions-Argument: Das VDEF lieferte bereits die Reduktion. VDEFs können auch skalare Zeichenwerte liefern; RRDtool unterstützt eine VDEF-gestützte Linie. Siehe die vorgelagerte [Grafikelement-Dokumentation](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

Der CSV-Export wählt unterstützte Zeichentypen als Serienspalten; Legendenelemente werden nicht als gleichwertige Spalten exportiert. Im Gegensatz zu einer früheren Beschreibung überspringt der aktuelle Code VDEF-gestützte Zeichenelemente nicht generell. Er kann ein ungültiges `XPORT` eines skalaren VDEF ausgeben: Ein isolierter RRDtool-Test rendert eine VDEF-Linie erfolgreich, weist diesen Export jedoch ab. Siehe [Anwendungsfehler #273](https://github.com/kadupulhq/kadupul/issues/273). Verwenden Sie serienbasierte Zeichenelemente für den Export und prüfen Sie die erzeugten Spalten.

## Warum dieselben Daten unterschiedlich aussehen

Alles Nachfolgende verändert das Bild, ohne einen einzigen gespeicherten Messwert anzutasten.

| Auswahl | Auswirkung |
|---|---|
| Fensterlänge und Bildbreite | Kann die Archivwahl und zusätzliche Konsolidierung verändern |
| Konsolidierungsfunktion auf dem `DEF` | Liest Spitzen, Tiefstwerte, Durchschnitte oder letzte Werte |
| Eine fehlende Konsolidierungsfunktion | Einige Elementpfade substituieren eine andere Funktion; andere schlagen fehl |
| `AREA` gegenüber `STACK` | Absolute Höhen gegenüber kumulativen Höhen |
| Elementreihenfolge | Überdecken, Stapelreihenfolge und welches Archiv ein `GPRINT` übernimmt |
| Basis 1000 oder 1024 | Ändert die Achsenbeschriftung. Die Werte sind identisch |
| Autoskalierungsmodus, starre Grenzen, logarithmische Skala | Ändert die y-Achse, was die visuelle Wahrnehmung von Änderungen beeinflusst |

Weichen Diagramme voneinander ab, vergleichen Sie gerenderte Befehle, tatsächliche Dateiidentitäten und Layouts, Cache-Zustand und Messwert-Aktualität. Diese Darstellungsoptionen sind nützliche Prüfpunkte, schließen aber Erfassungs-, Speicher- oder Zuordnungsfehler nicht aus. Eine Anleitung für diesen Vorgang finden Sie unter [Fehlende Daten analysieren](/de/guides/troubleshoot-missing-data/).
