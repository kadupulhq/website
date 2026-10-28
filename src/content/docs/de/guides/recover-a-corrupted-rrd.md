---
title: Eine beschädigte RRD-Datei wiederherstellen
description: Wie man ein beschädigtes Round-Robin-Archiv von einem falsch konfigurierten unterscheidet, eine Datei inspiziert, wie Dump und Restore sie reparieren und welche Historie erhalten bleibt, wenn die Datei neu aufgebaut werden muss.
banner:
  content: Kadupul ist Pre-Alpha. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 25
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor
Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Echte Dateibeschädigung ist selten. Die meisten als beschädigt gemeldeten Dateien sind intakt und
stimmen nicht mit der Datenbank überein, können vom Poller nicht geschrieben werden oder empfangen
keine Werte mehr aus einem Grund, der nichts mit der Datei zu tun hat. Finden Sie heraus, welcher Fall
vorliegt, bevor Sie etwas ändern, da die Reparatur für den einen die anderen verschlimmert.

:::danger[Das Original bewahren]
**Kopieren Sie die Datei vor jeder Reparatur auf dieser Seite.** Stellen Sie sie in einem separaten Kandidaten
wieder her und inspizieren Sie diesen, bevor Sie die Live-Datei ersetzen. Das Verkleinern eines Archivs oder das Löschen eines Archivs
verwirft beibehaltene Historie. Das Ändern eines Maximums beeinflusst spätere Eingabevalidierungen; es
löscht gespeicherte Werte nicht rückwirkend. In einer RRD gibt es kein automatisches Rückgängigmachen.
:::

## 1. Fehler benennen

| Was Sie sehen | Bedeutet üblicherweise | Weiter zu |
|---|---|---|
| Graph zeichnet einen Fehler statt eines Bildes | Die Datei fehlt, ist unlesbar oder das Verzeichnis ist nicht beschreibbar | Schritt 2 |
| Graph ist leer, aber kein Fehler | Keine nutzbaren Werte im ausgewählten Bereich oder ein Problem mit der Graphdefinition | [Fehlende Daten beheben](/de/guides/troubleshoot-missing-data/) |
| Graph stoppt zu einem festen Zeitpunkt und läuft nie weiter | Poller, Berechtigungen oder Heartbeat | Schritt 3 |
| Graph hat Daten, aber die Form änderte sich ohne Konfigurationsänderung | Datei und Datenbank stimmen nicht überein | Schritt 4 |
| Gespeicherte Werte sind alle unbekannt | Erfassung, Timing, Limits oder Datenquellenkonfiguration müssen überprüft werden | [Fehlende Daten beheben](/de/guides/troubleshoot-missing-data/) |
| `rrdtool` verweigert das Lesen der Datei | Fehlender Pfad, Zugriffsfehler, inkompatibles Format oder Beschädigung | Schritte 2 und 3, dann 5 |

Kadupul verwandelt den ersten Fall in eine lesbare Nachricht statt eines defekten Bildes,
wobei unterschieden wird, ob ein Verzeichnis oder eine Datei nicht beschrieben werden kann, und meldet eine
fehlende Datei möglicherweise damit, dass der Poller noch nicht gelaufen ist. Diese Meldung ist ein Hinweis, keine
Diagnose: Löschung, ein geänderter Pfad oder eine unvollständige Wiederherstellung können sie ebenfalls fehlen lassen.

## 2. Die Datei untersuchen

Zwei Ansichten stehen auf der eigenen Seite der Datenquelle zur Verfügung, beide pro Sitzung aktivierbar.
Die Debug-Ansicht gibt den `rrdtool create`-Befehl aus, den Kadupul heute für diese Datenquelle
ausführen würde. Die Info-Ansicht ist hier entscheidend: Sie liest die Datei mit
`rrdtool info`, liest die Datenquellendefinition aus der Datenbank und gibt die
Unterschiede aus. Wenn ein Unterschied ohne Neuerstellung ausgeglichen werden kann, gibt sie den
Befehl `rrdtool tune` oder `rrdtool resize` aus, der dies tun würde, als Text zum manuellen
Ausführen.

Von einer Shell aus derselbe erste Schritt:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Der Header liefert den Schritt, den letzten Aktualisierungszeitpunkt, jeden Datenquellennamen mit Typ,
Heartbeat, Minimum und Maximum sowie jedes Archiv mit seiner Konsolidierungsfunktion, Zeilenanzahl
und Auflösung. Wenn dieser Befehl fehlschlägt, sichern Sie die Fehlermeldung und prüfen Sie Pfad,
Berechtigungen und RRDtool-Kompatibilität, bevor Sie auf Beschädigung schließen. Ein erfolgreiches
`info` liest Metadaten; inspizieren Sie auch die `fetch`-Ausgabe und testen Sie einen Dump, um die Historie zu prüfen.

## 3. Zuerst die mechanischen Ursachen prüfen

| Prüfung | Warum sie vor der Reparatur kommt |
|---|---|
| Dateieigentümerschaft und Modus | Eine während der Wartung von root erstellte Datei ist ab diesem Zeitpunkt für den Poller unbeschreibbar |
| Verzeichniseigentümerschaft und Modus | Der Poller kann keine Ersatzdatei in einem Verzeichnis erstellen, das er nicht beschreiben kann |
| Freier Speicherplatz und Inodes | Ein volles Dateisystem erzeugt unvollständige Schreibvorgänge, die wie Beschädigungen aussehen |
| Ob ein zweiter Schreiber existiert | Parallele oder unvollständige Aktualisierungen können fehlschlagen oder einen Wartungs-Snapshot entwerten; Protokolle prüfen |

Führen Sie Wartungsarbeiten unter dem Konto durch, dem die RRD gehört und das sie aktualisiert, und bewahren Sie Modus,
Eigentümer und Gruppe. Stoppen Sie alle Schreibprozesse, bevor Sie Dateien kopieren oder ersetzen, einschließlich entfernter
Kollektoren, geplanter Aufgaben und manueller Wartung. Leeren Sie ausstehende Schreibvorgänge erst, nachdem
deren Erzeuger gestoppt wurden. Einfache Shell-Befehle fordern keine Speichersperren von Kadupul an.
Siehe [Speicheranforderungen](/de/reference/requirements/) und das Stilllegungsverfahren in
[Sichern und Wiederherstellen](/de/guides/back-up-and-restore/).

## 4. Lesen, was die Prüfung bereits gefunden hat

Kadupul kann graphverknüpfte Datenquellen auf aktivierten Geräten nach einem Zeitplan prüfen und
festhalten, was es vorfindet; dies ist keine Bestandsaufnahme jeder Datei auf der Festplatte. Es ist
standardmäßig deaktiviert. Die Oberfläche gibt an, wo es aktiviert wird: Configuration -> Settings -> Data.

| Einstellung | Standard | Auswirkung |
|---|---|---|
| Enable RRDfile Check | off | Nichts wird geprüft, bis dies aktiviert ist |
| Check Frequency | 4 hours | Bietet auch 1 hour, 24 hours oder Ausführung nach jedem Boost-Zyklus |
| Number of RRDfile Check Processes | 1 process | Teilt die Dateiliste auf parallele Worker auf |
| RRDChecker Timeout | 1 hour | Der Lauf wird nach Überschreiten abgebrochen |

Befunde sammeln sich in einer Liste mit dem Gerät, der Datenquelle, der internen Datenquellen-ID,
der Meldung und dem Datum. Sie können nach Alter filtern und den Text durchsuchen, und
Sie können die Liste bereinigen, sobald Sie darauf reagiert haben.

Die Meldungen, die aufgezeichnet werden können, und ihre jeweilige Bedeutung:

| Meldung | Bedeutung |
|---|---|
| RRDfile does not exist | Die Datei wurde nie erstellt, wurde verschoben oder gelöscht, oder der konfigurierte Pfad änderte sich |
| RRDfile is not writable | Der Poller-Benutzer kann die Datei nicht beschreiben |
| RRDfile modify time older than hour | Seit mindestens einer Stunde wurde nichts geschrieben |
| Last update value in RRDfile is older than 1 hour | Der letzte Aktualisierungsstempel der Datei selbst ist veraltet, was ein stärkerer Beleg als die Änderungszeit ist |
| The RRDfile step does not match the Data Source Profile step | Die Datei wurde unter einem anderen Intervall erstellt |
| There are more, or less, Data Sources in the database than in the RRDfile | Die Vorlage hat nach der Dateierstellung Felder hinzugewonnen oder verloren |
| The Data Source '...' exists in RRDfile, but not in database | Benennt das Feld aus Sicht der Datei |
| Data Source name '...' exists in the Database, but not in RRDfile | Benennt das Feld, das der Poller schreibt, das aber keinen Platz in der Datei hat |
| The RRDfile Minimal Heart... is lower than polling interval | Die Prüfung markiert Heartbeats kleiner oder gleich dem Polling-Intervall; späte Werte können unbekannt werden |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Der Heartbeat der Datei liegt unter dem Profil-Heartbeat; diese Prüfung markiert keinen größeren |
| Stale values for last 24 hours, or last hour | Jeder in diesem Fenster zurückgelesene Wert war unbekannt |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Teilweiser Erfassungsausfall |
| No data returned, maybe corrupted Data Source | Ein fetch auf die Datei lieferte überhaupt nichts zurück |

Die Prüfung korrigiert den in der Datenbank erfassten Schritt und Heartbeat passend zum Profil während
des Laufs, was Abweichungen zwischen dem Profil und den Datenquellenzeilen behebt, berührt
die Datei jedoch nicht. Zählabweichungen zwischen Datei und Datenbank werden gemeldet statt
repariert, da jede Seite die falsche sein könnte.

## 5. Dump, Bearbeitung, Wiederherstellung

RRDtool kann eine lesbare Datei in XML serialisieren und daraus einen Kandidaten neu aufbauen.
Dies kann bei bekannten strukturellen Abweichungen helfen, rekonstruiert jedoch keine verlorenen Werte
und garantiert nicht, dass eine beschädigte Datei geparst werden kann. Kadupul nutzt ebenfalls Dump/Restore-Hilfsprogramme
für strukturelle Änderungen. Das lokale Wiederherstellungsprogramm erstellt ein temporäres Geschwisterelement und
benennt es nach Erfolg über das Ziel um; dies stellt kein Backup dar.

Führen Sie dies bei gestoppten Schreibern als RRD-Eigentümer aus. Ersetzen Sie den Beispielpfad durch den
tatsächlichen Datenquellenpfad. Das private Arbeitsverzeichnis wird neben der Quelle erstellt,
damit der Kandidat auf demselben Dateisystem liegt:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Wählen Sie einen Fetch-Bereich und eine Konsolidierungsfunktion, die bekannte beibehaltene Daten enthalten;
die letzte Stunde ist nur ein Beispiel. Vergleichen Sie Datenquellennamen,
Schritt, Archive, Letzte-Aktualisierungs-Zeitstempel und Messwerte von Quelle und Kandidat. Ein unverändertes Dump/Restore
kann das binäre Layout verändern, vergleichen Sie daher Werte, statt identische Dateihashes zu fordern.

Bewahren Sie die Originalkopie auf. Stellen Sie erst nach der Validierung den erforderlichen Modus,
Eigentümer und Gruppe des Kandidaten wieder her und benennen Sie ihn auf den Live-Pfad um, während Schreiber gestoppt bleiben. Überprüfen
Sie, dass das Poller-Konto die Datei lesen und aktualisieren kann, bevor Sie die Erfassung wieder aufnehmen. Dieses Beispiel
stoppt vor der Installation, damit kein lesbarer, aber fehlerhafter Kandidat installiert wird.

Das XML und der Kandidat benötigen zusätzlichen Festplattenspeicher. Ein fehlgeschlagener Dump kann unvollständiges
XML hinterlassen; stellen Sie dieses nicht wieder her. Prüfen Sie Zugriff, freien Speicherplatz und den gemeldeten Fehler. Wenn das Original
nach diesen Prüfungen nicht gedumpt werden kann, stellen Sie stattdessen ein intaktes Backup wieder her. RRDtools
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) erlaubt das Überschreiben
des Ziels; das gestaffelte Beispiel verwendet bewusst ein neues Ziel.

## 6. Was überlebt und was nicht

| Beschädigung | Historie wiederherstellbar |
|---|---|
| Datei nicht beschreibbar, sonst intakt | Beibehaltene Historie überlebt. Verpasste Aktualisierungen werden nicht allein durch Beheben des Zugriffs wiederhergestellt |
| Heartbeat, Minimum oder Maximum falsch | Ja. `rrdtool tune` ändert den Header, ohne gespeicherte Werte anzutasten |
| Schritt falsch | Erfordert eine explizite, validierte Konvertierung; die bloße Änderung des Datenbankprofils konvertiert die Datei nicht |
| Datenquelle fehlt in der Datei | Die bestehenden Felder behalten ihre Historie. Das neue Feld beginnt leer |
| Archiv gelöscht oder nie erstellt | Nein. Eine Auflösung, die nie gespeichert wurde, kann nicht rekonstruiert werden |
| Archivzeilen durch verkleinerndes Resize reduziert | Nein. Die verworfenen Zeilen sind im Moment der Befehlsausführung verloren |
| Datei abgeschnitten, Dump schlägt fehl | Nein. Aus Backup wiederherstellen |
| Header intakt, Dateiende abgeschnitten | Nehmen Sie nicht an, dass ein scheinbar lesbarer Header einen vollständigen Dump bedeutet; nutzen Sie ein verifiziertes Backup, wenn das Dumpen fehlschlägt |

Das Ändern des Poller-Intervalls oder das Verschieben einer Datenquelle in ein anderes Aufbewahrungsprofil
formt bestehende Dateien nicht automatisch um. RRDtool stellt auch strukturelle
[`tune`-Operationen](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) bereit, einschließlich einer
Option für den Schritt; validieren Sie das Konvertierungsverhalten für Ihre installierte Version und das Archiv-Layout,
statt von einer verlustfreien Intervalländerung auszugehen. Siehe
[Datenquellen und Archive](/de/concepts/data-sources-and-rras/) und
[Datenaufbewahrung verwalten](/de/guides/manage-data-retention/). Das Anheben eines Maximums mit `tune`
ist sicher; das Absenken registriert jeden späteren Wert über der neuen Obergrenze als unbekannt.

## 7. Wiederaufbau unter Beibehaltung des Möglichen

Kadupul liefert ein Splice-Dienstprogramm mit, das eine neue Datei aus einer älteren lesbaren
befüllen kann. Betrachten Sie dessen Ergebnis als Kandidaten: Es kann Lücken füllen und legitime Nullen ersetzen,
sodass es keine verlustfreie Kopie gemessener Historie darstellt. Führen Sie es vom Anwendungsstammverzeichnis auf
dem Hauptdatenkollektor aus, unter Verwendung isolierter Kopien in vertrauenswürdigen beschreibbaren Verzeichnissen.

Erstellen Sie `new.rrd` mit der beabsichtigten Struktur im privaten Verzeichnis `$work`
aus Schritt 5 und prüfen Sie dann die Zusammenführung in der Vorschau:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Beide Eingabedateien müssen bereits existieren und die Schreibbarkeitsprüfungen des Dienstprogramms bestehen.
Die neue Datei liefert die Struktur. Ohne `--finrrd` ist die Ausgabe der Pfad der neuen Datei
plus `.new`; verwenden Sie einen neuen expliziten Ausgabepfad, um das Ersetzen eines früheren
Kandidaten zu vermeiden. `--dryrun` parst und führt unter Verwendung von temporärem XML und, falls verfügbar,
SQLite-Speicher zusammen, überspringt jedoch das finale RRD-Restore. Es beweist nicht, dass die endgültige
Wiederherstellung gelingt. Entfernen Sie `--dryrun`, um den separaten Kandidaten zu erzeugen.
Vermeiden Sie `--owner` während der Vorschau und führen Sie es als das erforderliche Dienstkonto aus; prüfen Sie
die tatsächliche Eigentümerschaft der Ausgabe vor der Installation.

:::caution[Das Zusammenfügen behandelt Null als Lücke]
Die Zusammenführung durchläuft die neue Datei und sucht für jeden Slot mit unbekanntem Wert **oder Null** nach
dem nächstgelegenen passenden Wert in der alten Datei und schreibt stattdessen diesen. Eine echte Null in
der neuen Datei wird daher durch alte Daten ersetzt. Bei allem, was legitimerweise über längere Zeiträume Null liest,
einem ungenutzten Port, einer Warteschlange, die sich leert, einem ruhenden Zähler, inspizieren Sie das
Ergebnis, bevor Sie es aktivieren. Unbekannte Werte der alten Datei werden ebenfalls mit vorangehenden Werten aufgefüllt,
sodass die zusammengeführte Ausgabe eine Kontinuität über fehlende Daten hinweg erfinden kann.
:::

Platzieren Sie die Datei nach dem Zusammenfügen dort, wo die Datenquelle sie erwartet, mit den Berechtigungen, die der
Poller benötigt, und prüfen Sie, ob der Graph gezeichnet wird.

## 8. Lücken füllen und warum man zweimal nachdenken sollte

| Dienstprogramm | Was es schreibt |
|---|---|
| `cli/batchgapfix.php` | Füllt einen Datumsbereich über viele Geräte hinweg parallel, entweder mit dem letzten bekannten Wert oder einem Durchschnitt |
| `cli/float_rrdfiles.php` | Lässt einen Bereich in ausgewählten Graphen über denselben Dump- und Restore-Pfad gleiten |

Beide erfinden Messwerte. Zu diesen Zeitstempeln wurde nichts erfasst, und danach
unterscheidet in der Datei nichts die erfundenen Werte von den echten. Verwenden Sie sie, wenn Sie
wissen, dass die Lücke kein Ausfall war: ein für Wartungsarbeiten gestoppter Poller, ein Migrationsfenster.
Niemals bei Daten, die in eine Kapazitäts- oder Abrechnungsberechnung einfließen. Dieselbe Vorsicht gilt beim
[Entfernen von Spitzen](/de/guides/remove-spikes-from-data/).

## 9. Automatisiertes Debuggen einer Datenquelle

Bei einer Datenquelle, die sich ungewöhnlich verhält, kann Kadupul eine Debug-Prüfung über die nächsten
Abfragezyklen durchführen und ein Urteil fällen: ob die Datei existiert, ob sie und ihr
Verzeichnis beschreibbar sind, welches Konto sie besitzt im Vergleich zu dem Konto, unter dem der Poller läuft,
ob die Datenquelle aktiv ist, ob die Datei mit der Datenquellendefinition übereinstimmt,
ob sich die letzte Aktualisierung nach einer Abfrage geändert hat und ob die Werte brauchbar waren. Ihre
Reparaturwirkung ist eng begrenzt. Sie führt die `rrdtool tune`-Empfehlungen aus, die der Vergleich
erzeugt hat, und sonst nichts; sie bricht ab und protokolliert die Begründung, wenn die Liste leer oder die Datei
nicht beschreibbar ist. Sie erstellt keine Dateien neu, fügt keine Datenquellen hinzu und ändert keine Archive.

## 10. Löschung ist eine gesonderte Gefahr

Kadupul verfolgt Archivdateien, deren Datenquelle nicht mehr existiert, und bietet an, diese
zu entfernen. Es kann auch so eingestellt werden, dass es automatisch handelt, wenn eine Datenquelle gelöscht wird, mit zwei
Methoden: Löschen oder in ein Archivverzeichnis verschieben.

:::danger[Löschen ist endgültig]
Die Löschmethode entfernt die Datei von der Festplatte. Es gibt keinen Papierkorb und die Daten
befinden sich nicht in der Datenbank. Wenn Sie nicht sicher sind, dass jede aufgelistete Datei tatsächlich verwaist ist,
stellen Sie die Methode auf Archivieren ein, wodurch Dateien in ein von Ihnen bestimmtes Verzeichnis verschoben werden, und bereinigen
Sie dieses Verzeichnis später manuell.
:::

Eine Datei kann verwaist wirken, ohne verwaist zu sein. Eine auf einen neuen Pfad verschobene Datenquelle, eine
teilweise abgeschlossene Wiederherstellung oder ein unter einer neuen ID neu erstelltes Gerät hinterlassen Dateien, auf die
nichts verweist. Gleichen Sie die Liste zuerst mit Ihren eigenen Aufzeichnungen über Änderungen ab.

## Fehlerbilder

| Symptom | Ursache |
|---|---|
| Reparatur war erfolgreich, Graph immer noch leer | Zugriff, ausgewählten Zeitbereich, Datenerfassung und Graphdefinition prüfen |
| `rrdtool dump` meldet Fehler bei der Datei | Pfad, Zugriff, Speicher und Format prüfen, bevor auf Beschädigung geschlossen wird |
| Tune angewendet, nichts geändert | Header-Änderungen füllen historische unbekannte Werte nicht rückwirkend auf; Datei- und Datenbankdefinitionen verifizieren |
| Schmale Lücken überall nach einer Intervalländerung | Die Dateien tragen noch den alten Schritt und Heartbeat |
| Zusammengefügte Datei enthält alte Daten, wo die neue Datei Null las | Erwartet. Das Zusammenfügen füllt Nullen ebenso wie unbekannte Werte auf |
| Prüfliste wächst und schrumpft nie | Befunde werden bis zur Bereinigung aufgezeichnet; das Beheben der Ursache löscht sie nicht |

Sichern Sie das Archivverzeichnis und die Datenbank gemeinsam nach einem einheitlichen Zeitplan und testen Sie die
Wiederherstellung. Die Wiederherstellung ist auf das beschränkt, was dieses Backup zum Zeitpunkt der Erstellung enthielt. Siehe
[Sichern und Wiederherstellen](/de/guides/back-up-and-restore/).
