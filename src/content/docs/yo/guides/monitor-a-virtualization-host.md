---
title: Mimojuto olupin foju kan
description: Kini hypervisor n ṣafihan lori SNMP, kini awọn ọkọ oju omi fun ESXi, ati idi ti kika awọn alejo, Sipiyu ati iranti lori ohun-ini foju kan nira ju bi o ti ri lọ.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 27
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira to daju. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Apo ESXi ti a firanṣẹ n gba awọn wiwọn olupin ati awọn iṣiro akojo oja alejo. Ko pese Sipiyu alejo kọọkan, iranti tabi awọn wiwọn ifigagbaga. Jẹrisi awọn nkan ti o han nipasẹ ẹya hypervisor rẹ ṣaaju yiyan awọn aworan.

## Ohun ti o ba pẹlu

Awoṣe ẹrọ hypervisor kan ti firanṣẹ: **ESXi Device**. O jẹ package ẹrọ kan, nitorinaa `install/templates/ESXi_Device.xml.gz` ni awọn iwe afọwọkọ rẹ ati awọn faili ibeere data ninu. Tẹle [Gbe wọle ati gbejade awọn awoṣe](/yo/guides/import-and-export-templates/) ki o rii daju pe gbigbe wọle ti pari, pẹlu imuṣiṣẹ faili. Yan awoṣe ẹrọ, ṣayẹwo iwari, ki o ṣẹda awọn aworan ti o fẹ ni gbangba; gbigbe wọle package tabi sisopọ awoṣe ẹrọ kan nikan ko ṣẹda wọn.

| Ohun ti o ba pẹlu | Idi |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Ṣe awari awọn olutọsọna ati ka fifuye fun olutọsọna kọọkan |
| `resource/snmp_queries/esxi_hw.xml` | Ṣe awari awọn paati ohun elo ati ka ipo wọn |
| `resource/snmp_queries/interface.xml` | Ibeere awọn iṣiro atọkun boṣewa |
| `resource/script_server/host_disk.xml` | Awọn ipin ti a gbe sori, nipasẹ tabili ibi ipamọ Host Resources |
| `scripts/ss_esxi_vhosts.php` | Ti a ṣajọpọ ninu `install/templates/ESXi_Device.xml.gz`; ka awọn alejo, awọn alejo ti o ni agbara lori, ati ipo awọn irinṣẹ alejo |
| `scripts/ss_multicpu_avg.php` | Apapọ fifuye fun olutọsọna kọọkan sinu nọmba kan |
| `scripts/ss_hstats.php` | Ka awọn iṣiro idibo Kadupul ti dimu tẹlẹ fun ẹrọ naa |
| `scripts/ss_host_disk.php` | Ṣe afẹyinti ibeere awọn ipin disiki |

Ko si package ẹrọ igbẹhin ti a firanṣẹ fun Hyper-V, KVM/libvirt, Xen tabi Proxmox ninu iṣayẹwo yii. Awọn awoṣe Linux/Windows jeneriki le bo awọn metiriki olupin ti o ni atilẹyin nipasẹ awọn aṣoju wọn; gbigba hypervisor kan pato nilo awọn awoṣe ti o yẹ ati awọn agbowọ. Wo [Kọ iwe afọwọkọ gbigba data](/yo/guides/write-a-data-collection-script/).

## Tan aṣoju ni akọkọ

Ṣe atunyẹwo iṣeto aṣoju ti o wa tẹlẹ ki o lo awọn ilana fun ẹya ESXi rẹ. Awọn akọsilẹ package pẹlu atunto ile-iṣẹ kan; kii ṣe ohun pataki ṣaaju ati pe yoo nu iṣeto SNMP ti o wa tẹlẹ rẹ. Fun iṣeto ti o da lori agbegbe, awọn aṣẹ wọnyi ṣeto awọn iye aṣoju; rọpo awọn apẹẹrẹ ki o tọju eyikeyi agbegbe ti o wa tẹlẹ ti o nilo nigbati o ba ṣeto atokọ agbegbe.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Aṣẹ akọkọ ṣe afihan iṣeto; ti o kẹhin jẹ ki aṣoju naa ṣiṣẹ. Aṣayan agbegbe rọpo atokọ ti a tunto rẹ. Ṣayẹwo wiwọle ogiriina ti o nilo lati ọdọ oludibo ki o kan si [itọkasi aṣẹ ESXCLI SNMP](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html). Awọn aṣẹ wọnyi tunto idibo ti o da lori agbegbe; wọn ko tunto SNMPv3. Jẹrisi lati ẹrọ ti oludibo n ṣiṣẹ lori ṣaaju fifi ẹrọ naa kun.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Ti akọkọ ba ṣiṣẹ ati pe ẹkẹta ko da nkankan pada, ṣayẹwo aṣiṣe SNMP, eto imulo wiwọle ati atilẹyin aṣoju; rin ofo nikan ko ṣe idanimọ idi naa. Iwe afọwọkọ alejo ti a ṣajọpọ nlo SNMPv1, nitorinaa iwadii v2c aṣeyọri ko fọwọsi ọna gbigba rẹ. Awọn irin-ajo alejo ti o ṣofo gbe awọn iṣiro odo jade, kii ṣe awọn ela aworan dandan; wo [kokoro abajade ofo](https://github.com/kadupulhq/kadupul/issues/245).

## Kini olupin n ṣafihan

| Agbegbe | Igi kekere | O fun ọ |
|---|---|---|
| Awọn olutọsọna | `.1.3.6.1.2.1.25.3.3.1` | Fifuye fun olutọsọna kọọkan ti aṣoju ṣafihan |
| Awọn paati ohun elo | `.1.3.6.1.2.1.25.3.2.1` | Atọka paati, apejuwe ati ipo |
| Ibi ipamọ | `.1.3.6.1.2.1.25.2.3.1` | Awọn ile-itaja data ati awọn eto faili agbegbe, bi aṣoju ṣe yan lati jabo |
| Awọn atọkun | `.1.3.6.1.2.1.2` ati `.1.3.6.1.2.1.31` | Ijabọ, awọn aṣiṣe, ipo |
| Akojo alejo | `.1.3.6.1.4.1.6876` | Ipo agbara alejo kọọkan ati ipo awọn irinṣẹ alejo |

Mẹrin akọkọ jẹ awọn tabili Host Resources ati atọkun boṣewa, awọn kanna ti olupin Linux kan dahun pẹlu. Wo [Ṣe abojuto olupin Linux kan](/yo/guides/monitor-a-linux-server/) fun bii awọn ṣe huwa ati tabili disiki wo ni lati fẹran.

Ẹkarun jẹ igi kekere ti olutaja ti a lo nipasẹ iwe afọwọkọ kika alejo ti a firanṣẹ.

## Awọn awoṣe aworan

| Aworan | Orisun | Ka |
|---|---|---|
| ESXi - CPU | Ibeere data | Fifuye fun olutọsọna kan ti a rii |
| ESXi - MultiCPU Average | Iwe afọwọkọ | Itumọ ti fifuye gbogbo olutọsọna |
| ESXi - Hardware | Ibeere data | Ipo ti paati kan ti a rii |
| ESXi - VHosts | Iwe afọwọkọ | Awọn iṣiro alejo ati ipo awọn irinṣẹ alejo |
| Host MIB - Processes | OID ti o wa titi | Ka ilana lori olupin |
| Host MIB - Logged in Users | OID ti o wa titi | Ka igba lori olupin |
| Device - Uptime | Iwe afọwọkọ | Akoko iṣẹ bi Kadupul ti gbasilẹ kẹhin |
| Device - Polling Time | Iwe afọwọkọ | Bawo ni Kadupul ṣe gba to lati dibo ẹrọ yii |
| Awọn aworan atọkun | Ibeere data | Ijábọ, awọn aṣiṣe, awọn apo-iwe, ipo fun atọkun kọọkan |

Ibeere olutọsọna n ka fifuye fun titẹsi kọọkan ti a rii. Maṣe ro pe kika ori ila rẹ baamu kika okun ohun elo olupin naa: ilana atọka ti a ṣajọpọ gba awọn atọka oni-nọmba kan tabi meji nikan ti o si kọ 100 tabi ju bẹẹ lọ, paapaa lori olupin ti o ni awọn Sipiyu diẹ. Ṣe afiwe awari pẹlu rin aise; wo [kokoro atọka Sipiyu](https://github.com/kadupulhq/kadupul/issues/246). Iwe afọwọkọ apapọ n rin ni ominira awọn ẹru olutọsọna ati awọn iwọn awọn ori ila ti o pada.

Device - Uptime ati Device - Polling Time ka igbasilẹ ẹrọ ti o fipamọ ti Kadupul. Oluranlọwọ akoko iṣẹ n da akoko iṣẹ SNMP ti o fipamọ pada laisi ifoju akoko ti o kọja; akoko idibo ṣe apejuwe iṣẹ gbigba Kadupul. Iye atijọ ti o fipamọ ko ṣe afihan arọwọto lọwọlọwọ. Ti gbigba ba duro, awọn oluranlọwọ wọnyi ko ṣe agbejade awọn ayẹwo titun.

## Awọn iṣoro kika

Eyi ni apakan ti o jẹ ki foju di iyatọ si olupin ti ara, ati pe ko si ọkan ninu rẹ ti o yanju nipasẹ awoṣe aworan kan.

**Awọn alejo nlọ.** Alejo ti o lọ si olupin miiran yoo parẹ lati inu akojo oja olupin akọkọ ti o han lori ti keji. Awọn ayẹwo akoko ti ominira le ka lẹẹmeji tabi yọ alejo yẹn kuro fun igba diẹ. Awọn iyipada kika nikan ko ṣe afihan iṣiwa: lo awọn idanimọ akojo oja hypervisor ati awọn iṣẹlẹ lati ṣe alaye wọn.

**Awọn orisun ti pin, nitorinaa ipasi alejo kọọkan jẹ iṣiro.** Olupin n ṣe ijabọ fifuye olutọsọna ti ara. Ko ṣe ijabọ alejo wo ni o fa. Pipin Sipiyu olupin nipasẹ kika alejo n ṣe agbejade nọmba kan ti o tọ ni iṣiro ati pe ko dahun ibeere ti ẹnikẹni beere.

**Ifaramo pupọ (Overcommit) jẹ ki ipinfunni ati lilo awọn iwọn oriṣiriṣi.** Awọn Sipiyu foju ti a sọtọ le kọja awọn ohun kohun ti ara, ati iranti ti a sọtọ le kọja iranti ti ara, mọọmọ. Aworan ti awọn orisun ti a sọtọ ṣe apejuwe ipinfunni dipo ibeere ti a wọn. Ṣe afiwe rẹ pẹlu agbara ti ara, awọn opin ti a tunto ati lilo gangan.

**Ifigagbaga ko han ninu awọn tabili wọnyi.** Awọn wiwọn ti o sọ fun ọ pe a n pa alejo mọ ebi, akoko ti o lo nduro fun olutọsọna ti ara ati iranti ti olupin gba pada lati ọdọ rẹ, ko si ninu ohun ti awoṣe yii n gba. Olupin kan ni 60 ogorun Sipiyu pẹlu awọn alejo ti o ni idije pupọ dabi aami nibi si olupin kan ni 60 ogorun Sipiyu pẹlu awọn ti o ni idunnu.

**Awọn wiwọn alejo ati olupin dahun awọn ibeere oriṣiriṣi.** Lilo alejo nikan le ma ṣe alaye awọn idaduro iṣeto olupin. Ṣe ibamu awọn wiwọn alejo/ohun elo pẹlu awọn metiriki ifigagbaga hypervisor dipo ki o gba ipasi lati fifuye olupin.

### Kini lati ṣe dipo

| Ibeere | Nibo ni idahun wa |
|---|---|
| Ṣe olupin ti kun | Fifuye olutọsọna olupin, lati ọdọ olupin |
| Ṣe alejo kan ti kun | Ninu alejo, pẹlu metiriki ifigagbaga ti hypervisor di |
| Awọn alejo melo ni nṣiṣẹ | Akojo oja alejo olupin, gẹgẹbi kika |
| Njẹ ohun-ini naa ti kọja agbara | Kii ṣe lati awọn aworan wọnyi. O nilo data gbigbe ti olupin ko ṣafihan |
| Njẹ alejo kan gbe | Awọn idanimọ akojo oja Hypervisor ati awọn iṣẹlẹ ijira; awọn igbesẹ kika nikan ko to |

Ṣe abojuto awọn alejo bi awọn ẹrọ tiwọn fun ohunkohun nipa alejo, ki o ṣe abojuto olupin fun ohunkohun nipa olupin naa. Koju kikọ awọn aworan fun alejo kọọkan lati awọn nọmba ipele olupin: wọn wa lati, wọn dabi aṣẹ, ati pe wọn jẹ aṣiṣe ni awọn ọna ti ko si ẹnikan ti o le rii nigbamii.

## Awọn pakute ninu kika alejo ti a firanṣẹ

Iwe afọwọkọ akojo oja alejo jẹ tọ lati ni oye ṣaaju ki o to gbekele iṣelọpọ rẹ.

**O rin pẹlu SNMP version 1 ati okun agbegbe nikan.** Ẹya naa wa ni titiipa ninu iwe afọwọkọ ati awọn iwe-ẹri v3 lori ẹrọ ko kọja. Ẹrọ ti a tunto fun v3 le gba nipasẹ awọn ọna miiran lakoko ti ikojọpọ alejo kuna. Gbigba alejo le tun ṣaṣeyọri ti aṣoju yẹn ba gba agbegbe ti o fipamọ ni ominira lori v1; yiyan v3 lori ẹrọ naa ko ṣe ipinnu abajade funrararẹ. Awọn irin-ajo alejo ti o ṣofo ni a da pada bi awọn odo. Ṣayẹwo aiṣedeede ilana yii laisi idinku eto imulo aabo ti aṣoju kan lati gba oluranlọwọ naa.

**Kika naa wa lati tabili ipo agbara.** Nọmba ti a royin bi apapọ alejo jẹ nọmba awọn titẹ sii ti o pada nipasẹ rin ti igi kekere ti ipo agbara, kii ṣe ti ohun elo akojo oja lọtọ. Alejo ti olupin ṣe atokọ ṣugbọn ti ko ni titẹsi ipo agbara ko ka.

**Igbara-lori ni ibamu lori ọrọ ipo.** Lẹhin gige ati sisọ di kekere, `powered on` ati `poweredon` nikan pọ si kika ti nṣiṣẹ. Awọn ifihan miiran ko ṣe bẹ; ṣe afiwe idahun aṣoju aise ṣaaju itumọ odo kan.

**Isọri awọn irinṣẹ alejo ni abawọn ti a fọwọsi.** Ọrọ gangan `not installed` ni a ka bi nṣiṣẹ nitori pe ibaamu rẹ bẹrẹ ni aiṣedeede odo. Ọrọ ti a ko mọ tun ṣubu nipasẹ si nṣiṣẹ. Maṣe ṣe itọju kika yẹn gẹgẹbi ẹri ti awọn irinṣẹ ilera; wo [kokoro ipo awọn irinṣẹ](https://github.com/kadupulhq/kadupul/issues/244).

**O n rin ni igba mẹta fun ipe kan.** O ka tabili ipo-agbara lẹẹmeji, lẹhinna tabili awọn irinṣẹ, nitorinaa paapaa awọn iṣiro tirẹ kii ṣe aworan akojo oja atomiki. Lori olupin ti o ni ọpọlọpọ awọn alejo, wọn iye owo gbigba yẹn. Ti oludibo ba nira, eyi jẹ oludije fun aarin to gun ṣaaju ki o to jẹ oludije fun awọn okun diẹ sii. Wo [Wiwọn oludibo](/yo/guides/scale-the-poller/).

Iwe afọwọkọ naa n gbejade gbogbo awọn iye ti a darukọ marun, pẹlu awọn odo fun awọn irin-ajo ofo. Rin ti o kuna le nitorinaa mu apẹẹrẹ pipe ṣugbọn ti o ṣina. Fun iṣelọpọ ti ko pe, ero isise iṣelọpọ PHP n ṣayẹwo awọn aaye ti o nilo nipasẹ orisun data ti o somọ ati idaduro awọn ẹgbẹ aami akoko ti ko pe; ko ṣe dandan sọ wọn nù lẹsẹkẹsẹ. Wo [Kaṣe oludibo](/yo/concepts/the-poller-cache/).

## Awọn pakute ninu iyoku

**Apapọ olutọsọna n tọju aiṣedeede.** Olupin ti o ni mojuto kan ti a fi pa mọ ati 63 laišišẹ apapọ rẹ lọ silẹ. Tọju awọn aworan olutọsọna kọọkan ti a fọwọsi nibiti o ṣe pataki. Oluranlọwọ apapọ tun da `load:0` pada fun rin ofo, ti ko ṣe iyatọ si Sipiyu laiṣiṣẹ ti a wọn; ṣe ibamu pẹlu ipo gbigba ati kokoro abajade ofo ti a mọ.

**Awọn atọka olutọsọna jẹ ipo.** Wọn ṣe awari nipasẹ ririn tabili olutọsọna. Ti awọn atọka aṣoju ba yipada, jẹrisi awọn maapu idanimọ ṣaaju gbigbekele ilọsiwaju. Ihamọ oni-nọmba kan/meji ti a ṣajọpọ jẹ abawọn awari lọtọ.

**Awọn titẹ sii ibi ipamọ jẹ ohunkohun ti aṣoju n pe ni ibi ipamọ.** Reti awọn ile-itaja data ti o dapọ pẹlu awọn ohun ti o ko fẹ, ni awọn ipin ipin ti o nilo isodipupo. Eyi jẹ ihuwasi Host Resources, kii ṣe iwa ESXi. Jẹrisi awọn ẹya ipin ti a fipamọ ṣaaju itumọ awọn baiti; iwe afọwọkọ ti o pin ni [abawọn iyipada ti a mọ](https://github.com/kadupulhq/kadupul/issues/243) fun awọn ayẹwo odi ti ko wulo tabi awọn isodipupo ti o padanu.

**Awọn orukọ atọkun lori hypervisor jẹ iduroṣinṣin titi ti wọn kii yoo fi jẹ.** Imudojuiwọn awakọ tabi atunto le tun wọn ṣe nọmba. Wo [Bojuto iyipada kan](/yo/guides/monitor-a-switch/) fun bi a ṣe yan atọka ati idi ti o fi ṣe pataki.

**Awọn iwe afọwọkọ nṣiṣẹ lori olupin oludibo.** Wọn de hypervisor funrara wọn, ni lilo ID ẹrọ ti a kọja nipasẹ aṣẹ ti a fipamọ. Oluranlọwọ apapọ alejo ati Sipiyu gba ila ẹrọ lọwọlọwọ lori ipe kọọkan; iyipada agbegbe ko nilo atunkọ awọn ariyanjiyan aṣẹ wọnyẹn. Awọn agbowọ miiran le fi awọn iwe-ẹri sii ninu awọn ohun iṣẹ wọn. Wo [Kaṣe oludibo](/yo/concepts/the-poller-cache/).

## Awọn ipo ikuna

| Aami aisan | Idi deede |
|---|---|
| Ohun gbogbo n gba ayafi awọn iṣiro alejo | Ẹrọ naa ti wa ni tunto fun SNMP v3 ati iwe afọwọkọ alejo n sọrọ v1 |
| Kika alejo jẹ deede, kika agbara-lori jẹ odo | Ṣayẹwo ọrọ ipo agbara gangan ati boya rin keji ti ṣaṣeyọri |
| Kika alejo lọ silẹ si odo ti o si bọsipọ | Ṣayẹwo awọn irin-ajo ti o kuna/ofo; oluranlọwọ le gbejade laini pipe ti awọn odo |
| Awọn aworan olutọsọna han ati lẹhinna duro lẹhin iyipada ohun elo | Ṣayẹwo awọn atọka ti o yipada ati ihamọ ti a ṣajọpọ si nọmba kan tabi meji |
| Sipiyu olupin jẹ alapin ati kekere lakoko ti awọn alejo lọra | Ṣayẹwo awọn ikuna gbigba bi daradara bi ifigagbaga; rin apapọ ti o ṣofo ni a royin bi odo |
| Awọn aworan ibi ipamọ data pẹlu awọn ipin ti o ko beere fun | Aṣoju n ṣe ijabọ wọn bi ibi ipamọ |
| Aworan akoko iṣẹ dabi ẹni ti ko tọ lẹhin ijade oludibo | O ṣe ijabọ iye ti o gbasilẹ kẹhin ti Kadupul, kii ṣe kika laaye |
| Apapọ awọn alejo kọja awọn olupin fo lakoko itọju | Awọn alejo ti n ṣikiri ni a ka lẹẹmeji ni ṣoki, tabi rara |
