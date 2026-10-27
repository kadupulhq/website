---
title: Hanyoyin samo bayanai da taskokin zagayawa (RRAs)
description: Abin da ake adanawa, yadda riƙon bayanai ke aiki, da kuma dalilin da ya sa gyare-gyaren furofayil ba sa ƙaura da fayilolin RRD da ke akwai.
sidebar:
  order: 2
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
---

Hanyar samo bayanai ta Kadupul tana haɗa ma'auni a kan lokaci kuma galibi tana daidaita zuwa fayil ɗin RRD guda ɗaya. Kowane fili mai suna a cikin wannan fayil ɗin kuma RRDtool yana kiransa da tushen bayanai (DS). Bambanta abin da manhaja ke amfani da shi daga filayensa yayin kwatanta ƙididdiga ko saituna.

Fayil guda ba koyaushe yana nufin lamba ɗaya ba. Hanyar samo bayanai na iya ɗaukar filaye da yawa, kuma tsarin haɗin yanar gizo shine misali na yau da kullun: bytes masu shigowa da bytes masu fita suna raba fayil ɗaya, ana tattara su azaman abubuwan aiki daban-daban, kuma ana rubuta su tare azaman sabuntawa guda ɗaya. Abin da suke rabawa shine mataki (step), rukunin taskoki, da lokacin riƙon bayanai. Ba za ka iya ajiye ɗayansu ya fi ɗayan tsawo ba, saboda riƙon bayanai abu ne na fayil ba na fili ba.

## Abin da ke cikin fayil ɗin

Fayil ɗin RRD ya ƙunshi babban kai (header) da jerin abubuwa guda biyu.

Jerin farko shine filaye: suna, nau'i, bugun zuciya (heartbeat), da mafi ƙanƙanta da mafi girma ga kowannensu. Na biyu kuma shine taskoki: aikin haɗawa (consolidation function), matakan ɗanyen bayanai nawa ne ke shiga cikin gurbi ɗaya, gurbi nawa ne ke akwai, da kuma yawan abin da zai iya zama unknown kafin gurbin kansa ya zama unknown.

Ƙirƙira tana rikodin waɗannan ma'anoni a cikin fayil ɗin. Metadata na rumbun adana bayanai da ainihin ma'anar fayil na iya bambanta daga baya; duba fayil ɗin tare da `rrdtool info` maimakon ɗauka cewa samfurin yanzu yana siffanta shi daidai.

<span id="the-decisions-that-are-permanent"></span>

## Hukunce-hukuncen ƙirƙira da kulawa ta gaba

Ana keɓance fayil ɗin RRD a lokacin ƙirƙira. Gyaran furofayil ba ya ƙaura da fayilolin da ke akwai. RRDtool yana ba da ayyukan daidaitawa da canza girma waɗanda za su iya adana bayanan da aka ajiye, amma suna buƙatar ingantaccen bincike da ajiyar waje daban. Hanyar ƙirƙira ta al'ada tana bincika fayil ɗin da ke akwai kuma tana dawowa ba tare da maye gurbinsa ba. Wannan kariya ba ta hana yin daidaitawa ko ƙaura a bayyane ba. Adana samfuri kaɗai ba ya sabunta fasalin fayilolin da ke akwai.

Ana rubuta zaɓuɓɓuka huɗu a wannan lokacin.

**Mataki (The step).** Sau nawa ake tsammanin ƙima, yawanci daƙiƙa 300. RRDtool yana daidaita sabuntawa zuwa iyakokin mataki; ba a watsar da karatun da ya fi yawa ba kawai. Ko sabuntawa mai jinkiri yana haifar da bayanan unknown ya dogara ne akan bugun zuciya da ka'idojin haɗawa. Matakin yawanci yana fitowa ne daga furofayil ɗin hanyar samo bayanai. Ƙirƙirar fayil tana karanta matakin da aka ajiye na hanyar samo bayanai da taskokin furofayil ɗin da aka ambata, don haka tabbatar da duka biyun lokacin canza metadata ko shirin yin ƙaura.

**Nau'in hanyar samo bayanai.** Duba ƙasa. Wannan shine wanda ke kasawa a hankali ba tare da sanarwa ba.

**Iyakoki.** Mafi ƙanƙanta da mafi girma suna iyakance ƙimomin da za a iya karɓa; ga nau'ikan DS masu samar da ƙimar canji, waɗancan iyakokin suna aiki ne ga ƙimar da aka lissafa, ba ga jimillar adadin ma'aunin farko ba. Bayanan da suka fita waje suna zama unknown maimakon a matse su. Mafi girman da ya dogara da tambaya zai iya warware madaidaicin saurin haɗin yanar gizo; ba kowace hanyar haɗin gwiwa ke samun madaidaicin saurin haɗi ta atomatik ba. Bincika raka'o'in samfuri da ainihin ma'anar fayil ɗin.

Ƙirƙira tana da takamaiman rassan daidaitawa. Don ainihin mafi girma a ko ƙasa da mafi ƙanƙanta, GAUGE da ABSOLUTE suna amfani da matsakaicin da ba a bayyana ba; sauran nau'ikan suna amfani da mafi ƙanƙanta haɗe da ɗaya. Sauye-sauyen tambaya suna ɗaukar reshe daban. Binciken sifili/sifili na gaba yana canza matsakaicin kaɗai, kuma daidaitawar da ta gabata na iya riga ta canza shi. Kada ka ɗauki wannan a matsayin mai inganta gaba ɗaya ko ɗauka cewa dukkan iyakokin biyu sun zama ba a bayyana su ba.

**Taskoki.** Samfura nawa ne za a ajiye a waɗanne matakai, da kuma wane aikin haɗawa za a yi amfani da shi ga kowannensu. Wannan shine abin da ke yanke shawarar ko za ka iya amsa tambaya cikin shekaru biyu.

## Nau'ikan hanyoyin samo bayanai

| Nau'i | Abin da yake adanawa | Wanda ya dace da shi |
|---|---|---|
| `GAUGE` | Mataki, wanda aka daidaita da matakin fayil | Yanayin zafi, matsakaicin lodi, ƙwaƙwalwar ajiya da ake amfani da ita, zurfin layi |
| `COUNTER` | Ƙimar canji a kowace daƙiƙa, yana gyara zagayowar lissafi a 32 ko 64 bits | Octets na haɗin yanar gizo, fakiti da ƙididdigar kurakurai |
| `DERIVE` | Ƙimar canji a kowace daƙiƙa, an yarda ya zama korau | Ma'aunin da zai iya sauka bisa doka ko a sake saita shi |
| `ABSOLUTE` | Ƙimar kamar yadda aka bayar, an raba ta da lokacin tun daga karatu na ƙarshe | Ƙididdigar da na'urar ke sake saitawa duk lokacin da ka karanta ta |
| `COMPUTE` | Ƙimar da aka lissafa daga sauran filaye a cikin fayil ɗin maimakon tattarawa | Filin da aka samo, kamar jimilla ko rabo |

Kadupul yana nuna `DCOUNTER` da `DDERIVE` lokacin da sigar RRDtool da aka saita ta kasance 1.5 ko kuma sabuwa. Suna karɓar ma'auni masu lamba mai ɗigo; DCOUNTER kuma yana gano alkiblar ƙidaya da sake saitawa, don haka ba wai COUNTER kawai bane mai lambobi masu ɗigo. Teburin yana bayyana ma'anar RRDtool, ba tabbacin cewa kowane nau'i yana samun goyon bayan kowane editan Kadupul ko hanyar ƙirƙira ba; tabbatar da ma'anar da aka samar, musamman ga maganganun COMPUTE. Duba [bayanin ƙirƙirar RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) na asali.

### Zaɓar nau'in da bai dace ba

Waɗannan misalan suna nuna rashin daidaituwa; bayyanarsu ya dogara ne akan bayanai da iyakoki.

`GAUGE` a kan ma'auni mai ƙaruwa yana zana matakinsa maimakon ainihin aikin da aka yi. Zai iya hawa har sai an sake saita shi; wannan na iya zama sananne amma ba a ba da tabbacin zai zama kuskure a sarari a cikin ɗan gajeren lokaci ba.

`COUNTER` yana fassara raguwa ta hanyar amfani da gyaran zagayowa, don haka sake saiti na iya zama babban ƙimar canji mai kyau ko kuma a ƙi shi ta mafi girman iyakarsa. `DERIVE` tare da mafi ƙanƙanta na sifili yana ƙin ƙididdiga mara kyau, gami da ainihin zagayowar lissafi; zaɓi shi kawai lokacin da wannan dacewar ta dace da ma'aunin. Mafi girma ba ya rarrabe kowane sake saiti daga sahihin zagayowa.

`COUNTER` a kan ma'aunin gauge shine kuskure mafi haɗari. Ƙimar da aka adana tana zama canji a cikin ma'auni wanda aka raba da lokacin da ya wuce. Na'urar da ke zaune daidai a digiri 40 tana rikodin sifili. Hawan digiri ɗaya a cikin mintuna biyar yana rikodin 0.0033. Shafin zai iya zama kamar daidai yayin auna canji maimakon zafin jiki. Wannan ƙimar tana da amfani ne kawai idan ita ce adadin da kake nufi; ba ya wakiltar asalin matakin ma'aunin.

`ABSOLUTE` a kan ma'aunin da ba ya sake saitawa a lokacin karantawa shine aji ɗaya na rashin nasara a ɗayan alkiblar, yana samar da ƙimomin da ke haɓaka da tsawon lokacin da na'urar ta kasance tana aiki.

Ƙa'idar da wannan ke bayarwa ita ce yanke shawarar nau'in daga yadda na'urar ke samar da lambar, ba daga abin da lambar ke nufi ba. Ko karatu shine ƙimar canji abu ne na ma'auni, ba na abin da ake aunawa ba.

## Bugun zuciya (The heartbeat)

Bugun zuciya shine matsakaicin lokacin da aka yarda dashi tsakanin sabuntawa don fili kafin RRDtool ya ɗauki tazarar a matsayin unknown. Ana auna shi tsakanin sabuntawa, ba azaman ƙarin lokaci da aka ƙara bayan mataki ba.

Karanta furofayil ɗin da aka saita da ainihin fayil ɗin. Furofayil ɗin mintuna biyar da aka bayar yana amfani da bugun zuciya na daƙiƙa 600, furofayil ɗin minti ɗaya kuma yana amfani da daƙiƙa 600, kuma furofayil ɗin daƙiƙa talatin yana amfani da daƙiƙa 1,200. Don haka ba za a iya bayyana haƙurin rashin zaɓe ta ƙididdiga ɗaya da aka kayyade ba; daidaitawa da haɗawa kuma suna shafar tazarar jadawali da ke zama unknown.

Bugun zuciya na kowane fili ne, ba na kowane fayil ba. Ƙimomin furofayil suna sanar da metadata, amma ƙirƙirar fayil tana karanta bugun zuciyar abu na gida, wanda zai iya bambanta da furofayil ɗin. Furofayilolin da aka tura ba sa amfani da rabo guda ɗaya, kuma dalilin da ke bayan kowannensu, tare da abin da bugun zuciya da aka saita kusa da matakin ke yi, yana cikin [Lokaci da tazara](/ha/concepts/time-and-intervals/).

## Haɗawa (Consolidation)

Yayin da sabuntawa ke zuwa, RRDtool kuma yana haɗa su zuwa manyan gurɓatattun gurabe; ba ya jiran mafi kyawun taska ta ƙare. Ana zaɓar aikin don kowace taska, kuma kowane aiki yana amsa tambaya daban.

- `AVERAGE` yana taƙaita maki na farko na bayanai masu ba da gudummawa.
- `MAX` yana adana mafi girman ƙimarsu.
- `MIN` yana adana mafi ƙanƙantar ƙimarsu.
- `LAST` yana adana ƙimarsu ta ƙarshe a ƙarƙashin ƙa'idodin haɗawa na RRDtool.

Waɗannan suna aiki a kan daidaitattun bayanan farko, ba lallai bane ainihin ɗanyen karatun farko ba. Taskar MAX ba za ta iya dawo da mafi girman matsayi na ɗan lokaci wanda aka riga aka yi matsakaita a cikin tazarar farko ba; MIN ba abin dogaro bane wajen gano kowace matsala.

Fayil yana adana taska ɗaya ga kowane aiki a kowane ƙuduri, don haka ajiye duka huɗun a ƙuduri huɗu yana nufin taskoki goma sha shida da sau huɗu na nauyin ƙima na ajiye matsakaici kaɗai tare da layuka iri ɗaya. Kayan aikin kai da yanayin shiri kuma suna amfani da sarari. Dukkan furofayilolin guda uku da aka kawo suna zaɓar ayyuka huɗu; zaɓi riƙon bayanai bisa ga tambayoyi da buƙatun ƙarfin tsarin ku.

Idan ka ajiye matsakaici kawai, ba za ka iya yin tambaya game da mafi girman ƙima daga baya ba. Ba a taɓa rubuta manyan matakan ba. Wannan shine babban abin da aka fi yin nadama a cikin kafuwar da ta daɗe, kuma ba za a iya gyara shi ba daga baya.

Wasu hanyoyin zane suna maye gurbin aikin da ke akwai lokacin da aikin da aka nema ya ɓace; wasu hanyoyin na iya kasawa. Tabbatar da DEF da aka samar da ainihin taskoki kamar yadda aka bayyana a cikin [Yadda ake zana jadawali](/ha/concepts/how-graphs-are-drawn/).

## Unknown ƙima ce ta gaske

RRD yana bambanta sifili daga unknown. Sifili na iya zama matakin da aka ruwaito ko ƙimar lissafi, kamar ma'aunin da bai canza ba. Unknown na iya haifarwa daga sabuntawa da suka ɓace, ƙarewar bugun zuciya, bayyanannen shigar da ba a sani ba, iyakokin da aka ƙi ko rashin isasshen bayanan haɗawa. Maye gurbin unknown da sifili na iya sa ma'aunin da ya ɓace ko mara inganci ya yi kama da rashin aiki.

Unknown yana yaɗuwa ta hanyar haɗawa a ƙarƙashin ƙofa da aka saita a kowace taska. Furofayilolin da aka tura suna saita shi a rabi: babban gurbi da aka gina daga bayanan da suka ɓace a wani ɓangare yana kasancewa ainihin lamba har sai fiye da rabin bayanan da aka shigar sun zama unknown, a wannan lokacin gaba ɗaya gurbin yana zama unknown. Ganuwa ya dogara ne akan daidaitawar gurbi, bugun zuciya, daidaitawa, haɗawa da gabatarwar jadawali. Babu tsawon lokacin katsewa na duniya wanda ke ba da tabbacin gibi yana bayyana ko ɓacewa a cikin kowace taska.

Unknown kuma shine abin da iyakoki ke samarwa. Karatun da ya wuce matsakaicin da aka saita ba a datse shi zuwa matsakaicin ba. Sake saita ma'auni na iya samar da ƙimar da ba ta dace ba da kuma gibi, amma iyakoki ba sa kama kowane sake saiti. Bayanan da ba a sani ba kaɗai ba sa gano dalilin; kwatanta kuskuren tattarawa da tambarin lokaci.

## Ƙayyade girma

Don fasalin da ba a canza ba, nauyin ƙimar taska shine jimillar gurabe a duk faɗin taskoki, sau adadin filaye, sau bytes takwas. Jimillar girman fayil da girman aiki kuma ya haɗa da manyan kai, yanayin shiri, rabon tsarin fayil, layuka da ajiyar waje. Gyaran fasali a bayyane na iya canza girman fayil.

Furofayiloli guda uku da aka kawo sun bambanta fiye da yadda sunayensu ke nunawa.

| Furofayil | Mataki | Gurabe ga kowane fili | Nauyi ga kowane fili | Kwatankwacin farashi |
|---|---|---|---|---|
| Tattara na Minti 5 | daƙiƙa 300 | 11,488 | kusan 90 KiB | 1 |
| Tattara na Daƙiƙa 30 | daƙiƙa 30 | 40,284 | kusan 315 KiB | 3.5 |
| Tattara na Minti 1 | daƙiƙa 60 | 81,716 | kusan 640 KiB | 7 |

Hanyar samo bayanai ta hanyar haɗin gwiwa mai filaye biyu tana ninka kowannensu sau biyu. Haɗin yanar gizo dubu goma a kan furofayil ɗin minti biyar yana da kusan 1.8 GB na nauyin ƙimar taska. Wannan dubu goman a kan furofayil ɗin minti ɗaya yana kusan 13 GB, kuma dalilin ba wai matakin bane kawai da kansa; wannan furofayil ɗin yana kuma adana taskar kowane wata mai zurfi da kuma ta shekara goma.

Abin da kowace taska ke ɗauka a zahiri yana da kyau a bincika da sunanta. Taskokin furofayil ɗin mintuna biyar an lakafta su da Kullum, Mako-mako, Kowace Wata da Kowace Shekara, kuma tsawon lokacin da suke riƙe shine awanni 50, kwanaki 14.6, kwanaki 64.6 da shekaru 2.2. Sunayen suna bayyana saitin jadawalin da aka auna kowace taska dominsa, ba riƙon bayanai ba. Idan kana buƙatar amsa tambaya game da watan Afrilu na ƙarshe a ƙudurin minti biyar, lakabin zai gaya maka cewa zaka iya kuma taskar ba za ta iya ba.

Nauyin rubutu yana motsawa tare da furofayil ɗin kuma, kuma yana zuwa da daɗewa kafin faifai ya samu. A cikakken tsarin tattarawa, matakin daƙiƙa talatin yana samar da tazarar samfurin sau goma fiye da matakin minti biyar. Haɗawa, filaye da aka raba, zaɓin aikin da ya kamata da kuma ƙoƙarin da ba a yi nasara ba suna shafar umarni da ƙididdigar rubutu na zahiri; ba ƙayyadadden rabo bane. Duba [Rubuce-rubuce masu yawa](/ha/concepts/high-volume-writes/).

## Waɗanne filaye ke isa ga fayil ɗin

Hanyar samo bayanai da aka gina daga samfurin bayanai tana samun fili a cikin fayil ɗin kawai don filayen da wani abu na jadawali ya ambata a cikin hanyar ƙirƙira ta al'ada. Lambar sabuntawa na iya cire filayen samfuri marasa ambato; ko an tattara su ya dogara ne akan hanyar shigarwa da ma'ajiyar ɗan lokaci, ba wai kawai ko layi yana bayyane ba. Hanyar samo bayanai ba tare da samfuri ba tana samun kowane fili, bisa dalilin cewa ba za a sami jadawalin da za a tambaya ba.

Magana ba dole ba ne ta zana layi mai bayyane: duba taswirar abubuwan jadawali da kuma ma'ajiyar ɗan lokaci da ma'anar fayil. Ƙara filin samfuri kaɗai ba ya tabbatar da cewa tattarawa, taswirar jadawali da ajiya duk a shirye suke. Sake gina ma'ajiyar ɗan lokaci yana magance metadata na tattarawa; ba ya ƙara filaye zuwa RRD da ke akwai.

Hakanan yana nufin ƙara fili zuwa samfuri ba ya ƙara shi ta atomatik zuwa fayilolin da ke akwai, koda kuwa da zarar wani abu na jadawali ya ambace shi. Ƙara fili yana buƙatar kulawa ta musamman ko ƙaura. Ya danganta da sigar RRDtool da aka shigar, daidaitawa na iya ƙara hanyoyin samo bayanai yayin riƙe bayanan da ke akwai; sharewa da sake ƙirƙirar fayil yana rasa tarihinsa. Duba [Sarrafa riƙon bayanai](/ha/guides/manage-data-retention/) don zaɓuɓɓukan kulawa da bincike.
