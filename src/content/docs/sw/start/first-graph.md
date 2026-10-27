---
title: "Soma grafu yako ya kwanza"
description: "Nini maana halisi ya mistari hiyo, na makosa matatu yanayofanya watu waielewe vibaya."
sidebar:
  order: 4
banner:
  content: "Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha."
---

Grafu hapa si picha ya data yako yote. Ni picha ya muhtasari wa data yako, na kujua ni muhtasari upi unaofaa ni jambo la msingi.

## Unachoangalia

Kila grafu inachorwa kutoka kwenye kumbukumbu ya mzunguko (round-robin archive). Kumbukumbu huhifadhi sampuli za hivi karibuni kwa ubora kamili na sampuli za zamani zikijumuishwa katika ndoo kubwa zaidi. Unapovuta picha nje hadi mwaka mmoja, huoni kila sampuli ya dakika tano. Unaona thamani moja kwa kila ndoo, iliyochaguliwa na kitendakazi cha ujumuishaji (consolidation function).

Kitendakazi hicho kwa kawaida huwa ni wastani (average). Inaweza pia kuwa kiwango cha juu zaidi (maximum) au cha chini zaidi (minimum). Hili ni muhimu zaidi kuliko kitu kingine chochote kwenye ukurasa huu.

Kwa ombi la kawaida la grafu, Kadupul huunganisha amri ya RRDtool kutoka kwenye usanidi wa grafu na kuiendesha dhidi ya faili zilizopo kwenye diski. Aina tatu za mistari huingia kwenye amri hiyo na inasaidia kujua kila moja inafanya nini.

| Sehemu | Inachofanya |
|---|---|
| Ufafanuzi | Hutaja jina la faili, chanzo cha data ndani yake, na kitendakazi cha ujumuishaji |
| Kitu cha kuchora | Hugeuza mfululizo mmoja kuwa mstari, eneo, au ukanda katika mrundikano |
| Kitu cha ufafanuzi (legend) | Huchapisha nambari moja, iliyokokotolewa kwenye dirisha unalolitazama |

Mchakato mzima umeelezewa katika [Jinsi grafu zinavyochorwa](/sw/concepts/how-graphs-are-drawn/). Huna haja nayo leo. Unachohitaji kujua ni kwamba ufafanuzi wa grafu na kipindi cha muda kilichoombwa ndivyo vinavyoamua picha. Njia za akiba na grafu za wakati halisi zinaweza kufanya kazi kwa njia tofauti.

## Anza na saa nne zilizopita

Anza na dirisha fupi la hivi karibuni. Kumbukumbu iliyochaguliwa inategemea uhifadhi, hatua na ubora wa grafu; saa nne hazihakikishi data ghafi au isiyojumuishwa. Hata kumbukumbu bora zaidi ina thamani zilizorekebishwa kulingana na wakati. Tumia amri ya kurekebisha hitilafu ya grafu na `rrdtool info` kuangalia kitendakazi kilichoombwa na hatua za kumbukumbu zilizopo kabla ya kulinganisha thamani.

Sifa mbili za grafu mpya ni za kawaida lakini huwatia watu wasiwasi.

**Mstari unaweza kuishia kabla ya sasa.** Ndoo ya sasa inaweza kuwa haijakamilika. Muda wa ukusanyaji, uhifadhi wa muda (buffering) na urekebishaji vinaweza pia kuchelewesha mwisho unaoonekana. Kagua alama za wakati za sasisho zinazosonga mbele badala ya kuchukulia ucheleweshaji uliowekwa kama uthibitisho wa afya ya mfumo.

**Sehemu ya kwanza inaweza kukosekana.** Chanzo cha data kilichoundwa saa moja iliyopita kina saa moja ya data na miezi kumi na moja ya kutokuwa na kitu. Kumbukumbu hutengwa kikamilifu wakati wa uundaji, kwa hivyo sehemu tupu ni hifadhi halisi inayongoja kutumika.

## Kisha ipanue, na utazame jinsi kilele kinavyobadilika

Panua upeo hadi wiki moja. Vilele vinaweza kusinyaa wakati grafu inapochagua wastani mkubwa zaidi. Kwa mfano, ikiwa matumizi ni 100% kwa dakika tano na sifuri kwa dakika 55 zilizobaki, wastani wa saa ni karibu 8.3%. Mlipuko wa dakika nne katika saa isiyo na shughuli huwa na wastani wa karibu 6.7%. Vilele vifupi vinaweza kuwa tayari vimelainishwa ndani ya muda asilia wa kuchukua sampuli.

Ujumuishaji huondoa maelezo ya kina. Ikiwa historia ya ubora wa juu imeisha muda wake, kuvuta karibu tena hakuwezi kuirejesha kutoka kwenye kumbukumbu ya wastani.

Hili ni kosa la kwanza kati ya matatu, na ndilo linalosababisha mabishano mengi zaidi.

**Kusoma wastani kama kilele.** Ikiwa unajali kuhusu kujaa kwa uwezo (saturation), angalia grafu iliyojengwa juu ya kiwango cha juu zaidi, si wastani. Hiyo inafanya kazi tu ikiwa kumbukumbu zinashikilia viwango vya juu. Ikiwa wastani mikubwa pekee ndiyo iliyobaki, vilele asilia haviwezi kurejeshwa. Kumbukumbu ya MAX huhifadhi viwango vya juu vya pointi zake za ingizo zilizorekebishwa kwa wakati, si kilele cha papo hapo ambacho hakikuonekana kati ya vipindi vya ukaguzi.

Kuna hitilafu ya kimya hapa inayofaa kueleweka. Ikiwa kipengee cha grafu kinaomba viwango vya juu na faili halina, msaidizi wa uteuzi wa Kadupul anaweza kurudi nyuma kwenye kitendakazi cha kwanza kinachopatikana, au AVERAGE wakati ambapo hawezi kuamua vitendakazi vilivyopo. Picha inaonekana sawa, lakini inajibu swali tofauti kabisa.

**Kusoma pengo kama sifuri.** Pengo huwakilisha thamani isiyojulikana iliyochorwa. Sababu ni pamoja na masasisho yanayokosekana, maingizo yasiyojulikana wazi, thamani zilizokataliwa na mifumo ya maneno ya grafu. Haionyeshi kifaa kisichopatikana pekee.

Heartbeat ni muda wa juu zaidi unaoruhusiwa kati ya masasisho, si muda wa ziada unaoongezwa kwenye hatua. Kwa mfano, hatua ya sekunde 300 yenye heartbeat ya sekunde 600 inaruhusu zaidi ya sekunde 600 kati ya masasisho, si 900. Viwango vya juu vya data isiyojulikana kwenye kumbukumbu pia huathiri mapengo yanayoonekana. Tazama [Ufafanuzi wa vyanzo vya data vya RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) na [Muda na vipindi](/sw/concepts/time-and-intervals/).

Kuwa mwangalifu na stacked graphs hapa. Baadhi ya violezo hubadilisha sifuri badala ya thamani zisizojulikana katika maonyesho yao ya grafu. Kwenye grafu hizo, hitilafu na kipindi kisicho na shughuli huonekana sawa kimakusudi. Kagua mwonekano ambao haujapangwa kabla ya kuhitimisha kuwa huduma imezimika.

**Kulinganisha grafu mbili zenye vipimo tofauti vya wima.** Grafu mbili zilizowekwa kando kwa kando zitapima kulingana na data yake yenyewe. Mwinuko mdogo na mkubwa unaweza kuonekana sawa kabisa. Kagua mstari wa upimaji (axis) kabla ya kuhitimisha chochote.

Wakati unatazama mstari wa upimaji, angalia msingi wake. Grafu inaweza kuweka lebo kwa maelfu au kwa vizio vya 1024. Nambari zilizohifadhiwa ni sawa; lebo pekee ndizo zinazobadilika. Tofauti inategemea kiambishi awali: 1024 dhidi ya 1000 ni 2.4% kwa kipeo kimoja na huongezeka kwa viambishi vikubwa zaidi. Angalia pia biti dhidi ya baiti, maonyesho ya grafu na ujumuishaji; tofauti ya asilimia pekee haibainishi sababu.

## Kusoma ufafanuzi (legend)

Ufafanuzi unabeba nambari ambazo ni muhimu zaidi kuliko umbo la grafu. "Current" kwa kawaida ni punguzo la LAST la mfululizo uliochaguliwa, ambalo si lazima liwe kipimo kilichochukuliwa wakati huo hasa unapoangalia grafu. Wastani na kiwango cha juu hukokotolewa katika dirisha unalolitazama, si katika wakati wote, kwa hivyo hubadilika kadiri unavyovuta picha.

Maingizo ya ufafanuzi yaliyotolewa ni kiwango cha chini, kiwango cha juu, wastani, na cha mwisho, ambacho kimewekewa lebo kama current. Mambo mawili kuwahusu huwashangaza watu.

**Nambari ya ufafanuzi ni punguzo la kile kilichochorwa, si kile kilichohifadhiwa.** Kiwango cha juu kilichochapishwa juu ya mfululizo unaosomwa na wastani ni kiwango cha juu cha wastani huo uliotokana na ubora uliochaguliwa. Si sampuli kubwa zaidi iliyowahi kuchukuliwa. Kwenye muunganisho wenye shughuli nyingi hizi ni nambari tofauti sana, na zote mbili ni majibu halali kwa maswali tofauti.

**Angalia ni mfululizo upi unaotumiwa na ufafanuzi.** Maingizo ya kawaida ya GPRINT yanaweza kurithi mfululizo wa kipengee kilichochorwa awali; vipengee maalum vya kima cha chini, kima cha juu, wastani na cha mwisho vinashughulikiwa kando. Kupanga upya vipengee kwenye kiolezo cha grafu kunaweza kubadilisha kile ambacho ufafanuzi unaripoti bila mtu yeyote kuhariri ufafanuzi. Ikiwa nambari itabadilika baada ya uhariri wa kiolezo usiohusiana, kagua mpangilio wa vipengee kwanza.

## Wakati grafu inapoonekana kuwa na hitilafu

Kagua njia ya ukusanyaji katika mpangilio huu; zaidi ya hatua moja inaweza kuwa na hitilafu.

1. Je, kifaa kinajibu sasa hivi?
2. Je, poller inafanya kazi, na inamaliza ndani ya muda wake?
3. Je, faili la RRD lina wakati wa hivi karibuni wa sasisho?
4. Je, grafu inasoma chanzo cha data unachofikiria?

Kihalisi:

**Hatua ya 1.** Endesha amri ile ile ya `snmpget` uliyoiendesha ulipoongeza kifaa, kutoka kwa mkusanyaji aliyepangiwa. Ikiwa itashindwa, tatua hitilafu hiyo ya ukusanyaji kabla ya kuhukumu grafu.

**Hatua ya 2.** Tafuta muhtasari wa mwisho wa mzunguko. Ikiwa haupo, kagua upangaji ratiba, lengwa la kumbukumbu lililowekwa na hitilafu za mapema za poller. Mzunguko mrefu kuliko muda uliowekwa unaweza kuchelewesha masasisho; linganisha pengo la sasisho linalotokana na heartbeat.

**Hatua ya 3.** Uliza RRDtool moja kwa moja:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` inaripoti alama ya wakati ya sasisho la mwisho, ikijumuisha masasisho yenye thamani zisizojulikana; maandishi yaliyohifadhiwa yanaweza kuichelewesha. Tumia `lastupdate` na `fetch` kukagua thamani kama ilivyoelezwa kwenye mwongozo wa kifaa. `info` inakuambia hatua, heartbeat, aina ya chanzo cha data, na ni kumbukumbu zipi zilizopo. Ikiwa faili halina kumbukumbu ya viwango vya juu, hilo linamaliza swali la kilele lililo hapo juu.

**Hatua ya 4.** Washa hali ya kurekebisha makosa ya grafu na usome amri ambayo grafu inazalisha. Inataja majina ya faili, vyanzo vya data ndani yake, na kitendakazi cha ujumuishaji kwa kila kimoja. Grafu inayoelekeza kwenye chanzo tofauti cha data kuliko unavyodhani ni jambo la kawaida baada ya violezo kutumiwa tena au violesura kuorodheshwa upya.

## Dalili na maana yake kwa kawaida

| Unachokiona | Kwa kawaida |
|---|---|
| Mstari ulionyooka kwenye sifuri | Inaweza kuwa sifuri halisi au mfumo unaobadilisha thamani isiyojulikana kuwa sifuri |
| Mstari unakoma, kisha unaendelea | Thamani isiyojulikana ilikatiza mfululizo uliopangwa; kagua ukusanyaji na mifumo ya grafu |
| Mapengo madogo mara kwa mara | Poller inamaliza kwa kuchelewa, au heartbeat imewekwa karibu sana na hatua |
| Kilele kinaonekana katika saa nne, hakipo katika wiki moja | Kagua ubora wa kumbukumbu na ujumuishaji kabla ya kudhani upotevu wa data au hitilafu ya ukusanyaji |
| Kiwango cha juu cha ufafanuzi ni kidogo kuliko kilele kilichochorwa | Ufafanuzi unapunguza mfululizo tofauti na unavyofikiria |
| Grafu yote ni tupu, hakuna hitilafu | Hakuna chanzo cha data nyuma yake, au bado hakuna kilichokusanywa |
| Thamani zinatofautiana kwa kiasi kikubwa sana | Aina isiyo sahihi ya chanzo cha data, au kaunta za biti 32 zinazunguka |
| Grafu mbili za kiungo kimoja zinatofautiana kidogo | Msingi tofauti wa mstari wa upimaji, au ujumuishaji tofauti |

[Tatua data inayokosekana](/sw/guides/troubleshoot-missing-data/) hufuata njia hiyo hiyo kwa kina zaidi. [Rekebisha mwonekano wa grafu](/sw/guides/tune-graph-appearance/) inashughulikia kubadilisha jinsi grafu inavyoonekana pindi unapoamini kile inachosema.

Huo ndio mwongozo. Una usakinishaji, kifaa kinachojibu, na grafu unayoweza kuisoma. Kuanzia hapa, [Miongozo ya matumizi](/sw/guides/monitor-a-switch/) inashughulikia kazi maalum, na [Dhana](/sw/concepts/architecture/) zinaeleza kwa nini mfumo unafanya kazi jinsi unavyofanya.
