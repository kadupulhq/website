---
title: Berechtigungen und Zugriff
description: Warum der Zugriff in zwei unabhängige Systeme unterteilt ist, warum eine Berechtigung als Standard plus Ausnahmen gespeichert wird und warum ein Baum für jedes Konto anders aussieht.
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
sidebar:
  order: 8
---

Der Zugriff verfügt über getrennte Realm- und Objektrichtlinienprüfungen. Realms steuern, welche
Schnittstellenfunktionen ein Konto verwenden darf; Objektrichtlinien bestimmen zulässige Graphen,
Geräte, Vorlagen und Bäume. Eine Anforderung kann von beidem abhängen. Realm-Gewährungen gewähren
für sich genommen keine Graphen, und Graph-Gewährungen gewähren für sich genommen keine Konsolenfunktionen.
Kontostatus, Authentifizierungsmodus und Ansichtseinstellungen spielen ebenfalls eine Rolle.

Diese Seite erklärt, warum das Modell so aufgebaut ist. Zu den Mechanismen für das Einrichten eines
Kontos siehe [Benutzer und Berechtigungen verwalten](/de/guides/manage-users-and-permissions/).

## Warum zwei Systeme

Die beiden Fragen sind nicht von derselben Art.

Das Erreichen einer Seite betrifft Code. Entweder darf das Konto den Geräte-Editor ausführen oder nicht,
und es gibt eine einzige Antwort für die gesamte Installation. Das Sehen eines Geräts betrifft Daten.
Es gibt Tausende von Geräten und die Antwort ist für jedes einzelne unterschiedlich.

Eine Zusammenführung würde eine Berechtigung pro Seite pro Objekt bedeuten, was das Produkt zweier
Listen wäre, die beide wachsen. Ihre Trennung bedeutet eine Liste von Schnittstellenabschnitten – fest
und klein – und eine Reihe von Regeln pro Objekt. Der Preis der Trennung besteht darin, dass beide
konfiguriert werden müssen und ein in einem der beiden Bereiche falsch konfiguriertes Konto auf dieselbe
Weise fehlerhaft wirkt.

## Realms sind eine feste nummerierte Liste

Ein Realm identifiziert eine Schnittstellenberechtigung durch eine Nummer. Kernzuordnungen verknüpfen
Seiten mit Realms, während Plugins zusätzliche Realms registrieren können. Prüfen Sie die erforderlichen
Realms und die Identität für die tatsächliche Route, anstatt den Seitenzugriff als vollständige
Objektautorisierungsentscheidung zu behandeln.

Nummern statt Dateinamen, weil ein Realm mehrere Seiten abdeckt und Seiten umbenannt werden. Die Nummer
bleibt bestehen; die Dateiliste dahinter ist eine Zuordnung, die sich ändern kann, ohne dass ein Konto
angepasst werden muss.

Die Realms eines Kontos stammen von ihm selbst und von aktivierten Gruppen, zu denen es gehört, kombiniert
als Vereinigung. Rollen sind Sätze von Realm-Nummern, die in einer Aktion angewendet werden. Eine Rolle
schreibt ihre Nummern auf das Konto und ist dann fertig: Sie ist ein Ausgangspunkt, keine lebendige
Verknüpfung, sodass sich ein aus einer Rolle erstelltes Konto nicht ändert, wenn die Rolle geändert wird.

Plugins fügen eigene Realms hinzu, die separat gespeichert und von Konten genau wie Kern-Realms gehalten
werden. Ein Plugin liefert daher eine neue zugriffskontrollierte Oberfläche, die Ihre bestehende
Richtlinie explizit überprüfen muss. Siehe [Plugins](/de/concepts/plugins/).

## Objekte werden als Standard plus Ausnahmen gespeichert

Vier Arten von Objekten tragen Berechtigungen: Graphen, Geräte, Graphvorlagen und Bäume.

Für jede Art besitzt ein Konto (oder eine Gruppe) eine Standardrichtlinie und eine Liste von Ausnahmen.
Eine Ausnahme ist eine einzelne Zeile: wer, welches Objekt, welche Art. Die Zeile ist in beiden
Richtlinienmodi identisch. Die Richtlinie entscheidet, was die Zeile bedeutet.

Dies ist die tragende Entscheidung im gesamten Modell. Nur Abweichungen vom Standard werden in den
Ausnahmetabellen gespeichert. Zulassen-Standards ohne Ausnahmen können einen breiten Richtlinienzugriff
ohne Ausnahmezeilen gewähren; die Konto-, Standard- und Realm-Zeilen existieren weiterhin. Fünf explizit
erlaubte Geräte unter einem Ablehnen-Gerätestandard erfordern fünf Geräteausnahmen, aber andere
Graph-Gewährungen und -Methoden können die Sichtbarkeit beeinflussen. In welche Richtung die Umgebung
auch tendiert: Die gespeicherten Daten behalten die Größe des interessanten Teils und nicht die Größe
des gesamten Bestands.

## Warum beide Richtlinienmodi existieren

| Modus | Bedeutung | Verhalten beim Hinzufügen eines Geräts |
|---|---|---|
| Zulassen, mit Ausnahmen | Objekte dieser Art außer den aufgeführten Ausschlüssen | Die Geräterichtlinie erlaubt das neue Objekt; andere Prüfungen gelten weiterhin |
| Ablehnen, mit Ausnahmen | Nur aufgeführte Objekte dieser Art | Diese Quelle gewährt kein neues Gerät; andere Quellen oder Graph-Gewährungen können Zugriff gewähren |

Die Standardwerte unterscheiden sich darin, wie sie mit neuen Objekten umgehen. Wählen Sie den
Richtlinienbereich und das Fehlerverhalten wohlüberlegt; keines von beiden beschreibt die gesamten
Zugriffsprüfungen der Anforderung.

„Jeder im Netzwerkteam, außer den beiden Racks, die der Finanzabteilung gehören“ sind zwei Zeilen unter
Zulassen und viertausend unter Ablehnen. „Dieser Auftragnehmer und nur diese fünf Geräte“ sind fünf Zeilen
unter Ablehnen und viertausend unter Zulassen. Das Erzwingen eines einzigen Modus würde bedeuten, dass
die Hälfte aller realen Richtlinien nur durch Auflisten des gesamten Bestands geschrieben werden könnte,
und eine so lange Liste wird niemals gepflegt.

Ein Zulassen-Standard schließt neu hinzugefügte Objekte seiner Art ein, sofern sie nicht ausgeschlossen
sind. Ein Ablehnen-Standard erfordert eine explizite Ausnahme von dieser Quelle. Dies sind Semantiken der
Standardrichtlinie, keine Garantien für die Fehlerbehandlung. Überprüfen Sie andere Benutzer/Gruppen und
Graphberechtigungsmethoden, bevor Sie den Schluss ziehen, dass ein Ablehnen-Gerätestandard dessen Graphen verbirgt.

## Zugriff ist eine Vereinigung und es gibt kein Verweigern

Der effektive Zugriff wird für die eigene Richtlinie des Kontos und für jede aktivierte Gruppe, zu der
es gehört, ausgewertet. Wenden Sie für den Graphzugriff zuerst die ausgewählte Graphmethode innerhalb jeder
Quelle an und bilden Sie dann die Vereinigung dieser Ergebnisse. Unter „Restriktiv“ bilden eine
Gerätegewährung in einer Gruppe und eine Vorlagengewährung in einer anderen nicht das erforderliche Paar.

Es gibt kein Gruppen-Verweigern, das eine Gewährung aus einer anderen Quelle überschreibt. Ein Ausschluss
unter einem Zulassen-Standard entfernt immer noch den Beitrag dieser Quelle; es ist kein globales
Verweigern. Das Entfernen eines solchen Ausschlusses erweitert den Zugriff, anders als das Entfernen
einer Gewährung unter Ablehnen. Dies ist eine bewusste Verengung: Ein Modell mit Gewährungen und Verweigerungen
benötigt Vorrangregeln, und Vorrangregeln sind der Punkt, an dem Berechtigungssysteme durch bloßes Lesen
unmöglich zu überprüfen werden.

Die Konsequenzen sollten klar benannt werden.

Zugriff zu widerrufen bedeutet, ihn aus dem Konto und aus jeder Gruppe zu entfernen, die ihn gewährt.
Ihn an einer Stelle zu entfernen, entfernt nichts, wenn eine andere Stelle ihn weiterhin gewährt.

Das Deaktivieren einer Gruppe entfernt ihre Gewährungen für alle Mitglieder auf einmal, was eine Gruppe
zu einem besseren Hebel für den Widerruf macht als eine Menge einzelner Bearbeitungen.

Sie können die Frage „Was kann dieses Konto sehen?“ nicht durch Betrachten einer einzelnen Zeile beantworten.
Sie müssen die vier Richtlinien und vier Listen des Kontos mit denselben Angaben aus jeder Gruppe kombinieren.

## Warum die Graphberechtigung vier Methoden hat

Ein Graph hat drei Identitäten. Er ist er selbst, er gehört zu einem Gerät und er wurde aus einer
Graphvorlage erstellt. Alle drei können Berechtigungen tragen, daher muss das Modell entscheiden,
welche Kombination zählt. Die Entscheidung ist eine installationsweite Einstellung.

| Methode | Die gestellte Frage | Konsultierte Ausnahmemengen |
|---|---|---|
| Permissiv | Ist mindestens eines der drei erlaubt? | Drei |
| Restriktiv | Ist der Graph erlaubt oder sind sowohl Gerät als auch Vorlage innerhalb einer Quelle erlaubt? | Drei |
| Gerätebasiert | Ist der Graph oder das Gerät erlaubt? | Zwei |
| Graphvorlagenbasiert | Ist der Graph oder die Vorlage erlaubt? | Zwei |

Diese Regeln beschreiben die implementierten Autorisierungsprüfungen. Direkte Graph-Gewährungen bleiben
in allen vier Methoden wirksam; die Wahl von „Gerätebasiert“ unterdrückt sie nicht. Messen Sie die Leistung
mit der tatsächlichen Richtlinie und dem Bestand, anstatt anzunehmen, dass die Anzahl der Ausnahmemengen
die Abfragekosten vorhersagt.

Permissiv ist der Standardwert und die Einstellung, die Anwender überrascht. Unter „Permissiv“ erlaubt
das Zulassen einer Graphvorlage jeden daraus erstellten Graphen auf jedem Gerät, einschließlich Geräten,
die dem Konto nie gewährt wurden. Das Modell verhält sich genau wie beschrieben. Die Beschreibung ist
nur nicht das, was die meisten Menschen annehmen.

## Berechtigungen werden in Abfragen kompiliert

Die Filterung von Graphlistenberechtigungen wird in Datenbankabfragen integriert. Eine Seite, die zwanzig
von viertausend Graphen anzeigt, kann nicht viertausend Zeilen abrufen und diejenigen verwerfen, die das
Konto nicht sehen darf, da dann die Zählung falsch ist, die Seitengrenzen falsch sind und der Aufwand
mit dem Bestand statt mit der Seite skaliert.

Daher werden die Richtlinien und Ausnahmelisten in Join- und Where-Klauseln umgewandelt und an die
Datenbank übergeben. Das Berechtigungsmodell ist zum Teil so gestaltet, weil es diese Übersetzung überstehen
muss. Mengen von IDs und ein Standard-Flag lassen sich in SQL kompilieren. Beliebige objektbezogene
Logik tut das nicht.

Der Graphpfad verfügt über eine Abkürzung für breite Graphberechtigungen, einschließlich des
Zulassen-Graphstandards eines Benutzers ohne Graphausnahmen. Verallgemeinern Sie dies nicht auf jede
Objektart oder jede Route. Realm-, Kontostatus- und Ansichtsprüfungen müssen weiterhin überprüft werden;
die Optimierung von Berechtigungsabfragen ist kein Ersatz für Zugriffstests.

## Bäume sind eine separate Achse

Baumberechtigung und Graphberechtigung werden unabhängig voneinander geprüft. Die Gewährung eines Baums
gewährt nicht dessen Inhalt. Die Gewährung eines Graphen erfordert nicht die Gewährung eines Baums.

Ein Baum ist eine Darstellung von Objekten, kein Container, der sie besitzt. Derselbe Graph kann auf
fünf Bäumen erscheinen. Wenn ein Baum seinen Inhalt gewähren würde, wäre das Bearbeiten eines Baums das
Bearbeiten von Berechtigungen, und jeder, der Graphen organisieren darf, dürfte sie veröffentlichen.

Stattdessen blendet der Baum aus, was leer ist. Ein Zweig wird angezeigt, wenn er etwas enthält, das
das Konto sehen darf, und die Prüfung steigt ab: Ein Zweig, dessen Unterzweige für dieses Konto alle leer
sind, wird selbst ausgeblendet. Zwei Personen öffnen denselben Baum und sehen zwei unterschiedliche Formen,
und niemand sieht einen Platzhalter, der darauf hinweist, was der andere hat.

Diese Leerheitsprüfung ist nicht kostenlos. Sie durchläuft den Zweig und stellt rekursiv die Graph- und
Gerätefragen für das, was sie findet. Ein tiefer Baum und eine teure Graphberechtigungsmethode lassen
sich schlecht kombinieren, was ein weiterer Grund für die Existenz der groben Methoden ist.

Die Auswirkung auf Prüfungen wiegt schwerer als die auf die Leistung. **Eine Baumansicht ist kein Bericht
darüber, worauf ein Konto zugreifen kann.** Sie ist ein Bericht darüber, worauf ein Konto zugreifen kann
*und was jemand auf diesem Baum platziert hat*. Um den Zugriff zu überprüfen, untersuchen Sie Richtlinien
und überprüfen Sie tatsächlich zulässige und abgelehnte Anforderungen. Die Anzeige der effektiven Richtlinie
ist eine separate Implementierung von den Autorisierungsprüfungen, daher sollten ihre Bezeichnung und
ihr Tooltip nicht der einzige Nachweis sein. Siehe
[Überprüfen, wer was sehen kann](/de/guides/audit-who-can-see-what/).

## Caching und warum Änderungen zu ungewöhnlichen Zeitpunkten greifen

Berechtigungsantworten werden in der Sitzung zwischengespeichert, da die Alternative darin bestünde,
auf jeder Seite dieselbe Frage erneut zu stellen. Die Änderung eines Administrators markiert die
zwischengespeicherten Antworten des betroffenen Kontos als veraltet, und die nächste von diesem Konto
geladene Seite baut sie neu auf, anstatt auf eine Neuanmeldung zu warten.

Das Deaktivieren eines Kontos löscht gespeicherte Anmeldedaten, zwischengespeicherte Berechtigungen
und serverseitige Sitzungen. Geschützte Anforderungen prüfen auch den Status „aktiviert/gesperrt“;
eine bereits in einem Browser geladene Seite wird nicht gelöscht. Routen mit Gastfunktion können eine
separate Gastidentität auflösen, wenn sie konfiguriert sind, sodass eine erfolgreiche Antwort allein
nicht beweist, dass das deaktivierte Konto Zugriff behält.

Überprüfen Sie Änderungen anhand bestehender und neuer Sitzungen, prüfen Sie sowohl beibehaltenen als
auch widerrufenen Zugriff und zeichnen Sie Antwortinhalt und Identität auf. Verwenden Sie den
HTTP-Status allein nicht als Beweis für die Autorisierung und gehen Sie nicht davon aus, dass jeder
Cache-Verbraucher identisch aktualisiert.
