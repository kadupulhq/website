---
title: Spitzen aus Daten entfernen
description: Spitzenkorrekturen vorab prüfen, Wiederherstellungskopien aufbewahren und Änderungen an beibehaltenen RRD-Messwerten verifizieren.
banner:
  content: Kadupul ist Pre-Alpha. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 19
---

:::caution[Vor der Verwendung validieren]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit Backups, bevor
Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

:::danger[Dies schreibt Historie um; Wiederherstellung erfordert ein Backup]
Die Spitzenentfernung dumpt das Archiv, bearbeitet Werte, stellt eine temporäre Geschwisterdatei
wieder her und ersetzt nach der Validierung das Original. Es gibt kein automatisches Rückgängigmachen. Bewahren
und prüfen Sie eine Wiederherstellungskopie, führen Sie zuerst `--dryrun` aus und bestätigen Sie die Zielwerte,
bevor Sie eine Änderung festschreiben.
:::

Eine Spitze (Spike) bedeutet hier einen oder zwei Messwerte, die so viel größer sind als alles um sie
herum, dass sich die vertikale Achse an ihnen ausrichtet und der Rest des Graphen auf der
Nulllinie abgeflacht wird. Der Messwert ist falsch, und er stört massiv.

## Woher sie kommen

Die meisten Spitzen bei einer zählerbasierten Datenquelle sind arithmetischer Natur, keine echten Messwerte.
Eine Zähler-Datenquelle speichert eine Rate, die aus der Differenz zwischen zwei
Ablesungen berechnet wird. Alles, was die zweite Ablesung im Verhältnis zur Zeitspanne
dazwischen viel größer als die erste macht, kann eine falsche Rate erzeugen. Zähler-Resets,
fehlerhafte Überlaufbehandlung, eine Schnittstellen-Neunummerierung, die Messwerte auf die falsche
Datenquelle verschiebt, oder Zeitstempelfehler können dies verursachen. Ein normaler Zählerüberlauf ist
an sich kein Beweis für einen fehlerhaften Wert; überprüfen Sie den Datenquellentyp und die Eingangsablesungen.

Siehe [Datenquellen und RRAs](/de/concepts/data-sources-and-rras/) zur Ableitung der Rate.

Beheben Sie die Ursache, wo immer möglich. Das Entfernen der Spitze ist rein kosmetisch; es verhindert
nicht die nächste.

## Die vier Methoden

Das Werkzeug arbeitet auf der gesamten Datei: Es dumpt jedes Archiv in der RRD-Datei, entscheidet,
welche Werte ersetzt werden sollen, und stellt das Ergebnis wieder her.

| Methode | Was sie auswählt | Benötigt ein Zeitfenster |
|---|---|---|
| `stddev` | Werte, die mehr als N Standardabweichungen vom Mittelwert entfernt sind | Nein |
| `variance` | Werte, die mehr als N Prozent über dem Mittelwert liegen, nachdem Ausreißer verworfen wurden | Nein |
| `float` | Alles innerhalb eines angegebenen Zeitfensters | Ja |
| `fill` | Unbekannte und Null-Werte innerhalb eines angegebenen Zeitfensters | Ja |

`stddev` und `variance` suchen selbstständig. `float` und `fill` tun genau das, was Sie ihnen innerhalb
eines angegebenen Bereichs vorgeben, und beide schlagen sofort fehl, wenn Sie keinen Start- und Endzeitpunkt angeben.

`fill` ist nicht auf fehlende Daten beschränkt: Es kann gemessene Nullen durch
Werte ungleich null ersetzen. Verwenden Sie es nicht in einem Bereich, der gültige Leerlauf- oder Nullablesungen
enthält, es sei denn, diese Änderung ist beabsichtigt.

Die Varianzmethode verwirft die oberen und unteren N Werte, bevor sie den
Durchschnitt berechnet, mit dem verglichen wird, wobei N die Einstellung für Ausreißer ist. Das verhindert,
dass die Spitze den Schwellenwert aufbläht, der sie eigentlich erfassen soll.

Was auch immer ausgewählt wird, wird ersetzt, und es stehen drei Ersetzungen zur Verfügung.

| Ersetzung | Ergebnis |
|---|---|
| `last` | Der letzte bekannte gute Wert. Der Standardwert. |
| `avg` | Ein berechneter Durchschnitt für das Feld/Archiv; die Berechnung hängt von der Methode ab. |
| `nan` | Unbekannt für statistische Methoden; siehe die Einschränkung der Fenstermethode unten. |

Unbekannt dokumentiert, dass kein nutzbarer Messwert verfügbar ist. `last` und `avg`
setzen Werte ein, die für jemanden, der den Graphen später liest, wie echte Messungen aussehen können.
Wählen Sie den Ersatz bedacht und überprüfen Sie das tatsächlich gespeicherte Ergebnis.

**Fenstermethoden mit NaN:** Mit `--avgnan=nan` ersetzt `float` jeden bekannten Wert
im Fenster durch unbekannt, und `fill` ersetzt Null- oder nicht-numerische Werte im
Fenster durch unbekannt. Statistische Methoden mit optionalen Zeitgrenzen ersetzen nur
erkannte Ausreißer, entsprechen also nicht dem Leeren eines gesamten Fensters.

## Vorschau, dann anwenden

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Ein Probelauf (Dry Run) dumpt die RRD und analysiert sie, ohne die Live-Datei neu zu schreiben. Er benötigt
dennoch ein nutzbares Arbeitsverzeichnis und Wartungszugriff. Eine Vorschau reserviert
die Datei nicht bis zu einem späteren Festschreiben: Neue Messwerte oder geänderte Optionen können das
Ergebnis verändern. Das fensterbasierte Beispiel verwendet weiterhin eine statistische Auswahl; es entfernt nicht
jeden Wert in diesem Fenster.

Die Zeitargumente akzeptieren entweder einen Unix-Zeitstempel oder eine Datumszeichenfolge. Eine Zeichenfolge,
die nicht geparst werden kann, wird vor dem Neuschreiben abgelehnt. Verwenden Sie Unix-Zeitstempel, wenn die
Zeitzoneninterpretation andernfalls mehrdeutig wäre.

## Was tatsächlich mit der Datei geschieht

Gut zu wissen, bevor Sie es auf wichtige Daten anwenden.

1. Die Datei wird im Backup-Verzeichnis nach XML gedumpt.
2. Kommentare werden entfernt und jedes Archiv wird für die Statistik gescannt.
3. Ausgewählte Werte werden im XML ersetzt.
4. Die Originaldatei wird in das Backup-Verzeichnis kopiert.
5. Das bearbeitete XML wird in eine private Geschwisterdatei wiederhergestellt, validiert und über
   das Original umbenannt, wobei Eigentümer, Gruppe und Modus beibehalten werden.

Schritt 4 ist das Sicherheitsnetz und keineswegs optional: Schlägt das Kopieren fehl, wird die Wiederherstellung
nicht ausgeführt. Diese Kopie, nicht etwa ein Befehlszeilenparameter, ist das, woraus Sie
wiederherstellen würden. Ihr Name basiert auf dem Original und kann ein eindeutiges Suffix erhalten, um das
Überschreiben eines vorhandenen Artefakts zu vermeiden. `--backup` fordert zusätzlich einen dauerhaften
Wiederherstellungs-Snapshot an. Lesen Sie die gemeldeten Pfade und prüfen Sie die Kopien, bevor Sie sich
darauf verlassen.

Die Operation erfordert vertrauenswürdige lokale POSIX-Verzeichnisse und Wartungssperren;
beschreibbare Modus-Bits allein reichen nicht aus. Sie verweigert nicht unterstützten Speicher und einen
konfigurierten rrdcached-Endpunkt. Stoppen Sie externe Schreiber, die nicht am
Sperrprotokoll von Kadupul teilnehmen. Führen Sie den Befehl als das vorgesehene speicherbesitzende Dienstkonto aus.
Siehe [Installationsanforderungen](/de/reference/requirements/) für den Speicherzugriff.

## Einstellungen, die die Standardwerte steuern

Befehlszeilenargumente haben Vorrang. Alles, was Sie weglassen, stammt aus den
Systemeinstellungen, und benutzerspezifische Einstellungen überschreiben die Systemeinstellungen, wenn das Werkzeug
über die Benutzeroberfläche ausgeführt wird.

| Einstellung | Standard | Was sie bewirkt |
|---|---|---|
| Removal method | Variance with outliers removed | Welche Methode verwendet werden soll |
| Replacement method | Last known good | Was einen entfernten Wert ersetzt |
| Number of standard deviations | 10 | Schwellenwert für die Methode `stddev` |
| Variance percentage | 1000 | Schwellenwert für die Methode `variance` |
| Variance number of outliers | 5 | Vor der Mittelwertbildung verworfene hohe und niedrige Werte |
| Max kills per RRA | 5 | Beabsichtigte Obergrenze; derzeit nicht zuverlässig durchgesetzt |
| RRDfile backup directory | `cache/spikekill/` under the install | Wohin Dump und Kopie abgelegt werden |
| Backup retention | 3 months | Wie lange Kopien aufbewahrt werden |

Es gibt auch einen Batch-Modus: einen Zeitplan (alle 6, 12, 24 oder 48 Stunden), eine Basiszeit
und eine Liste von Graphvorlagen, auf die angewendet werden soll. Der Batch-Modus ist standardmäßig deaktiviert.
Das Aktivieren bedeutet, dass das System Archive bearbeitet, ohne dass jemand das
Ergebnis prüft. Beschränken Sie die Vorlagenliste sehr strikt, falls Sie ihn überhaupt aktivieren.

## Fallen

**Die Standard-Schwellenwerte sind bewusst weit gefasst.** Zehn Standardabweichungen und
1000 Prozent Varianz sind weit. Ein Lauf, der keine Spitzen meldet, ist wahrscheinlich nicht
fehlgeschlagen; er hat Ihnen mitgeteilt, dass die Werte innerhalb des von Ihnen geforderten Bereichs liegen. Ziehen Sie den
Schwellenwert an, statt Methoden willkürlich zu wechseln.

**Max kills per RRA begrenzt nur die statistischen Methoden.** Für `stddev` und
`variance` deckt die Zählung alle Datenquellen in einem Archiv ab und wird beim nächsten
Archiv zurückgesetzt. Die Fenstermethoden `float` und `fill` ersetzen jeden passenden Wert im
Fenster. Die Gesamtzählung schließt NaN-Ersetzungen ein. Prüfen Sie die vollständige Vorschau
und verwenden Sie ein enges Zeitfenster.

**Ein konsolidierter Wert kann nicht wiederhergestellt werden.** Ältere Archive enthalten einen Wert pro
Intervall, bereits gemittelt. Das Ersetzen dieses Werts stellt nicht die tatsächliche
Messung für das Intervall wieder her; es setzt einen plausiblen Wert ein. Je weiter Sie zurückgehen,
desto mehr ist die Korrektur eine bloße Schätzung.

**Das Backup-Verzeichnis muss konfiguriert und vertrauenswürdig sein.** Dump- und
Wiederherstellungskopien werden dort abgelegt. Fehlende, unsichere oder nicht überprüfbare Verzeichnisse werden abgelehnt; machen Sie ein
Verzeichnis nicht weltweit beschreibbar, um einen Fehler zu umgehen.

**Führen Sie ein eigenes Änderungsprotokoll neben den Anwendungsprotokollen.** Halten Sie Bediener,
Befehl, Zeitbereich, Backup-Pfade und Vorher/Nachher-Prüfungen fest. Zusammenfassende Zählungen allein
sind kein ausreichender Beweis dafür, was geändert wurde.

**Führen Sie den Befehl als das vorgesehene Dienstkonto aus.** Ein erfolgreicher Austausch behält
Dateieigentümerschaft und Modus bei. Root ist keine Abkürzung um die Verzeichnis-Vertrauensprüfungen herum;
überprüfen Sie, dass das normale Polling das Ergebnis weiterhin aktualisieren kann.

**Das Entfernen der Spitze repariert den Graphen nicht, wenn die Datenquelle falsch ist.** Wenn eine
Schnittstellen-Neunummerierung Werte auf die falsche Datenquelle verschoben hat, ist die Spitze nur ein
Symptom. Siehe [Fehlende Daten beheben](/de/guides/troubleshoot-missing-data/),
bevor Sie mit der Bearbeitung von Archiven beginnen.
