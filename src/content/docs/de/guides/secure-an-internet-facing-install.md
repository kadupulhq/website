---
title: Eine internetbasierte Installation absichern
description: Was zu ändern ist, bevor ein Überwachungssystem mit Shell-Zugriff auf Ihr Netzwerk Anfragen aus dem öffentlichen Internet beantwortet.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 9
---

:::caution[Vor der Verwendung prüfen]
Der Quellcode ist verfügbar, aber es gibt kein unterstütztes Kadupul-Release oder
einen Migrationspfad. Testen Sie diese Verfahren auf einer isolierten Kopie mit
Backups, bevor Sie sich darauf verlassen. Siehe [Projektstatus](/de/project/status/).
:::

Beginnen Sie mit der ehrlichen Antwort: Platzieren Sie es hinter einem VPN. Kadupul hält die
SNMP-Zugangsdaten für jedes überwachte Gerät im Klartext vor und führt im Rahmen des normalen
Betriebs Befehle auf seinem eigenen Host aus. Es gibt keine Konfiguration, die es ratsam
macht, das System im öffentlichen Internet zu betreiben.

Die folgenden Prüfungen helfen bei der Beurteilung einer isolierten Installation. Sie begründen
keine unterstützte oder sichere öffentliche Bereitstellung; beachten Sie die obige
Projektstatus-Einschränkung bei der Interpretation der Ergebnisse.

## TLS

Terminieren Sie TLS am Webserver oder an einem davor geschalteten Proxy. Kadupul lauscht
nicht auf einem eigenen Socket.

Aktivieren Sie dann die Einstellung, die reine HTTP-Anfragen auf HTTPS umleitet. Sie ist standardmäßig
deaktiviert (`off`). Ohne sie wird ein Anmeldeformular über HTTP bereitgestellt, und ein Passwort wandert
im Klartext über das Netz, bevor überhaupt etwas anderes eine Rolle spielen kann.

Die Anwendung setzt das Secure-Flag des Sitzungs-Cookies, wenn PHP einen nicht-leeren Wert für
`$_SERVER['HTTPS']` empfängt, der nicht `off` ist. Konfigurieren Sie hinter einem TLS-terminierenden
Proxy den vertrauenswürdigen Webserver oder die FastCGI-Schicht so, dass HTTPS korrekt dargestellt wird,
und überprüfen Sie den resultierenden `Set-Cookie`-Header in einem Browser.

`$proxy_headers` steuert die Auflösung von Client-Adressen. Es setzt weder die HTTPS-Servervariable
noch aktiviert es Secure-Cookies. Vertrauen Sie nur den Adress-Headern, die Ihr Proxy setzt, entfernen
Sie vom Client übermittelte Kopien und verhindern Sie den direkten Zugriff auf das Backend. Erzwingen
Sie HTTP-zu-HTTPS-Umleitungen am öffentlichen Proxy, bevor Zugangsdaten gesendet werden.

Die Anwendung setzt HttpOnly und SameSite=Strict für ihr Sitzungs-Cookie. Überprüfen Sie das tatsächliche
Cookie- und Umleitungsverhalten an der Bereitstellungsgrenze; diese Flags begründen nicht, dass alle
anderen Cookies dieselbe Konfiguration teilen. Siehe die
[PHP-Sitzungskonfigurationsreferenz](https://www.php.net/manual/en/session.configuration.php).

## Standard-Zugangsdaten

Das mitgelieferte Schema enthält ein administratives Konto namens `admin`, dessen
Passwort-Hash der MD5-Wert der Zeichenfolge `admin` ist. Es ist so markiert, dass beim ersten
Anmelden eine Änderung erforderlich ist. Bestätigen Sie, dass die Änderung stattgefunden hat,
anstatt dies nur anzunehmen. Die Aufforderung, die dies erzwingt, wird unter Web-Basic-Authentifizierung
übersprungen, bei der der Webserver bereits entschieden hat, wer der Benutzer ist.

Prüfen Sie anschließend die Zugangsdaten, die keine Benutzerkonten sind:

- Das Datenbankkonto ist in der mitgelieferten Konfigurationsvorlage standardmäßig `cactiuser` mit dem Passwort `cactiuser`.
- Das Automatisierungs-Subsystem liefert standardmäßige SNMP-Optionen aus, die die Community-Strings `public` und `private` sowie ein SNMPv3-Benutzer- und Passwortpaar enthalten. Dies sind Scan-Standardwerte, keine Gerätekonfiguration, aber es sind die Zeichenfolgen, die Ihre Erkennung zuerst ausprobieren wird.

Die Passwortrichtlinie ist konfigurierbar. Die Standardwerte erfordern acht Zeichen und gemischte
Groß-/Kleinschreibung. Ablauf und Kontosperre nach wiederholten Fehlschlägen sind beide verfügbar
und beide standardmäßig deaktiviert. Aktivieren Sie die Kontosperre bei einer internetbasierten Installation.

## Datenbankberechtigungen

Das Installationsbeispiel verwendet datenbankbezogene Berechtigungen plus Zugriff auf die
Zeitzonentabelle. Ersetzen Sie diese beispielhaften Konto-/Datenbanknamen und überprüfen Sie
die Zuweisungen für die tatsächlichen Bereitstellungs- und Wartungsaufgaben:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Diese zweite Zuweisung ist nicht optional. Die Zeitzonenverarbeitung liest diese Tabelle, und der
Installer prüft auf Zugriff und vorhandene Zeitzonendaten. Überprüfen Sie zusätzliche Zuweisungen
anhand tatsächlicher Wartungs- und Kollektoranforderungen, bevor Sie sie entfernen; dieses Beispiel
ist kein Beweis dafür, dass jede Bereitstellung exakt dieselben Berechtigungen benötigt.

Wichtige Hinweise zum Geltungsbereich:

- Binden Sie die Datenbank an localhost oder an eine private Schnittstelle und nicht an die Adresse, unter der der Webserver antwortet.
- Geben Sie jedem Remote-Datenkollektor ein eigenes Datenbankkonto. Deren Zugangsdaten befinden sich in der zentralen Datenbank und in ihrer eigenen Konfigurationsdatei; separate Konten verbessern daher Zuordnung und Widerruf. Sie isolieren einen kompromittierten Kollektor jedoch für sich genommen nicht, wenn dessen Zuweisungen weiterhin zentrale Schreibvorgänge gestatten.
- Die Verbindung unterstützt TLS, konfiguriert mit einem Schlüssel, Zertifikat und CA-Pfad in der Konfigurationsdatei. Verwenden Sie dies immer dann, wenn sich die Datenbank nicht auf demselben Host befindet.
- Machen Sie die Konfigurationsdatei für den Webserver-Benutzer lesbar und im Normalbetrieb weder für den Web- noch für den Poller-Dienstbenutzer beschreibbar. Lassen Sie sie im Besitz eines administrativen Kontos. Die Einrichtung des Remote-Pollers prüft ausdrücklich, ob die Datei aktualisiert werden kann; gehen Sie nicht davon aus, dass jede primäre Serverinstallation dieselben temporären Schreibberechtigungen benötigt.
- Das CSRF-Geheimnis kann in einer Datei statt in der Datenbank gespeichert werden. Wenn Sie diese Option verwenden, muss die Datei außerhalb des Document-Roots liegen. Dies ist eine verbindliche Anforderung, kein Vorschlag.

## Datenverzeichnisse außerhalb des Document-Roots halten

In einer Bereitstellung auf Repository-Root-Ebene können private Daten- und Quellcodeverzeichnisse
unterhalb des ausgelieferten Roots liegen. Mehrere Verzeichnisse enthalten `.htaccess`-Verweigerungsregeln;
inventarisieren Sie den tatsächlichen Checkout und die Serverkonfiguration, anstatt davon auszugehen,
dass jeder Pfad abgedeckt ist. Die aktuelle partielle Framework-Migration bedeutet auch, dass das
Umstellen der gesamten Site auf `public/` ohne ihre Legacy-Routen kein vollständiges Bereitstellungsverfahren darstellt.

Diese Dateien funktionieren nur unter Apache und nur dann, wenn die Konfiguration ein Überschreiben
in diesem Verzeichnis erlaubt. Unter nginx sind sie wirkungslos. Auf einem fehlkonfigurierten Apache
sind sie wirkungslos. Ein wirkungsloses Deny-All vor dem Protokollverzeichnis bedeutet, dass jeder Ihr
Anwendungsprotokoll lesen kann, das Gerätenamen, Benutzernamen, Abfragetext und Fehlerdetails enthält.
Apache dokumentiert das erforderliche Überschreibungsverhalten in seinem
[`.htaccess`-Leitfaden](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Führen Sie beides durch:

**Speicherpfade vor dem Verschieben von Daten verifizieren.** Protokollziele sind konfigurierbar,
aber `include/global.php` setzt die RRA-Basis auf das Verzeichnis `rra` der Installation;
es gibt keine generische RRA-Verzeichnis-Einstellung in der Benutzeroberfläche. Ein separat eingehängtes
Speicherlayout kann diesen erwarteten Pfad beibehalten, aber die Platzierung im Dateisystem allein
verhindert keinen HTTP-Zugriff über ein bereitgestelltes Verzeichnis oder einen Symlink. Überprüfen Sie
bestehende Datenquellenpfade, Dienstberechtigungen, Backups und HTTP-Verweigerung gemeinsam. Verlagern
Sie Cache-Bäume nicht, ohne zu überprüfen, wie deren Konsumenten Dateien auflösen. Siehe
[Auf neue Hardware migrieren](/de/guides/migrate-to-new-hardware/) und
[Sicher aktualisieren](/de/guides/upgrade-safely/).

**Private Pfade am Webserver verweigern.** Passen Sie das
[Repository-Root-Nginx-Beispiel](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
aus den Quellen an das tatsächliche URL-Präfix und den Server an; Verweigerungsregeln müssen Vorrang
vor der allgemeinen PHP-Verarbeitung haben. Diese Liste dient als Inventarisierungshilfe, nicht als
vorgefertigte Serverkonfiguration:

| Verzeichnis | Grund |
|---|---|
| `rra/` | Messwertdateien |
| `log/` | Anwendungsprotokoll einschließlich Abfrage- und Fehlerdetails |
| `cache/` | Beabsichtigten Asset-Zugriff prüfen; Ausführung von PHP in Cache-Pfaden blockieren |
| `scripts/` | Erfassungscode darf nicht direkt über HTTP bereitgestellt oder aufgerufen werden |
| `cli/` | Befehlszeilenwerkzeuge, die nicht über HTTP erreichbar sein sollen |
| `mibs/`, `contrib/`, `docs/` | Interne Ressourcen und Dokumentation |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Anwendungs-Interna, Status und Werkzeuge |
| Dotfiles, Abhängigkeitsmanifeste, internes Include/Bootstrap-PHP | Repository-Metadaten und interne Einstiegspunkte |

Behalten Sie erforderliche öffentliche Assets wie `include/js` und `include/themes` bei; eine
pauschale Blockierung aller Includes kann die Benutzeroberfläche beschädigen. Überprüfen Sie die
Verweigerung anhand harmloser Testpfade und stellen Sie sicher, dass Antworten keinen Quellcode
oder Dateiinhalte offenlegen. Testen Sie nicht, indem Sie echte Geheimnisse in ein Terminal oder
Protokoll abrufen.

Es gibt auch eine optionale Datei mit Sicherheits-Response-Headern für statische Assets.
PHP-Antworten setzen ihre eigenen Header im Code; statische Dateien tun dies nicht, es sei denn,
Sie aktivieren diese Datei oder fügen dieselben Anweisungen in die Serverkonfiguration ein.

Eine Content Security Policy ist konfigurierbar. Die standardmäßige Skriptrichtlinie erlaubt Inline-JavaScript
ohne Nonce, da Plugins darauf angewiesen sind. Der strengere Nonce-Modus, der in den Einstellungen
angezeigt wird, dient nur zur Berichterstattung. Die Header-Implementierung akzeptiert auch die
`nonce`-Durchsetzung trotz der [veralteten Einstellungshilfe](https://github.com/kadupulhq/kadupul/issues/265).
Durchsetzung und reiner Berichtsmodus sind unterschiedlich; überprüfen Sie die Header und testen Sie alle
erforderlichen Seiten/Plugins vor einem Moduswechsel. Die implementierte Durchsetzung ist kein Beweis
für eine vollständige Nonce-Kompatibilität.

## Der Poller führt Befehle aus

Dies ist der Teil, der das Bedrohungsmodell verändert.

Die Erfassung beschränkt sich nicht nur auf SNMP. Eine Dateneingabemethode kann eine Befehlszeile
definieren, und der Poller führt sie aus. Die Befehlszeile wird im Poller-Cache gespeichert und
vom Kollektor bei jedem Intervall als der Betriebssystembenutzer des Kollektors ausgeführt.
PHP-Skriptserver-Eingaben verwenden einen separaten langlebigen PHP-Prozess. Externe Befehle
und Skriptserver-Eingaben sind unterschiedliche Pfade; gehen Sie nicht davon aus, dass jedes
Skript innerhalb dieses Servers läuft oder dass ein C-Kollektor für diesen Checkout validiert wurde.

Behandeln Sie die folgenden Berechtigungen als hochprivilegierte Konfigurationsoberflächen für
Codeausführung. Ihre genauen Auswirkungen hängen von aktivierten Funktionen und Validierungssteuerungen ab:

| Berechtigung | Grund |
|---|---|
| Dateneingabemethoden | Definiert die Befehlszeile direkt |
| Vorlagen importieren | Eine importierte Vorlage oder ein Paket kann eine Dateneingabemethode enthalten |
| Plugin-Verwaltung | Plugin-Code wird in der Anwendung ausgeführt |
| Einstellungen/Dienstprogramme | Steuert die Pfade zu den Binärdateien, die ausgeführt werden |

Gewähren Sie diese niemandem, der nicht ohnehin über Shell-Zugriff auf diesem Host verfügt. Ein
Nur-Lese-Benutzer, der Diagramme anzeigen kann, ist etwas völlig anderes, und das ist die Rolle,
die fast jedes Konto haben sollte.

Es existieren zwei Steuerelemente, und beide sollten genutzt werden:

**Metazeichen-Einschränkung.** Shell-Metazeichen in Dateneingabe-Befehlszeichenfolgen sind standardmäßig
blockiert. Es gibt eine Einstellung, um sie zu erlauben, die für alte Definitionen existiert,
die Shell-Pipelines verwendeten. Lassen Sie diese deaktiviert. Wenn Sie Definitionen haben, die dies
benötigen, verlagern Sie die Pipeline in ein Skript unterhalb des Skriptverzeichnisses und rufen Sie
dieses Skript auf.

**Die Eingabe-Whitelist.** Eine in der Konfigurationsdatei benannte Datei, die die genehmigten
Befehlszeichenfolgen nach Dateneingabemethode geordnet enthält. Wenn sie gesetzt ist, können Diagramme
und Datenquellen nicht anhand einer Dateneingabemethode erstellt werden, deren Befehlszeichenfolge nicht
in der Liste steht. Das Ändern eines genehmigten Befehls führt dazu, dass der Vergleich fehlschlägt, bis
die überprüfte Whitelist aktualisiert wird. Die Neuerstellung ist ein Befehlszeilenschritt, und genau
das ist der Sinn: Sie erfordert Shell-Zugriff auf dem Host, keine administrative Sitzung im Browser.

Die Prüfung wird erneut ausgeführt, wenn der Poller-Cache neu aufgebaut wird. Eine Dateneingabe,
die die Prüfung nicht besteht, erzeugt keine Poller-Elemente, und alle Zeilen, die sie hinterlassen
hat, werden beim nächsten festgeschriebenen Neuerstellen/Leeren gelöscht. Dies steuert die Erstellung
und Cache-Befüllung; es ist kein sofortiger Abbruchmechanismus für bereits laufende Arbeiten oder ein
Beweis dafür, dass jeder Kollektor eine geänderte Whitelist vor jeder Ausführung neu lädt. Überprüfen
Sie den festgeschriebenen Cache-Status und das Verhalten des Kollektors nach einer Richtlinienänderung.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Ein `--update` ohne Einschränkung übernimmt die aktuellen Befehlsdefinitionen in die Whitelist;
verwenden Sie dies nicht als Ersatz für deren Überprüfung. Schützen Sie die Whitelist und ihr
übergeordnetes Verzeichnis vor Schreibzugriffen durch Dienstbenutzer. Sie ist inaktiv, sofern
sie nicht konfiguriert wurde. Siehe [Ein Datenerfassungsskript schreiben](/de/guides/write-a-data-collection-script/)
für Details zu Auswahl und Ausgabe.
Dies erhöht die Hürde für eine browserseitige administrative Kompromittierung, da das Einfügen eines
neuen Befehls in die Erfassung nun auch Schreibzugriff auf das Dateisystem des Poller-Hosts erfordert.
Es ersetzt jedoch nicht die Beschränkung, wer die Berechtigungen in der obigen Tabelle besitzt, da ein
Angreifer, der eine bereits genehmigte Befehlszeichenfolge erreichen kann, keine neue hinzufügen muss.

## Authentifizierung

Vier Methoden werden mitgeliefert. Welche verfügbar sind, hängt von den vorhandenen PHP-Erweiterungen ab.

| Methode | Wo Benutzer geprüft werden | Hinweise |
|---|---|---|
| Integriert | Die lokale Datenbank | Passwörter, Richtlinien und Sperren werden alle lokal verarbeitet |
| Web-Basic | Der Webserver | Kadupul vertraut den Angaben des Servers zur Benutzeridentität |
| LDAP | Ein einzelnes Verzeichnis | Erfordert die PHP-LDAP-Erweiterung |
| Mehrere LDAP/AD-Domänen | Mehrere Verzeichnisse | Dieselbe Anforderung |

Die Einstellungsauswahl stellt diese authentifizierten Methoden bereit, nicht den veralteten Modus Null.
Der Authentifizierungs-Bootstrap versucht, eine veraltete Konfiguration ohne Authentifizierung wieder
auf lokale Authentifizierung umzustellen, aber nachgelagerte Autorisierungs-Helper enthalten weiterhin
Verzweigungen für Modus Null. Überprüfen Sie die gespeicherte Methode, konfigurierte Identitäten und
tatsächlich geschützte Routen, anstatt die abwesende UI-Auswahl als universellen Beweis anzusehen.

Zu prüfende Punkte:

- **Web-Basic delegiert die Identitätsvalidierung.** Kadupul liest serverauthentifizierte Identitätsvariablen, wenn dieser Modus ausgewählt ist, und wendet weiterhin Kontozuordnung, Aktivierungsstatus und Autorisierungsregeln an. Eine fehlende Identität ist nicht automatisch ein Administrator. Konfigurieren Sie den Server so, dass er jede beabsichtigte Route authentifiziert und Clients daran hindert, vertrauenswürdige Identitätsvariablen zu übermitteln; überprüfen Sie Bild-/Export-Routen und beabsichtigtes Gastverhalten separat.
- **Unterstützung für "Angemeldet bleiben"** ist standardmäßig aktiviert. Ein persistenter Token wird erstellt, wenn der Benutzer diese Option nach der Authentifizierung wählt, und nicht automatisch für jede Sitzung. Er verfällt nach neunzig Tagen Nichtbenutzung. Entscheiden Sie bei einer internetbasierten Installation bewusst, ob Sie dies wünschen.
- **Setzen Sie den Gastbenutzer auf "Niemand"**, es sei denn, Sie möchten ausdrücklich eine anonyme Diagrammanzeige erlauben. Standardmäßig ist kein Benutzer festgelegt, was der richtige Standardwert ist; bestätigen Sie, dass dies bei der Einrichtung nicht geändert wurde.
- **Schalten Sie Multi-Faktor-Authentifizierung davor.** Es gibt keine MFA in der Anwendung. Ein identitätsbasierter Proxy oder ein SSO-Gateway ist der Ort, an dem dies hingehört.

## Endpunkte für Remote-Datenkollektoren

Wenn Sie Remote-Kollektoren betreiben, stellt die zentrale Installation einen Endpunkt bereit,
den diese aufrufen. Er authentifiziert sich nicht über eine Benutzersitzung. Er autorisiert, indem
er die aufrufende Adresse auflöst und sie mit den Hostnamen registrierter Kollektoren abgleicht,
wobei Fehlschläge unter einer Sicherheitskategorie protokolliert werden.

Daraus folgt zweierlei. Erstens sollte dieser Endpunkt nicht aus dem öffentlichen Internet
erreichbar sein; beschränken Sie ihn am Webserver auf die Adressen der Kollektoren. Zweitens ist
die überprüfte Client-Adresse diejenige, die aus der Anfrage abgeleitet wird, sodass das zuvor
konfigurierte Vertrauen in Weiterleitungs-Header auch hier gilt. Das Vertrauen in Header, die Sie
nicht kontrollieren, ermöglicht es einem Aufrufer, die Adresse eines Kollektors vorzutäuschen.

Separat davon ist die Einstellung, die selbstsignierte Zertifikate und Hostnamen-Diskrepanzen bei
der Kommunikation des zentralen Servers mit einem Kollektor erlaubt, standardmäßig aktiviert.
Stellen Sie echte Zertifikate für Ihre Kollektoren aus und schalten Sie diese Option aus.

## Mindest-Checkliste

1. TLS terminiert, HTTP vor dem Login umgeleitet, PHP-HTTPS-Status durch den vertrauenswürdigen Server konfiguriert und Secure-Cookies verifiziert. Client-Adress-Header auf diejenigen beschränkt, die der Proxy setzt und bereinigt.
2. Standardmäßiges Administrator-Passwort geändert und bestätigt. Kontosperre aktiviert.
3. Datenbankzuweisungen für Installations-, Wartungs- und Kollektorrollen überprüft; Zeitzonenzugriff verifiziert und Datenbank-Netzwerkzugriff auf erforderliche Clients beschränkt.
4. Speicherpfade verifiziert, private Verzeichnisse und Metadaten am Webserver verweigert und erforderliche statische Assets weiterhin funktionsfähig.
5. Konfigurationsdatei zur Laufzeit nicht beschreibbar. CSRF-Geheimnisdatei, falls verwendet, außerhalb des Document-Roots.
6. Dateneingabemethoden, Vorlagenimport und Plugin-Verwaltung an niemanden vergeben, der nicht über eine Shell auf dem Poller-Host verfügt. Metazeichen-Einschränkung aktiviert. Eingabe-Whitelist konfiguriert.
7. Remote-Kollektor-Endpunkt nach Adresse beschränkt. Zertifikatsprüfung aktiviert.
8. MFA in einem Proxy vor dem gesamten System.
