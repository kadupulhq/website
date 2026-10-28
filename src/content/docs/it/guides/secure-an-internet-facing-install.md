---
title: Proteggere un'installazione esposta su Internet
description: Gli accorgimenti necessari prima che un sistema di monitoraggio dotato di accesso da riga di comando risponda a richieste provenienti dalla rete pubblica.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 9
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Iniziamo con la risposta più trasparente: posizionatelo dietro una VPN. Kadupul conserva in chiaro
le credenziali SNMP di ogni apparato monitorato ed esegue comandi sul proprio server durante il
normale funzionamento. Non esiste configurazione capace di rendere consigliabile la sua esposizione
diretta su Internet.

Le indicazioni sotto riportate servono a valutare un'installazione in ambiente controllato. Non
costituiscono un modello sicuro o certificato per la produzione pubblica; interpretate i risultati
tenendo presente l'avvertenza iniziale sullo stato del progetto.

## TLS

La terminazione TLS deve avvenire sul server web o su un proxy a monte. Kadupul non gestisce un
proprio socket in ascolto.

Attivate quindi la redirezione obbligatoria da HTTP a HTTPS. L'impostazione è disattivata di
base (`off`). Senza di essa, il modulo di autenticazione viene trasmesso in chiaro via HTTP e la
password viaggia sulla rete prima che qualunque altro controllo possa intervenire.

L'applicazione imposta il flag Secure sul cookie di sessione se PHP riceve un valore non vuoto per
`$_SERVER['HTTPS']` diverso da `off`. In presenza di un proxy per la terminazione TLS, configurate
il server web affidabile o il modulo FastCGI affinché inoltri correttamente l'indicazione di HTTPS
e controllate la presenza dell'header `Set-Cookie` tramite browser.

`$proxy_headers` regola l'estrazione dell'indirizzo IP del client. Non valorizza la variabile di
sistema HTTPS e non abilita i cookie Secure. Riconoscete come validi unicamente gli header inseriti
dal vostro proxy, eliminate le copie inviate dai client e precludete l'accesso diretto ai servizi di backend.
Imponete il reindirizzamento da HTTP a HTTPS direttamente sul proxy pubblico prima dell'invio delle credenziali.

L'applicazione aggiunge le direttive HttpOnly e SameSite=Strict al proprio cookie di sessione.
Controllate l'effettiva gestione dei cookie e dei reindirizzamenti al confine dell'infrastruttura;
questi flag non assicurano che tutti gli altri cookie creati condividano le medesime impostazioni.
Fate riferimento alla [guida alla configurazione delle sessioni in PHP](https://www.php.net/manual/en/session.configuration.php).

## Credenziali predefinite

Lo schema iniziale prevede un account amministratore denominato `admin` la cui password cifrata
corrisponde all'hash MD5 della parola `admin`. Tale account richiede un cambio password obbligatorio
al primo accesso. Assicuratevi che la variazione sia avvenuta anziché darla per scontata. Questa
richiesta non viene presentata in presenza di autenticazione HTTP di base gestita dal web server,
poiché quest'ultimo ha già convalidato l'identità dell'utente.

Esaminate quindi le credenziali non associate a utenti applicativi:

- L'account del database è preimpostato su `cactiuser` con password `cactiuser` nel template di configurazione originale.
- Il modulo di automazione propone stringhe community SNMP di default impostate su `public` e `private`, oltre a una coppia utente/password per SNMPv3. Si tratta di valori per le scansioni e non della configurazione degli apparati, ma sono i primi parametri che il processo di scoperta proverà a utilizzare.

La complessità delle password è configurabile. Le regole minime richiedono otto caratteri e la
presenza di lettere maiuscole e minuscole. La scadenza e il blocco delle utenze dopo tentativi
errati sono entrambi disponibili e disattivati di base. Se il sistema è esposto a Internet, attivate il blocco degli accessi.

## Privilegi sul database

L'esempio di installazione fa uso di permessi circoscritti al database oltre all'accesso alla tabella
dei fusi orari. Sostituite i nomi dimostrativi di account e database e revisionate le autorizzazioni
in base alle specifiche esigenze di esercizio e manutenzione:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

Il secondo comando di abilitazione è fondamentale. La logica dei fusi orari effettua query su quella
tabella e la procedura di installazione ne controlla la presenza e il contenuto. Valutate i permessi
aggiuntivi rapportandoli ai compiti di manutenzione e dei collector prima di revocarli; l'esempio non
garantisce che ogni scenario necessiti dei medesimi privilegi.

Dettagli da considerare:

- Rilegate l'ascolto del database su localhost o su un'interfaccia privata, mai sull'indirizzo IP pubblico del server web.
- Configurate per ogni remote collector un'utenza database specifica. Le rispettive credenziali risiedono sul database centrale e nel relativo file di configurazione locale; separare gli account facilita la tracciabilità e la revoca. Questa misura da sola non isola un collector compromesso se i suoi permessi consentono scritture sul database principale.
- La connessione prevede il supporto TLS, impostando chiave privata, certificato e percorso della CA nel file di configurazione. Utilizzatela ogni volta che il database si trova su un server differente.
- Assegnate i permessi affinché il file di configurazione sia leggibile dall'utente del server web e non sia modificabile né dall'utente web né da quello del poller durante l'esercizio ordinario. Assegnatene la proprietà a un utente amministratore. La configurazione dei collector remoti controlla specificamente la possibilità di modificare il file; non presumete che l'installazione del nodo primario debba condividere gli stessi permessi temporanei di scrittura.
- La chiave segreta per il CSRF può essere memorizzata su file anziché su database. Scegliendo questo approccio, il file deve necessariamente trovarsi all'esterno della root dei documenti web. Questo requisito è tassativo, non un suggerimento.

## Posizionare le directory dei dati fuori dalla root web

Nelle installazioni posizionate direttamente alla radice del repository, cartelle riservate con dati e
codice sorgente possono risultare raggiungibili dal web. Diverse cartelle contengono file `.htaccess`
con divieti di accesso; verificate la struttura reale dell'installazione e la configurazione del server web
anziché presumere che ogni percorso sia protetto. L'attuale percorso di migrazione del framework implica
inoltre che reindirizzare l'intero sito verso `public/` senza le rotte legacy non rappresenta una
soluzione di pubblicazione completa.

I file di controllo operano solo con Apache e a patto che la configurazione consenta sovrascritture in
quella specifica directory. Su nginx risultano del tutto inefficaci. Su un server Apache non configurato
correttamente restano inerti. Un blocco inefficace sulla cartella dei log permette a chiunque di consultare
i log dell'applicazione, scoprendo nomi dei dispositivi, account, interrogazioni ed errori di sistema.
Apache descrive il funzionamento richiesto per le sovrascritture nella propria
[guida a `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Adottate entrambe le precauzioni:

**Verificare i percorsi di archiviazione prima del trasferimento dei dati.** La destinazione dei log
è modificabile, ma `include/global.php` imposta la radice RRA sulla directory `rra` dell'installazione;
non esiste un parametro globale a interfaccia grafica per definire questa cartella. Una partizione montata
separatamente può conservare la struttura prevista, ma la sola posizione nel file system non impedisce
l'accesso via HTTP attraverso cartelle esposte o collegamenti simbolici. Controllate insieme percorsi delle
origini dati, permessi dei servizi, procedure di backup e regole di diniego web. Non modificate la
posizione delle directory di cache senza aver compreso come i vari componenti risolveranno i file. Consultate
[Migrare su nuovo hardware](/it/guides/migrate-to-new-hardware/) e
[Aggiornare in sicurezza](/it/guides/upgrade-safely/).

**Interdire i percorsi privati tramite la configurazione del web server.** Adattate
[l'esempio per Nginx dalla radice del repository](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
alle peculiarità del vostro server e prefisso URL; le regole di interdizione devono prevalere rispetto
alle direttive generali di gestione del PHP. La tabella seguente funge da guida al controllo, non da configurazione pronta all'uso:

| Cartella | Motivazione |
|---|---|
| `rra/` | File contenenti le misurazioni |
| `log/` | File di log applicativi con interrogazioni e dettagli sugli errori |
| `cache/` | Verificare la natura delle risorse richieste; interdire l'esecuzione di file PHP nei percorsi di cache |
| `scripts/` | Gli script di raccolta non devono essere accessibili o eseguiti direttamente via HTTP |
| `cli/` | Strumenti a riga di comando non destinati a essere invocati da web |
| `mibs/`, `contrib/`, `docs/` | Documentazione tecnica e risorse interne |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Componenti architetturali interni, stato e utility |
| File nascosti, file delle dipendenze, file PHP di bootstrap o inclusione | Informazioni di repository e punti di ingresso del codice |

Mantenete accessibili le directory di supporto necessarie come `include/js` e `include/themes`;
bloccare indiscriminatamente l'intera cartella include può compromettere l'interfaccia. Verificate
le regole di blocco adoperando percorsi fittizi e accertatevi che le risposte del server non mostrino
codice sorgente o contenuti dei file. Non effettuate test tentando di leggere file con chiavi riservate
da terminale o log.

È inoltre disponibile un file opzionale con le intestazioni di sicurezza per le risorse statiche.
Gli script PHP impostano i propri header direttamente nel codice; i file statici non lo fanno a meno
che non si abiliti quel file o non si inseriscano le medesime direttive nel web server.

La Content Security Policy (CSP) è personalizzabile. Le direttive base per gli script permettono
l'esecuzione di JavaScript inline privo di nonce, dal momento che molti plugin ne dipendono. La modalità
più stringente con nonce mostrata nelle impostazioni opera in sola modalità di monitoraggio (report-only).
Il codice di emissione degli header supporta anche l'imposizione del parametro `nonce`, a dispetto di
quanto riportato nella [guida non aggiornata delle impostazioni](https://github.com/kadupulhq/kadupul/issues/265).
L'applicazione vincolante e la modalità report-only sono profondamente diverse; ispezionate gli header e
convalidate ogni pagina e plugin prima di cambiare modalità. La presenza del codice di blocco non garantisce
la totale compatibilità dell'applicativo con i nonce.

## Il poller esegue comandi a livello di sistema

Questo meccanismo trasforma in modo significativo il modello di rischio.

La raccolta non si limita al solo protocollo SNMP. Un metodo di inserimento dati può specificare un
comando da lanciare e il poller lo eseguirà. La stringa di comando viene archiviata nella cache del poller
ed eseguita periodicamente dal collector con l'account di sistema operativo associato a quest'ultimo.
Gli script gestiti tramite PHP script server adoperano un processo PHP autonomo persistente. I comandi
esterni e le chiamate allo script server seguono percorsi distinti; non presumete che qualunque script
venga elaborato da tale server o che il collector in C sia stato certificato per questa versione.

Considerate i permessi elencati come aree altamente privilegiate capaci di consentire l'esecuzione di
codice. Le conseguenze variano in base ai componenti attivi e ai vincoli di sicurezza:

| Permesso | Motivazione |
|---|---|
| Metodi di inserimento dati | Stabilisce direttamente la riga di comando da lanciare |
| Importazione modelli | Un template o package importato può contenere metodi di input con comandi |
| Amministrazione plugin | Il codice dei plugin opera all'interno dell'applicazione |
| Impostazioni / Utilità | Definisce i percorsi degli eseguibili richiamati dal sistema |

Non assegnate questi privilegi a chi non disponga già di un accesso shell sul server. Un account con
sola visualizzazione dei grafici si colloca su un piano di rischio completamente differente, ed è questo
il profilo che la quasi totalità degli utenti dovrebbe avere.

Sono previsti due strumenti di protezione ed è opportuno utilizzarli entrambi:

**Filtro sui metacaratteri.** L'utilizzo di metacaratteri shell nei comandi di input dati è bloccato
di default. Esiste una preferenza che ne consente l'uso, mantenuta per compatibilità con vecchie
configurazioni strutturate su pipeline shell. Lasciatela disabilitata. Se necessitate di funzionalità
analoghe, incapsulate la pipeline in uno script nella cartella degli script e richiamate quest'ultimo.

**La lista dei comandi consentiti.** Un file, definito nella configurazione di sistema, che raccoglie
i comandi approvati per ciascun metodo di input dati. Se valorizzato, impedisce la creazione di grafici
e origini dati a partire da metodi il cui comando non figuri nella lista. Modificare un comando
autorizzato ne impedirà l'esecuzione finché il file non verrà aggiornato e verificato. La procedura di
aggiornamento si effettua da riga di comando, e questo è il suo punto di forza: esige un accesso alla
shell del server, non una semplice sessione web da amministratore.

Il controllo viene applicato nuovamente alla ricostruzione della cache del poller. Un metodo non
conforme non produrrà elementi nel poller e i dati residui verranno cancellati alla successiva
rigenerazione con commit. Questo meccanismo disciplina l'aggiunta e il popolamento della cache; non
interrompe all'istante elaborazioni già in esecuzione e non implica che ciascun collector rilegga la
lista aggiornata a ogni singolo avvio. Accertatevi dello stato della cache e del comportamento dei
collector dopo ogni variazione di sicurezza.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

L'opzione `--update` priva di argomenti recepisce tutti i comandi attualmente presenti nella whitelist;
non ricorretetevi per evitare di revisionarli attentamente. Salvaguardate il file della whitelist e la
cartella genitore impedendo la scrittura agli account dei servizi. Rimane inattiva se non espressamente
abilitata. Consultate [Scrivere uno script per la raccolta dati](/it/guides/write-a-data-collection-script/)
per ulteriori dettagli.
Questo accorgimento innalza notevolmente il costo di un attacco tramite interfaccia web, poiché per
introdurre un nuovo comando nella raccolta sarà necessario ottenere anche i permessi di scrittura sul file
system del server. Tuttavia non elimina l'esigenza di limitare i permessi indicati nella tabella, dato che
un attaccante capace di sfruttare un comando già approvato non ha bisogno di crearne uno nuovo.

## Autenticazione

Il sistema supporta quattro modalità di autenticazione. La disponibilità dipende dalle estensioni PHP presenti.

| Metodo | Dove vengono convalidati gli utenti | Dettagli |
|---|---|---|
| Integrato | Nel database locale | Gestione autonoma di password, criteri e blocchi account |
| Web di base | Dal server web | Kadupul delega interamente al web server la convalida dell'utente |
| LDAP | Su una singola directory | Richiede l'estensione PHP LDAP |
| Domini multipli LDAP/AD | Su più directory | Richiede il medesimo modulo |

La schermata delle impostazioni espone questi metodi autenticati, escludendo la vecchia modalità zero
priva di autenticazione. Il bootstrap applicativo cerca di ricondurre vecchie installazioni senza
autenticazione verso il login locale, ma funzioni interne di livello più basso includono tuttora rami
ereditati per la modalità zero. Controllate il metodo salvato, le identità censite e le rotte protette
anziché dare per certa la sicurezza basandovi sulla sola assenza dell'opzione nell'interfaccia.

Aspetti da verificare:

- **L'autenticazione web di base delega la convalida dell'identità.** Kadupul interpreta le variabili trasmesse dal server web quando questa modalità è attiva, continuando comunque ad applicare mappatura degli utenti, stato di abilitazione e permessi. Un'identità assente non coincide automaticamente con un profilo amministrativo. Configurate il web server per proteggere ogni rotta e impedite ai client di iniettare variabili di identità contraffatte; convalidate in modo indipendente le rotte per le immagini, le esportazioni e la gestione dell'accesso ospite.
- **La funzione "Resta collegato"** è abilitata come impostazione predefinita. Un token permanente viene generato solo se l'utente spunta l'opzione al momento dell'accesso, non in modo indistinto per qualsiasi sessione. Scade trascorsi novanta giorni di mancato utilizzo. Se l'installazione è raggiungibile da Internet, valutate con cura se mantenerla attiva.
- **Configurate l'utente ospite (guest) su nessun utente**, a meno che non desideriate espressamente consentire la visualizzazione aperta dei grafici. L'impostazione predefinita non assegna alcun utente, ed è la scelta corretta; accertatevi che non sia stata modificata durante l'installazione.
- **Collocate un sistema di autenticazione a più fattori (MFA) a monte.** L'applicazione non supporta nativamente l'MFA. Tale protezione va integrata a livello di proxy o tramite un gateway SSO.

## Endpoint dei raccoglitori remoti

In presenza di collector remoti, l'installazione centrale mette a disposizione un endpoint dedicato
alle loro comunicazioni. Non effettua autenticazione basata su sessioni utente, ma convalida le chiamate
risolvendo l'indirizzo IP di provenienza e confrontandolo con gli hostname dei collector autorizzati,
tracciando i fallimenti nei log di sicurezza.

Ne discendono due conseguenze. Primo, tale endpoint non deve risultare raggiungibile dalla rete pubblica;
limitatene l'accesso tramite web server ai soli IP dei collector. Secondo, l'indirizzo verificato è quello
estratto dalla richiesta, per cui le regole di attendibilità dei forward header configurate in precedenza
sono valide anche in questo caso. Ritenere attendibili header non controllati consente a un client di
simulare l'IP di un collector.

In aggiunta, l'opzione che tollera certificati autofirmati o discrepanze tra gli hostname nei collegamenti
tra server centrale e collector remoti è attiva per impostazione predefinita. Generate certificati validi
per i vostri nodi e disattivate questa tolleranza.

## Checklist essenziale

1. Terminazione TLS completata, HTTP reindirizzato prima dell'autenticazione, HTTPS gestito correttamente a livello PHP dal server web affidabile e cookie Secure verificati. Header per gli IP limitati a quelli manipolati dal proxy.
2. Password dell'amministratore di default modificata e verificata. Blocco account attivo.
3. Permessi del database verificati per installazione, manutenzione e collector; accesso alla tabella timezone verificato e connettività di rete al database riservata ai soli nodi necessari.
4. Percorsi dei file verificati, cartelle riservate e metadati interdetti sul web server, e file statici essenziali funzionanti.
5. File di configurazione protetto da scrittura a runtime. File segreto per il CSRF, se presente, esterno alla root web.
6. Permessi per Metodi di inserimento dati, Importazione modelli e Amministrazione plugin negati a chi non possieda accesso da riga di comando al server. Filtro metacaratteri attivo. Whitelist degli input abilitata.
7. Endpoint per i collector remoti limitato per indirizzo IP. Verifica rigorosa dei certificati abilitata.
8. MFA collocato all'interno del proxy a protezione dell'intera piattaforma.
