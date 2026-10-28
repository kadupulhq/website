---
title: Rubuce-rubuce masu yawa (High volume writes)
description: Dalilin da ya sa sabuntawar RRD ke iyakance ta hanyar adadin rubutu maimakon girman rubutu, abin da haɗa su a rukuni ke kawowa, da kuma abin da yake kashewa wajen sabuntawar bayanai.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 10
---

Sabuntawar RRD yana taɓa fayiloli da yawa kuma ana iya iyakance shi ta hanyar jinkirin ajiya da ayyukan I/O,
ba kawai bandwidth ɗin canja wuri ba. Rubuce-rubucen da aka jinkirta, wanda kuma ake kira Boost, yana tattara
samfurori a cikin ma'ajin bayanai kuma yana haɗa sabuntawa ga kowane fayil a rukuni. Auna marubuci da ma'ajin
bayanai kafin zaɓar shi: gibi a cikin zane shi kaɗai ba ya gano cikas ɗin ajiya.

## Hanyar asali (default)

Masu tara bayanai suna saka sakamako a cikin jerin gwano na `poller_output` mai aiki. Marubucin yana haɗa
samfurori ta fayil da tambarin lokaci, yana sabunta RRD, kuma yana bin diddigin amincewa kafin cire samfuran
da suka cancanta. Rubuce-rubucen da suka gaza na iya barin layuka don sake gwadawa, don haka jerin gwano
ba su iyakance ga zagayowar zaɓe na yanzu kawai ba.

A cikin bita da aka sake dubawa, wannan jerin gwano yana amfani da InnoDB. Binciken farko na tarin yana
ƙin jerin gwano na MEMORY; sake kunna ma'ajin bayanai ba ya watsar da layukan da aka ƙaddamar kamar yadda zai
yi ga teburin MEMORY. Dorewa har yanzu ya dogara da daidaitawar ma'ajin bayanai, lafiyar ajiya da ajiyar waje.
Duba [Haɓaka cikin aminci](/ha/guides/upgrade-safely/) don ƙaurawar jerin gwano da binciken ajiya.

A matsayin kimanta kaya mai ƙarfi, fayiloli 10,000 daban-daban da aka sabunta kowane daƙiƙa 300 suna nufin kusan
sabunta fayiloli 33 a sakan daya a matsakaita. Ainihin rubuce-rubucen suna zuwa ne a fashe; filayen maɓuɓɓugar
bayanai da yawa na iya raba fayil ɗaya, matakan na iya bambanta, kuma ƙididdigar umarni ba daidai take da
ƙididdigar I/O ta diski ta zahiri ba. Kwatanta auna jinkirin marubuci da shekarun jerin gwano tare da taga zaɓe da ake da ita.

## Abin da haɗawa a rukuni ke canzawa

Tare da kunna rubuce-rubucen da aka jinkirta, tarin yana sanya samfurori a cikin `poller_output_boost`
don sarrafawa daga baya. Marubucin rukuni yana haɗa samfurori ta hanyar tushen bayanai cikin tsari na tambarin
lokaci kuma yana iya aika tambarin lokaci da yawa a cikin umarnin sabuntawa na RRDtool guda ɗaya. Samfurori
goma sha biyu na iya dacewa a cikin umarni ɗaya, amma wannan ba ya ba da tabbacin rubutun diski ɗaya na zahiri.

Tsawon gardama da aka tsara yana ɗaure kirtani na sabuntawa; tsoho shine 2,000. Yana shafar haɗawa a rukuni.
Kada ku yanke shawarar takamaiman iyakar tsarin aiki daga wannan saitin: rubuce-rubucen da aka amince da su na
cikin gida suna amfani da rafin umarnin RRDtool, kuma ainihin jigilar kaya da girman umarnin da ake tallafawa suna da mahimmanci.

Mai tsara jadawalin yawanci ya cancanci lokacin da lokacinsa ya cika (minti 60 ta asali) ko kuma ƙididdigar
layin da aka kiyasta ta zarce ƙayyadadden ƙofa (1,000,000 ta asali). Kimanin layin ya haɗa da teburan kai tsaye
da na ajiya. Dole ne a kira mai tsara jadawalin ya faru, kuma binciken tsari, shiri ko gazawar marubuci na iya
jinkirta aiki. Ayyukan tilastawa, zubarwa bayan kashewa, da sabuntawar zane bisa buƙata ƙarin hanyoyi ne;
tsohon ba garantin sabo na awa ɗaya bane.

Tazarar da take sifili ko ba tabbataccen lamba ba an maye gurbinta da mintuna 120; tsohon na al'ada shine mintuna 60.

## Juyawa (rotation), da dalilin da ya sa take nan

Saitin rukuni yana ƙirƙirar tebur mara komai wanda ya dace da bafar kai tsaye, sannan yana musanya sunaye tare
da sanarwa `RENAME TABLE` guda ɗaya. Tsohon tebur mai rai ya zama tarihin da aka tambarin lokaci kuma masu
shirya bayanai suna nufin canjin. Wannan yana raba rukunin daga sabbin abubuwan da aka saka, amma makullin
ma'ajin bayanai da takaddamar albarkatu har yanzu na iya jinkirta tattarawa.

Ma'aikata suna sarrafa tarihin yanzu da na baya. Babban aikin yana duba kammalawar yara da matsayi; ayyukan da
suka gaza ko ba za a iya tabbatar da su ba suna riƙe tarihin don sake gwadawa. Yayin tsaftacewa mai cancanta, za a
iya sauke wuraren ajiya marasa komai kuma ana iya sake sanya sauran samfuran a cikin bafar kai tsaye kafin sauke
tarihin. Ba a watsar da tarihin da ba shi da komai ba kawai saboda aikin ya ƙare. Bincika duka layukan kai tsaye
da na ajiya yayin gano tarin aiki.

Wannan shine sarrafa sake gwadawa, ba garantin tsaro na faɗuwa na duniya ba. Kurakuran ma'ajin bayanai, aiki na
lokaci ɗaya, kurakuran ajiya da daidaiton madadin har yanzu suna buƙatar tabbatarwa a cikin aikin da ake gudanarwa.

## Dalilin da ya sa duba zane zai iya sabunta fayilolinsa

Hanyar zane ta yau da kullun na iya ƙoƙarin sabuntawa bisa buƙata ga kowace maɓuɓɓugar bayanai da zanen ke nuni
da ita kafin fassara ta. Ba ya zubar da kowane samfurin da ke jiran ba tare da wani sharadi ba: binciken mai tarawa,
hanyoyin fitarwa na lokaci-lokaci/tushe/kuskure, ƙididdigar zaɓe mai aiki, iyakokin tambaya da gazawar sabuntawa
suna shafar abin da ke gudana. Samfuran kwanan nan ko waɗanda suka gaza na iya zama a cikin jerin gwano.

Don haka zanen da yake da alamar yanzu ba ya tabbatar da cewa dukkan bishiyar RRD na yanzu take ba, kuma neman
zane ba ya ba da tabbacin sake kunnawa cikin nasara. Bincika kurakuran marubuci, shekarun jerin gwano da ainihin
tambarin lokaci na RRD. Ajiyayyen fayiloli kaɗai yana barin samfuran ma'ajin bayanai da ke jiran aiki; duba
[Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/).

## Abin da kake sadaukarwa

**Sabon fayiloli.** Samfuran suna zama a cikin ma'ajin bayanai har sai an sarrafa su cikin nasara. Shigarwa mai
lafiya da ke aiki da lokaci na iya yin jinkiri kusan tazarar zubarwa ɗaya; marubucin da ya gaza ko ƙasa da girma
na iya yin jinkiri tsawon lokaci. Ajiye fayilolin da ke jiran aiki da fayiloli akai-akai.

**Jadawalin na biyu.** Kula da zaɓe da zubarwa daban. Lura da layuka masu rai, adana kayan tarihi, tsohuwar
shekarun samfurin, ma'aikatan da suka gaza da kuma aikin marubuci. Tebur mai rai ba ya buƙatar zama fanko yayin
da masu samarwa ke ci gaba da sakawa, kuma juyawa kaɗai zai iya sa ya zama ƙarami ba tare da an kammala wani
sabuntawar RRD ba.

**Tsarin oda.** Fayilolin RRD ba sa karɓar tsofaffin tambarin lokaci bayan sabbin sabuntawa. Hanyar Boost ta
zamani tana tsallake sabuntawar da ta gabata, kuma hanyar gado tana tace tambarin lokaci akan sabuntawar ƙarshe
na fayil ɗin. Umurnin da aka yarda dashi azaman nasara zai iya tsallake tsoffin bayanai; isarwa a makare ba ya
ba da tabbacin cewa samfurin ya bayyana a cikin zanen.

**Fannin aiki.** Akwai bafar ma'ajin bayanai, tsarin zubarwa tare da iyakar ƙwaƙwalwar ajiya, ma'aikata masu
daidaitawa na zaɓi, da adana kayan tarihi ko samfuran da aka sake shigarwa a cikin jerin gwano don saka idanu.
Gazawar marubucin gida gabaɗaya yana riƙe samfurori don sake gwadawa, amma wannan baya kafa rashin asara na
ƙarshe-zuwa-ƙarshe. Don hanyar dawowa daga nesa, duba
[Tattara bayanai daga nesa](/ha/concepts/remote-data-collection/).

## Yaushe ya cancanci hakan

Yi la'akari da rubuce-rubucen da aka jinkirta lokacin da ma'auni ya nuna cewa marubucin RRD shine cikas kuma
ma'ajin bayanai yana da damar yin amfani da bafar da tambayoyin rukuni. Ba ya cire jinkirin na'ura ko gyara
ma'ajin bayanai da ya cika da yawa. Kwatanta kayan aiki, shekarun jerin gwano, sabon fayil da amfani da albarkatu
kafin da bayan kunna shi.

Babban poller yana kunna sabuntawa ta atomatik lokacin da aka saita mai tattara bayanai na nesa da aka kunna.
Wannan saitin kaɗai ba ya kafa ingantaccen ma'ajiyar nesa ko ƙaddamar da dawowa; yi amfani da iyakokin da ke cikin
[Tattara bayanai daga nesa](/ha/concepts/remote-data-collection/).

## Wani fasali daban mai suna iri ɗaya

Hotunan zane da aka fassara kuma ana iya ajiye su a kache. Adana hotuna a kache yana rage maimaita fassarar;
rubuce-rubucen da aka jinkirta yana haɗa samfuran ma'ajin bayanai zuwa sabuntawar RRD. Saitunan su sun bambanta,
amma hanyoyin aiwatar da su suna hulɗa: buƙatun zane na iya bincika samfuran da ke jiran aiki kafin amfani da
hoton da aka ajiye, kuma sabuntawa masu nasara na iya sa a fassara sabon hoto. Kimanta sabon hoto daban da sabon
jerin gwano da na RRD.
