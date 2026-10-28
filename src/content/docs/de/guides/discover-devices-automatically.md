---
title: Geräte automatisch erkennen
description: Scannen Sie einen Netzwerkbereich, ordnen Sie gefundene Geräte einer Vorlage zu und lassen Sie Regeln die Diagramme und Verzweigungsbäume erstellen, wobei die Geräteerstellung für einen ersten Erkennungsdurchlauf deaktiviert bleibt.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Überprüfung durch einen muttersprachlichen Sprecher wartet.
sidebar:
  order: 15
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor Sie sich
darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Automatisierung besteht aus zwei getrennten Maschinen, die leicht verwechselt werden können. Die Erkennung durchläuft einen
Adressbereich und entscheidet, was ein Gerät ist. Regeln bestimmen, was für ein
Gerät erstellt wird, sobald es existiert. Sie können jede Komponente unabhängig von der anderen ausführen, und der meiste Schaden,
den Benutzer bei der Automatisierung anrichten, entsteht dadurch, dass beide gleichzeitig aktiviert werden und man
erst im Nachhinein die Folgen feststellt.

## Den Bereich definieren

Ein Netzwerkbereich ist eine durch Kommas getrennte Liste. Jeder Eintrag hat eines von drei Formaten.

| Format | Beispiel | Hinweise |
|---|---|---|
| CIDR | `192.168.1.0/24` | Akzeptiert auch eine punktierte Maske, `192.168.1.0/255.255.255.0` |
| Platzhalter | `192.168.*.*` | Intern in das entsprechende CIDR umgewandelt |
| Einzelne Adresse | `192.168.1.10` | Scannt genau diese Adresse |

Start-zu-End-Bereiche im Format `192.168.1.10-192.168.1.50` werden mit einem
Fehler abgelehnt. Sie werden nicht unterstützt.

Verwenden Sie überschneidungsfreie Bereiche, auch über Netzwerke hinweg, die gleichzeitig laufen können.
Die Arbeitstabelle verfügt über einen globalen eindeutigen Schlüssel für die IP-Adresse; ein Duplikat kann
einen gesamten Einfügebundle-Vorgang ablehnen und andere Adressen in diesem Stapel überspringen. Siehe
[Problem #207](https://github.com/kadupulhq/kadupul/issues/207).

Alles basiert auf IPv4. Die Bereichsmathematik verwendet durchgehend 32-Bit-Ganzzahlkonvertierung, daher
gibt es hier keinen IPv6-Pfad.

Netzwerk- und Broadcast-Adressen sind ausgeschlossen. Ein `/24` scannt 254 Adressen, von
`.1` bis `.254`. Ein einzelner Adresseintrag scannt genau eine. Adressen, deren letztes Oktett 255 ist,
werden während des Scans ebenfalls übersprungen.

Bevor ein Scan beginnt, wird jede Adresse im Bereich in eine Arbeitstabelle geschrieben, eine
Zeile pro Adresse, und Threads beanspruchen Zeilen daraus. Ein `/16` schreibt 65534 Zeilen vor
dem ersten Ping. Das ist ein spürbarer Aufwand, und deshalb ist der Scan eines großen, dünn besiedelten Bereichs
selbst dann langsam, wenn kein Ziel antwortet.

Ordnen Sie jedem Bereich einen SNMP-Optionssatz zu. Der Master-Modus protokolliert einen Fehler und überspringt
einen Bereich, dessen SNMP-Satz-ID null ist. Ein gezielter Lauf wendet diese Schutzmaßnahme nicht an;
ein direkter Start macht fehlende SNMP-Optionen nicht funktionsfähig.

## Den Scan dosieren

| Einstellung | Funktion | Standardwert |
|---|---|---|
| Discovery Threads | Parallele Worker, die Adressen beanspruchen | 1 |
| Run Limit | Die Erkennung wird nach dieser Zeitspanne beendet | 20 minutes |
| Schedule Type | Manuell, täglich, wöchentlich, monatlich oder monatlich an einem bestimmten Tag | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP oder SNMP | Aus der globalen Einstellung |
| Ping Retries, Timeout | Fehlerkosten pro Adresse | Aus den globalen Einstellungen |

Threads und Ausführungslimit interagieren schlecht, wenn man sie nicht sorgfältig plant. Fünfzig Threads
auf einem `/16` stellen für jedes Intrusion-Detection-System einen Portscan dar.
Ein einzelner Thread auf demselben Bereich erreicht das Ausführungslimit und wird
mittendrin abgebrochen, was ein Teilergebnis hinterlässt, das wie ein vollständiges aussieht.

Dimensionieren Sie den Bereich so, dass ein Scan innerhalb des Limits mit einer Thread-Anzahl abgeschlossen wird,
die Ihr Netzwerk toleriert. Mehrere kleine Bereiche sind besser als ein großer, da jeder seinen eigenen
Zeitplan und sein eigenes Limit erhält.

## Was ein Scan pro Adresse ausführt

1. Einen Namen auflösen. Alternative DNS-Server können als durch Leerzeichen getrennte Liste angegeben werden; wenn
   keine gesetzt sind, wird der eigene Resolver des Pollers verwendet. Eine NetBIOS-Abfrage ist ein optionaler
   Fallback, wenn DNS kein Ergebnis liefert.
2. Prüfen, ob die Adresse oder dieser Name bereits ein Gerät darstellt. Wenn ja, wird die Adresse als
   erledigt markiert. Dadurch wird ein vorhandenes Gerät unterdrückt, das über diese Werte gefunden wird; dies
   ist jedoch keine Garantie gegen gleichzeitige Erstellung oder abweichende Aliase.
3. Ping mit der konfigurierten Methode ausführen. Die SNMP-Methode umgeht den separaten Ping.
4. Wenn der Ping antwortet oder die SNMP-Methode ausgewählt ist, SNMP versuchen und `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` und die Betriebszeit erfassen.
5. Die gesammelten Systemdaten mit den Geräteregeln abgleichen.

Eine Adresse, die auf Ping antwortet, aber nicht auf SNMP, wird als gefunden und erreichbar erfasst. Eine
Adresse, die auf SNMP antwortet, aber keiner Geräteregel entspricht, wird als gefunden registriert, samt ihren
Systemdaten, und es wird kein Gerät erstellt. Beide landen in der Liste der erkannten Geräte.

Duplikatunterdrückung ist standardmäßig aktiviert. Wenn ein `sysName` bereits auf
einer anderen Adresse in den gespeicherten Erkennungsdatensätzen dieses Netzwerks gesehen wurde oder auf einem Gerät mit einem anderen
Hostnamen existiert, wird die Adresse übersprungen. Das ist der richtige Standardwert für einen Router mit vielen
adressierten Schnittstellen und der falsche für identische Appliances hinter separaten NAT-Adressen;
genau dafür existiert die Option für denselben sysName, um dieses Verhalten zu deaktivieren.

Vorhandene Geräte können ihre Datenabfragen während eines Scans erneut ausführen lassen. Das ist standardmäßig
deaktiviert und gilt für Geräte, die als betriebsbereit oder in Wiederherstellung erfasst sind. Die Erkennung verwendet deren
gespeicherten Status für diese Entscheidung; sie prüft ein vorhandenes Gerät nicht frisch ab.

## Geräteregeln bestimmen die Vorlage

Eine Geräteregel ordnet Systemdaten einer Gerätevorlage zu. Jede Regel enthält ein Muster für
`sysDescr`, `sysObjectID` und `sysName`. Der Matcher filtert auf jedes Systemfeld,
das das Gerät als nicht leer zurückgegeben hat; leere Regelmuster stimmen mit jedem Wert überein. Regeln
werden in Reihenfolge ausgewertet und der erste Treffer gewinnt.

Verwenden Sie einfache literale Teilzeichenfolgen und überprüfen Sie die ausgewählte Vorlage in den Erkennungsergebnissen.
Der aktuelle SQL-Matcher schließt Regex-Muster in literale `/`-Zeichen ein,
sodass ein verankertes Muster wie `^Linux.*fixture$` fehlschlägt, selbst wenn der Regex-Operator der Datenbank
direkt darauf passt. Der Substring-Fallback repariert diesen Fall nicht. Siehe
[Problem #206](https://github.com/kadupulhq/kadupul/issues/206). SQL-`LIKE`
behandelt außerdem `%` und `_` als Platzhalter.

Keine Übereinstimmung bedeutet kein Gerät. Die Adresse wird in der Liste der erkannten Geräte erfasst,
zusammen mit den gesammelten Systemdaten, und diese Liste ist der Ort, an dem Sie die Regel schreiben,
die Ihnen fehlte.

Platzieren Sie spezifische Regeln vor allgemeinen. Eine Regel, die auf die Teilzeichenfolge `Linux` passt und
über einer Herstellerregel platziert ist, beansprucht jede Appliance, die Linux in ihrer
Beschreibung erwähnt.

## Erkennung vor Aktivierung der Erstellung prüfen

Der Schalter zur Geräteerstellung für einen neuen Bereich ist standardmäßig deaktiviert. Lassen Sie ihn
für den ersten Durchlauf deaktiviert und deaktivieren Sie die Option zur erneuten Ausführung von Datenabfragen vorhandener Geräte.
Dieser Durchlauf aktualisiert weiterhin Erkennungsdatensätze, Scanstatistiken und Protokolle und kann konfigurierte
Benachrichtigungen senden. Die Ausführung von Diagramm- oder Strukturregeln wird hierbei nicht vorab simuliert.

Führen Sie den Scan aus und lesen Sie dann die Liste der erkannten Geräte. Sie zeigt aufgezeichnete Erkennungen,
deren gesammelte SNMP-Daten und die zugeordnete Vorlage, sofern verfügbar. Vorhandene
Geräte, unterdrückte Duplikate und übersprungene Adressen müssen dort nicht erscheinen.
Überprüfen Sie sowohl die Debug-Ausgabe pro Adresse als auch die Liste.

Erzwingen Sie einen Scan über die Befehlszeile, anstatt auf einen Zeitplan zu warten:

```bash
php poller_automation.php --network=3 --force --debug
```

Das Debug-Flag gibt die Entscheidungen pro Adresse direkt bei ihrem Auftreten aus. Der Master-Prozess,
der aktivierte Bereiche startet, deren Zeitplan fällig ist, ist ein separater Modus:

```bash
php poller_automation.php -M
```

Der gezielte Befehl mit `--force` führt auch ein deaktiviertes Netzwerk aus. Das Hinzufügen von `--force` zum
Master-Modus umgeht die Zeitplanprüfung und kann auch deaktivierte Netzwerke starten.
Verwenden Sie die gezielte Form, wenn Sie einen einzelnen Bereich validieren.

Überprüfen Sie drei Dinge im Ergebnis, bevor Sie die Erstellung aktivieren:

- Die Geräteanzahl entspricht Ihren Erwartungen. Eine Anzahl, die weit über Ihrer Inventarliste
  liegt, bedeutet normalerweise, dass der Bereich größer ist als angenommen.
- Die gewählten Vorlagen sind korrekt. Eine Spalte mit derselben generischen Vorlage für
  alles bedeutet, dass Ihre Regeln nicht wie gewünscht greifen.
- Nichts Wichtiges fehlt. Überprüfen Sie bei einem fehlenden Gerät die Bereichserweiterung, den Worker-Abschluss,
  die Unterdrückung vorhandener Geräte und Duplikate, die Ping-Richtlinie und die SNMP-Ergebnisse.
  Das Fehlen in der Liste allein beweist nicht, dass das Gerät unerreichbar ist.

## Diagramm- und Strukturregeln

Sobald ein Gerät existiert, bestimmen Diagrammregeln und Strukturregeln, was darauf aufgebaut wird.
Die Erkennung kann diese Automatisierung nach der Erstellung eines Geräts aufrufen, und die CLI kann
sie auf vorhandene Geräte anwenden. Einzelne Diagramm- und Strukturregeln müssen aktiviert sein.
Die globalen Diagramm-/Struktur-Automatisierungsschalter steuern bestimmte Erstellungs-Hooks;
sie stellen kein pauschales Verbot expliziter CLI-Automatisierung dar.

Eine Diagrammregel besteht aus drei Teilen: auf welche Geräte sie zutrifft, auf welche erkannten Indizes
innerhalb einer Datenabfrage sie zutrifft und welcher Diagrammtyp erstellt werden soll. Beide übereinstimmenden
Teile bestehen aus Regelelementen, und ein Regelelement besteht aus einem Feld, einem Operator und einem
Muster, verknüpft durch `AND` oder `OR` mit Klammern.

| Operatorgruppe | Mitglieder |
|---|---|
| Teilzeichenfolge | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Gleichheit | matches, is not equal to |
| Numerisch | is less than, less than or equal, greater than, greater than or equal |
| Vorhandensein | is unknown, is not unknown, is empty, is not empty |
| Muster | matches regular expression, does not match regular expression |

Diese werden zu einer SQL-`WHERE`-Klausel. Die Operatoren für reguläre Ausdrücke entsprechen dem
Regex-Dialekt der Datenbank, nicht PCRE; ein Muster, das in
`preg_match` funktioniert, funktioniert hier also nicht zwingend. Numerische Vergleiche mit numerischen
Mustern werden ungequotet weitergegeben; alles andere wird in Anführungszeichen gesetzt, und die Datenbank
wendet ihre Typkonvertierungsregeln an. Testen Sie numerische Filter anhand der tatsächlich zwischengespeicherten
Werte; diese Werte werden gewöhnlich als Text gespeichert. Substring-Operatoren verwenden SQL-`LIKE`,
wobei `%` und `_` Platzhalterbedeutungen haben.

Zwei Verhaltensweisen sollte man kennen, bevor man eine Regel debuggt, die nichts bewirkt:

**Ein leerer Geräte-/Objektfilter entspricht nichts, aber ein leerer Indexfilter
entspricht allen zwischengespeicherten Indizes.** Der Geräteauswahlfilter fällt auf eine False-Bedingung
zurück, wenn er keine Übereinstimmungselemente enthält. Sobald eine Diagrammregel jedoch auf ein Gerät zutrifft,
führt das Entfernen aller Diagramm-Indexbedingungen dazu, dass die Datenabfrage ungefiltert bleibt.
Beispielsweise kann das Entfernen einer Bedingung `ifDescr = eth0` auch ein Diagramm für `lo` erstellen.
Deaktivieren Sie die Regel, während Sie ihre Indexbedingungen bearbeiten.

**Eine Regel, die sich auf ein Feld bezieht, das das Gerät nicht erkannt hat, wird verworfen.** Wenn eine
Regel nach einem Datenabfragefeld filtert, das sich nicht im Cache dieses Geräts befindet, protokolliert der Lauf
eine Warnung mit dem Namen des Feldes und stoppt die Verarbeitung dieser Regel für dieses Gerät. Die übliche
Ursache ist eine Regel, die für eine Datenabfrage geschrieben wurde und auf einem Gerät ausgewertet wird, dessen
Abfrage eine andere Feldmenge zurückgegeben hat.

Die Regelbearbeitungsseite listet Kandidatenobjekte und Diagramme auf. Überprüfen Sie diese Listen vor
dem Aktivieren einer Regel und nach deren Bearbeitung. Es handelt sich um Auswahlvorschauen, nicht um einen vollständigen
Testlauf: Datenquellenprüfungen, Erkennung vorhandener Diagramme, Erstellungs-Hooks
und Struktureinfügungen finden weiterhin während der Ausführung statt. Die CLI bietet keine Probelauf-Option.

Strukturregeln verfügen über separate Geräte- und Diagramm-Blatt-Typen sowie einen ausgewählten Zielbaum
und übergeordneten Knoten. Kopfschritte können feste Zeichenfolgen oder Werte aus Geräte-/Diagrammfeldern
verwenden. Aus Feldern abgeleitete Überschriften wenden eine PHP-Regex-Ersetzung ohne Berücksichtigung der Groß-/Kleinschreibung an;
wörtliche `\n`-Sequenzen im Ergebnis teilen dieses in aufeinanderfolgende verschachtelte Überschriften auf.
Diese Ersetzungssyntax unterscheidet sich vom SQL-Regex, der für den Objektabgleich verwendet wird.
Vorhandene Überschriften und Blätter werden am selben Baum und übergeordneten Knoten wiederverwendet; das Ändern des
Pfades kann eine weitere Platzierung hinzufügen, ohne die alte zu entfernen.

## Regeln auf bereits vorhandene Geräte anwenden

Die Erkennung ist nicht der einzige Weg. Regeln können auf Geräte angewendet werden, die sich bereits im
System befinden, ausgewählt nach ID, Hostname oder Beschreibung:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Hostname und Beschreibung werden als regulärer Ausdruck abgeglichen, wenn der Wert gültig ist,
und stets auch als Teilzeichenfolge. Mindestens einer der drei Selektoren ist erforderlich;
der Aufruf ohne Selektoren bricht mit einem Fehler ab. Werden Selektoren kombiniert,
werden sie mit `AND` verknüpft. Verwenden Sie durch Leerzeichen getrennte positive Geräte-IDs für eine gezielte
Auswahl; kommagetrennte IDs werden nicht unterstützt. Muster können dennoch weit gefasst sein,
und der SQL-`LIKE`-Fallback behandelt `%` und `_` als Platzhalter.

Die Selektorabfrage schließt deaktivierte Geräte nicht automatisch aus. `--debug`
fügt Diagnosen hinzu, führt aber dennoch Erstellungen durch. Keine übereinstimmenden Geräte ist ein erfolgreicher
No-Op, daher beweist der Exit-Status allein nicht, dass etwas erstellt wurde.

Für jedes passende Gerät führt der Lauf nacheinander drei Schritte aus:

1. Versucht die Erstellung für angehängte Diagrammvorlagen, die noch kein Diagramm auf dem
   Gerät besitzen, vorbehaltlich Vorlageneignung und Datenquellenprüfungen.
2. Führt aktivierte Diagrammregeln für angehängte Datenabfragen unter Verwendung ihres gespeicherten Index-Caches
   aus. Dieser Schritt führt die Erkennung selbst nicht erneut durch; aktualisieren Sie zuerst die Datenabfrage,
   falls der Cache fehlt oder veraltet ist.
3. Wendet aktivierte Geräteblatt-Strukturregeln an.

Die Erstellung neuer Diagramme kann Diagrammblatt-Strukturregeln aufrufen, wenn die globale Strukturautomatisierung
aktiviert ist. Die CLI wendet diese Regeln nicht erneut auf Diagramme an, die sie bereits
erstellt vorfindet. Eine neue oder geänderte Diagrammblattregel füllt daher vorhandene
Diagramme nicht nachträglich auf, nur weil die CLI erneut ausgeführt wird. Siehe
[Problem #211](https://github.com/kadupulhq/kadupul/issues/211). Überprüfen Sie deren Platzierung
separat; löschen und erstellen Sie historische Diagramme nicht neu, nur um den Erstellungs-Hook auszulösen.

Wiederholte Läufe unterdrücken ein vorhandenes nicht-indiziertes Diagramm nach Gerät und Diagrammvorlage.
Indizierte Diagramme werden nach Gerät, Datenabfrage, Diagrammtyp und Index geprüft. Dies
verhindert doppelte Erstellung in aufeinanderfolgenden Läufen; es ist keine Nebenläufigkeitsgarantie.
Überprüfen Sie nach einem Lauf die Diagrammliste und den Baum sowie `AUTOM8`-Protokollmeldungen auf
übersprungene Diagramme, ungültige Daten oder Erstellungsfehler.

Eine Sache wird stillschweigend genug übersprungen, um zu verwirren: Eine Diagrammvorlage mit einem Feld,
das als überschreibbar markiert ist und keinen Standardwert hat, ist für die Automatisierung nicht zugelassen. Der Lauf
protokolliert, dass sie nicht hinzugefügt wurde, weil ein überschreibbares Feld keinen Standardwert hat, und fährt
fort. Wenn eine erwartete Vorlage nie erscheint, ist dies das Erste, was zu prüfen ist. Siehe
[Vorlagen](/de/concepts/templates/) für die Erklärung überschreibbarer Felder.

## Fallstricke

**Das Deaktivieren einer Regel macht ihre Arbeit nicht rückgängig.** Bereits erstellte Diagramme
oder Baumeinträge werden dadurch nicht entfernt. Das Löschen von Geräten hat ein separates Verhalten zur Bereinigung
von Diagrammen und Datenquellen; überprüfen Sie die Löschoptionen, bevor Sie ein Gerät entfernen.

**Ein abgebrochener Scan sieht wie ein sauberer Scan aus.** Das Ausführungslimit beendet die
Erkennung an der Stelle, an der sie gerade angekommen war. Die erfassten Summen sind die Summen der abgeschlossenen
Arbeit, und nichts kennzeichnet das Ergebnis als unvollständig. Vergleichen Sie die gescannte Adressanzahl
mit der Größe des Bereichs.

**Regeln laufen gegen den Cache der Datenabfrage, nicht gegen das Gerät.** Eine Diagrammregel, die
auf nichts zutrifft, bedeutet oft, dass die Datenabfrage nie ausgeführt wurde oder lief und keine Indizes fand.
Prüfen Sie die Tabelle der erkannten Indizes, bevor Sie die Regel umschreiben.

**Benachrichtigungs-E-Mails enthalten vorhandene und neue Entdeckungen.** Ein Bereich kann nach
Abschluss eine E-Mail senden, in der die erfassten Entdeckungen danach gruppiert werden, ob jede IP
im Snapshot vor dem Scan vorhanden war. Dies ist kein Beweis dafür, dass jede angeforderte Adresse tatsächlich gescannt wurde.

## Fehlermodi

| Symptom | Häufige Ursache |
|---|---|
| Scan findet nichts in einem belegten Bereich | Ping blockiert, SNMP-Fehler, Ausschlüsse oder Duplikatunterdrückung |
| Bereich verweigert Scan, Fehler im Protokoll | Kein SNMP-Optionssatz zugeordnet |
| Geräte gefunden, aber keines erstellt | Erstellungsschalter deaktiviert oder keine Geräteregel passte |
| Alles erhält dieselbe generische Vorlage | Regelreihenfolge, mit einer allgemeinen Regel vor den spezifischen |
| Nur einige Adressen gescannt | Ausführungslimit erreicht oder überlappende Bereiche wiesen einen Adressstapel ab |
| Ein Gerät pro Router statt eines pro Schnittstelle oder umgekehrt | Die Duplikatunterdrückungseinstellung für denselben sysName |
| Regel trifft auf nichts zu und Protokoll warnt vor Spalte | Regel filtert nach Feld, das die Datenabfrage dieses Geräts nicht zurückgab |
| Diagrammvorlage wird nie durch Regel erstellt | Fehlender erforderlicher Standardwert, ungültige Datenquellenausgabe oder Erstellungsfehler |
| Unerwartete Diagramme für zusätzliche Schnittstellen | Diagramm-Indexfilter ist leer oder weiter gefasst als beabsichtigt |
| Neue Strukturregel platziert vorhandene Diagramme nicht | CLI wendet Diagrammblattregeln nicht nachträglich auf vorhandene Diagramme an |
