---
title: Raccolta dati remota
description: Perché la raccolta si distribuisce e l'archiviazione no, cosa gestisce un collector remoto e quanto costa mantenere una seconda copia della configurazione.
banner:
  content: Kadupul è in versione pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 9
---

:::caution[Comportamento ereditato del proxy RRDtool]
La distribuzione del proxy RRDtool non è supportata in Kadupul. Utilizzare l'archiviazione RRDtool
locale (`storage_location = 0`). Le impostazioni del proxy, le descrizioni dei protocolli e i flussi
di lavoro in questa pagina documentano il comportamento ereditato, non un percorso di distribuzione o
migrazione supportato. Consultare [Proxy RRDtool](/it/reference/rrdproxy/).
:::

La raccolta è la parte che non può essere contenuta in una sola macchina. La maggior parte di un ciclo
di polling viene trascorsa in attesa delle risposte dei dispositivi, e l'attesa non si comprime. È
possibile sovrapporre più attesa mediante processi e thread aggiuntivi, fino al punto in cui l'host
di raccolta esaurisce la CPU o il tempo di round-trip verso un sito distante domina l'intero processo.

Un collector remoto utilizza lo stesso codice con un ID collector differente, interrogando un
sottoinsieme di dispositivi. Ciascun dispositivo indica il collector responsabile. Tale assegnazione
costituisce la consueta partizione di pianificazione. Mantenere coerenti l'assegnazione dei dispositivi
e la cache replicata del poller; tale scelta di pianificazione non dimostra che ogni scrittura dei
risultati imponga la proprietà del collector.

Per chiarire *quando* ricorrere a un collector, consultare
[Scalare il poller](/it/guides/scale-the-poller/). Questa pagina illustra che cos'è un collector.

## Perché un collector include un proprio database

Un collector che legge il proprio elenco di lavoro dal database centrale tramite la rete smette di
raccogliere dati quando la rete si interrompe. Questo è l'esatto opposto del motivo per cui si è
adottato un collector remoto.

Pertanto, esso dispone di un database locale contenente la propria copia della configurazione:
impostazioni, modelli, metodi di input dei dati, query dati, la propria porzione della cache del
poller, i propri dispositivi, la configurazione dei plugin e le tabelle di utenti e permessi. Tale
copia viene inviata dall'installazione principale. Si consideri l'installazione principale come
l'autorità di configurazione, mentre il collector mantiene lo stato operativo locale e le impostazioni
della macchina.

I percorsi di configurazione sono esclusi dalla copia, così come le statistiche per ciclo che
l'installazione principale conserva per sé. I percorsi sono proprietà di una macchina, non
dell'installazione nel suo insieme.

## La replica è periodica, quindi la configurazione presenta ritardi

Il poller principale controlla i collector remoti abilitati con un host di database non locale e un
intervallo di sincronizzazione diverso da zero. Un collector deve essere sincronizzato se non lo è mai
stato, se il suo intervallo è trascorso o se è contrassegnato come richiedente la sincronizzazione.
Un intervallo pari a zero lo esclude da questo controllo periodico, anche se contrassegnato come da
sincronizzare.

Il valore predefinito globale è di due ore; un collector può avere un proprio intervallo. Ciò non
garantisce che ogni modifica attenda due ore: le operazioni su dispositivi e plugin dispongono anche
di percorsi di replica mirati. La corretta propagazione dipende da tale operazione, dalla connettività
e dalle tabelle selezionate. Verificare la configurazione e la cache effettive del collector anziché
presumere una coerenza immediata o un ritardo fisso.

La replica completa può essere richiesta dal collector principale tramite
`php cli/poller_replicate.php`, quando sono configurati collector remoti abilitati. Essa replica ogni
collector remoto abilitato a meno che `--poller=N` non ne selezioni uno specifico.
Consultare [Scalare il poller](/it/guides/scale-the-poller/) e
[Migrare su nuovo hardware](/it/guides/migrate-to-new-hardware/) per il contesto operativo.

## Tre modalità di connessione

Un collector decide all'avvio come comportarsi, in base alla risposta del database centrale e alla
presenza di campioni non ancora recapitati.

| Modalità | Condizione | Comportamento |
|---|---|---|
| Online | Il database centrale si connette e non viene rilevato backlog Boost locale | Le scritture dei risultati hanno come destinazione il database centrale |
| Offline | La connessione centrale fallisce o è forzata offline | La raccolta utilizza il buffer locale, purché i servizi locali rimangano operativi |
| Recupero | Il database centrale si connette e rimangono righe Boost locali | I nuovi campioni rimangono locali mentre un processo in background tenta il trasferimento del backlog |

L'essere offline non è una condizione di errore. È il comportamento previsto di un collector il cui
collegamento è interrotto, ed è il motivo per cui un collector dispone di un database locale. La
raccolta prosegue sulla base della configurazione disponibile localmente. Capacità del database locale,
accesso ai dispositivi, corretta operatività dello scheduler e credenziali utilizzabili sono comunque
richiesti; la modalità offline non garantisce una raccolta ininterrotta né il recapito finale.

## Come i risultati raggiungono l'installazione principale

I risultati non viaggiano sotto forma di scritture RRD. Viaggiano sotto forma di righe.

La scrittura RRD differita è obbligatoria in presenza di più di un collector, e l'aggiunta di un
collector remoto abilitato induce il poller principale ad attivare l'aggiornamento differito. Il
percorso di avvio abilita anche il Boost di sistema e il reindirizzamento quando esistono record
multipli di collector. Tali impostazioni non convalidano di per sé una distribuzione funzionante.
Consultare [Scritture ad alto volume](/it/concepts/high-volume-writes/) per informazioni su tale modalità.

Online, un collector inserisce i propri campioni direttamente nella tabella buffer centrale.
L'installazione principale li scrive nei file RRD secondo la propria pianificazione, esattamente come
farebbe per i campioni raccolti direttamente. I campioni del collector non ricevono un trattamento
speciale una volta giunti a destinazione.

Offline e durante il recupero, i campioni si accumulano nella coda Boost locale. Quando il database
centrale torna raggiungibile, `poller_recovery.php` inserisce le righe memorizzate nel buffer nella
coda Boost centrale, aggiornando l'output di una riga già esistente.

Il recupero elimina una riga locale solo dopo che l'inserimento centrale per il rispettivo pacchetto
ha avuto successo, e solo quando la riga locale corrisponde ancora a quanto inviato. Un inserimento
fallito, un campione di dimensioni eccessive o una riga modificata durante la pulizia mantengono i
campioni locali al loro posto per il tentativo successivo. Questa pagina non stabilisce una procedura
convalidata di recupero per collector multipli.

Gli inserimenti di recupero trasportano identificatori di origine dati, nomi, timestamp e valori;
non verificano tali righe rispetto alle assegnazioni dei collector. Non fare affidamento su un rifiuto
universale del passaggio per proteggersi da assegnazioni obsolete o produttori sovrapposti. Convalidare
le assegnazioni e lo stato della cache prima di abilitare la raccolta.

## L'archiviazione non si distribuisce

Il flusso di lavoro ereditato basato su proxy mantiene i file RRD centralizzati e presuppone che i
collector vi accedano tramite il proxy RRDtool. Tale flusso di lavoro non è supportato in Kadupul;
non considerarlo come guida all'implementazione. Un percorso di archiviazione multi-collector
convalidato tramite RRDtool locale deve essere documentato prima di raccomandare una sostituzione.

Questo è l'aspetto che sorprende più frequentemente, quindi è opportuno essere chiari:
**I collector remoti distribuiscono l'attesa, non la scrittura.** Se il limite riscontrato riguarda
il disco sotto l'albero RRD, la capacità di raccolta aggiuntiva non rimuove tale limite. Un numero
maggiore di campioni in entrata può accrescere il carico sul database centrale e l'accumulo dei processi
di scrittura.

## Cos'altro ritorna

Un collector gestisce lo stato operativo dei propri dispositivi: raggiungibilità, ultimo errore,
tempi di round-trip, conteggi di polling, disponibilità. Scrive tali dati localmente durante il polling
e invia periodicamente in blocco colonne operative selezionate all'installazione principale. Ciò
aggiorna tali colonne, non l'intera riga di configurazione del dispositivo.

Pertanto, ciò che l'installazione principale mostra per la raggiungibilità di un dispositivo è la vista
del collector all'ultimo invio riuscito. Un collector offline possiede una vista aggiornata dei propri
dispositivi che nessun utente sull'installazione principale può osservare.

L'installazione principale monitora i collector esattamente come un collector monitora i dispositivi.
Un helper di disponibilità considera un collector remoto abilitato attivo solo quando il timestamp del
suo ultimo stato è inferiore al doppio dell'intervallo di polling configurato. Tale verifica non prova
il recapito dei campioni, l'avvenuta replica o l'aggiornamento dei grafici.

## Modalità di guasto

| Cosa si guasta | Cosa accade | Cosa si nota |
|---|---|---|
| Collegamento all'installazione principale | Il collector può proseguire localmente purché database e scheduler rimangano operativi | Grafici in ritardo e coda in crescita; consegna e perdite devono essere verificate |
| Il collector stesso | I dispositivi assegnati potrebbero non essere più interrogati | Campioni mancanti; diagnosticare lo scheduler, i dispositivi e lo stato del collector |
| Replica | Il collector opera con una configurazione obsoleta | Le modifiche sembrano non avere effetto |
| Il database centrale | I processi remoti possono passare in modalità offline in caso di fallimento della connessione | Inserimento centrale interrotto; il buffering remoto dipende dall'operatività locale |
| Assegnazioni sovrapposte o obsolete | Più produttori possono inviare campioni correlati | Nessun rifiuto automatico; verificare assegnazioni, timestamp ed errori di scrittura |

Il buffering può convertire alcune interruzioni in ritardi, ma non garantisce una consegna esente da
perdite. Controllare l'età della coda, la capacità del database, gli errori di ripristino e i conseguenti
timestamp RRD. Un grafico piatto da solo non consente di distinguere un guasto del dispositivo da una
consegna ritardata o non riuscita.

## Quanto costa

Rispetto a un unico poller centrale:

**Si ottengono** tempi di round-trip paralleli su più macchine, polling eseguito in prossimità dei
dispositivi anziché tramite una rete geografica (WAN) e la capacità di proseguire la raccolta locale
quando l'installazione principale non è raggiungibile, fatte salve le limitazioni di ripristino e
funzionamento locale sopra descritte.

**Si sostiene il costo** di una replica della configurazione che può presentare ritardi, di un secondo
database da gestire, monitorare e sottoporre a backup per ogni collector, di una modalità di scrittura
differita non più facoltativa e di un database centrale che riceve scritture concorrenti da ciascun
collector.

La conclusione trasparente è che un collector remoto è una macchina in più da gestire. Un poller con
più processi è una semplice impostazione. Un collector costituisce un'infrastruttura, con un proprio
database, proprie credenziali, un proprio orologio e una propria versione della realtà per tutto il
tempo in cui la replica non viene eseguita.
