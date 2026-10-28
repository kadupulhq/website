---
title: Datenabfragen und Indizes
description: Wie aus einem Durchlauf eines Geräts viele Datenquellen werden, was ein Index wirklich ist und was passiert, wenn sich ein Gerät neu nummeriert.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 5
---

Eine einfache Datenquelle erfordert, dass Sie vor der Konfiguration wissen, was
Sie messen möchten. Für die Systemlast funktioniert das. Für Switch-Ports,
Festplatten, Temperatursensoren oder virtuelle Maschinen funktioniert das nicht,
da sich die Liste ändert und Sie sie nicht kontrollieren.

Eine Datenabfrage erkennt die verfügbaren Objekte. Die Grapherstellung – entweder
manuell oder über konfigurierte Automatisierung – wählt aus, welche Objekte
Datenquellen erhalten; ein Abfragedurchlauf allein erstellt nicht jeden
möglichen Graphen.

## Was eine Abfragedefinition enthält

Eine Datenabfrage ist eine XML-Beschreibung mit drei Teilen: wo die Liste der Dinge
liegt, was über jedes einzelne gelesen werden soll und wie entschieden wird, welches
Ding welches ist.

Die mit Kadupul mitgelieferte Schnittstellenabfrage ist das durchgearbeitete Beispiel.
Sie durchläuft `.1.3.6.1.2.1.2.2.1.1`, um Schnittstellen aufzuzählen, und liest dann
an jeder zurückgegebenen Position eine Reihe benannter Felder. Jedes Feld deklariert
eine Richtung.

| Richtung | Bedeutung | Schnittstellenbeispiele |
|---|---|---|
| `input` | Gelesen zur Identifikation und Benennung. Wird nicht über die Zeit gesammelt | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Ein Wert, der in jedem Zyklus gesammelt werden sollte | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Beides | `ifOperStatus`, `ifAdminStatus` |

Felder deklarieren auch, wie der Wert gelesen werden soll. Die meisten übernehmen ihn
wörtlich; einige wenden einen regulären Ausdruck an, um eine Zahl aus einer
SNMP-Aufzählung zu extrahieren, und andere verlangen, dass der Wert als Text statt als
Rohbytes decodiert wird.

Das Ausführen der Abfrage speichert eine Zeile pro Index und Feld: das Gerät, die Abfrage,
den Feldnamen, den Wert und die Position, von der der Wert stammt. Diese Tabelle ist die
Antwort auf die Frage „Was hat dieses Gerät?“, zwischengespeichert bis zum nächsten Durchlauf.
Die Graphauswahl verwendet diesen Cache, aber Werkzeuge zur Grapherstellung können eine
Abfrage auch anhängen oder erneut ausführen. Überprüfen Sie die Erkennungsergebnisse,
bevor Sie Graphen hinzufügen.

## Der Index ist ein Identitätsproblem

Die Position in einer SNMP-Tabelle ist kein Name. Es ist eine Steckplatznummer, die der
Agent vergibt, und Agenten ordnen Steckplätze nach einem Neustart, dem Wiedereinsetzen einer
Karte, einem Firmware-Upgrade oder einer Konfigurationsänderung, die eine Schnittstelle
entfernt, neu an. Wenn sich eine Datenquelle nur an „Steckplatz 3“ erinnert, wird an dem Tag,
an dem Steckplatz 3 zu einem anderen Port wird, eine dreimonatige Historie stillschweigend
an das falsche Objekt angehängt.

Kadupul speichert den Indextyp und den identifizierenden Wert zusammen mit dem aktuell
aufgelösten SNMP-Index. Die Neuindizierung verwendet die Identität, um die aktuelle
Tabellenposition nachzuschlagen; manuell überschriebene Indextypen werden separat behandelt.

Bei jedem Durchlauf der Abfrage wird der aktuelle Steckplatz für diesen Feldwert nachgeschlagen.

| Ergebnis | Was passiert |
|---|---|
| Gleicher Steckplatz | Nichts zu tun |
| Anderer Steckplatz | Die Datenquelle wird dem neuen Steckplatz neu zugeordnet und ihre Graphen folgen |
| Wert nicht mehr vorhanden | Die Behandlung verwaister Einträge hängt von der Abfrage und dem Codepfad ab; überprüfen Sie das resultierende Flag und die Polling-OIDs, anstatt anzunehmen, dass die Erfassung gestoppt wurde |

Die Neuindizierung behält normalerweise die Datenquelle und ihren bisherigen Verlauf bei.
Die Option `index_transient` behandelt fehlende Identitäten als erwartet und überspringt
die normale Kennzeichnung als verwaist. `index_orphan_removal` entfernt betroffene
Polling-Einträge und die Boost-Ausgabe; die Datenquelle oder die RRD-Datei selbst wird
dabei nicht gelöscht.

Die derzeitige Behandlung verwaister Einträge weist einen Fehler auf: Wenn eine Identität
verschwindet und keine andere Quelle den Index ändert, kann der Zweig ohne Änderung das
Verwaist-Flag wieder löschen, während der vorherige Index und die Polling-OIDs bestehen
bleiben. Verlassen Sie sich nicht auf die automatische Verwaist-Maskierung, um die Erfassung
von einem wiederverwendeten Port-Index zu verhindern. Überprüfen Sie die gespeicherte Identität
mit den Erkennungsdaten und deaktivieren Sie die betroffene Datenquelle, bis das Problem behoben ist.

## Auswahl des Feldes als Schlüssel

Nicht jedes Feld eignet sich als Schlüssel. Die Abfragedefinition liefert eine geordnete
Präferenzliste, die Kadupul durchläuft und den ersten Kandidaten auswählt, der eine Reihe von
Prüfungen besteht.

| Prüfung | Warum sie existiert |
|---|---|
| Das Feld ist `input` oder `input-output` | Identifizierende Felder müssen bei der Erkennung verfügbar sein |
| Keine zwei Indizes teilen sich denselben Wert | Ein doppelter Schlüssel kann keine eindeutige Zeile identifizieren |
| Die Anzahl eindeutiger Werte entspricht der Anzahl der Indizes | Verwirft eine unvollständige Abdeckung der Kandidaten |

Diese Prüfungen haben Ausnahmen: Ein einzelner deklarierter Kandidat wird direkt
zurückgegeben, und die rohe Index-OID wird separat akzeptiert. `index_type=nonunique`
überspringt die Duplikatabweisung, überspringt jedoch nicht die Prüfung der Anzahl eindeutiger
Werte. Überprüfen Sie das ausgewählte Feld und die zwischengespeicherten Werte; die
XML-Typbezeichnung allein ist kein Beweis für eine erfolgreiche Validierung.

Die Schnittstellenabfrage bevorzugt `ifName`, dann `ifDescr`, dann die Hardwareadresse,
dann den rohen Index. Diese Reihenfolge ist bewusst gewählt. `ifName` ist auf den meisten
Plattformen kurz und stabil. `ifDescr` ist stabil, enthält jedoch manchmal die Steckplatznummer
im Text, was den Zweck zunichte macht. Der rohe Index steht an letzter Stelle, weil ein Schlüssel
darauf kaum besser ist als gar kein Schlüssel.

Hier ist der Punkt, der Anwender oft überrascht. Die Wahl wird pro Gerät und Durchlauf aus den
aktuellen Daten dieses Geräts getroffen. Fehlende zwischengespeicherte Werte oder doppelte Namen
können `ifName` ungeeignet machen und einen Rückfall auf `ifDescr` erzwingen. Ein leeres Feld
belegt für sich genommen nicht, welche Prüfung fehlgeschlagen ist; untersuchen Sie die
tatsächlichen Erkennungszeilen. Zwei identische Switches können letztendlich nach unterschiedlichen
Feldern indiziert werden, und ein Gerät kann zwischen Durchläufen das verwendete Feld wechseln.
Kadupul protokolliert eine Warnung, wenn sich das gewählte Feld ändert, da dies der Moment ist,
in dem Neuzuordnungsfehler möglich werden.

Das gewählte Feld benennt normalerweise auch die Graphen über ein Titelformat, das darauf
verweist. Wenn sich der Charakter Ihrer Graphentitel in der Flotte ändert, ist das Sortierfeld
der Ort, an dem Sie suchen sollten.

## Erkennen, dass eine Neuindizierung erforderlich ist

Das wiederholte Ausführen einer Datenabfrage für jedes Gerät in jedem Zyklus wäre teuer und
größtenteils zwecklos, da die meisten Geräte über Jahre hinweg nichts umnummerieren. Stattdessen
trägt jedes Paar aus Gerät und Abfrage eine Neuindizierungsmethode, die eine günstige Assertion
darstellt und während der normalen Erfassung geprüft wird. Wenn die Assertion fehlschlägt, wird
eine Neuindizierung in die Warteschlange gestellt.

| Methode | Was sie prüft | Grenzen und Kosten |
|---|---|---|
| Keine | Keine automatische Assertion | Erneute Abfragedurchläufe müssen manuell oder durch eine andere explizite Aktion angestoßen werden |
| Uptime | Uptime ist nicht zurückgegangen | Erfordert nutzbares SNMP; übersieht Änderungen ohne Uptime-Rollback |
| Indexanzahl | Aktuelle Anzahl stimmt mit zwischengespeicherten Indizes überein | Eine Zähl-OID kann günstig sein; ohne diese zählt die Implementierung ein Walk- oder Skriptergebnis. Änderungen bei gleichbleibender Anzahl können übersehen werden |
| Alle prüfen | Bekannte Schlüsselwerte stimmen an ihren zwischengespeicherten Indizes weiterhin überein | Der Aufwand wächst mit der zwischengespeicherten Menge; garantiert nicht die Erkennung neu hinzugefügter Indizes oder semantischer Änderungen, die diese Werte beibehalten |

„Alle prüfen“ überprüft Assertionen während des Pollings; es führt nicht bedingungslos die
gesamte Erkennungsabfrage in jedem Zyklus erneut aus. Messen Sie die Kosten auf repräsentativen
Geräten vor dem breiten Einsatz. Uptime ist ein üblicher Standardwert, bietet jedoch keine
Assertion, wenn SNMP deaktiviert ist. Die Abfragedefinition kann eine eigene Uptime- oder Zählquelle bereitstellen.

## Die Neuindizierung erfolgt asynchron

Eine fehlgeschlagene Assertion führt nicht sofort zur Neuindizierung. Sie schreibt einen Befehl,
und ein separater Durchlauf nach dem Erfassungszyklus nimmt diesen Befehl auf und führt die
Abfrage erneut aus. Die praktischen Auswirkungen sollte man im Gedächtnis behalten.

Der erkennende Zyklus kann weiterhin den alten Cache verwenden, sodass ein Wert vor Abschluss
der Neuindizierung auf der falschen Reihe landen kann. Die Uptime-bezogene Spitzenunterdrückung
ersetzt die Einzelausgabe durch Unbekannt, wenn ihr Flag gesetzt ist; sie ist keine Garantie
für alle Mehrwertausgaben oder jede Indexänderung.

Eine Neuindizierung wird nicht für ein Gerät ausgeführt, das ausgefallen oder deaktiviert ist.
Ein Gerät, das während der Unerreichbarkeit umnummeriert wurde, benötigt nach Wiedererreichbarkeit
immer noch eine Assertion oder einen expliziten erneuten Durchlauf. Der erste erfolgreiche Polling-Durchlauf
allein beweist nicht, dass die Neuzuordnung abgeschlossen ist. `--force` setzt die Prüfungen
auf Ausfall/Deaktivierung nicht außer Kraft.

Sobald die Abfrage erneut ausgeführt wird, werden für die verschobenen Datenquellen ihre
Poller-Cache-Einträge neu geschrieben, was die Erfassung tatsächlich umleitet. Dieser Mechanismus
ist [Der Poller-Cache](/de/concepts/the-poller-cache/), und ein erneuter Abfragedurchlauf ist
eines der wenigen Dinge, die ihn automatisch pflegen.

Für die operative Seite – das Hinzufügen einer Abfrage zu einem Gerät und das Lesen der Ergebnisse –
siehe [Einen Switch überwachen](/de/guides/monitor-a-switch/).
