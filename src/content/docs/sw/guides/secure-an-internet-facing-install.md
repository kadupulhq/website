---
title: Linda usakinishaji unaotazamana na mtandao
description: Nini cha kubadilisha kabla ya mfumo wa ufuatiliaji wenye ufikiaji wa shell kwenye mtandao wako kujibu maombi kutoka kwa mtandao wa umma.
banner:
  content: Kadupul iko katika hatua ya pre-alpha. Thibitisha taratibu hizi katika usakinishaji uliotengwa wa majaribio. Huu ni mswada wa tafsiri; uhakiki wa mtaalamu wa lugha unasubiriwa.
sidebar:
  order: 9
---

:::caution[Thibitisha kabla ya kutumia]
Msimbo chanzo unapatikana, lakini hakuna toleo la Kadupul linaloungwa mkono au njia ya uhamiaji kwa sasa. Jaribu taratibu hizi kwenye nakala iliyotengwa yenye nakala rudufu kabla ya kuzitegemea. Tazama [hali ya mradi](/sw/project/status/).
:::

Anza na jibu la kweli: liweke nyuma ya VPN. Kadupul huweka kitambulisho cha SNMP cha kila kifaa unachofuatilia katika maandishi wazi (cleartext), na huendesha amri kwenye mwenyeji wake kama sehemu ya shughuli za kawaida. Hakuna usanidi unaofanya kuiweka kwenye mtandao wa umma kuwa jambo zuri.

Ukaguzi ulio hapa chini husaidia kutathmini usakinishaji uliotengwa. Hazianzishi uwekaji wa umma unaoungwa mkono au salama; weka kikomo cha hali ya mradi kilicho hapo juu akilini unapotafsiri matokeo.

## TLS

Sitisha TLS kwenye seva ya wavuti au kwenye proksi mbele yake. Kadupul haisikilizi kwenye soketi yake yenyewe.

Kisha washa mpangilio unaoelekeza upya maombi ya kawaida ya HTTP kwenda HTTPS. Hii imezimwa (`off`) kwa chaguo-msingi. Bila hiyo, fomu ya kuingia hutolewa kupitia HTTP na nenosiri huenda wazi kwenye mtandao kabla ya kitu kingine chochote kuwa muhimu.

Wakati PHP inapopokea thamani isiyo tupu ya `$_SERVER['HTTPS']` isipokuwa `off`, programu huweka bendera ya Secure ya kuki ya kipindi. Nyuma ya proksi inayositisha TLS, sanidi seva ya wavuti inayoaminika au safu ya FastCGI ili kuwasilisha HTTPS kwa usahihi, na uthibitishe kichwa kinachotokana cha `Set-Cookie` kwenye kivinjari.

`$proxy_headers` hudhibiti utatuzi wa anwani ya mteja. Hii haiweki kigezo cha seva ya HTTPS au kuwezesha kuki za Secure. Amini tu vichwa vya anwani ambavyo proksi yako huweka, ondoa nakala zinazotolewa na mteja, na uzuie ufikiaji wa moja kwa moja kwenye mandharinyuma. Tekeleza uelekezaji upya wa HTTP-hadi-HTTPS kwenye proksi ya umma kabla ya vitambulisho kutumwa.

Programu huweka HttpOnly na SameSite=Strict kwenye kuki yake ya kipindi. Thibitisha tabia halisi ya kuki na uelekezaji upya kwenye mpaka wa uwekaji; bendera hizi hazithibitishi kuwa kuki zingine zote zinashiriki usanidi sawa. Tazama [Rejeleo la usanidi wa kipindi cha PHP](https://www.php.net/manual/en/session.configuration.php).

## Vitambulisho chaguo-msingi

Mchoro uliosafirishwa una akaunti ya kiutawala inayoitwa `admin` ambayo heshi yake ya nenosiri ni MD5 ya kamba `admin`. Imewekewa alama kuwa inahitaji mabadiliko wakati wa kuingia mara ya kwanza. Badala ya kudhani hiyo ilifanyika, thibitisha kuwa mabadiliko yalifanyika. Kidokezo kinachotekeleza hilo kinarukwa chini ya Uthibitishaji wa Msingi wa Wavuti, ambapo seva ya wavuti tayari imeamua mtumiaji ni nani.

Kisha angalia vitambulisho ambavyo si akaunti za watumiaji:

- Akaunti ya hifadhidata katika kiolezo cha usanidi uliosafirishwa kwa chaguo-msingi ni `cactiuser` yenye nenosiri `cactiuser`.
- Mfumo mdogo wa otomatiki huja na chaguo-msingi za SNMP zenye kamba za jamii `public` na `private`, na jozi ya jina la mtumiaji na nenosiri la SNMPv3. Hizi ni chaguo-msingi za uchunguzi, si usanidi wa vifaa, lakini ni kamba zile zile ambazo ugunduzi wako utajaribu kwanza.

Sera ya nenosiri inaweza kusanidiwa. Chaguo-msingi linahitaji vibambo nane na herufi mchanganyiko. Muda wa kuisha na kufungwa kwa akaunti baada ya kushindwa mara kwa mara vyote vinapatikana na vyote vimezimwa kwa chaguo-msingi. Kwenye usakinishaji unaotazamana na mtandao, washa kufungwa kwa akaunti.

## Haki za hifadhidata

Mfano wa usakinishaji hutumia haki za kiwango cha hifadhidata pamoja na ufikiaji wa jedwali la ukanda wa saa. Badilisha majina haya ya kielelezo ya akaunti/hifadhidata na uhakiki ruzuku kwa kazi halisi za uwekaji na matengenezo:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Ruzuku hiyo ya pili si ya hiari. Ushughulikiaji wa ukanda wa saa husoma jedwali hilo, na kisakinishi hukagua ufikiaji na data ya ukanda wa saa iliyojazwa. Kagua ruzuku za ziada dhidi ya mahitaji halisi ya matengenezo na mkusanyaji kabla ya kuziondoa; mfano huu si uthibitisho kwamba kila uwekaji unahitaji haki zinazofanana kabisa.

Maelezo ya upeo ambayo ni muhimu:

- Funga hifadhidata kwa localhost, au kiolesura cha kibinafsi, si anwani ambayo seva ya wavuti hujibu kwayo.
- Mpe kila mkusanyaji wa data wa mbali akaunti yake ya hifadhidata. Vitambulisho vyao vinaishi katika hifadhidata kuu na katika faili yao ya usanidi, kwa hivyo akaunti tofauti huboresha uwajibikaji na ubatilishaji. Hazitengi peke yake mkusanyaji aliyeathiriwa ikiwa ruzuku zake bado zinaruhusu uandishi mkuu.
- Muunganisho unaauni TLS, iliyosanidiwa katika faili ya usanidi yenye ufunguo, cheti na njia ya CA. Itumie wakati wowote hifadhidata haiko kwenye mwenyeji sawa.
- Fanya faili ya usanidi isomeke na mtumiaji wa seva ya wavuti na isiandikwe na mtumiaji wa huduma ya wavuti au poller wakati wa operesheni ya kawaida. Iweke chini ya umiliki wa akaunti ya kiutawala. Usanidi wa poller wa mbali huangalia haswa ikiwa inaweza kusasisha faili; usidhani kila usakinishaji wa seva ya msingi unahitaji ruhusa sawa za muda za kuandika.
- Siri ya CSRF inaweza kuhifadhiwa katika faili badala ya hifadhidata. Ikiwa unatumia chaguo hilo, faili lazima iwe nje ya mzizi wa hati. Hili limeelezwa kama hitaji, si pendekezo.

## Weka saraka za data nje ya mzizi wa hati

Katika uwekaji wa mzizi wa ghala, data ya kibinafsi na saraka za chanzo zinaweza kukaa chini ya mzizi unaotolewa. Saraka nyingi zina sheria za kukataa za `.htaccess`; badala ya kudhani kila njia imefunikwa, tengeneza orodha halisi ya usanidi wa seva. Uhamiaji wa sasa wa mfumo mdogo unamaanisha pia kubadili tovuti nzima kwenda `public/` bila njia zake za urithi si utaratibu kamili wa uwekaji.

Faili hizo hufanya kazi kwenye Apache pekee, na pale tu usanidi unaporuhusu ubatilishaji katika saraka hiyo. Kwenye Nginx hazifanyi kazi. Kwenye Apache iliyosanidiwa vibaya hazifanyi kazi. Kanuni isiyofanya kazi ya deny-all mbele ya saraka ya kumbukumbu inamaanisha mtu yeyote anaweza kusoma kumbukumbu za programu yako, ikiwa ni pamoja na majina ya vifaa, majina ya watumiaji, maandishi ya maswali na maelezo ya kushindwa. Apache inaandika tabia inayohitajika ya kubatilisha katika [mwongozo wa `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Fanya yote mawili:

**Thibitisha njia za uhifadhi kabla ya kuhamisha data.** Maeneo ya kumbukumbu yanaweza kusanidiwa, lakini `include/global.php` huweka msingi wa RRA kwenye saraka ya `rra` ya usakinishaji; hakuna mpangilio wa jumla wa UI wa saraka ya RRA. Mpangilio wa uhifadhi uliowekwa kando unaweza kuhifadhi njia hiyo inayotarajiwa, lakini uwekaji wa mfumo wa faili pekee hauzuii ufikiaji wa HTTP kupitia saraka inayotolewa au kiungo cha symlink. Kagua njia zilizopo za chanzo cha data, ruhusa za huduma, nakala rudufu na kukataliwa kwa HTTP kwa pamoja. Usihamishe miti ya kache bila kuthibitisha jinsi watumiaji wake wanavyotatua faili. Tazama [Hamia kwenye maunzi mapya](/sw/guides/migrate-to-new-hardware/) na [Boresha kwa usalama](/sw/guides/upgrade-safely/).

**Kataa njia za kibinafsi kwenye seva ya wavuti.** Badilisha [mfano wa Nginx wa mzizi wa ghala](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf) wa chanzo kulingana na kiambishi awali cha URL halisi na seva; sheria za kukataa lazima zichukue nafasi ya kwanza juu ya ushughulikiaji wa kawaida wa PHP. Orodha hii ni msaada wa hesabu, si usanidi wa seva ulio tayari kutumika:

| Saraka | Kwa nini |
|---|---|
| `rra/` | Faili za kipimo |
| `log/` | Kumbukumbu za programu ikiwa ni pamoja na maswali na maelezo ya makosa |
| `cache/` | Kagua ufikiaji unaokusudiwa wa mali; zuia utekelezaji wa PHP katika njia za kache |
| `scripts/` | Msimbo wa ukusanyaji haupaswi kutolewa au kutekelezwa moja kwa moja kupitia HTTP |
| `cli/` | Zana za mstari wa amri ambazo hazikusudiwi kufikiwa kupitia HTTP |
| `mibs/`, `contrib/`, `docs/` | Rasilimali za ndani na nyaraka |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Muundo wa ndani wa programu, hali na zana |
| Faili zenye vitone, maelezo ya utegemezi, PHP ya ndani ya include/bootstrap | Data ya meta ya ghala na sehemu za kuingilia za ndani |

Hifadhi mali muhimu za umma kama `include/js` na `include/themes`; kizuizi cha jumla kwenye includes zote kinaweza kuvunja kiolesura cha mtumiaji (UI). Thibitisha kukataliwa kwa kutumia njia za majaribio zisizo na madhara na uhakikishe majibu hayafichui chanzo au yaliyomo kwenye faili. Usijaribu kwa kuleta siri halisi kwenye terminal au kumbukumbu.

Pia kuna faili ya hiari ya vichwa vya majibu ya usalama kwa mali zisizobadilika. Majibu ya PHP huweka vichwa vyao wenyewe katika msimbo; faili zisizobadilika hazifanyi hivyo isipokuwa uwezeshe faili hiyo au uweke maagizo sawa katika usanidi wa seva.

Sera ya Usalama wa Maudhui (CSP) inaweza kusanidiwa. Sera chaguo-msingi ya hati inaruhusu JavaScript ya ndani bila nonce, kwa sababu programu-jalizi huitegemea. Hali ngumu ya nonce iliyoonyeshwa katika mipangilio ni ya kutoa ripoti pekee. Utekelezaji wa kichwa pia unakubali utekelezaji wa `nonce` licha ya [msaada wa mipangilio ya zamani](https://github.com/kadupulhq/kadupul/issues/265). Hali ya kutekeleza na ya ripoti pekee ni tofauti; kagua vichwa na ujaribu kurasa/programu-jalizi zote zinazohitajika kabla ya kubadilisha hali. Utekelezaji uliotekelezwa si uthibitisho wa utangamano kamili wa nonce.

## Poller hutekeleza amri

Hii ndiyo sehemu inayobadilisha mtindo wa tishio.

Ukusanyaji si SNMP pekee. Njia ya kuingiza data inaweza kufafanua mstari wa amri, na poller huukimbiza. Mstari wa amri huhifadhiwa kwenye kache ya poller na hutekelezwa katika kila kipindi na mkusanyaji kama mtumiaji wa mfumo wa uendeshaji wa mkusanyaji. Uingizaji wa seva ya hati ya PHP hutumia mchakato tofauti wa PHP unaoendesha kwa muda mrefu. Uingizaji wa amri ya nje na seva ya hati ni njia tofauti; usidhani kila hati inaendeshwa ndani ya seva hiyo au mkusanyaji wa C amethibitishwa kwa usakinishaji huu.

Chukulia ruhusa zifuatazo kama sehemu za usanidi zenye upendeleo mkubwa wa utekelezaji wa msimbo. Athari zao halisi hutegemea vipengele vilivyowezeshwa na vidhibiti vya uthibitishaji:

| Ruhusa | Kwa nini |
|---|---|
| Njia za Kuingiza Data | Hufafanua mstari wa amri moja kwa moja |
| Leta Violezo | Kiolezo au kifurushi kilicholetwa kinaweza kubeba njia ya kuingiza data |
| Usimamizi wa Programu-jalizi | Msimbo wa programu-jalizi huendeshwa ndani ya programu |
| Mipangilio / Huduma | Hudhibiti njia ya faili za binary zinazotekelezwa |

Usiwape mtu yeyote ambaye hana shell kwenye mwenyeji huyo tayari. Mtumiaji anayesoma tu anayeweza kuona grafu ni kitu tofauti kabisa, na hilo ndilo jukumu ambalo karibu kila akaunti inapaswa kuwa nalo.

Kuna vidhibiti viwili na vyote viwili vinafaa kutumiwa:

**Vizuizi vya vibambo maalum (Metacharacters).** Vibambo maalum vya shell katika kamba za amri za uingizaji data huzuiwa kwa chaguo-msingi. Kuna mpangilio wa kuziruhusu, ambao upo kwa ufafanuzi wa zamani uliotumia mabomba ya shell. Iache ikiwa imezimwa. Ikiwa una ufafanuzi unaohitaji, sogeza bomba kwenye hati chini ya saraka ya hati na u ब्राह्मण hati hiyo.

**Orodha nyeupe ya pembejeo (Input Whitelist).** Faili iliyotajwa katika faili ya usanidi, inayoshikilia kamba za amri zilizoidhinishwa na njia ya uingizaji data. Wakati hii imewekwa, grafu na vyanzo vya data haviwezi kuundwa kutoka kwa njia ya kuingiza data ambayo kamba yake ya amri haikuwa kwenye orodha. Kubadilisha amri iliyoidhinishwa huifanya ishindwe kulinganishwa hadi orodha nyeupe iliyokaguliwa isasishwe. Kuidhinisha tena ni hatua ya mstari wa amri, ambayo ndiyo hoja kuu: inahitaji ufikiaji wa shell kwenye mwenyeji, si kikao cha kiutawala kwenye kivinjari.

Wakati kache ya poller inapojengwa upya ukaguzi huendeshwa tena. Uingizaji wa data unaoshindwa katika hili hautoi vipengee vya poller, na safu yoyote iliyoachwa huondolewa kwenye ujenzi upya/ufutaji uliothibitishwa unaofuata. Hii hudhibiti uundaji na ujazaji wa kache; si njia ya haraka ya kughairi kazi inayoendelea tayari au uthibitisho kwamba kila mkusanyaji hupakia upya orodha nyeupe iliyobadilishwa kabla ya kila utekelezaji. Thibitisha hali ya kache iliyothibitishwa na tabia ya mkusanyaji baada ya mabadiliko ya sera.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

`--update` isiyo na upeo inakubali ufafanuzi wa sasa wa amri kwenye orodha nyeupe; usiitumie kama mbadala wa kuzihakiki. Linda orodha nyeupe na saraka yake kuu dhidi ya maandishi ya mtumiaji wa huduma. Inabaki imezimwa hadi itakaposanidiwa. Tazama [Andika hati ya kukusanya data](/sw/guides/write-a-data-collection-script/) kwa maelezo ya uteuzi na matokeo.
Hii inaongeza gharama ya maelewano ya kiutawala ya upande wa kivinjari, kwa sababu kuingiza amri mpya katika ukusanyaji sasa kunahitaji pia ufikiaji wa uandishi wa mfumo wa faili kwenye mwenyeji wa poller. Hii bado si mbadala wa kuzuia nani anashikilia ruhusa katika jedwali hapo juu, kwa sababu mshambuliaji anayeweza kufikia kamba ya amri iliyoidhinishwa tayari hahitaji kuongeza mpya.

## Uthibitishaji

Mbinu nne huja. Kinachopatikana kinategemea viendelezi vya PHP vilivyopo.

| Mbinu | Ambapo watumiaji wanakaguliwa | Vidokezo |
|---|---|---|
| Iliyojengwa ndani | Hifadhidata ya ndani | Nywila, sera na kufungwa hushughulikiwa ndani ya nchi |
| Web Basic | Seva ya wavuti | Chochote ambacho seva inasema mtumiaji ni nani, Kadupul huamini |
| LDAP | Saraka moja | Inahitaji kiendelezi cha PHP LDAP |
| Vikoa vingi vya LDAP/AD | Saraka kadhaa | Hitaji sawa |

Kiteuzi cha mipangilio huonyesha njia hizi zilizoidhinishwa, si modi ya zamani sufuri. Uanzishaji wa uthibitishaji hujaribu kuhamisha usanidi wa zamani usio na uthibitishaji kurudi kwenye uthibitishaji wa ndani, lakini wasaidizi wa idhini ya kiwango cha chini bado wana matawi ya modi sufuri. Thibitisha mbinu iliyohifadhiwa, utambulisho uliosanidiwa na njia halisi zilizolindwa badala ya kuchukulia chaguo la UI ambalo halipo kama ushahidi wa jumla.

Mambo ya kuangalia:

- **Web Basic hukabidhi uthibitishaji wa utambulisho.** Njia hii inapochaguliwa Kadupul husoma vigezo vya utambulisho vilivyothibitishwa na seva na bado hutekeleza uchoraji wa ramani ya akaunti, hali ya kuwezesha na sheria za uidhinishaji. Utambulisho unaokosekana si msimamizi kiotomatiki. Sanidi seva ili kuthibitisha kila njia iliyokusudiwa na kuzuia mteja kusambaza vigezo vya utambulisho vinavyoaminika; thibitisha njia za picha/usafirishaji na tabia ya mgeni iliyokusudiwa kando.
- **Msaada wa "Nikumbuke"** umewezeshwa kwa chaguo-msingi. Ishara ya kudumu huundwa wakati mtumiaji anapochagua chaguo hilo baada ya uthibitishaji, si kiotomatiki kwa kila kipindi. Inaisha baada ya siku tisini za kutotumika. Kwenye usakinishaji unaotazamana na mtandao, amua kimakusudi ikiwa unaitaka.
- **Weka mtumiaji mgeni kuwa nobody** isipokuwa unataka hasa kuruhusu utazamaji wa grafu usiojulikana. Haijawekwa kwa mtumiaji yeyote kwa chaguo-msingi, ambalo ndilo chaguo-msingi sahihi; thibitisha kuwa haikubadilishwa wakati wa kusanidi.
- **Weka Uthibitishaji wa Vipengele Vingi (MFA) mbele yake.** Hakuna MFA katika programu. Proksi inayotambua utambulisho au lango la SSO ndipo inapokwenda.

## Vituo vya mwisho vya mkusanyaji wa data wa mbali

Ikiwa unaendesha wakusanyaji wa mbali, usakinishaji mkuu huweka wazi kituo cha mwisho wanachokiita. Hii haithibitishwi na kipindi cha mtumiaji. Huidhinisha kwa kutatua anwani inayopiga simu na kuilinganisha dhidi ya majina ya mwenyeji ya wakusanyaji waliosajiliwa, ikiweka kumbukumbu za hitilafu chini ya kitengo cha usalama.

Mambo mawili yanaibuka. Kwanza, kituo hicho cha mwisho hakipaswi kufikiwa kutoka kwa mtandao wa umma; kizuie kwenye seva ya wavuti kwa anwani za mkusanyaji. Pili, anwani ya mteja inayokagua ni anwani inayotokana na ombi, kwa hivyo uaminifu wa kichwa kilichosambazwa uliosanidiwa hapo awali unatumika hapa pia. Kuamini vichwa ambavyo huvidhibiti humwezesha mpigaji kudai anwani ya mkusanyaji.

Kando, mpangilio unaoruhusu seva kuu vyeti vilivyojisaini na kutolingana kwa jina la mwenyeji wakati wa kuzungumza na mkusanyaji umewashwa kwa chaguo-msingi. Toa vyeti halisi kwa wakusanyaji wako na uzime hii.

## Orodha ya chini ya ukaguzi

1. TLS imesitishwa, HTTP inaelekezwa upya kabla ya kuingia, hali ya HTTPS ya PHP imesanidiwa na seva inayoaminika, na kuki za Secure zimethibitishwa. Vichwa vya anwani ya mteja vimezuiwa kwa vile tu ambavyo proksi huweka na kufuta.
2. Nenosiri chaguo-msingi la msimamizi limebadilishwa na kuthibitishwa. Kufungwa kwa akaunti kumewashwa.
3. Ruzuku za hifadhidata zimehakikiwa kwa majukumu ya usakinishaji, matengenezo na mkusanyaji; ufikiaji wa ukanda wa saa umethibitishwa na ufikiaji wa mtandao wa hifadhidata umezuiwa kwa wateja wanaohitajika.
4. Njia za uhifadhi zimethibitishwa, saraka za kibinafsi na data ya meta zimekataliwa kwenye seva ya wavuti, na mali muhimu zisizobadilika bado zinafanya kazi.
5. Faili ya usanidi haiwezi kuandikwa wakati wa utekelezaji. Faili ya siri ya CSRF, ikiwa inatumiwa, iko nje ya mzizi wa hati.
6. Njia za kuingiza data, uletaji wa violezo na usimamizi wa programu-jalizi havijapewa mtu yeyote asiye na shell kwenye mwenyeji wa poller. Vizuizi vya vibambo maalum vimewashwa. Orodha nyeupe ya pembejeo imesanidiwa.
7. Vituo vya mwisho vya mkusanyaji wa mbali vimezuiwa kwa anwani. Ukaguzi wa vyeti umewashwa.
8. MFA iko kwenye proksi mbele ya kila kitu.
