---
title: "Installeren op FreeBSD"
description: "Bereid FreeBSD-services, PHP-extensies en lokale opslag voor op een geïsoleerde evaluatie."
banner:
  content: "Kadupul is pre-alfa. Deze platformprocedure is niet van begin tot eind gevalideerd. Conceptvertaling in afwachting van taalcontrole."
---

## Host kiezen en voorbereiden

Gebruik een versie uit FreeBSDs ondersteuningstabel en plan upgrades tot en met 2027. OS-ondersteuning bewijst geen Kadupul-compatibiliteit. Installeer PHP 8.4+, MySQL of MariaDB, RRDtool, Net-SNMP en een webserver volgens het Packages-and-Ports-handboek. De standaardinstellingen van `php84-extensions` dekken niet alle applicatie-extensies; installeer ontbrekende modules, waaronder `pcntl` voor CLI, vóór de afhankelijkheden.

## Omgeving controleren en services instellen

Controleer de gekozen CLI-interpreter en hulpmiddelen:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Controleer web-PHP afzonderlijk. Configureer voor verpakte PHP-FPM de pool en webserververbinding voordat u `php_fpm` inschakelt. FreeBSD gebruikt rc-services, geen systemd; volg het servicehandboek. Volg de installatie voor database, configuratie, schema en browserassets. Stem hulpmiddelen af op de `mise.toml` van de applicatie; die versies bewijzen niet dat mises runtime-installatieprogramma’s op FreeBSD werken.

## Plannen en controleren als serviceaccounts

Gebruik één cron-starter met absolute uitvoerbare paden en het ingestelde interval; installeer de Linux-systemd-unit niet. Valideer als elk web-/polleraccount POSIX-identiteit, mapvergrendeling, eigendom en expliciet UID/GID-vertrouwen vóór verzameling. Controleer bij jails netwerk, mounts en rechten binnen de jail. Voer één niet-overlappende cyclus uit, inspecteer bewaarde wachtrijrijen en grafiektijdstempels en oefen herstel van een samenhangende back-up. Alleen een geslaagde processtart volstaat niet. Zie vereisten en back-up.

[Ondersteunde FreeBSD-versies](https://www.freebsd.org/security/) · [Packages en Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [FreeBSD-services](https://docs.freebsd.org/en/books/handbook/config/) · [Installatie](/nl/start/install/) · [Vereisten](/nl/reference/requirements/) · [Back-up](/nl/guides/back-up-and-restore/)

Applicatiebasis gecontroleerd op 26 oktober 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
