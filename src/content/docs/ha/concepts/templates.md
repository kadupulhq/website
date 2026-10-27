---
title: Samfura
description: Yadda ma'ana ɗaya ke rufe na'urori ɗari, da kuma abin da ke faruwa idan ka canza shi.
sidebar:
  order: 3
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
---

An gina samfura ne domin ƙoƙarin ƙara sauya (switch) na ɗari ya zama daidai da ƙara sauya na biyu. Akwai nau'ikan guda huɗu, kuma an shirya su a cikin tsari.

Don tsarin aiki, duba [yi amfani da tabbatar da tsarin aikin samfuri](/ha/guides/template-workflow/).

**Samfurin bayanai** yana ƙayyade abin da za a tattara da yadda za a adana shi: filaye, nau'ikansu, iyakokinsu, furofayil ɗin ajiya, da kuma wace hanyar shigarwa za ta tattara lambobin. Filayen kowane abu da fayilolin RRD da ke akwai na iya bambanta da samfurin yanzu; samfurin ba shine kawai hujjar ainihin tsarin fayil ɗin ba.

**Samfurin zane** yana ƙayyade yadda za a zana jadawali: waɗanne abubuwa, a wane tsari, a wane launi, a wane layin bayani, da kuma abin da aka rubuta a kan ma'auni.

**Samfurin na'ura** yana haɗa tambayoyin bayanai da samfuran zane waɗanda suka dace da nau'in na'ura, don haka zaɓar wanda ya dace lokacin ƙara na'ura yana kammala mafi yawan aikin.

**Tambayoyin bayanai** suna magance yanayin da ba ka san ainihin abubuwan da ke akwai a gaba ba. Sauya (switch) yana da tashoshi da yawa da binciken na'ura ya gano, kuma tambayar bayanai tana adana sakamakon da aka tsara don ƙirƙirar zane-zane. Binciken kansa kawai ba ya ƙirƙirar ƙayyadadden adadin zane-zane ko hanyoyin samo bayanai.

## Yadda aka jera matakan

Waɗannan abubuwa huɗu ba matakai huɗu ne masu kama da juna na abu ɗaya ba. Kowane ɗayan yana nuni ne zuwa ga wanda ke ƙasa da shi.

| Nau'i | Abin da yake nuni zuwa gare shi | Abin da yake ƙirƙira |
|---|---|---|
| Samfurin na'ura | Samfuran zane da tambayoyin bayanai | Ba komai kai tsaye. Jerin damammaki ne da aka tsara wa na'ura |
| Tambayar bayanai | Ma'anar zane da taswirar sakamakon da aka tsara | Layukan da aka gano; zaɓaɓɓen ƙirƙirar zane na iya ƙirƙira ko sake amfani da hanyoyin samo bayanai |
| Samfurin zane | Filayen samfurin bayanai inda abu ke buƙatar bayanai | Zane wanda zai iya nuni zuwa hanyoyin samo bayanai da yawa |
| Samfurin bayanai | Hanyar shigarwa da furofayil ɗin ajiya | Metadata na hanyar samo bayanai; lokacin da ake buƙatar rubutu, ana ƙirƙirar RRD |

Abubuwan samfurin da ke ɗauke da bayanai suna nuni zuwa filayen samfuri; abubuwan da aka ƙirƙira suna daidaita da filayen cikin gida. Rubutu da abubuwa marasa canzawa ba sa buƙatar nassoshin hanyar samo bayanai. Ƙirƙirar zane tana warware waɗannan daidaitawa, kuma canje-canjen samfuri na gaba ko gyaran abu na iya canza su kuma. Ƙirƙirar zane na iya sake amfani da hanyoyin samo bayanai masu dacewa maimakon yin sabon fayil ga kowane zane.

## Tsarin samfuri ko na kowane abu

Filaye da yawa a matakan zane da hanyar samo bayanai suna da tuta (flag) mai rakiya a cikin layin samfurin. Ga waɗancan filaye, tutar tana sarrafa yaɗuwar yau da kullun zuwa abubuwan da ke ƙasa da aka haɗa. Sauran filaye, abubuwan zane, da daidaita shigarwa suna da ƙa'idodin canji daban.

| Tuta | Ma'ana | Lokacin adanawa |
|---|---|---|
| A kashe | Filin yana bin samfuri | Ana rubuta shi ga kowane abu na ƙasa, yana share ƙimar da ta gabata |
| A kunne | Filin na kowane abu ne daban | Yana kasancewa ba tare da canji ba a kowane abu na ƙasa |

Tutar daban take ga kowane fili. Samfurin zane na iya tilasta alamun ma'auninsa a kan zane-zanen da ke ƙasa yayin barin taken da iyakokin tsaye ga zaɓin mai ƙirƙira. Wannan haɗin shine ƙa'idar yau da kullun, ba keɓancewa ba.

Halaye biyu na wannan tsari sukan haifar da ruɗani akai-akai.

Tutar tana cikin samfurin ne, kuma tana ƙayyade matakin adanawa na gaba kawai. Da zarar an sake rubuta fili, sanya masa alama a matsayin na kowane abu ba ya dawo da tsohuwar ƙimar. Tsoffin ƙimomi na musamman sun ɓace; tutar tana kare canje-canje na gaba kawai.

Kishiyar hakan ta fi haɗari. Kashe tutar filin da ya kasance na kowane abu tsawon shekaru yana sa adanawa guda ɗaya share wannan filin a duk abubuwan da ke ƙasa da ƙimar samfurin, wanda galibi ƙima ce ta asali wadda babu wanda ya taɓa dubawa.

### Ba kowane fili ke ɗauke da tuta ba

Fili yana shiga cikin wannan tsari ne kawai idan yana da tuta. A matakin hanyar samo bayanai, guda huɗu suna da tuta kuma guda biyu ba su da ita da gangan.

| Fili | Yana da tuta | Halayya |
|---|---|---|
| Suna | E | Tsarin samfuri ko na kowane abu |
| A kunne | E | Tsarin samfuri ko na kowane abu |
| Mataki (Step) | E | Tsarin samfuri ko na kowane abu |
| Furofayil ɗin ajiya | E | Tsarin samfuri ko na kowane abu |
| Hanyar shigarwa | A'a, ana ɗaukarsa koyaushe yana bin samfuri | Mai kula da adana samfuri yana sabunta layukan hanyoyin samo bayanai da abin ya shafa a bayyane |
| Hanyar fayil ɗin RRD | A'a, ba ya taɓa bin samfuri | Yaɗuwar samfuri ta yau da kullun tana tsallake shi; gyaran samfuri yana riƙe hanyar da ke akwai |

Riƙe hanya yana kare haɗin da ke akwai tare da tarihin bayanai yayin canje-canjen samfuri na yau da kullun. Wannan ba yana nufin ba za a iya gyara ko matsar da hanyar ta hanyar wasu ayyukan gudanarwa ba. Tabbatar da asalin fayil ɗin kafin yin canje-canje.

Filayen abubuwan hanyar samo bayanai duk suna ɗauke da tutoci: sunan filin, nau'insa, bugun zuciyarsa, mafi ƙanƙanta, mafi girma, da kuma filin shigarwa da ke ciyar da shi bayanai.

## Shigarwar zane tana aiki a kishiyar hanya

Samfurin zane na iya ayyana shigarwa mai suna wanda ke haɗa abubuwan zane da yawa zuwa fili ɗaya mai iya gyarawa, ta yadda gyara ƙima a kan zane yana sabunta kowane abu da ke raba shi. Wannan shine tsarin da ke bayan launi ɗaya ko saitunan bayani da ke sarrafa rukunin abubuwa masu alaƙa.

Ƙimar da take yaɗawa ba ƙima ba ce daga samfurin. Tana karanta ƙimar yanzu daga sauran abubuwan da ke cikin shigarwar kuma tana amfani da ita. Don haka shigarwar zane tana yaɗuwa a kaikaice tsakanin abubuwan zanen kansa maimakon saukowa daga samfurin zuwa ƙasa, ma'ana gyara shigarwa na iya canza zanen da samfurin bai taɓa kai tsaye ba.

## Abin da ke yaɗuwa da kuma lokacin da yake yaɗuwa

| Canji | Shin yana isa ga abubuwan da ke akwai | Ta yaya |
|---|---|---|
| Filin samfurin zane, yana bin samfuri | E, lokacin adanawa | Ana rubuta shi ga kowane zane da aka ƙirƙira daga wannan samfurin |
| Filin samfurin zane, na kowane abu | A'a | Abin da ke ƙasa yana riƙe da tasa ƙimar |
| Bayyanar abin zane | E, lokacin adanawa | Launi, nuna gaskiya, nau'in abu, faɗin layi, ɗigo-ɗigo, CDEF, VDEF, matsawa, aikin haɗawa, daidaitawa, rubutu, da tsarin bayani |
| Ƙara, cirewa ko sake daidaita abin zane | Ya dogara da aiki | Daidaitawa, ƙarawa, sharewa da sake tsara taswira suna amfani da hanyoyi daban-daban; bincika taswirar abubuwan gida da aka samu |
| Filin samfurin bayanai, yana bin samfuri | E, lokacin adanawa | Ana rubuta shi ga kowace hanyar samo bayanai da aka ƙirƙira daga wannan samfurin |
| Ƙimar filin shigarwar samfurin bayanai | Idan yana bin samfuri | Tutocin samfuri da na ƙasa, filayen faharasa na tambaya da ƙa'idodin mai masauki suna iyakance yaɗuwa |
| Furofayil ɗin ajiyar samfurin bayanai, mataki, taskoki | A cikin rumbun adana bayanai kawai | Fayilolin da ke akwai suna riƙe da tsarin da aka gina su da shi |
| Ƙara sabon fili a samfurin bayanai | A cikin rumbun adana bayanai kawai | Babu sarari a cikin fayilolin da ke akwai da za a sanya su |
| Abubuwan da ke cikin samfurin na'ura | Daidaitawa ta daban | Gyara dangantaka kawai ba ya daidaita kowace na'ura da ke akwai ta atomatik |

Tsarin yaɗuwar rumbun adana bayanai ya dogara ne akan hanyar adanawa da ƙa'idodin soke aiki. Sabunta metadata na samfuri ba ya ƙaura da fayilolin RRD da ke akwai ta atomatik; kulawar fayil aiki ne na daban. Wasu ikon tsari sun kasance na karantawa kawai a cikin editan samfurin bayanai da ake amfani da shi. Duba [ƙirƙiri samfura na musamman](/ha/guides/create-custom-templates/).

## Samfuran na'ura suna da tabbatacciyar hanyar daidaitawa

Gyara dangantakar samfurin na'ura yana canza zaɓuɓɓukan da ke akwai don sabbin na'urori. Na'urorin da ke akwai suna amfani da aikin sake amfani/daidaitawa na daban. Kayan aiki na gama-gari yana zaɓar na'urorin da ke cikin yanayin Up ko Recovering ta asali, sai dai idan mai kira ya haɗa da na'urorin da aka kashe a bayyane; bincika zaɓin kafin ɗauka cewa an sabunta kowace na'ura.

Daidaitawa tana ƙara dangantakar samfurin zane da ta ɓace, tana wartsake tambayoyin bayanai da aka zaɓa, kuma tana iya cire dangantakar samfurin zane da ba a amfani da ita wadda ba a buƙata kuma. Cire samfuri daga samfurin na'ura ba ya share zane-zanen da ke akwai kai tsaye don an cire shi daga samfurin kawai. Hakanan yana kunna hanyoyin atomatik da na ƙarin manhaja, waɗanda zasu iya tafiyar da aikin atomatik na zane da aka saita.

Bincika dangantakar na'urori da zane-zanen da suka haifar bayan daidaitawa. Wataƙila ba koyaushe su zama haɗin dindindin na kowane sigar samfuri da aka yi amfani da shi a baya ba.

## Faharasa da dalilin da ya sa tashoshi ke motsawa

Dole ne tambayar bayanai ta yanke shawarar wanne bangare da aka gano ya dace da wace hanyar samo bayanai da ke akwai. Wannan ita ce faharasa (index). Faharasa ta lambobi na iya canzawa bayan canjin kayan aiki ko tsari. Ingantaccen fili mai karko zai iya taimakawa wajen kiyaye asali, amma sunayen tashoshi na iya canzawa ko a sake amfani da su. Tabbatar da keɓancewa, kwanciyar hankali da halayyar sake faharasa a kan ainihin na'urar; sunan fili shi kaɗai ba ya ba da garantin ci gaba.

Wannan shawarar tana da sauƙi a lokacin da ake yanke ta amma tana da tsada sosai idan aka yi kuskure. Ana ɗaukar ta ga kowace na'ura a kowane gudu maimakon sau ɗaya ga tambaya, don haka sauya (switch) guda biyu masu kama da juna za a iya sanya su a cikin faharasa dangane da filaye daban-daban. Yadda ake zaɓar filaye, abin da ke faruwa idan aka rasa faharasa, da kuma farashin gano sake ƙidaya an yi bayani dalla-dalla a cikin [tambayoyin bayanai da faharasa](/ha/concepts/data-queries-and-indexes/).

## Canza samfuri daga baya

Canje-canjen zane yana shafar nuni na gaba bayan an kammala adanawa da yaɗuwa masu dacewa. Sokewa da adana hotuna na iya shafar abin da mai amfani ke gani, don haka kada ka ɗauka cewa kowane zane zai canza nan da nan. Gwada zanen ƙasa na wakilci da daidaita abubuwansa; duba [daidaita bayyanar zane](/ha/guides/tune-graph-appearance/).

Adana samfurin bayanai ba ya sake fasalin fayilolin RRD da ke akwai ta atomatik. Ainihin ma'anar hanyar samo bayanai da taskoki a cikin fayil ɗin na iya rashin jituwa da furofayil ɗin rumbun adana bayanai. Bincika duka biyun kafin aikin kulawa; gina fayil ɗin maye gurbin zaɓi ɗaya ne kawai.

Dangane da canje-canjen, ingantaccen daidaita RRDtool, canza girman taskoki ko sarrafa ayyukan zubarwa/dawo da bayanai na iya kiyaye wani ɓangare ko dukkan tarihin da ke akwai. Waɗannan ayyukan suna da iyakoki kuma suna buƙatar ajiyar waje da tabbatarwa; ba sa sake gina bayanan da ba a taɓa adana su ba. Share fayil da sake ƙirƙirar shi yana ɓatar da tarihinsa. Duba [sarrafa riƙon bayanai](/ha/guides/manage-data-retention/) da [hanyoyin samo bayanai da taskokin zagayawa (RRAs)](/ha/concepts/data-sources-and-rras/).

## Wasu abubuwa da ake kira samfura

Wasu abubuwa guda huɗu suna amfani da wannan sunan amma ba sa aiki kamar guda huɗun da ke sama. Samfuran launi su ne jerin launuka masu suna da ake amfani da su ga abubuwan zane. Samfuran haɗin gwiwa suna bayyana yadda ake haɗa zane-zane da yawa zuwa ɗaya. Samfuran atomatik suna daidaita na'urorin da aka gano zuwa samfurin na'ura. Ma'anar saitin zane yana ba da tsarin bayani mai amfani da za a iya sake amfani da shi.

Babu ɗayansu da ke cikin tsarin da aka bayyana a nan. Sanin su yana da amfani musamman don gane nau'in da ya dace lokacin da sakamakon bincike ya ambaci samfura.
