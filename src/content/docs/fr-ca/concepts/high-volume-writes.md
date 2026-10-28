---
title: Écritures à volume élevé
description: Pourquoi les mises à jour RRD sont limitées par le nombre d'écritures plutôt que par leur taille, ce que le traitement par lots apporte et ce qu'il coûte en fraîcheur.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 10
---

Les mises à jour RRD sollicitent de nombreux fichiers et peuvent se heurter à la latence du
stockage et au nombre d'opérations d'E/S, bien plus qu'à la bande passante de transfert. Les
écritures différées, également appelées Boost, rassemblent les échantillons dans la base de
données et regroupent les écritures par fichier. Évaluez les performances du système d'écriture
et de la base de données avant de faire ce choix : des lacunes dans les graphiques ne
désignent pas à elles seules un goulot d'étranglement de stockage.

## Le chemin par défaut

Les collecteurs injectent les résultats dans la file en transit `poller_output`. Le module
d'écriture regroupe les échantillons par fichier et par horodatage, met à jour le fichier RRD
et s'assure de l'acquittement avant de purger les échantillons traités. Les écritures en échec
peuvent laisser des lignes pour une nouvelle tentative ; la file ne se cantonne donc pas au
seul cycle de collecte en cours.

Dans la version examinée, cette file s'appuie sur InnoDB. La vérification préalable de la
collecte rejette une file de type MEMORY ; un redémarrage de la base de données n'élimine pas
intrinsèquement les lignes validées, contrairement à une table en mémoire. La durabilité
dépend toujours de la configuration de la base, de l'état du stockage et des sauvegardes.
Consultez [Mettre à niveau en toute sécurité](/fr-ca/guides/upgrade-safely/) pour les contrôles de
migration de file et de stockage.

À titre d'estimation approximative, 10 000 fichiers distincts mis à jour toutes les 300 secondes
représentent environ 33 mises à jour de fichiers par seconde en moyenne. Les écritures réelles
surviennent par salves ; plusieurs champs d'une source de données peuvent partager un même
fichier, les fréquences d'échantillonnage peuvent varier, et le nombre de commandes ne reflète
pas directement le volume d'E/S physiques sur le disque. Comparez la latence d'écriture
mesurée et l'âge de la file avec la fenêtre de collecte disponible.

## Ce que change le traitement par lots

Lorsque les écritures différées sont actives, la collecte stocke les échantillons dans
`poller_output_boost` en vue d'un traitement ultérieur. Le module d'écriture par lots
regroupe les mesures par source de données dans l'ordre chronologique et peut regrouper
plusieurs horodatages dans une même commande de mise à jour RRDtool. Douze échantillons
peuvent tenir dans une seule instruction, sans que cela garantisse pour autant une unique
écriture physique sur le disque.

La longueur maximale d'argument configurée borne les chaînes de commande ; la valeur par
défaut est de 2 000. Elle conditionne la taille des lots. Ne déduisez pas une limite propre
au système d'exploitation à partir de ce paramètre : les écritures locales acquittées
empruntent un flux de commandes RRDtool, et le mécanisme de transport ainsi que la taille
de commande prise en charge sont déterminants.

Le planificateur devient éligible dès que sa minuterie arrive à échéance (60 minutes par
défaut) ou lorsque le volume estimé de lignes dans le tampon dépasse le seuil configuré
(1 000 000 par défaut). Cette estimation comptabilise les tables actives et les archives.
Une exécution du planificateur doit néanmoins pouvoir se produire, et des vérifications
de processus, des phases de préparation ou des défaillances d'écriture peuvent retarder
l'opération. Les exécutions forcées, la vidange après désactivation et les mises à jour
à la demande lors de l'affichage constituent d'autres circuits ; les valeurs par défaut ne
forment pas une garantie de fraîcheur d'une heure.

Un intervalle nul ou non entier positif est remplacé par 120 minutes ; la valeur par
défaut usuelle est de 60 minutes.

## La rotation et sa raison d'être

L'architecture de traitement par lots génère une table vide calquée sur le tampon actif,
puis permute leurs noms au moyen d'une unique instruction `RENAME TABLE`. L'ancienne table
active devient une archive horodatée et les producteurs basculent vers la nouvelle table.
Ce mécanisme isole le lot des nouvelles insertions, bien que des verrous de base de données
et des conflits de ressources puissent encore ralentir la collecte.

Les processus secondaires traitent les archives en cours et retenues. Le processus parent
contrôle l'avancement et le statut de ses enfants ; les exécutions échouées ou non vérifiables
conservent les archives en vue d'un nouvel essai. Lors des nettoyages éligibles, les archives
vides peuvent être purgées et les échantillons restants peuvent être réinjectés dans le tampon
actif avant suppression de l'archive. Une archive non vide n'est pas simplement détruite sous
prétexte que le processus a pris fin. Inspectez conjointement les files actives et les archives
lors du diagnostic d'une accumulation de données.

Il s'agit d'un mécanisme de reprise sur panne, et non d'une garantie universelle contre les
arrêts brutaux. Les erreurs de base de données, la concurrence d'accès, les défaillances
matérielles et la cohérence des sauvegardes doivent être vérifiées sur l'environnement en
exploitation.

## Pourquoi l'affichage d'un graphique peut mettre à jour ses fichiers

Le circuit ordinaire d'affichage peut tenter des mises à jour à la demande pour chaque
source de données liée au graphique avant son rendu. Il ne vide pas chaque mesure en attente
de manière inconditionnelle : les vérifications du collecteur, les canaux temps réel/sources/erreurs,
les seuils d'interrogation active, les limites de requêtes et les échecs d'écriture influent
sur les éléments traités. Les échantillons récents ou en échec peuvent rester en attente.

Un graphique d'aspect récent ne garantit donc pas que l'ensemble de l'arborescence RRD soit
à jour, et l'affichage d'un graphique ne certifie pas une réinjection sans accroc. Examinez
les erreurs d'écriture, l'ancienneté des files et les horodatages effectifs des fichiers RRD.
Une sauvegarde cantonnée aux seuls fichiers omet les mesures en attente dans la base de
données ; reportez-vous à [Sauvegarder et restaurer](/fr-ca/guides/back-up-and-restore/).

## Ce que vous cédez en contrepartie

**La fraîcheur des fichiers.** Les échantillons restent en base de données jusqu'à leur
traitement effectif. Une installation saine cadencée par minuterie peut accuser un retard
d'environ un intervalle de vidange ; un module d'écriture en panne ou sous-dimensionné
peut accumuler un retard bien supérieur. Sauvegardez simultanément les files d'attente et
les fichiers de données.

**Une planification supplémentaire.** Surveillez la collecte et la vidange de manière
séparée. Observez le volume des lignes actives, les archives conservées, l'âge du plus
ancien échantillon, les tâches secondaires en échec et le débit de traitement. Une table
active n'a pas besoin d'être vide tant que les producteurs y insèrent des données, et une
rotation peut donner l'illusion d'une réduction sans qu'aucune mise à jour RRD n'ait abouti.

**L'ordonnancement.** Les fichiers RRD n'acceptent pas d'horodatages antérieurs après des
mises à jour plus récentes. Le moteur Boost moderne applique l'omission des mises à jour
passées, et le circuit historique filtre les horodatages par rapport à la dernière écriture
du fichier. Une commande acquittée avec succès peut donc écarter des données anciennes ;
une arrivée tardive ne garantit pas la restitution de l'échantillon sur le graphique.

**La surface opérationnelle.** Il convient de surveiller un tampon en base de données, un
processus de vidange soumis à une limite de mémoire, des travailleurs parallèles facultatifs,
ainsi que des archives préservées ou des données réinjectées. Les défaillances locales
préservent généralement les échantillons pour un essai ultérieur, sans que cela n'établisse
une intégrité sans faille de bout en bout. Pour le circuit de reprise distante, consultez
[Collecte de données distante](/fr-ca/concepts/remote-data-collection/).

## Quand cela en vaut la peine

Envisagez les écritures différées lorsque les mesures confirment que le module d'écriture
RRD forme le goulet d'étranglement et que la base de données dispose de la capacité requise
pour le tampon et les requêtes par lots. Cette technique n'efface pas la latence des
appareils et ne répare pas une base surchargée. Mesurez le débit, l'âge de la file, la
fraîcheur des fichiers et l'usage des ressources avant et après activation.

Le poller principal active automatiquement la mise à jour différée dès qu'un collecteur
distant en service est configuré. Ce réglage ne valide pas à lui seul un déploiement de
stockage distant ou de reprise ; appuyez-vous sur les restrictions énoncées dans
[Collecte de données distante](/fr-ca/concepts/remote-data-collection/).

## Une fonctionnalité différente portant le même nom

Les images de graphiques générées peuvent également être mises en cache. La mise en cache
d'images allège les rendus répétitifs ; les écritures différées regroupent les échantillons
de la base en écritures RRD. Leurs réglages sont distincts, mais leurs chemins d'exécution
interagissent : l'affichage d'un graphique peut vérifier les mesures en souffrance avant
d'employer une image en cache, et des écritures réussies peuvent déclencher le calcul d'une
nouvelle image. Évaluez la fraîcheur des images indépendamment de celle des files et des RRD.
