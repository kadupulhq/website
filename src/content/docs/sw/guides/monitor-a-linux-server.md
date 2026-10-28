---
title: Kufuatilia Seva ya Linux
description: Kuunda grafu za CPU, kumbukumbu, diski, na mzigo kwenye seva pangishi ya Linux kupitia net-snmp, kile ambacho snmpd inapaswa kufichua, na jinsi ya kutumia hati wakati SNMP haitoshi.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 3
---

:::caution[Thibitisha kabla ya matumizi]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Seva pangishi ya Linux inayotumia net-snmp inakupa vipimo vingi bila msimbo wowote wa ziada. Kazi ni kufanya `snmpd` ifichue miti midogo sahihi na kujua ni ipi kati ya MIB mbili za diski zinazoingiliana unayotazama.

## Kile ambacho snmpd lazima ifichue

Kadupul huuliza maeneo manne. Ipe utambulisho wa ufuatiliaji miti midogo inayohitajika kwa grafu zilizochaguliwa; sio kila utekelezaji unahitaji kila mti mdogo.

| Eneo | Mti mdogo | Hutoa |
|---|---|---|
| Mfumo | `.1.3.6.1.2.1.1` | Maelezo, muda wa kufanya kazi (uptime), mawasiliano, jina, eneo |
| Violesura | `.1.3.6.1.2.1.2` na `.1.3.6.1.2.1.31` | Trafiki, makosa, hali |
| Rasilimali za seva pangishi | `.1.3.6.1.2.1.25` | Michakato, watumiaji walioingia, hifadhi, vichakataji |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Wastani wa mzigo, kumbukumbu, muda wa CPU, I/O ya diski, sehemu zilizotangazwa |

Mifumo mingi ya usambazaji huja na `snmpd.conf` chaguomsingi inayotoa mwonekano unaojumuisha mti mdogo wa mfumo pekee. Kifaa kitajibu, kitaleta maelezo ya mfumo, na hakitakusanya chochote. Mchanganyiko huu ndio hitilafu ya kwanza inayojulikana zaidi kwenye seva pangishi ya Linux na inaonekana kama tatizo la kiolezo.

Thibitisha maeneo yanayohitajika kutoka kwa seva pangishi ya poller kwa kutumia utambulisho ule ule wa SNMP uliosanidiwa kwenye kifaa. Mifano hii inatumia jumuiya ya kielelezo; ibadilishe na thamani yako iliyosanidiwa. OID za nambari huepuka hitaji la ufafanuzi wa kielelezo wa MIB wa ndani.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Ikiwa amri ya kwanza pekee ndiyo inafanya kazi, chunguza jibu kamili: mwonekano wenye vikwazo, moduli ya wakala isiyopatikana, muktadha tofauti wa SNMP, au jedwali tupu inaweza kueleza matokeo. Thibitisha usanidi na ufikiaji wa wakala kabla ya kubadilisha kiolezo cha Kadupul.

## Kuongeza kifaa

Kifurushi kilichotolewa `install/templates/NetSNMP_Device.xml.gz` kina kiolezo cha kifaa cha Net-SNMP na vitegemezi vyake. Kiingize ikiwa kiolezo hakipo, kisha ukichague wakati wa kuongeza kifaa. Thibitisha fahirisi za dodoso na uunde waziwazi grafu unazotaka; kuchagua kiolezo cha kifaa hakuthibitishi kuwa ukusanyaji unafanya kazi. Tazama [Kuingiza violezo](/sw/guides/import-and-export-templates/) na [Grafu yako ya kwanza](/sw/start/first-graph/).

## Unachopata bila dodoso la data

Violezo hivi vya data vyenye OID zisizobadilika vimejumuishwa kwenye kifurushi. Grafu moja inaweza kuchanganya kadhaa kati ya hizi; upatikanaji unategemea wakala lengwa. Havihitaji ugunduzi wa fahirisi.

| Grafu | OID | Imehifadhiwa kama |
|---|---|---|
| Wastani wa mzigo wa dakika 1 | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Wastani wa mzigo wa dakika 5 | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Wastani wa mzigo wa dakika 15 | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Jumla ya kumbukumbu | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Kumbukumbu tupu | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Kumbukumbu ya buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Kumbukumbu iliyohifadhiwa (cached) | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU mtumiaji | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU mfumo | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU bila kazi | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Vikatizaji (Interrupts) | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Ubadilishaji muktadha | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Michakato | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Watumiaji walioingia | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Vipengee vya kumbukumbu viko katika kilobaiti. Grafu ya kumbukumbu iliyopakiwa hutumia ubadilishaji ili mhimili uonyeshwe kwa baiti. Ukiunda grafu yako mwenyewe kutoka kwa OID hizi, ubadilishaji huo ni jukumu lako.

Vipengee vya CPU vilivyoorodheshwa ni asilimia zilizopitwa na wakati, sio kaunta limbikizi za muda wa CPU. Usidhani kuwa hivi vitatu pekee vinafunika kila hali ya kichakataji. Net-SNMP huviondoa kwa ajili ya kaunta ghafi; kaunta ghafi zinahitaji hesabu sahihi za kiwango na asilimia, sio uwekaji rahisi katika kiolezo cha kipimo cha gauge. Tazama [UCD-SNMP-MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Kinachohitaji dodoso la data

| Dodoso | Hugundua | Huungwa mkono na |
|---|---|---|
| SNMP - Pata sehemu za kupachika (mount points) | Chochote ambacho wakala huita hifadhi | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Pata sehemu zinazofuatiliwa | Sehemu zilizotangazwa pekee katika `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Pata taarifa za kichakataji | Ingizo moja kwa kila CPU | Mzigo wa kichakataji wa rasilimali za seva pangishi |
| Net-SNMP - Pata I/O ya kifaa | Vifaa vya kuzuia (block devices) | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Takwimu za violesura | Violesura vya mtandao | `IF-MIB` |

### Dodoso gani la diski la kutumia

Hii si mitazamo miwili ya data sawa.

Dodoso la rasilimali za seva pangishi hupitia kila kitu ambacho wakala huripoti kama hifadhi. Kwenye seva pangishi nyingi za Linux, hii huweka kumbukumbu halisi, swap, vipachiko vya tmpfs, na mifumo halisi ya faili kwenye orodha moja. Saizi hurudishwa katika vitengo vya ugawaji, na dodoso husoma saizi ya kitengo cha ugawaji kama sehemu tofauti ili grafu iweze kuzidisha. Unapata kila kitu bila kusanidi chochote, lakini pia orodha ndefu ya maingizo ambayo huyataki.

Dodoso la net-snmp husoma jedwali la diski la UCD, lililojazwa na maagizo ya `disk` au `includeAllDisks`. Chagua sehemu maalum au ugunduzi mpana; hizi ni sera tofauti.

```
disk /      10%
disk /var   10%
```

Vinginevyo, `includeAllDisks 10%` hujaza diski zilizopatikana wakati wakala anapoanza. Thamani ya 10% husanidi kizingiti cha nafasi tupu; si kichujio cha uteuzi na yenyewe haisanidi arifa za Kadupul. Pakia upya au uwashe tena wakala kisha uhakiki fahirisi. Dodoso tupu linaweza pia kuakisi matatizo ya ufikiaji au upatikanaji wa moduli. Tazama [usanidi wa snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Pendelea dodoso la rasilimali za seva pangishi unapotaka ukamilifu na uko tayari kuchuja. Pendelea dodoso la net-snmp lenye maingizo maalum ya `disk` unapotaka orodha iliyolengwa. `includeAllDisks` hupanua orodha hiyo; kagua tena fahirisi baada ya kuanzisha upya wakala.

### Violesura

Dodoso la data ya kiolesura kwenye seva hufanya kazi sawa kabisa na kwenye swichi, kwa tahadhari moja: `ifDescr` chini ya Linux ni jina la kiolesura cha kernel, ambalo linaweza kubadilika baada ya kuwasha upya au kusasisha dereva. Tazama [Kufuatilia swichi](/sw/guides/monitor-a-switch/) kwa maelezo ya chaguo la fahirisi.

## Wakati SNMP haitoshi

Baadhi ya vipimo havina MIB inayoweza kutumika. Kina cha foleni, kaunta ya programu, au nambari kwenye faili inahitaji ingizo la hati.

Mambo mawili huamua jinsi unavyoandika hati.

**Hati huendeshwa kwenye mashine ambapo poller inafanya kazi, si kwenye seva pangishi inayofuatiliwa.** Kufikia lengo ni kazi ya hati yako: SSH, simu ya HTTP, wakala, au mfumo wowote unaotumia tayari.

**Poller husoma toleo la kawaida (standard output) na hakuna kitu kingine.** Hali ya kutoka (exit status) haitathminiwi.

Mkataba wa toleo:

| Toleo | Maana |
|---|---|
| `42` au `3.7` | Thamani moja kwa chanzo kimoja cha data |
| `U` | Hakuna thamani kwa mzunguko huu, imerekodiwa kama isiyojulikana (unknown) |
| `in:1420 out:980` | Thamani nyingi, moja kwa kila chanzo cha data |

Kwa muundo wa thamani nyingi, jozi hutenganishwa na nafasi moja na jina hutenganishwa na thamani kwa koloni. Kichanganuzi huhesabu vitenganishi dhidi ya nafasi nyeupe, kwa hivyo nafasi za ziada za ndani zinaweza kufanya uthibitishaji ushindwe. Poller ya PHP hupunguza nafasi nyeupe za mwisho. Toa muundo wa kisheria wenye nafasi moja na uelekeze uchunguzi mbali na stdout.

Majina ya ndani ya chanzo cha data cha RRD yanayokubaliwa na kihariri cha kiolezo yanalingana na `[a-zA-Z0-9_]{1,19}`; alama za viunganishi (hyphens) hazikubaliwi hapo. Lebo za toleo la hati lazima zilingane na majina ya sehemu za uingizaji data na zipangwe kwa vipengee vya ndani vilivyokusudiwa. Mstari mzima wa toleo huhifadhiwa kwenye safu wima ya herufi 512. Tazama [Hati za ukusanyaji wa data](/sw/guides/write-a-data-collection-script/) kwa mkataba uliokaguliwa wa poller ya PHP.

Rudisha `U` badala ya `0` wakati huwezi kupima kitu. Sifuri ni kipimo na kitaonyeshwa kama hivyo. Tazama [Vyanzo vya data na RRA](/sw/concepts/data-sources-and-rras/) kwa sababu zinazofanya viwili hivyo vitenganishwe.

### Seva ya hati (script server)

Hati rahisi huendeshwa mara moja kwa kila chanzo cha data kwa kila kipindi. Kwa hati iliyoandikwa katika PHP, muundo wa seva ya hati huita kitendakazi katika mchakato tofauti wa PHP unaoendelea kwa muda mrefu, na kupunguza upotevu wa muda wa kuanzisha mkalimani.

### Mtego wa orodha iliyoidhinishwa (whitelist trap)

Wakati faili ya orodha iliyoidhinishwa ya uingizaji data inatumiwa, poller hulinganisha mfuatano wa amri wa kila ingizo na ule uliorekodiwa. Mfuatano wa amri ambao umebadilika bila kutengeneza upya orodha iliyoidhinishwa huacha kuunda maingizo ya akiba ya poller, na chanzo cha data huwa kimya bila hitilafu kwenye grafu. Kumbukumbu huripoti hili, lakini UI haifanyi hivyo.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Badilisha `42` na kitambulisho cha njia ya uingizaji data iliyokaguliwa, si kitambulisho cha kifaa. Sasisho lisilo na `--id` linakubali mifuatano ya sasa ya amri katika orodha yote ya pembejeo. Kagua mabadiliko kabla. Baada ya kusasisha, thibitisha uwezeshaji wa chanzo na maingizo madhubuti ya akiba ya poller.

## Njia za kushindwa

| Dalili | Sababu ya kawaida |
|---|---|
| Maelezo ya mfumo yamesomwa, hakuna kingine kinachokusanywa | Mwonekano wa `snmpd` umewekewa vikwazo kwa mti mdogo wa mfumo pekee |
| Dodoso la sehemu la Net-SNMP halipati fahirisi | Hakuna mistari ya `disk` au `includeAllDisks` katika `snmpd.conf` |
| Sehemu za rasilimali za seva pangishi zinajumuisha RAM na tmpfs | Inatarajiwa; wakala huziripoti kama hifadhi |
| Grafu ya kumbukumbu imeachwa na sababu ya 1024 | Kujenga juu ya OID ghafi bila ubadilishaji |
| Hati inarudisha thamani kwenye mstari wa amri, poller inarekodi unknown | Kutolingana kwa toleo/ramani, hitilafu za kitenganishi cha ndani au jina batili |
| Hati inafanya kazi kibinafsi lakini inashindwa kupitia poller | Inaendeshwa kama mtumiaji wa poller na mazingira na ruhusa zake |
