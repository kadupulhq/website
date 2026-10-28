---
title: Milieusensoren monitoren
description: Breng temperatuur, luchtvochtigheid, luchtstroom, vermogen en UPS-status in kaart via SNMP, vind de juiste OID's in een leveranciers-MIB en geef de metingen grafiekinstellingen die passen bij een meting in plaats van een teller.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 23
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop
vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Temperatuur, luchtvochtigheid en momenteel vermogen zijn metingen die gewoonlijk als
`GAUGE` worden opgeslagen. Cumulatieve energie- of gebeurtenistotalen vereisen mogelijk juist een tellertype.
Controleer de eenheden, identiteit en semantiek van elk object voordat u een sjabloon kiest.

Controleer wat er al wordt meegeleverd voordat u zelf iets schrijft.

## Wat wordt meegeleverd

Er bevinden zich slechts vier gegevensquerydefinities in de eigen querymap van de broncode,
en geen daarvan heeft betrekking op omgevingsmetingen.

| Meegeleverde SNMP-query | Dekt |
|---|---|
| `interface.xml` | Netwerkinterfaces |
| `host_disk.xml` | Host Resources-opslag |
| `net-snmp_disk.xml` | In UCD gedeclareerde partities |
| `net-snmp_devio.xml` | UCD-blokapparaat-I/O |

Ondersteuning voor sensoren wordt op twee andere manieren geleverd.

**Scriptserver-query's, gebundeld in het Net-SNMP-apparaatpakket.** Importeer
`install/templates/NetSNMP_Device.xml.gz` om de drie lmSensors-query-XML-bestanden
onder `resource/script_server/` te implementeren. De helper
`scripts/ss_netsnmp_lmsensors.php` bestaat eveneens in de broncodecheckout.

| Query | Tabel |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

De helper gebruikt de kolommen index, naam en meetwaarde. De query indexeert op numeriek
`sensorDevice`; `sensorName` levert een weergavenaam die de helper afkapt op
18 tekens. Namen zijn niet gegarandeerd unieke sensoridentiteiten.

Het normale `get sensorReading`-pad retourneert ruwe waarden: milligraden voor het verouderde
temperatuurobject, millivolt voor spanning en RPM voor ventilatoren. De thermische grafiek
past een `Divide by 1000`-CDEF toe. De spanningsgrafiek heeft ondanks het label Volts
geen CDEF, een [bevestigde schalingsfout](https://github.com/kadupulhq/kadupul/issues/247).

Het afzonderlijke `query sensorReading`-pad schaalt temperatuur en spanning en probeert
een conversie naar getekende spanning met behulp van de onjuiste constante 4294967294. Het kan ook
[een uitzondering genereren bij niet-beschikbare metingen](https://github.com/kadupulhq/kadupul/issues/248).
Leid geen opgeslagen eenheden af uit deze detectie-uitvoer.

De helper gebruikt nog steeds de verouderde temperatuurkolom `.2.1.3`. De huidige upstream
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
verklaart dat niet-ondertekende object verouderd ten gunste van de ondertekende kolom `.2.1.4`; verifieer
ondersteuning en gedrag bij negatieve temperaturen op de daadwerkelijke agent voordat u een sjabloon aanpast.

**Apparaatpakketten, geleverd als importeerbare archieven.** Meerdere pakketten dragen hun eigen
query-XML met zich mee en schrijven deze bij de import naar de querymappen. De pakketten die hier van belang zijn:

| Pakket | Brengt |
|---|---|
| SNMP UPS | UPS-MIB-ingangs- en uitgangslijnquery's, plus sjablonen met vaste OID's voor batterij, looptijd, temperatuur en alarmen |
| AKCP Device | Scriptquery's voor temperatuur-, vochtigheids-, luchtstroom- en 4-20 mA-sensoren |
| APC InfraStruXure PDU | Query's voor schakelaar- en fasestatistieken |
| APC InfraStruXure InRow CRAC | Query's voor unit- en groepsstatistieken, waaronder temperaturen, vochtigheid, luchtstroom en ventilatorsnelheid |
| BayTech PDU | Een stopcontactquery en een driefasige circuitquery, met stroom, spanning, vermogen en temperatuur |

Inspecteer het overeenkomende pakket voordat u handmatig een query schrijft. Volg
[Sjablonen importeren en exporteren](/nl/guides/import-and-export-templates/), controleer de bestandsimplementatie
en detectie, en maak vervolgens expliciet de gewenste grafieken aan. Aanwezigheid van een pakket
bewijst geen apparaatcompatibiliteit of correcte schaling; de onderstaande UPS- en
lmSensors-defecten vereisen aandacht.

## De twee vormen die een sensor aanneemt

Maak bij SNMP-verzameling onderscheid tussen scalaire objecten en geïndexeerde tabelinstanties.

**Een vaste OID.** Eén scalaire waarde op één adres, hetzelfde adres op elk
apparaat van dat type. Batterijtemperatuur. Totaal uitgangsvermogen. Gebruik een gegevensbron met een vaste OID:
een SNMP-get op een letterlijke OID en één gegevensbron per meetwaarde.

**Een tabel.** Een onbekend aantal meetwaarden dat per apparaat wordt ontdekt. Racksondes,
stekkerblokken, metingen per fase. Gebruik een gegevensquery, die de tabel doorloopt,
de index leert en u laat kiezen welke rijen grafieken worden.

Het meegeleverde UPS-pakket gebruikt beide. Volg de objectstructuur van de MIB: een apparaat
met slechts één stroomsonde kan deze nog steeds vrijgeven als een geïndexeerde tabelrij.

| UPS-meetwaarde | Vorm | OID |
|---|---|---|
| Batterijtemperatuur | Vast | `.1.3.6.1.2.1.33.1.2.7.0` |
| Geschatte resterende looptijd | Vast | `.1.3.6.1.2.1.33.1.2.3.0` |
| Tijd op batterij | Vast | `.1.3.6.1.2.1.33.1.2.2.0` |
| Batterijspanning | Vast | `.1.3.6.1.2.1.33.1.2.5.0` |
| Aanwezige alarmen | Vast | `.1.3.6.1.2.1.33.1.6.1.0` |
| Ingangsspanning, stroom, vermogen, frequentie | Query | `.1.3.6.1.2.1.33.1.3.3.1` |
| Uitgangsspanning, stroom, vermogen, belasting | Query | `.1.3.6.1.2.1.33.1.4.4.1` |

Elk van die gegevensbronnen is een `GAUGE`. Geen ervan is een teller. Het meegeleverde
sjabloonarchief declareert een stap van 60 seconden en een heartbeat van 600 seconden, een minimum van
nul en geen maximum, behalve voor temperatuur, die geen minimum heeft. Controleer het geïmporteerde
profiel en de werkelijke RRD-configuratie; deze declaraties bepalen het actieve pollritme
niet definitief. Een geldige negatieve meting heeft bovendien een grafiekas nodig die deze weergeeft.

## De OID's vinden

Doorloop het apparaat voordat u iets schrijft. U zoekt naar drie dingen: een
tabel met metingen, een parallelle tabel met labels en de vermenigvuldiger die de
leverancier heeft gekozen, plus geldigheid-/statusobjecten waar beschikbaar.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Vervang de voorbeeldhost en -community door geconfigureerde waarden en voer tests uit vanaf de poller.
Laad de bijbehorende MIB en afhankelijkheden om namen, eenheden en semantiek te inspecteren;
ook objectdocumentatie van de leverancier kan numerieke OID's toelichten. Een nabijgelegen
drempelwaarde of statuscode is niet uitwisselbaar met een meting.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

In de MIB-definitie is de schaling gedocumenteerd. Een leverancier die tienden van een graad
rapporteert, vermeldt dit in de beschrijving of eenheidsclausule van het object en in bijbehorende
documentatie van de leverancier. Raden op basis van één enkele meting kan 23,5 graden
veranderen in een grafiek van 235.

Standaard-MIB's dekken meer dan men verwacht. UPS-MIB op `.1.3.6.1.2.1.33` is
generiek over leveranciers heen. ENTITY-SENSOR-MIB levert een sensorwaarde met daarnaast eigen
schalings- en precisievelden. Controleer op die standaarden voordat u naar een
leveranciersspecifieke deelboom grijpt.

Vergelijk detectie over representatieve herstarts en sondewisselingen in een testinstallatie.
Twee ongewijzigde walks alleen bewijzen geen indexstabiliteit. Leg stabiele
sensoridentiteiten vast waar beschikbaar voordat u langdurige grafieken maakt.

## Een gegevensbron met een vaste OID bouwen

Een sensor met een vaste OID heeft een gegevenssjabloon nodig dat gebruikmaakt van de SNMP get-gegevensinvoer, met de
OID als letterlijke waarde en één gegevensbronitem daarin. Stel het type in op `GAUGE`,
geef het minimum alleen een reële waarde wanneer de sensor hier echt niet onder kan komen,
en laat het maximum ongedefinieerd tenzij de leverancier een plafond documenteert.

Waarden buiten de RRD-gegevensbrongrenzen worden gemarkeerd als onbekend. Stel die grenzen in binnen de
opgeslagen ruwe eenheden, niet in de geconverteerde eenheden van de grafiek; anders kunnen geldige
metingen verloren gaan voordat een weergave-CDEF wordt toegepast.

## Een gegevensquery bouwen

Een query heeft een index-OID nodig, een methode om elke doorlopen OID om te zetten in een index, en één
veld per gewenste kolom.

De UPS-uitgangsquery is een beknopt praktijkvoorbeeld. Deze indexeert op de lijntabel,
ontleedt de index aan het einde van elke geretourneerde OID met een reguliere expressie, en
declareert één invoerveld voor de index en vier uitvoervelden voor spanning,
stroom, vermogen en belasting. Uitvoerdefinities omvatten methode, bron, richting en
kolom-OID. Een kolom-OID kan een geldige index-walk-wortel zijn; het overeenkomen van de
parser van de query en de werkelijk geretourneerde OID's is wat telt. Zie [Gegevensquery's en indices](/nl/concepts/data-queries-and-indexes/) voor hoe
de index wordt gekozen en opgeslagen.

Kies een herindexeringsmethode weloverwogen. De keuzes zijn: Geen, bij teruglopende uptime,
bij verandering van het aantal indices en Alle velden verifiëren. Sensortabellen zijn het geval
waarin zwakkere methoden falen: ontkoppel één sonde van een rackeenheid en sluit een andere aan,
en het aantal verandert mogelijk niet terwijl elke meting achter de index nu bij een
andere sensor hoort. Volledige verificatie kost bij elke cyclus SNMP-capaciteit.
Controleer welke identiteitsvelden de query kan verifiëren: ongewijzigde numerieke
indices of dubbele/afgekapte labels kunnen niet bewijzen dat een fysieke sonde dezelfde is.
Vernieuw de detectie en controleer de grafiekkoppelingen na een vervanging.

## De waarde schalen

Bepaal waar de conversie plaatsvindt en plaats deze slechts op één locatie.

| Waar | Wanneer te gebruiken |
|---|---|
| In het verzamelscript | Gebruik een gedocumenteerd verzamelaarcontract; lmSensors get retourneert momenteel ruwe eenheden |
| In een CDEF op het grafiekitem | De ruwe waarde is het bewaren waard, en de weergave-eenheid is een presentatiekeuze |

Een CDEF is het gebruikelijke antwoord op een vermenigvuldiger van een leverancier. De meegeleverde pakketten bevatten
definities zoals `Divide By 10`, opgebouwd uit de huidige gegevensbron, `10` en
deling. Pas deze alleen toe op objecten met de bijbehorende ruwe eenheid.

Het UPS-pakket bevat [onjuiste vermogens- en tijd-CDEF's](https://github.com/kadupulhq/kadupul/issues/249):
zijn On Battery-reeks deelt seconden door 6000 in plaats van 60, en ingangs-/uitgangs-Watts-reeksen
delen watts door 10. Voor een conforme agent moeten 600 seconden worden weergegeven als 10 minuten en 1000 watt als
1000 watt. Batterijspanning en lijnstroom vereisen wél deling door 10; de geschatte looptijd is al in minuten. Zie
[de UPS-objecteenheden van RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Het opslaan van de ruwe meting en het delen op de grafiek houdt het RRD-bestand zuiver en
stelt u in staat een weergavevermenigvuldiger te corrigeren zonder de ruwe geschiedenis te herschrijven,
mits de metingen de gegevensbrongrenzen en bewaartermijnen hebben overleefd. Conversie aan de kant van de verzamelaar
wijzigt de opgeslagen eenheid en kan precisie verliezen; documenteer dit. Onverklaarde ruwe
metingen mogen niet worden gepresenteerd als een geverifieerde technische eenheid.

Pas de conversie niet dubbel toe. Een CDEF op een grafiek waarvan het script de waarde al
heeft geschaald, kan een aannemelijke maar onjuiste meting opleveren.

## Grafiekinstellingen kiezen die passen bij een meting

Kies instellingen voor de meting in plaats van blind standaarden voor netwerkverkeer te kopiëren.

| Instelling | Netwerkverkeer | Sensor |
|---|---|---|
| Type gegevensbron | `COUNTER` | `GAUGE` |
| Basiswaarde | 1000, zodat de as in k en M leest | Nog steeds 1000, maar het voorvoegsel is betekenisloos bij graden |
| Automatisch schalen | Gewenst, aangezien het bereik onbekend is | Meestal ongewenst, aangezien het bereik bekend is |
| Boven- en ondergrens | Afhankelijk van de modus voor automatisch schalen | Kies een bruikbaar zichtbaar bereik |

Stel een expliciete boven- en ondergrens in en een verticaal label dat de werkelijke
eenheid benoemt. De meegeleverde UPS-temperatuurgrafiek doet dit: een ondergrens van 0, een bovengrens
van 100 en `C` als verticaal label.

De optie voor automatisch schalen is een reeks keuzes, geen eenvoudige schakelaar. De optie die de meegeleverde
temperatuurgrafiek gebruikt, geeft een ondergrens door met `--alt-autoscale-max`; deze
geeft niet de opgeslagen bovengrens van 100 door. Zonder rigide grenzen kan een meting buiten het bereik
een doorgegeven limiet verruimen. Een geconfigureerde limiet ligt niet automatisch vast. Kies de variant
die de grens behoudt waar u om geeft:

| Optie | Effect |
|---|---|
| Automatisch schalen negeert limieten | Beide uiteinden zweven. Gebruik wanneer u geen idee hebt van het bereik |
| Automatisch schalen accepteert ondergrens | Geeft de ondergrens door; maximum volgt gegevens |
| Automatisch schalen accepteert bovengrens | Geeft de bovengrens door; minimum volgt gegevens |
| Automatisch schalen met beide limieten | Geeft beide limieten door; expansie hangt nog steeds af van rigide modus |

Er is ook een optie voor rigide grenzen (rigid boundaries) die voorkomt dat de as uitzet wanneer een
waarde buiten de door u ingestelde limieten valt. Schakel dit in wanneer een vaste as belangrijker is
dan het zien van uitschieters, en laat het uit wanneer dat niet zo is, omdat een rigide
grafiek een uitschieter buiten het weergegeven bereik kan afkappen. Dit verwijdert de opgeslagen
meting niet. Zie de [RRDtool-grafiekgrenzen-referentie](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Voor graden of percentages waarbij SI-voorvoegsels lezers zouden verwarren, kunt u een eenhedenexponent van 0 overwegen.
Basis 1000 regelt voorvoegselstappen; het schakelt voorvoegsels zelf niet uit en converteert meeteenheden niet.

### Consolidatie telt hier zwaarder dan bij netwerkverkeer

Een interfaceteller gemiddeld over een uur vertelt u nog steeds globaal wat er is gebeurd.
Een temperatuur gemiddeld over een uur verbergt de uitschieter van tien minuten die er juist toe deed.
Zorg ervoor dat het opslagprofiel achter deze gegevensbronnen een `MAX`-archief bijhoudt,
en configureer de getekende reeks om de juiste `MAX`-consolidatie te lezen.
Een legenda-maximum over een `AVERAGE`-reeks herstelt de oorspronkelijke piek niet.

Zelfs een MAX-archief bewaart alleen pieken die aanwezig zijn in verzamelde metingen; het
kan geen uitschieter herstellen tussen pollrondes of waarden die vóór opslag zijn geweigerd. Zie
[Gegevensretentie beheren](/nl/guides/manage-data-retention/) en
[Gegevensbronnen en archieven](/nl/concepts/data-sources-and-rras/).

## Wanneer er geen bruikbare MIB is

Veel omgevingsapparatuur spreekt Modbus, een serieel protocol of een HTTP-API,
en de SNMP-agent geeft niets bruikbaars vrij. Die apparaten hebben script-gegevensinvoer nodig. Het
script draait op de pollerhost, niet op het apparaat, en het bereiken van het apparaat is de
verantwoordelijkheid van het script. Zie [Een script voor gegevensverzameling schrijven](/nl/guides/write-a-data-collection-script/) voor het
uitvoercontract.

Retourneer `U` in plaats van `0` wanneer een sensor onbereikbaar is. Een sonde die offline ging,
is geen sonde die nul graden meet.

## Storingsmodi

| Symptoom | Mogelijke oorzaak |
|---|---|
| Temperatuur weergegeven als getal dat tien of honderd keer te groot is | Leveranciersvermenigvuldiger niet weggedeeld |
| Temperatuur tien keer te klein weergegeven | Tweemaal gedeeld, één keer in het script en één keer in een CDEF |
| Een spanningslijn geeft miljardenwaarden aan | Niet-ondertekend SNMP-geheel getal met een negatieve waarde, niet gecorrigeerd |
| Sensorgrafieken worden vlak na het wisselen van een sonde | De tabel is opnieuw geïndexeerd en gegevensbron wijst nu naar een andere sensor |
| Metingen boven een drempelwaarde verschijnen als gaten | Er is een maximum ingesteld op de gegevensbron en echte waarden overschrijden dit |
| As aangeduid in k of M bij een temperatuurmeting | Basiswaarde en eenheidsinstellingen overgenomen van een verkeerssjabloon |
| Een uitschieter is onzichtbaar in een weekoverzicht | Controleer gekozen consolidatie, bewaarde resolutie, poll-interval en geweigerde metingen |
| Een query retourneert geen indices | Controleer geretourneerde OID's, parser-overeenkomsten, toegangsbeperkingen en objectondersteuning; een kolomwortel kan geldig zijn |
| De lmSensors-query's vinden niets op een Linux-host | Controleer agentondersteuning, toegang, vrijgegeven sensorrijen en exacte SNMP-fouten |
