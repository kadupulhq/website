---
title: Faɗaɗa poller
description: Abin da za a canza lokacin da tattara bayanai ya daina gamawa a cikin tazararsa, da kuma yadda za a san iyakar da kuka kai a zahiri.
banner:
  content: Kadupul yana cikin matakin pre-alpha. Tabbatar da waɗannan hanyoyin a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne; ana jiran bitar ƙwararren harshe.
sidebar:
  order: 6
---

:::caution[Tabbatar kafin amfani]
Ana samun tushen lambar, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura a halin yanzu. Gwada waɗannan hanyoyin akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Faɗaɗa poller tambaya ce guda ɗaya: shin zagayen tattara bayanai yana gamawa kafin a fara na gaba? Duk abin da ke ƙasa yana magana ne kan amsa wannan da kuma mayar da amsar ta zama e.

Karanta [Tsarin gine-gine](/ha/concepts/architecture/) da farko idan ba ku da tabbacin wane ɓangare ne ke yin tattarawar.

## Agogo biyu

Akwai tazarori guda biyu kuma ba saiti ɗaya bane.

| | Menene shi | Ƙimar da aka yarda da ita |
|---|---|---|
| Tazarar mai ƙaddamarwa | Sau nawa tsarin aiki ke fara mai tattarawa, daga cron ko sabis ɗin `cactid` | Daƙiƙa 60 ko 300 |
| Tazarar poller | Babban saurin tattarawa; matakan tushen bayanai ɗaiɗaiku na iya zama mafi tsayi | Daƙiƙa 10, 15, 20, 30, 60 ko 300 |

Lokacin da tazarar poller ta fi tazarar mai ƙaddamarwa gajarta, ƙaddamarwa guda ɗaya tana aiwatar da zagaye da dama na tattara bayanai a cikin madauki. Yawan zagaye shine tazarar mai ƙaddamarwa da aka raba ta tazarar poller.

Kasafin lokaci na dukkan ƙaddamarwar an samo shi ne daga waɗannan lambobi biyu: zagaye da aka ninka ta tazarar poller, an rage daƙiƙa biyu. Wannan shine ainihin lokacin agogon bango (wall clock) wanda ake auna aikin da shi.

## Me ke faruwa idan aiki ya wuce lokaci

Abubuwa uku daban-daban suna faruwa, kuma suna haifar da layukan rajista daban-daban guda uku.

**Ana yanke aikin.** Lokacin da lokacin da ya wuce ya zarce kasafin lokaci, poller tana yin rajista cewa an wuce iyakar lokacin aiki, tana rubuta ƙididdigarta, sannan ta fita. Aikin da bai samar da samfuri ba na iya barin giɓi. Samfuran da aka riga aka karɓa a cikin jerin gwano na dindindin na iya zama a jira don samun nasarar rubutun RRD daga baya; wuce lokaci ba ya nufin an jefar da kowane ma'auni da ba a fitar ba. Bincika zurfin jerin gwano da rajistan ayyukan tare da jadawali, kuma kada ku share layuka da aka riƙe don ganin aiki na gaba ya yi kyau.

**Aiki na gaba yana lura da ɓarnar da ta rage.** A lokacin farawa, poller tana ƙidaya layukan tsari waɗanda ba a taɓa rufe su ba kuma tana gargaɗin cewa an gano matakai sun wuce zagayen jefa ƙuri'a. Bincika bayanan da ba a gama ba ko tsoffin bayanan tsari da ainihin yaran da ke gudana; gargaɗi shi kaɗai ba ya gano ainihin matsalar.

**Agogo yana yawo daga juna.** Idan lokaci mai tsawo ya wuce tun aikin ƙarshe fiye da yadda kasafin lokaci ya ba da izini, poller tana gargaɗin cewa mai ƙaddamarwa ba ya aiki tare da tazarar poller. Wannan yawanci matsalar mai ƙaddamarwa ce, ba poller ba: shigarwar cron a mitar da ba daidai ba, sabis da aka tsayar, ko kuma uwar garken da ke barci.

Waɗannan hanyoyin suna kiran mataimakin sanarwar gudanarwa. Isarwa ya dogara da masu karɓa da aka saita, sarrafa sanarwa da aikin sufurin imel; gargaɗin rajista ba ya tabbatar da cewa imel ya isa. Duba [Sanarwar imel](/ha/guides/send-email-notifications/).

Akwai shari'a ta huɗu wacce ba wuce lokaci bace. Idan aka sake fara poller da wuri fiye da yadda ake tsammani, tana yin rajista cewa an saita ta don yin aiki akai-akai kuma ta fita ba tare da tattarawa ba. `--force` tana tsallake wannan binciken lokaci; yi amfani da ita kawai yayin binciken gano matsala da aka sarrafa tare da dakatar da tsara lokaci da sauran ƙaddamarwa da hannu. Ba ta ƙara ƙarfin aiki ko sanya tattarawa mai haɗawa ta zama mai aminci ba.

## Layin ƙididdiga

Kowane aiki da aka kammala yana rubuta layin ƙididdiga guda ɗaya zuwa rajista. Yana ɗauke da lokacin da ya wuce, hanyar tattarawa, ƙididdigar tsari da zaren aiki, adadin na'urori, na'urori a kowace tsari, tushen bayanai, da fayilolin RRD da aka sarrafa.

Bi diddigin yanayin lokacin da ya wuce, jinkiri na ƙarshe, zurfin jerin gwano da sabuntawa da suka gaza. Bincika har ma da keɓantaccen aikin da ya kusan cika kasafin lokaci lokacin da yake haifar da giɓi; ci gaba mai dorewa yana taimakawa wajen gano lokacin da ƙarfin aiki ko halayen tattarawa ke buƙatar canzawa.

## Hanyoyin aiki da zaren aiki

Maballai biyu, kuma suna yin abubuwa daban-daban.

| Maballi | Sashin aikin da yake rabawa | Wanne mai tattarawa ke amfani da shi |
|---|---|---|
| Matakai (Processes) | Na'urori, an raba su zuwa jeri mai ci gaba na ID na na'ura | Duka biyun |
| Zaren aiki (Threads) | Abubuwan da ke cikin na'ura ɗaya | Spine kawai |

Sakamakon shine ɓangaren da mutane ke yawan kuskure a kai: **ana sanya wa tsari guda ɗaya cikakkun na'urori.** Na'ura ɗaya mai tushen bayanai dubu biyar ba za a iya rarraba ta a tsakanin matakai da yawa ba. Tana faɗawa cikin tsari ɗaya kuma wannan tsarin yana ɗaukar duk tsawon lokacin da yake buƙata. Ƙara matakai ba ya taimaka mata da komai.

Dukansu ƙimomin ana ajiye su ne ga kowane mai tattara bayanai, ba a duniya baki ɗaya ba. Ƙimomin da ke shafin saituna su ne saitattun ƙimomi da ake amfani da su lokacin da aka ƙirƙiri sabon mai tattara bayanai. Canza saitin da aka riga aka saita ba ya canza mai tattarawa da ke akwai.

Akwai kuma ƙididdigar zaren aiki a kowace na'ura, wanda shine yadda ake raba babbar na'ura guda ɗaya. Ya shafi mai tattarawa na C kawai.

Balance Process Load yana amfani da tarin adadin abubuwa don zaɓar iyakoki tsakanin cikakkun na'urori a cikin tsarin ID na na'ura. Ba ya raba na'ura ɗaya ko ba da tabbacin daidaiton adadin abubuwa, kuma adadin abubuwa ba shine lokacin aiwatarwa ba. Kwatanta lokacin kowane tsari kafin da bayan kunna shi akan keɓantaccen aiki na wakilci.

## Mai tattarawa na PHP da mai tattarawa na C

Mai tattarawa na PHP, `cmd.php`, yana zuwa tare da aikace-aikacen. Kadupul na shirin kula da reshen Spine, amma ba a rubuta inda tushensa yake da ingantattun gine-gine ba har yanzu. Yi amfani da PHP har sai an sami wannan shaidar. Kwatancen Spine, saitunan zaren aiki da umarnin da ke ƙasa suna bayyana halayen da aka gada, ba aiki da aka tallafa ko aka shirya na Kadupul ba.

| | Mai tattarawa na PHP | Spine |
|---|---|---|
| Daidaito (Parallelism) | Matakai kawai | Matakai da zaren aiki |
| Saitin zaren aiki | An tilasta zuwa 1 ba tare da la'akari da sanyi ba | Ana girmamawa |
| Uwar garken rubutu | Ɗaya a kowane tsari, ba za a iya daidaitawa ba | 1 zuwa 15 a kowane tsari, ana iya daidaitawa |
| Ƙarewar lokacin rubutu | Ba a amfani da shi | Ana amfani da shi, tsoho daƙiƙa 25 |
| Shigarwa | Yana zuwa tare da lambar | Shirye-shiryen reshe; babu ingantaccen ginin Kadupul da aka rubuta |

Yana da kyau a faɗi adadin zaren aiki da aka tilasta a sarari: idan aka saita mai tattarawa zuwa na PHP, canjin zaren aiki na lokacin aiki yana saita zuwa 1; wannan ba ya sake rubuta saitin zaren mai tattarawa da aka adana. Faɗaɗa mai tattara PHP na iya haɗawa da ƙarin matakai, kuma jagora a cikin tushen shine zama a ko ƙasa da ninki biyu na ƙididdigar CPU core.

Tsarin Spine da halayen umarni suna buƙatar tabbaci akan ainihin binary ɗin da ake kimantawa. Tushen aikace-aikacen PHP shi kaɗai ba ya kafa tsarin binciken tsari, halayen zaren aiki ko sakamako masu illa.

Misalai da aka gada don keɓantaccen kimantawar Spine, ba ingantattun umarnin Kadupul ba:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` an yi niyya ne don guje wa rubuta sakamako. Har yanzu tana tuntuɓar na'urori kuma tana gudanar da rubutun tattarawa; tabbatar da sakamakonta a cikin keɓantaccen gwaji da farko.

## Haɗin bayanan bayanai (Database connections)

Zaren aiki ba kyauta bane. Kowane zaren Spine yana riƙe da nasa haɗin bayanan bayanai, kuma kowace uwar garken rubutu ma haka take yi.

```
estimated worker connections = processes * (threads + script_servers)
```

Wannan shine ƙiyasin a cikin taimakon saitunan aikace-aikace, ba ma'aunin iyaka mafi girma ba. Haɗa shi a cikin masu tattarawa kuma ƙara ƙarfin aiki don iyayen poller, buƙatun yanar gizo, kiyayewa da sauran abokan ciniki. Auna ainihin kololuwar haɗi da haɗin da aka ƙi kafin zaɓar iyakar bayanan bayanai; haɓaka shi kuma yana cinye albarkatu.

Ƙarewar haɗi na iya haifar da ɓacewar samfurori, amma giɓin da ke juyawa ba shine bincike na musamman ba. Tabbatar da shi tare da ma'aunin haɗin bayanan bayanai da kurakuran aikace-aikace.

## Jinkirta rubutun RRD

Akwai yanayin da ke hana poller yin rubutu zuwa fayilolin RRD a kowane zagaye. Sakamako yana taruwa a cikin teburin bayanan bayanai a maimakon haka kuma ana fitar da su da yawa, ko dai akan mai ƙidayar lokaci ko lokacin da jadawali ya nemi fayil ɗin. Yana musanya adadi mai yawa na ƙananan rubuce-rubuce don ƙaramin adadi na manyan rubuce-rubuce.

Abubuwa biyu game da shi waɗanda ke da mahimmanci a aiki:

- Ana buƙatarsa lokacin da kuke da masu tattara bayanai na nesa. Wannan ba shawara bace, sharadi ne da software ta gindaya.
- Teburin buffer yana da karko, ba a cikin ƙwaƙwalwa kawai yake ba, don haka samfuran da ba a fitar ba suna rayuwa bayan sake farawa. Suna kuma nufin fayilolin RRD ɗinku suna bayan bayanan bayanan ku. Duba [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/) kafin ku ɗauki hoton kowane abu.

Babban layin gwano na `poller_output` mai gudana shima InnoDB ne a cikin wannan bita. Binciken ajiya na farko yana ƙin jerin gwano na MEMORY; haɓaka iyakar teburin heap ba ya warware wannan ƙin yarda. Tare da dakatar da masu samarwa da kuma riƙe madaidaicin madadin bayanai, canza jerin gwano da aka gada da ba su dace ba a sarari, sannan duba ajiya a matsayin kowane asusun sabis:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Waɗannan ayyuka ne daban-daban. Adana layuka da ke jira kuma kula da sararin faifan bayanan bayanai da tsawon lokacin jerin gwano tare da ƙididdigar layuka. Duba [Haɓaka cikin aminci](/ha/guides/upgrade-safely/) don zaɓin jerin gwano, binciken amincin asusun sabis da abubuwan da ake buƙata kafin sake farawa.

## Yaushe za a koma ga masu tattara bayanai na nesa

Mai tattara bayanai na nesa shine na'ura ta biyu da ke gudanar da lamba iri ɗaya tare da ID na mai tattarawa daban, tana binciken rukuni na na'urori tare da rubuta sakamako zuwa babban rumbun adana bayanai.

Koma zuwa ɗaya lokacin da matsalar ke kan ɓangaren tattarawa maimakon ɓangaren ajiya:

- CPU ɗin mai masaukin poller yana cika yayin aiki kuma ba ya aiki a tsakanin ayyuka.
- Jinkirin zuwa da dawowa zuwa ƙungiyar na'urori yana mamaye aikin, kuma wannan rukunin yana bayan hanyar haɗi guda ɗaya.
- Wani wuri yana can nesa da hanyar sadarwa ta WAN wanda ba ku son yin zabe ta cikinsa.
- Kuna buƙatar tattara bayanai a keɓantaccen wuri, kuma kun tabbatar da buffering na layi da murmurewa don wannan mai tattarawa kafin dogaro da shi.

Masu tattarawa na nesa ba sa cire iyakar rubutun bayanan bayanai na tsakiya ko na RRD. Auna shigarwa ta tsakiya da ƙarfin fitarwa kafin haɓaka saurin tattarawa; ƙarin masu samarwa na iya haɓaka ayyukan da ke jiran aiki.

Kowane mai tattarawa yana ɗauke da nasa tsari da ƙididdigar zaren aiki, nasa takaddun shaida na bayanan bayanai, da tazarar aiki tare, wanda tsoho yake awanni biyu. Akwai kayan aikin layin umarni don tilasta cikakken aiki tare maimakon jira.

Babban shigarwar na iya kwafi gidan yanar gizon da lambar toshewa zuwa masu tattarawa na nesa don su sabunta kansu. Ana iya kashe wannan kwafin idan kun tura lamba ta wata hanya daban.

## Wace iyaka kuka kai

Yi amfani da wannan tebur don ƙirƙirar ra'ayoyi, sannan tabbatar da su tare da rajistan ayyukan da ma'auni. Iyakoki da yawa na iya faruwa tare. Zaɓuɓɓukan Spine ba a tabbatar da su a nan ba tukuna.

| Kallo | Iyaka | Abin da za a canza |
|---|---|---|
| Gargaɗin mai ƙaddamarwa ba ya aiki tare, poller kuma tana da sauri | Jinkirin tsarawa, wuce lokaci a baya ko katsewar uwar garke | Bincika tarihin ƙaddamarwa da yanayin tsari |
| Lokacin aiki bai canza ba, na'ura ɗaya tana makara koyaushe | Amsoshi a hankali, rubutun da ke cin kuɗi ko aiki mai zurfi | Auna lokacin hanyoyin shigar da bayananta kuma duba halayen ƙarewar lokaci/sake gwadawa |
| Lokacin aiki yana ƙaruwa tare da adadin na'urori, CPU ya cika | Matsin CPU na mai tattarawa | Auna ko ƙarin matakai zasu taimaka; la'akari da wurin mai tattarawa |
| Lokacin aiki yana ƙaruwa tare da adadin na'urori, CPU ba ya aiki | Jiragen sadarwa, rubutu ko bayanan bayanai | Auna tushen jira kafin canza aiki tare |
| Samfuran da suka ɓace akan rukunin na'urori masu juyawa | Haɗi, ƙarewar lokaci ko wasu gazawar tattarawa | Bincika kurakurai, ma'aunin haɗi da jerin gwano da aka riƙe |
| Lokacin aiki yana da kyau, rubutun RRD yana da jinkiri, diski yana aiki | Ajiya | Jinkirta rubutun RRD, ko diski mai sauri |
| Komai yana da jinkiri ciki har da dandalin yanar gizo | Rumbun adana bayanai | Girman tafkin buffer, sannan uwar garken bayanan bayanai |

Tarkuna biyu da suka cancanci ambato.

**Canza tazarar tushe ba daidai yake da canza kowane mataki na tushen bayanai ba.**
Daidaita bayanan martaba, matakan abubuwan da aka adana a kache da ma'anar bugun zuciya/mataki na RRD. Sake gina kache ba ya sake fasalin fayilolin RRD da ke akwai. Duba
[Sarrafa riƙe bayanai](/ha/guides/manage-data-retention/) da
[Lokaci da tazarori](/ha/concepts/time-and-intervals/).

**Tazara mai sauri tana ninka komai.** Tafiya daga daƙiƙa 300 zuwa 60 ba ya sa aikin ya zama mai arha sau biyar. Hanyoyin da aka saita don wannan saurin ana tattara su akai-akai; hanyoyin da ke riƙe da matakai masu tsayi ba sa buƙatar gudana a kowane zagaye na tushe. Auna nauyin da ke haifarwa maimakon ɗauka cewa kowane zagaye yana da aiki daidai.
