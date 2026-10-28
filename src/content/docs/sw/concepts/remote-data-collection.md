---
title: Ukusanyaji wa data wa mbali
description: Kwa nini ukusanyaji unasambazwa na hifadhi haisambazwi, kile ambacho mkusanyaji wa mbali anamiliki, na gharama ya kuwa na nakala ya pili ya usanidi.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 9
---

:::caution[Tabia ya seva mbadala ya RRDtool iliyorithiwa]
Usambazaji wa seva mbadala (proxy) ya RRDtool hautumiki katika Kadupul. Tumia hifadhi ya ndani ya RRDtool
(`storage_location = 0`). Mipangilio ya seva mbadala, maelezo ya itifaki na mifumo ya kazi
kwenye ukurasa huu inaandika tabia iliyorithiwa, si njia inayotumika ya usambazaji au uhamishaji.
Tazama [Seva mbadala ya RRDtool](/sw/reference/rrdproxy/).
:::

Ukusanyaji ni sehemu ambayo haitoshei kwenye mashine moja. Sehemu kubwa ya mzunguko wa upigaji kura hutumiwa
kusubiri vifaa vijibu, na kusubiri hakuwezi kubanwa. Unaweza kupishana sehemu kubwa yake kwa michakato na nyuzi (threads) zaidi,
hadi kufikia hatua ambapo seva inayokusanya inakosa CPU au safari ya kwenda na kurudi kwenye tovuti ya mbali inatawala kila kitu.

Mkusanyaji wa mbali (remote collector) ni msimbo uleule wenye kitambulisho tofauti cha mkusanyaji, ukipiga kura kwa kikundi cha vifaa.
Kila kifaa kinataja mkusanyaji anayehusika nacho. Mgawo huo ndio mgawanyo wa kawaida wa ratiba.
Weka mgawo wa kifaa na kache ya poller iliyonakiliwa vikiwa thabiti; chaguo hili la ratiba si uthibitisho kwamba kila uandishi wa matokeo unatekeleza umiliki wa mkusanyaji.

Kwa swali la *lini* unapaswa kutumia suluhisho hili, tazama
[Ongeza ukubwa wa poller](/sw/guides/scale-the-poller/). Ukurasa huu unahusu ni nini hasa na jinsi inavyofanya kazi.

## Kwa nini mkusanyaji hubeba hifadhidata yake yenyewe

Mkusanyaji anayesoma orodha yake ya kazi kutoka hifadhidata kuu kupitia mtandao huacha kukusanya wakati mtandao unapokatika.
Hiyo ni kinyume kabisa na kile ulichotaka mkusanyaji wa mbali afanye.

Kwa hivyo hubeba hifadhidata ya ndani inayoshikilia nakala yake ya usanidi: mipangilio, violezo,
mbinu za kuingiza data, maswali ya data, sehemu yake ya kache ya poller, vifaa vyake, usanidi wa programu-jalizi,
na majedwali ya watumiaji na ruhusa. Nakala hiyo inasukumwa kutoka kwenye usakinishaji mkuu.
Chukulia usakinishaji mkuu kama mamlaka ya usanidi, wakati mkusanyaji anadumisha hali ya uendeshaji wa ndani na mipangilio ya mashine yake.

Mipangilio ya njia haijumuishwi kwenye nakala, pamoja na takwimu za kila mzunguko ambazo usakinishaji mkuu unajiwekea wenyewe.
Njia ni mali ya mashine, si mali ya usakinishaji mzima.

## Unakili ni wa mara kwa mara, kwa hivyo usanidi huchelewa

Poller mkuu hukagua wakusanyaji wa mbali waliowezeshwa wenye seva ya hifadhidata isiyo ya ndani na muda wa ulandanishi usio sifuri.
Mkusanyaji anastahili ikiwa hajawahi kulandanishwa, muda wake umepita, au amewekewa alama ya kuhitaji ulandanishi.
Muda wa sifuri humwondoa kwenye ukaguzi huu wa mara kwa mara, hata wakati amewekewa alama ya kuhitaji ulandanishi.

Chaguo-msingi la kimataifa ni saa mbili; mkusanyaji anaweza kuwa na muda wake mwenyewe.
Huu si uthibitisho kwamba kila mabadiliko yanasubiri saa mbili: shughuli za vifaa na programu-jalizi pia zina njia za unakili zilizolengwa.
Usambazaji wenye mafanikio unategemea operesheni hiyo, muunganisho na majedwali yaliyochaguliwa.
Kagua usanidi halisi wa mkusanyaji na kache badala ya kudhani ulinganifu wa papo hapo au ucheleweshaji uliowekwa.

Unakili kamili unaweza kuombwa kutoka kwa mkusanyaji mkuu kwa kutumia
`php cli/poller_replicate.php`, wakati wakusanyaji wa mbali waliowezeshwa wamerejelewa.
Hunakili kila mkusanyaji wa mbali aliyewezeshwa isipokuwa `--poller=N` anapochagua mmoja mahususi.
Tazama [Ongeza ukubwa wa poller](/sw/guides/scale-the-poller/) na
[Hamia kwenye maunzi mapya](/sw/guides/migrate-to-new-hardware/) kwa muktadha wa uendeshaji.

## Njia tatu za muunganisho

Mkusanyaji huamua wakati wa kuanza jinsi atakavyofanya kazi, kulingana na ikiwa hifadhidata kuu inajibu na ikiwa anashikilia sampuli ambazo hazijawasilishwa.

| Hali | Masharti | Tabia |
|---|---|---|
| Mtandaoni (Online) | Hifadhidata kuu inaunganisha na hakuna mrundikano wa ndani wa Boost unaogunduliwa | Uandishi wa matokeo unalenga hifadhidata kuu |
| Nje ya mtandao (Offline) | Muunganisho mkuu unashindwa au unalazimishwa kuwa nje ya mtandao | Ukusanyaji unatumia hifadhi ya muda ya ndani, ikiwa huduma za ndani zinabaki na afya |
| Urejeshaji (Recovery) | Hifadhidata kuu inaunganisha huku safu mlalo za ndani za Boost zikibaki | Sampuli mpya hubaki ndani wakati mchakato wa usuli unajaribu kuhamisha mrundikano |

Hali ya nje ya mtandao si hali ya hitilafu. Ni tabia iliyoundwa ya mkusanyaji ambaye kiungo chake kimekatika, na ndiyo sababu mkusanyaji ana hifadhidata ya ndani hapo awali.
Ukusanyaji unaendelea dhidi ya usanidi unaopatikana ndani ya nchi. Uwezo wa hifadhidata ya ndani, ufikiaji wa kifaa, afya ya kipanga ratiba na vitambulisho vinavyoweza kutumika bado vinahitajika;
hali ya nje ya mtandao haihakikishii ukusanyaji usioingiliwa au uwasilishaji wa mwisho.

## Jinsi matokeo yanavyofikia usakinishaji mkuu

Matokeo hayasafiri kama uandishi wa moja kwa moja wa RRD. Yanasafiri kama safu mlalo za data.

Uandishi ulioahirishwa wa RRD unahitajika wakati kuna zaidi ya mkusanyaji mmoja, na kuongeza mkusanyaji wa mbali aliyewezeshwa husababisha poller mkuu kuwezesha usasishaji ulioahirishwa.
Njia ya kuanza pia huwezesha mfumo wa Boost na kuelekeza upya wakati rekodi nyingi za wakusanyaji zipo.
Mipangilio hii haithibitishi peke yake usambazaji unaofanya kazi vizuri.
Tazama [Uandishi wa kiasi cha juu](/sw/concepts/high-volume-writes/) kwa kile ambacho hali hiyo hufanya.

Akiwa mtandaoni, mkusanyaji huingiza sampuli zake moja kwa moja kwenye jedwali kuu la bafa.
Usakinishaji mkuu huzimwaga kwenye faili za RRD kulingana na ratiba yake mwenyewe, sawasawa na jinsi unavyofanya kwa sampuli zilizokusanywa nao wenyewe.
Sampuli za mkusanyaji si za kipekee zikishawasili.

Nje ya mtandao na wakati wa urejeshaji, sampuli hujilimbikiza kwenye foleni ya ndani ya Boost.
Wakati hifadhidata kuu inapopatikana tena, `poller_recovery.php` huingiza safu zilizohifadhiwa kwenye foleni kuu ya Boost,
ikisasisha matokeo ya safu ambayo tayari ipo hapo.

Urejeshaji hufuta safu ya ndani baada tu ya uingizaji mkuu wa pakiti yake kufanikiwa, na tu wakati safu ya ndani bado inalingana na kile kilichotumwa.
Uingizaji ulioshindwa, sampuli kubwa kupita kiasi au safu iliyobadilishwa wakati wa usafishaji huacha sampuli za ndani mahali pake kwa jaribio linalofuata.
Ukurasa huu hauthibitishi utaratibu uliothibitishwa wa urejeshaji wa wakusanyaji wengi.

Uingizaji wa urejeshaji hubeba vitambulisho vya chanzo cha data, majina, mihuri ya muda na thamani;
haukagui safu hizo dhidi ya migawo ya wakusanyaji. Usitegemee kukataliwa kwa uwasilishaji kwa jumla ili kujilinda dhidi ya migawo ya zamani au wazalishaji wanaopishana.
Thibitisha migawo na hali ya kache kabla ya kuwezesha ukusanyaji.

## Hifadhi haisambazwi

Mtiririko wa kazi uliorithiwa unaotegemea seva mbadala huweka faili za RRD katikati na unatarajia wakusanyaji kuzifikia kupitia seva mbadala ya RRDtool.
Mtiririko huo wa kazi hautumiki katika Kadupul; usiuchukulie kama mwongozo wa usambazaji.
Njia iliyothibitishwa ya hifadhi ya wakusanyaji wengi kwa kutumia RRDtool ya ndani lazima iandikwe kabla ya kupendekeza mbadala.

Hii ndiyo sehemu ambayo watu wanashangazwa nayo mara nyingi, kwa hivyo inafaa kuwa wazi kuihusu.
**Wakusanyaji wa mbali husambaza kusubiri, si uandishi.**
Ikiwa kikomo ulichokumbana nacho kilikuwa diski chini ya mti wa RRD, uwezo wa ziada wa ukusanyaji hauondoi kikomo hicho.
Sampuli nyingi zinazoingia zinaweza kuongeza mrundikano wa hifadhidata kuu na michakato ya uandishi.

## Nini kingine kinachorudi

Mkusanyaji anamiliki hali ya uendeshaji ya vifaa vyake: uwezo wa kufikiwa, hitilafu ya mwisho, nyakati za safari za kwenda na kurudi, hesabu za upigaji kura, na upatikanaji.
Huziandika ndani wakati akipiga kura na kusukuma safu wima teule za uendeshaji kwenye usakinishaji mkuu kwa wingi.
Hii inasasisha safu wima hizo tu, si safu mlalo nzima ya usanidi wa kifaa.

Kwa hivyo kile ambacho usakinishaji mkuu unaonyesha kwa ufikiaji wa kifaa ni mtazamo wa mkusanyaji, kuanzia kusukuma kwa mwisho kulikofanikiwa.
Mkusanyaji ambaye yuko nje ya mtandao ana mtazamo wa sasa wa vifaa vyake mwenyewe ambao hakuna mtu katika usakinishaji mkuu anayeweza kuuona.

Usakinishaji mkuu hufuatilia wakusanyaji kwa njia sawa na mkusanyaji anavyofuatilia vifaa.
Msaidizi wa ukaguzi wa uhai wa mkusanyaji anazingatia mkusanyaji wa mbali aliyewezeshwa yuko hewani tu wakati mhuri wa muda wa hali yake ya mwisho ni chini ya mara mbili ya muda uliosanidiwa wa upigaji kura.
Ukaguzi huu hauthibitishi uwasilishaji wa sampuli, unakili uliofanikiwa au usasa wa grafu.

## Njia za kushindwa

| Nini kinashindwa | Nini kinatokea | Nini unachogundua |
|---|---|---|
| Kiungo cha usakinishaji mkuu | Mkusanyaji anaweza kuendelea ndani wakati hifadhidata yake na kipanga ratiba vinabaki na afya | Grafu zilizochelewa na foleni inayokua; uwasilishaji na upotezaji lazima vikaguliwe |
| Mkusanyaji mwenyewe | Vifaa vyake vilivyopangwa vinaweza kutopigiwa kura tena | Sampuli zinazokosekana; tambua hali ya kipanga ratiba, kifaa na mkusanyaji |
| Unakili | Mkusanyaji huendesha usanidi wa zamani | Mabadiliko yanaonekana kutofanya kazi |
| Hifadhidata kuu | Michakato ya mbali inaweza kuingia katika hali ya nje ya mtandao wakati usanidi wa muunganisho unashindwa | Uingizaji mkuu umevurugika; uhifadhi wa muda wa mbali unategemea afya ya ndani |
| Migawo inayopishana au ya zamani | Zaidi ya mzalishaji mmoja anaweza kuwasilisha sampuli zinazohusiana | Hakuna ukataaji wa uwasilishaji kwa jumla; kagua migawo, mihuri ya muda na hitilafu za uandishi |

Uhifadhi wa muda unaweza kubadilisha baadhi ya kukatika kwa huduma kuwa ucheleweshaji, lakini haufanyi uwasilishaji kuwa bila hasara.
Kagua umri wa foleni, uwezo wa hifadhidata, hitilafu za urejeshaji na mihuri ya muda inayotokana na RRD.
Grafu bapa pekee haiwezi kutofautisha kukatika kwa kifaa na uwasilishaji uliochelewa au ulioshindwa.

## Gharama yake ni nini

Dhidi ya poller mmoja mkuu:

**Unapata** safari sambamba za vifaa kwenye mashine nyingi, upigaji kura unaofanyika karibu na vifaa badala ya kuvuka mtandao mpana (WAN),
na uwezo wa kuendelea na ukusanyaji wa ndani wakati usakinishaji mkuu haupatikani, kulingana na mipaka ya urejeshaji na afya ya ndani iliyo hapo juu.

**Unalipa** kwa unakili wa usanidi unaoweza kuchelewa, hifadhidata ya pili ya kufanya kazi, kufuatilia na kuhifadhi nakala kwa kila mkusanyaji,
hali ya uandishi ulioahirishwa ambayo si ya hiari tena, na hifadhidata kuu ambayo sasa inachukua uandishi unaofanana kutoka kwa kila mkusanyaji.

Muhtasari wa kweli ni kwamba mkusanyaji wa mbali ni mashine kamili ambayo sasa unapaswa kuiendesha.
Poller mmoja mwenye michakato zaidi ni mpangilio tu. Mkusanyaji ni miundombinu, yenye hifadhidata yake,
vitambulisho vyake, saa yake yenyewe, na toleo lake la ukweli kwa muda mrefu ambao unakili haujaendeshwa.
