---
title: Dhibiti uhifadhi wa data
description: Chagua uhifadhi na azimio, kadiria nafasi ya diski, na panga mabadiliko kwenye faili zilizopo za RRD.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 24
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Sera ya uhifadhi husanidiwa wakati wa kuunda faili na hubaki bila kubadilika wakati wa sasisho za kawaida. Kuhariri wasifu baadaye hubadilisha tu jinsi faili inayofuata itakavyokuwa na kuacha kila faili iliyopo jinsi ilivyokuwa. Weka hili sawa kabla ya kuunda vyanzo elfu kumi vya data, kwa sababu mabadiliko ya baadaye yanahitaji matengenezo ya wazi ya faili au uhamiaji.

Soma [Vyanzo vya data na kumbukumbu](/sw/concepts/data-sources-and-rras/) kwanza ikiwa maneno step, heartbeat, kumbukumbu (archive) na muungano (consolidation) bado si maarufu kwako.

## Kile ambacho wasifu unashikilia

Wasifu wa chanzo cha data ndio sera ya uhifadhi. Wasifu mmoja, muundo mmoja wa hifadhi.

| Sehemu | Maana |
|---|---|
| Muda wa upigaji kura (step) | Ni mara ngapi thamani inatarajiwa, kwa sekunde |
| Heartbeat | Muda wa juu unaoruhusiwa kati ya masasisho kabla ya ingizo kuchukuliwa kuwa halijulikani (unknown) |
| Sababu ya X-Files | Ni kiasi gani cha dirisha la ujumuishaji kinaweza kutojulikana kabla ya thamani iliyojumuishwa kutojulikana |
| Kazi za ujumuishaji | Ni zipi kati ya `AVERAGE`, `MIN`, `MAX`, `LAST` zinazohifadhiwa |
| Kumbukumbu (Archives) | Safu mlalo moja kwa kila azimio, kila moja ikiwa na kiwango cha mkusanyiko na idadi ya safu |
| Chaguomsingi | Ikiwa vyanzo vipya vya data vitachagua wasifu huu |

Hatua (step) huwa chaguomsingi kwa muda wa poller. Wasifu ambao hatua yake ni ndogo kuliko muda wa upigaji kura hauwezi kurejesha maelezo ambayo hayakuwahi kukusanywa sampuli. Ikiwa safu zake hazijulikani inategemea heartbeat na usawazishaji wa RRDtool.

## Zinazosafirishwa na mfumo

Wasifu tatu huja nje ya kisanduku. Zote tatu huweka kazi zote nne za ujumuishaji.

| Wasifu | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Wasifu wa 5 Minute ndio chaguo-msingi.

Kila moja ina kumbukumbu nne. Kiwango cha mkusanyiko huonyeshwa kama kiongeza hatua, kwa hivyo azimio halisi ni kizidishi mara hatua ya wasifu, na urefu wa muda ni azimio hilo mara idadi ya safu.

### 5 Minute Collection

| Kumbukumbu | Kizidishi | Safu mlalo | Azimio | Urefu wa muda |
|---|---|---|---|---|
| Daily | 1 | 600 | Dakika 5 | Karibu siku 2 |
| Weekly | 6 | 700 | Dakika 30 | Karibu siku 14 |
| Monthly | 24 | 775 | Saa 2 | Karibu siku 64 |
| Yearly | 288 | 797 | Siku 1 | Karibu miaka 2 na miezi 2 |

### 1 Minute Collection

| Kumbukumbu | Kizidishi | Safu mlalo | Azimio | Urefu wa muda |
|---|---|---|---|---|
| Daily | 1 | 2900 | Dakika 1 | Karibu siku 2 |
| Weekly | 15 | 1440 | Dakika 15 | Siku 15 |
| Monthly | 60 | 8784 | Saa 1 | Karibu siku 366 |
| Yearly | 720 | 7305 | Saa 12 | Karibu miaka 10 |

### 30 Second Collection

| Kumbukumbu | Kizidishi | Safu mlalo | Azimio | Urefu wa muda |
|---|---|---|---|---|
| Daily | 1 | 2900 | Sekunde 30 | Karibu siku 1 |
| Weekly | 30 | 1346 | Dakika 15 | Karibu siku 14 |
| Monthly | 120 | 1445 | Saa 1 | Karibu siku 60 |
| Yearly | 480 | 4380 | Saa 4 | Miaka 2 |

Majina ni lebo tu, si tabia ya lazima. Hakuna kinacholazimisha kwamba kumbukumbu inayoitwa "Yearly" ihifadhi mwaka mzima.

## Jinsi wasifu unavyogeuka kuwa faili

Wakati wa uundaji, kumbukumbu za wasifu na kazi za ujumuishaji husomwa na kubadilishwa kuwa amri ya kuunda. Hatua (step) inatoka kwa thamani ya `rrd_step` iliyohifadhiwa ya chanzo cha data, ambayo kwa kawaida hutolewa kutoka kwa wasifu wake. Kila kipengee cha chanzo cha data kilichojumuishwa huchangia mstari wa ufafanuzi unaobeba jina lake, aina, heartbeat, kima cha chini na kima cha juu. Kila kumbukumbu huchangia mstari mmoja kwa kila kazi ya ujumuishaji, ikibeba kazi, sababu ya X-Files, kizidishi na idadi ya safu.

Kumbukumbu nne mara kazi nne za ujumuishaji ni ufafanuzi kumi na sita wa kumbukumbu kwenye faili. Uzidishaji huo ndipo nafasi ya diski inapokwenda.

Ikiwa faili tayari ipo, njia ya kawaida ya kuunda huacha bila kuiandika upya. Marekebisho ya wasifu hayahamishi faili kiotomatiki. Zana za wazi za matengenezo ni operesheni tofauti, iliyoelezewa hapa chini.

## Kuchagua sera

Maswali matatu, kwa mpangilio huu.

**Ni swali gani la kina zaidi utakalowahi kuuliza?** Hilo huweka hatua (step). Hatua ya sekunde 30 hujibu "nini kilitokea wakati wa hitilafu hiyo ya sekunde 90". Hatua ya dakika 5 haiwezi kamwe kujibu hilo kwa faili yoyote iliyoundwa chini yake. Hatua ndogo hugharimu kazi ya ziada ya poller kwenye kila mzunguko pamoja na diski.

**Utauliza kurudi nyuma umbali gani?** Hilo huweka idadi ya safu za kumbukumbu ya kila siku. Usakinishaji mwingi hutaka siku kadhaa katika azimio kamili na kisha kuridhika na data ya jumla zaidi.

**Ni maswali gani yanasalia baada ya ujumuishaji?** Hilo huweka kazi za ujumuishaji. `AVERAGE` hujibu kile kilichokuwa cha kawaida. `MAX` hujibu ilifikia ubaya kiasi gani. `MIN` hujibu ikiwa ilishuka kabisa. `LAST` hujibu thamani ya mwisho ilikuwa nini kwenye dirisha, ambayo ni muhimu kwa usomaji ambao ni hali badala ya viwango.

Kuacha moja ya kazi nne za ujumuishaji hupunguza mzigo wa thamani zilizohifadhiwa wa faili mpya kwa robo katika kila azimio. Pia ni jambo ambalo watu huandika wakijutia baadaye. Weka `MAX` isipokuwa kama una uhakika hakuna mtu atakayeuliza kuhusu kilele.

## Kadiria ukubwa wa diski

Ukubwa wa faili moja unafuata kutoka kwa nambari ulizochagua. Kutoka kwa ukadiriaji unaotumika kwenye kiolesura:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Kiolesura kinatumia baiti 284 na 300 kama makadirio ya jumla ya uendeshaji. Chukulia hii kama ukadiriaji wa ukubwa, si maelezo kamili ya kila muundo wa faili ya RRDtool. Kila thamani iliyohifadhiwa ni baiti 8, na jumla ya safu mlalo ni jumla ya idadi ya safu katika ufafanuzi wa kumbukumbu za wasifu kabla ya kuzidisha kwa kazi za ujumuishaji. Pima faili za uwakilishi na RRDtool iliyosakinishwa kabla ya kukadiria hifadhi.

Kwa faili ya chanzo kimoja cha data iliyo na kazi zote nne za ujumuishaji:

| Wasifu | Jumla ya safu | Ukubwa wa faili unaokadiriwa |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Zidisha kwa idadi ya vyanzo vya data unavyotarajia, si kwa idadi ya grafu. Grafu inaweza kuchanganya sehemu kutoka faili moja au faili kadhaa. Hesabu faili halisi za RRD na vipengee vya vyanzo vya data ndani ya kila moja.

Vyanzo elfu ishirini vya data kwenye wasifu chaguomsingi ni takriban GB 1.8. Vyanzo hivyo elfu ishirini kwenye wasifu wa 1 Minute ni takriban GB 13. Uwiano huu unaonyesha azimio na vipindi tofauti vya uhifadhi vya wasifu, si hatua pekee. Ukusanyaji mzuri zaidi huongeza pia masafa ya uandishi. Tazama [Maandishi ya kiwango cha juu](/sw/concepts/high-volume-writes/) kabla ya kuchagua hatua ndogo kwa kiwango kikubwa.

Vihariri vyote vya wasifu na kumbukumbu vinaonyesha ukubwa uliokokotolewa unapobadilisha nambari. Vitumie. Hesabu hii ni rahisi kukosea kwa kizidishi cha nne.

## Nini kubadilisha wasifu hufanya, na hakifanyi

Hii ndiyo sehemu inayowagharimu watu historia yao.

| Mabadiliko | Athari kwenye faili mpya | Athari kwenye faili zilizopo |
|---|---|---|
| Ongeza au ondoa kumbukumbu | Inatumika | Hakuna |
| Badilisha idadi ya safu | Inatumika | Hakuna |
| Badilisha kiwango cha mkusanyiko | Inatumika | Hakuna |
| Ongeza au ondoa kazi ya ujumuishaji | Inatumika | Hakuna |
| Badilisha hatua (step) | Vyanzo vipya vya data huirithi; uundaji hutumia hatua yao iliyohifadhiwa | Hakuna uhamiaji wa faili kiotomatiki |
| Badilisha heartbeat | Uundaji hutumia metadata iliyohifadhiwa ya chanzo cha data; tazama hapa chini | Hakuna urekebishaji wa faili kiotomatiki |
| Futa wasifu | Inakataliwa wakati kiolezo au chanzo cha data kinairejelea, na kwa wasifu chaguomsingi | Hakuna |

**Kubadilisha heartbeat ya wasifu unaotumika husasisha metadata pekee.** Kuhifadhi heartbeat mpya huihifadhi kwenye wasifu na kwenye vipengee vya vyanzo vya data vya violezo na vyanzo vya data vya ndani vinavyotumia wasifu huo; violezo vingine havibadiliki.

Hifadhi hiyo hairekebishi faili zilizopo za RRD. Hifadhi nakala ya metadata pamoja na faili, na ulinganishe wasifu, vipengee vya kiolezo, vipengee vya chanzo cha data cha ndani na matokeo halisi ya `rrdtool info` baada ya matengenezo ya heartbeat.

Zana ya mkusanyaji mkuu ya `cli/update_heartbeat.php` inaweza kurekebisha faili zilizopo na kusasisha metadata. Anza na `--help`, `--list-heartbeats`, `--list-data-templates` na `--list-profiles`. Heartbeat mpya lazima iungwe mkono na iwe angalau mara mbili ya muda uliowekwa wa poller. Tumia `--data-template-id` ili kupunguza uteuzi; zana haina chaguo la dry-run.

Bila `--force`, wasifu zilizochaguliwa lazima tayari ziwe na heartbeat iliyoombwa. Kwa `--force`, thamani za wasifu zilizoshirikiwa pia hubadilika, kwa hivyo orodhesha watumiaji wao wote kabla ya kuendelea. `--prev-heartbeat` huchuja thamani za hifadhidata, si heartbeat iliyosomwa kutoka kwa kila RRD: baada ya hifadhi ya wavuti ya sehemu, kuchagua thamani ya faili ya zamani kunaweza kutolingana na chochote. Thibitisha uteuzi na ukague faili zinazotokana. Jaribio lililotengwa lilirekebisha kwa ufanisi faili yake iliyopo kutoka 600 hadi 900 baada ya metadata ya wasifu wake kusawazishwa.

Mitego mingine miwili inakaa karibu na hiyo.

**Kihariri huzuia mabadiliko ya kimuundo mara tu wasifu unapotumika.** Mara tu chanzo halisi cha data kinapokuwepo kwenye wasifu, hatua, sababu ya X-Files, kazi za ujumuishaji, idadi ya safu za kumbukumbu na viwango vya mkusanyiko huwa vya kusoma tu (read-only) kwenye kihariri; vidhibiti vya kuongeza/kufuta kumbukumbu pia hufichwa. Nakili wasifu na uhariri nakala hiyo. Vikwazo hivi vya kiolesura havijumuishi uthibitishaji wa upande wa seva wa maombi yaliyowasilishwa.

**Panga upya marejeleo kabla ya kufuta wasifu.** Orodha inazima uteuzi wakati kiolezo au chanzo cha data cha ndani kinapotumia wasifu, na seva inakataa kufuta wasifu ambao bado unarejelewa.

## Kuhamisha vyanzo vya data kati ya wasifu

Kuna hatua ya jumla (bulk action) kwenye violezo vya data ya kubadilisha wasifu. Huandika upya wasifu uliorekodiwa wa kiolezo, hatua na heartbeat, na inajizuia kwa makusudi kwenye safu mlalo za kiolezo pekee. Vyanzo vya data ambavyo tayari vipo havijumuishwi.

Kwa hivyo mlolongo wa uhamiaji halisi ni:

1. Jenga wasifu mpya na uangalie ukubwa wake uliokokotolewa.
2. Elekeza kiolezo cha data kwake.
3. Kubali kwamba kila kitu kilichoundwa kuanzia sasa kinatumia muundo mpya.
4. Amua, kando, nini cha kufanya kuhusu faili ambazo tayari unazo.

Hatua ya nne ina chaguzi kadhaa, kulingana na mabadiliko na toleo la RRDtool lililosakinishwa.

**Ziache kama zilivyo.** Miundo tofauti ya uhifadhi inaweza kuwepo pamoja. Weka metadata ya upigaji kura ya kila chanzo cha data iliyopo ikiwa thabiti na faili yake; kubadilisha rejeleo la wasifu wa hifadhidata pekee hakuhawishi hatua yake, sehemu au kumbukumbu.

**Jenga upya.** Futa na uunde upya chanzo cha data. Haraka, na historia inapotea.

**Splice.** Zana ya mstari wa amri ya splice huunganisha faili ya zamani kwenye faili mpya na inaweza kubadilisha azimio wakati inafanya hivyo, mradi faili mpya tayari ina hatua sahihi. Ina hali ya dry run. Itumie kwenye nakala kabla ya kuitumia kwenye chochote unachojali.

**Matengenezo ya RRDtool.** Kulingana na toleo lililosakinishwa na mabadiliko yanayotarajiwa, [rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) au [rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) inaweza kubadilisha faili iliyopo wakati wa kuhifadhi data iliyobaki. Simamisha waandishi wanaoshindana, weka nakala rudufu na uthibitishe matokeo kwenye nakala. Shughuli hizi hazitengenezi upya maelezo ambayo tayari yametupwa na ujumuishaji.

## Wasifu wa nje

Chanzo cha data kinaweza kuwekwa kwenye wasifu wa nje, ambao hurekodi hatua ya sifuri. Hiyo inasema faili inasimamiwa nje ya njia ya kawaida, na orodha ya chanzo cha data inaionyesha kama ya nje badala ya kunukuu muda. Itumie kwa faili ambazo mchakato mwingine unaandika. Usiitumie kumaanisha "hakuna sera", kwa sababu uhifadhi bado ni chochote ambacho faili ilijengwa nacho; haijaelezewa tu mahali popote unapoona.

## Njia za kutofaulu

| Dalili | Sababu ya kawaida |
|---|---|
| Uhariri wa wasifu unaonekana kutofanya chochote | Inatarajiwa. Faili zilizopo huweka muundo zilioundwa nazo |
| Idadi ya safu na kiwango cha mkusanyiko haviwezi kuhaririwa | Wasifu unatumika na angalau chanzo kimoja cha data. Unakili |
| Kiolesura kinaonyesha heartbeat moja, faili inafanya kazi kama nyingine | Heartbeat ya wasifu ilibadilika na faili hazikurekebishwa kamwe |
| Vyanzo vipya vya data vinashindwa kuunda, kumbukumbu inasema hakuna kumbukumbu zilizowekwa | Wasifu ulifutwa wakati vyanzo vya data bado viliurejelea |
| Kumbukumbu bora zaidi imejaa zisizojulikana (unknowns) | Angalia masasisho yaliyokosekana, heartbeat na sheria za ujumuishaji |
| Wiki ya grafu ina mapengo kila baada ya masaa machache | Heartbeat iko karibu sana na hatua kwa poller inayochelewa |
| Vilele vilivyoonekana jana vimepotea kwenye mwonekano wa mwezi | `AVERAGE` pekee ndiyo inayowekwa, au kumbukumbu ya `MAX` ilitupwa ili kuokoa nafasi |
| Diski ilikua kwa kasi mara nne kuliko ilivyokadiriwa | Makadirio yalihesabu kumbukumbu lakini si kazi za ujumuishaji |
| Azimio linalotarajiwa halipo kwenye menyu kunjuzi ya kumbukumbu mpya | Kihariri hutoa kumbukumbu bora zaidi katika hatua ya wasifu, kisha chaguo mbaya zaidi kuliko kumbukumbu zilizopo |
