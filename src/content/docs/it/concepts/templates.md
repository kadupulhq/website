---
title: Modelli
description: Come un'unica definizione gestisce cento dispositivi e cosa succede quando viene modificata.
sidebar:
  order: 3
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

I modelli esistono affinché aggiungere il centesimo switch richieda lo stesso impegno dell'aggiunta del secondo. Ne esistono quattro tipi e si combinano in modo gerarchico.

Per una sequenza pratica, seguire la guida [Utilizzare e convalidare i modelli](/it/guides/template-workflow/).

I **modelli di dati** definiscono cosa raccogliere e come memorizzarlo: i campi, i loro tipi, i limiti, il profilo di archiviazione e quale metodo di input recupera i valori numerici. I campi specifici per oggetto e i file RRD esistenti possono differire dal modello corrente; il modello non costituisce una prova della struttura fisica del file.

I **modelli di grafico** definiscono come disegnare: quali elementi, in quale ordine, quali colori, quali righe di legenda e cosa riporta l'asse.

I **modelli di dispositivo** raggruppano le query di dati e i modelli di grafico adatti a una classe di hardware, in modo che la scelta del modello corretto durante l'aggiunta di un dispositivo svolga la maggior parte del lavoro.

Le **query di dati** gestiscono i casi in cui non si conosce a priori il numero di elementi presenti. Uno switch ha un numero variabile di porte, scoperte interrogando il dispositivo, e una query di dati registra risultati indicizzati per la creazione dei grafici. L'individuazione da sola non crea un numero fisso di grafici o origini dati.

## Come si combinano

I quattro elementi non costituiscono quattro livelli della stessa cosa. Ciascuno punta a quello successivo nella gerarchia.

| Tipo | Punta a | Produce |
|---|---|---|
| Modello di dispositivo | Modelli di grafico e query di dati | Nulla direttamente. È un elenco di elementi da proporre per un dispositivo |
| Query di dati | Definizioni di grafico e mappature per risultati indicizzati | Righe individuate; la creazione del grafico può creare o riutilizzare origini dati |
| Modello di grafico | Campi del modello di dati in cui un elemento richiede informazioni | Un grafico che può fare riferimento a più origini dati |
| Modello di dati | Un metodo di input e un profilo di archiviazione | Metadati dell'origine dati; un file RRD viene creato quando il percorso di scrittura lo richiede |

Gli elementi del modello associati a dati fanno riferimento ai campi del modello; gli elementi istanziati vengono mappati sui campi locali. Gli elementi di testo e costanti non necessitano di un riferimento all'origine dati. La creazione del grafico risolve tali mappature e successive riassegnazioni o modifiche agli elementi possono alterarle. La creazione del grafico può riutilizzare origini dati compatibili invece di creare un nuovo file per ogni grafico.

## Basato su modello o per oggetto

Molti campi a livello di grafico e di origine dati dispongono di flag corrispondenti nella riga del modello. Per tali campi, il flag controlla la normale propagazione agli elementi subordinati collegati. Altri campi, elementi del grafico e mappature di input seguono regole di propagazione distinte.

| Flag | Significato | Al salvataggio |
|---|---|---|
| Disattivato | Il campo è basato sul modello | Scritto su ogni elemento subordinato, sovrascrivendo il valore precedente |
| Attivato | Il campo è specifico per oggetto | Lasciato invariato su ogni elemento subordinato |

Il flag è per singolo campo. Un modello di grafico può propagare l'etichetta dell'asse ai grafici collegati lasciando il titolo e il limite verticale a chi lo ha creato. Questa combinazione è la regola normale, non un'eccezione.

Due caratteristiche di questo meccanismo traggono spesso in inganno.

Il flag risiede sul modello e decide solo l'azione del salvataggio successivo. Contrassegnare un campo come per oggetto dopo che una propagazione lo ha già sovrascritto non ripristina nulla. I vecchi valori personalizzati sono persi; il flag protegge unicamente i valori futuri.

L'inverso comporta rischi maggiori. Disattivare il flag su un campo rimasto per oggetto per anni fa sì che un singolo salvataggio sovrascriva quel campo su tutti gli elementi subordinati con il valore del modello, spesso un segnaposto mai verificato.

### Non tutti i campi hanno un flag

Un campo partecipa a questo flusso solo se esiste un flag per esso. A livello di origine dati, quattro campi ne dispongono e due ne sono deliberatamente sprovvisti.

| Campo | Flag | Comportamento |
|---|---|---|
| Nome | Sì | Basato su modello o per oggetto |
| Attivo | Sì | Basato su modello o per oggetto |
| Passo | Sì | Basato su modello o per oggetto |
| Profilo di archiviazione | Sì | Basato su modello o per oggetto |
| Metodo di input | No, sempre basato su modello | Il gestore di salvataggio del modello aggiorna esplicitamente le righe collegate |
| Percorso del file RRD | No, mai basato su modello | Le normali propagazioni lo escludono; la riassegnazione preserva il percorso esistente |

La conservazione del percorso protegge l'associazione esistente con i dati storici durante le normali modifiche del modello. Ciò non implica che i percorsi non possano essere modificati o spostati mediante altre operazioni amministrative. Verificare l'identità dei file prima di modificarli.

Tutti i campi di una voce dell'origine dati contengono un flag: nome del campo, tipo, heartbeat, valore minimo, valore massimo e il campo di input che lo alimenta.

## Gli input del grafico operano nella direzione opposta

Un modello di grafico può dichiarare un input denominato che collega più elementi del grafico a un unico campo modificabile, in modo che la modifica di un singolo valore sul grafico aggiorni ogni elemento che lo condivide. È il meccanismo con cui una singola impostazione di colore o legenda controlla un gruppo di elementi correlati.

Il valore trasmesso non è quello del modello. Esso legge il valore corrente dagli altri elementi appartenenti all'input e lo propaga. L'input del grafico si diffonde quindi lateralmente tra gli elementi del grafico anziché discendere dal modello; per questo motivo la modifica di un input può alterare un grafico che il modello non ha toccato direttamente.

## Cosa si propaga e quando

| Modifica | Raggiunge gli oggetti esistenti | Modalità |
|---|---|---|
| Campo del modello di grafico, basato su modello | Sì, al salvataggio | Scritto su ogni grafico derivato da quel modello |
| Campo del modello di grafico, per oggetto | No | L'oggetto subordinato mantiene il proprio valore |
| Aspetto dell'elemento del grafico | Sì, al salvataggio | Colore, trasparenza, tipo di elemento, spessore linea, tratteggio, CDEF, VDEF, scostamento, funzione di consolidamento, allineamento, testo e formato legenda |
| Elemento aggiunto, rimosso o riassociato a un altro campo | Dipende dall'operazione | Corrispondenza, aggiunta, eliminazione e rimappatura usano percorsi differenti; verificare le mappature locali risultanti |
| Campo del modello di dati, basato su modello | Sì, al salvataggio | Scritto su ogni origine dati derivata da quel modello |
| Valori dei campi di input del modello di dati | Se basati su modello | I flag di modello e oggetto, i campi indice delle query e le regole host limitano la propagazione |
| Profilo di archiviazione, passo, archivi del modello di dati | Solo database | I file esistenti conservano la struttura con cui sono stati creati |
| Campi aggiunti a un modello di dati | Solo database | I file esistenti non dispongono di spazio per memorizzarli |
| Contenuto del modello di dispositivo | Sincronizzazione separata | Modificare le associazioni non sincronizza automaticamente tutti i dispositivi esistenti |

La propagazione nel database dipende dal percorso di salvataggio e dalle regole di sovrascrittura. L'aggiornamento dei metadati del modello non migra automaticamente i file RRD esistenti; la manutenzione dei file costituisce un'operazione separata. Alcuni controlli strutturali sono di sola lettura nell'editor dei modelli di dati in uso. Consultare la guida [Creare modelli personalizzati](/it/guides/create-custom-templates/).

## I modelli di dispositivo hanno un percorso di sincronizzazione esplicito

La modifica delle associazioni di un modello di dispositivo cambia quanto offerto ai nuovi dispositivi. I dispositivi esistenti utilizzano un'operazione separata di riapplicazione e sincronizzazione. Lo strumento per operazioni di massa seleziona normalmente i dispositivi in stato Up o Recovering, a meno che chi lo richiama non includa esplicitamente i sistemi inattivi; verificare la selezione prima di procedere.

La sincronizzazione aggiunge le associazioni mancanti con i modelli di grafico, aggiorna le query di dati selezionate e può rimuovere le associazioni non più necessarie. Essa non elimina direttamente i grafici esistenti solo perché il relativo modello è stato rimosso dal modello di dispositivo. Inoltre attiva gli hook di automazione e dei plugin, potendo causare l'esecuzione di regole di automazione dei grafici configurate.

Verificare le associazioni e i grafici del dispositivo dopo la sincronizzazione. Essi non costituiscono necessariamente l'unione permanente di ogni versione di modello applicata nel tempo.

## Indici e cause dello spostamento delle porte

Una query di dati deve stabilire quale elemento scoperto corrisponda a una specifica origine dati esistente. Questo elemento è l'indice. Gli indici numerici possono cambiare in seguito a modifiche hardware o di configurazione. Un campo stabile appropriato aiuta a preservare l'identità, ma anche i nomi delle interfacce possono essere rinominati o riutilizzati. Verificare univocità, persistenza e comportamento di reindicizzazione sul dispositivo reale; nessun nome di campo da solo garantisce la continuità.

Questa scelta appare banale nel momento in cui viene presa e onerosa quando si rivela errata. Essa viene effettuata per ciascun dispositivo a ogni esecuzione anziché una volta sola per la query, pertanto due switch identici possono risultare indicizzati su campi differenti. La selezione del campo, cosa accade quando un indice scompare e i costi legati al rilevamento della rinumerazione sono trattati in [Query di dati e indici](/it/concepts/data-queries-and-indexes/).

## Modificare un modello in seguito

Le modifiche ai grafici influiscono sulle successive operazioni di rendering dopo il completamento del salvataggio e della propagazione. Le sostituzioni e la memorizzazione nella cache delle immagini possono influenzare ciò che l'utente visualizza, pertanto non bisogna presumere che ogni grafico si aggiorni all'istante. Esaminare un grafico subordinato rappresentativo e le relative mappature degli elementi; consultare la guida [Regolare l'aspetto del grafico](/it/guides/tune-graph-appearance/).

Il salvataggio di un modello di dati non rimodella automaticamente i file RRD esistenti. Le definizioni e gli archivi effettivi del file possono differire dal profilo nel database. Esaminare entrambi prima di procedere alla manutenzione; la ricreazione del file rappresenta solo una delle opzioni disponibili.

A seconda del tipo di modifica, operazioni supportate da RRDtool come la regolazione dei parametri, il ridimensionamento degli archivi o esportazioni e ripristini controllati possono preservare in tutto o in parte la cronologia esistente. Tali procedure presentano limiti e richiedono backup e verifiche; non ricostruiscono dati mai memorizzati. L'eliminazione e la ricreazione del file cancellano la cronologia. Consultare [Gestire la conservazione dei dati](/it/guides/manage-data-retention/) e [Origini dati e archivi round-robin](/it/concepts/data-sources-and-rras/).

## Altri elementi denominati modelli

Altri quattro oggetti condividono questo termine ma non seguono il modello descritto sopra. I modelli di colore sono tavolozze con nome applicate agli elementi del grafico. I modelli di aggregazione descrivono come combinare più grafici in uno solo. I modelli di automazione associano i dispositivi individuati a un modello di dispositivo. Le preimpostazioni di grafico forniscono formati di legenda riutilizzabili.

Nessuno di essi fa parte della sequenza descritta qui. È utile conoscerli principalmente per interpretare correttamente i risultati di ricerca in cui compare la parola modello.
