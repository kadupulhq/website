---
title: Ṣàkóso ìtọ́jú dátà
description: Yan ìtọ́jú àti ìpinnu, fojúbù ààyè disk, kí o sì gbèrò àwọn àyípadà sí àwọn fáìlì RRD tí ó wà tẹ́lẹ̀.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 24
---

:::caution[Ṣàyẹ̀wò rẹ̀ kí o tó lò ó]
Kóòdù orísun wà ní àrọ́wọ́tó, ṣùgbọ́n kò sí ẹ̀dà Kadupul tí a tì lẹ́yìn tàbí ipa-ọ̀nà ìṣípòpadà. Dán àwọn ìlànà wọ̀nyí wò lórí ẹ̀dà tí a yà sọ́tọ̀ pẹ̀lú àwọn àpamọ́ détà kí o tó gbẹ́kẹ̀lé wọn. Wo [ipò iṣẹ́ àkànṣe](/yo/project/status/).
:::

A máa ń ṣètò ìlànà ìtọ́jú nígbà tí a ń dá fáìlì sílẹ̀, ó sì ń wà láìyipada nígbà àwọn àtúnṣe déédéé. Ṣíṣàtúnṣe profaili nígbà tí ó yá ń yí bí fáìlì tí ń bọ̀ yóò ṣe rí nìkan padà, ó sì ń fi gbogbo fáìlì tí ó ti wà tẹ́lẹ̀ sílẹ̀ gẹ́gẹ́ bí ó ṣe wà. Rí i dájú pé o ṣe èyí ní ọ̀nà tó tọ́ kí o tó dá ẹgbàárùn-ún orísun dátà sílẹ̀, nítorí àwọn àyípadà lẹ́yìn náà ń béèrè fún àtúnṣe fáìlì ní pàtó tàbí ìṣípòpadà.

Ka [Àwọn orísun dátà àti àkójọ ìpamọ́](/yo/concepts/data-sources-and-rras/) kọ́kọ́ bí àwọn ọ̀rọ̀ bíi step, heartbeat, archive (àkójọ ìpamọ́) àti consolidation (ìpapọ̀) kò bá tíì mọ́ ọ lára.

## Ohun tí profaili kan ní nínú

Profaili orísun dátà ni ìlànà ìtọ́jú fúnra rẹ̀. Profaili kan, àgbékalẹ̀ ìpamọ́ kan.

| Pápá | Ìtumọ̀ |
|---|---|
| Àkókò ìbò (step) | Iye ìgbà tí a ń retí iye kan, ní àwọn ìṣẹ́jú àáyá |
| Heartbeat | Àkókò tí ó pọ̀ jùlọ tí a gbà láàyè láàárín àwọn àtúnṣe kí a tó ka àwọn ìwọlé sí aláìlémọ̀ (unknown) |
| X-Files Factor | Iye fèrèsé ìpapọ̀ tí ó lè jẹ́ aláìlémọ̀ kí iye tí a papọ̀ tó di aláìlémọ̀ |
| Àwọn iṣẹ́ ìpapọ̀ | Èwo nínú `AVERAGE`, `MIN`, `MAX`, `LAST` ni a tọ́jú |
| Àwọn àkójọ ìpamọ́ (Archives) | Ìlà kan fún ìpinnu kọ̀ọ̀kan, ọ̀kọ̀ọ̀kan pẹ̀lú ìpele àkójọpọ̀ àti iye ìlà |
| Àkọ́kọ́ṣe (Default) | Bóyá àwọn orísun dátà tuntun ń yan profaili yìí |

Step máa ń jẹ́ àkókò poller ní àiyípadà. Profaili kan tí step rẹ̀ kéré ju àkókò poller lọ kò lè mú àwọn kúlẹ̀kúlẹ̀ tí a kò tíì gbà rí padà bọ̀sípò. Bóyá àwọn ìlà rẹ̀ jẹ́ aláìlémọ̀ sinmi lórí heartbeat àti ìṣedéédé RRDtool.

## Ohun tí a pèsè wá

Profaili mẹ́ta wá pẹ̀lú ètò náà. Gbogbo àwọn mẹ́tẹ̀ẹ̀ta ń tọ́jú gbogbo àwọn iṣẹ́ ìpapọ̀ mẹ́rẹ̀ẹ̀rin.

| Profaili | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Profaili 5 Minute ni àkọ́kọ́ṣe.

Ọ̀kọ̀ọ̀kan ní àkójọ ìpamọ́ mẹ́rin. Ìpele àkójọpọ̀ ni a fi hàn bí olùsodipúpọ̀ step, nítorí náà ìpinnu gidi ni olùsodipúpọ̀ náà lọ́nà step profaili náà, àkókò tí ó sì gbà ni ìpinnu yẹn lọ́nà iye ìlà.

### 5 Minute Collection

| Àkójọ ìpamọ́ | Olùsodipúpọ̀ | Àwọn ìlà | Ìpinnu | Àkókò |
|---|---|---|---|---|
| Daily | 1 | 600 | Ìṣẹ́jú 5 | Nǹkan bí ọjọ́ 2 |
| Weekly | 6 | 700 | Ìṣẹ́jú 30 | Nǹkan bí ọjọ́ 14 |
| Monthly | 24 | 775 | Wákàtí 2 | Nǹkan bí ọjọ́ 64 |
| Yearly | 288 | 797 | Ọjọ́ 1 | Nǹkan bí ọdún 2 àti oṣù 2 |

### 1 Minute Collection

| Àkójọ ìpamọ́ | Olùsodipúpọ̀ | Àwọn ìlà | Ìpinnu | Àkókò |
|---|---|---|---|---|
| Daily | 1 | 2900 | Ìṣẹ́jú 1 | Nǹkan bí ọjọ́ 2 |
| Weekly | 15 | 1440 | Ìṣẹ́jú 15 | Ọjọ́ 15 |
| Monthly | 60 | 8784 | Wákàtí 1 | Nǹkan bí ọjọ́ 366 |
| Yearly | 720 | 7305 | Wákàtí 12 | Nǹkan bí ọdún 10 |

### 30 Second Collection

| Àkójọ ìpamọ́ | Olùsodipúpọ̀ | Àwọn ìlà | Ìpinnu | Àkókò |
|---|---|---|---|---|
| Daily | 1 | 2900 | Ìṣẹ́jú àáyá 30 | Nǹkan bí ọjọ́ 1 |
| Weekly | 30 | 1346 | Ìṣẹ́jú 15 | Nǹkan bí ọjọ́ 14 |
| Monthly | 120 | 1445 | Wákàtí 1 | Nǹkan bí ọjọ́ 60 |
| Yearly | 480 | 4380 | Wákàtí 4 | Ọdún 2 |

Àwọn orúkọ wọ̀nyí jẹ́ àmì nìkan, kì í ṣe ìhùwàsí dandan. Kò sí ohun tí ó fi ipá mú pé àkójọ ìpamọ́ tí a ń pè ní "Yearly" gbọ́dọ̀ ní ọdún kan nínú.

## Bí profaili ṣe ń di fáìlì

Nígbà ìdásílẹ̀, a máa ń ka àwọn àkójọ ìpamọ́ profaili náà àti àwọn iṣẹ́ ìpapọ̀ a sì ń sọ wọ́n di àṣẹ ìdásílẹ̀. Step ń wá láti inú `rrd_step` tí a tọ́jú sí orísun dátà náà, èyí tí a sábà ń mú láti inú profaili rẹ̀. Ohun kọ̀ọ̀kan tí ó wà nínú orísun dátà ń kó ipa ìlà ìtumọ̀ tí ó ń gbé orúkọ, irú rẹ̀, heartbeat, kéré jù àti pọ̀ jù rẹ̀ wá. Àkójọ ìpamọ́ kọ̀ọ̀kan ń kó ipa ìlà kan fún iṣẹ́ ìpapọ̀ kọ̀ọ̀kan, tí ó ń gbé iṣẹ́ náà, X-Files Factor, olùsodipúpọ̀ àti iye ìlà wá.

Àkójọ ìpamọ́ mẹ́rin lọ́nà iṣẹ́ ìpapọ̀ mẹ́rin ń fún wa ní ìtumọ̀ àkójọ ìpamọ́ mẹ́rìndínlógún nínú fáìlì náà. Ìsodipúpọ̀ yẹn ni ibi tí ààyè disk ń gbà lọ.

Bí fáìlì bá ti wà tẹ́lẹ̀, ipa-ọ̀nà ìdásílẹ̀ déédéé yóò dúró láìtún un kọ. Àwọn àtúnṣe profaili kì í gbé àwọn fáìlì kọjá lákòókò kan náà. Àwọn irinṣẹ́ àtúnṣe pàtó jẹ́ iṣẹ́ ọ̀tọ̀, tí a ṣàlàyé ní ìsàlẹ̀.

## Yíyan ìlànà kan

Àwọn ìbéèrè mẹ́ta, ní ètò yìí.

**Kí ni ìbéèrè kíkún jùlọ tí o máa béèrè láé?** Ìyẹn ló ń fìdí step múlẹ̀. Step ti ìṣẹ́jú àáyá 30 ń dáhùn "kí ló ṣẹlẹ̀ ní àkókò ìṣẹ́jú àáyá 90 yẹn". Step ti ìṣẹ́jú 5 kò lè ṣe bẹ́ẹ̀ láé, fún fáìlì èyíkéyìí tí a dá lábẹ́ rẹ̀. Àwọn step kékèké ń ná iṣẹ́ poller lórí gbogbo àkókò àti ààyè disk pẹ̀lú.

**Báwo ni o ṣe máa béèrè sẹ́yìn tó?** Ìyẹn ló ń fìdí iye ìlà àkójọ ìpamọ́ ojoojúmọ́ múlẹ̀. Ọ̀pọ̀lọpọ̀ ètò ló fẹ́ ọjọ́ díẹ̀ ní ìpinnu kíkún tí wọ́n sì máa ń ní ìtẹ́lọ́rùn pẹ̀lú dátà gbígbòòrò lẹ́yìn náà.

**Àwọn ìbéèrè wo ló ń yè lẹ́yìn ìpapọ̀?** Ìyẹn ló ń fìdí àwọn iṣẹ́ ìpapọ̀ múlẹ̀. `AVERAGE` ń dáhùn ohun tí ó wọ́pọ̀. `MAX` ń dáhùn bí ó ṣe burú tó. `MIN` ń dáhùn bóyá ó jábọ́ rí. `LAST` ń dáhùn iye ìkẹyìn nínú fèrèsé náà, èyí tí ó ṣe pàtàkì fún àwọn kíkà tí ó jẹ́ ipò dípò ìwọ̀n.

Yíyọ ọ̀kan kúrò nínú àwọn iṣẹ́ ìpapọ̀ mẹ́rin ń dín ẹrù iye tí a tọ́jú ti àwọn fáìlì tuntun kù ní ìdámẹ́rin ní gbogbo ìpinnu. Ó tún jẹ́ ohun tí àwọn ènìyàn ń kábàámọ̀ rẹ̀ lẹ́yìn náà. Tọ́jú `MAX` àyàfi bí o bá ní ìdánilójú pé kò sí ẹni tí yóò béèrè nípa tente (peak).

## Ṣíṣe ìṣirò ààyè disk

Ìwọ̀n fáìlì kan ń tẹ̀lé àwọn nọ́ńbà tí o yàn. Láti inú ìṣirò tí a ń lò nínú ojú-ètò:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Ojú-ètò náà ń lo 284 àti 300 bytes gẹ́gẹ́ bí àwọn àbájáde iṣẹ́ àfikún tí a fojúbù. Wo èyí bí àbájáde fojúbù, kì í ṣe àpèjúwe pípé ti gbogbo àkópọ̀ fáìlì RRDtool. Iye kọ̀ọ̀kan tí a tọ́jú jẹ́ 8 bytes, gbogbo àpapọ̀ ìlà sì jẹ́ àpapọ̀ àwọn iye ìlà kọjá àwọn ìtumọ̀ àkójọ ìpamọ́ profaili náà kí a tó sọ ọ́ di púpọ̀ nípa àwọn iṣẹ́ ìpapọ̀. Ṣe ìwọ̀n àwọn fáìlì àpẹẹrẹ pẹ̀lú RRDtool tí a fi sílẹ̀ kí o tó fìdí ààyè ìpamọ́ múlẹ̀.

Fún fáìlì orísun dátà kan ṣoṣo pẹ̀lú gbogbo àwọn iṣẹ́ ìpapọ̀ mẹ́rẹ̀ẹ̀rin:

| Profaili | Àpapọ̀ àwọn ìlà | Ìwọ̀n fáìlì fojúbù |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Sọ ọ́ di púpọ̀ nípa iye àwọn orísun dátà tí o ń retí, kì í ṣe nípa iye àwọn àwòrán. Àwòrán kan lè papọ̀ àwọn pápá láti inú fáìlì kan tàbí ọ̀pọ̀lọpọ̀ fáìlì. Ka àwọn fáìlì RRD gidi àti àwọn ohun orísun dátà nínú ọ̀kọ̀ọ̀kan.

Ẹgbàá mẹ́wàá (20,000) orísun dátà lórí profaili àkọ́kọ́ṣe jẹ́ nǹkan bí 1.8 GB. Ẹgbàá mẹ́wàá kan náà lórí profaili 1 Minute jẹ́ nǹkan bí 13 GB. Ìwọ̀n yìí ń fi hàn gbangba ìpinnu àti àwọn àkókò ìtọ́jú ọ̀tọ̀ọ̀tọ̀ ti àwọn profaili náà, kì í ṣe step nìkan. Ìkójọpọ̀ kíkún tún ń pọ̀ sí iye ìgbà ìkọ̀wé. Wo [Àwọn ìkọ̀wé ìwọ̀n gíga](/yo/concepts/high-volume-writes/) kí o tó yan step kékèké ní ìwọ̀n ńlá.

Àwọn olóòtú profaili àti ti àkójọ ìpamọ́ ń fi ìwọ̀n tí a ṣírò hàn bí o ṣe ń yí àwọn nọ́ńbà padà. Lò wọ́n. Ó rọrùn láti ṣe àṣìṣe ìṣirò ní ìwọ̀n mẹ́rin.

## Ohun tí yíyí profaili padà ń ṣe, àti ohun tí kò ṣe

Èyí ni apá tí ó ń gba ìtàn àwọn ènìyàn lọ́wọ́ wọn.

| Àyípadà | Ipá lórí àwọn fáìlì tuntun | Ipá lórí àwọn fáìlì tí ó wà tẹ́lẹ̀ |
|---|---|---|
| Ṣàfikún tàbí yọ àkójọ ìpamọ́ | A fi sílò | Kò sí |
| Yí iye ìlà padà | A fi sílò | Kò sí |
| Yí ìpele àkójọpọ̀ padà | A fi sílò | Kò sí |
| Ṣàfikún tàbí yọ iṣẹ́ ìpapọ̀ | A fi sílò | Kò sí |
| Yí step padà | Àwọn orísun dátà tuntun ń jogún rẹ̀; ìdásílẹ̀ ń lo step tí a tọ́jú wọn | Kò sí ìṣípòpadà fáìlì aládàáṣiṣẹ́ |
| Yí heartbeat padà | Ìdásílẹ̀ ń lo dátà àpèjúwe orísun dátà tí a tọ́jú; wo ìsàlẹ̀ | Kò sí àtúnṣe fáìlì aládàáṣiṣẹ́ |
| Pa profaili rẹ́ | A kọ̀ ọ́ nígbà tí àwòṣe tàbí orísun dátà bá tọ́ka sí i, àti fún profaili àkọ́kọ́ṣe | Kò sí |

**Yíyí heartbeat ti profaili tí a ń lò padà ń sọ dátà àpèjúwe dọ̀tun nìkan.** Fífipamọ́ heartbeat tuntun ń tọ́jú rẹ̀ sí orí profaili náà àti lórí àwọn ohun orísun dátà ti àwọn àwòṣe àti àwọn orísun dátà agbègbè tí ń lo profaili náà; àwọn àwòṣe mìíràn kò ní yípadà.

Ìpamọ́ náà kì í tún àwọn fáìlì RRD tí ó wà tẹ́lẹ̀ ṣe. Tọ́jú àwọn dátà àpèjúwe àti àwọn fáìlì papọ̀, kí o sì fi profaili, àwọn ohun àwòṣe, àwọn ohun orísun dátà agbègbè àti àbájáde `rrdtool info` gidi wéra lẹ́yìn àtúnṣe heartbeat.

Irinṣẹ́ `cli/update_heartbeat.php` ti agbowó dátà àkọ́kọ́ lè tún àwọn fáìlì tí ó wà ṣe kí ó sì sọ dátà àpèjúwe dọ̀tun. Bẹ̀rẹ̀ pẹ̀lú `--help`, `--list-heartbeats`, `--list-data-templates` àti `--list-profiles`. Heartbeat tuntun náà gbọ́dọ̀ ní àtìlẹ́yìn kí ó sì jẹ́ ó kéré tán ìlọ́po méjì àkókò poller tí a ṣètò. Lo `--data-template-id` láti dín àṣàyàn kù; irinṣẹ́ náà kò ní àṣàyàn dry-run.

Láìsí `--force`, àwọn profaili tí a yàn gbọ́dọ̀ ní heartbeat tí a béèrè tẹ́lẹ̀. Pẹ̀lú `--force`, àwọn iye profaili tí a pín tún ń yípadà, nítorí náà ṣàyẹ̀wò gbogbo àwọn olùlò wọn kí o tó tẹ̀síwájú. `--prev-heartbeat` ń ṣe asẹ́ lórí àwọn iye ibùdó dátà, kì í ṣe heartbeat tí a ka láti RRD kọ̀ọ̀kan: lẹ́yìn ìpamọ́ ojú-ewé wẹ́ẹ̀bù kan, yíyan iye fáìlì àtijọ́ lè má bá nǹkankan mu. Fìdí àṣàyàn múlẹ̀ kí o sì ṣàyẹ̀wò àwọn fáìlì tí ó jáde. Ìdánwò tí a yà sọ́tọ̀ ṣàṣeyọrí láti tún fáìlì rẹ̀ tí ó wà ṣe láti 600 sí 900 lẹ́yìn tí a ṣe àtúnṣe dátà àpèjúwe profaili rẹ̀.

Àwọn pàdàbù méjì mìíràn tún wà lẹ́gbẹ̀ẹ́ yẹn.

**Olóòtú náà ń dín àwọn àyípadà ètò kù ní kété tí a bá ti ń lo profaili kan.** Ní kété tí orísun dátà gidi bá ti wà lórí profaili kan, step, X-Files Factor, àwọn iṣẹ́ ìpapọ̀, iye ìlà àkójọ ìpamọ́ àti àwọn ìpele àkójọpọ̀ máa ń di kíkà-nìkan nínú olóòtú náà; àwọn ìdarí ìfikún/ìparẹ́ àkójọ ìpamọ́ tún máa ń pamọ́. Ṣe ẹ̀dà profaili náà kí o sì ṣàtúnṣe ẹ̀dà náà. Àwọn ìdínkù ojú-ètò wọ̀nyí kì í ṣe ìmúdájú ẹ̀gbẹ́-olùpèsè ti àwọn ìbéèrè tí a fi ránṣẹ́.

**Tún àwọn ìtọ́kasí pín kí o tó pa profaili kan rẹ́.** Àtòjọ náà ń pa àṣàyàn tì nígbà tí àwòṣe tàbí orísun dátà agbègbè bá ń lo profaili kan, olùpèsè náà yóò sì kọ̀ láti pa profaili kan tí a ṣì ń tọ́ka sí rẹ́.

## Gbígbé àwọn orísun dátà láàárín àwọn profaili

Ìgbésẹ̀ àpapọ̀ (bulk action) wà lórí àwọn àwòṣe dátà láti yí profaili padà. Ó ń tún profaili, step àti heartbeat tí a kọ sílẹ̀ ti àwòṣe kọ, ó sì mọ̀ọ́mọ̀ dín ara rẹ̀ kù sí àwọn ìlà àwòṣe nìkan. Àwọn orísun dátà tí ó ti wà tẹ́lẹ̀ kò sí nínú rẹ̀.

Nítorí náà, ètò fún ìṣípòpadà gidi ni:

1. Kọ́ profaili tuntun náà kí o sì ṣàyẹ̀wò ìwọ̀n tí ó ṣírò.
2. Tọ́ka àwòṣe dátà sí i.
3. Gbà pé gbogbo ohun tí a dá láti ìgbà yìí lọ yóò lo àgbékalẹ̀ tuntun náà.
4. Pinnu, lọ́tọ̀, ohun tí o máa ṣe nípa àwọn fáìlì tí o ti ní tẹ́lẹ̀.

Ìgbésẹ̀ kẹrin ní àwọn àṣàyàn púpọ̀, dídá lórí àyípadà àti ẹ̀dà RRDtool tí a fi sílẹ̀.

**Fi wọ́n sílẹ̀.** Àwọn àgbékalẹ̀ ìtọ́jú ọ̀tọ̀ọ̀tọ̀ lè wà papọ̀. Mú kí dátà àpèjúwe ìbò ti orísun dátà kọ̀ọ̀kan wà ní ìbáramu pẹ̀lú fáìlì rẹ̀; yíyí ìtọ́kasí profaili ibùdó dátà padà nìkan kì í gbé step, àwọn pápá tàbí àwọn àkójọ ìpamọ́ rẹ̀ kọjá.

**Tún un kọ́.** Pa orísun dátà náà rẹ́ kí o sì tún un dá. Ó yára, ṣùgbọ́n ìtàn àtijọ́ yóò parẹ́.

**Splice.** Irinṣẹ́ ìlà àṣẹ splice ń da fáìlì àtijọ́ pọ̀ mọ́ tuntun kan ó sì lè yí ìpinnu padà nígbà tí ó ń ṣe bẹ́ẹ̀, níwọ̀n ìgbà tí fáìlì tuntun náà bá ti ní step tí ó tọ́ tẹ́lẹ̀. Ó ní ipò dry run. Lò ó lórí ẹ̀dà kan kí o tó lò ó lórí ohunkóhun tí o kà sí pàtàkì.

**Àtúnṣe RRDtool.** Dídá lórí ẹ̀dà tí a fi sílẹ̀ àti àyípadà tí a fẹ́, [rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) tàbí [rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) lè yí fáìlì tí ó wà padà nígbà tí ó ń dáàbò bo dátà tí a tọ́jú. Dá àwọn olùkọ̀wé tí ń díje dúró, tọ́jú àpamọ́ kí o sì fìdí àbájáde múlẹ̀ lórí ẹ̀dà kan. Àwọn iṣẹ́ wọ̀nyí kì í tún àwọn kúlẹ̀kúlẹ̀ tí a ti sọ nù tẹ́lẹ̀ nípa ìpapọ̀ dá.

## Àwọn profaili òde

A lè to orísun dátà sí profaili òde, èyí tí ń kọ step ti odo sílẹ̀. Èyí ń sọ pé a ń darí fáìlì náà ní ẹ̀yìn ipa-ọ̀nà déédéé, àtòjọ orísun dátà sì ń fi hàn gẹ́gẹ́ bí ti òde dípò kíkọ àkókò kan sílẹ̀. Lò ó fún àwọn fáìlì tí ìlànà mìíràn ń kọ sí. Má ṣe lò ó láti túmọ̀ sí "kò sí ìlànà", nítorí pé ìtọ́jú náà ṣì jẹ́ ohunkóhun tí a fi kọ́ fáìlì náà ní ìbẹ̀rẹ̀; kò sí ní ibikíbi tí o ti lè rí i nìkan ni.

## Àwọn ipò ìkùnà

| Àmì | Okùnfà tí ó wọ́pọ̀ |
|---|---|
| Àtúnṣe profaili kan dàbí ẹni pé kò ṣe nǹkankan | Ó wà nínú ètò. Àwọn fáìlì tí ó wà ń pa àgbékalẹ̀ tí a dá wọn mọ́ mọ́ra |
| Iye ìlà àti ìpele àkójọpọ̀ kò lè ṣe àtúnṣe | Ó kéré tán orísun dátà kan ń lo profaili náà. Ṣe ẹ̀dà rẹ̀ |
| Ojú-ètò ń fi heartbeat kan hàn, fáìlì ń hùwà bí òmíràn | Heartbeat profaili yípadà bẹ́ẹ̀ sì ni a kò tún àwọn fáìlì ṣe rí |
| Àwọn orísun dátà tuntun kùnà láti dá, log sọ pé kò sí àkójọ ìpamọ́ tí a yàn | A pa profaili rẹ́ nígbà tí àwọn orísun dátà ṣì ń tọ́ka sí i |
| Àkójọ ìpamọ́ tí ó dára jù kún fún àwọn aláìlémọ̀ | Ṣàyẹ̀wò àwọn àtúnṣe tí ó sọnù, heartbeat àti àwọn òfin ìpapọ̀ |
| Ọ̀sẹ̀ kan ti àwọn àwòrán ní àwọn àlàfo ní gbogbo wákàtí díẹ̀ | Heartbeat súnmọ́ step jù fún poller tí ń pẹ́ |
| Àwọn tente tí a rí lánàá ti parẹ́ nínú àwòrán oṣù | `AVERAGE` nìkan ni a tọ́jú, tàbí a yọ àkójọ ìpamọ́ `MAX` kúrò láti fi ààyè pamọ́ |
| Disk dàgbà ní ìlọ́po mẹ́rin yára ju bí a ṣe fojúbù lọ | Ìfojúbù náà ka àwọn àkójọ ìpamọ́ ṣùgbọ́n kò ka àwọn iṣẹ́ ìpapọ̀ |
| Ìpinnu tí a fẹ́ kò sí nínú àtòjọ àkójọ ìpamọ́ tuntun | Olóòtú náà ń pèsè àkójọ ìpamọ́ kíkún ní step profaili, lẹ́yìn náà àwọn àṣàyàn tí kò kún ju àwọn àkójọ ìpamọ́ tí ó wà lọ nìkan |
