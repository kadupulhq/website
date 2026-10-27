---
title: Tijd en intervallen
description: Polling-interval, RRD-stapgrootte, heartbeat en klokafwijking, en waarom de tijdstempel op een meting meer bepaalt dan verwacht.
sidebar:
  order: 7
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
---

Verzameling omvat drie klokken: de cadans van de starter, het polling-interval binnen elke aanroep en de RRD-stapgrootte. Ze hebben compatibele instellingen nodig.

| Nummer | Hoort bij | Hoe het wordt gebruikt |
|---|---|---|
| Starter-interval | Cron, Taakplanner of `cactid.php` | Moet overeenkomen met `cron_interval`, door `poller.php` geïnterpreteerd als 60 of 300 seconden |
| Polling-interval | Verzamelingsruns | `poller.php` berekent een geheel aantal runs per starter-interval |
| Stapgrootte | Een RRD-bestand | Basisnormalisatie-interval, bij aanmaak ingesteld vanuit het gegevensbronprofiel |
| Heartbeat | Een veld in een RRD | Maximaal toegestane tussenruimte tussen updates; aanmaak leest de velddefinitie |

Een starter van 60 seconden en een polling-interval van 10 seconden leveren bijvoorbeeld zes runs per aanroep op. Een starter van 300 seconden en een polling-interval van 300 seconden leveren er één op. Configureer het starter-interval nooit korter dan het polling-interval: 60/300 berekent nul runs. Gebruik één planner en stop deze vóór een handmatige `--force`-run. Zie [Installatie](/nl/start/install/).

Het bewerken van een profiel migreert bestaande bestanden niet automatisch. De heartbeat kan worden aangepast; wijzigingen in de stapgrootte vereisen een geplande migratie met behulp van de hulpprogramma's van RRDtool. Controleer achteraf zowel de databasedefinities als `rrdtool info`.

## Wanneer ze overeenkomen

Een gegevensbron waarvan de stapgrootte gelijk is aan het polling-interval komt in elke run in aanmerking, afhankelijk van de apparaatstatus, cache-inhoud en runtime-limieten. De standaardinstelling gebruikt 300 seconden voor beide. Geschiktheid garandeert geen succesvolle meting.

## Wanneer de stapgrootte langer is dan het interval

De PHP-collector gebruikt `rrd_next_step` op elke rij van de takenlijst wanneer meerdere actieve schema's dit vereisen. Hij selecteert rijen op of onder nul en werkt vervolgens de aftelling bij voor zijn collector- en hostbereik. Rijen waarvan de stapgrootte gelijk is aan het polling-interval blijven op nul staan. Andere rijen nemen af met het polling-interval; bij een onderloop hangt de reset af van de aanroepmodus: een normale substarter-run reset naar stapgrootte minus interval, terwijl gelijke intervallen en het pad voor alle hosts resetten naar de volledige stapgrootte. Ga er niet van uit dat een stap van tien minuten altijd elke tweede run van vijf minuten betekent; controleer daadwerkelijk verschuldigde rijen en tijdstempels.

Wanneer **Procesbelasting balanceren** is ingeschakeld, wijst de cacheopbouw verschuivingen toe aan opeenvolgende gegevensbronnen op een apparaat op basis van de stapgrootte en het polling-interval. Velden van dezelfde bron delen een verschuiving. Dit kan taken over runs spreiden, maar garandeert geen gelijke runtime: apparaatvertraging, time-outs en scripts verschillen. De starter lijnt ook inconsistente aftellingen binnen een gegevensbron uit.

Voordat je concludeert dat een item defect is omdat het tijdens één run niets heeft opgeleverd, controleer je de verschuldigde status en volgende runs. Zie [De poller-cache](/nl/concepts/the-poller-cache/) voor herbouwlimieten.

## Wanneer de stapgrootte korter is dan het interval

Een kortere stapgrootte kan geen metingen creëren die de collector nooit heeft uitgevoerd. Kadupul waarschuwt tijdens het opbouwen van de cache wanneer de verzameling te langzaam is voor de stapgrootte; corrigeer de instellingen en bouw de cache opnieuw op.

Deze discrepantie leidt niet noodzakelijk tot een kamvormige grafiek. RRDtool kan minder frequente updates normaliseren in kleinere stappen wanneer de heartbeat dit toestaat, maar dat herstelt ontbrekende meetdetails niet.

## Heartbeat is niet altijd tweemaal de stapgrootte

De heartbeat is het maximaal toegestane interval tussen updates voordat invoer als onbekend wordt behandeld. RRD-creatie leest de heartbeat uit de velddefinitie van de gegevensbron, die profielinstellingen kan overnemen. Het is geen extra respijtperiode; controleer het veld en het bestand als ze afwijken van het profiel.

De meegeleverde profielen volgen geen vaste regel.

| Profiel | Stapgrootte | Heartbeat | Limiet update-interval |
|---|---|---|---|
| Vijf minuten | 300 | 600 | 10 minuten |
| Eén minuut | 60 | 600 | 10 minuten |
| Dertig seconden | 30 | 1200 | 20 minuten |

Dit zijn meegeleverde profielwaarden, geen timers voor storingsdetectie. Expliciet onbekende invoer kan gaten veroorzaken voordat de heartbeat verloopt; normalisatie en archiefdrempels beïnvloeden wat zichtbaar wordt. Een grotere heartbeat tolereert een grotere tussenruimte. Op of onder het normale update-interval laat het weinig tot geen marge voor vertraging.

Controleer het bestand en het profiel. Bestaande RRD's kunnen afwijken van gewijzigde databasedefinities; de bestandscontrole meldt dergelijke afwijkingen. Raadpleeg de [RRDtool-heartbeatdefinitie](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) en de [afstemmingsreferentie](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) voordat je wijzigingen plant.

## Wat wordt opgeslagen is niet wat het apparaat rapporteerde

RRDtool normaliseert updates naar vaste stapgrenzen. Waarden tussen grenzen kunnen bijdragen aan meer dan één primair datapunt. Heartbeat, expliciet onbekende waarden en grenzen beïnvloeden geldige invoer; archiefconsolidatie past een eigen drempel voor onbekende data toe. Een stap hoeft geen afzonderlijke ruwe meting te bevatten om geldig te zijn.

Tellerwaarden worden snelheden over verstreken updatetijd, onderhevig aan tellergrenzen en resets. Niveaumetingen worden eveneens over de tijd genormaliseerd. Korte pieken kunnen door bemonstering worden afgezwakt of volledig worden gemist. Archiefinstellingen kunnen geen details herstellen die nooit zijn verzameld of tijdens de normalisatie verloren zijn gegaan.

## Welke klok beslist

Voor gewone `cmd.php`-verzameling levert SQL `CURRENT_TIMESTAMP()` de uitvoertijdstempel wanneer een batch wordt ingevoegd. Dit is geen door het apparaat geleverde tijdstempel of een exacte meting van wanneer het apparaat antwoordde. Andere verzamelings-backends en realtime-paden moeten afzonderlijk worden gecontroleerd.

De PHP-collector buffert resultaten en schrijft ze in batches, waarbij wordt gespoeld bij een apparaatwissel of wanneer de buffer vol is. De tijdstempel wordt eenmaal per batch geëvalueerd, zodat alle waarden in één batch dezelfde dragen.

De gevolgen zijn niet voor de hand liggend, dus ze zijn het vermelden waard.

**De apparaatklok voorziet deze SNMP-metingen niet van een tijdstempel.** De collector gebruikt het tijdstip van database-invoeging. Apparaattijd kan nog steeds van belang zijn voor scripts of specifieke meetwaarden, dus dit is geen reden om kloksynchronisatie te negeren.

**Een verkeerde klok op een collector of database verschuift de gegevens.** Waarden komen in verkeerde tijdvakken terecht, en bij een bestand dat al deels is beschreven, wordt een update waarvan de tijd niet na de laatste ligt botweg geweigerd. Als tijdstempels achter de laatste update van het bestand terugvallen, kunnen nieuwe updates het bestand niet bevorderen totdat hun tijdstempels dat punt overschrijden. Controleer de databaseklok, collectorklok en bestandstijdstempel; een wijziging van de collectorklok alleen verandert niet automatisch de door de database gegenereerde tijdstempels.

**Tijd binnen een cyclus wordt jitter.** Een apparaat dat tegen het einde van een lange run wordt bevraagd, krijgt een latere tijdstempel dan een apparaat aan het begin, hoewel beide tot dezelfde cyclus behoren. Bij een zwaarbelaste collector kan deze jitter een aanzienlijk deel van het interval worden en bij een krappe heartbeat gaten veroorzaken.

**De tijdzone van de database bevindt zich in het midden van het proces.** De tijdstempel wordt geschreven als een databasetijdstempel en door de database weer omgezet naar een absolute tijd bij het lezen. Inconsistente tijdzone-instellingen in sessies kunnen die interpretatie veranderen. Controleer sessie-instellingen en epoch-conversies; een wijziging van de weergavetijdzone alleen bewijst niet dat opgeslagen geschiedenis is verschoven.

## Metingen worden samengevoegd op tijdstempel

Een gegevensbron met meerdere velden, zoals een interface met inkomende en uitgaande bytes, kan afzonderlijke SNMP-taken gebruiken of een script dat meerdere benoemde waarden retourneert. Verwerkte velden worden gegroepeerd op gegevensbron en tijdstempel voor een RRD-update.

Een onvolledige set wordt vastgehouden totdat aan het verwachte aantal velden is voldaan, in plaats van onvolledig te worden geschreven. Dit is een controle op volledigheid, geen garantie dat elk veld een geldige numerieke waarde bevat; expliciet onbekende waarden kunnen nog steeds worden geschreven. Normaal gesproken bevinden beide helften zich in dezelfde batch en delen ze een tijdstempel. Batches die binnen dezelfde seconde zijn ingevoegd, kunnen ook overeenkomen. Wanneer velden verschillende tijdstempels ontvangen, kunnen groepen onvolledig blijven en geen update produceren. Huidige code bewaart onvolledige groepen over cycli heen en laat ze na `5 * max(60, poller_interval)` seconden verlopen met een logbericht. Een paginagrens bij het lezen wordt uitgebreid om de laatste tijdstempelgroep op te nemen.

Updates worden voor het schrijven ook in oplopende tijdsvolgorde gesorteerd, omdat een bestand geen waarde accepteert die ouder is dan zijn laatste update.

## Uitgestelde schrijfacties behouden hun tijdstempels

Wanneer RRD-schrijfacties worden uitgesteld en later in bulk worden toegepast, reist de geregistreerde tijdstempel mee met de waarde en wordt de batch in tijdsvolgorde geschreven. Een tijdstempel van twaalf uur 's middags blijft behouden wanneer een update om één uur wordt geprobeerd; deze wordt niet vervangen door de spoeltijd. RRDtool normaliseert geaccepteerde updates nog steeds naar zijn stapgrenzen.

Een achterstand kan een bestand vooruithelpen via tijdstempels die nieuwer zijn dan de laatste update. Het kan geen gaten achter die tijdstempel opvullen. De Boost-schrijver filtert metingen op of vóór de laatste update van het bestand; een lege wachtrij bewijst niet dat elke meting is toegepast. Zie [Schrijfacties met hoog volume](/nl/concepts/high-volume-writes/) en de [RRDtool-updatereferentie](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Uitgestelde schrijfacties zijn afhankelijk van succesvolle opslag; ze garanderen geen herstel van elke fout. Controleer vastgehouden en afgewezen uitvoer wanneer een achterstand niet verdwijnt.

## Wanneer de cyclus niet wordt voltooid

De PHP-collector controleert de verstreken runtime tussen taken en beëindigt zijn takenlus zodra het polling-interval wordt overschreden, onder het loggen van een waarschuwing. Dit is geen harde onderbreking op de deadline: een bewerking kan vóór die controle uitlopen. Items die niet zijn bereikt, produceren die cyclus geen waarden. Een gat tussen geldige updates kan worden overbrugd wanneer heartbeat en archiefdrempels dit toelaten. Herhaalde overschrijdingen zijn aanleiding om capaciteit, time-outs en verzamelfouten te onderzoeken, geen bewijs dat elk gat dezelfde oorzaak heeft.

[De poller schalen](/nl/guides/scale-the-poller/) beschrijft wat je daaraan kunt doen. De volgorde van een run en de overschrijdingsbeveiliging staan in [Poller-levenscyclus](/nl/reference/poller-lifecycle/).
