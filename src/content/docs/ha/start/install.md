---
title: "Shigarwa"
description: "Abin da Kadupul ke buƙata don aiki, da tsarin haɗa shi tare."
sidebar:
  order: 2
banner:
  content: "Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen."
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

Bi waɗannan matakai sau ɗaya, bisa tsari. Kowane mataki yana ƙarewa da binciken tabbatarwa. Yi binciken kafin ci gaba: kowane kuskure da aka lissafa a nan yana da sauƙin gyarawa yanzu amma zai yi tsada a gano shi bayan poller ya yi aiki na mako guda.

Don bukatun da suka shafi na’urar, duba [Linux a kan Windows](/ha/guides/install-on-windows/) da [FreeBSD](/ha/guides/install-on-freebsd/). Waɗannan matakai ba su tabbatar da gwajin aiki daga farko zuwa ƙarshe ba.

## Abin da kake buƙata da farko

Kadupul manhaja ce ta PHP wadda ke adana saiti a MySQL ko MariaDB kuma tana adana ma’aunin bayanai a fayilolin RRD a faifai. Wannan shafin yana bayanin sabuwar shigarwa ta babbar uwar garke daga tushen `main` na yanzu, ba haɓakawa ba ko tsohon layin LTS da aka ajiye. Dole ne abubuwa huɗu su kasance kafin ya fara aiki.

| Sashe | Dalilin da ya sa ake buƙatarsa |
|---|---|
| PHP 8.4 ko sabuwa, a kan sigar da ke da tallafin tsaro | Yana gudanar da tsarin yanar gizo da kuma poller |
| MySQL ko MariaDB | Yana ɗauke da na’urori, samfura, masu amfani, da cache na poller |
| RRDtool | Yana ƙirƙira da sabunta rumbun adana bayanan round-robin, kuma yana zana jadawali |
| net-snmp | Yana ba da kayan aikin abokin ciniki da ɗakunan karatu da ake amfani da su don tambayar na’urori |

PHP yana kuma buƙatar ƙarin sassan da [bayanan manhaja](https://github.com/kadupulhq/kadupul/blob/main/composer.json) ke buƙata, ciki har da `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix`, da `sqlite3`. Shigar da su don yanayin layin umarni (CLI) da na sabar yanar gizo duka biyun. Shafin [Bukatun tsarin](/ha/reference/requirements/) yana rarrabe bukatun Composer daga bincike na musamman na mai girkawa.

## Mataki na 1: Shigar da yanayin aiki

Shigar da PHP tare da ƙarin sassansa, sabar ma’ajiyar bayananku, RRDtool, da net-snmp daga kunshin rarraba tsarin ku.

**Duba shi.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

Dole ne `php -m` ya lissafa ƙarin sassan da ake buƙata. Ƙarin sashe na PHP `snmp` na zaɓi ne lokacin da kayan aikin layin umarni na net-snmp suke akwai. Composer yana bincika ƙarin sassansa da ake buƙata yayin shigar da abubuwan dogaro; mai girkawa ta yanar gizo yana da binciken ƙarin sassa daban. Madadin yanayin aiki ba ya cire buƙatar Composer.

Saitunan PHP na layin umarni da na sabar yanar gizo na iya bambanta. Duba duka biyun. Mai girkawa yana ba da shawarar `memory_limit` na aƙalla 400M da `max_execution_time` na aƙalla daƙiƙa 60; yana kuma karɓar ƙimominsu marasa iyaka (`-1` da `0`, bi da bi). Ƙimomin da ke ƙasa da waɗannan shawarwari suna haifar da gargaɗi, yayin da rashin `date.timezone` kuskure ne mai hana aiki. Saita takamaiman yankin lokaci, kamar `UTC`, kuma yi amfani da `php --ini` don gano saitin layin umarni.

## Mataki na 2: Ƙirƙiri ma’ajiyar bayanai da mai amfani da ita

Ƙirƙiri ma’ajiyar bayanai guda ɗaya marar komai, da mai amfani guda ɗaya mai cikakken ikon mallakar wannan ma’ajiyar bayanan. Don ma’ajiyar bayanan gida, gudanar da wannan SQL a matsayin mai kula da ma’ajiyar bayanai, tare da maye gurbin kalmar sirri ta misali kafin amfani:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Yi amfani da host ɗin asusun ma’ajiyar bayanai mai dacewa idan PHP yana haɗawa daga wata na’ura daban.

Sabar ma’ajiyar bayanai tana kuma buƙatar cika teburan yankin lokacinta, kuma mai amfani da Kadupul yana buƙatar izinin karanta su a cikin ma’ajiyar bayanai ta `mysql`. Wannan shi ne izini guda ɗaya a wajen tsarin kanta. Babu wani abu game da tsarin sa ido da ke nuna wannan kai tsaye, kuma ba na zaɓi ba ne; binciken da ke ƙasa zai gaza idan babu shi.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Duba shi.** Shiga a matsayin mai amfani da ma’ajiyar bayanai na Kadupul kuma gudanar da:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Adadin da ba sifili ba da aka dawo da shi ba tare da kuskuren izini ba shi ne abin da kake so. Sifili yana nufin ba a taɓa loda teburan ba; kuskure yana nufin mai amfani ba zai iya karanta su ba. Duka biyun suna dakatar da mai girkawa.

Hudu daga cikin saitunan sabar kanta suna da mahimmanci da ya kamata a gyara yanzu.

| Saiti | Abin da ake buƙata | Dalili |
|---|---|---|
| `max_allowed_packet` | 16M ko fiye | Daidaita manyan bayanai tsakanin babbar sabar da masu karɓar bayanai na nesa |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Bayanin na’urori ya ƙunshi haruffa masu yawan baiti |
| `innodb_file_per_table` | On | Yana raba wuraren tebur daban-daban kuma ana iya sarrafa su |
| `innodb_buffer_pool_size` | Kusan kashi ɗaya bisa huɗu na ƙwaƙwalwar tsarin | Yana adana bayanan da ake aiki da su a cikin ƙwaƙwalwa |

Mai girkawa yana ba da rahoton nasa bincike game da waɗannan kuma yana nuna abin da ya gaza, don haka ba kwa buƙatar amincewa da teburin a makance. Shafin [Daidaita ma’ajiyar bayanai](/ha/guides/tune-database-performance/) yana ƙara yin bayani dalla-dalla da zarar kun sami aiki mai yawa.

## Mataki na 3: Bude kunshin, daidaita mallaka, kuma bayar da sabis

Sanya manhajar a wurin da sabar yanar gizonku za ta iya bayar da sabis daga ciki, sannan ku yanke shawarar wane mai amfani da tsarin ne zai mallake ta. Wannan shawarar ta fi mahimmanci fiye da wurin kansa. Ayyuka biyu ne ke rubutawa a nan: sabar yanar gizo, da duk abin da ke tsara aikin poller. Gudanar da duka biyun a matsayin mai amfani ɗaya. Gudanar da poller ba tare da wani gata na musamman ba kuma a ba duka ayyukan damar da suke buƙata. Mallaka ko hanyoyin da ba daidai ba na iya hana sabuntawa na gaba koda kuwa jadawali yana nuna da kyau.

### Idan ka kwafi ma’ajiyar lamba maimakon buɗe kunshin fitarwa

Kwafin Git yana buƙatar duka abubuwan dogaro na PHP da kuma kayan aikin burawsa da aka samar. Tare da shigar da yanayin aiki na `mise.toml` na ma’ajiyar, gudanar daga tushen ma’ajiyar:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer yana cika `include/vendor/` kuma yana maido da fayilolin dacewa da aka tsare. Ginin npm yana ƙirƙirar kayan aiki a ƙarƙashin `include/js/`, `include/fa/`, da `include/vendor/flag-icons/`. Composer shi kaɗai bai isa ba don shigarwa daga tushen lamba.

Kunshin da ba ya buƙatar intanet mai cikakkun abubuwan dogaro wani zane ne na daban da ake ginawa. Ma’ajiyar tushe ta gama-gari ta GitHub ba wannan kunshin ba ce. Bi [hanyar gini da tabbatarwa ba tare da intanet ba](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) lokacin da uwar garken da ake nufi ba ta da hanyar intanet.

Shirya hanyoyin da za a iya rubutawa bayan shigar da abubuwan dogaro:

| Rukuni | Kundayen adireshi | Lokacin rubutu |
|---|---|---|
| Yayin shigarwa | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Yayin shigarwa ko haɓakawa kaɗai |
| Yayin shigarwa | `include/vendor/csrf/`, ko wurin `path_csrf_secret` da aka saita | Dole ne mai girkawa ya ƙirƙiri sirrin da ya dace da wannan shigarwar; kiyaye shi bayan haka |
| Koyaushe | `log`, `cache/boost`, `cache/mibcache`, `cache/realtime`, `cache/spikekill`, kundin wucin gadi na tsarin | Don tsawon rayuwar shigarwar |
| Yanayin aiki na Symfony | `var/cache`, da kuma `var/log` idan an saita rajistar fayil | Don yanayin aiki na PHP da mai amfani mai ɗumama cache |

Dole ne a iya rubuta wa kundin adireshi na RRD don tsawon rayuwar shigarwar kuma. Yana riƙe da tarihin ku, don haka ku kula da shi yadda za ku kula da kundin adireshi na ma’ajiyar bayanai.

Sauyin da ake yi a yanzu har yanzu yana buƙatar tsofaffin hanyoyin shiga, mai girkawa, da hanyoyin plugin. Don wannan haɗin shigarwar, bayar da sabis daga tushen ma’ajiyar tare da ƙa’idodi bayyanannu waɗanda ke hana shiga kundayen sirri, saiti, abubuwan dogaro da halin yanayin aiki. Kada a sauya dukkan shigarwar zuwa `public/`: hakan zai cire tsofaffin hanyoyin da har yanzu ake amfani da su. Wurin ƙarshe na Symfony mai zaman kansa yana da wata hanya daban; duba [umarnin ƙaura](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Ga Nginx, fara daga [ƙa’idojin wurin Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) na ma’ajiyar, tare da daidaita tushe da na gaba na PHP-FPM. Ajiye ƙa’idojin ƙin yarda kafin sarrafa PHP na yau da kullum kuma a kiyaye PATH_INFO don `/app.php/...`. Nginx ba ya karanta `.htaccess`. A kiyaye fayilolin RRD, rajistar ayyuka da sirrika ta yadda ba za a iya samunsu ta HTTP ba; tabbatar da ainihin saitin sabar maimakon zaton cewa izinin fayil zai hana bayar da sabis.

**Duba shi.** Zama mai amfani da poller, rubuta fayil a cikin kowane kundin rukunin koyaushe, sannan a share shi. Izinin da ke da kyau a `ls -l` har yanzu ana iya ƙinsa ta SELinux ko AppArmor, kuma rubuta fayil ɗin shine kawai binciken da ke tabbatar da hakan. Sannan nemi fayil a ƙarƙashin kundin rajista ta HTTP. Abin da kake so shi ne a ƙi bayar da shi.

## Mataki na 4: Rubuta fayil ɗin saiti

Don sabuwar shigarwa, kwafi fayil ɗin saiti da aka kawo:

```bash
cp include/config.php.dist include/config.php
```

Kada ka rubuta a kan saitin shigarwar da ke akwai. Saita host na ma’ajiyar bayanai, suna, mai amfani, da kalmar sirri daga mataki na 2. Wasu ƙimomi biyu suna da mahimmanci a shigarwa ta farko: `url_path`, hanyar da ake bayar da sabis ɗin manhaja a ƙarƙashinta tare da slash a gaba da baya, da `poller_id`, wanda yake `1` a kan babbar sabar kuma wani abu daban ne kawai a kan mai karɓar bayanai na nesa.

Bar sashin mai karɓar bayanai na nesa a rufe a matsayin sharhi. Ba kwa gina ɗaya ba tukuna; sashen [Karɓar bayanai daga nesa](/ha/concepts/remote-data-collection/) yana bayyana hakan idan kun shirya. Kowane saiti yana da ƙimar asali mai aiki, saboda haka karanta [Saituna](/ha/reference/configuration/) kafin canza kowane ɗayansu.

Saita `APP_SECRET` na musamman don wannan shigarwa a cikin yanayin aiki na PHP don fasalullukan Symfony da ke amfani da shi. Fara aiki yana zuwa da `APP_ENV=prod` da `APP_DEBUG=0` a matsayin asali kuma ba ya loda fayilolin `.env`. Wannan ya bambanta da sirrin CSRF na tsohon mai girkawa.

**Duba shi.** Duba tsarin rubutu ba tare da nuna bayanan shaida ba:

```bash
php -l include/config.php
```

Shigar da tsarin a mataki na gaba kafin buɗe mai girkawa a burawsa.

## Mataki na 5: Shigar da tsarin bayanan

Mai girkawa yana tsammanin teburan sun riga sun wanzu. Loda tsarin da aka kawo a cikin ma’ajiyar bayanan da kuka ƙirƙira:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Yi wannan sau ɗaya, a kan ma’ajiyar bayanai marar komai. Wannan ba rubutun haɓakawa ba ne; shigar da shi a cikin ma’ajiyar bayanai mai cike da bayanai na iya kasawa ko barin bayanai masu cin karo da juna kuma marasa cika.

## Mataki na 6: Gudanar da mai girkawa

Buɗe shafin a burawsa kuma bi hanyoyin aiki. Mai girkawa yana tafiya ne bisa jerin da aka kayyade, kuma kowane mataki yana buɗe na gaba:

1. Maraba da lasisi.
2. Binciken abubuwan dogaro: Sigar PHP da ƙarin sassa, saitunan PHP daga mataki na 1 don layin umarni da sabar yanar gizo, teburan yankin lokaci, da saitunan ma’ajiyar bayanai daga mataki na 2. Kurakurai suna toshe maɓallin gaba. Gargaɗi ba ya toshewa, amma a karanta su da kyau.
3. Nau’in shigarwa: Sabuwar babbar uwar garke, ko mai karɓar bayanai na nesa.
4. Binciken izini: Kundayen adireshi daga mataki na 3, da aka gwada ta hanyar rubuta musu.
5. Wuraren fayilolin binary: Hanyoyi zuwa PHP, RRDtool, da kayan aikin net-snmp.
6. Bayanin tushen bayanai da tazarar mai ƙaddamarwa.
7. Zaɓin samfuri: Waɗanne samfuran na’urori za a loda.
8. Sauya tebura, tabbatarwa, da kuma ainihin shigarwar kanta.

Abu na 6 a cikin wannan jerin shi ne wanda yake da wuyar sauyawa daga baya. Bayanin da kuka zaɓa yana yanke shawarar mataki da rumbun tarihin da aka rubuta a cikin kowane fayil ɗin RRD da aka ƙirƙira bayan haka, kuma gyara bayanin ba ya ƙaura da fayilolin da ke akwai. Canje-canjen riƙe bayanai yana buƙatar ƙaura daban wadda aka gwada; ba koyaushe suke buƙatar zubar da tarihi ba. Idan maƙurar bayanai tana da mahimmanci, tabbatar cewa bayanin yana riƙe da mafi girman bayanai ba matsakaita kaɗai ba: karanta [Tushen bayanai da ma’ajiyar round-robin](/ha/concepts/data-sources-and-rras/) kafin danna don wucewa. Tazarar mai ƙaddamarwa da aka bayar a can ita ce minti ɗaya ko minti biyar. Bayanin tushen bayanai yana saita tazarar karɓar bayanai; dole ne a daidaita mai ƙaddamarwa da bayanin tushe yadda ya kamata.

## Mataki na 7: Canza bayanan shaidar asali

Tsarin da aka aiko yana saita asusun gudanarwa mai suna `admin` tare da kalmar sirri `admin`, wanda aka sanya masa alama ta yadda shiga ta farko za ta tilasta canji. Yana kuma saita asusun baƙo da aka kashe. Canza kalmar sirri kafin kowa ya sami damar shiga wannan tsarin, wato kafin ka haɗa shi da hanyar sadarwa da wasu za su iya bi.

## Mataki na 8: Tsara lokacin aikin poller

Dole ne a fara poller daga waje. Saita tazarar karɓar bayananta da tazarar mai ƙaddamarwa cikin daidaito; poller yana tallafawa tazarar mai ƙaddamarwa ta minti ɗaya ko minti biyar kuma yana da kariya daga ayyukan yau da kullum da ke zuwa da wuri. Don mai ƙaddamarwa na minti ɗaya, shigar da wannan a cikin crontab na mai amfani da poller marar wani gata na musamman, tare da maye gurbin `php` da hanyar manhaja da cikakkun hanyoyinsu:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

ko gudanar da daemon ɗin `cactid.php` da aka aiko ta amfani da `service/cactid.service`, wanda aka daidaita don hanyar shigarwar ku da mai amfani marar gata na musamman. Yi amfani da mai ƙaddamarwa guda ɗaya: kashe aikin cron ko mai ƙidayar lokaci lokacin amfani da daemon.

Daidaita ainihin jadawalin da tazarar mai ƙaddamarwa da aka saita. Ga bayanan karɓar bayanai na ƙasa da minti ɗaya, poller da aka ƙaddamar yana gudanar da zagayowar tattarawa a cikin wannan tazara; kada ku yi ƙoƙarin bayyana yanayin ƙasa da minti ɗaya tare da wannan shigarwar cron.

**Duba shi.** Gudanar da zagaye ɗaya da hannu a matsayin mai amfani da poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` yana tsallake kariyar lokacin fara aiki da wuri. Yi amfani da wannan binciken na hannu yayin da aka dakatar da mai tsara lokaci don kada ya haɗu da aikin da aka tsara. Ba ya ketare sauran binciken kula da tsari ko na tsaro. Abin da kake so shi ne ƙarewa mai kyau tare da layin taƙaitawa. Sannan kunna mai tsara lokaci kuma bar shi shi kaɗai na tazara biyu; tabbatar da cewa wani aiki ya sake gudana ba tare da kai ba.

## Abin da ke iya lalacewa

Waɗannan su ne gazawar da shigarwa ta farko take fuskanta a aikace.

| Alamomin matsala | Dalili | Inda za a duba |
|---|---|---|
| Mai girkawa ya toshe a kan saitunan PHP da suke kama da daidai | Sabar yanar gizo da layin umarni suna karanta fayilolin `php.ini` daban-daban | `php --ini`, da fayil ɗin da web SAPI ke bayar da rahoto a kansa |
| Mai girkawa ya toshe a kan yankunan lokaci | Ba a loda teburan yankin lokaci ba, ko mai amfani da Kadupul ba zai iya karanta su ba | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Matakin izini ya gaza a kan kundin adireshi da ake gani ana iya rubutu a kansa | Mai mallakar da ba daidai ba, ko SELinux da AppArmor | Rubuta fayil a matsayin mai amfani da poller |
| Shigarwa ta kammala, babu bayanan da suka taɓa zuwa | Ba a taɓa tsara poller ba | Gudanar da `poller.php --force --debug` da hannu |
| Bayanai sun zo na ƴan zagaye, sannan komai ya tsaya | Poller yana aiki a matsayin mai amfani da ba daidai ba, yana barin fayilolin da mai amfani da yanar gizo ba zai iya sabuntawa ba | Mai mallakar fayiloli a cikin kundin adireshi na RRD |
| Jadawalin yana cike da ƙananan gibi | Tazarar da aka tsara da tazarar da aka saita ba su jitu ba | Crontab, idan aka kwatanta da tazarar da aka saita |
| Composer ya ƙi shigarwa | PHP yana ƙasa da 8.4 ko ƙarin sashen da bayanan manhaja ke buƙata ba ya nan | `php -v`, `php -m`, da saƙon kuskuren Composer |
| Poller ba zai iya gudanar da aiki fiye da ɗaya ba | `pcntl` ko `posix` ba ya nan | `php -m` |

Shafin [Rajistar ayyuka](/ha/reference/logging/) yana bayyana inda kowannensu ke yin rikodin kansa. Shafin [Nemo matsalar bayanan da suka ɓace](/ha/guides/troubleshoot-missing-data/) yana magance matsalar inda shigarwar ke da kyau amma na’ura ɗaya ba ta aiki.

## Kafin ka buɗe shi ga waje

Poller yana aiki ne a matsayin mai amfani da tsarin kuma yana aiwatar da RRDtool da lambobin tattara bayananku. Ɗauki shigarwar a matsayin wani abu da ke gudanar da umarnin tsarin, saboda yana yin hakan ne a zahiri.

- Bayar da sabis ta TLS.
- Kada ka bar kalmar sirri ta asali ta shugaba a wurin, ko na ɗan lokaci kaɗan.
- Ƙuntata mai amfani da ma’ajiyar bayanai zuwa ma’ajiyar bayanansa kaɗai.
- Ajiye kundayen adireshi na RRD da na rajista a wajen tushen takardun yanar gizo.
- Bar asusun baƙo a kashe sai dai idan ka yanke shawarar akasin haka.

Shafin [Kare shigarwa mai fuskantar intanet](/ha/guides/secure-an-internet-facing-install/) yana da sauran bayanan. Na gaba: [Ƙara na’ura ta farko](/ha/start/first-device/).
