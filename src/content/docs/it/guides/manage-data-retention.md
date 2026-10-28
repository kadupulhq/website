---
title: Gestire la conservazione dei dati
description: Scegliere conservazione e risoluzione, stimare lo spazio su disco e pianificare le modifiche ai file RRD esistenti.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 24
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione o un percorso di
migrazione ufficialmente supportato per Kadupul. Testare queste procedure su una copia isolata
con backup prima di farvi affidamento. Consultare lo [stato del progetto](/it/project/status/).
:::

La conservazione viene configurata al momento della creazione del file e rimane invariata durante i normali aggiornamenti. La modifica
successiva del profilo cambia l'aspetto del file successivo e lascia ogni file esistente
esattamente com'era. È fondamentale impostarla correttamente prima di creare diecimila origini
dati, poiché le modifiche successive richiedono manutenzione esplicita dei file o migrazione.

Leggere prima [Origini dati e archivi](/it/concepts/data-sources-and-rras/) se i
termini intervallo (step), heartbeat, archivio e consolidamento non sono già familiari.

## Cosa contiene un profilo

Un profilo di origine dati rappresenta la politica di conservazione. Un profilo, una struttura di archiviazione.

| Campo | Significato |
|---|---|
| Intervallo di polling (step) | Frequenza prevista per un valore, in secondi |
| Heartbeat | Intervallo massimo consentito tra gli aggiornamenti prima che l'input venga trattato come sconosciuto |
| Fattore X-Files | Quota di una finestra di consolidamento che può essere sconosciuta prima che il valore consolidato risulti sconosciuto |
| Funzioni di consolidamento | Quali tra `AVERAGE`, `MIN`, `MAX`, `LAST` vengono conservate |
| Archivi | Una riga per risoluzione, ciascuna con un livello di aggregazione e un conteggio di righe |
| Predefinito | Indica se le nuove origini dati adottano questo profilo |

Il valore di step assume per impostazione predefinita l'intervallo del poller. Un profilo il cui step sia più fine
dell'intervallo di polling non può recuperare dettagli mai campionati. La presenza di righe con
valori sconosciuti dipende dall'heartbeat e dalla normalizzazione di RRDtool.

## Cosa viene fornito di fabbrica

Tre profili sono disponibili fin dall'installazione. Tutti e tre mantengono tutte e quattro le funzioni di consolidamento.

| Profilo | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Il profilo a 5 minuti è quello predefinito.

Ciascuno dispone di quattro archivi. Il livello di aggregazione è espresso come moltiplicatore dello step,
quindi la risoluzione reale corrisponde al moltiplicatore per lo step del profilo, e l'arco temporale coperto è
pari a tale risoluzione per il conteggio delle righe.

### 5 Minute Collection

| Archivio | Moltiplicatore | Righe | Risoluzione | Periodo coperto |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minuti | circa 2 giorni |
| Weekly | 6 | 700 | 30 minuti | circa 14 giorni |
| Monthly | 24 | 775 | 2 ore | circa 64 giorni |
| Yearly | 288 | 797 | 1 giorno | circa 2 anni e 2 mesi |

### 1 Minute Collection

| Archivio | Moltiplicatore | Righe | Risoluzione | Periodo coperto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuto | circa 2 giorni |
| Weekly | 15 | 1440 | 15 minuti | 15 giorni |
| Monthly | 60 | 8784 | 1 ora | circa 366 giorni |
| Yearly | 720 | 7305 | 12 ore | circa 10 anni |

### 30 Second Collection

| Archivio | Moltiplicatore | Righe | Risoluzione | Periodo coperto |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 secondi | circa 1 giorno |
| Weekly | 30 | 1346 | 15 minuti | circa 14 giorni |
| Monthly | 120 | 1445 | 1 ora | circa 60 giorni |
| Yearly | 480 | 4380 | 4 ore | 2 anni |

I nomi sono etichette descrittive, non comportamenti vincolanti. Nulla garantisce che l'archivio denominato
"Yearly" contenga esattamente un anno.

## Come il profilo diventa un file

Al momento della creazione, gli archivi e le funzioni di consolidamento del profilo vengono letti e
trasformati in un comando di creazione. Lo step deriva dal valore `rrd_step` memorizzato
nell'origine dati, normalmente popolato dal suo profilo. Ogni elemento di origine dati incluso contribuisce con una riga di definizione
contenente nome, tipo, heartbeat, minimo e massimo. Ogni archivio
contribuisce con una riga per funzione di consolidamento, recante la funzione, il fattore X-Files, il moltiplicatore e il conteggio delle righe.

Quattro archivi moltiplicati per quattro funzioni di consolidamento producono sedici definizioni di archivio
nel file. Questa moltiplicazione è ciò che occupa spazio su disco.

Se il file esiste già, il normale percorso di creazione si arresta senza riscriverlo.
La modifica del profilo non migra automaticamente i file. Gli strumenti di manutenzione esplicita
rappresentano un'operazione separata, descritta di seguito.

## Scegliere una politica

Tre domande, in questo ordine preciso:

**Qual è la domanda più dettagliata che vi porrete mai?** Questo determina lo step. Uno step di
30 secondi risponde a "cosa è successo durante quel picco di 90 secondi". Uno step di 5 minuti
non potrà mai rispondere per alcun file creato sotto di esso. Step più fini richiedono elaborazione da parte del poller
a ogni ciclo e maggiore spazio su disco.

**Fino a che punto nel passato vi porrete tale domanda?** Questo determina il conteggio delle righe dell'archivio giornaliero. La maggior parte
delle installazioni richiede un paio di giorni alla massima risoluzione accontentandosi poi
di dati più aggregati.

**Quali domande devono sopravvivere al consolidamento?** Questo determina le funzioni di consolidamento.
`AVERAGE` risponde a quale fosse il valore tipico. `MAX` risponde all'entità massima raggiunta.
`MIN` risponde se vi siano mai state interruzioni. `LAST` risponde a quale fosse il valore finale nella
finestra, essenziale per letture che esprimono stati anziché tassi.

Eliminare una delle quattro funzioni di consolidamento riduce di un quarto l'ingombro dei valori memorizzati
nei nuovi file a ogni risoluzione. È anche il
rimpianto più frequente espresso dagli amministratori in seguito. Mantenete `MAX` a meno che non siate certi che nessuno
chiederà mai conto di un picco.

## Dimensionare il disco

La dimensione di un file dipende direttamente dai numeri scelti. Dalla formula utilizzata
nell'interfaccia:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

L'interfaccia utilizza 284 e 300 byte come stime di overhead fisso. Considerate questo valore
come un'approssimazione di dimensionamento e non come una descrizione esatta di ogni formato di file RRDtool.
Ogni valore memorizzato occupa 8 byte, e il totale delle righe è la somma dei conteggi delle righe nelle
definizioni di archivio del profilo prima della moltiplicazione per le funzioni di consolidamento.
Misurate file rappresentativi con la versione installata di RRDtool prima di dimensionare lo storage.

Per un file a singola origine dati con tutte e quattro le funzioni di consolidamento:

| Profilo | Totale righe | Dimensione approssimativa file |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Moltiplicate per il numero di origini dati previste, non per il numero di grafici. Un
grafico può combinare campi provenienti da uno o più file. Contate i file RRD effettivi
e gli elementi di origine dati all'interno di ciascuno.

Ventimila origini dati con il profilo predefinito occupano circa 1,8 GB. Le stesse
ventimila con il profilo 1 Minute occupano circa 13 GB. Questo rapporto riflette
sia la risoluzione sia i diversi periodi di conservazione dei profili, non solo lo step.
Una frequenza di campionamento più serrata incrementa anche le scritture. Consultare [Scritture ad alto volume](/it/concepts/high-volume-writes/) prima di scegliere
uno step molto fine su larga scala.

Sia l'editor dei profili che quello degli archivi mostrano una dimensione calcolata man mano che modificate i valori.
Usateli. In questi calcoli è facile sbagliare di un fattore quattro.

## Cosa fa e non fa la modifica di un profilo

Questa è la parte che può costare la perdita dello storico.

| Modifica | Effetto sui nuovi file | Effetto sui file esistenti |
|---|---|---|
| Aggiungere o rimuovere un archivio | Applicato | Nessuno |
| Modificare un conteggio righe | Applicato | Nessuno |
| Modificare un livello di aggregazione | Applicato | Nessuno |
| Aggiungere o rimuovere una funzione di consolidamento | Applicato | Nessuno |
| Modificare lo step | Le nuove origini dati lo ereditano; la creazione usa lo step memorizzato | Nessuna migrazione automatica dei file |
| Modificare l'heartbeat | La creazione usa i metadati memorizzati dell'elemento di origine dati; vedi sotto | Nessuna ottimizzazione automatica dei file |
| Eliminare il profilo | Rifiutato finché un modello o un'origine dati lo referenzia, e per il profilo predefinito | Nessuno |

**La modifica dell'heartbeat di un profilo in uso aggiorna unicamente i metadati.** Il salvataggio di un nuovo
heartbeat lo memorizza nel profilo e negli elementi di origine dati di modelli e
origini dati locali che utilizzano tale profilo; gli altri modelli non vengono modificati.

Il salvataggio non ottimizza i file RRD esistenti. Eseguite il backup sia dei metadati che dei file,
e confrontate il profilo, gli elementi dei modelli, gli elementi delle origini dati locali e l'output reale
di `rrdtool info` dopo la manutenzione dell'heartbeat.

L'utilità `cli/update_heartbeat.php` del raccoglitore principale può ottimizzare i file esistenti
e aggiornare i metadati. Iniziate con `--help`, `--list-heartbeats`,
`--list-data-templates` e `--list-profiles`. Il nuovo heartbeat deve essere supportato
e pari ad almeno il doppio dell'intervallo configurato del poller. Utilizzate `--data-template-id` per
limitare la selezione; l'utilità non dispone di opzione di simulazione (dry-run).

Senza `--force`, i profili selezionati devono già disporre dell'heartbeat
richiesto. Con `--force`, cambiano anche i valori dei profili condivisi, pertanto verificate
tutti gli utenti prima di procedere. `--prev-heartbeat` filtra i valori nel database, non
l'heartbeat letto da ciascun RRD: dopo un salvataggio web parziale, selezionare il vecchio
valore del file potrebbe non corrispondere ad alcun elemento. Verificate la selezione ed esaminate i file
risultanti. Il test isolato ha ottimizzato con successo il file esistente da 600 a 900
dopo l'allineamento dei metadati del profilo.

Altre due insidie si trovano subito accanto.

**L'editor limita le modifiche strutturali una volta che un profilo è in uso.** Non appena
esiste un'origine dati reale su un profilo, lo step, il fattore X-Files, le funzioni di consolidamento,
i conteggi delle righe e i livelli di aggregazione diventano di sola lettura nell'editor;
anche i controlli di aggiunta/eliminazione archivi vengono nascosti. Duplicate il profilo e
modificate la copia. Queste restrizioni dell'interfaccia non costituiscono convalida lato server
delle richieste inviate.

**Riassegnate i riferimenti prima di eliminare un profilo.** L'elenco disabilita la selezione
quando un modello o un'origine dati locale utilizza un profilo, e il server rifiuta
di eliminare un profilo ancora referenziato.

## Spostare origini dati tra profili

È disponibile un'azione massiva sui modelli dati per modificare il profilo. Riscrive
il profilo, lo step e l'heartbeat registrati nel modello, limitandosi
deliberatamente alle righe dei modelli. Le origini dati già esistenti non vengono incluse.

Pertanto, la sequenza corretta per una migrazione reale è:

1. Creare il nuovo profilo e verificarne la dimensione calcolata.
2. Puntare il modello dati verso di esso.
3. Accettare che tutto ciò che viene creato d'ora in avanti utilizzerà la nuova struttura.
4. Decidere separatamente cosa fare dei file già esistenti.

Il quarto passaggio offre varie opzioni, a seconda della modifica e della versione di RRDtool installata.

**Mantenerli invariati.** Strutture di conservazione differenti possono coesistere. Mantenete i
metadati di polling di ciascuna origine dati esistente coerenti con il rispettivo file; la sola modifica di un
riferimento di profilo nel database non migra lo step, i campi o gli archivi.

**Ricostruire.** Eliminare e ricreare l'origine dati. È veloce, ma lo storico va perduto.

**Giuntare (Splice).** L'utilità da riga di comando splice unisce un vecchio file in uno nuovo e
può modificarne la risoluzione durante l'operazione, a condizione che il nuovo file possieda già lo
step corretto. Dispone di una modalità dry-run. Usatela su una copia prima di applicarla a
file importanti.

**Manutenzione RRDtool.** A seconda della versione installata e della modifica desiderata,
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) o
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) possono modificare un
file esistente preservando i dati memorizzati. Interrompete i processi di scrittura concorrenti, conservate
un backup e verificate il risultato su una copia. Queste operazioni non ricreano dettagli
già scartati dal consolidamento.

## Profili esterni

Un'origine dati può essere associata a un profilo esterno, che registra uno step pari a zero.
Ciò indica che il file è gestito al di fuori del flusso normale, e l'elenco delle origini dati
lo mostra come esterno anziché indicare un intervallo. Utilizzatelo per file generati da un altro
processo. Non usatelo per intendere "nessuna politica", poiché la conservazione rimane comunque
quella con cui il file è stato creato; semplicemente non viene descritta in alcun punto visibile.

## Modalità di errore

| Sintomo | Causa consueta |
|---|---|
| La modifica di un profilo sembra non avere effetto | Comportamento previsto. I file esistenti conservano la struttura con cui sono stati creati |
| Conteggio righe e livello di aggregazione non modificabili | Il profilo è utilizzato da almeno un'origine dati. Duplicatelo |
| L'interfaccia mostra un heartbeat, il file opera secondo un altro | L'heartbeat del profilo è cambiato e i file non sono mai stati ottimizzati |
| Creazione di nuove origini dati non riuscita, il registro indica archivi non assegnati | Il profilo è stato eliminato mentre vi erano ancora origini dati che lo referenziavano |
| L'archivio più fine è colmo di valori sconosciuti | Verificate aggiornamenti mancanti, heartbeat e regole di consolidamento |
| Una settimana di grafici presenta buchi a intervalli di poche ore | Heartbeat troppo vicino allo step per un poller che accumula ritardi |
| Picchi visibili ieri sono scomparsi nella vista mensile | Viene conservato solo `AVERAGE`, oppure l'archivio `MAX` è stato eliminato per risparmiare spazio |
| Il disco è cresciuto quattro volte più velocemente del previsto | La stima ha contato gli archivi ma ha omesso le funzioni di consolidamento |
| La risoluzione desiderata manca dal menu a discesa dei nuovi archivi | L'editor offre l'archivio più fine in corrispondenza dello step del profilo, poi unicamente opzioni più aggregate degli archivi esistenti |
