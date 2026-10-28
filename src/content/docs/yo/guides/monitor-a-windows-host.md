---
title: Mimojuto Olupin Windows kan
description: Yiya awọn aworan ti Sipiyu, awọn disiki, awọn atọkun, ati akoko iṣẹ lori Windows nipasẹ iṣẹ SNMP, kini awọn nkan awọn orisun olupin gbe data, ati kini lati ṣe nigbati SNMP ko ba si.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 14
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju ki o to gbẹkẹle wọn. Wo [ipo iṣẹ-ṣiṣe](/yo/project/status/).
:::

Windows lori SNMP n pese awọn atọkun, awọn oluṣeto, ibi ipamọ, ati diẹ ninu awọn iṣiro. Aṣoju Microsoft ti a ṣe sinu ko ṣe afihan fifuye, iranti, ati awọn ohun disiki ti awọn awoṣe net-snmp UCD. Iranti tun le ṣe eto lati awọn ori ila ibi ipamọ ti aṣoju ba ṣafihan wọn. Awọn aṣoju ẹnikẹta le pese awọn nkan miiran; ṣayẹwo aṣoju gangan ṣaaju yiyan awọn awoṣe.

## Kini iṣẹ SNMP n pese

Iṣẹ Windows SNMP ti dinku ati pe o jẹ aṣayan. Fun Windows 10 ati 11, Microsoft ṣe akosile fifi sori rẹ nipasẹ awọn ẹya aṣayan tabi awọn ẹya Windows; aṣiṣe orukọ ẹya DISM ti iṣaaju nikan ko fihan pe ko si. Ṣayẹwo awọn ilana ti o yẹ fun ẹda Windows rẹ. Wo [itọsọna fifi sori ẹrọ SNMP ti Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Ṣayẹwo ewo ninu awọn igi abẹlẹ wọnyi ti aṣoju ti o fi sii n ṣafihan:

| Agbegbe | Igi abẹlẹ | Ohun ti o pese |
|---|---|---|
| Eto | `.1.3.6.1.2.1.1` | Apejuwe, akoko iṣẹ, olubasọrọ, orukọ, ipo |
| Awọn atọkun | `.1.3.6.1.2.1.2` ati `.1.3.6.1.2.1.31` | Ijabọ, awọn aṣiṣe, ipo |
| Awọn orisun olupin | `.1.3.6.1.2.1.25` | Awọn oluṣeto, ibi ipamọ, kika ilana, awọn olumulo ti o wọle |
| LAN Manager | `.1.3.6.1.4.1.77` | Awọn iṣẹ Windows ati data ipin |

Awọn awoṣe Windows ti a pese ti Kadupul ka awọn agbegbe mẹta akọkọ. Ko si ohunkan ninu ṣeto ti a pese ti o ka igi abẹlẹ LAN Manager.

Awọn ohun iṣeto meji lori olupin pinnu boya o gba data: okun agbegbe ati atokọ ti awọn alakoso ti aṣoju gba awọn apo-iwe lati ọdọ wọn. Olupin ti a ṣeto lati gba SNMP nikan lati adirẹsi oluṣakoso kan yoo dahun si oluṣakoso yẹn nikan ki o sọ ohun gbogbo miiran silẹ.

Daju agbegbe kọọkan lati ọdọ agbalejo poller ṣaaju ṣiṣẹda awọn aworan. Rọpo olupin apẹẹrẹ ati agbegbe pẹlu awọn iye ti a tunto rẹ; `public` jẹ fun awọn idi apejuwe nikan.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Irin-ajo keji (walk) ka ẹru ero isise, ekeji ka atokọ apejuwe ibi ipamọ. Ti aṣẹ akọkọ ba ṣiṣẹ ti awọn meji miiran ko si da ohunkohun pada, ṣayẹwo awọn ihamọ wiwọle, atilẹyin aṣoju, ati aṣiṣe SNMP ti o pada.

## Ṣafikun ẹrọ naa

Gbe wọle `install/templates/Windows_Device.xml.gz` ti awọn awoṣe ba sonu, ni ibamu si [Gbigbe wọle ati gbigbejade awọn awoṣe](/yo/guides/import-and-export-templates/). Yan awoṣe ẹrọ Windows, rii daju iwari ibeere, lẹhinna ṣẹda awọn aworan ti o fẹ ni gbangba. Apo naa ni awọn ibeere data mẹta ati awọn awoṣe aworan ti o somọ.

| Ibeere data | Ni atilẹyin nipasẹ | Ka |
|---|---|---|
| SNMP - Awọn iṣiro atọkun | `resource/snmp_queries/interface.xml` | `IF-MIB`, rin taara |
| SNMP - Gba alaye ero isise | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` nipasẹ `scripts/ss_host_cpu.php` |
| SNMP - Gba awọn aaye gbigbe | `resource/script_server/host_disk.xml` | `hrStorageTable` nipasẹ `scripts/ss_host_disk.php` |

Awọn ibeere disk ati ero isise jẹ awọn ibeere olupin iwe afọwọkọ laibikita awọn orukọ wọn. Wọn ṣiṣẹ ni ilana olupin iwe afọwọkọ PHP lọtọ gigun ati ṣe awọn ipe SNMP pẹlu awọn iwe-ẹri ti igbasilẹ ẹrọ naa. Ibeere atọkun jẹ ibeere SNMP mimọ. Abajade to wulo ni pe olupin iwe afọwọkọ PHP ti o kuna n da gbigba disiki ati Sipiyu duro lori Windows lakoko ti awọn aworan atọkun tẹsiwaju lati ṣiṣẹ.

## Ohun ti o gba laisi ibeere data

Awọn awoṣe aworan meji kọọkan ka OID kan ti o wa titi.

| Aworan | OID | Ti fipamọ bi |
|---|---|---|
| MIB Olupin - Awọn ilana | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB Olupin - Awọn olumulo ti o wọle | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Awọn meji miiran ko ka ohunkohun lati ẹrọ naa. Akoko iṣẹ ati awọn aworan akoko idibo n pe `scripts/ss_hstats.php` ki o da iwe kan pada lati igbasilẹ ẹrọ Kadupul funrararẹ: `snmp_sysUpTimeInstance` fun akoko iṣẹ, iye akoko idibo ti a gbasilẹ fun akoko ibeere. Wọn ka awọn wiwọn ti o fipamọ, kii ṣe idahun SNMP tuntun lẹsẹkẹsẹ.

## Awọn tabili orisun olupin

### Awọn oluṣeto

`hrProcessorLoad` labẹ `.1.3.6.1.2.1.25.3.3.1.2` ṣe idapada titẹ sii kan fun ero isise ọgbọn kọọkan ti aṣoju n ṣafihan. Rin naa n pese awọn atọka; maṣe ro pe kika ila nigbagbogbo baamu iye okun hardware ti a polowo.

Iye naa ti jẹ ipin ogorun tẹlẹ. MIB ṣe alaye rẹ bi aropin lori iṣẹju to kọja. Wo [itumo Host Resources MIB](https://www.rfc-editor.org/rfc/rfc2790.html).

### Ibi ipamọ

Ibeere ibi ipamọ ti a pese nlo `hrStorageTable` labẹ `.1.3.6.1.2.1.25.2.3.1`. O ka awọn ọwọn mẹfa.

| Ọwọn | OID | Itọsọna |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Atọka |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Atọka ati aami ti o han |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Titẹ sii, olupin |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Iṣelọpọ |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Iṣelọpọ |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Iṣelọpọ |

Iwọn ati aaye ti a lo jẹ awọn iṣiro iwọn ipinfunni, kii ṣe awọn baiti. Iwe afọwọkọ naa n pọ si iye kọọkan nipasẹ iwọn ẹyọ ipinfunni ti o fipamọ fun atọka yẹn nigbati awọn iye mejeeji wulo.

Awọn nkan meji n fa wahala nigbagbogbo lori Windows.

**Tabili kii ṣe atokọ ti awọn dirafu lile.** Aṣoju ṣe ijabọ ohun gbogbo ti o ro pe o jẹ ibi ipamọ. Ti o da lori aṣoju, iranti ti ara ati iranti foju le han lẹgbẹẹ awọn awakọ ti o wa titi. Awọn aami bii `C:\`, `D:\`, `Physical Memory`, ati `Virtual Memory` jẹ awọn apẹẹrẹ, kii ṣe awọn ori ila ti o ni idaniloju. Yan awọn ori ila ti o fẹ lati ya aworan.

**Awọn iye ibi ipamọ nla tabi ti ko wulo nilo ijerisi.** MIB ṣe alaye iwọn ati lilo bi Integer32 ti kii ṣe odi. Aṣoju ti n da iye odi pada wa ni ita sakani yẹn. Iwe afọwọkọ lọwọlọwọ nlo `(abs(value) + 2147483647) * allocation_units`, eyiti ko ṣe aṣoju atunlo 32-bit ti ko fowo si. Ṣe itọju awọn iye ti o kan bi a ko gbẹkẹle ki o tun ṣe atọka lẹhin atunṣe awari naa. Wo [abawọn iyipada ibi ipamọ](https://github.com/kadupulhq/kadupul/issues/243).

## Nibiti Windows ti yatọ si Linux

| Ẹya ara ẹrọ | Linux pẹlu net-snmp | Aṣoju Windows ti a ṣe sinu / awọn awoṣe ti a pese |
|---|---|---|
| Apapọ fifuye | `.1.3.6.1.4.1.2021.10.1.3` | Ko si awọn nkan apapọ fifuye UCD |
| Iranti | `.1.3.6.1.4.1.2021.4` | Le ṣe eto lati awọn ori ila `hrStorage` ti o han |
| Sipiyu | Awọn ipin ogorun UCD tabi `hrProcessorLoad` | `hrProcessorLoad` nikan |
| Atokọ disk | Ti a kede nipasẹ rẹ nipasẹ `dskTable` tabi `hrStorage` | `hrStorage` nikan, laisi àlẹmọ |
| I/O disk | `diskIOTable` | Ko si ohunkan ti a pese ti o ka eyi |
| Awọn orukọ atọkun | Awọn orukọ ekuro, kukuru | Awọn apejuwe ohun ti nmu badọgba gigun, nigbagbogbo ṣe pidanpidan |

Aṣoju Microsoft ti a ṣe sinu ko pese igi abẹlẹ UCD `.1.3.6.1.4.1.2021`. Wo [Laasigbotitusita data ti o sonu](/yo/guides/troubleshoot-missing-data/).

### Awọn atọkun

Ibeere atọkun jẹ aami kanna si eyiti yipada nlo. Eto ayanfẹ atọka rẹ jẹ `ifName`, lẹhinna `ifDescr`, lẹhinna `ifHwAddr`, lẹhinna `ifIndex`. O yan aaye akọkọ ti o wa ati alailẹgbẹ lori atọkun kọọkan ti a rii.

Windows jẹ pẹpẹ nibiti eyi ti kuna nigbagbogbo julọ. Awọn NIC meji ti o jọra le da `ifDescr` kanna pada, ati pe diẹ ninu awọn aṣoju fi `ifName` silẹ ni ofo. Nigbati ibeere naa ba ṣubu pada si `ifIndex`, itan atọkun rẹ ni asopọ si nọmba kan ti Windows ni ominira lati tun sọtọ.

Wo [Mimojuto iyipada kan](/yo/guides/monitor-a-switch/) ati [Awọn ibeere data ati awọn atọka](/yo/concepts/data-queries-and-indexes/).

## Nigbati SNMP ko ba si

Ọpọlọpọ awọn fifi sori ẹrọ Windows ko ni iṣẹ SNMP ti o ṣiṣẹ. Aropo jẹ titẹ sii iwe afọwọkọ.

Awọn otitọ meji pinnu bi o ṣe kọ iwe afọwọkọ naa.

**Iwe afọwọkọ naa n ṣiṣẹ lori ẹrọ nibiti poller n ṣiṣẹ.** Wiwa olupin Windows jẹ iṣẹ iwe afọwọkọ rẹ: WinRM, aṣoju kan, aaye ipari HTTP, ipin kan, tabi ohunkohun ti o nṣiṣẹ.

**Ṣe agbejade awọn wiwọn lori iṣelọpọ boṣewa.** Ọna aṣẹ ita ti PHP poller ko lo ipo ijade bi iye wiwọn. Ṣe agbejade nọmba kan, tabi `U` fun ko si wiwọn ninu iyipo yii. Maṣe ṣe agbejade `0` nigbati o ba pinnu lati fihan pe wiwọn kuna.

Ti o ba nilo iye kan fun atọkun kọọkan, fun disiki kọọkan, tabi fun iṣẹ kọọkan dipo nọmba kan, ilana iwe afọwọkọ kanna n pese fọọmu atọka kan. `resource/script_queries/host_cpu.xml` jẹ apẹẹrẹ ti o wulo ti o pe iwe afọwọkọ PHP kan dipo olupin iwe afọwọkọ.

Wo [Kikọ iwe afọwọkọ gbigba data](/yo/guides/write-a-data-collection-script/) fun adehun iṣelọpọ ati awọn idiwọ orukọ.

## Awọn ipo ikuna

| Aami aisan | Idi ti o wọpọ |
|---|---|
| A ka apejuwe eto, ko si ohun miiran ti a gba | Ṣayẹwo atilẹyin nkan, awọn ihamọ wiwọle, ati aṣiṣe SNMP kan pato |
| Ko si idahun rara lati ọdọ agbalejo ti o wa lori ayelujara | Atokọ awọn alakoso ti aṣoju ti gba tabi ofin ogiriina ogun lori UDP 161 |
| Atokọ ipin pẹlu iranti | O ti ṣe yẹ; aṣoju ṣe ijabọ iranti bi ibi ipamọ |
| Iwọn didun nla han odi tabi aimọ | Awọn iye aṣoju ti ko wulo tabi awọn ẹya ipinfunni ti atijọ; ṣayẹwo kokoro ti a mọ |
| Disk ati Sipiyu duro, awọn atọkun tẹsiwaju | Ikuna olupin iwe afọwọkọ; ibeere atọkun ko lo |
| Awọn awoṣe Net-snmp ti a sọtọ, gbogbo wiwọn aimọ | Aṣoju ti o yan ko pese awọn nkan UCD ti o nilo fun awọn awoṣe wọnyẹn |
| Itan atọkun tẹle ohun ti nmu badọgba ti ko tọ lẹhin iyipada | Atọka pada si `ifIndex` nitori awọn orukọ jẹ ofo tabi ti ṣe pidanpidan |
| Akoko iṣẹ tun ṣe iye atijọ | Ṣayẹwo boya igbasilẹ ẹrọ ti dagba; oluranlọwọ ko ṣe afikun akoko iṣẹ siwaju |
