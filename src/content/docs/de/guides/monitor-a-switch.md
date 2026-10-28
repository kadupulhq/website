---
title: Einen Switch überwachen
description: Erkennen Sie die Ports eines Switches, stellen Sie die richtigen Zähler grafisch dar und wählen Sie einen Index, damit der Port-Verlauf auch nach einem Kartentausch dem Port zugeordnet bleibt.
banner:
  content: Kadupul befindet sich in der Pre-Alpha-Phase. Validieren Sie diese Verfahren in einer isolierten Testinstallation. Dies ist ein Übersetzungsentwurf, der auf die Prüfung durch eine sprachkundige Person wartet.
sidebar:
  order: 2
---

:::caution[Vor Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder Migrationspfad. Testen Sie diese Verfahren vor dem produktiven Einsatz auf einer isolierten Kopie mit Backups. Siehe [Projektstatus](/de/project/status/).
:::

Ein Switch ist das klassische Szenario für Datenabfragen. Sie wissen nicht im Voraus, wie viele Ports vorhanden sind, die Anzahl kann sich ändern, und jeder Port benötigt eine eigene Datenquelle. Siehe [Vorlagen](/de/concepts/templates/) für die Funktionsweise von Datenabfragen; diese Seite befasst sich mit der korrekten Einrichtung.

## Bevor Sie beginnen

Vergewissern Sie sich, dass das Gerät vom zugewiesenen Kollektor aus antwortet, vorzugsweise als Poller-Benutzer. Verwenden Sie Ihre konfigurierten Nur-Lese-Anmeldedaten. Numerische OIDs vermeiden eine Abhängigkeit von lokal installierten MIB-Namen.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Verwenden Sie SNMP v2c oder v3. Die 64-Bit-Schnittstellenzähler sind SMIv2-Objekte und können über v1 nicht abgerufen werden. Ein v1-Gerät liefert Ihnen nur die 32-Bit-Zähler und sonst nichts.

## Eine Gerätevorlage auswählen

Die Gerätevorlage bestimmt, welche Datenabfragen und Graphvorlagen angeboten werden, wenn Sie das Gerät hinzufügen. Kadupul übernimmt das von Cacti mitgelieferte Vorlagenset, das eine generische SNMP-Gerätevorlage und eine Reihe von herstellerspezifischen Vorlagen umfasst.

Die Port-Erkennung stammt unabhängig von Ihrer Wahl aus derselben Quelle: der Schnittstellendatenabfrage, die in `resource/snmp_queries/interface.xml` definiert ist. Wenn keine Vorlage zu Ihrer Hardware passt, wählen Sie die generische Vorlage und ordnen Sie ihr die Schnittstellenabfrage zu.

## Die Datenabfrage ausführen

Die Abfrage durchläuft `ifIndex`, um die Ports zu finden, und liest `ifNumber` aus, um zu wissen, wie viele zu erwarten sind. Anschließend erfasst sie einen Feldsatz pro Port.

| Feld | OID | Verwendet für |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Die Position in der SNMP-Tabelle |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Kurzer Portname, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Längere Beschreibung |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Die von Ihnen konfigurierte Schnittstellenbeschreibung |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Port-MAC-Adresse |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Geschwindigkeit in Bit/s, 32-Bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Geschwindigkeit in Mbit/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up oder Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | 32-Bit-Byte-Zähler |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | 64-Bit-Byte-Zähler |

Führen Sie die Abfrage einmal für das Gerät aus. Sie gibt eine Tabelle der erkannten Ports zurück. Lesen Sie diese Tabelle, bevor Sie Graphen erstellen, da sie die Grundlage für alle folgenden Entscheidungen bildet.

## Die 64-Bit-Zähler auswählen

Die Schnittstellenabfrage bietet mehrere Graphvorlagen für den Datenverkehr. Die wichtigsten:

| Graphvorlage | Liest |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Dasselbe, mit einer 95.-Perzentil-Linie |
| In/Out Bits (64-bit, BW) | Dasselbe, bezogen auf die Schnittstellengeschwindigkeit |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Verwenden Sie eine 64-Bit-Vorlage, sofern Sie keinen triftigen Grund dagegen haben. Ein 32-Bit-Oktettzähler fasst 4294967295. Ein Gigabit-Port unter Volllast füllt diesen in etwa 34 Sekunden. Bei einem 300-Sekunden-Schritt kann der Poller einen Überlauf nicht von sieben Überläufen unterscheiden, und `COUNTER` korrigiert nur einen einzelnen Überlauf zwischen zwei Abtastwerten. Der Graph wirkt nicht auffällig fehlerhaft, sondern zeigt dauerhaft zu niedrige Werte an.

Prüfen Sie, ob die Zähler tatsächlich gefüllt werden, bevor Sie Hunderte von Graphen erstellen.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Ein leerer oder fehlgeschlagener Walk erfordert eine Untersuchung: Prüfen Sie den gemeldeten Fehler, die Zugriffsansicht und die Agentenunterstützung.

## Das gespeicherte Maximum nach Geschwindigkeitsänderungen prüfen

Wenn die Datenquelle ein Maximum basierend auf der Abfragegeschwindigkeit verwendet, ermittelt die Erstellung die Geschwindigkeit aus zwischengespeicherten Erkennungsdaten. `ifHighSpeed` wird bevorzugt, `ifSpeed` wird verwendet, wenn ersteres fehlt, und ein konfigurierter Standardwert greift, wenn beide null sind.

Dieser Wert wird in die Datei geschrieben. Ein Port, der mit 100 Mbit/s erkannt und später hochgehandelt wurde, kann eine Obergrenze unterhalb seines realen Verkehrs behalten, und RRDtool erfasst Raten oberhalb dieser Grenze als unbekannt. Vergleichen Sie die zwischengespeicherte Geschwindigkeit, die Datenquellendefinition und die tatsächliche Datei mit `rrdtool info`.

## Die Index-Entscheidung

Hier geht bei Fehlern der historische Verlauf verloren.

Jede Datenquelle speichert zwei Dinge über ihren Port: Welches Feld ihn identifiziert (der Indextyp) und den Wert dieses Feldes. Bei jeder Reindizierung wird der Port wiedergefunden, indem gefragt wird, welcher SNMP-Index diesen Wert derzeit in diesem Feld trägt. Die Datenquelle folgt dem Wert, nicht der Tabellenposition.

Die Frage ist also, welches Feld den Wert trägt.

Die Schnittstellenabfrage deklariert eine Präferenzreihenfolge: `ifName`, dann `ifDescr`, dann `ifHwAddr`, dann `ifIndex`. Kadupul wählt normalerweise unter Kandidaten mit ausreichend unterschiedlichen Werten und ohne Duplikate.

| Feld | Übersteht | Schlägt fehl wenn |
|---|---|---|
| `ifName` | Neustarts, Kartentausch, Umnummerierung | Der Agent lässt es leer oder wiederholt es über Stack-Mitglieder hinweg |
| `ifDescr` | Auf Switch-Hardware meist stabil | Auf Servern ein Kernel-Name, der sich ändern kann |
| `ifHwAddr` | Neustarts | Eine ersetzte Karte hat neue MACs, was genau der Fall ist, gegen den Sie sich schützen wollten |
| `ifIndex` | Nichts Verlässliches | Kartentausch, Neustart oder Firmware-Änderung nummeriert die Tabelle neu |

Wenn die Abfrage auf `ifIndex` zurückgreift, betrachten Sie dies als Befund und nicht als normales Ergebnis. Ihr Portverlauf ist dann an eine Nummer gebunden, die der Switch frei neu zuweisen kann.

## Reindizierungsmethode

Wird pro Gerät und Datenabfrage festgelegt. Sie bestimmt, wann Kadupul die Indexfelder neu einliest.

| Methode | Löst aus bei | Kosten |
|---|---|---|
| None | Nichts; nur manuell oder per Skript | Keine |
| Uptime | Rückwärtslaufende SNMP-Betriebszeit des Geräts | Ein Vergleich pro Zyklus |
| Index Count | Änderung der Anzahl erkannter Indizes | Eine Zählung pro Zyklus |
| Verify All | Fehlschlag einer zwischengespeicherten Identitätsprüfung | Prüft bekannte Indizes während des Pollings |

Uptime ist die Standardeinstellung und eignet sich für die meisten Switches, da ein Neustart das Ereignis ist, das Indizes neu nummeriert. Index Count erfasst hinzugefügte oder entfernte Karten ohne Neustart. Verify All kann geänderte Identitäten an bekannten Indizes erkennen, garantiert jedoch nicht die Erkennung neuer Ports.

Um ein ausgewähltes Gerät und eine Abfrage erneut auszuführen, ersetzen Sie beide IDs durch die installierten IDs. Lassen Sie `--qid` weg, um alle Abfragen für dieses Gerät auszuführen:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` erweitert den Lauf auf alle aktivierten Geräte. Vermeiden Sie überlappende Reindizierungsläufe. `--force` umgeht die Prozessregistrierung und aktualisiert Titel-Caches.

## Wenn ein Port verschwindet

Gehen Sie nicht davon aus, dass ein fehlender Port die Erfassung automatisch stoppt. Der aktuelle Reindizierungscode kann ein Orphan-Flag zurücksetzen und die alten Polling-OIDs beibehalten, wenn eine Identität ungelöst ist und keine Quelle den Index ändert. Vergleichen Sie die gespeicherte Identität mit dem neuen Erkennungscache und deaktivieren Sie eine betroffene Quelle, bis die Zuordnung bestätigt ist. Siehe [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/).

## Große Chassis

Zwei gerätespezifische Einstellungen sind wichtig, sobald die Portanzahl hoch wird: Prüfen Sie die konfigurierten OIDs pro SNMP-Anfrage und die Thread-Anzahl pro Gerät. Die Batching-Unterstützung und die effektive Parallelität hängen vom Kollektor und Agenten ab; PHP `cmd.php` und Spine bieten kein identisches Threading-Verhalten.

Ändern Sie jeweils nur eine Einstellung und beobachten Sie die Poller-Laufzeit.

## Fehlermodi

| Symptom | Ursache |
|---|---|
| Graphen erstellt, jeder Messwert unbekannt | 64-Bit-Zähler nicht implementiert, oder das Gerät verwendet SNMP v1 |
| Zähler springen auf absurde Werte | 32-Bit-Zähler läuft mehr als einmal pro Intervall über |
| Lücken nur bei hoher Last | RRD-Maximum auf veraltete erkannte Geschwindigkeit fixiert |
| Port-Verlauf nach Wartung dem falschen Port zugeordnet | Instabile Identität, veraltete Zuordnung oder ungelöste Waisenbehandlung |
| Poller protokolliert Warnung über ungültige SNMP-Indizes | Datenquellen ohne Index zurückgelassen; reindizieren, löschen oder deaktivieren |
| Ports erkannt, nichts wird erfasst | Datenquellen mit leerem Index erzeugen keine Poller-Cache-Einträge |
