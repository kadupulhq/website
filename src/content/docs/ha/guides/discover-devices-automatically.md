---
title: Gano na'urori ta atomik
description: Bincika kewayon hanyar sadarwa, daidaita na'urorin da aka samu zuwa samfuri, kuma bar dokoki su gina jadawali da rassan bishiyoyi, tare da kashe ƙirƙirar na'ura don gwajin ganowa na farko.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 15
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura mai goyan baya. Gwada waɗannan matakan akan keɓantaccen kwafi tare da ajiye bayanan sirri kafin dogara da su. Duba [matsayin aiki](/ha/project/status/).
:::

Aiki da kai injuna ne guda biyu daban-daban waɗanda ke da sauƙin rikitarwa. Ganowa (Discovery) yana bincika kewayon adireshi kuma yana yanke shawarar abin da ke na'ura. Dokoki (Rules) suna yanke shawarar abin da za a gina don na'ura da zarar ta wanzu. Kuna iya gudanar da ɗayan ba tare da ɗayan ba, kuma yawancin lalacewar da mutane ke yi tare da aiki da kai yana fitowa ne daga kunna duka biyun lokaci ɗaya da kuma gano illar daga baya.

## Bayyana kewayon

Kewayon hanyar sadarwa jerin ne da aka raba da waƙafi. Kowane shigarwa yana ɗaya daga cikin sifofi guda uku.

| Siffa | Misali | Bayanin kula |
|---|---|---|
| CIDR | `192.168.1.0/24` | Har ila yau yana karɓar abin rufe fuska mai ɗigo, `192.168.1.0/255.255.255.0` |
| Katin daji | `192.168.*.*` | An canza shi a ciki zuwa kwatankwacin CIDR |
| Adireshin guda ɗaya | `192.168.1.10` | Yana bincika ainihin wannan adireshin kawai |

Kewayon farawa-zuwa-ƙarshe da aka rubuta azaman `192.168.1.10-192.168.1.50` an ƙi su tare da kuskure. Ba a tallafa musu ba.

Yi amfani da kewayon da ba sa haɗuwa, gami da hanyoyin sadarwa waɗanda zasu iya gudana a lokaci guda. Teburin aiki yana da maɓalli na musamman na duniya akan adireshin IP; kwafi na iya ƙin yarda da duka rukunin shigarwa, tare da barin sauran adireshi a cikin wannan rukunin. Duba [matsala #207](https://github.com/kadupulhq/kadupul/issues/207).

Komai IPv4 ne. Lissafin kewayon yana amfani da jujjuyawar lamba ta 32-bit a ko'ina, don haka babu hanyar IPv6 anan.

An cire adiresoshin hanyar sadarwa da watsa shirye-shirye. `/24` yana bincika adireshi 254, daga `.1` zuwa `.254`. Shigar da adireshi guda ɗaya yana bincika ɗaya. Adiresoshin da oktet ɗinsu na ƙarshe shine 255 ana tsallake su yayin binciken kuma.

Kafin a fara binciken, ana rubuta kowane adireshi a cikin kewayon a cikin teburin aiki, jere ɗaya a kowane adireshi, kuma zaren (threads) suna da'awar layuka daga ciki. `/16` yana rubuta layuka 65534 kafin ping na farko. Wannan farashi ne na gaske, kuma shi ya sa bincika babban kewayon da ba a cika ba ke da jinkiri koda babu abin da ke amsawa.

Haɗa zaɓin SNMP da aka saita zuwa kowane kewayon. Babban yanayin (Master mode) yana shigar da kuskure kuma yana tsallake kewayon wanda ID ɗin saitin SNMP ɗinsa ya zama sifili. Gudu da aka yi niyya baya amfani da wannan tsaro ɗaya; farawa kai tsaye baya sanya zaɓuɓɓukan SNMP da suka ɓace su zama masu amfani.

## Sanya saurin binciken

| Saiti | Abin da yake yi | Na asali |
|---|---|---|
| Zaren Ganowa | Ma'aikatan layi ɗaya suna da'awar adireshi | 1 |
| Iyakar Gudu | Ana dakatar da ganowa bayan wannan lokaci | Minti 20 |
| Nau'in Jadawalin | Na hannu, kullum, mako-mako, kowane wata, ko kowane wata a wata rana | Na hannu |
| Hanyar Ping | ICMP, TCP, TCP closed, UDP, ko SNMP | Daga saitin duniya |
| Sake Gwada Ping, Ƙarewar Lokaci | Farashin gazawar adireshi | Daga saitunan duniya |

Zaren da iyakar gudu suna hulɗa mara kyau idan ba ku yi tunani game da su ba. Zare hamsin akan `/16` binciken tashar jiragen ruwa ne (port scan) ga kowane tsarin gano kutse. Zare ɗaya akan kewayon guda ɗaya zai bugi iyakar gudu kuma a kashe shi a tsakiyar hanya, yana barin sakamako na ɓangare wanda yayi kama da cikakken sakamako.

Ƙayyade girman kewayon don binciken ya ƙare a cikin iyaka a ƙididdigar zaren da hanyar sadarwar ku ke jurewa. Ƙananan kewayon da yawa sun doke babba guda ɗaya, saboda kowannensu yana samun jadawalinsa da iyakarsa.

## Abin da binciken ke yi a kowane adireshi

1. Warware suna. Ana iya ba da madadin sabar DNS azaman jeri da aka raba ta sarari; idan ba a saita babu ba, ana amfani da mai warwarewa na poller. Neman NetBIOS zaɓi ne na komawa baya lokacin da DNS bai dawo da komai ba.
2. Bincika ko adireshin ko wannan sunan ya riga ya zama na'ura. Idan haka ne, ana yiwa adireshin alama an yi. Wannan yana murƙushe na'urar da aka samu ta waɗannan ƙimar; ba garantin hana ƙirƙira a lokaci guda ba ko laƙabi daban-daban.
3. Ping, ta amfani da hanyar da aka saita. Hanyar SNMP tana ƙetare ping daban.
4. Idan ping ya amsa, ko aka zaɓi hanyar SNMP, gwada SNMP kuma tattara `sysDescr`, `sysObjectID`, `sysName`, `sysLocation`, `sysContact` da lokacin aiki (uptime).
5. Daidaita bayanan tsarin da aka tattara akan dokokin na'urar.

Adireshin da ke yin ping amma baya amsa SNMP ana yin rikodin shi azaman an samo kuma yana da rai. Adireshin da ke amsa SNMP amma bai dace da kowace dokar na'ura ba ana yin rikodin shi azaman an samo, tare da bayanan tsarinsa, kuma ba a ƙirƙiri komai ba. Dukansu sun sauka a cikin jerin na'urorin da aka gano.

An kunna murƙushe kwafi ta asali. Idan an riga an ga `sysName` akan wani adireshi a cikin bayanan binciken da aka adana na wannan hanyar sadarwar, ko kuma yana kan na'ura mai suna daban, ana tsallake adireshin. Wannan shine daidaitaccen tsoho don na'ura mai ba da hanya tsakanin hanyoyin sadarwa mai fuskoki da yawa da kuma kuskure ga na'urori iri ɗaya a bayan adiresoshin NAT daban-daban, wanda shine abin da zaɓin sysName guda ɗaya ya wanzu don kashewa.

Na'urorin da ke akwai na iya sake gudanar da tambayoyin bayanan su yayin binciken. An kashe wannan ta asali, kuma yana aiki ga na'urorin da aka yi rikodin azaman sama ko murmurewa. Ganowa yana amfani da matsayin da aka adana don wannan shawarar; baya sabunta sabon bincike na na'urar da ke akwai.

## Dokokin na'ura suna yanke shawarar samfurin

Dokar na'ura tana tsara bayanan tsarin zuwa samfurin na'ura. Kowace doka tana ɗauke da tsari don `sysDescr`, `sysObjectID` da `sysName`. Mai dacewa yana tace kowane filin tsarin da na'urar ta dawo da shi azaman mara kowa; sifofin doka mara komai sun dace da kowace ƙima. Ana kimanta dokoki a cikin tsari na jeri kuma wasan farko ya ci nasara.

Yi amfani da sassauƙan madaidaitan kalmomi kuma tabbatar da samfurin da aka zaɓa a sakamakon ganowa. Mai dacewa da SQL na yanzu yana nannade sifofin regex a cikin haruffan `/` na zahiri, don haka tsarin da aka kafa kamar `^Linux.*fixture$` ya gaza koda lokacin da ma'aikacin regex na bayanan ya dace da shi kai tsaye. Komawar kalmar ba ta gyara wannan shari'ar ba. Duba [matsala #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE` kuma yana ɗaukar `%` da `_` azaman katin daji.

Babu wasa yana nufin babu na'ura. Ana yin rikodin adireshin a cikin jerin na'urorin da aka gano tare da duk bayanan tsarin da aka tattara, kuma wannan jerin shine inda kuke rubuta dokar da kuka rasa.

Sanya takamaiman dokoki sama da na gabaɗaya. Doka mai dacewa da kalmar `Linux` da aka sanya a sama da dokar mai siyarwa za ta ɗauki kowace na'ura da ke ambaton Linux a cikin bayaninta.

## Samfotin bincike kafin kunna ƙirƙira

An kashe maɓallin ƙirƙirar na'ura akan sabon kewayon ta asali. Bar shi a kashe don gwajin farko, kuma kashe zaɓi don sake gudanar da tambayoyin bayanan na'urorin da ke akwai. Wannan hanyar har yanzu tana sabunta bayanan ganowa, ƙididdigar bincike, da rajistan ayyukan, kuma tana iya aika sanarwar da aka saita. Baya samfoti na zane ko aiwatar da dokar bishiya.

Gudanar da binciken, sannan karanta jerin na'urorin da aka gano. Yana nuna binciken da aka rubuta, bayanan SNMP da aka tattara, da kuma samfurin da ya dace inda akwai. Na'urorin da ke akwai, kwafin da aka murƙushe, da adiresoshin da aka tsallake ba sa buƙatar bayyana a can. Bincika fitarwar gyara kuskure ta kowane adireshi da kuma lissafin.

Tilasta binciken daga layin umarni maimakon jiran jadawalin:

```bash
php poller_automation.php --network=3 --force --debug
```

Tutar gyara kuskure tana buga shawarwarin kowane adireshi yayin da suke faruwa. Babban tsari, wanda ke ƙaddamar da kewayon da aka kunna waɗanda jadawalinsu ya cika, wani yanayi ne na daban:

```bash
php poller_automation.php -M
```

Umarnin `--force` da aka yi niyya shima yana tafiyar da hanyar sadarwar da aka kashe. Ƙara `--force` zuwa babban yanayin yana ƙetare binciken jadawalin kuma yana iya ƙaddamar da hanyoyin sadarwar da aka kashe kuma. Yi amfani da fom ɗin da aka yi niyya lokacin inganta kewayon ɗaya.

Bincika abubuwa uku a cikin sakamakon kafin kunna ƙirƙira.

- Ƙididdigar na'urar ita ce abin da kuke tsammani. Ƙidaya mafi girma fiye da jerin kadarorin ku yawanci yana nufin kewayon ya fi faɗi fiye da yadda kuke tunani.
- Samfuran da aka zaɓa daidai ne. Shafin samfuri ɗaya na gama-gari akan komai yana nufin dokokin ku basa dacewa.
- Babu wani abu mai mahimmanci da ba ya nan. Don na'urar da ta ɓace, bincika faɗaɗa kewayon, kammala ma'aikaci, na'urar da ke akwai da murƙushe kwafi, manufar ping, da sakamakon SNMP. Rashin kasancewa daga lissafin kaɗai baya tabbatar da cewa ba za a iya isa gare shi ba.

## Dokokin zane da bishiya

Da zarar na'ura ta wanzu, dokokin zane da dokokin bishiya suna yanke shawarar abin da aka gina akanta. Ganowa na iya kiran wannan aiki da kai bayan ƙirƙirar na'ura, kuma CLI na iya amfani da ita ga na'urorin da ke akwai. Dole ne a kunna zane ɗaya da dokokin bishiya. Maɓallan sarrafa kansa na jadawalin/bishiyar duniya suna sarrafa ƙugiyoyi na ƙirƙira na musamman; ba haramci bane na bargo akan aikin atomatik na CLI.

Dokar zane tana da sassa uku: waɗanne na'urori take aiki dasu, waɗanne fihirisar da aka gano a cikin tambayar bayanai take aiki da su, da kuma wane nau'in zane za a ƙirƙira. Dukkanin sassan biyu da suka dace an gina su ne daga abubuwan doka, kuma abun doka yanki ne, ma'aikaci da tsari, waɗanda aka haɗa da `AND` ko `OR` tare da baka.

| Rukunin ma'aikata | Membobi |
|---|---|
| Kalmar zance | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Daidaito | matches, is not equal to |
| Lambobi | is less than, less than or equal, greater than, greater than or equal |
| Kasancewa | is unknown, is not unknown, is empty, is not empty |
| Tsari | matches regular expression, does not match regular expression |

Waɗannan sun zama sashi na SQL `WHERE`. Masu aiki na yau da kullun sune yaren magana na yau da kullun na bayanan, ba PCRE ba, don haka tsarin da ke aiki a `preg_match` ba lallai bane yayi aiki anan. Kwatancen lambobi akan tsarin lambobi ana wucewa ba tare da ambato ba; duk wani abu ana ambatonsa, kuma bayanan yana amfani da dokokin jujjuya nau'in sa. Gwada masu tace lambobi akan ainihin ƙimar da aka ajiye; ana adana waɗannan ƙimar azaman rubutu. Masu aikin kalmomi suna amfani da SQL `LIKE`, inda `%` da `_` suke da ma'anar katin daji.

Halaye biyu sun cancanci sani kafin ku gyara dokar da ba ta yin komai.

**Matatar na'ura/abu mara komai bata dace da komai ba, amma matatar fihirisa mara komai tana dacewa da duk fihirisar da aka ajiye.** Matatar zaɓin na'urar tana komawa ga yanayin ƙarya lokacin da ba ta da abubuwan da suka dace. Da zarar dokar zane ta dace da na'ura, duk da haka, cire duk sharuɗɗan fihirisar jadawalin yana barin tambayar bayanan ba tare da tacewa ba. Misali, cire yanayin `ifDescr = eth0` na iya ƙirƙirar jadawali don `lo`. Kashe dokar yayin gyara yanayin fihirisarta.

**An yi watsi da dokar da ke nuni ga filin da na'urar ba ta gano ba.** Idan doka ta tace a kan filin tambayar bayanai wanda baya cikin ma'ajiyar na'urar, gudu yana shigar da gargaɗin da ke nuna filin kuma ya daina sarrafa wannan doka don wannan na'urar. Dalilin da aka saba shine dokar da aka rubuta akan tambayar bayanai guda ɗaya ana kimantawa akan na'urar da tambayarta ta dawo da wani saitin filin daban.

Shafin gyara doka yana lissafin abubuwa da jadawali na ɗan takara. Bita waɗannan jerin kafin kunna doka da kuma bayan gyara ta. Samfoti ne na zaɓi, ba cikakken aikin bushewa bane: binciken tushen bayanai, gano jadawali da ke akwai, ƙugiyoyin ƙirƙira, da shigar da bishiya har yanzu suna faruwa yayin aiwatarwa. CLI ba shi da zaɓin bushewar aiki.

Dokokin bishiya suna da nau'ikan ganyen na'ura da jadawali daban-daban da zaɓin bishiyar manufa da iyaye. Matakan kai na iya amfani da kafaffen kirtani ko ƙima daga filayen na'ura/jadawali. Kanun labarai da aka samo daga filin suna amfani da madaidaicin madaidaicin PHP regex wanda ba ya kula da girman harafi; ainihin jerin `\n` a cikin sakamakon ya raba shi zuwa kanun labarai masu gida a jere. Wannan ma'anar maye gurbin ya bambanta da SQL regex da ake amfani da shi don daidaita abu. Ana sake amfani da kanun labarai da ganye da ke akwai a bishiya ɗaya da iyaye ɗaya; canza hanyar na iya ƙara wani wuri ba tare da cire tsohon ba.

## Aiwatar da dokoki ga na'urorin da suka riga sun wanzu

Ganowa ba ita ce kawai hanyar shiga ba. Ana iya gudanar da dokoki akan na'urorin da ke cikin tsarin, waɗanda aka zaɓa ta ID, sunan mai masauki ko bayanin:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Sunan mai masauki da bayanin sun dace da bayyanawa ta yau da kullun lokacin da ƙimar ta kasance mai aiki, kuma koyaushe azaman kalma. Aƙalla ɗaya daga cikin ukun ana buƙata; kiran shi ba tare da masu zaɓa ba yana fita tare da kuskure. Lokacin da aka haɗa masu zaɓe, ana haɗa su da `AND`. Yi amfani da tabbatattun ID na na'ura da aka raba ta sarari don kunkuntar zaɓi; ba a tallafawa ID ɗin da aka raba da waƙafi. Misalai har yanzu na iya zama fadi, kuma komawar SQL `LIKE` tana ɗaukar `%` da `_` azaman katin daji.

Tambayar mai zaɓe ba ta keɓance na'urorin da aka kashe kai tsaye ba. `--debug` yana ƙara bincike amma har yanzu yana aiwatar da ƙirƙira. Babu na'urorin da suka dace shine aiki mara ma'ana (no-op) mai nasara, don haka matsayin fita kaɗai baya tabbatar da cewa an ƙirƙiri komai.

Ga kowace na'ura mai dacewa, gudu yana yin abubuwa uku cikin tsari:

1. Yunkurin ƙirƙira don samfuran jadawalin da aka haɗa waɗanda ba su da jadawali akan na'urar, dangane da cancantar samfuri da binciken tushen bayanai.
2. Yana gudanar da dokokin jadawalin da aka kunna don tambayoyin bayanan da aka haɗa ta amfani da ma'ajiyar fihirisar da aka adana. Wannan matakin da kansa baya sake gudanar da bincike; sabunta tambayar bayanan da farko idan ma'ajiyar ta ɓace ko ta tsufa.
3. Yana amfani da dokokin bishiyar ganyen na'urar da aka kunna.

Sabon ƙirƙirar zane na iya kiran dokokin bishiyar ganyen zane lokacin da aka kunna sarrafa bishiyar duniya. CLI ba ya sake amfani da waɗannan dokokin ga jadawalin da ta gano an riga an ƙirƙira su. Saboda haka sabuwar dokar ganyen zane ko wacce aka canza ba ta cika jadawalin da ke akwai ba kawai saboda an sake gudanar da CLI. Duba [matsala #211](https://github.com/kadupulhq/kadupul/issues/211). Tabbatar da sanya su daban; kar a share da sake ƙirƙirar zane na tarihi kawai don faɗakar da ƙugiyar ƙirƙira.

Maimaita gudu yana murƙushe jadawalin da ba a fihirisa ba ta na'ura da samfurin zane. Ana duba zane-zanen da aka fihirisa ta na'ura, tambayar bayanai, nau'in zane, da fihirisa. Wannan yana hana ƙirƙirar kwafi a cikin gudu a jere; ba garantin aiki lokaci guda bane. Bincika jerin zane da bishiya bayan gudu, tare da saƙonnin log ɗin `AUTOM8` don zane-zanen da aka tsallake, bayanan da ba su da aiki, ko gazawar ƙirƙira.

Abu ɗaya an tsallake shi a hankali don rikitarwa: samfurin zane tare da filin da aka yiwa alama da za a iya soke shi (overridable) wanda ba shi da ƙimar asali bai cancanci aiki da kai ba. Gudu yana yin rajistar cewa ba a ƙara shi ba saboda filin da za a iya soke shi ba shi da tsoho, kuma yana ci gaba. Idan samfurin da kuke tsammani bai taɓa bayyana ba, wannan shine abu na farko da za a bincika. Duba [Samfura](/ha/concepts/templates/) don menene filin da za a iya soke shi.

## Tarkuna

**Kashe doka baya soke aikinta.** Baya cire zane-zane ko shigarwar bishiya da aka riga aka ƙirƙira. Share na'ura yana da zane daban da halayyar tsaftace tushen bayanai; duba zaɓuɓɓukan sharewa kafin cire na'ura.

**Binciken da aka kashe yayi kama da mai tsabta.** Ƙayyadadden lokacin gudu yana ƙare binciken duk inda ya kai. Jimillar da aka rubuta sune jimillar aikin da aka gama, kuma babu abin da ke nuna sakamakon a matsayin wani ɓangare. Kwatanta adadin adiresoshin da aka bincika akan girman kewayon.

**Dokoki suna aiki akan ma'ajiyar tambayar bayanai, ba na'urar ba.** Dokar zane wacce ba ta dace da komai ba sau da yawa tana nufin tambayar bayanan ba ta taɓa gudana ba, ko kuma ta gudana kuma ba ta sami fihirisa ba. Duba teburin fihirisa da aka gano kafin sake rubuta dokar.

**Wasiƙar sanarwa ta ƙunshi abubuwan da aka gano a yanzu da sababbi.** Kewayon na iya aika wasiƙa idan ya ƙare, tare da haɗa abubuwan binciken da aka yi rikodin su ta hanyar ko kowane IP ya bayyana a cikin hoton kafin binciken. Wannan ba tabbaci bane cewa an bincika kowane adireshi da aka nema.

## Hanyoyin gazawa

| Alama | Dalilin da aka saba |
|---|---|
| Binciken bai sami komai ba akan kewayon da ke da yawa | An toshe Ping, gazawar SNMP, keɓancewa, ko murƙushe kwafi |
| Kewayon ya ƙi yin bincike, kuskure a cikin rajista | Babu saitin zaɓuɓɓukan SNMP da aka haɗa da shi |
| An sami na'urori amma ba a ƙirƙiri ko ɗaya ba | An kashe maɓallin ƙirƙira, ko kuma babu dokar na'ura da ta dace |
| Komai yana samun samfuri na gama-gari ɗaya | Tsarin doka, tare da doka ta gabaɗaya sama da takamaiman |
| Wasu adireshi kawai aka bincika | An kai iyakar gudu, ko kuma kewayon da ke haɗuwa sun ƙi rukunin adireshi |
| Na'ura ɗaya a kowace na'ura mai ba da hanya tsakanin hanyoyin sadarwa maimakon ɗaya a kowace fuska, ko akasin haka | Saitin murƙushe kwafi na sysName guda ɗaya |
| Doka ba ta dace da komai ba kuma rajistar tana gargaɗi game da shafi | Dokar tana tace filin da tambayar bayanan wannan na'urar ba ta dawo da shi ba |
| Ba a taɓa ƙirƙirar samfurin zane ta hanyar doka ba | Rashin tsoho da ake buƙata, fitarwar tushen bayanai mara inganci, ko gazawar ƙirƙira |
| Zane-zane marasa tsammani don ƙarin musaya | Matatar fihirisar jadawali ba kowa ko ta fi fadi fiye da yadda aka zata |
| Sabuwar dokar bishiya ba ta sanya zane-zanen da ke akwai ba | CLI ba ta mayar da dokokin ganyen jadawali don jadawalin da ke akwai ba |
