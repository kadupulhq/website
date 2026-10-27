---
title: "Mene ne Kadupul"
description: "Tattara bayanai, ajiya, tsarin gini da iyakokin aikin don shirin 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul yana matakin kafin alfa. Tabbatar da hanyoyin nan a keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen."
---

Kadupul manhaja ce ta sa ido kan hanyar sadarwa da zana graf. Tana tattara ma’aunai ta SNMP da rubutattun shirye-shirye, tana adana jerin lokaci a fayilolin RRD kuma tana zana graf da RRDtool. An duba wannan bayani a ranar 26 Oktoba 2026 bisa sigar lambar manhajar da aka haɗa a ƙasa.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Matsayin aikin don 2026–2027

Kadupul yana matakin kafin alfa, ba shi da sigar aiki na gaske mai tallafi ko hanyar ƙaura zuwa aiki na gaske da aka tabbatar. Yi amfani da keɓaɓɓen tsarin gwaji. Ranakun cikin takardun nan mahallin shiryawa ne, ba alkawuran lokacin isarwa ba. Duba matsayin aikin kafin zaɓar sigar lambar da za a tantance.

[Matsayin aikin](/ha/project/status/)

## Tattara bayanai da jadawali

Mai tsara lokaci na waje yana fara poller. Poller yana karanta jerin tattarawa da aka shirya, yana kiran mai tattara bayanai na PHP ko ginin Spine mai dacewa, sannan yana sarrafa sakamakon. Ana iya saita tazarar tattarawa; minti biyar misali ne, ba ƙa’ida ga kowa ba. Mai farawa zai iya gudanar da zagayoyi gajeru da yawa a cikin tazararsa. Iyakokin jira, sake gwadawa da jinkirin na’urori duk suna cin wannan kasafin lokaci.

[Zagayen poller](/ha/reference/poller-lifecycle/)

## Tsawon riƙewa da ajiya

Ana zaɓar tsarin ajiyar fayil ɗin RRD lokacin ƙirƙirarsa. Sababbin ma’aunai za su iya riƙe bayanai fiye da tsofaffin ƙimomin da aka haɗa; tsawon riƙewa yana da iyaka bisa kundin da aka saita. Ba ya riƙe kowace samfurin ma’auni har abada. Ƙimomin da ba a sani ba suna nufin bayanan lura da suka ɓace ko ba su da amfani, ba sifili ba. Layukan jiran ma’ajiyar bayanai, rajistan aiki da ƙididdiga za su iya ƙaruwa ko da girman fayilolin RRD da suke nan bai canza ba.

[Tushen bayanai da kundin ajiya](/ha/concepts/data-sources-and-rras/)

## Graf da kalmomin da ake amfani da su

Na’ura ita ce ƙarshen hanyar sadarwa da ake sa ido a kai. Tambayar bayanai tana gano abubuwa kamar mu’amalar hanyar sadarwa. Tushen bayanai yana bayyana ma’auni da ajiyarsa; graf yana bayyana yadda za a nuna bayanai. Samfura suna sake amfani da ma’anoni, bishiyoyi kuma suna tsara kewaya shafuka. Waɗannan rikodi daban ne: duba zaɓuɓɓukan gogewa da abubuwan dogaro kafin cire su. Ana ƙirƙirar graf daga bayanan da aka riƙe lokacin buƙata; cache na hoto zai iya sake amfani da hoton da aka riga aka zana.

[Kamus](/ha/reference/glossary/)

## Sassan shigarwa

Tsarin da yake aiki yana haɗa manhajar yanar gizo ta PHP, MySQL ko MariaDB, ajiyar RRD, RRDtool da mai fara tattarawa. Bayanan shiga na na’urori da saituna suna cikin ma’ajiyar bayanai ko fayilolin saituna masu kariya. Yi kwafin lambar manhaja, saituna, layukan jiran ma’ajiyar bayanai da tarihin RRD a matsayin saiti mai jituwa, sannan a gwada maidowa. Kwafin ma’ajiyar bayanai shi kaɗai ba ya dawo da graf na tarihi.

[Kwafin ajiya da maidowa](/ha/guides/back-up-and-restore/)

## Main da ƙaura zuwa Symfony

Reshen manhaja `main` yana buƙatar PHP 8.4 ko sabuwa kuma yana haɗa sabis na Symfony 7.4 da tsofaffin wuraren shigar yanar gizo, poller da CLI. Layin kulawa `lts/1.2` yana da bukatu daban. Hanyoyin da aka ƙaura suna tare da tsofaffi; kasancewar sabis na Symfony ba ya tabbatar da cire tsohon tsarin aiki. Kwafin lambar tushe yana buƙatar abubuwan dogaro na PHP da aka kulle da albarkatun burauza da aka samar. Yi amfani da yanayin aiki na `mise.toml` na manhajar.

[Jagorar ƙaura](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Asusu, ƙarin shirye-shirye da damar ajiya

Ganin na’urori da graf ya danganta da izinin masu amfani da ƙungiyoyi. Ƙarin shirye-shirye suna gudana a matsayin amintacciyar lambar manhaja da damar asusun aikin; ba a killace su cikin sandbox ba. Duba asalinsu, hooks da halin shigarwa da cirewa kafin kunna su. Masu rubuta RRD na cikin Unix suna buƙatar binciken shaida na POSIX da bayyanannun saitunan amincewa idan asusun yanar gizo da poller sun bambanta. Windows ba ya goyon bayan gyaran RRD na gida mai iya lalata bayanai.

[Tantance ƙarin shirye-shirye](/ha/guides/install-and-vet-plugins/)

## Amfanin da ya dace da iyakoki

Tantance Kadupul don mu’amalar hanyar sadarwa, ƙididdigar na’urori, na’urorin auna muhalli da sauran ma’aunai da ake samu ta hanyoyin tattarawa da za ka iya tabbatarwa. Manhaja ce da kai ke masauƙantawa, tana buƙatar kula da ma’ajiyar bayanai, yanar gizo da jadawali. Tattara lambobi na ainihin tsarin ba ma’ajiyar rajista ba ne, ba tsarin bin diddigi rarrabaffe ba, kuma ba injin tambayar alamomi masu yawan ƙimomi daban ba ne. Faɗakarwar iyaka tana dogara da ƙarin shirye-shirye masu dacewa; tabbatar da jituwarsu maimakon ɗauka cewa faɗakarwa tana aiki nan da nan bayan shigarwa.

## Asali, suna da jituwa

Kadupul reshe ne mai zaman kansa na Cacti, mai lasisin GPL-3.0-or-later, ba tare da alaƙa ko amincewar The Cacti Group ba. Sunansa na Sinhala, කඩුපුල්, yana nufin *Epiphyllum oxypetalum*, tsiron cactus da yake fure da dare. Riƙe mu’amalar ƙarin shirye-shirye, samfura, tsarin ma’ajiyar bayanai da tarihin RRD da yake nan buri ne na sakin siga da yake buƙatar shaida ga kowace sigar lambar tushe da haɗin ƙarin shirye-shirye.

[Jituwa](/ha/project/compatibility-with-cacti/)

## Fara da na’ura ɗaya da aka tabbatar

Bi shigarwa, na’ura ta farko da graf na farko bisa wannan tsari. Duba rajista, lokutan tattarawa da ƙimomi masu amfani kafin amincewa da hoton. Auna tsawon zagaye da aikin da yake jira da na’urorinka kafin faɗaɗawa. Yi amfani da bayanan fahimta don sanin tsarin gini, da bukatu don sanin sharuddan farawa.

[Shigarwa](/ha/start/install/) · [Na’ura ta farko](/ha/start/first-device/) · [Graf na farko](/ha/start/first-graph/) · [Bayanan fahimta](/ha/concepts/architecture/) · [Bukatu](/ha/reference/requirements/)
