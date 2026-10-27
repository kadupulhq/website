---
title: "Pourquoi ce fork existe"
description: "Priorités indépendantes et critères d’acceptation des migrations pour 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire en attente de relecture linguistique."
---

Kadupul est un fork indépendant de Cacti avec ses propres décisions de développement, de publication et de support. Ces priorités guident la planification 2026–2027 ; elles ne sont ni des dates de livraison ni des preuves d’aptitude à la production.

## Priorités de développement

La branche applicative `main` exige PHP 8.4+ et associe les services Symfony 7.4 aux parcours web, poller et CLI historiques. La ligne de maintenance `lts/1.2` a ses propres prérequis. La migration vise à expliciter les limites des cas d’usage, l’autorisation, le traitement des échecs et la vérification, tout en conservant les contrats requis de collecte et de graphiques. Un service moderne ou une suite de tests réussie ne prouve pas la migration d’un parcours entier. Consultez l’architecture.

## Compatibilité et migration

Préserver extensions, modèles, schémas et historique RRD est un objectif de publication qui exige des preuves par version. Chaque migration doit identifier son chemin d’écriture actif, conserver les correctifs de maintenance applicables et tenir compte du travail en file ou en cours. Répétez installation, récupération et changements de schéma sur une copie isolée avec des sauvegardes cohérentes. Il n’existe aujourd’hui aucun parcours de migration en production validé. Consultez compatibilité et état du projet.

Ces priorités décrivent Kadupul, pas les projets d’un autre logiciel ni un accord avec ses responsables. Kadupul n’est ni affilié à The Cacti Group ni approuvé par celui-ci.

[Architecture](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Compatibilité](/fr/project/compatibility-with-cacti/) · [État du projet](/fr/project/status/)

Base applicative vérifiée le 26 octobre 2026 : [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
