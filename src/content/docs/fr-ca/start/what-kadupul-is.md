---
title: "Présentation de Kadupul"
description: "Interroger les appareils par SNMP et scripts, stocker les mesures dans des fichiers RRD et produire des graphiques."
banner:
  content: "Kadupul est en pré-alpha. Le code est disponible, mais aucune version prise en charge ni migration vers la production n’a été validée. Ne l’utilisez pas en production."
---

Kadupul est un fork indépendant de Cacti. Il interroge les appareils à intervalles réguliers et utilise RRDtool pour stocker et représenter les mesures.

Cette page est une introduction résumée. Consultez la page complète en anglais pour davantage de détails. [English](/start/what-kadupul-is/)

## Présentation de Kadupul

- Une application PHP fournit l’interface et le programme d’installation.
- MySQL ou MariaDB conserve la configuration, les utilisateurs et le cache du collecteur.
- Les fichiers RRD conservent les mesures selon les durées de rétention et les règles de consolidation configurées. Ils ne gardent pas toutes les données indéfiniment.
- Un planificateur lance le collecteur. Les scripts s’exécutent avec les droits de son compte système.

## Premiers pas

Commencez par une installation d’essai isolée, ajoutez un appareil et vérifiez l’arrivée des données avant d’interpréter les graphiques. Conservez des sauvegardes et testez leur restauration.

- [Installation](/fr-ca/start/install/)
- [Ajouter un premier appareil](/fr-ca/start/first-device/)
- [Lire un premier graphique](/fr-ca/start/first-graph/)
