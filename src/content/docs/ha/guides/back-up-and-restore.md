---
title: Ajiye da dawo da bayanai
description: Dole ne a ɗauki abubuwa uku tare don samun cikakken ajiya, kuma tsarin mayar da su yana da muhimmanci.
banner:
  content: Kadupul yana matakin kafin alfa. Tabbatar da waɗannan hanyoyi a wani keɓaɓɓen tsarin gwaji. Wannan fassarar daftari ce, tana jiran dubawar mai ƙwarewar harshen.
sidebar:
  order: 7
---

:::caution[Tabbatar kafin amfani]
Ana iya samun lambar tushe, amma babu ingantaccen sakin Kadupul ko hanyar ƙaura da ake tallafawa. Gwada waɗannan matakai a kan kwafin da aka keɓe tare da tanadin madadin bayanai kafin dogara da su. Duba [halin aikin](/ha/project/status/).
:::

Cikakken tsarin dawo da bayanan Kadupul yana da sassa uku. Adana wani ɓangare na iya dawo da saiti ko auna bayanai, amma ba zai iya sake gina dukkan shigarwar tsarin ba.

| Sashe | Abin da yake ɗauke da shi | Inda yake zama |
|---|---|---|
| Ma’ajiyar bayanai | Na’urori, samfura, masu amfani, izini, cache na poller, da hanyar kowane fayil na RRD | MySQL ko MariaDB |
| Fayilolin RRD | Ma’aunin da aka riƙe da bayanan tarihin da aka haɗa | Kundin adireshi na RRA, wanda asali yake `rra/` a ƙarƙashin shigarwa |
| Saiti | Bayanan shiga ma’ajiyar bayanai, hanyoyi, saitin mai tattara bayanai, mambobin ƙari da lambar rubutun aiki | `include/config.php`, fayil ɗin saitin spine, `plugins/`, `scripts/`, `resource/` |

## Abin da ajiyar ma’ajiyar bayanai kaɗai za ta iya dawo da shi

Ma’ajiyar bayanai tana ɗauke da ma’anar jadawali da saitin sa ido, yayin da fayilolin RRD ke ɗauke da bayanan tarihin jadawali. Idan aka kunna Boost, sabbin karatun bayanai za su iya zama a layukan jiran aiki na ma’ajiyar bayanai har sai an zubar da su zuwa fayiloli. Adana waɗannan layukan jiran aiki a matsayin ɓangaren ajiyar ma’ajiyar bayanai. Duba [Tsarin gini](/ha/concepts/architecture/).

Dawo da ma’ajiyar bayanai kaɗai zai ba ka tsarin da ya san game da na’urori ɗari huɗu, yana da kowane jadawali a bayyana, amma yana zana kowannensu a banza ba tare da bayanai ba. Zai sake fara tattara bayanai daga lokacin da ka kunna poller, kuma tarihin ya ɓace gaba ɗaya.

## Abin da ajiyar RRD kaɗai ta rasa

Fayil ɗin RRD yana ɗauke da sunayen hanyoyin bayanai, ma’anar tarihin ajiya da ƙimomi, amma ba shi da cikakken bayanin na’urar Kadupul, tambayoyi, jadawali da izini da ake buƙata don sake haɗa waɗannan ƙimomi da manhajar.

Hanyar haɗa "bytes da suka shiga tashar 3 ta switch 12" da wata hanya a kan diski tana cikin ma’ajiyar bayanai ne, a wani shafi na asalin bayanan. Idan ka dawo da bishiyar fayiloli kaɗai za ka sami dubban fayiloli cike da lambobi, ba tare da wata hanya ta gano ko wanne ne na wani ba sai dai ta hanyar sake binciken fasahar su da hannu.

Su biyun ajiya ɗaya ne. Ku ɗauke su a haka.

## Daidaito tsakanin su biyun

A nan ne yawancin hanyoyin ajiya ke samun kuskure a hankali.

Poller yana rubutu a fayilolin RRD akai-akai. Fayil ɗin da aka kwafa yayin da ake sabuntawa yana iya ɗauka a tsakiyar rubutu. Ana rubutu a ma’ajiyar bayanai a lokaci guda. Idan ka fitar da ma’ajiyar bayanai da ƙarfe 02:00 kuma ka fara kwafin fayiloli da ƙarfe 02:20, ɓangarorin biyu suna bayyana lokuta daban-daban ne, kuma duk wani tushen bayanai da aka ƙirƙira ko aka share a tsakanin wannan lokaci ba zai daidaita ba.

Rubutun RRD da aka jinkirta yana ƙara sa lamarin ya zama mai wuyar sha’ani da ban sha’awa. A wannan yanayin poller ba ya rubuta fayilolin RRD a kowace wucewa. Sakamako yana taruwa a cikin tebur mai karko na ma’ajiyar bayanai kuma ana zubar da su da yawa daga baya. Don haka ma’ajiyar bayanai za ta iya wuce fayilolin RRD da tazara har zuwa lokacin zubar da bayanai, tana ɗauke da ma’auni na ainihi waɗanda ba sa kan diski a wani wuri dabam.

Zaɓi ɗaya daga cikin waɗannan. Bisa tsarin fifiko:

**Daukar hoto mai haɗin kai.** Yi amfani da hanyar ajiya ko tsayar da aiki da injin ma’ajiyar bayanai ke tallafawa kuma a haɗa shi da ɗaukar hoton duk ajiyar RRD da saitin manhaja. Daukar hoton tsarin fayiloli kaɗai ba ya tabbatar da daidaito a kan faifai daban-daban, masu tattara bayanai na nesa, layukan jiran aiki ko ma’ajiyar bayanai mai aiki.

**Ajiyar hankali da aka tsayar.** Kashe masu fara aiki da aka tsara da sauran masu samarwa, jira masu tattara bayanai da ke aiki su gama, sannan a zubar da rubutun da aka jinkirta kuma a jira ma’aikatan zubarwa. Tsayar da sauye-sauyen saiti, gyara da sauran masu rubutun RRD a duk lokacin ɗaukar ajiya. Tsayar da tattara bayanai na iya barin samfuran da suka ɓace; bayyanarsu ta dogara ne kan bugun zuciya da haɗewar bayanai.

Kafin gudanar da misalin, kammala waɗannan matakai na tsayar da aiki kuma a duba yanayin layi/ma’aikaci. `poller_boost.php --force` da ya dawo da sifili kaɗai ba tabbacin cikar zubar da bayanai ba ne: aikin Boost da ya riga ya yi rajista zai iya sa ya fita ba tare da yin aikin ba. Haɗa kowane sabis na rrdcached ko ajiyar nesa daban.

Wannan misalin Bash yana ɗauka cewa ana amfani da ajiyar cikin gida, asusun ma’ajiyar bayanai da aka saita a cikin fayil ɗin zaɓin abokin ciniki na sirri, da kundin RRA mai ɗauke da duk RRDs da ake sarrafawa. Sauya kowace hanya. Bincika hanyoyin RRD na asali, maƙasudin symlink, saitin waje da masu tattara bayanai na nesa kuma a ɗauke su daban ma.

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

Rumbun ajiyar manhajar ya haɗa da saiti da lambar da ta dace. Rubuta sigar tushe, sigogin ma’ajiyar bayanai da RRDtool, ainihin hanyoyin ajiya da halin tsayar da masu rubutu/zubarwa tare da rukunin. Misalin yana cire rajistan ayyukan yau da kullum, cache da bayanan Git; duba waɗannan keɓancewa don shigarwar ku.

Rukunin da aka yi nasarar ɗauka kuma aka duba checksum ɗinsa ne kaɗai zai karɓi sunan kundin ƙarshe. Umurnin da ya gaza zai iya barin fayil ɗin da bai cika ba a cikin `.partial-*`; `set -e` yana dakatar da umarnai na gaba amma ba ya cire abin da aka riga aka fitar. Kada a ɗaga wannan kundin zuwa cikakken ajiya. Checksums suna gano canje-canje na gaba ne, ba cikar aiki na hankali ba; har yanzu ana buƙatar gwajin dawo da bayanai.

`--single-transaction` yana rufe tebura masu mu’amala ne, ba cikakken hoto na teburan plugin marasa mu’amala ko canje-canjen schema na lokaci ɗaya ba. Tsayar da masu rubutu da canje-canjen schema, ko amfani da hanyar ajiya da ta dace da injin. Ci gaba da tattara bayanai ne kawai bayan an tabbatar da cewa an gama ɗauka kuma ana iya amfani da ajiya. Duba [bayanin mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) don bukatun mu’amala da izini. Ana bibiyar kura-kuran tsarin da ya gabata a [website #12](https://github.com/kadupulhq/website/issues/12).

**Karɓi bambancin lokaci kuma a rubuta shi.** Duk ɓangaren da ka fara ɗauka shi ne tsoho, kuma babu tsarin da zai sa rukunin da ke raye ya daidaita da kansa. Rubuta lokacin da aka ɗauka; wannan shine abin da ke sa sakamakon ya zama mai iya dawowa.

Idan ka fitar da ma’ajiyar bayanai da farko kuma ka kwafi fayiloli na biyu, fayilolin sun fi sabuntawa. Asalin bayanan da aka share a cikin wannan lokaci har yanzu yana cikin fitarwar amma fayil ɗinsa ya tafi, yana barin manuni wanda poller zai sake ƙirƙira. Asalin bayanan da aka ƙirƙira a cikin wannan lokaci ya zo a matsayin fayil ɗin da ma’ajiyar bayanai ba ta sani ba, wanda ba ya aiki.

Idan ka kwafi fayiloli da farko kuma ka fitar da ma’ajiyar bayanai na biyu, ma’ajiyar bayanan ta fi sabuntawa. Asalin bayanan da aka ƙirƙira a cikin wannan lokaci yana cikin fitarwar ba tare da wani fayil a bayansa ba, wanda poller ke sake ƙirƙira a fanko.

Kowane tsari na iya rasa tarihin da ya gabaci lokacin idan aka share fayil ɗin da ake buƙata kafin a kwafi shi. Hakanan yana iya ɗaukar fayil ɗin da aka rubuta rabi ko samfuran layin jiran aiki marasa daidaito. Rubuta bambancin yana nuna iyaka ne; ba ya sa rukunin da bai daidaita ba ya cika ko ba da garantin dawo da bayanai.

## Abin da ke cikin ajiyar da ba ka yi tunani a kansa ba

Bayanan shiga na’urori suna cikin ma’ajiyar bayanai a bayyane a matsayin rubutu. Cache na poller yana ɗauke da kalmomin sirri na SNMP da sunayen masu amfani na SNMPv3, kalmomin sirri da passphrases a matsayin shafi bayyananne, saboda mai tattara bayanai yana buƙatar su a kowane lokaci. Fayil ɗin saiti yana ɗauke da kalmar sirri ta ma’ajiyar bayanai.

Don haka ajiyar Kadupul rumbun adana bayanan sirri ne ga kowace na’ura da kake sa ido a kanta. Rufa shi da ɓoye yayin ajiya, taƙaita wanda zai iya karanta shi, kuma kada a tura shi zuwa babban fayil ɗin raba bayanai na kowa da kowa.

## Tsarin dawo da bayanai

Tsari yana da muhimmanci saboda kowane mataki ya dogara ne da wanda yake gabansa.

1. **Dawo da saiti da farko.** Ba tare da bayanan shiga ma’ajiyar bayanai da hanyar RRA ba, babu wani abin da za a iya dubawa. Idan za a dawo da shi a wata na’ura daban, gyara hanyoyin a yanzu maimakon a bari sai daga baya.

2. **Dawo da bishiyar RRD.** Sanya shi a inda saitin ya ce yana nan. Duba mallaka da yanayin izini: poller yana rubuta waɗannan fayiloli a matsayin mai amfani da poller, kuma yanar gizo tana karanta su a matsayin mai amfani da sabar yanar gizo. Mayar da ajiya da ke riƙe abun ciki amma ba mallaka ba yana samar da tsarin da ke zana jadawali da kyau amma ba ya tattara sabon abu.

3. **Dawo da ma’ajiyar bayanai.** Teburin siga a cikin fitarwar dole ne ya dace da lambar da kake mayar da shi a kai. A bar dukkan masu farawa da masu rubutu a kashe har sai an duba abubuwan da aka dawo da su tare. Fitarwa daga tsohuwar siga da aka mayar a kan sabuwar lamba tana tura yanar gizo zuwa mai girkawa, wanda shine ainihin aikin da ya dace amma ba abin da kake so ba a tsakiyar dawo da bayanai. Dawo da lambar da ta dace da farko.

4. **Sake gina cache na poller.** Cache abu ne da aka samo daga wani wuri, kuma dawo da ajiya shine ainihin yanayin da zai iya zama tsoho. Sake gina shi yana ɗaukar gudu ɗaya kawai kuma yana cire ɗaukacin rikitarwa na alamomin kuskure.

5. **Fara poller, sannan a duba fayil guda.** Tabbatar cewa lokacin sabuntawa na ƙarshe na fayil ɗin RRD yana motsawa bayan gudu na farko. Idan jadawali sun cika har zuwa lokacin dawo da ajiya sannan suka zama fanko a kwance, duba sakamakon tattara bayanai, layukan aiki, lokaci, hanyoyi da izini. Jadawali a kwance kaɗai ba ya gano dalilin.

## Tarkuna

**Fayilolin RRD suna ƙin sabuntawa a baya.** Fayil ɗin RRD ba zai karɓi samfurin a ko kafin lokacin da yake ɗauke da shi ba. Mayar da tsohon rukuni na fayiloli a kan sabuwar ma’ajiyar bayanai ba zai cika samfuran da suka ɓace da kansa ba. Layukan jiran aiki da aka riƙe ko wasu hanyoyin na iya ƙunsar karatun da za a iya dawo da su, amma sake kunna su yana buƙatar ingantaccen bincike daban da tsarin lokaci. Idan babu waɗannan karatu, tattara bayanai zai ci gaba tare da gibi. Wannan kuma shine dalilin da ya sa ba za ka iya haɗa ajiya biyu ta hanyar kwafin fayiloli a tsakanin su ba.

**Duba ko hanyoyin da kuka adana an canza su zuwa alamomi kafin sake rubuta wani abu.** Tushen bayanan da aka ƙirƙira suna adana hanyar a matsayin `<path_rra>/name.rrd`, kuma ana faɗaɗa alamar a lokacin karantawa daga saitin hanyar RRD. Ga waɗannan, motsa shigarwa yana nufin canza saitin da sake gina cache na poller, ba sake rubuta layuka ba. Hanyoyin da aka shigar da hannu ana adana su a zahiri kuma suna buƙatar sake rubutawa. Duba kafin ka gudanar da sabuntawa a kan teburin, saboda sake rubuta hanyoyin da aka yi wa alama zuwa cikakkun hanyoyi shine canjin da ke sa matsawa na gaba ya zama da wuya.

**Masu tattara bayanai na nesa suna da nasu fayil ɗin saiti.** Kowane ɗayan yana ɗauke da bayanan shiga ma’ajiyar bayanai da lambar mai tattara bayanai. Ba sa cikin babban ajiyar ma’ajiyar bayanai. Ɗauke su a kowace na’ura dabam.

**Bayanai na plugin suna cikin ma’ajiyar bayanai ɗaya.** Plugins suna ƙirƙirar nasu tebura a lokacin shigarwa, don haka cikakken fitarwar ma’ajiyar bayanai ya rufe su. Lambar plugin ba ta cikin ma’ajiyar bayanai. Idan ka mayar da ma’ajiyar bayanai ba tare da kundin `plugins/` mai dacewa ba, shigarwar za ta kashe abin da ba za ta iya samu ba.

**Ajiyar da ba ka dawo da ita ba hasashe ce kawai.** Gwada dawo da shi a cikin wani tsari na daban a kan jadawalin aiki. Yanayin gazawar da wannan ke kamawa mafi yawa ba lalacewar bayanai ba ce; ajiya ce da ta kasance tana ɗaukar ɓangare ɗaya kawai daga cikin sassa ukun.
