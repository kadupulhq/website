---
title: "Ka àwòrán ìṣirò àkọ́kọ́"
description: "Kí ni àwọn ìlà náà túmọ̀ sí gan-an, àti àwọn àṣìṣe mẹ́ta tí ó máa ń mú kí àwọn ènìyàn kà wọ́n ní àṣìkà."
sidebar:
  order: 4
banner:
  content: "Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa."
---

Àwòrán ìṣirò níbí kì í ṣe àwòrán détà rẹ ní ti gidi. Àwòrán àkópọ̀ détà rẹ ni, mímọ irú àkópọ̀ tí ó ṣe pàtàkì sì ṣe kókó.

## Ohun tí o ń wò

A máa ń ya gbogbo àwòrán ìṣirò láti inú àkójọpọ̀ round-robin (round-robin archive). Àkójọpọ̀ náà ń tọ́jú àwọn àpẹẹrẹ ti láìpẹ́ ní ẹ̀kúnrẹ́rẹ́ àti àwọn àpẹẹrẹ àtijọ́ tí a kó pọ̀ sí àwọn apere tí ó fẹ̀ jù. Nígbà tí o bá sún un sẹ́yìn (zoom out) sí ọdún kan, o kò ní rí gbogbo àpẹẹrẹ ti ìṣẹ́jú márùn-ún kọ̀ọ̀kan. O ń rí iye kan fún apere kọ̀ọ̀kan, èyí tí a yàn nípasẹ̀ iṣẹ́-ìṣirò ìkópọ̀ (consolidation function).

Iṣẹ́-ìṣirò náà sábà máa ń jẹ́ ìpíndọ́gba (average). Ó tún le jẹ́ èyí tí ó ga jùlọ (maximum) tàbí èyí tí ó kéré jùlọ (minimum). Èyí ṣe pàtàkì ju ohunkóhun míràn lórí ojú-ewé yìí lọ.

Fún ìbéèrè àwòrán ìṣirò lásán nígbà tí a bá fẹ́, Kadupul ń ṣàkójọ àṣẹ RRDtool láti inú ìṣètò àwòrán ìṣirò náà ó sì ń darí rẹ̀ sí àwọn fáìlì tí ó wà lórí disk. Oríṣi ìlà mẹ́ta ni ó wà nínú àṣẹ yẹn, ó sì dára láti mọ ọ̀kọ̀ọ̀kan wọn.

| Apá | Ohun tí ó ń ṣe |
|---|---|
| Ìtumọ̀ | Ń sọ orúkọ fáìlì kan, orísun détà nínú rẹ̀, àti iṣẹ́-ìṣirò ìkópọ̀ |
| Ohun èlò yíyà | Ń sọ oríṣi kan di ìlà, agbègbè, tàbí ọ̀já nínú àkójọpọ̀ |
| Ohun èlò àkọsílẹ̀ (legend) | Ń tẹ nọ́mbà kan jáde, tí a ṣírò lórí ojú fèrèsé tí o ń wò |

A ṣàlàyé gbogbo ètò náà nínú [Bí a ṣe ń ya àwọn àwòrán ìṣirò](/yo/concepts/how-graphs-are-drawn/). O kò nílò rẹ̀ lónìí. Ohun tí o nílò láti mọ̀ ni pé ìtumọ̀ àwòrán ìṣirò àti àkókò tí a béèrè fún ni ó ń pinnu àwòrán náà. Àwọn ojú ọ̀nà caching àti àwòrán ìṣirò ti àsìkò gidi le hùwà ní ọ̀nà tí ó yàtọ̀.

## Bẹ̀rẹ̀ pẹ̀lú wákàtí mẹ́rin sẹ́yìn

Bẹ̀rẹ̀ pẹ̀lú fèrèsé kúkúrú ti láìpẹ́. Àkójọpọ̀ tí a yàn sinmi lórí ìpamọ́, ìgbésẹ̀ àti ìwọ̀n àwòrán ìṣirò; wákàtí mẹ́rin kò ṣe ìdánilójú détà tí a kò tíì fọwọ́ kàn tàbí tí a kò tíì kó pọ̀. Kódà àkójọpọ̀ tí ó dára jùlọ ní àwọn iye tí a ti ṣètò nípa àkókò nínú. Lo àṣẹ àtúnṣe àṣìṣe àwòrán ìṣirò àti `rrdtool info` láti ṣàyẹ̀wò iṣẹ́-ìṣirò tí a béèrè àti àwọn ìgbésẹ̀ àkójọpọ̀ tí ó wà kí o tó ṣe àfiwé àwọn iye.

Àwọn àbùdá méjì ti àwòrán ìṣirò tuntun jẹ́ ohun tí ó wọ́pọ̀ ṣùgbọ́n wọ́n máa ń ba àwọn ènìyàn lẹ́rù.

**Ìlà náà le parí kí ó tó dé báyìí.** Apere ti ìsinsìnyí le má tíì pé. Àkókò kíkó détà jọ, ìkójọpọ̀ pamọ́ fún ìgbà díẹ̀ (buffering) àti ìṣètò détà le tún dádúró fún ojúkò ìparí tí a ń rí. Ṣàyẹ̀wò àwọn àkókò ìtúnṣe tí ń tẹ̀síwájú dípò kí o wo dídádúró kan gẹ́gẹ́ bí ẹ̀rí àlàáfíà ètò.

**Apá àkọ́kọ́ le má sí níbẹ̀.** Orísun détà tí a ṣẹ̀dá ní wákàtí kan sẹ́yìn ní détà ti wákàtí kan àti oṣù mọ́kànlá tí kò ní nǹkan nínú. A ń pín àkójọpọ̀ náà ní ẹ̀kúnrẹ́rẹ́ nígbà ìṣẹ̀dá, nítorí náà apá tí kò ní nǹkan nínú jẹ́ ibi ìpamọ́ gidi tí ń dúró de lílò.

## Lẹ́yìn náà sọ ọ́ di fífẹ̀, kí o sì wo bí tente ṣe ń yípadà

Sọ àsìkò náà di fífẹ̀ sí ọ̀sẹ̀ kan. Àwọn tente (peaks) le dínkù nígbà tí àwòrán ìṣirò bá yan àwọn ìpíndọ́gba tí ó fẹ̀ jù. Fún àpẹẹrẹ, bí lílo bá jẹ́ 100% fún ìṣẹ́jú márùn-ún tí ó sì jẹ́ odo fún ìṣẹ́jú 55 tókù, ìpíndọ́gba wákàtí náà jẹ́ nǹkan bí 8.3%. Ìbẹ́pá ìṣẹ́jú mẹ́rin nínú wákàtí tí a kò ti lo nǹkan ń fún wa ní ìpíndọ́gba bí 6.7%. Àwọn tente kúkúrú le ti dọ́gba tẹ́lẹ̀ láàárín àkókò àpẹẹrẹ àkọ́kọ́.

Ìkópọ̀ ń pa àwọn ẹ̀kúnrẹ́rẹ́ àlàyé rẹ́. Bí ìtàn tí ó kún fún ẹ̀kúnrẹ́rẹ́ bá ti parí, sísún un súnmọ́ (zooming back in) kò le tún un kọ́ láti inú àkójọpọ̀ ìpíndọ́gba.

Èyí ni àkọ́kọ́ nínú àwọn àṣìṣe mẹ́ta náà, òun sì ni èyí tí ó máa ń fa àríyànjiyàn jùlọ.

**Kíka ìpíndọ́gba bí tente.** Bí o bá bìkítà nípa cíkún (saturation), wo àwòrán ìṣirò tí a kọ́ lórí èyí tí ó ga jùlọ, kì í ṣe lórí ìpíndọ́gba. Èyí ń ṣiṣẹ́ nìkan bí àwọn àkójọpọ̀ bá ní àwọn tente nínú. Bí àwọn ìpíndọ́gba nìkan bá kù, a kò le tún àwọn tente àkọ́kọ́ kọ́. Àkójọpọ̀ MAX ń tọ́jú àwọn tente ti àwọn kókó tí a ṣètò nípa àkókò, kì í ṣe tente àìròtẹ́lẹ̀ ti kánmọ́kánmọ́ tí a kò rí láàárín àwọn ìwádìí.

Àbùkù kan wà níbí tí ó yẹ kí a mọ̀. Bí ohun èlò àwòrán ìṣirò bá béèrè fún tente tí fáìlì náà kò sì ní wọn, olùrànlọ́wọ́ àṣàyàn ti Kadupul le padà sí iṣẹ́-ìṣirò àkọ́kọ́ tí ó wà, tàbí AVERAGE nígbà tí kò bá le pinnu àwọn iṣẹ́-ìṣirò tí ó wà. Àwòrán náà jọ èyí tí ó dára, ṣùgbọ́n ó ń dáhùn ìbéèrè míràn.

**Kíka àlàfo bí odo.** Àlàfo ń ṣojú fún iye àwòrán tí a kò mọ̀. Àwọn ìdí ni àwọn ìtúnṣe tí kò dé, détà tí a kò mọ̀ kedere, àwọn iye tí a kọ̀ àti àwọn ìṣirò àwòrán. Kò fi ẹ̀rọ tí kò sí ní àrọ́wọ́tó hàn ní pàtó.

Heartbeat jẹ́ àkókò tí ó pọ̀ jùlọ tí a gba láàyè láàárín àwọn ìtúnṣe, kì í ṣe àkókò àfikún tí a fi kún ìgbésẹ̀. Fún àpẹẹrẹ, ìgbésẹ̀ ti ìṣẹ́jú-àáyá 300 pẹ̀lú heartbeat ti ìṣẹ́jú-àáyá 600 ń gba ìṣẹ́jú-àáyá 600 láàyè jùlọ láàárín àwọn ìtúnṣe, kì í ṣe 900. Àwọn ìpele détà tí a kò mọ̀ ti àkójọpọ̀ náà tún ń ní ipa lórí àwọn àlàfo tí a ń rí. Wo [Àwọn ìtumọ̀ orísun détà ti RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) àti [Àkókò àti àwọn àkókò ìdánuduro](/yo/concepts/time-and-intervals/).

Ṣọ́ra fún stacked graphs níbí. Àwọn àwòṣe kan máa ń fi odo rọ́pò àwọn iye tí a kò mọ̀ nínú àwọn ìṣirò àwòrán wọn. Lórí àwọn àwòrán wọ̀nyẹn, ìsánilọ́wọ́dúró àti àkókò àìṣiṣẹ́ máa ń jọ ara wọn nípasẹ̀ ìpinnu ètò. Ṣàyẹ̀wò ìwòye tí kò ní ìkópọ̀ sí orí ara wọn kí o tó parí èrò sí pé iṣẹ́ kan ti dákẹ́.

**Ṣíṣe àfiwé àwọn àwòrán ìṣirò méjì pẹ̀lú àwọn ìwọ̀n ìbú tí ó yàtọ̀.** Àwọn àwòrán ìṣirò méjì tí ó wà lẹ́gbẹ̀ẹ́ ara wọn yóò wọn détà tí ó jẹ́ ti ara wọn nìkan. Ìkùkù kékeré àti èyí tí ó tóbi le jọ ara wọn gan-an. Ṣàyẹ̀wò ìlà ìwọ̀n (axis) kí o tó parí èrò sí ohunkóhun.

Bí o ti ń wo ìlà ìwọ̀n náà, ṣàyẹ̀wò ìpìlẹ̀ rẹ̀. Àwòrán ìṣirò le kọ orúkọ ní ẹgbẹẹgbẹ̀rún tàbí ní àwọn ìwọ̀n ti 1024. Àwọn nọ́mbà tí a tọ́jú jẹ́ bákan náà; àwọn orúkọ nìkan ni ó ń yípadà. Ìyàtọ̀ náà sinmi lórí prefix: 1024 sí 1000 jẹ́ 2.4% fún agbára kan ó sì ń pọ̀ sí i ní àwọn prefix tí ó tóbi. Tún ṣàyẹ̀wò bits sí bytes, àwọn ìṣirò àwòrán àti ìkópọ̀; ìyàtọ̀ nínú ìpín nìkan kò le sọ ìdí rẹ̀.

## Kíka àkọsílẹ̀ àwòrán (legend)

Àkọsílẹ̀ àwòrán náà gbé àwọn nọ́mbà tí ó ṣe pàtàkì ju bí àwòrán náà ṣe rí lọ. "Current" sábà máa ń jẹ́ ìdínkù LAST ti oríṣi tí a yàn, èyí tí kò pọn dandan láti jẹ́ ìwọ̀n tí a mú ní kánmọ́kánmọ́ tí o ń wo àwòrán náà. A ń ṣírò ìpíndọ́gba àti tente kọjá ojú fèrèsé tí o ń wò, kì í ṣe kọjá gbogbo àkókò, nítorí náà wọ́n ń yípadà bí o ṣe ń sún un súnmọ́ tàbí sẹ́yìn.

Àwọn àkọsílẹ̀ tí a pèsè ni èyí tí ó kéré jù, èyí tí ó ga jù, ìpíndọ́gba, àti ti ìkẹyìn, èyí tí a pe orúkọ rẹ̀ ní current. Àwọn nǹkan méjì nípa wọn máa ń ya àwọn ènìyàn lẹ́nu.

**Nọ́mbà àkọsílẹ̀ jẹ́ ìdínkù ohun tí a yà, kì í ṣe ohun tí a tọ́jú.** Tente tí a tẹ̀ jáde lórí oríṣi tí a kà pẹ̀lú àwọn ìpíndọ́gba jẹ́ tente ti àwọn ìpíndọ́gba tí a mú wá ní ìwọ̀n tí a yàn. Kì í ṣe àpẹẹrẹ tí ó tóbi jùlọ tí a mú rí. Lórí ìsopọ̀ tí ó ní iṣẹ́ púpọ̀, àwọn wọ̀nyí jẹ́ nọ́mbà tí ó yàtọ̀ púpọ̀, àti pé àwọn méjèèjì jẹ́ ìdáhùn tí ó tọ́ sí àwọn ìbéèrè tí ó yàtọ̀.

**Ṣàyẹ̀wò oríṣi tí àkọsílẹ̀ ń lò.** Àwọn àkọsílẹ̀ GPRINT lásán le gba oríṣi ti ohun tí a yà tẹ́lẹ̀; àwọn ohun èlò tí a yà sọ́tọ̀ fún èyí tí ó kéré jù, tente, ìpíndọ́gba àti ti ìkẹyìn ní ìtọ́jú ọ̀tọ̀. Títún àwọn ohun èlò tò nínú àwòṣe àwòrán ìṣirò le yí ohun tí àkọsílẹ̀ ń ròyìn padà láìsí ẹnikẹ́ni tí ó tún àkọsílẹ̀ náà ṣe. Bí nọ́mbà kan bá yípadà lẹ́yìn àtúnṣe àwòṣe tí kò ní ìbátan, kọ́kọ́ ṣàyẹ̀wò ìtòlẹ́sẹẹsẹ àwọn ohun èlò náà.

## Nígbà tí àwòrán ìṣirò bá dà bí ẹni pé kò tọ́

Ṣàyẹ̀wò ojú ọ̀nà kíkó détà jọ ní ìtòlẹ́sẹẹsẹ yìí; ó ju ìpele kan lọ tí ó le ní àbùkù.

1. Ṣé ẹ̀rọ náà ń dáhùn lọ́wọ́lọ́wọ́ báyìí?
2. Ṣé poller náà ń ṣiṣẹ́, tí ó sì ń parí láàárín àkókò rẹ̀?
3. Ṣé fáìlì RRD náà ní àkókò ìtúnṣe ti láìpẹ́?
4. Ṣé àwòrán ìṣirò náà ń ka orísun détà tí o rò pé ó ń kà?

Ní kedere:

**Ìgbésẹ̀ 1.** Darí `snmpget` kan náà tí o darí nígbà tí o fi ẹ̀rọ kún un, láti inú olùkójọ détà tí a yàn. Bí ó bá kùnà, yanjú ìkùnà kíkó détà jọ yẹn kí o tó ṣe ìdájọ́ àwòrán ìṣirò.

**Ìgbésẹ̀ 2.** Wá àkópọ̀ ìparí iṣẹ́. Bí kò bá sí níbẹ̀, ṣàyẹ̀wò ètò àkókò, ibi tí àkọsílẹ̀ ń lọ tí a tò àti àwọn ìkùnà poller ní ìbẹ̀rẹ̀. Iṣẹ́ tí ó gba àkókò ju àsìkò tí a fún un le dádúró fún àwọn ìtúnṣe; ṣe àfiwé àlàfo ìtúnṣe tí ó jáde pẹ̀lú heartbeat.

**Ìgbésẹ̀ 3.** Béèrè lọ́wọ́ RRDtool tààràtà:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` ń ròyìn àkókò ìtúnṣe tí ó kẹ́yìn, títí kan àwọn ìtúnṣe pẹ̀lú àwọn iye tí a kò mọ̀; kíkọ tí a kó pamọ́ le dádúró fún un. Lo `lastupdate` àti `fetch` láti ṣàyẹ̀wò àwọn iye bí a ti ṣàlàyé nínú ìtọ́sọ́nà ẹ̀rọ. `info` ń sọ ìgbésẹ̀, heartbeat, irú orísun détà, àti àwọn àkójọpọ̀ tí ó wà fún ọ. Bí fáìlì náà kò bá ní àkójọpọ̀ ti tente, èyí ti yanjú ìbéèrè tente lókè yẹn.

**Ìgbésẹ̀ 4.** Tan ipò àtúnṣe àṣìṣe àwòrán ìṣirò kí o sì ka àṣẹ tí àwòrán ìṣirò ń mú jáde. Ó ń sọ orúkọ àwọn fáìlì, àwọn orísun détà nínú wọn, àti iṣẹ́-ìṣirò ìkópọ̀ fún ọ̀kọ̀ọ̀kan. Àwòrán ìṣirò tí ń tọ́ka sí orísun détà tí ó yàtọ̀ sí èyí tí o rò wọ́pọ̀ lẹ́yìn tí a bá ti tún fi àwọn àwòṣe sí iṣẹ́ tàbí tí a tún atọ́ka ojú-ìbánisọ̀rọ̀ ṣe.

## Àwọn àmì àrùn àti ohun tí wọ́n sábà ń túmọ̀ sí

| Ohun tí o rí | Lọ́pọ̀ ìgbà |
|---|---|
| Ìlà tí ó tẹ́jú lórí odo | Ó le jẹ́ odo gidi tàbí ìṣirò tí ń fi odo rọ́pò èyí tí a kò mọ̀ |
| Ìlà dúró, lẹ́yìn náà ó bẹ̀rẹ̀ sí ní lọ | Iye tí a kò mọ̀ dá oríṣi tí a yà lẹ́nu kọjú; ṣàyẹ̀wò kíkó détà jọ àti àwọn ìṣirò àwòrán |
| Àwọn àlàfo kéékèèké jákèjádò | Poller ń parí pípẹ́, tàbí heartbeat tí a tò súnmọ́ ìgbésẹ̀ jù |
| Tente hàn ní wákàtí mẹ́rin, kò sí ní ọ̀sẹ̀ kan | Ṣàyẹ̀wò ìwọ̀n àkójọpọ̀ àti ìkópọ̀ kí o tó rò pé détà sọnù tàbí pé kíkó détà jọ ní àbùkù |
| Tente àkọsílẹ̀ kéré ju tente tí a yà lọ | Àkọsílẹ̀ ń dín oríṣi míràn kù tí ó yàtọ̀ sí èyí tí o rò |
| Gbogbo àwòrán ìṣirò kò ní nǹkan nínú, kò sí àṣìṣe | Kò sí orísun détà lẹ́yìn rẹ̀, tàbí a kò tíì kó ohunkóhun jọ |
| Àwọn iye yàtọ̀ ní ọ̀nà tí ó ga rékọjá | Irú orísun détà tí kò tọ́, tàbí àwọn counter 32-bit tí ń yípo |
| Àwọn àwòrán ìṣirò méjì ti ìsopọ̀ kan yàtọ̀ díẹ̀ | Ìpìlẹ̀ ìlà ìwọ̀n tí ó yàtọ̀, tàbí ìkópọ̀ tí ó yàtọ̀ |

[Ṣe àtúnṣe détà tí ó sọnù](/yo/guides/troubleshoot-missing-data/) ń tẹ̀lé ojú ọ̀nà kan náà ní ẹ̀kúnrẹ́rẹ́. [Ṣe àtúnṣe ìrísí àwòrán ìṣirò](/yo/guides/tune-graph-appearance/) ń sọ̀rọ̀ nípa yíyí bí àwòrán ìṣirò ṣe rí padà nígbà tí o bá ti gbẹ́kẹ̀lé ohun tí ó ń sọ.

Ìkẹ́kọ̀ọ́ náà nìyẹn. O ní àgbékalẹ̀ kan, ẹ̀rọ kan tí ń dáhùn, àti àwòrán ìṣirò kan tí o le kà. Láti ibí yìí, [Àwọn ìtọ́sọ́nà lílo](/yo/guides/monitor-a-switch/) ń bójútó àwọn iṣẹ́ pàtó, àti pé [Àwọn èrò ìpìlẹ̀](/yo/concepts/architecture/) ń ṣàlàyé ìdí tí ètò náà fi ń hùwà ní ọ̀nà tí ó ń gbà ṣe é.
