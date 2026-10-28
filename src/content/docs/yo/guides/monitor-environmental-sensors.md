---
title: Mimojuto awọn sensọ ayika
description: Ya aworan iwọn otutu, ọriniinitutu, ṣiṣan afẹfẹ, agbara ati ipo UPS lori SNMP, wa awọn OID ti o tọ lori MIB ataja kan, ki o fun awọn eto aworan kika ti o baamu wiwọn dipo counter.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 23
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira to daju. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Iwọn otutu, ọriniinitutu ati agbara lẹsẹkẹsẹ jẹ awọn wiwọn, ti a fipamọ nigbagbogbo bi `GAUGE`. Agbara akopọ tabi awọn apapọ iṣẹlẹ le nilo iru counter dipo. Ṣayẹwo awọn iwọn ohun kọọkan, idanimọ ati awọn atumọ ṣaaju yiyan awoṣe kan.

Ṣayẹwo ohun ti a ti firanṣẹ tẹlẹ ṣaaju ki o to kọ ohunkohun.

## Ohun ti o ba pẹlu

Awọn itumọ ibeere data mẹrin nikan ni o wa ninu itọsọna ibeere igi funrararẹ, ati pe ko si ọkan ninu wọn ti o jẹ ti ayika.

| Ibeere SNMP ti a firanṣẹ | Bo |
|---|---|
| `interface.xml` | Awọn atọkun nẹtiwọọki |
| `host_disk.xml` | Ibi ipamọ Host Resources |
| `net-snmp_disk.xml` | UCD kede awọn ipin |
| `net-snmp_devio.xml` | UCD dènà ẹrọ I/O |

Ideri sensọ wa ni awọn ọna meji miiran.

**Awọn ibeere olupin-iwe afọwọkọ, ti a ṣajọpọ ninu package ẹrọ Net-SNMP.** Gbe wọle `install/templates/NetSNMP_Device.xml.gz` lati mu awọn faili XML ibeere lmSensors mẹta rẹ labẹ `resource/script_server/`. Oluranlọwọ `scripts/ss_netsnmp_lmsensors.php` wa ninu ibi isanwo orisun pẹlu.

| Ibeere | Tabili |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

Oluranlọwọ nlo atọka, orukọ ati awọn ọwọn kika. Awọn ibeere n ṣatunṣe lori nọmba `sensorDevice`; `sensorName` n pese orukọ ifihan ti oluranlọwọ ge si awọn ohun kikọ 18. Awọn orukọ ko ni idaniloju awọn idanimọ sensọ alailẹgbẹ.

Ọna deede `get sensorReading` da awọn iye aise pada: millidegrees fun ohun iwọn otutu ti ogún, millivolts fun foliteji, ati RPM fun awọn fannu. Aworan igbona kan CDEF ti `Divide by 1000`. Aworan foliteji ko ni CDEF laibikita aami Volts rẹ, [kokoro igbelosoke ti a fọwọsi](https://github.com/kadupulhq/kadupul/issues/247).

Ọna `query sensorReading` ti o yatọ n ṣe iwọn otutu ati foliteji, o si gbiyanju iyipada foliteji ti o fowo si nipa lilo igbagbogbo ti ko tọ 4294967294. O tun le [ju imukuro lori awọn kika ti ko si](https://github.com/kadupulhq/kadupul/issues/248). Maṣe ṣe afihan awọn iwọn ti a fipamọ lati inu iṣelọpọ awari yii.

Oluranlọwọ tun nlo ọwọn iwọn otutu ti ogún `.2.1.3`. Lọwọlọwọ soke [LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt) kọ ohun ti ko fowo si yẹn silẹ ni ojurere ti ọwọn ti o fowo si `.2.1.4`; jẹrisi atilẹyin ati ihuwasi iwọn otutu odi lori aṣoju gangan ṣaaju ki o to ba awoṣe kan mu.

**Awọn idii ẹrọ, ti a firanṣẹ bi awọn ile-ipamọ ti o le gbe wọle.** Pupọ n gbe XML ibeere tiwọn ati kọ ọ sinu awọn ilana ibeere ni akoko gbigbe wọle. Awọn ti o ṣe pataki nibi:

| Package | N mu |
|---|---|
| SNMP UPS | Awọn ibeere laini titẹ sii ati iṣelọpọ UPS-MIB, pẹlu awọn awoṣe OID ti o wa titi fun batiri, akoko iṣẹ, iwọn otutu ati awọn itaniji |
| AKCP Device | Awọn ibeere iwe afọwọkọ fun iwọn otutu, ọriniinitutu, ṣiṣan afẹfẹ ati awọn sensọ 4-20 mA |
| APC InfraStruXure PDU | Awọn ibeere fun fifọ ati awọn iṣiro ipele |
| APC InfraStruXure InRow CRAC | Awọn ibeere fun ẹyọkan ati awọn iṣiro ẹgbẹ, pẹlu awọn iwọn otutu, ọriniinitutu, ṣiṣan afẹfẹ ati iyara fannu |
| BayTech PDU | Ibeere iṣan-iṣẹ ati ibeere Circuit oni-mẹta, pẹlu lọwọlọwọ, foliteji, agbara ati iwọn otutu |

Ṣayẹwo package ti o baamu ṣaaju kikọ ibeere kan pẹlu ọwọ. Tẹle [Gbe wọle ati gbejade awọn awoṣe](/yo/guides/import-and-export-templates/), jẹrisi imuṣiṣẹ faili ati iwari, lẹhinna ṣẹda awọn aworan ti o fẹ ni gbangba. Wiwa package ko ṣe afihan ibamu ẹrọ tabi igbelosoke to tọ; awọn abawọn UPS ati lmSensors ni isalẹ nilo akiyesi.

## Awọn apẹrẹ meji ti sensọ kan gba

Fun gbigba SNMP, ṣe iyatọ awọn ohun scalar lati awọn iṣẹlẹ tabili ti a ṣe atọka.

**OID ti o wa titi.** Iye scalar kan ni adirẹsi kan, adirẹsi kanna lori gbogbo ẹrọ ti iru yẹn. Iwọn otutu batiri. Lapapọ agbara iṣelọpọ. Lo orisun data OID ti o wa titi: SNMP get lodi si OID gangan, ati orisun data kan fun kika.

**Tabili kan.** Nọmba aimọ ti awọn kika ti a ṣe awari fun ẹrọ kan. Awọn iwadii agbeko, awọn ila iṣan, awọn wiwọn ipele kọọkan. Lo ibeere data kan, eyiti o rin tabili naa, kọ ẹkọ atọka, ti o jẹ ki o yan awọn ori ila ti o di awọn aworan.

Apo UPS ti a firanṣẹ nlo awọn mejeeji. Tẹle eto ohun ti MIB: ẹrọ kan ti o ni iwadii lọwọlọwọ kan le tun ṣafihan rẹ bi ila tabili ti a ṣe atọka.

| Kika UPS | Apẹrẹ | OID |
|---|---|---|
| Iwọn otutu batiri | Ti o wa titi | `.1.3.6.1.2.1.33.1.2.7.0` |
| Ifoju akoko ti o ku | Ti o wa titi | `.1.3.6.1.2.1.33.1.2.3.0` |
| Akoko lori batiri | Ti o wa titi | `.1.3.6.1.2.1.33.1.2.2.0` |
| Foliteji batiri | Ti o wa titi | `.1.3.6.1.2.1.33.1.2.5.0` |
| Awọn itaniji wa | Ti o wa titi | `.1.3.6.1.2.1.33.1.6.1.0` |
| Iwọn titẹ sii, lọwọlọwọ, agbara, igbohunsafẹfẹ | Ibeere | `.1.3.6.1.2.1.33.1.3.3.1` |
| Foliteji iṣelọpọ, lọwọlọwọ, agbara, fifuye | Ibeere | `.1.3.6.1.2.1.33.1.4.4.1` |

Olukuluku awọn orisun data wọnyẹn jẹ `GAUGE`. Ko si ọkan ti o jẹ counter. Iwe ipamọ awoṣe ti a firanṣẹ n kede igbesẹ iṣẹju-aaya 60 ati lilu ọkan ti iṣẹju-aaya 600, o kere ju ti odo, ati pe ko si o pọju, ayafi iwọn otutu, eyiti ko ni o kere ju. Ṣayẹwo profaili ti a gbe wọle ati iṣeto RRD gangan; awọn ikede wọnyi ko fi idi idibo ti n ṣiṣẹ mulẹ. Kika odi to wulo tun nilo ipo aworan ti o nfihan.

## Wa awọn OID

Rin ẹrọ naa ṣaaju ki o to kọ ohunkohun. O n wa awọn nkan mẹta: tabili ti awọn kika, tabili ti o jọra ti awọn akole, ati eyikeyi isodipupo ti olutaja yan, pẹlu awọn nkan iwulo/ipo nibiti o wa.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Rọpo olupin apẹẹrẹ ati agbegbe pẹlu awọn iye ti a tunto ki o ṣiṣẹ awọn iwadii lati ọdọ oludibo. Gbe MIB ti o baamu ati awọn igbẹkẹle lati ṣayẹwo awọn orukọ, awọn iwọn ati awọn itumọ; iwe ohun ataja tun le ṣe alaye awọn OID nọmba. Ilẹ-ilẹ ti o wa nitosi tabi koodu ipo kii ṣe paarọ pẹlu wiwọn kan.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

Itumọ MIB jẹ ibiti a ti ṣe akọsilẹ igbelosoke. Olutaja ti o jabo idamẹwa ti iwọn kan yoo sọ bẹ ninu apejuwe nkan tabi gbolohun awọn sipo, ati ninu awọn iwe aṣẹ olutaja ti o somọ. Amoro lati kika kan le yi iwọn 23.5 pada si aworan ti 235.

Awọn MIB boṣewa bo diẹ sii ju ti eniyan nireti lọ. UPS-MIB ni `.1.3.6.1.2.1.33` jẹ jeneriki kọja awọn olutaja. ENTITY-SENSOR-MIB n funni ni iye sensọ pẹlu iwọn tirẹ ati awọn aaye to peye lẹgbẹẹ rẹ. Ṣayẹwo fun awọn ti o ṣaaju ki o to de ọdọ igi kekere ti ile-iṣẹ kan.

Ṣe afiwe awari kọja awọn atunbere aṣoju ati awọn iyipada iwadii ni fifi sori idanwo kan. Awọn irin-ajo meji ti ko yipada nikan ko ṣe afihan iduroṣinṣin atọka. Ṣe igbasilẹ awọn idanimọ sensọ iduroṣinṣin nibiti o wa ṣaaju ṣiṣẹda awọn aworan gigun.

## Kọ orisun data OID ti o wa titi

Sensọ OID ti o wa titi nilo awoṣe data nipa lilo titẹ sii data SNMP get, pẹlu OID bi iye gangan ati ohun orisun data kan ninu rẹ. Ṣeto iru si `GAUGE`, fun o kere julọ ni iye gidi nikan nigbati sensọ ko le lọ ni isalẹ rẹ nitootọ, ki o fi o pọju silẹ laisi asọye ayafi ti ataja ba ṣe akọsilẹ orule kan.

Awọn iye ti o wa ni ita awọn aala orisun data RRD di aimọ. Ṣeto awọn aala yẹn ni awọn ẹya aise ti o fipamọ, kii ṣe awọn ẹya iyipada ti aworan; bibẹẹkọ awọn kika ti o wulo le sọnu ṣaaju lilo CDEF ifihan kan.

## Kọ ibeere data kan

Ibeere kan nilo OID atọka kan, ọna kan lati yi OID kọọkan ti a rin sinu atọka kan, ati aaye kan fun ọwọn kọọkan ti o fẹ.

Ibeere iṣelọpọ UPS jẹ apẹẹrẹ iṣẹ kukuru kan. O ṣe atọka lori tabili laini, ṣe itupalẹ atọka kuro ni ipari OID kọọkan ti o pada pẹlu ikosile deede, o si kede aaye titẹ sii kan fun atọka ati awọn aaye iṣelọpọ mẹrin fun foliteji, lọwọlọwọ, agbara ati fifuye. Awọn itumọ abajade pẹlu ọna, orisun, itọsọna ati OID iwe. OID iwe le jẹ gbongbo atọka-rin ti o wulo; ibaramu parser ibeere ati awọn OID ti o pada gangan ni ohun ti o ṣe pataki. Wo [Awọn ibeere data ati awọn atọka](/yo/concepts/data-queries-and-indexes/) fun bi a ṣe yan atọka ti a si fipamọ.

Yan ọna atunṣe atọka mọọmọ. Awọn yiyan jẹ kò si, lori akoko iṣẹ ti n lọ sẹhin, lori kika atọka ti n yipada, ati Daju Gbogbo Awọn aaye. Awọn tabili sensọ jẹ ọran nibiti awọn ọna alailagbara kuna: yọọ iwadii kan lati ẹyọ agbeko kan ki o pulọọgi sinu omiiran, ati pe kika le ma yipada lakoko ti gbogbo kika lẹhin atọka bayi jẹ ti sensọ ti o yatọ. Ijẹrisi pipe jẹ iṣẹ SNMP lori iyipo kọọkan. Daju iru awọn aaye idanimọ ti ibeere le ṣayẹwo: awọn atọka nọmba ti ko yipada tabi awọn aami pidánpidán/ti a ge ko le fihan pe iwadii ti ara jẹ kanna. Sọtun awari ati atunyẹwo awọn ẹgbẹ aworan lẹhin rirọpo.

## Ṣe iwọn iye naa

Pinnu ibiti iyipada naa ti waye, ki o si fi si ibi kan nikan.

| Nibo | Nigbawo lati lo |
|---|---|
| Ninu iwe afọwọkọ gbigba | Lo adehun agbowọ ti o ni akọsilẹ; lmSensors get lọwọlọwọ n da awọn ẹya aise pada |
| Ninu CDEF kan lori ohun elo aworan | Iye aise jẹ tọ lati fipamọ, ati ẹyọ ifihan jẹ yiyan igbejade |

A CDEF jẹ idahun deede fun olutaja multiplier. Awọn idii ti a firanṣẹ gbe awọn itumọ bii `Divide By 10`, ti a kọ lati orisun data lọwọlọwọ, `10`, ati pipin. Waye wọn nikan si awọn nkan ti o ni ẹyọ aise ti o baamu.

Apo UPS ni [awọn CDEF ti ko tọ ti agbara ati akoko](https://github.com/kadupulhq/kadupul/issues/249): jara On Battery rẹ pin awọn aaya nipasẹ 6000 dipo 60, ati titẹ sii/iṣelọpọ jara Watts pin awọn wattis nipasẹ 10. Fun aṣoju ti o baamu, awọn aaya 600 yẹ ki o han bi iṣẹju 10 ati awọn wattis 1000 bi awọn wattis 1000. Foliteji batiri ati laini lọwọlọwọ nilo pipin nipasẹ 10; ifoju akoko ti o ku ti jẹ iṣẹju tẹlẹ. Wo [Awọn iwọn ohun elo UPS ti RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Fipamọ kika aise ati pipin lori aworan jẹ ki faili RRD jẹ oloootitọ ati jẹ ki o ṣe atunṣe isodipupo ifihan laisi atunkọ itan aise, ti a pese pe awọn ayẹwo ye awọn aala orisun data ati idaduro. Iyipada ẹgbẹ-odè yipada ẹyọ ti o fipamọ ati pe o le sọ pipe di asan; ṣe akọsilẹ rẹ. Awọn kika aise ti ko ṣe alaye ko yẹ ki o gbekalẹ bi ẹyọ imọ-ẹrọ ti a fọwọsi.

Maṣe lo iyipada lẹẹmeji. A CDEF lori aworan kan ti iwe afọwọkọ rẹ ti ṣe iwọn iye tẹlẹ le ṣe agbejade kika ti o ṣeeṣe ṣugbọn ti ko tọ.

## Fun ni awọn eto aworan ti o baamu wiwọn kan

Yan awọn eto fun wiwọn dipo didakọ awọn aiyipada ijabọ ni afọju.

| Eto | Ijábọ | Sensọ |
|---|---|---|
| Iru orisun data | `COUNTER` | `GAUGE` |
| Ipilẹ iye | 1000, nitorinaa axis n ka ni k ati M | Ṣi 1000, ṣugbọn prefix ko ni itumọ lori awọn iwọn |
| Aifọwọyi | Fẹ, nitori ibiti a ko mọ | Nigbagbogbo a ko fẹ, nitori pe a mọ ibiti o wa |
| Iwọn oke ati isalẹ | Gbẹkẹle ipo iwọn aifọwọyi | Yan sakani ti o han ti o wulo |

Ṣeto opin ti o ga julọ ati ti o kere julọ ati aami inaro ti o sọ orukọ gidi kuro. Aworan iwọn otutu UPS ti a firanṣẹ ṣe eyi: opin isalẹ ti 0, opin oke ti 100, ati `C` gẹgẹbi aami inaro.

Aṣayan iwọn aifọwọyi jẹ eto awọn yiyan, kii ṣe iyipada. Ọkan ti aworan iwọn otutu ti a firanṣẹ nlo kọja opin isalẹ pẹlu `--alt-autoscale-max`; ko kọja opin oke ti o fipamọ ti 100. Laisi awọn aala lile, kika ti ko ni iwọn le faagun opin ti o kọja. Iwọn ti a tunto ko ni pinpin laifọwọyi. Yan iyatọ ti o tọju aala ti o nifẹ si:

| Aṣayan | Ipa |
|---|---|
| Aifọwọyi aibikita awọn opin | Awọn opin mejeeji leefofo. Lo nigbati o ko ba ni imọran ti sakani |
| Aifọwọyi gbigba opin isalẹ | Kọja opin isalẹ; o pọju tẹle data |
| Aifọwọyi gbigba opin oke | Kọja opin oke; o kere tẹle data |
| Aifọwọyi pẹlu awọn opin mejeeji | Kọja awọn opin mejeeji; imugboroja tun da lori ipo lile |

Aṣayan awọn aala lile tun wa ti o da axis duro lati faagun nigbati iye kan ba ṣubu ni ita awọn opin ti o ṣeto. Tan-an nigbati axis ti o wa titi ba ṣe pataki ju ri irin-ajo lọ, ki o fi silẹ ni pipa nigbati ko ba jẹ bẹ, nitori aworan lile le ge irin-ajo kan ni ita sakani ti o han. Eyi ko pa ayẹwo ti o fipamọ rẹ. Wo [Itọkasi awọn opin aworan RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Fun awọn iwọn tabi ogorun nibiti awọn prefixes SI yoo da awọn oluka lẹnu, ronu olufihan awọn ẹya ti 0. Base 1000 n ṣakoso awọn igbesẹ prefix; ko mu awọn prefixes ṣiṣẹ funrararẹ tabi yi awọn ẹya wiwọn pada.

### Isopọpọ ṣe pataki nibi ju lori ijabọ lọ

Atọka atọkun kan ti a ṣe iwọn lori wakati kan tun sọ fun ọ ni aijọju ohun ti o ṣẹlẹ. Iwọn otutu ti o pọ si lori wakati kan tọju irin-ajo iṣẹju mẹwa ti o ṣe pataki. Rii daju pe profaili ibi ipamọ lẹhin awọn orisun data wọnyi tọju iwe ipamọ `MAX` kan, ki o si tunto jara ti a gbero lati ka isọdọkan `MAX` ti o yẹ. Iwọn itan lori jara `AVERAGE` ko gba tente oke atilẹba pada.

Paapaa iwe ipamọ MAX nikan tọju awọn oke ti o jẹ aṣoju ninu awọn ayẹwo ti a gba; ko le gba irin-ajo pada laarin awọn ibo tabi awọn iye ti a kọ silẹ ṣaaju ibi ipamọ. Wo [Ṣakoso idaduro data](/yo/guides/manage-data-retention/) ati [Awọn orisun data ati awọn iwe ipamọ](/yo/concepts/data-sources-and-rras/).

## Nigbati ko ba si MIB ti o tọ lati lo

Ọpọlọpọ awọn ohun elo ayika n sọ Modbus, ilana خ ni tẹlentẹle, tabi HTTP API, ati pe aṣoju SNMP rẹ ko ṣafihan ohunkohun ti o wulo. Awọn ti o nilo titẹ sii data iwe afọwọkọ. Iwe afọwọkọ nṣiṣẹ lori olupin oludibo, kii ṣe lori ẹrọ naa, ati de ọdọ ẹrọ jẹ iṣoro iwe afọwọkọ naa. Wo [Kọ iwe afọwọkọ gbigba data](/yo/guides/write-a-data-collection-script/) fun adehun iṣelọpọ.

Da `U` pada dipo `0` nigbati sensọ ko ba le de ọdọ. Iwadii ti o lọ offline kii ṣe iwadii ti n ka awọn iwọn odo.

## Awọn ipo ikuna

| Aami aisan | Idi deede |
|---|---|
| Iwọn otutu ti ya aworan bi nọmba mẹwa tabi ọgọrun igba ti o tobi ju | Isodipupo ataja ko pin jade |
| Iwọn otutu ti ya aworan ni igba mẹwa kere ju | Pin lẹẹmeji, lẹẹkan ninu iwe afọwọkọ ati lẹẹkan ninu CDEF |
| Oju-irin foliteji kan n ka bi awọn ọkẹ àìmọye | Nọmba odidi SNMP ti a ko fowo si ti o ni iye odi, ti a ko ṣe atunṣe |
| Awọn aworan sensọ lọ alapin lẹhin ti a paarọ iwadii kan | Tabili naa tun ṣe atọka ati pe orisun data ni bayi tọka si sensọ ti o yatọ |
| Awọn kika loke ẹnu-ọna han bi awọn ela | A ti ṣeto o pọju lori orisun data ati awọn iye gidi ti kọja rẹ |
| Axis ti a samisi ni k tabi M lori kika iwọn | Ipilẹ iye ati awọn eto ẹyọkan ti a jogun lati awoṣe ijabọ |
| Irin-ajo kan ko han loju wiwo ọsẹ | Ṣayẹwo isọdọkan ti o yan, ipinnu ti a da duro, aarin ibo ati awọn ayẹwo ti a kọ |
| Ibeere kan ko da awọn atọka pada | Ṣayẹwo awọn OID ti o pada, awọn ere-kere parser, awọn ihamọ wiwọle ati atilẹyin ohun; gbongbo ọwọn le wulo |
| Awọn ibeere lmSensors ko ri nkankan lori olupin Linux | Ṣayẹwo atilẹyin aṣoju, wiwọle, awọn ori ila sensọ ti o han ati awọn aṣiṣe SNMP gangan |
