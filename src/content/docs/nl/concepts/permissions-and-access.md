---
title: Machtigingen en toegang
description: Waarom toegang is opgesplitst in twee onafhankelijke systemen, waarom een machtiging wordt opgeslagen als standaard plus uitzonderingen en waarom een boom er voor elk account anders uitziet.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
sidebar:
  order: 8
---

Toegang kent afzonderlijke controles voor realms en objectbeleid. Realms bepalen welke
interfacefuncties een account mag gebruiken; objectbeleid bepaalt toegestane grafieken, apparaten,
sjablonen en bomen. Een verzoek kan van beide afhangen. Realm-toekenningen verlenen op zichzelf geen
toegang tot grafieken, en grafiektoekenningen verlenen op zichzelf geen Console-functies. Accountstatus,
authenticatiemodus en weergave-instellingen spelen eveneens een rol.

Deze pagina legt uit waarom het model zo is opgebouwd. Voor de praktische stappen bij het instellen van
een account, zie [Gebruikers en machtigingen beheren](/nl/guides/manage-users-and-permissions/).

## Waarom twee systemen

De twee vragen zijn niet van dezelfde aard.

Het bereiken van een pagina betreft code. Het account mag de apparaateditor uitvoeren of niet, en er is
één antwoord voor de gehele installatie. Het zien van een apparaat betreft gegevens. Er zijn duizenden
apparaten en het antwoord verschilt voor elk apparaat.

Het samenvoegen ervan zou een machtiging per pagina per object betekenen, wat het product is van twee
lijsten die beide groeien. Door ze te splitsen ontstaat één lijst met interfacesecties – vast en klein –
en één set regels per object. De prijs van de scheiding is dat beide moeten worden geconfigureerd, en een
account dat in een van beide verkeerd is geconfigureerd, lijkt op dezelfde manier defect.

## Realms zijn een vaste genummerde lijst

Een realm identificeert een interfacemachtiging met een nummer. Kernkoppelingen verbinden pagina's met
realms, terwijl plugins aanvullende realms kunnen registreren. Controleer de vereiste realms en
identiteit voor de werkelijke route in plaats van paginatoegang te beschouwen als een volledige
objectautorisatiebeslissing.

Nummers in plaats van bestandsnamen, omdat een realm meerdere pagina's dekt en pagina's worden hernoemd.
Het nummer blijft bestaan; de bestandenlijst erachter is een toewijzing die kan veranderen zonder enig
account aan te passen.

De realms van een account zijn afkomstig van het account zelf en van ingeschakelde groepen waartoe het
behoort, gecombineerd als een vereniging. Rollen zijn sets realm-nummers die in één actie worden
toegepast. Een rol schrijft zijn nummers naar het account en is daarna klaar: het is een startpunt,
geen actieve koppeling, waardoor een account dat op basis van een rol is aangemaakt niet verandert
wanneer de rol verandert.

Plugins voegen hun eigen realms toe, die afzonderlijk worden opgeslagen en door accounts op exact dezelfde
manier worden beheerd als kernrealms. Een plugin levert daarom een nieuw toegangsgecontroleerd oppervlak
op dat uw bestaande beleid expliciet moet beoordelen. Zie [Plugins](/nl/concepts/plugins/).

## Objecten worden opgeslagen als standaard plus uitzonderingen

Vier soorten objecten dragen machtigingen: grafieken, apparaten, grafieksjablonen en bomen.

Voor elk type heeft een account (of een groep) één standaardbeleid en een lijst met uitzonderingen.
Een uitzondering is een enkele rij: wie, welk object, welk type. De rij is identiek in beide beleidsmodi.
Het beleid bepaalt wat de rij betekent.

Dit is de dragende beslissing in het gehele model. Alleen afwijkingen van de standaard worden opgeslagen
in de uitzonderingstabellen. Toestaan-standaarden zonder uitzonderingen kunnen brede beleidstoegang
verlenen zonder uitzonderingsrijen; de account-, standaard- en realm-rijen bestaan nog steeds. Vijf
expliciet toegestane apparaten onder een Weigeren-apparaatstandaard vereisen vijf apparaatuitzonderingen,
maar andere grafiektoekenningen en methoden kunnen de zichtbaarheid beïnvloeden. Welke kant de omgeving
ook op neigt: de opgeslagen gegevens behouden de omvang van het interessante deel en niet de omvang van
het gehele bestand.

## Waarom beide beleidsmodi bestaan

| Modus | Betekenis | Gedrag bij toevoegen van een apparaat |
|---|---|---|
| Toestaan, met uitzonderingen | Objecten van dat type behalve vermelde uitsluitingen | Het apparaatbeleid staat het nieuwe object toe; andere controles blijven van toepassing |
| Weigeren, met uitzonderingen | Alleen vermelde objecten van dat type | Deze bron verleent geen nieuw apparaat; andere bronnen of grafiektoekenningen kunnen toegang verlenen |

De standaarden verschillen in hoe ze omgaan met nieuwe objecten. Kies het beleidsbereik en het
foutgedrag weloverwogen; geen van beide beschrijft de volledige toegangscontroles van het verzoek.

"Iedereen in netwerkbeheer, behalve de twee racks van financiën" zijn twee rijen onder Toestaan en
vierduizend onder Weigeren. "Deze externe medewerker en alleen deze vijf apparaten" zijn vijf rijen onder
Weigeren en vierduizend onder Toestaan. Het afdwingen van één modus zou betekenen dat de helft van al het
reële beleid alleen kon worden geschreven door het gehele bestand op te sommen, en een dergelijke lange
lijst wordt nooit onderhouden.

Een Toestaan-standaard omvat nieuw toegevoegde objecten van dat type, tenzij ze zijn uitgesloten. Een
Weigeren-standaard vereist een expliciete uitzondering van die bron. Dit zijn semantische regels van het
standaardbeleid, geen garanties over foutafhandeling. Beoordeel andere gebruikers/groepen en
grafiekmachtigingsmethoden voordat u concludeert dat een Weigeren-apparaatstandaard de bijbehorende grafieken verbergt.

## Toegang is een vereniging en er is geen weigering

Effectieve toegang wordt geëvalueerd voor het eigen beleid van het account en voor elke ingeschakelde
groep waartoe het behoort. Voor grafiektoegang past u eerst de geselecteerde grafiekmethode binnen elke
bron toe en verenigt u vervolgens die resultaten. Onder Restrictief vormen een apparaattoekenning in de
ene groep en een sjabloontoekenning in een andere groep niet het vereiste paar.

Er bestaat geen groepsweigering die een toekenning uit een andere bron overschrijft. Een uitsluiting onder
een Toestaan-standaard verwijdert nog steeds de bijdrage van die bron; het is geen wereldwijde weigering.
Het verwijderen van een dergelijke uitsluiting breidt de toegang uit, in tegenstelling tot het verwijderen
van een toekenning onder Weigeren. Dit is een bewuste inperking: een model met zowel toekenningen als
weigeringen heeft voorrangsregels nodig, en voorrangsregels zorgen ervoor dat machtigingssystemen
onmogelijk te controleren zijn door ze simpelweg te lezen.

De gevolgen verdienen het om helder te worden benoemd.

Toegang intrekken betekent dat deze moet worden verwijderd uit het account en uit elke groep die deze
toekent. Het intrekken op één plek verwijdert niets als een andere plek het nog steeds toekent.

Het uitschakelen van een groep verwijdert de toekenningen voor alle leden tegelijk, wat een groep een
beter instrument voor intrekking maakt dan een verzameling afzonderlijke bewerkingen.

U kunt de vraag "wat kan dit account zien?" niet beantwoorden door naar één rij te kijken. U moet de
vier beleidsregels en vier lijsten van het account combineren met dezelfde gegevens van elke groep.

## Waarom grafiekmachtigingen vier methoden hebben

Een grafiek heeft drie identiteiten. De grafiek is zichzelf, behoort tot een apparaat en is opgebouwd
uit een grafieksjabloon. Alle drie kunnen machtigingen dragen, dus het model moet bepalen welke combinatie
telt. De beslissing is één installatiebrede instelling.

| Methode | De gestelde vraag | Geraadpleegde uitzonderingssets |
|---|---|---|
| Permissief | Is minimaal één van de drie toegestaan? | Drie |
| Restrictief | Is de grafiek toegestaan, of zijn zowel apparaat als sjabloon toegestaan binnen één bron? | Drie |
| Op apparaat gebaseerd | Is de grafiek of het apparaat toegestaan? | Twee |
| Op grafieksjabloon gebaseerd | Is de grafiek of het sjabloon toegestaan? | Twee |

Deze regels beschrijven de geïmplementeerde autorisatiecontroles. Directe grafiektoekenningen blijven
in alle vier de methoden van kracht; het kiezen van Op apparaat gebaseerd onderdrukt ze niet. Meet de
prestaties met het werkelijke beleid en bestand in plaats van aan te nemen dat het aantal uitzonderingssets
de querykosten voorspelt.

Permissief is de standaardwaarde en de instelling die mensen vaak verrast. Onder Permissief geeft het
toestaan van een grafieksjabloon toegang tot elke grafiek die daaruit is opgebouwd, op elk apparaat,
inclusief apparaten die nooit aan het account zijn toegekend. Het model gedraagt zich exact zoals
beschreven. De beschrijving is alleen niet wat de meeste mensen verwachten.

## Machtigingen worden gecompileerd in query's

Het filteren van grafieklijstmachtigingen is geïntegreerd in databasequery's. Een pagina die twintig van
de vierduizend grafieken toont, kan niet vierduizend rijen ophalen en degene laten vallen die het account
niet mag zien, want dan klopt de telling niet, zijn de paginagrenzen verkeerd en schaalt het werk met
het bestand in plaats van met de pagina.

Daarom worden de beleidsregels en uitzonderingslijsten omgezet in join- en where-clausules en overgedragen
aan de database. Het machtigingsmodel is mede zo vormgegeven omdat het die vertaalslag moet doorstaan.
Sets van ID's en een standaardvlag compileren prima naar SQL. Willekeurige logica per object doet dat niet.

Het grafiekpad bevat een kortere route voor brede grafiekmachtigingen, waaronder de Toestaan-grafiekstandaard
van een gebruiker zonder grafiekuitzonderingen. Veralgemeniseer dit niet naar elk objecttype of elke
route. Realm-, accountstatus- en weergavecontroles moeten nog steeds worden geverifieerd; optimalisatie
van machtigingsquery's is geen vervanging voor toegangstests.

## Bomen zijn een aparte as

Boommachtiging en grafiekmachtiging worden onafhankelijk van elkaar gecontroleerd. Het toegekend krijgen
van een boom geeft geen toegang tot de inhoud ervan. Het toegekend krijgen van een grafiek vereist niet
dat er een boom is toegekend.

Een boom is een presentatie van objecten, geen container die eigenaar van hen is. Dezelfde grafiek kan
in vijf bomen voorkomen. Als een boom toegang tot zijn inhoud zou verlenen, zou het bewerken van een boom
het bewerken van machtigingen zijn, en zou iedereen die grafieken mag organiseren ze mogen publiceren.

Wat de boom in plaats daarvan doet, is verbergen wat leeg is. Een tak wordt getoond wanneer deze iets
bevat dat het account mag zien, en de controle daalt af: een tak waarvan alle subtakken leeg zijn voor
dit account, wordt zelf verborgen. Twee personen openen dezelfde boom en zien twee verschillende structuren,
en geen van beiden ziet een tijdelijke aanduiding die hint naar wat de ander heeft.

Die leegtecontrole is niet gratis. Het doorloopt de tak en stelt recursief de grafiek- en apparaatvragen
voor wat het tegenkomt. Een diepe boom en een kostbare grafiekmachtigingsmethode combineren slecht, wat
nog een reden is waarom de grovere methoden bestaan.

Het controle-aspect weegt zwaarder dan de prestatie-impact. **Een boomweergave is geen overzicht van
waar een account toegang toe heeft.** Het is een overzicht van waar een account toegang toe heeft
*én wat iemand in die boom heeft geplaatst*. Om toegang te auditeren, inspecteert u het beleid en
verifieert u daadwerkelijk toegestane en geweigerde verzoeken. De weergave Effectief beleid is een
afzonderlijke implementatie van de autorisatiecontroles, dus het bijbehorende label en de tooltip
mogen niet het enige bewijs zijn. Zie
[Controleren wie wat kan zien](/nl/guides/audit-who-can-see-what/).

## Caching en waarom wijzigingen op vreemde momenten plaatsvinden

Machtigingsantwoorden worden gecachet in de sessie, omdat het alternatief is dat op elke pagina dezelfde
vraag opnieuw moet worden gesteld. Een wijziging door een beheerder markeert de gecachete antwoorden van
het getroffen account als verouderd, en de volgende pagina die dat account laadt, bouwt ze opnieuw op
in plaats van te wachten op een nieuwe aanmelding.

Het uitschakelen van een account wist opgeslagen inloggegevens, gecachete machtigingen en serversessies.
Beveiligde verzoeken controleren ook de status ingeschakeld/vergrendeld; een pagina die al in een browser
is geladen, wordt niet gewist. Voor gasten geschikte routes kunnen een afzonderlijke gastidentiteit
omzetten wanneer ze zijn geconfigureerd, zodat een succesvol antwoord alleen niet bewijst dat het
uitgeschakelde account toegang behoudt.

Verifieer wijzigingen met behulp van bestaande en nieuwe sessies, waarbij zowel behouden als ingetrokken
toegang wordt gecontroleerd en responsinhoud en identiteit worden vastgelegd. Gebruik de HTTP-status
alleen niet als bewijs van autorisatie en ga er niet van uit dat elke cache-consument identiek vernieuwt.
