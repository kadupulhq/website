---
title: Surveiller un commutateur
description: Découvrez les ports d'un commutateur, tracez les bons compteurs et choisissez un index pour que l'historique d'un port reste associé à ce port après le remplacement d'une carte.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 2
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de leur faire confiance. Consultez l'[état du projet](/fr-ca/project/status/).
:::

Un commutateur est le cas d'usage classique des requêtes de données. Vous ne savez pas à l'avance combien de ports sont présents, le décompte peut changer et chaque port a besoin de sa propre source de données. Consultez [Modèles](/fr-ca/concepts/templates/) pour comprendre le fonctionnement des requêtes de données ; cette page traite de la configuration correcte.

## Avant de commencer

Assurez-vous que l'appareil répond depuis le collecteur assigné, de préférence sous l'utilisateur du collecteur. Utilisez vos identifiants configurés en lecture seule. Les OID numériques évitent la dépendance aux noms de MIB installés localement.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Utilisez SNMP v2c ou v3. Les compteurs d'interface 64 bits sont des objets SMIv2 et ne peuvent pas être interrogés via v1. Un appareil v1 ne vous donnera que les compteurs 32 bits et rien d'autre.

## Choisir un modèle d'appareil

Le modèle d'appareil détermine quelles requêtes de données et quels modèles de graphiques sont proposés lorsque vous ajoutez l'appareil. Kadupul hérite de l'ensemble de modèles fourni par Cacti, qui comprend un modèle d'appareil SNMP générique et un ensemble de modèles spécifiques aux fournisseurs.

La découverte des ports provient de la même source quel que soit votre choix : la requête de données d'interface définie dans `resource/snmp_queries/interface.xml`. Si aucun modèle ne correspond à votre matériel, choisissez le modèle générique et associez-lui la requête d'interface.

## Exécuter la requête de données

La requête parcourt `ifIndex` pour trouver les ports et lit `ifNumber` pour savoir combien en attendre. Elle collecte ensuite un ensemble de champs par port.

| Champ | OID | Utilisé pour |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | La position dans la table SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nom court du port, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Description plus longue |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | La description d'interface que vous configurez |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Adresse MAC du port |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Vitesse en bits/sec, 32 bits |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Vitesse en Mbits/sec |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up ou Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Compteurs d'octets 32 bits |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Compteurs d'octets 64 bits |

Exécutez la requête une fois sur l'appareil. Elle renvoie une table des ports découverts. Lisez cette table avant de créer des graphiques, car elle constitue la base de chaque décision ultérieure.

## Choisir les compteurs 64 bits

La requête d'interface propose plusieurs modèles de graphiques de trafic. Les principaux :

| Modèle de graphique | Lit |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Même chose, avec une ligne de 95e centile |
| In/Out Bits (64-bit, BW) | Même chose, par rapport à la vitesse de l'interface |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Utilisez un modèle 64 bits sauf si vous avez une raison spécifique de ne pas le faire. Un compteur d'octets 32 bits plafonne à 4294967295. Un port gigabit sous pleine charge le remplit en environ 34 secondes. Avec un pas de 300 secondes, le collecteur ne peut pas distinguer un dépassement de capacité de sept dépassements, et `COUNTER` ne corrige qu'un seul débordement entre deux échantillons. Le graphique n'apparaît pas cassé de manière évidente ; il affiche simplement des valeurs trop basses en permanence.

Vérifiez que les compteurs sont réellement alimentés avant de créer des centaines de graphiques.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Un parcours vide ou en échec nécessite une investigation : vérifiez l'erreur signalée, la vue d'accès et la prise en charge de l'agent.

## Vérifier le maximum stocké après des changements de vitesse

Lorsque la source de données utilise un maximum basé sur la vitesse de la requête, la création tire la vitesse des données de découverte mises en cache. `ifHighSpeed` est préféré, `ifSpeed` est utilisé si le premier est absent, et une valeur par défaut configurée s'applique si les deux sont à zéro.

Cette valeur est inscrite dans le fichier. Un port découvert à 100 Mbps puis négocié plus haut peut conserver un plafond inférieur à son trafic réel, et RRDtool enregistrera les débits supérieurs à ce plafond comme inconnus. Comparez la vitesse mise en cache, la définition de la source de données et le fichier réel à l'aide de `rrdtool info`.

## Le choix de l'index

C'est ici que l'historique est perdu en cas d'erreur.

Chaque source de données stocke deux éléments concernant son port : quel champ l'identifie (le type d'index) et la valeur de ce champ. À chaque réindexation, elle retrouve le port en demandant quel index SNMP possède actuellement cette valeur dans ce champ. La source de données suit la valeur, et non la position dans la table.

La question est donc de savoir quel champ porte la valeur.

La requête d'interface déclare un ordre de préférence : `ifName`, puis `ifDescr`, puis `ifHwAddr`, puis `ifIndex`. Kadupul choisit normalement parmi les candidats présentant des valeurs suffisamment distinctes et sans doublon.

| Champ | Survit à | Échoue lorsque |
|---|---|---|
| `ifName` | Redémarrages, remplacements de carte, renumérotation | L'agent le laisse vide ou le répète entre membres d'un empilement |
| `ifDescr` | Généralement stable sur le matériel de commutation | Sur les serveurs, un nom de noyau sujet à modifications |
| `ifHwAddr` | Redémarrages | Une carte remplacée possède de nouvelles adresses MAC, ce qui correspond exactement au cas que vous souhaitiez protéger |
| `ifIndex` | Rien de fiable | Le remplacement d'une carte, un redémarrage ou une modification de micrologiciel renumérote la table |

Si la requête se replie sur `ifIndex`, considérez cela comme un problème à investiguer et non comme un résultat normal. L'historique de votre port est alors lié à un numéro que le commutateur est libre de réassigner.

## Méthode de réindexation

Définie par appareil et par requête de données. Elle détermine quand Kadupul relit les champs d'index.

| Méthode | Déclenche sur | Coût |
|---|---|---|
| None | Rien ; manuel ou script uniquement | Aucun |
| Uptime | Temps de fonctionnement SNMP de l'appareil reculant | Une comparaison par cycle |
| Index Count | Changement du nombre d'index découverts | Un comptage par cycle |
| Verify All | Échec d'une vérification d'identité mise en cache | Interroge les index connus pendant la collecte |

Uptime est le réglage par défaut et convient à la plupart des commutateurs, car un redémarrage est l'événement qui renumérote les index. Index Count capture les cartes ajoutées ou retirées sans redémarrage. Verify All peut détecter des identités modifiées sur des index connus, mais ne garantit pas la découverte de nouveaux ports.

Pour réexécuter un appareil et une requête sélectionnés, remplacez les deux identifiants par les identifiants installés. Omettez `--qid` pour réexécuter toutes les requêtes de cet appareil :

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` étend l'exécution à tous les appareils activés. Évitez les exécutions de réindexation qui se chevauchent. `--force` contourne le verrou d'enregistrement de processus et actualise les caches de titres.

## Quand un port disparaît

Ne supposez pas qu'un port manquant arrête automatiquement la collecte. Le code de réindexation actuel peut réinitialiser un indicateur d'orphelin et conserver les anciennes OID d'interrogation lorsqu'une identité n'est pas résolue et qu'aucune source ne modifie l'index. Comparez l'identité stockée avec le nouveau cache de découverte et désactivez une source concernée jusqu'à confirmation de la correspondance. Consultez [Requêtes de données et index](/fr-ca/concepts/data-queries-and-indexes/).

## Châssis volumineux

Deux paramètres par appareil deviennent importants lorsque le nombre de ports est élevé : vérifiez les OID configurées par requête SNMP et le nombre de threads par appareil. La prise en charge du traitement par lots et le parallélisme effectif dépendent du collecteur et de l'agent ; PHP `cmd.php` et Spine n'offrent pas un comportement de multithreading identique.

Modifiez un seul paramètre à la fois et observez la durée d'exécution du collecteur.

## Modes de défaillance

| Symptôme | Cause |
|---|---|
| Graphiques créés, chaque mesure inconnue | Compteurs 64 bits non implémentés, ou l'appareil utilise SNMP v1 |
| Compteurs sautent à des valeurs aberrantes | Compteur 32 bits déborde plus d'une fois par intervalle |
| Trous uniquement en charge élevée | Maximum RRD fixé à une vitesse découverte obsolète |
| Historique de port attribué au mauvais port après maintenance | Identité instable, correspondance obsolète ou traitement orphelin non résolu |
| Le collecteur signale des index SNMP invalides | Sources de données laissées sans index ; réindexer, supprimer ou désactiver |
| Ports découverts, rien n'est collecté | Les sources de données avec un index vide ne créent pas d'entrées dans le cache du collecteur |
