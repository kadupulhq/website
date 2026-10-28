---
title: Sécuriser une installation exposée à Internet
description: Ce qu'il faut modifier avant qu'un système de surveillance doté d'un accès shell à votre réseau ne réponde aux requêtes provenant d'Internet.
banner:
  content: Kadupul est en phase pré-alpha. Validez ces procédures dans une installation de test isolée. Ébauche de traduction en attente de révision par une personne maîtrisant la langue.
sidebar:
  order: 9
---

:::caution[Valider avant utilisation]
Le code source est disponible, mais il n'existe aucune version publiée ni procédure
de migration prise en charge pour Kadupul. Testez ces procédures sur une copie
isolée avec des sauvegardes avant de vous y fier. Consultez [l'état du projet](/fr-ca/project/status/).
:::

Commençons par la réponse honnête : placez-le derrière un VPN. Kadupul conserve les identifiants
SNMP de chaque équipement que vous surveillez en texte brut, et il exécute des commandes sur son
propre hôte dans le cadre de son fonctionnement normal. Aucune configuration ne permet de justifier
son exposition sur l'Internet public.

Les vérifications ci-dessous aident à évaluer une installation isolée. Elles ne constituent pas
un déploiement public pris en charge ou sécurisé ; gardez à l'esprit la limitation du statut du
projet énoncée ci-dessus lors de l'interprétation des résultats.

## TLS

Terminez TLS au niveau du serveur web ou d'un proxy placé devant lui. Kadupul n'écoute pas sur
un socket qui lui soit propre.

Activez ensuite le paramètre qui redirige les requêtes HTTP simples vers HTTPS. Il est désactivé
par défaut (`off`). Sans lui, un formulaire de connexion est servi en HTTP et un mot de passe
transite sur le réseau en clair avant que toute autre mesure ne puisse intervenir.

L'application active l'attribut Secure du cookie de session lorsque PHP reçoit une valeur non vide
de `$_SERVER['HTTPS']` autre que `off`. Derrière un proxy terminant TLS, configurez le serveur
web de confiance ou la couche FastCGI pour représenter correctement HTTPS, et vérifiez l'en-tête
`Set-Cookie` résultant dans un navigateur.

`$proxy_headers` contrôle la résolution de l'adresse client. Il ne définit pas la variable de
serveur HTTPS et n'active pas les cookies Secure. Ne faites confiance qu'aux en-têtes d'adresse
que votre proxy définit, supprimez les copies fournies par les clients et empêchez l'accès direct
au backend. Imposez les redirections HTTP vers HTTPS au niveau du proxy public avant l'envoi des identifiants.

L'application applique HttpOnly et SameSite=Strict sur son cookie de session. Vérifiez le comportement
réel du cookie et des redirections à la frontière du déploiement ; ces attributs ne garantissent pas
que tous les autres cookies partagent la même configuration. Consultez la
[référence de configuration des sessions PHP](https://www.php.net/manual/en/session.configuration.php).

## Identifiants par défaut

Le schéma fourni contient un compte administratif nommé `admin` dont le hachage du mot de passe
est le MD5 de la chaîne `admin`. Il est marqué pour exiger un changement lors de la première connexion.
Confirmez que ce changement a bien eu lieu au lieu de le supposer. L'invite qui l'impose est ignorée
dans le cadre de l'authentification web basique, où le serveur web a déjà décidé qui est l'utilisateur.

Examinez ensuite les identifiants qui ne sont pas des comptes d'utilisateurs :

- Le compte de base de données est par défaut `cactiuser` avec le mot de passe `cactiuser` dans le modèle de configuration fourni.
- Le sous-système d'automatisation fournit des options SNMP par défaut contenant les chaînes de communauté `public` et `private`, ainsi qu'une paire d'identifiant et de mot de passe SNMPv3. Ce sont des valeurs par défaut pour la découverte, et non la configuration des équipements, mais ce sont les chaînes que votre détection essaiera en premier.

La politique de mot de passe est configurable. Les valeurs par défaut exigent huit caractères et
un mélange de majuscules et minuscules. L'expiration et le verrouillage de compte après des échecs
répétés sont tous deux disponibles et tous deux désactivés par défaut. Sur une installation exposée à Internet, activez le verrouillage.

## Privilèges de base de données

L'exemple d'installation utilise des privilèges délimités à la base de données ainsi que l'accès
à la table des fuseaux horaires. Remplacez ces noms de compte/base de données d'illustration et
examinez les privilèges pour les tâches réelles de déploiement et de maintenance :

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Cette seconde attribution n'est pas facultative. La gestion des fuseaux horaires lit cette table,
et le programme d'installation vérifie l'accès et la présence de données de fuseau horaire. Examinez
les privilèges supplémentaires par rapport aux besoins réels de maintenance et de collecte avant
de les supprimer ; cet exemple ne prouve pas que chaque déploiement nécessite exactement les mêmes privilèges.

Remarques importantes sur la portée :

- Liez la base de données à localhost ou à une interface privée, et non à l'adresse sur laquelle le serveur web répond.
- Attribuez à chaque collecteur de données distant son propre compte de base de données. Leurs identifiants résident dans la base de données centrale et dans leur propre fichier de configuration ; des comptes distincts améliorent donc l'imputabilité et la révocation. Ils n'isolent pas à eux seuls un collecteur compromis si ses privilèges autorisent toujours des écritures centrales.
- La connexion prend en charge TLS, configuré avec une clé, un certificat et un chemin d'autorité de certification dans le fichier de configuration. Utilisez-le chaque fois que la base de données n'est pas sur le même hôte.
- Rendez le fichier de configuration lisible par l'utilisateur du serveur web et accessible en écriture ni par l'utilisateur du service web ni par celui du poller en fonctionnement normal. Conservez sa propriété sous un compte administratif. La configuration d'un poller distant vérifie spécifiquement s'il peut mettre à jour le fichier ; ne supposez pas que chaque installation de serveur principal a besoin des mêmes autorisations d'écriture temporaires.
- Le secret CSRF peut être stocké dans un fichier plutôt que dans la base de données. Si vous utilisez cette option, le fichier doit impérativement se trouver en dehors de la racine des documents. Cela est stipulé comme une exigence, non une suggestion.

## Maintenir les répertoires de données hors de la racine des documents

Dans un déploiement à la racine du dépôt, les données privées et les répertoires de code source
peuvent se trouver sous la racine servie. Plusieurs répertoires comportent des règles de refus
`.htaccess` ; faites l'inventaire de la copie de travail réelle et de la configuration du serveur
plutôt que de supposer que chaque chemin est couvert. La migration partielle actuelle du framework
signifie également que basculer l'ensemble du site vers `public/` sans ses routes héritées ne
constitue pas une procédure de déploiement complète.

Ces fichiers ne fonctionnent que sur Apache, et uniquement lorsque la configuration autorise une
substitution dans ce répertoire. Sur nginx, ils sont inopérants. Sur un serveur Apache mal configuré,
ils sont inopérants. Un refus total inopérant devant le répertoire des journaux signifie que n'importe
qui peut lire le journal de votre application, qui contient les noms d'équipements, les noms
d'utilisateurs, le texte des requêtes et les détails des erreurs. Apache documente le comportement de
substitution requis dans son [guide `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Appliquez ces deux mesures :

**Vérifier les chemins de stockage avant de déplacer les données.** Les destinations des journaux
sont configurables, mais `include/global.php` définit la base RRA sur le répertoire `rra` de
l'installation ; il n'y a pas de paramètre générique d'interface utilisateur pour le répertoire RRA.
Une disposition de stockage montée séparément peut préserver ce chemin attendu, mais l'emplacement
dans le système de fichiers n'empêche pas à lui seul l'accès HTTP par le biais d'un répertoire servi
ou d'un lien symbolique. Vérifiez conjointement les chemins des sources de données existantes, les
permissions des services, les sauvegardes et le refus HTTP. Ne déplacez pas les arbres de cache sans
vérifier la manière dont leurs consommateurs résolvent les fichiers. Consultez
[Migrer vers un nouveau matériel](/fr-ca/guides/migrate-to-new-hardware/) et
[Mettre à niveau en toute sécurité](/fr-ca/guides/upgrade-safely/).

**Refuser les chemins privés au niveau du serveur web.** Adaptez
[l'exemple Nginx à la racine du dépôt](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
issu du code source au préfixe d'URL réel et au serveur ; les règles de refus doivent prévaloir sur
le traitement PHP générique. Cette liste constitue une aide à l'inventaire, non une configuration de
serveur prête à l'emploi :

| Répertoire | Motif |
|---|---|
| `rra/` | Fichiers de mesures |
| `log/` | Journal de l'application, y compris les détails des requêtes et des erreurs |
| `cache/` | Inspecter l'accès aux ressources prévu ; bloquer l'exécution de PHP dans les chemins de cache |
| `scripts/` | Le code de collecte ne doit pas être directement servi ni invoqué via HTTP |
| `cli/` | Outils en ligne de commande non destinés à être accessibles via HTTP |
| `mibs/`, `contrib/`, `docs/` | Ressources internes et documentation |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Éléments internes de l'application, état et outillage |
| Fichiers cachés, manifestes de dépendances, fichiers PHP internes include/bootstrap | Métadonnées de dépôt et points d'entrée internes |

Préservez les ressources publiques indispensables telles que `include/js` et `include/themes` ;
un blocage général de tous les includes peut endommager l'interface utilisateur. Vérifiez le refus
à l'aide de chemins de test inoffensifs et assurez-vous que les réponses ne divulguent pas le code
source ou le contenu des fichiers. Ne faites pas de tests en extrayant de véritables secrets dans
un terminal ou un journal.

Il existe également un fichier optionnel d'en-têtes de réponse de sécurité pour les ressources statiques.
Les réponses PHP définissent leurs propres en-têtes dans le code ; les fichiers statiques ne le font
pas, à moins que vous n'activiez ce fichier ou ne placiez les mêmes directives dans la configuration du serveur.

Une politique de sécurité de contenu (CSP) est configurable. La politique de script par défaut
autorise le JavaScript en ligne sans nonce, car les plugins en dépendent. Le mode avec nonce plus
strict exposé dans les paramètres est en mode rapport uniquement. L'implémentation de l'en-tête accepte
également l'application de `nonce`, en dépit de [l'aide obsolète des paramètres](https://github.com/kadupulhq/kadupul/issues/265).
L'application stricte et le mode rapport seul sont distincts ; inspectez les en-têtes et testez toutes
les pages/plugins nécessaires avant de changer de mode. L'application implémentée ne constitue pas une
preuve de compatibilité totale avec les nonces.

## Le poller exécute des commandes

C'est l'élément qui modifie le modèle de menace.

La collecte ne se limite pas à SNMP. Une méthode d'entrée de données peut définir une ligne de commande,
et le poller l'exécute. La ligne de commande est enregistrée dans le cache du poller et exécutée par
le collecteur à chaque intervalle, en tant qu'utilisateur du système d'exploitation du collecteur.
Les entrées de script-server PHP utilisent un processus PHP distinct à longue durée de vie. Les
commandes externes et les entrées de serveur de script constituent des voies différentes ; ne supposez
pas que chaque script s'exécute dans ce serveur ni qu'un collecteur C a été validé pour cette version.

Traitez les autorisations suivantes comme des surfaces de configuration hautement privilégiées
permettant l'exécution de code. Leurs effets exacts dépendent des fonctionnalités activées et des
contrôles de validation :

| Autorisation | Motif |
|---|---|
| Méthodes d'entrée des données | Définit directement la ligne de commande |
| Importer des modèles | Un modèle ou un paquet importé peut contenir une méthode d'entrée de données |
| Gestion des plugins | Le code des plugins s'exécute au sein de l'application |
| Paramètres / Utilitaires | Contrôle les chemins d'accès aux binaires exécutés |

Ne les accordez à personne qui ne dispose pas déjà d'un shell sur cet hôte. Un utilisateur en lecture
seule autorisé à visualiser des graphiques est un cas totalement différent, et c'est le rôle que
presque chaque compte devrait avoir.

Deux contrôles existent et méritent tous deux d'être utilisés :

**Restriction des métacaractères.** Les métacaractères du shell dans les chaînes de commande d'entrée
de données sont bloqués par défaut. Il existe un paramètre permettant de les autoriser, introduit pour
d'anciennes définitions utilisant des pipelines shell. Laissez-le désactivé. Si vous avez des définitions
qui le requièrent, déplacez le pipeline dans un script situé dans le répertoire des scripts et appelez
ce script.

**La liste blanche d'entrées.** Un fichier, désigné dans le fichier de configuration, contenant les
chaînes de commande approuvées répertoriées par méthode d'entrée de données. Lorsqu'il est défini, les
graphiques et les sources de données ne peuvent pas être créés à partir d'une méthode d'entrée de données
dont la chaîne de commande n'apparaît pas sur la liste. La modification d'une commande approuvée fait
échouer la comparaison jusqu'à ce que la liste blanche revue soit mise à jour. La régénération est une
étape en ligne de commande, et c'est tout l'intérêt : elle nécessite un accès shell sur l'hôte, et non
une session administrative dans le navigateur.

La vérification s'exécute à nouveau lors de la reconstruction du cache du poller. Une entrée de données
qui échoue ne génère aucun élément de poller, et toutes les lignes qu'elle a laissées sont supprimées
lors de la reconstruction/vidage validé suivant. Cela filtre la création et le peuplement du cache ;
il ne s'agit pas d'un mécanisme d'annulation instantanée pour les travaux déjà en cours ni de la preuve
que chaque collecteur recharge une liste blanche modifiée avant chaque exécution. Vérifiez l'état validé
du cache et le comportement du collecteur après un changement de politique.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Un `--update` sans restriction intègre les définitions de commande actuelles dans la liste blanche ;
ne l'utilisez pas pour vous dispenser de les examiner. Protégez la liste blanche et son répertoire parent
contre les écritures des utilisateurs de service. Elle est inactive à moins d'être configurée. Consultez
[Écrire un script de collecte de données](/fr-ca/guides/write-a-data-collection-script/) pour les détails de sélection et de sortie.
Cela renforce le coût d'une compromission administrative côté navigateur, car l'introduction d'une nouvelle
commande dans la collecte nécessite désormais également un accès en écriture au système de fichiers de
l'hôte du poller. Cela ne remplace toujours pas la restriction des personnes détenant les autorisations
du tableau ci-dessus, car un attaquant pouvant atteindre une chaîne de commande déjà approuvée n'a pas
besoin d'en ajouter une.

## Authentification

Quatre méthodes sont fournies. Celles qui sont disponibles dépendent des extensions PHP installées.

| Méthode | Où les utilisateurs sont vérifiés | Remarques |
|---|---|---|
| Intégrée | La base de données locale | Les mots de passe, la politique et le verrouillage sont tous gérés localement |
| Web basique | Le serveur web | Kadupul fait confiance à tout ce que le serveur indique sur l'utilisateur |
| LDAP | Un annuaire unique | Nécessite l'extension PHP LDAP |
| Domaines LDAP/AD multiples | Plusieurs annuaires | Même exigence |

Le sélecteur des paramètres expose ces méthodes authentifiées, et non le mode zéro hérité. L'amorce
d'authentification tente de migrer une ancienne configuration sans authentification vers une authentification
locale, mais les assistants d'autorisation de niveau inférieur comportent toujours des branches pour le mode
zéro. Vérifiez la méthode enregistrée, les identités configurées et les routes réellement protégées plutôt
que de considérer l'absence de choix dans l'interface comme une preuve universelle.

Points à vérifier :

- **L'authentification web basique délègue la validation de l'identité.** Kadupul lit les variables d'identité authentifiées par le serveur lorsque ce mode est sélectionné et applique toujours le mappage de compte, l'état d'activation et les règles d'autorisation. Une identité manquante n'est pas automatiquement un administrateur. Configurez le serveur pour authentifier chaque route prévue et empêcher les clients de fournir des variables d'identité de confiance ; vérifiez séparément les routes d'image/export et le comportement délibéré des invités.
- **La prise en charge de "Rester connecté"** est activée par défaut. Un jeton persistant est créé lorsque l'utilisateur choisit cette option après l'authentification, plutôt qu'automatiquement pour chaque session. Il expire après quatre-vingt-dix jours de non-utilisation. Sur une installation exposée à Internet, déterminez délibérément si vous souhaitez la conserver.
- **Définissez l'utilisateur invité sur personne**, à moins que vous ne souhaitiez explicitement autoriser la consultation anonyme des graphiques. Il n'y a aucun utilisateur par défaut, ce qui est le bon choix ; vérifiez que cela n'a pas été modifié lors de l'installation.
- **Placez une authentification multifacteur en amont.** Il n'y a pas d'authentification multifacteur dans l'application. Un proxy sensible à l'identité ou une passerelle SSO est l'endroit approprié pour l'intégrer.

## Points de terminaison des collecteurs de données distants

Si vous utilisez des collecteurs distants, l'installation centrale expose un point de terminaison qu'ils
appellent. Il ne s'authentifie pas au moyen d'une session utilisateur. Il autorise en résolvant l'adresse
appelante et en la comparant aux noms d'hôtes des collecteurs enregistrés, consignant les échecs dans
une catégorie de sécurité.

Deux conséquences en découlent. Premièrement, ce point de terminaison ne doit pas être accessible
depuis l'Internet public ; restreignez-le au niveau du serveur web aux adresses des collecteurs. Deuxièmement,
l'adresse client vérifiée est celle déduite de la requête, de sorte que la confiance envers les en-têtes
transmis configurée précédemment s'applique ici également. Faire confiance à des en-têtes que vous ne
maîtrisez pas permet à un appelant de revendiquer l'adresse d'un collecteur.

Par ailleurs, le paramètre autorisant les certificats auto-signés et les discordances de nom d'hôte
lorsque le serveur central communique avec un collecteur est activé par défaut. Émettez de véritables
certificats pour vos collecteurs et désactivez cette option.

## Liste de contrôle minimale

1. TLS terminé, HTTP redirigé avant la connexion, état HTTPS de PHP configuré par le serveur de confiance, et cookies Secure vérifiés. En-têtes d'adresse client limités à ceux que le proxy définit et élimine.
2. Mot de passe administrateur par défaut modifié et confirmé. Verrouillage de compte activé.
3. Privilèges de base de données examinés pour les rôles d'installation, de maintenance et de collecteur ; accès aux fuseaux horaires vérifié et accès réseau à la base restreint aux clients requis.
4. Chemins de stockage vérifiés, répertoires privés et métadonnées refusés sur le serveur web, et ressources statiques requises toujours fonctionnelles.
5. Fichier de configuration non accessible en écriture au moment de l'exécution. Fichier de secret CSRF, s'il est utilisé, en dehors de la racine des documents.
6. Méthodes d'entrée des données, Importer des modèles et Gestion des plugins accordés à personne sans shell sur l'hôte du poller. Restriction des métacaractères activée. Liste blanche d'entrées configurée.
7. Point de terminaison du collecteur distant restreint par adresse. Vérification des certificats activée.
8. Authentification multifacteur dans un proxy devant l'ensemble du système.
