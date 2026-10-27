---
title: Temps et intervalles
description: Intervalle d'interrogation, pas RRD, heartbeat et dérive d'horloge, et pourquoi l'horodatage d'un échantillon décide de plus de choses qu'on ne l'attend.
sidebar:
  order: 7
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
---

La collecte repose sur trois horloges : la cadence du déclencheur, l'intervalle d'interrogation au sein de chaque exécution et le pas RRD. Elles requièrent des paramètres compatibles.

| Nombre | Appartient à | Mode d'utilisation |
|---|---|---|
| Intervalle du déclencheur | Cron, Planificateur de tâches ou `cactid.php` | Doit correspondre à `cron_interval`, interprété par `poller.php` comme 60 ou 300 secondes |
| Intervalle d'interrogation | Passes de collecte | `poller.php` calcule un nombre entier de passes par intervalle de déclencheur |
| Pas | Un fichier RRD | Intervalle de base de normalisation, défini depuis le profil de source de données à la création |
| Heartbeat | Un champ dans le fichier RRD | Écart maximal autorisé entre les mises à jour ; la création lit la définition du champ |

Par exemple, un déclencheur de 60 secondes et un intervalle d'interrogation de 10 secondes produisent six passes par invocation. Un déclencheur de 300 secondes et un intervalle d'interrogation de 300 secondes en produisent une seule. Ne configurez jamais l'intervalle du déclencheur en dessous de l'intervalle d'interrogation : 60/300 donne zéro passe. N'utilisez qu'un seul planificateur et arrêtez-le avant une exécution manuelle avec `--force`. Voir [Installation](/fr/start/install/).

La modification d'un profil ne migre pas automatiquement les fichiers existants. Le heartbeat peut être ajusté ; les changements de pas nécessitent une migration planifiée à l'aide des outils fournis par RRDtool. Vérifiez les définitions en base de données et l'output de `rrdtool info` par la suite.

## Quand ils concordent

Une source de données dont le pas est égal à l'intervalle d'interrogation est admissible à chaque passe, sous réserve de l'état de l'appareil, du contenu du cache et des limites de temps d'exécution. Les paramètres par défaut utilisent 300 secondes pour les deux. L'admissibilité ne garantit pas une lecture réussie.

## Quand le pas est plus long que l'intervalle

Le collecteur PHP utilise `rrd_next_step` sur chaque ligne de la liste de travail lorsque plusieurs planifications actives l'exigent. Il sélectionne les lignes à zéro ou en dessous, puis met à jour les décomptes pour son périmètre de collecteur et d'hôtes. Les lignes dont le pas est égal à l'intervalle d'interrogation restent à zéro. Les autres lignes diminuent de l'intervalle d'interrogation ; en cas de dépassement par le bas, la réinitialisation dépend du mode d'invocation : une passe normale de sous-déclencheur se réinitialise au pas moins l'intervalle, tandis que des intervalles égaux et le chemin tous hôtes se réinitialisent au pas complet. Ne supposez pas qu'un pas de dix minutes implique toujours une passe sur deux de cinq minutes ; inspectez les lignes échues et les horodatages réels.

Lorsque l'option **Équilibrer la charge des processus** est activée, la construction du cache attribue des décalages aux sources de données successives d'un appareil à l'aide du pas et de l'intervalle d'interrogation. Les champs d'une même source partagent un décalage. Cela permet de répartir le travail entre les passes, sans garantir un temps d'exécution identique : les latences, les délais d'expiration et les scripts diffèrent. Le déclencheur aligne également les décomptes incohérents entre les champs d'une même source de données.

Avant de conclure qu'un élément est défaillant parce qu'il n'a rien produit lors d'une passe, vérifiez son échéance et les passes suivantes. Voir [Le cache du poller](/fr/concepts/the-poller-cache/) pour les limites de reconstruction.

## Quand le pas est plus court que l'intervalle

Un pas plus court ne peut pas créer des mesures que le collecteur n'a jamais effectuées. Kadupul avertit lors de la construction du cache lorsque la collecte est trop lente pour le pas ; rectifiez les paramètres et reconstruisez le cache concerné.

Cette discordance ne produit pas nécessairement un graphique en peigne. RRDtool peut normaliser des mises à jour moins fréquentes dans des pas plus petits lorsque le heartbeat le permet, mais cela ne rétablit pas les détails de mesure manquants.

## Le heartbeat n'est pas toujours le double du pas

Le heartbeat est l'intervalle maximal autorisé entre les mises à jour avant qu'une entrée ne soit considérée comme inconnue. La création du RRD lit le heartbeat dans la définition du champ de source de données, qui peut hériter des paramètres du profil ou du modèle. Ce n'est pas un délai de grâce supplémentaire accordé au pas ; inspectez le champ et le fichier réels lorsqu'ils diffèrent du profil.

Les profils livrés ne suivent pas une règle unique.

| Profil | Pas | Heartbeat | Limite de l'intervalle de mise à jour |
|---|---|---|---|
| Cinq minutes | 300 | 600 | 10 minutes |
| Une minute | 60 | 600 | 10 minutes |
| Trente secondes | 30 | 1200 | 20 minutes |

Ce sont des valeurs de profils livrées, et non une minuterie de détection de panne. Des entrées explicitement inconnues peuvent créer des vides avant l'expiration du heartbeat ; la normalisation et les seuils d'archive influencent ce qui devient visible. Un heartbeat plus élevé tolère un écart plus long. S'il est égal ou inférieur à l'intervalle normal de mise à jour, il ne laisse aucune marge face aux retards.

Vérifiez le fichier réel ainsi que son profil. Les RRD existants peuvent différer des définitions de base modifiées ; l'audit de fichiers signale ces écarts. Consultez la [définition du heartbeat RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) et la [référence d'ajustement](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) avant d'engager des modifications.

## Ce qui est stocké ne correspond pas exactement à ce que l'appareil a transmis

RRDtool normalise les mises à jour sur des limites de pas fixes. Les valeurs situées entre les limites peuvent contribuer à plusieurs points de données primaires. Le heartbeat, les inconnues explicites et les bornes conditionnent la validité des entrées ; la consolidation d'archive applique son propre seuil de données inconnues. Un pas n'a pas besoin de contenir un échantillon brut distinct pour détenir une valeur connue.

Les valeurs de compteur deviennent des taux calculés sur le temps écoulé, sous réserve des réinitialisations de compteur, de la gestion des bouclages et des limites. Les jauges sont également normalisées dans le temps. Des pics brefs peuvent être atténués ou totalement omis par l'échantillonnage ; des valeurs stables ou alignées sur les limites ne sont pas nécessairement réduites. Les paramètres d'archive ne peuvent pas reconstituer des détails qui n'ont jamais été collectés ou qui ont été perdus lors de la normalisation.

## Quelle horloge décide

Pour la collecte ordinaire via `cmd.php`, l'instruction SQL `CURRENT_TIMESTAMP()` fournit l'horodatage de sortie lors de l'insertion d'un lot. Ce n'est pas un horodatage fourni par l'appareil ni une mesure exacte de l'instant où l'appareil a répondu. Les autres moteurs de collecte et les circuits en temps réel doivent être vérifiés séparément.

Le collecteur PHP met en mémoire tampon ses résultats et les écrit par lots, en vidant le tampon lors d'un changement d'appareil ou lorsqu'il est plein. L'horodatage est évalué une fois par lot, de sorte que chaque valeur d'un même lot porte exactement la même heure.

Les conséquences n'étant pas évidentes, il convient de les expliciter.

**L'horloge de l'appareil n'horodate pas ces échantillons SNMP.** Le collecteur utilise l'heure d'insertion dans la base de données. L'heure de l'appareil peut toujours importer pour un script ou pour l'interprétation d'une métrique particulière, ce qui ne constitue donc pas une raison d'ignorer la synchronisation d'horloge.

**Une horloge erronée sur un collecteur ou sa base de données décale les données.** Les valeurs sont inscrites dans les mauvais créneaux, et sur un fichier déjà partiellement écrit, une mise à jour dont l'heure n'est pas postérieure à la précédente est purement et simplement refusée. Si les horodatages reculent en deçà de la dernière mise à jour du fichier, les nouvelles données ne peuvent plus faire avancer le fichier tant que leur horodatage ne dépasse pas ce repère. Vérifiez l'horloge de la base de données, celle du collecteur et l'horodatage du fichier ; modifier l'horloge du collecteur ne change pas nécessairement les horodatages générés par la base de données.

**Le temps passé au sein d'un cycle devient de la gigue.** Un appareil interrogé vers la fin d'une longue session reçoit un horodatage plus tardif qu'un appareil interrogé au début, même s'ils appartiennent au même cycle. Sur un collecteur lourdement chargé, cette gigue peut représenter une fraction non négligeable de l'intervalle, et c'est l'une des façons dont un heartbeat trop proche du pas se met à créer des trous.

**Le fuseau horaire de la base de données se trouve au milieu de l'aller-retour.** L'horodatage est écrit sous forme d'horodatage de base de données et reconverti en heure absolue par la base de données lors de sa lecture. Une gestion incohérente du fuseau horaire de session peut modifier cette interprétation. Vérifiez les paramètres de session d'écriture et de lecture ainsi que la conversion d'époque ; modifier le fuseau horaire d'affichage ne prouve pas que l'historique stocké s'est déplacé.

## Les lectures sont rassemblées par horodatage

Une source de données comportant plusieurs champs, comme une interface avec octets entrants et octets sortants, peut faire appel à des tâches SNMP distinctes ou à un script renvoyant plusieurs valeurs nommées. Les champs analysés sont regroupés par source de données et horodatage en vue de la mise à jour RRD.

Un ensemble incomplet est retenu plutôt qu'écrit de manière partielle, jusqu'à ce que le nombre attendu de champs soit réuni. Il s'agit d'un contrôle d'assemblage et non d'une garantie de validité numérique ; des inconnues explicites peuvent toujours être écrites. Normalement, les deux moitiés se trouvent dans le même lot et partagent un horodatage, ce qui rend le mécanisme transparent. Les lots insérés au cours de la même seconde peuvent également concorder. Lorsque les champs reçoivent des horodatages différents, les groupes peuvent rester incomplets et ne produire aucune mise à jour. Le code actuel conserve les groupes incomplets d'un cycle à l'autre, puis consigne un avertissement et les supprime après `5 * max(60, poller_interval)` secondes. La limite de page de lecture est étendue pour inclure son dernier groupe d'horodatage.

Les mises à jour sont également triées par ordre chronologique ascendant avant d'être écrites, car un fichier n'accepte aucune valeur plus ancienne que sa dernière mise à jour.

## Les écritures différées conservent leurs horodatages

Lorsque les écritures RRD sont différées et appliquées en masse ultérieurement, l'horodatage enregistré accompagne la valeur et le lot est écrit dans l'ordre chronologique. Un horodatage de midi est conservé lorsqu'une mise à jour est tentée à treize heures ; il n'est pas remplacé par l'heure de vidage du tampon. RRDtool normalise toujours les mises à jour acceptées selon ses limites de pas.

Une file d'attente accumulée peut faire avancer un fichier grâce à des horodatages plus récents que sa dernière mise à jour. Elle ne peut en aucun cas combler rétroactivement des trous situés avant cet horodatage. Le module Boost filtre les échantillons antérieurs ou égaux à la dernière mise à jour du fichier ; une file vidée ne prouve pas que chaque échantillon a été appliqué. Voir [Écritures à volume élevé](/fr/concepts/high-volume-writes/) et la [référence des mises à jour RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Les écritures différées dépendent de la réussite du stockage et du respect de l'ordre temporel ; elles ne garantissent pas la récupération après chaque défaillance. Inspectez les éléments retenus et rejetés lorsqu'une file d'attente ne se résorbe pas.

## Quand le cycle ne se termine pas

Le collecteur PHP vérifie le temps d'exécution écoulé entre les tâches et met fin à sa boucle d'éléments dès qu'il dépasse l'intervalle d'interrogation, en consignant un avertissement. Il ne s'agit pas d'une interruption brutale à l'échéance exacte : une opération en cours peut déborder avant cette vérification. Les éléments non atteints ne produisent aucune valeur pour ce cycle. Une interruption entre des mises à jour valides peut être comblée si le heartbeat et les seuils d'archive le permettent. Des dépassements répétés doivent inciter à analyser la capacité, les délais d'attente et les erreurs de collecte, sans constituer la preuve que chaque vide a la même cause.

[Mettre le poller à l'échelle](/fr/guides/scale-the-poller/) explique comment y remédier. L'ordonnancement d'une exécution et les dispositifs anti-dépassement sont décrits dans [Cycle de vie du poller](/fr/reference/poller-lifecycle/).
