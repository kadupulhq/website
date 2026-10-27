---
title: Tempo e intervalli
description: Intervallo di polling, passo RRD, heartbeat e disallineamento dell'orologio, e perché il timestamp di un campione decide più di quanto ci si aspetti.
sidebar:
  order: 7
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

La raccolta dati coinvolge tre orologi: la frequenza dell'avviatore, l'intervallo di polling all'interno di ciascuna esecuzione e il passo RRD. Essi richiedono impostazioni compatibili.

| Numero | Appartiene a | Modalità di utilizzo |
|---|---|---|
| Intervallo di avvio | Cron, Utilità di pianificazione o `cactid.php` | Deve corrispondere a `cron_interval`, interpretato da `poller.php` come 60 o 300 secondi |
| Intervallo di polling | Cicli di raccolta | `poller.php` calcola un numero intero di cicli per ciascun intervallo di avvio |
| Passo | Un file RRD | Intervallo base di normalizzazione, impostato dal profilo dell'origine dati alla creazione |
| Heartbeat | Un campo nel file RRD | Massimo intervallo consentito tra gli aggiornamenti; la creazione legge la definizione del campo |

Ad esempio, un avviatore impostato a 60 secondi e un intervallo di polling di 10 secondi generano sei cicli per esecuzione. Un avviatore a 300 secondi e un intervallo di polling di 300 secondi ne generano uno solo. Non configurare mai l'intervallo di avvio a un valore inferiore rispetto all'intervallo di polling: il calcolo 60/300 produrrebbe zero cicli. Utilizzare un unico strumento di pianificazione e arrestarlo prima di un'esecuzione manuale con `--force`. Consultare [Installazione](/it/start/install/).

La modifica di un profilo non migra automaticamente i file esistenti. L'heartbeat può essere regolato; le variazioni del passo richiedono una migrazione pianificata tramite gli strumenti forniti da RRDtool. Verificare in seguito le definizioni nel database e l'output di `rrdtool info`.

## Quando coincidono

Un'origine dati il cui passo è uguale all'intervallo di polling è idonea a ogni ciclo, compatibilmente con lo stato del dispositivo, i contenuti della cache e i limiti di tempo di esecuzione. I valori predefiniti utilizzano 300 secondi per entrambi. L'idoneità non garantisce una lettura corretta.

## Quando il passo è più lungo dell'intervallo

Il collettore PHP utilizza `rrd_next_step` su ogni riga dell'elenco di lavoro quando pianificazioni multiple lo richiedono. Seleziona le righe con valore minore o uguale a zero, quindi aggiorna i conteggi per il proprio ambito di host e collettore. Le righe il cui passo equivale all'intervallo di polling restano a zero. Le altre righe decrementano del valore dell'intervallo di polling; in caso di underflow, il ripristino dipende dalla modalità: una normale esecuzione subordinata reimposta al passo meno l'intervallo, mentre intervalli coincidenti e il percorso globale reimpostano al passo completo. Non dare per scontato che un passo di dieci minuti implichi sempre una lettura ogni due esecuzioni da cinque minuti; verificare le righe in scadenza e i timestamp effettivi.

Abilitando **Bilanciamento del carico dei processi**, la generazione della cache assegna scostamenti alle origini dati successive di un dispositivo in base al passo e all'intervallo di polling. I campi della medesima origine condividono lo scostamento. Questo può distribuire il carico tra i cicli, ma non garantisce tempi di esecuzione identici: latenze, timeout e script variano. L'avviatore provvede inoltre a riallineare i conteggi incoerenti tra i campi della stessa origine dati.

Prima di ritenere guasto un elemento che non ha prodotto dati in un ciclo, verificarne lo stato di scadenza e i cicli successivi. Vedere [La cache del poller](/it/concepts/the-poller-cache/) per i limiti di rigenerazione.

## Quando il passo è più breve dell'intervallo

Un passo più breve non può generare rilevazioni che il collettore non ha mai effettuato. Kadupul segnala un avviso durante la creazione della cache se la raccolta è troppo lenta rispetto al passo; correggere i parametri e rigenerare la cache interessata.

Questa discrepanza non genera necessariamente un grafico dentellato. RRDtool può normalizzare aggiornamenti meno frequenti in passi più piccoli quando l'heartbeat lo consente, ma questo non recupera i dettagli di misurazione mancanti.

## L'heartbeat non è sempre il doppio del passo

L'heartbeat rappresenta l'intervallo massimo consentito tra due aggiornamenti prima che il valore venga trattato come sconosciuto. La creazione del file RRD legge l'heartbeat dalla definizione del campo dell'origine dati, che può ereditare i valori dal profilo o dal modello. Non si tratta di un periodo di tolleranza aggiuntivo; verificare il campo e il file se differiscono dal profilo.

I profili standard non seguono un'unica regola.

| Profilo | Passo | Heartbeat | Limite intervallo di aggiornamento |
|---|---|---|---|
| Cinque minuti | 300 | 600 | 10 minuti |
| Un minuto | 60 | 600 | 10 minuti |
| Trenta secondi | 30 | 1200 | 20 minuti |

Questi sono valori predefiniti del profilo, non timer per rilevare interruzioni di servizio. Valori esplicitamente sconosciuti possono creare lacune prima della scadenza dell'heartbeat; normalizzazione e soglie di archivio influiscono su ciò che diviene visibile. Un heartbeat maggiore tollera intervalli più lunghi. Se impostato a un valore pari o inferiore al normale intervallo, non lascia margine per ritardi.

Controllare il file effettivo oltre al suo profilo. I file RRD esistenti possono differire dalle definizioni modificate nel database; la verifica dei file evidenzia tali scostamenti. Consultare la [definizione dell'heartbeat di RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) e la [guida di ottimizzazione](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) prima di pianificare modifiche.

## Ciò che viene archiviato non è quanto rilevato dal dispositivo

RRDtool normalizza gli aggiornamenti secondo intervalli temporali fissi. I valori compresi tra due limiti possono contribuire a più di un punto dati primario. Heartbeat, valori sconosciuti e intervalli ammessi influenzano i dati validi; il consolidamento applica una propria soglia per i dati sconosciuti. Un passo non richiede un campione grezzo distinto per contenere un valore valido.

I contatori si trasformano in frequenze temporali in base all'intervallo trascorso, tenendo conto di azzeramenti e soglie massime. Anche gli indicatori istantanei vengono normalizzati nel tempo. Picchi brevi possono risultare attenuati o del tutto omessi; valori costanti o allineati con i limiti di passo non subiscono riduzioni. Le impostazioni dell'archivio non possono ricostruire dettagli mai raccolti o perduti durante la normalizzazione.

## Quale orologio decide

Nella raccolta standard tramite `cmd.php`, l'istruzione SQL `CURRENT_TIMESTAMP()` fornisce il timestamp di output all'inserimento del blocco. Non si tratta di un timestamp fornito dal dispositivo né di una misura esatta di quando esso ha risposto. Altri motori di raccolta e i percorsi in tempo reale devono essere valutati a parte.

Il collettore PHP accumula i risultati e li scrive a blocchi, effettuando lo scaricamento al cambio di dispositivo o a buffer pieno. Il timestamp viene determinato una volta per blocco, quindi tutti i valori dello stesso lotto condividono lo stesso riferimento temporale.

Le conseguenze non sono banali ed è utile chiarirle con precisione.

**L'orologio del dispositivo non assegna il timestamp a questi campioni SNMP.** Il collettore adotta l'orario di inserimento nel database. L'orario del dispositivo può comunque risultare rilevante per gli script o per l'interpretazione di determinate metriche, quindi questo non autorizza a trascurare la sincronizzazione degli orologi.

**Un orologio errato sul collettore o sul database altera i dati temporali.** I valori vengono posizionati negli slot errati e, su un file già parzialmente popolato, un aggiornamento la cui data non è successiva all'ultima viene rifiutato. Se i timestamp retrocedono rispetto all'ultimo aggiornamento registrato nel file, i nuovi dati non faranno avanzare il file finché non supereranno tale soglia. Verificare l'orologio del database, quello del collettore e il timestamp del file; modificare l'orologio del collettore non altera automaticamente i timestamp generati dal database.

**Il tempo all'interno di un ciclo si trasforma in oscillazione.** Un dispositivo interrogato al termine di una lunga sessione riceve un timestamp posteriore rispetto a uno interrogato all'inizio, pur appartenendo al medesimo ciclo. In presenza di un carico elevato sul collettore, tale oscillazione può coprire una frazione consistente dell'intervallo e con un heartbeat troppo stretto genera discontinuità.

**Il fuso orario del database si colloca nel mezzo del tragitto.** Il timestamp viene memorizzato nel formato del database e riconvertito in tempo assoluto durante la lettura. Una gestione incoerente dei fusi orari di sessione può alterare tale interpretazione. Verificare le impostazioni delle sessioni di scrittura e lettura e la conversione epoch; una variazione del fuso orario di visualizzazione non dimostra che i dati storici memorizzati si siano spostati.

## Le letture sono raggruppate per timestamp

Un'origine dati con più campi, come un'interfaccia con byte in ingresso e in uscita, può utilizzare elementi di lavoro SNMP separati o uno script che restituisce più valori con nome. I campi elaborati vengono aggregati per origine dati e timestamp ai fini dell'aggiornamento RRD.

Un insieme incompleto viene trattenuto anziché registrato parzialmente, fino al raggiungimento del numero atteso di campi. Si tratta di un controllo di conformità, non di una garanzia di correttezza numerica; i valori esplicitamente sconosciuti possono comunque essere scritti. Generalmente entrambe le parti appartengono allo stesso blocco e condividono il timestamp. I blocchi inseriti nello stesso secondo possono comunque combinarsi. Se i campi ricevono timestamp differenti, i gruppi possono rimanere incompleti e non generare aggiornamenti. Il codice corrente preserva i gruppi incompleti attraverso i cicli, registrando un avviso e facendoli decadere dopo `5 * max(60, poller_interval)` secondi. Il limite della pagina di lettura viene esteso per comprendere l'ultimo gruppo di timestamp.

Gli aggiornamenti vengono inoltre ordinati in sequenza temporale crescente prima della scrittura, poiché un file non accetta valori anteriori all'ultimo aggiornamento registrato.

## Le scritture differite mantengono i loro timestamp

Quando le operazioni di scrittura RRD sono differite e applicate a lotti in un momento successivo, il timestamp registrato accompagna il dato e il lotto viene scritto rispettando l'ordine cronologico. Un timestamp delle dodici viene mantenuto se l'aggiornamento viene tentato all'una; non viene sostituito con l'orario di scaricamento. RRDtool provvede comunque a normalizzare gli aggiornamenti accettati entro i propri confini di passo.

Una coda accumulata può far avanzare un file attraverso timestamp più recenti rispetto al suo ultimo aggiornamento. Tuttavia non può colmare a ritroso lacune precedenti a quel timestamp. Il motore di scrittura Boost esclude i campioni con data pari o precedente all'ultimo aggiornamento del file; una coda svuotata non prova che ogni campione sia stato applicato. Vedere [Scritture ad alto volume](/it/concepts/high-volume-writes/) e la [documentazione di aggiornamento di RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Le scritture differite dipendono dal completamento della scrittura e dal corretto ordine cronologico; non garantiscono il recupero da qualsiasi anomalia. Ispezionare i dati trattenuti e scartati quando la coda non si esaurisce.

## Quando il ciclo non si conclude

Il collettore PHP monitora il tempo di esecuzione tra le attività e interrompe il ciclo al superamento dell'intervallo di polling, registrando un avviso. Non si tratta di un'interruzione netta al raggiungimento della scadenza: un'operazione in corso può protrarsi oltre il controllo. Gli elementi non ancora raggiunti non generano valori per quel ciclo. Le interruzioni possono essere colmate se i parametri di heartbeat e di archivio lo permettono. Sforamenti ripetuti devono indurre a verificare risorse, timeout ed errori di raccolta, non costituendo la prova che ogni lacuna abbia la stessa origine.

La guida [Scalare il poller](/it/guides/scale-the-poller/) illustra come intervenire. La sequenza di un'esecuzione e i controlli di protezione sono descritti nel [Ciclo di vita del poller](/it/reference/poller-lifecycle/).
