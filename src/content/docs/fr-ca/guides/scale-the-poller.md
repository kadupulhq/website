---
title: Dimensionner le poller
description: Que modifier lorsque la collecte ne se termine plus dans son intervalle, et comment déterminer quelle limite a réellement été atteinte.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 6
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure
de migration prise en charge pour Kadupul. Testez ces procédures sur une copie
isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr-ca/project/status/).
:::

Dimensionner le poller revient à poser une seule question : un cycle de collecte se termine-t-il
avant que le suivant ne démarre ? Tout ce qui suit vise à répondre à cette question, puis à faire
en sorte que la réponse redevienne un oui.

Consultez d'abord [l'architecture](/fr-ca/concepts/architecture/) si vous n'avez pas une vision claire
de la partie qui réalise la collecte.

## Les deux horloges

Il existe deux intervalles distincts qui ne correspondent pas au même paramètre.

| | Ce que c'est | Valeurs autorisées |
|---|---|---|
| Intervalle du lanceur | Fréquence à laquelle le système d'exploitation démarre le collecteur, via cron ou le service `cactid` | 60 ou 300 secondes |
| Intervalle du poller | Cadence de collecte de base ; les pas des sources de données individuelles peuvent être plus longs | 10, 15, 20, 30, 60 ou 300 secondes |

Lorsque l'intervalle du poller est plus court que l'intervalle du lanceur, un seul lancement
exécute plusieurs passes de collecte dans une boucle. Le nombre de passes correspond à l'intervalle
du lanceur divisé par l'intervalle du poller.

Le budget alloué à l'ensemble du lancement découle de ces deux nombres : les passes multipliées
par l'intervalle du poller, moins deux secondes. C'est l'horloge réelle par rapport à laquelle
l'exécution est mesurée.

## Que se passe-t-il en cas de dépassement

Trois événements distincts se produisent et génèrent trois lignes de journal distinctes.

**L'exécution est interrompue.** Lorsque le temps écoulé dépasse le budget, le poller consigne
que le temps d'exécution maximal a été dépassé, enregistre ses statistiques et se termine. Le travail
qui n'a pas produit de mesure peut laisser un vide. Les mesures déjà admises dans la file d'attente
durable peuvent rester en suspens pour une écriture RRD ultérieure réussie ; un dépassement n'implique
pas que chaque mesure non vidée a été rejetée. Inspectez la profondeur de la file d'attente et les
journaux en regard du graphique, et ne videz pas les lignes conservées simplement pour que le cycle
suivant paraisse propre.

**Le cycle suivant constate les dégâts.** Au démarrage, le poller compte les lignes de processus
qui n'ont jamais été clôturées et avertit que des processus ont été détectés comme ayant dépassé un
cycle d'interrogation. Examinez les enregistrements de processus inachevés ou obsolètes et les processus
enfants réellement en cours d'exécution ; l'avertissement seul n'identifie pas le goulot d'étranglement.

**Les horloges dérivent.** S'il s'est écoulé plus de temps depuis la dernière exécution que ce que
le budget permet, le poller signale que le lanceur est désynchronisé par rapport à l'intervalle du
poller. Ce problème provient généralement du lanceur et non du poller : une entrée cron à la mauvaise
fréquence, un service arrêté ou un hôte qui était en veille.

Ces chemins appellent le gestionnaire de notification de l'administrateur. L'acheminement dépend des
destinataires configurés, des contrôles de notification et du fonctionnement du transport de messagerie ;
un avertissement dans le journal ne prouve pas qu'un courriel est arrivé. Consultez [les notifications par courriel](/fr-ca/guides/send-email-notifications/).

Il existe un quatrième cas qui n'est pas un dépassement. Si le poller est redémarré plus tôt que
prévu, il consigne qu'il est configuré pour s'exécuter trop souvent et se termine sans collecter.
`--force` contourne cette vérification de synchronisation ; ne l'utilisez que lors d'un diagnostic
contrôlé avec les lancements planifiés et autres lancements manuels arrêtés. Cela n'ajoute pas de capacité
et ne rend pas la collecte chevauchante sûre.

## La ligne de statistiques

Chaque exécution terminée écrit une ligne de statistiques dans le journal. Elle contient le temps
écoulé, la méthode de collecte, les nombres de processus et de threads, le nombre d'équipements,
les équipements par processus, les sources de données et les fichiers RRD traités.

Suivez l'évolution du temps écoulé, de la latence de queue, de la profondeur de la file d'attente et
des échecs de mise à jour. Examinez même une exécution isolée proche du budget lorsqu'elle provoque des
trous ; une augmentation soutenue aide à déterminer quand la capacité ou le comportement de collecte
doit changer.

## Processus et threads

Deux cadrans qui remplissent des rôles différents.

| Cadran | Unité de travail qu'il divise | Quel collecteur l'utilise |
|---|---|---|
| Processus | Équipements, répartis en plages contiguës d'identifiants d'équipement | Les deux |
| Threads | Éléments au sein d'un équipement | Spine uniquement |

La conséquence est le point sur lequel les gens trébuchent : **un processus se voit attribuer des
équipements entiers.** Un équipement comportant cinq mille sources de données ne peut pas être réparti
entre plusieurs processus. Il aboutit dans un seul processus et ce processus prend tout le temps dont
il a besoin. Ajouter des processus ne change rien à sa durée.

Les deux valeurs sont conservées par collecteur de données et non globalement. Les valeurs sur la
page des paramètres sont des présélections appliquées lorsqu'un nouveau collecteur de données est créé.
Modifier la présélection ne change pas un collecteur existant.

Il existe également un nombre de threads par équipement, qui est la façon dont un seul équipement
volumineux est divisé. Cela ne s'applique qu'au collecteur C.

Balance Process Load utilise les décomptes cumulés d'éléments pour déterminer les limites entre
équipements entiers dans l'ordre des identifiants d'équipement. Cela ne divise pas un équipement et ne
garantit pas un nombre égal d'éléments, et le nombre d'éléments ne correspond pas au temps d'exécution.
Comparez le temps d'exécution par processus avant et après son activation sur une charge de travail
représentative isolée.

## Le collecteur PHP face au collecteur C

Le collecteur PHP, `cmd.php`, est livré avec l'application. Kadupul prévoit de maintenir un fork de
Spine, mais l'emplacement de ses sources et des versions validées ne sont pas encore documentés.
Utilisez PHP jusqu'à ce que ces éléments probants soient disponibles. Les comparaisons de Spine, les
paramètres de threads et les commandes ci-dessous décrivent un comportement hérité, non un déploiement
Kadupul disponible ou pris en charge.

| | Collecteur PHP | Spine |
|---|---|---|
| Parallélisme | Processus uniquement | Processus et threads |
| Paramètre de thread | Forcé à 1 quelle que soit la configuration | Respecté |
| Serveur de scripts | Un par processus, non configurable | 1 à 15 par processus, configurable |
| Délai d'expiration du script | Non appliqué | Appliqué, 25 secondes par défaut |
| Installation | Livré avec le code | Fork prévu ; aucun build Kadupul validé documenté |

Le nombre de threads forcé mérite d'être énoncé clairement : si le collecteur est défini sur la
version PHP, la variable d'exécution des threads est fixée à 1 ; cela ne réécrit pas le paramètre de
thread stocké du collecteur. Faire monter en charge le collecteur PHP peut nécessiter davantage de
processus, et la recommandation dans le code source est de rester à ou sous deux fois le nombre de cœurs CPU.

La configuration de Spine et le comportement des commandes nécessitent une validation par rapport au
binaire exact évalué. Le code source de l'application PHP seul n'établit pas son ordre de recherche de
configuration, son comportement de thread ou ses effets de bord.

Exemples hérités pour une évaluation isolée de Spine, non des commandes Kadupul validées :

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` est destiné à éviter les écritures de résultats. Il contacte toujours les équipements
et exécute les scripts de collecte ; validez d'abord ses effets de bord dans un test isolé.

## Connexions à la base de données

Les threads ne sont pas gratuits. Chaque thread spine maintient sa propre connexion à la base de
données, tout comme chaque serveur de scripts.

```
estimated worker connections = processes * (threads + script_servers)
```

Il s'agit de l'estimation fournie dans l'aide des paramètres de l'application, et non d'une limite
supérieure mesurée. Faites-en la somme sur l'ensemble des collecteurs et ajoutez de la marge pour les
processus parents du poller, les requêtes web, la maintenance et les autres clients. Mesurez les pics
réels de connexions et les connexions rejetées avant de choisir la limite de la base de données ;
l'augmenter consomme également des ressources.

L'épuisement des connexions peut entraîner des mesures manquantes, mais des trous tournants ne
constituent pas un diagnostic exclusif. Confirmez cela à l'aide des métriques de connexion à la base
de données et des erreurs applicatives.

## Écritures RRD différées

Il existe un mode qui empêche le poller d'écrire dans les fichiers RRD à chaque passe. Les résultats
s'accumulent plutôt dans une table de base de données et sont vidés en masse, soit sur minuterie, soit
lorsqu'un graphique réclame le fichier. Cela substitue un petit nombre de grandes écritures à un grand
nombre de petites écritures.

Deux faits essentiels sur le plan opérationnel :

- Cela est requis lorsque vous disposez de collecteurs de données distants. Il ne s'agit pas d'un
  conseil, mais d'une condition exigée par le logiciel.
- La table tampon est durable et non en mémoire, de sorte que les mesures non vidées survivent à un
  redémarrage. Cela signifie également que vos fichiers RRD ont du retard sur votre base de données.
  Consultez [Sauvegarde et restauration](/fr-ca/guides/back-up-and-restore/) avant de prendre un instantané.

La file d'attente principale en vol `poller_output` est également en InnoDB dans cette révision. La
vérification préalable du stockage refuse une file d'attente MEMORY ; augmenter la limite de table en tas
ne résout pas ce refus. Avec les producteurs arrêtés et une sauvegarde correspondante conservée, convertissez
explicitement une file d'attente inadaptée héritée, puis vérifiez le stockage sous chaque compte de service :

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Il s'agit d'opérations distinctes. Conservez les lignes en attente et surveillez l'espace disque de la
base de données ainsi que l'âge de la file d'attente en plus du nombre de lignes. Consultez
[Mettre à niveau en toute sécurité](/fr-ca/guides/upgrade-safely/) pour la sélection de file d'attente,
les vérifications de confiance des comptes de service et les prérequis de redémarrage.

## Quand passer aux collecteurs distants

Un collecteur de données distant est une seconde machine exécutant le même code avec un identifiant de
collecteur distinct, interrogeant un sous-ensemble d'équipements et renvoyant les résultats à la base
de données centrale.

Basculez vers cette architecture lorsque le goulot d'étranglement se situe du côté de la collecte plutôt
que du stockage :

- Le processeur de l'hôte du poller est saturé pendant une exécution et inactif entre les exécutions.
- La latence d'aller-retour vers un groupe d'équipements domine l'exécution, et ce groupe se trouve
  derrière une seule liaison.
- Un site se situe à l'autre extrémité d'un WAN à travers lequel vous ne souhaitez pas interroger.
- Vous avez besoin d'une collecte sur un site isolé, et vous avez validé la mise en mémoire tampon hors
  ligne ainsi que la récupération pour ce collecteur avant de vous y fier.

Les collecteurs distants ne suppriment pas les limites de la base de données centrale ni les limites
d'écriture RRD. Mesurez la capacité d'ingestion et de vidage centralisée avant d'augmenter le débit de
collecte ; des producteurs supplémentaires peuvent aggraver un arriéré existant.

Chaque collecteur possède ses propres décomptes de processus et de threads, ses propres identifiants
de base de données et un intervalle de synchronisation, qui est de deux heures par défaut. Un outil en
ligne de commande permet de forcer une synchronisation complète plutôt que d'attendre.

L'installation centrale peut répliquer le site web et le code des plugins vers les collecteurs distants
afin qu'ils se mettent à jour eux-mêmes. Cette réplication peut être désactivée si vous déployez le code
d'une autre manière.

## Quelle limite avez-vous atteinte

Utilisez ce tableau pour formuler des hypothèses, puis vérifiez-les au moyen des journaux et des mesures.
Plusieurs limites peuvent survenir simultanément. Les options de Spine restent non validées ici.

| Observation | Limite | Que modifier |
|---|---|---|
| Avertissement de désynchronisation du lanceur, poller par ailleurs rapide | Retard de planification, dépassement antérieur ou interruption de l'hôte | Examiner l'historique des lancements et l'état des processus |
| Temps d'exécution constant, un équipement toujours en retard | Réponses lentes, scripts coûteux ou travail concentré | Chronométrer ses méthodes d'entrée et revoir les délais/réessais |
| Temps d'exécution proportionnel au nombre d'équipements, CPU saturé | Pression CPU sur le collecteur | Mesurer si davantage de processus aident ; envisager l'emplacement du collecteur |
| Temps d'exécution proportionnel au nombre d'équipements, CPU inactif | Attentes réseau, script ou base de données | Mesurer les sources d'attente avant de modifier la concurrence |
| Mesures manquantes sur un ensemble tournant d'équipements | Connexions, délais d'expiration ou autres échecs de collecte | Vérifier les erreurs, les métriques de connexion et les files retenues |
| Temps d'exécution convenable, écritures RRD lentes, disque occupé | Stockage | Écritures RRD différées, ou disque plus rapide |
| Tout est lent, y compris l'interface web | Base de données | Taille du pool tampon, puis ajuster l'hôte de la base de données |

Deux pièges qui méritent d'être signalés.

**Modifier l'intervalle de base n'est pas identique à modifier chaque pas de source de données.**
Harmonisez les profils, les pas des éléments en cache et les définitions de pulsation/pas RRD.
Reconstruire le cache ne redimensionne pas les fichiers RRD existants. Consultez
[Rétention des données](/fr-ca/guides/manage-data-retention/) et
[Temps et intervalles](/fr-ca/concepts/time-and-intervals/).

**Un intervalle plus rapide multiplie tout.** Passer de 300 secondes à 60 ne rend pas le travail
cinq fois moins lourd. Les sources configurées pour cette cadence plus rapide sont collectées plus
souvent ; les sources conservant des pas plus longs n'ont pas besoin de s'exécuter à chaque passe
de base. Mesurez la charge résultante plutôt que de supposer que chaque passe requiert un travail égal.
