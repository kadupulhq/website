---
title: Découvrir les périphériques automatiquement
description: Balayez une plage réseau, associez les périphériques détectés à un modèle et laissez les règles construire les graphiques et branches d'arborescence, avec la création désactivée pour la découverte initiale.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 15
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni
aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de
leur faire confiance. Consultez l'[état du projet](/fr-ca/project/status/).
:::

L'automatisation repose sur deux mécanismes distincts faciles à confondre. La découverte parcourt
une plage d'adresses et identifie les périphériques. Les règles déterminent ce qui est construit pour un
périphérique une fois qu'il existe. Vous pouvez exécuter l'un sans l'autre, et la plupart des incidents
causés par l'automatisation surviennent lorsque l'on active les deux en même temps sans en mesurer
les conséquences immédiates.

## Définir la plage

Une plage réseau est une liste délimitée par des virgules. Chaque entrée adopte l'une des trois formes suivantes.

| Forme | Exemple | Remarques |
|---|---|---|
| CIDR | `192.168.1.0/24` | Accepte également un masque décimal à point, `192.168.1.0/255.255.255.0` |
| Caractère générique | `192.168.*.*` | Converti en interne vers le CIDR équivalent |
| Adresse unique | `192.168.1.10` | Balaye exactement cette adresse |

Les plages de début et de fin formulées comme `192.168.1.10-192.168.1.50` sont rejetées avec
une erreur. Elles ne sont pas prises en charge.

Utilisez des plages sans chevauchement, y compris entre réseaux pouvant s'exécuter simultanément.
La table de travail possède une clé unique globale sur l'adresse IP ; un doublon peut
rejeter l'intégralité d'un lot d'insertion, omettant les autres adresses du lot. Consultez
l'[anomalie #207](https://github.com/kadupulhq/kadupul/issues/207).

Tout fonctionne en IPv4. Le calcul de plage s'appuie exclusivement sur des conversions d'entiers 32 bits,
il n'y a donc aucun chemin IPv6 ici.

Les adresses de réseau et de diffusion sont exclues. Un `/24` balaye 254 adresses, de
`.1` à `.254`. Une entrée d'adresse unique en balaye une. Les adresses dont le dernier octet est 255
sont également ignorées pendant le balayage.

Avant qu'un balayage ne commence, chaque adresse de la plage est écrite dans une table de travail, à raison
d'une ligne par adresse, et les threads y réservent des lignes. Un `/16` écrit 65534 lignes avant
le premier ping. C'est un coût réel, et c'est la raison pour laquelle le balayage d'une vaste plage clairsemée
est lent même lorsque rien ne répond.

Associez un ensemble d'options SNMP à chaque plage. Le mode maître consigne une erreur et ignore
une plage dont l'identifiant d'ensemble SNMP est zéro. Une exécution ciblée n'applique pas cette protection ;
la lancer directement ne rend pas les options SNMP manquantes utilisables.

## Rythmer le balayage

| Paramètre | Fonction | Valeur par défaut |
|---|---|---|
| Discovery Threads | Threads parallèles réservant des adresses | 1 |
| Run Limit | La découverte est interrompue après ce délai | 20 minutes |
| Schedule Type | Manuel, quotidien, hebdomadaire, mensuel ou mensuel un jour donné | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP ou SNMP | Depuis la configuration globale |
| Ping Retries, Timeout | Coût d'échec par adresse | Depuis la configuration globale |

Les threads et la limite d'exécution interagissent mal s'ils ne sont pas calibrés. Cinquante threads
sur un `/16` constituent un balayage de ports pour tout système de détection d'intrusion.
Un seul thread sur la même plage atteindra la limite d'exécution et sera tué en cours de route,
laissant un résultat partiel semblable à un résultat complet.

Dimensionnez la plage afin qu'un balayage s'achève dans la limite impartie avec un nombre de threads
que votre réseau tolère. Plusieurs petites plages sont préférables à une grande, car chacune dispose de son
propre calendrier et de sa propre limite.

## Ce qu'un balayage effectue par adresse

1. Résoudre un nom. Des serveurs DNS alternatifs peuvent être indiqués sous forme de liste délimitée par des espaces ; si
   aucun n'est configuré, le résolveur propre au collecteur est utilisé. La recherche NetBIOS est un repli
   facultatif lorsque le DNS ne renvoie rien.
2. Vérifier si l'adresse ou ce nom correspond déjà à un périphérique. Si c'est le cas, l'adresse est
   marquée comme traitée. Cela supprime un périphérique existant détecté par ces valeurs ; ce n'est
   toutefois pas une garantie contre une création concurrente ou des alias divergents.
3. Envoyer un ping selon la méthode configurée. La méthode SNMP contourne le ping séparé.
4. Si le ping répond, ou si la méthode SNMP est sélectionnée, tenter SNMP et collecter `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` et la durée de fonctionnement.
5. Comparer les données système collectées aux règles de périphériques.

Une adresse qui répond au ping mais pas au SNMP est enregistrée comme trouvée et active. Une
adresse qui répond au SNMP mais ne correspond à aucune règle de périphérique est enregistrée comme trouvée, avec ses
données système, et rien n'est créé. Les deux aboutissent dans la liste des périphériques découverts.

La suppression des doublons est activée par défaut. Si un `sysName` a déjà été observé sur
une autre adresse dans les enregistrements de découverte stockés de ce réseau, ou existe sur un périphérique avec un autre
nom d'hôte, l'adresse est ignorée. C'est le comportement idéal pour un routeur doté de nombreuses
interfaces adressées, mais inadapté pour des équipements identiques derrière des adresses NAT distinctes,
situation que l'option de même sysName permet de désactiver.

Les périphériques existants peuvent voir leurs requêtes de données réexécutées pendant un balayage. Cette option est désactivée
par défaut et s'applique aux périphériques enregistrés comme actifs ou en récupération. La découverte utilise leur
état stocké pour cette décision ; elle ne sonde pas à nouveau un périphérique existant.

## Les règles de périphériques déterminent le modèle

Une règle de périphérique fait correspondre les données système à un modèle de périphérique. Chaque règle comporte un motif pour
`sysDescr`, `sysObjectID` et `sysName`. Le moteur de correspondance filtre chaque champ système
renvoyé non vide par le périphérique ; les motifs de règle vides correspondent à n'importe quelle valeur. Les règles
sont évaluées dans l'ordre séquentiel et la première correspondance l'emporte.

Utilisez des sous-chaînes littérales simples et vérifiez le modèle sélectionné dans les résultats de découverte.
Le moteur SQL actuel entoure les motifs regex de caractères `/` littéraux,
si bien qu'un motif ancré tel que `^Linux.*fixture$` échoue même si l'opérateur regex de la base de données
y correspond directement. Le repli sur les sous-chaînes ne corrige pas ce comportement. Consultez
l'[anomalie #206](https://github.com/kadupulhq/kadupul/issues/206). L'opérateur SQL `LIKE`
traite également `%` et `_` comme des caractères génériques.

Aucune correspondance signifie aucun périphérique. L'adresse est consignée dans la liste des périphériques découverts
avec les données système recueillies, et cette liste est l'endroit où vous écrivez la règle
manquante.

Placez les règles spécifiques au-dessus des règles générales. Une règle correspondant à la sous-chaîne `Linux`
placée au-dessus d'une règle constructeur revendiquera tout équipement mentionnant Linux dans sa
description.

## Prévisualiser la découverte avant d'activer la création

Le commutateur de création de périphériques sur une nouvelle plage est désactivé par défaut. Laissez-le désactivé
pour la passe initiale, et désactivez l'option de réexécution des requêtes de données des périphériques existants.
Cette passe met quand même à jour les enregistrements de découverte, les statistiques de balayage et les journaux, et peut envoyer
les notifications configurées. Elle ne prévisualise pas l'exécution des règles de graphiques ou d'arborescence.

Exécutez le balayage, puis lisez la liste des périphériques découverts. Elle affiche les découvertes enregistrées,
leurs données SNMP collectées et le modèle associé le cas échéant. Les périphériques
existants, les doublons supprimés et les adresses ignorées n'ont pas besoin d'y figurer.
Examinez la sortie de débogage par adresse ainsi que la liste.

Forcez un balayage depuis la ligne de commande plutôt que d'attendre une planification :

```bash
php poller_automation.php --network=3 --force --debug
```

Le drapeau de débogage affiche les décisions par adresse au fur et à mesure. Le processus maître,
qui lance les plages activées arrivées à échéance, correspond à un mode distinct :

```bash
php poller_automation.php -M
```

La commande ciblée avec `--force` exécute également un réseau désactivé. L'ajout de `--force` au
mode maître contourne la vérification du calendrier et peut également lancer les réseaux désactivés.
Utilisez la forme ciblée lors de la validation d'une seule plage.

Vérifiez trois points dans le résultat avant d'activer la création :

- Le nombre de périphériques correspond à vos attentes. Un total bien supérieur à votre inventaire
  signifie généralement que la plage est plus vaste que prévu.
- Les modèles choisis sont pertinents. Une colonne affichant le même modèle générique partout
  indique que vos règles ne correspondent pas.
- Aucun élément crucial ne manque. Pour un équipement absent, vérifiez l'expansion de la plage, la fin des workers,
  la suppression des doublons et périphériques existants, la politique de ping et les résultats SNMP.
  L'absence de la liste ne prouve pas à elle seule qu'il est inaccessible.

## Règles de graphiques et d'arborescences

Dès qu'un périphérique existe, les règles de graphiques et d'arborescences déterminent ce qui y est construit.
La découverte peut invoquer cette automatisation après la création d'un périphérique, et la CLI peut
l'appliquer aux périphériques existants. Les règles individuelles doivent être activées.
Les commutateurs globaux d'automatisation gouvernent des hooks de création particuliers ;
ils ne constituent pas une interdiction générale de l'automatisation explicite en CLI.

Une règle de graphique comporte trois volets : les périphériques cibles, les index découverts cibles
au sein d'une requête de données, et le type de graphique à créer. Les deux volets de sélection
sont formés d'éléments de règle associant un champ, un opérateur et un motif,
reliés par `AND` ou `OR` avec parenthèses.

| Groupe d'opérateurs | Membres |
|---|---|
| Sous-chaîne | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Égalité | matches, is not equal to |
| Numérique | is less than, less than or equal, greater than, greater than or equal |
| Présence | is unknown, is not unknown, is empty, is not empty |
| Motif | matches regular expression, does not match regular expression |

Ceux-ci deviennent une clause SQL `WHERE`. Les opérateurs d'expressions régulières suivent le
dialecte regex de la base de données, pas PCRE ; un motif fonctionnant dans
`preg_match` ne fonctionnera donc pas forcément ici. Les comparaisons numériques avec des motifs
numériques sont transmises sans guillemets ; tout le reste est entre guillemets et la base de données
applique ses règles de conversion de type. Testez les filtres numériques sur les valeurs réellement
en cache ; ces valeurs sont fréquemment stockées sous forme de texte. Les opérateurs de sous-chaînes utilisent SQL `LIKE`,
où `%` et `_` ont valeur de caractères génériques.

Deux comportements méritent d'être connus avant de déboguer une règle inerte :

**Un filtre de périphérique/objet vide ne correspond à rien, mais un filtre d'index vide
correspond à tous les index en cache.** Le filtre de sélection de périphérique se replie sur une condition fausse
en l'absence d'éléments. En revanche, dès qu'une règle de graphique correspond à un périphérique,
supprimer toutes ses conditions d'index laisse la requête de données non filtrée.
Par exemple, supprimer une condition `ifDescr = eth0` peut également créer un graphique pour `lo`.
Désactivez la règle pendant la modification de ses conditions d'index.

**Une règle référençant un champ que le périphérique n'a pas découvert est abandonnée.** Si une
règle filtre sur un champ de requête de données absent de la mémoire cache de ce périphérique, l'exécution consigne
un avertissement mentionnant le champ et cesse de traiter cette règle pour ce périphérique. La cause
habituelle est une règle écrite pour une requête de données évaluée sur un périphérique dont la
requête a renvoyé un ensemble de champs différent.

La page d'édition de règle répertorie les objets et graphiques candidats. Examinez ces listes avant
d'activer une règle et après l'avoir modifiée. Ce sont des prévisualisations de sélection, non une répétition
complète d'exécution : les contrôles de sources de données, la détection des graphiques existants, les hooks de création
et l'insertion dans l'arborescence surviennent toujours lors de l'exécution. La CLI ne propose pas d'option de simulation.

Les règles d'arborescence disposent de types de feuilles distincts pour périphériques et graphiques, ainsi que d'un arbre
de destination et d'un parent sélectionnés. Les niveaux d'en-tête peuvent utiliser des chaînes fixes ou des valeurs
issues des champs de périphériques/graphiques. Les en-têtes dérivés de champs appliquent un remplacement regex PHP insensible à la casse ;
les séquences littérales `\n` dans le résultat le scindent en en-têtes imbriqués successifs.
Cette syntaxe de remplacement diffère de la regex SQL utilisée pour la correspondance d'objets.
Les en-têtes et feuilles existants sont réutilisés sous le même arbre et parent ; modifier le
chemin peut ajouter un nouvel emplacement sans retirer l'ancien.

## Appliquer des règles aux périphériques existants

La découverte n'est pas le seul point d'entrée. Des règles peuvent être exécutées sur les périphériques déjà
présents dans le système, sélectionnés par identifiant, nom d'hôte ou description :

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Le nom d'hôte et la description sont évalués comme expression régulière si la valeur est valide,
et toujours également comme sous-chaîne. Au moins l'un des trois sélecteurs est requis ;
appeler la commande sans sélecteur s'interrompt avec une erreur. Lorsque des sélecteurs sont combinés,
ils sont reliés par `AND`. Utilisez des identifiants positifs séparés par des espaces pour une sélection
resserrée ; les identifiants séparés par des virgules ne sont pas acceptés. Les motifs peuvent rester larges,
et le repli SQL `LIKE` traite `%` et `_` comme des caractères génériques.

La requête de sélection n'exclut pas automatiquement les périphériques désactivés. L'option `--debug`
ajoute des diagnostics mais effectue tout de même les créations. L'absence de périphérique correspondant est une opération
sans effet réussie ; le code de sortie ne garantit donc pas à lui seul qu'un élément a été créé.

Pour chaque périphérique correspondant, l'exécution accomplit trois actions dans l'ordre :

1. Tente la création pour les modèles de graphiques associés n'ayant pas encore de graphique sur le
   périphérique, sous réserve d'éligibilité du modèle et des vérifications de sources de données.
2. Exécute les règles de graphiques activées pour les requêtes de données associées en utilisant leur cache d'index
   stocké. Cette étape ne réexécute pas la découverte ; actualisez d'abord la requête de données
   si le cache est manquant ou obsolète.
3. Applique les règles d'arborescence de feuilles de périphériques activées.

La création d'un nouveau graphique peut invoquer les règles d'arborescence de feuilles de graphiques lorsque l'automatisation
globale de l'arborescence est activée. La CLI ne réapplique pas ces règles aux graphiques déjà
créés. Une règle de feuille de graphique nouvelle ou modifiée ne rattrape donc pas les graphiques
existants du simple fait de réexécuter la CLI. Consultez
l'[anomalie #211](https://github.com/kadupulhq/kadupul/issues/211). Vérifiez leur emplacement
séparément ; ne supprimez pas et ne recréez pas des graphiques historiques simplement pour déclencher le hook de création.

Des exécutions répétées suppriment les doublons de graphiques non indexés par périphérique et modèle de graphique.
Les graphiques indexés sont vérifiés par périphérique, requête de données, type de graphique et index. Cela
évite les doublons lors d'exécutions séquentielles ; ce n'est pas une garantie de concurrence.
Vérifiez la liste des graphiques et l'arborescence après exécution, ainsi que les journaux `AUTOM8` pour
les graphiques ignorés, les données invalides ou les échecs de création.

Un cas particulier est ignoré trop silencieusement : un modèle de graphique comportant un champ
marqué comme substituable sans valeur par défaut n'est pas éligible à l'automatisation. L'exécution
consigne qu'il n'a pas été ajouté car un champ substituable manque de valeur par défaut, puis passe
à la suite. Si un modèle attendu n'apparaît jamais, c'est la première chose à vérifier. Consultez
les [Modèles](/fr-ca/concepts/templates/) pour comprendre ce qu'est un champ substituable.

## Pièges

**Désactiver une règle n'annule pas son travail.** Cela ne supprime pas les graphiques ou entrées
d'arborescence déjà créés. La suppression d'un périphérique possède un comportement de nettoyage distinct pour
les graphiques et sources de données ; vérifiez les options de suppression avant de retirer un périphérique.

**Un balayage interrompu a l'apparence d'un balayage sain.** La limite d'exécution termine la
découverte là où elle en était. Les totaux enregistrés correspondent aux opérations effectivement
terminées, et rien n'indique que le résultat est partiel. Comparez le nombre d'adresses balayées
à la taille totale de la plage.

**Les règles s'exécutent sur le cache de la requête de données, pas sur le périphérique.** Une règle de graphique
qui ne correspond à rien indique souvent que la requête de données n'a jamais tourné, ou a tourné sans trouver d'index.
Vérifiez la table des index découverts avant de réécrire la règle.

**Le courriel de notification regroupe découvertes existantes et nouvelles.** Une plage peut envoyer un courriel
à son achèvement, regroupant les découvertes selon que chaque IP figurait ou non dans
l'instantané pré-balayage. Ce n'est pas une preuve que chaque adresse demandée a été effectivement balayée.

## Modes de défaillance

| Symptôme | Cause habituelle |
|---|---|
| Le balayage ne trouve rien sur une plage active | Ping bloqué, échec SNMP, exclusions ou suppression des doublons |
| La plage refuse de démarrer, erreur dans le journal | Aucun ensemble d'options SNMP associé |
| Périphériques trouvés mais aucun créé | Commutateur de création désactivé ou aucune règle de périphérique correspondante |
| Tous les équipements reçoivent le même modèle générique | Ordre des règles, avec une règle générale placée avant les règles spécifiques |
| Seule une partie des adresses est balayée | Limite d'exécution atteinte, ou chevauchement de plages ayant rejeté un lot d'adresses |
| Un périphérique par routeur au lieu d'un par interface, ou l'inverse | Paramètre de suppression des doublons par sysName identique |
| La règle ne correspond à rien et le journal signale une colonne | La règle filtre sur un champ que la requête de données n'a pas renvoyé |
| Modèle de graphique jamais créé par une règle | Valeur par défaut obligatoire manquante, sortie invalide de source de données ou échec de création |
| Graphiques inattendus pour des interfaces supplémentaires | Filtre d'index de graphique vide ou plus large que prévu |
| Une nouvelle règle d'arborescence ne place pas les graphiques existants | La CLI ne rattrape pas les règles de feuilles de graphiques pour les graphiques existants |
