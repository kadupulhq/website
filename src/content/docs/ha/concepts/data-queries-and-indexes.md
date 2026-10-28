---
title: Tambayoyin bayanai da fihirisai
description: Yadda yawo ɗaya na na'ura yake zama maɓuɓɓukan bayanai da yawa, ainihin abin da fihirisa take, da kuma abin da ke faruwa lokacin da na'ura ta sake lambar kanta.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 5
---

Mabubbugar bayanai ta yau da kullun tana buƙatar ku san abin da kuke aunawa kafin ku daidaita ta.
Wannan yana aiki don matsakaicin nauyin tsarin (load average). Ba ya aiki don tashoshin switch, diski,
na'urori masu auna zafin jiki, ko injunan kama-da-wane, saboda jerin yana canzawa kuma ba ku da ikon sarrafa shi.

Tambayar bayanai tana gano abubuwan da ke akwai. Ƙirƙirar zane — ko dai da hannu ko ta hanyar aiki
ta atomatik da aka tsara — yana zaɓar waɗanne abubuwa ne ke samun maɓuɓɓukan bayanai; gudanar da tambaya
kaɗai ba ya ƙirƙirar kowane zane mai yiwuwa.

## Abin da ma'anar tambaya ta ƙunsa

Tambayar bayanai bayanin XML ne mai sassa uku: inda jerin abubuwan suke, abin da za a karanta game
da kowannensu, da kuma yadda za a yanke shawarar wanne abu ne wanne.

Tambayar musaya da ke zuwa tare da Kadupul ita ce misali mai aiki. Tana yawo a kan
`.1.3.6.1.2.1.2.2.1.1` don ƙidaya musaya, sannan tana karanta jerin filayen da aka ambata a kowane
matsayi da aka dawo da shi. Kowane fili yana bayyana alkibla (direction).

| Alkibla | Ma'ana | Misalan musaya |
|---|---|---|
| `input` | Karanta don ganowa da sanya suna. Ba a tattara shi cikin lokaci ba | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Ƙimar da ta dace a tattara kowace zagaye | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Duka biyun | `ifOperStatus`, `ifAdminStatus` |

Filaye kuma suna bayyana yadda za a karanta ƙimar. Mafi yawa suna ɗaukar ta yadda take; wasu suna amfani
da magana ta yau da kullun (regular expression) don ciro lamba daga ƙidayar SNMP, wasu kuma suna buƙatar
a fassara ƙimar azaman rubutu maimakon ɗanyen bytes.

Gudanar da tambayar yana adana jere ɗaya kowace fihirisa kowane fili: na'urar, tambayar, sunan filin,
ƙimar, da matsayin da ƙimar ta fito. Wannan tebur shine amsar "menene wannan na'urar ke da shi", wanda
ake ajiyewa a kache har zuwa gudu na gaba. Zaɓin zane yana amfani da wannan kache, amma kayan aikin
ƙirƙirar zane na iya haɗawa ko sake gudanar da tambaya. Bincika sakamakon ganowa kafin ƙara zane-zane.

## Fihirisa matsala ce ta asali

Matsayi a cikin teburin SNMP ba suna bane. Lambar rami (slot) ce da wakili ke bayarwa, kuma wakilai
suna sake tsara ramummuka bayan sake kunnawa, sake saka katin, haɓaka firmware, ko canjin sanyi wanda ke
cire musaya. Idan maɓuɓɓugar bayanai ta tuna kawai "rami 3", ranar da rami 3 ya zama tashar daban ita ce
ranar da tarihin watanni uku zai manne a hankali ga abin da ba daidai ba.

Kadupul yana adana nau'in fihirisa da ƙimar tantancewa, tare da fihirisar SNMP da aka warware a halin yanzu.
Sake fihirisa yana amfani da wannan asalin don bincika matsayin tebur na yanzu; nau'ikan fihirisa da aka
sake rubutawa da hannu suna da sarrafawa daban.

A kowane gudu na tambayar tana neman ramin yanzu don ƙimar wannan filin.

| Sakamako | Abin da ke faruwa |
|---|---|
| Ramin iri ɗaya | Babu abin yi |
| Ramin daban | Ana sake tsara maɓuɓɓugar bayanai zuwa sabon rami, kuma zane-zanenta suna biye |
| Ƙimar ba ta nan kuma | Kula da marayu ya dogara da tambaya da hanyar lambar; tabbatar da tutar da ta haifar da OIDs na zaɓe maimakon zaton an dakatar da tarawa |

Sake fihirisa yawanci yana kiyaye maɓuɓɓugar bayanai da tarihin da yake da shi. Zaɓin `index_transient`
yana ɗaukar bayanan da suka ɓace azaman abin da ake tsammani kuma yana tsallake alamar maraya ta yau da kullun.
`index_orphan_removal` yana cire shigarwar zaɓe da abin ya shafa da fitowar Boost; ba ya share maɓuɓɓugar
bayanai ko fayil ɗin RRD da kansa.

Sarrafa marayu na yanzu yana da aibi: lokacin da ainihi ya ɓace kuma babu wani tushe da ya canza fihirisa,
reshe mara canji zai iya sake share tutar maraya yayin barin fihirisar da ta gabata da OIDs na zaɓe a wurin.
Kada ku dogara ga ɓoye marayu ta atomatik don hana tarawa daga fihirisar tashar jiragen ruwa da aka sake amfani da ita.
Tabbatar da asalin da aka adana akan bayanan ganowa kuma kashe maɓuɓɓugar bayanan da abin ya shafa har sai an warware.

## Zaɓar filin da za a yi amfani da shi azaman maɓalli

Ba kowane fili bane ke yin maɓalli mai amfani ba. Ma'anar tambayar tana ba da jerin abubuwan da aka fi so,
kuma Kadupul yana tafiya a kansa kuma yana ɗaukar ɗan takara na farko wanda ya tsira daga jerin bincike.

| Bincike | Dalilin da ya sa yake nan |
|---|---|
| Filin `input` ne ko `input-output` | Dole ne a sami filayen tantancewa a cikin ganowa |
| Babu fihirisai biyu da ke raba ƙima ɗaya | Maɓallin kwafi ba zai iya gano jere ɗaya ba |
| Adadin ƙididdiga daban-daban yayi daidai da adadin fihirisai | Yana ƙin ɗaukar 'yan takara marasa cika |

Waɗannan binciken suna da keɓancewa: ana dawo da ɗan takara guda ɗaya da aka ayyana kai tsaye, kuma ana karɓar
ɗanyen OID na fihirisa daban. `index_type=nonunique` yana tsallake ƙin yarda da kwafi amma ba ya tsallake
binciken ƙidayar ƙimar daban-daban. Bincika filin da aka zaɓa da ƙimomin da aka ajiye; lakabin nau'in XML
kaɗai ba tabbacin tabbatarwa bane.

Tambayar musaya ta fi son `ifName`, sannan `ifDescr`, sannan adireshin hardware, sannan ɗanyen fihirisa.
Wannan tsari na da gangan ne. `ifName` gajere ne kuma tabbatacce a kan mafi yawan dandamali. `ifDescr` yana
da ƙarfi amma wani lokacin yana ɗaukar lambar rami a cikin rubutun, wanda ke kayar da manufar. Ɗanyen fihirisa
shine na ƙarshe saboda amfani da shi azaman maɓalli kusan ba shi da kyau fiye da rashin maɓalli kwata-kwata.

Ga ɓangaren da ke kama mutane da mamaki. Ana yin zaɓin kowace na'ura kowace gudu, daga bayanan na'urar na yanzu.
Ƙimar kache da ta ɓace ko sunaye masu kwafi na iya sa `ifName` ya zama mara dacewa kuma ya haifar da komawa
ga `ifDescr`. Filin da babu komai ba ya tabbatar da kansa wane bincike ya gaza; bincika ainihin layukan ganowa.
Sauye-sauye guda biyu masu kama da juna na iya ƙarewa da maɓalli a kan filaye daban-daban, kuma na'ura na iya
canza filin da take amfani da shi tsakanin gudu. Kadupul yana shigar da gargaɗi lokacin da filin da aka zaɓa
ya canza, saboda wannan shine lokacin da kuskuren sake tsara taswira zai yiwu.

Filin da aka zaɓa yawanci yana kiran zane-zane, ta hanyar tsarin take wanda ke yin nuni da shi. Idan lakabin
zanenku ya canza hali a cikin rukunin na'urorinku, filin jera shi ne inda za a duba.

## Gano cewa ana buƙatar sake fihirisa

Sake gudanar da tambayar bayanai a kan kowace na'ura a kowane zagaye zai yi tsada kuma galibi ba shi da ma'ana,
tunda yawancin na'urori ba sa sake lamba na tsawon shekaru. Maimakon haka kowace na'ura da tambaya suna ɗaukar
hanyar sake fihirisa, wanda tabbaci ne mai arha wanda ake dubawa yayin tattarawa na yau da kullun. Lokacin da
tabbacin ya gaza, ana sanya sake fihirisa a cikin jerin gwano.

| Hanya | Abin da take bincika | Iyaka da farashi |
|---|---|---|
| Babu (None) | Babu tabbatarwa ta atomatik | Dole ne sake gudanar da tambaya ya fito daga aikin hannu ko wani aiki na daban |
| Lokacin aiki (Uptime) | Lokacin aiki bai koma baya ba | Yana buƙatar SNMP mai amfani; yana rasa canje-canje ba tare da jujjuyawar lokacin aiki ba |
| Ƙididdigar Fihirisa (Index Count) | Ƙididdigar yanzu ta yi daidai da fihirisar da aka adana | OID mai ƙididdigewa na iya zama mai arha; ba tare da shi ba aiwatarwa yana ƙidaya sakamakon yawo ko rubutun. Canje-canje iri ɗaya za a iya rasa su |
| Tabbatar da Duka (Verify All) | Sanannun ƙimomin maɓalli har yanzu suna daidai a fihirisarsu da aka ajiye | Aiki yana ƙaruwa tare da saitin da aka ajiye; ba ya ba da tabbacin gano sabbin fihirisa da aka ƙara ko canje-canjen ma'ana da ke kiyaye waɗancan ƙimomin |

"Tabbatar da Duka" yana bincika tabbaci yayin zaɓe; ba ya sake gudanar da dukkan tambayar ganowa ba tare da
sharadi ba a kowane zagaye. Auna farashinsa a kan wakilan na'urori kafin amfani da yawa. Lokacin aiki tsoho
ne na kowa, amma ba ya ba da tabbaci lokacin da aka kashe SNMP. Ma'anar tambayar na iya samar da nata lokacin
aiki ko tushen ƙidaya.

## Sake fihirisa ba ya faruwa a lokaci ɗaya (asynchronous)

Tabbacin da ya gaza ba ya sake fihirisa a take. Yana rubuta umarni, kuma wucewa daban bayan zagayowar tattarawa
tana ɗaukar wannan umarnin kuma tana sake gudanar da tambayar. Tasirin aiki yana da kyau a kiyaye a rai.

Zagayowar ganowa na iya amfani da tsohuwar kache, don haka ƙima na iya sauka a kan jerin da ba daidai ba
kafin a sake yin fihirisa. Danniyar ƙaruwa mai alaƙa da lokacin aiki yana maye gurbin fitowar ƙima ɗaya tare
da wanda ba a sani ba lokacin da aka saita tutarsa; ba garantin bane ga duk fitarwa mai ƙima ko kowane canjin fihirisa.

Sake fihirisa ba zai gudana a kan na'urar da ke ƙasa ko aka kashe ba. Na'urar da ta sake yin lamba yayin da
ba za a iya samun ta ba har yanzu tana buƙatar tabbaci ko sake gudu a sarari bayan ta zama mai sauƙin shiga.
Zaɓen nasara na farko kaɗai ba ya tabbatar da cewa an gama sake tsara taswira ba. `--force` ba ya soke
binciken ƙasa/kashewa.

Da zarar an sake gudanar da tambayar, maɓuɓɓukan bayanan da suka motsa suna samun sake rubuta bayanan kache
ɗin su na poller, wanda shine ainihin abin da ke karkatar da tarin bayanai. Wannan inji shine
[Ma'ajiyar poller](/ha/concepts/the-poller-cache/), kuma sake gudanar da tambaya shine ɗayan ƴan abubuwan
da ke kiyaye ta ta atomatik.

Don ɓangaren aiki — ƙara tambaya zuwa na'ura da karanta sakamakon —, duba [Kula da switch](/ha/guides/monitor-a-switch/).
