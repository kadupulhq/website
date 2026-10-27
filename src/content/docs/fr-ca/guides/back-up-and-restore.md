---
title: Sauvegarde et restauration
description: Trois éléments doivent être capturés ensemble pour que la sauvegarde soit complète, et leur ordre de restauration est déterminant.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 7
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure de migration prise en charge pour Kadupul. Testez ces procédures sur une copie isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr-ca/project/status/).
:::

Un ensemble complet de récupération Kadupul comporte trois parties. Des sauvegardes partielles peuvent restaurer la configuration ou les mesures, mais ne peuvent pas reproduire l'installation complète.

| Partie | Ce qu'elle contient | Son emplacement |
|---|---|---|
| Base de données | Équipements, modèles, utilisateurs, permissions, le cache du poller et le chemin de chaque fichier RRD | MySQL ou MariaDB |
| Fichiers RRD | Mesures conservées et archives consolidées | Le répertoire RRA, par défaut `rra/` sous l'installation |
| Configuration | Identifiants de base de données, chemins, configuration du collecteur, code des plugins et des scripts | `include/config.php`, le fichier de configuration de spine, `plugins/`, `scripts/`, `resource/` |

## Ce qu'une sauvegarde de la base de données seule peut récupérer

La base de données contient les définitions de graphiques et la configuration de la surveillance, tandis que les fichiers RRD contiennent les archives historiques des graphiques. Lorsque Boost est activé, les relevés récents peuvent également résider dans les files d'attente de la base de données jusqu'à leur vidage vers les fichiers. Conservez ces files d'attente dans la sauvegarde de la base de données. Consultez [l'architecture](/fr-ca/concepts/architecture/).

Restaurez la seule base de données et vous obtiendrez un système qui connaît quatre cents équipements, possède chaque graphique défini et affiche chacun d'eux vide. Il recommencera à collecter dès le démarrage du poller, mais l'historique sera perdu.

## Ce qui manque à une sauvegarde des seuls fichiers RRD

Un fichier RRD contient des sources de données nommées, des définitions d'archives et des valeurs, mais pas l'ensemble des métadonnées d'équipements, de requêtes, de graphiques et de permissions de Kadupul nécessaires pour rattacher ces valeurs à l'application.

L'association entre « octets entrants sur le port 3 du commutateur 12 » et un chemin sur le disque réside dans la base de données, dans une colonne de la source de données. Restaurez uniquement l'arborescence de fichiers et vous disposerez de plusieurs milliers de fichiers remplis de chiffres, sans aucun moyen de déterminer à quoi chacun correspond sauf à faire de la rétro-ingénierie manuelle.

Les deux ne forment qu'une seule et même sauvegarde. Traitez-les comme telle.

## La cohérence entre les deux

C'est ici que la plupart des procédures de sauvegarde pèchent sans bruit.

Le poller écrit continuellement dans les fichiers RRD. Un fichier copié pendant qu'une mise à jour est en cours peut être capturé en pleine écriture. La base de données fait l'objet d'écritures au même moment. Si vous exportez la base de données à 02h00 et commencez à copier les fichiers à 02h20, les deux moitiés décrivent des instants différents, et chaque source de données créée ou supprimée entre-temps crée une incohérence.

Les écritures RRD différées rendent la situation pire et plus intéressante. Dans ce mode, le poller n'écrit pas dans les fichiers RRD à chaque passage. Les résultats s'accumulent dans une table persistante de la base de données et sont vidés en masse ultérieurement. La base de données peut donc légitimement être en avance sur les fichiers RRD d'une durée allant jusqu'à l'intervalle de vidage, contenant des mesures réelles qui ne se trouvent nulle part ailleurs sur le disque.

Choisissez l'une de ces approches, par ordre décroissant de préférence :

**Instantané coordonné.** Utilisez la procédure de sauvegarde ou de mise en sommeil prise en charge par le moteur de base de données et coordonnez-la avec des instantanés de l'ensemble du stockage RRD et de la configuration de l'application. Un instantané du système de fichiers seul n'établit pas la cohérence entre volumes distincts, collecteurs distants, files d'attente en suspens ou base de données active.

**Sauvegarde logique mise en sommeil.** Désactivez les lanceurs planifiés et les autres producteurs, attendez que les collecteurs en cours se terminent, puis videz les écritures différées et attendez les processus de vidage. Maintenez les modifications de configuration, la maintenance et les autres processus d'écriture RRD à l'arrêt tout au long de la capture. Les pauses de collecte peuvent laisser des échantillons manquants ; leur apparition dépend du heartbeat et de la consolidation.

Avant d'exécuter l'exemple, effectuez ces étapes de mise en sommeil et vérifiez l'état de la file d'attente et des processus ouvriers. Le fait que `poller_boost.php --force` renvoie zéro ne constitue pas à lui seul la preuve d'un vidage complet : un processus Boost déjà enregistré peut le pousser à quitter sans effectuer le travail. Coordonnez tout service rrdcached ou stockage distant séparément.

Cet exemple Bash suppose un stockage local, un compte de base de données configuré dans un fichier d'options client privé, et un répertoire RRA contenant tous les RRD gérés. Remplacez chaque chemin. Recensez les chemins RRD absolus personnalisés, les cibles de liens symboliques, la configuration externe et les collecteurs distants, et capturez-les également séparément.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

L'archive applicative inclut la configuration et le code correspondant. Consignez la révision des sources, les versions de la base de données et de RRDtool, les chemins de stockage réels ainsi que l'état d'arrêt et de vidage des processus d'écriture aux côtés de l'ensemble. L'exemple exclut les journaux habituels, le cache et les métadonnées Git ; réexaminez ces exclusions pour votre installation.

Seul un ensemble capturé et vérifié par somme de contrôle avec succès reçoit le nom de répertoire définitif. Une commande en échec peut tout de même laisser un fichier tronqué dans `.partial-*` ; `set -e` interrompt les commandes suivantes mais ne supprime pas la sortie déjà créée. Ne hissez pas ce répertoire au rang de sauvegarde terminée. Les sommes de contrôle détectent les altérations ultérieures, non la complétude logique ; un test de restauration reste obligatoire.

`--single-transaction` couvre les tables transactionnelles, et non un instantané cohérent des tables non transactionnelles de plugins ou des modifications simultanées de schéma. Maintenez les processus d'écriture et les changements de schéma à l'arrêt, ou utilisez une méthode de sauvegarde adaptée au moteur. Ne reprenez la collecte qu'après avoir confirmé que la capture est terminée et que le stockage est utilisable. Consultez la [documentation de mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) pour les exigences relatives aux transactions et aux privilèges. Les omissions de la recette précédente sont suivies dans [website #12](https://github.com/kadupulhq/website/issues/12).

**Acceptez le décalage et consignez-le.** Quelle que soit la partie capturée en premier, elle sera la plus ancienne, et aucun ordre ne rend à lui seul cohérente une paire active. Notez l'intervalle ; c'est ce qui rend le résultat récupérable.

Exportez d'abord la base de données puis copiez les fichiers en second, et les fichiers seront plus récents. Une source de données supprimée pendant l'intervalle reste dans l'export alors que son fichier a disparu, laissant une référence que le poller recréera. Une source de données créée pendant l'intervalle arrive sous la forme d'un fichier ignoré par la base de données, qui reste inerte.

Copiez d'abord les fichiers puis exportez la base de données en second, et la base de données sera plus récente. Une source de données créée pendant l'intervalle est présente dans l'export sans aucun fichier derrière elle, ce que le poller recrée vide.

L'un ou l'autre ordre peut perdre l'historique antérieur à l'intervalle si un fichier nécessaire est supprimé avant d'être copié. Il peut également capturer un fichier partiellement écrit ou des échantillons en file d'attente incohérents. Consigner le décalage documente une limite ; cela ne rend pas complète une paire incohérente et ne garantit pas la recouvrabilité.

## Ce que contient la sauvegarde sans que vous n'y ayez pensé

Les identifiants des équipements figurent en clair dans la base de données. Le cache du poller contient les chaînes de communauté SNMP ainsi que les noms d'utilisateur, mots de passe et phrases secrètes SNMPv3 sous forme de colonnes brutes, car le collecteur en a besoin à chaque passage. Le fichier de configuration contient le mot de passe de la base de données.

Une sauvegarde de Kadupul constitue donc un magasin d'identifiants pour chaque équipement que vous surveillez. Chiffrez-la au repos, limitez ses droits de lecture et ne la déposez pas sur un partage de fichiers générique.

## Ordre de restauration

L'ordre a son importance car chaque étape dépend de la précédente.

1. **Restaurez d'abord la configuration.** Sans les identifiants de la base de données ni le chemin RRA, rien d'autre ne peut être vérifié. Si la restauration s'effectue sur un matériel différent, corrigez les chemins dès maintenant plutôt qu'après coup.

2. **Restaurez l'arborescence RRD.** Placez-la à l'emplacement indiqué par la configuration. Vérifiez l'appartenance et les permissions : le poller écrit ces fichiers en tant qu'utilisateur du poller, et l'interface web les lit en tant qu'utilisateur du serveur web. Une restauration qui préserve le contenu mais non l'appartenance produit un système qui génère de beaux graphiques mais ne collecte rien.

3. **Restaurez la base de données.** La table de version dans l'export doit correspondre au code sur lequel vous restaurez. Laissez tous les lanceurs et processus d'écriture désactivés jusqu'à ce que les composants restaurés aient été vérifiés ensemble. Un export d'une ancienne version restauré sur un code plus récent renvoie l'interface web vers l'installateur, ce qui est un comportement correct mais pas ce que vous souhaitez au beau milieu d'une récupération. Restaurez d'abord le code correspondant.

4. **Reconstruisez le cache du poller.** Le cache est dérivé, et une restauration est précisément la situation où il risque d'être périmé. Sa reconstruction ne coûte qu'une seule exécution et élimine toute une catégorie de symptômes déroutants.

5. **Démarrez le poller, puis vérifiez un fichier.** Confirmez que la date de dernière mise à jour d'un fichier RRD évolue après la première exécution. Si les graphiques sont remplis jusqu'au point de restauration puis restent plats, examinez les résultats de collecte, les files d'attente, les horodatages, les chemins et les permissions. Un graphique plat ne révèle pas à lui seul la cause du problème.

## Pièges

**Les fichiers RRD rejettent les mises à jour dans le passé.** Un fichier RRD n'acceptera pas d'échantillon à un horodatage antérieur ou égal à celui qu'il détient déjà. Restaurer un ensemble de fichiers plus anciens sur une base de données plus récente ne compense pas à lui seul les échantillons perdus. Les files d'attente différées conservées ou d'autres sources peuvent contenir des relevés récupérables, mais leur réinjection exige une validation distincte et un ordonnancement chronologique. Sans ces relevés, la collecte reprend avec un trou. C'est également la raison pour laquelle vous ne pouvez pas fusionner deux sauvegardes en copiant des fichiers entre elles.

**Vérifiez si vos chemins stockés utilisent des jetons avant de réécrire quoi que ce soit.** Les sources de données générées stockent le chemin sous la forme `<path_rra>/name.rrd`, et le jeton est développé au moment de la lecture à partir du paramètre de chemin RRD. Pour celles-ci, déplacer l'installation implique de modifier le paramètre et de reconstruire le cache du poller, et non de réécrire des lignes. Les chemins saisis à la main sont stockés littéralement et doivent effectivement être réécrits. Vérifiez avant d'exécuter une mise à jour sur toute la table, car transformer des chemins avec jetons en chemins absolus est précisément la modification qui compliquera le prochain déplacement.

**Les collecteurs distants ont leur propre fichier de configuration.** Chacun détient ses propres identifiants de base de données et son identifiant de collecteur. Ils ne figurent pas dans la sauvegarde centrale de la base de données. Capturez-les par hôte.

**Les données des plugins sont dans la même base de données.** Les plugins créent leurs propres tables lors de l'installation, de sorte qu'un export complet de la base de données les englobe. Le code des plugins ne se trouve pas dans la base de données. Si vous restaurez la base de données sans le répertoire `plugins/` correspondant, l'installation désactivera ce qu'elle ne trouve pas.

**Une sauvegarde que vous n'avez pas restaurée n'est qu'une hypothèse.** Effectuez des restaurations planifiées dans une instance temporaire. Le mode de défaillance que cela révèle le plus souvent n'est pas la corruption ; c'est une sauvegarde qui n'a jamais capturé qu'une seule des trois parties.
