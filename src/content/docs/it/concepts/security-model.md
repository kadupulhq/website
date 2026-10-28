---
title: Modello di sicurezza
description: Dove i dati non attendibili entrano in Kadupul, quale processo viene eseguito con quale privilegio, cosa può fare l'account del database e quali confini il codice impone anziché presumere.
banner:
  content: Kadupul è in versione pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 12
---

Un sistema di monitoraggio è complesso da difendere, per tre ragioni indipendenti dalla qualità del
codice.

Contiene credenziali per ogni elemento monitorato. Community SNMP, nomi utente e passphrase v3 e ogni
altro dato necessario a un dispositivo vengono memorizzati affinché il poller possa utilizzarli senza
supervisione. Non vi è un operatore umano che li inserisca manualmente ogni cinque minuti.

Esegue comandi pianificati. Raccogliere un valore che SNMP non espone richiede l'esecuzione di uno
script, e la definizione di tale script è configurazione memorizzata nel database e modificabile tramite
l'interfaccia.

Acquisisce dati generati dalle macchine monitorate. La descrizione di un'interfaccia, un punto di
montaggio disco, il nome di un sensore: tutto proviene dal dispositivo e tutto confluisce nel database,
nei titoli dei grafici e negli argomenti passati ad altri programmi. Uno switch compromesso è una
sorgente di input, non solo una vittima.

Nessuno di questi aspetti costituisce un difetto. Sono requisiti intrinseci del sistema. Di seguito
viene descritta la collocazione di ciascun elemento nell'architettura.

## Dove entrano gli input non attendibili

Quattro punti di ingresso, ordinati in base al livello di controllo esercitato dall'operatore.

| Punto di ingresso | Sorgente | Destinazione |
|---|---|---|
| Parametri HTTP | Chiunque possa raggiungere il server web | Database, output delle pagine e SQL |
| Valori SNMP | Il dispositivo interrogato | `host_snmp_cache`, titoli dei grafici, limiti RRD, argomenti di script |
| Output di script | Uno script locale o il sistema con cui ha comunicato | `poller_output`, poi file RRD |
| Modelli e pacchetti caricati | Chiunque detenga l'ambito di importazione | Righe dei modelli e, per i pacchetti, file su disco |

### Parametri HTTP

Gli helper per le richieste risiedono in `lib/html_utility.php`. `get_filter_request_var()` convalida
in modo predefinito valori interi, ma presenta eccezioni per valori vuoti, non definiti o regex. Il
chiamante deve comunque verificare se un valore è richiesto e appropriato per l'operazione. Il
filtraggio non stabilisce l'autorizzazione.

`set_request_var()` memorizza un valore nella cache `$_CACTI_REQUEST` e lo riflette negli array
della richiesta. `get_nfilter_request_var()` legge tale cache o la richiesta non elaborata e non
convalida né scrive il valore autonomamente. Letture successive possono pertanto osservare un valore
precedentemente memorizzato, rendendo rilevante l'ordine di lettura.

Quando `log_validation` è abilitato, `get_request_var()` registra determinate letture di richieste
non memorizzate nella cache. Le letture superglobali dirette e `get_nfilter_request_var()` non sono
tutte coperte. Si tratta di un supporto diagnostico, non di un controllo o imposizione completa della
convalida.

### Valori SNMP

Il discovery delle query dati memorizza valori indicizzati selezionati in `host_snmp_cache`; i normali
risultati di polling SNMP seguono il percorso dei campioni. `data_query_format_record()` in
`lib/data_query.php` applica due trasformazioni prima dell'archiviazione: una mappa facoltativa
`rewrite_value` tratta dalla definizione della query e `bin2hex()` su qualsiasi valore la cui
codifica non sia identificabile da `mb_detect_encoding()`. Quest'ultima operazione protegge dalle
stringhe di ottetti binari, non dai contenuti ostili.

Da lì il valore si propaga. Assegna i nomi ai grafici tramite `substitute_snmp_query_data()`. Può
impostare un massimo RRD, poiché un modello di dati può dichiarare il proprio massimo come
`|query_ifSpeed|`. Diventa un argomento per una query di script, in cui `get_script_query_path()`
passa preventivamente ogni parte attraverso `cacti_escapeshellarg()`.

L'escaping e i validatori di RRDtool descritti in
[Integrazione con RRDtool](/it/reference/rrdtool-integration/) costituiscono il confine in questo
ambito. I dati del dispositivo devono rimanere non attendibili. La convalida e l'escaping sono proprietà
di ciascun punto di chiamata; la presenza di helper non garantisce che ogni consumatore li utilizzi
correttamente. Verificare sia la struttura del comando sia l'argomento sostituito.

### Output di script

Il ramo `popen()` di `exec_poll()` legge con `fgets(..., 8192)`, restituendo al massimo 8.191 byte
o la prima interruzione di riga. La soluzione alternativa `shell_exec()` presenta un comportamento di
output differente, e la raccolta tramite script server segue un altro percorso.

`prepare_validate_result()` riconosce valori numerici e sconosciuti, formati esadecimali e alcune
strutture di output multi-campo. Può anche rimuovere testo per ottenere un valore numerico; non
costituisce un filtro scalare universale e rigoroso. Anche l'analisi successiva e la convalida di RRDtool
sono rilevanti. Consultare [Metodi di input dei dati](/it/reference/data-input-methods/).

I controlli sull'output non isolano retroattivamente uno script già eseguito. Esaminare il comando, la
whitelist di input e i privilegi del sistema operativo prima di abilitare la raccolta.

### Modelli e pacchetti

Due meccanismi differenti condividono un unico ambito.

Un'**importazione di modello** è XML semplice privo di firma. Crea modelli, query dati e metodi di
input dei dati. Un metodo di input dei dati è una riga di comando, quindi costituisce un percorso da
un file caricato a un comando che il poller eseguirà. `lib/import.php` esegue
`cacti_input_string_is_safe()` su ciascun `input_string` importato e rifiuta il metodo se contiene
metacaratteri di shell, registrando:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

Un'**importazione di pacchetto** è firmata. `import_read_package_data()` legge la chiave pubblica
incorporata nel pacchetto e la confronta con le tre chiavi compilate in `lib/import.php`: le due
chiavi Cacti e la chiave Kadupul. Qualsiasi altra chiave fallisce. Un pacchetto senza elemento
`<publickey>` viene interpretato come facente riferimento alla chiave Cacti precedente e deve quindi
produrre una firma verificabile rispetto a essa. `import_read_package_data()` rifiuta qualsiasi chiave
inferiore a 2048 bit prima di tentare la verifica, requisito che la chiave precedente (da 512 bit) non
soddisfa. Ciascun file contenuto reca una propria firma, verificata separatamente.

I pacchetti possono successivamente scrivere file selezionati. I nomi accettati iniziano con
`scripts/` o `resource/`, facoltativamente preceduti da un prefisso valido `plugins/<name>/`.
L'utilità di importazione rifiuta byte NUL, percorsi relativi con traversal e percorsi assoluti,
verificando il contenimento sotto la radice dell'installazione; contenere semplicemente il nome di una
directory non è sufficiente. Anche i permessi di scrittura della destinazione determinano il successo
dell'operazione. Un pacchetto che supera la verifica scrive deliberatamente codice PHP eseguibile
nell'albero di installazione. La verifica della firma certifica l'identità di firma accettata e
l'integrità, non la totale innocuità del codice. Anche l'autorizzazione dell'ambito, il contenimento dei
percorsi, i file selezionati, i permessi del file system e la whitelist dei comandi sono essenziali.

Entrambi i meccanismi risiedono dietro l'ambito 17. Il ruolo standard Editor modelli detiene l'ambito 17
e l'ambito 2 (Metodi di input dei dati). Un account con tali permessi può definire comandi di raccolta,
soggetto a convalida e gestione della whitelist. Questa è la finalità del ruolo, ed è opportuno esserne
consapevoli prima di concederlo. Consultare
[Importare ed esportare modelli](/it/guides/import-and-export-templates/) per il flusso di lavoro
convalidato e i limiti noti.

## Cosa viene eseguito con quale privilegio

| Processo | Avviato da | Eseguito come | Funzione |
|---|---|---|---|
| Interfaccia web | Il server web | Utente del server web | Legge e scrive nel database, esegue il rendering dei grafici tramite RRDtool, scrive file RRD su richiesta, scrive file di pacchetto durante l'importazione |
| `poller.php` | Scheduler o servizio configurato | Account del servizio/scheduler | Legge la cache del poller, avvia i collector, scrive file RRD |
| `cmd.php` | Poller o percorso di raccolta in tempo reale | Account che esegue l'avvio | Esegue richieste SNMP get e comandi di raccolta |
| `script_server.php` | Collector | Account che esegue l'avvio | Include un file PHP e chiama una funzione nel proprio processo |
| RRDtool | Il processo web o il poller | L'entità chiamante | Legge e scrive file sotto `rra/` |

Due di essi meritano un approfondimento:

**Lo script server non è una sandbox.** Include il file di destinazione in un processo PHP a lunga
durata e vi chiama una funzione. Tale funzione condivide il processo, la sua memoria e la sua
connessione al database. I controlli in `script_server.php` stabiliscono se la chiamata ha luogo:
il `realpath()` del file da includere deve risolversi sotto `$config['base_path']` o
`$config['scripts_path']`, la funzione deve esistere dopo l'inclusione,
`ReflectionFunction::isInternal()` deve risultare false e il file di definizione della funzione deve
trovarsi anch'esso sotto una radice consentita. Superati questi requisiti, il codice viene eseguito
con i pieni privilegi del poller. Un metodo basato su script server è un modo per eseguire PHP
all'interno di Kadupul, non accanto a esso.

**Il processo web può scrivere file RRD.** Le richieste di grafici possono attivare aggiornamenti
Boost su richiesta e la creazione di file. Un avviso che demanda la creazione di una directory al
poller non rende l'accesso in scrittura da parte del server web universalmente facoltativo. Le verifiche
preliminari dell'archiviazione e il coordinamento della manutenzione controllano anche l'accesso
all'account e le configurazioni UID/GID numeriche di attendibilità. La creazione eseguita come root tenta
di allinearsi alla proprietà dello storage, ma possono essere registrati errori. Consultare
[Aggiornare in sicurezza](/it/guides/upgrade-safely/).

Gli account del server web e del poller pianificato possono differire. La raccolta in tempo reale
avviata da una richiesta web può ereditare l'account web, cosicché l'esecuzione dei comandi non è
limitata all'identità del poller pianificato. L'integrazione Spine ereditata richiede una convalida
separata rispetto al binario effettivo; questa pagina non stabilisce una build supportata.

## Di cosa necessita l'account del database

I processi che condividono la medesima configurazione del database normalmente ne condividono l'account.
I collector remoti possono avere credenziali locali e centrali separate; configurazioni specifiche di
distribuzione possono differire. Ispezionare le concessioni effettive per ogni account configurato.

| Requisito | Motivo |
|---|---|
| DML completo sullo schema Kadupul | Normale operatività |
| DDL sullo schema Kadupul | Aggiornamenti e operazioni a runtime quali rotazione delle tabelle Boost, tabelle temporanee e modifiche al ciclo di vita dei plugin |
| `SELECT` su `mysql.time_zone_name` | Gli elenchi dei fusi orari del sito e dei collector leggono tale tabella direttamente |

Non rimuovere i privilegi DDL presumendo che siano necessari solo durante gli aggiornamenti.
L'applicazione non passa universalmente a un'identità di migrazione separata; la separazione degli
account richiede una convalida specifica per ciascun percorso a runtime interessato.

`include/config.php` contiene credenziali del database e i collector remoti possono detenere anche
credenziali centrali `$rdatabase_*`. I permessi del file system, le regole di accesso HTTP, la
configurazione dell'handler PHP e la protezione dei backup sono tutti rilevanti. PHP esegue normalmente
il file anziché servirne il codice sorgente, ma ciò non sostituisce la protezione dalla divulgazione
diretta. Consultare
[Proteggere un'installazione esposta a Internet](/it/guides/secure-an-internet-facing-install/).

Le credenziali dei dispositivi sono memorizzate allo stesso modo. `host.snmp_community`,
`host.snmp_password` e `host.snmp_priv_passphrase` sono colonne ordinarie, scritte da
`api_device_save()` tramite `form_input_validate()` senza fase di cifratura, e copiate nelle righe
`poller_item` affinché il poller le legga. L'accesso in lettura alle tabelle rilevanti può esporre le
credenziali archiviate; ciò non implica l'accesso a ogni possibile sorgente esterna. Le password utente
fanno eccezione: `compat_password_hash()` utilizza `password_hash()` di PHP con
`PASSWORD_DEFAULT`, e un hash MD5 legacy ancora verificabile viene rigenerato al successivo accesso.

## Applicato e puramente convenzionale

Questa è la distinzione fondamentale quando si analizza una modifica.

### Meccanismi nel codice e relativo ambito

| Confine | Meccanismo |
|---|---|
| Autenticazione | Le comuni pagine dell'interfaccia usano `include/auth.php`; gli endpoint specializzati adottano una gestione propria |
| CSRF | Il bootstrap web condiviso configura la gestione dei token; gli array di token non conformi vengono rifiutati. Verificare ciascun endpoint anziché presumere una copertura universale |
| Script per sola CLI | `include/cli_check.php` risponde `404` e termina se la SAPI non è `cli` |
| Percorso XML delle query dati | `cacti_path_is_within()` rispetto a `<base_path>/resource`, registrato e rifiutato in caso contrario |
| Autenticità dei pacchetti | Firma verificata contro chiave incorporata, minimo 2048 bit, firme per singolo file |
| Collocazione dei file dei pacchetti | Nomi non validi rifiutati; prefissi consentiti script/resource e confinamento nella radice verificati |
| Target dello script server | Confinamento tramite `realpath()` e controlli sulle funzioni descritti sopra |
| Argomenti della shell | Escaping, helper di comando strutturati e validatori ove applicati; ispezionare il punto di chiamata effettivo |
| Argomenti di RRDtool | Validatori dei caratteri di controllo e di formato in `lib/functions.php` |
| SQL | I prepared statement associano i valori; SQL dinamico, identificatori e chiamate non preparate richiedono verifica |
| Chiamanti degli agenti remoti | L'indirizzo di origine deve corrispondere a una riga abilitata in `poller`, tramite IP esatto o lookup inverso confermato |

### Responsabilità della distribuzione e dei punti di chiamata

| Confine | Perché non è imposto |
|---|---|
| Filtraggio delle richieste | Una pagina sceglie se adottare `get_filter_request_var()` o meno. `log_validation` segnala, non blocca |
| Escaping dell'output | `html_escape()` e `html_purify()` sono applicati per singolo punto di chiamata |
| Autorizzazione per pagina | Il controllo dell'ambito usa `$user_auth_realm_filenames`, indicizzato per nome file. Una pagina non mappata non ottiene autorizzazione solo da tale tabella. Possono applicarsi verifiche supplementari; le pagine dei plugin devono registrare e applicare la propria policy |
| Negazione di directory | I file `.htaccess` sotto `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` e `cache/*` sono direttive Apache. Sotto nginx o Apache con `AllowOverride` disabilitato, non hanno effetto |
| Header di sicurezza sui file statici | `.htaccess.dist` viene fornito senza ridenominazione. L'emissione degli header PHP dipende dal percorso e dalle impostazioni; le risposte statiche dipendono dalla configurazione del server/proxy |
| Separazione degli utenti web e poller | Una convenzione, non un vincolo |
| Permessi su `include/config.php` | Impostati da chi ha eseguito l'installazione |

I file stub di reindirizzamento `index.php` in `resource/` e nelle relative sottodirectory
impediscono l'elenco dei file. Non costituiscono controllo di accesso e non bloccano la richiesta
diretta di un file specifico.

## Endpoint che rispondono prima dell'autenticazione

Questi rappresentano esempi di punti di ingresso specializzati, non un inventario esaustivo di endpoint
pubblici. L'assenza dell'inclusione comune non dimostra l'assenza di autenticazione o autorizzazione in
altre parti del percorso della richiesta.

| File | Comportamento |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | La superficie di accesso stessa |
| `csp_report.php` | Riceve i report di violazione CSP del browser |
| `service_check.php` | Risponde con `success` o `fail` dopo una query su `version`. Un controllo di integrità senza autenticazione |
| `link.php` | Carica una riga di collegamento esterno, quindi verifica autonomamente `is_realm_allowed($page['id'] + 10000)` |
| `remote_agent.php` | L'RPC del data collector, autorizzato in base all'indirizzo di origine |

`remote_agent.php` è l'elemento cruciale su cui riflettere. La sua autorizzazione si basa su
`remote_client_authorized()`, che confronta `get_client_addr()` con gli hostname e gli indirizzi
presenti nella tabella `poller`. Non vi è alcun segreto condiviso. Un chiamante il cui indirizzo
corrisponda a una riga di data collector abilitata può invocare le azioni dell'agente: eseguire il
polling dei dati, avviare una query dati, effettuare il ping di un dispositivo, inviare richieste SNMP
get e walk, richiedere dati dei grafici ed eseguire il network discovery. Due protezioni definiscono tale
comportamento. Primo, la funzione restituisce direttamente false quando viene restituita al massimo una
riga di collector abilitata, respingendo tale scenario. Secondo, quando la corrispondenza avviene per
hostname anziché per IP esatto, la ricerca inversa deve essere confermata da una ricerca diretta prima
di essere accettata.

`get_client_addr()` legge `REMOTE_ADDR` e null'altro, a meno che `$proxy_headers` non sia impostato
in `include/config.php`. Il valore predefinito è `null`. L'abilitazione degli header proxy supportati
modifica le origini ordinate da cui viene selezionato un indirizzo client valido. Utilizzare solo header
gestiti dal proxy di ingresso attendibile e impedire ai client di eludere o fornire autonomamente tali
valori. Si tratta della singola riga di configurazione che più incide sul significato di qualsiasi
decisione basata sugli indirizzi nel sistema, inclusa l'autorizzazione degli agenti remoti e gli
indirizzi registrati nel log.

## Accesso guest

L'impostazione `guest_user` specifica un account i cui permessi vengono impiegati per le pagine dei
grafici in assenza di autenticazione. L'impostazione predefinita non prevede alcun utente e la
visualizzazione dei grafici richiede quindi autenticazione come ogni altra sezione. L'attivazione di
questo parametro rende pubblico ciò che tale account può visualizzare a chiunque possa raggiungere il
server web. Tale è lo scopo della funzionalità. L'account continua a esistere nei record degli utenti;
l'impostazione guest rende utilizzabili i suoi permessi sui grafici senza un normale accesso. Verificare
le richieste effettive e i permessi sugli oggetti, non solo il nome dell'account configurato.

## Come analizzare una modifica

Porsi tre domande in sequenza:

Quale processo eseguirà questa operazione, e come quale utente? La risposta per un metodo di input dei
dati è normalmente l'account del sistema operativo del collector avviatore; la raccolta attivata dal
web può differire da quella pianificata.

Cosa toccano i dati durante il loro transito? Un valore proveniente da un dispositivo che si limita ad
atterrare in un file RRD ha superato un confine. Lo stesso valore nel titolo di un grafico ne ha
superati due, e nell'argomento di uno script, tre.

Il confine su cui sto facendo affidamento è imposto dal codice o puramente convenzionale? Se è
convenzionale, il codice che si sta scrivendo ne costituisce l'effettiva imposizione.

Letture correlate: [Permessi e accesso](/it/concepts/permissions-and-access/) per il modello di
autorizzazione in sé, [Metodi di input dei dati](/it/reference/data-input-methods/) per il contratto di
esecuzione e la whitelist degli input, e
[Raccolta dati remota](/it/concepts/remote-data-collection/) per ciò che un data collector fa con la
fiducia che gli viene accordata.
