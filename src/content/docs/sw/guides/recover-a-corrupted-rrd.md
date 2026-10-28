---
title: Rejesha RRD iliyoharibika
description: Jinsi ya kutofautisha kumbukumbu ya round-robin iliyoharibika na iliyosanidiwa vibaya, jinsi ya kukagua faili, jinsi dump na kurejesha huirekebisha, na historia gani unaweza kuweka wakati faili inapaswa kujengwa upya.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 25
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Uharibifu wa kweli wa faili ni nadra. Faili nyingi zilizoripotiwa kuwa zimeharibika ziko sawa lakini hazikubaliani na hifadhidata, au haziwezi kuandikwa na poller, au ziliacha kupokea maadili kwa sababu ambayo haina uhusiano wowote na faili. Tambua ni ipi kati ya hizo unayo kabla ya kugusa chochote, kwa sababu ukarabati wa moja hufanya zingine kuwa mbaya zaidi.

:::danger[Hifadhi ya asili]
**Nakili faili kabla ya kila ukarabati kwenye ukurasa huu.** Rejesha kwenye faili mbadala ya mtahiniwa na uikague kabla ya kubadilisha faili ya moja kwa moja. Kupunguza kumbukumbu au kufuta moja hutupa historia iliyohifadhiwa. Kubadilisha kiwango cha juu huathiri uthibitishaji wa pembejeo za baadaye; haifuti sampuli zilizohifadhiwa kiotomatiki. Hakuna kutendua kiotomatiki katika RRD.
:::

## 1. Tambua aina ya kutofaulu

| Kile unachokiona | Kawaida inamaanisha | Nenda kwa |
|---|---|---|
| Grafu inachora hitilafu badala ya picha | Faili haipo, haisomeki, au saraka haiwezi kuandikwa | Hatua ya 2 |
| Grafu ni tupu lakini hakuna hitilafu | Hakuna thamani zinazoweza kutumika katika masafa yaliyochaguliwa, au shida ya ufafanuzi wa grafu | [Tatua matatizo ya data iliyokosekana](/sw/guides/troubleshoot-missing-data/) |
| Grafu inasimama kwa wakati maalum na haiendelei tena | Poller, ruhusa, au heartbeat | Hatua ya 3 |
| Grafu ina data lakini muundo ulibadilika bila mabadiliko ya usanidi | Faili na hifadhidata hazikubaliani | Hatua ya 4 |
| Thamani zilizohifadhiwa zote hazijulikani (unknown) | Ukusanyaji, muda, mipaka au usanidi wa chanzo cha data unahitaji kuangaliwa | [Tatua matatizo ya data iliyokosekana](/sw/guides/troubleshoot-missing-data/) |
| `rrdtool` inakataa kusoma faili | Njia haipo, hitilafu ya ufikiaji, muundo usioendana au uharibifu | Hatua ya 2 na 3, kisha 5 |

Kadupul hugeuza kesi ya kwanza kuwa ujumbe unaosomeka badala ya picha iliyovunjika, ikitofautisha saraka ambayo haiwezi kuandika na faili ambayo haiwezi kuandika, na kuripoti faili ambayo haipo kama poller pengine haijaendeshwa bado. Ujumbe huo ni kidokezo, si utambuzi kamili: ufutaji, njia iliyobadilishwa au urejeshaji usio kamili unaweza pia kuiacha ikikosekana.

## 2. Kagua faili

Mitazamo miwili inapatikana kwenye ukurasa wa chanzo cha data chenyewe, yote ikibadilishwa kwa kila kipindi. Mwonekano wa utatuzi (debug view) huchapisha amri ya `rrdtool create` ambayo Kadupul ingetoa kwa chanzo hiki cha data leo. Mwonekano wa maelezo (info view) ndio unaojali hapa: inasoma faili na `rrdtool info`, inasoma ufafanuzi wa chanzo cha data kutoka kwa hifadhidata, na inachapisha tofauti. Ambapo tofauti inaweza kupatanishwa bila kujenga upya, inachapisha amri ya `rrdtool tune` au `rrdtool resize` ambayo ingefanya hivyo, kama maandishi ili uendeshe badala ya kuiendesha yenyewe.

Kutoka kwa ganda la amri (shell), hatua hiyo hiyo ya kwanza:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Kijajuu hutoa hatua, wakati wa sasisho la mwisho, kila jina la chanzo cha data na aina yake, heartbeat, kima cha chini na kima cha juu, na kila kumbukumbu iliyo na kazi yake ya ujumuishaji, idadi ya safu na azimio. Ikiwa amri hii inatoa hitilafu, weka hitilafu na uangalie njia, ruhusa na uoanifu wa RRDtool kabla ya kutambua uharibifu. Amri ya `info` iliyofanikiwa husoma metadata pekee; kagua pia matokeo ya `fetch` na ujaribu dump ili kuangalia historia.

## 3. Angalia sababu za kiufundi kwanza

| Angalia | Kwa nini inakuja kabla ya ukarabati |
|---|---|
| Umiliki wa faili na ruhusa | Faili iliyoundwa na root wakati wa matengenezo haiwezi kuandikwa na poller kuanzia wakati huo |
| Umiliki wa saraka na ruhusa | Poller haiwezi kuunda faili mbadala katika saraka ambayo haiwezi kuandika |
| Nafasi ya bure na inodes | Mfumo kamili wa faili hutoa maandishi mafupi ambayo yanaonekana kama uharibifu |
| Ikiwa mwandishi wa pili yupo | Masasisho ya wakati mmoja au yasiyo na mpangilio yanaweza kushindwa au kubatilisha picha ya matengenezo; kagua kumbukumbu |

Endesha matengenezo kama akaunti inayomiliki na kusasisha RRD, na uhifadhi hali yake, mmiliki na kikundi. Simamisha waandishi wote kabla ya kunakili au kubadilisha faili, ikijumuisha wakusanyaji wa mbali, kazi zilizopangwa na matengenezo ya mikono. Futa maandishi yanayosubiri tu baada ya wazalishaji wao kusimama. Amri za kawaida za ganda hazipati kufuli za uhifadhi za Kadupul. Tazama [mahitaji ya hifadhi](/sw/reference/requirements/) na utaratibu wa kutuliza katika [Kuhifadhi nakala na kurejesha](/sw/guides/back-up-and-restore/).

## 4. Soma kile ambacho mkaguzi tayari amepata

Kadupul inaweza kuangalia vyanzo vya data vilivyounganishwa na grafu kwenye vifaa vilivyowezeshwa kulingana na ratiba na kurekodi kile inachopata; hii si orodha kamili ya kila faili kwenye diski. Imezimwa kwa chaguo-msingi. Kiolesura kinasema mahali pa kuiwasha: Configuration -> Settings -> Data.

| Mpangilio | Chaguo-msingi | Athari |
|---|---|---|
| Enable RRDfile Check | Imezimwa | Hakuna kinachoangaliwa hadi hii iwekwe |
| Check Frequency | Saa 4 | Pia inatoa saa 1, saa 24, au kuendesha baada ya kila mzunguko wa boost |
| Number of RRDfile Check Processes | Mchakato 1 | Hugawanya orodha ya faili kwa wafanyakazi sambamba |
| RRDChecker Timeout | Saa 1 | Ukaguzi huuliwa baada ya muda huu |

Matokeo hujikusanya katika orodha yenye kifaa, chanzo cha data, kitambulisho cha ndani cha chanzo cha data, ujumbe, na tarehe. Unaweza kuchuja kwa umri na kutafuta maandishi, na unaweza kusafisha orodha mara tu unapoifanyia kazi.

Ujumbe unaoweza kurekodiwa, na nini kila moja inamaanisha:

| Ujumbe | Maana |
|---|---|
| RRDfile does not exist | Faili haikuwahi kuundwa, ilihamishwa au kufutwa, au njia iliyosanidiwa ilibadilika |
| RRDfile is not writable | Mtumiaji wa poller hawezi kuandika faili |
| RRDfile modify time older than hour | Hakuna kilichoandikwa kwa angalau saa moja |
| Last update value in RRDfile is older than 1 hour | Muhuri wa sasisho la mwisho la faili yenyewe umepitwa na wakati, ambao ni ushahidi thabiti zaidi kuliko wakati wa kurekebisha |
| The RRDfile step does not match the Data Source Profile step | Faili iliundwa chini ya muda tofauti |
| There are more, or less, Data Sources in the database than in the RRDfile | Kiolezo kilipata au kilipoteza sehemu baada ya faili kuundwa |
| The Data Source '...' exists in RRDfile, but not in database | Hutaja uwanja, kutoka upande wa faili |
| Data Source name '...' exists in the Database, but not in RRDfile | Hutaja sehemu ambayo poller inaandika ambayo haina makazi kwenye faili |
| The RRDfile Minimal Heart... is lower than polling interval | Mkaguzi huashiria heartbeat chini ya au sawa na muda wa kupiga kura; sampuli za marehemu zinaweza kuwa hazijulikani |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Heartbeat ya faili iko chini ya heartbeat ya wasifu; ukaguzi huu hauashirii kubwa zaidi |
| Stale values for last 24 hours, or last hour | Kila sampuli iliyosomwa katika dirisha hilo haikujulikana |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Kushindwa kwa mkusanyiko wa sehemu |
| No data returned, maybe corrupted Data Source | Kupata data kutoka kwa faili hakukurudisha chochote |

Ukaguzi husahihisha hatua na heartbeat iliyorekodiwa kwenye hifadhidata ili ilingane na wasifu inapoendelea, ambayo hutatua mtawanyiko kati ya wasifu na safu mlalo za vyanzo vya data lakini haigusi faili. Kutolingana kwa hesabu kati ya faili na hifadhidata huripotiwa badala ya kurekebishwa kiotomatiki, kwa sababu upande wowote unaweza kuwa usio sahihi.

## 5. Dump, hariri, rejesha

RRDtool inaweza kubadilisha faili inayoweza kusomeka kuwa XML na kujenga upya faili ya mtahiniwa kutoka kwayo. Hii inaweza kusaidia kwa kutolingana kwa muundo unaojulikana, lakini haijengi upya sampuli zilizopotea au kuhakikisha kuwa faili iliyoharibiwa inaweza kuchanganuliwa. Kadupul pia hutumia wasaidizi wa dump/restore kwa mabadiliko ya muundo. Msaidizi wa kurejesha wa ndani huunda faili ya muda na kuipa jina jipya juu ya marudio baada ya mafanikio; hii haitoi nakala rudufu.

Wakati waandishi wakiwa wamesimamishwa, endesha hii kama mmiliki wa RRD. Badilisha njia ya mfano na njia halisi ya chanzo cha data. Saraka ya kazi ya kibinafsi imeundwa kando ya chanzo ili mtahiniwa awe kwenye mfumo sawa wa faili:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Chagua safu ya fetch na kazi ya ujumuishaji ambayo ina data inayojulikana iliyohifadhiwa; saa ya mwisho ni mfano tu. Linganisha majina ya vyanzo vya data vya chanzo na mtahiniwa, hatua, kumbukumbu, muhuri wa mwisho wa kusasisha na thamani za sampuli. Dump/restore isiyobadilika inaweza kubadilisha mpangilio wa binary, kwa hivyo linganisha maadili badala ya kuhitaji heshi zinazofanana za faili.

Weka nakala ya asili. Baada ya uthibitishaji pekee, rejesha modi inayohitajika ya mtahiniwa, mmiliki na kikundi na uipe jina jipya kwa njia ya moja kwa moja wakati waandishi wanabaki wamesimamishwa. Thibitisha kuwa akaunti ya poller inaweza kuisoma na kuisasisha kabla ya kuanza tena ukusanyaji. Mfano huu unasimama kabla ya usakinishaji ili mtahiniwa anayesomwa lakini asiye sahihi asisakinishwe.

Faili za XML na mtahiniwa zinahitaji nafasi ya ziada ya diski. Dump iliyoshindwa inaweza kuacha XML ya sehemu; usiirejeshe kamwe. Angalia ufikiaji, nafasi ya bure na kosa lililoripotiwa. Ikiwa ya asili haiwezi kumwagwa baada ya ukaguzi huo, rejesha nakala inayojulikana kuwa nzuri badala yake. [`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) ya RRDtool inaruhusu kubatilisha marudio moja kwa moja; mfano uliowekwa unatumia marudio mapya kwa makusudi.

## 6. Kinachosalia, na kisichosalia

| Uharibifu | Historia inayoweza kurejeshwa |
|---|---|
| Faili haiwezi kuandikwa, lakini iko sawa | Historia iliyohifadhiwa inasalia. Masasisho yaliyokosekana hayarejeshwi kwa kurekebisha tu ufikiaji |
| Heartbeat, kima cha chini au kima cha juu si sahihi | Ndiyo. `rrdtool tune` hubadilisha kichwa bila kugusa thamani zilizohifadhiwa |
| Hatua (step) si sahihi | Inahitaji uongofu wa wazi, uliothibitishwa; kubadilisha wasifu wa hifadhidata pekee hakugeuzi faili |
| Chanzo cha data kinakosekana kwenye faili | Sehemu zilizopo huweka historia yao. Sehemu mpya huanza tupu |
| Kumbukumbu ilifutwa au haikuwahi kuundwa | Hapana. Azimio ambalo halikuwahi kuhifadhiwa haliwezi kujengwa upya |
| Safu za kumbukumbu zilipunguzwa na kurekebisha ukubwa unaopungua | Hapana. Safu zilizoshuka zimepita wakati amri inapoendeshwa |
| Faili iliyokatwa, dump inashindwa | Hapana. Rejesha kutoka kwa nakala rudufu |
| Kijajuu kiko sawa, mkia umekatwa | Usichukulie kuwa kichwa kinachosoma kinamaanisha dump kamili; tumia nakala iliyothibitishwa ikiwa utupaji utashindwa |

Kubadilisha muda wa poller au kuhamisha chanzo cha data hadi wasifu mwingine wa uhifadhi hakutengenezi upya faili zilizopo kiotomatiki. RRDtool pia hufichua [shughuli za kimuundo za `tune`](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), ikijumuisha chaguo la hatua; thibitisha tabia ya uongofu kwa toleo lako lililosakinishwa na mpangilio wa kumbukumbu badala ya kuchukulia mabadiliko yasiyo na hasara ya muda. Tazama [Vyanzo vya data na kumbukumbu](/sw/concepts/data-sources-and-rras/) na [Dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/). Kuinua kima cha juu na `tune` ni salama; kupunguza moja hurekodi kila thamani ya baadaye juu ya dari mpya kama isiyojulikana.

## 7. Jenga upya huku ukiweka kile kinachoweza kuwekwa

Kadupul husafirisha zana ya splice ambayo inaweza kujaza faili mpya kutoka kwa ile ya zamani inayosomeka. Chukulia matokeo yake kama mtahiniwa: inaweza kujaza mapengo na kubadilisha zero halali, kwa hivyo si nakala isiyo na hasara ya historia iliyopimwa. Endesha kutoka kwa mzizi wa programu kwenye mkusanyaji mkuu wa data, ukitumia nakala zilizotengwa katika saraka zinazoaminika zinazoweza kuandikwa.

Unda `new.rrd` na muundo uliokusudiwa ndani ya saraka ya kibinafsi ya `$work` kutoka hatua ya 5, kisha uhakiki muunganisho:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Faili zote mbili za ingizo lazima tayari ziwepo na zipitishe ukaguzi wa uwezo wa kuandika wa matumizi. Faili mpya hutoa muundo. Bila `--finrrd`, matokeo ni njia ya faili mpya pamoja na `.new`; tumia njia mpya ya pato ili kuepuka kubadilisha mtahiniwa wa awali. `--dryrun` huchanganua na kuunganisha kwa kutumia XML ya muda na hifadhi ya SQLite (inapopatikana), lakini inaruka urejeshaji wa mwisho wa RRD. Haithibitishi kuwa urejeshaji wa mwisho utafanikiwa. Ondoa `--dryrun` ili kutoa mtahiniwa tofauti. Epuka `--owner` wakati wa muhtasari na uendeshe kama akaunti ya huduma inayohitajika; angalia umiliki halisi wa pato kabla ya usakinishaji.

:::caution[Splice huchukulia sifuri kama pengo]
Muunganisho hupitia faili mpya na, kwa kila nafasi inayoshikilia isiyojulikana (unknown) **au sifuri (zero)**, hutafuta thamani inayolingana ya karibu katika faili ya zamani na kuiandika badala yake. Kwa hiyo sifuri halisi katika faili mpya inabadilishwa na data ya zamani. Kwenye chochote kinachosoma sifuri kihalali kwa vipindi virefu, mlango usio na shughuli, foleni inayomwagika, kaunta iliyotulia, kagua matokeo kabla ya kuiweka mahali pake. Thamani zisizojulikana za faili ya zamani pia hujazwa kwa kutumia thamani zilizotangulia, kwa hiyo matokeo yaliyounganishwa yanaweza kubuni mwendelezo kwenye data iliyokosekana.
:::

Baada ya kuunganisha, weka faili pale ambapo chanzo cha data kinatarajia, kwa umiliki ambao poller inahitaji, na uangalie kuwa grafu inachora.

## 8. Kujaza mapengo, na kwa nini kufikiria mara mbili

| Zana | Inachokiandika |
|---|---|
| `cli/batchgapfix.php` | Hujaza masafa ya tarehe kwenye vifaa vingi kwa sambamba, kwa kutumia thamani ya mwisho inayojulikana au wastani |
| `cli/float_rrdfiles.php` | Huweka masafa kwenye grafu zilizochaguliwa kupitia njia sawa ya dump na restore |

Zote mbili hubuni vipimo. Hakuna kilichokusanywa kwenye mihuri hiyo ya nyakati, na baadaye hakuna chochote kwenye faili kinachotenganisha maadili yaliyobuniwa na yale halisi. Yatumie unapojua pengo halikuwa hitilafu ya mfumo: poller ilisimamishwa kwa ajili ya matengenezo, dirisha la uhamiaji. Kamwe kwenye chochote kinacholisha uwezo au hesabu ya malipo. Tahadhari hiyo hiyo inatumika kwa [kuondoa spikes](/sw/guides/remove-spikes-from-data/).

## 9. Utatuzi wa kiotomatiki wa chanzo kimoja cha data

Kwa chanzo kimoja cha data kinachofanya kazi kwa njia isiyo ya kawaida, Kadupul inaweza kuendesha ukaguzi wa utatuzi katika mizunguko michache ijayo ya upigaji kura na kuripoti uamuzi: ikiwa faili ipo, ikiwa yenyewe na saraka yake zinaweza kuandikwa, akaunti gani inaimiliki dhidi ya akaunti gani ambayo poller inafanya kazi nayo, ikiwa chanzo cha data kinafanya kazi, ikiwa faili inalingana na ufafanuzi wa chanzo cha data, ikiwa sasisho la mwisho lilihamia baada ya kura, na ikiwa maadili yanaweza kutumika. Hatua yake ya kutengeneza ni nyembamba. Inaendesha mapendekezo ya `rrdtool tune` yaliyotolewa na kulinganisha na hakuna kitu kingine chochote, ikikataa na kuweka kumbukumbu kwa nini orodha ikiwa tupu au faili haiwezi kuandikwa. Hairejeshi faili, haiongezi vyanzo vya data, au kubadilisha kumbukumbu.

## 10. Kufuta ni hatari tofauti

Kadupul hufuatilia faili za kumbukumbu ambazo chanzo cha data hakipo tena na inatoa kuziondoa. Inaweza pia kuwekwa kutenda kiotomatiki wakati chanzo cha data kinafutwa, kwa njia mbili: futa (delete), au uhamishe kwenye saraka ya kumbukumbu (archive).

:::danger[Kufuta ni kwa kudumu]
Njia ya delete huondoa faili kwenye diski kabisa. Hakuna hatua ya pipa la takataka na data haiko kwenye hifadhidata. Ikiwa huna uhakika kila faili iliyoorodheshwa ni yatima kweli, weka njia kuwa archive, ambayo huhamisha faili kwenye saraka unayoiteua, na kusafisha saraka hiyo kwa mkono baadaye.
:::

Faili inaweza kuonekana kuwa yatima bila kuwa yatima kweli. Chanzo cha data kilichohamishwa kwenye njia mpya, urejeshaji uliokamilika kwa sehemu, au kifaa kilichojengwa upya chini ya kitambulisho kipya vyote huacha faili ambazo hazionyeshwi na chochote. Angalia orodha dhidi ya rekodi yako mwenyewe ya kile kilichobadilika kwanza.

## Njia za kutofaulu

| Dalili | Sababu |
|---|---|
| Ukarabati ulifanikiwa, grafu bado ni tupu | Angalia ufikiaji, masafa ya saa yaliyochaguliwa, ukusanyaji wa data na ufafanuzi wa grafu |
| `rrdtool dump` inatoa hitilafu kwenye faili | Angalia njia, ufikiaji, hifadhi na muundo kabla ya kuhitimisha kuwa imeharibika |
| Tune ilitumika, hakuna kilichobadilika | Mabadiliko ya kichwa hayajazi sampuli zisizojulikana za kihistoria kiotomatiki; thibitisha ufafanuzi wa faili na hifadhidata |
| Mapengo nyembamba kila mahali baada ya mabadiliko ya muda | Faili bado zinabeba hatua ya zamani na heartbeat |
| Faili iliyounganishwa ina data ya zamani ambapo faili mpya ilisoma sifuri | Inatarajiwa. Muunganisho hujaza zero pamoja na thamani zisizojulikana |
| Orodha ya mkaguzi inakua na haipungui kamwe | Matokeo hurekodiwa hadi yatakaposafishwa; kurekebisha sababu hakuyaondoi kiotomatiki |

Hifadhi nakala ya saraka ya kumbukumbu na hifadhidata pamoja, kwenye ratiba moja, na ujaribu urejeshaji. Urejeshaji ni mdogo kwa kile ambacho nakala hiyo ilihifadhi wakati wa kukamatwa kwake. Tazama [Kuhifadhi nakala na kurejesha](/sw/guides/back-up-and-restore/).
