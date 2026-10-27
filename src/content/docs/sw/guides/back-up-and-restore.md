---
title: Kuhifadhi nakala na kurejesha
description: Vipengele vitatu lazima vichukuliwe pamoja la sivyo nakala haijakamilika, na mpangilio wa kurejesha ni muhimu.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 7
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Seti kamili ya urejeshaji ya Kadupul ina sehemu tatu. Nakala za sehemu zinaweza kurejesha usanidi au vipimo, lakini haziwezi kuzaa tena usakinishaji mzima.

| Sehemu | Inachoshikilia | Mahali inapoishi |
|---|---|---|
| Hifadhidata | Vifaa, violezo, watumiaji, ruhusa, kache ya poller, na njia ya kila faili ya RRD | MySQL au MariaDB |
| Faili za RRD | Vipimo vilivyohifadhiwa na kumbukumbu zilizounganishwa | Saraka ya RRA, kwa chaguomsingi `rra/` chini ya usakinishaji |
| Usanidi | Vitambulisho vya hifadhidata, njia, usanidi wa kikusanyaji, msimbo wa programu-jalizi na hati | `include/config.php`, faili ya usanidi ya spine, `plugins/`, `scripts/`, `resource/` |

## Kile ambacho nakala ya hifadhidata pekee inaweza kurejesha

Hifadhidata inashikilia ufafanuzi wa grafu na usanidi wa ufuatiliaji, wakati faili za RRD zinashikilia kumbukumbu za kihistoria za grafu. Boost inapowashwa, usomaji wa hivi karibuni unaweza pia kukaa kwenye foleni za hifadhidata hadi utakapomwagwa kwenye faili. Hifadhi foleni hizo kama sehemu ya nakala ya hifadhidata. Tazama [Muundo wa mfumo](/sw/concepts/architecture/).

Rejesha hifadhidata pekee na utapata mfumo unaojua kuhusu vifaa mia nne, una kila grafu iliyofafanuliwa, na huchora kila moja ikiwa tupu. Utaanza kukusanya tena kuanzia wakati unapowasha poller, na historia yote itakuwa imepotea.

## Kile ambacho nakala ya RRD pekee inakosa

Faili ya RRD ina vyanzo vya data vilivyotajwa, ufafanuzi wa kumbukumbu na thamani, lakini haina data ya ziada ya vifaa, hoja, grafu na ruhusa za Kadupul inayohitajika kuunganisha thamani hizo na programu.

Ulinganishaji kutoka "baiti zilizoingia kwenye mlango 3 wa swichi 12" hadi njia kwenye diski huishi kwenye hifadhidata, kwenye safu wima ya chanzo cha data. Rejesha mti wa faili pekee na utakuwa na maelfu ya faili zilizojaa nambari, bila njia ya kubaini ni ipi inayolingana na nini isipokuwa kwa kuikarabati kwa mkono.

Hizi mbili ni nakala moja. Zichukulie hivyo.

## Uthabiti kati yake

Hapa ndipo taratibu nyingi za uhifadhi wa nakala zinapokosea kimyakimya.

Poller huandika kwenye faili za RRD mfululizo. Faili iliyonakiliwa wakati sasisho linaendelea inaweza kunaswa katikati ya uandishi. Hifadhidata inaandikwa kwa wakati mmoja. Ukimwaga hifadhidata saa 02:00 na kuanza kunakili faili saa 02:20, nusu hizo mbili zinaelezea nyakati tofauti, na kila chanzo cha data kilichoundwa au kufutwa katikati hakitalingana.

Uandishi uliocheleweshwa wa RRD hufanya jambo hili kuwa gumu na la kuvutia zaidi. Katika hali hiyo poller haiandiki faili za RRD katika kila mzunguko. Matokeo hukusanyika kwenye jedwali thabiti la hifadhidata na kumwagwa kwa wingi baadaye. Kwa hivyo hifadhidata inaweza kuwa mbele ya faili za RRD kwa hadi kipindi cha kumwaga, ikishikilia vipimo halisi ambavyo haviko kwenye diski mahali pengine popote.

Chagua mojawapo ya haya. Kwa mpangilio wa upendeleo unaoshuka:

**Picha ya papo hapo iliyoratibiwa.** Tumia utaratibu wa kuhifadhi nakala au kutuliza unaoungwa mkono na injini ya hifadhidata na uiratibu na picha za hifadhi yote ya RRD na usanidi wa programu. Picha ya mfumo wa faili pekee haihakikishi uthabiti katika viwango tofauti vya hifadhi, wakusanyaji wa mbali, foleni zinazosubiri au hifadhidata inayofanya kazi.

**Nakala ya kimantiki iliyotulia.** Zima vizindua vilivyopangwa na wazalishaji wengine, subiri wakusanyaji wanaofanya kazi wamalize, kisha mwaga maandishi yaliyocheleweshwa na subiri wafanyakazi wa kumwaga wamalize. Weka mabadiliko ya usanidi, matengenezo na waandishi wengine wa RRD wakiwa wamesimamishwa katika kipindi chote cha uchukuaji. Kusimamishwa kwa ukusanyaji kunaweza kuacha sampuli zilizokosekana; kuonekana kwake kunategemea mapigo ya moyo na uimarishaji.

Kabla ya kutekeleza mfano, kamilisha hatua hizo za kutuliza na uhakikishe hali ya foleni/mfanyakazi. `poller_boost.php --force` ikirudisha sifuri pekee si ushahidi wa umwagaji kamili: mchakato wa Boost uliosajiliwa tayari unaweza kuifanya itoke bila kufanya kazi. Ratibu huduma yoyote ya rrdcached au hifadhi ya mbali kando.

Mfano huu wa Bash unachukulia hifadhi ya ndani, akaunti ya hifadhidata iliyosanidiwa katika faili ya kibinafsi ya chaguo la mteja, na saraka ya RRA iliyo na RRD zote zinazosimamiwa. Badilisha kila njia. Orodhesha njia maalum kamili za RRD, malengo ya symlink, usanidi wa nje na wakusanyaji wa mbali na uwachukue kando pia.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

Hifadhi ya kumbukumbu ya programu inajumuisha usanidi na msimbo unaolingana. Rekodi marekebisho ya chanzo, matoleo ya hifadhidata na RRDtool, njia halisi za kuhifadhi na hali ya kuzima/kumwaga kwa waandishi kando ya seti. Mfano huo haujumuishi kumbukumbu za kawaida, kache na data ya metadata ya Git; kagua vizuizi hivyo kwa usakinishaji wako.

Ni seti tu iliyochukuliwa kwa mafanikio na kukaguliwa na checksum inayopokea jina la saraka la mwisho. Amri iliyofeli bado inaweza kuacha faili iliyokatwa ndani ya `.partial-*`; `set -e` inasimamisha amri zinazofuata lakini haiondoi matokeo yaliyoundwa tayari. Usipandishe saraka hiyo kuwa nakala kamili. Checksums hutambua mabadiliko ya baadaye, si ukamilifu wa kimantiki; jaribio la kurejesha bado linahitajika.

`--single-transaction` inashughulikia majedwali ya miamala, si picha thabiti ya majedwali ya programu-jalizi yasiyo ya miamala au mabadiliko ya skima ya wakati mmoja. Weka waandishi na mabadiliko ya skima wakiwa wamesimamishwa, au tumia njia ya kuhifadhi nakala inayofaa kwa injini. Rejesha ukusanyaji tu baada ya kuthibitisha kuwa uchukuaji umekamilika na hifadhi inatumika. Tazama [nyaraka za mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) kwa mahitaji ya muamala na haki. Mapungufu ya mapishi ya awali yanafuatiliwa katika [website #12](https://github.com/kadupulhq/website/issues/12).

**Kubali tofauti ya muda na uirekodi.** Sehemu yoyote utakayochukua kwanza ndiyo ya zamani zaidi, na hakuna mpangilio unaofanya jozi hai kuwa thabiti yenyewe. Andika dirisha la muda; hiyo ndiyo inayofanya matokeo yaweze kurejeshwa.

Mwagilia hifadhidata kwanza na unakili faili pili, na faili zitakuwa mpya zaidi. Chanzo cha data kilichofutwa ndani ya dirisha hilo bado kiko kwenye dampo lakini faili yake imeondoka, ikiacha rejeleo ambalo poller itaunda upya. Chanzo cha data kilichoundwa ndani ya dirisha kinafika kama faili ambayo hifadhidata haijui kuihusu, ambayo haifanyi kazi.

Nakili faili kwanza na umwage hifadhidata pili, na hifadhidata itakuwa mpya zaidi. Chanzo cha data kilichoundwa ndani ya dirisha kiko kwenye dampo bila faili nyuma yake, ambayo poller inaunda upya ikiwa tupu.

Mpangilio wowote unaweza kupoteza historia ya kabla ya dirisha ikiwa faili inayohitajika inafutwa kabla ya kunakiliwa. Inaweza pia kunasa faili iliyoandikwa kwa sehemu au sampuli za foleni zisizo thabiti. Kurekodi tofauti kunaweka kumbukumbu ya kikomo; haifanyi jozi isiyo thabiti kuwa kamili au kuhakikisha urejeshaji.

## Kile kilicho kwenye nakala ambacho hukufikiria

Vitambulisho vya kifaa viko kwenye hifadhidata katika maandishi wazi. Kache ya poller hubeba mifuatano ya jumuiya ya SNMP na majina ya watumiaji ya SNMPv3, nywila na misemo ya siri kama safu wima wazi, kwa sababu kikusanyaji kinavihitaji katika kila mzunguko. Faili ya usanidi hubeba nywila ya hifadhidata.

Kwa hivyo, nakala ya Kadupul ni hifadhi ya vitambulisho kwa kila kifaa unachofuatilia. Iweke fiche ikiwa imetulia, zuia wanaoweza kuisoma, na usiitume kwenye folda ya kushiriki faili ya jumla.

## Mpangilio wa kurejesha

Mpangilio ni muhimu kwa sababu kila hatua inategemea ile iliyo kabla yake.

1. **Rejesha usanidi kwanza.** Bila vitambulisho vya hifadhidata na njia ya RRA, hakuna kingine kinachoweza kukaguliwa. Ikiwa urejeshaji uko kwenye maunzi tofauti, rekebisha njia sasa badala ya baadaye.

2. **Rejesha mti wa RRD.** Uweke mahali ambapo usanidi unasema upo. Angalia umiliki na hali ya ruhusa: poller huandika faili hizi kama mtumiaji wa poller, na kiolesura cha wavuti huzisoma kama mtumiaji wa seva ya wavuti. Urejeshaji unaohifadhi maudhui lakini si umiliki huleta mfumo unaochora grafu vizuri na kutokusanya chochote.

3. **Rejesha hifadhidata.** Jedwali la toleo katika dampo lazima lilingane na msimbo unaorejesha juu yake. Weka vizindua na waandishi wote wakiwa wamezimwa hadi vipengele vilivyorejeshwa vikaguliwe pamoja. Dampo kutoka toleo la zamani lililorejeshwa kwenye msimbo mpya hutuma kiolesura cha wavuti kwa kisakinishaji, ambayo ni tabia sahihi lakini si kile unachotaka katikati ya urejeshaji. Rejesha msimbo unaolingana kwanza.

4. **Jenga upya kache ya poller.** Kache hiyo inatokana na vitu vingine, na urejeshaji ndio hasa hali ambapo inaweza kuwa imepitwa na wakati. Kuijenga upya hugharimu mzunguko mmoja na huondoa kundi zima la dalili zinazochanganya.

5. **Anzisha poller, kisha kagua faili moja.** Thibitisha kuwa muda wa mwisho wa kusasisha faili ya RRD unabadilika baada ya mzunguko wa kwanza. Ikiwa grafu zimejazwa hadi wakati wa kurejesha na kisha zikawa tambarare, kagua matokeo ya ukusanyaji, foleni, mihuri ya muda, njia na ruhusa. Grafu tambarare pekee haitambui sababu.

## Mitego

**Faili za RRD zinakataa sasisho zilizopita.** Faili ya RRD haitakubali sampuli katika au kabla ya muhuri wa muda ambao tayari inao. Kurejesha seti ya zamani ya faili dhidi ya hifadhidata mpya hakujazi sampuli zilizopotea yenyewe. Foleni zilizocheleweshwa zilizohifadhiwa au vyanzo vingine vinaweza kuwa na usomaji unaoweza kurejeshwa, lakini uchezaji upya unahitaji uthibitishaji tofauti na mpangilio wa muhuri wa muda. Bila usomaji huo, ukusanyaji huanza tena kukiwa na pengo. Hii pia ndiyo sababu huwezi kuunganisha nakala mbili kwa kunakili faili kati yake.

**Kagua ikiwa njia zako zilizohifadhiwa zimegawanywa kwa ishara kabla ya kuandika upya chochote.** Vyanzo vya data vilivyozalishwa huhifadhi njia kama `<path_rra>/name.rrd`, na ishara hupanuliwa wakati wa kusoma kutoka kwa mpangilio wa njia ya RRD. Kwa hizo, kuhamisha usakinishaji kunamaanisha kubadilisha mpangilio na kujenga upya kache ya poller, si kuandika upya safu. Njia zilizoingizwa kwa mkono huhifadhiwa kihalisi na zinahitaji kuandikwa upya. Kagua kabla ya kuendesha sasisho kwenye jedwali lote, kwa sababu kuandika upya njia zilizowekwa alama kuwa njia kamili ndilo badiliko linalofanya uhamishaji unaofuata kuwa mgumu zaidi.

**Wakusanyaji wa mbali wana faili yao ya usanidi.** Kila mmoja anashikilia vitambulisho vyake vya hifadhidata na kitambulisho cha kikusanyaji. Hazimo katika nakala kuu ya hifadhidata. Zichukue kwa kila seva pangishi.

**Data ya programu-jalizi iko katika hifadhidata ileile.** Programu-jalizi huunda majedwali yake yenyewe wakati wa usakinishaji, kwa hivyo dampo kamili la hifadhidata linazishughulikia. Msimbo wa programu-jalizi haumo katika hifadhidata. Ukirejesha hifadhidata bila saraka ya `plugins/` inayolingana, usakinishaji utazima kile usichoweza kukipata.

**Nakala ambayo hujairejesha ni dhana tu.** Rejesha katika mazingira ya majaribio kulingana na ratiba. Hali ya kutofaulu ambayo hii huikamata mara nyingi si uharibifu wa data; ni nakala ambayo ilikuwa inachukua sehemu moja tu kati ya sehemu tatu.
