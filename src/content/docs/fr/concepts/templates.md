---
title: Modèles
description: Comment une définition unique gère une centaine d'appareils, et ce qui se produit lorsque vous la modifiez.
sidebar:
  order: 3
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
---

Les modèles existent afin que l'ajout du centième commutateur coûte le même effort que l'ajout du deuxième. Il en existe quatre types, et ils s'empilent.

Pour une séquence pratique, suivez [Utiliser et valider les modèles](/fr/guides/template-workflow/).

Les **modèles de données** définissent ce qu'il faut collecter et comment le stocker : les champs, leurs types, leurs limites, le profil de stockage et la méthode d'entrée qui extrait les valeurs. Les champs par objet et les fichiers RRD existants peuvent différer du modèle actuel ; le modèle ne constitue pas une preuve de la structure du fichier.

Les **modèles de graphique** définissent la restitution visuelle : quels éléments, dans quel ordre, quelles couleurs, quelles lignes de légende et ce qu'indique l'axe.

Les **modèles d'appareil** regroupent les requêtes de données et les modèles de graphique adaptés à une classe de matériel, de sorte que le choix du bon modèle lors de l'ajout d'un appareil effectue l'essentiel du travail.

Les **requêtes de données** traitent le cas où vous ne connaissez pas à l'avance le nombre d'éléments présents. Un commutateur possède un certain nombre de ports, découverts en parcourant l'appareil, et une requête de données enregistre des résultats indexés pour la création de graphiques. La découverte seule ne crée pas un nombre fixe de graphiques ou de sources de données.

## Comment ils s'empilent

Les quatre types ne constituent pas quatre couches d'une même chose. Chacun désigne le suivant dans la hiérarchie.

| Type | Pointe vers | Produit |
|---|---|---|
| Modèle d'appareil | Modèles de graphique et requêtes de données | Rien directement. C'est une liste de propositions pour un appareil |
| Requête de données | Définitions de graphiques et correspondances pour résultats indexés | Lignes découvertes ; la création de graphiques peut créer ou réutiliser des sources de données |
| Modèle de graphique | Champs de modèle de données lorsqu'un élément requiert des données | Un graphique pouvant référencer plusieurs sources de données |
| Modèle de données | Une méthode d'entrée et un profil de stockage | Métadonnées de source de données ; un fichier RRD est créé lorsque le chemin d'écriture l'exige |

Les éléments de modèle portant des données font référence aux champs du modèle ; les éléments instanciés sont associés aux champs locaux. Les éléments de texte et de constante n'ont pas besoin de référence à une source de données. La création du graphique résout ces correspondances, et un changement ultérieur de modèle ou d'élément peut également les modifier. La création de graphiques peut réutiliser des sources de données compatibles au lieu de créer un nouveau fichier pour chaque graphique.

## Issu du modèle ou propre à l'objet

De nombreux champs au niveau du graphique et de la source de données possèdent des indicateurs correspondants sur la ligne du modèle. Pour ces champs, l'indicateur régit la propagation normale vers les éléments enfants liés. D'autres champs, éléments de graphique et correspondances d'entrée suivent des règles de propagation distinctes.

| Indicateur | Signification | Lors de l'enregistrement |
|---|---|---|
| Désactivé | Le champ est régi par le modèle | Écrit sur chaque enfant, écrasant toute valeur préexistante |
| Activé | Le champ est propre à l'objet | Laissé intact sur chaque enfant |

L'indicateur s'applique champ par champ. Un modèle de graphique peut propager son étiquette d'axe aux graphiques liés tout en laissant le titre et la limite verticale à la discrétion de leur créateur. Cette combinaison constitue la règle normale, non une exception.

Deux propriétés de cette conception provoquent fréquemment des erreurs.

L'indicateur réside sur le modèle et décide uniquement de ce que fera le prochain enregistrement. Marquer un champ comme propre à l'objet après qu'une propagation l'a déjà écrasé ne restaure rien. Les anciennes valeurs personnalisées sont perdues ; l'indicateur ne protège que les valeurs futures.

L'inverse est encore plus critique. Désactiver l'indicateur sur un champ resté propre à l'objet pendant des années permet à un seul enregistrement d'écraser ce champ sur chaque enfant simultanément avec la valeur du modèle, souvent une valeur fictive jamais vérifiée.

### Tous les champs ne possèdent pas d'indicateur

Un champ ne participe à ce mécanisme que si un indicateur existe pour lui. Au niveau de la source de données, quatre en possèdent un et deux en sont délibérément dépourvus.

| Champ | Indicateur | Comportement |
|---|---|---|
| Nom | Oui | Issu du modèle ou propre à l'objet |
| Actif | Oui | Issu du modèle ou propre à l'objet |
| Pas | Oui | Issu du modèle ou propre à l'objet |
| Profil de stockage | Oui | Issu du modèle ou propre à l'objet |
| Méthode d'entrée | Non, toujours régi par le modèle | La routine d'enregistrement du modèle met à jour explicitement les lignes associées |
| Chemin vers le fichier RRD | Non, jamais régi par le modèle | Les propagations normales l'excluent ; la réapplication du modèle préserve le chemin existant |

La préservation du chemin protège l'association historique existante lors des modifications habituelles de modèles. Cela ne signifie pas que les chemins ne peuvent pas être modifiés ou déplacés par d'autres opérations administratives. Vérifiez l'identité des fichiers avant toute modification.

Les champs d'un élément de source de données comportent tous un indicateur : nom du champ, type, heartbeat, minimum, maximum et champ d'entrée qui l'alimente.

## Les entrées de graphique agissent en sens inverse

Un modèle de graphique peut déclarer une entrée nommée qui relie plusieurs éléments de graphique à un seul champ modifiable, de sorte que la modification d'une seule valeur sur un graphique mette à jour chaque élément qui la partage. C'est le mécanisme par lequel un seul paramètre de couleur ou de légende contrôle un ensemble d'éléments associés.

La valeur propagée n'est pas celle du modèle. Elle extrait la valeur courante des autres éléments appartenant à l'entrée et la transmet. Une entrée de graphique se diffuse donc latéralement parmi les éléments propres au graphique plutôt que de haut en bas depuis le modèle, c'est pourquoi la modification d'une entrée peut modifier un graphique auquel le modèle n'a pas touché directement.

## Ce qui se propage et quand

| Modification | Atteint les objets existants | Comment |
|---|---|---|
| Champ de modèle de graphique, issu du modèle | Oui, à l'enregistrement | Écrit sur chaque graphique issu de ce modèle |
| Champ de modèle de graphique, propre à l'objet | Non | L'objet enfant conserve sa propre valeur |
| Apparence de l'élément de graphique | Oui, à l'enregistrement | Couleur, transparence, type d'élément, épaisseur de trait, tirets, CDEF, VDEF, décalage, fonction de consolidation, alignement, texte et format de légende |
| Élément ajouté, supprimé ou réassocié à un autre champ | Selon l'opération | Correspondance, ajout, suppression et réassociation empruntent des chemins différents ; vérifiez les correspondances locales résultantes |
| Champ de modèle de données, issu du modèle | Oui, à l'enregistrement | Écrit sur chaque source de données issue de ce modèle |
| Valeurs des champs d'entrée du modèle de données | Si issues du modèle | Les indicateurs du modèle et de l'enfant, les champs d'index et les règles d'hôte limitent la propagation |
| Profil de stockage, pas, archives du modèle de données | Base de données seulement | Les fichiers existants conservent la structure avec laquelle ils ont été créés |
| Champs ajoutés à un modèle de données | Base de données seulement | Les fichiers existants ne disposent d'aucun emplacement pour les accueillir |
| Contenu du modèle d'appareil | Synchronisation distincte | Modifier les associations ne synchronise pas directement chaque appareil existant |

La propagation dans la base de données dépend du circuit d'enregistrement et des règles de surcharge. La mise à jour des métadonnées du modèle ne migre pas d'elle-même les fichiers RRD existants ; la maintenance des fichiers est une opération séparée. Certains paramètres structurels sont en lecture seule dans l'éditeur de modèle de données actif. Voir [Créer des modèles personnalisés](/fr/guides/create-custom-templates/).

## Les modèles d'appareil possèdent une procédure de synchronisation explicite

Modifier les associations d'un modèle d'appareil change l'offre pour les nouveaux appareils. Les appareils existants utilisent une opération distincte de réapplication ou de synchronisation. L'outil de traitement par lot sélectionne par défaut les appareils à l'état Up ou Recovering, à moins que l'appelant n'inclue les appareils inactifs ; vérifiez la sélection avant de lancer l'opération.

La synchronisation ajoute les associations de modèles de graphique manquantes, actualise les requêtes de données sélectionnées et peut supprimer les associations devenues inutiles. Elle ne supprime pas directement les graphiques existants simplement parce que leur modèle a été retiré du modèle d'appareil. Elle invoque également les points d'ancrage d'automatisation et de plugins, et peut déclencher l'automatisation configurée des graphiques.

Examinez les associations et les graphiques de l'appareil après la synchronisation. Ils ne constituent pas nécessairement l'union permanente de chaque version de modèle appliquée au fil du temps.

## Les index et les raisons du déplacement des ports

Une requête de données doit déterminer quel élément découvert correspond à une source de données existante précise. C'est le rôle de l'index. Les index numériques peuvent changer après des modifications matérielles ou de configuration. Un champ stable approprié aide à préserver l'identité, mais les noms d'interfaces peuvent également être renommés ou réutilisés. Vérifiez l'unicité, la persistance et le comportement de réindexation sur l'appareil réel ; aucun nom de champ ne garantit à lui seul la continuité.

Cette décision paraît anodine lors de sa prise et s'avère coûteuse en cas d'erreur. Elle est prise pour chaque appareil à chaque exécution et non une fois pour toutes pour la requête, de sorte que deux commutateurs identiques peuvent être indexés sur des champs différents. La sélection du champ, les conséquences de la disparition d'un index et les coûts de détection d'une renumérotation sont détaillés dans [Requêtes de données et index](/fr/concepts/data-queries-and-indexes/).

## Modifier un modèle ultérieurement

Les modifications apportées aux graphiques affectent les rendus ultérieurs une fois l'enregistrement et la propagation achevés. Les surcharges et la mise en cache des images peuvent modifier ce que voit l'utilisateur, ne supposez donc pas que chaque graphique change instantanément. Inspectez un graphique enfant représentatif et ses correspondances d'éléments ; voir [Ajuster l'apparence des graphiques](/fr/guides/tune-graph-appearance/).

L'enregistrement d'un modèle de données ne restructure pas automatiquement les fichiers RRD existants. Les définitions réelles et les archives du fichier peuvent être en désaccord avec le profil de la base de données. Inspectez les deux avant toute opération ; recréer un fichier n'est qu'une solution parmi d'autres.

Selon la nature de la modification, l'ajustement supporté par RRDtool, le redimensionnement d'archives ou des opérations contrôlées de vidage/restauration peuvent préserver tout ou partie de l'historique existant. Ces procédures ont des limites et exigent des sauvegardes ainsi qu'une validation rigoureuse ; elles ne reconstituent pas des données qui n'ont jamais été stockées. Supprimer et recréer un fichier entraîne la perte irréversible de son historique. Voir [Gérer la rétention des données](/fr/guides/manage-data-retention/) et [Sources de données et archives round-robin](/fr/concepts/data-sources-and-rras/).

## Autres concepts appelés modèles

Quatre autres objets portent ce nom sans se comporter comme les quatre décrits ci-dessus. Les modèles de couleur sont des palettes nommées appliquées aux éléments de graphique. Les modèles d'agrégation décrivent comment combiner plusieurs graphiques en un seul. Les modèles d'automatisation associent les appareils découverts à un modèle d'appareil. Les préréglages de graphique fournissent des formats de légende réutilisables.

Aucun d'entre eux ne s'insère dans l'empilement décrit ici. Il est utile de les connaître afin d'interpréter correctement les résultats de recherche mentionnant le mot modèle.
