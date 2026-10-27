---
title: Das erste Diagramm lesen
description: Was die Linien tatsächlich bedeuten und die drei Fehler, die zu Fehlinterpretationen führen.
sidebar:
  order: 4
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
---

Ein Diagramm hier ist kein direktes Abbild Ihrer Rohdaten. Es zeigt eine Zusammenfassung Ihrer Daten – und zu wissen, welche Zusammenfassung vorliegt, ist entscheidend.

## Was Sie sehen

Jedes Diagramm wird aus einem Round-Robin-Archiv gezeichnet. Das Archiv speichert aktuelle Messwerte mit voller Auflösung und ältere Werte zusammengefasst in gröberen Intervallen. Wenn Sie auf ein Jahr herauszoomen, sehen Sie nicht jede Fünf-Minuten-Messung. Sie sehen einen einzelnen Wert pro Intervall, der durch eine Konsolidierungsfunktion bestimmt wurde.

Diese Funktion ist meist der Durchschnitt. Sie kann aber auch das Maximum oder das Minimum sein. Dies ist wichtiger als alles andere auf dieser Seite.

Für eine normale Diagrammanforderung auf Abruf stellt Kadupul aus der Konfiguration des Diagramms einen RRDtool-Befehl zusammen und führt ihn gegen die Dateien auf der Festplatte aus. Drei Arten von Zeilen fließen in diesen Befehl ein, und es hilft zu verstehen, welche wofür da ist.

| Teil | Aufgabe |
|---|---|
| Eine Definition | Benennt eine Datei, eine darin enthaltene Datenquelle und eine Konsolidierungsfunktion |
| Ein Zeichenelement | Wandelt eine Reihe in eine Linie, eine Fläche oder ein Band in einem Stapel um |
| Ein Legendenelement | Gibt eine Zahl aus, berechnet über das aktuell angezeigte Zeitfenster |

Der gesamte Aufbau wird in [Wie Diagramme gezeichnet werden](/de/concepts/how-graphs-are-drawn/) beschrieben. Das müssen Sie heute noch nicht im Detail wissen. Wichtig ist: Die Diagrammdefinition und der angeforderte Zeitbereich bestimmen das Bild. Caching und Echtzeit-Diagrammpfade können sich abweichend verhalten.

## Mit den letzten vier Stunden beginnen

Beginnen Sie mit einem kurzen, aktuellen Zeitfenster. Das gewählte Archiv hängt von Vorhaltezeit, Schrittweite und Diagrammauflösung ab; vier Stunden garantieren keine Roh- oder unkonsolidierten Daten. Selbst das feinste Archiv enthält zeitlich normalisierte Werte. Nutzen Sie den Debug-Befehl des Diagramms und `rrdtool info`, um die angeforderte Funktion und die verfügbaren Archivschritte zu prüfen, bevor Sie Werte vergleichen.

Zwei Besonderheiten eines neuen Diagramms sind völlig normal, beunruhigen Anwender jedoch häufig.

**Die Linie kann vor der aktuellen Zeit enden.** Das laufende Intervall ist möglicherweise noch nicht abgeschlossen. Auch Abfragezeitpunkte, Pufferung und Normalisierung können den sichtbaren Endpunkt verzögern. Achten Sie auf fortschreitende Aktualisierungszeitstempel, anstatt eine feste Verzögerung als Nachweis für ein fehlerfreies System zu werten.

**Der erste Abschnitt kann fehlen.** Eine vor einer Stunde erstellte Datenquelle enthält Daten für eine Stunde und elf Monate lang nichts. Das Archiv wird bei der Erstellung vollständig reserviert; der leere Teil ist also realer Speicherplatz, der auf seine Nutzung wartet.

## Den Bereich erweitern und Spitzenwerte beobachten

Erweitern Sie den Zeitraum auf eine Woche. Spitzenwerte können kleiner werden, wenn das Diagramm gröbere Durchschnittswerte wählt. Wenn beispielsweise die Auslastung fünf Minuten lang bei 100 % liegt und in den restlichen 55 Minuten bei null, beträgt der Stundendurchschnitt etwa 8,3 %. Ein vierminütiger Laststoß in einer ansonsten untätigen Stunde ergibt einen Durchschnitt von etwa 6,7 %. Kurze Spitzenwerte können bereits innerhalb des ursprünglichen Abtastintervalls geglättet worden sein.

Die Konsolidierung verwirft Details. Wenn der hochauflösende Verlauf abgelaufen ist, kann ein Hineinzoomen die Details aus einem Durchschnittsarchiv nicht wiederherstellen.

Dies ist der erste der drei Fehler – und derjenige, der die meisten Diskussionen auslöst.

**Einen Durchschnitt für einen Spitzenwert halten.** Wenn Sie sich für Sättigung interessieren, betrachten Sie ein Diagramm, das auf Maxima basiert, nicht auf Durchschnitten. Das funktioniert nur, wenn die Archive Maximalwerte speichern. Sind nur noch grobe Durchschnittswerte vorhanden, lassen sich die ursprünglichen Spitzenwerte nicht rekonstruieren. Ein MAX-Archiv bewahrt die Maxima seiner zeitnormalisierten Eingabewerte, keinen unbeobachteten Momentanwert zwischen zwei Abfragen.

Hier gibt es ein stilles Fehlverhalten, das man kennen sollte: Verlangt ein Diagrammelement nach Maxima und die Datei enthält keine, weicht Kadupuls Auswahllogik möglicherweise auf die erste verfügbare Funktion aus – oder auf AVERAGE, wenn die verfügbaren Funktionen nicht ermittelt werden können. Das Diagramm sieht normal aus, beantwortet aber eine andere Frage.

**Eine Lücke als Null interpretieren.** Eine Lücke stellt einen unbekannten gezeichneten Wert dar. Zu den Ursachen gehören fehlende Aktualisierungen, explizit unbekannte Eingaben, verworfene Werte und Diagrammausdrücke. Sie ist kein eindeutiger Beleg für ein unerreichbares Gerät.

Der Heartbeat ist die maximal zulässige Zeitspanne zwischen Aktualisierungen, keine zusätzliche Zeit, die zur Schrittweite addiert wird. Beispielsweise erlaubt ein 300-Sekunden-Schritt mit einem 600-Sekunden-Heartbeat höchstens 600 Sekunden zwischen zwei Aktualisierungen, nicht 900. Auch Schwellenwerte für unbekannte Daten im Archiv beeinflussen sichtbare Lücken. Siehe [RRDtools Datenquellendefinitionen](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) und [Zeit und Intervalle](/de/concepts/time-and-intervals/).

Vorsicht bei gestapelten Diagrammen: Manche Vorlagen ersetzen in ihren Diagrammausdrücken unbekannte Werte durch Null. In solchen Diagrammen sehen ein Ausfall und eine Leerlaufphase konstruktionsbedingt identisch aus. Prüfen Sie eine ungestapelte Ansicht, bevor Sie schlussfolgern, dass ein Dienst inaktiv war.

**Zwei Diagramme mit unterschiedlichen vertikalen Skalen vergleichen.** Zwei nebeneinanderliegende Diagramme skalieren jeweils auf ihre eigenen Daten. Ein kleiner Anstieg und ein großer können optisch identisch wirken. Prüfen Sie die Achse, bevor Sie Schlüsse ziehen.

Prüfen Sie beim Blick auf die Achse auch deren Basis. Ein Diagramm kann Werte in Tausendern oder in Einheiten von 1024 beschriften. Die gespeicherten Zahlen sind identisch; nur die Beschriftung ändert sich. Der Unterschied hängt vom Präfix ab: 1024 gegenüber 1000 macht bei der ersten Potenz 2,4 % aus und wächst bei größeren Präfixen. Prüfen Sie auch Bits gegenüber Bytes, Diagrammausdrücke und Konsolidierung; ein prozentualer Unterschied allein erklärt die Ursache nicht.

## Die Legende lesen

Die Legende enthält Zahlen, die wichtiger sind als der optische Kurvenverlauf. „Aktuell“ ist im Normalfall die LAST-Reduktion der gewählten Reihe, die keine Messung zum exakten Zeitpunkt der Diagrammbetrachtung sein muss. Durchschnitt und Maximum werden über das aktuell betrachtete Zeitfenster berechnet, nicht über die gesamte Zeit, sodass sie sich beim Zoomen ändern.

Die standardmäßig bereitgestellten Legendeneinträge sind Minimum, Maximum, Durchschnitt und Letzter, welcher als aktuell bezeichnet wird. Zwei Punkte daran überraschen Anwender häufig.

**Eine Legendenzahl ist eine Reduktion des Gezeichneten, nicht des Gespeicherten.** Ein über einer mit Durchschnitten gelesenen Reihe ausgegebenes Maximum ist ein Maximum dieser abgeleiteten Durchschnitte bei der gewählten Auflösung. Es ist nicht der größte Messwert, der jemals erfasst wurde. Auf einer stark ausgelasteten Leitung sind dies völlig unterschiedliche Zahlen, und beide sind legitime Antworten auf unterschiedliche Fragen.

**Prüfen Sie, welche Reihe die Legende verwendet.** Einfache GPRINT-Einträge können die Reihe eines vorangegangenen Zeichenelements übernehmen; dedizierte Minimum-, Maximum-, Durchschnitts- und Letzter-Elemente werden separat verarbeitet. Eine Änderung der Elementreihenfolge in einer Diagrammvorlage kann daher die Angaben in der Legende verändern, ohne dass jemand die Legende selbst bearbeitet hat. Ändert sich ein Wert nach einer unzusammenhängenden Vorlagenänderung, prüfen Sie zuerst die Reihenfolge der Elemente.

## Wenn ein Diagramm fehlerhaft aussieht

Prüfen Sie die Erfassungskette in dieser Reihenfolge; Fehler können auf mehreren Stufen vorliegen.

1. Antwortet das Gerät im Moment?
2. Läuft der Poller und wird er innerhalb seines Intervalls fertig?
3. Weist die RRD-Datei eine aktuelle Aktualisierungszeit auf?
4. Liest das Diagramm die Datenquelle, die Sie vermuten?

Konkret:

**Schritt 1.** Führen Sie denselben `snmpget`-Befehl wie beim Hinzufügen des Geräts vom zugewiesenen Kollektor aus. Schlägt dies fehl, beheben Sie zuerst diesen Erfassungsfehler, bevor Sie das Diagramm beurteilen.

**Schritt 2.** Suchen Sie nach der Zusammenfassung am Ende des Durchlaufs. Fehlt sie, prüfen Sie den Zeitplaner, das konfigurierte Protokollziel und vorzeitige Poller-Abbrüche. Ein Durchlauf, der länger als das Intervall dauert, kann Aktualisierungen verzögern; vergleichen Sie die resultierende Aktualisierungslücke mit dem Heartbeat.

**Schritt 3.** Fragen Sie RRDtool direkt ab:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` gibt den Zeitstempel der letzten Aktualisierung aus, einschließlich solcher mit unbekannten Werten; gepufferte Schreibvorgänge können dies verzögern. Verwenden Sie `lastupdate` und `fetch`, um Werte wie in der Geräteanleitung beschrieben zu prüfen. `info` nennt Schrittweite, Heartbeat, Datenquellentyp und vorhandene Archive. Fehlt in der Datei ein Archiv für Maximalwerte, klärt dies die oben beschriebene Frage nach den Spitzenwerten.

**Schritt 4.** Schalten Sie den Diagramm-Debug-Modus ein und lesen Sie den Befehl, den das Diagramm erzeugt. Er nennt die Dateien, die Datenquellen darin und die jeweilige Konsolidierungsfunktion. Dass ein Diagramm auf eine andere als die vermutete Datenquelle verweist, kommt häufig vor, nachdem Vorlagen erneut angewendet oder Schnittstellen neu indiziert wurden.

## Symptome und ihre typische Bedeutung

| Erscheinungsbild | Typische Ursache |
|---|---|
| Flache Linie bei Null | Kann eine echte Null sein oder ein Ausdruck, der Unbekannt durch Null ersetzt |
| Linie bricht ab und setzt sich fort | Ein unbekannter Wert hat die gezeichnete Reihe unterbrochen; Erfassung und Diagrammausdrücke prüfen |
| Durchgehend kleine Lücken | Poller wird zu spät fertig oder Heartbeat ist zu nah an der Schrittweite eingestellt |
| Spitze bei vier Stunden sichtbar, bei einer Woche fehlend | Archivauflösung und Konsolidierung prüfen, bevor Datenverlust oder ein Erfassungsfehler angenommen wird |
| Legendenmaximum niedriger als die gezeichnete Spitze | Die Legende reduziert eine andere Reihe als angenommen |
| Gesamtes Diagramm leer, kein Fehler | Keine Datenquelle hinterlegt oder noch keine Daten erfasst |
| Werte um Größenordnungen daneben | Falscher Datenquellentyp oder Überlauf von 32-Bit-Zählern |
| Zwei Diagramme desselben Links weichen leicht voneinander ab | Unterschiedliche Achsenbasis oder unterschiedliche Konsolidierung |

[Fehlende Daten analysieren](/de/guides/troubleshoot-missing-data/) vertieft diesen Weg. [Erscheinungsbild von Diagrammen anpassen](/de/guides/tune-graph-appearance/) beschreibt, wie Sie das Aussehen eines Diagramms anpassen, sobald Sie seinen Angaben vertrauen.

Damit ist die Einführung abgeschlossen. Sie verfügen über eine funktionierende Installation, ein antwortendes Gerät und ein verständliches Diagramm. Von hier aus behandeln [Praxisanleitungen](/de/guides/monitor-a-switch/) konkrete Aufgaben, und [Konzepte](/de/concepts/architecture/) erklären die Funktionsweise des Systems im Hintergrund.
