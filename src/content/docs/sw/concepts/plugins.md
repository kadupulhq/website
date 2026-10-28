---
title: Programu-jalizi (Plugins)
description: Kwa nini eneo la upanuzi ni orodha ya pointi zilizotajwa za kupigia simu, kile programu-jalizi inarithi kwa kufanya kazi ndani ya mchakato, na nini walinzi walioizunguka huzuia na wasichozuia.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 11
---

Programu-jalizi ni msimbo ambao programu huujumuisha katika mchakato wake yenyewe na kuuita kwenye pointi zilizotajwa.
Kila sifa nyingine ya muundo wa programu-jalizi inafuata kutoka kwa sentensi hiyo moja.

Kwa kile unachopaswa kusoma kabla ya kusakinisha programu-jalizi ya mtu mwingine, tazama
[Sakinisha na kagua programu-jalizi](/sw/guides/install-and-vet-plugins/).

## Kwa nini inafanya kazi ndani ya mchakato

Angalia madhumuni ya programu-jalizi: kuongeza safu wima kwenye orodha ambayo programu inaonyesha,
kubadilisha chaguzi za grafu kabla ya kuchorwa, kuchukua hatua kwenye kifaa kinachofutwa,
au kuambatisha kichupo kipya. Kila moja ya hayo ni uhariri wa kitu ambacho programu inashikilia kwenye kumbukumbu wakati huo.

Mchakato wa mfanyakazi aliyetengwa (worker) ungehitaji kiolesura kilicho wazi na uthibitishaji wa matokeo yake.
Hiyo inaweza kuhifadhi utengano wa mamlaka, lakini sio utaratibu unaotumika hapa:
faili ya programu-jalizi inajumuishwa na kazi yake inaitwa moja kwa moja kwenye mchakato wa programu.

## Kile programu-jalizi inarithi

Msimbo wa programu-jalizi hufanya kazi kama akaunti ya mfumo wa uendeshaji inayoita, ikiwa na ufikiaji wa unganisho la hifadhidata ya mchakato na ruhusa za mfumo wa faili.
Mpiga simu wa wavuti anaweza pia kuwa na kipindi (session); mpiga simu wa CLI hana lazima ya kuwa nayo.
Utaratibu wa programu-jalizi hautoi utambulisho tofauti, kisanduku cha majaribio (sandbox), au uthibitishaji wa saini.

Ruhusa za watumiaji na vikundi hudhibiti ufikiaji wa programu; hazidhibiti msimbo wa kiholela wa PHP wa programu-jalizi.
Ruzuku za hifadhidata, ruhusa za mfumo wa faili, na vizuizi vya mchakato bado vinaweka kikomo kwa kile ambacho mchakato unaweza kufanya.
Kagua programu-jalizi kabla ya kusakinisha na uweke haki za akaunti ya programu zikiwa na mipaka.

## Mitindo miwili ya ulingaji

| Mtindo | Programu | Programu-jalizi isiyorudisha chochote |
|---|---|---|
| Taarifa (Notification) | Hupitisha hoja, hupuuza matokeo | Thamani iliyorudishwa haitumiwi; athari na vighairi bado vina umuhimu |
| Mabadiliko (Transformation) | Hupitisha thamani, hutumia kile kinachorudi | Inaweza kubadilisha thamani na null na kuvunja wapiga simu wa chini |

Mtindo wa mabadiliko ndio unaoruhusu programu-jalizi kuongeza kitufe, kupanua orodha ya vitendo, au kubadilisha grafu.
Hapa pia ndipo programu-jalizi zinapochanganyana: programu-jalizi mbili kwenye hatua moja huona matokeo ya ile iliyotangulia kulingana na mpangilio uliosanidiwa.

Mtumaji (dispatcher) huonya tu kuhusu safu kuwa isiyo ya safu, au thamani isiyo tupu hapo awali kuwa sawa na null, wakati safu mlalo nyingi za ndoano (hooks) zinazolingana zipo.
Uhakiki huo si uthibitishaji kamili wa mkataba wa ndoano; programu-jalizi moja inaweza kuharibu thamani bila onyo hili.

## Usajili ni hali, si ugunduzi

Ndoano huishi kwenye jedwali: programu-jalizi ipi, jina la ndoano lipi, faili ipi, kazi ipi, imewashwa au la.
Taratibu za usakinishaji, uboreshaji, na usanidi zinaweza kusajili ndoano; usajili hauko tu kwenye usakinishaji wa kwanza.

Njia mbadala ingekuwa ugunduzi wakati wa ombi, ikimaanisha kuchanganua saraka ya programu-jalizi na kujumuisha msimbo wa kila programu-jalizi ili kuuliza inachotaka.
Ukurasa mmoja hufikia pointi nyingi za ndoano. Kujumuisha kila kitu ili tu kugundua hakuna kilichoambatishwa ni jibu la gharama kubwa,
kwa hivyo programu huuliza jedwali, huhifadhi jibu kwenye kache kwa ombi hilo, na hujumuisha tu faili inayotajwa na safu mlalo inayolingana.

Chaguo hilo lina gharama inayofaa kujulikana. Jedwali linaweza kutofautiana na mfumo wa faili.
Saraka ya programu-jalizi iliyofutwa kwa mkono huacha safu mlalo zake nyuma.
Miito ya nyuma ya arifa inayokosekana inaweza kutoa maonyo yaliyopunguzwa; mtumaji wa mabadiliko hana onyo sawa la mwito wa nyuma unaokosekana.
Kumbukumbu tulivu haithibitishi kuwa usajili ni mzuri.

Mpangilio wa utekelezaji unatokana na mpangilio wa usajili wa programu-jalizi na unaweza kurekebishwa.
Kwa hivyo mlolongo wa mabadiliko hupangwa kwa kitu ambacho msimamizi anadhibiti.

## Kile ambacho programu-jalizi inaweza kufikia

| Uwezo | Kumbuka |
|---|---|
| Unda majedwali yake yenyewe | Imerekodiwa, ili uondoaji uweze kuyafuta |
| Ongeza safu wima kwenye majedwali yaliyopo, yakiwemo ya msingi | Imerekodiwa, ili uondoaji uweze kuyaondoa |
| Sajili nyanja za ruhusa (realms) | Sehemu mpya za kiolesura zinazodhibitiwa na ufikiaji |
| Tangaza utegemezi kwenye programu-jalizi zingine | Toleo linakaguliwa kabla ya kusakinisha |
| Fanya kazi kwenye wakusanyaji wa mbali | Utumaji unategemea ndoano, mtindo wa kuita, uwezo, na hali ya muunganisho |

Mabadiliko ya muundo yaliyorekodiwa ndiyo sababu ya uondoaji kuwa wa uharibifu.
Programu inaweza kufuta majedwali na safu wima zinazofuatiliwa, data ikiwemo.
Pia huita mwito wa nyuma wa uondoaji wa programu-jalizi kabla ya usafishaji.
Mwito huo wa nyuma unaweza kufanya mabadiliko mengine; mabadiliko yasiyofuatiliwa hayarudishwi kiotomatiki, na saraka ya chanzo cha programu-jalizi inabaki.

Nyanja zilizosajiliwa na programu-jalizi zinashikiliwa na watumiaji na vikundi kwa njia sawa na nyanja za msingi zinavyoshikiliwa.
Nyanja mpya zinaweza pia kutoa ufikiaji kwa msimamizi mkuu na mtumiaji wa sasa wa kipindi wakati usajili unaomba hivyo.
Kagua ruzuku zinazotokana baada ya usakinishaji na uboreshaji; usidhani sera yako iliyopo inashughulikia eneo jipya kiotomatiki.
Tazama [Ruhusa na ufikiaji](/sw/concepts/permissions-and-access/).

## Kile ambacho walinzi hulinda hasa

Walinzi wapo, na kuwasoma kunakueleza muundo wa tishio ni nini.

Faili ambayo ndoano hutaja hutatuliwa ndani ya saraka ya programu-jalizi hiyo yenyewe.
Njia inayotoroka hukataliwa na kuandikwa kama tukio la usalama.
Jina la saraka ya programu-jalizi linawekewa mipaka ya herufi, tarakimu, mstari wa chini (_), na kistari (-).
Usajili wa ndoano na nyanja unakubaliwa tu kutoka kwa kazi ambayo jina lake linafanana na utaratibu wa kusakinisha, kuboresha, au kusanidi;
wito kutoka mahali pengine popote hukataliwa na kuandikwa kwenye kumbukumbu.

Mlinzi wa njia huzuia faili ambayo safu mlalo ya ndoano inaweza kujumuisha.
Ukaguzi wa usajili unachunguza tu jina la kazi ya mpigaji simu kwa maneno ya kusakinisha, kuboresha au kusanidi;
hauthibitishi utendakazi mzima wa mzunguko wa maisha. Msimbo wa programu-jalizi unaweza kutumia jina kama hilo wakati wa upakiaji wa kawaida wa ukurasa, kwa hivyo kanuni hii si mpaka wa usalama.

Hawafanyi chochote kuhusu kile msimbo wa programu-jalizi hufanya mara tu unapoendeshwa. Si mipaka ya kizuizi na haikujengwa kama hivyo.

## Kuzimwa si kukatika kabisa

Aina chache za ndoano husajiliwa katika hali iliyowezeshwa wakati wa kusakinisha: zile zinazotoa kurasa za mipangilio, safu za usanidi, na ufafanuzi wa fomu.
Programu-jalizi inapaswa kusanidiwa kabla ya kuwashwa, kwa hivyo hizo hufanya kazi kwa vyovyote vile.

Programu-jalizi iliyozimwa kwa hivyo bado ina msimbo unaojumuishwa na kutekelezwa kwenye upakiaji fulani wa kurasa.
Kuzima ni swichi ya kipengele tu, na URL za moja kwa moja za programu-jalizi pia zinahitaji ukaguzi.
Ikiwa unashuku msimbo hasidi, tenga usakinishaji na ukague utaratibu wa kuondoa kabla ya kuomba uondoaji, ambao wenyewe unatekeleza msimbo wa programu-jalizi.
Kuondoa faili za chanzo pekee hakusafishi usajili au kubadilisha mabadiliko ya hifadhidata.

## Wakusanyaji wa mbali hupata eneo jembamba

Programu-jalizi hutangaza uwezo wake katika faili yake ya habari: ikiwa inafanya kazi wakati mkusanyaji anaweza kufikia usakinishaji mkuu,
ikiwa inafanya kazi wakati haiwezi, na ikiwa inashiriki katika ukusanyaji.

Kwenye mkusanyaji, ndoano zilizoorodheshwa hukaguliwa dhidi ya mahitaji ya uwezo.
Ndoano za mabadiliko zisizoorodheshwa bado hutumwa; ndoano za taarifa zisizoorodheshwa zinaweza kutumwa zikiwa mtandaoni au wakati programu-jalizi inatangaza usaidizi wa usimamizi/mwonekano wa nje ya mtandao.
Vurukisho haviandikwi kwa jumla kwenye kumbukumbu. Huu ni mantiki ya uelekezaji, si orodha pana ya kuruhusu au mpaka wa kutengwa;
kagua mtumaji na hali halisi ya muunganisho kwa ndoano unayotumia.

Sababu ni kwamba mkusanyaji ni mazingira tofauti. Usanidi wake ni nakala inayoweza kuwa ya masaa kadhaa nyuma, na inaweza kuwa haina kiungo chochote na hifadhidata kuu.
Ndoano iliyoandikwa kwa dhana kwamba hifadhidata kuu iko swali moja tu mbali si sahihi hapo,
kwa hivyo muundo unahitaji programu-jalizi kusema ni mawazo gani inafanya badala ya kuyakisia.
Tazama [Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/).

## Mkusanyaji (poller) ndio mahali pa gharama kubwa zaidi pa kuweka ndoano

Ndoano kwenye njia ya upigaji kura (polling) huendeshwa wakati tovuti yake ya simu inapofikiwa.
Marudio yake yanategemea tukio, mchakato, na uelekezaji wa mkusanyaji; si kila ndoano inayoendeshwa katika kila mchakato kila mzunguko.
Msimbo wa polepole kwenye njia ya mara kwa mara hutumia muda wa upigaji kura na unaweza kuchangia mapengo ya grafu.

Ndoano kwenye ukurasa huonyeshwa mara moja kwa mtu mmoja ambaye tayari anasubiri.
Zote mbili zinaonekana sawa katika jedwali la usajili lakini zinatofautiana kwa viwango vikubwa sana vya gharama.

## Kwa nini eneo linaonekana kutokuwa sawa

API ya ndoano inaonyesha tovuti za simu zenye madhumuni tofauti na miundo tofauti ya hoja.

Hiyo ndiyo sababu orodha ni pana na si ya kawaida, kwa nini pointi fulani zinakupa thamani ya kubadilisha na zingine zinakuambia tu tukio limetokea,
na kwa nini hoja zinatofautiana katika muundo kutoka ndoano moja hadi nyingine. Toleo la chini la msingi lililotangazwa halithibitishi utangamano na kila ndoano:
kagua hoja za kila tovuti ya simu na matarajio ya kurudi, na ujaribu programu-jalizi kwenye toleo lengwa.
Vikwazo vya utangamano wa CLI na ruzuku za nyanja vilivyoandikwa katika
[Sakinisha na kagua programu-jalizi](/sw/guides/install-and-vet-plugins/) vinatumika pia; usakinishaji wenye mafanikio pekee si ushahidi wa utangamano.

Ufafanuzi wa vitendo: programu-jalizi imeunganishwa kwa ukaribu sana na toleo la msingi ililoandikwa dhidi yake, kwa nguvu zaidi kuliko kiwango cha chini kilichotangazwa kinavyopendekeza.
Kagua upya programu-jalizi kabla ya uboreshaji wa msingi badala ya baada yake.
