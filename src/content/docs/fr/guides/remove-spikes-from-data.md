---
title: Supprimer les pics des données
description: Prévisualiser les corrections de pics, préserver des copies de récupération et vérifier les modifications des échantillons RRD conservés.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 19
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe pas de version ni de chemin de
migration officiellement pris en charge pour Kadupul. Testez ces procédures sur une copie isolée
avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr/project/status/).
:::

:::danger[Cette opération réécrit l'histoire ; la récupération nécessite une sauvegarde]
La suppression des pics extrait l'archive, modifie les valeurs, restaure un fichier frère temporaire
et remplace l'original après validation. Il n'existe pas d'annulation automatique. Préservez
et vérifiez une copie de récupération, exécutez d'abord `--dryrun` et confirmez les échantillons cibles
avant de valider une modification.
:::

Un pic désigne ici un ou deux échantillons tellement plus grands que tout ce qui les
entoure que l'axe vertical s'adapte à eux et que le reste du graphique s'aplatit sur
la ligne de base. La mesure est fausse, et elle est particulièrement voyante.

## D'où ils proviennent

La plupart des pics sur une source de données basée sur un compteur sont arithmétiques et non de vraies mesures.
Une source de données de type compteur stocke un débit calculé à partir de la différence entre deux
lectures. Tout ce qui rend la seconde lecture beaucoup plus grande que la première,
par rapport au temps écoulé entre elles, peut produire un faux débit. Des réinitialisations de compteur,
un traitement incorrect des dépassements de capacité, une réindexation d'interface qui déplace les lectures sur la mauvaise
source de données ou des erreurs d'horodatage peuvent en être la cause. Un dépassement normal de compteur
n'est pas en soi la preuve d'un échantillon défectueux ; vérifiez le type de source de données et les lectures d'entrée.

Consultez [Sources de données et RRA](/fr/concepts/data-sources-and-rras/) pour comprendre comment le débit est
calculé.

Corrigez la cause dans la mesure du possible. Supprimer le pic est purement cosmétique ; cela n'empêchera
pas le prochain.

## Les quatre méthodes

L'outil intervient sur l'intégralité du fichier : il extrait chaque archive du fichier RRD, détermine
les valeurs à remplacer et restaure le résultat.

| Méthode | Ce qu'elle sélectionne | Nécessite une fenêtre |
|---|---|---|
| `stddev` | Valeurs éloignées de plus de N écarts-types de la moyenne | Non |
| `variance` | Valeurs supérieures de plus de N pour cent à la moyenne après élimination des valeurs aberrantes | Non |
| `float` | Tout ce qui se trouve à l'intérieur d'une fenêtre temporelle définie | Oui |
| `fill` | Échantillons inconnus et de valeur nulle à l'intérieur d'une fenêtre temporelle définie | Oui |

`stddev` et `variance` recherchent d'eux-mêmes. `float` et `fill` exécutent ce que vous leur ordonnez à l'intérieur
d'une plage que vous désignez, et échouent immédiatement si vous ne spécifiez pas de début et de fin.

`fill` ne se limite pas aux données manquantes : il peut remplacer des zéros mesurés par des
valeurs non nulles. Ne l'utilisez pas sur une plage contenant des relevés nuls ou inactifs valides,
à moins que cette altération ne soit délibérée.

La méthode de variance élimine les N échantillons les plus élevés et les plus bas avant de calculer la
moyenne de comparaison, où N correspond au paramètre d'aberrations. C'est ce qui empêche
le pic de gonfler le seuil censé le détecter.

Tout ce qui est sélectionné est remplacé, et trois remplacements sont possibles.

| Remplacement | Résultat |
|---|---|
| `last` | La dernière valeur saine connue. Valeur par défaut. |
| `avg` | Une moyenne calculée pour le champ/archive ; le calcul dépend de la méthode. |
| `nan` | Inconnu pour les méthodes statistiques ; voir la limitation de la méthode par fenêtre ci-dessous. |

Inconnu consigne qu'aucune mesure utilisable n'est disponible. `last` et `avg`
substituent des valeurs qui peuvent sembler mesurées à quiconque lira le graphique plus tard.
Choisissez le remplacement avec discernement et vérifiez le résultat réellement enregistré.

**Méthodes par fenêtre avec NaN :** avec `--avgnan=nan`, `float` remplace chaque valeur connue
de la fenêtre par une valeur inconnue, et `fill` remplace les valeurs nulles ou non numériques de la
fenêtre par une valeur inconnue. Les méthodes statistiques avec limites temporelles facultatives ne remplacent que les
aberrations détectées, elles ne sont donc pas équivalentes à effacer toute une fenêtre.

## Prévisualiser, puis appliquer

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Une exécution à blanc extrait le RRD et l'analyse sans réécrire le fichier de production. Elle nécessite
néanmoins un répertoire de travail utilisable et des droits de maintenance. Une prévisualisation ne réserve
pas le fichier jusqu'à une validation ultérieure : de nouveaux échantillons ou des options modifiées peuvent changer le
résultat. L'exemple fenêtré utilise toujours une sélection statistique ; il ne supprime pas
toutes les valeurs de cette fenêtre.

Les arguments de temps acceptent un horodatage Unix ou une chaîne de date. Une chaîne
impossible à analyser est rejetée avant toute réécriture. Utilisez des horodatages Unix lorsque
l'interprétation du fuseau horaire risquerait d'être ambiguë.

## Ce qui arrive réellement au fichier

Bon à savoir avant de l'exécuter sur des données qui vous importent.

1. Le fichier est extrait au format XML dans le répertoire de sauvegarde.
2. Les commentaires sont supprimés et chaque archive est analysée pour les statistiques.
3. Les valeurs sélectionnées sont remplacées dans le XML.
4. Le fichier original est copié dans le répertoire de sauvegarde.
5. Le XML modifié est restauré dans un fichier frère privé, validé et renommé par-dessus
   l'original tout en préservant son propriétaire, son groupe et son mode.

L'étape 4 constitue le filet de sécurité et n'est pas optionnelle : si la copie échoue, la restauration
n'a pas lieu. C'est à partir de cette copie, et non d'une option de ligne de commande, que vous
restaureriez les données. Son nom est basé sur l'original et peut recevoir un suffixe unique pour éviter
d'écraser un artefact existant. `--backup` demande en outre un instantané de
récupération persistant. Lisez les chemins indiqués et vérifiez les copies avant de vous y
fier.

L'opération requiert des répertoires POSIX locaux de confiance et un verrouillage de maintenance ;
des bits de mode accessibles en écriture seuls ne suffisent pas. Elle refuse le stockage non pris en charge et un
point de terminaison rrdcached configuré. Arrêtez les processus d'écriture externes, qui ne participent pas au
protocole de verrouillage de Kadupul. Exécutez la commande sous le compte de service propriétaire du stockage.
Consultez les [exigences d'installation](/fr/reference/requirements/) pour l'accès au stockage.

## Paramètres qui contrôlent les valeurs par défaut

Les arguments de la ligne de commande prévalent. Tout ce que vous omettez provient des
paramètres système, et les paramètres spécifiques à l'utilisateur remplacent ceux du système lorsque l'outil est
exécuté depuis l'interface.

| Paramètre | Valeur par défaut | Ce qu'il fait |
|---|---|---|
| Removal method | Variance with outliers removed | Méthode à employer |
| Replacement method | Last known good | Ce qui remplace une valeur retirée |
| Number of standard deviations | 10 | Seuil pour la méthode `stddev` |
| Variance percentage | 1000 | Seuil pour la méthode `variance` |
| Variance number of outliers | 5 | Échantillons hauts et bas écartés avant calcul de la moyenne |
| Max kills per RRA | 5 | Plafond visé ; actuellement non appliqué de manière fiable |
| RRDfile backup directory | `cache/spikekill/` under the install | Emplacement du dump et de la copie |
| Backup retention | 3 months | Durée de conservation des copies |

Il existe également un mode par lot : une planification (toutes les 6, 12, 24 ou 48 heures), une heure de
référence et une liste de modèles de graphiques sur lesquels intervenir. Le mode par lot est désactivé par défaut.
L'activer implique que le système modifie les archives sans que personne ne contrôle le
résultat. Restreignez strictement la liste des modèles si vous choisissez de l'activer.

## Pièges

**Les seuils par défaut sont volontairement larges.** Dix écarts-types et une
variance de 1000 pour cent constituent des critères très larges. Une exécution qui ne signale aucun pic n'a
probablement pas échoué ; elle vous a simplement indiqué que les valeurs se situent dans la plage demandée. Resserrez le
seuil plutôt que de changer de méthode au hasard.

**Max kills per RRA ne restreint que les méthodes statistiques.** Pour `stddev` et
`variance`, le compte couvre toutes les sources de données d'une archive et se réinitialise à l'archive
suivante. Les méthodes de fenêtre `float` et `fill` remplacent chaque valeur correspondante dans la
fenêtre. Le compte récapitulatif inclut les remplacements NaN. Examinez la prévisualisation complète
et utilisez une fenêtre temporelle étroite.

**Une valeur consolidée ne peut pas être récupérée.** Les archives plus anciennes contiennent une valeur par
période, déjà moyennée. Remplacer cette valeur ne restitue pas la mesure
réelle pour cette période ; cela substitue une valeur plausible. Plus vous remontez dans le passé,
plus la correction relève de la conjecture.

**Le répertoire de sauvegarde doit être configuré et fiable.** L'extraction et les
copies de récupération y sont déposées. Les répertoires manquants, non sécurisés ou invérifiables sont refusés ; ne rendez
pas un répertoire accessible à tous en écriture pour contourner une erreur.

**Conservez votre propre journal de modifications en plus des journaux applicatifs.** Enregistrez l'opérateur,
la commande, la plage temporelle, les chemins de sauvegarde et les vérifications avant/après. Les seuls décomptes récapitulatifs
ne constituent pas une preuve suffisante de ce qui a changé.

**Exécutez sous le compte de service prévu.** Un remplacement réussi préserve la propriété
et le mode du fichier. Root ne permet pas de contourner les vérifications de confiance des répertoires ;
vérifiez que l'interrogation normale peut toujours mettre à jour le résultat.

**Supprimer le pic ne répare pas le graphique si la source de données est incorrecte.** Si une
réindexation d'interface a déplacé des valeurs vers la mauvaise source de données, le pic n'est qu'un
symptôme. Consultez [Dépanner les données manquantes](/fr/guides/troubleshoot-missing-data/)
avant de commencer à modifier des archives.
