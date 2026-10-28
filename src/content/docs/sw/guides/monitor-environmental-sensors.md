---
title: Fuatilia vitambuzi vya mazingira
description: Chora grafu ya halijoto, unyevunyevu, mtiririko wa hewa, nguvu na hali ya UPS kupitia SNMP, pata OID sahihi kwenye MIB ya muuzaji, na upe usomaji mipangilio ya grafu inayofaa kipimo badala ya kaunta.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 23
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji iliyothibitishwa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Halijoto, unyevunyevu na nguvu ya papo hapo ni vipimo, kwa kawaida huhifadhiwa kama `GAUGE`. Nishati limbikizi au jumla ya matukio yanaweza kuhitaji aina ya kaunta badala yake. Angalia vitengo vya kila kitu, utambulisho na semantiki kabla ya kuchagua kiolezo.

Angalia kile kinachosafirishwa tayari kabla ya kuandika chochote.

## Kinachosafirishwa

Ufafanuzi nne tu wa maswali ya data huishi katika saraka ya maswali ya mti yenyewe, na hakuna hata moja iliyo ya mazingira.

| Swali la SNMP lililosafirishwa | Inashughulikia |
|---|---|
| `interface.xml` | Violesura vya mtandao |
| `host_disk.xml` | Hifadhi ya Host Resources |
| `net-snmp_disk.xml` | Sehemu zilizotangazwa za UCD |
| `net-snmp_devio.xml` | Kifaa cha kuzuia UCD I/O |

Ufikiaji wa vitambuzi huja kwa njia zingine mbili.

**Maswali ya seva ya hati, yaliyounganishwa katika kifurushi cha kifaa cha Net-SNMP.** Ingiza `install/templates/NetSNMP_Device.xml.gz` ili kusambaza faili zake tatu za XML za swali la lmSensors chini ya `resource/script_server/`. Msaidizi `scripts/ss_netsnmp_lmsensors.php` yupo pia katika ununuzi wa chanzo.

| Swali | Jedwali |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Msaidizi hutumia faharasa, jina na safu wima za kusoma. Maswali huorodheshwa kwenye nambari `sensorDevice`; `sensorName` hutoa jina la kuonyesha ambalo msaidizi hupunguza hadi herufi 18. Majina hayana uthibitisho wa utambulisho wa kipekee wa kitambuzi.

Njia ya kawaida ya `get sensorReading` hurudisha thamani ghafi: milidegrii kwa kitu cha halijoto cha zamani, milivolti kwa volti, na RPM kwa feni. Grafu ya halijoto hutumia CDEF ya `Divide by 1000`. Grafu ya voltage haina CDEF licha ya lebo yake ya Volts, [hitilafu iliyothibitishwa ya kuongeza ukubwa](https://github.com/kadupulhq/kadupul/issues/247).

Njia tofauti ya `query sensorReading` hupima halijoto na voltage, na hujaribu ubadilishaji wa voltage uliosainiwa kwa kutumia nambari isiyo sahihi 4294967294. Inaweza pia [kutoa kosa kwa usomaji usiopatikana](https://github.com/kadupulhq/kadupul/issues/248). Usigundue vitengo vilivyohifadhiwa kutoka kwa tokeo hili la ugunduzi.

Msaidizi bado anatumia safu wima ya zamani ya halijoto `.2.1.3`. Ya sasa [LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt) inapunguza kitu hicho kisicho na saini ili kupendelea safu wima iliyotiwa saini `.2.1.4`; thibitisha usaidizi na tabia ya halijoto hasi kwenye wakala halisi kabla ya kurekebisha kiolezo.

**Vifurushi vya vifaa, vinavyosafirishwa kama kumbukumbu zinazoweza kuingizwa.** Kadhaa hubeba XML yao ya swali na kuiandika kwenye saraka za maswali wakati wa kuagiza. Zile ambazo ni muhimu hapa:

| Kifurushi | Huleta |
|---|---|
| SNMP UPS | Maswali ya laini ya ingizo na pato ya UPS-MIB, pamoja na violezo vya OID vilivyowekwa kwa betri, muda wa kufanya kazi, halijoto na kengele |
| AKCP Device | Maswali ya hati ya halijoto, unyevunyevu, mtiririko wa hewa na vitambuzi vya 4-20 mA |
| APC InfraStruXure PDU | Maswali kwa takwimu za kivunja saketi na awamu |
| APC InfraStruXure InRow CRAC | Maswali ya takwimu za kitengo na kikundi, ikijumuisha halijoto, unyevunyevu, mtiririko wa hewa na kasi ya feni |
| BayTech PDU | Swali la duka na swali la mzunguko wa awamu tatu, lenye sasa, volti, nguvu na joto |

Kagua kifurushi kinacholingana kabla ya kuandika swali kwa mkono. Fuata [Ingiza na safirisha nje violezo](/sw/guides/import-and-export-templates/), thibitisha upelekaji wa faili na ugunduzi, kisha uunde waziwazi grafu unazotaka. Uwepo wa kifurushi hauthibitishi utangamano wa kifaa au uongezaji sahihi; kasoro za UPS na lmSensors hapa chini zinahitaji umakini.

## Maumbo mawili ambayo kitambuzi huchukua

Kwa mkusanyiko wa SNMP, tofautisha vitu vya scalar kutoka kwa matukio ya meza yaliyoorodheshwa.

**OID iliyowekwa.** Thamani moja ya skala kwenye anwani moja, anwani sawa kwenye kila kifaa cha aina hiyo. Joto la betri. Jumla ya nguvu ya pato. Tumia chanzo cha data cha OID kisichobadilika: SNMP get dhidi ya OID halisi, na chanzo kimoja cha data kwa kila usomaji.

**Jedwali.** Idadi isiyojulikana ya usomaji uliogunduliwa kwa kila kifaa. Vichunguzi vya rack, vipande vya plagi, vipimo vya kila awamu. Tumia swali la data, ambalo hutembea kwenye meza, hujifunza faharasa, na kukuwezesha kuchagua safu mlalo zipi zinakuwa grafu.

Kifurushi cha UPS kilichosafirishwa kinatumia zote mbili. Fuata muundo wa kitu cha MIB: kifaa chenye uchunguzi mmoja tu wa sasa kinaweza bado kukionyesha kama safu mlalo ya jedwali iliyo na faharasa.

| Usomaji wa UPS | Umbo | OID |
|---|---|---|
| Joto la betri | Imewekwa | `.1.3.6.1.2.1.33.1.2.7.0` |
| Makadirio ya muda uliobaki | Imewekwa | `.1.3.6.1.2.1.33.1.2.3.0` |
| Muda kwenye betri | Imewekwa | `.1.3.6.1.2.1.33.1.2.2.0` |
| Voltage ya betri | Imewekwa | `.1.3.6.1.2.1.33.1.2.5.0` |
| Kengele zilizopo | Imewekwa | `.1.3.6.1.2.1.33.1.6.1.0` |
| Voltage ya pembejeo, ya sasa, nguvu, marudio | Swali | `.1.3.6.1.2.1.33.1.3.3.1` |
| Voltage ya pato, ya sasa, nguvu, mzigo | Swali | `.1.3.6.1.2.1.33.1.4.4.1` |

Kila moja ya vyanzo hivyo vya data ni `GAUGE`. Hakuna hata moja iliyo kaunta. Kumbukumbu ya kiolezo iliyosafirishwa hutangaza hatua ya sekunde 60 na mapigo ya moyo ya sekunde 600, kiwango cha chini cha sifuri, na hakuna kiwango cha juu, isipokuwa halijoto, ambayo haina kiwango cha chini. Angalia wasifu ulioingizwa na usanidi halisi wa RRD; matamko haya hayaweki mahadhi ya kura yanayoendelea. Usomaji hasi halali pia unahitaji mhimili wa grafu unaouonyesha.

## Tafuta OID

Tembea kifaa kabla ya kuandika chochote. Unatafuta vitu vitatu: jedwali la usomaji, jedwali sambamba la lebo, na kizidishi chochote ambacho muuzaji alichagua, pamoja na vitu vya uhalali/hali vinapopatikana.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Badilisha mwenyeji wa mfano na jumuiya na maadili yaliyosanidiwa na uendeshe uchunguzi kutoka kwa mpigakura. Pakia MIB inayolingana na vitegemezi ili kukagua majina, vitengo na semantiki; hati za vitu vya muuzaji zinaweza pia kuelezea OID za nambari. Kizingiti cha karibu au msimbo wa hali hauwezi kubadilishwa na kipimo.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

Ufafanuzi wa MIB ndipo uongezaji unapoandikwa. Muuzaji anayeripoti sehemu ya kumi ya digrii atasema hivyo katika maelezo ya kitu au kifungu cha vitengo, na katika hati zinazohusiana za muuzaji. Kukisia kutoka kwa usomaji mmoja kunaweza kubadilisha digrii 23.5 kuwa grafu ya 235.

MIB za kawaida hufunika zaidi ya watu wanavyotarajia. UPS-MIB katika `.1.3.6.1.2.1.33` ni ya kawaida kwa wachuuzi wote. ENTITY-SENSOR-MIB inatoa thamani ya kitambuzi yenye nyanja zake za ukubwa na usahihi kando yake. Angalia hizo kabla ya kufikia mti mdogo wa biashara.

Linganisha ugunduzi katika uanzishaji upya wakilishi na mabadiliko ya uchunguzi katika usakinishaji wa jaribio. Matembezi mawili yasiyobadilika pekee hayathibitishi uthabiti wa faharasa. Rekodi vitambulisho thabiti vya vitambuzi vinapopatikana kabla ya kuunda grafu zinazoishi kwa muda mrefu.

## Jenga chanzo cha data cha OID kisichobadilika

Kitambuzi cha OID kisichobadilika kinahitaji kiolezo cha data kwa kutumia ingizo la data la SNMP get, na OID ikiwa thamani halisi na kipengee kimoja cha chanzo cha data ndani yake. Weka aina kuwa `GAUGE`, ipe kiwango cha chini thamani halisi pale tu kitambuzi hakiwezi kwenda chini yake, na uache kiwango cha juu bila kufafanuliwa isipokuwa muuzaji aandike dari.

Maadili nje ya mipaka ya chanzo cha data cha RRD huwa haijulikani. Weka mipaka hiyo katika vitengo ghafi vilivyohifadhiwa, si vitengo vilivyobadilishwa vya grafu; vinginevyo usomaji halali unaweza kupotea kabla ya CDEF ya onyesho kutumika.

## Jenga swali la data

Swali linahitaji OID ya faharasa, njia ya kugeuza kila OID iliyotembelewa kuwa faharasa, na sehemu moja kwa kila safu unayotaka.

Swali la pato la UPS ni mfano mfupi wa kufanya kazi. Huorodhesha kwenye jedwali la mstari, huchanganua faharasa kutoka mwisho wa kila OID iliyorejeshwa na maneno ya kawaida, na kutangaza uwanja mmoja wa ingizo kwa faharasa na nyanja nne za pato za voltage, ya sasa, nguvu na mzigo. Ufafanuzi wa pato unajumuisha mbinu, chanzo, mwelekeo na OID ya safu wima. OID ya safu wima inaweza kuwa mzizi halali wa matembezi ya faharasa; kulinganisha kichanganuzi cha swali na OID halisi zilizorejeshwa ndio jambo kuu. Tazama [Maswali ya data na faharasa](/sw/concepts/data-queries-and-indexes/) jinsi faharasa inavyochaguliwa na kuhifadhiwa.

Chagua njia ya kuorodhesha upya kimakusudi. Chaguo ni hakuna, wakati wa kufanya kazi unarudi nyuma, hesabu ya faharasa inabadilika, na Thibitisha Sehemu Zote. Majedwali ya vitambuzi ndio kisa ambapo njia dhaifu hushindwa: chomoa kichunguzi kimoja kutoka kwa kitengo cha rack na uchomeke kingine, na hesabu haiwezi kubadilika wakati kila usomaji nyuma ya faharasa sasa ni wa kitambuzi tofauti. Uthibitishaji kamili hugharimu kazi ya SNMP katika kila mzunguko. Thibitisha ni sehemu zipi za utambulisho ambazo swali linaweza kuangalia: faharasa za nambari ambazo hazijabadilika au lebo zilizorudiwa/zilizopunguzwa haziwezi kuthibitisha kuwa uchunguzi wa kimwili ni sawa. Onyesha upya ugunduzi na uhakiki miunganisho ya grafu baada ya kubadilisha.

## Pima thamani

Amua wapi uongofu unafanyika, na uweke mahali pamoja tu.

| Wapi | Wakati wa kuitumia |
|---|---|
| Katika hati ya mkusanyiko | Tumia mkataba wa mkusanyaji uliowekwa kumbukumbu; lmSensors get kwa sasa inarudisha vitengo ghafi |
| Katika CDEF kwenye kipengee cha grafu | Thamani ghafi inafaa kuhifadhiwa, na kitengo cha kuonyesha ni chaguo la uwasilishaji |

CDEF ni jibu la kawaida kwa kizidishi cha muuzaji. Vifurushi vilivyosafirishwa hubeba ufafanuzi kama vile `Divide By 10`, iliyojengwa kutoka chanzo cha sasa cha data, `10`, na mgawanyiko. Zitumie tu kwa vitu vyenye kitengo ghafi kinacholingana.

Kifurushi cha UPS kina [CDEFs zisizo sahihi za nguvu na wakati](https://github.com/kadupulhq/kadupul/issues/249): mfululizo wake wa On Battery hugawanya sekunde kwa 6000 badala ya 60, na safu ya pembejeo/pato ya Watts hugawanya wati kwa 10. Kwa wakala anayezingatia, sekunde 600 zinapaswa kuonyeshwa kama dakika 10 na wati 1000 kama wati 1000. Voltage ya betri na sasa ya mstari zinahitaji mgawanyiko kwa 10; muda uliokadiriwa wa kufanya kazi tayari ni dakika. Tazama [vitengo vya kitu cha UPS vya RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Kuhifadhi usomaji ghafi na kugawanya kwenye grafu huweka faili ya RRD kuwa ya uaminifu na hukuruhusu kurekebisha kizidishi cha onyesho bila kuandika upya historia ghafi, mradi sampuli ziliokoka mipaka ya chanzo cha data na uhifadhi. Ubadilishaji wa upande wa mkusanyaji hubadilisha kitengo kilichohifadhiwa na huenda ukatupa usahihi; iandike. Usomaji ghafi ambao haujaelezewa haupaswi kuwasilishwa kama kitengo cha uhandisi kilichothibitishwa.

Usitumie ubadilishaji mara mbili. CDEF kwenye grafu ambayo hati yake tayari ilipima thamani inaweza kutoa usomaji unaoaminika lakini usio sahihi.

## Ipe mipangilio ya grafu inayofaa kipimo

Chagua mipangilio ya kipimo badala ya kunakili chaguo-msingi za trafiki bila kufikiri.

| Mpangilio | Trafiki | Sensor |
|---|---|---|
| Aina ya chanzo cha data | `COUNTER` | `GAUGE` |
| Thamani ya msingi | 1000, ili mhimili usome kwa k na M | Bado 1000, lakini kiambishi awali hakina maana kwenye digrii |
| Mizani otomatiki | Inatafutwa, kwani masafa hayajulikani | Kwa kawaida haitakiwi, kwa kuwa masafa yanajulikana |
| Kikomo cha juu na cha chini | Inategemea hali ya mizani otomatiki | Chagua safu inayofaa inayoonekana |

Weka kikomo cha juu na cha chini kilicho wazi na lebo ya wima inayotaja kitengo halisi. Grafu ya joto ya UPS iliyosafirishwa hufanya hivi: kikomo cha chini cha 0, kikomo cha juu cha 100, na `C` kama lebo ya wima.

Chaguo la mizani otomatiki ni seti ya chaguo, si swichi. Grafu ya halijoto iliyosafirishwa inayotumia hupitisha kikomo cha chini na `--alt-autoscale-max`; haipitishi kikomo cha juu kilichohifadhiwa cha 100. Bila mipaka thabiti, usomaji wa nje ya masafa unaweza kupanua kikomo kilichopitishwa. Kikomo kilichosanidiwa hakijabandikwa kiotomatiki. Chagua lahaja inayoweka mpaka unaojali:

| Chaguo | Athari |
|---|---|
| Mizani otomatiki inayopuuza mipaka | Ncha zote mbili huelea. Tumia wakati huna wazo la anuwai |
| Mizani otomatiki inayokubali kikomo cha chini | Hupitisha kikomo cha chini; kiwango cha juu hufuata data |
| Mizani otomatiki inayokubali kikomo cha juu | Hupitisha kikomo cha juu; kiwango cha chini hufuata data |
| Mizani otomatiki yenye mipaka yote miwili | Hupitisha mipaka yote miwili; upanuzi bado unategemea hali ngumu |

Pia kuna chaguo la mipaka thabiti ambalo huzuia mhimili kupanuka wakati thamani inapoanguka nje ya mipaka uliyoweka. Iwashe wakati mhimili uliowekwa unajali zaidi kuliko kuona mchepuko, na uiache ikiwa imezimwa wakati sivyo, kwa sababu grafu ngumu inaweza kukata mchepuko nje ya safu iliyoonyeshwa. Hii haifuti sampuli iliyohifadhiwa. Tazama [marejeleo ya mipaka ya grafu ya RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Kwa digrii au asilimia ambapo viambishi awali vya SI vinaweza kuwachanganya wasomaji, zingatia kipeo cha vitengo cha 0. Msingi wa 1000 hudhibiti hatua za kiambishi awali; haizimi viambishi awali yenyewe au kubadilisha vitengo vya kipimo.

### Ujumuishaji ni muhimu zaidi hapa kuliko kwenye trafiki

Kaunta ya kiolesura iliyokadiriwa kwa saa moja bado inakuambia takriban kile kilichotokea. Halijoto ya wastani kwa saa moja huficha msafara wa dakika kumi ambao ulikuwa muhimu. Hakikisha wasifu wa hifadhi nyuma ya vyanzo hivi vya data unaweka kumbukumbu ya `MAX`, na usanidi mfululizo uliopangwa ili usome ujumuishaji unaofaa wa `MAX`. Kiwango cha juu cha hadithi juu ya mfululizo wa `AVERAGE` hakirejeshi kilele asili.

Hata kumbukumbu ya MAX huhifadhi tu vilele vinavyowakilishwa katika sampuli zilizokusanywa; haiwezi kurejesha mchepuko kati ya kura au maadili yaliyokataliwa kabla ya kuhifadhi. Tazama [Dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/) na [Vyanzo vya data na kumbukumbu](/sw/concepts/data-sources-and-rras/).

## Wakati hakuna MIB inayofaa kutumia

Zana nyingi za mazingira huzungumza Modbus, itifaki ya mfululizo, au API ya HTTP, na wakala wake wa SNMP hafichui chochote muhimu. Hizo zinahitaji ingizo la data ya hati. Hati huendeshwa kwenye mwenyeji wa mpigakura, si kwenye kifaa, na kufikia kifaa ni tatizo la hati. Tazama [Andika hati ya kukusanya data](/sw/guides/write-a-data-collection-script/) kwa mkataba wa pato.

Rudisha `U` badala ya `0` wakati kitambuzi hakipatikani. Uchunguzi ambao ulienda nje ya mtandao si uchunguzi unaosoma digrii sifuri.

## Njia za kutofaulu

| Dalili | Sababu ya kawaida |
|---|---|
| Halijoto imechorwa kama nambari kumi au mara mia kubwa sana | Kizidishi cha muuzaji hakikugawanywa |
| Halijoto imechorwa mara kumi ndogo sana | Imegawanywa mara mbili, mara moja katika hati na mara moja katika CDEF |
| Reli ya voltage inasomeka kama mabilioni | Nambari kamili ya SNMP isiyo na saini inayoshikilia thamani hasi, haijasahihishwa |
| Grafu za vitambuzi huwa tambarare baada ya kichunguzi kubadilishwa | Jedwali liliorodheshwa upya na chanzo cha data sasa kinaelekeza kwenye kitambuzi tofauti |
| Usomaji ulio juu ya kizingiti unaonekana kama mapengo | Kiwango cha juu kiliwekwa kwenye chanzo cha data na maadili halisi yanazidi |
| Mhimili umeandikwa kwa k au M kwenye usomaji wa digrii | Thamani ya msingi na mipangilio ya kitengo iliyorithiwa kutoka kwa kiolezo cha trafiki |
| Mchepuko hauonekani kwenye mwonekano wa wiki | Angalia ujumuishaji uliochaguliwa, azimio lililohifadhiwa, muda wa kupiga kura na sampuli zilizokataliwa |
| Swali halirudishi faharasa | Angalia OID zilizorejeshwa, mechi za vichanganuzi, vizuizi vya ufikiaji na usaidizi wa vitu; mzizi wa safu unaweza kuwa halali |
| Maswali ya lmSensors hayapati chochote kwenye mwenyeji wa Linux | Angalia usaidizi wa wakala, ufikiaji, safu mlalo za vitambuzi zilizofichuliwa na hitilafu kamili za SNMP |
