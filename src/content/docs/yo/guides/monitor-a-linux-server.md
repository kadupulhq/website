---
title: Mimojuto Olupin Linux kan
description: Yiya awọn aworan ti Sipiyu, iranti, disk, ati fifuye lori olupin Linux nipasẹ net-snmp, kini snmpd nilo lati ṣafihan, ati bii o ṣe le lo iwe afọwọkọ nigbati SNMP ko ba to.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 3
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju ki o to gbẹkẹle wọn. Wo [ipo iṣẹ-ṣiṣe](/yo/project/status/).
:::

Olupin Linux ti n ṣiṣẹ net-snmp yoo fun ọ ni pupọ julọ awọn metiriki laisi koodu afikun eyikeyi. Iṣẹ naa ni lati gba `snmpd` lati ṣafihan awọn igi abẹlẹ ti o tọ ati lati mọ eyiti ninu awọn MIB disk meji ti o bori ti o n wo.

## Kini snmpd gbọdọ ṣafihan

Kadupul n beere awọn agbegbe mẹrin. Fun idanimọ ibojuwo ni awọn igi abẹlẹ ti o nilo fun awọn aworan ti o yan; kii ṣe gbogbo imuṣiṣẹ nilo gbogbo igi abẹlẹ.

| Agbegbe | Igi abẹlẹ | Ohun ti o pese |
|---|---|---|
| Eto | `.1.3.6.1.2.1.1` | Apejuwe, akoko iṣẹ (uptime), olubasọrọ, orukọ, ipo |
| Awọn atọkun | `.1.3.6.1.2.1.2` ati `.1.3.6.1.2.1.31` | Ijabọ, awọn aṣiṣe, ipo |
| Awọn orisun olupin | `.1.3.6.1.2.1.25` | Awọn ilana, awọn olumulo ti o wọle, ibi ipamọ, awọn oluṣeto |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Awọn iwọn fifuye, iranti, akoko Sipiyu, I/O disk, awọn ipin ti a kede |

Ọpọlọpọ awọn pinpin kaakiri ọkọ oju-omi aiyipada `snmpd.conf` ti n funni ni wiwo ti o bo igi abẹlẹ eto nikan. Ẹrọ naa yoo dahun, jabo apejuwe eto kan, ko si gba ohunkohun. Apapọ yii jẹ ikuna akọkọ ti o wọpọ julọ lori olupin Linux ati pe o dabi iṣoro awoṣe gangan.

Ṣayẹwo awọn agbegbe ti o nilo lati ọdọ agbalejo poller ni lilo idanimọ SNMP kanna ti a tunto lori ẹrọ naa. Awọn apẹẹrẹ wọnyi lo agbegbe alapejuwe; rọpo rẹ pẹlu iye ti a tunto rẹ. Awọn OID nọmba yago fun nilo awọn itumọ MIB aami agbegbe.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Ti aṣẹ akọkọ nikan ba ṣiṣẹ, ṣe iwadii idahun gangan: iwoye ti o ni ihamọ, module aṣoju ti ko si, aaye SNMP ti o yatọ, tabi tabili ti o ṣofo le ṣe alaye abajade naa. Daju iṣeto aṣoju ati wiwọle ṣaaju ki o to yi awoṣe Kadupul pada.

## Ṣafikun ẹrọ naa

Apo ti a pese `install/templates/NetSNMP_Device.xml.gz` ni awoṣe ẹrọ Net-SNMP ati awọn igbẹkẹle rẹ. Gbe wọle ti awoṣe ba sonu, lẹhinna yan nigbati o ba n ṣafikun ẹrọ naa. Jẹrisi awọn atọka ibeere ki o ṣẹda awọn aworan ti o fẹ ni gbangba; yiyan awoṣe ẹrọ ko fihan pe gbigba n ṣiṣẹ. Wo [Gbigbe awọn awoṣe wọle](/yo/guides/import-and-export-templates/) ati [Aworan akọkọ rẹ](/yo/start/first-graph/).

## Ohun ti o gba laisi ibeere data

Awọn awoṣe data OID ti o wa titi wọnyi wa ninu package naa. Aworan kan le darapọ ọpọlọpọ ninu iwọnyi; wiwa da lori aṣoju ibi-afẹde. Wọn ko nilo iwari atọka.

| Aworan | OID | Ti fipamọ bi |
|---|---|---|
| Apapọ fifuye iṣẹju 1 | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Apapọ fifuye iṣẹju 5 | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Apapọ fifuye iṣẹju 15 | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Lapapọ iranti | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Iranti ọfẹ | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Iranti ifipamọ (Buffer) | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Iranti ti a fipamọ (Cached) | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| Olumulo Sipiyu | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| Eto Sipiyu | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| Sipiyu ti ko ṣiṣẹ | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Awọn idalọwọduro | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Awọn iyipada ipo | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Awọn ilana | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Awọn olumulo ti o wọle | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Awọn nkan iranti wa ni kilobytes. Aworan iranti ti a ṣajọ kan iyipada ki ipo naa fihan ni awọn baiti. Ti o ba kọ aworan tirẹ lati awọn OID wọnyi, iyipada yẹn jẹ ojuṣe rẹ.

Awọn nkan Sipiyu ti a ṣe akojọ jẹ awọn ipin ogorun ti o ti kọja, kii ṣe awọn iṣiro akoko Sipiyu akojo. Maṣe ro pe awọn mẹta wọnyi nikan bo gbogbo ipo ero isise. Net-SNMP dinku wọn ni ojurere ti awọn iṣiro aise; awọn iṣiro aise nilo oṣuwọn to dara ati awọn iṣiro ipin ogorun, kii ṣe ifibọ rọrun sinu awoṣe gauge. Wo [UCD-SNMP-MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Kini o nilo ibeere data

| Ibeere | Nwari | Ni atilẹyin nipasẹ |
|---|---|---|
| SNMP - Gba awọn aaye gbigbe (mount points) | Ohun gbogbo ti aṣoju n pe ni ibi ipamọ | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Gba awọn ipin ti a ṣe abojuto | Awọn ipin ti a kede ni `snmpd.conf` nikan | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Gba alaye ero isise | Titẹ sii kan fun Sipiyu kọọkan | Fifuye ero isise awọn orisun olupin |
| Net-SNMP - Gba I/O ẹrọ | Awọn ẹrọ idena (block devices) | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Awọn iṣiro atọkun | Awọn atọkun nẹtiwọọki | `IF-MIB` |

### Ibeere disk wo ni lati lo

Iwọnyi kii ṣe awọn iwo meji ti data kanna.

Ibeere awọn orisun olupin n kọja ohun gbogbo ti aṣoju ṣe ijabọ bi ibi ipamọ. Lori ọpọlọpọ awọn ogun Linux, eyi n ṣajọpọ iranti ti ara, swap, awọn agbeko tmpfs, ati awọn eto faili gidi sinu atokọ kan. Awọn iwọn ti wa ni pada ni awọn iwọn ipinfunni, ati ibeere naa ka iwọn ẹyọ ipinfunni bi aaye lọtọ ki aworan naa le pọ si. O gba ohun gbogbo laisi atunto ohunkohun, ṣugbọn tun atokọ gigun ti awọn titẹ sii ti o ko fẹ.

Ibeere net-snmp n ka tabili disk UCD, ti o kun nipasẹ awọn itọsọna `disk` tabi `includeAllDisks`. Yan awọn ipin ti o han gbangba tabi iwari gbooro; wọn jẹ awọn ilana oriṣiriṣi.

```
disk /      10%
disk /var   10%
```

Ni omiiran, `includeAllDisks 10%` ṣe afihan awọn disiki ti a rii ni ibẹrẹ aṣoju. Iye 10% n tunto iloro aaye ọfẹ kan; kii ṣe àlẹmọ yiyan ati pe ko tunto awọn itaniji Kadupul funrararẹ. Tun gbejade tabi tun aṣoju bẹrẹ lẹhinna ṣe atunyẹwo awọn atọka. Ibeere ti o ṣofo le tun ṣe afihan awọn iṣoro wiwọle tabi wiwa module. Wo [iṣeto snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Ṣe anfani ibeere awọn orisun olupin nigbati o ba fẹ pipe ati pe o ṣetan lati ṣe àlẹmọ. Ṣe anfani ibeere net-snmp pẹlu awọn titẹ sii `disk` ti o han nigbati o ba fẹ atokọ ti a fojusi. `includeAllDisks` n gbooro si atokọ yẹn; tun ṣayẹwo awọn atọka lẹhin ti aṣoju ba bẹrẹ pada.

### Awọn atọkun

Ibeere data atọkun lori olupin kan n huwa gangan bi lori yipada, pẹlu iṣọra kan: `ifDescr` labẹ Linux jẹ orukọ atọkun ekuro, eyiti o le yipada lẹhin atunbere tabi imudojuiwọn awakọ. Wo [Mimojuto iyipada kan](/yo/guides/monitor-a-switch/) fun awọn alaye yiyan atọka.

## Nigbati SNMP ko ba to

Diẹ ninu awọn metiriki ko ni MIB ti o ṣee lo. Ijinle isinyi, counter ohun elo, tabi nọmba kan ninu faili kan nilo titẹ sii iwe afọwọkọ.

Awọn otitọ meji pinnu bi o ṣe kọ iwe afọwọkọ naa.

**Iwe afọwọkọ naa n ṣiṣẹ lori ẹrọ nibiti poller n ṣiṣẹ, kii ṣe lori olupin ti a ṣe abojuto.** Wiwa ibi-afẹde jẹ iṣẹ iwe afọwọkọ rẹ: SSH, ipe HTTP kan, aṣoju kan, tabi ohunkohun ti o ti ran tẹlẹ.

**Agbẹjọro (poller) n ka iṣelọpọ boṣewa (stdout) ko si si nkan miiran.** Ipo ijade ko ni iṣiro.

Adehun iṣelọpọ:

| Iṣelọpọ | Itumọ |
|---|---|
| `42` tabi `3.7` | Iye kan fun orisun data kan |
| `U` | Ko si iye fun iyipo yii, ti a gbasilẹ bi aimọ (unknown) |
| `in:1420 out:980` | Awọn iye pupọ, ọkan fun orisun data kọọkan |

Fun fọọmu iye pupọ, awọn orisii ti pin nipasẹ awọn aaye ẹyọkan ati orukọ ti yapa kuro ninu iye nipasẹ oluṣafihan kan. Oluyanju n ka awọn opin si aaye funfun, nitorinaa awọn aaye inu afikun le fa ki iṣeduro kuna. PHP poller ṣe gige aaye funfun ti o tẹle. Ṣe agbejade ọna kika canonical pẹlu awọn aaye ẹyọkan ki o darí awọn iwadii kuro lati stdout.

Awọn orukọ orisun data RRD inu ti a gba nipasẹ olootu awoṣe baamu `[a-zA-Z0-9_]{1,19}`; a ko gba awọn aami-isalẹ (hyphens) nibẹ. Awọn aami iṣelọpọ iwe afọwọkọ gbọdọ baramu awọn orukọ aaye titẹ sii data ati ṣe maapu si awọn nkan inu ti a pinnu. Gbogbo laini iṣelọpọ wa ni ipamọ sinu iwe ti o ni awọn ohun kikọ 512. Wo [Awọn iwe afọwọkọ gbigba data](/yo/guides/write-a-data-collection-script/) fun adehun poller PHP ti a ṣe ayẹwo.

Da `U` pada dipo `0` nigbati o ko ba le wiwọn nkan kan. Odo jẹ wiwọn kan ati pe a yoo gbero rẹ bii iru bẹẹ. Wo [Awọn orisun data ati awọn RRA](/yo/concepts/data-sources-and-rras/) fun idi ti a fi pin awọn mejeeji lọtọ.

### Olupin iwe afọwọkọ (script server)

Iwe afọwọkọ ti o rọrun nṣiṣẹ lẹẹkan fun orisun data fun aarin kọọkan. Fun iwe afọwọkọ ti a kọ sinu PHP, fọọmu olupin iwe afọwọkọ n pe iṣẹ kan ninu ilana PHP ti o yatọ gigun, dinku idinku ibẹrẹ onitumọ.

### Pakute atokọ ti a gba laaye (whitelist trap)

Nigbati a ba lo faili atokọ ti a gba laaye titẹ data, poller ṣe afiwe okun aṣẹ ti titẹ data kọọkan si eyiti o gbasilẹ. Okun aṣẹ ti o yipada laisi atunṣe atokọ ti a gba laaye duro ṣiṣẹda awọn titẹ sii kaṣe poller, ati orisun data n lọ ni idakẹjẹ laisi aṣiṣe lori aworan naa. Akọọlẹ naa jabo eyi, ṣugbọn UI ko ṣe bẹ.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Rọpo `42` pẹlu ID ti ọna titẹ sii data ti a ṣe ayẹwo, kii ṣe ID ẹrọ. Imudojuiwọn laisi `--id` gba awọn gbolohun aṣẹ lọwọlọwọ kọja gbogbo akojo oja titẹ sii. Ṣe ayẹwo awọn ayipada tẹlẹ. Lẹhin imudojuiwọn, rii daju iṣiṣẹ orisun ati awọn titẹ sii kaṣe poller to munadoko.

## Awọn ipo ikuna

| Aami aisan | Idi ti o wọpọ |
|---|---|
| A ka apejuwe eto, ko si ohun miiran ti a gba | Wiwo `snmpd` ni ihamọ si igi abẹlẹ eto nikan |
| Ibeere ipin Net-SNMP ko rii awọn atọka | Ko si awọn laini `disk` tabi `includeAllDisks` ninu `snmpd.conf` |
| Awọn ipin awọn orisun olupin pẹlu RAM ati tmpfs | O ti ṣe yẹ; aṣoju ṣe ijabọ wọn bi ibi ipamọ |
| Aworan iranti ti wa ni pipa nipasẹ ifosiwewe ti 1024 | Ilé lori awọn OID aise laisi iyipada |
| Iwe afọwọkọ n da iye pada lori laini aṣẹ, poller n gbasilẹ unknown | Iṣejade/aiṣedeede maapu, awọn aṣiṣe idena inu tabi orukọ inu ti ko wulo |
| Iwe afọwọkọ n ṣiṣẹ pẹlu ọwọ ṣugbọn kuna nipasẹ poller | O n ṣiṣẹ bi olumulo poller pẹlu agbegbe ati awọn igbanilaaye rẹ |
