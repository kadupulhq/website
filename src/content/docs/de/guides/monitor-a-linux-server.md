---
title: Einen Linux-Server überwachen
description: Grafische Darstellung von CPU, Arbeitsspeicher, Festplatte und Last auf einem Linux-Host über net-snmp, was snmpd bereitstellen muss und wie Skripte genutzt werden, wenn SNMP nicht ausreicht.
banner:
  content: Kadupul befindet sich in der Pre-Alpha-Phase. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Prüfung durch eine sprachkundige Person wartet.
sidebar:
  order: 3
---

:::caution[Vor Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder Migrationspfad. Testen Sie diese Verfahren vor dem produktiven Einsatz auf einer isolierten Kopie mit Backups. Siehe [Projektstatus](/de/project/status/).
:::

Ein Linux-Host mit net-snmp liefert Ihnen das Meiste ohne zusätzlichen Code. Die Arbeit besteht darin, `snmpd` dazu zu bringen, die richtigen Teilbäume bereitzustellen, und zu wissen, welche der beiden überlappenden Festplatten-MIBs Sie betrachten.

## Was snmpd bereitstellen muss

Kadupul liest vier Bereiche aus. Weisen Sie der Überwachungsidentität die für die ausgewählten Graphen erforderlichen Teilbäume zu; nicht jede Bereitstellung benötigt jeden Teilbaum.

| Bereich | Teilbaum | Bietet |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Beschreibung, Betriebszeit, Kontakt, Name, Standort |
| Schnittstellen | `.1.3.6.1.2.1.2` und `.1.3.6.1.2.1.31` | Datenverkehr, Fehler, Status |
| Hostressourcen | `.1.3.6.1.2.1.25` | Prozesse, angemeldete Benutzer, Speicher, Prozessoren |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Durchschnittliche Last, Arbeitsspeicher, CPU-Zeit, Festplatten-I/O, deklarierte Partitionen |

Mehrere Distributionen liefern eine Standard-`snmpd.conf` aus, die eine Ansicht gewährt, die nur den System-Teilbaum abdeckt. Das Gerät antwortet dann, meldet eine Systembeschreibung und erfasst nichts. Diese Kombination ist der häufigste erste Fehler auf einem Linux-Host und sieht genauso aus wie ein Vorlagenproblem.

Überprüfen Sie die erforderlichen Bereiche vom Poller-Host aus mit derselben SNMP-Identität, die auf dem Gerät konfiguriert ist. Diese Beispiele verwenden eine illustrative Community; ersetzen Sie sie durch den konfigurierten Wert. Numerische OIDs vermeiden die Notwendigkeit lokaler symbolischer MIB-Definitionen.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Wenn nur der erste Befehl funktioniert, untersuchen Sie die genaue Antwort: Eine eingeschränkte Ansicht, ein nicht verfügbares Agentenmodul, ein anderer SNMP-Kontext oder eine leere Tabelle können das Ergebnis erklären. Überprüfen Sie die Agentenkonfiguration und den Zugriff, bevor Sie die Kadupul-Vorlage ändern.

## Das Gerät hinzufügen

Das mitgelieferte Paket `install/templates/NetSNMP_Device.xml.gz` enthält die Net-SNMP-Gerätevorlage und deren Abhängigkeiten. Importieren Sie es, falls die Vorlage nicht verfügbar ist, und wählen Sie sie dann beim Hinzufügen des Geräts aus. Bestätigen Sie Abfrageindizes und erstellen Sie die gewünschten Graphen explizit; die Auswahl einer Gerätevorlage beweist nicht, dass die Erfassung funktioniert. Siehe [Vorlagen importieren](/de/guides/import-and-export-templates/) und [Ihr erster Graph](/de/start/first-graph/).

## Was Sie ohne Datenabfrage erhalten

Diese Datenvorlagen mit festen OIDs sind im Paket enthalten. Ein Graph kann mehrere davon kombinieren; die Verfügbarkeit hängt vom Zielagenten ab. Sie erfordern keine Indexerkennung.

| Graph | OID | Gespeichert als |
|---|---|---|
| Lastdurchschnitt, 1 Minute | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Lastdurchschnitt, 5 Minuten | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Lastdurchschnitt, 15 Minuten | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Gesamter Arbeitsspeicher | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Freier Arbeitsspeicher | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Puffer-Arbeitsspeicher | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Cache-Arbeitsspeicher | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU-Benutzer | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU-System | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU-Leerlauf | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupts | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Kontextwechsel | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Prozesse | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Angemeldete Benutzer | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Die Speicherobjekte werden in Kilobyte angegeben. Der mitgelieferte Speichergraph wendet eine Umrechnung an, sodass die Achse in Bytes anzeigt. Wenn Sie Ihren eigenen Graphen aus diesen OIDs erstellen, sind Sie für diese Umrechnung selbst verantwortlich.

Die aufgeführten CPU-Objekte sind veraltete Prozentanzeigen, keine kumulativen CPU-Zeitzähler. Gehen Sie nicht davon aus, dass diese drei allein jeden CPU-Zustand abdecken. Net-SNMP markiert sie als veraltet zugunsten von Rohzählern; Rohzähler erfordern angemessene Raten- und Prozentberechnungen, keine Einsetzung in eine Gauge-Vorlage. Siehe die [UCD-SNMP-MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Was eine Datenabfrage erfordert

| Abfrage | Erkennt | Gestützt durch |
|---|---|---|
| SNMP - Einhängepunkte abrufen | Alles, was der Agent als Speicher bezeichnet | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Überwachte Partitionen abrufen | Nur in `snmpd.conf` deklarierte Partitionen | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Prozessorinformationen abrufen | Ein Eintrag pro CPU | Hostressourcen-Prozessorlast |
| Net-SNMP - Geräte-I/O abrufen | Blockgeräte | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Schnittstellenstatistiken | Netzwerkschnittstellen | `IF-MIB` |

### Welche Festplattenabfrage zu verwenden ist

Es handelt sich nicht um zwei Ansichten derselben Daten.

Die Hostressourcen-Abfrage durchläuft alles, was der Agent als Speicher meldet. Auf den meisten Linux-Hosts umfasst dies physischen Speicher, Swap, tmpfs-Mounts und die echten Dateisysteme in einer Liste. Die Größen werden in Allokationseinheiten zurückgegeben, und die Abfrage liest die Allokationseinheitengröße als separates Feld, damit der Graph multiplizieren kann. Sie erhalten alles, ohne etwas zu konfigurieren, aber auch eine lange Liste von Einträgen, die Sie nicht wollen.

Die net-snmp-Abfrage liest die UCD-Festplattentabelle, die durch `disk`-Direktiven oder `includeAllDisks` gefüllt wird. Wählen Sie explizite Partitionen oder eine breite Erkennung; es handelt sich um unterschiedliche Richtlinien.

```
disk /      10%
disk /var   10%
```

Alternativ füllt `includeAllDisks 10%` die beim Start des Agenten gefundenen Festplatten. Der 10%-Wert konfiguriert einen Schwellenwert für freien Speicherplatz; er ist kein Auswahlfilter und konfiguriert selbst keine Kadupul-Warnungen. Laden oder starten Sie den Agenten neu und überprüfen Sie anschließend die Indizes. Eine leere Abfrage kann auch auf Zugriffsprobleme oder Modulverfügbarkeit hinweisen. Siehe [snmpd-Konfiguration](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Bevorzugen Sie die Hostressourcen-Abfrage, wenn Sie Vollständigkeit wünschen und bereinigen möchten. Bevorzugen Sie die net-snmp-Abfrage mit expliziten `disk`-Einträgen, wenn Sie eine gezielte Liste wünschen. `includeAllDisks` erweitert diese Liste; überprüfen Sie die Indizes nach Agenten-Neustarts erneut.

### Schnittstellen

Die Schnittstellendatenabfrage auf einem Server verhält sich genauso wie auf einem Switch, mit einem beachtenswerten Unterschied: `ifDescr` unter Linux ist der Name der Kernel-Schnittstelle, der sich nach einem Neustart oder einem Treiber-Update ändern kann. Siehe [Einen Switch überwachen](/de/guides/monitor-a-switch/) für Details zur Indexwahl.

## Wenn SNMP nicht ausreicht

Manche Dinge verfügen über keine nutzbare MIB. Eine Warteschlangentiefe, ein Anwendungszähler oder eine Zahl in einer Datei erfordern eine Skripteingabe.

Zwei Fakten bestimmen, wie Sie das Skript schreiben.

**Das Skript läuft auf dem Rechner, auf dem der Poller läuft, nicht auf dem überwachten Host.** Das Erreichen des Ziels ist Aufgabe Ihres Skripts: SSH, ein HTTP-Aufruf, ein Agent oder was auch immer Sie bereits einsetzen.

**Der Poller liest die Standardausgabe und nichts anderes.** Der Exit-Status wird nicht ausgewertet.

Der Ausgabevertrag:

| Ausgabe | Bedeutung |
|---|---|
| `42` oder `3.7` | Ein einzelner Wert für eine einzelne Datenquelle |
| `U` | Kein Wert in diesem Zyklus, als unbekannt erfasst |
| `in:1420 out:980` | Mehrere Werte, einer pro Datenquelle |

Bei der Mehrwertform werden Paare durch einzelne Leerzeichen getrennt und der Name wird durch einen Doppelpunkt vom Wert getrennt. Der Parser zählt Trennzeichen gegen Leerzeichen, sodass zusätzliche interne Leerzeichen die Validierung fehlschlagen lassen können. Der PHP-Poller schneidet nachfolgende Leerzeichen ab. Geben Sie das kanonische Format mit einfachen Leerzeichen aus und leiten Sie Diagnosen von stdout weg.

Interne RRD-Datenquellennamen, die vom Vorlageneditor akzeptiert werden, entsprechen `[a-zA-Z0-9_]{1,19}`; Bindestriche werden dort nicht akzeptiert. Skriptausgabebezeichnungen müssen mit den Namen der Dateneingabefelder übereinstimmen und den vorgesehenen internen Elementen zugeordnet sein. Die gesamte Ausgabezeile wird in einer 512-Zeichen-Spalte gespeichert. Siehe [Erfassungsskripte](/de/guides/write-a-data-collection-script/) für den geprüften PHP-Poller-Vertrag.

Geben Sie `U` statt `0` zurück, wenn Sie etwas nicht messen können. Null ist ein Messwert und wird als solcher dargestellt. Siehe [Datenquellen und Archive](/de/concepts/data-sources-and-rras/) für die Gründe, warum beides getrennt gehalten wird.

### Skript-Server

Ein einfaches Skript wird einmal pro Datenquelle und Intervall ausgeführt. Bei einem in PHP geschriebenen Skript ruft die Skript-Server-Form eine Funktion in einem langlebigen separaten PHP-Prozess auf, wodurch der Interpreter-Startaufwand reduziert wird.

### Die Whitelist-Falle

Wenn eine Dateneingabe-Whitelist-Datei verwendet wird, vergleicht der Poller die Befehlszeichenfolge jeder Dateneingabe mit der aufgezeichneten. Eine Befehlszeichenfolge, die sich geändert hat, ohne dass die Whitelist neu generiert wurde, erzeugt keine Poller-Cache-Einträge mehr, und die Datenquelle verstummt ohne Fehler auf dem Graphen. Das Protokoll meldet dies, die Benutzeroberfläche nicht.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Ersetzen Sie `42` durch die ID der überprüften Dateneingabemethode, nicht durch eine Geräte-ID. Eine Aktualisierung ohne `--id` akzeptiert aktuelle Befehlszeichenfolgen im gesamten Eingabebestand. Überprüfen Sie die Änderungen vorher. Überprüfen Sie nach der Aktualisierung die Aktivierung der Quelle und die wirksamen Poller-Cache-Einträge.

## Fehlermodi

| Symptom | Häufige Ursache |
|---|---|
| Systembeschreibung wird gelesen, sonst wird nichts erfasst | `snmpd`-Ansicht auf den System-Teilbaum beschränkt |
| Net-SNMP-Partitionsabfrage findet keine Indizes | Keine `disk`- oder `includeAllDisks`-Zeilen in `snmpd.conf` |
| Hostressourcen-Partitionen enthalten RAM und tmpfs | Erwartet; der Agent meldet sie als Speicher |
| Speichergraph weicht um den Faktor 1024 ab | Aufbau auf den Roh-OIDs ohne Umrechnung |
| Skript gibt Wert auf der Befehlszeile zurück, Poller zeichnet unknown auf | Ausgabe-/Zuordnungsdiskrepanz, interne Trennzeichenfehler oder ungültiger interner Name |
| Skript funktioniert manuell, schlägt aber über den Poller fehl | Es läuft als Poller-Benutzer mit dessen Umgebung und Berechtigungen |
