---
title: Sjablonen
description: Hoe één definitie honderd apparaten dekt en wat er gebeurt als je deze wijzigt.
sidebar:
  order: 3
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
---

Sjablonen bestaan zodat het toevoegen van de honderdste switch evenveel moeite kost als het toevoegen van de tweede. Er zijn vier soorten en ze stapelen op elkaar.

Volg voor een praktische volgorde [Sjablonen gebruiken en valideren](/nl/guides/template-workflow/).

**Gegevenssjablonen** definiëren wat er moet worden verzameld en hoe dit wordt opgeslagen: de velden, hun typen, hun grenzen, het opslagprofiel en welke invoermethode de getallen ophaalt. Velden per object en bestaande RRD-bestanden kunnen afwijken van het huidige sjabloon; het sjabloon is geen bewijs van de bestandsindeling.

**Grafieksjablonen** definiëren hoe het getekend moet worden: welke items, in welke volgorde, welke kleuren, welke legendaregels en wat de as vermeldt.

**Apparaatsjablonen** bundelen de gegevensquery's en grafieksjablonen die passen bij een hardwareklasse, zodat het kiezen van de juiste bij het toevoegen van een apparaat het meeste werk doet.

**Gegevensquery's** behandelen het geval waarin je vooraf niet weet hoeveel objecten er zijn. Een switch heeft een aantal poorten, ontdekt door het apparaat te doorlopen, en een gegevensquery legt geïndexeerde resultaten vast voor het maken van grafieken. Detectie alleen creëert geen vast aantal grafieken of gegevensbronnen.

## Hoe ze op elkaar stapelen

De vier zijn geen vier lagen van hetzelfde object. Elk verwijst naar de volgende door ernaar te wijzen.

| Soort | Verwijst naar | Produceert |
|---|---|---|
| Apparaatsjabloon | Grafieksjablonen en gegevensquery's | Niets rechtstreeks. Het is een lijst van wat aan te bieden voor een apparaat |
| Gegevensquery | Grafiekdefinities en toewijzingen voor geïndexeerde resultaten | Ontdekte rijen; geselecteerde grafiekcreatie kan gegevensbronnen maken of hergebruiken |
| Grafieksjabloon | Gegevenssjabloonvelden waar een item data nodig heeft | Een grafiek die naar meerdere gegevensbronnen kan verwijzen |
| Gegevenssjabloon | Een invoermethode en een opslagprofiel | Gegevensbron-metadata; een RRD wordt aangemaakt wanneer het schrijfpad dit nodig heeft |

Data-dragende sjabloonitems verwijzen naar sjabloonvelden; geïnstantieerde items worden toegewezen aan lokale velden. Tekst- en constante-items hebben geen gegevensbronverwijzing nodig. Het aanmaken van grafieken lost die toewijzingen op en latere herindeling of itemwijzigingen kunnen ze ook veranderen. Grafiekcreatie kan compatibele gegevensbronnen hergebruiken in plaats van voor elke grafiek een nieuw bestand aan te maken.

## Sjabloonmatig of per object

Veel velden op grafiek- en gegevensbronniveau hebben bijbehorende vlaggen op de sjabloonrij. Voor die velden bepaalt de vlag de normale doorgifte naar gekoppelde onderliggende elementen. Andere velden, grafiekitems en invoertoewijzingen hebben afzonderlijke overdrachtsregels.

| Vlag | Betekenis | Bij opslaan |
|---|---|---|
| Uitgeschakeld | Het veld is sjabloonmatig | Geschreven naar elk onderliggend element, waarbij bestaande waarden worden overschreven |
| Ingeschakeld | Het veld is per object | Blijft onaangeroerd op elk onderliggend element |

De vlag geldt per veld. Een grafieksjabloon kan zijn aslabel doorgeven aan gekoppelde grafieken, terwijl de titel en de verticale limiet worden overgelaten aan degene die ze heeft gemaakt. Die mix is de normale situatie, geen uitzondering.

Twee eigenschappen van dit ontwerp verrassen gebruikers vaak.

De vlag bevindt zich op het sjabloon en bepaalt alleen wat de volgende opslagactie doet. Een veld markeren als per object nadat een opslag het al heeft overschreven, herstelt niets. De oude individuele waarden zijn verdwenen; de vlag beschermt toekomstige waarden.

Het omgekeerde is erger. Het uitschakelen van de vlag op een veld dat jarenlang per object is geweest, zorgt ervoor dat één enkele opslagactie dat veld op elk onderliggend item tegelijk overschrijft met de waarde van het sjabloon, wat vaak een tijdelijke aanduiding is waar niemand naar heeft gekeken.

### Niet elk veld heeft een vlag

Een veld doet alleen mee als er een vlag voor bestaat. Op gegevensbronniveau hebben vier velden een vlag en twee bewust niet.

| Veld | Vlag | Gedrag |
|---|---|---|
| Naam | Ja | Sjabloonmatig of per object |
| Actief | Ja | Sjabloonmatig of per object |
| Stapgrootte | Ja | Sjabloonmatig of per object |
| Opslagprofiel | Ja | Sjabloonmatig of per object |
| Invoermethode | Nee, altijd sjabloonmatig | De opslaghandler van het sjabloon werkt gekoppelde gegevensbronrijen expliciet bij |
| Pad naar het RRD-bestand | Nee, nooit sjabloonmatig | Normale sjabloonoverdrachten sluiten dit uit; hersjabloneren behoudt het bestaande pad |

Padbehoud beschermt de bestaande koppeling met historische gegevens tijdens normale sjabloonwijzigingen. Het betekent niet dat paden niet kunnen worden bewerkt of verplaatst via andere administratieve bewerkingen. Controleer de bestandsidentiteit voordat je ze wijzigt.

Velden op een gegevensbronitem hebben allemaal een vlag: de veldnaam, het type, de heartbeat, het minimum, het maximum en welk invoerveld het voedt.

## Grafiekinvoer werkt in de andere richting

Een grafieksjabloon kan een benoemde invoer declareren die meerdere grafiekitems aan één bewerkbaar veld koppelt, zodat het bewerken van één waarde op een grafiek elk item bijwerkt dat deze deelt. Dat is het mechanisme achter een enkele kleur- of legende-instelling die een groep gerelateerde items bestuurt.

De waarde die het pusht is niet die van het sjabloon. Het leest de huidige waarde van de andere items die bij de invoer horen en geeft die door. Een grafiekinvoer verspreidt zich daarom zijwaarts over de items van een grafiek in plaats van neerwaarts vanuit het sjabloon, waardoor het bewerken van een invoer een grafiek kan wijzigen die het sjabloon zelf niet heeft geraakt.

## Wat wordt doorgegeven en wanneer

| Wijziging | Bereikt bestaande objecten | Hoe |
|---|---|---|
| Grafieksjabloonveld, sjabloonmatig | Ja, bij opslaan | Geschreven naar elke grafiek van dat sjabloon |
| Grafieksjabloonveld, per object | Nee | Het onderliggende object behoudt zijn eigen waarde |
| Uiterlijk van grafiekitem | Ja, bij opslaan | Kleur, transparantie, itemtype, lijndikte, onderbroken lijnen, CDEF, VDEF, verschuiving, consolidatiefunctie, uitlijning, tekst en legende-opmaak |
| Grafiekitem toegevoegd, verwijderd of opnieuw toegewezen | Bewerkingsafhankelijk | Afstemmen, toevoegen, verwijderen en opnieuw toewijzen gebruiken verschillende paden; controleer de resulterende toewijzingen |
| Gegevenssjabloonveld, sjabloonmatig | Ja, bij opslaan | Geschreven naar elke gegevensbron van dat sjabloon |
| Invoerveldwaarden van gegevenssjabloon | Indien sjabloonmatig | Sjabloon- en onderliggende vlaggen, query-indexvelden en hostregels beperken de overdracht |
| Opslagprofiel, stapgrootte, archieven van gegevenssjabloon | Alleen database | Bestaande bestanden behouden de structuur waarmee ze zijn gemaakt |
| Velden toegevoegd aan een gegevenssjabloon | Alleen database | Bestaande bestanden hebben geen ruimte om ze op te slaan |
| Inhoud van apparaatsjabloon | Aparte synchronisatie | Het bewerken van koppelingen synchroniseert niet automatisch elk bestaand apparaat |

Doorgifte in de database hangt af van het opslagpad en de overschrijfregels. Het bijwerken van sjabloon-metadata migreert bestaande RRD-bestanden niet automatisch; bestandsbeheer is een afzonderlijke bewerking. Sommige structurele instellingen zijn alleen-lezen in de editor voor actieve gegevenssjablonen. Zie [Aangepaste sjablonen maken](/nl/guides/create-custom-templates/).

## Apparaatsjablonen hebben een expliciet synchronisatiepad

Het bewerken van de koppelingen van een apparaatsjabloon verandert wat het biedt aan nieuwe apparaten. Bestaande apparaten gebruiken een afzonderlijke herstel-/synchronisatiebewerking. De batch-helper selecteert standaard apparaten in de status Up of Recovering, tenzij inactieve apparaten expliciet worden opgenomen; controleer de selectie vooraf.

Synchronisatie voegt ontbrekende grafieksjabloonkoppelingen toe, vernieuwt geselecteerde gegevensquery's en kan ongebruikte grafieksjabloonkoppelingen verwijderen. Het verwijdert bestaande grafieken niet rechtstreeks alleen omdat hun sjabloon uit het apparaatsjabloon is verwijderd. Het activeert ook automatiserings- en plug-in-hooks, waardoor geconfigureerde grafiekautomatisering kan worden uitgevoerd.

Controleer de resulterende apparaatkoppelingen en grafieken na synchronisatie. Ze zijn niet noodzakelijk een permanente vereniging van elke ooit toegepaste sjabloonversie.

## Indexen en waarom poorten verplaatsen

Een gegevensquery moet beslissen welk ontdekt object overeenkomt met welke bestaande gegevensbron. Dat is de index. Numerieke indexen kunnen veranderen na hardware- of configuratiewijzigingen. Een geschikt stabiel veld kan helpen de identiteit te behouden, maar interfacenamen kunnen ook worden hernoemd of hergebruikt. Controleer uniciteit, persistentie en het herindexeringsgedrag op het apparaat zelf; geen enkele veldnaam garandeert continuïteit op zichzelf.

Deze beslissing lijkt triviaal wanneer je haar neemt en kostbaar wanneer ze verkeerd uitpakt. Ze wordt ook per apparaat per run genomen in plaats van eenmalig voor de query, waardoor twee identieke switches op verschillende velden kunnen worden geïndexeerd. Hoe het veld wordt gekozen, wat er gebeurt als een index verdwijnt en wat het kost om hernummering te detecteren, staat in [Gegevensquery's en indexen](/nl/concepts/data-queries-and-indexes/).

## Een sjabloon later wijzigen

Grafiekwijzigingen beïnvloeden de weergave na opslag en doorgifte. Overschrijvingen en caching kunnen de weergave beïnvloeden; ga er niet van uit dat elke grafiek onmiddellijk verandert. Inspecteer een representatieve onderliggende grafiek en zijn toewijzingen; zie [Grafiekweergave afstemmen](/nl/guides/tune-graph-appearance/).

Het opslaan van een gegevenssjabloon past bestaande RRD-bestanden niet automatisch aan. De werkelijke definities en archieven van het bestand kunnen afwijken van het databaseprofiel. Inspecteer beide vóór onderhoud; het opnieuw maken van een bestand is slechts één optie.

Afhankelijk van de wijziging kunnen ondersteunde RRDtool-aanpassingen, het wijzigen van de archiefgrootte of gecontroleerde dump-/herstelwerkzaamheden de geschiedenis geheel of gedeeltelijk behouden. Die bewerkingen hebben grenzen en vereisen back-ups en verificatie; ze reconstrueren geen gegevens die nooit zijn opgeslagen. Het verwijderen en opnieuw maken van een bestand wist de geschiedenis. Zie [Gegevensretentie beheren](/nl/guides/manage-data-retention/) en [Gegevensbronnen en round-robin archieven](/nl/concepts/data-sources-and-rras/).

## Andere zaken die sjablonen worden genoemd

Vier andere objecten dragen het woord en gedragen zich niet zoals de vier hierboven. Kleursjablonen zijn benoemde paletten die worden toegepast op grafiekitems. Aggregaatsjablonen beschrijven hoe meerdere grafieken in één worden gecombineerd. Automatiseringssjablonen koppelen ontdekte apparaten aan een apparaatsjabloon. Grafiekvoorinstellingen leveren herbruikbare legende-opmaken.

Geen van deze bevindt zich in de hier beschreven stack. Ze zijn vooral nuttig om te kennen, zodat een zoekresultaat waarin een sjabloon wordt genoemd als het juiste type wordt geïnterpreteerd.
