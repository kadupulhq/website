---
title: "Installer sur FreeBSD"
description: "Préparer services, extensions PHP et stockage local FreeBSD pour une évaluation isolée."
banner:
  content: "Kadupul est en pré-alpha. Cette procédure de plateforme n’a pas été validée de bout en bout. Traduction provisoire en attente de relecture linguistique."
---

## Choisir et préparer l’hôte

Utilisez une version du tableau des versions FreeBSD prises en charge et planifiez ses mises à niveau jusqu’en 2027. La prise en charge du système ne prouve pas la compatibilité Kadupul. Installez PHP 8.4+, MySQL ou MariaDB, RRDtool, Net-SNMP et un serveur web avec le manuel des paquets et ports. Les valeurs par défaut de `php84-extensions` ne couvrent pas toute la liste d’extensions; installez les modules manquants, dont `pcntl` pour CLI, avant les dépendances.

## Vérifier l’environnement et configurer les services

Vérifiez l’interpréteur CLI et les outils choisis :

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Vérifiez séparément PHP web. Pour PHP-FPM en paquet, configurez son pool et la connexion du serveur web avant d’activer le service `php_fpm`. FreeBSD utilise les services rc, pas systemd; suivez le manuel des services. Suivez l’installation pour la base, la configuration, le schéma et les ressources du navigateur. Alignez les outils sur le fichier `mise.toml` de l’application; ces versions ne prouvent pas que les installateurs d’environnements de mise fonctionnent sous FreeBSD.

## Planifier et vérifier avec les comptes de service

Utilisez un seul lancement cron avec des chemins absolus et l’intervalle configuré; n’installez pas l’unité systemd Linux. Validez identité POSIX, verrouillage des répertoires, propriétaire et confiance explicite UID/GID avec chaque compte web/poller avant la collecte. Dans les jails, vérifiez réseau, montages et permissions depuis la jail. Exécutez un cycle sans chevauchement, inspectez les lignes retenues en file et les horodatages graphiques, puis répétez la restauration d’une sauvegarde cohérente. Un démarrage de processus réussi ne suffit pas. Consultez exigences et sauvegarde.

[Versions FreeBSD prises en charge](https://www.freebsd.org/security/) · [Paquets et ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Services FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Installation](/fr-ca/start/install/) · [Exigences](/fr-ca/reference/requirements/) · [Sauvegarde](/fr-ca/guides/back-up-and-restore/)

Base applicative vérifiée le 26 octobre 2026 : [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
