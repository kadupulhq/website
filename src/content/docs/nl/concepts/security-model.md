---
title: Beveiligingsmodel
description: Waar niet-vertrouwde gegevens Kadupul binnenkomen, welk proces met welk privilege draait, wat het databaseaccount kan doen en welke grenzen de code daadwerkelijk afdwingt in plaats van aanneemt.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 12
---

Een monitoringsysteem is om drie redenen lastig te verdedigen die niets te maken hebben met de
kwaliteit van de code.

Het bevat inloggegevens voor alles wat het bewaakt. SNMP-communities, v3-gebruikersnamen en
wachtwoordzinnen, en wat een apparaat verder nodig heeft, worden opgeslagen zodat de poller ze
onbeheerd kan gebruiken. Er is geen mens die ze elke vijf minuten handmatig invoert.

Het voert op gezette tijden opdrachten uit. Het verzamelen van een waarde die SNMP niet biedt,
vereist het uitvoeren van een script, en de definitie van dat script is configuratie, opgeslagen
in de database en bewerkbaar via de interface.

Het verwerkt gegevens die door de bewaakte machines worden geproduceerd. Een interfacebeschrijving,
een koppelpunt van een schijf, een sensornaam: alles is afkomstig van het apparaat en alles komt
terecht in de database, in grafiektitels en in argumenten voor andere programma's. Een gecompromitteerde
switch is een invoerbron, niet alleen een slachtoffer.

Geen van deze zaken is een defect. Het is wat de taak vereist. Hieronder volgt waar elk van deze
aspecten landt in de architectuur.

## Waar niet-vertrouwde invoer binnenkomt

Vier toegangspunten, ruwweg geordend naar de mate waarin een beheerder ze controleert.

| Toegangspunt | Bron | Waar het naartoe gaat |
|---|---|---|
| HTTP-parameters | Iedereen die de webserver kan bereiken | De database, pagina-uitvoer en SQL |
| SNMP-waarden | Het gepollde apparaat | `host_snmp_cache`, grafiektitels, RRD-grenzen, scriptargumenten |
| Scriptuitvoer | Een lokaal script of waarmee het communiceerde | `poller_output`, vervolgens RRD-bestanden |
| Geüploade sjablonen en pakketten | Wie het importdomein bezit | Sjabloonrijen, en voor pakketten bestanden op schijf |

### HTTP-parameters

Aanvraaghelpers bevinden zich in `lib/html_utility.php`. `get_filter_request_var()` valideert
standaard op gehele getallen, maar heeft ook uitzonderingen voor lege, ongedefinieerde en regex-waarden.
Een aanroeper moet nog steeds controleren of een waarde vereist en passend is voor de bewerking.
Filteren vestigt geen autorisatie.

`set_request_var()` slaat een waarde op in `$_CACTI_REQUEST` en spiegelt deze naar de
request-arrays. `get_nfilter_request_var()` leest die cache of het ruwe verzoek en valideert of
schrijft de waarde zelf niet. Latere leesacties kunnen daarom een eerder opgeslagen waarde zien, en
de leesvolgorde doet ertoe.

Wanneer `log_validation` is ingeschakeld, registreert `get_request_var()` bepaalde niet-gecachete
aanvraaguitlezingen. Directe superglobale uitlezingen en `get_nfilter_request_var()` worden niet
allemaal gedekt. Het is diagnostische ondersteuning, geen volledige validatiecontrole of handhaving.

### SNMP-waarden

Detectie van gegevensquery's slaat geselecteerde geïndexeerde waarden op in `host_snmp_cache`;
gewone SNMP-pollingresultaten volgen het samplepad. `data_query_format_record()` in
`lib/data_query.php` past vóór opslag twee transformaties toe: een optionele `rewrite_value`-toewijzing
uit de querydefinitie en `bin2hex()` op elke waarde waarvan de codering niet door `mb_detect_encoding()`
kan worden vastgesteld. Die tweede is een bescherming tegen binaire octetreeksen, niet tegen
kwaadaardige inhoud.

Van daaruit reist de waarde verder. Het benoemt grafieken via `substitute_snmp_query_data()`.
Het kan een RRD-maximum instellen, omdat een gegevenssjabloon zijn maximum kan declareren als
`|query_ifSpeed|`. Het wordt een argument voor een scriptquery, waarbij `get_script_query_path()`
elk onderdeel eerst door `cacti_escapeshellarg()` leidt.

De escaping en de RRDtool-validators beschreven in [RRDtool-integratie](/nl/reference/rrdtool-integration/)
vormen hier de grens. Apparaatgegevens moeten als niet-vertrouwd worden beschouwd. Validatie en
escaping zijn eigenschappen van elke aanroepplek; de aanwezigheid van helpers is geen bewijs dat elke
consument ze correct gebruikt. Controleer zowel de commandostructuur als het ingevoegde argument.

### Scriptuitvoer

De `popen()`-tak van `exec_poll()` leest met `fgets(..., 8192)` maximaal 8.191 bytes of tot
de eerste nieuwe regel. De `shell_exec()`-fallback vertoont ander uitvoergedrag, en verzameling
via de scriptserver volgt een ander pad.

`prepare_validate_result()` herkent numerieke en onbekende waarden, hexadecimale vormen en
sommige meerdelige uitvoerpatronen. Het kan ook tekst verwijderen om een numerieke waarde te
verkrijgen; het is geen universeel strikt scalair filter. Latere verwerking en RRDtool-validatie
zijn eveneens van belang. Zie [Gegevensinvoermethoden](/nl/reference/data-input-methods/).

Uitvoercontroles sluiten een script dat al is uitgevoerd niet achteraf op in een sandbox. Beoordeel
het commando, de invoerwitte lijst en de besturingssysteemprivileges voordat u verzameling inschakelt.

### Sjablonen en pakketten

Twee verschillende mechanismen delen één domein.

Een **sjabloonimport** is platte XML zonder handtekening. Het maakt sjablonen, gegevensquery's en
gegevensinvoermethoden aan. Een gegevensinvoermethode is een opdrachtregel, dus dit is een pad van
een geüpload bestand naar iets dat de poller zal uitvoeren. `lib/import.php` voert
`cacti_input_string_is_safe()` uit op elke geïmporteerde `input_string` en weigert de methode
wanneer deze shell-metatekens bevat, met de melding:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Een **pakketimport** is ondertekend. `import_read_package_data()` leest de ingesloten openbare
sleutel van het pakket en vergelijkt deze met de drie sleutels die in `lib/import.php` zijn
gecompileerd: de twee Cacti-sleutels en de Kadupul-sleutel. Elke andere sleutel mislukt. Een pakket
zonder `<publickey>`-element wordt gelezen alsof het de oudere Cacti-sleutel claimt, en moet dan
een handtekening produceren die daartegen verifieert. `import_read_package_data()` weigert elke
sleutel onder 2048 bits voordat verificatie wordt geprobeerd, waaraan de oudere sleutel van 512 bits
niet voldoet. Elk opgenomen bestand bevat een eigen handtekening, die afzonderlijk wordt geverifieerd.

Pakketten mogen vervolgens geselecteerde bestanden schrijven. Geaccepteerde namen beginnen met
`scripts/` of `resource/`, optioneel onder een geldig `plugins/<name>/`-voorvoegsel. De
importeur weigert NUL-bytes, padtraversie en absolute paden en controleert insluiting onder de
installatiewortel; alleen het bevatten van een directorynaam is onvoldoende. De schrijfrechten
van de bestemming bepalen ook of het schrijven slaagt. Een pakket dat de verificatie doorstaat,
schrijft opzettelijk uitvoerbare PHP in de installatiestructuur. Handtekeningverificatie bevestigt
de geaccepteerde ondertekeningsidentiteit en integriteit, niet dat code onschadelijk is. Domeinautorisatie,
padinsluiting, geselecteerde bestanden, bestandssysteempermissies en opdrachtenbeleid doen er ook toe.

Beide mechanismen bevinden zich achter domein 17. De standaardrol Sjabloonbewerker bezit domein 17
en domein 2 (Gegevensinvoermethoden). Een account met die rechten kan verzamelopdrachten definiëren,
onderhevig aan validatie en controle van de witte lijst. Dat is waar de rol voor bedoeld is, en het
is verstandig dit te weten voordat u deze toekent. Zie
[Sjablonen importeren en exporteren](/nl/guides/import-and-export-templates/) voor de gevalideerde
werkstroom en bekende beperkingen.

## Wat met welk privilege draait

| Proces | Gestart door | Draait als | Taak |
|---|---|---|---|
| Webinterface | De webserver | De webservergebruiker | Leest en schrijft de database, rendert grafieken via RRDtool, schrijft RRD-bestanden op verzoek, schrijft pakketbestanden tijdens import |
| `poller.php` | Geconfigureerde scheduler of service | Scheduler-/serviceaccount | Leest de poller-cache, start collectors, schrijft RRD-bestanden |
| `cmd.php` | Poller of realtime verzamelpad | Startend account | Voert SNMP-gets en verzamelopdrachten uit |
| `script_server.php` | Collector | Startend account | Sluit een PHP-bestand in en roept een functie aan in haar eigen proces |
| RRDtool | Het webproces of de poller | Het proces dat het aanriep | Leest en schrijft bestanden onder `rra/` |

Twee daarvan verdienen nadere toelichting:

**De scriptserver is geen sandbox.** Hij sluit het doelbestand in binnen een langlopend PHP-proces
en roept daarin een functie aan. Die functie deelt het proces, het geheugen en de databaseverbinding.
De controles in `script_server.php` bepalen of de aanroep überhaupt plaatsvindt: `realpath()`
van het in te sluiten bestand moet worden opgelost onder `$config['base_path']` of
`$config['scripts_path']`, de functie moet bestaan na insluiting, `ReflectionFunction::isInternal()`
moet false zijn en het bestand waarin de functie is gedefinieerd moet zich ook onder een toegestane
wortel bevinden. Zodra deze slagen, draait de code met het volledige privilege van de poller. Een
scriptservermethode is een manier om PHP binnen Kadupul uit te voeren, niet ernaast.

**Het webproces kan RRD-bestanden schrijven.** Grafiekaanvragen kunnen on-demand Boost-updates en
bestandscreatie activeren. Een waarschuwing die het aanmaken van een map uitstelt naar de poller,
maakt schrijftoegang voor het webproces niet universeel optioneel. De opslagcontrole en het
onderhoudscoördinatieproces controleren ook accounttoegang en vertrouwde numerieke UID/GID-configuraties.
Creatie vanuit root probeert opslageigenaarschap te evenaren, maar fouten kunnen worden gelogd.
Zie [Veilig upgraden](/nl/guides/upgrade-safely/).

De accounts voor web en de geplande poller kunnen verschillen. Realtime verzameling gestart vanuit
een webverzoek kan het webaccount erven, zodat opdrachtuitvoering niet beperkt is tot de identiteit
van de geplande poller. De overgenomen Spine-integratie vereist afzonderlijke validatie met het
feitelijke binaire bestand; deze pagina beschrijft geen ondersteunde build.

## Wat het databaseaccount nodig heeft

Processen die dezelfde databaseconfiguratie gebruiken, delen normaal gesproken het account. Externe
collectors kunnen afzonderlijke lokale en centrale inloggegevens hebben; implementatiespecifieke
configuraties kunnen verschillen. Controleer de feitelijke toekenningen voor elk geconfigureerd account.

| Vereiste | Waarom |
|---|---|
| Volledige DML op het Kadupul-schema | Reguliere werking |
| DDL op het Kadupul-schema | Upgrades en runtime-bewerkingen zoals Boost-tabelrotatie, tijdelijke tabellen en levenscycluswijzigingen van plugins |
| `SELECT` op `mysql.time_zone_name` | Tijdzonelijsten voor locaties en datacollectors lezen die tabel rechtstreeks |

Verwijder geen DDL-privileges vanuit de aanname dat alleen upgrades ze nodig hebben. De applicatie
schakelt niet universeel over naar een afzonderlijke migratie-identiteit; scheiding van accounts
vereist implementatiespecifieke validatie van alle getroffen runtimepaden.

`include/config.php` bevat database-inloggegevens en externe collectors kunnen ook centrale
`$rdatabase_*`-inloggegevens bevatten. Bestandssysteempermissies, HTTP-toegangsregels,
PHP-handlerconfiguratie en back-upbeveiliging zijn allemaal van belang. PHP voert het bestand
normaal gesproken uit in plaats van de broncode te tonen, maar dat is geen vervanging voor
bescherming tegen directe openbaarmaking. Zie
[Een internetgerichte installatie beveiligen](/nl/guides/secure-an-internet-facing-install/).

Apparaatinloggegevens worden op dezelfde manier opgeslagen. `host.snmp_community`,
`host.snmp_password` en `host.snmp_priv_passphrase` zijn gewone kolommen, geschreven door
`api_device_save()` via `form_input_validate()` zonder versleuteling, en gekopieerd naar
`poller_item`-rijen zodat de poller ze kan lezen. Leestoegang tot de relevante tabellen kan
opgeslagen apparaatinloggegevens blootleggen; dit impliceert geen toegang tot elke externe bron.
Gebruikerswachtwoorden zijn de uitzondering: `compat_password_hash()` gebruikt PHP's
`password_hash()` met `PASSWORD_DEFAULT`, en een verouderde MD5-hash die nog steeds verifieert,
wordt opnieuw gehasht bij de volgende aanmelding.

## Afgedwongen en louter conventioneel

Dit is het onderscheid dat er het meest toe doet bij het beoordelen van een wijziging.

### Codemechanismen en hun bereik

| Grens | Mechanisme |
|---|---|
| Authenticatie | Gemeenschappelijke interfacepagina's gebruiken `include/auth.php`; gespecialiseerde eindpunten hebben hun eigen afhandeling |
| CSRF | Gedeelde web-bootstrap configureert tokenafhandeling; foutieve token-arrays worden geweigerd. Controleer elk eindpunt en verzendpad in plaats van universele dekking aan te nemen |
| Alleen-CLI scripts | `include/cli_check.php` geeft `404` en sluit af wanneer de SAPI niet `cli` is |
| Locatie van gegevensquery-XML | `cacti_path_is_within()` tegen `<base_path>/resource`, gelogd en geweigerd indien afwijkend |
| Authenticiteit van pakket | Handtekening tegen een meegecompileerde sleutel, minimaal 2048 bits, handtekeningen per bestand |
| Plaatsing van pakketbestanden | Ongeldige namen geweigerd; toegestane script-/bronvoorvoegsels en opgeloste insluiting onder de wortel gecontroleerd |
| Scriptserverdoelen | `realpath()`-insluiting, plus de bovenstaande functiecontroles |
| Shell-argumenten | Escaping, gestructureerde commandohelpers en validators waar toegepast; inspecteer de feitelijke aanroepplek |
| RRDtool-argumenten | Besturingsteken- en vormvalidators in `lib/functions.php` |
| SQL | Prepared helpers binden waarden; dynamische SQL, identifiers en niet-voorbereide aanroepen vereisen nog steeds controle |
| Externe agent-aanroepers | Bronadres moet overeenkomen met een actieve rij in `poller`, via exact IP-adres of een bevestigde forward-reverse lookup |

### Verantwoordelijkheden bij implementatie en aanroepplekken

| Grens | Waarom het niet wordt afgedwongen |
|---|---|
| Aanvraagfiltering | Een pagina kiest voor `get_filter_request_var()` of niet. `log_validation` rapporteert, het blokkeert niet |
| Uitvoermaskering | `html_escape()` en `html_purify()` worden per aanroepplek toegepast |
| Autorisatie per pagina | De domeincontrole gebruikt `$user_auth_realm_filenames`, geïndexeerd op bestandsnaam. Een niet-gekoppelde pagina krijgt geen positieve controle op basis van die tabel alleen. Aanvullende controles kunnen gelden; pluginpagina's moeten hun toegangsbeleid zelf registreren en afdwingen |
| Directoryblokkering | De `.htaccess`-bestanden onder `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` en `cache/*` zijn Apache-instructies. Onder nginx of onder Apache met `AllowOverride` uit, is geen enkele van toepassing |
| Beveiligingsheaders op statische bestanden | `.htaccess.dist` wordt zonder hernoeming geleverd. Uitgifte van PHP-headers hangt af van het responspad en instellingen; statische reacties hangen af van server-/proxyconfiguratie |
| Scheiding van web- en pollergebruikers | Een conventie, geen vereiste |
| Permissies op `include/config.php` | Ingesteld door wie het heeft geïnstalleerd |

De `index.php`-omleidingsstubs in `resource/` en submappen voorkomen een directorylijst. Ze
zijn geen toegangsbeveiliging en verhinderen een directe aanvraag voor een benoemd bestand niet.

## Eindpunten die antwoorden vóór authenticatie

Dit zijn voorbeelden van gespecialiseerde toegangspunten, geen uitputtende inventaris van
openbare eindpunten. De afwezigheid van de gemeenschappelijke include bewijst niet de afwezigheid
van authenticatie of autorisatie elders in het aanvraagpad.

| Bestand | Gedrag |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Het aanmeldingsscherm zelf |
| `csp_report.php` | Ontvangt CSP-schendingsrapporten van browsers |
| `service_check.php` | Antwoordt met `success` of `fail` na één query op `version`. Een liveness-test zonder authenticatie |
| `link.php` | Laadt een externe linkrij en controleert vervolgens zelf `is_realm_allowed($page['id'] + 10000)` |
| `remote_agent.php` | De RPC voor de datacollector, geautoriseerd op bronadres |

`remote_agent.php` is degene om goed over na te denken. De autorisatie ervan is
`remote_client_authorized()`, dat `get_client_addr()` vergelijkt met de hostnamen en adressen
in de `poller`-tabel. Er is geen gedeeld geheim. Een aanroeper wiens adres overeenkomt met een
actieve datacollector-rij kan de acties van de agent aanroepen: gegevens pollen, een gegevensquery
uitvoeren, een apparaat pingen, SNMP-gets en walks uitvoeren, grafiekgegevens opvragen en
netwerkdetectie starten. Twee beveiligingen sturen dit. Ten eerste retourneert de functie direct
false wanneer er maximaal één ingeschakelde collectorrij wordt geretourneerd, zodat dat geval door
deze functie wordt afgewezen. Ten tweede, wanneer de overeenkomst via een hostnaam verloopt in plaats
van een exact IP-adres, wordt de reverse lookup bevestigd door een forward lookup voordat deze wordt
geaccepteerd.

`get_client_addr()` leest `REMOTE_ADDR` en niets anders, tenzij `$proxy_headers` is ingesteld
in `include/config.php`. De standaardwaarde is `null`. Het inschakelen van ondersteunde
proxy-headers verandert de bronnen waaruit een geldig clientadres wordt geselecteerd. Gebruik alleen
headers die worden beheerd door de vertrouwde ingress-proxy en voorkom dat clients deze waarden
omzeilen of zelf aanleveren. Dit is de enkele configuratieregel die de betekenis van elke
adresgebaseerde beslissing in het systeem het meest verandert, inclusief de autorisatie van externe
agents en de in het logboek vastgelegde adressen.

## Gasttoegang

De instelling `guest_user` noemt een account waarvan de machtigingen worden gebruikt voor
grafiekpagina's zonder aanmelding. De standaardwaarde is geen gebruiker, en het bekijken van
grafieken vereist dan authenticatie zoals al het andere. Het instellen ervan publiceert wat dat
account mag zien aan iedereen die de webserver kan bereiken. Dat is de bedoeling van de functie.
Het account bestaat nog steeds in de gebruikersrecords; de gastinstelling maakt de toepasselijke
grafiekmachtigingen bruikbaar zonder normale aanmelding. Controleer daadwerkelijke verzoeken en
objectmachtigingen, niet alleen de geconfigureerde accountnaam.

## Hoe over een wijziging na te denken

Stel drie vragen op volgorde:

Welk proces voert dit uit, en als welke gebruiker? Het antwoord voor een gegevensinvoermethode
is normaal gesproken het besturingssysteemaccount van de startende collector; verzameling gestart
vanaf het web kan verschillen van geplande verzameling.

Wat raakt de data onderweg aan? Een waarde van een apparaat die uitsluitend in een RRD-bestand
terechtkomt, heeft één grens overschreden. Dezelfde waarde in een grafiektitel heeft er twee
overschreden, en in een scriptargument drie.

Is de grens waarop ik vertrouw afgedwongen of conventioneel? Als deze conventioneel is, is de code
die u schrijft de handhaving.

Aanbevolen literatuur: [Machtigingen en toegang](/nl/concepts/permissions-and-access/) voor het
autorisatiemodel zelf, [Gegevensinvoermethoden](/nl/reference/data-input-methods/) voor het
uitvoeringscontract en de invoerwitte lijst, en
[Externe gegevensverzameling](/nl/concepts/remote-data-collection/) voor wat een datacollector
doet met het vertrouwen dat hij krijgt.
