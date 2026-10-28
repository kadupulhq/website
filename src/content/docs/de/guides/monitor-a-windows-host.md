---
title: Einen Windows-Host überwachen
description: Grafische Darstellung von CPU, Festplatten, Schnittstellen und Betriebszeit unter Windows über den SNMP-Dienst, welche Hostressourcen-Objekte die Daten übertragen und was zu tun ist, wenn SNMP nicht verfügbar ist.
banner:
  content: Kadupul befindet sich in der Pre-Alpha-Phase. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Prüfung durch eine sprachkundige Person wartet.
sidebar:
  order: 14
---

:::caution[Vor Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder Migrationspfad. Testen Sie diese Verfahren vor dem produktiven Einsatz auf einer isolierten Kopie mit Backups. Siehe [Projektstatus](/de/project/status/).
:::

Windows über SNMP liefert Schnittstellen, Prozessoren, Speicher und einige Zähler. Der integrierte Microsoft-Agent stellt die Last-, Speicher- und Festplattenobjekte der Net-SNMP-UCD-Vorlagen nicht bereit. Der Arbeitsspeicher kann dennoch über die Speicherzeilen dargestellt werden, wenn der Agent sie anzeigt. Agenten von Drittanbietern können andere Objekte bereitstellen; prüfen Sie den tatsächlichen Agenten, bevor Sie Vorlagen auswählen.

## Was der SNMP-Dienst bereitstellt

Der Windows-SNMP-Dienst ist veraltet und optional. Für Windows 10 und 11 dokumentiert Microsoft die Installation über optionale Features oder Windows-Funktionen; ein älterer DISM-Feature-Name-Fehler allein beweist nicht, dass er nicht verfügbar ist. Prüfen Sie die Anweisungen für Ihre Windows-Edition. Siehe [Microsofts SNMP-Installationsleitfaden](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Prüfen Sie, welche dieser Teilbäume Ihr installierter Agent bereitstellt:

| Bereich | Teilbaum | Bietet |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Beschreibung, Betriebszeit, Kontakt, Name, Standort |
| Schnittstellen | `.1.3.6.1.2.1.2` und `.1.3.6.1.2.1.31` | Datenverkehr, Fehler, Status |
| Hostressourcen | `.1.3.6.1.2.1.25` | Prozessoren, Speicher, Prozessanzahl, angemeldete Benutzer |
| LAN Manager | `.1.3.6.1.4.1.77` | Windows-Dienst- und Freigabedaten |

Die mitgelieferten Windows-Vorlagen von Kadupul lesen die ersten drei Bereiche. Nichts im mitgelieferten Satz liest den LAN Manager-Teilbaum.

Zwei Konfigurationselemente auf dem Host entscheiden darüber, ob Sie Daten erhalten: die Community-Zeichenfolge und die Liste der Manager, von denen der Agent Pakete akzeptiert. Ein Host, der so eingestellt ist, dass er SNMP nur von einer einzigen Manageradresse akzeptiert, antwortet nur diesem Manager und verwirft alles andere.

Überprüfen Sie jeden Bereich vom Poller-Host aus, bevor Sie Graphen erstellen. Ersetzen Sie den Beispiel-Host und die Community durch Ihre konfigurierten Werte; `public` dient der Veranschaulichung.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Der zweite Walk liest die Prozessorlast ab, der dritte die Speicherbeschreibungsliste. Wenn der erste Befehl funktioniert und die anderen beiden nichts zurückgeben, prüfen Sie Zugriffsbeschränkungen, Agentenunterstützung und den zurückgegebenen SNMP-Fehler.

## Das Gerät hinzufügen

Importieren Sie `install/templates/Windows_Device.xml.gz`, falls die Vorlagen fehlen, gemäß [Vorlagen importieren und exportieren](/de/guides/import-and-export-templates/). Wählen Sie die Windows-Gerätevorlage aus, überprüfen Sie die Abfrageerkennung und erstellen Sie dann die gewünschten Graphen explizit. Das Paket enthält drei Datenabfragen und die zugehörigen Graphvorlagen.

| Datenabfrage | Gestützt durch | Liest |
|---|---|---|
| SNMP - Schnittstellenstatistiken | `resource/snmp_queries/interface.xml` | `IF-MIB`, direkt durchlaufen |
| SNMP - Prozessorinformationen abrufen | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` über `scripts/ss_host_cpu.php` |
| SNMP - Einhängepunkte abrufen | `resource/script_server/host_disk.xml` | `hrStorageTable` über `scripts/ss_host_disk.php` |

Die Festplatten- und Prozessorabfragen sind trotz ihrer Namen Skript-Server-Abfragen. Sie laufen in einem separaten, langlebigen PHP-Skript-Server-Prozess und führen SNMP-Aufrufe mit den Anmeldedaten des Gerätedatensatzes aus. Die Schnittstellenabfrage ist eine reine SNMP-Abfrage. Die praktische Konsequenz ist, dass ein fehlerhafter PHP-Skript-Server die Festplatten- und CPU-Erfassung unter Windows stoppt, während Schnittstellengraphen weiterlaufen.

## Was Sie ohne Datenabfrage erhalten

Zwei Graphvorlagen lesen jeweils eine feste OID aus.

| Graph | OID | Gespeichert als |
|---|---|---|
| Host MIB - Prozesse | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Host MIB - Angemeldete Benutzer | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Zwei weitere lesen überhaupt nichts vom Gerät. Die Graphen für Betriebszeit und Polling-Zeit rufen `scripts/ss_hstats.php` auf und geben eine Spalte aus Kadupuls eigenem Gerätedatensatz zurück: `snmp_sysUpTimeInstance` für die Betriebszeit, die aufgezeichnete Polling-Dauer für die Abfragezeit. Sie lesen gespeicherte Messungen, keine frische SNMP-Antwort.

## Die Hostressourcen-Tabellen

### Prozessoren

`hrProcessorLoad` unter `.1.3.6.1.2.1.25.3.3.1.2` gibt einen Eintrag pro logischem Prozessor zurück, den der Agent bereitstellt. Der Walk liefert die Indizes; gehen Sie nicht davon aus, dass die Zeilenanzahl immer der beworbenen Hardware-Thread-Anzahl entspricht.

Der Wert ist bereits ein Prozentwert. Die MIB definiert ihn als Durchschnitt über die letzte Minute. Siehe die [Host Resources MIB-Definition](https://www.rfc-editor.org/rfc/rfc2790.html).

### Speicher

Die mitgelieferte Speicherabfrage verwendet `hrStorageTable` unter `.1.3.6.1.2.1.25.2.3.1`. Sie liest sechs Spalten aus.

| Spalte | OID | Richtung |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Index |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Index und angezeigte Bezeichnung |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Eingabe, der Multiplikator |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Ausgabe |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Ausgabe |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Ausgabe |

Größe und belegter Speicherplatz sind Anzahlen von Allokationseinheiten, keine Bytes. Das Skript multipliziert jeden Wert mit der für diesen Index zwischengespeicherten Allokationseinheitengröße, wenn beide Werte gültig sind.

Daraus ergeben sich zwei Dinge, die unter Windows häufig zu Problemen führen.

**Die Tabelle ist keine Liste von Festplatten.** Der Agent meldet alles, was er als Speicher betrachtet. Je nach Agent können physischer Speicher und virtueller Speicher neben festen Laufwerken erscheinen. Bezeichnungen wie `C:\`, `D:\`, `Physical Memory` und `Virtual Memory` sind Beispiele, keine garantierten Zeilen. Wählen Sie die Zeilen aus, die Sie grafisch darstellen möchten.

**Große oder ungültige Speicherwerte müssen überprüft werden.** Die MIB definiert Größe und Belegung als nicht-negative Integer32-Werte. Ein Agent, der einen negativen Wert zurückgibt, liegt außerhalb dieses Bereichs. Das aktuelle Skript verwendet `(abs(value) + 2147483647) * allocation_units`, was keine vorzeichenlose 32-Bit-Neuinterpretation darstellt. Behandeln Sie betroffene Werte als unzuverlässig und reindizieren Sie nach Behebung der Erkennung. Siehe den [Speicherumrechnungsfehler](https://github.com/kadupulhq/kadupul/issues/243).

## Wo sich Windows von Linux unterscheidet

| Eigenschaft | Linux mit net-snmp | Integrierter Windows-Agent / mitgelieferte Vorlagen |
|---|---|---|
| Lastdurchschnitt | `.1.3.6.1.4.1.2021.10.1.3` | Keine UCD-Lastdurchschnittsobjekte |
| Arbeitsspeicher | `.1.3.6.1.4.1.2021.4` | Kann aus bereitgestellten `hrStorage`-Zeilen dargestellt werden |
| CPU | UCD-Prozentsätze oder `hrProcessorLoad` | Nur `hrProcessorLoad` |
| Festplattenliste | Von Ihnen deklarierte `dskTable` oder `hrStorage` | Nur `hrStorage`, ungefiltert |
| Festplatten-I/O | `diskIOTable` | Nichts Mitgeliefertes liest dies |
| Schnittstellennamen | Kernel-Namen, kurz | Lange Adapterbeschreibungen, oft dupliziert |

Der integrierte Microsoft-Agent liefert den UCD-Teilbaum `.1.3.6.1.4.1.2021` nicht. Siehe [Fehlende Daten beheben](/de/guides/troubleshoot-missing-data/).

### Schnittstellen

Die Schnittstellenabfrage ist dieselbe, die auch ein Switch verwendet. Ihre Index-Präferenzreihenfolge lautet `ifName`, dann `ifDescr`, dann `ifHwAddr`, dann `ifIndex`. Sie wählt das erste Feld aus, das auf jeder erkannten Schnittstelle vorhanden und eindeutig ist.

Windows ist die Plattform, bei der dies am häufigsten fehlschlägt. Zwei identische Netzwerkkarten können denselben `ifDescr` zurückgeben, und manche Agenten lassen `ifName` leer. Wenn die Abfrage auf `ifIndex` zurückgreift, ist Ihr Schnittstellenverlauf an eine Nummer gebunden, die Windows frei neu vergeben kann.

Siehe [Einen Switch überwachen](/de/guides/monitor-a-switch/) und [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/).

## Wenn SNMP nicht verfügbar ist

Viele Windows-Installationen haben keinen aktivierten SNMP-Dienst. Der Ersatz ist eine Skripteingabe.

Zwei Fakten bestimmen, wie Sie das Skript schreiben.

**Das Skript läuft auf dem Rechner, auf dem der Poller läuft.** Das Erreichen des Windows-Hosts ist Aufgabe Ihres Skripts: WinRM, ein Agent, ein HTTP-Endpunkt, eine Freigabe oder was auch immer Sie betreiben.

**Geben Sie Messwerte auf der Standardausgabe aus.** Der Pfad für externe Befehle des PHP-Pollers verwendet den Exit-Status nicht als Messwert. Geben Sie eine Zahl aus, oder `U` für keinen Messwert in diesem Zyklus. Geben Sie nicht `0` aus, wenn Sie meinen, dass die Messung fehlgeschlagen ist.

Wenn Sie einen Wert pro Schnittstelle, Festplatte oder Dienst statt einer einzelnen Zahl benötigen, bietet derselbe Skriptmechanismus eine indizierte Form. `resource/script_queries/host_cpu.xml` ist ein praktisches Beispiel, das ein PHP-Skript anstelle des Skript-Servers aufruft.

Siehe [Ein Datenerfassungsskript schreiben](/de/guides/write-a-data-collection-script/) für den Ausgabevertrag und die Namensbeschränkungen.

## Fehlermodi

| Symptom | Häufige Ursache |
|---|---|
| Systembeschreibung wird gelesen, sonst wird nichts erfasst | Überprüfen Sie die Objektunterstützung, Zugriffsbeschränkungen und den spezifischen SNMP-Fehler |
| Überhaupt keine Antwort von einem Host, der online ist | Die Liste der akzeptierten Manager des Agenten oder eine Host-Firewall-Regel für UDP 161 |
| Partitionsliste enthält Arbeitsspeicher | Erwartet; der Agent meldet Speicher als Storage |
| Ein großes Volume wird negativ oder als unbekannt dargestellt | Ungültige Agentenwerte oder veraltete Allokationseinheiten; bekannten Konvertierungsfehler prüfen |
| Festplatte und CPU stoppen, Schnittstellen laufen weiter | Fehler im Skript-Server; die Schnittstellenabfrage verwendet ihn nicht |
| Net-snmp-Vorlagen zugewiesen, jeder Messwert unbekannt | Der ausgewählte Agent stellt die für diese Vorlagen erforderlichen UCD-Objekte nicht bereit |
| Schnittstellenverlauf folgt nach einer Änderung dem falschen Adapter | Index wurde auf `ifIndex` aufgelöst, weil Namen leer oder dupliziert waren |
| Betriebszeit wiederholt einen alten Wert | Prüfen Sie, ob der Gerätedatensatz veraltet ist; der Helfer extrapoliert die Betriebszeit nicht |
