---
title: "Sichern und Wiederherstellen"
description: "Drei Komponenten müssen zusammen erfasst werden, sonst ist die Sicherung unvollständig, und die Reihenfolge beim Einspielen ist entscheidend."
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
sidebar:
  order: 7
---

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Ein vollständiger Kadupul-Wiederherstellungssatz besteht aus drei Teilen. Partielle Sicherungen können
die Konfiguration oder Messwerte wiederherstellen, aber nicht die gesamte Installation reproduzieren.

| Teil | Was er enthält | Wo er liegt |
|---|---|---|
| Datenbank | Geräte, Vorlagen, Benutzer, Berechtigungen, den Poller-Cache und den Pfad jeder RRD-Datei | MySQL oder MariaDB |
| RRD-Dateien | Gespeicherte Messwerte und konsolidierte Archive | Das RRA-Verzeichnis, standardmäßig `rra/` unterhalb der Installation |
| Konfiguration | Datenbank-Zugangsdaten, Pfade, Kollektorkonfiguration, Plugin- und Skriptcode | `include/config.php`, die Spine-Konfigurationsdatei, `plugins/`, `scripts/`, `resource/` |

## Was eine reine Datenbanksicherung wiederherstellen kann

Die Datenbank enthält Diagrammdefinitionen und Überwachungskonfigurationen, während RRD-Dateien
die historischen Diagrammarchive aufbewahren. Wenn Boost aktiviert ist, können aktuelle Messwerte
auch in Datenbank-Warteschlangen verbleiben, bis sie in Dateien geschrieben werden. Behalten Sie diese
Warteschlangen als Teil der Datenbanksicherung bei. Siehe [Architektur](/de/concepts/architecture/).

Stellen Sie die Datenbank allein wieder her, erhalten Sie ein System, das vierhundert Geräte kennt,
bei dem jedes Diagramm definiert ist und jedes einzelne davon leer gezeichnet wird. Es beginnt ab dem
Moment, in dem Sie den Poller starten, wieder mit der Datenerfassung, und der Verlauf ist verloren.

## Was einer reinen RRD-Sicherung fehlt

Eine RRD-Datei enthält benannte Datenquellen, Archivdefinitionen und Werte, aber nicht
die vollständigen Kadupul-Geräte-, Abfrage-, Diagramm- und Berechtigungs-Metadaten, die erforderlich
sind, um diese Werte wieder mit der Anwendung zu verknüpfen.

Die Zuordnung von "Eingehende Bytes auf Port 3 von Switch 12" zu einem Pfad auf der Festplatte
befindet sich in der Datenbank in einer Spalte der Datenquelle. Stellen Sie den Dateibaum allein wieder her,
haben Sie mehrere tausend Dateien voller Zahlen, ohne eine Möglichkeit herauszufinden, welche Datei zu
was gehört, es sei denn, Sie rekonstruieren sie mühsam von Hand.

Beide Teile bilden eine Einheit. Behandeln Sie sie auch so.

## Konsistenz zwischen beiden

An dieser Stelle sind die meisten Sicherungsverfahren im Stillen fehlerhaft.

Der Poller schreibt fortlaufend in RRD-Dateien. Eine Datei, die kopiert wird, während eine Aktualisierung
im Gange ist, kann mitten im Schreibvorgang erfasst werden. Zur selben Zeit wird in die Datenbank
geschrieben. Wenn Sie die Datenbank um 02:00 Uhr sichern und um 02:20 Uhr mit dem Kopieren der Dateien
beginnen, beschreiben die beiden Hälften unterschiedliche Zeitpunkte, und jede dazwischen erstellte oder
gelöschte Datenquelle führt zu einer Diskrepanz.

Verzögerte RRD-Schreibvorgänge machen die Situation noch komplizierter und interessanter. In diesem Modus
schreibt der Poller RRD-Dateien nicht bei jedem Durchlauf. Ergebnisse sammeln sich in einer dauerhaften
Datenbanktabelle an und werden später gebündelt geleert. Die Datenbank kann den RRD-Dateien also
legitimerweise um bis zu das Leerungsintervall voraus sein und echte Messwerte enthalten, die nirgendwo
sonst auf der Festplatte liegen.

Wählen Sie eine der folgenden Optionen in absteigender Reihenfolge:

**Koordinierter Snapshot.** Nutzen Sie das vom Datenbank-Engine unterstützte Sicherungs- oder
Quiescing-Verfahren und stimmen Sie es mit Snapshots aller RRD-Speicher und der Anwendungskonfiguration
ab. Ein Dateisystem-Snapshot allein stellt keine Konsistenz über separate Datenträger, entfernte Kollektoren,
ausstehende Warteschlangen oder eine aktive Datenbank hinweg her.

**Angehaltene logische Sicherung.** Deaktivieren Sie geplante Starter und andere Produzenten, warten Sie,
bis bereits laufende Kollektoren beendet sind, leeren Sie dann verzögerte Schreibvorgänge und warten Sie auf
die Flush-Worker. Halten Sie Konfigurationsänderungen, Wartungsaufgaben und andere RRD-Schreibprozesse
während der gesamten Erfassung angehalten. Erfassungspausen können zu fehlenden Stichproben führen; deren
Auswirkung hängt von Heartbeat und Konsolidierung ab.

Schließen Sie vor dem Ausführen des Beispiels diese Quiescing-Schritte ab und überprüfen Sie den Zustand
von Warteschlange und Workern. Dass `poller_boost.php --force` null zurückgibt, ist allein kein Beweis für
eine vollständige Leerung: Ein bereits registrierter Boost-Prozess kann dazu führen, dass der Befehl beendet
wird, ohne die Arbeit auszuführen. Koordinieren Sie einen rrdcached-Dienst oder externen Speicher separat.

Dieses Bash-Beispiel setzt lokalen Speicher, ein in einer privaten Client-Optionsdatei konfiguriertes
Datenbankkonto und ein RRA-Verzeichnis voraus, das alle verwalteten RRDs enthält. Ersetzen Sie jeden Pfad.
Erfassen Sie benutzerdefinierte absolute RRD-Pfade, Symlink-Ziele, externe Konfigurationen und entfernte
Kollektoren und sichern Sie auch diese separat.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

Das Anwendungsarchiv umfasst Konfiguration und passenden Code. Notieren Sie die Quellcode-Revision,
die Versionen von Datenbank und RRDtool, tatsächliche Speicherpfade sowie den Shutdown-/Leerungsstatus
der Schreibprozesse zusammen mit dem Sicherungssatz. Das Beispiel schließt gewöhnliche Protokolle, Cache
und Git-Metadaten aus; überprüfen Sie diese Ausschlüsse für Ihre Installation.

Nur ein erfolgreich erfasster und mit Prüfsummen versehener Satz erhält den endgültigen Verzeichnisnamen.
Ein fehlgeschlagener Befehl kann dennoch eine unvollständige Datei innerhalb von `.partial-*` hinterlassen;
`set -e` bricht nachfolgende Befehle ab, entfernt jedoch keine bereits erstellten Ausgaben. Wandeln Sie
ein solches Verzeichnis nicht in eine fertige Sicherung um. Prüfsummen erkennen spätere Änderungen,
nicht die logische Vollständigkeit; ein Wiederherstellungstest bleibt unverzichtbar.

`--single-transaction` deckt transaktionale Tabellen ab, stellt jedoch keinen konsistenten Snapshot von
nicht-transaktionalen Plugin-Tabellen oder gleichzeitigen Schemaänderungen dar. Halten Sie Schreibprozesse
und Schemaänderungen angehalten, oder verwenden Sie eine für die jeweilige Engine geeignete
Sicherungsmethode. Nehmen Sie die Datenerfassung erst wieder auf, nachdem Sie bestätigt haben, dass die
Erfassung abgeschlossen und der Speicher nutzbar ist. Siehe die
[mysqldump-Dokumentation](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) für Transaktions- und
Berechtigungsanforderungen. Die Auslassungen des früheren Rezepts werden in
[website #12](https://github.com/kadupulhq/website/issues/12) nachverfolgt.

**Akzeptieren Sie den Zeitversatz und protokollieren Sie ihn.** Welcher Teil auch immer zuerst erfasst
wird, ist der ältere, und keine Reihenfolge macht ein aktives Paar von sich aus konsistent. Halten Sie
das Zeitfenster schriftlich fest; das macht das Ergebnis wiederherstellbar.

Wird zuerst die Datenbank exportiert und danach die Dateien kopiert, sind die Dateien neuer. Eine innerhalb
dieses Fensters gelöschte Datenquelle ist im Dump noch vorhanden, ihre Datei jedoch gelöscht, was eine
Referenz hinterlässt, die der Poller neu anlegen wird. Eine innerhalb des Fensters erstellte Datenquelle
kommt als Datei an, die der Datenbank unbekannt ist und daher ungenutzt bleibt.

Werden zuerst die Dateien kopiert und danach die Datenbank gesichert, ist die Datenbank neuer. Eine
innerhalb dieses Fensters erstellte Datenquelle existiert im Dump ohne zugehörige Datei, die der Poller leer
neu anlegt.

Beide Reihenfolgen können den Verlauf vor dem Zeitfenster verlieren, wenn eine benötigte Datei gelöscht
wird, bevor sie kopiert werden kann. Es kann auch eine unvollständig geschriebene Datei oder inkonsistente
Warteschlangeneinträge erfassen. Das Festhalten des Versatzes dokumentiert eine Einschränkung; es macht ein
inkonsistentes Paar weder vollständig noch garantiert es die Wiederherstellbarkeit.

## Was in der Sicherung steckt, woran Sie nicht gedacht haben

Gerätezugangsdaten befinden sich im Klartext in der Datenbank. Der Poller-Cache führt
SNMP-Community-Strings sowie SNMPv3-Benutzernamen, Passwörter und Passphrasen als einfache
Spalten, da der Kollektor sie bei jedem Durchlauf benötigt. Die Konfigurationsdatei
enthält das Datenbankpasswort.

Eine Kadupul-Sicherung ist daher ein Speicher für Zugangsdaten jedes überwachten Geräts.
Verschlüsseln Sie sie im Ruhezustand, beschränken Sie den Lesezugriff und legen Sie sie nicht
auf einer allgemeinen Dateifreigabe ab.

## Reihenfolge der Wiederherstellung

Die Reihenfolge ist wichtig, da jeder Schritt vom vorherigen abhängt.

1. **Zuerst die Konfiguration wiederherstellen.** Ohne Datenbank-Zugangsdaten und den
   RRA-Pfad kann nichts anderes überprüft werden. Erfolgt die Wiederherstellung auf anderer
   Hardware, korrigieren Sie die Pfade jetzt und nicht erst danach.

2. **Den RRD-Baum wiederherstellen.** Platzieren Sie ihn dort, wo es die Konfiguration vorsieht.
   Prüfen Sie Eigentümerschaft und Dateirechte: Der Poller schreibt diese Dateien als Poller-Benutzer,
   und die Weboberfläche liest sie als Webserver-Benutzer. Eine Wiederherstellung, die Inhalte, aber
   nicht die Eigentümerschaft bewahrt, führt zu einem System, das Diagramme fehlerfrei darstellt,
   aber keine neuen Daten erfasst.

3. **Die Datenbank wiederherstellen.** Die Versionstabelle im Dump muss mit dem Code übereinstimmen,
   auf den Sie wiederherstellen. Halten Sie alle Starter und Schreibprozesse deaktiviert, bis die
   wiederhergestellten Komponenten gemeinsam überprüft wurden. Ein Dump aus einer älteren Version,
   der auf neuerem Code wiederhergestellt wird, leitet die Weboberfläche zum Installationsprogramm weiter,
   was das korrekte Verhalten ist, aber nicht das, was Sie mitten in einer Wiederherstellung wünschen.
   Stellen Sie zuerst den passenden Code wieder her.

4. **Den Poller-Cache neu aufbauen.** Der Cache ist abgeleitet, und eine Wiederherstellung ist genau
   die Situation, in der er veraltet sein kann. Der Neuaufbau erfordert einen Durchlauf und beseitigt
   eine ganze Kategorie verwirrender Symptome.

5. **Den Poller starten, dann eine Datei prüfen.** Vergewissern Sie sich, dass sich der letzte
   Aktualisierungszeitpunkt einer RRD-Datei nach dem ersten Durchlauf ändert. Wenn die Diagramme bis
   zum Wiederherstellungspunkt gefüllt sind und danach flach bleiben, prüfen Sie Erfassungsergebnisse,
   Warteschlangen, Zeitstempel, Pfade und Berechtigungen. Ein flaches Diagramm allein lässt nicht auf
   die Ursache schließen.

## Stolperfallen

**RRD-Dateien weisen Aktualisierungen in der Vergangenheit zurück.** Eine RRD-Datei akzeptiert keine
Messwerte zu oder vor dem Zeitstempel, den sie bereits enthält. Das Wiederherstellen eines älteren
Dateisatzes gegenüber einer neueren Datenbank füllt verlorene Messwerte nicht automatisch nach.
Beibehaltene verzögerte Warteschlangen oder andere Quellen können wiederherstellbare Werte enthalten,
ein erneutes Einspielen erfordert jedoch eine separate Prüfung und Zeitstempel-Reihenfolge. Ohne diese
Messwerte setzt die Erfassung mit einer Lücke fort. Dies ist auch der Grund, warum zwei Sicherungen nicht
durch Kopieren von Dateien zwischen ihnen zusammengeführt werden können.

**Prüfen Sie, ob gespeicherte Pfade tokenisiert sind, bevor Sie etwas umschreiben.**
Generierte Datenquellen speichern den Pfad als `<path_rra>/name.rrd`, und das Token wird zur Lesezeit
über die RRD-Pfadeinstellung aufgelöst. Für diese bedeutet ein Verschieben der Installation, die Einstellung
zu ändern und den Poller-Cache neu aufzubauen, anstatt Zeilen in der Datenbank zu ändern. Pfade, die
manuell eingegeben wurden, sind buchstabengetreu gespeichert und müssen umgeschrieben werden. Prüfen Sie
dies, bevor Sie ein Update über die gesamte Tabelle ausführen, da das Umschreiben tokenisierter Pfade in
absolute Pfade der Schritt ist, der den nächsten Umzug erschwert.

**Entfernte Kollektoren besitzen ihre eigene Konfigurationsdatei.** Jeder Kollektor verwaltet seine eigenen
Datenbank-Zugangsdaten und seine Kollektor-ID. Sie sind nicht in der zentralen Datenbanksicherung enthalten.
Erfassen Sie diese pro Host.

**Plugin-Daten befinden sich in derselben Datenbank.** Plugins erstellen ihre eigenen Tabellen bei der
Installation, sodass ein vollständiger Datenbank-Dump sie abdeckt. Plugin-Code befindet sich nicht in
der Datenbank. Wenn Sie die Datenbank ohne das passende Verzeichnis `plugins/` wiederherstellen, deaktiviert
die Installation alles, was sie nicht finden kann.

**Eine Sicherung, die Sie nicht wiederhergestellt haben, ist eine Hypothese.** Stellen Sie die Sicherung
nach einem festen Zeitplan in einer Testumgebung wieder her. Das Fehlermuster, das dadurch am häufigsten
aufgedeckt wird, ist keine Beschädigung; es ist eine Sicherung, die von vornherein nur einen der drei
Teile erfasst hat.
