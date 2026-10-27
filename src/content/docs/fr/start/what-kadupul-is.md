---
title: "Ce qu’est Kadupul"
description: "Collecte, stockage, architecture et limites du projet pour préparer 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire en attente de relecture par une personne maîtrisant la langue."
---

Kadupul est une application de supervision réseau et de création de graphiques. Elle collecte des mesures par SNMP et scripts, stocke les séries temporelles dans des fichiers RRD et produit des graphiques avec RRDtool. Cette présentation a été vérifiée le 26 octobre 2026 avec la révision de l’application indiquée ci-dessous.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## État du projet pour 2026–2027

Kadupul est en pré-alpha, sans version prise en charge en production ni migration vers la production validée. Utilisez une installation de test isolée. Les dates de cette documentation servent à la planification, pas à promettre une livraison. Consultez l’état du projet avant de choisir une révision à évaluer.

[État du projet](/fr/project/status/)

## Collecte et planification

Un ordonnanceur externe démarre le poller. Celui-ci lit une liste de collecte préparée, appelle le collecteur PHP ou une compilation compatible de Spine, puis traite les résultats. Les intervalles de collecte sont configurables ; cinq minutes est un exemple, pas une règle universelle. Un mécanisme de lancement peut exécuter plusieurs cycles plus courts dans son intervalle. Délais d’attente, tentatives supplémentaires et latence des équipements consomment ce budget de temps.

[Cycle du poller](/fr/reference/poller-lifecycle/)

## Rétention et stockage

Un fichier RRD possède une structure de stockage choisie à sa création. Les mesures récentes peuvent garder plus de détails que les anciennes valeurs consolidées ; la rétention est limitée aux archives configurées. Toutes les mesures ne sont pas conservées indéfiniment. Les valeurs inconnues représentent des observations absentes ou inutilisables, pas zéro. Les files, journaux et statistiques de la base de données peuvent croître même si les fichiers RRD existants gardent une taille fixe.

[Sources de données et archives](/fr/concepts/data-sources-and-rras/)

## Graphiques et vocabulaire commun

Un équipement est un point supervisé. Une requête de données découvre des éléments comme les interfaces. Une source de données décrit une mesure et son stockage ; un graphique décrit comment l’afficher. Les modèles réutilisent des définitions, et les arbres organisent la navigation. Ce sont des enregistrements distincts : vérifiez les choix de suppression et les dépendances avant de les retirer. Les graphiques sont produits à la demande à partir des données conservées ; le cache d’images peut réutiliser un résultat déjà rendu.

[Glossaire](/fr/reference/glossary/)

## Composants d’une installation

Une installation fonctionnelle associe l’application web PHP, MySQL ou MariaDB, le stockage RRD, RRDtool et un mécanisme de lancement de la collecte. Les identifiants des équipements et la configuration résident dans la base de données ou des fichiers de configuration protégés. Sauvegardez code, configuration, files de la base et historique RRD comme un ensemble cohérent, puis répétez la restauration. Un export de base de données seul ne restaure pas les graphiques historiques.

[Sauvegarde et récupération](/fr/guides/back-up-and-restore/)

## Main et la migration Symfony

La branche `main` de l’application exige PHP 8.4 ou ultérieur et associe les services Symfony 7.4 aux points d’entrée web, poller et CLI historiques. La ligne de maintenance `lts/1.2` a ses propres prérequis. Les routes migrées coexistent avec les anciennes ; un service Symfony ne prouve pas que l’ancien parcours a été retiré. Une copie des sources nécessite des dépendances PHP verrouillées et des ressources de navigateur générées. Utilisez les environnements définis dans le fichier `mise.toml` de l’application.

[Guide de migration](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Comptes, extensions et accès au stockage

La visibilité des équipements et graphiques dépend des permissions des utilisateurs et groupes. Les extensions s’exécutent comme du code applicatif de confiance, avec les accès du compte du processus ; elles ne sont pas isolées dans un bac à sable. Vérifiez leur provenance, leurs hooks et leur comportement à l’installation et à la désinstallation avant activation. Les processus écrivant les RRD locaux sous Unix exigent des vérifications d’identité POSIX et des paramètres de confiance explicites si les comptes web et poller diffèrent. Windows ne prend pas en charge la maintenance destructive des RRD locaux.

[Évaluation des extensions](/fr/guides/install-and-vet-plugins/)

## Usages adaptés et limites

Évaluez Kadupul pour les interfaces réseau, compteurs d’équipements, capteurs environnementaux et autres mesures accessibles par des méthodes de collecte que vous pouvez valider. C’est un logiciel auto-hébergé qui exige l’entretien de la base de données, du web et de l’ordonnanceur. La collecte numérique du cœur n’est ni un dépôt de journaux, ni un système de traçage distribué, ni un moteur général de requêtes par étiquettes à forte cardinalité. Les alertes par seuil dépendent d’extensions adaptées ; vérifiez leur compatibilité sans présumer leur fonctionnement dès l’installation.

## Origine, nom et compatibilité

Kadupul est un fork indépendant de Cacti sous licence GPL-3.0-or-later, sans affiliation ni approbation de The Cacti Group. Son nom cinghalais, කඩුපුල්, désigne *Epiphyllum oxypetalum*, un cactus à floraison nocturne. Préserver les interfaces d’extensions, modèles, schémas et historiques RRD existants est un objectif de publication qui nécessite des preuves pour chaque révision source et combinaison d’extensions.

[Compatibilité](/fr/project/compatibility-with-cacti/)

## Commencez par un équipement vérifié

Suivez l’installation, le premier équipement et le premier graphique dans cet ordre. Vérifiez journaux, horodatages de collecte et valeurs utilisables avant de vous fier à l’image. Mesurez la durée des cycles et le travail en file avec vos équipements avant d’étendre l’installation. Consultez les concepts pour comprendre la conception et les prérequis pour connaître les conditions nécessaires.

[Installation](/fr/start/install/) · [Premier équipement](/fr/start/first-device/) · [Premier graphique](/fr/start/first-graph/) · [Concepts](/fr/concepts/architecture/) · [Prérequis](/fr/reference/requirements/)
