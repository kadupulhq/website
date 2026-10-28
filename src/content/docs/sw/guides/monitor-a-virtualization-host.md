---
title: Fuatilia mwenyeji wa uboreshaji pepe
description: Kile ambacho hypervisor hufichua kupitia SNMP, kile kinachosafirishwa kwa ajili ya ESXi, na kwa nini kuhesabu wageni, CPU na kumbukumbu kwenye mazingira ya mtandao pepe ni ngumu zaidi kuliko inavyoonekana.
banner:
  content: Kadupul iko katika hatua ya awali kabisa (pre-alpha). Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Hili ni rasimu ya tafsiri inayosubiri ukaguzi kutoka kwa mzungumzaji fasaha.
sidebar:
  order: 27
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo wa chanzo unapatikana, lakini hakuna toleo linalotumika la Kadupul au njia ya uhamiaji iliyothibitishwa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Kifurushi kilichosafirishwa cha ESXi hukusanya vipimo vya mpangishaji na hesabu za orodha ya wageni. Haitoi vipimo vya CPU ya kila mgeni, kumbukumbu au mzozo. Thibitisha vitu vilivyofichuliwa na toleo lako la hypervisor kabla ya kuchagua grafu.

## Kinachosafirishwa

Kiolezo kimoja cha kifaa cha hypervisor kinasafirishwa: **ESXi Device**. Ni kifurushi cha kifaa, kwa hivyo `install/templates/ESXi_Device.xml.gz` ina hati zake na faili za maswali ya data. Fuata [Ingiza na safirisha nje violezo](/sw/guides/import-and-export-templates/) na uthibitishe kuwa uingizaji umekamilika, ikijumuisha upelekaji wa faili. Chagua kiolezo cha kifaa, kagua ugunduzi, na uunde waziwazi grafu unazotaka; kuingiza kifurushi au kuunganisha kiolezo cha kifaa pekee hakuziundi.

| Kinachosafirishwa | Kusudi |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Hugundua vichakataji na kusoma mzigo wa kila kichakataji |
| `resource/snmp_queries/esxi_hw.xml` | Hugundua vipengele vya maunzi na kusoma hali yao |
| `resource/snmp_queries/interface.xml` | Swali la kawaida la takwimu za kiolesura |
| `resource/script_server/host_disk.xml` | Sehemu zilizowekwa, kupitia jedwali la uhifadhi la Host Resources |
| `scripts/ss_esxi_vhosts.php` | Imefungwa ndani ya `install/templates/ESXi_Device.xml.gz`; huhesabu wageni, wageni waliowashwa, na hali ya zana za wageni |
| `scripts/ss_multicpu_avg.php` | Hufanya wastani wa mzigo kwa kila kichakataji kuwa nambari moja |
| `scripts/ss_hstats.php` | Husoma takwimu za upigaji kura ambazo Kadupul tayari inashikilia kwa kifaa |
| `scripts/ss_host_disk.php` | Hurudisha swali la sehemu za diski |

Hakuna kifurushi maalum cha kifaa kinachosafirishwa kwa Hyper-V, KVM/libvirt, Xen au Proxmox katika ununuzi huu. Violezo vya jumla vya Linux/Windows vinaweza kufunika vipimo vya mpangishaji vinavyotumika na mawakala wao; mkusanyiko maalum wa hypervisor unahitaji violezo na wakusanyaji wanaofaa. Tazama [Andika hati ya kukusanya data](/sw/guides/write-a-data-collection-script/).

## Washa wakala kwanza

Kagua usanidi uliopo wa wakala na utumie maagizo ya toleo lako la ESXi. Vidokezo vya kifurushi vinajumuisha uwekaji upya wa kiwandani; si sharti la kawaida la awali na ingefuta usanidi uliopo wa SNMP. Kwa usanidi unaotegemea jamii, amri zifuatazo huweka maadili ya wakala; badilisha mifano na uhifadhi jamii zozote zilizopo zinazohitajika wakati wa kuweka orodha ya jamii.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Amri ya kwanza inaonyesha usanidi; ya mwisho inamwezesha wakala. Chaguo la jumuiya hubadilisha orodha yake iliyosanidiwa. Angalia ufikiaji unaohitajika wa ngome kutoka kwa mpigakura na shauriana na [marejeleo ya amri ya ESXCLI SNMP](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html). Amri hizi husanidi upigaji kura unaotegemea jamii; hazisanidi SNMPv3. Thibitisha kutoka kwa mashine ambayo mpigakura anafanya kazi kabla ya kuongeza kifaa.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Ikiwa ya kwanza inafanya kazi na ya tatu hairudishi chochote, kagua kosa la SNMP, sera ya ufikiaji na usaidizi wa wakala; kutembea tupu pekee hakutambui sababu. Hati ya mgeni iliyojumuishwa hutumia SNMPv1, kwa hivyo uchunguzi uliofanikiwa wa v2c hauthibitishi njia yake ya ukusanyaji. Matembezi tupu ya wageni hutoa hesabu sifuri, si lazima mapengo ya grafu; tazama [hitilafu ya matokeo tupu](https://github.com/kadupulhq/kadupul/issues/245).

## Kile ambacho mwenyeji hufichua

| Eneo | Mti mdogo | Inakupa |
|---|---|---|
| Vichakataji | `.1.3.6.1.2.1.25.3.3.1` | Mzigo kwa kila kichakataji kilichofichuliwa na wakala |
| Vipengele vya maunzi | `.1.3.6.1.2.1.25.3.2.1` | Faharasa ya sehemu, maelezo na hali |
| Hifadhi | `.1.3.6.1.2.1.25.2.3.1` | Hifadhi za data na mifumo ya faili ya ndani, jinsi wakala anavyochagua kuripoti |
| Violesura | `.1.3.6.1.2.1.2` na `.1.3.6.1.2.1.31` | Trafiki, hitilafu, hali |
| Orodha ya wageni | `.1.3.6.1.4.1.6876` | Hali ya nguvu ya kila mgeni na hali ya zana za wageni |

Nne za kwanza ni jedwali za kawaida za Host Resources na kiolesura, sawa na zile ambazo mwenyeji wa Linux hujibu nazo. Tazama [Fuatilia seva ya Linux](/sw/guides/monitor-a-linux-server/) jinsi zinavyofanya kazi na jedwali lipi la diski la kupendelea.

Ya tano ni mti mdogo wa muuzaji unaotumiwa na hati iliyosafirishwa ya kuhesabu wageni.

## Violezo vya grafu

| Grafu | Chanzo | Inasoma |
|---|---|---|
| ESXi - CPU | Swali la data | Mzigo kwa kichakataji kimoja kilichogunduliwa |
| ESXi - MultiCPU Average | Hati | Wastani wa mzigo wa kila kichakataji |
| ESXi - Hardware | Swali la data | Hali ya sehemu moja iliyogunduliwa |
| ESXi - VHosts | Hati | Hesabu za wageni na hali ya zana za wageni |
| Host MIB - Processes | OID iliyowekwa | Hesabu ya mchakato kwenye mpangishaji |
| Host MIB - Logged in Users | OID iliyowekwa | Hesabu ya kikao kwenye mpangishaji |
| Device - Uptime | Hati | Muda wa kufanya kazi kama Kadupul ilivyorekodi mara ya mwisho |
| Device - Polling Time | Hati | Muda ambao Kadupul ilichukua kupiga kura kifaa hiki |
| Grafu za kiolesura | Swali la data | Trafiki, hitilafu, pakiti, hali kwa kila kiolesura |

Swali la kichakataji husoma mzigo kwa kila ingizo lililogunduliwa. Usifikirie idadi ya safu mlalo inalingana na hesabu ya nyuzi za maunzi ya mpangishaji: muundo wa faharasa uliowekwa kwenye vifurushi unakubali faharasa za tarakimu moja au mbili pekee na hukataa 100 au zaidi, hata kwenye mpangishaji aliye na CPU chache. Linganisha ugunduzi na matembezi ghafi; tazama [hitilafu ya faharasa ya CPU](https://github.com/kadupulhq/kadupul/issues/246). Hati ya wastani hutembea kwa kujitegemea kwenye mizigo ya kichakataji na hufanya wastani wa safu zilizorudishwa.

Device - Uptime na Device - Polling Time husoma rekodi ya kifaa iliyohifadhiwa ya Kadupul. Msaidizi wa muda wa kufanya kazi hurudisha muda uliohifadhiwa wa SNMP bila kuelezea muda uliopita; muda wa kupiga kura unaelezea kazi ya ukusanyaji ya Kadupul. Thamani ya zamani iliyohifadhiwa haithibitishi ufikiaji wa sasa. Ikiwa ukusanyaji utakoma, wasaidizi hawa hawatoi sampuli mpya.

## Matatizo ya kuhesabu

Hii ndiyo sehemu inayofanya utendakazi pepe kuwa tofauti na seva halisi, na hakuna hata moja inayotatuliwa na kiolezo cha grafu.

**Wageni huhama.** Mgeni anayehamia mpangishaji mwingine hupotea kutoka kwa orodha ya mpangishaji wa kwanza na kuonekana kwenye ya pili. Sampuli zilizoratibiwa kwa kujitegemea zinaweza kuhesabu mara mbili au kuacha mgeni huyo kwa muda. Mabadiliko ya hesabu pekee hayathibitishi uhamiaji: tumia vitambulisho na matukio ya orodha ya hypervisor ili kuyaelezea.

**Rasilimali zinashirikiwa, kwa hivyo ugawaji wa kila mgeni ni makadirio.** Mwenyeji anaripoti mzigo wa kichakataji halisi. Hairipoti ni mgeni gani aliyeisababisha. Kugawanya CPU ya mpangishaji kwa hesabu ya wageni hutoa nambari ambayo ni sahihi kimahesabu na haijibu swali ambalo mtu yeyote aliuliza.

**Kujitolea kupita kiasi (Overcommit) hufanya ugawaji na matumizi kuwa kiasi tofauti.** CPU pepe zilizokabidhiwa zinaweza kuzidi cores halisi, na kumbukumbu iliyokabidhiwa inaweza kuzidi kumbukumbu halisi, kwa makusudi. Grafu ya rasilimali zilizokabidhiwa inaelezea ugawaji badala ya mahitaji yaliyopimwa. Ilinganishe na uwezo halisi, mipaka iliyosanidiwa na matumizi halisi.

**Mzozo hauonekani kwenye meza hizi.** Vipimo vinavyokuambia mgeni ananyimwa rasilimali, muda aliotumia kusubiri kichakataji halisi na kumbukumbu ambayo mwenyeji alidai kutoka kwake, haviko katika kile ambacho kiolezo hiki hukusanya. Mwenyeji aliye na asilimia 60 ya CPU na wageni wanaogombea sana anaonekana kufanana hapa na mwenyeji aliye na asilimia 60 ya CPU na wenye furaha.

**Vipimo vya mgeni na mwenyeji hujibu maswali tofauti.** Utumiaji wa mgeni pekee hauwezi kuelezea ucheleweshaji wa upangaji wa mwenyeji. Husisha vipimo vya mgeni/programu na vipimo vya mzozo wa hypervisor badala ya kupata maelezo kutoka kwa mzigo wa mpangishaji.

### Nini cha kufanya badala yake

| Swali | Mahali jibu lilipo |
|---|---|
| Je, mpangishaji amejaa | Mzigo wa kichakataji cha mpangishaji, kutoka kwa mpangishaji |
| Je, mgeni amejaa | Ndani ya mgeni, pamoja na kipimo cha mzozo ambacho hypervisor inashikilia |
| Wageni wangapi wanakimbia | Orodha ya wageni wa mpangishaji, kama hesabu |
| Je, mali iko juu ya uwezo | Si kutoka kwa grafu hizi. Inahitaji data ya uwekaji ambayo mwenyeji haifichui |
| Je, mgeni alihama | Vitambulisho vya orodha ya Hypervisor na matukio ya uhamiaji; hatua za kuhesabu pekee hazitoshi |

Fuatilia wageni kama vifaa vyao wenyewe kwa chochote kuhusu mgeni, na umfuatilie mwenyeji kwa chochote kuhusu mpangishaji. Epuka kujenga grafu za kila mgeni kutoka kwa nambari za kiwango cha mpangishaji: zimetolewa, zinaonekana kuwa za mamlaka, na zina makosa kwa njia ambazo hakuna mtu anayeweza kuziona baadaye.

## Mitego katika hesabu ya wageni iliyosafirishwa

Hati ya hesabu ya wageni inafaa kueleweka kabla ya kutegemea matokeo yake.

**Hutembea na toleo la 1 la SNMP na kamba ya jamii pekee.** Toleo limewekwa katika hati na vitambulisho vya v3 kwenye kifaa havipitishwi. Kifaa kilichosanidiwa kwa v3 kinaweza kukusanya kupitia njia zingine wakati mkusanyiko wa wageni unashindwa. Mkusanyiko wa wageni bado unaweza kufanikiwa ikiwa wakala huyo atakubali jamii iliyohifadhiwa kwa kujitegemea juu ya v1; kuchagua v3 kwenye kifaa hakubainishi matokeo yenyewe. Matembezi tupu ya wageni yanarudishwa kama sufuri. Angalia kutolingana kwa itifaki hii bila kushusha kiwango cha sera ya usalama ya wakala ili kutosheleza msaidizi.

**Hesabu inatoka kwenye jedwali la hali ya nguvu.** Nambari iliyoripotiwa kama jumla ya wageni ni idadi ya maingizo yaliyorejeshwa na matembezi ya mti mdogo wa hali ya nguvu, si ya kitu tofauti cha orodha. Mgeni ambaye mpangishaji anaorodhesha lakini hana ingizo la hali ya nguvu hahesabiwi.

**Iliyowashwa inalinganishwa kwenye maandishi ya serikali.** Baada ya kupunguza na kufanya herufi ndogo, `powered on` na `poweredon` pekee ndizo zinazoongeza hesabu inayoendesha. Mawasilisho mengine hayafanyi hivyo; linganisha jibu ghafi la wakala kabla ya kutafsiri sifuri.

**Uainishaji wa zana za wageni una kasoro iliyothibitishwa.** Maandishi halisi `not installed` huhesabiwa kuwa yanaendeshwa kwa sababu mechi yake huanza katika kirekebishi sufuri. Maandishi yasiyotambuliwa pia huanguka kwa kuendesha. Usichukue hesabu hiyo kama dhibitisho la zana zenye afya; tazama [hitilafu ya hali ya zana](https://github.com/kadupulhq/kadupul/issues/244).

**Hutembea mara tatu kwa kila simu.** Inasoma jedwali la hali ya nguvu mara mbili, kisha meza ya zana, kwa hivyo hata hesabu zake zenyewe si picha ya orodha ya atomiki. Kwenye mwenyeji aliye na wageni wengi, pima gharama hiyo ya ukusanyaji. Ikiwa mpigakura ana msongamano, huyu ni mgombea wa muda mrefu kabla ya kuwa mgombea wa nyuzi zaidi. Tazama [Kupima mpigakura](/sw/guides/scale-the-poller/).

Hati hiyo kawaida hutoa maadili yote matano yaliyotajwa, ikijumuisha sufuri kwa matembezi tupu. Matembezi yaliyoshindwa yanaweza kutoa sampuli kamili ya kisintaksia lakini ya kupotosha. Kwa matokeo ambayo hayajakamilika, kichakataji cha matokeo cha PHP hukagua sehemu zinazohitajika na chanzo husika cha data na huzuia vikundi vya mihuri ya nyakati ambavyo havijakamilika; si lazima kuvitupa mara moja. Tazama [Akiba ya mpigakura](/sw/concepts/the-poller-cache/).

## Mitego katika iliyobaki

**Wastani wa kichakataji huficha usawa.** Mwenyeji aliye na msingi mmoja uliowekwa na 63 bila kufanya kitu wastani wake huwa chini. Weka grafu zilizothibitishwa kwa kila kichakataji pale ambapo hilo lina umuhimu. Msaidizi wa wastani pia hurudisha `load:0` kwa matembezi tupu, yasiyotofautishwa na CPU ya uvivu iliyopimwa; ihusishe na hali ya ukusanyaji na hitilafu inayojulikana ya matokeo tupu.

**Faharasa za vichakataji ni za nafasi.** Zinagunduliwa kwa kutembea kwenye meza ya processor. Ikiwa faharasa za wakala zinabadilika, thibitisha ramani za utambulisho kabla ya kuamini mwendelezo. Vizuizi vya tarakimu moja au mbili vilivyofungwa ni kasoro tofauti ya ugunduzi.

**Maingizo ya hifadhi ni chochote ambacho wakala huita hifadhi.** Tarajia maduka ya data yakichanganywa na vitu ambavyo hukutaka, katika vitengo vya ugawaji vinavyohitaji kuzidishwa. Hii ni tabia ya Host Resources, si tabia ya ajabu ya ESXi. Thibitisha vitengo vya ugawaji vilivyohifadhiwa kabla ya kutafsiri baiti; hati iliyoshirikiwa ina [kasoro ya ubadilishaji inayojulikana](https://github.com/kadupulhq/kadupul/issues/243) kwa sampuli hasi zisizo sahihi au vizidishi vinavyokosekana.

**Majina ya violesura kwenye hypervisor ni thabiti hadi yasiweze kuwa thabiti.** Sasisho la dereva au usanidi upya unaweza kuyahesabu tena. Tazama [Fuatilia swichi](/sw/guides/monitor-a-switch/) jinsi faharasa inavyochaguliwa na kwa nini ni muhimu.

**Hati huendeshwa kwenye mwenyeji wa mpigakura.** Zinafikia hypervisor zenyewe, kwa kutumia kitambulisho cha kifaa kilichopitishwa na amri iliyohifadhiwa. Msaidizi wa wageni na wastani wa CPU huchukua safu ya sasa ya kifaa kwa kila simu; mabadiliko ya jamii hayahitaji kujenga upya mabishano hayo ya amri. Wakusanyaji wengine wanaweza kupachika stakabadhi katika vipengee vyao vya kazi. Tazama [Akiba ya mpigakura](/sw/concepts/the-poller-cache/).

## Njia za kutofaulu

| Dalili | Sababu ya kawaida |
|---|---|
| Kila kitu kinakusanywa isipokuwa hesabu za wageni | Kifaa kimesanidiwa kwa SNMP v3 na hati ya mgeni inazungumza v1 |
| Hesabu ya wageni ni sawa, hesabu iliyowashwa ni sifuri | Angalia maandishi kamili ya hali ya nguvu na ikiwa matembezi ya pili yalifanikiwa |
| Hesabu ya wageni inashuka hadi sifuri na kupona | Angalia matembezi yaliyoshindwa/tupu; msaidizi anaweza kutoa mstari kamili wa zero |
| Grafu za vichakataji zinaonekana na kisha kuacha baada ya mabadiliko ya maunzi | Angalia faharasa zilizobadilishwa na kizuizi cha kifurushi hadi nambari moja au mbili |
| CPU ya mpangishaji ni tambarare na ya chini huku wageni wakiwa polepole | Angalia hitilafu za mkusanyiko pamoja na mabishano; matembezi tupu ya wastani yanaripotiwa kama sifuri |
| Grafu za duka la data zinajumuisha sehemu ambazo hukuziomba | Wakala anaziripoti kama hifadhi |
| Grafu ya muda wa kufanya kazi inaonekana si sahihi baada ya hitilafu ya mpigakura | Inaripoti thamani ya mwisho iliyorekodiwa ya Kadupul, si usomaji wa moja kwa moja |
| Jumla ya wageni kote kwa waandaji huruka wakati wa matengenezo | Wageni wanaohama huhesabiwa mara mbili kwa ufupi, au la |
