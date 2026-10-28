---
title: Gegevensretentie beheren
description: Kies retentie en resolutie, schat opslagruimte in en plan wijzigingen in bestaande RRD-bestanden.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 24
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Retentie wordt geconfigureerd bij het aanmaken van het bestand en blijft ongewijzigd tijdens normale updates. Het later
bewerken van het profiel verandert hoe het volgende bestand eruitziet en laat elk bestaand
bestand exact zoals het was. Zorg dat dit direct klopt voordat u tienduizend gegevensbronnen
aanmaakt, omdat latere wijzigingen expliciet bestandsonderhoud of migratie vereisen.

Lees eerst [Gegevensbronnen en archieven](/nl/concepts/data-sources-and-rras/) als de
termen stap (step), heartbeat, archief en consolidatie nog niet bekend zijn.

## Wat een profiel bevat

Een gegevensbronprofiel is het retentiebeleid. Eén profiel, één opslagvorm.

| Veld | Betekenis |
|---|---|
| Pollinginterval (stap) | Hoe vaak een waarde wordt verwacht, in seconden |
| Heartbeat | Maximaal toegestaan interval tussen updates voordat de invoer als onbekend wordt behandeld |
| X-Files-factor | Welk deel van een consolidatievenster onbekend mag zijn voordat de geconsolideerde waarde onbekend is |
| Consolidatiefuncties | Welke van `AVERAGE`, `MIN`, `MAX`, `LAST` worden bewaard |
| Archieven | Eén rij per resolutie, elk met een aggregatieniveau en een rijenoverzicht |
| Standaard | Of nieuwe gegevensbronnen dit profiel kiezen |

De stap is standaard gelijk aan het pollerinterval. Een profiel waarvan de stap fijner is dan het
pollinginterval kan geen details herstellen die nooit zijn bemonsterd. Of de rijen ervan
onbekend zijn, hangt af van heartbeat en RRDtool-normalisatie.

## Wat standaard meegeleverd wordt

Drie profielen worden kant-en-klaar meegeleverd. Alle drie behouden alle vier consolidatiefuncties.

| Profiel | Stap | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Het 5-minutenprofiel is de standaardinstelling.

Elk heeft vier archieven. Het aggregatieniveau wordt uitgedrukt als een stapvermenigvuldiger,
dus de werkelijke resolutie is de vermenigvuldiger maal de profielstap, en het tijdsbereik is
die resolutie maal het aantal rijen.

### 5 Minute Collection

| Archief | Vermenigvuldiger | Rijen | Resolutie | Tijdsbereik |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minuten | ongeveer 2 dagen |
| Weekly | 6 | 700 | 30 minuten | ongeveer 14 dagen |
| Monthly | 24 | 775 | 2 uur | ongeveer 64 dagen |
| Yearly | 288 | 797 | 1 dag | ongeveer 2 jaar 2 maanden |

### 1 Minute Collection

| Archief | Vermenigvuldiger | Rijen | Resolutie | Tijdsbereik |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuut | ongeveer 2 dagen |
| Weekly | 15 | 1440 | 15 minuten | 15 dagen |
| Monthly | 60 | 8784 | 1 uur | ongeveer 366 dagen |
| Yearly | 720 | 7305 | 12 uur | ongeveer 10 jaar |

### 30 Second Collection

| Archief | Vermenigvuldiger | Rijen | Resolutie | Tijdsbereik |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 seconden | ongeveer 1 dag |
| Weekly | 30 | 1346 | 15 minuten | ongeveer 14 dagen |
| Monthly | 120 | 1445 | 1 uur | ongeveer 60 dagen |
| Yearly | 480 | 4380 | 4 uur | 2 jaar |

De namen zijn labels, geen gedrag. Niets dwingt af dat het archief met de naam
"Yearly" daadwerkelijk een jaar bevat.

## Hoe het profiel een bestand wordt

Bij het aanmaken worden de archieven en consolidatiefuncties van het profiel gelezen en
omgezet in een create-opdracht. De stap is afkomstig van de opgeslagen `rrd_step` van de
gegevensbron, normaal gesproken ingevuld vanuit het profiel. Elk opgenomen gegevensbronitem draagt een definitieregel
bij met naam, type, heartbeat, minimum en maximum. Elk archief
draagt één regel per consolidatiefunctie bij, met de functie, de X-Files-factor, de vermenigvuldiger en het aantal rijen.

Vier archieven maal vier consolidatiefuncties levert zestien archiefdefinities
in het bestand op. Die vermenigvuldiging is waar de schijfruimte naartoe gaat.

Als het bestand al bestaat, stopt het normale aanmaakpad zonder het te herschrijven.
Profielbewerkingen migreren bestanden niet automatisch. Expliciete onderhoudshulpmiddelen zijn
een afzonderlijke bewerking, zoals hieronder beschreven.

## Een beleid kiezen

Drie vragen, in deze volgorde.

**Wat is de meest gedetailleerde vraag die u ooit zult stellen?** Dat bepaalt de stap. Een stap van
30 seconden beantwoordt "wat gebeurde er tijdens die piek van 90 seconden". Een stap van 5 minuten kan dat
nooit beantwoorden, voor geen enkel bestand dat eronder is aangemaakt. Fijnere stappen kosten poller-werk bij
elke cyclus en extra schijfruimte.

**Hoe ver terug wilt u die vraag kunnen stellen?** Dat bepaalt het aantal rijen van het dagelijkse archief. De meeste
installaties willen een paar dagen op volledige resolutie en nemen daarna genoegen
met grovere gegevens.

**Welke vragen overleven consolidatie?** Dat bepaalt de consolidatiefuncties.
`AVERAGE` beantwoordt wat typerend was. `MAX` beantwoordt hoe erg het werd.
`MIN` beantwoordt of er ooit een dip was. `LAST` beantwoordt wat de laatste waarde in
het venster was, wat belangrijk is voor metingen die toestanden in plaats van snelheden zijn.

Het laten vallen van een van de vier consolidatiefuncties vermindert de opslaglading van
nieuwe bestanden met een kwart op elke resolutie. Het is ook de
spijt waar beheerders later over schrijven. Behoud `MAX`, tenzij u zeker weet dat niemand
ooit naar een piek zal vragen.

## De schijf dimensioneren

De grootte van één bestand volgt uit de gekozen getallen. Uit de berekening die in
de interface wordt gebruikt:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

De interface gebruikt 284 en 300 bytes als vaste overheadschattingen. Beschouw dit
als een benadering van de dimensionering, niet als een exacte beschrijving van elk RRDtool-bestandsformaat.
Elke opgeslagen waarde is 8 bytes, en het totale aantal rijen is de som van de rijenaantallen over
de archiefdefinities van het profiel vóór vermenigvuldiging met consolidatiefuncties.
Meet representatieve bestanden met de geïnstalleerde RRDtool voordat u de opslag dimensioneert.

Voor een bestand met één gegevensbron en alle vier de consolidatiefuncties:

| Profiel | Totaal aantal rijen | Geschatte bestandsgrootte |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Vermenigvuldig met het aantal gegevensbronnen dat u verwacht, niet met het aantal grafieken. Een
grafiek kan velden uit één bestand of uit meerdere bestanden combineren. Tel de werkelijke RRD-bestanden
en de gegevensbronitems daarbinnen.

Twintigduizend gegevensbronnen op het standaardprofiel is ongeveer 1,8 GB. Dezelfde
twintigduizend op het 1-minutenprofiel is ongeveer 13 GB. Deze verhouding weerspiegelt
zowel resolutie als de verschillende retentiespannes van de profielen, niet alleen de stap.
Fijnere verzameling verhoogt ook de schrijffrequentie. Zie [Schrijfbewerkingen met hoog volume](/nl/concepts/high-volume-writes/) voordat u
op grote schaal voor een fijne stap kiest.

Zowel de profiel- als de archiefeditor tonen een berekende grootte terwijl u de getallen wijzigt.
Gebruik ze. Bij deze berekening zit men er gemakkelijk een factor vier naast.

## Wat het wijzigen van een profiel doet, en niet doet

Dit is het deel dat beheerders historische gegevens kost.

| Wijziging | Effect op nieuwe bestanden | Effect op bestaande bestanden |
|---|---|---|
| Een archief toevoegen of verwijderen | Toegepast | Geen |
| Een rijenaantal wijzigen | Toegepast | Geen |
| Een aggregatieniveau wijzigen | Toegepast | Geen |
| Een consolidatiefunctie toevoegen of verwijderen | Toegepast | Geen |
| De stap wijzigen | Nieuwe gegevensbronnen overerven deze; aanmaken gebruikt hun opgeslagen stap | Geen automatische bestandsmigratie |
| De heartbeat wijzigen | Aanmaken gebruikt opgeslagen metagegevens van het gegevensbronitem; zie hieronder | Geen automatische bestandstuning |
| Het profiel verwijderen | Geweigerd zolang een sjabloon of gegevensbron ernaar verwijst, en voor het standaardprofiel | Geen |

**Het wijzigen van de heartbeat van een profiel in gebruik werkt alleen metagegevens bij.** Het opslaan van een nieuwe
heartbeat bewaart deze op het profiel en op de gegevensbronitems van sjablonen en
lokale gegevensbronnen die het profiel gebruiken; andere sjablonen worden niet gewijzigd.

Het opslaan stemt bestaande RRD-bestanden niet af. Maak een back-up van metagegevens en bestanden,
en vergelijk het profiel, de sjabloonitems, lokale gegevensbronitems en daadwerkelijke
`rrdtool info`-uitvoer na heartbeat-onderhoud.

Het hulpprogramma `cli/update_heartbeat.php` van de hoofdcollector kan bestaande bestanden afstemmen
en metagegevens bijwerken. Begin met `--help`, `--list-heartbeats`,
`--list-data-templates` en `--list-profiles`. De nieuwe heartbeat moet ondersteund worden
en minstens tweemaal het geconfigureerde pollerinterval bedragen. Gebruik `--data-template-id` om
de selectie te beperken; het hulpprogramma heeft geen dry-run optie.

Zonder `--force` moeten de geselecteerde profielen al de gevraagde
heartbeat hebben. Met `--force` veranderen ook gedeelde profielwaarden, dus inventariseer
al hun gebruikers alvorens verder te gaan. `--prev-heartbeat` filtert databasewaarden, niet
de heartbeat die uit elke RRD is gelezen: na een gedeeltelijke webopslag kan het selecteren van de oude
bestandswaarde niets opleveren. Verifieer de selectie en inspecteer de resulterende
bestanden. De geïsoleerde test stemde zijn bestaande bestand met succes af van 600 naar 900
nadat de profielmetagegevens waren gelijkgetrokken.

Nog twee valkuilen bevinden zich hiernaast.

**De editor beperkt structurele wijzigingen zodra een profiel in gebruik is.** Zodra
er een echte gegevensbron bestaat op een profiel, worden stap, X-Files-factor, consolidatiefuncties,
archiefrijenaantallen en aggregatieniveaus alleen-lezen in de editor;
knoppen voor het toevoegen/verwijderen van archieven worden ook verborgen. Dupliceer het profiel en
bewerk de kopie. Deze interfacebeperkingen vormen geen validatie aan de serverzijde
van verzonden verzoeken.

**Wijs verwijzingen opnieuw toe voordat u een profiel verwijdert.** De lijst schakelt selectie uit
wanneer een sjabloon of lokale gegevensbron een profiel gebruikt, en de server weigert een
profiel te verwijderen waarnaar nog wordt verwezen.

## Gegevensbronnen tussen profielen verplaatsen

Er is een bulkactie op gegevenssjablonen om het profiel te wijzigen. Deze herschrijft het
opgeslagen profiel, de stap en de heartbeat van het sjabloon en beperkt zich
bewust tot sjabloonrijen. Reeds bestaande gegevensbronnen worden niet meegenomen.

De volgorde voor een echte migratie is dus:

1. Bouw het nieuwe profiel en controleer de berekende grootte.
2. Wijs het gegevenssjabloon ernaar toe.
3. Accepteer dat alles wat vanaf nu wordt aangemaakt de nieuwe vorm gebruikt.
4. Beslis afzonderlijk wat te doen met de bestanden die u al heeft.

Stap vier heeft verschillende opties, afhankelijk van de wijziging en de geïnstalleerde RRDtool-versie.

**Laat ze staan.** Verschillende retentievormen kunnen naast elkaar bestaan. Houd de
polling-metagegevens van elke bestaande gegevensbron consistent met het bijbehorende bestand; het enkel wijzigen van een
databaseprofielverwijzing migreert de stap, velden of archieven niet.

**Opnieuw opbouwen.** Verwijder de gegevensbron en maak deze opnieuw aan. Snel, en de geschiedenis is verdwenen.

**Samenvoegen (Splice).** Het opdrachtregelprogramma splice voegt een oud bestand samen in een nieuw bestand en
kan daarbij de resolutie wijzigen, mits het nieuwe bestand al de
juiste stap heeft. Het heeft een dry-run modus. Gebruik het op een kopie voordat u het gebruikt op
iets wat belangrijk voor u is.

**RRDtool-onderhoud.** Afhankelijk van de geïnstalleerde versie en de gewenste wijziging kunnen
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) of
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) een
bestaand bestand aanpassen met behoud van bewaarde gegevens. Stop concurrerende schrijvers, bewaar
een back-up en verifieer het resultaat op een kopie. Deze bewerkingen herstellen geen details
die al door consolidatie zijn weggegooid.

## Externe profielen

Een gegevensbron kan worden ingesteld op een extern profiel, dat een stap van nul registreert.
Dat geeft aan dat het bestand buiten het normale pad wordt beheerd, en de gegevensbronnenlijst
toont het als extern in plaats van een interval te vermelden. Gebruik dit voor bestanden die een ander
proces schrijft. Gebruik het niet om "geen beleid" aan te duiden, omdat de retentie nog steeds
is waarmee het bestand is opgebouwd; het wordt alleen nergens beschreven waar u het kunt zien.

## Storingsmodi

| Symptoom | Meest voorkomende oorzaak |
|---|---|
| Een profielbewerking lijkt niets te doen | Verwacht gedrag. Bestaande bestanden behouden de vorm waarmee ze zijn aangemaakt |
| Rijenaantal en aggregatieniveau kunnen niet worden bewerkt | Het profiel is in gebruik door minstens één gegevensbron. Dupliceer het |
| De interface toont één heartbeat, het bestand gedraagt zich als een andere | De profielheartbeat is gewijzigd en de bestanden zijn nooit afgestemd |
| Nieuwe gegevensbronnen kunnen niet worden aangemaakt, logboek meldt geen archieven toegewezen | Het profiel is verwijderd terwijl gegevensbronnen er nog naar verwezen |
| Het fijnste archief staat vol met onbekenden | Controleer ontbrekende updates, heartbeat en consolidatieregels |
| Een week aan grafieken vertoont om de paar uur hiaten | Heartbeat te dicht bij de stap voor een poller die vertraging oploopt |
| Pieken die gisteren zichtbaar waren, ontbreken in de maandweergave | Alleen `AVERAGE` wordt bewaard, of het `MAX`-archief is verwijderd om ruimte te besparen |
| Schijfruimte groeide vier keer sneller dan geschat | De schatting telde archieven, maar geen consolidatiefuncties |
| Een gewenste resolutie ontbreekt in het dropdownmenu voor nieuwe archieven | De editor biedt een fijnste archief bij de profielstap, daarna alleen keuzes die grover zijn dan bestaande archieven |
