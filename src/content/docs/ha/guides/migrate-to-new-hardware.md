---
title: Ƙaura zuwa sabon kayan aiki
description: Matsar da shigarwa mai aiki zuwa wata uwar garke ba tare da rasa tarihi ba, a cikin tsari da ke kiyaye kowane mataki mai inganci.
banner:
  content: Kadupul yana cikin matakin pre-alpha. Tabbatar da waɗannan hanyoyin a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne; ana jiran bitar ƙwararren harshe.
sidebar:
  order: 20
---

:::caution[Halayen wakilin RRDtool da aka gada]
Ba a tallafawa turawar wakilin RRDtool a cikin Kadupul. Yi amfani da ajiyar RRDtool na gida
(`storage_location = 0`). Saitunan wakili, cikakkun bayanan yarjejeniya da tsarin aiki
a wannan shafin suna rubuta halayen da aka gada, ba amintaccen tsari ko hanyar ƙaura ba.
Duba [Wakilin RRDtool](/ha/reference/rrdproxy/).
:::

:::caution[Tabbatar kafin amfani]
Ana samun tushen lambar, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura a halin yanzu. Gwada waɗannan hanyoyin akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Ƙaura shine maido da bayanai akan na'urar da ta bambanta da wacce madadin bayanan ya fito daga gare ta.
Duk abin da ke cikin [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/) ya shafi nan;
wannan shafin yana rufe abin da ya bambanta kawai saboda makoma ba ita ce tushe ba.

Abubuwa uku sun bambanta, kuma kowannensu yana da nasa yanayin gazawa.

| Bambanci | Abin da yake karyawa |
|---|---|
| Hanyoyi daban-daban | Hanyoyin fayil da aka adana a cikin bayanan bayanai da kache na poller |
| Masu amfani da ID na rukuni daban-daban | Samun damar fayil da binciken amincin ajiya na iya kasawa |
| Nau'ikan lokacin aiki daban-daban | Tsawaitawa, halayen bayanan bayanai da dacewar RRD na iya bambanta |

## Kafin taɓa komai

Gina makoma da farko kuma kawo ta wurin da sabon shigarwa zai yi aiki:
uwar garken bayanan bayanai tana aiki, abubuwan da ake buƙata na PHP suna nan, RRDtool yana nan, mai tattarawa da aka zaɓa yana samuwa, kuma an saita uwar garken yanar gizo. Ajiye poller dinta, ayyukan da aka tsara, kwafi na nesa da sanarwar fita a kashe. Kada ku gudanar da mai shigarwa. Kuna shirin maye gurbin rumbun adana bayanai, kuma gano tsarin da aka shigar rabinsa ya fi wahala fiye da tsarin da babu komai a ciki.

Daidaita gyare-gyaren aikace-aikacen da abubuwan dogaro daidai, gami da gyare-gyaren gida da abubuwan toshewa.
Teburin `version` na bayanan bayanai yana rikodin sigar tsarin, ba kowane canjin tushe ba;
daidaita wannan ƙimar kaɗai bai isa ba. Sake tura mai shigarwa na iya nuna rashin daidaituwar tsari ko maido da bai cika ba. Shigar da lamba iri ɗaya da kuke barwa, ƙaura, tabbatar cewa tana aiki, sannan haɓaka azaman aiki daban ta amfani da [Haɓaka cikin aminci](/ha/guides/upgrade-safely/).

Yanke shawarar hanyar shigarwa yanzu. Tsayar da shi iri ɗaya akan duka injunan biyu yana kawar da yawancin aikin da ke ƙasa. Idan ba za ku iya ba, karanta sashin hanyoyi kafin farawa.

## Tsarin ayyuka

Kowane mataki yana bincika wanda ya gabace shi, don haka kada ku sake tsara su.

1. **Dakatar da duk masu samarwa a tushe da makoma.** Dakatar da tsara lokaci, na nesa, wanda yanar gizo ke haifarwa, da tattarawa da kiyayewa da hannu; ba da damar ayyukan da ke gudana su gama. Fitar da rubuce-rubucen da aka jinkirta kawai bayan masu samarwa sun tsaya. Adana duk wani layin da ba a tabbatar ba tare da madaidaicin bayanan bayanai da madadin RRD; kada ku yanke su (truncate).
2. **Ɗauki madadin bayanai.** Rumbun adana bayanai, bishiyar RRD, daidaitawa, an ɗauka tare. Dokokin daidaito a cikin [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/) sune babban ma'anar.
3. **Matsar da bishiyar RRD.** Duba ƙasa don yadda ake yi.
4. **Matsar da bayanan bayanai.**
5. **Matsar da lamba, tsari da duk abin da tsarin ke nunawa.** Wannan ya haɗa da `plugins/`, `scripts/`, `resource/`, da duk wani fayil na gida wanda hanyar shigar da bayanai ke kira.
6. **Sake amfani da tsarin makoma bayan maidowa ta ƙarshe.** Hanyoyi madaidaita, wuraren ƙarshe na bayanan bayanai, mallakar sabis da saitunan amincin ajiyar lambobi.
7. **Sake gina kache na poller.**
8. **Gudanar da binciken ajiya a matsayin kowane asusun sabis, sannan fara tattarawa a makoma kawai.** Kula da fayilolin wakilci da zurfin jerin gwano da aka riƙe.

## Matsar da bishiyar RRD

Fayil na RRD fayil ne na binary wanda tsarinsa na ciki ya dogara da yadda aka rubuta shi.
Kwafin binary yana buƙatar tsarin gine-gine mai jituwa da tsarin RRDtool; daidaita sunayen tsarin aiki ko girman kalma kaɗai ba hujja bace akan hakan. Rashin jituwa na iya haifar da kurakuran karatu. Tabbatar da fayilolin da aka kwafi ta amfani da RRDtool na makoma.

Idan ba ku da tabbacin duka biyun sun yarda, canza maimakon kwafi. Zubarwa da maidowa na RRDtool yana samar da fom ɗin rubutu mai ɗaukuwa; Kadupul tana amfani da nau'i ɗaya a ciki lokacin da take buƙatar sake rubuta tarihin ajiya.

A tushe, tare da dakatar da marubuta, yi amfani da sabon kundin adireshi na sirri na tsarawa:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Canja wurin cikakken XML cikin aminci. Maido a makoma don sabon ɗan takara:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Maimaita don kowane fayil da ke buƙatar canzawa kuma bincika matsayin fita na kowane umarni. Kada ku shigar da zubar da bai cika ba ko 'yan takarar da ba a tabbatar ba. RRDtool tana rubuta XML azaman [tsarin canja wurin tsarin gine-gine](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Tabbatar kafin ɗaukar hanyar jinkiri. Kwafi fayil ɗaya, gudanar da `rrdtool info` akansa a makoma, kuma kwatanta mataki, taskoki, lokacin sabuntawa na ƙarshe da sunayen tushen bayanai. Kwatanta kuma sakamakon `fetch` a cikin sanannen tazarar da aka cika. Maimaita don shimfidar wuraren adana wakilci kafin matsar da bishiyar, sannan tabbatar da dukkan jerin fayilolin. Duba [Dawo da gurbataccen RRD](/ha/guides/recover-a-corrupted-rrd/) don tabbatar da ɗan takara da buƙatun mallaka.

Duk yadda kuka matsar da su, adana tsarin kundin adireshi daidai. Ƙananan kundayen adireshi da ke ƙarƙashin kundin adireshi na RRA ba ado bane; ana yin rikodin hanyar kowane fayil a kowane tushen bayanai, kuma daidaita bishiyar yana karya kowannensu.

## Rumbun adana bayanai

Zubarwa ɗaya da lodawa ɗaya. Abubuwa biyu da za a bincika a cikin canja wuri.

Bincika saitin haruffan tebur da aka dawo dasu, haɗawa da injin ajiya, ba tsoffin saitunan uwar garke kawai ba. Adana ma'anar tushe kuma tabbatar da dacewa tare da sigar bayanan makoma kafin canzawa.

**Jerin gwanon mai tattarawa ba kache bane da za a iya jefarwa.** Layin gwano na `poller_output` na yanzu dole ne ya yi amfani da InnoDB. Binciken ajiya na farko yana ƙin jerin gwano na MEMORY. Adana layukansa da haɓaka da jerin gwano na lokaci-lokaci har sai an tabbatar da samfuran; madadin RRD bazai haɗa da waɗancan ma'aunin ba tukuna. Kada ku ɗauka teburin MEMORY da aka dawo dashi fanko ne: zubar da hankali na iya ƙunsar abubuwan da ke sake cika shi.

Tare da dakatar da marubuta da kuma samun amintaccen madadin bayanai, za a iya canza jerin gwano da ba na InnoDB ba a sarari:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Gudanar da binciken ajiya a ƙarƙashin kowane ainihin asusun yanar gizo da na poller. Wannan yana bincika damar ajiya na gida da jerin gwano da aka zaɓa; nasara a matsayin root ba ya kafa damar sabis. Masu tattara bayanai na nesa na kan layi yawanci suna yin niyya ga babban jerin gwano; yi amfani da `--local` kawai lokacin bincika jerin gwanon gida da gangan. Sauran teburan lokacin aiki/kache suna buƙatar ingantaccen kiyayewa ko shirin sake ginawa. Duba [Bukatun ajiya](/ha/reference/requirements/).

## Hanyoyi a cikin motsi

Anan ne ƙaura ke yin kuskure, saboda yawancin wannan yana kasancewa a ɓoye har sai an fara aikin tattarawa na farko.

**Hanyoyin RRA.** Daidaitattun hanyoyin tushen bayanai suna amfani da alamar `<path_rra>`. A cikin wannan bita, bootstrap yana samun `$config['rra_path']` daga kundin adireshin aikace-aikacen tare da `/rra`; wannan ba saitin bayanan bayanai bane na zaɓar kowane kundin adireshi na gida. Tabbatar da ainihin hanyar kafin matsar da fayiloli. Dole ne a bincika cikakkun hanyoyin al'ada kuma a gyara su ɗaya bayan ɗaya. Adana tsarin ƙananan kundayen adireshi.

**Kache na poller yana ɗauke da cikakkun hanyoyi.** Lokacin da aka gina kache, ana faɗaɗa alamar kuma ana rubuta cikakkiyar hanya a cikin layin kache. Canza kundin adireshi na RRA kuma kache har yanzu yana nuna tsohon. Poller tana ci gaba da aiki kuma ba ta rubuta wani abu da za ku iya samu ba. Sake gina ta.

```sh
php cli/rebuild_poller_cache.php
```

**Saitunan da ke ɗauke da hanyoyi.** Kowane ɗayan waɗannan ana adana su a cikin rumbun adana bayanai, don haka kowannensu ya fito daga tsohuwar injin yana nuna tsarin tsohuwar injin. Bincika su duka kafin aiki na farko: binary na RRDtool, binary na mai tattarawa da fayil ɗin sanyi nasa, binary na PHP, kayan aikin SNMP, hanyoyin rajista, tsohuwar font, da kundin adireshi na madadin cire ƙaya. Hakanan duba hanyoyi da ƙimar muhalli a cikin fayilolin daidaitawa, rukunin sabis, ayyukan da aka tsara, da uwar garken yanar gizo.

**Hanyoyin shigar da bayanai suna da layukan umarni.** Suna amfani da alama don tushen shigarwa, don haka matakin da ke adana tsarin baya buƙatar komai. Matakin da ke canza shi yana buƙatar bincika kowannensu. Haka yake shafi fayilolin XML na albarkatu a bayan tambayoyin bayanai.

**Masu tattarawa na nesa suna da nasu fayil ɗin daidaitawa**, mai ɗauke da takaddun shaida na bayanan bayanai da nasu ID na mai tattarawa. Ba sa cikin zubarwar tsakiya. Idan babban rumbun adana bayanai ya motsa, sabunta wuraren ƙarshe da suka dace kuma tabbatar da haɗin kowane mai tattarawa. Cikakken kwafi wani aiki ne daban, wanda ake gudanarwa akan babban mai tattarawa kawai lokacin da aka saita masu tattarawa na nesa da aka kunna:

```sh
php cli/poller_replicate.php
```

Wannan umarnin yana fita tare da kuskure ba tare da mai tattara nesa da aka kunna ba. Kada ku ƙara shi a matsayin binciken nasara da ake buƙata a cikin ƙaura mai tattara guda ɗaya. Tabbatar da sanyi na nesa da kwafi kafin ba da izinin tattara nesa ya ci gaba.

## Mallaka da izini

Poller tana rubuta fayilolin RRD a matsayin asusun da ke gudanar da ita. Dandalin yanar gizo yana karanta su a matsayin asusun uwar garken yanar gizo. Kwafin da ya adana ID na lambobi a cikin injuna masu shigarwar `/etc/passwd` daban-daban yana ba ku fayilolin da ba daidai ba na asusun mallakar su.

Jadawalin da ke tsayawa a lokacin ƙaura na iya nuna izini, tsofaffin hanyoyi, ɓacewar rumbun adana bayanai, tambarin lokaci, ko samfuran da aka ƙi. Bincika rajistan ayyukan poller da jerin gwano da aka riƙe kafin zaɓar gyara; jadawali shi kaɗai ba ya gano dalilin.

Bincika mallakar kundin adireshin RRA kansa da ƙananan kundayen adireshi, ba samfurin fayil kawai ba. Ana ƙirƙirar sabbin fayiloli a cikin waɗancan kundayen adireshi yayin tattarawa, don haka kundin adireshin da poller ba za ta iya rubutawa ba yana kasawa ga tushen bayanan da ba su wanzu a lokacin ƙaura ba, koda kuwa fayilolin da ke akwai suna da kyau. Sake tsara `rrd_maintenance_trusted_uids` da `rrd_maintenance_trusted_gids` a cikin `include/config.php` zuwa ainihin ainihin lambobi na makoma kuma duba amintattun magabata na kundayen adireshi. Duba [Bukatun ajiya](/ha/reference/requirements/).

## Sauyawa tare da ƙarancin asara (Cutover)

RRD tana ƙin sabuntawa a ko kafin tambarin lokacin sabuntawa na ƙarshe. Wannan yana hana sake kunnawa; ba ya tabbatar da cewa dole ne a rasa samfurori a kowace ƙaura ba. Girman giɓin ya dogara da lokacin samfurori, lokacin hutu, da kuma waɗanne ma'aunin jerin gwano aka adana. Wannan hanyar tana amfani da mai tattara guda ɗaya kuma ba ta haɗa tarihin gwaji da aka tattara da kansa a cikin saitin tattarawa na ƙarshe ba.

1. Yi cikakken gwaji a gaba tare da madadin bayanai na ranar da ta gabata. Kwafi komai, gyara kowace hanya, kuma gwada sabuntawa akan keɓantattun na'urorin gwaji tare da kashe sanarwa. Yi rikodin canje-canjen makoma a matsayin hanyar da za a iya maimaitawa. Dakatar da marubutan gwaji lokacin da gwajin ya ƙare.
2. Ajiye gwajin a gefe. Maye gurbin bayanan bayanansa da RRD tare da madaidaicin madadin na ƙarshe; kada ku haɗa layukan gwaji ko samfuran jerin gwano a cikin wannan maidowa.
3. Don sauyawa, dakatar da masu samar da tushe kuma fitar da ko adana samfuran da ke jira, sannan ɗauka kuma canja wurin madadin na ƙarshe. Sake amfani da sokewar makoma: maido da bayanan bayanai yana dawo da hanyoyin tushe zuwa `settings`, kuma maido da fayilolin daidaitawa na iya canza wuraren ƙarshe na gwaji da saitunan amintattu.
4. Sake gina kache na poller, gudanar da binciken ajiya, tabbatar da jerin fayiloli, kuma kunna tattara makoma kawai bayan waɗannan binciken sun wuce.

Auna tsawon lokacin gwaji kuma ba da damar lokaci don tabbatarwa da komawa baya. Ajiye tushen a tsaya har sai sauyawar ta yi nasara ko kuma komawa baya mai sarrafawa ya sake zaɓar shi a matsayin mai mallakar tattarawa.

## Tabbatar a cikin wannan tsari

1. Dandalin yanar gizo yana lodawa ba tare da an tura mai shigarwa ba. Idan yana turawa duba rashin daidaiton lamba/tsari, haɗin bayanan bayanai, ko maido da bai cika ba.
2. Na'urar gwaji tana amsa sabon ƙoƙarin tattarawa; matsayin "Up" da aka dawo dashi kaɗai na iya zama tsoho.
3. Lokacin sabuntawa na ƙarshe na fayil na RRD yana ci gaba bayan aikin tattarawa na farko. Bincika fayil ɗin akan diski, ba jadawali ba.
4. Jadawalin da aka zana a cikin sa'ar da ta gabata yana nuna layi, ba giɓi ba.

Idan mataki na 3 ya gaza, bincika hanyoyi, izini, binciken ajiya na farko, zurfin jerin gwano, da kurakuran RRDtool. Idan mataki na 4 ya gaza, bincika ƙimomin da aka riƙe, ma'anar jadawali, zaɓaɓɓen lokaci, da damar asusun yanar gizo. Fayil guda ɗaya mai nasara ba ya tabbatar da kowace na'ura, hanyar shigar da bayanai, ko mai tattara nesa ba.

## Tarkuna

**Kada ku gudanar da duka shigarwar akan bishiyar RRD iri ɗaya.** Masu poller guda biyu da ke rubutu a kan fayil ɗaya suna haifar da sabuntawa da aka ƙi da giɓi, ba haɗin bayanai ba.

**Kada ku maido da tsohuwar bishiyar RRD akan sabon rumbun adana bayanai.** Fayiloli ba za su cika baya ba. Tattarawa yana ci gaba daga lokacin yanzu kuma giɓin da ke tsakanin duka biyun rami ne na dindindin.

**Madadin bayanai yana ɗauke da takaddun shaida na na'ura a cikin rubutu a sarari.** Matsar da kayan aiki yana nufin waɗannan takaddun shaidar suna tafiya a kan hanyar sadarwa kuma suna zama a kan injina biyu. Ƙuntata damar madadin bayanai da rufaffen canja wuri. Riƙe kwafin komawa baya da aka adana har sai manufar karɓa da riƙewa ta ba da izinin cirewa; kada ku goge shi yayin sauyawa.

**Teburan abubuwan toshewa suna cikin rumbun adana bayanai; lambar toshewa ba ta ciki.** Maido da rumbun adana bayanai ba tare da daidaita lambar toshewa da abubuwan dogaro ba na iya karya shafukan toshewa, ƙugiyoyi ko ayyuka. Bincika kowane toshewa da ake buƙata a sarari.

**Ajiyar wakili na yanzu yana wajen wannan tsarin ƙaura.** Ba a tallafawa turawar wakili. Gano ainihin fayilolin RRD kuma yi musu madadin bayanai, sannan tabbatar da ƙaura daban zuwa ajiyar gida akan keɓantaccen kwafi. Kundin adireshi na `rra/` na gida na iya ƙunsar shara da ta rage kawai.

**Cire tsohuwar na'ura a ƙarshe, kuma ba a rana ɗaya ba.** Bar shi a kashe ko kashe duk masu samarwa, kuma kiyaye madaidaicin madadin bayanai har sai sabon tsarin ya wuce binciken da ake buƙata na tattarawa, zane, na nesa da toshewa. Ƙayyade lokacin lura daga nauyin aiki da manufofin komawa baya; mafi guntun zagayen tattarawa ba hujja bace cewa kowane ƙaramin tsari yana aiki.
