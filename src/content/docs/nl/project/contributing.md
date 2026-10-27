---
title: Bijdragen
description: Wat het project nodig heeft, de technische standaarden waaraan een wijziging voldoet en de normen waaraan deze wordt getoetst.
banner:
  content: Kadupul bevindt zich in de pre-alfafase. De code is beschikbaar, maar er is geen ondersteunde productierelease of gevalideerd migratiepad. Gebruik het niet in productie.
sidebar:
  order: 6
---

De broncode is beschikbaar en de repository documenteert een bijdrageproces. Lees [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) voordat u begint. Bespreek ingrijpende wijzigingen eerst in de issue tracker.

## De standaard

Houd elke pull request gefocust op één doel. Reproduceer een bug voordat u deze oplost, verifieer het gewijzigde gedrag en neem de validatiecommando's en resultaten op. Behoud openbare interfaces, tenzij de wijziging een gedocumenteerde migratie omvat.

## Technische standaarden

Volg de regels voor de branch die u wijzigt. Controleer de huidige gids voor bijdragers en de CI-configuratie in plaats van aan te nemen dat beide branches dezelfde regels hanteren.

### Stijl

Op `main` volgen bewerkte PHP-bestanden PHP-FIG PER-CS 2.0. Herformatteer elk beïnvloed bestand in een afzonderlijke commit met uitsluitend witruimte en controleer dit met `tests/tools/check_php_style.sh`. De `lts/1.2`-branch behoudt de upstream-opmaak.

### Statische analyse

Voer de controles uit die door de doelbranch worden vereist. Deze site schrijft geen PHPStan-niveau, logboekinterface of autoloading-migratie voor die de repository niet heeft overgenomen.

### Tests

Verifieer het gedrag dat door de patch is gewijzigd. Voeg een regressietest toe voor een bugfix en toon de gebruikte commando's. Het slagen van niet-gerelateerde tests valideert de fix niet.

### Afhankelijkheden

Leg uit waarom een afhankelijkheid nodig is, controleer de licentie ervan en werk het toepasselijke manifest en lockfile bij. Volg de afhankelijkheids- en validatieregels van de repository.

### Commits en pull requests

Gebruik Conventional Commits en onderteken elke commit met `git commit -s` onder het [Developer Certificate of Origin](https://developercertificate.org/). Scheid formattering van gedragswijzigingen zodat elk onafhankelijk kan worden beoordeeld.

## De overgenomen mappenstructuur voldoet niet aan deze standaarden

De structuur bevat overgenomen opmaak- en implementatiepatronen. Conversie wordt beheerst door de regels van de doelbranch, niet door een algemene herschrijving van het project.

### Welke regel wint dan?

Volg `CONTRIBUTING.md` op de doelbranch. Op `main` is de PER-CS-regel voor bewerkte bestanden van toepassing; op `lts/1.2` behoudt u de overgenomen stijl.

## Documentatie

Verifieer beweringen tegen de implementatie en gebruik materiaal waarvan de licentie opname toestaat. Kopieer geen proza van derden zonder de licentie te controleren. Meld beveiligingsbevindingen via het [vertrouwelijke meldingsproces](/nl/project/security/).

## Compatibiliteit

Plugin-interfaces, sjablonen, databasecompatibiliteit en RRD-gegevens zijn releasedoelen. Documenteer elke interface-wijziging en verstrek bewijs van migratie en compatibiliteit. Zie [Compatibiliteit met Cacti](/nl/project/compatibility-with-cacti/).
