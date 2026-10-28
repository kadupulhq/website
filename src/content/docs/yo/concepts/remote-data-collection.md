---
title: Ìkójọpọ̀ data jíjìnnà
description: Ìdí tí ìkójọpọ̀ fi ń pín kiri tí ibi-ìpamọ́ kò sì pín kiri, ohun tí olùkójọ jíjìnnà ní, àti ohun tí ó ń ná láti ní ẹ̀dà kejì ti ìṣètò náà.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 9
---

:::caution[Ìwà aṣojú RRDtool tí a jogún]
Ìfiranṣẹ́ aṣojú (proxy) RRDtool kò ní àtìlẹyìn nínú Kadupul. Lo ibi-ìpamọ́ RRDtool agbègbè
(`storage_location = 0`). Àwọn ètò aṣojú, àpèjúwe àdéhùn àti àwọn ìlànà iṣẹ́
nínú ojú-ewé yìí ń ṣe àkọsílẹ̀ ìwà tí a jogún, kì í ṣe ọ̀nà ìfiranṣẹ́ tàbí ìṣíwájú tí a tì lẹ́yìn.
Wo [Aṣojú RRDtool](/yo/reference/rrdproxy/).
:::

Ìkójọpọ̀ ni apá tí kò lè wọ inú ẹ̀rọ kan ṣoṣo. Púpọ̀ nínú àkókò ìdìbò ni a ń lò
láti dúró de àwọn ẹ̀rọ láti dáhùn, àti pé dídúró kò lè kékúrú. O lè pín púpọ̀ nínú rẹ̀ pẹ̀lú àwọn ìlànà àti àwọn okùn (threads) púpọ̀ sí i,
títí dé ibi tí ẹ̀rọ agbàlejò olùkójọ yóò ti tán CPU tàbí tí ìrìn-àjò lọ-sílẹ̀ sí ibi jíjìnnà yóò fi gba gbogbo nǹkan kan.

Olùkójọ jíjìnnà (remote collector) jẹ́ kóòdù kan náà pẹ̀lú nọ́mbà ìdánimọ̀ olùkójọ ọ̀tọ̀, tí ń dìbò fún apá kan àwọn ẹ̀rọ.
Ẹ̀rọ kọ̀ọ̀kan ń dárúkọ olùkójọ tí ó ní ojúṣe lórí rẹ̀. Ìpín yẹn ni ìpín ètò ìṣètò déédéé.
Mú ìpín ẹ̀rọ àti kache olùdìbò tí a ṣe àdàkọ rẹ̀ dọ́gba; àṣàyàn ètò yìí kì í ṣe ẹ̀rí pé gbogbo kíkọ àbájáde ń fi agbára olùkójọ múlẹ̀.

Fún ìbéèrè nípa *ìgbà* tí a gbọ́dọ̀ lò ó, wo
[Fún olùdìbò ní agbára púpọ̀ sí i](/yo/guides/scale-the-poller/). Ojú-ewé yìí jẹ́ nípa ohun tí ó jẹ́ ní gidi.

## Ìdí tí olùkójọ fi ń gbé ibi-ìpamọ́ data tirẹ̀ dání

Olùkójọ tí ń ka àkójọ iṣẹ́ rẹ̀ láti inú ibi-ìpamọ́ data àárín lórí nẹ́tíwọ́ọ̀kì yóò dáwọ́ ìkójọpọ̀ dúró nígbà tí nẹ́tíwọ́ọ̀kì bá dáwọ́ dúró.
Èyí jẹ́ òdì kejì ohun tí o fẹ́ kí olùkójọ jíjìnnà ṣe.

Nítorí náà ó ń gbé ibi-ìpamọ́ data agbègbè kan tí ó ní ẹ̀dà tirẹ̀ ti ìṣètò: àwọn ètò, àwọn àpẹẹrẹ,
àwọn ọ̀nà ìtẹ̀bọ̀ data, àwọn ìbéèrè data, apá rẹ̀ nínú kache olùdìbò, àwọn ẹ̀rọ rẹ̀, ìṣètò àfikún,
àti àwọn tábìlì olùlò àti àwọn àṣẹ. Ẹ̀dà yẹn ni a ń tì jáde láti ibi ìfisórí-ẹ̀rọ àkọ́kọ́.
Wo ìfisórí-ẹ̀rọ àkọ́kọ́ gẹ́gẹ́ bí alẹ́ṣẹ lórí ìṣètò, nígbà tí olùkójọ ń pa ipò iṣẹ́ agbègbè àti àwọn ètò ẹ̀rọ mọ́.

Àwọn ètò ọ̀nà ni a yọ kúrò nínú ẹ̀dà náà, pẹ̀lú àwọn ìṣirò ti gbogbo iṣẹ́ tí ìfisórí-ẹ̀rọ àkọ́kọ́ ń pa mọ́ fún ara rẹ̀.
Àwọn ọ̀nà jẹ́ ohun ìní ti ẹ̀rọ kan, kì í ṣe ti gbogbo ìfisórí-ẹ̀rọ.

## Ṣíṣe àdàkọ ń wáyé ní déédéé, nítorí náà ìṣètò ń falẹ̀

Olùdìbò àkọ́kọ́ ń ṣàyẹ̀wò àwọn olùkójọ jíjìnnà tí a mú ṣiṣẹ́ pẹ̀lú agbàlejò ibi-ìpamọ́ data tí kì í ṣe ti agbègbè àti àkókò ìṣiṣẹpọ̀ tí kì í ṣe odo.
Olùkójọ kan tó láti ṣiṣẹ́ bí kò bá tíì ṣiṣẹpọ̀ rí, àkókò rẹ̀ ti kọjá, tàbí tí a sàmì sí i pé ó nílò ìṣiṣẹpọ̀.
Àkókò odo ń yọ ọ́ kúrò nínú àyẹ̀wò déédéé yìí, kódà nígbà tí a bá sàmì sí i pé ó nílò ìṣiṣẹpọ̀.

Àṣàyàn àpapọ̀ jẹ́ wákàtí méjì; olùkójọ lè ní àkókò tirẹ̀.
Èyí kì í ṣe ìdánilójú pé gbogbo àtúnṣe ń dúró de wákàtí méjì: àwọn iṣẹ́ ẹ̀rọ àti ti àfikún tún ní àwọn ọ̀nà àdàkọ tí a fojúsùn.
Ìtànkálẹ̀ aṣeyọrí dá lórí iṣẹ́ yẹn, ìsopọ̀ àti àwọn tábìlì tí a yàn.
Ṣàyẹ̀wò ìṣètò gidi ti olùkójọ àti kache dípò kí o ro pé ìbáramu lẹ́sẹ̀kẹsẹ̀ wà tàbí ìdúró kan pàtó.

A lè béèrè fún àdàkọ kíkún láti ọ̀dọ̀ olùkójọ àkọ́kọ́ pẹ̀lú
`php cli/poller_replicate.php`, nígbà tí a bá ṣètò àwọn olùkójọ jíjìnnà tí a mú ṣiṣẹ́.
Ó ń ṣe àdàkọ gbogbo olùkójọ jíjìnnà tí a mú ṣiṣẹ́ àyàfi bí `--poller=N` bá yan ọ̀kan pàtó.
Wo [Fún olùdìbò ní agbára púpọ̀ sí i](/yo/guides/scale-the-poller/) àti
[Kó lọ sí ẹ̀rọ kọ̀ǹpútà tuntun](/yo/guides/migrate-to-new-hardware/) fún àkóónú iṣẹ́.

## Àwọn ipò ìsopọ̀ mẹ́ta

Olùkójọ ń pinnu nígbà ìbẹ̀rẹ̀ bí yóò ṣe hùwà, dá lórí bóyá ibi-ìpamọ́ data àárín ń dáhùn àti bóyá ó ń mú àwọn àpẹẹrẹ tí kò tíì dé ibi tí a ń rán wọn lọ dání.

| Ipò | Ipò tí a nílò | Ìwà |
|---|---|---|
| Lórí ayélujára (Online) | Ibi-ìpamọ́ data àárín ń so pọ̀ kò sì sí àkójọ Boost agbègbè tí a rí | Àwọn kíkọ àbájáde ń fojúsùn ibi-ìpamọ́ data àárín |
| Kúrò lórí ayélujára (Offline) | Ìsopọ̀ àárín kùnà tàbí a fi tipátipá mú un wà láláìsí ayélujára | Ìkójọpọ̀ ń lo ìpamọ́ wẹ́rẹ́ ti agbègbè, bí àwọn iṣẹ́ agbègbè bá wà ní àlàáfíà |
| Ìmúbọ̀sípò (Recovery) | Ibi-ìpamọ́ data àárín ń so pọ̀ pẹ̀lú àwọn ìlà Boost agbègbè tí ó kù | Àwọn àpẹẹrẹ tuntun ń wà ní agbègbè nígbà tí ìlànà abẹ́lẹ̀ ń gbìyànjú láti gbé àkójọ kọjá |

Ipò kúrò lórí ayélujára kì í ṣe ipò àṣìṣe. Ó jẹ́ ìwà tí a ṣe fún olùkójọ tí ìsopọ̀ rẹ̀ já, ìdí nìyẹn tí olùkójọ fi ní ibi-ìpamọ́ data agbègbè ní ìbẹ̀rẹ̀.
Ìkójọpọ̀ ń tẹ̀síwájú pẹ̀lú ìṣètò tí ó wà ní agbègbè. Agbára ibi-ìpamọ́ data agbègbè, àǹfààní ẹ̀rọ, àlàáfíà olùṣètò àkókò àti àwọn ẹ̀rí ìdánimọ̀ tí ó ṣe é lò ṣì ṣe pàtàkì;
ipò kúrò lórí ayélujára kò ṣe ìdánilójú ìkójọpọ̀ tí kò ní ìdádúró tàbí ìfiranṣẹ́ ìkẹyìn.

## Bí àwọn àbájáde ṣe ń dé ibi ìfisórí-ẹ̀rọ àkọ́kọ́

Àwọn àbájáde kò rìnrìn àjò bí kíkọ RRD tààràtà. Wọ́n ń rìnrìn àjò bí àwọn ìlà data.

Kíkọ RRD tí a fà sẹ́yìn ṣe dandan nígbà tí ó bá ju olùkójọ kan lọ, àti fífi olùkójọ jíjìnnà kún un ń mú kí olùdìbò àkọ́kọ́ mú àtúnṣe tí a fà sẹ́yìn ṣiṣẹ́.
Ọ̀nà ìbẹ̀rẹ̀ náà tún ń mú Boost ètò àti ìdarí padà ṣiṣẹ́ nígbà tí àkọsílẹ̀ olùkójọ púpọ̀ bá wà.
Àwọn ètò wọ̀nyí nìkan kò fi hàn pé ìfiranṣẹ́ tí ń ṣiṣẹ́ dáadáa wà.
Wo [Kíkọ data tó pọ̀ gan-an](/yo/concepts/high-volume-writes/) fún ohun tí ipò yẹn ń ṣe.

Nígbà tí ó bá wà lórí ayélujára, olùkójọ ń tẹ àwọn àpẹẹrẹ rẹ̀ tààràtà sínú tábìlì ìpamọ́ àárín.
Ìfisórí-ẹ̀rọ àkọ́kọ́ ń tú wọn sínú àwọn fáìlì RRD lórí ètò àkókò tirẹ̀, gẹ́gẹ́ bí yóò ṣe ṣe fún àwọn àpẹẹrẹ tí ó kó jọ fúnra rẹ̀.
Àwọn àpẹẹrẹ olùkójọ kò ṣe pàtàkì lọ́tọ̀ nígbà tí wọ́n bá dé.

Kúrò lórí ayélujára àti nígbà ìmúbọ̀sípò, àwọn àpẹẹrẹ ń kó jọ sínú làkàkà Boost agbègbè.
Nígbà tí ibi-ìpamọ́ data àárín bá ṣe é dé lẹ́ẹ̀kan sí i, `poller_recovery.php` ń tẹ àwọn ìlà tí a pamọ́ sínú làkàkà Boost àárín,
ó ń sọ àbájáde ìlà tí ó ti wà níbẹ̀ tẹ́lẹ̀ dọ̀tun.

Ìmúbọ̀sípò ń pa ìlà agbègbè rẹ́ lẹ́yìn tí ìtẹ̀bọ̀ àárín fún àpò rẹ̀ bá yege nìkan, àti nígbà tí ìlà agbègbè ṣì bá ohun tí a rán mu.
Ìtẹ̀bọ̀ tí ó kùnà, àpẹẹrẹ tí ó tóbi jù tàbí ìlà tí a yípadà nígbà ìfọ̀mọ́ ń fi àwọn àpẹẹrẹ agbègbè sílẹ̀ fún àgbéyẹ̀wò tí ń bọ̀.
Ojú-ewé yìí kò dá ìlànà ìmúbọ̀sípò olùkójọ-púpọ̀ tí a fọwọ́ sí sílẹ̀.

Àwọn ìtẹ̀bọ̀ ìmúbọ̀sípò ń gbé àwọn àmì ìdánimọ̀ orísun data, orúkọ, àmì àkókò àti àwọn iye dání;
wọn kò yẹ àwọn ìlà yẹn wò lòdì sí àwọn ìpín olùkójọ. Má ṣe gbẹ́kẹ̀lé kíkọ̀ gbogbogbò láti dáàbò bo ara rẹ lòdì sí àwọn ìpín tí ó ti gbó tàbí àwọn olùgbéjáde tí ń bára wọn díje.
Múdájú àwọn ìpín àti ipò kache kí o tó mú ìkójọpọ̀ ṣiṣẹ́.

## Ibi-ìpamọ́ kò pín kiri

Ìlànà iṣẹ́ tí a jogún tí ó gbẹ́kẹ̀lé aṣojú ń pa àwọn fáìlì RRD mọ́ ní àárín ó sì ń retí kí àwọn olùkójọ dé ọ̀dọ̀ wọn nípasẹ̀ aṣojú RRDtool.
Ìlànà iṣẹ́ yẹn kò ní àtìlẹyìn nínú Kadupul; má ṣe kà á sí ìtọ́sọ́nà ìfiranṣẹ́.
Ọ̀nà ìpamọ́ olùkójọ-púpọ̀ tí a fọwọ́ sí nípa lílo RRDtool agbègbè gbọ́dọ̀ wà ní àkọsílẹ̀ kí a tó lè dámọ̀ràn àrọ́pò.

Èyí ni apá tí ó máa ń ya àwọn ènìyàn lẹ́nu jùlọ, nítorí náà ó yẹ kí a sọ ọ́ ní kedere.
**Àwọn olùkójọ jíjìnnà ń pín dídúró kiri, kì í ṣe kíkọ data.**
Tí ààlà tí o kọlu bá jẹ́ diski tí ó wà lábẹ́ igi RRD, agbára ìkójọpọ̀ àfikún kò ní yọ ààlà yẹn kúrò.
Àwọn àpẹẹrẹ púpọ̀ sí i tí ń wọlé lè mú kí ibi-ìpamọ́ data àárín àti àkójọ kíkọ pọ̀ sí i.

## Ohun mìíràn tí ń padà wá

Olùkójọ ní ipò iṣẹ́ ti àwọn ẹ̀rọ rẹ̀: dídé ibẹ̀, àṣìṣe tí ó kẹ́yìn, àwọn àkókò ìrìn-àjò lọ-sílẹ̀, iye ìdìbò, àti wíwà ní àrọ́wọ́tó.
Ó ń kọ wọ̀nyẹn sí agbègbè bí ó ṣe ń dìbò ó sì ń ti àwọn ọwọ̀n iṣẹ́ tí a yàn sí ibi ìfisórí-ẹ̀rọ àkọ́kọ́ ní àpapọ̀.
Èyí ń sọ àwọn ọwọ̀n yẹn dọ̀tun, kì í ṣe gbogbo ìlà ìṣètò ẹ̀rọ náà.

Nítorí náà ohun tí ìfisórí-ẹ̀rọ àkọ́kọ́ ń fi hàn fún dídé ẹ̀rọ jẹ́ ojú-ìwòye olùkójọ, láti ìgbà tí a ti ti data kẹ́yìn tí ó yọrí sí rere.
Olùkójọ tí kò sí lórí ayélujára ní ojú-ìwòye ti àwọn ẹ̀rọ tirẹ̀ ní àkókò yìí tí ẹnikẹ́ni ní ibi ìfisórí-ẹ̀rọ àkọ́kọ́ kò lè rí.

Ìfisórí-ẹ̀rọ àkọ́kọ́ ń tọpinpin àwọn olùkójọ ní ọ̀nà kan náà tí olùkójọ ń tọpinpin àwọn ẹ̀rọ.
Olùrànlọ́wọ́ àlàáfíà olùkójọ ń ka olùkójọ jíjìnnà tí a mú ṣiṣẹ́ sí pé ó wà lórí afẹ́fẹ́ nìkan nígbà tí àmì àkókò ipò ìkẹyìn rẹ̀ bá kéré sí ìlọ́po méjì àkókò ìdìbò tí a ṣètò.
Àyẹ̀wò yìí kò fi ìfiranṣẹ́ àpẹẹrẹ, àdàkọ aṣeyọrí tàbí àwọn àwòrán lọ́wọ́lọ́wọ́ hàn.

## Àwọn ọ̀nà ìkùnà

| Ohun tí ó kùnà | Ohun tí ń ṣẹlẹ̀ | Ohun tí o ń ṣe àkíyèsí rẹ̀ |
|---|---|---|
| Ìsopọ̀ sí ibi ìfisórí-ẹ̀rọ àkọ́kọ́ | Olùkójọ lè tẹ̀síwájú ní agbègbè níwọ̀n ìgbà tí ibi-ìpamọ́ data rẹ̀ àti olùṣètò bá wà ní àlàáfíà | Àwọn àwòrán tí ó pẹ́ àti làkàkà tí ń dàgbà; a gbọ́dọ̀ ṣàyẹ̀wò ìfiranṣẹ́ àti àdánù |
| Olùkójọ fúnra rẹ̀ | Àwọn ẹ̀rọ tí a yàn fún un lè má gba ìdìbò mọ́ | Àwọn àpẹẹrẹ tí ó sọnù; ṣe àyẹ̀wò olùṣètò, ẹ̀rọ àti ipò olùkójọ |
| Ṣíṣe àdàkọ | Olùkójọ ń lo ìṣètò àtijọ́ | Àwọn àtúnṣe dà bíi pé wọn kò ṣiṣẹ́ |
| Ibi-ìpamọ́ data àárín | Àwọn ìlànà jíjìnnà lè wọ ipò kúrò lórí ayélujára nígbà tí ìṣètò ìsopọ̀ bá kùnà | Ìmúlò data àárín bàjẹ́; ìpamọ́ wẹ́rẹ́ jíjìnnà dá lórí àlàáfíà agbègbè |
| Àwọn ìpín tí ń kọ lu ara wọn tàbí ti àtijọ́ | Olùgbéjáde tí ó ju ọ̀kan lọ lè gbé àwọn àpẹẹrẹ tí ó jọra wọlé | Kò sí kíkọ̀ ìfiranṣẹ́ gbogbogbò; ṣàyẹ̀wò àwọn ìpín, àmì àkókò àti àṣìṣe kíkọ |

Ìpamọ́ wẹ́rẹ́ lè yí àwọn ìdádúró kan padà sí àwọn ìfalẹ̀, ṣùgbọ́n kì í ṣe pé ìfiranṣẹ́ kò ní pàdánù data.
Ṣàyẹ̀wò ọjọ́-orí làkàkà, agbára ibi-ìpamọ́ data, àwọn àṣìṣe ìmúbọ̀sípò àti àwọn àmì àkókò RRD tí ó jáde.
Àwòrán tí ó tẹ́jú nìkan kò lè ya ìdádúró ẹ̀rọ sọ́tọ̀ kúrò nínú ìfiranṣẹ́ tí ó pẹ́ tàbí tí ó kùnà.

## Kí ni iye owó rẹ̀

Lòdì sí olùdìbò àárín kan ṣoṣo:

**O ń jèrè** àwọn ìrìn-àjò ẹ̀rọ lẹ́gbẹ̀ẹ́kẹ́gbẹ́ kọjá àwọn ẹ̀rọ kọ̀ǹpútà, ìdìbò tí ń ṣẹlẹ̀ nítòsí àwọn ẹ̀rọ dípò kíkọjá lórí WAN,
àti agbára láti tẹ̀síwájú nínú ìkójọpọ̀ agbègbè nígbà tí a kò bá lè dé ibi ìfisórí-ẹ̀rọ àkọ́kọ́, ní ìbámu pẹ̀lú àwọn ààlà ìmúbọ̀sípò àti àlàáfíà agbègbè tí ó wà lókè.

**O ń san owó** pẹ̀lú àdàkọ ìṣètò tí ó lè falẹ̀, ibi-ìpamọ́ data kejì láti ṣiṣẹ́, láti bójútó, àti láti ṣe àtìlẹyìn fún olùkójọ kọ̀ọ̀kan,
ipò kíkọ tí a fà sẹ́yìn tí kì í ṣe ti àṣàyàn mọ́, àti ibi-ìpamọ́ data àárín tí ó ń gba àwọn kíkọ data ní àkókò kan náà láti ọ̀dọ̀ olùkójọ kọ̀ọ̀kan.

Àkópọ̀ òtítọ́ ni pé olùkójọ jíjìnnà jẹ́ ẹ̀rọ kọ̀ǹpútà pipe tí o gbọ́dọ̀ máa darí báyìí.
Olùdìbò kan pẹ̀lú àwọn ìlànà púpọ̀ sí i jẹ́ ètò lásán. Olùkójọ jẹ́ ètò amáyédẹrùn, pẹ̀lú ibi-ìpamọ́ data tirẹ̀,
àwọn ẹ̀rí ìdánimọ̀ tirẹ̀, aago tirẹ̀, àti ẹ̀dà òtítọ́ tirẹ̀ fún gbogbo àkókò tí a kò bá tíì ṣe àdàkọ.
