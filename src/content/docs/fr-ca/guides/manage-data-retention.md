---
title: Gérer la rétention des données
description: Choisir la rétention et la résolution, estimer l'espace disque et planifier les modifications des fichiers RRD existants.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 24
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe pas de version ni de chemin de
migration officiellement pris en charge pour Kadupul. Testez ces procédures sur une copie isolée
avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr-ca/project/status/).
:::

La rétention est configurée lors de la création du fichier et reste inchangée pendant les mises à jour normales. Modifier le
profil ultérieurement change l'aspect du prochain fichier et laisse chaque fichier existant
exactement tel qu'il était. Réglez cela correctement avant de créer dix mille sources
de données, car les modifications ultérieures nécessitent une maintenance explicite des fichiers ou une migration.

Lisez d'abord [Sources de données et archives](/fr-ca/concepts/data-sources-and-rras/) si les
termes pas (step), heartbeat, archive et consolidation ne vous sont pas déjà familiers.

## Ce que contient un profil

Un profil de source de données constitue la politique de rétention. Un profil, une structure de stockage.

| Champ | Signification |
|---|---|
| Intervalle d'interrogation (step) | Fréquence à laquelle une valeur est attendue, en secondes |
| Heartbeat | Intervalle maximal autorisé entre les mises à jour avant que l'entrée ne soit traitée comme inconnue |
| Facteur X-Files | Proportion d'une fenêtre de consolidation pouvant être inconnue avant que la valeur consolidée ne soit inconnue |
| Fonctions de consolidation | Parmi `AVERAGE`, `MIN`, `MAX`, `LAST`, celles qui sont conservées |
| Archives | Une ligne par résolution, chacune avec un niveau d'agrégation et un nombre de lignes |
| Par défaut | Indique si les nouvelles sources de données choisissent ce profil |

Le pas correspond par défaut à l'intervalle du poller. Un profil dont le pas est plus fin que
l'intervalle d'interrogation ne peut pas récupérer des détails qui n'ont jamais été échantillonnés. Le fait que ses lignes
soient inconnues dépend du heartbeat et de la normalisation RRDtool.

## Ce qui est fourni par défaut

Trois profils sont fournis d'emblée. Tous trois conservent les quatre fonctions de consolidation.

| Profil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Le profil 5 Minute est le profil par défaut.

Chacun comporte quatre archives. Le niveau d'agrégation est exprimé sous forme de multiplicateur de pas,
de sorte que la résolution réelle est le multiplicateur multiplié par le pas du profil, et la durée couverte est
cette résolution multipliée par le nombre de lignes.

### 5 Minute Collection

| Archive | Multiplicateur | Lignes | Résolution | Durée couverte |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minutes | environ 2 jours |
| Weekly | 6 | 700 | 30 minutes | environ 14 jours |
| Monthly | 24 | 775 | 2 heures | environ 64 jours |
| Yearly | 288 | 797 | 1 jour | environ 2 ans 2 mois |

### 1 Minute Collection

| Archive | Multiplicateur | Lignes | Résolution | Durée couverte |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minute | environ 2 jours |
| Weekly | 15 | 1440 | 15 minutes | 15 jours |
| Monthly | 60 | 8784 | 1 heure | environ 366 jours |
| Yearly | 720 | 7305 | 12 heures | environ 10 ans |

### 30 Second Collection

| Archive | Multiplicateur | Lignes | Résolution | Durée couverte |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 secondes | environ 1 jour |
| Weekly | 30 | 1346 | 15 minutes | environ 14 jours |
| Monthly | 120 | 1445 | 1 heure | environ 60 jours |
| Yearly | 480 | 4380 | 4 heures | 2 ans |

Les noms sont de simples libellés et ne définissent pas le comportement. Rien n'impose que l'archive appelée
« Yearly » contienne réellement une année de données.

## Comment le profil devient un fichier

À la création, les archives et les fonctions de consolidation du profil sont lues et
transformées en une commande de création. Le pas provient du paramètre stocké `rrd_step`
de la source de données, généralement renseigné à partir de son profil. Chaque élément de source de données inclus apporte une ligne de définition
comportant son nom, son type, son heartbeat, son minimum et son maximum. Chaque archive
apporte une ligne par fonction de consolidation, comportant la fonction, le facteur X-Files, le multiplicateur et le nombre de lignes.

Quatre archives multipliées par quatre fonctions de consolidation donnent seize définitions d'archives
dans le fichier. C'est cette multiplication qui consomme l'espace disque.

Si le fichier existe déjà, le chemin de création normal s'arrête sans le réécrire.
La modification d'un profil ne migre pas automatiquement les fichiers. Les outils de maintenance explicites
constituent une opération distincte décrite ci-dessous.

## Choisir une politique

Trois questions, dans cet ordre.

**Quelle est la question la plus précise que vous poserez jamais ?** Cela détermine le pas. Un pas de
30 secondes répond à la question « que s'est-il passé pendant cette anomalie de 90 secondes ». Un pas de 5 minutes ne
le pourra jamais, pour aucun fichier créé sous ce profil. Des pas plus fins coûtent du travail au poller
à chaque cycle ainsi que de l'espace disque.

**Jusqu'où dans le passé poserez-vous cette question ?** Cela détermine le nombre de lignes de l'archive quotidienne. La plupart
des installations ont besoin de quelques jours à pleine résolution et se satisfont ensuite
de données plus grossières.

**Quelles questions survivent à la consolidation ?** Cela détermine les fonctions de consolidation.
`AVERAGE` répond à ce qui était typique. `MAX` répond à la gravité maximale atteinte.
`MIN` répond s'il y a jamais eu une interruption. `LAST` répond à ce qu'était la valeur finale dans
la fenêtre, ce qui importe pour les mesures représentant des états plutôt que des débits.

Supprimer l'une des quatre fonctions de consolidation réduit la charge utile des valeurs stockées des
nouveaux fichiers d'un quart à chaque résolution. C'est aussi le
regret le plus fréquent exprimé par les utilisateurs plus tard. Conservez `MAX` à moins d'être certain que personne
ne s'enquerra jamais d'un pic.

## Dimensionner le disque

La taille d'un fichier découle des chiffres choisis. D'après le dimensionnement utilisé dans
l'interface :

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

L'interface utilise 284 et 300 octets comme estimations de surcharge fixe. Considérez cela
comme une approximation de dimensionnement, et non comme une description exacte de chaque format de fichier RRDtool.
Chaque valeur stockée occupe 8 octets, et le nombre total de lignes correspond à la somme des nombres de lignes sur
les définitions d'archives du profil avant multiplication par les fonctions de consolidation.
Mesurez des fichiers représentatifs avec le RRDtool installé avant de dimensionner le stockage.

Pour un fichier à source de données unique avec les quatre fonctions de consolidation :

| Profil | Lignes totales | Taille de fichier approximative |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Multipliez par le nombre de sources de données attendues, et non par le nombre de graphiques. Un
graphique peut combiner des champs provenant d'un seul fichier ou de plusieurs fichiers. Comptez les véritables fichiers
RRD et les éléments de source de données contenus dans chacun.

Vingt mille sources de données sur le profil par défaut représentent environ 1,8 Go. Ces mêmes
vingt mille sur le profil 1 Minute représentent environ 13 Go. Ce ratio reflète
à la fois la résolution et les différentes durées de rétention des profils, et non le seul pas.
Une collecte plus fine augmente également la fréquence d'écriture. Consultez [Écritures à volume élevé](/fr-ca/concepts/high-volume-writes/) avant de choisir
un pas fin à grande échelle.

Les éditeurs de profil et d'archive affichent une taille calculée au fur et à mesure que vous modifiez les chiffres.
Utilisez-les. Il est facile de se tromper d'un facteur quatre dans ces calculs arithmétiques.

## Ce que la modification d'un profil fait et ne fait pas

C'est ici que certains administrateurs perdent leur historique.

| Modification | Effet sur les nouveaux fichiers | Effet sur les fichiers existants |
|---|---|---|
| Ajouter ou supprimer une archive | Appliqué | Aucun |
| Modifier un nombre de lignes | Appliqué | Aucun |
| Modifier un niveau d'agrégation | Appliqué | Aucun |
| Ajouter ou supprimer une fonction de consolidation | Appliqué | Aucun |
| Modifier le pas | Les nouvelles sources de données en héritent ; la création utilise leur pas stocké | Aucune migration automatique de fichier |
| Modifier le heartbeat | La création utilise les métadonnées stockées des éléments de source de données ; voir ci-dessous | Aucun ajustement automatique de fichier |
| Supprimer le profil | Refusé tant qu'un modèle ou une source de données y fait référence, et pour le profil par défaut | Aucun |

**Modifier le heartbeat d'un profil utilisé ne met à jour que les métadonnées.** Enregistrer un nouveau
heartbeat le stocke sur le profil et sur les éléments de source de données des modèles et
des sources de données locales utilisant ce profil ; les autres modèles ne sont pas modifiés.

L'enregistrement n'ajuste pas les fichiers RRD existants. Sauvegardez les métadonnées ainsi que les fichiers,
et comparez le profil, les éléments de modèle, les éléments de source de données locale et la sortie réelle
de `rrdtool info` après une opération de maintenance du heartbeat.

L'utilitaire `cli/update_heartbeat.php` du collecteur principal peut ajuster les fichiers existants
et mettre à jour les métadonnées. Commencez par `--help`, `--list-heartbeats`,
`--list-data-templates` et `--list-profiles`. Le nouveau heartbeat doit être pris en charge
et valoir au moins le double de l'intervalle configuré du poller. Utilisez `--data-template-id`
pour limiter la sélection ; l'utilitaire ne dispose d'aucune option d'exécution à blanc (dry-run).

Sans `--force`, les profils sélectionnés doivent déjà avoir le heartbeat
demandé. Avec `--force`, les valeurs de profil partagées changent également ; inventoriez donc
tous leurs utilisateurs avant de continuer. `--prev-heartbeat` filtre les valeurs de base de données, et non
le heartbeat lu depuis chaque RRD : après un enregistrement web partiel, sélectionner l'ancienne
valeur de fichier peut ne correspondre à rien. Vérifiez la sélection et inspectez les fichiers
résultants. Le test isolé a réussi à ajuster son fichier existant de 600 à 900
après l'alignement des métadonnées de son profil.

Deux autres pièges se trouvent juste à côté.

**L'éditeur restreint les modifications structurelles dès qu'un profil est utilisé.** Dès
qu'une vraie source de données existe sur un profil, le pas, le facteur X-Files, les fonctions de consolidation,
le nombre de lignes d'archive et les niveaux d'agrégation deviennent en lecture seule dans l'éditeur ;
les commandes d'ajout/suppression d'archives sont également masquées. Dupliquez le profil et
modifiez la copie. Ces restrictions d'interface ne constituent pas une validation côté serveur
des requêtes soumises.

**Réassignez les références avant de supprimer un profil.** La liste désactive la sélection
lorsqu'un modèle ou une source de données locale utilise un profil, et le serveur refuse
de supprimer un profil auquel il est encore fait référence.

## Déplacer des sources de données entre profils

Il existe une action de masse sur les modèles de données pour modifier le profil. Elle réécrit
le profil, le pas et le heartbeat enregistrés du modèle, et se limite délibérément
aux lignes de modèles. Les sources de données déjà existantes ne sont pas incluses.

La séquence pour une véritable migration est donc la suivante :

1. Créez le nouveau profil et vérifiez sa taille calculée.
2. Pointez le modèle de données vers celui-ci.
3. Acceptez que tout ce qui est créé à partir de maintenant utilise la nouvelle structure.
4. Décidez, séparément, de ce qu'il convient de faire des fichiers que vous avez déjà.

La quatrième étape propose plusieurs options, selon la modification et la version de RRDtool installée.

**Les laisser tels quels.** Différentes structures de rétention peuvent coexister. Maintenez les
métadonnées d'interrogation de chaque source de données existante cohérentes avec son fichier ; modifier une
seule référence de profil en base de données ne migre ni son pas, ni ses champs, ni ses archives.

**Reconstruire.** Supprimez et recréez la source de données. C'est rapide, mais l'historique disparaît.

**Fusionner (Splice).** L'utilitaire en ligne de commande splice fusionne un ancien fichier dans un nouveau et
peut en modifier la résolution au passage, à condition que le nouveau fichier dispose déjà du
pas correct. Il propose un mode d'exécution à blanc (dry run). Utilisez-le sur une copie avant de l'appliquer
à des données auxquelles vous tenez.

**Maintenance RRDtool.** Selon la version installée et la modification souhaitée,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) ou
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) peuvent modifier un
fichier existant tout en préservant les données conservées. Arrêtez les processus d'écriture concurrents, conservez
une sauvegarde et vérifiez le résultat sur une copie. Ces opérations ne recréent pas les détails
déjà éliminés par la consolidation.

## Profils externes

Une source de données peut être configurée sur un profil externe, qui enregistre un pas de zéro.
Cela indique que le fichier est géré en dehors du circuit normal, et la liste des sources de données
l'affiche comme externe plutôt que d'indiquer un intervalle. Utilisez-le pour les fichiers écrits par un autre
processus. Ne l'utilisez pas pour signifier « aucune politique », car la rétention reste
celle avec laquelle le fichier a été construit ; elle n'est simplement décrite nulle part où vous puissiez la voir.

## Modes de défaillance

| Symptôme | Cause habituelle |
|---|---|
| La modification d'un profil semble n'avoir aucun effet | Comportement attendu. Les fichiers existants conservent la structure avec laquelle ils ont été créés |
| Le nombre de lignes et le niveau d'agrégation ne peuvent pas être modifiés | Le profil est utilisé par au moins une source de données. Dupliquez-le |
| L'interface affiche un heartbeat, mais le fichier se comporte selon un autre | Le heartbeat du profil a changé et les fichiers n'ont jamais été ajustés |
| Les nouvelles sources de données échouent à la création, le journal indique qu'aucune archive n'est assignée | Le profil a été supprimé alors que des sources de données y faisaient encore référence |
| L'archive la plus fine est remplie de valeurs inconnues | Vérifiez les mises à jour manquantes, le heartbeat et les règles de consolidation |
| Une semaine de graphiques présente des trous toutes les quelques heures | Le heartbeat est trop proche du pas pour un poller qui prend du retard |
| Les pics visibles hier ont disparu dans la vue mensuelle | Seul `AVERAGE` est conservé, ou l'archive `MAX` a été supprimée pour économiser de l'espace |
| Le disque a grossi quatre fois plus vite que prévu | L'estimation a compté les archives mais a omis les fonctions de consolidation |
| Une résolution souhaitée est absente de la liste déroulante des nouvelles archives | L'éditeur propose une archive la plus fine au pas du profil, puis uniquement des choix plus grossiers que les archives existantes |
