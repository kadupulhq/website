---
title: "Installeren vanaf een Windows-host"
description: "Evalueer Kadupul in Linux op Windows en begrijp de beperkingen van native Windows."
banner:
  content: "Kadupul is pre-alfa. Deze platformprocedure is niet van begin tot eind gevalideerd. Conceptvertaling in afwachting van taalcontrole."
---

## Uitvoeringsomgeving kiezen

De huidige `main` vereist PHP 8.4+, `pcntl` en `posix`; native Windows-PHP voldoet niet aan deze Unix-vereisten. Omzeil Composers platformcontroles niet. Gebruik een Linux-VM of evalueer WSL 2 op een door Microsoft ondersteunde Windows-versie. Dit zijn Linux-installaties op Windows, geen gevalideerde native IIS-implementaties. Zie de PHP-platformgrenzen.

## Linux voorbereiden en installeren

Voer voor WSL dit uit in PowerShell als beheerder en herstart indien gevraagd:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

Bevestig versie 2. Rond het Linux-account af en volg binnen Linux de installatie voor database, PHP-extensies, assets, webserver en planner. Bewaar code en RRD-opslag in het Linux-bestandssysteem, niet onder `/mnt/c/`. Zie Microsofts WSL- en bestandssysteemhandleidingen.

## Levenscyclus en herstel controleren

Gebruik eigen accounts zonder verhoogde rechten en één verzamelstarter. Controleer opslagvertrouwen, polling, grafiektijdstempels en herstartgedrag na een hostherstart of WSL-afsluiting. Neem niet aan dat een desktopsessie de verzameling actief houdt. Maak gezamenlijke back-ups van database, configuratie en RRD’s. Destructief RRD-onderhoud en automatisch lokaal wissen/archiveren blijven op native Windows onbeschikbaar; Linux-gedrag valideert die niet. Zie vereisten en back-up.

[PHP-beperkingen](https://www.php.net/manual/en/pcntl.installation.php) · [Installatie](/nl/start/install/) · [Microsofts WSL-handleiding](https://learn.microsoft.com/en-us/windows/wsl/install) · [Bestandssystemen](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [Vereisten](/nl/reference/requirements/) · [Back-up](/nl/guides/back-up-and-restore/)

Applicatiebasis gecontroleerd op 26 oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
