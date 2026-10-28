---
title: Kula da mai masaukin baki na kamala
description: Abin da hypervisor ke bayyanawa akan SNMP, abin da ke zuwa don ESXi, da kuma dalilin da yasa ƙidaya baƙi, CPU da ƙwaƙwalwa akan wata ƙasa ta zahiri ya fi wuya fiye da yadda yake gani.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 27
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura mai goyan baya. Gwada waɗannan matakan akan keɓantaccen kwafi tare da ajiye bayanan sirri kafin dogara da su. Duba [matsayin aiki](/ha/project/status/).
:::

Kunshin ESXi da aka aika yana tattara ma'aunin mai masaukin baki da ƙididdigar kayan baƙi. Baya bayar da ma'aunin CPU, ƙwaƙwalwa ko ma'aunin rikici ga kowane baƙo. Tabbatar da abubuwan da sigar hypervisor ɗin ku ta fallasa kafin zaɓar zane-zane.

## Abin da ke zuwa

Samfurin na'urar hypervisor guda ɗaya yana jigilar kaya: **ESXi Device**. Kunshin na'ura ne, don haka `install/templates/ESXi_Device.xml.gz` yana ƙunshe da rubutunsa da fayilolin tambayar bayanai. Bi [Shigo da fitar da samfura](/ha/guides/import-and-export-templates/) kuma tabbatar da cewa an gama shigo da kaya, gami da tura fayil. Zaɓi samfurin na'urar, duba bincike, kuma ƙirƙiri zane-zanen da ake so a bayyane; shigo da kunshin ko haɗa samfurin na'urar kaɗai baya ƙirƙirar su.

| Abin da ke zuwa | Manufa |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Yana gano na'urori masu sarrafawa kuma yana karanta nauyin kowane mai sarrafawa |
| `resource/snmp_queries/esxi_hw.xml` | Yana gano kayan aikin hardware kuma yana karanta matsayinsu |
| `resource/snmp_queries/interface.xml` | Daidaitaccen tambayar kididdigar dubawa |
| `resource/script_server/host_disk.xml` | Rabe-raben da aka ɗora, ta hanyar teburin ajiya na Host Resources |
| `scripts/ss_esxi_vhosts.php` | An haɗa shi a ciki `install/templates/ESXi_Device.xml.gz`; yana ƙidaya baƙi, baƙi masu ƙarfi, da matsayin kayan aikin baƙi |
| `scripts/ss_multicpu_avg.php` | Yana daidaita nauyin kowane mai sarrafawa zuwa lamba ɗaya |
| `scripts/ss_hstats.php` | Yana karanta ƙididdigar zaɓe wanda Kadupul ya riga ya riƙe don na'urar |
| `scripts/ss_host_disk.php` | Yana goyan bayan tambayar ɓangarori |

Babu wani keɓantaccen fakitin na'ura da ke zuwa don Hyper-V, KVM/libvirt, Xen ko Proxmox a cikin wannan rajistan. Samfuran Linux/Windows na gama gari na iya rufe ma'aunin mai masaukin baki wanda wakilansu ke tallafawa; tattara takamaiman hypervisor yana buƙatar samfura da masu tarawa masu dacewa. Duba [Rubuta rubutun tattara bayanai](/ha/guides/write-a-data-collection-script/).

## Kunna wakili da farko

Duba tsarin wakili da ke akwai kuma yi amfani da umarnin don sigar ku ta ESXi. Bayanan fakitin sun haɗa da sake saitin masana'anta; ba sharadi bane na yau da kullun kuma zai goge tsarin SNMP da ke akwai. Don saitin tushen al'umma, umarni masu zuwa suna saita ƙimar wakili; maye gurbin misalan kuma adana kowace al'umma da ake buƙata yayin saita jerin al'umma.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Umurnin farko yana nuna daidaitawa; na karshe yana ba da damar wakili. Zaɓin al'umma yana maye gurbin jerin sa da aka saita. Bincika damar shiga bangon wuta da ake buƙata daga poller kuma tuntuɓi [Bayanin umarnin ESXCLI SNMP](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html). Waɗannan umarnin suna saita zaɓen tushen al'umma; ba sa saita SNMPv3. Tabbatar daga na'urar da poller ke aiki akanta kafin ƙara na'urar.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Idan na farko yayi aiki kuma na uku bai dawo da komai ba, duba kuskuren SNMP, manufar samun dama da tallafin wakili; tafiya mara komai kaɗai ba ta gano dalilin ba. Rubutun baƙo da aka haɗa yana amfani da SNMPv1, don haka binciken v2c mai nasara baya inganta hanyar tarinsa. Tafiya mara kyau na baƙo yana haifar da ƙididdiga marasa kyau, ba lallai bane gibi na jadawali; duba [kuskuren sakamako mara komai](https://github.com/kadupulhq/kadupul/issues/245).

## Abin da mai masaukin baki ke fallasa

| Yanki | Ƙananan bishiya | Yana ba ku |
|---|---|---|
| Masu sarrafawa | `.1.3.6.1.2.1.25.3.3.1` | Load ga kowane mai sarrafawa da wakili ya fallasa |
| Abubuwan kayan aiki | `.1.3.6.1.2.1.25.3.2.1` | Fihirisar sashi, bayanin da jihar |
| Ma'ajiya | `.1.3.6.1.2.1.25.2.3.1` | Datastores da fayilolin gida, kamar yadda wakili ya zaɓi bayar da rahoto |
| Musaya | `.1.3.6.1.2.1.2` da `.1.3.6.1.2.1.31` | Traffic, kurakurai, matsayi |
| Ƙirƙirar baƙi | `.1.3.6.1.4.1.6876` | Yanayin wutar lantarki na kowane baƙo da matsayin kayan aikin baƙi |

Hudu na farko sune daidaitattun teburan Host Resources da dubawa, iri ɗaya waɗanda mai masaukin Linux ke amsa da su. Duba [Kula da sabar Linux](/ha/guides/monitor-a-linux-server/) don yadda waɗannan ke aiki da kuma teburin diski da za a fi so.

Na biyar shine ƙaramin bishiyar mai siyarwa wanda rubutun ƙidaya baƙi da aka aiko ke amfani da shi.

## Samfuran jadawali

| Jadawali | Tushe | Yana karanta |
|---|---|---|
| ESXi - CPU | Tambayar bayanai | Load don mai sarrafawa guda ɗaya da aka gano |
| ESXi - MultiCPU Average | Rubutu | Matsakaicin nauyin kowane mai sarrafawa |
| ESXi - Hardware | Tambayar bayanai | Halin ɓangaren da aka gano guda ɗaya |
| ESXi - VHosts | Rubutu | Ƙididdigar baƙi da matsayin kayan aikin baƙi |
| Host MIB - Processes | Kafaffen OID | Ƙididdigar tsari akan mai masaukin baki |
| Host MIB - Logged in Users | Kafaffen OID | Ƙididdigar zama akan mai masaukin baki |
| Device - Uptime | Rubutu | Lokacin aiki kamar yadda Kadupul ya yi rikodin ƙarshe |
| Device - Polling Time | Rubutu | Tsawon lokacin da Kadupul ya ɗauka don jefa ƙuri'a wannan na'urar |
| Zane-zane na dubawa | Tambayar bayanai | Traffic, kurakurai, fakiti, matsayi a kowace dubawa |

Tambayar mai sarrafawa tana karanta nauyin kowane shigarwar da aka gano. Kada ku ɗauka cewa adadin layinsa ya dace da ƙididdigar zaren kayan aikin mai masaukin baki: tsarin fihirisar da aka haɗa yana karɓar fihirisa ɗaya ko lambobi biyu kawai kuma yana ƙin 100 ko mafi girma, koda a kan mai masaukin baki mai CPUs kaɗan. Kwatanta bincike tare da danyen tafiya; duba [kuskuren fihirisar CPU](https://github.com/kadupulhq/kadupul/issues/246). Rubutun matsakaicin yana tafiya da kansa akan nauyin mai sarrafawa kuma yana daidaita layuka da aka dawo dasu.

Device - Uptime da Device - Polling Time karanta bayanan na'urar Kadupul da aka adana. Mai taimaka wa lokacin aiki yana mayar da lokacin aiki na SNMP da aka adana ba tare da ƙara tsawon lokacin da ya wuce ba; lokacin jefa ƙuri'a yana bayyana aikin tarin Kadupul. Tsohuwar ƙimar da aka adana ba ta tabbatar da isa ga yanzu ba. Idan tarin ya tsaya, waɗannan masu taimakawa ba sa haifar da sabbin samfura.

## Matsalolin ƙidaya

Wannan shi ne ɓangaren da ke sa haɓakawa ya bambanta da sabar zahiri, kuma babu ɗayansu da aka warware ta samfurin jadawali.

**Baƙi suna motsawa.** Baƙon da ya yi ƙaura zuwa wani mai masaukin baki ya ɓace daga kayan aikin mai masaukin farko kuma ya bayyana a na biyu. Samfuran lokaci daban-daban na iya ƙidaya wannan baƙon sau biyu na ɗan lokaci ko kuma barin shi. Canje-canjen ƙidaya kaɗai ba sa tabbatar da ƙaura: yi amfani da bayanan asalin hypervisor da abubuwan da suka faru don bayyana su.

**Ana raba albarkatu, don haka rarraba kowane baƙo kiyasi ne.** Mai masaukin baki yana ba da rahoton nauyin mai sarrafa jiki. Baya bayar da rahoton wane baƙo ne ya jawo hakan. Rarraba CPU na mai masaukin baki ta hanyar ƙididdigar baƙi yana haifar da lambar da take daidai a lissafi kuma ba ta amsa wata tambaya da kowa ya yi ba.

**Kaddamar da yawa (Overcommit) yana sa rabon da amfani da yawa daban-daban.** CPUs na zahiri da aka ba su na iya wuce ainihin ainihin, kuma ƙwaƙwalwar da aka ba ta na iya wuce ƙwaƙwalwar zahiri, da gangan. Jadawalin albarkatun da aka ba da su yana bayyana rabo maimakon buƙatun da aka auna. Kwatanta shi da ƙarfin jiki, ƙayyadaddun iyakoki da ainihin amfani.

**Rikici baya bayyana a cikin waɗannan teburan.** Ma'aunin da ke gaya muku cewa ana barin baƙo da yunwa, lokacin da ya ɓata yana jiran mai sarrafa jiki da ƙwaƙwalwar da mai masaukin ya kwato daga gare shi, ba sa cikin abin da wannan samfurin ke tattarawa. Mai masaukin baki a kashi 60 na CPU tare da baƙi masu fafatawa sosai yayi kama da juna anan ga mai masaukin baki a kashi 60 na CPU tare da masu farin ciki.

**Ma'aunin baƙi da na mai masaukin baki suna amsa tambayoyi daban-daban.** Amfani da baƙo kaɗai bazai bayyana jinkirin tsara mai masaukin baki ba. Daidaita ma'aunin baƙo/aikace-aikace tare da ma'aunin rikici na hypervisor maimakon samun rarrabawa daga nauyin mai masaukin baki.

### Abin da za a yi a maimakon haka

| Tambaya | Inda amsar take |
|---|---|
| Shin mai masaukin ya cika | Nauyin sarrafa mai masaukin baki, daga mai masaukin baki |
| Shin baƙo ya cika | A cikin baƙo, da kuma ma'aunin rikici da hypervisor ke riƙe |
| Baƙi nawa ne ke aiki | Kayan aikin baƙon mai masaukin baki, azaman ƙidaya |
| Shin gidan ya wuce ƙarfin aiki | Ba daga waɗannan jadawalin ba. Yana buƙatar bayanan sanyawa wanda mai masaukin baki baya bayyanawa |
| Shin baƙo ya motsa | Bayanan asalin Hypervisor da abubuwan ƙaura; matakan ƙidaya kaɗai ba su wadatar ba |

Kula da baƙi azaman na'urorin kansu don kowane abu game da baƙo, kuma ku kula da mai masaukin baki don kowane abu game da mai masaukin baki. Guji gina zane-zanen kowane baƙo daga lambobin matakin mai masaukin baki: an samo su, suna da iko, kuma ba daidai ba ne ta hanyoyin da babu wanda zai iya hango su daga baya.

## Tarkuna a cikin adadin baƙi da aka aiko

Rubutun kayan aikin baƙi yana da kyau a fahimta kafin ku dogara da fitarwarsa.

**Yana tafiya tare da sigar SNMP 1 da kirtani na al'umma kawai.** An gyara sigar a cikin rubutun kuma ba a wuce takaddun shaidar v3 akan na'urar ba. Na'urar da aka saita don v3 na iya tarawa ta wasu hanyoyi yayin da tarin baƙi ya gaza. Har yanzu tarin baƙi na iya yin nasara idan wannan wakili ya karɓi al'ummar da aka adana daban akan v1; zabar v3 akan na'urar baya tantance sakamakon da kansa. Ana dawo da tafiye-tafiyen baƙi marasa komai azaman sifili. Bincika wannan rashin daidaituwar yarjejeniya ba tare da rage manufofin tsaro na wakili ba don saukar da mataimaki.

**Ƙididdigar ta fito ne daga teburin yanayin wutar lantarki.** Lambar da aka ba da rahoton azaman jimillar baƙo ita ce adadin abubuwan da aka dawo dasu ta hanyar tafiya na ƙaramin itacen wutar lantarki, ba na wani abu na daban ba. Baƙon da mai masaukin ya lissafa amma ba shi da shigarwar yanayin wutar lantarki ba a ƙidaya shi ba.

**Ana daidaita masu ƙarfi akan rubutun jiha.** Bayan trimming da ƙananan haruffa, kawai `powered on` da `poweredon` suna ƙara ƙididdigar gudu. Sauran wakilci ba sa yin haka; kwatanta danyen martanin wakili kafin fassara sifili.

**Rarraba kayan aikin baƙi yana da lahani da aka tabbatar.** Ainihin `not installed` ana ƙidaya shi azaman yana gudana saboda wasansa yana farawa a kashe sifili. Rubutun da ba a gane ba kuma ya faɗi ta hanyar gudu. Kada a ɗauki wannan ƙididdiga a matsayin tabbacin kayan aikin lafiya; duba [kuskuren matsayin kayan aiki](https://github.com/kadupulhq/kadupul/issues/244).

**Yana tafiya sau uku a kowane kira.** Yana karanta teburin yanayin wutar lantarki sau biyu, sannan teburin kayan aiki, don haka koda ƙididdigar kanta ba hoton ƙirar atomatik bane. A kan mai masaukin baki tare da baƙi da yawa, auna wannan farashin tarin. Idan mai jefa kuri'a yana da matsewa, wannan ɗan takara ne na tsawon lokaci kafin ya zama ɗan takara na ƙarin zaren. Duba [Auna poller](/ha/guides/scale-the-poller/).

Rubutun yakan fitar da duk ƙimomi biyar da aka ambata, gami da sifili don tafiye-tafiye marasa komai. Don haka tafiya da ta gaza na iya haifar da cikakkiyar samfuri amma mai yaudara. Don fitowar da ba ta cika ba, mai sarrafa fitarwa na PHP yana bincika filayen da tushen bayanan da ke da alaƙa ke buƙata kuma yana hana ƙungiyoyin tambarin lokaci marasa cika; ba lallai ba ne ya jefar da su nan da nan. Duba [Ma'ajiyar poller](/ha/concepts/the-poller-cache/).

## Tarkuna a cikin sauran

**Matsakaicin mai sarrafawa yana ɓoye rashin daidaituwa.** Mai masaukin baki mai maɓalli ɗaya da 63 marasa aiki yana da matsakaicin ƙasa. Ajiye ingantattun jadawali na kowane mai sarrafawa inda hakan ke da mahimmanci. Matsakaicin mataimaki kuma yana dawo da `load:0` don tafiya mara komai, wanda ba za a iya bambanta shi da CPU mara aiki da aka auna ba; daidaita shi tare da matsayin tarin da sanannen kuskuren sakamako mara komai.

**Fihirisar sarrafawa na matsayi ne.** Ana gano su ta hanyar tafiya a teburin sarrafawa. Idan fihirisar wakili ta canza, tabbatar da taswirar ainihi kafin amincewa da ci gaba. Ƙuntataccen lamba ɗaya/lambar da aka haɗa wani lahani ne na gano daban.

**Abubuwan da ke cikin ajiya duk abin da wakili ke kira ajiya ne.** Yi tsammanin shagunan bayanai sun gauraye da abubuwan da ba ku so, a cikin rukunin rarraba waɗanda ke buƙatar ninkawa. Wannan shine halin Host Resources, ba al'adar ESXi ba. Tabbatar da rukunin rarraba da aka adana kafin fassara bytes; rubutun da aka raba yana da [sanannen lahani na canzawa](https://github.com/kadupulhq/kadupul/issues/243) don samfuran mara kyau marasa inganci ko ɓacewar masu yawaitawa.

**Sunayen mu'amala akan hypervisor suna da ƙarfi har sai ba su kasance ba.** Sabunta direba ko sake daidaitawa na iya sake lissafin su. Duba [Kula da sauyawa](/ha/guides/monitor-a-switch/) don yadda aka zaɓi fihirisa da kuma dalilin da yasa yake da mahimmanci.

**Rubutun suna gudana akan mai masaukin baki.** Sun isa ga hypervisor da kansu, ta amfani da ID na na'urar da aka wuce ta hanyar umarnin da aka adana. Baƙon da mataimakan matsakaicin CPU suna ɗaukar layin na'urar na yanzu akan kowane kira; canjin al'umma baya buƙatar sake gina waɗannan hujjojin umarni. Sauran masu karɓa na iya saka takaddun shaida a cikin abubuwan aikinsu. Duba [Ma'ajiyar poller](/ha/concepts/the-poller-cache/).

## Hanyoyin gazawa

| Alama | Dalilin da aka saba |
|---|---|
| Komai yana tattarawa sai dai ƙididdigar baƙi | An saita na'urar don SNMP v3 kuma rubutun baƙo yana magana da v1 |
| Ƙididdigar baƙi daidai ne, ƙididdigar ƙarfi ba ta da sifili | Bincika ainihin rubutun yanayin wutar lantarki da kuma ko tafiya ta biyu ta yi nasara |
| Ƙididdigar baƙi ta faɗi zuwa sifili kuma ta murmure | Bincika tafiye-tafiye da suka gaza/marasa komai; mataimaki na iya fitar da cikakken layin sifili |
| Zane-zanen sarrafawa suna bayyana sannan su tsaya bayan canjin kayan aiki | Bincika fihirisar da aka canza da kuma ƙuntatawar kunshin zuwa lamba ɗaya ko biyu |
| CPU na mai masaukin baki yana da faɗi kuma ƙasa yayin da baƙi ke jinkiri | Bincika gazawar tarin da kuma rikici; ana ba da rahoton tafiyar matsakaicin mara komai azaman sifili |
| Zane-zanen Datastore sun haɗa da ɓangarori waɗanda ba ku nema ba | Wakilin ya ba da rahoton su azaman ajiya |
| Jadawalin lokacin aiki yayi kama da kuskure bayan fitowar poller | Yana ba da rahoton ƙimar ƙarshe da aka rubuta ta Kadupul, ba karantawa kai tsaye ba |
| Jimillar baƙi a duk faɗin masu masaukin baki suna tsalle yayin kiyayewa | Baƙi masu ƙaura ana ƙidaya su sau biyu a taƙaice, ko a'a |
