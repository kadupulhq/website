---
title: "Fi ẹ̀rọ àkọ́kọ́ kún un"
description: "Bẹ̀rẹ̀ sí ní gba àkójọpọ̀ détà láti ara ẹ̀rọ kan, kí o sì rí i dájú pé détà ń dé kí o tó kọ́ ohunkóhun lórí rẹ̀."
sidebar:
  order: 3
banner:
  content: "Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa."
---

Fi ẹ̀rọ kan kún un, rí i dájú pé ó ń dáhùn, lẹ́yìn náà nìkan ni kí o tẹ̀síwájú. Ọ̀pọ̀lọpọ̀ ìṣòro pẹ̀lú ètò ìṣàbójútó máa ń bẹ̀rẹ̀ láti ara ẹ̀rọ tí kò dáhùn dáadáa rí láti ìbẹ̀rẹ̀ pẹ̀pẹ̀.

Yan ẹ̀rọ kan tí kò ní mú ìbàjẹ́ wá bí àṣìṣe bá wáyé. Switch tí o ní, lórí nẹ́tíwọ́ọ̀kì tí o ń darí, pẹ̀lú SNMP tí a ti tan sí i tẹ́lẹ̀. Má ṣe bẹ̀rẹ̀ pẹ̀lú ẹ̀rọ tí ẹnìkan ń béèrè lọ́wọ́ rẹ nípa rẹ̀.

## Kí o tó bẹ̀rẹ̀

Fún àpẹẹrẹ SNMP yìí, ẹ̀rọ náà gbọ́dọ̀ dáhùn àwọn ìbéèrè láti ọ̀dọ̀ olùkójọ détà (collector) tí a yàn fún un. Ṣe àwọn àyẹ̀wò náà lórí olùkójọ détà yẹn, ó dára jù kí o ṣe é bí olùlo poller; ìbéèrè láti inú kọ̀ǹpútà rẹ le gba ojú ọ̀nà firewall míràn. Fi àwọn ẹ̀rí ìdánimọ̀ kíkà-nìkan (read-only) tí a tò sori ẹ̀rọ rẹ rọ́pò àdírẹ́sì àti àkójọpọ̀ (community) àpẹẹrẹ náà. Àwọn nọ́mbà OID tí ó wà ní ìsàlẹ̀ yìí tún ń ṣiṣẹ́ nígbà tí a kò bá fi àwọn fáìlì orúkọ MIB ti ibẹ̀ sori ẹ̀rọ.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Bí èyí bá da àkọsílẹ̀ àlàyé padà, tẹ̀síwájú. Bí àkókò bá kọjá (timeout), kọ́kọ́ tún èyí ṣe. Kò sí iye ètò ìṣètò lórí ojúlé wẹ́ẹ̀bù tí yóò mú kí ẹ̀rọ tí a kò le dé ọ̀dọ̀ rẹ̀ dáhùn.

Lẹ́yìn náà, ṣàyẹ̀wò tábìlì tí o fẹ́ ya àwòrán ìṣirò rẹ̀ gan-an, nítorí pé ẹ̀rọ kan le dáhùn `sysDescr` ṣùgbọ́n kí ó kọ tábìlì ojú-ìbánisọ̀rọ̀ (interface).

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

OID kejì ni ọwọ̀n `ifDescr`. O nílò ìlà kan fún ojú-ìbánisọ̀rọ̀ kọ̀ọ̀kan tí ó hàn síta. Àbájáde tí kò ní nǹkan nínú le túmọ̀ sí ìwòye SNMP tí a dínkù tàbí tábìlì tí kò ní àtìlẹ́yìn; àṣìṣe àṣẹ ń tọ́ka sí ẹ̀rí ìdánimọ̀ tàbí ìlànà ìwọlé. Ṣàyẹ̀wò àṣìṣe tí a da padà kí o tó yí ètò ẹ̀rọ tàbí ti Kadupul padà.

Àwọn kókó méjì nípa àwọn ẹ̀yà SNMP yóò pinnu àwọn nǹkan nígbà tó yá, nítorí náà yanjú wọn báyìí.

| Ẹ̀yà | Kí ni ó túmọ̀ sí fún ọ |
|---|---|
| v1 | Kò ní àtìlẹ́yìn Counter64. Àwọn ìsopọ̀ tó yára le kọjá àwọn counter octet 32-bit ní ọ̀pọ̀ ìgbà láàárín àkókò ìwádìí (wrap), èyí tí yóò mú kí ìṣirò náà dàrú |
| v2c | Ó ń ṣe àtìlẹ́yìn Counter64 nígbà tí aṣojú (agent) bá fi hàn síta; a ń fi àwọn ọ̀rọ̀ àkójọpọ̀ ránṣẹ́ ní kedere láìsí ìbòjú |
| v3 | Ó ń ṣe àtìlẹ́yìn fún ìfọwọ́sí àti ìbòjú pẹ̀lú `authPriv`; yíyan v3 nìkan kò ní tan àwọn méjèèjì |

Fẹ́ràn v3 pẹ̀lú `authPriv` níbi tí a ti ń tì í lẹ́yìn, tàbí v2c lórí nẹ́tíwọ́ọ̀kì ìṣàkóso tí a dínkù. Yan irú àwòrán ojú-ìbánisọ̀rọ̀ 64-bit pẹ̀lú ẹ̀yà SNMP náà. Bí ẹ̀rọ náà bá ń lo v1 nìkan, wo àkókò ìwádìí àti ìṣirò sísàn détà nínú tábìlì ìkùnà ní ìsàlẹ̀ ojú-ewé yìí. [SNMP](/yo/reference/snmp/) ṣàlàyé àwọn pápá ẹ̀rí ìdánimọ̀ ní ẹ̀kúnrẹ́rẹ́.

## Ṣe ìpinnu lórí àwọn nǹkan mẹ́ta kí o tó ṣí fọ́ọ̀mù náà

**Àwọn ẹ̀rí ìdánimọ̀.** Àwọn tí o dán wò lókè yìí gan-an, pẹ̀lú port tí kò bá jẹ́ èyí tí a fi lélẹ̀ tẹ́lẹ̀.

**Ọ̀nà ìwádìí wíwà ní àrọ́wọ́tó.** Èyí ni bí Kadupul ṣe ń pinnu pé ẹ̀rọ ń ṣiṣẹ́ (up), kò sì gbára lé bóyá kíkó détà jọ ń ṣiṣẹ́. Àwọn àṣàyàn tí a pèsè ni none, ping, SNMP uptime, SNMP description, SNMP getNext, àti àpapọ̀ méjì ti ping pẹ̀lú SNMP uptime, ọ̀kan nílò àwọn méjèèjì nígbà tí òmíràn gba èyíkéyìí nínú wọn.

Fẹ́ràn ọ̀nà SNMP fún ẹ̀rọ tí o ń ṣe ìwádìí rẹ̀ lórí SNMP. Ó ń dán ohun tí o gbẹ́kẹ̀lé wò. ICMP ping nílò raw socket, èyí tí ó nílò àwọn ànfààní tí àwọn olùlo wẹ́ẹ̀bù àti poller kì í sábà ní, nítorí náà ẹ̀rọ tí ó dáhùn `ping` láti inú shell rẹ le jẹ́ kí a ròyìn rẹ̀ pé ó wà ní ìsàlẹ̀. TCP ping sí port kan tí o mọ̀ pé ó ṣí sílẹ̀ ń yẹra fún èyí.

**Àwòṣe ẹ̀rọ.** Yan èyí tí ó bá ohun èlò kọ̀ǹpútà (hardware) mu.

## Fi kún un

1. Ní ojú-ewé **Àwọn ẹ̀rọ** àtijọ́ (`host.php`), yan **Add**. Ṣíṣẹ̀dá ẹ̀rọ àti ìṣètò àwòrán ìṣirò ṣì ń lo ojú-ewé yìí lásìkò ìṣípòpadà Symfony. Tẹ àlàyé, orúkọ olùgbàlejò tàbí àdírẹ́sì, olùkójọ détà tí a yàn, ẹ̀yà SNMP, àti àwọn ẹ̀rí ìdánimọ̀ sínú rẹ̀.
2. Tò ọ̀nà ìwádìí wíwà ní àrọ́wọ́tó tí o yàn.
3. Yan àwòṣe ẹ̀rọ náà.
4. Fi pamọ́, rí i dájú pé a tan ẹ̀rọ náà sí iṣẹ́, kí o sì ka pẹpẹ wíwà ní àrọ́wọ́tó/SNMP rẹ̀. Àkọsílẹ̀ ibi-ìpamọ́ détà tí a fi pamọ́ kì í ṣe ẹ̀rí pé kíkó détà jọ ti yọrí sí rere.

## Kí ni àwòṣe ẹ̀rọ máa ń pinnu

Àwòṣe ẹ̀rọ ń so àwọn àwòṣe àwòrán ìṣirò àti àwọn ìbéèrè détà pọ̀ mọ́ ẹ̀rọ náà. Ìbéèrè détà máa ń ṣe àyẹ̀wò tábìlì kan lórí ẹ̀rọ náà, bí àwọn ojú-ìbánisọ̀rọ̀ rẹ̀, ó sì ń mú atọ́ka (index) kan jáde fún ìlà kọ̀ọ̀kan. Fífi àwòṣe náà sí iṣẹ́ tún ń darí àwọn ìbéèrè détà rẹ̀ láti kún àwọn atọ́ka wọ̀nyẹn. Nígbà tí a bá pa ìṣiṣẹ́-láìfọwọ́ṣe ti àwòrán ìṣirò, àwọn ìbáṣepọ̀ wọ̀nyẹn kì í dá àwòrán ìṣirò kankan sílẹ̀ fúnrawọn. Nígbà tí a bá tan ìṣiṣẹ́-láìfọwọ́ṣe ti àwòrán ìṣirò, àwọn ìsopọ̀ àwòṣe/ìbéèrè le ṣẹ̀dá àwọn àwòrán ìṣirò lábẹ́ àwọn òfin tí ó bá a mu; ṣàyẹ̀wò àwọn àwòrán ìṣirò tí ó wà tẹ́lẹ̀ kí o tó fi ẹ̀dà míràn kún un.

Yíyí àwòṣe padà le yí àwọn ìbáṣepọ̀ padà kí ó sì tún àwọn ìsopọ̀ wọ̀nyẹn ṣiṣẹ́. Kì í ṣe ìtúntò àwọn àwòrán ìṣirò tàbí àwọn orísun détà tí ó wà tẹ́lẹ̀. Ṣàyẹ̀wò àwòṣe tí a yàn àti àwọn atọ́ka tí a béèrè kí o tó fi sí iṣẹ́ lórí ẹ̀rọ tí ó ti ní ìtàn tẹ́lẹ̀.

Àwọn atọ́ka wọ̀nyẹn ni ìdí tí o fi ń yan àwọn ojú-ìbánisọ̀rọ̀ láti inú àtòjọ dípò kíkọ OID pẹ̀lú ọwọ́. [Àwọn àwòṣe](/yo/concepts/templates/) àti [Àwọn ìbéèrè détà àti àwọn atọ́ka](/yo/concepts/data-queries-and-indexes/) ṣàlàyé àwọn méjèèjì dáadáa.

## Ka pẹpẹ ipò

Nígbà tí a bá fi ẹ̀rọ pamọ́ pẹ̀lú ọ̀nà wíwà ní àrọ́wọ́tó SNMP, Kadupul ń ṣí àkókò ìbánisọ̀rọ̀ (session) ó sì ń fún ọ ní ìròyìn. Èyí ni àyẹ̀wò tí ó ṣe pàtàkì, òun sì ni èyí tí àwọn ènìyàn máa ń fò dá.

| Ohun tí o rí | Kí ni ó túmọ̀ sí |
|---|---|
| Àwọn ìbéèrè ètò kọ̀ǹpútà àti uptime yọrí sí rere | Pẹpẹ náà le ka àwọn détà àpèjúwe SNMP ti ìpìlẹ̀. Èyí kò tíì fìdí kíkó détà ojú-ìbánisọ̀rọ̀ jọ múlẹ̀ |
| Ibi tàbí Olùbásọ̀rọ̀ kò ní nǹkan nínú | Àwọn pápá détà àpèjúwe àṣàyàn wọ̀nyí le má ní àkọsílẹ̀; jíjẹ́ òfo nìkan kì í ṣe ìkùnà kíkó détà jọ |
| SNMP kò wà ní lílò | Kò sí àkójọpọ̀ tàbí orúkọ olùlo lórí ẹ̀rọ náà, tàbí a tò ẹ̀yà náà sí none |
| Àṣìṣe àkókò ìbánisọ̀rọ̀ SNMP | Ìṣètò àkókò ìbánisọ̀rọ̀ kùnà; ṣàyẹ̀wò àṣìṣe tí a fi hàn, ẹ̀rí ìdánimọ̀, ìlànà àti àwọn ètò ìsopọ̀ |
| Àṣìṣe ètò SNMP | Kíkà `sysDescr` kùnà; ṣàyẹ̀wò àṣìṣe tí a da padà, ìwòye aṣojú, ẹ̀rí ìdánimọ̀ àti wíwà ní àrọ́wọ́tó |
| Àṣìṣe olùgbàlejò SNMP | Kò sí àlàyé tàbí uptime tí ó padà wá |
| A fi uptime hàn bí `U` | A kò le ka uptime. Àwọn ẹ̀rọ kan kì í ròyìn rẹ̀ ní ti gidi |

Bí ọ̀nà wíwà ní àrọ́wọ́tó bá ní ping nínú, àbájáde ping ọ̀tọ̀ yóò hàn ní ìsàlẹ̀. Ka àwọn méjèèjì. Ẹ̀rọ kan le yege nínú ọ̀kan kí ó sì kùnà nínú èkejì, èyí tí ó bá kùnà yóò sọ ibi tí o yẹ kí o wò fún ọ.

Àlàyé ètò tí kò ní nǹkan nínú kò fi hàn pé kíkó détà jọ ti kùnà. Kóòdù náà ń gba àwọn aṣojú tí kò ní àlàyé pẹ̀lú uptime tí ó ṣeé lò láàyè. Àwọn ẹ̀rọ tí a pa ń fò àyẹ̀wò wíwà ní àrọ́wọ́tó dá, àti pé àwọn ọ̀nà tí kì í ṣe ti SNMP kì í fi pẹpẹ SNMP yìí hàn. Fìdí ainihin ìbéèrè àti poller cache múlẹ̀ lẹ́yìn èyí.

## Ṣẹ̀dá àwọn orísun détà àti àwòrán ìṣirò

Fún ẹ̀rọ tuntun tí kò ní àwọn àwòrán ìṣirò tí a ṣẹ̀dá láìfọwọ́ṣe, ìgbésẹ̀ tí ó kàn ni láti ṣẹ̀dá àwòrán ìṣirò àti orísun détà rẹ̀. Ṣàyẹ̀wò **Àtòjọ Orísun Détà** àti **Wo Poller Cache** lórí ojú-ewé ẹ̀rọ náà dípò ríro pé wọn kò ní nǹkan nínú.

Láti ojú-ewé ẹ̀rọ náà, yan **Ṣẹ̀dá Àwọn Àwòrán Ìṣirò fún Ẹ̀rọ Yìí**. Fún switch èyí túmọ̀ sí ṣíṣe ìbéèrè détà ojú-ìbánisọ̀rọ̀, yíyan àwọn ojú-ìbánisọ̀rọ̀ tí o bìkítà nípa wọn, àti yíyan irú àwòrán ìṣirò fún wọn. Yan ojú-ìbánisọ̀rọ̀ méjì tàbí mẹ́ta, kì í ṣe gbogbo mẹ́rìnlélógójì náà. O ń fi hàn pé ọ̀nà náà ń ṣiṣẹ́, àwọn díẹ̀ àkọ́kọ́ sì rọrùn púpọ̀ láti kà ní ìgbésẹ̀ tí ó kàn.

Àwòrán ìṣirò tí a tò sori atọ́ka ń so àwọn orísun détà pọ̀ mọ́ ojú-ìbánisọ̀rọ̀ tí a yàn ó sì ń pèsè àwọn àkọsílẹ̀ poller-cache wọn; a le tún àwọn orísun tí ó wà tẹ́lẹ̀ tí ó bá a mu lò. Ìdáhùn sí ṣíṣẹ̀dá àwòrán ìṣirò kì í ṣe ẹ̀rí pé ìwádìí détà ń lọ lọ́wọ́. Rí i dájú pé cache náà ní ẹ̀rọ tí a ń retí, àwọn OID ojú-ìbánisọ̀rọ̀ àti ojú ọ̀nà RRD.

## Rí i dájú pé ó ń gba détà

Dúró de àwọn àkókò kíkó détà jọ tí a ti ṣètò, lẹ́yìn náà ṣàyẹ̀wò àwọn àkókò tí a fọwọ́ sí (timestamps) àti àwọn iye náà. Àwòrán ìṣirò tí kò ní nǹkan nínú le túmọ̀ sí ìtòlẹ́sẹẹsẹ ìbẹ̀rẹ̀, iye tí a kò mọ̀ tàbí kíkó détà jọ tí ó kùnà. Kíkà counter lẹ́ẹ̀mejì ṣe pàtàkì láti ṣírò ìwọ̀n sísàn détà, ṣùgbọ́n ṣíṣiṣẹ́ poller lẹ́ẹ̀mejì kò ṣe ìgpìnlẹ̀ àkójọpọ̀ tí ó péye tí ó sì wúlò.

Ṣàyẹ̀wò àwọn nǹkan mẹ́ta, ní ìtòlẹ́sẹẹsẹ yìí.

**Poller náà ṣiṣẹ́.** Wá àkópọ̀ ìparí iṣẹ́ nínú àkọsílẹ̀ ìṣẹ̀lẹ̀ tí a tò. Bí kò bá sí níbẹ̀, ṣàyẹ̀wò ètò àkókò, ibi tí àkọsílẹ̀ ń lọ àti àwọn àṣẹ, àti bóyá poller náà jáde kí ó tó parí. Wo [Fífi ìṣẹ̀lẹ̀ sílẹ̀](/yo/reference/logging/).

**Fáìlì náà wà ó sì jẹ́ ti láìpẹ́ yìí.** Da ojú ọ̀nà RRD gidi kọ láti inú orísun détà tàbí poller cache; má ṣe sọ àsọtẹ́lẹ̀ rẹ̀ láti orúkọ olùgbàlejò. A le yí àwọn ojú ọ̀nà àti orúkọ padà. Wo [Ètò àkójọ fáìlì](/yo/reference/file-layout/). Béèrè lọ́wọ́ RRDtool ìgbà tí a kọ sínú fáìlì náà kẹ́yìn:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Àkókò tí a kọ sí i gbọ́dọ̀ tẹ̀síwájú lórí àwọn kíkọ tí ó yọrí sí rere. Àkókò ti láìpẹ́ le tún wà pẹ̀lú iye tí a kò mọ̀, àti pé kíkọ tí a kó pamọ́ le dádúró fún àkókò tí ó wà lórí disk. Fún `rrdcached` tàbí Boost, ṣàyẹ̀wò ipò fífo nǹkan kúrò ti ẹ̀yà náà pẹ̀lú.

**Iye náà kì í ṣe èyí tí a kò mọ̀.** `lastupdate` ń fi àwọn iye tí a pèsè láìpẹ́ jù hàn; fún counter àwọn wọ̀nyí jẹ́ iye counter, kì í ṣe ìṣirò sísàn détà. Ṣàyẹ̀wò àwọn ìlà tí ó parí láti `fetch` fún àwọn ìṣirò tí ó ní òpin. Àkókò ìbẹ̀rẹ̀, títò ìgbésẹ̀, heartbeat, àwọn ààlà àti ìpele détà tí a kò mọ̀ ti àkójọpọ̀ gbogbo wọn ń ní ipa lórí ìgbà tí ìlà tí ó wúlò yóò fi hàn. Má ṣe ṣe ìdájọ́ àbùkù láti ara àwọn ìlà méjì àkọ́kọ́ nìkan. Bí àwọn iye tí a kò mọ̀ bá tẹ̀síwájú, ṣàyẹ̀wò àwọn iye tí a kó jọ, irú orísun détà, heartbeat àti àwọn àṣìṣe poller.

## Àwọn ìkùnà àkọ́kọ́ tí ó wọ́pọ̀

| Àmì àrùn | Ìdí tí ó sábà ń fà á |
|---|---|
| Ó ń fi pamọ́, ṣùgbọ́n wíwá àlàyé ètò ń ròyìn àṣìṣe kan | Ṣàyẹ̀wò àwọn ẹ̀rí ìdánimọ̀, ìwòye aṣojú àti wíwà ní àrọ́wọ́tó olùkójọ; àlàyé tí kò ní nǹkan nìkan kò tó ẹ̀rí |
| Àṣìṣe àkókò ìbánisọ̀rọ̀ SNMP láti Kadupul, `snmpget` ń ṣiṣẹ́ láti kọ̀ǹpútà rẹ | Ojú ọ̀nà firewall yàtọ̀, tàbí aṣojú náà dín àdírẹ́sì orísun kù |
| Ẹ̀rọ ń fi hàn pé ó wà ní ìsàlẹ̀, ṣùgbọ́n détà SNMP ń dé | A tò wíwà ní àrọ́wọ́tó sí ICMP ping, èyí tí kò le ṣí raw socket |
| Àlàyé ń hàn, kò sí détà | A kò ṣètò poller, tàbí ó ń ṣiṣẹ́ bí olùlo tí kò le kọ sínú àkójọ RRD |
| Ìbéèrè détà kò dá ojú-ìbánisọ̀rọ̀ kankan padà | Ìwòye aṣojú yọ tábìlì ojú-ìbánisọ̀rọ̀ kúrò, tàbí ẹ̀rọ náà nílò àtúnṣe atọ́ka |
| Iye àkọ́kọ́ kò ṣeé mọ̀, lẹ́yìn náà ó dára | Ó wọ́pọ̀ fún counter. Ó nílò kíkà méjì láti mú ìṣirò jáde |
| Àwọn iye tí a kò mọ̀ ń tẹ̀síwájú | Kíkó détà jọ tí ó kùnà, àwọn iye tí kò tọ́, àìbáramu irú/ààlà, heartbeat tàbí ìtòlẹ́sẹẹsẹ àkójọpọ̀ |
| Détà wà fún ìgbà díẹ̀, lẹ́yìn náà àlàfo wà | Poller ń gba àkókò púpọ̀ ju àkókò tí a fún un, tàbí ẹ̀rọ náà ń dín ìwọ̀n SNMP kù |
| Àwọn ìṣirò counter kò lẹ́sẹ̀ nílẹ̀ | Yíyípo 32-bit lẹ́ẹ̀mẹta, àtúntò counter, àwọn ìwọ̀n tàbí àwọn ètò orísun détà; lo àwọn counter 64-bit tí a tì lẹ́yìn lórí àwọn ìsopọ̀ tó yára |
| Àwọn ojú-ìbánisọ̀rọ̀ ń ya àwòrán àwọn port tí kò tọ́ lẹ́yìn àtúnbẹ̀rẹ̀ | Àwọn atọ́ka ti yípadà. Ìbéèrè détà nílò ọ̀nà àtúnṣe atọ́ka tí yóò ṣàkíyèsí rẹ̀ |

Èyí tí ó kẹ́yìn yìí yẹ kí a gbọ́ye rẹ̀ kí o tó ní switches ọgọ́rùn-ún: àwọn atọ́ka ojú-ìbánisọ̀rọ̀ SNMP kò ní ìdánilójú pé wọn yóò dúró sori kókó kan náà lẹ́yìn àtúnbẹ̀rẹ̀ tàbí ìyípadà module. Ọ̀nà àtúnṣe atọ́ka lórí ìbéèrè détà ni ohun tí ó ń jẹ́ kí àwòrán ìṣirò tọ́ka sí port gidi kan náà. [Àwọn ìbéèrè détà àti àwọn atọ́ka](/yo/concepts/data-queries-and-indexes/) ṣàlàyé àwọn àṣàyàn náà.

Nígbà tí o bá ní ẹ̀rọ kan tí ó ń gba détà ní kedere, fi àwọn tókù kún un ní àpapọ̀ dípò ọ̀kọ̀ọ̀kan. [Ṣàwárí àwọn ẹ̀rọ láìfọwọ́ṣe](/yo/guides/discover-devices-automatically/) àti àwọn irinṣẹ́ ìlà àṣẹ nínú [Àwọn irinṣẹ́ ìlà àṣẹ](/yo/reference/command-line-tools/) méjèèjì dára ju títún ojú-ewé yìí ṣe nígbà àádọ́ta.

Èyí tí ó tẹ̀lé e: [Ka àwòrán ìṣirò àkọ́kọ́](/yo/start/first-graph/).
