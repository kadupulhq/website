---
title: Tsarin Gine-gine
description: Sashe huɗu masu motsi, da wanda aka fi samun matsala a cikinsa.
sidebar:
  order: 1
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
---

:::caution[Halayen wakilin RRDtool da aka gada]
Ba a goyon bayan tura wakilin RRDtool a Kadupul. Yi amfani da ma'ajiyar RRDtool ta gida (`storage_location = 0`). Saitunan wakili, bayanin ka'idoji da tsarin aiki a wannan shafi suna bayyana halayen da aka gada ne, ba wata hanyar turawa ko ƙaura da ake tallafawa ba. Duba [Wakilin RRDtool](/ha/reference/rrdproxy/).
:::

Aikace-aikacen gidan yanar gizo na Kadupul, rumbun adana bayanai, tattara bayanai da aka tsara da ma'ajiyar RRD suna da ayyuka daban-daban, amma hanyoyin aikinsu suna haɗuwa. Sanin aikin da ya gaza yana taimakawa wajen rage faɗin bincike; kasancewar fuskar aiki tana buɗewa ba ya tabbatar da cewa aikin tattara bayanai yana aiki.

**Fuskar gidan yanar gizo** wani aikace-aikacen PHP ne. Yana sarrafa saiti kuma yana fitarwa ko bayar da jadawalan da aka ajiye a cache. Wasu ayyukan yanar gizo suna kuma tayar da aikin tattara bayanai, kamar buƙatun jadawali na lokaci-lokaci, kuma buƙatun jadawali na yau da kullun na iya tayar da sabuntawar RRD da ke jiran aiki.

**Rumbun adana bayanai** yana ɗauke da saiti, izini, yanayin aiki, cache na mai tattarawa (poller cache) da layukan gwaji. Ƙimomin da aka tattara na iya zama a can yayin da suke jiran rubutawa a RRD ko sake gwadawa; ba kawai wurin ajiye saiti ba ne.

**Mai tattarawa (poller)** yana daidaita ayyukan da aka tsara da kuma ƙananan matakan tattara bayanai. Sakamakon yana wucewa ta layukan rumbun adana bayanai kafin marubuci na yau da kullun ko wanda aka ɗage ya sabunta fayilolin RRD.

**Fayilolin RRD** suna ɗauke da tarihin lokaci mai iyaka. Tushen bayanai yakan sami RRD guda ɗaya mai ɗauke da filayensa; ƙirƙirar jadawali na iya sake amfani da tushe, kuma ƙirƙirar metadata ba ya ba da tabbacin cewa fayil ɗin ya riga ya wanzu.

## Iyakokin tsari

| Iyaka | Abin da ke ketarewa | Abin da ke ɗauka |
|---|---|---|
| Fuska zuwa rumbun bayanai | Tsari, zama, izini, aikin da aka ajiye da bayanan aiki | SQL; rumbun adana bayanai na iya kasancewa a wani wuri na daban |
| Fuska zuwa fayiloli | Karatun jadawali, hotunan da aka ajiye, da cancantar sabuntawa ko ƙirƙirar RRD a kan buƙata | Tsarin fayil da RRDtool |
| Mai tattarawa zuwa rumbun bayanai | Jerin aiki, ƙimomin da aka tattara, layukan da aka riƙe, hali da ƙidayar lokaci | SQL |
| Tattarawa zuwa na'urori | SNMP, rubutun tattarawa da gwajin samun dama | Umarnin hanyar sadarwa ko na gida; ana iya samun tattarawar da gidan yanar gizo ya tayar |
| Marubuci zuwa fayiloli | Samfuran da aka haɗa, mai yiwuwa tamburan lokaci da yawa a kowace sabuntawa | Umarnin RRDtool da bututun da aka amince da su |
| Sabar rumbun bayanai zuwa fayilolin RRD | Babu sabuntawar RRD kai tsaye a hanyar aikace-aikace ta yau da kullun | Lambar marubucin aikace-aikace tana daidaita ma'ajiyoyi biyu |

Layukan rumbun adana bayanai suna haɗa tushen bayanai da na'ura da kuma hanyar fayil ɗin da aka saita mata. Fayilolin RRDtool suna bayyana jerin lokaci da taskoki; ba sa maye gurbin taswirar aikace-aikacen. Hanyar sadarwar ba ta takaita ga tambayar na'ura kawai ba: haɗin rumbun adana bayanai, masu tattarawa na nesa da sauran haɗin da aka saita na iya ketare sabar daban-daban.

Yi ajiyar madadin halin rumbun bayanai, samfuran da ke jira da fayilolin RRD a dunkule. Dawo da rumbun adana bayanai kaɗai ba ya dawo da abubuwan da ke cikin tarihin RRD, kuma dawo da fayiloli kaɗai yana barin saiti da samfuran da ba a zubar ba. Matsar da fayiloli ba tare da daidaita hanyoyi ba na iya haifar da kurakuran rashin fayil ko riƙe rubutu; ba garantin gazawar tattara bayanai a asirce ba ne. Duba [Ajiye madadin bayanai da mayarwa](/ha/guides/back-up-and-restore/) da [Ƙaura zuwa sabuwar na'ura mai kwakwalwa](/ha/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Dalilin da ya sa tarihin dogon lokaci ke amfani da fayilolin RRD

Ana adana tarihin jadawali na dogon lokaci a cikin RRDs, amma layukan ma'auni suna cikin rumbun adana bayanai. Layin yau da kullun mai gudana shine InnoDB a wannan bita, kuma rubuce-rubucen da aka ɗage suna riƙe samfurori a cikin teburin Boost. Rubutun da ya gaza ko isar da sako na nesa da aka jinkirta na iya haɓaka waɗannan layukan. Duba [Rubutu mai yawan gaske](/ha/concepts/high-volume-writes/).

RRD yana ware ƙayyadadden adadin layuka a zaɓaɓɓun ƙuduri. Sabuntawa ta yau da kullun tana sake amfani da wannan sarari maimakon ƙara tarihi har abada. Girman fayil yana da iyaka idan ba a canza tsari ba; ƙara tushen bayanai, canza tsari, riƙe kofofin dawo da bayanai ko tara layuka har yanzu yana ƙara buƙatun ajiya gaba ɗaya.

Rangwamen da ake samu shine lokacin riƙewa da aka zaɓa a gaba. Da zarar cikakken tarihin ya ƙare ko aka haɗa shi, canjin tsari na gaba ba zai iya sake ƙirƙirar cikakkun bayanan da aka jefar ba. Duba [Tushen bayanai da taskokin zagaye-zagaye (RRA)](/ha/concepts/data-sources-and-rras/).

Tsari da halin aiki suna amfani da rumbun adana bayanai saboda aikace-aikacen yana buƙatar sabuntawa na haɗin gwiwa da tambayoyin dangantaka. Wannan ba yana nufin cewa kowace dangantaka tana da ƙarfin maɓallin waje na rumbun bayanai ba, ko kuma cewa ajiyar layi dole ne ya haɓaka har abada; yana bayyana rarraba nauyi ne na wannan aikace-aikacen.

## Hanyoyi biyu, suna raba sassa biyu

Buƙatar shafi na yau da kullun ko jadawali yawanci yana bin wannan hanyar:

1. Mai bincike yana aika buƙata; PHP yana loda saiti kuma ya haɗa zuwa rumbun adana bayanai.
2. Buƙatar tana amfani da tantancewa da kuma izinin yanki/abu mai dacewa.
3. Ayyukan na'ura mai sarrafawa suna karantawa ko sabunta saiti kuma suna iya tayar da ƙarin aiki.
4. Buƙatar jadawali na iya duba samfuran Boost da ke jira da cache na hoto, ko haɗa umarnin RRDtool da karanta fayilolin da aka saita. Duba [Yadda ake zana jadawalai](/ha/concepts/how-graphs-are-drawn/).
5. Buƙatun jadawali na lokaci-lokaci na iya ƙaddamar da mai tattarawa na lokaci-lokaci kuma su yi amfani da keɓaɓɓen bayanan wucin gadi. Jadawali mai laushi shi kaɗai ba ya tabbatar da fayil ɗin babu komai ko nasarar tattarawa da zane.

Tsarin tattara bayanai da aka tsara yawanci yana bin wannan hanyar:

1. Mai tsara lokaci yana fara poller, wanda ke duba yanayin kunnawa, lokaci da ma'ajiya.
2. Yana zaɓar aikin da ya cancanta daga cache na poller kuma yana ƙaddamar da ƙananan matakan tattara bayanai.
3. Ƙananan matakai suna tambayar na'urori ko gudanar da rubutun tattarawa da sanya sakamako a cikin rumbun adana bayanai.
4. Marubuci mai dacewa yana aiwatar da samfuran da aka haɗa, yana amfani da layukan da aka ɗage idan an saita kuma yana riƙe gazawar da za a iya sake gwadawa.
5. Ana sabunta halin aiki da yanayin tsara lokaci a cikin rumbun adana bayanai.

Duba [Tsarin rayuwar poller](/ha/reference/poller-lifecycle/) don yin oda da magance gazawa. Waɗannan hanyoyi suna raba albarkatun rumbun adana bayanai da ma'ajiya kuma suna iya yin takara a kansu. Sake kunna sabar yanar gizo ba ya gyara poller da aka tsara daban, amma buƙatun yanar gizo na iya shiga cikin tattarawa da rubutawa; gano ainihin tsarin da ya gaza.

## Abin da ke gudana a matsayin wanne mai amfani

| Tsari | Yana gudana a matsayin | Wanda ya fara shi |
|---|---|---|
| Aikace-aikacen yanar gizo na PHP | Sabar yanar gizo ko asusun PHP-FPM pool | Sabar yanar gizo |
| Poller da aka tsara | Asusun da aka saita na mai tsara lokaci | cron, Task Scheduler, ko sabis ɗin da aka saita |
| RRDtool | Yawanci yana gado asusun tsarin da ya ƙaddamar da shi | Hanyar yanar gizo, poller ko kula da tsari |
| Rubutun tattarawa | Yawanci suna gado asusun mai tattara su | Tattarawar da aka tsara ko wacce yanar gizo ta tayar |

Duk asusun marubuta da ke shiga suna buƙatar samun dama mai dacewa zuwa ma'ajiyar da aka saita. Ƙirƙirar tushen bayanai na yau da kullun yana rubuta metadata; za a iya ƙirƙirar RRD daga baya lokacin da marubuci yake buƙata. Fayil ɗin da ya ɓace na iya nuna cewa tattara bayanai bai kai wannan matakin ba, gami da gazawar hanya, amana, izini ko ƙirƙira.

Wasu hanyoyin ƙirƙira da aka gudanar a ƙarƙashin root suna ƙoƙarin amfani da mai shi da rukunin babban fayil na RRA. Waɗannan ƙoƙarce-ƙoƙarce na iya gaza da yin rikodin kurakurai; ba su ne madadin saita asusun sabis daidai ba. Mallakar da ba ta root ba tana bin ƙa'idodin tsarin aiki, gami da gadon rukunin babban fayil da ACLs. Tabbatar da izinin ajiya da saitunan lambobi na UID/GID masu aminci a ƙarƙashin kowane asusun marubuci na yanar gizo da poller. Duba [Haɓaka cikin aminci](/ha/guides/upgrade-safely/).

Aiwatar da PHP ICMP da aka bita yana kiran kayan aikin ping na tsarin aiki. Ƙarfinsa na aika bincike ya dogara da wannan kayan aiki da manufofin tsarin aiki; kasancewar tsofaffin mataimaka na tasirin UID ba yana nufin kowane binciken ICMP yana ɗaga PHP zuwa root ba. Kada a gudanar da aikace-aikacen a matsayin root kawai don ba da damar ping. Duba ainihin umarnin, asusu da fitarwar kuskure; gwaje-gwajen TCP ko UDP suna da ma'anar samun dama daban-daban.

## Jerin aiki an riga an lissafta shi

Cache na poller yana adana aikin tattarawa da aka warware don kowane gudu ba ya buƙatar fitar da kowane umarni daga dangantakar samfuri. Ayyukan saiti na iya sake gina bayanan da abin ya shafa; ana samun ingantattun kayan aikin sake ginawa idan ana buƙata.

Canje-canjen da aka wakilta a cikin filayen da aka ajiye suna buƙatar isa ga waɗancan bayanan kafin tattarawa ta yi amfani da su. Ana karanta sauran saitunan daban, don haka ba kowane canjin saiti ke buƙatar sake gina cache da hannu ba. Bincika abubuwan da ke cikin cache, kurakuran tattarawa da yanayin kwafin nesa maimakon ɗaukar dalili ɗaya kawai. Duba [Cache na poller](/ha/concepts/the-poller-cache/) da [Tattara bayanai na nesa](/ha/concepts/remote-data-collection/).

## Inda abubuwa suka fi lalacewa

| Alama | Bincike mai amfani |
|---|---|
| Fuska tana aiki, jadawali a kwance | Gudun mai tsara lokaci, kurakuran tattarawa, layuka, sabon samfur da tagar jadawali |
| Poller yana aiki, fayiloli ba sa ci gaba | Yarda/kurakuran marubuci, amintar ajiya da izini, ayyukan da aka jinkirta |
| Tushen bayanai guda ɗaya a kwance | Amsar na'ura, layin cache, taswirar fayil, samfuran da ba a sani ba da maganganun zane |
| Canjin saiti kamar ba shi da amfani | Sakamakon adanawa, soke samfuri, abubuwan da suka shafi cache da kwafi |
| Razarar lokaci na yau da kullun | Lokaci, bugun zuciya (heartbeat), lokacin tsayawa, samun na'ura da gazawar rubutu |
| Siffar jadawali da ba a zata ba | Umarnin da aka samar, zaɓuɓɓukan CDEF/CF, ainihin bayanan fayil, cache na hoto da taswira |
| Tarihin tashar jiragen ruwa kamar yana haɗe da wata fuskar daban | Asalin tambaya, sake ƙididdigewa da sakamakon sake fihirisa |
| Asusun yana ganin na'ura mai sarrafawa amma babu jadawali | Yankin shafin jadawali, izinin abu da asalin jadawalin da aka nema |
| Masu tattarawa sun bambanta | Rarrabawa, tsarin da aka kwafi, soke na gida da yanayin haɗi |
| Komai yana tafiyar hawainiya | Jira na rumbun bayanai, rikicin marubuci/ma'ajiya, lokacin aiki mai tattarawa da aikin yanar gizo |
| Bayanan tushen bayanai suna nan amma babu fayil | Tattarawa/rubutu na farko, hanyar da aka saita, kurakuran amana da ƙirƙira |

Waɗannan wuraren farawa ne, ba cikakken bincike ba. Bi shaidar da ke ketare iyakar da ta dace kuma tabbatar da sakamakon bayan canji. Duba [Magance matsalar ɓacewar bayanai](/ha/guides/troubleshoot-missing-data/).
