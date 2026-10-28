---
title: Collecte de données distante
description: Pourquoi la collecte se distribue et non le stockage, ce qu'un collecteur distant possède et ce qu'il en coûte d'avoir une seconde copie de la configuration.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 9
---

:::caution[Comportement hérité du proxy RRDtool]
Le déploiement du proxy RRDtool n'est pas pris en charge dans Kadupul. Utilisez le stockage
local RRDtool (`storage_location = 0`). Les paramètres de proxy, les descriptions de protocole et
les flux de travail de cette page documentent un comportement hérité, non un chemin de déploiement
ou de migration pris en charge. Voir [Proxy RRDtool](/fr/reference/rrdproxy/).
:::

La collecte est la partie qui ne tient pas sur une seule machine. La majeure partie d'un cycle de
scrutation est consacrée à attendre la réponse des équipements, et l'attente ne se compresse pas.
Vous pouvez chevaucher davantage d'attente à l'aide de processus et de threads supplémentaires,
jusqu'au point où l'hôte collecteur s'épuise en ressources processeur ou lorsque le temps d'aller-retour
vers un site distant domine l'ensemble des opérations.

Un collecteur distant utilise le même code avec un identifiant de collecteur différent, en
interrogeant un sous-ensemble d'équipements. Chaque équipement désigne le collecteur qui en a la
charge. Cette affectation constitue le partitionnement habituel de l'ordonnancement. Maintenez la
cohérence entre l'affectation des équipements et le cache répliqué du scruteur ; ce choix de
planification ne prouve pas que chaque écriture de résultat applique la propriété du collecteur.

Pour savoir *quand* recourir à un collecteur, voir
[Mettre le scruteur à l'échelle](/fr/guides/scale-the-poller/). Cette page détaille ce qu'est un
collecteur.

## Pourquoi un collecteur porte sa propre base de données

Un collecteur qui lit sa liste de travail depuis la base de données centrale via le réseau cesse de
collecter dès que le réseau défaille. C'est l'exact opposé de la raison pour laquelle vous avez
déployé un collecteur distant.

Il embarque donc une base de données locale contenant sa propre copie de la configuration :
paramètres, modèles, méthodes de saisie de données, requêtes de données, sa fraction du cache du
scruteur, ses équipements, la configuration des greffons ainsi que les tables d'utilisateurs et de
permissions. Cette copie est poussée depuis l'installation principale. Considérez l'installation
principale comme l'autorité de configuration, tandis que le collecteur maintient l'état opérationnel
local et les paramètres de la machine.

Les paramètres de chemins sont exclus de la copie, de même que les statistiques par cycle que
l'installation principale conserve pour elle-même. Les chemins sont des propriétés d'une machine,
non de l'installation dans son ensemble.

## La réplication est périodique, donc la configuration accuse un retard

Le scruteur principal examine les collecteurs distants activés disposant d'un hôte de base de
données non local et d'un intervalle de synchronisation non nul. Un collecteur est éligible s'il ne
s'est jamais synchronisé, si son intervalle est écoulé ou s'il est marqué comme nécessitant une
synchronisation. Un intervalle nul l'exclut de cette vérification périodique, même lorsqu'il est
marqué comme nécessitant une synchronisation.

La valeur par défaut globale est de deux heures ; un collecteur peut disposer de son propre
intervalle. Cela ne garantit pas que chaque modification attende deux heures : les opérations sur
les équipements et les greffons disposent également de chemins de réplication ciblés. La bonne
propagation dépend de cette opération, de la connectivité et des tables sélectionnées. Vérifiez la
configuration et le cache réels du collecteur plutôt que de présumer d'une cohérence immédiate ou
d'un délai fixe.

Une réplication complète peut être demandée depuis le collecteur principal au moyen de
`php cli/poller_replicate.php`, lorsque des collecteurs distants activés sont configurés. Elle
réplique chaque collecteur distant activé, à moins que `--poller=N` n'en sélectionne un précis.
Voir [Mettre le scruteur à l'échelle](/fr/guides/scale-the-poller/) et
[Migrer vers un nouveau matériel](/fr/guides/migrate-to-new-hardware/) pour le contexte opérationnel.

## Trois modes de connexion

Un collecteur détermine son comportement au démarrage selon que la base de données centrale répond
et selon qu'il conserve des échantillons non encore livrés.

| Mode | Condition | Comportement |
|---|---|---|
| En ligne | La base centrale se connecte et aucun arriéré Boost local n'est détecté | Les écritures de résultats ciblent la base de données centrale |
| Hors ligne | La connexion centrale échoue ou est forcée hors ligne | La collecte utilise la mémoire tampon locale, si les services locaux restent sains |
| Récupération | La base centrale se connecte et des lignes Boost locales subsistent | Les nouveaux échantillons restent locaux pendant qu'un processus d'arrière-plan tente le transfert de l'arriéré |

L'état hors ligne n'est pas un état d'erreur. C'est le comportement prévu d'un collecteur dont la
liaison est interrompue, et c'est la raison pour laquelle un collecteur dispose d'une base de données
locale. La collecte se poursuit sur la base de la configuration disponible localement. La capacité
de la base locale, l'accès aux équipements, la santé de l'ordonnanceur et des identifiants valides
restent requis ; le mode hors ligne ne garantit pas une collecte sans interruption ni une livraison
finale assurée.

## Comment les résultats atteignent l'installation principale

Les résultats ne voyagent pas sous forme d'écritures RRD. Ils voyagent sous forme de lignes.

L'écriture différée RRD est obligatoire dès lors qu'il existe plus d'un collecteur, et l'ajout d'un
collecteur distant activé amène le scruteur principal à activer la mise à jour différée. Le processus
de démarrage active également le mode Boost système et la redirection lorsque plusieurs enregistrements
de collecteurs existent. Ces réglages ne suffisent pas à valider à eux seuls un déploiement fonctionnel.
Voir [Écritures à volume élevé](/fr/concepts/high-volume-writes/) pour le rôle de ce mode.

En ligne, un collecteur insère ses échantillons directement dans la table tampon centrale.
L'installation principale les vide dans les fichiers RRD selon son propre calendrier, exactement comme
elle le ferait pour les échantillons qu'elle a collectés elle-même. Les échantillons du collecteur
ne font l'objet d'aucun traitement particulier une fois arrivés.

Hors ligne et lors de la récupération, les échantillons s'accumulent dans la file Boost locale.
Lorsque la base de données centrale redevient accessible, `poller_recovery.php` insère les lignes
tamponnées dans la file Boost centrale, en mettant à jour la sortie d'une ligne qui y figure déjà.

La récupération ne supprime une ligne locale qu'après la réussite de l'insertion centrale pour son
paquet, et seulement si la ligne locale correspond toujours à ce qui a été envoyé. Une insertion
échouée, un échantillon surdimensionné ou une ligne modifiée pendant le nettoyage maintient les
échantillons locaux en place pour la tentative suivante. Cette page n'établit pas de procédure de
récupération multi-collecteurs validée.

Les insertions de récupération transportent les identifiants de source de données, les noms, les
horodatages et les valeurs ; elles ne vérifient pas ces lignes par rapport aux affectations de
collecteurs. Ne vous fiez pas à un rejet universel de transmission pour vous prémunir contre des
affectations obsolètes ou des producteurs qui se chevauchent. Validez les affectations et l'état du
cache avant d'activer la collecte.

## Le stockage ne se distribue pas

Le flux de travail hérité reposant sur un proxy maintient les fichiers RRD de manière centralisée et
s'attend à ce que les collecteurs y accèdent via le proxy RRDtool. Ce flux n'est pas pris en charge
dans Kadupul ; ne le considérez pas comme un guide de déploiement. Un chemin de stockage multi-collecteurs
validé utilisant RRDtool local doit être documenté avant de pouvoir recommander une solution de
remplacement.

C'est l'aspect qui surprend le plus souvent, il convient donc d'être direct à ce sujet :
**Les collecteurs distants distribuent l'attente, pas l'écriture.** Si la limite que vous avez
rencontrée était le disque sous l'arborescence RRD, une capacité de collecte supplémentaire ne supprime
pas cette limite. Davantage d'échantillons entrants peut accroître la charge de la base de données
centrale et l'arriéré des rédacteurs.

## Ce qui remonte également

Un collecteur gère l'état opérationnel de ses équipements : joignabilité, dernière erreur, temps de
trajet aller-retour, nombre de scrutations, disponibilité. Il consigne ces données localement lors de
ses cycles et transmet des colonnes opérationnelles sélectionnées à l'installation principale par lots.
Cela met à jour ces colonnes, et non la ligne de configuration complète de l'équipement.

Ce que l'installation principale affiche pour la joignabilité d'un équipement correspond donc à la
vision du collecteur lors de la dernière transmission réussie. Un collecteur hors ligne possède une
vue actuelle de ses propres équipements que personne sur l'installation principale ne peut observer.

L'installation principale suit les collecteurs de la même façon qu'un collecteur suit les équipements.
Un assistant d'activité ne considère un collecteur distant activé comme opérationnel que lorsque son
horodatage de dernier état remonte à moins de deux fois l'intervalle de scrutation configuré. Cette
vérification ne garantit pas la livraison des échantillons, le succès de la réplication ou l'actualité
des graphiques.

## Modes de défaillance

| Défaillance | Conséquence | Ce que vous observez |
|---|---|---|
| Liaison vers l'installation principale | Le collecteur peut continuer localement tant que sa base et son ordonnanceur restent sains | Graphiques retardés et file d'attente croissante ; la livraison et les pertes doivent être contrôlées |
| Le collecteur lui-même | Les équipements qui lui sont assignés peuvent ne plus être scrutés | Échantillons manquants ; diagnostiquer l'ordonnanceur, les équipements et le collecteur |
| Réplication | Le collecteur fonctionne avec une configuration plus ancienne | Les modifications semblent ne pas prendre effet |
| La base de données centrale | Les processus distants peuvent passer en mode hors ligne si l'initialisation de connexion échoue | Ingestion centrale perturbée ; la mise en tampon dépend de la santé locale |
| Affectations obsolètes ou chevauchantes | Plusieurs producteurs peuvent soumettre des échantillons liés | Aucun rejet universel de transmission ; inspecter affectations, horodatages et erreurs d'écriture |

La mise en mémoire tampon peut convertir certaines pannes en retards, mais elle ne garantit pas une
livraison sans perte. Vérifiez l'âge de la file d'attente, la capacité de la base de données, les
erreurs de récupération et les horodatages RRD qui en résultent. Un graphique plat ne permet pas à
lui seul de distinguer une panne d'équipement d'une livraison retardée ou échouée.

## Ce qu'il en coûte

Par rapport à un scruteur central unique :

**Vous gagnez** des temps d'aller-retour parallélisés sur plusieurs machines, une scrutation
réalisée au plus près des équipements plutôt qu'à travers un réseau étendu (WAN), et la capacité de
poursuivre la collecte locale lorsque l'installation principale est inaccessible, sous réserve des
limites de récupération et de santé locale exposées ci-dessus.

**Vous payez** avec une réplication de configuration qui peut accuser un retard, une seconde base
de données à exploiter, surveiller et sauvegarder par collecteur, un mode d'écriture différée qui
n'est plus optionnel, et une base centrale qui reçoit désormais des écritures concurrentes de chaque
collecteur.

Le bilan sincère est qu'un collecteur distant est une machine supplémentaire à administrer. Un seul
scruteur doté de processus supplémentaires est un réglage. Un collecteur est une infrastructure,
avec sa propre base de données, ses propres identifiants, sa propre horloge et sa propre version de la
vérité pendant tout le temps où la réplication ne s'est pas exécutée.
