---
title: Vorlagen
description: Wie eine Definition hundert Geräte abdeckt und was geschieht, wenn Sie diese ändern.
sidebar:
  order: 3
banner:
  content: Kadupul befindet sich in der Vor-Alpha-Phase. Prüfen Sie diese Verfahren in einer isolierten Testinstallation. Übersetzungsentwurf, noch ohne Prüfung durch eine sprachkundige Person.
---

Vorlagen existieren, damit das Hinzufügen des hundertsten Switches denselben Aufwand erfordert wie das des zweiten. Es gibt vier Arten, und sie bauen aufeinander auf.

Einen praxisbezogenen Ablauf finden Sie unter [Vorlagen verwenden und validieren](/de/guides/template-workflow/).

**Datenvorlagen** definieren, was gesammelt und wie es gespeichert wird: die Felder, ihre Typen, ihre Grenzwerte, das Speicherprofil und welche Eingabemethode die Werte abruft. Feldspezifische Einstellungen pro Objekt und vorhandene RRD-Dateien können von der aktuellen Vorlage abweichen; die Vorlage ist kein Beweis für den tatsächlichen Dateiinhalt.

**Diagrammvorlagen** definieren die grafische Darstellung: welche Elemente, in welcher Reihenfolge, mit welchen Farben, Legendenzeilen und Achsenbeschriftungen.

**Gerätevorlagen** bündeln die Datenabfragen und Diagrammvorlagen, die zu einer bestimmten Hardwareklasse passen, sodass die Wahl der passenden Vorlage beim Anlegen eines Geräts den Großteil der Arbeit erledigt.

**Datenabfragen** decken Fälle ab, in denen die genaue Anzahl der Elemente vorab nicht bekannt ist. Ein Switch besitzt eine variable Anzahl von Ports, die durch Abfragen des Geräts ermittelt werden, und eine Datenabfrage erfasst indexierte Ergebnisse für die Diagrammerstellung. Die Erkennung allein erzeugt keine feste Anzahl von Diagrammen oder Datenquellen.

## Aufbau und Hierarchie

Die vier Vorlagenarten sind keine bloßen Schichten desselben Objekts. Jede verweist auf die darunterliegende Ebene.

| Art | Verweist auf | Erzeugt |
|---|---|---|
| Gerätevorlage | Diagrammvorlagen und Datenabfragen | Nichts direkt. Sie ist eine Auswahlliste für ein Gerät |
| Datenabfrage | Diagrammdefinitionen und Zuordnungen für indexierte Ergebnisse | Erkannte Zeilen; die Diagrammerstellung kann Datenquellen anlegen oder wiederverwenden |
| Diagrammvorlage | Datenvorlagenfelder, wo ein Element Werte benötigt | Ein Diagramm, das mehrere Datenquellen referenzieren kann |
| Datenvorlage | Eine Eingabemethode und ein Speicherprofil | Datenquellen-Metadaten; eine RRD wird erstellt, sobald der Schreibpfad sie benötigt |

Datenführende Vorlagenelemente verweisen auf Vorlagenfelder; instanziierte Elemente werden lokalen Feldern zugeordnet. Text- und Konstantenelemente benötigen keine Datenquellenreferenz. Die Diagrammerstellung löst diese Zuordnungen auf; spätere Neuverknüpfungen oder Elementänderungen können sie anpassen. Die Diagrammerstellung kann kompatible Datenquellen wiederverwenden, statt für jedes Diagramm eine neue Datei anzulegen.

## Vorlagenbasiert oder objektspezifisch

Viele Felder auf Diagramm- und Datenquellenebene besitzen entsprechende Flags in der Vorlagenzeile. Für diese Felder bestimmt das Flag die normale Weitergabe an verknüpfte untergeordnete Elemente. Andere Felder, Diagrammelemente und Eingabezuordnungen folgen separaten Verteilungsregeln.

| Flag | Bedeutung | Beim Speichern |
|---|---|---|
| Deaktiviert | Das Feld ist vorlagenbasiert | Wird auf jedes untergeordnete Element geschrieben und überschreibt dortige Werte |
| Aktiviert | Das Feld ist objektspezifisch | Bleibt auf jedem untergeordneten Element unberührt |

Das Flag gilt pro Feld. Eine Diagrammvorlage kann ihre Achsenbeschriftung an verknüpfte Diagramme weitergeben, während Titel und vertikale Grenzwerte individuell beim Ersteller verbleiben. Diese Mischung ist der Normalfall, keine Ausnahme.

Zwei Eigenschaften dieses Entwurfs führen häufig zu Missverständnissen.

Das Flag liegt auf der Vorlage und entscheidet nur darüber, was beim nächsten Speichern passiert. Ein Feld nach einem Überschreiben als objektspezifisch zu markieren, stellt frühere Werte nicht wieder her. Die alten individuellen Werte sind verloren; das Flag schützt erst künftige Anpassungen.

Umgekehrt ist es noch gravierender: Das Deaktivieren des Flags bei einem Feld, das jahrelang objektspezifisch war, führt beim nächsten Speichern dazu, dass dieser Wert auf allen untergeordneten Objekten mit dem Vorlagenwert überschrieben wird – oft ein Platzhalter, der nie geprüft wurde.

### Nicht jedes Feld besitzt ein Flag

Ein Feld nimmt nur dann teil, wenn ein entsprechendes Flag dafür existiert. Auf Datenquellenebene besitzen vier Felder ein Flag, zwei bewusst nicht.

| Feld | Flag | Verhalten |
|---|---|---|
| Name | Ja | Vorlagenbasiert oder objektspezifisch |
| Aktiv | Ja | Vorlagenbasiert oder objektspezifisch |
| Schrittweite | Ja | Vorlagenbasiert oder objektspezifisch |
| Speicherprofil | Ja | Vorlagenbasiert oder objektspezifisch |
| Eingabemethode | Nein, stets vorlagenbasiert | Die Speicherroutine der Vorlage aktualisiert verknüpfte Datenquellenzeilen explizit |
| Pfad zur RRD-Datei | Nein, niemals vorlagenbasiert | Normale Vorlagenübertragungen schließen ihn aus; Neuzuordnungen behalten den Pfad bei |

Die Beibehaltung des Pfads schützt bestehende Verknüpfungen mit Verlaufsdaten bei normalen Vorlagenänderungen. Das bedeutet nicht, dass Pfade durch andere administrative Vorgänge nicht bearbeitet oder verschoben werden können. Prüfen Sie die Dateiidentität vor solchen Änderungen.

Felder eines Datenquellenelements tragen ausnahmslos ein Flag: Feldname, Datentyp, Heartbeat, Minimalwert, Maximalwert und das speisende Eingabefeld.

## Diagrammeingaben wirken in Gegenrichtung

Eine Diagrammvorlage kann eine benannte Eingabe deklarieren, die mehrere Diagrammelemente an ein einziges bearbeitbares Feld bindet. Dadurch aktualisiert die Änderung eines Werts am Diagramm alle Elemente, die ihn teilen. Dies ist der Mechanismus, mit dem eine einzelne Farb- oder Legendeneinstellung eine Gruppe zusammengehöriger Elemente steuert.

Der übertragene Wert stammt nicht aus der Vorlage. Er liest den aktuellen Wert der anderen Elemente aus, die zur Eingabe gehören, und gibt diesen weiter. Eine Diagrammeingabe verteilt sich somit seitlich zwischen den Elementen eines Diagramms und nicht von oben herab aus der Vorlage. Deshalb kann die Bearbeitung einer Eingabe ein Diagramm ändern, das die Vorlage selbst nicht berührt hat.

## Was wann weitergegeben wird

| Änderung | Erreicht bestehende Objekte | Wie |
|---|---|---|
| Diagrammvorlagenfeld, vorlagenbasiert | Ja, beim Speichern | Wird in jedes Diagramm dieser Vorlage geschrieben |
| Diagrammvorlagenfeld, objektspezifisch | Nein | Das untergeordnete Objekt behält seinen eigenen Wert |
| Erscheinungsbild von Diagrammelementen | Ja, beim Speichern | Farbe, Transparenz, Elementtyp, Linienstärke, Strichelung, CDEF, VDEF, Versatz, Konsolidierungsfunktion, Ausrichtung, Text und Legendenformat |
| Diagrammelement hinzugefügt, entfernt oder neu zugeordnet | Vorgangsabhängig | Abgleich, Hinzufügen, Löschen und Neuzuordnen nutzen unterschiedliche Pfade; prüfen Sie die resultierenden lokalen Zuordnungen |
| Datenvorlagenfeld, vorlagenbasiert | Ja, beim Speichern | Wird in jede Datenquelle dieser Vorlage geschrieben |
| Eingabefeldwerte der Datenvorlage | Wenn vorlagenbasiert | Vorlagen- und Objekteinstellungen, Abfrageindexfelder und Hostregeln begrenzen die Übertragung |
| Speicherprofil, Schrittweite, Archive der Datenvorlage | Nur Datenbank | Vorhandene Dateien behalten die Struktur, mit der sie erstellt wurden |
| Zu einer Datenvorlage hinzugefügte Felder | Nur Datenbank | Vorhandene Dateien haben keinen Speicherplatz dafür |
| Inhalt von Gerätevorlagen | Separate Synchronisierung | Das bloße Ändern von Verknüpfungen synchronisiert vorhandene Geräte nicht |

Die Weitergabe in der Datenbank hängt vom Speicherpfad und den Überschreibregeln ab. Das Aktualisieren von Vorlagen-Metadaten migriert vorhandene RRD-Dateien nicht automatisch; die Dateipflege ist ein separater Vorgang. Einige Strukturparameter sind im Editor aktiver Datenvorlagen schreibgeschützt. Siehe [Benutzerdefinierte Vorlagen erstellen](/de/guides/create-custom-templates/).

## Gerätevorlagen besitzen einen expliziten Synchronisierungspfad

Das Bearbeiten der Verknüpfungen einer Gerätevorlage ändert das Angebot für neue Geräte. Bestehende Geräte erfordern eine separate Synchronisierungs- bzw. Neuübernahme-Operation. Die Massenverarbeitung wählt standardmäßig Geräte im Zustand Up oder Recovering aus, sofern inaktive Systeme nicht explizit eingeschlossen werden; überprüfen Sie die Auswahl vorab.

Die Synchronisierung fügt fehlende Diagrammvorlagen-Verknüpfungen hinzu, aktualisiert ausgewählte Datenabfragen und kann ungenutzte Verknüpfungen entfernen. Sie löscht vorhandene Diagramme nicht direkt, nur weil deren Vorlage aus der Gerätevorlage entfernt wurde. Zudem löst sie Automatisierungs- und Plugin-Hooks aus und kann daher konfigurierte Automatisierungsregeln anstoßen.

Überprüfen Sie die Geräteverknüpfungen und Diagramme nach der Synchronisierung. Sie stellen nicht zwingend die dauerhafte Vereinigung aller jemals angewendeten Vorlagenversionen dar.

## Indizes und warum Ports wandern

Eine Datenabfrage muss entscheiden, welches gefundene Objekt zu welcher vorhandenen Datenquelle gehört. Dies ist der Index. Numerische Indizes können sich nach Hardware- oder Konfigurationsänderungen verschieben. Ein passendes stabiles Feld hilft, die Identität zu wahren, doch Schnittstellennamen können umbenannt oder wiederverwendet werden. Prüfen Sie Eindeutigkeit, Beständigkeit und das Neuindexierungs-Verhalten auf dem Gerät selbst; kein Feldname garantiert alleinige Kontinuität.

Diese Entscheidung wirkt beim Treffen banal und wird kostspielig, wenn sie fehlschlägt. Sie wird pro Gerät und Lauf getroffen, sodass zwei identische Switches nach unterschiedlichen Feldern indexiert sein können. Details zur Feldauswahl, dem Verhalten bei verschwundenen Indizes und den Kosten der Umnummerierung finden Sie unter [Datenabfragen und Indizes](/de/concepts/data-queries-and-indexes/).

## Vorlagen nachträglich ändern

Diagrammänderungen wirken sich nach dem Speichern und der Weitergabe auf nachfolgende Renderings aus. Überschreibungen und Zwischenspeicher können die Anzeige beeinflussen; gehen Sie nicht davon aus, dass jedes Diagramm sofort wechselt. Prüfen Sie ein repräsentatives untergeordnetes Diagramm und dessen Zuordnungen; siehe [Diagrammdarstellung anpassen](/de/guides/tune-graph-appearance/).

Das Speichern einer Datenvorlage passt bestehende RRD-Dateien nicht automatisch an. Die tatsächlichen Definitionen und Archive der Datei können vom Datenbankprofil abweichen. Prüfen Sie beides vor Wartungsarbeiten; das Neuanlegen einer Datei ist nur eine Option.

Je nach Änderung können RRDtool-Anpassungen, Archiv-Größenänderungen oder kontrollierte Dump/Restore-Arbeiten den bestehenden Verlauf ganz oder teilweise retten. Diese Vorgänge haben Grenzen, erfordern Backups und Validierung; sie rekonstruieren keine Daten, die nie gespeichert wurden. Das Löschen und Neuerstellen verliert den gesamten Verlauf. Siehe [Datenaufbewahrung verwalten](/de/guides/manage-data-retention/) und [Datenquellen und Round-Robin-Archive](/de/concepts/data-sources-and-rras/).

## Weitere Vorlagenbegriffe

Vier weitere Objekte tragen diesen Begriff im Namen, verhalten sich jedoch völlig anders. Farbvorlagen sind benannte Paletten für Diagrammelemente. Aggregatvorlagen beschreiben, wie mehrere Diagramme zusammengefasst werden. Automatisierungsvorlagen weisen erkannte Geräte einer Gerätevorlage zu. Diagramm-Voreinstellungen liefern wiederverwendbare Legendenformate.

Keines davon befindet sich in dem hier beschriebenen Schichtenmodell. Es ist nützlich, sie zu kennen, um Suchergebnisse richtig einzuordnen.
