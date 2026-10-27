---
title: Cache ti poller
description: Ìdí tí olùgbàfiṣẹ́ fi ń ka àkójọ iṣẹ́ tí a ti ṣírò tẹ́lẹ̀ dípò ìṣètò rẹ, àti ìdí tí èyí fi jẹ́ ìdí tí ó wọ́pọ̀ tí àtúnṣe kan fi dà bí ẹni pé kò ṣe nǹkan kan.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 6
---

[Àkópọ̀ Ètò](/yo/concepts/architecture/) ṣàfihàn cache ti poller nínú gbólóhùn kan:
a ti ṣírò àkójọ iṣẹ́ tẹ́lẹ̀, olùgbàfiṣẹ́ sì ń ka àkójọ yẹn dípò tí yóò fi ṣe àtúnwo ìṣètò
rẹ ní gbogbo ìgbà. Ojú-ewé yìí jẹ́ nípa ohun tí ìpinnu yẹn túmọ̀ sí ní ti gidi nínú iṣẹ́.

## Ohun tí olùgbàfiṣẹ́ ì bá ti ṣe láìsí èyí

Láti mọ ohun tí a gbọ́dọ̀ gbà fún iye kan ṣoṣo, ó gba wíwá gbogbo ẹ̀ka àwọn ohun tí ó
gbára lé ara wọn jáde. Orísun data ń tọ́ka sí ẹ̀rọ kan àti àwòṣe data kan. Àwòṣe ń tọ́ka
sí ìtẹ̀wọlé data kan. Ìtẹ̀wọlé data ní àwọn pápá, àwọn kan nínú wọn ni a tún kọ fún
ẹ̀rọ kọ̀ọ̀kan àti àwọn mìíràn tí a jogún láti inú àwòṣe. Tí orísun data bá wá láti inú
ìbéèrè data, atọ́ka ìsinsìnyí gbọ́dọ̀ wá jáde nípasẹ̀ cache ìbéèrè. Lẹ́yìn náà ni a gbọ́dọ̀
gba àwọn ẹ̀rí SNMP láti inú ẹ̀rọ, àyàfi tí pápá kan bá tún wọn kọ.

Èyí jẹ́ ọ̀pọ̀lọpọ̀ ìpapọ̀ (joins) fún iye kan ṣoṣo. Ìfipamọ́ tí ó kéré ní ẹgbẹẹgbẹ̀rún
àwọn iye ó sì ń ṣe àyíká kan ní gbogbo ìṣẹ́jú márùn-ún. Ṣíṣe ìwádìí yìí ní àkókò ìgbàfiṣẹ́
yóò túmọ̀ sí pé ibi-ìpamọ́ data, kì í ṣe nẹ́tíwọ́ọ̀kì, ló máa pinnu iye àwọn ẹ̀rọ tí o lè bójútó.

Nítorí náà, ìwádìí náà ń ṣẹlẹ̀ lẹ́ẹ̀kan ṣoṣo nígbà tí nǹkan kan bá yípadà, a sì ń kọ
àbájáde rẹ̀ sílẹ̀ ní pẹẹrẹ.

## Ohun tí cache ń tọ́jú

Cache ń ṣe ìṣírò àwọn ìtọ́ni ìgbàfiṣẹ́ tẹ́lẹ̀. Ó ń dín àtúnwo ìṣètò léraléra kù, ṣùgbọ́n
kò mú àwọn ìpapọ̀ tàbí kíkà ipò ẹ̀rọ láàyè kúrò.

| Ohun tí ó wà nínú ìlà | Ìdí tí ó fi wà níbẹ̀ |
|---|---|
| Olùgbàfiṣẹ́ wo ló ni ín | Olùgbàfiṣẹ́ kọ̀ọ̀kan ń yan àwọn ìlà tirẹ̀ nìkan |
| Ìgbésẹ̀: SNMP, script, tàbí olupèsè script | Ó ń pinnu ọ̀nà kóòdù tí yóò ṣiṣẹ́ |
| Orúkọ olupèsè, ẹ̀yà SNMP, ibùdó, àkókò ìparí, àwùjọ tàbí àwọn ẹ̀rí | Àwọn pápá asopọ̀ tí a fi pamọ́; a tún ń ka ipò olupèsè láàyè |
| OID, tàbí gbogbo ìlà àṣẹ script | A ti rọ́pò wọn tẹ́lẹ̀, wọ́n ti ṣetán láti ṣiṣẹ́ |
| Ọ̀nà sí fáìlì RRD | A ti yanjú rẹ̀ tẹ́lẹ̀ |
| Orúkọ pápá nínú fáìlì náà àti iye àwọn pápá tí kíkà pípé ní | Ó ń gba ààyè fún àbájáde láti bá a mu àti láti fọwọ́ sí i |
| Ìgbésẹ̀ (step), àti kíkà sẹ́yìn sí àkókò tí ohun yìí yóò dé lẹ́yìn náà | Wo [Àkókò àti àwọn àkókò](/yo/concepts/time-and-intervals/) |

`cmd.php` ń so `poller_item` mọ́ `host`, ó ń yọ àwọn ẹ̀rọ tí a pa kúrò, ó sì ń lo
àwọn pápá ẹ̀rọ láàyè fún wíwà àti àyẹ̀wò títún atọ́ka ṣe. Àwọn OID tí a fi pamọ́, àwọn
àṣẹ àti metadata RRD ṣì nílò láti bá orísun data tí a fẹ́ mu.

Àwọn ẹ̀rí tí a fi pamọ́ jẹ́ àwòrán àkókò kan, ṣùgbọ́n gbígba àwọn ẹ̀rí tí a yípadà
là nípasẹ̀ API ẹ̀rọ sábà máa ń sọ cache tí ó kan di tuntun. Àtúnṣe tààrà lórí ibi-ìpamọ́
data ń kọjá lẹ́gbẹ̀ẹ́ ọ̀nà yẹn ó sì lè fi àwòrán àkókò kan tí kò bóju mu sílẹ̀. Fọwọ́ sí
cache gidi dípò tí wàá fi rò pé gbogbo àyípadà ẹ̀rí ló nílò títún kọ́ pẹ̀lú ọwọ́.

Ọ̀nà RRD tún jẹ́ àwòrán àkókò kan pẹ̀lú. Gbígbé àwọn fáìlì tàbí yíyí ibi tí àwọn fáìlì wà
padà ń fi gbogbo ìlà tí a fi pamọ́ sílẹ̀ tí ń tọ́ka sí ibi àtijọ́.

## Ohun tí ń kọ ọ́

A ń tọ́jú cache náà ní kọ̀ọ̀kan nípasẹ̀ àwọn iṣẹ́ tí ó mọ̀ pé àwọn yí nǹkan kan padà.

| Iṣẹ́ | Àwọn ìlà tí a tún kọ |
|---|---|
| Gbígba ẹ̀rọ là | Àwọn àtúnṣe sí àwọn pápá asopọ̀, olùgbàfiṣẹ́ tàbí ipò pípa ń fa títì jáde; àwọn pápá ìgbàfiṣẹ́ tí kò yípadà lè lo ọ̀nà gbígbàlà kíákíá |
| Gbígba orísun data là | Àwọn ìlà orísun data yẹn |
| Ṣíṣẹ̀dá àwọn àwòrán àti àwọn orísun data láti inú àwòṣe | Àwọn ìlà tí a ṣẹ̀ṣẹ̀ dá |
| Ṣíṣe ìbéèrè data tí ó gbé tàbí yanjú atọ́ka kan | Àwọn orísun data tí ó yípadà nìkan |
| Títún kọ́ nípasẹ̀ CLI | Àwọn ẹ̀rọ tí a tan tí àwọn òṣìṣẹ́ rẹ̀ ń ṣiṣẹ́ lórí wọn; àbùkù ìfiránṣẹ́ `--host-id` ti ìsinsìnyí ń dènà gbígbẹ́kẹ̀lé ìyapa ẹ̀rọ |

Títún kọ kì í ṣe kíkọ nǹkan sínú rẹ̀ ní fọ́jú. Àwọn ìlà fún àwọn orísun data tí a ń tún
kọ́ ni a kọ́kọ́ ń sàmì sí bí aláìsí, lẹ́yìn náà ni a ń kọ àkójọ tuntun, gbogbo ohun tí ó
ṣì wà ní sísàmì sí bí aláìsí ni a sì ń pa rẹ́. Bẹ́ẹ̀ ni a ṣe ń yọ àwọn ìlà kúrò fún pápá
tí kò sí mọ́. Ìfọ̀mọ́ buffer wà lábẹ́ àkóso àwọn ID olùgbàfiṣẹ́ àti orísun data. Èyí ń dáàbò
bo àwọn orísun tí kò tan mọ́ ọn nínú ọ̀nà tí a fojúsùn; kì í ṣe ìdánilójú lórí títún kọ́
nígbà kan náà tàbí àwọn kíkọ ibi-ìpamọ́ data tí ó kùnà. Fọwọ́ sí àwọn ìlà tí ó jáde
lẹ́yìn títún kọ́, títí kan ẹ̀rọ tí ó wà nítòsí tí kò ní ìpalára nígbà tí o bá ń ṣe ìwádìí.

## Àwọn ìlà tí a kò kọ rí

Àwọn ìṣètò kan kì í gbé ìlà cache tuntun jáde. Yẹ àwọn àkọsílẹ̀ wò pẹ̀lú àwòrán náà.

Olùkọ́ ń fo àwọn ẹ̀rọ tí a pa kúrò, ṣùgbọ́n ìgbésẹ̀ gbogbogbòò **Pa kúrò** ń tọ́jú àwọn
ìlà cache tó wà tẹ́lẹ̀ àti pé ìgbàfiṣẹ́ ń yọ ẹ̀rọ náà kúrò. Títún kọ́ nígbà tí a pa á lè
yọ àwọn ìlà kúrò. Ìgbésẹ̀ gbogbogbòò **Tan-an** ń tún cache tí ó kún lò tàbí ó ń pèsè rẹ̀
nígbà tí ó bá ṣófo; gbígba ẹ̀rọ là ní àfikún kò pọndandan ní gbogbogbòò. Cache tí ó wà
tẹ́lẹ̀ tí kò kún tàbí tí ó ti gbó ṣì nílò ìwádìí.

Ohun SNMP kan tí ẹ̀rọ rẹ̀ kò ní ìṣètò SNMP tó ṣeé lò kì í gbé nǹkan kan jáde. Kò sí ẹ̀yà,
ẹ̀yà tí ó kọjá ààlà, tàbí àwùjọ tí ó ṣófo lórí ẹ̀yà 1 tàbí 2 ń mú kí a fo ìlà náà dípò
kíkọ ọ́ bí ìlà tí yóò máa kùnà ní gbogbo àyíká.

Nígbà tí a bá ṣètò àkójọ àwọn ìtẹ̀wọlé tí a gbà láyè, fáìlì tí ó sonù tàbí ìtẹ̀wọlé tí a kọ̀
ń dènà àwọn ìlà tuntun fún ìtẹ̀wọlé yẹn. Títún kọ́ tí a fọwọ́ sí ṣì ń nu àwọn ìlà rẹ̀ tí
ó ti gbó kúrò. Láìsí ìṣètò `input_whitelist`, àyẹ̀wò yìí ń gba àwọn ìtẹ̀wọlé láyè; kì í ṣe
ààbò tí ó wà ní títàn ní gbogbo ìgbà. Ṣàtúnyẹ̀wò àṣẹ tí a kọ̀ àti ìlànà tí a ṣètò kí o tó
yí àkójọ ààyè padà.

Interface ṣì lè fi orísun data kan hàn tí cache rẹ̀ ṣófo. Àwòrán rẹ̀ lè pa ìtàn àtijọ́ mọ́
tàbí kí ó fi àwọn àlàfo hàn; ìlà òfo pẹẹrẹ kì í ṣe àmì tó ṣeé gbẹ́kẹ̀lé. Àwọn ẹ̀rí tí ó sonù
àti àwọn ìtẹ̀wọlé tí a kọ̀ jẹ́ àwọn ipò ìṣètò tí a gbọ́dọ̀ yanjú.

## Ìdí tí àtúnṣe kan fi lè dà bí ẹni pé kò ṣe nǹkan kan

Àwọn ọ̀nà mẹ́ta ọ̀tọ̀ọ̀tọ̀ ń mú àmì kan náà jáde.

**A kò tún ìlà náà kọ́.** O yí nǹkan kan padà tí interface kò ka sí ohun tí ó kan
ìgbàfiṣẹ́, tàbí o yí i padà ní ẹ̀yìn interface. Cache ṣì mú ìdáhùn àtijọ́ dání. Títún kọ́
lè sọ àwọn pápá tí a fi pamọ́ di tuntun lẹ́yìn tí a ti fọwọ́ sí ìṣètò tí a fẹ́.

**A kò kọ́ ìlà náà rí.** A ti sọ̀rọ̀ nípa rẹ̀ lókè. Títún kọ́ ń yanjú èyí pẹ̀lú, ṣùgbọ́n
lẹ́yìn tí a bá ti ṣe àtúnṣe ohun tó fà á nìkan; àwọn àmì ìwádìí sábà máa ń hàn nínú àwọn
àkọsílẹ̀ dípò kí wọ́n hàn lórí àwòrán náà.

**A gba iye náà lẹ́yìn náà a sọ ọ́ nù.** A ń to àbájáde oníye-púpọ̀ nípasẹ̀ àwọn ìtumọ̀
pápá àwòṣe, a sì lè fo àwọn pápá tí a kò tọ́ka sí nígbà tí a ń ṣàyẹ̀wò. Yẹ àwọn orúkọ pápá
tí a ń retí, àwọn ìbámu àti àwọn àjọṣepọ̀ àwòrán wò; òfin yìí kì í ṣe ìsọnù gbogbogbòò fún
gbogbo àwọn àpẹẹrẹ nọ́mbà láìsí ìtọ́kasí àwòrán. Títún cache kọ́ kò lè tún àdéhùn àbájáde
tí kò tọ́ ṣe.

## Ohun èlò tí kò mú

Fún ẹ̀rọ kan ṣoṣo, lo **Tún Cache ti Poller Kún** lórí ojú-ewé ẹ̀rọ àtijọ́ rẹ̀. Ìgbésẹ̀
yẹn ń pe ọ̀nà `push_out_host()` tí ó mọ nípa ẹ̀rọ náà. Yẹ àwọn ìlà àti àwọn àmì ìwádìí
tí ó jáde lẹ́yìn náà wò.

Script àkọ́kọ́ ti ìsinsìnyí `rebuild_poller_cache.php` ń gba `--host-id`, ṣùgbọ́n kò fi
àlẹ̀mọ́ yẹn ránṣẹ́ sí àṣẹ òṣìṣẹ́ rẹ̀. Nítorí náà, títún kọ́ nípasẹ̀ CLI fún ẹ̀rọ kan ṣoṣo
lè tún àwọn ẹ̀rọ mìíràn tí ó wà ní títàn kọ́ pẹ̀lú. Má ṣe gbẹ́kẹ̀lé àṣàyàn yẹn fún ìyapa
títí tí a ó fi tún àbùkù ìṣàfilọ́lẹ̀ yìí ṣe.

Títún kọ́ gbogbogbòò nípasẹ̀ CLI wà láti gbòǹgbò ìṣàfilọ́lẹ̀, tí a ń ṣe bí olùlo poller:

```bash
php cli/rebuild_poller_cache.php
```

Ó ń ṣe iṣẹ́ lórí àwọn ẹ̀rọ tí a tan; kì í ṣe àtúnṣe fún gbogbo orísun tí kò ní olupèsè
tàbí tí a pa. Èyí ń kọ sínú àwọn tábìlì ìgbàfiṣẹ́ ó sì lè gba àkókò. Yẹra fún àwọn títún kọ́
tí ń wọ ara wọn lẹ́nu kí o má sì dá a dúró. Àṣàyàn `--force` ti CLI ń borí ààbò ìforúkọsílẹ̀
iṣẹ́ rẹ̀, nítorí náà kì í ṣe àṣàyàn àtúnṣe déédéé.

Títún kọ́ ń sọ ipò tí a mú jáde di tuntun; kò ní tún àǹfààní láti dé ọ̀dọ̀ ẹ̀rọ ṣe, kò ní gbé
àwọn fáìlì RRD, kò ní tún àwọn àṣẹ ìtẹ̀wọlé tí a kọ̀ ṣe, tàbí gba ìtàn tí ó sonù padà.
Ṣàyẹ̀wò cache tí ó jáde, àwọn àkọsílẹ̀ àti ìgbàfiṣẹ́ lẹ́yìn náà kí o tó ka àtúnṣe náà sí èyí
tí ó parí.

Kadupul ń kọ àkókò tí cache yípadà kẹ́yìn sílẹ̀, èyí tí ó ń jẹ́ kí àwọn ẹ̀yà mìíràn ti
ètò mọ̀ pé wọ́n nílò láti tún un ka.

## Ọ̀pọ̀lọpọ̀ àwọn olùgbàfiṣẹ́

Pẹ̀lú ju olùgbàfiṣẹ́ kan lọ, ìlà kọ̀ọ̀kan jẹ́ ti ọ̀kan nínú wọn ní pàtó, a sì ń ti àwọn
ìlà náà sí ibi-ìpamọ́ data ti olùgbàfiṣẹ́ yẹn àti ti àárín gbùngbùn pẹ̀lú.

Tí olùgbàfiṣẹ́ tí ó jìnà kò bá ṣeé dé nígbà tí o bá gba àtúnṣe là, àtúnṣe náà ń balẹ̀
sí àárín gbùngbùn kì í ṣe ní òkèèrè, Kadupul sì ń sọ bẹ́ẹ̀: ó ń béèrè fún ìṣiṣẹpọ̀ kíkún
ní gbàrà tí olùgbàfiṣẹ́ bá padà dé. Títí di ìṣiṣẹpọ̀ yẹn, olùgbàfiṣẹ́ tí ó jìnà ń lo àkójọ
iṣẹ́ àtijọ́ ju èyí tí interface ń fi hàn ọ́ lọ. Ìyàtọ̀ pàtó ti olùgbàfiṣẹ́ kan jẹ́ ìdí láti
ṣàyẹ̀wò ipò ẹ̀dà, asopọ̀ àti cache abẹ́lé ti olùgbàfiṣẹ́ kọ̀ọ̀kan.

Ètò nínú àyíká kíkún, títí kan ibi tí a ti ń ka cache àti ìgbà tí a ń lo àwọn àṣẹ títún
atọ́ka ṣe, wà nínú [Àkókò Ìwàláàyè Poller](/yo/reference/poller-lifecycle/). Fún títobi
àwọn olùgbàfiṣẹ́, wo [Mú poller gbòòrò](/yo/guides/scale-the-poller/).
