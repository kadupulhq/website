---
title: "Fífi sori ẹ̀rọ"
description: "Ohun tí Kadupul nílò láti ṣiṣẹ́, àti ètò bí a ṣe lè kó o jọ."
sidebar:
  order: 2
banner:
  content: "Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa."
---

:::caution[Ṣàyẹ̀wò rẹ̀ kí o tó lò ó]
Kóòdù orísun wà ní àrọ́wọ́tó, ṣùgbọ́n kò sí ẹ̀dà Kadupul tí a tì lẹ́yìn tàbí ipa-ọ̀nà ìṣípòpadà. Dán àwọn ìlànà wọ̀nyí wò lórí ẹ̀dà tí a yà sọ́tọ̀ pẹ̀lú àwọn àpamọ́ détà kí o tó gbẹ́kẹ̀lé wọn. Wo [ipò iṣẹ́ àkànṣe](/yo/project/status/).
:::

Tẹ̀lé àwọn ìgbésẹ̀ wọ̀nyí lẹ́ẹ̀kan ṣoṣo, ní tẹ̀léra. Ìgbésẹ̀ kọ̀ọ̀kan máa ń parí pẹ̀lú àyẹ̀wò. Ṣe àyẹ̀wò náà kí o tó tẹ̀síwájú: gbogbo ìkùnà tí a kọ síbí ní owó pọ́ọ́kú láti mọ̀ báyìí, ó sì gbówó lórí gidigidi láti wá a lẹ́yìn tí poller ti ṣiṣẹ́ fún ọ̀sẹ̀ kan.

Fún àwọn ohun tí ẹ̀rọ náà nílò, wo [Linux lórí ẹ̀rọ Windows](/yo/guides/install-on-windows/) àti [FreeBSD](/yo/guides/install-on-freebsd/). Àwọn ìlànà wọ̀nyí kì í ṣe ẹ̀rí ìdánwò ìtẹ́wọ́gbà láti ìbẹ̀rẹ̀ dé òpin.

## Ohun tí o nílò kọ́kọ́

Kadupul jẹ́ ètò PHP kan tí ó ń tọ́jú ètò ìṣètò rẹ̀ sínú MySQL tàbí MariaDB tí ó sì ń tọ́jú àwọn ìwọ̀n sínú àwọn fáìlì RRD lórí disk. Ojú-ewé yìí ń ṣe àlàyé nípa fífisílẹ̀ tuntun fún sáfà àkọ́kọ́ láti orísun `main` lọ́wọ́lọ́wọ́, kì í ṣe ìgbéga ẹ̀dà tàbí ẹ̀ka LTS tí a ti fi pamọ́. Àwọn ohun mẹ́rin gbọ́dọ̀ wà kí ó tó bẹ̀rẹ̀ sí ní ṣiṣẹ́.

| Ohun èlò | Ìdí tí a fi nílò rẹ̀ |
|---|---|
| PHP 8.4 tàbí tuntun sí i, lórí ẹ̀dà tí ó ní àtìlẹ́yìn ààbò | Ń ṣiṣẹ́ ojúlé wẹ́ẹ̀bù àti poller |
| MySQL tàbí MariaDB | Ń tọ́jú àwọn ẹ̀rọ, àwòṣe, àwọn olùlo, àti cache ti poller |
| RRDtool | Ń ṣẹ̀dá àti láti sọ àkójọ round-robin di tuntun, ó sì ń yà àwòrán ìṣirò |
| net-snmp | Ń pèsè àwọn irinṣẹ́ oníbàárà àti àkójọ ìwé tí a lò láti ṣe ìbéèrè sí àwọn ẹ̀rọ |

PHP tún nílò àwọn àfikún tí [ìwé àkójọ ètò](https://github.com/kadupulhq/kadupul/blob/main/composer.json) béèrè fún, títí kan `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`, `pcntl`, `posix`, àti `sqlite3`. Fi wọ́n sílẹ̀ fún àyíká ìṣiṣẹ́ CLI àti wẹ́ẹ̀bù méjèèjì. Ojú-ewé [Àwọn ohun tí a nílò](/yo/reference/requirements/) ya àwọn ohun tí Composer nílò sọ́tọ̀ kúrò nínú àwọn àyẹ̀wò ọ̀tọ̀ọ̀tọ̀ ti ètò fífisílẹ̀.

## Ìgbésẹ̀ 1: Fi àyíká ìṣiṣẹ́ sílẹ̀

Fi PHP pẹ̀lú àwọn àfikún rẹ̀, sáfà ibùdó dátà rẹ, RRDtool, àti net-snmp sílẹ̀ láti inú àwọn àkójọpọ̀ package ti ẹ̀rọ rẹ.

**Ṣàyẹ̀wò rẹ̀.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` gbọ́dọ̀ ṣe àkójọ àwọn àfikún tí a nílò. Àfikún PHP `snmp` jẹ́ ti àṣàyàn nígbà tí àwọn irinṣẹ́ CLI ti net-snmp bá wà ní àrọ́wọ́tó. Composer máa ń ṣàyẹ̀wò àwọn àfikún tí ó nílò lásìkò fífisílẹ̀ àwọn ohun ìgbẹ́kẹ̀lé; ètò fífisílẹ̀ wẹ́ẹ̀bù ní àyẹ̀wò àfikún ti tirẹ̀ lọ́tọ̀. Àbájáde àyíká ìṣiṣẹ́ kò mú ohun tí Composer béèrè fún kúrò.

Ètò ìṣètò PHP fún CLI àti ti sáfà wẹ́ẹ̀bù le yàtọ̀ sí ara wọn. Ṣàyẹ̀wò àwọn méjèèjì. Ètò fífisílẹ̀ dámọ̀ràn `memory_limit` tí kò dín ní 400M àti `max_execution_time` tí kò dín ní ìṣẹ́jú àáyá 60; ó tún gba àwọn iye tí kò ní ààlà (`-1` àti `0`, lẹ́sẹẹsẹ). Àwọn iye tí ó wà lábẹ́ àwọn ìdámọ̀ràn wọ̀nyí máa ń mú àwọn ìkìlọ̀ wá, nígbà tí `date.timezone` tí kò bá sí jẹ́ àṣìṣe. Ṣètò agbègbè àkókò kedere, bíi `UTC`, kí o sì lo `php --ini` láti mọ ètò ìṣètò ti CLI.

## Ìgbésẹ̀ 2: Ṣẹ̀dá ibùdó dátà àti olùlo rẹ̀

Ṣẹ̀dá ibùdó dátà kan tí ó ṣófo, àti olùlo kan tí ó ní àṣẹ lórí ibùdó dátà náà. Fún ibùdó dátà abẹ́lé, ṣiṣẹ́ SQL yìí bí alábòójútó ibùdó dátà, kí o sì pààrọ̀ ọ̀rọ̀-ìgbaniwọlé àpẹẹrẹ kí o tó lò ó:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Lo olùgbàlejò àkọọ́lẹ̀ ibùdó dátà tí ó bá a mu bí PHP bá ń sopọ̀ láti ẹ̀rọ míràn.

Sáfà ibùdó dátà tún nílò kí a kún àwọn tábìlì agbègbè àkókò rẹ̀ pẹ̀lú dátà, olùlo Kadupul sì nílò àṣẹ kíkà fún wọn, nínú ibùdó dátà `mysql`. Ìyẹn nìkan ni àṣẹ tí a fún un níta àgbékalẹ̀ tábìlì tirẹ̀. Kò sí ohun kan nípa ètò ìṣàbójútó tó dámọ̀ràn èyí, kò sì ṣe é yẹ̀bẹ̀wò; àyẹ̀wò ìsàlẹ̀ yìí yóò kùnà láìsí i.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Ṣàyẹ̀wò rẹ̀.** Wọlé bí olùlo ibùdó dátà Kadupul kí o sì ṣiṣẹ́:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Iye tí kò jẹ́ odo tí a da padà láìsí àṣìṣe àṣẹ ni ohun tí o fẹ́. Odo túmọ̀ sí pé a kò kó àwọn tábìlì náà wọlé rí; àṣìṣe túmọ̀ sí pé olùlo kò lè ka àwọn tábìlì náà. Àwọn méjèèjì yóò dá ètò fífisílẹ̀ dúró.

Àwọn ètò mẹ́rin lára ti sáfà náà fúnra rẹ̀ ṣe pàtàkì tó láti tún ṣe báyìí.

| Ètò | Ohun tí a fẹ́ | Ìdí rẹ̀ |
|---|---|---|
| `max_allowed_packet` | 16M tàbí jù bẹ́ẹ̀ lọ | Ìṣọ̀kan détà ńlá láàárín sáfà àkọ́kọ́ àti àwọn olùkójọ détà láti ọ̀nà jíjìn |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Àpèjúwe ẹ̀rọ ní àwọn lẹ́tà multi-byte nínú |
| `innodb_file_per_table` | On | Ń mú kí ààyè tábìlì wà lọ́tọ̀ọ̀tọ̀ kí a sì lè ṣàkóso wọn |
| `innodb_buffer_pool_size` | Ní nǹkan bí ìdá kan nínú mẹ́rin agbára ìrántí ẹ̀rọ | Ń pa détà tí a ń lò mọ́ sínú memory |

Ètò fífisílẹ̀ ń ròyìn ìwádìí tirẹ̀ lórí àwọn wọ̀nyí, ó sì ń sàmì sí àwọn tí kò pé, nítorí náà o kò nílò láti gba tábìlì gbọ́ láìṣe àyẹ̀wò. [Ṣíṣètò ibùdó dátà](/yo/guides/tune-database-performance/) ń tẹ̀síwájú sí i nígbà tí iṣẹ́ púpọ̀ bá wà lórí ẹ̀rọ.

## Ìgbésẹ̀ 3: Tú u jáde, tún àkóso rẹ̀ ṣe, kí o sì pèsè rẹ̀

Fi ètò náà sí ibìkan tí sáfà wẹ́ẹ̀bù rẹ ti lè pèsè rẹ̀, lẹ́yìn náà pinnu olùlo ẹ̀rọ tí yóò ni ín. Ìpinnu yẹn ṣe pàtàkì ju ibi tí a gbé e sí lọ. Àwọn ìlànà méjì ló ń kọ̀wé síbí: sáfà wẹ́ẹ̀bù, àti ohunkóhun tí ó ń tò àkókò fún poller. Ṣiṣẹ́ àwọn méjèèjì bí olùlo kan náà. Ṣiṣẹ́ poller láìsí àṣẹ gíga kí o sì fún àwọn ìlànà méjèèjì ní àṣẹ tí wọ́n nílò. Àkóso tí kò tọ́ tàbí àwọn ipò tí kò dára lè dènà àwọn àtúnṣe ọjọ́ iwájú kódà nígbà tí àwòrán ìṣirò bá ń jáde.

### Bí o bá ṣe àdàkọ ibi-ìpamọ́ dípò kí o tú ẹ̀dà tí a pèsè jáde

Ṣíṣe checkout Git nílò àwọn ohun ìgbẹ́kẹ̀lé PHP àti àwọn ohun èlò browser tí a pèsè. Pẹ̀lú àwọn àyíká ìṣiṣẹ́ `mise.toml` ti ibi-ìpamọ́ náà tí a ti fi sílẹ̀, ṣiṣẹ́ láti gbòǹgbò ibi-ìpamọ́:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer ń kó àwọn ohun èlò sínú `include/vendor/` ó sì ń mú àwọn fáìlì ìbámu padà bọ̀ sípò. Ìkọ́lé npm ń ṣẹ̀dá àwọn ohun èlò lábẹ́ `include/js/`, `include/fa/`, àti `include/vendor/flag-icons/`. Composer nìkan kò tó fún fífisílẹ̀ láti orísun.

Àkójọpọ̀ tí kò nílò íńtánẹ́ẹ̀tì tí ó ní àwọn ohun ìgbẹ́kẹ̀lé pípé jẹ́ àbájáde ìkọ́lé ọ̀tọ̀. Àpamọ́ orísun GitHub lásán kì í ṣe àkójọpọ̀ yẹn. Tẹ̀lé [ìlànà ìkọ́lé àti àyẹ̀wò láìsí íńtánẹ́ẹ̀tì](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation) nígbà tí ẹ̀rọ tí a fẹ́ lò kò bá ní ànfààní sí íńtánẹ́ẹ̀tì.

Pèsè àwọn ọ̀nà tí a lè kọ̀wé sí lẹ́yìn fífisílẹ̀ àwọn ohun ìgbẹ́kẹ̀lé:

| Ẹgbẹ́ | Àwọn àpò | Ìgbà tí a lè kọ̀wé sí i |
|---|---|---|
| Lásìkò fífisílẹ̀ | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Nígbà tí a bá ń fi sílẹ̀ tàbí gbé ẹ̀dà sókè nìkan |
| Lásìkò fífisílẹ̀ | `include/vendor/csrf/`, tàbí ibi `path_csrf_secret` tí a ṣètò | Ètò fífisílẹ̀ gbọ́dọ̀ dá àṣírí pàtó ti fífisílẹ̀ náà sílẹ̀; pa á mọ́ lẹ́yìn náà |
| Nígbà gbogbo | `log`, `cache/boost`, `cache/mibcache`, `cache/realtime`, `cache/spikekill`, àpò ìgbà díẹ̀ ti ẹ̀rọ | Fún gbogbo àkókò tí ètò náà yóò fi wà lẹ́nu iṣẹ́ |
| Àyíká Symfony | `var/cache`, àti `var/log` bí a bá ṣètò àkọsílẹ̀ fáìlì | Fún àyíká PHP àti olùlo tí ń mú cache gbóná |

Àpò RRD gbọ́dọ̀ ṣe é kọ̀wé sí fún gbogbo àkókò tí ètò náà yóò fi wà lẹ́nu iṣẹ́ pẹ̀lú. Ó ń tọ́jú ìtàn rẹ, nítorí náà fi ìtọ́jú tí o máa fún àpò ibùdó dátà fún un.

Ìṣípòpadà lọ́wọ́lọ́wọ́ ṣì nílò àwọn ipa-ọ̀nà àtijọ́ fún ìwọlé, ètò fífisílẹ̀, àti àwọn plugin. Fún fífisílẹ̀ àpapọ̀ yìí, pèsè gbòǹgbò ibi-ìpamọ́ náà pẹ̀lú àwọn òfin kedere tí kò gba àyè sí àwọn àpò àdáni, ètò ìṣètò, àwọn ohun ìgbẹ́kẹ̀lé àti ipò àyíká ìṣiṣẹ́. Má ṣe yí gbogbo fífisílẹ̀ náà padà sí `public/`: ìyẹn yóò mú àwọn ipa-ọ̀nà àtijọ́ tí a ṣì ń lò kúrò. Ẹnu-ọ̀nà Symfony ọ̀tọ̀ ní ọ̀nà ìdarí tirẹ̀; wo [àwọn ìtọ́ni ìṣípòpadà](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Fún Nginx, bẹ̀rẹ̀ láti [àwọn òfin ipò Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf) ti ibi-ìpamọ́ náà, nípa mímú gbòǹgbò àti PHP-FPM upstream bá a mu. Pa àwọn òfin ìkọ̀sílẹ̀ mọ́ kí ìṣàkóso PHP déédéé tó bẹ̀rẹ̀ kí o sì pa PATH_INFO mọ́ fún `/app.php/...`. Nginx kì í ka `.htaccess`. Pa àwọn fáìlì RRD, àkọsílẹ̀ àti àwọn àṣírí mọ́ kí a má bàa dé ọ̀dọ̀ wọn lórí HTTP; ṣàyẹ̀wò ètò ìṣètò sáfà gidi dípò kí o máa rò pé àwọn àṣẹ fáìlì nìkan yóò dí pípèsè wọn lọ́wọ́.

**Ṣàyẹ̀wò rẹ̀.** Di olùlo poller, kọ fáìlì kan sínú àpò kọ̀ọ̀kan nínú ẹgbẹ́ tí ó wà nígbà gbogbo, lẹ́yìn náà pa á rẹ́. Àṣẹ tí ó dàbí ẹni pé ó tọ́ nínú `ls -l` ṣì lè di èyí tí SELinux tàbí AppArmor kọ̀, kíkọ fáìlì náà sì ni àyẹ̀wò kan ṣoṣo tó ń dá lórí èyí. Lẹ́yìn náà, béèrè fún fáìlì kan lábẹ́ àpò log lórí HTTP. O fẹ́ kí ó kọ̀ ọ́.

## Ìgbésẹ̀ 4: Kọ fáìlì ìṣètò

Fún fífisílẹ̀ tuntun, da fáìlì ìṣètò tí a pín jáde kọ:

```bash
cp include/config.php.dist include/config.php
```

Má ṣe kọ lu ètò ìṣètò ti fífisílẹ̀ tí ó wà tẹ́lẹ̀. Tò olùgbàlejò ibùdó dátà, orúkọ, olùlo, àti ọ̀rọ̀-ìgbaniwọlé láti ìgbésẹ̀ 2. Àwọn iye méjì mìíràn tún ṣe pàtàkì ní fífisílẹ̀ àkọ́kọ́: `url_path`, ipa-ọ̀nà tí a pèsè ètò náà lábẹ́ rẹ̀ pẹ̀lú slash ní ìbẹ̀rẹ̀ àti ìparí, àti `poller_id`, èyí tí ó jẹ́ `1` lórí sáfà àkọ́kọ́ àti nǹkan míràn lórí olùkójọ détà láti ọ̀nà jíjìn nìkan.

Fi apá olùkójọ détà láti ọ̀nà jíjìn sílẹ̀ gẹ́gẹ́ bí àkíyèsí. O kò tíì kọ́ ọ̀kan báyìí; [Kíkó dátà jọ láti ọ̀nà jíjìn](/yo/concepts/remote-data-collection/) ṣàlàyé rẹ̀ nígbà tí o bá ṣe bẹ́ẹ̀. Gbogbo ètò mìíràn ní àiyípadà tí ń ṣiṣẹ́, nítorí náà ka [Ètò ìṣètò](/yo/reference/configuration/) kí o tó yí èyíkéyìí nínú wọn padà.

Ṣètò `APP_SECRET` pàtó fún fífi sí iṣẹ́ nínú àyíká ìlànà PHP fún àwọn ẹ̀yà Symfony tí ó ń lò ó. Ìbẹ̀rẹ̀ iṣẹ́ máa ń lo `APP_ENV=prod` àti `APP_DEBUG=0` bí àiyípadà, kì í sì í gba àwọn fáìlì `.env` wọlé. Èyí yàtọ̀ sí àṣírí CSRF ti ètò fífisílẹ̀ àtijọ́.

**Ṣàyẹ̀wò rẹ̀.** Ṣàyẹ̀wò syntax láìṣe àfihàn àwọn ẹ̀rí ìdánimọ̀:

```bash
php -l include/config.php
```

Kó àgbékalẹ̀ tábìlì wọlé ní ìgbésẹ̀ tí ń bọ̀ kí o tó ṣí ètò fífisílẹ̀ nínú browser kan.

## Ìgbésẹ̀ 5: Kó àgbékalẹ̀ tábìlì wọlé

Ètò fífisílẹ̀ ń retí pé àwọn tábìlì ti wà tẹ́lẹ̀. Kó àgbékalẹ̀ tábìlì tí a pèsè wọ inú ibùdó dátà tí o ṣẹ̀dá:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Ṣe èyí lẹ́ẹ̀kan ṣoṣo, sí ibùdó dátà tí ó ṣófo. Kì í ṣe script ìgbéga ẹ̀dà; kíkó rẹ̀ sínú ibùdó dátà tí ó ti ní dátà nínú lè kùnà tàbí kí ó fi dátà tí kò péye tí ó sì ń ta kora wọn sílẹ̀.

## Ìgbésẹ̀ 6: Ṣiṣẹ́ ètò fífisílẹ̀

Ṣí ojúlé náà nínú browser kí o sì tẹ̀lé e. Ètò fífisílẹ̀ ń tẹ̀lé àkójọpọ̀ tí a ti fìdí rẹ̀ múlẹ̀, ìgbésẹ̀ kọ̀ọ̀kan sì ń ṣí èyí tí ó tẹ̀lé e:

1. Ìkíni àti àṣẹ ìwé-ẹ̀rí.
2. Àyẹ̀wò àwọn ohun ìgbẹ́kẹ̀lé: Ẹ̀dà PHP àti àwọn àfikún, àwọn ètò PHP láti ìgbésẹ̀ 1 fún CLI àti sáfà wẹ́ẹ̀bù méjèèjì, àwọn tábìlì agbègbè àkókò, àti àwọn ètò ibùdó dátà láti ìgbésẹ̀ 2. Àṣìṣe máa ń dí bọ́tìnì tí ń bọ̀ lọ́wọ́. Ìkìlọ̀ kì í dí i, ṣùgbọ́n ka àwọn ìkìlọ̀ náà dáadáa.
3. Irú fífisílẹ̀: Sáfà àkọ́kọ́ tuntun, tàbí olùkójọ détà láti ọ̀nà jíjìn.
4. Àyẹ̀wò àṣẹ: Àwọn àpò láti ìgbésẹ̀ 3, tí a dán wò nípa kíkọ̀wé sínú wọn.
5. Àwọn ibi tí binary wà: Àwọn ipa-ọ̀nà sí PHP, RRDtool, àti àwọn irinṣẹ́ net-snmp.
6. Àkójọ orísun détà àti àárín àkókò olùbẹ̀rẹ̀.
7. Àṣàyàn àwòṣe: Àwọn àwòṣe ẹ̀rọ tí a fẹ́ kó wọlé.
8. Ìyípadà tábìlì, ìfọwọ́sí, àti fífisílẹ̀ náà fúnra rẹ̀.

Ohun kẹfà nínú àkójọ yẹn ni èyí tí ó ṣòro láti tún ṣe nígbà tó yá. Àkójọ tí o yàn máa ń pinnu ìgbésẹ̀ àti àkójọ ìpamọ́ tí a kọ sínú gbogbo fáìlì RRD tí a dá lẹ́yìn náà, àtúnṣe àkójọ náà kò sì ní gbé àwọn fáìlì tí ó ti wà tẹ́lẹ̀ kọjá. Àwọn àyípadà sí ìpamọ́ détà nílò ìṣípòpadà ọ̀tọ̀ tí a ti dán wò; wọn kì í nílò kí a sọ ìtàn nù ní gbogbo ìgbà. Bí àwọn iye tó ga jùlọ bá ṣe pàtàkì, rí i dájú pé àkójọ náà ń pa àwọn iye tó ga jùlọ mọ́ dípò àwọn ìpín nìkan: ka [Àwọn orísun dátà àti àkójọ round-robin](/yo/concepts/data-sources-and-rras/) kí o tó tẹ̀ ẹ́ kọjá. Àárín àkókò olùbẹ̀rẹ̀ tí a pèsè níbẹ̀ jẹ́ ìṣẹ́jú kan tàbí ìṣẹ́jú márùn-ún. Àkójọ orísun détà máa ń tò àárín àkókò ìkójọpọ̀; olùbẹ̀rẹ̀ àti àkójọ gbọ́dọ̀ wà ní ìbámu sí ara wọn.

## Ìgbésẹ̀ 7: Yí àwọn ẹ̀rí ìdánimọ̀ àiyípadà padà

Àgbékalẹ̀ tábìlì tí a pèsè ń dá àkọọ́lẹ̀ alábòójútó tí orúkọ rẹ̀ jẹ́ `admin` pẹ̀lú ọ̀rọ̀-ìgbaniwọlé `admin`, tí a sàmì sí kí ìwọlé àkọ́kọ́ fi le fipá mú kí a yí i padà. Ó tún ń dá àkọọ́lẹ̀ àlejò tí a ti pa sílẹ̀. Yí ọ̀rọ̀-ìgbaniwọlé náà padà kí ẹlòmíràn tó lè dé ọ̀dọ̀ rẹ̀, èyí tí ó túmọ̀ sí kí o tó so ó mọ́ nẹ́tíwọ́ọ̀kì tí àwọn ẹlòmíràn lè rí.

## Ìgbésẹ̀ 8: Ṣètò àkókò fún poller

Poller gbọ́dọ̀ bẹ̀rẹ̀ láti òde. Ṣètò àárín àkókò ìkójọpọ̀ rẹ̀ àti àárín àkókò olùbẹ̀rẹ̀ ní ìbámu; poller ń ṣe àtìlẹ́yìn fún àárín àkókò olùbẹ̀rẹ̀ ti ìṣẹ́jú kan tàbí ìṣẹ́jú márùn-ún, ó sì ní àbò láti dènà àwọn iṣẹ́ déédéé láti dé ní kùtùkùtù jù. Fún olùbẹ̀rẹ̀ ìṣẹ́jú kan, fi àkọsílẹ̀ yìí sínú crontab olùlo poller tí kò ní àṣẹ gíga, kí o sì fi àwọn ọ̀nà pípé rọ́pò `php` àti ọ̀nà ètò náà:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

tàbí ṣiṣẹ́ daemon `cactid.php` tí a pèsè nípa lílo `service/cactid.service`, tí a tún ṣe fún ọ̀nà fífisílẹ̀ rẹ àti olùlo tí kò ní àṣẹ gíga. Lo olùbẹ̀rẹ̀ kan ṣoṣo: pa iṣẹ́ cron tàbí aago dúró nígbà tí o bá ń lo daemon náà.

Jẹ́ kí ètò àkókò gidi bá àárín àkókò olùbẹ̀rẹ̀ tí a ṣètò mu. Fún àwọn àkójọ ìkójọpọ̀ tí kò tó ìṣẹ́jú kan, poller tí a bẹ̀rẹ̀ ń ṣiṣẹ́ àwọn ìyípo ìkójọpọ̀ láàárín àárín àkókò náà; má ṣe gbìyànjú láti fi àkókò tí kò tó ìṣẹ́jú kan hàn pẹ̀lú àkọsílẹ̀ cron yìí.

**Ṣàyẹ̀wò rẹ̀.** Ṣiṣẹ́ ìyípo kan pẹ̀lú ọwọ́ bí olùlo poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` ń fò kọjá àbò àkókò ìbẹ̀rẹ̀ kùtùkùtù. Lo àyẹ̀wò ọwọ́ yìí nígbà tí olùtò-àkókò bá wà ní dídúró kí ó má bàa kọ lu iṣẹ́ tí a ti ṣètò sí àkókò náà. Kò fò kọjá àwọn àyẹ̀wò ìtọ́jú tàbí ààbò mìíràn. O fẹ́ kí ó parí dáadáa pẹ̀lú ìlà àkótán kan. Lẹ́yìn náà, tan olùtò-àkókò kí o sì fi sílẹ̀ fún àwọn àárín àkókò méjì; rí i dájú pé iṣẹ́ míràn tún wáyé láìsí ìwọ.

## Àwọn ohun tí ó lè bàjẹ́

Àwọn wọ̀nyí ni àwọn ìkùnà tí fífisílẹ̀ àkọ́kọ́ máa ń bá pàdé gan-an.

| Àmì àrùn | Ìdí rẹ̀ | Ibi tí a ó wo |
|---|---|---|
| Ètò fífisílẹ̀ dí lórí àwọn ètò PHP tí ó jọ pé ó tọ́ | Sáfà wẹ́ẹ̀bù àti CLI ń ka àwọn fáìlì `php.ini` ọ̀tọ̀ọ̀tọ̀ | `php --ini`, àti fáìlì tí web SAPI ń ròyìn |
| Ètò fífisílẹ̀ dí lórí agbègbè àkókò | A kò kó àwọn tábìlì agbègbè àkókò wọlé, tàbí olùlo Kadupul kò lè kà wọ́n | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Ìgbésẹ̀ àṣẹ kùnà lórí àpò tí ó dàbí pé a lè kọ̀wé sí | Olùni tí kò tọ́, tàbí SELinux àti AppArmor | Kọ fáìlì kan bí olùlo poller |
| Fífisílẹ̀ parí, kò sí détà tí ó dé rí | A kò ṣètò àkókò fún poller rí | Ṣiṣẹ́ `poller.php --force --debug` pẹ̀lú ọwọ́ |
| Détà dé fún àwọn ìyípo díẹ̀, lẹ́yìn náà kò sí nǹkankan mọ́ | Poller ń ṣiṣẹ́ bí olùlo tí kò tọ́, ó sì ń fi àwọn fáìlì tí olùlo wẹ́ẹ̀bù kò lè túnṣe sílẹ̀ | Olùni àwọn fáìlì nínú àpò RRD |
| Àwọn àwòrán ìṣirò kún fún àwọn àlàfo kéékèèké | Àkókò tí a ṣètò àti àkókò tí a tò kò bára mu | Crontab, lòdì sí àárín àkókò tí a ṣètò |
| Composer kọ fífisílẹ̀ | PHP wà lábẹ́ 8.4 tàbí àfikún tí ìwé àkójọ béèrè fún kò sí | `php -v`, `php -m`, àti àbájáde àṣìṣe Composer |
| Poller kò lè ṣiṣẹ́ ju ìlànà kan lọ | `pcntl` tàbí `posix` kò sí | `php -m` |

Ojú-ewé [Àkọsílẹ̀ iṣẹ́](/yo/reference/logging/) ṣàlàyé ibi tí ọ̀kọ̀ọ̀kan ń gbé ara rẹ̀ pamọ́ sí. Ojú-ewé [Wíwá ìdí tí détà fi dínkù](/yo/guides/troubleshoot-missing-data/) dá lórí ipò tí fífisílẹ̀ dára ṣùgbọ́n tí ẹ̀rọ kan kò dára.

## Kí o tó fi hàn síta

Poller ń ṣiṣẹ́ bí olùlo ẹ̀rọ, ó sì ń ṣiṣẹ́ RRDtool pẹ̀lú àwọn script ìkójọpọ̀ détà rẹ. Wo ètò fífisílẹ̀ bí ohun tí ń ṣiṣẹ́ àwọn àṣẹ, nítorí pé ó ń ṣe bẹ́ẹ̀ gan-an.

- Pèsè rẹ̀ lórí TLS.
- Má ṣe fi ọ̀rọ̀-ìgbaniwọlé alábòójútó àiyípadà sílẹ̀, kódà fún ìgbà díẹ̀.
- Mú kí olùlo ibùdó dátà wà fún ibùdó dátà tirẹ̀ nìkan.
- Pa àwọn àpò RRD àti àkọsílẹ̀ mọ́ níta gbòǹgbò ìwé wẹ́ẹ̀bù.
- Fi àkọọ́lẹ̀ àlejò sílẹ̀ ní pípa àyàfi bí o bá pinnu láti ṣe bẹ́ẹ̀.

[Mímú ààbò wà fún ètò tó ń kọjú sí íńtánẹ́ẹ̀tì](/yo/guides/secure-an-internet-facing-install/) ní àwọn ìyókù. Èyí tí ó tẹ̀lé e: [Fi ẹ̀rọ àkọ́kọ́ kún un](/yo/start/first-device/).
