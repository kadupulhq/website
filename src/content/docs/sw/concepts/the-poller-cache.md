---
title: Akiba ya poller
description: Kwa nini mkusanyaji husoma orodha ya kazi iliyohesabiwa mapema badala ya usanidi wako, na kwa nini hiyo ndiyo sababu ya kawaida mabadiliko huonekana kutofanya chochote.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 6
---

[Usanifu](/sw/concepts/architecture/) unaleta akiba ya poller katika sentensi moja:
orodha ya kazi huhesabiwa mapema, na mkusanyaji husoma orodha hiyo badala ya
kutathmini usanidi wako katika kila mzunguko. Ukurasa huu unahusu kile uamuzi huo
unachomaanisha hasa katika vitendo.

## Kile ambacho mkusanyaji angehitaji kufanya vinginevyo

Kuamua nini cha kukusanya kwa thamani moja kunahitaji kutatua mlolongo mzima wa
utegemezi. Chanzo cha data huelekeza kwenye kifaa na kiolezo cha data. Kiolezo
huelekeza kwenye ingizo la data. Ingizo la data lina sehemu, baadhi yao zimebatilishwa
kwa kila kifaa na baadhi zikarithiwa kutoka kwenye kiolezo. Ikiwa chanzo cha data
kilitoka kwenye hoja ya data, fahirisi ya sasa lazima itatuliwe kupitia akiba ya hoja.
Kisha vitambulisho vya SNMP lazima vipatikane kutoka kwenye kifaa, isipokuwa kama
sehemu inazibatilisha.

Hiyo inawakilisha miunganisho (joins) kadhaa kwa thamani moja tu. Usakinishaji wa
kawaida una makumi ya maelfu ya maadili na huendesha mzunguko mmoja kila baada ya
dakika tano. Kufanya azimio hili wakati wa ukusanyaji kungekuwa na maana kwamba
hifadhidata, na si mtandao, ndiyo ingeamua ni vifaa vingapi unavyoweza kufuatilia.

Kwa hivyo utatuzi hutokea mara moja tu wakati kitu kinapobadilika, na matokeo
huandikwa chini kwa njia tambarare.

## Kile ambacho akiba huhifadhi

Akiba huhesabu mapema maagizo ya ukusanyaji. Inapunguza utathmini unaorudiwa wa
usanidi, lakini haiondoi miunganisho au usomaji wa hali halisi ya kifaa moja kwa moja.

| Kilichomo kwenye safu | Kwa nini kipo hapo |
|---|---|
| Mkusanyaji gani anayeimiliki | Kila mkusanyaji huchagua safu zake pekee |
| Hatua: SNMP, hati, au seva ya hati | Huamua njia ipi ya msimbo inayotekelezwa |
| Jina la mwenyeji, toleo la SNMP, lango, muda wa kuisha, jumuiya au vitambulisho | Sehemu za muunganisho zilizohifadhiwa; hali halisi ya mwenyeji pia husomwa |
| OID, au mstari kamili wa amri ya hati | Tayari imebadilishwa, tayari kutekelezwa |
| Njia ya faili ya RRD | Tayari imetatuliwa |
| Jina la sehemu ndani ya faili hiyo na ni sehemu ngapi zilizomo katika usomaji kamili | Huruhusu matokeo kulinganishwa na kuthibitishwa |
| Hatua (step), na kuhesabu kurudi nyuma hadi wakati ujao kipengee hiki kinapohitajika | Tazama [Wakati na vipindi](/sw/concepts/time-and-intervals/) |

`cmd.php` inaunganisha `poller_item` na `host`, inachuja vifaa vilivyolemazwa, na
inatumia sehemu za kifaa moja kwa moja kwa ukaguzi wa upatikanaji na uwekaji upya
wa fahirisi. OID, amri, na metadata ya RRD iliyohifadhiwa bado inahitaji kuendana
na chanzo cha data kilichokusudiwa.

Vitambulisho vilivyohifadhiwa ni picha ya papo hapo, lakini kuhifadhi vitambulisho
vilivyobadilishwa kupitia API ya kifaa kwa kawaida huburudisha akiba iliyoathiriwa.
Uhariri wa moja kwa moja wa hifadhidata hupita njia hiyo na unaweza kuacha picha ya
papo hapo iliyopitwa na wakati. Thibitisha akiba halisi badala ya kudhani kila mabadiliko
ya kitambulisho yanahitaji ujenzi upya wa mikono.

Njia ya RRD pia ni picha ya papo hapo. Kuhamisha faili, au kubadilisha mahali faili
zinapoishi, huacha kila safu iliyohifadhiwa ikielekeza kwenye eneo la zamani.

## Kinachoiandika

Akiba inadumishwa kwa nyongeza na shughuli zinazojua zimebadilisha kitu.

| Operesheni | Safu zilizoandikwa upya |
|---|---|
| Kuhifadhi kifaa | Mabadiliko kwenye sehemu za muunganisho, mkusanyaji au hali ya kulemazwa huanzisha msukumo; sehemu za mkusanyiko zisizobadilika zinaweza kutumia njia ya uhifadhi wa haraka |
| Kuhifadhi chanzo cha data | Safu za chanzo hicho cha data |
| Kuunda grafu na vyanzo vya data kutoka kwa kiolezo | Safu zilizoundwa hivi karibuni |
| Uendeshaji wa hoja ya data ambao ulihamisha au kutatua fahirisi | Vyanzo vya data vilivyobadilika pekee |
| Ujenzi upya wa CLI | Vifaa vilivyowezeshwa vinavyochakatwa na wafanyakazi wake; kasoro ya sasa ya kusambaza `--host-id` inazuia kutegemea utengaji wa kifaa |

Kuandika upya si uwekaji wa upofu. Safu za vyanzo vya data vinavyojengwa upya
kwanza huwekwa alama kuwa hazipo, kisha seti mpya huandikwa, na chochote ambacho
bado kimetiwa alama kuwa hakipo hufutwa. Hivyo ndivyo inavyoondoa safu za sehemu
ambazo hazipo tena. Usafishaji wa bafa umewekewa mipaka na vitambulisho vya
mkusanyaji na chanzo cha data. Hiyo inalinda vyanzo visivyohusiana katika njia ya
kawaida inayolengwa; si hakikisho dhidi ya ujenzi upya unaofanyika kwa wakati mmoja
au maandishi ya hifadhidata yaliyoshindwa. Thibitisha safu zinazotokana baada ya
ujenzi upya, ikijumuisha kifaa cha karibu kisichoathiriwa wakati wa kuchunguza upeo.

## Safu ambazo haziandikwi kamwe

Baadhi ya usanidi hautoi safu mpya ya akiba. Angalia kumbukumbu pamoja na grafu.

Mjenzi huruka vifaa vilivyolemazwa, lakini hatua ya jumla ya **Lemaza** huhifadhi
safu zilizopo za akiba na mchakato wa ukusanyaji huchuja kifaa nje. Ujenzi upya ukiwa
umelemazwa unaweza kuondoa safu. Hatua ya jumla ya **Wezesha** hutumia tena akiba
iliyojaa au kuianzisha inapokuwa tupu; uhifadhi wa ziada wa kifaa kwa ujumla hauhitajiki.
Akiba iliyopo ya sehemu au ya zamani bado inahitaji uchunguzi.

Kipengee cha SNMP ambacho kifaa chake hakina usanidi wa SNMP unaoweza kutumika
hakitoi chochote. Hakuna toleo, toleo lililo nje ya masafa, au jumuiya tupu kwenye
toleo la 1 au 2 na safu inarukwa badala ya kuandikwa kama safu ambayo itashindwa kila mzunguko.

Wakati orodha iliyoidhinishwa ya ingizo imesanidiwa, faili inayokosekana au ingizo
lililokataliwa huzuia safu mpya za ingizo hilo. Ujenzi upya uliofanywa bado unasafisha
safu zake za zamani. Bila usanidi wa `input_whitelist`, ukaguzi huu unaruhusu maingizo;
si ulinzi unaowashwa daima. Kagua amri iliyokataliwa na sera iliyosanidiwa kabla ya
kubadilisha orodha iliyoidhinishwa.

Kiolesura bado kinaweza kuonyesha chanzo cha data ambacho akiba yake ni tupu. Grafu
yake inaweza kubaki na historia ya zamani au kuonyesha mapengo; mstari tambarare wa
sifuri si kiashirio cha kuaminika. Vitambulisho vinavyokosekana na maingizo yaliyokataliwa
ni hali za usanidi za kutatuliwa.

## Kwa nini mabadiliko yanaweza kuonekana kutofanya chochote

Taratibu tatu tofauti hutoa dalili sawa.

**Safu haikujengwa upya.** Ulibadilisha kitu ambacho kiolesura hakichukulii kama
kinachoathiri ukusanyaji, au ulikibadilisha nje ya kiolesura. Akiba bado inashikilia
jibu la zamani. Ujenzi upya unaweza kuburudisha sehemu zilizohifadhiwa baada ya
usanidi uliokusudiwa kuthibitishwa.

**Safu haikuwahi kujengwa.** Imeelezwa hapo juu. Ujenzi upya unatatua hili pia,
lakini baada tu ya hali ya msingi kurekebishwa; uchunguzi mara nyingi huonekana
kwenye kumbukumbu badala ya kwenye grafu.

**Thamani inakusanywa na kisha kutupwa.** Matokeo ya thamani nyingi huwekwa ramani
kupitia ufafanuzi wa sehemu za kiolezo, na sehemu zisizorejelewa zinaweza kurukwa
wakati wa uchanganuzi. Angalia majina ya sehemu yanayotarajiwa, ramani na miunganisho
ya grafu; kanuni hii haitupi sampuli zote za nambari bila rejeleo la grafu kiholela.
Ujenzi upya wa akiba hauwezi kurekebisha mkataba usio sahihi wa matokeo.

## Chombo butu

Kwa kifaa kimoja, tumia **Jaza Tena Akiba ya Poller** kwenye ukurasa wake wa kifaa
cha asili. Hatua hiyo huita njia ya `push_out_host()` yenye upeo wa kifaa. Angalia
safu na uchunguzi unaotokana baadaye.

Hati kuu ya sasa ya `rebuild_poller_cache.php` inakubali `--host-id`, lakini
haisambazi kichujio hicho kwa amri ya mfanyakazi wake. Ujenzi upya wa CLI unaodaiwa
wa kifaa kimoja unaweza kwa hivyo kujenga upya vifaa vingine vilivyowezeshwa.
Usitegemee chaguo hilo kwa utengaji hadi kasoro hii ya programu irekebishwe.

Ujenzi upya mpana wa CLI unapatikana kutoka kwenye mzizi wa programu, unaoendeshwa
kama mtumiaji wa poller:

```bash
php cli/rebuild_poller_cache.php
```

Huchakata vifaa vilivyowezeshwa; si ukarabati kwa kila chanzo kisicho na mwenyeji
au kilicholemazwa. Hii huandika kwenye jedwali za ukusanyaji na inaweza kuchukua muda.
Epuka ujenzi upya unaoingiliana na usiukatishe. Chaguo la `--force` la CLI linabatilisha
ulinzi wake wa usajili wa michakato, kwa hivyo si chaguo la kawaida la ukarabati.

Kujenga upya huburudisha hali inayotokana; hairekebishi ufikiaji wa kifaa, haihamishi
faili za RRD, hairekebishi amri za ingizo zilizokataliwa, au kurejesha historia
iliyopotea. Kagua akiba inayotokana, kumbukumbu na ukusanyaji unaofuata kabla ya
kuchukulia ukarabati kuwa umekamilika.

Kadupul hurekodi wakati akiba ilibadilika mara ya mwisho, ambayo ndiyo inaruhusu
sehemu nyingine za mfumo kutambua zinahitaji kuisoma tena.

## Wakusanyaji wengi

Kukiwa na zaidi ya mkusanyaji mmoja, kila safu ni ya mmoja wao haswa, na safu
zinatumwa kwenye hifadhidata ya mkusanyaji huyo na pia ile ya kati.

Ikiwa mkusanyaji wa mbali hawezi kufikiwa unapohifadhi mabadiliko, mabadiliko
hutua katikati na si kwa mbali, na Kadupul husema hivyo: inaomba usawazishaji
kamili mara tu mkusanyaji anaporudi. Hadi usawazishaji huo, mkusanyaji wa mbali
anaendesha orodha ya kazi ya zamani zaidi kuliko ile ambayo kiolesura kinakuonyesha.
Tofauti maalum ya mkusanyaji ni sababu ya kukagua hali ya unakili, muunganisho
na akiba ya ndani ya kila mkusanyaji.

Mpangilio katika mzunguko kamili, ikijumuisha mahali ambapo akiba inasomwa na
wakati amri za kuweka fahirisi upya zinapochakatwa, imo katika
[Mzunguko wa maisha ya poller](/sw/reference/poller-lifecycle/). Kwa kuongeza
wakusanyaji, tazama [Ongeza poller](/sw/guides/scale-the-poller/).
