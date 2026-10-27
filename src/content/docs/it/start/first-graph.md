---
title: Interpretare il primo grafico
description: Cosa significano realmente le linee e i tre errori che portano a interpretarle in modo errato.
sidebar:
  order: 4
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

Un grafico in questo contesto non è una raffigurazione diretta dei vostri dati. È l’immagine di una sintesi dei vostri dati, e sapere di quale sintesi si tratti è fondamentale.

## Cosa si sta osservando

Ogni grafico viene generato a partire da un archivio circolare (round-robin archive). L’archivio conserva i campioni recenti alla massima risoluzione e i campioni più datati consolidati in intervalli più ampi. Quando si amplia la visualizzazione a un anno, non si osserva ogni singolo campione rilevato ogni cinque minuti. Si osserva un unico valore per intervallo, determinato da una funzione di consolidamento.

Tale funzione è generalmente la media. Può anche essere il massimo o il minimo. Questo aspetto conta più di qualsiasi altra cosa in questa pagina.

Per una consueta richiesta di grafico on-demand, Kadupul assembla un comando RRDtool a partire dalla configurazione del grafico e lo esegue sui file presenti su disco. Tre tipi di righe compongono tale comando ed è opportuno distinguerli.

| Parte | Cosa fa |
|---|---|
| Una definizione | Identifica un file, un’origine dati al suo interno e una funzione di consolidamento |
| Un elemento di disegno | Trasforma una serie in una linea, in un’area o in una fascia sovrapposta |
| Un elemento di legenda | Stampa un valore numerico, calcolato sull’intervallo temporale visualizzato |

L’intero funzionamento è descritto in [Come vengono generati i grafici](/it/concepts/how-graphs-are-drawn/). Non ne avete bisogno oggi. Vi basta sapere che la definizione del grafico e l’intervallo temporale richiesto determinano l’immagine risultante. I percorsi della cache e dei grafici in tempo reale possono comportarsi diversamente.

## Iniziare con le ultime quattro ore

Iniziate con un intervallo recente e limitato. L’archivio selezionato dipende dalla conservazione, dallo step e dalla risoluzione del grafico; quattro ore non garantiscono la presenza di dati grezzi o non consolidati. Persino l’archivio più dettagliato contiene valori normalizzati nel tempo. Utilizzate il comando di debug del grafico e `rrdtool info` per verificare la funzione richiesta e gli step di archivio disponibili prima di confrontare i valori.

Due particolarità di un grafico appena creato sono del tutto normali, ma tendono a generare allarme.

**La linea può arrestarsi prima dell’orario attuale.** L’intervallo corrente potrebbe essere incompleto. I tempi di raccolta, il buffering e la normalizzazione possono ritardare il punto finale visibile. Verificate l’avanzamento dei timestamp di aggiornamento anziché considerare un ritardo costante come segno di perfetto funzionamento.

**Il primo tratto può risultare assente.** Un’origine dati creata un’ora fa contiene un’ora di dati e undici mesi di vuoto. L’archivio viene allocato per intero al momento della creazione, pertanto la parte vuota è spazio di archiviazione reale in attesa di essere utilizzato.

## Allargare poi l’intervallo e osservare la variazione del picco

Allargate l’intervallo a una settimana. I picchi possono ridursi quando il grafico seleziona medie più ampie. Ad esempio, se l’utilizzo è al 100% per cinque minuti e a zero nei restanti 55 minuti, la media oraria è pari a circa l’8,3%. Un picco di quattro minuti in un’ora per il resto inattiva produce una media del 6,7% circa. I picchi di breve durata potrebbero essere già stati smussati all’interno dell’intervallo di campionamento originale.

Il consolidamento elimina i dettagli. Se la cronologia ad alta risoluzione è scaduta, ingrandire nuovamente la vista non consentirà di ricostruirla a partire da un archivio di medie.

Questo è il primo dei tre errori, nonché quello che suscita maggiori discussioni.

**Interpretare una media come un picco.** Se l’obiettivo è valutare la saturazione, osservate un grafico basato sul massimo, non sulla media. Questo funziona unicamente se gli archivi conservano i massimi. Se rimangono solo medie grossolane, i picchi originali non possono essere ricostruiti. Un archivio MAX conserva i massimi dei punti di ingresso normalizzati nel tempo, non un picco istantaneo non rilevato tra un polling e l’altro.

Vi è qui un comportamento silenzioso che conviene conoscere. Se un elemento del grafico richiede i massimi e il file non li contiene, il selettore di Kadupul può ripiegare sulla prima funzione disponibile, o su AVERAGE qualora non riesca a determinare le funzioni disponibili. L’immagine appare corretta, ma risponde a una domanda differente.

**Interpretare un’interruzione come uno zero.** Un’interruzione rappresenta un valore tracciato sconosciuto. Tra le cause rientrano aggiornamenti mancanti, input esplicitamente sconosciuti, valori scartati ed espressioni di calcolo del grafico. Non identifica in modo univoco un dispositivo non disponibile.

L’heartbeat rappresenta il tempo massimo consentito tra due aggiornamenti, non un tempo aggiuntivo che si somma allo step. Ad esempio, uno step di 300 secondi con un heartbeat di 600 secondi ammette al massimo 600 secondi tra gli aggiornamenti, non 900. Anche le soglie dei dati sconosciuti dell’archivio influiscono sulle interruzioni visibili. Si vedano le [Definizioni delle origini dati di RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e [Tempo e intervalli](/it/concepts/time-and-intervals/).

Prestate attenzione ai grafici sovrapposti in questo scenario. Alcuni modelli sostituiscono i valori sconosciuti con lo zero nelle loro espressioni di calcolo. In tali grafici, un disservizio e un periodo di inattività risultano identici per progettazione. Verificate una visualizzazione non sovrapposta prima di concludere che un servizio si sia arrestato.

**Confrontare due grafici con scale verticali differenti.** Due grafici affiancati si adatteranno ciascuno ai propri dati. Una piccola variazione e una consistente possono apparire identiche. Controllate la scala dell’asse prima di trarre conclusioni.

Mentre esaminate l’asse, verificate la sua base. Un grafico può presentare etichette in migliaia oppure in unità di 1024. I valori memorizzati sono identici; cambiano soltanto le etichette. La differenza dipende dal prefisso: 1024 rispetto a 1000 è il 2,4% per la prima potenza e cresce con i prefissi maggiori. Controllate anche i bit rispetto ai byte, le espressioni del grafico e il consolidamento; una discrepanza percentuale da sola non identifica la causa.

## Lettura della legenda

La legenda riporta i numeri che contano più dell’andamento della curva. Il valore «Current» è di norma la riduzione LAST della serie selezionata, che non coincide necessariamente con una misura effettuata nell’istante esatto in cui si osserva il grafico. La media e il massimo vengono calcolati sull’intervallo temporale visualizzato, non sull’intera cronologia, per cui variano al variare dello zoom.

Le voci predefinite della legenda sono minimo, massimo, media e ultimo valore, etichettato come «current». Due aspetti sul loro funzionamento sorprendono spesso.

**Il valore nella legenda è una riduzione di ciò che è stato disegnato, non di ciò che è stato memorizzato.** Un massimo stampato su una serie letta con medie è il massimo di tali medie derivate alla risoluzione prescelta. Non è il campione più elevato mai registrato. Su una linea satura si tratta di numeri profondamente diversi, ed entrambi costituiscono risposte valide a quesiti differenti.

**Verificate quale serie viene utilizzata dalla legenda.** Semplici voci GPRINT possono ereditare la serie dell’elemento tracciato precedente; gli elementi dedicati a minimo, massimo, media e ultimo valore seguono una gestione separata. Riordinare gli elementi in un modello di grafico può quindi modificare ciò che la legenda riporta senza che nessuno l’abbia modificata direttamente. Se un valore numerico cambia dopo la modifica di un modello non correlato, verificate innanzitutto l’ordine degli elementi.

## Quando un grafico sembra errato

Verificate la catena di raccolta in questo ordine; l’anomalia può verificarsi in più di una fase.

1. Il dispositivo sta rispondendo in questo momento?
2. Il poller è in esecuzione e conclude entro il proprio intervallo?
3. Il file RRD presenta un orario di aggiornamento recente?
4. Il grafico sta leggendo l’origine dati corretta?

In concreto:

**Passaggio 1.** Eseguite lo stesso comando `snmpget` utilizzato al momento dell’aggiunta del dispositivo, dal collector assegnato. Se fallisce, risolvete tale problema di raccolta prima di valutare il grafico.

**Passaggio 2.** Cercate il riepilogo di fine esecuzione. Se manca, verificate la pianificazione, la destinazione configurata per il log ed eventuali arresti precoci del poller. Un’esecuzione più lunga dell’intervallo può ritardare gli aggiornamenti; confrontate l’interruzione di aggiornamento risultante con l’heartbeat.

**Passaggio 3.** Interrogate direttamente RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

`last` segnala il timestamp dell’ultimo aggiornamento, compresi gli aggiornamenti con valori sconosciuti; le scritture memorizzate nel buffer possono ritardarlo. Usate `lastupdate` e `fetch` per ispezionare i valori come descritto nella guida del dispositivo. `info` indica lo step, l’heartbeat, il tipo di origine dati e quali archivi sono presenti. Se il file non contiene un archivio dei massimi, questo risolve il dubbio precedente relativo ai picchi.

**Passaggio 4.** Attivate la modalità di debug del grafico ed esaminate il comando generato. Questo elenca i file, le origini dati al loro interno e la funzione di consolidamento per ciascuna. È frequente che un grafico punti a un’origine dati differente da quella prevista in seguito alla riapplicazione di modelli o alla reindicizzazione delle interfacce.

## Sintomi e significato consueto

| Cosa si vede | Solitamente |
|---|---|
| Linea piatta sullo zero | Può essere uno zero reale oppure un’espressione che sostituisce i valori sconosciuti con lo zero |
| La linea si interrompe e poi riprende | Un valore sconosciuto ha interrotto la serie tracciata; controllate la raccolta e le espressioni del grafico |
| Piccole interruzioni frequenti | Il poller termina in ritardo, oppure l’heartbeat è impostato troppo vicino allo step |
| Picco visibile a quattro ore, assente a una settimana | Controllate la risoluzione dell’archivio e il consolidamento prima di ipotizzare una perdita di dati o un problema di raccolta |
| Massimo in legenda inferiore al picco disegnato | La legenda sta riducendo una serie diversa da quella presunta |
| Intero grafico vuoto, senza errori | Nessuna origine dati collegata, oppure nessun dato ancora raccolto |
| Valori errati di un ordine di grandezza | Tipo di origine dati non corretto o contatori a 32 bit che si azzerano |
| Due grafici dello stesso collegamento discordano leggermente | Base dell’asse differente o consolidamento diverso |

[Risoluzione dei problemi per i dati mancanti](/it/guides/troubleshoot-missing-data/) approfondisce questo percorso. [Personalizzare l’aspetto dei grafici](/it/guides/tune-graph-appearance/) spiega come modificare l’aspetto visivo di un grafico dopo averne verificato l’affidabilità dei contenuti.

Si conclude qui il tutorial. Disponete ora di un’installazione operativa, di un dispositivo che risponde e di un grafico comprensibile. Da qui in avanti, le [Guide pratiche](/it/guides/monitor-a-switch/) illustrano attività specifiche e i [Concetti](/it/concepts/architecture/) spiegano le ragioni alla base del comportamento del sistema.
