---
title: "Prérequis"
description: "Prérequis d’exécution, de stockage et de déploiement pour préparer 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire, en attente de relecture par une personne maîtrisant la langue."
---

Vérifié le 26 octobre 2026 avec la révision de l’application indiquée ci-dessous. Cette référence sert à préparer 2026–2027 ; elle ne constitue pas un engagement de publication ou de prise en charge.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Environnement d’exécution

`main` exige PHP 8.4 ou ultérieur et associe Symfony 7.4 à des points d’entrée historiques. La branche `lts/1.2` a ses propres prérequis. Installez MySQL ou MariaDB, RRDtool et un collecteur PHP ou une compilation compatible de Spine. Pour compiler depuis les sources, utilisez les versions de `mise.toml` avec `mise exec` ; installez les dépendances verrouillées sans les mettre à jour.

## PHP

Le manifeste exige les extensions suivantes en plus de PHP :

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

L’installateur vérifie séparément `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` et `zlib`, entre autres. Sous Unix, il vérifie `posix` et `pcntl` en CLI ; sous Windows, `com_dotnet`. Réussir l’installation ne prouve pas que les prérequis de Composer sont satisfaits. Vérifiez séparément PHP en ligne de commande et sur le serveur web. Définissez `date.timezone` ; l’installateur recommande `memory_limit=400M` et `max_execution_time=60`, ou des valeurs illimitées. L’extension facultative `snmp` permet des requêtes dans le processus ; `gettext` active les catalogues de traduction.

## Base de données

Utilisez une version de MySQL ou MariaDB maintenue par son fournisseur et validez-la avec la révision cible. Les anciens seuils de l’installateur, MySQL 5.6 et MariaDB 10.0, ne prouvent pas une prise en charge pour 2026–2027. Dans `main`, `poller_output`, `poller_output_boost` et `poller_output_realtime` utilisent InnoDB ; certaines tables de coordination utilisent encore MEMORY. Ne convertissez pas toutes les tables vers le même moteur. Remplissez `mysql.time_zone_name` et accordez au compte de l’application un accès SELECT à cette table.

## RRDtool

Configurez le chemin absolu de l’exécutable et faites correspondre la version configurée à celle installée. `DCOUNTER` et `DDERIVE` exigent RRDtool 1.5 ou ultérieur. Le stockage local sous Unix exige des vérifications d’identité POSIX et un `flock` fonctionnel sur les répertoires. Arrêtez les processus d’écriture externes et les démons de cache avant une maintenance exclusive. Le chemin de proxy historique existe, mais ne garantit pas un déploiement validé.

## net-snmp

Installez les outils Net-SNMP si PHP `snmp` est absent ou désactivé. Configurez `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` et `path_snmptrap` avec les chemins des exécutables correspondants. Testez le chemin choisi avec la version SNMP de l’équipement, y compris SNMPv3 sur IPv6 si nécessaire ; l’installateur historique déconseille PHP `snmp` pour cette combinaison.

## Serveur web

Exécutez PHP dans l’environnement web configuré et utilisez TLS. Conservez les routes historiques avec `/app.php/...` ; ne déplacez pas toute la racine web vers `public/` tant que des pages historiques subsistent. Configurez PATH_INFO pour le point d’entrée de compatibilité. Nginx ignore `.htaccess` ; appliquez des règles explicites de refus d’accès aux sources, à la configuration, aux dépendances, aux outils, aux tests, aux secrets et à l’état d’exécution avant le traitement PHP. Faites correspondre le préfixe d’URL à `$url_path`.

## Planification

Utilisez un seul mécanisme de lancement : cron, le Planificateur de tâches ou le service du démon collecteur fourni. Alignez sa fréquence sur l’intervalle de lancement configuré. Les collectes espacées de moins d’une minute s’exécutent dans cet intervalle ; cron seul ne fournit pas cette cadence. Effectuez les vérifications avec le compte du poller, après avoir arrêté le lancement habituel pour éviter les chevauchements.

## Système de fichiers

Accordez uniquement aux comptes nécessaires l’accès aux chemins RRD effectifs, journaux, caches et répertoires d’exécution Symfony. Le répertoire RRD par défaut est `rra/`. Des comptes Unix distincts pour le web et le poller exigent des identifiants numériques explicites dans `rrd_maintenance_trusted_uids` et, pour les groupes ayant un droit d’écriture, `rrd_maintenance_trusted_gids`, dans `include/config.php`. Chaque membre de ces groupes doit être digne de confiance. Les permissions normales restent applicables ; le stockage accessible en écriture à tous est refusé. Utilisez les mêmes paramètres de confiance pour tous les processus d’écriture et vérifiez les deux comptes avant une mise à niveau.

## Privilèges

Exécutez le processus web et le poller avec des comptes dédiés non privilégiés. ICMP brut exige des privilèges supplémentaires du système d’exploitation ; utilisez des contrôles TCP, UDP ou SNMP s’ils sont indisponibles. N’exécutez pas toute l’application en tant que root pour permettre ping. Windows ne dispose pas de la validation ACL nécessaire à la maintenance destructive des RRD locaux ; les mises à jour ordinaires utilisent des accusés de réception synchrones de RRDtool. Les mesures de débit Unix ne valident pas la capacité Windows.

## À propos de la version de PHP

Pour préparer 2026–2027, PHP 8.4 bénéficie d’une maintenance active jusqu’au 31 décembre 2026 et de correctifs de sécurité jusqu’au 31 décembre 2028. PHP 8.5 bénéficie d’une maintenance active jusqu’au 31 décembre 2027 et de correctifs de sécurité jusqu’au 31 décembre 2029. Ce sont les dates du projet PHP, pas une matrice de compatibilité Kadupul. Testez les nouveaux environnements avec les dépendances verrouillées avant leur adoption. Le minimum PHP inférieur de Symfony n’abaisse pas le minimum 8.4 de Kadupul. Revérifiez les calendriers officiels et la révision cible avant le déploiement.

[Réglage de la base de données](/fr/guides/tune-database-performance/) · [Intégration RRDtool](/fr/reference/rrdtool-integration/) · [SNMP](/fr/reference/snmp/) · [Organisation des fichiers](/fr/reference/file-layout/) · [Installation](/fr/start/install/) · [Prérequis de mise à niveau du stockage](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versions PHP prises en charge](https://www.php.net/supported-versions.php)
