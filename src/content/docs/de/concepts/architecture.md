---
title: Architektur
description: Die vier beweglichen Teile und welcher davon gewöhnlich fehlerhaft ist.
sidebar:
  order: 1
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
---

:::caution[Geerbtes RRDtool-Proxy-Verhalten]
Der Einsatz des RRDtool-Proxys wird in Kadupul nicht unterstützt. Verwenden Sie lokalen RRDtool-Speicher
(`storage_location = 0`). Proxy-Einstellungen, Protokollbeschreibungen und Arbeitsabläufe
auf dieser Seite dokumentieren geerbtes Verhalten, keinen unterstützten Bereitstellungs- oder Migrationspfad.
Siehe [RRDtool-Proxy](/de/reference/rrdproxy/).
:::

Die Webanwendung, die Datenbank, die geplante Datenerfassung und der RRD-Speicher von Kadupul haben
unterschiedliche Aufgaben, doch ihre Ausführungspfade überschneiden sich. Zu wissen, welcher Vorgang fehlgeschlagen
ist, hilft bei der Eingrenzung von Fehlern: Eine funktionierende Benutzeroberfläche beweist nicht, dass die Datenerfassung funktioniert.

**Die Weboberfläche** ist eine PHP-Anwendung. Sie verwaltet die Konfiguration und rendert oder
liefert zwischengespeicherte Diagramme aus. Einige Webaktionen lösen auch die Datenerfassung aus, wie etwa Echtzeit-Diagrammanfragen,
und reguläre Diagrammanfragen können ausstehende RRD-Aktualisierungen veranlassen.

**Die Datenbank** enthält Konfiguration, Berechtigungen, Betriebsstatus, den Poller-Cache
und Messwarteschlangen. Erfasste Werte können dort verbleiben, während sie auf einen RRD-Schreibvorgang
oder Wiederholungsversuch warten: Sie ist nicht nur ein Konfigurationsspeicher.

**Der Poller** koordiniert geplante Aufgaben und untergeordnete Kollektor-Prozesse. Ergebnisse durchlaufen
Datenbankwarteschlangen, bevor der reguläre oder verzögerte Writer RRD-Dateien aktualisiert.

**Die RRD-Dateien** enthalten begrenzte historische Zeitreihen. Eine Datenquelle verfügt normalerweise über eine RRD-Datei,
die ihre Felder enthält; die Diagrammerstellung kann Datenquellen wiederverwenden, und das Anlegen von Metadaten
garantiert nicht, dass die Datei bereits existiert.

## Die Schnittstellen

| Schnittstelle | Was sie passiert | Übertragen durch |
|---|---|---|
| Benutzeroberfläche zur Datenbank | Konfiguration, Sitzungen, Autorisierung, zwischengespeicherte Aufgaben und Betriebsdaten | SQL; die Datenbank kann auf einem entfernten Host liegen |
| Benutzeroberfläche zu Dateien | Diagramm-Lesezugriffe, zwischengespeicherte Bilder und geeignete On-Demand-RRD-Aktualisierungen oder -Erstellungen | Dateisystem und RRDtool |
| Poller zur Datenbank | Arbeitslisten, erfasste Werte, zurückbehaltene Warteschlangen, Status und Countdowns | SQL |
| Datenerfassung zu Geräten | SNMP, Erfassungsskripte und Erreichbarkeitsprüfungen | Netzwerk oder lokale Befehle; web-ausgelöste Erfassung ist ebenfalls möglich |
| Writer zu Dateien | Gruppierte Messwerte, unter Umständen mehrere Zeitstempel pro Aktualisierung | RRDtool-Befehle und bestätigte Pipes |
| Datenbankserver zu RRD-Dateien | Keine direkte RRD-Aktualisierung im normalen Anwendungspfad | Der Anwendungscode des Writers koordiniert die beiden Speicher |

Datenbankzeilen verknüpfen eine Datenquelle mit einem Gerät und dessen konfiguriertem Dateipfad.
RRDtool-Dateien beschreiben Zeitreihen und Archive; sie ersetzen diese Anwendungszuordnung nicht.
Netzwerkverkehr beschränkt sich nicht auf Geräteabfragen: Datenbankverbindungen, entfernte Kollektoren
und andere konfigurierte Integrationen können ebenfalls Hosts überschreiten.

Sichern Sie Datenbankstatus, ausstehende Messwerte und RRD-Dateien konsistent. Eine reine
Datenbankwiederherstellung stellt historische RRD-Inhalte nicht wieder her, und eine reine Dateiwiederherstellung
lässt Konfiguration und noch nicht geleerte Messwerte aus. Das Verschieben von Dateien ohne Pfadabgleich
kann Fehler durch fehlende Dateien oder zurückbehaltene Schreibvorgänge verursachen; es ist kein
garantiert stiller Erfassungsfehler. Siehe [Sichern und Wiederherstellen](/de/guides/back-up-and-restore/) und
[Auf neue Hardware migrieren](/de/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Warum langfristige Verläufe RRD-Dateien nutzen

Langfristige Diagrammverläufe werden in RRDs gespeichert, Messwarteschlangen befinden sich jedoch in der Datenbank.
Die reguläre In-Flight-Warteschlange ist in dieser Version InnoDB, und verzögerte Schreibvorgänge halten
Messwerte in Boost-Tabellen zurück. Fehlgeschlagene Schreibvorgänge oder verzögerte Remote-Übertragungen können diese
Warteschlangen anwachsen lassen. Siehe [Schreibvorgänge mit hohem Volumen](/de/concepts/high-volume-writes/).

Eine RRD-Datei reserviert eine definierte Anzahl von Zeilen bei ausgewählten Auflösungen. Reguläre Aktualisierungen
nutzen diesen Platz wieder, anstatt den Verlauf endlos anzuhängen. Die Dateigröße bleibt bei unverändertem
Layout begrenzt: Das Hinzufügen von Datenquellen, das Ändern von Layouts, das Aufbewahren von Wiederherstellungskopien
oder das Anstauen von Warteschlangen erhöht dennoch den Gesamtspeicherbedarf.

Der Kompromiss ist eine im Voraus gewählte Aufbewahrungsdauer. Sobald detaillierte Verläufe abgelaufen sind oder
konsolidiert wurden, kann eine spätere Layoutänderung die verworfenen Details nicht wiederherstellen. Siehe
[Datenquellen und Round-Robin-Archive](/de/concepts/data-sources-and-rras/).

Konfiguration und Betriebsstatus nutzen die Datenbank, weil die Anwendung gemeinsame Aktualisierungen und
relationale Abfragen benötigt. Das bedeutet nicht, dass jede Beziehung durch einen Datenbank-Fremdschlüssel
erzwungen wird oder dass ein Zeilenspeicher zwangsläufig unbegrenzt wächst; es beschreibt die Aufgabenteilung dieser Anwendung.

## Zwei Pfade, zwei gemeinsame Teile

Ein regulärer Seiten- oder Diagrammaufruf folgt typischerweise diesem Pfad:

1. Ein Browser sendet eine Anfrage; PHP lädt die Konfiguration und verbindet sich mit der Datenbank.
2. Die Anfrage wendet Authentifizierung und die relevante Realm-/Objektautorisierung an.
3. Aktionen in der Konsole lesen oder aktualisieren die Konfiguration und können zusätzliche Aufgaben anstoßen.
4. Eine Diagrammanfrage kann ausstehende Boost-Messwerte und einen Bild-Cache prüfen oder einen
   RRDtool-Befehl zusammenstellen und die konfigurierten Dateien lesen. Siehe
   [Wie Diagramme gezeichnet werden](/de/concepts/how-graphs-are-drawn/).
5. Echtzeit-Diagrammanfragen können den Echtzeit-Kollektor starten und separate
   temporäre Daten nutzen. Ein flaches Diagramm allein beweist weder eine leere Datei noch eine
   erfolgreiche Erfassung und Darstellung.

Eine geplante Datenerfassung folgt typischerweise diesem Pfad:

1. Der Scheduler startet den Poller, der Aktivierungsstatus, Zeitplanung und Speicher prüft.
2. Er wählt fällige Aufgaben aus dem Poller-Cache aus und startet untergeordnete Kollektor-Prozesse.
3. Die Child-Prozesse fragen Geräte ab oder führen Erfassungsskripte aus und legen Ergebnisse in der Datenbank ab.
4. Der zuständige Writer verarbeitet gruppierte Messwerte, nutzt bei entsprechender Konfiguration
   verzögerte Warteschlangen und behält wiederholbare Fehler zurück.
5. Betriebsstatus und Planungszustand werden in der Datenbank aktualisiert.

Siehe [Lebenszyklus des Pollers](/de/reference/poller-lifecycle/) für Reihenfolge und Fehlerbehandlung.
Diese Pfade teilen sich Datenbank- und Speicherressourcen und können um diese konkurrieren. Ein Neustart
des Webservers repariert keinen separat geplanten Poller, aber Webanfragen können an der
Datenerfassung und am Schreiben beteiligt sein: Untersuchen Sie den tatsächlich fehlschlagenden Prozess.

## Was unter welchem Benutzer läuft

| Prozess | Läuft als | Gestartet durch |
|---|---|---|
| PHP-Webanwendung | Webserver oder PHP-FPM-Pool-Konto | Webserver |
| Geplanter Poller | Konfiguriertes Konto des Schedulers | cron, Aufgabenplanung oder konfigurierter Dienst |
| RRDtool | Erbt normalerweise das Konto des startenden Prozesses | Web-, Poller- oder Wartungspfad |
| Erfassungsskripte | Erben normalerweise das Konto ihres Kollektors | Geplante oder durch das Web ausgelöste Erfassung |

Alle beteiligten Writer-Konten benötigen angemessenen Zugriff auf den konfigurierten Speicher.
Die reguläre Datenquellenerstellung schreibt Metadaten; die RRD-Datei kann später erstellt werden, sobald
ein Writer sie benötigt. Eine fehlende Datei kann darauf hinweisen, dass die Erfassung diesen
Punkt noch nicht erreicht hat, ebenso wie auf einen Pfad-, Vertrauens-, Berechtigungs- oder Erstellungsfehler.

Einige Erstellungspfade, die unter root laufen, versuchen, Eigentümer und Gruppe des RRA-Verzeichnisses anzuwenden.
Diese Versuche können fehlschlagen und Fehler protokollieren; sie sind kein Ersatz für die korrekte
Konfiguration von Dienstkonten. Nicht-root-Eigentümerschaft folgt den Regeln des Betriebssystems,
einschließlich Gruppenvererbung von Verzeichnissen und ACLs. Überprüfen Sie Speicherberechtigungen und
numerische vertrauenswürdige UID/GID-Einstellungen unter jedem Web- und Poller-Writer-Konto. Siehe
[Sicher aktualisieren](/de/guides/upgrade-safely/).

Die geprüfte PHP-ICMP-Implementierung ruft das ping-Dienstprogramm des Betriebssystems auf.
Ihre Fähigkeit, Tests zu senden, hängt von diesem Dienstprogramm und den OS-Richtlinien ab; das Vorhandensein
älterer Hilfsprogramme mit effektiver UID bedeutet nicht, dass jeder ICMP-Test PHP zu root erhebt.
Führen Sie die Anwendung nicht als root aus, nur um ping zu aktivieren. Prüfen Sie den tatsächlichen Befehl,
das Benutzerkonto und die Fehlerausgabe; TCP- oder UDP-Prüfungen haben andere Erreichbarkeitssemantiken.

## Die Arbeitsliste ist vorausberechnet

Der Poller-Cache speichert aufgelöste Erfassungsaufgaben, sodass jeder Durchlauf nicht jeden
Befehl aus Vorlagenbeziehungen ableiten muss. Konfigurationsoperationen können betroffene
Einträge neu aufbauen; explizite Neuerstellungswerkzeuge stehen bei Bedarf zur Verfügung.

Änderungen in zwischengespeicherten Feldern müssen diese Einträge erreichen, bevor die Datenerfassung
sie verwendet. Andere Einstellungen werden separat gelesen, sodass nicht jede Konfigurationsänderung
einen manuellen Cache-Neuaufbau erfordert. Prüfen Sie Cache-Inhalte, Erfassungsfehler und den Zustand
entfernter Replikationen, anstatt nur eine einzige Ursache anzunehmen. Siehe
[Der Poller-Cache](/de/concepts/the-poller-cache/) und
[Entfernte Datenerfassung](/de/concepts/remote-data-collection/).

## Wo Dinge gewöhnlich scheitern

| Symptom | Nützliche Prüfungen |
|---|---|
| Oberfläche funktioniert, Diagramme sind flach | Scheduler-Ausführungen, Erfassungsfehler, Warteschlangen, Aktualität der Messwerte und Diagrammzeitfenster |
| Poller läuft, Dateien schreiten nicht fort | Writer-Bestätigungen/-Fehler, Speichervertrauen und -berechtigungen, Rückstand verzögerter Schreibvorgänge |
| Eine Datenquelle ist flach | Geräteantwort, Cache-Zeile, Dateizuordnung, unbekannte Messwerte und Zeichenausdrücke |
| Konfigurationsänderung scheint wirkungslos | Speicherergebnis, Vorlagenüberschreibungen, betroffene Cache-Einträge und Replikation |
| Regelmäßige Lücken | Timing, Heartbeat, Timeouts, Geräteverfügbarkeit und Schreibfehler |
| Unerwarteter Diagrammverlauf | Generierter Befehl, CDEF/CF-Auswahl, tatsächliche Dateidaten, Bild-Cache und Zuordnung |
| Port-Verlauf scheint an einer anderen Schnittstelle zu hängen | Abfrage-Identität, Neunummerierung und Reindexierungs-Ergebnisse |
| Konto sieht Konsole, aber keine Diagramme | Diagrammseiten-Realm, Objektautorisierung und Identität des angeforderten Diagramms |
| Kollektoren weichen voneinander ab | Zuweisung, replizierte Konfiguration, lokale Überschreibungen und Verbindungsstatus |
| Alles ist langsam | Datenbank-Wartezeiten, Writer-/Speicherkonflikte, Kollektor-Laufzeit und Web-Arbeitslast |
| Datenquellen-Metadaten existieren, Datei aber nicht | Erste Erfassung/Schreibvorgang, konfigurierter Pfad, Vertrauens- und Erstellungsfehler |

Dies sind Ausgangspunkte, keine fertigen Diagnosen. Folgen Sie den Belegen über die jeweilige
Schnittstelle hinweg und überprüfen Sie das Ergebnis nach einer Änderung. Siehe
[Fehlende Daten diagnostizieren](/de/guides/troubleshoot-missing-data/).
