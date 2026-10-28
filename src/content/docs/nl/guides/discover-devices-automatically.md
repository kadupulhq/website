---
title: Apparaten automatisch detecteren
description: Scan een netwerkbereik, koppel gevonden apparaten aan een sjabloon en laat regels grafieken en boomstructuurtakken opbouwen, met apparaatcreatie uitgeschakeld voor een initiële detectieronde.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie. Dit is een conceptvertaling die wacht op beoordeling door iemand die de taal vloeiend beheerst.
sidebar:
  order: 15
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u erop
vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Automatisering bestaat uit twee afzonderlijke mechanismen die gemakkelijk met elkaar worden verward. Detectie doorloopt een
reeks adressen en bepaalt wat een apparaat is. Regels bepalen wat er voor een
apparaat wordt gebouwd zodra het bestaat. U kunt beide onafhankelijk van elkaar uitvoeren, en de meeste schade
die mensen met automatisering aanrichten, ontstaat door beide tegelijk in te schakelen en pas
achteraf de gevolgen te ontdekken.

## Het bereik definiëren

Een netwerkbereik is een door komma's gescheiden lijst. Elke vermelding heeft een van de drie vormen.

| Vorm | Voorbeeld | Opmerkingen |
|---|---|---|
| CIDR | `192.168.1.0/24` | Accepteert ook een decimaal masker met punten, `192.168.1.0/255.255.255.0` |
| Jokerteken | `192.168.*.*` | Intern geconverteerd naar het equivalente CIDR |
| Enkel adres | `192.168.1.10` | Scant exact dat adres |

Begin-tot-eind-reeksen geschreven als `192.168.1.10-192.168.1.50` worden met een
fout geweigerd. Ze worden niet ondersteund.

Gebruik niet-overlappende bereiken, ook over netwerken heen die gelijktijdig kunnen draaien.
De werktabel heeft een globale unieke sleutel op het IP-adres; een duplicaat kan
een volledige invoegbatch weigeren, waardoor andere adressen in die batch worden overgeslagen. Zie
[issue #207](https://github.com/kadupulhq/kadupul/issues/207).

Alles is IPv4. De berekeningen voor bereiken gebruiken overal 32-bits geheeltallige conversie, dus
er is hier geen IPv6-pad.

Het netwerk- en broadcastadres zijn uitgesloten. Een `/24` scant 254 adressen, van
`.1` tot `.254`. Een vermelding met één enkel adres scant er één. Adressen waarvan het laatste octet 255 is,
worden tijdens de scan eveneens overgeslagen.

Voordat een scan start, wordt elk adres in het bereik weggeschreven naar een werktabel, één
rij per adres, en threads claimen daar rijen uit. Een `/16` schrijft 65534 rijen vóór
de eerste ping. Dat is een reële belasting, en daarom is een scan van een groot leeg bereik
traag, zelfs als niets antwoordt.

Koppel een SNMP-optieset aan elk bereik. De mastermodus logt een fout en slaat een
bereik over waarvan de SNMP-set-ID nul is. Een gerichte scan past die controle niet toe;
het rechtstreeks starten maakt ontbrekende SNMP-opties niet bruikbaar.

## Het scantempo bepalen

| Instelling | Wat het doet | Standaardwaarde |
|---|---|---|
| Discovery Threads | Parallelle workers die adressen claimen | 1 |
| Run Limit | De detectie wordt na deze tijdsduur beëindigd | 20 minutes |
| Schedule Type | Handmatig, dagelijks, wekelijks, maandelijks of maandelijks op een vaste dag | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP of SNMP | Uit de globale instelling |
| Ping Retries, Timeout | Foutkosten per adres | Uit de globale instellingen |

Threads en de uitvoeringslimiet werken slecht samen als u er niet vooraf over nadenkt. Vijftig threads
tegen een `/16` is een poortscan voor elk inbraakdetectiesysteem.
Eén thread tegen hetzelfde bereik bereikt de uitvoeringslimiet en wordt halverwege
afgebroken, wat een deelresultaat achterlaat dat lijkt op een voltooid resultaat.

Stem de omvang van het bereik zo af dat een scan binnen de limiet eindigt met een aantal threads
dat uw netwerk toestaat. Meerdere kleine bereiken zijn beter dan één groot bereik, omdat elk bereik zijn eigen
schema en limiet krijgt.

## Wat een scan per adres doet

1. Een naam omzetten. Alternatieve DNS-servers kunnen worden opgegeven als een spatiescheidende lijst; als
   er geen zijn ingesteld, wordt de eigen resolver van de poller gebruikt. Een NetBIOS-zoekopdracht is een optionele
   terugvaloptie wanneer DNS niets oplevert.
2. Controleren of het adres of die naam al een apparaat is. Als dat het geval is, wordt het adres als
   gereed gemarkeerd. Dit onderdrukt een bestaand apparaat dat via die waarden wordt gevonden; dit
   is geen garantie tegen gelijktijdige creatie of afwijkende aliassen.
3. Pingen met de geconfigureerde methode. De SNMP-methode omzeilt de afzonderlijke ping.
4. Als de ping antwoordt, of als de SNMP-methode is geselecteerd, SNMP proberen en `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` en uptime verzamelen.
5. De verzamelde systeemgegevens vergelijken met de apparaatregels.

Een adres dat op pings reageert maar niet op SNMP, wordt geregistreerd als gevonden en bereikbaar. Een
adres dat op SNMP reageert maar met geen enkele apparaatregel overeenkomt, wordt geregistreerd als gevonden met zijn
systeemgegevens, en er wordt niets aangemaakt. Beide belanden in de lijst met gedetecteerde apparaten.

Duplicaatonderdrukking is standaard ingeschakeld. Als een `sysName` al is gezien op
een ander adres in de opgeslagen detectierecords van dit netwerk, of al bestaat op een apparaat met een andere
hostnaam, wordt het adres overgeslagen. Dat is de juiste standaard voor een router met veel
geadresseerde interfaces en de verkeerde voor identieke apparaten achter afzonderlijke NAT-adressen;
daarvoor dient de optie voor dezelfde sysName om dit uit te schakelen.

Bestaande apparaten kunnen hun gegevensquery's tijdens een scan opnieuw laten uitvoeren. Dat staat standaard
uit en is van toepassing op apparaten die als actief of herstellend zijn geregistreerd. Detectie gebruikt hun
opgeslagen status voor deze beslissing; het pollt een bestaand apparaat niet opnieuw.

## Apparaatregels bepalen het sjabloon

Een apparaatregel koppelt systeemgegevens aan een apparaatsjabloon. Elke regel bevat een patroon voor
`sysDescr`, `sysObjectID` en `sysName`. De matcher filtert op elk systeemveld
dat het apparaat als niet-leeg heeft geretourneerd; lege regelpatronen komen met elke waarde overeen. Regels
worden op volgorde geëvalueerd en de eerste overeenkomst wint.

Gebruik eenvoudige letterlijke deelreeksen en verifieer het geselecteerde sjabloon in de detectieresultaten.
De huidige SQL-matcher sluit regex-patronen in tussen letterlijke `/`-tekens,
waardoor een verankerd patroon zoals `^Linux.*fixture$` mislukt, zelfs als de regex-operator van de database
er rechtstreeks mee overeenkomt. De fallback naar deelreeksen herstelt dit niet. Zie
[issue #206](https://github.com/kadupulhq/kadupul/issues/206). SQL-`LIKE`
behandelt bovendien `%` en `_` als jokertekens.

Geen overeenkomst betekent geen apparaat. Het adres wordt vastgelegd in de lijst met gedetecteerde apparaten
met alle systeemgegevens die zijn verzameld, en die lijst is de plek waar u de regel schrijft
die u nog miste.

Plaats specifieke regels boven algemene. Een regel die overeenkomt met de deelreeks `Linux` en
boven een leveranciersregel is geplaatst, claimt elk apparaat dat Linux in zijn
beschrijving vermeldt.

## Detectie controleren voordat aanmaken wordt ingeschakeld

De schakelaar voor het aanmaken van apparaten staat bij een nieuw bereik standaard uitgeschakeld. Laat deze uit
voor de eerste ronde en schakel de optie uit om gegevensquery's van bestaande apparaten opnieuw uit te voeren.
Deze ronde werkt nog steeds detectierecords, scanstatistieken en logs bij en kan geconfigureerde
meldingen verzenden. Het simuleert de uitvoering van grafiek- of boomstructuurregels niet vooraf.

Voer de scan uit en bekijk vervolgens de lijst met gedetecteerde apparaten. Deze toont vastgelegde detecties,
hun verzamelde SNMP-gegevens en het gekoppelde sjabloon waar beschikbaar. Bestaande
apparaten, onderdrukte duplicaten en overgeslagen adressen hoeven daar niet te verschijnen.
Bekijk zowel de debug-uitvoer per adres als de lijst.

Forceer een scan via de opdrachtregel in plaats van op een schema te wachten:

```bash
php poller_automation.php --network=3 --force --debug
```

De debug-vlag toont de beslissingen per adres op het moment dat ze plaatsvinden. Het masterproces,
dat ingeschakelde bereiken start waarvan het schema moet worden uitgevoerd, is een aparte modus:

```bash
php poller_automation.php -M
```

De gerichte opdracht met `--force` voert ook een uitgeschakeld netwerk uit. Het toevoegen van `--force` aan
de mastermodus omzeilt de schemacontrole en kan ook uitgeschakelde netwerken starten.
Gebruik de gerichte vorm bij het valideren van één enkel bereik.

Controleer drie zaken in het resultaat voordat u het aanmaken inschakelt:

- Het aantal apparaten komt overeen met uw verwachting. Een aantal dat veel hoger ligt dan uw inventarislijst
  betekent meestal dat het bereik groter is dan gedacht.
- De gekozen sjablonen zijn correct. Een kolom met overal hetzelfde generieke sjabloon
  betekent dat uw regels niet overeenkomen.
- Er ontbreekt niets belangrijks. Controleer bij een ontbrekend apparaat de bereikexpansie, worker-voltooiing,
  onderdrukking van bestaande apparaten en duplicaten, het pingbeleid en de SNMP-resultaten.
  Afwezigheid in de lijst alleen bewijst niet dat het apparaat onbereikbaar is.

## Grafiek- en boomstructuurregels

Zodra een apparaat bestaat, bepalen grafiekregels en boomstructuurregels wat erop wordt gebouwd.
Detectie kan deze automatisering aanroepen na het aanmaken van een apparaat, en de CLI kan
deze toepassen op bestaande apparaten. Afzonderlijke grafiek- en boomstructuurregels moeten zijn ingeschakeld.
De globale schakelaars voor grafiek-/boomautomatisering beheren specifieke creatie-hooks;
ze vormen geen algeheel verbod op expliciete CLI-automatisering.

Een grafiekregel bestaat uit drie delen: op welke apparaten deze van toepassing is, op welke gedetecteerde indices
binnen een gegevensquery deze van toepassing is en welk grafiektype moet worden gemaakt. Beide overeenkomende
delen zijn opgebouwd uit regelitems, en een regelitem is een veld, een operator en een
patroon, samengevoegd met `AND` of `OR` met haakjes.

| Operatorgroep | Leden |
|---|---|
| Deelreeks | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Gelijkheid | matches, is not equal to |
| Numeriek | is less than, less than or equal, greater than, greater than or equal |
| Aanwezigheid | is unknown, is not unknown, is empty, is not empty |
| Patroon | matches regular expression, does not match regular expression |

Deze worden omgezet in een SQL-`WHERE`-clausule. De operatoren voor reguliere expressies volgen het
regex-dialect van de database, niet PCRE; een patroon dat werkt in
`preg_match` werkt hier dus niet noodzakelijk. Numerieke vergelijkingen met numerieke
patronen worden zonder aanhalingstekens doorgegeven; al het andere wordt tussen aanhalingstekens geplaatst en de database
past zijn typeconversieregels toe. Test numerieke filters tegen de werkelijk gecachete
waarden; deze waarden worden gewoonlijk als tekst opgeslagen. Substring-operatoren gebruiken SQL-`LIKE`,
waarbij `%` en `_` jokertekenbetekenissen hebben.

Twee gedragingen zijn belangrijk om te weten voordat u een regel debugt die niets doet:

**Een leeg apparaat-/objectfilter komt nergens mee overeen, maar een leeg indexfilter
komt overeen met alle gecachete indices.** Het apparaatselectiefilter valt terug op een onware voorwaarde
wanneer het geen overeenkomstitems bevat. Zodra een grafiekregel echter overeenkomt met een apparaat,
leidt het verwijderen van alle grafiek-indexvoorwaarden ertoe dat de gegevensquery ongefilterd blijft.
Het verwijderen van een voorwaarde `ifDescr = eth0` kan bijvoorbeeld ook een grafiek aanmaken voor `lo`.
Schakel de regel uit terwijl u de indexvoorwaarden bewerkt.

**Een regel die verwijst naar een veld dat het apparaat niet heeft gedetecteerd, wordt afgebroken.** Als een
regel filtert op een veld van een gegevensquery dat zich niet in de cache van dat apparaat bevindt, logt de run
een waarschuwing met de naam van het veld en stopt de verwerking van die regel voor dat apparaat. De gebruikelijke
oorzaak is een regel geschreven voor de ene gegevensquery die wordt geëvalueerd op een apparaat waarvan de
query een andere set velden opleverde.

De pagina voor regelbewerking toont kandidaat-objecten en grafieken. Controleer die lijsten voordat
u een regel inschakelt en nadat u deze hebt bewerkt. Het zijn selectievoorvertoningen, geen volledige
proefrun: gegevensbroncontroles, detectie van bestaande grafieken, creatie-hooks
en boomstructuurinvoeging vinden nog steeds plaats tijdens de uitvoering. De CLI heeft geen optie voor een proefrun.

Boomstructuurregels hebben afzonderlijke apparaat- en grafiekbladversies en een geselecteerde doelboomstructuur
en bovenliggend knooppunt. Kopstappen kunnen vaste reeksen of waarden uit apparaat-/grafiekvelden
gebruiken. Uit velden afgeleide koppen passen een hoofdletterongevoelige PHP-regex-vervanging toe;
letterlijke `\n`-reeksen in het resultaat splitsen dit in opeenvolgende geneste koppen.
Deze vervangingssyntaxis verschilt van de SQL-regex die wordt gebruikt voor objectovereenkomsten.
Bestaande koppen en bladeren worden hergebruikt bij dezelfde boomstructuur en hetzelfde bovenliggende knooppunt; het wijzigen van het
pad kan een nieuwe plaatsing toevoegen zonder de oude te verwijderen.

## Regels toepassen op apparaten die al bestaan

Detectie is niet de enige ingang. Regels kunnen worden uitgevoerd op apparaten die zich al in het
systeem bevinden, geselecteerd op id, hostnaam of beschrijving:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Hostnaam en beschrijving worden vergeleken als een reguliere expressie als de waarde geldig is,
en altijd ook als een deelreeks. Ten minste een van de drie selectoren is vereist;
aanroepen zonder selectoren stopt met een fout. Wanneer selectoren worden gecombineerd,
worden ze samengevoegd met `AND`. Gebruik door spaties gescheiden positieve apparaat-ID's voor een gerichte
selectie; door komma's gescheiden ID's worden niet ondersteund. Patronen kunnen nog steeds breed zijn,
en de terugvaloptie SQL-`LIKE` behandelt `%` en `_` als jokertekens.

De selectorquery sluit uitgeschakelde apparaten niet automatisch uit. `--debug`
voegt diagnostische gegevens toe, maar voert nog steeds creaties uit. Geen overeenkomende apparaten is een succesvolle
no-op, dus de afsluitstatus alleen bewijst niet dat er iets is gemaakt.

Voor elk overeenkomend apparaat voert de run drie acties in volgorde uit:

1. Probeert creatie voor gekoppelde grafieksjablonen die nog geen grafiek hebben op het
   apparaat, onder voorbehoud van sjabloongeschiktheid en gegevensbroncontroles.
2. Voert ingeschakelde grafiekregels uit voor gekoppelde gegevensquery's met behulp van hun opgeslagen indexcache.
   Deze stap voert de detectie zelf niet opnieuw uit; vernieuw eerst de gegevensquery
   als de cache ontbreekt of verouderd is.
3. Past ingeschakelde boomstructuurregels voor apparaatbladeren toe.

Het aanmaken van nieuwe grafieken kan boomstructuurregels voor grafiekbladeren aanroepen wanneer globale boomautomatisering
is ingeschakeld. De CLI past deze regels niet opnieuw toe op grafieken die al
gemaakt zijn. Een nieuwe of gewijzigde grafiekbladregel vult bestaande grafieken
daarom niet met terugwerkende kracht aan, alleen omdat de CLI opnieuw wordt uitgevoerd. Zie
[issue #211](https://github.com/kadupulhq/kadupul/issues/211). Controleer hun plaatsing
afzonderlijk; verwijder en herschep historische grafieken niet louter om de creatie-hook te activeren.

Herhaalde runs onderdrukken een bestaande niet-geïndexeerde grafiek op apparaat en grafieksjabloon.
Geïndexeerde grafieken worden gecontroleerd op apparaat, gegevensquery, grafiektype en index. Dit
voorkomt dubbele aanmaak bij opeenvolgende runs; het is geen garantie voor gelijktijdigheid.
Controleer na een run de grafiekenlijst en de boomstructuur, samen met `AUTOM8`-logberichten voor
overgeslagen grafieken, ongeldige gegevens of aanmaakfouten.

Eén situatie wordt stil genoeg overgeslagen om voor verwarring te zorgen: een grafieksjabloon met een veld
dat als overschrijfbaar is gemarkeerd en geen standaardwaarde heeft, komt niet in aanmerking voor automatisering. De run
logt dat het niet is toegevoegd omdat een overschrijfbaar veld geen standaardwaarde heeft, en gaat
verder. Als een verwacht sjabloon nooit verschijnt, is dat het eerste wat u moet controleren. Zie
[Sjablonen](/nl/concepts/templates/) voor wat een overschrijfbaar veld inhoudt.

## Valkuilen

**Het uitschakelen van een regel maakt zijn werk niet ongedaan.** Het verwijdert niet de reeds
gemaakte grafieken of boomstructuuritems. Apparaatverwijdering heeft afzonderlijk gedrag voor het opruimen
van grafieken en gegevensbronnen; controleer de verwijderopties voordat u een apparaat verwijdert.

**Een scan die wordt afgebroken lijkt op een schone scan.** De uitvoeringslimiet beëindigt de
detectie op het punt waar deze was gebleven. De geregistreerde totalen zijn de totalen van het voltooide
werk, en niets markeert het resultaat als onvolledig. Vergelijk het aantal gescande adressen
met de grootte van het bereik.

**Regels worden uitgevoerd tegen de cache van de gegevensquery, niet tegen het apparaat.** Een grafiekregel die
nergens mee overeenkomt, betekent vaak dat de gegevensquery nooit is uitgevoerd of geen indices heeft gevonden.
Controleer de tabel met gedetecteerde indices voordat u de regel herschrijft.

**Kennisgevingsmails bevatten zowel bestaande als nieuwe ontdekkingen.** Een bereik kan e-mail verzenden
wanneer het klaar is, waarbij geregistreerde ontdekkingen worden gegroepeerd op basis van de vraag of elk IP-adres
in de momentopname vóór de scan voorkwam. Dit is geen bewijs dat elk gevraagd adres daadwerkelijk is gescand.

## Storingsmodi

| Symptoom | Mogelijke oorzaak |
|---|---|
| Scan vindt niets in een bezet bereik | Ping geblokkeerd, SNMP-fout, uitsluitingen of duplicaatonderdrukking |
| Bereik weigert te scannen, fout in het logboek | Geen SNMP-optieset gekoppeld |
| Apparaten gevonden maar geen aangemaakt | Schakelaar voor aanmaken uit, of geen apparaatregel kwam overeen |
| Alles krijgt hetzelfde generieke sjabloon | Regelvolgorde, met een algemene regel boven de specifieke |
| Slechts enkele adressen gescannt | Uitvoeringslimiet bereikt of overlappende bereiken wezen een adresbatch af |
| Eén apparaat per router in plaats van één per interface, of omgekeerd | De instelling voor duplicaatonderdrukking op dezelfde sysName |
| Regel komt nergens mee overeen en log waarschuwt over kolom | Regel filtert op veld dat de gegevensquery van dit apparaat niet teruggaf |
| Grafieksjabloon nooit aangemaakt door regel | Ontbrekende vereiste standaardwaarde, ongeldige uitvoer van gegevensbron of aanmaakfout |
| Onverwachte grafieken voor extra interfaces | Grafiek-indexfilter is leeg of breder dan bedoeld |
| Nieuwe boomstructuurregel plaatst bestaande grafieken niet | CLI vult grafiekbladregels niet met terugwerkende kracht aan voor bestaande grafieken |
