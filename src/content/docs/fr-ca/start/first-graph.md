---
title: Lire un premier graphique
description: Ce que les lignes signifient réellement, et les trois erreurs qui conduisent à les interpréter de travers.
sidebar:
  order: 4
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire, en attente de relecture par une personne maîtrisant la langue.
---

Un graphique n’est pas ici une reproduction directe de vos données. Il s’agit d’une image d’un résumé de vos données, et savoir de quel résumé il s’agit est fondamental.

## Ce que vous observez

Chaque graphique est généré à partir d’une archive circulaire (round-robin archive). L’archive conserve les échantillons récents en pleine résolution et regroupe les échantillons plus anciens au sein de tranches consolidées plus larges. Lorsque vous observez une période d’un an, vous ne voyez pas chaque échantillon de cinq minutes. Vous voyez une seule valeur par intervalle, sélectionnée par une fonction de consolidation.

Cette fonction correspond généralement à la moyenne. Il peut également s’agir du maximum ou du minimum. Cela a plus d’importance que tout le reste sur cette page.

Pour une demande de graphique classique à la volée, Kadupul assemble une commande RRDtool à partir de la configuration du graphique et l’exécute sur les fichiers présents sur le disque. Trois types de lignes composent cette commande, et il est utile de savoir les distinguer.

| Élément | Rôle |
|---|---|
| Une définition | Désigne un fichier, une source de données au sein de celui-ci et une fonction de consolidation |
| Un élément de tracé | Transforme une série en ligne, en surface ou en bande au sein d’un empilement |
| Un élément de légende | Affiche un nombre, calculé sur la période consultée |

L’ensemble du mécanisme est décrit dans [Comment les graphiques sont générés](/fr-ca/concepts/how-graphs-are-drawn/). Vous n’en avez pas besoin aujourd’hui. Il vous suffit de savoir que la définition du graphique et la plage temporelle demandée déterminent l’image obtenue. Les chemins de mise en cache et de graphiques en temps réel peuvent avoir un comportement différent.

## Commencer par les quatre dernières heures

Commencez par une courte fenêtre temporelle récente. L’archive sélectionnée dépend de la rétention, du pas et de la résolution du graphique ; quatre heures ne garantissent pas des données brutes ou non consolidées. Même l’archive la plus précise contient des valeurs normalisées dans le temps. Utilisez la commande de débogage du graphique et `rrdtool info` pour vérifier la fonction demandée et les pas d’archive disponibles avant de comparer des valeurs.

Deux particularités d’un graphique tout juste créé sont courantes et provoquent pourtant l’inquiétude.

**La ligne peut s’arrêter avant l’instant présent.** La tranche en cours peut être incomplète. Le calendrier de collecte, la mise en mémoire tampon et la normalisation peuvent également différer le point final affiché. Observez l’avancement des horodatages de mise à jour plutôt que de considérer un décalage fixe comme un signe de bon fonctionnement.

**Le début de la période peut être vide.** Une source de données créée il y a une heure contient une heure de données et onze mois de vide. L’archive est intégralement allouée lors de sa création ; la partie vide constitue donc un espace de stockage réel prêt à accueillir des données.

## Élargir ensuite la période et observer l’évolution du pic

Élargissez la période à une semaine. Les pics peuvent s’atténuer lorsque le graphique recourt à des moyennes plus grossières. Par exemple, si l’utilisation atteint 100 % pendant cinq minutes et zéro durant les 55 minutes restantes, la moyenne horaire s’établit aux alentours de 8,3 %. Une rafale de quatre minutes au sein d’une heure par ailleurs inactive donne une moyenne de 6,7 %. Les pics de courte durée peuvent déjà avoir été lissés à l’intérieur de l’intervalle d’échantillonnage initial.

La consolidation fait disparaître les détails. Si l’historique haute résolution a expiré, resserrer la vue ne permettra pas de le reconstituer à partir d’une archive de moyennes.

Il s’agit de la première des trois erreurs courantes, et celle qui provoque le plus de malentendus.

**Prendre une moyenne pour un pic.** Si la saturation vous importe, examinez un graphique élaboré à partir du maximum, et non de la moyenne. Cela ne fonctionne que si les archives enregistrent les maximums. S’il ne reste que des moyennes globales, les pics initiaux ne peuvent être reconstruits. Une archive MAX conserve les maximums des points en entrée normalisés dans le temps, et non un pic instantané inobservé survenu entre deux collectes.

Un comportement discret mérite d’être souligné. Si un élément de graphique requiert les maximums et que le fichier n’en dispose pas, le sélecteur de Kadupul peut basculer sur la première fonction disponible, ou sur AVERAGE s’il n’est pas en mesure de déterminer les fonctions existantes. L’image paraît correcte, mais elle répond à une toute autre question.

**Prendre un trou pour un zéro.** Un trou correspond à une valeur tracée inconnue. Parmi les causes possibles figurent des mises à jour manquantes, des entrées explicitement inconnues, des valeurs rejetées ou des expressions de calcul dans le graphique. Cela ne désigne pas de manière univoque un appareil indisponible.

Le heartbeat correspond à la durée maximale admissible entre deux mises à jour, et non à un délai supplémentaire s’ajoutant au pas. À titre d’exemple, un pas de 300 secondes assorti d’un heartbeat de 600 secondes tolère un écart maximal de 600 secondes entre deux mises à jour, et non 900. Les seuils de données inconnues de l’archive déterminent aussi l’apparition des trous. Voir [Définitions des sources de données de RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) et [Temps et intervalles](/fr-ca/concepts/time-and-intervals/).

Méfiez-vous des graphiques empilés sur ce point. Certains modèles remplacent les valeurs inconnues par un zéro au sein de leurs expressions de calcul. Sur de tels graphiques, une panne et une période de calme semblent identiques par conception. Examinez une vue non empilée avant de conclure qu’un service a cessé toute activité.

**Comparer deux graphiques dotés d’échelles verticales distinctes.** Deux graphiques placés côte à côte s’adaptent chacun à leurs propres données. Une modeste fluctuation et une variation majeure peuvent paraître semblables. Vérifiez l’axe avant d’en tirer une conclusion.

Tout en vérifiant l’axe, observez sa base. Un graphique peut graduer par milliers ou en puissances de 1024. Les chiffres stockés restent identiques ; seules les étiquettes changent. L’écart découle du préfixe : 1024 contre 1000 représente 2,4 % pour une première puissance et s’accentue avec les préfixes supérieurs. Vérifiez également la distinction bits contre octets, les expressions de calcul et la consolidation ; un simple écart en pourcentage ne suffit pas à identifier l’origine du problème.

## Lire la légende

La légende regroupe les chiffres qui comptent davantage que l’allure de la courbe. La valeur « Current » correspond généralement à la réduction LAST de la série sélectionnée, ce qui n’est pas obligatoirement une mesure prise à l’instant même où vous consultez le graphique. La moyenne et le maximum sont calculés sur la période consultée, et non sur l’ensemble de l’historique ; ils changent donc lorsque vous faites varier l’échelle.

Les entrées de légende par défaut sont le minimum, le maximum, la moyenne et la dernière valeur, étiquetée « current ». Deux aspects de leur fonctionnement surprennent régulièrement.

**Un chiffre en légende est une réduction de ce qui est dessiné, non de ce qui a été stocké.** Un maximum affiché sur une série lue avec des moyennes est un maximum de ces moyennes dérivées à la résolution retenue. Ce n’est pas le plus grand échantillon jamais recueilli. Sur un lien saturé, ces valeurs diffèrent grandement, et chacune répond légitimement à une interrogation distincte.

**Vérifiez la série utilisée par la légende.** De simples entrées GPRINT peuvent hériter de la série d’un élément tracé précédent ; les entrées dédiées au minimum, au maximum, à la moyenne et à la dernière valeur font l’objet d’un traitement propre. Réordonner les éléments dans un modèle de graphique peut dès lors modifier le relevé de la légende sans que personne n’ait touché à celle-ci. Si un nombre change après la modification d’un modèle sans rapport, vérifiez d’abord l’ordre des éléments.

## Quand un graphique semble incorrect

Vérifiez la chaîne de collecte dans cet ordre ; une anomalie peut survenir à plusieurs niveaux.

1. L’appareil répond-il à cet instant ?
2. Le collecteur tourne-t-il, et achève-t-il sa tâche dans l’intervalle imparti ?
3. Le fichier RRD présente-t-il une date de mise à jour récente ?
4. Le graphique lit-il bien la source de données attendue ?

En pratique :

**Étape 1.** Exécutez la même commande `snmpget` que lors de l’ajout de l’appareil, depuis le collecteur assigné. Si elle échoue, réglez ce dysfonctionnement avant d’évaluer le graphique.

**Étape 2.** Recherchez le récapitulatif de fin d’exécution. S’il est absent, vérifiez la planification, la destination du journal et les défaillances précoces du collecteur. Une exécution plus longue que l’intervalle peut différer les mises à jour ; comparez l’écart constaté avec le heartbeat.

**Étape 3.** Interrogez RRDtool directement :

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` indique l’horodatage de la dernière mise à jour, y compris pour des mises à jour portant des valeurs inconnues ; la mise en mémoire tampon peut retarder cet affichage. Utilisez `lastupdate` et `fetch` pour inspecter les valeurs comme décrit dans le guide d’ajout d’appareil. `info` vous indique le pas, le heartbeat, le type de source de données et les archives existantes. Si le fichier ne comporte aucune archive de maximums, cela répond à la question précédente sur les pics.

**Étape 4.** Activez le mode de débogage du graphique et observez la commande produite. Elle précise les fichiers, les sources de données associées et la fonction de consolidation pour chacune. Un graphique pointant vers une source de données différente de celle envisagée est fréquent après la réapplication de modèles ou la réindexation d’interfaces.

## Symptômes et significations courantes

| Ce que vous observez | Généralement |
|---|---|
| Ligne plate à zéro | Peut être un véritable zéro ou une expression remplaçant les valeurs inconnues par zéro |
| La ligne s’arrête puis reprend | Une valeur inconnue a interrompu la série tracée ; vérifiez la collecte et les expressions du graphique |
| Petits trous fréquents | Le collecteur termine en retard, ou le heartbeat est configuré trop près du pas |
| Pic visible sur quatre heures, absent sur une semaine | Vérifiez la résolution de l’archive et la consolidation avant de conclure à une perte de données ou à une panne de collecte |
| Maximum en légende inférieur au pic tracé | La légende réduit une série différente de celle imaginée |
| Graphique entièrement vide, sans erreur | Aucune source de données rattachée, ou aucune donnée collectée jusqu’ici |
| Valeurs décalées d’un ordre de grandeur | Type de source de données inadapté, ou compteurs 32 bits qui bouclent |
| Deux graphiques d’une même liaison diffèrent légèrement | Base d’axe distincte, ou consolidation différente |

[Dépanner les données manquantes](/fr-ca/guides/troubleshoot-missing-data/) explore ce parcours de manière plus approfondie. [Ajuster l’apparence des graphiques](/fr-ca/guides/tune-graph-appearance/) explique comment personnaliser l’aspect d’un graphique dès lors que vous avez confiance dans son contenu.

Le tutoriel s’arrête ici. Vous disposez d’une installation, d’un appareil qui répond et d’un graphique intelligible. Pour la suite, les [Guides pratiques](/fr-ca/guides/monitor-a-switch/) abordent des tâches précises, et les [Concepts](/fr-ca/concepts/architecture/) détaillent le fonctionnement interne du système.
