---
title: Permissions et accès
description: Pourquoi l'accès est scindé en deux systèmes indépendants, pourquoi une permission est stockée sous forme de valeur par défaut avec exceptions, et pourquoi une arborescence diffère selon le compte.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 8
---

L'accès repose sur deux niveaux de vérification distincts : les domaines et les politiques d'objets.
Les domaines définissent les fonctions de l'interface qu'un compte est autorisé à employer ; les
politiques d'objets déterminent la visibilité des graphiques, appareils, modèles et arborescences.
Une requête donnée peut être tributaire des deux volets. Les attributions de domaine n'ouvrent aucun
droit sur les graphiques, et les droits sur les graphiques n'autorisent pas l'accès aux fonctions de
la console. L'état du compte, le mode d'authentification et les préférences d'affichage entrent
également en ligne de compte.

Cette page explicite l'architecture de ce modèle. Pour les aspects pratiques de la gestion d'un compte,
reportez-vous à [Gérer les utilisateurs et les permissions](/fr-ca/guides/manage-users-and-permissions/).

## Pourquoi deux systèmes

Les deux interrogations relèvent de registres distincts.

L'accès à une page intéresse le code. Soit le compte est habilité à exécuter l'éditeur d'appareils,
soit il ne l'est pas, et la réponse s'applique à l'installation tout entière. La consultation d'un
appareil touche aux données. Les appareils se comptent par milliers et la réponse varie pour
chacun d'eux.

Fusionner ces concepts imposerait de gérer une permission par page et par objet, c'est-à-dire le
produit de deux listes en expansion permanente. Les scinder permet d'obtenir une liste de rubriques
d'interface, figée et réduite, et un ensemble de règles par objet. La contrepartie de cette scission
réside dans l'obligation de configurer les deux dimensions ; une anomalie dans l'une ou l'autre produit
les mêmes symptômes d'accès bloqué.

## Les domaines sont une liste numérotée fixe

Un domaine formalise une permission d'interface par un identifiant numérique. Les associations du
noyau relient les pages à des domaines, tandis que les modules d'extension peuvent en inscrire de
nouveaux. Contrôlez les domaines et l'identité exigés pour la route effective plutôt que d'assimiler
l'accès à une page à une décision d'autorisation globale sur les objets.

Ce choix de numéros plutôt que de chemins de fichiers s'explique par le fait qu'un domaine englobe
plusieurs pages et que celles-ci peuvent changer de nom. Le numéro persiste ; la liste sous-jacente
constitue une correspondance modifiable sans impacter les comptes utilisateurs.

Les domaines rattachés à un compte proviennent de ses paramètres propres et des groupes actifs dont
il est membre, combinés par union. Les rôles forment des ensembles d'identifiants de domaine appliqués
en une seule opération. Un rôle reporte ses numéros sur le compte et son action s'arrête là : il s'agit
d'un canevas initial et non d'une liaison dynamique, de sorte qu'un compte issu d'un rôle ne réagit pas
aux altérations ultérieures de ce dernier.

Les modules d'extension ajoutent leurs propres domaines, stockés de manière distincte et attribués aux
comptes selon les mêmes modalités que les domaines de base. Tout module d'extension introduit ainsi une
nouvelle surface soumise à contrôle d'accès que vos politiques doivent examiner expressément. Consultez
[Plugins](/fr-ca/concepts/plugins/).

## Les objets sont stockés sous forme de valeur par défaut avec exceptions

Quatre catégories d'objets gèrent des permissions : les graphiques, les appareils, les modèles de
graphiques et les arborescences.

Pour chaque catégorie, un compte (ou un groupe) dispose d'une politique par défaut et d'une liste
d'exceptions. Une exception consiste en une ligne élémentaire : l'identité, l'objet concerné, la
catégorie. Cette ligne est strictement identique dans les deux modes de politique. C'est la politique
qui confère son sens à cette ligne.

Il s'agit du principe directeur de l'architecture. Seuls les écarts par rapport à la règle par défaut
sont enregistrés dans les tables d'exceptions. Un défaut d'autorisation sans exception accorde un
accès général sans générer de lignes d'exception ; les enregistrements de compte, de règles par défaut
et de domaine subsistent néanmoins. Cinq appareils explicitement autorisés sous un défaut de refus
requièrent cinq exceptions d'appareils, mais d'autres règles et méthodes de graphique peuvent en
modifier la visibilité. Quelle que soit l'orientation retenue, le volume de données conservées reste
proportionnel aux règles spécifiques plutôt qu'à la totalité du parc.

## Pourquoi les deux modes de politique existent

| Mode | Signification | Comportement lors de l'ajout d'un appareil |
|---|---|---|
| Autoriser, avec exceptions | Objets de cette catégorie à l'exclusion des éléments listés | La politique d'appareil autorise le nouvel élément ; les autres contrôles s'appliquent toujours |
| Refuser, avec exceptions | Uniquement les objets listés pour cette catégorie | Cette source n'accorde aucun appareil supplémentaire ; d'autres sources ou permissions de graphique peuvent donner accès |

Les politiques par défaut se distinguent par leur réaction face aux nouveaux éléments. Déterminez le
périmètre d'application et la conduite en cas d'erreur de façon réfléchie ; aucun des deux réglages ne
résume à lui seul l'ensemble des contrôles d'accès de la requête.

« Tous les membres du réseau, sauf les deux baies affectées à la comptabilité » représente deux lignes
sous le régime d'autorisation et quatre mille sous celui du refus. « Ce prestataire extérieur, limité
à ces cinq appareils » mobilise cinq lignes sous le régime de refus et quatre mille sous celui de
l'autorisation. Imposer un mode unique obligerait à énumérer la totalité du parc pour la moitié des
politiques en production, et une liste d'une telle ampleur finit invariablement par devenir obsolète.

Un défaut d'autorisation englobe immédiatement les nouveaux objets de sa catégorie, sauf exclusion
explicite. Un défaut de refus réclame une exception spécifique issue de cette source. Il s'agit de
règles sémantiques de politique par défaut, et non de garanties relatives au traitement des erreurs.
Analysez les autres utilisateurs ou groupes ainsi que les méthodes de permission de graphiques avant
de conclure qu'un refus sur les appareils masque systématiquement leurs graphiques.

## L'accès est une union, et il n'y a pas de refus

L'accès effectif résulte de l'évaluation conjointe de la politique du compte et de chacun des groupes
actifs auxquels il appartient. S'agissant des graphiques, appliquez d'abord la méthode de graphique
retenue au sein de chaque source prise isolément, puis regroupez ces résultats par union. Sous la méthode
Restrictive, l'octroi d'un appareil dans un groupe et celui d'un modèle dans un autre ne forment pas la
combinaison exigée.

Il n'existe aucun refus au niveau du groupe capable de révoquer un droit concédé par une autre source.
Une exclusion enregistrée sous un défaut d'autorisation retranche uniquement l'apport de cette source ;
elle ne constitue pas un refus universel. Retirer une telle exclusion élargit l'accès, à la différence
du retrait d'une autorisation sous un régime de refus. Cette restriction relève d'un choix délibéré :
un modèle combinant autorisations et refus exigerait des critères de priorité complexes, lesquels rendent
les systèmes d'habilitation impossibles à auditer par simple lecture.

Les conséquences méritent d'être formulées sans détour.

Révoquer un droit implique de le retirer sur le compte individuel et sur l'ensemble des groupes qui
l'octroient. Le supprimer sur un profil ne change rien si un groupe continue de l'accorder par ailleurs.

Désactiver un groupe supprime immédiatement ses attributions pour l'ensemble de ses membres, ce qui
fait du groupe un moyen de révocation bien plus sûr qu'une série de modifications individuelles.

Impossible de déterminer ce qu'un compte peut visualiser en consultant un seul enregistrement. Il est
impératif de combiner les quatre politiques et listes du compte avec celles de l'ensemble de ses groupes.

## Pourquoi la permission de graphique comporte quatre méthodes

Un graphique possède une triple nature. Il existe par lui-même, il est rattaché à un appareil, et il
dérive d'un modèle de graphique. Ces trois entités pouvant porter des habilitations, le système doit
trancher pour savoir quelle combinaison s'applique. Ce choix s'effectue par une option générale à
l'installation.

| Méthode | Question posée | Ensembles d'exceptions examinés |
|---|---|---|
| Permissive | L'un des trois éléments au moins est-il autorisé ? | Trois |
| Restrictive | Le graphique est-il autorisé, ou l'appareil et le modèle le sont-ils tous deux au sein d'une même source ? | Trois |
| Basée sur l'appareil | Le graphique ou l'appareil est-il autorisé ? | Deux |
| Basée sur le modèle de graphique | Le graphique ou le modèle est-il autorisé ? | Deux |

Ces critères régissent les contrôles d'autorisation en place. Les attributions directes de graphiques
restent valables sous les quatre méthodes ; opter pour une approche basée sur l'appareil ne les
annule pas. Mesurez les temps de réponse sur vos règles et vos volumes réels plutôt que de présumer
du coût d'une requête d'après le nombre d'ensembles d'exceptions.

Le mode Permissif est retenu par défaut, et c'est celui qui déroute le plus fréquemment les exploitants.
Sous cette méthode, autoriser un modèle de graphique valide tous les graphiques qui en découlent, sur
l'ensemble des appareils, y compris ceux auxquels le compte n'a jamais eu accès. Le moteur se conforme
rigoureusement à sa définition. Simplement, cette logique ne correspond pas à l'intuition première.

## Les permissions sont compilées dans les requêtes

Le filtrage des permissions de graphiques est directement intégré aux requêtes de base de données. Une
page affichant vingt graphiques sur un ensemble de quatre mille ne peut pas extraire quatre mille lignes
pour écarter a posteriori celles interdites à l'utilisateur : le calcul d'effectif serait faussé, la
pagination rompue, et la charge dépendrait du volume global plutôt que de la taille de la page.

Les politiques et les listes d'exceptions sont ainsi traduites en clauses de jointure et conditions de
sélection confiées à la base de données. L'architecture des permissions a été pensée pour supporter
cette conversion. Des listes d'identifiants et un indicateur par défaut se traduisent aisément en SQL.
Une logique métier arbitraire par objet s'y prête très mal.

L'accès aux graphiques bénéficie d'une optimisation pour les autorisations globales, notamment lorsqu'un
utilisateur possède une politique par défaut d'autorisation sans aucune exception de graphique. Ne
généralisez pas ce raccourci à tous les types d'objets ou à tous les points d'entrée. Les vérifications
de domaine, d'état du compte et de préférences d'affichage demeurent requises ; l'optimisation des
requêtes SQL ne dispense pas de tester les règles d'accès.

## Les arborescences constituent un axe distinct

L'habilitation sur une arborescence et celle sur les graphiques s'évaluent de manière autonome. Accéder
à une arborescence ne confère aucun droit sur son contenu. Disposer d'un droit sur un graphique n'exige
pas d'avoir accès à une arborescence.

Une arborescence matérialise une disposition d'objets, et non un conteneur propriétaire. Un même graphique
peut figurer dans cinq arborescences différentes. Si l'arborescence accordait des droits sur ses éléments,
modifier une arborescence équivaudrait à modifier les permissions, et quiconque ordonnerait des graphiques
se retrouverait habilité à les diffuser.

L'arborescence se contente donc de dissimuler les sections vides. Une branche s'affiche dès lors qu'elle
renferme un élément consultable par le compte, le test étant récursif : une branche dont toutes les
sous-branches s'avèrent inaccessibles pour ce compte est masquée à son tour. Deux personnes ouvrant la même
arborescence perçoivent des structures distinctes, sans qu'aucun repère n'indique ce que l'autre aperçoit.

Ce contrôle de vacuité a un coût. Il explore l'arborescence et formule les interrogations de droits sur
les graphiques et appareils découverts. Une arborescence profonde associée à une méthode d'évaluation
lourde nuit aux performances, ce qui justifie l'existence de méthodes d'évaluation plus directes.

L'enjeu d'audit surpasse la considération de performance. **Une vue en arborescence ne constitue pas un
rapport exhaustif des accès d'un compte.** Elle reflète uniquement ce à quoi un compte accède *parmi ce
qui a été positionné sur cette arborescence*. Pour contrôler des accès, examinez les politiques et
vérifiez concrètement les requêtes admises et rejetées. L'écran de politique effective procède d'un code
distinct des contrôles d'autorisation ; son libellé et son infobulle ne doivent pas faire office de preuve
unique. Consultez [Auditer qui peut voir quoi](/fr-ca/guides/audit-who-can-see-what/).

## La mise en cache et pourquoi les changements prennent effet à des moments inhabituels

Les réponses d'autorisation sont placées en cache de session, afin d'éviter de reproduire la même
interrogation sur chaque page consultée. Toute modification apportée par un administrateur marque les
résultats en cache du compte concerné comme périmés ; la page suivante chargée par cet utilisateur
les recalcule sans attendre une reconnexion complète.

La désactivation d'un compte purge les identifiants persistants, les permissions en cache et les
sessions côté serveur. Les requêtes protégées contrôlent également l'état actif/verrouillé ; une page
déjà rendue dans un navigateur n'est pas effacée pour autant. Les routes tolérant les accès invités
peuvent associer un profil invité distinct si elles sont configurées ainsi, de sorte qu'une réponse
positive ne garantit pas que le compte désactivé conserve ses droits.

Vérifiez les évolutions en vous appuyant sur des sessions existantes et de nouvelles sessions, en
observant les droits conservés comme les droits révoqués, et en consignant le contenu de la réponse
ainsi que l'identité active. Ne tenez pas le statut HTTP pour unique confirmation d'autorisation,
et ne présumez pas que chaque composant exploitant le cache s'actualise de façon synchrone.
