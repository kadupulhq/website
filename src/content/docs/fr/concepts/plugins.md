---
title: Greffons
description: Pourquoi la surface d'extension est une liste de points d'ancrage nommés, ce qu'un greffon hérite en s'exécutant dans le processus et ce que les garde-fous arrêtent et n'arrêtent pas.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 11
---

Un greffon est du code que l'application inclut dans son propre processus et appelle à des
points nommés. Toutes les autres propriétés du modèle de greffon découlent de cette seule phrase.

Pour savoir quoi lire avant d'installer le greffon d'un tiers, voir
[Installer et vérifier les greffons](/fr/guides/install-and-vet-plugins/).

## Pourquoi il s'exécute dans le processus

Regardez à quoi servent les greffons : ajouter une colonne à une liste que l'application affiche,
modifier les options d'un graphique avant son tracé, intervenir lors de la suppression d'un
équipement ou attacher un onglet. Chacune de ces opérations est une modification d'un élément
que l'application détient en mémoire à cet instant précis.

Un processus de travail isolé nécessiterait une interface explicite et une validation de ses
résultats. Cela peut préserver l'isolation des privilèges, mais ce n'est pas le mécanisme retenu
ici : le fichier du greffon est inclus et sa fonction est appelée directement dans le processus de
l'application.

## Ce dont le greffon hérite

Le code du greffon s'exécute sous le compte de système d'exploitation appelant, avec accès à la
connexion de base de données et aux autorisations de système de fichiers du processus. Un appelant
web peut également disposer d'une session ; un appelant en ligne de commande (CLI) n'en possède
pas nécessairement une. Le mécanisme de greffon ne fournit aucune identité distincte, aucun bac à
sable ni aucune vérification de signature.

Les autorisations des utilisateurs et des groupes régissent l'accès à l'application ; elles ne
contiennent pas de code PHP arbitraire issu d'un greffon. Les privilèges de base de données, les
permissions du système de fichiers et les restrictions de processus limitent toujours ce que ce
processus peut accomplir. Examinez le greffon avant l'installation et maintenez les privilèges du
compte applicatif à un niveau restreint.

## Deux modes d'appel

| Style | L'application | Un greffon qui ne renvoie rien |
|---|---|---|
| Notification | Transmet des arguments, ignore le résultat | La valeur de retour est ignorée ; les effets secondaires et les exceptions importent toujours |
| Transformation | Transmet une valeur, utilise ce qui revient | Peut remplacer la valeur par null et interrompre les appelants en aval |

Le mode de transformation permet à un greffon d'ajouter un bouton, d'étendre une liste d'actions
ou de modifier un graphique. C'est également là que les greffons s'entremêlent : deux greffons sur
le même point voient chacun la sortie du précédent dans l'ordre de greffons configuré.

Le répartiteur n'émet un avertissement indiquant qu'un tableau devient un non-tableau, ou qu'une
valeur auparavant non vide devient équivalente à null, que lorsque plusieurs lignes de point
d'ancrage correspondantes sont présentes. Cette vérification ne constitue pas une validation
complète du contrat d'ancrage ; un seul greffon peut corrompre une valeur sans déclencher cet
avertissement.

## L'enregistrement est un état, pas une découverte

Les points d'ancrage (hooks) résident dans une table : quel greffon, quel nom d'ancrage, quel
fichier, quelle fonction, activé ou non. Les routines d'installation, de mise à niveau et de
configuration peuvent enregistrer des points d'ancrage ; l'enregistrement ne se limite pas à la
première installation.

L'alternative consisterait en une découverte au moment de la requête, ce qui impliquerait de
parcourir le répertoire des greffons et d'inclure le code de chaque greffon pour lui demander ce
qu'il souhaite. Une seule page atteint de nombreux points d'ancrage. Tout inclure pour constater que
rien n'est attaché est la solution coûteuse ; l'application interroge donc la table, met en cache la
réponse pour la requête et n'inclut que le fichier nommé par une ligne correspondante.

Ce choix entraîne un coût utile à connaître. La table peut être en désaccord avec le système de
fichiers. Un répertoire de greffon supprimé manuellement laisse ses lignes derrière lui. Les rappels
de notification manquants peuvent produire des avertissements temporisés ; le répartiteur de
transformation ne dispose d'aucun avertissement équivalent pour les rappels manquants. Un journal
silencieux ne prouve pas que l'enregistrement est sain.

L'ordre d'exécution découle de l'ordre d'enregistrement du greffon et reste modifiable. Une chaîne
de transformation est donc ordonnée par un paramètre sous le contrôle d'un administrateur.

## Ce à quoi un greffon peut accéder

| Capacité | Note |
|---|---|
| Créer ses propres tables | Enregistré, afin que la désinstallation puisse les supprimer |
| Ajouter des colonnes aux tables existantes, y compris celles du cœur | Enregistré, afin que la désinstallation puisse les retirer |
| Enregistrer des domaines de permissions | Nouvelles sections de l'interface soumises au contrôle d'accès |
| Déclarer des dépendances envers d'autres greffons | Version vérifiée avant l'installation |
| S'exécuter sur des collecteurs distants | La répartition dépend de l'ancrage, du style d'appel, des capacités et de l'état de connexion |

Les modifications de schéma enregistrées expliquent pourquoi la désinstallation est destructive.
L'application peut supprimer les tables et colonnes suivies, données comprises. Elle appelle
également le rappel de désinstallation du greffon avant le nettoyage. Ce rappel peut apporter
d'autres modifications ; les modifications non suivies ne sont pas automatiquement annulées, et le
répertoire source du greffon subsiste.

Les domaines enregistrés par un greffon sont détenus par les utilisateurs et les groupes de la même
manière que les domaines de base. De nouveaux domaines peuvent également accorder l'accès à
l'administrateur principal et à l'utilisateur de la session courante lorsque l'enregistrement le
demande. Examinez les attributions qui en résultent après l'installation et la mise à niveau ; ne
présumez pas que votre stratégie existante couvre la nouvelle surface.
Voir [Permissions et accès](/fr/concepts/permissions-and-access/).

## Ce que les garde-fous protègent réellement

Il existe des garde-fous, et leur lecture révèle le modèle de menace sous-jacent.

Le fichier désigné par un point d'ancrage est résolu à l'intérieur du propre répertoire de ce
greffon. Un chemin qui s'en échappe est refusé et consigné comme événement de sécurité. Le nom du
répertoire d'un greffon est limité aux lettres, chiffres, tirets bas et tirets. L'enregistrement des
points d'ancrage et des domaines n'est accepté que depuis une fonction dont le nom ressemble à une
routine d'installation, de mise à niveau ou d'initialisation ; un appel provenant de tout autre
endroit est rejeté et consigné.

Le garde-fou de chemin restreint le fichier qu'une ligne d'ancrage peut inclure. La vérification
d'enregistrement examine uniquement le nom de la fonction appelante à la recherche des termes
d'installation, de mise à niveau ou d'initialisation ; elle n'authentifie pas une opération de cycle
de vie. Le code d'un greffon peut employer un tel nom lors du chargement ordinaire d'une page, de
sorte que cette convention ne constitue pas une frontière de sécurité.

Ces mécanismes n'ont aucun effet sur les actions exécutées par le code propre au greffon une fois
lancé. Ils ne constituent pas une frontière de confinement et n'ont pas été conçus comme tels.

## Désactivé ne signifie pas éteint

Quelques types de points d'ancrage sont enregistrés à l'état activé dès l'installation : ceux qui
fournissent des pages de paramètres, des tableaux de configuration et des définitions de formulaires.
Un greffon doit être configurable avant d'être activé, de sorte que ces routines s'exécutent dans les
deux cas.

Un greffon désactivé possède donc toujours du code inclus et exécuté lors de certains chargements
de page. La désactivation est un commutateur de fonctionnalité, et les URL directes du greffon
doivent également faire l'objet d'un examen. Si vous suspectez du code malveillant, isolez
l'installation et examinez la procédure de suppression avant d'invoquer la désinstallation, qui
exécute elle-même le code du greffon. La seule suppression des fichiers sources ne nettoie pas les
enregistrements et n'annule pas les modifications de base de données.

## Les collecteurs distants disposent d'une surface plus étroite

Un greffon déclare ses capacités dans son fichier d'informations : s'il fonctionne lorsque le
collecteur peut joindre l'installation principale, s'il fonctionne lorsqu'il ne le peut pas, et s'il
participe à la collecte.

Sur un collecteur, les points d'ancrage répertoriés sont vérifiés par rapport aux exigences de
capacité. Les points de transformation non répertoriés sont toujours distribués ; les points de
notification non répertoriés peuvent l'être en ligne ou lorsque le greffon déclare une prise en
charge de gestion/visualisation hors ligne. Les omissions ne sont pas universellement consignées.
Il s'agit d'une logique de routage, non d'une liste blanche absolue ni d'une frontière d'isolation ;
inspectez le répartiteur exact et l'état de connexion pour le point d'ancrage utilisé.

La raison en est qu'un collecteur constitue un environnement distinct. Sa configuration est une
réplique susceptible d'avoir plusieurs heures, et il peut ne disposer d'aucun lien avec la base de
données centrale. Un point d'ancrage écrit en supposant que la base de données centrale se trouve à
une seule requête de distance y est inopérant ; le modèle exige donc que le greffon indique
explicitement les hypothèses sur lesquelles il repose plutôt que de les déduire.
Voir [Collecte de données distante](/fr/concepts/remote-data-collection/).

## Le scruteur est l'emplacement le plus coûteux pour un point d'ancrage

Un point d'ancrage placé sur le chemin de scrutation s'exécute lorsque son point d'appel est atteint.
Sa fréquence dépend de l'événement, du processus et du routage du collecteur ; tous les points ne
s'exécutent pas dans chaque processus à chaque cycle. Un code lent sur un chemin fréquent consomme
l'intervalle de scrutation et peut entraîner des lacunes sur les graphiques.

Un point d'ancrage sur une page s'exécute une seule fois pour une personne qui attend déjà. Les deux
se présentent de façon identique dans la table d'enregistrement, mais diffèrent de plusieurs ordres
de grandeur quant à leur coût.

## Pourquoi la surface semble irrégulière

L'API de points d'ancrage expose des points d'appel aux objectifs et structures d'arguments très
variés.

C'est pourquoi la liste est étendue et hétérogène, pourquoi certains points transmettent une valeur
à modifier tandis que d'autres signalent simplement la survenue d'un événement, et pourquoi les
arguments varient d'un point à l'autre. Une version minimale déclarée du cœur n'établit pas la
compatibilité avec chaque point d'ancrage : examinez les arguments et les attentes de retour de
chaque point d'appel et testez le greffon sur la version cible. Les limitations de compatibilité CLI
et d'attribution de domaines décrites dans
[Installer et vérifier les greffons](/fr/guides/install-and-vet-plugins/) s'appliquent également ;
le succès de l'installation seul ne prouve pas la compatibilité.

La conclusion pratique : un greffon est couplé à la version du cœur pour laquelle il a été conçu,
beaucoup plus étroitement que ne le laisse supposer sa version minimale déclarée. Réexaminez les
greffons avant une mise à niveau du cœur plutôt qu'après.
