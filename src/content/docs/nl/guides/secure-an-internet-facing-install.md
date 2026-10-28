---
title: Een installatie met internetverbinding beveiligen
description: Wat u moet wijzigen voordat een monitoringsysteem met shelltoegang tot uw netwerk verzoeken van het openbare internet beantwoordt.
banner:
  content: Kadupul bevindt zich in pre-alfafase. Valideer deze procedures in een geïsoleerde testinstallatie. Conceptvertaling in afwachting van revisie door een moedertaalspreker.
sidebar:
  order: 9
---

:::caution[Valideer vóór gebruik]
De broncode is beschikbaar, maar er is geen ondersteunde Kadupul-release of
migratiepad. Test deze procedures op een geïsoleerde kopie met back-ups voordat
u erop vertrouwt. Zie [projectstatus](/nl/project/status/).
:::

Begin met het eerlijke antwoord: plaats het achter een VPN. Kadupul bewaart de SNMP-inloggegevens
voor elk apparaat dat u bewaakt in platte tekst, en het voert commando's uit op zijn eigen host
als onderdeel van de normale werking. Er is geen configuratie die het verstandig maakt om het
systeem op het openbare internet te plaatsen.

De onderstaande controles helpen bij het beoordelen van een geïsoleerde installatie. Ze vormen
geen ondersteunde of veilige openbare implementatie; houd rekening met de bovenstaande
projectstatusbeperking bij het interpreteren van de resultaten.

## TLS

Beëindig TLS op de webserver of een proxy daarvóór. Kadupul luistert niet op een eigen socket.

Schakel vervolgens de instelling in die gewone HTTP-verzoeken omleidt naar HTTPS. Deze staat standaard
uit (`off`). Zonder deze instelling wordt een inlogformulier via HTTP geserveerd en reist een wachtwoord
onversleuteld over het netwerk voordat iets anders ertoe kan doen.

De applicatie stelt de Secure-vlag van het sessiecookie in wanneer PHP een niet-lege waarde voor
`$_SERVER['HTTPS']` ontvangt die niet `off` is. Configureer achter een TLS-afsluitende proxy
de vertrouwde webserver of FastCGI-laag om HTTPS correct weer te geven, en controleer de resulterende
`Set-Cookie`-header in een browser.

`$proxy_headers` regelt de afhandeling van client-IP-adressen. Het stelt niet de HTTPS-servervariabele
in en schakelt geen Secure-cookies in. Vertrouw alleen de adresheaders die uw proxy instelt, verwijder
door clients aangeleverde exemplaren en voorkom directe toegang tot de backend. Dwing HTTP-naar-HTTPS-omleidingen
af op de openbare proxy voordat inloggegevens worden verzonden.

De applicatie stelt HttpOnly en SameSite=Strict in op haar sessiecookie. Controleer het werkelijke
cookie- en omleidingsgedrag op de implementatiegrens; deze vlaggen tonen niet aan dat alle andere
cookies dezelfde configuratie delen. Zie de
[PHP-sessieconfiguratiereferentie](https://www.php.net/manual/en/session.configuration.php).

## Standaardreferenties

Het meegeleverde schema bevat één beheerdersaccount met de naam `admin` waarvan de wachtwoordhash
de MD5 is van de tekenreeks `admin`. Het is gemarkeerd om een wijziging te vereisen bij de eerste aanmelding.
Bevestig dat de wijziging heeft plaatsgevonden in plaats van dit slechts aan te nemen. De prompt die dit
afdwingt, wordt overgeslagen onder web-basic-authenticatie, waarbij de webserver al heeft besloten wie de gebruiker is.

Kijk vervolgens naar de inloggegevens die geen gebruikersaccounts zijn:

- Het database-account staat in de meegeleverde configuratiesjabloon standaard ingesteld op `cactiuser` met het wachtwoord `cactiuser`.
- Het automatiseringssubsysteem levert standaard SNMP-opties mee die de community strings `public` en `private` bevatten, evenals een SNMPv3-gebruikersnaam- en wachtwoordpaar. Dit zijn scanstandaarden, geen apparaatconfiguraties, maar het zijn wel de strings die uw detectie als eerste zal proberen.

Het wachtwoordbeleid is configureerbaar. De standaardwaarden vereisen acht tekens en een combinatie van
hoofd- en kleine letters. Verloop en accountvergrendeling na herhaalde mislukkingen zijn beide beschikbaar
en beide standaard uitgeschakeld. Schakel op een installatie met internetverbinding de accountvergrendeling in.

## Databasetoegangsrechten

Het installatievoorbeeld gebruikt rechten op databaseniveau plus toegang tot de tijdzonetabel. Vervang
deze illustratieve account-/databasenamen en controleer de toekenningen voor de daadwerkelijke implementatie-
en onderhoudstaken:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Die tweede toekenning is niet optioneel. De verwerking van tijdzones leest die tabel, en het installatieprogramma
controleert op toegang en ingevulde tijdzonegegevens. Bekijk aanvullende toekenningen tegenover daadwerkelijke
onderhouds- en collectorvereisten voordat u ze verwijdert; dit voorbeeld bewijst niet dat elke implementatie
exact dezelfde rechten nodig heeft.

Belangrijke aandachtspunten voor de reikwijdte:

- Koppel de database aan localhost of aan een privé-interface, en niet aan het adres waarop de webserver antwoordt.
- Geef elke externe gegevensverzamelaar een eigen database-account. Hun inloggegevens bevinden zich in de centrale database en in hun eigen configuratiebestand; afzonderlijke accounts verbeteren daarom toewijzing en intrekking. Ze isoleren een gecompromitteerde verzamelaar op zichzelf niet als diens toekenningen nog steeds centrale schrijfacties toestaan.
- De verbinding ondersteunt TLS, geconfigureerd met een sleutel, certificaat en CA-pad in het configuratiebestand. Gebruik dit altijd wanneer de database zich niet op dezelfde host bevindt.
- Zorg dat het configuratiebestand leesbaar is voor de webservergebruiker en tijdens normale werking door noch de web- noch de poller-servicegebruiker kan worden beschreven. Houd het in eigendom van een administratief account. De installatie van de externe poller controleert specifiek of deze het bestand kan bijwerken; neem niet aan dat elke primaire serverinstallatie dezelfde tijdelijke schrijfrechten nodig heeft.
- Het CSRF-geheim kan in een bestand worden opgeslagen in plaats van in de database. Als u die optie gebruikt, moet het bestand zich buiten de document root bevinden. Dit is gesteld als een vereiste, niet als een suggestie.

## Gegevensmappen buiten de document root houden

In een implementatie vanuit de hoofdmap van de repository kunnen privé-gegevens en bronmappen zich onder
de geserveerde root bevinden. Verschillende mappen bevatten `.htaccess`-weigeringsregels; inventariseer
de feitelijke checkout en serverconfiguratie in plaats van aan te nemen dat elk pad is afgedekt. De huidige
gedeeltelijke framework-migratie betekent ook dat het omschakelen van de gehele site naar `public/` zonder
de verouderde routes geen volledige implementatieprocedure is.

Die bestanden werken alleen op Apache, en alleen wanneer de configuratie een override in die map toestaat.
Op nginx zijn ze inert. Op een verkeerd geconfigureerde Apache zijn ze inert. Een inerte deny-all voor de
logmap betekent dat iedereen uw applicatielogboek kan lezen, dat apparaatnamen, gebruikersnamen, zoekopdrachttekst
en foutdetails bevat. Apache documenteert het vereiste override-gedrag in zijn
[`.htaccess`-gids](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Doe beide van de volgende zaken:

**Verifieer opslagpaden voordat u gegevens verplaatst.** Logbestemmingen zijn configureerbaar,
maar `include/global.php` stelt de RRA-basis in op de map `rra` van de installatie; er is
geen generieke gebruikersinterface-instelling voor de RRA-map. Een afzonderlijk gekoppelde
opslagindeling kan dat verwachte pad behouden, maar plaatsing op het bestandssysteem alleen
voorkomt geen HTTP-toegang via een geserveerde map of symlink. Controleer bestaande gegevensbronpaden,
servicemachtigingen, back-ups en HTTP-weigering gezamenlijk. Verplaats cache-bomen niet zonder te
verifiëren hoe de consumenten ervan bestanden oplossen. Zie
[Migreren naar nieuwe hardware](/nl/guides/migrate-to-new-hardware/) en
[Veilig upgraden](/nl/guides/upgrade-safely/).

**Weiger privéprioriteitspaden op de webserver.** Pas het
[repository-root Nginx-voorbeeld](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
uit de broncode aan het werkelijke URL-voorvoegsel en de server aan; weigeringsregels moeten voorrang
krijgen op generieke PHP-afhandeling. Deze lijst is een inventarisatiehulpmiddel, geen kant-en-klare serverconfiguratie:

| Map | Waarom |
|---|---|
| `rra/` | Meetbestanden |
| `log/` | Applicatielogboek inclusief zoekopdracht- en foutdetails |
| `cache/` | Inspecteer bedoelde asset-toegang; blokkeer uitvoering van PHP in cache-paden |
| `scripts/` | Verzamelcode mag niet rechtstreeks worden geserveerd of aangeroepen via HTTP |
| `cli/` | Opdrachtregelprogramma's die niet bereikbaar mogen zijn via HTTP |
| `mibs/`, `contrib/`, `docs/` | Interne bronnen en documentatie |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Applicatie-interna, status en tooling |
| Verborgen bestanden, manifesten van afhankelijkheden, interne include/bootstrap-PHP | Repository-metagegevens en interne toegangspunten |

Behoud vereiste openbare assets zoals `include/js` en `include/themes`; een algemene blokkering
op alle includes kan de gebruikersinterface defect maken. Controleer weigering met behulp van onschadelijke
testpaden en controleer of antwoorden geen broncode of bestandsinhoud vrijgeven. Test niet door echte
geheimen op te halen in een terminal of logboek.

Er is ook een optioneel bestand met beveiligingsresponsheaders voor statische assets. PHP-antwoorden
stellen hun eigen headers in code in; statische bestanden doen dat niet, tenzij u dat bestand inschakelt
of dezelfde instructies in de serverconfiguratie plaatst.

Een Content Security Policy is configureerbaar. Het standaard scriptbeleid staat inline JavaScript toe
zonder nonce, omdat plugins daarvan afhankelijk zijn. De strengere nonce-modus die in de instellingen
wordt weergegeven, is alleen voor rapportage. De header-implementatie accepteert ook `nonce`-handhaving,
ondanks de [verouderde instellingshulp](https://github.com/kadupulhq/kadupul/issues/265). Handhaving
en de rapportagemodus zijn verschillend; inspecteer headers en test alle vereiste pagina's/plugins
voordat u van modus verandert. Geïmplementeerde handhaving is geen bewijs van volledige nonce-compatibiliteit.

## De poller voert commando's uit

Dit is het deel dat het dreigingsmodel verandert.

Verzameling omvat niet alleen SNMP. Een gegevensinvoermethode kan een opdrachtregel definiëren,
en de poller voert deze uit. De opdrachtregel wordt opgeslagen in de poller-cache en bij elk
interval door de collector uitgevoerd als de besturingssysteemgebruiker van de collector.
PHP-scriptserver-invoer maakt gebruik van een afzonderlijk langlevend PHP-proces. Externe commando's
en scriptserver-invoer zijn verschillende paden; ga er niet van uit dat elk script binnen die
server draait of dat een C-collector voor deze checkout is gevalideerd.

Behandel de volgende machtigingen als configuratie-oppervlakken met hoge privileges voor code-uitvoering.
Hun exacte effecten hangen af van ingeschakelde functies en validatiecontroles:

| Machtiging | Waarom |
|---|---|
| Gegevensinvoermethoden | Definieert de opdrachtregel rechtstreeks |
| Sjablonen importeren | Een geïmporteerd sjabloon of pakket kan een gegevensinvoermethode bevatten |
| Pluginbeheer | Plugincode draait binnen de applicatie |
| Instellingen/Hulpprogramma's | Beheert de paden naar de binaire bestanden die worden uitgevoerd |

Verleen deze aan niemand die niet al over shelltoegang op die host beschikt. Een alleen-lezen
gebruiker die grafieken kan bekijken is een heel ander geval, en dat is de rol die vrijwel elk
account zou moeten hebben.

Er bestaan twee controles en ze zijn beide het gebruiken waard:

**Metatekenbeperking.** Shell-metatekens in opdrachtreeksen voor gegevensinvoer worden standaard
geblokkeerd. Er is een instelling om ze toe te staan, die bestaat voor oude definities die gebruik
maakten van shell-pipelines. Laat deze uitgeschakeld. Als u definities heeft die dit nodig hebben,
verplaats de pipeline dan naar een script onder de scriptmap en roep het script aan.

**De invoer-whitelist.** Een bestand, genoemd in het configuratiebestand, waarin de goedgekeurde
opdrachtreeksen zijn opgenomen, gerangschikt op gegevensinvoermethode. Wanneer dit is ingesteld,
kunnen er geen grafieken en gegevensbronnen worden aangemaakt vanuit een gegevensinvoermethode waarvan
de opdrachtreeks niet op de lijst staat. Het wijzigen van een goedgekeurd commando zorgt ervoor dat
de vergelijking mislukt totdat de beoordeelde whitelist is bijgewerkt. Opnieuw genereren is een
opdrachtregelstap, en dat is precies het punt: het vereist shelltoegang op de host, geen administratieve
sessie in de browser.

De controle wordt opnieuw uitgevoerd wanneer de poller-cache opnieuw wordt opgebouwd. Een gegevensinvoer
die niet slaagt voor de controle levert geen poller-items op, en alle rijen die zijn achtergelaten
worden verwijderd bij de volgende vastgelegde herbouw/flush. Dit regelt creatie en cache-vulling;
het is geen direct annuleringsmechanisme voor reeds actieve taken of een bewijs dat elke collector
een gewijzigde whitelist opnieuw laadt vóór elke uitvoering. Verifieer de vastgelegde cachestatus en
het gedrag van de collector na een beleidswijziging.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Een niet-ingeperkte `--update` accepteert de huidige commandodefinities in de whitelist; gebruik
dit niet als vervanging voor het beoordelen ervan. Bescherm de whitelist en de bovenliggende map tegen
schrijfacties door servicegebruikers. Deze functionaliteit is uitgeschakeld tenzij geconfigureerd. Zie
[Een gegevensverzamelscript schrijven](/nl/guides/write-a-data-collection-script/) voor de selectie- en uitvoerdetails.
Dit verhoogt de kosten van een administratieve inbreuk via de browser, omdat het toevoegen van een nieuw
commando aan de verzameling nu ook schrijftoegang tot het bestandssysteem op de poller-host vereist. Het
is nog steeds geen vervanging voor het beperken van wie de machtigingen in de bovenstaande tabel bezit,
aangezien een aanvaller die een reeds goedgekeurde opdrachtreeks kan bereiken, er geen nieuwe hoeft toe te voegen.

## Authenticatie

Vier methoden worden meegeleverd. Welke beschikbaar zijn, hangt af van de aanwezige PHP-extensies.

| Methode | Waar gebruikers worden gecontroleerd | Opmerkingen |
|---|---|---|
| Ingebouwd | De lokale database | Wachtwoorden, beleid en vergrendeling worden allemaal lokaal afgehandeld |
| Web-basic | De webserver | Kadupul vertrouwt wat de server ook aangeeft dat de gebruiker is |
| LDAP | Eén enkele directory | Vereist de PHP-LDAP-extensie |
| Meerdere LDAP/AD-domeinen | Meerdere directories | Dezelfde vereiste |

De instellingenselector biedt deze geauthenticeerde methoden aan, niet de verouderde modus nul. De
authenticatie-bootstrap probeert een verouderde configuratie zonder authenticatie te migreren naar
lokale authenticatie, maar autorisatie-helpers op een lager niveau bevatten nog steeds vertakkingen
voor modus nul. Controleer de opgeslagen methode, geconfigureerde identiteiten en daadwerkelijk
beveiligde routes in plaats van de afwezige UI-keuze als universeel bewijs te beschouwen.

Aandachtspunten:

- **Web-basic delegeert identiteitsvalidatie.** Kadupul leest door de server geauthenticeerde identiteitsvariabelen wanneer deze modus is geselecteerd en past nog steeds accounttoewijzing, inschakelstatus en autorisatieregels toe. Een ontbrekende identiteit is niet automatisch een beheerder. Configureer de server om elke bedoelde route te authenticeren en te voorkomen dat clients vertrouwde identiteitsvariabelen aanleveren; controleer afbeeldings-/exportroutes en opzettelijk gastgedrag afzonderlijk.
- **Ondersteuning voor "aangemeld blijven"** is standaard ingeschakeld. Er wordt een persistent token aangemaakt wanneer de gebruiker na authenticatie voor die optie kiest, in plaats van automatisch voor elke sessie. Het verloopt na negentig dagen van niet-gebruik. Bepaal bij een installatie met internetverbinding bewust of u dit wenst.
- **Stel de gastgebruiker in op niemand**, tenzij u specifiek anonieme grafiekweergave wilt toestaan. Deze staat standaard ingesteld op geen gebruiker, wat de juiste standaardwaarde is; bevestig dat dit tijdens de installatie niet is gewijzigd.
- **Plaats meervoudige authenticatie (MFA) ervoor.** Er is geen MFA aanwezig in de applicatie. Een identiteitsbewuste proxy of een SSO-gateway is waar dit thuishoort.

## Eindpunten voor externe gegevensverzamelaars

Als u externe verzamelaars gebruikt, biedt de centrale installatie een eindpunt dat zij aanroepen.
Het authenticeert niet met een gebruikerssessie. Het autoriseert door het aanroepende adres op te lossen
en te vergelijken met de hostnamen van geregistreerde verzamelaars, waarbij fouten worden geregistreerd
onder een beveiligingscategorie.

Twee zaken volgen hieruit. Ten eerste mag dat eindpunt niet bereikbaar zijn vanaf het openbare internet;
beperk het op de webserver tot de adressen van de verzamelaars. Ten tweede is het gecontroleerde clientadres
het adres dat is afgeleid van het verzoek, dus het eerder geconfigureerde vertrouwen in doorgestuurde
headers is hier ook van toepassing. Het vertrouwen op headers die u niet beheert, stelt een aanroeper
in staat om het adres van een verzamelaar te claimen.

Afzonderlijk staat de instelling die zelfondertekende certificaten en mismatches in hostnamen toestaat
wanneer de centrale server met een verzamelaar communiceert, standaard ingeschakeld. Geef echte
certificaten uit voor uw verzamelaars en schakel deze optie uit.

## Minimale checklist

1. TLS beëindigd, HTTP vóór het inloggen omgeleid, PHP-HTTPS-status geconfigureerd door de vertrouwde server en Secure-cookies geverifieerd. Client-adresheaders beperkt tot de headers die de proxy instelt en verwijdert.
2. Standaard beheerderswachtwoord gewijzigd en bevestigd. Accountvergrendeling ingeschakeld.
3. Databasetoekenningen beoordeeld voor installatie-, onderhouds- en collectorrollen; tijdzonetoegang geverifieerd en netwerktoegang tot de database beperkt tot vereiste clients.
4. Opslagpaden geverifieerd, privé-mappen en metagegevens geweigerd op de webserver, en vereiste statische bestanden nog steeds functioneel.
5. Configuratiebestand niet beschrijfbaar tijdens runtime. CSRF-geheimenbestand, indien gebruikt, buiten de document root.
6. Gegevensinvoermethoden, Sjablonen importeren en Pluginbeheer niet toegekend aan personen zonder shell op de poller-host. Metatekenbeperking ingeschakeld. Invoer-whitelist geconfigureerd.
7. Eindpunt voor externe verzamelaar beperkt op adres. Certificaatcontrole ingeschakeld.
8. MFA in een proxy vóór het gehele systeem.
