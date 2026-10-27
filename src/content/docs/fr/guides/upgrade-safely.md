---
title: Mettre à niveau en toute sécurité
description: Répéter la mise à niveau, conserver des sauvegardes synchronisées, vérifier le stockage et le schéma, et planifier un retour arrière coordonné.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 8
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure de migration prise en charge pour Kadupul. Testez ces procédures sur une copie isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr/project/status/).
:::

Une mise à niveau modifie trois éléments à des moments différents et avec une réversibilité différente.

| Modifications | Réversible | Comment |
|---|---|---|
| Code, dépendances et configuration | À partir d'une copie conservée | Restaurez la révision et les paramètres correspondants |
| Schéma de base de données et échantillons en file d'attente | À partir d'une sauvegarde synchronisée | Restaurez la base de données ; il n'existe aucune migration inverse automatique |
| Fichiers RRD | À partir d'une sauvegarde synchronisée | Restaurez l'historique conservé ; les échantillons absents de la sauvegarde ne peuvent pas être recréés par un retour arrière |

Cette procédure a pour but de maintenir ces trois éléments en phase.

## Avant de commencer

**Effectuez une sauvegarde complète.** Les trois parties, cohérentes entre elles. Suivez [Sauvegarde et restauration](/fr/guides/back-up-and-restore/). Arrêtez tous les processus d'écriture avant la capture finale et conservez la sauvegarde protégée jusqu'à la validation définitive de la mise à niveau.

**Consignez la révision actuelle et la version du schéma.** Incluez les dépendances, les modifications locales, les plugins et la configuration. Plusieurs révisions des sources peuvent indiquer la même version de schéma. Répétez la révision cible sur une copie restaurée isolée.

**Vérifiez chaque plugin.** Examinez sa déclaration de compatibilité, son code et ses dépendances, puis testez les fonctions nécessaires sur la révision cible. Une simple déclaration de version minimale ne garantit pas la compatibilité. Consultez la [validation des plugins](/fr/guides/install-and-vet-plugins/).

**Vérifiez l'environnement d'exécution.** Version de PHP, extensions PHP et version du serveur de base de données. Vérifiez les [prérequis](/fr/reference/requirements/) de la version cible avant le déploiement. Ne supposez pas que l'interface en ligne de commande de schéma effectue toutes les vérifications de l'installateur web.

**Vérifiez que le compte de base de données peut modifier le schéma.** À l'exécution, le compte doit lire et écrire dans sa propre base de données. Lors d'une mise à niveau, il doit également créer, modifier et supprimer des tables et des index. Les installations ayant restreint les privilèges après la configuration initiale s'en aperçoivent ici.

**Arrêtez chaque producteur.** Arrêtez la collecte planifiée, les collecteurs distants, la collecte déclenchée par le web et la maintenance manuelle ; attendez la fin des opérations en cours. Ne videz les écritures différées qu'après l'arrêt des producteurs, et conservez toutes les lignes de file d'attente non acquittées avec la sauvegarde correspondante. Maintenez les producteurs arrêtés tout au long du déploiement et de la validation du schéma.

## Remplacer l'application

Une copie par superposition présente des limites précises :

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Sans cela, `cp -a /path/to/new-release /path/to/kadupul` crée `kadupul/new-release/` et laisse chaque fichier de l'ancienne application exactement là où il se trouvait. La mise à niveau semble avoir fonctionné, l'interface exécute toujours l'ancien code, et le premier signe de problème apparaît lorsque la migration de schéma refuse de correspondre à une version que vous pensiez avoir remplacée.

Une copie par-dessus conserve les fichiers absents de la nouvelle arborescence, y compris les fichiers applicatifs obsolètes. Elle peut écraser n'importe quel chemin correspondant ; inspectez donc l'artefact au lieu de supposer que la configuration ou les données en sont exclues. Privilégiez une arborescence préparée et révisée avec des dépendances, une configuration et des plugins concordants. En cas de bascule de version via un lien symbolique, validez le chemin RRA effectif et l'accès au stockage avant la bascule ; l'amorçage actuel le déduit du répertoire de l'application auquel s'ajoute `/rra`. Une simple bascule de lien symbolique ne constitue pas un retour arrière de la base de données.

**Vérifiez ce que vous exécutez réellement avant de continuer.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Si cette commande n'indique pas la version que vous venez de déployer, arrêtez-vous. Tout ce qui suit suppose que le code prévu est bien déployé. Comparez également la révision des sources ou la somme de contrôle de l'artefact avec le registre de version ; la seule chaîne de version ne suffit pas.

## La migration de schéma

La base de données porte sa propre version, distincte de la version présente dans le code. Le remplacement du code ne la modifie pas.

Les pages authentifiées historiques redirigent vers l'installateur lorsque les versions du code et de la base de données ne concordent pas. Cela ne constitue pas une protection universelle pour tous les points d'entrée ou interfaces en ligne de commande, et des chaînes de version identiques ne prouvent pas que chaque migration s'est achevée. Vérifiez directement l'état du schéma.

L'installateur et l'outil CLI exécutent des étapes de migration ordonnées. Avant la mise à niveau normale du schéma, vérifiez la file d'attente persistante et l'accès au stockage du compte de service. Si une file d'attente héritée `poller_output` n'est pas au format InnoDB, convertissez-la explicitement en maintenant les processus d'écriture arrêtés et la sauvegarde conservée :

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Exécutez ensuite ceci sous chaque compte réel du web et du poller :

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Les deux options constituent des opérations distinctes et ne peuvent pas être combinées. La conversion de file d'attente préserve les échantillons en attente ; ne tronquez pas de lignes pour réussir une vérification. Réglez les questions d'appartenance et la configuration des UID/GID numériques approuvés à l'aide des [prérequis de stockage](/fr/reference/requirements/). Les collecteurs distants en ligne sélectionnent normalement la file principale ; n'utilisez `--local` que pour une vérification ou conversion intentionnelle de la file d'attente locale. Une fois ces vérifications réussies, lancez la mise à niveau du schéma depuis la racine de l'application :

```sh
php cli/upgrade_database.php
```

Exécutez-la en tant que compte de service configuré avec l'accès au système de fichiers et les privilèges de base de données requis. Une vérification réussie en tant que root ne prouve pas l'accès du compte de service. Il existe une option `--forcever` permettant de définir explicitement la version de départ, utile pour réexécuter une migration lors de tests préliminaires. Elle ne fait pas partie d'une mise à niveau normale et s'en servir pour ignorer une étape en échec laissera le schéma à moitié migré.

Capturez le code de retour et la sortie, puis vérifiez la version de la base de données et les modifications de schéma requises. La CLI actuelle peut rejeter une version de départ historique inconnue ou non prise en charge tout en renvoyant le code 0 ; un état de shell réussi ne suffit pas à lui seul. Si la migration échoue en cours de route, maintenez les producteurs arrêtés et restaurez l'ensemble de sauvegarde correspondant au lieu d'essayer d'ignorer l'étape défaillante.

## Ce qui casse les plugins

Les vérifications de plugins de l'installateur web peuvent désactiver les plugins incompatibles ou manquants. Ne supposez pas que la CLI de schéma effectue les mêmes vérifications de cycle de vie des plugins.

**La version minimale déclarée est supérieure à la nouvelle version du cœur.** Désactivé. C'est le cas normal, et c'est celui que votre vérification préalable à la mise à niveau aurait dû détecter.

**Le répertoire du plugin, son fichier de configuration ou son fichier de déclaration est manquant.** Désactivé. Un plugin dont les fichiers ont été supprimés alors qu'il était encore marqué comme activé dans la base de données relève de ce cas.

**Le plugin ne possède aucun fichier de déclaration.** Il peut échouer au contrôle de compatibilité de l'installateur. Testez un paquet de plugin maintenu et compatible plutôt que de supposer qu'il pourra être réactivé tel quel.

Il existe un quatrième cas qui ne constitue pas une rupture. Une fonctionnalité qui était autrefois un plugin et a depuis été intégrée au cœur est purement et simplement supprimée, non désactivée : ses points d'ancrage et entrées de permission sont retirés et sa ligne est effacée. Si vous voyez un plugin disparaître plutôt que de devenir grisé, examinez les journaux de migration et le statut particulier du plugin avant de conclure que des fonctionnalités équivalentes sont disponibles.

Désactiver un plugin est différent de le désinstaller. Les points d'ancrage et les migrations de plugins peuvent modifier leurs propres tables et permissions ; conservez le code et les données correspondants du plugin et vérifiez le chemin de mise à niveau spécifique. Ne promettez pas une conservation universelle des données.

## Planification du retour arrière

Déterminez la procédure de retour arrière avant de commencer, car la décision diffère selon le stade auquel vous êtes parvenu.

| Point de défaillance | Méthode de retour arrière |
|---|---|
| Code remplacé, aucune opération modifiant l'état ni processus d'écriture exécuté | Restaurez le code précédent, les dépendances et la configuration après avoir confirmé que l'état est inchangé |
| Conversion de file d'attente ou migration commencée, y compris échec partiel | Arrêtez les processus d'écriture et restaurez le code, la configuration, la base de données et les sauvegardes RRD correspondants |
| Migration terminée, l'application fonctionne mal | Arrêtez les processus d'écriture et restaurez l'ensemble de sauvegarde correspondant ; tenez compte des échantillons collectés après la sauvegarde |
| Seul un plugin est défaillant | Laissez-le désactivé tout en évaluant l'opportunité d'une réparation par rapport à un retour arrière coordonné selon les critères d'acceptation |

La règle sous-jacente au tableau : le code et le schéma reviennent en arrière ensemble ou pas du tout. Un ancien code face à un nouveau schéma n'est pas un état pris en charge. Ne comptez pas sur la vérification de version web pour empêcher toute opération incompatible.

Fixez-vous une limite de temps. Décidez à l'avance du temps que vous consacrerez au débogage avant de restaurer, et tenez-vous-y. La sauvegarde perd de son utilité à mesure que le système tourne dans un état partiellement mis à niveau.

## Pourquoi les fichiers RRD sont la partie à ne jamais perdre

Ne supposez pas que le déploiement, la maintenance ou la reprise de la collecte laissent les RRD inchangés. Sauvegardez-les en même temps que la base de données et restaurez l'ensemble correspondant lors de l'annulation de modifications d'état. Les échantillons conservés en file d'attente peuvent ne pas encore exister dans ces fichiers. Une sauvegarde RRD vérifiée permet de récupérer son historique capturé ; un échantillon manquant ne peut pas être reconstitué simplement en restaurant le schéma ou le code. Consultez [Sources de données et archives round-robin](/fr/concepts/data-sources-and-rras/) pour comprendre pourquoi la résolution interne ne peut pas non plus être reconstituée.

Trois situations fréquentes entraînent leur perte lors d'une mise à niveau :

**Déployer en remplaçant le répertoire d'installation.** Le répertoire RRA se trouve par défaut dans un sous-répertoire de l'installation. Supprimer l'ancien répertoire et décompresser le nouveau à sa place peut effacer les mesures conservées. Préservez l'arborescence RRA grâce à une organisation éprouvée du stockage avant de remplacer l'application. Validez le `$config['rra_path']` effectif, les chemins imbriqués et les vérifications de confiance du compte de service ; cette révision ne fournit pas de paramètre général en base de données pour une racine RRA locale arbitraire.

**Déployer à partir d'une copie de travail Git ou d'un paquet qui s'approprie toute l'arborescence.** Même échec, de manière automatisée. Vérifiez ce que votre méthode de déploiement considère comme supprimable.

**Corriger les permissions par un changement récursif de propriétaire.** Sans danger pour les données, mais cela peut empêcher le poller d'écrire, ce qui se traduit par un système traçant parfaitement l'historique mais ne collectant rien de nouveau.

## Après la mise à niveau

1. Examinez la sortie de mise à niveau, la version de la base de données et les modifications de schéma requises, puis confirmez le chargement de l'interface. L'absence de redirection ne suffit pas à elle seule.
2. Terminez les mises à niveau prévues du code et de la configuration des collecteurs distants et validez leurs cibles de base de données pendant que leurs producteurs restent arrêtés.
3. Répétez les vérifications de stockage du compte de service, relancez les collecteurs désignés et vérifiez les horodatages de dernière mise à jour de fichiers RRD représentatifs ainsi que la validité des valeurs conservées.
4. Vérifiez dans le journal la ligne des statistiques d'exécution et comparez le temps écoulé avec celui d'avant. Une nouvelle version peut modifier le coût de collecte.
5. Réactivez les plugins qui ont été désactivés, un par un, après avoir installé des versions qui déclarent leur compatibilité avec le nouveau cœur.
6. Surveillez la profondeur des files d'attente conservées, la collecte distante et les tâches des plugins pendant la période d'acceptation convenue. Conservez la sauvegarde de secours jusqu'à ce que ces vérifications soient concluantes.
