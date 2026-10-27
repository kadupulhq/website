---
title: "Installatie"
description: "Wat Kadupul nodig heeft om te draaien en de volgorde waarin het wordt samengesteld."
sidebar:
  order: 2
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat je
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Doorloop dit eenmaal, op volgorde. Elke stap eindigt met een controle. Voer de controle
uit voordat je verdergaat: elke hier vermelde fout is nu goedkoop te vinden en duur om
te ontdekken nadat de poller een week heeft gedraaid.

Zie [Linux op een Windows-host](/nl/guides/install-on-windows/) en [FreeBSD](/nl/guides/install-on-freebsd/) voor hostspecifieke vereisten. Deze procedures vormen geen bewijs van een volledige acceptatietest.

## Wat je eerst nodig hebt

Kadupul is een PHP-applicatie die configuratie opslaat in MySQL of MariaDB en
metingen opslaat in RRD-bestanden op schijf. Deze pagina beschrijft een nieuwe installatie
op een hoofdserver vanuit de huidige `main`-broncode, niet een upgrade of de gearchiveerde
LTS-lijn. Er moeten vier zaken aanwezig zijn voordat het systeem kan draaien.

| Component | Waarom het nodig is |
|---|---|
| PHP 8.4 of nieuwer, op een release met beveiligingsondersteuning | Voert de webinterface en de poller uit |
| MySQL of MariaDB | Bevat apparaten, sjablonen, gebruikers en de poller-cache |
| RRDtool | Maakt en werkt de round-robin-archieven bij en rendert grafieken |
| net-snmp | Biedt de clienttools en bibliotheken die worden gebruikt om apparaten te bevragen |

PHP heeft ook de extensies nodig die worden vereist door
[het applicatiemanifest](https://github.com/kadupulhq/kadupul/blob/main/composer.json),
waaronder `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`,
`pcntl`, `posix` en `sqlite3`. Installeer ze voor zowel de opdrachtregel- als de
webomgeving. [Vereisten](/nl/reference/requirements/) maakt onderscheid tussen de
vereisten van Composer en de afzonderlijke controles van het installatieprogramma.

## Stap 1: installeer de runtime

Installeer PHP met de bijbehorende extensies, je databaseserver, RRDtool en net-snmp
vanuit de pakketten van je distributie.

**Controleer het.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` moet de vereiste extensies vermelden. De PHP-extensie `snmp` is optioneel
wanneer de opdrachtregelprogramma's van net-snmp beschikbaar zijn. Composer controleert zijn
eigen vereiste extensies tijdens de installatie van afhankelijkheden; het webinstallatieprogramma
heeft een afzonderlijke extensiecontrole. Een terugvaloptie tijdens runtime heft een
Composer-vereiste niet op.

De PHP-configuraties voor de opdrachtregel en de webserver kunnen verschillen. Controleer beide.
Het installatieprogramma beveelt een `memory_limit` van minimaal 400M en een
`max_execution_time` van minimaal 60 seconden aan; het accepteert ook onbeperkte
waarden (respectievelijk `-1` en `0`). Waarden onder deze aanbevelingen leveren
waarschuwingen op, terwijl een ontbrekende `date.timezone` een fout is. Stel een expliciete tijdzone
in, zoals `UTC`, en gebruik `php --ini` om de configuratie van de opdrachtregel te achterhalen.

## Stap 2: maak de database en bijbehorende gebruiker aan

Maak één lege database aan en één gebruiker met rechten voor die database. Voer voor een
lokale database deze SQL uit als databasebeheerder en vervang het voorbeeldwachtwoord
vóór gebruik:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Gebruik de overeenkomende host voor het database-account als PHP vanaf een andere machine verbinding maakt.

De databaseserver moet ook zijn tijdzonetabellen gevuld hebben, en de Kadupul-gebruiker
heeft leestoegang daartoe nodig in de `mysql`-database. Dat is het enige toegangsrecht
buiten het eigen schema. Niets aan een monitoringsysteem doet dit vermoeden, en het is
niet optioneel; de onderstaande controle mislukt zonder dit recht.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Controleer het.** Meld je aan als de Kadupul-databasegebruiker en voer uit:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Een aantal groter dan nul zonder toestemmingsfout is wat je wilt. Nul betekent dat de
tabellen nooit zijn geladen; een fout betekent dat de gebruiker ze niet kan lezen. Beide
stoppen het installatieprogramma.

Vier van de eigen instellingen van de server zijn belangrijk genoeg om nu te corrigeren.

| Instelling | Gewenst | Waarom |
|---|---|---|
| `max_allowed_packet` | 16M of meer | Grote synchronisaties tussen de hoofdserver en externe collectors |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Apparaatbeschrijvingen bevatten multibyte-tekens |
| `innodb_file_per_table` | On | Houdt tabelruimten gescheiden en beheersbaar |
| `innodb_buffer_pool_size` | Ongeveer een kwart van het systeemgeheugen | Houdt de actieve werkset in het geheugen |

Het installatieprogramma rapporteert zijn eigen meting hiervan en markeert wat tekortschiet,
zodat je de tabel niet op vertrouwen hoeft aan te nemen. [Database-prestaties
optimaliseren](/nl/guides/tune-database-performance/) gaat verder zodra er belasting is.

## Stap 3: uitpakken, eigendomsrechten herstellen en serveren

Plaats de applicatie ergens waar je webserver deze kan aanbieden, en bepaal vervolgens
welke systeemgebruiker er eigenaar van is. Die beslissing is belangrijker dan de locatie. Twee
processen schrijven hier: de webserver en het proces dat de poller inplant. Voer beide uit
als dezelfde gebruiker. Voer de poller zonder verhoogde rechten uit en geef beide processen
de toegang die ze nodig hebben. Onjuist eigenaarschap of onjuiste modi kunnen latere updates
verhinderen, zelfs wanneer grafieken gewoon renderen.

### Als je de repository hebt gekloond in plaats van een release uit te pakken

Een Git-checkout heeft zowel PHP-afhankelijkheden als gegenereerde browser-assets nodig. Voer
vanuit de hoofdmap van de repository het volgende uit nadat de runtimes uit de `mise.toml`
van de repository zijn geïnstalleerd:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer vult `include/vendor/` en herstelt vastgezette compatibiliteitsbestanden.
De npm-build maakt assets aan onder `include/js/`, `include/fa/` en
`include/vendor/flag-icons/`. Composer alleen is niet voldoende voor een installatie vanuit broncode.

Een afhankelijkheidscomplete offline bundel is een afzonderlijk build-artefact. Een generiek
GitHub-broncodearchief is niet die bundel. Volg de
[procedure voor offline bouwen en verifiëren](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation)
wanneer de doelhost geen internettoegang heeft.

Bereid de beschrijfbare paden voor na het installeren van afhankelijkheden:

| Groep | Mappen | Beschrijfbaar wanneer |
|---|---|---|
| Tijdens installatie | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Alleen tijdens installeren of upgraden |
| Tijdens installatie | `include/vendor/csrf/`, of de geconfigureerde locatie van `path_csrf_secret` | Het installatieprogramma moet het installatiespecifieke geheim aanmaken; bewaar het daarna |
| Altijd | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, de tijdelijke systeemmap | Voor de gehele levensduur van de installatie |
| Symfony-runtime | `var/cache`, en `var/log` als bestandsregistratie is geconfigureerd | Voor de PHP-runtime en de cache-warming-gebruiker |

De RRD-map moet ook gedurende de hele levensduur van de installatie beschrijfbaar zijn. Deze
bevat je geschiedenis, dus besteed er dezelfde zorg aan als aan een databasemap.

De huidige migratie heeft nog verouderde routes nodig voor aanmelden, installatieprogramma en
plug-ins. Serveer voor deze gecombineerde installatie de hoofdmap van de repository met
expliciete regels die toegang weigeren tot privémappen, configuratie, afhankelijkheden en
runtimestatus. Schakel niet de volledige installatie om naar `public/`: dat zou verouderde routes
verwijderen die nog in gebruik zijn. Het afzonderlijke eindpunt van Symfony heeft een andere
routering; zie [de migratie-instructies](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Ga voor Nginx uit van de
[Nginx-locatieregels](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf)
van de repository en pas de root en de PHP-FPM upstream aan. Houd weigeringsregels vóór de
generieke PHP-afhandeling en behoud PATH_INFO voor `/app.php/...`. Nginx leest `.htaccess` niet.
Houd RRD-bestanden, logboeken en geheimen ontoegankelijk via HTTP; controleer de feitelijke
serverconfiguratie in plaats van aan te nemen dat bestandsrechten weergave voorkomen.

**Controleer het.** Word de poller-gebruiker, schrijf een bestand in elke map van de altijd-groep
en verwijder het vervolgens. Een permissie die er in `ls -l` goed uitziet, kan nog steeds worden
geweigerd door SELinux of AppArmor, en het schrijven van het bestand is de enige controle die
dat dekt. Vraag vervolgens een bestand onder de logmap op via HTTP. Je wilt een weigering zien.

## Stap 4: schrijf het configuratiebestand

Kopieer voor een nieuwe installatie het meegeleverde configuratiebestand:

```bash
cp include/config.php.dist include/config.php
```

Overschrijf niet de configuratie van een bestaande installatie. Stel de databasehost, naam,
gebruiker en wachtwoord uit stap 2 in. Twee andere waarden zijn belangrijk bij een eerste installatie:
`url_path`, het pad waaronder de applicatie wordt aangeboden met beginnende en afsluitende
slashes, en `poller_id`, wat `1` is op een hoofdserver en alleen op een externe collector een
andere waarde heeft.

Laat het blok voor externe collectors uitgecommentarieerd. Je bouwt er nu nog geen;
[Externe gegevensverzameling](/nl/concepts/remote-data-collection/) behandelt dit wanneer je dat wel doet.
Elke andere instelling heeft een werkende standaardwaarde, dus lees
[Configuratie](/nl/reference/configuration/) voordat je er iets aan wijzigt.

Configureer een implementatiespecifieke `APP_SECRET` in de PHP-procesomgeving voor
Symfony-functies die hiervan gebruikmaken. De bootstrap gebruikt standaard `APP_ENV=prod` en
`APP_DEBUG=0` en laadt geen `.env`-bestanden. Dit staat los van het CSRF-geheim van het
verouderde installatieprogramma.

**Controleer het.** Controleer de syntaxis zonder inloggegevens weer te geven:

```bash
php -l include/config.php
```

Importeer het schema in de volgende stap voordat je het installatieprogramma in een browser opent.

## Stap 5: importeer het schema

Het installatieprogramma verwacht dat de tabellen al bestaan. Laad het meegeleverde schema in
de database die je hebt aangemaakt:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Doe dit eenmalig, op een lege database. Dit is geen upgradescript; het importeren ervan in een reeds
gevulde database kan mislukken of conflicterende en onvolledige gegevens achterlaten.

## Stap 6: voer het installatieprogramma uit

Open de site in een browser en doorloop de stappen. Het installatieprogramma volgt een vaste
volgorde, en elke stap geeft toegang tot de volgende:

1. Welkom en licentie.
2. Afhankelijkheidscontrole: PHP-versie en extensies, de PHP-instellingen uit stap 1 voor zowel
   de opdrachtregel als de webserver, de tijdzonetabellen en de database-instellingen uit stap 2.
   Fouten blokkeren de knop volgende. Waarschuwingen doen dat niet, maar lees ze wel.
3. Installatietype: een nieuwe hoofdserver of een externe collector.
4. Permissiecontrole: de mappen uit stap 3, getest door erin te schrijven.
5. Locaties van binaire bestanden: de paden naar PHP, RRDtool en de net-snmp-tools.
6. Gegevensbronprofiel en startinterval.
7. Sjabloonselectie: welke apparaatsjablonen moeten worden geladen.
8. Tabelconversie, bevestiging en de installatie zelf.

Item 6 in die lijst is het onderdeel dat moeilijk ongedaan te maken is. Het profiel dat je kiest,
bepaalt de stapgrootte en de archiefset die worden weggeschreven naar elk RRD-bestand dat daarna wordt
aangemaakt, en het bewerken van het profiel migreert bestaande bestanden niet. Wijzigingen in retentie
vereisen een afzonderlijke, geteste migratie; ze vereisen niet altijd het weggooien van de geschiedenis.
Als pieken belangrijk zijn, zorg er dan voor dat het profiel maxima bewaart en niet alleen gemiddelden:
lees [Gegevensbronnen en round-robin-archieven](/nl/concepts/data-sources-and-rras/) voordat je er
voorbij klikt. Het startinterval dat daar wordt aangeboden is één minuut of vijf minuten. Het
gegevensbronprofiel stelt het verzamelinterval in; de starter en het profiel moeten consistent
worden geconfigureerd.

## Stap 7: wijzig de standaard inloggegevens

Het meegeleverde schema initialiseert een beheerdersaccount met de naam `admin` en het wachtwoord
`admin`, zodanig gemarkeerd dat bij de eerste aanmelding een wijziging wordt afgedwongen. Het
bevat ook een uitgeschakeld gastaccount. Wijzig het wachtwoord voordat de instantie voor anderen
bereikbaar is, wat betekent voordat je deze verbindt met een netwerk waarnaar anderen kunnen routeren.

## Stap 8: plan de poller in

De poller moet van buitenaf worden gestart. Configureer het verzamelinterval en het startinterval
consistent; de poller ondersteunt startintervallen van één minuut of vijf minuten en heeft een
beveiliging tegen reguliere runs die te vroeg binnenkomen. Installeer voor een startinterval van
één minuut deze regel in de crontab van de poller-gebruiker zonder verhoogde rechten, waarbij je
`php` en het applicatiepad vervangt door hun absolute paden:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

of voer de meegeleverde `cactid.php`-daemon uit met behulp van `service/cactid.service`, aangepast
voor je installatiepad en niet-bevoegde gebruiker. Gebruik één startmechanisme: schakel de
cronjob of timer uit wanneer je de daemon gebruikt.

Laat de feitelijke planning overeenkomen met het geconfigureerde startinterval. Voor
verzamelprofielen korter dan een minuut voert de gestarte poller verzamelcycli uit binnen dat
interval; probeer niet een frequentie van minder dan een minuut uit te drukken met deze cron-regel.

**Controleer het.** Voer handmatig één cyclus uit als de poller-gebruiker:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` slaat de timingbeveiliging voor vroegtijdige uitvoering over. Gebruik deze handmatige
controle terwijl de planner is gestopt, zodat deze niet samenvalt met een geplande run. Het omzeilt
geen andere onderhouds- of veiligheidscontroles. Je wilt een nette afronding zien met een
overzichtsregel. Schakel vervolgens de planner in en laat deze twee intervallen met rust; bevestig
dat er zonder jouw tussenkomst nog een run heeft plaatsgevonden.

## Wat er mis kan gaan

Dit zijn de fouten waar een eerste installatie daadwerkelijk tegenaan loopt.

| Symptoom | Oorzaak | Waar te kijken |
|---|---|---|
| Installatieprogramma blokkeert op PHP-instellingen die correct lijken | De webserver en de opdrachtregel lezen verschillende `php.ini`-bestanden | `php --ini`, en het bestand dat de web-SAPI rapporteert |
| Installatieprogramma blokkeert op tijdzones | Tijdzonetabellen niet geladen, of de Kadupul-gebruiker kan ze niet lezen | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Permissiestap mislukt op een map die beschrijfbaar lijkt | Verkeerde eigenaar, of SELinux en AppArmor | Schrijf een bestand als de poller-gebruiker |
| Installatie voltooid, er komen nooit gegevens binnen | Poller nooit ingepland | Voer `poller.php --force --debug` handmatig uit |
| Gegevens gedurende enkele cycli, daarna niets meer | Poller draait als de verkeerde gebruiker en laat bestanden achter die de webgebruiker niet kan bijwerken | Eigenaar van de bestanden in de RRD-map |
| Grafieken vol kleine hiaten | Gepland interval en geconfigureerd interval komen niet overeen | De crontab, vergeleken met het geconfigureerde interval |
| Composer weigert installatie | PHP is lager dan 8.4 of een door het manifest vereiste extensie ontbreekt | `php -v`, `php -m`, en de foutuitvoer van Composer |
| Poller kan niet meer dan één proces uitvoeren | `pcntl` of `posix` ontbreekt | `php -m` |

[Logregistratie](/nl/reference/logging/) beschrijft waar elk onderdeel gegevens vastlegt.
[Problemen met ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/) behandelt het geval
waarin de installatie in orde is en één apparaat niet functioneert.

## Voordat je het openstelt

De poller draait als een systeemgebruiker en voert RRDtool en je verzamelscripts uit. Behandel de
installatie als iets dat opdrachten uitvoert, want dat is wat het doet.

- Bied het aan via TLS.
- Laat het standaard beheerderswachtwoord niet staan, zelfs niet voor even.
- Beperk de databasegebruiker tot de eigen database.
- Houd de RRD- en logmappen buiten de documentroot.
- Laat het gastaccount uitgeschakeld tenzij je expliciet anders beslist.

[Een installatie met internettoegang beveiligen](/nl/guides/secure-an-internet-facing-install/)
behandelt de rest. Volgende stap: [Het eerste apparaat toevoegen](/nl/start/first-device/).
