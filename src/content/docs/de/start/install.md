---
title: "Installation"
description: "Was Kadupul für den Betrieb benötigt und in welcher Reihenfolge es zusammengestellt wird."
sidebar:
  order: 2
banner:
  content: "Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person."
---

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Gehen Sie dies einmal der Reihe nach durch. Jeder Schritt endet mit einer Prüfung.
Führen Sie die Prüfung durch, bevor Sie fortfahren: Jeder hier aufgeführte Fehler
ist jetzt kostengünstig zu finden und teuer zu beheben, nachdem der Poller eine Woche lang gelaufen ist.

## Was Sie zuerst benötigen

Kadupul ist eine PHP-Anwendung, die ihre Konfiguration in MySQL oder MariaDB speichert und
Messwerte in RRD-Dateien auf der Festplatte ablegt. Diese Seite beschreibt eine neue
Hauptserver-Installation aus dem aktuellen `main`-Quellcode, kein Upgrade und nicht die
archivierte LTS-Linie. Vier Dinge müssen vorhanden sein, bevor das System läuft.

| Komponente | Warum sie benötigt wird |
|---|---|
| PHP 8.4 oder neuer, in einer mit Sicherheitsupdates unterstützten Version | Führt die Weboberfläche und den Poller aus |
| MySQL oder MariaDB | Speichert Geräte, Vorlagen, Benutzer und den Poller-Cache |
| RRDtool | Erstellt und aktualisiert die Round-Robin-Archive und rendert Diagramme |
| net-snmp | Stellt die Client-Werkzeuge und -Bibliotheken zum Abfragen von Geräten bereit |

PHP benötigt außerdem die Erweiterungen, die von
[dem Anwendungsmanifest](https://github.com/kadupulhq/kadupul/blob/main/composer.json)
verlangt werden, darunter `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`,
`pcntl`, `posix` und `sqlite3`. Installieren Sie diese sowohl für die Befehlszeilen- als auch für die
Web-Laufzeitumgebung. [Voraussetzungen](/de/reference/requirements/) unterscheidet zwischen
den Anforderungen von Composer und den separaten Prüfungen des Installationsprogramms.

## Schritt 1: Laufzeitumgebung installieren

Installieren Sie PHP mit seinen Erweiterungen, Ihren Datenbankserver, RRDtool und net-snmp
über die Pakete Ihrer Distribution.

**Prüfen Sie es.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` muss die erforderlichen Erweiterungen auflisten. Die PHP-Erweiterung `snmp` ist optional,
wenn die Befehlszeilenwerkzeuge von net-snmp verfügbar sind. Composer prüft seine eigenen
erforderlichen Erweiterungen während der Installation der Abhängigkeiten; das webbasierte
Installationsprogramm verfügt über eine separate Erweiterungsprüfung. Ein Fallback zur Laufzeit
entbindet nicht von einer Composer-Anforderung.

Die PHP-Konfigurationen für die Befehlszeile und den Webserver können sich voneinander unterscheiden.
Prüfen Sie beide. Das Installationsprogramm empfiehlt ein `memory_limit` von mindestens 400M und
eine `max_execution_time` von mindestens 60 Sekunden; es akzeptiert auch deren unbegrenzte
Werte (jeweils `-1` und `0`). Werte unterhalb dieser Empfehlungen erzeugen Warnungen, während
ein fehlendes `date.timezone` ein Fehler ist. Legen Sie eine explizite Zeitzone fest,
wie etwa `UTC`, und verwenden Sie `php --ini`, um die Konfiguration der Befehlszeile zu ermitteln.

## Schritt 2: Datenbank und Benutzer anlegen

Erstellen Sie eine leere Datenbank und einen Benutzer mit Rechten für diese Datenbank. Führen Sie
für eine lokale Datenbank dieses SQL als Datenbankadministrator aus und ersetzen Sie das
Beispielpasswort vor der Verwendung:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Verwenden Sie den passenden Host für das Datenbankkonto, falls PHP sich von einem anderen Rechner aus verbindet.

Der Datenbankserver benötigt außerdem gefüllte Zeitzonentabellen, und der Kadupul-Benutzer
benötigt Lesezugriff darauf in der Datenbank `mysql`. Dies ist die einzige Berechtigung
außerhalb seines eigenen Schemas. Nichts an einem Überwachungssystem lässt dies vermuten, und
es ist nicht optional; die nachfolgende Prüfung schlägt andernfalls fehl.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Prüfen Sie es.** Melden Sie sich als Kadupul-Datenbankbenutzer an und führen Sie Folgendes aus:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Ein von Null verschiedener Zählerstand ohne Berechtigungsfehler ist das gewünschte Ergebnis. Null bedeutet,
dass die Tabellen nie geladen wurden; ein Fehler bedeutet, dass der Benutzer sie nicht lesen kann. Beides
stoppt das Installationsprogramm.

Vier der Servereinstellungen selbst sind wichtig genug, um sie jetzt zu korrigieren.

| Einstellung | Gewünscht | Warum |
|---|---|---|
| `max_allowed_packet` | 16M oder mehr | Umfangreiche Synchronisationen zwischen Hauptserver und Remote-Kollektoren |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Gerätebeschreibungen enthalten Multibyte-Zeichen |
| `innodb_file_per_table` | On | Hält Tabellenbereiche getrennt und verwaltbar |
| `innodb_buffer_pool_size` | Etwa ein Viertel des Systemspeichers | Hält den Arbeitssatz im Speicher |

Das Installationsprogramm liest diese Werte selbst aus und markiert, was unzureichend ist,
sodass Sie sich nicht blind auf die Tabelle verlassen müssen. [Datenbankleistung
optimieren](/de/guides/tune-database-performance/) geht noch weiter, sobald Last anliegt.

## Schritt 3: Entpacken, Dateieigentümerschaft anpassen und bereitstellen

Legen Sie die Anwendung an einem Ort ab, den Ihr Webserver ausliefern kann, und entscheiden Sie dann,
welcher Systembenutzer deren Eigentümer ist. Diese Entscheidung ist wichtiger als der Speicherort. Zwei
Prozesse schreiben hier: der Webserver und derjenige Prozess, der den Poller einplant. Führen Sie
beide unter demselben Benutzer aus. Führen Sie den Poller ohne Privilegien aus und geben Sie beiden
Prozessen die Zugriffsrechte, die sie benötigen. Eine fehlerhafte Eigentümerschaft oder fehlerhafte
Dateimodi können spätere Aktualisierungen verhindern, selbst wenn Diagramme dargestellt werden.

### Wenn Sie das Repository geklont statt ein Release entpackt haben

Ein Git-Checkout benötigt sowohl PHP-Abhängigkeiten als auch generierte Browser-Assets. Führen Sie
vom Stammverzeichnis des Repositorys aus folgenden Befehl aus, sobald die Laufzeiten aus der
`mise.toml` des Repositorys installiert sind:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer befüllt `include/vendor/` und stellt festgelegte Kompatibilitätsdateien wieder her.
Der npm-Build erzeugt Assets unter `include/js/`, `include/fa/` und
`include/vendor/flag-icons/`. Composer allein reicht für eine Installation aus dem Quellcode nicht aus.

Ein von Abhängigkeiten vollständiges Offline-Paket ist ein separates Build-Artefakt. Ein allgemeines
GitHub-Quellcode-Archiv ist nicht dieses Paket. Befolgen Sie das
[Verfahren zum Offline-Erstellen und Verifizieren](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation),
wenn der Zielhost keinen Internetzugang hat.

Bereiten Sie die beschreibbaren Pfade nach der Installation der Abhängigkeiten vor:

| Gruppe | Verzeichnisse | Beschreibbar wenn |
|---|---|---|
| Während der Installation | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Nur während der Installation oder Aktualisierung |
| Während der Installation | `include/vendor/csrf/` oder der konfigurierte Speicherort für `path_csrf_secret` | Das Installationsprogramm muss das installationsspezifische Geheimnis erstellen; bewahren Sie es danach auf |
| Immer | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, das temporäre Systemverzeichnis | Für die gesamte Lebensdauer der Installation |
| Symfony-Laufzeit | `var/cache` und `var/log`, falls dateibasiertes Logging konfiguriert ist | Für die PHP-Laufzeit und den Cache-Warming-Benutzer |

Das RRD-Verzeichnis muss für die gesamte Lebensdauer der Installation ebenfalls beschreibbar sein.
Es enthält Ihre Historie, behandeln Sie es daher mit der gleichen Sorgfalt wie ein Datenbankverzeichnis.

Die derzeitige Migration benötigt weiterhin bestehende Routen für Anmeldung, Installationsprogramm
und Plugins. Stellen Sie für diese kombinierte Installation das Stammverzeichnis des Repositorys
mit expliziten Regeln bereit, die den Zugriff auf private Verzeichnisse, Konfiguration, Abhängigkeiten
und den Laufzeitstatus verweigern. Stellen Sie nicht die gesamte Installation auf `public/` um:
Dadurch würden noch verwendete Legacy-Routen entfernt. Der separate Endpunkt von Symfony verfügt
über ein anderes Routing; siehe [die Migrationsanweisungen](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Gehen Sie bei Nginx von den
[Nginx-Standortregeln](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf)
des Repositorys aus und passen Sie das Root-Verzeichnis sowie den PHP-FPM-Upstream an. Halten Sie
Deny-Regeln vor der allgemeinen PHP-Verarbeitung und behalten Sie PATH_INFO für `/app.php/...` bei.
Nginx liest `.htaccess` nicht. Sorgen Sie dafür, dass RRD-Dateien, Protokolle und Geheimnisse über HTTP
nicht zugänglich sind; überprüfen Sie die tatsächliche Serverkonfiguration, anstatt davon auszugehen,
dass Dateiberechtigungen die Auslieferung verhindern.

**Prüfen Sie es.** Wechseln Sie zum Poller-Benutzer, schreiben Sie eine Datei in jedes Verzeichnis
der Immer-Gruppe und löschen Sie sie anschließend. Eine Berechtigung, die in `ls -l` korrekt
aussieht, kann durch SELinux oder AppArmor dennoch verweigert werden, und das Schreiben der Datei
ist die einzige Prüfung, die dies abdeckt. Fordern Sie dann eine Datei unterhalb des Protokollverzeichnisses
über HTTP an. Sie erwarten eine Zugriffsverweigerung.

## Schritt 4: Konfigurationsdatei schreiben

Kopieren Sie für eine neue Installation die mitgelieferte Konfigurationsdatei:

```bash
cp include/config.php.dist include/config.php
```

Überschreiben Sie nicht die Konfiguration einer bestehenden Installation. Legen Sie Host, Name,
Benutzer und Passwort der Datenbank aus Schritt 2 fest. Zwei weitere Werte sind bei einer Erstinstallation
wichtig: `url_path`, der Pfad, unter dem die Anwendung bereitgestellt wird, mit führenden und nachgestellten
Schrägstrichen, sowie `poller_id`, was auf einem Hauptserver `1` ist und nur auf einem Remote-Kollektor
einen anderen Wert annimmt.

Lassen Sie den Block für Remote-Kollektoren auskommentiert. Sie richten jetzt noch keinen ein;
[Remote-Datenerfassung](/de/concepts/remote-data-collection/) behandelt dies, wenn es soweit ist.
Jede andere Einstellung verfügt über einen funktionierenden Standardwert; lesen Sie daher
[Konfiguration](/de/reference/configuration/), bevor Sie eine davon ändern.

Konfigurieren Sie ein bereitstellungsspezifisches `APP_SECRET` in der PHP-Prozessumgebung für
Symfony-Funktionen, die dieses verwenden. Der Bootstrap verwendet standardmäßig `APP_ENV=prod`
und `APP_DEBUG=0` und lädt keine `.env`-Dateien. Dies ist getrennt vom CSRF-Geheimnis des
bisherigen Installationsprogramms.

**Prüfen Sie es.** Überprüfen Sie die Syntax, ohne Zugangsdaten anzuzeigen:

```bash
php -l include/config.php
```

Importieren Sie das Schema im nächsten Schritt, bevor Sie das Installationsprogramm im Browser öffnen.

## Schritt 5: Schema importieren

Das Installationsprogramm setzt voraus, dass die Tabellen bereits existieren. Laden Sie das
mitgelieferte Schema in die von Ihnen erstellte Datenbank:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Führen Sie dies einmalig für eine leere Datenbank durch. Dies ist kein Aktualisierungsskript;
der Import in eine bereits befüllte Datenbank kann fehlschlagen oder widersprüchliche und unvollständige
Daten hinterlassen.

## Schritt 6: Installationsprogramm ausführen

Öffnen Sie die Website in einem Browser und arbeiten Sie die Schritte durch. Das Installationsprogramm
durchläuft eine feste Abfolge, und jeder Schritt schaltet den nächsten frei:

1. Willkommen und Lizenz.
2. Abhängigkeitsprüfung: PHP-Version und Erweiterungen, die PHP-Einstellungen aus Schritt 1 sowohl
   für die Befehlszeile als auch für den Webserver, die Zeitzonentabellen und die Datenbankeinstellungen
   aus Schritt 2. Fehler blockieren die Schaltfläche zum Fortfahren. Warnungen tun dies nicht, lesen
   Sie diese jedoch aufmerksam.
3. Installationstyp: ein neuer Hauptserver oder ein Remote-Kollektor.
4. Berechtigungsprüfung: die Verzeichnisse aus Schritt 3, getestet durch Schreibvorgänge.
5. Binärpfade: die Pfade zu PHP, RRDtool und den net-snmp-Werkzeugen.
6. Datenquellenprofil und Launcher-Intervall.
7. Vorlagenauswahl: welche Gerätevorlagen geladen werden sollen.
8. Tabellenkonvertierung, Bestätigung und die eigentliche Installation.

Punkt 6 in dieser Liste lässt sich nur schwer rückgängig machen. Das von Ihnen gewählte Profil
bestimmt den Schritt und den Archivsatz, der in jede danach erstellte RRD-Datei geschrieben wird,
und das Bearbeiten des Profils migriert bestehende Dateien nicht. Änderungen an der Aufbewahrung
erfordern eine separate, getestete Migration; sie erfordern nicht immer das Verwerfen des Verlaufs.
Falls Spitzenwerte wichtig sind, stellen Sie sicher, dass das Profil Maxima und nicht nur Mittelwerte
beibehält: Lesen Sie [Datenquellen und Round-Robin-Archive](/de/concepts/data-sources-and-rras/),
bevor Sie darüber hinwegklicken. Das dort angebotene Launcher-Intervall beträgt eine Minute oder
fünf Minuten. Das Datenquellenprofil legt das Erfassungsintervall fest; Launcher und Profil müssen
konsistent konfiguriert sein.

## Schritt 7: Standard-Zugangsdaten ändern

Das mitgelieferte Schema richtet ein Administratorkonto namens `admin` mit dem Passwort `admin` ein,
das so gekennzeichnet ist, dass die erste Anmeldung eine Änderung erzwingt. Es richtet auch ein
deaktiviertes Gastkonto ein. Ändern Sie das Passwort, bevor die Instanz für andere erreichbar ist –
also bevor Sie sie an ein Netzwerk anbinden, über das andere darauf zugreifen können.

## Schritt 8: Poller einplanen

Der Poller muss von außen gestartet werden. Konfigurieren Sie sein Erfassungsintervall und
sein Launcher-Intervall konsistent; der Poller unterstützt Launcher-Intervalle von einer Minute
oder fünf Minuten und verfügt über eine Schutzfunktion gegen vorzeitige Durchläufe. Richten Sie
für einen Ein-Minuten-Launcher diesen Eintrag in der Crontab des unprivilegierten Poller-Benutzers
ein und ersetzen Sie `php` und den Anwendungspfad durch deren absolute Pfade:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

oder führen Sie den mitgelieferten `cactid.php`-Daemon unter Verwendung von `service/cactid.service`
aus, angepasst an Ihren Installationspfad und den unprivilegierten Benutzer. Verwenden Sie nur
einen Starter: Deaktivieren Sie den Cronjob oder Timer, wenn Sie den Daemon verwenden.

Stimmen Sie den tatsächlichen Zeitplan auf das konfigurierte Launcher-Intervall ab. Bei
Erfassungsprofilen im Sub-Minuten-Bereich führt der gestartete Poller Erfassungszyklen innerhalb
dieses Intervalls aus; versuchen Sie nicht, einen Takt von unter einer Minute über diesen Cron-Eintrag
auszudrücken.

**Prüfen Sie es.** Führen Sie einen Zyklus manuell als Poller-Benutzer aus:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` überspringt die zeitliche Schutzprüfung gegen vorzeitige Ausführung. Führen Sie diese
manuelle Prüfung bei gestopptem Scheduler durch, damit sie sich nicht mit einem regulären Lauf
überschneidet. Sie umgeht keine anderen Wartungs- oder Sicherheitsprüfungen. Sie erwarten einen
sauberen Abschluss mit einer Zusammenfassungszeile. Aktivieren Sie dann den Scheduler und lassen
Sie ihn zwei Intervalle lang ungestört laufen; bestätigen Sie, dass ein weiterer Durchlauf ohne
Ihr Zutun stattgefunden hat.

## Was schiefgehen kann

Dies sind die Fehler, die bei einer Erstinstallation tatsächlich auftreten.

| Symptom | Ursache | Wo zu suchen ist |
|---|---|---|
| Installer blockiert bei PHP-Einstellungen, die korrekt aussehen | Der Webserver und die Befehlszeile lesen unterschiedliche `php.ini`-Dateien | `php --ini` und die Datei, die das Web-SAPI meldet |
| Installer blockiert bei Zeitzonen | Zeitzonentabellen nicht geladen oder der Kadupul-Benutzer kann sie nicht lesen | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Berechtigungsschritt schlägt bei einem Verzeichnis fehl, das beschreibbar aussieht | Falscher Eigentümer oder SELinux und AppArmor | Eine Datei als Poller-Benutzer schreiben |
| Installation abgeschlossen, es treffen nie Daten ein | Poller wurde nie eingeplant | `poller.php --force --debug` manuell ausführen |
| Daten für einige Zyklen, dann nichts mehr | Poller läuft als falscher Benutzer und hinterlässt Dateien, die der Webbenutzer nicht aktualisieren kann | Eigentümer der Dateien im RRD-Verzeichnis |
| Diagramme voller kleiner Lücken | Eingeplantes Intervall und konfiguriertes Intervall stimmen nicht überein | Die Crontab im Vergleich zum konfigurierten Intervall |
| Composer verweigert die Installation | PHP liegt unter 8.4 oder eine im Manifest geforderte Erweiterung fehlt | `php -v`, `php -m` und die Fehlerausgabe von Composer |
| Poller kann nicht mehr als einen Prozess ausführen | `pcntl` oder `posix` fehlt | `php -m` |

[Protokollierung](/de/reference/logging/) beschreibt, wo jeder Vorgang aufgezeichnet wird.
[Fehlerbehebung bei fehlenden Daten](/de/guides/troubleshoot-missing-data/) behandelt den Fall,
dass die Installation in Ordnung ist, ein bestimmtes Gerät jedoch nicht.

## Bevor Sie das System freigeben

Der Poller läuft als Systembenutzer und führt RRDtool sowie Ihre Erfassungsskripte aus. Behandeln
Sie die Installation als etwas, das Befehle ausführt – denn genau das tut sie.

- Stellen Sie sie über TLS bereit.
- Belassen Sie das Standard-Administratorpasswort nicht, auch nicht kurzzeitig.
- Beschränken Sie den Datenbankbenutzer auf seine eigene Datenbank.
- Halten Sie die RRD- und Protokollverzeichnisse außerhalb des Document-Root.
- Belassen Sie das Gastkonto deaktiviert, es sei denn, Sie entscheiden sich ausdrücklich anders.

[Eine über das Internet erreichbare Installation absichern](/de/guides/secure-an-internet-facing-install/)
enthält die übrigen Hinweise. Weiter: [Das erste Gerät hinzufügen](/de/start/first-device/).
