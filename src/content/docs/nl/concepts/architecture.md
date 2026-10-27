---
title: Architectuur
description: De vier bewegende onderdelen, en welke gewoonlijk de oorzaak is van problemen.
sidebar:
  order: 1
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
---

:::caution[Geërfd gedrag van RRDtool-proxy]
Implementatie van de RRDtool-proxy wordt niet ondersteund in Kadupul. Gebruik lokale RRDtool-opslag
(`storage_location = 0`). Proxy-instellingen, protocolbeschrijvingen en werkstromen
op deze pagina documenteren overgeërfd gedrag, geen ondersteunde implementatie of migratiepad.
Zie [RRDtool-proxy](/nl/reference/rrdproxy/).
:::

De webapplicatie, database, geplande gegevensverzameling en RRD-opslag van Kadupul hebben
verschillende taken, maar hun uitvoeringspaden overlappen elkaar. Weten welke bewerking mislukte
helpt een onderzoek te verfijnen; een werkende interface bewijst niet dat de gegevensverzameling werkt.

**De webinterface** is een PHP-applicatie. Deze beheert de configuratie en genereert of
serveert gecachete grafieken. Sommige webacties activeren ook gegevensverzameling, zoals realtime
grafiekverzoeken, en normale grafiekverzoeken kunnen openstaande RRD-updates activeren.

**De database** bevat configuratie, machtigingen, operationele status, de poller-cache
en meetwachtrijen. Verzamelde waarden kunnen daar blijven staan in afwachting van een RRD-schrijfactie
of een nieuwe poging; het is niet alleen een configuratieopslag.

**De poller** coördineert gepland werk en onderliggende collector-processen. Resultaten passeren
databasewachtrijen voordat de reguliere of uitgestelde writer RRD-bestanden bijwerkt.

**De RRD-bestanden** bevatten begrensde historische tijdreeksen. Een gegevensbron heeft gewoonlijk één RRD
die de bijbehorende velden bevat; het maken van grafieken kan bronnen hergebruiken, en het aanmaken van metagegevens
garandeert niet dat het bestand al bestaat.

## De grenzen

| Grens | Wat deze passeert | Vervoerd door |
|---|---|---|
| Interface naar database | Configuratie, sessies, autorisatie, gecachet werk en operationele gegevens | SQL; de database kan extern zijn |
| Interface naar bestanden | Grafiekuitlezingen, gecachete afbeeldingen en in aanmerking komende RRD-updates of -creaties op aanvraag | Bestandssysteem en RRDtool |
| Poller naar database | Werklijsten, verzamelde waarden, vastgehouden wachtrijen, status en aftellingen | SQL |
| Gegevensverzameling naar apparaten | SNMP, verzamelingsscripts en bereikbaarheidscontroles | Netwerk of lokale opdrachten; door web geactiveerde verzameling is ook mogelijk |
| Writer naar bestanden | Gegroepeerde metingen, mogelijk meerdere tijdstempels per update | RRDtool-opdrachten en bevestigde pipes |
| Databaseserver naar RRD-bestanden | Geen directe RRD-update in het normale applicatiepad | Applicatiecode van de writer coördineert de twee opslaglocaties |

Databaserialen koppelen een gegevensbron aan een apparaat en het geconfigureerde bestandspad.
RRDtool-bestanden beschrijven reeksen en archieven; ze vervangen die applicatiekoppeling niet.
Netwerkverkeer is niet beperkt tot apparaat-polling: databaseverbindingen, externe collectors
en andere geconfigureerde integraties kunnen ook hosts overschrijden.

Maak consistent back-ups van de databasestatus, openstaande metingen en RRD-bestanden. Een herstel
van alleen de database herstelt de historische RRD-inhoud niet, en een herstel van alleen bestanden
laat configuratie en niet-weggeschreven metingen weg. Bestanden verplaatsen zonder paden aan te passen
kan fouten door ontbrekende bestanden of vastgehouden schrijfacties veroorzaken; het is geen
gegarandeerd stille verzamelingsfout. Zie [Back-up maken en herstellen](/nl/guides/back-up-and-restore/) en
[Migreren naar nieuwe hardware](/nl/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Waarom langetermijngeschiedenis RRD-bestanden gebruikt

Langetermijngrafiekgeschiedenis wordt opgeslagen in RRD's, maar meetwachtrijen bevinden zich in de database.
De normale in-flight wachtrij is InnoDB in deze revisie, en uitgestelde schrijfbewerkingen houden
metingen vast in Boost-tabellen. Mislukte schrijfbewerkingen of vertraagde externe levering kunnen die
wachtrijen laten groeien. Zie [Schrijfoperaties met hoog volume](/nl/concepts/high-volume-writes/).

Een RRD wijst een gedefinieerd aantal rijen toe op geselecteerde resoluties. Normale updates
hergebruiken die ruimte in plaats van geschiedenis oneindig toe te voegen. De bestandsgrootte is begrensd
voor een ongewijzigde indeling; gegevensbronnen toevoegen, indelingen wijzigen, herstelkopieën bewaren
of wachtrijen opbouwen verhoogt nog steeds de totale opslagvereisten.

De afweging is vooraf gekozen retentie. Zodra fijnmazige geschiedenis is verlopen of
geconsolideerd, kan een latere indelingswijziging de weggegooide details niet opnieuw creëren. Zie
[Gegevensbronnen en round-robin archieven](/nl/concepts/data-sources-and-rras/).

Configuratie en operationele status gebruiken de database omdat de applicatie gedeelde updates
en relationele query's nodig heeft. Dit betekent niet dat elke relatie wordt afgedwongen door een
foreign key in de database, of dat een rijenopslag noodzakelijkerwijs eeuwig groeit;
het beschrijft de taakverdeling van deze applicatie.

## Twee paden die twee onderdelen delen

Een normaal pagina- of grafiekverzoek volgt doorgaans dit pad:

1. Een browser stuurt een verzoek; PHP laadt configuratie en maakt verbinding met de database.
2. Het verzoek past authenticatie en de relevante realm-/objectautorisatie toe.
3. Console-acties lezen of werken configuratie bij en kunnen extra werk activeren.
4. Een grafiekverzoek kan openstaande Boost-metingen en een afbeeldingscache controleren, of
   een RRDtool-opdracht samenstellen en de geconfigureerde bestanden lezen. Zie
   [Hoe grafieken worden getekend](/nl/concepts/how-graphs-are-drawn/).
5. Realtime grafiekverzoeken kunnen de realtime collector starten en afzonderlijke tijdelijke gegevens
   gebruiken. Een vlakke grafiek alleen bewijst geen leeg bestand of succesvolle
   verzameling en weergave.

Een geplande poll volgt gewoonlijk dit pad:

1. De scheduler start de poller, die de inschakelstatus, timing en opslag controleert.
2. Deze selecteert taken die aan de beurt zijn uit de poller-cache en start onderliggende collectors.
3. Onderliggende processen bevragen apparaten of voeren verzamelingsscripts uit en plaatsen resultaten in de database.
4. De toepasselijke writer verwerkt gegroepeerde metingen, gebruikt uitgestelde wachtrijen indien
   geconfigureerd en behoudt opnieuw probeerbare fouten.
5. Operationele status en planningsstatus worden bijgewerkt in de database.

Zie [Levenscyclus van de poller](/nl/reference/poller-lifecycle/) voor volgorde en foutafhandeling.
Deze paden delen database- en opslagbronnen en kunnen daarom concurreren. De webserver herstarten
herstelt een afzonderlijk geplande poller niet, maar webverzoeken kunnen deelnemen aan verzameling
en schrijven; diagnosticeer het daadwerkelijk falende proces.

## Wat onder welke gebruiker draait

| Proces | Draait als | Gestart door |
|---|---|---|
| PHP-webapplicatie | Webserver- of PHP-FPM pool-account | Webserver |
| Geplande poller | Geconfigureerd account van de scheduler | cron, Taakplanner of geconfigureerde service |
| RRDtool | Erft gewoonlijk het account van het startende proces | Web-, poller- of onderhoudspad |
| Verzamelingsscripts | Erven gewoonlijk het account van hun collector | Geplande of door web geactiveerde verzameling |

Alle deelnemende writer-accounts hebben passende toegang tot de geconfigureerde opslag nodig.
Het aanmaken van een normale gegevensbron schrijft metagegevens; de RRD kan later worden aangemaakt wanneer een
writer deze nodig heeft. Een ontbrekend bestand kan erop wijzen dat de gegevensverzameling dit punt nog niet
heeft bereikt, evenals een pad-, vertrouwens-, machtigings- of creatiefout.

Sommige creatiepaden die als root worden uitgevoerd proberen de eigenaar en groep van de RRA-directory toe te passen.
Deze pogingen kunnen mislukken en fouten loggen; ze zijn geen vervanging voor het correct configureren
van service-accounts. Niet-root eigendom volgt de regels van het besturingssysteem, inclusief overname
van directorygroepen en ACL's. Valideer opslagmachtigingen en numerieke vertrouwde UID/GID-instellingen
onder elk web- en poller-writer-account. Zie [Veilig upgraden](/nl/guides/upgrade-safely/).

De beoordeelde PHP ICMP-implementatie roept het ping-hulpprogramma van het besturingssysteem aan.
Het vermogen om tests te verzenden hangt af van dat hulpprogramma en OS-beleid; de aanwezigheid van
verouderde effectieve-UID helpers betekent niet dat elke ICMP-test PHP verheft naar root.
Voer de applicatie niet uit als root enkel om ping mogelijk te maken. Controleer de werkelijke opdracht,
het account en de foutuitvoer; TCP- of UDP-controles hebben verschillende bereikbaarheidssemantiek.

## De werklijst is vooraf berekend

De poller-cache slaat opgelost verzamelingswerk op, zodat elke run niet elke opdracht hoeft af te leiden
uit sjabloonrelaties. Configuratiebewerkingen kunnen getroffen vermeldingen opnieuw opbouwen; expliciete
hulpmiddelen voor herbouw zijn beschikbaar wanneer nodig.

Wijzigingen in gecachete velden moeten die vermeldingen bereiken voordat gegevensverzameling ze gebruikt.
Andere instellingen worden afzonderlijk gelezen, dus niet elke configuratiewijziging vereist een handmatige
cache-herbouw. Inspecteer cache-inhoud, verzamelingsfouten en externe replicatiestatus in plaats van
één oorzaak aan te nemen. Zie [De poller-cache](/nl/concepts/the-poller-cache/) en
[Externe gegevensverzameling](/nl/concepts/remote-data-collection/).

## Waar dingen gewoonlijk misgaan

| Symptoom | Nuttige controles |
|---|---|
| Interface werkt, grafieken zijn vlak | Scheduler draait, verzamelingsfouten, wachtrijen, versheid van metingen en grafiekvenster |
| Poller draait, bestanden gaan niet vooruit | Writer-bevestiging/-fouten, opslagvertrouwen en -machtigingen, uitgestelde achterstand |
| Eén gegevensbron is vlak | Apparaatrespons, cache-rij, bestandskoppeling, onbekende metingen en tekenexpressies |
| Configuratiewijziging lijkt geen effect te hebben | Opslagresultaat, sjabloonoverschrijvingen, getroffen cache-vermeldingen en replicatie |
| Regelmatige gaten | Timing, heartbeat, time-outs, apparaatbeschikbaarheid en schrijffouten |
| Onverwachte grafiekvorm | Gegenereerde opdracht, CDEF/CF-keuzes, werkelijke bestandsgegevens, afbeeldingscache en koppeling |
| Poortgeschiedenis lijkt gekoppeld aan andere interface | Query-identiteit, hernummering en herindexatieresultaten |
| Account ziet console maar geen grafieken | Grafiekpagina-realm, objectautorisatie en gevraagde grafiekidentiteit |
| Collectors verschillen | Toewijzing, gerepliceerde configuratie, lokale overschrijvingen en verbindingsstatus |
| Alles is traag | Databasewachttijden, writer-/opslagconflicten, collector-looptijd en webbelasting |
| Metagegevens van gegevensbron bestaan maar bestand niet | Eerste verzameling/schrijfactie, geconfigureerd pad, vertrouwens- en creatiefouten |

Dit zijn uitgangspunten, geen diagnoses. Volg het bewijs over de relevante grens en controleer
het resultaat na een wijziging. Zie [Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/).
