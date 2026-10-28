---
title: Mú RRD tí ó bàjẹ́ bọ̀sípò
description: Bí a ṣe lè mọ ìyàtọ̀ láàárín àkójọ ìpamọ́ round-robin tí ó bàjẹ́ àti èyí tí a ṣètò ní àṣìṣe, bí a ṣe lè ṣàyẹ̀wò fáìlì kan, bí dump àti restore ṣe ń tún un ṣe, àti irú ìtàn tí o lè tọ́jú nígbà tí a bá gbọ́dọ̀ tún fáìlì náà kọ́.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 25
---

:::caution[Ṣàyẹ̀wò rẹ̀ kí o tó lò ó]
Kóòdù orísun wà ní àrọ́wọ́tó, ṣùgbọ́n kò sí ẹ̀dà Kadupul tí a tì lẹ́yìn tàbí ipa-ọ̀nà ìṣípòpadà. Dán àwọn ìlànà wọ̀nyí wò lórí ẹ̀dà tí a yà sọ́tọ̀ pẹ̀lú àwọn àpamọ́ détà kí o tó gbẹ́kẹ̀lé wọn. Wo [ipò iṣẹ́ àkànṣe](/yo/project/status/).
:::

Ìbàjẹ́ fáìlì tòótọ́ kì í sábà ṣẹlẹ̀. Ọ̀pọ̀lọpọ̀ àwọn fáìlì tí a ròyìn pé wọ́n bàjẹ́ wà ní pípé ṣùgbọ́n wọn kò bára mu pẹ̀lú ibùdó dátà, tàbí poller kò lè kọ sí wọn, tàbí wọ́n dẹ́kun gbígbà àwọn iye nítorí ìdí tí kò ní nǹkan kan ṣe pẹ̀lú fáìlì náà. Mọ èwo nínú àwọn wọ̀nyí ni o ní kí o tó fọwọ́ kàn ohunkóhun, nítorí àtúnṣe fún ọ̀kan ń mú kí àwọn yòókù burú sí i.

:::danger[Dáàbò bo àkọ́kọ́ náà]
**Da fáìlì náà kọ ṣáájú gbogbo àtúnṣe lórí ojú-ewé yìí.** Mú padà bọ̀sípò sínú ẹ̀dà àyẹ̀wò ọ̀tọ̀ kí o sì ṣàyẹ̀wò rẹ̀ kí o tó rọ́pò fáìlì tí ń ṣiṣẹ́ lọ́wọ́. Mímú àkójọ ìpamọ́ kéré tàbí píparẹ́ ọ̀kan ń sọ ìtàn tí a tọ́jú nù. Yíyí iye tó ga jù padà ń ní ipa lórí ìmúdájú àwọn ìwọlé tí ń bọ̀; kò pa àwọn àpẹẹrẹ tí a tọ́jú rẹ́ lẹ́yìn náà. Kò sí àtúnsọ (undo) aládàáṣiṣẹ́ nínú RRD.
:::

## 1. Dárúkọ ìkùnà náà

| Ohun tí o rí | Ohun tí ó túmọ̀ sí sábà | Lọ sí |
|---|---|---|
| Àwòrán ya àṣìṣe dípò àwòrán | Fáìlì náà kò sí, kò ṣeé kà, tàbí a kò lè kọ sí àpò náà | Ìgbésẹ̀ 2 |
| Àwòrán ṣófo ṣùgbọ́n kò sí àṣìṣe | Kò sí àwọn iye tí a lè lò nínú àkókò tí a yàn, tàbí ìṣòro ìtumọ̀ àwòrán | [Túbọ̀ wá àwọn ìṣòro dátà tí ó sọnù](/yo/guides/troubleshoot-missing-data/) |
| Àwòrán dúró ní àkókò kan pàtó tí kò sì bẹ̀rẹ̀ mọ́ | Poller, àwọn àṣẹ, tàbí heartbeat | Ìgbésẹ̀ 3 |
| Àwòrán ní dátà ṣùgbọ́n àgbékalẹ̀ rẹ̀ yípadà láìsí àyípadà ìṣètò | Fáìlì àti ibùdó dátà kò gbà pẹ̀lú ara wọn | Ìgbésẹ̀ 4 |
| Àwọn iye tí a tọ́jú gbogbo jẹ́ aláìlémọ̀ (unknown) | Ìkójọpọ̀, àkókò, àwọn ààlà tàbí ìṣètò orísun dátà nílò àyẹ̀wò | [Túbọ̀ wá àwọn ìṣòro dátà tí ó sọnù](/yo/guides/troubleshoot-missing-data/) |
| `rrdtool` kọ̀ láti ka fáìlì náà | Ipa-ọ̀nà tí kò sí, ìkùnà láti wọlé, àkópọ̀ tí kò bá a mu tàbí ìbàjẹ́ | Ìgbésẹ̀ 2 àti 3, lẹ́yìn náà 5 |

Kadupul ń sọ ọ̀ràn àkọ́kọ́ di ìfiránṣẹ́ tí a lè kà dípò àwòrán tí ó bàjẹ́, tí ń ya àpò tí kò lè kọ sí sọ́tọ̀ kúrò nínú fáìlì tí kò lè kọ sí, tí ó sì ń ròyìn fáìlì tí kò sí gẹ́gẹ́ bí poller tí kò tíì ṣiṣẹ́ bóyá. Ìfiránṣẹ́ yẹn jẹ́ àbá, kì í ṣe àyẹ̀wò ìparí: píparẹ́, ipa-ọ̀nà tí a yípadà tàbí ìmúbọ̀sípò tí kò péye tún lè fi sílẹ̀ láìsí.

## 2. Ṣàyẹ̀wò fáìlì náà

Àwọn ìwòran méjì wà lórí ojú-ewé orísun dátà fúnra rẹ̀, tí a ń tàn fún ìgbìmọ̀ kọ̀ọ̀kan. Ìwòran debug ń tẹ àṣẹ `rrdtool create` jáde tí Kadupul yóò ti gbé kalẹ̀ fún orísun dátà yìí lónìí. Ìwòran info ni èyí tí ó ṣe pàtàkì níhìn-ín: ó ń ka fáìlì náà pẹ̀lú `rrdtool info`, ó ń ka ìtumọ̀ orísun dátà láti inú ibùdó dátà, ó sì ń tẹ àwọn ìyàtọ̀ jáde. Níbi tí a ti lè mú ìyàtọ̀ kúrò láìsí àtúnkọ́, ó ń tẹ àṣẹ `rrdtool tune` tàbí `rrdtool resize` jáde tí yóò ṣe bẹ́ẹ̀, gẹ́gẹ́ bí ọ̀rọ̀ láti ṣiṣẹ́ dípò kí ó ṣe é fúnra rẹ̀.

Láti inú shell, ìgbésẹ̀ àkọ́kọ́ kan náà:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Orí rẹ̀ ń pèsè step, àkókò àtúnṣe ìkẹyìn, gbogbo orúkọ orísun dátà pẹ̀lú irú rẹ̀, heartbeat, kéré jù àti pọ̀ jù, àti gbogbo àkójọ ìpamọ́ pẹ̀lú iṣẹ́ ìpapọ̀ rẹ̀, iye ìlà àti ìpinnu. Bí àṣẹ yìí bá mú àṣìṣe wá, tọ́jú àṣìṣe náà kí o sì ṣàyẹ̀wò ipa-ọ̀nà, àwọn àṣẹ àti ìbáramu RRDtool kí o tó fìdí ìbàjẹ́ múlẹ̀. `info` tí ó ṣàṣeyọrí ń ka dátà àpèjúwe nìkan; tún ṣàyẹ̀wò àbájáde `fetch` kí o sì dán dump wò láti ṣàyẹ̀wò ìtàn náà.

## 3. Kọ́kọ́ ṣàyẹ̀wò àwọn okùnfà ẹ̀rọ

| Àyẹ̀wò | Ìdí tí ó fi ń wá ṣáájú àtúnṣe |
|---|---|
| Ìní fáìlì àti àwọn àṣẹ | Fáìlì tí root dá nígbà àtúnṣe kò ṣeé kọ sí nípa poller láti àkókò yẹn lọ |
| Ìní àpò àti àwọn àṣẹ | Poller kò lè dá fáìlì ìrọ́pò sí inú àpò tí kò lè kọ sí |
| Ààyè ọ̀fẹ́ àti inodes | Ètò fáìlì tí ó kún ń mú àwọn ìkọ̀wé kékèké jáde tí ó dàbí ìbàjẹ́ |
| Bóyá olùkọ̀wé kejì wà | Àwọn àtúnṣe lẹ́ẹ̀kan náà tàbí láìsí ètò lè kùnà tàbí sọ àwòrán àtúnṣe di asán; ṣàyẹ̀wò logs |

Ṣe àtúnṣe gẹ́gẹ́ bí àkántì tí ó ni tí ó sì ń sọ RRD dọ̀tun, kí o sì dáàbò bo àṣẹ rẹ̀, olówó àti ẹgbẹ́ rẹ̀. Dá gbogbo àwọn olùkọ̀wé dúró kí o tó da àwọn fáìlì kọ tàbí rọ́pò wọn, pẹ̀lú àwọn agbowó dátà jíjìnnà, àwọn iṣẹ́ tí a ṣètò àti àtúnṣe ọwọ́. Da àwọn ìkọ̀wé tí ń dúró jáde lẹ́yìn tí àwọn olùpèsè wọn bá ti dúró nìkan. Àwọn àṣẹ shell lásán kì í gba àwọn àgbelebu ìpamọ́ Kadupul. Wo [àwọn ohun tí a nílò fún ìpamọ́](/yo/reference/requirements/) àti ìlànà ìdákẹ́jẹ́ nínú [Ìfipamọ́ àti ìmúbọ̀sípò](/yo/guides/back-up-and-restore/).

## 4. Ka ohun tí olùṣàyẹ̀wò ti rí tẹ́lẹ̀

Kadupul lè ṣàyẹ̀wò àwọn orísun dátà tí a so mọ́ àwòrán lórí àwọn ẹ̀rọ tí a tàn lórí ètò àkókò kí ó sì kọ ohun tí ó rí sílẹ̀; èyí kì í ṣe kíkà gbogbo fáìlì lórí disk. Ó wà ní pípa ní àkọ́kọ́ṣe. Ojú-ètò náà ń sọ ibi tí a ti lè tàn án: Configuration -> Settings -> Data.

| Ìṣètò | Àkọ́kọ́ṣe | Ipá |
|---|---|---|
| Enable RRDfile Check | Pípa | Kò sí ohun tí a óò yẹ̀wò títí tí a ó fi to èyí |
| Check Frequency | Wákàtí 4 | Ó tún ń pèsè wákàtí 1, wákàtí 24, tàbí ṣíṣiṣẹ́ lẹ́yìn gbogbo ìgbì boost |
| Number of RRDfile Check Processes | Ìlànà 1 | Pín àtòjọ fáìlì kọjá àwọn òṣìṣẹ́ lẹ́ẹ̀kan náà |
| RRDChecker Timeout | Wákàtí 1 | A máa ń pa iṣẹ́ náà lẹ́yìn èyí |

Àwọn àbájáde ń kórajọ sínú àtòjọ pẹ̀lú ẹ̀rọ, orísun dátà, ID orísun dátà inú, ìfiránṣẹ́, àti ọjọ́. O lè ṣe asẹ́ nípa ọjọ́-orí kí o sì wá ọ̀rọ̀, o sì lè gbá àtòjọ náà nù ní kété tí o bá ti gbé ìgbésẹ̀ lórí rẹ̀.

Àwọn ìfiránṣẹ́ tí ó lè kọ sílẹ̀, àti ohun tí ọ̀kọ̀ọ̀kan túmọ̀ sí:

| Ìfiránṣẹ́ | Ìtumọ̀ |
|---|---|
| RRDfile does not exist | A kò dá fáìlì náà rí, a ti gbé e tàbí pa á rẹ́, tàbí ipa-ọ̀nà tí a ṣètò ti yípadà |
| RRDfile is not writable | Olùlò poller kò lè kọ sínú fáìlì náà |
| RRDfile modify time older than hour | Kò sí ohun tí a ti kọ fún ó kéré tán wákàtí kan |
| Last update value in RRDfile is older than 1 hour | Àmì àtúnṣe ìkẹyìn ti fáìlì fúnra rẹ̀ ti gbó, èyí tí ó jẹ́ ẹ̀rí lílágbára ju àkókò àtúnṣe lọ |
| The RRDfile step does not match the Data Source Profile step | A dá fáìlì náà lábẹ́ àkókò ọ̀tọ̀ |
| There are more, or less, Data Sources in the database than in the RRDfile | Àwòṣe náà rí tàbí pàdánù àwọn pápá lẹ́yìn tí a dá fáìlì náà |
| The Data Source '...' exists in RRDfile, but not in database | Ń dárúkọ pápá náà, láti ẹ̀gbẹ́ fáìlì náà |
| Data Source name '...' exists in the Database, but not in RRDfile | Ń dárúkọ pápá tí poller ń kọ tí kò ní ilé nínú fáìlì náà |
| The RRDfile Minimal Heart... is lower than polling interval | Olùṣàyẹ̀wò ń fi àmì sí heartbeat tí ó kéré ju tàbí dọ́gba pẹ̀lú àkókò ìbò; àwọn àpẹẹrẹ tí ó pẹ́ lè di aláìlémọ̀ |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Heartbeat fáìlì náà wà lábẹ́ heartbeat profaili; àyẹ̀wò yìí kì í fi àmì sí èyí tí ó tóbi |
| Stale values for last 24 hours, or last hour | Gbogbo àpẹẹrẹ tí a kà padà nínú fèrèsé yẹn jẹ́ aláìlémọ̀ (unknown) |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Ìkùnà ìkójọpọ̀ apá kan |
| No data returned, maybe corrupted Data Source | Gbígbà dátà láti inú fáìlì kò mú nǹkankan padà wá rárá |

Àyẹ̀wò náà ń tún step àti heartbeat tí a kọ sílẹ̀ ti ibùdó dátà ṣe láti bá profaili mu bí ó ṣe ń lọ, èyí tí ń yanjú àríyànjiyàn láàárín profaili àti àwọn ìlà orísun dátà ṣùgbọ́n kò fọwọ́ kàn fáìlì náà. Àwọn àìbáramu iye láàárín fáìlì àti ibùdó dátà ni a máa ń ròyìn dípò kíkọ́ wọn, nítorí ẹ̀gbẹ́ méjèèjì lè jẹ́ èyí tí kò tọ́.

## 5. Dump, ṣàtúnṣe, mú bọ̀sípò

RRDtool lè sọ fáìlì tí a lè kà di XML kí ó sì tún fáìlì àyẹ̀wò kọ́ láti inú rẹ̀. Èyí lè ran lọ́wọ́ pẹ̀lú àìbáramu ètò tí a mọ̀, ṣùgbọ́n kò lè tún àwọn àpẹẹrẹ tí ó sọnù kọ́ tàbí fún wa ní ìdánilójú pé a lè ka fáìlì tí ó bàjẹ́. Kadupul tún ń lo àwọn olùrànlọ́wọ́ dump/restore fún àwọn àyípadà ètò. Olùrànlọ́wọ́ ìmúbọ̀sípò agbègbè ń kọ́ fáìlì arákùnrin ìgbà díẹ̀ ó sì ń tún un lórúkọ lórí ibùdó náà lẹ́yìn àṣeyọrí; èyí kì í pèsè àpamọ́.

Pẹ̀lú dídá àwọn olùkọ̀wé dúró, ṣe èyí gẹ́gẹ́ bí olówó RRD. Rọ́pò ipa-ọ̀nà àpẹẹrẹ pẹ̀lú ipa-ọ̀nà orísun dátà gidi. A dá àpò iṣẹ́ àdáni sí lẹ́gbẹ̀ẹ́ orísun kí àyẹ̀wò náà lè wà lórí ètò fáìlì kan náà:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Yan àkókò fetch àti iṣẹ́ ìpapọ̀ tí ó ní dátà tí a tọ́jú tí a mọ̀ nínú; wákàtí tí ó kọjá jẹ́ àpẹẹrẹ lásán. Fi orúkọ orísun dátà orísun àti ti àyẹ̀wò, step, àwọn àkójọ ìpamọ́, àmì àkókò àtúnṣe ìkẹyìn àti àwọn iye àpẹẹrẹ wéra. Dump/restore tí kò yípadà lè yí àgbékalẹ̀ binary padà, nítorí náà fi àwọn iye wéra dípò kíkọ́ pé hash fáìlì gbọ́dọ̀ jọra.

Tọ́jú ẹ̀dà àkọ́kọ́ náà. Lẹ́yìn ìmúdájú nìkan, mú àṣẹ tí a nílò ti àyẹ̀wò padà bọ̀sípò, olówó àti ẹgbẹ́ rẹ̀ kí o sì tún un lórúkọ sí ipa-ọ̀nà tí ń ṣiṣẹ́ nígbà tí àwọn olùkọ̀wé bá ṣì wà ní dídúró. Fìdí rẹ̀ múlẹ̀ pé àkántì poller lè kà á kí ó sì sọ ọ́ dọ̀tun kí o tó bẹ̀rẹ̀ ìkójọpọ̀ lẹ́ẹ̀kan sí i. Àpẹẹrẹ yìí dúró ṣáájú fífisílẹ̀ kí a má bàa fi àyẹ̀wò tí a lè kà ṣùgbọ́n tí kò tọ́ sílẹ̀.

Àwọn fáìlì XML àti ti àyẹ̀wò nílò àfikún ààyè disk. Dump tí ó kùnà lè fi XML apá kan sílẹ̀; má ṣe mú un bọ̀sípò láé. Ṣàyẹ̀wò àṣẹ, ààyè ọ̀fẹ́ àti àṣìṣe tí a ròyìn. Bí a kò bá lè da àkọ́kọ́ náà jáde lẹ́yìn àwọn àyẹ̀wò yẹn, mú àpamọ́ tí a mọ̀ pé ó dára bọ̀sípò dípò rẹ̀. [`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) ti RRDtool ń gba láàyè láti kọ lórí ibùdó náà tààràtà; àpẹẹrẹ tí a gbé kalẹ̀ mọ̀ọ́mọ̀ lo ibùdó tuntun.

## 6. Ohun tí ó ń yè, àti ohun tí kò yè

| Ìbàjẹ́ | Ìtàn tí a lè mú bọ̀sípò |
|---|---|
| Fáìlì kò ṣeé kọ sí, ṣùgbọ́n ó wà ní pípé | Ìtàn tí a tọ́jú ń yè. Àwọn àtúnṣe tí ó fò kì í padà wá nípa títún àwọn àṣẹ ṣe nìkan |
| Heartbeat, kéré jù tàbí pọ̀ jù kò tọ́ | Bẹ́ẹ̀ni. `rrdtool tune` ń yí orí rẹ̀ padà láìfọwọ́kan àwọn iye tí a tọ́jú |
| Step kò tọ́ | Nílò ìyípadà tí a fọwọ́sí ní pàtó; yíyí profaili ibùdó dátà padà nìkan kì í yí fáìlì náà padà |
| Orísun dátà kò sí nínú fáìlì náà | Àwọn pápá tí ó wà ń tọ́jú ìtàn wọn. Pápá tuntun náà ń bẹ̀rẹ̀ ní òfìfo |
| A pa àkójọ ìpamọ́ rẹ́ tàbí a kò dá a rí | Rárá. Ìpinnu tí a kò tọ́jú rí kò lè ṣeé tún kọ́ |
| Àwọn ìlà àkójọ ìpamọ́ dínkù nípa àtúnṣe ìwọ̀n tí ń dínkù | Rárá. Àwọn ìlà tí a sọ nù ti lọ ní àkókò tí àṣẹ náà ń ṣiṣẹ́ |
| Fáìlì tí a ké kúrò, dump kùnà | Rárá. Mú bọ̀sípò láti inú àpamọ́ |
| Orí wà ní pípé, ìpẹ̀kun ti ké kúrò | Má ṣe rò pé orí tí a lè kà túmọ̀ sí dump tí ó péye; lo àpamọ́ tí a fọwọ́sí bí dump bá kùnà |

Yíyí àkókò poller padà tàbí gbígbé orísun dátà lọ sí profaili ìtọ́jú mìíràn kì í tún àwọn fáìlì tí ó wà ṣe lákòókò kan náà. RRDtool tún ń fi [àwọn iṣẹ́ ètò ti `tune`](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) hàn, pẹ̀lú àṣàyàn step; fìdí ìhùwàsí ìyípadà múlẹ̀ fún ẹ̀dà tí o fi sílẹ̀ àti àgbékalẹ̀ àkójọ ìpamọ́ dípò ríro pé àyípadà àkókò kò ní ní àdánù. Wo [Àwọn orísun dátà àti àkójọ ìpamọ́](/yo/concepts/data-sources-and-rras/) àti [Ṣàkóso ìtọ́jú dátà](/yo/guides/manage-data-retention/). Gbígbé iye tó ga jù sókè pẹ̀lú `tune` wà ní ààbò; mímú ọ̀kan wálẹ̀ ń kọ gbogbo iye tí ń bọ̀ lẹ́yìn náà tí ó ju ààlà tuntun lọ sí aláìlémọ̀.

## 7. Tún un kọ́ nígbà tí o ń tọ́jú ohun tí a lè tọ́jú

Kadupul ń pèsè irinṣẹ́ splice tí ó lè fi dátà kún fáìlì tuntun láti inú èyí tí ó ti gbó tí a lè kà. Wo àbájáde rẹ̀ bí àyẹ̀wò: ó lè kún àwọn àlàfo kí ó sì rọ́pò àwọn odo gidi, nítorí náà kì í ṣe ẹ̀dà tí kò ní àdánù ti ìtàn tí a wọ̀n. Ṣe é láti inú gbòǹgbò ètò lórí agbowó dátà àkọ́kọ́, ní lílo àwọn ẹ̀dà tí a yà sọ́tọ̀ nínú àwọn àpò tí a gbẹ́kẹ̀lé tí a lè kọ sí.

Dá `new.rrd` sílẹ̀ pẹ̀lú àgbékalẹ̀ tí a fẹ́ nínú àpò iṣẹ́ àdáni `$work` láti ìgbésẹ̀ 5, lẹ́yìn náà wo àkọ́kọ́ṣe ìsopọ̀ náà:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Àwọn fáìlì ìwọlé méjèèjì gbọ́dọ̀ ti wà tẹ́lẹ̀ kí wọ́n sì kọjá àwọn àyẹ̀wò ìkọ̀wé ti irinṣẹ́ náà. Fáìlì tuntun náà ń pèsè àgbékalẹ̀ náà. Láìsí `--finrrd`, àbájáde náà jẹ́ ipa-ọ̀nà fáìlì tuntun náà pẹ̀lú `.new`; lo ipa-ọ̀nà àbájáde tuntun tí ó ṣe kedere láti yẹra fún rírọ́pò àyẹ̀wò tẹ́lẹ̀. `--dryrun` ń ṣàyẹ̀wò ó sì ń so pọ̀ ní lílo XML ìgbà díẹ̀ àti ìpamọ́ SQLite (nígbà tí ó bá wà), ṣùgbọ́n ó ń fò ìmúbọ̀sípò RRD ìkẹyìn dá. Kò fìdí rẹ̀ múlẹ̀ pé ìmúbọ̀sípò ìkẹyìn yóò ṣàṣeyọrí. Yọ `--dryrun` kúrò láti mú àyẹ̀wò ọ̀tọ̀ náà jáde. Yẹra fún `--owner` nígbà àkọ́kọ́ṣe kí o sì ṣe é gẹ́gẹ́ bí àkántì iṣẹ́ tí a nílò; ṣàyẹ̀wò ìní tòótọ́ ti àbájáde náà kí o tó fi sílẹ̀.

:::caution[Ìsopọ̀ splice ń kà odo sí àlàfo]
Ìpapọ̀ náà ń la fáìlì tuntun já, fún gbogbo àyè tí ó ní aláìlémọ̀ (unknown) **tàbí odo (zero)**, ó máa ń wá iye tí ó bá a mu tímọ́tímọ́ nínú fáìlì àtijọ́ ó sì ń kọ ọ́ dípò rẹ̀. Nítorí náà, odo gidi nínú fáìlì tuntun ni a fi dátà àtijọ́ rọ́pò. Lórí ohunkóhun tí ó ń ka odo ní tòótọ́ fún àkókò pípẹ́, ibùdó tí kò ṣiṣẹ́, ìlà tí ó di òfìfo, counter tí ó sinmi, ṣàyẹ̀wò àbájáde kí o tó fi sí ààyè rẹ̀. Àwọn aláìlémọ̀ ti fáìlì àtijọ́ náà tún ni a fi àwọn iye tí ó ṣáájú kún, nítorí náà àbájáde tí a sopọ̀ lè ṣẹ̀dá ìtẹ̀síwájú lórí dátà tí ó sọnù.
:::

Lẹ́yìn ìsopọ̀ náà, fi fáìlì náà sí ibi tí orísun dátà ń retí rẹ̀, pẹ̀lú ìní tí poller nílò, kí o sì ṣàyẹ̀wò pé àwòrán náà ń ya dáadáa.

## 8. Kíkún àwọn àlàfo, àti ìdí tí a fi gbọ́dọ̀ ronú lẹ́ẹ̀mejì

| Irinṣẹ́ | Ohun tí ó ń kọ |
|---|---|
| `cli/batchgapfix.php` | Ń kún àkókò ọjọ́ kọjá àwọn ẹ̀rọ púpọ̀ lẹ́ẹ̀kan náà, ní lílo iye tí a mọ̀ kẹ́yìn tàbí ìwọ̀n |
| `cli/float_rrdfiles.php` | Ń gbé àkókò kan léfòó nínú àwọn àwòrán tí a yàn nípa ipa-ọ̀nà dump àti restore kan náà |

Àwọn méjèèjì ń ṣẹ̀dá àwọn ìwọ̀n àìgidi. Kò sí ohun tí a kó jọ ní àwọn àkókò yẹn, lẹ́yìn náà kò sì sí ohun tí ó wà nínú fáìlì tí ń ya àwọn iye tí a ṣẹ̀dá kúrò nínú àwọn gidi. Lò wọ́n nígbà tí o bá mọ̀ pé àlàfo náà kì í ṣe ìkùnà ètò: poller dúró fún àtúnṣe, fèrèsé ìṣípòpadà. Má ṣe lò wọ́n láé lórí ohunkóhun tí ń bọ́ ìṣirò ààyè tàbí ti owó sísan. Ìkìlọ̀ kan náà wà fún [yíyọ spikes](/yo/guides/remove-spikes-from-data/).

## 9. Ṣíṣe àtúnṣe aládàáṣiṣẹ́ ti orísun dátà kan

Fún orísun dátà kan tí ń hùwà lẹ́tọ̀ọ́, Kadupul lè ṣe àyẹ̀wò debug kọjá àwọn àkókò ìbò díẹ̀ tí ń bọ̀ kí ó sì fún wa ní ìdájọ́: bóyá fáìlì náà wà, bóyá òun àti àpò rẹ̀ ṣeé kọ sí, àkántì wo ló ni ín ní ìfiwéra pẹ̀lú àkántì tí poller ń lò, bóyá orísun dátà náà ń ṣiṣẹ́, bóyá fáìlì náà bá ìtumọ̀ orísun dátà mu, bóyá àtúnṣe ìkẹyìn sún lẹ́yìn ìbò, àti bóyá a lè lo àwọn iye náà. Ìgbésẹ̀ àtúnṣe rẹ̀ kéré. Ó ń ṣe àwọn àbá `rrdtool tune` tí ìfiwéra náà gbé jáde kò sì ṣe nǹkan mìíràn, ó ń kọ̀ ó sì ń kọ ìdí tí àtòjọ bá ṣófo tàbí tí a kò bá lè kọ sí fáìlì náà. Kì í tún àwọn fáìlì dá, kì í fi àwọn orísun dátà kún, bẹ́ẹ̀ sì ni kì í yí àwọn àkójọ ìpamọ́ padà.

## 10. Píparẹ́ jẹ́ ewu ọ̀tọ̀

Kadupul ń tọpinpin àwọn fáìlì àkójọ ìpamọ́ tí orísun dátà wọn kò sí mọ́ ó sì ń pèsè láti yọ wọ́n kúrò. A tún lè to èyí sí aládàáṣiṣẹ́ nígbà tí a bá pa orísun dátà rẹ́, pẹ̀lú àwọn ọ̀nà méjì: píparẹ́ (delete), tàbí gbígbé e lọ sí àpò àpamọ́ (archive).

:::danger[Píparẹ́ jẹ́ ti títí láé]
Ọ̀nà píparẹ́ (delete) ń yọ fáìlì náà kúrò lórí disk pátápátá. Kò sí ìgbésẹ̀ àpò ìdọ̀tí (recycle) bẹ́ẹ̀ sì ni dátà náà kò sí nínú ibùdó dátà. Bí o kò bá ní ìdánilójú pé gbogbo fáìlì tí a tò jẹ́ ọmọ òrukàn nítòótọ́, to ọ̀nà náà sí archive, èyí tí yóò gbé àwọn fáìlì lọ sí àpò tí o yàn, kí o sì fi ọwọ́ gbá àpò náà mọ́ lẹ́yìn náà.
:::

Fáìlì kan lè dàbí ọmọ òrukàn láìjẹ́ bẹ́ẹ̀ nítòótọ́. Orísun dátà tí a gbé lọ sí ipa-ọ̀nà tuntun, ìmúbọ̀sípò tí a ṣe ní apá kan, tàbí ẹ̀rọ tí a tún kọ́ lábẹ́ ID tuntun gbogbo ń fi àwọn fáìlì sílẹ̀ tí kò sí ohun tí ń tọ́ka sí wọn. Ṣàyẹ̀wò àtòjọ náà pẹ̀lú àkọsílẹ̀ ti ara rẹ nípa ohun tí ó yípadà kọ́kọ́.

## Àwọn ipò ìkùnà

| Àmì | Okùnfà |
|---|---|
| Àtúnṣe ṣàṣeyọrí, àwòrán ṣì ṣófo | Ṣàyẹ̀wò àwọn àṣẹ, àkókò tí a yàn, ìkójọpọ̀ dátà àti ìtumọ̀ àwòrán |
| `rrdtool dump` ń mú àṣìṣe wá lórí fáìlì náà | Ṣàyẹ̀wò ipa-ọ̀nà, àṣẹ, ìpamọ́ àti àkópọ̀ kí o tó gbà pé ó bàjẹ́ |
| A lo Tune, kò sí ohun tí ó yípadà | Àwọn àyípadà orí kì í kún àwọn àpẹẹrẹ aláìlémọ̀ ti ìtàn sẹ́yìn; fìdí àwọn ìtumọ̀ fáìlì àti ti ibùdó dátà múlẹ̀ |
| Àwọn àlàfo tẹ́ẹ́rẹ́ ní gbogbo ibi lẹ́yìn àyípadà àkókò | Àwọn fáìlì ṣì ń gbé step àti heartbeat àtijọ́ |
| Fáìlì tí a sopọ̀ ní dátà àtijọ́ níbi tí fáìlì tuntun ti ka odo | Ó wà nínú ètò. Ìsopọ̀ náà ń kún àwọn odo àti àwọn iye aláìlémọ̀ |
| Àtòjọ olùṣàyẹ̀wò ń dàgbà kò sì dínkù láé | A máa ń kọ àwọn àbájáde sílẹ̀ títí tí a ó fi gbá wọn nù; títún okùnfà ṣe kì í yọ wọ́n kúrò |

Tọ́jú àpò àkójọ ìpamọ́ àti ibùdó dátà papọ̀, lórí ètò àkókò kan náà, kí o sì dán ìmúbọ̀sípò wò. Ìmúbọ̀sípò mọ mọ ohun tí àpamọ́ yẹn tọ́jú ní àkókò tí a mú un nìkan. Wo [Ìfipamọ́ àti ìmúbọ̀sípò](/yo/guides/back-up-and-restore/).
