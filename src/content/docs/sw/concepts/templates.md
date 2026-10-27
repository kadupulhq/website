---
title: Violezo
description: Jinsi ufafanuzi mmoja unavyoshughulikia vifaa mia moja, na nini hutokea unapobadilisha.
sidebar:
  order: 3
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
---

Violezo vimeundwa ili juhudi za kuongeza swichi ya mia moja ziwe sawa na kuongeza swichi ya pili. Kuna aina nne, na zimepangwa katika safu.

Kwa mlolongo wa vitendo, tazama [tumia na uthibitishe mchakato wa kiolezo](/sw/guides/template-workflow/).

**Violezo vya data** huamua nini cha kukusanya na jinsi ya kukihifadhi: nyuga, aina zao, mipaka, wasifu wa uhifadhi, na mbinu gani ya ingizo itakayokusanya nambari. Nyuga za kila kipengee na faili zilizopo za RRD zinaweza kutofautiana na kiolezo cha sasa; kiolezo si uthibitisho wa pekee wa muundo halisi wa faili.

**Violezo vya grafu** huamua jinsi grafu inavyochorwa: vipengee gani, kwa mpangilio gani, katika rangi gani, kwenye mistari gani ya maelezo, na kile kilichoandikwa kwenye mihimili.

**Violezo vya kifaa** huleta pamoja hojaji za data na violezo vya grafu vinavyolingana na kundi la maunzi, ili kuchagua kiolezo sahihi wakati wa kuongeza kifaa kukamilishe kazi nyingi.

**Hojaji za data** hushughulikia hali ambapo hujui mapema hasa vitu vingapi vilivyopo. Swichi ina idadi ya milango inayopatikana kwa kukagua kifaa, na hojaji ya data huhifadhi matokeo yaliyowekwa kwenye faharasa ili kuunda grafu. Ugunduzi pekee haufanyi idadi maalum ya grafu au vyanzo vya data.

## Jinsi safu zinavyopangwa

Vipengele hivi vinne si safu nne zinazofanana za kitu kimoja. Kila kimoja kinaelekeza kwa kile kilicho chini yake.

| Aina | Kinachoelekeza | Kinachounda |
|---|---|---|
| Kiolezo cha kifaa | Violezo vya grafu na hojaji za data | Hakuna kitu moja kwa moja. Ni orodha ya uwezo uliopangiwa kifaa |
| Hojaji ya data | Ufafanuzi wa grafu na ulinganishaji wa matokeo yaliyowekwa kwenye faharasa | Safu zilizogunduliwa; uundaji wa grafu zilizochaguliwa unaweza kuunda au kutumia tena vyanzo vya data |
| Kiolezo cha grafu | Nyuga za kiolezo cha data ambapo kipengee kinahitaji data | Grafu inayoweza kuelekeza kwenye vyanzo vingi vya data |
| Kiolezo cha data | Mbinu ya ingizo na wasifu wa uhifadhi | Metadata ya chanzo cha data; wakati uandishi unahitajika, RRD huundwa |

Vipengee vya kiolezo vinavyobeba data huelekeza kwenye nyuga za kiolezo; vipengee vilivyotekelezwa vinalinganishwa na nyuga za mitaa. Maandishi na vipengee visivyobadilika havihitaji marejeleo ya chanzo cha data. Uundaji wa grafu hutatua ulinganishaji huo, na mabadiliko ya baadaye ya kiolezo au marekebisho ya kipengee yanaweza pia kuyabadilisha. Uundaji wa grafu unaweza kutumia tena vyanzo vya data vinavyoendana badala ya kutengeneza faili mpya kwa kila grafu.

## Kulingana na kiolezo au kwa kila kipengee

Nyuga nyingi katika viwango vya grafu na chanzo cha data zina bendera (flag) inayoambatana kwenye safu ya kiolezo. Kwa nyuga hizo, bendera hudhibiti ueneaji wa kawaida kwa vipengele tanzu vilivyounganishwa. Nyuga zingine, vipengee vya grafu, na ulinganishaji wa ingizo vina sheria tofauti za ubadilishaji.

| Bendera | Maana | Wakati wa kuhifadhi |
|---|---|---|
| Imezimwa | Uga unategemea kiolezo | Huandikwa kwa kila kipengele tanzu, ikifuta thamani ya awali |
| Imewashwa | Uga ni wa kila kipengee | Hubakia bila kubadilika katika kila kipengele tanzu |

Bendera ni tofauti kwa kila uga. Kiolezo cha grafu kinaweza kulazimisha lebo zake za mhimili kwa grafu zilizounganishwa huku kikiacha kichwa na mipaka ya wima kwa hiari ya muundaji. Mchanganyiko huu ni kanuni ya kawaida, si ubaguzi.

Tabia mbili za muundo huu mara nyingi huleta mkanganyiko.

Bendera iko kwenye kiolezo, na huamua tu hatua inayofuata ya kuhifadhi. Mara uga unapofutwa na kuandikwa upya, kuiweka alama kama ya kila kipengee hakurudishi thamani ya awali. Thamani za zamani za kipekee zimepotea; bendera hulinda tu mabadiliko ya baadaye.

Kinyume chake ni hatari zaidi. Kuzima bendera ya uga ambao umekuwa wa kila kipengee kwa miaka mingi husababisha uhifadhi mmoja kufuta uga huo katika vipengele vyote tanzu kwa kutumia thamani ya kiolezo, ambayo mara nyingi ni thamani ya msingi ambayo hakuna mtu aliyewahi kuiangalia.

### Si kila uga unaobeba bendera

Uga hushiriki katika mchakato huu ikiwa tu una bendera. Katika kiwango cha chanzo cha data, nyuga nne zina bendera na mbili hazina kwa makusudi.

| Uga | Una bendera | Mwenendo |
|---|---|---|
| Jina | Ndiyo | Kulingana na kiolezo au kwa kila kipengee |
| Imewashwa | Ndiyo | Kulingana na kiolezo au kwa kila kipengee |
| Hatua | Ndiyo | Kulingana na kiolezo au kwa kila kipengee |
| Wasifu wa uhifadhi | Ndiyo | Kulingana na kiolezo au kwa kila kipengee |
| Mbinu ya ingizo | Hapana, daima huchukuliwa kuwa ya kiolezo | Kishughulikia uhifadhi wa kiolezo husasisha wazi safu za vyanzo vya data vinavyohusika |
| Njia ya faili ya RRD | Hapana, kamwe si ya kiolezo | Ueneaji wa kawaida wa kiolezo unaiepuka; marekebisho ya kiolezo huhifadhi njia iliyopo |

Uhifadhi wa njia hulinda uhusiano uliopo na historia wakati wa mabadiliko ya kawaida ya kiolezo. Hii haimaanishi kuwa njia haiwezi kubadilishwa au kuhamishwa kupitia shughuli zingine za usimamizi. Thibitisha utambulisho wa faili kabla ya kufanya mabadiliko.

Nyuga za vipengee vya chanzo cha data zote hubeba bendera: jina la uga, aina yake, mapigo ya moyo, kiwango cha chini, kiwango cha juu, na uga wa ingizo unaoilisha data.

## Maingizo ya grafu hufanya kazi upande mwingine

Kiolezo cha grafu kinaweza kutangaza ingizo lenye jina linalounganisha vipengee kadhaa vya grafu kwenye uga mmoja unaoweza kuhaririwa, ili kuhariri thamani kwenye grafu kusasishe kila kipengee kinachoishiriki. Huu ndio utaratibu unaowezesha rangi moja au mipangilio ya maelezo kudhibiti kikundi cha vipengee vinavyohusiana.

Thamani inayoieneza si thamani kutoka kwa kiolezo. Inasoma thamani ya sasa kutoka kwa vipengee vingine vilivyojumuishwa kwenye ingizo na kuitumia. Kwa hivyo ingizo la grafu huenea kwa upande kati ya vipengee vya grafu yenyewe badala ya kushuka chini kutoka kwenye kiolezo, ikimaanisha kuwa kuhariri ingizo kunaweza kubadilisha grafu ambayo kiolezo hakikugusa moja kwa moja.

## Nini huenea na lini

| Mabadiliko | Je, hufikia vitu vilivyopo | Jinsi gani |
|---|---|---|
| Uga wa kiolezo cha grafu, kulingana na kiolezo | Ndiyo, wakati wa kuhifadhi | Huandikwa kwa kila grafu iliyoundwa kutoka kiolezo hicho |
| Uga wa kiolezo cha grafu, kwa kila kipengee | Hapana | Kitu tanzu huhifadhi thamani yake yenyewe |
| Mwonekano wa kipengee cha grafu | Ndiyo, wakati wa kuhifadhi | Rangi, uwazi, aina ya kipengee, upana wa mstari, dashi, CDEF, VDEF, uhamishaji, kitendakazi cha ujumuishaji, upangaji, maandishi, na umbizo la maelezo |
| Kuongeza, kuondoa au kupanga upya kipengee cha grafu | Inategemea operesheni | Kulinganisha, kuongeza, kufuta na kupanga upya hutumia njia tofauti; thibitisha ulinganishaji wa vipengee vya mitaa unaotokana |
| Uga wa kiolezo cha data, kulingana na kiolezo | Ndiyo, wakati wa kuhifadhi | Huandikwa kwa kila chanzo cha data kilichoundwa kutoka kiolezo hicho |
| Thamani za nyuga za ingizo za kiolezo cha data | Ikiwa zinalingana na kiolezo | Bendera za kiolezo na tanzu, nyuga za faharasa ya hojaji na sheria za mwenyeji huweka mipaka ya ueneaji |
| Wasifu wa uhifadhi wa kiolezo cha data, hatua, nyaraka | Katika hifadhidata pekee | Faili zilizopo huhifadhi muundo zilizoundwa nazo |
| Kuongeza uga mpya kwenye kiolezo cha data | Katika hifadhidata pekee | Hakuna nafasi katika faili zilizopo ya kuziweka |
| Yaliyomo kwenye kiolezo cha kifaa | Usawazishaji tofauti | Kuhariri uhusiano pekee hakusawazishi kila kifaa kilichopo kiotomatiki |

Mbinu ya ueneaji katika hifadhidata inategemea njia ya kuhifadhi na sheria za kubatilisha. Kusasisha metadata ya kiolezo hakuhariri kiotomatiki faili zilizopo za RRD; matengenezo ya faili ni operesheni tofauti. Baadhi ya vidhibiti vya muundo hubakia vya kusoma tu katika kihariri cha kiolezo cha data kinachotumika. Tazama [unda violezo maalum](/sw/guides/create-custom-templates/).

## Violezo vya kifaa vina njia dhahiri ya usawazishaji

Kuhariri uhusiano wa kiolezo cha kifaa hubadilisha chaguo zinazopatikana kwa vifaa vipya. Vifaa vilivyopo hutumia operesheni tofauti ya kutumia tena/kusawazisha. Zana ya pamoja huchagua kwa msingi vifaa vilivyo katika hali ya Up au Recovering, isipokuwa mpigaji simu ajumuishe wazi vifaa vilivyozimwa; kagua uteuzi kabla ya kudhani kila kifaa kimesasishwa.

Usawazishaji huongeza uhusiano uliokosekana wa violezo vya grafu, huonyesha upya hojaji za data zilizochaguliwa, na unaweza kuondoa uhusiano wa violezo vya grafu usiotumika ambao hauhitajiki tena. Kuondoa kiolezo kutoka kiolezo cha kifaa hakufuti moja kwa moja grafu zilizopo. Pia huchochea vifungashio vya otomatiki na programu-jalizi, ambavyo vinaweza kuendesha otomatiki ya grafu iliyosanidiwa.

Kagua uhusiano wa vifaa na grafu zinazotokana baada ya usawazishaji. Huenda zisiwe muungano wa kudumu wa kila toleo la kiolezo lililotumika hapo awali.

## Faharasa na kwa nini milango hubadilika

Hojaji ya data inapaswa kuamua ni sehemu gani iliyogunduliwa inayolingana na chanzo gani cha data kilichopo. Hii ndiyo faharasa (index). Faharasa za nambari zinaweza kubadilika baada ya mabadiliko ya maunzi au usanidi. Uga thabiti unaofaa unaweza kusaidia kudumisha utambulisho, lakini majina ya violesura yanaweza pia kubadilika au kutumika tena. Thibitisha upekee, uthabiti na mwenendo wa kuweka upya faharasa kwenye kifaa halisi; jina la uga pekee halihakikishii mwendelezo.

Uamuzi huu unaonekana kuwa rahisi wakati wa kuufanya lakini unakuwa wa gharama kubwa sana ukikosea. Hufanywa kwa kila kifaa kwa kila uendeshaji badala ya mara moja kwa hojaji, kwa hivyo swichi mbili zinazofanana zinaweza kuwekwa kwenye faharasa kulingana na nyuga tofauti. Jinsi nyuga zinavyochaguliwa, nini hutokea wakati faharasa inapotea, na gharama ya kugundua upigaji nambari upya imeelezwa katika [hojaji za data na faharasa](/sw/concepts/data-queries-and-indexes/).

## Kubadilisha kiolezo baadaye

Mabadiliko ya grafu huathiri utoaji unaofuata baada ya uhifadhi na ueneaji husika kukamilika. Ubatilishaji na uhifadhi wa picha kwenye kache unaweza kuathiri kile anachoona mtumiaji, kwa hivyo usidhanie kuwa kila grafu itabadilika mara moja. Jaribu grafu tanzu ya mfano na ulinganishaji wa vipengee vyake; tazama [rekebisha mwonekano wa grafu](/sw/guides/tune-graph-appearance/).

Kuhifadhi kiolezo cha data hakubadilishi kiotomatiki muundo wa faili zilizopo za RRD. Ufafanuzi halisi wa chanzo cha data na nyaraka katika faili zinaweza kutolingana na wasifu wa hifadhidata. Kagua zote mbili kabla ya matengenezo; kuunda faili mbadala ni chaguo moja tu.

Kulingana na mabadiliko, urekebishaji unaotumika wa RRDtool, kubadilisha ukubwa wa nyaraka au kazi za utupaji/urejeshaji zinazodhibitiwa zinaweza kuhifadhi sehemu au historia yote iliyopo. Shughuli hizi zina mipaka na zinahitaji nakala rudufu na uthibitishaji; hazijengi upya data ambayo haikuwahi kuhifadhiwa. Kufuta faili na kuiunda upya hupoteza historia yake. Tazama [dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/) na [vyanzo vya data na nyaraka za round-robin](/sw/concepts/data-sources-and-rras/).

## Vitu vingine vinavyoitwa violezo

Vipengee vingine vinne vinatumia jina hili lakini havifanyi kazi kama vile vinne vilivyo hapo juu. Violezo vya rangi ni paleti zenye majina zinazotumiwa kwenye vipengee vya grafu. Violezo vya jumla huelezea jinsi grafu kadhaa zinavyounganishwa kuwa moja. Violezo vya otomatiki hulinganisha vifaa vilivyogunduliwa na kiolezo cha kifaa. Ufafanuzi wa mipangilio ya awali ya grafu hutoa mipangilio ya maelezo inayoweza kutumika tena.

Hakuna hata kimoja kati ya hivyo kilicho sehemu ya safu iliyoelezwa hapa. Kujua kuvihusu ni muhimu hasa ili kutambua aina sahihi wakati matokeo ya utafutaji yanapotaja violezo.
