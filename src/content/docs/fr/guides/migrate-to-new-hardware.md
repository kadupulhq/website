---
title: Migrer vers un nouveau matériel
description: Déplacer une installation en cours d'exécution vers un autre serveur sans perdre l'historique, dans l'ordre qui préserve la vérifiabilité de chaque étape.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 20
---

:::caution[Comportement hérité du proxy RRDtool]
Le déploiement du proxy RRDtool n'est pas pris en charge dans Kadupul. Utilisez le stockage
RRDtool local (`storage_location = 0`). Les paramètres de proxy, descriptions de protocole
et flux de travail sur cette page documentent un comportement hérité, non un déploiement ou
un chemin de migration pris en charge. Consultez [le proxy RRDtool](/fr/reference/rrdproxy/).
:::

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure
de migration prise en charge pour Kadupul. Testez ces procédures sur une copie
isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr/project/status/).
:::

Une migration est une restauration sur une machine différente de celle dont provient la sauvegarde.
Tout ce qui figure dans [Sauvegarde et restauration](/fr/guides/back-up-and-restore/) s'applique ici ;
cette page aborde uniquement ce qui diffère du fait que la destination n'est pas la source.

Trois éléments diffèrent, et chacun génère son propre mode d'échec.

| Différence | Ce qu'elle casse |
|---|---|
| Chemins différents | Les chemins de fichiers enregistrés dans la base de données et dans le cache du poller |
| Identifiants d'utilisateur et de groupe différents | L'accès aux fichiers et les contrôles de confiance du stockage peuvent échouer |
| Versions d'exécution différentes | Les extensions, le comportement de la base de données et la compatibilité RRD peuvent diverger |

## Avant de toucher à quoi que ce soit

Montez d'abord la machine de destination et amenez-la au point où une nouvelle installation fonctionnerait :
serveur de base de données en cours d'exécution, extensions PHP requises présentes, RRDtool présent,
collecteur sélectionné disponible et serveur web configuré. Maintenez désactivés son poller, ses tâches
planifiées, la réplication distante et les notifications sortantes. N'exécutez pas le programme d'installation.
Vous allez remplacer la base de données, et un schéma à moitié installé est plus difficile à diagnostiquer
qu'un schéma vide.

Faites correspondre exactement la révision de l'application et les dépendances, y compris les modifications
locales et les plugins. La table `version` de la base de données consigne la version du schéma, et non
chaque modification du code source ; faire correspondre cette seule valeur est insuffisant. Une redirection
vers le programme d'installation peut indiquer une discordance de schéma ou une restauration incomplète.
Installez le même code que celui que vous quittez, migrez, confirmez qu'il fonctionne, puis mettez à niveau
dans un second temps selon [Mettre à niveau en toute sécurité](/fr/guides/upgrade-safely/).

Décidez dès maintenant du chemin d'installation. Le garder identique sur les deux machines élimine la
plupart des travaux ci-dessous. Si vous ne pouvez pas le faire, lisez la section sur les chemins avant de commencer.

## Ordre des opérations

Chaque étape valide la précédente, ne modifiez donc pas leur ordonnancement.

1. **Arrêtez tous les producteurs sur la source et la destination.** Arrêtez la collecte planifiée, distante, déclenchée par le web et manuelle, ainsi que la maintenance ; laissez les exécutions en cours se terminer. Ne videz les écritures différées qu'après l'arrêt des producteurs. Préservez les lignes de file d'attente non confirmées avec la sauvegarde correspondante de la base de données et des RRD ; ne les tronquez pas.
2. **Prenez la sauvegarde.** Base de données, arborescence RRD, configuration, capturées ensemble. Les règles de cohérence de [Sauvegarde et restauration](/fr/guides/back-up-and-restore/) constituent tout l'enjeu.
3. **Déplacez l'arborescence RRD.** Voir ci-dessous pour la méthode.
4. **Déplacez la base de données.**
5. **Déplacez le code, la configuration et tout ce vers quoi pointe la configuration.** Cela inclut `plugins/`, `scripts/`, `resource/` et tout fichier local appelé par une méthode d'entrée de données.
6. **Réappliquez la configuration de destination après la restauration finale.** Corrigez les chemins, les points de terminaison de base de données, l'appartenance des services et les paramètres numériques de confiance du stockage.
7. **Reconstruisez le cache du poller.**
8. **Exécutez les vérifications de stockage sous chaque compte de service, puis démarrez la collecte uniquement sur la destination.** Surveillez les fichiers représentatifs et la profondeur de file d'attente conservée.

## Transporter l'arborescence RRD

Un fichier RRD est un fichier binaire dont la structure interne dépend de la manière dont il a été écrit.
Une copie binaire requiert une architecture et un format RRDtool compatibles ; la simple correspondance
des noms de système d'exploitation ou de la taille des mots ne constitue pas une preuve. Une incompatibilité
peut entraîner des erreurs de lecture. Validez les fichiers copiés à l'aide du RRDtool de la destination.

Si vous n'êtes pas certain que les deux concordent, effectuez une conversion au lieu d'une copie. Les
commandes dump et restore propres à RRDtool produisent un format texte portable ; Kadupul utilise en
interne la même paire lorsqu'il doit réécrire une archive.

Sur la source, avec les écrivains arrêtés, utilisez un nouveau répertoire temporaire privé :

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Transférez le fichier XML obtenu de manière sécurisée. Restaurez-le sur la destination vers un nouveau candidat :

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Répétez l'opération pour chaque fichier nécessitant une conversion et vérifiez l'état de sortie de
chaque commande. N'installez pas de vidages partiels ni de candidats non vérifiés. RRDtool documente
le format XML comme le [format de transfert entre architectures](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Vérifiez avant de vous engager dans la méthode la plus lente. Copiez un fichier, exécutez `rrdtool info`
sur celui-ci sur la destination, et comparez le pas, les archives, l'horodatage de dernière mise à jour
et les noms des sources de données. Comparez également les résultats de `fetch` sur un intervalle
peuplé connu. Répétez l'opération pour des structures d'archives représentatives avant de transférer
l'ensemble de l'arborescence, puis vérifiez l'inventaire complet des fichiers. Consultez
[Récupération RRD](/fr/guides/recover-a-corrupted-rrd/) pour la validation des candidats et les exigences d'appartenance.

Quelle que soit la manière dont vous les transportez, préservez rigoureusement la structure des
répertoires. Les sous-répertoires imbriqués sous le répertoire RRA ne sont pas une décoration ;
le chemin de chaque fichier est consigné par source de données, et une arborescence aplatie casse chacun d'eux.

## La base de données

Un vidage et un chargement. Deux points à vérifier de l'autre côté.

Inspectez les jeux de caractères, les classements et les moteurs de stockage des tables restaurées,
et pas seulement les valeurs par défaut du serveur. Préservez les définitions d'origine et vérifiez la
compatibilité avec la version de la base de données de destination avant la bascule.

**Les files d'attente de collecteur ne sont pas des caches jetables.** La file d'attente `poller_output`
actuelle doit impérativement utiliser InnoDB. La vérification préalable du stockage refuse une file
d'attente MEMORY. Conservez ses lignes ainsi que les files boost et temps réel jusqu'à ce que les mesures
soient confirmées ; une sauvegarde RRD peut ne pas contenir encore ces mesures. Ne supposez pas qu'une
table MEMORY restaurée est vide : un vidage logique peut contenir des insertions qui la repeuplent.

Avec les rédacteurs arrêtés et les sauvegardes conservées, une file d'attente héritée non-InnoDB peut
être convertie explicitement :

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Exécutez la vérification du stockage sous chaque compte web et de poller réel. Elle vérifie l'accès
au stockage local et la file d'attente sélectionnée ; réussir en tant que root ne garantit pas l'accès
du service. Les collecteurs distants en ligne ciblent normalement la file principale ; n'utilisez
`--local` que lorsque vous vérifiez intentionnellement leur file d'attente locale. Les autres tables
de runtime/cache nécessitent un plan explicite de préservation ou de reconstruction. Consultez les
[exigences de stockage](/fr/reference/requirements/).

## Chemins sur la destination

C'est ici que les migrations échouent le plus souvent, car la majeure partie de ces paramètres reste
invisible jusqu'au premier cycle de collecte.

**Le chemin RRA.** Les chemins des sources de données standard utilisent le jeton `<path_rra>`.
Dans cette révision, le démarrage déduit `$config['rra_path']` du répertoire de l'application
auquel s'ajoute `/rra` ; il ne s'agit pas d'un paramètre général de base de données permettant de
sélectionner un répertoire local arbitraire. Confirmez le chemin effectif avant de déplacer les fichiers.
Les chemins personnalisés absolus doivent être vérifiés et corrigés individuellement. Préservez les
arborescences de répertoires imbriquées.

**Le cache du poller contient des chemins absolus.** Lorsque le cache est généré, le jeton est développé
et le chemin complet est inscrit dans la ligne du cache. Si vous modifiez le répertoire RRA, le cache
pointe toujours vers l'ancien. Le poller continue de tourner sans rien écrire que vous puissiez trouver.
Reconstruisez-le.

```sh
php cli/rebuild_poller_cache.php
```

**Paramètres contenant des chemins.** Chacun d'eux est stocké dans la base de données, donc chacun
arrive de l'ancienne machine en pointant vers l'organisation de l'ancienne machine. Vérifiez-les tous
avant la première exécution : le binaire RRDtool, le binaire du collecteur et son fichier de configuration,
le binaire PHP, les outils SNMP, les chemins de journaux, la police par défaut et le répertoire de
sauvegarde de suppression des pointes. Passez également en revue les chemins et variables d'environnement
dans les fichiers de configuration, les unités de service, les tâches planifiées et le serveur web.

**Les méthodes d'entrée de données contiennent des lignes de commande.** Elles utilisent un jeton
pour la racine d'installation, de sorte qu'un déplacement qui conserve l'organisation des répertoires
ne requiert rien. Un déplacement qui la modifie exige que chaque entrée soit vérifiée. La même règle
s'applique aux fichiers XML de ressources derrière les requêtes de données.

**Les collecteurs distants disposent de leur propre fichier de configuration**, contenant leurs propres
identifiants de base de données et leur propre identifiant de collecteur. Ils ne figurent pas dans le
vidage central. Si la base de données centrale a changé d'hôte, mettez à jour les points de terminaison
concernés et validez la connexion de chaque collecteur. La réplication complète est une opération distincte,
exécutée sur le collecteur principal uniquement lorsque des collecteurs distants activés sont configurés :

```sh
php cli/poller_replicate.php
```

Sans collecteur distant activé, cette commande se termine par une erreur. Ne l'ajoutez pas à une
migration à collecteur unique en tant que vérification de succès requise. Validez la configuration et la
réplication distantes avant d'autoriser la reprise de la collecte distante.

## Appartenance et permissions

Le poller écrit les fichiers RRD sous le compte qui l'exécute. L'interface web les lit sous le compte
du serveur web. Une copie qui a préservé les identifiants numériques entre des machines ayant des
entrées `/etc/passwd` différentes vous laisse avec des fichiers appartenant au mauvais compte.

Des graphiques qui s'interrompent au moment de la migration peuvent signaler des problèmes de permissions,
des chemins obsolètes, une collecte absente, des horodatages erronés ou des mesures rejetées. Inspectez
les journaux du poller et les files d'attente conservées avant de choisir une réparation ; le graphique
seul ne permet pas d'en identifier la cause.

Vérifiez l'appartenance du répertoire RRA lui-même et des sous-répertoires imbriqués, et pas seulement
d'un fichier d'échantillon. De nouveaux fichiers sont créés dans ces répertoires pendant la collecte,
de sorte qu'un répertoire dans lequel le poller ne peut pas écrire échouera pour les sources de données
qui n'existaient pas au moment de la migration, même si les fichiers existants ne posent aucun problème.
Remappez `rrd_maintenance_trusted_uids` et `rrd_maintenance_trusted_gids` dans `include/config.php`
selon les identités numériques réelles de la destination et vérifiez les répertoires parents de confiance.
Consultez les [exigences de stockage](/fr/reference/requirements/).

## Bascule avec perte minimale

Un RRD rejette les mises à jour situées à son horodatage de dernière mise à jour ou avant. Cela limite
le rejeu ; cela ne prouve pas que chaque migration doive perdre des mesures. L'étendue du trou dépend
des temps d'échantillonnage, de la durée d'indisponibilité et des mesures en file d'attente qui ont été
préservées. Cette procédure fait appel à un propriétaire de collecte unique et ne fusionne pas
l'historique de répétition collecté indépendamment dans l'ensemble d'archives final.

1. Effectuez une répétition complète à l'avance avec une sauvegarde de la veille. Copiez l'ensemble, corrigez chaque chemin et testez les mises à jour sur des équipements de test isolés avec les notifications désactivées. Consignez les modifications de la destination sous la forme d'une procédure répétable. Arrêtez les écrivains de la répétition une fois les tests terminés.
2. Maintenez la répétition isolée. Remplacez sa base de données et ses RRD par la sauvegarde finale appariée ; ne mélangez pas les lignes de répétition ou les mesures en file d'attente dans cette restauration.
3. Pour la bascule, arrêtez les producteurs sources et videz ou préservez les mesures en attente, puis capturez et transférez la sauvegarde finale. Réappliquez les surcharges de la destination : restaurer la base réintroduit les chemins sources dans `settings`, et restaurer les fichiers de configuration peut également remplacer les points de terminaison de répétition et les paramètres de confiance.
4. Reconstruisez le cache du poller, exécutez les vérifications de stockage, vérifiez l'inventaire des fichiers et n'activez la collecte de destination qu'une fois ces vérifications réussies.

Mesurez la durée de la répétition et prévoyez du temps pour la validation et le retour arrière. Maintenez
la source arrêtée jusqu'à ce que la bascule réussisse ou qu'un retour arrière contrôlé la désigne à nouveau
comme propriétaire de la collecte.

## Vérifier dans cet ordre

1. L'interface web se charge sans redirection vers le programme d'installation. Examinez les discordances de code/schéma, la connectivité à la base ou une restauration incomplète si elle redirige.
2. Un équipement de test répond à une nouvelle tentative de collecte ; un état "up" restauré seul peut être obsolète.
3. L'heure de dernière mise à jour d'un fichier RRD avance après le premier cycle de collecte. Vérifiez le fichier sur le disque, non le graphique.
4. Un graphique tracé sur la dernière heure montre une ligne continue et aucun vide.

Si l'étape 3 échoue, inspectez les chemins, les permissions, la vérification préalable du stockage,
la profondeur de la file d'attente et les erreurs RRDtool. Si l'étape 4 échoue, inspectez les valeurs
conservées, les définitions de graphique, la plage horaire sélectionnée et l'accès du compte web. Un seul
fichier réussi ne valide pas chaque équipement, méthode d'entrée de données ou collecteur distant.

## Pièges

**N'exécutez pas les deux installations sur la même arborescence RRD.** Deux pollers écrivant dans
les mêmes fichiers génèrent des mises à jour rejetées et des trous, non des données fusionnées.

**Ne restaurez pas une ancienne arborescence RRD sur une base de données plus récente.** Les fichiers
ne se complèteront pas rétroactivement. La collecte reprend à l'heure actuelle et l'intervalle entre les
deux devient un trou permanent.

**La sauvegarde contient les identifiants des équipements en texte brut.** Changer de matériel signifie
que ces identifiants transitent sur un réseau et résident sur deux machines. Restreignez l'accès à la
sauvegarde et chiffrez le transfert. Conservez la copie protégée de retour arrière jusqu'à ce que la
recette et la politique de conservation autorisent le déclassement ; ne la supprimez pas pendant la bascule.

**Les tables des plugins sont dans la base de données ; le code des plugins ne l'est pas.** Restaurer
la base de données sans le code des plugins correspondant et leurs dépendances peut endommager les
pages, hooks ou tâches des plugins. Vérifiez explicitement chaque plugin requis.

**Le stockage proxy existant sort du cadre de cette procédure de migration.** Le déploiement de proxy
n'est pas pris en charge. Localisez et sauvegardez les fichiers RRD réels, puis validez une migration
séparée vers un stockage local sur une copie isolée. Un répertoire `rra/` local peut ne contenir que des reliquats.

**Déclassez l'ancienne machine en dernier, et pas le jour même.** Laissez-la éteinte ou avec tous les
producteurs désactivés, et conservez sa sauvegarde appariée jusqu'à ce que les vérifications requises
de collecte, de graphiques, de collecteurs distants et de plugins du nouveau système réussissent. Définissez
la période d'observation en fonction des charges de travail et de la politique de retour arrière ; un
seul cycle d'archive le plus court ne prouve pas que chaque sous-système fonctionne.
