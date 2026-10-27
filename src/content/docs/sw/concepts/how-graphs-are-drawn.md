---
title: Jinsi grafu zinavyochorwa
description: Njia kutoka faili ya round-robin hadi picha iliyotolewa, na kwa nini nambari zilezile zilizohifadhiwa zinaweza kutoa picha tofauti sana.
sidebar:
  order: 4
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
---

Ombi la kawaida la picha linaweza kukusanya amri ya RRDtool kutoka usanidi wa grafu na kusoma faili za RRD zilizotajwa. Picha halali iliyohifadhiwa kwenye kache inaweza pia kutimiza ombi hilo, na usindikaji wa Boost wa hiari unaweza kusasisha faili kabla ya kutoa picha. Kwa mipaka ya upya wa data, tazama [maandishi ya ujazo wa juu](/sw/concepts/high-volume-writes/).

## Mlolongo wa shughuli

Kwa maombi yanayoendelea hadi uundaji wa amri:

1. Tatua dirisha la muda lililoombwa na usanidi wa grafu.
2. Kadiria azimio kutoka wasifu wa hifadhidata na uchague kitendakazi cha ujumuishaji.
3. Toa marejeleo ya `DEF` yasiyo na marudio kwa nyuga na vitendakazi vinavyohitajika.
4. Toa maneno ya `CDEF` na `VDEF` yaliyotajwa.
5. Toa vipengee vya kuchora na kuchapa kwa mpangilio uliosanidiwa na chaguo zilizotumika na mabadiliko ya programu-jalizi.
6. Ruhusu RRDtool kusoma faili halisi na kutoa matokeo.

## Kuchagua kumbukumbu

Kadupul hushauriana na safu za wasifu wa hifadhidata wakati wa kuhesabu upana wa nyaraka na chaguo za grafu. Makisio yake ya kiotomatiki huzingatia muda wa hatua ukizidishwa na idadi ya hatua ikizidishwa na idadi ya safu, ufikiaji ulioombwa na idadi ya hatua za nyaraka; uteuzi dhahiri wa nyaraka hufuata njia tofauti. Hesabu hizi za wasifu hazikagui kila kumbukumbu halisi ya faili na zinaweza kutolingana na faili zilizopo baada ya mabadiliko ya wasifu.

`DEF` inayotengenezwa hutaja faili, jina la chanzo cha data na kitendakazi cha ujumuishaji. RRDtool huchagua kumbukumbu inayopatikana katika azimio linalofaa na inaweza kuunganisha data zaidi kwa upana wa grafu na dirisha la muda. Makisio ya programu hayahakikishii kusoma kumbukumbu yoyote maalum ya kimaumbile. Tazama nyaraka rasmi za [ufafanuzi wa data wa RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Kupanua dirisha au kubadilisha upana wa picha kunaweza kubadilisha azimio linaloonyeshwa. Mfululizo mbaya unaotegemea wastani unaweza kuficha mwinuko mfupi wa ghafla ingawa bado upo kwenye kumbukumbu nzuri zaidi. Linganisha mpangilio halisi wa faili na amri, si wasifu pekee. Tazama [vyanzo vya data na nyaraka za round-robin](/sw/concepts/data-sources-and-rras/).

Wakati mpigaji simu hatoi wakati wa kumaliza, mtoaji wa kawaida hutumia mwanzoni kiwango cha uhamishaji cha uendeshaji wa mwisho wa kipima data kikuu kulingana na wakati wa sasa, akirudi kwenye kipindi cha upigaji kura ikiwa thamani hiyo haipatikani au iko katika siku zijazo. Msimbo wa baadaye pia una chaguo la kipindi kilichounganishwa, lakini si chaguo-msingi la jumla. Wakati wa kumaliza wa wazi hubatilisha mwanzo huu wa kawaida; grafu inayoishia kabla ya wakati wa sasa haitambui kumbukumbu iliyochaguliwa pekee au kuthibitisha sampuli za hivi karibuni ziliandikwa.

## Vipengee vya grafu

Grafu ni orodha iliyopangwa ya vipengee. Uundaji wa amri unaweza kuacha vipengee, kutumia tena ufafanuzi au kupanua kipengee kimoja kuwa maagizo kadhaa. Mpangilio wa kuchora ni muhimu zaidi kuliko mpangilio wa kuona tu.

| Kipengee | Kinachochora | Maelezo |
|---|---|---|
| `AREA` | Eneo lililojazwa kutoka mhimili hadi thamani | Maeneo ya baadaye huchorwa juu ya maeneo ya awali |
| `STACK` | Eneo lililojazwa kuanzia juu ya kipengee kilichotangulia | Huchorwa kama eneo lenye bendera ya stack |
| `LINE1`, `LINE2`, `LINE3` | Mstari wenye upana wa pikseli moja, mbili au tatu | Unaweza kuwa na dashi |
| `LINE:STACK` | Mstari uliochorwa juu ya jumla inayoendelea ya stack | |
| `TICK` | Alama ya tiki kando ya ukingo mmoja wa mchoro | Ni muhimu kwa hali, si kwa viwango |
| `GPRINT` | Hakuna kitu. Huchapa nambari katika maelezo | |
| `COMMENT` | Hakuna kitu. Huchapa maandishi halisi ya maelezo | Maoni marefu yanakunjwa |
| `HRULE` | Mstari wa mlalo katika thamani maalum | |
| `VRULE` | Mstari wa wima katika wakati maalum | |
| `TEXTALIGN` | Hakuna kitu. Huweka upangaji kwa maandishi ya maelezo yanayofuata | |

Orodha kamili, ikijumuisha safu wima za usanidi zinazotumika kwa kila aina, ipo katika [vipengee vya grafu](/sw/reference/graph-items/).

`AREA` na `STACK` ni jozi ambayo mara nyingi watu huielewa vibaya. Eneo huanzia sifuri, kwa hivyo maeneo mawili hufunika kila kimoja na refu huficha fupi. Stack huanzia pale kipengee kilichotangulia kilipoishia, kwa hivyo urefu unaoonekana wa bendi ya pili ni thamani yake yenyewe lakini makali yake ya juu yanawakilisha jumla. Soma grafu iliyowekwa kwenye stack kama urefu wa bendi, si kama nafasi kwenye mhimili wa Y, vinginevyo utasoma vibaya kila mfululizo isipokuwa ule wa chini kabisa.

`HRULE` inakubali thamani inayoweza kuwa na uingizwaji wa kiolezo. Herufi zisizo za nambari huondolewa kwenye matokeo, na ikiwa hakuna kitu cha nambari kilichobaki, sheria inachorwa kwenye sifuri badala ya kushindwa kutoa picha. Sheria iliyo kwenye sifuri inaweza kuwa ya kukusudia au kutokana na uingizwaji ulioshindwa. Kagua amri iliyotatuliwa kabla ya kuamua. Kichujio cha nambari kinaweza pia kubadilisha mfuatano wenye vitengo au nukuu za nambari zisizoungwa mkono.

`VRULE` inakubali muhuri wa muda wa Unix au jozi ya `hours:minutes`. Sehemu hasi ya saa inasomwa kama kiwango cha uhamishaji cha kurudi nyuma kutoka wakati wa sasa badala ya wakati kwenye saa.

## Kazi mbili, neno moja

Vitendakazi vya ujumuishaji vinatumika kwa madhumuni mawili tofauti, na majina manne yale yale, `AVERAGE`, `MIN`, `MAX` na `LAST`, yanaonekana katika sehemu zote mbili.

Kazi ya kwanza ni uteuzi wa nyaraka. `DEF` inabainisha faili, chanzo cha data ndani yake, na kitendakazi cha ujumuishaji. Kitendakazi hicho kinaweka mipaka ya familia ya kumbukumbu iliyoombwa. Omba `MAX` na RRDtool inahitaji data ya ujumuishaji iliyohifadhiwa inayolingana kulingana na kurejea kwa programu na uteuzi wa azimio ulioelezwa hapa chini.

Kazi ya pili ni hesabu ya maelezo. `GPRINT` inapunguza dirisha zima lililochorwa kuwa nambari iliyochapishwa, na kitendakazi chake huamua jinsi ya kufanya hivyo. Upunguzaji huu hutokea kwenye mfululizo uliosomwa tayari; ni ujumuishaji wa uwasilishaji, si uhifadhi wa kimaumbile.

Kwa hivyo `GPRINT` inayoonyesha `MAX` kwenye `DEF` iliyosomwa na `AVERAGE` inachapa thamani kubwa zaidi ya mfululizo huo unaotegemea wastani katika dirisha lililotolewa, si lazima sampuli ghafi kubwa zaidi. Dakika tano ni mfano tu; azimio linalofaa hubadilika. Hizo ni nambari tofauti, na kwenye kiungo chenye shughuli nyingi ni nambari tofauti sana. Usomaji wote wawili ni halali. Labda moja tu ndiyo uliyokusudia.

## Njia mbadala ya kimya

Kwa aina za vipengee vinavyotumia msaidizi wa kazi bora, Kadupul husoma vitendakazi vya ujumuishaji vya faili na hutumia kile kilichoombwa ikiwa kipo, vinginevyo hutumia kile kilichoripotiwa kwanza. Ikiwa hakuna kinachopatikana kwa chanzo halali cha data cha ndani, msaidizi hurejea kwenye AVERAGE. Tofauti thabiti za GPRINT huchukua njia tofauti na hazitumii msaidizi huyu, kwa hivyo si ahadi ya jumla ya kurekebisha kila kitendakazi kilichokosekana.

Kwa hivyo kipengee cha kuchora kinachoomba `MAX` kinaweza kuishia kusoma wastani wakati faili yake ina nyaraka za AVERAGE pekee. Kagua `DEF` inayozalishwa na matokeo ya `rrdtool info`. Matengenezo ya nyaraka yanaweza kubadilisha mpangilio uliopo, lakini kuongeza kumbukumbu hakuwezi kuunda upya vilele vya kihistoria vilivyotupwa na wastani wa awali. Tazama [dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/).

## GPRINT huazima kumbukumbu ya jirani yake

`GPRINT` ya kawaida haina kumbukumbu yake yenyewe. Inatumia tena kitendakazi cha ujumuishaji cha kipengee cha hivi karibuni kinacholingana cha `AREA`, `STACK`, mstari au `TICK` kilichotambuliwa na jina la chanzo cha data na utambulisho wa uga wa kiolezo cha ndani. Ikiwa hakuna mechi iliyotangulia, inatumia msaidizi wa kazi bora na kitendakazi chake kilichosanidiwa. Tofauti thabiti hutumia moja kwa moja kitendakazi chake kilichosanidiwa.

Hii inamaanisha kuwa kupanga upya vipengee kwenye kiolezo cha grafu kunaweza kubadilisha kile maelezo yanaripoti bila mtu yeyote kugusa maelezo yenyewe. Weka `LINE` inayosoma `MAX` juu ya kizuizi cha `GPRINT`, na maelezo yanayolingana yanaweza kufanya muhtasari wa viwango vya juu. Isogeze chini na kipengee kilichotangulia kinacholingana, au kurejea kwa kutokuwepo mechi, huamua mfululizo wa ingizo badala yake. Ikiwa nambari katika maelezo inabadilika baada ya uhariri wa kiolezo usiohusiana, kagua mpangilio wa vipengee kwanza.

## CDEF na VDEF

Zote hubadilisha data kabla ya kuchora. Hazibadiliki moja kwa moja.

| | CDEF | VDEF |
|---|---|---|
| Inachounda | Mfululizo, thamani moja kwa kila nafasi ya wakati | Thamani ya nambari, na wakati unaohusika kwa baadhi ya vitendakazi |
| Inaweza kuchorwa kama mstari au eneo | Ndiyo | Thamani ya nambari inaweza kutoa kiwango kisichobadilika |
| Imeundwa na | Vitendakazi, waendeshaji wa hesabu, CDEF zingine, vyanzo maalum vya data, thamani halisi | Kitendakazi kinachotumika kwa marejeleo |
| Kiota (Nesting) | CDEF moja inaweza kurejelea CDEF nyingine | VDEF haiwezi kuwa na hesabu |

CDEF ni usemi wa stack unaopimwa kwa mpangilio wa Kipolandi wa kinyume. Msamiati wake ni mkubwa na umeorodheshwa kikamilifu katika [vipengee vya grafu](/sw/reference/graph-items/): hesabu, ulinganishaji na waendeshaji wa masharti, trigonometria, mikusanyiko katika vyanzo vya data, ushughulikiaji wa stack na vitendakazi vya wakati vinavyoruhusu ufafanuzi kujua mahali ulipo kwenye mhimili wa X. `UN` na `UNKN` ni vipengele viwili vinavyostahili kujifunza mapema. Kubadilisha thamani zisizojulikana na sifuri huepuka mapengo ya kuona lakini pia huficha vipimo vilivyokosekana; fanya chaguo hilo la uwasilishaji waziwazi.

CDEF pia husoma marejeleo maalum badala ya jina maalum la chanzo cha data. Moja hutatua kwa chanzo cha data cha kipengee cha sasa, na kufanya CDEF moja kutumika tena katika kila kipengee kwenye kiolezo. Marejeleo mengine hutatua kwa vyanzo vyote vya data kwenye grafu au vyanzo vyote vinavyofanana, na kufanya iwezekane kuunda mstari wa jumla bila kutaja maingizo.

VDEF inapunguza mfululizo kuwa nambari moja: kiwango cha juu, kiwango cha chini, wastani, mkengeuko wa kawaida, ya kwanza, ya mwisho, jumla, asilimia au mteremko, kizuizi na uwiano. RRDtool haiauni hesabu ndani ya VDEF, kwa hivyo wakati VDEF inahitaji ingizo lililohesabiwa, Kadupul huijenga kwenye CDEF ya kipengee badala ya chanzo ghafi cha data. Hii ndiyo njia iliyokusudiwa ya hesabu: piga hesabu kwenye CDEF, kisha uipunguze kwenye VDEF.

`GPRINT` inayoungwa mkono na VDEF haikubali hoja ya kitendakazi cha ujumuishaji: VDEF tayari imetoa upunguzaji huo. VDEF pia zinaweza kutoa thamani za nambari kwa ajili ya kuchora; RRDtool inaunga mkono mstari unaoungwa mkono na VDEF. Tazama nyaraka rasmi za [vipengele vya grafu vya RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

Usafirishaji wa CSV huchagua aina za michoro zinazoungwa mkono kama safu wima za mfululizo; vipengee vya maelezo havisafirishwi kama safu wima zinazolingana. Tofauti na maelezo ya awali, msimbo wa sasa kwa ujumla hauruki vipengee vya kuchora vinavyoungwa mkono na VDEF. Inaweza kutoa `XPORT` batili ya VDEF ya nambari: jaribio lililotengwa la RRDtool hutoa mstari wa VDEF kwa mafanikio lakini linakataa usafirishaji huo. Tazama [hitilafu ya programu #273](https://github.com/kadupulhq/kadupul/issues/273). Tumia vipengee vya kuchora vinavyoungwa mkono na mfululizo kwa usafirishaji na uthibitishe safu wima zinazotokana.

## Kwa nini data ile ile inaonekana tofauti

Kila chaguo hapa chini hubadilisha picha bila kubadilisha sampuli moja iliyohifadhiwa.

| Chaguo | Athari |
|---|---|
| Urefu wa dirisha na upana wa picha | Inaweza kubadilisha uteuzi wa nyaraka na ujumuishaji wa ziada |
| Kitendakazi cha ujumuishaji katika `DEF` | Husoma kilele, bonde, wastani au thamani ya mwisho |
| Kitendakazi cha ujumuishaji kilichokosekana | Njia zingine za vipengee hubadilisha kitendakazi kingine; zingine zinaweza kushindwa |
| `AREA` dhidi ya `STACK` | Urefu kamili dhidi ya urefu limbikizi |
| Mpangilio wa vipengee | Uchoraji juu, mpangilio wa stack na ni kumbukumbu gani ambayo `GPRINT` huazima |
| Msingi 1000 au 1024 | Huweka lebo mpya kwenye mhimili. Thamani zinafanana |
| Hali ya kupima kiotomatiki, mipaka thabiti, kipimo cha logi | Hubadilisha mhimili wa Y, ambao hubadilisha ukubwa wa mabadiliko kionekano |

Ikiwa grafu hazilingani, linganisha amri iliyotolewa, utambulisho halisi wa faili na mpangilio, hali ya kache na usafi wa sampuli. Chaguzi hizi za uwasilishaji ni ukaguzi muhimu, lakini hazizuii makosa ya ukusanyaji, uhifadhi au ulinganishaji. Kwa mwongozo wa jinsi ya kufanya hivyo, tazama [tatua data inayokosekana](/sw/guides/troubleshoot-missing-data/).
