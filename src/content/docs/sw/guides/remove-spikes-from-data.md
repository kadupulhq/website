---
title: Ondoa miinuko ya ghafla kutoka kwa data
description: Kagua masahihisho ya miinuko ya ghafla (spikes), hifadhi nakala za urejeshaji, na uthibitishe mabadiliko kwenye sampuli zilizohifadhiwa za RRD.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 19
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

:::danger[Hii inaandika upya historia; kurejesha kunahitaji nakala]
Uondoaji wa miinuko ya ghafla (spikes) humwaga kumbukumbu, kuhariri thamani, kurejesha faili ya muda na kubadilisha ya asili baada ya uthibitishaji. Hakuna kutendua kiotomatiki. Hifadhi na uthibitishe nakala ya urejeshaji, endesha `--dryrun` kwanza, na uthibitishe sampuli lengwa kabla ya kufanya mabadiliko.
:::

Muinuko wa ghafla (spike) hapa unamaanisha sampuli moja au mbili kubwa zaidi kuliko kila kitu kinachozizunguka kiasi kwamba mhimili wima hupima kulingana nazo na sehemu iliyobaki ya grafu inabana kwenye mstari wa msingi. Kipimo si sahihi, na pia kinapotosha taswira ya grafu.

## Zinatoka wapi

Miinuko mingi kwenye chanzo cha data kinachotegemea kaunta ni makosa ya kihesabu, si vipimo halisi. Chanzo cha data cha kaunta huhifadhi kiwango kilichokokotolewa kutoka kwa tofauti kati ya usomaji miwili. Chochote kinachofanya usomaji wa pili kuwa mkubwa zaidi kuliko wa kwanza, kulingana na wakati kati yao, kinaweza kutoa kiwango cha uwongo. Uwekaji upya wa kaunta, utunzaji usio sahihi wa wrap, uwekaji upya wa faharisi ya kiolesura unaohamisha usomaji kwenye chanzo kibaya cha data, au hitilafu za muhuri wa muda zinaweza kusababisha hii. Wrap ya kawaida ya kaunta yenyewe si uthibitisho wa sampuli mbaya; thibitisha aina ya chanzo cha data na usomaji wa pembejeo.

Tazama [Vyanzo vya data na kumbukumbu](/sw/concepts/data-sources-and-rras/) kwa jinsi kiwango kinavyotolewa.

Rekebisha sababu pale unapoweza. Kuondoa muinuko wa ghafla ni jambo la urembo tu; hakuzuii muinuko unaofuata.

## Njia nne

Zana inafanya kazi kwenye faili nzima: inamwaga kila kumbukumbu katika faili ya RRD, inaamua ni thamani gani za kubadilisha, na kurejesha matokeo.

| Njia | Inachochagua | Inahitaji dirisha |
|---|---|---|
| `stddev` | Thamani zaidi ya mikengeuko ya kawaida ya N kutoka kwa wastani | Hapana |
| `variance` | Thamani zaidi ya asilimia N juu ya wastani baada ya thamani zilizokithiri kuondolewa | Hapana |
| `float` | Kila kitu ndani ya dirisha maalum la wakati | Ndiyo |
| `fill` | Sampuli zisizojulikana na zenye thamani ya sifuri ndani ya dirisha maalum la wakati | Ndiyo |

`stddev` na `variance` huwinda. `float` na `fill` hufanya kile unachowaambia ndani ya masafa unayotaja, na zote mbili hushindwa mara moja ikiwa hutatoa mwanzo na mwisho.

`fill` haizuiliwi na data iliyokosekana tu: inaweza kubadilisha zero zilizopimwa na thamani zisizo sifuri. Usiitumie kwenye safu iliyo na usomaji halali wa kutofanya kazi au sifuri isipokuwa mabadiliko hayo yamekusudiwa.

Njia ya utofauti huondoa sampuli za juu na za chini za N kabla ya kuhesabu wastani unaolinganishwa nazo, ambapo N ni mpangilio wa outliers. Hilo ndilo linalozuia spike kupandisha kizingiti kilichokusudiwa kuikamata.

Chochote kinachochaguliwa kinabadilishwa, na kuna vibadala vitatu.

| Mbadala | Matokeo |
|---|---|
| `last` | Thamani nzuri ya mwisho inayojulikana. Chaguo-msingi. |
| `avg` | Wastani uliokokotolewa wa uwanja/kumbukumbu; hesabu inategemea njia. |
| `nan` | Isiyojulikana (unknown) kwa njia za kitakwimu; tazama kizuizi cha njia ya dirisha hapa chini. |

Isiyojulikana hurekodi kuwa kipimo kinachoweza kutumika hakipatikani. `last` na `avg` hubadilisha thamani ambazo zinaweza kuonekana kupimwa kwa mtu anayesoma grafu baadaye. Chagua kibadala kwa makusudi na uthibitishe matokeo halisi yaliyohifadhiwa.

**Njia za dirisha zilizo na NaN:** kwa `--avgnan=nan`, `float` hubadilisha kila thamani inayojulikana kwenye dirisha na isiyojulikana, na `fill` hubadilisha thamani za sifuri au zisizo za nambari kwenye dirisha na zisizojulikana. Njia za takwimu zilizo na mipaka ya muda ya hiari hubadilisha tu outliers zilizogunduliwa, kwa hivyo si sawa na kufuta dirisha zima.

## Hakiki kwanza, kisha jitoe kutekeleza

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Ukimbiaji kavu (dry run) humwaga RRD na kuichanganua bila kuandika upya faili ya moja kwa moja. Bado inahitaji saraka ya kazi inayoweza kutumika na ufikiaji wa matengenezo. Hakikisho halizuii faili hadi kujitolea baadaye: sampuli mpya au chaguo zilizobadilishwa zinaweza kubadilisha matokeo. Mfano wa dirisha bado unatumia uteuzi wa takwimu; hauondoi kila thamani katika dirisha hilo.

Hoja za wakati zinakubali muhuri wa muda wa Unix au kamba ya tarehe. Kamba ambayo haiwezi kuchanganuliwa inakataliwa kabla ya kuandika upya. Tumia mihuri ya muda ya Unix wakati tafsiri ya eneo la saa ingekuwa na utata.

## Nini hasa hutokea kwa faili

Inafaa kujua kabla ya kuiendesha kwenye kitu unachojali.

1. Faili inamwagwa kwa XML katika saraka ya chelezo.
2. Maoni huondolewa na kila kumbukumbu inachanganuliwa kwa takwimu.
3. Thamani zilizochaguliwa hubadilishwa katika XML.
4. Faili asili inanakiliwa kwenye saraka ya chelezo.
5. XML iliyohaririwa inarejeshwa kwa faili ya muda, inathibitishwa, na kupewa jina jipya juu ya ile ya asili huku ikihifadhi mmiliki, kikundi na modi yake.

Hatua ya 4 ndiyo wavu wa usalama, na si ya hiari: ikiwa nakala itashindwa, kurejesha hakutekelezwi. Nakala hiyo, na si bendera yoyote ya mstari wa amri, ndiyo utakayorejesha kutoka kwayo. Jina lake linatokana na asili na linaweza kupokea kiambishi tamati cha kipekee ili kuzuia kubatilisha kile kilichopo. `--backup` huomba pia picha ya urejeshaji ya kudumu. Soma njia zilizoripotiwa na uthibitishe nakala kabla ya kuzitegemea.

Operesheni inahitaji saraka za ndani za POSIX zinazoaminika na kufuli kwa matengenezo; biti za hali ya kuandika pekee hazitoshi. Inakataa uhifadhi usiotumiwa na mwisho uliosanidiwa wa rrdcached. Simamisha waandishi wa nje, ambao hawashiriki katika itifaki ya kufuli ya Kadupul. Endesha kama akaunti ya huduma inayomiliki hifadhi iliyokusudiwa. Tazama [mahitaji ya usakinishaji](/sw/reference/requirements/) kwa ufikiaji wa hifadhi.

## Mipangilio inayodhibiti chaguomsingi

Hoja za mstari wa amri hushinda. Chochote unachoacha kinatoka kwa mipangilio ya mfumo, na mipangilio ya kila mtumiaji inabatilisha ile ya mfumo wakati chombo kinaendeshwa kutoka kwa kiolesura.

| Mpangilio | Chaguo-msingi | Inachofanya |
|---|---|---|
| Njia ya kuondoa | Variance na outliers kuondolewa | Njia ipi ya kutumia |
| Njia ya uingizwaji | Inayojulikana kuwa nzuri ya mwisho | Nini kinachukua nafasi ya thamani iliyoondolewa |
| Idadi ya mikengeuko ya kawaida | 10 | Kizingiti cha njia ya `stddev` |
| Asilimia ya tofauti | 1000 | Kizingiti cha njia ya `variance` |
| Idadi ya tofauti ya outliers | 5 | Sampuli za juu na za chini zimeondolewa kabla ya wastani |
| Upeo wa mauaji kwa kila RRA | 5 | Dari iliyokusudiwa; kwa sasa haitekelezwi kwa uhakika |
| Saraka ya chelezo ya RRDfile | `cache/spikekill/` chini ya usakinishaji | Mahali ambapo dump na nakala huenda |
| Uhifadhi wa nakala rudufu | Miezi 3 | Muda ambao nakala huwekwa |

Kuna pia hali ya kundi (batch mode): ratiba (kila saa 6, 12, 24 au 48), wakati wa msingi, na orodha ya violezo vya grafu vya kufanyia kazi. Hali ya kundi imezimwa kwa chaguo-msingi. Kuiwasha inamaanisha mfumo unahariri kumbukumbu bila mtu yeyote kuangalia matokeo. Zuia orodha ya violezo kwa uthabiti ikiwa utaiwasha kabisa.

## Mitego

**Vizingiti chaguo-msingi vimelegezwa kwa makusudi.** Mikengeuko ya kawaida kumi na tofauti ya asilimia 1000 ni pana sana. Ukimbiaji ambao hauripoti miinuko pengine haujashindwa; umekuambia kuwa maadili yako ndani ya bendi uliyoomba. Kaza kizingiti badala ya kubadilisha njia bila mpangilio.

**Upeo wa mauaji kwa kila RRA huweka kikomo kwa njia za takwimu pekee.** Kwa `stddev` na `variance`, hesabu inashughulikia vyanzo vyote vya data katika kumbukumbu moja na huwekwa upya katika kumbukumbu inayofuata. Njia za dirisha za `float` na `fill` hubadilisha kila thamani inayolingana kwenye dirisha. Hesabu ya muhtasari inajumuisha uingizwaji wa NaN. Kagua uhakiki kamili na utumie dirisha nyembamba la wakati.

**Thamani iliyojumuishwa haiwezi kurejeshwa.** Kumbukumbu za zamani hushikilia thamani moja kwa kila ndoo, ikiwa tayari imewekwa wastani. Kubadilisha thamani hiyo hakurejeshi kipimo cha kweli cha ndoo; hubadilisha moja inayowezekana. Kadiri unavyorudi nyuma, ndivyo urekebishaji unavyozidi kuwa makisio.

**Saraka ya chelezo lazima isanidiwe na kuaminika.** Faili za dump na nakala za urejeshaji huenda huko. Saraka ambazo hazipo, zisizo salama au zisizoweza kuthibitishwa zinakataliwa; usifanye saraka iweze kuandikwa na ulimwengu wote (world-writable) ili kukwepa hitilafu.

**Weka rekodi yako ya mabadiliko pamoja na kumbukumbu za programu.** Rekodi mwendeshaji, amri, masafa ya saa, njia za chelezo na ukaguzi wa kabla/baada. Hesabu za muhtasari pekee si ushahidi wa kutosha wa kile kilichobadilika.

**Endesha kama akaunti ya huduma inayokusudiwa.** Uingizwaji uliofanikiwa huhifadhi umiliki wa faili na hali. Root si njia ya mkato karibu na ukaguzi wa uaminifu wa saraka; thibitisha kuwa upigaji kura wa kawaida bado unaweza kusasisha matokeo.

**Kuondoa spike hakurekebishi grafu ikiwa chanzo cha data si sahihi.** Ikiwa faharisi ya kiolesura ilihamisha maadili kwenye chanzo kibaya cha data, spike ni dalili tu. Tazama [Tatua matatizo ya data iliyokosekana](/sw/guides/troubleshoot-missing-data/) kabla ya kuanza kuhariri kumbukumbu.
