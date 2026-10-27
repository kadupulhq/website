---
title: Fonti di dati e archivi round-robin
description: Cosa viene memorizzato, come funziona la conservazione e perché le modifiche ai profili non migrano i file RRD esistenti.
sidebar:
  order: 2
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

Una fonte di dati di Kadupul raggruppa misurazioni nel tempo ed è normalmente associata a un singolo file RRD.
Ciascun campo con nome all'interno di tale file viene chiamato fonte di dati (DS) anche da RRDtool.
Distinguete l'oggetto dell'applicazione dai suoi singoli campi quando confrontate conteggi o impostazioni.

Un file non corrisponde sempre a un singolo numero. Una fonte di dati può contenere diversi campi, e un'interfaccia
rappresenta il caso ordinario: i byte in ingresso e i byte in uscita condividono lo stesso file, vengono raccolti
come elementi di lavoro separati e scritti insieme in un unico aggiornamento. Ciò che condividono è un intervallo di passo (step),
un insieme di archivi e un destino comune: non è possibile conservarne uno più a lungo dell'altro, poiché la conservazione
è una proprietà del file e non del singolo campo.

## Cosa c'è dentro il file

Un file RRD è composto da un'intestazione e da due elenchi.

Il primo elenco riguarda i campi: un nome, un tipo, un heartbeat e un valore minimo e massimo per ciascuno.
Il secondo è l'elenco degli archivi: una funzione di consolidamento, quanti passi di dati grezzi confluiscono
in uno slot, quanti slot sono presenti e quanta parte di uno slot può essere sconosciuta prima che lo slot stesso diventi sconosciuto.

La creazione registra queste definizioni nel file. I metadati del database e le definizioni effettive dei file
possono successivamente divergere; ispezionate il file con `rrdtool info` anziché presumere che il modello
corrente lo descriva esattamente.

<span id="the-decisions-that-are-permanent"></span>

## Decisioni di creazione e manutenzione successiva

Un file RRD viene allocato al momento della creazione. Le modifiche ai profili non migrano i file esistenti.
RRDtool offre operazioni di ottimizzazione e ridimensionamento in grado di preservare i dati memorizzati,
ma richiedono convalida e backup separati. Il normale percorso di creazione verifica la presenza di un file
esistente e ritorna senza sovrascriverlo. Tale protezione non impedisce ottimizzazioni o migrazioni esplicite.
Il solo salvataggio di un modello non aggiorna la struttura dei file già esistenti.

Quattro scelte vengono fissate in quel momento.

**Il passo (step).** Con quale frequenza è atteso un valore, solitamente 300 secondi. RRDtool normalizza
gli aggiornamenti sui limiti del passo; letture più frequenti non vengono semplicemente scartate. Il fatto
che aggiornamenti più lenti producano dati sconosciuti (unknown) dipende dalle regole di heartbeat e consolidamento.
Il passo proviene normalmente dal profilo della fonte di dati. La creazione del file legge il passo memorizzato
della fonte di dati e gli archivi del profilo di riferimento; verificate entrambi quando modificate i metadati
o pianificate una migrazione.

**Il tipo di fonte di dati.** Vedere sotto. È l'impostazione che fallisce silenziosamente.

**I limiti.** Un minimo e un massimo vincolano i valori accettabili; per i tipi DS che calcolano una frequenza,
tali limiti si applicano alla velocità calcolata, non al totale grezzo del contatore. I dati fuori intervallo
diventano sconosciuti (unknown) anziché essere troncati al valore massimo. I valori massimi basati su query
possono risolvere i segnaposto della velocità dell'interfaccia; non tutte le fonti di dati delle interfacce
ricevono automaticamente un limite corretto per la velocità del collegamento. Verificate le unità del modello
e l'effettiva definizione del file.

La creazione prevede rami di normalizzazione specifici. Per un massimo letterale pari o inferiore al minimo,
GAUGE e ABSOLUTE utilizzano un massimo non definito; gli altri tipi utilizzano il minimo più uno. Le sostituzioni
di query seguono un ramo separato. Un controllo successivo su zero/zero modifica solo il valore massimo, e una
normalizzazione precedente potrebbe averlo già alterato. Non considerate questo meccanismo come un validatore
generale né date per scontato che entrambi i limiti diventino indefiniti.

**Gli archivi.** Quanti campioni conservare a quali risoluzioni e quale funzione di consolidamento utilizzare
per ciascuno. Questo è ciò che determina se potrete rispondere a una domanda tra due anni.

## Tipi di fonti di dati

| Tipo | Cosa memorizza | Adatto a |
|---|---|---|
| `GAUGE` | Un livello, normalizzato sul passo del file | Temperatura, carico medio, memoria in uso, profondità della coda |
| `COUNTER` | Tasso di variazione al secondo, con correzione per il riavvolgimento a 32 o 64 bit | Ottetti dell'interfaccia, conteggi di pacchetti ed errori |
| `DERIVE` | Tasso di variazione al secondo, può assumere valori negativi | Un contatore che può legittimamente scendere o essere azzerato |
| `ABSOLUTE` | Il valore fornito, diviso per il tempo trascorso dall'ultima lettura | Un conteggio che il dispositivo azzera a ogni lettura |
| `COMPUTE` | Un valore calcolato da altri campi nello stesso file anziché raccolto | Un campo derivato, come un totale o un rapporto |

Kadupul rende disponibili `DCOUNTER` e `DDERIVE` quando la versione di RRDtool configurata è 1.5 o successiva.
Accettano contatori a virgola mobile; DCOUNTER rileva inoltre la direzione del conteggio e gli azzeramenti,
quindi non è un semplice COUNTER con decimali. La tabella descrive la semantica di RRDtool, non una garanzia
che ogni tipo sia supportato da ogni editor o percorso di creazione di Kadupul; convalidate la definizione
generata, in particolare per le espressioni COMPUTE. Consultate il riferimento originale
[RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Scegliere il tipo errato

Questi esempi illustrano errori di configurazione tipici; la loro visibilità dipende dai dati e dai limiti impostati.

`GAUGE` applicato a un contatore crescente traccia il suo livello anziché la velocità di trasmissione. Può salire
fino a un azzeramento o riavvolgimento; questo può risultare evidente, ma su un intervallo di tempo breve
non appare necessariamente scorretto a prima vista.

`COUNTER` interpreta i cali utilizzando la correzione del riavvolgimento, quindi un azzeramento può trasformarsi
in un enorme tasso positivo oppure essere rifiutato dal valore massimo. `DERIVE` con un minimo pari a zero rifiuta
i tassi negativi, compresi i riavvolgimenti autentici; sceglietelo solo quando tale compromesso è adatto alla metrica.
Un valore massimo non distingue ogni azzeramento da un riavvolgimento legittimo.

`COUNTER` su un indicatore di livello (gauge) è il caso più insidioso. Il valore memorizzato diventa la variazione
del livello divisa per il tempo trascorso. Un dispositivo stabile a 40 gradi registra zero. Un aumento di un grado
in cinque minuti registra 0,0033. Il grafico può sembrare plausibile mentre misura la variazione anziché la temperatura.
Tale frequenza è utile solo se corrisponde alla grandezza desiderata; non rappresenta in alcun modo la temperatura originale.

`ABSOLUTE` su un contatore che non si azzera alla lettura rappresenta la stessa classe di errore silenzioso
nella direzione opposta, generando valori che scalano in proporzione al tempo di attività del dispositivo.

La regola suggerita è decidere il tipo in base a come il dispositivo produce il numero, non in base al significato
attribuito a quel numero. Il fatto che una lettura sia una frequenza è una proprietà del contatore, non della metrica.

## L'heartbeat

L'heartbeat rappresenta l'intervallo di tempo massimo consentito tra due aggiornamenti consecutivi per un campo
prima che RRDtool consideri l'intervallo come sconosciuto. Viene misurato tra gli aggiornamenti, non come tempo
aggiuntivo sommato al passo.

Consultate il profilo configurato e il file effettivo. Il profilo predefinito a cinque minuti utilizza un heartbeat
di 600 secondi, il profilo a un minuto utilizza anch'esso 600 secondi e il profilo a trenta secondi utilizza 1.200 secondi.
La tolleranza per le interrogazioni saltate non può quindi essere descritta da un unico moltiplicatore fisso;
anche la normalizzazione e il consolidamento influenzano quali intervalli del grafico risultano sconosciuti.

L'heartbeat è impostato per ciascun campo, non per l'intero file. I valori del profilo determinano i metadati,
ma la creazione del file legge l'heartbeat locale dell'elemento, che può differire dal profilo. I profili predefiniti
non adottano un unico rapporto, e le motivazioni alla base di ciascuno, insieme alle conseguenze di un heartbeat
impostato troppo vicino al passo, sono descritte in [Tempo e intervalli](/it/concepts/time-and-intervals/).

## Consolidamento

Man mano che arrivano gli aggiornamenti, RRDtool li consolida anche in intervalli temporali più ampi; non attende
la scadenza dell'archivio più dettagliato. La funzione viene scelta per ciascun archivio, e ogni funzione risponde
a un quesito differente:

- `AVERAGE` sintetizza i punti dati primari che contribuiscono all'intervallo.
- `MAX` conserva il loro valore massimo.
- `MIN` conserva il loro valore minimo.
- `LAST` conserva il loro ultimo valore secondo le regole di consolidamento di RRDtool.

Queste funzioni operano su punti dati primari normalizzati, non necessariamente sulle letture grezze originali.
Un archivio MAX non può recuperare un picco istantaneo già mediato all'interno di un intervallo primario; MIN
non costituisce un indicatore affidabile per ogni singola interruzione.

Un file memorizza un archivio per funzione per risoluzione, quindi conservare tutte e quattro le funzioni su quattro
risoluzioni comporta sedici archivi e un payload di valori quattro volte superiore rispetto ai soli valori medi
a parità di righe. Anche l'intestazione e lo stato di preparazione occupano spazio. Tutti e tre i profili predefiniti
selezionano quattro funzioni; scegliete la conservazione in base alle domande analitiche e ai requisiti di capacità
del vostro ambiente.

Se conservate solo i valori medi, non potrete successivamente interrogare i picchi: i picchi non sono mai stati scritti.
Questo è il rimpianto più comune nelle installazioni longeve e non può essere corretto retroattivamente.

Alcuni percorsi di generazione dei grafici sostituiscono una funzione mancante con una disponibile; altri percorsi
possono fallire. Verificate la DEF generata e gli archivi effettivi come descritto in
[Come vengono disegnati i grafici](/it/concepts/how-graphs-are-drawn/).

## Lo stato sconosciuto è un valore reale

Un RRD distingue accuratamente lo zero dallo stato sconosciuto (unknown). Lo zero può essere un livello rilevato
o una velocità calcolata, ad esempio per un contatore invariato. Lo stato sconosciuto può derivare da aggiornamenti
mancanti, scadenza dell'heartbeat, input esplicitamente sconosciuti, limiti rifiutati o dati di consolidamento insufficienti.
Sostituire un valore sconosciuto con uno zero può far sembrare un'inattività ciò che in realtà è una misurazione mancante o non valida.

Lo stato sconosciuto si propaga nel consolidamento secondo una soglia stabilita per ciascun archivio. I profili predefiniti
la impostano alla metà: uno slot aggregato composto da dati parzialmente mancanti rimane un numero reale finché
più della metà dei suoi input non risulta sconosciuta, punto in cui l'intero slot diventa sconosciuto. La visibilità
dipende dall'allineamento degli slot, dall'heartbeat, dalla normalizzazione, dal consolidamento e dalla visualizzazione
del grafico. Non esiste una durata universale del disservizio che garantisca la comparsa o la scomparsa di un'interruzione
in ogni archivio.

Lo stato sconosciuto è anche ciò che generano i limiti. Una lettura superiore al massimo configurato non viene limitata
al valore massimo. Un azzeramento del contatore può produrre una frequenza fuori scala e un'interruzione, ma i limiti
non intercettano ogni azzeramento. I dati sconosciuti da soli non identificano la causa; confrontate gli errori di raccolta
e le marche temporali.

## Dimensionamento

A parità di layout, il payload dei valori degli archivi è dato dal totale degli slot di tutti gli archivi, moltiplicato
per il numero di campi, moltiplicato per otto byte. La dimensione totale del file e dell'installazione comprende
inoltre intestazioni, stato di preparazione, allocazione del file system, code e copie di backup. Gli interventi
espliciti sul layout possono modificare le dimensioni del file.

I tre profili inclusi differiscono molto più di quanto i loro nomi lascino intendere:

| Profilo | Passo | Slot per campo | Payload per campo | Costo relativo |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11.488 | circa 90 KiB | 1 |
| 30 Second Collection | 30 s | 40.284 | circa 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81.716 | circa 640 KiB | 7 |

Una fonte di dati per interfaccia a due campi raddoppia ciascuno di questi valori. Diecimila interfacce con il profilo
a cinque minuti richiedono circa 1,8 GB di dati negli archivi. Le stesse diecimila interfacce con il profilo a un minuto
si avvicinano a 13 GB, e il motivo non è soltanto l'intervallo del passo: tale profilo mantiene inoltre un archivio mensile
molto più esteso e un archivio decennale annuale.

La copertura temporale effettiva di ciascun archivio merita di essere verificata rispetto alla sua denominazione.
Gli archivi del profilo a cinque minuti sono denominati Daily, Weekly, Monthly e Yearly, e gli intervalli che contengono
sono rispettivamente 50 ore, 14,6 giorni, 64,6 giorni e 2,2 anni. I nomi descrivono l'impostazione grafica predefinita
per cui ciascun archivio è stato dimensionato, non la sua conservazione. Se dovete analizzare i dati dello scorso aprile
a una risoluzione di cinque minuti, l'etichetta suggerirà che è possibile farlo, ma l'archivio non conterrà tali dati.

Anche il carico di scrittura varia insieme al profilo, manifestandosi ben prima che lo spazio su disco si esaurisca.
Alla massima cadenza di raccolta, un passo di trenta secondi genera una quantità di campioni dieci volte superiore
rispetto a un passo di cinque minuti. Raggruppamento in batch, campi condivisi, selezione delle attività da eseguire
e nuovi tentativi falliti influenzano il numero di comandi e di scritture fisiche; non si tratta di un rapporto rigido. Consultate
[Scritture ad alto volume](/it/concepts/high-volume-writes/).

## Quali campi raggiungono il file

Una fonte di dati generata da un modello di dati riceve un campo nel file solo per i campi a cui fa riferimento
almeno un elemento del grafico nel normale percorso di creazione. Il codice di aggiornamento può escludere i campi
del modello non referenziati; il fatto che vengano raccolti dipende dal metodo di input e dalla cache, non solo
dalla presenza visibile di una linea sul grafico. Una fonte di dati priva di modello riceve invece tutti i campi,
in quanto potrebbe non esserci alcun grafico a monte per effettuare la selezione.

Un riferimento non deve necessariamente tracciare una linea visibile: ispezionate le associazioni degli elementi del grafico,
la cache e la definizione del file. L'aggiunta di un campo al modello da sola non garantisce che raccolta, associazione
al grafico e archiviazione siano pronte. La ricostruzione della cache aggiorna i metadati di raccolta; non aggiunge
nuovi campi a un file RRD esistente.

Ciò significa inoltre che l'aggiunta di un campo a un modello non lo aggiunge automaticamente ai file già esistenti,
nemmeno dopo che un elemento grafico vi fa riferimento. L'aggiunta richiede un intervento di manutenzione esplicito
o una migrazione. A seconda della versione di RRDtool installata, le operazioni di ottimizzazione possono aggiungere
fonti di dati preservando i dati memorizzati; eliminare e ricreare un file comporta la perdita della cronologia. Consultate
[Gestire la conservazione dei dati](/it/guides/manage-data-retention/) per le procedure di verifica e manutenzione.
