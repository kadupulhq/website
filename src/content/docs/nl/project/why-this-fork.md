---
title: "Waarom deze fork bestaat"
description: "Onafhankelijke ontwikkelprioriteiten en acceptatiecriteria voor migraties in 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul is pre-alfa. Valideer procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van taalcontrole."
---

Kadupul is een onafhankelijke Cacti-fork met eigen beslissingen over ontwikkeling, releases en ondersteuning. Deze prioriteiten sturen de planning voor 2026–2027; het zijn geen opleverdatums of bewijzen van productiegereedheid.

## Ontwikkelprioriteiten

Applicatietak `main` vereist PHP 8.4+ en combineert Symfony 7.4-services met bestaande web-, poller- en CLI-paden. Onderhoudslijn `lts/1.2` heeft eigen vereisten. De migratie moet grenzen van gebruiksscenario’s, autorisatie, foutafhandeling en verificatie expliciet maken met behoud van vereiste verzamel- en grafiekcontracten. Een moderne service of geslaagde testsuite bewijst niet dat een heel proces is gemigreerd. Zie de architectuur.

## Compatibiliteit en migratie

Behoud van plugins, sjablonen, schema’s en RRD-geschiedenis is een releasedoel dat bewijs per versie vereist. Iedere migratie moet het actieve schrijfpad benoemen, toepasselijke onderhoudsfixes behouden en rekening houden met wachtend of lopend werk. Oefen installatie, herstel en schemawijzigingen op een geïsoleerde kopie met samenhangende back-ups. Er is momenteel geen gevalideerd productiemigratiepad. Zie compatibiliteit en status.

Deze prioriteiten beschrijven Kadupul, geen plannen van een ander project of afspraak met diens beheerders. Kadupul is niet verbonden met of goedgekeurd door The Cacti Group.

[Architectuur](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Compatibiliteit](/nl/project/compatibility-with-cacti/) · [Status](/nl/project/status/)

Applicatiebasis gecontroleerd op 26 oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
