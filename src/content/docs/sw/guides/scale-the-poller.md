---
title: Ongeza uwezo wa poller
description: Nini cha kubadilisha wakati ukusanyaji unapoacha kumalizika ndani ya muda wake, na jinsi ya kutambua kikomo ulichofikia.
banner:
  content: Kadupul iko katika hatua ya pre-alpha. Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Huu ni mswada wa tafsiri; uhakiki wa mtaalamu wa lugha unasubiriwa.
sidebar:
  order: 6
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo la Kadupul linaloungwa mkono au njia ya uhamiaji kwa sasa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Kuongeza uwezo wa poller ni swali moja: je, mzunguko wa ukusanyaji unamalizika kabla ya mwingine kuanza? Kila kitu hapa chini kinahusu kujibu swali hilo na kurejesha jibu kuwa ndiyo.

Soma [Usanifu](/sw/concepts/architecture/) kwanza ikiwa hauko wazi kuhusu sehemu inayofanya ukusanyaji.

## Saa mbili

Kuna vipindi viwili na havifanani kimpangilio.

| | Ni nini | Thamani zinazoruhusiwa |
|---|---|---|
| Kipindi cha kizindua | Ni mara ngapi mfumo wa uendeshaji unapoanza mkusanyaji, kutoka kwa cron au huduma ya `cactid` | Sekunde 60 au 300 |
| Kipindi cha poller | Mdundo wa msingi wa ukusanyaji; hatua za chanzo kikuu cha data zinaweza kuwa ndefu zaidi | Sekunde 10, 15, 20, 30, 60 au 300 |

Wakati kipindi cha poller ni kifupi kuliko kipindi cha kizindua, uzinduzi mmoja hufanya mizunguko kadhaa ya ukusanyaji katika kitanzi. Idadi ya mizunguko ni kipindi cha kizindua kikitenganishwa na kipindi cha poller.

Muda uliotengwa kwa uzinduzi wote unatokana na nambari hizo mbili: mizunguko ikizidishwa na kipindi cha poller, ukiondoa sekunde mbili. Hiyo ndiyo saa halisi ya ukutani (wall clock) ambayo utendaji hupimwa dhidi yake.

## Nini kinatokea wakati uendeshaji unazidi muda

Mambo matatu tofauti hutokea, na hutoa mistari mitatu tofauti ya kumbukumbu (log).

**Uendeshaji hukatizwa.** Wakati muda uliopita unazidi muda uliotengwa, poller huandika kwamba kiwango cha juu cha muda wa uendeshaji kimezidiwa, huandika takwimu zake, na hutoka. Kazi ambayo haijatoa sampuli inaweza kuacha pengo. Sampuli zilizokwisha kubaliwa kwenye foleni ya kudumu zinaweza kubaki zikisubiri uandishi wa RRD uliofanikiwa baadaye; kuzidi muda hakumaanishi kuwa kila kipimo ambacho hakijatolewa kilitupwa. Kagua kina cha foleni na kumbukumbu pamoja na grafu, na usifute safu zilizohifadhiwa ili kufanya uendeshaji unaofuata uonekane safi.

**Uendeshaji unaofuata hutambua mabaki.** Wakati wa kuanza, poller huhesabu safu za michakato ambayo haikufungwa kamwe na huonya kuwa michakato iligunduliwa ikizidi mzunguko wa upigaji kura. Chunguza kumbukumbu za michakato isiyokamilika au ya zamani na michakato halisi ya watoto inayofanya kazi; onyo pekee halitambui kikwazo.

**Saa zinapoteza maelewano.** Ikiwa muda mwingi ulipita tangu uendeshaji wa mwisho kuliko bajeti inavyoruhusu, poller huonya kwamba kizindua hakilingani na kipindi cha poller. Hii kwa kawaida hutokana na kizindua, si poller: ingizo la cron katika marudio yasiyo sahihi, huduma iliyosimama, au seva pangishi iliyokuwa imelala.

Njia hizi huita msaidizi wa arifa za msimamizi. Uwasilishaji unategemea wapokeaji waliowekwa, vidhibiti vya arifa na usafirishaji unaofanya kazi wa barua pepe; onyo la kumbukumbu halithibitishi kuwa barua pepe iliwasili. Tazama [Arifa za barua pepe](/sw/guides/send-email-notifications/).

Kuna kisa cha nne ambacho si kuzidi muda. Ikiwa poller imeanzishwa tena mapema kuliko inavyotarajiwa, huweka kumbukumbu kwamba imesanidiwa kufanya kazi mara kwa mara sana na hutoka bila kukusanya. `--force` hupita ukaguzi huo wa muda; itumie tu wakati wa uchunguzi unaodhibitiwa huku uzinduzi ulioratibiwa na wa mikono ukiwa umesimamishwa. Haiongezi uwezo au kufanya ukusanyaji unaoingiliana kuwa salama.

## Mstari wa takwimu

Kila uendeshaji uliokamilika huandika mstari mmoja wa takwimu kwenye kumbukumbu. Hubeba muda uliopita, njia ya ukusanyaji, hesabu za michakato na nyuzi, idadi ya vifaa, vifaa kwa kila mchakato, vyanzo vya data, na faili za RRD zilizochakatwa.

Fuatilia mielekeo ya muda uliopita, ucheleweshaji wa mwisho, kina cha foleni na masasisho yaliyoshindwa. Chunguza hata uendeshaji uliotengwa ulio karibu na bajeti unaposababisha mapengo; ukuaji endelevu husaidia kutambua wakati uwezo au tabia ya ukusanyaji inapohitaji kubadilika.

## Michakato na nyuzi

Vipimo viwili, na hufanya mambo tofauti.

| Kipimo | Kitengo cha kazi kinachogawanywa | Mkusanyaji gani anayeitumia |
|---|---|---|
| Michakato | Vifaa, vilivyogawanywa katika masafa mfululizo ya vitambulisho vya vifaa | Wote wawili |
| Nyuzi | Vipengee ndani ya kifaa kimoja | Spine pekee |

Matokeo yake ni sehemu ambayo watu hukosea: **mchakato hupewa vifaa kamili.** Kifaa kimoja chenye vyanzo vya data elfu tano hakiwezi kugawanywa katika michakato mingi. Huingia katika mchakato mmoja na mchakato huo huchukua muda unaohitaji. Kuongeza michakato hakusaidii chochote kwa hilo.

Thamani zote mbili huwekwa kwa kila mkusanyaji wa data, si kwa ujumla. Thamani zilizo kwenye ukurasa wa mipangilio ni zilizowekwa awali zinazotumika wakati mkusanyaji mpya wa data anapoundwa. Kubadilisha mpangilio wa awali hakubadilishi mkusanyaji aliyepo.

Pia kuna hesabu ya nyuzi kwa kila kifaa, ambayo ndiyo jinsi kifaa kimoja kikubwa kinavyogawanywa. Inatumika kwa mkusanyaji wa C pekee.

Balance Process Load hutumia hesabu zilizokusanywa za vipengee kuchagua mipaka kati ya vifaa vizima kwa mpangilio wa kitambulisho cha kifaa. Haigawanyi kifaa kimoja au kuhakikisha hesabu sawa za vipengee, na hesabu ya vipengee si muda wa utekelezaji. Linganisha muda kwa kila mchakato kabla na baada ya kuiwezesha kwenye mzigo wa kazi unaowakilisha uliotengwa.

## Mkusanyaji wa PHP dhidi ya mkusanyaji wa C

Mkusanyaji wa PHP, `cmd.php`, husafirishwa na programu tumizi. Kadupul inapanga kudumisha uma wa Spine, lakini eneo la chanzo chake na miundo iliyothibitishwa bado haijaandikwa. Tumia PHP hadi ushahidi huo upatikane. Ulinganisho wa Spine, mipangilio ya nyuzi na amri hapa chini zinaelezea tabia iliyorithiwa, si uwekaji unaopatikana au unaoungwa mkono wa Kadupul.

| | Mkusanyaji wa PHP | Spine |
|---|---|---|
| Ulinganifu (Parallelism) | Michakato pekee | Michakato na nyuzi |
| Mpangilio wa nyuzi | Umelazimishwa kuwa 1 bila kujali usanidi | Unazingatiwa |
| Seva ya hati | Moja kwa kila mchakato, haiwezi kusanidiwa | 1 hadi 15 kwa kila mchakato, inaweza kusanidiwa |
| Muda wa kuisha kwa hati | Hautumiki | Unatumika, chaguo-msingi sekunde 25 |
| Usakinishaji | Husafirishwa na msimbo | Uma uliopangwa; hakuna muundo uliothibitishwa wa Kadupul ulioandikwa |

Hesabu ya nyuzi iliyolazimishwa inafaa kuelezwa wazi: ikiwa mkusanyaji amewekwa kuwa wa PHP, kigezo cha nyuzi cha wakati wa uendeshaji kinawekwa kuwa 1; hii haiandiki upya mpangilio wa nyuzi wa mkusanyaji uliohifadhiwa. Kuongeza mkusanyaji wa PHP kunaweza kuhusisha michakato zaidi, na mwongozo katika chanzo ni kukaa au kuwa chini ya mara mbili ya hesabu ya kiini cha CPU.

Usanidi wa Spine na tabia ya amri zinahitaji uthibitisho dhidi ya faili halisi ya binary inayotathminiwa. Chanzo cha programu tumizi ya PHP pekee hakianzishi mpangilio wake wa utafutaji wa usanidi, tabia ya nyuzi au athari zake.

Mifano iliyorithiwa ya tathmini iliyotengwa ya Spine, si amri zilizothibitishwa za Kadupul:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` imekusudiwa kuzuia uandishi wa matokeo. Bado huwasiliana na vifaa na kuendesha hati za ukusanyaji; thibitisha athari zake katika jaribio lililotengwa kwanza.

## Muunganisho wa hifadhidata

Nyuzi si za bure. Kila uzi wa Spine unashikilia muunganisho wake wa hifadhidata, na ndivyo ilivyo kwa kila seva ya hati.

```
estimated worker connections = processes * (threads + script_servers)
```

Huu ni makadirio katika usaidizi wa mipangilio ya programu tumizi, si kikomo cha juu kilichopimwa. Jumlisha katika wakusanyaji wote na uongeze uwezo wa wazazi wa poller, maombi ya wavuti, matengenezo na wateja wengine. Pima miunganisho halisi ya kilele na miunganisho iliyokataliwa kabla ya kuchagua kikomo cha hifadhidata; kuiongeza pia hutumia rasilimali.

Kumalizika kwa muunganisho kunaweza kusababisha sampuli kukosa, lakini mapengo yanayobadilika si utambuzi wa kipekee. Thibitisha kwa vipimo vya muunganisho wa hifadhidata na makosa ya programu tumizi.

## Maandishi yaliyoahirishwa ya RRD

Kuna modi inayozuia poller kuandika kwenye faili za RRD katika kila mzunguko. Matokeo hujilimbikiza kwenye jedwali la hifadhidata badala yake na hutolewa kwa wingi, ama kwa kipima muda au wakati grafu inapoomba faili. Inabadilisha idadi kubwa ya maandishi madogo kwa idadi ndogo ya maandishi makubwa.

Mambo mawili kuihusu ambayo ni muhimu kiutendaji:

- Inahitajika wakati una wakusanyaji wa data wa mbali. Haya si maelekezo, ni sharti ambalo programu inasema.
- Jedwali la bafa ni la kudumu, si la kumbukumbu tu, kwa hivyo sampuli ambazo hazijatolewa hustahimili kuwashwa upya. Pia zinamaanisha faili zako za RRD ziko nyuma ya hifadhidata yako. Tazama [Hifadhi nakala rudufu na urejeshe](/sw/guides/back-up-and-restore/) kabla ya kupiga picha ya chochote.

Foleni kuu ya `poller_output` inayofanya kazi pia ni ya InnoDB katika marekebisho haya. Ukaguzi wa awali wa hifadhi hukataa foleni ya MEMORY; kuongeza kikomo cha jedwali la heap hakutatui kukataliwa huko. Huku wazalishaji wakiwa wamesimamishwa na nakala rudufu inayolingana ikiwa imehifadhiwa, badilisha foleni isiyofaa iliyorithiwa waziwazi, kisha kagua hifadhi kama kila akaunti ya huduma:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Hizi ni shughuli tofauti. Hifadhi safu zinazosubiri na ufuatilie nafasi ya diski ya hifadhidata na umri wa foleni pamoja na hesabu ya safu. Tazama [Boresha kwa usalama](/sw/guides/upgrade-safely/) kwa uteuzi wa foleni, ukaguzi wa uaminifu wa akaunti ya huduma na masharti ya kuwasha upya.

## Wakati wa kuhamia kwa wakusanyaji wa mbali

Mkusanyaji wa data wa mbali ni mashine ya pili inayoendesha msimbo sawa na kitambulisho tofauti cha mkusanyaji, ikikusanya data kutoka kwa seti ndogo ya vifaa na kuandika matokeo kwenye hifadhidata kuu.

Hamia kwa mmoja wakati kikwazo kiko upande wa kukusanya badala ya upande wa kuhifadhi:

- CPU ya mwenyeji wa poller imejaa wakati wa uendeshaji na haifanyi kazi kati ya shughuli.
- Muda wa kwenda na kurudi kwa kikundi cha vifaa unatawala uendeshaji, na kikundi hicho kinakaa nyuma ya kiungo kimoja.
- Tovuti iko mwisho wa WAN ambayo hutaki kupiga kura kupitia kwayo.
- Unahitaji ukusanyaji wa tovuti iliyotengwa, na umethibitisha uwekaji bafa nje ya mtandao na urejeshaji wa mkusanyaji huyo kabla ya kumtegemea.

Wakusanyaji wa mbali hawaondoi vikomo vya uandishi vya hifadhidata kuu au RRD. Pima uwezo wa uingizaji na utoaji kabla ya kuongeza kasi ya ukusanyaji; wazalishaji wa ziada wanaweza kuongeza mrundikano uliopo wa kazi.

Kila mkusanyaji hubeba hesabu zake za michakato na nyuzi, hati zake za uthibitishaji wa hifadhidata, na muda wa usawazishaji, ambao kwa chaguo-msingi ni masaa mawili. Kuna zana ya mstari wa amri ya kulazimisha usawazishaji kamili badala ya kusubiri.

Usakinishaji mkuu unaweza kurudia msimbo wa tovuti na programu-jalizi kwa wakusanyaji wa mbali ili wajisasisha wenyewe. Urudufishaji huo unaweza kuzimwa ikiwa unasambaza msimbo kwa njia nyingine.

## Ni kikomo gani ulichofikia

Tumia jedwali hili kuunda dhana, kisha uzithibitishe kwa kumbukumbu na vipimo. Vikomo kadhaa vinaweza kutokea pamoja. Chaguzi za Spine bado hazijathibitishwa hapa.

| Uchunguzi | Kikomo | Nini cha kubadilisha |
|---|---|---|
| Onyo la kizindua kutokuwa na usawazishaji, poller ikiwa ya haraka | Kuchelewa kwa ratiba, kuzidi muda hapo awali au kukatizwa kwa mwenyeji | Kagua historia ya uzinduzi na hali ya mchakato |
| Muda wa uendeshaji haubadiliki, kifaa kimoja kinachelewa kila wakati | Majibu ya polepole, hati za gharama kubwa au kazi iliyokolea | Pima muda wa njia zake za kuingiza na uhakiki tabia ya muda wa kuisha/kujaribu tena |
| Muda wa uendeshaji huongezeka kulingana na hesabu ya vifaa, CPU imejaa | Shinikizo la CPU ya mkusanyaji | Pima ikiwa michakato zaidi inasaidia; fikiria uwekaji wa mkusanyaji |
| Muda wa uendeshaji huongezeka kulingana na hesabu ya vifaa, CPU haifanyi kazi | Kusubiri mtandao, hati au hifadhidata | Pima vyanzo vya kusubiri kabla ya kubadilisha ulinganifu |
| Sampuli zinazokosekana kwenye seti inayozunguka ya vifaa | Miunganisho, kuisha kwa muda au hitilafu nyingine za ukusanyaji | Angalia hitilafu, vipimo vya muunganisho na foleni zilizohifadhiwa |
| Muda wa uendeshaji ni mzuri, uandishi wa RRD ni wa polepole, diski ina shughuli | Uhifadhi | Maandishi yaliyoahirishwa ya RRD, au diski ya haraka zaidi |
| Kila kitu ni cha polepole ikiwa ni pamoja na kiolesura cha wavuti | Hifadhidata | Ukubwa wa dimbwi la bafa, kisha mwenyeji wa hifadhidata |

Mitego miwili inayofaa kutajwa.

**Kubadilisha kipindi cha msingi si sawa na kubadilisha kila hatua ya chanzo cha data.**
Patana maelezo mafupi, hatua za vipengee vilivyohifadhiwa kwenye kache na ufafanuzi wa mapigo ya moyo/hatua ya RRD. Kujenga upya kache hakubadilishi umbo la faili zilizopo za RRD. Tazama
[Dhibiti uhifadhi wa data](/sw/guides/manage-data-retention/) na
[Muda na vipindi](/sw/concepts/time-and-intervals/).

**Kipindi cha haraka huzidisha kila kitu.** Kutoka sekunde 300 hadi 60 hakufanyi kazi kuwa nafuu mara tano. Vyanzo vilivyosanidiwa kwa mdundo huo wa haraka hukusanywa mara kwa mara; vyanzo vinavyohifadhi hatua ndefu havihitaji kufanya kazi katika kila mzunguko wa msingi. Pima mzigo unaotokana badala ya kudhani kila mzunguko una kazi sawa.
