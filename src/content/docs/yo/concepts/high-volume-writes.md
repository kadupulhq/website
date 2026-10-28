---
title: Kíkọ data ní iye púpọ̀
description: Ìdí tí àwọn àtúnṣe RRD fi ń ní ààlà nípa iye kíkọ dípò ìwọ̀n kíkọ, ohun tí pípèjọ wọn ń mú wá, àti ohun tí ó ń náni nípa títun data ṣe.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 10
---

Àwọn àtúnṣe RRD ń kan ọ̀pọ̀lọpọ̀ fáìlì wọ́n sì lè ní ààlà nípasẹ̀ ìdádúró ibi-ìpamọ́ àti àwọn iṣẹ́ I/O,
kì í ṣe nípasẹ̀ bandwidth gbigbe data nìkan. Kíkọ tí a sún síwájú, tí a tún ń pè ní Boost, ń kó àwọn àpẹẹrẹ
jọ sínú ibi-ìpamọ́ data ó sì ń pèjọ àwọn àtúnṣe fún fáìlì kọ̀ọ̀kan. Wọ́n akọ̀wé àti ibi-ìpamọ́ data kí o tó yàn án:
àwọn àlàfo graph nìkan kò dá ìdènà ibi-ìpamọ́ mọ̀.

## Ọ̀nà àkọ́kọ́ (default path)

Àwọn olùkójọ ń fi àwọn àbájáde sínú ìlà `poller_output` tí ń lọ lọ́wọ́. Akọ̀wé ń pín àwọn àpẹẹrẹ nípa fáìlì
àti àkókò, ó ń ṣe àtúnṣe RRD, ó sì ń tọpa ìfìdí-múlẹ̀ kí ó tó yọ àwọn àpẹẹrẹ tí ó tóótun kúrò. Àwọn kíkọ tí ó
kùnà lè fi àwọn ìlà sílẹ̀ fún àtúndánwò, nítorí náà ìlà náà kò mọ mọ́ ìgbà ìbò lọ́wọ́lọ́wọ́ nìkan.

Nínú àtúnyẹ̀wò tí a ṣe, ìlà yìí ń lo InnoDB. Àyẹ̀wò tẹ́lẹ̀ ti ìkójọpọ̀ ń kọ ìlà MEMORY; títún ibi-ìpamọ́ data bẹ̀rẹ̀
kì í ju àwọn ìlà tí a ti fìdí rẹ̀ múlẹ̀ nù gẹ́gẹ́ bí yóò ṣe ṣe fún tábìlì MEMORY. Ìfẹsẹ̀múlẹ̀ ṣì sinmi lórí ètò
ibi-ìpamọ́ data, ìlera ibi-ìpamọ́ àti àwọn àtìlẹ́yìn. Wo [Ṣe àmúpada láìséwu](/yo/guides/upgrade-safely/) fún
ìṣípò ìlà àti àwọn àyẹ̀wò ibi-ìpamọ́.

Gẹ́gẹ́ bí ìfojúsùn ẹrù lásán, àwọn fáìlì ọ̀tọ̀ọ̀tọ̀ 10,000 tí a ń túnṣe ní gbogbo 300 aaya túmọ̀ sí nǹkan bí
àtúnṣe fáìlì 33 fún aaya kan ní ìpíndọ́gba. Àwọn kíkọ gidi máa ń wá ní lílu lójijì; ọ̀pọ̀lọpọ̀ pápá orísun data
lè pín fáìlì kan náà, àwọn ìgbésẹ̀ lè yàtọ̀, iye àṣẹ kò sì dọ́gba pẹ̀lú iye I/O disk gidi. Fi ìdádúró akọ̀wé tí a
wọ́n àti ọjọ́ orí ìlà wéra pẹ̀lú fèrèsé ìbò tí ó wà.

## Ohun tí pípèjọpọ̀ ń yípadà

Pẹ̀lú kíkọ tí a sún síwájú tí a fún láàyè, ìkójọpọ̀ ń fi àwọn àpẹẹrẹ pamọ́ sínú `poller_output_boost` fún
iṣẹ́ tí ń bọ̀ lẹ́yìn. Akọ̀wé àpapọ̀ ń to àwọn àpẹẹrẹ nípasẹ̀ orísun data ní tẹ̀lé-ǹ-tẹ̀lé àkókò ó sì lè fi àwọn àkókò
púpọ̀ ránṣẹ́ nínú àṣẹ àtúnṣe RRDtool kan ṣoṣo. Àwọn àpẹẹrẹ méjìlá lè wọ inú àṣẹ kan, ṣùgbọ́n èyí kò ṣe ìdánilójú
kíkọ disk gidi kan ṣoṣo.

Gígùn àríyànjiyàn tí ó pọ̀ jùlọ tí a tò ń dín àwọn ọ̀rọ̀ àtúnṣe kù; àkọ́kọ́ jẹ́ 2,000. Ó ń ní ipa lórí pípèjọpọ̀.
Má ṣe yọ ààlà ètò iṣẹ́ (OS) kan pàtó jáde láti inú ètò yìí: àwọn kíkọ agbègbè tí a fìdí rẹ̀ múlẹ̀ ń lo sísan àṣẹ RRDtool,
ọ̀nà gbigbe gidi àti ìwọ̀n àṣẹ tí a tì lẹ́yìn sì ṣe pàtàkì.

Olùṣètò sábà máa ń tóótun nígbà tí aago rẹ̀ bá kùnà (iṣẹ́jú 60 gẹ́gẹ́ bí àkọ́kọ́) tàbí ìwọ̀n ìlà bafa tí a fojúsùn
bá kọjá ààlà tí a tò (1,000,000 gẹ́gẹ́ bí àkọ́kọ́). Ìfojúsùn ìlà ní nínú àwọn tábìlì alààyè àti ti àkójọpọ̀ (archive).
Ìpè olùṣètò gbọ́dọ̀ wáyé síbẹ̀, àti pé àwọn àyẹ̀wò iṣẹ́, ìmúrasílẹ̀ tàbí àwọn ìkùnà akọ̀wé lè fa iṣẹ́ sẹ́yìn.
Ṣíṣe pípọn dandan, sísọ di òfo lẹ́yìn pípa á, àti àwọn àtúnṣe graph lórí ìbéèrè jẹ́ àwọn ọ̀nà àfikún; àwọn àkọ́kọ́ kì
í ṣe ìdánilójú títun ti wákàtí kan.

Àkókò tí ó jẹ́ odo tàbí tí kì í ṣe odidi nọ́mbà rere ni a ń fi iṣẹ́jú 120 rọ́pò; àkọ́kọ́ tí ó wọ́pọ̀ jẹ́ iṣẹ́jú 60.

## Yíyípo, àti ìdí tí ó fi wà níbẹ̀

Ètò pípèjọ ń ṣẹ̀dá tábìlì òfo kan tí ó bá bafa alààyè mu, lẹ́yìn náà ó ń pàṣípààrọ̀ àwọn orúkọ pẹ̀lú gbólóhùn
`RENAME TABLE` kan ṣoṣo. Tábìlì alààyè àtijọ́ di àkójọpọ̀ tí ó ní àkókò tí àwọn olùpèsè sì ń kọ sí orí èyí tuntun.
Èyí ń ya àpapọ̀ kúrò nínú àwọn ìbò tuntun, ṣùgbọ́n àwọn àtiwọlé ibi-ìpamọ́ data àti ìjàkadì fún àwọn ohun èlò ṣì lè fa
ìkójọpọ̀ sẹ́yìn.

Àwọn òṣìṣẹ́ ń ṣe iṣẹ́ lórí àwọn àkójọpọ̀ lọ́wọ́lọ́wọ́ àti èyí tí a dá dúró. Ìlànà àgbà ń yẹ àparí àti ipò ọmọ wò;
àwọn iṣẹ́ tí ó kùnà tàbí tí a kò lè fìdí rẹ̀ múlẹ̀ ń dá àwọn àkójọpọ̀ dúró fún àtúndánwò. Nígbà ìfọ̀mọ́ tí ó tóótun,
a lè ju àwọn àkójọpọ̀ òfo nù a sì lè tún àwọn àpẹẹrẹ tí ó kù kọ sínú bafa alààyè kí a tó ju àkójọpọ̀ nù. A kì í kàn
sọ àkójọpọ̀ tí kò ṣófo nù nítorí pé iṣẹ́ ti parí. Ṣàyẹ̀wò àwọn ìlà alààyè méjèèjì àti ti àkójọpọ̀ nígbà tí o bá ń ṣe
ìwádìí ìkójọpọ̀ iṣẹ́ tí ó pọ̀.

Èyí jẹ́ ìtọ́jú àtúndánwò, kì í ṣe ìdánilójú ààbò ìkùnà gbogbogbòò. Àwọn àṣìṣe ibi-ìpamọ́ data, iṣẹ́ tí ń wáyé lẹ́ẹ̀kan náà,
àwọn àbùkù ibi-ìpamọ́ àti ìbáramu àtìlẹ́yìn ṣì nílò ìfìdímúlẹ̀ nínú ètò tí a ń ṣiṣẹ́ lé lórí.

## Ìdí tí wíwo àwòrán graph fi lè ṣe àtúnṣe àwọn fáìlì rẹ̀

Ọ̀nà graph déédéé lè gbìyànjú àwọn àtúnṣe lórí ìbéèrè fún orísun data kọ̀ọ̀kan tí graph ń tọ́ka sí kí a tó yà á.
Kì í fọ gbogbo àpẹẹrẹ tí ń dúró nù láìsí àdéhùn: àwọn àyẹ̀wò olùkójọ, àwọn ipa ọ̀nà àsìkò gidi/orísun/àbájáde àṣìṣe,
àwọn ààlà ìbò tí ń ṣiṣẹ́, àwọn ààlà ìbéèrè àti àwọn ìkùnà àtúnṣe ní ipa lórí ohun tí ń ṣiṣẹ́. Àwọn àpẹẹrẹ tuntun
tàbí tí ó kùnà lè wà nínú ìlà síbẹ̀.

Graph tí ó dàbí tuntun nítorí náà kò fi hàn pé gbogbo igi RRD jẹ́ tuntun, àti bíbéèrè fún graph kò ṣe ìdánilójú
ìṣeré data tí ó yọrí sí rere. Yẹ àwọn àṣìṣe akọ̀wé wò, ọjọ́ orí ìlà àti àwọn àkókò RRD gidi. Àwọn àtìlẹ́yìn fáìlì nìkan
ń fo àwọn àpẹẹrẹ ibi-ìpamọ́ data tí ń dúró kọjá; wo [Ṣe àtìlẹ́yìn àti àmúpadàbọ̀sípò](/yo/guides/back-up-and-restore/).

## Ohun tí o fi sílẹ̀

**Títun ti àwọn fáìlì.** Àwọn àpẹẹrẹ máa ń wà nínú ibi-ìpamọ́ data títí tí a ó fi ṣe iṣẹ́ lórí wọn pẹ̀lú àṣeyọrí.
Ètò tí ó ní ìlera tí aago ń darí lè dínkù ní nǹkan bí àkókò ìfọ̀mọ́ kan; akọ̀wé tí ó kùnà tàbí tí kò tóbi tó lè
dínkù fún ìgbà pípẹ́ sí i. Ṣe àtìlẹ́yìn fún àwọn ìlà tí ń dúró àti àwọn fáìlì nígbà gbogbo.

**Ètò àkókò kejì.** Ṣe àbójútó ìbò àti ìfọ̀mọ́ lọ́tọ̀ọ̀tọ̀. Wo àwọn ìlà alààyè, àwọn àkójọpọ̀ tí a dá dúró, ọjọ́ orí
àpẹẹrẹ àtijọ́ jùlọ, àwọn òṣìṣẹ́ tí ó kùnà àti iye iṣẹ́ tí akọ̀wé ń ṣe. Tábìlì alààyè kò nílò láti di òfo nígbà tí
àwọn olùpèsè ṣì ń fi kún un, yíyípo nìkan sì lè mú kí ó dàbí kékeré láìsí pé ó parí àwọn àtúnṣe RRD kankan.

**Títò lẹ́sẹẹsẹ.** Àwọn fáìlì RRD kì í gba àwọn àkókò àtijọ́ lẹ́yìn àwọn àtúnṣe tuntun. Ọ̀nà Boost ti òde òní ń fo
àwọn àtúnṣe tí ó kọjá kọjá, ọ̀nà àtijọ́ sì ń ṣe àlẹ̀mọ́ àwọn àkókò lòdì sí àtúnṣe ìkẹyìn ti fáìlì náà. Àṣẹ kan tí
a gbà bí àṣeyọrí lè fo data àtijọ́ kọjá; fífúnni pẹ́ kò ṣe ìdánilójú pé àpẹẹrẹ yóò yọ nínú graph.

**Ojú iṣẹ́ ṣíṣe.** Bafa ibi-ìpamọ́ data wà, ìlànà ìfọ̀mọ́ pẹ̀lú ààlà ìrántí, àwọn òṣìṣẹ́ alájọṣiṣẹ́ tí a yàn, àti
àwọn àkójọpọ̀ tí a dá dúró tàbí àwọn àpẹẹrẹ tí a tún to sí orí ìlà láti bójútó. Àwọn ìkùnà akọ̀wé agbègbè sábà máa
ń dá àwọn àpẹẹrẹ dúró fún àtúndánwò, ṣùgbọ́n èyí kò fi àìpadánù kankan múlẹ̀ láti ìbẹ̀rẹ̀ dé òpin. Fún ipa ọ̀nà
ìpadàbọ̀ ọ̀nà jínjìn, wo [Ìkójọpọ̀ data láti ọ̀nà jínjìn](/yo/concepts/remote-data-collection/).

## Nígbà tí ó bá tọ́ láti lò ó

Ro nípa kíkọ tí a sún síwájú nígbà tí ìwọ̀n bá fi hàn pé akọ̀wé RRD ni ìdènà àti pé ibi-ìpamọ́ data ní àyè fún
bafa àti àwọn ìbéèrè àpapọ̀. Kò yọ ìdádúró ẹ̀rọ kúrò tàbí tún ibi-ìpamọ́ data tí ẹrù ń pa ṣe. Fi iye iṣẹ́, ọjọ́ orí
ìlà, títun ti fáìlì àti lílo ohun èlò wéra kí o tó tan án àti lẹ́yìn náà.

Poller pàtàkì ń tan àtúnṣe tí a sún síwájú fúnrarẹ̀ nígbà tí a bá tò olùkójọ data ọ̀nà jínjìn tí ó ń ṣiṣẹ́. Ètò
yẹn nìkan kò dá ibi-ìpamọ́ ọ̀nà jínjìn tí a fìdí rẹ̀ múlẹ̀ tàbí ìmúpadàbọ̀ sílẹ̀; lo àwọn ààlà tí ó wà nínú
[Ìkójọpọ̀ data láti ọ̀nà jínjìn](/yo/concepts/remote-data-collection/).

## Àbùdá ọ̀tọ̀ọ̀tọ̀ pẹ̀lú orúkọ kan náà

Àwọn àwòrán graph tí a yà tún lè wà nínú kache. Kache àwòrán ń dín àtún-yà kù; kíkọ tí a sún síwájú ń pèjọ àwọn
àpẹẹrẹ ibi-ìpamọ́ data sínú àwọn àtúnṣe RRD. Àwọn ètò wọn yàtọ̀, ṣùgbọ́n àwọn ipa ọ̀nà wọn ń ṣiṣẹ́ pọ̀: àwọn ìbéèrè
graph lè yẹ àwọn àpẹẹrẹ tí ń dúró wò kí wọ́n tó lo àwòrán tí a fi pamọ́, àwọn àtúnṣe tí ó yọrí sí rere sì lè mú
kí a ya àwòrán tuntun. Ṣe ìwọ̀n títun ti àwòrán lọ́tọ̀ kúrò nínú títun ti ìlà àti RRD.
