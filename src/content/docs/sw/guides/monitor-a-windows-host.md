---
title: Kufuatilia Seva Pangishi ya Windows
description: Kuunda grafu za CPU, diski, violesura, na muda wa kufanya kazi kwenye Windows kupitia huduma ya SNMP, ni vipengee vipi vya rasilimali za seva pangishi vinavyobeba data, na nini cha kufanya wakati SNMP haipatikani.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 14
---

:::caution[Thibitisha kabla ya matumizi]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Windows kupitia SNMP hutoa violesura, vichakataji, hifadhi, na baadhi ya kaunta. Wakala aliyejengewa ndani wa Microsoft hafichui vipengee vya mzigo, kumbukumbu, na diski vya violezo vya net-snmp UCD. Kumbukumbu bado inaweza kuonyeshwa kutoka safu mlalo za hifadhi ikiwa wakala anazifichua. Mawakala wa watu wengine wanaweza kutoa vipengee vingine; kagua wakala halisi kabla ya kuchagua violezo.

## Kile ambacho huduma ya SNMP hutoa

Huduma ya Windows SNMP imepitwa na wakati na ni ya hiari. Kwa Windows 10 na 11, Microsoft huandika usakinishaji wake kupitia vipengele vya hiari au vipengele vya Windows; hitilafu ya awali ya jina la kipengele cha DISM pekee haithibitishi kuwa haipatikani. Angalia maagizo yanayofaa kwa toleo lako la Windows. Tazama [mwongozo wa usakinishaji wa SNMP wa Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Angalia ni ipi kati ya miti hii midogo ambayo wakala wako aliyesakinishwa anaifichua:

| Eneo | Mti mdogo | Hutoa |
|---|---|---|
| Mfumo | `.1.3.6.1.2.1.1` | Maelezo, muda wa kufanya kazi, mawasiliano, jina, eneo |
| Violesura | `.1.3.6.1.2.1.2` na `.1.3.6.1.2.1.31` | Trafiki, makosa, hali |
| Rasilimali za seva pangishi | `.1.3.6.1.2.1.25` | Vichakataji, hifadhi, idadi ya michakato, watumiaji walioingia |
| LAN Manager | `.1.3.6.1.4.1.77` | Data ya huduma na hisa za Windows |

Violezo vya Windows vilivyotolewa na Kadupul vinasoma maeneo matatu ya kwanza. Hakuna chochote katika seti iliyotolewa kinachosoma mti mdogo wa LAN Manager.

Vipengee viwili vya usanidi kwenye seva pangishi huamua ikiwa unapokea data: mfuatano wa jumuiya na orodha ya wasimamizi ambao wakala anakubali pakiti kutoka kwao. Seva pangishi iliyowekwa kukubali SNMP kutoka kwa anwani moja tu ya msimamizi itajibu msimamizi huyo pekee na kuacha mengine yote.

Thibitisha kila eneo kutoka kwa seva pangishi ya poller kabla ya kuunda grafu. Badilisha seva pangishi ya mfano na jumuiya na thamani zako zilizosanidiwa; `public` ni kwa madhumuni ya kielelezo pekee.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Mzunguko wa pili (walk) unasoma mzigo wa kichakataji, wa tatu unasoma orodha ya maelezo ya hifadhi. Ikiwa amri ya kwanza inafanya kazi na zingine mbili hazirudishi chochote, angalia vikwazo vya ufikiaji, usaidizi wa wakala, na hitilafu ya SNMP iliyorudishwa.

## Kuongeza kifaa

Ingiza `install/templates/Windows_Device.xml.gz` ikiwa violezo havipo, kulingana na [Kuingiza na kuhamisha violezo](/sw/guides/import-and-export-templates/). Chagua kiolezo cha kifaa cha Windows, thibitisha ugunduzi wa dodoso, kisha uunde waziwazi grafu unazotaka. Kifurushi kina dodoso tatu za data na violezo vyake vya grafu vinavyohusiana.

| Dodoso la data | Huungwa mkono na | Husoma |
|---|---|---|
| SNMP - Takwimu za violesura | `resource/snmp_queries/interface.xml` | `IF-MIB`, inavinjariwa moja kwa moja |
| SNMP - Pata taarifa za kichakataji | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` kupitia `scripts/ss_host_cpu.php` |
| SNMP - Pata sehemu za kupachika | `resource/script_server/host_disk.xml` | `hrStorageTable` kupitia `scripts/ss_host_disk.php` |

Dodoso za diski na kichakataji ni dodoso za seva ya hati licha ya majina yao. Zinaendeshwa katika mchakato tofauti wa seva ya hati ya PHP unaoendelea kwa muda mrefu na hupiga simu za SNMP na kitambulisho cha rekodi ya kifaa. Dodoso la kiolesura ni dodoso safi la SNMP. Matokeo ya kiutendaji ni kwamba seva ya hati ya PHP inayoshindwa husimamisha ukusanyaji wa diski na CPU kwenye Windows wakati grafu za kiolesura zinaendelea kufanya kazi.

## Unachopata bila dodoso la data

Violezo viwili vya grafu kila kimoja kinasoma OID moja isiyobadilika.

| Grafu | OID | Imehifadhiwa kama |
|---|---|---|
| MIB ya seva pangishi - Michakato | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB ya seva pangishi - Watumiaji walioingia | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Zingine mbili hazisomi chochote kutoka kwa kifaa. Grafu za muda wa kufanya kazi na muda wa kupiga kura huita `scripts/ss_hstats.php` na kurudisha safu wima kutoka kwa rekodi ya kifaa cha Kadupul yenyewe: `snmp_sysUpTimeInstance` kwa muda wa kufanya kazi, muda uliorekodiwa wa kupiga kura kwa muda wa dodoso. Zinasoma vipimo vilivyohifadhiwa, si jibu jipya la SNMP moja kwa moja.

## Jedwali za rasilimali za seva pangishi

### Vichakataji

`hrProcessorLoad` chini ya `.1.3.6.1.2.1.25.3.3.1.2` hurudisha ingizo moja kwa kila kichakataji mantiki ambacho wakala anakifichua. Mzunguko hutoa fahirisi; usidhani idadi ya safu mlalo inalingana kila wakati na idadi iliyotangazwa ya nyuzi za maunzi.

Thamani tayari ni asilimia. MIB inafafanua kama wastani wa dakika iliyopita. Tazama [ufafanuzi wa Host Resources MIB](https://www.rfc-editor.org/rfc/rfc2790.html).

### Hifadhi

Dodoso la hifadhi lililotolewa hutumia `hrStorageTable` chini ya `.1.3.6.1.2.1.25.2.3.1`. Inasoma safu sita.

| Safu | OID | Mwelekeo |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Fahirisi |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Fahirisi na lebo inayoonyeshwa |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Ingizo, kizidishi |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Toleo |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Toleo |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Toleo |

Saizi na nafasi iliyotumika ni hesabu za kitengo cha ugawaji, si baiti. Hati huzidisha kila thamani kwa saizi ya kitengo cha ugawaji iliyohifadhiwa kwa fahirisi hiyo wakati thamani zote mbili ni halali.

Mambo mawili mara kwa mara husababisha matatizo kwenye Windows.

**Jedwali si orodha ya diski kuu.** Wakala huripoti chochote anachoona kama hifadhi. Kulingana na wakala, kumbukumbu halisi na kumbukumbu pepe zinaweza kuonekana kando ya anatoa zilizowekwa. Lebo kama vile `C:\`, `D:\`, `Physical Memory`, na `Virtual Memory` ni mifano, sio safu mlalo zilizohakikishwa. Chagua safu mlalo unazotaka kuweka kwenye grafu.

**Thamani kubwa au batili za hifadhi zinahitaji uthibitishaji.** MIB inafafanua saizi na matumizi kama Integer32 isiyo hasi. Wakala anayerudisha thamani hasi yuko nje ya safu hiyo. Hati ya sasa inatumia `(abs(value) + 2147483647) * allocation_units`, ambayo haiwakilishi tafsiri mpya ya 32-bit isiyo na saini. Shughulikia thamani zilizoathiriwa kama zisizoaminika na fanya upya fahirisi baada ya kurekebisha ugunduzi. Tazama [kasoro ya ubadilishaji wa hifadhi](https://github.com/kadupulhq/kadupul/issues/243).

## Ambapo Windows inatofautiana na Linux

| Kipengele | Linux yenye net-snmp | Wakala wa Windows aliyejengewa ndani / violezo vilivyotolewa |
|---|---|---|
| Wastani wa mzigo | `.1.3.6.1.4.1.2021.10.1.3` | Hakuna vipengee vya wastani wa mzigo wa UCD |
| Kumbukumbu | `.1.3.6.1.4.1.2021.4` | Inaweza kuonyeshwa kutoka safu mlalo za `hrStorage` zilizofichuliwa |
| CPU | Asilimia za UCD au `hrProcessorLoad` | `hrProcessorLoad` pekee |
| Orodha ya diski | Iliyotangazwa na wewe kupitia `dskTable` au `hrStorage` | `hrStorage` pekee, bila kuchujwa |
| I/O ya diski | `diskIOTable` | Hakuna chochote kilichotolewa kinachosoma hii |
| Majina ya violesura | Majina ya kernel, mafupi | Maelezo marefu ya adapta, mara nyingi yanarudiwa |

Wakala wa Microsoft aliyejengewa ndani hatoi mti mdogo wa UCD `.1.3.6.1.4.1.2021`. Tazama [Kutatua data inayokosekana](/sw/guides/troubleshoot-missing-data/).

### Violesura

Dodoso la kiolesura ni sawa na lile linalotumiwa na swichi. Mpangilio wake wa upendeleo wa fahirisi ni `ifName`, kisha `ifDescr`, kisha `ifHwAddr`, kisha `ifIndex`. Huchagua sehemu ya kwanza iliyopo na ya kipekee kwenye kila kiolesura kilichogunduliwa.

Windows ndio jukwaa ambalo hili hushindwa mara nyingi zaidi. NIC mbili zinazofanana zinaweza kurudisha `ifDescr` sawa, na baadhi ya mawakala huacha `ifName` tupu. Wakati dodoso inarudi nyuma kwa `ifIndex`, historia ya kiolesura chako inafungwa kwa nambari ambayo Windows iko huru kuikabidhi tena.

Tazama [Kufuatilia swichi](/sw/guides/monitor-a-switch/) na [Dodoso za data na fahirisi](/sw/concepts/data-queries-and-indexes/).

## Wakati SNMP haipatikani

Usakinishaji mwingi wa Windows hauna huduma ya SNMP iliyowezeshwa. Kibadala chake ni ingizo la hati.

Mambo mawili huamua jinsi unavyoandika hati.

**Hati huendeshwa kwenye mashine ambapo poller inafanya kazi.** Kufikia seva pangishi ya Windows ni kazi ya hati yako: WinRM, wakala, mwisho wa HTTP, hisa, au mfumo wowote unaotumia.

**Toa vipimo kwenye toleo la kawaida.** Njia ya amri ya nje ya poller ya PHP haitumii hali ya kutoka kama thamani ya kipimo. Toa nambari, au `U` kwa hakuna kipimo katika mzunguko huu. Usitoe `0` wakati unakusudia kuashiria kuwa kipimo kimeshindwa.

Ikiwa unahitaji thamani kwa kila kiolesura, kwa kila diski, au kwa kila huduma badala ya nambari moja, mfumo huo huo wa hati hutoa muundo ulioorodheshwa. `resource/script_queries/host_cpu.xml` ni mfano wa vitendo unaoita hati ya PHP badala ya seva ya hati.

Tazama [Kuandika hati ya ukusanyaji wa data](/sw/guides/write-a-data-collection-script/) kwa mkataba wa toleo na vikwazo vya majina.

## Njia za kushindwa

| Dalili | Sababu ya kawaida |
|---|---|
| Maelezo ya mfumo yamesomwa, hakuna kingine kinachokusanywa | Angalia usaidizi wa kitu, vikwazo vya ufikiaji, na hitilafu maalum ya SNMP |
| Hakuna jibu kabisa kutoka kwa seva pangishi iliyo mtandaoni | Orodha ya wasimamizi wanaokubaliwa na wakala au sheria ya ngome ya seva pangishi kwenye UDP 161 |
| Orodha ya sehemu inajumuisha kumbukumbu | Inatarajiwa; wakala huripoti kumbukumbu kama hifadhi |
| Kiasi kikubwa kinaonekana hasi au hakijulikani | Thamani batili za wakala au vitengo vya zamani vya ugawaji; angalia hitilafu inayojulikana |
| Diski na CPU zinasimama, violesura vinaendelea | Hitilafu ya seva ya hati; dodoso la kiolesura hailitumii |
| Violezo vya Net-snmp vimepewa, kila kipimo hakijulikani | Wakala aliyechaguliwa hatoi vipengee vya UCD vinavyohitajika kwa violezo hivyo |
| Historia ya kiolesura inafuata adapta isiyo sahihi baada ya mabadiliko | Fahirisi ilirudi kwa `ifIndex` kwa sababu majina yalikuwa tupu au yalirudiwa |
| Muda wa kufanya kazi unarudia thamani ya zamani | Angalia ikiwa rekodi ya kifaa imepitwa na wakati; msaidizi hahesabu uptime mbele |
