---
title: Kula da na'urori masu auna muhalli
description: Yi zane na zafin jiki, zafi, kwararar iska, ƙarfi da yanayin UPS akan SNMP, nemo madaidaitan OIDs akan MIB na mai siyarwa, kuma ba da saitunan zane na karantawa waɗanda suka dace da ma'auni maimakon counter.
banner:
  content: Kadupul na matakin farko na gwaji (pre-alpha). Tabbatar da waɗannan matakan a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne da ke jiran bita daga ƙwararren mai magana da yaren.
sidebar:
  order: 23
---

:::caution[Tabbatar kafin amfani]
Ana samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura mai goyan baya. Gwada waɗannan matakan akan keɓantaccen kwafi tare da ajiye bayanan sirri kafin dogara da su. Duba [matsayin aiki](/ha/project/status/).
:::

Zazzabi, zafi da ƙarfin nan take ma'auni ne, yawanci ana adana su azaman `GAUGE`. Ƙarfin da aka tara ko jimlar abubuwan da suka faru na iya buƙatar nau'in counter a maimakon haka. Bincika raka'a na kowane abu, ainihi da ma'ana kafin zabar samfuri.

Bincika abin da ya riga ya shigo kafin ku rubuta wani abu.

## Abin da ke zuwa

Ma'anar tambayar bayanai guda huɗu kawai suna rayuwa a cikin babban fayil ɗin tambayar bishiyar kanta, kuma babu ɗayansu da ya shafi muhalli.

| Tambayar SNMP da aka aiko | Abin da take rufe |
|---|---|
| `interface.xml` | Hanyoyin sadarwar yanar gizo |
| `host_disk.xml` | Host Resources ajiya |
| `net-snmp_disk.xml` | Ɓangarorin da aka ayyana UCD |
| `net-snmp_devio.xml` | UCD toshe na'urar I/O |

Ɗaukar hoto yana zuwa ta wasu hanyoyi guda biyu.

**Tambayoyin uwar garken rubutu, an haɗa su a cikin fakitin na'urar Net-SNMP.** Shigo da `install/templates/NetSNMP_Device.xml.gz` don tura fayilolin XML na tambayar lmSensors guda uku a ƙarƙashin `resource/script_server/`. Mataimaki `scripts/ss_netsnmp_lmsensors.php` shima yana wanzuwa a cikin duba tushen.

| Tambaya | Tebur |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Mataimaki yana amfani da fihirisa, suna da ginshiƙan karantawa. Tambayar tana fihirisa akan lambobi `sensorDevice`; `sensorName` yana ba da sunan nuni wanda mataimaki ya rage zuwa haruffa 18. Sunaye ba su da garantin asalin na'urar firikwensin ta musamman.

Hanya ta al'ada `get sensorReading` tana dawo da danyen ƙima: millidegrees don tsohon abin zafin jiki, millivolts don ƙarfin lantarki, da RPM don magoya baya. Jadawalin zafi yana amfani da CDEF na `Divide by 1000`. Jadawalin wutar lantarki ba shi da CDEF duk da lakabin Volts, [kuskuren sikelin da aka tabbatar](https://github.com/kadupulhq/kadupul/issues/247).

Hanya daban `query sensorReading` tana sikelin zafin jiki da ƙarfin lantarki, kuma yana ƙoƙarin jujjuyawar ƙarfin lantarki da aka sanya hannu ta amfani da madaidaicin madaidaicin 4294967294. Hakanan yana iya [jefa togiya akan karatun da babu shi](https://github.com/kadupulhq/kadupul/issues/248). Kada ku yanke shawarar raka'o'in da aka adana daga wannan fitowar binciken.

Mataimaki har yanzu yana amfani da tsohon shafi na zafin jiki `.2.1.3`. Na yanzu na sama [LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt) ya ƙi wannan abin da ba a sanya hannu ba don fifita shafi da aka sanya hannu `.2.1.4`; tabbatar da tallafi da halayen zafin jiki mara kyau akan ainihin wakili kafin daidaita samfuri.

**Fakitin na'urori, ana jigilar su azaman ma'ajiyar da za a iya shigo da su.** Da yawa suna ɗaukar tambayar XML ta kansu kuma suna rubuta ta a cikin kundayen tambayoyin a lokacin shigo da kaya. Wadanda ke da mahimmanci a nan:

| Kunshin | Yana kawo |
|---|---|
| SNMP UPS | Tambayoyin layin shigarwa da fitarwa na UPS-MIB, tare da kafaffun samfuran OID don baturi, lokacin aiki, zazzabi da ƙararrawa |
| AKCP Device | Tambayoyin rubutun don zafin jiki, zafi, kwararar iska da na'urori masu auna 4-20 mA |
| APC InfraStruXure PDU | Tambayoyi don ƙididdigar breaker da phase |
| APC InfraStruXure InRow CRAC | Tambayoyi don ƙididdigar naúrar da rukuni, gami da yanayin zafi, zafi, kwararar iska da saurin fanka |
| BayTech PDU | Tambayar kanti da tambayar da'irar matakai uku, tare da na yanzu, ƙarfin lantarki, ƙarfi da zafin jiki |

Bincika fakitin da ya dace kafin rubuta tambaya da hannu. Bi [Shigo da fitar da samfura](/ha/guides/import-and-export-templates/), tabbatar da tura fayil da bincike, sannan ƙirƙira zane-zanen da ake so a bayyane. Kasancewar kunshin baya tabbatar da dacewar na'urar ko madaidaicin sikelin; lahani na UPS da lmSensors a ƙasa suna buƙatar kulawa.

## Siffofin biyu da firikwensin ke ɗauka

Don tarin SNMP, bambanta abubuwan scalar daga abubuwan da suka faru na tebur.

**Kafaffen OID.** Ƙimar ma'auni ɗaya a adireshi ɗaya, adireshi ɗaya akan kowace na'ura ta wannan nau'in. Zazzabin baturi. Jimillar ƙarfin fitarwa. Yi amfani da kafaffen tushen bayanan OID: SNMP get akan ainihin OID, da tushen bayanai ɗaya a kowane karatu.

**Tebur.** Adadin karatun da ba a sani ba da aka gano a kowace na'ura. Binciken tara, tube kanti, ma'aunin kowane mataki. Yi amfani da tambayar bayanai, wanda ke tafiya a teburin, yana koyon fihirisa, kuma yana ba ku damar zaɓar waɗanne layuka sun zama zane-zane.

Kunshin UPS da aka aika yana amfani da duka biyun. Bi tsarin abin MIB: na'urar da ke da bincike guda ɗaya kawai na iya ci gaba da fallasa shi azaman layin tebur mai fihirisa.

| Karatun UPS | Siffa | OID |
|---|---|---|
| Zazzabin baturi | Kafaffe | `.1.3.6.1.2.1.33.1.2.7.0` |
| Kimanin lokacin aiki da ya rage | Kafaffe | `.1.3.6.1.2.1.33.1.2.3.0` |
| Lokaci akan baturi | Kafaffe | `.1.3.6.1.2.1.33.1.2.2.0` |
| Karfin baturi | Kafaffe | `.1.3.6.1.2.1.33.1.2.5.0` |
| Ƙararrawa da ke akwai | Kafaffe | `.1.3.6.1.2.1.33.1.6.1.0` |
| Ƙarfin shigarwa, na yanzu, ƙarfi, mita | Tambaya | `.1.3.6.1.2.1.33.1.3.3.1` |
| Ƙarfin fitarwa, na yanzu, ƙarfi, lodi | Tambaya | `.1.3.6.1.2.1.33.1.4.4.1` |

Kowane ɗayan waɗannan hanyoyin bayanan shine `GAUGE`. Babu wani counter. Rumbun samfurin da aka aika yana bayyana matakin daƙiƙa 60 da bugun zuciya na daƙiƙa 600, mafi ƙarancin sifili, kuma babu matsakaicin, sai dai zafin jiki, wanda ba shi da ƙaranci. Bincika bayanin martaba da aka shigo da shi da ainihin tsarin RRD; waɗannan sanarwar ba sa kafa tsarin jefa ƙuri'a mai gudana. Karatun mara kyau mai aiki kuma yana buƙatar axis ɗin jadawali wanda ke nuna shi.

## Nemo OIDs

Yi tafiya a cikin na'urar kafin ku rubuta wani abu. Kuna neman abubuwa uku: teburin karantawa, tebur mai kama da lakabi, da duk wani mai yawaitawa da mai siyarwa ya zaɓa, tare da abubuwan inganci/matsayi inda akwai.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Sauya misalin mai masaukin baki da al'umma tare da ƙimar da aka saita kuma gudanar da bincike daga mai jefa ƙuri'a. Loda MIB mai dacewa da abubuwan dogaro don duba sunaye, raka'a da ma'ana; takaddun abin mai siyarwa na iya bayyana lambobi OIDs. Matsakaicin kusa ko lambar matsayi ba za a iya musanya shi da awo ba.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

Ma'anar MIB shine inda aka rubuta sikelin. Mai siyarwa wanda ke ba da rahoton kashi ɗaya bisa goma na digiri zai faɗi haka a cikin bayanin abin ko sashin raka'a, da kuma cikin takaddun mai siyarwa masu alaƙa. Tsammani daga karatu ɗaya na iya juya digiri 23.5 zuwa jadawalin 235.

Standard MIBs yana rufe fiye da yadda mutane ke tsammani. UPS-MIB a `.1.3.6.1.2.1.33` ya zama ruwan dare a tsakanin masu siyarwa. ENTITY-SENSOR-MIB yana ba da ƙimar firikwensin tare da sikelin kansa da filayen daidaitattun kusa da shi. Bincika waɗannan kafin isa ga ƙaramin bishiyar kasuwanci.

Kwatanta bincike a cikin sake kunna wakilci da canje-canjen bincike a cikin shigarwar gwaji. Tafiya biyu da ba a canza su ba kaɗai ba sa tabbatar da daidaiton fihirisa. Yi rikodin tsayayyen bayanan firikwensin inda akwai kafin ƙirƙirar zane-zane masu rai.

## Gina tushen bayanai na OID mai tsayayye

Firikwensin OID mai tsayayye yana buƙatar samfurin bayanai ta amfani da shigarwar bayanan SNMP get, tare da OID a matsayin ƙimar zahiri da abu ɗaya na tushen bayanai a ciki. Saita nau'in zuwa `GAUGE`, ba da mafi ƙarancin ƙima na gaske kawai lokacin da firikwensin ba zai iya tafiya ƙasa da shi ba, kuma bar mafi girman ba a bayyana shi ba sai dai idan mai siyarwa ya rubuta rufi.

Ƙimar da ke wajen iyakokin tushen bayanan RRD ta zama ba a sani ba. Saita waɗannan iyakokin a cikin ɗanyen raka'o'in da aka adana, ba raka'o'in jadawali da aka canza ba; in ba haka ba ingantaccen karatu na iya ɓacewa kafin a yi amfani da nunin CDEF.

## Gina tambayar bayanai

Tambaya tana buƙatar fihirisar OID, hanya don juya kowane OID da aka yi tafiya zuwa fihirisa, da fili ɗaya a kowane shafi da kuke so.

Tambayar fitarwa ta UPS gajeriyar misali ce mai aiki. Yana fihirisa akan teburin layi, yana fassara fihirisa daga ƙarshen kowane OID da aka dawo tare da magana ta yau da kullun, kuma yana bayyana filin shigarwa ɗaya don fihirisa da filayen fitarwa huɗu don ƙarfin lantarki, na yanzu, ƙarfi da lodi. Ma'anar fitarwa sun haɗa da hanya, tushe, shugabanci da OID na shafi. OID na shafi na iya zama ingantaccen tushen fihirisar tafiya; daidaita mai fassarar tambaya da ainihin OIDs da aka dawo dasu shine abin da ke da mahimmanci. Duba [Tambayoyin bayanai da fihirisa](/ha/concepts/data-queries-and-indexes/) don yadda aka zaɓi fihirisa da adana shi.

Zaɓi hanyar sake fihirisa da gangan. Zaɓuɓɓukan babu su, a kan lokacin aiki yana tafiya baya, akan ƙididdigar fihirisa yana canzawa, da Tabbatar da Duk Filaye. Teburan firikwensin sune yanayin da hanyoyi masu rauni suka gaza: cire bincike ɗaya daga naúrar tara kuma toshe wani, kuma ƙididdigar bazai canza ba yayin da kowane karatu a bayan fihirisar yanzu na firikwensin daban ne. Cikakken tabbaci yana biyan aikin SNMP a kowane sake zagayowar. Tabbatar da filayen ainihi waɗanda tambayar zata iya dubawa: fihirisar lambobi da ba a canza ba ko kwafi/lakabi da aka yanke ba za su iya tabbatar da cewa binciken jiki ɗaya ne ba. Sabunta bincike kuma duba ƙungiyoyin zane bayan canji.

## Auna ƙimar

Yanke shawarar inda canjin zai faru, kuma sanya shi a wuri ɗaya kawai.

| Ina | Yaushe za a yi amfani da shi |
|---|---|
| A cikin rubutun tarin | Yi amfani da kwangilar mai tarawa da aka rubuta; lmSensors get a halin yanzu yana dawo da ɗanyen raka'a |
| A cikin CDEF akan abun zane | Ɗanyen ƙimar ya cancanci adanawa, kuma sashin nuni zaɓi ne na gabatarwa |

CDEF ita ce amsar da aka saba ga mai yawaita na mai siyarwa. Fakitin da aka aika suna ɗauke da ma'anoni kamar `Divide By 10`, wanda aka gina daga tushen bayanan yanzu, `10`, da rarraba. Aiwatar da su kawai ga abubuwa masu dacewa da ɗanyen naúrar.

Kunshin UPS yana da [CDEFs marasa daidai na ƙarfi da lokaci](https://github.com/kadupulhq/kadupul/issues/249): jerin On Battery yana raba daƙiƙa da 6000 maimakon 60, kuma shigarwar/fitarwa na Watts yana raba watts da 10. Ga wakili mai daidaitawa, daƙiƙa 600 ya kamata ya nuna azaman mintuna 10 kuma watts 1000 azaman watts 1000. Ƙarfin baturi da layin na yanzu suna buƙatar rarraba ta 10; ƙiyasin lokacin aiki ya riga ya zama mintuna. Duba [Raka'o'in abu na UPS na RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Ajiye danyen karatu da rarraba akan jadawali yana sa fayil ɗin RRD ya kasance mai gaskiya kuma yana ba ku damar gyara mai ninka nuni ba tare da sake rubuta tarihin ɗanye ba, muddin samfuran sun tsira daga iyakokin tushen bayanai da riƙewa. Juyawa ta gefen mai tarawa yana canza sashin da aka adana kuma yana iya jefar da daidaito; rubuta shi. Bai kamata a gabatar da danyen karatu da ba a bayyana ba azaman sashin aikin injiniya da aka tabbatar.

Kada a yi amfani da jujjuyawar sau biyu. CDEF akan jadawali wanda rubutunsa ya riga ya auna ƙimar na iya haifar da karatu mai ma'ana amma ba daidai ba.

## Ba shi saitunan zane waɗanda suka dace da ma'auni

Zaɓi saitunan ma'aunin maimakon kwafin tsoffin abubuwan zirga-zirga a makance.

| Saiti | Zirga-zirga | Firikwensin |
|---|---|---|
| Nau'in tushen bayanai | `COUNTER` | `GAUGE` |
| Ƙimar tushe | 1000, don haka axis yana karantawa a cikin k da M | Har yanzu 1000, amma prefix ba shi da ma'ana akan digiri |
| Sikeli na atomatik | Ana so, tunda kewayon ba a sani ba | Yawanci ba a so, tunda an san kewayon |
| Iyakar sama da ƙasa | Ya dogara da yanayin sikelin atomatik | Zaɓi kewayon da ake iya gani mai amfani |

Saita madaidaicin iyaka na sama da ƙasa da lakabi na tsaye wanda ke sanya ainihin naúrar. Jadawalin zafin jiki na UPS da aka aika yana yin haka: ƙananan iyaka na 0, babban iyaka na 100, da `C` a matsayin lakabi na tsaye.

Zaɓin sikelin atomatik saiti ne na zaɓuɓɓuka, ba maɓalli ba. Wannan jadawalin zafin jiki da aka aika yana amfani da ƙananan iyaka tare da `--alt-autoscale-max`; baya wuce babban iyakar da aka adana na 100. Ba tare da tsauraran iyakoki ba, karatun da ba shi da iyaka na iya faɗaɗa iyakar da aka wuce. Iyakar da aka saita ba a liƙe ta atomatik. Zaɓi bambance-bambancen da ke kiyaye iyakar da kuke kulawa da ita:

| Zaɓi | Tasiri |
|---|---|
| Sikeli na atomatik yana watsi da iyakoki | Dukansu iyakar suna iyo. Yi amfani lokacin da ba ku da masaniya game da kewayon |
| Sikeli na atomatik yana karɓar ƙananan iyaka | Yana wuce ƙananan iyaka; matsakaicin yana bin bayanai |
| Sikeli na atomatik yana karɓar babban iyaka | Yana wuce babban iyaka; mafi ƙarancin yana bin bayanai |
| Sikeli na atomatik tare da duka iyakoki | Yana wuce duka iyakoki; faɗaɗa har yanzu ya dogara da yanayin tsauri |

Akwai kuma zaɓin iyakoki masu tsauri wanda ke dakatar da faɗaɗa axis lokacin da ƙima ta faɗi a wajen iyakokin da kuka saita. Kunna shi lokacin da kafaffen axis ya fi mahimmanci fiye da ganin balaguron, kuma bar shi a kashe lokacin da ba haka ba, saboda tsattsauran jadawali na iya datse balaguro a wajen kewayon da aka nuna. Wannan baya share samfurin da aka adana. Duba [RRDtool jadawali iyakokin tunani](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Don digiri ko kashi inda prefixes na SI zai rufe masu karatu, la'akari da ma'aunin raka'a na 0. Base 1000 yana sarrafa matakan prefix; baya kashe prefixes da kansa ko canza raka'o'in ma'auni.

### Haɗawa ya fi mahimmanci anan fiye da kan zirga-zirga

Kwamfutar mu'amala da aka daidaita akan sa'a ɗaya har yanzu tana gaya muku kusan abin da ya faru. Zazzabi da aka daidaita akan sa'a ɗaya yana ɓoye balaguron mintuna goma da ke da mahimmanci. Tabbatar cewa bayanin martaba na ajiya a bayan waɗannan tushen bayanan yana kiyaye ma'ajiyar `MAX`, kuma saita jerin da aka tsara don karanta madaidaicin haɗin `MAX`. Matsakaicin labari akan jerin `AVERAGE` baya dawo da ainihin kololuwa.

Ko da ma'ajiyar MAX tana adana kololuwa ne kawai da aka wakilta a cikin samfuran da aka tattara; ba zai iya dawo da balaguro tsakanin jefa ƙuri'a ko ƙimar da aka ƙi kafin ajiya ba. Duba [Sarrafa riƙewar bayanai](/ha/guides/manage-data-retention/) da [Tushen bayanai da ma'ajiya](/ha/concepts/data-sources-and-rras/).

## Lokacin da babu MIB da ya cancanci amfani da shi

Yawancin kayan aikin muhalli suna magana da Modbus, yarjejeniya ta serial, ko HTTP API, kuma wakilinsa na SNMP baya fallasa wani abu mai amfani. Waɗannan suna buƙatar shigar da bayanan rubutun. Rubutun yana gudana akan mai masaukin baki, ba akan na'urar ba, kuma isa ga na'urar shine matsalar rubutun. Duba [Rubuta rubutun tattara bayanai](/ha/guides/write-a-data-collection-script/) don kwangilar fitarwa.

Koma `U` maimakon `0` lokacin da ba za a iya isa ga firikwensin ba. Binciken da ya tafi layi ba bincike ba ne mai karanta sifili digiri.

## Hanyoyin gazawa

| Alama | Dalilin da aka saba |
|---|---|
| Zazzabi da aka zana azaman lamba sau goma ko ɗari da girma | Ba a raba mai yawa na mai siyarwa ba |
| Zazzabi da aka zana sau goma ƙanana | Rarraba sau biyu, sau ɗaya a cikin rubutun kuma sau ɗaya a cikin CDEF |
| Titin dogo na ƙarfin lantarki yana karantawa azaman biliyoyi | Lambar SNMP mara sa hannu wacce ke riƙe da ƙimar mara kyau, ba a gyara ba |
| Zane-zanen firikwensin suna zama daidai bayan an canza bincike | Teburin ya sake fihirisa kuma tushen bayanan yanzu yana nuni zuwa wani firikwensin daban |
| Karatun da ke sama da kofa yana bayyana azaman gibi | An saita matsakaicin akan tushen bayanai kuma ainihin ƙimar sun wuce shi |
| Axis mai lakabin k ko M akan karatun digiri | Ƙimar tushe da saitunan naúrar da aka gada daga samfurin zirga-zirga |
| Balaguro baya iya gani akan kallon mako | Bincika zaɓaɓɓen haɗin kai, ƙuduri da aka riƙe, tazarar jefa ƙuri'a da samfuran da aka ƙi |
| Tambaya ba ta mayar da fihirisa ba | Bincika OIDs da aka dawo, wasannin parser, ƙuntatawa na samun dama da tallafin abu; tushen shafi na iya zama mai aiki |
| Tambayoyin lmSensors ba su sami komai ba akan mai masaukin Linux | Bincika tallafin wakili, samun dama, fallasa layuka na firikwensin da ainihin kurakuran SNMP |
