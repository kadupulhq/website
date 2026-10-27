---
title: Het eerste apparaat toevoegen
description: Laat één apparaat pollen en bevestig dat de gegevens binnenkomen voordat je daarop verder bouwt.
sidebar:
  order: 3
banner:
  content: "Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst."
---

Voeg eerst één apparaat toe, controleer of het antwoordt en ga dan pas verder. De meeste problemen met een monitoringsysteem zijn terug te voeren op een apparaat dat vanaf het begin nooit echt antwoordde.

Kies een apparaat waarbij een fout geen kwaad kan. Een switch in eigen beheer, op een netwerk dat je beheert, waarop SNMP al is ingeschakeld. Begin niet met het apparaat waar iemand je net naar vraagt.

## Voordat je begint

Voor dit SNMP-voorbeeld moet het apparaat query’s beantwoorden vanaf de toegewezen collector. Voer de controles uit op die collector, bij voorkeur als de poller-gebruiker; een verzoek vanaf je laptop kan een ander firewall-pad volgen. Vervang het voorbeeldadres en de community door de alleen-lezen inloggegevens die op je apparaat zijn geconfigureerd. De onderstaande numerieke OID’s werken ook wanneer lokale MIB-naambestanden niet zijn geïnstalleerd.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Als dat een beschrijvingstekenreeks oplevert, ga je verder. Als er een time-out optreedt, los dat dan eerst op. Geen enkele hoeveelheid configuratie in de webinterface zal een onbereikbaar apparaat laten antwoorden.

Controleer vervolgens de tabel die je daadwerkelijk in een grafiek wilt weergeven, want een apparaat kan `sysDescr` beantwoorden en toch de interfacetabel weigeren.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

De tweede OID is de `ifDescr`-kolom. Je wilt één rij per geëxposeerde interface zien. Een leeg resultaat kan wijzen op een beperkte SNMP-weergave of een niet-ondersteunde tabel; een autorisatiefout wijst op onjuiste inloggegevens of toegangsbeleid. Inspecteer de geretourneerde foutmelding voordat je wijzigingen aanbrengt op het apparaat of in de configuratie van Kadupul.

Twee feiten over SNMP-versies bepalen latere keuzes, dus stel die nu vast.

| Versie | Wat het voor jou betekent |
|---|---|
| v1 | Geen Counter64-ondersteuning. Snelle verbindingen kunnen 32-bits octettellers meerdere keren laten overlopen tussen polls, waardoor de berekende snelheid dubbelzinnig wordt |
| v2c | Ondersteunt Counter64 wanneer de agent dit aanbiedt; community strings worden als leesbare tekst verzonden |
| v3 | Ondersteunt authenticatie en versleuteling met `authPriv`; het kiezen van v3 alleen schakelt niet automatisch beide in |

Geef de voorkeur aan v3 met `authPriv` waar dit wordt ondersteund, of v2c op een afgeschermd beheernetwerk. Selecteer zowel het 64-bits interfacegrafiektype als de SNMP-versie. Als het apparaat alleen v1 ondersteunt, houd dan rekening met het polling-interval en het verkeersvolume in de foutentabel onderaan deze pagina. [SNMP](/nl/reference/snmp/) behandelt alle inloggegevensvelden in detail.

## Beslis drie dingen voordat je het formulier opent

**De inloggegevens.** Precies degene die je hierboven hebt getest, inclusief de poort als deze afwijkt van de standaardwaarde.

**De beschikbaarheidsmethode.** Hiermee bepaalt Kadupul of het apparaat actief is, onafhankelijk van de vraag of de gegevensverzameling werkt. De meegeleverde keuzes zijn: geen (none), ping, SNMP-uptime, SNMP-beschrijving, SNMP-getNext en twee combinaties van ping met SNMP-uptime (waarvan één beide vereist en de andere met een van beide genoegen neemt).

Kies bij voorkeur een SNMP-methode voor een apparaat dat je via SNMP ondervraagt. Dat test immers precies datgene waarvan je afhankelijk bent. ICMP-ping vereist een raw socket, waarvoor de web- en poller-gebruikers gewoonlijk geen machtigingen hebben; een apparaat dat vanuit je shell op `ping` antwoordt, kan daardoor in de interface toch als niet-beschikbaar worden gemeld. Een TCP-ping naar een poort waarvan je weet dat deze open is, voorkomt dat.

**Het apparaatsjabloon.** Kies een sjabloon dat past bij de hardware.

## Het apparaat toevoegen

1. Kies op de verouderde pagina **Apparaten** (`host.php`) voor **Toevoegen**. Tijdens de migratie naar Symfony gebruiken het aanmaken van apparaten en de configuratie van grafieken nog deze pagina. Voer een beschrijving, hostnaam of IP-adres, toegewezen collector, SNMP-versie en inloggegevens in.
2. Stel de gekozen beschikbaarheidsmethode in.
3. Selecteer het apparaatsjabloon.
4. Sla op, controleer of het apparaat is ingeschakeld en lees het beschikbaarheids-/SNMP-paneel af. Een opgeslagen databaserecord is nog geen bewijs dat het verzamelen van gegevens is geslaagd.

## Wat het apparaatsjabloon bepaalt

Een apparaatsjabloon koppelt grafieksjablonen en gegevensquery’s aan het apparaat. Een gegevensquery doorloopt een tabel op het apparaat, zoals de interfaces, en levert één index per rij op. Het toepassen van het sjabloon voert ook de bijbehorende gegevensquery’s uit om die indexen te vullen. Wanneer grafiekautomatisering is uitgeschakeld, maken deze koppelingen op zichzelf nog geen grafieken aan. Wanneer grafiekautomatisering is ingeschakeld, kunnen hooks van sjablonen en query’s grafieken genereren volgens overeenkomende regels; controleer bestaande grafieken voordat je duplicaten toevoegt.

Het wijzigen van een sjabloon kan koppelingen aanpassen en die hooks opnieuw uitvoeren. Dit stelt bestaande grafieken of gegevensbronnen niet opnieuw in. Controleer het geselecteerde sjabloon en de opgevraagde indexen voordat je dit toepast op een apparaat dat al meetgegevens heeft opgebouwd.

Die indexen zijn de reden dat je interfaces uit een lijst selecteert in plaats van handmatig OID’s in te voeren. [Sjablonen](/nl/concepts/templates/) en [Gegevensquery’s en indexen](/nl/concepts/data-queries-and-indexes/) behandelen beide onderwerpen grondig.

## Het statuspaneel aflezen

Wanneer het apparaat wordt opgeslagen met een SNMP-beschikbaarheidsmethode, opent Kadupul een sessie en rapporteert het resultaat. Dit is de controle die er echt toe doet, en het is degene die men vaak overslaat.

| Wat je ziet | Wat het betekent |
|---|---|
| Query’s voor systeem en uptime slagen | Het paneel kan elementaire SNMP-metagegevens lezen. Dit bewijst nog niet dat de interfaceverzameling werkt |
| Locatie of Contactpersoon is leeg | Deze optionele metagegevensvelden zijn mogelijk niet ingesteld; een lege waarde op zich is geen fout |
| SNMP niet in gebruik | Geen community of gebruikersnaam op het apparaat, of de versie staat op geen (none) |
| SNMP-sessiefout | Sessieopbouw mislukt; inspecteer de getoonde fout, inloggegevens, protocol- en verbindingsinstellingen |
| SNMP-systeemfout | Lezen van `sysDescr` mislukt; controleer de foutmelding, agentweergave, inloggegevens en bereikbaarheid |
| SNMP-hostfout | Noch beschrijving noch uptime werd geretourneerd |
| Uptime wordt getoond als `U` | Uptime kon niet worden gelezen. Sommige apparaten rapporteren dit fundamenteel niet |

Als de beschikbaarheidsmethode ping bevat, verschijnt daaronder een afzonderlijk ping-resultaat. Lees beide. Een apparaat kan voor de ene slagen en voor de andere falen; welke faalt, vertelt je waar je moet zoeken.

Een lege systeembeschrijving bewijst niet dat de gegevensverzameling mislukt. De code houdt rekening met agents met een lege beschrijving en een bruikbare uptime. Uitgeschakelde apparaten slaan de beschikbaarheidscontrole over, en methoden zonder SNMP tonen dit SNMP-paneel niet. Verifieer vervolgens de feitelijke query en de poller-cache.

## Gegevensbronnen en grafieken maken

Voor een nieuw apparaat zonder geautomatiseerd aangemaakte grafieken is de volgende stap het aanmaken van de grafiek en de bijbehorende gegevensbron. Controleer **Lijst met gegevensbronnen** en **Poller-cache weergeven** op de apparaatpagina in plaats van aan te nemen dat ze leeg zijn.

Kies op de apparaatpagina voor **Grafieken voor dit apparaat maken**. Voor een switch betekent dit dat je de interface-gegevensquery uitvoert, de gewenste interfaces selecteert en daar een grafiektype voor kiest. Kies twee of drie interfaces, niet alle achtenveertig. Je wilt aantonen dat het pad werkt, en een kleine eerste reeks is in de volgende stap veel eenvoudiger te beoordelen.

Een geïndexeerde grafiek koppelt gegevensbronnen aan de gekozen interface en bereidt de bijbehorende poller-cache-items voor; compatibele bestaande bronnen kunnen worden hergebruikt. De bevestiging van het aanmaken van de grafiek is nog geen bewijs dat polling plaatsvindt. Controleer of de cache het verwachte apparaat, de interface-OID’s en het RRD-pad bevat.

## Bevestigen dat er gegevens worden verzameld

Wacht op de geplande verzamelcycli en controleer vervolgens zowel tijdstempels als waarden. Een lege grafiek kan duiden op normalisatie tijdens het opstarten, een onbekende waarde of een mislukte verzameling. Er zijn twee metingen van een teller nodig om een snelheid te berekenen, maar twee poller-runs garanderen nog geen voltooid, geldig archiefinterval.

Controleer drie zaken, in deze volgorde.

**De poller heeft gedraaid.** Zoek naar het overzicht aan het einde van de cyclus in het geconfigureerde logboek. Als dit ontbreekt, controleer dan de taakplanning, de logbestemming en bestandsrechten, en of de poller voortijdig is gestopt. Zie [Logboekregistratie](/nl/reference/logging/).

**Het bestand bestaat en is recent.** Kopieer het werkelijke RRD-pad uit de gegevensbron of de poller-cache; raad het niet op basis van de hostnaam. Paden en namen kunnen worden aangepast. Zie [Bestandsindeling](/nl/reference/file-layout/). Vraag RRDtool wanneer het bestand voor het laatst is beschreven:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

De tijdstempel moet vooruitgaan bij geslaagde schrijfbewerkingen. Een recente tijdstempel kan nog steeds vergezeld gaan van een onbekende waarde, en gebufferde schrijfbewerkingen kunnen de tijdstempel op schijf vertragen. Controleer bij `rrdcached` of Boost ook de flush-status van dat onderdeel.

**De waarde is niet onbekend.** `lastupdate` toont de meest recent aangeleverde waarden; voor een teller zijn dit absolute tellerstanden, geen berekende verkeerssnelheden. Inspecteer voltooide rijen uit `fetch` op eindige snelheden. Opstarttiming, stapuitlijning, heartbeat, grenswaarden en de drempel voor onbekende gegevens van het archief zijn allemaal van invloed op het moment waarop een bruikbare rij verschijnt. Stel geen diagnose op basis van alleen de eerste twee rijen. Blijven onbekende waarden aanhouden, onderzoek dan de verzamelde waarden, het type gegevensbron, de heartbeat en poller-foutmeldingen.

## Veelvoorkomende eerste problemen

| Symptoom | Meest voorkomende oorzaak |
|---|---|
| Opslaan lukt, maar ophalen van systeembeschrijving meldt een fout | Controleer inloggegevens, agentweergave en bereikbaarheid van de collector; een lege beschrijving alleen is onvoldoende bewijs |
| SNMP-sessiefout vanuit Kadupul, `snmpget` werkt wel vanaf je laptop | Firewall-pad verschilt, of de agent filtert op bron-IP-adres |
| Apparaat staat als inactief, maar SNMP-gegevens komen wel binnen | Beschikbaarheid ingesteld op ICMP-ping, die geen raw socket kan openen |
| Beschrijving verschijnt, maar er zijn geen gegevens | Poller is niet gepland, of draait onder een gebruiker die niet naar de RRD-map kan schrijven |
| Gegevensquery levert geen interfaces op | Agentweergave sluit de interfacetabel uit, of het apparaat vereist een herindexering |
| Eerste waarde onbekend, daarna in orde | Normaal voor een teller. Er zijn twee metingen nodig om een snelheid te berekenen |
| Onbekende waarden blijven aanhouden | Mislukte verzameling, ongeldige waarden, conflict in type/grenswaarden, heartbeat of archiefnormalisatie |
| Even gegevens, daarna onderbrekingen | Poller heeft langer nodig dan het interval, of het apparaat beperkt de SNMP-doorvoersnelheid |
| Tellersnelheden zijn onwaarschijnlijk hoog of laag | Meerdere 32-bits overloopcycli, tellerreset, eenheden of instellingen van gegevensbron; gebruik ondersteunde 64-bits tellers op snelle verbindingen |
| Interfaces geven na herstart verkeerde poorten weer | Indexen zijn verschoven. De gegevensquery heeft een herindexeringsmethode nodig die dit opmerkt |

Dat laatste punt is belangrijk om te begrijpen voordat je honderd switches beheert: SNMP-interface-indexen blijven na een herstart of modulewissel niet gegarandeerd gelijk. De herindexeringsmethode van een gegevensquery zorgt ervoor dat een grafiek naar dezelfde fysieke poort blijft verwijzen. [Gegevensquery’s en indexen](/nl/concepts/data-queries-and-indexes/) licht de keuzemogelijkheden toe.

Wanneer één apparaat probleemloos gegevens verzamelt, voeg dan de rest in bulk toe in plaats van één voor één. [Apparaten automatisch detecteren](/nl/guides/discover-devices-automatically/) en de opdrachtregelprogramma’s in [Opdrachtregelprogramma’s](/nl/reference/command-line-tools/) zijn beide veel efficiënter dan deze pagina vijftig keer te herhalen.

Volgende stap: [De eerste grafiek lezen](/nl/start/first-graph/).
