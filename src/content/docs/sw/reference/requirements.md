---
title: "Mahitaji"
description: "Mahitaji ya mazingira ya uendeshaji, hifadhi na uwekaji kwa mipango ya 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha."
---

Imekaguliwa tarehe 26 Oktoba 2026 kwa kulinganisha na marekebisho ya programu yaliyounganishwa hapa chini. Msingi huu ni wa mipango ya 2026–2027; si ahadi ya toleo au usaidizi.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Mazingira ya uendeshaji

`main` inahitaji PHP 8.4 au mpya zaidi na inachanganya Symfony 7.4 na sehemu za kuingilia za mfumo wa awali. Tawi la `lts/1.2` lina mahitaji tofauti. Sakinisha MySQL au MariaDB, RRDtool, na kikusanyaji cha PHP au toleo lililojengwa la Spine linalooana. Unapojenga kutoka msimbo chanzo, tumia matoleo ya `mise.toml` kupitia `mise exec`; sakinisha vitegemezi vilivyofungwa bila kuviboresha.

## PHP

Faili ya mahitaji inahitaji viendelezi hivi pamoja na PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Kisakinishaji hukagua kando, miongoni mwa vingine, `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` na `zlib`. Kwenye Unix hukagua `posix` na `pcntl` ya CLI; kwenye Windows hukagua `com_dotnet`. Kupita kisakinishaji hakuthibitishi kutimizwa kwa mahitaji ya Composer. Kagua PHP ya CLI na ya wavuti kando. Weka `date.timezone`; kisakinishaji kinapendekeza `memory_limit=400M` na `max_execution_time=60`, au thamani zisizo na kikomo. Kiendelezi cha hiari `snmp` huwezesha hoja ndani ya mchakato; `gettext` huwezesha katalogi za tafsiri.

## Hifadhidata

Tumia toleo la MySQL au MariaDB linalodumishwa na mtoa huduma na ulithibitishe kwa marekebisho unayolenga. Viwango vya zamani vya kisakinishaji vya MySQL 5.6 na MariaDB 10.0 havithibitishi usaidizi wa 2026–2027. Kwenye `main`, `poller_output`, `poller_output_boost` na `poller_output_realtime` hutumia InnoDB; baadhi ya majedwali ya uratibu bado hutumia MEMORY. Usibadilishe majedwali yote kutumia injini moja. Jaza `mysql.time_zone_name` na upe akaunti ya programu ruhusa ya SELECT kwenye jedwali hilo.

## RRDtool

Weka njia kamili ya faili inayotekelezeka na ulinganishe toleo lililosanidiwa na lililosakinishwa. `DCOUNTER` na `DDERIVE` zinahitaji RRDtool 1.5 au mpya zaidi. Hifadhi ya ndani ya Unix inahitaji ukaguzi wa utambulisho wa POSIX na `flock` ya saraka inayofanya kazi. Simamisha michakato ya nje ya kuandika na huduma za kache kabla ya matengenezo ya kipekee. Njia ya proksi ya mfumo wa awali ipo, lakini si hakikisho la uwekaji uliothibitishwa.

## net-snmp

Sakinisha zana za Net-SNMP ikiwa PHP `snmp` haipo au imezimwa. Weka `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` na `path_snmptrap` kwa njia za faili zinazotekelezeka zinazolingana. Jaribu njia iliyochaguliwa kwa toleo la SNMP la kifaa, ikiwemo SNMPv3 kupitia IPv6 inapohusika; kisakinishaji cha awali hakipendekezi PHP `snmp` kwa mchanganyiko huo.

## Seva ya wavuti

Endesha PHP kupitia mazingira ya wavuti yaliyosanidiwa na utumie TLS. Hifadhi njia za awali pamoja na `/app.php/...`; usibadilishe mzizi mzima wa nyaraka kuwa `public/` wakati kurasa za awali bado zinahitajika. Sanidi PATH_INFO kwa sehemu ya kuingilia ya uoanifu. Nginx hupuuza `.htaccess`; weka kanuni za wazi za kukataa ufikiaji wa msimbo chanzo, usanidi, vitegemezi, zana, majaribio, siri na hali ya uendeshaji kabla ya uchakataji wa PHP. Linganisha kiambishi cha mwanzo cha URL na `$url_path`.

## Kipangaji

Tumia utaratibu mmoja wa kuanzisha: cron, Task Scheduler au huduma ya kikusanyaji inayoendeshwa nyuma iliyotolewa. Linganisha marudio yake na kipindi cha kuanzisha kilichosanidiwa. Ukusanyaji wa chini ya dakika moja huendeshwa ndani ya kipindi hicho; cron pekee haitoi ratiba hiyo. Endesha ukaguzi kama akaunti ya poller huku utaratibu wa kawaida wa kuanzisha umesimamishwa ili kuzuia kuingiliana.

## Mfumo wa faili

Ruhusu akaunti zinazohitaji tu kufikia njia halisi za RRD, kumbukumbu, kache na saraka za uendeshaji za Symfony. Saraka chaguomsingi ya RRD ni `rra/`. Akaunti tofauti za Unix za wavuti/poller zinahitaji vitambulisho vya nambari vilivyo wazi katika `rrd_maintenance_trusted_uids` na, kwa vikundi vyenye ruhusa ya kuandika, `rrd_maintenance_trusted_gids`, ndani ya `include/config.php`. Kila mwanachama wa vikundi hivyo lazima aaminike. Ruhusa za kawaida bado zinatumika; hifadhi inayoweza kuandikwa na kila mtu hukataliwa. Tumia mipangilio ileile ya uaminifu kwa michakato yote ya kuandika na ukague akaunti zote mbili kabla ya kuboresha.

## Haki za mfumo

Endesha mchakato wa wavuti na poller kwa akaunti maalumu zisizo na haki za juu. ICMP ghafi inahitaji haki za ziada za mfumo wa uendeshaji; tumia ukaguzi wa TCP, UDP au SNMP zisipopatikana. Usiendeshe programu nzima kama root ili kuwezesha ping. Windows haina uthibitishaji wa ACL unaohitajika kwa matengenezo yanayoweza kuharibu RRD za ndani; masasisho ya kawaida hutumia uthibitisho wa kupokea wa RRDtool unaosubiriwa kabla ya kuendelea. Ushahidi wa uwezo wa uchakataji wa Unix hauthibitishi uwezo wa Windows.

## Kuhusu toleo la PHP

Kwa mipango ya 2026–2027, PHP 8.4 hupokea usaidizi amilifu hadi 31 Desemba 2026 na marekebisho ya usalama hadi 31 Desemba 2028. PHP 8.5 hupokea usaidizi amilifu hadi 31 Desemba 2027 na marekebisho ya usalama hadi 31 Desemba 2029. Hizi ni tarehe za mradi wa PHP, si jedwali la uoanifu wa Kadupul. Jaribu mazingira mapya kwa vitegemezi vilivyofungwa kabla ya kuyatumia. Kiwango cha chini cha PHP cha Symfony hakipunguzi kiwango cha chini cha Kadupul cha 8.4. Kagua tena ratiba rasmi na marekebisho unayolenga kabla ya kuweka programu.

[Uboreshaji wa hifadhidata](/sw/guides/tune-database-performance/) · [Muunganisho wa RRDtool](/sw/reference/rrdtool-integration/) · [SNMP](/sw/reference/snmp/) · [Mpangilio wa faili](/sw/reference/file-layout/) · [Usakinishaji](/sw/start/install/) · [Masharti ya kuboresha hifadhi](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Matoleo ya PHP yenye usaidizi](https://www.php.net/supported-versions.php)
