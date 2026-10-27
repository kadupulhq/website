---
title: "Aggiornare in sicurezza"
description: "Simulare un aggiornamento, conservare backup allineati, verificare lo stato dello schema e dello storage e pianificare un rollback coordinato."
banner:
  content: "Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua."
sidebar:
  order: 8
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Un aggiornamento modifica tre elementi in momenti diversi e con differente reversibilità.

| Modifiche | Reversibile | In che modo |
|---|---|---|
| Codice, dipendenze e configurazione | Da una copia conservata | Ripristinare la revisione e le impostazioni corrispondenti |
| Schema del database e campioni in coda | Da un backup allineato | Ripristinare il database; non esiste una migrazione inversa automatica |
| File RRD | Da un backup allineato | Ripristinare la cronologia conservata; i campioni assenti dal backup non possono essere ricreati con il rollback |

La procedura esiste per mantenere sincronizzati questi tre elementi.

## Prima di iniziare

**Eseguite il backup completo.** Tutte e tre le parti, coerenti tra loro. Seguite
[Backup e ripristino](/it/guides/back-up-and-restore/). Arrestate tutti i processi di scrittura prima
dell'acquisizione finale e conservate il backup protetto fino all'accettazione dell'aggiornamento.

**Registrate la revisione attuale e la versione dello schema.** Includete dipendenze, modifiche locali,
plugin e configurazione. Più revisioni del codice sorgente possono riportare la stessa versione dello schema.
Provate la revisione di destinazione su una copia isolata e ripristinata.

**Verificate ciascun plugin.** Ispezionate la dichiarazione di compatibilità, il codice e le dipendenze,
quindi testate le funzionalità necessarie sulla revisione di destinazione. La sola dichiarazione di una
versione minima non garantisce la compatibilità. Consultate
[Validazione dei plugin](/it/guides/install-and-vet-plugins/).

**Verificate l'ambiente di runtime.** Versione di PHP, estensioni PHP e versione del server di database.
Verificate i [requisiti](/it/reference/requirements/) della versione di destinazione prima della distribuzione.
Non date per scontato che la CLI dello schema esegua tutti i controlli del programma di installazione web.

**Verificate che l'account del database possa modificare lo schema.** In fase di runtime l'account deve
poter leggere e scrivere all'interno del proprio database. In fase di aggiornamento deve inoltre poter
creare, modificare ed eliminare tabelle e indici. Le installazioni che hanno ristretto i permessi dopo la
configurazione iniziale scoprono questo requisito qui.

**Arrestate tutti i produttori.** Arrestate la raccolta pianificata, i raccoglitori remoti, la raccolta
attivata via web e la manutenzione manuale; attendete che le attività in corso terminino. Svuotate le
scritture differite solo dopo l'arresto dei produttori e conservate le righe di coda non confermate insieme
al backup corrispondente. Mantenete i produttori fermi durante l'intera distribuzione e la validazione
dello schema."

## Sostituire l'applicazione

Una copia per sovrapposizione presenta limiti specifici:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Senza di essa, `cp -a /path/to/new-release /path/to/kadupul` crea
`kadupul/new-release/` e lascia ciascun file della vecchia applicazione esattamente dove
si trovava. L'aggiornamento sembra essere riuscito, l'interfaccia esegue ancora il vecchio
codice e il primo segnale di problema è la migrazione dello schema che rifiuta di corrispondere
a una versione che si pensava di aver sostituito.

Una copia sopra la cartella esistente mantiene i file assenti dalla nuova struttura, compresi
i file applicativi obsoleti. Può sovrascrivere qualsiasi percorso corrispondente, quindi ispezionate
l'artefatto anziché dare per scontato che configurazione o dati siano esclusi. Preferite un albero di
preparazione verificato con dipendenze, configurazione e plugin corrispondenti. Se alternate le versioni
tramite un collegamento simbolico, convalidate il percorso RRA effettivo e l'accesso allo storage prima
dello scambio; l'attuale procedura di avvio lo ricava dalla directory dell'applicazione più `/rra`.
Il semplice scambio di un collegamento simbolico non costituisce un rollback del database.

**Verificate cosa state effettivamente eseguendo prima di procedere.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Se il comando non riporta la versione appena distribuita, fermatevi. Tutto ciò che segue presuppone
che sia distribuito il codice previsto. Confrontate inoltre la revisione del sorgente o il checksum
dell'artefatto con il record di rilascio; la sola stringa di versione non è sufficiente.

## La migrazione dello schema

Il database possiede una propria versione, distinta da quella presente nel codice. La sostituzione
del codice non la modifica.

Le pagine autenticate legacy reindirizzano al programma di installazione quando le versioni del codice
e del database non coincidono. Questa non è una protezione universale per ogni endpoint o strumento CLI,
e stringhe di versione corrispondenti non dimostrano che ogni migrazione sia stata completata. Verificate
direttamente lo stato dello schema.

Il programma di installazione e la CLI eseguono passaggi di migrazione ordinati. Prima del normale
aggiornamento dello schema, verificate la coda persistente e l'accesso allo storage dell'account di
servizio. Se una coda `poller_output` ereditata non è InnoDB, convertitela esplicitamente con i processi
di scrittura fermi e il backup conservato:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Quindi eseguite questo comando sotto ogni effettivo account web e del poller:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

I due flag sono operazioni distinte e non possono essere combinati. La conversione della coda preserva i
campioni in sospeso; non troncate le righe per superare una verifica. Risolvete le configurazioni di
proprietà e gli UID/GID numerici attendibili utilizzando i
[requisiti di archiviazione](/it/reference/requirements/). I raccoglitori remoti online normalmente
selezionano la coda principale; utilizzate `--local` solo per una verifica o conversione intenzionale
della coda locale. Una volta superati questi controlli, eseguite l'aggiornamento dello schema dalla radice
dell'applicazione:

```sh
php cli/upgrade_database.php
```

Eseguitelo con l'account di servizio configurato, con il necessario accesso al file system e i privilegi
di database richiesti. Un controllo completato con successo con l'utente root non dimostra l'accesso per
l'account di servizio. È disponibile un'opzione `--forcever` per impostare esplicitamente la versione
iniziale, concepita per rieseguire una migrazione durante i test pre-rilascio. Non fa parte di un normale
aggiornamento e utilizzarla per saltare un passaggio fallito lascerà lo schema parzialmente migrato.

Acquisite lo stato di uscita e l'output, quindi verificate la versione del database e le modifiche dello
schema richieste. L'attuale CLI può rifiutare una versione iniziale legacy sconosciuta o non supportata e
terminare comunque con codice 0; un semplice codice di uscita positivo della shell non è sufficiente. Se la
migrazione fallisce a metà percorso, mantenete i produttori fermi e ripristinate il set di backup corrispondente
anziché tentare di saltare il passaggio non riuscito.

## Cosa causa problemi ai plugin

I controlli dei plugin del programma di installazione web possono disabilitare plugin incompatibili o
mancanti. Non date per scontato che la CLI dello schema esegua gli stessi controlli sul ciclo di vita
dei plugin.

**La versione minima dichiarata è superiore alla nuova versione del core.** Disabilitato. Questo è il caso
normale ed è quello che la verifica preliminare all'aggiornamento avrebbe dovuto intercettare.

**La directory del plugin, il suo file di configurazione o il suo file di dichiarazione risulta mancante.**
Disabilitato. Rientra in questo caso un plugin i cui file sono stati rimossi mentre risultava ancora contrassegnato
come abilitato nel database.

**Il plugin non ha alcun file di dichiarazione.** Può fallire il controllo di compatibilità del programma
di installazione. Testate un pacchetto di plugin aggiornato e compatibile anziché presumere che possa essere
riabilitato senza modifiche.

Esiste un quarto caso che non costituisce un'anomalia. Una funzionalità che in precedenza era fornita come
plugin ed è stata successivamente integrata nel core viene rimossa del tutto anziché disabilitata: i suoi
hook e le voci di permesso vengono rimossi e la riga corrispondente viene cancellata. Se vedete un plugin
scomparire anziché diventare grigio, controllate i registri di migrazione e la disposizione dello specifico
plugin prima di concludere che siano disponibili funzionalità equivalenti.

Disabilitare un plugin è diverso dal disinstallarlo. Gli hook e le migrazioni dei plugin possono modificare
le proprie tabelle e permessi; conservate il codice e i dati corrispondenti dei plugin e verificate lo
specifico percorso di aggiornamento. Non promettete una conservazione universale dei dati.

## Pianificazione del rollback

Stabilite la procedura di rollback prima di iniziare, poiché la decisione varia a seconda di quanto siete avanzati.

| Punto di errore | Modalità di rollback |
|---|---|
| Codice sostituito, nessuna operazione che modifica lo stato o processo di scrittura eseguito | Ripristinare il codice precedente, le dipendenze e la configurazione dopo aver confermato che lo stato è invariato |
| Conversione della coda o migrazione avviata, compreso il fallimento parziale | Arrestare i processi di scrittura e ripristinare i backup corrispondenti di codice, configurazione, database e RRD |
| Migrazione completata, l'applicazione presenta comportamenti anomali | Arrestare i processi di scrittura e ripristinare il set di backup allineato; considerare i campioni raccolti dopo il backup |
| Solo un plugin risulta non funzionante | Mantenerlo disabilitato valutando la riparazione rispetto a un rollback coordinato in base ai criteri di accettazione |

La regola fondamentale sotto la tabella: codice e schema tornano indietro insieme o non tornano indietro affatto.
Un vecchio codice applicato a un nuovo schema non è uno stato supportato. Non fate affidamento sul controllo
della versione web per prevenire ogni operazione incompatibile.

Assegnatevi una finestra temporale definita. Decidete in anticipo quanto tempo dedicare al debug prima di
procedere al ripristino, e rispettate tale limite. Il backup perde utilità quanto più a lungo il sistema
rimane attivo in uno stato di aggiornamento parziale.

## Perché i file RRD sono la parte da non perdere per nessun motivo

Non date per scontato che distribuzione, manutenzione o ripresa della raccolta lascino gli RRD inalterati.
Eseguitene il backup insieme al database e ripristinate il set allineato in caso di rollback delle modifiche
di stato. I campioni conservati in coda potrebbero non esistere ancora in tali file. Un backup RRD verificato
può ripristinare la cronologia acquisita; un campione mancante non può essere ricostruito semplicemente
ripristinando lo schema o il codice. Consultate
[Origini dati e archivi round-robin](/it/concepts/data-sources-and-rras/) per comprendere perché nemmeno
la risoluzione al loro interno possa essere ricostruita.

Tre modi specifici in cui gli RRD vengono persi durante un aggiornamento:

**Distribuzione tramite sostituzione della directory di installazione.** La directory RRA è per impostazione
predefinita una sottodirectory dell'installazione. Rimuovere la vecchia directory ed estrarre quella nuova al
suo posto può cancellare le misurazioni conservate. Preservate la struttura RRA mediante una configurazione di
archiviazione testata prima di sostituire l'applicazione. Convalidate l'effettivo `$config['rra_path']`, i percorsi
annidati e i controlli di attendibilità dell'account di servizio; questa revisione non fornisce un'impostazione
generale del database per una radice RRA locale arbitraria.

**Distribuzione da un checkout o da un pacchetto che gestisce l'intero albero.** Stesso errore, ma
automatizzato. Verificate cosa il vostro metodo di distribuzione considera eliminabile.

**Correzione dei permessi tramite modifica ricorsiva della proprietà.** Innocua per i dati, ma può rendere
il poller incapace di scrivere, generando un sistema che visualizza perfettamente la cronologia ma non
raccoglie alcuna nuova informazione."

## Dopo l'aggiornamento

1. Esaminate l'output dell'aggiornamento, la versione del database e le modifiche dello schema richieste,
   quindi verificate che l'interfaccia si carichi correttamente. L'assenza di un reindirizzamento da sola
   non è sufficiente.
2. Completate gli aggiornamenti pianificati di codice e configurazione dei raccoglitori remoti e convalidate
   le rispettive destinazioni del database mantenendo fermi i loro produttori.
3. Ripetete i controlli di archiviazione dell'account di servizio, riavviate i raccoglitori designati e
   verificate i tempi di ultimo aggiornamento di RRD rappresentativi e i valori conservati utilizzabili.
4. Controllate il registro per la riga delle statistiche di esecuzione e confrontate il tempo trascorso con
   quello precedente. Una nuova versione può modificare il carico della raccolta.
5. Riabilitate i plugin disabilitati, uno alla volta, dopo aver installato versioni che dichiarano la
   compatibilità con il nuovo core.
6. Monitorate la profondità della coda conservata, la raccolta remota e le attività dei plugin durante la
   finestra di accettazione concordata. Conservate il backup di rollback finché questi controlli non sono
   stati superati.
