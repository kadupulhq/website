---
title: Een Windows-host monitoren
description: Grafieken maken van CPU, schijven, interfaces en uptime op Windows via de SNMP-service, welke Host Resources-objecten de gegevens bevatten en wat te doen wanneer SNMP geen optie is.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 14
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Windows via SNMP biedt interfaces, processors, opslag en enkele tellers. De ingebouwde Microsoft-agent levert niet de belasting-, geheugen- en schijfobjecten van de Net-SNMP UCD-sjablonen. Geheugen kan nog steeds worden weergegeven via opslagrijen wanneer de agent deze toont. Externe agenten kunnen andere objecten tonen; controleer de daadwerkelijke agent voordat u sjablonen kiest.

## Wat de SNMP-service blootstelt

De Windows SNMP-service is verouderd en optioneel. Voor Windows 10 en 11 documenteert Microsoft installatie via Optionele onderdelen of Windows-mogelijkheden; een verouderde DISM-functienaamfout bewijst niet dat deze niet beschikbaar is. Controleer de instructies voor uw Windows-editie. Zie [Microsofts SNMP-installatiehandleiding](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Controleer welke van deze deelbomen uw geïnstalleerde agent toont:

| Gebied | Deelboom | Biedt |
|---|---|---|
| Systeem | `.1.3.6.1.2.1.1` | Beschrijving, uptime, contact, naam, locatie |
| Interfaces | `.1.3.6.1.2.1.2` en `.1.3.6.1.2.1.31` | Verkeer, fouten, status |
| Hostbronnen | `.1.3.6.1.2.1.25` | Processors, opslag, aantal processen, ingelogde gebruikers |
| LAN Manager | `.1.3.6.1.4.1.77` | Windows-service- en sharegegevens |

Kadupul's meegeleverde Windows-sjablonen lezen de eerste drie gebieden. Niets in de meegeleverde set leest de LAN Manager-deelboom.

Twee configuratie-items op de host bepalen of u gegevens ontvangt: de communitytekenreeks en de lijst met managers waarvan de agent pakketten accepteert. Een host die is ingesteld om SNMP van één manageradres te accepteren, reageert alleen op die manager en negeert alle andere verzoeken.

Verifieer elk gebied vanaf de pollerhost voordat u grafieken bouwt. Vervang de voorbeeldhost en community door uw geconfigureerde waarden; `public` is ter illustratie.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

De tweede walk leest processorbelasting, de derde de lijst met opslagbeschrijvingen. Als het eerste commando werkt en de andere twee niets opleveren, controleer dan toegangsbeperkingen, agentondersteuning en de geretourneerde SNMP-fout.

## Het apparaat toevoegen

Importeer `install/templates/Windows_Device.xml.gz` als de sjablonen ontbreken, volgens [Sjablonen importeren en exporteren](/nl/guides/import-and-export-templates/). Selecteer het Windows-apparaatsjabloon, verifieer querydetectie en maak vervolgens expliciet de gewenste grafieken aan. Het pakket bevat drie gegevensquery's en de bijbehorende grafieksjablonen.

| Gegevensquery | Ondersteund door | Leest |
|---|---|---|
| SNMP - Interfacestatistieken | `resource/snmp_queries/interface.xml` | `IF-MIB`, direct doorlopen |
| SNMP - Processorinformatie ophalen | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` via `scripts/ss_host_cpu.php` |
| SNMP - Gekoppelde partities ophalen | `resource/script_server/host_disk.xml` | `hrStorageTable` via `scripts/ss_host_disk.php` |

De schijf- en processorquery's zijn scriptserverquery's ondanks hun naam. Ze draaien in een afzonderlijk, langdurig PHP-scriptserverproces en voeren SNMP-aanroepen uit met de inloggegevens van het apparaatrecord. De interfacequery is een gewone SNMP-query. Het praktische gevolg is dat een defecte PHP-scriptserver de schijf- en CPU-verzameling op Windows stopt, terwijl interfacegrafieken blijven doorgaan.

## Wat u krijgt zonder gegevensquery

Twee grafieksjablonen lezen elk één vaste OID uit.

| Grafiek | OID | Opgeslagen als |
|---|---|---|
| Host MIB - Processen | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Host MIB - Ingelogde gebruikers | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Twee andere lezen helemaal niets van het apparaat. De uptime- en pollingtijdgrafieken roepen `scripts/ss_hstats.php` aan en retourneren een kolom uit Kadupuls eigen apparaatrecord: `snmp_sysUpTimeInstance` voor uptime, de geregistreerde pollingduur voor pollingtijd. Ze lezen opgeslagen metingen, geen verse SNMP-respons.

## De Host Resources-tabellen

### Processors

`hrProcessorLoad`, op `.1.3.6.1.2.1.25.3.3.1.2`, retourneert één vermelding per logische processor die door de agent wordt getoond. De walk levert de indexen; ga er niet van uit dat het aantal rijen altijd gelijk is aan het geadverteerde aantal hardwarethreads.

De waarde is al een percentage. De MIB definieert het als een gemiddelde over de laatste minuut. Zie de [Host Resources MIB-definitie](https://www.rfc-editor.org/rfc/rfc2790.html).

### Opslag

De meegeleverde opslagquery gebruikt `hrStorageTable` op `.1.3.6.1.2.1.25.2.3.1`. Deze leest zes kolommen.

| Kolom | OID | Richting |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Index |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Index en het zichtbare label |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Invoer, de vermenigvuldiger |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Uitvoer |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Uitvoer |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Uitvoer |

Grootte en gebruikt geheugen zijn aantallen toewijzingseenheden, geen bytes. Het script vermenigvuldigt elke waarde met de eenheidsgrootte die voor die index in het cachegeheugen is opgeslagen wanneer beide waarden geldig zijn.

Daaruit volgen twee zaken die op Windows vaak tot problemen leiden.

**De tabel is geen lijst met schijven.** De agent rapporteert wat hij als opslag beschouwt. Afhankelijk van de agent kunnen fysiek en virtueel geheugen naast vaste stations verschijnen. Labels zoals `C:\`, `D:\`, `Physical Memory` en `Virtual Memory` zijn voorbeelden, geen gegarandeerde rijen. Selecteer de rijen die u wilt weergeven.

**Grote of ongeldige opslagwaarden moeten worden gecontroleerd.** De MIB definieert grootte en gebruik als niet-negatieve Integer32-waarden. Een agent die een negatieve waarde retourneert, valt buiten dat bereik. Het huidige script gebruikt `(abs(value) + 2147483647) * allocation_units`, wat geen unsigned 32-bit herinterpretatie is. Behandel beïnvloede metingen als onbetrouwbaar en herindexeer na het herstellen van de detectie. Zie de [opslagconversiefout](https://github.com/kadupulhq/kadupul/issues/243).

## Waar Windows verschilt van Linux

| Onderdeel | Linux met net-snmp | Ingebouwde Windows-agent / meegeleverde sjablonen |
|---|---|---|
| Belastingsgemiddelde | `.1.3.6.1.4.1.2021.10.1.3` | Geen UCD-belastingsgemiddelde-objecten |
| Geheugen | `.1.3.6.1.4.1.2021.4` | Kan worden weergegeven vanuit getoonde `hrStorage`-rijen |
| CPU | UCD-percentages of `hrProcessorLoad` | Alleen `hrProcessorLoad` |
| Schijvenlijst | `dskTable` die u declareert, of `hrStorage` | Alleen `hrStorage`, ongefilterd |
| Schijf-I/O | `diskIOTable` | Niets meegeleverds leest dit |
| Interfacenamen | Kernelnamen, kort | Lange adapterbeschrijvingen, vaak gedupliceerd |

De ingebouwde Microsoft-agent levert de UCD-deelboom `.1.3.6.1.4.1.2021` niet. Zie [Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/).

### Interfaces

De interfacequery is dezelfde als die een switch gebruikt. De volgorde van indexvoorkeur is `ifName`, dan `ifDescr`, dan `ifHwAddr`, dan `ifIndex`. Het selecteert het eerste veld dat aanwezig is op elke gedetecteerde interface en uniek is.

Windows is het platform waar dit het vaakst misgaat. Twee identieke netwerkkaarten kunnen dezelfde `ifDescr` retourneren, en sommige agenten laten `ifName` leeg. Als de query terugvalt op `ifIndex`, is uw interfacegeschiedenis gekoppeld aan een nummer dat Windows vrij opnieuw kan toewijzen.

Zie [Een switch monitoren](/nl/guides/monitor-a-switch/) en [Gegevensquery's en indexen](/nl/concepts/data-queries-and-indexes/).

## Wanneer SNMP niet beschikbaar is

Veel Windows-omgevingen hebben geen actieve SNMP-service. De vervanging is een scriptgegeveninvoer.

Twee feiten bepalen hoe u het script schrijft.

**Het script draait op de machine waar de poller draait.** Het bereiken van de Windows-host is de taak van uw script: WinRM, een agent, een HTTP-eindpunt, een share of wat u al gebruikt.

**Retourneer metingen op standaarduitvoer.** Het externe commandopad van de PHP-poller gebruikt de afsluitstatus niet als meting. Druk een getal af, of `U` voor geen meting deze cyclus. Druk geen `0` af wanneer u bedoelt dat meten is mislukt.

Als u één waarde per interface, schijf of service nodig hebt in plaats van een enkel getal, heeft hetzelfde scriptmechanisme een geïndexeerde vorm. `resource/script_queries/host_cpu.xml` is een praktisch voorbeeld dat een PHP-script aanroept in plaats van de scriptserver.

Zie [Een gegevensverzamelingsscript schrijven](/nl/guides/write-a-data-collection-script/) voor het uitvoercontract en de naamgevingslimieten.

## Foutmodi

| Symptoom | Meest voorkomende oorzaak |
|---|---|
| Systeembeschrijving wordt gelezen, verder wordt niets verzameld | Controleer objectondersteuning, toegangsbeperkingen en de specifieke SNMP-fout |
| Helemaal geen reactie van een host die online is | De lijst met geaccepteerde managers van de agent of een host-firewallregel op UDP 161 |
| Partitielijst bevat geheugen | Verwacht; de agent rapporteert geheugen als opslag |
| Een groot volume toont negatieve of onbekende waarden | Ongeldige agentwaarden of ontbrekende toewijzingseenheden; controleer bekende conversiefout |
| Schijf en CPU stoppen, interfaces gaan door | Fout in scriptserver; de interfacequery gebruikt deze niet |
| Net-snmp-sjablonen gekoppeld, elke meting onbekend | De geselecteerde agent biedt de vereiste UCD-objecten niet aan |
| Interfacegeschiedenis volgt de verkeerde adapter na een wijziging | Index opgelost naar `ifIndex` omdat namen leeg of gedupliceerd waren |
| Uptime herhaalt een oude waarde | Controleer of het apparaatrecord verouderd is; de helper extrapoleert geen uptime |
