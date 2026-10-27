---
title: Haɓaka cikin aminci
description: Gwada tsarin haɓakawa, adana ajiya mai dacewa, duba yanayin ajiya da schema, kuma shirya tsarin komawa baya cikin haɗin kai.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 8
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

Haɓakawa yana canza abubuwa uku a lokuta daban-daban kuma tare da sauƙin komawa baya daban-daban.

| Canje-canje | Ana iya komawa baya | Ta yaya |
|---|---|---|
| Lamba, abubuwan dogaro da saiti | Daga kwafin da aka riƙe | Mayar da sigar da saitunan da suka dace |
| Schemar ma’ajiyar bayanai da samfuran layi | Daga ajiya mai dacewa | Mayar da ma’ajiyar bayanai; babu hanyar komawa baya ta atomatik |
| Fayilolin RRD | Daga ajiya mai dacewa | Mayar da tarihin da aka riƙe; samfuran da ba sa cikin ajiya ba za a iya sake ƙirƙirar su ta hanyar komawa baya ba |

Wannan tsari yana nan ne don kiyaye waɗannan abubuwa uku su tafi tare.

## Kafin ka fara

**Ɗauki cikakkiyar ajiya.** Dukkan sassa uku, masu daidaito da juna. Bi jagorar [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/). Dakatar da duk masu rubutu kafin ɗaukar ajiya na ƙarshe kuma a ajiye ajiyar da aka kiyaye har sai an karɓi haɓakawa.

**Rubuta sigar yanzu da sigar schema.** Haɗa abubuwan dogaro, canje-canje na cikin gida, plugins da saiti. Sigogin lambar tushe da yawa na iya ba da rahoton sigar schema iri ɗaya. Gwada sigar da ake son kaiwa a kan keɓaɓɓen kwafin da aka dawo da shi.

**Duba kowane plugin.** Bincika sanarwar dacewarsa, lamba da abubuwan dogaro, sannan a gwada ayyukan da kake buƙata a kan sigar da ake son kaiwa. Sanarwar ƙaramar siga kaɗai ba ta tabbatar da dacewa ba. Duba [Tabbatar da plugin](/ha/guides/install-and-vet-plugins/).

**Duba yanayin aiki.** Sigar PHP, ƙarin sassan PHP, da sigar sabar ma’ajiyar bayanai. Duba [bukatun](/ha/reference/requirements/) sigar da ake son kaiwa kafin saitawa. Kada a ɗauka cewa schema CLI tana yin kowane binciken da mai girkawa ta yanar gizo yake yi.

**Tabbatar cewa asusun ma’ajiyar bayanai zai iya canza schema.** A lokacin aiki asusun yana buƙatar karantawa da rubutawa a cikin ma’ajiyar bayanan kansa. A lokacin haɓakawa yana buƙatar ƙirƙira, canzawa da share tebura da fihirisa. Shigarwar da ta taƙaita izini bayan saiti tana gano wannan matsalar a nan.

**Tsayar da kowane mai samarwa.** Tsayar da tsarin tattara bayanai da aka tsara, masu tattara bayanai na nesa, tattara bayanai da aka kunna ta yanar gizo da gyaran hannu; jira ayyukan da ke gudana su gama. Zubar da rubutun da aka jinkirta ne kawai bayan masu samarwa sun tsaya, kuma a adana duk layukan jiran aiki da ba a tabbatar ba tare da ajiya mai dacewa. Ci gaba da tsayar da masu samarwa a duk lokacin turawa da tabbatar da schema.

## Maye gurbin manhajar

Kwafin rufewa a kai yana da iyakoki na musamman:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Idan ba tare da shi ba, `cp -a /path/to/new-release /path/to/kadupul` yana ƙirƙirar `kadupul/new-release/` kuma ya bar kowane fayil na tsohuwar manhajar a ainihin inda yake. Haɓakawa zai nuna kamar ya yi aiki, fuskar allon har yanzu tana gudanar da tsohuwar lamba, kuma alamar farko ta matsala ita ce ƙaurawar schema da ta ƙi dacewa da sigar da kake tsammanin ka maye gurbin ta.

Kwafi a kan saman bishiyar yana riƙe fayilolin da ba sa cikin sabuwar bishiyar, gami da tsofaffin fayilolin manhaja. Zai iya sake rubuta kowace hanya mai dacewa, don haka bincika kayan aikin maimakon ɗauka cewa an keɓe saiti ko bayanai. Zai fi kyau a yi amfani da bishiyar da aka duba tare da abubuwan dogaro, saiti da plugins masu dacewa. Idan ana canza sakin tsarin ta hanyar symlink, tabbatar da ainihin hanyar RRA da damar shiga ajiya kafin canzawa; tsarin farawa na yanzu yana samo shi ne daga kundin manhajar tare da `/rra`. Sauya symlink kaɗai ba komawa baya ba ne na ma’ajiyar bayanai.

**Duba abin da kake gudanarwa a zahiri kafin ka ci gaba.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Idan hakan bai ba da rahoton sakin da ka tura yanzu ba, tsaya. Duk abin da ke bayan wannan matakin yana ɗauka cewa an tura lambar da ake nufi. Hakanan a kwatanta sigar tushe ko checksum na ajiya tare da rikodin sakin; layin rubutun siga kaɗai bai isa ba.

## Ƙaurawar schema

Ma’ajiyar bayanai tana ɗauke da nata sigar, dabam da sigar da ke cikin lambar. Maye gurbin lambar ba ya canza ta.

Tsofaffin shafukan da aka amince da su suna turawa zuwa mai girkawa lokacin da lambar da sigar ma’ajiyar bayanai ba su dace ba. Wannan ba tsaro ne na kowa da kowa ga kowane wuri ko CLI ba, kuma daidaita rubutun siga ba ya tabbatar da cewa kowace ƙaura ta cika. Duba halin schema kai tsaye.

Mai girkawa da CLI suna gudanar da matakan ƙaura cikin tsari. Kafin haɓaka schema na yau da kullum, duba layin jiran aiki mai karko da damar ajiyar asusun sabis. Idan layin `poller_output` da aka gada ba InnoDB ba ne, canza shi a bayyane tare da masu rubutu a tsaye da kuma ajiya a riƙe:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Sannan a gudanar da wannan a ƙarƙashin kowane asusun yanar gizo da poller na gaske:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Tutar guda biyu ayyuka ne daban kuma ba za a iya haɗa su ba. Canza layin jiran aiki yana adana samfuran da ke jira; kada a datse layuka don cin jarrabawa. Warware mallaka da saitin UID/GID na lambobi da aka amince da su ta amfani da [bukatun ajiya](/ha/reference/requirements/). Masu tattara bayanai na nesa da ke kan layi yawanci suna zaɓar babban layi ne; yi amfani da `--local` kawai don bincika layin cikin gida da aka nufa ko canza shi. Da zarar waɗannan bincike sun wuce, gudanar da haɓaka schema daga tushen manhajar:

```sh
php cli/upgrade_database.php
```

Gudanar da shi a matsayin asusun sabis ɗin da aka saita tare da damar tsarin fayiloli da izinin ma’ajiyar bayanai da ake buƙata. Binciken root da ya yi nasara ba ya tabbatar da damar asusun sabis. Akwai zaɓin `--forcever` don saita sigar farawa a bayyane, wanda ke nan don sake gudanar da ƙaura yayin gwajin kafin fitarwa. Ba ɓangare ne na haɓakawa ta yau da kullum ba kuma amfani da shi don tsallake matakin da ya gaza zai bar schema a rabi ta ƙaura.

Ɗauki halin fita da sakamako, sannan a tabbatar da sigar ma’ajiyar bayanai da canje-canjen schema da ake buƙata. CLI na yanzu na iya ƙin tsohuwar sigar farawa da ba a sani ba ko ba a tallafawa ba amma duk da haka ya fita da 0; nasarar yanayin shell kaɗai bai isa ba. Idan ƙaura ta gaza a hanya, ci gaba da tsayar da masu samarwa kuma a dawo da rukunin ajiya mai dacewa maimakon ƙoƙarin tsallake matakin da ya gaza.

## Abin da ke karya plugins

Binciken plugin na mai girkawa ta yanar gizo na iya kashe plugins marasa dacewa ko waɗanda suka ɓace. Kada a ɗauka cewa schema CLI tana yin irin wannan binciken na rayuwar plugin.

**Ƙaramar sigar da aka sanar ta fi sabuwar sigar tsakiya girma.** An kashe. Wannan shine yanayin da aka saba gani kuma shine wanda binciken kafin haɓakawa ya kamata ya kama.

**Kundin plugin, fayil ɗin saitinsa, ko fayil ɗin sanarwarsa ya ɓace.** An kashe. Plugin ɗin da aka cire fayilolinsa yayin da har yanzu yake da alamar kunna a cikin ma’ajiyar bayanai yana faɗawa nan.

**Plugin ɗin ba shi da fayil ɗin sanarwa ko kaɗan.** Yana iya faduwa jarrabawar dacewar mai girkawa. Gwada fakitin plugin mai dacewa da ake kula da shi maimakon ɗauka cewa za a iya sake kunna shi ba tare da canji ba.

Akwai yanayi na huɗu wanda ba karya ba ne. Ayyukan da a da suka kasance plugin kuma tun daga lokacin suka koma cikin tsakiya ana cire su gaba ɗaya, ba a kashe su ba: ana cire ƙugiyoyinsu da shigarwar izini kuma a share layinsu. Idan ka ga plugin ya ɓace maimakon ya zama launin toka, duba rajistar ƙaura da matsayin takamaiman plugin kafin yanke shawarar cewa akwai abubuwa makamantan haka.

Kashe plugin ya bambanta da cire shi. Ƙugiyoyi da ƙaurawar plugin na iya canza teburansu da izininsu; riƙe lambar plugin da bayanai masu dacewa kuma a tabbatar da takamaiman hanyar haɓakawa. Kada a yi alkawarin kiyaye bayanai na kowa da kowa.

## Shirya komawa baya

Yanke shawarar komawa baya kafin ka fara, saboda shawarar ta bambanta dangane da yadda ka yi nisa.

| Matsayar gazawa | Koma baya ta hanyar |
|---|---|
| An maye gurbin lamba, babu aikin canza yanayi ko mai rubutu da ya yi aiki | Mayar da lambar da ta gabata, abubuwan dogaro da saiti bayan tabbatar da cewa yanayin bai canza ba |
| An fara canza layi ko ƙaura, gami da gazawar wani ɓangare | Tsayar da masu rubutu kuma a mayar da lamba, saiti, ma’ajiyar bayanai da ajiyar RRD masu dacewa |
| Ƙaura ta cika, manhaja ba ta aiki da kyau | Tsayar da masu rubutu kuma a mayar da rukunin ajiya mai dacewa; la’akari da samfuran da aka tattara bayan ajiya |
| Plugin kaɗai ya lalace | Bar shi a kashe yayin da ake tantance gyara ko komawa baya cikin haɗin kai bisa ƙa’idojin karɓa |

Doka a ƙarƙashin teburin: lamba da schema suna komawa baya tare ko ba sa komawa ko kaɗan. Tsohuwar lamba a kan sabuwar schema ba yanayi ba ne da ake tallafawa. Kada a dogara da binciken sigar yanar gizo don hana kowane aiki mara dacewa.

Ba wa kanka lokaci mai iyaka. Yanke shawara a gaba game da tsawon lokacin da za ka ɗauka kana neman kuskure kafin ka dawo da ajiya, kuma ka riƙe hakan. Ajiyar tana zama marar amfani gwargwadon tsawon lokacin da tsarin ke aiki a rabi-haɓaka.

## Me yasa fayilolin RRD sune ɓangaren da bai kamata ka rasa ba

Kada a ɗauka cewa turawa, gyara ko ci gaba da tattara bayanai yana barin RRDs ba tare da canji ba. Ajiye su tare da ma’ajiyar bayanai kuma a mayar da rukunin da ya dace lokacin da ake komawa baya daga canje-canjen yanayi. Samfuran layin da aka riƙe ƙila ba sa cikin waɗannan fayilolin ba tukuna. Ajiyar RRD da aka tabbatar za ta iya dawo da tarihin da aka ɗauka; samfurin da ya ɓace ba za a iya sake gina shi ta hanyar mayar da schema ko lamba kawai ba. Duba [Tushen bayanai da ma’ajiyar round-robin](/ha/concepts/data-sources-and-rras/) don dalilin da ya sa ba za a iya sake gina ingancin da ke cikinsu ba.

Hanyoyi uku na musamman da mutane ke rasa su yayin haɓakawa:

**Turawa ta hanyar maye gurbin kundin shigarwa.** Kundin RRA a asali ƙaramin kundi ne na shigarwa. Cire tsohon kundin da buɗe sabon a wurinsa na iya share ma’aunin da aka riƙe. Kiyaye bishiyar RRA ta hanyar tsarin ajiya da aka gwada kafin maye gurbin manhajar. Tabbatar da ainihin `$config['rra_path']`, hanyoyin da ke ciki da binciken amincin asusun sabis; wannan sigar ba ta samar da babban saitin ma’ajiyar bayanai don tushen RRA na cikin gida ba.

**Turawa daga checkout ko fakitin da ya mallaki dukkan bishiyar.** Irin wannan gazawar, ta atomatik. Tabbatar da abin da hanyar turawar ka ke ɗauka a matsayin mai yiwuwa a share.

**Gyara izini tare da canjin mallaka mai maimaitawa.** Ba shi da lahani ga bayanai amma yana iya barin poller ba zai iya rubutu ba, wanda ke bayyana a matsayin tsarin da ke zana tarihi daidai amma ba ya tattara wani sabon abu.

## Bayan haɓakawa

1. Bincika sakamakon haɓakawa, sigar ma’ajiyar bayanai da canje-canjen schema da ake buƙata, sannan a tabbatar da cewa fuskar allon tana buɗewa. Rashin turawa zuwa wani wuri kaɗai bai isa ba.
2. Kammala haɓaka lamba/saiti na mai tattara bayanai na nesa da aka shirya kuma a tabbatar da ma’ajiyar bayanan su yayin da masu samar da su ke a tsaye.
3. Maimaita binciken ajiyar asusun sabis, ci gaba da masu tattara bayanai da aka keɓe, kuma a tabbatar da lokutan sabuntawa na ƙarshe na RRD da ƙimomin da aka riƙe masu amfani.
4. Duba rajistar aiki don layin kididdigar gudu kuma a kwatanta lokacin da aka ɗauka da abin da ya kasance a da. Sabuwar siga na iya canza kuɗin tattara bayanai.
5. Sake kunna plugins ɗin da aka kashe, ɗaya bayan ɗaya, bayan shigar da sigogin da ke sanar da dacewa da sabuwar tsakiya.
6. Duba zurfin layin da aka riƙe, tattara bayanai na nesa da ayyukan plugin a tsawon lokacin karɓa da aka amince da shi. Ajiye ajiyar komawa baya har sai waɗannan bincike sun wuce.
