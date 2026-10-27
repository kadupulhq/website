---
title: Der Poller-Cache
description: Warum der Collector eine vorab berechnete Arbeitsliste liest anstatt Ihrer Konfiguration, und warum dies der übliche Grund ist, warum eine Änderung scheinbar nichts bewirkt.
banner:
  content: Kadupul befindet sich in der Prä-Alpha-Phase. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 6
---

[Architektur](/de/concepts/architecture/) stellt den Poller-Cache in einem Satz vor:
Die Arbeitsliste wird vorberechnet, und der Collector liest diese, anstatt Ihre
Konfiguration jedes Mal auszuwerten. Auf dieser Seite geht es darum, was diese
Entscheidung in der Praxis tatsächlich bedeutet.

## Was der Collector andernfalls tun müsste

Um herauszufinden, was für einen einzelnen Messwert erfasst werden muss, ist das
Auflösen einer ganzen Kette erforderlich. Die Datenquelle verweist auf ein Gerät
und eine Datenvorlage. Die Vorlage verweist auf eine Dateneingabe. Die Dateneingabe
besitzt Felder, von denen einige pro Gerät überschrieben und andere von der
Vorlage geerbt werden. Wenn die Datenquelle aus einer Datenabfrage stammt, muss
der aktuelle Index über den Abfrage-Cache aufgelöst werden. Anschließend müssen
die SNMP-Zugangsdaten vom Gerät abgerufen werden, es sei denn, ein Feld überschreibt sie.

Das sind mehrere Joins für einen einzigen Wert. Eine mittelgroße Installation
besitzt Zehntausende von Werten und führt alle fünf Minuten einen Durchlauf aus.
Würde diese Auflösung zum Erfassungszeitpunkt stattfinden, würde die Datenbank
und nicht das Netzwerk darüber entscheiden, wie viele Geräte Sie überwachen können.

Daher erfolgt die Auflösung nur einmal, wenn sich etwas ändert, und das Ergebnis
wird flach niedergeschrieben.

## Was der Cache speichert

Der Cache berechnet Erfassungsanweisungen vorab. Er reduziert die wiederholte
Auflösung der Konfiguration, beseitigt jedoch keine Joins oder den Live-Gerätezustand.

| In der Zeile enthalten | Zweck |
|---|---|
| Welcher Collector zuständig ist | Jeder Collector wählt nur seine eigenen Zeilen aus |
| Die Aktion: SNMP, Skript oder Skript-Server | Bestimmt, welcher Codepfad ausgeführt wird |
| Hostname, SNMP-Version, Port, Timeout, Community oder Zugangsdaten | Gecachte Verbindungsinformationen; der Live-Hoststatus wird ebenfalls gelesen |
| Die OID oder die vollständige Skript-Befehlszeile | Bereits substituiert und ausführungsbereit |
| Der Pfad zur RRD-Datei | Bereits aufgelöst |
| Der Feldname in dieser Datei und die Anzahl der Felder einer vollständigen Ablesung | Ermöglicht den Abgleich und die Validierung der Ausgabe |
| Der Step und ein Countdown bis zur nächsten Fälligkeit dieses Elements | Siehe [Zeit und Intervalle](/de/concepts/time-and-intervals/) |

`cmd.php` verknüpft `poller_item` mit `host`, filtert deaktivierte Geräte heraus
und nutzt Live-Gerätefelder für Verfügbarkeits- und Reindex-Prüfungen. Gecachte OIDs,
Befehle und RRD-Metadaten müssen weiterhin zur vorgesehenen Datenquelle passen.

Gecachte Zugangsdaten stellen eine Momentaufnahme dar. Das Speichern geänderter
Zugangsdaten über die Geräte-API aktualisiert den betroffenen Cache jedoch im
Regelfall. Direkte Datenbankänderungen umgehen diesen Pfad und können eine veraltete
Momentaufnahme hinterlassen. Überprüfen Sie den tatsächlichen Cache, anstatt
anzunehmen, dass jede Zugangsdatenänderung einen manuellen Neuerstellungslauf erfordert.

Der RRD-Pfad ist ebenfalls eine Momentaufnahme. Das Verschieben von Dateien oder das
Ändern des Speicherorts führt dazu, dass jede gecachte Zeile weiterhin auf den alten
Speicherort verweist.

## Was ihn schreibt

Der Cache wird inkrementell von den Operationen gepflegt, die wissen, dass sie etwas
geändert haben.

| Operation | Neu geschriebene Zeilen |
|---|---|
| Speichern eines Geräts | Änderungen an Verbindungsfeldern, Collector-Zuordnung oder Deaktivierungsstatus lösen ein Pushout aus; unveränderte Erfassungsfelder können den Schnell-Speicherpfad nutzen |
| Speichern einer Datenquelle | Die Zeilen dieser Datenquelle |
| Erstellen von Graphen und Datenquellen aus einer Vorlage | Die neu erstellten Zeilen |
| Ein Datenabfragedurchlauf, der einen Index verschoben oder aufgelöst hat | Nur die Datenquellen, die sich geändert haben |
| CLI-Neuerstellung | Aktivierte Geräte, die von ihren Workern verarbeitet werden; der aktuelle Fehler bei der `--host-id`-Weiterleitung verhindert das Verlassen auf Geräteisolation |

Das Neuschreiben ist kein blindes Einfügen. Die Zeilen für die neu zu erstellenden
Datenquellen werden zunächst als abwesend markiert, dann wird der neue Satz geschrieben,
und alles, was weiterhin als abwesend markiert ist, wird gelöscht. Auf diese Weise
werden Zeilen für Felder entfernt, die nicht mehr existieren. Die Bereinigung des Puffers
ist nach Collector- und Datenquellen-IDs eingegrenzt. Dies schützt unbeteiligte
Quellen im regulären Zielpfad; es stellt jedoch keine Garantie bei gleichzeitigen
Neuerstellungen oder fehlgeschlagenen Datenbankschreibvorgängen dar. Überprüfen Sie
die resultierenden Zeilen nach einer Neuerstellung, einschließlich eines nahegelegenen
unbeteiligten Geräts bei der Untersuchung des Umfangs.

## Zeilen, die niemals geschrieben werden

Manche Konfigurationen erzeugen keine neue Cache-Zeile. Prüfen Sie sowohl die
Protokolle als auch den Graphen.

Der Builder überspringt deaktivierte Geräte. Die Massenaktion **Deaktivieren** behält
vorhandene Cache-Zeilen jedoch bei, während die Erfassung das Gerät herausfiltert.
Eine Neuerstellung im deaktivierten Zustand kann Zeilen entfernen. Die Massenaktion
**Aktivieren** verwendet einen vorhandenen Cache wieder oder initialisiert ihn, wenn
er leer ist; ein zusätzliches Speichern des Geräts ist im Allgemeinen nicht erforderlich.
Ein vorhandener unvollständiger oder veralteter Cache erfordert dennoch eine Untersuchung.

Ein SNMP-Element, dessen Gerät über keine nutzbare SNMP-Konfiguration verfügt, erzeugt
keine Zeile. Fehlt die Version, liegt sie außerhalb des gültigen Bereichs oder ist die
Community bei Version 1 oder 2 leer, wird die Zeile übersprungen, anstatt eine Zeile
zu schreiben, die in jedem Zyklus fehlschlagen würde.

Wenn eine Eingabe-Whitelist konfiguriert ist, verhindert eine fehlende Datei oder eine
abgelehnte Eingabe neue Zeilen für diese Eingabe. Eine abgeschlossene Neuerstellung
bereinigt weiterhin die veralteten Zeilen. Ohne eine `input_whitelist`-Konfiguration
erlaubt diese Prüfung Eingaben; sie ist kein dauerhaft aktiver Schutz. Überprüfen Sie
den abgelehnten Befehl und die konfigurierte Richtlinie, bevor Sie die Whitelist ändern.

Die Benutzeroberfläche kann weiterhin eine Datenquelle anzeigen, deren Cache leer ist.
Ihr Graph zeigt möglicherweise alte Verläufe an oder weist Lücken auf; eine flache
Nulllinie ist kein verlässlicher Indikator. Fehlende Zugangsdaten und abgelehnte
Eingaben sind Konfigurationsprobleme, die behoben werden müssen.

## Warum eine Änderung scheinbar nichts bewirkt

Drei unterschiedliche Mechanismen führen zum selben Symptom.

**Die Zeile wurde nicht neu erstellt.** Sie haben etwas geändert, das die
Benutzeroberfläche nicht als erfassungsrelevant einstuft, oder Sie haben es außerhalb
der Oberfläche geändert. Der Cache enthält weiterhin die alte Antwort. Eine
Neuerstellung kann die zwischengespeicherten Felder aktualisieren, nachdem die
vorgesehene Konfiguration überprüft wurde.

**Die Zeile wurde nie erstellt.** Oben beschrieben. Eine Neuerstellung behebt dies
ebenfalls, jedoch erst, nachdem die zugrunde liegende Ursache behoben wurde.
Diagnosehinweise erscheinen oft in den Protokollen und nicht auf dem Graphen.

**Der Wert wird erfasst und anschließend verworfen.** Mehrwertige Ausgaben werden
über die Vorlagenfelddefinitionen zugeordnet, und nicht referenzierte Felder können
beim Parsen übersprungen werden. Überprüfen Sie die erwarteten Feldnamen, Zuordnungen
und Graphverknüpfungen; diese Regel verwirft nicht pauschal alle numerischen Messwerte
ohne Graphreferenz. Eine Cache-Neuerstellung kann einen fehlerhaften Ausgabe-Vertrag
nicht reparieren.

## Das grobe Instrument

Verwenden Sie für ein einzelnes Gerät die Funktion **Poller-Cache neu füllen** auf
dessen bisheriger Geräteseite. Diese Aktion ruft den gerätebezogenen Pfad
`push_out_host()` auf. Überprüfen Sie anschließend die resultierenden Zeilen und
Diagnosemeldungen.

Das aktuelle Hauptskript `rebuild_poller_cache.php` akzeptiert zwar `--host-id`,
leitet diesen Filter jedoch nicht an seinen Worker-Befehl weiter. Eine vermeintliche
CLI-Neuerstellung für ein einzelnes Gerät kann daher andere aktivierte Geräte
ebenfalls neu aufbauen. Verlassen Sie sich bei der Isolation nicht auf diese Option,
bis dieser Anwendungsfehler behoben ist.

Eine umfassende CLI-Neuerstellung ist aus dem Anwendungsstammverzeichnis verfügbar
und wird als Poller-Benutzer ausgeführt:

```bash
php cli/rebuild_poller_cache.php
```

Sie verarbeitet aktivierte Geräte; sie ist keine Reparatur für jede hostlose oder
deaktivierte Quelle. Dies schreibt in Erfassungstabellen und kann Zeit in Anspruch
nehmen. Vermeiden Sie überlappende Neuerstellungsläufe und unterbrechen Sie den
Vorgang nicht. Das `--force`-Argument der CLI überschreibt den Schutz vor doppelter
Prozessregistrierung und ist daher keine Option für Routinereparaturen.

Eine Neuerstellung aktualisiert abgeleitete Zustände; sie repariert nicht die
Erreichbarkeit von Geräten, verschiebt keine RRD-Dateien, behebt keine abgelehnten
Eingabebefehle und stellt keine verlorenen Verläufe wieder her. Untersuchen Sie den
resultierenden Cache, die Protokolle und nachfolgende Erfassungszyklen, bevor Sie
die Reparatur als abgeschlossen betrachten.

Kadupul zeichnet auf, wann sich der Cache zuletzt geändert hat, wodurch andere
Teile des Systems erkennen können, dass sie ihn neu einlesen müssen.

## Mehrere Collectoren

Bei mehreren Collectoren gehört jede Zeile zu genau einem von ihnen, und die
Zeilen werden sowohl in die eigene Datenbank dieses Collectors als auch in die
zentrale Datenbank übertragen.

Wenn ein entfernter Collector beim Speichern einer Änderung nicht erreichbar ist,
wird die Änderung zentral und nicht entfernt angewendet. Kadupul weist darauf hin:
Es fordert eine vollständige Synchronisierung an, sobald der Collector wieder
erreichbar ist. Bis zu dieser Synchronisierung führt der entfernte Collector eine
ältere Arbeitsliste aus als die, die Ihnen die Oberfläche anzeigt. Eine
collectorspezifische Diskrepanz ist ein Anlass, den Replikationsstatus, die
Konnektivität und den lokalen Cache jedes Collectors zu untersuchen.

Die Reihenfolge innerhalb eines vollständigen Durchlaufs, einschließlich des
Zeitpunkts, an dem der Cache gelesen wird und Reindex-Befehle abgearbeitet werden,
ist in [Poller-Lebenszyklus](/de/reference/poller-lifecycle/) beschrieben.
Informationen zur Skalierung von Collectoren finden Sie unter
[Poller skalieren](/de/guides/scale-the-poller/).
