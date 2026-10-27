---
title: Àkókò àti àwọn ààlà àkókò
description: Ààlà àkókò ìwádìí, ìgbésẹ̀ RRD, ìlù-ọkàn àti ìyapa aago, àti ìdí tí àmì àkókò lórí àpẹẹrẹ fi ń pinnu ju bí àwọn ènìyàn ṣe ń retí lọ.
sidebar:
  order: 7
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
---

Gígba data ń kan àwọn aago mẹ́ta: iyára olùfilọ́lẹ̀, ààlà àkókò ìwádìí nínú ìpè kọ̀ọ̀kan, àti ìgbésẹ̀ RRD. Wọ́n nílò àwọn ètò tí ó báramu.

| Nọ́mbà | Ohun tí ó ni ín | Bí a ṣe ń lò ó |
|---|---|---|
| Ààlà àkókò olùfilọ́lẹ̀ | Cron, Task Scheduler tàbí `cactid.php` | Gbọ́dọ̀ bá `cron_interval` mu, tí `poller.php` ń túmọ̀ sí àáyá 60 tàbí 300 |
| Ààlà àkókò ìwádìí | Ìyípo gbígba data | `poller.php` ń ṣírò nọ́mbà pípé ti àwọn ìyípo fún ààlà àkókò olùfilọ́lẹ̀ kọ̀ọ̀kan |
| Ìgbésẹ̀ (Step) | Fáìlì RRD kan | Ààlà àkókò ìṣètò déédéé àkọ́kọ́, tí a ṣètò láti inú profaili orísun data nígbà ìṣẹ̀dá |
| Ìlù-ọkàn (Heartbeat) | Pápá kan nínú RRD | Ààlà àkókò tí ó ga jùlọ tí a gbà láyè láàárín àwọn ìsọdọ̀tun; ìṣẹ̀dá ń ka ìtumọ̀ pápá |

Fún àpẹẹrẹ, olùfilọ́lẹ̀ àáyá 60 àti ààlà àkókò ìwádìí àáyá 10 ń mú àwọn ìyípo mẹ́fà wá fún ìpè kọ̀ọ̀kan. Olùfilọ́lẹ̀ àáyá 300 àti ààlà àkókò ìwádìí àáyá 300 ń mú ìyípo kan wá. Má ṣe ṣètò ààlà àkókò olùfilọ́lẹ̀ láé láti kéré ju ààlà àkókò ìwádìí lọ: 60/300 ń ṣírò ìyípo òfo. Lo olùṣètò àkókò kan ṣoṣo, kí o sì dá a dúró kí o tó lo àṣẹ fífipáṣe `--force` pẹ̀lú ọwọ́. Wo [ìfìsílẹ̀](/yo/start/install/).

Ṣíṣàtúnṣe profaili kì í gbé àwọn fáìlì tó wà tẹ́lẹ̀ kúrò fúnra rẹ̀. A lè ṣètò ìlù-ọkàn; yíyí ìgbésẹ̀ padà nílò ìṣíkiri tí a gbèrò nípa lílo àwọn ohun èlò tí a tì lẹ́yìn ti RRDtool tí a fi sípò. Yẹ ìtumọ̀ ibi-ìpamọ́ data àti àbájáde `rrdtool info` wò lẹ́yìn náà.

## Nígbà tí wọ́n bá fohùn ṣọ̀kan

Orísun data tí ìgbésẹ̀ rẹ̀ bá dọ́gba pẹ̀lú ààlà àkókò ìwádìí tóótun nínú ìyípo kọ̀ọ̀kan sinmi lórí ipò ẹ̀rọ, àwọn ohun inú kache àti àwọn ààlà àkókò ìṣiṣẹ́. Ètò àkọ́kọ́ ń lo àáyá 300 fún méjèèjì. Títoótun kì í ṣe ẹ̀rí pé kíkà yóò kẹ́sẹjárí.

## Nígbà tí ìgbésẹ̀ bá gùn ju ààlà àkókò lọ

Nígbà tí a bá nílò ọ̀pọ̀lọpọ̀ àwọn àkókò tí ń ṣiṣẹ́, olùgbà data PHP ń lo `rrd_next_step` lórí ìlà kọ̀ọ̀kan nínú àkójọ iṣẹ́. Ó ń yan àwọn ìlà tí ó wà ní tàbí lábẹ́ òfo, lẹ́yìn náà ó ń sọ ìkàkíákíá olùgbà rẹ̀ àti àwọn ààlà host di tuntun. Àwọn ìlà tí ìgbésẹ̀ wọn bá dọ́gba pẹ̀lú ààlà àkókò ìwádìí ń wà ní òfo. Àwọn ìlà mìíràn ni a ń dínkù nípa ààlà àkókò ìwádìí; lábẹ́ ìṣànkúkúrú (underflow), títún bẹ̀rẹ̀ sinmi lórí irú ìpè: ìyípo olùfilọ́lẹ̀-kékeré déédéé ń tún bẹ̀rẹ̀ sí ìgbésẹ̀ yọ ààlà àkókò, nígbà tí àwọn ààlà tó dọ́gba àti àwọn ọ̀nà gbogbo host ń tún bẹ̀rẹ̀ sí ìgbésẹ̀ kíkún. Má ṣe rò pé ìgbésẹ̀ ìṣẹ́jú mẹ́wàá túmọ̀ sí ìpè yíyan ní ìṣẹ́jú márùn-ún ní gbogbo ìgbà; yẹ àwọn ìlà tí ń dúró gidi àti àwọn àmì àkókò ìsọdọ̀tun wò.

Tí **Ṣe Déédéé Ẹrù Ìṣiṣẹ́ (Balance Process Load)** bá wà ní títàn, kíkọ́ kache ń pèsè àwọn ìyapa kọjá àwọn orísun data ẹ̀rọ nípa lílo ìgbésẹ̀ àti ààlà àkókò ìwádìí. Àwọn pápá orísun kan náà ń pín ìyapa kan. Èyí lè tan iṣẹ́ kálẹ̀ kọjá àwọn ìyípo, ṣùgbọ́n kò ṣe ìdánilójú àkókò ìṣiṣẹ́ tó dọ́gba: ìfalẹ́ ẹ̀rọ, àkókò ìparí àti àwọn script ń yàtọ̀. Olùfilọ́lẹ̀ náà tún ń ṣe àtúnṣe fún àwọn ìkàkíákíá pápá tí kò báramu nínú orísun data kan.

Kí o tó pinnu pé ohun kan ti bàjẹ́ nítorí pé kò mú nǹkan kan jáde nígbà ìyípo kan, yẹ ipò rẹ̀ tí ń dúró àti àwọn ìyípo tó kàn wò. Fún àwọn ààlà títún kọ́, wo [kache poller](/yo/concepts/the-poller-cache/).

## Nígbà tí ìgbésẹ̀ bá kúrú ju ààlà àkókò lọ

Ìgbésẹ̀ kúkúrú kò lè mú àwọn ìwọ̀n tí olùgbà kò gbà rí jáde. Kadupul ń kìlọ̀ nígbà tí a bá ń kọ́ kache tí iyára gbígba data bá lọra jù fún ìgbésẹ̀ náà; yanjú àwọn ètò ìwádìí kí o sì tún kache tí ó kàn kọ́.

Àìbáramu yìí kì í ṣe dandan kí ó mú àwòrán bí oyin jáde. RRDtool lè ṣe déédéé àwọn ìsọdọ̀tun tí kò wọ́pọ̀ sí àwọn ìgbésẹ̀ kúkúrú tí ìlù-ọkàn bá gbà á láyè, ṣùgbọ́n kò ní mú àwọn kúlẹ̀kúlẹ̀ ìwọ̀n tí ó sọnù padà wá.

## Ìlù-ọkàn kì í ṣe ìlọ́po méjì ìgbésẹ̀ nígbà gbogbo

Ìlù-ọkàn (heartbeat) ni ààlà àkókò tí ó ga jùlọ tí a gbà láyè láàárín àwọn ìsọdọ̀tun kí a tó ka àmúwọlé sí unknown. Ìṣẹ̀dá RRD ń ka ìlù-ọkàn láti inú ìtumọ̀ pápá orísun data, èyí tí ó lè jogún àwọn ètò profaili tàbí àkọsílẹ̀ àwòṣe. Kì í ṣe àkókò àfikún tí a fi kún ìgbésẹ̀; fọwọ́ sí pápá gidi àti fáìlì náà tí wọ́n bá yàtọ̀ sí profaili.

Àwọn profaili tí a pèsè kì í tẹ̀lé òfin kan ṣoṣo.

| Profaili | Ìgbésẹ̀ | Ìlù-ọkàn | Ààlà àkókò ìsọdọ̀tun |
|---|---|---|---|
| Ìṣẹ́jú márùn-ún | 300 | 600 | Ìṣẹ́jú 10 |
| Ìṣẹ́jú kan | 60 | 600 | Ìṣẹ́jú 10 |
| Àáyá ọgbọ̀n | 30 | 1200 | Ìṣẹ́jú 20 |

Àwọn wọ̀nyí jẹ́ àwọn iye profaili tí a ti ṣètò tẹ́lẹ̀, kì í ṣe àwọn aago fífura sí ìdádúró. Àmúwọlé unknown tí ó hàn kedere lè dá àwọn àlàfo sílẹ̀ kí ìlù-ọkàn tó parí; ìṣètò déédéé àti àwọn ààlà àpamọ́ ń nípa lórí ohun tí a lè rí. Ìlù-ọkàn tí ó tóbi ń gba àwọn àlàfo gígùn láàyè láàárín àwọn ìsọdọ̀tun tó tọ́. Ní tàbí lábẹ́ ààlà àkókò ìsọdọ̀tun déédéé, ó ń fi ààyè díẹ̀ tàbí kò sí ààyè rárá sílẹ̀ fún ìfàsẹ́yìn.

Yẹ fáìlì gidi wò lẹ́gbẹ̀ẹ́ profaili náà. Àwọn RRD tó wà tẹ́lẹ̀ lè yàtọ̀ sí àwọn ìtumọ̀ ibi-ìpamọ́ data tí a yí padà; àyẹ̀wò fáìlì ń ròyìn irú àwọn ìyàtọ̀ bẹ́ẹ̀. Wo [ìtumọ̀ ìlù-ọkàn RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) àti [ìtọ́kasí ìṣètò](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) kí o tó gbèrò àwọn àtúnṣe fáìlì.

## Ohun tí a tọ́jú kì í ṣe ohun tí ẹ̀rọ náà sọ

RRDtool ń ṣe déédéé àwọn ìsọdọ̀tun sí àwọn ààlà ìgbésẹ̀ tí ó le koko. Àwọn iye láàárín àwọn ààlà lè ṣiṣẹ́ fún ọ̀pọ̀lọpọ̀ àwọn kókó data àkọ́kọ́. Ìlù-ọkàn, àwọn iye unknown kedere àti àwọn ààlà ń nípa lórí àmúwọlé tó tọ́; ìdapọ̀ àpamọ́ ń fi àwọn ààlà data tí a kò mọ̀ tirẹ̀ múlẹ̀. Fífi iye tí a mọ̀ sí inú ìgbésẹ̀ kan kò nílò àpẹẹrẹ aise ọ̀tọ̀.

Àwọn iye counter ń di àwọn ìwọ̀n lórí àkókò tí ó kọjá, èyí tí ó sinmi lórí títún counter bẹ̀rẹ̀, dídarí yíyípo àti àwọn ààlà. Àwọn iye gauge ni a ń ṣe déédéé lórí àkókò. Àwọn ìgòkè gíga kúkúrú lè dínkù nípa gbígba àpẹẹrẹ tàbí kí a fò wọ́n dà pátápátá; àwọn iye tí ó wà pẹ́ tàbí àwọn ìsọdọ̀tun tí ó so mọ́ ààlà kì í dandan dínkù. Àwọn ètò àpamọ́ kò lè tún àwọn kúlẹ̀kúlẹ̀ tí a kò gbà rí tàbí tí ó sọnù nígbà ìṣètò déédéé kọ́.

## Aago wo ni ó ń pinnu

Fún gbígba data déédéé ti `cmd.php`, SQL `CURRENT_TIMESTAMP()` ń pèsè àmì àkókò àbájáde nígbà tí a bá fi àkójọ kan sínú rẹ̀. Èyí kì í ṣe àmì àkókò tí ẹ̀rọ fúnni tàbí ìwọ̀n gidi ti ìgbà tí ẹ̀rọ náà dáhùn. Àwọn ohun èlò gbígba data mìíràn àti àwọn ọ̀nà àkókò gidi ni a gbọ́dọ̀ yẹ̀ wò lọtọ̀.

Olùgbà data PHP ń fi àwọn àbájáde rẹ̀ pamọ́ sínú buffer ó sì ń kọ wọ́n ní àkójọ, tí ó ń sọ buffer di òfo nígbà tí ẹ̀rọ bá yí padà tàbí tí buffer bá kún. A ń ṣe àyẹ̀wò àmì àkókò lẹ́ẹ̀kan fún àkójọ kọ̀ọ̀kan, nítorí náà iye kọ̀ọ̀kan nínú àkójọ kan ń gbé àkókò kan náà.

Àwọn àbájáde rẹ̀ kò hàn kedere, nítorí náà ó tọ́ láti ṣàlàyé wọn ní kíkún.

**Aago ẹ̀rọ náà kì í fi àmì àkókò sí àwọn àpẹẹrẹ SNMP wọ̀nyí.** Olùgbà ń lo àkókò ìfìsínú ibi-ìpamọ́ data. Àkókò ẹ̀rọ ṣì lè ṣe pàtàkì fún script kan tàbí fún ìtumọ̀ ìwọ̀n kan pàtó, nítorí náà èyí kì í ṣe ìdí gbogbogbòò láti fojúfo ìṣiṣẹ́pọ̀ aago.

**Aago tí kò tọ́ nínú olùgbà tàbí ibi-ìpamọ́ data rẹ̀ ń gbé data yí padà.** A ń fi àmì sí àwọn iye nínú àwọn ààyè tí kò tọ́, àti nínú fáìlì tí a ti kọ apá kan rẹ̀ tẹ́lẹ̀, ìsọdọ̀tun tí àkókò rẹ̀ kò bá pẹ́ ju ti ìkẹyìn lọ ni a ń kọ̀ lẹ́sẹ̀kẹsẹ̀. Tí àmì àkókò bá lọ sẹ́yìn ìsọdọ̀tun ìkẹyìn ti fáìlì náà, àwọn ìsọdọ̀tun tuntun kò lè gbé fáìlì yẹn síwájú títí tí àmì àkókò wọn yóò fi kọjá rẹ̀. Yẹ aago ibi-ìpamọ́ data, aago olùgbà àti àwọn àmì àkókò fáìlì wò; yíyí aago olùgbà nìkan padà kì í yí àwọn àmì àkókò tí ibi-ìpamọ́ data ń ṣe padà.

**Àkókò nínú ìyípo kan ń di gbígbọ̀n (jitter).** Ẹ̀rọ tí a wádìí ní tòsí òpin sáré gígùn kan ń gba àmì àkókò nígbà tí ó pẹ́ ju ẹ̀rọ tí a wádìí ní tòsí ìbẹ̀rẹ̀ lọ, bí ó tilẹ̀ jẹ́ pé méjèèjì jẹ́ ti ìyípo kan náà. Lórí olùgbà tí ẹrù rẹ̀ wúwo gan-an, gbígbọ̀n yẹn lè di apá ńlá ti ààlà àkókò náà, èyí sì jẹ́ ọ̀kan lára àwọn ọ̀nà tí ìlù-ọkàn tí a ṣètò ní tòsí ìgbésẹ̀ fi ń bẹ̀rẹ̀ sí dá àwọn àlàfo sílẹ̀.

**Agbègbè àkókò ti ibi-ìpamọ́ data wà láàárín ìrìn-àjò lọ-bọ̀.** A ń kọ àmì àkókò bí àmì àkókò ibi-ìpamọ́ data tí ibi-ìpamọ́ data sì ń yí padà sí àkókò pípé nígbà tí a bá kà á. Ìbójútó àgbègbè àkókò ìgbìmọ̀ tí kò báramu lè yí ìtumọ̀ yẹn padà. Yẹ àwọn ètò ìgbìmọ̀ àti àwọn ìyípadà wò nígbà tí o bá ń ṣe àyẹ̀wò ìṣípòpadà; yíyí àgbègbè àkókò ìfarahàn nìkan padà kò fìdí rẹ̀ múlẹ̀ pé ìtàn tí a tọ́jú ti yí padà.

## A ń ṣàkójọ àwọn kíkà nípasẹ̀ àmì àkókò

Orísun data tí ó ní ọ̀pọ̀lọpọ̀ pápá, bí interface tí ó ní àwọn bytes tí ń wọlé àti tí ń jáde, lè lo àwọn ohun àkójọ iṣẹ́ SNMP ọ̀tọ̀ọ̀tọ̀ tàbí script kan tí ń fúnni ní ọ̀pọ̀lọpọ̀ àwọn iye tí a sọ ní orúkọ. Àwọn pápá tí a fọ́n sí wẹ́wẹ́ ni a ń kójọ nípasẹ̀ orísun data àti àmì àkókò fún àwọn ìsọdọ̀tun RRD.

A ń da àkójọ tí kò kún dúró dípò kíkọ apá kan rẹ̀ títí tí iye àwọn pápá tí a ń retí yóò fi pé. Èyí jẹ́ àyẹ̀wò àkójọ, kì í ṣe ẹ̀rí pé pápá kọ̀ọ̀kan ní iye nọ́mbà tó tọ́; a ṣì lè kọ àwọn iye unknown kedere sílẹ̀. Ní gbogbogbòò àwọn apá méjèèjì wà nínú àkójọ kan náà wọ́n sì ń pín àmì àkókò kan, nítorí náà kò hàn síta. Àwọn àkójọ tí a fi sínú rẹ̀ láàárín àáyá àmì àkókò kan náà lè báramu pẹ̀lú. Nígbà tí àwọn pápá bá gba àwọn àmì àkókò ọ̀tọ̀ọ̀tọ̀, àwọn ẹgbẹ́ lè má pé kí wọn má sì mú ìsọdọ̀tun kankan jáde. Kóòdù ìsinsìnyí ń da àwọn ẹgbẹ́ tí kò pé dúró kọjá àwọn ìyípo, lẹ́yìn náà ó ń kọ wọ́n sínú log ó sì ń parí wọn lẹ́yìn àáyá `5 * max(60, poller_interval)`. A ti fa ààlà ojú-ewé kíkà gùn láti ní ẹgbẹ́ àmì àkókò ìkẹyìn rẹ̀ nínú.

A ń to àwọn ìsọdọ̀tun nípasẹ̀ àkókò tí ń gòkè kí a tó kọ wọ́n, nítorí pé fáìlì kì í gba iye èyíkéyìí tí ó ti gbó ju ìsọdọ̀tun ìkẹyìn rẹ̀ lọ.

## Àwọn kíkọ tí a sún síwájú ń pa àwọn àmì àkókò wọn mọ́

Nígbà tí a bá sún àwọn kíkọ RRD síwájú tí a sì lò wọ́n lẹ́yìn náà ní àkójọpọ̀, àmì àkókò tí a kọ sílẹ̀ ń bá iye náà rìn a sì ń kọ àkójọ náà nípasẹ̀ ìtòlẹ́sẹẹsẹ àkókò. A ń pa àmì àkókò ọ̀sán mọ́ kódà bí a bá dán ìsọdọ̀tun wò ní agogo kan ọ̀sán; a kì í fi àkókò fífọ buffer rọ́pò rẹ̀. RRDtool ṣì ń ṣe déédéé àwọn ìsọdọ̀tun tí a gbà sí àwọn ààlà ìgbésẹ̀ rẹ̀.

Àkójọ iṣẹ́ tí ó kù lè gbé fáìlì síwájú nípasẹ̀ àwọn àmì àkókò tí a tò tí ó jẹ́ tuntun ju ìsọdọ̀tun ìkẹyìn ti fáìlì náà lọ. Ṣùgbọ́n kò lè kún àwọn ihò èyíkéyìí tí ó wà lẹ́yìn àmì àkókò yẹn. Olùkọ Boost ń yọ àwọn àpẹẹrẹ tí ó dọ́gba tàbí tí ó wà ṣáájú ìsọdọ̀tun ìkẹyìn ti fáìlì náà kúrò, nítorí náà queue tí kò ní nǹkan kò fìdí rẹ̀ múlẹ̀ pé a lo àpẹẹrẹ kọ̀ọ̀kan. Wo [àwọn kíkọ ìwọ̀n gíga](/yo/concepts/high-volume-writes/) àti [ìtọ́kasí ìsọdọ̀tun RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Àwọn kíkọ tí a sún síwájú ṣì gbẹ́kẹ̀lé ìpamọ́ tí ó kẹ́sẹjárí àti ìtòlẹ́sẹẹsẹ àmì àkókò tí ó tọ́; wọn kì í ṣe ìdánilójú ìmúbọ̀sípò láti inú gbogbo ìkùnà. Yẹ àwọn àbájáde tí a dá dúró àti èyí tí a kọ̀ wò tí àkójọ iṣẹ́ kò bá tètè tán.

## Nígbà tí ìyípo kò bá parí

Olùgbà data PHP ń ṣàyẹ̀wò àkókò ìṣiṣẹ́ tí ó kọjá láàárín àwọn ohun iṣẹ́ ó sì ń parí loop àwọn ohun rẹ̀ ní kété tí ààlà àkókò ìwádìí bá kọjá pẹ̀lú ìkìlọ̀ nínú log. Èyí kì í ṣe ìdádúró líle ní àkókò ìparí: iṣẹ́ tí ń lọ lọ́wọ́ lè gba àkókò pípẹ́ kí ó tó dé àyẹ̀wò yẹn. Àwọn ohun tí kò dé ọ̀dọ̀ wọn kò ní mú iye kankan jáde nínú ìyípo yẹn. Àwọn àlàfo láàárín àwọn ìsọdọ̀tun tó tọ́ ni a lè kún tí àwọn ààlà ìlù-ọkàn àti àpamọ́ bá gbà á láyè. Ìrékọjá leralera jẹ́ ẹ̀rí láti wádìí agbára, àwọn àkókò ìparí àti àwọn àṣìṣe gbígba data, kì í ṣe ẹ̀rí pé gbogbo àlàfo tí a rí ní ìdí kan náà.

Ohun tí a gbọ́dọ̀ ṣe nípa èyí ni a jíròrò nínú [fa poller gùn](/yo/guides/scale-the-poller/). Ìtòlẹ́sẹẹsẹ sáré kan àti àwọn ìgbésẹ̀ ààbò wà nínú [ìgbésí-ayé poller](/yo/reference/poller-lifecycle/).
