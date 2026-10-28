---
title: Permessi e accesso
description: Perché l'accesso è suddiviso in due sistemi indipendenti, perché un permesso è memorizzato come valore predefinito più eccezioni e perché un albero appare diverso per ogni account.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 8
---

L'accesso prevede controlli distinti per realm e policy sugli oggetti. I realm governano quali funzionalità
dell'interfaccia un account è abilitato a utilizzare; le policy sugli oggetti determinano i grafici, i dispositivi,
i modelli e gli alberi consentiti. Una richiesta può dipendere da entrambi. Le assegnazioni di realm non
garantiscono di per sé l'accesso ai grafici, e i permessi sui grafici non abilitano alle funzioni della Console.
Lo stato dell'account, la modalità di autenticazione e le impostazioni di visualizzazione rivestono pari importanza.

Questa pagina illustra le motivazioni architetturali di tale modello. Per gli aspetti operativi nella creazione
di un account, si veda [Gestire utenti e permessi](/it/guides/manage-users-and-permissions/).

## Perché due sistemi

I due quesiti non appartengono alla stessa tipologia.

Raggiungere una pagina riguarda il codice. L'account è abilitato o meno a eseguire l'editor dei dispositivi,
e vi è un'unica risposta per l'intera installazione. Vedere un dispositivo riguarda i dati. Esistono migliaia
di dispositivi e la risposta differisce per ciascuno di essi.

Unificarli comporterebbe la gestione di un permesso per pagina per oggetto, ossia il prodotto di due elenchi
entrambi in costante espansione. Separarli significa mantenere un elenco di sezioni di interfaccia, contenuto
e immutabile, e un insieme di regole per oggetto. Il prezzo di tale ripartizione risiede nella necessità di
configurarli entrambi; un account configurato erroneamente nell'uno o nell'altro manifesta la medesima anomalia di accesso.

## I realm sono un elenco numerato fisso

Un realm individua un permesso di interfaccia tramite un identificativo numerico. Le mappature del core
associano pagine ai realm, mentre i plugin possono registrarne di supplementari. Controllate i realm e
l'identità prescritti per la route effettiva anziché interpretare l'accesso alla pagina quale verdetto definitivo
sull'autorizzazione degli oggetti.

Identificativi numerici, anziché nomi di file, poiché un realm abbraccia svariate pagine e i file possono
essere rinominati. Il numero permane; l'elenco sottostante rappresenta una corrispondenza modificabile senza
intervenire su alcun account.

I realm attribuiti a un account derivano dall'account medesimo e dai gruppi abilitati a cui appartiene,
combinati tramite unione. I ruoli sono insiemi di numeri di realm applicati con una sola operazione. Un ruolo
registra i propri numeri sull'account e termina lì la propria azione: costituisce un punto di partenza e non
un collegamento dinamico, per cui un account generato a partire da un ruolo non muta qualora il ruolo venga modificato.

I plugin introducono realm propri, memorizzati separatamente e gestiti dagli account esattamente come i realm
del core. Un plugin aggiunge pertanto una nuova superficie soggetta a controllo degli accessi che le vostre
policy devono vagliare esplicitamente. Si veda [Plugin](/it/concepts/plugins/).

## Gli oggetti sono memorizzati come impostazione predefinita più eccezioni

Quattro categorie di oggetti contemplano permessi: grafici, dispositivi, modelli di grafici e alberi.

Per ciascuna tipologia, un account (o un gruppo) detiene una policy predefinita e un elenco di eccezioni.
Un'eccezione si sostanzia in una singola riga: soggetto, oggetto specifico, categoria. Tale riga è identica
in entrambe le modalità di policy. È la policy a determinare il significato della riga.

Questa è la decisione architetturale fondamentale dell'intero modello. Nelle tabelle delle eccezioni viene
registrata unicamente la divergenza rispetto all'impostazione predefinita. Policy predefinite basate su Consenti
senza eccezioni possono concedere ampio accesso senza righe di eccezione; le righe dell'account, delle impostazioni
predefinite e dei realm continuano a esistere. Cinque dispositivi esplicitamente consentiti con un'impostazione
predefinita Nega richiedono cinque eccezioni sui dispositivi, pur potendo altri permessi e metodi influire sulla
visibilità. Qualunque sia l'orientamento adottato, i dati archiviati mantengono le dimensioni della porzione
rilevante anziché quelle dell'intero insieme.

## Perché esistono entrambe le modalità di policy

| Modalità | Significato | Comportamento all'aggiunta di un dispositivo |
|---|---|---|
| Consenti, con eccezioni | Oggetti di tale categoria eccetto le esclusioni elencate | La policy sui dispositivi ammette il nuovo oggetto; si applicano gli altri controlli |
| Nega, con eccezioni | Unicamente gli oggetti elencati di tale categoria | Questa origine non concede alcun nuovo dispositivo; altre origini o concessioni possono consentire l'accesso |

Le impostazioni predefinite divergono nella gestione dei nuovi elementi. Scegliete l'ambito della policy e la
condotta in caso di errore in modo ponderato; nessuna delle due descrive da sola la totalità dei controlli
d'accesso della richiesta.

"Tutti i componenti del team di rete, salvo i due rack assegnati all'amministrazione" sono due righe con Consenti
e quattromila con Nega. "Questo collaboratore esterno, e solo questi cinque dispositivi" sono cinque righe con
Nega e quattromila con Consenti. Imporre un'unica modalità significherebbe dover censire l'intero parco per
metà delle policy reali, e una lista così estesa non viene mai mantenuta.

Un'impostazione predefinita Consenti ingloba gli oggetti aggiunti di recente, a meno che non siano esclusi.
Un'impostazione Nega esige un'eccezione esplicita da tale origine. Si tratta di regole semantiche di policy
predefinita, non di garanzie sulla gestione degli errori. Esaminate gli altri utenti/gruppi e i metodi di permesso
sui grafici prima di presumere che un'impostazione Nega sui dispositivi nasconda automaticamente i relativi grafici.

## L'accesso è un'unione e non esiste il divieto

L'accesso effettivo viene calcolato unendo la policy propria dell'account e quella di ciascun gruppo abilitato
di cui è membro. Per l'accesso ai grafici, applicate dapprima il metodo di grafico selezionato all'interno di
ogni origine separatamente, procedendo poi all'unione dei risultati. Con il metodo Restrittivo, l'autorizzazione
su un dispositivo in un gruppo e quella su un modello in un altro non formano la coppia prescritta.

Non esiste un divieto a livello di gruppo in grado di revocare un permesso concesso da un'altra sorgente.
Un'esclusione sotto un'impostazione predefinita Consenti sottrae unicamente il contributo di tale origine; non
costituisce un diniego assoluto. Rimuovere tale esclusione estende l'accesso, a differenza dell'eliminazione di un
permesso sotto Nega. Si tratta di una scelta intenzionale: un modello comprendente concessioni e dinieghi
richiede regole di precedenza, e le regole di precedenza rendono i sistemi di autorizzazione impossibili da
sottoporre ad audit mediante semplice lettura.

Le conseguenze pratiche devono essere enunciate chiaramente.

Revocare un accesso richiede la rimozione sia dall'account sia da ciascun gruppo che lo accorda. Cancellarlo in
un punto non sortisce effetto se un altro punto continua a erogarlo.

Disabilitare un gruppo elimina i relativi permessi per tutti i membri simultaneamente, rendendo il gruppo uno
strumento di revoca di gran lunga superiore a una sequenza di interventi individuali.

Non è possibile stabilire "cosa può vedere questo account" consultando una sola riga. Occorre combinare le quattro
policy e i quattro elenchi dell'account con i dati omologhi di ciascun gruppo.

## Perché l'autorizzazione per i grafici ha quattro metodi

Un grafico possiede una triplice identità. Esiste di per sé, afferisce a un dispositivo ed è derivato da un modello
di grafico. Tutti e tre possono ospitare permessi, pertanto il modello deve stabilire quale combinazione risulti valida.
Tale scelta rappresenta un'impostazione comune all'intera installazione.

| Metodo | Quesito posto | Insiemi di eccezioni consultati |
|---|---|---|
| Permissivo | Almeno uno dei tre è consentito? | Tre |
| Restrittivo | Il grafico è consentito, oppure sia il dispositivo sia il modello sono consentiti all'interno della stessa origine? | Tre |
| Basato sul dispositivo | Il grafico o il dispositivo è consentito? | Due |
| Basato sul modello di grafico | Il grafico o il modello è consentito? | Due |

Tali criteri illustrano i controlli di autorizzazione in essere. Le assegnazioni dirette sui grafici restano valide
in tutti e quattro i metodi; la scelta di Basato sul dispositivo non le annulla. Misurate le prestazioni su policy
e infrastrutture reali anziché presumere che il numero degli insiemi di eccezioni anticipi il costo della query.

Il metodo Permissivo costituisce il valore predefinito, ed è l'impostazione che desta maggior stupore. Sotto il
profilo permissivo, consentire un modello di grafico autorizza tutti i grafici generati da esso, su qualsiasi
dispositivo, inclusi dispositivi a cui l'account non ha mai avuto accesso. Il motore si conforma esattamente a
quanto documentato. Semplicemente, tale logica non coincide con quanto la maggior parte delle persone intuisce.

## I permessi vengono compilati nelle query

Il filtraggio dei permessi sugli elenchi dei grafici è integrato nelle query verso il database. Una pagina che
mostri venti grafici su un totale di quattromila non può recuperare quattromila righe per scartare a posteriori
quelle precluse all'account: il conteggio risulterebbe falsato, la paginazione compromessa e l'elaborazione
scalerebbe con l'infrastruttura globale anziché con le dimensioni della pagina.

Pertanto, le policy e gli elenchi di eccezioni vengono convertiti in clausole di join e di filtro (where)
affidate al database. Il modello di autorizzazione è stato congegnato in parte per superare indenne tale trasposizione.
Insiemi di identificativi e un flag predefinito compilano agevolmente in SQL. Una logica arbitraria per oggetto non
lo consente.

Il percorso dei grafici dispone di una scorciatoia per permessi estesi, quale l'impostazione Consenti sui grafici
senza alcuna eccezione. Non estendete tale comportamento a ogni categoria di oggetti o a qualunque route. Le
verifiche su realm, stato dell'account e preferenze di visualizzazione rimangono doverose; l'ottimizzazione delle
query sui permessi non si sostituisce ai test di accesso.

## Gli alberi sono un asse separato

Il permesso sugli alberi e il permesso sui grafici vengono valutati in modo indipendente. Ottenere accesso a un
albero non concede diritti sui relativi contenuti. Avere accesso a un grafico non presuppone l'accesso a un albero.

Un albero è una presentazione di oggetti, non un contenitore che ne detiene la proprietà. Il medesimo grafico può
comparire in cinque alberi differenti. Se l'albero autorizzasse i suoi contenuti, modificare un albero equivarrebbe
a modificare le autorizzazioni, e chiunque fosse abilitato a disporre i grafici risulterebbe abilitato a divulgarli.

Ciò che l'albero attua è semplicemente occultare i nodi vuoti. Un ramo viene mostrato qualora racchiuda qualcosa che
l'account ha facoltà di consultare, con verifica ricorsiva: un ramo i cui sotto-rami risultino tutti vuoti per
quell'account viene celato a sua volta. Due persone che consultino il medesimo albero vedranno strutture differenti,
senza alcun marcatore che suggerisca cosa veda l'altra.

Tale controllo di assenza ha un costo. Scorre il ramo e formula ricorsivamente le interrogazioni sui grafici e
sui dispositivi individuati. Un albero ramificato unito a un metodo oneroso di autorizzazione sui grafici produce
scadimento delle prestazioni, motivo per cui esistono metodi più lineari.

La rilevanza sul piano dell'audit supera quella prestazionale. **Una vista ad albero non è un prospetto esaustivo
degli accessi di un account.** È un prospetto di ciò a cui un account può accedere *e che qualcuno ha posizionato
in quell'albero*. Per verificare gli accessi, esaminate le policy e controllate concretamente richieste ammesse e
negate. La schermata Policy Effettiva procede da un codice separato dai controlli di autorizzazione, pertanto la
relativa dicitura e il tooltip non devono costituire prova conclusiva. Si veda
[Verificare chi può vedere cosa](/it/guides/audit-who-can-see-what/).

## La memorizzazione nella cache e perché le modifiche si applicano in momenti insoliti

Le risposte sulle autorizzazioni vengono memorizzate nella cache della sessione, evitando di riproporre la medesima
interrogazione su ogni pagina caricata. Una modifica operata da un amministratore etichetta come obsolete le
risposte in cache dell'account interessato, e la pagina successiva richiamata da quell'account le ricalcola senza
attendere una nuova autenticazione.

La disattivazione di un account elimina le credenziali persistenti, i permessi in cache e le sessioni lato server.
Le richieste protette verificano altresì la condizione abilitato/bloccato; una pagina già renderizzata in un browser
non viene cancellata seduta stante. Le route compatibili con gli ospiti possono risolvere un'identità ospite
separata se configurate in tal senso, per cui una risposta positiva non certifica di per sé che l'account
disabilitato conservi prerogative.

Verificate le modifiche avvalendovi di sessioni preesistenti e nuove, controllando sia gli accessi mantenuti sia quelli
revocati e registrando il contenuto della risposta nonché l'identità attiva. Non utilizzate il codice di stato HTTP
come sola attestazione di autorizzazione, né date per scontato che ogni processo che impiega la cache si aggiorni
in modo sincronizzato.
