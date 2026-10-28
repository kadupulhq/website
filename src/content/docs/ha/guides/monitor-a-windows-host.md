---
title: Kula da Mai Masaukin Windows
description: Zana jadawalin CPU, fayafai, hanyoyin sadarwa, da lokacin aiki akan Windows ta hanyar sabis na SNMP, waɗanne abubuwan albarkatun mai masauki ke ɗaukar bayanai, da abin da za a yi lokacin da babu SNMP.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 14
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen saki na Kadupul ko hanyar ƙaura. Gwada waɗannan matakan akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Windows akan SNMP yana ba da hanyoyin sadarwa, na'urori masu sarrafawa, ajiya, da wasu ƙididdiga. Wakilin Microsoft da aka gina a ciki baya bayyana nauyin, ƙwaƙwalwa, da abubuwan diski na samfuran net-snmp UCD. Ana iya tsara ƙwaƙwalwar ajiya daga layuka na ajiya idan wakili ya bayyana su. Wakilai na ɓangare na uku na iya samar da wasu abubuwa; duba ainihin wakili kafin zabar samfura.

## Abin da sabis na SNMP ke bayarwa

Sabis na Windows SNMP ya tsufa kuma na zaɓi ne. Don Windows 10 da 11, Microsoft ya rubuta shigarwar sa ta hanyar fasali na zaɓi ko fasalin Windows; kuskuren sunan fasalin DISM na baya shi kaɗai baya tabbatar da cewa babu shi. Bincika umarnin da suka dace da bugun Windows ɗin ku. Duba [jagorar shigarwa na SNMP na Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Bincika wanne daga cikin waɗannan ƙananan bishiyoyin wakilin ku da aka shigar ya bayyana:

| Yanki | Ƙaramar bishiya | Yana bayarwa |
|---|---|---|
| Tsari | `.1.3.6.1.2.1.1` | Bayani, lokacin aiki, lamba, suna, wuri |
| Hanyoyin sadarwa | `.1.3.6.1.2.1.2` da `.1.3.6.1.2.1.31` | Zirga-zirga, kurakurai, matsayi |
| Abubuwan masauki | `.1.3.6.1.2.1.25` | Masu sarrafawa, ajiya, ƙididdigar tsari, masu amfani da suka shiga |
| LAN Manager | `.1.3.6.1.4.1.77` | Sabis na Windows da raba bayanai |

Samfuran Windows da Kadupul ke bayarwa suna karanta yankuna uku na farko. Babu wani abu a cikin saitin da aka kawo wanda ke karanta ƙaramar bishiyar LAN Manager.

Abubuwan daidaitawa guda biyu akan mai masaukin suna yanke shawarar ko kun karɓi bayanai: kirtani na al'umma da jerin manajojin da wakili ke karɓar fakiti daga gare su. Mai masaukin da aka saita don karɓar SNMP kawai daga adireshin manaja ɗaya zai amsa wannan manajan kawai kuma ya sauke duk wani abu.

Tabbatar da kowane yanki daga mai masaukin poller kafin ƙirƙirar zane-zane. Sauya misali mai masauki da al'umma tare da ƙimar da kuka saita; `public` na kwatanci ne kawai.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Tafiya ta biyu (walk) tana karanta nauyin processor, na uku yana karanta jerin bayanin ajiya. Idan umarnin farko yana aiki kuma sauran biyun ba su dawo da komai ba, duba ƙuntatawar shiga, tallafin wakili, da kuskuren SNMP da aka dawo da su.

## Ƙara na'urar

Shigo da `install/templates/Windows_Device.xml.gz` idan samfuran sun ɓace, bisa ga [Shigo da fitar da samfura](/ha/guides/import-and-export-templates/). Zaɓi samfurin na'urar Windows, tabbatar da gano tambaya, sannan ƙirƙiri zane-zanen da kuke so a sarari. Fakitin ya ƙunshi tambayoyin bayanai guda uku da samfuran zane-zane masu alaƙa.

| Tambayar bayanai | Yana samun goyon baya ta | Karanta |
|---|---|---|
| SNMP - Ƙididdigar hanyoyin sadarwa | `resource/snmp_queries/interface.xml` | `IF-MIB`, an yi tafiya kai tsaye |
| SNMP - Samu bayanin processor | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` ta hanyar `scripts/ss_host_cpu.php` |
| SNMP - Samu maki na hawa | `resource/script_server/host_disk.xml` | `hrStorageTable` ta hanyar `scripts/ss_host_disk.php` |

Tambayoyin diski da processor tambayoyin uwar garken rubutun ne duk da sunayensu. Suna gudana a cikin keɓantaccen tsarin uwar garken rubutun PHP mai dorewa kuma suna yin kiran SNMP tare da takaddun shaida na rikodin na'urar. Tambayar hanyar sadarwa tambaya ce ta SNMP mai tsabta. Sakamako mai amfani shine cewa uwar garken rubutun PHP da ya gaza yana dakatar da tarin diski da CPU akan Windows yayin da zane-zanen hanyar sadarwa ke ci gaba da gudana.

## Abin da kuke samu ba tare da tambayar bayanai ba

Samfuran zane guda biyu kowannensu yana karanta tsayayyen OID guda ɗaya.

| Zane | OID | An adana azaman |
|---|---|---|
| Mai masaukin MIB - Hanyoyin aiki | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Mai masaukin MIB - Masu amfani da suka shiga | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Sauran biyu ba sa karanta komai daga na'urar. Jadawalin lokacin aiki da lokacin jefa ƙuri'a suna kiran `scripts/ss_hstats.php` kuma suna dawo da shafi daga rikodin na'urar Kadupul kanta: `snmp_sysUpTimeInstance` don lokacin aiki, tsawon lokacin zaɓe da aka yi rikodin don lokacin tambaya. Suna karanta ma'aunin da aka adana, ba sabon martanin SNMP kai tsaye ba.

## Teburan albarkatun mai masauki

### Na'urori masu sarrafawa

`hrProcessorLoad` a ƙarƙashin `.1.3.6.1.2.1.25.3.3.1.2` yana dawo da shigarwa ɗaya ga kowane na'ura mai sarrafa ma'ana wanda wakili ke bayyanawa. Tafiya (walk) tana ba da fihirisa; kada ku ɗauka cewa adadin layuka koyaushe yana dacewa da adadin zaren kayan aikin da aka tallata.

Ƙimar ta riga ta kasance kashi-kashi. MIB yana bayyana shi azaman matsakaicin lokacin minti na ƙarshe. Duba [ma'anar Host Resources MIB](https://www.rfc-editor.org/rfc/rfc2790.html).

### Ajiya

Tambayar ajiya da aka kawo tana amfani da `hrStorageTable` a ƙarƙashin `.1.3.6.1.2.1.25.2.3.1`. Tana karanta ginshiƙai shida.

| Shafi | OID | Jagora |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Fihirisa |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Fihirisa da lakabin da aka nuna |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Shigarwa, mai ninkawa |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Fitarwa |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Fitarwa |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Fitarwa |

Girma da sararin da aka yi amfani da su ƙididdige ƙididdiga ne na rukunin rarraba, ba bytes ba. Rubutun yana ninka kowane ƙima ta girman rukunin rarraba da aka adana don wannan fihirisar lokacin da duka ƙimar biyu suke aiki.

Abubuwa biyu akai-akai suna haifar da matsala akan Windows.

**Teburin ba jerin hard diski bane.** Wakilin yana ba da rahoton duk abin da yake ɗauka azaman ajiya. Ya danganta da wakili, ƙwaƙwalwar ajiya ta zahiri da ƙwaƙwalwar ajiya ta kama-da-wane na iya bayyana tare da tsayayyen tafiyarwa. Lakabi kamar `C:\`, `D:\`, `Physical Memory`, da `Virtual Memory` misalai ne, ba layuka masu garantin ba. Zaɓi layukan da kuke son tsara su.

**Manyan ko ɓatattun ƙimar ajiya suna buƙatar tabbatarwa.** MIB yana bayyana girman da amfani azaman mara kyau Integer32. Wakilin da ya dawo da mummunan ƙima yana waje da wannan kewayon. Rubutun na yanzu yana amfani da `(abs(value) + 2147483647) * allocation_units`, wanda baya wakiltar sake fassarar 32-bit mara sa hannu. Yi la'akari da ƙimar da abin ya shafa a matsayin wanda ba a dogara da shi ba kuma sake tsara fihirisa bayan gyara binciken. Duba [nakasar canza wurin ajiya](https://github.com/kadupulhq/kadupul/issues/243).

## Inda Windows ya bambanta da Linux

| Siffa | Linux tare da net-snmp | Ginanniyar wakilin Windows / samfuran da aka bayar |
|---|---|---|
| Matsakaicin nauyi | `.1.3.6.1.4.1.2021.10.1.3` | Babu abubuwan matsakaicin nauyi na UCD |
| Ƙwaƙwalwa | `.1.3.6.1.4.1.2021.4` | Za a iya tsara shi daga layuka na `hrStorage` da aka bayyana |
| CPU | Ƙididdigar UCD ko `hrProcessorLoad` | `hrProcessorLoad` kawai |
| Jerin diski | An bayyana ta ku ta hanyar `dskTable` ko `hrStorage` | `hrStorage` kawai, ba a tace ba |
| I/O na diski | `diskIOTable` | Babu wani abu da aka bayar da ke karanta wannan |
| Sunayen hanyoyin sadarwa | Sunayen kernel, gajere | Dogon kwatancen adaftan, galibi an kwafi |

Wakilin Microsoft da aka gina a ciki baya samar da ƙaramar bishiyar UCD `.1.3.6.1.4.1.2021`. Duba [Shirya matsalar ɓacewar bayanai](/ha/guides/troubleshoot-missing-data/).

### Hanyoyin sadarwa

Tambayar hanyar sadarwa daidai take da wacce switch ke amfani da ita. Tsarin zaɓin fihirisar sa shine `ifName`, sannan `ifDescr`, sannan `ifHwAddr`, sannan `ifIndex`. Yana zaɓar filin farko da yake akwai kuma na musamman akan kowane hanyar sadarwa da aka gano.

Windows shine dandamali inda wannan yafi gazawa akai-akai. NICs guda biyu masu kama da juna na iya dawo da `ifDescr` iri ɗaya, kuma wasu wakilai suna barin `ifName` fanko. Lokacin da tambayar ta koma `ifIndex`, tarihin haɗin gwiwar ku yana ɗaure da lambar da Windows ke da 'yancin sake sakawa.

Duba [Kula da switch](/ha/guides/monitor-a-switch/) da [Tambayoyin bayanai da fihirisa](/ha/concepts/data-queries-and-indexes/).

## Lokacin da babu SNMP

Yawancin shigarwar Windows ba su da sabis na SNMP a kunna. Madadin shine shigarwar rubutun.

Abubuwa biyu suna ƙayyade yadda kuke rubuta rubutun.

**Rubutun yana gudana akan na'urar da poller ke aiki.** Isa ga mai masaukin Windows aikin rubutunku ne: WinRM, wakili, maƙasudin HTTP, rabo, ko duk wata hanyar da kuke aiki da ita.

**Fitar da ma'auni akan daidaitaccen fitarwa.** Hanyar umarni ta waje na poller na PHP baya amfani da matsayin fita azaman ƙimar awo. Fitar da lamba, ko `U` don babu ma'auni a wannan zagayowar. Kada ku fitar da `0` lokacin da kuke nufin nuna cewa ma'aunin ya gaza.

Idan kuna buƙatar ƙima a kowace hanyar sadarwa, kowane diski, ko kowane sabis maimakon lamba ɗaya, tsarin rubutun iri ɗaya yana ba da tsari mai ƙididdigewa. `resource/script_queries/host_cpu.xml` misali ne mai amfani wanda ke kiran rubutun PHP maimakon uwar garken rubutun.

Duba [Rubutun tattara bayanai](/ha/guides/write-a-data-collection-script/) don kwangilar fitarwa da ƙuntatawar suna.

## Yanayin gazawa

| Alamar | Dalili na gama gari |
|---|---|
| An karanta bayanin tsarin, ba a tattara wani abu ba | Bincika tallafin abu, ƙuntatawar shiga, da takamaiman kuskuren SNMP |
| Babu amsa ko kaɗan daga mai masauki wanda ke kan layi | Jerin manajojin karɓar wakili ko dokar Tacewar zaɓi akan UDP 161 |
| Jerin ɓangarori ya ƙunshi ƙwaƙwalwar ajiya | Ana tsammani; wakili yana ba da rahoton ƙwaƙwalwa azaman ajiya |
| Babban ƙara yana bayyana mara kyau ko ba a sani ba | Ƙimar wakili mara inganci ko tsoffin raka'o'in rarraba; duba kuskuren da aka sani |
| Diski da CPU sun tsaya, hanyoyin sadarwa suna ci gaba | Gazawar uwar garken rubutun; tambayar hanyar sadarwa ba ta amfani da shi |
| An sanya samfuran Net-snmp, kowane ma'auni ba a sani ba | Wakilin da aka zaɓa baya samar da abubuwan UCD da ake buƙata don waɗancan samfuran |
| Tarihin hanyar sadarwa yana bin adaftar da ba daidai ba bayan canji | Fihirisa ya koma `ifIndex` saboda sunayen babu komai ko an kwafi |
| Lokacin aiki yana maimaita tsohuwar ƙima | Bincika idan rikodin na'urar ya tsufa; mataimaki baya ƙididdige lokacin aiki gaba |
