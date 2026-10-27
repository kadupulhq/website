---
title: Questions fréquentes
description: Réponses concises aux premières interrogations des nouveaux arrivants et des utilisateurs actuels de Cacti, avec liens vers les pages de référence.
banner:
  content: Kadupul est en pré-alpha. Le code est disponible, mais aucune version prise en charge ni migration vers la production n’a été validée. Ne l’utilisez pas en production.
sidebar:
  order: 7
---

Réponses courtes. Chacune renvoie vers la page qui traite exhaustivement du sujet.

## Le projet

### Puis-je l'installer dès aujourd'hui ?

Le code source est disponible pour des phases de développement et d'expérimentation isolée. Il n'existe à ce jour aucune publication officiellement maintenue ni procédure de déploiement validée pour la production.

Les procédures d'installation et guides pratiques doivent être confrontés au code réel que vous exploitez. Consultez la page [État d'avancement](/fr/project/status/).

### Le projet est-il prêt pour la production ?

Non. Le dépôt qualifie Kadupul de pré-alpha et inapte à une exploitation en production. L'état d'avancement officiel n'exclut pas que des tiers aient pu tester du code de développement.

### Kadupul remplace-t-il directement Cacti ?

Kadupul est un fork autonome disposant de ses propres priorités d'ingénierie et de ses canaux d'assistance. En statut pré-alpha, une migration nécessite de tester et valider les versions et extensions employées. Consultez le guide [Venant de Cacti](/fr/guides/coming-from-cacti/).

### Pour quelle raison créer un projet distinct ?

Kadupul offre l'espace requis pour repenser des sous-systèmes, moderniser le niveau de base du langage et faire évoluer des interfaces internes selon son propre calendrier de publication. Consultez [Pourquoi ce fork existe](/fr/project/why-this-fork/).

### De quelle version de Cacti ce projet est-il issu ?

L'application a été scindée à partir de Cacti 1.2.31. Le dépôt entretient les branches `main` et `lts/1.2` avec des objectifs d'évolution distincts. Consultez [État d'avancement](/fr/project/status/).

### Qui assure la maintenance ?

L'équipe du projet Kadupul entretient le dépôt. Utilisez son gestionnaire de tickets et son [processus de contribution](/fr/project/contributing/) pour participer.

### Existe-t-il une feuille de route, un calendrier de publication ou une politique de support ?

Le dépôt fixe des objectifs de publication, une politique de versionnement et un cadre de contribution. Il n'existe pas encore de version de production officiellement prise en charge. Consultez [État d'avancement](/fr/project/status/) pour appréhender la distinction entre livrables planifiés et artefacts déjà publiés.

### Le projet est-il affilié à The Cacti Group ?

Non. Kadupul n'est ni affilié à The Cacti Group ni soutenu par cette organisation. Nous le décrivons comme un fork de Cacti parce qu'il s'agit d'une réalité factuelle relative aux origines du code. Cacti constitue leur projet et leur marque.

### Que signifie ce nom ?

Kadupul est l'appellation cinghalaise d'un cactus dont la floraison se produit la nuit. Cacti tire son nom de la famille botanique globale ; Kadupul en représente une espèce précise. Ce choix marque les racines du projet sans prétendre se substituer à l'ensemble. Une explication détaillée figure dans [Ce qu'est Kadupul](/fr/start/what-kadupul-is/).

## Venant de Cacti

### Mes plugins fonctionneront-ils ?

C'est l'objectif visé. L'API des plugins compte parmi nos quatre impératifs de compatibilité. Le chargement et l'exécution sans retouche d'un plugin Cacti doivent néanmoins être attestés pour les versions utilisées.

La compatibilité reste un objectif d'ingénierie, et non un chèque en blanc délivré à chaque plugin. Évaluez les plugins et les versions dont vous dépendez avant d'envisager une migration. Consultez [Compatibilité avec Cacti](/fr/project/compatibility-with-cacti/) ainsi que [Venant de Cacti](/fr/guides/coming-from-cacti/).

### Mes fichiers RRD resteront-ils exploitables ?

Préserver l'historique RRD constitue un engagement de compatibilité central. Ces fichiers contiennent des séries temporelles irremplaçables. Validez la relecture de vos fichiers existants sur une copie avant toute bascule.

Toute démarche imposant de supprimer puis de recréer ces historiques doit être catégoriquement écartée. Consultez [Venant de Cacti](/fr/guides/coming-from-cacti/).

### Mes modèles et ma base de données seront-ils préservés ?

Les modèles sont prévus pour être importés à l'identique. Le schéma relationnel doit demeurer lisible et migrable sans conversion vers un format pivot. Ces critères exigent une validation concrète, au même titre que les plugins et les fichiers RRD.

### Comment serai-je informé des divergences entre Kadupul et Cacti ?

Par une documentation systématique. L'écueil que le projet évite n'est pas la divergence de code en soi, qui constitue la raison d'être d'un fork, mais la divergence non documentée, qui métamorphoserait chaque montée de version en enquête.

### Le système fonctionne-t-il avec Spine ?

Kadupul maintiendra un fork de Spine en parallèle du collecteur PHP. Son emplacement sur le dépôt et ses binaires validés ne sont pas encore présentés ici. Spine est compilé et mis en place de façon distincte. L'intégration héritée prend en compte le paramètre `poller_type` et les chemins système, la commande du collecteur parent, les réglages lus par Spine et les tables qu'il met à jour.

Validez conjointement vos versions de Kadupul et de Spine avant toute bascule finale. Signalez tout dysfonctionnement sur le [gestionnaire de tickets Kadupul](https://github.com/kadupulhq/kadupul/issues). Consultez la page [Spine, le collecteur C](/fr/reference/spine/) pour les guides de compilation et d'ajustement.

### L'application fonctionne-t-elle avec le proxy RRDtool ?

Kadupul n'exploite pas le démon proxy maintenu par l'organisation Cacti. Privilégiez un stockage RRDtool local. La page [Référence du proxy RRDtool](/fr/reference/rrdproxy/) consigne le protocole client d'origine ; il ne s'agit pas d'un mode de déploiement officiellement supporté. Un composant de remplacement géré par Kadupul devra être conçu et validé avant toute prise en charge documentaire formelle.

### Quels sont les prérequis d'exécution ?

Un serveur web avec PHP, MySQL ou MariaDB, RRDtool, ainsi qu'un ordonnanceur planifiant les cycles du collecteur. Les versions exigées et les modules requis sont détaillés sur la page [Prérequis](/fr/reference/requirements/).

## Concession de licence

### Sous quelle licence le logiciel est-il distribué ?

GPL-3.0-or-later.

### Cacti mentionne la GPL-2. Comment un fork peut-il passer en GPL-3 ?

La licence de l'application parente autorise explicitement la version 2 de la GPL ou toute version plus récente. Kadupul fait le choix de cette version ultérieure pour sa propre distribution. Les dépendances restent régies par leurs licences d'origine. Consultez [Licence](/fr/project/license/).

### Sous quelle licence cette documentation est-elle placée ?

CC BY-SA 4.0. Le code de ce site demeure sous licence GPL-3.0-or-later avec l'ensemble du projet. Vous êtes autorisé à réutiliser ce texte sous réserve d'attribuer la paternité au projet et de diffuser les œuvres dérivées selon des conditions identiques.

### D'où proviennent ces contenus ?

Ces pages explicitent le fonctionnement réel observé dans le code source de l'application. La documentation extérieure impose son propre examen juridique avant toute réutilisation.

Ce principe s'applique identiquement aux contributions. Les ajustements apportés à la documentation tirent leurs preuves du code. Consultez la page [Contribuer](/fr/project/contributing/).

## Participer

### Comment signaler une faille de sécurité ?

De façon strictement confidentielle, en passant par les GitHub Security Advisories du dépôt ciblé. Jamais au moyen d'un ticket public.

Du code non publié peut être exécuté dans des environnements et présenter des vulnérabilités. Effectuez votre signalement de façon privée quel que soit le niveau de publication. Consultez notre [Politique de sécurité](/fr/project/security/).

### Une vulnérabilité identifiée ici concerne sans doute aussi Cacti. Que convient-il de faire ?

Transmettez-la de manière privée à Kadupul en précisant les éléments identifiés dans le code partagé. Les mainteneurs de Kadupul gèrent l'évaluation et la remédiation pour Kadupul conformément à la [politique de sécurité du dépôt](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Comment participer au développement ?

Consultez [Contribuer](/fr/project/contributing/) ainsi que les instructions propres à la branche visée. Échangez sur les changements structurants avant de débuter l'implémentation.

### J'ai repéré une erreur sur ce site.

C'est une excellente chose. L'intégralité des pages a été rédigée d'après le code source ; toute inexactitude l'est donc de son propre fait. Chaque page comporte un lien facilitant les retouches.
