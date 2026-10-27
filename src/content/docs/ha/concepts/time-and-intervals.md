---
title: Lokaci da tazara
description: Tazarar zaɓe, matakin RRD, bugun zuciya da karkatar agogo, da kuma dalilin da ya sa tambarin lokaci a kan samfuri ke yanke hukunci fiye da yadda mutane ke tsammani.
sidebar:
  order: 7
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
---

Tattara bayanai ya ƙunshi agoguna guda uku: saurin mai ƙaddamarwa, tazarar zaɓe a cikin kowane kira, da matakin RRD. Suna buƙatar saituna masu jituwa.

| Lamba | Abin da take ciki | Yadda ake amfani da ita |
|---|---|---|
| Tazarar mai ƙaddamarwa | Cron, Task Scheduler ko `cactid.php` | Dole ne ya dace da `cron_interval`, wanda `poller.php` ke fassara a matsayin daƙiƙa 60 ko 300 |
| Tazarar zaɓe | Zagayen tattara bayanai | `poller.php` yana lissafin cikakken adadin zagaye a kowace tazarar mai ƙaddamarwa |
| Mataki (Step) | Fayil ɗin RRD | Tazarar daidaitawa ta asali, wacce aka saita daga furofayil ɗin hanyar samo bayanai a lokacin ƙirƙira |
| Bugun zuciya (Heartbeat) | Fili a cikin RRD | Matsakaicin tazarar da aka yarda da ita tsakanin sabuntawa; tsarin ƙirƙira yana karanta ma'anar filin |

Misali, mai ƙaddamarwa na daƙiƙa 60 da tazarar zaɓe ta daƙiƙa 10 suna samar da zagaye shida a kowane kira. Mai ƙaddamarwa na daƙiƙa 300 da tazarar zaɓe ta daƙiƙa 300 suna samar da zagaye ɗaya. Kada ka taɓa saita tazarar mai ƙaddamarwa ƙasa da tazarar zaɓe: 60/300 yana lissafin zagaye sifili. Yi amfani da mai tsara aiki guda ɗaya, kuma dakatar da shi kafin gudanar da aiki da hannu tare da `--force`. Duba [shigarwa](/ha/start/install/).

Gyara furofayil ba ya canza fayilolin da ke akwai ta atomatik. Ana iya daidaita bugun zuciya; canza mataki yana buƙatar ƙaura da aka tsara ta amfani da kayan aikin da aka shigar na RRDtool. Bincika duka ma'anar rumbun adana bayanai da sakamakon `rrdtool info` bayan haka.

## Lokacin da suka dace da juna

Hanyar samo bayanai wacce matakinta yayi daidai da tazarar zaɓe tana da cancanta a kowane zagaye dangane da yanayin na'ura, abubuwan da ke cikin kache da iyakokin lokacin aiki. Saitin asali yana amfani da daƙiƙa 300 ga duka biyun. Cancanta ba ta ba da garantin samun nasarar karatu ba.

## Lokacin da mataki ya fi tazara tsawo

Lokacin da ake buƙatar jadawalin aiki da yawa mai tattara bayanai na PHP yana amfani da `rrd_next_step` a kowane layi na jerin aiki. Yana zaɓar layukan da ke kan sifili ko ƙasa da shi, sannan yana sabunta lissafin koma-baya ga mai karɓar sa da iyakokin mai masauki. Layukan da matakinsu yayi daidai da tazarar zaɓe suna zama a sifili. Sauran layukan ana rage su da tazarar zaɓe; a ƙarƙashin ambaliya (underflow), sake saiti ya dogara da yanayin kira: zagayen mai ƙaddamarwa na al'ada yana sake saitawa zuwa mataki a cire tazara, yayin da tazarar daidai da hanyoyin duk mai masauki ke sake saitawa zuwa cikakken mataki. Kada ka ɗauka matakin mintuna goma koyaushe yana nufin madadin kiran mintuna biyar; bincika ainihin layukan da ke jira da tambarin lokacin sabuntawa.

Idan an kunna **Daidaita Nauyin Aiki (Balance Process Load)**, gina kache yana sanya matsawa a cikin jerin hanyoyin samo bayanai na na'urar ta amfani da mataki da tazarar zaɓe. Filayen tushe ɗaya suna raba matsawa guda ɗaya. Wannan na iya yada aiki a cikin zagaye, amma ba ya ba da tabbacin daidaiton lokacin aiki: jinkirin na'ura, ƙarewar lokaci da rubutun umarni sun bambanta. Mai ƙaddamarwa kuma yana daidaita rashin daidaiton lissafin koma-baya na filaye a cikin hanyar samo bayanai.

Kafin ka yanke shawarar cewa wani abu ya karye saboda bai samar da komai ba a lokacin zagaye, bincika halin da yake ciki na jira da zagaye na gaba. Don iyakokin sake ginawa, duba [kache na mai zaɓe](/ha/concepts/the-poller-cache/).

## Lokacin da mataki ya fi tazara gajarta

Gajeren mataki ba zai iya samar da ma'aunin da mai karɓa bai taɓa tattarawa ba. Kadupul yana faɗakarwa lokacin gina kache idan saurin tarawa yayi jinkiri sosai ga matakin; gyara saitunan zaɓe kuma sake gina kache ɗin da abin ya shafa.

Wannan rashin jituwa ba dole bane ya samar da zane mai kama da tsefe. RRDtool na iya daidaita sabuntawa mara yawa zuwa gajerun matakai idan bugun zuciya ya ba da dama, amma ba ya dawo da cikakkun bayanan ma'aunin da suka ɓace.

## Bugun zuciya ba koyaushe yake zama ninkin mataki ba

Bugun zuciya shine matsakaicin tazarar da aka yarda da ita tsakanin sabuntawa kafin a ɗauki shigarwar a matsayin unknown. Ƙirƙirar RRD tana karanta bugun zuciya daga ma'anar filin hanyar samo bayanai, wanda zai iya gaji saitunan furofayil ko samfuri. Ba ƙarin lokacin alheri bane da aka ƙara wa matakin; tabbatar da ainihin filin da fayil ɗin idan sun bambanta da furofayil.

Furofayil ɗin da aka bayar ba sa bin ƙa'ida ɗaya.

| Furofayil | Mataki | Bugun zuciya | Iyakar tazarar sabuntawa |
|---|---|---|---|
| Minti biyar | 300 | 600 | Minti 10 |
| Minti ɗaya | 60 | 600 | Minti 10 |
| Daƙiƙa talatin | 30 | 1200 | Minti 20 |

Waɗannan ƙimomi ne da aka riga aka saita a cikin furofayil, ba ƙidayar lokaci ba ce ta gano katsewa. Bayyananniyar shigarwar unknown na iya haifar da gibi kafin bugun zuciya ya ƙare; daidaitawa da iyakokin taskoki suna shafar abin da ke bayyane. Babban bugun zuciya yana jure dogon gibi tsakanin ingantattun sabuntawa. A ciki ko ƙasa da tazarar sabuntawa ta yau da kullun, yana barin ɗan sarari ko babu sarari kwata-kwata don jinkiri.

Bincika ainihin fayil ɗin tare da furofayil. RRDs da ke akwai na iya bambanta da ma'anar rumbun adana bayanai da aka gyara; binciken fayil yana ba da rahoton irin waɗannan bambance-bambance. Duba [ma'anar bugun zuciya ta RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) da [bayanin daidaitawa](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) kafin tsara canje-canjen fayil.

## Abin da aka adana ba shine abin da na'urar ta faɗa ba

RRDtool yana daidaita sabuntawa zuwa ƙayyadaddun iyakokin mataki. Ƙimomi tsakanin iyakoki na iya ba da gudummawa ga maki da yawa na farko na bayanai. Bugun zuciya, bayyanannun ƙimomin unknown da iyakoki suna shafar ingantacciyar shigarwa; haɗa taskoki yana amfani da nasa iyakokin bayanan da ba a sani ba. Sanya sananniyar ƙima a cikin mataki ba ya buƙatar samfurin farko daban.

Ƙimomin counter suna canzawa zuwa ƙimar canji a kan lokacin da ya wuce, wanda ya dogara da sake saitin counter, sarrafa zagayawa da iyakoki. Ƙimomin gauge ana daidaita su a kan lokaci. Gajerun hauhawa na iya raguwa ta hanyar ɗaukar samfuri ko a tsallake su gaba ɗaya; ƙimomi masu dorewa ko sabuntawa masu ɗaure da iyaka ba lallai bane su ragu. Saitunan taskoki ba za su iya sake gina cikakkun bayanan da ba a taɓa tattara su ba ko kuma waɗanda suka ɓace yayin daidaitawa.

## Wane agogo ke yanke hukunci

Don tattara bayanai na yau da kullun na `cmd.php`, SQL `CURRENT_TIMESTAMP()` yana ba da tambarin lokacin fitarwa lokacin da aka saka rukuni. Wannan ba tambarin lokaci bane da na'urar ta bayar ko ainihin ma'aunin lokacin da na'urar ta amsa. Sauran tsarin tattara bayanai da hanyoyin ainihin lokaci ya kamata a duba su daban.

Mai karɓa na PHP yana adana sakamakonsa a cikin buffer kuma yana rubuta su a rukuni-rukuni, yana wanke buffer lokacin da na'ura ta canza ko lokacin da buffer ya cika. Ana tantance tambarin lokaci sau ɗaya a kowane rukuni, don haka kowane abu a cikin rukuni yana ɗauke da lokaci ɗaya.

Sakamakon ba a bayyane yake ba, don haka yana da kyau a yi bayani dalla-dalla.

**Agogon na'urar ba ya sanya tambarin lokaci a waɗannan samfuran SNMP.** Mai karɓa yana amfani da lokacin shigar da bayanai a cikin rumbun adana bayanai. Lokacin na'urar yana iya zama mai mahimmanci ga rubutun umarni ko ma'anar wani takamaiman ma'auni, don haka wannan ba babban dalili bane na yin watsi da daidaita agogo.

**Kuskuren agogo a cikin mai karɓa ko rumbun adana bayanansa yana canza bayanai.** Ana sanya tambarin ƙimomi a cikin guraren da ba daidai ba, kuma a cikin fayil ɗin da aka riga aka rubuta a wani ɓangare, sabuntawa wanda lokacinsa bai fi na ƙarshe ba ana ƙin sa kai tsaye. Idan tambarin lokaci ya koma bayan sabuntawar ƙarshe na fayil ɗin, sabbin sabuntawa ba za su iya ciyar da wannan fayil ɗin gaba ba har sai tambarin lokacinsu ya wuce shi. Bincika agogon rumbun adana bayanai, agogon mai karɓa da tambarin lokacin fayil; canza agogon mai karɓa kaɗai ba ya canza tambarin lokacin da rumbun adana bayanai ke samarwa.

**Lokaci a cikin zagaye yana zama rawar jiki (jitter).** Na'urar da aka zaɓa kusa da ƙarshen aiki mai tsawo tana samun tambarin lokaci a makare fiye da na'urar da aka zaɓa kusa da farko, kodayake duka biyun na zagaye ɗaya ne. A kan mai karɓa mai ɗauke da kaya mai nauyi, wannan rawar jiki na iya zama babban ɓangare na tazara, kuma yana ɗaya daga cikin hanyoyin da bugun zuciya da aka saita kusa da matakin ya fara haifar da gibi.

**Yankin lokaci na rumbun adana bayanai yana zaune a tsakiyar tafiya da dawowa.** Ana rubuta tambarin lokaci a matsayin tambarin lokacin rumbun adana bayanai kuma rumbun adana bayanai yana mayar da shi zuwa cikakken lokaci lokacin da aka karanta shi. Rashin daidaiton sarrafa yankin lokacin zama na iya canza wannan fassarar. Bincika saitunan zama da canje-canje lokacin binciken matsawa; canza yankin lokacin nuni kaɗai ba ya tabbatar da cewa tarihin da aka adana ya canza.

## Ana haɗa karatun bayanai ta hanyar tambarin lokaci

Hanyar samo bayanai mai ɗauke da filaye da yawa, kamar hanyar sadarwa mai shigarwa da fitar da bytes, na iya amfani da abubuwan jerin aikin SNMP daban ko rubutun umarni da ke ba da ƙimomi masu suna da yawa. Filayen da aka bincika ana haɗa su ta hanyar samo bayanai da tambarin lokaci don sabuntawar RRD.

Ana riƙe saitin da bai cika ba maimakon rubuta shi a ɓangare har sai an cika adadin filayen da ake tsammani. Wannan gwajin haɗuwa ne, ba tabbacin cewa kowane fili yana da ingantacciyar lambar ƙima ba; har yanzu ana iya rubuta bayyanannun ƙimomin unknown. Yawancin lokaci duka sassan biyu suna cikin rukuni ɗaya kuma suna raba tambarin lokaci, don haka yana kasancewa a ɓoye. Rukunonin da aka shigar a cikin daƙiƙa ɗaya na tambarin lokaci na iya dacewa kuma. Lokacin da filaye suka karɓi tambarin lokaci daban-daban, ƙungiyoyi na iya kasancewa ba su cika ba kuma ba sa samar da wani sabuntawa. Lambar yanzu tana riƙe ƙungiyoyin da ba su cika ba a cikin zagaye, sannan tana shigar da su cikin log kuma tana ƙare su bayan daƙiƙa `5 * max(60, poller_interval)`. An faɗaɗa iyakar shafin karatu don haɗawa da rukunin tambarin lokacinsa na ƙarshe.

Ana jera sabuntawa a cikin tsarin hawan lokaci kafin rubutawa, saboda fayil ba ya karɓar kowace ƙima da ta girmi sabuntawarsa ta ƙarshe.

## Rubuce-rubucen da aka jinkirta suna riƙe tambarin lokacinsu

Lokacin da aka jinkirta rubuce-rubucen RRD kuma aka yi amfani da su daga baya a dunkule, tambarin lokacin da aka yi rikodin yana tafiya tare da ƙimar kuma ana rubuta rukunin a cikin tsarin lokaci. Ana riƙe tambarin lokacin tsakar rana koda kuwa an yi ƙoƙarin sabuntawa da ƙarfe ɗaya; ba a maye gurbinsa da lokacin wanke buffer ba. RRDtool har yanzu yana daidaita sabuntawar da aka karɓa zuwa iyakokin matakinsa.

Ayyukan da suka taru na iya ciyar da fayil ɗin gaba ta hanyar daidaita tambarin lokaci wanda ya fi sabuntawar ƙarshe na fayil ɗin sabo. Amma ba za su iya cika kowace rami da ke bayan wannan tambarin lokacin ba. Marubucin Boost yana tace samfuran da suka yi daidai ko kafin sabuntawar ƙarshe na fayil ɗin, don haka jerin gwano mara komai ba ya tabbatar da cewa an yi amfani da kowane samfuri. Duba [rubuce-rubuce masu yawa](/ha/concepts/high-volume-writes/) da [bayanin sabuntawa na RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Rubuce-rubucen da aka jinkirta har yanzu sun dogara ne akan nasarar ajiya da ingantaccen tsarin tambarin lokaci; ba sa ba da garantin murmurewa daga kowace gazawa. Bincika abubuwan da aka riƙe da waɗanda aka ƙi idan ba a share tarin aikin ba.

## Lokacin da zagayen bai ƙare ba

Mai karɓa na PHP yana bincika lokacin aiki da ya wuce tsakanin abubuwan aiki kuma yana ƙare zagayen abubuwansa da zarar an wuce tazarar zaɓe tare da yin rikodin faɗakarwa. Wannan ba yanke aiki bane mai tsauri a kan iyakar lokaci: aikin da ke gudana na iya ɗaukar tsawon lokaci kafin wannan gwajin. Abubuwan da bai kai gare su ba ba sa samar da wata ƙima a wannan zagayen. Ana iya cika gibi tsakanin ingantattun sabuntawa idan bugun zuciya da iyakokin taskoki suka ba da dama. Maimaita ketare iyaka shaida ce ta binciken ƙarfi, ƙarewar lokaci da kurakuran tarawa, ba shaida ba ce cewa kowane gibi da ake gani yana da dalili ɗaya.

Abin da za a yi game da wannan an tattauna shi a cikin [faɗaɗa mai zaɓe](/ha/guides/scale-the-poller/). Tsarin aiki da matakan kariya suna cikin [tsarin rayuwar mai zaɓe](/ha/reference/poller-lifecycle/).
