---
title: Surveiller les capteurs environnementaux
description: Grapher la température, l'humidité, le débit d'air, la puissance et l'état des onduleurs par SNMP, localiser les OID sur une MIB constructeur et adapter les paramètres graphiques à une mesure plutôt qu'à un compteur.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée. Ceci est un projet de traduction en attente de révision par une personne parlant couramment la langue.
sidebar:
  order: 23
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version prise en charge de Kadupul ni
aucun chemin de migration. Testez ces procédures sur une copie isolée avec des sauvegardes avant de
leur faire confiance. Consultez l'[état du projet](/fr/project/status/).
:::

La température, l'humidité et la puissance instantanée sont des mesures, habituellement stockées en
`GAUGE`. L'énergie cumulée ou les totaux d'événements peuvent nécessiter un type compteur.
Vérifiez les unités, l'identité et la sémantique de chaque objet avant de sélectionner un modèle.

Vérifiez ce qui est déjà fourni avant d'écrire quoi que ce soit.

## Ce qui est fourni

Seules quatre définitions de requêtes de données résident dans le répertoire natif de requêtes,
et aucune d'elles ne concerne l'environnement.

| Requête SNMP fournie | Couvre |
|---|---|
| `interface.xml` | Interfaces réseau |
| `host_disk.xml` | Stockage Host Resources |
| `net-snmp_disk.xml` | Partitions déclarées UCD |
| `net-snmp_devio.xml` | E/S de périphériques blocs UCD |

La prise en charge des capteurs s'opère par deux autres voies.

**Requêtes de serveur de scripts, regroupées dans le paquet Net-SNMP.** Importez
`install/templates/NetSNMP_Device.xml.gz` pour déployer ses trois fichiers XML de requêtes lmSensors
sous `resource/script_server/`. L'utilitaire
`scripts/ss_netsnmp_lmsensors.php` est également présent dans le dépôt source.

| Requête | Table |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

L'utilitaire exploite les colonnes d'index, de nom et de mesure. La requête indexe sur la valeur numérique
`sensorDevice` ; `sensorName` fournit un libellé d'affichage que l'utilitaire tronque à
18 caractères. Les noms ne constituent pas une garantie d'identité unique de capteur.

Le chemin habituel `get sensorReading` renvoie des valeurs brutes : millidegrés pour l'ancien objet
de température, millivolts pour la tension et tr/min pour les ventilateurs. Le graphique thermique
applique un CDEF `Divide by 1000`. Le graphique de tension n'a aucun CDEF malgré son étiquette Volts,
ce qui constitue une [anomalie d'échelle confirmée](https://github.com/kadupulhq/kadupul/issues/247).

Le chemin distinct `query sensorReading` adapte l'échelle de la température et de la tension, et tente
une conversion de tension signée en employant la constante erronée 4294967294. Il peut également
[échouer avec une exception sur des mesures indisponibles](https://github.com/kadupulhq/kadupul/issues/248).
Ne déduisez pas les unités stockées à partir de cette sortie de découverte.

L'utilitaire emploie encore l'ancienne colonne de température `.2.1.3`. La version amont actuelle de
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
déprécie cet objet non signé au profit de la colonne signée `.2.1.4` ; vérifiez la prise en charge
et le comportement en température négative sur l'agent réel avant d'adapter un modèle.

**Paquets de périphériques, fournis sous forme d'archives importables.** Plusieurs contiennent leur propre
XML de requête et l'inscrivent dans les répertoires lors de l'importation. Ceux qui importent ici :

| Paquet | Apporte |
|---|---|
| SNMP UPS | Requêtes de lignes d'entrée et de sortie UPS-MIB, plus modèles à OID fixe pour batterie, autonomie, température et alarmes |
| AKCP Device | Requêtes sur scripts pour capteurs de température, humidité, débit d'air et 4-20 mA |
| APC InfraStruXure PDU | Requêtes pour statistiques de disjoncteurs et de phases |
| APC InfraStruXure InRow CRAC | Requêtes pour statistiques d'unités et de groupes, y compris températures, humidité, débit d'air et vitesse de ventilation |
| BayTech PDU | Requête de prises et de circuits triphasés, avec courant, tension, puissance et température |

Examinez le paquet correspondant avant de rédiger une requête manuelle. Suivez
[Importer et exporter des modèles](/fr/guides/import-and-export-templates/), vérifiez le déploiement des fichiers
et la découverte, puis créez explicitement les graphiques souhaités. La présence d'un paquet
ne garantit pas la compatibilité du matériel ni l'exactitude de l'échelle ; les anomalies UPS et
lmSensors détaillées plus bas nécessitent une vigilance particulière.

## Les deux formes prises par un capteur

Pour la collecte SNMP, distinguez les objets scalaires des instances de tables indexées.

**Un OID fixe.** Une seule valeur scalaire à une adresse donnée, identique sur chaque
périphérique de ce type. Température de batterie. Puissance totale de sortie. Utilisez une source de données
à OID fixe : une requête SNMP get sur un OID littéral, et une source par mesure.

**Une table.** Un nombre indéterminé de mesures découvertes par équipement. Sondes de baie,
bandeaux de prises, mesures par phase. Utilisez une requête de données, qui parcourt la table,
apprend l'index et vous laisse sélectionner les lignes qui deviendront des graphiques.

Le paquet UPS fourni utilise les deux. Suivez la structure d'objets de la MIB : un équipement
ne comportant qu'une seule sonde de courant peut néanmoins l'exposer sous forme de ligne d'une table indexée.

| Mesure d'onduleur (UPS) | Forme | OID |
|---|---|---|
| Température de la batterie | Fixe | `.1.3.6.1.2.1.33.1.2.7.0` |
| Autonomie restante estimée | Fixe | `.1.3.6.1.2.1.33.1.2.3.0` |
| Temps sur batterie | Fixe | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tension de la batterie | Fixe | `.1.3.6.1.2.1.33.1.2.5.0` |
| Alarmes présentes | Fixe | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tension, courant, puissance, fréquence d'entrée | Requête | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tension, courant, puissance, charge de sortie | Requête | `.1.3.6.1.2.1.33.1.4.4.1` |

Chacune de ces sources de données est de type `GAUGE`. Aucune n'est un compteur. L'archive
de modèles fournie déclare un pas (step) de 60 secondes et un heartbeat de 600 secondes, un minimum
de zéro et aucun maximum, sauf pour la température qui n'a pas de minimum. Vérifiez le profil importé
et la configuration RRD réelle ; ces déclarations ne fixent pas la cadence de collecte effective.
Une mesure négative valide nécessite également un axe de graphique qui permette de l'afficher.

## Localiser les OID

Parcourez l'équipement avant d'écrire quoi que ce soit. Vous recherchez trois éléments : une
table de mesures, une table parallèle d'étiquettes, et le multiplicateur choisi par le constructeur,
ainsi que des objets de validité/statut lorsque disponibles.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Remplacez l'hôte et la communauté d'exemple par les valeurs configurées et lancez les sondes depuis le collecteur.
Chargez la MIB correspondante et ses dépendances pour inspecter noms, unités et sémantique ;
la documentation constructeur permet également d'éclairer les OID numériques. Un seuil voisin
ou un code d'état ne remplace pas une mesure.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

C'est dans la définition de la MIB que l'échelle est documentée. Un constructeur qui rapporte
des dixièmes de degré l'indiquera dans la description ou la clause d'unités de l'objet, ainsi que dans
sa documentation. Deviner à partir d'une lecture isolée peut transformer 23,5 degrés
en un tracé à 235 sur le graphique.

Les MIB standards couvrent plus de cas qu'on ne l'imagine. La MIB UPS-MIB à `.1.3.6.1.2.1.33` est
générique entre constructeurs. ENTITY-SENSOR-MIB fournit une valeur de capteur accompagnée directement
de ses propres champs d'échelle et de précision. Vérifiez leur présence avant de vous tourner vers un sous-arbre propriétaire.

Comparez la découverte après des redémarrages représentatifs et des changements de sondes dans un banc d'essai.
Deux parcours inchangés ne suffisent pas à prouver la stabilité de l'index. Enregistrez des identités
stables de capteurs dès que possible avant de créer des graphiques pérennes.

## Construire une source de données à OID fixe

Un capteur à OID fixe nécessite un modèle de données utilisant l'entrée de données SNMP get, avec
l'OID en valeur littérale et un seul élément de source de données. Définissez le type à `GAUGE`,
n'attribuez une valeur réelle au minimum que si le capteur ne peut véritablement pas descendre en dessous,
et laissez le maximum indéfini sauf si le fabricant spécifie un plafond formel.

Les valeurs situées hors des limites de la source de données RRD deviennent inconnues. Définissez ces bornes
dans les unités brutes stockées, et non dans les unités converties du graphique ; sinon, des mesures
valides risquent d'être perdues avant l'application d'un CDEF d'affichage.

## Construire une requête de données

Une requête nécessite un OID d'index, une méthode pour extraire l'index de chaque OID parcouru, et un
champ par colonne souhaitée.

La requête de sortie onduleur (UPS) constitue un court exemple pratique. Elle s'indexe sur la table des lignes,
extrait l'index à la fin de chaque OID renvoyé avec une expression régulière, et
déclare un champ d'entrée pour l'index et quatre champs de sortie pour la tension,
le courant, la puissance et la charge. Les définitions de sortie comprennent la méthode, la source, la direction
et l'OID de colonne. Un OID de colonne peut constituer une racine de parcours d'index valide ; la correspondance
entre le parseur de la requête et les OID réellement renvoyés est l'élément déterminant. Consultez [Requêtes de données et index](/fr/concepts/data-queries-and-indexes/) pour comprendre
comment l'index est choisi et conservé.

Choisissez délibérément une méthode de réindexation. Les choix possibles sont : aucune, sur recul de l'uptime,
sur variation du nombre d'index, et Tout vérifier (Verify All Fields). Les tables de capteurs représentent
le cas typique d'échec des méthodes simplifiées : débranchez une sonde d'un rack pour en brancher une autre,
et le décompte peut rester identique alors que chaque mesure derrière l'index appartient désormais à un
autre capteur. Une vérification complète consomme des requêtes SNMP à chaque cycle.
Vérifiez quels champs d'identité la requête peut contrôler : des index numériques constants
ou des libellés tronqués ou en double ne prouvent pas qu'une sonde physique est restée la même.
Actualisez la découverte et vérifiez les associations de graphiques après tout remplacement.

## Adapter l'échelle de la valeur

Déterminez où s'applique la conversion, et ne l'appliquez qu'à un seul endroit.

| Emplacement | Quand l'utiliser |
|---|---|
| Dans le script de collecte | Respectez le contrat documenté du collecteur ; lmSensors get renvoie actuellement les unités brutes |
| Dans un CDEF sur l'élément de graphique | La valeur brute mérite d'être conservée, l'unité affichée étant un choix de présentation |

Un CDEF représente la réponse habituelle pour appliquer un multiplicateur constructeur. Les paquets fournis contiennent
des définitions comme `Divide By 10`, construites à partir de la source de données courante, `10` et
une division. Appliquez-les uniquement aux objets possédant l'unité brute correspondante.

Le paquet UPS comporte des [CDEF de puissance et de temps erronés](https://github.com/kadupulhq/kadupul/issues/249) :
sa série On Battery divise les secondes par 6000 au lieu de 60, et les séries Watts en entrée/sortie
divisent les watts par 10. Pour un agent conforme, 600 secondes doivent afficher 10 minutes et 1000 watts doivent
afficher 1000 watts. La tension de batterie et le courant de ligne requièrent en revanche bien une division par 10 ;
l'autonomie estimée est déjà exprimée en minutes. Consultez
les [unités d'objets UPS de la RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Stocker la mesure brute et effectuer la division sur le graphique préserve l'intégrité du fichier RRD et
vous permet de corriger un multiplicateur d'affichage sans réécrire l'historique brut,
pour autant que les échantillons aient franchi les limites de source de données et de rétention. La conversion côté collecteur
modifie l'unité stockée et peut altérer la précision ; documentez-la. Des mesures brutes inexpliquées
ne doivent pas être présentées comme des unités d'ingénierie validées.

N'appliquez pas la conversion deux fois. Un CDEF sur un graphique dont le script a déjà adapté
l'échelle peut engendrer une lecture plausible mais totalement fausse.

## Paramètres de graphique adaptés à une mesure

Choisissez les paramètres en fonction d'une mesure au lieu de reproduire aveuglément les réglages de trafic réseau.

| Paramètre | Trafic | Capteur |
|---|---|---|
| Type de source de données | `COUNTER` | `GAUGE` |
| Valeur de base | 1000, pour graduer les axes en k et M | Reste 1000, mais le préfixe n'a pas de sens sur des degrés |
| Échelle automatique | Souhaitée, la plage étant inconnue | Généralement non souhaitée, la plage étant prévisible |
| Limites haute et basse | Dépendent du mode d'échelle automatique | Définissez une plage visible cohérente |

Fixez une limite supérieure et inférieure explicite ainsi qu'un libellé vertical identifiant l'unité
réelle. Le graphique de température UPS fourni procède ainsi : limite inférieure à 0, limite supérieure
à 100, et `C` en libellé vertical.

L'option d'échelle automatique offre un ensemble de choix et non un simple commutateur. L'option employée
par le graphique de température fourni transmet une limite inférieure avec `--alt-autoscale-max` ; elle
ne transmet pas la limite supérieure mémorisée de 100. Sans limites rigides, une mesure hors plage
peut étendre la limite passée. Une limite configurée n'est pas automatiquement verrouillée. Choisissez la variante
préservant la frontière qui vous importe :

| Option | Effet |
|---|---|
| Échelle automatique ignorant les limites | Les deux extrémités flottent. À utiliser si vous ignorez totalement la plage |
| Échelle automatique acceptant une limite basse | Transmet la limite basse ; le maximum s'adapte aux données |
| Échelle automatique acceptant une limite haute | Transmet la limite haute ; le minimum s'adapte aux données |
| Échelle automatique avec les deux limites | Transmet les deux limites ; l'expansion dépend encore du mode rigide |

Il existe également une option de limites rigides (rigid boundaries) qui empêche l'axe de s'étendre lorsqu'une
valeur dépasse les limites fixées. Activez-la lorsqu'un axe fixe importe davantage
que la visibilité des dépassements, et laissez-la désactivée dans le cas contraire, car un tracé rigide
peut tronquer une pointe en dehors de la plage affichée. Cela ne supprime pas l'échantillon
stocké. Consultez la [référence des limites graphiques RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Pour des degrés ou pourcentages où les préfixes SI désorienteraient les utilisateurs, envisagez un exposant d'unités fixé à 0.
La base 1000 gère les paliers de préfixes ; elle ne désactive pas par elle-même les préfixes et ne convertit pas les unités de mesure.

### La consolidation compte plus ici que pour le trafic

Un compteur d'interface moyenné sur une heure donne toujours une idée globale du trafic.
Une température moyennée sur une heure occulte le pic critique de dix minutes.
Assurez-vous que le profil de stockage associé à ces sources de données conserve une archive `MAX`,
et configurez la série tracée pour lire la consolidation `MAX` adaptée.
Un maximum de légende calculé sur une série `AVERAGE` ne restitue pas la pointe originale.

Même une archive MAX ne préserve que les pics présents dans les échantillons collectés ; elle
ne peut restituer un dépassement intervenu entre deux scrutations ou rejeté avant stockage. Consultez
[Gérer la rétention des données](/fr/guides/manage-data-retention/) et
[Sources de données et archives](/fr/concepts/data-sources-and-rras/).

## Quand aucune MIB exploitable n'existe

De nombreux équipements environnementaux communiquent par Modbus, liaison série ou API HTTP,
et leur agent SNMP n'expose rien d'utile. Ceux-ci nécessitent une entrée de données par script. Le
script tourne sur l'hôte du collecteur, pas sur l'équipement, et joindre l'équipement relève de la
responsabilité du script. Consultez [Écrire un script de collecte de données](/fr/guides/write-a-data-collection-script/) pour connaître
le contrat de sortie.

Renvoyez `U` plutôt que `0` lorsqu'un capteur est inaccessible. Une sonde déconnectée
n'est pas une sonde mesurant zéro degré.

## Modes de défaillance

| Symptôme | Cause habituelle |
|---|---|
| Température affichée dix ou cent fois trop élevée | Multiplicateur constructeur non divisé |
| Température affichée dix fois trop basse | Divisée deux fois, dans le script et dans un CDEF |
| Une ligne de tension indique des milliards | Entier SNMP non signé contenant une valeur négative, non corrigée |
| Les graphiques s'aplatissent après le changement d'une sonde | La table s'est réindexée et la source de données pointe vers un autre capteur |
| Des mesures au-dessus d'un seuil génèrent des trous | Un maximum a été défini sur la source de données et les mesures le dépassent |
| Axe gradué en k ou M sur une mesure de température | Valeur de base et réglages d'unités hérités d'un modèle de trafic |
| Une pointe est invisible sur la vue hebdomadaire | Vérifiez la consolidation choisie, la résolution conservée, l'intervalle et les échantillons rejetés |
| Une requête ne renvoie aucun index | Vérifiez les OID renvoyés, la regex du parseur, les accès et la compatibilité ; une racine de colonne peut être valide |
| Les requêtes lmSensors ne trouvent rien sur un hôte Linux | Vérifiez le support de l'agent, les accès, les lignes exposées et les erreurs SNMP exactes |
