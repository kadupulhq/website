---
title: Dawo da RRD da ya lalace
description: Yadda za a banbanta taskar round-robin da ta lalace daga wacce aka saita ba daidai ba, yadda za a duba fayil, yadda dump da restore ke gyara shi, da kuma tarihin da za ka iya riƙewa lokacin da za a sake gina fayil ɗin.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 25
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

Ainihin lalacewar fayil ba kasafai yake faruwa ba. Yawancin fayilolin da aka ruwaito sun lalace suna nan daram amma ba sa jituwa da ma'ajiyar bayanai, ko kuma poller ba zai iya rubuta su ba, ko kuma sun daina karɓar ƙimomi saboda dalilin da ba shi da alaƙa da fayil ɗin. Gano wanne ne daga cikin waɗannan kake da shi kafin ka taɓa wani abu, saboda gyara ɗaya yana sa sauran su zama mafi muni.

:::danger[Kiyaye ainihin fayil]
**Kwafi fayil ɗin kafin kowane gyara a wannan shafi.** Dawo da shi zuwa wani keɓaɓɓen fayil ɗin gwaji sannan ka bincika shi kafin maye gurbin ainihin fayil mai aiki. Rage girman taskar ajiya ko goge ɗaya yana watsar da tarihin da aka riƙe. Canza iyakar ƙima yana shafar ingancin shigarwar bayanai na gaba ne kawai; baya goge tsoffin samfuran da aka adana. Babu tsarin soke aiki (undo) na atomatik a cikin RRD.
:::

## 1. Bayyana gazawar

| Abin da kake gani | Yawanci yana nufin | Je zuwa |
|---|---|---|
| Jadawali yana zana kuskure maimakon hoto | Fayil ya ɓace, ba za a iya karanta shi ba, ko kuma ba za a iya rubuta kundayen adireshi ba | Mataki na 2 |
| Jadawali babu komai amma babu kuskure | Babu ƙimomin da za a iya amfani da su a cikin kewayon da aka zaɓa, ko matsalar ma'anar jadawali | [Magance matsalolin ɓatattun bayanai](/ha/guides/troubleshoot-missing-data/) |
| Jadawali yana tsayawa a wani ƙayyadadden lokaci kuma ba ya ci gaba | Poller, izini, ko heartbeat | Mataki na 3 |
| Jadawali yana da bayanai amma siffar ta canza ba tare da canjin saiti ba | Fayil ɗin da ma'ajiyar bayanai ba su yarda da juna ba | Mataki na 4 |
| Ƙimar da aka riƙe duk ba a san su ba (unknown) | Tarawa, lokaci, iyaka ko saitin tushen bayanai yana buƙatar dubawa | [Magance matsalolin ɓatattun bayanai](/ha/guides/troubleshoot-missing-data/) |
| `rrdtool` ya ƙi karanta fayil ɗin | Hanyar da ta ɓace, gazawar samun dama, tsarin da bai dace ba ko lalacewa | Matakai na 2 da 3, sannan 5 |

Kadupul yana mayar da yanayin farko zuwa saƙo mai sauƙin karantawa maimakon hoto da ya karye, yana nuna bambanci tsakanin kundin da ba zai iya rubutawa da fayil ɗin da ba zai iya rubutawa ba, yana ba da rahoton fayil ɗin da ba ya nan a matsayin poller mai yiwuwa bai riga ya yi aiki ba tukuna. Wannan saƙon alama ce kawai, ba cikakken bincike ba: gogewa, canza hanya ko rashin cikar maidowa suma na iya barin sa ya ɓace.

## 2. Bincika fayil ɗin

Akwai ra'ayoyi biyu a shafin tushen bayanai kansa, duka ana kunna su kowane zama. Yanayin gyara kuskure (debug view) yana buga umarnin `rrdtool create` wanda Kadupul zai bayar don wannan tushen bayanan a yau. Yanayin bayani (info view) shine wanda ke da mahimmanci a nan: yana karanta fayil ɗin tare da `rrdtool info`, yana karanta ma'anar tushen bayanai daga ma'ajiyar bayanai, kuma yana buga bambance-bambance. Inda za a iya daidaita bambanci ba tare da sake ginawa ba, yana buga umarnin `rrdtool tune` ko `rrdtool resize` wanda zai yi hakan, a matsayin rubutu don ka gudanar da kanka maimakon gudanar da shi.

Daga harsashin umarni (shell), wannan matakin farko:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Babban taken yana ba da mataki, lokacin sabuntawa na ƙarshe, kowane sunan tushen bayanai tare da nau'insa, heartbeat, mafi ƙanƙanta da mafi girma, da kowace taska tare da aikin haɗawa, adadin layi da ƙuduri. Idan wannan umarnin ya ba da kuskure, kiyaye kuskuren kuma bincika hanya, izini da dacewar RRDtool kafin gano lalacewar. Nasarar `info` tana karanta metadata kawai; kuma a bincika fitowar `fetch` sannan a gwada dump don bincika tarihin.

## 3. Bincika dalilai na zahiri da farko

| Dubawa | Me yasa yake zuwa kafin gyara |
|---|---|
| Mallakar fayil da izini | Fayil ɗin da root ya ƙirƙira yayin kiyayewa ba zai iya rubutu ta poller ba daga wancan lokacin |
| Mallakar kundin adireshi da izini | Poller ba zai iya ƙirƙirar fayil ɗin maye gurbi a cikin kundin da ba zai iya rubutawa ba |
| Sarari mai 'yanci da inodes | Cikakken tsarin fayil yana haifar da gajerun rubuce-rubuce waɗanda ke kama da lalacewa |
| Ko akwai marubuci na biyu | Sabuntawa na lokaci ɗaya ko mara tsari na iya kasawa ko ɓata hoton kiyayewa; bincika logs |

Gudanar da aikin gyara a matsayin asusun da ya mallaki kuma yake sabunta RRD, kuma kiyaye yanayinsa, mai shi da rukuninsa. Dakatar da duk masu rubutu kafin kwafin ko maye gurbin fayiloli, gami da masu karɓar bayanai na nesa, ayyukan da aka tsara da kuma kiyaye hannu. Share rubuce-rubucen da ke jiran aiki kawai bayan masu samar da su sun tsaya. Umurnin harsashi na yau da kullun ba sa samun makullin ajiya na Kadupul. Duba [buƙatun ajiya](/ha/reference/requirements/) da hanyar kwantar da hankali a cikin [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/).

## 4. Karanta abin da mai bincike ya riga ya samo

Kadupul na iya bincika hanyoyin bayanai masu alaƙa da jadawali akan na'urorin da aka kunna akan jadawalin lokaci da kuma yin rikodin abin da ya samu; wannan ba cikakken lissafin kowane fayil bane a kan diski. A kashe yake a asali. Tsarin yana nuna inda za a kunna shi: Configuration -> Settings -> Data.

| Saiti | Asali | Tasiri |
|---|---|---|
| Enable RRDfile Check | A kashe | Ba a bincika komai har sai an saita wannan |
| Check Frequency | Sa'o'i 4 | Hakanan yana ba da sa'a 1, sa'o'i 24, ko gudana bayan kowane zagaye na boost |
| Number of RRDfile Check Processes | Tsari 1 | Yana raba jerin fayiloli tsakanin ma'aikata masu aiki a lokaci guda |
| RRDChecker Timeout | Sa'a 1 | Ana kashe aikin idan ya wuce wannan |

Abubuwan da aka samo suna taruwa a cikin lissafi tare da na'urar, tushen bayanai, ID na tushen bayanai na ciki, saƙo, da kwanan wata. Zaka iya tacewa ta tsawon lokaci da bincika rubutu, kuma zaka iya share lissafin da zarar ka ɗauki mataki a kansa.

Saƙonnin da zai iya yin rikodin su, da kuma abin da kowannensu ke nufi:

| Saƙo | Ma'ana |
|---|---|
| RRDfile does not exist | Ba a taɓa ƙirƙirar fayil ɗin ba, an matsar da shi ko an goge shi, ko kuma hanyar da aka saita ta canza |
| RRDfile is not writable | Mai amfani da poller ba zai iya rubuta fayil ɗin ba |
| RRDfile modify time older than hour | Ba a rubuta komai ba aƙalla na sa'a ɗaya |
| Last update value in RRDfile is older than 1 hour | Tambarin sabuntawa na ƙarshe na fayil ɗin ya tsufa, wanda shine mafi ƙarfi shaida fiye da lokacin gyarawa |
| The RRDfile step does not match the Data Source Profile step | An ƙirƙiri fayil ɗin a ƙarƙashin tazara daban |
| There are more, or less, Data Sources in the database than in the RRDfile | Samfurin ya sami ko ya rasa filaye bayan an ƙirƙiri fayil ɗin |
| The Data Source '...' exists in RRDfile, but not in database | Yana kiran sunan filin, daga gefen fayil ɗin |
| Data Source name '...' exists in the Database, but not in RRDfile | Yana kiran sunan filin da poller ke rubutawa wanda ba shi da gida a cikin fayil ɗin |
| The RRDfile Minimal Heart... is lower than polling interval | Mai binciken yana nuna heartbeat ƙasa da ko daidai da tazarar jefa ƙuri'a; samfuran da suka makara na iya zama ba a san su ba |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Heartbeat na fayil ɗin yana ƙasa da na bayanin martaba; wannan binciken ba ya nuna wanda ya fi girma |
| Stale values for last 24 hours, or last hour | Kowane samfurin da aka karanta a cikin wannan taga ba a san shi ba (unknown) |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Gazawar tarin bayanai na ɓangare |
| No data returned, maybe corrupted Data Source | Ɗaukar bayanai daga fayil ɗin bai dawo da komai ba sam |

Binciken yana gyara matakin da aka yi rikodin ma'ajiyar bayanai da heartbeat don dacewa da bayanin martaba yayin da yake tafiya, wanda ke warware sabani tsakanin bayanin martaba da layukan tushen bayanai amma ba ya taɓa fayil ɗin. Ana bayar da rahoton rashin daidaituwar ƙidaya tsakanin fayil da ma'ajiyar bayanai maimakon a gyara shi ta atomatik, saboda kowane ɓangare na iya zama kuskure.

## 5. Dump, gyara, dawo da shi

RRDtool na iya mayar da fayil ɗin da za a iya karantawa zuwa XML kuma ya sake gina fayil ɗin ɗan takara daga ciki. Wannan na iya taimakawa tare da sanannen rashin daidaituwa na tsari, amma ba ya sake gina samfuran da suka ɓace ko kuma ba da tabbacin cewa za a iya bincika fayil ɗin da ya lalace. Kadupul kuma yana amfani da mataimakan dump/restore don canje-canjen tsari. Mataimakin maidowa na gida yana gina fayil ɗin ɗan'uwa na wucin gadi kuma yana sake masa suna a kan inda za a tura bayan an yi nasara; wannan ba ya samar da ajiya.

Tare da dakatar da marubuta, gudanar da wannan a matsayin mai mallakar RRD. Sauya hanyar misali da ainihin hanyar tushen bayanai. Ana ƙirƙirar kundin aiki na sirri kusa da tushen don ɗan takarar ya kasance a kan tsarin fayil ɗaya:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Zaɓi kewayon fetch da aikin haɗawa wanda ya ƙunshi sanannun bayanan da aka riƙe; sa'a ta ƙarshe misali ne kawai. Kwatanta sunayen tushen bayanai da na ɗan takara, mataki, taskoki, tambarin lokacin sabuntawa na ƙarshe da ƙimar samfurin. Dump/restore da ba a canza ba na iya canza tsarin binary, don haka a kwatanta ƙimomi maimakon buƙatar daidaiton hash na fayiloli.

Ajiye ainihin kwafin. Sai bayan tabbatarwa, dawo da yanayin da ake buƙata na ɗan takarar, mai shi da rukuni kuma sake masa suna zuwa ainihin hanyar aiki yayin da marubuta suka kasance a dakatar. Tabbatar cewa asusun poller zai iya karantawa da sabunta shi kafin ci gaba da tattara bayanai. Wannan misalin yana tsayawa kafin shigarwa don kar a shigar da ɗan takarar da za a iya karantawa amma ba daidai ba.

Fayilolin XML da na ɗan takara suna buƙatar ƙarin sararin diski. Dump ɗin da ya gaza na iya barin ɓangaren XML; kada a mayar da shi. Bincika dama, sarari kyauta da kuskuren da aka ruwaito. Idan ba za a iya zubar da na asali ba bayan waɗancan binciken, dawo da ingantaccen ajiyar madadin bayanai a maimakon haka. [`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) na RRDtool yana ba da damar sake rubuta wurin kai tsaye; misalin da aka tsara yana amfani da sabon wuri da gangan.

## 6. Abin da ke tsira, da abin da ba ya tsira

| Lalacewa | Tarihin da za a iya dawowa da shi |
|---|---|
| Fayil ba shi da rubutu, amma yana nan daram | Tarihin da aka riƙe yana tsira. Sabuntawar da aka rasa ba a dawo da su ta hanyar gyara damar shiga kawai ba |
| Heartbeat, mafi ƙanƙanta ko mafi girma ba daidai ba | Ee. `rrdtool tune` yana canza babban taken ba tare da taɓa ƙimomin da aka adana ba |
| Mataki (step) ba daidai ba | Yana buƙatar bayyanannen juyawa mai inganci; canza bayanin martaba na ma'ajiyar bayanai kaɗai ba ya canza fayil ɗin |
| Tushen bayanai ya ɓace daga fayil ɗin | Filayen da ke akwai suna kiyaye tarihin su. Sabon filin yana farawa babu komai |
| An share taska ko ba a taɓa ƙirƙira ta ba | A'a. Ƙudurin da ba a taɓa adana shi ba ba za a iya sake gina shi ba |
| An rage layukan taska ta hanyar rage girman da ke raguwa | A'a. Layukan da aka yar sun ɓace a daidai lokacin da umarnin ke aiki |
| Fayil ɗin da aka yanke, dump ya gaza | A'a. Dawo daga ajiyar madadin bayanai |
| Babban taken yana nan daram, amma wutsiyar fayil ɗin ta yanke | Kada ka ɗauka cewa babban taken da za a iya karantawa yana nufin cikakken dump; yi amfani da ingantaccen ajiya idan dump ya gaza |

Canza tazarar poller ko matsar da tushen bayanai zuwa wani bayanin martaba na riƙewa ba ya sake fasalin fayilolin da ke akwai ta atomatik. RRDtool kuma yana fallasa [ayyukan tsarin na `tune`](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), gami da zaɓin mataki; tabbatar da halayyar juyawa don sigar da ka shigar da tsarin taska maimakon ɗaukar canjin tazara mara asara. Duba [Tushen bayanai da ma'adanai](/ha/concepts/data-sources-and-rras/) da [Sarrafa riƙewar bayanai](/ha/guides/manage-data-retention/). Haɓaka matsakaicin ƙima tare da `tune` yana da aminci; rage ɗaya yana yin rikodin kowane ƙimar da ke gaba sama da sabon rufin a matsayin wanda ba a sani ba.

## 7. Sake ginawa yayin kiyaye abin da za a iya kiyayewa

Kadupul yana jigilar kayan aikin splice wanda zai iya cika sabon fayil daga tsohon da za a iya karantawa. Ɗauki sakamakonsa a matsayin ɗan takara: zai iya cike gibi kuma ya maye gurbin ainihin sifili, don haka ba kwafi ne mara asara na tarihin da aka auna ba. Gudanar da shi daga asalin manhaja akan babban mai karɓar bayanai, ta amfani da keɓaɓɓun kwafi a cikin kundayen adireshi amintattu masu rubutu.

Ƙirƙiri `new.rrd` tare da tsarin da aka nufa a cikin kundin sirri na `$work` daga mataki na 5, sannan ka duba haɗin:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Duk fayilolin shigarwa biyu dole ne su riga sun wanzu kuma su wuce binciken ikon rubutu na kayan aiki. Sabon fayil ɗin yana ba da tsari. Ba tare da `--finrrd` ba, fitarwar ita ce hanyar sabon fayil ɗin tare da `.new`; yi amfani da sabuwar hanyar fitarwa a bayyane don kauce wa maye gurbin ɗan takarar da ya gabata. `--dryrun` yana tantancewa kuma yana haɗawa ta amfani da XML na wucin gadi da ma'ajiyar SQLite (idan akwai), amma yana tsallake maidowar RRD ta ƙarshe. Ba ya tabbatar da cewa maidowar ƙarshe za ta yi nasara. Cire `--dryrun` don samar da keɓaɓɓen ɗan takara. Guji `--owner` yayin samfoti kuma gudanar da shi a matsayin asusun sabis ɗin da ake buƙata; bincika ainihin mallakar fitarwa kafin shigarwa.

:::caution[Haɗin splice yana ɗaukar sifili a matsayin wuri mara komai]
Haɗin yana duba sabon fayil ɗin kuma, a kowane wuri da ke ɗauke da wanda ba a sani ba (unknown) **ko sifili (zero)**, yana neman ƙimar da ta fi kusa a tsohon fayil ɗin ya rubuta ta a maimakon haka. Don haka ana maye gurbin ainihin sifili a cikin sabon fayil ɗin da tsoffin bayanai. A kan duk abin da ke karanta sifili bisa ƙa'ida na tsawon lokaci, tashar da ba ta aiki, layin jiran aiki da ke zama babu komai, kaunta mai hutu, bincika sakamakon kafin ka sanya shi aiki. Hakanan ana cika abubuwan da ba a sani ba na tsohon fayil ɗin ta amfani da ƙimomin da suka gabata, don haka sakamakon da aka haɗa na iya ƙirƙirar ci gaba ta hanyar bayanan da suka ɓace.
:::

Bayan haɗawa, sanya fayil ɗin inda tushen bayanai ke tsammaninsa, tare da mallakar da poller ke buƙata, kuma bincika cewa jadawali yana zane.

## 8. Cike gibi, da dalilin da ya sa za a sake tunani

| Kayan aiki | Abin da yake rubutawa |
|---|---|
| `cli/batchgapfix.php` | Yana cike kewayon kwanan wata a cikin na'urori da yawa a layi ɗaya, ta amfani da ko dai ƙimar ƙarshe da aka sani ko matsakaici |
| `cli/float_rrdfiles.php` | Yana shawagi a cikin kewayon jadawalin da aka zaɓa ta hanyar dump da restore ɗaya |

Dukansu suna ƙirƙirar ma'auni na ƙirƙira ne. Ba a tattara komai a waɗancan tambarin lokaci ba, kuma daga baya babu wani abu a cikin fayil ɗin da ke raba ƙimomin da aka ƙirƙira daga ainihin na gaske. Yi amfani da su lokacin da ka san gibin ba katsewar sabis bane: poller ya tsaya don kiyayewa, ko taga ce ta ƙaura. Kada a taɓa amfani da su akan duk wani abu da ke ciyar da lissafin ƙarfin aiki ko lissafin kuɗi. Haka gargaɗin ya shafi [cire spikes](/ha/guides/remove-spikes-from-data/).

## 9. Gyara kuskure na atomatik na tushen bayanai guda ɗaya

Don tushen bayanai guda ɗaya da ke aiki ba daidai ba, Kadupul na iya gudanar da binciken gyara kuskure a cikin 'yan zagayowar jefa ƙuri'a na gaba kuma ya ba da rahoto: ko fayil ɗin yana nan, ko shi da kundinsa ana iya rubuta su, wane asusu ne ya mallake shi idan aka kwatanta da wane asusun poller ke aiki a ciki, ko tushen bayanai yana aiki, ko fayil ɗin ya dace da ma'anar tushen bayanai, ko sabuntawa na ƙarshe ya matsa bayan jefa ƙuri'a, da kuma ko ƙimomin ana iya amfani da su. Aikin gyaransa kaɗan ne. Yana gudanar da shawarwarin `rrdtool tune` da kwatancen ya samar kuma babu wani abu dabam, yana ƙin karɓa da yin rikodin dalilin lokacin da lissafin ba komai ko fayil ɗin ba shi da rubutu. Ba ya sake ƙirƙirar fayiloli, ƙara hanyoyin bayanai, ko canza taskoki.

## 10. Gogewa haɗari ne na daban

Kadupul yana bin diddigin fayilolin taska waɗanda tushen bayanan su ba ya wanzu kuma yana ba da damar cire su. Hakanan za'a iya saita shi don yin aiki ta atomatik lokacin da aka share tushen bayanai, tare da hanyoyi biyu: sharewa (delete), ko matsar da shi zuwa kundin ajiya (archive).

:::danger[Gogewa na dindindin ne]
Hanyar gogewa (delete) tana cire fayil ɗin daga diski gaba ɗaya. Babu matakin kwandon shara kuma bayanan ba sa cikin ma'ajiyar bayanai. Idan ba ka da tabbacin cewa kowane fayil da aka jera maraya ne da gaske, saita hanyar zuwa archive, wanda ke matsar da fayiloli zuwa wani kundin adireshi da ka zaɓa, sannan ka share wannan kundin da hannu daga baya.
:::

Fayil na iya zama kamar maraya ba tare da ya zama maraya da gaske ba. Tushen bayanan da aka matsar zuwa sabuwar hanya, maidowar da aka gama a ɓangare, ko na'urar da aka sake ginawa a ƙarƙashin sabon ID duk suna barin fayilolin da babu abin da ke nuni zuwa gare su. Bincika lissafin tare da rikodin kanka na abin da ya canza da farko.

## Hanyoyin gazawa

| Alama | Dalili |
|---|---|
| Gyara ya yi nasara, jadawali har yanzu babu komai | Bincika dama, kewayon lokacin da aka zaɓa, tarin bayanai da ma'anar jadawali |
| `rrdtool dump` yana ba da kuskure akan fayil ɗin | Bincika hanya, dama, ajiya da tsari kafin yanke shawarar cewa ya lalace |
| An yi amfani da Tune, ba abin da ya canza | Canje-canjen babban taken ba sa cika samfuran da ba a sani ba na tarihi a baya; tabbatar da ma'anar fayil da ma'ajiyar bayanai |
| Ƙananan gibi a ko'ina bayan canjin tazara | Fayilolin har yanzu suna ɗauke da tsohon mataki da heartbeat |
| Fayil ɗin da aka haɗa yana da tsoffin bayanai inda sabon fayil ɗin ya karanta sifili | Ana tsammani. Haɗin yana cika sifili da kuma ƙimomin da ba a sani ba |
| Jerin mai duba yana girma kuma ba ya taɓa raguwa | Ana yin rikodin abubuwan da aka samo har sai an share su; gyara dalilin ba ya share su |

Ajiye kundin taska da ma'ajiyar bayanai tare, a kan jadawali ɗaya, kuma a gwada maidowa. Maidowa yana iyakance ga abin da waccan ajiyar ta riƙe a lokacin ɗaukar ta. Duba [Ajiye da dawo da bayanai](/ha/guides/back-up-and-restore/).
