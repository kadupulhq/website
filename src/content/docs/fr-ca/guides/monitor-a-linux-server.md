---
title: Surveiller un serveur Linux
description: Graphiques du processeur, de la mémoire, des disques et de la charge sur un hôte Linux via net-snmp, ce que snmpd doit exposer et comment utiliser un script lorsque SNMP ne suffit pas.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 3
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de leur faire confiance. Consultez l'[état du projet](/fr-ca/project/status/).
:::

Un hôte Linux exécutant net-snmp vous donne la majeure partie des métriques sans aucun code supplémentaire. Le travail consiste à amener `snmpd` à exposer les bonnes sous-arborescences et à savoir laquelle des deux MIBs de disque qui se chevauchent vous observez.

## Ce que snmpd doit exposer

Kadupul interroge quatre zones. Accordez à l'identité de surveillance les sous-arborescences requises pour les graphiques sélectionnés ; tous les déploiements n'ont pas besoin de chaque sous-arborescence.

| Zone | Sous-arborescence | Fournit |
|---|---|---|
| Système | `.1.3.6.1.2.1.1` | Description, temps de fonctionnement, contact, nom, emplacement |
| Interfaces | `.1.3.6.1.2.1.2` et `.1.3.6.1.2.1.31` | Trafic, erreurs, état |
| Ressources de l'hôte | `.1.3.6.1.2.1.25` | Processus, utilisateurs connectés, stockage, processeurs |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Moyennes de charge, mémoire, temps processeur, E/S disque, partitions déclarées |

Plusieurs distributions fournissent un `snmpd.conf` par défaut accordant une vue qui ne couvre que la sous-arborescence système. L'appareil répond alors, signale une description système et ne collecte rien. Cette combinaison est le premier échec le plus courant sur un hôte Linux et ressemble exactement à un problème de modèle.

Vérifiez les zones requises depuis l'hôte collecteur en utilisant la même identité SNMP configurée sur l'appareil. Ces exemples utilisent une communauté illustrative ; remplacez-la par la valeur configurée. Les OID numériques évitent d'exiger des définitions symboliques locales de MIB.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Si seule la première commande fonctionne, examinez la réponse exacte : une vue restreinte, un module d'agent non disponible, un contexte SNMP différent ou une table vide peuvent expliquer le résultat. Vérifiez la configuration de l'agent et l'accès avant de modifier le modèle Kadupul.

## Ajouter l'appareil

Le paquet fourni `install/templates/NetSNMP_Device.xml.gz` contient le modèle d'appareil Net-SNMP et ses dépendances. Importez-le si le modèle est absent, puis sélectionnez-le lors de l'ajout de l'appareil. Confirmez les index de requête et créez explicitement les graphiques souhaités ; la sélection d'un modèle d'appareil ne prouve pas que la collecte fonctionne. Consultez [Importer des modèles](/fr-ca/guides/import-and-export-templates/) et [Votre premier graphique](/fr-ca/start/first-graph/).

## Ce que vous obtenez sans requête de données

Ces modèles de données à OID fixe sont inclus dans le paquet. Un graphique peut en combiner plusieurs ; la disponibilité dépend de l'agent cible. Ils ne nécessitent aucune découverte d'index.

| Graphique | OID | Stocké sous forme de |
|---|---|---|
| Moyenne de charge 1 minute | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Moyenne de charge 5 minutes | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Moyenne de charge 15 minutes | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Mémoire totale | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Mémoire disponible | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Mémoire tampon | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Mémoire cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU utilisateur | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU système | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU inactif | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interruptions | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Changements de contexte | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processus | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Utilisateurs connectés | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Les objets mémoire sont exprimés en kilo-octets. Le graphique de mémoire fourni applique une conversion pour que l'axe affiche des octets. Si vous construisez votre propre graphique à partir de ces OID, cette conversion est sous votre responsabilité.

Les objets CPU répertoriés sont des pourcentages obsolètes, et non des compteurs cumulatifs de temps CPU. Ne supposez pas que ces trois objets couvrent à eux seuls tous les états du processeur. Net-SNMP les déprécie au profit de compteurs bruts ; les compteurs bruts nécessitent des calculs appropriés de taux et de pourcentages, et non une simple insertion dans un modèle de type gauge. Consultez la [MIB UCD-SNMP](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Ce qui nécessite une requête de données

| Requête | Découvre | Adossée à |
|---|---|---|
| SNMP - Obtenir les points de montage | Tout ce que l'agent appelle stockage | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Obtenir les partitions surveillées | Uniquement les partitions déclarées dans `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Obtenir les informations processeur | Une entrée par processeur | Charge processeur des ressources de l'hôte |
| Net-SNMP - Obtenir les E/S périphériques | Périphériques bloc | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Statistiques d'interface | Interfaces réseau | `IF-MIB` |

### Quelle requête de disque utiliser

Il ne s'agit pas de deux vues des mêmes données.

La requête des ressources de l'hôte parcourt tout ce que l'agent qualifie de stockage. Sur la plupart des hôtes Linux, cela regroupe la mémoire physique, le swap, les montages tmpfs et les systèmes de fichiers réels dans une seule liste. Les tailles sont renvoyées en unités d'allocation, et la requête lit la taille de l'unité d'allocation sous forme de champ distinct pour que le graphique puisse multiplier. Vous obtenez tout sans rien configurer, mais également une longue liste d'entrées non souhaitées.

La requête net-snmp lit la table de disques UCD, alimentée par des directives `disk` ou `includeAllDisks`. Choisissez des partitions explicites ou une découverte large ; ce sont des politiques différentes.

```
disk /      10%
disk /var   10%
```

Alternativement, `includeAllDisks 10%` remplit les disques trouvés au démarrage de l'agent. La valeur de 10 % configure un seuil d'espace libre ; ce n'est pas un filtre de sélection et cela ne configure pas les alertes Kadupul en soi. Rechargez ou redémarrez l'agent, puis vérifiez les index. Une requête vide peut également refléter un problème d'accès ou de disponibilité du module. Consultez la [configuration de snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Préférez la requête des ressources de l'hôte lorsque vous souhaitez l'exhaustivité et êtes prêt à faire le tri. Préférez la requête net-snmp avec des entrées `disk` explicites lorsque vous souhaitez une liste ciblée. `includeAllDisks` élargit cette liste ; revérifiez les index après les redémarrages de l'agent.

### Interfaces

La requête de données d'interface sur un serveur se comporte exactement comme sur un commutateur, avec une mise en garde : `ifDescr` sous Linux est le nom de l'interface du noyau, qui peut changer après un redémarrage ou une mise à jour de pilote. Consultez [Surveiller un commutateur](/fr-ca/guides/monitor-a-switch/) pour les détails sur le choix de l'index.

## Quand SNMP ne suffit pas

Certaines métriques ne disposent pas d'une MIB exploitable. Une profondeur de file d'attente, un compteur applicatif ou un nombre dans un fichier nécessitent une entrée par script.

Deux faits déterminent la manière dont vous écrivez le script.

**Le script s'exécute sur la machine exécutant le collecteur, et non sur l'hôte surveillé.** Rejoindre la cible est le rôle de votre script : SSH, un appel HTTP, un agent ou tout mécanisme déjà déployé.

**Le collecteur lit la sortie standard et rien d'autre.** L'état de sortie n'est pas évalué.

Le contrat de sortie :

| Sortie | Signification |
|---|---|
| `42` ou `3.7` | Une seule valeur pour une seule source de données |
| `U` | Aucune valeur pour ce cycle, enregistrée comme inconnue |
| `in:1420 out:980` | Plusieurs valeurs, une par source de données |

Pour la forme à valeurs multiples, les paires sont séparées par des espaces simples et le nom est séparé de la valeur par deux-points. L'analyseur compte les délimiteurs par rapport aux espaces, de sorte que des espaces internes supplémentaires peuvent faire échouer la validation. Le collecteur PHP supprime les espaces de fin. Émettez le format canonique avec des espaces simples et redirigez les diagnostics hors de stdout.

Les noms internes de sources de données RRD acceptés par l'éditeur de modèles correspondent à `[a-zA-Z0-9_]{1,19}` ; les tirets n'y sont pas acceptés. Les étiquettes de sortie du script doivent correspondre aux noms des champs de saisie de données et correspondre aux éléments internes prévus. La ligne de sortie complète est stockée dans une colonne de 512 caractères. Consultez [Scripts de collecte](/fr-ca/guides/write-a-data-collection-script/) pour le contrat audité du collecteur PHP.

Renvoyez `U` au lieu de `0` lorsque vous ne parvenez pas à mesurer quelque chose. Zéro est une mesure et sera représenté comme tel. Consultez [Sources de données et RRA](/fr-ca/concepts/data-sources-and-rras/) pour savoir pourquoi les deux doivent rester distincts.

### Serveur de script

Un script simple s'exécute une fois par source de données et par intervalle. Pour un script écrit en PHP, la forme serveur de script appelle une fonction dans un processus PHP persistant distinct, réduisant ainsi la surcharge de démarrage de l'interpréteur.

### Le piège de la liste blanche

Lorsqu'un fichier de liste blanche de saisie de données est utilisé, le collecteur compare la chaîne de commande de chaque saisie de données à celle enregistrée. Une chaîne de commande qui a changé sans régénération de la liste blanche cesse de créer des entrées dans le cache du collecteur, et la source de données devient silencieuse sans erreur sur le graphique. Le journal le signale, pas l'interface utilisateur.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Remplacez `42` par l'identifiant de la méthode de saisie de données vérifiée, et non par un identifiant d'appareil. Une mise à jour sans `--id` accepte les chaînes de commande actuelles sur l'ensemble des saisies. Auditez les modifications au préalable. Après la mise à jour, vérifiez l'activation de la source et les entrées effectives dans le cache du collecteur.

## Modes de défaillance

| Symptôme | Cause courante |
|---|---|
| Description système lue, rien d'autre collecté | Vue `snmpd` restreinte à la sous-arborescence système |
| Requête de partitions net-snmp ne trouve aucun index | Aucune ligne `disk` ou `includeAllDisks` dans `snmpd.conf` |
| Partitions des ressources de l'hôte incluent la RAM et tmpfs | Comportement attendu ; l'agent les signale comme stockage |
| Graphique de mémoire décalé d'un facteur 1024 | Construction sur les OID brutes sans conversion |
| Script renvoie une valeur en ligne de commande, le collecteur enregistre inconnue | Discordance sortie/mappage, erreurs de délimiteur interne ou nom interne invalide |
| Script fonctionne manuellement, échoue via le collecteur | Il s'exécute sous l'utilisateur du collecteur avec son environnement et ses permissions |
