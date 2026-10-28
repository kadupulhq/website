---
title: Mimojuto Yipada kan
description: Ṣe afẹri awọn ebute oko oju omi yipada, ṣe apẹrẹ awọn iṣiro to tọ, ki o yan atọka kan ki itan ibudo naa wa ni nkan ṣe pẹlu ibudo lẹhin rirọpo kaadi.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 2
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju ki o to gbẹkẹle wọn. Wo [ipo iṣẹ-ṣiṣe](/yo/project/status/).
:::

Yipada jẹ apẹẹrẹ lilo Ayebaye fun awọn ibeere data. O ko mọ tẹlẹ iye awọn ebute oko oju omi ti o wa, kika le yipada, ati pe ibudo kọọkan nilo orisun data tirẹ. Wo [Awọn awoṣe](/yo/concepts/templates/) fun bi awọn ibeere data ṣe n ṣiṣẹ; oju-iwe yii sọrọ nipa iṣeto ti o tọ.

## Šaaju ki o to bẹrẹ

Rii daju pe ẹrọ naa dahun lati ọdọ olugba ti a yan, ni pataki labẹ olumulo poller. Lo awọn iwe-ẹri kika-nikan ti a tunto rẹ. Awọn OID nọmba yago fun igbẹkẹle lori awọn orukọ MIB ti a fi sori ẹrọ ni agbegbe.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Lo SNMP v2c tabi v3. Awọn iṣiro atọkun 64-bit jẹ awọn nkan SMIv2 ati pe ko le ṣe ibeere nipasẹ v1. Ẹrọ v1 kan yoo fun ọ ni awọn iṣiro 32-bit nikan ko si si nkan miiran.

## Yiyan awoṣe ẹrọ

Awoṣe ẹrọ pinnu kini awọn ibeere data ati awọn awoṣe aworan ti a nṣe nigbati o ba ṣafikun ẹrọ naa. Kadupul jogun awoṣe ti Cacti pese, eyiti o pẹlu awoṣe ẹrọ SNMP jeneriki ati eto awọn awoṣe pato ti olutaja.

Wiwa ibudo wa lati orisun kanna laibikita yiyan rẹ: ibeere data atọkun ti a ṣalaye ninu `resource/snmp_queries/interface.xml`. Ti ko ba si awoṣe ti o baamu ohun elo rẹ, yan awoṣe jeneriki ki o darapọ mọ ibeere atọkun pẹlu rẹ.

## Ṣiṣe ibeere data

Ibeere naa n lọ nipasẹ `ifIndex` lati wa awọn ebute oko oju omi, ati pe o ka `ifNumber` lati mọ iye ti a nireti. Lẹhinna o gba akojọpọ awọn aaye fun ibudo kọọkan.

| Aaye | OID | Ti a lo fun |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Ipo ninu tabili SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Orukọ ibudo kukuru, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Apejuwe gigun |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Apejuwe atọkun ti o tunto |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Adirẹsi MAC ibudo |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Iyara ninu awọn idinku/iṣẹju-aaya, 32-bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Iyara ninu Mbits/iṣẹju-aaya |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up tabi Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Awọn iṣiro baiti 32-bit |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Awọn iṣiro baiti 64-bit |

Ṣiṣe ibeere lẹẹkan lori ẹrọ naa. Yoo da tabili kan ti awọn ebute oko oju omi ti a rii pada. Ka tabili yii ṣaaju ṣiṣẹda awọn aworan, nitori o ṣe ipilẹ fun gbogbo ipinnu atẹle.

## Yiyan awọn iṣiro 64-bit

Ibeere atọkun nfunni ni ọpọlọpọ awọn awoṣe aworan ijabọ. Awọn akọkọ ni:

| Awoṣe aworan | Ka |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Bakan naa, pẹlu laini ipin 95th |
| In/Out Bits (64-bit, BW) | Bakan naa, ibatan si iyara atọkun |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Lo awoṣe 64-bit ayafi ti o ba ni idi pataki lati maṣe ṣe bẹ. Counter octet 32-bit kan gbe soke ni 4294967295. Ibudo gigabit labẹ ẹru kikun kun ni to iṣẹju 34. Ni igbesẹ iṣẹju-aaya 300 kan, poller ko le ṣe iyatọ iṣan omi kan lati awọn iṣan omi meje, ati pe `COUNTER` n ṣe atunṣe iṣan omi kan nikan laarin awọn ayẹwo meji. Aworan naa ko han pe o fọ ni gbangba; o kan ṣe afihan awọn iye ti o kere pupọ nigbagbogbo.

Daju pe awọn iṣiro ti kun gaan ṣaaju ṣiṣe awọn ọgọọgọrun ti awọn aworan.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Irin-ajo ofo tabi ti o kuna nilo iwadii: ṣayẹwo aṣiṣe ti a royin, wiwo wiwọle, ati atilẹyin aṣoju.

## Ṣiṣayẹwo iwọn ti o pọ julọ ti o fipamọ lẹhin awọn ayipada iyara

Nigbati orisun data ba nlo iwọn ti o pọ julọ ti o da lori iyara ibeere, ẹda n fa iyara lati data awari ti a fipamọ. `ifHighSpeed` ni o fẹ julọ, a lo `ifSpeed` ti akọkọ ba sonu, ati pe a lo aiyipada ti a tunto ti awọn mejeeji ba jẹ odo.

Iye yẹn ti kọ sinu faili naa. Ibudo ti a rii ni 100 Mbps ati nigbamii ti a ṣe adehun ti o ga julọ le da fila kan duro ni isalẹ ijabọ gidi rẹ, ati pe RRDtool yoo ṣe igbasilẹ awọn oṣuwọn ti o ga ju fila yẹn bi aimọ. Ṣe afiwe iyara ti o fipamọ, itumọ orisun data, ati faili gangan pẹlu `rrdtool info`.

## Ipinnu atọka

Eyi ni ibiti a ti padanu itan ti a ba ṣe awọn aṣiṣe.

Orisun data kọọkan tọju awọn nkan meji nipa ibudo rẹ: aaye wo ni o ṣe idanimọ rẹ (iru atọka) ati iye aaye yẹn. Ni gbogbo atunṣe atọka, o tun rii ibudo nipa bibeere iru atọka SNMP ti o ni iye yẹn lọwọlọwọ ni aaye yẹn. Orisun data tẹle iye, kii ṣe ipo tabili.

Nitorina ibeere naa ni aaye wo ni o gbe iye naa.

Ibeere atọkun n kede aṣẹ ayanfẹ: `ifName`, lẹhinna `ifDescr`, lẹhinna `ifHwAddr`, lẹhinna `ifIndex`. Kadupul maa n yan laarin awọn oludije pẹlu awọn iye pato ti o to ati pe ko si awọn ẹda-ẹda.

| Aaye | Yọ ninu ewu | Kuna nigbati |
|---|---|---|
| `ifName` | Atunbere, rirọpo kaadi, atunkọ nọmba | Aṣoju fi silẹ ni ofo tabi tun ṣe laarin awọn ọmọ ẹgbẹ akopọ |
| `ifDescr` | Ni igbagbogbo iduroṣinṣin lori ohun elo iyipada | Lori awọn olupin orukọ ekuro le yipada |
| `ifHwAddr` | Atunbere | Kaadi ti o rọpo ni awọn MAC titun, eyiti o jẹ ọran gangan ti o fẹ lati daabobo |
| `ifIndex` | Ko si ohun ti o gbẹkẹle | Pipaṣipaarọ kaadi, atunbere, tabi iyipada famuwia n tun nọmba tabili ṣe |

Ti ibeere naa ba ṣubu pada si `ifIndex`, ṣe itọju eyi bi iṣoro kii ṣe abajade deede. Itan ibudo rẹ lẹhinna ni asopọ si nọmba kan ti yipada ni ominira lati tun sọtọ.

## Ọna atunṣe atọka (reindex method)

Ṣeto fun ẹrọ kan fun ibeere data. O pinnu nigbati Kadupul ba tun ka awọn aaye atọka.

| Ọna | Ti nfa lori | Iye owo |
|---|---|---|
| None | Ko si nkan; afọwọṣe tabi iwe afọwọkọ nikan | Ko si |
| Uptime | Akoko iṣẹ SNMP ti ẹrọ ti n lọ sẹhin | Ifiwera kan fun iyipo kan |
| Index Count | Iyipada ninu iye awọn atọka ti a rii | Kika kan fun iyipo kan |
| Verify All | Ikuna ti idanimọ idanimọ ti a fipamọ | Beere awọn atọka ti a mọ lakoko idibo |

Uptime jẹ aiyipada ati pe o baamu ọpọlọpọ awọn iyipada, nitori atunbere jẹ iṣẹlẹ ti o tun awọn atọka pada. Index Count n gba awọn kaadi ti a ṣafikun tabi yọ kuro laisi atunbere. Verify All le ṣe iwari awọn idanimọ ti o yipada lori awọn atọka ti a mọ, ṣugbọn ko ṣe iṣeduro iwari ti awọn ebute oko oju omi titun.

Lati tun ẹrọ ti o yan ati ibeere ṣiṣẹ, rọpo awọn ID mejeeji pẹlu awọn ID ti a fi sii. Fi `--qid` silẹ lati tun gbogbo awọn ibeere ṣe fun ẹrọ yẹn:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` fa ipaniyan si gbogbo awọn ẹrọ ti o ṣiṣẹ. Yago fun agbekọja atunse atọka gbalaye. `--force` kọja iforukọsilẹ ilana ati sọ awọn kaṣe akọle di tuntun.

## Nigbati ibudo kan ba sọnu

Maṣe ro pe ibudo ti o sonu yoo da gbigba duro laifọwọyi. Koodu atunṣe atọka lọwọlọwọ le tun asia alainibaba pada ki o mu awọn OID idibo atijọ duro nigbati idanimọ ko ba yanju ati pe ko si orisun ti o yi atọka pada. Ṣe afiwe idanimọ ti o fipamọ pẹlu kaṣe iwari tuntun ki o mu orisun ti o kan ṣiṣẹ titi ti a fi jẹrisi ibaramu naa. Wo [Awọn ibeere data ati awọn atọka](/yo/concepts/data-queries-and-indexes/).

## Awọn chassis nla (large chassis)

Awọn eto meji fun ẹrọ kan di pataki ni kete ti kika ibudo ba ga: ṣayẹwo awọn OID ti a tunto fun ibeere SNMP kọọkan ati kika okun fun ẹrọ kọọkan. Atilẹyin ipele ati afiwe ti o munadoko dale lori olugba ati aṣoju; PHP `cmd.php` ati Spine ko funni ni ihuwasi okun kanna.

Yi eto kan pada ni akoko kan ki o ṣe akiyesi iye akoko iyipo poller.

## Awọn ipo ikuna

| Aami aisan | Idi |
|---|---|
| Awọn aworan ti a ṣẹda, gbogbo wiwọn aimọ | Awọn iṣiro 64-bit ko ni imuse, tabi ẹrọ nlo SNMP v1 |
| Awọn iṣiro n fo si awọn iye asan | Counter 32-bit kọja diẹ sii ju ẹẹkan lọ fun aarin kan |
| Awọn ela nikan labẹ ẹru nla | O pọju RRD ti wa ni titiipa ni iyara ti a rii atijọ |
| Itan ibudo ti a yàn si ibudo ti ko tọ lẹhin itọju | Idanimọ riru, maapu atijọ, tabi mimu alainibaba ti ko yanju |
| Poller ṣe igbasilẹ awọn ikilọ nipa awọn atọka SNMP ti ko wulo | Awọn orisun data ti a fi silẹ laisi atọka; tun ṣe atọka, pa rẹ, tabi mu u kuro |
| Awọn ebute oko oju omi ti a rii, ko si ohun ti a gba | Awọn orisun data pẹlu atọka ofo ko ṣẹda awọn titẹ sii kaṣe poller |
