---
title: "Kadupul ni nini"
description: "Ukusanyaji, hifadhi, usanifu na mipaka ya mradi kwa mipango ya 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha."
---

Kadupul ni programu ya kufuatilia mtandao na kutengeneza grafu. Hukusanya vipimo kupitia SNMP na hati, huhifadhi mfululizo wa muda katika faili za RRD na huchora grafu kwa RRDtool. Muhtasari huu umekaguliwa tarehe 26 Oktoba 2026 dhidi ya marekebisho ya programu yaliyounganishwa hapa chini.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Hali ya mradi kwa 2026–2027

Kadupul iko kabla ya alfa, bila toleo linaloungwa mkono kwa uzalishaji wala njia iliyothibitishwa ya kuhamia uzalishaji. Tumia usakinishaji wa majaribio uliotengwa. Tarehe katika nyaraka hizi ni muktadha wa kupanga, si ahadi za kukabidhi. Kagua hali ya mradi kabla ya kuchagua marekebisho ya kutathmini.

[Hali ya mradi](/sw/project/status/)

## Ukusanyaji na upangaji wa ratiba

Kipangaji cha nje huanzisha poller. Poller husoma orodha iliyoandaliwa ya ukusanyaji, huita kikusanyaji cha PHP au toleo la Spine linalooana, na kuchakata matokeo. Vipindi vya ukusanyaji vinaweza kusanidiwa; dakika tano ni mfano, si kanuni ya kila hali. Kianzishaji kinaweza kuendesha mizunguko mifupi kadhaa ndani ya kipindi chake. Muda wa kusubiri, majaribio ya kurudia na ucheleweshaji wa vifaa vyote hutumia bajeti hiyo ya muda.

[Mzunguko wa poller](/sw/reference/poller-lifecycle/)

## Uhifadhi wa muda na hifadhi

Mpangilio wa hifadhi wa faili ya RRD huchaguliwa inapoundwa. Vipimo vipya vinaweza kubaki na maelezo mengi kuliko thamani za zamani zilizojumlishwa; muda wa kuhifadhi unawekewa mipaka na kumbukumbu zilizosanidiwa. Haihifadhi kila sampuli milele. Thamani zisizojulikana huwakilisha uchunguzi uliokosekana au usiotumika, si sifuri. Foleni za hifadhidata, kumbukumbu za kazi na takwimu zinaweza kukua hata wakati faili zilizopo za RRD zinabaki na ukubwa uleule.

[Vyanzo vya data na kumbukumbu](/sw/concepts/data-sources-and-rras/)

## Grafu na istilahi zinazotumika

Kifaa ni sehemu ya mwisho inayofuatiliwa. Hoja ya data hugundua vipengee kama violesura. Chanzo cha data hueleza kipimo na hifadhi yake; grafu hueleza namna ya kuonyesha data. Violezo hurudia matumizi ya ufafanuzi na miti hupanga urambazaji. Hizi ni rekodi tofauti: kagua chaguo za kufuta na vitegemezi kabla ya kuziondoa. Grafu hutengenezwa kutoka data iliyohifadhiwa zinapoombwa; kache ya picha inaweza kutumia tena matokeo yaliyokwisha kuchorwa.

[Kamusi ya istilahi](/sw/reference/glossary/)

## Vipengele vya usakinishaji

Usakinishaji unaofanya kazi unachanganya programu ya wavuti ya PHP, MySQL au MariaDB, hifadhi ya RRD, RRDtool na kianzishaji cha ukusanyaji. Vitambulisho vya vifaa na usanidi vipo kwenye hifadhidata au faili za usanidi zilizolindwa. Hifadhi nakala za msimbo, usanidi, foleni za hifadhidata na historia ya RRD kama seti inayolingana, kisha fanya mazoezi ya urejeshaji. Nakala ya hifadhidata pekee hairudishi grafu za historia.

[Nakala rudufu na urejeshaji](/sw/guides/back-up-and-restore/)

## Main na uhamishaji wa Symfony

Tawi la programu `main` linahitaji PHP 8.4 au mpya zaidi na huchanganya huduma za Symfony 7.4 na sehemu za kuingilia za awali za wavuti, poller na CLI. Tawi la matengenezo `lts/1.2` lina mahitaji tofauti. Njia zilizohamishwa na za awali zipo pamoja; kuwepo kwa huduma ya Symfony hakuthibitishi kuwa mtiririko wa zamani umestaafishwa. Nakala za msimbo chanzo zinahitaji vitegemezi vya PHP vilivyofungwa na rasilimali za kivinjari zilizozalishwa. Tumia mazingira yaliyo kwenye `mise.toml` ya programu.

[Mwongozo wa uhamishaji](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Akaunti, programu-jalizi na ufikiaji wa hifadhi

Kuonekana kwa vifaa na grafu kunategemea ruhusa za watumiaji na vikundi. Programu-jalizi huendeshwa kama msimbo wa programu unaoaminika wenye ufikiaji wa akaunti ya mchakato; hazitengwi katika sandbox. Kagua asili, hooks na tabia ya kusakinisha na kuondoa kabla ya kuziwezesha. Michakato inayoandika RRD za ndani kwenye Unix inahitaji ukaguzi wa utambulisho wa POSIX na mipangilio ya wazi ya uaminifu wakati akaunti za wavuti na poller zinatofautiana. Windows haiungi mkono matengenezo yanayoweza kuharibu RRD za ndani.

[Tathmini ya programu-jalizi](/sw/guides/install-and-vet-plugins/)

## Matumizi yanayofaa na mipaka

Tathmini Kadupul kwa violesura vya mtandao, vihesabu vya vifaa, vihisi vya mazingira na vipimo vingine vinavyopatikana kwa mbinu za ukusanyaji unazoweza kuthibitisha. Ni programu ya kujihostia inayohitaji matengenezo ya hifadhidata, wavuti na kipangaji. Ukusanyaji wa nambari wa msingi si hifadhi ya kumbukumbu za matukio, mfumo wa ufuatiliaji uliosambazwa wala injini ya jumla ya hoja za lebo zenye idadi kubwa ya thamani tofauti. Arifa za viwango hutegemea programu-jalizi zinazofaa; thibitisha uoanifu wake badala ya kudhani arifa zinafanya kazi mara tu baada ya kusakinisha.

## Asili, jina na uoanifu

Kadupul ni tawi huru la Cacti lenye leseni ya GPL-3.0-or-later, bila uhusiano wa kiushirika au idhini ya The Cacti Group. Jina lake la Kisinhala, කඩුපුල්, linarejelea *Epiphyllum oxypetalum*, kaktasi inayochanua usiku. Kuhifadhi violesura vya programu-jalizi, violezo, miundo ya hifadhidata na historia iliyopo ya RRD ni lengo la toleo linalohitaji ushahidi kwa kila marekebisho ya chanzo na mchanganyiko wa programu-jalizi.

[Uoanifu](/sw/project/compatibility-with-cacti/)

## Anza na kifaa kimoja kilichothibitishwa

Fuata usakinishaji, kifaa cha kwanza na grafu ya kwanza kwa mpangilio huo. Kagua kumbukumbu, mihuri ya muda ya ukusanyaji na thamani zinazotumika kabla ya kuamini picha. Pima muda wa mzunguko na kazi iliyo kwenye foleni kwa vifaa vyako kabla ya kupanua. Tumia dhana kuelewa usanifu na mahitaji kujua masharti ya kuanza.

[Usakinishaji](/sw/start/install/) · [Kifaa cha kwanza](/sw/start/first-device/) · [Grafu ya kwanza](/sw/start/first-graph/) · [Dhana](/sw/concepts/architecture/) · [Mahitaji](/sw/reference/requirements/)
