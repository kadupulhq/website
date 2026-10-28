---
title: Externe gegevensverzameling
description: Waarom verzameling distribueert en opslag niet, wat een externe collector beheert en wat het kost om een tweede kopie van de configuratie te hebben.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 9
---

:::caution[Overgenomen RRDtool-proxygedrag]
Implementatie van de RRDtool-proxy wordt niet ondersteund in Kadupul. Gebruik lokale RRDtool-opslag
(`storage_location = 0`). Proxy-instellingen, protocolbeschrijvingen en werkstromen op deze
pagina documenteren overgenomen gedrag, geen ondersteund implementatie- of migratiepad.
Zie [RRDtool-proxy](/nl/reference/rrdproxy/).
:::

Verzameling is het deel dat niet op één machine past. Het grootste deel van een polling-ronde
wordt besteed aan het wachten op antwoord van apparaten, en wachten laat zich niet comprimeren.
U kunt meer overlap creëren met meer processen en threads, tot het punt waarop de verzamelende
host zonder CPU komt te zitten of de retourtijd naar een verre locatie alles overheerst.

Een externe collector is dezelfde code met een ander collector-id, die een subset van apparaten
pollt. Elk apparaat noemt de collector die ervoor verantwoordelijk is. Die toewijzing vormt de
normale planningstoewijzing. Houd de apparaattoewijzing en gerepliceerde poller-cache consistent;
deze planningskeuze bewijst niet dat elke resultaatschrijfactie collector-eigenaarschap afdwingt.

Voor de vraag *wanneer* u een collector moet inzetten, zie
[De poller schalen](/nl/guides/scale-the-poller/). Deze pagina legt uit wat een collector is.

## Waarom een collector een eigen database heeft

Een collector die zijn takenlijst via het netwerk uit de centrale database leest, stopt met
verzamelen zodra het netwerk uitvalt. Dat is het tegenovergestelde van waarvoor u een externe
collector wilde.

Daarom heeft hij een lokale database met een eigen kopie van de configuratie: instellingen,
sjablonen, gegevensinvoermethoden, gegevensquery's, zijn deel van de poller-cache, zijn apparaten,
de pluginconfiguratie en de gebruikers- en machtigingstabellen. Die kopie wordt vanuit de
hoofdinstallatie uitgerold. Beschouw de hoofdinstallatie als de configuratie-autoriteit, terwijl de
collector de lokale operationele status en machine-instellingen beheert.

Padinstellingen zijn uitgesloten van de kopie, samen met de statistieken per ronde die de
hoofdinstallatie voor zichzelf bijhoudt. Paden zijn eigenschappen van een machine, niet van de
totale installatie.

## Replicatie is periodiek, dus configuratie loopt achter

De hoofdpoller controleert ingeschakelde externe collectors met een niet-lokale databasehost en
een synchronisatie-interval ongelijk aan nul. Een collector is aan de beurt als deze nog nooit
gesynchroniseerd is, het interval verstreken is of gemarkeerd is als synchronisatie vereisend.
Een interval van nul sluit hem uit van deze periodieke controle, zelfs als synchronisatie vereist is.

De wereldwijde standaard is twee uur; een collector kan een eigen interval hebben. Dit garandeert
niet dat elke wijziging twee uur wacht: apparaat- en pluginbewerkingen hebben ook gerichte
replicatiepaden. Succesvolle verspreiding hangt af van die bewerking, connectiviteit en de
geselecteerde tabellen. Controleer de feitelijke configuratie en cache van de collector in plaats
van onmiddellijke consistentie of een vaste vertraging aan te nemen.

Volledige replicatie kan worden aangevraagd vanaf de hoofdcollector met
`php cli/poller_replicate.php`, wanneer ingeschakelde externe collectors zijn geconfigureerd.
Het repliceert elke ingeschakelde externe collector, tenzij `--poller=N` er één selecteert.
Zie [De poller schalen](/nl/guides/scale-the-poller/) en
[Migreren naar nieuwe hardware](/nl/guides/migrate-to-new-hardware/) voor operationele context.

## Drie verbindingsmodi

Een collector bepaalt bij het opstarten hoe hij zich gaat gedragen, op basis van of de centrale
database antwoordt en of hij samples vasthoudt die nog niet zijn afgeleverd.

| Modus | Voorwaarde | Gedrag |
|---|---|---|
| Online | Centrale database verbindt en er is geen lokale Boost-achterstand gedetecteerd | Resultaatschrijfacties zijn gericht op de centrale database |
| Offline | Centrale verbinding mislukt of is geforceerd offline | Verzameling gebruikt lokale buffering, mits lokale diensten gezond blijven |
| Herstel | Centrale database verbindt en er blijven lokale Boost-rijen over | Nieuwe samples blijven lokaal terwijl een achtergrondproces de achterstand overdraagt |

Offline is geen fouttoestand. Het is het ontworpen gedrag van een collector waarvan de verbinding
verbroken is, en het is de reden waarom een collector überhaupt een lokale database heeft. De
verzameling gaat door op basis van de lokaal beschikbare configuratie. Lokale databasecapaciteit,
apparaattoegang, scheduler-status en bruikbare inloggegevens zijn nog steeds vereist; de
offline-modus garandeert geen ononderbroken verzameling of uiteindelijke aflevering.

## Hoe resultaten de hoofdinstallatie bereiken

Resultaten reizen niet als RRD-schrijfacties, maar als rijen.

Uitgesteld schrijven naar RRD is vereist wanneer er meer dan één collector is, en het toevoegen
van een ingeschakelde externe collector zorgt ervoor dat de hoofdpoller uitgesteld bijwerken inschakelt.
Het opstartpad schakelt ook systeem-Boost en omleiding in wanneer er meerdere collector-records
bestaan. Deze instellingen valideren op zichzelf geen werkende implementatie.
Zie [Schrijfacties met hoog volume](/nl/concepts/high-volume-writes/) voor wat die modus doet.

Online voegt een collector zijn samples rechtstreeks in de centrale buffertabel in. De
hoofdinstallatie schrijft ze volgens haar eigen schema naar RRD-bestanden, precies zoals ze zou
doen voor samples die ze zelf heeft verzameld. De samples van de collector zijn niet bijzonder
zodra ze binnenkomen.

Offline en tijdens herstel hopen samples zich op in de lokale Boost-wachtrij. Wanneer de centrale
database weer bereikbaar is, voegt `poller_recovery.php` gebufferde rijen in de centrale
Boost-wachtrij in, waarbij de uitvoer van een rij die daar al bestaat wordt bijgewerkt.

Herstel verwijdert een lokale rij pas nadat de centrale invoeging voor het bijbehorende pakket is
geslaagd, en alleen wanneer de lokale rij nog overeenkomt met wat is verzonden. Een mislukte
invoeging, een te groot sample of een rij die tijdens het opruimen is gewijzigd, laat de lokale
samples staan voor de volgende poging. Deze pagina beschrijft geen gevalideerde herstelprocedure
voor meerdere collectors.

De herstelinvoegingen bevatten gegevensbron-id's, namen, tijdstempels en waarden; ze controleren
die rijen niet tegen collectortoewijzingen. Vertrouw niet op een universele overdrachtsafwijzing
om u te beschermen tegen verouderde toewijzingen of overlappende producenten. Valideer toewijzingen
en cachestatus voordat u de verzameling inschakelt.

## Opslag distribueert niet

De overgenomen proxygebaseerde werkstroom houdt RRD-bestanden centraal en verwacht dat collectors
deze via de RRDtool-proxy bereiken. Die werkstroom wordt niet ondersteund in Kadupul; beschouw
deze niet als implementatieadvies. Een gevalideerd opslagpad voor meerdere collectors met behulp
van lokale RRDtool moet worden gedocumenteerd voordat een vervanging kan worden aanbevolen.

Dit is het deel waar mensen het vaakst door verrast worden, dus het is goed om er direct over te
zijn: **Externe collectors verdelen het wachten, niet het schrijven.** Als de limiet die u bereikte
de schijf onder de RRD-boom was, neemt extra verzamelcapaciteit die limiet niet weg. Meer inkomende
samples kunnen de centrale database en de achterstand van schrijvers vergroten.

## Wat er nog meer terugvloeit

Een collector beheert de operationele status van zijn apparaten: bereikbaarheid, de laatste fout,
retourtijden, poll-aantallen, beschikbaarheid. Hij schrijft deze lokaal tijdens het pollen en
stuurt geselecteerde operationele kolommen in bulk naar de hoofdinstallatie. Dit werkt die kolommen
bij, niet de gehele configuratierij van het apparaat.

Wat de hoofdinstallatie laat zien voor de bereikbaarheid van een apparaat, is dus de weergave van
de collector op het moment van de laatste succesvolle push. Een collector die offline is, heeft
een actuele weergave van zijn eigen apparaten die niemand op de hoofdinstallatie kan zien.

De hoofdinstallatie volgt collectors op dezelfde manier als een collector apparaten volgt. Een
liveness-helper beschouwt een ingeschakelde externe collector alleen als actief wanneer de laatste
statustijdstempel minder dan tweemaal het geconfigureerde polling-interval oud is. Deze controle
bewijst geen aflevering van samples, succesvolle replicatie of actuele grafieken.

## Foutmodi

| Wat faalt | Wat er gebeurt | Wat u merkt |
|---|---|---|
| Verbinding naar de hoofdinstallatie | Collector kan lokaal doorgaan zolang database en scheduler gezond blijven | Vertraagde grafieken en groeiende wachtrij; aflevering en verlies moeten worden gecontroleerd |
| De collector zelf | Toegewezen apparaten worden mogelijk niet meer gepolld | Ontbrekende samples; onderzoek status van scheduler, apparaten en collector |
| Replicatie | Collector draait met een oudere configuratie | Wijzigingen lijken geen effect te hebben |
| De centrale database | Externe processen kunnen offline-modus ingaan als verbinding mislukt | Centrale verwerking verstoord; lokale buffering hangt af van lokale gezondheid |
| Overlappende of verouderde toewijzingen | Meerdere producenten kunnen gerelateerde samples indienen | Geen universele overdrachtsafwijzing; controleer toewijzingen, tijdstempels en schrijffouten |

Buffering kan sommige storingen omzetten in vertragingen, maar maakt de aflevering niet verliesvrij.
Controleer de leeftijd van de wachtrij, databasecapaciteit, herstelfouten en de resulterende
RRD-tijdstempels. Een vlakke grafiek alleen kan een apparaatstoring niet onderscheiden van een
vertraagde of mislukte aflevering.

## Wat het kost

Vergeleken met een enkele centrale poller:

**U wint** parallelle apparaatretourtijden over meerdere machines, polling die dicht bij de apparaten
plaatsvindt in plaats van over een WAN, en de mogelijkheid om lokaal te blijven verzamelen wanneer
de hoofdinstallatie onbereikbaar is, onderhevig aan de bovenstaande herstel- en gezondheidslimieten.

**U betaalt** met configuratiereplicatie die kan achterlopen, een tweede database per collector
om te beheren, bewaken en back-uppen, een uitgestelde schrijfmodus die niet langer optioneel is,
en een centrale database die nu gelijktijdige schrijfacties van elke collector ontvangt.

De eerlijke samenvatting is dat een externe collector een machine is die u nu moet beheren. Eén
poller met meer processen is een instelling. Een collector is infrastructuur, met een eigen database,
eigen inloggegevens, een eigen klok en een eigen versie van de waarheid zolang de replicatie niet
heeft gedraaid.
