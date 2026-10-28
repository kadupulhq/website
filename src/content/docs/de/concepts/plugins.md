---
title: Plugins
description: Warum die Erweiterungsschnittstelle eine Liste benannter Aufrufpunkte ist, was ein Plugin durch die Ausführung im Prozess erbt und was die Schutzmechanismen stoppen und nicht stoppen.
banner:
  content: Kadupul ist eine Vorab-Alphaversion. Validieren Sie diese Verfahren in einer isolierten Testinstallation.
sidebar:
  order: 11
---

Ein Plugin ist Code, den die Anwendung in ihren eigenen Prozess einbindet und an benannten
Stellen aufruft. Jede andere Eigenschaft des Plugin-Modells folgt aus diesem einen Satz.

Für Hinweise dazu, was vor der Installation eines fremden Plugins zu prüfen ist, siehe
[Plugins installieren und prüfen](/de/guides/install-and-vet-plugins/).

## Warum es innerhalb des Prozesses läuft

Betrachten Sie den Zweck von Plugins: Einer von der Anwendung gerenderten Liste eine Spalte
hinzufügen, die Optionen eines Graphen vor dem Zeichnen anpassen, auf das Löschen eines Geräts
reagieren oder einen Tab anheften. Jeder dieser Vorgänge ist eine Bearbeitung von Objekten,
die die Anwendung in genau diesem Moment im Speicher hält.

Ein isolierter Worker würde eine explizite Schnittstelle und eine Validierung seiner Ergebnisse
benötigen. Das kann die Privilegienisolierung aufrechterhalten, ist hier jedoch nicht der
Mechanismus: Die Plugin-Datei wird eingebunden und ihre Funktion direkt im Anwendungsprozess
aufgerufen.

## Was das Plugin erbt

Plugin-Code läuft unter dem Betriebssystemkonto des Aufrufers mit Zugriff auf die
Datenbankverbindung und die Dateisystemberechtigungen des Prozesses. Ein Webaufrufer besitzt
unter Umständen auch eine Session; ein CLI-Aufrufer hat nicht zwingend eine. Der
Plugin-Mechanismus bietet keine getrennte Identität, keine Sandbox und keine Signaturprüfung.

Benutzer- und Gruppenberechtigungen steuern den Anwendungszugriff; sie schließen beliebigen
Plugin-PHP-Code nicht ein. Datenbankberechtigungen, Dateisystemrechte und Prozessbeschränkungen
begrenzen weiterhin, was dieser Prozess tun kann. Überprüfen Sie das Plugin vor der Installation
und halten Sie die Berechtigungen des Anwendungskontos minimal.

## Zwei Aufrufstile

| Stil | Die Anwendung | Ein Plugin, das nichts zurückgibt |
|---|---|---|
| Benachrichtigung | Übergibt Argumente, ignoriert das Ergebnis | Rückgabewert wird nicht genutzt; Seiteneffekte und Ausnahmen zählen weiterhin |
| Transformation | Übergibt einen Wert, verwendet das Ergebnis | Kann den Wert durch null ersetzen und nachfolgende Aufrufer beschädigen |

Der Transformationsstil ermöglicht es einem Plugin, Schaltflächen hinzuzufügen, Aktionslisten
zu erweitern oder Graphen abzuändern. An dieser Stelle können sich Plugins auch gegenseitig
beeinflussen: Zwei Plugins am selben Hook-Punkt sehen jeweils die Ausgabe des vorherigen Plugins
in der konfigurierten Reihenfolge.

Der Dispatcher warnt davor, dass ein Array zu einem Nicht-Array wird oder ein zuvor gefüllter
Wert null-ähnlich wird, nur dann, wenn mehrere passende Hook-Zeilen vorhanden sind. Diese
Prüfung ist keine vollständige Validierung des Hook-Vertrags; ein einzelnes Plugin kann einen
Wert ohne diese Warnung beschädigen.

## Registrierung ist Zustand, keine Erkennung

Hooks liegen in einer Tabelle: welches Plugin, welcher Hook-Name, welche Datei, welche Funktion,
aktiviert oder nicht. Installations-, Upgrade- und Setup-Routinen können Hooks registrieren;
die Registrierung ist nicht auf die Erstinstallation beschränkt.

Die Alternative wäre eine dynamische Erkennung zur Anfragezeit, was das Scannen des
Plugin-Verzeichnisses und das Einbinden des Codes jedes Plugins erfordern würde, um dessen Wünsche
zu ermitteln. Eine einzelne Seite erreicht viele Hook-Punkte. Alles einzubinden, nur um
festzustellen, dass nichts angehängt ist, wäre sehr aufwendig. Daher fragt die Anwendung die
Tabelle ab, zwischenspeichert das Ergebnis für den Request und bindet nur die Datei ein, die eine
passende Zeile nennt.

Diese Entscheidung hat ihren Preis: Die Tabelle kann vom Dateisystem abweichen. Ein manuell
gelöschtes Plugin-Verzeichnis hinterlässt seine Zeilen in der Datenbank. Fehlende
Benachrichtigungs-Callbacks können entprellte Warnungen erzeugen; der Transformations-Dispatcher
besitzt keine vergleichbare Warnung für fehlende Callbacks. Ein unauffälliges Protokoll beweist
nicht, dass die Registrierung fehlerfrei ist.

Die Ausführungsreihenfolge ergibt sich aus der Registrierungsreihenfolge des Plugins und ist
anpassbar. Eine Transformationskette wird somit durch Vorgaben geordnet, die ein Administrator
steuert.

## Wonach ein Plugin greifen kann

| Fähigkeit | Hinweis |
|---|---|
| Eigene Tabellen erstellen | Protokolliert, sodass die Deinstallation sie entfernen kann |
| Spalten zu bestehenden Tabellen hinzufügen, inklusive Core | Protokolliert, sodass die Deinstallation sie entfernen kann |
| Berechtigungsbereiche registrieren | Neue zugriffsgeschützte Abschnitte der Benutzeroberfläche |
| Abhängigkeiten von anderen Plugins deklarieren | Versionsprüfung vor der Installation |
| Auf Remote-Kollektoren laufen | Aufruf hängt von Hook, Aufrufstil, Fähigkeiten und Verbindungsstatus ab |

Die erfassten Schemaänderungen sind der Grund dafür, dass eine Deinstallation destruktiv ist.
Die Anwendung kann verwaltete Tabellen und Spalten mitsamt Daten entfernen. Sie ruft zudem vor
dem Bereinigen den Deinstallations-Callback des Plugins auf. Dieser Callback kann weitere Änderungen
vornehmen; nicht nachverfolgte Änderungen werden nicht automatisch rückgängig gemacht, und das
Plugin-Quellverzeichnis bleibt bestehen.

Von einem Plugin registrierte Bereiche werden von Benutzern und Gruppen genauso gehalten wie
Core-Bereiche. Neue Bereiche können auch dem Hauptadministrator und dem aktuellen Session-Benutzer
Zugriff gewähren, sofern die Registrierung dies anfordert. Überprüfen Sie die resultierenden
Berechtigungen nach Installation und Upgrade; gehen Sie nicht davon aus, dass Ihre bestehende
Richtlinie die neue Oberfläche automatisch abdeckt.
Siehe [Berechtigungen und Zugriff](/de/concepts/permissions-and-access/).

## Was die Schutzmechanismen tatsächlich schützen

Es gibt Schutzmechanismen, und ihre Analyse zeigt das zugrunde liegende Bedrohungsmodell.

Die von einem Hook angegebene Datei wird innerhalb des eigenen Verzeichnisses des Plugins aufgelöst.
Ein Pfad, der dieses Verzeichnis verlässt, wird abgewiesen und als Sicherheitsereignis protokolliert.
Der Verzeichnisname eines Plugins ist auf Buchstaben, Ziffern, Unterstriche und Bindestriche
beschränkt. Die Registrierung von Hooks und Bereichen wird nur von Funktionen akzeptiert, deren
Name wie eine Installations-, Upgrade- oder Setup-Routine aussieht; ein Aufruf von anderer Stelle
wird verweigert und protokolliert.

Der Pfadschutz schränkt ein, welche Datei eine Hook-Zeile einbinden darf. Die Registrierungsprüfung
untersucht lediglich den Funktionsnamen des Aufrufers auf Begriffe wie Install, Upgrade oder Setup;
sie authentifiziert keinen Lebenszyklusvorgang. Plugin-Code kann einen solchen Namen bei einem
gewöhnlichen Seitenaufruf verwenden, sodass diese Konvention keine Sicherheitsgrenze darstellt.

Sie bewirken nichts bezüglich der Aktionen, die der Code des Plugins nach dem Start ausführt.
Sie sind keine Isolationsgrenze und wurden nicht als solche entworfen.

## Deaktiviert ist nicht aus

Einige Hook-Arten werden bei der Installation direkt im aktivierten Zustand registriert:
diejenigen, die Einstellungsseiten, Konfigurations-Arrays und Formulardefinitionen bereitstellen.
Ein Plugin muss konfigurierbar sein, bevor es aktiviert wird, weshalb diese Hooks in jedem Fall
ausgeführt werden.

Ein deaktiviertes Plugin bindet daher bei bestimmten Seitenaufrufen weiterhin Code ein und führt
diesen aus. Das Deaktivieren ist lediglich ein Funktionsschalter, und direkte Plugin-URLs erfordern
ebenfalls eine Überprüfung. Wenn Sie bösartigen Code vermuten, isolieren Sie die Installation
und prüfen Sie das Entfernungsverfahren, bevor Sie die Deinstallation aufrufen, die ihrerseits
Plugin-Code ausführt. Das bloße Löschen von Quelldateien bereinigt weder Registrierungen noch
macht es Datenbankänderungen rückgängig.

## Remote-Kollektoren erhalten eine engere Oberfläche

Ein Plugin deklariert seine Fähigkeiten in seiner Informationsdatei: ob es funktioniert, wenn
der Kollektor die Hauptinstallation erreichen kann, ob es funktioniert, wenn dies nicht der Fall
ist, und ob es an der Datenerfassung teilnimmt.

Auf einem Kollektor werden aufgelistete Hooks gegen die Fähigkeitsanforderungen geprüft. Nicht
gelistete Transformations-Hooks werden weiterhin ausgeführt; nicht gelistete Benachrichtigungs-Hooks
können ausgeführt werden, wenn der Kollektor online ist oder wenn das Plugin Offline-Verwaltungs-
oder Ansichtsunterstützung deklariert. Auslassungen werden nicht lückenlos protokolliert. Dies ist
Routing-Logik, keine pauschale Positivliste oder Isolationsgrenze; prüfen Sie den genauen
Dispatcher und Verbindungsstatus für den verwendeten Hook.

Der Grund dafür ist, dass ein Kollektor eine andere Umgebung darstellt. Seine Konfiguration ist
ein Replikat, das Stunden alt sein kann, und er hat möglicherweise überhaupt keine Verbindung zur
zentralen Datenbank. Ein Hook, der unter der Annahme geschrieben wurde, dass die zentrale Datenbank
nur eine Abfrage entfernt ist, schlägt dort fehl. Daher verlangt das Modell vom Plugin, seine
Annahmen explizit zu deklarieren, anstatt sie zu erraten.
Siehe [Remote-Datenerfassung](/de/concepts/remote-data-collection/).

## Der Poller ist die teure Stelle für Hooks

Ein Hook im Abfragepfad wird ausgeführt, sobald seine Aufrufstelle erreicht wird. Seine Häufigkeit
hängt vom Ereignis, dem Prozess und dem Kollektor-Routing ab; nicht jeder Hook läuft in jedem
Prozess in jedem Durchlauf. Langsamer Code auf einem häufig genutzten Pfad beansprucht das
Abfrageintervall und kann zu Lücken in Graphen führen.

Ein Hook auf einer Seite wird einmal für einen Benutzer gerendert, der ohnehin wartet. Beide
sehen in der Registrierungstabelle gleich aus, unterscheiden sich jedoch um Größenordnungen im
Ressourcenaufwand.

## Warum die Schnittstelle ungleichmäßig wirkt

Die Hook-API stellt Aufrufstellen mit unterschiedlichen Aufgaben und Argumentstrukturen bereit.

Deshalb ist die Liste umfangreich und unregelmäßig, weshalb manche Punkte einen Wert zur
Modifikation übergeben und andere lediglich über ein Ereignis informieren, und weshalb sich die
Argumentstrukturen von Hook zu Hook unterscheiden. Eine deklarierte minimale Core-Version beweist
keine Kompatibilität mit jedem Hook: Prüfen Sie die Argumente und Rückgabeerwartungen jeder
Aufrufstelle und testen Sie das Plugin auf der Zielversion. Die in
[Plugins installieren und prüfen](/de/guides/install-and-vet-plugins/) dokumentierten
Einschränkungen bezüglich CLI-Kompatibilität und Bereichsvergabe gelten ebenfalls; eine erfolgreiche
Installation allein ist kein Nachweis für Kompatibilität.

Die praktische Konsequenz: Ein Plugin ist an die Core-Version gekoppelt, für die es geschrieben
wurde, und zwar wesentlich enger, als es die deklarierte Minimalversion vermuten lässt. Prüfen Sie
Plugins vor einem Core-Upgrade erneut, nicht erst danach.
