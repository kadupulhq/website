---
title: Usanifu
description: Sehemu nne zinazofanya kazi, na ni ipi ambayo kwa kawaida huwa na hitilafu.
sidebar:
  order: 1
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
---

:::caution[Tabia iliyorithiwa ya proksi ya RRDtool]
Usambazaji wa proksi ya RRDtool hautumiki katika Kadupul. Tumia hifadhi ya ndani ya RRDtool
(`storage_location = 0`). Mipangilio ya proksi, maelezo ya itifaki na mtiririko wa kazi
kwenye ukurasa huu unaandika tabia iliyorithiwa, si njia ya usambazaji au uhamiaji inayoungwa
mkono. Tazama [Proksi ya RRDtool](/sw/reference/rrdproxy/).
:::

Programu ya wavuti ya Kadupul, hifadhidata, ukusanyaji ulioratibiwa na hifadhi ya RRD vina
kazi tofauti, lakini njia zao za utekelezaji hupishana. Kujua ni operesheni ipi iliyofeli
husaidia kupunguza wigo wa uchunguzi; kiolesura kinachofanya kazi hakithibitishi kuwa ukusanyaji unafanya kazi.

**Kiolesura cha wavuti** ni programu ya PHP. Inasimamia usanidi na kutoa au
kutumikia grafu zilizohifadhiwa kwenye kache. Baadhi ya vitendo vya wavuti pia huanzisha ukusanyaji, kama vile maombi ya grafu ya muda halisi, na maombi ya kawaida ya grafu yanaweza kuanzisha masasisho ya RRD yanayosubiri.

**Hifadhidata** inashikilia usanidi, ruhusa, hali ya uendeshaji, kache ya poller
na foleni za vipimo. Thamani zilizokusanywa zinaweza kubaki humo zikingojea kuandikwa kwenye RRD au kujaribu tena; si hifadhi ya usanidi pekee.

**Poller** inaratibu kazi zilizoratibiwa na michakato tanzu ya ukusanyaji. Matokeo hupitia
kwenye foleni za hifadhidata kabla ya mwandishi wa kawaida au aliyecheleweshwa kusasisha faili za RRD.

**Faili za RRD** zinashikilia mfuatano wa kihistoria wenye mipaka. Chanzo cha data kwa kawaida kina RRD moja
inayoshikilia nyanja zake; uundaji wa grafu unaweza kutumia tena vyanzo, na kuunda metadata
hakuhakikishii kwamba faili tayari ipo.

## Mipaka

| Mpaka | Kinachovuka | Kinachobeba |
|---|---|---|
| Kiolesura hadi hifadhidata | Usanidi, vipindi, uidhinishaji, kazi zilizohifadhiwa kwenye kache na data ya uendeshaji | SQL; hifadhidata inaweza kuwa ya mbali |
| Kiolesura hadi faili | Usomaji wa grafu, picha za kache, na uundaji au masasisho ya RRD ya hiari yanayostahili | Mfumo wa faili na RRDtool |
| Poller hadi hifadhidata | Orodha za kazi, thamani zilizokusanywa, foleni zilizohifadhiwa, hali na vihesabu vya kushuka | SQL |
| Ukusanyaji hadi vifaa | SNMP, hati za ukusanyaji na ukaguzi wa uwezo wa kufikia | Amri za mtandao au za ndani; ukusanyaji unaoanzishwa na wavuti unawezekana pia |
| Mwandishi hadi faili | Sampuli zilizopangwa kwa vikundi, pengine mihuri kadhaa ya muda kwa kila sasisho | Amri za RRDtool na mifereji iliyothibitishwa |
| Seva ya hifadhidata hadi faili za RRD | Hakuna sasisho la moja kwa moja la RRD katika njia ya kawaida ya programu | Msimbo wa mwandishi wa programu huratibu hifadhi hizi mbili |

Safu mlalo za hifadhidata huhusisha chanzo cha data na kifaa pamoja na njia ya faili iliyosanidiwa.
Faili za RRDtool hufafanua mfuatano na nyaraka; hazichukui nafasi ya ramani hiyo ya programu. Trafiki ya mtandao haikomei tu kwenye upigaji kura wa vifaa: miunganisho ya hifadhidata,
wakusanyaji wa mbali na miunganisho mingine iliyosanidiwa inaweza kuvuka seva nyingine pia.

Hifadhi nakala ya hali ya hifadhidata, sampuli zinazosubiri na faili za RRD kwa uthabiti. Urejeshaji wa hifadhidata pekee haurejeshi maudhui ya kihistoria ya RRD, na urejeshaji wa faili pekee huacha usanidi na sampuli ambazo hazijamwagwa. Kuhamisha faili bila kupatanisha njia kunaweza kusababisha makosa ya kukosekana kwa faili au maandishi yaliyobaki; si hitilafu ya ukusanyaji tulivu iliyohakikishwa. Tazama [Kuhifadhi nakala na kurejesha](/sw/guides/back-up-and-restore/) na [Kuhamia kwenye maunzi mapya](/sw/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Kwa nini historia ya muda mrefu hutumia faili za RRD

Historia ya grafu ya muda mrefu huhifadhiwa katika faili za RRD, lakini foleni za vipimo ziko kwenye hifadhidata.
Foleni ya kawaida ya wakati wa kuruka ni InnoDB katika toleo hili, na maandishi yaliyoahirishwa huhifadhi
sampuli katika majedwali ya Boost. Maandishi yaliyoshindwa au uwasilishaji uliochelewa wa mbali unaweza kukuza foleni hizo. Tazama [Maandishi ya ujazo wa juu](/sw/concepts/high-volume-writes/).

RRD hutenga idadi maalum ya safu mlalo katika maazimio yaliyoteuliwa. Masasisho ya kawaida
hutumia tena nafasi hiyo badala ya kuongeza historia bila kikomo. Ukubwa wa faili una mipaka
kwa muundo ambao haujabadilika; kuongeza vyanzo vya data, kubadilisha miundo, kuhifadhi nakala za urejeshaji au kukusanya foleni bado huongeza mahitaji ya jumla ya hifadhi.

Mbadala wake ni uhifadhi uliochaguliwa mapema. Mara tu historia ya kina inapokwisha muda wake au
kujumuishwa, mabadiliko ya baadaye ya muundo hayawezi kuunda upya maelezo yaliyotupwa. Tazama
[Vyanzo vya data na kumbukumbu za round-robin](/sw/concepts/data-sources-and-rras/).

Usanidi na hali ya uendeshaji hutumia hifadhidata kwa sababu programu inahitaji
masasisho ya pamoja na maswali ya kimahusiano. Hii haimaanishi kuwa kila uhusiano
unatekelezwa na ufunguo wa kigeni wa hifadhidata, au kwamba hifadhi ya safu mlalo lazima ikue milele;
inaeleza mgawanyo wa majukumu ya programu hii.

## Njia mbili, zinazoshiriki sehemu mbili

Ombi la kawaida la ukurasa au grafu hufuata njia hii:

1. Kivinjari hutuma ombi; PHP hupakia usanidi na kuunganisha kwenye hifadhidata.
2. Ombi hutumia uthibitishaji na uidhinishaji wa eneo/kitu husika.
3. Vitendo vya dashibodi husoma au kusasisha usanidi na vinaweza kuanzisha kazi ya ziada.
4. Ombi la grafu linaweza kuangalia sampuli za Boost zinazosubiri na kache ya picha, au kuunganisha
   amri ya RRDtool na kusoma faili zilizosanidiwa. Tazama
   [Jinsi grafu zinavyochorwa](/sw/concepts/how-graphs-are-drawn/).
5. Maombi ya grafu ya muda halisi yanaweza kuzindua mkusanyaji wa muda halisi na kutumia data tofauti
   ya muda mfupi. Grafu iliyo tambarare pekee haithibitishi faili tupu au ukusanyaji na uchoraji uliofanikiwa.

Mzunguko wa ukusanyaji ulioratibiwa hufuata njia hii:

1. Mratibu huanzisha poller, ambayo huangalia hali ya kuwezeshwa, muda na hifadhi.
2. Huchagua kazi inayostahili kutoka kwenye kache ya poller na kuzindua michakato tanzu ya wakusanyaji.
3. Michakato tanzu huuliza vifaa au huendesha hati za ukusanyaji na kuweka matokeo kwenye hifadhidata.
4. Mwandishi husika huchakata sampuli zilizowekwa katika vikundi, akitumia foleni zilizoahirishwa
   zinaposanidiwa na kuhifadhi hitilafu zinazoweza kujaribiwa tena.
5. Hali ya uendeshaji na hali ya upangaji zinasasishwa kwenye hifadhidata.

Tazama [Mzunguko wa maisha wa poller](/sw/reference/poller-lifecycle/) kwa mpangilio na ushughulikiaji wa hitilafu.
Njia hizi hushiriki rasilimali za hifadhidata na hifadhi na zinaweza kushindania rasilimali hizo. Kuanzisha upya
seva ya wavuti hakurekebishi poller iliyoratibiwa kando, lakini maombi ya wavuti yanaweza
kushiriki katika ukusanyaji na uandishi; tambua mchakato halisi unaofeli.

## Kinachoendeshwa kama mtumiaji gani

| Mchakato | Huendeshwa kama | Huanzishwa na |
|---|---|---|
| Programu ya wavuti ya PHP | Seva ya wavuti au akaunti ya bwawa la PHP-FPM | Seva ya wavuti |
| Poller iliyoratibiwa | Akaunti iliyosanidiwa ya mratibu | cron, Task Scheduler, au huduma iliyosanidiwa |
| RRDtool | Kwa kawaida hurithi akaunti ya mchakato ulioianzisha | Njia ya wavuti, ya poller au ya matengenezo |
| Hati za ukusanyaji | Kwa kawaida hurithi akaunti ya mkusanyaji wao | Ukusanyaji ulioratibiwa au ulioanzishwa na wavuti |

Akaunti zote za waandishi zinazoshiriki zinahitaji ufikiaji unaofaa kwa hifadhi iliyosanidiwa.
Uundaji wa kawaida wa chanzo cha data huandika metadata; RRD inaweza kuundwa baadaye wakati
mwandishi anapoihitaji. Faili inayokosekana inaweza kuonyesha kuwa ukusanyaji haujafikia
hatua hii, pamoja na hitilafu ya njia, uaminifu, ruhusa au uundaji.

Baadhi ya njia za uundaji zinazoendeshwa na root hujaribu kutumia mmiliki na kikundi cha saraka ya RRA.
Majaribio haya yanaweza kushindwa na kuweka makosa kwenye kumbukumbu; si mbadala wa kusanidi
akaunti za huduma kwa usahihi. Umiliki usio wa root hufuata sheria za mfumo wa uendeshaji,
ikiwa ni pamoja na urithi wa kikundi cha saraka na ACL. Thibitisha ruhusa za hifadhi na
mipangilio ya nambari ya UID/GID inayoaminika chini ya kila akaunti ya mwandishi wa wavuti na ya poller. Tazama
[Boresha kwa usalama](/sw/guides/upgrade-safely/).

Utekelezaji wa PHP ICMP uliokaguliwa huita matumizi ya ping ya mfumo wa uendeshaji.
Uwezo wake wa kutuma uchunguzi unategemea matumizi hayo na sera ya mfumo wa uendeshaji; uwepo wa
wasaidizi wa urithi wa UID madhubuti haumaanishi kuwa kila uchunguzi wa ICMP huinua PHP kuwa root.
Usiendeshe programu kama root ili tu kuwezesha ping. Angalia amri halisi,
akaunti na matokeo ya hitilafu; ukaguzi wa TCP au UDP una semantiki tofauti za uwezo wa kufikiwa.

## Orodha ya kazi huhesabiwa mapema

Kache ya poller huhifadhi kazi ya ukusanyaji iliyotatuliwa ili kila mzunguko usihitaji kupata kila
amri kutoka kwa mahusiano ya violezo. Shughuli za usanidi zinaweza kujenga upya vipengee vilivyoathirika; zana za wazi za kujenga upya zinapatikana inapohitajika.

Mabadiliko yanayowakilishwa katika nyanja zilizohifadhiwa kwenye kache yanahitaji kufikia vipengee hivyo kabla ya ukusanyaji kuvitumia. Mipangilio mingine husomwa kando, kwa hivyo si kila mabadiliko ya usanidi
yanahitaji ujenzi upya wa kache kwa mikono. Kagua yaliyomo kwenye kache, makosa ya ukusanyaji na hali ya
kuiga ya mbali badala ya kudhani sababu moja. Tazama
[Kache ya poller](/sw/concepts/the-poller-cache/) na
[Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/)."

## Pale ambapo mambo huvunjika kwa kawaida

| Dalili | Ukaguzi muhimu |
|---|---|
| Kiolesura kinafanya kazi, grafu ni tambarare | Mratibu anaendeshwa, makosa ya ukusanyaji, foleni, ubichi wa sampuli na dirisha la grafu |
| Poller inaendeshwa, faili hazisongi mbele | Uthibitishaji/makosa ya mwandishi, uaminifu na ruhusa za hifadhi, mrundikano ulioahirishwa |
| Chanzo kimoja cha data kiko tambarare | Majibu ya kifaa, safu ya kache, ramani ya faili, sampuli zisizojulikana na maneno ya uchoraji |
| Mabadiliko ya usanidi yanaonekana kutofanya kazi | Matokeo ya kuhifadhi, ubatilishaji wa violezo, vipengee vya kache vilivyoathirika na uigaji |
| Mapengo ya mara kwa mara | Muda, mpigo wa moyo (heartbeat), muda wa kuisha, upatikanaji wa kifaa na hitilafu za uandishi |
| Umbo la grafu lisilotarajiwa | Amri iliyotengenezwa, chaguo za CDEF/CF, data halisi ya faili, kache ya picha na ramani |
| Historia ya mlango inaonekana imeunganishwa kwenye kiolesura kingine | Utambulisho wa swali, ubadilishaji wa nambari na matokeo ya kuorodhesha upya |
| Akaunti inaona dashibodi lakini hakuna grafu | Eneo la ukurasa wa grafu, uidhinishaji wa kitu na utambulisho wa grafu ulioombwa |
| Wakusanyaji wanatofautiana | Ugawaji, usanidi ulioigwa, ubatilishaji wa ndani na hali ya muunganisho |
| Kila kitu ni polepole | Msubiri wa hifadhidata, ushindani wa mwandishi/hifadhi, muda wa uendeshaji wa mkusanyaji na mzigo wa wavuti |
| Metadata ya chanzo cha data ipo lakini faili haipo | Ukusanyaji/uandishi wa kwanza, njia iliyosanidiwa, makosa ya uaminifu na uundaji |

Hivi ni vituo vya kuanzia, si utambuzi kamili. Fuata ushahidi katika mpaka husika
na uthibitishe matokeo baada ya mabadiliko. Tazama
[Tatua data inayokosekana](/sw/guides/troubleshoot-missing-data/).
