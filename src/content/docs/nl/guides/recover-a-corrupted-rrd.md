---
title: Een beschadigde RRD herstellen
description: Hoe u een beschadigd round-robin archief onderscheidt van een verkeerd geconfigureerd archief, een bestand inspecteert, hoe dump en restore het repareren en welke historie behouden kan blijven als het bestand opnieuw moet worden opgebouwd.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 25
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Echte bestandsbeschadiging is zeldzaam. De meeste bestanden die als beschadigd worden gemeld, zijn intact en
komen niet overeen met de database, kunnen niet worden geschreven door de poller, of ontvangen
geen waarden meer om een reden die niets met het bestand te maken heeft. Bepaal welke situatie
u heeft voordat u iets aanraakt, want de reparatie voor de ene maakt de andere erger.

:::danger[Behoud het origineel]
**Kopieer het bestand vóór elke reparatie op deze pagina.** Herstel naar een afzonderlijke kandidaat
en inspecteer deze voordat u het actieve bestand vervangt. Het verkleinen of verwijderen van een archief
gooit bewaarde historie weg. Het wijzigen van een maximum beïnvloedt latere invoervalidatie; het
wist opgeslagen meetwaarden niet met terugwerkende kracht. Er is geen automatische ongedaanmaking in een RRD.
:::

## 1. De storing benoemen

| Wat u ziet | Betekent meestal | Ga naar |
|---|---|---|
| Grafiek tekent een foutmelding in plaats van een afbeelding | Het bestand ontbreekt, is onleesbaar of de map is niet schrijfbaar | Stap 2 |
| Grafiek is leeg maar geen foutmelding | Geen bruikbare waarden in het geselecteerde bereik, of een probleem met de grafiekdefinitie | [Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/) |
| Grafiek stopt op een vast moment en hervat nooit | Poller, machtigingen of heartbeat | Stap 3 |
| Grafiek bevat gegevens maar de vorm veranderde zonder configuratiewijziging | Het bestand en de database komen niet overeen | Stap 4 |
| Opgeslagen waarden zijn allemaal onbekend | Verzameling, timing, limieten of gegevensbronconfiguratie moeten worden gecontroleerd | [Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/) |
| `rrdtool` weigert het bestand te lezen | Ontbrekend pad, toegangsfout, incompatibel formaat of schade | Stappen 2 en 3, daarna 5 |

Kadupul zet het eerste geval om in een leesbaar bericht in plaats van een gebroken afbeelding,
waarbij onderscheid wordt gemaakt tussen een map die niet kan worden geschreven en een bestand dat niet kan worden geschreven, en meldt een
afwezig bestand als een poller die mogelijk nog niet heeft gedraaid. Dat bericht is een hint, geen
diagnose: verwijdering, een gewijzigd pad of een onvolledig herstel kunnen het bestand eveneens doen ontbreken.

## 2. Het bestand inspecteren

Twee weergaven zijn beschikbaar op de pagina van de gegevensbron zelf, beide per sessie in te schakelen.
De foutopsporingsweergave toont de `rrdtool create`-opdracht die Kadupul vandaag voor deze gegevensbron
zou uitvoeren. De informatieweergave is degene die hier van belang is: deze leest het bestand met
`rrdtool info`, leest de gegevensbrondefinitie uit de database en toont de
verschillen. Waar een verschil kan worden opgelost zonder opnieuw op te bouwen, toont deze de
`rrdtool tune`- of `rrdtool resize`-opdracht die dat zou doen, als tekst die u handmatig kunt
uitvoeren.

Vanaf een shell is dezelfde eerste stap:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

De header geeft de stap, het tijdstip van de laatste update, elke gegevensbronnaam met type,
heartbeat, minimum en maximum, en elk archief met consolidatiefunctie, rijenaantal
en resolutie. Als deze opdracht mislukt, bewaar de foutmelding en controleer pad,
machtigingen en RRDtool-compatibiliteit voordat u corruptie diagnosticeert. Een succesvolle
`info` leest metagegevens; inspecteer ook `fetch`-uitvoer en test een dump om de geschiedenis te controleren.

## 3. Controleer eerst de mechanische oorzaken

| Controle | Waarom dit vóór reparatie komt |
|---|---|
| Bestandseigendom en modus | Een bestand dat tijdens onderhoud door root is aangemaakt, is vanaf dat moment onschrijfbaar voor de poller |
| Mapeigendom en modus | De poller kan geen vervangend bestand aanmaken in een map waarin hij niet kan schrijven |
| Vrije schijfruimte en inodes | Een vol bestandssysteem veroorzaakt onvolledige schrijfbewerkingen die op beschadiging lijken |
| Of er een tweede schrijver actief is | Gelijktijdige of niet-opeenvolgende updates kunnen mislukken of een onderhoudssnapshot ongeldig maken; inspecteer logboeken |

Voer onderhoud uit als het account dat eigenaar is van de RRD en deze bijwerkt, en behoud modus,
eigenaar en groep. Stop alle schrijvers voordat u bestanden kopieert of vervangt, inclusief externe
collectors, geplande taken en handmatig onderhoud. Spoel openstaande schrijfbewerkingen pas door nadat
hun producenten zijn gestopt. Eenvoudige shell-commando's verwerven niet de opslagvergrendelingen van Kadupul.
Zie [opslagvereisten](/nl/reference/requirements/) en de procedure voor stillegging in
[Back-up maken en herstellen](/nl/guides/back-up-and-restore/).

## 4. Lees wat de controle al heeft gevonden

Kadupul kan grafiekgekoppelde gegevensbronnen op ingeschakelde apparaten volgens een schema controleren en
vastleggen wat het aantreft; dit is geen inventarisatie van elk bestand op schijf. Het staat
standaard uit. De interface geeft aan waar het kan worden ingeschakeld: Configuration -> Settings -> Data.

| Instelling | Standaard | Effect |
|---|---|---|
| Enable RRDfile Check | off | Niets wordt gecontroleerd totdat dit is ingeschakeld |
| Check Frequency | 4 hours | Biedt ook 1 hour, 24 hours of uitvoering na elke boost-cyclus |
| Number of RRDfile Check Processes | 1 process | Verdeelt de bestandenlijst over parallelle workers |
| RRDChecker Timeout | 1 hour | De run wordt afgebroken als deze tijd wordt overschreden |

Bevindingen verzamelen zich in een lijst met het apparaat, de gegevensbron, het interne gegevensbron-id,
het bericht en de datum. U kunt filteren op leeftijd en zoeken in de tekst, en
u kunt de lijst wissen nadat u ernaar heeft gehandeld.

De berichten die kunnen worden vastgelegd en wat elk bericht betekent:

| Bericht | Betekenis |
|---|---|
| RRDfile does not exist | Het bestand is nooit aangemaakt, is verplaatst of verwijderd, of het geconfigureerde pad is gewijzigd |
| RRDfile is not writable | De poller-gebruiker kan het bestand niet schrijven |
| RRDfile modify time older than hour | Er is minstens een uur lang niets geschreven |
| Last update value in RRDfile is older than 1 hour | De laatste updatestempel van het bestand zelf is verouderd, wat sterker bewijs is dan de wijzigingstijd |
| The RRDfile step does not match the Data Source Profile step | Het bestand is aangemaakt onder een ander interval |
| There are more, or less, Data Sources in the database than in the RRDfile | Het sjabloon heeft velden gekregen of verloren nadat het bestand is aangemaakt |
| The Data Source '...' exists in RRDfile, but not in database | Noemt het veld, vanuit het perspectief van het bestand |
| Data Source name '...' exists in the Database, but not in RRDfile | Noemt het veld dat de poller schrijft maar dat geen plaats heeft in het bestand |
| The RRDfile Minimal Heart... is lower than polling interval | De controle markeert heartbeats kleiner dan of gelijk aan het pollinginterval; late metingen kunnen onbekend worden |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | De heartbeat van het bestand ligt onder de profielheartbeat; deze controle markeert geen grotere |
| Stale values for last 24 hours, or last hour | Elke meetwaarde die in dat venster is teruggelezen, was onbekend |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Gedeeltelijke verzamelingsfout |
| No data returned, maybe corrupted Data Source | Een fetch op het bestand leverde helemaal niets op |

De controle corrigeert de in de database vastgelegde stap en heartbeat zodat deze overeenkomen met het profiel
tijdens de uitvoering, wat drift tussen het profiel en de gegevensbronrijen oplost, maar raakt
het bestand niet aan. Aantallen die niet overeenkomen tussen bestand en database worden gerapporteerd in plaats van
gerepareerd, omdat elke kant de verkeerde kan zijn.

## 5. Dumpen, bewerken, herstellen

RRDtool kan een leesbaar bestand serialiseren naar XML en daaruit een kandidaat opnieuw opbouwen.
Dit kan helpen bij een bekende structurele afwijking, maar reconstrueert geen verloren meetwaarden
en garandeert niet dat een beschadigd bestand kan worden geparseerd. Kadupul gebruikt ook dump/restore-helpers
voor structurele wijzigingen. De lokale herstelhelper bouwt een tijdelijk nevenbestand en
hernoemt dit na succes over de bestemming; dit biedt geen back-up.

Voer dit met gestopte schrijvers uit als de RRD-eigenaar. Vervang het voorbeeldpad door het
werkelijke pad van de gegevensbron. De privéwerkmap wordt naast de bron aangemaakt, zodat
de kandidaat zich op hetzelfde bestandssysteem bevindt:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Kies een fetch-bereik en consolidatiefunctie die bekende bewaarde gegevens bevatten;
het afgelopen uur is slechts een voorbeeld. Vergelijk bron- en kandidaat-gegevensbronnamen,
stap, archieven, tijdstempel van de laatste update en meetwaarden. Een ongewijzigde dump/restore
kan de binaire indeling veranderen, vergelijk dus waarden in plaats van identieke bestandshashes te vereisen.

Bewaar de originele kopie. Herstel pas na validatie de vereiste modus,
eigenaar en groep van de kandidaat en hernoem deze naar het actieve pad terwijl schrijvers gestopt blijven. Controleer
of het poller-account het bestand kan lezen en bijwerken voordat u de verzameling hervat. Dit voorbeeld
stopt vóór installatie, zodat een leesbare maar onjuiste kandidaat niet wordt geïnstalleerd.

De XML en de kandidaat vereisen extra schijfruimte. Een mislukte dump kan onvolledige
XML achterlaten; herstel deze niet. Controleer toegang, vrije ruimte en de gerapporteerde fout. Als het origineel
na die controles niet kan worden gedumpt, herstel dan een bekende goede back-up. RRDtool's
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) staat het overschrijven van
de bestemming toe; het gefaseerde voorbeeld gebruikt bewust een nieuwe bestemming.

## 6. Wat overleeft en wat niet

| Schade | Historie herstelbaar |
|---|---|
| Bestand onschrijfbaar, verder intact | Bewaarde historie blijft behouden. Gemiste updates worden niet hersteld door alleen de toegang te herstellen |
| Heartbeat, minimum of maximum onjuist | Ja. `rrdtool tune` wijzigt de header zonder opgeslagen waarden aan te raken |
| Stap onjuist | Vereist een expliciete, gevalideerde conversie; alleen het wijzigen van het databaseprofiel converteert het bestand niet |
| Gegevensbron ontbreekt in het bestand | De bestaande velden behouden hun historie. Het nieuwe veld begint leeg |
| Archief verwijderd of nooit aangemaakt | Nee. Een resolutie die nooit is opgeslagen, kan niet worden gereconstrueerd |
| Archiefrijen verminderd door verkleinende resize | Nee. De verwijderde rijen zijn verdwenen op het moment dat de opdracht wordt uitgevoerd |
| Afgekapt bestand, dump mislukt | Nee. Herstellen vanaf back-up |
| Header intact, staart afgekapt | Ga er niet van uit dat een schijnbaar leesbare header een volledige dump betekent; gebruik een geverifieerde back-up als dumpen mislukt |

Het wijzigen van het pollerinterval of het verplaatsen van een gegevensbron naar een ander retentieprofiel
hervormt bestaande bestanden niet automatisch. RRDtool biedt ook structurele
[`tune`-bewerkingen](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), inclusief een
stapoptie; valideer conversiegedrag voor uw geïnstalleerde versie en archiefindeling
in plaats van uit te gaan van een verliesvrije intervalwijziging. Zie
[Gegevensbronnen en archieven](/nl/concepts/data-sources-and-rras/) en
[Gegevensretentie beheren](/nl/guides/manage-data-retention/). Het verhogen van een maximum met `tune`
is veilig; het verlagen registreert elke latere waarde boven het nieuwe plafond als onbekend.

## 7. Opnieuw opbouwen met behoud van wat behouden kan worden

Kadupul levert een splice-hulpprogramma dat een nieuw bestand kan vullen vanuit een ouder leesbaar
bestand. Beschouw het resultaat als een kandidaat: het kan hiaten vullen en legitieme nullen vervangen,
dus het is geen verliesvrije kopie van gemeten historie. Voer het uit vanuit de applicatiemap op
de hoofdcollector, met geïsoleerde kopieën in vertrouwde schrijfbare mappen.

Maak `new.rrd` met de beoogde structuur aan in de privémap `$work`
uit stap 5 en bekijk vervolgens een voorbeeld van de samenvoeging:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Beide invoerbestanden moeten al bestaan en slagen voor de schrijfbaarheidscontroles van het hulpprogramma.
Het nieuwe bestand levert de structuur. Zonder `--finrrd` is de uitvoer het pad van het nieuwe bestand
plus `.new`; gebruik een nieuw expliciet uitvoerpad om te voorkomen dat een eerdere
kandidaat wordt vervangen. `--dryrun` parseert en voegt samen met behulp van tijdelijke XML en, indien beschikbaar,
SQLite-opslag, maar slaat het definitieve RRD-herstel over. Het bewijst niet dat het definitieve
herstel zal slagen. Verwijder `--dryrun` om de afzonderlijke kandidaat te produceren.
Vermijd `--owner` tijdens previews en voer de opdracht uit als het vereiste serviceaccount; controleer het
werkelijke eigendom van de uitvoer vóór installatie.

:::caution[De samenvoeging behandelt nul als een gat]
De samenvoeging doorloopt het nieuwe bestand en zoekt voor elk slot met onbekend **of nul** naar
de dichtstbijzijnde overeenkomende waarde in het oude bestand en schrijft die in plaats daarvan. Een echte nul in
het nieuwe bestand wordt daarom vervangen door oude gegevens. Bij alles wat legitiem gedurende langere tijd nul meet,
een inactieve poort, een wachtrij die leegloopt, een teller in rust, inspecteer het
resultaat voordat u het in gebruik neemt. De onbekenden van het oude bestand worden ook opgevuld met
voorafgaande waarden, zodat de samengevoegde uitvoer continuïteit kan fingeren over ontbrekende gegevens.
:::

Plaats het bestand na het samenvoegen op de plek waar de gegevensbron het verwacht, met het eigendom dat de
poller nodig heeft, en controleer of de grafiek wordt getekend.

## 8. Gaten vullen, en waarom u zich twee keer moet bedenken

| Hulpprogramma | Wat het schrijft |
|---|---|
| `cli/batchgapfix.php` | Vult een datumbereik over veel apparaten parallel, met behulp van de laatst bekende waarde of een gemiddelde |
| `cli/float_rrdfiles.php` | Laat een bereik in geselecteerde grafieken zweven via hetzelfde dump- en restore-pad |

Beide fingeren metingen. Er is niets verzameld op die tijdstippen, en daarna
onderscheidt niets in het bestand de gefingeerde waarden van de echte waarden. Gebruik ze wanneer u
weet dat het gat geen uitval was: een poller die is gestopt voor onderhoud, een migratievenster.
Gebruik ze nooit voor gegevens die een capaciteits- of facturatieberekening voeden. Dezelfde voorzichtigheid geldt voor
[het verwijderen van pieken](/nl/guides/remove-spikes-from-data/).

## 9. Geautomatiseerd debuggen van één gegevensbron

Voor één gegevensbron die zich vreemd gedraagt, kan Kadupul een debugcontrole uitvoeren over de komende
pollingcycli en een oordeel rapporteren: of het bestand bestaat, of het en zijn
map schrijfbaar zijn, welk account eigenaar is vergeleken met het account waarmee de poller draait,
of de gegevensbron actief is, of het bestand overeenkomt met de gegevensbrondefinitie,
of de laatste update is verschoven na een poll, en of de waarden bruikbaar waren. De
reparatieactie is beperkt. Het voert de aanbevelingen van `rrdtool tune` uit die de vergelijking
heeft opgeleverd en niets anders; het weigert en logt de reden wanneer de lijst leeg is of het bestand
niet schrijfbaar is. Het maakt geen bestanden opnieuw aan, voegt geen gegevensbronnen toe en wijzigt geen archieven.

## 10. Verwijderen is een apart risico

Kadupul houdt archiefbestanden bij waarvan de gegevensbron niet meer bestaat en biedt aan deze
te verwijderen. Het kan ook worden ingesteld om automatisch te handelen wanneer een gegevensbron wordt verwijderd, met twee
methoden: verwijderen of verplaatsen naar een archiefmap.

:::danger[Verwijderen is permanent]
De verwijdermethode verwijdert het bestand van de schijf. Er is geen prullenbak en de gegevens
staan niet in de database. Als u niet zeker weet of elk weergegeven bestand daadwerkelijk verlaten is,
stel de methode dan in op archiveren, waardoor bestanden naar een door u aangewezen map worden verplaatst, en ruim
die map later handmatig op.
:::

Een bestand kan verlaten lijken zonder het te zijn. Een gegevensbron die naar een nieuw pad is verplaatst, een
gedeeltelijk voltooid herstel of een apparaat dat opnieuw is opgebouwd onder een nieuw id laten bestanden achter waar
niets naar verwijst. Controleer de lijst eerst tegen uw eigen overzicht van wijzigingen.

## Storingsmodi

| Symptoom | Oorzaak |
|---|---|
| Reparatie geslaagd, grafiek nog steeds leeg | Controleer toegang, geselecteerd tijdsbereik, gegevensverzameling en grafiekdefinitie |
| `rrdtool dump` geeft fouten op het bestand | Controleer pad, toegang, opslag en formaat alvorens te concluderen dat het beschadigd is |
| Tune toegepast, niets veranderd | Headerwijzigingen vullen historische onbekende waarden niet met terugwerkende kracht aan; verifieer zowel bestands- als databasedefinities |
| Overal smalle hiaten na een intervalwijziging | De bestanden bevatten nog steeds de oude stap en heartbeat |
| Samengevoegd bestand heeft oude gegevens waar het nieuwe bestand nul las | Verwacht. De samenvoeging vult zowel nullen als onbekenden aan |
| Controlelijst groeit en krimpt nooit | Bevindingen worden vastgelegd totdat ze worden gewist; het verhelpen van de oorzaak wist ze niet |

Maak gelijktijdig een back-up van de archiefmap en de database, volgens één schema, en test het
herstel. Herstel is beperkt tot wat die back-up op het moment van vastlegging bevatte. Zie
[Back-up maken en herstellen](/nl/guides/back-up-and-restore/).
