---
title: Architecture
description: Les quatre éléments mobiles, et lequel est généralement en cause.
sidebar:
  order: 1
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
---

:::caution[Comportement hérité du proxy RRDtool]
Le déploiement du proxy RRDtool n'est pas pris en charge dans Kadupul. Utilisez le stockage RRDtool local
(`storage_location = 0`). Les paramètres de proxy, les descriptions de protocole et les flux de travail
sur cette page documentent un comportement hérité, non une méthode de déploiement ou de migration prise en charge.
Consultez le [Proxy RRDtool](/fr/reference/rrdproxy/).
:::

L'application web, la base de données, la collecte planifiée et le stockage RRD de Kadupul ont
des rôles différents, mais leurs chemins d'exécution se recoupent. Savoir quelle opération a échoué
aide à orienter l'investigation ; une interface fonctionnelle ne prouve pas que la collecte fonctionne.

**L'interface web** est une application PHP. Elle gère la configuration et génère ou
fournit les graphiques mis en cache. Certaines actions web déclenchent également la collecte, telles que
les requêtes de graphiques en temps réel, et les requêtes ordinaires de graphiques peuvent déclencher des mises à jour RRD en attente.

**La base de données** contient la configuration, les autorisations, l'état opérationnel, le cache du poller
et les files d'attente de mesures. Les valeurs collectées peuvent y demeurer en attendant une écriture RRD
ou une nouvelle tentative ; ce n'est pas seulement un magasin de configuration.

**Le poller** coordonne le travail planifié et les processus collecteurs enfants. Les résultats transitent
par les files d'attente de la base de données avant que le writer normal ou différé ne mette à jour les fichiers RRD.

**Les fichiers RRD** conservent des séries chronologiques délimitées. Une source de données possède normalement un RRD
contenant ses champs ; la création de graphiques peut réutiliser des sources, et la création de métadonnées
ne garantit pas que le fichier existe déjà.

## Les frontières

| Frontière | Ce qui la traverse | Acheminé par |
|---|---|---|
| Interface vers la base de données | Configuration, sessions, autorisations, travail mis en cache et données opérationnelles | SQL ; la base de données peut être distante |
| Interface vers les fichiers | Lectures de graphiques, images en cache et mises à jour ou créations RRD à la demande éligibles | Système de fichiers et RRDtool |
| Poller vers la base de données | Listes de tâches, valeurs collectées, files d'attente conservées, états et comptes à rebours | SQL |
| Collecte vers les périphériques | SNMP, scripts de collecte et vérifications d'accessibilité | Commandes réseau ou locales ; une collecte déclenchée par le web est également possible |
| Writer vers les fichiers | Échantillons groupés, potentiellement plusieurs horodatages par mise à jour | Commandes RRDtool et canaux acquittés |
| Serveur de base de données vers fichiers RRD | Aucune mise à jour RRD directe dans le parcours applicatif normal | Le code du writer applicatif coordonne les deux stockages |

Les lignes de la base de données associent une source de données à un périphérique et à son chemin de fichier configuré.
Les fichiers RRDtool décrivent les séries et les archives ; ils ne remplacent pas cette correspondance applicative.
Le trafic réseau ne se limite pas à l'interrogation des périphériques : les connexions à la base de données, les collecteurs
distants et d'autres intégrations configurées peuvent également traverser les hôtes.

Sauvegardez l'état de la base de données, les échantillons en attente et les fichiers RRD de manière cohérente. Une restauration
de la seule base de données ne restaure pas l'historique RRD, et une restauration des seuls fichiers
omet la configuration et les échantillons non vidés. Déplacer des fichiers sans concilier les chemins
peut provoquer des erreurs de fichiers manquants ou bloquer des écritures ; ce n'est pas
systématiquement un échec silencieux de la collecte. Consultez [Sauvegarder et restaurer](/fr/guides/back-up-and-restore/) et
[Migrer vers un nouveau matériel](/fr/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Pourquoi l'historique à long terme utilise des fichiers RRD

L'historique des graphiques à long terme est stocké dans les RRD, mais les files d'attente de mesures résident dans la base de données.
La file d'attente normale en cours de traitement utilise InnoDB dans cette version, et les écritures différées
conservent les échantillons dans des tables Boost. Les écritures ayant échoué ou les livraisons distantes retardées peuvent grossir ces
files d'attente. Consultez [Écritures à volume élevé](/fr/concepts/high-volume-writes/).

Un fichier RRD alloue un nombre défini de lignes aux résolutions sélectionnées. Les mises à jour ordinaires
réutilisent cet espace au lieu d'ajouter indéfiniment de l'historique. La taille du fichier est délimitée
pour une structure inchangée ; ajouter des sources de données, modifier les structures, conserver des copies de récupération
ou accumuler des files d'attente augmente toujours les besoins totaux de stockage.

Le compromis réside dans une rétention choisie à l'avance. Une fois que l'historique détaillé a expiré ou
a été consolidé, une modification ultérieure de structure ne peut pas recréer les détails éliminés. Consultez
[Sources de données et archives round-robin](/fr/concepts/data-sources-and-rras/).

La configuration et l'état opérationnel utilisent la base de données car l'application nécessite des mises à jour partagées
et des requêtes relationnelles. Cela ne signifie pas que chaque relation est appliquée par une clé étrangère
dans la base de données, ni qu'un stockage en lignes croît nécessairement à l'infini ;
cela décrit la séparation des responsabilités de cette application.

## Deux chemins partageant deux parties

Une requête normale de page ou de graphique suit généralement ce chemin :

1. Un navigateur envoie une requête ; PHP charge la configuration et se connecte à la base de données.
2. La requête applique l'authentification et l'autorisation appropriée au domaine et aux objets.
3. Les actions de la console lisent ou mettent à jour la configuration et peuvent déclencher des tâches supplémentaires.
4. Une requête de graphique peut vérifier les échantillons Boost en attente et un cache d'images, ou assembler
   une commande RRDtool et lire les fichiers configurés. Consultez
   [Comment les graphiques sont dessinés](/fr/concepts/how-graphs-are-drawn/).
5. Les requêtes de graphiques en temps réel peuvent lancer le collecteur temps réel et utiliser des données
   temporaires distinctes. Un graphique plat ne prouve pas à lui seul un fichier vide ou la réussite
   de la collecte et du rendu.

Un cycle de collecte planifié suit généralement ce chemin :

1. Le planificateur démarre le poller, qui vérifie l'état d'activation, le temps et le stockage.
2. Il sélectionne les tâches échues dans le cache du poller et lance les processus collecteurs enfants.
3. Les enfants interrogent les périphériques ou exécutent des scripts de collecte et déposent les résultats dans la base de données.
4. Le writer concerné traite les échantillons groupés, en utilisant des files d'attente différées si elles
   sont configurées et en conservant les échecs pouvant être retentés.
5. L'état opérationnel et l'état de planification sont mis à jour dans la base de données.

Consultez [Cycle de vie du poller](/fr/reference/poller-lifecycle/) pour l'ordonnancement et la gestion des erreurs.
Ces chemins partagent les ressources de base de données et de stockage et peuvent entrer en concurrence. Redémarrer
le serveur web ne répare pas un poller planifié séparément, mais les requêtes web peuvent participer à la collecte
et à l'écriture ; diagnostiquez le processus réellement défaillant.

## Ce qui s'exécute sous quel utilisateur

| Processus | S'exécute sous | Démarré par |
|---|---|---|
| Application web PHP | Compte du serveur web ou du pool PHP-FPM | Serveur web |
| Poller planifié | Compte configuré du planificateur | cron, Planificateur de tâches ou service configuré |
| RRDtool | Hérite normalement du compte du processus initiateur | Chemin web, du poller ou de maintenance |
| Scripts de collecte | Héritent normalement du compte de leur collecteur | Collecte planifiée ou déclenchée par le web |

Tous les comptes d'écriture participants doivent disposer d'un accès approprié au stockage configuré.
La création normale d'une source de données écrit des métadonnées ; le RRD peut être créé plus tard lorsqu'un
writer en a besoin. Un fichier manquant peut indiquer que la collecte n'a pas atteint ce stade,
tout comme une erreur de chemin, de confiance, de permission ou de création.

Certains chemins de création exécutés sous root tentent d'appliquer le propriétaire et le groupe du répertoire RRA.
Ces tentatives peuvent échouer et consigner des erreurs ; elles ne remplacent pas la configuration correcte
des comptes de service. L'appartenance non-root obéit aux règles du système d'exploitation, y compris l'héritage
de groupe des répertoires et les listes de contrôle d'accès (ACL). Validez les permissions de stockage et les réglages
numériques de confiance UID/GID pour chaque compte d'écriture web et poller. Consultez [Mettre à niveau en toute sécurité](/fr/guides/upgrade-safely/).

L'implémentation ICMP PHP examinée appelle l'utilitaire ping du système d'exploitation.
Sa capacité à envoyer des sondes dépend de cet utilitaire et des règles du système d'exploitation ; la présence
de routines héritées d'UID effectif ne signifie pas que chaque sonde ICMP élève PHP au rang de root.
N'exécutez pas l'application en tant que root uniquement pour autoriser le ping. Vérifiez la commande réelle,
le compte et les messages d'erreur ; les vérifications TCP ou UDP ont des sémantiques d'accessibilité différentes.

## La liste de travail est précalculée

Le cache du poller stocke les tâches de collecte résolues afin que chaque cycle n'ait pas à déduire chaque
commande des relations de modèles. Les opérations de configuration peuvent reconstruire les entrées
affectées ; des outils explicites de reconstruction sont disponibles si nécessaire.

Les modifications répercutées dans les champs en cache doivent atteindre ces entrées avant que la collecte
ne les utilise. D'autres paramètres sont lus séparément, de sorte que chaque changement de configuration n'exige
pas une reconstruction manuelle du cache. Inspectez le contenu du cache, les erreurs de collecte et l'état
de réplication distante plutôt que de supposer une cause unique. Consultez [Le cache du poller](/fr/concepts/the-poller-cache/) et
[Collecte de données à distance](/fr/concepts/remote-data-collection/).

## Où les pannes se produisent généralement

| Symptôme | Vérifications utiles |
|---|---|
| L'interface fonctionne, les graphiques sont plats | Exécution du planificateur, erreurs de collecte, files d'attente, fraîcheur des échantillons et fenêtre de graphique |
| Le poller s'exécute, les fichiers n'évoluent pas | Acquittements/erreurs du writer, confiance et permissions du stockage, arriéré différé |
| Une seule source de données est plate | Réponse du périphérique, ligne du cache, correspondance du fichier, échantillons inconnus et expressions de tracé |
| Le changement de configuration semble sans effet | Résultat de l'enregistrement, surcharges de modèles, entrées de cache affectées et réplication |
| Lacunes régulières | Synchronisation, heartbeat, délais d'attente, disponibilité du périphérique et échecs d'écriture |
| Forme de graphique inattendue | Commande générée, choix de CDEF/CF, données réelles du fichier, cache d'images et correspondances |
| L'historique d'un port semble associé à une autre interface | Identité de la requête, renumérotation et résultats de réindexation |
| Le compte accède à la console mais à aucun graphique | Domaine de la page de graphiques, autorisation sur les objets et identité demandée du graphique |
| Les collecteurs diffèrent | Affectation, configuration répliquée, surcharges locales et état de la connexion |
| Tout est lent | Attentes de la base de données, contention writer/stockage, durée d'exécution du collecteur et charge web |
| Les métadonnées de la source de données existent mais pas le fichier | Première collecte/écriture, chemin configuré, erreurs de confiance et de création |

Ce sont des points de départ, non des diagnostics. Suivez les éléments probants à travers la frontière concernée
et vérifiez le résultat après une modification. Consultez [Résoudre les données manquantes](/fr/guides/troubleshoot-missing-data/).
