---
title: Kufuatilia Swichi
description: Gundua milango ya swichi, weka kwenye grafu kaunta sahihi, na uchague fahirisi ili historia ya mlango ibaki kuhusishwa na mlango baada ya uingizwaji wa kadi.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 2
---

:::caution[Thibitisha kabla ya matumizi]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Swichi ni mfano halisi wa matumizi ya dodoso za data. Hujui mapema ni milango mingapi iliyopo, hesabu inaweza kubadilika, na kila mlango unahitaji chanzo chake cha data. Tazama [Violezo](/sw/concepts/templates/) kwa jinsi dodoso za data zinavyofanya kazi; ukurasa huu unahusu usanidi sahihi.

## Kabla ya kuanza

Hakikisha kifaa kinajibu kutoka kwa mkusanyaji aliyeteuliwa, ikiwezekana chini ya mtumiaji wa poller. Tumia kitambulisho chako cha kusoma tu ulichosanidi. OID za nambari huepuka utegemezi wa majina ya MIB yaliyosakinishwa ndani ya nchi.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Tumia SNMP v2c au v3. Kaunta za violesura za 64-bit ni vipengee vya SMIv2 na haziwezi kuulizwa kupitia v1. Kifaa cha v1 kitakupa tu kaunta za 32-bit na hakuna kitu kingine.

## Kuchagua kiolezo cha kifaa

Kiolezo cha kifaa huamua ni dodoso gani za data na violezo vya grafu vinavyotolewa unapoongeza kifaa. Kadupul inarithi seti ya violezo vilivyotolewa na Cacti, ambayo inajumuisha kiolezo cha kifaa cha kawaida cha SNMP na seti ya violezo maalum vya wauzaji.

Ugunduzi wa milango unatoka kwa chanzo kile kile bila kujali chaguo lako: dodoso la data ya kiolesura lililofafanuliwa katika `resource/snmp_queries/interface.xml`. Ikiwa hakuna kiolezo kinacholingana na maunzi yako, chagua kiolezo cha kawaida na uhusishe dodoso la kiolesura nacho.

## Kuendesha dodoso la data

Dodoso hupitia `ifIndex` ili kupata milango, na husoma `ifNumber` ili kujua ni mingapi inayotarajiwa. Kisha inakusanya seti ya sehemu kwa kila mlango.

| Sehemu | OID | Inatumika kwa |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Nafasi katika jedwali la SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Jina fupi la mlango, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Maelezo marefu zaidi |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Maelezo ya kiolesura unayosanidi |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Anwani ya MAC ya mlango |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Kasi katika biti/sekunde, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Kasi katika Mbiti/sekunde |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up au Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Kaunta za baiti za 32-bit |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Kaunta za baiti za 64-bit |

Endesha dodoso mara moja kwenye kifaa. Itarudisha jedwali la milango iliyogunduliwa. Soma jedwali hili kabla ya kuunda grafu, kwani linaunda msingi wa kila uamuzi unaofuata.

## Kuchagua kaunta za 64-bit

Dodoso la kiolesura hutoa violezo kadhaa vya grafu ya trafiki. Vikuu ni:

| Kiolezo cha grafu | Husoma |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Sawa, na mstari wa asilimia ya 95 |
| In/Out Bits (64-bit, BW) | Sawa, kuhusiana na kasi ya kiolesura |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Tumia kiolezo cha 64-bit isipokuwa una sababu maalum ya kutofanya hivyo. Kaunta ya okteti ya 32-bit hufikia kikomo katika 4294967295. Mlango wa gigabiti chini ya mzigo kamili huijaza kwa takriban sekunde 34. Katika hatua ya sekunde 300, poller haiwezi kutofautisha kufurika mara moja kutoka kwa kufurika mara saba, na `COUNTER` hurekebisha tu kufurika moja kati ya sampuli mbili. Grafu haionekani kuvunjika waziwazi; inaonyesha tu thamani za chini sana daima.

Thibitisha kuwa kaunta zinajazwa kabla ya kutengeneza mamia ya grafu.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Mzunguko tupu au ulioshindwa unahitaji uchunguzi: angalia hitilafu iliyoripotiwa, mwonekano wa ufikiaji, na usaidizi wa wakala.

## Kuangalia kiwango cha juu kilichohifadhiwa baada ya mabadiliko ya kasi

Wakati chanzo cha data kinapotumia kiwango cha juu kulingana na kasi ya dodoso, uundaji huchukua kasi kutoka kwa data ya ugunduzi iliyohifadhiwa kwenye akiba. `ifHighSpeed` inapendelewa, `ifSpeed` inatumiwa ikiwa ya kwanza haipo, na chaguomsingi iliyosanidiwa inatumika ikiwa zote ni sifuri.

Thamani hiyo imeandikwa kwenye faili. Mlango uliogunduliwa kwa Mbps 100 na baadaye kujadiliwa juu zaidi unaweza kubaki na kiwango cha juu chini ya trafiki yake halisi, na RRDtool itarekodi viwango vilivyo juu ya kiwango hicho kama havijulikani. Linganisha kasi iliyohifadhiwa, ufafanuzi wa chanzo cha data, na faili halisi na `rrdtool info`.

## Uamuzi wa fahirisi

Hapa ndipo historia inapotea ikiwa makosa yatafanywa.

Kila chanzo cha data huhifadhi mambo mawili kuhusu mlango wake: ni sehemu gani inayoitambulisha (aina ya fahirisi) na thamani ya sehemu hiyo. Katika kila faharisi upya, hupata tena mlango kwa kuuliza ni fahirisi gani ya SNMP ambayo kwa sasa ina thamani hiyo katika sehemu hiyo. Chanzo cha data hufuata thamani, si nafasi ya jedwali.

Kwa hivyo swali ni sehemu gani inayobeba thamani.

Dodoso la kiolesura linatangaza mpangilio wa upendeleo: `ifName`, kisha `ifDescr`, kisha `ifHwAddr`, kisha `ifIndex`. Kadupul kawaida huchagua kati ya wagombea walio na maadili tofauti ya kutosha na hakuna nakala zilizorudiwa.

| Sehemu | Husalimika | Hushindwa wakati |
|---|---|---|
| `ifName` | Kuwasha upya, uingizwaji wa kadi, kuweka nambari upya | Wakala huacha wazi au kurudia katika wanachama wa safu (stack) |
| `ifDescr` | Kawaida imara kwenye maunzi ya swichi | Kwenye seva, jina la kernel linaweza kubadilika |
| `ifHwAddr` | Kuwasha upya | Kadi iliyobadilishwa ina MAC mpya, ambayo ndiyo kesi hasa uliyotaka kulinda |
| `ifIndex` | Hakuna kinachotegemewa | Ubadilishanaji wa kadi, kuwasha upya, au mabadiliko ya firmware hufanya jedwali kuhesabiwa upya |

Ikiwa dodoso inarudi nyuma kwa `ifIndex`, chukulia hii kama tatizo na si matokeo ya kawaida. Historia yako ya mlango basi inafungwa kwa nambari ambayo swichi iko huru kuikabidhi tena.

## Njia ya kuorodhesha upya (reindex method)

Imewekwa kwa kila kifaa kwa kila dodoso la data. Huamua wakati Kadupul inaposoma tena sehemu za fahirisi.

| Njia | Huchochewa na | Gharama |
|---|---|---|
| None | Hakuna; mwongozo au hati tu | Hakuna |
| Uptime | Muda wa kufanya kazi wa SNMP wa kifaa unaorudi nyuma | Ulinganisho mmoja kwa kila mzunguko |
| Index Count | Mabadiliko katika idadi ya fahirisi zilizogunduliwa | Hesabu moja kwa kila mzunguko |
| Verify All | Kushindwa kwa ukaguzi wa utambulisho uliowekwa kwenye akiba | Huuliza fahirisi zinazojulikana wakati wa upigaji kura |

Uptime ni chaguomsingi na inafaa swichi nyingi, kwa sababu kuwasha upya ndilo tukio linaloweka nambari upya kwa fahirisi. Index Count hunasa kadi zilizoongezwa au kuondolewa bila kuanzisha upya. Verify All inaweza kugundua vitambulisho vilivyobadilishwa kwenye fahirisi zinazojulikana, lakini haitoi hakikisho la ugunduzi wa milango mipya.

Ili kuendesha upya kifaa na dodoso iliyochaguliwa, badilisha vitambulisho vyote viwili na vitambulisho vilivyosakinishwa. Acha `--qid` ili kuendesha upya dodoso zote za kifaa hicho:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` hupanua utekelezaji kwa vifaa vyote vilivyowezeshwa. Epuka uendeshaji unaoingiliana wa faharisi upya. `--force` hupita usajili wa mchakato na kuburudisha akiba za mada.

## Wakati mlango unapotea

Usidhani kwamba mlango unaokosekana huacha kukusanya kiotomatiki. Msimbo wa sasa wa kuorodhesha upya unaweza kuweka upya bendera ya yatima na kuhifadhi OID za zamani za upigaji kura wakati utambulisho haujatatuliwa na hakuna chanzo kinachobadilisha fahirisi. Linganisha utambulisho uliohifadhiwa na akiba mpya ya ugunduzi na uzime chanzo kilichoathiriwa hadi ulinganifu utakapothibitishwa. Tazama [Dodoso za data na fahirisi](/sw/concepts/data-queries-and-indexes/).

## Chasi kubwa (large chassis)

Mipangilio miwili kwa kila kifaa inakuwa muhimu mara tu hesabu ya milango inapokuwa kubwa: angalia OID zilizosanidiwa kwa kila ombi la SNMP na hesabu ya nyuzi (threads) kwa kila kifaa. Usaidizi wa bechi na ulinganifu madhubuti hutegemea mkusanyaji na wakala; PHP `cmd.php` na Spine hazitoi tabia inayofanana ya uzi.

Badilisha mpangilio mmoja tu kwa wakati mmoja na uangalie muda wa mzunguko wa poller.

## Njia za kushindwa

| Dalili | Sababu |
|---|---|
| Grafu zimeundwa, kila kipimo hakijulikani | Kaunta za 64-bit hazijatekelezwa, au kifaa kinatumia SNMP v1 |
| Kaunta zinaruka hadi thamani zisizo za kawaida | Kaunta ya 32-bit inafurika zaidi ya mara moja kwa kipindi |
| Mapengo hutokea tu chini ya mzigo mkubwa | Upeo wa RRD umefungwa kwa kasi ya zamani iliyogunduliwa |
| Historia ya mlango imepewa mlango usio sahihi baada ya matengenezo | Utambulisho usio thabiti, ramani ya zamani, au utunzaji wa yatima ambao haujatatuliwa |
| Poller hurekodi maonyo kuhusu fahirisi batili za SNMP | Vyanzo vya data vimeachwa bila fahirisi; fanya upya fahirisi, futa, au uzime |
| Milango imegunduliwa, hakuna kinachokusanywa | Vyanzo vya data vilivyo na fahirisi tupu haviundi maingizo ya akiba ya poller |
