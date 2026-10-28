---
title: Yọ spikes kúrò nínú dátà
description: Wo àkọ́kọ́ṣe àwọn àtúnṣe spike, dáàbò bo àwọn ẹ̀dà ìmúbọ̀sípò, kí o sì fìdí àwọn àyípadà múlẹ̀ sí àwọn àpẹẹrẹ RRD tí a tọ́jú.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 19
---

:::caution[Ṣàyẹ̀wò rẹ̀ kí o tó lò ó]
Kóòdù orísun wà ní àrọ́wọ́tó, ṣùgbọ́n kò sí ẹ̀dà Kadupul tí a tì lẹ́yìn tàbí ipa-ọ̀nà ìṣípòpadà. Dán àwọn ìlànà wọ̀nyí wò lórí ẹ̀dà tí a yà sọ́tọ̀ pẹ̀lú àwọn àpamọ́ détà kí o tó gbẹ́kẹ̀lé wọn. Wo [ipò iṣẹ́ àkànṣe](/yo/project/status/).
:::

:::danger[Èyí ń tún ìtàn kọ; ìmúbọ̀sípò ń béèrè fún àpamọ́]
Yíyọ spike ń da àkójọ ìpamọ́ sílẹ̀, ń ṣàtúnṣe àwọn iye, ń mú fáìlì ìgbà díẹ̀ bọ̀sípò ó sì ń rọ́pò àkọ́kọ́ náà lẹ́yìn ìmúdájú. Kò sí àtúnsọ aládàáṣiṣẹ́. Dáàbò bo kí o sì ṣàyẹ̀wò ẹ̀dà ìmúbọ̀sípò, kọ́kọ́ lo `--dryrun`, kí o sì fìdí àwọn àpẹẹrẹ tí a fojúsùn múlẹ̀ kí o tó jẹ́rìí sí àyípadà kan.
:::

Spike níhìn-ín túmọ̀ sí àpẹẹrẹ kan tàbí méjì tí ó tóbi gan-an ju gbogbo ohun tí ó yí wọn ká lọ tó bẹ́ẹ̀ tí ìlà inaro fi ń dọ́gba pẹ̀lú wọn tí gbogbo àwòrán yòókù sì ń tẹ́ pẹrẹsẹ mọ́ ìsàlẹ̀. Ìwọ̀n náà kò tọ́, ó sì ń pariwo nínú àfihàn àwòrán.

## Ibi tí wọ́n ti ń wá

Ọ̀pọ̀lọpọ̀ àwọn spikes lórí orísun dátà counter jẹ́ ti ìṣirò, kì í ṣe ti ìwọ̀n gidi. Orísun dátà counter ń tọ́jú ìwọ̀n tí a ṣírò láti inú ìyàtọ̀ láàárín àwọn kíkà méjì. Ohunkóhun tí ó bá mú kí kíkà kejì tóbi ju ti àkọ́kọ́ lọ púpọ̀, ní ìbámu pẹ̀lú àkókò láàárín wọn, lè mú ìwọ̀n èké jáde. Àtúntò counter, ìbálò wrap tí kò tọ́, àtúnṣe fáfáìlì ìbánisọ̀rọ̀ tí ń gbé kíkà lọ sí orísun dátà tí kò tọ́, tàbí àṣìṣe àmì àkókò lè fa èyí. Wrap counter déédéé fúnra rẹ̀ kì í ṣe ẹ̀rí àpẹẹrẹ búburú; fìdí irú orísun dátà àti àwọn kíkà ìwọlé múlẹ̀.

Wo [Àwọn orísun dátà àti àkójọ ìpamọ́](/yo/concepts/data-sources-and-rras/) fún bí a ṣe ń mú ìwọ̀n náà wá.

Ṣàtúnṣe okùnfà níbi tí o bá ti lè ṣe bẹ́ẹ̀. Yíyọ spike kúrò jẹ́ àtúnṣe ojú lásán; kò ní dá èyí tí ń bọ̀ dúró.

## Àwọn ọ̀nà mẹ́rin náà

Irinṣẹ́ náà ń ṣiṣẹ́ lórí gbogbo fáìlì: ó ń da gbogbo àkójọ ìpamọ́ nínú fáìlì RRD jáde, ń pinnu àwọn iye wo ni a ó rọ́pò, ó sì ń mú àbájáde náà bọ̀sípò.

| Ọ̀nà | Ohun tí ó ń yàn | Nílò fèrèsé |
|---|---|---|
| `stddev` | Àwọn iye tí ó ju N ìyapa déédéé láti inú ìwọ̀n | Rárá |
| `variance` | Àwọn iye tí ó ju ìpín N lórí ọgọ́rùn-ún lókè ìwọ̀n lẹ́yìn tí a yọ àwọn tí ó kọjá ààlà kúrò | Rárá |
| `float` | Gbogbo nǹkan nínú fèrèsé àkókò kan pàtó | Bẹ́ẹ̀ni |
| `fill` | Àwọn àpẹẹrẹ aláìlémọ̀ àti ti iye odo nínú fèrèsé àkókò kan pàtó | Bẹ́ẹ̀ni |

`stddev` àti `variance` ń ṣọdẹ. `float` àti `fill` ń ṣe ohun tí o sọ fún wọn nínú àkókò tí o dárúkọ, àwọn méjèèjì sì ń kùnà lẹ́sẹ̀kẹsẹ̀ bí o kò bá pèsè ìbẹ̀rẹ̀ àti ìparí.

`fill` kò mọ mọ dátà tí ó sọnù nìkan: ó lè rọ́pò àwọn odo tí a wọ̀n pẹ̀lú àwọn iye tí kì í ṣe odo. Má ṣe lò ó lórí àkókò tí ó ní àwọn kíkà tí ó wúlò ti ìdákẹ́ tàbí ti odo àyàfi bí àyípadà yẹn bá jẹ́ mọ̀ọ́mọ̀.

Ọ̀nà variance ń yọ àwọn àpẹẹrẹ N tí ó ga jù àti èyí tí ó kéré jù kúrò kí ó tó ṣírò ìwọ̀n tí ó ń fi wéra, níbi tí N ti jẹ́ ìṣètò outliers. Èyí ni ohun tí ń dá spike dúró láti mú kí ààlà tí a fẹ́ fi mú un ga sí i.

Ohunkóhun tí a bá yàn ni a máa ń rọ́pò, àwọn ìrọ́pò mẹ́ta sì wà.

| Ìrọ́pò | Àbájáde |
|---|---|
| `last` | Iye tí ó dára tí a mọ̀ kẹ́yìn. Àkọ́kọ́ṣe. |
| `avg` | Ìwọ̀n tí a ṣírò fún pápá/àkójọ ìpamọ́; ìṣirò náà sinmi lórí ọ̀nà náà. |
| `nan` | Aláìlémọ̀ (unknown) fún àwọn ọ̀nà ìṣirò; wo ìdínkù ọ̀nà fèrèsé ní ìsàlẹ̀. |

Aláìlémọ̀ ń kọ sílẹ̀ pé ìwọ̀n tí a lè lò kò sí. `last` àti `avg` ń fi àwọn iye rọ́pò tí ó lè dàbí èyí tí a wọ̀n sí ẹnìkan tí ń wo àwòrán lẹ́yìn náà. Yan ìrọ́pò pẹ̀lú ìmọ̀ọ́mọ̀ kí o sì fìdí àbájáde tí a tọ́jú gidi múlẹ̀.

**Àwọn ọ̀nà fèrèsé pẹ̀lú NaN:** pẹ̀lú `--avgnan=nan`, `float` ń rọ́pò gbogbo iye tí a mọ̀ nínú fèrèsé pẹ̀lú aláìlémọ̀, `fill` sì ń rọ́pò odo tàbí àwọn iye tí kì í ṣe nọ́ńbà nínú fèrèsé pẹ̀lú aláìlémọ̀. Àwọn ọ̀nà ìṣirò pẹ̀lú àwọn ààlà àkókò àṣàyàn ń rọ́pò àwọn outliers tí a rí nìkan, nítorí náà wọn kò dọ́gba pẹ̀lú pípa gbogbo fèrèsé rẹ́.

## Wo àkọ́kọ́ṣe, lẹ́yìn náà jẹ́rìí sí i

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Dry run ń da RRD jáde ó sì ń ṣàyẹ̀wò rẹ̀ láìtún kọ sínú fáìlì tí ń ṣiṣẹ́ lọ́wọ́. Ó ṣì nílò àpò iṣẹ́ tí a lè lò àti àṣẹ àtúnṣe. Àkọ́kọ́ṣe kì í dá fáìlì dúró títí di ìjẹ́rìí lẹ́yìn náà: àwọn àpẹẹrẹ tuntun tàbí àwọn àṣàyàn tí a yípadà lè yí àbájáde padà. Àpẹẹrẹ tí ó ní fèrèsé ṣì ń lo àṣàyàn ìṣirò; kò yọ gbogbo iye nínú fèrèsé yẹn kúrò.

Àwọn àkókò ń gba àmì àkókò Unix tàbí ọ̀rọ̀ ọjọ́. Ọ̀rọ̀ tí a kò lè túmọ̀ ni a máa ń kọ̀ ṣáájú àtúnkọ. Lo àwọn àmì àkókò Unix nígbà tí ìtumọ̀ àgbègbè àkókò kò bá ṣe kedere.

## Ohun tí ń ṣẹlẹ̀ ní tòótọ́ sí fáìlì náà

Ó dára láti mọ̀ kí o tó lò ó lórí ohun tí o kà sí pàtàkì.

1. A da fáìlì náà sí XML nínú àpò àpamọ́.
2. A yọ àwọn àlàyé kúrò a sì ṣàyẹ̀wò gbogbo àkójọ ìpamọ́ fún àwọn ìṣirò.
3. A rọ́pò àwọn iye tí a yàn nínú XML.
4. A da fáìlì àkọ́kọ́ kọ sínú àpò àpamọ́.
5. A mú XML tí a ṣàtúnṣe bọ̀sípò sí fáìlì arákùnrin àdáni, a fìdí rẹ̀ múlẹ̀, a sì tún un lórúkọ lórí àkọ́kọ́ nígbà tí a ń dáàbò bo olówó, ẹgbẹ́ àti àṣẹ rẹ̀.

Ìgbésẹ̀ 4 ni àwọ̀n ààbò, kò sì ṣeé fò dá: bí ẹ̀dà bá kùnà, ìmúbọ̀sípò kì í ṣiṣẹ́. Ẹ̀dà yẹn, kì í ṣe àmì ìlà àṣẹ èyíkéyìí, ni ohun tí o máa mú padà láti inú rẹ̀. Orúkọ rẹ̀ sinmi lórí àkọ́kọ́ ó sì lè gba àmì àrànmọ́ ọ̀tọ̀ láti yẹra fún kíkọ lórí ohun tí ó wà tẹ́lẹ̀. `--backup` tún ń béèrè fún àwòrán ìmúbọ̀sípò pípẹ́. Ka àwọn ipa-ọ̀nà tí a ròyìn kí o sì fìdí àwọn ẹ̀dà múlẹ̀ kí o tó gbẹ́kẹ̀lé wọn.

Iṣẹ́ náà nílò àwọn àpò POSIX agbègbè tí a gbẹ́kẹ̀lé àti àgbelebu àtúnṣe; àwọn àṣẹ ipò kíkọ nìkan kò tó. Ó ń kọ ìpamọ́ tí kò ní àtìlẹ́yìn àti ibùdó rrdcached tí a ṣètò. Dá àwọn olùkọ̀wé òde dúró, tí kì í ṣe apá kan àdéhùn àgbelebu Kadupul. Ṣe é gẹ́gẹ́ bí àkántì iṣẹ́ tí ó ni ìpamọ́ tí a fẹ́. Wo [àwọn ohun tí a nílò fún fífisílẹ̀](/yo/reference/requirements/) fún àṣẹ ìpamọ́.

## Àwọn ìṣètò tí ń darí àwọn àkọ́kọ́ṣe

Àwọn àṣẹ ìlà àṣẹ ló máa ń borí. Ohunkóhun tí o bá fi sílẹ̀ ń wá láti inú àwọn ìṣètò ètò, àwọn ìṣètò olùlò kọ̀ọ̀kan sì ń borí ti ètò nígbà tí a bá lo irinṣẹ́ láti inú ojú-ètò.

| Ìṣètò | Àkọ́kọ́ṣe | Ohun tí ó ń ṣe |
|---|---|---|
| Ọ̀nà yíyọkúrò | Variance pẹ̀lú yíyọ outliers | Ọ̀nà wo ni a ó lò |
| Ọ̀nà ìrọ́pò | Èyí tí a mọ̀ pé ó dára kẹ́yìn | Kí ló ń rọ́pò iye tí a yọ kúrò |
| Iye àwọn ìyapa déédéé | 10 | Ààlà fún ọ̀nà `stddev` |
| Ìpín variance | 1000 | Ààlà fún ọ̀nà `variance` |
| Iye outliers ti variance | 5 | Àwọn àpẹẹrẹ gíga àti kékeré tí a yọ kúrò kí a tó ṣírò ìwọ̀n |
| Pọ̀ jù pípa fún RRA kọ̀ọ̀kan | 5 | Ààlà tí a fẹ́; a kò tíì fi ipá mú un dáadáa lọ́wọ́lọ́wọ́ |
| Àpò àpamọ́ RRDfile | `cache/spikekill/` lábẹ́ ibùdó fífisílẹ̀ | Ibi tí dump àti ẹ̀dà ń lọ |
| Ìtọ́jú àpamọ́ | Oṣù 3 | Bí a ṣe ń tọ́jú àwọn ẹ̀dà tó |

Ipò batch tún wà: ètò àkókò (gbogbo wákàtí 6, 12, 24 tàbí 48), àkókò ìpìlẹ̀, àti àtòjọ àwọn àwòṣe àwòrán láti ṣiṣẹ́ lórí wọn. Ipò batch wà ní pípa ní àkọ́kọ́ṣe. Títàn án túmọ̀ sí pé ètò náà ń ṣàtúnṣe àwọn àkójọ ìpamọ́ láìsí ẹnìkan tí ń wo àbájáde rẹ̀. Dín àtòjọ àwòṣe kù gidigidi bí o bá tàn án rárá.

## Àwọn pàdàbù

**Àwọn àkọ́kọ́ṣe ààlà jẹ́ mọ̀ọ́mọ̀ dídíwọ̀n fífẹ̀.** Ìyapa déédéé mẹ́wàá àti ìpín 1000 ti variance fẹ̀ púpọ̀. Iṣẹ́ kan tí kò ròyìn spikes kò kùnà bóyá; ó ti sọ fún ọ pé àwọn iye wà nínú ẹgbẹ́ tí o béèrè fún. Mú ààlà le dípò yíyí àwọn ọ̀nà padà láìsí ètò.

**Pọ̀ jù pípa fún RRA kọ̀ọ̀kan ń dín àwọn ọ̀nà ìṣirò kù nìkan.** Fún `stddev` àti `variance`, kíkà náà ń bo gbogbo àwọn orísun dátà nínú àkójọ ìpamọ́ kan ó sì ń tún bẹ̀rẹ̀ ní àkójọ ìpamọ́ tí ń bọ̀. Àwọn ọ̀nà fèrèsé `float` àti `fill` ń rọ́pò gbogbo iye tí ó bá a mu nínú fèrèsé náà. Àpapọ̀ kíkà ní àwọn ìrọ́pò NaN nínú. Ṣàyẹ̀wò àkọ́kọ́ṣe pípé kí o sì lo fèrèsé àkókò tẹ́ẹ́rẹ́.

**A kò lè mú iye tí a papọ̀ bọ̀sípò.** Àwọn àkójọ ìpamọ́ àtijọ́ ń tọ́jú iye kan fún garawa kọ̀ọ̀kan, tí a ti ṣírò ìwọ̀n rẹ̀ tẹ́lẹ̀. Rírọ́pò iye yẹn kì í mú ìwọ̀n tòótọ́ fún garawa náà padà wá; ó ń fi èyí tí ó ṣeé ṣe rọ́pò rẹ̀ ni. Bí o ṣe ń lọ sẹ́yìn tó, bẹ́ẹ̀ ni àtúnṣe náà ṣe ń di àbá sí i.

**Àpò àpamọ́ gbọ́dọ̀ jẹ́ èyí tí a ṣètò tí a sì gbẹ́kẹ̀lé.** Dump àti àwọn ẹ̀dà ìmúbọ̀sípò ń lọ sibẹ̀. Àwọn àpò tí kò sí, tí kò ní ààbò tàbí tí a kò lè fìdí wọn múlẹ̀ ni a máa ń kọ̀; má ṣe mú kí àpò kan ṣeé kọ sí nípa gbogbo ayé (world-writable) láti yẹra fún ìkùnà.

**Tọ́jú àkọsílẹ̀ àyípadà ti ara rẹ àti ti àwọn log ètò.** Kọ olùṣiṣẹ́, àṣẹ, àkókò, àwọn ipa-ọ̀nà àpamọ́ àti àwọn àyẹ̀wò ṣáájú/lẹ́yìn sílẹ̀. Àwọn kíkà àkópọ̀ nìkan kì í ṣe ẹ̀rí tó fún ohun tí ó yípadà.

**Ṣe é gẹ́gẹ́ bí àkántì iṣẹ́ tí a fẹ́.** Ìrọ́pò tí ó ṣàṣeyọrí ń dáàbò bo ìní fáìlì àti àṣẹ rẹ̀. Root kì í ṣe ọ̀nà àbùjá yípo àwọn àyẹ̀wò ìgbẹ́kẹ̀lé àpò; fìdí rẹ̀ múlẹ̀ pé poller déédéé ṣì lè sọ àbájáde dọ̀tun.

**Yíyọ spike kì í tún àwòrán ṣe bí orísun dátà kò bá tọ́.** Bí àtúnṣe fáfáìlì bá gbé àwọn iye lọ sí orísun dátà tí kò tọ́, spike jẹ́ àmì àìsàn nìkan. Wo [Túbọ̀ wá àwọn ìṣòro dátà tí ó sọnù](/yo/guides/troubleshoot-missing-data/) kí o tó bẹ̀rẹ̀ sí ní ṣàtúnṣe àwọn àkójọ ìpamọ́.
