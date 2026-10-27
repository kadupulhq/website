---
title: Ajouter un premier appareil
description: Mettez en place la collecte sur un premier appareil et confirmez que les données arrivent avant de construire quoi que ce soit d’autre.
sidebar:
  order: 3
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Traduction provisoire, en attente de relecture par une personne maîtrisant la langue.
---

Ajoutez un appareil, confirmez qu’il répond, et seulement ensuite passez à la suite. La plupart des difficultés rencontrées avec un système de surveillance proviennent d’un appareil qui n’a jamais réellement répondu dès le départ.

Choisissez un appareil pour lequel vous pouvez vous permettre une erreur. Un commutateur qui vous appartient, sur un réseau que vous contrôlez, avec SNMP déjà activé. Ne commencez pas par l’appareil au sujet duquel quelqu’un vous sollicite.

## Avant de commencer

Pour cet exemple SNMP, l’appareil doit répondre aux requêtes de son collecteur assigné. Exécutez les vérifications sur ce collecteur, de préférence sous le compte utilisateur du sondeur ; une requête émise depuis votre ordinateur portable peut emprunter un chemin de pare-feu différent. Remplacez l’adresse et la communauté de l’exemple par les identifiants en lecture seule configurés sur votre appareil. Les OID numériques ci-dessous fonctionnent également lorsque les fichiers locaux de noms MIB ne sont pas installés.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Si cette commande renvoie une chaîne de description, poursuivez. Si elle expire, corrigez d’abord ce problème. Aucune configuration dans l’interface web ne permettra à un appareil inaccessible de répondre.

Vérifiez ensuite la table que vous souhaitez réellement représenter sous forme de graphique, car un appareil peut répondre à `sysDescr` tout en refusant la table des interfaces.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

Le second OID correspond à la colonne `ifDescr`. Vous devez obtenir une ligne par interface exposée. Un résultat vide peut indiquer une vue SNMP restreinte ou une table non prise en charge ; une erreur d’autorisation oriente vers les identifiants ou la politique d’accès. Examinez l’erreur renvoyée avant de modifier la configuration de l’appareil ou de Kadupul.

Deux caractéristiques des versions SNMP influencent les choix ultérieurs, fixez-les dès maintenant.

| Version | Ce que cela implique pour vous |
|---|---|
| v1 | Pas de prise en charge de Counter64. Les liaisons rapides peuvent faire boucler les compteurs d’octets 32 bits plusieurs fois entre deux collectes, rendant le débit ambigu |
| v2c | Prend en charge Counter64 lorsque l’agent l’expose ; les chaînes de communauté circulent en texte clair |
| v3 | Prend en charge l’authentification et le chiffrement avec `authPriv` ; choisir v3 seul n’active pas automatiquement les deux |

Privilégiez la version v3 avec `authPriv` lorsqu’elle est prise en charge, ou v2c sur un réseau de gestion restreint. Sélectionnez le type de graphique d’interface 64 bits ainsi que la version SNMP. Si l’appareil ne gère que la version v1, tenez compte de l’intervalle de collecte et du débit de trafic indiqués dans le tableau des pannes au bas de cette page. [SNMP](/fr-ca/reference/snmp/) détaille l’ensemble des champs d’authentification.

## Décider de trois points avant d’ouvrir le formulaire

**Les identifiants.** Exactement ceux testés ci-dessus, y compris le port s’il ne s’agit pas de celui par défaut.

**La méthode de disponibilité.** C’est ainsi que Kadupul détermine si l’appareil est opérationnel, indépendamment du bon fonctionnement de la collecte. Les choix fournis sont none, ping, SNMP uptime, SNMP description, SNMP getNext, ainsi que deux combinaisons de ping avec SNMP uptime, l’une exigeant les deux et l’autre acceptant l’un ou l’autre.

Privilégiez une méthode SNMP pour un appareil interrogé via SNMP. Cela teste directement le service dont vous dépendez. Le ping ICMP nécessite un socket brut, ce qui requiert des privilèges dont les utilisateurs web et de collecte ne disposent normalement pas ; un appareil qui répond au `ping` depuis votre shell peut donc toujours être signalé comme arrêté. Un ping TCP ciblant un port reconnu ouvert permet d’éviter cet écueil.

**Le modèle d’appareil.** Choisissez-en un correspondant au matériel.

## L’ajouter

1. Dans la page historique **Devices** (`host.php`), choisissez **Add**. La création d’appareils et la configuration des graphiques utilisent encore cette page pendant la migration Symfony. Saisissez une description, le nom d’hôte ou l’adresse, le collecteur assigné, la version SNMP et les identifiants.
2. Définissez la méthode de disponibilité retenue.
3. Choisissez le modèle d’appareil.
4. Enregistrez, confirmez que l’appareil est activé et consultez son panneau de disponibilité/SNMP. Un enregistrement sauvegardé en base de données ne constitue pas une preuve de réussite de la collecte.

## Ce que détermine le modèle d’appareil

Un modèle d’appareil associe des modèles de graphiques et des requêtes de données à l’appareil. Une requête de données parcourt une table sur l’appareil, comme ses interfaces, et produit un index par ligne. L’application du modèle exécute également ses requêtes de données afin de renseigner ces index. Lorsque l’automatisation des graphiques est désactivée, ces associations ne créent pas de graphiques à elles seules. Lorsque l’automatisation des graphiques est activée, des déclencheurs de modèle/requête peuvent générer des graphiques selon les règles de correspondance ; inspectez les graphiques existants avant d’ajouter un doublon.

Changer de modèle peut modifier les associations et réexécuter ces déclencheurs. Cela ne réinitialise pas les graphiques ou sources de données existants. Vérifiez le modèle sélectionné et les index interrogés avant de l’appliquer à un appareil disposant déjà d’un historique.

Ces index expliquent pourquoi vous sélectionnez les interfaces dans une liste au lieu de saisir des OID. [Modèles](/fr-ca/concepts/templates/) et [Requêtes de données et index](/fr-ca/concepts/data-queries-and-indexes/) détaillent ces deux mécanismes.

## Lire le panneau d’état

Lorsque l’appareil est enregistré avec une méthode de disponibilité SNMP, Kadupul ouvre une session et en rapporte le résultat. C’est la vérification essentielle, et c’est celle qui est fréquemment ignorée.

| Ce que vous observez | Ce que cela signifie |
|---|---|
| Les requêtes système et de temps d’activité réussissent | Le panneau peut lire les métadonnées SNMP de base. Cela ne démontre pas encore la collecte des interfaces |
| Emplacement ou Contact est vide | Ces champs de métadonnées facultatifs peuvent ne pas être définis ; leur absence ne constitue pas un échec de collecte |
| SNMP n’est pas utilisé | Aucune communauté ni aucun utilisateur sur l’appareil, ou la version est définie sur none |
| Erreur SNMP de session | L’établissement de la session a échoué ; inspectez l’erreur affichée, les identifiants, le protocole et les paramètres de connexion |
| Erreur SNMP système | La lecture de `sysDescr` a échoué ; vérifiez l’erreur renvoyée, la vue de l’agent, les identifiants et l’accessibilité |
| Erreur SNMP de l’hôte | Ni la description ni le temps d’activité n’ont été renvoyés |
| Temps d’activité affiché sous la forme `U` | Le temps d’activité n’a pas pu être lu. Certains appareils ne le rapportent réellement pas |

Si la méthode de disponibilité inclut le ping, un résultat de ping distinct s’affiche en dessous. Lisez les deux. Un appareil peut réussir l’un et échouer à l’autre, et l’élément en échec vous indique où concentrer vos recherches.

Une description système vide ne prouve pas que la collecte échoue. Le code prend en charge les agents présentant une description vide et un temps d’activité exploitable. Les appareils désactivés contournent la vérification de disponibilité, et les méthodes de disponibilité sans SNMP n’affichent pas ce panneau SNMP. Vérifiez ensuite la requête réelle et le cache du collecteur.

## Créer les sources de données et les graphiques

Pour un nouvel appareil sans graphiques créés par automatisation, l’étape suivante consiste à créer le graphique et sa source de données. Vérifiez **Data Source List** et **View Poller Cache** sur la page de l’appareil au lieu de supposer qu’ils sont vides.

Depuis la page de l’appareil, choisissez **Create Graphs for this Device**. Pour un commutateur, cela implique d’exécuter la requête de données d’interfaces, de sélectionner les interfaces qui vous intéressent et de choisir un type de graphique pour celles-ci. Choisissez deux ou trois interfaces, pas l’ensemble des quarante-huit. Vous cherchez à valider le bon fonctionnement du flux, et un premier lot restreint est bien plus simple à analyser à l’étape suivante.

Un graphique indexé associe des sources de données à l’interface choisie et prépare leurs entrées dans le cache du collecteur ; les sources existantes compatibles peuvent être réutilisées. La réponse de création de graphique ne prouve pas le déroulement de la collecte. Vérifiez que le cache contient bien l’appareil attendu, les OID d’interface et le chemin RRD.

## Confirmer que la collecte fonctionne

Attendez les cycles de collecte planifiés, puis vérifiez à la fois les horodatages et les valeurs. Un graphique vide peut signaler une normalisation de démarrage, une valeur inconnue ou un échec de collecte. Deux relevés de compteur sont nécessaires pour calculer un débit, mais deux passages du collecteur ne garantissent pas un intervalle d’archive complet et valide.

Vérifiez trois éléments, dans cet ordre.

**Le collecteur s’est exécuté.** Recherchez le récapitulatif de fin d’exécution dans le journal configuré. S’il est absent, vérifiez la planification, la destination du journal et les permissions, ainsi que l’éventuelle interruption prématurée du collecteur. Consultez [Journalisation](/fr-ca/reference/logging/).

**Le fichier existe et est récent.** Copiez le chemin RRD effectif depuis la source de données ou le cache du collecteur ; ne le devinez pas d’après le nom d’hôte. Les chemins et les noms peuvent être personnalisés. Consultez [Organisation des fichiers](/fr-ca/reference/file-layout/). Demandez à RRDtool la date de dernière écriture du fichier :

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

L’horodatage doit avancer lors des écritures réussies. Un horodatage récent peut toutefois accompagner une valeur inconnue, et la mise en mémoire tampon des écritures peut différer l’horodatage sur le disque. Pour `rrdcached` ou Boost, vérifiez également l’état de vidage de ce composant.

**La valeur n’est pas inconnue.** `lastupdate` affiche les dernières valeurs fournies ; pour un compteur, il s’agit de compteurs bruts et non de débits calculés. Examinez les lignes complètes issues de `fetch` pour y observer des débits finis. L’instant de démarrage, l’alignement des pas, le heartbeat, les limites et le seuil de données inconnues de l’archive influent tous sur l’apparition d’une ligne exploitable. Ne diagnostiquez pas une anomalie sur la seule base des deux premières lignes. Si les valeurs inconnues persistent, examinez les valeurs collectées, le type de source de données, le heartbeat et les erreurs du collecteur.

## Premières pannes fréquentes

| Symptôme | Cause habituelle |
|---|---|
| L’enregistrement réussit, mais la recherche de description système signale une erreur | Vérifiez les identifiants, la vue de l’agent et l’accessibilité du collecteur ; une description vide ne constitue pas à elle seule une preuve suffisante |
| Erreur SNMP de session depuis Kadupul, mais `snmpget` fonctionne depuis votre ordinateur portable | Le chemin de pare-feu diffère, ou l’agent applique une restriction selon l’adresse source |
| L’appareil apparaît arrêté, mais les données SNMP arrivent | La disponibilité est définie sur le ping ICMP, qui ne peut pas ouvrir de socket brut |
| La description apparaît, mais aucune donnée | Le collecteur n’est pas planifié, ou s’exécute sous un utilisateur qui ne peut pas écrire dans le répertoire RRD |
| La requête de données ne renvoie aucune interface | La vue de l’agent exclut la table des interfaces, ou l’appareil nécessite une réindexation |
| Première valeur inconnue, puis normale | Comportement normal pour un compteur. Deux relevés sont requis pour produire un débit |
| Les valeurs inconnues persistent | Échec de collecte, valeurs non valides, incompatibilité de types/limites, heartbeat ou normalisation d’archive |
| Données pendant un temps, puis des trous | Le collecteur met plus de temps que son intervalle, ou l’appareil limite le débit SNMP |
| Les débits du compteur sont invraisemblables | Bouclages 32 bits multiples, réinitialisation du compteur, unités ou réglages de source de données ; utilisez des compteurs 64 bits compatibles sur les liens rapides |
| Les interfaces affichent les mauvais ports après un redémarrage | Les index ont changé. La requête de données a besoin d’une méthode de réindexation capable de le détecter |

Ce dernier point mérite d’être compris avant de gérer une centaine de commutateurs : la stabilité des index d’interface SNMP n’est pas garantie après un redémarrage ou le changement d’un module. La méthode de réindexation d’une requête de données permet justement de maintenir un graphique associé au même port physique. [Requêtes de données et index](/fr-ca/concepts/data-queries-and-indexes/) présente les options disponibles.

Dès qu’un premier appareil collecte proprement ses données, ajoutez les autres en bloc plutôt qu’un à un. [Découvrir des appareils automatiquement](/fr-ca/guides/discover-devices-automatically/) et les outils en ligne de commande décrits dans [Outils en ligne de commande](/fr-ca/reference/command-line-tools/) sont bien préférables à la répétition de cette procédure cinquante fois.

Étape suivante : [Lire un premier graphique](/fr-ca/start/first-graph/).
