---
title: Sicherheitsmodell
description: Wo nicht vertrauenswürdige Daten in Kadupul eindringen, welcher Prozess mit welchen Rechten läuft, was das Datenbankkonto darf und welche Grenzen der Code erzwingt und nicht nur voraussetzt.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 12
---

Ein Überwachungssystem ist schwer zu verteidigen, und zwar aus drei Gründen, die nichts mit der
Codequalität zu tun haben.

Es speichert Zugangsdaten für alle überwachten Systeme. SNMP-Communities, v3-Benutzernamen und
Passphrasen sowie alle weiteren Zugangsdaten eines Geräts werden gespeichert, damit der Poller
sie unbeaufsichtigt verwenden kann. Es gibt keinen Operator, der sie alle fünf Minuten manuell eingibt.

Es führt Befehle nach Zeitplan aus. Das Erfassen eines Werts, den SNMP nicht bereitstellt,
erfordert ein Skript. Die Definition dieses Skripts ist Konfiguration, die in der Datenbank
gespeichert und über die Benutzeroberfläche bearbeitet werden kann.

Es verarbeitet Daten, die von den überwachten Maschinen generiert werden. Eine Schnittstellenbeschreibung,
ein Festplatten-Einhängepunkt, ein Sensorname: All das stammt vom Gerät und landet in der Datenbank,
in Graphentiteln und in Argumenten für andere Programme. Ein kompromittierter Switch ist eine
Eingabequelle, nicht nur ein Opfer.

Nichts davon ist ein Fehler. Es sind die Anforderungen an das System. Im Folgenden wird dargestellt,
wo jeder Aspekt in der Architektur verankert ist.

## Wo nicht vertrauenswürdige Eingaben eindringen

Vier Eintrittspunkte, grob geordnet nach dem Grad der Kontrolle durch den Operator.

| Eintrittspunkt | Quelle | Wohin es fließt |
|---|---|---|
| HTTP-Parameter | Jeder, der den Webserver erreichen kann | Datenbank, Seitenausgabe und SQL |
| SNMP-Werte | Das abgefragte Gerät | `host_snmp_cache`, Graphentitel, RRD-Grenzen, Skriptargumente |
| Skriptausgabe | Ein lokales Skript oder dessen Zielsystem | `poller_output`, dann RRD-Dateien |
| Hochgeladene Vorlagen und Pakete | Jeder mit Rechten für den Import-Bereich | Vorlagenzeilen und bei Paketen Dateien auf der Festplatte |

### HTTP-Parameter

Anfrage-Hilfsfunktionen liegen in `lib/html_utility.php`. `get_filter_request_var()` validiert
standardmäßig auf Ganzzahlen, besitzt aber auch Sonderbehandlungen für leere, undefinierte und
Regex-Werte. Ein Aufrufer muss weiterhin prüfen, ob ein Wert erforderlich und für die Operation
angemessen ist. Eine Filterung begründet keine Autorisierung.

`set_request_var()` speichert einen Wert in `$_CACTI_REQUEST` und spiegelt ihn in die
Request-Arrays. `get_nfilter_request_var()` liest diesen Cache oder die Rohdaten der Anfrage
und validiert oder schreibt den Wert selbst nicht. Nachfolgende Lesezugriffe können daher einen
zuvor gespeicherten Wert sehen, und die Lesereihenfolge ist entscheidend.

Bei aktiviertem `log_validation` protokolliert `get_request_var()` bestimmte ungecachte
Anfragezugriffe. Direkte Zugriffe auf Superglobale und `get_nfilter_request_var()` werden nicht
vollständig erfasst. Es ist eine Diagnosehilfe, keine vollständige Validierungsprüfung oder
Durchsetzung.

### SNMP-Werte

Die Erkennung von Datenabfragen speichert ausgewählte indizierte Werte in `host_snmp_cache`;
normale SNMP-Abfrageergebnisse folgen dem Messwertpfad. `data_query_format_record()` in
`lib/data_query.php` wendet vor der Speicherung zwei Transformationen an: eine optionale
`rewrite_value`-Zuordnung aus der Abfragedefinition und `bin2hex()` auf jeden Wert, dessen
Zeichenkodierung `mb_detect_encoding()` nicht ermitteln kann. Letzteres ist ein Schutz gegen
binäre Bytefolgen, nicht gegen schädliche Inhalte.

Von dort aus wandert der Wert weiter. Er benennt Graphen über `substitute_snmp_query_data()`.
Er kann ein RRD-Maximum festlegen, da eine Datenvorlage ihr Maximum als `|query_ifSpeed|`
deklarieren darf. Er wird zu einem Argument für eine Skriptabfrage, wobei `get_script_query_path()`
jeden Teil zunächst durch `cacti_escapeshellarg()` leitet.

Die Maskierung und die in [RRDtool-Integration](/de/reference/rrdtool-integration/)
beschriebenen RRDtool-Validierungen bilden hier die Grenze. Gerätedaten müssen als nicht
vertrauenswürdig eingestuft bleiben. Validierung und Maskierung sind Eigenschaften jeder einzelnen
Aufrufstelle; das Vorhandensein von Hilfsfunktionen garantiert nicht, dass jeder Konsument sie
korrekt einsetzt. Prüfen Sie sowohl die Befehlsstruktur als auch das eingesetzte Argument.

### Skriptausgabe

Der `popen()`-Zweig von `exec_poll()` liest mit `fgets(..., 8192)` höchstens 8.191 Bytes
oder bis zum ersten Zeilenumbruch. Sein `shell_exec()`-Fallback verhält sich bei der Ausgabe
anders, und die Erfassung über den Script-Server folgt einem separaten Pfad.

`prepare_validate_result()` erkennt numerische und unbekannte Werte, hexadezimale Formen und
einige mehrteilige Ausgabeformate. Es kann auch Text entfernen, um einen numerischen Wert zu
gewinnen; es ist kein universeller strikter Skalarfilter. Die nachfolgende Verarbeitung und
RRDtool-Validierung sind ebenfalls relevant. Siehe [Dateneingabemethoden](/de/reference/data-input-methods/).

Ausgabeprüfungen isolieren ein bereits ausgeführtes Skript nicht nachträglich in einer Sandbox.
Prüfen Sie den Befehl, die Eingabe-Positivliste und die Betriebssystemberechtigungen vor der
Aktivierung der Erfassung.

### Vorlagen und Pakete

Zwei unterschiedliche Mechanismen teilen sich einen Berechtigungsbereich.

Ein **Vorlagenimport** ist reines XML ohne Signatur. Er erstellt Vorlagen, Datenabfragen und
Dateneingabemethoden. Eine Dateneingabemethode ist eine Befehlszeile, daher führt hier ein Pfad
von einer hochgeladenen Datei direkt zu einem vom Poller ausgeführten Befehl. `lib/import.php`
führt `cacti_input_string_is_safe()` auf jedem importierten `input_string` aus und lehnt die
Methode ab, wenn sie Shell-Metazeichen enthält, mit dem Protokolleintrag:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Ein **Paketimport** ist signiert. `import_read_package_data()` liest den eingebetteten
öffentlichen Schlüssel des Pakets und vergleicht ihn mit den drei in `lib/import.php` fest
kompilierten Schlüsseln: den beiden Cacti-Schlüsseln und dem Kadupul-Schlüssel. Jeder andere
Schlüssel schlägt fehl. Ein Paket ohne `<publickey>`-Element wird so interpretiert, als beanspruche
es den älteren Cacti-Schlüssel, und muss eine dazu passende Signatur aufweisen.
`import_read_package_data()` weist Schlüssel unter 2048 Bit vor dem Verifizierungsversuch ab,
was der ältere Schlüssel mit 512 Bit nicht erfüllt. Jede enthaltene Datei trägt eine eigene Signatur,
die separat überprüft wird.

Pakete dürfen anschließend ausgewählte Dateien schreiben. Akzeptierte Namen beginnen mit
`scripts/` oder `resource/`, optional unter einem gültigen `plugins/<name>/`-Präfix.
Der Importer weist NUL-Bytes, Verzeichnissprünge und absolute Pfade ab und erzwingt die Ablage
unterhalb des Installationsverzeichnisses; das bloße Enthalten eines Verzeichnisnamens reicht nicht
aus. Die Schreibbarkeit des Ziels steuert ebenfalls, ob der Schreibvorgang gelingt. Ein Paket, das
die Verifizierung besteht, schreibt konstruktionsbedingt ausführbaren PHP-Code in den
Installationsbaum. Die Signaturprüfung bestätigt die anerkannte Signaturidentität und Integrität,
nicht die Unbedenklichkeit des Codes. Bereichsautorisierung, Pfadisolierung, Dateiauswahl,
Dateisystemberechtigungen und Befehlsfilter sind ebenfalls entscheidend.

Beide Mechanismen liegen hinter Bereich 17. Die Standardrolle Vorlagen-Editor besitzt Bereich 17
und Bereich 2 (Dateneingabemethoden). Ein Konto mit diesen Rechten kann Erfassungsbefehle
definieren, vorbehaltlich von Validierung und Positivlisten. Das ist der Zweck der Rolle, und
dessen sollte man sich vor der Vergabe bewusst sein. Siehe
[Vorlagen importieren und exportieren](/de/guides/import-and-export-templates/) für validierte
Abläufe und bekannte Grenzen.

## Was mit welchem Privileg läuft

| Prozess | Gestartet durch | Läuft als | Aufgabe |
|---|---|---|---|
| Weboberfläche | Webserver | Webserver-Benutzer | Liest und schreibt die Datenbank, rendert Graphen über RRDtool, schreibt RRD-Dateien bei Bedarf, schreibt Paketdateien beim Import |
| `poller.php` | Konfigurierter Scheduler oder Dienst | Scheduler-/Dienstkonto | Liest den Poller-Cache, startet Kollektoren, schreibt RRD-Dateien |
| `cmd.php` | Poller oder Echtzeit-Erfassungspfad | Startendes Konto | Führt SNMP-Abfragen und Erfassungsbefehle aus |
| `script_server.php` | Kollektor | Startendes Konto | Bindet eine PHP-Datei ein und ruft eine Funktion im eigenen Prozess auf |
| RRDtool | Webprozess oder Poller | Aufrufender Prozess | Liest und schreibt Dateien unter `rra/` |

Zwei dieser Komponenten erfordern eine genauere Betrachtung:

**Der Script-Server ist keine Sandbox.** Er bindet die Zieldatei in einen langlebigen PHP-Prozess
ein und ruft darin eine Funktion auf. Diese Funktion teilt sich den Prozess, den Arbeitsspeicher
und die Datenbankverbindung. Die Prüfungen in `script_server.php` entscheiden, ob der Aufruf
überhaupt stattfindet: `realpath()` der Einbindungsdatei muss unter `$config['base_path']`
oder `$config['scripts_path']` liegen, die Funktion muss nach dem Einbinden existieren,
`ReflectionFunction::isInternal()` muss false sein und die Datei, die die Funktion definiert,
muss ebenfalls unter einem erlaubten Pfad liegen. Sobald diese Prüfungen bestanden sind, läuft der
Code mit den vollen Rechten des Pollers. Eine Script-Server-Methode ist ein Weg, PHP innerhalb von
Kadupul auszuführen, nicht neben Kadupul.

**Der Webprozess kann RRD-Dateien schreiben.** Graphenabfragen können On-Demand-Boost-Aktualisierungen
und die Dateierstellung auslösen. Eine Warnung, die die Verzeichniserstellung an den Poller delegiert,
macht Schreibrechte für den Webserver nicht allgemeingültig optional. Die Speicherprüfung und
Wartungskoordination prüfen zudem Kontozugriffe und vertrauenswürdige numerische UID/GID-Konfigurationen.
Eine Erstellung durch Root versucht, die Eigentumsverhältnisse anzugleichen, Fehler können jedoch
protokolliert werden. Siehe [Sicher aktualisieren](/de/guides/upgrade-safely/).

Die Konten von Webserver und geplantem Poller können voneinander abweichen. Eine über eine
Webanfrage gestartete Echtzeiterfassung kann das Webkonto erben, sodass die Befehlsausführung nicht
auf das Konto des geplanten Pollers beschränkt ist. Die übernommene Spine-Integration erfordert
eine separate Validierung mit der tatsächlichen Binärdatei; diese Seite beschreibt keinen
vollständig unterstützten Build.

## Was das Datenbankkonto benötigt

Prozesse, die dieselbe Datenbankkonfiguration nutzen, teilen sich normalerweise deren Konto.
Remote-Kollektoren können getrennte lokale und zentrale Anmeldedaten besitzen; umgebungsspezifische
Konfigurationen können abweichen. Prüfen Sie die tatsächlichen Berechtigungen jedes Kontos.

| Anforderung | Grund |
|---|---|
| Vollständiges DML auf dem Kadupul-Schema | Regulärer Betrieb |
| DDL auf dem Kadupul-Schema | Upgrades und Laufzeitoperationen wie Boost-Tabellenrotation, temporäre Tabellen und Plugin-Lebenszyklusänderungen |
| `SELECT` auf `mysql.time_zone_name` | Standort- und Kollektor-Zeitzonenlisten lesen diese Tabelle direkt |

Entziehen Sie DDL-Berechtigungen nicht in der Annahme, dass nur Upgrades sie benötigen. Die
Anwendung wechselt nicht durchgängig zu einer separaten Migrationsidentität; eine Kontentrennung
erfordert eine bereitstellungsspezifische Validierung aller betroffenen Laufzeitpfade.

`include/config.php` enthält Datenbankzugangsdaten, und Remote-Kollektoren können zudem zentrale
`$rdatabase_*`-Zugangsdaten enthalten. Dateisystemberechtigungen, HTTP-Zugriffsregeln,
PHP-Handler-Konfiguration und Backup-Schutz sind gleichermaßen wichtig. PHP führt die Datei
normalerweise aus, anstatt ihren Quelltext auszuliefern, dies ersetzt jedoch keinen Schutz vor
direkter Offenlegung. Siehe
[Eine öffentlich erreichbare Installation absichern](/de/guides/secure-an-internet-facing-install/).

Gerätezugangsdaten werden auf dieselbe Weise gespeichert. `host.snmp_community`,
`host.snmp_password` und `host.snmp_priv_passphrase` sind gewöhnliche Spalten, die von
`api_device_save()` über `form_input_validate()` unverschlüsselt geschrieben und für den
Poller in `poller_item`-Zeilen kopiert werden. Lesezugriff auf diese Tabellen kann gespeicherte
Zugangsdaten offenlegen; dies bedeutet jedoch keinen Zugriff auf alle externen Quellen.
Benutzerpasswörter bilden die Ausnahme: `compat_password_hash()` verwendet PHPs
`password_hash()` mit `PASSWORD_DEFAULT`, und ein älterer MD5-Hash, der noch gültig ist,
wird beim nächsten Login neu gehasht.

## Erzwungen und lediglich konventionell

Diese Unterscheidung ist bei der Bewertung einer Code-Änderung von zentraler Bedeutung.

### Code-Mechanismen und ihr Umfang

| Grenze | Mechanismus |
|---|---|
| Authentifizierung | Allgemeine Schnittstellenseiten nutzen `include/auth.php`; spezialisierte Endpunkte besitzen eigene Logik |
| CSRF | Geteilter Web-Bootstrap konfiguriert Token-Handling; fehlerhafte Token-Arrays werden abgewiesen. Prüfen Sie jeden Endpunkt und Aufrufpfad, anstatt von universeller Abdeckung auszugehen |
| Reine CLI-Skripte | `include/cli_check.php` antwortet mit `404` und beendet die Ausführung, wenn das SAPI nicht `cli` ist |
| Datenabfrage-XML-Pfad | `cacti_path_is_within()` prüft gegen `<base_path>/resource`, protokolliert und verweigert andernfalls |
| Paket-Authentizität | Signatur gegen einkompilierten Schlüssel, mindestens 2048 Bit, Signaturen pro Datei |
| Paket-Dateiablage | Ungültige Namen abgewiesen; erlaubte Skript-/Ressourcen-Präfixe und aufgelöste Stammverzeichnis-Pfade geprüft |
| Script-Server-Ziele | `realpath()`-Eingrenzung plus obige Funktionsprüfungen |
| Shell-Argumente | Maskierung, strukturierte Befehlshelfer und Validatoren, wo angewendet; tatsächliche Aufrufstelle prüfen |
| RRDtool-Argumente | Steuerzeichen- und Formatvalidatoren in `lib/functions.php` |
| SQL | Prepared Statements binden Werte; dynamisches SQL, Bezeichner und ungeprüfte Aufrufe erfordern weiterhin Überprüfung |
| Remote-Agent-Aufrufer | Quelladresse muss mit einer aktiven Zeile in `poller` übereinstimmen, per exakter IP oder bestätigtem Forward-Reverse-Lookup |

### Verantwortlichkeiten bei Bereitstellung und Aufrufstellen

| Grenze | Warum sie nicht erzwungen wird |
|---|---|
| Anfrage-Filterung | Eine Seite nutzt `get_filter_request_var()` oder nicht. `log_validation` meldet nur, blockiert aber nicht |
| Ausgabe-Maskierung | `html_escape()` und `html_purify()` werden pro Aufrufstelle angewendet |
| Autorisierung pro Seite | Die Bereichsprüfung nutzt `$user_auth_realm_filenames`, geschlüsselt nach Dateiname. Eine nicht zugeordnete Seite erhält allein aus dieser Zuordnung keine Berechtigung. Zusätzliche Prüfungen können greifen; Plugin-Seiten müssen Zugriffsregeln selbst registrieren und durchsetzen |
| Verzeichnissperren | Die `.htaccess`-Dateien unter `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` und `cache/*` sind Apache-Direktiven. Unter nginx oder unter Apache mit deaktiviertem `AllowOverride` greift keine davon |
| Sicherheits-Header auf statischen Dateien | `.htaccess.dist` wird unumbenannt ausgeliefert. PHP-Header-Ausgabe hängt von Antwortpfad und Einstellungen ab; statische Antworten von Server-/Proxy-Konfiguration |
| Trennung von Web- und Poller-Benutzern | Eine Konvention, keine strikte Vorgabe |
| Berechtigungen für `include/config.php` | Vom Installateur festgelegt |

Die `index.php`-Weiterleitungen in `resource/` und Unterverzeichnissen verhindern ein
Verzeichnis-Listing. Sie sind keine Zugriffskontrolle und verhindern keinen direkten Zugriff auf
eine benannte Datei.

## Endpunkte, die vor der Authentifizierung antworten

Dies sind Beispiele spezialisierter Einstiegspunkte, keine vollständige Auflistung aller
öffentlichen Endpunkte. Das Fehlen der Standard-Einbindung beweist nicht das Fehlen von
Authentifizierung oder Autorisierung an anderer Stelle im Anfragepfad.

| Datei | Verhalten |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Die Login-Oberfläche selbst |
| `csp_report.php` | Empfängt CSP-Verletzungsberichte des Browsers |
| `service_check.php` | Antwortet mit `success` oder `fail` nach einer Abfrage gegen `version`. Ein Status-Check ohne Authentifizierung |
| `link.php` | Lädt eine externe Link-Zeile und prüft anschließend selbst `is_realm_allowed($page['id'] + 10000)` |
| `remote_agent.php` | Der Kollektor-RPC, autorisiert über die Quelladresse |

`remote_agent.php` erfordert besondere Aufmerksamkeit. Seine Autorisierung erfolgt über
`remote_client_authorized()`, das `get_client_addr()` mit den Hostnamen und Adressen in der
`poller`-Tabelle vergleicht. Es gibt kein gemeinsames Geheimnis. Ein Aufrufer, dessen Adresse
zu einer aktiven Datenkollektor-Zeile passt, kann die Aktionen des Agenten aufrufen: Daten abfragen,
eine Datenabfrage ausführen, ein Gerät anpingen, SNMP-Gets und Walks durchführen, Graphendaten
anfordern und Netzwerkerkennung starten. Zwei Schutzmaßnahmen steuern dies: Erstens gibt die
Funktion direkt false zurück, wenn höchstens eine aktive Kollektorzeile zurückgegeben wird, sodass
dieser Fall abgewiesen wird. Zweitens wird bei einer Übereinstimmung über den Hostnamen anstelle
einer exakten IP der Reverse-Lookup durch einen Forward-Lookup bestätigt, bevor er akzeptiert wird.

`get_client_addr()` liest `REMOTE_ADDR` und nichts anderes, es sei denn, `$proxy_headers`
ist in `include/config.php` gesetzt. Der Auslieferungsstandard ist `null`. Das Aktivieren
unterstützter Proxy-Header ändert die Quellen, aus denen eine gültige Client-Adresse ermittelt wird.
Verwenden Sie nur Header, die vom vertrauenswürdigen Ingress-Proxy kontrolliert werden, und
verhindern Sie, dass Clients diese Werte manipulieren oder selbst übergeben. Dies ist die einzelne
Konfigurationszeile, die die Bedeutung jeder adressbasierten Entscheidung im System am stärksten
beeinflusst, einschließlich der Autorisierung von Remote-Agenten und der protokollierten Adressen.

## Gastzugriff

Die Einstellung `guest_user` benennt ein Benutzerkonto, dessen Berechtigungen für Graphenseiten
ohne Login verwendet werden. Standardmäßig ist kein Benutzer festgelegt, sodass das Anzeigen von
Graphen wie alles andere eine Authentifizierung erfordert. Das Setzen dieser Option gibt alles,
was dieses Konto sehen darf, für jeden frei, der den Webserver erreichen kann. Das ist der Zweck
dieser Funktion. Das Konto existiert weiterhin in den Benutzerdatensätzen; die Gasteinstellung macht
dessen anwendbare Graphenrechte ohne regulären Login nutzbar. Überprüfen Sie tatsächliche Anfragen
und Objektberechtigungen, nicht nur den konfigurierten Kontonamen.

## Wie man über eine Änderung nachdenkt

Stellen Sie nacheinander drei Fragen:

Welcher Prozess führt dies aus und als welcher Benutzer? Die Antwort für eine Dateneingabemethode
ist üblicherweise das Betriebssystemkonto des startenden Kollektors; webgestützte Erfassungen
können sich von zeitgesteuerten Erfassungen unterscheiden.

Was berühren die Daten auf ihrem Weg? Ein Wert von einem Gerät, der ausschließlich in einer
RRD-Datei landet, hat eine Grenze überschritten. Derselbe Wert in einem Graphentitel hat zwei
überschritten, und in einem Skriptargument drei.

Ist die Grenze, auf die ich mich verlasse, erzwungen oder lediglich konventionell? Wenn sie
konventionell ist, bildet der Code, den Sie schreiben, die Durchsetzung.

Weiterführende Informationen: [Berechtigungen und Zugriff](/de/concepts/permissions-and-access/)
für das Autorisierungsmodell selbst, [Dateneingabemethoden](/de/reference/data-input-methods/)
für den Ausführungsvertrag und die Eingabe-Positivliste sowie
[Remote-Datenerfassung](/de/concepts/remote-data-collection/) dafür, wie ein Kollektor mit dem
ihm entgegengebrachten Vertrauen umgeht.
