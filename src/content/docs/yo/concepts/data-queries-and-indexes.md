---
title: Àwọn ìbéèrè data àti àwọn ìtọ́ka
description: Bí ìrìn àjò ẹ̀rọ kan ṣe ń di ọ̀pọ̀lọpọ̀ orísun data, ohun tí ìtọ́ka jẹ́ gan-an, àti ohun tí ń ṣẹlẹ̀ nígbà tí ẹ̀rọ kan bá tún nọ́mbà ara rẹ̀ ṣe.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 5
---

Orísun data lásán nílò kí o mọ ohun tí o ń wọn kí o tó tò ó.
Èyí ń ṣiṣẹ́ fún ìwọ̀n àpapọ̀ ẹrù ètò (load average). Kò ṣiṣẹ́ fún àwọn pọ́ọ̀tì switch, àwọn disk,
àwọn ẹ̀rọ amúnilọ́wọ́ igbóná, tàbí àwọn ẹ̀rọ foju-inu-wò (virtual machines), nítorí pé àkójọ náà ń yípadà
àti pé o kò ní àkóso lórí rẹ̀.

Ìbéèrè data (data query) ń ṣàwárí àwọn ohun èlò tí ó wà. Ìṣẹ̀dá graph — yálà pẹ̀lú ọwọ́ tàbí nípa
ìṣiṣẹ́-ara-ẹni tí a tò — yan àwọn ohun èlò tí yóò gba àwọn orísun data; ṣíṣe ìbéèrè nìkan kò ní ṣẹ̀dá
gbogbo graph tí ó ṣeé ṣe.

## Ohun tí ìtumọ̀ ìbéèrè ní nínú

Ìbéèrè data jẹ́ àpèjúwe XML pẹ̀lú àwọn apá mẹ́ta: ibi tí àkójọ àwọn nǹkan wà, ohun tí a ó kà nípa
kọ̀ọ̀kan wọn, àti bí a ṣe lè pinnu irú ohun tí nǹkan kọ̀ọ̀kan jẹ́.

Ìbéèrè interface tí ó wá pẹ̀lú Kadupul ni àpẹẹrẹ tó dájú. Ó ń rìn gba `.1.3.6.1.2.1.2.2.1.1`
kọjá láti ka àwọn interface, lẹ́yìn náà ó ń ka àkójọpọ̀ àwọn pápá tí a dárúkọ ní ipò kọ̀ọ̀kan tí ó dá padà.
Pápá kọ̀ọ̀kan ń kéde ìtọ́sọ́nà (direction).

| Ìtọ́sọ́nà | Ìtumọ̀ | Àwọn àpẹẹrẹ interface |
|---|---|---|
| `input` | Kà fún ìdánimọ̀ àti sísọ orúkọ. A kò gbà á jọ lórí àkókò | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Iye tí ó yẹ kí a gbà jọ ní gbogbo ìgbà | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Méjèèjì | `ifOperStatus`, `ifAdminStatus` |

Àwọn pápá náà tún ń kéde bí a ṣe lè ka iye náà. Ọ̀pọ̀lọpọ̀ ń gbà á gẹ́gẹ́ bí ó ṣe rí; àwọn kan ń lo
ọ̀rọ̀ àbùdá (regular expression) láti fa nọ́mbà kan jáde láti inú ìkà SNMP, àti pé àwọn kan ń béèrè pé kí a
túmọ̀ iye náà gẹ́gẹ́ bí ọ̀rọ̀ dípò àwọn byte tútù.

Ṣíṣe ìbéèrè náà ń tọ́jú ìlà kan fún ìtọ́ka kọ̀ọ̀kan fún pápá kọ̀ọ̀kan: ẹ̀rọ náà, ìbéèrè náà, orúkọ pápá náà,
iye náà, àti ipò tí iye náà ti wá. Tábìlì yẹn ni ìdáhùn sí "kí ni ẹ̀rọ yìí ní", tí a fi pamọ́ sínú kache títí
di ìgbà tí a ó tún ṣe é. Yíyàn graph ń lo kache yẹn, ṣùgbọ́n àwọn irinṣẹ́ ìṣẹ̀dá graph tún lè so mọ́ tàbí tún
ìbéèrè kan ṣe. Ṣàyẹ̀wò àwọn àbájáde ìṣàwárí kí o tó fi àwọn graph kún un.

## Ìtọ́ka jẹ́ ìṣòro ìdánimọ̀

Ipò tí ó wà nínú tábìlì SNMP kì í ṣe orúkọ. Ó jẹ́ nọ́mbà slot tí aṣojú (agent) pèsè, àwọn aṣojú sì ń tún
àwọn slot tò lẹ́yìn àtúnbẹ̀rẹ̀, títún káàdì fi síbẹ̀, àmúpada firmware, tàbí àyípadà ètò tí ó yọ interface kan kúrò.
Bí orísun data kan bá rántí "slot 3" nìkan, ọjọ́ tí slot 3 bá di pọ́ọ̀tì mìíràn ni ọjọ́ tí ìtàn oṣù mẹ́ta yóò so
mọ́ ohun tí kò tọ́ ní ìdákẹ́jẹ́.

Kadupul ń tọ́jú irú ìtọ́ka àti iye ìdánimọ̀, pẹ̀lú ìtọ́ka SNMP tí a yanjú lọ́wọ́lọ́wọ́. Àtúnṣe ìtọ́ka ń lo
ìdánimọ̀ yẹn láti wá ipò tábìlì lọ́wọ́lọ́wọ́; àwọn irú ìtọ́ka tí a fi ọwọ́ yípadà ní ìtọ́jú ọ̀tọ̀.

Ní gbogbo ìgbà tí a bá ṣe ìbéèrè náà, ó ń wá slot lọ́wọ́lọ́wọ́ fún iye pápá yẹn.

| Àbájáde | Ohun tí ń ṣẹlẹ̀ |
|---|---|
| Slot kan náà | Kò sí ohun tí a ó ṣe |
| Slot ọ̀tọ̀ | A tún orísun data náà sọ mọ́ slot tuntun, àwọn graph rẹ̀ sì tẹ̀lé e |
| Iye kò sí mọ́ | Ìtọ́jú àwọn ọmọ aláìlóbìí (orphan) sinmi lórí ìbéèrè àti ipa-ọ̀nà kóòdù; fìdí àmì tí ó yọrí sí àti àwọn OID ìbò mú dípò kí o ro pé ìkójọpọ̀ ti dúró |

Àtúnṣe ìtọ́ka sábà máa ń pa orísun data àti ìtàn rẹ̀ tí ó wà mọ́. Àṣàyàn `index_transient` ń ka àwọn ìdánimọ̀
tí kò sí sí ohun tí a retí ó sì ń fo àmì ọmọ aláìlóbìí lásán dídá kọjá. `index_orphan_removal` ń yọ àwọn àkọsílẹ̀
ìbò tí ó kan kúrò pẹ̀lú àbájáde Boost; kò pa orísun data tàbí fáìlì RRD tìkára rẹ̀ rẹ́.

Ìtọ́jú ọmọ aláìlóbìí lọ́wọ́lọ́wọ́ ní àbùkù kan: nígbà tí ìdánimọ̀ bá parẹ́ tí kò sì sí orísun mìíràn tí ó yí ìtọ́ka
padà, ẹ̀ka tí kò ní àyípadà lè tún pa àmì ọmọ aláìlóbìí rẹ́ nígbà tí ó fi ìtọ́ka àti àwọn OID ìbò tí ó wà tẹ́lẹ̀ sílẹ̀.
Má ṣe gbẹ́kẹ̀lé ìbòjú ọmọ aláìlóbìí láti dènà ìkójọpọ̀ láti inú ìtọ́ka pọ́ọ̀tì tí a tún lò. Fìdí ìdánimọ̀ tí a tọ́jú
mú lòdì sí data ìṣàwárí kí o sì pa orísun data tí ó kan títí tí a ó fi yanjú rẹ̀.

## Yíyàn pápá láti lò gẹ́gẹ́ bí kọ́kọ́rọ́

Kì í ṣe gbogbo pápá ni ó ń ṣe kọ́kọ́rọ́ tí ó wúlò. Ìtumọ̀ ìbéèrè ń pèsè àkójọ àfiyèsí tí a tò lọ́wọ̀ọ́wọ́,
Kadupul sì ń rìn gba orí rẹ̀ ó sì ń mú olùdíje àkọ́kọ́ tí ó yege nínú àwọn àyẹ̀wò kan.

| Àyẹ̀wò | Ìdí tí ó fi wà |
|---|---|
| Pápá náà jẹ́ `input` tàbí `input-output` | Àwọn pápá ìdánimọ̀ gbọ́dọ̀ wà nínú ìṣàwárí |
| Kò sí àwọn ìtọ́ka méjì tí ń pín iye kan náà | Kọ́kọ́rọ́ tí a dárúkọ lẹ́mejì kò lè dá ìlà kan ṣoṣo mọ̀ |
| Iye àwọn iye ọ̀tọ̀ọ̀tọ̀ dọ́gba pẹ̀lú iye àwọn ìtọ́ka | Ó ń kọ àwọn olùdíje tí kò pé |

Àwọn àyẹ̀wò wọ̀nyí ní àwọn ìyàsọ́tọ̀: olùdíje kan ṣoṣo tí a kéde ń padà wá tààrà, a sì ń gba OID ìtọ́ka tútù lọ́tọ̀.
`index_type=nonunique` ń fo kíkọ àwọn tí a tún dárúkọ kọjá ṣùgbọ́n kò fo àyẹ̀wò iye àwọn iye ọ̀tọ̀ọ̀tọ̀ kọjá.
Ṣàyẹ̀wò pápá tí a yan àti àwọn iye tí a fi pamọ́; àmì irú XML nìkan kì í ṣe ẹ̀rí ìfìdímúlẹ̀.

Ìbéèrè interface fẹ́ `ifName`, lẹ́yìn náà `ifDescr`, lẹ́yìn náà àdírẹ́sì hardware, lẹ́yìn náà ìtọ́ka tútù.
Ètò yẹn jẹ́ pẹ̀lú èrò. `ifName` kúrú ó sì fẹsẹ̀ múlẹ̀ lórí ọ̀pọ̀lọpọ̀ pèpéle. `ifDescr` fẹsẹ̀ múlẹ̀ ṣùgbọ́n ní
àwọn ìgbà míràn ó ń gbé nọ́mbà slot nínú ọ̀rọ̀ náà, èyí tí ó ba èrò náà jẹ́. Ìtọ́ka tútù wà ní ìkẹyìn nítorí pé lílò ó
gẹ́gẹ́ bí kọ́kọ́rọ́ kò sàn ju àìní kọ́kọ́rọ́ kankan rárá lọ.

Èyí ni apá tí ó máa ń ya àwọn ènìyàn lẹ́nu. Yíyàn náà ń wáyé fún ẹ̀rọ kọ̀ọ̀kan fún ìgbà kọ̀ọ̀kan, láti inú data ẹ̀rọ
yẹn lọ́wọ́lọ́wọ́. Àwọn iye tí kò sí nínú kache tàbí orúkọ tí a tún dárúkọ lè mú kí `ifName` má ṣe é lò kí ó sì
fa kí a padà sí `ifDescr`. Pápá òfo kan nìkan kò fi hàn irú àyẹ̀wò tí ó kùnà; ṣàyẹ̀wò àwọn ìlà ìṣàwárí gidi.
Àwọn switch méjì tí ó jọra lè pari sí lílo àwọn pápá ọ̀tọ̀ọ̀tọ̀ gẹ́gẹ́ bí kọ́kọ́rọ́, ẹ̀rọ kan sì lè yí pápá tí ó ń lò
padà láàárín àwọn ìgbà ṣíṣe. Kadupul ń kọ ìkìlọ̀ sílẹ̀ nígbà tí pápá tí a yan bá yípadà, nítorí pé ìgbà náà ni àṣìṣe
ìtún-sọ-mọ́ lè wáyé.

Pápá tí a yan sábà máa ń sọ àwọn graph lórúkọ pẹ̀lú, nípasẹ̀ ọ̀nà àkọlé tí ó tọ́ka sí i. Bí àwọn àkọlé graph rẹ bá
ń yípadà ní gbogbo àwọn ẹ̀rọ rẹ, pápá ìtòlẹ́sẹẹsẹ ni ibi tí o yẹ kí o wò.

## Ríri pé àtúnṣe ìtọ́ka ṣe pàtàkì

Títún ìbéèrè data ṣe lórí gbogbo ẹ̀rọ ní gbogbo ìgbà yóò gbówó lórí púpọ̀ kò sì ní ní ìtumọ̀, nítorí pé ọ̀pọ̀lọpọ̀
ẹ̀rọ kò ní tún nọ́mbà kankan ṣe fún ọ̀pọ̀lọpọ̀ ọdún. Dípò bẹ́ẹ̀, ẹ̀rọ kọ̀ọ̀kan àti àjọṣepọ̀ ìbéèrè ní ọ̀nà àtúnṣe ìtọ́ka kan,
èyí tí ó jẹ́ ìmúdájú tí kò gbówó lórí tí a ń yẹ̀wò nígbà ìkójọpọ̀ déédéé. Nígbà tí ìmúdájú bá kùnà, a ń to àtúnṣe
ìtọ́ka sí orí ìlà.

| Ọ̀nà | Ohun tí ó ń yẹ̀wò | Àwọn ààlà àti iye owó |
|---|---|---|
| Kò sí (None) | Kò sí ìmúdájú aládàáṣiṣẹ́ | Títún ìbéèrè ṣe gbọ́dọ̀ wá láti ọwọ́ ènìyàn tàbí ìgbésẹ̀ mìíràn tí ó ṣe kedere |
| Àkókò iṣẹ́ (Uptime) | Àkókò iṣẹ́ kò padà sẹ́yìn | Ó nílò SNMP tí ń ṣiṣẹ́; ó ń fo àwọn àyípadà láìsí àtúnṣe àkókò iṣẹ́ kọjá |
| Ìkà Ìtọ́ka (Index Count) | Ìkà lọ́wọ́lọ́wọ́ bá àwọn ìtọ́ka tí a fi pamọ́ mu | OID ìkà lè rọrùn; láìsí rẹ̀ ètò ń ka àbájáde rírìn tàbí ti script. Àwọn àyípadà pẹ̀lú ìkà kan náà lè fò kọjá |
| Fìdí Gbogbo Rẹ Múlẹ̀ (Verify All) | Àwọn iye kọ́kọ́rọ́ tí a mọ̀ ṣì bá àwọn ìtọ́ka wọn tí a fi pamọ́ mu | Iṣẹ́ ń pọ̀ sí i pẹ̀lú àkójọpọ̀ tí a fi pamọ́; kò ṣe ìdánilójú rírí àwọn ìtọ́ka tuntun tí a fi kún un tàbí àwọn àyípadà ìtumọ̀ tí ó tọ́jú àwọn iye yẹn |

"Fìdí Gbogbo Rẹ Múlẹ̀" ń yẹ àwọn ìmúdájú wò nígbà ìbò; kì í tún gbogbo ìbéèrè ìṣàwárí ṣe láìsí àdéhùn ní gbogbo ìgbà.
Wọ́n iye owó rẹ̀ lórí àwọn ẹ̀rọ àpẹẹrẹ kí o tó lò ó káàkiri. Àkókò iṣẹ́ jẹ́ àkọ́kọ́ tí ó wọ́pọ̀, ṣùgbọ́n kò pèsè ìmúdájú
kankan nígbà tí a bá pa SNMP. Ìtumọ̀ ìbéèrè lè pèsè orísun àkókò iṣẹ́ tàbí ti ìkà tirẹ̀.

## Àtúnṣe ìtọ́ka kì í ṣe lẹ́sẹ̀kẹsẹ̀ (asynchronous)

Ìmúdájú tí ó kùnà kì í tún ìtọ́ka ṣe lẹ́sẹ̀kẹsẹ̀. Ó ń kọ àṣẹ kan sílẹ̀, apá kan ọ̀tọ̀ lẹ́yìn ìgbà ìkójọpọ̀ yóò sì mú àṣẹ
yẹn kí ó sì tún ìbéèrè náà ṣe. Àwọn ipa gidi wúlò láti rántí.

Ìgbà tí ó rí àyípadà náà ṣì lè lo kache àtijọ́, nítorí náà iye kan lè bọ́ sí orí ọ̀nà tí kò tọ́ kí àtúnṣe ìtọ́ka tó parí.
Ìdènà gíga lójijì tí ó ní í ṣe pẹ̀lú àkókò iṣẹ́ ń fi "aimọ̀" rọ́pò àbájáde iye kan ṣoṣo nígbà tí a bá gbé àmì rẹ̀ sókè;
kì í ṣe ìdánilójú fún gbogbo àbájáde oníye-púpọ̀ tàbí gbogbo àyípadà ìtọ́ka.

Àtúnṣe ìtọ́ka kò ní ṣiṣẹ́ lórí ẹ̀rọ tí ó wà nílẹ̀ tàbí tí a pa. Ẹ̀rọ tí a tún nọ́mbà rẹ̀ ṣe nígbà tí kò ṣe é kàn sí ṣì nílò
ìmúdájú tàbí títún ṣe lẹ́yìn tí ó bá ṣe é kàn sí padà. Ìbò àkọ́kọ́ tí ó yọrí sí rere nìkan kò fi hàn pé àtún-sọ-mọ́ ti parí.
`--force` kò borí àwọn àyẹ̀wò ẹ̀rọ tó wà nílẹ̀/tí a pa.

Ní kété tí a bá tún ìbéèrè náà ṣe, àwọn orísun data tí a gbé kúrò yóò ní àwọn àkọsílẹ̀ kache poller wọn tí a kọ padà,
èyí tí ó jẹ́ ohun tí ń darí ìkójọpọ̀ padà gidi. Ọ̀nà náà ni [Àkójọ poller](/yo/concepts/the-poller-cache/), àti pé
títún ìbéèrè ṣe jẹ́ ọ̀kan lára àwọn nǹkan díẹ̀ tí ń tọ́jú rẹ̀ lágbára ara rẹ̀.

Fún apá iṣẹ́ ṣíṣe — fífi ìbéèrè kún ẹ̀rọ kan àti kíkà àwọn àbájáde —, wo [Bojútó switch kan](/yo/guides/monitor-a-switch/).
