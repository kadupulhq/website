---
title: "Usakinishaji"
description: "Kile Kadupul inachohitaji ili kufanya kazi, na mpangilio wa kukiweka pamoja."
sidebar:
  order: 2
banner:
  content: "Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha."
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji inayoungwa mkono. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Fanya kazi kupitia hatua hizi mara moja, kwa mpangilio. Kila hatua inaishia na ukaguzi. Fanya ukaguzi kabla ya kuendelea: kila hitilafu iliyoorodheshwa hapa ni rahisi na nafuu kuigundua sasa kuliko kuipata baada ya poller kufanya kazi kwa wiki moja.

## Kile unachohitaji kwanza

Kadupul ni programu ya PHP inayohifadhi usanidi katika MySQL au MariaDB na kuhifadhi vipimo katika faili za RRD kwenye diski. Ukurasa huu unaelezea usakinishaji mpya wa seva kuu kutoka kwa msimbo chanzo wa sasa wa `main`, si uboreshaji au laini iliyohifadhiwa ya LTS. Mambo manne lazima yawepo kabla haijaanza kufanya kazi.

| Kipengele | Kwa nini kinahitajika |
|---|---|
| PHP 8.4 au mpya zaidi, kwenye toleo lenye usaidizi wa kiusalama | Huendesha kiolesura cha wavuti na poller |
| MySQL au MariaDB | Huhifadhi vifaa, violezo, watumiaji, na kache ya poller |
| RRDtool | Huunda na kusasisha hifadhi za round-robin, na hutoa michoro ya grafu |
| net-snmp | Hutoa zana za mteja na maktaba zinazotumiwa kuuliza vifaa |

PHP pia inahitaji viendelezi vinavyohitajika na [hati ya programu](https://github.com/kadupulhq/kadupul/blob/main/composer.json), ikiwa ni pamoja na `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix`, na `sqlite3`. Visakinishe kwa mazingira ya safu ya amri (CLI) na mazingira ya wavuti. Ukurasa wa [Mahitaji](/sw/reference/requirements/) unatofautisha mahitaji ya Composer na ukaguzi tofauti wa kisakinishaji.

## Hatua ya 1: Sakinisha mazingira ya uendeshaji

Sakinisha PHP na viendelezi vyake, seva yako ya hifadhidata, RRDtool, na net-snmp kutoka kwa vifurushi vya usambazaji wako.

**Kague.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` lazima iorodheshe viendelezi vinavyohitajika. Kiendelezi cha PHP `snmp` ni cha hiari wakati zana za safu ya amri za net-snmp zinapopatikana. Composer hukagua viendelezi vyake vinavyohitajika wakati wa usakinishaji wa vitegemezi; kisakinishaji cha wavuti kina ukaguzi tofauti wa viendelezi. Njia mbadala ya wakati wa uendeshaji haiondoi hitaji la Composer.

Mipangilio ya PHP ya safu ya amri na seva ya wavuti inaweza kutofautiana. Kagua zote mbili. Kisakinishaji kinapendekeza `memory_limit` ya angalau 400M na `max_execution_time` ya angalau sekunde 60; pia kinakubali thamani zao zisizo na kikomo (`-1` na `0`, mtawalia). Thamani zilizo chini ya mapendekezo hayo hutoa maonyo, wakati `date.timezone` inayokosekana ni hitilafu. Weka eneo la saa lililo wazi, kama vile `UTC`, na utumie `php --ini` kutambua usanidi wa safu ya amri.

## Hatua ya 2: Unda hifadhidata na mtumiaji wake

Unda hifadhidata moja tupu, na mtumiaji mmoja mwenye haki kwenye hifadhidata hiyo. Kwa hifadhidata ya ndani, endesha SQL hii kama msimamizi wa hifadhidata, ukibadilisha nenosiri la mfano kabla ya matumizi:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Tumia seva pangishi (host) inayolingana ya akaunti ya hifadhidata ikiwa PHP inaunganishwa kutoka kwa mashine nyingine.

Seva ya hifadhidata pia inahitaji majedwali yake ya eneo la saa yajazwe data, na mtumiaji wa Kadupul anahitaji idhini ya kusoma majedwali hayo, katika hifadhidata ya `mysql`. Hiyo ndiyo idhini pekee iliyo nje ya muundo (schema) wake wenyewe. Hakuna chochote kuhusu mfumo wa ufuatiliaji kinachoonyesha hili moja kwa moja, na si cha hiari; ukaguzi ulio hapa chini utashindwa bila hilo.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Kague.** Ingia kama mtumiaji wa hifadhidata wa Kadupul na uendeshe:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Hesabu isiyo ya sifuri iliyorudishwa bila hitilafu ya ruhusa ndicho unachotaka. Sifuri inamaanisha majedwali hayakupakiwa kamwe; hitilafu inamaanisha mtumiaji hawezi kuyasoma. Yote mawili yanasimamisha kisakinishaji.

Mipangilio minne ya seva yenyewe ni muhimu vya kutosha kurekebishwa sasa.

| Mpangilio | Inayotakiwa | Kwa nini |
|---|---|---|
| `max_allowed_packet` | 16M au zaidi | Usawazishaji mkubwa kati ya seva kuu na wakusanyaji wa mbali |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Maelezo ya vifaa yana herufi za baiti nyingi (multi-byte) |
| `innodb_file_per_table` | On | Huweka nafasi za majedwali zikiwa zimetengana na zinazoweza kudhibitiwa |
| `innodb_buffer_pool_size` | Takriban robo ya kumbukumbu ya mfumo | Huweka seti inayotumika ya data ndani ya kumbukumbu |

Kisakinishaji kinaripoti usomaji wake wa mipangilio hii na kuashiria kile kinachopungua, kwa hivyo huhitaji kuamini jedwali bila uthibitisho. Mwongozo wa [Uboreshaji wa hifadhidata](/sw/guides/tune-database-performance/) unaenda mbali zaidi pindi unapokuwa na mzigo wa kazi.

## Hatua ya 3: Fungua kifurushi, rekebisha umiliki, na utoe huduma

Weka programu mahali ambapo seva yako ya wavuti inaweza kutoa huduma, kisha uamue ni mtumiaji gani wa mfumo anayeimiliki. Uamuzi huo una umuhimu mkubwa kuliko eneo lenyewe. Michakato miwili inaandika hapa: seva ya wavuti, na chochote kinachopanga ratiba ya poller. Endesha zote mbili kama mtumiaji yuleyule. Endesha poller bila marupurupu ya juu na upe michakato yote miwili ufikiaji unaohitajika. Umiliki au mifumo isiyo sahihi inaweza kuzuia sasisho za baadaye hata wakati grafu zinapojitokeza vizuri.

### Ikiwa ulinakili hazina badala ya kufungua toleo lililotolewa

Nakala ya Git inahitaji vitegemezi vya PHP na vipengee vya kivinjari vilivyozalishwa. Huku mazingira ya uendeshaji ya `mise.toml` ya hazina yakiwa yamesakinishwa, endesha kutoka kwenye mzizi wa hazina:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer hujaza `include/vendor/` na kurejesha faili za uoanifu zilizobandikwa. Ujenzi wa npm huunda vipengee chini ya `include/js/`, `include/fa/`, na `include/vendor/flag-icons/`. Composer pekee haitoshi kwa usakinishaji wa msimbo chanzo.

Kifurushi kisicho na mtandao chenye vitegemezi kamili ni zao tofauti la ujenzi. Kumbukumbu ya jumla ya msimbo chanzo ya GitHub si kifurushi hicho. Fuata [utaratibu wa ujenzi na uthibitishaji bila mtandao](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) wakati seva inayolengwa haina ufikiaji wa intaneti.

Andaa njia zinazoweza kuandikwa baada ya kusakinisha vitegemezi:

| Kikundi | Saraka | Inaandikwa lini |
|---|---|---|
| Wakati wa usakinishaji | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Wakati wa kusakinisha au kuboresha pekee |
| Wakati wa usakinishaji | `include/vendor/csrf/`, au eneo la `path_csrf_secret` lililosanidiwa | Kisakinishaji lazima kiunde siri mahususi ya usakinishaji; ihifadhi baada ya hapo |
| Daima | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, saraka ya muda ya mfumo | Katika kipindi chote cha maisha ya usakinishaji |
| Mazingira ya Symfony | `var/cache`, na `var/log` ikiwa uwekaji kumbukumbu wa faili umesanidiwa | Kwa mazingira ya PHP na mtumiaji wa kupasha kache joto |

Saraka ya RRD lazima iweze kuandikwa katika maisha yote ya usakinishaji pia. Inashikilia historia yako, kwa hivyo ipe uangalizi sawa na ambao ungeupa saraka ya hifadhidata.

Uhamiaji wa sasa bado unahitaji njia za awali za kuingia, kisakinishaji, na programu-jalizi. Kwa usakinishaji huu uliounganishwa, toa huduma kutoka kwenye mzizi wa hazina ukiwa na kanuni za wazi zinazokataa ufikiaji wa saraka za faragha, usanidi, vitegemezi na hali ya uendeshaji. Usibadilishe usakinishaji mzima kuwa `public/`: hilo litaondoa njia za awali ambazo bado zinatumika. Sehemu tofauti ya Symfony ina uelekezaji tofauti; tazama [maagizo ya uhamiaji](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Kwa Nginx, anza kutoka kwa [kanuni za maeneo ya Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) za hazina, ukirekebisha mzizi na seva ya juu ya PHP-FPM. Weka kanuni za kukataa kabla ya uchakataji wa kawaida wa PHP na uhifadhi PATH_INFO kwa `/app.php/...`. Nginx haisomi `.htaccess`. Weka faili za RRD, kumbukumbu na siri zisiweze kufikiwa kupitia HTTP; thibitisha usanidi halisi wa seva badala ya kudhani ruhusa za faili zinazuia utoaji huduma.

**Kague.** Kuwa mtumiaji wa poller, andika faili katika kila saraka ya kikundi cha daima, kisha uifute. Ruhusa inayoonekana sawa katika `ls -l` bado inaweza kukataliwa na SELinux au AppArmor, na kuandika faili ndio ukaguzi pekee unaothibitisha hilo. Kisha omba faili chini ya saraka ya kumbukumbu kupitia HTTP. Unataka jibu la kukataliwa.

## Hatua ya 4: Andika faili la usanidi

Kwa usakinishaji mpya, nakili faili la usanidi lililosambazwa:

```bash
cp include/config.php.dist include/config.php
```

Usifute au kuandika juu ya usanidi wa usakinishaji uliopo. Weka seva pangishi ya hifadhidata, jina, mtumiaji, na nenosiri kutoka hatua ya 2. Thamani nyingine mbili ni muhimu kwenye usakinishaji wa kwanza: `url_path`, njia ambayo programu inatolewa huduma chini yake ikiwa na mikwaju mwanzoni na mwishoni, na `poller_id`, ambayo ni `1` kwenye seva kuu na kitu kingine tu kwenye mkusanyaji wa mbali.

Acha sehemu ya mkusanyaji wa mbali ikiwa imetolewa maoni (commented out). Hujaunda bado; ukurasa wa [Ukusanyaji wa data wa mbali](/sw/concepts/remote-data-collection/) unashughulikia hilo utakapokuwa tayari. Kila mpangilio mwingine una thamani chaguomsingi inayofanya kazi, kwa hivyo soma [Usanidi](/sw/reference/configuration/) kabla ya kubadilisha yoyote kati yao.

Sanidi `APP_SECRET` mahususi ya uwekaji katika mazingira ya mchakato wa PHP kwa vipengele vya Symfony vinavyoitumia. Uwashaji wa mwanzo huweka `APP_ENV=prod` na `APP_DEBUG=0` kama chaguo-msingi na haupakii faili za `.env`. Hii ni tofauti na siri ya CSRF ya kisakinishaji cha awali.

**Kague.** Kagua sintaksia bila kuonyesha vitambulisho:

```bash
php -l include/config.php
```

Ingiza muundo wa hifadhidata katika hatua inayofuata kabla ya kufungua kisakinishaji kwenye kivinjari.

## Hatua ya 5: Ingiza muundo wa hifadhidata

Kisakinishaji kinatarajia majedwali yawepo tayari. Pakia muundo uliosafirishwa kwenye hifadhidata uliyounda:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Fanya hivi mara moja, kwenye hifadhidata tupu. Hii si hati ya kuboresha; kuiingiza kwenye hifadhidata yenye data tayari kunaweza kushindwa au kuacha data inayokinzana na isiyo kamili.

## Hatua ya 6: Endesha kisakinishaji

Fungua tovuti kwenye kivinjari na ufanye kazi kupitia kwayo. Kisakinishaji hufuata mfuatano uliopangwa, na kila hatua hufungua inayofuata:

1. Karibu na leseni.
2. Ukaguzi wa vitegemezi: Toleo la PHP na viendelezi, mipangilio ya PHP kutoka hatua ya 1 kwa safu ya amri na seva ya wavuti, majedwali ya eneo la saa, na mipangilio ya hifadhidata kutoka hatua ya 2. Hitilafu huzuia kitufe cha kuendelea. Maonyo hayazuii, lakini yasome kwa makini.
3. Aina ya usakinishaji: Seva kuu mpya, au mkusanyaji wa mbali.
4. Ukaguzi wa ruhusa: Saraka kutoka hatua ya 3, zilizojaribiwa kwa kuandika ndani yake.
5. Maeneo ya faili za mfumo: Njia za kuelekea PHP, RRDtool, na zana za net-snmp.
6. Wasifu wa chanzo cha data na muda wa kuanzisha.
7. Uchaguzi wa kiolezo: Violezo vipi vya vifaa vya kupakia.
8. Ubadilishaji wa majedwali, uthibitisho, na usakinishaji wenyewe.

Kipengee cha 6 katika orodha hiyo ndicho ambacho ni vigumu kukitengua baadaye. Wasifu unaochagua huamua hatua na seti ya kumbukumbu zilizoandikwa kwenye kila faili ya RRD iliyoundwa baadaye, na kuhariri wasifu hakuhariri faili zilizopo. Mabadiliko ya uhifadhi yanahitaji uhamiaji tofauti uliojaribiwa; hayahitaji kila wakati kutupa historia. Ikiwa viwango vya juu zaidi ni muhimu, hakikisha wasifu unahifadhi viwango vya juu na si wastani pekee: soma [Vyanzo vya data na hifadhi za round-robin](/sw/concepts/data-sources-and-rras/) kabla ya kubofya na kuendelea mbele. Kipindi cha kuanzisha kinachotolewa hapo ni dakika moja au dakika tano. Wasifu wa chanzo cha data huweka muda wa ukusanyaji; kizindua na wasifu lazima viwe vimewekwa kwa uwiano unaolingana.

## Hatua ya 7: Badilisha vitambulisho chaguomsingi

Muundo uliosafirishwa huweka akaunti ya msimamizi inayoitwa `admin` yenye nenosiri `admin`, likiwa limewekewa alama ili kuingia kwa mara ya kwanza kulazimishe mabadiliko. Pia huweka akaunti ya mgeni iliyozimwa. Badilisha nenosiri kabla ya mfumo kufikiwa na mtu mwingine yeyote, ambayo inamaanisha kabla ya kuiunganisha kwenye mtandao ambao wengine wanaweza kuufikia.

## Hatua ya 8: Panga ratiba ya poller

Poller lazima ianzishwe kutoka nje. Sanidi muda wake wa ukusanyaji na muda wa kizindua kwa uwiano thabiti; poller inasaidia vipindi vya kuanzisha vya dakika moja au dakika tano na ina kinga dhidi ya michakato ya kawaida kufika mapema mno. Kwa kizindua cha dakika moja, sakinisha ingizo hili katika crontab ya mtumiaji wa poller asiye na marupurupu ya juu, ukibadilisha `php` na njia ya programu kwa njia zake kamili:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

au endesha daemon ya `cactid.php` iliyosafirishwa kwa kutumia `service/cactid.service`, iliyorekebishwa kwa njia yako ya usakinishaji na mtumiaji asiye na marupurupu ya juu. Tumia kizindua kimoja: zima kazi ya cron au kipima muda wakati unapotumia daemon.

Linganisha ratiba halisi na muda wa kizindua uliosanidiwa. Kwa wasifu wa ukusanyaji wa chini ya dakika moja, poller iliyozinduliwa huendesha mizunguko ya ukusanyaji ndani ya kipindi hicho; usijaribu kueleza mdundo wa chini ya dakika kwa ingizo hili la cron.

**Kague.** Endesha mzunguko mmoja kwa mkono kama mtumiaji wa poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` inaruka kizuizi cha muda wa kuanza mapema. Tumia ukaguzi huu wa mikono wakati kipangaji kikiwa kimesimamishwa ili kisiingiliane na mchakato uliopangwa. Haikwepe ukaguzi mwingine wa matengenezo au usalama. Unataka tamati safi yenye mstari wa muhtasari. Kisha wezesha kipangaji na ukiache peke yake kwa vipindi viwili; thibitisha kuwa mzunguko mwingine ulitokea bila wewe.

## Nini kinaharibika

Hizi ndizo hitilafu ambazo usakinishaji wa kwanza hukabiliana nazo hasa.

| Dalili | Sababu | Wapi pa kuangalia |
|---|---|---|
| Kisakinishaji kimekwama kwenye mipangilio ya PHP inayoonekana kuwa sahihi | Seva ya wavuti na safu ya amri zinasoma faili tofauti za `php.ini` | `php --ini`, na faili inayoripotiwa na web SAPI |
| Kisakinishaji kimekwama kwenye maeneo ya saa | Majedwali ya eneo la saa hayajapakiwa, au mtumiaji wa Kadupul hawezi kuyasoma | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Hatua ya ruhusa inashindwa kwenye saraka inayoonekana kuandikika | Mmiliki asiye sahihi, au SELinux na AppArmor | Andika faili kama mtumiaji wa poller |
| Usakinishaji umekamilika, hakuna data inayofika kamwe | Poller haikupangwa kamwe | Endesha `poller.php --force --debug` kwa mikono |
| Data inafika kwa mizunguko michache, kisha hakuna chochote | Poller inafanya kazi kama mtumiaji asiye sahihi, ikiacha faili ambazo mtumiaji wa wavuti hawezi kuzisasisha | Mmiliki wa faili katika saraka ya RRD |
| Grafu zimejaa mapengo madogo | Kipindi kilichopangwa na kipindi kilichosanidiwa havikubaliani | Crontab, dhidi ya kipindi kilichosanidiwa |
| Composer inakataa usakinishaji | PHP iko chini ya 8.4 au kiendelezi kinachohitajika na hati kinakosekana | `php -v`, `php -m`, na matokeo ya hitilafu ya Composer |
| Poller haiwezi kuendesha michakato zaidi ya mmoja | `pcntl` au `posix` inakosekana | `php -m` |

Ukurasa wa [Uwekaji kumbukumbu](/sw/reference/logging/) unaeleza mahali ambapo kila moja hujirekodi yenyewe. Mwongozo wa [Kutatua hitilafu za data inayokosekana](/sw/guides/troubleshoot-missing-data/) unashughulikia hali ambapo usakinishaji uko sawa lakini kifaa kimoja hakifanyi kazi vizuri.

## Kabla ya kuifanya ipatikane mtandaoni

Poller inafanya kazi kama mtumiaji wa mfumo na kutekeleza RRDtool pamoja na hati zako za ukusanyaji data. Chukulia usakinishaji kama kitu kinachoendesha amri, kwa sababu ndivyo inavyofanya.

- Toa huduma kupitia TLS.
- Usiache nenosiri la msimamizi chaguomsingi likiwepo, hata kwa muda mfupi.
- Weka mtumiaji wa hifadhidata afikie hifadhidata yake yenyewe tu.
- Weka saraka za RRD na kumbukumbu nje ya mzizi wa nyaraka za wavuti.
- Acha akaunti ya mgeni ikiwa imezimwa isipokuwa uamue vinginevyo.

Mwongozo wa [Kulinda usakinishaji unaotazamana na mtandao](/sw/guides/secure-an-internet-facing-install/) una maelezo mengine yaliyosalia. Hatua inayofuata: [Ongeza kifaa chako cha kwanza](/sw/start/first-device/).
