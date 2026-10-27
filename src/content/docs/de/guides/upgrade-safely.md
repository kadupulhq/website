---
title: "Sicher aktualisieren"
description: "Ein Upgrade einstudieren, abgestimmte Sicherungen aufbewahren, Speicher- und Schemazustand prüfen und ein koordiniertes Rollback planen."
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
sidebar:
  order: 8
---

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Ein Upgrade ändert drei Komponenten zu unterschiedlichen Zeitpunkten und mit unterschiedlicher Reversibilität.

| Änderungen | Reversibel | Wie |
|---|---|---|
| Code, Abhängigkeiten und Konfiguration | Über eine aufbewahrte Kopie | Die passende Revision und Einstellungen wiederherstellen |
| Datenbankschema und Warteschlangenmesswerte | Über eine abgestimmte Sicherung | Die Datenbank wiederherstellen; es gibt keine automatische Rückwärtsmigration |
| RRD-Dateien | Über eine abgestimmte Sicherung | Aufbewahrten Verlauf wiederherstellen; in der Sicherung fehlende Messwerte können durch ein Rollback nicht neu erstellt werden |

Das Verfahren dient dazu, diese drei Bereiche synchron zu halten.

## Bevor Sie beginnen

**Erstellen Sie die vollständige Sicherung.** Alle drei Teile, konsistent zueinander. Folgen Sie
[Sichern und Wiederherstellen](/de/guides/back-up-and-restore/). Stoppen Sie alle Schreibprozesse vor
der endgültigen Erfassung und bewahren Sie die geschützte Sicherung bis zur Abnahme des Upgrades auf.

**Protokollieren Sie die aktuelle Revision und Schema-Version.** Berücksichtigen Sie Abhängigkeiten,
lokale Änderungen, Plugins und Konfiguration. Mehrere Quellcode-Revisionen können dieselbe Schema-Version
melden. Erproben Sie die Zielrevision an einer isolierten, wiederhergestellten Kopie.

**Überprüfen Sie jedes Plugin.** Prüfen Sie Kompatibilitätserklärung, Code und Abhängigkeiten, und testen
Sie dann die benötigten Funktionen gegen die Zielrevision. Eine deklarierte Mindestversion allein belegt
noch keine Kompatibilität. Siehe [Plugin-Validierung](/de/guides/install-and-vet-plugins/).

**Überprüfen Sie die Laufzeitumgebung.** PHP-Version, PHP-Erweiterungen und die Version des
Datenbankservers. Prüfen Sie die [Voraussetzungen](/de/reference/requirements/) der Zielversion vor der
Bereitstellung. Gehen Sie nicht davon aus, dass die Schema-CLI jede Prüfung des Web-Installers durchführt.

**Prüfen Sie, ob das Datenbankkonto das Schema ändern kann.** Im laufenden Betrieb muss das Konto
innerhalb seiner eigenen Datenbank lesen und schreiben können. Bei einem Upgrade muss es außerdem
Tabellen und Indizes erstellen, ändern und löschen können. Installationen, bei denen die Berechtigungen
nach der Ersteinrichtung eingeschränkt wurden, bemerken dies an dieser Stelle.

**Stoppen Sie alle Produzenten.** Stoppen Sie die geplante Datenerfassung, entfernte Kollektoren, über
das Web ausgelöste Sammlungen und manuelle Wartungsarbeiten; warten Sie ab, bis laufende Aufgaben beendet
sind. Leeren Sie verzögerte Schreibvorgänge erst, nachdem die Produzenten gestoppt wurden, und sichern
Sie alle unbestätigten Warteschlangenzeilen mit dem passenden Backup. Halten Sie die Produzenten während
der gesamten Bereitstellung und Schema-Validierung angehalten.

## Die Anwendung ersetzen

Ein Überlagerungskopieren hat spezifische Grenzen:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Ohne diesen Punkt erstellt `cp -a /path/to/new-release /path/to/kadupul` das Verzeichnis
`kadupul/new-release/` und belässt jede Datei der alten Anwendung genau dort, wo sie war. Das Upgrade
scheint funktioniert zu haben, die Oberfläche führt weiterhin den alten Code aus, und das erste Anzeichen
von Problemen ist die Schema-Migration, die sich weigert, zu einer Version zu passen, von der Sie dachten,
Sie hätten sie ersetzt.

Ein Kopieren über das bestehende Verzeichnis behält Dateien bei, die im neuen Baum nicht vorhanden sind,
einschließlich veralteter Anwendungsdateien. Es kann übereinstimmende Pfade überschreiben; prüfen Sie daher
das Artefakt, anstatt anzunehmen, dass Konfiguration oder Daten ausgeschlossen sind. Bevorzugen Sie einen
überprüften Bereitstellungsbaum mit passenden Abhängigkeiten, Konfigurationen und Plugins. Wenn Sie
Releases über einen Symlink umschalten, überprüfen Sie den wirksamen RRA-Pfad und den Speicherzugriff
vor dem Wechsel; das aktuelle Bootstrap leitet ihn aus dem Anwendungsverzeichnis plus `/rra` ab.
Ein Symlink-Wechsel allein ist kein Datenbank-Rollback.

**Prüfen Sie, was tatsächlich ausgeführt wird, bevor Sie fortfahren.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Wenn dies nicht das Release meldet, das Sie gerade bereitgestellt haben, halten Sie an. Alles nach diesem
Punkt setzt voraus, dass der vorgesehene Code bereitgestellt ist. Vergleichen Sie außerdem die
Quellcode-Revision oder die Artefakt-Prüfsumme mit dem Release-Datensatz; die Versionszeichenfolge allein
reicht nicht aus.

## Die Schema-Migration

Die Datenbank führt eine eigene Version, getrennt von der Version im Code. Das Ersetzen des Codes
ändert daran nichts.

Ältere authentifizierte Seiten leiten zum Installationsprogramm weiter, wenn Code- und Datenbankversion
nicht übereinstimmen. Dies ist kein universeller Schutz für jeden Endpunkt oder jede CLI, und
übereinstimmende Versionszeichenfolgen belegen nicht, dass jede Migration abgeschlossen wurde. Prüfen
Sie den Schemazustand direkt.

Das Installationsprogramm und die CLI führen geordnete Migrationsschritte aus. Überprüfen Sie vor dem
regulären Schema-Upgrade die dauerhafte Warteschlange und den Speicherzugriff des Dienstkontos. Wenn eine
übernommene `poller_output`-Warteschlange nicht InnoDB verwendet, konvertieren Sie sie explizit bei
gestoppten Schreibprozessen und aufbewahrter Sicherung:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Führen Sie danach Folgendes unter jedem tatsächlichen Web- und Poller-Konto aus:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Die beiden Flags sind separate Vorgänge und können nicht kombiniert werden. Die Warteschlangenkonvertierung
bewahrt ausstehende Messwerte; kürzen Sie keine Zeilen, um eine Prüfung zu bestehen. Lösen Sie Eigentümer-
und numerische Konfigurationen für vertrauenswürdige UID/GID anhand der
[Speicheranforderungen](/de/reference/requirements/) auf. Online-Remote-Kollektoren wählen normalerweise die
Hauptwarteschlange; verwenden Sie `--local` nur für eine gezielte lokale Warteschlangenprüfung oder
-konvertierung. Sobald diese Prüfungen bestanden sind, führen Sie das Schema-Upgrade aus dem
Anwendungs-Wurzelverzeichnis aus:

```sh
php cli/upgrade_database.php
```

Führen Sie es als das konfigurierte Dienstkonto mit dem erforderlichen Dateisystemzugriff und den nötigen
Datenbankberechtigungen aus. Eine erfolgreiche Prüfung als root belegt nicht den Zugriff des Dienstkontos.
Es gibt die Option `--forcever`, um die Startversion explizit festzulegen, die für das wiederholte
Ausführen einer Migration während Tests vor Veröffentlichungen gedacht ist. Sie ist nicht Teil eines
normalen Upgrades, und ihre Verwendung zum Überspringen eines fehlgeschlagenen Schritts hinterlässt ein
halb migriertes Schema.

Erfassen Sie den Beendigungsstatus und die Ausgabe, und verifizieren Sie anschließend die Datenbankversion
sowie die erforderlichen Schemaänderungen. Die aktuelle CLI kann eine unbekannte oder nicht unterstützte
Legacy-Startversion ablehnen und dennoch mit Status 0 enden; ein erfolgreicher Shell-Status allein reicht
nicht aus. Wenn die Migration vorzeitig fehlschlägt, lassen Sie die Produzenten gestoppt und stellen Sie
den abgestimmten Sicherungssatz wieder her, anstatt zu versuchen, den fehlgeschlagenen Schritt zu
überspringen.

## Was Plugins beschädigt

Die Plugin-Prüfungen des Web-Installers können inkompatible oder fehlende Plugins deaktivieren.
Gehen Sie nicht davon aus, dass die Schema-CLI dieselben Lifecycle-Prüfungen für Plugins durchführt.

**Die deklarierte Mindestversion liegt über der neuen Core-Version.** Deaktiviert. Dies ist der Normalfall
und sollte bereits durch Ihre Vorabprüfung vor dem Upgrade erkannt worden sein.

**Das Plugin-Verzeichnis, seine Setup-Datei oder seine Deklarationsdatei fehlt.** Deaktiviert. Ein Plugin,
dessen Dateien entfernt wurden, während es in der Datenbank noch als aktiviert markiert war, fällt in
diese Kategorie.

**Das Plugin besitzt überhaupt keine Deklarationsdatei.** Es kann bei der Kompatibilitätsprüfung des
Installers durchfallen. Testen Sie ein gepflegtes, kompatibles Plugin-Paket, anstatt anzunehmen, dass es
unverändert wieder aktiviert werden kann.

Es gibt einen vierten Fall, der keine Fehlfunktion darstellt. Funktionalität, die früher ein Plugin war
und inzwischen in den Kern integriert wurde, wird vollständig entfernt, nicht nur deaktiviert: Ihre Hooks
und Berechtigungseinträge werden gelöscht und ihre Zeile entfernt. Wenn ein Plugin verschwindet, anstatt
grau dargestellt zu werden, prüfen Sie die Migrationsprotokolle und den Status des jeweiligen Plugins,
bevor Sie schlussfolgern, dass gleichwertige Funktionen bereitstehen.

Das Deaktivieren eines Plugins unterscheidet sich von seiner Deinstallation. Plugin-Hooks und -Migrationen
können eigene Tabellen und Berechtigungen verändern; bewahren Sie passenden Plugin-Code sowie Daten auf
und überprüfen Sie den konkreten Upgrade-Pfad. Versprechen Sie keine universelle Datenaufbewahrung.

## Rollback-Planung

Entscheiden Sie über das Rollback, bevor Sie beginnen, da die Entscheidung davon abhängt, wie weit Sie
gekommen sind.

| Fehlerpunkt | Rollback durch |
|---|---|
| Code ersetzt, kein zustandsändernder Vorgang oder Schreibprozess lief | Vorherigen Code, Abhängigkeiten und Konfiguration wiederherstellen, nachdem bestätigt wurde, dass der Zustand unverändert ist |
| Warteschlangenkonvertierung oder Migration gestartet, einschließlich Teilfehlern | Schreibprozesse stoppen und passende Code-, Konfigurations-, Datenbank- und RRD-Sicherungen wiederherstellen |
| Migration abgeschlossen, Anwendung verhält sich fehlerhaft | Schreibprozesse stoppen und den abgestimmten Sicherungssatz wiederherstellen; nach der Sicherung erfasste Messwerte berücksichtigen |
| Nur ein Plugin ist defekt | Deaktiviert lassen, während Reparatur versus koordiniertes Rollback anhand der Abnahmekriterien bewertet wird |

Die Grundregel unterhalb der Tabelle: Code und Schema werden gemeinsam zurückgesetzt oder gar nicht.
Alter Code auf einem neuen Schema ist kein unterstützter Zustand. Verlassen Sie sich nicht auf die
Web-Versionsprüfung, um jede inkompatible Operation abzufangen.

Setzen Sie sich ein Zeitfenster. Entscheiden Sie im Voraus, wie viel Zeit Sie für die Fehlersuche
aufwenden wollen, bevor Sie die Wiederherstellung einleiten, und halten Sie sich daran. Die Sicherung
verliert an Nutzen, je länger das System in einem halb aktualisierten Zustand läuft.

## Warum RRD-Dateien der Teil sind, den Sie keinesfalls verlieren dürfen

Gehen Sie nicht davon aus, dass Bereitstellung, Wartung oder die wiederaufgenommene Datenerfassung
RRDs unverändert lassen. Sichern Sie sie zusammen mit der Datenbank und stellen Sie den abgestimmten Satz
wieder her, wenn Sie Zustandsänderungen rückgängig machen. Aufbewahrte Warteschlangenmesswerte existieren
in diesen Dateien möglicherweise noch nicht. Eine verifizierte RRD-Sicherung kann ihren erfassten Verlauf
wiederherstellen; eine fehlende Stichprobe kann nicht einfach durch Wiederherstellung von Schema oder Code
rekonstruiert werden. Siehe
[Datenquellen und Round-Robin-Archive](/de/concepts/data-sources-and-rras/) dafür, warum auch die
Auflösung darin nicht rekonstruiert werden kann.

Drei typische Wege, wie RRD-Dateien während eines Upgrades verloren gehen:

**Bereitstellung durch Ersetzen des Installationsverzeichnisses.** Das RRA-Verzeichnis ist
standardmäßig ein Unterverzeichnis der Installation. Das Entfernen des alten Verzeichnisses und das
Entpacken des neuen Verzeichnisses an dessen Stelle kann aufbewahrte Messwerte löschen. Sichern Sie den
RRA-Baum durch eine getestete Speicheranordnung, bevor Sie die Anwendung ersetzen. Validieren Sie das
wirksame `$config['rra_path']`, verschachtelte Pfade und Vertrauensprüfungen des Dienstkontos; diese
Revision bietet keine allgemeine Datenbankeinstellung für ein beliebiges lokales RRA-Wurzelverzeichnis.

**Bereitstellung aus einem Checkout oder Paket, das den gesamten Verzeichnisbaum beansprucht.** Dasselbe
Problem, nur automatisiert. Vergewissern Sie sich, was Ihre Bereitstellungsmethode als löschbar ansieht.

**Korrigieren von Berechtigungen durch rekursives Ändern des Eigentümers.** Unschädlich für die Daten,
kann jedoch dazu führen, dass der Poller nicht mehr schreiben kann – was sich als System äußert, das den
Verlauf perfekt darstellt, aber keine neuen Werte erfasst.

## Nach dem Upgrade

1. Überprüfen Sie die Upgrade-Ausgabe, die Datenbankversion und die erforderlichen Schemaänderungen,
   und bestätigen Sie anschließend, dass die Oberfläche lädt. Eine ausbleibende Weiterleitung allein ist
   unzureichend.
2. Schließen Sie geplante Code- und Konfigurations-Upgrades entfernter Kollektoren ab und überprüfen Sie
   deren Datenbankziele, während deren Produzenten gestoppt bleiben.
3. Wiederholen Sie die Speicherprüfungen für das Dienstkonto, nehmen Sie die vorgesehenen Kollektoren
   wieder in Betrieb und überprüfen Sie repräsentative RRD-Aktualisierungszeiten sowie nutzbare
   aufbewahrte Werte.
4. Prüfen Sie das Protokoll auf die Zeile mit den Laufzeitstatistiken und vergleichen Sie die benötigte
   Zeit mit den früheren Werten. Eine neue Version kann den Erfassungsaufwand verändern.
5. Aktivieren Sie die deaktivierten Plugins einzeln wieder, nachdem Sie Versionen installiert haben,
   die Kompatibilität mit dem neuen Kern deklarieren.
6. Überprüfen Sie die Warteschlangentiefe, die entfernte Datenerfassung und Plugin-Aufgaben über das
   vereinbarte Abnahmefenster hinweg. Bewahren Sie die Rollback-Sicherung auf, bis diese Prüfungen
   bestanden sind.
