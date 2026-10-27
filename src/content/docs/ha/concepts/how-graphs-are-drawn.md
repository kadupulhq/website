---
title: Yadda ake zana zane-zane
description: Hanyar daga fayil ɗin round-robin zuwa hoton da aka bayar, da kuma dalilin da ya sa lambobi ɗaya da aka adana za su iya samar da hotuna daban-daban.
sidebar:
  order: 4
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
---

Buƙatar hoto ta yau da kullun na iya haɗa umarnin RRDtool daga saitin zane da karanta fayilolin RRD da aka ambata. Ingantaccen hoton da aka adana a kache yana iya cika buƙatar kuma, kuma aikin Boost na buƙata na iya sabunta fayilolin kafin fitar da hoton. Don iyakokin sabon bayanai, duba [rubuce-rubuce masu yawa](/ha/concepts/high-volume-writes/).

## Tsarin ayyuka

Ga buƙatun da ke ci gaba zuwa ƙirƙirar umarni:

1. Warware tazarar lokacin da aka buƙata da saitin zane.
2. Ƙididdige ƙuduri daga furofayil ɗin rumbun adana bayanai kuma zaɓi aikin haɗawa.
3. Fitar da nassoshin `DEF` marasa maimaitawa don filaye da ayyukan da ake buƙata.
4. Fitar da maganganun `CDEF` da `VDEF` da aka ambata.
5. Fitar da abubuwan zane da bugawa a cikin tsarin da aka saita tare da zaɓuɓɓuka masu amfani da gyare-gyaren ƙarin manhaja.
6. Bada damar RRDtool ya karanta ainihin fayilolin kuma ya fitar da sakamakon.

## Zaɓar taska

Kadupul yana tuntuɓar layukan furofayil ɗin rumbun adana bayanai lokacin lissafin faɗin taska da zaɓuɓɓukan zane. Ƙididdigarsa ta atomatik tana la'akari da lokacin mataki wanda aka ninka da adadin matakai wanda aka ninka da adadin layuka, ɗaukar hoto da aka buƙata da adadin matakan taska; bayyanannen zaɓin taska yana bin wata hanya daban. Waɗannan lissafin furofayil ba sa bincika kowace ainihin taska a cikin kowane fayil kuma suna iya rashin jituwa da fayilolin da ke akwai bayan canjin furofayil.

`DEF` ɗin da aka samar yana bayyana fayil ɗin, sunan hanyar samo bayanai da aikin haɗawa. RRDtool yana zaɓar taskar da ke akwai a madaidaicin ƙuduri kuma yana iya haɗa bayanai gaba don faɗin zane da tazarar lokaci. Ƙididdigar manhaja ba ta ba da tabbacin karanta kowace takamaiman taska ta zahiri ba. Duba takardun asali na [bayanin ma'anar bayanai na RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Faɗaɗa taga ko canza faɗin hoto na iya canza ƙudurin da aka nuna. Jerin matsakaici na iya ɓoye ɗan ƙaramin hauhawa kodayake yana nan a cikin taska mafi kyau. Kwatanta ainihin tsarin fayil da umarnin, ba furofayil kaɗai ba. Duba [hanyoyin samo bayanai da taskokin zagayawa (RRAs)](/ha/concepts/data-sources-and-rras/).

Lokacin da mai kira bai ba da lokacin ƙarewa ba, mai bayarwa na yau da kullun yana amfani da matsawar aikin ƙarshe na babban mai zaɓe dangane da lokacin yanzu, yana komawa ga tazarar zaɓe idan babu wannan ƙimar ko kuma tana nan gaba. Lambar gaba kuma tana da zaɓi na haɗin tazara, amma ba shine asali na duniya ba. Bayyanannen lokacin ƙarewa yana soke wannan farkon na al'ada; zanen da ya ƙare kafin lokacin yanzu ba ya bayyana taskar da aka zaɓa kaɗai ko tabbatar da cewa an rubuta sabbin samfurori.

## Abubuwan zane

Zane jerin abubuwa ne da aka tsara. Ƙirƙirar umarni na iya barin abubuwa, sake amfani da ma'anoni ko faɗaɗa abu ɗaya zuwa umarni da yawa. Tsarin zane ya fi mahimmanci fiye da tsarin gani kawai.

| Abu | Abin da yake zanawa | Bayani |
|---|---|---|
| `AREA` | Wurin da aka cika daga ma'auni zuwa ƙima | Wurare na gaba ana zana su a kan wuraren da suka gabata |
| `STACK` | Wurin da aka cika wanda ya fara daga saman abin da ya gabata | Ana fitar da shi azaman yanki mai tutar tarawa |
| `LINE1`, `LINE2`, `LINE3` | Layin da ke da faɗin pixel ɗaya, biyu ko uku | Zai iya kasancewa da ɗigo-ɗigo |
| `LINE:STACK` | Layin da aka zana a saman jimillar tarin aiki | |
| `TICK` | Alamar zaɓi tare da gefe ɗaya na makircin | Yana da amfani don matsayi, ba don adadi ba |
| `GPRINT` | Ba komai. Yana buga lamba a cikin bayani | |
| `COMMENT` | Ba komai. Yana buga rubutun bayani na zahiri | Ana naɗe dogon sharhi |
| `HRULE` | Layin kwance a wata takamaiman ƙima | |
| `VRULE` | Layin tsaye a wani takamaiman lokaci | |
| `TEXTALIGN` | Ba komai. Yana saita daidaitawa don rubutun bayani na gaba | |

Cikakken jerin, gami da ginshiƙan sanyi waɗanda suka shafi kowane nau'i, yana cikin [abubuwan zane](/ha/reference/graph-items/).

`AREA` da `STACK` wata haɗin gwiwa ce da mutane ke yawan rashin fahimta. Wuri yana farawa daga sifili, don haka wurare biyu suna rufe juna kuma mai tsayi yana ɓoye gajere. Tarawa yana farawa ne daga inda abin da ya gabata ya ƙare, don haka tsayin da ake gani na yanki na biyu shine ƙimarsa amma gefensa na sama yana wakiltar jimilla. Karanta zanen da aka tara azaman tsayin yanki, ba azaman matsayi a kan ma'aunin Y ba, in ba haka ba za ka karanta kowane jeri ba daidai ba ban da na ƙasa.

`HRULE` yana karɓar ƙimar da zata iya ƙunsar maye gurbin samfuri. Ana cire haruffan da ba na lamba ba daga sakamakon, kuma idan babu wani abu na lamba da ya rage, ana zana ƙa'idar a sifili maimakon gazawar nuni. Ƙa'idar da ke kan sifili na iya zama da gangan ko kuma ta samo asali ne daga maye gurbin da ya gaza. Bincika umarnin da aka warware kafin yanke shawara. Matatar lamba na iya canza igiyar da ke ɗauke da raka'a ko alamun lambobi marasa tallafi.

`VRULE` yana karɓar ko dai tambarin lokacin Unix ko ma'auratan `hours:minutes`. Ana karanta ɓangaren sa'o'i mara kyau azaman matsawa na baya daga lokacin yanzu maimakon lokaci a kan agogo.

## Ayyuka biyu, kalma ɗaya

Ana amfani da ayyukan haɗawa don dalilai daban-daban guda biyu, kuma sunaye huɗu iri ɗaya, `AVERAGE`, `MIN`, `MAX` da `LAST`, suna bayyana a wurare biyu.

Aiki na farko shine zaɓin taska. `DEF` yana bayyana fayil, hanyar samo bayanai a cikinsa, da aikin haɗawa. Wannan aikin yana iyakance dangin taskar da aka buƙata. Nemi `MAX` kuma RRDtool yana buƙatar daidaitattun bayanan haɗawa da aka adana dangane da koma-bayan manhaja da zaɓin ƙuduri da aka bayyana a ƙasa.

Aiki na biyu shine lissafin bayani. `GPRINT` yana rage dukkan tagar da aka zana zuwa lambar da aka buga, kuma aikinsa yana yanke shawarar yadda ake yin hakan. Wannan raguwa yana faruwa ne akan jerin da aka riga aka karanta; haɗin gwiwa ne na gabatarwa, ba ajiya ta zahiri ba.

Don haka `GPRINT` da ke nuna `MAX` akan `DEF` da aka karanta da `AVERAGE` yana buga mafi girman ƙimar wannan matsakaicin jerin a kan tagar da aka nuna, ba lallai bane mafi girman samfurin farko ba. Minti biyar misali ne kawai; ainihin ƙuduri yana canzawa. Lambobi ne daban-daban, kuma a kan hanyar haɗi mai aiki sosai lambobi ne daban-daban. Duka karatun biyu ingantattu ne. Wataƙila ɗaya kawai kake nufi.

## Hanyar komawa ta shiru

Ga nau'ikan abubuwan da ke amfani da mataimakin aiki mafi kyau, Kadupul yana karanta ayyukan haɗa fayil kuma yana amfani da wanda aka buƙata idan yana nan, in ba haka ba yana amfani da wanda aka fara ba da rahoto. Idan ba a sami komai ba don ingantacciyar hanyar samo bayanai ta gida, mataimakin yana komawa ga AVERAGE. Bambance-bambancen GPRINT masu tsayayye suna ɗaukar hanya daban kuma ba sa amfani da wannan mataimakin, don haka ba alkawari bane na duniya don gyara kowane aikin da ya ɓace.

Don haka abin zane da ke buƙatar `MAX` na iya ƙarewa da karanta matsakaici lokacin da fayil ɗinsa ke da taskokin AVERAGE kawai. Bincika `DEF` ɗin da aka samar da sakamakon `rrdtool info`. Kulawar taska na iya canza tsarin da ke akwai, amma ƙara taska ba zai iya sake gina manyan kololuwar tarihi da matsakaicin da ya gabata ya watsar ba. Duba [sarrafa riƙon bayanai](/ha/guides/manage-data-retention/).

## GPRINT yana aron taskar maƙwabcinsa

GPRINT na yau da kullun ba shi da taska tasa. Yana sake amfani da aikin haɗawa na abin da ya fi kwanan nan na `AREA`, `STACK`, layi ko `TICK` da aka gano ta sunan hanyar samo bayanai da asalin filin samfurin gida. Idan babu daidaituwa da ta gabata, yana amfani da mataimakin aiki mafi kyau tare da aikin da aka saita masa. Bambance-bambancen da suka tsaya suna amfani da aikin da aka saita musu kai tsaye.

Wannan yana nufin cewa sake tsara abubuwa a cikin samfurin zane na iya canza abin da bayanin ke bayarwa ba tare da wani ya taɓa bayanin kansa ba. Sanya `LINE` da ke karanta `MAX` a saman toshewar `GPRINT`, kuma bayanan da suka dace na iya taƙaita manyan ƙimomi. Matsar da shi ƙasa kuma abin da ya gabata mai dacewa, ko komawa ga rashin daidaituwa, yana ƙayyade jerin shigarwa maimakon haka. Idan lamba a cikin bayani ta canza bayan gyaran samfurin da ba shi da alaƙa, bincika tsarin abubuwan da farko.

## CDEF da VDEF

Dukansu suna canza bayanai kafin zane. Ba za a iya musanya su da juna ba.

| | CDEF | VDEF |
|---|---|---|
| Abin da yake ƙirƙira | Jeri, ƙima ɗaya ga kowane ramin lokaci | Ƙimar lamba, da lokaci mai alaƙa ga wasu ayyuka |
| Za a iya zana shi azaman layi ko yanki | E | Ƙimar lamba na iya samar da matakin da ba ya canzawa |
| Abin da aka gina shi da shi | Ayyuka, ma'aikatan lissafi, sauran CDEFs, hanyoyin samo bayanai na musamman, ƙimomi na asali | Aikin da aka yi amfani da shi ga nassi |
| Haɗawa (Nesting) | CDEF ɗaya na iya nuni zuwa wani CDEF | VDEF ba zai iya ƙunsar lissafi ba |

CDEF magana ce ta tarawa da ake kimantawa a cikin tsarin Yaren mutanen Poland na baya. Kalmominsa suna da faɗi kuma an lissafa su cikakke a cikin [abubuwan zane](/ha/reference/graph-items/): lissafi, kwatantawa da ma'aikatan sharaɗi, trigonometri, tara bayanai a cikin hanyoyin samo bayanai, sarrafa tarawa da ayyukan lokaci waɗanda ke ba da damar ma'ana ta san inda take a kan ma'aunin X. `UN` da `UNKN` abubuwa ne guda biyu da suka dace a koya da wuri. Maye gurbin ƙimomin da ba a sani ba da sifili yana kauce wa gibi na gani amma kuma yana ɓoye ma'aunin da suka ɓace; yi wannan zaɓin gabatarwa a bayyane.

CDEF kuma yana karanta nassoshi na musamman maimakon takamaiman sunan hanyar samo bayanai. Ɗaya yana warwarewa zuwa hanyar samo bayanai na abin yanzu, yana sa CDEF guda ɗaya zama mai amfani a kowane abu a cikin samfuri. Sauran nassoshi suna warwarewa zuwa duk hanyoyin samo bayanai a cikin zanen ko duk hanyoyin da suka dace, yana sa ya yiwu a ƙirƙiri layin jimilla ba tare da sanya sunan shigarwar ba.

VDEF yana rage jeri zuwa lamba ɗaya: matsakaicin, mafi ƙanƙanta, matsakaici, daidaitaccen karkata, na farko, na ƙarshe, jimilla, kashi ko gangara, tsangwama da daidaituwa. RRDtool ba ya tallafawa lissafi a cikin VDEF, don haka lokacin da VDEF ke buƙatar shigarwar da aka lissafa, Kadupul yana gina ta a kan CDEF na abin maimakon ɗanyen hanyar samo bayanai. Wannan ita ce hanyar da aka tsara don lissafi: yi lissafi a kan CDEF, sannan ka rage shi a cikin VDEF.

`GPRINT` wanda ke samun goyon bayan VDEF ba ya karɓar hujjar aikin haɗawa: VDEF ta riga ta ba da raguwa. VDEFs na iya ba da ƙimar lamba don zane; RRDtool yana tallafawa layin da VDEF ke goyan baya. Duba takardun asali na [abubuwan zane na RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

Fitar da CSV yana zaɓar nau'ikan zane masu tallafi azaman ginshiƙan jeri; ba a fitar da abubuwan bayani azaman ginshiƙai daidai ba. Ba kamar kwatancen da suka gabata ba, lambar yanzu gabaɗaya ba ta tsallake abubuwan zane masu goyan bayan VDEF ba. Yana iya fitar da `XPORT` mara aiki na lambar VDEF: keɓaɓɓen gwajin RRDtool yana ba da layin VDEF cikin nasara amma yana ƙin wannan fitarwa. Duba [kuskuren manhaja #273](https://github.com/kadupulhq/kadupul/issues/273). Yi amfani da abubuwan zane masu goyan bayan jeri don fitarwa kuma tabbatar da ginshiƙan da aka samu.

## Dalilin da ya sa bayanai ɗaya ke kama da daban

Kowane zaɓi a ƙasa yana canza hoton ba tare da canza samfuri ɗaya da aka adana ba.

| Zaɓi | Tasiri |
|---|---|
| Tsawon taga da faɗin hoto | Zai iya canza zaɓin taska da ƙarin haɗin gwiwa |
| Aikin haɗawa a cikin `DEF` | Yana karanta kololuwa, kwari, matsakaici ko ƙimar ƙarshe |
| Aikin haɗawa da ya ɓace | Wasu hanyoyin abubuwa suna maye gurbin wani aikin; wasu na iya kasawa |
| `AREA` sabanin `STACK` | Cikakken tsayi sabanin tsayin tarawa |
| Tsarin abubuwa | Zana a kan wani, tsarin tarawa da kuma wace taska `GPRINT` ke aro |
| Tushen 1000 ko 1024 | Yana sake yiwa ma'auni lakabi. Ƙimomin iri ɗaya ne |
| Yanayin sikelin atomatik, tsauraran iyakoki, sikelin logarithmic | Yana canza ma'aunin Y, wanda ke canza girman canji a gani |

Idan zane-zane ba su dace ba, kwatanta umarnin da aka bayar, ainihin asalin fayil da tsari, yanayin kache da sabon samfurin. Waɗannan zaɓuɓɓukan gabatarwa bincike ne masu amfani, amma ba sa ware kurakuran tarawa, ajiya ko taswira. Don jagora kan yadda ake yin wannan, duba [warware matsalar bayanan da suka ɓace](/ha/guides/troubleshoot-missing-data/).
