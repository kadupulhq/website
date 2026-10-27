---
title: "Veilig upgraden"
description: "Oefen een upgrade, bewaar afgestemde back-ups, controleer opslag- en schemastatus en plan een gecoördineerde rollback."
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
sidebar:
  order: 8
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat je
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Een upgrade verandert drie zaken op verschillende momenten en met verschillende omkeerbaarheid.

| Wijzigingen | Omkeerbaar | Hoe |
|---|---|---|
| Code, afhankelijkheden en configuratie | Vanaf een bewaarde kopie | Herstel de bijbehorende revisie en instellingen |
| Databaseschema en metingen in de wachtrij | Vanaf een afgestemde back-up | Herstel de database; er is geen automatische migratie terug |
| RRD-bestanden | Vanaf een afgestemde back-up | Herstel bewaarde geschiedenis; metingen die ontbreken in de back-up kunnen niet worden hersteld door een rollback |

De procedure bestaat om die drie synchroon te houden.

## Voordat je begint

**Maak de volledige back-up.** Alle drie de onderdelen, consistent met elkaar. Volg
[Back-up en herstel](/nl/guides/back-up-and-restore/). Stop alle schrijvers vóór de
definitieve opname en bewaar de beveiligde back-up tot de acceptatie van de upgrade.

**Noteer de huidige revisie en schemaversie.** Neem afhankelijkheden, lokale wijzigingen,
plugins en configuratie op. Meerdere broncoderevisies kunnen dezelfde schemaversie
rapporteren. Oefen de doelrevisie op een geïsoleerde, herstelde kopie.

**Controleer elke plugin.** Inspecteer de compatibiliteitsverklaring, code en afhankelijkheden,
en test vervolgens de benodigde functies tegen de doelrevisie. Een verklaring van een minimale
versie alleen toont nog geen compatibiliteit aan. Zie
[Plugin-validatie](/nl/guides/install-and-vet-plugins/).

**Controleer de runtime.** PHP-versie, PHP-extensies en de versie van de databaseserver.
Controleer de [vereisten](/nl/reference/requirements/) van het doel vóór de uitrol. Ga er niet
van uit dat de schema-CLI elke controle van het webinstallatieprogramma uitvoert.

**Controleer of het database-account het schema kan wijzigen.** Tijdens runtime moet het account
kunnen lezen en schrijven binnen zijn eigen database. Bij een upgrade moet het ook tabellen
en indexen kunnen maken, wijzigen en verwijderen. Installaties die de rechten na de installatie
hebben aangescherpt, ontdekken dit hier.

**Stop elke producent.** Stop geplande gegevensverzameling, externe collectors, via het web
geactiveerde verzamelingen en handmatig onderhoud; wacht tot lopend werk is voltooid. Voer
uitgestelde schrijfacties pas af nadat producenten zijn gestopt, en bewaar niet-bevestigde
wachtrijrijen bij de bijbehorende back-up. Houd producenten gestopt tijdens de uitrol en
schemavalidatie.

## De applicatie vervangen

Een overlay-kopie heeft specifieke beperkingen:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Zonder dat maakt `cp -a /path/to/new-release /path/to/kadupul` de map
`kadupul/new-release/` aan en laat elk bestand van de oude applicatie precies staan waar
het stond. De upgrade lijkt te zijn geslaagd, de interface draait nog steeds de oude code,
en het eerste teken van problemen is de schemamigratie die weigert te matchen met een
versie waarvan je dacht dat je die had vervangen.

Een kopie over de bestaande map heen behoudt bestanden die ontbreken in de nieuwe structuur,
inclusief verouderde applicatiebestanden. Het kan alle overeenkomende paden overschrijven,
dus inspecteer het artefact in plaats van aan te nemen dat configuratie of gegevens zijn
uitgesloten. Geef de voorkeur aan een gecontroleerde voorbereidingsstructuur met passende
afhankelijkheden, configuratie en plugins. Als je van release wisselt via een symlink,
valideer dan het effectieve RRA-pad en de opslagtoegang vóór de overstap; de huidige
bootstrap leidt dit af uit de applicatiemap plus `/rra`. Een symlink-wissel alleen is
geen database-rollback.

**Controleer wat je daadwerkelijk uitvoert voordat je verdergaat.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Als dat niet de release meldt die je zojuist hebt uitgerold, stop dan. Alles na dit punt
gaat ervan uit dat de bedoelde code is geïnstalleerd. Vergelijk ook de bronrevisie of
artefactcontrolesom met het releaseverslag; de versietekenreeks alleen is niet voldoende.

## De schemamigratie

De database heeft zijn eigen versie, los van de versie in de code. Het vervangen van de
code verandert daar niets aan.

Oudere geauthenticeerde pagina's verwijzen door naar het installatieprogramma wanneer code-
en databaseversies niet overeenkomen. Dit is geen universele beveiliging voor elk eindpunt
of elke CLI, en overeenkomende versietekenreeksen bewijzen niet dat elke migratie is voltooid.
Controleer de schemastatus rechtstreeks.

Het installatieprogramma en de CLI voeren geordende migratiestappen uit. Controleer vóór
de normale schemaupgrade de duurzame wachtrij en de opslagtoegang van het serviceaccount.
Als een overgenomen `poller_output`-wachtrij geen InnoDB is, converteer deze dan expliciet
terwijl schrijvers zijn gestopt en de back-up behouden blijft:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Voer dit vervolgens uit onder elk daadwerkelijk web- en poller-account:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

De twee vlaggen zijn afzonderlijke bewerkingen en kunnen niet worden gecombineerd.
Wachtrijconversie behoudt wachtende metingen; kap geen rijen af om een controle te laten slagen.
Los configuraties voor eigenaarschap en numerieke vertrouwde UID/GID op aan de hand van de
[opslagvereisten](/nl/reference/requirements/). Online externe collectors kiezen normaal gesproken
de hoofdwachtrij; gebruik `--local` alleen voor een opzettelijke lokale wachtrijcontrole of
-conversie. Zodra die controles slagen, voer je de schemaupgrade uit vanuit de hoofdmap van
de applicatie:

```sh
php cli/upgrade_database.php
```

Voer het uit als het geconfigureerde serviceaccount met de vereiste bestandssysteemtoegang en
databasebevoegdheden. Een geslaagde root-controle bewijst geen toegang voor het serviceaccount.
Er is een optie `--forcever` om de beginversie expliciet in te stellen, die bedoeld is voor
het opnieuw uitvoeren van een migratie tijdens pre-release tests. Het maakt geen deel uit van
een normale upgrade en het gebruik ervan om een mislukte stap over te slaan laat het schema
half gemigreerd achter.

Leg de afsluitstatus en uitvoer vast en verifieer vervolgens de databaseversie en vereiste
schemawijzigingen. De huidige CLI kan een onbekende of niet-ondersteunde verouderde beginversie
weigeren en toch met code 0 afsluiten; een geslaagde shellstatus alleen is onvoldoende.
Als de migratie halverwege mislukt, houd producenten dan gestopt en herstel de bijbehorende
back-upset in plaats van te proberen de mislukte stap over te slaan.

## Wat plugins kapotmaakt

De plugincontroles van het webinstallatieprogramma kunnen incompatibele of ontbrekende plugins
uitschakelen. Ga er niet van uit dat de schema-CLI dezelfde controles voor de levenscyclus van
plugins uitvoert.

**De opgegeven minimale versie ligt boven de nieuwe coreversie.** Uitgeschakeld. Dit is het
normale geval en het is het geval dat je controle vóór de upgrade had moeten opvangen.

**De pluginmap, het setupbestand of het declaratiebestand ontbreekt.** Uitgeschakeld. Een
plugin waarvan de bestanden zijn verwijderd terwijl deze in de database nog als ingeschakeld
stond gemarkeerd, valt hieronder.

**De plugin heeft helemaal geen declaratiebestand.** Deze kan zakken voor de compatibiliteitscontrole
van het installatieprogramma. Test een onderhouden, compatibel pluginpakket in plaats van aan
te nemen dat het ongewijzigd weer kan worden ingeschakeld.

Er is een vierde geval dat geen defect is. Functionaliteit die ooit een plugin was en sindsdien
naar de kern is verplaatst, wordt ronduit verwijderd, niet uitgeschakeld: de hooks en
machtigingen worden gewist en de rij wordt verwijderd. Als je een plugin ziet verdwijnen in
plaats van grijs worden, controleer dan de migratielogboeken en de status van de specifieke
plugin voordat je concludeert dat gelijkwaardige functies beschikbaar zijn.

Het uitschakelen van een plugin is iets anders dan het de-installeren ervan. Plugin-hooks en
-migraties kunnen hun eigen tabellen en machtigingen wijzigen; bewaar passende plugincode en
-gegevens en verifieer het specifieke upgradepad. Beloof geen universeel gegevensbehoud."

## Rollback-planning

Beslis over de rollback voordat je begint, omdat de beslissing verschilt afhankelijk van hoe ver je bent gekomen.

| Storingspunt | Terugdraaien door |
|---|---|
| Code vervangen, geen statusveranderende bewerking of schrijver uitgevoerd | Herstel de eerdere code, afhankelijkheden en configuratie na bevestiging dat de status ongewijzigd is |
| Wachtrijconversie of migratie gestart, inclusief gedeeltelijke storing | Stop schrijvers en herstel bijbehorende code-, configuratie-, database- en RRD-back-ups |
| Migratie voltooid, applicatie vertoont fouten | Stop schrijvers en herstel de afgestemde back-upset; houd rekening met metingen die na de back-up zijn verzameld |
| Alleen een plugin is defect | Houd deze uitgeschakeld terwijl herstel versus gecoördineerde rollback wordt beoordeeld aan de hand van acceptatiecriteria |

De regel onder de tabel: code en schema rollen samen terug of helemaal niet. Oude code tegenover
een nieuw schema is geen ondersteunde status. Vertrouw niet op de webversiecontrole om elke
incompatibele bewerking te voorkomen.

Stel een tijdslimiet in. Bepaal vooraf hoeveel tijd je besteedt aan foutopsporing voordat je
herstelt, en houd je daaraan. De back-up wordt minder nuttig naarmate het systeem langer half
geüpgraded draait.

## Waarom RRD-bestanden het onderdeel zijn dat je niet mag verliezen

Ga er niet van uit dat uitrol, onderhoud of hervatte gegevensverzameling RRD's ongewijzigd laten.
Maak een back-up samen met de database en herstel de afgestemde set bij het terugdraaien van
statuswijzigingen. Bewaarde wachtrijmetingen bestaan mogelijk nog niet in die bestanden. Een
geverifieerde RRD-back-up kan zijn vastgelegde geschiedenis herstellen; een ontbrekende meting kan
niet worden gereconstrueerd door louter schema of code te herstellen. Zie
[Gegevensbronnen en round-robin-archieven](/nl/concepts/data-sources-and-rras/) voor de reden waarom
de resolutie daarin evenmin kan worden gereconstrueerd.

Drie specifieke manieren waarop mensen ze verliezen tijdens een upgrade:

**Uitrollen door de installatiemap te vervangen.** De RRA-map is standaard een submap van de
installatie. Het verwijderen van de oude map en het uitpakken van de nieuwe op die plek kan
bewaarde metingen wissen. Behoud de RRA-structuur via een geteste opslagopzet voordat je de
applicatie vervangt. Valideer het effectieve `$config['rra_path']`, geneste paden en
vertrouwenscontroles van het serviceaccount; deze revisie biedt geen algemene database-instelling
voor een willekeurige lokale RRA-hoofdmap.

**Uitrollen vanuit een checkout of een pakket dat de hele structuur beheert.** Dezelfde fout,
geautomatiseerd. Controleer wat jouw uitrolmethode als verwijderbaar beschouwt.

**Machtigingen herstellen met een recursieve wijziging van eigenaarschap.** Onschadelijk voor de
gegevens, maar het kan ertoe leiden dat de poller niet meer kan schrijven, wat zich uit als een
systeem dat de geschiedenis perfect weergeeft en niets nieuws verzamelt.

## Na de upgrade

1. Inspecteer de upgrade-uitvoer, databaseversie en vereiste schemawijzigingen en controleer
   vervolgens of de interface laadt. Een afwezige doorverwijzing alleen is onvoldoende.
2. Voltooi de geplande code- en configuratie-upgrades van externe collectors en valideer hun
   databasedoelen terwijl hun producenten gestopt blijven.
3. Herhaal de opslagcontroles voor het serviceaccount, hervat de aangewezen collectors en
   verifieer representatieve tijdstippen van de laatste update en bruikbare bewaarde waarden van RRD's.
4. Controleer het logboek op de regel met run-statistieken en vergelijk de verstreken tijd met
   hoe het voorheen was. Een nieuwe release kan de verzamelingskosten veranderen.
5. Schakel de uitgeschakelde plugins weer een voor een in, na het installeren van versies die
   compatibiliteit met de nieuwe kern verklaren.
6. Controleer de wachtrijdiepte, externe verzameling en plugintaken gedurende het afgesproken
   acceptatievenster. Bewaar de rollback-back-up totdat die controles slagen.
