---
title: Boresha kwa usalama
description: Fanya mazoezi ya uboreshaji, hifadhi nakala zinazolingana, kagua hifadhi na skima, na panga urejeshaji ulioratibiwa.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 8
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Uboreshaji hubadilisha mambo matatu kwa nyakati tofauti na kwa uwezo tofauti wa kurejesha nyuma.

| Mabadiliko | Inaweza kurejeshwa | Jinsi gani |
|---|---|---|
| Msimbo, vitegemezi na usanidi | Kutoka kwa nakala iliyohifadhiwa | Rejesha marekebisho na mipangilio inayolingana |
| Skima ya hifadhidata na sampuli za foleni | Kutoka kwa nakala inayolingana | Rejesha hifadhidata; hakuna uhamiaji wa nyuma wa kiotomatiki |
| Faili za RRD | Kutoka kwa nakala inayolingana | Rejesha historia iliyohifadhiwa; sampuli zisizokuwepo kwenye nakala haziwezi kuundwa upya kwa kurejesha nyuma |

Utaratibu huu upo ili kuweka hizo tatu katika hatua sawa.

## Kabla ya kuanza

**Chukua nakala kamili.** Sehemu zote tatu, thabiti zenyewe kwa zenyewe. Fuata [Kuhifadhi nakala na kurejesha](/sw/guides/back-up-and-restore/). Simamisha waandishi wote kabla ya uchukuaji wa mwisho na uhifadhi nakala iliyolindwa hadi uboreshaji ukubalike.

**Rekodi marekebisho ya sasa na toleo la skima.** Jumuisha vitegemezi, mabadiliko ya ndani, programu-jalizi na usanidi. Marekebisho mengi ya chanzo yanaweza kuripoti toleo sawa la skima. Fanya mazoezi ya marekebisho unayolenga dhidi ya nakala iliyorejeshwa iliyotengwa.

**Kagua kila programu-jalizi.** Kagua tamko lake la uoanifu, msimbo na vitegemezi, kisha jaribu vitendaji unavyohitaji dhidi ya marekebisho unayolenga. Tamko la toleo la chini pekee halithibitishi uoanifu. Tazama [Uthibitishaji wa programu-jalizi](/sw/guides/install-and-vet-plugins/).

**Kagua mazingira ya uendeshaji.** Toleo la PHP, viendelezi vya PHP, na toleo la seva ya hifadhidata. Kagua [mahitaji](/sw/reference/requirements/) ya toleo unalolenga kabla ya kuliweka. Usidhani kuwa CLI ya skima inafanya kila ukaguzi wa kisakinishaji cha wavuti.

**Kagua kwamba akaunti ya hifadhidata inaweza kubadilisha skima.** Wakati wa uendeshaji akaunti inahitaji kusoma na kuandika ndani ya hifadhidata yake yenyewe. Wakati wa uboreshaji inahitaji pia kuunda, kubadilisha na kufuta majedwali na faharasa. Usakinishaji ulioweka vizuizi vikali vya ruhusa baada ya usanidi hugundua hili hapa.

**Simamisha kila mzalishaji.** Simamisha ukusanyaji ulioratibiwa, wakusanyaji wa mbali, ukusanyaji unaoanzishwa na wavuti na matengenezo ya mikono; subiri kazi zinazoendelea zimalizike. Mwaga maandishi yaliyocheleweshwa tu baada ya wazalishaji kusimama, na uhifadhi safu zozote za foleni ambazo hazijathibitishwa na nakala inayolingana. Weka wazalishaji wakiwa wamesimamishwa katika kipindi chote cha uwekaji na uthibitishaji wa skima.

## Badilisha programu

Nakala ya kuweka juu ina mipaka maalum:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Bila hiyo, `cp -a /path/to/new-release /path/to/kadupul` inaunda `kadupul/new-release/` na kuacha kila faili ya programu ya zamani pale ilipokuwa hasa. Uboreshaji unaonekana kufanya kazi, kiolesura bado kinaendesha msimbo wa zamani, na ishara ya kwanza ya tatizo ni uhamiaji wa skima kukataa kulingana na toleo ulilofikiri ulibadilisha.

Kunakili juu huhifadhi faili ambazo hazipo kwenye mti mpya, ikiwa ni pamoja na faili za programu zilizopitwa na wakati. Inaweza kuandika juu ya njia yoyote inayolingana, kwa hivyo kagua kifurushi badala ya kudhani kuwa usanidi au data haikujumuishwa. Pendelea mti uliokaguliwa wenye vitegemezi, usanidi na programu-jalizi zinazolingana. Ikiwa unabadilisha matoleo kupitia symlink, thibitisha njia halisi ya RRA na ufikiaji wa hifadhi kabla ya kubadili; kianzishi cha sasa kinakipata kutoka saraka ya programu ukiongeza `/rra`. Mabadiliko ya symlink pekee si urejeshaji wa nyuma wa hifadhidata.

**Kagua kile unachoendesha hasa kabla ya kuendelea.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Ikiwa hiyo hairipoti toleo uliloweka hivi punde, simama. Kila kitu baada ya hatua hii kinachukulia kuwa msimbo uliokusudiwa umewekwa. Pia linganisha marekebisho ya chanzo au checksum ya kifurushi na rekodi ya toleo; mfuatano wa toleo pekee hautoshi.

## Uhamiaji wa skima

Hifadhidata hubeba toleo lake yenyewe, tofauti na toleo lililo katika msimbo. Kubadilisha msimbo hakulibadilishi hilo.

Kurasa zilizothibitishwa za mfumo wa awali huelekeza kwenye kisakinishaji wakati msimbo na matoleo ya hifadhidata yanatofautiana. Huu si ulinzi wa jumla kwa kila mwisho wa huduma au CLI, na mfuatano wa matoleo yanayolingana hauthibitishi kuwa kila uhamiaji ulikamilika. Kagua hali ya skima moja kwa moja.

Kisakinishaji na CLI huendesha hatua za uhamiaji zilizopangwa kwa utaratibu. Kabla ya uboreshaji wa kawaida wa skima, kagua foleni thabiti na ufikiaji wa hifadhi ya akaunti ya huduma. Ikiwa foleni ya `poller_output` iliyorithiwa si InnoDB, ibadilishe waziwazi huku waandishi wakiwa wamesimamishwa na nakala ikihifadhiwa:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Kisha endesha hii chini ya kila akaunti halisi ya wavuti na poller:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Bendera hizo mbili ni shughuli tofauti na haziwezi kuunganishwa. Ubadilishaji wa foleni huhifadhi sampuli zinazosubiri; usikate safu ili kupitisha ukaguzi. Tatua umiliki na usanidi wa UID/GID unaoaminika wa nambari kwa kutumia [mahitaji ya hifadhi](/sw/reference/requirements/). Wakusanyaji wa mbali waliounganishwa kwa kawaida huchagua foleni kuu; tumia `--local` tu kwa ukaguzi au ubadilishaji wa foleni ya ndani uliokusudiwa. Mara tu ukaguzi huo utakapopita, endesha uboreshaji wa skima kutoka mzizi wa programu:

```sh
php cli/upgrade_database.php
```

Iendeshe kama akaunti ya huduma iliyosanidiwa yenye ufikiaji unaohitajika wa mfumo wa faili na haki za hifadhidata. Ukaguzi uliofanikiwa wa root hauthibitishi ufikiaji wa akaunti ya huduma. Kuna chaguo la `--forcever` la kuweka toleo la kuanzia waziwazi, ambalo lipo kwa ajili ya kuendesha upya uhamiaji wakati wa majaribio ya kabla ya toleo. Si sehemu ya uboreshaji wa kawaida na kuitumia kuruka hatua iliyofeli kutaacha skima ikiwa imehamishwa nusu.

Nasa hali ya kutoka na matokeo, kisha thibitisha toleo la hifadhidata na mabadiliko ya skima yanayohitajika. CLI ya sasa inaweza kukataa toleo la kuanzia la awali lisilojulikana au lisiloungwa mkono na bado ikatoka na 0; hali ya shell iliyofanikiwa pekee haitoshi. Ikiwa uhamiaji utafeli katikati, weka wazalishaji wakiwa wamesimamishwa na urejeshe seti ya nakala inayolingana badala ya kujaribu kuruka hatua iliyofeli.

## Kile kinachoharibu programu-jalizi

Ukaguzi wa programu-jalizi wa kisakinishaji cha wavuti unaweza kuzima programu-jalizi zisizoendana au zilizokosekana. Usidhani kuwa CLI ya skima inafanya ukaguzi sawa wa mzunguko wa maisha wa programu-jalizi.

**Kiwango cha chini cha toleo kilichotangazwa kiko juu ya toleo jipya la msingi.** Imezimwa. Hii ndiyo hali ya kawaida na ndiyo ambayo ukaguzi wako wa kabla ya uboreshaji ulipaswa kuigundua.

**Saraka ya programu-jalizi, faili yake ya usanidi, au faili yake ya tamko haipo.** Imezimwa. Programu-jalizi ambayo faili zake ziliondolewa ikiwa bado imewekwa alama kuwa imewashwa kwenye hifadhidata huangukia hapa.

**Programu-jalizi haina faili ya tamko kabisa.** Inaweza kufeli ukaguzi wa uoanifu wa kisakinishaji. Jaribu kifurushi cha programu-jalizi inayooana na inayodumishwa badala ya kudhani inaweza kuwashwa tena bila kubadilishwa.

Kuna kisa cha nne ambacho si uharibifu. Utendaji ambao hapo awali ulikuwa programu-jalizi na tangu wakati huo umehamia kwenye mfumo mkuu huondolewa kabisa, hauzimwi: viunganishi vyake na maingizo ya ruhusa huondolewa na safu yake kufutwa. Ukiona programu-jalizi ikitoweka badala ya kubadilika kuwa ya kijivu, kagua kumbukumbu za uhamiaji na mpangilio wa programu-jalizi hiyo maalum kabla ya kuhitimisha kuwa vipengele sawa vinapatikana.

Kuzima programu-jalizi ni tofauti na kuiondoa. Viunganishi vya programu-jalizi na uhamiaji vinaweza kubadilisha majedwali na ruhusa zao wenyewe; hifadhi msimbo na data ya programu-jalizi inayolingana na uthibitishe njia maalum ya uboreshaji. Usiahidi uhifadhi wa data kwa wote.

## Kupanga urejeshaji nyuma

Amua urejeshaji nyuma kabla ya kuanza, kwa sababu uamuzi ni tofauti kulingana na umbali ulioufikia.

| Hatua ya kushindwa | Rejesha nyuma kwa |
|---|---|
| Msimbo umebadilishwa, hakuna operesheni ya kubadilisha hali au mwandishi aliyefanya kazi | Rejesha msimbo wa awali, vitegemezi na usanidi baada ya kuthibitisha hali haijabadilika |
| Ubadilishaji wa foleni au uhamiaji umeanza, ikiwa ni pamoja na kutofaulu kwa sehemu | Simamisha waandishi na urejeshe msimbo unaolingana, usanidi, hifadhidata na nakala za RRD |
| Uhamiaji umekamilika, programu haifanyi kazi vizuri | Simamisha waandishi na urejeshe seti ya nakala inayolingana; zingatia sampuli zilizokusanywa baada ya nakala |
| Programu-jalizi pekee ndiyo iliyovunjika | Iweke imezimwa wakati unatathmini ukarabati dhidi ya urejeshaji ulioratibiwa kulingana na vigezo vya kukubalika |

Kanuni iliyo chini ya jedwali: msimbo na skima hurejeshwa nyuma pamoja au la kabisa. Msimbo wa zamani dhidi ya skima mpya si hali inayoungwa mkono. Usitegemee ukaguzi wa toleo la wavuti kuzuia kila shughuli isiyoendana.

Jipe muda maalum. Amua mapema muda ambao utatumia kutatua matatizo kabla ya kurejesha, na ushikamane nayo. Nakala inakuwa na manufaa kidogo kadiri mfumo unavyoendelea kufanya kazi ukiwa umeboreshwa nusu.

## Kwa nini faili za RRD ni sehemu ambayo hupaswi kuipoteza

Usidhani kuwa uwekaji, matengenezo au kurejesha ukusanyaji kunaacha RRD bila kubadilika. Zihifadhi pamoja na hifadhidata na urejeshe seti inayolingana wakati unarudisha nyuma mabadiliko ya hali. Sampuli za foleni zilizohifadhiwa zinaweza kuwa bado hazipo kwenye faili hizo. Nakala ya RRD iliyothibitishwa inaweza kurejesha historia yake iliyochukuliwa; sampuli iliyokosekana haiwezi kuundwa upya kwa kurejesha skima au msimbo tu. Tazama [Vyanzo vya data na kumbukumbu za round-robin](/sw/concepts/data-sources-and-rras/) kwa nini ubora wa azimio ndani yake hauwezi kuundwa upya pia.

Njia tatu maalum ambazo watu huzipoteza wakati wa uboreshaji:

**Kuweka kwa kubadilisha saraka ya usakinishaji.** Saraka ya RRA kwa chaguomsingi ni saraka ndogo ya usakinishaji. Kuondoa saraka ya zamani na kufungua mpya mahali pake kunaweza kufuta vipimo vilivyohifadhiwa. Hifadhi mti wa RRA kupitia mpangilio wa uhifadhi uliojaribiwa kabla ya kubadilisha programu. Thibitisha `$config['rra_path']` halisi, njia zilizowekwa ndani na ukaguzi wa uaminifu wa akaunti ya huduma; marekebisho haya hayatoi mpangilio wa jumla wa hifadhidata kwa mzizi wa ndani wa RRA wa kiholela.

**Kuweka kutoka kwa checkout au kifurushi kinachomiliki mti mzima.** Kutofaulu sawa, kwa njia ya kiotomatiki. Thibitisha kile njia yako ya uwekaji inachukulia kama kinachoweza kufutika.

**Kurekebisha ruhusa kwa mabadiliko ya umiliki yanayojirudia.** Haina madhara kwa data lakini inaweza kuacha poller ikiwa haiwezi kuandika, ambayo hujionyesha kama mfumo unaochora historia kikamilifu na kutokusanya chochote kipya.

## Baada ya uboreshaji

1. Kagua matokeo ya uboreshaji, toleo la hifadhidata na mabadiliko ya skima yanayohitajika, kisha uthibitishe kuwa kiolesura kinapakia. Kutokuwepo kwa uelekezaji upya pekee hakutoshi.
2. Maliza uboreshaji wa msimbo/usanidi wa kikusanyaji cha mbali uliopangwa na uthibitishe malengo yao ya hifadhidata wakati wazalishaji wao wakiwa bado wamesimamishwa.
3. Rudia ukaguzi wa hifadhi ya akaunti ya huduma, rejesha wakusanyaji walioteuliwa, na uthibitishe nyakati za mwisho za sasisho za RRD za uwakilishi na thamani zilizohifadhiwa zinazoweza kutumika.
4. Kagua kumbukumbu kwa mstari wa takwimu za mzunguko na ulinganishe muda uliopita na jinsi ulivyokuwa hapo awali. Toleo jipya linaweza kubadilisha gharama ya ukusanyaji.
5. Wezesha tena programu-jalizi zilizozimwa, moja baada ya nyingine, baada ya kusakinisha matoleo yanayotangaza uoanifu na msingi mpya.
6. Kagua kina cha foleni iliyohifadhiwa, ukusanyaji wa mbali na kazi za programu-jalizi katika dirisha la kukubalika lililokubaliwa. Weka nakala ya kurudisha nyuma hadi ukaguzi huo utakapopita.
