---
title: "Back-up en herstel"
description: "Drie onderdelen moeten samen worden vastgelegd anders is de back-up incompleet, en de herstelvolgorde doet ertoe."
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
sidebar:
  order: 7
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat je
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Een complete herstelset van Kadupul bestaat uit drie delen. Gedeeltelijke back-ups kunnen de
configuratie of metingen herstellen, maar kunnen niet de hele installatie reproduceren.

| Deel | Wat het bevat | Waar het zich bevindt |
|---|---|---|
| Database | Apparaten, sjablonen, gebruikers, machtigingen, de poller-cache en het pad van elk RRD-bestand | MySQL of MariaDB |
| RRD-bestanden | Bewaarde metingen en geconsolideerde archieven | De RRA-map, standaard `rra/` onder de installatie |
| Configuratie | Database-inloggegevens, paden, collectorconfiguratie, plugin- en scriptcode | `include/config.php`, het spine-configuratiebestand, `plugins/`, `scripts/`, `resource/` |

## Wat een back-up van alleen de database kan herstellen

De database bevat grafiekdefinities en monitoringconfiguratie, terwijl RRD-bestanden
de historische grafiekarchieven bevatten. Met Boost ingeschakeld kunnen recente metingen
ook in databasewachtrijen blijven staan totdat ze naar bestanden worden weggeschreven. Bewaar die
wachtrijen als onderdeel van de databaseback-up. Zie [Architectuur](/nl/concepts/architecture/).

Herstel alleen de database en je krijgt een systeem dat vierhonderd apparaten kent,
waarvan elke grafiek is gedefinieerd en elke grafiek leeg wordt getekend. Het verzamelen
begint opnieuw vanaf het moment dat je de poller start, en de geschiedenis is verdwenen.

## Wat er ontbreekt aan een back-up van alleen RRD's

Een RRD-bestand bevat benoemde gegevensbronnen, archiefdefinities en waarden, maar niet
de volledige Kadupul-metagegevens over apparaten, query's, grafieken en machtigingen die
nodig zijn om die waarden weer aan de applicatie te koppelen.

De toewijzing van "bytes in op poort 3 van switch 12" naar een pad op schijf bevindt zich
in de database, in een kolom van de gegevensbron. Herstel alleen de mappenstructuur en
je hebt enkele duizenden bestanden vol getallen, zonder enige mogelijkheid om te achterhalen
wat wat is, behalve door ze handmatig te ontleden.

De twee vormen samen één back-up. Behandel ze ook zo.

## Consistentie tussen beide

Dit is waar de meeste back-upprocedures stilletjes de mist in gaan.

De poller schrijft continu naar RRD-bestanden. Een bestand dat wordt gekopieerd terwijl er een
bijwerking plaatsvindt, kan halverwege het schrijven worden vastgelegd. Tegelijkertijd wordt
er naar de database geschreven. Als je om 02:00 uur een database-dump maakt en om 02:20 uur
begint met het kopiëren van bestanden, beschrijven de twee helften verschillende momenten, en
elke gegevensbron die daartussen is aangemaakt of verwijderd, vormt een discrepantie.

Uitgestelde RRD-schrijfacties maken het nog ingewikkelder en interessanter. In die modus
schrijft de poller RRD-bestanden niet bij elke doorgang. Resultaten stapelen zich op in een
duurzame databasetabel en worden later in bulk weggeschreven. De database kan dus legitiem
tot aan het flush-interval voorlopen op de RRD-bestanden, met echte metingen die nergens
anders op schijf staan.

Kies een van de volgende opties, in afnemende volgorde van voorkeur:

**Gecoördineerde snapshot.** Gebruik de door de database-engine ondersteunde back-up- of
quiesce-procedure en stem deze af op snapshots van alle RRD-opslag en de applicatieconfiguratie.
Een bestandssysteemsnapshot alleen levert geen consistentie op over afzonderlijke volumes,
externe collectors, wachtrijen of een actieve database heen.

**Gepauzeerde logische back-up.** Schakel geplande starters en andere producenten uit, wacht
tot reeds actieve collectors klaar zijn, leeg vervolgens uitgestelde schrijfbewerkingen en
wacht op de flush-workers. Houd configuratiewijzigingen, onderhoud en andere RRD-schrijvers
gedurende het hele opnameproces gestopt. Onderbrekingen in de gegevensverzameling kunnen
leiden tot ontbrekende metingen; de zichtbaarheid daarvan hangt af van heartbeat en consolidatie.

Voer voor het uitvoeren van het voorbeeld deze quiesce-stappen uit en controleer de status
van wachtrijen en workers. Dat `poller_boost.php --force` de waarde nul retourneert, is op
zichzelf geen bewijs van een volledige flush: een reeds geregistreerd Boost-proces kan ervoor
zorgen dat het script wordt afgesloten zonder het werk te doen. Coördineer eventuele
rrdcached-services of externe opslag afzonderlijk.

Dit Bash-voorbeeld gaat uit van lokale opslag, een database-account geconfigureerd in een
privé-optiebestand voor de client, en een RRA-map die alle beheerde RRD's bevat. Vervang elk
pad. Breng aangepaste absolute RRD-paden, symlink-doelen, externe configuratie en externe
collectors in kaart en leg deze ook afzonderlijk vast.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

Het applicatiearchief bevat configuratie en bijbehorende code. Noteer de broncoderevisie,
database- en RRDtool-versies, werkelijke opslagpaden en de afsluit-/flushstatus van schrijvers
bij de set. Het voorbeeld sluit reguliere logboeken, cache en Git-metagegevens uit; controleer
deze uitsluitingen voor jouw installatie.

Alleen een succesvol vastgelegde en van controlesommen voorziene set krijgt de definitieve
mapnaam. Een mislukt commando kan nog steeds een onvolledig bestand achterlaten in `.partial-*`;
`set -e` stopt volgende commando's, maar verwijdert niet de reeds gemaakte uitvoer. Promoveer
die map niet naar een voltooide back-up. Controlesommen detecteren latere wijzigingen, niet
de logische volledigheid; een hersteltest blijft noodzakelijk.

`--single-transaction` dekt transactionele tabellen af, maar biedt geen consistente snapshot van
niet-transactionele plugintabellen of gelijktijdige schemawijzigingen. Houd schrijvers en
schemawijzigingen gestopt, of gebruik een voor de engine geschikte back-upmethode. Hervat
de gegevensverzameling pas nadat is bevestigd dat het vastleggen is voltooid en de opslag
bruikbaar is. Zie de [mysqldump-documentatie](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
voor transactie- en bevoegdheidsvereisten. De weglatingen van het eerdere recept worden bijgehouden
in [website #12](https://github.com/kadupulhq/website/issues/12).

**Accepteer het tijdsverschil en leg het vast.** Welk deel je ook het eerst vastlegt, het is het
oudere deel, en geen van beide volgordes maakt een actief paar uit zichzelf consistent. Schrijf
het tijdsvenster op; dat is wat het resultaat herstelbaar maakt.

Maak je eerst een dump van de database en kopieer je de bestanden als tweede, dan zijn de bestanden
nieuwer. Een gegevensbron die binnen het venster wordt verwijderd, staat nog steeds in de dump maar
het bestand is weg, waardoor een verwijzing overblijft die de poller opnieuw zal aanmaken. Een
gegevensbron die binnen het venster wordt aangemaakt, verschijnt als een bestand dat de database
niet kent, en blijft inactief.

Kopieer je eerst de bestanden en maak je daarna een dump van de database, dan is de database nieuwer.
Een gegevensbron die binnen het venster wordt aangemaakt, bevindt zich in de dump zonder bijbehorend
bestand, dat de poller leeg opnieuw aanmaakt.

Beide volgordes kunnen geschiedenis van vóór het venster verliezen als een benodigd bestand wordt
verwijderd voordat het wordt gekopieerd. Het kan ook een gedeeltelijk geschreven bestand of
inconsistente wachtrijmetingen vastleggen. Het vastleggen van het tijdsverschil documenteert een
beperking; het maakt een inconsistent paar niet compleet en garandeert geen herstelbaarheid.

## Wat er in de back-up zit waar je niet aan gedacht hebt

Inloggegevens van apparaten staan in platte tekst in de database. De poller-cache bevat
SNMP-community-strings en SNMPv3-gebruikersnamen, wachtwoorden en wachtwoordzinnen als gewone
kolommen, omdat de collector ze bij elke doorgang nodig heeft. Het configuratiebestand
bevat het databasewachtwoord.

Een Kadupul-back-up is daarom een kluis met inloggegevens voor elk apparaat dat je bewaakt.
Versleutel deze in rust, beperk wie deze kan lezen en plaats deze niet op een algemene
bestandsshare.

## Herstelvolgorde

De volgorde doet ertoe omdat elke stap afhankelijk is van de voorgaande stap.

1. **Herstel eerst de configuratie.** Zonder database-inloggegevens en het RRA-pad kan
   niets anders worden gecontroleerd. Als het herstel op andere hardware plaatsvindt,
   corrigeer de paden dan nu in plaats van achteraf.

2. **Herstel de RRD-structuur.** Plaats deze waar de configuratie aangeeft dat deze hoort.
   Controleer eigenaarschap en bestandsmodus: de poller schrijft deze bestanden als de poller-gebruiker,
   en de webinterface leest ze als de webserver-gebruiker. Een herstel dat de inhoud wel bewaart
   maar het eigenaarschap niet, levert een systeem op dat grafieken prima tekent maar niets verzamelt.

3. **Herstel de database.** De versietabel in de dump moet overeenkomen met de code waarnaar
   je herstelt. Houd alle starters en schrijvers uitgeschakeld totdat de herstelde componenten
   samen zijn gecontroleerd. Een dump van een oudere release die wordt hersteld op nieuwere code,
   stuurt de webinterface door naar het installatieprogramma; dat is correct gedrag, maar niet
   wat je wilt midden in een herstelproces. Herstel eerst de bijbehorende code.

4. **Bouw de poller-cache opnieuw op.** De cache is afgeleid, en een herstel is precies de
   situatie waarin deze verouderd kan zijn. Opnieuw opbouwen kost één run en neemt een hele
   categorie verwarrende symptomen weg.

5. **Start de poller en controleer vervolgens één bestand.** Bevestig dat het tijdstip van de
   laatste bijwerking van een RRD-bestand verschuift na de eerste run. Als de grafieken zijn gevuld
   tot het herstelpunt en daarna vlak blijven, inspecteer dan verzamelresultaten, wachtrijen,
   tijdstempels, paden en machtigingen. Een vlakke grafiek alleen wijst de oorzaak niet aan.

## Valkuilen

**RRD-bestanden weigeren updates in het verleden.** Een RRD-bestand accepteert geen meting op
of vóór het tijdstempel dat het al bevat. Het herstellen van een oudere set bestanden tegenover
een nieuwere database vult verloren metingen niet vanzelf aan. Behouden uitgestelde wachtrijen
of andere bronnen kunnen herstelbare metingen bevatten, maar het opnieuw afspelen vereist
afzonderlijke validatie en chronologische ordening. Zonder die metingen hervat de verzameling
met een onderbreking. Dit is ook de reden waarom je twee back-ups niet kunt samenvoegen door
bestanden ertussen te kopiëren.

**Controleer of opgeslagen paden getokeniseerd zijn voordat je iets herschrijft.**
Gegenereerde gegevensbronnen slaan het pad op als `<path_rra>/name.rrd`, en het token wordt
tijdens het lezen geëxpandeerd vanuit de RRD-padinstelling. Voor die bronnen betekent het
verplaatsen van de installatie dat de instelling moet worden gewijzigd en de poller-cache
opnieuw moet worden opgebouwd, niet dat rijen moeten worden herschreven. Paden die handmatig
zijn ingevoerd, worden letterlijk opgeslagen en moeten wel worden herschreven. Controleer dit
voordat je een update over de tabel uitvoert, want het herschrijven van getokeniseerde paden
naar absolute paden is de verandering die de volgende verhuizing moeilijker maakt.

**Externe collectors hebben hun eigen configuratiebestand.** Elk daarvan bevat zijn eigen
database-inloggegevens en collector-id. Ze zitten niet in de centrale databaseback-up. Leg
ze per host vast.

**Plugingegevens bevinden zich in dezelfde database.** Plugins maken hun eigen tabellen aan
tijdens de installatie, dus een volledige databasedump dekt ze af. Plugincode staat niet in
de database. Als je de database herstelt zonder de bijbehorende map `plugins/`, schakelt
de installatie uit wat niet kan worden gevonden.

**Een back-up die je niet hebt hersteld, is een hypothese.** Herstel volgens een schema naar
een testinstantie. De fout die hiermee het vaakst aan het licht komt, is geen corruptie;
het is een back-up die altijd maar één van de drie onderdelen heeft vastgelegd.
