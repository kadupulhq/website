---
title: "Vereisten"
description: "Vereisten voor uitvoering, opslag en implementatie voor de planning van 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
---

Gecontroleerd op 26 oktober 2026 aan de hand van de onderstaande applicatierevisie. Deze basis dient voor de planning van 2026–2027 en is geen toezegging over releases of ondersteuning.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Uitvoeringsomgeving

`main` vereist PHP 8.4 of nieuwer en combineert Symfony 7.4 met bestaande toegangspunten. Voor `lts/1.2` gelden afzonderlijke vereisten. Installeer MySQL of MariaDB, RRDtool en een PHP-collector of compatibele Spine-build. Gebruik bij broncodebuilds de versies uit `mise.toml` via `mise exec`; installeer de vastgelegde afhankelijkheden zonder ze bij te werken.

## PHP

Het manifest vereist naast PHP deze extensies:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Het installatieprogramma controleert afzonderlijk onder meer `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` en `zlib`. Op Unix controleert het `posix` en CLI-`pcntl`; op Windows `com_dotnet`. Een geslaagde installatiecontrole bewijst niet dat aan de Composer-vereisten is voldaan. Controleer CLI- en web-PHP afzonderlijk. Stel `date.timezone` in; het installatieprogramma adviseert `memory_limit=400M` en `max_execution_time=60`, of onbeperkte waarden. De optionele extensie `snmp` maakt query’s binnen het proces mogelijk; `gettext` schakelt vertaalcatalogi in.

## Database

Gebruik een door de leverancier onderhouden MySQL- of MariaDB-versie en valideer deze met de doelrevisie. Oude installatiegrenzen voor MySQL 5.6 en MariaDB 10.0 bewijzen geen ondersteuning voor 2026–2027. Op `main` gebruiken `poller_output`, `poller_output_boost` en `poller_output_realtime` InnoDB; sommige coördinatietabellen gebruiken nog MEMORY. Zet niet alle tabellen om naar dezelfde engine. Vul `mysql.time_zone_name` en geef het applicatieaccount SELECT-toegang tot die tabel.

## RRDtool

Configureer het absolute pad naar het uitvoerbare bestand en laat de ingestelde versie overeenkomen met de geïnstalleerde versie. `DCOUNTER` en `DDERIVE` vereisen RRDtool 1.5 of nieuwer. Lokale Unix-opslag vereist POSIX-identiteitscontroles en werkende `flock` op mappen. Stop externe schrijfprocessen en cachedaemons vóór exclusief onderhoud. Het bestaande proxypad is aanwezig, maar garandeert geen gevalideerde implementatie.

## net-snmp

Installeer de Net-SNMP-hulpmiddelen als PHP `snmp` ontbreekt of is uitgeschakeld. Stel `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` en `path_snmptrap` in op de bijbehorende uitvoerbare bestanden. Test het gekozen pad met de SNMP-versie van het apparaat, indien van toepassing ook SNMPv3 via IPv6; het bestaande installatieprogramma raadt PHP `snmp` voor die combinatie af.

## Webserver

Voer PHP uit via de ingestelde webomgeving en gebruik TLS. Behoud bestaande routes naast `/app.php/...`; wijzig niet de volledige documentroot naar `public/` zolang bestaande pagina’s nodig blijven. Configureer PATH_INFO voor het compatibiliteitstoegangspunt. Nginx negeert `.htaccess`; blokkeer broncode, configuratie, afhankelijkheden, hulpmiddelen, tests, geheimen en uitvoeringsstatus met expliciete regels vóór PHP-verwerking. Laat het URL-voorvoegsel overeenkomen met `$url_path`.

## Taakplanning

Gebruik één startmechanisme: cron, Taakplanner of de meegeleverde collectordaemonservice. Stem de frequentie af op het ingestelde startinterval. Verzameling met tussenpozen van minder dan een minuut vindt binnen dat interval plaats; cron alleen biedt die frequentie niet. Voer controles uit als het polleraccount en stop het normale startmechanisme om overlap te voorkomen.

## Bestandssysteem

Geef alleen noodzakelijke accounts toegang tot de effectieve RRD-paden, logboeken, caches en Symfony-uitvoeringsmappen. De standaard RRD-map is `rra/`. Afzonderlijke Unix-web-/polleraccounts vereisen expliciete numerieke ID’s in `rrd_maintenance_trusted_uids` en voor schrijfbare groepen in `rrd_maintenance_trusted_gids` in `include/config.php`. Elk lid van die groepen moet worden vertrouwd. Normale toegangsrechten blijven gelden; opslag die voor iedereen schrijfbaar is wordt geweigerd. Gebruik voor alle schrijfprocessen dezelfde vertrouwensinstellingen en controleer beide accounts vóór een upgrade.

## Rechten

Voer het webproces en de poller uit met eigen accounts zonder verhoogde rechten. Raw ICMP vereist aanvullende besturingssysteemrechten; gebruik anders TCP-, UDP- of SNMP-controles. Voer niet de hele applicatie als root uit om ping mogelijk te maken. Windows mist de ACL-validatie voor destructief onderhoud van lokale RRD’s; gewone updates gebruiken synchrone RRDtool-bevestigingen. Unix-doorvoermetingen valideren geen Windows-capaciteit.

## Over de PHP-versie

Voor de planning van 2026–2027 krijgt PHP 8.4 actief onderhoud tot en met 31 december 2026 en beveiligingscorrecties tot en met 31 december 2028. PHP 8.5 krijgt actief onderhoud tot en met 31 december 2027 en beveiligingscorrecties tot en met 31 december 2029. Dit zijn datums van het PHP-project, geen Kadupul-compatibiliteitsmatrix. Test nieuwe uitvoeringsomgevingen met vastgelegde afhankelijkheden vóór ingebruikname. De lagere PHP-minimumversie van Symfony verlaagt Kadupuls minimum van 8.4 niet. Controleer vóór implementatie opnieuw de officiële schema’s en de doelrevisie.

[Databaseafstemming](/nl/guides/tune-database-performance/) · [RRDtool-integratie](/nl/reference/rrdtool-integration/) · [SNMP](/nl/reference/snmp/) · [Bestandsindeling](/nl/reference/file-layout/) · [Installatie](/nl/start/install/) · [Voorwaarden voor opslagupgrades](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Ondersteunde PHP-versies](https://www.php.net/supported-versions.php)
