---
title: De pollercache
description: Waarom de collector een vooraf berekende werklijst leest in plaats van uw configuratie, en waarom dat de gebruikelijke reden is waarom een wijziging niets lijkt te doen.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 6
---

[Architectuur](/nl/concepts/architecture/) introduceert de pollercache in één zin:
de werklijst wordt vooraf berekend en de collector leest die lijst in plaats van
uw configuratie telkens opnieuw te evalueren. Deze pagina gaat over wat die keuze
in de praktijk werkelijk betekent.

## Wat de collector anders zou moeten doen

Om te bepalen wat er voor een enkele waarde verzameld moet worden, moet een hele
keten worden doorlopen. De gegevensbron verwijst naar een apparaat en een
gegevenssjabloon. Het sjabloon verwijst naar een gegevensinvoer. De gegevensinvoer
heeft velden, waarvan sommige per apparaat worden overschreven en andere worden
overgenomen van het sjabloon. Als de gegevensbron voortkomt uit een gegevensquery,
moet de huidige index via de querycache worden opgezocht. Vervolgens moeten de
SNMP-inloggegevens van het apparaat worden opgehaald, tenzij een veld deze overschrijft.

Dat zijn meerdere joins voor één enkele waarde. Een bescheiden installatie bevat
tienduizenden waarden en voert elke vijf minuten een cyclus uit. Als deze herleiding
tijdens het verzamelen zou plaatsvinden, zou de database, en niet het netwerk,
bepalen hoeveel apparaten u kunt monitoren.

Daarom vindt de herleiding eenmalig plaats wanneer er iets verandert, en wordt
het resultaat plat weggeschreven.

## Wat de cache opslaat

De cache berekent verzamelinstructies vooraf. Het vermindert herhaalde
configuratie-evaluatie, maar elimineert geen joins of live apparaatstatussen.

| In de rij opgeslagen | Reden van aanwezigheid |
|---|---|
| Welke collector eigenaar is | Elke collector selecteert alleen zijn eigen rijen |
| De actie: SNMP, script of scriptserver | Bepaalt welk codepad wordt uitgevoerd |
| Hostnaam, SNMP-versie, poort, time-out, community of inloggegevens | Gecachte verbindingsvelden; de actuele hoststatus wordt ook gelezen |
| De OID of de volledige scriptopdrachtregel | Reeds gesubstitueerd, klaar voor uitvoering |
| Het pad naar het RRD-bestand | Reeds herleid |
| De veldnaam in dat bestand en hoeveel velden een volledige meting bevat | Zorgt dat uitvoer kan worden gekoppeld en gevalideerd |
| De stap en een aftelling tot het moment dat dit item aan de beurt is | Zie [Tijd en intervallen](/nl/concepts/time-and-intervals/) |

`cmd.php` koppelt `poller_item` aan `host`, filtert uitgeschakelde apparaten en
gebruikt live apparaatvelden voor beschikbaarheids- en herindexeringscontroles.
Gecachte OID's, opdrachten en RRD-metadata moeten nog steeds overeenkomen met de
beoogde gegevensbron.

Gecachte inloggegevens zijn een momentopname, maar het opslaan van gewijzigde
inloggegevens via de apparaat-API vernieuwt doorgaans de betreffende cache. Directe
databasebewerkingen omzeilen dat pad en kunnen een verouderde momentopname achterlaten.
Controleer de feitelijke cache in plaats van aan te nemen dat elke wijziging van
inloggegevens een handmatige herbouw vereist.

Het RRD-pad is eveneens een momentopname. Het verplaatsen van bestanden of het
wijzigen van bestandslocaties zorgt ervoor dat elke gecachte rij naar de oude
locatie blijft verwijzen.

## Wat deze schrijft

De cache wordt incrementeel bijgehouden door de bewerkingen die weten dat ze iets
hebben gewijzigd.

| Bewerking | Herschreven rijen |
|---|---|
| Opslaan van een apparaat | Wijzigingen in verbindingsvelden, collector of uitgeschakelde status activeren een pushout; ongewijzigde verzamelvelden kunnen het snelle opslagpad gebruiken |
| Opslaan van een gegevensbron | De rijen van die gegevensbron |
| Maken van grafieken en gegevensbronnen vanuit een sjabloon | De zojuist gemaakte rijen |
| Een gegevensquery-uitvoering die een index heeft verplaatst of herleid | Alleen de gegevensbronnen die zijn gewijzigd |
| Herbouw via CLI | Ingeschakelde apparaten verwerkt door de workers; het huidige defect in `--host-id`-doorsturing verhindert betrouwbare apparaatisolatie |

Herschrijven is geen blinde invoeging. De rijen voor de gegevensbronnen die opnieuw
worden opgebouwd, worden eerst als afwezig gemarkeerd, vervolgens wordt de nieuwe
set geschreven en wordt alles wat nog als afwezig staat gemarkeerd verwijderd. Dat
is wat rijen verwijdert voor een veld dat niet langer bestaat. Het opschonen van de
buffer is afgebakend op basis van collector- en gegevensbron-ID's. Dat beschermt
onafhankelijke bronnen in het reguliere doelgerichte pad; het is geen garantie bij
gelijktijdige herbouwbewerkingen of mislukte databaseschrijfacties. Controleer de
resulterende rijen na een herbouw, inclusief een nabijgelegen onaangetast apparaat
bij het onderzoeken van de reikwijdte.

## Rijen die nooit worden geschreven

Sommige configuraties produceren geen nieuwe cacherij. Controleer zowel de logboeken
als de grafiek.

De bouwer slaat uitgeschakelde apparaten over, maar een bulkactie **Uitschakelen**
behoudt bestaande cacherijen en het verzamelproces filtert het apparaat eruit. Een
herbouw terwijl het apparaat is uitgeschakeld, kan rijen verwijderen. Een bulkactie
**Inschakelen** hergebruikt een gevulde cache of initialiseert deze wanneer deze leeg
is; een extra apparaat-opslagactie is over het algemeen niet nodig. Een bestaande
gedeeltelijke of verouderde cache vereist nog steeds onderzoek.

Een SNMP-item waarvan het apparaat geen bruikbare SNMP-configuratie heeft, levert
geen rij op. Geen versie, een versie buiten het bereik of een lege community bij
versie 1 of 2 zorgt ervoor dat de rij wordt overgeslagen in plaats van te worden
geschreven als een rij die elke cyclus zou mislukken.

Wanneer een invoer-whitelist is geconfigureerd, voorkomt een ontbrekend bestand
of afgekeurde invoer nieuwe rijen voor die invoer. Een voltooide herbouw schoont
de verouderde rijen nog steeds op. Zonder een `input_whitelist`-configuratie staat
deze controle invoer toe; het is geen permanent ingeschakelde beveiliging. Bekijk
de afgewezen opdracht en het geconfigureerde beleid voordat u de whitelist wijzigt.

De interface kan nog steeds een gegevensbron tonen waarvan de cache leeg is. De
grafiek kan een oude geschiedenis behouden of hiaten vertonen; een vlakke nullijn
is geen betrouwbare indicator. Ontbrekende inloggegevens en afgewezen invoer zijn
configuratieomstandigheden die moeten worden opgelost.

## Waarom een wijziging niets lijkt te doen

Drie verschillende mechanismen veroorzaken hetzelfde symptoom.

**De rij is niet opnieuw opgebouwd.** U heeft iets gewijzigd waarvan de interface
niet veronderstelt dat het de verzameling beïnvloedt, of u heeft het buiten de
interface om gewijzigd. De cache bevat nog steeds het oude antwoord. Een herbouw
kan de gecachte velden vernieuwen nadat de beoogde configuratie is geverifieerd.

**De rij is nooit gebouwd.** Hierboven behandeld. Een herbouw lost dit ook op, maar
pas nadat de onderliggende oorzaak is verholpen; diagnostische gegevens verschijnen
vaak in de logboeken in plaats van op de grafiek.

**De waarde wordt verzameld en vervolgens weggegooid.** Uitvoer met meerdere waarden
wordt gekoppeld via de sjabloonvelddefinities, en niet-gereferentieerde velden kunnen
tijdens het parseren worden overgeslagen. Controleer de verwachte veldnamen,
koppelingen en grafiekassociaties; deze regel gooit niet zonder onderscheid alle
numerieke metingen zonder grafiekreferentie weg. Een cacheherbouw kan een onjuist
uitvoercontract niet herstellen.

## Het botte instrument

Gebruik voor een enkel apparaat de actie **Pollercache opnieuw vullen** op de
klassieke apparaatpagina. Die actie roept het apparaatspecifieke pad
`push_out_host()` aan. Controleer daarna de resulterende rijen en diagnostische gegevens.

Het huidige hoofdbestand `rebuild_poller_cache.php` accepteert `--host-id`, maar
stuurt dat filter niet door naar de workeropdracht. Een veronderstelde CLI-herbouw
voor een enkel apparaat kan daardoor ook andere ingeschakelde apparaten opnieuw
opbouwen. Vertrouw niet op die optie voor isolatie totdat deze applicatiefout is
verholpen.

Een brede CLI-herbouw is beschikbaar vanuit de applicatieroof en wordt uitgevoerd
als de poller-gebruiker:

```bash
php cli/rebuild_poller_cache.php
```

Het verwerkt ingeschakelde apparaten; het is geen herstel voor elke apparaatloze
of uitgeschakelde bron. Dit schrijft naar verzameltabellen en kan tijd kosten. Vermijd
overlappende herbouwbewerkingen en onderbreek het proces niet. De optie `--force`
van de CLI overschrijft de procesregistratiebeveiliging en is daarom geen optie
voor routinematig herstel.

Herbouwen vernieuwt afgeleide statussen; het herstelt niet de bereikbaarheid van
apparaten, verplaatst geen RRD-bestanden, lost geen afgewezen invoeropdrachten op
en haalt geen verloren geschiedenis terug. Inspecteer de resulterende cache,
logboeken en daaropvolgende verzameling voordat u het herstel als voltooid beschouwt.

Kadupul legt vast wanneer de cache voor het laatst is gewijzigd, waardoor andere
onderdelen van het systeem weten dat ze deze opnieuw moeten inlezen.

## Meerdere collectors

Bij meer dan één collector behoort elke rij toe aan precies één van hen, en worden
de rijen zowel naar de eigen database van die collector als naar de centrale database
gepusht.

Als een externe collector onbereikbaar is wanneer u een wijziging opslaat, landt
de wijziging centraal en niet op afstand, en geeft Kadupul dat aan: het vraagt om
een volledige synchronisatie zodra de collector weer terug is. Tot die synchronisatie
voert de externe collector een oudere werklijst uit dan wat de interface toont.
Een collectorspecifieke discrepantie is een reden om de replicatiestatus,
connectiviteit en de lokale cache van elke collector te inspecteren.

De volgorde in een volledige cyclus, inclusief waar de cache wordt gelezen en
wanneer herindexeringsopdrachten worden verwerkt, staat beschreven in
[Pollerlefscyclus](/nl/reference/poller-lifecycle/). Zie voor het schalen van
collectors [De poller schalen](/nl/guides/scale-the-poller/).
