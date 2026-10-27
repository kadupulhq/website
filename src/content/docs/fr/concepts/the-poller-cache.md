---
title: Le cache du poller
description: Pourquoi le collecteur lit une liste de travail précalculée plutôt que votre configuration, et pourquoi c'est la raison habituelle pour laquelle une modification semble ne rien faire.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 6
---

[Architecture](/fr/concepts/architecture/) introduit le cache du poller en une phrase :
la liste de travail est précalculée, et le collecteur lit celle-ci plutôt que d'évaluer
votre configuration à chaque cycle. Cette page explique ce que cette décision implique
réellement dans la pratique.

## Ce que le collecteur devrait faire autrement

Déterminer ce qu'il faut collecter pour une seule valeur nécessite de résoudre une
chaîne complète de dépendances. La source de données pointe vers un équipement et un
modèle de données. Le modèle pointe vers une entrée de données. L'entrée de données
comporte des champs, certains surchargés par équipement, d'autres hérités du modèle.
Si la source de données provient d'une requête de données, l'index actuel doit être
résolu via le cache des requêtes. Ensuite, les identifiants SNMP doivent être extraits
de l'équipement, à moins qu'un champ ne les surcharge.

Cela représente plusieurs jointures pour une seule valeur. Une installation modeste
compte des dizaines de milliers de valeurs et effectue un cycle toutes les cinq minutes.
Effectuer cette résolution au moment de la collecte signifierait que la base de
données, et non le réseau, déciderait du nombre d'équipements que vous pouvez surveiller.

La résolution n'a donc lieu qu'une seule fois, lorsque quelque chose change, et le
résultat est écrit à plat.

## Ce que le cache stocke

Le cache précalcule les instructions de collecte. Il réduit l'évaluation répétée
de la configuration, mais n'élimine pas les jointures ni la lecture de l'état réel
des équipements.

| Présent dans la ligne | Pourquoi c'est là |
|---|---|
| Quel collecteur en est propriétaire | Chaque collecteur sélectionne uniquement ses propres lignes |
| L'action : SNMP, script ou serveur de script | Détermine le chemin de code exécuté |
| Nom d'hôte, version SNMP, port, délai d'attente, communauté ou identifiants | Champs de connexion mis en cache ; l'état réel de l'hôte est également lu |
| L'OID ou la ligne de commande complète du script | Déjà substitués, prêts à l'emploi |
| Le chemin d'accès au fichier RRD | Déjà résolu |
| Le nom du champ dans ce fichier et le nombre de champs d'une lecture complète | Permet d'associer et de valider la sortie |
| Le pas (step) et un décompte jusqu'à la prochaine échéance | Voir [Temps et intervalles](/fr/concepts/time-and-intervals/) |

`cmd.php` joint `poller_item` à `host`, filtre les équipements désactivés et utilise
les champs réels de l'équipement pour les vérifications de disponibilité et de
réindexation. Les OID, commandes et métadonnées RRD mis en cache doivent toujours
correspondre à la source de données prévue.

Les identifiants mis en cache constituent un instantané, mais l'enregistrement
d'identifiants modifiés via l'API de l'équipement actualise normalement le cache
concerné. Les modifications directes de la base de données contournent ce chemin
et peuvent laisser un instantané obsolète. Vérifiez le cache réel plutôt que de
supposer que chaque modification d'identifiant nécessite une reconstruction manuelle.

Le chemin RRD est également un instantané. Déplacer des fichiers ou modifier leur
emplacement laisse chaque ligne mise en cache pointer vers l'ancien emplacement.

## Ce qui l'écrit

Le cache est maintenu de manière incrémentielle par les opérations conscientes d'avoir
apporté une modification.

| Opération | Lignes réécrites |
|---|---|
| Enregistrement d'un équipement | Les modifications apportées aux champs de connexion, au collecteur ou à l'état désactivé déclenchent une propagation ; les champs de collecte inchangés peuvent utiliser le chemin d'enregistrement rapide |
| Enregistrement d'une source de données | Les lignes de cette source de données |
| Création de graphiques et de sources de données à partir d'un modèle | Les lignes nouvellement créées |
| Une exécution de requête de données qui a déplacé ou résolu un index | Uniquement les sources de données modifiées |
| Reconstruction via la CLI | Équipements activés traités par les workers ; le défaut actuel de transmission de `--host-id` empêche de se fier à l'isolation des équipements |

La réécriture n'est pas une insertion aveugle. Les lignes des sources de données en
cours de reconstruction sont d'abord marquées comme absentes, puis le nouvel ensemble
est écrit, et tout ce qui est encore marqué comme absent est supprimé. C'est ce qui
supprime les lignes pour un champ qui n'existe plus. Le nettoyage de la mémoire tampon
est délimité par les identifiants de collecteur et de source de données. Cela protège
les sources non liées dans le chemin ciblé ordinaire ; ce n'est pas une garantie en
cas de reconstructions simultanées ou d'écritures échouées en base de données.
Vérifiez les lignes résultantes après une reconstruction, y compris un équipement
voisin non affecté lors de l'évaluation de la portée.

## Lignes qui ne sont jamais écrites

Certaines configurations ne produisent aucune nouvelle ligne de cache. Vérifiez les
journaux ainsi que le graphique.

Le constructeur ignore les équipements désactivés, mais l'action groupée **Désactiver**
conserve les lignes de cache existantes et la collecte filtre l'équipement. Une
reconstruction alors qu'il est désactivé peut supprimer des lignes. L'action groupée
**Activer** réutilise un cache existant ou l'initialise lorsqu'il est vide ; un
enregistrement supplémentaire de l'équipement n'est généralement pas nécessaire.
Un cache existant partiel ou obsolète nécessite toujours une investigation.

Un élément SNMP dont l'équipement n'a pas de configuration SNMP exploitable n'en
produit aucune. Aucune version, une version hors limites ou une communauté vide en
version 1 ou 2 entraîne l'omission de la ligne plutôt que l'écriture d'une ligne qui
échouerait à chaque cycle.

Lorsqu'une liste blanche d'entrées est configurée, un fichier manquant ou une entrée
rejetée empêche la création de nouvelles lignes pour cette entrée. Une reconstruction
validée nettoie toujours ses lignes obsolètes. Sans configuration `input_whitelist`,
cette vérification autorise les entrées ; ce n'est pas une protection toujours
active. Examinez la commande rejetée et la politique configurée avant de modifier
la liste blanche.

L'interface peut toujours afficher une source de données dont le cache est vide.
Son graphique peut conserver un historique ancien ou afficher des trous ; une ligne
plate à zéro n'est pas un indicateur fiable. Les identifiants manquants et les entrées
rejetées sont des problèmes de configuration à résoudre.

## Pourquoi une modification peut sembler ne rien faire

Trois mécanismes distincts produisent le même symptôme.

**La ligne n'a pas été reconstruite.** Vous avez modifié un élément que l'interface
ne considère pas comme affectant la collecte, ou vous l'avez modifié en dehors de
l'interface. Le cache conserve l'ancienne réponse. Une reconstruction peut actualiser
les champs mis en cache après vérification de la configuration prévue.

**La ligne n'a jamais été créée.** Couvert ci-dessus. Une reconstruction résout
également cela, mais seulement après la correction de la cause sous-jacente ; les
diagnostics apparaissent souvent dans les journaux plutôt que sur le graphique.

**La valeur est collectée puis rejetée.** Les sorties multi-valeurs sont mises en
correspondance via les définitions de champs du modèle, et les champs non référencés
peuvent être ignorés lors de l'analyse. Vérifiez les noms de champs attendus, les
mappages et les associations aux graphiques ; cette règle ne rejette pas indistinctement
tous les échantillons numériques sans référence graphique. Une reconstruction du
cache ne peut pas réparer un contrat de sortie incorrect.

## L'instrument brutal

Pour un équipement unique, utilisez **Remplir à nouveau le cache du poller** sur sa
page d'équipement classique. Cette action appelle le chemin `push_out_host()` limité
à l'équipement. Vérifiez ensuite les lignes résultantes et les diagnostics.

Le script parent actuel `rebuild_poller_cache.php` accepte `--host-id`, mais ne
transmet pas ce filtre à sa commande worker. Une prétendue reconstruction CLI pour un
seul équipement peut donc reconstruire d'autres équipements activés. Ne vous fiez pas
à cette option pour l'isolation tant que ce défaut de l'application n'est pas corrigé.

Une reconstruction globale par CLI est disponible à la racine de l'application,
exécutée sous l'utilisateur du poller :

```bash
php cli/rebuild_poller_cache.php
```

Elle traite les équipements activés ; ce n'est pas une réparation pour chaque source
sans hôte ou désactivée. Cette opération écrit dans les tables de collecte et peut
prendre du temps. Évitez les reconstructions qui se chevauchent et n'interrompez pas
le processus. L'option `--force` de la CLI outrepasse sa protection contre les
exécutions multiples et ne constitue donc pas une option de réparation de routine.

La reconstruction actualise l'état dérivé ; elle ne répare pas l'accessibilité des
équipements, ne déplace pas les fichiers RRD, ne corrige pas les commandes d'entrée
rejetées et ne récupère pas l'historique perdu. Examinez le cache obtenu, les journaux
et la collecte ultérieure avant de considérer la réparation comme terminée.

Kadupul enregistre la date de dernière modification du cache, ce qui permet aux autres
parties du système de savoir qu'elles doivent le relire.

## Collecteurs multiples

Lorsqu'il y a plusieurs collecteurs, chaque ligne appartient à exactement l'un d'eux,
et les lignes sont transmises à la base de données propre à ce collecteur ainsi qu'à
la base centrale.

Si un collecteur distant est inaccessible lorsque vous enregistrez une modification,
celle-ci est appliquée au niveau central et non à distance, et Kadupul l'indique :
il demande une synchronisation complète dès que le collecteur est de retour. Jusqu'à
cette synchronisation, le collecteur distant exécute une liste de travail plus
ancienne que celle présentée par l'interface. Une anomalie propre à un collecteur
est une raison d'inspecter l'état de réplication, la connectivité et le cache local
de chaque collecteur.

L'ordre dans un cycle complet, y compris l'endroit où le cache est lu et le moment
où les commandes de réindexation sont traitées, est détaillé dans
[Cycle de vie du poller](/fr/reference/poller-lifecycle/). Pour le dimensionnement
des collecteurs, voir [Dimensionner le poller](/fr/guides/scale-the-poller/).
