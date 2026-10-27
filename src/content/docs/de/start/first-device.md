---
title: Das erste Gerät hinzufügen
description: Richten Sie die Abfrage für ein einzelnes Gerät ein und bestätigen Sie den Dateneingang, bevor Sie darauf aufbauen.
sidebar:
  order: 3
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
---

Fügen Sie zunächst ein einzelnes Gerät hinzu, vergewissern Sie sich, dass es antwortet, und fahren Sie erst dann fort. Die meisten Probleme mit einem Überwachungssystem rühren von einem Gerät her, das von Anfang an nie wirklich geantwortet hat.

Wählen Sie ein Gerät, bei dem Fehler keine gravierenden Folgen haben: einen Switch in Ihrem Besitz, in einem von Ihnen kontrollierten Netzwerk, mit bereits aktiviertem SNMP. Beginnen Sie nicht mit dem Gerät, nach dem sich gerade jemand erkundigt.

## Bevor Sie beginnen

Für dieses SNMP-Beispiel muss das Gerät Abfragen seines zugewiesenen Kollektors beantworten. Führen Sie die Prüfungen auf diesem Kollektor durch, vorzugsweise als Poller-Benutzer; eine Anfrage von Ihrem Laptop kann einen anderen Firewall-Pfad nehmen. Ersetzen Sie die Beispieladresse und den Community-String durch die auf Ihrem Gerät konfigurierten schreibgeschützten Zugangsdaten. Die folgenden numerischen OIDs funktionieren auch dann, wenn lokale MIB-Namensdateien nicht installiert sind.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Wenn dieser Befehl eine Beschreibungszeichenfolge zurückgibt, fahren Sie fort. Tritt ein Timeout auf, beheben Sie dies zuerst. Keine noch so umfangreiche Konfiguration in der Weboberfläche bringt ein unerreichbares Gerät zum Antworten.

Prüfen Sie anschließend die Tabelle, die Sie tatsächlich grafisch darstellen möchten, denn ein Gerät kann `sysDescr` beantworten und die Schnittstellentabelle dennoch verweigern.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

Die zweite OID ist die Spalte `ifDescr`. Sie erwarten eine Zeile pro bereitgestellter Schnittstelle. Ein leeres Ergebnis kann auf eine eingeschränkte SNMP-Sicht oder eine nicht unterstützte Tabelle hinweisen; ein Autorisierungsfehler deutet auf falsche Zugangsdaten oder Zugriffsrichtlinien hin. Prüfen Sie die zurückgegebene Fehlermeldung, bevor Sie Änderungen am Gerät oder an der Kadupul-Konfiguration vornehmen.

Zwei Fakten über SNMP-Versionen sind für spätere Schritte entscheidend, klären Sie diese daher jetzt.

| Version | Bedeutung für Sie |
|---|---|
| v1 | Keine Counter64-Unterstützung. Schnelle Verbindungen können 32-Bit-Oktettzähler zwischen zwei Abfragen mehrfach überlaufen lassen, was die Ratenberechnung uneindeutig macht |
| v2c | Unterstützt Counter64, wenn der Agent dies bereitstellt; Community-Strings werden im Klartext übertragen |
| v3 | Unterstützt Authentifizierung und Verschlüsselung mit `authPriv`; die bloße Auswahl von v3 aktiviert nicht beides automatisch |

Bevorzugen Sie v3 mit `authPriv`, wo dies unterstützt wird, oder v2c in einem isolierten Verwaltungsnetzwerk. Wählen Sie sowohl den 64-Bit-Schnittstellendiagrammtyp als auch die entsprechende SNMP-Version. Wenn das Gerät nur v1 unterstützt, berücksichtigen Sie das Abfrageintervall und das Verkehrsaufkommen in der Fehlertabelle am Ende dieser Seite. [SNMP](/de/reference/snmp/) beschreibt alle Zugangsdatenfelder im Detail.

## Drei Dinge vor dem Öffnen des Formulars entscheiden

**Die Zugangsdaten.** Exakt diejenigen, die Sie oben getestet haben, einschließlich des Ports, falls dieser vom Standard abweicht.

**Die Verfügbarkeitsmethode.** Damit entscheidet Kadupul, ob das Gerät erreichbar ist – unabhängig davon, ob die Datenerfassung funktioniert. Zur Auswahl stehen: keine (none), ping, SNMP-Betriebszeit, SNMP-Beschreibung, SNMP-getNext sowie zwei Kombinationen aus ping und SNMP-Betriebszeit (wobei eine beide erfordert und die andere eines von beiden akzeptiert).

Bevorzugen Sie für ein Gerät, das über SNMP abgefragt wird, eine SNMP-Methode. Sie testet genau den Dienst, auf den Sie sich verlassen. ICMP-Ping benötigt einen Raw-Socket, wofür Web- und Poller-Benutzer normalerweise keine Berechtigung haben; daher kann ein Gerät, das auf `ping` in Ihrer Shell antwortet, in der Oberfläche dennoch als ausgefallen gemeldet werden. Ein TCP-Ping auf einen nachweislich offenen Port vermeidet dieses Problem.

**Die Gerätevorlage.** Wählen Sie eine Vorlage, die zur jeweiligen Hardware passt.

## Das Gerät hinzufügen

1. Wählen Sie auf der alten Seite **Geräte** (`host.php`) die Option **Hinzufügen**. Während der Symfony-Migration nutzen die Geräteerstellung und die Diagrammeinrichtung weiterhin diese Seite. Geben Sie Beschreibung, Hostnamen oder IP-Adresse, zugewiesenen Kollektor, SNMP-Version und Zugangsdaten ein.
2. Stellen Sie die gewählte Verfügbarkeitsmethode ein.
3. Wählen Sie die Gerätevorlage aus.
4. Speichern Sie, bestätigen Sie, dass das Gerät aktiviert ist, und lesen Sie dessen Verfügbarkeits-/SNMP-Bereich ab. Ein gespeicherter Datenbankdatensatz ist kein Beweis dafür, dass die Erfassung erfolgreich war.

## Was die Gerätevorlage bestimmt

Eine Gerätevorlage verknüpft Diagrammvorlagen und Datenabfragen mit dem Gerät. Eine Datenabfrage durchläuft eine Tabelle auf dem Gerät (beispielsweise dessen Schnittstellen) und erzeugt einen Index pro Zeile. Das Zuweisen der Vorlage führt auch deren Datenabfragen aus, um diese Indizes zu befüllen. Ist die Diagrammautomatisierung deaktiviert, erstellen diese Verknüpfungen für sich genommen noch keine Diagramme. Bei aktivierter Diagrammautomatisierung können Hooks aus Vorlagen und Abfragen Diagramme nach passenden Regeln erzeugen; prüfen Sie vorhandene Diagramme, bevor Sie weitere Duplikate hinzufügen.

Das Ändern einer Vorlage kann Verknüpfungen modifizieren und diese Hooks erneut ausführen. Dies setzt bestehende Diagramme oder Datenquellen nicht zurück. Prüfen Sie die gewählte Vorlage und die abgefragten Indizes, bevor Sie sie auf ein Gerät anwenden, das bereits über Verlaufsdaten verfügt.

Diese Indizes sind der Grund dafür, warum Sie Schnittstellen aus einer Liste auswählen, anstatt OIDs manuell einzugeben. [Vorlagen](/de/concepts/templates/) und [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/) behandeln beide Themen ausführlich.

## Das Statuspanel ablesen

Wird das Gerät mit einer SNMP-Verfügbarkeitsmethode gespeichert, baut Kadupul eine Sitzung auf und meldet das Ergebnis zurück. Dies ist die entscheidende Prüfung, die in der Praxis oft übersprungen wird.

| Anzeige | Bedeutung |
|---|---|
| System- und Uptime-Abfragen erfolgreich | Das Panel kann grundlegende SNMP-Metadaten lesen. Dies beweist noch keine funktionierende Schnittstellenerfassung |
| Standort oder Kontakt ist leer | Diese optionalen Metadatenfelder sind möglicherweise nicht gesetzt; ein leerer Wert allein ist kein Erfassungsfehler |
| SNMP nicht verwendet | Kein Community-String oder Benutzername auf dem Gerät, oder Version steht auf keine (none) |
| SNMP-Sitzungsfehler | Sitzungsaufbau fehlgeschlagen; angezeigte Fehlermeldung, Zugangsdaten, Protokoll- und Verbindungseinstellungen prüfen |
| SNMP-Systemfehler | Auslesen von `sysDescr` fehlgeschlagen; Fehlermeldung, Agentensicht, Zugangsdaten und Erreichbarkeit prüfen |
| SNMP-Hostfehler | Weder Beschreibung noch Betriebszeit wurden zurückgegeben |
| Betriebszeit wird als `U` angezeigt | Betriebszeit konnte nicht gelesen werden. Manche Geräte liefern diesen Wert prinzipiell nicht |

Enthält die Verfügbarkeitsmethode einen Ping, erscheint darunter ein separates Ping-Ergebnis. Werten Sie beide Anzeigen aus. Ein Gerät kann den einen Test bestehen und beim anderen scheitern – welches Ergebnis fehlschlägt, zeigt Ihnen, wo die Ursache liegt.

Eine leere Systembeschreibung beweist nicht, dass die Erfassung scheitert. Der Code berücksichtigt Agenten mit leerer Beschreibung und verwertbarer Betriebszeit. Deaktivierte Geräte umgehen die Verfügbarkeitsprüfung, und Verfügbarkeitsmethoden ohne SNMP zeigen diesen SNMP-Bereich nicht an. Überprüfen Sie als Nächstes die eigentliche Abfrage und den Poller-Cache.

## Datenquellen und Diagramme erstellen

Bei einem neuen Gerät ohne automatisch erstellte Diagramme besteht der nächste Schritt darin, das Diagramm und dessen Datenquelle zu erzeugen. Prüfen Sie **Datenquellenliste** und **Poller-Cache anzeigen** auf der Geräteseite, anstatt vorauszusetzen, dass diese leer sind.

Wählen Sie auf der Geräteseite **Diagramme für dieses Gerät erstellen**. Bei einem Switch bedeutet dies, die Schnittstellen-Datenabfrage auszuführen, die gewünschten Schnittstellen auszuwählen und einen Diagrammtyp für sie festzulegen. Wählen Sie zwei oder drei Schnittstellen aus, nicht alle achtundvierzig. Sie möchten nachweisen, dass der Pfad funktioniert; eine kleine erste Auswahl lässt sich im nächsten Schritt viel einfacher nachvollziehen.

Ein indexiertes Diagramm verknüpft Datenquellen mit der gewählten Schnittstelle und bereitet deren Einträge im Poller-Cache vor; kompatible bestehende Quellen können wiederverwendet werden. Die Bestätigung der Diagrammerstellung ist noch kein Beleg für erfolgreiches Polling. Prüfen Sie, ob der Cache das erwartete Gerät, die Schnittstellen-OIDs und den RRD-Pfad enthält.

## Die Datenerfassung bestätigen

Warten Sie geplante Erfassungszyklen ab und prüfen Sie anschließend sowohl Zeitstempel als auch Werte. Ein leeres Diagramm kann auf die anfängliche Normalisierung, einen unbekannten Wert oder eine fehlgeschlagene Erfassung hindeuten. Zur Berechnung einer Rate sind zwei Zählerablesungen erforderlich, doch zwei Poller-Durchläufe garantieren noch kein vollständiges, gültiges Archivintervall.

Prüfen Sie drei Dinge in dieser Reihenfolge.

**Der Poller lief.** Suchen Sie im konfigurierten Protokoll nach der Zusammenfassung am Ende des Durchlaufs. Fehlt sie, prüfen Sie Zeitplaner, Protokollziel und -berechtigungen sowie die Frage, ob der Poller vorzeitig beendet wurde. Siehe [Protokollierung](/de/reference/logging/).

**Die Datei existiert und ist aktuell.** Kopieren Sie den tatsächlichen RRD-Pfad aus der Datenquelle oder dem Poller-Cache; erraten Sie ihn nicht anhand des Hostnamens. Pfade und Dateinamen können angepasst werden. Siehe [Dateistruktur](/de/reference/file-layout/). Fragen Sie RRDtool, wann die Datei zuletzt beschrieben wurde:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Der Zeitstempel sollte bei erfolgreichen Schreibvorgängen voranschreiten. Ein aktueller Zeitstempel kann dennoch von einem unbekannten Wert begleitet sein, und gepufferte Schreibvorgänge können den Zeitstempel auf der Festplatte verzögern. Überprüfen Sie bei `rrdcached` oder Boost auch den Flush-Status dieser Komponente.

**Der Wert ist nicht unbekannt.** `lastupdate` zeigt die zuletzt gelieferten Werte; bei Zählern sind dies absolute Zählerstände, keine berechneten Datenraten. Prüfen Sie abgeschlossene Zeilen aus `fetch` auf endliche Raten. Startzeitpunkt, Schrittausrichtung, Heartbeat, Grenzwerte und die Unbekannt-Schwelle des Archivs beeinflussen, wann eine verwertbare Zeile erscheint. Schließen Sie nicht allein aus den ersten beiden Zeilen auf einen Fehler. Bleiben unbekannte Werte bestehen, untersuchen Sie die erfassten Werte, den Datenquellentyp, den Heartbeat und Poller-Fehlermeldungen.

## Häufige erste Fehler

| Symptom | Typische Ursache |
|---|---|
| Speichern gelingt, aber Abfrage der Systembeschreibung meldet Fehler | Zugangsdaten, Agentensicht und Kollektor-Erreichbarkeit prüfen; eine leere Beschreibung allein ist kein ausreichender Beweis |
| SNMP-Sitzungsfehler in Kadupul, `snmpget` funktioniert vom Laptop | Firewall-Pfad unterscheidet sich, oder der Agent schränkt nach Quell-IP-Adresse ein |
| Gerät wird als inaktiv gemeldet, aber SNMP-Daten kommen an | Verfügbarkeit auf ICMP-Ping gesetzt, der keinen Raw-Socket öffnen kann |
| Beschreibung erscheint, aber keine Daten | Poller nicht geplant oder läuft unter einem Benutzer ohne Schreibrechte auf das RRD-Verzeichnis |
| Datenabfrage liefert keine Schnittstellen | Agentensicht schließt die Schnittstellentabelle aus, oder das Gerät benötigt eine Neuindizierung |
| Erster Wert unbekannt, danach regulär | Normal bei Zählern. Es werden zwei Ablesungen benötigt, um eine Rate zu berechnen |
| Unbekannte Werte bleiben bestehen | Fehlgeschlagene Erfassung, ungültige Werte, Typ-/Grenzwert-Konflikt, Heartbeat oder Archivnormalisierung |
| Zeitweise Daten, dann Lücken | Poller benötigt länger als sein Intervall, oder das Gerät drosselt SNMP-Anfragen |
| Zählerraten sind unplausibel | Mehrfache 32-Bit-Überläufe, Zähler-Reset, Einheiten- oder Datenquelleneinstellungen; nutzen Sie 64-Bit-Zähler auf schnellen Links |
| Schnittstellendiagramme zeigen nach Neustart falsche Ports | Indizes haben sich verschoben. Die Datenabfrage benötigt eine Neuindizierungsmethode, die dies erkennt |

Der letzte Punkt ist wichtig, bevor Sie hunderte Switches verwalten: SNMP-Schnittstellenindizes bleiben nach einem Neustart oder Modultausch nicht zwingend stabil. Die Neuindizierungsmethode einer Datenabfrage sorgt dafür, dass ein Diagramm weiterhin auf denselben physischen Port verweist. [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/) erläutert die verschiedenen Optionen.

Sobald ein Gerät fehlerfrei erfasst wird, sollten Sie weitere Geräte gesammelt hinzufügen statt einzeln. [Geräte automatisch erkennen](/de/guides/discover-devices-automatically/) und die Befehlszeilenwerkzeuge in [Befehlszeilenwerkzeuge](/de/reference/command-line-tools/) sind beide wesentlich schneller, als diese Anleitung fünfzig Mal zu wiederholen.

Nächster Schritt: [Das erste Diagramm lesen](/de/start/first-graph/).
