---
title: "Fífisílẹ̀ lórí FreeBSD"
description: "Pèsè iṣẹ́ FreeBSD, àfikún PHP àti ìpamọ́ abẹ́lé fún ìdánwò tí a yà sọ́tọ̀."
banner:
  content: "Kadupul ṣì wà ṣáájú alfa. A kò tíì ṣàyẹ̀wò gbogbo ìlànà pẹpẹ yìí láti ìbẹ̀rẹ̀ dé òpin. Àkọ́kọ́ àtúmọ̀ yìí ń dúró de àyẹ̀wò èdè."
---

## Yan kí o sì pèsè host

Lo ẹ̀dà tó wà nínú tábìlì FreeBSD tí a ń tì lẹ́yìn, kí o sì pète ìmúdójúìwọ̀n títí di 2027. Àtìlẹ́yìn OS kò jẹ́rìí ìbámu Kadupul. Fi PHP 8.4+, MySQL tàbí MariaDB, RRDtool, Net-SNMP àti sáfà wẹ́ẹ̀bù sílẹ̀ nípasẹ̀ ìwé Packages and Ports. Àiyípadà `php84-extensions` kì í ṣe gbogbo àkójọ àfikún; fi modulu tó sọnù, pẹ̀lú `pcntl` fún CLI, sílẹ̀ kí àwọn ìgbẹ́kẹ̀lé tó bẹ̀rẹ̀.

## Ṣàyẹ̀wò àyíká kí o sì ṣètò iṣẹ́

Ṣàyẹ̀wò atúmọ̀ CLI àti irinṣẹ́ tí o yàn:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Ṣàyẹ̀wò PHP wẹ́ẹ̀bù lọ́tọ̀. Fún PHP-FPM àkójọpọ̀, ṣètò pool àti ìsopọ̀ sáfà wẹ́ẹ̀bù kí o tó mú `php_fpm` ṣiṣẹ́. FreeBSD ń lo iṣẹ́ rc, kì í ṣe systemd; tẹ̀lé ìwé iṣẹ́. Tẹ̀lé fífisílẹ̀ fún ibùdó dátà, ìṣètò, schema àti ohun èlò aṣàwákiri. Jẹ́ kí irinṣẹ́ bá `mise.toml` ti ètò mu; ẹ̀dà pàtó wọ̀nyí kì í jẹ́rìí pé àwọn olùfísílẹ̀ àyíká mise ń ṣiṣẹ́ lórí FreeBSD.

## Ṣètò àkókò kí o sì ṣàyẹ̀wò bí àkọọ́lẹ̀ iṣẹ́

Lo ọ̀nà cron kan pẹ̀lú ọ̀nà iṣẹ́ kíkún àti àárín àkókò tí a ṣètò; má fi Linux systemd unit sílẹ̀. Ṣàyẹ̀wò ìdánimọ̀ POSIX, títì àpò fáìlì, oníǹkan àti ìgbẹ́kẹ̀lé UID/GID kedere gẹ́gẹ́ bí àkọọ́lẹ̀ wẹ́ẹ̀bù/poller kọ̀ọ̀kan kí kíkó dátà tó bẹ̀rẹ̀. Fún jail, ṣàyẹ̀wò nẹ́tíwọ́ọ̀kì, mount àti àṣẹ nínú jail. Ṣiṣẹ́ ìyípo kan láìṣẹ́pọ̀, ṣàyẹ̀wò ìlà dátà tó ń dúró àti àkókò àwòrán, kí o sì dán ìmúpadàbọ̀ ẹ̀dà ààbò tó bá ara rẹ̀ mu wò. Ìbẹ̀rẹ̀ iṣẹ́ tó ṣàṣeyọrí nìkan kò tó. Wo ohun tí a nílò àti ẹ̀dà ààbò.

[Ẹ̀dà FreeBSD tí a ń tì lẹ́yìn](https://www.freebsd.org/security/) · [Packages àti Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Iṣẹ́ FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Fífisílẹ̀](/yo/start/install/) · [Ohun tí a nílò](/yo/reference/requirements/) · [Ẹ̀dà ààbò](/yo/guides/back-up-and-restore/)

A ṣàyẹ̀wò ìpìlẹ̀ ètò ní ọjọ́ 26 Oṣù Kẹwàá 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
