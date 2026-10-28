---
title: Umgebungssensoren überwachen
description: Zeichnen Sie Temperatur, Luftfeuchtigkeit, Luftstrom, Leistung und USV-Status über SNMP auf, finden Sie die richtigen OIDs in einer Hersteller-MIB und geben Sie den Messwerten Diagrammeinstellungen, die zu einer Messung statt zu einem Zähler passen.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Überprüfung durch einen muttersprachlichen Sprecher wartet.
sidebar:
  order: 23
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor Sie sich
darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Temperatur, Luftfeuchtigkeit und Momentanleistung sind Messwerte, die üblicherweise als
`GAUGE` gespeichert werden. Kumulative Energie- oder Ereignissummen erfordern stattdessen möglicherweise einen Zählertyp.
Prüfen Sie Einheiten, Identität und Semantik jedes Objekts, bevor Sie eine Vorlage auswählen.

Prüfen Sie, was bereits mitgeliefert wird, bevor Sie etwas selbst schreiben.

## Was mitgeliefert wird

Nur vier Datenabfragedefinitionen befinden sich im eigenen Abfrageverzeichnis des Quellbaums,
und keine davon betrifft die Umgebung.

| Mitgelieferte SNMP-Abfrage | Deckt ab |
|---|---|
| `interface.xml` | Netzwerkschnittstellen |
| `host_disk.xml` | Host Resources-Speicher |
| `net-snmp_disk.xml` | In UCD deklarierte Partitionen |
| `net-snmp_devio.xml` | UCD-Blockgeräte-I/O |

Die Sensorabdeckung wird auf zwei anderen Wegen bereitgestellt.

**Script-Server-Abfragen, gebündelt im Net-SNMP-Gerätepaket.** Importieren Sie
`install/templates/NetSNMP_Device.xml.gz`, um die drei lmSensors-Abfrage-XML-Dateien
unter `resource/script_server/` bereitzustellen. Das Hilfsskript
`scripts/ss_netsnmp_lmsensors.php` existiert ebenfalls im Quellcode-Checkout.

| Abfrage | Tabelle |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Das Hilfsskript verwendet Index-, Namens- und Messwertspalten. Die Abfrage indiziert nach numerischem
`sensorDevice`; `sensorName` liefert einen Anzeigenamen, den das Hilfsskript auf
18 Zeichen kürzt. Namen sind keine garantierten eindeutigen Sensoridentitäten.

Der normale `get sensorReading`-Pfad gibt Rohwerte zurück: Milligrad für das ältere
Temperaturobjekt, Millivolt für Spannung und U/min für Lüfter. Das thermische Diagramm
wendet eine `Divide by 1000`-CDEF an. Das Spannungsdiagramm hat trotz seiner Volts-Beschriftung
keine CDEF, ein [bestätigter Skalierungsfehler](https://github.com/kadupulhq/kadupul/issues/247).

Der separate `query sensorReading`-Pfad skaliert Temperatur und Spannung und versucht
eine vorzeichenbehaftete Spannungskonvertierung unter Verwendung der falschen Konstante 4294967294. Er kann außerdem
[bei nicht verfügbaren Messwerten eine Ausnahme auslösen](https://github.com/kadupulhq/kadupul/issues/248).
Leiten Sie keine gespeicherten Einheiten aus dieser Erkennungsausgabe ab.

Das Hilfsskript verwendet weiterhin die veraltete Temperaturspalte `.2.1.3`. Die aktuelle Upstream-Version
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
stuft dieses vorzeichenlose Objekt zugunsten der vorzeichenbehafteten Spalte `.2.1.4` als veraltet ein; überprüfen Sie
die Unterstützung und das Verhalten bei negativen Temperaturen auf dem eigentlichen Agenten, bevor Sie eine Vorlage anpassen.

**Gerätepakete, bereitgestellt als importierbare Archive.** Mehrere bringen ihr eigenes
Abfrage-XML mit und schreiben es beim Import in die Abfrageverzeichnisse. Die hier relevanten:

| Paket | Bringt mit |
|---|---|
| SNMP UPS | UPS-MIB-Eingangs- und Ausgangsleitungsabfragen sowie Vorlagen mit fester OID für Batterie, Laufzeit, Temperatur und Alarme |
| AKCP Device | Skriptabfragen für Temperatur-, Feuchtigkeits-, Luftstrom- und 4-20-mA-Sensoren |
| APC InfraStruXure PDU | Abfragen für Schutzschalter- und Phasenstatistiken |
| APC InfraStruXure InRow CRAC | Abfragen für Geräte- und Gruppenstatistiken, einschließlich Temperaturen, Luftfeuchtigkeit, Luftstrom und Lüfterdrehzahl |
| BayTech PDU | Eine Steckdosenabfrage und eine Dreiphasen-Stromkreisabfrage mit Strom, Spannung, Leistung und Temperatur |

Prüfen Sie das passende Paket, bevor Sie eine Abfrage von Hand schreiben. Befolgen Sie
[Vorlagen importieren und exportieren](/de/guides/import-and-export-templates/), überprüfen Sie die Dateibereitstellung
und die Erkennung und erstellen Sie die gewünschten Diagramme dann explizit. Das Vorhandensein eines Pakets
beweist weder Gerätekompatibilität noch korrekte Skalierung; die unten genannten USV- und
lmSensors-Mängel erfordern Aufmerksamkeit.

## Die zwei Formen eines Sensors

Unterscheiden Sie bei der SNMP-Erfassung skalare Objekte von indizierten Tabelleninstanzen.

**Eine feste OID.** Ein skalarer Wert an einer Adresse, dieselbe Adresse auf jedem
Gerät dieses Typs. Batterietemperatur. Gesamtausgangsleistung. Verwenden Sie eine Datenquelle mit fester OID:
ein SNMP-Get auf eine literale OID und eine Datenquelle pro Messwert.

**Eine Tabelle.** Eine unbekannte Anzahl von Messwerten, die pro Gerät ermittelt werden. Rack-Fühler,
Steckdosenleisten, Messungen pro Phase. Verwenden Sie eine Datenabfrage, die die Tabelle durchläuft,
den Index lernt und Sie auswählen lässt, welche Zeilen zu Diagrammen werden.

Das mitgelieferte USV-Paket verwendet beides. Folgen Sie der Objektstruktur der MIB: Ein Gerät
mit nur einem Stromfühler kann diesen dennoch als indizierte Tabellenzeile bereitstellen.

| USV-Messwert | Form | OID |
|---|---|---|
| Batterietemperatur | Fest | `.1.3.6.1.2.1.33.1.2.7.0` |
| Geschätzte verbleibende Laufzeit | Fest | `.1.3.6.1.2.1.33.1.2.3.0` |
| Zeit auf Batterie | Fest | `.1.3.6.1.2.1.33.1.2.2.0` |
| Batteriespannung | Fest | `.1.3.6.1.2.1.33.1.2.5.0` |
| Vorhandene Alarme | Fest | `.1.3.6.1.2.1.33.1.6.1.0` |
| Eingangsspannung, Strom, Leistung, Frequenz | Abfrage | `.1.3.6.1.2.1.33.1.3.3.1` |
| Ausgangsspannung, Strom, Leistung, Last | Abfrage | `.1.3.6.1.2.1.33.1.4.4.1` |

Jede dieser Datenquellen ist ein `GAUGE`. Keine ist ein Zähler. Das mitgelieferte
Vorlagenarchiv deklariert einen 60-Sekunden-Schritt und einen 600-Sekunden-Heartbeat, ein Minimum von
null und kein Maximum, mit Ausnahme der Temperatur, die kein Minimum hat. Überprüfen Sie das importierte
Profil und die tatsächliche RRD-Konfiguration; diese Deklarationen legen die laufende Abfragetaktung
nicht verbindlich fest. Ein gültiger negativer Messwert benötigt außerdem eine Diagrammachse, die ihn darstellt.

## Die OIDs finden

Führen Sie einen Walk auf dem Gerät aus, bevor Sie etwas schreiben. Sie suchen nach drei Dingen: einer
Tabelle mit Messwerten, einer parallelen Tabelle mit Beschriftungen und dem Multiplikator, den der
Hersteller gewählt hat, sowie nach Gültigkeits-/Statusobjekten, sofern verfügbar.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Ersetzen Sie Beispiel-Host und -Community durch konfigurierte Werte und führen Sie Tests vom Poller aus.
Laden Sie die passende MIB und deren Abhängigkeiten, um Namen, Einheiten und Semantik zu prüfen;
auch die Objektdokumentation des Herstellers kann numerische OIDs erklären. Ein nahegelegener
Schwellenwert oder Statuscode ist nicht mit einem Messwert austauschbar.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

In der MIB-Definition ist die Skalierung dokumentiert. Ein Hersteller, der Zehntelgrade
meldet, gibt dies in der Beschreibung oder der Einheitenklausel des Objekts und in der zugehörigen
Herstellerdokumentation an. Das Raten anhand eines einzelnen Messwerts kann 23,5 Grad
in ein Diagramm von 235 verwandeln.

Standard-MIBs decken mehr ab, als viele erwarten. UPS-MIB unter `.1.3.6.1.2.1.33` ist
herstellerübergreifend generisch. ENTITY-SENSOR-MIB liefert einen Sensorwert mit eigenen
Skalierungs- und Genauigkeitsfeldern daneben. Suchen Sie nach diesen, bevor Sie zu einem
Enterprise-Teilbaum greifen.

Vergleichen Sie die Erkennung über repräsentative Neustarts und Sondenwechsel in einer Testinstallation.
Zwei unveränderte Walks allein beweisen keine Indexstabilität. Erfassen Sie stabile
Sensoridentitäten, wo verfügbar, bevor Sie langlebige Diagramme erstellen.

## Eine Datenquelle mit fester OID erstellen

Ein Sensor mit fester OID benötigt eine Datenvorlage, die den SNMP-Get-Dateneingang verwendet, mit der
OID als Literalwert und einem Datenquellenelement darin. Setzen Sie den Typ auf `GAUGE`,
geben Sie dem Minimum nur dann einen realen Wert, wenn der Sensor diesen tatsächlich nicht unterschreiten kann,
und lassen Sie das Maximum undefiniert, es sei denn, der Hersteller dokumentiert eine Obergrenze.

Werte außerhalb der RRD-Datenquellengrenzen werden als unbekannt eingestuft. Legen Sie diese Grenzen in den
gespeicherten Roheinheiten fest, nicht in den umgerechneten Einheiten des Diagramms; andernfalls können gültige
Messwerte verloren gehen, bevor eine Anzeige-CDEF angewendet wird.

## Eine Datenabfrage erstellen

Eine Abfrage benötigt eine Index-OID, eine Methode, um jede abgefragte OID in einen Index umzuwandeln, und ein
Feld pro gewünschter Spalte.

Die USV-Ausgangsabfrage ist ein kurzes Praxisbeispiel. Sie indiziert auf die Leitungstabelle,
parst den Index am Ende jeder zurückgegebenen OID mit einem regulären Ausdruck und
deklariert ein Eingabefeld für den Index und vier Ausgabefelder für Spannung,
Strom, Leistung und Last. Ausgabedefinitionen umfassen Methode, Quelle, Richtung und
Spalten-OID. Eine Spalten-OID kann eine gültige Index-Walk-Wurzel sein; die Übereinstimmung zwischen dem
Parser der Abfrage und den tatsächlich zurückgegebenen OIDs ist entscheidend. Siehe [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/) dafür, wie
der Index ausgewählt und gespeichert wird.

Wählen Sie eine Reindex-Methode wohlüberlegt aus. Die Optionen sind: Keine, bei rückläufiger Betriebszeit,
bei Änderung der Indexanzahl und Alle Felder überprüfen. Sensortabellen sind der Fall,
in dem schwächere Methoden versagen: Zieht man eine Sonde aus einer Rack-Einheit und steckt eine andere ein,
ändert sich die Anzahl möglicherweise nicht, während jeder Messwert hinter dem Index nun zu einem
anderen Sensor gehört. Eine vollständige Überprüfung verursacht bei jedem Zyklus SNMP-Aufwand.
Überprüfen Sie, welche Identitätsfelder die Abfrage prüfen kann: Unveränderte numerische
Indizes oder doppelte/abgeschnittene Bezeichnungen können nicht beweisen, dass eine physische Sonde dieselbe ist.
Aktualisieren Sie die Erkennung und überprüfen Sie die Diagrammzuordnungen nach einem Austausch.

## Den Wert skalieren

Entscheiden Sie, wo die Umrechnung stattfindet, und platzieren Sie sie nur an einer einzigen Stelle.

| Wo | Wann zu verwenden |
|---|---|
| Im Erfassungsskript | Verwenden Sie einen dokumentierten Kollektorvertrag; lmSensors get gibt derzeit Roheinheiten zurück |
| In einer CDEF auf dem Diagrammelement | Der Rohwert ist es wert, gespeichert zu werden, und die Anzeigeeinheit ist eine Frage der Darstellung |

Eine CDEF ist die übliche Antwort auf einen Herstellermultiplikator. Die mitgelieferten Pakete enthalten
Definitionen wie `Divide By 10`, aufgebaut aus der aktuellen Datenquelle, `10` und
Division. Wenden Sie diese nur auf Objekte mit der entsprechenden Roheinheit an.

Das USV-Paket enthält [falsche Leistungs- und Zeit-CDEFs](https://github.com/kadupulhq/kadupul/issues/249):
Seine On Battery-Reihe teilt Sekunden durch 6000 statt durch 60, und die Eingangs-/Ausgangs-Watts-Reihen
teilen Watt durch 10. Für einen konformen Agenten sollten 600 Sekunden als 10 Minuten und 1000 Watt als
1000 Watt angezeigt werden. Batteriespannung und Leitungsstrom erfordern tatsächlich eine Division durch 10;
die geschätzte Laufzeit liegt bereits in Minuten vor. Siehe
[die USV-Objekteinheiten von RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Das Speichern des Rohwerts und das Dividieren auf dem Diagramm hält die RRD-Datei unverfälscht und
ermöglicht es Ihnen, einen Anzeigemultiplikator zu korrigieren, ohne den Rohdatenverlauf neu schreiben zu müssen,
sofern die Abtastwerte die Datenquellengrenzen und die Aufbewahrungsfristen überstanden haben. Eine kollektorseitige Konvertierung
ändert die gespeicherte Einheit und kann Genauigkeit einbüßen; dokumentieren Sie dies. Unerklärte Rohwerte
sollten nicht als verifizierte technische Einheit dargestellt werden.

Wenden Sie die Umrechnung nicht doppelt an. Eine CDEF auf einem Diagramm, dessen Skript den Wert bereits
skaliert hat, kann einen plausiblen, aber falschen Messwert erzeugen.

## Diagrammeinstellungen wählen, die zu einer Messung passen

Wählen Sie Einstellungen für die Messung, anstatt blind Vorgabewerte für Datenverkehr zu kopieren.

| Einstellung | Datenverkehr | Sensor |
|---|---|---|
| Datentyp | `COUNTER` | `GAUGE` |
| Basiswert | 1000, damit die Achse in k und M liest | Weiterhin 1000, aber das Präfix ist bei Grad bedeutungslos |
| Automatische Skalierung | Erwünscht, da der Bereich unbekannt ist | Meist unerwünscht, da der Bereich bekannt ist |
| Oberer und unterer Grenzwert | Abhängig vom Autoskalierungsmodus | Wählen Sie einen sinnvollen sichtbaren Bereich |

Legen Sie einen expliziten oberen und unteren Grenzwert sowie eine vertikale Beschriftung fest, die die reale
Einheit benennt. Das mitgelieferte USV-Temperaturdiagramm tut dies: eine untere Grenze von 0, eine obere
Grenze von 100 und `C` als vertikale Beschriftung.

Die Option zur automatischen Skalierung ist eine Reihe von Auswahlmöglichkeiten, kein Schalter. Diejenige, die
das mitgelieferte Temperaturdiagramm verwendet, übergibt eine untere Grenze mit `--alt-autoscale-max`; sie
übergibt nicht die gespeicherte Obergrenze von 100. Ohne starre Grenzen kann ein außerhalb des Bereichs liegender
Messwert eine übergebene Grenze erweitern. Ein konfigurierter Grenzwert ist nicht automatisch fixiert.
Wählen Sie die Variante, die die für Sie wichtige Grenze beibehält:

| Option | Wirkung |
|---|---|
| Automatische Skalierung ignoriert Grenzen | Beide Enden gleiten. Verwenden, wenn Sie keine Vorstellung vom Bereich haben |
| Automatische Skalierung akzeptiert untere Grenze | Übergibt die untere Grenze; Maximum folgt den Daten |
| Automatische Skalierung akzeptiert obere Grenze | Übergibt die obere Grenze; Minimum folgt den Daten |
| Automatische Skalierung mit beiden Grenzen | Übergibt beide Grenzen; Erweiterung hängt weiterhin vom Rigid-Modus ab |

Es gibt auch eine Option für starre Grenzen (Rigid boundaries), die verhindert, dass sich die Achse ausdehnt, wenn ein
Wert außerhalb der festgelegten Grenzen fällt. Aktivieren Sie diese, wenn eine feste Achse wichtiger ist
als das Erkennen der Abweichung, und lassen Sie sie deaktiviert, wenn dies nicht der Fall ist, da ein starres
Diagramm eine Abweichung außerhalb des angezeigten Bereichs abschneiden kann. Dies löscht den gespeicherten
Abtastwert nicht. Siehe die [RRDtool-Diagrammgrenzen-Referenz](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Für Grad oder Prozent, bei denen SI-Präfixe Leser verwirren würden, ziehen Sie einen Einheitenexponenten von 0 in Betracht.
Die Basis 1000 steuert Präfixschritte; sie deaktiviert Präfixe nicht selbst und rechnet keine Maßeinheiten um.

### Konsolidierung ist hier wichtiger als beim Datenverkehr

Ein über eine Stunde gemittelter Schnittstellenzähler sagt immer noch grob aus, was passiert ist.
Eine über eine Stunde gemittelte Temperatur verbirgt die zehnminütige Abweichung, auf die es ankam.
Stellen Sie sicher, dass das Speicherprofil hinter diesen Datenquellen ein `MAX`-Archiv vorhält,
und konfigurieren Sie die geplottete Reihe so, dass sie die entsprechende `MAX`-Konsolidierung liest.
Ein Legenden-Maximum über einer `AVERAGE`-Reihe stellt den ursprünglichen Spitzenwert nicht wieder her.

Selbst ein MAX-Archiv bewahrt nur Spitzenwerte, die in erfassten Stichproben vorhanden sind; es
kann keine Abweichung zwischen Abfragezyklen oder vor der Speicherung abgewiesene Werte wiederherstellen. Siehe
[Datenaufbewahrung verwalten](/de/guides/manage-data-retention/) und
[Datenquellen und Archive](/de/concepts/data-sources-and-rras/).

## Wenn es keine nutzbare MIB gibt

Viele Umweltgeräte kommunizieren über Modbus, ein serielles Protokoll oder eine HTTP-API,
und ihr SNMP-Agent liefert nichts Brauchbares. Diese erfordern eine Skript-Dateneingabe. Das
Skript läuft auf dem Poller-Host, nicht auf dem Gerät, und das Erreichen des Geräts ist Aufgabe des
Skripts. Siehe [Ein Datenerfassungsskript schreiben](/de/guides/write-a-data-collection-script/) für den
Ausgabevertrag.

Geben Sie `U` statt `0` zurück, wenn ein Sensor nicht erreichbar ist. Eine Sonde, die offline ging,
ist keine Sonde, die null Grad misst.

## Fehlermodi

| Symptom | Häufige Ursache |
|---|---|
| Temperatur wird zehn- oder hundertmal zu groß dargestellt | Herstellermultiplikator nicht herausdividiert |
| Temperatur wird zehnmal zu klein dargestellt | Zweimal dividiert, einmal im Skript und einmal in einer CDEF |
| Eine Spannungsschiene wird mit Milliardenwerten angezeigt | Vorzeichenlose SNMP-Ganzzahl mit negativem Wert, unkorrigiert |
| Sensordiagramme werden nach Sondentausch flach | Tabelle wurde neu indiziert und Datenquelle zeigt nun auf anderen Sensor |
| Messwerte über einem Schwellenwert erscheinen als Lücken | Maximum wurde auf Datenquelle gesetzt und reale Werte überschreiten es |
| Achse bei Gradmessung mit k oder M beschriftet | Basiswert und Einheiteneinstellungen aus Datenverkehrsvorlage geerbt |
| Eine Abweichung ist in der Wochenansicht unsichtbar | Prüfen Sie gewählte Konsolidierung, Auflösung, Abfrageintervall und verworfene Werte |
| Eine Abfrage liefert keine Indizes | Zurückgegebene OIDs, Parser-Treffer, Zugriffsbeschränkungen und Objektunterstützung prüfen; Spaltenwurzel kann gültig sein |
| Die lmSensors-Abfragen finden auf einem Linux-Host nichts | Agentenunterstützung, Zugriff, bereitgestellte Sensorzeilen und exakte SNMP-Fehler prüfen |
