---
title: Comment les graphiques sont dessinés
description: Le cheminement depuis un fichier round-robin jusqu'à l'image finale, et pourquoi les mêmes chiffres stockés peuvent produire des visuels très différents.
sidebar:
  order: 4
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
---

Une requête d'image standard peut assembler une commande RRDtool à partir de la configuration du graphique et lire les fichiers RRD référencés. Une image valide en cache peut également répondre à la requête, et le traitement Boost à la demande peut mettre à jour les fichiers avant le rendu. Voir [Écritures à volume élevé](/fr/concepts/high-volume-writes/) pour les limites de fraîcheur des données.

## L'ordre des opérations

Pour une requête qui procède à la génération de commandes :

1. Déterminer la fenêtre temporelle demandée et la configuration du graphique.
2. Estimer la résolution à partir des profils de la base de données et sélectionner les fonctions de consolidation.
3. Émettre les références `DEF` dédupliquées pour les champs et fonctions requis.
4. Émettre les expressions `CDEF` et `VDEF` référencées.
5. Émettre les éléments de dessin et d'impression dans la séquence configurée, avec les options applicables et les modifications des plugins.
6. Laisser RRDtool lire les fichiers réels et restituer le résultat.

## Choisir une archive

Kadupul consulte les lignes de profil en base de données lors du calcul des plages d'archives et des options de graphique. Son estimation automatique prend en compte la durée du pas multipliée par les pas et les lignes, la couverture demandée et le nombre de pas de l'archive ; la sélection explicite de l'archive suit un chemin distinct. Ces calculs de profil n'examinent pas chaque archive physique dans chaque fichier et peuvent être en désaccord avec les fichiers existants après une modification de profil.

La commande `DEF` générée spécifie le fichier, le nom de la source de données et la fonction de consolidation. RRDtool choisit une archive disponible à une résolution appropriée et peut consolider davantage les données pour la largeur du graphique et la fenêtre de temps. L'estimation de l'application ne garantit pas la lecture d'une archive physique spécifique. Voir la [documentation des définitions de données RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Élargir une fenêtre temporelle ou modifier la largeur de l'image peut changer la résolution affichée. Une série plus grossière basée sur des moyennes peut dissimuler un pic bref même si une archive plus fine le conserve. Comparez la disposition réelle du fichier et la commande exécutée, pas uniquement le profil. Voir [Sources de données et archives round-robin](/fr/concepts/data-sources-and-rras/).

Lorsque l'appelant n'indique pas d'heure de fin, le moteur de rendu normal utilise initialement le décalage de la dernière exécution du poller principal par rapport à maintenant, en se rabattant sur l'intervalle d'interrogation si cette valeur est absente ou située dans le futur. Le code ultérieur dispose également d'un repli sur intervalle consolidé, mais ce n'est pas une règle universelle. Une heure de fin explicite remplace cette initialisation ; un graphique se terminant avant maintenant ne prouve pas quelle archive a été retenue ni que les derniers échantillons ont été écrits.

## Les éléments

Un graphique est une liste ordonnée d'éléments. La génération de commandes peut omettre des éléments, réutiliser des définitions ou développer un élément en plusieurs instructions. L'ordre de dessin compte pour bien plus que la simple disposition visuelle.

| Élément | Dessine | Remarques |
|---|---|---|
| `AREA` | Zone pleine depuis l'axe jusqu'à la valeur | Les zones suivantes recouvrent les précédentes |
| `STACK` | Zone pleine commençant au sommet de l'élément précédent | Émise sous forme de zone avec un indicateur d'empilement |
| `LINE1`, `LINE2`, `LINE3` | Une ligne d'un, deux ou trois pixels de large | Peut être en pointillés |
| `LINE:STACK` | Une ligne tracée au-dessus du total cumulé | |
| `TICK` | Repères le long d'un bord du tracé | Utile pour l'état, non pour la magnitude |
| `GPRINT` | Rien. Imprime un chiffre dans la légende | |
| `COMMENT` | Rien. Imprime du texte brut dans la légende | Les longs commentaires reviennent à la ligne |
| `HRULE` | Une ligne horizontale à une valeur fixe | |
| `VRULE` | Une ligne verticale à un instant précis | |
| `TEXTALIGN` | Rien. Définit l'alignement pour le texte de légende suivant | |

La liste complète, précisant quelles colonnes de configuration s'appliquent à chaque type, se trouve dans [Éléments de graphique](/fr/reference/graph-items/).

`AREA` et `STACK` forment la paire sur laquelle portent la plupart des erreurs. Une zone démarre à zéro, de sorte que deux zones se chevauchent et que la plus haute masque la plus basse. Un empilement commence là où l'élément précédent s'arrête, de sorte que la hauteur visible de la deuxième bande correspond à sa propre valeur, mais que son bord supérieur marque le total. Interprétez un graphique empilé comme une hauteur de bande et non comme une position sur l'axe Y, sous peine de mal interpréter chaque série à l'exception de la première.

`HRULE` accepte une valeur qui peut contenir des substitutions de modèles. Les caractères non numériques sont retirés du résultat et, si rien de numérique ne subsiste, la ligne est tracée à zéro plutôt que d'interrompre le rendu. Une ligne située à zéro peut être intentionnelle ou résulter d'une substitution erronée. Examinez la commande résolue avant de conclure. Le filtre numérique peut également altérer une chaîne comportant des unités ou une notation numérique non reconnue.

`VRULE` accepte soit un horodatage Unix, soit une paire `hours:minutes`. Une valeur d'heures négative est interprétée comme un décalage rétroactif par rapport à maintenant plutôt que comme une heure fixe.

## Deux fonctions, un seul mot

L'expression fonction de consolidation sert à deux fins bien distinctes, et les quatre mêmes noms, `AVERAGE`, `MIN`, `MAX` et `LAST`, apparaissent aux deux endroits.

La première fonction concerne la sélection de l'archive. Une directive `DEF` nomme un fichier, une source de données au sein de celui-ci et une fonction de consolidation. Cette fonction restreint la famille d'archives demandée. Si vous demandez `MAX`, RRDtool a besoin de données consolidées correspondantes, sous réserve du mécanisme de repli décrit plus bas et du choix de la résolution.

La seconde fonction concerne l'arithmétique de la légende. Une directive `GPRINT` réduit toute la fenêtre dessinée à un seul nombre imprimé, et sa fonction détermine la méthode de calcul. Cette réduction s'opère sur la série déjà extraite ; il s'agit d'une agrégation d'affichage, non d'un stockage.

Ainsi, un `GPRINT` affichant `MAX` sur une définition `DEF` lue avec `AVERAGE` imprimera la valeur la plus élevée de cette série de moyennes sur la fenêtre rendue, et pas obligatoirement le pic brut le plus haut. Cinq minutes n'est qu'un exemple ; la résolution effective varie. Ce sont des nombres différents, et sur un lien saturé, ce sont des valeurs très disparates. Les deux lectures sont légitimes. Une seule correspond probablement à votre intention.

## Le repli silencieux

Pour les types d'éléments faisant appel à l'assistant de sélection optimale, Kadupul lit les fonctions de consolidation du fichier et emploie celle qui est demandée si elle est présente, ou à défaut la première répertoriée. Si aucune n'est obtenue pour une source de données locale valide, l'assistant se replie sur AVERAGE. Les variantes fixes de GPRINT empruntent un chemin distinct et n'utilisent pas cet assistant, ce qui ne constitue pas une garantie absolue que chaque fonction manquante soit rétablie.

Un élément de dessin demandant `MAX` peut donc se retrouver à lire des moyennes si son fichier ne contient que des archives AVERAGE. Examinez la commande `DEF` générée et l'output de `rrdtool info`. La maintenance d'archives peut modifier l'agencement existant, mais ajouter une archive ne permet pas de reconstituer des pics historiques éliminés lors d'un calcul de moyenne antérieur. Voir [Gérer la rétention des données](/fr/guides/manage-data-retention/).

## GPRINT emprunte l'archive de son voisin

Un élément `GPRINT` ordinaire ne dispose d'aucune archive propre. Il réutilise la fonction de consolidation de l'élément `AREA`, `STACK`, ligne ou `TICK` correspondant le plus récent, associé par nom de source de données et identifiant local de modèle. En l'absence de correspondance préalable, il utilise l'assistant de sélection optimale avec sa propre fonction configurée. Les variantes fixes exploitent directement leur propre fonction configurée.

Cela signifie que modifier l'ordre des éléments dans un modèle de graphique peut changer ce qu'affiche une légende sans que personne n'y touche. Placez une `LINE` lisant `MAX` au-dessus du bloc `GPRINT` et les légendes correspondantes récapituleront les maxima. Déplacez-la plus bas et l'élément correspondant précédent, ou le repli par défaut, déterminera la série d'entrée. Si un chiffre en légende change après une modification sans rapport dans le modèle, vérifiez d'abord l'ordre des éléments.

## CDEF et VDEF

Tous deux transforment les données avant qu'elles ne soient tracées. Ils ne sont pas interchangeables.

| | CDEF | VDEF |
|---|---|---|
| Produit | Une série temporelle, une valeur par créneau | Une valeur scalaire et, pour certaines fonctions, une heure associée |
| Dessinable en ligne ou en zone | Oui | Un scalaire peut fournir un niveau constant |
| Construit à partir de | Fonctions, opérateurs arithmétiques, autres CDEF, sources spéciales, littéraux | Une seule fonction appliquée à une seule référence |
| Imbrication | Un CDEF peut référencer un autre CDEF | Un VDEF ne peut pas contenir d'opérations arithmétiques |

Un CDEF est une expression sur pile évaluée en notation polonaise inverse. Le vocabulaire est très étendu et figure en totalité dans [Éléments de graphique](/fr/reference/graph-items/) : arithmétique, opérateurs de comparaison et conditionnels, trigonométrie, agrégation entre sources, manipulations de pile et fonctions temporelles permettant à une définition de situer sa position sur l'axe X. `UN` et `UNKN` méritent d'être appris rapidement. Remplacer les valeurs inconnues par zéro permet d'éviter les coupures graphiques tout en masquant les mesures manquantes ; rendez ce choix de présentation explicite.

Les CDEF lisent également des références spéciales plutôt qu'un nom de source fixe. L'une d'elles correspond à la source de données de l'élément courant, ce qui rend un même CDEF réutilisable sur tous les éléments d'un modèle. D'autres correspondent à toutes les sources du graphique, ou à toutes les sources similaires, ce qui permet de tracer une ligne totale sans nommer explicitement ses composantes.

Un VDEF réduit une série à un scalaire : maximum, minimum, moyenne, écart-type, premier, dernier, total, un percentile ou la pente, l'ordonnée à l'origine et la corrélation d'une régression linéaire. RRDtool ne gère pas l'arithmétique au sein d'un VDEF, de sorte que lorsqu'un VDEF requiert une entrée calculée, Kadupul l'établit sur le CDEF de l'élément plutôt que sur la source brute. C'est la démarche préconisée : effectuez les calculs dans un CDEF, puis réduisez le résultat dans un VDEF.

Un `GPRINT` adossé à un VDEF ne prend aucun argument de fonction de consolidation : le VDEF a déjà fourni la réduction requise. Les VDEF peuvent également fournir des valeurs scalaires pour le tracé ; RRDtool prend en charge les lignes basées sur un VDEF. Voir la [documentation des éléments graphiques](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

L'export CSV sélectionne les types de tracés pris en charge sous forme de colonnes de séries ; les éléments de légende ne sont pas exportés sous forme de colonnes équivalentes. Contrairement à une description antérieure, le code actuel n'ignore pas systématiquement les éléments de tracé reposant sur un VDEF. Il peut émettre une directive `XPORT` non valide pour un VDEF scalaire : un test isolé de RRDtool affiche une ligne VDEF avec succès mais rejette cet export. Voir l'[anomalie logicielle #273](https://github.com/kadupulhq/kadupul/issues/273). Utilisez des éléments de tracé adossés à des séries pour l'export et vérifiez les colonnes produites.

## Pourquoi les mêmes données semblent différentes

Chacun des choix ci-dessous modifie l'image sans altérer un seul échantillon stocké.

| Choix | Effet |
|---|---|
| Largeur de fenêtre et largeur d'image | Peut modifier le choix de l'archive et la consolidation additionnelle |
| Fonction de consolidation sur le `DEF` | Lit les crêtes, les creux, les moyennes ou les dernières valeurs |
| Absence d'une fonction de consolidation | Certains parcours substituent une autre fonction ; d'autres échouent |
| `AREA` par rapport à `STACK` | Hauteurs absolues par rapport à hauteurs cumulées |
| Ordre des éléments | Superposition, ordre de pile et archive empruntée par un `GPRINT` |
| Base 1000 ou 1024 | Modifie l'échelle de l'axe. Les valeurs sont rigoureusement identiques |
| Mode d'échelle automatique, limites strictes, échelle logarithmique | Modifie l'axe Y, ce qui altère la perception visuelle des variations |

Lorsque des graphiques divergent, comparez les commandes générées, l'identité et la structure des fichiers, l'état du cache et la fraîcheur des échantillons. Ces paramètres de présentation constituent des vérifications utiles, sans exclure des anomalies de collecte, de stockage ou de correspondance. Pour un guide pratique d'investigation, voir [Résoudre les problèmes de données manquantes](/fr/guides/troubleshoot-missing-data/).
