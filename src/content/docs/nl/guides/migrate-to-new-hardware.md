---
title: Migreren naar nieuwe hardware
description: Een draaiende installatie verplaatsen naar een andere server zonder verlies van geschiedenis, in de volgorde die elke stap controleerbaar houdt.
banner:
  content: Kadupul bevindt zich in pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van revisie door een moedertaalspreker.
sidebar:
  order: 20
---

:::caution[Overgenomen RRDtool-proxygedrag]
De inzet van de RRDtool-proxy wordt niet ondersteund in Kadupul. Gebruik lokale RRDtool-opslag
(`storage_location = 0`). Proxy-instellingen, protocolbeschrijvingen en werkstromen
op deze pagina documenteren overgenomen gedrag, geen ondersteunde implementatie of
migratiepad. Zie [RRDtool-proxy](/nl/reference/rrdproxy/).
:::

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat
u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Een migratie is een hersteloperatie op een machine die verschilt van de machine waarvan de back-up
afkomstig is. Alles in [Back-up en herstel](/nl/guides/back-up-and-restore/) is hier van toepassing;
deze pagina behandelt alleen wat er verschilt omdat de bestemming niet de bron is.

Drie zaken verschillen, en elk heeft zijn eigen foutmodus.

| Verschil | Wat erdoor defect raakt |
|---|---|
| Verschillende paden | Opgeslagen bestandspaden in de database en in de poller-cache |
| Verschillende gebruikers- en groeps-ID's | Bestandstoegang en opslagvertrouwenscontroles kunnen mislukken |
| Verschillende runtime-versies | Extensies, databasegedrag en RRD-compatibiliteit kunnen verschillen |

## Voordat u iets aanraakt

Bouw eerst het doelsysteem op en breng het op het punt waar een nieuwe installatie zou werken:
databaseserver draait, vereiste PHP-extensies aanwezig, RRDtool aanwezig, de geselecteerde collector
beschikbaar en de webserver geconfigureerd. Houd de poller, geplande taken, externe replicatie en
uitgaande meldingen uitgeschakeld. Voer het installatieprogramma niet uit. U gaat de database
vervangen, en een half geïnstalleerd schema is moeilijker te diagnosticeren dan een leeg schema.

Zorg dat de applicatierevisie en afhankelijkheden exact overeenkomen, inclusief lokale wijzigingen
en plugins. De databasetabel `version` legt de schemaversie vast, niet elke broncodewijziging;
alleen die waarde laten overeenkomen is onvoldoende. Een omleiding naar het installatieprogramma kan
wijzen op een schema-afwijking of een onvolledig herstel. Installeer dezelfde code die u verlaat,
migreer, bevestig de werking en voer upgrades daarna uit als een afzonderlijke exercitie volgens
[Veilig upgraden](/nl/guides/upgrade-safely/).

Beslis nu over het installatiepad. Door dit op beide machines identiek te houden, vervalt het
grootste deel van het onderstaande werk. Als dit niet mogelijk is, lees dan het padengedeelte
voordat u begint.

## Volgorde van handelingen

Elke stap controleert de voorgaande stap, wijzig de volgorde ervan dus niet.

1. **Stop alle producenten op de bron en de bestemming.** Stop geplande, externe, web-geactiveerde en handmatige verzameling en onderhoud; laat actieve rondes afronden. Voer uitgestelde schrijfacties pas door nadat de producenten zijn gestopt. Behoud niet-bevestigde wachtrijrijen met de bijbehorende database- en RRD-back-up; wis ze niet.
2. **Maak de back-up.** Database, RRD-structuur, configuratie, gezamenlijk vastgelegd. De consistentiewetsregels in [Back-up en herstel](/nl/guides/back-up-and-restore/) vormen de kern van de zaak.
3. **Verplaats de RRD-structuur.** Zie hieronder hoe u dit doet.
4. **Verplaats de database.**
5. **Verplaats de code, de configuratie en alles waarnaar de configuratie verwijst.** Dat omvat `plugins/`, `scripts/`, `resource/` en elk lokaal bestand dat door een gegevensinvoermethode wordt aangeroepen.
6. **Pas de configuratie van de bestemming opnieuw toe na het definitieve herstel.** Corrigeer paden, database-eindpunten, eigendomsrechten van diensten en numerieke opslagvertrouwensinstellingen.
7. **Bouw de poller-cache opnieuw op.**
8. **Voer opslagcontroles uit onder elk serviceaccount en start de verzameling pas daarna uitsluitend op de bestemming.** Let op representatieve bestanden en de diepte van achtergebleven wachtrijen.

## De RRD-structuur overbrengen

Een RRD-bestand is een binair bestand met een interne indeling die afhangt van de manier waarop het is
geschreven. Een binaire kopie vereist een compatibele architectuur en een compatibel RRDtool-formaat;
overeenkomende besturingssysteemnamen of woordbreedtes alleen zijn geen bewijs. Incompatibiliteit kan
leiden tot leesfouten. Valideer gekopieerde bestanden met behulp van de RRDtool van de bestemming.

Als u er niet zeker van bent dat beide overeenkomen, converteer dan in plaats van te kopiëren. De eigen
dump- en herstelopdrachten van RRDtool produceren een overdraagbare tekstvorm; Kadupul gebruikt intern
hetzelfde paar wanneer het een archief moet herschrijven.

Gebruik op de bron, met gestopte schrijvers, een nieuwe afgeschermde staging-map:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Draag het voltooide XML-bestand veilig over. Herstel het op de bestemming naar een nieuw kandidaatbestand:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Herhaal dit voor elk bestand dat conversie vereist en controleer de exitstatus van elk commando.
Installeer geen gedeeltelijke dumps of niet-gecontroleerde kandidaten. RRDtool documenteert XML
als het [architectuuroverdrachtsformaat](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Controleer dit voordat u kiest voor het tijdrovende pad. Kopieer één bestand, voer er op de bestemming
`rrdtool info` op uit en vergelijk de stapgrootte, archieven, tijdstempel van de laatste update en
namen van gegevensbronnen. Vergelijk ook de `fetch`-resultaten over een bekend gevuld interval.
Herhaal dit voor representatieve archiefindelingen voordat u de gehele structuur overbrengt, en controleer
vervolgens de volledige bestandsinventaris. Zie [RRD-herstel](/nl/guides/recover-a-corrupted-rrd/) voor
kandidaatvalidatie en eigendomsvereisten.

Op welke manier u ze ook overbrengt, behoud de mapstructuur exact. Genestelde submappen onder de
RRA-map zijn geen versiering; het pad van elk bestand wordt vastgelegd per gegevensbron, en een
afgevlakte boomstructuur maakt elk daarvan defect.

## De database

Een dump en een import. Twee zaken om te controleren aan de overkant.

Inspecteer tekensets, collaties en opslag-engines van herstelde tabellen, niet alleen serverstandaarden.
Behoud brondefinities en controleer vóór de cutover de compatibiliteit met de databasversie van de bestemming.

**Collectorwachtrijen zijn geen wegwerpcaches.** De huidige `poller_output`-wachtrij moet InnoDB
gebruiken. De opslag-preflight weigert een MEMORY-wachtrij. Behoud de rijen ervan en de boost- en
realtime-wachtrijen totdat metingen zijn bevestigd; een RRD-back-up bevat die metingen mogelijk nog niet.
Ga er niet vanuit dat een herstelde MEMORY-tabel leeg is: een logische dump kan inserts bevatten die
deze opnieuw vullen.

Met gestopte schrijvers en behouden back-ups kan een overgenomen niet-InnoDB-wachtrij expliciet worden geconverteerd:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Voer de opslagcontrole uit onder elk daadwerkelijk web- en poller-account. Het controleert lokale
opslagtoegang en de geselecteerde wachtrij; succes als root bewijst de servicetoegang niet. Online externe
collectors richten zich normaal gesproken op de hoofdwachtrij; gebruik `--local` alleen wanneer u met
opzet hun lokale wachtrij controleert. Andere runtime-/cachetabellen vereisen een expliciet behouds- of
herbouwplan. Zie [opslagvereisten](/nl/reference/requirements/).

## Paden aan de overkant

Hier gaan migraties vaak fout, omdat het meeste hiervan onzichtbaar blijft tot de eerste verzamelronde.

**Het RRA-pad.** Standaard gegevensbronpaden gebruiken het token `<path_rra>`. In deze revisie leidt
bootstrap `$config['rra_path']` af van de applicatiemap plus `/rra`; het is geen algemene
database-instelling voor het selecteren van een willekeurige lokale map. Bevestig het effectieve pad
voordat u bestanden verplaatst. Absolute aangepaste paden moeten afzonderlijk worden gecontroleerd en
gecorrigeerd. Behoud geneste mapstructuren.

**De poller-cache bevat absolute paden.** Wanneer de cache wordt opgebouwd, wordt het token uitgebreid
en wordt het volledige pad in de cacherij geschreven. Wijzigt u de RRA-map, dan wijst de cache nog steeds
naar de oude map. De poller blijft draaien en schrijft niets dat u kunt vinden. Bouw deze opnieuw op.

```sh
php cli/rebuild_poller_cache.php
```

**Instellingen die paden bevatten.** Elk van deze is opgeslagen in de database, dus elk item arriveert
van de oude machine wijzend naar de configuratie van de oude machine. Controleer ze allemaal vóór de
eerste ronde: het RRDtool-binaire bestand, het binaire bestand van de collector en het bijbehorende
configuratiebestand, het binaire PHP-bestand, de SNMP-hulpprogramma's, de logpaden, het standaardlettertype
en de back-upmap voor piekverwijdering. Bekijk ook paden en omgevingswaarden in configuratiebestanden,
service-units, geplande taken en de webserver.

**Gegevensinvoermethoden bevatten opdrachtregels.** Ze gebruiken een token voor de installatiemap,
dus een verhuizing die de structuur behoudt, vereist niets. Een verhuizing die deze wijzigt, vereist dat
elk item wordt gecontroleerd. Hetzelfde geldt voor de bron-XML-bestanden achter gegevensquery's.

**Externe verzamelaars hebben hun eigen configuratiebestand**, met hun eigen database-inloggegevens
en hun eigen verzamelaar-ID. Ze bevinden zich niet in de centrale dump. Als de centrale database is
verhuisd, werk dan de relevante eindpunten bij en valideer de verbinding van elke verzamelaar. Volledige
replicatie is een afzonderlijke bewerking, die alleen op de hoofdverzamelaar wordt uitgevoerd wanneer
ingeschakelde externe verzamelaars zijn geconfigureerd:

```sh
php cli/poller_replicate.php
```

Zonder een ingeschakelde externe verzamelaar sluit deze opdracht af met een fout. Voeg dit niet toe
aan een migratie met één collector als een vereiste succescontrole. Valideer externe configuratie en
replicatie voordat u toestaat dat externe verzameling wordt hervat.

## Eigendomsrechten en machtigingen

De poller schrijft RRD-bestanden als het account dat deze uitvoert. De webinterface leest ze als het
account van de webserver. Een kopie die numerieke ID's behield tussen machines met verschillende
`/etc/passwd`-vermeldingen levert bestanden op die eigendom zijn van het verkeerde account.

Grafieken die stoppen op het migratietijdstip kunnen wijzen op machtigingen, verouderde paden,
ontbrekende verzameling, tijdstempels of geweigerde metingen. Inspecteer de poller-logboeken en behouden
wachtrijen voordat u een herstelmethode kiest; de grafiek alleen identificeert niet de oorzaak.

Controleer het eigendom van de RRA-map zelf en van de geneste submappen, niet alleen van een voorbeeldbestand.
Nieuwe bestanden worden tijdens de verzameling in die mappen aangemaakt, dus een map waarin de poller
niet kan schrijven faalt voor gegevensbronnen die op het migratietijdstip nog niet bestonden, zelfs als
de bestaande bestanden in orde zijn. Koppel `rrd_maintenance_trusted_uids` en `rrd_maintenance_trusted_gids`
in `include/config.php` opnieuw aan de werkelijke numerieke identiteiten van de bestemming en controleer
vertrouwde bovenliggende mappen. Zie [opslagvereisten](/nl/reference/requirements/).

## Omschakeling met minimaal verlies

Een RRD weigert updates op of vóór het tijdstempel van de laatste update. Dit beperkt het opnieuw
afspelen; het bewijst niet dat elke migratie metingen moet verliezen. De omvang van de leegte hangt
af van samplingtijden, downtime en welke in de wachtrij geplaatste metingen zijn behouden. Deze procedure
gebruikt één verzamelingseigenaar en voegt onafhankelijk verzamelde repetitiegeschiedenis niet samen in
de definitieve archiefset.

1. Voer vooraf een volledige repetitie uit met een back-up van de vorige dag. Kopieer alles, corrigeer elk pad en test updates op geïsoleerde testapparaten met meldingen uitgeschakeld. Leg de bestemmingswijzigingen vast als een herhaalbare procedure. Stop repetitieschrijvers wanneer het testen is voltooid.
2. Houd de repetitie geïsoleerd. Vervang de database en RRD's ervan door de definitieve overeenkomende back-up; meng geen repetitierijen of in de wachtrij geplaatste metingen in dat herstel.
3. Stop voor de omschakeling de bronproducenten en leeg of bewaar openstaande metingen, en leg vervolgens de definitieve back-up vast en draag deze over. Pas bestemmings-overrides opnieuw toe: het herstellen van de database brengt bronpaden terug in `settings`, en het herstellen van configuratiebestanden kan ook repetitie-eindpunten en vertrouwensinstellingen vervangen.
4. Bouw de poller-cache opnieuw op, voer de opslagcontroles uit, verifieer de bestandsinventaris en schakel verzameling op de bestemming pas in nadat die controles zijn geslaagd.

Meet de duur van de repetitie en houd rekening met tijd voor validatie en rollback. Houd de bron
gestopt totdat de omschakeling slaagt of een gecontroleerde rollback deze opnieuw als verzamelingseigenaar selecteert.

## Verifieer in deze volgorde

1. De webinterface laadt zonder omleiding naar het installatieprogramma. Onderzoek code-/schema-afwijkingen, databaseconnectiviteit of onvolledig herstel als er een omleiding plaatsvindt.
2. Een testapparaat reageert op een nieuwe verzamelpoging; een herstelde "up"-status alleen kan verouderd zijn.
3. De tijd van de laatste update van een RRD-bestand schuift op na de eerste verzamelronde. Controleer het bestand op schijf, niet de grafiek.
4. Een grafiek getekend over het afgelopen uur toont een lijn, geen leegte.

Als stap 3 mislukt, inspecteer dan paden, machtigingen, opslag-preflight, wachtrijdiepte en RRDtool-fouten.
Als stap 4 mislukt, inspecteer dan behouden waarden, grafiekdefinities, het geselecteerde tijdsbereik en
toegang voor het webaccount. Eén geslaagd bestand verifieert niet elk apparaat, elke gegevensinvoermethode
of elke externe verzamelaar.

## Valkuilen

**Voer niet beide installaties uit op dezelfde RRD-structuur.** Twee pollers die naar dezelfde bestanden
schrijven, produceren geweigerde updates en gaten, geen samengevoegde gegevens.

**Herstel geen oudere RRD-structuur over een nieuwere database.** De bestanden vullen zich niet met
terugwerkende kracht. Verzameling wordt hervat op het huidige tijdstip en het interval tussen beide
blijft een permanent gat.

**De back-up bevat apparaatinloggegevens in platte tekst.** Verhuizen naar andere hardware betekent dat
die inloggegevens over een netwerk reizen en op twee machines staan. Beperk de toegang tot de back-up
en versleutel de overdracht. Behoud de beschermde rollback-kopie totdat acceptatie en het retentiebeleid
buitenbedrijfstelling toestaan; verwijder deze niet tijdens de omschakeling.

**Plugintabellen staan in de database; plugincode niet.** Het herstellen van de database zonder
overeenkomende plugincode en afhankelijkheden kan pluginpagina's, hooks of taken beschadigen.
Controleer elke vereiste plugin expliciet.

**Bestaande proxy-opslag valt buiten deze migratieprocedure.** Proxy-inzet wordt niet ondersteund.
Lokaliseer de daadwerkelijke RRD-bestanden en maak er een back-up van, en valideer vervolgens een
afzonderlijke migratie naar lokale opslag op een geïsoleerde kopie. Een lokale map `rra/` bevat
mogelijk alleen restanten.

**Stel de oude machine als laatste buiten bedrijf, en niet op dezelfde dag.** Laat deze uitgeschakeld
of met alle producenten uitgeschakeld, en bewaar de bijbehorende back-up totdat de vereiste verzamel-,
grafiek-, externe en plugincontroles van het nieuwe systeem slagen. Bepaal de observatieperiode op basis
van de werklasten en het rollbackbeleid; één kortste archiefcyclus is geen bewijs dat elk subsysteem werkt.
