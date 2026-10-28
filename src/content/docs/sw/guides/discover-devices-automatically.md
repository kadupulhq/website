---
title: Gundua vifaa kiotomatiki
description: Changanua masafa ya mtandao, linganisha vifaa vilivyopatikana na kiolezo, na uruhusu sheria ziuunde grafu na matawi ya mti, huku uundaji wa vifaa ukiwa umezimwa kwa jaribio la awali la ugunduzi.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 15
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji iliyothibitishwa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Uendeshaji otomatiki ni mashine mbili tofauti ambazo ni rahisi kuzichanganya. Ugunduzi (Discovery) hupitia masafa ya anwani na kuamua kifaa ni kipi. Sheria (Rules) huamua kile kitakachoundwa kwa ajili ya kifaa mara tu kinapokuwepo. Unaweza kuendesha mojawapo bila nyingine, na uharibifu mwingi ambao watu hufanya kwa uendeshaji otomatiki unatokana na kuwasha zote mbili kwa wakati mmoja na kugundua madhara baadaye.

## Bainisha masafa

Masafa ya mtandao ni orodha iliyotenganishwa kwa koma. Kila ingizo liko katika mojawapo ya aina tatu.

| Aina | Mfano | Maelezo |
|---|---|---|
| CIDR | `192.168.1.0/24` | Inakubali pia barakoa ya nukta, `192.168.1.0/255.255.255.0` |
| Kadi-mwitu | `192.168.*.*` | Hubadilishwa ndani kwa ndani kuwa CIDR sawa |
| Anwani moja | `192.168.1.10` | Huchanganua anwani hiyo kamili pekee |

Masafa ya mwanzo hadi mwisho yaliyoandikwa kama `192.168.1.10-192.168.1.50` hukataliwa na kosa. Hayatumiki.

Tumia masafa yasiyoingiliana, ikijumuisha kwenye mitandao inayoweza kufanya kazi kwa wakati mmoja. Jedwali la kazi lina ufunguo wa kipekee wa kimataifa kwenye anwani ya IP; nakala inaweza kukataa kundi zima la kuingiza, na kuacha anwani nyingine katika kundi hilo. Tazama [suala #207](https://github.com/kadupulhq/kadupul/issues/207).

Kila kitu ni IPv4. Hesabu za masafa hutumia ubadilishaji wa nambari kamili ya 32-bit kote, kwa hivyo hakuna njia ya IPv6 hapa.

Anwani za mtandao na utangazaji zimetengwa. `/24` huchanganua anwani 254, kutoka `.1` hadi `.254`. Ingizo la anwani moja huchanganua anwani moja. Anwani ambazo okteti yao ya mwisho ni 255 hurukwa wakati wa uchanganuzi pia.

Kabla ya uchanganuzi kuanza, kila anwani katika masafa huandikwa kwenye jedwali la kazi, safu mlalo moja kwa kila anwani, na nyuzi (threads) hudai safu kutoka humo. `/16` huandika safu mlalo 65534 kabla ya ping ya kwanza. Hiyo ni gharama halisi, na ndiyo maana uchanganuzi wa masafa makubwa yaliyotawanyika huwa wa polepole hata wakati hakuna kitu kinachojibu.

Ambatisha seti ya chaguo za SNMP kwa kila masafa. Hali kuu (Master mode) hurekodi kosa na kuruka masafa ambayo kitambulisho chake cha seti ya SNMP ni sifuri. Uendeshaji unaolengwa hautumii ulinzi huo huo; kuianzisha moja kwa moja hakufanyi chaguo za SNMP ambazo hazipo zitumike.

## Weka kasi ya uchanganuzi

| Mpangilio | Inachofanya | Chaguo-msingi |
|---|---|---|
| Nyuzi za Ugunduzi | Wafanyakazi sambamba wanaodai anwani | 1 |
| Kikomo cha Uendeshaji | Ugunduzi unakatishwa baada ya muda huu | Dakika 20 |
| Aina ya Ratiba | Mwongozo, kila siku, kila wiki, kila mwezi, au kila mwezi kwa siku maalum | Mwongozo |
| Njia ya Ping | ICMP, TCP, TCP closed, UDP, au SNMP | Kutoka kwa mpangilio wa kimataifa |
| Majaribio ya Ping, Muda wa Kuisha | Gharama ya kutofaulu kwa kila anwani | Kutoka kwa mipangilio ya kimataifa |

Nyuzi na kikomo cha uendeshaji huingiliana vibaya usipofikiria kuzihusu. Nyuzi hamsini dhidi ya `/16` ni uchanganuzi wa bandari (port scan) kwa kadiri mfumo wowote wa kugundua uvamizi unavyohusika. Uzi mmoja dhidi ya masafa sawa utafikia kikomo cha uendeshaji na kuuawa katikati, na kuacha matokeo ya sehemu ambayo yanaonekana kama kamili.

Pima ukubwa wa masafa ili uchanganuzi ukamilike ndani ya kikomo kwa idadi ya nyuzi ambazo mtandao wako unavumilia. Masafa kadhaa madogo ni bora kuliko moja kubwa, kwa sababu kila moja hupata ratiba yake na kikomo chake.

## Kile ambacho uchanganuzi hufanya kwa kila anwani

1. Tatua jina. Seva mbadala za DNS zinaweza kutolewa kama orodha iliyotenganishwa na nafasi; ikiwa hakuna iliyowekwa, kisuluhishi cha mpigakura mwenyewe kinatumika. Utafutaji wa NetBIOS ni njia mbadala ya hiari wakati DNS hairudishi chochote.
2. Angalia ikiwa anwani au jina hilo tayari ni kifaa. Ikiwa ndivyo, anwani imewekwa alama kuwa imekamilika. Hii inazuia kifaa kilichopo kilichopatikana kwa maadili hayo; si hakikisho dhidi ya uundaji wa wakati mmoja au lakabu tofauti.
3. Ping, kwa kutumia njia iliyosanidiwa. Njia ya SNMP inapita ping tofauti.
4. Ikiwa ping inajibu, au njia ya SNMP imechaguliwa, jaribu SNMP na kukusanya `sysDescr`, `sysObjectID`, `sysName`, `sysLocation`, `sysContact` na muda wa kufanya kazi (uptime).
5. Linganisha data ya mfumo iliyokusanywa dhidi ya sheria za kifaa.

Anwani inayopiga ping lakini haijibu SNMP inarekodiwa kuwa imepatikana na iko hai. Anwani inayojibu SNMP lakini hailingani na sheria yoyote ya kifaa inarekodiwa kuwa imepatikana, pamoja na data ya mfumo wake, na hakuna kinachoundwa. Zote mbili huishia kwenye orodha ya vifaa vilivyogunduliwa.

Ukandamizaji wa nakala umewashwa kwa chaguo-msingi. Ikiwa `sysName` tayari imeonekana kwenye anwani nyingine katika rekodi zilizohifadhiwa za ugunduzi za mtandao huu, au ipo kwenye kifaa chenye jina tofauti la mpangishaji, anwani hiyo inarukwa. Hiyo ndiyo chaguo-msingi sahihi kwa kipanga njia chenye violesura vingi vilivyo na anwani na kosa kwa vifaa vinavyofanana nyuma ya anwani tofauti za NAT, ambayo ndiyo chaguo la sysName sawa lipo ili kulizima.

Vifaa vilivyopo vinaweza kurudia maswali yao ya data wakati wa uchanganuzi. Hiyo imezimwa kwa chaguo-msingi, na inatumika kwa vifaa vilivyorekodiwa kuwa vimefanya kazi au vinapona. Ugunduzi hutumia hali yao iliyohifadhiwa kwa uamuzi huu; haichunguzi kifaa kilichopo upya.

## Sheria za kifaa huamua kiolezo

Sheria ya kifaa hupanga data ya mfumo kwa kiolezo cha kifaa. Kila sheria hubeba muundo wa `sysDescr`, `sysObjectID` na `sysName`. Kilinganishi huchuja kwenye kila sehemu ya mfumo ambayo kifaa kilirudisha kama si tupu; mifumo tupu ya sheria inalingana na thamani yoyote. Sheria hutathminiwa kwa mpangilio wa mlolongo na mechi ya kwanza hushinda.

Tumia mifuatano rahisi ya herufi halisi na uthibitishe kiolezo kilichochaguliwa katika matokeo ya ugunduzi. Kilinganishi cha sasa cha SQL hufunga mifumo ya regex katika herufi halisi za `/`, kwa hivyo muundo uliotiwa nanga kama vile `^Linux.*fixture$` hushindwa hata wakati opereta wa regex wa hifadhidata anapolingana nayo moja kwa moja. Njia mbadala ya mfuatano mdogo hairekebishi kesi hiyo. Tazama [suala #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE` pia hutendea `%` na `_` kama herufi maalum za kadi-mwitu.

Hakuna mechi inamaanisha hakuna kifaa. Anwani imerekodiwa katika orodha ya vifaa vilivyogunduliwa na data yoyote ya mfumo iliyokusanywa, na orodha hiyo ndipo unapoandika sheria uliyokuwa unakosa.

Weka sheria maalum juu ya za jumla. Sheria inayolingana na kijisehemu cha `Linux` iliyowekwa juu ya sheria ya mchuuzi itadai kila kifaa kinachotaja Linux katika maelezo yake.

## Hakiki ugunduzi kabla ya kuwezesha uundaji

Swichi ya kuunda kifaa kwenye masafa mapya imezimwa kwa chaguo-msingi. Iache ikiwa imezimwa kwa jaribio la awali, na uzime chaguo la kurudia maswali ya data ya vifaa vilivyopo. Jaribio hili bado linasasisha rekodi za ugunduzi, takwimu za uchanganuzi, na kumbukumbu, na linaweza kutuma arifa zilizosanidiwa. Haikagui utekelezaji wa sheria za grafu au mti.

Endesha uchanganuzi, kisha usome orodha ya vifaa vilivyogunduliwa. Inaonyesha uvumbuzi uliorekodiwa, data zao za SNMP zilizokusanywa, na kiolezo kilicholingana inapopatikana. Vifaa vilivyopo, nakala zilizokandamizwa, na anwani zilizorukwa hazihitaji kuonekana hapo. Kagua matokeo ya utatuzi kwa kila anwani pamoja na orodha.

Lazimisha uchanganuzi kutoka kwa mstari wa amri badala ya kusubiri ratiba:

```bash
php poller_automation.php --network=3 --force --debug
```

Bendera ya utatuzi huchapisha maamuzi ya kila anwani yanapotokea. Mchakato mkuu, ambao huzindua masafa yaliyowezeshwa ambayo ratiba yao imefika, ni hali tofauti:

```bash
php poller_automation.php -M
```

Amri iliyolengwa ya `--force` pia huendesha mtandao uliowekwa kando. Kuongeza `--force` kwa hali kuu hupita ukaguzi wa ratiba na kunaweza kuzindua mitandao iliyozimwa pia. Tumia fomu iliyolengwa wakati wa kuthibitisha masafa moja.

Angalia mambo matatu katika matokeo kabla ya kuwasha uundaji.

- Idadi ya vifaa ndivyo ulivyotarajia. Idadi kubwa zaidi kuliko orodha yako ya mali kwa kawaida inamaanisha masafa ni mapana kuliko ulivyofikiria.
- Violezo vilivyochaguliwa ni sawa. Safu wima ya kiolezo sawa cha jumla kwenye kila kitu inamaanisha sheria zako hazilingani.
- Hakuna kitu muhimu ambacho hakipo. Kwa kifaa kinachokosekana, angalia upanuzi wa masafa, kukamilika kwa mfanyakazi, ukandamizaji wa kifaa kilichopo na nakala, sera ya ping, na matokeo ya SNMP. Kutokuwepo kwenye orodha pekee hakuthibitishi kuwa haipatikani.

## Sheria za grafu na mti

Mara tu kifaa kinapokuwepo, sheria za grafu na sheria za mti huamua kile kinachojengwa juu yake. Ugunduzi unaweza kuomba uendeshaji huu otomatiki baada ya kuunda kifaa, na CLI inaweza kuitumia kwa vifaa vilivyopo. Sheria za kibinafsi za grafu na mti lazima ziwezeshwe. Swichi za kimataifa za uendeshaji otomatiki wa grafu/mti hudhibiti ndoano maalum za uundaji; si marufuku ya jumla kwa uendeshaji otomatiki wa wazi wa CLI.

Sheria ya grafu ina sehemu tatu: inatumika kwa vifaa gani, inatumika kwa faharisi zipi zilizogunduliwa ndani ya swali la data, na aina gani ya grafu ya kuunda. Sehemu zote mbili zinazolingana zimejengwa kutoka kwa vitu vya sheria, na kitu cha sheria ni uwanja, opereta na muundo, uliounganishwa na `AND` au `OR` na mabano.

| Kikundi cha waendeshaji | Wanachama |
|---|---|
| Kijisehemu | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Usawa | matches, is not equal to |
| Nambari | is less than, less than or equal, greater than, greater than or equal |
| Uwepo | is unknown, is not unknown, is empty, is not empty |
| Muundo | matches regular expression, does not match regular expression |

Hizi huwa kifungu cha SQL `WHERE`. Waendeshaji wa maneno ya kawaida ni lahaja ya maneno ya kawaida ya hifadhidata, si PCRE, kwa hivyo muundo unaofanya kazi katika `preg_match` hautafanya kazi hapa kila wakati. Ulinganisho wa nambari dhidi ya mifumo ya nambari hupitishwa bila nukuu; kila kitu kingine kimenukuliwa, na hifadhidata inatumika sheria zake za ubadilishaji wa aina. Jaribu vichujio vya nambari dhidi ya maadili halisi yaliyohifadhiwa; maadili haya huhifadhiwa kama maandishi. Waendeshaji wa vijisehemu hutumia SQL `LIKE`, ambapo `%` na `_` zina maana za kadi-mwitu.

Tabia mbili zinafaa kujua kabla ya kurekebisha hitilafu kwenye sheria ambayo haifanyi chochote.

**Kichujio tupu cha kifaa/kitu hakilingani na chochote, lakini kichujio tupu cha faharasa kinalingana na faharasa zote zilizohifadhiwa.** Kichujio cha uteuzi wa kifaa hurudi kwa hali ya uwongo wakati haina vitu vya kulinganisha. Mara tu sheria ya grafu inapofanana na kifaa, hata hivyo, kuondoa hali zake zote za faharasa ya grafu huacha swali la data bila kuchujwa. Kwa mfano, kuondoa hali ya `ifDescr = eth0` kunaweza pia kuunda grafu ya `lo`. Zima sheria wakati wa kuhariri hali zake za faharasa.

**Sheria inayorejelea uwanja ambao kifaa hakijagundua inaachwa.** Ikiwa sheria inachuja kwenye uwanja wa swali la data ambao hauko kwenye akiba ya kifaa hicho, uendeshaji hurekodi onyo linalotaja uwanja na kuacha kuchakata sheria hiyo kwa kifaa hicho. Sababu ya kawaida ni sheria iliyoandikwa dhidi ya swali moja la data inayotathminiwa kwenye kifaa ambacho swali lake lilirudisha seti tofauti ya uwanja.

Ukurasa wa kuhariri sheria huorodhesha vitu na grafu zinazotarajiwa. Kagua orodha hizo kabla ya kuwezesha sheria na baada ya kuihariri. Ni muhtasari wa uteuzi, si jaribio kamili la utekelezaji: ukaguzi wa chanzo cha data, ugunduzi wa grafu iliyopo, ndoano za uundaji, na uwekaji wa mti bado hufanyika wakati wa utekelezaji. CLI haina chaguo la majaribio ya uigaji kavu (dry-run).

Sheria za mti zina aina tofauti za majani ya kifaa na grafu na mti uliochaguliwa na mzazi. Hatua za kichwa zinaweza kutumia mifuatano isiyobadilika au maadili kutoka nyanja za kifaa/grafu. Vichwa vinavyotokana na uga hutumia uingizwaji wa regex wa PHP usiojali ukubwa wa herufi; mfuatano halisi wa `\n` katika matokeo huigawanya katika vichwa vilivyowekwa viota mfululizo. Sintaksia hii ya uingizwaji inatofautiana na regex ya SQL inayotumika kulinganisha vitu. Vichwa na majani yaliyopo hutumiwa tena kwenye mti na mzazi sawa; kubadilisha njia kunaweza kuongeza uwekaji mwingine bila kuondoa wa zamani.

## Tekeleza sheria kwa vifaa ambavyo tayari vipo

Ugunduzi si njia pekee ya kuingia. Sheria zinaweza kuendeshwa dhidi ya vifaa ambavyo tayari viko kwenye mfumo, vilivyochaguliwa kwa kitambulisho, jina la mpangishaji au maelezo:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Jina la mpangishaji na maelezo hulinganishwa kama maneno ya kawaida wakati thamani ni halali, na daima pia kama kijisehemu. Angalau moja ya tatu inahitajika; kuiita bila wateuzi hutoka na kosa. Wakati wateuzi wanapojumuishwa, huunganishwa na `AND`. Tumia vitambulisho vyema vya kifaa vilivyotenganishwa na nafasi kwa uteuzi finyu; vitambulisho vilivyotenganishwa na koma havitumiki. Mifumo bado inaweza kuwa mipana, na SQL `LIKE` hutendea `%` na `_` kama kadi-mwitu.

Swali la kiteuzi halitengi kiotomatiki vifaa vilivyozimwa. `--debug` huongeza uchunguzi lakini bado hufanya uundaji. Kutokuwa na vifaa vinavyolingana ni operesheni isiyo na hatua (no-op) iliyofanikiwa, kwa hivyo hali ya kutoka pekee haithibitishi kuwa chochote kiliundwa.

Kwa kila kifaa kinacholingana, uendeshaji hufanya mambo matatu kwa mpangilio:

1. Hujaribu kuunda violezo vya grafu vilivyoambatishwa ambavyo havina grafu kwenye kifaa, kulingana na ustahiki wa kiolezo na ukaguzi wa chanzo cha data.
2. Huendesha sheria za grafu zilizowezeshwa kwa maswali ya data yaliyoambatishwa kwa kutumia akiba ya faharasa iliyohifadhiwa. Hatua hii yenyewe hairudii ugunduzi; onyesha upya swali la data kwanza ikiwa akiba haipo au imepitwa na wakati.
3. Hutumia sheria za mti wa majani ya kifaa zilizowezeshwa.

Uundaji mpya wa grafu unaweza kuomba sheria za mti wa majani ya grafu wakati uendeshaji otomatiki wa mti wa kimataifa umewezeshwa. CLI haitumii tena sheria hizo kwa grafu ambazo inaona zimekwisha undwa. Kwa hivyo sheria mpya au iliyobadilishwa ya jani la grafu haijazi grafu zilizopo kwa sababu tu CLI inaendeshwa tena. Tazama [suala #211](https://github.com/kadupulhq/kadupul/issues/211). Thibitisha uwekaji wao kando; usifute na kuunda upya grafu za kihistoria ili tu kuchochea ndoano ya uundaji.

Uendeshaji unaorudiwa unakandamiza grafu iliyopo isiyo na faharasa kwa kifaa na kiolezo cha grafu. Grafu zilizo na faharasa huangaliwa kwa kifaa, swali la data, aina ya grafu na faharasa. Hii inazuia uundaji wa nakala katika uendeshaji mfululizo; si hakikisho la wakati mmoja. Angalia orodha ya grafu na mti baada ya uendeshaji, pamoja na ujumbe wa kumbukumbu wa `AUTOM8` kwa grafu zilizorukwa, data batili au hitilafu za uundaji.

Kitu kimoja kinarukwa kimya kimya cha kutosha kuchanganya: kiolezo cha grafu chenye sehemu iliyotiwa alama kuwa inaweza kubatilishwa (overridable) ambayo haina thamani ya msingi haistahili kuendeshwa kiotomatiki. Uendeshaji unarekodi kuwa haukuongezwa kwa sababu sehemu inayoweza kubatilishwa haina chaguo-msingi, na kuendelea. Ikiwa kiolezo unachotarajia hakionekani kamwe, hilo ndilo jambo la kwanza kuangalia. Tazama [Violezo](/sw/concepts/templates/) kwa maana ya sehemu inayoweza kubatilishwa.

## Mitego

**Kulemaza sheria hakubadilishi kazi yake.** Haiondoi grafu au maingizo ya mti yaliyokwisha undwa. Ufutaji wa kifaa una tabia tofauti ya kusafisha grafu na chanzo cha data; kagua chaguo za ufutaji kabla ya kuondoa kifaa.

**Uchanganuzi uliouawa unaonekana kama safi.** Kikomo cha uendeshaji kinamaliza ugunduzi popote kilipofikia. Jumla zilizorekodiwa ni jumla za kazi iliyokamilika, na hakuna kinachoweka alama kwenye matokeo kuwa ni sehemu tu. Linganisha hesabu ya anwani iliyochanganuliwa dhidi ya saizi ya masafa.

**Sheria huendeshwa dhidi ya akiba ya swali la data, si kifaa.** Sheria ya grafu ambayo hailingani na chochote mara nyingi inamaanisha swali la data halikuwahi kufanya kazi, au liliendeshwa na halikupata faharasa yoyote. Angalia jedwali la faharasa lililogunduliwa kabla ya kuandika upya sheria.

**Barua pepe ya arifa inajumuisha uvumbuzi uliopo na mpya.** Masafa yanaweza kutuma barua yakikamilika, yakiweka makundi ya uvumbuzi uliorekodiwa kulingana na ikiwa kila IP ilionekana kwenye picha ya kabla ya uchanganuzi. Huu si uthibitisho kwamba kila anwani iliyoombwa ilichanganuliwa.

## Njia za kutofaulu

| Dalili | Sababu ya kawaida |
|---|---|
| Uchanganuzi haupati chochote kwenye masafa yaliyojaa | Ping imezuiwa, kutofaulu kwa SNMP, vizuizi, au ukandamizaji wa nakala |
| Masafa yanakataa kuchanganua, kosa katika kumbukumbu | Hakuna seti ya chaguo za SNMP iliyoambatishwa kwayo |
| Vifaa vimepatikana lakini hakuna kilichoundwa | Swichi ya uundaji imezimwa, au hakuna sheria ya kifaa iliyolingana |
| Kila kitu kinapata kiolezo sawa cha jumla | Agizo la sheria, na sheria ya jumla juu ya maalum |
| Baadhi ya anwani zimechanganuliwa tu | Kikomo cha uendeshaji kimefikiwa, au masafa yanayoingiliana yamekataa kundi la anwani |
| Kifaa kimoja kwa kila kipanga njia badala ya kimoja kwa kila kiolesura, au kinyume chake | Mpangilio wa ukandamizaji wa nakala wa sysName sawa |
| Sheria hailingani na chochote na kumbukumbu inaonya kuhusu safu wima | Sheria inachuja kwenye uwanja ambao swali la data la kifaa hiki halikurudisha |
| Kiolezo cha grafu hakijawahi kuundwa na sheria | Chaguo-msingi linalohitajika linakosekana, pato batili la chanzo cha data, au hitilafu ya uundaji |
| Grafu zisizotarajiwa za violesura vya ziada | Kichujio cha faharasa ya grafu ni tupu au pana kuliko ilivyokusudiwa |
| Sheria mpya ya mti haiweki grafu zilizopo | CLI haijazi sheria za majani ya grafu kwa grafu zilizopo |
