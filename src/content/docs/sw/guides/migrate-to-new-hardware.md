---
title: Hamia kwenye maunzi mapya
description: Kuhamisha usakinishaji unaoendesha hadi kwenye seva nyingine bila kupoteza historia, kwa mpangilio unaoweka kila hatua kuwa thabiti na inayoweza kuthibitishwa.
banner:
  content: Kadupul iko katika hatua ya pre-alpha. Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Huu ni mswada wa tafsiri; uhakiki wa mtaalamu wa lugha unasubiriwa.
sidebar:
  order: 20
---

:::caution[Tabia ya wakala wa RRDtool iliyorithiwa]
Uwekaji wa wakala wa RRDtool hautumiwi katika Kadupul. Tumia uhifadhi wa ndani wa RRDtool
(`storage_location = 0`). Mipangilio ya wakala, maelezo ya itifaki na mtiririko wa kazi
kwenye ukurasa huu huandika tabia iliyorithiwa, si uwekaji unaoungwa mkono au njia ya
uhamiaji. Tazama [Wakala wa RRDtool](/sw/reference/rrdproxy/).
:::

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo la Kadupul linaloungwa mkono au njia ya uhamiaji kwa sasa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Uhamiaji ni urejeshaji kwenye mashine tofauti na ile ambayo nakala rudufu ilitoka.
Kila kitu katika [Hifadhi nakala rudufu na urejeshe](/sw/guides/back-up-and-restore/) kinatumika hapa;
ukurasa huu unashughulikia tu kile kilicho tofauti kwa sababu lengwa si chanzo.

Mambo matatu ni tofauti, na kila moja lina namna yake ya kushindwa.

| Tofauti | Kinachoharibika |
|---|---|
| Njia tofauti | Njia za faili zilizohifadhiwa kwenye hifadhidata na kache ya poller |
| Vitambulisho tofauti vya mtumiaji na kikundi | Ufikiaji wa faili na ukaguzi wa uaminifu wa uhifadhi unaweza kushindwa |
| Matoleo tofauti ya mazingira ya uendeshaji | Viendelezi, tabia ya hifadhidata na utangamano wa RRD vinaweza kutofautiana |

## Kabla ya kugusa chochote

Jenga lengwa kwanza na uifikishe mahali ambapo usakinishaji mpya ungefanya kazi:
seva ya hifadhidata inafanya kazi, viendelezi vya PHP vinavyohitajika vipo, RRDtool ipo, mkusanyaji aliyechaguliwa anapatikana, na seva ya wavuti imesanidiwa. Weka poller yake, kazi zilizoratibiwa, urudufishaji wa mbali na arifa zinazotoka nje zikiwa zimezimwa. Usiendeshe kisakinishi. Unakaribia kubadilisha hifadhidata, na kugundua mchoro uliosakinishwa nusu ni ngumu zaidi kuliko mchoro tupu.

Linganisha marekebisho ya programu na utegemezi sawasawa, ikiwa ni pamoja na marekebisho ya ndani na programu-jalizi.
Jedwali la `version` la hifadhidata hurekodi toleo la mchoro, si kila mabadiliko ya chanzo;
kulinganisha thamani hiyo pekee hakutoshi. Uelekezaji upya wa kisakinishi unaweza kuashiria kutolingana kwa mchoro au urejeshaji usio kamili. Sakinisha msimbo ule ule unaouacha, hamisha, thibitisha unafanya kazi, kisha uboresha kama zoezi tofauti kwa kutumia [Boresha kwa usalama](/sw/guides/upgrade-safely/).

Amua njia ya kusakinisha sasa. Kuiweka sawa kwenye mashine zote mbili huondoa kazi nyingi zilizo hapa chini. Ikiwa huwezi, soma sehemu ya njia kabla ya kuanza.

## Mpangilio wa shughuli

Kila hatua hukagua inayotangulia, kwa hivyo usizipange upya.

1. **Simamisha wazalishaji wote kwenye chanzo na lengwa.** Simamisha ukusanyaji ulioratibiwa, wa mbali, unaosababishwa na wavuti, na wa mikono na matengenezo; ruhusu shughuli zinazoendelea zikamilike. Futa maandishi yaliyoahirishwa baada tu ya wazalishaji kusimama. Hifadhi safu zozote za foleni ambazo hazijathibitishwa na nakala rudufu zinazolingana za hifadhidata na RRD; usizikate (truncate).
2. **Chukua nakala rudufu.** Hifadhidata, mti wa RRD, usanidi, vilivyokamatwa pamoja. Sheria za uthabiti katika [Hifadhi nakala rudufu na urejeshe](/sw/guides/back-up-and-restore/) ndizo hoja kuu.
3. **Sogeza mti wa RRD.** Tazama hapa chini jinsi ya kufanya hivyo.
4. **Sogeza hifadhidata.**
5. **Sogeza msimbo, usanidi na chochote ambacho usanidi unaelekeza.** Hii inajumuisha `plugins/`, `scripts/`, `resource/`, na faili yoyote ya ndani ambayo njia ya uingizaji data huita.
6. **Tekeleza tena usanidi lengwa baada ya urejeshaji wa mwisho.** Njia sahihi, vituo vya mwisho vya hifadhidata, umiliki wa huduma na mipangilio ya nambari ya uaminifu wa uhifadhi.
7. **Jenga upya kache ya poller.**
8. **Endesha ukaguzi wa uhifadhi kama kila akaunti ya huduma, kisha anza ukusanyaji kwenye lengwa pekee.** Fuatilia faili za mwakilishi na kina cha foleni iliyohifadhiwa.

## Kuhamisha mti wa RRD

Faili ya RRD ni faili ya binary ambayo muundo wake wa ndani unategemea jinsi ilivyoandikwa.
Nakala ya binary inahitaji usanifu unaoendana na muundo wa RRDtool; kulinganisha majina ya mfumo wa uendeshaji au saizi ya neno pekee si ushahidi wa hilo. Kutotangamana kunaweza kusababisha makosa ya kusoma. Thibitisha faili zilizonakiliwa kwa kutumia RRDtool ya lengwa.

Ikiwa huna uhakika kwamba zote mbili zinakubaliana, badilisha badala ya kunakili. Utupaji na urejeshaji wa RRDtool hutoa fomu ya maandishi inayoweza kubebeka; Kadupul hutumia jozi sawa ndani wakati inahitaji kuandika upya kumbukumbu.

Kwenye chanzo, huku waandishi wakiwa wamesimamishwa, tumia saraka mpya ya kibinafsi ya maandalizi:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Hamisha XML kamili kwa usalama. Rejesha kwenye lengwa kwa mtahiniwa mpya:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Rudia kwa kila faili inayohitaji ubadilishaji na uangalie hali ya kutoka ya kila amri. Usisakinishe utupaji usio kamili au watahiniwa ambao hawajathibitishwa. RRDtool huandika XML kama [muundo wa kuhamisha usanifu](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Thibitisha kabla ya kuchukua njia ya polepole. Nakili faili moja, endesha `rrdtool info` juu yake kwenye lengwa, na ulinganishe hatua, kumbukumbu, muda wa sasisho la mwisho na majina ya chanzo cha data. Linganisha pia matokeo ya `fetch` katika kipindi kinachojulikana kilichojaa. Rudia kwa mipangilio ya kumbukumbu ya mwakilishi kabla ya kusogeza mti, kisha uthibitishe orodha nzima ya faili. Tazama [Rejesha RRD iliyoharibika](/sw/guides/recover-a-corrupted-rrd/) kwa uthibitishaji wa mtahiniwa na mahitaji ya umiliki.

Bila kujali jinsi unavyozihamisha, hifadhi muundo wa saraka sawasawa. Saraka ndogo zilizowekwa chini ya saraka ya RRA si mapambo; njia ya kila faili inarekodiwa kwa kila chanzo cha data, na kuweka mti bapa huvunja kila moja yao.

## Hifadhidata

Utupaji mmoja na upakiaji mmoja. Mambo mawili ya kuangalia katika kuhamisha.

Kagua seti ya vibambo vya jedwali lililorejeshwa, mpangilio na injini ya uhifadhi, si chaguo-msingi za seva pekee. Hifadhi ufafanuzi wa chanzo na uthibitishe utangamano na toleo la hifadhidata lengwa kabla ya kubadilisha.

**Foleni za mkusanyaji si kache zinazoweza kutupwa.** Foleni ya sasa ya `poller_output` lazima itumie InnoDB. Ukaguzi wa awali wa hifadhi hukataa foleni ya MEMORY. Hifadhi safu zake na foleni za kuongeza kasi (boost) na za wakati halisi hadi sampuli zithibitishwe; nakala rudufu ya RRD inaweza kuwa bado haijajumuisha vipimo hivyo. Usidhani jedwali lililorejeshwa la MEMORY ni tupu: utupaji wa kimantiki unaweza kuwa na viingizo vinavyolijaza tena.

Huku waandishi wakiwa wamesimamishwa na nakala rudufu zikiwa salama, foleni isiyo ya InnoDB iliyorithiwa inaweza kubadilishwa waziwazi:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Endesha ukaguzi wa uhifadhi chini ya kila akaunti halisi ya wavuti na poller. Hii hukagua ufikiaji wa hifadhi ya ndani na foleni iliyochaguliwa; mafanikio kama mzizi (root) hayathibitishi ufikiaji wa huduma. Wakusanyaji wa mbali wa mtandaoni kwa kawaida hulenga foleni kuu; tumia `--local` tu wakati wa kuangalia foleni yako ya ndani kimakusudi. Majedwali mengine ya wakati wa utekelezaji/kache yanahitaji mpango wazi wa kuhifadhi au kujenga upya. Tazama [Mahitaji ya uhifadhi](/sw/reference/requirements/).

## Njia katika uhamiaji

Hapa ndipo uhamiaji unapoharibika, kwa sababu mengi ya haya yanabaki hayaonekani hadi uendeshaji wa kwanza wa ukusanyaji.

**Njia za RRA.** Njia za kawaida za chanzo cha data hutumia ishara ya `<path_rra>`. Katika marekebisho haya, uanzishaji hupata `$config['rra_path']` kutoka kwa saraka ya programu pamoja na `/rra`; hii si mpangilio wa jumla wa hifadhidata wa kuchagua saraka yoyote ya ndani. Thibitisha njia halisi kabla ya kuhamisha faili. Njia maalum kamili lazima zikaguliwe na kusahihishwa moja moja. Hifadhi mpangilio wa saraka zilizowekwa ndani.

**Kache ya poller inashikilia njia kamili.** Wakati kache inapojengwa, ishara hupanuliwa na njia kamili huandikwa kwenye safu ya kache. Badilisha saraka ya RRA na kache bado inaelekeza kwenye ile ya zamani. Poller huendelea kufanya kazi na haiandiki chochote unachoweza kupata. Ijenge upya.

```sh
php cli/rebuild_poller_cache.php
```

**Mipangilio iliyo na njia.** Kila moja ya hizi imehifadhiwa kwenye hifadhidata, kwa hivyo kila moja hutoka kwenye mashine ya zamani ikielekeza kwenye mpangilio wa mashine ya zamani. Ziangalie zote kabla ya uendeshaji wa kwanza: binary ya RRDtool, binary ya mkusanyaji na faili yake ya usanidi, binary ya PHP, zana za SNMP, njia za kumbukumbu, fonti chaguo-msingi, na saraka ya nakala rudufu ya kuondoa miiba. Pia kagua njia na maadili ya mazingira katika faili za usanidi, vitengo vya huduma, kazi zilizoratibiwa, na seva ya wavuti.

**Njia za uingizaji data zina mistari ya amri.** Zinatumia ishara kwa mzizi wa kusakinisha, kwa hivyo hatua inayohifadhi mpangilio haihitaji chochote. Hatua inayoubadilisha inahitaji kuangalia kila moja. Vile vile hutumika kwa faili za XML za rasilimali nyuma ya maswali ya data.

**Wakusanyaji wa mbali wana faili yao ya usanidi**, yenye vitambulisho vyao vya hifadhidata na kitambulisho chao cha mkusanyaji. Hazimo katika utupaji mkuu. Ikiwa hifadhidata kuu ilihamishwa, sasisha vituo vya mwisho vinavyohusika na uthibitishe muunganisho wa kila mkusanyaji. Urudufishaji kamili ni operesheni tofauti, inayoendeshwa kwenye mkusanyaji mkuu tu wakati wakusanyaji wa mbali waliowezeshwa wamewekwa:

```sh
php cli/poller_replicate.php
```

Amri hii hutoka na kosa bila mkusanyaji wa mbali aliyewezeshwa. Usiiongeze kama ukaguzi wa mafanikio unaohitajika katika uhamiaji wa mkusanyaji mmoja. Thibitisha usanidi wa mbali na urudufishaji kabla ya kuruhusu ukusanyaji wa mbali kuanza tena.

## Umiliki na ruhusa

Poller huandika faili za RRD kama akaunti inayoifanya kazi. Kiolesura cha wavuti huzisoma kama akaunti ya seva ya wavuti. Nakala iliyohifadhi vitambulisho vya nambari kwenye mashine zilizo na maingizo tofauti ya `/etc/passwd` inakupa faili zinazomilikiwa na akaunti isiyo sahihi.

Grafu zinazosimama wakati wa uhamiaji zinaweza kuonyesha ruhusa, njia za zamani, kumbukumbu zilizokosekana, mihuri ya muda, au sampuli zilizokataliwa. Kagua kumbukumbu za poller na foleni zilizohifadhiwa kabla ya kuchagua ukarabati; grafu pekee haitambui sababu.

Angalia umiliki wa saraka ya RRA yenyewe na saraka ndogo zilizowekwa ndani, si faili ya sampuli pekee. Faili mpya huundwa katika saraka hizo wakati wa ukusanyaji, kwa hivyo saraka ambayo poller haiwezi kuandika inashindwa kwa vyanzo vya data ambavyo havikuwepo wakati wa uhamiaji, hata kama faili zilizopo ziko sawa. Ramani upya `rrd_maintenance_trusted_uids` na `rrd_maintenance_trusted_gids` katika `include/config.php` hadi vitambulisho halisi vya nambari vya lengwa na uangalie wazazi wa saraka wanaoaminika. Tazama [Mahitaji ya uhifadhi](/sw/reference/requirements/).

## Kubadilisha na hasara ndogo (Cutover)

RRD hukataa sasisho kwenye au kabla ya muhuri wake wa mwisho wa sasisho. Hii inazuia kucheza tena; haithibitishi kuwa sampuli lazima zipotee katika kila uhamiaji. Ukubwa wa pengo unategemea muda wa sampuli, muda wa kutofanya kazi, na ni vipimo gani vya foleni vilivyohifadhiwa. Utaratibu huu unatumia mmiliki mmoja wa ukusanyaji na hauunganishi historia ya majaribio iliyokusanywa kwa kujitegemea kwenye seti ya mwisho ya ukusanyaji.

1. Fanya mazoezi kamili mapema na nakala rudufu ya siku moja kabla. Nakili kila kitu, sahihisha kila njia, na ujaribu masasisho dhidi ya vifaa vya majaribio vilivyotengwa huku arifa zikiwa zimezimwa. Rekodi mabadiliko lengwa kama utaratibu unaoweza kurudiwa. Simamisha waandishi wa mazoezi wakati jaribio linapokamilika.
2. Weka mazoezi kando. Badilisha hifadhidata yake na RRD na nakala rudufu ya mwisho inayolingana; usichanganye safu za mazoezi au sampuli za foleni kwenye urejeshaji huo.
3. Kwa kubadilisha, simamisha wazalishaji wa chanzo na ufute au uhifadhi sampuli zinazosubiri, kisha kamata na uhamishe nakala rudufu ya mwisho. Tekeleza tena ubatilishaji lengwa: kurejesha hifadhidata hurejesha njia za chanzo kwenye `settings`, na kurejesha faili za usanidi kunaweza pia kubadilisha vituo vya mwisho vya mazoezi na mipangilio ya uaminifu.
4. Jenga upya kache ya poller, endesha ukaguzi wa uhifadhi, thibitisha orodha ya faili, na uwezeshe ukusanyaji lengwa baada tu ya ukaguzi huo kupita.

Pima muda wa mazoezi na uruhusu muda wa uthibitishaji na kurudi nyuma. Weka chanzo kikiwa kimesimamishwa hadi ubadilishaji utakapofanikiwa au kurudi nyuma kunakodhibitiwa kumchague tena kama mmiliki wa ukusanyaji.

## Thibitisha kwa mpangilio huu

1. Kiolesura cha wavuti kinapakia bila uelekezaji upya wa kisakinishi. Ikiwa kinaelekeza upya angalia kutolingana kwa msimbo/mchoro, muunganisho wa hifadhidata, au urejeshaji usio kamili.
2. Kifaa cha majaribio kinajibu jaribio jipya la ukusanyaji; hali ya "Up" iliyorejeshwa pekee inaweza kuwa ya zamani.
3. Muda wa sasisho la mwisho wa faili ya RRD unasonga mbele baada ya uendeshaji wa kwanza wa ukusanyaji. Kagua faili kwenye diski, si grafu.
4. Grafu iliyochorwa katika saa iliyopita inaonyesha mstari, si pengo.

Ikiwa hatua ya 3 itashindwa, kagua njia, ruhusa, ukaguzi wa awali wa hifadhi, kina cha foleni, na makosa ya RRDtool. Ikiwa hatua ya 4 itashindwa, kagua thamani zilizohifadhiwa, ufafanuzi wa grafu, muda uliochaguliwa, na ufikiaji wa akaunti ya wavuti. Faili moja iliyofanikiwa haithibitishi kila kifaa, njia ya kuingiza data, au mkusanyaji wa mbali.

## Mitego

**Usiendeshe usakinishaji wote dhidi ya mti sawa wa RRD.** Wafanya poller wawili wanaoandika kwenye faili moja hutoa sasisho zilizokataliwa na mapengo, si data iliyounganishwa.

**Usirejeshe mti wa zamani wa RRD juu ya hifadhidata mpya.** Faili hazitajazwa tena nyuma. Ukusanyaji unaanza tena kutoka wakati wa sasa na pengo kati ya zote mbili ni shimo la kudumu.

**Nakala rudufu zina vitambulisho vya kifaa katika maandishi wazi.** Kuhamisha maunzi kunamaanisha kuwa vitambulisho hivyo vinasafiri kwenye mtandao na kukaa kwenye mashine mbili. Zuia ufikiaji wa nakala rudufu na usimbaji fiche uhamishaji. Dumisha nakala ya kurudi nyuma iliyohifadhiwa hadi sera ya kukubalika na uhifadhi iruhusu kuondolewa; usiifute wakati wa kubadilisha.

**Jedwali za programu-jalizi ziko kwenye hifadhidata; msimbo wa programu-jalizi haupo.** Kurejesha hifadhidata bila msimbo unaolingana wa programu-jalizi na utegemezi kunaweza kuvunja kurasa za programu-jalizi, kulabu au kazi. Kagua kila programu-jalizi inayohitajika waziwazi.

**Uhifadhi wa wakala uliopo uko nje ya utaratibu huu wa uhamiaji.** Uwekaji wa wakala hautumiwi. Tafuta faili halisi za RRD na uzihifadhi nakala rudufu, kisha uthibitishe uhamiaji tofauti kwa uhifadhi wa ndani kwenye nakala iliyotengwa. Saraka ya ndani ya `rra/` inaweza kuwa na takataka zilizobaki pekee.

**Ondoa mashine ya zamani mwishoni, na si siku hiyo hiyo.** Iache ikiwa imezimwa au uzime wazalishaji wote, na uhifadhi nakala rudufu yake inayolingana hadi mfumo mpya upitishe ukaguzi unaohitajika wa ukusanyaji, upigaji picha, wa mbali na programu-jalizi. Amua kipindi cha uchunguzi kutoka kwa mzigo wa kazi na sera ya kurudi nyuma; mzunguko mfupi zaidi wa ukusanyaji si ushahidi kwamba kila mfumo mdogo unafanya kazi.
