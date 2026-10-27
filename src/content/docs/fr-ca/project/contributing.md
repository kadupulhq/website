---
title: Contribuer
description: Les besoins du projet, les normes d'ingénierie attendues pour toute modification et les critères d'évaluation.
banner:
  content: Kadupul est en pré-alpha. Le code est disponible, mais aucune version prise en charge ni migration vers la production n’a été validée. Ne l’utilisez pas en production.
sidebar:
  order: 6
---

Le code source est consultable et le dépôt détaille le processus de contribution. Prenez connaissance du fichier [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) avant d'entamer vos travaux. Les évolutions d'envergure doivent faire l'objet d'un échange préalable sur le gestionnaire de tickets.

## Le standard

Chaque pull request doit rester focalisée sur un objectif unique. Reproduisez toute anomalie avant de la corriger, validez le nouveau comportement et fournissez les commandes de test ainsi que leurs résultats. Préservez les interfaces publiques, à moins que le changement n'intègre une procédure de migration documentée.

## Normes d'ingénierie

Appliquez les conventions propres à la branche que vous modifiez. Examinez le guide des contributeurs et la configuration de l'intégration continue correspondante au lieu de présumer que les deux branches partagent les mêmes règles.

### Style

Sur `main`, les fichiers PHP modifiés appliquent le standard PHP-FIG PER-CS 2.0. Appliquez le reformatage de chaque fichier concerné dans un commit d'espaces distinct et contrôlez le résultat avec `tests/tools/check_php_style.sh`. La branche `lts/1.2` conserve la mise en forme de la version amont.

### Analyse statique

Exécutez l'ensemble des vérifications imposées par la branche cible. Ce site n'exige pas de niveau PHPStan, d'interface de journalisation ni de migration d'autoloading que le dépôt n'aurait pas formellement adoptés.

### Tests

Validez le comportement transformé par le correctif. Intégrez un test de non-régression pour tout correctif de bug et indiquez les commandes employées. La réussite de tests sans rapport direct ne valide pas la modification.

### Dépendances

Justifiez la nécessité de chaque dépendance, vérifiez sa licence et actualisez le manifeste ainsi que le fichier de verrouillage correspondants. Conformez-vous aux règles du dépôt relatives aux dépendances et à leur validation.

### Commits et pull requests

Utilisez les Conventional Commits et apposez votre signature sur chaque commit via `git commit -s` conformément au [Developer Certificate of Origin](https://developercertificate.org/). Séparez les modifications de style des changements fonctionnels pour permettre une relecture autonome.

## L'arborescence héritée ne répond pas à ces exigences

Le code hérité comporte des choix de style et des motifs d'implémentation anciens. L'harmonisation s'opère selon les règles de la branche cible, et non par une réécriture aveugle de l'ensemble du projet.

### Quelle règle prévaut ?

Référez-vous au fichier `CONTRIBUTING.md` de la branche visée. Sur `main`, la règle PER-CS sur les fichiers modifiés s'applique ; sur `lts/1.2`, préservez le style hérité.

## Documentation

Vérifiez toute affirmation en la confrontant à l'implémentation et employez des documents dont la licence permet l'intégration. Ne reprenez aucune prose tierce sans avoir contrôlé sa licence. Transmettez les vulnérabilités de sécurité selon la [procédure de signalement confidentielle](/fr-ca/project/security/).

## Compatibilité

Les interfaces de plugins, les modèles, la compatibilité de base de données et l'historique RRD sont des objectifs de publication. Consignez tout ajustement d'interface et apportez les éléments prouvant la compatibilité et la migration. Consultez la page [Compatibilité avec Cacti](/fr-ca/project/compatibility-with-cacti/).
