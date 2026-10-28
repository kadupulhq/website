---
title: Uandishi wa kiwango cha juu
description: Kwa nini masasisho ya RRD yanawekewa mipaka na idadi ya uandishi badala ya ukubwa wa uandishi, nini unachopata kwa kuyapanga kwa mafungu, na gharama yake katika ubichi wa data.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 10
---

Masasisho ya RRD hugusa faili nyingi na yanaweza kuwekewa mipaka na ucheleweshaji wa hifadhi na shughuli
za I/O, si tu kipimo data cha uhamishaji. Uandishi ulioahirishwa, unaoitwa pia Boost, hukusanya sampuli
kwenye hifadhidata na kupanga masasisho kwa kila faili kwa mafungu. Pima mwandishi na hifadhidata kabla
ya kuichagua: mapengo ya grafu pekee hayatambui kikwazo cha hifadhi.

## Njia chaguomsingi

Wakusanyaji huingiza matokeo kwenye foleni ya `poller_output` iliyo safarini. Mwandishi hupanga sampuli
kwa faili na muhuri wa muda, husasisha RRD, na hufuatilia uthibitisho kabla ya kuondoa sampuli zinazostahiki.
Uandishi ulioshindwa unaweza kuacha safu mlalo ili kujaribu tena, kwa hivyo foleni haizuiliwi kwa awamu ya
sasa ya upigaji kura pekee.

Katika marekebisho yaliyopitiwa, foleni hii hutumia InnoDB. Ukaguzi wa awali wa ukusanyaji hukataa foleni
ya MEMORY; kuwasha upya hifadhidata hakutupilii mbali safu mlalo zilizowekwa kama ingefanya kwa jedwali la
MEMORY. Uimara bado unategemea usanidi wa hifadhidata, afya ya hifadhi na nakala rudufu. Tazama
[Boresha kwa usalama](/sw/guides/upgrade-safely/) kwa uhamaji wa foleni na ukaguzi wa hifadhi.

Kama makadirio mabaya ya mzigo, faili 10,000 tofauti zinazosasishwa kila sekunde 300 zinamaanisha takriban
masasisho 33 ya faili kwa sekunde kwa wastani. Uandishi halisi hufika kwa milipuko; sehemu nyingi za vyanzo
vya data zinaweza kushiriki faili moja, vipindi vinaweza kutofautiana, na hesabu ya amri si sawa na hesabu ya
I/O ya diski halisi. Linganisha ucheleweshaji uliopimwa wa mwandishi na umri wa foleni na dirisha la upigaji kura lililopo.

## Kile ambacho upangaji kwa mafungu hubadilisha

Pamoja na uandishi ulioahirishwa kuwezeshwa, ukusanyaji huweka sampuli katika `poller_output_boost` kwa
ajili ya usindikaji wa baadaye. Mwandishi wa mafungu hupanga sampuli kulingana na chanzo cha data katika mpangilio
wa muhuri wa muda na anaweza kutuma mihuri kadhaa ya muda katika amri moja ya kusasisha RRDtool. Sampuli kumi
na mbili zinaweza kutoshea katika amri moja, lakini hii haitoi hakikisho la uandishi mmoja wa diski halisi.

Urefu wa juu zaidi wa hoja uliosanidiwa hupunguza mifuatano ya sasisho; chaguomsingi ni 2,000. Inaathiri
upangaji wa mafungu. Usihitimishe kikomo maalum cha mfumo wa uendeshaji kutoka kwa mpangilio huu: uandishi wa
ndani uliothibitishwa hutumia mtiririko wa amri wa RRDtool, na usafirishaji halisi na saizi ya amri inayotumika ni muhimu.

Mratibu kawaida hufuzu wakati kipima muda chake kinapofika (dakika 60 kwa chaguomsingi) au hesabu ya safu mlalo
inayokadiriwa ya bafa inapozidi kiwango kilichosanidiwa (1,000,000 kwa chaguomsingi). Makadirio ya safu mlalo
yanajumuisha majedwali ya moja kwa moja na ya kumbukumbu. Mwito wa mratibu bado lazima ufanyike, na ukaguzi wa
mchakato, maandalizi au kushindwa kwa mwandishi kunaweza kuchelewesha kazi. Uendeshaji wa kulazimishwa, uondoaji
baada ya kuzima, na masasisho ya grafu ya mahitaji ni njia za ziada; chaguomsingi si hakikisho la ubichi wa saa moja.

Muda ambao ni sifuri au si nambari chanya kamili hubadilishwa na dakika 120; chaguomsingi ya kawaida ni dakika 60.

## Mzunguko, na kwa nini upo

Usanidi wa mafungu huunda jedwali tupu linalolingana na bafa ya moja kwa moja, kisha hubadilishana majina kwa
taarifa moja ya `RENAME TABLE`. Jedwali la zamani la moja kwa moja linakuwa kumbukumbu yenye muhuri wa muda
na wazalishaji hulenga mbadala. Hii hutenganisha kundi kutoka kwa uwekaji mpya, lakini kufuli za hifadhidata na
ushindani wa rasilimali bado kunaweza kuchelewesha ukusanyaji.

Wafanyakazi huchakata kumbukumbu za sasa na zilizohifadhiwa. Mchakato mkuu hukagua ukamilishaji na hali ya mtoto;
uendeshaji ulioshindwa au usio na uthibitisho huhifadhi kumbukumbu ili kujaribu tena. Wakati wa usafishaji unaostahiki,
kumbukumbu tupu zinaweza kufutwa na sampuli zilizobaki zinaweza kupangwa tena kwenye bafa ya moja kwa moja kabla
ya kufuta kumbukumbu. Kumbukumbu isiyo tupu haitupwi tu kwa sababu mchakato umekwisha. Kagua foleni za moja kwa
moja na za kumbukumbu wakati wa kugundua mrundikano.

Huu ni ushughulikiaji wa kujaribu tena, si hakikisho la jumla la usalama wa kuacha kufanya kazi. Hitilafu za
hifadhidata, shughuli zinazofanana, hitilafu za hifadhi na uthabiti wa nakala rudufu bado unahitaji uthibitisho
katika mazingira yanayoendeshwa.

## Kwa nini kutazama grafu kunaweza kusasisha faili zake

Njia ya kawaida ya grafu inaweza kujaribu masasisho ya mahitaji kwa kila chanzo cha data kinachorejelewa na grafu
kabla ya kuionyesha. Haiondoi kila sampuli inayosubiri bila masharti: ukaguzi wa mkusanyaji, njia za wakati halisi/chanzo/hitilafu,
vikomo vya upigaji kura vinavyotumika, vikomo vya maswali na hitilafu za sasisho huathiri kile kinachoendeshwa.
Sampuli za hivi karibuni au zilizoshindwa zinaweza kubaki kwenye foleni.

Kwa hivyo grafu inayoonekana kuwa ya sasa haithibitishi kuwa mti mzima wa RRD ni wa sasa, na kuomba grafu hakuthibitishi
uchezaji mzuri. Angalia hitilafu za mwandishi, umri wa foleni na mihuri halisi ya muda ya RRD. Nakala rudufu za faili
pekee huacha sampuli za hifadhidata zinazosubiri; tazama [Hifadhi nakala na urejeshe](/sw/guides/back-up-and-restore/).

## Unachotoa kama fidia

**Ubichi wa faili.** Sampuli hubaki kwenye hifadhidata hadi zitakapochakatwa kwa mafanikio. Usakinishaji mzuri
unaoendeshwa na kipima muda unaweza kuchelewa takriban kipindi cha usafishaji; mwandishi aliyeshindwa au mwenye
uwezo mdogo anaweza kuchelewa zaidi. Hifadhi nakala za foleni na faili zinazosubiri mara kwa mara.

**Ratiba ya pili.** Fuatilia upigaji kura na usafishaji kando. Angalia safu mlalo za moja kwa moja, kumbukumbu
zilizohifadhiwa, umri wa sampuli ya zamani zaidi, wafanyakazi walioshindwa na upitishaji wa mwandishi. Jedwali la
moja kwa moja halihitaji kuwa tupu wakati wazalishaji bado wanaingiza, na mzunguko pekee unaweza kuifanya ionekane
ndogo bila kukamilisha masasisho yoyote ya RRD.

**Mpangilio.** Faili za RRD hazikubali mihuri ya muda ya zamani baada ya masasisho mapya zaidi. Njia ya kisasa ya
Boost huruka masasisho ya zamani, na njia ya urithi huchuja mihuri ya muda dhidi ya sasisho la mwisho la faili.
Kwa hivyo amri inayotambuliwa kuwa imefaulu inaweza kuruka data ya zamani; uwasilishaji wa kuchelewa hauhakikishii
kuwa sampuli itaonekana kwenye grafu.

**Eneo la uendeshaji.** Kuna bafa ya hifadhidata, mchakato wa usafishaji wenye kikomo cha kumbukumbu, wafanyakazi
wa hiari wanaofanana, na kumbukumbu zilizohifadhiwa au sampuli zilizopangwa tena kwenye foleni za kufuatilia.
Kushindwa kwa mwandishi wa ndani kwa ujumla huhifadhi sampuli ili kujaribu tena, lakini hii haianzishi kutopoteza
kwa mwisho hadi mwisho. Kwa njia ya urejeshaji wa mbali, tazama
[Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/).

## Lini inafaa kutumika

Fikiria uandishi ulioahirishwa wakati kipimo kinaonyesha mwandishi wa RRD ndiye kikwazo na hifadhidata ina uwezo
wa kuhifadhi na maswali ya mafungu. Haiondoi ucheleweshaji wa kifaa au kurekebisha hifadhidata iliyojaa kupita kiasi.
Linganisha upitishaji, umri wa foleni, ubichi wa faili na matumizi ya rasilimali kabla na baada ya kuiwezesha.

Poller kuu huwezesha kiotomatiki usasishaji ulioahirishwa wakati mkusanyaji wa data wa mbali aliyewezeshwa amesanidiwa.
Mpangilio huo pekee hauanzishi hifadhi ya mbali iliyothibitishwa au upelekaji wa urejeshaji; tumia mipaka katika
[Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/).

## Kipengele tofauti chenye jina lile lile

Picha za grafu zilizotolewa zinaweza pia kuhifadhiwa kwenye kache. Uhifadhi wa kache wa picha hupunguza utoaji
unaorudiwa; uandishi ulioahirishwa hukusanya sampuli za hifadhidata kuwa masasisho ya RRD. Mipangilio yao ni tofauti,
lakini njia zao za utekelezaji huingiliana: maombi ya grafu yanaweza kuangalia sampuli zinazosubiri kabla ya kutumia
picha iliyohifadhiwa, na masasisho yaliyofanikiwa yanaweza kusababisha picha mpya kutolewa. Tathmini ubichi wa picha
kando na ubichi wa foleni na RRD.
