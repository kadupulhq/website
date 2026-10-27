---
title: Come vengono disegnati i grafici
description: Il percorso da un file round-robin a un'immagine renderizzata e perché gli stessi numeri memorizzati possono produrre rappresentazioni molto diverse.
sidebar:
  order: 4
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

Una normale richiesta di immagine può comporre un comando RRDtool dalla configurazione del grafico e leggere i file RRD indicati. Un'immagine memorizzata nella cache può soddisfare la richiesta e l'elaborazione Boost su richiesta può aggiornare i file prima del rendering. Consultare [Scritture ad alto volume](/it/concepts/high-volume-writes/) per i vincoli di aggiornamento.

## L'ordine delle operazioni

Per una richiesta che procede alla generazione del comando:

1. Determinare l'intervallo temporale richiesto e la configurazione del grafico.
2. Stimare la risoluzione dai profili del database e selezionare le funzioni di consolidamento.
3. Emettere i riferimenti `DEF` deduplicati per i campi e le funzioni necessari.
4. Emettere le espressioni `CDEF` e `VDEF` richiamate.
5. Emettere gli elementi di disegno e stampa nella sequenza configurata, applicando le opzioni e le modifiche dei plugin.
6. Consentire a RRDtool di leggere i file effettivi ed eseguire il rendering del risultato.

## Scelta di un archivio

Kadupul fa riferimento alle righe del profilo nel database per calcolare le estensioni degli archivi e le opzioni del grafico. La stima automatica considera il tempo di passo moltiplicato per i passi e le righe, la copertura richiesta e il conteggio dei passi dell'archivio; la selezione esplicita dell'archivio segue un percorso separato. Questi calcoli non ispezionano ogni singolo archivio fisico in ciascun file e possono divergere dai file esistenti in seguito a una modifica del profilo.

Il comando `DEF` generato specifica il file, il nome dell'origine dati e la funzione di consolidamento. RRDtool seleziona un archivio disponibile a una risoluzione adeguata e può consolidare ulteriormente i dati in funzione della larghezza del grafico e della finestra temporale. La stima dell'applicazione non garantisce la lettura di uno specifico archivio fisico. Consultare la [documentazione sulle definizioni di dati RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Ampliare l'intervallo temporale o modificare la larghezza dell'immagine può alterare la risoluzione visualizzata. Una serie più aggregata basata su medie può nascondere un picco breve anche se un archivio più dettagliato lo conserva. Confrontare la struttura reale del file e il comando eseguito, non solo il profilo. Vedere [Origini dati e archivi round-robin](/it/concepts/data-sources-and-rras/).

Quando il chiamante non indica un orario finale, il generatore normale adotta inizialmente lo scostamento dell'ultima esecuzione del poller principale rispetto a ora, ripiegando sull'intervallo di polling se tale valore non è disponibile o è collocato nel futuro. Il codice successivo dispone anche di un ripiego basato su intervallo consolidato, ma non è una regola universale. Un orario finale esplicito sostituisce questa inizializzazione; un grafico che termina prima di adesso non dimostra quale archivio sia stato scelto né che gli ultimi dati siano stati salvati.

## Gli elementi

Un grafico è costituito da un elenco ordinato di elementi. La generazione del comando può omettere elementi, riutilizzare definizioni o espandere un elemento in più istruzioni. L'ordine di disegno incide su aspetti che vanno oltre la semplice disposizione visiva.

| Elemento | Disegna | Note |
|---|---|---|
| `AREA` | Area piena dall'asse fino al valore | Le aree successive coprono quelle precedenti |
| `STACK` | Area piena che inizia sopra l'elemento precedente | Emessa come area con flag di sovrapposizione |
| `LINE1`, `LINE2`, `LINE3` | Una linea spessa uno, due o tre pixel | Può essere tratteggiata |
| `LINE:STACK` | Una linea tracciata sopra il totale cumulativo | |
| `TICK` | Tacche lungo un bordo del tracciato | Utile per gli stati, non per l'ampiezza |
| `GPRINT` | Nulla. Stampa un numero nella legenda | |
| `COMMENT` | Nulla. Stampa testo letterale nella legenda | I commenti lunghi vanno a capo |
| `HRULE` | Una linea orizzontale a un valore fisso | |
| `VRULE` | Una linea verticale a un orario prefissato | |
| `TEXTALIGN` | Nulla. Imposta l'allineamento per il testo successivo | |

L'elenco completo, compresa l'applicazione delle colonne di configurazione a ciascun tipo, è riportato in [Elementi del grafico](/it/reference/graph-items/).

`AREA` e `STACK` costituiscono la combinazione su cui si generano più errori. Un'area parte da zero, quindi due aree si sovrappongono e quella più alta nasconde quella più bassa. Uno stack inizia dove terminava l'elemento precedente, perciò l'altezza visibile della seconda fascia rappresenta il suo valore specifico, ma il suo margine superiore segna il totale. Un grafico sovrapposto va interpretato come altezza di una fascia e non come valore assoluto sull'asse Y, altrimenti ogni serie sopra la prima risulterà fraintesa.

`HRULE` accetta un valore che può comprendere sostituzioni di modello. I caratteri non numerici vengono rimossi dal risultato finale e, se non rimane alcun valore numerico, la linea viene disegnata sullo zero anziché interrompere il rendering. Una linea sullo zero può essere voluta o derivare da una sostituzione non riuscita. Verificare il comando finale prima di trarre conclusioni. Il filtro numerico può inoltre modificare stringhe contenenti unità di misura o formati numerici non supportati.

`VRULE` accetta un timestamp Unix oppure una coppia `hours:minutes`. Un valore di ore negativo viene interpretato come scostamento a ritroso rispetto a ora invece che come orario effettivo.

## Due compiti, una parola

La dicitura funzione di consolidamento viene utilizzata per due scopi differenti, e gli stessi quattro nomi, `AVERAGE`, `MIN`, `MAX` e `LAST`, compaiono in entrambi i contesti.

Il primo compito riguarda la selezione dell'archivio. Un'istruzione `DEF` indica un file, un'origine dati al suo interno e una funzione di consolidamento. Tale funzione delimita la famiglia di archivi richiesta. Richiedere `MAX` impone a RRDtool di individuare dati consolidati compatibili, compatibilmente con il meccanismo di fallback descritto di seguito e con la risoluzione.

Il secondo compito riguarda i conteggi nella legenda. Un'istruzione `GPRINT` riduce l'intera finestra visualizzata a un unico valore numerico stampato, e la funzione ne determina il calcolo. Questa riduzione si applica alla serie già letta; si tratta di un'aggregazione a video, non di archiviazione su disco.

Di conseguenza, un elemento `GPRINT` che mostra `MAX` su un riferimento `DEF` letto con `AVERAGE` stamperà il valore massimo di quella serie calcolata sulle medie nell'intervallo rappresentato, non necessariamente il picco reale registrato dal campionamento grezzo. Cinque minuti è solo un esempio; la risoluzione effettiva può variare. Sono valori numerici differenti e su una connessione trafficata differiscono sensibilmente. Entrambe le letture hanno validità, ma solo una riflette presumibilmente ciò che si desiderava osservare.

## Il ripiego silenzioso

Per le tipologie di elementi che adottano l'helper per la scelta della funzione migliore, Kadupul esamina le funzioni di consolidamento del file e applica quella richiesta se presente, altrimenti la prima rilevata. Qualora non se ne individui alcuna per un'origine dati locale valida, l'helper ripiega su AVERAGE. Le varianti fisse di GPRINT seguono un percorso differente e non utilizzano questo helper, pertanto non vi è alcuna garanzia generale che ogni funzione mancante venga sanata.

Un elemento grafico che richiede `MAX` può quindi finire per leggere medie se il file contiene esclusivamente archivi AVERAGE. Verificare il comando `DEF` generato e l'output di `rrdtool info`. Le modifiche agli archivi possono variare la struttura del file, ma l'aggiunta di un nuovo archivio non può ricreare picchi storici scartati durante un precedente calcolo della media. Vedere [Gestire la conservazione dei dati](/it/guides/manage-data-retention/).

## GPRINT eredita l'archivio del vicino

Un elemento `GPRINT` ordinario non possiede un archivio autonomo. Esso eredita la funzione di consolidamento dell'elemento `AREA`, `STACK`, linea o `TICK` compatibile più recente, associato per nome di origine dati e identificatore locale del modello. In assenza di elementi precedenti corrispondenti, ricorre all'helper della funzione migliore con la propria funzione configurata. Le varianti fisse utilizzano direttamente la funzione loro assegnata.

Ciò significa che riordinare gli elementi all'interno di un modello di grafico può alterare i dati visualizzati in legenda senza che nessuno la modifichi. Collocando una `LINE` con lettura `MAX` sopra il blocco `GPRINT`, le legende associate riassumeranno i valori massimi. Spostandola sotto, sarà l'elemento precedente compatibile o il ripiego a determinare la serie di input. Se un valore in legenda muta dopo una modifica al modello, verificare innanzitutto l'ordine degli elementi.

## CDEF e VDEF

Entrambi trasformano i dati prima che vengano disegnati. Non sono intercambiabili.

| | CDEF | VDEF |
|---|---|---|
| Produce | Una serie temporale, un valore per ciascun intervallo | Un valore scalare e, per certe funzioni, un orario collegato |
| Può essere disegnato come linea o area | Sì | Uno scalare può determinare un livello costante |
| Composto da | Funzioni, operatori aritmetici, altri CDEF, origini dati speciali, valori costanti | Una sola funzione applicata a un solo riferimento |
| Nidificazione | Un CDEF può richiamare un altro CDEF | Un VDEF non può includere operazioni aritmetiche |

Un CDEF è un'espressione su stack valutata in notazione polacca inversa. L'insieme degli operatori è molto vasto ed è descritto per intero in [Elementi del grafico](/it/reference/graph-items/): aritmetica, confronto e operatori condizionali, trigonometria, aggregazioni tra origini dati, manipolazioni dello stack e funzioni temporali per individuare la posizione sull'asse X. Gli operatori `UN` e `UNKN` meritano di essere compresi fin dall'inizio. Sostituire i valori sconosciuti con lo zero evita interruzioni nel tracciato, ma nasconde campionamenti mancanti; è opportuno compiere tale scelta consapevolmente.

I CDEF utilizzano inoltre riferimenti speciali invece di nomi fissi di origini dati. Uno di essi fa riferimento all'origine dati dell'elemento corrente, rendendo un singolo CDEF riutilizzabile su tutti gli elementi di un modello. Altri si riferiscono a tutte le origini dati del grafico o a quelle similari, consentendo di generare una linea di totale senza doverne elencare i singoli componenti.

Un VDEF riduce una serie a un unico scalare: massimo, minimo, media, deviazione standard, primo valore, ultimo valore, totale, un percentile o pendenza, intercetta e correlazione di una regressione lineare. RRDtool non ammette operazioni matematiche all'interno di un VDEF; se è necessario un valore elaborato, Kadupul lo calcola sul CDEF dell'elemento anziché sull'origine grezza. Questo è il flusso corretto: effettuare il calcolo in un CDEF e ridurlo successivamente con un VDEF.

Un'istruzione `GPRINT` alimentata da un VDEF non richiede il parametro della funzione di consolidamento: il VDEF ha già fornito la riduzione. I VDEF possono anche fornire valori scalari per il disegno; RRDtool supporta una linea basata su VDEF. Consultare la [documentazione sugli elementi del grafico](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

L'esportazione CSV seleziona i tipi di disegno supportati come colonne della serie; le voci di legenda non vengono esportate come colonne equivalenti. A differenza di quanto riportato in descrizioni precedenti, il codice attuale non ignora gli elementi di disegno basati su VDEF. Può tuttavia emettere un'istruzione `XPORT` non valida per un VDEF scalare: un test isolato con RRDtool renderizza correttamente una linea VDEF ma rifiuta tale esportazione. Si veda il [bug applicativo #273](https://github.com/kadupulhq/kadupul/issues/273). Utilizzare elementi basati su serie temporali per l'esportazione e verificare le colonne risultanti.

## Perché gli stessi dati possono apparire differenti

Ciascuna delle scelte seguenti modifica l'aspetto dell'immagine senza alterare un singolo dato registrato.

| Scelta | Effetto |
|---|---|
| Ampiezza temporale e larghezza dell'immagine | Può variare la selezione dell'archivio e l'ulteriore consolidamento |
| Funzione di consolidamento nel `DEF` | Seleziona picchi, minimi, medie o ultimi valori |
| Assenza di una funzione di consolidamento | Alcuni percorsi sostituiscono un'altra funzione; altri falliscono |
| `AREA` rispetto a `STACK` | Altezze assolute rispetto ad altezze cumulative |
| Ordine degli elementi | Sovrapposizione, ordine di accumulo e archivio ereditato da `GPRINT` |
| Base 1000 o 1024 | Modifica le etichette dell'asse. I valori restano identici |
| Scala automatica, limiti rigidi, scala logaritmica | Modifica l'asse Y, variando la percezione visiva dell'ampiezza |

Se due grafici non concordano, confrontare i comandi renderizzati, l'identità e la struttura dei file, lo stato della cache e la freschezza dei dati. Queste opzioni di visualizzazione sono verifiche utili, ma non escludono errori nella raccolta, nella memorizzazione o nella mappatura. Per una procedura dettagliata di analisi, consultare [Risoluzione dei problemi relativi ai dati mancanti](/it/guides/troubleshoot-missing-data/).
