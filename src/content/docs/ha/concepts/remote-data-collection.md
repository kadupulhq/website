---
title: Tarin bayanai na nesa
description: Me ya sa ake rarraba tarawa kuma ba a rarraba ajiya ba, abin da mai tarawa na nesa ya mallaka, da tsadar samun kwafi na biyu na tsari.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 9
---

:::caution[Halayen wakili na RRDtool da aka gada]
Ba a tallafawa tura wakili (proxy) na RRDtool a cikin Kadupul. Yi amfani da ma'ajiyar RRDtool ta gida
(`storage_location = 0`). Saitunan wakili, bayanin yarjejeniya da hanyoyin aiki
a wannan shafin suna rubuta halayen da aka gada, ba hanyar turawa ko ƙaura da ake tallafawa ba.
Duba [Wakili na RRDtool](/ha/reference/rrdproxy/).
:::

Tarawa shine ɓangaren da ba zai iya dacewa da na'ura ɗaya ba. Yawancin lokacin jefa ƙuri'a ana kashe shi ne
wajen jiran na'urori su amsa, kuma jira ba zai iya matsawa ba. Za ka iya haɗa yawancinsa tare da ƙarin matakai da zaren aiki (threads),
har zuwa lokacin da uwar garken da ke tarawa ta ƙare da CPU ko kuma tafiya zuwa wani wuri mai nisa ya mamaye komai.

Mai tarawa na nesa (remote collector) lamba ɗaya ce mai lambar mai tarawa daban, tana jefa ƙuri'a ga ɓangaren na'urori.
Kowace na'ura tana kiran mai tarawa da ke da alhakin ta. Wannan aikin shine rarraba tsarin jadawali na yau da kullun.
Ci gaba da sanya aikin na'ura da kwafin kache na mai jefa ƙuri'a daidai; wannan zaɓin jadawali ba tabbaci bane cewa kowane rubutun sakamako yana aiwatar da mallakar mai tarawa.

Don tambayar *yaushe* ya kamata a yi amfani da ɗaya, duba
[Faɗaɗa mai jefa ƙuri'a](/ha/guides/scale-the-poller/). Wannan shafi game da menene shi a zahiri yake.

## Me ya sa mai tarawa yake ɗaukar ma'ajiyar bayanan kansa

Mai tarawa da ke karanta jerin ayyukansa daga babbar ma'ajiyar bayanai ta hanyar sadarwa yana daina tarawa lokacin da hanyar sadarwa ta tsaya.
Wannan shine kishiyar abin da kake son mai tarawa na nesa dominsa.

Don haka yana ɗaukar ma'ajiyar bayanai ta gida mai ɗauke da kwafin kansa na tsari: saituna, samfura,
hanyoyin shigar da bayanai, tambayoyin bayanai, rabonsa na kache na mai jefa ƙuri'a, na'urorinsa, tsarin manhaja,
da teburan masu amfani da izini. Ana tura wannan kwafin daga babban tsarin.
Ɗauki babban tsarin a matsayin mai ikon tsari, yayin da mai tarawa ke kiyaye yanayin aiki na gida da saitunan na'ura.

An cire saitunan hanya daga kwafin, tare da ƙididdigar kowane gudu da babban tsarin ke kiyayewa don kansa.
Hanyoyi kayan na'ura ne, ba na tsarin baki ɗaya ba.

## Maimaitawa na lokaci-lokaci ne, don haka tsarin yana jinkiri

Babban mai jefa ƙuri'a yana bincika masu tarawa na nesa da aka kunna tare da uwar garken ma'ajiyar bayanai da ba na gida ba da tazarar aiki tare da ba sifili ba.
Mai tarawa yana buƙatar aiki tare idan bai taɓa yin hakan ba, tazararsa ta cika, ko an yi masa alama a matsayin mai buƙatar aiki tare.
Tazarar sifili tana cire shi daga wannan binciken na lokaci-lokaci, koda lokacin da aka yi masa alama da buƙatar hakan.

Tsohon tsarin duniya shine sa'o'i biyu; mai tarawa na iya samun tazarar kansa.
Wannan ba tabbaci bane cewa kowane canji yana jiran sa'o'i biyu: ayyukan na'ura da manhaja suma suna da hanyoyin maimaitawa da aka nufa.
Aiki mai nasara ya dogara da wannan aikin, haɗin gwiwa da teburan da aka zaɓa.
Bincika ainihin tsarin mai tarawa da kache maimakon ɗaukar daidaito nan take ko kafaffen jinkiri.

Ana iya buƙatar cikakken maimaitawa daga babban mai tarawa tare da
`php cli/poller_replicate.php`, lokacin da aka tsara masu tarawa na nesa da aka kunna.
Yana maimaita kowane mai tarawa na nesa da aka kunna sai dai idan `--poller=N` ya zaɓi ɗaya.
Duba [Faɗaɗa mai jefa ƙuri'a](/ha/guides/scale-the-poller/) da
[Yi ƙaura zuwa sabon kayan aiki](/ha/guides/migrate-to-new-hardware/) don yanayin aiki.

## Yanayin haɗin gwiwa guda uku

Mai tarawa yana yanke shawara a farkon aiki yadda zai kasance, dangane da ko babbar ma'ajiyar bayanai tana amsawa da kuma ko yana riƙe da samfuran da ba a isar ba tukuna.

| Yanayi | Sharaɗi | Halayya |
|---|---|---|
| Kan layi (Online) | Babbar ma'ajiyar bayanai tana haɗawa kuma ba a gano cunkoson Boost na gida ba | Rubuce-rubucen sakamako suna nufin babbar ma'ajiyar bayanai |
| Ba ya kan layi (Offline) | Babban haɗin ya gaza ko an tilasta shi zama ba ya kan layi | Tarawa tana amfani da ma'ajiyar wucin gadi ta gida, idan sabis ɗin gida ya kasance da lafiya |
| Farfaɗowa (Recovery) | Babbar ma'ajiyar bayanai tana haɗawa tare da sauran layukan Boost na gida | Sabbin samfurori suna kasancewa na gida yayin da aikin baya ke ƙoƙarin canja wurin cunkoso |

Yanayin ba ya kan layi ba yanayin kuskure bane. Halin da aka tsara ne na mai tarawa wanda hanyarsa ta katse, kuma shine dalilin da ya sa mai tarawa ke da ma'ajiyar bayanai ta gida tun farko.
Tarawa tana ci gaba da tsarin da ake da shi a gida. Ƙarfin ma'ajiyar bayanai na gida, samun damar na'ura, lafiyar mai tsara jadawali da ingantattun takaddun shaida har yanzu ana buƙatar su;
yanayin ba ya kan layi ba ya ba da tabbacin tarawa ba tare da tsangwama ba ko isarwa ta ƙarshe.

## Yadda sakamako ke isa ga babban tsari

Sakamako ba ya tafiya a matsayin rubutun RRD kai tsaye. Suna tafiya ne a matsayin layukan bayanai.

Ana buƙatar jinkirta rubutun RRD lokacin da akwai mai tarawa fiye da ɗaya, kuma ƙara mai tarawa na nesa yana sa babban mai jefa ƙuri'a ya ba da damar jinkirta sabuntawa.
Hanyar farawa kuma tana ba da damar tsarin Boost da juyar da hanya lokacin da aka sami bayanan masu tarawa da yawa.
Waɗannan saitunan ba sa tabbatar da aiki mai inganci da kansu.
Duba [Rubutu mai yawa](/ha/concepts/high-volume-writes/) don abin da wannan yanayin ke yi.

A kan layi, mai tarawa yana saka samfuransa kai tsaye a cikin babban teburin kariya.
Babban tsarin yana fitar da su a cikin fayilolin RRD a kan jadawalin kansa, daidai yadda zai yi da samfuran da ya tattara da kansa.
Samfuran mai tarawa ba na musamman bane da zarar sun isa.

Ba ya kan layi kuma yayin farfaɗowa, samfura suna taruwa a cikin layin Boost na gida.
Lokacin da za a iya isa ga babbar ma'ajiyar bayanai kuma, `poller_recovery.php` yana saka layukan da aka ajiye a cikin babban layin Boost,
yana sabunta fitarwar layin da ya riga ya kasance a wurin.

Farfaɗowa tana share layin gida ne kawai bayan nasarar shigarwar babban tsarin don kunshin sa, kuma kawai lokacin da layin gida har yanzu yayi daidai da abin da aka aika.
Shigarwar da ta gaza, samfurin da ya wuce kima ko layin da aka canza yayin tsaftacewa yana barin samfuran gida a wurin don ƙoƙari na gaba.
Wannan shafin bai kafa ingantaccen tsarin farfaɗowa na masu tarawa da yawa ba.

Shigarwar farfaɗowa tana ɗauke da bayanan tushen bayanai, sunaye, tambarin lokaci da ƙimomi;
ba sa bincika waɗancan layukan akan ayyukan mai tarawa. Kada ka dogara da ƙin yarda na gaba ɗaya don kariya daga ayyukan da suka tsufa ko masu kera da ke haɗuwa.
Tabbatar da ayyuka da yanayin kache kafin kunna tarawa.

## Ma'ajiya ba ta rarraba

Tsohon tsarin aiki da aka gada wanda ya dogara da wakili yana ajiye fayilolin RRD a tsakiya kuma yana tsammanin masu tarawa za su isa gare su ta hanyar wakilin RRDtool.
Ba a tallafawa wannan aikin a cikin Kadupul; kada ka ɗauke shi a matsayin jagorar turawa.
Dole ne a rubuta ingantacciyar hanyar ajiya ta masu tarawa da yawa ta amfani da RRDtool na gida kafin ba da shawarar maye gurbinsa.

Wannan shine ɓangaren da mutane suka fi mamaki akai, don haka yana da kyau a bayyana shi a sarari.
**Masu tarawa na nesa suna rarraba jira ne, ba rubutu ba.**
Idan iyakar da kuka haɗu da ita ita ce diski a ƙarƙashin bishiyar RRD, ƙarin ƙarfin tarawa ba ya cire wannan iyakar.
Ƙarin samfurori masu shigowa na iya haɓaka babbar ma'ajiyar bayanai da cunkoson rubutu.

## Menene kuma ke dawowa

Mai tarawa ya mallaki yanayin aiki na na'urorinsa: samuwa, kuskuren ƙarshe, lokutan zagaye, ƙididdigar jefa ƙuri'a, da wanzuwa.
Yana rubuta waɗannan a gida yayin da yake jefa ƙuri'a kuma yana tura zaɓaɓɓun ginshiƙan aiki zuwa babban tsarin a dunkule.
Wannan yana sabunta waɗancan ginshiƙan kawai, ba duka layin tsarin na'urar ba.

Don haka abin da babban tsarin ke nunawa don samun damar na'ura shine ra'ayin mai tarawa, dangane da turawa ta ƙarshe da ta yi nasara.
Mai tarawa wanda ba ya kan layi yana da ra'ayi na yanzu na na'urorinsa wanda babu wanda ke babban tsarin zai iya gani.

Babban tsarin yana bin diddigin masu tarawa kamar yadda mai tarawa ke bin diddigin na'urori.
Mai taimaka wa lafiyar mai tarawa yana ɗaukar mai tarawa na nesa da aka kunna a matsayin mai aiki ne kawai lokacin da tambarin lokacin matsayinsa na ƙarshe ya zama ƙasa da sau biyu na tsarin tazarar jefa ƙuri'a.
Wannan binciken ba ya tabbatar da isar da samfuri, nasarar maimaitawa ko sabunta zane-zane.

## Hanyoyin gazawa

| Abin da ya gaza | Abin da ke faruwa | Abin da kake lura da shi |
|---|---|---|
| Haɗi zuwa babban tsarin | Mai tarawa na iya ci gaba a gida yayin da ma'ajiyar bayanansa da mai tsara jadawali suka kasance lafiya | Zane-zane da suka jinkirta da haɓakar layi; dole ne a bincika isarwa da asara |
| Mai tarawa da kansa | Na'urorinsa da aka ba shi ba za a sake jefa musu ƙuri'a ba | Samfurorin da suka ɓace; bincika mai tsara jadawali, na'ura da yanayin mai tarawa |
| Maimaitawa | Mai tarawa yana gudanar da tsohon tsari | Canje-canje suna bayyana ba sa aiki |
| Babbar ma'ajiyar bayanai | Ayyukan nesa na iya shiga yanayin ba ya kan layi lokacin da haɗin ya gaza | Tarawa a tsakiya ta lalace; ma'ajiyar wucin gadi ta nesa ta dogara da lafiyar gida |
| Ayyuka masu haɗuwa ko tsofaffi | Fiye da mai kera ɗaya na iya ƙaddamar da samfurori masu alaƙa | Babu ƙin yarda na gaba ɗaya; duba ayyuka, tambarin lokaci da kurakuran rubutu |

Ajiye wucin gadi na iya juyar da wasu katsewa zuwa jinkiri, amma ba ya sa isarwa ta kasance ba tare da asara ba.
Bincika shekarun layi, ƙarfin ma'ajiyar bayanai, kurakuran farfaɗowa da tambarin lokacin RRD da aka samu.
Zane mai faɗi kawai ba zai iya bambanta katsewar na'ura daga jinkiri ko gazawar isarwa ba.

## Menene tsadarsa

Idan aka kwatanta da mai jefa ƙuri'a guda ɗaya na tsakiya:

**Kana samun** zagayen na'urori masu aiki a lokaci guda a cikin injuna da yawa, jefa ƙuri'a da ke faruwa kusa da na'urorin maimakon ta hanyar WAN,
da ikon ci gaba da tarawa a gida yayin da ba a iya samun babban tsarin, dangane da farfaɗowa da iyakokin lafiyar gida da ke sama.

**Kana biya** da maimaita tsari wanda zai iya jinkiri, ma'ajiyar bayanai ta biyu don aiki, saka idanu da kuma adana bayanai ga kowane mai tarawa,
yanayin rubutu da aka jinkirta wanda ba na zaɓi ba ne, da kuma babbar ma'ajiyar bayanai wacce a yanzu take ɗaukar rubuce-rubuce a lokaci guda daga kowane mai tarawa.

Cikakken taƙaitaccen bayani shine cewa mai tarawa na nesa inji ce cikakkiya wacce yanzu dole ne ka gudanar da ita.
Mai jefa ƙuri'a ɗaya mai matakai da yawa saiti ne kawai. Mai tarawa kayan aiki ne, tare da ma'ajiyar bayanansa,
takaddun shaidarsa, agogonsa na kansa, da kuma fassarar gaskiya ta kansa muddin ba a yi maimaitawa ba.
