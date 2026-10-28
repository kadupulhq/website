---
title: Modèle de sécurité
description: Où les données non fiables pénètrent dans Kadupul, quel processus s'exécute avec quel privilège, ce que le compte de base de données peut faire et quelles frontières le code applique plutôt qu'il ne présume.
banner:
  content: Kadupul est en pré-alpha. Validez ces procédures dans une installation de test isolée.
sidebar:
  order: 12
---

Un système de surveillance est délicat à défendre, pour trois raisons qui n'ont rien à voir avec
la qualité du code.

Il détient les identifiants de tout ce qu'il surveille. Les communautés SNMP, les noms d'utilisateurs
et phrases secrètes v3, et tout ce dont un équipement a besoin sont stockés afin que le scruteur
puisse les utiliser sans surveillance humaine. Personne ne vient les saisir manuellement toutes les
cinq minutes.

Il exécute des commandes selon un calendrier. Collecter une valeur que SNMP n'expose pas implique
d'exécuter un script, et la définition de ce script est une configuration stockée en base de données
et modifiable via l'interface.

Il ingère les données produites par les machines qu'il surveille. Une description d'interface, un
point de montage de disque, un nom de capteur : tout provient de l'équipement et tout aboutit dans la
base de données, dans les titres de graphiques et dans les arguments transmis à d'autres programmes.
Un commutateur compromis est une source d'entrée, pas seulement une victime.

Aucun de ces aspects n'est un défaut. Ce sont les exigences mêmes du système. Ce qui suit expose où
chacun d'eux se positionne dans l'architecture.

## Où pénètrent les entrées non fiables

Quatre points d'entrée, ordonnés selon le degré de contrôle dont dispose l'opérateur.

| Point d'entrée | Source | Destination |
|---|---|---|
| Paramètres HTTP | Toute personne pouvant joindre le serveur web | La base de données, la sortie de page et le SQL |
| Valeurs SNMP | L'équipement interrogé | `host_snmp_cache`, titres de graphiques, limites RRD, arguments de scripts |
| Sortie de script | Un script local ou le système avec lequel il a dialogué | `poller_output`, puis fichiers RRD |
| Modèles et paquets téléversés | Quiconque détient le domaine d'importation | Lignes de modèles et, pour les paquets, fichiers sur le disque |

### Paramètres HTTP

Les assistants de requête résident dans `lib/html_utility.php`. `get_filter_request_var()` valide
par défaut sous forme d'entier, mais dispose également de cas particuliers pour les valeurs vides,
indéfinies ou correspondant à des expressions régulières. Un appelant doit toujours vérifier si une
valeur est requise et appropriée pour l'opération. Le filtrage n'établit pas d'autorisation.

`set_request_var()` met une valeur en cache dans `$_CACTI_REQUEST` et la répercute dans les
tableaux de requête. `get_nfilter_request_var()` lit ce cache ou la requête brute et ne valide ni
n'écrit la valeur lui-même. Les lectures ultérieures peuvent donc observer une valeur préalablement
stockée, et l'ordre de lecture importe.

Lorsque `log_validation` est activé, `get_request_var()` consigne certaines lectures de requêtes
non mises en cache. Les lectures directes des superglobales et `get_nfilter_request_var()` ne sont
pas toutes couvertes. Il s'agit d'une aide au diagnostic, non d'un audit de validation complet ni
d'une mise en application stricte.

### Valeurs SNMP

La découverte des requêtes de données stocke certaines valeurs indexées dans `host_snmp_cache` ;
les résultats ordinaires de scrutation SNMP suivent le chemin des échantillons.
`data_query_format_record()` dans `lib/data_query.php` applique deux transformations avant le
stockage : une table de conversion facultative `rewrite_value` issue de la définition de requête,
et `bin2hex()` sur toute valeur dont le codage ne peut être identifié par `mb_detect_encoding()`.
Cette seconde opération protège contre les chaînes d'octets binaires, non contre un contenu hostile.

De là, la valeur voyage. Elle nomme les graphiques via `substitute_snmp_query_data()`. Elle peut
définir un maximum RRD, car un modèle de données peut déclarer son maximum comme `|query_ifSpeed|`.
Elle devient un argument d'une requête de script, où `get_script_query_path()` passe chaque partie
par `cacti_escapeshellarg()` au préalable.

L'échappement et les validateurs RRDtool décrits dans
[Intégration de RRDtool](/fr/reference/rrdtool-integration/) constituent la frontière ici. Les données
d'équipements doivent demeurer non fiables. La validation et l'échappement sont des propriétés propres
à chaque point d'appel ; la présence d'assistants ne prouve pas que chaque consommateur les emploie
correctement. Vérifiez à la fois la structure de la commande et l'argument substitué.

### Sortie de script

La branche `popen()` de `exec_poll()` lit avec `fgets(..., 8192)`, renvoyant au plus 8 191 octets
ou le premier saut de ligne. Son repli `shell_exec()` présente un comportement de sortie différent,
et la collecte via le serveur de scripts suit un autre chemin.

`prepare_validate_result()` reconnaît les valeurs numériques et inconnues, les formes hexadécimales
et certains formats de sortie à champs multiples. Il peut également supprimer du texte pour obtenir
une valeur numérique ; ce n'est pas un filtre scalaire strict universel. L'analyse ultérieure et la
validation RRDtool importent également. Voir [Méthodes de saisie de données](/fr/reference/data-input-methods/).

Les contrôles de sortie n'isolent pas rétroactivement un script qui s'est déjà exécuté. Examinez la
commande, la liste blanche d'entrées et les privilèges du système d'exploitation avant d'activer la collecte.

### Modèles et paquets

Deux mécanismes distincts partagent un seul domaine.

Un **import de modèle** est du simple XML sans signature. Il crée des modèles, des requêtes de
données et des méthodes de saisie de données. Une méthode de saisie de données est une ligne de
commande, de sorte qu'il existe un chemin direct entre un fichier téléversé et un élément que le
scruteur exécutera. `lib/import.php` exécute `cacti_input_string_is_safe()` sur chaque
`input_string` importé et refuse la méthode si elle contient des métacaractères du shell, consignant :

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Un **import de paquet** est signé. `import_read_package_data()` lit la clé publique intégrée au
paquet et la compare aux trois clés compilées dans `lib/import.php` : les deux clés Cacti et la clé
Kadupul. Toute autre clé échoue. Un paquet sans élément `<publickey>` est interprété comme
revendiquant l'ancienne clé Cacti, et doit alors produire une signature valide par rapport à elle.
`import_read_package_data()` refuse toute clé inférieure à 2048 bits avant toute tentative de
vérification, seuil que l'ancienne clé, à 512 bits, ne franchit pas. Chaque fichier contenu porte sa
propre signature, vérifiée séparément.

Les paquets peuvent ensuite écrire des fichiers sélectionnés. Les noms acceptés commencent par
`scripts/` ou `resource/`, éventuellement sous un préfixe valide `plugins/<name>/`.
L'importateur rejette les octets NUL, les traversées de répertoires et les chemins absolus, et vérifie
le confinement sous la racine de l'installation ; contenir simplement un nom de répertoire ne suffit
pas. Les droits d'écriture de la destination déterminent également si l'écriture réussit. Un paquet qui
réussit la vérification écrit intentionnellement du code PHP exécutable dans l'arborescence
d'installation. La vérification de signature établit l'identité de signature acceptée et l'intégrité,
non l'innocuité du code. L'autorisation du domaine, le confinement du chemin, les fichiers sélectionnés,
les permissions du système de fichiers et la politique de liste blanche de commandes importent aussi.

Les deux mécanismes se situent derrière le domaine 17. Le rôle standard Éditeur de modèles détient
le domaine 17 et le domaine 2 (Méthodes de saisie de données). Un compte disposant de ces permissions
peut définir des commandes de collecte, sous réserve de la validation et du traitement par liste
blanche. C'est la raison d'être de ce rôle, et il convient de le savoir avant de l'accorder. Voir
[Importer et exporter des modèles](/fr/guides/import-and-export-templates/) pour le flux de travail
validé et les limitations connues.

## Ce qui s'exécute avec quel privilège

| Processus | Démarré par | S'exécute sous | Rôle |
|---|---|---|---|
| Interface web | Le serveur web | L'utilisateur du serveur web | Lit et écrit la base de données, restitue les graphiques via RRDtool, écrit les fichiers RRD à la demande, écrit les fichiers de paquets lors de l'import |
| `poller.php` | Ordonnanceur ou service configuré | Compte du service/ordonnanceur | Lit le cache du scruteur, lance les collecteurs, écrit les fichiers RRD |
| `cmd.php` | Scruteur ou chemin de collecte temps réel | Compte initiateur | Exécute les requêtes SNMP et les commandes de collecte |
| `script_server.php` | Collecteur | Compte initiateur | Inclut un fichier PHP et appelle une fonction dans son propre processus |
| RRDtool | Le processus web ou le scruteur | Celui qui l'a appelé | Lit et écrit les fichiers sous `rra/` |

Deux d'entre eux méritent une attention particulière :

**Le serveur de scripts n'est pas un bac à sable.** Il inclut le fichier cible dans un processus PHP
persistant et y appelle une fonction. Cette fonction partage le processus, sa mémoire et sa connexion
à la base de données. Les contrôles dans `script_server.php` déterminent si l'appel a lieu :
`realpath()` du fichier à inclure doit se résoudre sous `$config['base_path']` ou
`$config['scripts_path']`, la fonction doit exister après l'inclusion,
`ReflectionFunction::isInternal()` doit renvoyer false, et le fichier définissant la fonction doit
également se trouver sous une racine autorisée. Une fois ces conditions remplies, le code s'exécute
avec l'intégralité des privilèges du scruteur. Une méthode via le serveur de scripts est un moyen
d'exécuter du PHP au sein de Kadupul, non à côté de Kadupul.

**Le processus web peut écrire des fichiers RRD.** Les demandes de graphiques peuvent déclencher des
mises à jour Boost à la demande et la création de fichiers. Un avertissement qui délègue un chemin de
création de répertoire au scruteur ne rend pas l'accès en écriture web universellement facultatif. La
vérification préalable du stockage et la coordination de maintenance vérifient également l'accès au
compte et les configurations UID/GID numériques de confiance. La création sous root tente de
correspondre aux propriétaires du stockage, mais des erreurs peuvent être consignées. Voir
[Mettre à niveau en toute sécurité](/fr/guides/upgrade-safely/).

Les comptes du serveur web et du scruteur planifié peuvent différer. Une collecte en temps réel
lancée depuis une requête web peut hériter du compte web, de sorte que l'exécution de commandes n'est
pas limitée à l'identité du scruteur planifié. L'intégration Spine héritée nécessite une validation
séparée par rapport au binaire réel ; cette page n'établit pas une version prise en charge.

## Ce dont le compte de base de données a besoin

Les processus partageant la même configuration de base de données partagent habituellement son compte.
Les collecteurs distants peuvent disposer d'identifiants locaux et centraux distincts ; les configurations
propres aux déploiements peuvent varier. Inspectez les privilèges réels de chaque compte configuré.

| Exigence | Raison |
|---|---|
| DML complet sur le schéma Kadupul | Fonctionnement ordinaire |
| DDL sur le schéma Kadupul | Mises à niveau et opérations d'exécution telles que la rotation de table Boost, tables temporaires et cycle de vie des greffons |
| `SELECT` sur `mysql.time_zone_name` | Les listes de fuseaux horaires du site et des collecteurs lisent cette table directement |

Ne retirez pas les privilèges DDL en supposant que seules les mises à niveau en ont besoin.
L'application ne bascule pas universellement vers une identité de migration distincte ; la séparation
des comptes exige une validation spécifique de tous les chemins d'exécution concernés.

`include/config.php` contient les identifiants de base de données, et les collecteurs distants
peuvent également détenir des identifiants centraux `$rdatabase_*`. Les permissions du système de
fichiers, les règles d'accès HTTP, la configuration du gestionnaire PHP et la protection des
sauvegardes comptent toutes. PHP exécute normalement le fichier plutôt que d'en servir le code source,
mais cela ne dispense pas de le protéger contre une divulgation directe. Voir
[Sécuriser une installation exposée à Internet](/fr/guides/secure-an-internet-facing-install/).

Les identifiants des équipements sont stockés de la même façon. `host.snmp_community`,
`host.snmp_password` et `host.snmp_priv_passphrase` sont des colonnes ordinaires, écrites par
`api_device_save()` via `form_input_validate()` sans étape de chiffrement, et copiées sur les
lignes `poller_item` pour lecture par le scruteur. L'accès en lecture à ces tables peut exposer les
identifiants stockés ; cela n'implique pas un accès à toutes les sources externes. Les mots de passe
des utilisateurs constituent l'exception : `compat_password_hash()` utilise `password_hash()`
de PHP avec `PASSWORD_DEFAULT`, et un ancien hachage MD5 encore vérifiable est recalculé lors de
la connexion suivante.

## Ce qui est appliqué, et ce qui n'est que conventionnel

C'est la distinction primordiale lors de l'analyse d'une modification.

### Mécanismes de code et leur périmètre

| Frontière | Mécanisme |
|---|---|
| Authentification | Les pages d'interface courantes emploient `include/auth.php` ; les points d'accès spécialisés ont leur propre gestion |
| CSRF | L'initialisation web partagée configure les jetons ; les tableaux de jetons mal formés sont rejetés. Vérifiez chaque point d'accès plutôt que de supposer une couverture universelle |
| Scripts réservés à la CLI | `include/cli_check.php` répond `404` et quitte lorsque la SAPI n'est pas `cli` |
| Emplacement XML de requête de données | `cacti_path_is_within()` par rapport à `<base_path>/resource`, consigné et refusé sinon |
| Authenticité de paquet | Signature validée contre une clé compilée, minimum 2048 bits, signatures par fichier |
| Emplacement des fichiers de paquet | Noms invalides rejetés ; préfixes autorisés de scripts/ressources et confinement à la racine vérifiés |
| Cibles du serveur de scripts | Confinement via `realpath()` et vérifications de fonctions décrites plus haut |
| Arguments du shell | Échappement, assistants de commande structurés et validateurs là où ils sont appliqués ; inspecter le point d'appel réel |
| Arguments RRDtool | Validateurs de caractères de contrôle et de format dans `lib/functions.php` |
| SQL | Les assistants préparés lient les valeurs ; le SQL dynamique, les identifiants et les appels non préparés nécessitent un examen |
| Appelants d'agents distants | L'adresse source doit correspondre à une ligne active de `poller`, par IP exacte ou résolution inverse confirmée |

### Responsabilités du déploiement et des points d'appel

| Frontière | Pourquoi elle n'est pas appliquée |
|---|---|
| Filtrage des requêtes | Une page choisit ou non d'utiliser `get_filter_request_var()`. `log_validation` signale, il ne bloque pas |
| Échappement des sorties | `html_escape()` et `html_purify()` sont appliqués à chaque point d'appel |
| Autorisation par page | La vérification de domaine utilise `$user_auth_realm_filenames`, indexé par nom de fichier. Une page non mappée ne reçoit pas d'autorisation par cette seule table. Des contrôles supplémentaires peuvent s'appliquer ; les pages de greffons doivent enregistrer et appliquer leur politique |
| Blocage de répertoires | Les fichiers `.htaccess` sous `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` et `cache/*` sont des directives Apache. Sous nginx ou Apache avec `AllowOverride` désactivé, aucun ne s'applique |
| En-têtes de sécurité sur les fichiers statiques | `.htaccess.dist` est livré sans renommage. L'émission d'en-têtes PHP dépend du chemin de réponse et des paramètres ; les réponses statiques dépendent de la configuration serveur/proxy |
| Séparation des utilisateurs web et scruteur | Une convention, non une obligation |
| Permissions sur `include/config.php` | Définies par la personne qui a installé le logiciel |

Les scripts de redirection `index.php` dans `resource/` et ses sous-répertoires empêchent le
listage des dossiers. Ils ne constituent pas un contrôle d'accès et n'empêchent pas la requête directe
d'un fichier nommé.

## Points d'accès répondant avant authentification

Ce sont des exemples de points d'entrée spécialisés, non un inventaire exhaustif des points d'accès
publics. L'absence du fichier d'inclusion commun ne prouve pas l'absence d'authentification ou
d'autorisation ailleurs dans le chemin de la requête.

| Fichier | Comportement |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | La surface de connexion elle-même |
| `csp_report.php` | Reçoit les rapports de violation de CSP du navigateur |
| `service_check.php` | Répond `success` ou `fail` après une requête sur `version`. Une sonde de disponibilité sans authentification |
| `link.php` | Charge une ligne de lien externe, puis vérifie elle-même `is_realm_allowed($page['id'] + 10000)` |
| `remote_agent.php` | Le RPC du collecteur de données, autorisé par l'adresse source |

`remote_agent.php` mérite une attention particulière. Son autorisation s'appuie sur
`remote_client_authorized()`, qui compare `get_client_addr()` aux noms d'hôtes et adresses de la
table `poller`. Il n'existe aucun secret partagé. Un appelant dont l'adresse correspond à une ligne
de collecteur activé peut invoquer les actions de l'agent : scruter des données, exécuter une requête
de données, envoyer un ping, effectuer des interrogations SNMP get et walk, demander des données de
graphique et lancer une découverte réseau. Deux protections encadrent cela : d'abord, la fonction
renvoie purement false lorsqu'au plus une ligne de collecteur activée est retournée, rejetant ainsi
ce cas. Ensuite, lorsque la correspondance s'effectue par nom d'hôte plutôt que par IP exacte, la
résolution inverse est confirmée par une résolution directe avant d'être acceptée.

`get_client_addr()` lit `REMOTE_ADDR` et rien d'autre, à moins que `$proxy_headers` ne soit
défini dans `include/config.php`. La valeur par défaut livrée est `null`. L'activation des en-têtes
de proxy pris en charge modifie les sources ordonnées à partir desquelles une adresse client valide
est sélectionnée. N'utilisez que des en-têtes contrôlés par le proxy d'entrée de confiance, et empêchez
les clients de contourner ou de fournir eux-mêmes ces valeurs. C'est la ligne de configuration unique
qui modifie le plus la signification de chaque décision basée sur l'adresse dans le système, y compris
l'autorisation de l'agent distant et les adresses consignées dans les journaux.

## Accès invité

Le paramètre `guest_user` désigne un compte dont les permissions sont utilisées pour les pages de
graphiques sans connexion préalable. Sa valeur par défaut est aucun utilisateur, et l'affichage des
graphiques exige alors une authentification comme tout le reste. Le renseigner publie tout ce que ce
compte peut voir à toute personne pouvant joindre le serveur web. C'est l'objectif de cette
fonctionnalité. Le compte existe toujours dans les enregistrements d'utilisateurs ; le réglage invité
rend ses permissions de graphiques utilisables sans connexion ordinaire. Vérifiez les requêtes
réelles et les permissions d'objets, non seulement le nom de compte configuré.

## Comment raisonner face à une modification

Posez-vous trois questions dans l'ordre :

Quel processus exécutera ceci, et sous quel utilisateur ? La réponse pour une méthode de saisie de
données est normalement le compte de système d'exploitation du collecteur initiateur ; la collecte
déclenchée par le web peut différer de la collecte planifiée.

Qu'est-ce que la donnée touche lors de son transit ? Une valeur issue d'un équipement qui ne fait
qu'atterrir dans un fichier RRD a franchi une frontière. La même valeur dans un titre de graphique en
a franchi deux, et dans un argument de script, trois.

La frontière sur laquelle je m'appuie est-elle appliquée ou simplement conventionnelle ? Si elle est
conventionnelle, le code que vous rédigez en constitue l'application.

Lectures associées : [Permissions et accès](/fr/concepts/permissions-and-access/) pour le modèle
d'autorisation lui-même, [Méthodes de saisie de données](/fr/reference/data-input-methods/) pour le
contrat d'exécution et la liste blanche d'entrées, et
[Collecte de données distante](/fr/concepts/remote-data-collection/) pour ce qu'un collecteur de
données fait de la confiance qui lui est accordée.
