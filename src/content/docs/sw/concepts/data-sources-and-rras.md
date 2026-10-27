---
title: Vyanzo vya data na nyaraka za round-robin
description: Kile kinachohifadhiwa, jinsi uhifadhi unavyofanya kazi, na kwa nini mabadiliko ya wasifu hayahamishi faili zilizopo za RRD.
sidebar:
  order: 2
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
---

Chanzo cha data cha Kadupul huweka vipimo pamoja kwa wakati na kwa kawaida hulingana na faili moja ya RRD. Kila uga wenye jina ndani ya faili hiyo pia huitwa chanzo cha data (DS) na RRDtool. Tofautisha kipengee cha programu na nyuga zake wakati wa kulinganisha hesabu au mipangilio.

Faili moja si mara zote nambari moja. Chanzo cha data kinaweza kubeba nyuga kadhaa, na kiolesura ni kisa cha kawaida: baiti zinazoingia na baiti zinazotoka hushiriki faili moja, hukusanywa kama vitu tofauti vya kazi, na huandikwa pamoja kama sasisho moja. Wanachoshiriki ni hatua (step), seti ya nyaraka, na maisha ya uhifadhi. Huwezi kuweka moja wapo kwa muda mrefu zaidi kuliko nyingine, kwa sababu uhifadhi ni sifa ya faili na si ya uga.

## Kilicho ndani ya faili

Faili ya RRD ni kichwa (header) na orodha mbili.

Orodha ya kwanza ni nyuga: jina, aina, mapigo ya moyo (heartbeat), na kiwango cha chini na cha juu kwa kila moja. Orodha ya pili ni nyaraka: kitendakazi cha ujumuishaji, ni hatua ngapi za data ghafi zinazoingia kwenye nafasi moja, kuna nafasi ngapi, na ni kiasi gani cha nafasi kinachoweza kuwa unknown kabla ya nafasi yenyewe kuwa unknown.

Uundaji hurekodi ufafanuzi huu kwenye faili. Metadata ya hifadhidata na ufafanuzi halisi wa faili unaweza kutofautiana baadaye; kagua faili kwa `rrdtool info` badala ya kudhani kiolezo cha sasa kinaielezea sawasawa.

<span id="the-decisions-that-are-permanent"></span>

## Maamuzi ya uundaji na matengenezo ya baadaye

Faili ya RRD hutengwa wakati wa uundaji. Marekebisho ya wasifu hayahamishi faili zilizopo. RRDtool hutoa shughuli za urekebishaji na kubadilisha ukubwa ambazo zinaweza kuhifadhi data iliyohifadhiwa, lakini zinahitaji uthibitishaji tofauti na nakala rudufu. Njia ya kawaida ya kuunda huangalia faili iliyopo na kurudi bila kuibadilisha. Ulinzi huo hauzuii urekebishaji wa wazi au uhamishaji. Kuhifadhi kiolezo pekee hakusasishi mpangilio wa faili zilizopo.

Chaguzi nne hurekodiwa wakati huo.

**Hatua (The step).** Ni mara ngapi thamani inatarajiwa, kwa kawaida sekunde 300. RRDtool hurekebisha masasisho kwa mipaka ya hatua; usomaji wa mara kwa mara hautupwi tu. Ikiwa masasisho ya polepole yanazalisha data ya unknown inategemea sheria za mapigo ya moyo na ujumuishaji. Kwa kawaida hatua hutoka kwenye wasifu wa chanzo cha data. Uundaji wa faili husoma hatua iliyohifadhiwa ya chanzo cha data na nyaraka za wasifu unaorejelewa, kwa hivyo thibitisha zote mbili unapobadilisha metadata au kupanga uhamishaji.

**Aina ya chanzo cha data.** Tazama hapa chini. Hii ndiyo inayoshindwa kimyakimya.

**Mipaka.** Kiwango cha chini na cha juu huzuia maadili yanayokubalika; kwa aina za DS zinazozalisha kiwango, vikomo hivyo hutumika kwa kiwango kilichohesabiwa, si jumla ya kaunta ghafi. Data iliyo nje ya masafa inakuwa unknown badala ya kubanwa. Viwango vya juu vinavyotegemea hojaji vinaweza kutatua vishikilia nafasi vya kasi ya kiolesura; si kila chanzo cha kiolesura kinapata kikomo sahihi cha kasi ya kiungo kiotomatiki. Angalia vitengo vya kiolezo na ufafanuzi halisi wa faili.

Uundaji una matawi maalum ya urekebishaji. Kwa kiwango cha juu halisi kilicho sawa au chini ya kiwango cha chini, GAUGE na ABSOLUTE hutumia kiwango cha juu ambacho hakijafafanuliwa; aina nyingine hutumia kiwango cha chini pamoja na moja. Ubadilishaji wa hojaji huchukua tawi tofauti. Ukaguzi wa baadaye wa sifuri/sifuri hubadilisha kiwango cha juu pekee, na urekebishaji wa awali unaweza kuwa tayari umeubadilisha. Usichukulie hili kama kithibitishaji cha jumla au kudhani mipaka yote miwili inakuwa haijafafanuliwa.

**Nyaraka.** Ni sampuli ngapi za kuweka katika maazimio gani, na ni kitendakazi gani cha ujumuishaji cha kutumia kwa kila moja. Hiki ndicho kinachoamua kama unaweza kujibu swali katika miaka miwili.

## Aina za vyanzo vya data

| Aina | Huhifadhi | Inafaa kwa |
|---|---|---|
| `GAUGE` | Kiwango, kilichorekebishwa kwa hatua ya faili | Halijoto, wastani wa mzigo, kumbukumbu inayotumika, kina cha foleni |
| `COUNTER` | Kiwango cha mabadiliko kwa sekunde, ikisahihisha kufungwa kwa kaunta katika biti 32 au 64 | Okteti za kiolesura, hesabu za pakiti na hitilafu |
| `DERIVE` | Kiwango cha mabadiliko kwa sekunde, kinaruhusiwa kuwa hasi | Kaunta ambayo inaweza kushuka kihalali au kuwekwa upya |
| `ABSOLUTE` | Thamani kama ilivyotolewa, ikigawanywa na muda tangu usomaji wa mwisho | Hesabu ambayo kifaa huweka upya kila wakati unapoiposoma |
| `COMPUTE` | Thamani iliyohesabiwa kutoka nyuga zingine kwenye faili hiyo hiyo badala ya kukusanywa | Uga unaotokana, kama vile jumla au uwiano |

Kadupul huonyesha `DCOUNTER` na `DDERIVE` wakati toleo la RRDtool lililosanidiwa ni 1.5 au jipya zaidi. Zinakubali kaunta za nambari zenye desimali; DCOUNTER pia hutambua mwelekeo wa kuhesabu na uwekaji upya, kwa hivyo si COUNTER yenye desimali tu. Jedwali linaelezea semantiki ya RRDtool, si uthibitisho kwamba kila aina inatumika na kila kihariri cha Kadupul au njia ya uundaji; thibitisha ufafanuzi uliotengenezwa, hasa kwa maneno ya COMPUTE. Tazama [marejeleo ya uundaji wa RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) ya juu.

### Kukosea aina

Mifano hii inaonyesha kutolingana; mwonekano wake unategemea data na mipaka.

`GAUGE` kwenye kaunta inayoongezeka huchora kiwango chake badala ya matokeo ya kazi. Inaweza kupanda hadi kufungwa au kuwekwa upya; hiyo inaweza kutambulika lakini haijahakikishiwa kuonekana vibaya waziwazi kwa dirisha fupi.

`COUNTER` hutafsiri upungufu kwa kutumia marekebisho ya kufungwa, kwa hivyo uwekaji upya unaweza kuwa kiwango kikubwa chanya au kukataliwa na kiwango chake cha juu. `DERIVE` yenye kiwango cha chini cha sifuri hukataa viwango hasi, ikiwa ni pamoja na kufungwa halisi; chagua hii pale tu maelewano hayo yanapolingana na kipimo. Kiwango cha juu hakitofautishi kila uwekaji upya na kufungwa kihalali.

`COUNTER` kwenye geji ni kosa hatari. Thamani iliyohifadhiwa inakuwa mabadiliko katika geji yakigawanywa na muda uliopita. Kifaa kinachokaa kwa utulivu katika nyuzi 40 hurekodi sifuri. Ongezeko la digrii moja katika dakika tano hurekodi 0.0033. Grafu inaweza kuonekana kuwa ya kweli huku ikipima mabadiliko badala ya joto. Kiwango hicho ni muhimu tu ikiwa ni kiasi ulichokusudia; hakiwakilishi kiwango cha asili cha geji.

`ABSOLUTE` kwenye kaunta ambayo haiwekwi upya wakati wa kusoma ni daraja lile lile la kushindwa kimyakimya upande mwingine, likizalisha thamani zinazoongezeka kulingana na muda ambao kifaa kimekuwa kikiwashwa.

Kanuni inayopendekezwa na hii ni kuamua aina kutoka jinsi kifaa kinavyotoa nambari, si kutoka kwa kile ambacho nambari inamaanisha. Ikiwa usomaji ni kiwango ni sifa ya kaunta, si ya kipimo.

## Mapigo ya moyo (The heartbeat)

Mapigo ya moyo ni muda wa juu unaoruhusiwa kati ya masasisho kwa uga kabla ya RRDtool kuchukulia muda huo kama unknown. Hupimwa kati ya masasisho, si kama muda wa ziada unaoongezwa baada ya hatua.

Soma wasifu uliosanidiwa na faili halisi. Wasifu wa dakika tano uliosafirishwa hutumia mapigo ya moyo ya sekunde 600, wasifu wa dakika moja pia hutumia sekunde 600, na wasifu wa sekunde thelathini hutumia sekunde 1,200. Kwa hivyo, uvumilivu wa upigaji kura uliokosekana hauwezi kuelezewa na hesabu moja maalum; urekebishaji na ujumuishaji pia huathiri ni vipindi vipi vya grafu ambavyo ni unknown.

Mapigo ya moyo ni kwa kila uga, si kwa kila faili. Maadili ya wasifu hufahamisha metadata, lakini uundaji wa faili husoma mapigo ya moyo ya kipengee cha ndani, ambayo yanaweza kutofautiana na wasifu. Wasifu uliosafirishwa hautumii uwiano mmoja, na hoja nyuma ya kila moja, pamoja na kile ambacho mapigo ya moyo yaliyowekwa karibu sana na hatua hufanya, yamo katika [Wakati na vipindi](/sw/concepts/time-and-intervals/).

## Ujumuishaji (Consolidation)

Masasisho yanapowasili, RRDtool pia huyaunganisha katika makundi makubwa zaidi; haisubiri hifadhi nzuri zaidi kuisha muda wake. Kitendakazi huchaguliwa kwa kila kumbukumbu, na kila kitendakazi hujibu swali tofauti.

- `AVERAGE` hufanya muhtasari wa pointi za msingi za data zinazochangia.
- `MAX` huweka thamani yake kubwa zaidi.
- `MIN` huweka thamani yake ndogo zaidi.
- `LAST` huweka thamani yake ya mwisho chini ya sheria za ujumuishaji za RRDtool.

Hizi hufanya kazi kwenye pointi za msingi za data zilizorekebishwa, si lazima usomaji ghafi wa asili. Hifadhi ya MAX haiwezi kurejesha kilele cha muda mfupi ambacho tayari kimewastanishwa ndani ya muda wa msingi; MIN si kigunduzi cha kuaminika cha kila hitilafu.

Faili huhifadhi kumbukumbu moja kwa kila kitendakazi kwa kila azimio, kwa hivyo kuweka zote nne katika maazimio manne kunamaanisha kumbukumbu kumi na sita na mara nne ya mzigo wa thamani wa kuweka wastani pekee na safu sawa. Gharama ya kichwa na hali ya maandalizi pia hutumia nafasi. Wasifu wote mitatu iliyosafirishwa huchagua vitendakazi vinne; chagua uhifadhi kulingana na maswali na mahitaji ya uwezo wa utekelezaji wako.

Ikiwa utaweka wastani pekee, huwezi kuuliza baadaye kuhusu vilele. Vilele hivyo havikuwahi kuandikwa. Hili ndilo jambo la kawaida zaidi la kujuta katika usakinishaji wa muda mrefu, na haliwezi kurekebishwa nyuma.

Baadhi ya njia za vitu vya kuchora hubadilisha kitendakazi kinachopatikana wakati kinachoombwa hakipo; njia zingine zinaweza kushindwa. Thibitisha DEF iliyotengenezwa na nyaraka halisi kama ilivyoelezwa katika [Jinsi grafu zinavyochorwa](/sw/concepts/how-graphs-are-drawn/).

## Unknown ni thamani halisi

RRD hutofautisha sifuri na unknown. Sifuri inaweza kuwa kiwango kilichoripotiwa au kiwango kilichohesabiwa, kama vile kaunta isiyobadilika. Unknown inaweza kutokana na masasisho yanayokosekana, muda wa mapigo ya moyo kuisha, pembejeo wazi ya unknown, mipaka iliyokataliwa au data duni ya ujumuishaji. Kubadilisha unknown na sifuri kunaweza kufanya vipimo vilivyokosekana au visivyo sahihi vionekane kama kutofanya kazi.

Unknown huenea kupitia ujumuishaji chini ya kiwango kilichowekwa kwa kila kumbukumbu. Wasifu uliosafirishwa huweka nusu: nafasi kubwa iliyojengwa kutoka kwa pembejeo zinazokosekana kwa kiasi fulani hubaki kuwa nambari halisi hadi zaidi ya nusu ya pembejeo zake ziwe unknown, ambapo nafasi nzima inakuwa unknown. Mwonekano unategemea upangaji wa nafasi, mapigo ya moyo, urekebishaji, ujumuishaji na uwasilishaji wa grafu. Hakuna muda wa hitilafu wa ulimwengu wote unaohakikisha pengo linaonekana au kutoweka katika kila kumbukumbu.

Unknown pia ndicho ambacho mipaka huzalisha. Usomaji ulio juu ya kiwango cha juu kilichosanidiwa haukatwi kwa kiwango cha juu. Kuweka upya kaunta kunaweza kutoa kiwango kilicho nje ya masafa na pengo, lakini mipaka haipati kila uwekaji upya. Data ya unknown pekee haitambui sababu; linganisha makosa ya ukusanyaji na mihuri ya muda.

## Uamuzi wa ukubwa

Kwa mpangilio usiobadilika, mzigo wa thamani wa kumbukumbu ni jumla ya nafasi katika nyaraka zote, mara idadi ya nyuga, mara baiti nane. Jumla ya faili na ukubwa wa utekelezaji pia unajumuisha vichwa, hali ya maandalizi, ugawaji wa mfumo wa faili, foleni na nakala rudufu. Matengenezo ya mpangilio wa wazi yanaweza kubadilisha ukubwa wa faili.

Wasifu mitatu iliyosafirishwa inatofautiana zaidi kuliko majina yake yanavyopendekeza.

| Wasifu | Hatua | Nafasi kwa kila uga | Mzigo kwa kila uga | Gharama inayolingana |
|---|---|---|---|---|
| Mkusanyiko wa Dakika 5 | sekunde 300 | 11,488 | takriban KiB 90 | 1 |
| Mkusanyiko wa Sekunde 30 | sekunde 30 | 40,284 | takriban KiB 315 | 3.5 |
| Mkusanyiko wa Dakika 1 | sekunde 60 | 81,716 | takriban KiB 640 | 7 |

Chanzo cha data cha kiolesura cha nyuga mbili huongeza maradufu kila moja ya hizo. Kiolesura elfu kumi kwenye wasifu wa dakika tano kina takriban GB 1.8 ya mzigo wa thamani wa kumbukumbu. Hizo elfu kumi sawa kwenye wasifu wa dakika moja ziko karibu na GB 13, na sababu si hatua pekee; wasifu huo pia huweka kumbukumbu ya kina zaidi ya kila mwezi na ya kila mwaka ya miaka kumi.

Kile ambacho kila kumbukumbu inashughulikia kinafaa kuangaliwa dhidi ya jina lake. Nyaraka za wasifu wa dakika tano zimepewa lebo ya Kila Siku, Kila Wiki, Kila Mwezi na Kila Mwaka, na vipindi vinavyoshikiliwa ni saa 50, siku 14.6, siku 64.6 na miaka 2.2. Majina yanaelezea mpangilio wa awali wa grafu ambao kila kumbukumbu ilipimwa, si uhifadhi. Ikiwa unahitaji kujibu swali kuhusu Aprili iliyopita kwa azimio la dakika tano, lebo itakuambia kuwa unaweza na kumbukumbu haitaweza.

Mzigo wa kuandika unasonga na wasifu pia, na unafika mapema kabla diski haijafika. Katika mwendo kamili wa ukusanyaji, hatua ya sekunde thelathini hutoa vipindi vya sampuli mara kumi zaidi ya hatua ya dakika tano. Upangaji wa vikundi, nyuga za pamoja, uteuzi wa kazi inayotakiwa na majaribio yaliyoshindwa huathiri amri na hesabu za uandishi wa kimwili; si uwiano uliowekwa. Tazama [Maandishi ya kiwango cha juu](/sw/concepts/high-volume-writes/).

## Ni nyuga zipi zinazofikia faili

Chanzo cha data kilichojengwa kutoka kwa kiolezo cha data hupata uga kwenye faili kwa nyuga tu ambazo kipengee cha grafu hurejelea katika njia ya kawaida ya uundaji. Msimbo wa sasisho unaweza kuondoa nyuga za kiolezo zisizorejelewa; ikiwa zinakusanywa inategemea mbinu ya uingizaji na akiba, si tu kama mstari unaonekana. Chanzo cha data kisicho na kiolezo hupata kila uga, kwa msingi kwamba huenda kusiwe na grafu ya kuuliza.

Rejeleo halihitaji kuchora mstari unaoonekana: kagua ramani za vipengee vya grafu pamoja na akiba na ufafanuzi wa faili. Kuongeza uga wa kiolezo pekee hakuthibitishi kuwa ukusanyaji, ramani ya grafu na uhifadhi vyote viko tayari. Kujenga upya akiba kunashughulikia metadata ya ukusanyaji; hakiongezi nyuga kwenye RRD iliyopo.

Pia inamaanisha kuongeza uga kwenye kiolezo hakuongezi kiotomatiki kwenye faili zilizopo, hata mara tu kipengee cha grafu kinaporejelea. Kuongeza uga kunahitaji matengenezo au uhamishaji wa wazi. Kulingana na toleo la RRDtool lililosakinishwa, urekebishaji unaweza kuongeza vyanzo vya data huku ukihifadhi data iliyopo; kufuta na kuunda upya faili hupoteza historia yake. Tazama [Dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/) kwa chaguzi za matengenezo na ukaguzi.
