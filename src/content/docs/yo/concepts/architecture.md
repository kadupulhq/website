---
title: Àkópọ̀ Ètò
description: Àwọn ẹ̀yà mẹ́rin tó ń gbé iṣẹ́ ṣe, àti èyí tí ó sábà máa ń fa àṣìṣe.
sidebar:
  order: 1
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
---

:::caution[Ìṣe aṣojú RRDtool tí a jogún]
Ìgbésẹ̀ aṣojú RRDtool kò ní àtìlẹ́yìn nínú Kadupul. Lo ibi ìpamọ́ RRDtool agbègbè (`storage_location = 0`). Àwọn ètò aṣojú, àpèjúwe àdéhùn àti àwọn ìṣàn iṣẹ́ lórí ojú-ewé yìí ń ṣe àkọsílẹ̀ ìṣe tí a jogún, kì í ṣe ìgbésẹ̀ tàbí ipa-ọ̀nà ìṣípòpadà tí a tì lẹ́yìn. Wo [Aṣojú RRDtool](/yo/reference/rrdproxy/).
:::

Ìṣàfilọ́lẹ̀ wẹ́ẹ̀bù Kadupul, ibi-ìpamọ́ détà, ìgbàsílẹ̀ détà tí a ṣètò àti ibi ìpamọ́ RRD ní àwọn iṣẹ́ ọ̀tọ̀ọ̀tọ̀, ṣùgbọ́n àwọn ipa-ọ̀nà ìmúṣẹ wọn ń bá ara wọn mu. Mímọ iṣẹ́ tí ó kùnà ń ran ìwádìí lọ́wọ́ láti dín àyè àṣìṣe kù; ojú-ọ̀nà ìbánisọ̀rọ̀ tí ó ń ṣiṣẹ́ kò fìdí rẹ̀ múlẹ̀ pé ìgbàsílẹ̀ détà ń lọ déédéé.

**Ojú-ọ̀nà ìbánisọ̀rọ̀ wẹ́ẹ̀bù** jẹ́ ìṣàfilọ́lẹ̀ PHP kan. Ó ń bójútó ìṣètò, ó sì ń ṣe àgbékalẹ̀ tàbí pípèsè àwọn àwòrán tí a fipamọ́. Àwọn ìgbésẹ̀ wẹ́ẹ̀bù kan tún ń mú kí ìgbàsílẹ̀ détà bẹ̀rẹ̀, bíi àwọn ìbéèrè àwòrán ní àkókò gidi, àti pé àwọn ìbéèrè àwòrán déédéé lè mú kí àwọn ìmúdàgbàsókè RRD tí ń dúró bẹ̀rẹ̀.

**Ibi-ìpamọ́ détà** ní ìṣètò, àwọn àṣẹ, ipò iṣẹ́, cache poller àti àwọn ìlà ìdúró ìwọ̀n. Àwọn iye tí a gbà lè dúró síbẹ̀ nígbà tí wọ́n bá ń dúró de kíkọ sí RRD tàbí àtúngbéyẹ̀wò; kì í ṣe ibi ìpamọ́ ìṣètò nìkan.

**Poller** ń ṣètò iṣẹ́ tí a yàn àti àwọn ọmọ-iṣẹ́ agbàdétà. Àwọn àbájáde ń gba inú àwọn ìlà ìdúró ibi-ìpamọ́ détà kọjá kí akọ̀wé déédéé tàbí èyí tí a sún síwájú tó ṣe ìmúdàgbàsókè àwọn fáìlì RRD.

**Àwọn fáìlì RRD** ní àwọn ìtàn àkókò tí a díwọ̀n sínú. Orísun détà kan sábà máa ń ní RRD kan tí ó ní àwọn pápá rẹ̀; ìṣẹ̀dá àwòrán lè tún lo àwọn orísun, àti pé ṣíṣe metadata kò fúnni ní ìdánilójú pé fáìlì náà wà tẹ́lẹ̀.

## Àwọn ààlà

| Ààlà | Ohun tí ń kọjá | Ohun tó ń gbé e |
|---|---|---|
| Ojú-ọ̀nà wẹ́ẹ̀bù sí ibi-ìpamọ́ détà | Ìṣètò, àwọn àkókò ìwọlé, àṣẹ, iṣẹ́ tí a fipamọ́ àti détà iṣẹ́ | SQL; ibi-ìpamọ́ détà lè wà lórí ẹ̀rọ jíjìnnà |
| Ojú-ọ̀nà wẹ́ẹ̀bù sí àwọn fáìlì | Kíkà àwòrán, àwọn àwòrán tí a fipamọ́, àti ìmúdàgbàsókè tàbí ìṣẹ̀dá RRD lórí ìbéèrè | Ètò fáìlì àti RRDtool |
| Poller sí ibi-ìpamọ́ détà | Àwọn àkójọ iṣẹ́, àwọn iye tí a gbà, àwọn ìlà tí a dá dúró, ipò àti kíkà sẹ́yìn | SQL |
| Ìgbàsílẹ̀ sí àwọn ẹ̀rọ | SNMP, àwọn ìwé-àṣẹ ìgbàsílẹ̀ àti àyẹ̀wò ìrọ̀wọ́sí | Àwọn àṣẹ nẹ́tíwọ́ọ̀kì tàbí ti agbègbè; ìgbàsílẹ̀ tí wẹ́ẹ̀bù ń mú wá tún ṣeé ṣe |
| Akọ̀wé sí àwọn fáìlì | Àwọn àpẹẹrẹ tí a kó jọ, bóyá àwọn àmì àkókò mélòó kan fún ìmúdàgbàsókè kọ̀ọ̀kan | Àwọn àṣẹ RRDtool àti àwọn páìpù tí a fọwọ́sí |
| Olùpèsè ibi-ìpamọ́ détà sí àwọn fáìlì RRD | Kò sí ìmúdàgbàsókè RRD tààrà nínú ipa-ọ̀nà ìṣàfilọ́lẹ̀ déédéé | Kóòdù akọ̀wé ìṣàfilọ́lẹ̀ ń ṣètò àwọn ibi ìpamọ́ méjèèjì |

Àwọn ìlà ibi-ìpamọ́ détà ń so orísun détà pọ̀ mọ́ ẹ̀rọ kan àti ipa-ọ̀nà fáìlì tí a ṣètò fún un. Àwọn fáìlì RRDtool ń ṣe àpèjúwe àwọn ìtòlẹ́sẹẹsẹ àti àwọn àkójọ; wọn kò dípò àfihàn ìṣàfilọ́lẹ̀ yẹn. Ìrìn-àjò nẹ́tíwọ́ọ̀kì kò mọ mọ́ ìwádìí ẹ̀rọ nìkan: àwọn ìsopọ̀ ibi-ìpamọ́ détà, àwọn agbàdétà jíjìnnà àti àwọn ìṣọ̀kan míràn tí a ṣètò lè kọjá àwọn agbàlejò pẹ̀lú.

Ṣe àpamọ́ détà ipò ibi-ìpamọ́ détà, àwọn àpẹẹrẹ tí ń dúró àti àwọn fáìlì RRD ní ìbámu. Mímú ibi-ìpamọ́ détà nìkan padà kò ní mú àwọn àkóónú RRD àtijọ́ padà, àti mímú àwọn fáìlì nìkan padà yóò fi ìṣètò àti àwọn àpẹẹrẹ tí a kò tíì kọ sílẹ̀ sílẹ̀. Gbigbe àwọn fáìlì láìṣe àtúnṣe àwọn ipa-ọ̀nà lè fa àwọn àṣìṣe fáìlì tí kò sí tàbí kíkọ tí a dá dúró; kì í ṣe ìkùnà ìgbàsílẹ̀ tí ó dákẹ́ tí a fọwọ́ sọ̀yà. Wo [Ṣe àpamọ́ détà kí o sì mú padà](/yo/guides/back-up-and-restore/) àti [Ṣe ìṣípòpadà sí ohun-èèlò tuntun](/yo/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Ìdí tí ìtàn àkókò gígùn fi ń lo àwọn fáìlì RRD

Ìtàn àwòrán àkókò gígùn ni a tọ́jú sínú RRDs, ṣùgbọ́n àwọn ìlà ìdúró ìwọ̀n wà nínú ibi-ìpamọ́ détà. Ìlà ìdúró déédéé tí ń ṣiṣẹ́ lọ́wọ́ jẹ́ InnoDB nínú àtúnkọ yìí, àti kíkọ tí a sún síwájú ń pa àwọn àpẹẹrẹ mọ́ sínú àwọn tábìlì Boost. Àwọn kíkọ tí ó kùnà tàbí ìfiranṣẹ́ jíjìnnà tí ó pẹ́ lè mú kí àwọn ìlà ìdúró yẹn pọ̀ sí i. Wo [Kíkọ iwọ̀n gíga](/yo/concepts/high-volume-writes/).

RRD kan ń pèsè iye ìlà tí a ti pàṣẹ ní àwọn ìpinnu tí a yàn. Àwọn ìmúdàgbàsókè déédéé ń tún àyè yẹn lò dípò kí wọ́n máa fi ìtàn kún un láìlópin. Ìwọ̀n fáìlì ní ààlà fún àkópọ̀ tí kò yípadà; fífi àwọn orísun détà kún un, yíyí àkópọ̀ padà, pípa àwọn ẹ̀dà ìmúpadà mọ́ tàbí kíkó àwọn ìlà jọ ṣì ń mú kí gbogbo àwọn àìní ibi ìpamọ́ pọ̀ sí i.

Àdéhùn náà ni ìpamọ́ tí a yàn tẹ́lẹ̀. Ní kété tí ìtàn kíkún bá ti parí tàbí tí a ti kó o jọ, ìyípadà àkópọ̀ lẹ́yìn náà kò lè tún àwọn kúlẹ́kúlẹ́ tí a sọ nù ṣe. Wo [Àwọn orísun détà àti àwọn àkójọ round-robin](/yo/concepts/data-sources-and-rras/).

Ìṣètò àti ipò iṣẹ́ ń lo ibi-ìpamọ́ détà nítorí pé ìṣàfilọ́lẹ̀ náà nílò àwọn ìmúdàgbàsókè tí a pín àti àwọn ìbéèrè ìbátan. Èyí kò túmọ̀ sí pé gbogbo àjọṣe ni a fi kọ́kọ́rọ́ àjèjì ibi-ìpamọ́ détà múlẹ̀, tàbí pé ibi ìpamọ́ ìlà gbọ́dọ̀ máa pọ̀ sí i títí láé; ó ń ṣe àpèjúwe pípín ojúṣe ìṣàfilọ́lẹ̀ yìí.

## Àwọn ipa-ọ̀nà méjì, tí ń pín àwọn ẹ̀yà méjì

Ojú-ewé déédéé kan tàbí ìbéèrè àwòrán sábà máa ń tẹ̀lé ipa-ọ̀nà yìí:

1. Burausa kan ń fi ìbéèrè ránṣẹ́; PHP ń gbé ìṣètò jáde ó sì ń sopọ̀ mọ́ ibi-ìpamọ́ détà.
2. Ìbéèrè náà ń lo ìjẹ́rìí àti àṣẹ agbègbè/ohun tí ó yẹ.
3. Àwọn iṣẹ́ konsolu ń ka tàbí ṣe ìmúdàgbàsókè ìṣètò ó sì lè mú iṣẹ́ míràn wá.
4. Ìbéèrè àwòrán lè ṣàyẹ̀wò àwọn àpẹẹrẹ Boost tí ń dúró àti cache àwòrán, tàbí kí ó kó àṣẹ RRDtool jọ kí ó sì ka àwọn fáìlì tí a ṣètò. Wo [Bí a ṣe ń ya àwọn àwòrán](/yo/concepts/how-graphs-are-drawn/).
5. Àwọn ìbéèrè àwòrán àkókò gidi lè bẹ̀rẹ̀ agbàdétà àkókò gidi kí wọ́n sì lo détà ìgbàdíẹ̀ ọ̀tọ̀. Àwòrán pẹẹbẹ nìkan kò fìdí rẹ̀ múlẹ̀ pé fáìlì kò ní nǹkan nínú tàbí pé ìgbàsílẹ̀ àti àgbékalẹ̀ yọrí sí rere.

Ìwádìí tí a ṣètò sábà máa ń tẹ̀lé ipa-ọ̀nà yìí:

1. Olùṣètò àkókò ń bẹ̀rẹ̀ poller, èyí tí ń ṣàyẹ̀wò ipò mímúṣiṣẹ́, àkókò àti ibi ìpamọ́.
2. Ó ń yan iṣẹ́ tí ó yẹ láti inú cache poller ó sì ń bẹ̀rẹ̀ àwọn ọmọ-iṣẹ́ agbàdétà.
3. Àwọn ọmọ-iṣẹ́ ń béèrè lọ́wọ́ àwọn ẹ̀rọ tàbí kí wọ́n ṣiṣẹ́ àwọn ìwé-àṣẹ ìgbàsílẹ̀ kí wọ́n sì fi àbájáde pamọ́ sínú ibi-ìpamọ́ détà.
4. Akọ̀wé tí ó yẹ ń ṣe àgbékalẹ̀ àwọn àpẹẹrẹ tí a kó jọ, ní lílo àwọn ìlà tí a sún síwájú nígbà tí a bá ṣètò rẹ̀ àti pípa àwọn ìkùnà tí a lè tún gbìyànjú mọ́.
5. Ipò iṣẹ́ àti ipò ìṣètò ni a ń sọ di tuntun nínú ibi-ìpamọ́ détà.

Wo [Ìṣàn ayé poller](/yo/reference/poller-lifecycle/) fún ìtòlẹ́sẹẹsẹ àti bí a ṣe ń bójútó ìkùnà. Àwọn ipa-ọ̀nà wọ̀nyí ń pín àwọn ohun-èlò ibi-ìpamọ́ détà àti ti ibi ìpamọ́ wọn sì lè bára wọn jiyàn fún wọn. Títún ẹ̀rọ amúnisìn wẹ́ẹ̀bù bẹ̀rẹ̀ kò ní tún poller tí a ṣètò lọ́tọ̀ ṣe, ṣùgbọ́n àwọn ìbéèrè wẹ́ẹ̀bù lè kópa nínú ìgbàsílẹ̀ àti kíkọ; ṣe àyẹ̀wò iṣẹ́ tí ó kùnà gan-an.

## Ohun tí ń ṣiṣẹ́ bí olùlò wo

| Ìṣesí | Ń ṣiṣẹ́ bí | Tí ó bẹ̀rẹ̀ nípasẹ̀ |
|---|---|---|
| Ìṣàfilọ́lẹ̀ wẹ́ẹ̀bù PHP | Àkópọ̀ olùpèsè wẹ́ẹ̀bù tàbí àkópọ̀ PHP-FPM | Olùpèsè wẹ́ẹ̀bù |
| Poller tí a ṣètò | Àkọọ́lẹ̀ olùṣètò àkókò tí a ṣètò | cron, Olùṣètò Iṣẹ́, tàbí iṣẹ́ tí a ṣètò |
| RRDtool | Sábà máa ń jogún àkọọ́lẹ̀ ìṣesí tí ó bẹ̀rẹ̀ rẹ̀ | Ipá-ọ̀nà wẹ́ẹ̀bù, poller tàbí ti àtúnṣe |
| Àwọn ìwé-àṣẹ ìgbàsílẹ̀ | Sábà máa ń jogún àkọọ́lẹ̀ agbàdétà wọn | Ìgbàsílẹ̀ tí a ṣètò tàbí tí wẹ́ẹ̀bù mú wá |

Gbogbo àwọn àkọọ́lẹ̀ akọ̀wé tí ń kópa nílò àyè gbígbà tí ó yẹ sí ibi ìpamọ́ tí a ṣètò. Ìṣẹ̀dá orísun détà déédéé ń kọ metadata; a lè dá RRD sílẹ̀ lẹ́yìn náà nígbà tí akọ̀wé bá nílò rẹ̀. Fáìlì tí kò sí lè fi hàn pé ìgbàsílẹ̀ kò tíì dé ibi yìí, pẹ̀lú ìkùnà ipa-ọ̀nà, ìgbẹ́kẹ̀lé, àṣẹ tàbí ti ìṣẹ̀dá.

Àwọn ipa-ọ̀nà ìṣẹ̀dá kan tí a ń darí gẹ́gẹ́ bí root máa ń gbìyànjú láti lo olówó àti ẹgbẹ́ ti folda RRA. Àwọn ìgbìyànjú wọ̀nyí lè kùnà kí wọ́n sì kọ àwọn àṣìṣe sílẹ̀; wọn kì í ṣe àfidípò fún títò àwọn àkọọ́lẹ̀ iṣẹ́ lọ́nà tí ó tọ́. Ìní tí kì í ṣe ti root ń tẹ̀lé àwọn òfin ètò iṣẹ́, títí kan ìjogún ẹgbẹ́ folda àti ACLs. Fọwọ́sí àwọn àṣẹ ibi ìpamọ́ àti àwọn ètò UID/GID tí a gbẹ́kẹ̀lé lábẹ́ gbogbo àkọọ́lẹ̀ akọ̀wé wẹ́ẹ̀bù àti poller. Wo [Ṣe àtúnṣe sí ipele gíga láìséwu](/yo/guides/upgrade-safely/).

Ìṣàfilọ́lẹ̀ PHP ICMP tí a ṣe àyẹ̀wò ń pe ohun-èlò ping ti ètò iṣẹ́. Agbára rẹ̀ láti fi àwọn àyẹ̀wò ránṣẹ́ sinmi lórí ohun-èlò yẹn àti ètò OS; wíwà àwọn olùrànlọ́wọ́ UID tó wúlò ti àtijọ́ kò túmọ̀ sí pé àyẹ̀wò ICMP kọ̀ọ̀kan ń gbé PHP ga sí root. Má ṣe darí ìṣàfilọ́lẹ̀ náà bí root kìkì láti jẹ́ kí ping ṣiṣẹ́. Ṣàyẹ̀wò àṣẹ gidi, àkọọ́lẹ̀ àti àbájáde àṣìṣe; àwọn àyẹ̀wò TCP tàbí UDP ní àwọn ìtumọ̀ ìrọ̀wọ́sí ọ̀tọ̀ọ̀tọ̀.

## Àkójọ iṣẹ́ ni a ti ṣírò tẹ́lẹ̀

Cache poller ń tọ́jú iṣẹ́ ìgbàsílẹ̀ tí a ti yanjú kí ìṣiṣẹ́ kọ̀ọ̀kan má bàa wá gbogbo àṣẹ láti inú àwọn àjọṣepọ̀ àdàkọ. Àwọn iṣẹ́ ìṣètò lè tún àwọn àkọsílẹ̀ tí ó kan kọ; àwọn irinṣẹ́ àtúnkọ kedere wà ní àrọ́wọ́tó nígbà tí ó bá yẹ.

Àwọn ìyípadà tí a fihàn nínú àwọn pápá tí a fipamọ́ gbọ́dọ̀ dé àwọn àkọsílẹ̀ yẹn kí ìgbàsílẹ̀ tó lò wọ́n. Àwọn ètò míràn ni a ń kà lọ́tọ̀, nítorí náà kì í ṣe gbogbo ìyípadà ìṣètò ló ń béèrè àtúnkọ cache pẹ̀lú ọwọ́. Ṣàyẹ̀wò àkóónú cache, àwọn àṣìṣe ìgbàsílẹ̀ àti ipò ìṣẹ̀dá ẹ̀dà jíjìnnà dípò fífura sí ìdí kan ṣoṣo. Wo [Cache poller](/yo/concepts/the-poller-cache/) àti [Ìgbàsílẹ̀ détà jíjìnnà](/yo/concepts/remote-data-collection/).

## Níbi tí àwọn nǹkan ti sábà máa ń bàjẹ́

| Àmì àrùn | Àwọn àyẹ̀wò tí ó wúlò |
|---|---|
| Ojú-ọ̀nà ń ṣiṣẹ́, àwọn àwòrán pẹẹbẹ | Ìṣiṣẹ́ olùṣètò àkókò, àwọn àṣìṣe ìgbàsílẹ̀, àwọn ìlà, tútù ti àpẹẹrẹ àti fèrèsé àwòrán |
| Poller ń ṣiṣẹ́, àwọn fáìlì kò tẹ̀síwájú | Ìjẹ́wọ́/àṣìṣe akọ̀wé, ìgbẹ́kẹ̀lé ibi ìpamọ́ àti àwọn àṣẹ, àwọn iṣẹ́ tí a sún síwájú |
| Orísun détà kan ṣoṣo jẹ́ pẹẹbẹ | Ìdáhùn ẹ̀rọ, ìlà cache, ìbámu fáìlì, àwọn àpẹẹrẹ tí a kò mọ̀ àti àwọn ọ̀rọ̀ yíyà |
| Ìyípadà ìṣètò dàbí ẹni pé kò ní ipa | Àbájáde ìfipamọ́, àwọn ìtẹ̀mọ́lẹ̀ àdàkọ, àwọn àkọsílẹ̀ cache tí ó kan àti àtúnṣe |
| Àwọn àlàfo déédéé | Àkókò, heartbeat, àkókò ìdúró, wíwà ẹ̀rọ àti àwọn ìkùnà kíkọ |
| Àwòrán tí a kò retí | Àṣẹ tí a dá, àwọn àṣàyàn CDEF/CF, détà fáìlì gidi, cache àwòrán àti ìbámu |
| Ìtàn ibùdó dàbí ẹni pé ó so mọ́ ojú-ọ̀nà míràn | Ìdánimọ̀ ìbéèrè, títún nọ́mbà ṣe àti àwọn àbájáde àtúnṣe ìtọ́kasí |
| Àkọọ́lẹ̀ rí konsolu ṣùgbọ́n kò rí àwòrán | Agbègbè ojú-ewé àwòrán, àṣẹ ohun àti ìdánimọ̀ àwòrán tí a béèrè |
| Àwọn agbàdétà yàtọ̀ síra | Ìpínlẹ̀, ìṣètò tí a da kọ, àwọn ìtẹ̀mọ́lẹ̀ agbègbè àti ipò ìsopọ̀ |
| Ohun gbogbo ń lọ lọ́ra | Ìdúró ibi-ìpamọ́ détà, ìforígbárí akọ̀wé/ibi ìpamọ́, àkókò ìṣiṣẹ́ agbàdétà àti ẹrù wẹ́ẹ̀bù |
| Metadata orísun détà wà ṣùgbọ́n fáìlì kò sí | Ìgbàsílẹ̀/kíkọ àkọ́kọ́, ipa-ọ̀nà tí a ṣètò, ìgbẹ́kẹ̀lé àti àwọn àṣìṣe ìṣẹ̀dá |

Àwọn wọ̀nyí jẹ́ ibi ìbẹ̀rẹ̀, kì í ṣe àyẹ̀wò àìsàn pípé. Tẹ̀lé ẹ̀rí náà kọjá ààlà tí ó yẹ kí o sì fìdí àbájáde múlẹ̀ lẹ́yìn ìyípadà kan. Wo [Ṣe àtúnṣe détà tí kò sí](/yo/guides/troubleshoot-missing-data/).
