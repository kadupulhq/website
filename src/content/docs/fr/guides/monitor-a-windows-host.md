---
title: Surveiller un hôte Windows
description: Graphiques du processeur, des disques, des interfaces et du temps de fonctionnement sous Windows via le service SNMP, quels objets des ressources de l'hôte transportent les données et quoi faire lorsque SNMP n'est pas disponible.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 14
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de leur faire confiance. Consultez l'[état du projet](/fr/project/status/).
:::

Windows sous SNMP fournit les interfaces, les processeurs, le stockage et certains compteurs. L'agent intégré de Microsoft n'expose pas les objets de charge, de mémoire et de disque des modèles net-snmp UCD. La mémoire peut néanmoins être tracée à partir des lignes de stockage si l'agent les expose. Les agents tiers peuvent fournir d'autres objets ; inspectez l'agent réel avant de choisir les modèles.

## Ce que le service SNMP fournit

Le service SNMP de Windows est déprécié et optionnel. Pour Windows 10 et 11, Microsoft documente son installation via les fonctionnalités facultatives ou les fonctionnalités Windows ; une ancienne erreur de nom de fonctionnalité DISM ne prouve pas à elle seule qu'il n'est pas disponible. Vérifiez les instructions adaptées à votre édition de Windows. Consultez le [guide d'installation SNMP de Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Vérifiez lesquelles de ces sous-arborescences votre agent installé expose :

| Zone | Sous-arborescence | Fournit |
|---|---|---|
| Système | `.1.3.6.1.2.1.1` | Description, temps de fonctionnement, contact, nom, emplacement |
| Interfaces | `.1.3.6.1.2.1.2` et `.1.3.6.1.2.1.31` | Trafic, erreurs, état |
| Ressources de l'hôte | `.1.3.6.1.2.1.25` | Processeurs, stockage, nombre de processus, utilisateurs connectés |
| LAN Manager | `.1.3.6.1.4.1.77` | Données de service et de partage Windows |

Les modèles Windows fournis par Kadupul lisent les trois premières zones. Rien dans l'ensemble fourni ne lit la sous-arborescence LAN Manager.

Deux éléments de configuration sur l'hôte déterminent si vous recevez des données : la chaîne de communauté et la liste des gestionnaires dont l'agent accepte les paquets. Un hôte configuré pour n'accepter SNMP que depuis une adresse de gestionnaire unique ne répondra qu'à ce gestionnaire et rejettera tout le reste.

Vérifiez chaque zone depuis l'hôte collecteur avant de créer des graphiques. Remplacez l'hôte et la communauté d'exemple par vos valeurs configurées ; `public` n'est donné qu'à titre d'illustration.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Le deuxième parcours lit la charge processeur, le troisième lit la liste descriptive du stockage. Si la première commande fonctionne et que les deux autres ne renvoient rien, vérifiez les restrictions d'accès, la prise en charge de l'agent et l'erreur SNMP renvoyée.

## Ajouter l'appareil

Importez `install/templates/Windows_Device.xml.gz` si les modèles sont absents, conformément à [Importer et exporter des modèles](/fr/guides/import-and-export-templates/). Sélectionnez le modèle d'appareil Windows, vérifiez la découverte des requêtes, puis créez explicitement les graphiques souhaités. Le paquet contient trois requêtes de données et leurs modèles de graphiques associés.

| Requête de données | Adossée à | Lit |
|---|---|---|
| SNMP - Statistiques d'interface | `resource/snmp_queries/interface.xml` | `IF-MIB`, parcourue directement |
| SNMP - Obtenir les informations processeur | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Obtenir les points de montage | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

Les requêtes de disque et de processeur sont des requêtes de serveur de script malgré leurs noms. Elles s'exécutent dans un processus de serveur de script PHP distinct et persistant et effectuent des appels SNMP avec les identifiants de l'enregistrement de l'appareil. La requête d'interface est une requête SNMP pure. La conséquence pratique est qu'un serveur de script PHP en échec arrête la collecte du disque et du processeur sous Windows tandis que les graphiques d'interface continuent de s'exécuter.

## Ce que vous obtenez sans requête de données

Deux modèles de graphiques lisent chacun un seul OID fixe.

| Graphique | OID | Stocké sous forme de |
|---|---|---|
| MIB de l'hôte - Processus | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB de l'hôte - Utilisateurs connectés | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Deux autres ne lisent rien sur l'appareil. Les graphiques de temps de fonctionnement et de temps d'interrogation appellent `scripts/ss_hstats.php` et renvoient une colonne du propre enregistrement d'appareil de Kadupul : `snmp_sysUpTimeInstance` pour le temps de fonctionnement, la durée d'interrogation enregistrée pour le temps de collecte. Ils lisent des mesures stockées, et non une réponse SNMP fraîche.

## Les tables de ressources de l'hôte

### Processeurs

`hrProcessorLoad` sous `.1.3.6.1.2.1.25.3.3.1.2` renvoie une entrée par processeur logique exposé par l'agent. Le parcours fournit les index ; ne supposez pas que le nombre de lignes correspond toujours au nombre de threads matériels annoncé.

La valeur est déjà un pourcentage. La MIB la définit comme la moyenne sur la dernière minute. Consultez la [définition de la MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Stockage

La requête de stockage fournie utilise `hrStorageTable` sous `.1.3.6.1.2.1.25.2.3.1`. Elle lit six colonnes.

| Colonne | OID | Rôle |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Index |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Index et étiquette affichée |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Entrée, le multiplicateur |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Sortie |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Sortie |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Sortie |

La taille et l'espace utilisé sont des nombres d'unités d'allocation, pas des octets. Le script multiplie chaque valeur par la taille de l'unité d'allocation mise en cache pour cet index lorsque les deux valeurs sont valides.

Deux points entraînent fréquemment des problèmes sous Windows.

**La table n'est pas une liste de disques durs.** L'agent signale tout ce qu'il considère comme du stockage. Selon l'agent, la mémoire physique et la mémoire virtuelle peuvent apparaître aux côtés des disques fixes. Des étiquettes telles que `C:\`, `D:\`, `Physical Memory` et `Virtual Memory` sont des exemples, pas des lignes garanties. Sélectionnez les lignes que vous souhaitez tracer.

**Les valeurs de stockage volumineuses ou non valides doivent être vérifiées.** La MIB définit la taille et l'utilisation comme des entiers signés non négatifs de 32 bits (Integer32). Un agent renvoyant une valeur négative est hors de cette plage. Le script actuel utilise `(abs(value) + 2147483647) * allocation_units`, ce qui ne représente pas une réinterprétation 32 bits non signée. Traitez les valeurs affectées comme peu fiables et réindexez après correction de la découverte. Consultez le [défaut de conversion de stockage](https://github.com/kadupulhq/kadupul/issues/243).

## En quoi Windows diffère de Linux

| Caractéristique | Linux avec net-snmp | Agent Windows intégré / modèles fournis |
|---|---|---|
| Moyenne de charge | `.1.3.6.1.4.1.2021.10.1.3` | Aucun objet de moyenne de charge UCD |
| Mémoire | `.1.3.6.1.4.1.2021.4` | Peut être tracée à partir des lignes `hrStorage` exposées |
| CPU | Pourcentages UCD ou `hrProcessorLoad` | Uniquement `hrProcessorLoad` |
| Liste des disques | `dskTable` déclarée par vos soins ou `hrStorage` | Uniquement `hrStorage`, non filtré |
| E/S disque | `diskIOTable` | Aucun élément fourni ne lit cela |
| Noms d'interface | Noms du noyau, courts | Descriptions d'adaptateur longues, souvent dupliquées |

L'agent Microsoft intégré ne fournit pas la sous-arborescence UCD `.1.3.6.1.4.1.2021`. Consultez [Résoudre les données manquantes](/fr/guides/troubleshoot-missing-data/).

### Interfaces

La requête d'interface est identique à celle utilisée par un commutateur. Son ordre de préférence pour l'index est `ifName`, puis `ifDescr`, puis `ifHwAddr`, puis `ifIndex`. Elle choisit le premier champ présent et unique sur chaque interface découverte.

Windows est la plateforme où cela échoue le plus souvent. Deux cartes réseau identiques peuvent renvoyer le même `ifDescr`, et certains agents laissent `ifName` vide. Lorsque la requête se replie sur `ifIndex`, l'historique de votre interface est lié à un numéro que Windows est libre de réassigner.

Consultez [Surveiller un commutateur](/fr/guides/monitor-a-switch/) et [Requêtes de données et index](/fr/concepts/data-queries-and-indexes/).

## Quand SNMP n'est pas disponible

De nombreuses installations Windows n'ont pas de service SNMP activé. L'alternative est une entrée par script.

Deux faits déterminent la manière dont vous écrivez le script.

**Le script s'exécute sur la machine exécutant le collecteur.** Rejoindre l'hôte Windows est le rôle de votre script : WinRM, un agent, un point de terminaison HTTP, un partage ou tout mécanisme en place.

**Émettez les mesures sur la sortie standard.** Le chemin de commande externe du collecteur PHP n'utilise pas l'état de sortie comme valeur de mesure. Émettez un nombre, ou `U` en cas d'absence de mesure pour ce cycle. N'émettez pas `0` lorsque vous souhaitez signaler que la mesure a échoué.

Si vous avez besoin d'une valeur par interface, par disque ou par service au lieu d'un nombre unique, le même mécanisme de script propose une forme indexée. `resource/script_queries/host_cpu.xml` est un exemple pratique qui appelle un script PHP au lieu du serveur de script.

Consultez [Écrire un script de collecte de données](/fr/guides/write-a-data-collection-script/) pour le contrat de sortie et les contraintes de dénomination.

## Modes de défaillance

| Symptôme | Cause courante |
|---|---|
| Description système lue, rien d'autre collecté | Vérifiez la prise en charge des objets, les restrictions d'accès et l'erreur SNMP spécifique |
| Aucune réponse d'un hôte en ligne | Liste des gestionnaires acceptés par l'agent ou règle de pare-feu d'hôte sur UDP 161 |
| Liste des partitions contient la mémoire | Comportement attendu ; l'agent signale la mémoire comme du stockage |
| Un volume volumineux apparaît négatif ou inconnu | Valeurs d'agent invalides ou unités d'allocation obsolètes ; vérifier le bogue de conversion connu |
| Disque et processeur s'arrêtent, les interfaces continuent | Échec du serveur de script ; la requête d'interface ne l'utilise pas |
| Modèles Net-snmp attribués, chaque mesure inconnue | L'agent sélectionné ne fournit pas les objets UCD requis pour ces modèles |
| Historique d'interface suit le mauvais adaptateur après changement | L'index s'est replié sur `ifIndex` car les noms étaient vides ou dupliqués |
| Temps de fonctionnement répète une ancienne valeur | Vérifiez si l'enregistrement de l'appareil est obsolète ; le composant n'extrapole pas l'uptime |
