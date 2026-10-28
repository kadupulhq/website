---
title: Ni aabo fifi sori ẹrọ ti nkọju si intanẹẹti
description: Kini lati yipada ṣaaju eto ibojuwo pẹlu iraye si ikarahun si nẹtiwọki rẹ dahun si awọn ibeere lati intanẹẹti gbangba.
banner:
  content: Kadupul wa ni ipele iṣaaju-alpha. Jẹrisi awọn ilana wọnyi ni fifi sori idanwo ti o ya sọtọ. Eyi jẹ iwe adehun ti a tumọ; atunyẹwo ti amoye ede n duro de.
sidebar:
  order: 9
---

:::caution[Jẹrisi ṣaaju lilo]
Koodu orisun wa, ṣugbọn ko si itusilẹ Kadupul ti o ni atilẹyin tabi ọna ijira sibẹsibẹ. Ṣe idanwo awọn ilana wọnyi lori ẹda ti o ya sọtọ pẹlu awọn afẹyinti ṣaaju gbigbekele wọn. Wo [ipo iṣẹ akanṣe](/yo/project/status/).
:::

Bẹrẹ pẹlu idahun otitọ: fi sii lẹhin VPN kan. Kadupul n tọju awọn iwe-ẹri SNMP ti gbogbo ẹrọ ti o ṣe atẹle ni ọrọ ti o han kedere (cleartext), ati pe o nṣiṣẹ awọn aṣẹ lori olupin tirẹ gẹgẹbi apakan ti awọn iṣẹ deede. Ko si iṣeto ti o jẹ ki gbigbe si lori intanẹẹti gbangba jẹ ohun ti o dara.

Awọn sọwedowo ti o wa ni isalẹ ṣe iranlọwọ lati ṣe ayẹwo fifi sori ẹrọ ti o ya sọtọ. Wọn ko ṣe agbekalẹ imuṣiṣẹ ti gbogbo eniyan ti o ni atilẹyin tabi ailewu; tọju opin ipo iṣẹ akanṣe ti o wa loke ni lokan nigbati o ba n tumọ awọn abajade.

## TLS

Pari TLS ni olupin wẹẹbu tabi ni aṣoju ni iwaju rẹ. Kadupul ko tẹtisi lori iho tirẹ.

Lẹhinna tan eto ti o ṣe atunṣe awọn ibeere HTTP ti o rọrun si HTTPS. Eyi wa ni pipa (`off`) nipasẹ aiyipada. Laisi rẹ, a fọọmu iwọle ti wa ni yoo lori HTTP ati ki o kan ọrọigbaniwọle lọ kedere kọja nẹtiwọki ṣaaju ki ohunkohun miiran ọrọ.

Nigbati PHP ba gba iye `$_SERVER['HTTPS']` ti ko ṣofo yatọ si `off`, ohun elo naa ṣeto asia Secure ti kuki igba naa. Lẹhin aṣoju ti o fopin si TLS, tunto olupin wẹẹbu ti o gbẹkẹle tabi ipele FastCGI lati ṣafihan HTTPS ni deede, ki o rii daju pe akọsori `Set-Cookie` ti o waye ninu aṣawakiri naa.

`$proxy_headers` n ṣakoso ipinnu adirẹsi alabara. Eyi ko ṣeto iyipada olupin HTTPS tabi mu awọn kuki Secure ṣiṣẹ. Gbẹkẹle awọn akọsori adirẹsi nikan ti aṣoju rẹ ṣeto, yọ awọn adakọ ti alabara pese, ati dina iraye si taara si opin ẹhin. Fi ipa mu atunṣe HTTP-si-HTTPS lori aṣoju gbogbo eniyan ṣaaju ki o to fi awọn iwe-ẹri ranṣẹ.

Ohun elo naa ṣeto HttpOnly ati SameSite=Strict lori kuki igba rẹ. Ṣayẹwo kuki gangan ati ihuwasi atunṣe ni aala imuṣiṣẹ; awọn asia wọnyi ko fi idi rẹ mulẹ pe gbogbo awọn kuki miiran pin iṣeto kanna. Wo [Itọkasi iṣeto igba PHP](https://www.php.net/manual/en/session.configuration.php).

## Awọn iwe-ẹri aiyipada

Aworan ti a firanṣẹ ni akọọlẹ iṣakoso ti a npè ni `admin` ti hash ọrọ igbaniwọle rẹ jẹ MD5 ti okun `admin`. O jẹ aami bi o ṣe nilo iyipada lori iwọle akọkọ. Dipo ki o ro pe iyẹn ṣẹlẹ, jẹrisi pe iyipada naa waye. A foju itọsi ti o fi ipa mu pe labẹ Ijeri Ipilẹ Wẹẹbu, nibiti olupin wẹẹbu ti pinnu tẹlẹ tani olumulo naa jẹ.

Lẹhinna wo awọn iwe-ẹri ti kii ṣe awọn akọọlẹ olumulo:

- Akọọlẹ aaye data ninu awoṣe iṣeto ti a firanṣẹ jẹ aiyipada si `cactiuser` pẹlu ọrọ igbaniwọle `cactiuser`.
- Eto adaṣe adaṣe wa pẹlu awọn aṣayan SNMP aiyipada ti o ni awọn okun agbegbe `public` ati `private`, ati orukọ olumulo SNMPv3 ati bata ọrọ igbaniwọle. Awọn wọnyi ni awọn aiyipada ọlọjẹ, kii ṣe awọn atunto ẹrọ, ṣugbọn wọn jẹ awọn okun kanna ti iwari rẹ yoo kọkọ gbiyanju.

Ilana ọrọ igbaniwọle jẹ atunto. Aiyipada nilo awọn ohun kikọ mẹjọ ati ọran adalu. Mejeeji ipari ati titiipa akọọlẹ lẹhin ikuna leralera wa ati pe mejeeji wa ni pipa nipasẹ aiyipada. Lori fifi sori ẹrọ ti nkọju si intanẹẹti, tan titiipa.

## Awọn anfani aaye data

Apeere fifi sori ẹrọ nlo awọn anfani ti o ni iwọn aaye data pẹlu iraye si tabili agbegbe aago. Rọpo awọn orukọ akọọlẹ / aaye data apejuwe wọnyi ki o ṣe atunyẹwo awọn ifunni fun imuṣiṣẹ gangan ati awọn iṣẹ ṣiṣe itọju:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Ẹbun keji yẹn kii ṣe aṣayan. Mimu agbegbe aago n ka tabili yẹn, ati pe oluṣeto n ṣayẹwo iraye si ati data agbegbe aago ti o kun. Ṣe atunyẹwo awọn ifunni afikun lodi si itọju gangan ati awọn ibeere olugba ṣaaju yiyọ wọn kuro; apẹẹrẹ yii kii ṣe ẹri pe gbogbo imuṣiṣẹ nilo awọn anfani kanna gangan.

Awọn akọsilẹ aaye ti o ṣe pataki:

- Di aaye data mọ localhost, tabi si wiwo ikọkọ, kii ṣe adirẹsi ti olupin wẹẹbu n dahun si.
- Fun olugba data latọna jijin kọọkan ni akọọlẹ aaye data tirẹ. Awọn iwe-ẹri wọn wa ninu aaye data aarin ati ninu faili iṣeto tiwọn, nitorinaa awọn akọọlẹ lọtọ mu ilọsiwaju ati ifagile dara si. Wọn ko ya sọtọ olugba ti o gbogun lori ara wọn ti awọn ifunni rẹ ba tun gba awọn kikọ aarin laaye.
- Asopọmọra ṣe atilẹyin TLS, ti a tunto ninu faili iṣeto pẹlu bọtini kan, ijẹrisi ati ọna CA. Lo o nigbakugba ti aaye data ko ba si lori olupin kanna.
- Ṣe faili iṣeto jẹ kika nipasẹ olumulo olupin wẹẹbu ati pe ko le kọ nipasẹ wẹẹbu tabi olumulo iṣẹ poller lakoko iṣẹ deede. Jẹ ki o jẹ ti akọọlẹ iṣakoso kan. Eto poller latọna jijin pataki n ṣayẹwo boya o le ṣe imudojuiwọn faili naa; maṣe ro pe gbogbo fifi sori olupin akọkọ nilo awọn igbanilaaye kikọ igba diẹ kanna.
- A le fi aṣiri CSRF pamọ sinu faili kan dipo aaye data. Ti o ba lo aṣayan yẹn, faili gbọdọ wa ni ita gbongbo iwe aṣẹ. Eyi ni a sọ gẹgẹbi ibeere, kii ṣe imọran.

## Tọju awọn ilana data kuro ni gbongbo iwe aṣẹ

Ninu imuṣiṣẹ root-ibi ipamọ, data ikọkọ ati awọn ilana orisun le joko labẹ gbongbo ti a nṣe. Ọpọlọpọ awọn ilana ni awọn ofin kiko `.htaccess`; dipo ki o ro pe gbogbo ọna ti wa ni bo, akojọ gangan ibi ipamọ ati iṣeto olupin. Iṣilọ ilana apakan lọwọlọwọ tun tumọ si yiyipada gbogbo aaye si `public/` laisi awọn ipa-ọna ogún rẹ kii ṣe ilana imuṣiṣẹ pipe.

Awọn faili wọnyẹn ṣiṣẹ lori Apache nikan, ati pe nikan ti iṣeto ba gba laaye awọn atunkọ ninu iwe ilana yẹn. Lori Nginx wọn ko ṣiṣẹ. Lori Apache ti a tunto ni aṣiṣe wọn ko ṣiṣẹ. Ofin deny-all ti ko ṣiṣẹ ni iwaju iwe ilana akọọlẹ kan tumọ si pe ẹnikẹni le ka awọn akọọlẹ ohun elo rẹ, pẹlu awọn orukọ ẹrọ, awọn orukọ olumulo, ọrọ ibeere ati awọn alaye ikuna. Apache ṣe akọsilẹ ihuwasi atunkọ ti o nilo ninu [itọsọna `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Ṣe mejeeji ti iwọnyi:

**Ṣayẹwo awọn ọna ibi ipamọ ṣaaju gbigbe data.** Awọn ibi akọọlẹ jẹ atunto, ṣugbọn `include/global.php` ṣeto ipilẹ RRA si ilana `rra` fifi sori ẹrọ; ko si gbogboogbo RRA-liana UI eto. Eto ibi ipamọ ti a gbe sori lọtọ le ṣe itọju ọna ti a nireti yẹn, ṣugbọn gbigbe eto faili nikan ko ṣe idiwọ iraye si HTTP nipasẹ iwe ilana ti a nṣe tabi symlink. Ṣayẹwo awọn ọna orisun data ti o wa tẹlẹ, awọn igbanilaaye iṣẹ, awọn afẹyinti ati awọn kiko HTTP papọ. Maṣe gbe awọn igi kache laisi ijẹrisi bi awọn alabara wọn ṣe yanju awọn faili. Wo [Gbe lọ si ohun elo tuntun](/yo/guides/migrate-to-new-hardware/) ati [Ṣe igbesoke lailewu](/yo/guides/upgrade-safely/).

**Kọ awọn ọna ikọkọ lori olupin wẹẹbu.** Mu [apẹẹrẹ Nginx root-ibi ipamọ](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf) ti orisun mu si iṣaju URL gangan ati olupin; awọn ofin kiko gbọdọ gba iṣaju lori mimu PHP deede. Atokọ yii jẹ iranlọwọ akojo oja, kii ṣe iṣeto olupin ti o ṣetan:

| Ilana | Kini idi |
|---|---|
| `rra/` | Awọn faili wiwọn |
| `log/` | Awọn akọọlẹ ohun elo pẹlu ibeere ati awọn alaye aṣiṣe |
| `cache/` | Ṣayẹwo wiwọle dukia ti a pinnu; dènà ipaniyan ti PHP ni awọn ọna kache |
| `scripts/` | Koodu gbigba ko yẹ ki o ṣe iranṣẹ tabi ṣe taara lori HTTP |
| `cli/` | Awọn irinṣẹ laini aṣẹ ti ko ni ipinnu lati de ọdọ lori HTTP |
| `mibs/`, `contrib/`, `docs/` | Awọn orisun inu ati iwe |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Eto inu ohun elo, ipo ati awọn irinṣẹ |
| Awọn faili aami, awọn ifihan igbẹkẹle, PHP inu include/bootstrap | Metadata ibi ipamọ ati awọn aaye titẹsi inu |

Ṣetọju awọn ohun-ini gbogbogbo pataki bi `include/js` ati `include/themes`; idina gbooro lori gbogbo awọn includes le fọ UI. Daju awọn kiko nipa lilo awọn ọna idanwo ti ko lewu ati ṣayẹwo pe awọn idahun ko ṣe afihan orisun tabi awọn akoonu faili. Maṣe ṣe idanwo nipa gbigba awọn aṣiri gidi ninu ebute tabi awọn akọọlẹ.

Faili aṣayan tun wa ti awọn akọsori idahun aabo fun awọn ohun-ini aimi. Awọn idahun PHP ṣeto awọn akọsori tiwọn ninu koodu; awọn faili aimi ko ṣe bẹ ayafi ti o ba mu faili yẹn ṣiṣẹ tabi fi iru awọn itọsọna bẹẹ sinu iṣeto olupin.

Ilana Aabo Akoonu (CSP) jẹ atunto. Eto imulo iwe afọwọkọ aiyipada ngbanilaaye JavaScript laini laisi nonce, nitori awọn afikun gbarale rẹ. Ipo nonce ti o muna ti o han ninu awọn eto jẹ ijabọ-nikan. Imuse akọsori tun gba imuse `nonce` laibikita [iranlọwọ awọn eto agbalagba](https://github.com/kadupulhq/kadupul/issues/265). Imuse ati awọn ipo ijabọ-nikan yatọ; ṣayẹwo awọn akọsori ati ṣe idanwo gbogbo awọn oju-iwe/awọn afikun ti o nilo ṣaaju iyipada awọn ipo. Imuse ti a lo kii ṣe ẹri ti ibamu nonce pipe.

## Poller n ṣe awọn aṣẹ

Eyi ni apakan ti o yi awoṣe irokeke pada.

Gbigba kii ṣe SNMP nikan. Ọna titẹ sii data le ṣe alaye laini aṣẹ kan, ati pe poller n ṣiṣẹ rẹ. Laini aṣẹ naa wa ni ipamọ sinu kache poller ati pe a ṣe ni gbogbo aarin nipasẹ olugba bi olumulo ẹrọ ṣiṣe ti olugba. Awọn igbewọle olupin iwe afọwọkọ PHP lo ilana PHP ti n ṣiṣẹ gigun ti o yatọ. Aṣẹ ita ati awọn igbewọle olupin iwe afọwọkọ jẹ awọn ipa-ọna oriṣiriṣi; maṣe ro pe gbogbo iwe afọwọkọ nṣiṣẹ ninu olupin yẹn tabi olugba C ti ni ifọwọsi fun ibi ipamọ yii.

Ṣe itọju awọn igbanilaaye wọnyi bi awọn ipele iṣeto ipaniyan koodu ti o ni anfani pupọ. Awọn ipa gangan wọn dale lori awọn ẹya ti a mu ṣiṣẹ ati awọn idari afọwọsi:

| Igbanilaaye | Kini idi |
|---|---|
| Awọn ọna Titẹ sii Data | N ṣalaye laini aṣẹ taara |
| Gbe wọle Awọn awoṣe | Awoṣe ti a gbe wọle tabi package le gbe ọna titẹ sii data |
| Isakoso Ohun itanna | Koodu ohun itanna nṣiṣẹ ninu ohun elo naa |
| Awọn eto / Awọn ohun elo | Ṣe iṣakoso ọna si awọn alakomeji ti a paṣẹ |

Maṣe fun wọn si ẹnikẹni ti ko ni ikarahun tẹlẹ lori olupin yẹn. Olumulo kika-nikan ti o le wo awọn aworan apẹrẹ jẹ nkan ti o yatọ patapata, ati pe iyẹn ni ipa ti o yẹ ki o fẹrẹ jẹ gbogbo akọọlẹ.

Awọn iṣakoso meji wa ati pe mejeeji tọ lati lo:

**Awọn ihamọ ohun kikọ pataki (Metacharacters).** Awọn ohun kikọ ikarahun pataki ninu awọn okun aṣẹ titẹ sii data ni a dinamọ nipasẹ aiyipada. Eto kan wa lati gba wọn laaye, eyiti o wa fun awọn asọye agbalagba ti o lo awọn paipu ikarahun. Fi silẹ ni pipa. Ti o ba ni awọn asọye ti o nilo rẹ, gbe paipu naa sinu iwe afọwọkọ labẹ ilana awọn iwe afọwọkọ ki o pe iwe afọwọkọ naa.

**Atokọ funfun titẹ sii (Input Whitelist).** Faili kan ti a npè ni faili iṣeto, ti o mu awọn okun aṣẹ ti a fọwọsi nipasẹ ọna titẹ sii data mu. Nigbati a ba ṣeto eyi, awọn aworan apẹrẹ ati awọn orisun data ko le ṣẹda lati ọna titẹ sii data ti okun aṣẹ rẹ ko si ninu atokọ naa. Yiyipada aṣẹ ti a fọwọsi jẹ ki o kuna ni lafiwe titi ti atokọ funfun ti a ṣe atunyẹwo yoo fi ni imudojuiwọn. Tun-fọwọsi jẹ igbesẹ laini aṣẹ kan, eyiti o jẹ aaye akọkọ: o nilo iraye si ikarahun lori olupin naa, kii ṣe igba iṣakoso ninu aṣawakiri kan.

Nigbati a ba tun kache poller ṣe ayẹwo naa yoo tun ṣiṣẹ. Titẹ sii data ti o kuna ninu eyi ko ṣe agbejade awọn ohun kan poller, ati pe eyikeyi ori ila ti o fi silẹ ni a yọkuro lori atunkọ/fifọ ti a ṣe atẹle. Eyi n ṣakoso ẹda ati olugbe kache; kii ṣe ilana ifagile lẹsẹkẹsẹ fun iṣẹ ti n lọ tẹlẹ tabi ẹri pe gbogbo olugba n tun gbe atokọ funfun ti o yipada ṣaaju ipaniyan kọọkan. Daju ipo kache ti a ṣe ati ihuwasi olugba lẹhin iyipada eto imulo.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

`--update` ti ko ni iwọn gba awọn asọye aṣẹ lọwọlọwọ sinu atokọ funfun; maṣe lo o bi aropo fun atunwo wọn. Daabobo atokọ funfun ati ilana obi rẹ lati awọn kikọ olumulo-iṣẹ. O duro ni pipa titi ti a fi tunto. Wo [Kọ iwe afọwọkọ gbigba data](/yo/guides/write-a-data-collection-script/) fun yiyan ati awọn alaye iṣelọpọ.
Eyi n pọ si idiyele ti adehun iṣakoso ẹgbẹ-aṣawakiri, nitori fifi aṣẹ tuntun sinu ikojọpọ ni bayi tun nilo iraye si kikọ eto faili lori olupin poller. Eyi tun kii ṣe aropo fun didaduro ẹniti o ni awọn igbanilaaye ninu tabili loke, nitori ikọlu ti o le de okun aṣẹ ti a fọwọsi tẹlẹ ko nilo lati ṣafikun tuntun kan.

## Ijeri

Awọn ọna mẹrin wa. Ohun ti o wa da lori awọn amugbooro PHP ti o wa.

| Ọna | Nibo ti a ti ṣayẹwo awọn olumulo | Awọn akọsilẹ |
|---|---|---|
| Ti a ṣe sinu | Aaye data agbegbe | Awọn ọrọigbaniwọle, eto imulo ati titiipa gbogbo ni a mu ni agbegbe |
| Web Basic | Olupin wẹẹbu | Ohunkohun ti olupin ba sọ pe olumulo jẹ, Kadupul gbẹkẹle |
| LDAP | Ilana kan | Nilo itẹsiwaju PHP LDAP |
| Ọpọlọpọ awọn ibugbe LDAP/AD | Ọpọlọpọ awọn ilana | Kanna ibeere |

Oluyan awọn eto n ṣafihan awọn ọna ti a fọwọsi wọnyi, kii ṣe ipo ogún odo. Ibẹrẹ ijẹrisi n gbiyanju lati jade iṣeto ti ko ni ifọwọsi atijọ pada si ijẹrisi agbegbe, ṣugbọn awọn oluranlọwọ aṣẹ ipele kekere tun ni awọn ẹka ipo-odo. Daju ọna ti o fipamọ, idanimọ ti a tunto ati awọn ipa-ọna ti o ni aabo gangan dipo ki o ṣe itọju aṣayan UI ti ko si bi ẹri agbaye.

Awọn nkan lati ṣayẹwo:

- **Web Basic n fi afọwọsi idanimọ le lọwọ.** Nigbati a ba yan ipo yii Kadupul n ka awọn oniyipada idanimọ ti olupin jẹrisi ati pe o tun n fi maapu akọọlẹ mulẹ, ipo ti o ṣiṣẹ ati awọn ofin aṣẹ. Idanimọ ti o padanu kii ṣe alakoso laifọwọyi. Tunto olupin lati jẹrisi gbogbo ipa-ọna ti a pinnu ati ṣe idiwọ alabara lati pese awọn oniyipada idanimọ ti o gbẹkẹle; jẹrisi awọn ipa-ọna aworan/okeere ati ihuwasi alejo ti a pinnu lọtọ.
- **Atilẹyin fun "Jẹ ki n wọle"** wa ni titan nipasẹ aiyipada. Aami ti o tọ ni a ṣẹda nigbati olumulo ba yan aṣayan yẹn lẹhin ijẹrisi, kii ṣe laifọwọyi fun gbogbo igba. O pari lẹhin ọjọ aadọrun ti aiṣedeede. Lori fifi sori ẹrọ ti nkọju si intanẹẹti, pinnu mọọmọ boya o fẹ.
- **Ṣeto olumulo alejo si nobody** ayafi ti o ba fẹ pataki lati gba wiwo aworan apẹrẹ ailorukọ laaye. Ko ṣeto si eyikeyi olumulo nipasẹ aiyipada, eyiti o jẹ aiyipada ti o pe; jẹrisi pe ko yipada lakoko iṣeto.
- **Fi Ijeri Ifosiwewe Pupọ (MFA) si iwaju rẹ.** Ko si MFA ninu ohun elo naa. Aṣoju ti o mọ idanimọ tabi ẹnu-ọna SSO ni ibiti o lọ.

## Awọn aaye ipari olugba data latọna jijin

Ti o ba ṣiṣe awọn olugba latọna jijin, fifi sori aarin n ṣafihan aaye ipari ti wọn pe. Eyi ko ni ifọwọsi pẹlu igba olumulo kan. O fun laṣẹ nipa yiyan adirẹsi pipe ati ibaamu rẹ si awọn orukọ olupin ti awọn olugba ti a forukọsilẹ, fifi awọn ikuna wọle labẹ ẹka aabo.

Awọn nkan meji waye. Ni akọkọ, aaye ipari yẹn ko gbọdọ wa lati intanẹẹti gbogbo eniyan; fi opin si lori olupin wẹẹbu si awọn adirẹsi olugba. Ni ẹẹkeji, adirẹsi alabara ti o ṣayẹwo jẹ adirẹsi ti o yo lati ibeere naa, nitorinaa igbẹkẹle akọsori ti a firanṣẹ ti a tunto tẹlẹ kan nibi paapaa. Gbigbekele awọn akọsori ti o ko ṣakoso ngbanilaaye olupe kan lati beere adirẹsi olugba kan.

Lọtọ, eto ti o fun laaye olupin aarin awọn iwe-ẹri ti ara ẹni ati awọn aiṣedeede orukọ olupin nigbati o n ba olugba sọrọ wa ni titan nipasẹ aiyipada. Ṣe ifilọlẹ awọn iwe-ẹri gidi fun awọn olugba rẹ ki o pa eyi.

## Atokọ ayẹwo ti o kere julọ

1. TLS ti pari, HTTP tun darí ṣaaju ki o to wọle, ipo PHP HTTPS ti a tunto nipasẹ olupin ti o gbẹkẹle, ati awọn kuki Secure ti ni idaniloju. Awọn akọsori adirẹsi alabara ni opin si awọn ti aṣoju ṣeto ati nu nikan.
2. Ọrọigbaniwọle abojuto aiyipada ti yipada ati jẹrisi. Titiipa akọọlẹ wa ni titan.
3. Awọn ifunni aaye data ti a ṣe atunyẹwo fun fifi sori ẹrọ, itọju ati awọn ipa olugba; iraye si agbegbe aago ti ni idaniloju ati iraye si nẹtiwọki aaye data ni opin si awọn alabara ti o nilo.
4. Awọn ọna ibi ipamọ ti ni idaniloju, awọn ilana ikọkọ ati metadata ti kọ lori olupin wẹẹbu, ati awọn ohun-ini aimi pataki tun ṣiṣẹ.
5. Faili iṣeto ko le kọ ni akoko ṣiṣe. Faili aṣiri CSRF, ti o ba lo, wa ni ita gbongbo iwe aṣẹ.
6. Awọn ọna titẹ sii data, gbigbe wọle awoṣe ati iṣakoso ohun itanna ko fun ẹnikẹni laisi ikarahun lori olupin poller. Awọn ihamọ ohun kikọ pataki wa ni titan. Atokọ funfun titẹ sii ti a tunto.
7. Awọn aaye ipari olugba latọna jijin ti ni ihamọ nipasẹ adirẹsi. Ayẹwo ijẹrisi wa ni titan.
8. MFA ninu aṣoju kan ni iwaju ohun gbogbo.
