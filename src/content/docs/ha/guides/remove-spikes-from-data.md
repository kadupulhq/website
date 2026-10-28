---
title: Cire spikes daga bayanai
description: Yi samfoti na gyaran spikes, kiyaye kwafin dawowa, kuma ka tabbatar da canje-canje ga samfuran RRD da aka riƙe.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 19
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

:::danger[Wannan yana sake rubuta tarihi; dawo da shi yana buƙatar ajiyar madadin bayanai]
Cire spike yana fitar da bayanan taskar ajiya zuwa XML, yana gyara ƙimomi, yana dawo da fayil ɗin wucin gadi na kusa sannan ya maye gurbin ainihin bayan an tabbatar da shi. Babu tsarin soke aiki na atomatik. Kiyaye kuma ka tabbatar da kwafin dawo da bayanai, gudanar da `--dryrun` da farko, kuma ka tabbatar da samfuran da aka nufa kafin aiwatar da canji.
:::

Muinuko ko spike a nan yana nufin samfuri ɗaya ko biyu da suka fi komai girma a kusa da su har ta yadda layin tsaye ya daidaita da su kuma sauran jadawalin ya daidaita zuwa ƙasa. Ma'aunin ba daidai ba ne, kuma yana da ƙara sosai a cikin nuni.

## Daga ina suke fitowa

Yawancin spikes a kan tushen bayanai na counter lissafi ne, ba ainihin ma'auni ba. Tushen bayanai na counter yana adana ƙimar da aka lissafta daga bambanci tsakanin karatu biyu. Duk wani abu da ke sa karatu na biyu ya fi na farko girma sosai, dangane da lokacin da ke tsakanin su, na iya haifar da ƙimar ƙarya. Sake saita counter, kuskuren sarrafa wrap, sake tsara faharisa wanda ke matsar da karatu zuwa tushen bayanan da ba daidai ba, ko kuskuren tambarin lokaci na iya haifar da wannan. Tsarin wrap na yau da kullun na counter ba shaida ce ta mummunan samfuri ba; tabbatar da nau'in tushen bayanai da karatun shigarwa.

Duba [Tushen bayanai da ma'adanai](/ha/concepts/data-sources-and-rras/) don yadda ake samo ƙimar.

Gyara dalilin a duk inda za ka iya. Cire spike abu ne na gyaran fuska kawai; ba ya hana na gaba faruwa.

## Hanyoyi huɗu

Kayan aiki yana aiki a kan dukkan fayil ɗin: yana zubar da kowace taska a cikin fayil ɗin RRD, ya yanke shawarar waɗanne ƙimomi za a maye gurbinsu, sannan ya mayar da sakamakon.

| Hanya | Abin da take zaɓa | Yana buƙatar taga |
|---|---|---|
| `stddev` | Ƙimomi fiye da karkacewar daidaitaccen N daga ma'ana | A'a |
| `variance` | Ƙimomi fiye da kashi N a sama da ma'ana bayan an yar da outliers | A'a |
| `float` | Komai a cikin ƙayyadadden tagar lokaci | Ee |
| `fill` | Samfuran da ba a sani ba da kuma masu ƙimar sifili a cikin ƙayyadadden tagar lokaci | Ee |

`stddev` da `variance` suna farauta ne. `float` da `fill` suna yin abin da ka gaya musu a cikin kewayon da ka ambata, kuma duka biyun suna kasawa nan da nan idan ba ka ba da farko da ƙarshe ba.

`fill` ba a iyakance shi ga ɓatattun bayanai kawai ba: yana iya maye gurbin sifilin da aka auna da ƙimomin da ba sifili ba. Kada ka yi amfani da shi a kan kewayon da ke ɗauke da ingantattun karatun rashin aiki ko sifili sai dai idan an yi niyyar wannan canjin.

Hanyar bambance-bambance (variance) tana yar da manya da ƙananan samfuran N kafin ƙididdige matsakaicin da take kwatanta su da shi, inda N shine saitin outliers. Wannan shine abin da ke hana spike ɗaga ƙofar da aka yi niyyar kama shi.

Duk abin da aka zaɓa ana maye gurbinsa, kuma akwai maye gurbi guda uku.

| Maye gurbi | Sakamako |
|---|---|
| `last` | Ƙarshen ƙimar da aka sani tana da kyau. Na asali. |
| `avg` | Ƙididdigar matsakaici don filin/taska; lissafin ya dogara da hanya. |
| `nan` | Wanda ba a sani ba (unknown) don hanyoyin ƙididdiga; duba iyakancewar hanyar taga a ƙasa. |

Wanda ba a sani ba yana rikodin cewa babu ma'auni mai amfani. `last` da `avg` suna maye gurbin ƙimomin da za su iya zama kamar an auna su ga wanda ke karanta jadawali daga baya. Zaɓi maye gurbin da gangan kuma ka tabbatar da ainihin sakamakon da aka adana.

**Hanyoyin taga tare da NaN:** tare da `--avgnan=nan`, `float` yana maye gurbin kowane sanannen ƙima a cikin taga da wanda ba a sani ba, kuma `fill` yana maye gurbin sifili ko ƙimomin da ba na lamba ba a cikin taga da wanda ba a sani ba. Hanyoyin ƙididdiga tare da iyakokin lokaci na zaɓi suna maye gurbin outliers da aka gano kawai, don haka ba su yi daidai da share duka taga ba.

## Samfoti, sannan ka aiwatar

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Gwajin dry run yana zubar da RRD kuma yana bincika shi ba tare da sake rubuta ainihin fayil ɗin mai aiki ba. Har yanzu yana buƙatar kundin aiki mai amfani da damar kiyayewa. Samfoti ba ya keɓe fayil ɗin har sai an aiwatar daga baya: sabbin samfurori ko zaɓuɓɓukan da aka canza na iya canza sakamakon. Misalin da ke da taga har yanzu yana amfani da zaɓin ƙididdiga; ba ya cire kowane ƙima a cikin wannan taga.

Hujjojin lokaci suna karɓar ko dai tambarin lokaci na Unix ko kirtani na kwanan wata. Ana ƙin karɓar kirtani da ba za a iya bincika ba kafin sake rubutawa. Yi amfani da tambarin lokaci na Unix lokacin da fassarar yankin lokaci za ta kasance ba a bayyana ba.

## Abin da ke faruwa a zahiri ga fayil ɗin

Yana da kyau ka sani kafin ka gudanar da shi a kan wani abu da kake buƙata.

1. Ana zubar da fayil ɗin zuwa XML a cikin kundin ajiya.
2. Ana cire bayanan sharhi kuma ana bincika kowace taska don ƙididdiga.
3. Ana maye gurbin zaɓaɓɓun ƙimomi a cikin XML.
4. Ana kwafin ainihin fayil ɗin zuwa kundin ajiya.
5. Ana mayar da XML ɗin da aka gyara zuwa fayil ɗin sirri na kusa, a tabbatar da shi, sannan a sake masa suna a kan na asali yayin da ake kiyaye mai shi, rukuninsa da yanayinsa.

Mataki na 4 shine hanyar tsaro, kuma ba na zaɓi bane: idan kwafin ya gaza, ba za a sake mayar da shi ba. Wannan kwafin, ba kowane tutar layin umarni ba, shine abin da zaka dawo da shi daga ciki. Sunansa ya dogara ne akan na asali kuma yana iya samun ƙarin kalma ta musamman don kauce wa sake rubuta kayan aikin da ke akwai. `--backup` yana ƙara neman hoton dawo da dindindin. Karanta hanyoyin da aka ruwaito kuma ka tabbatar da kwafin kafin ka dogara da su.

Aikin yana buƙatar amintattun kundayen adireshi na POSIX na gida da kullewar kiyayewa; izinin yanayin rubutu kaɗai ba su isa ba. Yana ƙin ajiyar da ba a tallafawa da kuma saita rrdcached endpoint. Dakatar da marubuta na waje, waɗanda ba sa shiga cikin yarjejeniyar kulle ta Kadupul. Gudanar da aikin a matsayin asusun sabis na mallakar ajiya da aka nufa. Duba [buƙatun shigarwa](/ha/reference/requirements/) don samun damar ajiya.

## Saitunan da ke sarrafa tsoffin ƙimomi

Hujjojin layin umarni suna yin nasara a kowane lokaci. Duk abin da ka bari yana fitowa ne daga saitunan tsarin, kuma saitunan kowane mai amfani suna soke na tsarin lokacin da aka gudanar da kayan aiki daga tsarin.

| Saiti | Asali | Abin da yake yi |
|---|---|---|
| Hanyar cirewa | Variance tare da cire outliers | Wace hanya za a yi amfani da ita |
| Hanyar maye gurbin | Sanannen mai kyau na ƙarshe | Abin da ke maye gurbin ƙimar da aka cire |
| Adadin karkacewar daidaitacce | 10 | Ƙofar hanyar `stddev` |
| Kashi na bambance-bambance | 1000 | Ƙofar hanyar `variance` |
| Adadin bambance-bambancen outliers | 5 | Manyan da ƙananan samfuran da aka yar kafin matsakaici |
| Matsakaicin kashewa a kowace RRA | 5 | Rufin da aka nufa; a halin yanzu ba a tilasta shi da dogaro ba |
| Kundin ajiya na RRDfile | `cache/spikekill/` ƙarƙashin shigarwa | Inda dump da kwafin ke tafiya |
| Riƙewar ajiya | Watanni 3 | Tsawon lokacin da ake ajiye kwafi |

Akwai kuma yanayin batch: jadawali (kowane sa'o'i 6, 12, 24 ko 48), lokacin tushe, da jerin samfuran jadawali don aiki a kai. Yanayin batch a kashe yake a asali. Kunna shi yana nufin tsarin yana gyara taskoki ba tare da kowa ya kalli sakamakon ba. Iyakance jerin samfuri sosai idan ka kunna shi kwata-kwata.

## Tarko

**Ƙofofin asali an sassauta su da gangan.** Karkacewar daidaitacce goma da kashi 1000 na bambance-bambance suna da faɗi sosai. Gudanar da aikin da bai bayar da rahoton spikes ba wataƙila bai gaza ba; ya gaya maka cewa ƙimomin suna cikin ƙungiyar da ka nema. Ƙara ƙarfafa ƙofar maimakon canza hanyoyi ba gaira ba dalili.

**Matsakaicin kashewa a kowace RRA yana iyakance hanyoyin ƙididdiga kawai.** Don `stddev` da `variance`, ƙidaya tana rufe duk hanyoyin bayanai a cikin taska ɗaya kuma tana sake saitawa a taska ta gaba. Hanyoyin taga na `float` da `fill` suna maye gurbin kowane ƙimar da ya dace a cikin taga. Jimillar ƙidaya ta haɗa da maye gurbin NaN. Bincika cikakken samfoti kuma yi amfani da ƙaramin tagar lokaci.

**Ba za a iya dawo da ƙimar da aka haɗa ba.** Tsofaffin taskoki suna riƙe da ƙima ɗaya a kowace kwando, wanda aka riga aka yi matsakaici. Maye gurbin wannan ƙimar ba ya mayar da ainihin ma'aunin kwandon; yana maye gurbin wanda zai iya yiwuwa ne kawai. Yayin da kake komawa baya, gyaran ya fi zama zato.

**Dole ne a saita kundin ajiya kuma a amince da shi.** Dump da kwafin dawo da bayanai suna tafiya can. Ana ƙin kundayen da suka ɓace, marasa tsaro ko waɗanda ba za a iya tabbatar da su ba; kada ka mai da kundin adireshi mai iya rubutu ga kowa (world-writable) don kauce wa gazawa.

**Ajiye rikodin canjin kanka da kuma bayanan manhaja.** Yi rikodin mai aiki, umarni, kewayon lokaci, hanyoyin ajiya da binciken kafin/bayan aiki. Ƙididdigar taƙaitawa kaɗai ba cikakkiyar shaida bace ta abin da ya canza.

**Gudanar da shi a matsayin asusun sabis da aka nufa.** Maye gurbin da ya yi nasara yana kiyaye ikon mallakar fayil da yanayi. Root ba gajeriyar hanya bace ta wuce binciken amincin kundin adireshi; tabbatar da cewa jefa ƙuri'a na yau da kullun zai iya ci gaba da sabunta sakamakon.

**Cire spike ba ya gyara jadawali idan tushen bayanai ba daidai ba ne.** Idan sake tsara faharisa ya matsar da ƙimomi zuwa tushen bayanan da ba daidai ba, spike alama ce kawai. Duba [Magance matsalolin ɓatattun bayanai](/ha/guides/troubleshoot-missing-data/) kafin ka fara gyara taskoki.
