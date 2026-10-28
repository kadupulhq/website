---
title: Muundo wa usalama
description: Ambapo data isiyoaminika huingia Kadupul, mchakato gani unaendeshwa na mamlaka gani, nini akaunti ya hifadhidata inaweza kufanya, na ni mipaka gani ambayo msimbo unatekeleza badala ya kudhani tu.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 12
---

Mfumo wa ufuatiliaji ni kitu kigumu kukitetea, kwa sababu tatu ambazo hazina uhusiano wowote na ubora wa msimbo.

Unashikilia vitambulisho vya kila kitu unachokitazama. Jumuiya za SNMP, majina ya watumiaji na manenosiri ya toleo la 3,
na chochote kingine ambacho kifaa kinahitaji vimehifadhiwa ili poller iweze kuvitumia bila uangalizi wa mwanadamu.
Hakuna binadamu wa kuvichapa kila baada ya dakika tano.

Hufanya maagizo kulingana na ratiba. Kukusanya thamani ambayo SNMP haionyeshi kunamaanisha kuendesha hati (script),
na ufafanuzi wa hati hiyo ni usanidi, uliohifadhiwa kwenye hifadhidata na unaoweza kuhaririwa kupitia kiolesura.

Humeza data ambayo mashine inazotazama huzalisha. Maelezo ya kiolesura, sehemu ya kupachika diski, jina la kitambuzi:
yote hayo hufika kutoka kwa kifaa, na yote huishia kwenye hifadhidata, katika vichwa vya habari vya grafu, na katika hoja zinazotolewa kwa programu zingine.
Swichi iliyoathiriwa ni chanzo cha ingizo, si mwathirika tu.

Hakuna hata moja kati ya haya lililo kasoro. Ni kile ambacho kazi inahitaji. Kinachofuata ni mahali ambapo kila moja hutua katika usanifu wa mfumo.

## Ambapo ingizo lisiloaminika huingia

Njia nne za kuingilia, kwa mpangilio wa jinsi mwendeshaji anavyozidhibiti.

| Sehemu ya kuingilia | Chanzo | Inakoelekea |
|---|---|---|
| Vigezo vya HTTP | Mtu yeyote anayeweza kufikia seva ya wavuti | Hifadhidata, matokeo ya ukurasa, na SQL |
| Thamani za SNMP | Kifaa kinachopigiwa kura | `host_snmp_cache`, majina ya grafu, mipaka ya RRD, hoja za hati |
| Matokeo ya hati | Hati ya ndani, au chochote ilichozungumza nacho | `poller_output`, kisha faili za RRD |
| Violezo na vifurushi vilivyopakiwa | Yeyote anayeshikilia uwanja wa uingizaji | Safu mlalo za violezo, na kwa vifurushi, faili kwenye diski |

### Vigezo vya HTTP

Wasaidizi wa maombi wanaishi katika `lib/html_utility.php`. `get_filter_request_var()` hubadilika
kwa chaguo-msingi kuwa uthibitishaji wa nambari kamili, lakini pia ina kesi maalum za maadili tupu, yasiyoelezwa na maonyesho ya regex.
Mpigaji simu bado anahitaji kuangalia ikiwa thamani inahitajika na inafaa kwa operesheni. Kuchuja hakuanzishi idhini ya usalama.

`set_request_var()` huhifadhi thamani kwenye `$_CACTI_REQUEST` na kuakisi kwenye safu za maombi.
`get_nfilter_request_var()` husoma kache hiyo au ombi ghafi na haithibitishi au kuandika thamani yenyewe.
Kwa hivyo usomaji wa baadaye unaweza kuona thamani iliyohifadhiwa hapo awali, na mpangilio wa usomaji ni muhimu.

Kukiwa na `log_validation` imewezeshwa, `get_request_var()` huingiza kwenye kumbukumbu baadhi ya usomaji wa maombi yasiyohifadhiwa.
Usomaji wa moja kwa moja wa vigezo vya kimataifa (superglobals) na `get_nfilter_request_var()` hazishughulikiwi zote.
Ni msaada wa uchunguzi, si ukaguzi kamili wa uthibitishaji au utekelezaji wa kiusalama.

### Thamani za SNMP

Ugunduzi wa maswali ya data huhifadhi thamani zilizochaguliwa za fahirisi katika `host_snmp_cache`; matokeo ya kawaida ya upigaji kura wa SNMP hufuata njia ya sampuli.
`data_query_format_record()` katika `lib/data_query.php` hutumia mabadiliko mawili kabla ya kuhifadhi:
ramani ya hiari ya `rewrite_value` kutoka kwa ufafanuzi wa swali, na `bin2hex()` kwenye thamani yoyote ambayo usimbaji wake `mb_detect_encoding()` hauwezi kutambua.
Hiyo ya pili ni ulinzi dhidi ya mifuatano ya baiti za binary (binary octet strings), si dhidi ya maudhui hasidi.

Kutoka hapo thamani husafiri. Hutaja grafu kupitia `substitute_snmp_query_data()`.
Inaweza kuweka kiwango cha juu cha RRD, kwa sababu kiolezo cha data kinaweza kutangaza kiwango cha juu kama `|query_ifSpeed|`.
Inakuwa hoja kwa swali la hati, ambapo `get_script_query_path()` hupitisha kila sehemu kupitia `cacti_escapeshellarg()` kwanza.

Kuepuka msimbo hatari na wathibitishaji wa RRDtool walioelezewa katika
[Ujumuishaji wa RRDtool](/sw/reference/rrdtool-integration/) ndio mipaka hapa.
Data ya kifaa lazima ibaki bila kuaminiwa. Uthibitishaji na kuepuka ni mali ya kila tovuti ya simu;
uwepo wa wasaidizi si uthibitisho kwamba kila mtumiaji anawatumia kwa usahihi. Kagua muundo wa amri na hoja iliyobadilishwa.

### Matokeo ya hati

Tawi la `popen()` la `exec_poll()` husoma kwa `fgets(..., 8192)`, ikirudisha zaidi ya baiti 8,191 au mstari mpya wa kwanza.
Mbadala wake wa `shell_exec()` una tabia tofauti ya matokeo, na ukusanyaji wa seva ya hati hufuata njia nyingine.

`prepare_validate_result()` hutambua thamani za nambari na zisizojulikana, maumbo ya hexadecimal na miundo ya matokeo ya nyanja nyingi.
Inaweza pia kuondoa maandishi ili kupata thamani ya nambari; si kichujio kigumu cha jumla cha scalar.
Uchambuzi unaofuata na uthibitishaji wa RRDtool ni muhimu pia. Tazama [Mbinu za uingizaji data](/sw/reference/data-input-methods/).

Ukaguzi wa matokeo hautengi hati ambayo tayari imetekelezwa.
Kagua amri, orodha nyeupe ya ingizo na mamlaka ya mfumo wa uendeshaji kabla ya kuwezesha ukusanyaji.

### Violezo na vifurushi

Taratibu mbili tofauti zinashiriki uwanja mmoja wa ruhusa.

**Uingizaji wa kiolezo** ni XML rahisi bila saini. Huunda violezo, maswali ya data, na mbinu za kuingiza data.
Mbinu ya kuingiza data ni mstari wa amri, kwa hivyo hii ni njia kutoka kwa faili iliyopakiwa hadi kitu ambacho poller itatekeleza.
`lib/import.php` huendesha `cacti_input_string_is_safe()` kwenye `input_string` yoyote iliyoingizwa na kukataa mbinu hiyo inapokuwa na herufi za meta za shell, ikiandika:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

**Uingizaji wa kifurushi** umetiwa saini. `import_read_package_data()` husoma ufunguo wa umma uliopachikwa wa kifurushi
na kulinganisha dhidi ya funguo tatu zilizojumuishwa ndani ya `lib/import.php`: funguo mbili za Cacti na ufunguo wa Kadupul.
Ufunguo mwingine wowote hushindwa. Kifurushi kisicho na kipengele cha `<publickey>` husomwa kama kinachodai ufunguo wa zamani wa Cacti,
na kisha kinapaswa kutoa saini inayothibitishwa dhidi yake.
`import_read_package_data()` hukataa ufunguo wowote chini ya biti 2048 kabla ya kujaribu uthibitishaji, ambao ufunguo wa zamani, wenye biti 512, haufikii.
Kila faili iliyomo hubeba saini yake yenyewe, iliyothibitishwa kando.

Vifurushi vinaweza kuandika faili zilizochaguliwa. Majina yanayokubaliwa huanza na `scripts/` au `resource/`,
kwa hiari chini ya kiambishi awali halali cha `plugins/<name>/`. Mwingizaji hukataa herufi za NUL, njia za uvukaji (traversal) na njia kamili
na hutatua kizuizi chini ya mzizi wa usakinishaji; kuwa na jina la saraka pekee haitoshi.
Uwezo wa kuandika wa lengwa pia hudhibiti ikiwa uandishi utafaulu. Kifurushi kinachopita uthibitishaji huandika PHP inayoweza kutekelezwa kwenye mti wa usakinishaji kwa muundo.
Uthibitishaji wa saini unaonyesha utambulisho na uadilifu unaokubalika wa utiaji saini, si kwamba msimbo hauna madhara.
Idhini ya uwanja, kizuizi cha njia, faili zilizochaguliwa, ruhusa za mfumo wa faili na sera ya orodha nyeupe ya amri pia ni muhimu.

Taratibu zote mbili ziko nyuma ya uwanja wa 17. Wajibu wa kawaida wa Kihariri cha Kiolezo unashikilia uwanja wa 17 na uwanja wa 2 (Mbinu za Kuingiza Data).
Akaunti iliyo na ruhusa hizo inaweza kufafanua amri za ukusanyaji, kulingana na uthibitishaji na ushughulikiaji wa orodha nyeupe.
Hiyo ndiyo kazi ya wajibu huo, na inafaa kujua kabla ya kuitoa.
Tazama [Ingiza na toa violezo](/sw/guides/import-and-export-templates/) kwa mtiririko wa kazi uliothibitishwa na mapungufu yanayojulikana.

## Nini hufanya kazi na mamlaka gani

| Mchakato | Huanzishwa na | Hufanya kazi kama | Hufanya nini |
|---|---|---|---|
| Kiolesura cha wavuti | Seva ya wavuti | Mtumiaji wa seva ya wavuti | Husoma na kuandika hifadhidata, huonyesha grafu kupitia RRDtool, huandika faili za RRD kwa mahitaji, huandika faili za kifurushi wakati wa kuingiza |
| `poller.php` | Kipanga ratiba au huduma iliyosanidiwa | Akaunti ya kipanga ratiba/huduma | Husoma kache ya poller, huzindua wakusanyaji, huandika faili za RRD |
| `cmd.php` | Poller au njia ya ukusanyaji wa wakati halisi | Akaunti inayozindua | Hufanya maombi ya SNMP na amri za ukusanyaji |
| `script_server.php` | Mkusanyaji | Akaunti inayozindua | Hujumuisha faili ya PHP na kuita kazi katika mchakato wake yenyewe |
| RRDtool | Mchakato wa wavuti au poller | Yeyote aliyeiita | Husoma na kuandika faili chini ya `rra/` |

Mambo mawili kati ya hayo yanastahili kuangaliwa kwa karibu.

**Seva ya hati si kisanduku salama (sandbox).** Inajumuisha faili lengwa kwenye mchakato wa PHP unaoendeshwa kwa muda mrefu na kuita kazi ndani yake.
Kazi hiyo inashiriki mchakato, kumbukumbu yake, na muunganisho wake wa hifadhidata.
Ukaguzi katika `script_server.php` huamua ikiwa wito utatokea kabisa: `realpath()` ya faili iliyojumuishwa lazima itatuliwe
chini ya `$config['base_path']` au `$config['scripts_path']`, kazi lazima iwepo baada ya kujumuishwa,
`ReflectionFunction::isInternal()` lazima iwe uongo (false), na faili inayofafanua kazi lazima pia iwe chini ya mzizi unaoruhusiwa.
Zikipita hizo, msimbo hufanya kazi kwa mamlaka kamili ya poller. Njia ya Seva ya Hati ni njia ya kuendesha PHP ndani ya Kadupul, si njia ya kuendesha PHP kando yake kwa kutengwa.

**Mchakato wa wavuti unaweza kuandika faili za RRD.** Maombi ya grafu yanaweza kuanzisha masasisho ya Boost na uundaji wa faili kwa mahitaji.
Onyo linaloahirisha njia moja ya kuunda saraka kwa poller halifanyi ufikiaji wa uandishi wa wavuti kuwa wa hiari kwa jumla.
Ukaguzi wa sasa wa kabla ya uhifadhi na uratibu wa matengenezo pia hukagua ufikiaji wa akaunti na usanidi wa UID/GID wa nambari unaoaminika.
Uundaji unaoendeshwa na mizizi (root) hujaribu kulinganisha umiliki wa hifadhi, lakini hitilafu zinaweza kuandikwa kwenye kumbukumbu.
Tazama [Boresha kwa usalama](/sw/guides/upgrade-safely/).

Akaunti za wavuti na za poller iliyoratibiwa zinaweza kutofautiana. Ukusanyaji wa wakati halisi uliozinduliwa kutoka kwa ombi la wavuti unaweza kurithi akaunti ya wavuti,
kwa hivyo utekelezaji wa amri hauzuiliwi na utambulisho wa poller iliyoratibiwa pekee.
Ujumuishaji wa Spine uliorithiwa unahitaji uthibitishaji tofauti dhidi ya faili halisi; ukurasa huu hauanzishi muundo unaotumika.

## Kile ambacho akaunti ya hifadhidata inahitaji

Michakato inayotumia usanidi sawa wa hifadhidata kwa kawaida hushiriki akaunti yake.
Wakusanyaji wa mbali wanaweza kuwa na vitambulisho tofauti vya ndani na vya kati; usanidi mahususi wa usambazaji unaweza kutofautiana.
Kagua ruzuku halisi kwa kila akaunti iliyosanidiwa.

| Mahitaji | Kwa nini |
|---|---|
| DML kamili kwenye muundo wa Kadupul | Uendeshaji wa kawaida |
| DDL kwenye muundo wa Kadupul | Maboresho na shughuli za wakati wa utekelezaji kama vile mzunguko wa meza za Boost, majedwali ya muda na mabadiliko ya mzunguko wa maisha ya programu-jalizi |
| `SELECT` kwenye `mysql.time_zone_name` | Orodha za maeneo ya saa ya tovuti na wakusanyaji wa data husoma jedwali hilo moja kwa moja |

Usiondoe mamlaka ya DDL kwa dhana kwamba maboresho pekee ndiyo yanayoyahitaji.
Programu haibadiliki kwa jumla kuwa utambulisho tofauti wa uhamishaji; utengano wa akaunti unahitaji uthibitishaji mahususi wa usambazaji wa njia zote zilizoathiriwa za wakati wa utekelezaji.

`include/config.php` ina vitambulisho vya hifadhidata na wakusanyaji wa mbali wanaweza pia kushikilia vitambulisho vya kati vya `$rdatabase_*`.
Ruhusa za mfumo wa faili, sheria za ufikiaji wa HTTP, usanidi wa kishughulikiaji cha PHP na ulinzi wa nakala rudufu zote ni muhimu.
Kawaida PHP hutekeleza faili badala ya kutoa msimbo wake wa chanzo, lakini hiyo si mbadala wa kuilinda dhidi ya ufichuzi wa moja kwa moja.
Tazama [Linda usakinishaji unaotazamana na mtandao](/sw/guides/secure-an-internet-facing-install/).

Vitambulisho vya kifaa huhifadhiwa kwa njia sawa. `host.snmp_community`, `host.snmp_password`,
na `host.snmp_priv_passphrase` ni safu wima za kawaida, zilizoandikwa na `api_device_save()` kupitia `form_input_validate()`
bila hatua ya usimbaji fiche, na kunakiliwa kwenye safu mlalo za `poller_item` ili poller isome.
Ufikiaji wa kusoma majedwali husika unaweza kufichua vitambulisho vilivyohifadhiwa vya kifaa; haimaanishi ufikiaji wa kila chanzo kinachowezekana cha kitambulisho cha nje.
Manenosiri ya watumiaji ndiyo ubaguzi: `compat_password_hash()` hutumia `password_hash()` ya PHP na `PASSWORD_DEFAULT`,
na hash ya zamani ya MD5 ambayo bado inathibitisha hubadilishwa upya kwenye kuingia tena.

## Vilivyotekelezwa, na vya kimila tu

Huu ndio utofauti ambao ni muhimu zaidi wakati wa kufikiria kuhusu mabadiliko.

### Taratibu za msimbo na upeo wake

| Mpaka | Utaratibu |
|---|---|
| Uthibitishaji wa mtumiaji (Authentication) | Kurasa za kawaida za kiolesura hutumia `include/auth.php`; sehemu maalum zina ushughulikiaji wao wenyewe |
| CSRF | Usanidi wa pamoja wa wavuti husanidi ushughulikiaji wa tokeni; safu za tokeni zilizoharibika hukataliwa. Kagua kila sehemu na njia ya utumaji badala ya kudhani ulinzi wa jumla |
| Hati za CLI pekee | `include/cli_check.php` hujibu kwa `404` na kuondoka wakati SAPI si `cli` |
| Eneo la XML la swali la data | `cacti_path_is_within()` dhidi ya `<base_path>/resource`, hurekodiwa na kukataliwa vinginevyo |
| Uhalisi wa kifurushi | Saini dhidi ya ufunguo uliokusanywa ndani, kima cha chini cha biti 2048, saini za kila faili |
| Uwekaji wa faili ya kifurushi | Majina batili hukataliwa; viambishi vya hati/rasilimali vinavyoruhusiwa na kizuizi cha mzizi uliotatuliwa hukaguliwa |
| Malengo ya seva ya hati | Kizuizi cha `realpath()`, pamoja na ukaguzi wa kazi hapo juu |
| Hoja za Shell | Kuepuka msimbo, wasaidizi wa amri zilizopangwa na wathibitishaji ambapo inatumika; kagua tovuti halisi ya simu |
| Hoja za RRDtool | Wathibitishaji wa herufi za udhibiti na maumbo katika `lib/functions.php` |
| SQL | Wasaidizi waliotayarishwa hufunga maadili; SQL inayobadilika, vitambulisho na simu zisizotayarishwa bado zinahitaji ukaguzi |
| Wapiga simu wa wakala wa mbali | Anwani ya chanzo lazima ilingane na safu mlalo iliyowezeshwa katika `poller`, kwa IP halisi au kwa utafutaji wa nyuma uliothibitishwa mbele |

### Majukumu ya usambazaji na tovuti ya simu

| Mpaka | Kwa nini haujatekelezwa na msimbo |
|---|---|
| Kuchuja maombi | Ukurasa unachagua `get_filter_request_var()` au la. `log_validation` huripoti, haizuii |
| Kuepuka matokeo | `html_escape()` na `html_purify()` hutumiwa kwa kila tovuti ya simu |
| Idhini kwa kila ukurasa | Ukaguzi wa uwanja hutumia `$user_auth_realm_filenames`, iliyofungwa kwenye jina la faili. Ukurasa ambao haujapangwa haupati ukaguzi mzuri wa uwanja kutoka kwa ramani hiyo pekee. Ukaguzi wa ziada wa sehemu/kitu unaweza kutumika; kurasa za programu-jalizi lazima zisajili na kutekeleza sera yao ya ufikiaji |
| Kukataa saraka | Faili za `.htaccess` chini ya `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, na `cache/*` ni maagizo ya Apache. Chini ya nginx, au chini ya Apache yenye `AllowOverride` imezimwa, hakuna hata moja inayotumika |
| Vichwa vya usalama kwenye faili tuli | `.htaccess.dist` inasafirishwa bila kubadilishwa jina. Utoaji wa vichwa vya PHP unategemea njia ya majibu na mipangilio yake; majibu tuli yanategemea usanidi halisi wa seva/seva mbadala |
| Utengano wa watumiaji wa wavuti na poller | Ni desturi, si sharti la lazima |
| Ruhusa kwenye `include/config.php` | Huwekwa na yeyote aliyeisakinisha |

Miongozo ya uelekezaji ya `index.php` katika `resource/` na vijisehemu vyake huzuia uorodheshaji wa saraka.
Sio udhibiti wa ufikiaji na haizuii ombi la moja kwa moja la faili iliyotajwa.

## Vituo vinavyojibu kabla ya uthibitishaji

Hii ni mifano ya sehemu maalum za kuingilia, si orodha kamili ya vituo vya umma.
Kukosekana kwa faili ya kawaida ya kujumuisha hakuthibitishi kukosekana kwa uthibitishaji au idhini mahali pengine kwenye njia ya ombi.

| Faili | Tabia |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Kiolesura cha kuingia chenyewe |
| `csp_report.php` | Hupokea ripoti za ukiukaji wa CSP kutoka kwa kivinjari |
| `service_check.php` | Hujibu `success` au `fail` baada ya swali moja dhidi ya `version`. Uchunguzi wa uhai usio na uthibitishaji |
| `link.php` | Hupakia safu ya kiungo cha nje, kisha hukagua `is_realm_allowed($page['id'] + 10000)` yenyewe |
| `remote_agent.php` | RPC ya mkusanyaji wa data, iliyoidhinishwa na anwani ya chanzo |

`remote_agent.php` ndiyo inayopaswa kufikiriwa kwa kina. Idhini yake ni `remote_client_authorized()`,
ambayo inalinganisha `get_client_addr()` dhidi ya majina ya seva na anwani katika jedwali la `poller`. Hakuna siri ya pamoja.
Mpigaji simu ambaye anwani yake inalingana na safu ya mkusanyaji wa data aliyewezeshwa anaweza kuita vitendo vya wakala:
kupiga kura ya data, kuendesha swali la data, kupiga ping kifaa, kufanya SNMP get na walk, kuomba data ya grafu, na kuendesha ugunduzi wa mtandao.
Ulinzi mbili hutengeneza hili:
Kwanza, kazi inarudi false moja kwa moja wakati safu mlalo moja tu au chini ya mkusanyaji aliyewezeshwa inarudishwa, kwa hivyo kesi hiyo inakataliwa na kazi hii.
Pili, wakati ulinganifu ni kwa jina la mpangishi badala ya IP kamili, utafutaji wa nyuma unathibitishwa na utafutaji wa mbele kabla ya kukubaliwa.

`get_client_addr()` husoma `REMOTE_ADDR` na hakuna kingine isipokuwa `$proxy_headers` imewekwa katika `include/config.php`.
Chaguo-msingi lililosafirishwa ni `null`. Kuwezesha vichwa vinavyotumika vya seva mbadala hubadilisha vyanzo vilivyopangwa ambapo anwani halali ya mteja huchaguliwa.
Tumia tu vichwa vinavyodhibitiwa na seva mbadala ya kuingilia inayoaminika, na uzuie wateja kukwepa au kusambaza maadili hayo wenyewe.
Huu ndio mstari mmoja wa usanidi unaobadilisha zaidi maana ya kila uamuzi unaotegemea anwani katika mfumo,
ikiwa ni pamoja na idhini ya wakala wa mbali na anwani zilizorekodiwa kwenye kumbukumbu.

## Ufikiaji wa mgeni (Guest access)

Mpangilio wa `guest_user` unataja akaunti ambayo ruhusa zake zinatumika kwa kurasa za grafu bila kuingia.
Hubadilika kwa chaguo-msingi kuwa hakuna mtumiaji, na kutazama grafu basi kunahitaji uthibitishaji kama kila kitu kingine.
Kuweka mpangilio huo huchapisha chochote ambacho akaunti hiyo inaweza kuona, kwa mtu yeyote anayeweza kufikia seva ya wavuti.
Hayo ndiyo madhumuni ya kipengele hicho. Akaunti bado ipo katika rekodi za watumiaji; mpangilio wa mgeni ndio unaofanya ruhusa zake zinazotumika za grafu zitumike bila kuingia kawaida.
Thibitisha maombi halisi na ruhusa za vitu, si jina la akaunti iliyosanidiwa tu.

## Jinsi ya kufikiria kuhusu mabadiliko

Uliza maswali matatu kwa mpangilio.

Ni mchakato gani utaendesha hii, na kama mtumiaji gani? Jibu la mbinu ya kuingiza data kwa kawaida ni akaunti ya mfumo wa uendeshaji ya mkusanyaji anayezindua;
ukusanyaji unaoanzishwa na wavuti unaweza kutofautiana na ukusanyaji ulioratibiwa.

Je, data inagusa nini njiani inakopita? Thamani kutoka kwa kifaa ambayo huishia tu kwenye faili ya RRD imevuka mpaka mmoja.
Thamani hiyohiyo katika kichwa cha grafu imevuka mipaka miwili, na katika hoja ya hati, mitatu.

Je, mpaka ninaoutegemea unatekelezwa na msimbo au ni wa kimila tu? Ikiwa ni wa kimila, msimbo unaouandika ndio utekelezaji halisi.

Usomaji unaohusiana: [Ruhusa na ufikiaji](/sw/concepts/permissions-and-access/) kwa muundo wa idhini wenyewe,
[Mbinu za uingizaji data](/sw/reference/data-input-methods/) kwa mkataba wa utekelezaji na orodha nyeupe ya ingizo,
na [Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/) kwa kile ambacho mkusanyaji wa data hufanya na uaminifu aliopewa.
