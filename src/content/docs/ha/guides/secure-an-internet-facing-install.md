---
title: Kare shigarwar da ke fuskantar intanet
description: Abin da za a canza kafin tsarin sa ido tare da damar shiga harsashi (shell) zuwa cibiyar sadarwar ku ya amsa buƙatun daga intanet na jama'a.
banner:
  content: Kadupul yana cikin matakin pre-alpha. Tabbatar da waɗannan hanyoyin a cikin keɓantaccen shigarwar gwaji. Wannan daftarin fassara ne; ana jiran bitar ƙwararren harshe.
sidebar:
  order: 9
---

:::caution[Tabbatar kafin amfani]
Ana samun tushen lambar, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura a halin yanzu. Gwada waɗannan hanyoyin akan keɓantaccen kwafi tare da madadin bayanai kafin dogara da su. Duba [matsayin aikin](/ha/project/status/).
:::

Fara da gaskiya: sanya shi a bayan VPN. Kadupul yana ajiye takaddun shaida na SNMP na kowace na'ura da kuke sa ido a cikin rubutu a sarari (cleartext), kuma yana gudanar da umarni a kan uwar garkensa a matsayin wani ɓangare na ayyukan yau da kullun. Babu wani tsari da zai sa sanya shi a intanet na jama'a ya zama abu mai kyau.

Binciken da ke ƙasa yana taimakawa wajen kimanta keɓantaccen shigarwa. Ba sa kafa amintaccen tsari na jama'a ko tallafi; kiyaye iyakar matsayin aikin da ke sama a zuciya yayin fassara sakamakon.

## TLS

Dakatar da TLS a uwar garken yanar gizo ko a cikin wakili (proxy) a gabansa. Kadupul ba ya saurare a kan soket ɗinsa.

Sannan kunna saitin da ke tura buƙatun HTTP na yau da kullun zuwa HTTPS. Wannan a kashe yake (`off`) ta tsohuwar hanya. Idan ba tare da shi ba, ana ba da fom ɗin shiga ta hanyar HTTP kuma kalmar sirri tana tafiya a sarari a kan hanyar sadarwa kafin wani abu ya zama mai mahimmanci.

Lokacin da PHP ta karɓi ƙimar `$_SERVER['HTTPS']` wacce ba kowa ba ban da `off`, aikace-aikacen yana saita tutar Secure ta kuki na zama. A bayan wakilin da ke dakatar da TLS, saita amintaccen uwar garken yanar gizo ko Layer na FastCGI don gabatar da HTTPS daidai, kuma tabbatar da taken `Set-Cookie` da ya haifar a cikin mai bincike.

`$proxy_headers` tana sarrafa ƙudurin adireshin abokin ciniki. Wannan ba ya saita canjin uwar garken HTTPS ko kunna kuki na Secure. Aminta da taken adireshi kawai waɗanda wakilin ku ya saita, share kwafin da abokin ciniki ya bayar, kuma toshe shiga kai tsaye zuwa bayan fage. Aiwatar da tura HTTP-zuwa-HTTPS akan wakili na jama'a kafin a aika takaddun shaida.

Aikace-aikacen yana saita HttpOnly da SameSite=Strict akan kuki na zamansa. Tabbatar da ainihin kuki da halayen juyawa a kan iyakar turawa; waɗannan tutocin ba sa tabbatar da cewa duk sauran kukis suna raba tsari iri ɗaya. Duba [Bayanin tsarin zaman PHP](https://www.php.net/manual/en/session.configuration.php).

## Tsoffin takaddun shaida

Tsarin da aka aiko yana ɗauke da asusun gudanarwa mai suna `admin` wanda maɓallin kalmar sirrinsa shine MD5 na kirtani `admin`. An sanya masa alama a matsayin mai buƙatar canji a farkon shiga. Maimakon ɗauka cewa hakan ya faru, tabbatar cewa an yi canjin. Ana tsallake gargaɗin da ke tilasta wannan a ƙarƙashin Tabbatar da Asali na Yanar Gizo (Web Basic), inda uwar garken yanar gizo ta riga ta yanke shawarar wanene mai amfani.

Sannan kalli takaddun shaidar da ba asusun masu amfani bane:

- Asusun bayanan bayanai a cikin samfurin tsarin da aka aiko ta tsohuwa shine `cactiuser` tare da kalmar sirri `cactiuser`.
- Ƙananan tsarin atomatik yana zuwa tare da tsoffin zaɓuɓɓukan SNMP waɗanda ke ɗauke da igiyoyin al'umma `public` da `private`, da sunan mai amfani na SNMPv3 da kalmar sirri. Waɗannan tsoffin saitunan sikanin ne, ba saitunan na'ura ba, amma sune ainihin igiyoyin da bincikenku zai fara gwadawa.

Ana iya saita manufofin kalmar sirri. Tsoho yana buƙatar haruffa takwas da cakuda manya da ƙananan haruffa. Dukansu ƙarewar lokaci da kulle asusu bayan maimaita gazawa suna samuwa kuma duka an kashe su ta tsohuwa. A kan shigarwar da ke fuskantar intanet, kunna kullewa.

## Hakin mallakar bayanan bayanai (Database privileges)

Misalin shigarwa yana amfani da haƙƙoƙin faɗin rumbun adana bayanai tare da samun damar teburin yanki na lokaci. Sauya waɗannan sunayen asusu/bayanan bayanai na misali kuma sake duba tallafi don ainihin ayyukan turawa da kiyayewa:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Wannan tallafi na biyu ba na zaɓi bane. Sarrafa yankin lokaci yana karanta wannan tebur, kuma mai shigarwa yana bincika shiga da bayanan yankin lokaci da aka cika. Bincika ƙarin tallafi game da ainihin buƙatun kulawa da mai tattarawa kafin cire su; wannan misalin ba hujja bane cewa kowace turawa tana buƙatar daidai haƙƙoƙi iri ɗaya.

Bayanin iyaka da ke da mahimmanci:

- Ɗaure rumbun adana bayanai zuwa localhost, ko keɓantaccen kanti, ba adireshin da uwar garken yanar gizo ke amsawa ba.
- Ba kowane mai tattara bayanai na nesa asusun bayanan bayanai na kansa. Takaddun shaidarsu suna rayuwa a cikin babban rumbun adana bayanai kuma a cikin fayil ɗin daidaitawa nasu, don haka asusu daban-daban suna inganta lissafi da sokewa. Ba sa keɓance mai tattarawa da aka yi wa kutse da kansu idan tallafinsa har yanzu yana ba da damar rubutu a tsakiya.
- Haɗin yana goyan bayan TLS, wanda aka saita a cikin fayil ɗin sanyi tare da maɓalli, takaddun shaida da hanyar CA. Yi amfani da shi duk lokacin da bayanan bayanai ba sa kan uwar garke ɗaya.
- Sanya fayil ɗin sanyi ya zama mai karantawa ta mai amfani da uwar garken yanar gizo kuma ba za a iya rubutawa ta yanar gizo ko mai amfani da sabis na poller yayin aiki na yau da kullun ba. Mayar da shi ƙarƙashin mallakar asusun gudanarwa. Saitin poller na nesa yana bincika musamman idan zai iya sabunta fayil ɗin; kada ku ɗauka cewa kowane shigarwar uwar garken farko yana buƙatar izinin rubutu na wucin gadi iri ɗaya.
- Ana iya adana sirrin CSRF a cikin fayil maimakon bayanan bayanai. Idan kuna amfani da wannan zaɓin, dole ne fayil ɗin ya kasance a wajen tushen daftarin aiki. An bayyana wannan a matsayin wajibi, ba shawara ba.

## Ajiye kundayen bayanai a wajen tushen daftarin aiki

A cikin turawar tushen ma'ajiya, bayanan sirri da kundayen adireshi na iya zama a ƙarƙashin tushen da ake bayarwa. Kundayen adireshi da yawa suna ɗauke da dokokin ƙin yarda na `.htaccess`; maimakon ɗauka cewa kowace hanya an rufe ta, yi lissafin ainihin tsarin bincike da uwar garke. Hijira na yanzu na tsarin tsari kuma yana nufin sauya duk rukunin yanar gizon zuwa `public/` ba tare da hanyoyinsa na gado ba ba cikakkiyar hanyar turawa bace.

Waɗannan fayilolin suna aiki akan Apache kawai, kuma kawai idan sanyi ya ba da izinin sokewa a cikin wannan kundin adireshin. A kan Nginx ba sa aiki. A kan Apache da ba a saita da kyau ba ba sa aiki. Ƙa'idar deny-all da ba ta aiki a gaban kundin adireshi na rajista tana nufin kowa zai iya karanta rajistan ayyukan aikace-aikacenku, gami da sunayen na'urori, sunayen masu amfani, rubutun tambaya da cikakkun bayanan gazawa. Apache yana rubuta halayen sokewa da ake buƙata a cikin [jagoran `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Yi duka biyun:

**Tabbatar da hanyoyin ajiya kafin motsa bayanai.** Ana iya saita wuraren rajista, amma `include/global.php` yana saita tushen RRA zuwa kundin adireshin `rra` na shigarwa; babu babban saitin UI na kundin adireshi na RRA. Tsarin ajiya da aka ɗora daban na iya adana wannan hanyar da ake tsammani, amma sanya tsarin fayil shi kaɗai ba ya hana samun damar HTTP ta hanyar kundin adireshi ko hanyar haɗin yanar gizo. Bincika hanyoyin tushen bayanai da ke akwai, izinin sabis, madadin bayanai da ƙin yarda na HTTP tare. Kada ku motsa bishiyoyin kache ba tare da tabbatar da yadda masu amfani da su ke warware fayiloli ba. Duba [Ƙaura zuwa sabon kayan aiki](/ha/guides/migrate-to-new-hardware/) da [Haɓaka cikin aminci](/ha/guides/upgrade-safely/).

**Ƙi hanyoyin sirri akan uwar garken yanar gizo.** Daidaita [misalin Nginx na tushen ma'ajiya](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf) na asali zuwa ainihin prefix na URL da uwar garke; dokokin ƙin yarda dole ne su ɗauki fifiko akan sarrafa PHP na yau da kullun. Wannan jerin taimakon ƙididdiga ne, ba tsarin uwar garke da aka shirya ba:

| Kundin adireshi | Me yasa |
|---|---|
| `rra/` | Fayilolin auna |
| `log/` | Rajistar aikace-aikace gami da tambaya da cikakkun bayanan kuskure |
| `cache/` | Bincika damar samun kadarorin da aka nufa; toshe aiwatar da PHP a cikin hanyoyin kache |
| `scripts/` | Bai kamata a ba da lambar tattarawa ko aiwatar da ita kai tsaye ta hanyar HTTP ba |
| `cli/` | Kayan aikin layin umarni waɗanda ba a nufa a shiga ta hanyar HTTP ba |
| `mibs/`, `contrib/`, `docs/` | Albarkatun cikin gida da takaddun shaida |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Tsarin ciki na aikace-aikacen, jiha da kayan aiki |
| Fayilolin digo, bayanan dogaro, PHP na ciki na include/bootstrap | Bayanan metadata na ma'ajiya da wuraren shiga na ciki |

Kiyaye mahimman kadarorin jama'a kamar `include/js` da `include/themes`; toshewa gaba ɗaya akan duk abubuwan da aka haɗa na iya karya dandalin mai amfani (UI). Tabbatar da ƙin yarda ta amfani da hanyoyin gwaji marasa lahani kuma tabbatar da cewa martani ba ya bayyana asali ko abubuwan fayil. Kada ku gwada ta hanyar ɗaukar ainihin asirai a cikin tashar ko rajista.

Hakanan akwai fayil na zaɓi na taken martanin tsaro don kadarorin da ba sa canzawa. Martanin PHP yana saita nasa taken a cikin lamba; fayiloli marasa canzawa ba sa yin haka sai dai idan kun kunna wannan fayil ɗin ko sanya irin waɗannan umarni a cikin tsarin uwar garke.

Ana iya saita Manufar Tsaron Abun ciki (CSP). Tsohuwar manufar rubutun tana ba da izinin JavaScript na layi ba tare da nonce ba, saboda abubuwan toshewa sun dogara da shi. Yanayin nonce mai tsauri da aka fallasa a cikin saituna na bayar da rahoto ne kawai. Aiwatar da taken kuma yana karɓar tilasta `nonce` duk da [taimakon saitunan tsofaffi](https://github.com/kadupulhq/kadupul/issues/265). Yanayin tilastawa da na ba da rahoto kawai daban ne; duba taken kuma gwada duk shafuka/abubuwan toshewa da ake buƙata kafin canza yanayi. Aiwatar da aka tilasta ba hujja bace ta cikakkiyar dacewar nonce.

## Poller tana aiwatar da umarni

Wannan shine ɓangaren da ke canza yanayin barazana.

Tattarawa ba SNMP kaɗai bace. Hanyar shigar da bayanai na iya ayyana layin umarni, kuma poller tana gudanar da shi. Ana adana layin umarni a cikin kache na poller kuma mai tattarawa yana aiwatar da shi a kowane tazara a matsayin mai amfani da tsarin aiki na mai tattarawa. Shigarwar uwar garken rubutu na PHP yana amfani da wani tsari daban na PHP mai aiki na dogon lokaci. Shigar da umarni na waje da uwar garken rubutu hanyoyi ne daban-daban; kada ku ɗauka kowane rubutu yana gudana a cikin wannan uwar garken ko an tabbatar da mai tattarawa na C don wannan shigarwa.

Ɗauki izini masu zuwa azaman wuraren daidaita aiwatar da lambar gata mai girma. Ainihin tasirinsu ya dogara da fasalulluka da aka kunna da sarrafa inganci:

| Izini | Me yasa |
|---|---|
| Hanyoyin Shigar da Bayanai | Yana ayyana layin umarni kai tsaye |
| Shigo da Samfura | Samfuri ko fakitin da aka shigo da shi na iya ɗaukar hanyar shigar da bayanai |
| Gudanar da Abubuwan Toshewa | Lambar toshewa tana aiki a cikin aikace-aikacen |
| Saituna / Kayan aiki | Yana sarrafa hanyar zuwa binaries da aka aiwatar |

Kada ku ba da su ga duk wanda ba shi da harsashi (shell) a kan wannan uwar garken riga. Mai amfani da karatu kawai wanda zai iya duba jadawali abu ne daban gaba ɗaya, kuma wannan shine matsayin da kusan kowane asusu ya kamata ya kasance dashi.

Akwai abubuwan sarrafawa guda biyu kuma duka sun cancanci amfani da su:

**Ƙuntata haruffa na musamman (Metacharacters).** An toshe haruffan harsashi na musamman a cikin igiyoyin umarnin shigar da bayanai ta tsohuwa. Akwai saiti don ba da izinin su, wanda ke wanzuwa don tsoffin ma'anoni waɗanda suka yi amfani da bututun harsashi. Bar shi a kashe. Idan kuna da ma'anoni da ke buƙatar sa, matsar da bututun zuwa rubutu a ƙarƙashin kundin adireshin rubutu kuma ku kira rubutun.

**Jerin sunayen shigarwa (Input Whitelist).** Fayil da aka ambata a cikin fayil ɗin daidaitawa, wanda ke ɗauke da igiyoyin umarni da aka amince da su ta hanyar shigar da bayanai. Lokacin da aka saita wannan, ba za a iya ƙirƙirar jadawali da tushen bayanai daga hanyar shigar da bayanai wacce igiyar umarninta ba ta cikin jerin ba. Canza umarnin da aka amince dashi yana sa ya gaza wajen kwatantawa har sai an sabunta jerin sunayen da aka duba. Sake amincewa mataki ne na layin umarni, wanda shine ainihin ma'anar: yana buƙatar samun damar harsashi akan uwar garke, ba zaman gudanarwa a cikin mai bincike ba.

Lokacin da aka sake gina kache na poller ana sake gudanar da binciken. Shigar da bayanan da ya gaza a cikin wannan ba ya samar da abubuwan poller, kuma duk layin da ya bari ana share shi a kan sake gina/fitarwa na gaba da aka tabbatar. Wannan yana sarrafa ƙirƙira da yawan jama'a na kache; ba hanyar sokewa bace nan da nan don aikin da ke gudana riga ko hujja cewa kowane mai tattarawa yana sake loda jerin sunayen da aka canza kafin kowane aiwatarwa. Tabbatar da ingantaccen yanayin kache da halayen mai tattarawa bayan canjin manufofin.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

`--update` da ba a iyakance ba tana karɓar ma'anar umarnin yanzu a cikin jerin sunayen; kada ku yi amfani da shi azaman madadin bita su. Kare jerin sunayen da babban kundin adireshinsa daga rubutun mai amfani da sabis. Ya kasance a kashe har sai an saita shi. Duba [Rubuta rubutun tattara bayanai](/ha/guides/write-a-data-collection-script/) don zaɓi da cikakkun bayanan fitarwa.
Wannan yana ƙara farashin ma'amalar gudanarwa ta ɓangaren mai bincike, saboda shigar da sabon umarni a cikin tattarawa yanzu yana buƙatar samun damar rubuta tsarin fayil akan uwar garken poller. Wannan har yanzu ba madadin ƙuntata wanda ke riƙe da izini a cikin teburin da ke sama ba, saboda maharin da zai iya samun damar shiga igiyar umarnin da aka riga aka amince da ita ba ya buƙatar ƙara sabo.

## Tabbatarwa (Authentication)

Hanyoyi huɗu suna zuwa. Abin da ke samuwa ya dogara da kari na PHP da ke akwai.

| Hanyar | Inda ake duba masu amfani | Bayanan kula |
|---|---|---|
| Gina-ciki | Rumbun adana bayanai na gida | Kalmomin sirri, manufofi da kullewa duk ana sarrafa su a cikin gida |
| Web Basic | Uwar garken yanar gizo | Duk abin da uwar garken ta ce wanene mai amfani, Kadupul tana amincewa |
| LDAP | Kundin adireshi guda ɗaya | Yana buƙatar kari na PHP LDAP |
| Yankunan LDAP/AD da yawa | Kundayen adireshi da yawa | Bukatar iri ɗaya |

Mai zaɓin saituna yana fallasa waɗannan hanyoyin da aka tabbatar, ba yanayin gado na sifili ba. Ƙaddamar da tabbatarwa yana ƙoƙarin ƙaura tsohon sanyi mara tabbaci komawa zuwa tabbatarwa na gida, amma ƙananan mataimakan izini har yanzu suna da rassan yanayin sifili. Tabbatar da hanyar da aka adana, ainihin da aka saita da ainihin hanyoyin da aka kiyaye maimakon ɗaukar zaɓin UI da ba ya nan a matsayin hujja ta duniya.

Abubuwan da za a duba:

- **Web Basic tana ba da ikon tabbatar da asali.** Lokacin da aka zaɓi wannan yanayin Kadupul tana karanta canjin asali da aka tabbatar da uwar garke kuma har yanzu tana aiwatar da taswirar asusu, matsayin kunnawa da ƙa'idodin izini. Asalin da ya ɓace ba mai gudanarwa bane ta atomatik. Sanya uwar garke don tabbatar da kowace hanyar da aka nufa da hana abokin ciniki ba da amintattun sauye-sauyen ainihi; tabbatar da hanyoyin hoto/fitarwa da halayen baƙi da aka nufa daban.
- **Tallafin "Ci gaba da shiga"** yana kunne ta tsohuwa. Ana ƙirƙirar alama ta dindindin lokacin da mai amfani ya zaɓi wannan zaɓin bayan tabbatarwa, ba ta atomatik ga kowane zama ba. Yana ƙarewa bayan kwanaki casa'in ba tare da amfani ba. A kan shigarwar da ke fuskantar intanet, yanke shawara da gangan idan kuna son sa.
- **Saita baƙo mai amfani zuwa nobody** sai dai idan kuna son ba da damar duba jadawali ba tare da suna ba. Ba a saita shi ga kowane mai amfani ta tsohuwa ba, wanda shine tsoho daidai; tabbatar da cewa ba a canza shi ba yayin saiti.
- **Sanya Tabbatar da Abubuwa Masu Yawa (MFA) a gabansa.** Babu MFA a cikin aikace-aikacen. Wakili mai lura da asali ko ƙofar SSO shine inda yake zuwa.

## Wuraren ƙarshe na masu tattara bayanai na nesa

Idan kuna gudanar da masu tattara bayanai na nesa, babban shigarwar yana fallasa wurin ƙarshe da suke kira. Wannan ba a tabbatar dashi ta zaman mai amfani ba. Yana ba da izini ta hanyar warware adireshin kira da daidaita shi da sunayen uwar garken masu tattarawa masu rijista, yana yin rajistar gazawa a ƙarƙashin rukunin tsaro.

Abubuwa biyu sun bayyana. Na farko, wannan wurin ƙarshe bai kamata a shiga ta intanet na jama'a ba; ƙuntata shi a uwar garken yanar gizo zuwa adiresoshin masu tattarawa. Na biyu, adireshin abokin ciniki da yake bincika shine adireshin da aka samo daga buƙatar, don haka amincin da aka saita a baya na gaba ya shafi nan ma. Aminta da taken da ba ku da iko a kansu yana ba mai kira damar da'awar adireshin mai tattarawa.

Daban, saitin da ke ba da damar babban uwar garke takaddun shaida da aka sanya wa hannu da rashin daidaiton sunan uwar garke lokacin magana da mai tattarawa yana kunne ta tsohuwa. Ba da ainihin takaddun shaida ga masu tattara ku kuma kashe wannan.

## Mafi ƙarancin lissafin bincike

1. An dakatar da TLS, an tura HTTP kafin shiga, an saita matsayin HTTPS na PHP ta hanyar amintaccen uwar garke, kuma an tabbatar da kuki na Secure. Taken adireshin abokin ciniki an iyakance su ga waɗanda wakili ya saita kuma ya share kawai.
2. An canza kalmar sirri ta tsohuwar mai gudanarwa kuma an tabbatar. Kulle asusu yana kunne.
3. An sake duba tallafin bayanan bayanai don shigarwa, kiyayewa da ayyukan mai tattarawa; an tabbatar da samun damar yankin lokaci kuma an iyakance hanyar sadarwar bayanan bayanai ga abokan ciniki da ake buƙata.
4. An tabbatar da hanyoyin ajiya, an ƙi kundayen adireshi na sirri da metadata a uwar garken yanar gizo, kuma mahimman kadarori marasa canzawa har yanzu suna aiki.
5. Fayil ɗin sanyi ba za a iya rubuta shi a lokacin aiki ba. Fayil ɗin sirri na CSRF, idan ana amfani dashi, yana wajen tushen daftarin aiki.
6. Ba a ba da hanyoyin shigar da bayanai, shigo da samfura da gudanar da abubuwan toshewa ga duk wanda ba shi da harsashi a kan uwar garken poller ba. Ƙuntata haruffa na musamman yana kunne. An saita jerin sunayen shigarwa.
7. Wuraren ƙarshe na mai tattarawa na nesa an iyakance su ta adireshi. Binciken takaddun shaida yana kunne.
8. MFA tana cikin wakili a gaban komai.
