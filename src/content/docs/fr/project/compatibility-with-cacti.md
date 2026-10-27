---
title: "Compatibilité avec Cacti"
description: "Périmètre, preuves de vérification et limites de compatibilité pour préparer 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire en attente de relecture linguistique."
---

La compatibilité est un objectif de publication, pas l’affirmation que chaque version, extension ou modèle Cacti fonctionne sans changement. Kadupul reste en pré-alpha. Évaluez la révision source exacte et les composants utilisés avant de vous fier au comportement.

## Ce que cela couvre

Vérifiez les hooks des extensions, arguments, retours et permissions ; les identités de modèles, correspondances d’entrée et propagations ; la sémantique des schémas, valeurs par défaut et références ; ainsi que les chemins RRD existants, champs, archives et valeurs conservées. Un profil de base correspondant ne prouve pas la même structure du fichier RRD. Les extensions exécutent du code applicatif de confiance, pas dans un bac à sable. Consultez modèles et évaluation des extensions.

## Ce que cela implique en pratique

Consignez branche et révision de l’application, PHP et dépendances verrouillées, versions des extensions, état du schéma et configuration du stockage. Testez collecte, rendu graphique, autorisation, échecs et récupération sur une copie restaurée isolée. Incluez collecteurs distants et travail en arrière-plan s’ils sont utilisés. Documentez différences intentionnelles et lacunes restantes ; les tests ne couvrent que les parcours exercés. Consultez répétition de mise à niveau et sauvegarde.

## Ce que cela ne garantit pas

Il n’existe aucune garantie générale de compatibilité binaire, de schéma ou d’extensions, aucune version de production prise en charge ni migration en production validée. Revenir au seul ancien code n’annule pas les changements de schéma ou RRD ; la récupération peut nécessiter les sauvegardes cohérentes. Utilisez les sources maintenues du projet et consignez leur provenance sans supposer que les archives d’un autre projet constituent un paquet Kadupul testé. Kadupul n’est ni affilié à The Cacti Group ni approuvé par celui-ci. Consultez l’état du projet.

[Modèles](/fr/concepts/templates/) · [Évaluation des extensions](/fr/guides/install-and-vet-plugins/) · [Répétition de mise à niveau](/fr/guides/upgrade-safely/) · [Sauvegarde](/fr/guides/back-up-and-restore/) · [État du projet](/fr/project/status/)

Base applicative vérifiée le 26 octobre 2026 : [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
