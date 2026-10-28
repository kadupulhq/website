---
title: Plugin
description: Perché la superficie di estensione è un elenco di punti di hook denominati, cosa eredita un plugin eseguendosi all'interno del processo e cosa i controlli fermano e non fermano.
banner:
  content: Kadupul è in versione pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 11
---

Un plugin è codice che l'applicazione include nel proprio processo e chiama in corrispondenza
di punti denominati. Tutte le altre proprietà del modello di plugin discendono da questa singola frase.

Per indicazioni su cosa leggere prima di installare il plugin di qualcun altro, consultare
[Installare e verificare i plugin](/it/guides/install-and-vet-plugins/).

## Perché viene eseguito all'interno del processo

Si osservi a cosa servono i plugin: aggiungere una colonna a un elenco che l'applicazione sta
visualizzando, modificare le opzioni di un grafico prima che venga tracciato, agire sull'eliminazione
di un dispositivo o collegare una scheda. Ognuna di queste operazioni è una modifica a qualcosa che
l'applicazione trattiene in memoria in quell'istante.

Un processo worker isolato richiederebbe un'interfaccia esplicita e la convalida dei suoi risultati.
Ciò può preservare l'isolamento dei privilegi, ma non è il meccanismo impiegato qui: il file del
plugin viene incluso e la sua funzione viene invocata nel processo dell'applicazione.

## Cosa eredita il plugin

Il codice del plugin viene eseguito come l'account del sistema operativo chiamante, con accesso alla
connessione al database del processo e ai permessi del file system. Un chiamante web può disporre di
una sessione; un chiamante CLI non ne ha necessariamente una. Il meccanismo dei plugin non fornisce
un'identità separata, una sandbox né la verifica delle firme.

I permessi di utenti e gruppi regolano l'accesso all'applicazione; non limitano l'esecuzione di PHP
arbitrario all'interno del plugin. Le concessioni del database, i permessi del file system e le
restrizioni del processo limitano comunque ciò che tale processo può fare. Esaminare il plugin prima
dell'installazione e mantenere limitati i privilegi dell'account dell'applicazione.

## Due stili di chiamata

| Stile | L'applicazione | Un plugin che non restituisce nulla |
|---|---|---|
| Notifica | Passa argomenti, ignora il risultato | Il valore di ritorno non viene utilizzato; effetti collaterali ed eccezioni sono rilevanti |
| Trasformazione | Passa un valore, utilizza ciò che viene restituito | Può sostituire il valore con null e bloccare i chiamanti successivi |

Lo stile di trasformazione è ciò che consente a un plugin di aggiungere un pulsante, estendere un
elenco di azioni o alterare un grafico. È anche il punto in cui i plugin si intrecciano: due plugin
sullo stesso punto vedono ciascuno l'output del precedente nell'ordine dei plugin configurato.

Il dispatcher avverte che un array diventa un non-array, o che un valore precedentemente non vuoto
diventa simile a null, solo quando sono presenti più righe di hook corrispondenti. Tale controllo non
costituisce una convalida completa del contratto dell'hook; un singolo plugin può corrompere un
valore senza questo avviso.

## La registrazione è stato, non scoperta

Gli hook risiedono in una tabella: quale plugin, quale nome dell'hook, quale file, quale funzione,
abilitato o meno. Le routine di installazione, aggiornamento e configurazione possono registrare hook;
la registrazione non è limitata alla prima installazione.

L'alternativa sarebbe la scoperta al momento della richiesta, il che implicherebbe la scansione della
directory dei plugin e l'inclusione del codice di ciascun plugin per chiedergli cosa richiede. Una
singola pagina raggiunge molti punti di hook. Includere tutto per scoprire che nulla è collegato è la
soluzione onerosa, quindi l'applicazione interroga la tabella, memorizza nella cache la risposta per
la richiesta e include solo il file indicato da una riga corrispondente.

Tale scelta comporta un costo che vale la pena conoscere. La tabella può non concordare con il file
system. Una directory di plugin eliminata manualmente lascia le sue righe nel database. Le callback
di notifica mancanti possono produrre avvisi attenuati; il dispatcher delle trasformazioni non dispone
di un avviso equivalente per le callback mancanti. Un registro silenzioso non dimostra che la
registrazione sia corretta.

L'ordine di esecuzione deriva dall'ordine di registrazione del plugin ed è regolabile. Una catena di
trasformazione è quindi ordinata in base a parametri controllati da un amministratore.

## A cosa può accedere un plugin

| Capacità | Nota |
|---|---|
| Creare le proprie tabelle | Registrato, in modo che la disinstallazione possa rimuoverle |
| Aggiungere colonne a tabelle esistenti, incluse quelle di base | Registrato, in modo che la disinstallazione possa rimuoverle |
| Registrare ambiti di autorizzazione | Nuove sezioni dell'interfaccia protette da controllo di accesso |
| Dichiarare dipendenze da altri plugin | Versione verificata prima dell'installazione |
| Eseguire su collector remoti | L'invio dipende dall'hook, dallo stile di chiamata, dalle funzionalità e dallo stato della connessione |

Le modifiche allo schema registrate costituiscono il motivo per cui la disinstallazione è distruttiva.
L'applicazione può eliminare tabelle e colonne tracciate, inclusi i dati. Essa richiama inoltre la
callback di disinstallazione del plugin prima della pulizia. Tale callback può apportare altre
modifiche; le modifiche non tracciate non vengono annullate automaticamente e la directory sorgente
del plugin rimane.

Gli ambiti registrati da un plugin sono posseduti da utenti e gruppi allo stesso modo degli ambiti di
base. I nuovi ambiti possono anche concedere l'accesso all'amministratore primario e all'utente della
sessione corrente quando la registrazione lo richiede. Esaminare le concessioni risultanti dopo
l'installazione e l'aggiornamento; non dare per scontato che la policy esistente copra la nuova
superficie.
Consultare [Permessi e accesso](/it/concepts/permissions-and-access/).

## Cosa proteggono effettivamente le misure di protezione

Esistono misure di sicurezza e la loro analisi illustra il modello di minaccia sottostante.

Il file indicato da un hook viene risolto all'interno della directory del plugin stesso. Un percorso
che fuoriesce viene rifiutato e registrato come evento di sicurezza. Il nome della directory di un
plugin è limitato a lettere, cifre, trattino basso e trattino. La registrazione di hook e ambiti è
accettata solo da una funzione il cui nome assomigli a una routine di installazione, aggiornamento o
configurazione; una chiamata proveniente da qualsiasi altro punto viene rifiutata e registrata.

Il controllo del percorso limita quale file una riga di hook può includere. La verifica della
registrazione esamina solo il nome della funzione chiamante alla ricerca di install, upgrade o setup;
non autentica un'operazione del ciclo di vita. Il codice del plugin può usare tale nome durante un
normale caricamento di pagina, quindi questa convenzione non rappresenta un confine di sicurezza.

Tali misure non intervengono su ciò che il codice del plugin esegue una volta avviato. Non
costituiscono un confine di isolamento e non sono state progettate come tale.

## Disabilitato non significa disattivato

Alcuni tipi di hook vengono registrati in stato abilitato al momento dell'installazione: quelli che
forniscono pagine di impostazioni, array di configurazione e definizioni di moduli. Un plugin deve
essere configurabile prima di essere attivato, quindi tali hook vengono eseguiti in entrambi i casi.

Un plugin disabilitato include ed esegue pertanto ancora codice durante alcuni caricamenti di pagina.
La disabilitazione è un interruttore funzionale e anche gli URL diretti del plugin devono essere
esaminati. Se si sospetta codice dannoso, isolare l'installazione ed esaminare la procedura di
rimozione prima di richiamare la disinstallazione, che a sua volta esegue codice del plugin. La sola
eliminazione dei file sorgente non ripulisce le registrazioni né annulla le modifiche al database.

## I collector remoti ottengono una superficie più ridotta

Un plugin dichiara le sue funzionalità nel file di informazioni: se funziona quando il collector può
raggiungere l'installazione principale, se funziona quando non può e se partecipa alla raccolta.

Su un collector, gli hook elencati vengono verificati rispetto ai requisiti delle funzionalità. Gli
hook di trasformazione non elencati vengono comunque inviati; gli hook di notifica non elencati
possono essere inviati se online o se il plugin dichiara il supporto per la gestione/visualizzazione
offline. I salti non vengono registrati universalmente. Si tratta di logica di instradamento, non di
una lista consentita globale né di un confine di isolamento; ispezionare il dispatcher esatto e lo
stato di connessione per l'hook utilizzato.

Il motivo è che un collector rappresenta un ambiente differente. La sua configurazione è una replica
che può essere vecchia di ore e potrebbe non avere alcun collegamento con il database centrale. Un
hook scritto supponendo che il database centrale sia a portata di query risulta errato in tale
scenario, quindi il modello richiede che il plugin dichiari le assunzioni su cui si basa anziché
dedurle. Consultare [Raccolta dati remota](/it/concepts/remote-data-collection/).

## Il poller è il punto più oneroso in cui inserire hook

Un hook nel percorso di polling viene eseguito quando viene raggiunto il suo punto di chiamata. La sua
frequenza dipende dall'evento, dal processo e dall'instradamento del collector; non tutti gli hook
vengono eseguiti in ogni processo a ogni ciclo. Codice lento su un percorso frequente consuma
l'intervallo di polling e può contribuire a lacune nei grafici.

Un hook su una pagina viene renderizzato una volta per una persona che è già in attesa. I due appaiono
identici nella tabella di registrazione ma differiscono di ordini di grandezza nei costi.

## Perché la superficie appare eterogenea

L'API degli hook espone punti di chiamata con scopi e strutture degli argomenti differenti.

Ecco perché l'elenco è ampio e irregolare, perché alcuni punti trasmettono un valore da modificare e
altri informano solo che si è verificato un evento, e perché gli argomenti differiscono nella
struttura da un hook all'altro. Una versione minima dichiarata del core non garantisce la
compatibilità con ogni hook: ispezionare gli argomenti e le aspettative di ritorno di ciascun punto di
chiamata ed eseguire il plugin sulla versione target. Si applicano anche le limitazioni di
compatibilità CLI e di concessione degli ambiti documentate in
[Installare e verificare i plugin](/it/guides/install-and-vet-plugins/); l'installazione riuscita di per
sé non è prova di compatibilità.

La conclusione pratica: un plugin è accoppiato alla versione del core per cui è stato scritto, in
modo molto più stretto di quanto suggerisca il suo requisito minimo dichiarato. Verificare nuovamente
i plugin prima di un aggiornamento del core anziché dopo.
