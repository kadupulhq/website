---
title: Ìfipamọ́ àti ìmúbọ̀sípò
description: Àwọn ohun mẹ́ta gbọ́dọ̀ wà papọ̀ kí àpò ìfipamọ́ tó péye, àti ètò bí a ṣe ń mú wọn bọ̀sípò ṣe pàtàkì.
banner:
  content: Kadupul ṣì wà ní ìpele ṣáájú alfa. Ṣàyẹ̀wò àwọn ìlànà wọ̀nyí nínú àgbékalẹ̀ ìdánwò tí a yà sọ́tọ̀. Àkọ́kọ́ àtúmọ̀ ni èyí; ó ṣì ń dúró de àyẹ̀wò ẹni tó mọ èdè náà dáadáa.
sidebar:
  order: 7
---

:::caution[Ṣàyẹ̀wò rẹ̀ kí o tó lò ó]
Kóòdù orísun wà ní àrọ́wọ́tó, ṣùgbọ́n kò sí ẹ̀dà Kadupul tí a tì lẹ́yìn tàbí ipa-ọ̀nà ìṣípòpadà. Dán àwọn ìlànà wọ̀nyí wò lórí ẹ̀dà tí a yà sọ́tọ̀ pẹ̀lú àwọn àpamọ́ détà kí o tó gbẹ́kẹ̀lé wọn. Wo [ipò iṣẹ́ àkànṣe](/yo/project/status/).
:::

Àkójọ ìmúbọ̀sípò Kadupul tó péye ní apá mẹ́ta. Àwọn ìfipamọ́ apá kan lè mú ìṣètò tàbí ìwọ̀n padà bọ̀sípò, ṣùgbọ́n wọn kò lè tún gbogbo ètò tí a fi sílẹ̀ gbé kalẹ̀.

| Apá | Ohun tí ó wà nínú rẹ̀ | Ibí tí ó wà |
|---|---|---|
| Ibùdó dátà | Àwọn ẹ̀rọ, àwòṣe, àwọn olùlò, àṣẹ, poller cache, àti ipa-ọ̀nà gbogbo fáìlì RRD | MySQL tàbí MariaDB |
| Àwọn fáìlì RRD | Àwọn ìwọ̀n tí a tọ́jú àti àwọn àkójọ ìpamọ́ àpapọ̀ | Àpò RRA, ní àiyípadà `rra/` lábẹ́ ibùdó fífisílẹ̀ |
| Ìṣètò | Àwọn àmì ìdánimọ̀ ibùdó dátà, ipa-ọ̀nà, ìṣètò agbowó dátà, àti kóòdù plugin àti script | `include/config.php`, fáìlì ìṣètò spine, `plugins/`, `scripts/`, `resource/` |

## Ohun tí ìfipamọ́ ibùdó dátà nìkan lè mú bọ̀sípò

Ibùdó dátà ní àwọn ìtumọ̀ àwòrán àti ìṣètò ìṣójúfò nínú, nígbà tí àwọn fáìlì RRD ní àwọn àkọsílẹ̀ àwòrán àtijọ́ mọ́. Nígbà tí Boost bá wà ní títàn, àwọn kíkà àìpẹ́ yìí tún lè jókòó sínú àwọn ìlà ìdúró ibùdó dátà títí tí a ó fi dà wọ́n sínú àwọn fáìlì. Tọ́jú àwọn ìlà ìdúró wọ̀nyẹn gẹ́gẹ́ bí apá kan ìfipamọ́ ibùdó dátà. Wo [Àgbékalẹ̀ ètò](/yo/concepts/architecture/).

Bí o bá mú ibùdó dátà nìkan bọ̀sípò, o máa rí ètò kan tó mọ nípa ẹ̀rọ irínwó, tí ó ní gbogbo àwòrán tí a ṣàlàyé, tí ó sì ń ya gbogbo wọn ní òfìfo. Yóò bẹ̀rẹ̀ sí ní kó dátà jọ lẹ́ẹ̀kan sí i láti àkókò tí o bá bẹ̀rẹ̀ poller, ìtàn àtijọ́ yóò sì ti parẹ́.

## Ohun tí ìfipamọ́ RRD nìkan kùnà láti ní

Fáìlì RRD ní àwọn orísun dátà tí a dárúkọ, àwọn ìtumọ̀ àkójọ ìpamọ́ àti àwọn iye, ṣùgbọ́n kò ní gbogbo ẹ̀rọ Kadupul, ìbéèrè, àwòrán àti àwọn pípéye dátà àṣẹ tí a nílò láti tún àwọn iye yẹn so mọ́ ètò náà.

Ìsopọ̀ láti "bytes tó wọlé lórí port 3 ti switch 12" sí ipa-ọ̀nà lórí disk ń gbé inú ibùdó dátà, nínú ọ̀wọ́ kan lórí orísun dátà. Bí o bá mú igi fáìlì nìkan bọ̀sípò, o máa ní ẹgbẹẹgbẹ̀rún àwọn fáìlì tó kún fún nọ́ńbà, láìsí ọ̀nà láti mọ èyí tó jẹ́ èyí àyàfi bí o bá fi ọwọ́ ṣe àtúnṣe ìmọ̀-ẹ̀rọ wọn láti ìbẹ̀rẹ̀.

Àwọn méjèèjì jẹ́ ìfipamọ́ kan ṣoṣo. Bá wọn lò ní ọ̀nà yẹn.

## Ìbáramu láàárín wọn

Èyí ni ibi tí ọ̀pọ̀lọpọ̀ àwọn ìlànà ìfipamọ́ ti ń ṣe àṣìṣe ní ìdákẹ́jẹ́ẹ́.

Poller ń kọ sínú àwọn fáìlì RRD nígbà gbogbo. Fáìlì kan tí a dà kọ nígbà tí àtúnṣe ń lọ lọ́wọ́ ni a lè mú ní àárín ìkọ̀wé. A tún ń kọ sínú ibùdó dátà ní àkókò kan náà. Bí o bá da ibùdó dátà jáde ní 02:00 tí o sì bẹ̀rẹ̀ sí ní da àwọn fáìlì kọ ní 02:20, àwọn ìdajì méjèèjì ń ṣàlàyé àwọn àkókò ọ̀tọ̀ọ̀tọ̀, gbogbo orísun dátà tí a dá tàbí tí a pa rẹ́ ní àárín àkókò náà kò sì ní bá ara wọn mu.

Kíkọ RRD tí a sún síwájú ń mú kí ọ̀rọ̀ náà burú sí i tí ó sì tún ń mú kí ó fani mọ́ra sí i. Ní ipò yẹn poller kì í kọ àwọn fáìlì RRD ní gbogbo ìgbà tí ó bá kọjá. Àwọn àbájáde ń kójọ sínú tábìlì ibùdó dátà tí ó lágbára, a sì ń da wọ́n pọ̀ lẹ́ẹ̀kan náà nígbà tó yá. Nítorí náà ibùdó dátà lè wà níwájú àwọn fáìlì RRD nípa àárín àkókò ìdasilẹ, ní dídúró lórí àwọn ìwọ̀n gidi tí kò sí lórí disk ní ibòmíràn.

Yan ọ̀kan nínú àwọn wọ̀nyí. Ní títẹ̀lé ètò ààyò tó ń dín kù:

**Àwòrán àkókò kan tí a ṣètò ní ìṣọ̀kan.** Lo ìlànà ìfipamọ́ tàbí dídáwọ́rọ́ tí ẹ́ńjìnnì ibùdó dátà ń tì lẹ́yìn, kí o sì ṣètò rẹ̀ ní ìbámu pẹ̀lú àwòrán gbogbo ibi ìpamọ́ RRD àti ìṣètò ètò náà. Àwòrán ètò fáìlì nìkan kì í fi ìbáramu múlẹ̀ kọjá àwọn disk ọ̀tọ̀ọ̀tọ̀, àwọn agbowó dátà láti ọ̀nà jíjìn, àwọn ìlà ìdúró tó ń dúró tàbí ibùdó dátà tó ń ṣiṣẹ́.

**Ìfipamọ́ ọgbọ́n tí a dá dúró.** Pa àwọn olùbẹ̀rẹ̀ tí a ṣètò àti àwọn olùpèsè mìíràn, dúró de àwọn agbowó dátà tí ń ṣiṣẹ́ lọ́wọ́ láti parí, lẹ́yìn náà da àwọn ìkọ̀wé tí a sún síwájú jáde kí o sì dúró de àwọn òṣìṣẹ́ ìdasilẹ. Pa àwọn àtúnṣe ìṣètò, ìtọ́jú àti àwọn olùkọ̀wé RRD mìíràn mọ́ ní dídúró ní gbogbo àkókò ìfipamọ́. Dídá kíkójọ dátà dúró lè fi àwọn àpẹẹrẹ tí ó sọnù sílẹ̀; ìfarahàn wọn dá lórí heartbeat àti ìṣọ̀kan.

Kí o tó ṣiṣẹ́ àpẹẹrẹ náà, parí àwọn ìgbésẹ̀ dídáwọ́rọ́ wọ̀nyẹn kí o sì ṣàyẹ̀wò ipò ìlà/òṣìṣẹ́. `poller_boost.php --force` tí ń dá odo padà nìkan kì í ṣe ẹ̀rí pé a ti da gbogbo rẹ̀ jáde tán: ìlànà Boost tí a ti forúkọ rẹ̀ sílẹ̀ tẹ́lẹ̀ lè mú kí ó jáde láìṣe iṣẹ́ náà. Ṣètò iṣẹ́ rrdcached tàbí ibi ìpamọ́ ọ̀nà jíjìn èyíkéyìí lọ́tọ̀.

Àpẹẹrẹ Bash yìí gba pé a ń lo ibi ìpamọ́ abẹ́lé, àkọọ́lẹ̀ ibùdó dátà tí a ṣètò nínú fáìlì àṣàyàn oníbàárà àdáni, àti àpò RRA tí ó ní gbogbo RRDs tí a ń darí. Pààrọ̀ gbogbo ipa-ọ̀nà. Ṣe àkójọ àwọn ipa-ọ̀nà RRD kíkún, àwọn ibi tí symlink ń tọ́ka sí, ìṣètò ita àti àwọn agbowó dátà láti ọ̀nà jíjìn, kí o sì tún fi wọ́n pamọ́ lọ́tọ̀ pẹ̀lú.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

Àkójọ ètò náà ní ìṣètò àti kóòdù tí ó bá a mu nínú. Ṣàkọsílẹ̀ àtúnṣe orísun, àwọn ẹ̀dà ibùdó dátà àti RRDtool, àwọn ipa-ọ̀nà ìpamọ́ gidi àti ipò dídá olùkọ̀wé/ìdasilẹ dúró pẹ̀lú àkójọ náà. Àpẹẹrẹ náà yọ àwọn àkọsílẹ̀ iṣẹ́ déédéé, cache àti metadata Git kúrò; ṣàyẹ̀wò àwọn ìyọkúrò yẹn fún ètò rẹ.

Àkójọ tí a fi pamọ́ pẹ̀lú àṣeyọrí tí a sì ṣàyẹ̀wò checksum rẹ̀ nìkan ni yóò gba orúkọ àpò ìkẹyìn. Àṣẹ tí ó kùnà ṣì lè fi fáìlì tí a ké kúrò sílẹ̀ nínú `.partial-*`; `set -e` ń dá àwọn àṣẹ tó tẹ̀lé e dúró ṣùgbọ́n kì í yọ àbájáde tí a ti dá tẹ́lẹ̀ kúrò. Má ṣe gbé àpò yẹn ga sí ìfipamọ́ tó péye. Àwọn checksum ń ṣàwárí àwọn àtúnṣe tó tẹ̀lé e, kì í ṣe pípéye ní ti ọgbọ́n orí; a ṣì nílò ìdánwò ìmúbọ̀sípò.

`--single-transaction` ń bo àwọn tábìlì transactional, kì í ṣe àwòrán tó dúró ṣinṣin ti àwọn tábìlì plugin nontransactional tàbí àwọn àtúnṣe schema tó ń wáyé lẹ́ẹ̀kan náà. Pa àwọn olùkọ̀wé àti àwọn àtúnṣe schema mọ́ ní dídúró, tàbí lo ọ̀nà ìfipamọ́ tó bá ẹ́ńjìnnì mu. Tún bẹ̀rẹ̀ kíkójọ dátà nìkan lẹ́yìn ìmúdájú pé ìfipamọ́ ti parí tí ibi ìpamọ́ sì wúlò fún lílò. Wo [àwọn ìwé àkọsílẹ̀ mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) fún àwọn ohun tí a nílò nípa transaction àti àṣẹ. Àwọn àṣìṣe ìlànà ìṣáájú ni a ń tọpinpin nínú [website #12](https://github.com/kadupulhq/website/issues/12).

**Gba àbùkù àkókò náà kí o sì ṣàkọsílẹ̀ rẹ̀.** Èyíkéyìí nínú àwọn apá náà tí o bá kọ́kọ́ fi pamọ́ ni èyí tó dàgbà jù, kò sì sí ètò tó lè mú kí àwọn méjèèjì wà ní ìbáramu fúnra wọn. Kọ àkókò náà sílẹ̀; èyí ni ohun tó ń jẹ́ kí àbájáde rẹ̀ ṣeé mú bọ̀sípò.

Da ibùdó dátà jáde ní àkọ́kọ́ kí o sì da àwọn fáìlì kọ ní èkejì, àwọn fáìlì yóò sì jẹ́ tuntun sí i. Orísun dátà tí a pa rẹ́ nínú àkókò yẹn ṣì wà nínú ìdajáde náà ṣùgbọ́n fáìlì rẹ̀ ti lọ, ó sì ń fi ìtọ́ka sílẹ̀ tí poller yóò tún dá. Orísun dátà tí a dá nínú àkókò yẹn ń dé gẹ́gẹ́ bí fáìlì tí ibùdó dátà kò mọ̀ nípa rẹ̀, èyí tí kò ní ṣiṣẹ́.

Da àwọn fáìlì kọ ní àkọ́kọ́ kí o sì da ibùdó dátà jáde ní èkejì, ibùdó dátà yóò sì jẹ́ tuntun sí i. Orísun dátà tí a dá nínú àkókò yẹn wà nínú ìdajáde náà láìsí fáìlì lẹ́yìn rẹ̀, èyí tí poller máa tún dá ní òfìfo.

Ètò méjèèjì lè sọ ìtàn tí ó wà ṣáájú àkókò yẹn nù bí a bá pa fáìlì tí a nílò rẹ́ kí a tó da á kọ. Ó tún lè mú fáìlì tí a kọ ní àbọ̀ tàbí àwọn àpẹẹrẹ ìdúró tí kò bá ara wọn mu. Ṣíṣàkọsílẹ̀ àbùkù àkókò ń kọ ààlà sílẹ̀; kò sọ àwọn méjì tí kò dọ́gba di pípé tàbí láti ṣe ìlérí ìmúbọ̀sípò.

## Ohun tí ó wà nínú ìfipamọ́ tí o kò rò nípa rẹ̀

Àwọn àmì ìdánimọ̀ ẹ̀rọ wà nínú ibùdó dátà ní ọ̀rọ̀ kedere. Poller cache ń gbé àwọn okùn àwujọ SNMP àti àwọn orúkọ olùlò SNMPv3, ọ̀rọ̀ ìgbaniwọlé àti àwọn gbólóhùn àṣírí gẹ́gẹ́ bí ọ̀wọ́ tààrà, nítorí pé agbowó dátà nílò wọn lórí gbogbo ìkọjá. Fáìlì ìṣètò ń gbé ọ̀rọ̀ ìgbaniwọlé ibùdó dátà.

Nítorí náà, ìfipamọ́ Kadupul jẹ́ ilé-ìtọ́jú àmì ìdánimọ̀ fún gbogbo ẹ̀rọ tí o ń ṣójúfò. Kó o pamọ́ pẹ̀lú ìbòjú àṣírí nígbà tí kò bá ṣiṣẹ́, dín àwọn tí ó lè kà á kù, má sì ṣe tì í sí ibi pínpín fáìlì gbogbogbòò.

## Ètò ìmúbọ̀sípò

Ètò ṣe pàtàkì nítorí pé ìgbésẹ̀ kọ̀ọ̀kan gbẹ́kẹ̀lé èyí tí ó wà ṣáájú rẹ̀.

1. **Kọ́kọ́ mú ìṣètò bọ̀sípò.** Láìsí àwọn àmì ìdánimọ̀ ibùdó dátà àti ipa-ọ̀nà RRA, kò sí ohun mìíràn tí a lè ṣàyẹ̀wò. Bí ìmúbọ̀sípò bá wà sórí ẹ̀rọ hardware mìíràn, tún àwọn ipa-ọ̀nà ṣe ní báyìí dípò kí o dúró di ìgbà tó yá.

2. **Mú igi RRD bọ̀sípò.** Fi sí ibi tí ìṣètò sọ pé ó wà. Ṣàyẹ̀wò ìní àti ipò àṣẹ: poller ń kọ àwọn fáìlì wọ̀nyí gẹ́gẹ́ bí olùlò poller, ojú-ìwé wẹ́ẹ̀bù sì ń kà wọ́n gẹ́gẹ́ bí olùlò sáfà wẹ́ẹ̀bù. Ìmúbọ̀sípò tí ó pa àkóónú mọ́ ṣùgbọ́n tí kò pa ìní mọ́ ń mú ètò kan jáde tí ń ya àwòrán dáadáa ṣùgbọ́n tí kò kó ohun tuntun kankan jọ.

3. **Mú ibùdó dátà bọ̀sípò.** Tábìlì ẹ̀dà nínú ìdajáde náà gbọ́dọ̀ bá kóòdù tí o ń mú un bọ̀sípò lé lórí mu. Pa gbogbo àwọn olùbẹ̀rẹ̀ àti olùkọ̀wé mọ́ ní dídúró títí tí a ó fi ṣàyẹ̀wò àwọn ẹ̀yà tí a mú bọ̀sípò papọ̀. Ìdajáde láti ẹ̀dà àtijọ́ tí a mú bọ̀sípò sórí kóòdù tuntun máa ń darí ojú-ìwé wẹ́ẹ̀bù sí ètò fífisílẹ̀, èyí tí ó jẹ́ ìṣe tí ó tọ́ ṣùgbọ́n tí kì í ṣe ohun tí o fẹ́ ní àárín ìmúbọ̀sípò. Kọ́kọ́ mú kóòdù tó bá a mu bọ̀sípò.

4. **Tún poller cache kọ́.** Cache jẹ́ ohun tí a yọ jáde, ìmúbọ̀sípò sì jẹ́ ipò gidi níbi tí ó ti lè di àtijọ́. Títún un kọ́ gba ìṣiṣẹ́ kan péré ó sì ń yọ gbogbo ẹ̀ka àwọn àmì ìdàrúdàpọ̀ kúrò.

5. **Bẹ̀rẹ̀ poller, lẹ́yìn náà ṣàyẹ̀wò fáìlì kan.** Rí i dájú pé àkókò àtúnṣe ìkẹyìn ti fáìlì RRD ń lọ síwájú lẹ́yìn ìṣiṣẹ́ àkọ́kọ́. Bí àwọn àwòrán bá kún títí dé àkókò ìmúbọ̀sípò tí wọ́n sì tẹ́jú lẹ́yìn náà, ṣàyẹ̀wò àwọn àbájáde kíkójọ dátà, àwọn ìlà ìdúró, àwọn àmì àkókò, àwọn ipa-ọ̀nà àti àwọn àṣẹ. Àwòrán tí ó tẹ́jú nìkan kì í fi ohun tó fà á hàn.

## Àwọn tẹ́ńkí

**Àwọn fáìlì RRD máa ń kọ àwọn àtúnṣe tí ó wà ní àkókò sẹ́yìn.** Fáìlì RRD kò ní gba àpẹẹrẹ ní tàbí ṣáájú àmì àkókò tí ó ti ní tẹ́lẹ̀. Ṣíṣe ìmúbọ̀sípò àkójọ àwọn fáìlì àtijọ́ sí ibùdó dátà tuntun kì í fúnra rẹ̀ da àwọn àpẹẹrẹ tí ó sọnù padà. Àwọn ìlà ìdúró tí a sún síwájú tí a tọ́jú tàbí àwọn orísun mìíràn lè ní àwọn kíkà tí a lè mú bọ̀sípò, ṣùgbọ́n títún wọn kà nílò ìmúdájú ọ̀tọ̀ọ̀tọ̀ àti títò lẹ́sẹẹsẹ àmì àkókò. Láìsí àwọn kíkà yẹn, kíkójọ dátà yóò tún bẹ̀rẹ̀ pẹ̀lú àlàfo. Èyí tún ni ìdí tí o kò fi lè da àwọn ìfipamọ́ méjì pọ̀ nípa dídà àwọn fáìlì kọ láàárín wọn.

**Ṣàyẹ̀wò bóyá àwọn ipa-ọ̀nà tí o tọ́jú jẹ́ tokenized kí o tó tún ohunkóhun kọ.** Àwọn orísun dátà tí a dá máa ń tọ́jú ipa-ọ̀nà gẹ́gẹ́ bí `<path_rra>/name.rrd`, a sì ń fẹjú token náà ní àkókò kíkà láti inú ètò ipa-ọ̀nà RRD. Fún àwọn yẹn, yíyí ibùdó fífisílẹ̀ padà túmọ̀ sí yíyí ètò padà àti títún poller cache kọ́, kì í ṣe títún àwọn ọ̀wọ́ kọ. Àwọn ipa-ọ̀nà tí a fi ọwọ́ tẹ̀ wọlé ni a tọ́jú gẹ́gẹ́ bí wọ́n ṣe wà, wọ́n sì nílò títúnkọ. Ṣàyẹ̀wò kí o tó ṣe àtúnṣe kọjá tábìlì náà, nítorí pé títún àwọn ipa-ọ̀nà tokenized kọ sí àwọn tí ó kún jẹ́ àtúnṣe tí ó ń mú kí ìgbésẹ̀ tí ń bọ̀ nira sí i.

**Àwọn agbowó dátà láti ọ̀nà jíjìn ní fáìlì ìṣètò tiwọn.** Ọ̀kọ̀ọ̀kan wọn ń di àwọn àmì ìdánimọ̀ ibùdó dátà àti id agbowó dátà ti ara rẹ̀ mú. Wọn kò sí nínú ìfipamọ́ ibùdó dátà àárín. Kó wọn pamọ́ fún agbàlejò kọ̀ọ̀kan.

**Dátà plugin wà nínú ibùdó dátà kan náà.** Àwọn plugin máa ń dá àwọn tábìlì tiwọn nígbà fífisílẹ̀, nítorí náà ìdajáde ibùdó dátà kíkún ń bo wọ́n. Kóòdù plugin kò sí nínú ibùdó dátà. Bí o bá mú ibùdó dátà bọ̀sípò láìsí àpò `plugins/` tó bá a mu, ètò fífisílẹ̀ náà yóò pa ohun tí kò lè rí dákẹ́.

**Ìfipamọ́ tí o kò tíì mú bọ̀sípò jẹ́ àbá lásán.** Mú un bọ̀sípò sínú ẹ̀rọ àyẹ̀wò lásán lórí ètò àkókò kan. Ọ̀nà ìkùnà tí èyí ń mú jùlọ kì í ṣe ìbàjẹ́ dátà; ó jẹ́ ìfipamọ́ tí ó jẹ́ pé apá kan péré nínú àwọn apá mẹ́ta náà ni ó ń kó jọ láti ìbẹ̀rẹ̀.
