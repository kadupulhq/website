---
title: "Bukatun tsarin"
description: "Bukatun yanayin aiki, ajiya da shigar da tsarin don shirin 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen."
---

An duba a ranar 26 Oktoba 2026 bisa sigar lambar manhajar da aka haɗa a ƙasa. Wannan tushe ne don shirin 2026–2027; ba alkawarin fitar da siga ko tallafi ba ne.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Yanayin aiki

`main` yana buƙatar PHP 8.4 ko sabuwa kuma yana haɗa Symfony 7.4 da wuraren shigar tsohon tsarin. Layin `lts/1.2` yana da bukatu daban. Shigar da MySQL ko MariaDB, RRDtool, da mai tattara bayanai na PHP ko ginin Spine mai dacewa. Don gini daga lambar tushe, yi amfani da sigogin `mise.toml` ta `mise exec`; shigar da abubuwan dogaro da aka kulle ba tare da sabunta su ba.

## PHP

Fayil ɗin bukatu yana buƙatar waɗannan ƙarin sassa tare da PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Mai girkawa yana duba dabam, a tsakanin wasu, `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` da `zlib`. A Unix yana duba `posix` da `pcntl` na CLI; a Windows yana duba `com_dotnet`. Wuce gwajin mai girkawa ba ya tabbatar da cika bukatun Composer. Duba PHP na CLI da na yanar gizo dabam. Saita `date.timezone`; mai girkawa yana ba da shawarar `memory_limit=400M` da `max_execution_time=60`, ko ƙimomin da ba su da iyaka. Ƙarin sashe na zaɓi `snmp` yana ba da damar tambaya a cikin aikin; `gettext` yana kunna kundin fassara.

## Ma’ajiyar bayanai

Yi amfani da sigar MySQL ko MariaDB da mai samarwa yake kula da ita kuma a gwada ta da sigar lambar da ake nufi. Tsofaffin iyakokin mai girkawa na MySQL 5.6 da MariaDB 10.0 ba sa tabbatar da tallafin 2026–2027. A `main`, `poller_output`, `poller_output_boost` da `poller_output_realtime` suna amfani da InnoDB; wasu teburan daidaitawa har yanzu suna amfani da MEMORY. Kada a sauya dukkan tebur zuwa injin guda. Cika `mysql.time_zone_name` sannan a ba asusun manhajar izinin SELECT a wannan tebur.

## RRDtool

Saita cikakkiyar hanyar fayil ɗin da ake gudanarwa kuma a daidaita sigar saitin da wadda aka shigar. `DCOUNTER` da `DDERIVE` suna buƙatar RRDtool 1.5 ko sabuwa. Ajiyar cikin Unix tana buƙatar binciken shaida na POSIX da `flock` mai aiki a kan kundin adireshi. Dakatar da ayyukan rubutu na waje da daemons na cache kafin gyaran da ke buƙatar keɓantacciyar dama. Tsohuwar hanyar proxy tana nan, amma ba tabbacin shigarwa da aka gwada ba ce.

## net-snmp

Shigar da kayan aikin Net-SNMP idan PHP `snmp` ba ya nan ko an kashe shi. Saita `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` da `path_snmptrap` zuwa hanyoyin fayilolin gudanarwa da suka dace. Gwada hanyar da aka zaɓa da sigar SNMP ta na’urar, ciki har da SNMPv3 ta IPv6 idan ya dace; tsohon mai girkawa yana jan kunne kan amfani da PHP `snmp` ga wannan haɗin.

## Sabar yanar gizo

Gudanar da PHP ta yanayin yanar gizon da aka saita kuma a yi amfani da TLS. Riƙe tsofaffin hanyoyi tare da `/app.php/...`; kada a sauya duk tushen takardun yanar gizo zuwa `public/` yayin da tsofaffin shafuka suke nan. Saita PATH_INFO don wurin shigar dacewa. Nginx ba ya bin `.htaccess`; kafa ƙa’idojin hana shiga lambar tushe, saituna, abubuwan dogaro, kayan aiki, gwaje-gwaje, sirrika da halin aikin kafin sarrafa PHP. Daidaita farkon URL da `$url_path`.

## Tsara lokutan aiki

Yi amfani da hanya guda ta farawa: cron, Task Scheduler ko sabis ɗin daemon na mai tattara bayanai da aka kawo. Daidaita yawan farawa da tazarar da aka saita. Tattara bayanai a ƙasa da minti ɗaya yana gudana cikin wannan tazara; cron shi kaɗai ba ya ba da irin wannan jadawali. Gudanar da bincike da asusun poller bayan an dakatar da hanyar farawa ta yau da kullum don guje wa ayyuka masu cin karo.

## Tsarin fayiloli

Ba asusun da suke buƙata kaɗai damar shiga hanyoyin RRD na ainihi, rajistan aiki, cache da kundin yanayin aiki na Symfony. Kundin RRD na asali shi ne `rra/`. Asusun Unix daban na yanar gizo da poller suna buƙatar lambobin shaida bayyanannu a `rrd_maintenance_trusted_uids` kuma, ga ƙungiyoyi masu izinin rubutu, a `rrd_maintenance_trusted_gids`, cikin `include/config.php`. Dole ne a amince da kowane mamba na waɗannan ƙungiyoyi. Izini na yau da kullum yana ci gaba da aiki; ana ƙin ajiyar da kowa zai iya rubutawa. Yi amfani da saitunan amincewa iri ɗaya ga duk ayyukan rubutu kuma a duba asusun biyu kafin haɓakawa.

## Izini na musamman

Gudanar da aikin yanar gizo da poller da asusun da aka keɓe ba tare da izini na musamman ba. ICMP na raw yana buƙatar ƙarin izinin tsarin aiki; yi amfani da binciken TCP, UDP ko SNMP idan babu shi. Kada a gudanar da duk manhajar a matsayin root don kunna ping. Windows ba shi da tabbatarwar ACL da ake buƙata don gyaran RRD na cikin gida mai iya lalata bayanai; sabuntawa na yau da kullum yana amfani da amsoshin tabbatarwa na RRDtool da ake jira kafin ci gaba. Shaidar yawan aikin Unix ba ta tabbatar da ƙarfin Windows ba.

## Game da sigar PHP

Don shirin 2026–2027, PHP 8.4 yana karɓar tallafi mai aiki har zuwa 31 Disamba 2026 da gyaran tsaro har zuwa 31 Disamba 2028. PHP 8.5 yana karɓar tallafi mai aiki har zuwa 31 Disamba 2027 da gyaran tsaro har zuwa 31 Disamba 2029. Waɗannan ranakun aikin PHP ne, ba jadawalin dacewar Kadupul ba. Gwada sababbin yanayin aiki da abubuwan dogaro da aka kulle kafin karɓarsu. Ƙarancin sigar PHP da Symfony yake buƙata ba ya rage iyakar Kadupul ta 8.4. Sake duba jadawalin hukuma da sigar lambar da ake nufi kafin shigar da tsarin.

[Daidaita ma’ajiyar bayanai](/ha/guides/tune-database-performance/) · [Haɗin RRDtool](/ha/reference/rrdtool-integration/) · [SNMP](/ha/reference/snmp/) · [Tsarin fayiloli](/ha/reference/file-layout/) · [Shigarwa](/ha/start/install/) · [Abubuwan da ake buƙata kafin haɓaka ajiya](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Sigogin PHP masu tallafi](https://www.php.net/supported-versions.php)
