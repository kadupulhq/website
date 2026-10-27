---
title: Ma'ajiyar Poller
description: Me ya sa mai karɓar bayanai ke karanta jerin ayyukan da aka riga aka lissafa maimakon tsarin saitunanku, da kuma dalilin da ya sa hakan ke zama dalili na yau da kullun da canji ba ya nuna wani tasiri.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 6
---

[Tsarin Gine-gine](/ha/concepts/architecture/) yana gabatar da ma'ajiyar poller a cikin jimla ɗaya:
ana riga an lissafa jerin ayyukan, kuma mai karɓar bayanai yana karanta wancan jerin maimakon
sake duba tsarin saitunanku a kowane zagaye. Wannan shafin yana bayani ne kan ainihin
ma'anar wannan shawarar a aikace.

## Abin da mai karɓar bayanai zai yi idan ba haka ba

Gano abin da za a tattara don ƙima ɗaya yana buƙatar warware dukkan jerin abubuwan da suka
dogara da juna. Hanyar samo bayanai tana nuna na'ura da samfurin bayanai. Samfurin yana nuna
shigarwar bayanai. Shigarwar bayanai tana da filaye, wasu an sake rubuta su ga kowace na'ura
kuma wasu an gaje su daga samfurin. Idan hanyar samo bayanai ta fito ne daga tambayar bayanai,
dole ne a warware ma'aunin yanzu ta hanyar ma'ajiyar tambayoyi. Sannan dole ne a ɗauki bayanan
sirri na SNMP daga na'urar, sai dai idan wani fili ya sake rubuta su.

Wannan yana nufin yin haɗin gwiwa da yawa (joins) don ƙima ɗaya kacal. Tsari matsakaici yana da
dubunnan ƙimomi kuma yana gudanar da zagaye ɗaya kowane minti biyar. Yin wannan binciken a
lokacin karɓar bayanai zai sa rumbun adana bayanai, ba hanyar sadarwa ba, ya yanke shawarar
adadin na'urorin da za ku iya lura da su.

Don haka warwarewar tana faruwa sau ɗaya kawai idan wani abu ya canza, kuma ana rubuta
sakamakon a sarari.

## Abin da ma'ajiyar ke adanawa

Ma'ajiyar tana riga ta lissafa umarnin karɓar bayanai. Tana rage maimaita duba saituna,
amma ba ta kawar da haɗin gwiwa ko karanta ainihin yanayin na'urar kai tsaye ba.

| Abin da ke cikin layin | Dalilin da ya sa yake wurin |
|---|---|
| Wane mai karɓar bayanai ke da shi | Kowane mai karɓar bayanai yana zaɓar layukan kansa kawai |
| Aikin: SNMP, rubutun umarni, ko uwar garken rubutu | Yana yanke shawarar wace hanyar lissafi za a bi |
| Sunan mai masauki, sigar SNMP, kofa, lokacin ƙarewa, al'umma ko bayanan sirri | Filayen haɗin gwiwa da aka adana; ana kuma karanta ainihin yanayin mai masauki |
| OID, ko cikakken layin umarnin rubutu | An riga an musanya su, a shirye don gudanarwa |
| Hanyar zuwa fayil ɗin RRD | An riga an warware ta |
| Sunan filin a cikin wannan fayil ɗin da adadin filayen da cikakken karatu ke da su | Yana ba da damar daidaita sakamako da tabbatar da shi |
| Mataki (step), da ƙidayar lokaci har zuwa lokaci na gaba da wannan aikin zai cika | Duba [Lokaci da tazara](/ha/concepts/time-and-intervals/) |

`cmd.php` yana haɗa `poller_item` zuwa `host`, yana tace na'urorin da aka kashe, kuma
yana amfani da ainihin filayen na'urar don duba samuwar aiki da sake tsara fihirisa.
OIDs, umarni, da metadata na RRD da aka adana a cikin ma'ajiyar har yanzu suna buƙatar
dace da hanyar samo bayanan da aka nufa.

Bayanan sirri da aka adana hoton wani lokaci ne, amma adana bayanan sirri da aka canza
ta hanyar API ɗin na'urar galibi yana sabunta ma'ajiyar da abin ya shafa. Gyaran kai tsaye
a cikin rumbun adana bayanai yana ketare wannan hanyar kuma yana iya barin tsohon hoto.
Tabbatar da ainihin ma'ajiyar maimakon ɗauka cewa kowane canjin bayanan sirri yana buƙatar
sake gina shi da hannu.

Hanyar RRD ita ma hoton wani lokaci ce. Matsar da fayiloli, ko canza inda fayiloli suke,
yana barin kowane layi da aka adana yana nuna tsohon wurin.

## Abin da ke rubuta shi

Ana kula da ma'ajiyar a hankali ta hanyar ayyukan da suka san sun canza wani abu.

| Aiki | Layukan da aka sake rubutawa |
|---|---|
| Adana na'ura | Canje-canje ga filayen haɗin gwiwa, mai karɓar bayanai ko yanayin kashewa yana jawo aikin tura bayanai; filayen karɓar bayanai da ba a canza ba za su iya amfani da hanyar adana sauri |
| Adana hanyar samo bayanai | Layukan wannan hanyar samo bayanan |
| Ƙirƙirar jadawali da hanyoyin samo bayanai daga samfuri | Sabbin layukan da aka ƙirƙira |
| Gudanar da tambayar bayanai wanda ya matsar ko ya warware fihirisa | Hanyoyin samo bayanan da suka canza kawai |
| Sake ginawa ta hanyar CLI | Na'urori masu aiki da ma'aikata ke sarrafawa; matsalar tura `--host-id` ta yanzu tana hana dogaro da keɓancewar na'ura |

Sake rubutawa ba wai kawai shigar da abu bane a makance. Layukan hanyoyin samo bayanan da
ake sake ginawa an fara sanya musu alamar babu su, sannan a rubuta sabon saitin, sannan a
goge duk abin da har yanzu yake da alamar babu shi. Wannan shine yadda ake cire layuka don
filin da ba ya nan. Share ma'ajiyar wucin gadi yana iyakance ta hanyar ID na mai karɓar
bayanai da hanyar samo bayanai. Wannan yana kare hanyoyin da ba su da alaƙa a cikin hanyar
da aka saba nufa; ba garantin ba ne game da sake ginawa a lokaci guda ko gazawar rubutu
a rumbun adana bayanai. Tabbatar da layukan da suka fito bayan sake ginawa, gami da
na'urar da ba ta shafi kusa ba yayin binciken iyakokin aiki.

## Layukan da ba a taɓa rubuta su ba

Wasu saitunan ba sa samar da sabon layin ma'ajiya. Bincika bayanan rajista da kuma jadawalin.

Mai ginawa yana tsallake na'urorin da aka kashe, amma aikin **Kashewa** gaba ɗaya yana adana
layukan ma'ajiya da ke akwai kuma aikin karɓar bayanai yana tace na'urar ya cire ta.
Sake ginawa yayin da aka kashe na'urar na iya cire layuka. Aikin **Kunna** gaba ɗaya yana
sake amfani da cikakkiyar ma'ajiya ko kuma yana fara ta lokacin da take fanko; ba a saba
buƙatar ƙarin adana na'ura ba. Wata ma'ajiya da ba ta cika ba ko tsohuwa da ke akwai har
yanzu tana buƙatar bincike.

Wani abu na SNMP wanda na'urarsa ba ta da saitin SNMP mai amfani ba ya samar da komai.
Babu siga, siga da ta wuce iyaka, ko al'umma fanko a kan siga ta 1 ko 2 kuma ana tsallake
layin maimakon a rubuta shi a matsayin layin da zai gaza a kowane zagaye.

Lokacin da aka saita jerin abubuwan da aka yarda da su, fayil ɗin da ya ɓace ko shigarwar
da aka ƙi tana hana sabbin layuka don wannan shigarwar. Sake ginawa da aka tabbatar har
yanzu yana share tsofaffin layukansa. Ba tare da tsarin `input_whitelist` ba, wannan
binciken yana ba da damar shigar da bayanai; ba kariya ba ce da ke aiki a kowane lokaci.
Bincika umarnin da aka ƙi da kuma tsarin da aka saita kafin canza jerin izini.

Fuskar allon na iya nuna hanyar samo bayanai wacce ma'ajiyarta take fanko. Jadawalinsa na
iya riƙe tsohon tarihi ko nuna gibi; madaidaicin layin sifili ba ingantaccen manuniya ba ne.
Bayanan sirri da suka ɓace da shigarwar da aka ƙi yanayin saiti ne da ya kamata a warware.

## Dalilin da ya sa canji zai iya zama kamar bai yi komai ba

Hanyoyi guda uku daban-daban suna haifar da alama iri ɗaya.

**Ba a sake gina layin ba.** Kun canza wani abu da fuskar allon ba ta ɗauka a matsayin mai
tasiri ga karɓar bayanai ba, ko kuma kun canza shi a wajen fuskar allon. Ma'ajiyar har yanzu
tana ɗauke da tsohuwar amsar. Sake ginawa na iya sabunta filayen da aka adana bayan an
tabbatar da tsarin da aka nufa.

**Ba a taɓa gina layin ba.** An bayyana a sama. Sake ginawa yana warware wannan kuma,
amma sai bayan an gyara ainihin matsalar; sau da yawa binciken yana bayyana a cikin
rajistar bayanai maimakon a kan jadawalin.

**Ana tattara ƙima sannan a jefar da ita.** Ana tsara sakamako mai ƙimomi masu yawa ta
hanyar ma'anar filayen samfuri, kuma ana iya tsallake filayen da ba a ambata ba yayin
bincike. Bincika sunayen filayen da ake tsammani, taswirori da alaƙar jadawali; wannan
ƙa'idar ba ta jefar da duk samfuran lambobi ba tare da nassoshin jadawali ba kawai.
Sake gina ma'ajiya ba zai iya gyara kuskuren tsarin fitar da sakamako ba.

## Makamashi maras kaifi

Don na'ura guda ɗaya, yi amfani da **Sake Cika Ma'ajiyar Poller** a kan tsohon shafin
na'urar. Wannan aikin yana kiran hanyar `push_out_host()` da ta shafi na'urar. Bincika
layukan da suka fito da bincike bayan haka.

Babban rubutun na yanzu `rebuild_poller_cache.php` yana karɓar `--host-id`, amma ba ya
tura wannan matatar zuwa ga umarnin ma'aikacinsa. Don haka zancen sake ginawar CLI na
na'ura ɗaya zai iya sake gina wasu na'urori masu aiki. Kada ku dogara da wannan zaɓin
don keɓancewa har sai an gyara wannan matsalar ta manhaja.

Akwai babban sake ginawa ta hanyar CLI daga tushen manhajar, wanda ake gudanarwa a matsayin
mai amfani da poller:

```bash
php cli/rebuild_poller_cache.php
```

Yana sarrafa na'urori masu aiki; ba gyara ba ne ga kowane tushen da ba shi da mai masauki
ko aka kashe. Wannan yana rubutawa a cikin teburin tattara bayanai kuma yana iya ɗaukar
lokaci. Guji sake ginawa da ke cin karo da juna kuma kada ku dakatar da aikin. Zaɓin
`--force` na CLI yana watsi da kariya ta rajistar tsari, don haka ba zaɓin gyara na yau da kullun ba ne.

Sake ginawa yana sabunta yanayin da aka samo; ba ya gyara damar isa ga na'ura, ba ya
matsar da fayilolin RRD, ba ya gyara umarnin shigarwa da aka ƙi, ko dawo da tarihin da ya
ɓace. Bincika ma'ajiyar da ta fito, rajistar bayanai da tattara bayanai na gaba kafin ɗaukar
aikin gyara a matsayin wanda ya kammala.

Kadupul yana rikodin lokacin da ma'ajiyar ta canza a ƙarshe, wanda ke barin sauran ɓangarorin
tsarin su san cewa suna buƙatar sake karanta ta.

## Masu karɓar bayanai masu yawa

Idan akwai mai karɓar bayanai fiye da ɗaya, kowane layi na ɗayansu ne kawai, kuma ana tura
layukan zuwa rumbun adana bayanan kansa na wancan mai karɓar da kuma na tsakiya.

Idan ba za a iya samun mai karɓar bayanai na nesa ba lokacin da kuka adana canji, canjin
yana sauka a tsakiya ba a nesa ba, kuma Kadupul yana faɗin haka: yana neman cikakken
aiki tare da zarar mai karɓar ya dawo. Har sai an yi wannan aikin tare, mai karɓar na
nesa yana gudanar da tsohon jerin ayyuka fiye da wanda fuskar allon ke nuna muku.
Bambancin da ya shafi mai karɓar bayanai na musamman dalili ne na bincika yanayin kwafi,
haɗin gwiwa da ma'ajiyar gida ta kowane mai karɓa.

Tsarin aiki a cikin cikakken zagaye, gami da inda ake karanta ma'ajiyar da lokacin da aka
sarrafa umarnin sake tsara fihirisa, yana cikin [Zagayen Rayuwar Poller](/ha/reference/poller-lifecycle/).
Don haɓaka masu karɓar bayanai, duba [Haɓaka poller](/ha/guides/scale-the-poller/).
