---
title: Kula da Switch
description: Gano tashoshin switch, zana madaidaitan ƙididdiga, kuma zaɓi fihirisa domin tarihin tasha ya kasance yana da alaƙa da tashar bayan maye gurbin kati.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 2
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen saki na Kadupul ko hanyar ƙaura. Gwada waɗannan matakan akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Switch shine ainihin yanayin amfani don tambayoyin bayanai. Ba ku sani ba a gaba yawan tashoshin da ke akwai, ƙididdiga na iya canzawa, kuma kowace tasha tana buƙatar tushen bayanan kanta. Duba [Samfura](/ha/concepts/templates/) don yadda tambayoyin bayanai ke aiki; wannan shafin yana magana ne game da saitin daidai.

## Kafin ka fara

Tabbatar cewa na'urar tana amsa daga mai tara da aka sanya, zai fi dacewa a ƙarƙashin mai amfani da poller. Yi amfani da takaddun shaida na karantawa kawai da aka saita. Ƙididdigar OIDs suna guje wa dogaro akan sunayen MIB da aka shigar a gida.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Yi amfani da SNMP v2c ko v3. Ma'aunin hanyar sadarwa na 64-bit abubuwa ne na SMIv2 kuma ba za a iya tambayar su ta hanyar v1 ba. Na'urar v1 za ta ba ku masu ƙididdige 32-bit kawai kuma ba wani abu ba.

## Zaɓin samfurin na'ura

Samfurin na'ura yana ƙayyade waɗanne tambayoyin bayanai da samfuran zane-zane aka bayar lokacin da kuka ƙara na'urar. Kadupul yana gado saitin samfuri wanda Cacti ya bayar, wanda ya haɗa da samfurin na'urar SNMP na gabaɗaya da saitin takamaiman samfuran masu siyarwa.

Gano tasha yana fitowa daga tushe ɗaya ba tare da la'akari da zaɓinku ba: tambayar bayanan hanyar sadarwa da aka ayyana a `resource/snmp_queries/interface.xml`. Idan babu samfurin da ya dace da kayan aikin ku, zaɓi samfurin gabaɗaya kuma haɗa tambayar hanyar sadarwa da shi.

## Gudanar da tambayar bayanai

Tambayar tana ratsawa ta `ifIndex` don nemo tashoshi, kuma tana karanta `ifNumber` don sanin adadin da ake tsammani. Daga nan sai ta tattara saitin filayen kowace tasha.

| Filin | OID | An yi amfani da shi don |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Matsayi a cikin teburin SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Gajeren sunan tasha, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Tsawon kwatance |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Bayanin hanyar sadarwa da kuka saita |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Adireshin MAC na tasha |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Sauri a cikin ragowa/sec, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Sauri a cikin Mbits/sec |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up ko Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Ƙididdigar byte na 32-bit |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Ƙididdigar byte na 64-bit |

Gudanar da tambayar sau ɗaya akan na'urar. Zai mayar da tebur na tashoshin da aka gano. Karanta wannan tebur kafin ƙirƙirar zane-zane, saboda yana kafa tushen kowane yanke shawara na gaba.

## Zabar masu ƙididdige 64-bit

Tambayar hanyar sadarwa tana ba da samfuran zane-zanen zirga-zirga da yawa. Babban sune:

| Samfurin zane | Karanta |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Hakanan, tare da layin kashi 95 |
| In/Out Bits (64-bit, BW) | Hakanan, dangi da saurin hanyar sadarwa |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Yi amfani da samfurin 64-bit sai dai idan kuna da takamaiman dalili na rashin yin hakan. Mai ƙididdige octet na 32-bit yana fuskantar ƙuntatawa a 4294967295. Tashar gigabit ƙarƙashin cikakken nauyi tana cika ta cikin kusan daƙiƙa 34. A mataki na daƙiƙa 300, poller ba zai iya bambanta ambaliya ɗaya daga ambaliya bakwai ba, kuma `COUNTER` yana gyara ambaliya ɗaya kawai tsakanin samfuran biyu. Zanen ba ya bayyana a karye a fili; kawai yana nuna ƙima mara kyau a koyaushe.

Tabbatar cewa an cika masu ƙididdigewa kafin yin ɗaruruwan zane-zane.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Tafiya mara komai ko mara nasara tana buƙatar bincike: bincika kuskuren da aka ruwaito, ra'ayin shiga, da tallafin wakili.

## Bincika matsakaicin da aka adana bayan canje-canjen gudu

Lokacin da tushen bayanan ke amfani da matsakaicin bisa saurin tambaya, ƙirƙirar tana ɗaukar gudu daga bayanan binciken da aka adana. An fi son `ifHighSpeed`, ana amfani da `ifSpeed` idan na farko ya ɓace, kuma tsohuwar da aka saita tana aiki idan duka biyun ba su da komai.

An rubuta wannan darajar a cikin fayil ɗin. Tashar da aka gano a 100 Mbps kuma daga baya aka yi shawarwari mafi girma na iya riƙe iyaka a ƙasa da ainihin zirga-zirgarta, kuma RRDtool zai yi rikodin ƙimar da ke sama da wannan hula a matsayin wanda ba a sani ba. Kwatanta saurin da aka ajiye, ma'anar tushen bayanai, da ainihin fayil tare da `rrdtool info`.

## Hukuncin fihirisa

Anan ne ake rasa tarihi idan aka yi kuskure.

Kowane tushen bayanai yana adana abubuwa biyu game da tashar sa: wane fili ne ke gano shi (nau'in fihirisa) da ƙimar wannan filin. A kowane sake fasalin fihirisa, yana sake samun tashar ta hanyar tambayar wace fihirisar SNMP a halin yanzu take da wannan ƙimar a wannan filin. Tushen bayanan yana bin ƙimar, ba matsayin tebur ba.

Don haka tambayar ita ce wanne fanni ke ɗauke da ƙimar.

Tambayar hanyar sadarwa tana bayyana tsarin zaɓi: `ifName`, sannan `ifDescr`, sannan `ifHwAddr`, sannan `ifIndex`. Kadupul yawanci yana zaɓar tsakanin 'yan takara waɗanda ke da ƙima daban-daban kuma babu kwafi.

| Filin | Yana rayuwa | Ya gaza lokacin da |
|---|---|---|
| `ifName` | Sake kunnawa, maye gurbin kati, sake ƙidaya | Wakili yana barin shi a sarari ko kuma yana maimaita shi a cikin membobin stack |
| `ifDescr` | Yawanci barga akan kayan aikin switch | A kan sabobin sunan kernel yana canzawa |
| `ifHwAddr` | Sake kunnawa | Katin da aka maye gurbinsu yana da sabbin MACs, wanda shine ainihin abin da kuke son kariya daga gare shi |
| `ifIndex` | Babu wani abu abin dogaro | Musanya katin, sake kunnawa, ko canjin firmware yana sake ƙidaya tebur |

Idan tambayar ta koma ga `ifIndex`, ɗauki wannan a matsayin matsala ba sakamako na al'ada ba. Tarihin tashar ku yana ɗaure da lambar da switch ke da 'yancin sake sakawa.

## Hanyar sake fihirisa (reindex method)

An saita kowace na'ura ta kowace tambayar bayanai. Yana ƙayyade lokacin da Kadupul ke sake karanta filayen fihirisa.

| Hanyar | Yana jawo akan | Farashi |
|---|---|---|
| None | Babu komai; manual ko rubutun kawai | Babu |
| Uptime | Kayan aikin SNMP na na'urar yana tafiya baya | Kwatantawa ɗaya a kowace zagaye |
| Index Count | Canji a ƙididdigar fihirisa da aka gano | Ƙididdiga ɗaya a kowace zagaye |
| Verify All | Rashin nasarar bincika asalin da aka adana | Tambayoyi fihirisa da aka sani yayin jefa ƙuri'a |

Uptime shine tsoho kuma ya dace da yawancin switches, saboda sake kunnawa shine taron da ke sake ƙidaya fihirisa. Index Count yana ɗaukar katunan da aka ƙara ko cire ba tare da sake kunnawa ba. Verify All na iya gano canjin asali akan fihirisa da aka sani, amma baya bada garantin gano sabbin tashoshi.

Don sake kunna na'urar da aka zaɓa da tambaya, musanya duka ID ɗin da aka shigar. Bar `--qid` don sake gudanar da duk tambayoyin wannan na'urar:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` yana faɗaɗa kisa ga duk na'urorin da aka kunna. Guji gudanar da sake fihirisa da ke haɗuwa. `--force` yana wucewa rajistar tsari kuma yana sabunta bayanan take.

## Lokacin da tasha ta ɓace

Kada ku ɗauka cewa tashar da ta ɓace tana dakatar da tarin ta atomatik. Lambar sake fasalin fihirisa na yanzu na iya sake saita tutar marayu da riƙe tsoffin OIDs na jefa ƙuri'a lokacin da ba a warware ainihin asalin ba kuma babu tushen da ya canza fihirisar. Kwatanta asalin da aka adana tare da sabon cache na ganowa kuma kashe tushen da abin ya shafa har sai an tabbatar da wasan. Duba [Tambayoyin bayanai da fihirisa](/ha/concepts/data-queries-and-indexes/).

## Babban chassis (large chassis)

Saituna biyu a kowace na'ura suna da mahimmanci da zarar ƙididdigar tashar ta yi yawa: duba OIDs da aka saita a kowace buƙatar SNMP da adadin zaren kowace na'ura. Tallafin Batching da ingantaccen daidaituwa sun dogara da mai tarawa da wakili; PHP `cmd.php` da Spine ba sa bayar da halayen zaren iri ɗaya.

Canza saiti ɗaya kawai a lokaci guda kuma duba tsawon lokacin zagayowar poller.

## Yanayin gazawa

| Alamar | Dalili |
|---|---|
| An ƙirƙiri zane-zane, kowane ma'auni ba a sani ba | Ba a aiwatar da masu ƙididdige 64-bit ba, ko na'urar tana amfani da SNMP v1 |
| Ma'auni suna tsalle zuwa ƙima mara kyau | 32-bit counter yana cika fiye da sau ɗaya a kowane tazara |
| Gaps kawai a ƙarƙashin babban nauyi | RRD matsakaicin kulle a tsohuwar gudun da aka gano |
| An ba da tarihin tasha zuwa tashar da ba daidai ba bayan kiyayewa | Asalin da ba shi da tabbas, tsohuwar taswira, ko sarrafa marayu da ba a warware ba |
| Poller yana yin rikodin gargaɗi game da fihirisar SNMP mara inganci | An bar tushen bayanai ba tare da fihirisa ba; sake tsara fihirisa, share, ko kashewa |
| An gano tashoshi, ba a tattara komai ba | Tushen bayanai tare da fihirisa mara komai ba sa ƙirƙirar abubuwan shigar da cache na poller |
