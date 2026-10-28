---
title: Gegevensquery's en indexen
description: Hoe één doorloop van een apparaat meerdere gegevensbronnen oplevert, wat een index werkelijk is en wat er gebeurt als een apparaat zichzelf hernummert.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
sidebar:
  order: 5
---

Voor een eenvoudige gegevensbron moet u vóór de configuratie weten wat u meet.
Voor een gemiddelde belasting werkt dat prima. Voor switchpoorten, schijven,
temperatuursensoren of virtuele machines werkt dat niet, omdat de lijst verandert
en u er geen controle over heeft.

Een gegevensquery ontdekt de beschikbare objecten. Het maken van grafieken – handmatig
of via geconfigureerde automatisering – selecteert welke objecten gegevensbronnen krijgen;
een uitgevoerde query alleen maakt niet elke mogelijke grafiek aan.

## Wat een querydefinitie bevat

Een gegevensquery is een XML-beschrijving die uit drie delen bestaat: waar de lijst met
dingen zich bevindt, wat er over elk onderdeel moet worden gelezen en hoe wordt besloten
welk onderdeel welk is.

De interfacequery die met Kadupul wordt meegeleverd, dient als uitgewerkt voorbeeld.
Deze doorloopt `.1.3.6.1.2.1.2.2.1.1` om interfaces op te sommen en leest vervolgens
op elke geretourneerde positie een reeks benoemde velden uit. Elk veld declareert een
richting.

| Richting | Betekenis | Interfacevoorbeelden |
|---|---|---|
| `input` | Gelezen voor identificatie en naamgeving. Wordt niet in de loop van de tijd verzameld | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Een waarde die de moeite waard is om elke cyclus te verzamelen | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Beide | `ifOperStatus`, `ifAdminStatus` |

Velden geven ook aan hoe de waarde moet worden gelezen. De meeste nemen de waarde letterlijk
over; sommige passen een reguliere expressie toe om een getal uit een SNMP-opsomming te
halen, en andere vragen om de waarde als tekst in plaats van als ruwe bytes te decoderen.

Het uitvoeren van de query slaat één rij per index per veld op: het apparaat, de query,
de veldnaam, de waarde en de positie waar de waarde vandaan kwam. Die tabel is het antwoord
op de vraag "wat heeft dit apparaat?", gecachet tot de volgende uitvoering. De grafiekselectie
maakt gebruik van die cache, maar tools voor grafiekaanmaak kunnen een query ook koppelen
of opnieuw uitvoeren. Inspecteer de detectieresultaten voordat u grafieken toevoegt.

## De index is een identiteitsproblem

De positie in een SNMP-tabel is geen naam. Het is een slotnummer dat door de agent wordt
uitgegeven, en agents herordenen slots na een herstart, het opnieuw plaatsen van een kaart,
een firmware-upgrade of een configuratiewijziging waarbij een interface wordt verwijderd.
Als een gegevensbron alleen "slot 3" onthoudt, is de dag waarop slot 3 een andere poort
wordt de dag waarop drie maanden geschiedenis stilletjes aan het verkeerde object wordt gekoppeld.

Kadupul slaat het indextype en de identificerende waarde op, samen met de momenteel
opgeloste SNMP-index. Herindexering gebruikt de identiteit om de huidige tabelpositie
op te zoeken; handmatig overschreven indextypen worden apart verwerkt.

Bij elke uitvoering van de query wordt het huidige slot voor die veldwaarde opgezocht.

| Resultaat | Wat er gebeurt |
|---|---|
| Zelfde slot | Niets te doen |
| Ander slot | De gegevensbron wordt opnieuw toegewezen aan het nieuwe slot en de bijbehorende grafieken volgen |
| Waarde niet meer aanwezig | De afhandeling van verweesde items hangt af van de query en het codepad; controleer de resulterende vlag en polling-OID's in plaats van aan te nemen dat de verzameling is gestopt |

Herindexering behoudt normaal gesproken de gegevensbron en de bestaande geschiedenis.
De optie `index_transient` behandelt ontbrekende identiteiten als verwacht en slaat de
gewone markering als verweesd over. `index_orphan_removal` verwijdert getroffen
polling-items en Boost-uitvoer; het verwijdert de gegevensbron of het RRD-bestand zelf niet.

De huidige afhandeling van verweesde items heeft een defect: wanneer een identiteit
verdwijnt en geen enkele andere bron van index verandert, kan de tak zonder wijzigingen
de verweesde vlag weer wissen terwijl de vorige index en polling-OID's blijven staan.
Vertrouw niet op automatische maskering van verweesde items om verzameling vanaf een
hergebruikte poortindex te voorkomen. Verifieer de opgeslagen identiteit aan de hand
van de detectiegegevens en schakel de getroffen gegevensbron uit totdat het probleem is opgelost.

## Het veld kiezen als sleutel

Niet elk veld is geschikt als sleutel. De querydefinitie levert een geordende voorkeurslijst,
en Kadupul doorloopt deze en kiest de eerste kandidaat die een reeks controles doorstaat.

| Controle | Waarom deze bestaat |
|---|---|
| Het veld is `input` of `input-output` | Identificerende velden moeten beschikbaar zijn bij detectie |
| Geen twee indexen delen dezelfde waarde | Een dubbele sleutel kan niet één rij identificeren |
| Het aantal unieke waarden is gelijk aan het aantal indexen | Wijst onvolledige dekking van kandidaten af |

Deze controles kennen uitzonderingen: een enkele gedeclareerde kandidaat keert direct terug,
en de ruwe index-OID wordt afzonderlijk geaccepteerd. `index_type=nonunique` slaat de
afwijzing van dubbele waarden over, maar slaat de controle op het aantal unieke waarden
niet over. Inspecteer het geselecteerde veld en de gecachete waarden; het XML-typelabel
alleen is geen bewijs van validatie.

De interfacequery geeft de voorkeur aan `ifName`, vervolgens `ifDescr`, daarna het
hardwareadres en ten slotte de ruwe index. Die volgorde is opzettelijk. `ifName` is kort
en stabiel op de meeste platforms. `ifDescr` is stabiel, maar bevat soms het slotnummer
in de tekst, wat het doel voorbijschiet. De ruwe index staat achteraan omdat sleutelen
daarop nauwelijks beter is dan helemaal niet sleutelen.

Dit is het punt waar mensen vaak door worden verrast. De keuze wordt gemaakt per apparaat
per uitvoering, op basis van de actuele gegevens van dat apparaat. Ontbrekende gecachete
waarden of dubbele namen kunnen `ifName` ongeschikt maken en terugval naar `ifDescr`
veroorzaken. Een leeg veld toont op zichzelf niet aan welke controle is mislukt; inspecteer
de werkelijke detectierijen. Twee identieke switches kunnen uiteindelijk op verschillende
velden worden gesleuteld, en een apparaat kan tussen twee uitvoeringen wisselen van veld.
Kadupul registreert een waarschuwing wanneer het gekozen veld verandert, omdat dit het
moment is waarop hertoewijzingsfouten mogelijk worden.

Het gekozen veld bepaalt meestal ook de namen van grafieken via een titelindeling die
ernaar verwijst. Als uw grafiektitels binnen een vloot van karakter veranderen, is het
sorteerveld de plek om te zoeken.

## Detecteren dat herindexering nodig is

Het opnieuw uitvoeren van een gegevensquery voor elk apparaat in elke cyclus zou kostbaar
en grotendeels zinloos zijn, aangezien de meeste apparaten jarenlang niets hernummeren.
In plaats daarvan heeft elk apparaat-en-querypaar een herindexeringsmethode, wat een goedkope
bewering is die tijdens de normale verzameling wordt gecontroleerd. Wanneer de bewering
faalt, wordt een herindexering in de wachtrij geplaatst.

| Methode | Wat het controleert | Beperkingen en kosten |
|---|---|---|
| Geen | Geen automatische bewering | Query's moeten handmatig of via een andere expliciete actie opnieuw worden uitgevoerd |
| Uptime | Uptime is niet teruggelopen | Vereist bruikbare SNMP; mist wijzigingen zonder uptime-terugval |
| Indexaantal | Huidig aantal komt overeen met gecachete indexen | Een OID voor aantal kan goedkoop zijn; zonder OID telt de implementatie een walk- of scriptresultaat. Wijzigingen met gelijkblijvend aantal kunnen worden gemist |
| Alles verifiëren | Bekende sleutelwaarden komen nog steeds overeen op hun gecachete indexen | Werk groeit mee met de gecachete set; garandeert geen detectie van nieuw toegevoegde indexen of semantische wijzigingen die die waarden behouden |

„Alles verifiëren“ controleert beweringen tijdens het pollen; het voert niet onvoorwaardelijk
de hele detectiequery in elke cyclus opnieuw uit. Meet de kosten op representatieve apparaten
vóór grootschalig gebruik. Uptime is een gebruikelijke standaardwaarde, maar biedt geen
bewering wanneer SNMP is uitgeschakeld. De querydefinitie kan een eigen bron voor uptime
of aantal leveren.

## Herindexering gebeurt asynchroon

Een mislukte bewering leidt niet onmiddellijk tot een herindexering. Er wordt een opdracht
weggeschreven, en een aparte doorgang na de verzamelingscyclus pakt die opdracht op en voert
de query opnieuw uit. Het is verstandig om rekening te houden met de praktische gevolgen.

De detecterende cyclus kan nog steeds de oude cache gebruiken, waardoor een waarde op de
verkeerde reeks kan belanden voordat de herindexering is voltooid. Uptime-gerelateerde
piekonderdrukking vervangt uitvoer van één waarde door onbekend wanneer de vlag is ingesteld;
dit is geen garantie voor alle meerwaardige uitvoer of elke indexwijziging.

Een herindexering wordt niet uitgevoerd voor een apparaat dat offline of uitgeschakeld is.
Een apparaat dat tijdens onbereikbaarheid is hernummerd, heeft nog steeds een bewering of
expliciete heruitvoering nodig nadat het weer bereikbaar is geworden. De eerste succesvolle
poll alleen bewijst niet dat de hertoewijzing is voltooid. `--force` overschrijft de
controles op offline/uitgeschakeld niet.

Zodra de query opnieuw wordt uitgevoerd, worden voor de verplaatste gegevensbronnen de
pollercache-items herschreven, wat de verzameling daadwerkelijk omleidt. Dat mechanisme
is [De pollercache](/nl/concepts/the-poller-cache/), en een heruitvoering van een query is
een van de weinige zaken die dit automatisch bijwerkt.

Voor de operationele kant – het toevoegen van een query aan een apparaat en het lezen van de
resultaten – zie [Een switch bewaken](/nl/guides/monitor-a-switch/).
