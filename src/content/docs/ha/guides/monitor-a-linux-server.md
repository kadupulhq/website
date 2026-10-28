---
title: Kula da Sabar Linux
description: Zana jadawalin CPU, ƙwaƙwalwa, diski, da nauyi akan mai masaukin Linux ta hanyar net-snmp, abin da snmpd ke buƙatar bayyanawa, da yadda ake amfani da rubutun lokacin da SNMP bai wadatar ba.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 3
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen saki na Kadupul ko hanyar ƙaura. Gwada waɗannan matakan akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Mai masaukin Linux da ke gudanar da net-snmp yana ba ku mafi yawan awo ba tare da wani ƙarin lamba ba. Aikin shine samun `snmpd` don bayyana madaidaitan ƙananan bishiyoyi (subtrees) da kuma sanin wanne daga cikin MIBs biyu na diski da ke haɗuwa kuke kallo.

## Abin da snmpd dole ne ya bayyana

Kadupul yana binciken yankuna huɗu. Ba da izinin asalin sa ido ga ƙananan bishiyoyin da ake buƙata don zaɓaɓɓun zane-zane; ba kowane aiki ke buƙatar kowace ƙaramar bishiya ba.

| Yanki | Ƙaramar bishiya | Yana bayarwa |
|---|---|---|
| Tsari | `.1.3.6.1.2.1.1` | Bayani, lokacin aiki (uptime), lamba, suna, wuri |
| Hanyoyin sadarwa | `.1.3.6.1.2.1.2` da `.1.3.6.1.2.1.31` | Zirga-zirga, kurakurai, matsayi |
| Abubuwan masauki | `.1.3.6.1.2.1.25` | Hanyoyin aiki, masu amfani da suka shiga, ajiya, na'urori masu sarrafawa |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Matsakaicin nauyi, ƙwaƙwalwa, lokacin CPU, shigar/fitar diski, ɓangarorin da aka bayyana |

Rarraba da yawa suna jigilar tsohuwar `snmpd.conf` wanda ke ba da ra'ayi wanda ke rufe ƙaramar bishiyar tsarin kawai. Na'urar za ta amsa, ta ba da rahoton bayanin tsarin, kuma ba za ta tattara komai ba. Wannan haɗin shine mafi yawan gazawar farko akan mai masaukin Linux kuma yana kama da matsalar samfuri.

Tabbatar da wuraren da ake buƙata daga mai masaukin poller ta amfani da asalin SNMP ɗaya da aka saita akan na'urar. Waɗannan misalan suna amfani da al'umma mai kwatantawa; musanya shi da ƙimar da kuka saita. Ƙididdigar OIDs suna guje wa buƙatar ma'anar MIB na gida na alama.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Idan umarnin farko kawai ke aiki, bincika ainihin martanin: ƙuntataccen ra'ayi, ƙirar wakili da ba ta samuwa, mahallin SNMP daban, ko tebur mara komai na iya bayyana sakamakon. Tabbatar da daidaitawar wakili da samun dama kafin canza samfurin Kadupul.

## Ƙara na'urar

Fakitin da aka kawo `install/templates/NetSNMP_Device.xml.gz` ya ƙunshi samfurin na'urar Net-SNMP da abubuwan dogaro da shi. Shigo da shi idan samfurin ya ɓace, sannan zaɓi shi lokacin ƙara na'urar. Tabbatar da fihirisar tambaya kuma ƙirƙiri zane-zanen da kuke so a sarari; zabar samfurin na'ura ba ya tabbatar da cewa tarin yana aiki. Duba [Shigo da samfura](/ha/guides/import-and-export-templates/) da [Zanenku na farko](/ha/start/first-graph/).

## Abin da kuke samu ba tare da tambayar bayanai ba

Waɗannan tsayayyun samfuran bayanan OID an haɗa su cikin fakitin. Zane ɗaya na iya haɗa da yawa daga cikin waɗannan; samuwa ya dogara da wakilin da aka nufa. Ba sa buƙatar gano fihirisa.

| Zane | OID | An adana azaman |
|---|---|---|
| Matsakaicin nauyi na minti 1 | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Matsakaicin nauyi na minti 5 | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Matsakaicin nauyi na minti 15 | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Jimillar ƙwaƙwalwa | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Ƙwaƙwalwar ajiya kyauta | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Ƙwaƙwalwar ajiya ta buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Ƙwaƙwalwar ajiya ta cached | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| Mai amfani da CPU | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| Tsarin CPU | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU marar aiki | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Katsewa (Interrupts) | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Canje-canjen mahallin | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Hanyoyin aiki | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Masu amfani da suka shiga | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Abubuwan ƙwaƙwalwa suna cikin kilobaiti. Zanen ƙwaƙwalwar ajiya da aka tattara yana amfani da juyawa don haka axis yana nunawa a cikin bytes. Idan kun gina jadawalin ku daga waɗannan OIDs, wannan jujjuyawar alhakinku ne.

Abubuwan CPU da aka lissafa sun tsufa kashi-kashi, ba ƙididdige ƙididdiga na lokacin CPU ba. Kada ku ɗauka cewa waɗannan ukun kawai sun rufe kowane yanayi na processor. Net-SNMP yana kawar da su don goyon bayan ƙididdiga masu danye; ƙididdiga masu ɗanye suna buƙatar ƙididdigar ƙididdiga da kashi daidai, ba sauƙin shigarwa cikin samfurin gauge ba. Duba [UCD-SNMP-MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Abin da ke buƙatar tambayar bayanai

| Tambaya | Yana Ganowa | Yana samun goyon baya ta |
|---|---|---|
| SNMP - Samu maki na hawa (mount points) | Duk abin da wakili ke kira ajiya | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Samu ɓangarorin da aka lura da su | Ɓangarorin da aka bayyana a cikin `snmpd.conf` kawai | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Samu bayanin processor | Shigarwa ɗaya ga kowane CPU | Nauyin processor na albarkatun mai masauki |
| Net-SNMP - Samu I/O na na'ura | Na'urorin toshe (block devices) | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Ƙididdigar hanyoyin sadarwa | Hanyoyin sadarwar intanet | `IF-MIB` |

### Wace tambayar diski za a yi amfani da ita

Waɗannan ba ra'ayoyi biyu bane na bayanai iri ɗaya.

Tambayar albarkatun mai masauki tana tafiya cikin duk abin da wakili ya ba da rahoto azaman ajiya. A kan yawancin rundunonin Linux, wannan yana haɗa ƙwaƙwalwar ajiya ta zahiri, swap, tmpfs mounts, da ainihin tsarin fayil a cikin jerin guda ɗaya. Ana mayar da girma a cikin rukunin rarraba, kuma tambayar tana karanta girman rukunin rarraba azaman filin daban don jadawali ya iya ninka. Kuna samun komai ba tare da daidaita komai ba, amma kuma dogon jerin abubuwan da ba kwa so.

Tambayar net-snmp tana karanta teburin diski na UCD, wanda umarnin `disk` ko `includeAllDisks` ya cika. Zaɓi takamaiman ɓangarori ko bincike mai faɗi; manufofi ne daban-daban.

```
disk /      10%
disk /var   10%
```

A madadin, `includeAllDisks 10%` yana cika fayafai da aka samu a farkon wakili. Ƙimar 10% tana daidaita madaidaicin sarari kyauta; ba matattarar zaɓi ba ce kuma ba ta saita faɗakarwar Kadupul da kanta ba. Sake shigar ko sake kunna wakili sannan a sake duba fihirisa. Tambaya mara komai na iya nuna matsalolin shiga ko wadatar tsari. Duba [daidaitawar snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Fi son tambayar albarkatun mai masauki lokacin da kuke son cikar kuma kuna shirye don tace. Fi son tambayar net-snmp tare da bayyanannun shigarwar `disk` lokacin da kuke son jerin da aka yi niyya. `includeAllDisks` yana faɗaɗa wannan jerin; sake duba fihirisa bayan sake kunna wakili.

### Hanyoyin sadarwa

Tambayar bayanan hanyoyin sadarwa akan uwar garken tana aiki daidai kamar yadda take a kan switch, tare da gargaɗi ɗaya: `ifDescr` a ƙarƙashin Linux shine sunan haɗin gwiwar kernel, wanda zai iya canzawa bayan sake kunnawa ko sabunta direba. Duba [Kula da switch](/ha/guides/monitor-a-switch/) don cikakkun bayanan zaɓin fihirisa.

## Lokacin da SNMP bai wadatar ba

Wasu ma'aunin ba su da MIB mai amfani. Zurfin layi, ma'aunin aikace-aikace, ko lamba a cikin fayil yana buƙatar shigarwar rubutun.

Abubuwa biyu suna ƙayyade yadda kuke rubuta rubutun.

**Rubutun yana gudana akan na'urar da poller ke aiki, ba akan mai masaukin da ake sa ido ba.** Isa ga manufa aikin rubutunku ne: SSH, kiran HTTP, wakili, ko duk wata hanyar da kuka riga kuka tura.

**Mai jefa ƙuri'a (poller) yana karanta daidaitaccen fitarwa (stdout) kuma ba wani abu ba.** Ba a tantance halin fita ba.

Yarjejeniyar fitarwa:

| Fitarwa | Ma'ana |
|---|---|
| `42` ko `3.7` | Ƙima ɗaya don tushen bayanai guda ɗaya |
| `U` | Babu ƙima a wannan zagayowar, an yi rikodin azaman unknown |
| `in:1420 out:980` | Ƙididdiga da yawa, ɗaya ga kowane tushen bayanai |

Don sigar ƙima da yawa, ana raba nau'i-nau'i ta wurare guda ɗaya kuma an raba sunan daga ƙimar ta hanyar hanji. Mai fassara yana ƙidaya masu rarrabawa akan fararen sarari, don haka ƙarin wurare na ciki na iya sa tabbatarwa ta gaza. Poller na PHP yana datsa fararen sarari na ƙarshe. Fitar da tsarin canonical tare da wurare guda ɗaya kuma tura bincike daga stdout.

Sunayen tushen bayanai na ciki na RRD da editan samfuri ya karɓa sun yi daidai da `[a-zA-Z0-9_]{1,19}`; ba a karɓar hyphens a can. Dole ne alamun fitarwa na rubutun su dace da sunayen filin shigar da bayanai kuma a zana su zuwa abubuwan da aka nufa na ciki. Ana adana dukkan layin fitarwa a cikin shafi na haruffa 512. Duba [Rubutun tattara bayanai](/ha/guides/write-a-data-collection-script/) don kwangilar poller na PHP da aka bincika.

Mayar da `U` maimakon `0` lokacin da ba za ku iya auna wani abu ba. Zero ma'auni ne kuma za a tsara shi kamar haka. Duba [Tushen bayanai da RRAs](/ha/concepts/data-sources-and-rras/) don dalilin da yasa ake raba su biyun.

### Sabar rubutun (script server)

Rubutu mai sauƙi yana gudana sau ɗaya a kowane tushen bayanai a kowane lokaci. Don rubutun da aka rubuta a cikin PHP, fom ɗin uwar garken rubutun yana kiran aiki a cikin keɓantaccen tsarin PHP mai dorewa, yana rage ƙarancin farawa na mai fassara.

### Tarkon jerin izini (whitelist trap)

Lokacin da aka yi amfani da fayil ɗin jerin izini na shigar da bayanai, poller yana kwatanta kirtani na umarni na kowane shigar da bayanai da wanda aka yi rikodin. Kirtani na umarni wanda ya canza ba tare da sake haifar da jerin izini ya daina ƙirƙirar abubuwan shigar da cache na poller ba, kuma tushen bayanan ya yi shiru ba tare da kuskure ba akan jadawali. Log ɗin yana ba da rahoton wannan, amma UI ba ya yi.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Maye gurbin `42` da ID na hanyar shigar da bayanai da aka bincika, ba ID na na'ura ba. Sabuntawa ba tare da `--id` yana karɓar kirtani na umarni na yanzu a cikin duk kayan aikin shigarwa. Bincika canje-canje a gaba. Bayan ɗaukakawa, tabbatar da kunna tushen da ingantattun abubuwan shigar cache na poller.

## Yanayin gazawa

| Alamar | Dalili na gama gari |
|---|---|
| An karanta bayanin tsarin, ba a tattara wani abu ba | `snmpd` an taƙaita ra'ayi zuwa ƙaramar bishiyar tsarin |
| Tambayar ɓangaren Net-SNMP ba ta sami fihirisa ba | Babu layin `disk` ko `includeAllDisks` a cikin `snmpd.conf` |
| Ɓangarorin albarkatun mai masauki sun haɗa da RAM da tmpfs | Ana tsammani; wakili yana ba da rahoton su azaman ajiya |
| Zanen ƙwaƙwalwa yana kashe da factor na 1024 | Gina akan ɗanyen OIDs ba tare da canji ba |
| Rubutun yana dawo da ƙima akan layin umarni, poller yana rikodin unknown | Fitowar/taswirar rashin daidaituwa, kurakuran mai rarraba ciki ko sunan ciki mara aiki |
| Rubutun yana aiki da hannu amma ya gaza ta hanyar poller | Yana gudana azaman mai amfani da poller tare da muhallinsa da izininsa |
