---
title: Vragen
description: Korte antwoorden op wat nieuwkomers en bestaande Cacti-gebruikers als eerste vragen, met een link naar de pagina die elke vraag volledig behandelt.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. De code is beschikbaar, maar er is geen ondersteunde productierelease of gevalideerd migratiepad. Gebruik het niet in productie.
sidebar:
  order: 7
---

Korte antwoorden. Elk antwoord linkt naar de pagina die het onderwerp volledig behandelt.

## Het project

### Kan ik het vandaag installeren?

De broncode is beschikbaar voor ontwikkeling en geïsoleerd testen. Er is geen ondersteunde release of gevalideerd installatiepad voor productie.

De installatie- en handleidingspagina's vereisen validatie tegen de code die u gebruikt. Zie [Status](/nl/project/status/).

### Is het klaar voor productie?

Nee. De repository beschrijft Kadupul als pre-alfa en niet klaar voor productie. Releasestatus zegt niets over de vraag of iemand ontwikkelcode heeft ingezet.

### Is dit een vervanging voor Cacti?

Kadupul is een onafhankelijke fork met eigen ontwikkelingsprioriteiten en ondersteuningskanalen. Het bevindt zich in de pre-alfafase; een migratie vereist validatie voor de gebruikte versies en extensies. Zie [Overstappen vanaf Cacti](/nl/guides/coming-from-cacti/).

### Waarom een apart project?

Kadupul biedt de ruimte om subsystemen te vervangen, de taalbasis te verhogen en interne interfaces aan te passen onder een eigen releasebeleid. Zie [Waarom deze fork bestaat](/nl/project/why-this-fork/).

### Van welke Cacti-versie is het afgeleid?

De applicatie is afgeleid van Cacti 1.2.31. De repository onderhoudt `main` en `lts/1.2` branches met verschillende releasedoelen. Zie [Status](/nl/project/status/).

### Wie onderhoudt het?

Het Kadupul-project onderhoudt de repository. Gebruik de issue tracker en het [bijdrageproces](/nl/project/contributing/) voor projectwerkzaamheden.

### Is er een roadmap? Een releasefrequentie? Een ondersteuningsbeleid?

De repository heeft releasedoelen, een versiebeleid en een bijdrageproces. Er is nog geen ondersteunde productierelease. Zie [Status](/nl/project/status/) voor het onderscheid tussen geplande versies en gepubliceerde artefacten.

### Is het gelieerd aan The Cacti Group?

Nee. Kadupul is niet gelieerd aan of onderschreven door The Cacti Group. Het beschrijft zichzelf als een fork van Cacti omdat dat een feitelijke weergave is van waar de code vandaan komt. Cacti is hun project en hun naam.

### Waar staat de naam voor?

Kadupul is de Singalese naam voor een nachtbloeiende cactus. Cacti ontleent zijn naam aan de plantenfamilie; Kadupul is één soort daarbinnen. De naam geeft aan waar het project vandaan komt zonder te claimen het geheel te vertegenwoordigen. De uitgebreide versie staat in [Wat Kadupul is](/nl/start/what-kadupul-is/).

## Overstappen vanaf Cacti

### Zullen mijn plugins werken?

Dat is de bedoeling. De plugin-API is een van de vier compatibiliteitsdoelen. Het ongewijzigd laden en uitvoeren van een Cacti-plugin moet worden aangetoond voor de gebruikte versies.

Compatibiliteit is een doel, geen algemeen bewijs voor elke plugin. Controleer de plugins en versies waarvan u daadwerkelijk afhankelijk bent voordat u een migratie plant. Zie [Compatibiliteit met Cacti](/nl/project/compatibility-with-cacti/) en [Overstappen vanaf Cacti](/nl/guides/coming-from-cacti/).

### Zullen mijn RRD-bestanden werken?

Het behoud van RRD-historie is een compatibiliteitsdoel. De bestanden bevatten geschiedenis die u niet opnieuw kunt genereren. Valideer het lezen van bestaande bestanden op een kopie voorafgaand aan een migratie.

Elke migratie die vraagt om deze te verwijderen en opnieuw aan te maken, vraagt om iets dat u moet weigeren. Zie [Overstappen vanaf Cacti](/nl/guides/coming-from-cacti/).

### Worden mijn sjablonen en database overgedragen?

Sjablonen zijn bedoeld om ongewijzigd te importeren. Het schema moet herkenbaar en migreerbaar blijven zonder export naar een uitwisselingsformaat. Dit zijn doelen die validatie vereisen, net als bij plugins en RRD-bestanden.

### Hoe kom ik te weten waar Kadupul en Cacti verschillen?

Doordat het wordt opgeschreven. De foutmodus die het project wil voorkomen is niet divergentie, wat juist het doel van een fork is. Het is divergentie die niemand heeft gedocumenteerd, waardoor elke upgrade verandert in een onderzoek.

### Werkt het met Spine?

Kadupul zal naast de PHP-collector een Spine-fork onderhouden. De repositorylocatie en gevalideerde builds zijn hier nog niet gedocumenteerd. Spine wordt afzonderlijk gebouwd en geïnstalleerd. De overgenomen integratie omvat de instellingen voor `poller_type` en paden, de opdrachtregel van de bovenliggende poller, de instellingen die Spine leest en de tabellen waarnaar het schrijft.

Valideer uw versies van Kadupul en Spine samen voorafgaand aan een overstap. Meld problemen in de [Kadupul issue tracker](https://github.com/kadupulhq/kadupul/issues). Zie [Spine, de C-collector](/nl/reference/spine/) voor configuratie- en bouwhandleidingen.

### Werkt het met de RRDtool-proxy?

Kadupul gebruikt de proxy-daemon van de Cacti-organisatie niet. Gebruik lokale RRDtool-opslag. De [RRDtool-proxy-referentie](/nl/reference/rrdproxy/) beschrijft het overgenomen clientprotocol; het is geen ondersteunde implementatieoptie. Een door Kadupul beheerde vervanging moet worden vastgesteld en gevalideerd voordat proxy-implementatie wordt gedocumenteerd.

### Wat is er nodig om het uit te voeren?

Een webserver met PHP, MySQL of MariaDB, RRDtool en een mechanisme om de poller volgens schema uit te voeren. De versies en extensies staan op [Vereisten](/nl/reference/requirements/).

## Licentiëring

### Onder welke licentie valt de software?

GPL-3.0-or-later.

### Cacti vermeldt GPL-2. Hoe kan een fork dan GPL-3 zijn?

De overgenomen applicatielicentie staat GPL versie 2 of later toe. Kadupul gebruikt de optie voor de latere versie voor de distributie. Afhankelijkheden behouden hun eigen licentievoorwaarden. Zie [Licentie](/nl/project/license/).

### Welke licentie heeft deze documentatie?

CC BY-SA 4.0. De code van de site blijft onder GPL-3.0-or-later met de rest van het project. Hergebruik de tekst als u het project vermeldt en wat u bouwt onder dezelfde voorwaarden licentieert.

### Waar komen deze pagina's vandaan?

Deze pagina's beschrijven gedrag vanuit de applicatiebroncode. Proza van derden vereist een eigen licentiebeoordeling voorafgaand aan hergebruik.

Die beperking geldt ook voor bijdragen. Documentatiewijzigingen baseren hun claims op code. Zie [Bijdragen](/nl/project/contributing/).

## Deelnemen

### Hoe meld ik een beveiligingslek?

Vertrouwelijk, via GitHub Security Advisories op de betreffende repository. Niet als een openbaar issue.

Niet-uitgebrachte code kan in gebruik zijn genomen en kwetsbaarheden bevatten. Meld vertrouwelijk, ongeacht de releasestatus. Zie [Beveiligingsbeleid](/nl/project/security/).

### Een kwetsbaarheid die ik hier vind, heeft waarschijnlijk ook invloed op Cacti. Wat gebeurt er dan?

Meld dit vertrouwelijk aan Kadupul en vermeld wat u weet over de gedeelde code. Kadupul-maintainers verzorgen de triage en oplossing voor Kadupul onder het [beveiligingsbeleid van de repository](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Hoe draag ik bij?

Lees [Bijdragen](/nl/project/contributing/) en de gids voor bijdragers op uw doelbranch. Bespreek substantiële wijzigingen voordat u ze implementeert.

### Ik heb iets gevonden dat niet klopt op deze site.

Mooi. Elke pagina hier is geschreven op basis van de broncode, en alles wat onjuist is, is onjuist op eigen merites. Elke pagina heeft een bewerkingslink.
