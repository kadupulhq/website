---
title: Requêtes de données et index
description: Comment un seul parcours d'un équipement devient plusieurs sources de données, ce qu'est réellement un index et ce qui se passe lorsqu'un équipement se renumérote.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 5
---

Une source de données ordinaire requiert de savoir ce que vous mesurez avant de la
configurer. Cela convient pour la charge moyenne du système. Cela ne fonctionne pas
pour les ports de commutateurs, les disques, les capteurs de température ou les machines
virtuelles, car la liste évolue et vous ne la contrôlez pas.

Une requête de données découvre les objets disponibles. La création de graphiques – qu'elle
soit manuelle ou issue d'une automatisation configurée – sélectionne les objets qui
reçoivent des sources de données ; l'exécution d'une requête seule ne crée pas tous les
graphiques envisageables.

## Ce que contient une définition de requête

Une requête de données est une description XML comportant trois volets : l'emplacement de
la liste des éléments, les informations à lire pour chacun d'eux, et la méthode pour
déterminer quel élément correspond à quoi.

La requête d'interface livrée avec Kadupul constitue l'exemple type. Elle parcourt
`.1.3.6.1.2.1.2.2.1.1` afin d'énumérer les interfaces, puis lit un jeu de champs nommés
à chaque position retournée. Chaque champ déclare une direction.

| Direction | Signification | Exemples pour les interfaces |
|---|---|---|
| `input` | Lu pour l'identification et le nommage. Non collecté au fil du temps | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Une valeur qui mérite d'être collectée à chaque cycle | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Les deux | `ifOperStatus`, `ifAdminStatus` |

Les champs précisent également la façon de lire la valeur. La plupart la reprennent telle
quelle ; certains appliquent une expression rationnelle pour extraire un nombre d'une
énumération SNMP, et d'autres demandent un décodage sous forme de texte plutôt que de multiplets bruts.

L'exécution de la requête enregistre une ligne par index et par champ : l'équipement, la
requête, le nom du champ, la valeur et la position d'où provient la valeur. Cette table
fournit la réponse à la question « que possède cet équipement ? », mise en cache jusqu'à
la prochaine exécution. La sélection des graphiques exploite ce cache, mais les outils de
création de graphiques peuvent aussi attacher ou réexécuter une requête. Inspectez les
résultats de la découverte avant d'ajouter des graphiques.

## L'index est un problème d'identité

La position dans une table SNMP n'est pas un nom. Il s'agit d'un numéro d'emplacement
attribué par l'agent, et les agents réorganisent les emplacements après un redémarrage,
la réinsertion d'une carte, une mise à niveau du microprogramme ou une modification de
configuration qui supprime une interface. Si une source de données ne retient que
« l'emplacement 3 », le jour où cet emplacement devient un autre port, trois mois
d'historique s'associent silencieusement au mauvais élément.

Kadupul enregistre le type d'index et la valeur d'identification, conjointement avec
l'index SNMP actuellement résolu. La réindexation s'appuie sur cette identité pour
retrouver la position actuelle dans la table ; les types d'index surchargés manuellement
font l'objet d'un traitement séparé.

À chaque exécution de la requête, le système recherche l'emplacement actuel correspondant
à la valeur de ce champ.

| Résultat | Ce qui se passe |
|---|---|
| Même emplacement | Rien à faire |
| Emplacement différent | La source de données est réaffectée au nouvel emplacement et ses graphiques suivent |
| Valeur non présente | La gestion des orphelins dépend de la requête et du chemin de code ; vérifiez l'indicateur résultant et les OID d'interrogation plutôt que de supposer l'arrêt de la collecte |

La réindexation préserve normalement la source de données et son historique existant.
L'option `index_transient` traite les identités absentes comme prévues et saute le
marquage orphelin habituel. `index_orphan_removal` supprime les entrées d'interrogation
concernées ainsi que la sortie Boost ; elle ne supprime ni la source de données ni le
fichier RRD lui-même.

La gestion actuelle des orphelins comporte un défaut : lorsqu'une identité disparaît et
qu'aucune autre source ne change d'index, la branche sans modification peut réinitialiser
l'indicateur d'orphelin tout en laissant en place l'ancien index et les OID d'interrogation.
Ne comptez pas sur le masquage automatique des orphelins pour empêcher la collecte à partir
d'un index de port réutilisé. Vérifiez l'identité stockée par rapport à la découverte et
désactivez la source de données affectée jusqu'à la résolution.

## Choisir le champ servant de clé

Tous les champs ne constituent pas une clé exploitable. La définition de requête fournit
une liste de préférences ordonnée ; Kadupul la parcourt et retient le premier candidat qui
satisfait à un ensemble de vérifications.

| Vérification | Raison d'être |
|---|---|
| Le champ est `input` ou `input-output` | Les champs d'identification doivent être accessibles lors de la découverte |
| Aucun doublon de valeur entre les index | Une clé en double ne peut pas identifier une ligne unique |
| Le nombre de valeurs distinctes équivaut au nombre d'index | Rejette une couverture incomplète des candidats |

Ces contrôles comportent des exceptions : un candidat unique déclaré est renvoyé directement,
et l'OID brut d'index est accepté séparément. `index_type=nonunique` contourne le rejet des
doublons, mais n'ignore pas la vérification du nombre de valeurs distinctes. Inspectez le
champ retenu et les valeurs en cache ; l'étiquette de type XML ne suffit pas à attester
la validation.

La requête d'interface privilégie `ifName`, puis `ifDescr`, puis l'adresse matérielle,
et enfin l'index brut. Cet ordre est délibéré. `ifName` est court et stable sur la majorité
des plates-formes. `ifDescr` est stable mais intègre parfois le numéro d'emplacement dans
son texte, ce qui contredit l'objectif recherché. L'index brut vient en dernier, car s'appuyer
sur lui s'avère à peine plus efficace que de n'utiliser aucune clé.

Voici l'aspect qui surprend souvent. Le choix s'effectue par équipement et par exécution,
à partir des données actuelles de cet équipement. Des valeurs manquantes en cache ou des
noms en doublon peuvent disqualifier `ifName` et provoquer un repli vers `ifDescr`. Un
champ vide ne démontre pas à lui seul quel test a échoué ; inspectez les lignes réelles
de la découverte. Deux commutateurs identiques peuvent se retrouver indexés sur des champs
distincts, et un équipement peut changer de champ d'une exécution à l'autre. Kadupul consigne
un avertissement lorsque le champ sélectionné change, car c'est à cet instant précis que
des erreurs de réaffectation deviennent possibles.

Le champ retenu sert généralement aussi à nommer les graphiques via un format de titre qui
y fait référence. Si les titres de vos graphiques changent de structure à travers votre parc,
c'est du côté du champ de tri qu'il faut chercher.

## Détecter qu'une réindexation est nécessaire

Réexécuter une requête de données sur chaque équipement à chaque cycle s'avérerait coûteux
et largement inutile, la majorité des équipements ne renumérotant rien pendant des années.
À la place, chaque couple équipement-requête est doté d'une méthode de réindexation, qui
correspond à une assertion peu coûteuse vérifiée lors de la collecte régulière. Lorsque
l'assertion échoue, une réindexation est mise en file d'attente.

| Méthode | Ce qu'elle vérifie | Limites et coût |
|---|---|---|
| Aucune | Aucune assertion automatique | Les réexécutions de requêtes doivent provenir d'une action manuelle ou explicite |
| Temps de fonctionnement | Le temps de fonctionnement n'a pas régressé | Nécessite un SNMP fonctionnel ; manque les changements survenus sans retour arrière du compteur |
| Nombre d'index | Le nombre actuel correspond aux index en cache | Un OID de comptage est peu coûteux ; en son absence, l'implémentation dénombre les résultats d'un parcours ou d'un script. Les changements à effectif constant peuvent passer inaperçus |
| Tout vérifier | Les valeurs clés connues concordent toujours à leurs index en cache | La charge croît avec le volume en cache ; ne garantit pas la détection de nouveaux index ni de changements sémantiques préservant ces valeurs |

« Tout vérifier » contrôle les assertions lors de l'interrogation ; cela ne réexécute pas
inconditionnellement l'intégralité de la requête de découverte à chaque cycle. Mesurez son
coût sur des équipements représentatifs avant un déploiement large. Le temps de fonctionnement
est une valeur par défaut courante, mais n'offre aucune assertion si SNMP est désactivé. La
définition de requête peut fournir sa propre source de temps de fonctionnement ou de comptage.

## La réindexation est asynchrone

Une assertion défaillante ne déclenche pas immédiatement la réindexation. Elle inscrit une
commande, et un passage distinct après le cycle de collecte prend en charge cette commande
pour réexécuter la requête. Les conséquences concrètes méritent d'être gardées à l'esprit.

Le cycle qui détecte le changement peut continuer à exploiter l'ancien cache, de sorte qu'une
valeur peut être affectée à la mauvaise série avant la fin de la réindexation. La suppression
de pics liée au temps de fonctionnement remplace la sortie à valeur unique par « inconnue »
lorsque son indicateur est actif ; elle ne constitue pas une garantie pour les sorties
multivaleurs ou chaque changement d'index.

Une réindexation ne s'exécutera pas sur un équipement inaccessible ou désactivé. Un équipement
ayant changé d'index pendant son indisponibilité nécessite encore une assertion ou une
réexécution explicite une fois rétabli. La première interrogation réussie ne démontre pas
à elle seule que la réaffectation est terminée. L'option `--force` n'outrepasse pas les
contrôles d'état hors ligne/désactivé.

Dès que la requête est réexécutée, les entrées du cache du poller correspondant aux sources
de données déplacées sont réécrites, ce qui redirige effectivement la collecte. Ce mécanisme
est [Le cache du poller](/fr/concepts/the-poller-cache/), et la réexécution de requête figure
parmi les rares processus qui le maintiennent automatiquement.

Pour le volet opérationnel – associer une requête à un équipement et interpréter les
résultats – consultez [Superviser un commutateur](/fr/guides/monitor-a-switch/).
