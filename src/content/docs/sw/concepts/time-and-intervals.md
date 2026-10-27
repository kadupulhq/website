---
title: Muda na vipindi
description: Kipindi cha upigaji kura, hatua ya RRD, mapigo ya moyo na mkengeuko wa saa, na kwa nini muhuri wa muda kwenye sampuli huamua zaidi ya watu wanavyotarajia.
sidebar:
  order: 7
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
---

Ukusanyaji wa data unahusisha saa tatu: kasi ya kianzishaji, kipindi cha upigaji kura ndani ya kila wito, na hatua ya RRD. Zinahitaji mipangilio inayolingana.

| Nambari | Inamilikiwa na | Jinsi inavyotumika |
|---|---|---|
| Kipindi cha kianzishaji | Cron, Task Scheduler au `cactid.php` | Lazima ilingane na `cron_interval`, ikitafsiriwa na `poller.php` kama sekunde 60 au 300 |
| Kipindi cha upigaji kura | Mzunguko wa ukusanyaji | `poller.php` huhesabu idadi kamili ya mizunguko kwa kila kipindi cha kianzishaji |
| Hatua (Step) | Faili ya RRD | Kipindi cha msingi cha urekebishaji, kilichowekwa kutoka kwa wasifu wa chanzo cha data wakati wa uundaji |
| Mapigo ya moyo (Heartbeat) | Uga ndani ya RRD | Muda wa juu unaoruhusiwa kati ya masasisho; mchakato wa uundaji husoma ufafanuzi wa uga |

Kwa mfano, kianzishaji cha sekunde 60 na kipindi cha upigaji kura cha sekunde 10 huzalisha mizunguko sita kwa kila wito. Kianzishaji cha sekunde 300 na kipindi cha upigaji kura cha sekunde 300 huzalisha mzunguko mmoja. Kamwe usisanidi kipindi cha kianzishaji kuwa chini ya kipindi cha upigaji kura: 60/300 huhesabu mizunguko sifuri. Tumia kiratibu kimoja, na ukisimamishe kabla ya kuendesha amri ya mwongozo ya `--force`. Tazama [usakinishaji](/sw/start/install/).

Kuhariri wasifu hakuhariri faili zilizopo kiotomatiki. Mapigo ya moyo yanaweza kurekebishwa; kubadilisha hatua kunahitaji uhamishaji uliopangwa kwa kutumia zana zinazoungwa mkono za RRDtool iliyosakinishwa. Kagua ufafanuzi wa hifadhidata na matokeo ya `rrdtool info` baadaye.

## Zinapokubaliana

Chanzo cha data ambacho hatua yake inalingana na kipindi cha upigaji kura kinastahili katika kila mzunguko kulingana na hali ya kifaa, yaliyomo kwenye kache na mipaka ya muda wa uendeshaji. Thamani za msingi hutumia sekunde 300 kwa zote mbili. Kustahiki hakuhakikishii usomaji wenye mafanikio.

## Wakati hatua ni ndefu kuliko kipindi

Wakati ratiba nyingi zinazofanya kazi zinahitajika mkusanyaji wa PHP hutumia `rrd_next_step` kwenye kila safu ya orodha ya kazi. Huchagua safu zilizo kwenye au chini ya sifuri, kisha husasisha hesabu ya kurudi nyuma kwa mkusanyaji wake na mipaka ya mwenyeji. Safu ambazo hatua yake inalingana na kipindi cha upigaji kura hubakia sifuri. Safu zingine hupunguzwa kwa kipindi cha upigaji kura; chini ya mtiririko (underflow), uwekaji upya unategemea hali ya wito: mzunguko wa kawaida wa kianzishaji-tanzu huwekwa upya kuwa hatua kutoa kipindi, wakati vipindi vilivyo sawa na njia za wenyeji wote huwekwa upya kwa hatua kamili. Usidhanie hatua ya dakika kumi daima inamaanisha wito mbadala wa dakika tano; kagua safu halisi zinazosubiri na mihuri ya muda ya sasisho.

**Sawazisha Mzigo wa Mchakato (Balance Process Load)** ikiwa imewashwa, ujenzi wa kache huweka viwango vya uhamishaji katika vyanzo mfululizo vya data vya kifaa kwa kutumia hatua na kipindi cha upigaji kura. Nyuga za chanzo sawa hushiriki kiwango kimoja cha uhamishaji. Hii inaweza kueneza kazi katika mizunguko yote, lakini haitoi uhakika wa muda sawa wa uendeshaji: ucheleweshaji wa vifaa, muda wa kusubiri na hati hutofautiana. Kianzishaji pia hurekebisha hesabu za kurudi nyuma za nyuga zisizolingana ndani ya chanzo cha data.

Kabla ya kuhitimisha kuwa kipengee kimeharibika kwa sababu hakikutoa chochote wakati wa mzunguko, kagua hali yake inayosubiri na mizunguko inayofuata. Kwa mipaka ya ujenzi upya, tazama [kache ya kipima data](/sw/concepts/the-poller-cache/).

## Wakati hatua ni fupi kuliko kipindi

Hatua fupi haiwezi kutoa vipimo ambavyo mkusanyaji hakuwahi kukusanya. Kadupul huonya wakati wa kujenga kache ikiwa kasi ya ukusanyaji ni ya polepole sana kwa hatua husika; rekebisha mipangilio ya upigaji kura na ujenge upya kache iliyoathiriwa.

Kutolingana huku hakutengenezi grafu yenye muundo wa chanuo kwa lazima. RRDtool inaweza kurekebisha masasisho yasiyo ya mara kwa mara kuwa hatua fupi ikiwa mapigo ya moyo yanaruhusu, lakini hairejeshi maelezo ya vipimo vilivyokosekana.

## Mapigo ya moyo si mara zote mara mbili ya hatua

Mapigo ya moyo ni muda wa juu unaoruhusiwa kati ya masasisho kabla ya ingizo kuchukuliwa kuwa unknown. Uundaji wa RRD husoma mapigo ya moyo kutoka kwa ufafanuzi wa uga wa chanzo cha data, ambao unaweza kurithi mipangilio ya wasifu au kiolezo. Si muda wa ziada wa neema unaoongezwa kwenye hatua; thibitisha uga halisi na faili ikiwa yanatofautiana na wasifu.

Wasifu uliotolewa haufuati kanuni moja.

| Wasifu | Hatua | Mapigo ya moyo | Kikomo cha muda wa kusasisha |
|---|---|---|---|
| Dakika tano | 300 | 600 | Dakika 10 |
| Dakika moja | 60 | 600 | Dakika 10 |
| Sekunde thelathini | 30 | 1200 | Dakika 20 |

Hizi ni thamani zilizowekwa mapema kwenye wasifu, si vipima muda vya kugundua kukatika kwa huduma. Ingizo la wazi la unknown linaweza kuunda mapengo kabla ya mapigo ya moyo kuisha; urekebishaji na mipaka ya nyaraka huathiri kile kinachoonekana. Mapigo makubwa ya moyo huvumilia mapengo marefu kati ya masasisho halali. Katika au chini ya kipindi cha kawaida cha kusasisha, huacha nafasi ndogo au hakuna kabisa kwa ucheleweshaji.

Kagua faili halisi pamoja na wasifu. RRD zilizopo zinaweza kutofautiana na ufafanuzi wa hifadhidata uliobadilishwa; ukaguzi wa faili huripoti tofauti kama hizo. Kagua [ufafanuzi wa mapigo ya moyo ya RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) na [marejeleo ya urekebishaji](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) kabla ya kupanga mabadiliko ya faili.

## Kile kinachohifadhiwa si kile kifaa kilichosema

RRDtool hurekebisha masasisho kwa mipaka thabiti ya hatua. Thamani kati ya mipaka zinaweza kuchangia katika pointi kadhaa za msingi za data. Mapigo ya moyo, thamani za wazi za unknown na mipaka huathiri ingizo halali; ujumuishaji wa nyaraka unatekeleza mipaka yake ya data isiyojulikana. Kuweka thamani inayojulikana katika hatua hakuhitaji sampuli ghafi iliyotengwa pekee.

Thamani za kaunta hubadilishwa kuwa viwango kwa muda uliopita, ambayo inategemea uwekaji upya wa kaunta, ushughulikiaji wa kufungwa na mipaka. Thamani za geji hurekebishwa kwa wakati. Miinuko mifupi ya ghafla inaweza kupunguzwa kwa sampuli au kuachwa kabisa; thamani endelevu au masasisho yanayofungamana na mipaka hayapunguzwi kwa lazima. Mipangilio ya nyaraka haiwezi kuunda upya maelezo ambayo hayakuwahi kukusanywa au yaliyopotea wakati wa urekebishaji.

## Saa gani inayoamua

Kwa ukusanyaji wa kawaida wa `cmd.php`, SQL `CURRENT_TIMESTAMP()` hutoa muhuri wa muda wa matokeo wakati kundi linapoingizwa. Huu si muhuri wa muda uliotolewa na kifaa wala kipimo kamili cha wakati kifaa kilipojibu. Miundombinu mingine ya ukusanyaji na njia za wakati halisi zinapaswa kuchunguzwa tofauti.

Mkusanyaji wa PHP huweka matokeo yake kwenye bafa na kuyaandika kwa makundi, ikisafisha wakati kifaa kinapobadilika au bafa inapojazwa. Muhuri wa muda hupimwa mara moja kwa kila kundi, kwa hivyo kila thamani katika kundi hubeba wakati sawa.

Matokeo yake si dhahiri, kwa hivyo inafaa kuelezea kwa undani.

**Saa ya kifaa haiweki muhuri wa muda kwenye sampuli hizi za SNMP.** Mkusanyaji hutumia wakati wa kuingiza kwenye hifadhidata. Wakati wa kifaa bado unaweza kuwa muhimu kwa hati au maana ya kipimo fulani, kwa hivyo hii si sababu ya jumla ya kupuuza usawazishaji wa saa.

**Saa isiyo sahihi kwenye mkusanyaji au hifadhidata yake huhamisha data.** Thamani huwekwa alama katika nafasi zisizo sahihi, na katika faili iliyoandikwa kwa sehemu tayari, sasisho ambalo wakati wake si wa baadaye kuliko la mwisho hukataliwa mara moja. Ikiwa muhuri wa muda unarudi nyuma ya sasisho la mwisho la faili, masasisho mapya hayawezi kusogeza faili hiyo mbele hadi muhuri wao wa muda upite huo. Kagua saa ya hifadhidata, saa ya mkusanyaji na mihuri ya muda ya faili; kubadilisha tu saa ya mkusanyaji hakubadilishi mihuri ya muda inayotengenezwa na hifadhidata.

**Wakati ndani ya mzunguko unakuwa mtetemeko (jitter).** Kifaa kilichopigiwa kura karibu na mwisho wa uendeshaji mrefu hupata muhuri wa muda baadaye kuliko kifaa kilichopigiwa kura karibu na mwanzo, ingawa vyote viwili ni vya mzunguko mmoja. Kwenye mkusanyaji mwenye mzigo mkubwa, mtetemeko huo unaweza kuwa sehemu kubwa ya kipindi, na ni mojawapo ya njia ambazo mapigo ya moyo yaliyowekwa karibu sana na hatua huanza kutoa mapengo.

**Ukanda wa saa wa hifadhidata unakaa katikati ya safari ya kwenda na kurudi.** Muhuri wa muda huandikwa kama muhuri wa muda wa hifadhidata na kubadilishwa kuwa wakati kamili na hifadhidata inaposomwa. Ushughulikiaji usiolingana wa kanda za saa za kipindi unaweza kubadilisha tafsiri hiyo. Kagua mipangilio ya kipindi na mabadiliko wakati wa kugundua uhamishaji; kubadilisha tu ukanda wa saa wa kuonyesha hakuthibitishi kuwa historia iliyohifadhiwa imehamishwa.

## Usomaji huunganishwa kwa muhuri wa muda

Chanzo cha data chenye nyuga kadhaa, kama vile kiolesura chenye baiti zinazoingia na kutoka, kinaweza kutumia vipengee tofauti vya orodha ya kazi ya SNMP au hati inayotoa thamani nyingi zenye majina. Nyuga zilizochambuliwa hupangwa kwa chanzo cha data na muhuri wa muda kwa ajili ya masasisho ya RRD.

Seti isiyokamilika huhifadhiwa badala ya kuandikwa kwa sehemu hadi idadi inayotarajiwa ya nyuga itimizwe. Huu ni ukaguzi wa mkusanyiko, si uhakika kwamba kila uga una thamani halali ya nambari; thamani za wazi za unknown bado zinaweza kuandikwa. Kawaida sehemu zote mbili ziko katika kundi moja na hushiriki muhuri wa muda, kwa hivyo mchakato huu hauonekani. Makundi yaliyoingizwa ndani ya sekunde moja ya muhuri wa muda yanaweza pia kulingana. Wakati nyuga zinapokea mihuri tofauti ya muda, vikundi vinaweza kubaki bila kukamilika na visitoe sasisho lolote. Msimbo wa sasa huhifadhi vikundi visivyokamilika katika mizunguko yote, kisha huweka kwenye kumbukumbu na kumaliza muda wake baada ya sekunde `5 * max(60, poller_interval)`. Mpaka wa ukurasa wa kusoma umepanuliwa ili kujumuisha kikundi chake cha mwisho cha muhuri wa muda.

Masasisho hupangwa kwa mpangilio wa muda unaopanda kabla ya kuandikwa, kwa sababu faili haikubali thamani yoyote ya zamani kuliko sasisho lake la mwisho.

## Maandishi yaliyoahirishwa huhifadhi mihuri yao ya muda

Wakati maandishi ya RRD yanapoahirishwa na kutumika baadaye kwa wingi, muhuri wa muda uliorekodiwa husafiri na thamani na kundi huandikwa kwa mpangilio wa wakati. Muhuri wa muda wa mchana unahifadhiwa hata kama sasisho lilijaribiwa saa saba; haibadilishwi na wakati wa kusafisha bafa. RRDtool bado hurekebisha masasisho yanayokubalika kwa mipaka yake ya hatua.

Mlundikano wa kazi unaweza kusogeza faili mbele kupitia mihuri ya muda iliyopangwa iliyo mipya zaidi kuliko sasisho la mwisho la faili. Lakini hauwezi kujaza mashimo yoyote yaliyo nyuma ya muhuri huo wa muda. Mwandishi wa Boost huchuja sampuli zilizo sawa au kabla ya sasisho la mwisho la faili, kwa hivyo foleni tupu haithibitishi kuwa kila sampuli ilitumika. Tazama [maandishi ya ujazo wa juu](/sw/concepts/high-volume-writes/) na [marejeleo ya sasisho la RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Maandishi yaliyoahirishwa bado yanategemea uhifadhi wenye mafanikio na mpangilio halali wa mihuri ya muda; hayahakikishii urejeshaji kutoka kwa kila hitilafu. Kagua matokeo yaliyohifadhiwa na yaliyokataliwa ikiwa mlundikano haufutiki.

## Wakati mzunguko haumaliziki

Mkusanyaji wa PHP hukagua muda uliopita wa uendeshaji kati ya vipengee vya kazi na kumaliza mzunguko wa vipengee mara tu kipindi cha upigaji kura kinapozidi kukiwa na onyo lililorekodiwa. Huu si ukatizaji mkali katika kikomo cha muda: operesheni inayoendelea inaweza kuchukua muda mrefu kabla ya ukaguzi huo. Vipengee ambavyo havikufikiwa havitoi thamani yoyote katika mzunguko huo. Mapengo kati ya masasisho halali yanaweza kujazwa ikiwa mapigo ya moyo na mipaka ya nyaraka yanaruhusu. Matukio ya mara kwa mara ya kuvuka mipaka ni ushahidi wa kuchunguza uwezo, muda wa kusubiri na makosa ya ukusanyaji, si ushahidi kwamba kila pengo linaloonekana lina sababu sawa.

Kile cha kufanya kuhusu hili kinajadiliwa katika [ongeza ukubwa wa kipima data](/sw/guides/scale-the-poller/). Mlolongo wa uendeshaji na hatua za ulinzi zipo katika [mzunguko wa maisha wa kipima data](/sw/reference/poller-lifecycle/).
