---
title: Schrijfbewerkingen met hoog volume
description: Waarom RRD-updates worden beperkt door het aantal schrijfbewerkingen in plaats van de omvang, wat batchverwerking oplevert en wat het kost aan versheid.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
sidebar:
  order: 10
---

RRD-updates raken veel bestanden en kunnen worden beperkt door opslaglatentie en I/O-bewerkingen,
niet alleen door overdrachtsbandbreedte. Uitgestelde schrijfbewerkingen, ook wel Boost genoemd,
verzamelen metingen in de database en verwerken updates per bestand in batches. Meet de schrijver
en de database voordat u hiervoor kiest: hiaten in grafieken wijzen niet automatisch op een opslagknelpunt.

## Het standaardpad

Collectors voegen resultaten in de actieve wachtrij `poller_output` in. De schrijver groepeert
metingen op bestand en tijdstempel, werkt de RRD bij en volgt bevestigingen voordat in aanmerking
komende metingen worden verwijderd. Mislukte schrijfbewerkingen kunnen rijen achterlaten voor nieuwe
pogingen, zodat de wachtrij niet beperkt is tot de huidige polling-doorgang.

In de onderzochte revisie gebruikt deze wachtrij InnoDB. De preflight-controle van de verzameling
wijst een MEMORY-wachtrij af; een herstart van de database gooit vastgelegde rijen niet inherent
weg zoals bij een MEMORY-tabel het geval zou zijn. Duurzaamheid hangt nog steeds af van
databaseconfiguratie, opslagstatus en back-ups. Zie [Veilig upgraden](/nl/guides/upgrade-safely/)
voor wachtrijmigratie en opslagcontroles.

Als ruwe schatting van de belasting betekenen 10.000 afzonderlijke bestanden die elke 300 seconden
worden bijgewerkt gemiddeld ongeveer 33 bestandsupdates per seconde. Werkelijke schrijfbewerkingen
komen in pieken binnen; meerdere gegevensbronvelden kunnen één bestand delen, stappen kunnen
verschillen en het aantal opdrachten is niet gelijk aan het aantal fysieke schijf-I/O-bewerkingen.
Vergelijk de gemeten latentie van de schrijver en de wachtrijleeftijd met het beschikbare pollingvenster.

## Wat batchverwerking verandert

Wanneer uitgestelde schrijfbewerkingen zijn ingeschakeld, plaatst de verzameling metingen in
`poller_output_boost` voor latere verwerking. De batchschrijver groepeert metingen per gegevensbron
in volgorde van tijdstempel en kan meerdere tijdstempels in één RRDtool-updateopdracht verzenden.
Twaalf metingen passen mogelijk in één opdracht, maar dit garandeert geen enkele fysieke schijfbewerking.

De geconfigureerde maximale argumentlengte begrenst update-tekenreeksen; de standaardwaarde is 2.000.
Dit beïnvloedt de batchvorming. Leid uit deze instelling geen specifieke limiet van het besturingssysteem
af: lokale bevestigde schrijfbewerkingen gebruiken een RRDtool-opdrachtstroom, en het werkelijke transport
en de ondersteunde opdrachtgrootte zijn van belang.

De planner komt normaal gesproken in aanmerking wanneer zijn timer afloopt (standaard 60 minuten) of
wanneer het geschatte aantal rijen in de buffer de geconfigureerde drempel overschrijdt (standaard
1.000.000). De schatting van het aantal rijen omvat actieve en archieftabellen. Een aanroep van de
planner moet nog steeds plaatsvinden, en procescontroles, voorbereiding of schrijffouten kunnen het
werk vertragen. Geforceerde uitvoeringen, leegmaken na uitschakeling en grafiekupdates op aanvraag
zijn aanvullende paden; de standaardwaarden vormen geen garantie voor versheid van één uur.

Een interval dat nul is of geen positief geheel getal is, wordt vervangen door 120 minuten;
de normale standaardwaarde is 60 minuten.

## De rotatie en waarom die er is

De batchopzet maakt een lege tabel aan die overeenkomt met de actieve buffer en wisselt de namen
vervolgens om met één enkele `RENAME TABLE`-instructie. De oude actieve tabel wordt een archief
met tijdstempel en producenten richten zich op de vervangende tabel. Dit scheidt de batch van nieuwe
invoegingen, maar databasevergrendelingen en resourceconflicten kunnen de verzameling nog steeds vertragen.

Workers verwerken huidige en bewaarde archieven. Het bovenliggende proces controleert de voltooiing en
status van onderliggende processen; mislukte of niet-verifieerbare uitvoeringen bewaren archieven voor
nieuwe pogingen. Tijdens een geldige opschoning kunnen lege archieven worden verwijderd en kunnen
resterende metingen opnieuw in de actieve buffer worden geplaatst voordat een archief wordt verwijderd.
Een niet-leeg archief wordt niet zomaar weggegooid omdat het proces is beëindigd. Inspecteer zowel de
actieve wachtrij als de archiefwachtrij bij het diagnosticeren van een achterstand.

Dit is afhandeling van nieuwe pogingen, geen universele garantie voor crashbestendigheid. Databasefouten,
gelijktijdige activiteit, opslagfouten en back-upconsistentie moeten nog steeds worden gevalideerd in
de omgeving waarin wordt gewerkt.

## Waarom het bekijken van een grafiek bestanden kan bijwerken

Het normale grafiekpad kan proberen updates op aanvraag uit te voeren voor elke gegevensbron waarnaar de
grafiek verwijst voordat deze wordt weergegeven. Het leegt niet onvoorwaardelijk elke openstaande meting:
collectorcontroles, realtime/bron/foutuitvoerpaden, actieve polling-afkappunten, querylimieten en
updatefouten beïnvloeden wat er wordt uitgevoerd. Recente of mislukte metingen kunnen in de wachtrij blijven.

Een grafiek die er actueel uitziet, bewijst daarom niet dat de hele RRD-structuur actueel is, en het
opvragen van een grafiek garandeert geen succesvol herhalen. Controleer schrijffouten, wachtrijleeftijd
en werkelijke RRD-tijdstempels. Back-ups die alleen bestanden omvatten, laten openstaande databasemetingen
buiten beschouwing; zie [Back-up en herstel](/nl/guides/back-up-and-restore/).

## Wat u inlevert

**Versheid van de bestanden.** Metingen blijven in de database totdat ze succesvol zijn verwerkt.
Een gezonde, door een timer gestuurde installatie kan ruwweg één spoelinterval achterlopen; een mislukte
of te krap bemeten schrijver kan langer achterlopen. Maak consistent back-ups van openstaande wachtrijen
en bestanden.

**Een tweede schema.** Bewaak polling en leegmaken afzonderlijk. Observeer actieve rijen, bewaarde
archieven, de leeftijd van de oudste meting, mislukte workers en de doorvoer van de schrijver. Een actieve
tabel hoeft niet leeg te raken terwijl producenten nog steeds gegevens invoegen, en rotatie alleen kan de
tabel kleiner doen lijken zonder dat er RRD-updates zijn voltooid.

**Volgorde.** RRD-bestanden accepteren geen oudere tijdstempels na recentere updates. Het moderne
Boost-pad slaat updates uit het verleden over en het verouderde pad filtert tijdstempels ten opzichte
van de laatste update van het bestand. Een opdracht die als succesvol is bevestigd, kan daarom oude
gegevens overslaan; een late levering garandeert niet dat een meting in de grafiek verschijnt.

**Operationeel oppervlak.** Er is een databasebuffer, een leegmaakproces met een geheugenlimiet, optionele
parallelle workers en bewaarde archieven of opnieuw in de wachtrij geplaatste metingen om te bewaken.
Lokale schrijffouten bewaren metingen over het algemeen voor nieuwe pogingen, maar dit biedt geen
volledige garantie tegen gegevensverlies. Voor het externe herstelpad, zie
[Externe gegevensverzameling](/nl/concepts/remote-data-collection/).

## Wanneer het de moeite waard is

Overweeg uitgestelde schrijfbewerkingen wanneer metingen aantonen dat de RRD-schrijver het knelpunt is en
de database capaciteit heeft voor buffering en batchquery's. Het heft apparaatlatentie niet op en herstelt
geen overbelaste database. Vergelijk doorvoer, wachtrijleeftijd, bestandsversheid en resourcegebruik vóór
en na inschakeling.

De hoofdpoller schakelt uitgesteld bijwerken automatisch in wanneer een ingeschakelde externe
gegevensverzamelaar is geconfigureerd. Die instelling alleen vormt echter geen gevalideerde externe
opslag- of herstelinrichting; hanteer de limieten in
[Externe gegevensverzameling](/nl/concepts/remote-data-collection/).

## Een andere functie met dezelfde naam

Gerenderde grafiekafbeeldingen kunnen ook worden gecachet. Het cachen van afbeeldingen vermindert
herhaald renderen; uitgestelde schrijfbewerkingen bundelen databasemetingen in RRD-updates. Hun
instellingen zijn gescheiden, maar hun uitvoeringspaden beïnvloeden elkaar: grafiekverzoeken kunnen
openstaande metingen controleren voordat een gecachete afbeelding wordt gebruikt, en succesvolle updates
kunnen ertoe leiden dat een nieuwe afbeelding wordt gegenereerd. Evalueer de versheid van afbeeldingen
afzonderlijk van de versheid van wachtrijen en RRD-bestanden.
