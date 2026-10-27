---
title: "Àwọn ohun tí a nílò"
description: "Àwọn ohun tí a nílò fún àyíká ìṣiṣẹ́, ìpamọ́ àti fífi sí iṣẹ́ fún ètò 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa."
---

A ṣàyẹ̀wò rẹ̀ ní ọjọ́ 26 Oṣù Kẹwàá 2026 pẹ̀lú àtúnṣe kóòdù ètò tí a so mọ́ ìsàlẹ̀. Ìpìlẹ̀ yìí jẹ́ fún ètò 2026–2027; kì í ṣe ìlérí ìtújáde tàbí àtìlẹ́yìn.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Àyíká ìṣiṣẹ́

`main` nílò PHP 8.4 tàbí tuntun sí i, ó sì darapọ̀ Symfony 7.4 mọ́ àwọn ẹnu-ọ̀nà ìwọlé àtijọ́. Ẹ̀ka `lts/1.2` ní àwọn ohun tí ó nílò lọ́tọ̀. Fi MySQL tàbí MariaDB, RRDtool, àti agbowó dátà PHP tàbí ẹ̀dà Spine tí ó bá a mu sílẹ̀. Nígbà tí o bá ń kọ́ láti kóòdù orísun, lo àwọn ẹ̀dà nínú `mise.toml` nípasẹ̀ `mise exec`; fi àwọn ohun ìgbẹ́kẹ̀lé tí a ti dì sí ẹ̀dà pàtó sílẹ̀ láì ṣe àfikún ẹ̀dà wọn.

## PHP

Fáìlì àkójọ ohun tí a nílò béèrè àwọn àfikún wọ̀nyí pẹ̀lú PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Ètò fífisílẹ̀ tún máa ń ṣàyẹ̀wò `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` àti `zlib`, lára àwọn mìíràn, lọ́tọ̀. Lórí Unix, ó ṣàyẹ̀wò `posix` àti `pcntl` fún CLI; lórí Windows, `com_dotnet`. Ṣíṣe àṣeyọrí nínú ètò fífisílẹ̀ kì í fi hàn pé a ti pé àwọn ohun tí Composer nílò. Ṣàyẹ̀wò PHP CLI àti PHP wẹ́ẹ̀bù lọ́tọ̀. Ṣètò `date.timezone`; ètò fífisílẹ̀ dámọ̀ràn `memory_limit=400M` àti `max_execution_time=60`, tàbí iye tí kò ní ààlà. Àfikún àṣàyàn `snmp` ń jẹ́ kí ìbéèrè ṣiṣẹ́ nínú ìlànà iṣẹ́; `gettext` ń mú àwọn àkójọ àtúmọ̀ ṣiṣẹ́.

## Ibùdó dátà

Lo ẹ̀dà MySQL tàbí MariaDB tí olùpèsè ṣì ń tọ́jú, kí o sì dán an wò pẹ̀lú àtúnṣe kóòdù tí o fẹ́ lò. Àwọn ààlà àtijọ́ fún MySQL 5.6 àti MariaDB 10.0 nínú ètò fífisílẹ̀ kò fi àtìlẹ́yìn 2026–2027 hàn. Lórí `main`, `poller_output`, `poller_output_boost` àti `poller_output_realtime` ń lo InnoDB; àwọn tábìlì ìṣọ̀kan kan ṣì ń lo MEMORY. Má ṣe yí gbogbo tábìlì padà sí ẹ́ńjìnnì kan ṣoṣo. Fi dátà sínú `mysql.time_zone_name`, kí o sì fún àkọọ́lẹ̀ ètò ní àṣẹ SELECT lórí tábìlì náà.

## RRDtool

Ṣètò ọ̀nà kíkún sí fáìlì tí a lè ṣiṣẹ́, kí ẹ̀dà tí a ṣètò sì bá èyí tí a fi sílẹ̀ mu. `DCOUNTER` àti `DDERIVE` nílò RRDtool 1.5 tàbí tuntun sí i. Ìpamọ́ abẹ́lé Unix nílò àyẹ̀wò ìdánimọ̀ POSIX àti `flock` fún àpò fáìlì tí ń ṣiṣẹ́ dáadáa. Dá àwọn ìlànà ìkọ̀wé ti òde àti àwọn iṣẹ́ cache dúró kí ìtọ́jú aláṣẹ-ẹni-kan tó bẹ̀rẹ̀. Ọ̀nà proxy àtijọ́ ṣì wà, ṣùgbọ́n kì í ṣe ẹ̀rí pé a ti ṣàyẹ̀wò fífi sí iṣẹ́.

## net-snmp

Fi àwọn irinṣẹ́ Net-SNMP sílẹ̀ bí PHP `snmp` kò bá sí tàbí bí a bá ti pa á. Ṣètò `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` àti `path_snmptrap` sí ọ̀nà fáìlì iṣẹ́ tó bá ọ̀kọ̀ọ̀kan mu. Dán ọ̀nà tí o yàn wò pẹ̀lú ẹ̀dà SNMP ẹ̀rọ náà, títí kan SNMPv3 lórí IPv6 níbi tí ó bá yẹ; ètò fífisílẹ̀ àtijọ́ kì í dámọ̀ràn PHP `snmp` fún àpapọ̀ yìí.

## Sáfà wẹ́ẹ̀bù

Ṣiṣẹ́ PHP nípasẹ̀ àyíká wẹ́ẹ̀bù tí a ṣètò, kí o sì lo TLS. Pa àwọn ipa-ọ̀nà àtijọ́ mọ́ pẹ̀lú `/app.php/...`; má ṣe yí gbogbo gbòǹgbò ìwé wẹ́ẹ̀bù padà sí `public/` nígbà tí àwọn ojú-ìwé àtijọ́ ṣì wà. Ṣètò PATH_INFO fún ẹnu-ọ̀nà ìbámu. Nginx kì í ka `.htaccess`; fi òfin ìdènà kedere sí kóòdù orísun, ètò ìṣètò, àwọn ohun ìgbẹ́kẹ̀lé, irinṣẹ́, ìdánwò, àṣírí àti ipò ìṣiṣẹ́ kí ìṣàkóso PHP tó bẹ̀rẹ̀. Jẹ́ kí ìbẹ̀rẹ̀ URL bá `$url_path` mu.

## Ètò àkókò

Lo ọ̀nà ìbẹ̀rẹ̀ kan ṣoṣo: cron, Task Scheduler tàbí iṣẹ́ daemon agbowó dátà tí a pèsè. Jẹ́ kí ìgbà ìbẹ̀rẹ̀ bá àárín àkókò tí a ṣètò mu. Kíkó dátà tí kò tó ìṣẹ́jú kan ń ṣiṣẹ́ nínú àárín àkókò náà; cron nìkan kì í pèsè irú àkókò bẹ́ẹ̀. Ṣe àyẹ̀wò pẹ̀lú àkọọ́lẹ̀ poller nígbà tí o ti dá ọ̀nà ìbẹ̀rẹ̀ déédéé dúró, kí àwọn iṣẹ́ má bàa ṣiṣẹ́ lórí ara wọn.

## Ètò fáìlì

Fún àwọn àkọọ́lẹ̀ tí ó nílò rẹ̀ nìkan ní àṣẹ sí àwọn ọ̀nà RRD gidi, àkọsílẹ̀ iṣẹ́, cache àti àpò ìṣiṣẹ́ Symfony. Àpò RRD àiyípadà ni `rra/`. Bí àkọọ́lẹ̀ Unix wẹ́ẹ̀bù àti poller bá yàtọ̀, a nílò nọ́ńbà ìdánimọ̀ kedere nínú `rrd_maintenance_trusted_uids` àti, fún ẹgbẹ́ tó lè kọ̀wé, `rrd_maintenance_trusted_gids`, nínú `include/config.php`. Gbogbo ọmọ ẹgbẹ́ tí a kọ sílẹ̀ gbọ́dọ̀ jẹ́ ẹni tí a gbẹ́kẹ̀lé. Àṣẹ fáìlì déédéé ṣì wúlò; a kọ ìpamọ́ tí gbogbo ènìyàn lè kọ sí. Lo ètò ìgbẹ́kẹ̀lé kan náà fún gbogbo ìlànà ìkọ̀wé, kí o sì ṣàyẹ̀wò àkọọ́lẹ̀ méjèèjì kí o tó gbé ẹ̀dà sókè.

## Àṣẹ pàtàkì

Ṣiṣẹ́ ìlànà wẹ́ẹ̀bù àti poller pẹ̀lú àkọọ́lẹ̀ pàtó tí kò ní àṣẹ gíga. ICMP raw nílò àfikún àṣẹ ẹ̀rọ ìṣiṣẹ́; lo àyẹ̀wò TCP, UDP tàbí SNMP bí àṣẹ náà kò bá sí. Má ṣe ṣiṣẹ́ gbogbo ètò bí root nítorí pé o fẹ́ mú ping ṣiṣẹ́. Windows kò ní àyẹ̀wò ACL tí a nílò fún ìtọ́jú RRD abẹ́lé tí ó lè pa dátà run; àfikún dátà déédéé ń lo ìdáhùn ìjẹ́rìí RRDtool tí a dúró dè kí a tó tẹ̀síwájú. Ẹ̀rí agbára ìṣàn dátà Unix kò jẹ́rìí agbára Windows.

## Nípa ẹ̀dà PHP

Fún ètò 2026–2027, PHP 8.4 ń gba àtìlẹ́yìn alágbára títí di 31 Oṣù Kejìlá 2026 àti àtúnṣe ààbò títí di 31 Oṣù Kejìlá 2028. PHP 8.5 ń gba àtìlẹ́yìn alágbára títí di 31 Oṣù Kejìlá 2027 àti àtúnṣe ààbò títí di 31 Oṣù Kejìlá 2029. Ọjọ́ iṣẹ́ akanṣe PHP ni wọ̀nyí, kì í ṣe tábìlì ìbámu Kadupul. Dán àyíká tuntun wò pẹ̀lú àwọn ohun ìgbẹ́kẹ̀lé tí a ti dì sí ẹ̀dà pàtó kí o tó gbà á lò. Ẹ̀dà PHP tó kéré jù tí Symfony nílò kò dín ààlà 8.4 ti Kadupul kù. Tún ṣàyẹ̀wò ètò àkókò orísun àti àtúnṣe kóòdù tí o fẹ́ lò kí o tó fi sí iṣẹ́.

[Ṣíṣètò ibùdó dátà](/yo/guides/tune-database-performance/) · [Ìsopọ̀ RRDtool](/yo/reference/rrdtool-integration/) · [SNMP](/yo/reference/snmp/) · [Ìṣètò fáìlì](/yo/reference/file-layout/) · [Fífisílẹ̀](/yo/start/install/) · [Ohun tí a nílò kí a tó gbé ìpamọ́ sókè](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Àwọn ẹ̀dà PHP tí a ń tì lẹ́yìn](https://www.php.net/supported-versions.php)
