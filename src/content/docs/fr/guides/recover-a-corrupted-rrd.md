---
title: Récupérer un fichier RRD corrompu
description: Comment distinguer une archive round-robin endommagée d'une archive mal configurée, inspecter un fichier, le réparer avec dump et restore, et quel historique conserver si le fichier doit être reconstruit.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 25
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe pas de version ni de chemin de
migration officiellement pris en charge pour Kadupul. Testez ces procédures sur une copie isolée
avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr/project/status/).
:::

Une véritable corruption de fichier est rare. La plupart des fichiers signalés comme corrompus sont intacts et
en désaccord avec la base de données, ou ne peuvent pas être écrits par le poller, ou ont cessé de recevoir
des valeurs pour une raison qui n'a rien à voir avec le fichier. Déterminez dans quel cas vous
vous trouvez avant de toucher à quoi que ce soit, car la réparation pour l'un aggrave les autres.

:::danger[Préserver l'original]
**Copiez le fichier avant chaque réparation mentionnée sur cette page.** Restaurez vers un candidat distinct
et inspectez-le avant de remplacer le fichier en production. Réduire une archive ou en supprimer une
élimine l'historique conservé. Modifier un maximum influe sur la validation ultérieure des entrées ; cela
n'efface pas rétroactivement les échantillons stockés. Il n'existe pas d'annulation automatique dans un RRD.
:::

## 1. Identifier la défaillance

| Ce que vous observez | Signifie généralement | Aller à |
|---|---|---|
| Le graphique affiche une erreur au lieu d'une image | Le fichier est manquant, illisible ou le répertoire n'est pas accessible en écriture | Étape 2 |
| Le graphique est vide mais sans erreur | Aucune valeur utilisable dans la plage sélectionnée, ou problème de définition du graphique | [Dépanner les données manquantes](/fr/guides/troubleshoot-missing-data/) |
| Le graphique s'arrête à un moment précis et ne reprend jamais | Poller, autorisations ou heartbeat | Étape 3 |
| Le graphique contient des données mais l'allure a changé sans modification de configuration | Le fichier et la base de données ne concordent pas | Étape 4 |
| Les valeurs conservées sont toutes inconnues | La collecte, le minutage, les limites ou la configuration de la source de données doivent être vérifiés | [Dépanner les données manquantes](/fr/guides/troubleshoot-missing-data/) |
| `rrdtool` refuse de lire le fichier | Chemin manquant, échec d'accès, format incompatible ou endommagement | Étapes 2 et 3, puis 5 |

Kadupul transforme le premier cas en un message lisible plutôt qu'en une image brisée,
en distinguant un répertoire inaccessible en écriture d'un fichier inaccessible en écriture, et en signalant un
fichier absent comme pouvant signifier que le poller n'a pas encore tourné. Ce message est un indice, non un
diagnostic : une suppression, un chemin modifié ou une restauration incomplète peuvent également en être la cause.

## 2. Inspecter le fichier

Deux vues sont disponibles sur la page propre de la source de données, toutes deux activables par session.
La vue de débogage affiche la commande `rrdtool create` que Kadupul exécuterait pour cette source
de données aujourd'hui. La vue d'informations est celle qui importe ici : elle lit le fichier avec
`rrdtool info`, lit la définition de la source de données dans la base de données et affiche
les différences. Lorsqu'une différence peut être réconciliée sans reconstruction, elle affiche la commande
`rrdtool tune` ou `rrdtool resize` correspondante, sous forme de texte à exécuter
manuellement plutôt que de l'exécuter d'office.

Depuis un shell, la même première étape :

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

L'en-tête indique le pas, l'heure de la dernière mise à jour, chaque nom de source de données avec son type,
son heartbeat, son minimum et son maximum, ainsi que chaque archive avec sa fonction de consolidation, son nombre
de lignes et sa résolution. Si cette commande échoue, conservez l'erreur et vérifiez le chemin,
les autorisations et la compatibilité de RRDtool avant de diagnostiquer une corruption. Une exécution réussie de
`info` lit les métadonnées ; inspectez également la sortie de `fetch` et testez un dump pour vérifier l'historique.

## 3. Vérifier d'abord les causes mécaniques

| Vérification | Pourquoi elle précède la réparation |
|---|---|
| Propriété et mode du fichier | Un fichier créé par root lors d'une maintenance devient impossible à écrire pour le poller à partir de cet instant |
| Propriété et mode du répertoire | Le poller ne peut pas créer de fichier de remplacement dans un répertoire où il ne peut pas écrire |
| Espace libre et inodes | Un système de fichiers plein produit des écritures tronquées qui ressemblent à des corruptions |
| Existence d'un second rédacteur | Des mises à jour concurrentes ou désordonnées peuvent échouer ou invalider un instantané de maintenance ; inspectez les journaux |

Exécutez la maintenance sous le compte qui possède et met à jour le RRD, et préservez son mode,
son propriétaire et son groupe. Arrêtez tous les processus d'écriture avant de copier ou de remplacer des fichiers, y compris les
collecteurs distants, les tâches planifiées et la maintenance manuelle. Ne purgez les écritures en attente qu'après
l'arrêt de leurs producteurs. De simples commandes shell n'acquièrent pas les verrous de stockage de Kadupul.
Consultez les [exigences de stockage](/fr/reference/requirements/) et la procédure de mise en veille dans
[Sauvegarde et restauration](/fr/guides/back-up-and-restore/).

## 4. Lire ce que le vérificateur a déjà trouvé

Kadupul peut vérifier périodiquement les sources de données liées à des graphiques sur les périphériques activés et
enregistrer ses constatations ; il ne s'agit pas d'un inventaire de chaque fichier sur le disque. Cette fonction est désactivée
par défaut. L'interface indique où l'activer : Configuration -> Settings -> Data.

| Paramètre | Valeur par défaut | Effet |
|---|---|---|
| Enable RRDfile Check | off | Rien n'est vérifié tant que cette option n'est pas activée |
| Check Frequency | 4 hours | Propose également 1 hour, 24 hours ou une exécution après chaque cycle boost |
| Number of RRDfile Check Processes | 1 process | Répartit la liste des fichiers sur des processus parallèles |
| RRDChecker Timeout | 1 hour | Le traitement est interrompu au-delà de cette durée |

Les constats s'accumulent dans une liste comportant l'appareil, la source de données, l'identifiant interne de la source
de données, le message et la date. Vous pouvez filtrer par ancienneté et rechercher dans le texte, et
vous pouvez purger la liste une fois que vous l'avez traitée.

Les messages qu'il peut enregistrer et leur signification :

| Message | Signification |
|---|---|
| RRDfile does not exist | Le fichier n'a jamais été créé, a été déplacé ou supprimé, ou le chemin configuré a changé |
| RRDfile is not writable | L'utilisateur du poller ne peut pas écrire dans le fichier |
| RRDfile modify time older than hour | Rien n'a été écrit depuis au moins une heure |
| Last update value in RRDfile is older than 1 hour | L'horodatage de dernière mise à jour du fichier lui-même est périmé, ce qui constitue une preuve plus probante que l'heure de modification |
| The RRDfile step does not match the Data Source Profile step | Le fichier a été créé avec un intervalle différent |
| There are more, or less, Data Sources in the database than in the RRDfile | Le modèle a gagné ou perdu des champs après la création du fichier |
| The Data Source '...' exists in RRDfile, but not in database | Désigne le champ, du point de vue du fichier |
| Data Source name '...' exists in the Database, but not in RRDfile | Désigne le champ que le poller tente d'écrire mais qui n'a pas de place dans le fichier |
| The RRDfile Minimal Heart... is lower than polling interval | Le vérificateur signale un heartbeat inférieur ou égal à l'intervalle d'interrogation ; les échantillons tardifs risquent de devenir inconnus |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Le heartbeat du fichier est inférieur à celui du profil ; cette vérification ne signale pas un heartbeat plus grand |
| Stale values for last 24 hours, or last hour | Tous les échantillons relus dans cette fenêtre étaient inconnus |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Défaillance partielle de collecte |
| No data returned, maybe corrupted Data Source | Une commande fetch sur le fichier n'a rien renvoyé du tout |

La vérification corrige au fur et à mesure le pas et le heartbeat enregistrés en base pour correspondre au profil,
ce qui résout les dérives entre le profil et les lignes de la source de données mais ne touche pas
au fichier. Les discordances de nombre entre fichier et base sont signalées plutôt que
réparées, car l'un ou l'autre côté peut être erroné.

## 5. Dump, édition, restauration

RRDtool peut sérialiser un fichier lisible en XML et reconstruire un candidat à partir de celui-ci.
Cela peut aider en cas de discordance structurelle connue, mais ne reconstruit pas les échantillons perdus
et ne garantit pas qu'un fichier endommagé puisse être analysé. Kadupul utilise également des assistants dump/restore
pour les modifications structurelles. L'assistant de restauration local construit un fichier frère temporaire et
le renomme par-dessus la destination après succès ; cela ne tient pas lieu de sauvegarde.

Les processus d'écriture étant arrêtés, exécutez ceci sous le compte propriétaire du RRD. Remplacez le chemin d'exemple par le
chemin réel de la source de données. Le répertoire de travail privé est créé à côté de la source afin que
le candidat se trouve sur le même système de fichiers :

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Choisissez une plage de fetch et une fonction de consolidation qui contiennent des données conservées connues ;
la dernière heure n'est qu'un exemple. Comparez les noms des sources de données de la source et du candidat,
le pas, les archives, l'horodatage de dernière mise à jour et les valeurs d'échantillons. Un dump/restore inchangé
peut modifier la disposition binaire ; comparez donc les valeurs au lieu d'exiger des empreintes de fichiers identiques.

Conservez la copie originale. Ce n'est qu'après validation que vous restaurerez le mode,
le propriétaire et le groupe requis pour le candidat et que vous le renommerez vers le chemin de production pendant que les processus d'écriture restent arrêtés. Vérifiez
que le compte du poller peut le lire et le mettre à jour avant de reprendre la collecte. Cet exemple
s'arrête avant l'installation afin d'éviter qu'un candidat lisible mais incorrect ne soit installé.

Le XML et le candidat nécessitent de l'espace disque supplémentaire. Un dump échoué peut laisser un
XML partiel ; ne le restaurez pas. Vérifiez l'accès, l'espace disponible et l'erreur signalée. Si l'original
ne peut pas être extrait après ces vérifications, restaurez plutôt une sauvegarde réputée saine. La commande
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) de RRDtool permet d'écraser
la destination ; l'exemple par étapes utilise délibérément une nouvelle destination.

## 6. Ce qui survit et ce qui ne survit pas

| Dommage | Historique récupérable |
|---|---|
| Fichier non accessible en écriture, par ailleurs intact | L'historique conservé survit. Les mises à jour manquées ne sont pas récupérées par la simple correction des droits |
| Heartbeat, minimum ou maximum erroné | Oui. `rrdtool tune` modifie l'en-tête sans toucher aux valeurs stockées |
| Pas erroné | Nécessite une conversion explicite et validée ; modifier le seul profil en base ne convertit pas le fichier |
| Source de données manquante dans le fichier | Les champs existants conservent leur historique. Le nouveau champ commence vide |
| Archive supprimée ou jamais créée | Non. Une résolution qui n'a jamais été stockée ne peut pas être reconstituée |
| Lignes d'archive réduites par un redimensionnement | Non. Les lignes supprimées ont disparu au moment où la commande est exécutée |
| Fichier tronqué, échec du dump | Non. Restaurer depuis une sauvegarde |
| En-tête intact, fin de fichier tronquée | Ne présumez pas qu'un en-tête lisible implique un dump complet ; utilisez une sauvegarde vérifiée si le dump échoue |

Modifier l'intervalle du poller ou déplacer une source de données vers un autre profil de rétention
ne restructure pas automatiquement les fichiers existants. RRDtool propose également des opérations
[`tune` structurelles](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), notamment une
option de pas ; validez le comportement de conversion pour la version installée et la disposition
des archives au lieu de supposer un changement d'intervalle sans perte. Consultez
[Sources de données et archives](/fr/concepts/data-sources-and-rras/) et
[Gérer la rétention des données](/fr/guides/manage-data-retention/). Augmenter un maximum avec `tune`
est sans risque ; le diminuer enregistrera toute valeur ultérieure supérieure au nouveau plafond comme inconnue.

## 7. Reconstruire tout en conservant ce qui peut l'être

Kadupul fournit un utilitaire de raccordement (splice) capable de remplir un nouveau fichier à partir d'un ancien fichier
lisible. Considérez son résultat comme un candidat : il peut combler des lacunes et remplacer des zéros légitimes,
de sorte qu'il ne s'agit pas d'une copie sans perte de l'historique mesuré. Exécutez-le depuis la racine de l'application sur
le collecteur principal de données, en utilisant des copies isolées dans des répertoires accessibles en écriture fiables.

Créez `new.rrd` avec la structure prévue dans le répertoire privé `$work`
de l'étape 5, puis prévisualisez la fusion :

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Les deux fichiers d'entrée doivent déjà exister et passer les vérifications d'inscriptibilité de l'utilitaire.
Le nouveau fichier fournit la structure. Sans `--finrrd`, la sortie est le chemin du nouveau fichier
plus `.new` ; utilisez un nouveau chemin de sortie explicite pour éviter d'écraser un précédent
candidat. `--dryrun` analyse et fusionne à l'aide de XML temporaire et, le cas échéant,
d'un stockage SQLite, mais ignore la restauration RRD finale. Cela ne prouve pas que la restauration finale
réussira. Retirez `--dryrun` pour produire le candidat distinct.
Évitez `--owner` pendant les prévisualisations et exécutez la commande sous le compte de service requis ; vérifiez
la propriété réelle de la sortie avant l'installation.

:::caution[La fusion traite zéro comme un vide]
La fusion parcourt le nouveau fichier et, pour chaque emplacement contenant une valeur inconnue **ou un zéro**, recherche
la valeur correspondante la plus proche dans l'ancien fichier et écrit celle-ci à la place. Un véritable zéro dans
le nouveau fichier est donc remplacé par d'anciennes données. Pour tout ce qui enregistre légitimement zéro pendant de
longues périodes (un port inactif, une file d'attente qui se vide, un compteur au repos), inspectez le
résultat avant de le mettre en place. Les valeurs inconnues de l'ancien fichier sont également comblées à l'aide des
valeurs précédentes, de sorte que la sortie fusionnée peut inventer une continuité sur des données manquantes.
:::

Après la fusion, placez le fichier là où la source de données l'attend, avec les autorisations dont le
poller a besoin, et vérifiez que le graphique s'affiche.

## 8. Combler les lacunes, et pourquoi y réfléchir à deux fois

| Utilitaire | Ce qu'il écrit |
|---|---|
| `cli/batchgapfix.php` | Comble une plage de dates sur plusieurs appareils en parallèle, en utilisant soit la dernière valeur connue, soit une moyenne |
| `cli/float_rrdfiles.php` | Fait flotter une plage dans les graphiques sélectionnés via le même circuit de dump et restore |

Tous deux inventent des mesures. Rien n'a été collecté à ces horodatages, et par la suite,
rien dans le fichier ne distingue les valeurs inventées des vraies. Utilisez-les lorsque vous
savez que l'interruption n'était pas une panne : un poller arrêté pour maintenance, une fenêtre de migration.
Ne les utilisez jamais pour des données alimentant un calcul de capacité ou de facturation. La même mise en garde s'applique à
[la suppression des pics](/fr/guides/remove-spikes-from-data/).

## 9. Débogage automatisé d'une source de données

Pour une source de données au comportement anormal, Kadupul peut exécuter une vérification de débogage sur les prochains
cycles d'interrogation et émettre un verdict : si le fichier existe, si lui et son
répertoire sont accessibles en écriture, quel compte en est propriétaire par rapport au compte sous lequel tourne le poller,
si la source de données est active, si le fichier correspond à la définition de la source de données,
si la dernière mise à jour a bougé après une interrogation, et si les valeurs étaient exploitables. Son
action réparatrice est étroite. Elle exécute les recommandations de `rrdtool tune` produites par
la comparaison et rien d'autre, déclinant et consignant la raison lorsque la liste est vide ou que le fichier
est inaccessible en écriture. Elle ne recrée pas de fichiers, n'ajoute pas de sources de données et ne modifie pas d'archives.

## 10. La suppression est un risque distinct

Kadupul suit les fichiers d'archive dont la source de données n'existe plus et propose de
les supprimer. Il peut également être configuré pour agir automatiquement lorsqu'une source de données est supprimée, avec deux
méthodes : supprimer, ou déplacer vers un répertoire d'archives.

:::danger[La suppression est irréversible]
La méthode de suppression efface le fichier du disque. Il n'y a pas de corbeille et les données
ne sont pas dans la base de données. Si vous n'êtes pas certain que chaque fichier listé est réellement orphelin,
réglez la méthode sur archiver, ce qui déplace les fichiers vers un répertoire que vous désignez, puis balayez
ce répertoire manuellement plus tard.
:::

Un fichier peut paraître orphelin sans l'être. Une source de données déplacée vers un nouveau chemin, une
restauration partiellement achevée ou un appareil reconstruit sous un nouvel identifiant laissent tous des fichiers vers
lesquels rien ne pointe. Comparez d'abord la liste avec votre propre historique des modifications.

## Modes de défaillance

| Symptôme | Cause |
|---|---|
| Réparation réussie, graphique toujours vide | Vérifiez l'accès, la plage temporelle sélectionnée, la collecte de données et la définition du graphique |
| `rrdtool dump` renvoie une erreur sur le fichier | Vérifiez le chemin, l'accès, le stockage et le format avant de conclure à un endommagement |
| Tune appliqué, rien n'a changé | Les modifications d'en-tête ne remplissent pas rétroactivement les échantillons inconnus historiques ; vérifiez les définitions du fichier et de la base |
| Trous étroits partout après un changement d'intervalle | Les fichiers portent encore l'ancien pas et l'ancien heartbeat |
| Le fichier raccordé comporte de vieilles données là où le nouveau fichier lisait zéro | Comportement attendu. Le raccordement comble les zéros aussi bien que les inconnus |
| La liste du vérificateur grandit et ne rétrécit jamais | Les constats sont enregistrés jusqu'à leur purge ; corriger la cause ne les efface pas |

Sauvegardez ensemble le répertoire des archives et la base de données, selon une planification unique, et testez la
restauration. La récupération est limitée à ce que cette sauvegarde contenait au moment de sa capture. Consultez
[Sauvegarde et restauration](/fr/guides/back-up-and-restore/).
