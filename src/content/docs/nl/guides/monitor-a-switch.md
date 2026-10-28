---
title: Een switch monitoren
description: Ontdek de poorten van een switch, breng de juiste tellers in kaart en kies een index zodat de poortgeschiedenis na een kaartvervanging aan de poort gekoppeld blijft.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 2
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Een switch is het klassieke scenario waarvoor gegevensquery's bestaan. U weet van tevoren niet hoeveel poorten er zijn, het aantal kan wijzigen en elke poort heeft een eigen gegevensbron nodig. Zie [Sjablonen](/nl/concepts/templates/) voor de werking van gegevensquery's; deze pagina behandelt de juiste configuratie.

## Voordat u begint

Bevestig dat het apparaat reageert vanaf de toegewezen collector, bij voorkeur als de poller-gebruiker. Gebruik uw geconfigureerde alleen-lezen inloggegevens. Numerieke OID's vermijden afhankelijkheid van lokaal geïnstalleerde MIB-namen.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Gebruik SNMP v2c of v3. De 64-bit interfacetellers zijn SMIv2-objecten en kunnen niet via v1 worden opgehaald. Een v1-apparaat geeft u alleen 32-bit tellers en verder niets.

## Een apparaatsjabloon kiezen

Het apparaatsjabloon bepaalt welke gegevensquery's en grafieksjablonen worden aangeboden wanneer u het apparaat toevoegt. Kadupul erft de sjabloonset die Cacti meelevert, inclusief een algemeen SNMP-apparaatsjabloon en verschillende leverancierspecifieke sjablonen.

Poortdetectie komt ongeacht uw keuze uit dezelfde bron: de interfacegegevensquery, gedefinieerd in `resource/snmp_queries/interface.xml`. Als geen enkel sjabloon bij uw hardware past, kiest u het generieke sjabloon en koppelt u de interfacequery daaraan.

## De gegevensquery uitvoeren

De query doorloopt `ifIndex` om de poorten te vinden en leest `ifNumber` om te weten hoeveel er verwacht worden. Vervolgens verzamelt deze een set velden per poort.

| Veld | OID | Gebruikt voor |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | De positie in de SNMP-tabel |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Korte poortnaam, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Langere beschrijving |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | De door u geconfigureerde interfacebeschrijving |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Poort-MAC-adres |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Snelheid in bit/s, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Snelheid in Mbit/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up of Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | 32-bit bytetellers |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | 64-bit bytetellers |

Voer de query eenmaal uit voor het apparaat. Het retourneert een tabel met ontdekte poorten. Lees die tabel voordat u grafieken maakt; het vormt het fundament voor de onderstaande beslissingen.

## Kies de 64-bit tellers

De interfacequery biedt verschillende verkeersgrafieksjablonen. De belangrijkste:

| Grafieksjabloon | Leest |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Hetzelfde, met een 95e-percentiellijn |
| In/Out Bits (64-bit, BW) | Hetzelfde, afgezet tegen interfacesnelheid |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Kies een 64-bit sjabloon tenzij u een specifieke reden hebt om dat niet te doen. Een 32-bit octetteller reikt tot 4294967295. Een gigabit-poort op volle capaciteit vult die in ongeveer 34 seconden. Bij een stap van 300 seconden kan de poller één omloop niet onderscheiden van zeven, en `COUNTER` corrigeert slechts één omloop tussen metingen. De grafiek oogt niet chaotisch, maar toont permanent te lage waarden.

Controleer of de tellers daadwerkelijk gevuld zijn voordat u honderden grafieken aanmaakt.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Een lege of mislukte walk vereist onderzoek: controleer de foutmelding, toegangsrechten en agentondersteuning.

## Controleer het opgeslagen maximum na snelheidsveranderingen

Wanneer de gegevensbron een maximum gebruikt op basis van querysnelheid, bepaalt de aanmaak de snelheid op basis van gecachete detectiegegevens. `ifHighSpeed` heeft de voorkeur, `ifSpeed` wordt gebruikt als deze ontbreekt, en een geconfigureerde standaardwaarde geldt als beide nul zijn.

Die waarde wordt in het bestand geschreven. Een poort die op 100 Mbit is ontdekt en later sneller onderhandelt, kan een plafond behouden dat onder het werkelijke verkeer ligt, en RRDtool registreert snelheden boven dat plafond als onbekend. Vergelijk de gecachete snelheid, gegevensbrondefinitie en het daadwerkelijke bestand met `rrdtool info`.

## De indexbeslissing

Hier gaat bij fouten historische data verloren.

Elke gegevensbron registreert twee zaken over zijn poort: welk veld hem identificeert (het indextype) en de waarde van dat veld. Bij elke herindexering wordt de poort opnieuw gevonden door te vragen welke SNMP-index momenteel die waarde in dat veld draagt. De gegevensbron volgt de waarde, niet de tabelpositie.

De vraag is dus welk veld de waarde draagt.

De interfacequery hanteert een voorkeursvolgorde: `ifName`, dan `ifDescr`, dan `ifHwAddr`, dan `ifIndex`. Kadupul kiest normaal gesproken uit kandidaten met voldoende unieke waarden zonder duplicaten.

| Veld | Overleeft | Faalt wanneer |
|---|---|---|
| `ifName` | Herstarts, kaartvervanging, hernummering | De agent laat het leeg of herhaalt het over stackleden |
| `ifDescr` | Meestal stabiel op switch-hardware | Op servers een kernelnaam die kan wijzigen |
| `ifHwAddr` | Herstarts | Een vervangen kaart heeft nieuwe MAC's, wat juist de situatie was waartegen u zich wilde beschermen |
| `ifIndex` | Niets betrouwbaars | Kaartwissel, herstart of firmwarewijziging hernummert de tabel |

Als de query terugvalt op `ifIndex`, behandel dat dan als een bevinding. Uw poortgeschiedenis is dan gekoppeld aan een nummer dat de switch vrij opnieuw kan toewijzen.

## Herindexeringsmethode

Wordt per apparaat en per gegevensquery ingesteld. Het bepaalt wanneer Kadupul de indexvelden opnieuw uitleest.

| Methode | Activeert bij | Kosten |
|---|---|---|
| None | Niets; alleen handmatig of per script | Geen |
| Uptime | Achteruitgaande SNMP-uptime van het apparaat | Eén vergelijking per cyclus |
| Index Count | Verandering in het aantal gedetecteerde indexen | Eén telling per cyclus |
| Verify All | Falen van een gecachete identiteitscontrole | Controleert bekende indexen tijdens polling |

Uptime is de standaard en past bij de meeste switches, omdat een herstart het moment is waarop indexen hernummeren. Index Count vangt toegevoegde of verwijderde kaarten zonder herstart op. Verify All kan gewijzigde identiteiten detecteren, maar garandeert niet de ontdekking van nieuwe poorten.

Om een geselecteerd apparaat en query opnieuw uit te voeren, vervangt u beide ID's door de geïnstalleerde ID's. Laat `--qid` weg om alle query's voor dat apparaat uit te voeren:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` verbreedt de uitvoering naar alle ingeschakelde apparaten. Vermijd overlappende runs. `--force` omzeilt procesregistratie en vernieuwt titelcaches.

## Wanneer een poort verdwijnt

Ga er niet van uit dat een ontbrekende poort automatisch de verzameling stopt. De huidige herindexeringscode kan een orphan-vlag resetten en de oude polling-OID's behouden wanneer een identiteit onopgelost is en geen enkele bron van index verandert. Vergelijk de opgeslagen identiteit met de nieuwe detectiecache en schakel een getroffen bron uit totdat de toewijzing is geverifieerd. Zie [Gegevensquery's en indexen](/nl/concepts/data-queries-and-indexes/).

## Grote chassis

Twee instellingen per apparaat zijn belangrijk zodra poortaantallen hoog worden: controleer de geconfigureerde OID's per SNMP-verzoek en het aantal threads per apparaat. Batchondersteuning en effectieve gelijktijdigheid hangen af van collector en agent; PHP `cmd.php` en Spine bieden geen identiek gedrag.

Wijzig één instelling tegelijk en houd de pollerlooptijd in de gaten.

## Foutmodi

| Symptoom | Oorzaak |
|---|---|
| Grafieken aangemaakt, elke meting onbekend | 64-bit tellers niet geïmplementeerd, of apparaat staat op SNMP v1 |
| Tellers springen naar absurde waarden | 32-bit teller loopt vaker dan eens per interval om |
| Alleen gaten bij hoge belasting | RRD-maximum gefixeerd op een verouderde gedetecteerde snelheid |
| Poortgeschiedenis na onderhoud gekoppeld aan de verkeerde poort | Onstabiele identiteit, verouderde toewijzing of onopgeloste orphan-afhandeling |
| Poller logt waarschuwing over ongeldige SNMP-indexen | Gegevensbronnen achtergelaten zonder index; herindexeer, verwijder of schakel ze uit |
| Poorten gedetecteerd, niets wordt verzameld | Gegevensbronnen met een lege index produceren geen poller-cache-items |
