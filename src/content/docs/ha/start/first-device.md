---
title: "Ƙara na’ura ta farko"
description: "Fara karɓar bayanan na’ura ɗaya, kuma tabbatar da cewa bayanan suna zuwa kafin ka gina wani abu a kansa."
sidebar:
  order: 3
banner:
  content: "Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen."
---

Ƙara na’ura ɗaya, tabbatar da cewa tana amsawa, sannan ka ci gaba. Yawancin matsaloli tare da tsarin sa ido suna samo asali ne daga na’urar da ba ta taɓa amsawa da kyau ba tun asali.

Zaɓi na’urar da ba za ka damu ba idan an samu kuskure a kanta. Switch ɗin da kake da shi, a kan hanyar sadarwa da kake iko da ita, tare da kunna SNMP a kanta a shirye. Kada ka fara da na’urar da wani yake tambayarka a kanta.

## Kafin ka fara

Don wannan misali na SNMP, dole ne na’urar ta amsa tambayoyi daga mai karɓar bayananta (collector) da aka ware mata. Gudanar da binciken a kan wancan mai karɓar bayanan, zai fi kyau a matsayin mai amfani da poller; buƙata daga kwamfutarka na iya ɗaukar wata hanyar firewall ta daban. Maye gurbin adireshin misali da community da bayanan shaidar karantawa-kawai (read-only) da aka saita a na’urarka. Lambobin OID da ke ƙasa suna aiki ko da ba a shigar da fayilolin sunayen MIB na gida ba.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Idan hakan ya dawo da rubutun bayanin na’ura, ci gaba. Idan lokaci ya ƙare (timeout), gyara hakan da farko. Babu wani saiti a tsarin yanar gizo da zai sa na’urar da ba a iya samunta ta amsa.

Sannan bincika teburin da kake son zana jadawalinsa a zahiri, saboda na’ura na iya amsa `sysDescr` kuma ta ƙi amsa teburin interface.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

OID na biyu shi ne shafi na `ifDescr`. Kana buƙatar layi ɗaya ga kowane interface da aka fallasa. Sakamako mara komai na iya nufin takaitaccen kallon SNMP ko teburin da ba a tallafa masa ba; kuskuren izini yana nuni ga bayanan shaida ko ƙa’idojin shiga. Bincika kuskuren da aka dawo da shi kafin canza saitin na’ura ko na Kadupul.

Gaskiya biyu game da nau’ikan SNMP za su yanke shawarwari daga baya, saboda haka daidaita su yanzu.

| Nau’i | Abin da yake nufi a gare ka |
|---|---|
| v1 | Babu tallafin Counter64. Hanyoyin sadarwa masu sauri na iya wuce kima na ƙidayar octet mai 32-bit sau da yawa a tsakanin bincike (wrap), wanda ke sa ƙimar ta zama mara tabbas |
| v2c | Yana tallafawa Counter64 lokacin da wakili (agent) ya fallasa shi; ana tura kalmomin community a fili ba tare da ɓoyewa ba |
| v3 | Yana tallafawa tantancewa da ɓoye bayanan sirri tare da `authPriv`; zaɓar v3 kaɗai ba ya kunna duka biyun |

Gwammace v3 tare da `authPriv` inda ake tallafawa, ko v2c a kan hanyar sadarwa ta gudanarwa mai iyaka. Zaɓi nau’in jadawalin interface mai 64-bit da kuma nau’in SNMP. Idan na’urar tana magana ne kawai da v1, duba tazarar bincike da adadin zirga-zirga a teburin kuskure a ƙasan wannan shafin. [SNMP](/ha/reference/snmp/) ya ƙunshi bayanan filayen shaida cikakku.

## Yanke shawara a kan abubuwa uku kafin ka buɗe fom

**Bayanan shaida.** Daidai waɗanda ka gwada a sama, gami da port idan ba na asali ba ne.

**Hanyar tabbatar da samuwa.** Wannan ita ce yadda Kadupul ke yanke shawarar cewa na’urar tana aiki (up), kuma ba ta dogara a kan ko karɓar bayanai na aiki ba. Zaɓuɓɓukan da ke akwai su ne none, ping, SNMP uptime, SNMP description, SNMP getNext, da haɗe-haɗe guda biyu na ping tare da SNMP uptime, ɗaya yana buƙatar duka biyun ɗayan kuma yana karɓar kowane ɗayansu.

Gwammace hanyar SNMP ga na’urar da kake bincike ta SNMP. Tana gwada ainihin abin da ka dogara a kansa. ICMP ping yana buƙatar raw socket, wanda ke buƙatar gatan da masu amfani da yanar gizo da na poller ba su da shi a al’ada, don haka na’urar da ke amsa `ping` daga shafinka na iya zama an bayar da rahoton cewa tana ƙasa. Binciken TCP ping a kan port ɗin da ka san a buɗe yake yana magance wannan.

**Samfurin na’ura (Device template).** Zaɓi wanda ya dace da hardware.

## Ƙara na’urar

1. A tsohon shafin **Na’urori** (`host.php`), zaɓi **Add**. Ƙirƙirar na’ura da saita jadawali har yanzu suna amfani da wannan shafi yayin ƙaura zuwa Symfony. Shigar da bayani, sunan uwar garke ko adireshi, mai karɓar bayanai da aka ware, nau’in SNMP, da bayanan shaida.
2. Saita hanyar tabbatar da samuwa da ka zaɓa.
3. Zaɓi samfurin na’urar.
4. Adana, tabbatar da an kunna na’urar, kuma karanta allon samuwa/SNMP nata. Rikodin da aka adana a database ba shaida ba ce ta cewa karɓar bayanai ya yi nasara.

## Abin da samfurin na’ura ke yanke shawara a kai

Samfurin na’ura yana haɗa samfuran jadawali da tambayoyin bayanai tare da na’urar. Tambayar bayanai tana bincika teburi a kan na’urar, kamar interfaces nata, kuma tana samar da fihirisa (index) ɗaya a kowane layi. Aiwatar da samfurin yana kuma gudanar da tambayoyin bayanan sa don cika waɗancan fihirisa. Idan an kashe sarrafa jadawali ta atomatik, waɗannan haɗe-haɗen ba sa ƙirƙirar jadawali da kansu. Lokacin da aka kunna sarrafa jadawali ta atomatik, hooks na samfuri/tambaya na iya ƙirƙirar jadawali a ƙarƙashin ƙa’idoji masu dacewa; duba jadawalin da ke akwai kafin ƙara wani kwafin.

Canza samfuri na iya canza haɗin gwiwa tare da sake gudanar da waɗancan hooks. Wannan ba sake saita jadawalin da ke akwai ko hanyoyin bayanai ba ne. Bincika samfurin da aka zaɓa da fihirisan da aka bincika kafin amfani da shi ga na’urar da ke da tarihi a baya.

Waɗancan fihirisa su ne dalilin da ya sa kake zaɓar interfaces daga lissafi maimakon rubuta lambobin OID da hannu. [Samfura](/ha/concepts/templates/) da [Tambayoyin bayanai da ma’anonin lissafi](/ha/concepts/data-queries-and-indexes/) sun yi bayanin duka biyun sosai.

## Karanta allon matsayi

Lokacin da aka adana na’urar tare da hanyar samuwa ta SNMP, Kadupul yana buɗe zama (session) kuma yana ba da rahoto. Wannan shi ne binciken da ke da muhimmanci, kuma shi ne wanda mutane ke tsallakewa.

| Abin da kake gani | Abin da yake nufi |
|---|---|
| Tambayoyin tsarin da lokacin aiki sun yi nasara | Allon zai iya karanta ainihin bayanan SNMP na asali. Wannan har yanzu ba ya tabbatar da karɓar bayanan interface |
| Wuri ko Lambar Sadarwa babu komai | Waɗannan filayen bayanan na zaɓi ne kuma suna iya zama babu komai; rashin su kaɗai ba gazawar karɓar bayanai ba ne |
| Ba a amfani da SNMP | Babu community ko sunan mai amfani a na’urar, ko kuma an saita nau’in zuwa none |
| Kuskuren zaman SNMP | Saita zaman ya gaza; bincika kuskuren da aka nuna, bayanan shaida, ƙa’ida da saitunan haɗi |
| Kuskuren tsarin SNMP | Karanta `sysDescr` ya gaza; duba kuskuren da aka dawo da shi, kallon wakili, bayanan shaida da samuwa |
| Kuskuren uwar garken SNMP | Babu bayanin na’ura ko lokacin aiki da ya dawo |
| An nuna lokacin aiki a matsayin `U` | Ba a iya karanta lokacin aiki ba. Wasu na’urorin da gaske ba sa bayar da rahotonsa |

Idan hanyar samuwa ta haɗa da ping, sakamakon ping daban zai bayyana a ƙasa. Karanta duka biyun. Na’ura na iya cin nasara a ɗaya kuma ta gaza a ɗayan, kuma wanda ya gaza yana gaya maka inda za ka duba.

Bayanin tsarin da ba shi da komai ba ya tabbatar da cewa karɓar bayanai ya gaza. Lambar shirin tana ɗaukar wakilai masu bayanin da babu komai da kuma lokacin aiki mai amfani. Na’urorin da aka kashe suna tsallake binciken samuwa, kuma hanyoyin samuwa marasa SNMP ba sa nuna wannan allon na SNMP. Tabbatar da ainihin tambaya da poller cache na gaba.

## Ƙirƙiri hanyoyin bayanai da jadawali

Ga sabuwar na’ura ba tare da jadawalin da aka ƙirƙira ta atomatik ba, mataki na gaba shi ne ƙirƙirar jadawalin da hanyar bayananta. Bincika **Lissafin Hanyoyin Bayanai** da **Duba Poller Cache** a shafin na’urar maimakon ɗauka cewa babu komai a ciki.

Daga shafin na’urar, zaɓi **Ƙirƙiri Jadawali don Wannan Na’ura**. Ga switch wannan yana nufin gudanar da tambayar bayanan interface, zaɓar interfaces da kake buƙata, da zaɓar nau’in jadawali a gare su. Zaɓi interfaces biyu ko uku, ba duka arba’in da takwas ɗin ba. Kana tabbatar da cewa hanyar tana aiki ne, kuma ƙaramin rukunin farko ya fi sauƙin karantawa a mataki na gaba.

Jadawalin da ke da fihirisa yana haɗa hanyoyin bayanai tare da interface ɗin da aka zaɓa kuma yana shirya shigarwar poller-cache nasu; ana iya sake amfani da hanyoyin da suka dace da ke akwai. Amsar ƙirƙirar jadawali ba tabbacin binciken bayanai ba ne. Bincika cewa cache ɗin yana ɗauke da na’urar da ake tsammani, OIDs na interface da hanyar RRD.

## Tabbatar da cewa yana karɓar bayanai

Jira zagayowar karɓar bayanai da aka tsara, sannan bincika duka tambarin lokaci (timestamps) da ƙimomi. Jadawalin da babu komai a ciki na iya nufin daidaitawar farawa, ƙimar da ba a sani ba ko gazawar karɓar bayanai. Ana buƙatar karatun counter guda biyu don lissafin ƙima, amma zagaye biyu na poller ba sa ba da garantin cika ma’ajiyar archive mai inganci.

Bincika abubuwa uku, a cikin wannan jeri.

**Poller ya yi aiki.** Nemo taƙaitaccen bayanin ƙarshen aiki a cikin log ɗin da aka saita. Idan babu shi, duba tsarin lokaci, inda log ɗin yake da izini, da kuma ko poller ya fita kafin ya kammala. Duba [Rikodi](/ha/reference/logging/).

**Fayil ɗin yana nan kuma na kwanan nan ne.** Kwafi ainihin hanyar RRD daga hanyar bayanai ko poller cache; kada ka ƙiyasta shi daga sunan uwar garke. Ana iya canza hanyoyi da sunaye. Duba [Tsarin fayiloli](/ha/reference/file-layout/). Tambayi RRDtool yaushe aka rubuta fayil ɗin a ƙarshe:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Tambarin lokaci ya kamata ya ci gaba a rubuce-rubucen da suka yi nasara. Tambarin lokaci na kwanan nan na iya kasancewa tare da ƙimar da ba a sani ba, kuma rubuce-rubucen da aka tara na iya jinkirta tambarin lokaci a kan diski. Don `rrdcached` ko Boost, bincika matsayin sharewa na wannan ɓangaren kuma.

**Ƙimar ba wadda ba a sani ba ce.** `lastupdate` yana nuna sabbin ƙimomin da aka bayar; ga counter waɗannan ƙimomin counter ne, ba ƙididdigar zirga-zirga ba. Bincika layukan da aka kammala daga `fetch` don ƙididdigar da aka samu. Lokacin farawa, daidaita matakai, heartbeat, iyakoki da ƙa’idar bayanan da ba a sani ba ta archive duk suna shafar lokacin da layi mai amfani zai bayyana. Kada ka yanke hukuncin matsala daga layuka biyu na farko kawai. Idan abubuwan da ba a sani ba suka ci gaba, bincika ƙimomin da aka tattara, nau’in hanyar bayanai, heartbeat da kura-kuran poller.

## Kura-kuran farko da aka saba gani

| Alama | Dalilin da aka saba gani |
|---|---|
| Yana adanawa, amma binciken bayanin tsarin yana ba da rahoton kuskure | Bincika bayanan shaida, kallon wakili da samun mai karɓar bayanai; bayanin da babu komai kawai ba isasshen shaida ba ne |
| Kuskuren zaman SNMP daga Kadupul, yayin da `snmpget` ke aiki daga kwamfutarka | Hanyar firewall ta bambanta, ko kuma wakili yana iyakancewa ta adireshin tushe |
| Na’ura tana nuna tana ƙasa, amma bayanan SNMP suna zuwa | An saita samuwa zuwa ICMP ping, wanda ba zai iya buɗe raw socket ba |
| Bayani yana bayyana, amma babu bayanai | Ba a tsara lokacin poller ba, ko kuma yana aiki a matsayin mai amfani da ba zai iya rubutu a babban fayil na RRD ba |
| Tambayar bayanai ba ta dawo da wani interface ba | Kallon wakili yana cire teburin interface, ko kuma na’urar tana buƙatar sake fihirisa |
| Ƙimar farko ba a sani ba, sannan ta yi kyau | Al’ada ce ga counter. Yana buƙatar karatu biyu don fitar da ƙima |
| Ƙimomin da ba a sani ba suna ci gaba | Gazawar karɓar bayanai, ƙimomi marasa inganci, rashin dacewar nau’i/iyaka, heartbeat ko daidaitawar archive |
| Bayanai na ɗan lokaci, sannan gibi | Poller yana ɗaukar lokaci mai tsawo fiye da tazararsa, ko kuma na’urar tana iyakance saurin SNMP |
| Ƙimar counter ba ta da ma’ana | Zagayawa da yawa na 32-bit, sake saita counter, naúrori ko saitunan hanyar bayanai; yi amfani da counters masu 64-bit da ake tallafawa a kan hanyoyi masu sauri |
| Interfaces suna zana jadawalin ports marasa daidai bayan sake kunnawa | Fihirisa sun canza. Tambayar bayanai tana buƙatar hanyar sake fihirisa da ke lura da hakan |

Na ƙarshen yana da kyau a fahimce shi kafin ka sami switches ɗari: ba a da tabbacin cewa fihirisan interface na SNMP za su tsaya tsayin daka bayan sake kunnawa ko canjin module. Hanyar sake fihirisa a kan tambayar bayanai ita ce abin da ke sa jadawali ya ci gaba da nuni zuwa ga ainihin port ɗin jiki ɗaya. [Tambayoyin bayanai da ma’anonin lissafi](/ha/concepts/data-queries-and-indexes/) ya bayyana zaɓuɓɓukan.

Lokacin da kake da na’ura ɗaya da ke karɓar bayanai da kyau, ƙara sauran a dunkule maimakon ɗaya bayan ɗaya. [Gano na’urori ta atomatik](/ha/guides/discover-devices-automatically/) da kayan aikin layin umarni a [Kayan aikin layin umarni](/ha/reference/command-line-tools/) duka sun fi maimaita wannan shafi sau hamsin.

Na gaba: [Karanta jadawalin farko](/ha/start/first-graph/).
