---
title: Ṣe iwọn poller naa
description: Kini lati yipada nigbati ikojọpọ ba dẹkun ipari ninu aarin rẹ, ati bii o ṣe le sọ iru opin ti o lu ni otitọ.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe adehun ti a tumọ; atunyẹwo ti amoye ede n duro de.
sidebar:
  order: 6
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira sibẹsibẹ. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Ṣiṣe iwọn poller jẹ ibeere kan: ṣe iṣẹ ikojọpọ kan pari ṣaaju ki ekeji to bẹrẹ? Ohun gbogbo ti o wa ni isalẹ jẹ nipa didahun iyẹn ati lẹhinna gbigbe idahun pada si bẹẹni.

Ka [Faaji](/yo/concepts/architecture/) ni akọkọ ti o ko ba ni idaniloju iru apakan ti o n ṣe ikojọpọ naa.

## Awọn aago meji naa

Awọn aaye arin meji wa ati pe wọn kii ṣe eto kanna.

| | Kini o jẹ | Awọn iye ti a gba laaye |
|---|---|---|
| Aarin ifilọlẹ | Igba melo ni ẹrọ ṣiṣe n bẹrẹ olugba, lati cron tabi lati iṣẹ `cactid` | Awọn aaya 60 tabi 300 |
| Aarin poller | Ilu ikojọpọ ipilẹ; awọn igbesẹ orisun data kọọkan le gun ju | Awọn aaya 10, 15, 20, 30, 60 tabi 300 |

Nigbati aarin poller ba kuru ju aarin ifilọlẹ lọ, ifilọlẹ kan n ṣe awọn ipele ikojọpọ pupọ ninu lupu kan. Nọmba awọn ipele jẹ aarin ifilọlẹ ti a pin nipasẹ aarin poller.

Isuna fun gbogbo ifilọlẹ jẹ yo lati awọn nọmba meji wọnyẹn: awọn ipele ti a pọ si nipasẹ aarin poller, iyokuro awọn aaya meji. Iyẹn ni aago ogiri gangan (wall clock) ti a n ṣe iwọn ṣiṣe si.

## Kini yoo ṣẹlẹ nigbati ṣiṣe ba kọja akoko

Awọn nkan pataki mẹta n ṣẹlẹ, ati pe wọn ṣe agbejade awọn laini akọọlẹ ọtọtọ mẹta.

**A ge ṣiṣe naa kuro.** Nigbati akoko ti o kọja ba kọja isuna, poller ṣe akọọlẹ pe o ti kọja akoko ṣiṣe ti o pọ julọ, o kọ awọn iṣiro rẹ, o si jade. Iṣẹ ti ko ti ṣe agbejade apẹẹrẹ le fi aafo silẹ. Awọn apẹẹrẹ ti a ti gba tẹlẹ sinu isinyi ti o tọ le wa ni idaduro fun kikọ RRD aṣeyọri nigbamii; gbigba akoko kọja ko tumọ si pe gbogbo wiwọn ti ko ti fọ ni a sọnu. Ṣayẹwo ijinle isinyi ati awọn akọọlẹ lẹgbẹẹ aworan apẹrẹ, maṣe ko awọn ori ila ti o ni idaduro kuro lati jẹ ki ṣiṣe atẹle dabi mimọ.

**Ṣiṣe atẹle ṣe akiyesi awọn idoti naa.** Ni ibẹrẹ, poller n ka awọn ori ila ilana ti a ko tii tii rara ati kilọ pe a ti rii awọn ilana ti o kọja iwọn gigun ti didibo. Ṣe iwadii awọn igbasilẹ ilana ti ko pari tabi ti atijọ ati awọn ilana ọmọ gangan ti n ṣiṣẹ; ikilọ nikan ko ṣe idanimọ igo naa.

**Awọn aago yapa kuro lọdọ ara wọn.** Ti akoko diẹ sii ba kọja lati igba ti o ti ṣiṣẹ kẹhin ju ti isuna ba gba laaye, poller kilọ pe olutayo ko ni ibamu pẹlu aarin poller. Eyi jẹ igbagbogbo nitori olutayo, kii ṣe poller: titẹsi cron ni igbohunsafẹfẹ ti ko tọ, iṣẹ ti o duro, tabi olupin ti o sùn.

Awọn ipa-ọna wọnyi pe oluranlọwọ iwifunni abojuto. Ifijiṣẹ da lori awọn olugba ti a tunto, awọn idari iwifunni ati gbigbe meeli ti n ṣiṣẹ; ikilọ akọọlẹ ko jẹri pe imeeli de. Wo [Awọn iwifunni imeeli](/yo/guides/send-email-notifications/).

Ẹjọ kẹrin wa ti kii ṣe gbigba akoko kọja. Ti a ba tun bẹrẹ poller laipẹ ju ti o nireti lọ, o ṣe akọọlẹ pe a tunto rẹ lati ṣiṣẹ nigbagbogbo pupọ ati pe o jade laisi ikojọpọ. `--force` n kọja ayẹwo akoko yẹn; lo o nikan lakoko iwadii iṣakoso pẹlu eto ati awọn ifilọlẹ afọwọṣe miiran ti duro. Ko ṣe afikun agbara tabi ṣe ikojọpọ agbekọja ni ailewu.

## Laini awọn iṣiro

Gbogbo ṣiṣe ti o pari n kọ laini awọn iṣiro kan si akọọlẹ naa. O gbe akoko ti o kọja, ọna ikojọpọ, ilana ati awọn iṣiro okun, nọmba awọn ẹrọ, awọn ẹrọ fun ilana kọọkan, awọn orisun data, ati awọn faili RRD ti a ṣe ilana.

Tọpinpin akoko ti o kọja, idaduro iru, ijinle isinyi ati awọn imudojuiwọn ti o kuna. Ṣe iwadii paapaa ṣiṣe ti o sunmọ isuna nigbati o ba fa awọn ela; idagbasoke ti o duro n ṣe iranlọwọ lati ṣe idanimọ nigbati agbara tabi ihuwasi ikojọpọ nilo lati yipada.

## Awọn ilana ati awọn okun

Awọn ipe meji, ati pe wọn ṣe awọn nkan oriṣiriṣi.

| Ipe | Ẹka iṣẹ ti o pin | Olugba wo ni o nlo |
|---|---|---|
| Awọn ilana | Awọn ẹrọ, pin si awọn sakani ti o tẹle ti id ẹrọ | Mejeeji |
| Awọn okun | Awọn ohun kan laarin ẹrọ kan | Spine nikan |

Abajade ni apakan ti awọn eniyan n kọsẹ lori: **ilana kan ni a fun ni gbogbo awọn ẹrọ.** Ẹrọ kan ti o ni ẹgbẹrun marun awọn orisun data ko le pin kaakiri awọn ilana. O bọ sinu ilana kan ati pe ilana yẹn gba akoko ti o ba gba. Fifi awọn ilana kun ko ṣe nkankan fun u.

Awọn iye mejeeji ni a waye fun olugba data kọọkan, kii ṣe ni gbogbogbo. Awọn iye lori oju-iwe awọn eto jẹ awọn tito tẹlẹ ti a lo nigbati a ṣẹda olugba data tuntun kan. Yiyipada tito tẹlẹ ko yipada olugba ti o wa tẹlẹ.

Iṣiro okun fun ẹrọ kọọkan tun wa, eyiti o jẹ bi ẹrọ nla kan ṣe pin si. O kan olugba C nikan.

Balance Process Load nlo awọn iṣiro nkan ti o ṣajọpọ lati yan awọn aala laarin gbogbo awọn ẹrọ ni aṣẹ id ẹrọ. Ko pin ẹrọ kan tabi ṣe iṣeduro awọn iṣiro nkan ti o dọgba, ati iṣiro nkan kii ṣe akoko ipaniyan. Ṣe afiwe akoko fun ilana kọọkan ṣaaju ati lẹhin mimuuṣiṣẹpọ lori iṣẹ aṣoju ti o ya sọtọ.

## Olugba PHP lafiwe si olugba C

Olugba PHP, `cmd.php`, n bọ pẹlu ohun elo naa. Kadupul ngbero lati ṣetọju orita Spine kan, ṣugbọn ipo orisun rẹ ati awọn ile ti a fọwọsi ko tii ṣe akọsilẹ sibẹsibẹ. Lo PHP titi ti ẹri yẹn yoo fi wa. Awọn afiwera Spine, awọn eto okun ati awọn aṣẹ ni isalẹ ṣe apejuwe ihuwasi ti a jogun, kii ṣe imuṣiṣẹ Kadupul ti o wa tabi ti o ni atilẹyin.

| | Olugba PHP | Spine |
|---|---|---|
| Ni afiwe | Awọn ilana nikan | Awọn ilana ati awọn okun |
| Eto okun | Fi agbara mu si 1 laibikita iṣeto | A bọwọ fun |
| Olupin iwe afọwọkọ | Ọkan fun ilana kọọkan, ko ṣe atunto | 1 si 15 fun ilana kọọkan, a le tunto |
| Akoko iwe afọwọkọ ti pari | Ko lo | Ti lo, aiyipada 25 aaya |
| Fifi sori | Ọkọ pẹlu koodu | Orita ti a gbero; ko si ile Kadupul ti a fọwọsi ti a kọ silẹ |

Iṣiro okun ti a fi agbara mu tọ lati sọ ni gbangba: ti a ba ṣeto olugba si ti PHP, iyipada okun akoko ṣiṣe ni a ṣeto si 1; eyi ko tun kọ eto okun olugba ti o fipamọ. Ṣiṣe iwọn olugba PHP le ni awọn ilana diẹ sii, ati itọsọna ninu orisun ni lati duro ni tabi labẹ ilọpo meji iṣiro mojuto CPU.

Iṣeto Spine ati ihuwasi aṣẹ nilo afọwọsi lodi si alakomeji gangan ti a n ṣe ayẹwo. Orisun ohun elo PHP nikan ko ṣe agbekalẹ aṣẹ wiwa iṣeto rẹ, ihuwasi okun tabi awọn ipa ẹgbẹ.

Awọn apẹẹrẹ ti a jogun fun igbelewọn Spine ti o ya sọtọ, kii ṣe awọn aṣẹ Kadupul ti a fọwọsi:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

`--readonly` ni a pinnu lati yago fun awọn iwe kikọ abajade. O tun kan si awọn ẹrọ ati ṣiṣe awọn iwe afọwọkọ ikojọpọ; jẹrisi awọn ipa ẹgbẹ rẹ ninu idanwo ti o ya sọtọ ni akọkọ.

## Awọn isopọ aaye data (Database connections)

Awọn okun kii ṣe ọfẹ. Okun Spine kọọkan ni asopọ aaye data tirẹ, ati pe bẹẹ ni gbogbo olupin iwe afọwọkọ ṣe.

```
estimated worker connections = processes * (threads + script_servers)
```

Eyi ni iṣiro ninu iranlọwọ awọn eto ohun elo, kii ṣe opin oke ti a wọn. Ṣe akopọ rẹ kọja awọn olugba ki o ṣafikun agbara fun awọn obi poller, awọn ibeere wẹẹbu, itọju ati awọn alabara miiran. Ṣe iwọn awọn isopọ ti o ga julọ gangan ati awọn isopọ ti a kọ ṣaaju yiyan opin aaye data; jijẹ rẹ tun n gba awọn orisun.

Rirẹ asopọ le fa awọn apẹẹrẹ ti o padanu, ṣugbọn awọn ela yiyipo kii ṣe ayẹwo alailẹgbẹ. Jẹrisi rẹ pẹlu awọn metiriki asopọ aaye data ati awọn aṣiṣe ohun elo.

## Awọn kikọ RRD ti a da duro

Ipo kan wa ti o da poller duro lati kọ si awọn faili RRD lori gbogbo igbasilẹ. Awọn abajade n ṣajọpọ ninu tabili aaye data dipo ati pe a fọ wọn ni olopobobo, boya lori aago kan tabi nigbati aworan apẹrẹ ba beere fun faili naa. O n ṣe iṣowo nọmba nla ti awọn kikọ kekere fun nọmba kekere ti awọn kikọ nla.

Awọn otitọ meji nipa rẹ ti o ṣe pataki ni iṣiṣẹ:

- O nilo nigbati o ba ni awọn olugba data latọna jijin. Eyi kii ṣe imọran, o jẹ ipo ti sọfitiwia n sọ.
- Tabili ifipamọ jẹ ti o tọ, kii ṣe ninu iranti nikan, nitorinaa awọn apẹẹrẹ ti ko fọ n ye atunbere. Wọn tun tumọ si pe awọn faili RRD rẹ wa lẹhin aaye data rẹ. Wo [Ṣe afẹyinti ati mimu-pada sipo](/yo/guides/back-up-and-restore/) ṣaaju ki o to ya aworan ohunkohun.

Isinyi `poller_output` akọkọ ninu ọkọ ofurufu tun jẹ InnoDB ninu atunyẹwo yii. Ṣiṣayẹwo iṣaju ibi ipamọ kọ isinyi MEMORY; jijẹ opin tabili-okiti ko yanju kiko yẹn. Pẹlu awọn olupilẹṣẹ ti duro ati afẹyinti ti o baamu ti o ni idaduro, ṣe iyipada isinyi ti a ko yẹ ti a jogun ni gbangba, lẹhinna ṣayẹwo ibi ipamọ bi akọọlẹ iṣẹ kọọkan:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Awọn iṣẹ lọtọ ni iwọnyi. Ṣetọju awọn ori ila ti o wa ni isunmọtosi ki o ṣe atẹle aaye disk aaye data ati ọjọ-ori isinyi ati iṣiro ori ila. Wo [Ṣe igbesoke lailewu](/yo/guides/upgrade-safely/) fun yiyan isinyi, awọn sọwedowo igbẹkẹle akọọlẹ iṣẹ ati awọn ohun pataki atunbere.

## Nigbawo lati gbe si awọn olugba latọna jijin

Olugba data latọna jijin jẹ ẹrọ keji ti n ṣiṣẹ koodu kanna pẹlu id olugba ti o yatọ, idibo ipin ti awọn ẹrọ ati kikọ awọn abajade pada si aaye data aarin.

Gbe lọ si ọkan nigbati igo ba wa ni ẹgbẹ ikojọpọ dipo ẹgbẹ titoju:

- CPU olupin poller ti kun lakoko ṣiṣe ati pe o wa ni aiṣiṣẹ laarin awọn iṣẹ.
- Idaduro irin-ajo yika si ẹgbẹ awọn ẹrọ n jẹ gaba lori ṣiṣe, ati pe ẹgbẹ yẹn joko lẹhin ọna asopọ kan.
- Aaye kan wa ni opin ti WAN ti o ko fẹ dibo kọja.
- O nilo ikojọpọ aaye ti o ya sọtọ, ati pe o ti fọwọsi ifipamọ aisinipo ati imularada fun olugba yẹn ṣaaju gbigbekele rẹ.

Awọn olugba latọna jijin ko yọ aaye data aarin tabi awọn opin kikọ RRD kuro. Ṣe iwọn gbigbemi aarin ati agbara fifọ ṣaaju jijẹ iṣelọpọ ikojọpọ; afikun awọn olupilẹṣẹ le mu iṣẹ ti o wa tẹlẹ pọ si.

Olugba kọọkan gbe ilana tirẹ ati awọn iṣiro okun, awọn iwe-ẹri aaye data tirẹ, ati aarin amuṣiṣẹpọ, eyiti aiyipada si wakati meji. Ọpa laini aṣẹ wa lati fi agbara mu amuṣiṣẹpọ ni kikun dipo idaduro.

Fifi sori aarin le ṣe atunṣe oju opo wẹẹbu ati koodu ohun itanna jade si awọn olugba latọna jijin ki wọn ṣe imudojuiwọn ara wọn. Atunṣe yẹn le wa ni pipa ti o ba ran koodu ni ọna miiran.

## Opin wo ni o lu

Lo tabili yii lati ṣe awọn idawọle, lẹhinna rii daju wọn pẹlu awọn akọọlẹ ati awọn wiwọn. Awọn opin pupọ le waye papọ. Awọn aṣayan Spine wa laisi ifọwọsi nibi.

| Akiyesi | Opin | Kini lati yipada |
|---|---|---|
| Ikilọ olutayo ko ni amuṣiṣẹpọ, poller yara bibẹẹkọ | Idaduro iṣeto, iṣaju ti o kọja tẹlẹ tabi idilọwọ olupin | Ṣayẹwo itan ifilọlẹ ati ipo ilana |
| Akoko ṣiṣe ko yipada, ẹrọ kan pẹ nigbagbogbo | Awọn idahun ti o lọra, awọn iwe afọwọkọ ti o gbowolori tabi iṣẹ ti o dojukọ | Ṣe iwọn akoko awọn ọna titẹ sii rẹ ki o ṣe atunyẹwo akoko ti o pari/atunwo ihuwasi |
| Akoko ṣiṣe n pọ si pẹlu nọmba ẹrọ, CPU ti kun | Titẹ CPU olugba | Ṣe iwọn boya awọn ilana diẹ sii ṣe iranlọwọ; ro ibi ti olugba wa |
| Akoko ṣiṣe n pọ si pẹlu nọmba ẹrọ, CPU ko ṣiṣẹ | Nẹtiwọọki, iwe afọwọkọ tabi idaduro aaye data | Ṣe iwọn awọn orisun idaduro ṣaaju yiyipada iṣọkan |
| Awọn apẹẹrẹ ti o padanu lori akojọpọ yiyi ti awọn ẹrọ | Awọn isopọ, awọn akoko ti o pari tabi awọn ikuna ikojọpọ miiran | Ṣayẹwo awọn aṣiṣe, awọn metiriki asopọ ati awọn isinyi ti a da duro |
| Akoko ṣiṣe dara, kikọ RRD lọra, disk n ṣiṣẹ | Ibi ipamọ | Awọn kikọ RRD ti a da duro, tabi disk ti o yara ju |
| Ohun gbogbo lọra pẹlu wiwo wẹẹbu | Aaye data | Iwọn adagun ifipamọ, lẹhinna olupin aaye data |

Awọn ẹgẹ meji ti o tọ lati darukọ.

**Yiyipada aarin ipilẹ kii ṣe kanna bi yiyipada gbogbo igbesẹ orisun data.**
Ṣe atunṣe awọn profaili, awọn igbesẹ nkan ti o wa ni fipamọ ati awọn asọye lilu ọkan/igbesẹ RRD. Titun kache ko ṣe atunṣe awọn faili RRD ti o wa tẹlẹ. Wo
[Ṣakoso idaduro data](/yo/guides/manage-data-retention/) ati
[Akoko ati awọn aaye arin](/yo/concepts/time-and-intervals/).

**Aarin ti o yara n pọ si ohun gbogbo.** Lilọ lati awọn aaya 300 si 60 ko jẹ ki iṣẹ naa din owo ni igba marun. Awọn orisun ti a tunto fun ilu ti o yara yẹn ni a gba nigbagbogbo; awọn orisun ti o ni idaduro awọn igbesẹ gigun ko nilo lati ṣiṣẹ lori gbogbo iwe-iwọle ipilẹ. Ṣe iwọn ẹru ti o waye dipo ki o ro pe gbogbo iwe-iwọle ni iṣẹ dogba.
