---
title: Ṣawari awọn ẹrọ laifọwọyi
description: Ṣe ayẹwo ibiti nẹtiwọọki kan, ba awọn ẹrọ ti o rii mu pẹlu awoṣe kan, ki o jẹ ki awọn ofin kọ awọn aworan ati awọn ẹka igi, pẹlu iṣẹda ẹrọ ni alaabo fun igbesẹ iwari akọkọ.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe afọwọkọ ti o nduro fun atunyẹwo nipasẹ agbọrọsọ ti o sọ daradara.
sidebar:
  order: 15
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira to daju. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Adaṣiṣẹ jẹ awọn ẹrọ ọtọtọ meji ti o rọrun lati daamu. Awari (Discovery) n rin ibiti awọn adirẹsi wa ti o si pinnu kini ẹrọ kan jẹ. Awọn ofin (Rules) pinnu ohun ti a kọ fun ẹrọ kan ni kete ti o ba wa. O le ṣiṣe boya laisi ekeji, ati pupọ julọ ibajẹ ti eniyan n ṣe pẹlu adaṣiṣẹ wa lati yi awọn mejeeji tan ni ẹẹkan ati wiwa awọn abajade lẹhinna.

## Ṣalaye ibiti o wa

Ibiti nẹtiwọọki jẹ atokọ ti a ya sọtọ pẹlu aami idaduro. Titẹsi kọọkan jẹ ọkan ninu awọn fọọmu mẹta.

| Fọọmu | Apeere | Awọn akọsilẹ |
|---|---|---|
| CIDR | `192.168.1.0/24` | O tun gba iboju-boju ti o ni aami, `192.168.1.0/255.255.255.0` |
| Kaadi egan | `192.168.*.*` | Ti yipada ni inu si CIDR deede |
| Adirẹsi kan ṣoṣo | `192.168.1.10` | Ṣe ayẹwo adirẹsi gangan yẹn nikan |

Awọn sakani ibẹrẹ-si-opin ti a kọ bi `192.168.1.10-192.168.1.50` ni a kọ pẹlu aṣiṣe kan. Wọn ko ni atilẹyin.

Lo awọn sakani ti kii ṣe agbekọja, pẹlu kọja awọn nẹtiwọọki ti o le ṣiṣẹ ni nigbakannaa. Tabili iṣẹ naa ni bọtini alailẹgbẹ agbaye lori adirẹsi IP; ẹda-ẹda le kọ gbogbo ipele ifibọ, nlọ awọn adirẹsi miiran ninu ipele yẹn. Wo [ọrọ #207](https://github.com/kadupulhq/kadupul/issues/207).

Ohun gbogbo jẹ IPv4. Iṣiro ibiti o wa nlo iyipada odidi 32-bit jakejado, nitorinaa ko si ọna IPv6 nibi.

Awọn adirẹsi nẹtiwọọki ati igbohunsafefe ni a yọkuro. A `/24` ṣe ayẹwo awọn adirẹsi 254, lati `.1` si `.254`. Titẹsi adirẹsi kan ṣoṣo ṣe ayẹwo ọkan. Awọn adirẹsi ti octet ikẹhin wọn jẹ 255 ni a fo lakoko ọlọjẹ naa pẹlu.

Ṣaaju ki ọlọjẹ to bẹrẹ, gbogbo adirẹsi ti o wa ninu sakani ni a kọ sinu tabili iṣẹ kan, ọna kan fun adirẹsi kọọkan, ati awọn okun (threads) beere awọn ori ila lati inu rẹ. A `/16` kọ awọn ori ila 65534 ṣaaju ping akọkọ. Iyẹn jẹ idiyele gidi, ati pe idi niyi ti ọlọjẹ ti sakani nla ti o tuka fi lọra paapaa nigbati ko si ohun ti o dahun.

So eto awọn aṣayan SNMP pọ si sakani kọọkan. Ipo Titunto (Master mode) wọle aṣiṣe kan ati foju ibiti o ti jẹ pe ID ti a ṣeto SNMP jẹ odo. Ṣiṣe ti a fojusi ko lo aabo kanna; bẹrẹ rẹ taara ko ṣe awọn aṣayan SNMP ti o padanu ni lilo.

## Ṣe iwọn ọlọjẹ naa

| Eto | Ohun ti o n ṣe | Aiyipada |
|---|---|---|
| Awọn okun Awari | Awọn oṣiṣẹ afiwe ti n beere awọn adirẹsi | 1 |
| Iwọn Ṣiṣe | A fopin si iwari lẹhin eyi to gun | Iṣẹju 20 |
| Iru Eto | Afọwọṣe, lojoojumọ, osẹ-sẹsẹ, oṣooṣu, tabi oṣooṣu ni ọjọ kan | Afọwọṣe |
| Ọna Ping | ICMP, TCP, TCP closed, UDP, tabi SNMP | Lati eto agbaye |
| Awọn igbiyanju Ping, Akoko ipari | Iye owo ikuna adirẹsi kọọkan | Lati awọn eto agbaye |

Awọn okun ati opin ṣiṣe n ṣe ajọṣepọ buburu ti o ko ba ronu nipa wọn. Awọn okun aadọta lodi si `/16` jẹ ọlọjẹ ibudo (port scan) niwọn bi eyikeyi eto wiwa ifọle ṣe kan. Okun kan lodi si sakani kanna yoo de opin ṣiṣe ati pe yoo pa ni agbedemeji, nlọ abajade apa kan ti o dabi ọkan pipe.

Ṣe iwọn ibiti o wa ki ọlọjẹ kan pari ninu opin ni nọmba okun ti nẹtiwọọki rẹ le fi aaye gba. Awọn sakani kekere pupọ lu ọkan nla, nitori ọkọọkan gba iṣeto ti ara rẹ ati opin tirẹ.

## Kini ọlọjẹ n ṣe fun adirẹsi kọọkan

1. Yanju orukọ kan. Awọn olupin DNS miiran le ni a fun ni bi atokọ ti o pin pẹlu aaye; ti ko ba si ti a ṣeto, a lo oluṣatunṣe ti oludibo tirẹ. Wiwa NetBIOS jẹ ifẹhinti aṣayan nigbati DNS ko da nkankan pada.
2. Ṣayẹwo boya adirẹsi tabi orukọ yẹn ti jẹ ẹrọ tẹlẹ. Ti o ba jẹ bẹ, adirẹsi naa ti samisi bi o ti ṣe. Eyi n tẹ ẹrọ ti o wa tẹlẹ ti a rii nipasẹ awọn iye wọnyẹn mọlẹ; kii ṣe iṣeduro lodi si iṣẹda nigbakannaa tabi awọn orukọ miiran ti o yatọ.
3. Ping, ni lilo ọna ti a tunto. Ọna SNMP n kọja ping lọtọ.
4. Ti ping ba dahun, tabi ti yan ọna SNMP, gbiyanju SNMP ki o gba `sysDescr`, `sysObjectID`, `sysName`, `sysLocation`, `sysContact` ati akoko iṣẹ (uptime).
5. Baramu data eto ti a gba lodi si awọn ofin ẹrọ.

Adirẹsi ti o pingi ṣugbọn ti ko dahun SNMP ni a gbasilẹ bi a ti rii ati laaye. Adirẹsi ti o dahun SNMP ṣugbọn ko baamu ofin ẹrọ kankan ni a gbasilẹ bi a ti rii, pẹlu data eto rẹ, ati pe ko si ohun ti a ṣẹda. Awọn mejeeji de atokọ awọn ẹrọ ti a rii.

Iparun ẹda-ẹda wa ni titan nipasẹ aiyipada. Ti a ba ti rii `sysName` tẹlẹ lori adirẹsi miiran ninu awọn igbasilẹ awari ti o fipamọ ti nẹtiwọọki yii, tabi wa lori ẹrọ kan pẹlu orukọ olupin oriṣiriṣi, adirẹsi naa yoo fo. Iyẹn jẹ aiyipada ti o tọ fun olulana ti o ni ọpọlọpọ awọn atọkun ti a koju ati ọkan ti ko tọ fun awọn ohun elo aami lẹhin awọn adirẹsi NAT lọtọ, eyiti o jẹ idi ti aṣayan sysName kanna wa lati pa.

Awọn ẹrọ ti o wa tẹlẹ le jẹ ki awọn ibeere data wọn tun ṣiṣẹ lakoko ọlọjẹ kan. Iyẹn wa ni pipa nipasẹ aiyipada, ati pe o kan si awọn ẹrọ ti a gbasilẹ bi oke tabi gbigbapada. Awari nlo ipo ti o fipamọ fun ipinnu yii; ko ṣe iwadii ẹrọ tuntun ti o wa tẹlẹ.

## Awọn ofin ẹrọ pinnu awoṣe

Ofin ẹrọ ṣe maapu data eto si awoṣe ẹrọ kan. Ofin kọọkan gbe ilana kan fun `sysDescr`, `sysObjectID` ati `sysName`. Olufidimule ṣe asẹ lori aaye eto kọọkan ti ẹrọ naa pada bi kii ṣe ofo; awọn ilana ofin ofo baamu eyikeyi iye. Awọn ofin ni a ṣe ayẹwo ni aṣẹ ọkọọkan ati pe idije akọkọ bori.

Lo awọn ọrọ gangan ti o rọrun ki o jẹrisi awoṣe ti o yan ninu awọn abajade awari. Olufidimule SQL lọwọlọwọ n murasilẹ awọn ilana regex ni awọn ohun kikọ `/` gangan, nitorinaa ilana ti o wa ni idakọro gẹgẹbi `^Linux.*fixture$` kuna paapaa nigbati oniṣẹ regex ti aaye data baamu taara. Ifẹhinti ọrọ ko ṣe atunṣe ọran yẹn. Wo [ọrọ #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE` tun ṣe itọju `%` ati `_` bi awọn kaadi egan.

Ko si ibaamu tumọ si ko si ẹrọ. Adirẹsi naa ni a gbasilẹ ninu atokọ awọn ẹrọ ti a ṣe awari pẹlu eyikeyi data eto ti a gba, ati pe atokọ yẹn wa nibiti o ti kọ ofin ti o padanu.

Fi awọn ofin kan pato loke awọn gbogbogbo. Ofin kan ti o baamu ọrọ `Linux` ti a gbe sori ofin ataja kan yoo beere gbogbo ohun elo ti o darukọ Linux ninu apejuwe rẹ.

## Ṣe awotẹlẹ awari ṣaaju ṣiṣe iṣẹda

Yipada ẹda ẹrọ lori sakani tuntun wa ni pipa nipasẹ aiyipada. Fi silẹ ni pipa fun igbesẹ akọkọ, ki o mu aṣayan ṣiṣẹ lati tun ṣiṣe awọn ibeere data awọn ẹrọ ti o wa tẹlẹ. Igbesẹ yii tun ṣe imudojuiwọn awọn igbasilẹ iwari, awọn iṣiro ọlọjẹ, ati awọn akọọlẹ, ati pe o le firanṣẹ awọn iwifunni ti a tunto. Ko ṣe awotẹlẹ aworan tabi ipaniyan ofin igi.

Ṣiṣe ọlọjẹ naa, lẹhinna ka atokọ awọn ẹrọ ti a rii. O fihan awọn iwari ti o gbasilẹ, data SNMP ti a gba, ati awoṣe ti o baamu nibiti o wa. Awọn ẹrọ ti o wa tẹlẹ, awọn ẹda ti a tẹ mọlẹ, ati awọn adirẹsi ti a fo ko nilo lati han nibẹ. Ṣe atunyẹwo iṣelọpọ yokokoro fun adirẹsi kọọkan pẹlu atokọ naa.

Fi agbara mu ọlọjẹ lati laini aṣẹ dipo idaduro fun iṣeto kan:

```bash
php poller_automation.php --network=3 --force --debug
```

Asia yokokoro n tẹ awọn ipinnu fun adirẹsi kọọkan bi wọn ṣe n ṣẹlẹ. Ilana titunto si, eyiti o ṣe ifilọlẹ awọn sakani ti o ṣiṣẹ ti iṣeto wọn jẹ nitori, jẹ ipo lọtọ:

```bash
php poller_automation.php -M
```

Aṣẹ `--force` ti a fojusi tun n ṣiṣẹ nẹtiwọọki alaabo kan. Ṣafikun `--force` si ipo titunto si fori iṣayẹwo iṣeto ati pe o le ṣe ifilọlẹ awọn nẹtiwọọki alaabo paapaa. Lo fọọmu ti a fojusi nigbati o ba n fọwọsi sakani kan.

Ṣayẹwo awọn nkan mẹta ninu abajade ṣaaju titan iṣẹda.

- Nọmba ẹrọ jẹ ohun ti o nireti. Kika ti o ga julọ ju atokọ dukia rẹ nigbagbogbo tumọ si pe ibiti o gbooro ju ti o ro lọ.
- Awọn awoṣe ti a yan tọ. Ọwọn ti awoṣe jeneriki kanna lori ohun gbogbo tumọ si pe awọn ofin rẹ ko baamu.
- Ko si ohun pataki ti ko si. Fun ẹrọ ti o padanu, ṣayẹwo imugboroja ibiti, ipari oṣiṣẹ, ẹrọ ti o wa tẹlẹ ati didasilẹ ẹda, eto imulo ping, ati awọn abajade SNMP. Aisi lati atokọ nikan ko fi idi rẹ mulẹ pe ko le de ọdọ rẹ.

## Awọn ofin aworan ati igi

Ni kete ti ẹrọ kan ba wa, awọn ofin aworan ati awọn ofin igi pinnu ohun ti a kọ lori rẹ. Awari le pe adaṣiṣẹ yii lẹhin ṣiṣẹda ẹrọ kan, ati pe CLI le lo si awọn ẹrọ ti o wa tẹlẹ. Olukuluku aworan ati awọn ofin igi gbọdọ wa ni sise. Awọn iyipada adaṣiṣẹ aworan/igi agbaye n ṣe akoso awọn kio ẹda kan pato; wọn kii ṣe ifilọlẹ ibora lori adaṣiṣẹ CLI ti o han gbangba.

Ofin aworan kan ni awọn ẹya mẹta: awọn ẹrọ wo ni o kan si, awọn atọka ti a ṣe awari laarin ibeere data ti o kan si, ati iru aworan ti o fẹ ṣẹda. Awọn ẹya mejeeji ti o baamu ni a kọ lati awọn ohun kan ti ofin, ati ohun kan ti ofin jẹ aaye kan, oniṣẹ kan ati ilana kan, ti o darapọ nipasẹ `AND` tabi `OR` pẹlu awọn biraketi.

| Ẹgbẹ oniṣẹ | Awọn ọmọ ẹgbẹ |
|---|---|
| Kedere | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Idogba | matches, is not equal to |
| Nọmba | is less than, less than or equal, greater than, greater than or equal |
| Wiwa | is unknown, is not unknown, is empty, is not empty |
| Ilana | matches regular expression, does not match regular expression |

Iwọnyi di gbolohun SQL `WHERE` kan. Awọn oniṣẹ ikosile deede jẹ ede ikosile deede ti aaye data, kii ṣe PCRE, nitorinaa apẹrẹ ti o ṣiṣẹ ni `preg_match` kii yoo ṣiṣẹ nibi dandan. Awọn afiwera nọmba si awọn ilana nọmba ni a kọja laisi asọye; ohun gbogbo miiran ni a sọ, ati pe aaye data n lo awọn ofin iyipada-iru rẹ. Ṣe idanwo awọn asẹ nọmba lodi si awọn iye ti a fipamọ gangan; awọn iye wọnyi ni a fipamọ nigbagbogbo bi ọrọ. Awọn oniṣẹ Substring lo SQL `LIKE`, nibiti `%` ati `_` ni awọn itumọ kaadi egan.

Awọn ihuwasi meji tọ lati mọ ṣaaju ki o to ṣatunṣe ofin kan ti ko ṣe nkankan.

**Ajọ ẹrọ/nkan ti o ṣofo ko baamu nkankan, ṣugbọn àlẹmọ atọka ti o ṣofo baamu gbogbo awọn atọka ti a fipamọ.** Ajọ yiyan ẹrọ ṣubu pada si ipo eke nigbati ko ba ni awọn ohun ibaramu. Ni kete ti ofin aworan kan baamu ẹrọ kan, sibẹsibẹ, yiyọ gbogbo awọn ipo atọka aworan rẹ fi ibeere data silẹ laisi asẹ. Fun apẹẹrẹ, yiyọ ipo `ifDescr = eth0` le tun ṣẹda aworan fun `lo`. Pa ofin naa nigba ṣiṣatunṣe awọn ipo atọka rẹ.

**Ofin kan ti o tọka si aaye ti ẹrọ naa ko ṣe awari ni a kọ silẹ.** Ti ofin kan ba ṣe asẹ lori aaye ibeere data ti ko si ninu kaṣe ẹrọ yẹn, ṣiṣe naa wọle ikilọ kan ti n sọ orukọ aaye naa ti o si da ṣiṣe ofin yẹn duro fun ẹrọ yẹn. Idi deede ni ofin ti a kọ lodi si ibeere data kan ti a ṣe ayẹwo lori ẹrọ ti ibeere rẹ da eto aaye ti o yatọ pada.

Oju-iwe satunkọ ofin ṣe atokọ awọn nkan oludije ati awọn aworan. Ṣe atunyẹwo awọn atokọ yẹn ṣaaju ṣiṣe ofin kan ati lẹhin ṣiṣatunṣe rẹ. Wọn jẹ awọn awotẹlẹ yiyan, kii ṣe adaṣe gbigbẹ ipaniyan ni kikun: awọn sọwedowo orisun data, iwari aworan ti o wa tẹlẹ, awọn kio ẹda, ati fifi sii igi tun waye lakoko ipaniyan. CLI ko ni aṣayan ṣiṣe-gbẹ.

Awọn ofin igi ni awọn oriṣi ewe ẹrọ ati aworan lọtọ ati igi ti a yan ati obi. Awọn igbesẹ akọsori le lo awọn okun ti o wa titi tabi awọn iye lati awọn aaye ẹrọ/aworan. Awọn akọsori ti o gba lati aaye lo aropo regex PHP ti ko ni ifarabalẹ si ọran; lẹsẹsẹ `\n` gangan ninu abajade pin si awọn akọsori itẹ-ẹiyẹ ti o tẹle. Sintaksia aropo yii yatọ si SQL regex ti a lo fun ibaramu ohun. Awọn akọsori ti o wa tẹlẹ ati awọn ewe ni a tun lo ni igi kanna ati obi; yiyipada ọna le ṣafikun ibi miiran laisi yiyọ ti atijọ kuro.

## Waye awọn ofin si awọn ẹrọ ti o wa tẹlẹ

Awari kii ṣe ọna kan ṣoṣo lati wọle. Awọn ofin le ṣee ṣiṣẹ lodi si awọn ẹrọ ti o wa tẹlẹ ninu eto naa, ti a yan nipasẹ id, orukọ olupin tabi apejuwe:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Orukọ olupin ati apejuwe ni a baamu bi ikosile deede nigbati iye naa jẹ ọkan ti o wulo, ati nigbagbogbo tun bi ọrọ kan. O kere ju ọkan ninu awọn mẹta ni a nilo; pipe laisi awọn oluyan jade pẹlu aṣiṣe kan. Nigbati a ba ni idapo awọn oluyan, wọn darapọ mọ pẹlu `AND`. Lo awọn ID ẹrọ rere ti o pin pẹlu aaye fun yiyan dín; awọn ID ti a pin pẹlu aami idaduro ko ni atilẹyin. Awọn ilana le tun gbooro, ati pe ifẹhinti SQL `LIKE` ṣe itọju `%` ati `_` bi awọn kaadi egan.

Ibeere yiyan ko ṣe iyasọtọ awọn ẹrọ alaabo laifọwọyi. `--debug` ṣe afikun awọn iwadii aisan ṣugbọn o tun ṣe iṣẹda. Ko si awọn ẹrọ ti o baamu jẹ no-op ti o ṣaṣeyọri, nitorinaa ipo ijade nikan ko fi idi rẹ mulẹ pe ohunkohun ti ṣẹda.

Fun ẹrọ ti o baamu kọọkan, ṣiṣe naa ṣe awọn nkan mẹta ni aṣẹ:

1. Igbiyanju ẹda fun awọn awoṣe aworan ti a so pọ ti ko ni aworan lori ẹrọ naa, labẹ yiyẹ ni awoṣe ati awọn sọwedowo orisun data.
2. Nṣiṣẹ awọn ofin aworan ti a mu ṣiṣẹ fun awọn ibeere data ti a so pọ nipa lilo kaṣe atọka ti o fipamọ. Igbesẹ yii kii ṣe atunbere awari funrararẹ; sọ ibeere data sọtun ni akọkọ ti kaṣe ba sonu tabi ti gbó.
3. Waye awọn ofin igi ewe-ẹrọ ti a mu ṣiṣẹ.

Ṣiṣẹda aworan tuntun le pe awọn ofin igi ewe-aworan nigbati adaṣiṣẹ igi agbaye ba ṣiṣẹ. CLI ko tun lo awọn ofin yẹn si awọn aworan ti o rii ti a ti ṣẹda tẹlẹ. Nitorinaa ofin ewe-aworan tuntun tabi ti o yipada ko ṣe atunṣe awọn aworan ti o wa tẹlẹ nitori pe a tun ṣe CLI. Wo [ọrọ #211](https://github.com/kadupulhq/kadupul/issues/211). Ṣe idaniloju ipo wọn lọtọ; maṣe pa ati tun awọn aworan itan ṣe nikan lati ma nfa kio ẹda.

Awọn ṣiṣe leralera n tẹ aworan ti ko ni atọka ti o wa tẹlẹ mọlẹ nipasẹ ẹrọ ati awoṣe aworan. Awọn aworan ti a ṣe atọka ni a ṣayẹwo nipasẹ ẹrọ, ibeere data, iru aworan, ati atọka. Eyi ṣe idilọwọ ẹda ẹda ni awọn ṣiṣe lẹsẹsẹ; kii ṣe iṣeduro concurrency. Ṣayẹwo atokọ aworan ati igi lẹhin ṣiṣe kan, pẹlu awọn ifiranṣẹ wọle `AUTOM8` fun awọn aworan ti a fo, data ti ko wulo, tabi awọn ikuna ẹda.

Ohun kan ti fo ni idakẹjẹ to lati dapo: awoṣe aworan kan pẹlu aaye ti a samisi overridable ti ko ni iye aiyipada ko yẹ fun adaṣiṣẹ. Ṣiṣe naa wọle pe a ko ṣafikun nitori pe aaye ti o le bori ko ni aiyipada, o si nlọ siwaju. Ti awoṣe ti o nireti ko ba han rara, iyẹn ni ohun akọkọ lati ṣayẹwo. Wo [Awọn awoṣe](/yo/concepts/templates/) fun kini aaye ti o le bori jẹ.

## Awọn pakute

**Muu ofin kan ṣiṣẹ ko ṣe atunṣe iṣẹ rẹ.** Ko yọ awọn aworan tabi awọn titẹ sii igi ti a ti ṣẹda tẹlẹ kuro. Piparẹ ẹrọ ni aworan lọtọ ati ihuwasi mimọ orisun data; ṣe atunyẹwo awọn aṣayan piparẹ ṣaaju yiyọ ẹrọ kan kuro.

**Ọlọjẹ ti a pa dabi ẹni ti o mọ.** Iwọn ṣiṣe dopin awari nibikibi ti o de. Awọn apapọ ti a gbasilẹ jẹ awọn apapọ ti iṣẹ ti o pari, ati pe ko si ohun ti o samisi abajade bi apa kan. Ṣe afiwe kika adirẹsi ti a ṣe ayẹwo lodi si iwọn ibiti o wa.

**Awọn ofin n ṣiṣẹ lodi si kaṣe ibeere data, kii ṣe ẹrọ naa.** Ofin aworan ti ko baamu nkankan nigbagbogbo tumọ si pe ibeere data ko ṣiṣẹ rara, tabi ran ti ko ri awọn atọka kankan. Ṣayẹwo tabili atọka ti a ṣe awari ṣaaju atunkọ ofin naa.

**Meeli iwifunni pẹlu awọn iwari ti o wa tẹlẹ ati titun.** Ibiti kan le fi meeli ranṣẹ nigbati o ba pari, tito awọn iwari ti o gbasilẹ nipasẹ boya IP kọọkan han ninu aworan awotẹlẹ iṣaaju-ọlọjẹ. Eyi kii ṣe ẹri pe gbogbo adirẹsi ti a beere ni a ṣe ayẹwo.

## Awọn ipo ikuna

| Aami aisan | Idi deede |
|---|---|
| Ọlọjẹ ko ri nkankan lori sakani ti o kun | Ping dina, ikuna SNMP, awọn imukuro, tabi didasilẹ ẹda |
| Ibiti o kọ lati ṣayẹwo, aṣiṣe ninu akọọlẹ | Ko si eto awọn aṣayan SNMP ti o so mọ |
| Awọn ẹrọ ti a rii ṣugbọn ko si ọkan ti a ṣẹda | Yipada ẹda ni pipa, tabi ko si ofin ẹrọ ti o baamu |
| Ohun gbogbo n gba awoṣe jeneriki kanna | Ilana ofin, pẹlu ofin gbogbogbo loke awọn kan pato |
| Diẹ ninu awọn adirẹsi nikan ni a ṣe ayẹwo | Iwọn ṣiṣe ti de, tabi awọn sakani agbekọja kọ ipele adirẹsi kan |
| Ẹrọ kan fun olulana kọọkan dipo ọkan fun atọkun kọọkan, tabi idakeji | Eto idinku ẹda sysName kanna |
| Ofin ko baamu nkankan ati pe akọọlẹ kilo nipa ọwọn kan | Ofin n ṣe asẹ lori aaye kan ti ibeere data ẹrọ yii ko da pada |
| Awoṣe aworan ko ṣẹda nipasẹ ofin kan | Aiyipada ti o nilo ti sonu, iṣelọpọ orisun data ti ko wulo, tabi ikuna ẹda |
| Awọn aworan airotẹlẹ fun awọn atọkun afikun | Ajọ atọka aworan jẹ ofo tabi gbooro ju ti a ti pinnu lọ |
| Ofin igi tuntun ko gbe awọn aworan ti o wa tẹlẹ | CLI ko ṣe afẹyinti awọn ofin ewe-aworan fun awọn aworan ti o wa tẹlẹ |
