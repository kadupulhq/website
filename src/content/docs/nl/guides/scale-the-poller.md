---
title: De poller schalen
description: Wat u moet wijzigen wanneer de gegevensverzameling niet meer binnen haar interval afrondt, en hoe u kunt vaststellen welke limiet u feitelijk heeft bereikt.
banner:
  content: Kadupul bevindt zich in pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van revisie door een moedertaalspreker.
sidebar:
  order: 6
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat
u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Het schalen van de poller draait om één vraag: rondt een verzamelronde af voordat de volgende
begint? Alles hieronder gaat over het beantwoorden van die vraag en het vervolgens weer op ja
krijgen van dat antwoord.

Lees eerst [Architectuur](/nl/concepts/architecture/) als het u niet duidelijk is welk
onderdeel de gegevensverzameling uitvoert.

## De twee klokken

Er zijn twee intervallen en ze zijn niet dezelfde instelling.

| | Wat het is | Toegestane waarden |
|---|---|---|
| Starterinterval | Hoe vaak het besturingssysteem de collector start, via cron of vanuit de `cactid`-dienst | 60 of 300 seconden |
| Pollerinterval | Basisverzamelcadans; afzonderlijke gegevensbronstappen kunnen langer zijn | 10, 15, 20, 30, 60 of 300 seconden |

Wanneer het pollerinterval korter is dan het starterinterval, voert één start meerdere
verzamelrondes uit in een lus. Het aantal rondes is het starterinterval gedeeld door
het pollerinterval.

Het budget voor de gehele start wordt afgeleid van die twee getallen: rondes vermenigvuldigd
met het pollerinterval, minus twee seconden. Dat is de werkelijke kloktijd waartegen de
uitvoering wordt gemeten.

## Wat er gebeurt wanneer een uitvoering uitloopt

Drie verschillende zaken, en ze produceren drie verschillende logregels.

**De uitvoering wordt afgebroken.** Wanneer de verstreken tijd het budget overschrijdt, logt
de poller dat de maximale runtime is overschreden, schrijft zijn statistieken en sluit af. Werk
dat nog geen meting heeft opgeleverd kan een leegte achterlaten. Metingen die al zijn opgenomen
in de persistente wachtrij kunnen in behandeling blijven voor een latere succesvolle RRD-schrijfactie;
een uitloop betekent niet dat elke niet-weggeschreven meting is weggegooid. Controleer de wachtrijdiepte
en logboeken naast de grafiek, en wis behouden rijen niet om de volgende ronde schoon te laten lijken.

**De volgende ronde merkt de overblijfselen op.** Bij het opstarten telt de poller procesrijen
die nooit correct zijn afgesloten en waarschuwt dat er processen zijn gedetecteerd die een
pollcyclus overschrijden. Onderzoek onvoltooide of verouderde procesrecords en daadwerkelijk
draaiende dochterprocessen; de waarschuwing alleen identificeert niet het knelpunt.

**De klokken lopen uit elkaar.** Als er sinds de laatste ronde meer tijd is verstreken dan
het budget toestaat, waarschuwt de poller dat de starter niet synchroon loopt met het
pollerinterval. Dit ligt meestal aan de starter, niet aan de poller: een cron-vermelding met
de verkeerde frequentie, een gestopte dienst of een host die in slaapstand stond.

Deze paden roepen de beheerdernotificatie-helper aan. Aflevering hangt af van geconfigureerde
ontvangers, notificatie-instellingen en een werkend e-mailtransport; een waarschuwing in het
logboek bewijst niet dat er een e-mail is aangekomen. Zie [E-mailmeldingen](/nl/guides/send-email-notifications/).

Er is een vierde geval dat geen uitloop is. Als de poller eerder wordt gestart dan verwacht,
logt hij dat hij is geconfigureerd om te vaak te draaien en sluit af zonder gegevens te verzamelen.
`--force` omzeilt die timingcontrole; gebruik dit alleen tijdens een gecontroleerde diagnose
waarbij geplande en andere handmatige starts zijn gestopt. Het voegt geen capaciteit toe en maakt
overlappende verzameling niet veilig.

## De statistiekregel

Elke voltooide ronde schrijft één statistiekregel naar het logboek. Deze bevat de verstreken
tijd, de verzamelmethode, de proces- en thread-aantallen, het aantal apparaten, apparaten
per proces, gegevensbronnen en verwerkte RRD-bestanden.

Volg trends in verstreken tijd, tail latency, wachtrijdiepte en mislukte updates. Onderzoek
zelfs een geïsoleerde ronde dicht bij het budget wanneer deze gaten veroorzaakt; aanhoudende
groei helpt te bepalen wanneer capaciteit of verzamelgedrag moet veranderen.

## Processen en threads

Twee knoppen, en ze doen verschillende dingen.

| Knop | Eenheid van werk die het verdeelt | Welke collector gebruikt het |
|---|---|---|
| Processen | Apparaten, opgedeeld in aaneengesloten bereiken van apparaat-ID's | Beide |
| Threads | Items binnen één apparaat | Alleen Spine |

Het gevolg is het punt waar men vaak over struikelt: **een proces krijgt hele apparaten
toegewezen.** Eén apparaat met vijfduizend gegevensbronnen kan niet over processen worden
gespreid. Het belandt in één proces en dat proces duurt zolang als het duurt. Het toevoegen
van processen doet daar niets aan.

Beide waarden worden per gegevensverzamelaar bijgehouden, niet globaal. De waarden op de
instellingspagina zijn voorinstellingen die worden toegepast wanneer een nieuwe gegevensverzamelaar
wordt aangemaakt. Het wijzigen van de voorinstelling verandert een bestaande verzamelaar niet.

Er is ook een thread-aantal per apparaat, waarmee één enkel groot apparaat wordt opgedeeld.
Dit is alleen van toepassing op de C-collector.

Balance Process Load gebruikt gecumuleerde aantallen items om grenzen te kiezen tussen hele
apparaten op volgorde van apparaat-ID. Het splitst één apparaat niet en garandeert geen gelijke
aantallen items, en het aantal items staat niet gelijk aan uitvoeringstijd. Vergelijk de timing
per proces voor en na het inschakelen ervan op een geïsoleerde representatieve werklast.

## De PHP-collector vergeleken met de C-collector

De PHP-collector, `cmd.php`, wordt meegeleverd met de applicatie. Kadupul is van plan een
Spine-fork te onderhouden, maar de bronlocatie en gevalideerde builds daarvan zijn nog niet
gedocumenteerd. Gebruik PHP totdat dat bewijs beschikbaar is. De onderstaande Spine-vergelijkingen,
thread-instellingen en commando's beschrijven overgenomen gedrag, geen beschikbare of ondersteunde
Kadupul-implementatie.

| | PHP-collector | Spine |
|---|---|---|
| Parallellisme | Alleen processen | Processen en threads |
| Thread-instelling | Geforceerd op 1 ongeacht configuratie | Gehonoreerd |
| Scriptserver | Eén per proces, niet configureerbaar | 1 tot 15 per proces, configureerbaar |
| Script-time-out | Niet toegepast | Toegepast, standaard 25 seconden |
| Installatie | Meegeleverd met de code | Geplande fork; geen gevalideerde Kadupul-build gedocumenteerd |

Het geforceerde aantal threads verdient een duidelijke toelichting: als de collector is ingesteld op
de PHP-collector, wordt de runtime-threadvariabele op 1 gezet; dit overschrijft niet de opgeslagen
thread-instelling van de collector. Het schalen van de PHP-collector kan meer processen vereisen,
en het advies in de broncode is om op of onder tweemaal het aantal CPU-kernen te blijven.

Spine-configuratie en commandogedrag vereisen validatie tegen de exacte binary die wordt geëvalueerd.
De broncode van de PHP-applicatie alleen bepaalt niet de configuratiezoekvolgorde, het threadgedrag
of de neveneffecten.

Overgenomen voorbeelden voor een geïsoleerde Spine-evaluatie, geen gevalideerde Kadupul-commando's:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` is bedoeld om schrijfacties voor resultaten te vermijden. Het maakt nog steeds contact
met apparaten en voert verzamelscripts uit; valideer de neveneffecten eerst in een geïsoleerde test.

## Databaseverbindingen

Threads zijn niet gratis. Elke spine-thread houdt zijn eigen databaseverbinding vast, en dat
geldt ook voor elke scriptserver.

```
estimated worker connections = processes * (threads + script_servers)
```

Dit is de schatting in de helptekst van de applicatie-instellingen, geen gemeten bovengrens.
Tel dit op over verzamelaars en voeg capaciteit toe voor poller-moederprocessen, webverzoeken,
onderhoud en andere clients. Meet daadwerkelijke piekverbindingen en geweigerde verbindingen
voordat u de databaselimiet kiest; het verhogen daarvan verbruikt ook resources.

Uitputting van verbindingen kan ontbrekende metingen veroorzaken, maar roterende gaten zijn
geen unieke diagnose. Bevestig dit aan de hand van meetgegevens over databaseverbindingen en
applicatiefouten.

## Uitgestelde RRD-schrijfacties

Er is een modus die voorkomt dat de poller bij elke ronde naar RRD-bestanden schrijft. Resultaten
verzamelen zich in plaats daarvan in een databasetabel en worden gebundeld weggeschreven, hetzij
op een timer of wanneer een grafiek om het bestand vraagt. Dit ruilt een groot aantal kleine
schrijfacties in voor een klein aantal grote.

Twee feiten die operationeel van belang zijn:

- Het is vereist wanneer u externe gegevensverzamelaars heeft. Dit is geen advies, het is
  een voorwaarde die de software stelt.
- De buffertabel is persistent en niet in-memory, dus niet-weggeschreven metingen overleven
  een herstart. Ze betekenen ook dat uw RRD-bestanden achterlopen op uw database. Zie
  [Back-up en herstel](/nl/guides/back-up-and-restore/) voordat u een snapshot maakt.

De centrale actieve wachtrij `poller_output` is in deze revisie eveneens InnoDB. De
opslag-preflight weigert een MEMORY-wachtrij; het verhogen van de limiet voor heap-tabellen lost
die weigering niet op. Converteer met gestopte producenten en een behouden, passende back-up
een overgenomen ongeschikte wachtrij expliciet, en controleer vervolgens de opslag onder elk serviceaccount:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Dit zijn afzonderlijke bewerkingen. Behoud openstaande rijen en bewaak de schijfruimte van de
database en de leeftijd van de wachtrij, evenals het aantal rijen. Zie [Veilig upgraden](/nl/guides/upgrade-safely/)
voor wachtrijselectie, vertrouwenscontroles voor serviceaccounts en herstartvereisten.

## Wanneer overstappen op externe verzamelaars

Een externe gegevensverzamelaar is een tweede machine die dezelfde code draait met een andere
verzamelaar-ID, een subset van apparaten pollt en resultaten terugschrijft naar de centrale database.

Stap over op een externe verzamelaar wanneer het knelpunt aan de verzamelende kant ligt en niet
aan de opslagkant:

- De CPU van de poller-host is verzadigd tijdens een ronde en inactief tussen rondes.
- Round-trip-latentie naar een groep apparaten domineert de ronde, en die groep bevindt zich
  achter één enkele verbinding.
- Een locatie bevindt zich aan het verre uiteinde van een WAN waarover u niet wilt pollen.
- U heeft verzameling op een geïsoleerde locatie nodig en heeft offline buffering en herstel
  voor die verzamelaar gevalideerd voordat u erop vertrouwt.

Externe verzamelaars nemen de centrale database- of RRD-schrijflimieten niet weg. Meet de
centrale verwerkings- en flushcapaciteit voordat u de verzameldoorvoer verhoogt; extra producenten
kunnen een bestaande achterstand vergroten.

Elke verzamelaar heeft zijn eigen proces- en thread-aantallen, zijn eigen database-inloggegevens
en een synchronisatie-interval, dat standaard twee uur is. Er is een opdrachtregelprogramma om een
volledige synchronisatie af te dwingen in plaats van te wachten.

De centrale installatie kan de website- en plugincode repliceren naar externe verzamelaars zodat
ze zichzelf bijwerken. Die replicatie kan worden uitgeschakeld als u code op een andere manier implementeert.

## Welke limiet heeft u bereikt

Gebruik deze tabel om hypothesen te vormen en verifieer deze vervolgens met logboeken en metingen.
Meerdere limieten kunnen gelijktijdig optreden. Spine-opties blijven hier ongevalideerd.

| Waarneming | Limiet | Wat te wijzigen |
|---|---|---|
| Waarschuwing dat starter niet synchroon loopt, poller verder snel | Planningsvertraging, eerdere uitloop of host-onderbreking | Startgeschiedenis en processtatus inspecteren |
| Uitvoeringstijd gelijkmatig, één apparaat altijd te laat | Trage reacties, zware scripts of geconcentreerd werk | Meet invoermethoden en bekijk time-out-/herhaallogica |
| Uitvoeringstijd schaalt met aantal apparaten, CPU verzadigd | CPU-druk op de collector | Meet of meer processen helpen; overweeg plaatsing van de collector |
| Uitvoeringstijd schaalt met aantal apparaten, CPU inactief | Wachten op netwerk, script of database | Meet wachtoorzaken voordat u de gelijktijdigheid wijzigt |
| Ontbrekende metingen bij een wisselende groep apparaten | Verbindingen, time-outs of andere verzamelfouten | Controleer fouten, verbindingsstatistieken en behouden wachtrijen |
| Uitvoeringstijd prima, RRD-schrijfacties traag, schijf bezet | Opslag | Uitgestelde RRD-schrijfacties of snellere schijf |
| Alles traag inclusief de webinterface | Database | Bufferpoolgrootte, daarna de databasehost aanpassen |

Twee valkuilen die het vermelden waard zijn.

**Het wijzigen van het basisinterval is niet hetzelfde als het wijzigen van elke gegevensbronstap.**
Breng profielen, gecachte itemstappen en RRD-heartbeat-/stapdefinities met elkaar in overeenstemming.
Het opnieuw opbouwen van de cache past bestaande RRD-bestanden niet aan. Zie
[Gegevensretentie](/nl/guides/manage-data-retention/) en
[Tijd en intervallen](/nl/concepts/time-and-intervals/).

**Een sneller interval vermenigvuldigt alles.** Van 300 seconden naar 60 gaan maakt het werk
niet vijf keer goedkoper. Bronnen die voor die snellere cadans zijn geconfigureerd, worden vaker
verzameld; bronnen die langere stappen behouden, hoeven niet bij elke basisronde te draaien. Meet
de resulterende belasting in plaats van aan te nemen dat elke ronde evenveel werk inhoudt.
