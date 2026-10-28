---
title: Een virtualisatiehost monitoren
description: Wat een hypervisor via SNMP vrijgeeft, wat er voor ESXi wordt meegeleverd en waarom het tellen van gasten, CPU en geheugen op een gevirtualiseerde omgeving moeilijker is dan het lijkt.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 27
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop
vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Het meegeleverde ESXi-pakket verzamelt hostmetingen en gastinventaristellingen.
Het biedt geen metingen van CPU, geheugen of resourceschaarste (contention) per gast. Controleer de
objecten die door uw hypervisorversie worden vrijgegeven voordat u grafieken selecteert.

## Wat wordt meegeleverd

Er wordt één hypervisor-apparaatsjabloon meegeleverd: **ESXi Device**. Het is een apparaatpakket, dus
`install/templates/ESXi_Device.xml.gz` bevat de bijbehorende scripts en gegevensquerybestanden.
Volg [Sjablonen importeren en exporteren](/nl/guides/import-and-export-templates/) en verifieer dat de
import is voltooid, inclusief de implementatie van bestanden. Selecteer het apparaatsjabloon,
controleer de detectie en maak expliciet de gewenste grafieken aan; het importeren van het pakket
of het enkel koppelen van een apparaatsjabloon maakt deze niet aan.

| Meegeleverd | Doel |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Detecteert processors en leest de belasting per processor |
| `resource/snmp_queries/esxi_hw.xml` | Detecteert hardwarecomponenten en leest hun status |
| `resource/snmp_queries/interface.xml` | De standaardquery voor interfacestatistieken |
| `resource/script_server/host_disk.xml` | Gekoppelde partities, via de Host Resources-opslagtabel |
| `scripts/ss_esxi_vhosts.php` | Gebundeld in `install/templates/ESXi_Device.xml.gz`; telt gasten, ingeschakelde gasten en status van gasttools |
| `scripts/ss_multicpu_avg.php` | Berekent het gemiddelde van de belasting per processor tot één getal |
| `scripts/ss_hstats.php` | Leest pollingstatistieken die Kadupul al voor het apparaat bijhoudt |
| `scripts/ss_host_disk.php` | Ondersteunt de partitiequery |

Er wordt in deze checkout geen specifiek apparaatpakket meegeleverd voor Hyper-V, KVM/libvirt, Xen of Proxmox.
Generieke Linux-/Windows-sjablonen kunnen hoststatistieken dekken die door hun agents worden ondersteund;
hypervisorspecifieke verzameling vereist geschikte sjablonen en verzamelaars. Zie
[Een script voor gegevensverzameling schrijven](/nl/guides/write-a-data-collection-script/).

## Schakel de agent eerst in

Controleer de bestaande agentconfiguratie en volg de instructies voor uw ESXi-versie.
De pakketnotities vermelden een fabrieksreset; dit is geen routinematige vereiste en
zou de bestaande SNMP-configuratie wissen. Voor een op community gebaseerde configuratie stellen de volgende
opdrachten agentwaarden in; vervang de voorbeelden en behoud eventuele vereiste bestaande
community's bij het instellen van de communitylijst.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

De eerste opdracht toont de configuratie; de laatste schakelt de agent in. De community-optie
vervangt de geconfigureerde lijst. Controleer de vereiste firewalltoegang vanaf de poller
en raadpleeg de [ESXCLI SNMP-opdrachtreferentie](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Deze opdrachten configureren community-gebaseerde polling; ze configureren geen SNMPv3.
Controleer dit vanaf de machine waarop de poller draait voordat u het apparaat toevoegt.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Als de eerste opdracht werkt en de derde niets oplevert, onderzoek dan de SNMP-fout,
het toegangsbeleid en de agentondersteuning; een lege walk alleen identificeert de oorzaak niet. Het
gebundelde gastscript gebruikt SNMPv1, dus een succesvolle v2c-test valideert het
verzamelpad niet. Lege gast-walks leveren tellingen van nul op, niet per se gaten in grafieken;
zie [de bug met lege resultaten](https://github.com/kadupulhq/kadupul/issues/245).

## Wat de host vrijgeeft

| Gebied | Deelboom | Levert |
|---|---|---|
| Processors | `.1.3.6.1.2.1.25.3.3.1` | Belasting voor elke door de agent gerapporteerde processor |
| Hardwarecomponenten | `.1.3.6.1.2.1.25.3.2.1` | Componentindex, beschrijving en status |
| Opslag | `.1.3.6.1.2.1.25.2.3.1` | Datastores en lokale bestandssystemen, zoals de agent ze rapporteert |
| Interfaces | `.1.3.6.1.2.1.2` en `.1.3.6.1.2.1.31` | Verkeer, fouten, status |
| Gastinventaris | `.1.3.6.1.4.1.6876` | Voedingsstatus en status van gasttools per gast |

De eerste vier zijn de standaardtabellen voor Host Resources en interfaces, dezelfde waarmee een
Linux-host antwoordt. Zie [Een Linux-server monitoren](/nl/guides/monitor-a-linux-server/)
voor hoe deze zich gedragen en welke schijftabel de voorkeur heeft.

Het vijfde is de leveranciersdeelboom die wordt gebruikt door het meegeleverde script voor gasttellingen.

## De grafieksjablonen

| Grafiek | Bron | Leest |
|---|---|---|
| ESXi - CPU | Gegevensquery | Belasting voor één gedetecteerde processor |
| ESXi - MultiCPU Average | Script | Gemiddelde van de belasting van alle processors |
| ESXi - Hardware | Gegevensquery | Status van één gedetecteerde component |
| ESXi - VHosts | Script | Aantallen gasten en status van gasttools |
| Host MIB - Processes | Vaste OID | Aantal processen op de host |
| Host MIB - Logged in Users | Vaste OID | Aantal sessies op de host |
| Device - Uptime | Script | Uptime zoals Kadupul deze het laatst heeft geregistreerd |
| Device - Polling Time | Script | Hoe lang Kadupul deed over het pollen van dit apparaat |
| Interfacegrafieken | Gegevensquery | Verkeer, fouten, pakketten, status per interface |

De processorquery leest de belasting per gedetecteerde vermelding. Neem niet aan dat het
aantal rijen overeenkomt met het aantal hardwarethreads van de host: het meegeleverde indexpatroon accepteert alleen
één- of tweecijferige indices en weigert 100 of hoger, zelfs op een host met weinig CPU's.
Vergelijk detectie met een ruwe walk; zie [de CPU-indexbug](https://github.com/kadupulhq/kadupul/issues/246).
Het gemiddelde-script doorloopt de processorbelasting onafhankelijk en berekent het gemiddelde over de geretourneerde rijen.

Device - Uptime en Device - Polling Time lezen het opgeslagen apparaatrecord van Kadupul.
De uptime-helper retourneert de opgeslagen SNMP-uptime zonder verstreken tijd te extrapoleren;
pollingtijd beschrijft het verzamelwerk van Kadupul. Een oude opgeslagen waarde bewijst geen
actuele bereikbaarheid. Als het verzamelen stopt, genereren deze helpers geen nieuwe meetwaarden.

## De telproblemen

Dit is het deel dat virtualisatie anders maakt dan een fysieke server, en niets
hiervan wordt opgelost door een grafieksjabloon.

**Gasten verplaatsen zich.** Een gast die migreert naar een andere host verdwijnt uit de inventaris van de eerste host
en verschijnt op die van de tweede. Onafhankelijk getimede metingen kunnen die gast tijdelijk
dubbel tellen of weglaten. Veranderingen in tellingen alleen bewijzen geen migratie: gebruik
hypervisor-inventarisidentiteiten en -gebeurtenissen om ze te verklaren.

**Middelen worden gedeeld, dus toewijzing per gast is een schatting.** De host rapporteert
de fysieke processorbelasting. Hij rapporteert niet welke gast deze heeft veroorzaakt. Het delen van de host-CPU
door het aantal gasten levert een getal op dat rekenkundig klopt, maar geen enkele nuttige vraag beantwoordt.

**Overcommit maakt toewijzing en gebruik verschillende grootheden.** Toegewezen virtuele CPU's
kunnen het aantal fysieke kernen overschrijden, en toegewezen geheugen kan het fysieke geheugen bewust overschrijden. Een
grafiek van toegewezen middelen beschrijft allocatie en niet de gemeten vraag.
Vergelijk deze met fysieke capaciteit, geconfigureerde limieten en feitelijk gebruik.

**Schaarste (contention) verschijnt niet in deze tabellen.** De metingen die u vertellen dat een gast
wordt uitgehongerd – de tijd die hij heeft gewacht op een fysieke processor en het geheugen dat de
host heeft teruggevorderd – bevinden zich niet in wat dit sjabloon verzamelt. Een host met 60 procent
CPU met zwaar beknelde gasten ziet er hier identiek uit als een host met 60 procent CPU met
goed functionerende gasten.

**Metingen van gasten en hosts beantwoorden verschillende vragen.** Gastbenutting alleen
verklaart planningsvertragingen op de host mogelijk niet. Koppel metingen van gasten/applicaties
aan hypervisor-contention-statistieken in plaats van toewijzingen af te leiden uit de hostbelasting.

### Wat u in plaats daarvan moet doen

| Vraag | Waar het antwoord te vinden is |
|---|---|
| Is de host verzadigd | Host-processorbelasting, rechtstreeks van de host |
| Is een gast verzadigd | Binnen de gast, plus een contention-metriek die de hypervisor bijhoudt |
| Hoeveel gasten draaien er | Gastinventaris van de host, als een telling |
| Heeft de omgeving overcapaciteit | Niet uit deze grafieken. Dit vereist plaatsingsgegevens die de host niet vrijgeeft |
| Is een gast verplaatst | Hypervisor-inventarisidentiteiten en migratiegebeurtenissen; stappen in tellingen alleen zijn ontoereikend |

Monitor gasten als hun eigen apparaten voor alles wat de gast betreft, en monitor de host
voor alles wat de host betreft. Weersta het bouwen van grafieken per gast op basis van getallen op hostniveau:
ze zijn afgeleid, ze lijken gezaghebbend en ze zijn fout op manieren die niemand later kan achterhalen.

## Valkuilen in de meegeleverde gasttelling

Het gastinventarisscript is belangrijk om te begrijpen voordat u op de uitvoer vertrouwt.

**Het doorloopt uitsluitend met SNMP versie 1 en de communitystring.** De versie ligt vast in
het script en de v3-inloggegevens op het apparaat worden niet doorgegeven. Een apparaat geconfigureerd voor
v3 kan via andere paden verzamelen terwijl gastverzameling mislukt. Gastverzameling kan
nog steeds slagen als die agent de opgeslagen community onafhankelijk via v1 accepteert;
het selecteren van v3 op het apparaat bepaalt het resultaat op zichzelf niet. Lege gast-walks
worden geretourneerd als nullen. Controleer dit protocolverschil zonder het beveiligingsbeleid
van een agent te verlagen om de helper tegemoet te komen.

**De telling is afkomstig uit de tabel met de voedingsstatus.** Het getal dat wordt gerapporteerd als het totaalaantal gasten
is het aantal vermeldingen dat wordt geretourneerd door een walk van de deelboom met de voedingsstatus, niet van een
afzonderlijk inventarisobject. Een gast die de host wel vermeldt maar die geen vermelding van de voedingsstatus heeft,
wordt niet meegeteld.

**Ingeschakeld wordt vergeleken op statustekst.** Na het bijsnijden en omzetten naar kleine letters
verhogen alleen `powered on` en `poweredon` het aantal actieve gasten. Andere weergaven doen dat
niet; vergelijk de ruwe agentrespons voordat u een nul interpreteert.

**De classificatie van gasttools heeft een bevestigd defect.** De letterlijke tekst `not installed`
wordt geteld als actief omdat de overeenkomst begint op offset nul. Niet-herkende tekst
valt eveneens terug op actief. Beschouw die telling niet als bewijs van gezonde tools;
zie [de tools-statusbug](https://github.com/kadupulhq/kadupul/issues/244).

**Het voert drie walks uit per aanroep.** Het leest de voedingsstatustabel tweemaal, daarna de
toolstabel, waardoor zelfs zijn eigen tellingen geen atomaire momentopname van de inventaris vormen. Op een host
met veel gasten moet u die verzamelkosten meten. Als de poller krap zit, is dit eerder een kandidaat voor een langer interval dan
voor meer threads. Zie [De poller schalen](/nl/guides/scale-the-poller/).

Het script verzendt normaal gesproken alle vijf benoemde waarden, inclusief nullen voor lege walks.
Een mislukte walk kan daarom een syntactisch complete maar misleidende meting opleveren.
Voor onvolledige uitvoer controleert de PHP-uitvoerprocessor de velden die vereist zijn voor de
gekoppelde gegevensbron en houdt onvolledige tijdstempelgroepen achter; deze worden niet
noodzakelijk onmiddellijk weggegooid. Zie [De pollercache](/nl/concepts/the-poller-cache/).

## Valkuilen in de rest

**Het processorgemiddelde verbergt onbalans.** Een host met één volledig belaste kern en 63 inactieve kernen
heeft een laag gemiddelde. Behoud gevalideerde grafieken per processor waar dat belangrijk is. De gemiddelde-helper
retourneert bovendien `load:0` voor een lege walk, wat niet te onderscheiden is van een gemeten inactieve CPU;
koppel dit aan de verzamelstatus en de bekende bug met lege resultaten.

**Processorindices zijn positiegebonden.** Ze worden ontdekt door de processortabel
te doorlopen. Als agentindices veranderen, verifieer dan de identiteitskoppelingen voordat u op continuïteit vertrouwt.
De meegeleverde beperking tot één of twee cijfers is een afzonderlijk detectiedefect.

**Opslagvermeldingen zijn alles wat de agent opslag noemt.** Verwacht datastores gemengd met
zaken die u niet wilde, in toewijzingseenheden die vermenigvuldiging vereisen. Dit is het
gedrag van Host Resources, geen eigenaardigheid van ESXi. Controleer gecachete toewijzingseenheden voordat
u bytes interpreteert; het gedeelde script heeft een [bekend conversiedefect](https://github.com/kadupulhq/kadupul/issues/243)
voor ongeldige negatieve metingen of ontbrekende vermenigvuldigers.

**Interfacenamen op een hypervisor zijn stabiel totdat ze dat niet meer zijn.** Een driverupdate of een
herconfiguratie kan ze hernummeren. Zie [Een switch monitoren](/nl/guides/monitor-a-switch/) voor
hoe de index wordt gekozen en waarom dat uitmaakt.

**De scripts draaien op de pollerhost.** Ze bereiken de hypervisor zelf via het
apparaat-ID dat door de gecachete opdracht wordt doorgegeven. De helpers voor gasten en het CPU-gemiddelde halen bij elke
aanroep de actuele apparaatrij op; een communitywijziging vereist geen herbouw
van die opdrachtargumenten. Andere verzamelaars kunnen inloggegevens in hun werkitems insluiten.
Zie [De pollercache](/nl/concepts/the-poller-cache/).

## Storingsmodi

| Symptoom | Mogelijke oorzaak |
|---|---|
| Alles verzamelt behalve gasttellingen | Het apparaat is geconfigureerd voor SNMPv3 en het gastscript gebruikt v1 |
| Aantal gasten klopt, aantal ingeschakelde gasten is nul | Controleer de exacte voedingsstatustekst en of de tweede walk is geslaagd |
| Aantal gasten daalt naar nul en herstelt | Controleer mislukte/lege walks; de helper kan een volledige regel nullen uitzenden |
| Processorgrafieken verschijnen en stoppen na hardwarewijziging | Controleer gewijzigde indices en de beperking tot één of twee cijfers |
| Host-CPU vlak en laag terwijl gasten traag zijn | Controleer verzamelfouten en schaarste; een lege gemiddelde-walk wordt als nul gerapporteerd |
| Datastoregrafieken bevatten partities waar u niet om vroeg | De agent rapporteert ze als opslag |
| Uptime-grafiek klopt niet na een poller-uitval | Het rapporteert Kadupuls laatst geregistreerde waarde, geen live meting |
| Totaal aantal gasten over hosts springt tijdens onderhoud | Migrerende gasten worden kortstondig dubbel geteld, of helemaal niet |
