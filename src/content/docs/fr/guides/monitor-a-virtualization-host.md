---
title: Surveiller un hôte de virtualisation
description: Ce qu'un hyperviseur expose par SNMP, ce qui est fourni pour ESXi, et pourquoi compter les invités, le processeur et la mémoire sur un parc virtualisé est plus difficile qu'il n'y paraît.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 27
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni
aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de
leur faire confiance. Consultez l'[état du projet](/fr/project/status/).
:::

Le paquet ESXi fourni collecte les mesures de l'hôte et l'inventaire des machines virtuelles invitées.
Il ne fournit pas de mesures de processeur, de mémoire ou de contention par invité. Vérifiez les
objets exposés par votre version d'hyperviseur avant de sélectionner des graphiques.

## Ce qui est fourni

Un seul modèle de périphérique d'hyperviseur est fourni : **ESXi Device**. C'est un paquet de périphérique, si bien
qu'`install/templates/ESXi_Device.xml.gz` contient ses scripts et fichiers de requêtes de données.
Suivez [Importer et exporter des modèles](/fr/guides/import-and-export-templates/) et vérifiez que
l'importation s'est terminée, y compris le déploiement des fichiers. Sélectionnez le modèle de périphérique,
inspectez la découverte et créez explicitement les graphiques souhaités ; l'importation du paquet
ou l'association seule d'un modèle de périphérique ne les crée pas automatiquement.

| Fourni | Rôle |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Découvre les processeurs et lit la charge par processeur |
| `resource/snmp_queries/esxi_hw.xml` | Découvre les composants matériels et lit leur état |
| `resource/snmp_queries/interface.xml` | La requête standard de statistiques d'interfaces |
| `resource/script_server/host_disk.xml` | Partitions montées, via la table de stockage Host Resources |
| `scripts/ss_esxi_vhosts.php` | Inclus dans `install/templates/ESXi_Device.xml.gz` ; compte les invités, les invités sous tension et l'état des outils invités |
| `scripts/ss_multicpu_avg.php` | Calcule la moyenne de la charge de tous les processeurs en une seule valeur |
| `scripts/ss_hstats.php` | Lit les statistiques de collecte que Kadupul détient déjà pour l'équipement |
| `scripts/ss_host_disk.php` | Prend en charge la requête des partitions |

Aucun paquet dédié n'est fourni pour Hyper-V, KVM/libvirt, Xen ou Proxmox dans cet
état du code. Les modèles Linux/Windows génériques peuvent couvrir les métriques d'hôte prises en charge par leurs
agents ; la collecte spécifique à l'hyperviseur nécessite des modèles et collecteurs adaptés. Consultez
[Écrire un script de collecte de données](/fr/guides/write-a-data-collection-script/).

## Activer d'abord l'agent

Passez en revue la configuration actuelle de l'agent et suivez les instructions correspondant à votre version d'ESXi.
Les notes du paquet mentionnent une réinitialisation d'usine ; ce n'est pas un prérequis normal et
cela effacerait la configuration SNMP existante. Pour une configuration basée sur des communautés, les commandes
suivantes définissent les valeurs de l'agent ; adaptez les exemples et préservez les communautés requises
lors de la définition de la liste.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

La première commande affiche la configuration ; la dernière active l'agent. L'option de communauté
remplace la liste configurée. Vérifiez les accès pare-feu requis depuis le collecteur
et consultez la [référence des commandes SNMP ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Ces commandes configurent une interrogation par communauté ; elles ne configurent pas SNMPv3.
Validez l'accès depuis la machine exécutant le collecteur avant d'ajouter le périphérique.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Si la première commande fonctionne et que la troisième ne renvoie rien, examinez l'erreur SNMP,
la politique d'accès et la prise en charge de l'agent ; un parcours vide ne désigne pas à lui seul la cause. Le
script invité fourni utilise SNMPv1, de sorte qu'une sonde v2c réussie ne valide pas son chemin de
collecte. Des parcours d'invités vides produisent des totaux à zéro, pas forcément des trous de graphiques ;
consultez l'[anomalie du résultat vide](https://github.com/kadupulhq/kadupul/issues/245).

## Ce que l'hôte expose

| Domaine | Sous-arbre | Ce qu'il apporte |
|---|---|---|
| Processeurs | `.1.3.6.1.2.1.25.3.3.1` | Charge de chaque processeur exposé par l'agent |
| Composants matériels | `.1.3.6.1.2.1.25.3.2.1` | Index, description et état des composants |
| Stockage | `.1.3.6.1.2.1.25.2.3.1` | Banques de données et systèmes de fichiers locaux, selon les rapports de l'agent |
| Interfaces | `.1.3.6.1.2.1.2` et `.1.3.6.1.2.1.31` | Trafic, erreurs, statut |
| Inventaire des invités | `.1.3.6.1.4.1.6876` | État d'alimentation et des outils d'intégration par invité |

Les quatre premiers sont les tables standards Host Resources et interfaces, identiques à celles renvoyées
par un hôte Linux. Consultez [Surveiller un serveur Linux](/fr/guides/monitor-a-linux-server/)
pour connaître leur comportement et savoir quelle table de disques privilégier.

Le cinquième est le sous-arbre constructeur utilisé par le script de comptage des invités fourni.

## Les modèles de graphiques

| Graphique | Source | Données lues |
|---|---|---|
| ESXi - CPU | Requête de données | Charge pour un processeur découvert |
| ESXi - MultiCPU Average | Script | Moyenne de charge de l'ensemble des processeurs |
| ESXi - Hardware | Requête de données | État d'un composant matériel découvert |
| ESXi - VHosts | Script | Nombre d'invités et état des outils invités |
| Host MIB - Processes | OID fixe | Nombre de processus sur l'hôte |
| Host MIB - Logged in Users | OID fixe | Nombre de sessions ouvertes sur l'hôte |
| Device - Uptime | Script | Durée de fonctionnement telle qu'enregistrée par Kadupul |
| Device - Polling Time | Script | Durée mise par Kadupul pour interroger ce périphérique |
| Graphiques d'interfaces | Requête de données | Trafic, erreurs, paquets, statut par interface |

La requête de processeur lit la charge par entrée découverte. Ne présumez pas que son nombre de lignes
correspond au nombre de threads matériels de l'hôte : le motif d'index fourni n'accepte que des index
à un ou deux chiffres et rejette les valeurs supérieures ou égales à 100, même sur un hôte avec peu de processeurs.
Comparez la découverte avec un parcours brut ; consultez l'[anomalie d'index processeur](https://github.com/kadupulhq/kadupul/issues/246).
Le script de moyenne parcourt indépendamment les charges processeur et moyenne les lignes renvoyées.

Device - Uptime et Device - Polling Time lisent l'enregistrement stocké dans Kadupul.
L'utilitaire de temps de fonctionnement renvoie la valeur SNMP mémorisée sans extrapoler le temps écoulé ;
le temps de collecte décrit l'effort de scrutation de Kadupul. Une valeur ancienne en base ne prouve pas
l'accessibilité actuelle. Si la collecte s'arrête, ces utilitaires ne génèrent pas de nouveaux échantillons.

## Les problèmes de comptage

C'est ici que la virtualisation diffère d'un serveur physique, et rien
de tout cela n'est résolu par un simple modèle de graphique.

**Les invités se déplacent.** Un invité qui migre vers un autre hôte disparaît de l'inventaire du premier
et apparaît sur le second. Des échantillons collectés à des moments distincts peuvent temporairement
compter deux fois ou omettre cet invité. Les variations de comptage ne prouvent pas à elles seules une migration : utilisez
les identifiants d'inventaire de l'hyperviseur et les événements pour les expliquer.

**Les ressources sont partagées, l'attribution par invité est donc une estimation.** L'hôte rapporte
la charge physique du processeur. Il n'indique pas quel invité en est à l'origine. Diviser le CPU de l'hôte
par le nombre d'invités produit un nombre arithmétiquement exact qui ne répond à aucune question pertinente.

**Le surdimensionnement (overcommit) rend l'allocation et l'usage différents.** Les processeurs virtuels assignés
peuvent dépasser les cœurs physiques, et la mémoire allouée peut dépasser la mémoire physique, délibérément. Un
graphique de ressources allouées décrit une allocation et non une demande mesurée.
Comparez-le à la capacité physique, aux limites configurées et à l'usage réel.

**La contention n'apparaît pas dans ces tables.** Les mesures indiquant qu'un invité
est en pénurie – le temps passé à attendre un processeur physique et la mémoire récupérée par
l'hôte – ne figurent pas dans les données collectées par ce modèle. Un hôte à 60 % de
processeur avec des invités en forte contention est indiscernable ici d'un hôte à 60 % avec
des invités parfaitement fluides.

**Les mesures d'invités et d'hôtes répondent à des questions différentes.** L'utilisation de l'invité seule
n'explique pas forcément les retards d'ordonnancement de l'hôte. Corrélé les mesures applicatives et invités
avec les métriques de contention de l'hyperviseur plutôt que de déduire une attribution depuis la charge globale.

### Ce qu'il convient de faire à la place

| Question | Où trouver la réponse |
|---|---|
| L'hôte est-il saturé | Charge processeur de l'hôte, mesurée depuis l'hôte |
| Un invité est-il saturé | À l'intérieur de l'invité, plus une métrique de contention de l'hyperviseur |
| Combien d'invités fonctionnent | Inventaire d'invités de l'hôte, sous forme de décompte |
| Le parc est-il en surcapacité | Pas dans ces graphiques. Nécessite des données de placement non exposées par l'hôte |
| Un invité s'est-il déplacé | Identifiants d'inventaire de l'hyperviseur et événements de migration ; les sauts de décompte seuls ne suffisent pas |

Surveillez les invités comme leurs propres périphériques pour tout ce qui concerne l'invité, et surveillez l'hôte
pour ce qui concerne l'hôte. Résistez à la tentation de construire des graphiques par invité à partir de données de l'hôte :
ils sont dérivés, semblent fiables et sont inexacts d'une manière que personne ne pourra déceler plus tard.

## Pièges du décompte d'invités fourni

Le script d'inventaire des invités doit être bien compris avant de se fier à ses résultats.

**Il effectue son parcours uniquement en SNMP version 1 avec la chaîne de communauté.** La version est codée en dur
dans le script et les identifiants v3 configurés sur le périphérique ne sont pas transmis. Un périphérique configuré
en v3 peut collecter d'autres éléments alors que la collecte des invités échoue. La collecte des invités peut
toutefois réussir si l'agent accepte indépendamment la communauté stockée sur v1 ;
choisir v3 sur le périphérique ne préjuge pas à lui seul du résultat. Les parcours d'invités vides
sont renvoyés sous forme de zéros. Vérifiez ce décalage de protocole sans abaisser la politique de sécurité
de l'agent pour accommoder l'utilitaire.

**Le décompte provient de la table d'état d'alimentation.** Le nombre rapporté comme total des invités
est le nombre d'entrées renvoyées par le parcours du sous-arbre d'état d'alimentation, et non d'un
objet d'inventaire dédié. Un invité listé par l'hôte mais ne possédant pas d'entrée d'état d'alimentation
n'est pas comptabilisé.

**L'état sous tension est filtré sur le texte de statut.** Après nettoyage des espaces et conversion en minuscules,
seuls `powered on` et `poweredon` incrémentent le décompte d'actifs. Les autres représentations
ne le font pas ; examinez la réponse brute de l'agent avant d'interpréter un zéro.

**La classification des outils invités souffre d'un défaut avéré.** Le texte littéral `not installed`
est compté comme en cours d'exécution parce que la correspondance commence à l'indice zéro. Les textes non reconnus
sont également considérés comme en cours d'exécution. Ne considérez pas ce chiffre comme une preuve d'outils sains ;
consultez l'[anomalie du statut des outils](https://github.com/kadupulhq/kadupul/issues/244).

**Il effectue trois parcours par appel.** Il lit la table d'alimentation à deux reprises, puis la table
des outils, de sorte que ses propres décomptes ne forment pas un instantané d'inventaire atomique. Sur un hôte
comportant de nombreux invités, mesurez ce coût de collecte. Si le collecteur est surchargé, c'est un candidat pour un intervalle plus long avant
d'augmenter les threads. Consultez [Dimensionner le collecteur](/fr/guides/scale-the-poller/).

Le script émet normalement les cinq valeurs nommées, y compris des zéros lors de parcours vides.
Un parcours échoué peut ainsi produire un échantillon syntaxiquement complet mais trompeur.
En cas de sortie incomplète, le processeur PHP vérifie les champs exigés par la
source de données associée et retient les groupes d'horodatages incomplets ; il ne les élimine
pas forcément sur-le-champ. Consultez [Le cache du collecteur](/fr/concepts/the-poller-cache/).

## Pièges pour le reste

**La moyenne processeur masque les déséquilibres.** Un hôte avec un cœur saturé et 63 cœurs inactifs
affiche une moyenne basse. Conservez des graphiques par processeur validés lorsque c'est important. L'utilitaire
de moyenne renvoie également `load:0` lors d'un parcours vide, indiscernable d'un processeur inactif réel ;
corrélez-le avec l'état de collecte et l'anomalie de résultat vide connue.

**Les index processeurs sont positionnels.** Ils sont découverts en parcourant la table
des processeurs. Si les index de l'agent changent, vérifiez les correspondances d'identité avant de faire confiance à la continuité.
La restriction fournie à un ou deux chiffres constitue un défaut de découverte distinct.

**Les entrées de stockage correspondent à ce que l'agent qualifie de stockage.** Attendez-vous à voir des banques de données
mélangées à des éléments indésirables, dans des unités d'allocation nécessitant multiplication. C'est le
comportement standard d'Host Resources, pas une bizarrerie d'ESXi. Vérifiez les unités d'allocation en cache avant
d'interpréter les octets ; le script partagé comporte une [anomalie de conversion connue](https://github.com/kadupulhq/kadupul/issues/243)
lors d'échantillons négatifs invalides ou de multiplicateurs manquants.

**Les noms d'interfaces sur un hyperviseur sont stables jusqu'à ce qu'ils ne le soient plus.** Une mise à jour de pilote ou une
reconfiguration peut les renuméroter. Consultez [Surveiller un commutateur](/fr/guides/monitor-a-switch/) pour
comprendre comment l'index est choisi et pourquoi c'est important.

**Les scripts s'exécutent sur l'hôte du collecteur.** Ils contactent eux-mêmes l'hyperviseur, à l'aide de
l'identifiant de périphérique transmis par la commande en cache. Les utilitaires d'invités et de moyenne CPU recherchent la
ligne actuelle du périphérique à chaque appel ; un changement de communauté ne nécessite pas de reconstruire
ces arguments de commande. D'autres collecteurs peuvent intégrer les identifiants dans leurs éléments de travail.
Consultez [Le cache du collecteur](/fr/concepts/the-poller-cache/).

## Modes de défaillance

| Symptôme | Cause habituelle |
|---|---|
| Tout est collecté sauf les décomptes d'invités | Le périphérique utilise SNMPv3 et le script d'invités ne gère que v1 |
| Décompte d'invités correct, nombre d'invités allumés à zéro | Vérifiez le texte exact de l'état d'alimentation et le succès du second parcours |
| Le décompte d'invités tombe à zéro puis remonte | Vérifiez les parcours vides/échoués ; l'utilitaire peut émettre une ligne complète de zéros |
| Les graphiques processeur s'arrêtent après modification matérielle | Vérifiez les index modifiés et la restriction aux index d'un ou deux chiffres |
| CPU hôte bas et plat alors que les invités sont lents | Vérifiez les échecs de collecte et la contention ; un parcours moyen vide est renvoyé à zéro |
| Les graphiques de banques de données incluent des partitions non souhaitées | L'agent les rapporte comme du stockage |
| Le graphique d'uptime semble erroné après une coupure du collecteur | Il rapporte la dernière valeur enregistrée par Kadupul, non une mesure en direct |
| Le total d'invités entre hôtes fait un bond pendant une maintenance | Les invités en migration sont brièvement comptés deux fois, ou omis |
