---
title: De eerste grafiek lezen
description: Wat de lijnen werkelijk betekenen en de drie fouten waardoor mensen ze verkeerd interpreteren.
sidebar:
  order: 4
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
---

Een grafiek is hier geen directe weergave van je gegevens. Het is een weergave van een samenvatting van je gegevens, en weten welke samenvatting wordt gebruikt is essentieel.

## Waar je naar kijkt

Elke grafiek wordt getekend vanuit een round-robinarchief. Het archief slaat recente metingen op in volledige resolutie en oudere metingen geconsolideerd in grovere intervallen. Wanneer je uitzoomt naar een jaar, zie je niet elke meting van vijf minuten. Je ziet één waarde per interval, gekozen door een consolidatiefunctie.

Die functie is meestal het gemiddelde. Het kan ook het maximum of het minimum zijn. Dit is belangrijker dan al het andere op deze pagina.

Voor een gewone grafiekaanvraag op aanvraag stelt Kadupul een RRDtool-opdracht samen vanuit de configuratie van de grafiek en voert deze uit op de bestanden op schijf. Drie soorten regels gaan in die opdracht en het helpt om te weten welke wat doet.

| Onderdeel | Wat het doet |
|---|---|
| Een definitie | Benoemt een bestand, een gegevensbron daarin en een consolidatiefunctie |
| Een tekenelement | Zet één reeks om in een lijn, een vlak of een band in een stapel |
| Een legendaelement | Drukt één getal af, berekend over het venster dat je bekijkt |

De volledige opbouw wordt beschreven in [Hoe grafieken worden getekend](/nl/concepts/how-graphs-are-drawn/). Dat heb je vandaag nog niet nodig. Je moet weten dat de grafiekdefinitie en het opgevraagde tijdsbereik de uiteindelijke afbeelding bepalen. Caching en realtime grafiekpaden kunnen zich anders gedragen.

## Begin met de afgelopen vier uur

Begin met een kort recent venster. Het geselecteerde archief hangt af van bewaartermijn, stapgrootte en grafiekresolutie; vier uur garandeert geen ruwe of ongeconsolideerde gegevens. Zelfs het fijnste archief bevat tijdgenormaliseerde waarden. Gebruik de debug-opdracht van de grafiek en `rrdtool info` om de gevraagde functie en beschikbare archiefstappen te controleren voordat je waarden vergelijkt.

Twee kenmerken van een nieuwe grafiek zijn normaal, maar verontrusten mensen vaak onnodig.

**De lijn kan eindigen vóór het huidige tijdstip.** Het huidige interval kan nog onvolledig zijn. Timing van verzameling, buffering en normalisatie kunnen het zichtbare eindpunt ook vertragen. Controleer of de updatetijdstempels vooruitgaan in plaats van een vaste vertraging als bewijs van een goede werking te zien.

**Het eerste stuk kan ontbreken.** Een gegevensbron die een uur geleden is aangemaakt, heeft één uur aan gegevens en elf maanden niets. Het archief wordt bij creatie volledig toegewezen, dus het lege deel is reële opslagruimte die wacht om te worden gebruikt.

## Verbreed het bereik en zie de piek veranderen

Verbreed het bereik naar een week. Pieken kunnen kleiner worden wanneer de grafiek grovere gemiddelden selecteert. Als het gebruik bijvoorbeeld gedurende vijf minuten 100% is en nul voor de resterende 55 minuten, is het uurgemiddelde ongeveer 8,3%. Een piek van vier minuten in een verder inactief uur levert een gemiddelde op van ongeveer 6,7%. Korte pieken kunnen al binnen het oorspronkelijke bemonsteringsinterval zijn afgevlakt.

Consolidatie verwijdert details. Als de geschiedenis met hoge resolutie is verlopen, kan inzoomen deze niet reconstrueren vanuit een archief met gemiddelden.

Dit is de eerste van de drie fouten, en degene die de meeste discussies veroorzaakt.

**Een gemiddelde aanzien voor een piek.** Als je geïnteresseerd bent in verzadiging, kijk dan naar een grafiek die is gebouwd op het maximum, niet op het gemiddelde. Dat werkt alleen als de archieven maxima opslaan. Als er alleen nog grove gemiddelden over zijn, kunnen de oorspronkelijke pieken niet worden gereconstrueerd. Een MAX-archief bewaart maxima van de tijdgenormaliseerde invoerpunten, geen ongeziene kortstondige piek tussen polls.

Er is hier een stil falen dat goed is om te weten. Als een grafiekitem vraagt om maxima en het bestand heeft die niet, kan de selectiehulp van Kadupul terugvallen op de eerste beschikbare functie, of AVERAGE wanneer de beschikbare functies niet kunnen worden bepaald. De afbeelding ziet er goed uit, maar beantwoordt een andere vraag.

**Een onderbreking aanzien voor een nul.** Een onderbreking vertegenwoordigt een onbekende getekende waarde. Oorzaken zijn onder meer ontbrekende updates, expliciet onbekende invoer, geweigerde waarden en grafiekexpressies. Het is geen unieke identificatie van een onbereikbaar apparaat.

Heartbeat is de maximaal toegestane tijd tussen updates, geen extra tijd die bij de stap wordt opgeteld. Een stap van 300 seconden met een heartbeat van 600 seconden staat bijvoorbeeld maximaal 600 seconden toe tussen updates, niet 900. Drempelwaarden voor onbekende gegevens in het archief beïnvloeden ook zichtbare onderbrekingen. Zie [RRDtool’s data-source definitions](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) en [Tijd en intervallen](/nl/concepts/time-and-intervals/).

Pas hier op voor gestapelde grafieken. Sommige sjablonen vervangen onbekende waarden door nul in hun grafiekexpressies. Op die grafieken zien een storing en een rustige periode er opzettelijk hetzelfde uit. Controleer een niet-gestapelde weergave voordat je concludeert dat een dienst stillag.

**Twee grafieken met verschillende verticale schalen vergelijken.** Twee grafieken naast elkaar schalen elk naar hun eigen gegevens. Een kleine hobbel en een grote kunnen er identiek uitzien. Controleer de as voordat je conclusies trekt.

Terwijl je naar de as kijkt, controleer dan ook de basis. Een grafiek kan labels weergeven in duizendtallen of in eenheden van 1024. De opgeslagen getallen zijn identiek; alleen de labels verschuiven. Het verschil hangt af van het voorvoegsel: 1024 tegenover 1000 is 2,4% voor de eerste macht en groeit bij grotere voorvoegsels. Controleer ook bits tegenover bytes, grafiekexpressies en consolidatie; een percentageverschil alleen verklaart de oorzaak niet.

## De legenda lezen

De legenda bevat de getallen die belangrijker zijn dan de vorm van de grafiek. “Huidig” is normaal gesproken de LAST-reductie van de geselecteerde reeks, wat geen meting hoeft te zijn die is genomen op het exacte moment dat je de grafiek bekijkt. Gemiddelde en maximum worden berekend over het venster dat je bekijkt, niet over alle tijd, dus ze veranderen als je zoomt.

De standaard meegeleverde legendaregels zijn minimum, maximum, gemiddelde en laatste, die het label huidig heeft. Twee aspecten daarvan verrassen mensen vaak.

**Een getal in de legenda is een reductie van wat getekend is, niet van wat opgeslagen is.** Een maximum dat wordt afgedrukt over een reeks die met gemiddelden is gelezen, is een maximum van die afgeleide gemiddelden bij de geselecteerde resolutie. Het is niet de hoogste meting ooit. Op een drukke verbinding zijn dat heel verschillende getallen, en beide zijn legitieme antwoorden op verschillende vragen.

**Controleer welke reeks de legenda gebruikt.** Gewone GPRINT-regels kunnen de reeks van een voorafgaand getekend item overnemen; speciale items voor minimum, maximum, gemiddelde en laatste worden afzonderlijk verwerkt. Het wijzigen van de volgorde van items in een grafieksjabloon kan daarom veranderen wat de legenda rapporteert, zonder dat iemand de legenda heeft bewerkt. Als een getal verandert na een niet-gerelateerde sjabloonbewerking, controleer dan eerst de volgorde van de items.

## Wanneer een grafiek er niet goed uitziet

Controleer het verzamelpad in deze volgorde; er kan een fout optreden in meer dan één fase.

1. Antwoordt het apparaat op dit moment?
2. Draait de poller en rondt deze af binnen zijn interval?
3. Heeft het RRD-bestand een recente updatetijd?
4. Leest de grafiek de gegevensbron die je verwacht?

Concreet:

**Stap 1.** Voer dezelfde `snmpget` uit die je hebt uitgevoerd bij het toevoegen van het apparaat, vanaf de toegewezen collector. Als dit mislukt, los dan die verzamelfout op voordat je de grafiek beoordeelt.

**Stap 2.** Zoek naar het overzicht aan het einde van de cyclus. Als dit ontbreekt, controleer dan de taakplanning, de geconfigureerde logbestemming en vroege poller-storingen. Een run die langer duurt dan het interval kan updates vertragen; vergelijk de resulterende onderbreking met de heartbeat.

**Stap 3.** Vraag het rechtstreeks aan RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` meldt de tijdstempel van de laatste update, inclusief updates met onbekende waarden; gebufferde schrijfbewerkingen kunnen dit vertragen. Gebruik `lastupdate` en `fetch` om waarden te inspecteren zoals beschreven in de apparatengids. `info` vertelt je de stapgrootte, de heartbeat, het type gegevensbron en welke archieven er bestaan. Als het bestand geen archief van maxima heeft, lost dat de bovengenoemde piekvraag op.

**Stap 4.** Schakel de foutopsporingsmodus van de grafiek in en lees de opdracht die de grafiek genereert. Deze benoemt de bestanden, de gegevensbronnen daarin en de consolidatiefunctie voor elk. Een grafiek die naar een andere gegevensbron wijst dan je verwacht, komt vaak voor nadat sjablonen opnieuw zijn toegepast of interfaces opnieuw zijn geïndexeerd.

## Symptomen en wat ze meestal betekenen

| Wat je ziet | Meestal |
|---|---|
| Vlakke lijn op nul | Kan een echte nul zijn of een expressie die onbekend vervangt door nul |
| Lijn stopt en gaat dan verder | Een onbekende waarde onderbrak de getekende reeks; controleer verzameling en grafiekexpressies |
| Overal kleine onderbrekingen | Poller rondt te laat af, of een heartbeat is te dicht bij de stapgrootte ingesteld |
| Piek zichtbaar bij vier uur, afwezig bij één week | Controleer archiefresolutie en consolidatie voordat je gegevensverlies of een verzamelfout aanneemt |
| Legendamaximum lager dan de getekende piek | De legenda reduceert een andere reeks dan je denkt |
| Hele grafiek leeg, geen fout | Geen gegevensbron erachter, of er is nog niets verzameld |
| Waarden een orde van grootte verkeerd | Verkeerd type gegevensbron, of 32-bits tellers lopen over |
| Twee grafieken van één verbinding wijken licht af | Verschillende asbasis, of verschillende consolidatie |

[Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/) volgt hetzelfde pad met meer diepgang. [Grafiekweergave aanpassen](/nl/guides/tune-graph-appearance/) behandelt het wijzigen van hoe een grafiek eruitziet zodra je vertrouwt op wat deze toont.

Dat is de introductie. Je hebt een installatie, een apparaat dat antwoordt en een grafiek die je kunt lezen. Vanaf hier behandelen [Praktijkgidsen](/nl/guides/monitor-a-switch/) specifieke taken, en leggen [Concepten](/nl/concepts/architecture/) uit waarom het systeem zich zo gedraagt.
