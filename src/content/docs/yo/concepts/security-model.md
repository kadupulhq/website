---
title: Àpẹẹrẹ ààbò
description: Níbi tí data tí a kò gbẹ́kẹ̀lé ti ń wọ Kadupul, ìlànà wo ló ń ṣiṣẹ́ pẹ̀lú àǹfààní wo, ohun tí àkọọ́lẹ̀ ibi-ìpamọ́ data lè ṣe, àti àwọn ààlà tí kóòdù ń fipá múlẹ̀ dípò kí ó kàn rò ó lásán.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 12
---

Ètò ìṣọ́ jẹ́ ohun tí ó ṣòro láti gbèjà, fún àwọn ìdí mẹ́ta tí kò ní nǹkan kan ṣe pẹ̀lú dídára kóòdù.

Ó ń mú àwọn ẹ̀rí ìdánimọ̀ dání fún ohun gbogbo tí ó ń wò. Àwọn àwujọ SNMP, àwọn orúkọ olùlò v3 àti àwọn ọ̀rọ̀ ìgbaniwọlé,
àti ohunkóhun mìíràn tí ẹ̀rọ kan nílò ni a tọ́jú kí olùdìbò lè lò wọ́n láìsí àbójútó ènìyàn.
Kò sí ènìyàn láti tẹ̀ wọ́n síbẹ̀ ní gbogbo ìṣẹ́jú márùn-ún.

Ó ń ṣe àwọn àṣẹ lórí ètò àkókò kan. Gbígba iye kan tí SNMP kò fi hàn túmọ̀ sí ṣíṣe àkọsílẹ̀ lẹ́tà (script),
àti pé ìtumọ̀ àkọsílẹ̀ yẹn jẹ́ ìṣètò, tí a pamọ́ sínú ibi-ìpamọ́ data tí a sì lè túnṣe nípasẹ̀ ojú-ọ̀nà náà.

Ó ń gba data tí àwọn ẹ̀rọ tí ó ń wò ń gbé jáde wọlé. Àpèjúwe kafaradata, ojú-ọ̀nà tí a gbé diski kọ́, orúkọ ohun ìmọ̀lára:
gbogbo rẹ̀ ń wá láti ọ̀dọ̀ ẹ̀rọ náà, gbogbo rẹ̀ sì ń parí sí inú ibi-ìpamọ́ data, nínú àwọn orúkọ àwòrán, àti nínú àwọn àríyànjiyàn tí a fún àwọn ètò mìíràn.
Swichi tí a ti bàjẹ́ jẹ́ orísun ìtẹ̀bọ̀, kì í ṣe ẹni tí a ṣẹ̀ nìkan.

Kò sí èyíkéyìí nínú àwọn wọ̀nyí tí ó jẹ́ àbùkù. Wọ́n jẹ́ ohun tí iṣẹ́ náà nílò. Ohun tí ó tẹ̀lé e ni ibi tí ọ̀kọ̀ọ̀kan wọn ń balẹ̀ sí nínú àgbékalẹ̀ ètò náà.

## Níbi tí data tí a kò gbẹ́kẹ̀lé ti ń wọlé

Àwọn ojú-ọ̀nà ìwọlé mẹ́rin, ní títẹ̀lé bí olùdarí ṣe ń darí wọn sí.

| Ojú-ọ̀nà ìwọlé | Orísun | Níbi tí ó ń lọ |
|---|---|---|
| Àwọn pàrámítà HTTP | Ẹnikẹ́ni tí ó lè dé ọ̀dọ̀ olupin wẹ́ẹ̀bù | Ibi-ìpamọ́ data, àbájáde ojú-ewé, àti SQL |
| Àwọn iye SNMP | Ẹ̀rọ tí a ń dìbò fún | `host_snmp_cache`, àwọn orúkọ àwòrán, àwọn ààlà RRD, àwọn àríyànjiyàn àkọsílẹ̀ |
| Àbájáde àkọsílẹ̀ | Àkọsílẹ̀ agbègbè, tàbí ohunkóhun tí ó bá sọ̀rọ̀ | `poller_output`, lẹ́yìn náà àwọn fáìlì RRD |
| Àwọn àpẹẹrẹ àti àwọn àpò tí a gbé wọlé | Ẹnikẹ́ni tí ó di agbègbè ìgbéwọlé mú | Àwọn ìlà àpẹẹrẹ, àti fún àwọn àpò, àwọn fáìlì lórí diski |

### Àwọn pàrámítà HTTP

Àwọn olùrànlọ́wọ́ ìbéèrè wà nínú `lib/html_utility.php`. `get_filter_request_var()` ń lo
ìfọwọ́sí nọ́mbà lẹ́kùnrẹ́rẹ́ ní àkọ́kọ́, ṣùgbọ́n ó tún ní àwọn ọ̀ràn pàtàkì fún àwọn iye tí ó ṣófo, tí kò ní ìtumọ̀ àti àwọn gbólóhùn regex.
Olùpè ṣì nílò láti ṣàyẹ̀wò bóyá a nílò iye kan tí ó sì yẹ fún iṣẹ́ náà. Ṣíṣe àlẹ̀mọ́ kì í ṣe ẹ̀rí àṣẹ.

`set_request_var()` ń tọ́jú iye kan sínú `$_CACTI_REQUEST` ó sì ń fi hàn nínú àwọn array ìbéèrè.
`get_nfilter_request_var()` ń ka kache yẹn tàbí ìbéèrè tútù kò sì fọwọ́ sí tàbí kọ iye náà fúnra rẹ̀.
Nítorí náà àwọn kíkà tí ń bọ̀ lẹ́yìn lè rí iye tí a ti tọ́jú tẹ́lẹ̀, àti pé ètò kíkà ṣe pàtàkì.

Pẹ̀lú `log_validation` tí a mú ṣiṣẹ́, `get_request_var()` ń kọ àwọn kíkà ìbéèrè kan tí a kò fi pamọ́ sínú kache sílẹ̀.
Kíkà tààràtà ti àwọn oníyípadà àpapọ̀ (superglobals) àti `get_nfilter_request_var()` ni a kò bò mọ́lẹ̀ pátápátá.
Ìrànwọ́ ìwádìí ni, kì í ṣe àyẹ̀wò ìmúdájú kíkún tàbí ìmúṣẹ agbára ààbò.

### Àwọn iye SNMP

Àwárí ìbéèrè data ń tọ́jú àwọn iye atọ́ka tí a yàn sínú `host_snmp_cache`; àwọn àbájáde ìdìbò SNMP déédéé ń tẹ̀lé ọ̀nà àpẹẹrẹ.
`data_query_format_record()` nínú `lib/data_query.php` ń lo àwọn ìyípadà méjì kí a tó tọ́jú rẹ̀:
àtọ́ka `rewrite_value` àṣàyàn láti inú ìtumọ̀ ìbéèrè, àti `bin2hex()` lórí iye èyíkéyìí tí `mb_detect_encoding()` kò lè dá mọ̀.
Èkejì yẹn jẹ́ ẹ̀ṣọ́ lòdì sí àwọn okùn baiti alakomeji (binary octet strings), kì í ṣe lòdì sí àkóónú aṣenilọ́ṣẹ́.

Láti ibẹ̀ ni iye náà ti ń rìnrìn àjò. Ó ń sọ àwọn àwòrán lórúkọ nípasẹ̀ `substitute_snmp_query_data()`.
Ó lè ṣètò iye tó pọ̀ jùlọ fún RRD, nítorí àpẹẹrẹ data lè kéde iye tó pọ̀ jùlọ rẹ̀ gẹ́gẹ́ bí `|query_ifSpeed|`.
Ó di àríyànjiyàn sí ìbéèrè àkọsílẹ̀, níbi tí `get_script_query_path()` ti ń gbé apá kọ̀ọ̀kan kọjá nínú `cacti_escapeshellarg()` ní àkọ́kọ́.

Sísá fún kóòdù ewu àti àwọn olùfọwọ́sí RRDtool tí a ṣàpèjúwe nínú
[Ìṣọ̀kan RRDtool](/yo/reference/rrdtool-integration/) ni àwọn ààlà níhìn-ín.
Data ẹ̀rọ gbọ́dọ̀ wà láìgbẹ́kẹ̀lé. Ìfọwọ́sí àti sísá fún ewu jẹ́ àwọn àbùdá ti ojú-ọ̀nà ìpè kọ̀ọ̀kan;
wíwà àwọn olùrànlọ́wọ́ kì í ṣe ẹ̀rí pé gbogbo olùlò ń lò wọ́n dáadáa. Ṣàyẹ̀wò ìdásílẹ̀ àṣẹ àti àríyànjiyàn tí a fi rọ́pò rẹ̀.

### Àbájáde àkọsílẹ̀

Ẹka `popen()` ti `exec_poll()` ń ka pẹ̀lú `fgets(..., 8192)`, tí ń dá iye tí ó pọ̀ jùlọ jẹ́ 8,191 baiti padà tàbí ìlà tuntun àkọ́kọ́.
Àrọ́pò rẹ̀ ti `shell_exec()` ní ìwà àbájáde ọ̀tọ̀, àti pé ìkójọpọ̀ olupin àkọsílẹ̀ ń tẹ̀lé ọ̀nà mìíràn.

`prepare_validate_result()` ń dá àwọn iye nọ́mbà àti àwọn tí a kò mọ̀ mọ̀, àwọn ìrísí hexadecimal àti àwọn àbájáde pápá-púpọ̀ kan.
Ó tún lè yọ ọ̀rọ̀ kúrò láti gba iye nọ́mbà; kì í ṣe àlẹ̀mọ́ tí ó muna déédéé gbogbogbò.
Àtúnyẹ̀wò tí ń bọ̀ lẹ́yìn àti ìfọwọ́sí RRDtool tún ṣe pàtàkì pẹ̀lú. Wo [Àwọn ọ̀nà ìtẹ̀bọ̀ data](/yo/reference/data-input-methods/).

Àwọn àyẹ̀wò àbájáde kò dènà àkọsílẹ̀ tí ó ti ṣiṣẹ́ tẹ́lẹ̀ nínú àpótí ààbò.
Ṣàyẹ̀wò àṣẹ, àkójọ funfun tí a gbà láàyè àti àwọn ẹ̀tọ́ ètò iṣẹ́ ẹ̀rọ kí o tó mú ìkójọpọ̀ ṣiṣẹ́.

### Àwọn àpẹẹrẹ àti àwọn àpò

Àwọn ọ̀nà méjì ọ̀tọ̀ọ̀tọ̀ ń pín agbègbè kan náà.

**Ìgbéwọlé àpẹẹrẹ** jẹ́ XML lásán láìsí àmì ìdánimọ̀. Ó ń ṣẹ̀dá àwọn àpẹẹrẹ, àwọn ìbéèrè data, àti àwọn ọ̀nà ìtẹ̀bọ̀ data.
Ọ̀nà ìtẹ̀bọ̀ data jẹ́ ìlà àṣẹ, nítorí náà èyí jẹ́ ọ̀nà láti inú fáìlì tí a gbé wọlé sí ohun tí olùdìbò yóò ṣe.
`lib/import.php` ń ṣe `cacti_input_string_is_safe()` lórí `input_string` èyíkéyìí tí a gbé wọlé ó sì ń kọ ọ̀nà náà nígbà tí ó bá ní àwọn lẹ́tà pàtàkì shell nínú, tí ń kọ:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

**Ìgbéwọlé àpò** ní àmì ìdánimọ̀. `import_read_package_data()` ń ka bọ́tìnì gbangba tí a fi sínú àpò náà
ó sì ń fi wé àwọn bọ́tìnì mẹ́ta tí a kọ sínú `lib/import.php`: àwọn bọ́tìnì Cacti méjì àti bọ́tìnì Kadupul.
Bọ́tìnì mìíràn èyíkéyìí yóò kùnà. Àpò tí kò ní apá `<publickey>` ni a kà sí pé ó ń béèrè fún bọ́tìnì Cacti àtijọ́,
ó sì gbọ́dọ̀ mú àmì ìdánimọ̀ tí a fọwọ́ sí wá nípa lílo rẹ̀.
`import_read_package_data()` ń kọ bọ́tìnì èyíkéyìí tí kò tó biti 2048 kí ó tó gbìyànjú ìfọwọ́sí, èyí tí bọ́tìnì àtijọ́, ní biti 512, kò ní.
Fáìlì kọ̀ọ̀kan tí ó wà nínú rẹ̀ ń gbé àmì ìdánimọ̀ tirẹ̀ dání, tí a fọwọ́ sí lọ́tọ̀.

Àwọn àpò lè kọ àwọn fáìlì tí a yàn lẹ́yìn náà. Àwọn orúkọ tí a gbà ń bẹ̀rẹ̀ pẹ̀lú `scripts/` tàbí `resource/`,
ní àṣàyàn lábẹ́ àkọsílẹ̀ `plugins/<name>/` tí ó wúlò. Olùgbéwọlé ń kọ NUL, àwọn ọ̀nà ìkọjá (traversal) àti àwọn ọ̀nà pípé
ó sì ń yanjú ìpamọ́ lábẹ́ gbongbo ìfisórí-ẹ̀rọ; wíwà orúkọ àpò-fáìlì nìkan kò tó.
Agbára kíkọ ti ibi tí a ń kọ ọ́ sí tún ń darí bóyá kíkọ yóò yege. Àpò tí ó bá yege nínú ìfọwọ́sí ń kọ PHP tí ó lè ṣiṣẹ́ sínú igi ìfisórí-ẹ̀rọ nípa ètò.
Ìfọwọ́sí àmì ìdánimọ̀ ń fìdí ìdánimọ̀ àti òtítọ́ tí a tẹ́wọ́gbà múlẹ̀, kì í ṣe pé kóòdù kò léwu.
Àṣẹ agbègbè, ìpamọ́ ọ̀nà, àwọn fáìlì tí a yàn, àwọn àṣẹ ètò fáìlì àti ètò àkójọ funfun àṣẹ tún ṣe pàtàkì pẹ̀lú.

Àwọn ọ̀nà méjèèjì wà lẹ́yìn agbègbè 17. Iṣẹ́ Olùtúnṣe Àpẹẹrẹ déédéé di agbègbè 17 àti agbègbè 2 (Àwọn Ọ̀nà Ìtẹ̀bọ̀ Data) mú.
Àkọọ́lẹ̀ tí ó ní àwọn àṣẹ wọ̀nyẹn lè ṣàlàyé àwọn àṣẹ ìkójọpọ̀, ní ìbámu pẹ̀lú ìfọwọ́sí àti ìtọ́jú àkójọ funfun.
Ohun tí iṣẹ́ náà wà fún nìyẹn, ó sì yẹ kí a mọ̀ kí a tó fúnni.
Wo [Gbé wọlé kí o sì gbé àwọn àpẹẹrẹ jáde](/yo/guides/import-and-export-templates/) fún ìlànà iṣẹ́ tí a fọwọ́ sí àti àwọn àbùkù tí a mọ̀.

## Ohun tí ń ṣiṣẹ́ pẹ̀lú àǹfààní wo

| Ìlànà | Ẹni tí ó bẹ̀rẹ̀ rẹ̀ | Ó ń ṣiṣẹ́ bíi | Ohun tí ó ń ṣe |
|---|---|---|---|
| Ojú-ọ̀nà wẹ́ẹ̀bù | Olupin wẹ́ẹ̀bù | Olùlò olupin wẹ́ẹ̀bù | Ń ka àti kíkọ ibi-ìpamọ́ data, ń ya àwọn àwòrán nípasẹ̀ RRDtool, ń kọ àwọn fáìlì RRD lórí ìbéèrè, ń kọ àwọn fáìlì àpò nígbà ìgbéwọlé |
| `poller.php` | Olùṣètò àkókò tàbí iṣẹ́ tí a ṣètò | Àkọọ́lẹ̀ olùṣètò/iṣẹ́ | Ń ka kache olùdìbò, ń bẹ̀rẹ̀ àwọn olùkójọ, ń kọ àwọn fáìlì RRD |
| `cmd.php` | Olùdìbò tàbí ọ̀nà ìkójọpọ̀ àkókò gidi | Àkọọ́lẹ̀ tí ó bẹ̀rẹ̀ rẹ̀ | Ń ṣe àwọn ìbéèrè SNMP àti àwọn àṣẹ ìkójọpọ̀ |
| `script_server.php` | Olùkójọ | Àkọọ́lẹ̀ tí ó bẹ̀rẹ̀ rẹ̀ | Ń ka fáìlì PHP sínú rẹ̀ ó sì ń pe iṣẹ́ kan nínú ìlànà tirẹ̀ |
| RRDtool | Yálà ìlànà wẹ́ẹ̀bù tàbí olùdìbò | Èyíkéyìí tí ó pè é | Ń ka àti kíkọ àwọn fáìlì lábẹ́ `rra/` |

Méjì nínú àwọn yẹn tọ́ sí àkíyèsí tímọ́tímọ́.

**Olupin àkọsílẹ̀ kì í ṣe àpótí ààbò (sandbox).** Ó ń ka fáìlì tí a fojúsùn sínú ìlànà PHP tí ń ṣiṣẹ́ fún ìgbà pípẹ́ ó sì ń pe iṣẹ́ kan nínú rẹ̀.
Iṣẹ́ yẹn ń pín ìlànà náà, ìrántí rẹ̀, àti ìsopọ̀ ibi-ìpamọ́ data rẹ̀.
Àwọn àyẹ̀wò nínú `script_server.php` ń pinnu bóyá ìpè náà yóò wáyé rárá: `realpath()` ti fáìlì tí a kà sínú rẹ̀ gbọ́dọ̀ yanjú
lábẹ́ `$config['base_path']` tàbí `$config['scripts_path']`, iṣẹ́ náà gbọ́dọ̀ wà lẹ́yìn kíkà sínú rẹ̀,
`ReflectionFunction::isInternal()` gbọ́dọ̀ jẹ́ irọ́ (false), àti pé fáìlì tí ń ṣàlàyé iṣẹ́ náà gbọ́dọ̀ wà lábẹ́ gbongbo tí a gbà láàyè.
Ní kété tí àwọn wọ̀nyẹn bá yege, kóòdù náà ń ṣiṣẹ́ pẹ̀lú gbogbo agbára olùdìbò. Ọ̀nà Olupin Àkọsílẹ̀ jẹ́ ọ̀nà láti ṣe PHP nínú Kadupul, kì í ṣe ọ̀nà láti ṣe PHP lẹ́gbẹ̀ẹ́ rẹ̀ ní àyè ọ̀tọ̀.

**Ìlànà wẹ́ẹ̀bù lè kọ àwọn fáìlì RRD.** Àwọn ìbéèrè àwòrán lè mú kí àwọn àtúnṣe Boost àti ṣíṣẹ̀dá fáìlì ṣẹlẹ̀ lórí ìbéèrè.
Ìkìlọ̀ tí ń fà ọ̀nà ṣíṣẹ̀dá àpò-fáìlì kan sẹ́yìn sí olùdìbò kò sọ àǹfààní kíkọ lórí wẹ́ẹ̀bù di àṣàyàn gbogbogbò.
Àyẹ̀wò ìpamọ́ tí ó wà lọ́wọ́lọ́wọ́ àti ìṣètò ìtọ́jú tún ń yẹ àǹfààní àkọọ́lẹ̀ wò àti ìṣètò nọ́mbà UID/GID tí a gbẹ́kẹ̀lé.
Ṣíṣẹ̀dá tí a ṣe lábẹ́ root ń gbìyànjú láti bá ìní ìpamọ́ mu, ṣùgbọ́n a lè kọ àwọn ìkùnà sílẹ̀.
Wo [Ṣe ìgbéga láìléwu](/yo/guides/upgrade-safely/).

Àwọn àkọọ́lẹ̀ wẹ́ẹ̀bù àti ti olùdìbò tí a ṣètò lè yàtọ̀. Ìkójọpọ̀ àkókò gidi tí a bẹ̀rẹ̀ láti inú ìbéèrè wẹ́ẹ̀bù lè jogún àkọọ́lẹ̀ wẹ́ẹ̀bù,
nítorí náà ṣíṣe àṣẹ kò mọ mọ́ orí ìdánimọ̀ olùdìbò tí a ṣètò nìkan.
Ìṣọ̀kan Spine tí a jogún nílò ìfọwọ́sí ọ̀tọ̀ lòdì sí fáìlì binary gidi; ojú-ewé yìí kò dá àgbékalẹ̀ tí a tì lẹ́yìn sílẹ̀.

## Ohun tí àkọọ́lẹ̀ ibi-ìpamọ́ data nílò

Àwọn ìlànà tí ń lo ìṣètò ibi-ìpamọ́ data kan náà sábà máa ń pín àkọọ́lẹ̀ rẹ̀.
Àwọn olùkójọ jíjìnnà lè ní àwọn ẹ̀rí ìdánimọ̀ agbègbè àti ti àárín ọ̀tọ̀ọ̀tọ̀; ìṣètò fún ìfiranṣẹ́ pàtó lè yàtọ̀.
Ṣàyẹ̀wò àwọn ẹ̀bùn gidi fún gbogbo àkọọ́lẹ̀ tí a ṣètò.

| Ohun tí a nílò | Ìdí rẹ̀ |
|---|---|
| DML kíkún lórí àgbékalẹ̀ Kadupul | Ìṣiṣẹ́ déédéé |
| DDL lórí àgbékalẹ̀ Kadupul | Àwọn ìgbéga àti àwọn iṣẹ́ àkókò ìṣiṣẹ́ bíi yíyí tábìlì Boost padà, àwọn tábìlì ìgbà díẹ̀ àti àwọn àtúnṣe ìgbésí ayé àfikún |
| `SELECT` lórí `mysql.time_zone_name` | Àkójọ agbègbè àkókò ti ibùdó àti ti àwọn olùkójọ data ń ka tábìlì yẹn tààràtà |

Má ṣe yọ àwọn àǹfààní DDL kúrò lórí èrò pé àwọn ìgbéga nìkan ló nílò wọn.
Ohun-èlò náà kì í yípadà gbogbogbò sí ìdánimọ̀ ìṣíwájú ọ̀tọ̀; ìyàsọ́tọ̀ àkọọ́lẹ̀ nílò ìfọwọ́sí pàtó fún gbogbo àwọn ọ̀nà àkókò ìṣiṣẹ́ tí ó kan.

`include/config.php` ní àwọn ẹ̀rí ìdánimọ̀ ibi-ìpamọ́ data nínú àti pé àwọn olùkójọ jíjìnnà tún lè mú àwọn ẹ̀rí ìdánimọ̀ `$rdatabase_*` ti àárín dání.
Àwọn àṣẹ ètò fáìlì, àwọn òfin àǹfààní HTTP, ìṣètò olùtọ́jú PHP àti ààbò àtìlẹyìn gbogbo wọn ṣe pàtàkì.
PHP sábà máa ń ṣe fáìlì náà dípò kí ó fi orísun rẹ̀ hàn, ṣùgbọ́n èyí kì í ṣe àrọ́pò fún dídáàbò bò ó kúrò nínú ìfihàn tààràtà.
Wo [Dáàbò bo ìfisórí-ẹ̀rọ tí ń dojú kọ ayélujára](/yo/guides/secure-an-internet-facing-install/).

Àwọn ẹ̀rí ìdánimọ̀ ẹ̀rọ ni a tọ́jú ní ọ̀nà kan náà. `host.snmp_community`, `host.snmp_password`,
àti `host.snmp_priv_passphrase` jẹ́ àwọn ọwọ̀n déédéé, tí a kọ nípasẹ̀ `api_device_save()` láti inú `form_input_validate()`
láìsí ìgbésẹ̀ ìbòkóòdù, tí a sì dà kọ sínú àwọn ìlà `poller_item` kí olùdìbò lè kà á.
Àǹfààní kíkà sí àwọn tábìlì tí ó kan lè ṣí àwọn ẹ̀rí ìdánimọ̀ ẹ̀rọ tí a tọ́jú sílẹ̀; kò túmọ̀ sí àǹfààní sí gbogbo orísun ẹ̀rí ìdánimọ̀ ti ìta.
Àwọn ọ̀rọ̀ ìgbaniwọlé olùlò nìkan ni ó yàtọ̀: `compat_password_hash()` ń lo `password_hash()` ti PHP pẹ̀lú `PASSWORD_DEFAULT`,
àti pé hash MD5 àtijọ́ tí ó ṣì ń jẹ́ ẹ̀rí ni a ń tún hash rẹ̀ ṣe nígbà ìwọlé tí ń bọ̀.

## Èyí tí a fipá múlẹ̀, àti èyí tí ó jẹ́ ti àṣà lásán

Èyí ni ìyàtọ̀ tí ó ṣe pàtàkì jùlọ nígbà tí a bá ń ro èrò nípa àtúnṣe kan.

### Àwọn ọ̀nà kóòdù àti àyè wọn

| Ààlà | Ọ̀nà tí a ń gbà ṣe é |
|---|---|
| Ìfọwọ́sí olùlò | Àwọn ojú-ewé déédéé ń lo `include/auth.php`; àwọn ibi pàtó ní ìtọ́jú tiwọn |
| CSRF | Ìṣètò wẹ́ẹ̀bù àpapọ̀ ń ṣètò ìtọ́jú àwọn àmì ìdánimọ̀; àwọn array àmì tí kò tọ̀nà ni a kọ̀. Ṣàyẹ̀wò ojú-ọ̀nà kọ̀ọ̀kan àti ọ̀nà ìfiránṣẹ́ dípò kí o ro pé gbogbo ibi ni a bò mọ́lẹ̀ |
| Àwọn àkọsílẹ̀ CLI nìkan | `include/cli_check.php` ń dáhùn pẹ̀lú `404` ó sì ń jáde nígbà tí SAPI kì í ṣe `cli` |
| Ibùdó XML ìbéèrè data | `cacti_path_is_within()` lòdì sí `<base_path>/resource`, a kọ ọ́ sílẹ̀ a sì kọ̀ ọ́ bí bẹ́ẹ̀ kọ́ |
| Òtítọ́ àpò | Àmì ìdánimọ̀ lòdì sí bọ́tìnì tí a kọ sínú rẹ̀, ó kéré jù biti 2048, àwọn àmì ìdánimọ̀ fún fáìlì kọ̀ọ̀kan |
| Ìgbéga fáìlì àpò | A kọ àwọn orúkọ tí kò tọ̀nà; a ṣàyẹ̀wò àwọn àkọsílẹ̀ àkọsílẹ̀/ohun-èlò tí a gbà láàyè àti ìpamọ́ gbongbo tí a yanjú |
| Àwọn ibi tí olupin àkọsílẹ̀ ń fojúsùn | Ìpamọ́ `realpath()`, pẹ̀lú àwọn àyẹ̀wò iṣẹ́ tí ó wà lókè |
| Àwọn àríyànjiyàn Shell | Sísá fún ewu, àwọn olùrànlọ́wọ́ àṣẹ àti àwọn olùfọwọ́sí níbi tí a ti lò wọ́n; ṣàyẹ̀wò ojú-ọ̀nà ìpè gidi |
| Àwọn àríyànjiyàn RRDtool | Àwọn olùfọwọ́sí lẹ́tà ìdarí àti ìrísí nínú `lib/functions.php` |
| SQL | Àwọn olùrànlọ́wọ́ tí a pèsè ń di àwọn iye pọ̀; SQL tí ń yípadà, àwọn àmì ìdánimọ̀ àti àwọn ìpè tí a kò pèsè ṣì nílò àyẹ̀wò |
| Àwọn olùpè aṣojú jíjìnnà | Àdírẹ́sì orísun gbọ́dọ̀ bá ìlà tí a mú ṣiṣẹ́ mu nínú `poller`, nípasẹ̀ IP gidi tàbí nípasẹ̀ àyẹ̀wò yíyípadà tí a fọwọ́ sí níwájú |

### Àwọn ojúṣe ìfiranṣẹ́ àti ojú-ọ̀nà ìpè

| Ààlà | Ìdí tí a kò fi fipá mú un lẹ́sẹ̀ nínú kóòdù |
|---|---|
| Ṣíṣe àlẹ̀mọ́ ìbéèrè | Ojú-ewé kan lè yan `get_filter_request_var()` tàbí kọ̀. `log_validation` ń ròyìn, kò ní dènà |
| Sísá fún àbájáde ewu | `html_escape()` àti `html_purify()` ni a ń lò fún ojú-ọ̀nà ìpè kọ̀ọ̀kan |
| Àṣẹ fún ojú-ewé kọ̀ọ̀kan | Àyẹ̀wò agbègbè ń lo `$user_auth_realm_filenames`, tí a fi kọ́kọ́rọ́ orúkọ fáìlì ṣe. Ojú-ewé tí kò sí nínú àtọ́ka kò ní gba àyẹ̀wò rere láti inú àtọ́ka yẹn nìkan. Àwọn àyẹ̀wò àfikún lè kan án; àwọn ojú-ewé àfikún gbọ́dọ̀ forúkọ sílẹ̀ kí wọ́n sì mú ètò àṣẹ wọn ṣiṣẹ́ |
| Kíkọ̀ àwọn àpò-fáìlì | Àwọn fáìlì `.htaccess` lábẹ́ `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/`, àti `cache/*` jẹ́ àwọn àṣẹ Apache. Lábẹ́ nginx, tàbí lábẹ́ Apache pẹ̀lú pípa `AllowOverride`, kò sí èyíkéyìí nínú wọn tí ń ṣiṣẹ́ |
| Àwọn àkọlé ààbò lórí àwọn fáìlì tí kì í yípadà | A fi `.htaccess.dist` ránṣẹ́ láìyí orúkọ padà. Fífi àkọlé PHP ránṣẹ́ dá lórí ọ̀nà ìdáhùn àti àwọn ètò rẹ̀; àwọn ìdáhùn tí kì í yípadà dá lórí ìṣètò olupin/aṣojú gidi |
| Ìyàsọ́tọ̀ àwọn olùlò wẹ́ẹ̀bù àti olùdìbò | Àṣà ni, kì í ṣe ohun tí a kà ní dandan |
| Àwọn àṣẹ lórí `include/config.php` | Ẹnikẹ́ni tí ó fi sí orí ẹ̀rọ ló ń ṣètò rẹ̀ |

Àwọn fáìlì àtúnṣe `index.php` nínú `resource/` àti àwọn àpò abẹ́ rẹ̀ ń dá àkójọ àpò-fáìlì dúró.
Wọn kì í ṣe ìdarí àǹfààní bẹ́ẹ̀ ni wọn kò dènà ìbéèrè tààràtà fún fáìlì tí a dárúkọ.

## Àwọn ojú-ọ̀nà tí ń dáhùn kí a tó fọwọ́ sí olùlò

Àwọn wọ̀nyí jẹ́ àpẹẹrẹ ti àwọn ojú-ọ̀nà àbáwọlé pàtàkì, kì í ṣe gbogbo àkójọ àwọn ojú-ọ̀nà gbangba.
Àìsí fáìlì kíkà sínú déédéé kò fi hàn pé àìsí ìfọwọ́sí tàbí àṣẹ wà ní ibòmíràn nínú ọ̀nà ìbéèrè náà.

| Fáìlì | Ìwà |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Ojú-ọ̀nà ìwọlé fúnra rẹ̀ |
| `csp_report.php` | Ń gba àwọn ìròyìn kíkọjá òfin CSP láti ọ̀dọ̀ aṣàwákiri |
| `service_check.php` | Ń dáhùn pẹ̀lú `success` tàbí `fail` lẹ́yìn ìbéèrè kan lòdì sí `version`. Àyẹ̀wò àlàáfíà láìsí ìfọwọ́sí |
| `link.php` | Ń gbé ìlà ìsopọ̀ ìta wọlé, lẹ́yìn náà ó ń yẹ `is_realm_allowed($page['id'] + 10000)` wò fúnra rẹ̀ |
| `remote_agent.php` | RPC olùkójọ data, tí a fún ní àṣẹ nípasẹ̀ àdírẹ́sì orísun |

`remote_agent.php` ni èyí tí ó yẹ kí a ronú lé lórí. Àṣẹ rẹ̀ jẹ́ `remote_client_authorized()`,
tí ń fi `get_client_addr()` wé àwọn orúkọ agbàlejò àti àdírẹ́sì nínú tábìlì `poller`. Kò sí àṣírí àpapọ̀ kan.
Olùpè tí àdírẹ́sì rẹ̀ bá bá ìlà olùkójọ data tí a mú ṣiṣẹ́ mu lè pe àwọn iṣẹ́ aṣojú náà:
láti dìbò fún data, láti ṣe ìbéèrè data, láti ping ẹ̀rọ kan, láti ṣe SNMP get àti walk, láti béèrè data àwòrán, àti láti ṣe àwárí nẹ́tíwọ́ọ̀kì.
Àwọn ààbò méjì ló ń ṣe èyí:
Àkọ́kọ́, iṣẹ́ náà ń dá false padà tààràtà nígbà tí ìlà olùkójọ kan ṣoṣo tàbí kéré sí bẹ́ẹ̀ bá padà wá, nítorí náà iṣẹ́ yìí ń kọ ọ̀ràn yẹn.
Èkejì, nígbà tí ìbáramu bá jẹ́ nípa orúkọ agbàlejò dípò IP gidi, a máa ń fi àyẹ̀wò iwájú mú àyẹ̀wò yíyípadà dájú kí a tó gbà á.

`get_client_addr()` ń ka `REMOTE_ADDR` kò sì ka nǹkan mìíràn àyàfi bí a bá ṣètò `$proxy_headers` nínú `include/config.php`.
Àṣàyàn tí a fi ránṣẹ́ ni `null`. Mímú àwọn àkọlé aṣojú ṣiṣẹ́ ń yí àwọn orísun tí a ṣètò padà láti ibi tí a ti ń yan àdírẹ́sì oníbàárà tí ó tọ̀nà.
Lo àwọn àkọlé tí aṣojú àbáwọlé tí a gbẹ́kẹ̀lé ń darí nìkan, kí o sì dènà àwọn oníbàárà láti fojú fo tàbí pèsè àwọn iye wọ̀nyẹn fúnra wọn.
Èyí ni ìlà ìṣètò kan ṣoṣo tí ó yí ìtumọ̀ gbogbo ìpinnu tí ó dá lórí àdírẹ́sì nínú ètò náà padà jùlọ,
pẹ̀lú àṣẹ aṣojú jíjìnnà àti àwọn àdírẹ́sì tí a kọ sínú àkọsílẹ̀.

## Àǹfààní àlejò (Guest access)

Ètò `guest_user` ń dárúkọ àkọọ́lẹ̀ kan tí a ń lo àwọn àṣẹ rẹ̀ fún àwọn ojú-ewé àwòrán láìsí ìwọlé.
Ó ń bẹ̀rẹ̀ ní àìsí olùlò kankan, àti pé wíwo àwòrán ń nílò ìfọwọ́sí bíi gbogbo nǹkan mìíràn.
Ṣíṣètò rẹ̀ ń tẹ ohunkóhun tí àkọọ́lẹ̀ yẹn lè rí jáde, fún ẹnikẹ́ni tí ó lè dé ọ̀dọ̀ olupin wẹ́ẹ̀bù.
Ète àbùdá náà nìyẹn. Àkọọ́lẹ̀ náà ṣì wà nínú àwọn àkọsílẹ̀ olùlò; ètò àlejò ni ohun tí ń mú kí àwọn àṣẹ àwòrán rẹ̀ ṣe é lò láìsí ìwọlé déédéé.
Múdájú àwọn ìbéèrè gidi àti àwọn àṣẹ ohun, kì í ṣe orúkọ àkọọ́lẹ̀ tí a ṣètò nìkan.

## Bí a ṣe lè ronú nípa àtúnṣe kan

Béèrè àwọn ìbéèrè mẹ́ta ní tẹ̀léra.

Ìlànà wo ló yóò ṣe èyí, àti gẹ́gẹ́ bí olùlò wo? Ìdáhùn fún ọ̀nà ìtẹ̀bọ̀ data sábà máa ń jẹ́ àkọọ́lẹ̀ ètò iṣẹ́ ẹ̀rọ ti olùkójọ tí ń bẹ̀rẹ̀ rẹ̀;
ìkójọpọ̀ tí a bẹ̀rẹ̀ lórí wẹ́ẹ̀bù lè yàtọ̀ sí ìkójọpọ̀ tí a ṣètò ní àkókò.

Kí ni data náà ń kàn ní ọ̀nà tí ó ń gbà kọjá? Iye kan láti ọ̀dọ̀ ẹ̀rọ kan tí ó kàn balẹ̀ sínú fáìlì RRD ti kọjá ààlà kan.
Iye kan náà nínú orúkọ àwòrán ti kọjá àwọn ààlà méjì, àti nínú àríyànjiyàn àkọsílẹ̀, mẹ́ta.

Ṣé ààlà tí mo gbẹ́kẹ̀lé ni a fipá múlẹ̀ nínú kóòdù tàbí ó jẹ́ ti àṣà lásán? Tí ó bá jẹ́ ti àṣà, kóòdù tí o ń kọ ni ìmúṣẹ náà fúnra rẹ̀.

Kíkà tí ó tan mọ́ ọn: [Àwọn àṣẹ àti àǹfààní](/yo/concepts/permissions-and-access/) fún àpẹẹrẹ àṣẹ fúnra rẹ̀,
[Àwọn ọ̀nà ìtẹ̀bọ̀ data](/yo/reference/data-input-methods/) fún àdéhùn ìṣiṣẹ́ àti àkójọ funfun ìtẹ̀bọ̀,
àti [Ìkójọpọ̀ data jíjìnnà](/yo/concepts/remote-data-collection/) fún ohun tí olùkójọ data ń ṣe pẹ̀lú ìgbẹ́kẹ̀lé tí a fún un.
