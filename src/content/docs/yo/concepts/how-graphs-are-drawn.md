---
title: Bí a ṣe ń ya àwọn graph
description: Ọ̀nà láti inú fáìlì round-robin sí àwòrán tí a gbé jáde, àti ìdí tí àwọn nọ́mbà kan náà tí a tọ́jú fi lè mú àwọn àwòrán tí ó yàtọ̀ pátápátá jáde.
sidebar:
  order: 4
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
---

Ìbéèrè àwòrán déédéé lè ṣàkójọ àṣẹ RRDtool láti inú ìṣètò graph kí ó sì ka àwọn fáìlì RRD tí a mẹ́nu kàn. Àwòrán tí a tọ́jú sínú kache tí ó tọ́ lè bójútó ìbéèrè náà pẹ̀lú, àti pé iṣẹ́ Boost lórí ìbéèrè lè sọ àwọn fáìlì di tuntun kí a tó gbé àwòrán jáde. Fún àwọn ààlà tútù data, wo [àwọn kíkọ ìwọ̀n gíga](/yo/concepts/high-volume-writes/).

## Ìtòlẹ́sẹẹsẹ àwọn iṣẹ́

Fún àwọn ìbéèrè tí ń tẹ̀síwájú sí dídá àṣẹ:

1. Yanjú fèrèsé àkókò tí a béèrè àti ìṣètò graph.
2. Ṣírò ìpinnu láti inú profaili ibi-ìpamọ́ data kí o sì yan iṣẹ́ ìdapọ̀.
3. Gbé àwọn ìtọ́kasí `DEF` tí kò lẹ́ẹ̀mejì jáde fún àwọn pápá àti àwọn iṣẹ́ tí a nílò.
4. Gbé àwọn gbólóhùn `CDEF` àti `VDEF` tí a mẹ́nu kàn jáde.
5. Gbé àwọn ohun yíyà àti títẹ̀ jáde ní ìtòlẹ́sẹẹsẹ tí a ṣètò pẹ̀lú àwọn àṣàyàn tí a lò àti àwọn àtúnṣe plugin.
6. Jé kí RRDtool ka àwọn fáìlì gidi kí ó sì gbé àbájáde jáde.

## Yíyan àpamọ́ kan

Kadupul ń kan sí àwọn ìlà profaili ibi-ìpamọ́ data nígbà tí ó bá ń ṣírò ìbú àpamọ́ àti àwọn àṣàyàn graph. Ìṣírò rẹ̀ fúnra rẹ̀ ń gbé àkókò ìgbésẹ̀ tí a sọ di púpọ̀ nípasẹ̀ iye àwọn ìgbésẹ̀ tí a sọ di púpọ̀ nípasẹ̀ iye àwọn ìlà, ààbò tí a béèrè àti iye àwọn ìgbésẹ̀ àpamọ́ yẹ̀ wò; yíyan àpamọ́ ní gbangba ń tẹ̀lé ipa-ọ̀nà ọ̀tọ̀. Àwọn ìṣírò profaili wọ̀nyí kì í yẹ gbogbo àpamọ́ gidi wò nínú fáìlì kọ̀ọ̀kan wọ́n sì lè má bá àwọn fáìlì tó wà tẹ́lẹ̀ mu lẹ́yìn àtúnṣe profaili.

`DEF` tí a ṣe ń sọ fáìlì náà, orúkọ orísun data àti iṣẹ́ ìdapọ̀ ní pàtó. RRDtool ń yan àpamọ́ tó wà ní ìwọ̀n tí ó yẹ ó sì lè dapọ̀ data síwájú fún ìbú graph àti fèrèsé àkókò. Ìṣírò ìṣàfilọ́lẹ̀ kò ṣe ìdánilójú kíkà àpamọ́ gidi èyíkéyìí pàtó. Wo àwọn àkọsílẹ̀ [ìtumọ̀ data RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html) lókè.

Fífà fèrèsé gùn tàbí yíyí ìbú àwòrán padà lè yí ìpinnu tí a ń rí padà. Ọ̀wọ́ tí a gbé karí àpapọ̀ lè fi ìgòkè gíga kúkúrú pamọ́ bí ó tilẹ̀ jẹ́ pé ó ṣì wà nínú àpamọ́ tí ó dára jù. Fi ìṣètò fáìlì gidi wéra pẹ̀lú àṣẹ náà, kì í ṣe profaili nìkan. Wo [àwọn orísun data àti àwọn àpamọ́ yípo (RRAs)](/yo/concepts/data-sources-and-rras/).

Nígbà tí olùpè kò bá pèsè àkókò ìparí, olùgbéjáde déédéé ń lo ìyapa ti sáré ìkẹyìn ti poller àkọ́kọ́ ní ìbámu pẹ̀lú àkókò ìsinsìnyí ní àkọ́kọ́, tí ó sì ń padà sí ààlà àkókò ìwádìí tí iye yẹn kò bá sí tàbí tí ó wà ní ọjọ́ iwájú. Kóòdù lẹ́yìn náà tún ní àṣàyàn ààlà àkókò tí a so pọ̀, ṣùgbọ́n kì í ṣe ètò àkọ́kọ́ gbogbogbòò. Àkókò ìparí kedere ń ré ìbẹ̀rẹ̀ déédéé yìí kọjá; graph tí ó parí ṣáájú àkókò ìsinsìnyí kì í dá àpamọ́ tí a yàn mọ̀ fúnra rẹ̀ tàbí fìdí rẹ̀ múlẹ̀ pé a ti kọ àwọn àpẹẹrẹ tuntun sílẹ̀.

## Àwọn ohun graph

Graph jẹ́ àkójọ àwọn ohun tí a tò ní ìtòlẹ́sẹẹsẹ. Dídá àṣẹ lè fò àwọn ohun dà, tún àwọn ìtumọ̀ lò tàbí fa ohun kan gùn sí ọ̀pọ̀lọpọ̀ àwọn ìtọ́sọ́nà. Ìtòlẹ́sẹẹsẹ yíyà ṣe pàtàkì ju ìṣètò ojú lásán lọ.

| Ohun | Ohun tí ó ń yà | Àkíyèsí |
|---|---|---|
| `AREA` | Agbègbè tí a kún láti axis sí iye | Àwọn agbègbè tó tẹ̀lé ni a ń yà sórí àwọn agbègbè tẹ́lẹ̀ |
| `STACK` | Agbègbè tí a kún tí ó bẹ̀rẹ̀ láti orí ohun tó ṣáájú | A gbé e jáde bí agbègbè tí ó ní àmì stack |
| `LINE1`, `LINE2`, `LINE3` | Ìlà kan tí ìbú rẹ̀ jẹ́ pixel kan, méjì tàbí mẹ́ta | Ó lè ní dashi |
| `LINE:STACK` | Ìlà tí a fà lórí àpapọ̀ stack tí ń lọ lọ́wọ́ | |
| `TICK` | Àmì tick lẹ́gbẹ̀ẹ́ etí kan ti àwòrán | Ó wúlò fún ipò, kì í ṣe fún iye |
| `GPRINT` | Kò sí nǹkan. Ó ń tẹ nọ́mbà kan sínú àlàyé | |
| `COMMENT` | Kò sí nǹkan. Ó ń tẹ ọ̀rọ̀ àlàyé gidi | A ń ká àwọn àlàyé gígùn |
| `HRULE` | Ìlà gbọọrọ ní iye kan pàtó | |
| `VRULE` | Ìlà ìdúró ní àkókò kan pàtó | |
| `TEXTALIGN` | Kò sí nǹkan. Ó ń ṣètò ìtò fún ọ̀rọ̀ àlàyé tó tẹ̀lé | |

Àkójọ kíkún, pẹ̀lú àwọn ọwọ̀n ìṣètò tí ó kan irú kọ̀ọ̀kan, wà nínú [àwọn ohun graph](/yo/reference/graph-items/).

`AREA` àti `STACK` jẹ́ àwọn méjì tí àwọn ènìyàn sábà máa ń ṣìye méjì nípa wọn. Agbègbè kan ń bẹ̀rẹ̀ láti òfo, nítorí náà agbègbè méjì ń bo ara wọn mọ́lẹ̀ tí èyí tó ga sì ń fi èyí tó kúrú pamọ́. Stack ń bẹ̀rẹ̀ níbi tí ohun tó ṣáájú ti parí, nítorí náà gíga tí a lè rí ti agbègbè kejì jẹ́ iye tirẹ̀ ṣùgbọ́n etí rẹ̀ lókè ń ṣojú fún àpapọ̀. Ka graph tí a to pọ̀ bí gíga agbègbè kan, kì í ṣe bí ipò lórí Y-axis, bí bẹ́ẹ̀ kọ́ wàá ka gbogbo ọ̀wọ́ ní àìtọ́ àyàfi èyí tí ó wà ní ìsàlẹ̀ pátápátá.

`HRULE` ń gba iye tí ó lè ní àwọn ìrọ́pò àkọsílẹ̀ àwòṣe nínú. A ń yọ àwọn lẹ́tà tí kì í ṣe nọ́mbà kúrò nínú àbájáde, tí kò bá sì sí nọ́mbà kankan tí ó kù, a ń ya òfin náà sí òfo dípò kí ìgbéjáde kùnà. Òfin tí ó wà ní òfo lè jẹ́ ìmọ̀ọ́mọ̀ tàbí kí ó wá láti inú ìrọ́pò tí ó kùnà. Yẹ àṣẹ tí a yanjú wò kí o tó pinnu. Ìsẹ́kù nọ́mbà tún lè yí ọ̀rọ̀ tí ó ní àwọn ẹ̀yà tàbí àkọsílẹ̀ nọ́mbà tí a kò tì lẹ́yìn padà.

`VRULE` ń gba yálà àmì àkókò Unix tàbí àwọn méjì `hours:minutes`. A ń ka apá wákatí òdì bí ìyapa sẹ́yìn láti àkókò ìsinsìnyí dípò àkókò lórí aago.

## Àwọn iṣẹ́ méjì, ọ̀rọ̀ kan

A ń lo àwọn iṣẹ́ ìdapọ̀ fún àwọn ète méjì ọ̀tọ̀ọ̀tọ̀, àti pé àwọn orúkọ mẹ́rin kan náà, `AVERAGE`, `MIN`, `MAX` àti `LAST`, ń hàn ní àwọn ààyè méjèèjì.

Iṣẹ́ àkọ́kọ́ ni yíyan àpamọ́. `DEF` ń sọ fáìlì kan, orísun data kan nínú rẹ̀, àti iṣẹ́ ìdapọ̀ kan ní pàtó. Iṣẹ́ yẹn ń dènà ẹgbẹ́ àpamọ́ tí a béèrè. Béèrè fún `MAX` àti pé RRDtool nílò data ìdapọ̀ tí a tọ́jú tí ó bá a mu ní ìbámu pẹ̀lú ìpadàsẹ́yìn ìṣàfilọ́lẹ̀ àti yíyan ìpinnu tí a ṣàlàyé ní ìsàlẹ̀.

Iṣẹ́ kejì ni ìṣírò àlàyé. `GPRINT` ń dín gbogbo fèrèsé tí a yà kù sí nọ́mbà tí a tẹ̀, iṣẹ́ rẹ̀ sì ń pinnu bí a ṣe lè ṣe èyí. Ìdínkù yìí ń ṣẹlẹ̀ lórí ọ̀wọ́ tí a ti kà tẹ́lẹ̀; ó jẹ́ ìdapọ̀ ìgbéjáde, kì í ṣe ìpamọ́ gidi.

Nítorí náà `GPRINT` tí ń fi `MAX` hàn lórí `DEF` tí a kà pẹ̀lú `AVERAGE` ń tẹ iye tí ó tóbi jùlọ ti ọ̀wọ́ tí a gbé karí àpapọ̀ yẹn jáde lórí fèrèsé tí a gbé jáde, kì í ṣe dandan àpẹẹrẹ aise tí ó tóbi jùlọ. Ìṣẹ́jú márùn-ún jẹ́ àpẹẹrẹ lásán; ìpinnu gidi ń yí padà. Àwọn nọ́mbà ọ̀tọ̀ọ̀tọ̀ ni wọ́n, àti lórí asopọ̀ tí iṣẹ́ pọ̀ lórí rẹ̀ wọ́n jẹ́ nọ́mbà tí ó yàtọ̀ gan-an. Àwọn kíkà méjèèjì tọ́. Wàá ṣe pé ọ̀kan péré nínú wọn ni ohun tí o fẹ́.

## Ọ̀nà àbájáde dídákẹ́

Fún àwọn irú ohun tí ń lo olùrànlọ́wọ́ iṣẹ́ tí ó dára jù, Kadupul ń ka àwọn iṣẹ́ ìdapọ̀ fáìlì náà ó sì ń lo èyí tí a béèrè tí ó bá wà, bí bẹ́ẹ̀ kọ́ ó ń lo èyí tí a kọ́kọ́ ròyìn. Tí a kò bá rí nǹkan kan fún orísun data agbègbè tó tọ́, olùrànlọ́wọ́ náà ń padà sí AVERAGE. Àwọn ẹ̀yà GPRINT tí ó dúró ṣinṣin ń gba ọ̀nà ọ̀tọ̀ wọn kì í sì í lo olùrànlọ́wọ́ yìí, nítorí náà kì í ṣe àdéhùn gbogbogbòò láti tún gbogbo iṣẹ́ tí ó sọnù ṣe.

Nítorí náà ohun yíyà tí ń béèrè fún `MAX` lè parí sí kíkà àpapọ̀ nígbà tí fáìlì rẹ̀ ní àwọn àpamọ́ AVERAGE nìkan. Yẹ `DEF` tí a gbé jáde àti àbájáde `rrdtool info` wò. Ìtọ́jú àpamọ́ lè yí ìṣètò tó wà tẹ́lẹ̀ padà, ṣùgbọ́n fífi àpamọ́ kún un kò lè tún àwọn orí gíga àtijọ́ tí àpapọ̀ tẹ́lẹ̀ ti sọ nù kọ́. Wo [ṣàkóso ìpamọ́ data](/yo/guides/manage-data-retention/).

## GPRINT ń yá àpamọ́ aládùúgbò rẹ̀

`GPRINT` déédéé kò ní àpamọ́ tirẹ̀. Ó ń tún iṣẹ́ ìdapọ̀ ti ohun `AREA`, `STACK`, ìlà tàbí `TICK` tuntun tí ó bá a mu lò tí a mọ̀ nípasẹ̀ orúkọ orísun data àti ìdánimọ̀ pápá àkọsílẹ̀ àwòṣe agbègbè. Tí kò bá sí ìbámu tẹ́lẹ̀, ó ń lo olùrànlọ́wọ́ iṣẹ́ tí ó dára jù pẹ̀lú iṣẹ́ tí a ṣètò tirẹ̀. Àwọn ẹ̀yà tí ó dúró ṣinṣin ń lo iṣẹ́ tí a ṣètò tiwọn tààràtà.

Èyí túmọ̀ sí pé títún àwọn ohun tò nínú àkọsílẹ̀ àwòṣe graph lè yí ohun tí àlàyé ń sọ padà láìsí ẹnìkan tí ó fọwọ́ kàn àlàyé náà fúnra rẹ̀. Fi `LINE` tí ń ka `MAX` sí orí idiwọ `GPRINT`, àwọn àlàyé tí ó bá a mu sì lè ṣàkópọ̀ àwọn iye tí ó ga jùlọ. Gbé e lọ sí ìsàlẹ̀ tí ohun tí ó bá a mu tẹ́lẹ̀, tàbí àìsí ìbámu, yóò fi pinnu ọ̀wọ́ àmúwọlé dípò rẹ̀. Tí nọ́mbà kan nínú àlàyé bá yí padà lẹ́yìn àtúnṣe àkọsílẹ̀ àwòṣe tí kò jẹmọ́ ọn, kọ́kọ́ yẹ ìtòlẹ́sẹẹsẹ àwọn ohun wò.

## CDEF àti VDEF

Méjèèjì ń yí data padà kí a tó yà á. Wọn kì í ṣe ohun tí a lè pàṣípààrọ̀ fún ara wọn.

| | CDEF | VDEF |
|---|---|---|
| Ohun tí ó ń ṣẹ̀dá | Ọ̀wọ́ kan, iye kan fún ààyè àkókò kọ̀ọ̀kan | Iye nọ́mbà kan, àti àkókò tí ó jẹmọ́ fún àwọn iṣẹ́ kan |
| Ṣé a lè yà á bí ìlà tàbí agbègbè | Bẹ́ẹ̀ni | Iye nọ́mbà kan lè pèsè ìpele tí kò yí padà |
| Ohun tí a fi kọ́ ọ | Àwọn iṣẹ́, àwọn iṣẹ́ ìṣírò, àwọn CDEF mìíràn, àwọn orísun data àkànṣe, àwọn iye gidi | Iṣẹ́ kan tí a lò lórí ìtọ́kasí kan |
| Ìṣètò sínú ara wọn (Nesting) | CDEF kan lè tọ́ka sí CDEF mìíràn | VDEF kò lè ní ìṣírò nínú |

CDEF jẹ́ gbólóhùn stack tí a ń ṣe àyẹ̀wò rẹ̀ nípasẹ̀ ìtòlẹ́sẹẹsẹ Polish tí a yí padà. Àwọn ọ̀rọ̀ rẹ̀ pọ̀ gan-an a sì kọ wọ́n ní kíkún nínú [àwọn ohun graph](/yo/reference/graph-items/): ìṣírò, àwọn olùṣiṣẹ́ ìfiwéra àti ti àdéhùn, trigonometry, àwọn àpapọ̀ kọjá àwọn orísun data, dídarí stack àti àwọn iṣẹ́ àkókò tí ń jẹ́ kí ìtumọ̀ mọ ibi tí ó wà lórí X-axis. `UN` àti `UNKN` jẹ́ èròjà méjì tí ó yẹ láti kọ́ ní kíákíá. Fífi òfo rọ́pò àwọn iye tí a kò mọ̀ ń dènà àwọn àlàfo ojú ṣùgbọ́n ó tún ń fi àwọn ìwọ̀n tí ó sọnù pamọ́; ṣe àṣàyàn ìgbéjáde yẹn ní kedere.

CDEF tún ń ka àwọn ìtọ́kasí àkànṣe dípò orúkọ orísun data pàtó kan. Ọ̀kan ń yanjú sí orísun data ti ohun ìsinsìnyí, tí ó ń jẹ́ kí CDEF kan ṣoṣo ṣe é tún lò kọjá ohun kọ̀ọ̀kan nínú àkọsílẹ̀ àwòṣe kan. Àwọn ìtọ́kasí mìíràn ń yanjú sí gbogbo àwọn orísun data nínú graph tàbí gbogbo àwọn orísun tí ó jọra, tí ó ń mú kí ó ṣeé ṣe láti dá ìlà àpapọ̀ kan láìsí dídárúkọ àwọn àmúwọlé.

VDEF ń dín ọ̀wọ́ kan kù sí nọ́mbà kan ṣoṣo: títóbi jùlọ, kéré jùlọ, àpapọ̀, ìyapa déédéé, àkọ́kọ́, ìkẹyìn, àpapọ̀ gbogbo, ìpín ọgọ́rùn-ún tàbí gẹ̀rẹ́gẹ̀rẹ́, ìdúró àti ìbámu. RRDtool kò ti ìṣírò lẹ́yìn nínú VDEF, nítorí náà nígbà tí VDEF bá nílò àmúwọlé tí a ṣírò, Kadupul ń kọ́ ọ sórí CDEF ti ohun náà dípò orísun data aise. Èyí ni ọ̀nà tí a gbèrò fún ìṣírò: ṣe ìṣírò lórí CDEF kan, lẹ́yìn náà dín in kù nínú VDEF kan.

`GPRINT` tí ó ní àtìlẹ́yìn VDEF kì í gba àríyànjiyàn iṣẹ́ ìdapọ̀: VDEF ti pèsè ìdínkù náà tẹ́lẹ̀. Àwọn VDEF tún lè pèsè àwọn iye nọ́mbà fún yíyà; RRDtool ń ti ìlà tí ó ní àtìlẹ́yìn VDEF lẹ́yìn. Wo àwọn àkọsílẹ̀ [àwọn èròjà graph RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html) lókè.

Ìkójáde CSV ń yan àwọn irú yíyà tí a tì lẹ́yìn bí àwọn ọwọ̀n ọ̀wọ́; a kì í kó àwọn ohun àlàyé jáde bí àwọn ọwọ̀n tí ó báramu. Kò dà bí àwọn àpèjúwe tẹ́lẹ̀, kóòdù ìsinsìnyí kì í sábà fò àwọn ohun yíyà tí ó ní àtìlẹ́yìn VDEF dà. Ó lè gbé `XPORT` tí kò tọ́ jáde fún nọ́mbà VDEF kan: àyẹ̀wò RRDtool tí a yà sọ́tọ̀ ń gbé ìlà VDEF jáde pẹ̀lú àṣeyọrí ṣùgbọ́n ó ń kọ ìkójáde yẹn. Wo [àbùkù ìṣàfilọ́lẹ̀ #273](https://github.com/kadupulhq/kadupul/issues/273). Lo àwọn ohun yíyà tí ó ní àtìlẹ́yìn ọ̀wọ́ fún ìkójáde kí o sì fọwọ́ sí àwọn ọwọ̀n tí a rí.

## Ìdí tí data kan náà fi ń rí lọtọ̀

Àṣàyàn kọ̀ọ̀kan ní ìsàlẹ̀ ń yí àwòrán padà láìsí yíyí àpẹẹrẹ kan ṣoṣo tí a tọ́jú padà.

| Àṣàyàn | Àbájáde |
|---|---|
| Gígùn fèrèsé àti ìbú àwòrán | Lè yí yíyan àpamọ́ àti ìdapọ̀ àfikún padà |
| Iṣẹ́ ìdapọ̀ nínú `DEF` | Ń ka orí gíga, kòtò, àpapọ̀ tàbí iye ìkẹyìn |
| Iṣẹ́ ìdapọ̀ tí ó sọnù | Àwọn ipa-ọ̀nà ohun kan ń fi iṣẹ́ mìíràn rọ́pò; àwọn mìíràn lè kùnà |
| `AREA` lòdì sí `STACK` | Gíga pípé lòdì sí gíga àkójọpọ̀ |
| Ìtòlẹ́sẹẹsẹ àwọn ohun | Yíyà lórí ara wọn, ìtòlẹ́sẹẹsẹ stack àti irú àpamọ́ wo ni `GPRINT` ń yá |
| Ìpìlẹ̀ 1000 tàbí 1024 | Ń tún axis sọ ní orúkọ. Àwọn iye náà jọra pọ̀ |
| Ìlànà ìwọ̀n fúnra-ẹni, àwọn ààlà líle, ìwọ̀n logarithmic | Ń yí Y-axis padà, èyí tí ó ń yí ìwọ̀n ìyípadà padà ní ojú |

Tí àwọn graph kò bá báramu, fi àṣẹ tí a gbé jáde, ìdánimọ̀ fáìlì gidi àti ìṣètò, ipò kache àti bí àpẹẹrẹ ṣe jẹ́ tuntun tó wéra. Àwọn àṣàyàn ìgbéjáde wọ̀nyí jẹ́ àwọn àyẹ̀wò tí ó wúlò, ṣùgbọ́n wọn kì í yọ àwọn àṣìṣe gbígba data, ìpamọ́ tàbí ìbámu kúrò. Fún ìtọ́sọ́nà lórí bí a ṣe lè ṣe èyí, wo [wádìí data tí ó sọnù](/yo/guides/troubleshoot-missing-data/).
