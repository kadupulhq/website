---
title: "Wat Kadupul is"
description: "Verzameling, opslag, architectuur en projectgrenzen voor de planning van 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door een vloeiende spreker."
---

Kadupul is een toepassing voor netwerkbewaking en grafieken. Het verzamelt metingen via SNMP en scripts, bewaart tijdreeksen in RRD-bestanden en tekent grafieken met RRDtool. Dit overzicht is op 26 oktober 2026 gecontroleerd tegen de hieronder gekoppelde applicatierevisie.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Projectstatus voor 2026–2027

Kadupul is pre-alfa, zonder ondersteunde productieversie of gevalideerde migratie naar productie. Gebruik een geïsoleerde testinstallatie. Datums in deze documentatie dienen voor planning en zijn geen opleveringsbeloften. Controleer de projectstatus voordat u een revisie kiest om te evalueren.

[Projectstatus](/nl/project/status/)

## Verzameling en planning

Een externe planner start de poller. Die leest een voorbereide verzamellijst, roept de PHP-collector of een compatibele Spine-build aan en verwerkt resultaten. Verzamelintervallen zijn instelbaar; vijf minuten is een voorbeeld, geen algemene regel. Een startmechanisme kan meerdere kortere cycli binnen zijn interval uitvoeren. Time-outs, nieuwe pogingen en apparaatlatentie verbruiken dit tijdbudget.

[Pollercyclus](/nl/reference/poller-lifecycle/)

## Bewaartermijn en opslag

Een RRD-bestand krijgt bij het aanmaken een opslagindeling. Recente metingen kunnen meer details behouden dan oudere geconsolideerde waarden; de bewaartermijn is begrensd door de ingestelde archieven. Niet elk meetpunt blijft voor altijd bewaard. Onbekende waarden staan voor ontbrekende of onbruikbare waarnemingen, niet voor nul. Databasewachtrijen, logboeken en statistieken kunnen groeien terwijl bestaande RRD-bestanden even groot blijven.

[Gegevensbronnen en archieven](/nl/concepts/data-sources-and-rras/)

## Grafieken en gedeelde termen

Een apparaat is een bewaakt eindpunt. Een gegevensquery ontdekt onderdelen zoals interfaces. Een gegevensbron beschrijft een meting en de opslag ervan; een grafiek beschrijft de weergave. Sjablonen hergebruiken definities en bomen structureren de navigatie. Het zijn afzonderlijke records: controleer verwijderopties en afhankelijkheden voordat u ze verwijdert. Grafieken worden op aanvraag uit bewaarde gegevens gemaakt; de afbeeldingscache kan een gerenderd resultaat hergebruiken.

[Woordenlijst](/nl/reference/glossary/)

## Installatieonderdelen

Een werkende installatie combineert de PHP-webapplicatie, MySQL of MariaDB, RRD-opslag, RRDtool en een startmechanisme voor verzameling. Apparaatreferenties en configuratie staan in de database of beschermde configuratiebestanden. Maak een samenhangende back-up van code, configuratie, databasewachtrijen en RRD-geschiedenis en oefen het herstel. Alleen een databasedump herstelt historische grafieken niet.

[Back-up en herstel](/nl/guides/back-up-and-restore/)

## Main en de Symfony-migratie

Applicatietak `main` vereist PHP 8.4 of nieuwer en combineert Symfony 7.4-services met bestaande web-, poller- en CLI-toegangspunten. Onderhoudslijn `lts/1.2` heeft eigen vereisten. Gemigreerde en bestaande routes werken naast elkaar; een Symfony-service bewijst niet dat het oude proces is uitgefaseerd. Broncodecheckouts vereisen vastgelegde PHP-afhankelijkheden en gegenereerde browserassets. Gebruik de uitvoeringsomgevingen uit de `mise.toml` van de applicatie.

[Migratiehandleiding](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Accounts, plugins en opslagtoegang

Zichtbaarheid van apparaten en grafieken hangt af van gebruikers- en groepsrechten. Plugins draaien als vertrouwde applicatiecode met de toegang van het procesaccount, zonder sandbox. Controleer herkomst, hooks en installatie-/verwijdergedrag voordat u ze inschakelt. Lokale Unix-RRD-schrijfprocessen vereisen POSIX-identiteitscontroles en expliciete vertrouwensinstellingen wanneer web- en polleraccounts verschillen. Windows ondersteunt geen destructief onderhoud van lokale RRD-bestanden.

[Plugins beoordelen](/nl/guides/install-and-vet-plugins/)

## Geschikte toepassingen en grenzen

Evalueer Kadupul voor netwerkinterfaces, apparaattellers, omgevingssensoren en andere metingen die via te valideren verzamelmethoden beschikbaar zijn. De software draait op eigen infrastructuur en vereist onderhoud van database, webserver en planner. De numerieke kernverzameling is geen logboekopslag, gedistribueerd tracingsysteem of algemene query-engine voor labels met hoge cardinaliteit. Drempelwaarschuwingen vereisen geschikte plugins; controleer de compatibiliteit en neem niet aan dat waarschuwingen direct na installatie werken.

## Oorsprong, naam en compatibiliteit

Kadupul is een onafhankelijke Cacti-fork onder GPL-3.0-or-later, zonder verbondenheid met of goedkeuring door The Cacti Group. De Singalese naam කඩුපුල් verwijst naar *Epiphyllum oxypetalum*, een ’s nachts bloeiende cactus. Plugininterfaces, sjablonen, schema’s en bestaande RRD-geschiedenis behouden is een releasedoel waarvoor bewijs nodig is per broncoderevisie en plugincombinatie.

[Compatibiliteit](/nl/project/compatibility-with-cacti/)

## Begin met één gecontroleerd apparaat

Volg installatie, eerste apparaat en eerste grafiek in die volgorde. Controleer logboeken, verzameltijdstempels en bruikbare waarden voordat u op het beeld vertrouwt. Meet met uw apparaten de cyclusduur en wachtend werk voordat u uitbreidt. Gebruik de concepten om het ontwerp te begrijpen en de vereisten voor de noodzakelijke voorwaarden.

[Installatie](/nl/start/install/) · [Eerste apparaat](/nl/start/first-device/) · [Eerste grafiek](/nl/start/first-graph/) · [Concepten](/nl/concepts/architecture/) · [Vereisten](/nl/reference/requirements/)
