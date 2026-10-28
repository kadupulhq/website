---
title: Recuperare un RRD danneggiato
description: Come distinguere un archivio round-robin danneggiato da uno configurato male, come esaminare un file, come dump e restore lo riparano e quale storico è possibile mantenere quando il file deve essere ricostruito.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 25
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione o un percorso di
migrazione ufficialmente supportato per Kadupul. Testare queste procedure su una copia isolata
con backup prima di farvi affidamento. Consultare lo [stato del progetto](/it/project/status/).
:::

La reale corruzione di un file è un evento raro. La maggior parte dei file segnalati come corrotti è integra ma
in disaccordo con il database, oppure non può essere scritta dal poller, o ha smesso di ricevere
valori per un motivo estraneo al file. Individuate quale sia la situazione reale
prima di intervenire, poiché la riparazione adatta a un caso aggrava gli altri.

:::danger[Preservare l'originale]
**Copiare il file prima di qualsiasi procedura di riparazione descritta in questa pagina.** Eseguire il ripristino in un candidato separato
ed esaminarlo prima di sostituire il file attivo. Ridurre un archivio o eliminarne uno
cancella lo storico memorizzato. Modificare un massimo influisce sulla convalida degli input futuri; non
cancella retroattivamente i campioni già archiviati. In un file RRD non esiste una funzione automatica di annullamento.
:::

## 1. Identificare il problema

| Cosa si osserva | Significato comune | Andare a |
|---|---|---|
| Il grafico genera un errore invece di un'immagine | Il file è mancante, illeggibile o la directory non è accessibile in scrittura | Passo 2 |
| Il grafico è vuoto ma senza errori | Nessun valore utilizzabile nell'intervallo selezionato, o problema di definizione del grafico | [Risoluzione problemi dati mancanti](/it/guides/troubleshoot-missing-data/) |
| Il grafico si arresta a un momento fisso e non riprende | Poller, permessi o heartbeat | Passo 3 |
| Il grafico mostra dati ma l'andamento è cambiato senza modifiche alla configurazione | Il file e il database non concordano | Passo 4 |
| I valori conservati risultano tutti sconosciuti | Raccolta, tempistiche, limiti o configurazione dell'origine dati richiedono verifica | [Risoluzione problemi dati mancanti](/it/guides/troubleshoot-missing-data/) |
| `rrdtool` rifiuta di leggere il file | Percorso mancante, errore di accesso, formato incompatibile o danneggiamento | Passi 2 e 3, poi 5 |

Kadupul converte il primo caso in un messaggio leggibile anziché in un'immagine non valida,
distinguendo una directory non scrivibile da un file non scrivibile, e segnalando un
file assente come possibile indicazione che il poller non è ancora stato eseguito. Tale messaggio è un indizio, non una
diagnosi: anche un'eliminazione, un cambio di percorso o un ripristino incompleto possono provocarne l'assenza.

## 2. Ispezionare il file

Sono disponibili due visualizzazioni nella pagina dedicata all'origine dati, entrambe attivabili per sessione.
La visualizzazione di debug mostra il comando `rrdtool create` che Kadupul genererebbe oggi per questa origine
dati. La visualizzazione informativa è quella essenziale in questa sede: legge il file tramite
`rrdtool info`, consulta la definizione dell'origine dati dal database e mostra
le differenze. Laddove una discrepanza possa essere risolta senza ricostruzione, stampa il comando
`rrdtool tune` o `rrdtool resize` corrispondente come testo da eseguire
manualmente, anziché eseguirlo direttamente.

Da shell, il medesimo primo passaggio:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

L'intestazione indica lo step, l'orario dell'ultimo aggiornamento, ogni nome di origine dati con relativo tipo,
heartbeat, minimo e massimo, e ogni archivio con relativa funzione di consolidamento, conteggio righe
e risoluzione. Se questo comando restituisce errore, conservate il messaggio e verificate percorso,
permessi e compatibilità di RRDtool prima di diagnosticare una corruzione. Un comando `info`
riuscito legge i metadati; esaminate anche l'output di `fetch` e provate un dump per controllare lo storico.

## 3. Verificare prima le cause meccaniche

| Controllo | Perché precede la riparazione |
|---|---|
| Proprietà e permessi del file | Un file creato da root durante una manutenzione diventa non scrivibile dal poller da quell'istante in poi |
| Proprietà e permessi della directory | Il poller non può creare un file sostitutivo in una directory in cui non può scrivere |
| Spazio libero e inode | Un filesystem saturo genera scritture incomplete che appaiono come corruzioni |
| Presenza di un secondo processo di scrittura | Aggiornamenti concorrenti o disordinati possono fallire o invalidare un'istantanea di manutenzione; verificare i registri |

Eseguite le operazioni di manutenzione con l'account proprietario dell'RRD e preservatene permessi,
proprietario e gruppo. Arrestate tutti i processi di scrittura prima di copiare o sostituire file, compresi
i raccoglitori remoti, le attività pianificate e la manutenzione manuale. Scaricate le scritture in sospeso solo dopo
l'arresto dei rispettivi generatori. Semplici comandi di shell non acquisiscono i blocchi di archiviazione di Kadupul.
Consultare i [requisiti di archiviazione](/it/reference/requirements/) e la procedura di arresto in
[Backup e ripristino](/it/guides/back-up-and-restore/).

## 4. Leggere cosa ha già rilevato il controllore

Kadupul può controllare periodicamente le origini dati collegate a grafici sui dispositivi abilitati e
registrare quanto rilevato; non si tratta di un censimento completo di ogni file sul disco. È disattivato
per impostazione predefinita. L'interfaccia indica dove attivarlo: Configuration -> Settings -> Data.

| Impostazione | Predefinito | Effetto |
|---|---|---|
| Enable RRDfile Check | off | Nessun controllo viene effettuato finché non viene abilitato |
| Check Frequency | 4 hours | Offre anche 1 hour, 24 hours o l'esecuzione dopo ogni ciclo boost |
| Number of RRDfile Check Processes | 1 process | Ripartisce l'elenco dei file tra processi paralleli |
| RRDChecker Timeout | 1 hour | L'esecuzione viene interrotta se supera questa soglia |

I risultati si accumulano in un elenco contenente dispositivo, origine dati, identificatore interno,
messaggio e data. È possibile filtrare per anzianità, cercare nel testo e
svuotare l'elenco dopo essere intervenuti.

I messaggi che possono essere registrati e il loro significato:

| Messaggio | Significato |
|---|---|
| RRDfile does not exist | Il file non è mai stato creato, è stato spostato o cancellato, oppure il percorso configurato è cambiato |
| RRDfile is not writable | L'utente del poller non ha i permessi di scrittura sul file |
| RRDfile modify time older than hour | Nessun dato è stato scritto da almeno un'ora |
| Last update value in RRDfile is older than 1 hour | Il timestamp di ultimo aggiornamento del file stesso è obsoleto, evidenza più solida rispetto alla data di modifica |
| The RRDfile step does not match the Data Source Profile step | Il file è stato generato con un intervallo differente |
| There are more, or less, Data Sources in the database than in the RRDfile | Il modello ha acquisito o perso campi dopo la creazione del file |
| The Data Source '...' exists in RRDfile, but not in database | Indica il campo, dal punto di vista del file |
| Data Source name '...' exists in the Database, but not in RRDfile | Indica il campo che il poller cerca di scrivere ma che non trova spazio nel file |
| The RRDfile Minimal Heart... is lower than polling interval | Segnala un heartbeat minore o uguale all'intervallo di polling; i campioni tardivi possono diventare sconosciuti |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | L'heartbeat del file è inferiore a quello del profilo; questo controllo non segnala valori maggiori |
| Stale values for last 24 hours, or last hour | Ogni campione riletto in quella finestra è risultato sconosciuto |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Errore parziale nella raccolta dati |
| No data returned, maybe corrupted Data Source | Un'interrogazione fetch sul file non ha restituito alcun dato |

Il controllo sincronizza automaticamente il valore di step e l'heartbeat registrati nel database per allinearli al profilo
durante l'esecuzione, risolvendo disallineamenti tra profilo e righe dell'origine dati senza toccare
il file fisico. Le discrepanze numeriche tra file e database vengono segnalate anziché
corrette, poiché ciascuna delle due parti potrebbe essere quella errata.

## 5. Dump, modifica, ripristino

RRDtool è in grado di serializzare un file leggibile in formato XML e ricostruire un candidato a partire da esso.
Ciò può essere d'aiuto per discrepanze strutturali note, ma non ricostruisce campioni perduti
né garantisce che un file danneggiato possa essere analizzato. Anche Kadupul utilizza helper dump/restore
per modifiche strutturali. L'helper di ripristino locale crea un file temporaneo affiancato e
lo rinomina sulla destinazione in caso di esito positivo; questo non sostituisce un backup.

A processi di scrittura fermi, eseguite questa procedura come proprietario dell'RRD. Sostituite il percorso di esempio con il
percorso reale dell'origine dati. La directory di lavoro privata viene creata accanto alla sorgente affinché
il candidato risieda sul medesimo filesystem:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Selezionate un intervallo di fetch e una funzione di consolidamento che contengano dati storici noti;
l'ultima ora è soltanto un esempio. Confrontate nomi delle origini dati di origine e candidato,
step, archivi, timestamp dell'ultimo aggiornamento e valori dei campioni. Un dump/restore non modificato
può alterare il layout binario; confrontate quindi i valori anziché richiedere hash di file identici.

Conservate la copia originale. Solo dopo la convalida, ripristinate i permessi,
il proprietario e il gruppo corretti del candidato e rinominatelo sul percorso attivo a scrittori ancora fermi. Verificate
che l'account del poller possa leggerlo e aggiornarlo prima di riprendere la raccolta. Questo esempio
si arresta prima dell'installazione per evitare che un candidato leggibile ma errato venga messo in produzione.

L'XML e il candidato richiedono spazio su disco supplementare. Un dump non riuscito può lasciare un
XML parziale; non ripristinatelo. Verificate accesso, spazio disponibile e l'errore riportato. Se l'originale
non può essere estratto dopo tali controlli, ripristinate un backup funzionante. L'opzione
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) di RRDtool consente di sovrascrivere
la destinazione; l'esempio a fasi utilizza deliberatamente una nuova destinazione.

## 6. Cosa sopravvive e cosa no

| Danno | Storico recuperabile |
|---|---|
| File non scrivibile, per il resto integro | Lo storico memorizzato sopravvive. Gli aggiornamenti persi non vengono recuperati semplicemente correggendo i permessi |
| Heartbeat, minimo o massimo errati | Sì. `rrdtool tune` modifica l'intestazione senza toccare i valori archiviati |
| Step errato | Richiede una conversione esplicita e convalidata; la sola modifica del profilo nel database non converte il file |
| Origine dati assente nel file | I campi esistenti conservano il proprio storico. Il nuovo campo inizia vuoto |
| Archivio cancellato o mai creato | No. Una risoluzione mai memorizzata non può essere ricostruita |
| Righe di archivio ridotte da un ridimensionamento | No. Le righe eliminate scompaiono nell'istante in cui il comando viene eseguito |
| File troncato, il dump fallisce | No. Ripristinare da backup |
| Intestazione integra, coda troncata | Non date per scontato che un'intestazione leggibile garantisca un dump completo; utilizzate un backup verificato se il dump fallisce |

La modifica dell'intervallo del poller o il trasferimento di un'origine dati a un altro profilo di conservazione
non rimodella automaticamente i file esistenti. RRDtool mette a disposizione anche operazioni
[`tune` strutturali](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), inclusa un'opzione
per lo step; verificate il comportamento di conversione per la versione installata e lo schema
degli archivi anziché dare per scontata una modifica senza perdite. Consultare
[Origini dati e archivi](/it/concepts/data-sources-and-rras/) e
[Gestire la conservazione dei dati](/it/guides/manage-data-retention/). Incrementare un valore massimo con `tune`
è sicuro; ridurlo registrerà qualsiasi valore successivo al di sopra della nuova soglia come sconosciuto.

## 7. Ricostruire conservando il possibile

Kadupul include un'utilità di giunzione (splice) in grado di popolare un nuovo file partendo da uno precedente
leggibile. Considerate il risultato come una proposta preliminare: può colmare buchi e sostituire zeri legittimi,
quindi non rappresenta una copia esatta dello storico misurato. Eseguitela dalla radice dell'applicazione sul
raccoglitore principale, utilizzando copie isolate in directory affidabili con permessi di scrittura.

Create `new.rrd` con la struttura desiderata nella directory privata `$work`
del passo 5, quindi visualizzate l'anteprima dell'unione:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Entrambi i file di input devono già esistere e superare le verifiche di scrittura dell'utilità.
Il nuovo file fornisce la struttura. Senza `--finrrd`, l'output è pari al percorso del nuovo file
con estensione `.new`; utilizzate un percorso di output esplicito per evitare di sovrascrivere un
candidato precedente. `--dryrun` elabora e unisce utilizzando XML temporaneo e, ove disponibile,
storage SQLite, ma omette il ripristino RRD finale. Non dimostra che il ripristino
finale avrà successo. Rimuovete `--dryrun` per produrre il candidato separato.
Evitate `--owner` durante le anteprime ed eseguite con l'account di servizio richiesto; verificate
l'effettiva proprietà dell'output prima dell'installazione.

:::caution[La giunzione tratta lo zero come una lacuna]
Il processo scorre il nuovo file e, per ogni posizione contenente un valore sconosciuto **o uno zero**, cerca
il valore corrispondente più vicino nel vecchio file inserendo quello. Uno zero autentico nel
nuovo file viene pertanto sostituito da dati precedenti. Per qualsiasi metrica che registri legittimamente zero
per lunghi periodi (una porta inattiva, una coda che si svuota, un contatore fermo), verificate attentamente il
risultato prima di metterlo in produzione. I valori sconosciuti del vecchio file vengono anch'essi colmati mediante
i valori precedenti, con il rischio che l'output unito inventi continuità su lacune reali.
:::

Dopo la giunzione, posizionate il file dove l'origine dati lo attende, con i permessi necessari al
poller, e verificate che il grafico venga tracciato.

## 8. Riempire i buchi e perché rifletterci due volte

| Utilità | Cosa scrive |
|---|---|
| `cli/batchgapfix.php` | Riempie un intervallo di date su più dispositivi in parallelo, utilizzando l'ultimo valore noto o una media |
| `cli/float_rrdfiles.php` | Sposta un intervallo nei grafici selezionati tramite lo stesso flusso di dump e restore |

Entrambe inventano misurazioni. Nulla è stato raccolto a quei timestamp e successivamente
nulla nel file distingue i valori inventati da quelli autentici. Utilizzateli solo quando
siete certi che l'interruzione non fosse un'anomalia di servizio: un poller fermato per manutenzione, una finestra di migrazione.
Mai su metriche utilizzate per calcoli di capacità o fatturazione. La stessa cautela si applica alla
[rimozione dei picchi](/it/guides/remove-spikes-from-data/).

## 9. Debug automatizzato di una singola origine dati

Per un'origine dati dal comportamento anomalo, Kadupul può eseguire un controllo di debug nei successivi
cicli di polling e fornire un verdetto: se il file esiste, se esso e la sua
directory sono accessibili in scrittura, quale account ne è proprietario rispetto all'account con cui gira il poller,
se l'origine dati è attiva, se il file corrisponde alla definizione memorizzata,
se l'ultimo aggiornamento si è spostato dopo un ciclo e se i valori erano validi. La sua
capacità di riparazione è circoscritta. Applica i suggerimenti di `rrdtool tune` prodotti dal
confronto e nient'altro, declinando l'operazione e registrando la motivazione se l'elenco è vuoto o il file
non è scrivibile. Non ricrea file, non aggiunge origini dati né modifica archivi.

## 10. L'eliminazione è un rischio a parte

Kadupul monitora i file di archivio la cui origine dati non esiste più e propone di
rimuoverli. Può anche essere configurato per agire automaticamente quando un'origine dati viene eliminata, con due
metodi: eliminazione diretta o spostamento in una directory di archivio.

:::danger[L'eliminazione è definitiva]
Il metodo di eliminazione cancella fisicamente il file dal disco. Non esiste un cestino e i dati
non sono presenti nel database. Se non avete l'assoluta certezza che ciascun file elencato sia realmente orfano,
impostate il metodo su archivia, che sposta i file in una cartella da voi indicata, consentendovi di
ripulire tale cartella manualmente in seguito.
:::

Un file può apparire orfano senza esserlo realmente. Un'origine dati spostata su un nuovo percorso, un
ripristino completato a metà o un dispositivo ricreato sotto un nuovo id lasciano file a cui
nessun elemento fa più riferimento. Verificate l'elenco confrontandolo con i vostri registri delle modifiche prima di procedere.

## Modalità di errore

| Sintomo | Causa |
|---|---|
| Riparazione riuscita, grafico ancora vuoto | Verificate permessi di accesso, intervallo temporale selezionato, raccolta dati e definizione del grafico |
| `rrdtool dump` restituisce errore sul file | Verificate percorso, permessi, archiviazione e formato prima di presumere un danneggiamento |
| Tune applicato, ma nulla è cambiato | Le modifiche all'intestazione non colmano retroattivamente campioni storici sconosciuti; verificate le definizioni nel file e nel database |
| Sottili lacune ovunque dopo una variazione di intervallo | I file contengono ancora il vecchio step e il vecchio heartbeat |
| Il file giuntato riporta dati vecchi dove il nuovo leggeva zero | Comportamento previsto. La giunzione colma gli zeri così come i valori sconosciuti |
| L'elenco del controllore cresce senza diminuire mai | Le rilevazioni restano registrate finché non vengono cancellate; risolvere la causa non le azzera |

Eseguite il backup congiunto della directory di archiviazione e del database secondo una pianificazione unificata e verificate
il ripristino. Il recupero è limitato a quanto contenuto nel backup al momento della sua esecuzione. Consultare
[Backup e ripristino](/it/guides/back-up-and-restore/).
