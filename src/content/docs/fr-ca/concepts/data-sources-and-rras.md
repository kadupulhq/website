---
title: Sources de données et archives round-robin
description: Ce qui est stocké, comment fonctionne la rétention et pourquoi les modifications de profil ne migrent pas les fichiers RRD existants.
sidebar:
  order: 2
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
---

Une source de données Kadupul regroupe des mesures au fil du temps et correspond normalement à un unique fichier RRD.
Chaque champ nommé à l'intérieur de ce fichier est également appelé source de données (DS) par RRDtool.
Distinguez l'objet applicatif de ses champs lors de la comparaison des totaux ou des paramètres.

Un fichier ne représente pas toujours un seul nombre. Une source de données peut contenir plusieurs champs,
et une interface réseau en est le cas ordinaire : les octets entrants et sortants partagent un même fichier,
sont collectés comme des tâches distinctes et sont écrits ensemble lors d'une seule mise à jour.
Ce qu'ils partagent est un pas (step), un ensemble d'archives et un destin commun. Vous ne pouvez pas conserver
l'un d'eux plus longtemps que l'autre, car la rétention est une propriété du fichier et non du champ individuel.

## Ce que contient le fichier

Un fichier RRD se compose d'un en-tête et de deux listes.

La première liste détaille les champs : un nom, un type, un heartbeat, ainsi qu'un minimum et un maximum pour chacun.
La seconde détaille les archives : une fonction de consolidation, le nombre de pas de données brutes formant
un intervalle (slot), le nombre d'intervalles disponibles et la proportion d'un intervalle pouvant être inconnue
avant que l'intervalle lui-même ne devienne inconnu.

La création enregistre ces définitions dans le fichier. Les métadonnées de la base de données et les définitions
réelles du fichier peuvent diverger par la suite ; examinez le fichier avec `rrdtool info` plutôt que de supposer
que le modèle actuel le décrit exactement.

<span id="the-decisions-that-are-permanent"></span>

## Décisions de création et maintenance ultérieure

Un fichier RRD est alloué au moment de sa création. Les modifications de profil ne migrent pas les fichiers existants.
RRDtool propose des opérations d'ajustement et de redimensionnement qui peuvent préserver les données stockées,
mais elles nécessitent une validation et des sauvegardes préalables. Le chemin de création standard vérifie si le fichier
existe déjà et s'interrompt sans le remplacer. Cette protection n'interdit pas l'ajustement ou la migration explicites.
L'enregistrement d'un modèle ne modifie pas à lui seul la structure des fichiers existants.

Quatre choix sont scellés à cet instant :

**Le pas (step).** La fréquence à laquelle une valeur est attendue, généralement 300 secondes. RRDtool normalise
les mises à jour sur les limites de pas ; les lectures plus fréquentes ne sont pas simplement ignorées. Le fait
que des mises à jour plus lentes produisent des données inconnues (unknown) dépend des règles de heartbeat
et de consolidation. Le pas provient normalement du profil de la source de données. La création du fichier lit
le pas stocké de la source de données et les archives du profil référencé ; vérifiez donc les deux lors
de la modification des métadonnées ou de la planification d'une migration.

**Le type de source de données.** Voir ci-dessous. C'est le paramètre dont l'erreur passe inaperçue.

**Les limites.** Un minimum et un maximum délimitent les valeurs acceptables ; pour les types produisant un débit,
ces limites s'appliquent au taux calculé et non au total brut du compteur. Les données hors limites deviennent
inconnues (unknown) au lieu d'être écrêtées. Les maxima basés sur des requêtes peuvent résoudre les variables
de vitesse d'interface ; toute source d'interface ne reçoit pas automatiquement une limite correcte de vitesse de lien.
Vérifiez les unités du modèle et la définition réelle du fichier.

La création comporte des règles spécifiques de normalisation. Pour un maximum textuel inférieur ou égal au minimum,
GAUGE et ABSOLUTE utilisent un maximum non défini ; les autres types utilisent le minimum plus un. Les substitutions
de requêtes suivent une autre branche. Une vérification zéro/zéro ultérieure ne modifie que le maximum, et une
normalisation antérieure a pu déjà le modifier. Ne considérez pas cela comme un validateur universel et ne supposez
pas que les deux bornes deviendront indéfinies.

**Les archives.** Combien d'échantillons conserver à quelles résolutions, et quelle fonction de consolidation utiliser
pour chacune. C'est ce qui détermine si vous pourrez répondre à une question dans deux ans.

## Types de sources de données

| Type | Donnée stockée | Cas d'usage |
|---|---|---|
| `GAUGE` | Une valeur instantanée, normalisée sur le pas du fichier | Température, charge système moyenne, mémoire utilisée, longueur de file |
| `COUNTER` | Taux de variation par seconde, avec correction du bouclage à 32 ou 64 bits | Octets d'interface, compteurs de paquets et d'erreurs |
| `DERIVE` | Taux de variation par seconde, pouvant être négatif | Compteur pouvant légitimement baisser ou être réinitialisé |
| `ABSOLUTE` | Valeur brute transmise, divisée par le temps écoulé depuis la dernière mesure | Compteur réinitialisé par le périphérique à chaque lecture |
| `COMPUTE` | Valeur calculée à partir d'autres champs du même fichier plutôt que collectée | Champ dérivé, tel qu'un total ou un ratio |

Kadupul propose `DCOUNTER` et `DDERIVE` lorsque la version configurée de RRDtool est 1.5 ou supérieure.
Ils acceptent les compteurs à virgule flottante ; DCOUNTER détecte également le sens de comptage et les remises à zéro,
ce n'est donc pas un simple COUNTER avec décimales. Le tableau décrit la sémantique de RRDtool et ne garantit pas
que chaque type soit supporté par tous les éditeurs ou assistants de création de Kadupul ; validez la définition
générée, en particulier pour les expressions COMPUTE. Consultez la documentation officielle
[RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Les erreurs de sélection du type

Ces exemples illustrent des erreurs courantes ; leur impact dépend des données et des limites fixées.

`GAUGE` sur un compteur croissant affiche la valeur cumulée au lieu du débit. La valeur augmente jusqu'au
bouclage ou à la remise à zéro ; cela peut se remarquer, mais sur une courte période d'observation, cela
ne semble pas nécessairement erroné.

`COUNTER` interprète les diminutions au moyen de la correction de bouclage, transformant ainsi une réinitialisation
en un pic positif colossal ou provoquant son rejet par la valeur maximale. `DERIVE` avec un minimum fixé à zéro
rejette les taux négatifs, y compris les réels bouclages de compteurs ; choisissez-le uniquement si ce compromis
convient à la métrique. Une valeur maximale ne permet pas de distinguer chaque réinitialisation d'un bouclage légitime.

`COUNTER` sur une jauge instantanée (gauge) constitue le piège le plus critique. La valeur enregistrée devient
la variation de niveau divisée par le temps écoulé. Un appareil dont la température reste stable à 40 degrés
enregistre zéro. Une hausse d'un degré en cinq minutes enregistre 0,0033. Le graphique peut sembler crédible
tout en mesurant une variation au lieu d'une température. Ce taux n'est utile que s'il correspond à la grandeur
recherchée ; il ne représente en rien la température réelle.

`ABSOLUTE` sur un compteur qui ne se réinitialise pas à la lecture produit la même défaillance silencieuse
dans l'autre sens, générant des valeurs qui augmentent proportionnellement au temps de fonctionnement de l'appareil.

La règle d'or consiste à choisir le type d'après la manière dont l'appareil génère le chiffre, et non d'après
sa signification métier. Le fait qu'une mesure soit un taux est une propriété du compteur, non de la métrique.

## Le heartbeat

Le heartbeat est le délai maximal autorisé entre deux mises à jour d'un champ avant que RRDtool ne considère
l'intervalle comme inconnu. Il est mesuré entre deux mises à jour consécutives, et non comme un délai tampon
ajouté après le pas.

Consultez le profil configuré et le fichier réel. Le profil standard de cinq minutes utilise un heartbeat de 600 secondes,
le profil d'une minute utilise également 600 secondes, et le profil de trente secondes utilise 1 200 secondes.
La tolérance aux interrogations manquées ne peut donc pas se résumer à un facteur multiplicateur unique ;
la normalisation et la consolidation influent également sur les intervalles de graphique déclarés inconnus.

Le heartbeat s'applique par champ et non par fichier. Les valeurs du profil renseignent les métadonnées, mais la création
du fichier lit le heartbeat local de l'élément, qui peut différer du profil. Les profils fournis n'utilisent pas
un ratio uniforme. Les explications détaillées et les conséquences d'un heartbeat trop proche du pas sont abordées dans
[Temps et intervalles](/fr-ca/concepts/time-and-intervals/).

## Consolidation

À mesure que les mises à jour arrivent, RRDtool les consolide également dans des plages temporelles plus larges ;
il n'attend pas que l'archive la plus fine expire. La fonction est choisie pour chaque archive, et chacune répond
à un besoin distinct :

- `AVERAGE` calcule la moyenne des points de données primaires participants.
- `MAX` conserve leur valeur maximale.
- `MIN` conserve leur valeur minimale.
- `LAST` conserve leur dernière valeur selon les règles de consolidation de RRDtool.

Ces fonctions opèrent sur des points de données primaires normalisés, et non nécessairement sur les relevés bruts initiaux.
Une archive MAX ne peut pas restituer un pic instantané déjà moyenné au sein d'un intervalle primaire ; MIN ne constitue
pas un indicateur infaillible pour chaque coupure de service.

Un fichier conserve une archive par fonction et par résolution. Stocker les quatre fonctions sur quatre résolutions
représente donc seize archives et un volume utile quatre fois supérieur à celui des seules moyennes pour un nombre
de lignes identique. L'en-tête et les structures préparatoires consomment également de l'espace. Les trois profils
fournis sélectionnent quatre fonctions ; définissez la rétention d'après vos besoins d'analyse et les capacités de stockage.

Si vous ne conservez que les moyennes, vous ne pourrez plus jamais interroger les valeurs maximales : les pics n'ont jamais
été enregistrés. C'est le regret le plus fréquent sur les installations historiques, et il ne peut être corrigé rétroactivement.

Certaines routines de tracé remplacent une fonction manquante par une fonction disponible ; d'autres peuvent échouer.
Vérifiez l'instruction DEF générée et les archives réelles comme expliqué dans
[Comment les graphiques sont dessinés](/fr-ca/concepts/how-graphs-are-drawn/).

## L'inconnu est une valeur réelle

Un RRD distingue rigoureusement le zéro de l'inconnu (unknown). Zéro peut correspondre à un niveau mesuré ou à un taux
calculé, comme un compteur stationnaire. La valeur inconnue peut résulter de mises à jour manquantes, d'un dépassement
de heartbeat, d'une valeur explicitement inconnue, d'un rejet par les limites ou de données de consolidation insuffisantes.
Remplacer l'inconnu par zéro fait passer des mesures manquantes ou invalides pour une inactivité normale.

La valeur inconnue se propage lors de la consolidation selon un seuil paramétré par archive. Les profils standard
le fixent à la moitié : un intervalle consolidé constitué de données partiellement manquantes reste un nombre réel tant
que plus de la moitié de ses entrées ne sont pas inconnues, seuil au-delà duquel l'intervalle entier devient inconnu.
La visibilité dépend de l'alignement des intervalles, du heartbeat, de la normalisation, de la consolidation et du rendu.
Aucune durée de panne universelle ne garantit qu'une coupure apparaîtra ou disparaîtra dans toutes les archives.

L'inconnu est également ce que produisent les limites. Une mesure dépassant le maximum configuré n'est pas plafonnée.
Une remise à zéro de compteur peut produire un taux hors limites et créer un trou, mais les limites n'interceptent pas
toutes les réinitialisations. Une donnée inconnue ne suffit pas à identifier l'anomalie ; comparez les erreurs de collecte
et les horodatages.

## Dimensionnement

Pour une structure inchangée, le volume utile des archives correspond au total des intervalles de toutes les archives,
multiplié par le nombre de champs, multiplié par huit octets. La taille totale du fichier et du déploiement inclut
également les en-têtes, les états préparatoires, l'allocation du système de fichiers, les files d'attente et les sauvegardes.
Une modification explicite de la structure peut changer la taille des fichiers.

Les trois profils fournis présentent des écarts plus prononcés que leurs noms ne l'indiquent :

| Profil | Pas | Intervalles par champ | Volume utile par champ | Coût relatif |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11 488 | environ 90 Kio | 1 |
| 30 Second Collection | 30 s | 40 284 | environ 315 Kio | 3,5 |
| 1 Minute Collection | 60 s | 81 716 | environ 640 Kio | 7 |

Une source de données d'interface à deux champs double chacune de ces valeurs. Dix mille interfaces associées au profil
de cinq minutes occupent environ 1,8 Go de données d'archives. Ces mêmes dix mille interfaces sur le profil d'une minute
avoisinent 13 Go, et la raison ne tient pas seulement au pas : ce profil conserve également une archive mensuelle bien plus
profonde et une archive annuelle s'étendant sur dix ans.

La période couverte par chaque archive mérite d'être confrontée à son intitulé. Les archives du profil de cinq minutes
sont nommées Daily, Weekly, Monthly et Yearly ; les durées réelles qu'elles conservent sont de 50 heures, 14,6 jours,
64,6 jours et 2,2 ans. Ces libellés désignent le préréglage de graphique pour lequel l'archive a été dimensionnée,
non la durée de rétention. Si vous devez analyser le mois d'avril dernier avec une précision de cinq minutes,
le libellé vous laissera croire que c'est possible, mais l'archive ne contiendra plus ces données.

La charge d'écriture varie également avec le profil, et ses exigences se manifestent bien avant la saturation du disque.
À plein régime de collecte, un pas de trente secondes génère dix fois plus d'échantillons qu'un pas de cinq minutes.
Le regroupement par lots, les champs mutualisés, la sélection des tâches à traiter et les réessais infructueux modifient
le nombre de commandes et d'écritures disques physiques ; ils ne répondent pas à un ratio invariable. Consultez
[Écritures à volume élevé](/fr-ca/concepts/high-volume-writes/).

## Quels champs atteignent le fichier

Une source de données générée à partir d'un modèle de données ne reçoit un champ dans le fichier que pour les champs
référencés par un élément de graphique lors du processus normal de création. Le code de mise à jour peut écarter
les champs de modèle non référencés ; leur collecte effective dépend de la méthode d'entrée et du cache, et non
de la seule visibilité d'une courbe. Une source de données sans modèle reçoit l'ensemble des champs, partant du principe
qu'aucun graphique n'existe encore pour filtrer la sélection.

Une référence n'a pas nécessairement besoin de tracer une ligne visible : examinez les correspondances d'éléments de graphique,
le cache et la définition du fichier. Ajouter un champ dans un modèle ne garantit pas à lui seul que la collecte,
l'association graphique et le stockage soient opérationnels. La reconstruction du cache actualise les métadonnées
de collecte ; elle n'insère aucun champ dans un fichier RRD existant.

Cela signifie également que l'ajout d'un champ à un modèle ne l'intègre pas d'office aux fichiers déjà créés, même une fois
référencé par un graphique. L'ajout d'un champ requiert une maintenance explicite ou une migration. Selon la version
de RRDtool installée, une opération d'ajustement peut insérer des sources de données en conservant l'historique ;
la suppression et la recréation d'un fichier anéantissent l'historique. Consultez
[Gérer la rétention des données](/fr-ca/guides/manage-data-retention/) pour découvrir les procédures et vérifications.
