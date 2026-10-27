---
title: Àwọn orísun data àti àwọn àpamọ́ yípo (RRAs)
description: Ohun tí a ń tọ́jú, bí ìtọ́jú ṣe ń ṣiṣẹ́, àti ìdí tí àtúnṣe profaili kò fi ní gbé àwọn fáìlì RRD tó wà tẹ́lẹ̀ kúrò.
sidebar:
  order: 2
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
---

Orísun data Kadupul kan ń ṣàkójọ àwọn ìwọ̀n ní àkókò gbogbo, ó sì sábà máa ń bá fáìlì RRD kan mu. Pápá kọ̀ọ̀kan tí a sọ ní orúkọ nínú fáìlì yẹn ni RRDtool tún ń pè ní orísun data (DS). Ya ohun èlò ìṣàfilọ́lẹ̀ sọ́tọ̀ kúrò nínú àwọn pápá rẹ̀ nígbà tí o bá ń fi àwọn iye tàbí àwọn ètò wéra.

Fáìlì kan kì í ṣe nọ́mbà kan nígbà gbogbo. Orísun data kan lè gbé ọ̀pọ̀lọpọ̀ pápá, àti pé interface ni àpẹẹrẹ tó wọ́pọ̀: àwọn bytes tí ń wọlé àti àwọn bytes tí ń jáde ń pín fáìlì kan náà, a ń gbà wọ́n bí àwọn iṣẹ́ ọ̀tọ̀ọ̀tọ̀, a sì ń kọ wọ́n papọ̀ gẹ́gẹ́ bí ìsọdọ̀tun kan ṣoṣo. Ohun tí wọ́n pín ni ìgbésẹ̀ (step) kan, àkójọ àwọn àpamọ́, àti àkókò ìpamọ́. O kò lè tọ́jú ọ̀kan nínú wọn pẹ́ ju èkejì lọ, nítorí pé ìpamọ́ jẹ́ ohun-ìní ti fáìlì kì í ṣe ti pápá.

## Ohun tí ó wà nínú fáìlì náà

Fáìlì RRD kan jẹ́ àkọlé (header) àti àkójọ méjì.

Àkójọ àkọ́kọ́ ni àwọn pápá: orúkọ kan, irúfẹ́ kan, ìlù-ọkàn (heartbeat) kan, àti ìwọ̀n kéré jùlọ àti títóbi jùlọ fún kọ̀ọ̀kan. Èkejì ni àwọn àpamọ́: iṣẹ́ ìdapọ̀ (consolidation function), iye àwọn ìgbésẹ̀ data aise tí ń wọ inú ààyè kan, iye àwọn ààyè tí ó wà, àti iye ààyè tí ó lè jẹ́ unknown kí ààyè náà fúnra rẹ̀ tó di unknown.

Ìṣẹ̀dá ń kọ àwọn ìtumọ̀ wọ̀nyí sínú fáìlì náà. Àwọn data àfikún ti ibi-ìpamọ́ data àti àwọn ìtumọ̀ fáìlì gidi lè yàtọ̀ lẹ́yìn náà; yẹ fáìlì náà wò pẹ̀lú `rrdtool info` dípò tí wàá fi rò pé àkọsílẹ̀ àwòṣe ìsinsìnyí ṣe àpèjúwe rẹ̀ ní pípé.

<span id="the-decisions-that-are-permanent"></span>

## Àwọn ìpinnu ìṣẹ̀dá àti ìtọ́jú lẹ́yìn náà

A ń pèsè fáìlì RRD nígbà ìṣẹ̀dá. Àwọn àtúnṣe profaili kì í gbé àwọn fáìlì tó wà tẹ́lẹ̀ kúrò. RRDtool ń pèsè àwọn iṣẹ́ ìṣètò àti ìyípadà ìwọ̀n tí ó lè tọ́jú data tí a kójọ, ṣùgbọ́n wọ́n nílò ìfọwọ́sí ọ̀tọ̀ àti àwọn ẹ̀dà ìpamọ́. Ọ̀nà ìṣẹ̀dá déédéé ń ṣàyẹ̀wò fún fáìlì tó wà tẹ́lẹ̀ ó sì ń padà láìsí ríropo rẹ̀. Ààbò yẹn kò dènà ìṣètò tàbí ìṣíkiri tí a fọwọ́ kọ. Gbígbà àwòṣe là nìkan kò ní sọ ìṣètò àwọn fáìlì tó wà tẹ́lẹ̀ di tuntun.

Àwọn àṣàyàn mẹ́rin ni a ń kọ sílẹ̀ ní àkókò yẹn.

**Ìgbésẹ̀ (The step).** Bí a ṣe ń retí iye kan déédéé tó, ní gbogbogbòò àwọn àáyá 300. RRDtool ń ṣe déédéé àwọn ìsọdọ̀tun sí àwọn ààlà ìgbésẹ̀; a kì í kàn sọ àwọn kíkà tó pọ̀ sí i nù lásán. Bóyá àwọn ìsọdọ̀tun tí ó lọra ń gbé data unknown jáde sinmi lórí ìlù-ọkàn àti àwọn òfin ìdapọ̀. Ìgbésẹ̀ náà sábà máa ń wá láti profaili orísun data. Ìṣẹ̀dá fáìlì ń ka ìgbésẹ̀ tí a tọ́jú ti orísun data àti àwọn àpamọ́ profaili tí a tọ́ka sí, nítorí náà fọwọ́ sí méjèèjì nígbà tí o bá ń yí metadata padà tàbí tí o ń gbèrò ìṣíkiri.

**Irúfẹ́ orísun data.** Wo ìsàlẹ̀. Èyí ni èyí tí ó máa ń kùnà ní ìdákẹ́rọ́rọ́.

**Àwọn ààlà.** Ìwọ̀n kéré jùlọ àti títóbi jùlọ ń dènà àwọn iye tí a lè gbà; fún àwọn irú DS tí ń gbé ìwọ̀n jáde, àwọn ààlà wọ̀nyẹn kan ìwọ̀n tí a ṣírò, kì í ṣe àpapọ̀ kíkà aise. Data tí ó kọjá ààlà ń di unknown dípò kí a kékùrú rẹ̀. Àwọn iye tí ó ga jùlọ tí a gbé karí ìbéèrè lè yanjú àwọn ààyè iyára interface; kì í ṣe gbogbo orísun interface ni ó ń gba ààlà iyára asopọ̀ tí ó tọ́ ní fúnra rẹ̀. Yẹ àwọn ẹ̀yà àwòṣe àti ìtumọ̀ fáìlì gidi wò.

Ìṣẹ̀dá ní àwọn ẹ̀ka ìṣètò déédéé pàtó. Fún títóbi jùlọ gidi ní tàbí lábẹ́ kéré jùlọ, GAUGE àti ABSOLUTE ń lo títóbi jùlọ tí a kò ṣàlàyé; àwọn irúfẹ́ mìíràn ń lo kéré jùlọ pẹ̀lú ẹyọ kan. Àwọn ìrọ́pò ìbéèrè ń gba ẹ̀ka ọ̀tọ̀. Àyẹ̀wò òfo/òfo lẹ́yìn náà ń yí títóbi jùlọ nìkan padà, àti pé ìṣètò tẹ́lẹ̀ lè ti yí i padà tẹ́lẹ̀. Má ṣe kà èyí sí olùṣàyẹ̀wò gbogbogbòò tàbí kí o rò pé àwọn ààlà méjèèjì di aláìṣàlàyé.

**Àwọn àpamọ́.** Iye àwọn àpẹẹrẹ láti tọ́jú ní àwọn ìwọ̀n wo, àti irú iṣẹ́ ìdapọ̀ wo ni a gbọ́dọ̀ lò fún kọ̀ọ̀kan. Èyí ni ohun tí ó ń pinnu bóyá o lè dáhùn ìbéèrè kan ní ọdún méjì síwájú.

## Àwọn irúfẹ́ orísun data

| Irúfẹ́ | Ohun tí ó ń tọ́jú | Ohun tí ó bá mu |
|---|---|---|
| `GAUGE` | Ìpele kan, tí a ṣe déédéé sí ìgbésẹ̀ fáìlì | Ìgbóná, àpapọ̀ ẹrù, iranti tí a ń lò, ìjìnlẹ̀ ìtòlẹ́sẹẹsẹ |
| `COUNTER` | Ìwọ̀n ìyípadà ní àáyá kọ̀ọ̀kan, tí ń ṣe àtúnṣe fún yíyípo counter ní 32 tàbí 64 bits | Àwọn octets interface, kíkà àwọn páálí àti àwọn àṣìṣe |
| `DERIVE` | Ìwọ̀n ìyípadà ní àáyá kọ̀ọ̀kan, tí a gbà láyè láti jẹ́ òdì | Counter tí ó lè sọ̀kalẹ̀ tàbí tún bẹ̀rẹ̀ ní ọ̀nà tó tọ́ |
| `ABSOLUTE` | Iye bí a ṣe fi fúnni, tí a pín sí àkókò láti ìgbà kíkà tó kọjá | Kíkà tí ẹ̀rọ ń tún bẹ̀rẹ̀ ní gbogbo ìgbà tí o bá kà á |
| `COMPUTE` | Iye tí a ṣírò láti àwọn pápá mìíràn nínú fáìlì kan náà dípò gbígbà | Pápá tí a mú jáde, bí àpapọ̀ tàbí ìwọ̀n ìpín |

Kadupul ń fi `DCOUNTER` àti `DDERIVE` hàn nígbà tí ẹ̀yà RRDtool tí a ṣètò bá jẹ́ 1.5 tàbí lẹ́yìn rẹ̀. Wọ́n ń gba àwọn counter nọ́mbà pẹ̀lú àkópọ̀; DCOUNTER tún ń ṣàwárí ìtọ́sọ́nà kíkà àti àwọn ìtúnbẹ̀rẹ̀, nítorí náà kì í ṣe COUNTER lásán pẹ̀lú àwọn nọ́mbà kékèèké. Tábìlì náà ń ṣàpèjúwe àwọn ìtumọ̀ RRDtool, kì í ṣe ẹ̀rí pé gbogbo olóòtú Kadupul tàbí ọ̀nà ìṣẹ̀dá ló ń tì í lẹ́yìn; fọwọ́ sí ìtumọ̀ tí a gbé jáde, pàápàá fún àwọn ọ̀rọ̀ COMPUTE. Wo [ìtọ́kasí ìṣẹ̀dá RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) lókè.

### Yíyan irúfẹ́ tí kò tọ́

Àwọn àpẹẹrẹ wọ̀nyí ń ṣàpèjúwe àwọn àìbáramu; rírí wọn sinmi lórí data àti àwọn ààlà.

`GAUGE` lórí counter tí ń pọ̀ sí i ń ya àwòrán ìpele rẹ̀ dípò iṣẹ́ tí ó ń ṣe. Ó lè gòkè títí dé yíyípo tàbí ìtúnbẹ̀rẹ̀; èyí lè hàn gbangba ṣùgbọ́n a kò dánilójú pé yóò rí bí àṣìṣe kedere láàárín àkókò kúkúrú kan.

`COUNTER` ń túmọ̀ ìdínkù nípa lílo àtúnṣe yíyípo, nítorí náà ìtúnbẹ̀rẹ̀ lè di ìwọ̀n rere títóbi tàbí kí ààlà títóbi jùlọ kọ̀ ọ́. `DERIVE` pẹ̀lú kéré jùlọ ti òfo ń kọ àwọn ìwọ̀n òdì, pẹ̀lú àwọn yíyípo gidi; yan èyí nìkan nígbà tí àdéhùn yẹn bá bá ìwọ̀n mu. Ààlà títóbi jùlọ kì í ya gbogbo ìtúnbẹ̀rẹ̀ sọ́tọ̀ kúrò nínú yíyípo tó tọ́.

`COUNTER` lórí gauge ni àṣìṣe tó léwu jùlọ. Iye tí a tọ́jú ń di ìyípadà nínú gauge tí a pín sí àkókò tí ó kọjá. Ẹ̀rọ tí ó wà ní ìdákẹ́rọ́rọ́ ní ìwọ̀n 40 ń kọ òfo sílẹ̀. Ìbísí ìwọ̀n kan láàárín ìṣẹ́jú márùn-ún ń kọ 0.0033 sílẹ̀. Àwòrán náà lè dà bí ohun tó tọ́ nígbà tí ó ń wọn ìyípadà dípò ìgbóná. Ìwọ̀n yẹn wúlò nìkan tí ó bá jẹ́ iye tí o fẹ́; kò ṣojú fún ìpele gauge àkọ́kọ́.

`ABSOLUTE` lórí counter tí kì í tún bẹ̀rẹ̀ nígbà kíkà jẹ́ irúfẹ́ ìkùnà ìdákẹ́rọ́rọ́ kan náà ní ìhà kejì, tí ń mú àwọn iye jáde tí ń pọ̀ sí i pẹ̀lú bí ẹ̀rọ náà ṣe pẹ́ tó ní títàn.

Òfin tí èyí dábàá ni láti pinnu irúfẹ́ láti bí ẹ̀rọ ṣe ń gbé nọ́mbà jáde, kì í ṣe láti ohun tí nọ́mbà náà túmọ̀ sí. Bóyá kíkà kan jẹ́ ìwọ̀n jẹ́ ohun-ìní ti counter, kì í ṣe ti ìwọ̀n náà.

## Ìlù-ọkàn (The heartbeat)

Ìlù-ọkàn ni àkókò títóbi jùlọ tí a gbà láyè láàárín àwọn ìsọdọ̀tun fún pápá kan kí RRDtool tó ka àkókò náà sí unknown. A ń wọn ọ́n láàárín àwọn ìsọdọ̀tun, kì í ṣe bí àkókò àfikún tí a fi kún un lẹ́yìn ìgbésẹ̀.

Ka profaili tí a ṣètò àti fáìlì gidi. Profaili ìṣẹ́jú márùn-ún tí a pèsè ń lo ìlù-ọkàn àáyá 600, profaili ìṣẹ́jú kan tún ń lo àáyá 600, àti pé profaili àáyá ọgbọ̀n ń lo àáyá 1,200. Nítorí náà, a kò lè fi iye kan pàtó ṣàpèjúwe ààyè fún ìbò tí ó pàdánù; ìṣètò déédéé àti ìdapọ̀ tún ń ní ipa lórí àwọn àkókò àwòrán tí ó di unknown.

Ìlù-ọkàn jẹ́ fún pápá kọ̀ọ̀kan, kì í ṣe fún fáìlì kọ̀ọ̀kan. Àwọn iye profaili ń fi ìmọ̀ fún metadata, ṣùgbọ́n ìṣẹ̀dá fáìlì ń ka ìlù-ọkàn ohun abẹ́lé, èyí tí ó lè yàtọ̀ sí ti profaili náà. Àwọn profaili tí a pèsè kò lo ìpín kan ṣoṣo, àti pé ìdí lẹ́yìn kọ̀ọ̀kan, pẹ̀lú ohun tí ìlù-ọkàn tí a ṣètò súnmọ́ ìgbésẹ̀ jù máa ń ṣe, wà nínú [Àkókò àti àwọn àkókò](/yo/concepts/time-and-intervals/).

## Ìdapọ̀ (Consolidation)

Bí àwọn ìsọdọ̀tun ṣe ń dé, RRDtool tún ń da wọ́n pọ̀ sí àwọn àpamọ́ tí ó fẹ̀ sí i; kò ní dúró de àpamọ́ tí ó kéré jùlọ láti parí. A ń yan iṣẹ́ náà fún àpamọ́ kọ̀ọ̀kan, àti pé iṣẹ́ kọ̀ọ̀kan ń dáhùn ìbéèrè ọ̀tọ̀ọ̀tọ̀.

- `AVERAGE` ń ṣàkópọ̀ àwọn kókó data àkọ́kọ́ tí ó kópa.
- `MAX` ń pa iye títóbi jùlọ wọn mọ́.
- `MIN` ń pa iye kéré jùlọ wọn mọ́.
- `LAST` ń pa iye ìkẹyìn wọn mọ́ lábẹ́ àwọn òfin ìdapọ̀ RRDtool.

Wọ̀nyí ń ṣiṣẹ́ lórí àwọn kókó data àkọ́kọ́ tí a ṣe déédéé, kì í ṣe dandan lórí àwọn kíkà aise àkọ́kọ́. Àpamọ́ MAX kò lè gba góńgó àkókò kan padà tí a ti ṣe àpapọ̀ rẹ̀ nínú àkókò àkọ́kọ́; MIN kì í ṣe olùṣàwárí tó ṣeé gbẹ́kẹ̀lé fún gbogbo ìdádúró.

Fáìlì kan ń tọ́jú àpamọ́ kan fún iṣẹ́ kọ̀ọ̀kan fún ìwọ̀n kọ̀ọ̀kan, nítorí náà pípa gbogbo mẹ́rẹ̀ẹ̀rin mọ́ ní àwọn ìwọ̀n mẹ́rin túmọ̀ sí àpamọ́ mẹ́rìndínlógún àti ìlọ́po mẹ́rin ẹrù iye ti pípa àwọn àpapọ̀ nìkan mọ́ pẹ̀lú àwọn ìlà kan náà. Àkọlé àti àwọn ìnáwó ipò ìmúrasílẹ̀ tún ń lo ààyè. Gbogbo àwọn profaili mẹ́tẹ̀ẹ̀ta tí a pèsè ń yan àwọn iṣẹ́ mẹ́rin; yan ìpamọ́ gẹ́gẹ́ bí àwọn ìbéèrè àti àwọn ohun tí agbára ìgbékalẹ̀ rẹ nílò.

Tí o bá pa àwọn àpapọ̀ nìkan mọ́, o kò lè béèrè nípa àwọn góńgó lẹ́yìn náà. A kò kọ àwọn góńgó náà sílẹ̀ rí. Èyí ni àbámọ̀ tí ó wọ́pọ̀ jùlọ nínú àgbékalẹ̀ tó pẹ́ títí, a kò sì lè tún un ṣe lẹ́yìn náà.

Àwọn ọ̀nà ohun yíya kan ń fi iṣẹ́ tí ó wà rọ́pò nígbà tí iṣẹ́ tí a béèrè bá sonù; àwọn ọ̀nà mìíràn lè kùnà. Fọwọ́ sí DEF tí a gbé jáde àti àwọn àpamọ́ gidi gẹ́gẹ́ bí a ṣe ṣàpèjúwe nínú [Bí a ṣe ń ya àwọn àwòrán](/yo/concepts/how-graphs-are-drawn/).

## Unknown jẹ́ iye gidi kan

RRD ń ya òfo sọ́tọ̀ kúrò nínú unknown. Òfo lè jẹ́ ìpele tí a ròyìn tàbí ìwọ̀n tí a ṣírò, bí counter tí kò yípadà. Unknown lè wá láti àwọn ìsọdọ̀tun tí ó pàdánù, ìparí ìlù-ọkàn, ìtẹ̀wọlé unknown gidi, àwọn ààlà tí a kọ̀ tàbí àìtó data ìdapọ̀. Fífi òfo rọ́pò unknown lè mú kí àwọn ìwọ̀n tí ó sọnù tàbí tí kò tọ́ dà bí àìṣiṣẹ́.

Unknown ń tàn káàkiri nípasẹ̀ ìdapọ̀ lábẹ́ ààlà tí a ṣètò fún àpamọ́ kọ̀ọ̀kan. Àwọn profaili tí a pèsè ń ṣètò rẹ̀ sí ìdajì: ààyè fífẹ̀ tí a kọ́ láti àwọn ìtẹ̀wọlé tí ó pàdánù ní apá kan ń wà bí nọ́mbà gidi títí tí ó fi ju ìdajì àwọn ìtẹ̀wọlé rẹ̀ lọ tí ó di unknown, ní àkókò tí gbogbo ààyè náà yóò di unknown. Ìríran sinmi lórí ìtòlẹ́sẹẹsẹ ààyè, ìlù-ọkàn, ìṣètò déédéé, ìdapọ̀ àti ìfarahàn àwòrán. Kò sí àkókò ìdádúró gbogbogbòò tí ń ṣe ìdánilójú pé àlàfo yóò yọjú tàbí parẹ́ nínú àpamọ́ kọ̀ọ̀kan.

Unknown tún jẹ́ ohun tí àwọn ààlà ń gbé jáde. Kíkà tí ó ga ju títóbi jùlọ tí a ṣètò kò ní di kíkékùrú sí títóbi jùlọ. Ìtúnbẹ̀rẹ̀ counter lè mú ìwọ̀n tí ó kọjá ààlà jáde àti àlàfo kan, ṣùgbọ́n àwọn ààlà kì í mú gbogbo ìtúnbẹ̀rẹ̀. Data unknown nìkan kò lè mọ okùnfà rẹ̀; fi àwọn àṣìṣe àkójọ àti àwọn àkókò wéra.

## Ìpinnu ìwọ̀n

Fún ìṣètò tí kò yípadà, ẹrù iye àpamọ́ ni gbogbo àwọn ààyè kọjá gbogbo àwọn àpamọ́, sọ di púpọ̀ nípasẹ̀ iye àwọn pápá, sọ di púpọ̀ nípasẹ̀ bytes mẹ́jọ. Gbogbo fáìlì àti ìwọ̀n ìgbékalẹ̀ tún pẹ̀lú àwọn àkọlé, ipò ìmúrasílẹ̀, ìpín ètò fáìlì, àwọn ìlà àti àwọn ẹ̀dà ìpamọ́. Ìtọ́jú ìṣètò gbangba lè yí ìwọ̀n fáìlì padà.

Àwọn profaili mẹ́tẹ̀ẹ̀ta tí a pèsè yàtọ̀ sí ara wọn púpọ̀ ju bí àwọn orúkọ wọn ṣe dábàá lọ.

| Profaili | Ìgbésẹ̀ | Àwọn ààyè fún pápá kan | Ẹrù fún pápá kan | Iye owó tí ó bá a mu |
|---|---|---|---|---|
| Àkójọ Ìṣẹ́jú 5 | àáyá 300 | 11,488 | nǹkan bí 90 KiB | 1 |
| Àkójọ Àáyá 30 | àáyá 30 | 40,284 | nǹkan bí 315 KiB | 3.5 |
| Àkójọ Ìṣẹ́jú 1 | àáyá 60 | 81,716 | nǹkan bí 640 KiB | 7 |

Orísun data interface ti pápá méjì ń ṣe ìlọ́po méjì kọ̀ọ̀kan nínú àwọn yẹn. Ẹgbẹ̀rún mẹ́wàá interface lórí profaili ìṣẹ́jú márùn-ún ní nǹkan bí 1.8 GB ti ẹrù iye àpamọ́. Ẹgbẹ̀rún mẹ́wàá kan náà lórí profaili ìṣẹ́jú kan súnmọ́ 13 GB, àti pé ìdí rẹ̀ kì í ṣe ìgbésẹ̀ nìkan; profaili yẹn tún ń pa àpamọ́ oṣooṣù tí ó jinlẹ̀ púpọ̀ mọ́ àti ti ọdún mẹ́wàá fún ọdọọdún.

Ohun tí àpamọ́ kọ̀ọ̀kan ń bò ní gidi yẹ kí a yẹ̀ ẹ́ wò ní ìbámu pẹ̀lú orúkọ rẹ̀. Àwọn àpamọ́ profaili ìṣẹ́jú márùn-ún ni a sọ ní Ojoojúmọ́, Ọ̀sọ̀ọ̀sẹ̀, Oṣooṣù àti Ọdọọdún, àti pé àwọn àkókò tí wọ́n mú dání jẹ́ wákàtí 50, ọjọ́ 14.6, ọjọ́ 64.6 àti ọdún 2.2. Àwọn orúkọ náà ń ṣàpèjúwe ètò àwòrán tí a pèsè àpamọ́ kọ̀ọ̀kan fún, kì í ṣe ìpamọ́. Tí o bá nílò láti dáhùn ìbéèrè kan nípa oṣù Kẹrin tó kọjá ní ìwọ̀n ìṣẹ́jú márùn-ún, àkọlé náà yóò sọ fún ọ pé o lè ṣe bẹ́ẹ̀ nígbà tí àpamọ́ náà kò ní lè ṣe é.

Ẹrù kíkọ ń lọ pẹ̀lú profaili náà pẹ̀lú, ó sì ń dé kí disk tó ní ìmọ̀lára rẹ̀. Ní kíkún àkójọ déédéé, ìgbésẹ̀ àáyá ọgbọ̀n ń mú àwọn àkókò àpẹẹrẹ jáde ní ìlọ́po mẹ́wàá ju ìgbésẹ̀ ìṣẹ́jú márùn-ún lọ. Àkójọpọ̀, àwọn pápá tí a pín, àṣàyàn iṣẹ́ tó yẹ kí a ṣe àti àwọn ìgbìyànjú tí ó kùnà ń ní ipa lórí àwọn àṣẹ àti kíkà kíkọ gidi; wọn kì í ṣe ìpín tí a ṣètò. Wo [Àwọn kíkọ ìwọ̀n gíga](/yo/concepts/high-volume-writes/).

## Àwọn pápá wo ló ń dé inú fáìlì náà

Orísun data tí a kọ́ láti àwòṣe data ń gba pápá kan nínú fáìlì fún àwọn pápá nìkan tí ohun èlò àwòrán kan tọ́ka sí nínú ọ̀nà ìṣẹ̀dá déédéé. Kóòdù ìsọdọ̀tun lè yọ àwọn pápá àwòṣe tí a kò tọ́ka sí kúrò; bóyá a ń gbà wọ́n sinmi lórí ọ̀nà ìtẹ̀wọlé àti cache, kì í ṣe lórí bóyá ìlà kan hàn nìkan. Orísun data tí kò ní àwòṣe ń gba gbogbo pápá, lórí ìdí pé ó lè má sí àwòrán kankan láti béèrè.

Ìtọ́kasí kò nílò láti ya ìlà tí ó hàn: yẹ àwọn àpẹẹrẹ ohun-ìṣètò àwòrán wò pẹ̀lú cache àti ìtumọ̀ fáìlì. Fífi pápá àwòṣe kan kún un nìkan kò ní fi ìdí rẹ̀ múlẹ̀ pé àkójọ, àwòrán àti ibi-ìpamọ́ ti ṣetán. Títún cache kọ́ ń bójútó metadata àkójọ; kò ní fi àwọn pápá kún RRD tó wà tẹ́lẹ̀.

Ó tún túmọ̀ sí pé fífi pápá kún àwòṣe kò ní fi kún àwọn fáìlì tó wà tẹ́lẹ̀ láìfọwọ́yí, kódà lẹ́yìn tí ohun èlò àwòrán kan ti tọ́ka sí i. Fífi pápá kún nílò ìtọ́jú gbangba tàbí ìṣíkiri. Ní ìbámu pẹ̀lú ẹ̀yà RRDtool tí a fi sori ẹ̀rọ, ìṣètò lè fi àwọn orísun data kún un nígbà tí a ń tọ́jú data tó wà tẹ́lẹ̀; píparẹ́ àti títún fáìlì dá ń pàdánù ìtàn rẹ̀. Wo [Ṣàkóso ìtọ́jú data](/yo/guides/manage-data-retention/) fún àwọn àṣàyàn ìtọ́jú àti àwọn àyẹ̀wò.
