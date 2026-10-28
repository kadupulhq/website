---
title: Pieken uit gegevens verwijderen
description: Bekijk een voorbeeld van piekcorrecties, bewaar herstelkopieën en verifieer wijzigingen in bewaarde RRD-metingen.
banner:
  content: Kadupul is pre-alpha. Valideer deze procedures in een geïsoleerde testinstallatie.
sidebar:
  order: 19
---

:::caution[Valideer voor gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat u
erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

:::danger[Dit herschrijft de geschiedenis; herstel vereist een back-up]
Piekverwijdering dumpt het archief, bewerkt waarden, herstelt een tijdelijk nevenbestand
en vervangt het origineel na validatie. Er is geen automatische ongedaanmaking. Bewaar
en controleer een herstelkopie, voer eerst `--dryrun` uit en bevestig de doelmetingen
voordat u een wijziging definitief maakt.
:::

Een piek betekent hier één of twee meetwaarden die zoveel groter zijn dan alles eromheen
dat de verticale as zich daarop schaalt en de rest van de grafiek afvlakt tegen de
nullijn. De meting is onjuist en verstoort het beeld ernstig.

## Waar ze vandaan komen

De meeste pieken op een gegevensbron op basis van tellers zijn rekenkundig van aard, geen echte metingen.
Een teller-gegevensbron slaat een snelheid op die wordt berekend uit het verschil tussen twee
metingen. Alles wat de tweede meting veel groter maakt dan de eerste,
in verhouding tot de tussentijd, kan een foutieve snelheid opleveren. Teller-resets,
onjuiste verwerking van telleroverschrijdingen, een interface-herindexering die metingen naar de verkeerde
gegevensbron verplaatst, of tijdstempelfouten kunnen dit veroorzaken. Een normale telleroverschrijding is
op zichzelf geen bewijs van een ondeugdelijke meting; verifieer het type gegevensbron en de invoermetingen.

Zie [Gegevensbronnen en RRA's](/nl/concepts/data-sources-and-rras/) voor hoe de snelheid wordt
berekend.

Verhelp de oorzaak waar mogelijk. Het verwijderen van de piek is cosmetisch; het voorkomt
de volgende piek niet.

## De vier methoden

Het gereedschap werkt op het gehele bestand: het dumpt elk archief in het RRD-bestand, bepaalt
welke waarden moeten worden vervangen en herstelt het resultaat.

| Methode | Wat het selecteert | Heeft een venster nodig |
|---|---|---|
| `stddev` | Waarden die meer dan N standaarddeviaties van het gemiddelde afliggen | Nee |
| `variance` | Waarden die meer dan N procent boven het gemiddelde liggen nadat uitbijters zijn verwijderd | Nee |
| `float` | Alles binnen een opgegeven tijdsvenster | Ja |
| `fill` | Onbekende waarden en nulwaarden binnen een opgegeven tijdsvenster | Ja |

`stddev` en `variance` zoeken zelfstandig. `float` en `fill` doen wat u hen opdraagt binnen een
bereik dat u opgeeft, en beide mislukken direct als u geen start en einde specificeert.

`fill` is niet beperkt tot ontbrekende gegevens: het kan gemeten nullen vervangen door
waarden ongelijk aan nul. Gebruik het niet op een bereik dat geldige inactieve of nulmetingen
bevat, tenzij die wijziging opzettelijk is.

De variantiemethode verwijdert de hoogste en laagste N metingen voordat het gemiddelde
wordt berekend waarmee wordt vergeleken, waarbij N de instelling voor uitbijters is. Dat zorgt ervoor
dat de piek de drempelwaarde die hem moet vangen niet zelf opdrijft.

Wat wordt geselecteerd, wordt vervangen, en er zijn drie vervangingen mogelijk.

| Vervanging | Resultaat |
|---|---|
| `last` | De laatst bekende goede waarde. De standaardwaarde. |
| `avg` | Een berekend gemiddelde voor het veld/archief; de berekening hangt af van de methode. |
| `nan` | Onbekend voor statistische methoden; zie de venstermethode-beperking hieronder. |

Onbekend legt vast dat er geen bruikbare meting beschikbaar is. `last` en `avg`
vervangen waarden die voor iemand die de grafiek later leest als gemeten kunnen overkomen.
Kies de vervanging bewust en controleer het werkelijke opgeslagen resultaat.

**Venstermethoden met NaN:** met `--avgnan=nan` vervangt `float` elke bekende waarde
in het venster door onbekend, en `fill` vervangt nul of niet-numerieke waarden in het
venster door onbekend. Statistische methoden met optionele tijdsgrenzen vervangen alleen
gedetecteerde uitbijters, dus ze zijn niet gelijk aan het leegmaken van een heel venster.

## Voorbeeldweergave, daarna toepassen

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Een dry run dumpt de RRD en analyseert deze zonder het actieve bestand te herschrijven. Er is nog steeds
een bruikbare werkmap en onderhoudstoegang nodig. Een voorbeeldweergave reserveert
het bestand niet tot een latere definitieve uitvoering: nieuwe metingen of gewijzigde opties kunnen het
resultaat veranderen. Het venstervoorbeeld gebruikt nog steeds statistische selectie; het verwijdert niet
elke waarde in dat venster.

De tijdargumenten accepteren een Unix-tijdstempel of een datumtekenreeks. Een tekenreeks die
niet kan worden geparseerd, wordt afgewezen vóór het herschrijven. Gebruik Unix-tijdstempels wanneer
tijdzone-interpretatie anders dubbelzinnig zou zijn.

## Wat er daadwerkelijk met het bestand gebeurt

Goed om te weten voordat u het uitvoert op iets wat belangrijk voor u is.

1. Het bestand wordt naar XML gedumpt in de back-upmap.
2. Opmerkingen worden verwijderd en elk archief wordt gescand op de statistieken.
3. Geselecteerde waarden worden in de XML vervangen.
4. Het originele bestand wordt naar de back-upmap gekopieerd.
5. De bewerkte XML wordt hersteld naar een privé-nevenbestand, gevalideerd en hernoemd over
   het origineel met behoud van eigenaar, groep en modus.

Stap 4 is het vangnet en is niet optioneel: als het kopiëren mislukt, wordt het herstel
niet uitgevoerd. Die kopie, en niet een optie op de opdrachtregel, is waar u vanuit zou
herstellen. De naam is gebaseerd op het origineel en kan een uniek achtervoegsel krijgen om
overschrijven van een bestaand bestand te voorkomen. `--backup` vraagt daarnaast om een permanente
herstelsnapshot. Lees de gerapporteerde paden en verifieer de kopieën voordat u erop
vertrouwt.

De bewerking vereist vertrouwde lokale POSIX-mappen en onderhoudsvergrendeling;
alleen schrijfbare modusbits zijn onvoldoende. Niet-ondersteunde opslag en een
geconfigureerd rrdcached-eindpunt worden geweigerd. Stop externe schrijvers, die niet deelnemen
aan het vergrendelingsprotocol van Kadupul. Voer de opdracht uit als het beoogde opslagbeherende serviceaccount.
Zie [installatievereisten](/nl/reference/requirements/) voor opslagtoegang.

## Instellingen die de standaardwaarden bepalen

Opdrachtregelargumenten hebben voorrang. Alles wat u weglaat, is afkomstig van de
systeeminstellingen, en instellingen per gebruiker overschrijven de systeeminstellingen wanneer het hulpprogramma
vanuit de interface wordt uitgevoerd.

| Instelling | Standaard | Wat het doet |
|---|---|---|
| Removal method | Variance with outliers removed | Welke methode moet worden gebruikt |
| Replacement method | Last known good | Wat een verwijderde waarde vervangt |
| Number of standard deviations | 10 | Drempelwaarde voor de `stddev`-methode |
| Variance percentage | 1000 | Drempelwaarde voor de `variance`-methode |
| Variance number of outliers | 5 | Hoge en lage metingen die vóór middeling worden weggelaten |
| Max kills per RRA | 5 | Beoogd maximum; momenteel niet betrouwbaar afgedwongen |
| RRDfile backup directory | `cache/spikekill/` under the install | Waar de dump en de kopie naartoe gaan |
| Backup retention | 3 months | Hoe lang kopieën worden bewaard |

Er is ook een batchmodus: een schema (elke 6, 12, 24 of 48 uur), een basistijd
en een lijst met grafieksjablonen om op te handelen. Batchmodus staat standaard uit.
Inschakelen betekent dat het systeem archieven bewerkt zonder dat iemand het
resultaat bekijkt. Beperk de sjabloonlijst strikt als u deze al inschakelt.

## Valkuilen

**De standaarddrempels zijn bewust ruim gekozen.** Tien standaarddeviaties en een
variantie van 1000 procent zijn breed. Een run die geen pieken meldt, is waarschijnlijk niet
mislukt; het heeft u verteld dat de waarden binnen de door u gevraagde marge vallen. Verklein de
drempelwaarde in plaats van willekeurig van methode te wisselen.

**Max kills per RRA beperkt alleen de statistische methoden.** Voor `stddev` en
`variance` dekt het aantal alle gegevensbronnen in één archief en wordt het gereset bij het volgende
archief. De venstermethoden `float` en `fill` vervangen elke overeenkomende waarde in het
venster. Het samenvattende aantal omvat ook NaN-vervangingen. Bekijk het volledige voorbeeld
en gebruik een smal tijdsvenster.

**Een geconsolideerde waarde kan niet worden hersteld.** Oudere archieven bevatten één waarde per
periode, reeds gemiddeld. Het vervangen van die waarde herstelt niet de werkelijke
meting voor die periode; het plaatst een plausibele vervanger. Hoe verder u teruggaat,
des te meer de correctie een schatting wordt.

**De back-upmap moet geconfigureerd en vertrouwd zijn.** De dump- en
herstelkopieën gaan daarheen. Ontbrekende, onveilige of niet-verifieerbare mappen worden geweigerd; maak een
map niet voor iedereen schrijfbaar om een fout te omzeilen.

**Houd een eigen wijzigingenoverzicht bij naast de applicatielogboeken.** Noteer operator,
opdracht, tijdsbereik, back-uppaden en controles vooraf en achteraf. Alleen samenvattende tellingen
zijn onvoldoende bewijs van wat er is gewijzigd.

**Voer de opdracht uit als het beoogde serviceaccount.** Een succesvolle vervanging behoudt
bestandseigendom en modus. Root is geen kortere route om de mapvertrouwenscontroles te omzeilen;
controleer of normale polling het resultaat nog steeds kan bijwerken.

**Het verwijderen van de piek herstelt de grafiek niet als de gegevensbron onjuist is.** Als een
interface-herindexering waarden naar de verkeerde gegevensbron heeft verplaatst, is de piek een
symptoom. Zie [Ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/)
voordat u begint met het bewerken van archieven.
