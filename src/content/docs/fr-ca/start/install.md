---
title: Installation
description: Ce dont Kadupul a besoin pour fonctionner et l'ordre dans lequel assembler les éléments.
sidebar:
  order: 2
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire, en attente de relecture par une personne maîtrisant la langue.
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure de migration prise en charge pour Kadupul. Testez ces procédures sur une copie isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr-ca/project/status/).
:::

Suivez ces étapes une par une, dans l'ordre. Chaque étape se termine par une vérification. Effectuez la vérification avant de continuer : chaque problème listé ici est facile à détecter maintenant, mais coûteux à corriger après une semaine de fonctionnement du collecteur.

## Ce dont vous avez besoin au préalable

Kadupul est une application PHP qui stocke sa configuration dans MySQL ou MariaDB et ses mesures dans des fichiers RRD sur le disque. Cette page décrit une nouvelle installation sur un serveur principal à partir du code source `main` actuel, et non une mise à niveau ou la branche LTS archivée. Quatre éléments doivent exister avant qu'elle ne puisse fonctionner.

| Composant | Pourquoi il est nécessaire |
|---|---|
| PHP 8.4 ou plus récent, sur une version bénéficiant des mises à jour de sécurité | Exécute l'interface web et le collecteur |
| MySQL ou MariaDB | Contient les appareils, les modèles, les utilisateurs et le cache du collecteur |
| RRDtool | Crée et met à jour les archives circulaires, et génère les graphiques |
| net-snmp | Fournit les outils clients et les bibliothèques utilisés pour interroger les appareils |

PHP nécessite également les extensions requises par [le manifeste de l'application](https://github.com/kadupulhq/kadupul/blob/main/composer.json), notamment `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix` et `sqlite3`. Installez-les à la fois pour la ligne de commande et pour les environnements d'exécution web. [Exigences](/fr-ca/reference/requirements/) distingue les exigences de Composer des vérifications distinctes de l'installateur.

## Étape 1 : installer l'environnement d'exécution

Installez PHP avec ses extensions, votre serveur de base de données, RRDtool et net-snmp à partir des paquets de votre distribution.

**Vérifiez-le.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` doit lister les extensions requises. L'extension PHP `snmp` est facultative lorsque les outils en ligne de commande de net-snmp sont disponibles. Composer vérifie ses propres extensions requises lors de l'installation des dépendances ; l'installateur web dispose d'une vérification d'extensions distincte. Une solution de secours à l'exécution ne supprime pas une exigence de Composer.

Les configurations PHP de la ligne de commande et du serveur web peuvent différer. Vérifiez les deux. L'installateur recommande un `memory_limit` d'au moins 400M et un `max_execution_time` d'au moins 60 secondes ; il accepte également leurs valeurs illimitées (`-1` et `0`, respectivement). Les valeurs inférieures à ces recommandations génèrent des avertissements, tandis qu'un `date.timezone` manquant constitue une erreur. Définissez un fuseau horaire explicite, tel que `UTC`, et utilisez `php --ini` pour identifier la configuration de la ligne de commande.

## Étape 2 : créer la base de données et son utilisateur

Créez une base de données vide, ainsi qu'un utilisateur disposant des droits sur cette base de données. Pour une base de données locale, exécutez ces commandes SQL en tant qu'administrateur de base de données, en remplaçant le mot de passe d'exemple avant utilisation :

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Utilisez l'hôte de compte de base de données correspondant si PHP se connecte depuis une autre machine.

Le serveur de base de données doit également avoir ses tables de fuseaux horaires remplies, et l'utilisateur Kadupul a besoin d'un accès en lecture à celles-ci, dans la base de données `mysql`. Il s'agit du seul privilège accordé en dehors de son propre schéma. Rien dans un système de surveillance ne laisse deviner cela, et ce n'est pas facultatif ; la vérification ci-dessous échouera sans cela.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Vérifiez-le.** Connectez-vous en tant qu'utilisateur de base de données de Kadupul et exécutez :

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Un résultat non nul renvoyé sans erreur d'autorisation est ce que vous attendez. Un zéro signifie que les tables n'ont jamais été chargées ; une erreur signifie que l'utilisateur ne peut pas les lire. Les deux arrêtent l'installateur.

Quatre des paramètres propres au serveur ont une importance suffisante pour être corrigés dès maintenant.

| Paramètre | Valeur souhaitée | Pourquoi |
|---|---|---|
| `max_allowed_packet` | 16M ou plus | Synchronisations volumineuses entre le serveur principal et les collecteurs distants |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Les descriptions d'appareils contiennent des caractères multi-octets |
| `innodb_file_per_table` | Activé | Maintient les espaces de tables séparés et gérables |
| `innodb_buffer_pool_size` | Environ un quart de la mémoire système | Conserve le jeu de données actif en mémoire |

L'installateur affiche sa propre lecture de ces paramètres et signale ce qui est insuffisant, vous n'avez donc pas à faire aveuglément confiance au tableau. [Optimiser les performances de la base de données](/fr-ca/guides/tune-database-performance/) va plus loin une fois que vous avez de la charge.

## Étape 3 : décompresser l'application, corriger les permissions et la servir

Placez l'application dans un emplacement que votre serveur web peut servir, puis décidez quel utilisateur système en est le propriétaire. Cette décision importe plus que l'emplacement. Deux processus écrivent ici : le serveur web, et le mécanisme qui planifie le collecteur. Exécutez les deux sous le même utilisateur. Exécutez le collecteur sans privilèges et donnez aux deux processus les accès dont ils ont besoin. Des droits de propriété ou des permissions incorrects peuvent empêcher les mises à jour ultérieures, même lorsque les graphiques s'affichent correctement.

### Si vous avez cloné le dépôt au lieu de décompresser une version

Une extraction Git nécessite à la fois les dépendances PHP et les ressources de navigateur générées. Une fois les environnements d'exécution du fichier `mise.toml` du dépôt installés, exécutez depuis la racine du dépôt :

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer remplit `include/vendor/` et restaure les fichiers de compatibilité verrouillés. La compilation npm crée les ressources sous `include/js/`, `include/fa/` et `include/vendor/flag-icons/`. Composer seul ne suffit pas pour une installation depuis les sources.

Une archive autonome complète hors ligne avec toutes ses dépendances constitue un artefact de compilation distinct. Une archive de sources générique GitHub n'est pas cette archive. Suivez la [procédure de compilation et de vérification hors ligne](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) lorsque l'hôte cible n'a pas accès à Internet.

Préparez les chemins accessibles en écriture après avoir installé les dépendances :

| Groupe | Répertoires | Accessible en écriture quand |
|---|---|---|
| Pendant l'installation | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Uniquement pendant l'installation ou la mise à niveau |
| Pendant l'installation | `include/vendor/csrf/`, ou l'emplacement configuré pour `path_csrf_secret` | L'installateur doit créer le secret propre à l'installation ; conservez-le ensuite |
| Toujours | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, le répertoire temporaire du système | Pendant toute la durée de vie de l'installation |
| Environnement d'exécution Symfony | `var/cache`, et `var/log` si la journalisation dans des fichiers est configurée | Pour l'environnement d'exécution PHP et l'utilisateur qui préchauffe le cache |

Le répertoire RRD doit également être accessible en écriture pendant toute la durée de vie de l'installation. Il contient votre historique, alors accordez-lui la même attention qu'à un répertoire de base de données.

La migration actuelle nécessite toujours les routes de connexion, de l'installateur et des extensions historiques. Pour cette installation combinée, servez la racine du dépôt avec des règles explicites qui refusent l'accès aux répertoires privés, à la configuration, aux dépendances et à l'état d'exécution. Ne basculez pas toute l'installation vers `public/` : cela supprimerait les routes historiques toujours utilisées. Le point de terminaison distinct de Symfony utilise un routage différent ; consultez les [instructions de migration](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Pour Nginx, partez des [règles de localisation Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) du dépôt, en adaptant la racine et l'amont PHP-FPM. Placez les règles d'interdiction avant le traitement générique de PHP et préservez PATH_INFO pour `/app.php/...`. Nginx ne lit pas `.htaccess`. Gardez les fichiers RRD, les journaux et les secrets inaccessibles via HTTP ; vérifiez la configuration réelle du serveur au lieu de supposer que les permissions des fichiers empêchent de les servir.

**Vérifiez-le.** Prenez l'identité de l'utilisateur du collecteur, écrivez un fichier dans chaque répertoire du groupe permanent, puis supprimez-le. Une permission qui paraît correcte dans `ls -l` peut toujours être refusée par SELinux ou AppArmor, et l'écriture du fichier est la seule vérification qui couvre ce point. Demandez ensuite un fichier du répertoire de journaux via HTTP. Vous devez obtenir un refus.

## Étape 4 : rédiger le fichier de configuration

Pour une nouvelle installation, copiez le fichier de configuration distribué :

```bash
cp include/config.php.dist include/config.php
```

N'écrasez pas la configuration d'une installation existante. Définissez l'hôte, le nom, l'utilisateur et le mot de passe de la base de données à partir de l'étape 2. Deux autres valeurs sont importantes lors d'une première installation : `url_path`, le chemin sous lequel l'application est servie avec des barres obliques de début et de fin, et `poller_id`, qui vaut `1` sur un serveur principal et une autre valeur uniquement sur un collecteur distant.

Laissez le bloc du collecteur distant commenté. Vous n'en construisez pas encore un ; [Collecte de données distante](/fr-ca/concepts/remote-data-collection/) aborde ce sujet le moment venu. Tous les autres paramètres possèdent une valeur par défaut fonctionnelle, lisez donc [Configuration](/fr-ca/reference/configuration/) avant de modifier l'un d'eux.

Configurez une clé `APP_SECRET` propre au déploiement dans l'environnement du processus PHP pour les fonctionnalités Symfony qui l'utilisent. L'amorçage utilise par défaut `APP_ENV=prod` et `APP_DEBUG=0` et ne charge pas les fichiers `.env`. Cela est indépendant du secret CSRF de l'installateur historique.

**Vérifiez-le.** Vérifiez la syntaxe sans afficher les identifiants :

```bash
php -l include/config.php
```

Importez le schéma à l'étape suivante avant d'ouvrir l'installateur dans un navigateur.

## Étape 5 : importer le schéma

L'installateur s'attend à ce que les tables existent déjà. Chargez le schéma fourni dans la base de données que vous avez créée :

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Effectuez cette opération une seule fois, sur une base de données vide. Il ne s'agit pas d'un script de mise à niveau ; l'importer dans une base de données déjà peuplée peut échouer ou laisser des données conflictuelles et partielles.

## Étape 6 : exécuter l'installateur

Ouvrez le site dans un navigateur et suivez les étapes. L'installateur suit une séquence fixe, et chaque étape conditionne la suivante :

1. Bienvenue et licence.
2. Vérification des dépendances : version de PHP et extensions, paramètres PHP de l'étape 1 pour la ligne de commande et le serveur web, tables de fuseaux horaires et paramètres de base de données de l'étape 2. Les erreurs bloquent le bouton suivant. Les avertissements ne le bloquent pas, mais lisez-les.
3. Type d'installation : un nouveau serveur principal ou un collecteur distant.
4. Vérification des permissions : les répertoires de l'étape 3, testés en y écrivant.
5. Emplacement des binaires : les chemins vers PHP, RRDtool et les outils net-snmp.
6. Profil de source de données et intervalle de lancement.
7. Sélection des modèles : quels modèles d'appareils charger.
8. Conversion des tables, confirmation et installation proprement dite.

L'élément 6 de cette liste est celui qu'il est difficile d'annuler. Le profil sélectionné détermine le pas et l'ensemble d'archives écrits dans chaque fichier RRD créé par la suite, et modifier le profil ne migre pas les fichiers existants. Les modifications de rétention nécessitent une migration distincte et testée ; elles n'exigent pas toujours d'abandonner l'historique. Si les pics comptent pour vous, assurez-vous que le profil conserve les maximums et pas seulement les moyennes : lisez [Sources de données et archives circulaires](/fr-ca/concepts/data-sources-and-rras/) avant de cliquer pour continuer. L'intervalle de lancement proposé est d'une minute ou de cinq minutes. Le profil de source de données définit l'intervalle de collecte ; le lanceur et le profil doivent être configurés de manière cohérente.

## Étape 7 : modifier les identifiants par défaut

Le schéma fourni initialise un compte administrateur nommé `admin` avec le mot de passe `admin`, configuré de sorte que la première connexion force un changement. Il initialise également un compte invité désactivé. Modifiez le mot de passe avant que l'instance ne soit accessible à quiconque d'autre, c'est-à-dire avant de la connecter à un réseau vers lequel d'autres personnes peuvent router du trafic.

## Étape 8 : planifier le collecteur

Le collecteur doit être démarré depuis l'extérieur. Configurez son intervalle de collecte et son intervalle de lancement de manière cohérente ; le collecteur prend en charge des intervalles de lancement d'une minute ou de cinq minutes et dispose d'une protection contre les exécutions ordinaires arrivant trop tôt. Pour un lancement chaque minute, installez cette entrée dans la crontab de l'utilisateur non privilégié du collecteur, en remplaçant `php` et le chemin de l'application par leurs chemins absolus :

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

ou exécutez le démon fourni `cactid.php` à l'aide de `service/cactid.service`, adapté pour votre chemin d'installation et votre utilisateur non privilégié. N'utilisez qu'un seul lanceur : désactivez la tâche cron ou le timer lorsque vous utilisez le démon.

Faites correspondre la planification réelle à l'intervalle de lancement configuré. Pour les profils de collecte inférieurs à la minute, le collecteur lancé exécute des cycles de collecte à l'intérieur de cet intervalle ; n'essayez pas d'exprimer une cadence inférieure à la minute avec cette entrée cron.

**Vérifiez-le.** Exécutez un cycle manuellement sous l'utilisateur du collecteur :

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` contourne la protection temporelle contre les exécutions prématurées. Utilisez cette vérification manuelle avec le planificateur arrêté afin qu'elle ne chevauche pas une exécution planifiée. Elle ne contourne pas les autres vérifications de maintenance ou de sécurité. Vous devez obtenir une fin d'exécution propre avec une ligne de résumé. Activez ensuite le planificateur et laissez-le tourner pendant deux intervalles ; confirmez qu'une autre exécution a eu lieu sans vous.

## Les problèmes fréquents

Voici les dysfonctionnements qu'une première installation rencontre en pratique.

| Symptôme | Cause | Où chercher |
|---|---|---|
| L'installateur bloque sur des paramètres PHP qui semblent corrects | Le serveur web et la ligne de commande lisent des fichiers `php.ini` différents | `php --ini`, et le fichier indiqué par la SAPI web |
| L'installateur bloque sur les fuseaux horaires | Les tables de fuseaux horaires ne sont pas chargées, ou l'utilisateur Kadupul ne peut pas les lire | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| L'étape des permissions échoue sur un répertoire qui semble accessible en écriture | Mauvais propriétaire, ou SELinux et AppArmor | Écrire un fichier avec le compte du collecteur |
| L'installation se termine, mais aucune donnée n'arrive jamais | Le collecteur n'a jamais été planifié | Exécuter `poller.php --force --debug` à la main |
| Des données pendant quelques cycles, puis plus rien | Le collecteur s'exécute sous le mauvais utilisateur, laissant des fichiers que l'utilisateur web ne peut pas mettre à jour | Propriétaire des fichiers dans le répertoire RRD |
| Graphiques remplis de petits trous | L'intervalle planifié et l'intervalle configuré ne concordent pas | La crontab, par rapport à l'intervalle configuré |
| Composer refuse l'installation | PHP est antérieur à 8.4 ou une extension requise par le manifeste est manquante | `php -v`, `php -m`, et la sortie d'erreur de Composer |
| Le collecteur ne peut pas exécuter plus d'un processus | `pcntl` ou `posix` manquant | `php -m` |

[Journalisation](/fr-ca/reference/logging/) explique où chaque élément enregistre ses journaux. [Dépanner les données manquantes](/fr-ca/guides/troubleshoot-missing-data/) traite le cas où l'installation fonctionne mais où un appareil spécifique ne répond pas.

## Avant d'exposer l'application

Le collecteur s'exécute en tant qu'utilisateur système et exécute RRDtool ainsi que vos scripts de collecte. Traitez l'installation comme quelque chose qui exécute des commandes, car c'est le cas.

- Servez-la via TLS.
- Ne laissez pas le mot de passe administrateur par défaut en place, même brièvement.
- Limitez l'utilisateur de base de données à sa propre base.
- Conservez les répertoires RRD et de journaux en dehors de la racine des documents web.
- Laissez le compte invité désactivé à moins que vous n'en décidiez autrement.

[Sécuriser une installation exposée à Internet](/fr-ca/guides/secure-an-internet-facing-install/) contient le reste des recommandations. Ensuite : [Ajouter votre premier appareil](/fr-ca/start/first-device/).
