---
title: Scalare il poller
description: Cosa modificare quando la raccolta non riesce più a completarsi entro l'intervallo stabilito e come capire quale limite è stato effettivamente raggiunto.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 6
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Scalare il poller si riduce a una domanda fondamentale: un ciclo di raccolta termina prima
dell'inizio di quello successivo? Tutto quanto segue è pensato per rispondere a questa domanda
e fare in modo che la risposta torni a essere un sì.

Leggete prima [Architettura](/it/concepts/architecture/) se non vi è del tutto chiaro quale
componente si occupi dell'effettiva raccolta dei dati.

## I due orologi

Esistono due intervalli differenti che non rappresentano la stessa impostazione.

| | Cos'è | Valori consentiti |
|---|---|---|
| Intervallo del launcher | Con quale frequenza il sistema operativo avvia il collector, da cron o dal servizio `cactid` | 60 o 300 secondi |
| Intervallo del poller | Cadenza base di raccolta; i passi delle singole origini dati possono essere più estesi | 10, 15, 20, 30, 60 o 300 secondi |

Quando l'intervallo del poller è inferiore rispetto a quello del launcher, un singolo avvio
esegue più cicli di raccolta all'interno di un loop. Il numero di passaggi è pari all'intervallo
del launcher diviso per l'intervallo del poller.

Il budget complessivo per l'intero avvio deriva da questi due valori: i passaggi moltiplicati
per l'intervallo del poller, meno due secondi. È questo il tempo effettivo rispetto al quale
viene misurata la durata dell'esecuzione.

## Cosa succede in caso di sforamento del tempo

Si verificano tre eventi distinti che generano tre diverse righe di log.

**L'esecuzione viene interrotta.** Quando il tempo trascorso supera il budget, il poller registra
che il tempo massimo di esecuzione è stato oltrepassato, scrive le sue statistiche e termina.
Il lavoro che non ha prodotto una misurazione può lasciare un vuoto nei dati. Le misurazioni già
acquisite nella coda persistente possono restare in sospeso in vista di una successiva scrittura RRD
completata con successo; uno sforamento non implica che ogni misurazione non ancora scaricata sia
andata persa. Verificate la profondità della coda e i file di log insieme al grafico, e non eliminate
le righe trattenute solo per dare un'illusione di pulizia al ciclo successivo.

**L'esecuzione successiva rileva le anomalie rimaste.** All'avvio, il poller conta le righe dei
processi rimasti aperti e avvisa del rilevamento di processi che hanno oltrepassato il ciclo di
polling. Ispezionate i record di processo incompleti o obsoleti e i processi figli effettivamente
attivi; il solo messaggio di avviso non individua la causa del collo di bottiglia.

**Gli orologi perdono sincronia.** Se è trascorso più tempo rispetto a quanto consentito dal budget
dall'ultima esecuzione, il poller avverte che il launcher non è allineato con l'intervallo del
poller. Di solito il problema riguarda il launcher e non il poller: una voce cron con frequenza
errata, un servizio arrestato o un host rimasto in sospensione.

Questi percorsi richiamano la funzione di notifica per gli amministratori. Il recapito dipende dai
destinatari impostati, dai controlli di notifica e dal funzionamento del server di posta; un avviso
nel log non dimostra che un'email sia stata effettivamente consegnata. Consultate le
[notifiche via email](/it/guides/send-email-notifications/).

Esiste una quarta situazione che non costituisce un vero sforamento. Se il poller viene avviato prima
del previsto, registra che è configurato per girare con frequenza eccessiva ed esce senza raccogliere
dati. L'argomento `--force` ignora questo controllo temporale; usatelo solo per diagnosi controllate
quando gli avvii pianificati e manuali sono sospesi. Non aumenta la capacità né rende sicuro un polling
con sovrapposizioni.

## La riga delle statistiche

Al termine di ogni esecuzione completata viene scritta una riga di riepilogo statistico nel log.
Include il tempo impiegato, la modalità di raccolta, il numero di processi e thread, la quantità
di dispositivi, i dispositivi per processo, le origini dati e i file RRD elaborati.

Monitorate l'andamento del tempo trascorso, la latenza di coda, la profondità della coda e gli
aggiornamenti falliti. Esaminate con attenzione anche una singola esecuzione vicina al limite di
budget se determina interruzioni nei grafici; una crescita persistente aiuta a identificare quando
è opportuno rivedere la capacità o le modalità di raccolta.

## Processi e thread

Due regolazioni che svolgono compiti distinti.

| Parametro | Unità di lavoro ripartita | Quale collector lo usa |
|---|---|---|
| Processi | Dispositivi, suddivisi in intervalli contigui di ID dispositivo | Entrambi |
| Thread | Elementi appartenenti a un singolo dispositivo | Solo Spine |

La conseguenza fondamentale è il dettaglio su cui spesso ci si confonde: **a un processo vengono
assegnati dispositivi completi.** Un dispositivo dotato di cinquemila origini dati non può essere
ripartito tra più processi. Ricade interamente in un solo processo e quel processo impiegherà tutto
il tempo necessario. Incrementare il numero dei processi non aiuterà in questo caso.

Entrambi i parametri sono definiti per singolo data collector, non su scala globale. I valori nella
schermata delle impostazioni sono profili predefiniti applicati alla creazione di un nuovo data
collector. Cambiare i valori predefiniti non modifica i collector già esistenti.

Esiste inoltre un conteggio dei thread per dispositivo, che consente di frammentare il carico di un
singolo dispositivo complesso. Questa opzione è valida esclusivamente per il collector in C.

Balance Process Load sfrutta il conteggio cumulativo degli elementi per definire i limiti tra dispositivi
interi in base all'ordinamento per ID dispositivo. Non spezza un singolo dispositivo né assicura un
numero identico di elementi tra processi, e il numero di elementi non equivale al tempo di elaborazione.
Confrontate i tempi di ogni processo prima e dopo aver abilitato questa opzione su un carico di lavoro
rappresentativo e isolato.

## Il collector in PHP rispetto al collector in C

Il collector in PHP, `cmd.php`, è distribuito nativamente con l'applicazione. Kadupul intende
mantenere un fork di Spine, ma il repository dei sorgenti e i pacchetti verificati non sono ancora
documentati. Usate PHP finché queste prove non saranno disponibili. I confronti con Spine, le opzioni
relative ai thread e i comandi illustrati sotto si riferiscono al comportamento ereditato e non a un
ambiente Kadupul supportato.

| | Collector PHP | Spine |
|---|---|---|
| Parallelismo | Solo processi | Processi e thread |
| Gestione thread | Fissato a 1 a prescindere dalla configurazione | Rispettato |
| Script server | Uno per processo, non modificabile | Da 1 a 15 per processo, configurabile |
| Timeout script | Non previsto | Applicato, 25 secondi come valore base |
| Installazione | Incluso nel codice | Fork pianificato; nessun build Kadupul validato al momento |

La limitazione forzata dei thread merita di essere chiarita: se si sceglie il collector PHP, la variabile
del numero di thread in esecuzione viene impostata forzatamente a 1; questo comportamento non sovrascrive
il valore salvato per il collector. Per scalare il collector PHP possono servire più processi, e il
consiglio riportato nel codice sorgente è di rimanere entro il doppio dei core della CPU.

La configurazione di Spine e il comportamento dei comandi richiedono una verifica puntuale sul binario
effettivamente in uso. Il solo codice sorgente dell'applicazione in PHP non stabilisce con certezza
l'ordine di lettura della configurazione, la gestione dei thread o eventuali effetti collaterali.

Esempi ereditati per una verifica isolata di Spine, non comandi convalidati per Kadupul:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

L'opzione `--readonly` nasce per escludere la scrittura dei risultati su disco. Continua comunque a
interrogare i dispositivi e a eseguire gli script di raccolta; verificatene prima le conseguenze in un test dedicato.

## Connessioni al database

I thread non sono a costo zero. Ciascun thread di Spine detiene una propria connessione verso il
database, e lo stesso accade per ogni script server.

```
estimated worker connections = processes * (threads + script_servers)
```

Questa formula rappresenta la stima riportata nella documentazione dell'applicazione, non un limite
massimo misurato sul campo. Sommatela tra i vari collector e tenete un margine per i processi padre
del poller, le richieste web, la manutenzione e altri accessi concorrenti. Misurate i picchi reali di
connessione e i rifiuti prima di fissare il limite sul database; aumentarlo comporta un maggior consumo di risorse.

L'esaurimento delle connessioni può causare misurazioni mancanti, ma vuoti a rotazione nei dati non
costituiscono una prova univoca. Trovate conferma esaminando i parametri di connessione al database e
gli errori generati dall'applicazione.

## Scritture RRD differite

Esiste una modalità operativa che evita al poller di scrivere sui file RRD a ogni passaggio. Le letture
si accumulano invece all'interno di una tabella sul database e vengono salvate su disco in blocco, in base
a un intervallo temporale o quando un grafico richiede esplicitamente il file. In questo modo si sostituisce
un elevato numero di piccole scritture con un numero contenuto di scritture più corpose.

Due aspetti operativi determinanti:

- Questa modalità è obbligatoria in presenza di remote data collector. Non è un suggerimento, ma un
  requisito vincolante imposto dall'architettura del software.
- La tabella di accumulo è permanente e non risiede in memoria volatile, garantendo che i dati non ancora
  riversati sopravvivano al riavvio del server. Questo significa anche che i file RRD non risulteranno
  immediatamente allineati al database. Consultate [Backup e ripristino](/it/guides/back-up-and-restore/)
  prima di catturare snapshot.

In questa revisione, la coda principale in transito `poller_output` adotta anch'essa il motore InnoDB.
La verifica preventiva dell'archiviazione rifiuta code in memoria (MEMORY); ampliare i limiti per le tabelle
in memoria non risolve questo vincolo. Con le attività di raccolta sospese e disponendo di un backup
coerente, convertite esplicitamente code non idonee ereditate e verificate l'accesso all'archiviazione per
ciascun account di servizio:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Queste operazioni vanno eseguite separatamente. Preservate le righe in attesa e tenete sotto controllo
lo spazio disco del database e l'anzianità dei dati in coda oltre al totale delle righe. Consultate
[Aggiornare in sicurezza](/it/guides/upgrade-safely/) per la selezione della coda, i controlli di
autorizzazione degli account di servizio e i requisiti prima del riavvio.

## Quando ricorrere a raccoglitori remoti

Un raccoglitore di dati remoto è una macchina secondaria che esegue il medesimo software con un
identificativo univoco, interroga una parte dei dispositivi e riversa i dati raccolti nel database centrale.

Conviene adottarlo quando il collo di bottiglia è legato alla fase di raccolta e non a quella di archiviazione:

- L'utilizzo della CPU sul server del poller tocca il 100% durante l'elaborazione e resta inattivo tra un ciclo e l'altro.
- La latenza di rete verso un gruppo omogeneo di apparati rallenta l'intero ciclo ed essi sono attestati su una medesima tratta.
- Una sede remota è collegata tramite una connessione WAN che non si intende saturare con il polling diretto.
- È necessaria la raccolta presso una sede isolata ed è stato validato il funzionamento dell'accumulo locale e del ripristino prima dell'entrata in produzione.

I remote collector non eliminano i limiti imposti dal database centrale o dalle operazioni di scrittura
sui file RRD. Verificate la capacità di ricezione e riversamento del nodo centrale prima di accelerare
il ritmo di raccolta; un maggior numero di collector può incrementare la coda esistente.

Ogni collector possiede configurazioni proprie per processi e thread, credenziali di accesso al database
e un tempo di sincronizzazione fissato di base a due ore. Un'utilità a riga di comando permette di
forzare una sincronizzazione completa immediata.

Il sistema centrale può distribuire il codice del sito e dei plugin ai collector remoti in modo che si
aggiornino da soli. Questo sincronismo automatico può essere disattivato qualora il codice venga gestito
tramite altri strumenti di automazione.

## Quale limite avete riscontrato

Adoperate questa tabella per formulare ipotesi e confrontatele poi con misurazioni e log di sistema.
Spesso più vincoli possono verificarsi in contemporanea. Le opzioni per Spine non risultano verificate in questo contesto.

| Riscontro | Causa | Intervento consigliato |
|---|---|---|
| Avviso di launcher disallineato ma poller rapido | Ritardo di pianificazione, sforamento precedente o blocco del server | Ispezionare la cronologia degli avvii e lo stato dei processi |
| Tempo di esecuzione costante, un dispositivo sempre in ritardo | Risposte lente, script complessi o carico concentrato | Cronometrare i metodi di input e verificare timeout e tentativi |
| Tempo di esecuzione legato al numero di host, CPU satura | Carico eccessivo sul processore del collector | Valutare se l'aumento dei processi apporta benefici; ripensare la collocazione dei collector |
| Tempo di esecuzione legato al numero di host, CPU scarica | Attese su rete, script o accessi al database | Misurare i colli di bottiglia prima di incrementare la concorrenza |
| Campioni mancanti distribuiti a rotazione su più apparati | Connessioni sature, timeout o problemi di raccolta | Analizzare errori nei log, metriche di connessione e code pendenti |
| Tempo di esecuzione corretto, scritture RRD lente, disco occupato | Sottosistema di archiviazione | Valutare scritture RRD differite o dischi più veloci |
| Rallentamento generale, inclusa l'interfaccia web | Sottosistema del database | Dimensioni del buffer pool e, se necessario, risorse dell'host del database |

Due errori comuni da evitare.

**Modificare l'intervallo principale non equivale a modificare il passo di ogni origine dati.**
Allineate profili, frequenze degli elementi memorizzati e definizioni di heartbeat e passo dei file RRD.
Ricostruire la cache non modifica la struttura interna dei file RRD già presenti. Consultate
[Conservazione dei dati](/it/guides/manage-data-retention/) e
[Tempo e intervalli](/it/concepts/time-and-intervals/).

**Un intervallo più rapido moltiplica l'intero carico.** Passare da 300 secondi a 60 non rende
l'operazione cinque volte più leggera. Gli elementi impostati per la cadenza più frequente verranno
letti più spesso; le risorse con cadenze più ampie non devono girare a ogni ciclo di base. Misurate
il carico reale anziché supporre che ogni ciclo comporti il medesimo dispendio di risorse.
