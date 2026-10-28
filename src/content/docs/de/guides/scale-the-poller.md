---
title: Den Poller skalieren
description: Was zu ändern ist, wenn die Datenerfassung nicht mehr innerhalb des Intervalls abgeschlossen wird, und wie Sie feststellen, welches Limit Sie tatsächlich erreicht haben.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 6
---

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Die Skalierung des Pollers läuft auf eine Frage hinaus: Ist ein Erfassungsdurchlauf abgeschlossen,
bevor der nächste beginnt? Alles Folgende befasst sich mit der Beantwortung dieser Frage und
den Maßnahmen, um die Antwort wieder auf Ja zu stellen.

Lesen Sie zuerst die [Architektur](/de/concepts/architecture/), wenn Ihnen nicht klar ist,
welcher Teil die Erfassung durchführt.

## Die zwei Takte

Es gibt zwei Intervalle, und sie stellen nicht denselben Wert dar.

| | Was es ist | Erlaubte Werte |
|---|---|---|
| Starter-Intervall | Wie oft das Betriebssystem den Kollektor startet, über Cron oder den `cactid`-Dienst | 60 oder 300 Sekunden |
| Poller-Intervall | Basis-Erfassungstakt; einzelne Datenquellenschritte können länger sein | 10, 15, 20, 30, 60 oder 300 Sekunden |

Wenn das Poller-Intervall kürzer als das Starter-Intervall ist, führt ein einzelner Start
mehrere Erfassungsdurchläufe in einer Schleife aus. Die Anzahl der Durchläufe entspricht
dem Starter-Intervall geteilt durch das Poller-Intervall.

Das Zeitbudget für den gesamten Start wird aus diesen beiden Zahlen abgeleitet: Durchläufe
multipliziert mit dem Poller-Intervall, abzüglich zwei Sekunden. Das ist die reale Uhrzeit,
an der der Durchlauf gemessen wird.

## Was passiert, wenn ein Durchlauf überzieht

Drei unterschiedliche Dinge, und sie erzeugen drei unterschiedliche Protokollzeilen.

**Der Durchlauf wird abgebrochen.** Wenn die verstrichene Zeit das Budget überschreitet, protokolliert
der Poller, dass die maximale Laufzeit überschritten wurde, schreibt seine Statistiken und beendet
sich. Arbeiten, die noch keinen Messwert erzeugt haben, können eine Lücke hinterlassen. Messwerte, die
bereits in die dauerhafte Warteschlange aufgenommen wurden, können für ein späteres erfolgreiches
RRD-Schreiben ausstehend bleiben; eine Überziehung bedeutet nicht, dass jede ungeflushte Messung
verworfen wurde. Untersuchen Sie die Warteschlangentiefe und die Protokolle zusammen mit dem Diagramm,
und löschen Sie keine beibehaltenen Zeilen, nur damit der nächste Durchlauf sauber aussieht.

**Der nächste Durchlauf bemerkt die Trümmer.** Beim Start zählt der Poller Prozesszeilen,
die nie ordnungsgemäß abgeschlossen wurden, und warnt davor, dass Prozesse erkannt wurden,
die einen Abfragezyklus überziehen. Untersuchen Sie unvollendete oder veraltete Prozessdatensätze
und tatsächlich laufende Kindprozesse; die Warnung allein identifiziert nicht den Engpass.

**Die Takte driften auseinander.** Wenn seit dem letzten Durchlauf mehr Zeit vergangen ist,
als das Budget erlaubt, warnt der Poller davor, dass der Starter nicht mehr synchron mit dem
Poller-Intervall läuft. Dies liegt normalerweise am Starter, nicht am Poller: ein Cron-Eintrag mit
der falschen Frequenz, ein gestoppter Dienst oder ein Host, der im Ruhezustand war.

Diese Pfade rufen den Administrator-Benachrichtigungs-Helper auf. Die Zustellung hängt von konfigurierten
Empfängern, Benachrichtigungssteuerungen und einem funktionierenden Mail-Transport ab; eine Warnung im
Protokoll beweist nicht, dass eine E-Mail angekommen ist. Siehe [E-Mail-Benachrichtigungen](/de/guides/send-email-notifications/).

Es gibt einen vierten Fall, der keine Überziehung darstellt. Wenn der Poller früher als erwartet
erneut gestartet wird, protokolliert er, dass er für eine zu häufige Ausführung konfiguriert ist,
und beendet sich ohne Datenerfassung. `--force` umgeht diese Zeitprüfung; verwenden Sie dies nur
während einer kontrollierten Diagnose, wenn geplante und andere manuelle Starts gestoppt sind.
Es fügt keine Kapazität hinzu und macht eine überlappende Erfassung nicht sicher.

## Die Statistikzeile

Jeder abgeschlossene Durchlauf schreibt eine Statistikzeile in das Protokoll. Sie enthält
die verstrichene Zeit, die Erfassungsmethode, die Prozess- und Thread-Anzahlen, die Anzahl
der Geräte, Geräte pro Prozess, Datenquellen und verarbeitete RRD-Dateien.

Erfassen Sie Trends bei verstrichener Zeit, Tail-Latenz, Warteschlangentiefe und fehlgeschlagenen
Aktualisierungen. Untersuchen Sie selbst einen isolierten Lauf nahe am Budget, wenn er Lücken
verursacht; anhaltendes Wachstum hilft zu erkennen, wann Kapazität oder Erfassungsverhalten
geändert werden müssen.

## Prozesse und Threads

Zwei Stellschrauben, und sie bewirken unterschiedliche Dinge.

| Stellschraube | Arbeitseinheit, die sie aufteilt | Welcher Kollektor sie verwendet |
|---|---|---|
| Prozesse | Geräte, aufgeteilt in zusammenhängende Bereiche von Geräte-IDs | Beide |
| Threads | Elemente innerhalb eines Geräts | Nur Spine |

Die Konsequenz ist der Punkt, über den viele stolpern: **Ein Prozess bekommt ganze
Geräte zugewiesen.** Ein Gerät mit fünftausend Datenquellen kann nicht über Prozesse
verteilt werden. Es landet in einem Prozess, und dieser Prozess benötigt so viel Zeit,
wie er eben braucht. Das Hinzufügen von Prozessen ändert daran nichts.

Beide Werte werden pro Datenkollektor vorgehalten, nicht global. Die Werte auf der
Einstellungsseite sind Voreinstellungen, die angewendet werden, wenn ein neuer Datenkollektor
erstellt wird. Das Ändern der Voreinstellung ändert keinen bestehenden Kollektor.

Es gibt auch eine Thread-Anzahl pro Gerät, über die ein einzelnes großes Gerät
aufgeteilt wird. Dies gilt nur für den C-Kollektor.

Balance Process Load verwendet kumulierte Elementanzahlen, um Grenzen zwischen
ganzen Geräten in Reihenfolge der Geräte-ID zu wählen. Es teilt ein Gerät nicht auf und
garantiert keine gleichen Elementanzahlen, und die Elementanzahl entspricht nicht der Ausführungszeit.
Vergleichen Sie das Timing pro Prozess vor und nach der Aktivierung bei einer isolierten,
repräsentativen Arbeitslast.

## Der PHP-Kollektor im Vergleich zum C-Kollektor

Der PHP-Kollektor, `cmd.php`, wird mit der Anwendung geliefert. Kadupul plant,
einen Spine-Fork zu pflegen, aber dessen Quellcode-Speicherort und validierte Builds
sind noch nicht dokumentiert. Verwenden Sie PHP, bis entsprechende Nachweise vorliegen.
Die folgenden Spine-Vergleiche, Thread-Einstellungen und Befehle beschreiben übernommenes
Verhalten, keine verfügbare oder unterstützte Kadupul-Bereitstellung.

| | PHP-Kollektor | Spine |
|---|---|---|
| Parallelität | Nur Prozesse | Prozesse und Threads |
| Thread-Einstellung | Unabhängig von der Konfiguration auf 1 erzwungen | Berücksichtigt |
| Skriptserver | Einer pro Prozess, nicht konfigurierbar | 1 bis 15 pro Prozess, konfigurierbar |
| Skript-Timeout | Nicht angewendet | Angewendet, Standard 25 Sekunden |
| Installation | Wird mit dem Code ausgeliefert | Geplanter Fork; kein validierter Kadupul-Build dokumentiert |

Die erzwungene Thread-Anzahl sollte unmissverständlich formuliert werden: Wenn der Kollektor
auf den PHP-Kollektor eingestellt ist, wird die Thread-Laufzeitvariable auf 1 gesetzt; dadurch
wird die gespeicherte Thread-Einstellung des Kollektors nicht überschrieben. Das Skalieren des
PHP-Kollektors kann mehr Prozesse erfordern, und die Empfehlung im Quellcode lautet, bei oder
unter dem Doppelten der Anzahl der CPU-Kerne zu bleiben.

Die Spine-Konfiguration und das Befehlsverhalten erfordern eine Validierung anhand der genauen
Binärdatei, die evaluiert wird. Der Quellcode der PHP-Anwendung allein begründet nicht deren
Konfigurationssuchreihenfolge, Thread-Verhalten oder Nebenwirkungen.

Übernommene Beispiele für eine isolierte Spine-Evaluierung, keine validierten Kadupul-Befehle:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` soll Schreibvorgänge für Ergebnisse vermeiden. Es kontaktiert weiterhin
Geräte und führt Erfassungsskripte aus; validieren Sie dessen Nebenwirkungen zuerst in
einem isolierten Test.

## Datenbankverbindungen

Threads sind nicht kostenlos. Jeder Spine-Thread hält seine eigene Datenbankverbindung,
und dasselbe gilt für jeden Skriptserver.

```
estimated worker connections = processes * (threads + script_servers)
```

Dies ist die Schätzung in der Hilfe zu den Anwendungseinstellungen, keine gemessene Obergrenze.
Summieren Sie diese über Kollektoren und fügen Sie Kapazität für Poller-Elternprozesse,
Webanfragen, Wartung und andere Clients hinzu. Messen Sie tatsächliche Spitzenverbindungen und
abgelehnte Verbindungen, bevor Sie das Datenbanklimit festlegen; dessen Erhöhung verbraucht
ebenfalls Ressourcen.

Verbindungserschöpfung kann zu fehlenden Messwerten führen, aber rotierende Lücken sind
keine eindeutige Diagnose. Bestätigen Sie dies anhand von Datenbank-Verbindungsmetriken und
Anwendungsfehlern.

## Verzögerte RRD-Schreibvorgänge

Es gibt einen Modus, der verhindert, dass der Poller bei jedem Durchlauf in RRD-Dateien schreibt.
Ergebnisse sammeln sich stattdessen in einer Datenbanktabelle und werden gesammelt geleert, entweder
über einen Timer oder wenn ein Diagramm die Datei anfordert. Dies tauscht eine große Anzahl kleiner
Schreibvorgänge gegen eine kleine Anzahl großer Schreibvorgänge ein.

Zwei betrieblich relevante Tatsachen dazu:

- Es ist erforderlich, wenn Sie Remote-Datenkollektoren betreiben. Dies ist kein Ratschlag,
  sondern eine von der Software vorgegebene Bedingung.
- Die Puffertabelle ist persistent und liegt nicht im Arbeitsspeicher, sodass ungeflushte
  Messwerte einen Neustart überstehen. Dies bedeutet auch, dass Ihre RRD-Dateien hinter Ihrer
  Datenbank hinterherhinken. Siehe [Sichern und Wiederherstellen](/de/guides/back-up-and-restore/),
  bevor Sie einen Snapshot erstellen.

Die zentrale In-Flight-Warteschlange `poller_output` ist in dieser Revision ebenfalls InnoDB.
Die Speicher-Vorabprüfung lehnt eine MEMORY-Warteschlange ab; das Erhöhen des Heap-Tabellen-Limits
beseitigt diese Verweigerung nicht. Konvertieren Sie bei gestoppten Produzenten und beibehaltenem,
passendem Backup eine übernommene ungeeignete Warteschlange explizit, und prüfen Sie dann den Speicher
unter jedem Dienstkonto:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Dies sind getrennte Operationen. Erhalten Sie ausstehende Zeilen und überwachen Sie den
Datenbank-Festplattenspeicher sowie das Alter der Warteschlange zusätzlich zur Zeilenanzahl.
Siehe [Sicher aktualisieren](/de/guides/upgrade-safely/) für Warteschlangenauswahl,
Vertrauensprüfungen für Dienstkonten und Voraussetzungen für einen Neustart.

## Wann auf Remote-Kollektoren umgestellt werden sollte

Ein Remote-Datenkollektor ist ein zweiter Rechner, der denselben Code mit einer anderen
Kollektor-ID ausführt, eine Teilmenge der Geräte abfragt und Ergebnisse zurück in die
zentrale Datenbank schreibt.

Stellen Sie auf einen solchen um, wenn der Engpass auf der Erfassungsseite und nicht auf
der Speicherseite liegt:

- Die CPU des Poller-Hosts ist während eines Durchlaufs ausgelastet und zwischen Durchläufen im Leerlauf.
- Die Roundtrip-Latenz zu einer Gruppe von Geräten dominiert den Durchlauf, und diese Gruppe
  befindet sich hinter einer einzelnen Verbindung.
- Ein Standort befindet sich am fernen Ende eines WAN, über das Sie nicht abfragen möchten.
- Sie benötigen eine Erfassung an isolierten Standorten und haben die Offline-Pufferung und
  Wiederherstellung für diesen Kollektor validiert, bevor Sie sich darauf verlassen.

Remote-Kollektoren beseitigen keine zentralen Datenbank- oder RRD-Schreiblimits. Messen Sie
die zentrale Erfassungs- und Flush-Kapazität, bevor Sie den Erfassungsdurchsatz erhöhen;
zusätzliche Produzenten können einen bestehenden Rückstau vergrößern.

Jeder Kollektor verfügt über eigene Prozess- und Thread-Anzahlen, eigene Datenbank-Zugangsdaten
und ein Synchronisationsintervall, das standardmäßig zwei Stunden beträgt. Es gibt ein
Befehlszeilenwerkzeug, um eine vollständige Synchronisation zu erzwingen, statt zu warten.

Die zentrale Installation kann den Website- und Plugin-Code auf Remote-Kollektoren replizieren,
damit diese sich selbst aktualisieren. Diese Replikation kann deaktiviert werden, wenn Sie Code
auf andere Weise bereitstellen.

## Welches Limit haben Sie erreicht

Verwenden Sie diese Tabelle, um Hypothesen aufzustellen, und überprüfen Sie diese anschließend
anhand von Protokollen und Messungen. Mehrere Limits können gemeinsam auftreten. Spine-Optionen
bleiben hier unvalidiert.

| Beobachtung | Limit | Was zu ändern ist |
|---|---|---|
| Warnung, dass Starter nicht synchron ist, Poller ansonsten schnell | Zeitplanverzögerung, vorherige Überziehung oder Host-Unterbrechung | Startverlauf und Prozessstatus untersuchen |
| Laufzeit gleichbleibend, ein Gerät immer verspätet | Langsame Antworten, aufwendige Skripte oder konzentrierte Arbeit | Dessen Eingabemethoden messen und Timeout-/Wiederholungsverhalten prüfen |
| Laufzeit skaliert mit Geräteanzahl, CPU ausgelastet | CPU-Druck auf dem Kollektor | Messen, ob mehr Prozesse helfen; Kollektor-Platzierung prüfen |
| Laufzeit skaliert mit Geräteanzahl, CPU im Leerlauf | Netzwerk-, Skript- oder Datenbank-Wartezeiten | Warteursachen messen, bevor die Nebenläufigkeit geändert wird |
| Fehlende Messwerte bei einer rotierenden Menge von Geräten | Verbindungen, Timeouts oder andere Erfassungsfehler | Fehler, Verbindungsmetriken und beibehaltene Warteschlangen prüfen |
| Laufzeit in Ordnung, RRD-Schreibvorgänge langsam, Festplatte ausgelastet | Speicher | Verzögerte RRD-Schreibvorgänge oder schnellere Festplatte |
| Alles langsam, einschließlich der Weboberfläche | Datenbank | Puffer-Pool-Größe, dann den Datenbank-Host anpassen |

Zwei Stolperfallen, die es wert sind, genannt zu werden.

**Das Ändern des Basisintervalls ist nicht dasselbe wie das Ändern jedes Datenquellenschritts.**
Gleichen Sie Profile, zwischengespeicherte Elementschritte und RRD-Heartbeat-/Schrittdefinitionen ab.
Das Neuerstellen des Caches formt bestehende RRD-Dateien nicht um. Siehe
[Datenaufbewahrung](/de/guides/manage-data-retention/) und
[Zeit und Intervalle](/de/concepts/time-and-intervals/).

**Ein schnelleres Intervall multipliziert alles.** Der Wechsel von 300 Sekunden auf 60 macht
die Arbeit nicht fünfmal günstiger. Quellen, die für diese schnellere Frequenz konfiguriert sind,
werden häufiger erfasst; Quellen, die längere Schritte beibehalten, müssen nicht bei jedem
Basisdurchlauf ausgeführt werden. Messen Sie die resultierende Last, anstatt anzunehmen, dass
jeder Durchlauf gleich viel Arbeit bedeutet.
