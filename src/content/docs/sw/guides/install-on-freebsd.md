---
title: "Kusakinisha kwenye FreeBSD"
description: "Andaa huduma za FreeBSD, viendelezi vya PHP na hifadhi ya ndani kwa tathmini iliyotengwa."
banner:
  content: "Kadupul iko kabla ya alfa. Utaratibu huu wa jukwaa haujathibitishwa kutoka mwanzo hadi mwisho. Rasimu ya tafsiri inasubiri ukaguzi wa lugha."
---

## Chagua na uandae mwenyeji

Tumia toleo lililo kwenye jedwali la FreeBSD linaloungwa mkono na upange uboreshaji hadi 2027. Usaidizi wa mfumo si uthibitisho wa uoanifu wa Kadupul. Sakinisha PHP 8.4+, MySQL au MariaDB, RRDtool, Net-SNMP na seva ya wavuti kwa mwongozo wa Packages and Ports. Chaguomsingi za `php84-extensions` si orodha yote ya viendelezi; ongeza moduli zinazokosekana, ikiwemo `pcntl` ya CLI, kabla ya vitegemezi.

## Kagua mazingira na usanidi huduma

Kagua kitafsiri cha CLI na zana ulizochagua:

```sh
php -v
php -m
rrdtool --version
snmpget --version
```

Kagua PHP ya wavuti kando. Kwa PHP-FPM ya kifurushi, sanidi pool yake na kiunganishi cha seva ya wavuti kabla ya kuwezesha `php_fpm`. FreeBSD hutumia huduma za rc, si systemd; fuata mwongozo wa huduma. Fuata usakinishaji kwa hifadhidata, usanidi, skima na rasilimali za kivinjari. Linganisha zana na `mise.toml` ya programu; matoleo yaliyofungwa si ushahidi kwamba visakinishaji vya mazingira vya mise vinafanya kazi kwenye FreeBSD.

## Panga na uthibitishe kwa akaunti za huduma

Tumia kianzishaji kimoja cha cron chenye njia kamili na kipindi kilichosanidiwa; usisakinishe kitengo cha systemd cha Linux. Thibitisha utambulisho POSIX, kufunga saraka, umiliki na uaminifu wa UID/GID ulio wazi kwa kila akaunti ya wavuti/poller kabla ya ukusanyaji. Kwa jail, kagua mtandao, miunganisho ya hifadhi na ruhusa ndani yake. Endesha mzunguko mmoja usioingiliana, kagua safu zilizohifadhiwa kwenye foleni na nyakati za grafu, kisha fanya mazoezi ya kurejesha nakala zinazolingana. Kuanza kwa mchakato pekee hakutoshi. Soma mahitaji na nakala rudufu.

[Matoleo ya FreeBSD yenye usaidizi](https://www.freebsd.org/security/) · [Packages na Ports](https://docs.freebsd.org/en/books/handbook/ports/) · [Huduma za FreeBSD](https://docs.freebsd.org/en/books/handbook/config/) · [Usakinishaji](/sw/start/install/) · [Mahitaji](/sw/reference/requirements/) · [Nakala rudufu](/sw/guides/back-up-and-restore/)

Msingi wa programu umekaguliwa tarehe 26 Oktoba 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
