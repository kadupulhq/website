---
title: Scritture ad alto volume
description: Perché gli aggiornamenti RRD sono limitati dal numero di scritture anziché dalla loro dimensione, cosa comporta l'elaborazione in batch e quanto costa in termini di freschezza.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 10
---

Gli aggiornamenti RRD coinvolgono numerosi file e possono risultare vincolati dalla latenza di
archiviazione e dalle operazioni di I/O, non soltanto dalla larghezza di banda di trasferimento. Le
scritture posticipate, note anche come Boost, raccolgono i campioni nel database e raggruppano gli
aggiornamenti per ciascun file. Valutate le prestazioni del modulo di scrittura e del database prima di
adottarlo: interruzioni nei grafici non segnalano necessariamente un collo di bottiglia nello storage.

## Il percorso predefinito

I raccoglitori inseriscono i risultati nella coda di transito `poller_output`. Il modulo di scrittura
raggruppa i campioni per file e timestamp, aggiorna il file RRD e tiene traccia della conferma prima
di eliminare i campioni idonei. Scritture fallite possono lasciare righe per nuovi tentativi, cosicché
la coda non è circoscritta al ciclo di polling corrente.

Nella versione esaminata, questa coda impiega InnoDB. I controlli preliminari della raccolta rifiutano
una coda MEMORY; un riavvio del database non cancella intrinsecamente le righe confermate, a differenza
di quanto avverrebbe con una tabella in memoria. La persistenza continua a dipendere dalla configurazione
del database, dallo stato di salute dello storage e dai backup. Si veda
[Aggiornare in sicurezza](/it/guides/upgrade-safely/) per le verifiche sulle migrazioni della coda e
sullo storage.

Come stima indicativa del carico, 10.000 file distinti aggiornati ogni 300 secondi comportano in media
circa 33 aggiornamenti di file al secondo. Le scritture effettive si manifestano a raffiche; molteplici
campi di un'origine dati possono condividere il medesimo file, i passi temporali possono differire e
il numero di istruzioni non equivale al numero fisico di I/O su disco. Confrontate la latenza misurata
di scrittura e l'anzianità della coda con la finestra di polling disponibile.

## Cosa cambia con l'elaborazione in batch

Con le scritture posticipate abilitate, la raccolta convoglia i campioni in `poller_output_boost` per
la successiva elaborazione. Il modulo di scrittura in batch raggruppa i campioni per origine dati in
ordine cronologico e può inviare diversi timestamp all'interno di un unico comando di aggiornamento RRDtool.
Dodici campioni possono trovare spazio in una sola istruzione, ma ciò non garantisce una singola scrittura
fisica su disco.

La lunghezza massima degli argomenti configurata delimita le stringhe di aggiornamento; il valore
predefinito è 2.000. Essa influisce sulla formazione dei batch. Non desumete un particolare limite del
sistema operativo da tale parametro: le scritture locali confermate impiegano un flusso di comandi RRDtool,
e il meccanismo di trasporto unitamente alle dimensioni di comando supportate costituiscono i fattori determinanti.

Lo schedulatore diviene idoneo all'esecuzione quando il relativo timer giunge a scadenza (60 minuti per
impostazione predefinita) o quando il numero stimato di righe nel buffer supera la soglia configurata
(1.000.000 per impostazione predefinita). La stima delle righe include le tabelle attive e di archivio.
L'invocazione dello schedulatore deve comunque verificarsi, e verifiche sui processi, fasi di preparazione
o anomalie di scrittura possono posticipare le attività. Esecuzioni forzate, svuotamento a seguito di
disattivazione e aggiornamenti su richiesta alla visualizzazione dei grafici sono percorsi supplementari;
i valori predefiniti non offrono una garanzia di freschezza oraria.

Un intervallo pari a zero o non corrispondente a un intero positivo viene sostituito con 120 minuti;
il valore predefinito standard è pari a 60 minuti.

## La rotazione e perché esiste

L'architettura in batch genera una tabella vuota corrispondente al buffer attivo, procedendo quindi allo
scambio dei nomi mediante una singola istruzione `RENAME TABLE`. La precedente tabella attiva diviene
un archivio con datazione temporale e i produttori indirizzano i dati verso la nuova tabella. Ciò separa
il batch dai nuovi inserimenti, sebbene blocchi sul database e contese sulle risorse possano comunque
ritardare la raccolta.

I processi di lavoro elaborano gli archivi correnti e trattenuti. Il processo principale sorveglia il
completamento e lo stato dei processi subordinati; esecuzioni non riuscite o non verificabili conservano
gli archivi per successivi tentativi. Nel corso di una ripulitura valida, gli archivi vuoti possono essere
rimossi e i campioni residui possono essere reimmessi nel buffer attivo prima della cancellazione dell'archivio.
Un archivio non vuoto non viene eliminato semplicemente per la conclusione del processo. Esaminate sia le
code attive sia quelle di archivio nella diagnosi di accumuli di dati.

Si tratta di una gestione dei tentativi, non di una garanzia universale di resistenza ai guasti. Errori del
database, attività concorrenti, difetti nello storage e coerenza dei backup necessitano di attenta verifica
nell'ambiente operativo effettivo.

## Perché visualizzare un grafico può aggiornare i relativi file

Il consueto percorso di visualizzazione dei grafici può tentare aggiornamenti su richiesta per ciascuna
origine dati richiamata dal grafico prima del rendering. Non effettua lo svuotamento incondizionato di ogni
campione in attesa: verifiche sul raccoglitore, canali real-time/sorgente/errori, limiti temporali di polling
attivo, soglie delle query e anomalie di aggiornamento condizionano le operazioni eseguite. Campioni recenti
o non andati a buon fine possono rimanere accodati.

Un grafico dall'aspetto aggiornato non dimostra pertanto che l'intero albero RRD sia al passo, e richiedere
un grafico non garantisce una riesecuzione priva di intoppi. Verificate gli errori di scrittura, l'anzianità
della coda e i timestamp effettivi dei file RRD. I backup circoscritti ai soli file escludono i campioni
in attesa nel database; si veda [Backup e ripristino](/it/guides/back-up-and-restore/).

## A cosa si rinuncia

**Freschezza dei file.** I campioni stazionano nel database fino all'avvenuta elaborazione. Un'installazione
funzionante e scandita da timer può registrare un ritardo pari all'incirca all'intervallo di svuotamento;
un processo di scrittura in errore o sottodimensionato può accumulare un ritardo sensibilmente superiore.
Eseguite backup coerenti sia delle code pendenti sia dei file.

**Una seconda pianificazione.** Monitorate il polling e lo svuotamento in maniera distinta. Osservate le
righe attive, gli archivi conservati, l'anzianità del campione più datato, i worker falliti e la velocità
del modulo di scrittura. Una tabella attiva non deve necessariamente svuotarsi del tutto finché i produttori
vi inseriscono dati, e la sola rotazione può farla apparire più contenuta senza che sia stato perfezionato
alcun aggiornamento RRD.

**Ordinamento temporale.** I file RRD non accettano timestamp anteriori a seguito di aggiornamenti più
recenti. Il moderno motore Boost tralascia gli aggiornamenti del passato e il percorso storico filtra i
timestamp rispetto all'ultima scrittura registrata sul file. Un comando confermato con successo può quindi
scartare dati obsoleti; una consegna tardiva non assicura che il campione compaia sul grafico.

**Superficie operativa.** Occorre presidiare un buffer nel database, un processo di svuotamento vincolato
da una soglia di memoria, worker paralleli facoltativi, nonché archivi trattenuti o campioni riaccodati.
Anomalie locali di scrittura conservano generalmente i campioni per ulteriori tentativi, ma ciò non sancisce
un'integrità priva di perdite da cima a fondo. Per il percorso di ripristino remoto, si consulti
[Raccolta remota dei dati](/it/concepts/remote-data-collection/).

## Quando ne vale la pena

Prendete in considerazione le scritture posticipate qualora le misurazioni dimostrino che il modulo di
scrittura RRD costituisce il collo di bottiglia e il database dispone della capacità necessaria per buffer
e query aggregate. Ciò non elimina la latenza dei dispositivi né risolve il sovraccarico del database.
Confrontate velocità di trasmissione, anzianità della coda, freschezza dei file e impiego delle risorse prima
e dopo l'attivazione.

Il poller principale abilita automaticamente l'aggiornamento differito qualora sia configurato un raccoglitore
dati remoto attivo. Tale impostazione da sola non certifica un'infrastruttura remota di archiviazione o di
ripristino convalidata; attenetevi ai limiti delineati in
[Raccolta remota dei dati](/it/concepts/remote-data-collection/).

## Una funzionalità diversa con lo stesso nome

Anche le immagini dei grafici renderizzate possono essere memorizzate nella cache. La memorizzazione delle
immagini nella cache alleggerisce i carichi di rendering ripetuti; le scritture posticipate raggruppano i
campioni del database in aggiornamenti RRD. Le relative configurazioni sono separate, ma i percorsi di
esecuzione interagiscono: le richieste di grafici possono verificare i campioni pendenti prima di fare uso
di un'immagine nella cache, e aggiornamenti riusciti possono innescare la generazione di una nuova immagine.
Valutate la freschezza delle immagini indipendentemente da quella delle code e dei file RRD.
