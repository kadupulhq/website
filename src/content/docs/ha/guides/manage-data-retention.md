---
title: Sarrafa riƙewar bayanai
description: Zaɓi riƙewa da ƙuduri, kiyasta ma'ajiyar diski, kuma ka tsara canje-canje ga fayilolin RRD da ke akwai.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 24
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

Ana saita manufar riƙewar bayanai a lokacin ƙirƙirar fayil kuma tana kasancewa ba tare da canji ba yayin sabuntawa na yau da kullun. Gyara bayanin martaba daga baya yana canza fasalin fayil na gaba kawai kuma yana barin kowane fayil da ke akwai daidai yadda yake. Daidaita wannan kafin ka ƙirƙiri hanyoyin bayanai dubu goma, saboda canje-canje na gaba suna buƙatar gyaran fayil na musamman ko ƙaura.

Karanta [Tushen bayanai da ma'adanai](/ha/concepts/data-sources-and-rras/) da farko idan sharuɗɗan step, heartbeat, taska (archive) da haɗewa (consolidation) ba a saba da su ba.

## Abin da bayanin martaba ke ɗauke da shi

Bayanin martaba na tushen bayanai shine manufar riƙewa kanta. Bayanin martaba ɗaya, tsarin ajiya ɗaya.

| Filin aiki | Ma'ana |
|---|---|
| Lokacin jefa ƙuri'a (step) | Sau nawa ake tsammanin ƙima, a cikin daƙiƙa |
| Heartbeat | Matsakaicin tazarar da aka yarda da ita tsakanin sabuntawa kafin a ɗauki bayanin da ba a sani ba (unknown) |
| X-Files Factor | Yawan tagar haɗakarwa da za a iya zama ba a sani ba kafin haɗakar ƙimar ta zama ba a sani ba |
| Ayyukan haɗawa | Wadanne daga cikin `AVERAGE`, `MIN`, `MAX`, `LAST` ake kiyayewa |
| Taskoki (Archives) | Lahi ɗaya a kowane ƙuduri, kowannensu yana da matakin haɗawa da adadin layi |
| Asali (Default) | Ko sabbin hanyoyin bayanai suna zaɓar wannan bayanin martaba |

Tazarar step tana bin tazarar poller a matsayin asali. Bayanin martaba wanda tazararsa ta fi ta poller kankanta ba zai iya dawo da bayanan da ba a taɓa ɗaukar samfurinsu ba. Ko layukansa ba a san su ba ya dogara ne akan heartbeat da daidaita RRDtool.

## Abubuwan da aka tanadar

Bayanan martaba guda uku suna zuwa a cikin tsarin. Dukkan ukun suna riƙe da ayyukan haɗawa guda huɗu.

| Bayanin martaba | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Bayanin martaba na 5 Minute shine na asali.

Kowannensu yana da taskoki huɗu. Ana bayyana matakin haɗawa azaman mai haɓaka mataki, don haka ainihin ƙudurin shine mai haɓaka sau matakin bayanin martaba, kuma tsawon lokaci shine wancan ƙudurin sau adadin layi.

### 5 Minute Collection

| Taska | Mai haɓaka | Layuka | Ƙuduri | Tsawon lokaci |
|---|---|---|---|---|
| Daily | 1 | 600 | Minti 5 | Kusan kwanaki 2 |
| Weekly | 6 | 700 | Minti 30 | Kusan kwanaki 14 |
| Monthly | 24 | 775 | Sa'o'i 2 | Kusan kwanaki 64 |
| Yearly | 288 | 797 | Rana 1 | Kusan shekaru 2 da watanni 2 |

### 1 Minute Collection

| Taska | Mai haɓaka | Layuka | Ƙuduri | Tsawon lokaci |
|---|---|---|---|---|
| Daily | 1 | 2900 | Minti 1 | Kusan kwanaki 2 |
| Weekly | 15 | 1440 | Minti 15 | Kwanaki 15 |
| Monthly | 60 | 8784 | Sa'a 1 | Kusan kwanaki 366 |
| Yearly | 720 | 7305 | Sa'o'i 12 | Kusan shekaru 10 |

### 30 Second Collection

| Taska | Mai haɓaka | Layuka | Ƙuduri | Tsawon lokaci |
|---|---|---|---|---|
| Daily | 1 | 2900 | Daƙiƙa 30 | Kusan rana 1 |
| Weekly | 30 | 1346 | Minti 15 | Kusan kwanaki 14 |
| Monthly | 120 | 1445 | Sa'a 1 | Kusan kwanaki 60 |
| Yearly | 480 | 4380 | Sa'o'i 4 | Shekaru 2 |

Sunayen alamu ne kawai, ba ɗabi'ar dole ba. Babu wani abu da ke tilasta cewa taskar da ake kira "Yearly" tana ɗauke da cikakkiyar shekara.

## Yadda bayanin martaba ke zama fayil

A lokacin ƙirƙira, ana karanta taskokin bayanin martaba da ayyukan haɗawa sannan a mai da su umarnin ƙirƙira. Matakin (step) yana fitowa daga ƙimar `rrd_step` da aka adana ta tushen bayanai, wanda aka saba samu daga bayanin martaba. Kowane abu na tushen bayanai da aka haɗa yana ba da gudummawar layin ma'ana mai ɗauke da sunansa, nau'insa, heartbeat, mafi ƙanƙanta da mafi girma. Kowace taska tana ba da gudummawar layi ɗaya a kowane aikin haɗawa, tana ɗauke da aikin, abin da ya shafi X-Files, mai haɓakawa da adadin layi.

Taskoki huɗu sau ayyukan haɗawa huɗu ma'anar taskoki goma sha shida ne a cikin fayil ɗin. Wannan ninka ne inda sararin diski ke tafiya.

Idan fayil ɗin ya riga ya wanzu, hanyar ƙirƙira ta yau da kullun tana tsayawa ba tare da sake rubuta shi ba. Gyaran bayanin martaba ba ya ƙaura da fayiloli ta atomatik. Kayan aikin kiyayewa na musamman aiki ne na daban, wanda aka bayyana a ƙasa.

## Zaɓar manufa

Tambayoyi uku, a cikin wannan tsari.

**Menene mafi kankantar tambaya da za ka taɓa yi?** Wannan yana saita matakin (step). Matakin daƙiƙa 30 yana amsa "abin da ya faru a lokacin wancan ɗan hutu na daƙiƙa 90". Matakin minti 5 ba zai iya ba, har abada, ga kowane fayil da aka ƙirƙira a ƙarƙashinsa. Ƙananan matakai suna kashe ƙarin aikin poller a kowane zagaye da kuma sararin diski.

**Yaya nisan da za ka yi tambaya a baya?** Wannan yana saita adadin layukan taskar yau da kullun. Yawancin shigarwa suna son 'yan kwanaki a cikakken ƙuduri sannan su gamsu da ƙarin bayanan da aka haɗa.

**Waɗanne tambayoyi ne ke tsira daga haɗawa?** Wannan yana saita ayyukan haɗawa. `AVERAGE` yana amsa abin da ya kasance na yau da kullun. `MAX` yana amsa yadda abin ya yi muni. `MIN` yana amsa ko ya taɓa faɗuwa gaba ɗaya. `LAST` yana amsa menene ƙimar ƙarshe a cikin taga, wanda ke da mahimmanci ga karatun da ke wakiltar jihohi maimakon ƙididdiga.

Yar da ɗaya daga cikin ayyukan haɗawa huɗu yana rage yawan adadin ƙimomin da aka adana na sabbin fayiloli da kashi ɗaya bisa huɗu a kowane ƙuduri. Hakanan shine abin da mutane ke rubuta nadama a kansa daga baya. Riƙe `MAX` sai dai idan ka tabbata ba wanda zai taɓa yin tambaya game da kololuwa.

## Auna girman diski

Girman fayil ɗaya yana fitowa ne daga lambobin da ka zaɓa. Daga kimanta girman da aka yi amfani da shi a cikin tsarin:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Tsarin yana amfani da bytes 284 da 300 azaman ƙayyadaddun ƙididdigar kuɗaɗen aiki. Ɗauki wannan azaman kimanta girman, ba cikakken bayanin kowane tsarin fayil na RRDtool ba. Kowane ƙimar da aka adana bytes 8 ne, kuma jimillar layuka shine jimillar ƙididdigar layi a duk ma'anar taskar bayanin martaba kafin ninka ta ayyukan haɗawa. Auna fayilolin wakilci tare da RRDtool da aka shigar kafin yanke shawarar ajiya.

Don fayil ɗin tushen bayanai guda ɗaya tare da duk ayyukan haɗawa huɗu:

| Bayanin martaba | Jimillar layuka | Kimanin girman fayil |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Ninka da adadin hanyoyin bayanai da kake tsammani, ba ta adadin jadawali ba. Jadawali na iya haɗa filaye daga fayil ɗaya ko fayiloli da yawa. Ƙidaya ainihin fayilolin RRD da abubuwan tushen bayanai a cikin kowannensu.

Hanyoyin bayanai dubu ashirin a kan bayanin martaba na asali kusan 1.8 GB ne. Haka hanyoyin bayanai dubu ashirin a kan bayanin martaba na 1 Minute kusan 13 GB ne. Wannan rabo yana nuna duka ƙuduri da kuma tsawon lokacin riƙewa daban-daban na bayanan martaba, ba matakin kaɗai ba. Ƙarin tarin bayanai yana ƙara yawan rubuce-rubuce. Duba [Rubuce-rubuce masu yawa](/ha/concepts/high-volume-writes/) kafin zaɓar kyakkyawan mataki a babban sikeli.

Duk masu gyara bayanin martaba da na taska suna nuna ƙididdigar girman yayin da kake canza lambobi. Yi amfani da su. Lissafin yana da sauƙin yin kuskure da kashi huɗu.

## Abin da canza bayanin martaba ke yi, da abin da ba ya yi

Wannan shine ɓangaren da ke sa mutane asarar tarihin bayanansu.

| Canji | Tasiri akan sabbin fayiloli | Tasiri akan fayilolin da ke akwai |
|---|---|---|
| Ƙara ko cire taska | An yi amfani da shi | Babu |
| Canza adadin layi | An yi amfani da shi | Babu |
| Canza matakin haɗawa | An yi amfani da shi | Babu |
| Ƙara ko cire aikin haɗawa | An yi amfani da shi | Babu |
| Canza matakin (step) | Sabbin hanyoyin bayanai suna gādar shi; ƙirƙira tana amfani da matakinsu da aka adana | Babu canjin fayil na atomatik |
| Canza heartbeat | Ƙirƙira tana amfani da metadata na tushen bayanai da aka adana; duba ƙasa | Babu daidaita fayil na atomatik |
| Share bayanin martaba | An ƙi amincewa yayin da samfuri ko tushen bayanai ke nuni da shi, kuma ga bayanin martaba na asali | Babu |

**Canza heartbeat na bayanin martaba da ake amfani da shi yana sabunta metadata kawai.** Ajiye sabon heartbeat yana adana shi a cikin bayanin martaba da kan abubuwan tushen bayanai na samfura da hanyoyin bayanai na gida waɗanda ke amfani da bayanin martaba; sauran samfura ba a canza su ba.

Wannan ajiyar ba ta gyara fayilolin RRD da ke akwai ba. Ajiye kwafin metadata da kuma fayiloli, kuma kwatanta bayanin martaba, abubuwan samfuri, abubuwan tushen bayanai na gida da ainihin fitowar `rrdtool info` bayan kiyaye heartbeat.

Babban mai tattara bayanai na `cli/update_heartbeat.php` zai iya daidaita fayilolin da ke akwai da kuma sabunta metadata. Fara da `--help`, `--list-heartbeats`, `--list-data-templates` da `--list-profiles`. Sabon heartbeat dole ne a tallafa masa kuma aƙalla ya ninka tazarar poller sau biyu. Yi amfani da `--data-template-id` don iyakance zaɓi; kayan aikin ba su da zaɓin dry-run.

Ba tare da `--force` ba, bayanan martaba da aka zaɓa dole ne su riga sun sami heartbeat ɗin da aka nema. Tare da `--force`, ƙimomin bayanan martaba da aka raba suma suna canzawa, don haka ka bincika duk masu amfani da su kafin ci gaba. `--prev-heartbeat` yana tace ƙimomin ma'ajiyar bayanai, ba heartbeat ɗin da aka karanta daga kowane RRD ba: bayan ajiyar yanar gizo na ɓangare, zaɓar tsohuwar ƙimar fayil ɗin ba zai iya dacewa da komai ba. Tabbatar da zaɓin kuma bincika fayilolin da suka haifar. Keɓaɓɓen gwajin ya yi nasarar daidaita fayil ɗin da yake da shi daga 600 zuwa 900 bayan an daidaita metadata na bayanin martaba.

Wasu tarko biyu suna zama kusa da wannan.

**Edita yana ƙuntata canje-canjen tsari da zarar bayanin martaba yana aiki.** Da zarar ainihin tushen bayanai ya wanzu a kan bayanin martaba, step, X-Files Factor, ayyukan haɗawa, adadin layin taska da matakan haɗawa sun zama na karantawa kawai a cikin edita; sarrafa ƙara/share taska ma yana ɓuya. Kwafi bayanin martaba sannan ka gyara kwafin. Waɗannan ƙuntatawa na tsarin ba sa zama ingantaccen tabbaci na gefen uwar garken na buƙatun da aka ƙaddamar.

**Sake sanya nassoshi kafin share bayanin martaba.** Jerin yana kashe zaɓi lokacin da samfuri ko tushen bayanai na gida ke amfani da bayanin martaba, kuma uwar garken ta ƙi share bayanin martaba wanda har yanzu ake nuni da shi.

## Matsar da hanyoyin bayanai tsakanin bayanan martaba

Akwai aiki na gama-gari (bulk action) a kan samfuran bayanai don canza bayanin martaba. Yana sake rubuta bayanin martaba da aka yi rikodin samfurin, mataki da heartbeat, kuma yana taƙaita kansa da gangan ga layukan samfuri kawai. Hanyoyin bayanai da suka riga sun wanzu ba a haɗa su ba.

Don haka tsarin ainihin ƙaura shine:

1. Gina sabon bayanin martaba kuma bincika ƙididdigar girmansa.
2. Nuna samfurin bayanai zuwa gare shi.
3. Yarda cewa duk abin da aka ƙirƙira daga yanzu yana amfani da sabon fasalin.
4. Yanke shawara, daban, game da abin da za a yi da fayilolin da kake da su a halin yanzu.

Mataki na huɗu yana da zaɓuɓɓuka da yawa, ya danganta da canji da sigar RRDtool da aka shigar.

**Bar su.** Fasali daban-daban na riƙewa na iya zama tare. Ci gaba da daidaita metadata na jefa ƙuri'a na kowane tushen bayanai tare da fayil ɗinsa; canza nassin bayanin martaba na ma'ajiyar bayanai kaɗai ba ya ƙaura da matakinsa, filaye ko taskoki.

**Sake gina su.** Share kuma sake ƙirƙirar tushen bayanai. Da sauri, amma tarihi ya tafi.

**Splice.** Kayan aikin layin umarni na splice yana haɗa tsohon fayil zuwa sabo kuma yana iya canza ƙuduri yayin yin sa, muddin sabon fayil ɗin ya riga ya sami madaidaicin mataki. Yana da yanayin dry run. Yi amfani da shi a kan kwafi kafin ka yi amfani da shi a kan duk abin da kake buƙata.

**Gyaran RRDtool.** Ya danganta da sigar da aka shigar da canjin da ake so, [rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) ko [rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) na iya canza fayil ɗin da ke akwai yayin kiyaye bayanan da aka riƙe. Dakatar da masu rubutu masu gogayya, adana kwafin ajiya kuma tabbatar da sakamakon a kan kwafi. Waɗannan ayyukan ba sa sake ƙirƙirar bayanan da aka riga aka watsar ta hanyar haɗawa.

## Bayanan martaba na waje

Ana iya saita tushen bayanai zuwa bayanin martaba na waje, wanda ke rikodin matakin sifili. Wannan yana cewa ana sarrafa fayil ɗin a wajen hanyar al'ada, kuma jerin tushen bayanai yana nuna shi azaman waje maimakon faɗin tazara. Yi amfani da shi don fayilolin da wani aiki ke rubutawa. Kada ka yi amfani da shi don nufin "babu manufa", saboda riƙewar har yanzu shine duk abin da aka gina fayil ɗin da shi; kawai ba a bayyana shi a ko'ina da za ka iya gani ba.

## Hanyoyin gazawa

| Alama | Dalilin da aka saba samu |
|---|---|
| Gyaran bayanin martaba da alama ba ya yin komai | Ana tsammani. Fayilolin da ke akwai suna kiyaye fasalin da aka ƙirƙira su da shi |
| Ba za a iya gyara adadin layi da matakin haɗawa ba | Bayanin martaba yana amfani da aƙalla tushen bayanai guda ɗaya. Kwafi shi |
| Tsarin yana nuna heartbeat ɗaya, fayil ɗin yana aiki azaman wani | Heartbeat na bayanin martaba ya canza kuma ba a taɓa daidaita fayilolin ba |
| Sabbin hanyoyin bayanai sun kasa ƙirƙira, log ya ce ba a sanya taskoki ba | An share bayanin martaba yayin da hanyoyin bayanai har yanzu ke nuni da shi |
| Mafi kyawun taska tana cike da abubuwan da ba a sani ba | Bincika sabuntawar da suka ɓace, heartbeat da ka'idojin haɗawa |
| Makon jadawali yana da gibi a kowane ƴan sa'o'i | Heartbeat yana kusa da mataki sosai don poller da ke gudana a makare |
| Kololuwar da aka gani jiya ta ɓace a cikin duba na wata | `AVERAGE` ne kawai aka ajiye, ko kuma an yar da taskar `MAX` don ajiye sarari |
| Diski ya girma sau huɗu cikin sauri fiye da yadda aka kiyasta | Ƙididdigar ta ƙidaya taskoki amma ba ayyukan haɗawa ba |
| Ba a samun ƙudurin da ake so daga sabon jerin taska | Edita yana ba da kyakkyawar taska a matakin bayanin martaba, sannan kawai zaɓi mara kyau fiye da taskokin da ke akwai |
