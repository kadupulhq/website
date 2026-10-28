---
title: Een Linux-server monitoren
description: Grafieken maken van CPU, geheugen, schijf en belasting op een Linux-host via net-snmp, wat snmpd moet blootstellen en hoe u een script gebruikt wanneer SNMP niet volstaat.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 3
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Een Linux-host met net-snmp biedt u het meeste van wat u wilt zonder code te schrijven. Het werk zit in het configureren van `snmpd` om de juiste deelbomen bloot te stellen en te weten naar welke van de twee overlappende schijf-MIB's u kijkt.

## Wat snmpd moet blootstellen

Kadupul leest vier gebieden uit. Wijs de deelbomen die nodig zijn voor de geselecteerde grafieken toe aan de monitoringidentiteit; niet elke implementatie heeft elke deelboom nodig.

| Gebied | Deelboom | Biedt |
|---|---|---|
| Systeem | `.1.3.6.1.2.1.1` | Beschrijving, uptime, contact, naam, locatie |
| Interfaces | `.1.3.6.1.2.1.2` en `.1.3.6.1.2.1.31` | Verkeer, fouten, status |
| Hostbronnen | `.1.3.6.1.2.1.25` | Processen, ingelogde gebruikers, opslag, processors |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Belastingsgemiddelde, geheugen, CPU-tijd, schijf-I/O, gedeclareerde partities |

Verschillende distributies leveren een standaard `snmpd.conf` die alleen toegang geeft tot de systeemdeelboom. Het apparaat antwoordt dan wel, meldt een systeembeschrijving, maar verzamelt niets. Die combinatie is de meest voorkomende eerste fout op een Linux-host en ziet er identiek uit aan een sjabloonprobleem.

Verifieer vereiste gebieden vanaf de pollerhost met behulp van dezelfde SNMP-identiteit die op het apparaat is geconfigureerd. Deze voorbeelden gebruiken een illustratieve community; vervang deze door de geconfigureerde waarde. Numerieke OID's voorkomen dat lokale symbolische MIB-definities nodig zijn.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Als alleen het eerste commando werkt, inspecteer dan de exacte respons: een beperkte weergave, niet-beschikbare agentmodule, een andere SNMP-context of een lege tabel kan het resultaat verklaren. Controleer de agentconfiguratie en toegang voordat u het Kadupul-sjabloon wijzigt.

## Het apparaat toevoegen

Het meegeleverde pakket `install/templates/NetSNMP_Device.xml.gz` bevat het Net-SNMP-apparaatsjabloon en de bijbehorende afhankelijkheden. Importeer dit als het sjabloon niet beschikbaar is en selecteer het vervolgens bij het toevoegen van het apparaat. Bevestig query-indexen en maak expliciet de gewenste grafieken aan; het kiezen van een apparaatsjabloon bewijst niet dat het verzamelen werkt. Zie [Sjablonen importeren](/nl/guides/import-and-export-templates/) en [Uw eerste grafiek](/nl/start/first-graph/).

## Wat u krijgt zonder gegevensquery

Deze gegevenssjablonen met vaste OID's zijn in het pakket inbegrepen. Een grafiek kan er meerdere combineren; beschikbaarheid hangt af van de doelagent. Ze vereisen geen indexdetectie.

| Grafiek | OID | Opgeslagen als |
|---|---|---|
| Belastingsgemiddelde, 1 minuut | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Belastingsgemiddelde, 5 minuten | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Belastingsgemiddelde, 15 minuten | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Geheugen totaal | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Geheugen vrij | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Geheugenbuffers | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Geheugencache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU-gebruiker | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU-systeem | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU-inactief | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupts | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Contextwisselingen | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processen | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Ingelogde gebruikers | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

De geheugenobjecten zijn in kilobytes. De meegeleverde geheugengrafiek past een conversie toe zodat de as in bytes leest. Als u uw eigen grafiek bouwt op basis van deze OID's, bent u zelf verantwoordelijk voor die conversie.

De vermelde CPU-objecten zijn verouderde percentagemeters, geen cumulatieve CPU-tijdtellers. Ga er niet van uit dat deze drie alleen elke CPU-status dekken. Net-SNMP markeert ze als verouderd ten gunste van ruwe tellers; ruwe tellers vereisen passende snelheids- en percentageberekeningen. Zie de [UCD-SNMP MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Wat een gegevensquery vereist

| Query | Detecteert | Ondersteund door |
|---|---|---|
| SNMP - Gekoppelde partities ophalen | Alles wat de agent als opslag beschouwt | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Gemonitorde partities ophalen | Alleen partities gedeclareerd in `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Processorinformatie ophalen | Eén invoer per CPU | Hostbronnen processorbelasting |
| Net-SNMP - Apparaat-I/O ophalen | Blokapparaten | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Interfacestatistieken | Netwerkinterfaces | `IF-MIB` |

### Welke schijfquery te gebruiken

Het zijn geen twee weergaven van dezelfde gegevens.

De Host Resources-query doorloopt alles wat de agent als opslag rapporteert. Op de meeste Linux-hosts omvat dat fysiek geheugen, swap, tmpfs-koppelingen en de echte bestandssystemen in één lijst. Formaten worden gerapporteerd in toewijzingseenheden, en de query leest de eenheidsgrootte als een apart veld zodat de grafiek kan vermenigvuldigen. U krijgt alles zonder configuratie, maar ook een lange lijst met vermeldingen die u niet wilt.

De net-snmp-query leest de UCD-schijftabel, gevuld door `disk`-instructies of `includeAllDisks`. Kies expliciete partities of brede detectie; dit zijn verschillende beleidslijnen.

```
disk /      10%
disk /var   10%
```

Als alternatief vult `includeAllDisks 10%` schijven die worden gevonden wanneer de agent start. De waarde 10% configureert een drempelwaarde voor vrije ruimte; het is geen selectiefilter en configureert op zichzelf geen Kadupul-waarschuwingen. Herlaad of herstart de agent en verifieer vervolgens de indexen. Zie [snmpd-configuratie](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Geef de voorkeur aan de Host Resources-query wanneer u volledige dekking wilt en handmatig opschoont. Kies voor net-snmp met expliciete `disk`-vermeldingen voor een beheerste lijst. `includeAllDisks` verbreedt die lijst; controleer indexen opnieuw na herstarts van de agent.

### Interfaces

De interfacegegevensquery op een server gedraagt zich hetzelfde als op een switch, met één verschil: `ifDescr` op Linux is de naam van de kernelinterface, die na een herstart of driverupdate kan veranderen. Zie [Een switch monitoren](/nl/guides/monitor-a-switch/) voor indexkeuze.

## Wanneer SNMP niet volstaat

Sommige zaken hebben geen bruikbare MIB. Een wachtrijdiepte, een applicatieteller of een getal in een bestand vereisen een scriptinvoer.

Twee feiten bepalen hoe u het script schrijft.

**Het script draait op de machine waar de poller draait, niet op de gemonitorde host.** Het bereiken van het doel is de taak van uw script: SSH, een HTTP-aanroep, een agent of wat u al gebruikt.

**De poller leest de standaarduitvoer en niets anders.** De exitstatus wordt niet geraadpleegd.

Het uitvoercontract:

| Uitvoer | Betekenis |
|---|---|
| `42` of `3.7` | Een enkele waarde voor een enkele gegevensbron |
| `U` | Geen waarde deze cyclus, geregistreerd als onbekend |
| `in:1420 out:980` | Meerdere waarden, één per gegevensbron |

Voor de meervoudige vorm worden paren gescheiden door enkele spaties en wordt de naam gescheiden van de waarde door een dubbele punt. De parser telt scheidingstekens af tegen spaties, dus extra spaties kunnen validatiefouten veroorzaken. De PHP-poller trimt spaties aan het einde. Geef het canonieke formaat met één spatie weer en stuur diagnostiek weg van stdout.

Interne RRD-gegevensbronnamen die door de sjabloonbewerker worden geaccepteerd, komen overeen met `[a-zA-Z0-9_]{1,19}`; koppeltekens worden daar niet geaccepteerd. Scriptuitvoerlabels moeten overeenkomen met hun invoerveldnamen en toewijzen aan de beoogde interne items. De hele uitvoerregel wordt opgeslagen in een kolom van 512 tekens. Zie [Verzamelscripts](/nl/guides/write-a-data-collection-script/) voor het geteste PHP-pollercontract.

Retourneer `U` in plaats van `0` wanneer u iets niet kunt meten. Nul is een meting en wordt als zodanig in de grafiek weergegeven. Zie [Gegevensbronnen en archieven](/nl/concepts/data-sources-and-rras/) voor waarom beide gescheiden blijven.

### Scriptserver

Een standaard script wordt eenmaal per gegevensbron per interval uitgevoerd. Voor een script geschreven in PHP roept de scriptserver-vorm een functie aan in een langdurig afzonderlijk PHP-proces, wat opstartoverhead vermindert.

### De whitelist-valkuil

Als een gegevensinvoer-whitelistbestand in gebruik is, vergelijkt de poller de opdrachtregel van elke gegevensinvoer met de geregistreerde regel. Een gewijzigde opdrachtregel zonder dat de whitelist opnieuw is gegenereerd, stopt met het produceren van poller-cache-items, en de gegevensbron stopt stilzwijgend zonder foutmelding op de grafiek. Het logboek meldt dit, de interface niet.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Vervang `42` door de ID van de gecontroleerde gegevensinvoermethode, niet door een apparaat-ID. Bijwerken zonder `--id` accepteert huidige opdrachtregels in de hele invoerinventaris. Controleer wijzigingen vooraf. Controleer na het bijwerken de bronactivering en effectieve poller-cache-items.

## Foutmodi

| Symptoom | Meest voorkomende oorzaak |
|---|---|
| Systeembeschrijving wordt gelezen, verder wordt niets verzameld | `snmpd`-weergave beperkt tot de systeemdeelboom |
| Net-SNMP-partitiequery vindt geen indexen | Geen `disk`- of `includeAllDisks`-regels in `snmpd.conf` |
| Host Resources-partities bevatten RAM en tmpfs | Verwacht; de agent rapporteert ze als opslag |
| Geheugengrafiek wijkt af met een factor 1024 | Gebouwd op de ruwe OID's zonder de conversie |
| Script retourneert waarde op de opdrachtregel, poller registreert unknown | Verschil in uitvoer/toewijzing, interne scheidingsfouten of ongeldige interne naam |
| Script werkt handmatig, faalt vanuit de poller | Het draait als de poller-gebruiker, met diens omgeving en rechten |
