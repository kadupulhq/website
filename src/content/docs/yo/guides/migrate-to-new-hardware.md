---
title: Gbe lọ si ohun elo tuntun
description: Gbigbe fifi sori ẹrọ ti n ṣiṣẹ si olupin miiran laisi pipadanu itan-akọọlẹ, ni aṣẹ ti o jẹ ki gbogbo igbesẹ jẹ idaniloju.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe adehun ti a tumọ; atunyẹwo ti amoye ede n duro de.
sidebar:
  order: 20
---

:::caution[Ihuwasi aṣoju RRDtool ti a jogun]
Imuṣiṣẹ aṣoju RRDtool ko ni atilẹyin ni Kadupul. Lo ibi ipamọ RRDtool agbegbe
(`storage_location = 0`). Awọn eto aṣoju, awọn alaye ilana ati awọn iṣan-iṣẹ
lori oju-iwe yii ṣe igbasilẹ ihuwasi ti a jogun, kii ṣe imuṣiṣẹ ti o ni atilẹyin tabi
ọna ijira. Wo [Aṣoju RRDtool](/yo/reference/rrdproxy/).
:::

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira sibẹsibẹ. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Iṣilọ jẹ mimu-pada sipo lori ẹrọ ti o yatọ si eyiti afẹyinti ti wa.
Ohun gbogbo ninu [Ṣe afẹyinti ati mimu-pada sipo](/yo/guides/back-up-and-restore/) kan nibi;
oju-iwe yii ni wiwa nikan ohun ti o yatọ nitori ibi-ajo kii ṣe orisun.

Awọn nkan mẹta yatọ, ati pe ọkọọkan ni apẹrẹ ikuna tirẹ.

| Iyatọ | Ohun ti o fọ |
|---|---|
| Awọn ọna oriṣiriṣi | Awọn ọna faili ti a fipamọ sinu aaye data ati kache poller |
| Olumulo oriṣiriṣi ati awọn id ẹgbẹ | Wiwọle faili ati awọn sọwedowo igbẹkẹle ibi ipamọ le kuna |
| Awọn ẹya akoko ṣiṣe oriṣiriṣi | Awọn amugbooro, ihuwasi aaye data ati ibamu RRD le yatọ |

## Ṣaaju ki o to kan ohunkohun

Kọ ibi-ajo akọkọ ki o mu wa si aaye nibiti fifi sori ẹrọ titun yoo ṣiṣẹ:
olupin aaye data n ṣiṣẹ, awọn amugbooro PHP ti a beere wa, RRDtool wa, olugba ti o yan wa, ati olupin wẹẹbu ti wa ni tunto. Jeki poller rẹ, awọn iṣẹ ti a ṣeto, atunṣe latọna jijin ati awọn iwifunni ti njade ni alaabo. Maṣe ṣiṣe olupilẹṣẹ naa. O fẹrẹ rọpo aaye data naa, ati ṣiṣe iwadii aworan ti a fi sii idaji nira sii ju aworan ofifo lọ.

Baramu atunyẹwo ohun elo ati awọn igbẹkẹle ni deede, pẹlu awọn iyipada agbegbe ati awọn afikun.
Tabili `version` ti aaye data ṣe igbasilẹ ẹya aworan, kii ṣe gbogbo iyipada orisun;
ibaamu iye yẹn nikan ko to. Atunṣe olupilẹṣẹ le ṣe afihan aiṣedeede aworan tabi mimu-pada sipo ti ko pe. Fi koodu kanna ti o nlọ silẹ, jade, jẹrisi pe o ṣiṣẹ, lẹhinna ṣe igbesoke bi adaṣe lọtọ nipa lilo [Ṣe igbesoke lailewu](/yo/guides/upgrade-safely/).

Pinnu ọna fifi sori ẹrọ ni bayi. Mimu ki o jẹ kanna lori awọn ẹrọ mejeeji yọkuro pupọ julọ iṣẹ ti o wa ni isalẹ. Ti o ko ba le, ka apakan awọn ọna ṣaaju ki o to bẹrẹ.

## Ilana ti awọn iṣẹ

Igbesẹ kọọkan n ṣayẹwo eyi ti o wa ṣaaju rẹ, nitorinaa maṣe tunto wọn.

1. **Duro gbogbo awọn olupilẹṣẹ lori orisun ati ibi-ajo.** Duro eto, latọna jijin, ti o nfa wẹẹbu, ati ikojọpọ afọwọṣe ati itọju; gba awọn iṣẹ ti n fo laaye lati pari. Fọ awọn kikọ ti a da duro nikan lẹhin ti awọn olupilẹṣẹ ba duro. Ṣetọju eyikeyi awọn ori ila isinyi ti ko ni idaniloju pẹlu aaye data ti o baamu ati awọn afẹyinti RRD; maṣe ge wọn kuru (truncate).
2. **Ya afẹyinti kan.** Aaye data, igi RRD, iṣeto, ti a mu papọ. Awọn ofin aitasera ninu [Ṣe afẹyinti ati mimu-pada sipo](/yo/guides/back-up-and-restore/) ni aaye akọkọ.
3. **Gbe igi RRD naa.** Wo isalẹ fun bi o ṣe le ṣe.
4. **Gbe aaye data naa.**
5. **Gbe koodu, iṣeto ati ohunkohun ti iṣeto n tọka si.** Eyi pẹlu `plugins/`, `scripts/`, `resource/`, ati eyikeyi faili agbegbe ti ọna titẹ sii data n pe.
6. **Tun lo iṣeto ibi-ajo lẹhin mimu-pada sipo ikẹhin.** Awọn ọna ti o pe, awọn aaye ipari aaye data, nini iṣẹ ati awọn eto igbẹkẹle ibi ipamọ nọmba.
7. **Tun kache poller ṣe.**
8. **Ṣiṣe awọn sọwedowo ibi ipamọ bi akọọlẹ iṣẹ kọọkan, lẹhinna bẹrẹ ikojọpọ lori ibi-ajo nikan.** Bojuto awọn faili aṣoju ati ijinle isinyi ti a da duro.

## Gbigbe igi RRD

Faili RRD jẹ faili alakomeji ti ipilẹ inu rẹ da lori bi a ti kọ ọ.
Ẹda alakomeji nilo faaji ibaramu ati ọna kika RRDtool; ibaamu awọn orukọ ẹrọ ṣiṣe tabi iwọn ọrọ nikan kii ṣe ẹri ti iyẹn. Aibikita le ja si awọn aṣiṣe kika. Daju awọn faili ti a daakọ nipa lilo RRDtool ti ibi-ajo.

Ti o ko ba ni idaniloju pe awọn mejeeji gba, yipada dipo didakọ. Idalẹnu ati mimu-pada sipo RRDtool ṣe agbejade fọọmu ọrọ to ṣee gbe; Kadupul nlo bata kanna ni inu nigbati o nilo lati tun iwe-ipamọ kan kọ.

Ni orisun, pẹlu awọn onkọwe duro, lo iwe ilana ikọkọ titun ti ipele:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Gbe XML pipe ni aabo. Mu pada ni ibi-ajo fun oludije tuntun kan:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Tun ṣe fun faili kọọkan ti o nilo iyipada ki o ṣayẹwo ipo ijade ti aṣẹ kọọkan. Maṣe fi awọn idalẹnu apakan tabi awọn oludije ti a ko fọwọsi sii. RRDtool ṣe akọsilẹ XML gẹgẹbi [ọna kika gbigbe faaji](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Daju ṣaaju ki o to mu ọna ti o lọra. Daakọ faili kan, ṣiṣe `rrdtool info` lori rẹ ni ibi-ajo, ki o ṣe afiwe igbesẹ, awọn ile-ipamọ, akoko imudojuiwọn to kẹhin ati awọn orukọ orisun data. Ṣe afiwe awọn abajade `fetch` kọja aarin ti o kun fun eniyan. Tun ṣe fun awọn ipilẹ ile-ipamọ aṣoju ṣaaju gbigbe igi naa, lẹhinna jẹrisi gbogbo atokọ faili. Wo [Bọsipọ RRD ti o bajẹ](/yo/guides/recover-a-corrupted-rrd/) fun afọwọsi oludije ati awọn ibeere nini.

Bikita bi o ṣe gbe wọn, tọju eto ilana ni deede. Awọn ilana kekere ti o wa labẹ ilana RRA kii ṣe ọṣọ; a ṣe igbasilẹ ọna faili kọọkan fun orisun data kan, ati fifẹ igi naa fọ ọkọọkan wọn.

## Aaye data

Idalẹnu kan ati fifuye kan. Awọn nkan meji lati ṣayẹwo kọja gbigbe naa.

Ṣayẹwo ṣeto ohun kikọ tabili ti a mu pada, akojọpọ ati ẹrọ ibi ipamọ, kii ṣe awọn aiyipada olupin nikan. Ṣetọju awọn asọye orisun ki o jẹrisi ibamu pẹlu ẹya aaye data ibi-ajo ṣaaju gige.

**Awọn isinyi olugba kii ṣe awọn kache isọnu.** Isinyi `poller_output` lọwọlọwọ gbọdọ lo InnoDB. Ṣiṣayẹwo iṣaju ibi ipamọ kọ isinyi MEMORY. Ṣetọju awọn ori ila rẹ ati igbelaruge ati awọn isinyi akoko gidi titi ti a fi jẹrisi awọn apẹẹrẹ; afẹyinti RRD le ma pẹlu awọn wiwọn yẹn sibẹsibẹ. Maṣe ro pe tabili MEMORY ti a mu pada jẹ ofifo: idalẹnu ọgbọn le ni awọn ifibọ ti o tun kun.

Pẹlu awọn onkọwe duro ati awọn afẹyinti ni aabo, isinyi ti kii ṣe InnoDB ti a jogun le yipada ni gbangba:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Ṣiṣe awọn sọwedowo ibi ipamọ labẹ gbogbo wẹẹbu gidi ati akọọlẹ poller. Eyi n ṣayẹwo iraye si ibi ipamọ agbegbe ati isinyi ti o yan; aṣeyọri bi root ko ṣe idasile iraye si iṣẹ. Awọn olugba latọna jijin lori ayelujara nigbagbogbo fojusi isinyi akọkọ; lo `--local` nikan nigbati o ba n ṣayẹwo isinyi agbegbe rẹ mọọmọ. Awọn tabili akoko ṣiṣe/kache miiran nilo titọju ti o han gbangba tabi ero atunkọ. Wo [Awọn ibeere ipamọ](/yo/reference/requirements/).

## Awọn ọna kọja gbigbe naa

Eyi ni ibiti awọn iṣilọ ṣe aṣiṣe, nitori pupọ julọ eyi wa ni alaihan titi di igba akọkọ ti ikojọpọ.

**Awọn ọna RRA.** Awọn ọna orisun data boṣewa lo aami `<path_rra>`. Ninu atunyẹwo yii, bootstrap yo `$config['rra_path']` lati ilana ohun elo pẹlu `/rra`; eyi kii ṣe eto aaye data gbogbogbo lati yan ilana agbegbe lainidii. Jẹrisi ọna ti o munadoko ṣaaju gbigbe awọn faili. Awọn ọna aṣa pipe gbọdọ wa ni ṣayẹwo ati ṣe atunṣe ni ẹyọkan. Ṣetọju iṣeto ilana ti o wa ni itẹ-ẹiyẹ.

**Kache poller ni awọn ọna pipe.** Nigbati a ba kọ kache, aami naa gbooro sii ati pe a kọ ọna pipe sinu ila kache. Yi ilana RRA pada ati kache tun tọka si ti atijọ. Poller n tẹsiwaju lati ṣiṣẹ ati pe ko kọ ohunkohun ti o le rii. Tun kọ ọ.

```sh
php cli/rebuild_poller_cache.php
```

**Awọn eto ti o ni awọn ọna.** Ọkọọkan ninu iwọnyi ni a fipamọ sinu aaye data, nitorinaa ọkọọkan wa lati ẹrọ atijọ ti n tọka si ipilẹ ẹrọ atijọ. Ṣayẹwo gbogbo wọn ṣaaju ṣiṣe akọkọ: RRDtool binary, olugba alakomeji ati faili iṣeto rẹ, PHP binary, awọn irinṣẹ SNMP, awọn ọna akọọlẹ, fonti aiyipada, ati ilana afẹyinti yiyọ iwasoke. Tun ṣe atunyẹwo awọn ọna ati awọn iye ayika ninu awọn faili iṣeto, awọn ẹya iṣẹ, awọn iṣẹ ti a ṣeto, ati olupin wẹẹbu.

**Awọn ọna titẹ sii data ni awọn laini aṣẹ.** Wọn lo aami kan fun gbongbo fifi sori ẹrọ, nitorinaa igbesẹ ti o tọju ipilẹ ko nilo nkankan. Igbesẹ ti o yipada o nilo lati ṣayẹwo kọọkan. Kanna kan si awọn faili XML orisun lẹhin awọn ibeere data.

**Awọn olugba latọna jijin ni faili iṣeto tiwọn**, ti o ni awọn iwe-ẹri aaye data tiwọn ati id olugba tiwọn. Wọn ko si ninu idalẹnu aarin. Ti aaye data aarin ba gbe, ṣe imudojuiwọn awọn aaye ipari ti o yẹ ki o fọwọsi asopọ olugba kọọkan. Atunṣe ni kikun jẹ iṣẹ lọtọ, ṣiṣe lori olugba akọkọ nikan nigbati awọn olugba latọna jijin ti o ṣiṣẹ ti wa ni tunto:

```sh
php cli/poller_replicate.php
```

Aṣẹ yii jade pẹlu aṣiṣe laisi olugba latọna jijin ti o ṣiṣẹ. Maṣe ṣafikun rẹ bi ayẹwo aṣeyọri ti o nilo ninu iṣilọ olugba kan. Daju iṣeto latọna jijin ati atunṣe ṣaaju gbigba ikojọpọ latọna jijin lati bẹrẹ pada.

## Nini ati awọn igbanilaaye

Poller kọ awọn faili RRD bi akọọlẹ ti o nṣiṣẹ rẹ. Oju opo wẹẹbu n ka wọn bi akọọlẹ olupin wẹẹbu. Ẹda ti o tọju awọn id nọmba kọja awọn ẹrọ pẹlu awọn titẹ sii `/etc/passwd` ti o yatọ yoo fun ọ ni awọn faili ti o jẹ ti akọọlẹ ti ko tọ.

Awọn aworan apẹrẹ ti o duro ni akoko iṣilọ le tọka awọn igbanilaaye, awọn ọna atijọ, awọn ile-ipamọ ti o padanu, awọn ami-akoko, tabi awọn apẹẹrẹ ti a kọ. Ṣayẹwo awọn akọọlẹ poller ati awọn isinyi ti a da duro ṣaaju yiyan atunṣe; aworan apẹrẹ nikan ko ṣe idanimọ idi naa.

Ṣayẹwo nini ti ilana RRA funrararẹ ati awọn ilana kekere ti o wa ni itẹ-ẹiyẹ, kii ṣe faili apẹẹrẹ nikan. Awọn faili titun ni a ṣẹda ninu awọn ilana wọnyẹn lakoko ikojọpọ, nitorinaa ilana ti poller ko le kọ si kuna fun awọn orisun data ti ko si ni akoko iṣilọ, paapaa ti awọn faili ti o wa tẹlẹ ba dara. Tun maapu `rrd_maintenance_trusted_uids` ati `rrd_maintenance_trusted_gids` ninu `include/config.php` si awọn idanimọ nọmba gangan ti ibi-ajo ki o ṣayẹwo awọn baba ilana ti o gbẹkẹle. Wo [Awọn ibeere ipamọ](/yo/reference/requirements/).

## Yipada pẹlu pipadanu iwonba (Cutover)

RRD kọ awọn imudojuiwọn ni tabi ṣaaju aami-akoko imudojuiwọn to kẹhin rẹ. Eyi ṣe idiwọ atunṣe; ko ṣe afihan pe awọn apẹẹrẹ gbọdọ sọnu ni gbogbo iṣilọ. Iwọn aafo naa da lori akoko iṣapẹẹrẹ, akoko isinmi, ati kini awọn wiwọn isinyi ti o wa ni ipamọ. Ilana yii nlo oluwa ikojọpọ kan ati pe ko dapọ itan-akọọlẹ atunwi ti a gba ni ominira sinu ṣeto ikojọpọ ikẹhin.

1. Ṣe adaṣe pipe ni ilosiwaju pẹlu afẹyinti lati ọjọ kan ṣaaju. Daakọ ohun gbogbo, ṣe atunṣe gbogbo ọna, ati idanwo awọn imudojuiwọn lodi si awọn ẹrọ imuduro ti o ya sọtọ pẹlu awọn iwifunni ni alaabo. Ṣe igbasilẹ awọn iyipada ibi-ajo bi ilana atunṣe. Duro awọn onkọwe atunwi nigbati idanwo ba pari.
2. Fi adaṣe naa si apakan. Rọpo aaye data rẹ ati RRD pẹlu afẹyinti ti o baamu ikẹhin; maṣe dapọ awọn ori ila atunwi tabi awọn apẹẹrẹ isinyi sinu imupadabọ yẹn.
3. Fun gige, da awọn olupilẹṣẹ orisun duro ki o fọ tabi tọju awọn apẹẹrẹ ti o wa ni isunmọtosi, lẹhinna mu ki o gbe afẹyinti ikẹhin. Tun lo awọn atunkọ ibi-ajo: mimu-pada sipo aaye data mu awọn ọna orisun pada si `settings`, ati mimu-pada sipo awọn faili iṣeto le tun yipada awọn aaye ipari atunwi ati awọn eto igbẹkẹle.
4. Tun kache poller ṣe, ṣiṣe awọn sọwedowo ibi ipamọ, jẹrisi atokọ faili, ati mu ikojọpọ ibi-ajo ṣiṣẹ nikan lẹhin ti awọn sọwedowo wọnyẹn ba kọja.

Ṣe iwọn iye akoko adaṣe ki o gba akoko laaye fun afọwọsi ati sẹhin. Jeki orisun duro titi ti gige yoo fi ṣaṣeyọri tabi sẹhin iṣakoso yoo tun yan gẹgẹbi oluwa ikojọpọ.

## Jẹrisi ni aṣẹ yii

1. Ni wiwo wẹẹbu n gbe laisi atunṣe olupilẹṣẹ eyikeyi. Ti o ba ṣe atunṣe ṣayẹwo koodu / aiṣedeede aworan, asopọ aaye data, tabi mimu-pada sipo ti ko pe.
2. Ẹrọ imuduro kan dahun si igbiyanju ikojọpọ titun; ipo "Up" ti a mu pada nikan le jẹ ti atijọ.
3. Akoko imudojuiwọn to kẹhin ti faili RRD kan n tẹsiwaju lẹhin ṣiṣe ikojọpọ akọkọ. Ṣayẹwo faili lori disk, kii ṣe aworan apẹrẹ.
4. Aworan apẹrẹ ti a ya ni wakati to kọja fihan laini kan, kii ṣe aafo kan.

Ti igbesẹ 3 ba kuna, ṣayẹwo awọn ọna, awọn igbanilaaye, iṣaju ibi ipamọ, ijinle isinyi, ati awọn aṣiṣe RRDtool. Ti igbesẹ 4 ba kuna, ṣayẹwo awọn iye ti a da duro, awọn asọye aworan apẹrẹ, akoko ti a yan, ati iraye si akọọlẹ wẹẹbu. Faili kan ti o ṣaṣeyọri ko fọwọsi gbogbo ẹrọ, ọna titẹ sii data, tabi olugba latọna jijin.

## Awọn ẹgẹ

**Maṣe ṣiṣe awọn fifi sori mejeeji lodi si igi RRD kanna.** Awọn poller meji ti nkọwe si faili kanna ṣe agbejade awọn imudojuiwọn ti a kọ ati awọn ela, kii ṣe data ti o dapọ.

**Maṣe da igi RRD atijọ pada lori aaye data tuntun.** Awọn faili kii yoo ṣe afẹyinti. Ikojọpọ n bẹrẹ pada lati akoko lọwọlọwọ ati aafo laarin awọn mejeeji jẹ iho ayeraye.

**Awọn afẹyinti ni awọn iwe-ẹri ẹrọ ni ọrọ ti o han kedere.** Gbigbe ohun elo tumọ si pe awọn iwe-ẹri yẹn rin irin-ajo lori nẹtiwọki kan ati joko lori awọn ẹrọ meji. Ni ihamọ iraye si afẹyinti ki o si pa gbigbe naa pamọ. Ṣetọju ẹda sẹhin ti o ni idaduro titi ti eto imulo gbigba ati idaduro yoo fi gba laaye lati wó lulẹ; maṣe pa a rẹ lakoko gige.

**Awọn tabili ohun itanna wa ninu aaye data; koodu ohun itanna ko si.** Mimu-pada sipo aaye data laisi koodu ohun itanna ti o baamu ati awọn igbẹkẹle le fọ awọn oju-iwe ohun itanna, awọn ìkọ tabi awọn iṣẹ. Ṣayẹwo gbogbo ohun itanna ti a beere ni gbangba.

**Ibi ipamọ aṣoju ti o wa tẹlẹ wa ni ita ilana iṣilọ yii.** Imuṣiṣẹ aṣoju ko ni atilẹyin. Wa awọn faili RRD gangan ki o ṣe afẹyinti wọn, lẹhinna jẹrisi ijira lọtọ si ibi ipamọ agbegbe lori ẹda ti o ya sọtọ. Ilana `rra/` agbegbe le ni idoti to ku nikan.

**Wó ẹrọ atijọ lulẹ nikẹhin, kii ṣe ni ọjọ kanna.** Fi silẹ ni pipa tabi mu gbogbo awọn olupilẹṣẹ ṣiṣẹ, ki o tọju afẹyinti ti o baamu titi ti eto tuntun yoo fi kọja ikojọpọ ti a beere, aworan apẹrẹ, latọna jijin ati awọn sọwedowo ohun itanna. Pinnu akoko akiyesi lati iṣẹ ṣiṣe ati eto imulo sẹhin; gigun kẹkẹ ikojọpọ kuru kii ṣe ẹri pe gbogbo eto-ipin n ṣiṣẹ.
