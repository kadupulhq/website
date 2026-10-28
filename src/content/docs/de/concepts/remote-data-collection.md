---
title: Remote-Datenerfassung
description: Warum sich die Erfassung verteilt und die Speicherung nicht, was ein Remote-Kollektor verwaltet und was eine zweite Kopie der Konfiguration kostet.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 9
---

:::caution[Vererbtes RRDtool-Proxy-Verhalten]
Der Einsatz des RRDtool-Proxys wird in Kadupul nicht unterstützt. Verwenden Sie lokalen
RRDtool-Speicher (`storage_location = 0`). Proxy-Einstellungen, Protokollbeschreibungen
und Arbeitsabläufe auf dieser Seite dokumentieren geerbtes Verhalten, keinen unterstützten
Bereitstellungs- oder Migrationspfad. Siehe [RRDtool-Proxy](/de/reference/rrdproxy/).
:::

Die Datenerfassung ist der Teil, der nicht auf eine einzelne Maschine passt. Der Großteil eines
Abfragedurchlaufs besteht aus dem Warten auf Antworten von Geräten, und dieses Warten lässt
sich nicht komprimieren. Sie können mehr davon mit zusätzlichen Prozessen und Threads überlappen,
bis der erfassende Host keine CPU-Ressourcen mehr hat oder die Paketlaufzeit zu einem entfernten
Standort den Ablauf dominiert.

Ein Remote-Kollektor verwendet denselben Code mit einer anderen Kollektor-ID und fragt eine
Teilmenge von Geräten ab. Jedes Gerät benennt den für es zuständigen Kollektor. Diese Zuordnung
bildet die reguläre Ablaufsteuerung. Halten Sie die Gerätezuteilung und den replizierten
Poller-Cache konsistent; diese Planungsentscheidung garantiert nicht, dass jeder Schreibvorgang
die Kollektorzuständigkeit prüft.

Zur Frage, *wann* ein Kollektor sinnvoll ist, siehe
[Poller skalieren](/de/guides/scale-the-poller/). Diese Seite erläutert, was ein Kollektor ist.

## Warum ein Kollektor eine eigene Datenbank führt

Ein Kollektor, der seine Aufgabenliste über das Netzwerk aus der zentralen Datenbank abruft,
bricht die Erfassung ab, sobald das Netzwerk ausfällt. Das ist das Gegenteil dessen, wozu ein
Remote-Kollektor angeschafft wurde.

Daher besitzt er eine lokale Datenbank mit einer eigenen Kopie der Konfiguration: Einstellungen,
Vorlagen, Dateneingabemethoden, Datenabfragen, seinem Anteil am Poller-Cache, seinen Geräten,
der Plugin-Konfiguration sowie den Benutzer- und Berechtigungstabellen. Diese Kopie wird von der
Hauptinstallation übertragen. Betrachten Sie die Hauptinstallation als maßgebliche Instanz für
die Konfiguration, während der Kollektor den lokalen Betriebszustand und Maschineneinstellungen
verwaltet.

Pfadangaben sind von der Kopie ausgenommen, ebenso wie die Durchlaufstatistiken, die die
Hauptinstallation für sich behält. Pfade sind Eigenschaften einer Maschine, nicht der
Gesamtinstallation.

## Replikation erfolgt periodisch, daher hinkt die Konfiguration hinterher

Der Haupt-Poller prüft aktivierte Remote-Kollektoren mit einem externen Datenbank-Host und einem
Synchronisationsintervall ungleich null. Ein Kollektor ist fällig, wenn er noch nie synchronisiert
wurde, sein Intervall abgelaufen ist oder er als synchronisationsbedürftig markiert ist. Ein
Intervall von null schließt ihn von dieser periodischen Prüfung aus, selbst wenn er als
abgleichbedürftig gekennzeichnet ist.

Der globale Standardwert liegt bei zwei Stunden; ein Kollektor kann ein eigenes Intervall haben.
Dies garantiert nicht, dass jede Änderung zwei Stunden wartet: Geräte- und Plugin-Aktionen verfügen
auch über gezielte Replikationspfade. Eine erfolgreiche Übertragung hängt von der jeweiligen
Operation, der Netzwerkverbindung und den gewählten Tabellen ab. Überprüfen Sie die tatsächliche
Konfiguration und den Cache des Kollektors, anstatt sofortige Konsistenz oder eine feste Verzögerung
anzunehmen.

Eine vollständige Replikation kann vom Haupt-Kollektor mit `php cli/poller_replicate.php`
angefordert werden, wenn aktivierte Remote-Kollektoren eingerichtet sind. Der Befehl repliziert
jeden aktiven Kollektor, sofern nicht `--poller=N` einen einzelnen auswählt.
Siehe [Poller skalieren](/de/guides/scale-the-poller/) und
[Auf neue Hardware migrieren](/de/guides/migrate-to-new-hardware/) für betriebliche Zusammenhänge.

## Drei Verbindungsmodi

Ein Kollektor entscheidet beim Start über sein Verhalten basierend darauf, ob die zentrale
Datenbank antwortet und ob er noch nicht übertragene Messwerte zwischenspeichert.

| Modus | Bedingung | Verhalten |
|---|---|---|
| Online | Zentrale Datenbank verbindet und kein lokaler Boost-Rückstau erkannt | Schreibvorgänge für Ergebnisse zielen auf die zentrale Datenbank |
| Offline | Zentrale Verbindung schlägt fehl oder wird erzwungen getrennt | Erfassung nutzt lokale Pufferung, sofern lokale Dienste intakt bleiben |
| Wiederherstellung | Zentrale Datenbank verbindet und lokale Boost-Zeilen verbleiben | Neue Messwerte bleiben lokal, während ein Hintergrundprozess den Rückstau überträgt |

Offline ist kein Fehlerzustand. Es ist das vorgesehene Verhalten eines Kollektors bei unterbrochener
Verbindung und der Grund, warum ein Kollektor überhaupt eine lokale Datenbank führt. Die Erfassung
wird auf Basis der lokal verfügbaren Konfiguration fortgesetzt. Lokale Datenbankkapazität,
Gerätezugriff, Zustand der Ablaufsteuerung und gültige Anmeldedaten sind weiterhin erforderlich;
der Offline-Modus garantiert weder eine unterbrechungsfreie Erfassung noch die spätere Zustellung.

## Wie Ergebnisse die Hauptinstallation erreichen

Ergebnisse werden nicht als RRD-Dateischreibvorgänge übertragen, sondern als Datenbankzeilen.

Das verzögerte Schreiben von RRDs ist erforderlich, sobald mehr als ein Kollektor existiert,
und das Hinzufügen eines aktiven Remote-Kollektors veranlasst den Haupt-Poller, verzögerte
Aktualisierungen zu aktivieren. Der Startpfad aktiviert zudem System-Boost und Weiterleitung,
wenn mehrere Kollektor-Einträge vorhanden sind. Diese Einstellungen allein garantieren noch keine
funktionsfähige Bereitstellung.
Siehe [Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/) für Details zu diesem Modus.

Im Online-Modus fügt ein Kollektor seine Messwerte direkt in die zentrale Puffertabelle ein.
Die Hauptinstallation schreibt sie nach eigenem Zeitplan in RRD-Dateien, genau wie bei selbst
erfassten Werten. Die Messwerte des Kollektors werden nach dem Eintreffen nicht gesondert behandelt.

Im Offline-Modus und während der Wiederherstellung sammeln sich die Messwerte in der lokalen
Boost-Warteschlange. Sobald die zentrale Datenbank wieder erreichbar ist, überträgt
`poller_recovery.php` gepufferte Zeilen in die zentrale Boost-Warteschlange und aktualisiert
dabei die Ausgabe bereits vorhandener Zeilen.

Die Wiederherstellung löscht eine lokale Zeile erst, nachdem das Einfügen ihres Pakets in der
Zentrale erfolgreich war und nur dann, wenn die lokale Zeile noch dem gesendeten Stand entspricht.
Ein fehlgeschlagener Insert, ein zu großer Messwert oder eine während der Bereinigung veränderte
Zeile belässt die lokalen Werte für den nächsten Versuch im Puffer. Diese Seite beschreibt kein
vollständig validiertes Multi-Kollektor-Wiederherstellungsverfahren.

Die Wiederherstellungsabfragen enthalten Datenquellen-IDs, Namen, Zeitstempel und Werte; sie
prüfen diese Zeilen nicht gegen Kollektor-Zuweisungen. Verlassen Sie sich nicht auf eine generelle
Übergabeabweisung, um sich vor veralteten Zuweisungen oder überlappenden Erfassern zu schützen.
Prüfen Sie Zuweisungen und Cache-Zustände vor dem Start der Erfassung.

## Speicher verteilt sich nicht

Der übernommene proxybasierte Ablauf hält RRD-Dateien zentral und lässt Kollektoren über den
RRDtool-Proxy darauf zugreifen. Dieser Ablauf wird in Kadupul nicht unterstützt; betrachten Sie
ihn nicht als Bereitstellungsempfehlung. Ein validierter Speicherpfad für mehrere Kollektoren
unter Verwendung von lokalem RRDtool muss dokumentiert sein, bevor ein Ersatz empfohlen werden kann.

Dieser Umstand überrascht Administratoren häufig, daher muss er deutlich formuliert werden:
**Remote-Kollektoren verteilen das Warten, nicht das Schreiben.** Wenn der Engpass die Festplatte
unterhalb des RRD-Baums war, beseitigen zusätzliche Kollektoren diesen Engpass nicht. Mehr
eingehende Messwerte können die Last auf die zentrale Datenbank und den Schreibüberhang erhöhen.

## Was sonst noch zurückfließt

Ein Kollektor verwaltet den Betriebsstatus seiner Geräte: Erreichbarkeit, letzter Fehler,
Paketlaufzeiten, Abfragezähler, Verfügbarkeit. Er schreibt diese Werte beim Abfragen lokal
und überträgt ausgewählte operative Spalten gebündelt an die Hauptinstallation. Dies aktualisiert
diese Spalten, nicht die gesamte Konfigurationszeile des Geräts.

Was die Hauptinstallation als Erreichbarkeit eines Geräts anzeigt, ist somit die Sicht des
Kollektors zum Zeitpunkt der letzten erfolgreichen Übertragung. Ein Kollektor, der offline ist,
besitzt ein aktuelles Bild seiner Geräte, das an der Hauptinstallation niemand sehen kann.

Die Hauptinstallation überwacht Kollektoren auf dieselbe Weise, wie ein Kollektor Geräte überwacht.
Ein Verfügbarkeitsprüfer stuft einen aktiven Remote-Kollektor nur dann als betriebsbereit ein,
wenn sein letzter Status-Zeitstempel weniger als das Doppelte des konfigurierten Abfrageintervalls
alt ist. Diese Prüfung beweist weder die Übertragung von Messwerten noch eine erfolgreiche
Replikation oder aktuelle Graphen.

## Fehlermodi

| Was ausfällt | Was passiert | Was man bemerkt |
|---|---|---|
| Verbindung zur Hauptinstallation | Kollektor arbeitet lokal weiter, solange Datenbank und Scheduler intakt sind | Verzögerte Graphen und wachsende Warteschlange; Zustellung und Datenverlust prüfen |
| Der Kollektor selbst | Zugewiesene Geräte werden eventuell nicht mehr abgefragt | Fehlende Messwerte; Scheduler, Geräte- und Kollektorstatus diagnostizieren |
| Replikation | Kollektor arbeitet mit älterer Konfiguration | Änderungen scheinen keine Wirkung zu zeigen |
| Die zentrale Datenbank | Remote-Prozesse können in den Offline-Modus wechseln, wenn der Verbindungsaufbau scheitert | Zentrale Datenannahme gestört; lokale Pufferung hängt von lokalem Systemzustand ab |
| Überlappende oder veraltete Zuweisungen | Mehrere Erfasser können zusammenhängende Messwerte senden | Keine automatische Abweisung; Zuweisungen, Zeitstempel und Schreibfehler prüfen |

Pufferung kann manche Ausfälle in Verzögerungen umwandeln, verhindert Datenverluste jedoch nicht
vollständig. Prüfen Sie das Alter der Warteschlange, Datenbankkapazitäten, Wiederherstellungsfehler
und die resultierenden RRD-Zeitstempel. Ein flacher Graph allein unterscheidet einen Geräteausfall
nicht von einer verzögerten oder fehlgeschlagenen Zustellung.

## Was es kostet

Im Vergleich zu einem einzelnen zentralen Poller:

**Sie gewinnen** parallele Antwortzeiten über mehrere Maschinen hinweg, Abfragen nahe am Gerät
anstatt über Weitverkehrsnetze und die Möglichkeit, die lokale Erfassung bei Nichterreichbarkeit
der Hauptinstallation fortzusetzen, vorbehaltlich der oben genannten Grenzen.

**Sie bezahlen** mit einer Konfigurationsreplikation, die verzögert sein kann, einer zweiten
Datenbank pro Kollektor, die betrieben, überwacht und gesichert werden muss, einem verzögerten
Schreibmodus, der nicht mehr optional ist, und einer zentralen Datenbank, die gleichzeitige
Schreibzugriffe von jedem Kollektor verarbeiten muss.

Zusammenfassend ist ein Remote-Kollektor ein zusätzlicher Server, den Sie betreiben müssen. Ein
Poller mit mehr Prozessen ist eine Einstellung. Ein Kollektor ist Infrastruktur mit eigener
Datenbank, eigenen Anmeldedaten, eigener Uhr und einer eigenen Sicht auf die Wahrheit für die
Dauer, in der die Replikation ausbleibt.
