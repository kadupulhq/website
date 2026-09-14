---
title: "Wat is Kadupul"
description: "Vraag apparaten uit via SNMP en scripts, sla metingen op in RRD-bestanden en maak grafieken."
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. De code is beschikbaar, maar er is geen ondersteunde productierelease of gevalideerd migratiepad. Gebruik het niet in productie."
---

Kadupul is een onafhankelijke afsplitsing van Cacti. Het vraagt apparaten regelmatig uit en gebruikt RRDtool om metingen op te slaan en weer te geven.

Deze pagina is een samenvatting. Lees de volledige Engelse pagina voor de details. [English](/start/what-kadupul-is/)

## Wat is Kadupul

PHP levert de interface en het installatieprogramma. MySQL of MariaDB slaat configuratie, gebruikers en de cache van de collector op. RRD-bestanden bewaren metingen volgens de ingestelde bewaartermijnen en consolidatieregels, niet alle gegevens voor altijd. Verzamelscripts draaien met de rechten van hun systeemaccount.

## Aan de slag

Begin met een geïsoleerde testinstallatie, voeg een apparaat toe en controleer of gegevens binnenkomen voordat je de grafieken leest. Bewaar back-ups en test het herstel.

- [Installatie](/nl/start/install/)
- [Het eerste apparaat toevoegen](/nl/start/first-device/)
- [De eerste grafiek lezen](/nl/start/first-graph/)
