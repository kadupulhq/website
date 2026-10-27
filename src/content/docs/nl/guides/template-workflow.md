---
title: "Sjablonen gebruiken en valideren"
description: "Kies identiteiten, bekijk importvoorbeelden en controleer doorwerking zonder RRD-geschiedenis te verliezen."
banner:
  content: "Kadupul is pre-alfa. Valideer de procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van taalcontrole."
---

## De juiste definities kiezen

Apparaatsjablonen bieden grafieksjablonen en gegevensquery’s; gegevenssjablonen definiëren meetinvoer en opslag. Dupliceer een vergelijkbaar sjabloon voor een afzonderlijke identiteit en controleer gedeelde afhankelijkheden. Dupliceren maakt niet elke gekoppelde invoer of elk profiel onafhankelijk. Bewaar een export en een samenhangende database-/RRD-back-up voordat u gebruikte definities wijzigt. Zie de sjabloonconcepten.

## Voorbeeld bekijken en bewust toepassen

Controleer op een geïsoleerde installatie de XML-herkomst, doelidentiteiten en het gekozen opslagprofiel. Bekijk vanuit de applicatieroot het voorbeeld van gewone sjabloon-XML:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

De huidige `main` geeft een niet-nulstatus bij onleesbare invoer, ongeldige XML en vastgelegde objectfouten. Controleer ook diagnostiek en objectresultaten; een import kan bestaande identiteiten bijwerken. Pakketimports hebben een apart pad dat bestanden schrijft. Zie import en export.

## Afgeleide objecten en geschiedenis controleren

Controleer na toepassing representatieve apparaten, lokale grafiekitemkoppelingen, eigen instellingen en verzamelde waarden. Gewijzigde apparaatsjabloonkoppelingen vereisen een afzonderlijke synchronisatie. Een gegevenssjabloon opslaan verandert bestaande RRD-structuren niet; inspecteer het werkelijke bestand voordat u stap, heartbeat of bewaartermijn wijzigt. Stop schrijfprocessen vóór gecoördineerd herstel en herstel indien nodig de samenhangende back-upset. Zie eigen sjablonen en bewaartermijnen.

[Sjabloonconcepten](/nl/concepts/templates/) · [Import en export](/nl/guides/import-and-export-templates/) · [Eigen sjablonen](/nl/guides/create-custom-templates/) · [Bewaartermijnen](/nl/guides/manage-data-retention/)

Applicatiebasis gecontroleerd op 26 oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
