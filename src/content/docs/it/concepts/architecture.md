---
title: Architettura
description: I quattro componenti in movimento e quale sia solitamente responsabile dei problemi.
sidebar:
  order: 1
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

:::caution[Comportamento ereditato del proxy RRDtool]
La distribuzione del proxy RRDtool non è supportata in Kadupul. Usate l'archiviazione locale RRDtool
(`storage_location = 0`). Le impostazioni del proxy, le descrizioni dei protocolli e i flussi di lavoro
in questa pagina documentano un comportamento ereditato, non un percorso di distribuzione o di migrazione
supportato. Consultate [Proxy RRDtool](/it/reference/rrdproxy/).
:::

L'applicazione web di Kadupul, il database, la raccolta pianificata e l'archiviazione RRD svolgono
compiti diversi, ma i loro percorsi di esecuzione si sovrappongono. Sapere quale operazione non è riuscita
aiuta a circoscrivere l'indagine: un'interfaccia funzionante non prova che la raccolta funzioni.

**L'interfaccia web** è un'applicazione PHP. Gestisce la configurazione e visualizza o
fornisce grafici memorizzati nella cache. Alcune azioni web avviano anche la raccolta, come le richieste
di grafici in tempo reale, e le normali richieste di grafici possono attivare aggiornamenti RRD in sospeso.

**Il database** contiene la configurazione, i permessi, lo stato operativo, la cache del poller
e le code di misurazione. I valori raccolti possono rimanere lì in attesa di una scrittura RRD
o di un nuovo tentativo: non è soltanto un archivio di configurazione.

**Il poller** coordina il lavoro pianificato e i processi figli di raccolta. I risultati passano
attraverso le code del database prima che il writer normale o differito aggiorni i file RRD.

**I file RRD** conservano serie storiche delimitate. Una sorgente dati contiene normalmente un file RRD
con i propri campi: la creazione di grafici può riutilizzare sorgenti e la creazione di metadati
non garantisce che il file esista già.

## I confini

| Confine | Cosa lo attraversa | Mezzo di trasporto |
|---|---|---|
| Da interfaccia a database | Configurazione, sessioni, autorizzazione, lavoro memorizzato nella cache e dati operativi | SQL; il database può essere remoto |
| Da interfaccia a file | Letture dei grafici, immagini memorizzate nella cache e aggiornamenti o creazione RRD su richiesta idonei | Filesystem e RRDtool |
| Da poller a database | Elenchi di lavoro, valori raccolti, code trattenute, stato e conti alla rovescia | SQL |
| Da raccolta a dispositivi | SNMP, script di raccolta e controlli di raggiungibilità | Comandi di rete o locali; è possibile anche la raccolta attivata dal web |
| Da writer a file | Campioni raggruppati, eventualmente più timestamp per aggiornamento | Comandi RRDtool e pipe con riscontro |
| Da server database a file RRD | Nessun aggiornamento RRD diretto nel normale percorso applicativo | Il codice di scrittura dell'applicazione coordina i due archivi |

Le righe del database associano una sorgente dati a un dispositivo e al percorso file configurato.
I file RRDtool descrivono serie e archivi: non sostituiscono la mappatura dell'applicazione.
Il traffico di rete non si limita al polling dei dispositivi: anche le connessioni al database,
i raccoglitori remoti e altre integrazioni configurate possono attraversare host diversi.

Eseguite il backup dello stato del database, dei campioni in sospeso e dei file RRD in modo coerente.
Un ripristino del solo database non ripristina i contenuti storici RRD e un ripristino dei soli file
omette la configurazione e i campioni non scaricati. Spostare i file senza riconciliare i percorsi
può causare errori di file mancanti o scritture trattenute: non si tratta di un guasto silenzioso
garantito della raccolta. Consultate [Backup e ripristino](/it/guides/back-up-and-restore/) e
[Migrazione su nuovo hardware](/it/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Perché la cronologia a lungo termine usa i file RRD

La cronologia a lungo termine dei grafici è memorizzata nei file RRD, ma le code di misurazione
risiedono nel database. La normale coda in transito è InnoDB in questa revisione, e le scritture differite
trattengono i campioni nelle tabelle Boost. Scritture non riuscite o consegne remote ritardate
possono far crescere queste code. Consultate [Scritture ad alto volume](/it/concepts/high-volume-writes/).

Un file RRD alloca un numero definito di righe alle risoluzioni selezionate. I normali aggiornamenti
riutilizzano quello spazio anziché accodare la cronologia all'infinito. La dimensione del file è delimitata
per una struttura invariata: l'aggiunta di sorgenti dati, la modifica delle strutture, la conservazione di copie
di ripristino o l'accumulo di code aumentano comunque i requisiti complessivi di archiviazione.

Il compromesso è una conservazione scelta in anticipo. Una volta che la cronologia a grana fine è scaduta
o è stata consolidata, una successiva modifica della struttura non può ricreare i dettagli scartati. Consultate
[Sorgenti dati e archivi round-robin](/it/concepts/data-sources-and-rras/).

La configurazione e lo stato operativo usano il database perché l'applicazione necessita di aggiornamenti
condivisi e query relazionali. Questo non significa che ogni relazione sia imposta da una chiave esterna
del database o che un archivio di righe cresca necessariamente all'infinito: descrive la divisione delle
responsabilità di questa applicazione.

## Due percorsi che condividono due parti

Una normale richiesta di pagina o di grafico segue in genere questo percorso:

1. Un browser invia una richiesta; PHP carica la configurazione e si connette al database.
2. La richiesta applica l'autenticazione e l'autorizzazione di ambito/oggetto pertinente.
3. Le azioni della console leggono o aggiornano la configurazione e possono avviare ulteriore lavoro.
4. Una richiesta di grafico può controllare i campioni Boost in sospeso e una cache di immagini, oppure comporre
   un comando RRDtool e leggere i file configurati. Consultate
   [Come vengono disegnati i grafici](/it/concepts/how-graphs-are-drawn/).
5. Le richieste di grafici in tempo reale possono avviare il raccoglitore in tempo reale e usare dati
   temporanei separati. Un grafico piatto da solo non dimostra che il file sia vuoto o che la raccolta
   e il rendering siano riusciti.

Un ciclo di polling pianificato segue in genere questo percorso:

1. Il pianificatore avvia il poller, che verifica lo stato di abilitazione, i tempi e l'archiviazione.
2. Seleziona il lavoro dovuto dalla cache del poller e avvia i processi figli di raccolta.
3. I figli interrogano i dispositivi o eseguono script di raccolta e collocano i risultati nel database.
4. Il writer appropriato elabora i campioni raggruppati, usando code differite quando configurate
   e conservando i fallimenti recuperabili.
5. Lo stato operativo e lo stato di pianificazione vengono aggiornati nel database.

Consultate [Ciclo di vita del poller](/it/reference/poller-lifecycle/) per l'ordinamento e la gestione degli errori.
Questi percorsi condividono risorse di database e archiviazione ed entrano in contesa per esse. Riavviare
il server web non ripara un poller pianificato separatamente, ma le richieste web possono partecipare
alla raccolta e alla scrittura: diagnosticate il processo che sta effettivamente fallendo.

## Cosa viene eseguito e con quale utente

| Processo | Eseguito come | Avviato da |
|---|---|---|
| Applicazione web PHP | Account del server web o del pool PHP-FPM | Server web |
| Poller pianificato | Account configurato del pianificatore | cron, Utilità di pianificazione o servizio configurato |
| RRDtool | Normalmente eredita l'account del processo chiamante | Percorso web, poller o manutenzione |
| Script di raccolta | Normalmente ereditano l'account del rispettivo raccoglitore | Raccolta pianificata o attivata dal web |

Tutti gli account writer partecipanti necessitano dell'accesso appropriato all'archiviazione configurata.
La normale creazione della sorgente dati scrive i metadati: il file RRD può essere creato successivamente,
quando un writer ne ha bisogno. Un file mancante può indicare che la raccolta non ha ancora raggiunto questo
punto, oltre a un errore di percorso, di attendibilità, di permessi o di creazione.

Alcuni percorsi di creazione eseguiti come root tentano di applicare proprietario e gruppo della directory RRA.
Questi tentativi possono fallire e registrare errori: non sostituiscono la corretta configurazione degli account
di servizio. La proprietà non-root segue le regole del sistema operativo, inclusa l'ereditarietà del gruppo
di directory e le ACL. Convalidate i permessi di archiviazione e le impostazioni numeriche di UID/GID affidabili
sotto ogni account writer del web e del poller. Consultate [Aggiornare in sicurezza](/it/guides/upgrade-safely/).

L'implementazione PHP ICMP esaminata richiama l'utilità ping del sistema operativo. La sua capacità di inviare
sonde dipende da tale utilità e dai criteri del sistema operativo: la presenza di helper storici con UID efficace
non significa che ogni sonda ICMP elevi PHP a root. Non eseguite l'applicazione come root solo per abilitare ping.
Verificate il comando effettivo, l'account e l'output di errore: i controlli TCP o UDP hanno una semantica di
raggiungibilità diversa.

## L'elenco di lavoro è precalcolato

La cache del poller memorizza il lavoro di raccolta risolto, così ogni esecuzione non deve ricavare ogni
comando dalle relazioni dei modelli. Le operazioni di configurazione possono ricostruire le voci interessate:
sono disponibili strumenti di ricostruzione espliciti quando necessario.

Le modifiche rappresentate nei campi memorizzati nella cache devono raggiungere tali voci prima che la raccolta
le utilizzi. Altre impostazioni vengono lette separatamente, quindi non tutte le modifiche di configurazione
richiedono una ricostruzione manuale della cache. Esaminate il contenuto della cache, gli errori di raccolta e
lo stato di replica remota anziché presumere un'unica causa. Consultate
[La cache del poller](/it/concepts/the-poller-cache/) e
[Raccolta dati remota](/it/concepts/remote-data-collection/).

## Dove solitamente si verificano i problemi

| Sintomo | Verifiche utili |
|---|---|
| L'interfaccia funziona, i grafici sono piatti | Esecuzione del pianificatore, errori di raccolta, code, freschezza dei campioni e finestra del grafico |
| Il poller viene eseguito, i file non avanzano | Riscontro/errori del writer, attendibilità e permessi di archiviazione, backlog differito |
| Una sola sorgente dati è piatta | Risposta del dispositivo, riga della cache, mappatura dei file, campioni sconosciuti ed espressioni grafiche |
| Una modifica di configurazione sembra inefficace | Esito del salvataggio, override dei modelli, voci della cache interessate e replica |
| Lacune regolari | Tempistiche, heartbeat, timeout, disponibilità del dispositivo ed errori di scrittura |
| Forma imprevista del grafico | Comando generato, scelte CDEF/CF, dati effettivi del file, cache delle immagini e mappatura |
| La cronologia delle porte appare collegata a un'altra interfaccia | Identità delle query, rinumerazione e risultati della reindicizzazione |
| L'account vede la console ma nessun grafico | Ambito della pagina dei grafici, autorizzazione degli oggetti e identità del grafico richiesto |
| I raccoglitori differiscono | Assegnazione, configurazione replicata, override locali e stato di connessione |
| Tutto è lento | Attese del database, contesa di writer/archiviazione, tempo di esecuzione del raccoglitore e carico web |
| I metadati della sorgente dati esistono ma il file no | Prima raccolta/scrittura, percorso configurato, errori di attendibilità e creazione |

Questi sono punti di partenza, non diagnosi definitive. Seguite le prove attraverso il confine pertinente
e verificate il risultato dopo ogni modifica. Consultate
[Risolvere i problemi di dati mancanti](/it/guides/troubleshoot-missing-data/).
