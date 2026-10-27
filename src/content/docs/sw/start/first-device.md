---
title: "Ongeza kifaa chako cha kwanza"
description: "Anza kukusanya data ya kifaa kimoja, na uthibitishe kuwa data inafika kabla ya kuunda chochote juu yake."
sidebar:
  order: 3
banner:
  content: "Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha."
---

Ongeza kifaa kimoja, thibitisha kuwa kinajibu, na kisha tu uendelee mbele. Matatizo mengi kwenye mfumo wa ufuatiliaji yanatokana na kifaa ambacho hakikuwahi kujibu vizuri tangu mwanzo.

Chagua kifaa ambacho hutajali kikipata hitilafu wakati wa majaribio. Swichi unayomiliki, kwenye mtandao unaoudhibiti, ikiwa na SNMP iliyowashwa tayari. Usianze na kifaa ambacho mtu fulani anakuuliza kukihusu.

## Kabla ya kuanza

Kwa mfano huu wa SNMP, ni lazima kifaa kijibu maswali kutoka kwa mkusanyaji (collector) kilichopangiwa. Fanya ukaguzi kwenye mkusanyaji huyo, ikiwezekana kama mtumiaji wa poller; ombi kutoka kwenye kompyuta yako ya mkononi linaweza kupitia njia tofauti ya ngome (firewall). Badilisha anwani ya mfano na jina la jumuiya na vitambulisho vya kusoma tu (read-only) vilivyowekwa kwenye kifaa chako. Nambari za OID zilizo hapa chini hufanya kazi pia hata wakati faili za majina ya MIB ya ndani hazijasakinishwa.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Ikiwa amri hiyo inarudisha maelezo ya kifaa, endelea. Ikiwa muda wake unaisha (timeout), rekebisha hilo kwanza. Hakuna kiasi chochote cha mipangilio kwenye kiolesura cha wavuti kitakachofanya kifaa kisichoweza kufikiwa kijibu.

Kisha kagua jedwali ambalo kwa hakika unataka kulichora kwenye grafu, kwa sababu kifaa kinaweza kujibu `sysDescr` lakini bado kikakataa jedwali la violesura (interfaces).

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

OID ya pili ni safu wima ya `ifDescr`. Unahitaji safu mlalo moja kwa kila kiolesura kilicho wazi. Matokeo tupu yanaweza kumaanisha mwonekano wenye vikwazo wa SNMP au jedwali lisilotumiwa; hitilafu ya uidhinishaji huashiria vitambulisho au sera ya ufikiaji. Kagua hitilafu iliyorudishwa kabla ya kubadilisha usanidi wa kifaa au wa Kadupul.

Mambo mawili ya kweli kuhusu matoleo ya SNMP huamua mambo baadaye, kwa hivyo yaweke sawa sasa.

| Toleo | Nini maana yake kwako |
|---|---|
| v1 | Hakuna usaidizi wa Counter64. Miunganisho ya kasi inaweza kuzungusha kaunta za okteti za biti 32 mara kadhaa kati ya vipindi vya ukaguzi (wrap), na kufanya kiwango kisiwe wazi |
| v2c | Inasaidia Counter64 wakati wakala (agent) anapoitoa; majina ya jumuiya hutumwa kwa maandishi wazi yasiyosimbwa |
| v3 | Inasaidia uthibitishaji na usimbaji fiche kwa kutumia `authPriv`; kuchagua v3 pekee hakuwashi vyote viwili |

Pendelea kutumia v3 yenye `authPriv` pale inapoungwa mkono, au v2c kwenye mtandao wa usimamizi wenye vikwazo. Chagua aina ya grafu ya kiolesura cha biti 64 pamoja na toleo la SNMP. Ikiwa kifaa kinazungumza v1 pekee, zingatia muda wa ukaguzi na kiwango cha trafiki kwenye jedwali la hitilafu lililo chini ya ukurasa huu. [SNMP](/sw/reference/snmp/) inashughulikia sehemu za vitambulisho kikamilifu.

## Amua mambo matatu kabla ya kufungua fomu

**Vitambulisho.** Vile vile hasa ulivyovijaribu hapo juu, ikiwa ni pamoja na mlango (port) ikiwa si ule chaguomsingi.

**Njia ya upatikanaji.** Hivi ndivyo Kadupul inavyoamua kuwa kifaa kiko hewani (up), na haitegemei ikiwa ukusanyaji wa data unafanya kazi. Chaguo zilizopo ni none, ping, SNMP uptime, SNMP description, SNMP getNext, na michanganyiko miwili ya ping na SNMP uptime, moja ikihitaji vyote viwili na nyingine ikikubali mojawapo.

Pendelea njia ya SNMP kwa kifaa unachokikagua kupitia SNMP. Inajaribu kile hasa unachokitegemea. ICMP ping inahitaji soketi ghafi (raw socket), ambayo inahitaji marupurupu ambayo watumiaji wa wavuti na poller huwa hawana kwa kawaida, kwa hivyo kifaa kinachojibu `ping` kutoka kwenye shell yako kinaweza bado kuripotiwa kuwa kiko chini. TCP ping dhidi ya mlango unaojua uko wazi huepuka hilo.

**Kiolezo cha kifaa (Device template).** Chagua kile kinacholingana na maunzi yako.

## Kiongeze

1. Kwenye ukurasa wa zamani wa **Vifaa** (`host.php`), chagua **Add**. Uundaji wa kifaa na usanidi wa grafu bado unatumia ukurasa huu wakati wa uhamiaji wa Symfony. Weka maelezo, jina la seva au anwani, mkusanyaji aliyepangiwa, toleo la SNMP, na vitambulisho.
2. Weka njia ya upatikanaji uliyochagua.
3. Chagua kiolezo cha kifaa.
4. Hifadhi, thibitisha kuwa kifaa kimewashwa, na usome paneli yake ya upatikanaji/SNMP. Rekodi iliyohifadhiwa kwenye hifadhidata si ushahidi kwamba ukusanyaji umefaulu.

## Kiolezo cha kifaa kinaamua nini

Kiolezo cha kifaa huunganisha violezo vya grafu na hoja za data kwenye kifaa. Hoja ya data hukagua jedwali kwenye kifaa, kama vile violesura vyake, na kutoa fahirisi (index) moja kwa kila safu mlalo. Kutumia kiolezo pia huendesha hoja zake za data ili kujaza fahirisi hizo. Wakati uotomatiki wa grafu umezimwa, miunganisho hiyo haitengenezi grafu peke yake. Wakati uotomatiki wa grafu umewashwa, kulabu (hooks) za kiolezo/hoja zinaweza kutengeneza grafu chini ya sheria zinazolingana; kagua grafu zilizopo kabla ya kuongeza nakala nyingine.

Kubadilisha kiolezo kunaweza kubadilisha miunganisho na kuendesha kulabu hizo tena. Huu si uwekaji upya wa grafu au vyanzo vya data vilivyopo. Kagua kiolezo kilichochaguliwa na fahirisi zilizoulizwa kabla ya kukitumia kwenye kifaa ambacho tayari kina historia.

Fahirisi hizo ndizo sababu ya wewe kuchagua violesura kutoka kwenye orodha badala ya kuandika OID kwa mkono. [Violezo](/sw/concepts/templates/) na [Hoja za data na fahirisi](/sw/concepts/data-queries-and-indexes/) hufafanua vyote viwili ipasavyo.

## Soma paneli ya hali

Wakati kifaa kinapohifadhiwa kikiwa na njia ya upatikanaji ya SNMP, Kadupul hufungua kipindi na kutoa ripoti. Huu ndio ukaguzi muhimu zaidi, na ndio ambao watu wengi huuruka.

| Unachokiona | Nini maana yake |
|---|---|
| Hoja za mfumo na uptime zimefaulu | Paneli inaweza kusoma metadata ya msingi ya SNMP. Hii bado haithibitishi ukusanyaji wa data ya kiolesura |
| Mahali au Mawasiliano ni tupu | Sehemu hizi za hiari za metadata zinaweza kuwa hazijawekwa; kuwa tupu pekee si hitilafu ya ukusanyaji |
| SNMP haitumiki | Hakuna jumuiya au jina la mtumiaji kwenye kifaa, au toleo limewekwa kuwa none |
| Hitilafu ya kipindi cha SNMP | Usanidi wa kipindi umeshindwa; kagua hitilafu iliyoonyeshwa, vitambulisho, itifaki na mipangilio ya muunganisho |
| Hitilafu ya mfumo wa SNMP | Kusoma `sysDescr` kumeshindwa; kagua hitilafu iliyorudishwa, mwonekano wa wakala, vitambulisho na uwezo wa kufikiwa |
| Hitilafu ya seva ya SNMP | Hakuna maelezo wala uptime iliyorudi |
| Uptime inaonyeshwa kama `U` | Uptime haikuweza kusomeka. Baadhi ya vifaa haviripoti kabisa kiuhalisia |

Ikiwa njia ya upatikanaji inajumuisha ping, matokeo tofauti ya ping huonekana hapa chini. Soma yote mawili. Kifaa kinaweza kufaulu kimoja na kushindwa kingine, na kile kinachoshindwa kinakuambia wapi pa kuangalia.

Maelezo tupu ya mfumo hayathibitishi kuwa ukusanyaji unashindwa. Msimbo unakubali mawakala wenye maelezo tupu na uptime inayoweza kutumika. Vifaa vilivyolemazwa huruka ukaguzi wa upatikanaji, na njia za upatikanaji zisizo za SNMP hazionyeshi paneli hii ya SNMP. Thibitisha hoja halisi na poller cache inayofuata.

## Unda vyanzo vya data na grafu

Kwa kifaa kipya kisicho na grafu zilizoundwa kiotomatiki, hatua inayofuata ni kuunda grafu na chanzo chake cha data. Kagua **Orodha ya Vyanzo vya Data** na **Tazama Poller Cache** kwenye ukurasa wa kifaa badala ya kudhani kuwa ziko tupu.

Kutoka kwenye ukurasa wa kifaa, chagua **Unda Grafu kwa Kifaa Hiki**. Kwa swichi hii inamaanisha kuendesha hoja ya data ya kiolesura, kuchagua violesura unavyovijali, na kuchagua aina ya grafu kwa ajili yake. Chagua violesura viwili au vitatu, si vyote arobaini na nane. Unathibitisha kuwa njia inafanya kazi, na kundi dogo la kwanza ni rahisi zaidi kulisoma katika hatua inayofuata.

Grafu iliyoorodheshwa huunganisha vyanzo vya data na kiolesura kilichochaguliwa na kutayarisha maingizo yao ya poller-cache; vyanzo vinavyooana vilivyopo vinaweza kutumika tena. Majibu ya uundaji wa grafu si uthibitisho wa ukusanyaji wa data. Thibitisha kuwa akiba ina kifaa kinachotarajiwa, OID za kiolesura na njia ya RRD.

## Thibitisha kuwa inakusanya data

Subiri mizunguko ya ukusanyaji iliyopangwa, kisha uangalie alama za nyakati na thamani zote mbili. Grafu tupu inaweza kumaanisha urekebishaji wa mwanzo, thamani isiyojulikana au ukusanyaji ulioshindwa. Usomaji wa kaunta mbili ni muhimu ili kukokotoa kiwango, lakini mizunguko miwili ya poller haihakikishii ndoo ya kumbukumbu kamili na halali.

Kagua mambo matatu, kwa utaratibu huu.

**Poller ilifanya kazi.** Tafuta muhtasari wa mwisho wa mzunguko kwenye kumbukumbu iliyowekwa. Ikiwa haupo, kagua upangaji wa ratiba, lengwa la kumbukumbu na ruhusa, na ikiwa poller ilitoka kabla ya kukamilika. Tazama [Uwekaji kumbukumbu](/sw/reference/logging/).

**Faili lipo na ni la hivi karibuni.** Nakili njia halisi ya RRD kutoka kwenye chanzo cha data au poller cache; usikisie kutoka kwa jina la seva. Njia na majina yanaweza kubinafsishwa. Tazama [Mpangilio wa faili](/sw/reference/file-layout/). Uliza RRDtool ni lini faili liliandikwa mara ya mwisho:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Muhuri wa muda unapaswa kusonga mbele wakati wa uandishi uliofanikiwa. Muhuri wa muda wa hivi karibuni bado unaweza kuambatana na thamani isiyojulikana, na uandishi uliohifadhiwa unaweza kuchelewesha muhuri wa muda kwenye diski. Kwa `rrdcached` au Boost, kagua pia hali ya usafishaji ya kijenzi hicho.

**Thamani haijulikani.** `lastupdate` inaonyesha thamani za hivi karibuni zilizotolewa; kwa kaunta hizi ni thamani za kaunta, si viwango vya trafiki vilivyokokotolewa. Kagua safu mlalo zilizokamilika kutoka `fetch` kwa viwango vyenye ukomo. Muda wa kuanza, mpangilio wa hatua, heartbeat, mipaka na kiwango cha data isiyojulikana ya kumbukumbu yote huathiri wakati safu inayoweza kutumika inapoonekana. Usitambue hitilafu kutoka kwenye safu mbili za kwanza pekee. Ikiwa thamani zisizojulikana zitaendelea, kagua thamani zilizokusanywa, aina ya chanzo cha data, heartbeat na hitilafu za poller.

## Hitilafu za kawaida za kwanza

| Dalili | Sababu ya kawaida |
|---|---|
| Inahifadhi, lakini utafutaji wa maelezo ya mfumo unaripoti hitilafu | Kagua vitambulisho, mwonekano wa wakala na ufikiaji wa mkusanyaji; maelezo tupu pekee si ushahidi wa kutosha |
| Hitilafu ya kipindi cha SNMP kutoka Kadupul, wakati `snmpget` inafanya kazi kutoka kwenye kompyuta yako | Njia ya ngome inatofautiana, au wakala anaweka vikwazo kwa anwani ya chanzo |
| Kifaa kinaonyesha kiko chini, lakini data ya SNMP inawasili | Upatikanaji umewekwa kwa ICMP ping, ambayo haiwezi kufungua soketi ghafi |
| Maelezo yanaonekana, lakini hakuna data | Poller haijapangwa, au inafanya kazi kama mtumiaji asiyeweza kuandika kwenye saraka ya RRD |
| Hoja ya data hairudishi violesura vyovyote | Mwonekano wa wakala haujumuishi jedwali la kiolesura, au kifaa kinahitaji kuorodheshwa upya |
| Thamani ya kwanza haijulikani, kisha inakuwa sawa | Kawaida kwa kaunta. Inahitaji usomaji mara mbili ili kutoa kiwango |
| Thamani zisizojulikana zinaendelea | Ukusanyaji ulioshindwa, thamani batili, kutolingana kwa aina/mipaka, heartbeat au urekebishaji wa kumbukumbu |
| Data inapatikana kwa muda, kisha mapengo | Poller inachukua muda mrefu kuliko muda wake uliowekwa, au kifaa kinaweka kikomo cha kasi ya SNMP |
| Viwango vya kaunta haviwezekani | Mizunguko mingi ya biti 32, uwekaji upya wa kaunta, vitengo au mipangilio ya chanzo cha data; tumia kaunta za biti 64 zinazoungwa mkono kwenye miunganisho ya kasi |
| Violesura vinachora milango isiyo sahihi baada ya kuwasha upya | Fahirisi zimebadilika. Hoja ya data inahitaji njia ya kuorodhesha upya inayotambua mabadiliko hayo |

Jambo la mwisho linafaa kueleweka kabla ya kuwa na swichi mia moja: fahirisi za violesura vya SNMP hazina hakikisho la kubaki thabiti baada ya kuwasha upya mfumo au kubadilisha moduli. Njia ya kuorodhesha upya kwenye hoja ya data ndiyo inayofanya grafu iendelee kuelekeza kwenye mlango uleule halisi. [Hoja za data na fahirisi](/sw/concepts/data-queries-and-indexes/) inaeleza chaguzi zilizopo.

Unapokuwa na kifaa kimoja kinachokusanya data vizuri, ongeza vingine kwa wingi badala ya kimoja baada ya kingine. [Gundua vifaa kiotomatiki](/sw/guides/discover-devices-automatically/) na zana za mstari wa amri katika [Zana za mstari wa amri](/sw/reference/command-line-tools/) vyote ni bora kuliko kurudia ukurasa huu mara hamsini.

Inayofuata: [Soma grafu yako ya kwanza](/sw/start/first-graph/).
