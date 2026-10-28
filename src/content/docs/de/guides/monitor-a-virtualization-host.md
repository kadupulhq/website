---
title: Einen Virtualisierungs-Host überwachen
description: Was ein Hypervisor über SNMP bereitstellt, was für ESXi mitgeliefert wird und warum das Zählen von Gästen, CPU und Speicher in einer virtualisierten Umgebung schwieriger ist, als es aussieht.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Überprüfung durch einen muttersprachlichen Sprecher wartet.
sidebar:
  order: 27
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor Sie sich
darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Das mitgelieferte ESXi-Paket erfasst Host-Messwerte und Zählungen des Gast-Inventars.
Es liefert keine Messungen von CPU, Speicher oder Ressourcen-Contention pro Gast. Überprüfen Sie die
von Ihrer Hypervisor-Version bereitgestellten Objekte, bevor Sie Diagramme auswählen.

## Was mitgeliefert wird

Eine Hypervisor-Gerätevorlage wird mitgeliefert: **ESXi Device**. Es handelt sich um ein Gerätepaket, daher
enthält `install/templates/ESXi_Device.xml.gz` dessen Skripte und Datenabfragedateien.
Befolgen Sie [Vorlagen importieren und exportieren](/de/guides/import-and-export-templates/) und stellen Sie sicher,
dass der Import einschließlich der Dateibereitstellung abgeschlossen ist. Wählen Sie die Gerätevorlage aus,
überprüfen Sie die Erkennung und erstellen Sie die gewünschten Diagramme explizit; das Importieren des Pakets
oder das bloße Zuordnen einer Gerätevorlage erstellt diese nicht.

| Wird mitgeliefert | Zweck |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Erkennt Prozessoren und liest die Auslastung pro Prozessor |
| `resource/snmp_queries/esxi_hw.xml` | Erkennt Hardwarekomponenten und liest deren Status |
| `resource/snmp_queries/interface.xml` | Die Standardabfrage für Schnittstellenstatistiken |
| `resource/script_server/host_disk.xml` | Eingehängte Partitionen über die Host Resources-Speichertabelle |
| `scripts/ss_esxi_vhosts.php` | Gebündelt in `install/templates/ESXi_Device.xml.gz`; zählt Gäste, eingeschaltete Gäste und Gast-Tools-Status |
| `scripts/ss_multicpu_avg.php` | Bildet den Durchschnitt der Auslastung aller Prozessoren zu einem Wert |
| `scripts/ss_hstats.php` | Liest Abfragestatistiken, die Kadupul bereits für das Gerät vorhält |
| `scripts/ss_host_disk.php` | Unterstützt die Partitionsabfrage |

In diesem Checkout wird kein dediziertes Gerätepaket für Hyper-V, KVM/libvirt, Xen oder Proxmox mitgeliefert.
Generische Linux-/Windows-Vorlagen können Host-Metriken abdecken, die von deren Agenten unterstützt werden;
die hypervisorspezifische Erfassung erfordert geeignete Vorlagen und Kollektoren. Siehe
[Ein Datenerfassungsskript schreiben](/de/guides/write-a-data-collection-script/).

## Den Agenten zuerst aktivieren

Überprüfen Sie die vorhandene Agentenkonfiguration und verwenden Sie Anweisungen für Ihre ESXi-Version.
Die Paketnotizen enthalten einen Werksreset; dies ist keine routinemäßige Voraussetzung und
würde die bestehende SNMP-Konfiguration löschen. Für ein Community-basiertes Setup legen die folgenden
Befehle Agentenwerte fest; ersetzen Sie die Beispiele und behalten Sie alle erforderlichen vorhandenen
Communitys bei, wenn Sie die Community-Liste festlegen.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Der erste Befehl zeigt die Konfiguration an; der letzte aktiviert den Agenten. Die Community-Option
ersetzt die konfigurierte Liste. Prüfen Sie den erforderlichen Firewall-Zugriff vom Poller aus
und konsultieren Sie die [ESXCLI SNMP-Befehlsreferenz](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Diese Befehle konfigurieren community-basierte Abfragen; sie konfigurieren kein SNMPv3.
Überprüfen Sie die Verbindung von der Maschine aus, auf der der Poller läuft, bevor Sie das Gerät hinzufügen.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Wenn der erste Befehl funktioniert und der dritte nichts zurückgibt, prüfen Sie den SNMP-Fehler,
die Zugriffsrichtlinie und die Agentenunterstützung; ein leerer Walk allein identifiziert die Ursache nicht. Das
gebündelte Gast-Skript verwendet SNMPv1, daher validiert ein erfolgreicher v2c-Test dessen
Erfassungspfad nicht. Leere Gast-Walks erzeugen Nullzählungen, nicht unbedingt Diagrammlücken;
siehe [den Fehler bei leeren Ergebnissen](https://github.com/kadupulhq/kadupul/issues/245).

## Was der Host bereitstellt

| Bereich | Teilbaum | Liefert |
|---|---|---|
| Prozessoren | `.1.3.6.1.2.1.25.3.3.1` | Auslastung für jeden vom Agenten gemeldeten Prozessor |
| Hardwarekomponenten | `.1.3.6.1.2.1.25.3.2.1` | Komponentenindex, Beschreibung und Status |
| Speicher | `.1.3.6.1.2.1.25.2.3.1` | Datenspeicher und lokale Dateisysteme, wie der Agent sie meldet |
| Schnittstellen | `.1.3.6.1.2.1.2` und `.1.3.6.1.2.1.31` | Datenverkehr, Fehler, Status |
| Gast-Inventar | `.1.3.6.1.4.1.6876` | Energiezustand und Gast-Tools-Status pro Gast |

Die ersten vier sind die standardmäßigen Host Resources- und Schnittstellentabellen, dieselben, mit denen
auch ein Linux-Host antwortet. Siehe [Einen Linux-Server überwachen](/de/guides/monitor-a-linux-server/)
für deren Verhalten und welche Festplattentabelle bevorzugt werden sollte.

Der fünfte ist der Hersteller-Teilbaum, der vom mitgelieferten Skript zur Gastzählung verwendet wird.

## Die Diagrammvorlagen

| Diagramm | Quelle | Liest |
|---|---|---|
| ESXi - CPU | Datenabfrage | Auslastung für einen erkannten Prozessor |
| ESXi - MultiCPU Average | Skript | Mittelwert der Auslastung aller Prozessoren |
| ESXi - Hardware | Datenabfrage | Status einer erkannten Komponente |
| ESXi - VHosts | Skript | Gastzahlen und Gast-Tools-Status |
| Host MIB - Processes | Feste OID | Prozessanzahl auf dem Host |
| Host MIB - Logged in Users | Feste OID | Sitzungsanzahl auf dem Host |
| Device - Uptime | Skript | Betriebszeit, wie von Kadupul zuletzt aufgezeichnet |
| Device - Polling Time | Skript | Wie lange Kadupul für die Abfrage dieses Geräts benötigte |
| Schnittstellendiagramme | Datenabfrage | Datenverkehr, Fehler, Pakete, Status pro Schnittstelle |

Die Prozessorabfrage liest die Auslastung pro erkanntem Eintrag. Gehen Sie nicht davon aus, dass deren
Zeilenanzahl der Hardware-Thread-Anzahl des Hosts entspricht: Das gepackte Indexmuster akzeptiert nur
ein- oder zweistellige Indizes und weist Werte ab 100 ab, selbst auf einem Host mit wenigen CPUs.
Vergleichen Sie die Erkennung mit einem direkten Walk; siehe [den CPU-Index-Bug](https://github.com/kadupulhq/kadupul/issues/246).
Das Durchschnittsskript durchläuft die Prozessorauslastungen unabhängig und mittelt die zurückgegebenen Zeilen.

Device - Uptime und Device - Polling Time lesen den gespeicherten Gerätedatensatz von Kadupul.
Der Uptime-Helper gibt die gespeicherte SNMP-Betriebszeit zurück, ohne die verstrichene Zeit zu extrapolieren;
die Polling-Zeit beschreibt die Erfassungsdauer von Kadupul. Ein alter gespeicherter Wert beweist keine
aktuelle Erreichbarkeit. Wenn die Erfassung stoppt, generieren diese Hilfsskripte keine neuen Werte.

## Die Zählprobleme

Dies ist der Teil, der die Virtualisierung von einem physischen Server unterscheidet, und nichts
davon wird durch eine Diagrammvorlage gelöst.

**Gäste bewegen sich.** Ein Gast, der auf einen anderen Host migriert, verschwindet aus dem Inventar des ersten Hosts
und erscheint auf dem des zweiten. Unabhängig getaktete Abfragen können diesen Gast vorübergehend
doppelt zählen oder auslassen. Zählungsänderungen allein beweisen keine Migration: Verwenden Sie
Hypervisor-Inventaridentitäten und -Ereignisse, um sie zu erklären.

**Ressourcen werden geteilt, daher ist die Zuordnung pro Gast eine Schätzung.** Der Host meldet
die physische Prozessorauslastung. Er meldet nicht, welcher Gast sie verursacht hat. Das Teilen der Host-CPU
durch die Gastanzahl ergibt eine Zahl, die arithmetisch korrekt ist und keine sinnvolle Frage beantwortet.

**Overcommit führt dazu, dass Zuweisung und Nutzung unterschiedliche Größen sind.** Zugewiesene virtuelle CPUs
können physische Kerne übersteigen, und zugewiesener Speicher kann den physischen Speicher bewusst übersteigen. Ein
Diagramm der zugewiesenen Ressourcen beschreibt die Zuteilung und nicht den gemessenen Bedarf.
Vergleichen Sie es mit physischer Kapazität, konfigurierten Grenzwerten und tatsächlicher Nutzung.

**Contention erscheint nicht in diesen Tabellen.** Die Messwerte, die anzeigen, dass ein Gast
ausgehungert wird – die Zeit, die er auf einen physischen Prozessor gewartet hat, und der Speicher, den der
Host von ihm zurückgefordert hat – sind nicht in dem enthalten, was diese Vorlage erfasst. Ein Host mit 60 Prozent
CPU-Auslastung und stark konkurrierenden Gästen sieht hier identisch aus wie ein Host mit 60 Prozent CPU und
zufriedenen Gästen.

**Gast- und Host-Messungen beantworten unterschiedliche Fragen.** Die Gast-Auslastung allein
erklärt möglicherweise keine Planungsverzögerungen des Hosts. Korrelieren Sie Gast-/Anwendungsmessungen
mit Hypervisor-Contention-Metriken, anstatt Zuordnungen aus der Host-Auslastung abzuleiten.

### Was stattdessen zu tun ist

| Frage | Wo sich die Antwort befindet |
|---|---|
| Ist der Host ausgelastet | Host-Prozessorauslastung, direkt vom Host |
| Ist ein Gast ausgelastet | Innerhalb des Gastes, plus eine Contention-Metrik des Hypervisors |
| Wie viele Gäste laufen | Gast-Inventar des Hosts als Zählung |
| Ist die Umgebung überlastet | Nicht aus diesen Diagrammen. Erfordert Platzierungsdaten, die der Host nicht offenlegt |
| Hat sich ein Gast bewegt | Hypervisor-Inventaridentitäten und Migrationsereignisse; Zählschritte allein reichen nicht aus |

Überwachen Sie Gäste als eigene Geräte für alles, was den Gast betrifft, und überwachen Sie den Host
für alles, was den Host betrifft. Widerstehen Sie dem Aufbau von Pro-Gast-Diagrammen aus Zahlen auf Host-Ebene:
Sie sind abgeleitet, wirken maßgeblich und sind auf Weisen falsch, die später niemand mehr nachvollziehen kann.

## Fallstricke bei der mitgelieferten Gastzählung

Das Skript für das Gast-Inventar sollte verstanden werden, bevor man sich auf dessen Ausgabe verlässt.

**Es arbeitet ausschließlich mit SNMP Version 1 und dem Community-String.** Die Version ist im
Skript fest verdrahtet und die v3-Anmeldeinformationen des Geräts werden nicht übergeben. Ein für
v3 konfiguriertes Gerät kann über andere Pfade erfassen, während die Gast-Erfassung fehlschlägt. Die Gast-Erfassung kann
dennoch erfolgreich sein, wenn dieser Agent die gespeicherte Community unabhängig über v1 akzeptiert;
die Auswahl von v3 auf dem Gerät bestimmt das Ergebnis für sich allein nicht. Leere Gast-Walks
werden als Nullen zurückgegeben. Prüfen Sie diese Protokolldiskrepanz, ohne die Sicherheitsrichtlinie
eines Agenten herabzusetzen, um dem Hilfsskript entgegenzukommen.

**Die Zählung stammt aus der Energiezustandstabelle.** Die als Gesamtzahl der Gäste gemeldete Zahl
ist die Anzahl der Einträge, die von einem Walk des Energiezustands-Teilbaums zurückgegeben werden, nicht von einem
separaten Inventarobjekt. Ein Gast, den der Host auflistet, der aber keinen Energiezustandseintrag hat,
wird nicht gezählt.

**Eingeschaltet wird anhand des Statustextes abgeglichen.** Nach dem Trimmen und Umwandeln in Kleinbuchstaben
erhöhen nur `powered on` und `poweredon` den Zähler der laufenden Systeme. Andere Darstellungen tun dies
nicht; vergleichen Sie die Rohantwort des Agenten, bevor Sie eine Null interpretieren.

**Die Einstufung der Gast-Tools hat einen bestätigten Fehler.** Die Zeichenfolge `not installed`
wird als aktiv gezählt, da die Übereinstimmung bei Offset Null beginnt. Nicht erkannter Text
fällt ebenfalls auf aktiv zurück. Betrachten Sie diese Zählung nicht als Beweis für funktionsfähige Tools;
siehe [den Tools-Status-Bug](https://github.com/kadupulhq/kadupul/issues/244).

**Es führt drei Abfragen pro Aufruf durch.** Es liest die Energiezustandstabelle zweimal, dann die
Tools-Tabelle, sodass selbst seine eigenen Zählungen keinen atomaren Inventar-Snapshot darstellen. Bei einem Host
mit vielen Gästen sollten Sie diesen Erfassungsaufwand messen. Wenn der Poller knapp bemessen ist, ist dies eher ein Kandidat für ein längeres Intervall als
für mehr Threads. Siehe [Den Poller skalieren](/de/guides/scale-the-poller/).

Das Skript gibt normalerweise alle fünf benannten Werte aus, einschließlich Nullen für leere Walks.
Ein fehlgeschlagener Walk kann daher eine syntaktisch vollständige, aber irreführende Stichprobe liefern.
Bei unvollständiger Ausgabe prüft der PHP-Ausgabeprozessor die von der zugeordneten Datenquelle benötigten
Felder und hält unvollständige Zeitstempelgruppen zurück; er verwirft sie nicht zwingend sofort.
Siehe [Der Poller-Cache](/de/concepts/the-poller-cache/).

## Fallstricke beim Rest

**Der Prozessordurchschnitt verbirgt Ungleichgewichte.** Ein Host mit einem voll ausgelasteten Kern und 63 unbeschäftigten
weist einen niedrigen Durchschnitt auf. Behalten Sie validierte Diagramme pro Prozessor bei, wo dies wichtig ist. Das
Durchschnitts-Hilfsskript gibt außerdem `load:0` für einen leeren Walk zurück, was von einer gemessenen Leerlauf-CPU
nicht zu unterscheiden ist; korrelieren Sie dies mit dem Erfassungsstatus und dem bekannten Fehler bei leeren Ergebnissen.

**Prozessorindizes sind positionsabhängig.** Sie werden durch Durchlaufen der Prozessortabelle
ermittelt. Wenn sich Agentenindizes ändern, überprüfen Sie die Identitätszuordnungen, bevor Sie der Kontinuität vertrauen.
Die mitgelieferte Einschränkung auf ein oder zwei Ziffern ist ein separater Erkennungsfehler.

**Speichereinträge sind alles, was der Agent als Speicher bezeichnet.** Rechnen Sie mit Datenspeichern,
die mit unerwünschten Elementen vermischt sind, in Zuordnungseinheiten, die multipliziert werden müssen. Dies ist das
Verhalten von Host Resources, keine ESXi-Eigenheit. Überprüfen Sie zwischengespeicherte Zuordnungseinheiten, bevor
Sie Bytes interpretieren; das gemeinsam genutzte Skript hat einen [bekannten Umrechnungsfehler](https://github.com/kadupulhq/kadupul/issues/243)
bei ungültigen negativen Werten oder fehlenden Multiplikatoren.

**Schnittstellennamen auf einem Hypervisor sind stabil, bis sie es nicht mehr sind.** Ein Treiberupdate oder eine
Rekonfiguration kann sie neu nummerieren. Siehe [Einen Switch überwachen](/de/guides/monitor-a-switch/) für die
Art und Weise, wie der Index gewählt wird und warum dies wichtig ist.

**Die Skripte laufen auf dem Poller-Host.** Sie erreichen den Hypervisor selbst über die
Geräte-ID, die vom zwischengespeicherten Befehl übergeben wird. Die Gast- und CPU-Durchschnittshilfen rufen bei jedem
Aufruf die aktuelle Gerätezeile ab; eine Änderung der Community erfordert keinen Neuaufbau
dieser Befehlsargumente. Andere Kollektoren können Anmeldeinformationen in ihren Arbeitselementen einbetten.
Siehe [Der Poller-Cache](/de/concepts/the-poller-cache/).

## Fehlermodi

| Symptom | Häufige Ursache |
|---|---|
| Alles wird erfasst, außer Gastzahlen | Gerät ist für SNMPv3 konfiguriert und das Gast-Skript spricht v1 |
| Gastanzahl stimmt, Anzahl eingeschalteter Gäste ist null | Überprüfen Sie den genauen Statustext und ob der zweite Walk erfolgreich war |
| Gastanzahl fällt auf null und erholt sich | Überprüfen Sie fehlgeschlagene/leere Walks; das Hilfsskript kann eine vollständige Zeile aus Nullen ausgeben |
| Prozessordiagramme erscheinen und stoppen nach Hardwareänderung | Prüfen Sie geänderte Indizes und die Begrenzung auf ein oder zwei Ziffern |
| Host-CPU flach und niedrig, während Gäste langsam sind | Prüfen Sie Erfassungsfehler sowie Contention; ein leerer Durchschnittswalk wird als null gemeldet |
| Datenspeicher-Diagramme enthalten nicht angeforderte Partitionen | Der Agent meldet sie als Speicher |
| Betriebszeit-Diagramm sieht nach Poller-Ausfall falsch aus | Es meldet Kadupuls zuletzt gespeicherten Wert, keinen Live-Wert |
| Gesamtzahl der Gäste über Hosts springt während Wartung | Migrierende Gäste werden kurzzeitig doppelt oder gar nicht gezählt |
