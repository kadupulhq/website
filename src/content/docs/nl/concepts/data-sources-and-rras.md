---
title: Gegevensbronnen en round-robin archieven
description: Wat wordt opgeslagen, hoe retentie werkt en waarom profielwijzigingen bestaande RRD-bestanden niet migreren.
sidebar:
  order: 2
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
---

Een Kadupul-gegevensbron groepeert metingen over de tijd en is gewoonlijk gekoppeld aan één RRD-bestand.
Elk benoemd veld in dat bestand wordt door RRDtool ook een gegevensbron (DS) genoemd.
Maak onderscheid tussen het applicatie-object en de velden ervan bij het vergelijken van aantallen of instellingen.

Eén bestand is niet altijd één getal. Een gegevensbron kan meerdere velden bevatten, en een interface
is het typische geval: inkomende en uitgaande bytes delen een bestand, worden als afzonderlijke werktaken
verzameld en samen weggeschreven als één update. Wat ze delen is een stap (step), een set archieven
en een lot. Je kunt een van beide niet langer bewaren dan de andere, omdat retentie een eigenschap is
van het bestand en niet van het veld.

## Wat er in het bestand staat

Een RRD-bestand bestaat uit een header en twee lijsten.

De eerste lijst bevat de velden: een naam, een type, een heartbeat en een minimum en maximum voor elk veld.
De tweede lijst bevat de archieven: een consolidatiefunctie, hoeveel stappen aan ruwe gegevens in één slot
gaan, hoeveel slots er zijn en hoeveel van een slot onbekend mag zijn voordat het slot zelf onbekend wordt.

Bij het aanmaken worden deze definities in het bestand vastgelegd. Databasemetagegevens en de werkelijke
bestandsdefinities kunnen naderhand uiteenlopen; inspecteer het bestand met `rrdtool info` in plaats
van aan te nemen dat de huidige sjabloon het bestand exact beschrijft.

<span id="the-decisions-that-are-permanent"></span>

## Beslissingen bij het aanmaken en later onderhoud

Een RRD-bestand wordt toegewezen bij het aanmaken. Profielbewerkingen migreren bestaande bestanden niet.
RRDtool biedt afstemmings- en formaatwijzigingsbewerkingen die opgeslagen gegevens kunnen behouden,
maar deze vereisen afzonderlijke validatie en back-ups. Het normale aanmaakpad controleert op een bestaand
bestand en keert terug zonder het te vervangen. Die beveiliging verbiedt expliciete afstemming of migratie
niet. Het opslaan van een sjabloon alleen werkt de indeling van bestaande bestanden niet bij.

Op dat moment worden vier keuzes vastgelegd.

**De stap (step).** Hoe vaak een waarde wordt verwacht, gewoonlijk 300 seconden. RRDtool normaliseert
updates naar stapgrenzen; frequentere metingen worden niet zomaar weggegooid. Of tragere updates
onbekende gegevens opleveren, hangt af van de heartbeat en consolidatieregels. De stap is gewoonlijk
afkomstig uit het gegevensbronprofiel. Het aanmaken van een bestand leest de opgeslagen stap van de
gegevensbron en de archieven van het gerefereerde profiel; verifieer daarom beide bij het wijzigen
van metagegevens of het plannen van een migratie.

**Het gegevensbrontype.** Zie hieronder. Dit is de instelling die geruisloos faalt.

**De grenzen.** Een minimum en maximum beperken acceptabele waarden; voor types die een snelheid berekenen,
gelden die limieten voor de berekende snelheid en niet voor het totale ruwe tellerniveau. Waarden buiten
het bereik worden onbekend (unknown) in plaats van te worden afgekapt. Op query's gebaseerde maxima kunnen
plaatshouders voor interfacesnelheden oplossen; niet elke interface-gegevensbron krijgt automatisch een
correcte limiet voor de verbindingssnelheid. Controleer sjablooneenheden en de werkelijke bestandsdefinitie.

Het aanmaken kent specifieke normalisatietakken. Voor een letterlijk maximum dat gelijk is aan of lager is
dan het minimum, gebruiken GAUGE en ABSOLUTE een ongedefinieerd maximum; andere types gebruiken minimum plus
één. Query-substituties volgen een afzonderlijke tak. Een latere nul/nul-controle wijzigt uitsluitend het
maximum, en eerdere normalisatie kan dit al hebben aangepast. Behandel dit niet als een algemene validator
en ga er niet van uit dat beide grenzen ongedefinieerd worden.

**De archieven.** Hoeveel metingen bewaard moeten worden op welke resoluties, en welke consolidatiefunctie
voor elk gebruikt moet worden. Dit bepaalt of je over twee jaar nog een vraag kunt beantwoorden.

## Gegevensbrontypes

| Type | Slaat op | Past bij |
|---|---|---|
| `GAUGE` | Een niveau, genormaliseerd naar de bestandsstap | Temperatuur, load average, gebruikt geheugen, wachtrijdiepte |
| `COUNTER` | Veranderingssnelheid per seconde, corrigerend voor telleromloop bij 32 of 64 bits | Interface-octetten, pakket- en fouttellingen |
| `DERIVE` | Veranderingssnelheid per seconde, mag negatief zijn | Een teller die legitiem kan dalen of gereset kan worden |
| `ABSOLUTE` | De waarde zoals opgegeven, gedeeld door de tijd sinds de vorige meting | Een telling die het apparaat reset bij elke uitlezing |
| `COMPUTE` | Een waarde berekend uit andere velden in hetzelfde bestand in plaats van verzameld | Een afgeleid veld, zoals een totaal of een verhouding |

Kadupul ondersteunt `DCOUNTER` en `DDERIVE` wanneer de geconfigureerde RRDtool-versie 1.5 of nieuwer is.
Deze accepteren floating-point tellers; DCOUNTER detecteert ook telrichting en resets, en is dus niet
slechts COUNTER met decimalen. De tabel beschrijft de RRDtool-semantiek, geen garantie dat elk type
wordt ondersteund door elke Kadupul-editor of elk aanmaakpad; valideer de gegenereerde definitie,
vooral voor COMPUTE-expressies. Zie het stroomopwaartse
[RRDtool-aanmaaknaslagwerk](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Het verkeerde type kiezen

Deze voorbeelden illustreren configuratiefouten; de zichtbaarheid hangt af van de gegevens en grenzen.

`GAUGE` op een oplopende teller tekent het absolute niveau in plaats van de doorvoer. Het kan stijgen
tot een omloop of reset; dat kan opvallen, maar ziet er over een kort tijdsvenster niet gegarandeerd
duidelijk verkeerd uit.

`COUNTER` interpreteert dalingen met omloopcorrectie, waardoor een reset een enorme positieve snelheid
kan worden of kan worden afgekeurd door het maximum. `DERIVE` met een minimum van nul verwerpt negatieve
snelheden, inclusief legitieme telleroomlopen; kies dit alleen als die afweging past bij de metriek.
Een maximum maakt niet bij elke reset onderscheid met een legitieme omloop.

`COUNTER` op een peilwaarde (gauge) is de gevaarlijke combinatie. De opgeslagen waarde wordt de verandering
in de gauge gedeeld door de verstreken tijd. Een apparaat dat stabiel op 40 graden staat, registreert nul.
Een stijging van één graad over vijf minuten registreert 0,0033. De grafiek kan er plausibel uitzien terwijl
deze verandering meet in plaats van temperatuur. Die snelheid is alleen nuttig als het de hoeveelheid is
die je bedoelde; het geeft niet het oorspronkelijke temperatuurniveau weer.

`ABSOLUTE` op een teller die niet reset bij het uitlezen is dezelfde klasse van geruisloze fout in
de andere richting, wat waarden oplevert die meeschalen met hoelang het apparaat al actief is.

De regel die dit suggereert, is om het type te bepalen op basis van hoe het apparaat het getal produceert,
niet op basis van wat het getal betekent. Of een uitlezing een snelheid is, is een eigenschap van de teller,
niet van de metriek.

## De heartbeat

De heartbeat is de maximaal toegestane tijd tussen updates voor een veld voordat RRDtool het interval
als onbekend behandelt. Het wordt gemeten tussen updates, niet als extra tijd die na de stap wordt toegevoegd.

Lees het geconfigureerde profiel en het daadwerkelijke bestand. Het meegeleverde profiel van vijf minuten
gebruikt een heartbeat van 600 seconden, het profiel van één minuut gebruikt eveneens 600 seconden, en
het profiel van dertig seconden gebruikt 1.200 seconden. Tolerantie voor gemiste polls kan daarom niet
worden beschreven met één vast getal; normalisatie en consolidatie beïnvloeden ook welke grafiekintervallen
onbekend zijn.

De heartbeat geldt per veld, niet per bestand. Profielwaarden bepalen metagegevens, maar het aanmaken
van bestanden leest de heartbeat van het lokale item, die kan afwijken van het profiel. De meegeleverde
profielen gebruiken geen vaste verhouding, en de redenen achter elk profiel, samen met wat er gebeurt
als een heartbeat te dicht bij de stap ligt, worden behandeld in
[Tijd en intervallen](/nl/concepts/time-and-intervals/).

## Consolidatie

Zodra updates binnenkomen, consolideert RRDtool deze ook in grovere intervallen; het wacht niet tot het
fijnste archief verloopt. De functie wordt per archief gekozen, en elke functie beantwoordt een andere vraag:

- `AVERAGE` vat de bijdragende primaire datapunten samen.
- `MAX` behoudt hun grootste waarde.
- `MIN` behoudt hun kleinste waarde.
- `LAST` behoudt hun laatste waarde volgens de RRDtool-consolidatieregels.

Deze werken op genormaliseerde primaire datapunten, niet noodzakelijk op de oorspronkelijke ruwe metingen.
Een MAX-archief kan geen piek herstellen die al gemiddeld is binnen een primair interval; MIN is geen
betrouwbare detector voor elke uitval.

Een bestand slaat één archief op per functie per resolutie. Het bewaren van alle vier de functies op vier
resoluties betekent dus zestien archieven en viermaal de gegevensomvang van alleen gemiddelden bij hetzelfde
aantal rijen. Header- en voorbereidingsstatusoverhead verbruikt eveneens ruimte. Alle drie de meegeleverde
profielen selecteren vier functies; kies retentie volgens de vragen en capaciteitsvereisten van je implementatie.

Als je alleen gemiddelden bewaart, kun je later niet meer naar pieken vragen. De pieken zijn simpelweg nooit
opgeschreven. Dit is de meest voorkomende teleurstelling in een langlopende installatie, en dit kan niet
achteraf worden hersteld.

Sommige tekenpaden vervangen een ontbrekende functie door een beschikbare; andere paden kunnen falen.
Controleer de gegenereerde DEF en werkelijke archieven zoals beschreven in
[Hoe grafieken worden getekend](/nl/concepts/how-graphs-are-drawn/).

## Onbekend is een echte waarde

Een RRD maakt onderscheid tussen nul en onbekend. Nul kan een gerapporteerd niveau zijn of een berekende
snelheid, zoals een ongewijzigde teller. Onbekend kan het gevolg zijn van ontbrekende updates, verlopen
heartbeats, expliciete onbekende invoer, geweigerde grenzen of onvoldoende consolidatiegegevens. Het vervangen
van onbekend door nul kan ontbrekende of ongeldige metingen laten lijken op inactiviteit.

Onbekend plant zich voort door consolidatie volgens een drempel die per archief wordt ingesteld. De standaardprofielen
stellen deze in op de helft: een grof slot opgebouwd uit deels ontbrekende invoer blijft een reëel getal
totdat meer dan de helft van de invoer onbekend is, waarna het hele slot onbekend wordt. Zichtbaarheid hangt
af van slot-uitlijning, heartbeat, normalisatie, consolidatie en grafiekweergave. Er is geen universele
uitvalduur die garandeert dat een hiaat in elk archief verschijnt of verdwijnt.

Onbekend is ook wat de grenzen opleveren. Een meting boven het geconfigureerde maximum wordt niet afgekapt
tot het maximum. Een tellereset kan een snelheid buiten het bereik opleveren en een hiaat veroorzaken,
maar grenzen vangen niet elke reset op. Onbekende gegevens alleen wijzen de oorzaak niet aan; vergelijk
verzamelingsfouten en tijdstempels.

## Dimensionering

Voor een ongewijzigde indeling is de nuttige gegevensgrootte van de archieven gelijk aan het totale aantal
slots over alle archieven, vermenigvuldigd met het aantal velden en met acht bytes. De totale bestands- en
implementatiegrootte omvat ook headers, voorbereidingsstatus, bestandssysteemtoewijzing, wachtrijen en
back-ups. Expliciet indelingsonderhoud kan de bestandsgrootte veranderen.

De drie meegeleverde profielen verschillen meer dan hun namen doen vermoeden:

| Profiel | Stap | Slots per veld | Gegevensgrootte per veld | Relatieve kosten |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | ongeveer 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | ongeveer 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | ongeveer 640 KiB | 7 |

Een interface-gegevensbron met twee velden verdubbelt elk van die waarden. Tienduizend interfaces op
het profiel van vijf minuten hebben ongeveer 1,8 GB aan archiefgegevens. Dezelfde tienduizend op het profiel
van één minuut benaderen 13 GB, en de reden is niet de stap op zichzelf; dat profiel bewaart ook een veel
dieper maandelijks archief en een tienjarig jaarlijks archief.

Wat elk archief daadwerkelijk dekt, is de moeite waard om te controleren ten opzichte van de naam.
De archieven van het vijf-minutenprofiel heten Daily, Weekly, Monthly en Yearly, en de periodes die ze
bevatten zijn 50 uur, 14,6 dagen, 64,6 dagen en 2,2 jaar. De namen beschrijven de grafiekvoorinstelling
waarvoor elk archief is gedimensioneerd, niet de retentie. Als je een vraag moet beantwoorden over afgelopen
april met een resolutie van vijf minuten, zal het label beweren dat dit kan, maar het archief zal het niet leveren.

De schrijfbelasting verandert ook met het profiel mee, en die belasting dient zich ruim vóór de schijfruimte aan.
Bij volledige verzamelingscadans levert een stap van dertig seconden tien keer zoveel meetintervallen op
als een stap van vijf minuten. Batching, gedeelde velden, selectie van taken en mislukte pogingen beïnvloeden
het aantal opdrachten en fysieke schrijfbewerkingen; ze vormen geen vaste verhouding. Zie
[Schrijfoperaties met hoog volume](/nl/concepts/high-volume-writes/).

## Welke velden in het bestand terechtkomen

Een gegevensbron die is opgebouwd uit een gegevenssjabloon krijgt in het normale aanmaakpad alleen een veld
in het bestand voor de velden waarnaar een grafiekitem verwijst. Updatecode kan niet-gerefereerde
sjabloonvelden uitsluiten; of ze worden verzameld, hangt af van de invoermethode en cache, niet louter
van de vraag of een lijn zichtbaar is. Een gegevensbron zonder sjabloon krijgt elk veld, omdat er mogelijk
geen grafiek is om te raadplegen.

Een referentie hoeft geen zichtbare lijn te tekenen: inspecteer grafiekitemkoppelingen evenals de cache
en bestandsdefinitie. Het toevoegen van een sjabloonveld alleen garandeert niet dat verzameling,
grafiekkoppeling en opslag gereed zijn. Het opnieuw opbouwen van de cache werkt de verzamelingsmetagegevens
bij; het voegt geen velden toe aan een bestaande RRD.

Het betekent ook dat het toevoegen van een veld aan een sjabloon dit veld niet automatisch toevoegt aan
bestaande bestanden, zelfs niet wanneer een grafiekitem ernaar verwijst. Een veld toevoegen vereist
expliciet onderhoud of migratie. Afhankelijk van de geïnstalleerde RRDtool-versie kan afstemming
gegevensbronnen toevoegen met behoud van bestaande gegevens; het verwijderen en opnieuw aanmaken van een
bestand wist de geschiedenis. Zie [Gegevensretentie beheren](/nl/guides/manage-data-retention/)
voor de onderhoudsopties en controles.
