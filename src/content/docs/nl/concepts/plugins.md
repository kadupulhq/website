---
title: Plugins
description: Waarom het uitbreidingsoppervlak een lijst van benoemde aanroeppunten is, wat een plugin erft door binnen het proces te draaien en wat de beveiligingen eromheen wel en niet tegenhouden.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 11
---

Een plugin is code die de applicatie in haar eigen proces opneemt en op benoemde punten
aanroept. Elke andere eigenschap van het pluginmodel vloeit voort uit die ene zin.

Voor wat u moet lezen voordat u een plugin van iemand anders installeert, zie
[Plugins installeren en controleren](/nl/guides/install-and-vet-plugins/).

## Waarom het binnen het proces draait

Kijk waar plugins voor bedoeld zijn: een kolom toevoegen aan een lijst die de applicatie
rendert, opties van een grafiek wijzigen voordat deze wordt getekend, reageren op het verwijderen
van een apparaat of een tabblad toevoegen. Elk van die acties is een bewerking van iets dat de
applicatie op dat moment in het geheugen vasthoudt.

Een geïsoleerde worker zou een expliciete interface en validatie van zijn resultaten vereisen.
Dat kan isolatie van privileges waarborgen, maar dat is niet het mechanisme dat hier wordt gebruikt:
het pluginbestand wordt ingesloten en de functie ervan wordt aangeroepen binnen het proces van de
applicatie.

## Wat de plugin erft

Plugincode draait onder het besturingssysteemaccount van de aanroeper, met toegang tot de
databaseverbinding en bestandssysteempermissies van het proces. Een webaanroeper kan ook een sessie
hebben; een CLI-aanroeper heeft die niet noodzakelijkerwijs. Het pluginmechanisme biedt geen
afzonderlijke identiteit, sandbox of handtekeningverificatie.

Gebruikers- en groepsrechten regelen de toegang tot de applicatie; ze sluiten willekeurige
plugin-PHP niet in. Databasetoekenningen, bestandssysteempermissies en procesbeperkingen begrenzen
nog steeds wat dat proces kan doen. Beoordeel de plugin vóór installatie en houd de privileges
van het applicatieaccount beperkt.

## Twee aanroepstijlen

| Stijl | De applicatie | Een plugin die niets retourneert |
|---|---|---|
| Melding | Geeft argumenten door, negeert het resultaat | Retourwaarde is ongebruikt; neveneffecten en uitzonderingen doen er nog steeds toe |
| Transformatie | Geeft een waarde door, gebruikt wat terugkomt | Kan de waarde vervangen door null en downstream-aanroepers breken |

De transformatiestijl stelt een plugin in staat om een knop toe te voegen, een actielijst uit te
breiden of een grafiek aan te passen. Dit is ook waar plugins verstrengeld raken: twee plugins op
hetzelfde punt zien elk de uitvoer van de vorige in de geconfigureerde pluginvolgorde.

De dispatcher waarschuwt alleen dat een array verandert in een niet-array, of dat een eerder
niet-lege waarde null-achtig wordt, wanneer er meerdere overeenkomende hookrijen aanwezig zijn.
Die controle is geen volledige validatie van het hookcontract; een enkele plugin kan een waarde
zonder deze waarschuwing beschadigen.

## Registratie is status, geen ontdekking

Hooks bevinden zich in een tabel: welke plugin, welke hooknaam, welk bestand, welke functie,
ingeschakeld of niet. Installatie-, upgrade- en setup-routines kunnen hooks registreren; registratie
is niet beperkt tot de eerste installatie.

Het alternatief zou dynamische detectie bij elk verzoek zijn, wat betekent dat de plugindirectory
moet worden gescand en de code van elke plugin moet worden ingesloten om te vragen wat deze wil.
Een enkele pagina bereikt veel hookpunten. Alles insluiten om te ontdekken dat er niets is
gekoppeld is een kostbare oplossing, dus raadpleegt de applicatie de tabel, slaat het antwoord op
voor het verzoek en sluit alleen het bestand in dat in een overeenkomende rij wordt genoemd.

Die keuze brengt een prijs met zich mee die goed is om te weten: de tabel kan afwijken van het
bestandssysteem. Een handmatig verwijderde plugindirectory laat zijn rijen achter. Ontbrekende
meldings-callbacks kunnen ontstoorde waarschuwingen genereren; de transformatie-dispatcher heeft
geen vergelijkbare waarschuwing voor ontbrekende callbacks. Een rustig logboek bewijst niet dat
de registratie in orde is.

De volgorde vloeit voort uit de registratievolgorde van de plugin en is aanpasbaar. Een
transformatieketen wordt daarom geordend door iets dat een beheerder controleert.

## Waar een plugin naar kan grijpen

| Mogelijkheid | Opmerking |
|---|---|
| Eigen tabellen aanmaken | Vastgelegd, zodat de-installatie ze kan verwijderen |
| Kolommen toevoegen aan bestaande tabellen, inclusief core | Vastgelegd, zodat de-installatie ze kan verwijderen |
| Machtigingsdomeinen registreren | Nieuwe toegangsbeveiligde secties van de interface |
| Afhankelijkheden van andere plugins declareren | Versie gecontroleerd vóór installatie |
| Draaien op externe collectors | Aanroep hangt af van hook, stijl, mogelijkheden en verbindingsstatus |

De geregistreerde schemawijzigingen zijn de reden dat de-installatie destructief is. De applicatie
kan bijgehouden tabellen en kolommen verwijderen, inclusief gegevens. Ze roept ook de de-installatie-callback
van de plugin aan vóór het opruimen. Die callback kan andere wijzigingen aanbrengen; niet-bijgehouden
wijzigingen worden niet automatisch teruggedraaid en de bronmap van de plugin blijft bestaan.

Domeinen die door een plugin zijn geregistreerd, worden op dezelfde manier door gebruikers en groepen
gehouden als core-domeinen. Nieuwe domeinen kunnen ook toegang verlenen aan de primaire beheerder
en de huidige sessiegebruiker wanneer de registratie daarom vraagt. Controleer de resulterende
toekenningen na installatie en upgrade; ga er niet van uit dat uw bestaande beleid het nieuwe
oppervlak dekt.
Zie [Machtigingen en toegang](/nl/concepts/permissions-and-access/).

## Wat de beveiligingen daadwerkelijk beschermen

Er zijn beveiligingen, en het bestuderen ervan vertelt wat het dreigingsmodel is.

Het bestand dat een hook noemt, wordt opgelost binnen de eigen directory van die plugin. Een pad
dat ontsnapt, wordt geweigerd en geregistreerd als een beveiligingsgebeurtenis. De directorynaam van
een plugin is beperkt tot letters, cijfers, het onderstrepingsteken en het koppelteken. Registratie
van hooks en domeinen wordt alleen geaccepteerd vanuit een functie waarvan de naam lijkt op een
installatie-, upgrade- of setup-routine; een aanroep vanaf elders wordt geweigerd en gelogd.

De padbeveiliging beperkt welk bestand een hookrij kan insluiten. De registratiecontrole onderzoekt
alleen de naam van de aanroepende functie op installatie, upgrade of setup; ze verifieert geen
levenscyclusbewerking. Plugincode kan een dergelijke naam gebruiken bij een gewone pagina-aanvraag,
dus deze conventie is geen beveiligingsgrens.

Ze doen niets aan wat de eigen code van de plugin doet zodra deze draait. Ze vormen geen
isolatiegrens en zijn niet als zodanig gebouwd.

## Uitgeschakeld is niet uit

Enkele soorten hooks worden tijdens de installatie direct in ingeschakelde staat geregistreerd:
de hooks die instellingenpagina's, configuratie-arrays en formulierdefinities leveren. Een plugin
moet configureerbaar zijn voordat deze wordt ingeschakeld, dus die draaien in beide gevallen.

Een uitgeschakelde plugin heeft daarom bij sommige pagina-aanroepen nog steeds code die wordt
ingesloten en uitgevoerd. Uitschakelen is een functieschakelaar, en directe plugin-URL's vereisen
ook evaluatie. Als u kwaadaardige code vermoedt, isoleer dan de installatie en bekijk de
verwijderingsprocedure voordat u de-installatie aanroept, die zelf plugincode uitvoert. Alleen het
verwijderen van bronbestanden ruimt registraties niet op en draait databasewijzigingen niet terug.

## Externe collectors krijgen een beperkter oppervlak

Een plugin verklaart zijn mogelijkheden in zijn informatiebestand: of hij werkt wanneer de collector
de hoofdinstallatie kan bereiken, of hij werkt wanneer dat niet kan, en of hij deelneemt aan de
verzameling.

Op een collector worden vermelde hooks gecontroleerd op capaciteitseisen. Niet-vermelde
transformatie-hooks worden nog steeds uitgevoerd; niet-vermelde meldings-hooks kunnen worden
uitgevoerd wanneer online of wanneer de plugin offline beheer-/weergaveondersteuning verklaart.
Overgeslagen hooks worden niet universeel gelogd. Dit is routeringslogica, geen algehele toelatingslijst
of isolatiegrens; inspecteer de exacte dispatcher en verbindingsstatus voor de hook die u gebruikt.

De reden is dat een collector een andere omgeving is. Zijn configuratie is een replica die uren oud
kan zijn, en hij heeft mogelijk helemaal geen verbinding met de centrale database. Een hook die is
geschreven vanuit de aanname dat de centrale database één query verwijderd is, slaat daar de plank
mis, dus vereist het model dat de plugin aangeeft welke aannames hij doet in plaats van deze af te
leiden. Zie [Externe gegevensverzameling](/nl/concepts/remote-data-collection/).

## De poller is de kostbare plek voor hooks

Een hook in het polling-pad draait zodra zijn aanroepplek wordt bereikt. De frequentie hangt af van
de gebeurtenis, het proces en de collector-routering; niet elke hook draait in elk proces in elke
cyclus. Trage code op een veelgebruikt pad verbruikt het polling-interval en kan bijdragen aan
gaten in grafieken.

Een hook op een pagina rendert eenmaal voor één persoon die toch al wacht. De twee zien er hetzelfde
uit in de registratietabel, maar verschillen ordegroottes in kosten.

## Waarom het oppervlak ongelijkmatig oogt

De hook-API biedt aanroepplekken met verschillende doelen en argumentvormen.

Daarom is de lijst breed en onregelmatig, waarom sommige punten een waarde overhandigen om te
wijzigen en andere alleen melden dat er een gebeurtenis heeft plaatsgevonden, en waarom de argumenten
van vorm verschillen tussen hooks. Een gedeclareerde minimale core-versie garandeert geen
compatibiliteit met elke hook: onderzoek de argumenten en retourverwachtingen van elke aanroepplek
en test de plugin op de doelversie. De beperkingen voor CLI-compatibiliteit en domeintoekenning
zoals gedocumenteerd in [Plugins installeren en controleren](/nl/guides/install-and-vet-plugins/)
zijn eveneens van toepassing; een succesvolle installatie op zich is geen bewijs van compatibiliteit.

De praktische les: een plugin is gekoppeld aan de core-versie waarvoor deze is geschreven, veel
hechter dan de opgegeven minimumversie suggereert. Controleer plugins opnieuw vóór een core-upgrade,
in plaats van erna.
