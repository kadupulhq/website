---
title: Auf neue Hardware migrieren
description: Verschieben einer laufenden Installation auf einen anderen Server ohne Verlust des Verlaufs, in einer Reihenfolge, die jeden Schritt überprüfbar hält.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 20
---

:::caution[Übernommenes RRDtool-Proxy-Verhalten]
Der RRDtool-Proxy-Einsatz wird in Kadupul nicht unterstützt. Verwenden Sie lokalen RRDtool-Speicher
(`storage_location = 0`). Proxy-Einstellungen, Protokollbeschreibungen und Arbeitsabläufe
auf dieser Seite dokumentieren übernommenes Verhalten, keine unterstützte Bereitstellung oder
einen Migrationspfad. Siehe [RRDtool-Proxy](/de/reference/rrdproxy/).
:::

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Eine Migration ist eine Wiederherstellung auf einem Rechner, der sich von dem unterscheidet,
von dem das Backup stammt. Alles unter [Sichern und Wiederherstellen](/de/guides/back-up-and-restore/)
gilt auch hier; diese Seite behandelt nur das, was sich unterscheidet, weil das Ziel nicht die Quelle ist.

Drei Dinge weichen ab, und jedes führt zu einer eigenen Fehlerart.

| Unterschied | Was dadurch gestört wird |
|---|---|
| Unterschiedliche Pfade | Gespeicherte Dateipfade in der Datenbank und im Poller-Cache |
| Unterschiedliche Benutzer- und Gruppen-IDs | Dateizugriff und Speicher-Vertrauensprüfungen können fehlschlagen |
| Unterschiedliche Laufzeitversionen | Erweiterungen, Datenbankverhalten und RRD-Kompatibilität können abweichen |

## Bevor Sie irgendetwas anfassen

Bauen Sie zuerst das Zielsystem auf und bringen Sie es an den Punkt, an dem eine Neuinstallation
funktionieren würde: Datenbankserver läuft, erforderliche PHP-Erweiterungen vorhanden, RRDtool
vorhanden, der ausgewählte Kollektor verfügbar und der Webserver konfiguriert. Halten Sie dessen
Poller, geplante Jobs, Remote-Replikation und ausgehende Benachrichtigungen deaktiviert. Führen Sie
den Installer nicht aus. Sie werden die Datenbank ersetzen, und ein halb installiertes Schema ist
schwerer zu diagnostizieren als ein leeres.

Stimmen Sie die Anwendungsrevision und Abhängigkeiten exakt ab, einschließlich lokaler Änderungen
und Plugins. Die Datenbanktabelle `version` zeichnet die Schemaversion auf, nicht jede Quellcodeänderung;
diesen Wert allein abzugleichen reicht nicht aus. Eine Umleitung auf den Installer kann auf eine
Schema-Diskrepanz oder eine unvollständige Wiederherstellung hinweisen. Installieren Sie denselben Code,
den Sie verlassen, migrieren Sie, bestätigen Sie die Funktion und führen Sie Upgrades anschließend
als separate Maßnahme gemäß [Sicher aktualisieren](/de/guides/upgrade-safely/) durch.

Entscheiden Sie jetzt über den Installationspfad. Wenn Sie ihn auf beiden Rechnern identisch halten,
entfällt der Großteil der unten aufgeführten Arbeiten. Wenn dies nicht möglich ist, lesen Sie den
Abschnitt über Pfade, bevor Sie beginnen.

## Reihenfolge der Arbeitsschritte

Jeder Schritt überprüft den vorherigen, ändern Sie daher nicht deren Reihenfolge.

1. **Stoppen Sie alle Produzenten auf Quelle und Ziel.** Stoppen Sie geplante, Remote-, Web-getriggerte und manuelle Erfassungen sowie Wartungsläufe; lassen Sie laufende Durchläufe zu Ende führen. Leeren Sie verzögerte Schreibvorgänge erst, nachdem Produzenten gestoppt sind. Erhalten Sie unbestätigte Warteschlangen-Zeilen mit dem passenden Datenbank- und RRD-Backup; schneiden Sie diese nicht ab.
2. **Erstellen Sie das Backup.** Datenbank, RRD-Baum, Konfiguration, gemeinsam erfasst. Die Konsistenzregeln in [Sichern und Wiederherstellen](/de/guides/back-up-and-restore/) sind der entscheidende Punkt.
3. **Verschieben Sie den RRD-Baum.** Wie das geht, erfahren Sie weiter unten.
4. **Verschieben Sie die Datenbank.**
5. **Verschieben Sie den Code, die Konfiguration und alles, worauf die Konfiguration verweist.** Dazu gehören `plugins/`, `scripts/`, `resource/` und jede lokale Datei, die eine Dateneingabemethode aufruft.
6. **Wenden Sie die Zielkonfiguration nach der endgültigen Wiederherstellung erneut an.** Korrigieren Sie Pfade, Datenbank-Endpunkte, Dienst-Eigentümer und numerische Speicher-Vertrauenseinstellungen.
7. **Bauen Sie den Poller-Cache neu auf.**
8. **Führen Sie Speicherprüfungen unter jedem Dienstkonto aus und starten Sie die Erfassung erst danach ausschließlich auf dem Ziel.** Beobachten Sie repräsentative Dateien und die Tiefe verbliebener Warteschlangen.

## Den RRD-Baum übertragen

Eine RRD-Datei ist eine Binärdatei mit einem internen Layout, das davon abhängt, wie sie geschrieben wurde.
Eine binäre Kopie erfordert eine kompatible Architektur und ein kompatibles RRDtool-Format; das alleinige
Übereinstimmen von Betriebssystemnamen oder Wortbreiten ist kein Beweis. Inkompatibilität kann zu Lesefehlern
führen. Validieren Sie kopierte Dateien mit dem RRDtool des Zielsystems.

Wenn Sie nicht sicher sind, ob beide übereinstimmen, konvertieren Sie, anstatt zu kopieren. Dump und
Restore von RRDtool selbst erzeugen ein portables Textformat; Kadupul verwendet intern dasselbe Paar,
wenn es ein Archiv neu schreiben muss.

Auf dem Quellsystem bei gestoppten Schreibern ein neues privates Bereitstellungsverzeichnis verwenden:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Übertragen Sie die fertige XML-Datei sicher. Stellen Sie sie auf dem Zielsystem in einer neuen Kandidatendatei wieder her:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Wiederholen Sie dies für jede Datei, die eine Konvertierung benötigt, und prüfen Sie den Exit-Status
jedes Befehls. Installieren Sie keine partiellen Dumps oder unbestätigten Kandidaten. RRDtool dokumentiert
XML als das [Architektur-Transfer-Format](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Vergewissern Sie sich, bevor Sie sich auf den langsamen Weg festlegen. Kopieren Sie eine Datei, führen
Sie darauf auf dem Zielsystem `rrdtool info` aus und vergleichen Sie Schrittweite, Archive,
Zeitstempel der letzten Aktualisierung und Datenquellennamen. Vergleichen Sie auch die `fetch`-Ergebnisse
über ein bekanntes, mit Daten gefülltes Intervall. Wiederholen Sie dies für repräsentative Archiv-Layouts,
bevor Sie den gesamten Baum übertragen, und überprüfen Sie anschließend den vollständigen Dateibestand.
Siehe [RRD-Wiederherstellung](/de/guides/recover-a-corrupted-rrd/) für Kandidatenvalidierung und Eigentumsanforderungen.

Auf welche Weise auch immer Sie die Dateien übertragen, bewahren Sie die Verzeichnisstruktur exakt bei.
Verschachtelte Unterverzeichnisse unterhalb des RRA-Verzeichnisses sind keine Dekoration; der Pfad jeder
Datei wird pro Datenquelle aufgezeichnet, und ein verflachter Verzeichnisbaum beschädigt jede einzelne davon.

## Die Datenbank

Ein Dump und ein Einspielen. Zwei Dinge, die auf der Gegenseite zu prüfen sind.

Prüfen Sie Zeichensätze, Kollationen und Speicher-Engines der wiederhergestellten Tabellen, nicht nur
die Server-Standardwerte. Erhalten Sie Quelldefinitionen und überprüfen Sie die Kompatibilität mit der
Version der Zieldatenbank vor dem Cutover.

**Kollektor-Warteschlangen sind keine wegwerfbaren Caches.** Die aktuelle Warteschlange `poller_output`
muss InnoDB verwenden. Die Speicher-Vorabprüfung verweigert eine MEMORY-Warteschlange. Erhalten Sie deren
Zeilen sowie die Boost- und Echtzeit-Warteschlangen, bis Messwerte bestätigt sind; ein RRD-Backup enthält
diese Messwerte möglicherweise noch nicht. Gehen Sie nicht davon aus, dass eine wiederhergestellte MEMORY-Tabelle
leer ist: Ein logischer Dump kann Inserts enthalten, die sie erneut befüllen.

Bei gestoppten Schreibern und beibehaltenen Backups kann eine übernommene Nicht-InnoDB-Warteschlange
explizit konvertiert werden:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Führen Sie die Speicherprüfung unter jedem tatsächlichen Web- und Poller-Konto aus. Sie prüft den lokalen
Speicherzugriff und die ausgewählte Warteschlange; ein Erfolg als root belegt nicht den Zugriff des Dienstes.
Online befindliche Remote-Kollektoren zielen normalerweise auf die Hauptwarteschlange ab; verwenden Sie
`--local` nur, wenn Sie absichtlich deren lokale Warteschlange prüfen. Andere Laufzeit-/Cache-Tabellen
benötigen einen expliziten Erhaltungs- oder Neuerstellungsplan. Siehe
[Speicheranforderungen](/de/reference/requirements/).

## Pfade auf der Gegenseite

Hier treten bei Migrationen Fehler auf, da das meiste davon bis zum ersten Erfassungsdurchlauf unsichtbar bleibt.

**Der RRA-Pfad.** Standard-Datenquellenpfade verwenden das Token `<path_rra>`. In dieser Revision
leitet der Bootstrap `$config['rra_path']` aus dem Anwendungsverzeichnis zuzüglich `/rra` ab; es ist
keine allgemeine Datenbankeinstellung zur Auswahl eines beliebigen lokalen Verzeichnisses. Bestätigen Sie
den tatsächlichen Pfad, bevor Sie Dateien verschieben. Absolute benutzerdefinierte Pfade müssen einzeln
geprüft und korrigiert werden. Behalten Sie verschachtelte Verzeichnisstrukturen bei.

**Der Poller-Cache enthält absolute Pfade.** Wenn der Cache aufgebaut wird, wird das Token erweitert
und der vollständige Pfad in die Cache-Zeile geschrieben. Ändern Sie das RRA-Verzeichnis, zeigt der
Cache weiterhin auf das alte Verzeichnis. Der Poller läuft weiter und schreibt nichts, was Sie finden
könnten. Bauen Sie ihn neu auf.

```sh
php cli/rebuild_poller_cache.php
```

**Einstellungen, die Pfade enthalten.** Jede dieser Einstellungen ist in der Datenbank gespeichert,
sodass jede vom alten Rechner übernommen wird und auf das Layout des alten Rechners verweist. Überprüfen
Sie alle vor dem ersten Durchlauf: die RRDtool-Binärdatei, die Kollektor-Binärdatei und deren
Konfigurationsdatei, die PHP-Binärdatei, die SNMP-Tools, die Protokollpfade, die Standardschriftart
und das Sicherungsverzeichnis für die Spitzenentfernung. Überprüfen Sie auch Pfade und Umgebungsvariablen
in Konfigurationsdateien, Service-Units, geplanten Jobs und im Webserver.

**Dateneingabemethoden enthalten Befehlszeilen.** Sie verwenden ein Token für das Installationsstammverzeichnis,
sodass ein Umzug, der das Layout beibehält, keine Änderungen erfordert. Ein Umzug, der es ändert,
erfordert eine individuelle Überprüfung jedes Eintrags. Dasselbe gilt für die Ressourcen-XML-Dateien
hinter Datenabfragen.

**Remote-Kollektoren haben ihre eigene Konfigurationsdatei**, die ihre eigenen Datenbank-Zugangsdaten
und ihre eigene Kollektor-ID enthält. Sie sind nicht im zentralen Dump enthalten. Wenn die zentrale
Datenbank umgezogen ist, aktualisieren Sie die relevanten Endpunkte und validieren Sie die Verbindung
jedes Kollektors. Eine vollständige Replikation ist eine separate Operation, die auf dem Hauptkollektor
nur ausgeführt wird, wenn aktivierte Remote-Kollektoren konfiguriert sind:

```sh
php cli/poller_replicate.php
```

Ohne einen aktivierten Remote-Kollektor beendet sich dieser Befehl mit einem Fehler. Fügen Sie ihn
einer Einzelkollektor-Migration nicht als erforderliche Erfolgsprüfung hinzu. Validieren Sie die
Remote-Konfiguration und -Replikation, bevor Sie die Fortsetzung der Remote-Erfassung zulassen.

## Eigentümerschaft und Berechtigungen

Der Poller schreibt RRD-Dateien als das Konto, das ihn ausführt. Die Weboberfläche liest sie als
das Konto des Webservers. Eine Kopie, die numerische IDs über Rechner mit unterschiedlichen
`/etc/passwd`-Einträgen hinweg beibehalten hat, führt zu Dateien, die dem falschen Konto gehören.

Diagramme, die zum Migrationszeitpunkt abbrechen, können auf Berechtigungen, veraltete Pfade,
fehlende Erfassung, Zeitstempel oder abgelehnte Messwerte hinweisen. Untersuchen Sie die Poller-Protokolle
und beibehaltenen Warteschlangen, bevor Sie eine Reparatur wählen; das Diagramm allein identifiziert nicht die Ursache.

Überprüfen Sie die Eigentümerschaft des RRA-Verzeichnisses selbst und der verschachtelten Unterverzeichnisse,
nicht nur einer Beispieldatei. Neue Dateien werden während der Erfassung in diesen Verzeichnissen erstellt,
sodass ein Verzeichnis, in das der Poller nicht schreiben kann, bei Datenquellen fehlschlägt, die zum
Migrationszeitpunkt noch nicht existierten, selbst wenn die vorhandenen Dateien in Ordnung sind.
Ordnen Sie `rrd_maintenance_trusted_uids` und `rrd_maintenance_trusted_gids` in `include/config.php`
den tatsächlichen numerischen Identitäten des Ziels neu zu und überprüfen Sie übergeordnete vertrauenswürdige
Verzeichnisse. Siehe [Speicheranforderungen](/de/reference/requirements/).

## Umstellung mit minimalem Verlust

Ein RRD lehnt Aktualisierungen ab, die bei oder vor seinem letzten Aktualisierungszeitstempel liegen.
Dies schränkt das erneute Einspielen ein; es beweist nicht, dass jede Migration Messwerte verlieren muss.
Die Lückengröße hängt von Abtastzeiten, Ausfallzeiten und davon ab, welche in der Warteschlange
befindlichen Messungen beibehalten wurden. Dieses Verfahren verwendet einen einzelnen Erfassungs-Eigentümer
und führt unabhängig erfasste Probelauf-Historien nicht in den endgültigen Archivbestand zusammen.

1. Führen Sie im Vorfeld einen vollständigen Probelauf mit einem Backup vom Vortag durch. Kopieren Sie alles, korrigieren Sie jeden Pfad und testen Sie Aktualisierungen gegen isolierte Testgeräte bei deaktivierten Benachrichtigungen. Halten Sie die Änderungen am Zielsystem als wiederholbares Verfahren fest. Stoppen Sie Probelauf-Schreiber nach Abschluss der Tests.
2. Halten Sie den Probelauf isoliert. Ersetzen Sie dessen Datenbank und RRDs durch das endgültige abgestimmte Backup; mischen Sie keine Probelauf-Zeilen oder zwischengespeicherte Messwerte in diese Wiederherstellung ein.
3. Für die Umstellung stoppen Sie die Quellproduzenten und leeren oder sichern Sie ausstehende Messwerte, erfassen und übertragen Sie anschließend das endgültige Backup. Wenden Sie Zielüberschreibungen erneut an: Das Wiederherstellen der Datenbank bringt Quellpfade zurück in `settings`, und das Wiederherstellen von Konfigurationsdateien kann auch Probelauf-Endpunkte und Vertrauenseinstellungen ersetzen.
4. Bauen Sie den Poller-Cache neu auf, führen Sie die Speicherprüfungen durch, überprüfen Sie den Dateibestand und aktivieren Sie die Erfassung auf dem Zielsystem erst, nachdem diese Prüfungen bestanden wurden.

Messen Sie die Dauer des Probelaufs und planen Sie Zeit für Validierung und Rollback ein. Halten
Sie die Quelle angehalten, bis die Umstellung erfolgreich ist oder ein kontrolliertes Rollback sie
wieder als Erfassungs-Eigentümer auswählt.

## In dieser Reihenfolge verifizieren

1. Die Weboberfläche lädt ohne Weiterleitung zum Installer. Untersuchen Sie Code-/Schema-Diskrepanzen, Datenbank-Konnektivität oder unvollständige Wiederherstellung, falls sie weiterleitet.
2. Ein Testgerät reagiert auf einen neuen Erfassungsversuch; ein wiederhergestellter "Up"-Status allein kann veraltet sein.
3. Die letzte Aktualisierungszeit einer RRD-Datei rückt nach dem ersten Erfassungsdurchlauf vor. Überprüfen Sie die Datei auf der Festplatte, nicht das Diagramm.
4. Ein Diagramm, das über die letzte Stunde gezeichnet wird, zeigt eine Linie und keine Lücke.

Wenn Schritt 3 fehlschlägt, überprüfen Sie Pfade, Berechtigungen, Speicher-Vorabprüfung, Warteschlangentiefe
und RRDtool-Fehler. Wenn Schritt 4 fehlschlägt, überprüfen Sie beibehaltene Werte, Diagrammdefinitionen,
den gewählten Zeitbereich und den Zugriff des Webkontos. Eine erfolgreiche Datei verifiziert nicht jedes
Gerät, jede Dateneingabemethode oder jeden Remote-Kollektor.

## Stolperfallen

**Führen Sie nicht beide Installationen auf demselben RRD-Baum aus.** Zwei Poller, die dieselben
Dateien beschreiben, erzeugen abgelehnte Aktualisierungen und Lücken, keine zusammengeführten Daten.

**Stellen Sie keinen älteren RRD-Baum über einer neueren Datenbank wieder her.** Die Dateien werden
nicht nachträglich befüllt. Die Erfassung wird zum aktuellen Zeitpunkt fortgesetzt, und das Intervall
dazwischen bleibt ein dauerhaftes Loch.

**Das Backup enthält Geräte-Zugangsdaten im Klartext.** Ein Hardwarewechsel bedeutet, dass diese
Zugangsdaten über ein Netzwerk übertragen werden und auf zwei Rechnern liegen. Beschränken Sie den
Zugriff auf das Backup und verschlüsseln Sie die Übertragung. Behalten Sie die geschützte Rollback-Kopie
bei, bis Abnahme und Aufbewahrungsrichtlinie eine Außerbetriebnahme erlauben; löschen Sie sie nicht während der Umstellung.

**Plugin-Tabellen befinden sich in der Datenbank; Plugin-Code nicht.** Das Wiederherstellen der
Datenbank ohne passenden Plugin-Code und Abhängigkeiten kann Plugin-Seiten, Hooks oder Jobs beschädigen.
Prüfen Sie jedes erforderliche Plugin explizit.

**Bestehender Proxy-Speicher liegt außerhalb dieses Migrationsverfahrens.** Der Proxy-Einsatz
wird nicht unterstützt. Lokalisieren und sichern Sie die tatsächlichen RRD-Dateien, und validieren Sie
anschließend eine separate Migration auf lokalen Speicher auf einer isolierten Kopie. Ein lokales
Verzeichnis `rra/` enthält möglicherweise nur Überbleibsel.

**Nehmen Sie den alten Rechner als Letztes und nicht am selben Tag außer Betrieb.** Lassen Sie ihn
ausgeschaltet oder mit allen deaktivierten Produzenten, und bewahren Sie dessen passendes Backup auf,
bis die erforderlichen Erfassungs-, Diagramm-, Remote- und Plugin-Prüfungen des neuen Systems bestanden
sind. Bestimmen Sie den Beobachtungszeitraum anhand der Arbeitslasten und der Rollback-Richtlinie;
ein einzelner kürzester Archivzyklus ist kein Beweis dafür, dass jedes Subsystem funktioniert.
