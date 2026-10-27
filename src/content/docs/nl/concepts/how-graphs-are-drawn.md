---
title: Hoe grafieken worden getekend
description: Het pad van een round-robin-bestand naar een gerenderde afbeelding en waarom dezelfde opgeslagen getallen heel verschillende afbeeldingen kunnen opleveren.
sidebar:
  order: 4
banner:
  content: Kadupul bevindt zich in de pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling, nog te controleren door iemand die de taal vloeiend beheerst.
---

Een normaal afbeeldingsverzoek kan een RRDtool-opdracht samenstellen uit de grafiekconfiguratie en de gerefereerde RRD-bestanden lezen. Een geldige gecachte afbeelding kan het verzoek ook afhandelen en Boost-verwerking op aanvraag kan bestanden vóór het renderen bijwerken. Zie [Schrijfacties met hoog volume](/nl/concepts/high-volume-writes/) voor versheidslimieten.

## De volgorde van bewerkingen

Voor een verzoek dat overgaat tot het genereren van opdrachten:

1. Bepaal het gevraagde tijdvenster en de grafiekconfiguratie.
2. Schat de resolutie uit databaseprofielen en selecteer consolidatiefuncties.
3. Genereer ontdubbelde `DEF`-referenties voor de vereiste velden en functies.
4. Genereer gerefereerde `CDEF`- en `VDEF`-expressies.
5. Genereer teken- en afdrukitems in geconfigureerde volgorde, met toepasselijke opties en plug-in-wijzigingen.
6. Laat RRDtool de daadwerkelijke bestanden lezen en het resultaat renderen.

## Een archief kiezen

Kadupul raadpleegt databaseprofielrijen bij het berekenen van archiefbereiken en grafiekopties. De automatische schatting houdt rekening met stapgrootte maal stappen maal rijen, gevraagde dekking en aantal archiefstappen; expliciete archiefselectie volgt een apart pad. Deze profielberekeningen inspecteren niet elk feitelijk archief in elk bestand en kunnen na een profielwijziging afwijken van bestaande bestanden.

De gegenereerde `DEF` specificeert het bestand, de gegevensbronnaam en de consolidatiefunctie. RRDtool kiest een beschikbaar archief met een passende resolutie en kan gegevens verder consolideren voor de breedte en het tijdvenster van de grafiek. De schatting van de toepassing is geen garantie dat een specifiek fysiek archief wordt gelezen. Zie de upstream [RRDtool-documentatie over datadefinities](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Het verbreden van een venster of het wijzigen van de afbeeldingsbreedte kan de weergegeven resolutie veranderen. Een grovere reeks op basis van gemiddelden kan een korte piek verbergen, ook al bevat een fijner archief deze nog steeds. Vergelijk de werkelijke bestandsindeling en opdracht, niet alleen het profiel. Zie [Gegevensbronnen en round-robin archieven](/nl/concepts/data-sources-and-rras/).

Wanneer de aanroeper geen eindtijd opgeeft, gebruikt de normale renderer aanvankelijk het tijdsverschil van de laatste run van de hoofdpoller ten opzichte van nu, met terugval op het polling-interval wanneer die waarde ontbreekt of in de toekomst ligt. Latere code heeft ook een terugval op geconsolideerde intervallen, maar dat is geen universele standaard. Een expliciete eindtijd overschrijft deze initialisatie; een grafiek die vóór nu eindigt bewijst op zichzelf niet het gekozen archief noch dat de nieuwste metingen zijn geschreven.

## De items

Een grafiek is een geordende lijst met items. Het genereren van opdrachten kan items weglaten, definities hergebruiken of een item uitbreiden naar meerdere instructies. De tekenvolgorde is voor meer van belang dan alleen de lay-out.

| Item | Tekent | Opmerkingen |
|---|---|---|
| `AREA` | Gevuld gebied van de as tot de waarde | Latere vlakken tekenen over eerdere heen |
| `STACK` | Gevuld gebied beginnend aan de bovenkant van het vorige item | Uitgevoerd als een vlak met een stack-vlag |
| `LINE1`, `LINE2`, `LINE3` | Een lijn van één, twee of drie pixels breed | Kan onderbroken zijn |
| `LINE:STACK` | Een lijn getekend bovenop het lopende stapeltotaal | |
| `TICK` | Markeringen langs een rand van het diagram | Handig voor status, niet voor grootte |
| `GPRINT` | Niets. Drukt één getal af in de legende | |
| `COMMENT` | Niets. Drukt letterlijke legendetekst af | Lange opmerkingen lopen door |
| `HRULE` | Een horizontale lijn op een vaste waarde | |
| `VRULE` | Een verticale lijn op een vast tijdstip | |
| `TEXTALIGN` | Niets. Stelt de uitlijning in voor de volgende legendetekst | |

De volledige lijst, inclusief welke configuratiekolommen van toepassing zijn op welk type, staat in [Grafiekitems](/nl/reference/graph-items/).

`AREA` en `STACK` vormen het paar waar mensen zich in vergissen. Een vlak begint bij nul, dus twee vlakken overlappen elkaar en het hogere verbergt het lagere. Een stapel begint waar het vorige item eindigde, dus de zichtbare hoogte van de tweede band is zijn eigen waarde, maar de bovenrand is het totaal. Lees een gestapelde grafiek als een bandhoogte, niet als een positie op de y-as, anders lees je elke reeks behalve de onderste verkeerd af.

`HRULE` accepteert een waarde die sjabloonsubstituties kan bevatten. Niet-numerieke tekens worden uit het resultaat verwijderd en als er niets numerieks overblijft, wordt de lijn op nul getekend in plaats van het renderen af te breken. Een regel op nul kan opzettelijk zijn of wijzen op een mislukte substitutie. Inspecteer de opgeloste opdracht voordat je oordeelt. Het numerieke filter kan ook tekenreeksen wijzigen die eenheden of niet-ondersteunde getalnotaties bevatten.

`VRULE` accepteert een Unix-tijdstempel of een `hours:minutes`-paar. Een negatieve component voor uren wordt geïnterpreteerd als een verschuiving terug vanaf nu in plaats van een kloktijd.

## Twee taken, één woord

Consolidatiefunctie wordt voor twee verschillende zaken gebruikt en dezelfde vier namen, `AVERAGE`, `MIN`, `MAX` en `LAST`, verschijnen op beide plaatsen.

De eerste taak is archiefselectie. Een `DEF` benoemt een bestand, een gegevensbron daarin en een consolidatiefunctie. Die functie beperkt de gevraagde archieffamilie. Vraag om `MAX` en RRDtool heeft overeenkomstige opgeslagen consolidatiegegevens nodig, onder voorbehoud van de hieronder beschreven toepassingsterugval en resolutieselectie.

De tweede taak is legende-rekenkunde. Een `GPRINT` reduceert het hele getekende venster tot één afgedrukt getal en de functie bepaalt hoe. Die reductie vindt plaats over de reeds gelezen reeks; het is aggregatie, geen opslag.

Een `GPRINT` die `MAX` toont over een met `AVERAGE` gelezen `DEF` drukt dus de grootste waarde van die gemiddelde reeks af over het gerenderde venster, niet noodzakelijk de grootste ruwe meting. Vijf minuten is slechts een voorbeeld; de effectieve resolutie varieert. Dat zijn verschillende getallen en op een drukke verbinding verschillen ze aanzienlijk. Beide metingen zijn legitiem. Slechts één is waarschijnlijk wat je bedoelde.

## De stille terugval

Voor itemtypen die de beste-functiehelper gebruiken, leest Kadupul de bestandsconsolidatiefuncties en gebruikt de gevraagde indien aanwezig, anders de eerst gerapporteerde. Als er geen worden verkregen voor een geldige lokale gegevensbron, valt de helper terug op AVERAGE. Vaste GPRINT-varianten volgen een apart pad en gebruiken deze helper niet, dus dit is geen universele garantie dat elke ontbrekende functie wordt hersteld.

Een tekenitem dat `MAX` aanvraagt kan daarom uiteindelijk gemiddelden lezen wanneer het bestand alleen AVERAGE-archieven bevat. Controleer de gegenereerde `DEF` en de uitvoer van `rrdtool info`. Archiefonderhoud kan een bestaande indeling wijzigen, maar het toevoegen van een archief kan historische pieken die door eerdere middeling zijn weggegooid niet reconstrueren. Zie [Gegevensretentie beheren](/nl/guides/manage-data-retention/).

## GPRINT leent het archief van zijn buurman

Een gewone `GPRINT` heeft geen eigen archief. Het hergebruikt de consolidatiefunctie van het meest recente overeenkomende `AREA`-, `STACK`-, lijn- of `TICK`-item, gekoppeld op gegevensbronnaam en lokale sjabloonveldidentiteit. Als er geen voorafgaande overeenkomst is, gebruikt het de beste-functiehelper met zijn eigen geconfigureerde functie. Vaste varianten gebruiken hun eigen geconfigureerde functie rechtstreeks.

Dat betekent dat het wijzigen van de volgorde van items in een grafieksjabloon kan veranderen wat een legende rapporteert zonder dat iemand de legende aanraakt. Plaats een `LINE` die `MAX` leest boven het `GPRINT`-blok en overeenkomende legendes kunnen maxima samenvatten. Verplaats deze naar beneden en het eerdere overeenkomende item, of de terugval, bepaalt de invoerreeks. Als een getal in een legende verandert na een niet-gerelateerde sjabloonbewerking, controleer dan eerst de itemvolgorde.

## CDEF's en VDEF's

Beide transformeren gegevens voordat deze worden getekend. Ze zijn niet onderling uitwisselbaar.

| | CDEF | VDEF |
|---|---|---|
| Produceert | Een reeks, één waarde per tijdslot | Een waarde en voor sommige functies een bijbehorende tijd |
| Kan worden getekend als lijn of vlak | Ja | Een scalair kan een constant niveau leveren |
| Opgebouwd uit | Functies, rekenkundige operatoren, andere CDEF's, speciale gegevensbronnen, constanten | Eén functie toegepast op één referentie |
| Nesting | Een CDEF kan verwijzen naar een andere CDEF | Een VDEF mag geen rekenkundige bewerkingen bevatten |

Een CDEF is een stapelexpressie die in omgekeerde Poolse notatie wordt geëvalueerd. De woordenschat is groot en wordt volledig vermeld in [Grafiekitems](/nl/reference/graph-items/): rekenkunde, vergelijkings- en voorwaardelijke operatoren, trigonometrie, aggregatie over gegevensbronnen, stapelbewerkingen en tijdfuncties die een definitie laten weten waar deze zich op de x-as bevindt. `UN` en `UNKN` zijn de moeite waard om vroeg te leren. Het vervangen van onbekende waarden door nul kan visuele gaten voorkomen, maar verbergt ontbrekende metingen; maak die presentatiekeuze expliciet.

CDEF's lezen ook speciale referenties in plaats van een vaste gegevensbronnaam. De ene verwijst naar de gegevensbron van het huidige item, waardoor een enkele CDEF herbruikbaar is voor elk item in een sjabloon. Andere verwijzen naar alle gegevensbronnen in de grafiek, of naar alle soortgelijke, met of zonder duplicaten, waardoor een totaallijn wordt opgebouwd zonder de invoerbronnen bij naam te noemen.

Een VDEF reduceert een reeks tot een scalair: maximum, minimum, gemiddelde, standaarddeviatie, eerste, laatste, totaal, een percentiel of de helling, het snijpunt en de correlatie van een lineaire regressie. RRDtool ondersteunt geen rekenkunde binnen een VDEF, dus wanneer een VDEF een berekende invoer nodig heeft, bouwt Kadupul deze op de CDEF van het item in plaats van op de ruwe gegevensbron. Dat is de bedoelde route voor berekeningen: voer de wiskunde uit in een CDEF en reduceer deze vervolgens in een VDEF.

Een door een VDEF ondersteunde `GPRINT` vereist geen argument voor een consolidatiefunctie: de VDEF heeft de reductie al geleverd. VDEF's kunnen ook scalaire tekenwaarden leveren; RRDtool ondersteunt een door VDEF ondersteunde lijn. Zie de upstream [documentatie over grafiekelementen](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

CSV-export selecteert ondersteunde tekentypen als reekskolommen; legenda-items worden niet geëxporteerd als equivalente kolommen. Tekenitems met een VDEF worden nog steeds weergegeven in de grafiekafbeelding, maar worden weggelaten uit de export, omdat een VDEF een enkele waarde is in plaats van een tijdreeks.

## Waarom dezelfde gegevens er anders uitzien

Alles hieronder verandert de afbeelding zonder een enkele opgeslagen meting te wijzigen.

| Keuze | Effect |
|---|---|
| Vensterlengte en afbeeldingsbreedte | Kan archiefselectie en extra consolidatie veranderen |
| Consolidatiefunctie op de `DEF` | Leest pieken, dalen, gemiddelden of laatste waarden |
| Een ontbrekende consolidatiefunctie | Sommige itempaden vervangen een andere functie; andere kunnen mislukken |
| `AREA` versus `STACK` | Absolute hoogtes versus cumulatieve hoogtes |
| Itemvolgorde | Overtekenen, stapelvolgorde en welk archief een `GPRINT` leent |
| Basis 1000 of 1024 | Wijzigt de aslabels. De waarden zijn identiek |
| Autoschaalmodus, vaste limieten, logaritmische schaal | Wijzigt de y-as, wat verandert hoe groot een verandering oogt |

Wanneer grafieken niet overeenstemmen, vergelijk dan gerenderde opdrachten, werkelijke bestandsidentiteiten en indelingen, cachestatus en de versheid van metingen. Deze presentatiekeuzes zijn nuttige controles, maar sluiten verzamel-, opslag- of toewijzingsfouten niet uit. Zie voor een stapsgewijze handleiding [Problemen met ontbrekende gegevens oplossen](/nl/guides/troubleshoot-missing-data/).
