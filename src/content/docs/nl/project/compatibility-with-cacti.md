---
title: "Compatibiliteit met Cacti"
description: "Bereik, verificatiebewijs en compatibiliteitsgrenzen voor de planning 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul is pre-alfa. Valideer procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van taalcontrole."
---

Compatibiliteit is een releasedoel, geen bewering dat iedere Cacti-versie, plugin of sjabloon ongewijzigd werkt. Kadupul blijft pre-alfa. Evalueer de exacte broncoderevisie en gebruikte onderdelen voordat u op het gedrag vertrouwt.

## Wat het omvat

Controleer pluginhooks, argument-/retourgedrag en rechten; sjabloonidentiteiten, invoerkoppelingen en doorwerking; schema-, standaardwaarde- en referentiesemantiek; en bestaande RRD-paden, velden, archieven en bewaarde waarden. Een passend databaseprofiel bewijst niet dezelfde indeling van het RRD-bestand. Plugins draaien als vertrouwde applicatiecode, niet in een sandbox. Zie sjablonen en pluginbeoordeling.

## Wat het praktisch betekent

Leg applicatietak en revisie, PHP en vastgelegde afhankelijkheden, pluginversies, schemastatus en opslagconfiguratie vast. Test verzameling, grafiekweergave, autorisatie, fouten en herstel op een geïsoleerde herstelde kopie. Neem externe collectors en achtergrondwerk mee waar gebruikt. Documenteer bewuste verschillen en resterende hiaten; tests dekken alleen de uitgevoerde paden. Zie upgradeoefening en back-up.

## Wat het niet garandeert

Er is geen algemene garantie voor binaire, schema- of plugincompatibiliteit, geen ondersteunde productierelease en geen gevalideerd productiemigratiepad. Alleen de code terugzetten maakt schema- of RRD-wijzigingen niet ongedaan; herstel kan de samenhangende back-upset vereisen. Gebruik de onderhouden projectbronnen en leg herkomst vast, in plaats van archieven van een ander project als getest Kadupul-pakket te beschouwen. Kadupul is niet verbonden met of goedgekeurd door The Cacti Group. Zie status.

[Sjablonen](/nl/concepts/templates/) · [Plugins beoordelen](/nl/guides/install-and-vet-plugins/) · [Upgradeoefening](/nl/guides/upgrade-safely/) · [Back-up](/nl/guides/back-up-and-restore/) · [Status](/nl/project/status/)

Applicatiebasis gecontroleerd op 26 oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
