---
title: Tsarin tsaro
description: Inda bayanan da ba a amince da su ba ke shiga Kadupul, wane aiki ke gudana da wane iko, abin da asusun ma'ajiyar bayanai zai iya yi, da kuma iyakokin da lamba ke aiwatarwa maimakon kiyastawa kawai.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 12
---

Tsarin saka idanu abu ne mai wuyar karewa, saboda dalilai guda uku da ba su da alaƙa da ingancin lamba.

Yana riƙe da takaddun shaida na duk abin da yake kallo. Al'ummomin SNMP, sunayen masu amfani da kalmomin shiga na v3,
da duk abin da na'ura ke buƙata ana adana su don mai jefa ƙuri'a ya yi amfani da su ba tare da kulawar mutum ba.
Babu mutumin da zai riƙa rubuta su a kowane minti biyar.

Yana gudanar da umarni a kan jadawali. Tattara ƙimar da SNMP ba ta bayyana ba yana nufin gudanar da rubutun lamba (script),
kuma ma'anar wannan rubutun tsari ne da aka adana a cikin ma'ajiyar bayanai kuma ana iya gyara shi ta hanyar manhajar.

Yana shigar da bayanan da na'urorin da yake kallo ke samarwa. Bayanin kafar sadarwa, wurin ɗora diski, sunan firikwensin:
duk yana zuwa ne daga na'urar, kuma duk yana ƙarewa a cikin ma'ajiyar bayanai, a cikin taken zane, da kuma muhawarar da ake bayarwa ga wasu shirye-shirye.
Kafar sadarwa da aka kutsa ciki tushen shigarwa ce, ba kawai wanda aka cutar ba.

Babu ɗayan waɗannan da ke da aibi. Su ne ainihin abin da aikin ke buƙata. Abin da ke biyo baya shine inda kowannensu ya sauka a cikin tsarin gine-gine.

## Inda bayanan da ba a amince da su ba ke shiga

Hanyoyin shiga guda huɗu, a cikin tsari na yadda mai aiki ke sarrafa su.

| Wurin shiga | Tushe | Inda yake zuwa |
|---|---|---|
| Sigogin HTTP | Duk wanda zai iya isa ga uwar garken yanar gizo | Ma'ajiyar bayanai, fitarwar shafi, da SQL |
| Ƙimar SNMP | Na'urar da ake jefa ƙuri'a | `host_snmp_cache`, taken zane, iyakokin RRD, muhawarar rubutun lamba |
| Fitarwar rubutun lamba | Rubutun lamba na gida, ko duk abin da ya yi magana da shi | `poller_output`, sannan fayilolin RRD |
| Samfura da kunshin da aka ɗora | Duk wanda ke riƙe da yankin shigo da kaya | Layukan samfuri, kuma don kunshin, fayiloli akan diski |

### Sigogin HTTP

Masu taimaka wa buƙata suna rayuwa a cikin `lib/html_utility.php`. `get_filter_request_var()` yana tsohuwar
hanya ta tabbatar da lambobi, amma kuma yana da lokuta na musamman don ƙimomin da ba komai a ciki, marasa ma'ana da regex.
Mai kiran har yanzu yana buƙatar bincika ko ana buƙatar ƙimar kuma ta dace da aikin. Tacewa ba ta kafa izini ba.

`set_request_var()` yana adana ƙima a cikin `$_CACTI_REQUEST` kuma yana nuna ta a cikin jerin buƙatun.
`get_nfilter_request_var()` yana karanta wannan ma'ajiyar kache ko ɗanyar buƙatar kuma ba ya tabbatarwa ko rubuta ƙimar da kansa.
Don haka karantawa na gaba na iya lura da ƙimar da aka adana a baya, kuma tsarin karantawa yana da mahimmanci.

Tare da kunna `log_validation`, `get_request_var()` yana shigar da wasu buƙatun da ba a ajiye a cikin kache ba.
Karatun kai tsaye na manyan canje-canje (superglobals) da `get_nfilter_request_var()` ba a rufe su duka ba.
Taimakon bincike ne, ba cikakken binciken tabbatarwa ko aiwatarwa ba.

### Ƙimar SNMP

Binciken tambayar bayanai yana adana zaɓaɓɓun ƙimomi a cikin `host_snmp_cache`; sakamakon jefa ƙuri'a na SNMP na yau da kullun yana bin hanyar samfurori.
`data_query_format_record()` a cikin `lib/data_query.php` yana amfani da canje-canje guda biyu kafin adanawa:
taswirar zaɓi ta `rewrite_value` daga ma'anar tambaya, da `bin2hex()` akan kowace ƙimar da `mb_detect_encoding()` ba zai iya ganewa ba.
Wannan na biyun kariya ce daga igiyoyin baiti na binary (binary octet strings), ba daga abun ciki mai haɗari ba.

Daga nan ƙimar tana tafiya. Tana kiran zane-zane ta hanyar `substitute_snmp_query_data()`.
Tana iya saita matsakaicin RRD, saboda samfurin bayanai na iya bayyana matsakaicin sa a matsayin `|query_ifSpeed|`.
Ta zama muhawara ga tambayar rubutun lamba, inda `get_script_query_path()` ke wucewa da kowane sashi ta hanyar `cacti_escapeshellarg()` da farko.

Kaucewa lambobin haɗari da masu tabbatar da RRDtool da aka bayyana a ciki
[Haɗin RRDtool](/ha/reference/rrdtool-integration/) sune iyaka a nan.
Dole ne bayanan na'ura su kasance ba a amince da su ba. Tabbatarwa da kaucewa halaye ne na kowane wurin kira;
kasancewar mataimaka ba tabbaci bane cewa kowane mai amfani yana amfani da su daidai. Bincika tsarin umarni da muhawarar da aka sauya.

### Fitarwar rubutun lamba

Reshen `popen()` na `exec_poll()` yana karantawa tare da `fgets(..., 8192)`, yana dawo da matsakaicin baiti 8,191 ko sabon layi na farko.
Madadin sa na `shell_exec()` yana da halayyar fitarwa daban, kuma tarin uwar garken rubutun lamba yana bin wata hanya.

`prepare_validate_result()` yana gane ƙimar lambobi da waɗanda ba a sani ba, siffofin hexadecimal da wasu siffofin fitarwa na filaye da yawa.
Hakanan yana iya cire rubutu don samun ƙimar lissafi; ba tabbataccen tacewa ba ne na duniya baki ɗaya.
Bincike na gaba da tabbatar da RRDtool suma suna da mahimmanci. Duba [Hanyoyin shigar da bayanai](/ha/reference/data-input-methods/).

Binciken fitarwa ba ya keɓe rubutun lamba da aka riga aka aiwatar.
Bincika umarni, jerin abubuwan da aka yarda da su da ikon tsarin aiki kafin kunna tarawa.

### Samfura da kunshin

Hanyoyi daban-daban guda biyu suna raba yanki ɗaya.

**Shigo da samfuri** a bayyane yake XML ba tare da sa hannu ba. Yana ƙirƙirar samfura, tambayoyin bayanai, da hanyoyin shigar da bayanai.
Hanyar shigar da bayanai layin umarni ne, don haka wannan hanya ce daga fayil ɗin da aka ɗora zuwa wani abu da mai jefa ƙuri'a zai aiwatar.
`lib/import.php` yana gudanar da `cacti_input_string_is_safe()` akan kowane shigo da `input_string` kuma yana ƙin hanyar lokacin da take ɗauke da haruffan harsashin kwamfuta, yana yin rikodin:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

**Shigo da kunshin** yana da sa hannu. `import_read_package_data()` yana karanta maɓallin jama'a da aka saka a cikin kunshin
kuma yana kwatanta shi da maɓallan guda uku da aka haɗa a cikin `lib/import.php`: maɓallan Cacti guda biyu da maɓallin Kadupul.
Kowane wani maɓallin yana kasawa. Kunshin da ba shi da sinadarin `<publickey>` ana karanta shi a matsayin mai da'awar tsohon maɓallin Cacti,
kuma dole ne ya samar da sa hannun da aka tabbatar a kansa.
`import_read_package_data()` yana ƙin kowane maɓallin da ke ƙasa da biti 2048 kafin ƙoƙarin tabbatarwa, wanda tsohon maɓallin, a biti 512, bai wuce ba.
Kowane fayil ɗin da ke ciki yana ɗauke da sa hannun kansa, wanda aka tabbatar daban.

Kunshin na iya rubuta zaɓaɓɓun fayiloli. Sunayen da aka yarda da su suna farawa da `scripts/` ko `resource/`,
a zaɓi a ƙarƙashin ingantaccen prefix `plugins/<name>/`. Mai shigo da kaya yana ƙin NUL, hanyoyin ratsawa (traversal) da cikakkun hanyoyi
kuma yana bincika kariya a ƙarƙashin asalin tsarin; kasancewar sunan babban fayil kawai bai isa ba.
Ikon rubuta makoma kuma yana sarrafa ko rubutun zai yi nasara. Kunshin da ya wuce tabbaci yana rubuta PHP mai aiki a cikin bishiyar tsarin da gangan.
Tabbatar da sa hannu yana kafa karɓaɓɓiyar asali da amincin sa hannu, ba wai cewa lambar ba ta da haɗari ba.
Izinin yanki, kiyaye hanya, fayilolin da aka zaɓa, izinin tsarin fayil da manufofin jerin umarni suma suna da mahimmanci.

Duk hanyoyin biyu suna zaune a bayan yanki na 17. Matsayin Editan Samfuri na yau da kullun yana riƙe da yanki na 17 da yanki na 2 (Hanyoyin Shigar da Bayanai).
Asusun da ke da waɗannan izini zai iya bayyana umarnin tarawa, dangane da tabbatarwa da sarrafa jerin abubuwan da aka yarda da su.
Wannan shine abin da matsayin yake dominsa, kuma yana da kyau a sani kafin a ba da shi.
Duba [Shigo da fitar da samfura](/ha/guides/import-and-export-templates/) don ingantaccen aikin aiki da sanannun iyakoki.

## Abin da ke gudana tare da wane iko

| Tsari | Wanda ya fara shi | Yana aiki a matsayin | Yana yin me |
|---|---|---|---|
| Tsarin yanar gizo | Uwar garken yanar gizo | Mai amfani da uwar garken yanar gizo | Yana karantawa da rubuta ma'ajiyar bayanai, yana zana zane-zane ta hanyar RRDtool, yana rubuta fayilolin RRD akan buƙata, yana rubuta fayilolin kunshin yayin shigo da kaya |
| `poller.php` | Mai tsara jadawali ko sabis da aka tsara | Asusun mai tsara jadawali/sabis | Yana karanta kache na mai jefa ƙuri'a, yana ƙaddamar da masu tarawa, yana rubuta fayilolin RRD |
| `cmd.php` | Mai jefa ƙuri'a ko hanyar tarawa ta ainihin lokaci | Asusun da ke ƙaddamarwa | Yana aiwatar da buƙatun SNMP da umarnin tarawa |
| `script_server.php` | Mai tarawa | Asusun da ke ƙaddamarwa | Yana haɗa fayil ɗin PHP kuma yana kiran aiki a cikin aikin kansa |
| RRDtool | Ko dai tsarin yanar gizo ko mai jefa ƙuri'a | Duk wanda ya kira shi | Yana karantawa da rubuta fayiloli a ƙarƙashin `rra/` |

Biyu daga cikin waɗannan sun cancanci dubawa sosai.

**Uwar garken rubutun lamba ba akwatin kariya bane (sandbox).** Tana haɗa fayil ɗin da aka nufa a cikin tsarin PHP mai aiki na dogon lokaci kuma tana kiran aiki a ciki.
Wannan aikin yana raba tsarin, ƙwaƙwalwarsa, da haɗin ma'ajiyar bayanansa.
Binciken da ke cikin `script_server.php` yana yanke shawara ko kiran zai faru kwata-kwata: `realpath()` na fayil ɗin da aka haɗa dole ne ya warware
a ƙarƙashin `$config['base_path']` ko `$config['scripts_path']`, dole ne aikin ya kasance bayan an haɗa shi,
`ReflectionFunction::isInternal()` dole ne ya zama ƙarya (false), kuma fayil ɗin da ke bayyana aikin dole ne ya kasance a ƙarƙashin asalin da aka yarda da shi.
Da zarar waɗannan sun wuce, lambar tana aiki tare da cikakken ikon mai jefa ƙuri'a. Hanyar Uwar Garken Rubutun Lamba hanya ce ta gudanar da PHP a cikin Kadupul, ba hanya ce ta gudanar da PHP a gefensa a ware ba.

**Tsarin yanar gizo na iya rubuta fayilolin RRD.** Buƙatun zane na iya haifar da sabuntawar Boost da ƙirƙirar fayil akan buƙata.
Gargaɗin da ke jinkirta hanyar ƙirƙirar babban fayil ɗaya zuwa mai jefa ƙuri'a ba ya sa damar rubuta gidan yanar gizo ta zama ta zaɓi a ko'ina.
Binciken ajiya na yanzu da haɗin gwiwar kulawa suna kuma bincika damar asusu da ingantaccen tsarin lambar UID/GID.
Ƙirƙirar da tushe (root) ke yi tana ƙoƙarin dacewa da mallakar ajiya, amma ana iya yin rikodin gazawa.
Duba [Haɓaka lafiya](/ha/guides/upgrade-safely/).

Asusun yanar gizo da na mai jefa ƙuri'a da aka tsara na iya bambanta. Tarawa ta ainihin lokaci da aka ƙaddamar daga buƙatar yanar gizo na iya gadon asusun yanar gizo,
don haka aiwatar da umarni ba'a iyakance ga ainihin mai jefa ƙuri'a da aka tsara ba kawai.
Haɗin Spine da aka gada yana buƙatar keɓantaccen tabbaci akan ainihin binary; wannan shafin bai kafa tsarin da ake tallafawa ba.

## Abin da asusun ma'ajiyar bayanai ke buƙata

Hanyoyin da ke amfani da tsarin ma'ajiyar bayanai ɗaya yawanci suna raba asusunsa.
Masu tarawa na nesa na iya samun takaddun shaida na gida da na tsakiya daban; tsarin aiki na musamman na iya bambanta.
Bincika ainihin tallafi ga kowane asusun da aka tsara.

| Bukata | Me ya sa |
|---|---|
| Cikakken DML akan tsarin Kadupul | Aiki na yau da kullun |
| DDL akan tsarin Kadupul | Haɓakawa da ayyukan lokacin aiki kamar jujjuyawar teburin Boost, teburan wucin gadi da canje-canjen rayuwar manhaja |
| `SELECT` akan `mysql.time_zone_name` | Jerin yankunan lokaci na rukunin yanar gizo da masu tarawa suna karanta wannan teburin kai tsaye |

Kada ka cire gatan DDL akan tunanin cewa haɓakawa kawai ke buƙatar su.
Manhajar ba ta sauyawa gaba ɗaya zuwa wata asalin ƙaura ta daban; rabuwar asusu tana buƙatar ingantaccen tabbaci na dukkan hanyoyin aiki da abin ya shafa.

`include/config.php` yana ɗauke da takaddun shaidar ma'ajiyar bayanai kuma masu tarawa na nesa na iya riƙe takaddun shaidar `$rdatabase_*` na tsakiya.
Izinin tsarin fayil, ƙa'idodin samun dama na HTTP, tsarin mai sarrafa PHP da kariya na ajiyar waje duk suna da mahimmanci.
PHP yawanci yana aiwatar da fayil ɗin maimakon bayar da lambar tushen sa, amma wannan ba madadin kare shi bane daga bayyanawa kai tsaye.
Duba [Kare tsarin da ke fuskantar intanet](/ha/guides/secure-an-internet-facing-install/).

Ana adana takaddun shaidar na'ura ta wannan hanya. `host.snmp_community`, `host.snmp_password`,
da `host.snmp_priv_passphrase` ginshiƙai ne na yau da kullun, waɗanda `api_device_save()` ya rubuta ta hanyar `form_input_validate()`
ba tare da matakin ɓoye lamba ba, kuma an kwafa a kan layukan `poller_item` don mai jefa ƙuri'a ya karanta.
Samun damar karanta teburan da abin ya shafa na iya bayyana takaddun shaidar na'urar da aka adana; ba yana nufin samun damar kowane tushen shaidar waje ba.
Kalmomin sirri na masu amfani sune keɓantawa: `compat_password_hash()` yana amfani da `password_hash()` na PHP tare da `PASSWORD_DEFAULT`,
kuma tsohuwar hash ta MD5 wacce har yanzu take tabbatarwa ana sake canza ta a shiga ta gaba.

## Wanda aka tilasta, da wanda yake na al'ada kawai

Wannan shine bambancin da ya fi mahimmanci lokacin yin tunani game da canji.

### Hanyoyin lamba da iyakokinsu

| Iyaka | Hanyar aiki |
|---|---|
| Tabbatar da mai amfani | Shafukan gama-gari suna amfani da `include/auth.php`; wuraren da aka keɓance suna da nasu tsarin sarrafawa |
| CSRF | Saitin gidan yanar gizo yana tsara sarrafa alamar tsaro; ana ƙin jerin alamun da suka lalace. Bincika kowane wuri da hanyar aikawa maimakon ɗaukar cikakken kariya |
| Rubutun lamba na CLI kawai | `include/cli_check.php` yana amsa da `404` kuma yana fita lokacin da SAPI ba `cli` bane |
| Wurin XML na tambayar bayanai | `cacti_path_is_within()` akan `<base_path>/resource`, ana yin rikodin kuma a ƙi idan ba haka ba |
| Amincin kunshin | Sa hannu akan maɓallin da aka haɗa a ciki, mafi ƙarancin biti 2048, sa hannun kowane fayil |
| Wurin ajiye fayilolin kunshin | Ana ƙin sunayen da ba su da inganci; ana bincika prefixes na rubutun/albarkatun da aka yarda da su da kuma kariyar tushen da aka warware |
| Manufofin uwar garken rubutun lamba | Kariyar `realpath()`, tare da binciken ayyuka a sama |
| Muhawarar Shell | Kaucewa lambobin haɗari, mataimakan umarni da masu tabbatarwa a inda aka yi amfani da su; duba ainihin wurin kira |
| Muhawarar RRDtool | Masu tabbatar da haruffan sarrafawa da siffofi a cikin `lib/functions.php` |
| SQL | Mataimaka da aka shirya suna ɗaure ƙimomi; SQL mai canzawa, masu ganowa da kiran da ba a shirya ba har yanzu suna buƙatar bita |
| Masu kiran wakili na nesa | Adireshin tushe dole ne ya dace da layin da aka kunna a cikin `poller`, ta hanyar IP daidai ko ta hanyar binciken baya da aka tabbatar a gaba |

### Nauyin turawa da wurin kira

| Iyaka | Me ya sa ba a tilasta shi ba a cikin lamba |
|---|---|
| Tacewar buƙatu | Shafi yana zaɓar `get_filter_request_var()` ko a'a. `log_validation` yana ba da rahoto, ba ya toshewa |
| Kaucewa fitarwa | `html_escape()` da `html_purify()` ana amfani da su a kowane wurin kira daban-daban |
| Izinin kowane shafi | Binciken yanki yana amfani da `$user_auth_realm_filenames`, wanda aka saita akan sunan fayil. Shafi da ba a tsara shi ba ba ya samun ingantaccen binciken yanki daga wannan taswirar kaɗai. Ƙarin binciken ƙarshe/abu na iya aiki; dole ne shafukan manhaja su yi rajista kuma su aiwatar da manufofinsu na shiga |
| Hana manyan fayiloli | Fayilolin `.htaccess` a ƙarƙashin `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, da `cache/*` umarni ne na Apache. A ƙarƙashin nginx, ko a ƙarƙashin Apache tare da kashe `AllowOverride`, babu ɗayan da ya shafi |
| Taken tsaro akan fayiloli marasa canzawa | Ana tura `.htaccess.dist` ba tare da sake masa suna ba. Fitar da taken PHP ya dogara da hanyar amsawa da saitunan sa; amsoshi marasa canzawa sun dogara da ainihin tsarin uwar garke/wakili |
| Rabuwa tsakanin masu amfani da yanar gizo da mai jefa ƙuri'a | Al'ada ce, ba buƙata ba |
| Izini akan `include/config.php` | Wanda ya shigar da shi ne ya saita |

Hanyoyin juyar da kai na `index.php` a cikin `resource/` da ƙananan kundayenta suna dakatar da lissafin babban fayil.
Ba sarrafa damar shiga bane kuma ba sa dakatar da buƙatar kai tsaye don fayil ɗin da aka ambata.

## Wuraren da ke amsawa kafin tabbatar da mai amfani

Waɗannan misalai ne na ƙwararrun wuraren shiga, ba cikakken lissafin wuraren shiga na jama'a ba.
Rashin fayil ɗin gama-gari ba ya tabbatar da rashin tabbatarwa ko izini a wani wuri a cikin hanyar buƙata.

| Fayil | Halayya |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Tsarin shiga kansa |
| `csp_report.php` | Yana karɓar rahotannin keta dokar CSP daga mashigin yanar gizo |
| `service_check.php` | Yana amsa `success` ko `fail` bayan tambaya ɗaya akan `version`. Binciken lafiya ba tare da tabbatarwa ba |
| `link.php` | Yana ɗora layin hanyar waje, sannan yana bincika `is_realm_allowed($page['id'] + 10000)` da kansa |
| `remote_agent.php` | Kiran RPC na mai tarawa, wanda aka ba da izini ta adireshin tushe |

`remote_agent.php` shine wanda ya kamata a yi tunani a kansa sosai. Izinin sa shine `remote_client_authorized()`,
wanda ke kwatanta `get_client_addr()` da sunayen uwar garke da adiresoshin da ke cikin teburin `poller`. Babu wani asiri na gama-gari.
Mai kiran da adireshinsa ya dace da layin mai tarawa da aka kunna zai iya kiran ayyukan wakili:
jefa ƙuri'ar bayanai, gudanar da tambayar bayanai, gwada na'ura ta hanyar ping, yin SNMP get da walk, buƙatar bayanan zane, da gudanar da binciken hanyar sadarwa.
Kariya guda biyu ne suka tsara wannan:
Na farko, aikin yana dawo da false kai tsaye lokacin da layin mai tarawa ɗaya kawai ko ƙasa da haka ya dawo, don haka wannan aikin yana ƙin wannan yanayin.
Na biyu, lokacin da daidaitawar ta kasance ta sunan uwar garke maimakon daidai IP, ana tabbatar da binciken baya ta hanyar binciken gaba kafin a karɓe shi.

`get_client_addr()` yana karanta `REMOTE_ADDR` kuma babu wani abu sai dai idan an saita `$proxy_headers` a cikin `include/config.php`.
Tsohuwar hanyar da aka tura ita ce `null`. Kunna taken wakili da ake tallafawa yana canza tushen da aka tsara wanda ake zaɓar ingantaccen adireshin abokin ciniki daga ciki.
Yi amfani da taken da amintaccen wakilin shiga ke sarrafawa kawai, kuma hana abokan ciniki wucewa ko samar da waɗannan ƙimomin da kansu.
Wannan shine layi ɗaya na tsari wanda ya fi canza ma'anar kowane yanke shawara da ya dogara da adireshi a cikin tsarin,
gami da izinin wakili na nesa da adiresoshin da aka rubuta a cikin rajista.

## Samun damar baƙo (Guest access)

Saitin `guest_user` yana kiran asusun da ake amfani da izinin sa don shafukan zane ba tare da shiga ba.
Ya zama tsohuwar hanya ba tare da mai amfani ba, kuma kallon zane yana buƙatar tabbatarwa kamar kowane abu.
Saita shi yana buga duk abin da wannan asusun zai iya gani, ga duk wanda zai iya isa ga uwar garken yanar gizo.
Wannan shine ainihin manufar fasalin. Asusun har yanzu yana nan a cikin bayanan masu amfani; saitin baƙo shine abin da ke sa izinin zanen sa ya kasance mai amfani ba tare da shiga na yau da kullun ba.
Tabbatar da ainihin buƙatu da izinin abubuwa, ba kawai sunan asusun da aka tsara ba.

## Yadda ake yin tunani game da canji

Yi tambayoyi guda uku a jere.

Wane tsari ne zai gudanar da wannan, kuma a matsayin wane mai amfani? Amsar hanyar shigar da bayanai yawanci ita ce asusun tsarin aiki na mai tarawa da ke ƙaddamarwa;
tarawa da aka haifar daga gidan yanar gizo na iya bambanta da tarawa da aka tsara a jadawali.

Menene bayanan ke taɓawa a hanyarsu ta wucewa? Ƙimar da ta fito daga na'ura wacce kawai ta sauka a cikin fayil ɗin RRD ta ƙetare iyaka ɗaya.
Irin wannan ƙimar a cikin taken zane ta ƙetare iyakoki biyu, kuma a cikin muhawarar rubutun lamba, guda uku.

Shin iyakar da nake dogaro da ita an aiwatar da ita ne a lamba ko kuma ta al'ada ce kawai? Idan ta al'ada ce, lambar da kake rubutawa ita ce ainihin tilastawar.

Karatun da ke da alaƙa: [Izini da shiga](/ha/concepts/permissions-and-access/) don ainihin samfurin ba da izini,
[Hanyoyin shigar da bayanai](/ha/reference/data-input-methods/) don kwangilar aiwatarwa da jerin abubuwan da aka yarda da su,
da kuma [Tarin bayanai na nesa](/ha/concepts/remote-data-collection/) don abin da mai tarawa ke yi da amincin da aka ba shi.
