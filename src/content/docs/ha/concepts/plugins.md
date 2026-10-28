---
title: Manhajjoji (Plugins)
description: Me ya sa filin faɗaɗa yake zama jerin wuraren kiran suna, abin da manhaja ke gada ta hanyar aiki a cikin tsari, da abin da masu tsaro ke hanawa da wanda ba sa hanawa.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 11
---

Manhaja (plugin) lamba ce da ainihin manhajar take haɗawa a cikin aikinta kuma take kiranta a wuraren da aka ambata.
Kowane wani fasali na tsarin manhaja yana biyo baya daga wannan jumla ɗaya.

Don abin da ya kamata ka karanta kafin shigar da manhajar wani, duba
[Shigar da bincika manhajjoji](/ha/guides/install-and-vet-plugins/).

## Me ya sa take aiki a cikin tsari

Kalli abin da ake amfani da manhajjoji dominsa: ƙara shafi a cikin jerin da manhajar ke nunawa,
canza zaɓuɓɓukan zane kafin a zana shi, ɗaukar mataki akan na'urar da ake sharewa,
ko haɗa sabon shafi (tab). Kowane ɗayan waɗannan gyara ne ga wani abu da manhajar ke riƙe da shi a cikin ƙwaƙwalwa a wancan lokacin.

Keɓaɓɓen ma'aikaci zai buƙaci ingantaccen tsarin mu'amala da tabbatar da sakamakonsa.
Wannan na iya kiyaye keɓancewar iko, amma ba ita ce hanyar da ake amfani da ita a nan ba:
ana haɗa fayil ɗin manhajar kuma ana kiran aikinta kai tsaye a cikin aikin manhajar.

## Abin da manhajar ke gada

Lambar manhaja tana aiki ne a matsayin asusun tsarin aiki mai kira, tare da samun damar shiga haɗin ma'ajiyar bayanai da izinin fayilolin tsarin.
Mai kiran gidan yanar gizo yana iya samun zama (session); mai kiran CLI ba lallai ne ya sami ɗaya ba.
Tsarin manhaja ba ya samar da keɓantaccen asali, akwatin gwaji (sandbox), ko tabbatar da sa hannu.

Izinin masu amfani da ƙungiyoyi suna sarrafa damar shiga manhaja; ba sa taƙaita lambar PHP ta manhaja ba gaira ba dalili.
Tallafin ma'ajiyar bayanai, izinin tsarin fayil da hani na tsari har yanzu suna iyakance abin da wannan aikin zai iya yi.
Bincika manhajar kafin shigarwa kuma kiyaye ikon asusun manhajar a taƙaice.

## Hanyoyin kira guda biyu

| Salo | Manhajar | Manhajar da ba ta mayar da komai |
|---|---|---|
| Sanarwa (Notification) | Tana wuce muhawara, tana watsi da sakamakon | Ƙimar da aka dawo da ita ba a amfani da ita; sakamako da keɓancewa har yanzu suna da mahimmanci |
| Canji (Transformation) | Tana wuce ƙima, tana amfani da abin da ya dawo | Tana iya maye gurbin ƙimar da null kuma ta karya masu kiran ƙasa |

Salon canji shine abin da ke ba wa manhaja damar ƙara maɓalli, faɗaɗa jerin ayyuka, ko canza zane.
A nan ne kuma manhajjoji ke haɗe da juna: manhajjoji biyu a wuri ɗaya kowannensu yana ganin fitarwar wanda ya gabata a cikin tsarin da aka tsara.

Mai aikawa (dispatcher) yana yin gargaɗi ne kawai game da jeri da ya zama ba jeri ba, ko ƙimar da ba ta zama komai ba a baya ta zama kamar null, kawai lokacin da layuka masu dacewa da yawa suke nan.
Wannan binciken ba cikakken tabbaci bane na kwangilar ƙugiya; manhaja ɗaya na iya lalata ƙima ba tare da wannan gargaɗin ba.

## Rajista matsayi ne, ba bincike ba

Ƙugiyoyi suna rayuwa a cikin tebur: wace manhaja, wane sunan ƙugiya, wane fayil, wane aiki, an kunna ko a'a.
Hanyoyin shigarwa, haɓakawa da saiti na iya yin rajistar ƙugiyoyi; rajista ba ta iyakance ga shigarwa ta farko kawai ba.

Madadin zai kasance bincike a lokacin buƙata, wanda ke nufin duba babban fayil ɗin manhaja da haɗa lambar kowace manhaja don tambayar abin da take so.
Shafi ɗaya yana kaiwa ga wuraren ƙugiya da yawa. Haɗa komai kawai don gano cewa babu abin da aka haɗa shine amsa mai tsada,
don haka manhajar tana tambayar teburin, tana ajiye amsar a cikin ma'ajiyar kache don wannan buƙatar, kuma tana haɗa fayil ɗin da layin da ya dace kawai ya ambata.

Wannan zaɓin yana da farashi da ya kamata a sani. Teburin na iya rashin jituwa da tsarin fayil.
Babban fayil ɗin manhaja da aka share da hannu yana barin layukansa a baya.
Kiran sanarwar da ya ɓace na iya haifar da gargaɗi; mai aikawa da canji ba shi da gargaɗin da ya dace da kiran da ya ɓace.
Rikodin da ke shiru ba ya tabbatar da cewa rajistar tana da kyau.

Tsarin aiwatarwa yana fitowa ne daga tsarin rajistar manhaja kuma ana iya daidaita shi.
Don haka ana shirya sarkar canji ta wani abu da mai gudanarwa ke sarrafawa.

## Abin da manhaja za ta iya kaiwa gare shi

| Ƙarfi | Lura |
|---|---|
| Ƙirƙirar teburanta | An yi rikodin, don haka cirewa na iya share su |
| Ƙara ginshiƙai a cikin tebura da ke akwai, gami da na ainihi | An yi rikodin, don haka cirewa na iya cire su |
| Yi rijistar yankunan izini (realms) | Sabbin sassan tsarin mu'amala da ake sarrafa damar shiga |
| Bayyana dogaro ga wasu manhajjoji | An bincika sigar kafin shigarwa |
| Yi aiki a kan masu tarawa na nesa | Aikawa ya dogara da ƙugiya, salon kira, iyawa da yanayin haɗin gwiwa |

Sauye-sauyen tsari da aka yi rikodin sune dalilin da ya sa cirewa ke lalata abubuwa.
Manhajar na iya share tebura da ginshiƙai da ake bi sawu, gami da bayanai.
Tana kuma kiran kiran cire manhaja kafin tsaftacewa.
Wannan kiran na iya yin wasu canje-canje; canje-canjen da ba a bi sawu ba ba a jujjuya su ta atomatik, kuma babban fayil ɗin tushen manhaja yana nan.

Yankunan da manhaja ta yi rajista ana riƙe su ta hanyar masu amfani da ƙungiyoyi daidai yadda ake riƙe yankuna na ainihi.
Sabbin yankuna na iya ba da dama ga babban mai gudanarwa da mai amfani da zama na yanzu lokacin da rajista ta buƙaci hakan.
Bincika tallafin da aka samu bayan shigarwa da haɓakawa; kada ka ɗauka cewa tsarin manufofinka na yanzu yana rufe sabon filin.
Duba [Izini da shiga](/ha/concepts/permissions-and-access/).

## Abin da masu tsaro ke karewa a zahiri

Akwai masu tsaro, kuma karanta su yana gaya maka menene samfurin barazanar.

Fayil ɗin da ƙugiya ta ambata ana bincika shi ne a cikin babban fayil ɗin wannan manhajar kanta.
Hanyar da ta tsere ana ƙin ta kuma ana yin rikodin ta a matsayin lamarin tsaro.
Sunan babban fayil ɗin manhaja yana iyakance ga haruffa, lambobi, layin ƙasa (_), da ɗigon tsakiya (-).
Ana karɓar rajistar ƙugiyoyi da yankuna ne kawai daga aikin da sunansa yayi kama da shigarwa, haɓakawa, ko aikin saiti;
ana ƙin kira daga ko'ina kuma ana yin rikodin sa.

Mai tsaron hanya yana iyakance fayil ɗin da layin ƙugiya zai iya haɗawa.
Binciken rajista yana bincika sunan aikin mai kira ne kawai don kalmomin shigarwa, haɓakawa ko saiti;
ba ya tabbatar da aikin rayuwa gaba ɗaya. Lambar manhaja na iya amfani da irin wannan sunan akan saukar shafi na yau da kullun, don haka wannan al'ada ba iyakar tsaro bace.

Ba sa yin komai game da abin da lambar manhajar kanta ke yi da zarar ta fara aiki. Ba iyakokin kiyayewa bane kuma ba a gina su a matsayin haka ba.

## Kashewa ba yana nufin tsayawa gaba ɗaya ba

Ana yin rajistar ƴan nau'ikan ƙugiya a cikin yanayin aiki a lokacin shigarwa: waɗanda ke ba da shafukan saituna, jerin tsari, da ma'anar fom.
Dole ne a iya saita manhaja kafin a kunna ta, don haka waɗannan suna aiki ta kowace hanya.

Don haka manhajar da aka kashe har yanzu tana da lambar da ake haɗawa da aiwatarwa akan wasu shafuka.
Kashewa sauya fasali ne kawai, kuma hanyoyin URL na kai tsaye na manhaja suma suna buƙatar bita.
Idan kana zargin lamba mai cutarwa, keɓance tsarin kuma duba hanyar cirewa kafin kiran cirewa, wanda shi kansa ke aiwatar da lambar manhaja.
Cire fayilolin tushe kawai ba ya share rajista ko juyar da canje-canjen ma'ajiyar bayanai.

## Masu tarawa na nesa suna samun kunkuntar fili

Manhaja tana bayyana ƙarfinta a cikin fayil ɗin bayananta: ko tana aiki lokacin da mai tarawa zai iya isa ga babban tsarin,
ko tana aiki lokacin da ba zai iya ba, da kuma ko tana shiga cikin tarawa.

A kan mai tarawa, ana bincika ƙugiyoyin da aka jera akan buƙatun ƙarfi.
Ƙugiyoyin canji da ba a jera ba har yanzu suna aikawa; ƙugiyoyin sanarwa da ba a jera ba na iya aikawa lokacin kan layi ko lokacin da manhajar ta bayyana goyon bayan gudanarwa/kallo ba tare da intanet ba.
Ba a yin rikodin tsallakewa a ko'ina. Wannan dabara ce ta tuƙi, ba cikakken jerin izini ko iyakar keɓancewa ba;
bincika ainihin mai aikawa da yanayin haɗin gwiwa don ƙugiyar da kake amfani da ita.

Dalilin shine cewa mai tarawa yanayi ne daban. Tsarinsa kwafi ne wanda zai iya zama na sa'o'i da yawa da suka gabata, kuma yana iya zama ba shi da alaƙa da babbar ma'ajiyar bayanai kwata-kwata.
Ƙugiyar da aka rubuta akan tunanin cewa babbar ma'ajiyar bayanai tana kusa da tambaya ɗaya ba daidai ba ce a can,
don haka samfurin yana buƙatar manhaja ta faɗi waɗanne zato take yi maimakon a kiyasta su.
Duba [Tarin bayanai na nesa](/ha/concepts/remote-data-collection/).

## Mai jefa ƙuri'a (poller) shine wuri mafi tsada don sanya ƙugiya

Ƙugiya a kan hanyar jefa ƙuri'a tana aiki ne lokacin da aka isa wurin kiran ta.
Yawan lokutan ta ya dogara da taron, aiki da tuƙin mai tarawa; ba kowace ƙugiya ce ke gudana a kowane tsari kowane zagaye ba.
Lamba mai jinkiri a kan hanya mai yawa tana cinye lokacin jefa ƙuri'a kuma tana iya taimakawa wajen gibin zane.

Ƙugiya a shafi tana bayyana sau ɗaya ga mutum ɗaya wanda ya riga yana jira.
Biyu ɗin suna kama da juna a cikin teburin rajista amma sun bambanta da girman tsada sosai.

## Me ya sa saman yake nuna rashin daidaito

Tsarin API na ƙugiya yana nuna wuraren kira tare da dalilai daban-daban da siffofin muhawara daban-daban.

Wannan shine dalilin da ya sa jerin ke da faɗi kuma ba na yau da kullun ba, me ya sa wasu wurare ke ba ka ƙimar da za ka canza wasu kuma kawai suna gaya maka wani abu ya faru,
kuma me ya sa muhawara ta bambanta a siffa daga ƙugiya ɗaya zuwa ta gaba. Ƙaramar sigar asali da aka ayyana ba ta tabbatar da dacewa da kowace ƙugiya ba:
bincika muhawarar kowane wurin kira da tsammanin dawowa, kuma gwada manhaja a kan sigar da aka nufa.
Hakanan iyakokin dacewar CLI da tallafin yanki da aka rubuta a ciki
[Shigar da bincika manhajjoji](/ha/guides/install-and-vet-plugins/) suna aiki; shigarwa mai nasara kawai ba shaidar dacewa bace.

Fahimtar aiki: manhaja tana da alaƙa sosai da ainihin sigar da aka rubuta ta a kanta, fiye da yadda mafi ƙarancin da aka bayyana yake nunawa.
Sake bincika manhajjoji kafin haɓaka babban tsari maimakon bayan sa.
