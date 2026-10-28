---
title: Maswali ya data na fahirisi
description: Jinsi matembezi moja ya kifaa yanavyokuwa vyanzo vingi vya data, nini fahirisi ilivyo hasa, na nini hutokea kifaa kinapojipanga upya nambari.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 5
---

Chanzo cha kawaida cha data kinakuhitaji ujue unachopima kabla ya kukisanidi.
Hiyo inafanya kazi kwa wastani wa upakiaji wa mfumo. Haifanyi kazi kwa milango ya swichi,
diski, vitambuzi vya halijoto, au mashine pepe, kwa sababu orodha inabadilika na huwezi kuidhibiti.

Swali la data hugundua vitu vinavyopatikana. Uundaji wa grafu — iwe kwa mikono au kupitia
uendeshaji otomatiki uliosanidiwa — huchagua ni vitu gani vinavyopata vyanzo vya data; swali
linaloendeshwa pekee haliundi kila grafu inayowezekana.

## Kile ambacho ufafanuzi wa swali una

Swali la data ni maelezo ya XML yenye sehemu tatu: orodha ya vitu inapoishi, nini cha kusoma
kuhusu kila kimoja, na jinsi ya kuamua ni kitu gani kinalingana na kipi.

Swali la kiolesura linalosafirishwa na Kadupul ni mfano wa vitendo. Linatembelea
`.1.3.6.1.2.1.2.2.1.1` ili kuhesabu violesura, na kisha kusoma seti ya sehemu zenye majina
kwenye kila nafasi iliyorudishwa. Kila sehemu hutangaza mwelekeo (direction).

| Mwelekeo | Maana | Mifano ya kiolesura |
|---|---|---|
| `input` | Kusomwa kwa utambulisho na upeaji majina. Haikusanywi kwa wakati | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Thamani inayostahili kukusanywa kila mzunguko | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Zote mbili | `ifOperStatus`, `ifAdminStatus` |

Sehemu pia hutangaza jinsi ya kusoma thamani. Nyingi huichukua jinsi ilivyo; baadhi hutumia
maneno ya kawaida (regular expression) ili kutoa nambari kutoka kwa uhesabuji wa SNMP, na baadhi
huomba thamani itatuliwe kama maandishi badala ya baiti ghafi.

Kuendesha swali huhifadhi safu mlalo moja kwa kila fahirisi kwa kila sehemu: kifaa, swali,
jina la sehemu, thamani, na nafasi ambayo thamani hiyo ilitoka. Jedwali hilo ndilo jibu la
"kifaa hiki kina nini", kilichohifadhiwa kwenye kache hadi uendeshaji unaofuata. Uchaguzi wa
grafu hutumia kache hiyo, lakini zana za uundaji wa grafu zinaweza pia kuambatisha au kuendesha
tena swali. Kagua matokeo ya ugunduzi kabla ya kuongeza grafu.

## Fahirisi ni suala la utambulisho

Nafasi katika jedwali la SNMP si jina. Ni nambari ya slot ambayo wakala hutoa, na mawakala
hupanga upya slots baada ya kuanzisha upya, kurejesha kadi, kuboresha firmware, au mabadiliko
ya usanidi ambayo huondoa kiolesura. Ikiwa chanzo cha data kinakumbuka tu "slot 3", siku ambayo
slot 3 inakuwa mlango tofauti ndiyo siku ambayo miezi mitatu ya historia inajiunga kimya kimya
kwenye kitu kibaya.

Kadupul huhifadhi aina ya fahirisi na thamani ya utambulisho, pamoja na fahirisi ya SNMP
inayotatuliwa sasa. Upangaji upya wa fahirisi hutumia utambulisho huo kutafuta nafasi ya sasa
ya jedwali; aina za fahirisi zilizobatilishwa kwa mikono zina ushughulikiaji tofauti.

Kwenye kila uendeshaji wa swali, hutafuta slot ya sasa ya thamani ya sehemu hiyo.

| Matokeo | Nini hutokea |
|---|---|
| Slot ile ile | Hakuna cha kufanya |
| Slot tofauti | Chanzo cha data kinapangwa upya kwenye slot mpya, na grafu zake hufuata |
| Thamani haipo tena | Ushughulikiaji wa yatima unategemea swali na njia ya msimbo; thibitisha bendera inayotokana na OID za upigaji kura badala ya kudhani ukusanyaji umekoma |

Kupanga upya fahirisi kawaida huhifadhi chanzo cha data na historia yake iliyopo. Chaguo la
`index_transient` huchukulia vitambulisho vilivyokosekana kama inavyotarajiwa na kuruka uwekaji
alama wa kawaida wa yatima. `index_orphan_removal` huondoa maingizo ya upigaji kura yaliyoathiriwa
na matokeo ya Boost; haifuti chanzo cha data au faili ya RRD yenyewe.

Ushughulikiaji wa sasa wa yatima una kasoro: utambulisho unapotea na hakuna chanzo kingine
kinachobadilisha fahirisi, tawi lisilo na mabadiliko linaweza kufuta bendera ya yatima tena huku
likiacha fahirisi ya awali na OID za upigaji kura mahali pake. Usitegemee ufunikaji wa kiotomatiki
wa yatima kuzuia ukusanyaji kutoka kwa fahirisi ya mlango iliyotumiwa tena. Thibitisha utambulisho
uliohifadhiwa dhidi ya data ya ugunduzi na uzime chanzo cha data kilichoathiriwa hadi kitatuliwe.

## Kuchagua sehemu ya kutumia kama ufunguo

Sio kila sehemu inayofaa kuwa ufunguo unaoweza kutumika. Ufafanuzi wa swali hutoa orodha ya
upendeleo iliyoamriwa, na Kadupul huipitia na kuchukua mgombea wa kwanza anayenusurika seti ya ukaguzi.

| Ukaguzi | Kwa nini upo |
|---|---|
| Sehemu ni `input` au `input-output` | Sehemu za utambulisho lazima zipatikane katika ugunduzi |
| Hakuna fahirisi mbili zinazoshiriki thamani sawa | Ufunguo uliorudiwa hauwezi kutambua safu mlalo moja |
| Idadi ya thamani tofauti inalingana na idadi ya fahirisi | Hukataa chanjo isiyo kamili ya watahiniwa |

Ukaguzi huu una vizuizi: mgombea mmoja aliyetangazwa anarudishwa moja kwa moja, na OID ghafi ya
fahirisi inakubaliwa kando. `index_type=nonunique` huruka kukataa kurudiwa lakini hairuki ukaguzi
wa hesabu ya thamani tofauti. Kagua sehemu iliyochaguliwa na thamani zilizohifadhiwa; lebo ya aina
ya XML pekee si uthibitisho wa uthibitishaji.

Swali la kiolesura hupendelea `ifName`, kisha `ifDescr`, kisha anwani ya maunzi, kisha fahirisi
ghafi. Mpangilio huo ni wa makusudi. `ifName` ni fupi na imara kwenye majukwaa mengi. `ifDescr` ni
imara lakini wakati mwingine hubeba nambari ya slot katika maandishi, ambayo inashinda kusudi.
Fahirisi ghafi ni ya mwisho kwa sababu kuifanya ufunguo ni sawa na kutokuwa na ufunguo wowote.

Hapa ndipo sehemu inayowashangaza watu wengi. Chaguo hufanywa kwa kila kifaa kwa kila uendeshaji,
kutoka kwa data ya sasa ya kifaa hicho. Kukosekana kwa thamani zilizohifadhiwa au majina yaliyorudiwa
kunaweza kufanya `ifName` isifae na kusababisha kurudi nyuma kwa `ifDescr`. Sehemu tupu yenyewe
haithibitishi ukaguzi gani ulishindwa; kagua safu mlalo halisi za ugunduzi. Swichi mbili zinazofanana
zinaweza kuishia kuwekewa funguo kwenye sehemu tofauti, na kifaa kinaweza kubadilisha sehemu
inayotumia kati ya maendeshaji. Kadupul hurekodi onyo wakati sehemu iliyochaguliwa inapobadilika,
kwa sababu huo ndio wakati hitilafu za upangaji upya zinawezekana.

Sehemu iliyochaguliwa kawaida pia huipa majina grafu kupitia umbizo la kichwa linaloirejelea. Ikiwa
vichwa vyako vya grafu vinabadilika tabia kwenye mtandao mzima, sehemu ya kupanga ndipo pa kuangalia.

## Kugundua kuwa upangaji upya wa fahirisi unahitajika

Kuendesha tena swali la data dhidi ya kila kifaa kwenye kila mzunguko kungelikuwa ghali na kwa kiasi
kikubwa haina maana, kwani vifaa vingi havibadilishi nambari kwa miaka mingi. Badala yake, kila jozi ya
kifaa na swali hubeba mbinu ya upangaji upya wa fahirisi, ambayo ni uthibitisho wa bei nafuu unaokaguliwa
wakati wa ukusanyaji wa kawaida. Uthibitisho unaposhindwa, upangaji upya wa fahirisi hupangwa foleni.

| Mbinu | Nini inakagua | Vikomo na gharama |
|---|---|---|
| Hakuna (None) | Hakuna uthibitisho wa kiotomatiki | Uendeshaji upya wa maswali lazima utoke kwa hatua ya mwongozo au nyingine iliyo wazi |
| Muda wa kufanya kazi (Uptime) | Muda wa kufanya kazi haujarudi nyuma | Inahitaji SNMP inayoweza kutumika; hukosa mabadiliko bila kurejea kwa muda |
| Hesabu ya Fahirisi (Index Count) | Hesabu ya sasa inalingana na fahirisi zilizohifadhiwa | OID ya hesabu inaweza kuwa ya bei nafuu; bila hiyo utekelezaji huhesabu matokeo ya matembezi au hati. Mabadiliko ya hesabu sawa yanaweza kukosekana |
| Thibitisha Zote (Verify All) | Thamani za ufunguo zinazojulikana bado zinalingana kwenye fahirisi zao zilizohifadhiwa | Kazi huongezeka kulingana na seti iliyohifadhiwa; haitoi hakikisho la ugunduzi wa fahirisi mpya zilizoongezwa au mabadiliko ya kimaana yanayohifadhi thamani hizo |

"Thibitisha Zote" hukagua uthibitisho wakati wa upigaji kura; hairudishi swali lote la ugunduzi bila
masharti kila mzunguko. Pima gharama yake kwenye vifaa vya uwakilishi kabla ya matumizi mapana. Muda
wa kufanya kazi ni chaguomsingi ya kawaida, lakini hautoi uthibitisho wakati SNMP imezimwa. Ufafanuzi
wa swali unaweza kutoa chanzo chake cha muda au hesabu.

## Upangaji upya wa fahirisi hufanyika kwa njia isiyo ya wakati mmoja (asynchronous)

Uthibitisho ulioshindwa haupangi upya fahirisi papo hapo. Huandika amri, na awamu tofauti baada ya
mzunguko wa ukusanyaji huchukua amri hiyo na kuendesha tena swali. Athari za kiutendaji zinafaa kukumbukwa.

Mzunguko unaogundua bado unaweza kutumia kache ya zamani, kwa hivyo thamani inaweza kutua kwenye
mfululizo usio sahihi kabla ya upangaji upya wa fahirisi kukamilika. Ukandamizaji wa miiba unaohusiana
na muda wa kufanya kazi hubadilisha pato la thamani moja na kutojulikana wakati bendera yake imewekwa;
si hakikisho kwa matokeo yote ya thamani nyingi au kila mabadiliko ya fahirisi.

Upangaji upya wa fahirisi hautaendeshwa dhidi ya kifaa kilicho chini au kilichozimwa. Kifaa kilichobadilishwa
nambari kikiwa hakipatikani bado kinahitaji uthibitisho au uendeshaji upya baada ya kupatikana tena.
Upigaji kura wa kwanza uliofanikiwa pekee hauthibitishi kuwa upangaji upya umekamilika. Chaguo la
`--force` halibatilishi ukaguzi wa kifaa kilicho chini/kimezimwa.

Mara tu swali linapoendeshwa tena, vyanzo vya data vilivyohamishwa huandikwa upya maingizo yao ya kache
ya poller, ambayo ndiyo huelekeza ukusanyaji upya. Utaratibu huo ni
[Kache ya poller](/sw/concepts/the-poller-cache/), na uendeshaji upya wa swali ni mojawapo ya mambo
machache yanayoidumisha kiotomatiki.

Kwa upande wa uendeshaji — kuongeza swali kwenye kifaa na kusoma matokeo —, tazama
[Fuatilia swichi](/sw/guides/monitor-a-switch/).
