---
title: "Shigarwa a FreeBSD"
description: "Shirya sabis na FreeBSD, ƙarin PHP da ajiyar gida don keɓaɓɓen tantancewa."
banner:
  content: "Kadupul yana kafin alfa. Ba a tabbatar da wannan hanyar dandalin daga farko zuwa ƙarshe ba. Fassarar daftari ce mai jiran dubawar harshe."
---

## Zaɓi ka shirya host

Yi amfani da sigar cikin jadawalin FreeBSD masu tallafi sannan a tsara haɓakawa zuwa 2027. Tallafin OS ba ya tabbatar da jituwar Kadupul. Shigar da PHP 8.4+, MySQL ko MariaDB, RRDtool, Net-SNMP da sabar yanar gizo bisa littafin Packages and Ports. Tsoffin saitunan `php84-extensions` ba dukkan jerin ƙarin manhajar ba ne; ƙara modulin da suka rasa, ciki har da `pcntl` na CLI, kafin abubuwan dogaro.

## Duba yanayi sannan a saita sabis

Duba fassarar CLI da kayan aikin da aka zaɓa:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Duba PHP na yanar gizo dabam. Ga PHP-FPM na fakiti, saita pool da hanyar sadarwar sabar yanar gizo kafin kunna `php_fpm`. FreeBSD yana amfani da sabis na rc, ba systemd ba; bi littafin sabis. Bi shigarwa don ma’ajiyar bayanai, saituna, schema da albarkatun burauza. Daidaita kayan aiki da `mise.toml` na manhajar; waɗannan sigogi ba hujjar cewa masu girka runtime na mise suna aiki a FreeBSD ba ne.

## Tsara kuma a tabbatar da asusun sabis

Yi amfani da hanya guda ta cron da cikakkun hanyoyin gudanarwa da tazarar da aka saita; kada a girka Linux systemd unit. Tabbatar da shaidar POSIX, kulle kundin adireshi, mallaka da bayyananniyar amincewar UID/GID a kowane asusun web/poller kafin tattarawa. Ga jail, duba hanyar sadarwa, mount da izini daga ciki. Yi zagaye guda ba tare da haɗuwa ba, duba layukan da aka riƙe da lokutan graf, sannan a gwada maidowa daga kwafi mai jituwa. Farawar aiki kaɗai ba ta isa ba. Duba bukatu da kwafin ajiya.

[Sigogin FreeBSD masu tallafi](https://www.freebsd.org/security/) · [Packages da Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Sabis na FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Shigarwa](/ha/start/install/) · [Bukatu](/ha/reference/requirements/) · [Kwafin ajiya](/ha/guides/back-up-and-restore/)

An duba tushen manhajar a ranar 26 Oktoba 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
