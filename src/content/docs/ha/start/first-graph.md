---
title: "Karanta jadawalin farko"
description: "Ainihin ma’anar layukan, da kura-kurai guda uku da ke sa mutane fahimtar su a kuskure."
sidebar:
  order: 4
banner:
  content: "Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen."
---

Jadawali a nan ba hoton bayanan ka ba ne. Hoto ne na taƙaitaccen bayanin ka, kuma sanin wane taƙaitaccen bayani ne ke da muhimmanci.

## Abin da kake kallo

Ana zana kowane jadawali ne daga rumbun adana bayanai na round-robin (round-robin archive). Rumbun yana adana sabbin samfuran a cikakken inganci da tsofaffin samfuran da aka haɗa su zuwa manyan rukuni. Lokacin da ka rage girman gani (zoom out) zuwa shekara guda, ba ka ganin kowane samfurin mintuna biyar. Kana ganin ƙima ɗaya ne a kowace rukunin, wanda aikin haɗawa (consolidation function) ya zaɓa.

Wannan aikin yawanci shi ne matsakaici (average). Hakanan yana iya zama mafi girma (maximum) ko mafi ƙanƙanta (minimum). Wannan ya fi komai muhimmanci a wannan shafin.

Don buƙatar jadawali na yau da kullun, Kadupul yana haɗa umarnin RRDtool daga saitin jadawalin kuma yana gudanar da shi a kan fayilolin da ke kan diski. Nau’ukan layuka uku ne ke shiga cikin wannan umarni kuma yana da kyau a san kowannensu.

| Sashe | Abin da yake yi |
|---|---|
| Ma’ana | Yana sanya wa fayil suna, hanyar bayanai a cikinsa, da aikin haɗawa |
| Abin zane | Yana mayar da jeri ɗaya zuwa layi, yanki, ko rukuni a cikin tarawa |
| Abin bayani (legend) | Yana buga lamba ɗaya, wadda aka ƙididdige ta a kan tazarar da kake kallo |

An bayyana dukkan haɗin a cikin [Yadda ake zana jadawali](/ha/concepts/how-graphs-are-drawn/). Ba ka buƙatar sa a yau. Abin da kake buƙatar sani shi ne cewa ma’anar jadawalin da tazarar lokacin da aka buƙata su ne ke tantance hoton. Caching da hanyoyin jadawali na ainihin lokaci na iya aiki daban.

## Fara da sa’o’i huɗu da suka gabata

Fara da ɗan gajeren lokaci na kwanan nan. Rumbun da aka zaɓa ya dogara ne a kan riƙewa, mataki da ingancin jadawali; sa’o’i huɗu ba su da tabbacin samun danyen bayanai ko marasa haɗawa. Ko da mafi kyawun rumbun yana ɗauke da ƙimomin da aka daidaita da lokaci. Yi amfani da umarnin gyara kuskure na jadawali da `rrdtool info` don bincika aikin da aka buƙata da matakan rumbun da ke akwai kafin kwatanta ƙimomi.

Siffofi biyu na sabon jadawali na yau da kullun ne amma duk da haka suna damun mutane.

**Layin na iya ƙarewa kafin yanzu.** Rukunin na yanzu na iya zama bai cika ba. Lokacin karɓar bayanai, buffering da daidaitawa na iya jinkirta ƙarshen da ake gani. Bincika tambarin lokacin sabuntawa da ke ci gaba maimakon ɗaukar jinkiri a matsayin tabbacin lafiya.

**Sashen farko na iya ɓacewa.** Hanyar bayanai da aka ƙirƙira sa’a ɗaya da ta gabata tana da bayanan sa’a ɗaya da watanni goma sha ɗaya na rashin komai. Ana ware rumbun gaba ɗaya a lokacin ƙirƙira, don haka ɓangaren da babu komai ajiya ce ta gaske da ke jiran a yi amfani da ita.

## Sannan faɗaɗa shi, kuma kalli yadda mafi ƙololuwa ke canzawa

Faɗaɗa tazarar zuwa mako guda. Mafi ƙololuwa (peaks) na iya raguwa lokacin da jadawalin ya zaɓi matsakaicin da ya fi girma. Misali, idan amfani ya kai kashi 100% na tsawon mintuna biyar kuma sifili ne na sauran mintuna 55, matsakaicin sa’a yana kusan 8.3%. Ƙaruwar mintuna huɗu a cikin sa’ar da ba a yi komai ba tana da matsakaicin kusan 6.7%. Za a iya samun daidaita gajerun ƙololuwa a cikin ainihin tazarar ɗaukar samfuri.

Haɗawa yana cire dalla-dalla. Idan tarihin inganci mai kyau ya ƙare, sake zuƙowa ciki (zooming back in) ba zai iya sake gina shi daga rumbun matsakaici ba.

Wannan shi ne na farko a cikin kura-kurai guda uku, kuma wanda ya fi jawo muhawara.

**Karantar matsakaici a matsayin ƙololuwa.** Idan kana damuwa game da cikar aiki (saturation), kalli jadawalin da aka gina a kan mafi girma, ba a kan matsakaici ba. Wannan yana aiki ne kawai idan rumbun yana ɗauke da mafi girma. Idan manyan matsakaici kawai suka rage, ba za a iya sake gina ainihin ƙololuwa ba. Rumbun MAX yana adana mafi girman abubuwan da aka daidaita da lokaci na bayanansa, ba wata ƙololuwar take da ba a lura da ita ba a tsakanin bincike.

Akwai wata gazawa a nan da ya kamata a sani: idan abin jadawali ya nemi mafi girma kuma fayil ɗin ba shi da su, mataimakin zaɓi na Kadupul na iya komawa zuwa aiki na farko da ake da shi, ko AVERAGE lokacin da ba zai iya tantance ayyukan da ke akwai ba. Hoton yana da kyau, amma yana amsa wata tambaya ce daban.

**Karanta gibi a matsayin sifili.** Gibi yana wakiltar ƙimar da ba a sani ba da aka zana. Dalilai sun haɗa da ɓatattun sabuntawa, bayanan da ba a sani ba a sarari, ƙimomin da aka ƙi da maganganun jadawali. Ba ya nuna na’urar da ba a iya samunta ba kawai.

Heartbeat shi ne matsakaicin lokacin da aka yarda a tsakanin sabuntawa, ba ƙarin lokaci da aka ƙara a kan mataki ba. Misali, mataki mai daƙiƙa 300 tare da heartbeat mai daƙiƙa 600 yana ba da damar aƙalla daƙiƙa 600 tsakanin sabuntawa, ba 900 ba. Ƙa’idojin bayanan da ba a sani ba na rumbun ma suna shafar gibin da ake gani. Duba [Ma’anar hanyoyin bayanai na RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) da [Lokaci da tazara](/ha/concepts/time-and-intervals/).

Yi hankali da stacked graphs a nan. Wasu samfura suna musanya sifili a madadin ƙimomin da ba a sani ba a cikin maganganun jadawalinsu. A kan waɗancan jadawalan, matsalar aiki da lokacin rashin aiki suna kama da juna da gangan. Bincika kallon da ba a tara ba kafin yanke shawarar cewa wata sabis ta daina aiki.

**Kwatanta jadawali biyu masu ma’aunin tsaye daban-daban.** Jadawali biyu da ke gefe da gefe kowannensu zai auna daidai da bayanan kansa. Ƙaramin tudu da babban tudu na iya zama daidai da juna a gani. Bincika layin ma’auni (axis) kafin yanke kowane hukunci.

Yayin da kake kallon layin ma’auni, bincika tushen sa. Jadawali na iya sanya lakabi a cikin dubbai ko a cikin raka’o’in 1024. Lambobin da aka adana iri ɗaya ne; lakabin ne kawai ke canzawa. Bambancin ya dogara ne da prefix: 1024 idan aka kwatanta da 1000 shine kashi 2.4% don ƙarfi ɗaya kuma yana ƙaruwa a manyan prefixes. Hakanan bincika bits idan aka kwatanta da bytes, maganganun jadawali da haɗawa; bambancin kashi kaɗai ba ya gano dalilin.

## Karanta bayanin jadawali (legend)

Bayanin yana ɗauke da lambobin da suka fi siffar muhimmanci. "Current" yawanci shine raguwar LAST na jerin da aka zaɓa, wanda ba lallai ne ya zama awo da aka ɗauka a daidai lokacin da kake kallon jadawalin ba. Ana ƙididdige matsakaici da mafi girma a kan tazarar da kake kallo, ba a duk lokaci ba, don haka suna canzawa yayin da kake zuƙowa.

Shigarwar bayanin da aka bayar sune mafi ƙanƙanta, mafi girma, matsakaici, da na ƙarshe, wanda aka yi masa lakabi da current. Abubuwa biyu game da su suna ba mutane mamaki.

**Lambar bayanin raguwa ce ta abin da aka zana, ba abin da aka adana ba.** Mafi girman da aka buga a kan jerin da aka karanta tare da matsakaici shine mafi girman waɗancan matsakaicin da aka samu a ingancin da aka zaɓa. Ba shine samfurin mafi girma da aka taɓa ɗauka ba. A kan hanyar sadarwa mai yawan aiki waɗannan lambobi ne daban-daban, kuma duka biyun amsoshi ne masu inganci ga tambayoyi daban-daban.

**Bincika jerin da bayanin ke amfani da shi.** Shigarwar GPRINT na fili na iya gādin jerin abubuwan da aka zana a baya; abubuwan da aka keɓance na mafi ƙanƙanta, mafi girma, matsakaici da na ƙarshe suna da kulawa ta daban. Sake tsara abubuwa a cikin samfurin jadawali na iya canza abin da bayanin ke bayar da rahoto ba tare da wani ya gyara bayanin ba. Idan lamba ta canza bayan gyaran samfurin da ba shi da alaƙa, duba tsarin abubuwan da farko.

## Lokacin da jadawali ya yi kama da kuskure

Bincika hanyar karɓar bayanai a cikin wannan jeri; fiye da mataki ɗaya na iya samun matsala.

1. Na’urar tana amsawa a yanzu?
2. Shin poller yana aiki, kuma yana gamawa a cikin tazararsa?
3. Fayil ɗin RRD yana da sabon lokacin sabuntawa?
4. Shin jadawalin yana karanta hanyar bayanan da kake tsammani?

A bayyane:

**Mataki 1.** Gudanar da wannan `snmpget` ɗin da ka gudanar lokacin da ka ƙara na’urar, daga mai karɓar bayanan da aka ware. Idan ya gaza, magance wannan gazawar karɓar bayanan kafin yanke hukunci a kan jadawalin.

**Mataki 2.** Nemo taƙaitaccen bayanin ƙarshen aiki. Idan babu shi, duba tsarin lokaci, inda log ɗin da aka saita yake da gazawar poller na farko. Aikin da ya fi tazarar tsayi na iya jinkirta sabuntawa; kwatanta gibin sabuntawa da aka samu tare da heartbeat.

**Mataki 3.** Tambayi RRDtool kai tsaye:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` yana bayar da rahoton tambarin lokacin sabuntawa na ƙarshe, gami da sabuntawa tare da ƙimomin da ba a sani ba; rubuce-rubucen da aka tara na iya jinkirta shi. Yi amfani da `lastupdate` da `fetch` don duba ƙimomi kamar yadda aka bayyana a jagorar na’urar. `info` yana gaya maka mataki, heartbeat, nau’in hanyar bayanai, da kuma waɗanne rumbuna ne ke akwai. Idan fayil ɗin ba shi da rumbun mafi girma, wannan yana daidaita tambayar ƙololuwa a sama.

**Mataki 4.** Kunna yanayin gyara kuskuren jadawali kuma karanta umarnin da jadawalin ke samarwa. Yana sanya sunayen fayiloli, hanyoyin bayanai a cikinsu, da aikin haɗawa ga kowannensu. Jadawalin da ke nuna wata hanyar bayanai daban da wacce kake tsammani ya zama ruwan dare bayan an sake amfani da samfura ko sake fihirisa interfaces.

## Alamomi da abin da yawanci suke nufi

| Abin da kake gani | Yawanci |
|---|---|
| Madaidaicin layi a sifili | Zai iya zama sifili na gaske ko kuma wata magana da ke maye gurbin abin da ba a sani ba da sifili |
| Layi ya tsaya, sannan ya ci gaba | Ƙimar da ba a sani ba ta katse jerin da aka zana; duba karɓar bayanai da maganganun jadawali |
| Ƙananan gibi a ko’ina | Poller yana gamawa a makare, ko kuma heartbeat an saita shi kusa da matakin |
| Ƙololuwa a bayyane a cikin sa’o’i huɗu, babu shi a mako ɗaya | Bincika ingancin rumbu da haɗawa kafin ɗaukar asarar bayanai ko kuskuren karɓar bayanai |
| Mafi girman bayani ya yi ƙasa da ƙololuwar da aka zana | Bayanin yana rage wani jeri daban da wanda kake tsammani |
| Dukkan jadawalin babu komai, babu kuskure | Babu hanyar bayanai a bayansa, ko kuma ba a karɓi komai ba tukuna |
| Ƙimomi sun fita daga tsari sosai | Nau’in hanyar bayanai mara daidai, ko kuma counters masu 32-bit suna zagayawa |
| Jadawali biyu na hanyar sadarwa ɗaya sun ɗan bambanta | Tushen layin ma’auni daban, ko haɗawa daban |

[Gyara matsalar ɓacewar bayanai](/ha/guides/troubleshoot-missing-data/) yana bin wannan hanya daki-daki. [Daidaita bayyanar jadawali](/ha/guides/tune-graph-appearance/) yana magana a kan canza yadda jadawali yake da zarar ka amince da abin da yake faɗa.

Wannan shi ne darasin. Kana da shigarwa, na’urar da ke amsawa, da jadawalin da za ka iya karantawa. Daga nan, [Jagororin amfani](/ha/guides/monitor-a-switch/) suna ɗaukar takamaiman ayyuka, kuma [Ka’idoji](/ha/concepts/architecture/) suna bayanin dalilin da ya sa tsarin ke aiki ta wannan hanya.
