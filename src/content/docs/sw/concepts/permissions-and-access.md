---
title: Ruhusa na ufikiaji
description: Kwa nini ufikiaji umegawanywa katika mifumo miwili huru, kwa nini ruhusa huhifadhiwa kama chaguomsingi pamoja na vighairi, na kwa nini mti huonekana tofauti kwa kila akaunti.
banner:
  content: Kadupul iko katika hatua ya kabla ya alfa. Thibitisha taratibu hizi kwenye usakinishaji wa majaribio uliotengwa. Hii ni rasimu ya tafsiri inayosubiri ukaguzi wa mtu mwenye ufasaha wa lugha.
sidebar:
  order: 8
---

Ufikiaji una ukaguzi tofauti wa nyanja (realms) na sera za vitu (object policies). Nyanja hudhibiti vitendaji
vya kiolesura ambavyo akaunti inaweza kutumia; sera za vitu huamua grafu, vifaa, violezo na miti inayoruhusiwa.
Ombi linaweza kutegemea yote mawili. Ruzuku za nyanja zenyewe hazitoi grafu, na ruzuku za grafu zenyewe hazitoi
kazi za Dashibodi (Console). Hali ya akaunti, hali ya uthibitishaji na mipangilio ya mwonekano pia ni muhimu.

Ukurasa huu unaeleza kwa nini muundo umeumbwa hivyo. Kwa utaratibu wa kuunda akaunti, tazama
[Dhibiti watumiaji na ruhusa](/sw/guides/manage-users-and-permissions/).

## Kwa nini mifumo miwili

Maswali haya mawili si ya aina moja.

Kufikia ukurasa kunahusu msimbo. Ama akaunti inaruhusiwa kuendesha kihariri cha kifaa au la, na kuna jibu moja
kwa usakinishaji mzima. Kuona kifaa kunahusu data. Kuna maelfu ya vifaa na jibu linatofautiana kwa kila kimoja.

Kuziunganisha kungemaanisha ruhusa kwa kila ukurasa kwa kila kitu, ambayo ni zao la orodha mbili ambazo zote hukua.
Kuzitenganisha kunamaanisha orodha moja ya sehemu za kiolesura, iliyowekwa na ndogo, na seti moja ya sheria kwa kila kitu.
Gharama ya mgawanyiko ni kwamba zote mbili zinapaswa kusanidiwa, na akaunti iliyosanidiwa vibaya katika mojawapo
inaonekana kuwa imevunjika kwa njia ile ile.

## Nyanja (Realms) ni orodha maalum iliyo na nambari

Nyanja hutambua ruhusa ya kiolesura kwa nambari. Ramani kuu huhusisha kurasa na nyanja, huku programu-jalizi
zikiwa na uwezo wa kusajili nyanja za ziada. Angalia nyanja na utambulisho unaohitajika kwa njia halisi badala ya
kuchukulia ufikiaji wa ukurasa kama uamuzi kamili wa uidhinishaji wa kitu.

Nambari badala ya majina ya faili, kwa sababu nyanja moja hufunika kurasa kadhaa na kurasa hupewa majina mapya.
Nambari hiyo hubakia; orodha ya faili nyuma yake ni ramani inayoweza kubadilika bila kugusa akaunti yoyote.

Nyanja za akaunti hutoka kwake yenyewe na kutoka kwa vikundi vilivyowezeshwa ambavyo ni mali yake, vikiwa vimeunganishwa
kama muungano (union). Majukumu (roles) ni seti za nambari za nyanja zinazotumika katika kitendo kimoja. Jukumu huandika
nambari zake kwenye akaunti na kisha humaliza: ni sehemu ya kuanzia, si kiungo hai, kwa hivyo akaunti iliyoundwa kutoka
kwa jukumu haibadiliki wakati jukumu linapobadilika.

Programu-jalizi huongeza nyanja zao wenyewe, zikihifadhiwa kando na kushikiliwa na akaunti sawa na nyanja kuu. Kwa
hivyo programu-jalizi huleta eneo jipya linalodhibitiwa na ufikiaji ambalo sera yako iliyopo lazima ikague waziwazi.
Tazama [Programu-jalizi](/sw/concepts/plugins/).

## Vitu huhifadhiwa kama chaguomsingi pamoja na vighairi

Aina nne za vitu hubeba ruhusa: grafu, vifaa, violezo vya grafu, na miti.

Kwa kila aina, akaunti (au kikundi) inashikilia sera moja chaguomsingi na orodha ya vighairi. Kighairi ni safu
mlalo moja: nani, kitu gani, aina gani. Safu mlalo inafanana katika njia zote mbili za sera. Sera huamua safu
mlalo inamaanisha nini.

Huu ndio uamuzi unaobeba mzigo katika modeli nzima. Ni mkengeuko tu kutoka kwa chaguomsingi unaohifadhiwa katika
majedwali ya vighairi. Chaguomsingi za Ruhusu bila vighairi zinaweza kutoa ufikiaji mpana wa sera bila safu mlalo za
vighairi; safu za akaunti, chaguomsingi na nyanja bado zipo. Vifaa vitano vilivyoruhusiwa wazi chini ya chaguomsingi ya
Kataa vinahitaji vighairi vitano vya kifaa, lakini ruzuku na mbinu nyingine za grafu zinaweza kuathiri mwonekano.
Bila kujali jinsi mazingira yanavyoelekea, data iliyohifadhiwa inakaa saizi ya sehemu inayovutia badala ya saizi ya eneo lote.

## Kwa nini njia zote mbili za sera zipo

| Njia | Maana | Tabia kifaa kinapoongezwa |
|---|---|---|
| Ruhusu, ikiwa na vighairi | Vitu vya aina hiyo isipokuwa vizuizi vilivyoorodheshwa | Sera ya kifaa inaruhusu kitu kipya; ukaguzi mwingine bado unatumika |
| Kataa, ikiwa na vighairi | Vitu vilivyoorodheshwa tu vya aina hiyo | Chanzo hiki hakitoi kifaa kipya; vyanzo vingine au ruzuku za grafu zinaweza kuruhusu ufikiaji |

Chaguomsingi hutofautiana katika jinsi zinavyoshughulikia vitu vipya. Chagua upeo wa sera na tabia ya kutofaulu
kwa makusudi; hakuna inayoelezea ukaguzi wote wa ufikiaji wa ombi.

"Kila mtu katika mtandao, isipokuwa raki mbili za fedha" ni safu mlalo mbili chini ya ruhusu na elfu nne chini ya kataa.
"Mkandarasi huyu, na vifaa hivi vitano tu" ni safu mlalo tano chini ya kataa na elfu nne chini ya ruhusu. Kulazimisha
njia moja kungemaanisha kuwa nusu ya sera zote halisi zingeweza kuandikwa tu kwa kuorodhesha eneo lote, na orodha
ndefu hivyo haitunzwi kamwe.

Chaguomsingi ya Ruhusu inajumuisha vitu vilivyoongezwa hivi karibuni vya aina yake isipokuwa vimetengwa. Chaguomsingi ya
Kataa inahitaji kighairi wazi kutoka kwa chanzo hicho. Hizi ni sheria za kimaana za sera chaguomsingi, si dhamana kuhusu
ushughulikiaji wa hitilafu. Kagua watumiaji/vikundi vingine na mbinu za ruhusa za grafu kabla ya kuhitimisha kuwa chaguomsingi
ya Kataa ya kifaa inaficha grafu zake.

## Ufikiaji ni muungano (union), na hakuna kukanusha (deny)

Ufikiaji unaofaa hutathminiwa kwa sera ya akaunti yenyewe na kwa kila kikundi kilichowezeshwa ambacho ni mali yake.
Kwa ufikiaji wa grafu, tumia mbinu iliyochaguliwa ya grafu ndani ya kila chanzo kwanza, kisha unganisha matokeo hayo.
Chini ya mbinu ya Kizuizi (Restrictive), ruzuku ya kifaa katika kikundi kimoja na ruzuku ya kiolezo katika kingine
hazitengenezi jozi inayohitajika.

Hakuna kukanusha kwa kikundi kunakobatilisha ruzuku kutoka kwa chanzo kingine. Kutengwa chini ya chaguomsingi ya Ruhusu
bado kunaondoa mchango wa chanzo hicho; si kukanusha kwa jumla. Kuondoa kutengwa kama hivyo kunapanua ufikiaji, tofauti na
kuondoa ruzuku chini ya Kataa. Huu ni upunguzaji wa makusudi: modeli iliyo na ruzuku na kukanusha inahitaji sheria za
kipaumbele, na sheria za kipaumbele ndipo mifumo ya ruhusa inakuwa ngumu kukaguliwa kwa kuisoma tu.

Matokeo yake yanafaa kuelezwa wazi.

Kufuta ufikiaji kunamaanisha kuuondoa kutoka kwa akaunti na kutoka kwa kila kikundi kinachoutoa. Kuuondoa mahali pamoja
hakuondoi chochote ikiwa mahali pengine bado panautoa.

Kuzima kikundi huondoa ruzuku zake kutoka kwa kila mwanachama mara moja, ambayo inafanya kikundi kuwa chombo bora cha
kufuta kuliko mfululizo wa marekebisho ya kibinafsi.

Huwezi kujibu "akaunti hii inaweza kuona nini" kwa kuangalia safu mlalo moja. Lazima uchanganye sera nne za akaunti na
orodha nne na sawa kutoka kwa kila kikundi.

## Kwa nini ruhusa ya grafu ina njia nne

Grafu ina vitambulisho vitatu. Ni yenyewe, ni mali ya kifaa, na iliundwa kutoka kwa kiolezo cha grafu. Zote tatu zinaweza
kubeba ruhusa, kwa hivyo modeli lazima iamue ni mchanganyiko gani unaohesabiwa. Uamuzi huo ni mpangilio mmoja wa usakinishaji mzima.

| Mbinu | Swali inalouliza | Seti za vighairi zilizoshauriwa |
|---|---|---|
| Ruhusa (Permissive) | Je, mojawapo ya tatu inaruhusiwa? | Tatu |
| Kizuizi (Restrictive) | Je, grafu inaruhusiwa, au kifaa na kiolezo vyote vinaruhusiwa ndani ya chanzo kimoja? | Tatu |
| Kulingana na kifaa (Device based) | Je, grafu au kifaa kinaruhusiwa? | Mbili |
| Kulingana na kiolezo cha grafu (Graph template based) | Je, grafu au kiolezo kinaruhusiwa? | Mbili |

Sheria hizi zinaelezea ukaguzi wa uidhinishaji uliotekelezwa. Ruzuku za moja kwa moja za grafu hubaki na ufanisi katika njia
zote nne; kuchagua Kulingana na kifaa hakuzizuii. Pima utendaji na sera halisi na eneo badala ya kudhani kuwa hesabu ya seti
ya vighairi inatabiri gharama ya swali.

Ruhusa (Permissive) ndiyo chaguomsingi, na ndio mpangilio unaowashangaza watu. Chini ya ruhusa, kuruhusu kiolezo cha grafu
kunaruhusu kila grafu iliyojengwa kutoka kwake, kwenye kila kifaa, ikiwa ni pamoja na vifaa ambavyo akaunti haikuwahi kupewa.
Muundo unafanya kazi kama ilivyoelezwa. Maelezo si yale ambayo watu wengi hufikiria.

## Ruhusa huundwa kuwa maswali ya hifadhidata

Uchujaji wa ruhusa ya orodha ya grafu umeingizwa katika maswali ya hifadhidata. Ukurasa unaoonyesha grafu ishirini kati ya elfu
nne hauwezi kuleta safu mlalo elfu nne na kutupa zile ambazo akaunti haiwezi kuziona, kwa sababu basi hesabu itakuwa mbaya,
mipaka ya kurasa itakuwa mbaya, na kazi itaongezeka kulingana na eneo lote badala ya ukurasa.

Kwa hivyo sera na orodha za vighairi hugeuzwa kuwa vifungu vya join na where na kukabidhiwa kwa hifadhidata. Modeli ya ruhusa
imeumbwa jinsi ilivyo kwa sehemu kwa sababu inapaswa kuhimili tafsiri hiyo. Seti za vitambulisho na bendera chaguomsingi
hukusanywa kuwa SQL. Mantiki ya kiholela kwa kila kitu haifanyi hivyo.

Njia ya grafu ina njia ya mkato ya ruhusa pana za grafu, ikiwa ni pamoja na chaguomsingi ya Ruhusu ya mtumiaji bila vighairi
vya grafu. Usiieneze kwa kila aina ya kitu au kila njia. Ukaguzi wa nyanja, hali ya akaunti na mwonekano bado unahitaji
uthibitisho; uboreshaji wa maswali ya ruhusa si mbadala wa majaribio ya ufikiaji.

## Miti ni mhimili tofauti

Ruhusa ya mti na ruhusa ya grafu huangaliwa kwa kujitegemea. Kupewa mti hakutoi yaliyomo ndani yake. Kupewa grafu hakuhitaji kupewa mti.

Mti ni uwasilishaji wa vitu, si chombo kinachomiliki. Grafu ile ile inaweza kuonekana kwenye miti mitano. Ikiwa mti ungepeana
yaliyomo, basi kuhariri mti kungekuwa kuhariri ruhusa, na mtu yeyote anayeruhusiwa kupanga grafu angeruhusiwa kuzichapisha.

Kile ambacho mti hufanya badala yake ni kuficha kile kilicho tupu. Tawi huonyeshwa linapokuwa na kitu ambacho akaunti inaweza
kukiona, na ukaguzi unashuka chini: tawi ambalo matawi yake yote madogo ni tupu kwa akaunti hii yenyewe hufichwa. Watu wawili
hufungua mti mmoja na kuona maumbo mawili tofauti, na hakuna anayeona kishikilia nafasi kinachoashiria kile ambacho mwingine anacho.

Ukaguzi huo wa utupu si bure. Unapitia tawi na unauliza maswali ya grafu na kifaa mara kwa mara kwa kile unachopata. Mti wa kina
na mbinu ya gharama kubwa ya ruhusa ya grafu huchanganyika vibaya, ambayo ni sababu nyingine mbinu rahisi zipo.

Matokeo ya ukaguzi ni muhimu zaidi kuliko ya utendaji. **Mwonekano wa mti si ripoti ya kile akaunti inaweza kufikia.** Ni ripoti
ya kile akaunti inaweza kufikia *na mtu ameweka kwenye mti huo*. Ili kukagua ufikiaji, kagua sera na uthibitishe maombi halisi
yaliyoruhusiwa na yaliyokataliwa. Skrini ya Sera Yenye Ufanisi ni utekelezaji tofauti na ukaguzi wa uidhinishaji, kwa hivyo lebo
yake na kidokezo cha zana havipaswi kuwa ushahidi pekee. Tazama
[Kagua nani anaweza kuona nini](/sw/guides/audit-who-can-see-what/).

## Uhifadhi wa kache, na kwa nini mabadiliko hufanyika kwa nyakati zisizo za kawaida

Majibu ya ruhusa huhifadhiwa kwenye kache katika kipindi (session), kwa sababu njia mbadala ni kuuliza swali lile lile kwenye kila
ukurasa. Mabadiliko ya msimamizi huweka alama kwenye majibu yaliyohifadhiwa ya akaunti iliyoathiriwa kuwa ya zamani, na ukurasa
unaofuata ambao akaunti inapakia huyajenga upya badala ya kusubiri kuingia upya.

Kulemaza akaunti huondoa kitambulisho cha kuingia kinachoendelea, ruhusa zilizohifadhiwa na vipindi vya upande wa seva. Maombi
yaliyolindwa pia huangalia hali iliyowezeshwa/iliyofungwa; ukurasa uliopakiwa tayari kwenye kivinjari haufutwi mara moja. Njia
zinazoweza kutembelewa na wageni zinaweza kutatua utambulisho tofauti wa mgeni zikisanidiwa, kwa hivyo jibu lililofanikiwa pekee
halithibitishi kuwa akaunti iliyolemazwa inabaki na ufikiaji.

Thibitisha mabadiliko kwa kutumia vipindi vilivyopo na vipya, ukiangalia ufikiaji uliohifadhiwa na uliofutwa na kurekodi maudhui
ya majibu na utambulisho. Usitumie hali ya HTTP pekee kama uthibitisho wa uidhinishaji, au kudhani kuwa kila mtumiaji wa kache huburudisha kwa njia sawa.
