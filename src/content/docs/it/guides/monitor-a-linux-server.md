---
title: Monitorare un server Linux
description: Creazione di grafici di CPU, memoria, disco e carico su un host Linux tramite net-snmp, cosa deve esporre snmpd e come utilizzare uno script quando SNMP non è sufficiente.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 3
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

Un host Linux con net-snmp offre la maggior parte delle metriche senza codice aggiuntivo. Il compito consiste nell'indurre `snmpd` a esporre i sottoalberi corretti e nel sapere quale delle due MIB di disco sovrapposte si sta osservando.

## Cosa deve esporre snmpd

Kadupul interroga quattro aree. Concedere all'identità di monitoraggio i sottoalberi richiesti per i grafici selezionati; non tutte le distribuzioni necessitano di ogni sottoalbero.

| Area | Sottoalbero | Fornisce |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrizione, uptime, contatto, nome, posizione |
| Interfacce | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Traffico, errori, stato |
| Risorse host | `.1.3.6.1.2.1.25` | Processi, utenti connessi, archiviazione, processori |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Medie di carico, memoria, tempo CPU, I/O disco, partizioni dichiarate |

Diverse distribuzioni forniscono un file `snmpd.conf` predefinito che concede una vista limitata al sottoalbero di sistema. Il dispositivo risponderà, segnalerà una descrizione di sistema e non raccoglierà nulla. Questa combinazione è il primo errore più comune su un host Linux e somiglia esattamente a un problema di template.

Verificare le aree richieste dall'host del poller utilizzando la stessa identità SNMP configurata sul dispositivo. Questi esempi utilizzano una community illustrativa; sostituirla con il valore configurato. Gli OID numerici evitano la necessità di definizioni simboliche MIB locali.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Se funziona solo il primo comando, esaminare la risposta esatta: una vista limitata, un modulo agente non disponibile, un contesto SNMP diverso o una tabella vuota possono spiegare l'esito. Verificare la configurazione dell'agente e l'accesso prima di modificare il template di Kadupul.

## Aggiungere il dispositivo

Il pacchetto fornito `install/templates/NetSNMP_Device.xml.gz` contiene il template del dispositivo Net-SNMP e le relative dipendenze. Importarlo se il template manca, quindi selezionarlo quando si aggiunge il dispositivo. Confermare gli indici di query e creare esplicitamente i grafici desiderati; selezionare un template di dispositivo non prova che la raccolta funzioni. Vedere [Importare template](/it/guides/import-and-export-templates/) e [Il tuo primo grafico](/it/start/first-graph/).

## Cosa si ottiene senza query di dati

Questi template di dati con OID fissi sono inclusi nel pacchetto. Un grafico può combinarne diversi; la disponibilità dipende dall'agente di destinazione. Non richiedono alcun rilevamento degli indici.

| Grafico | OID | Memorizzato come |
|---|---|---|
| Media di carico 1 minuto | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Media di carico 5 minuti | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Media di carico 15 minuti | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Memoria totale | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Memoria libera | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Memoria buffer | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Memoria cache | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU utente | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU sistema | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU inattiva | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Interrupt | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Cambi di contesto | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Processi | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Utenti connessi | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Gli oggetti memoria sono espressi in kilobyte. Il grafico della memoria fornito applica una conversione in modo che l'asse mostri i byte. Se si crea il proprio grafico da questi OID, tale conversione è a proprio carico.

Gli oggetti CPU elencati sono percentuali obsolete, non contatori cumulativi del tempo CPU. Non presumere che questi tre coprano da soli ogni stato del processore. Net-SNMP li depreca a favore dei contatori non elaborati; i contatori non elaborati richiedono calcoli appropriati di frequenza e percentuale, non un semplice inserimento in un template gauge. Vedere la [MIB UCD-SNMP](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Cosa richiede una query di dati

| Query | Rileva | Supportata da |
|---|---|---|
| SNMP - Ottieni punti di montaggio | Tutto ciò che l'agente chiama archiviazione | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Ottieni partizioni monitorate | Solo le partizioni dichiarate in `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Ottieni informazioni processore | Una voce per CPU | Carico processore risorse host |
| Net-SNMP - Ottieni I/O dispositivo | Dispositivi a blocchi | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Statistiche interfaccia | Interfacce di rete | `IF-MIB` |

### Quale query di disco utilizzare

Non si tratta di due viste degli stessi dati.

La query delle risorse dell'host esamina tutto ciò che l'agente segnala come archiviazione. Sulla maggior parte degli host Linux, ciò raggruppa la memoria fisica, lo swap, i montaggi tmpfs e i veri filesystem in un unico elenco. Le dimensioni sono restituite in unità di allocazione e la query legge la dimensione dell'unità di allocazione come campo separato affinché il grafico possa moltiplicare. Si ottiene tutto senza configurare nulla, ma anche un lungo elenco di voci non desiderate.

La query net-snmp legge la tabella del disco UCD, popolata da direttive `disk` o `includeAllDisks`. Scegliere partizioni esplicite o un rilevamento ampio; si tratta di criteri diversi.

```
disk /      10%
disk /var   10%
```

In alternativa, `includeAllDisks 10%` riempie i dischi trovati all'avvio dell'agente. Il valore del 10% configura una soglia di spazio libero; non è un filtro di selezione e non configura da solo gli avvisi di Kadupul. Ricaricare o riavviare l'agente, quindi verificare gli indici. Una query vuota può anche indicare problemi di accesso o di disponibilità del modulo. Vedere la [configurazione di snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Preferire la query delle risorse host quando si desidera la completezza e si è disposti a filtrare. Preferire la query net-snmp con voci esplicite di `disk` quando si desidera un elenco mirato. `includeAllDisks` amplia tale elenco; ricontrollare gli indici dopo i riavvii dell'agente.

### Interfacce

La query dei dati dell'interfaccia su un server si comporta esattamente come su uno switch, con un'avvertenza: `ifDescr` sotto Linux è il nome dell'interfaccia del kernel, che può cambiare dopo un riavvio o un aggiornamento del driver. Vedere [Monitorare uno switch](/it/guides/monitor-a-switch/) per i dettagli sulla scelta dell'indice.

## Quando SNMP non è sufficiente

Alcune metriche non dispongono di una MIB utilizzabile. La profondità di una coda, un contatore dell'applicazione o un numero in un file richiedono un input da script.

Due elementi determinano il modo in cui si scrive lo script.

**Lo script viene eseguito sulla macchina su cui è in esecuzione il poller, non sull'host monitorato.** Raggiungere la destinazione è compito dello script: SSH, una chiamata HTTP, un agente o qualsiasi meccanismo già implementato.

**Il poller legge lo standard output e nient'altro.** Lo stato di uscita non viene valutato.

Il contratto di output:

| Output | Significato |
|---|---|
| `42` o `3.7` | Un singolo valore per una singola origine dati |
| `U` | Nessun valore per questo ciclo, registrato come sconosciuto |
| `in:1420 out:980` | Più valori, uno per origine dati |

Per il formato a valori multipli, le coppie sono separate da spazi singoli e il nome è separato dal valore da due punti. Il parser conta i delimitatori rispetto agli spazi vuoti, quindi spazi interni aggiuntivi possono far fallire la convalida. Il poller PHP rimuove gli spazi finali. Emettere il formato canonico con spazi singoli e reindirizzare la diagnostica lontano da stdout.

I nomi interni delle origini dati RRD accettati dall'editor di template corrispondono a `[a-zA-Z0-9_]{1,19}`; i trattini non sono accettati. Le etichette di output dello script devono corrispondere ai nomi dei campi di input dei dati ed essere mappate agli elementi interni previsti. L'intera riga di output è archiviata in una colonna di 512 caratteri. Vedere [Script di raccolta](/it/guides/write-a-data-collection-script/) per il contratto verificato del poller PHP.

Restituire `U` anziché `0` quando non è possibile misurare un valore. Zero è una misurazione e verrà rappresentato come tale. Vedere [Origini dati e RRA](/it/concepts/data-sources-and-rras/) per comprendere il motivo per cui vengono tenuti separati.

### Server di script

Uno script semplice viene eseguito una volta per origine dati e per intervallo. Per uno script scritto in PHP, il formato del server di script chiama una funzione in un processo PHP separato e persistente, riducendo l'overhead di avvio dell'interprete.

### La trappola della whitelist

Quando si utilizza un file whitelist per l'immissione dei dati, il poller confronta la stringa di comando di ciascun input con quella registrata. Una stringa di comando modificata senza rigenerare la whitelist cessa di creare voci nella cache del poller e l'origine dati si interrompe senza errori sul grafico. Il log lo segnala, l'interfaccia utente no.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Sostituire `42` con l'ID del metodo di immissione dati controllato, non con l'ID di un dispositivo. Un aggiornamento senza `--id` accetta le stringhe di comando correnti nell'intero inventario. Verificare le modifiche in anticipo. Dopo l'aggiornamento, verificare l'abilitazione dell'origine e le voci effettive nella cache del poller.

## Modalità di errore

| Sintomo | Causa comune |
|---|---|
| Descrizione di sistema letta, nient'altro raccolto | Vista di `snmpd` limitata al sottoalbero di sistema |
| La query delle partizioni net-snmp non trova indici | Nessuna riga `disk` o `includeAllDisks` in `snmpd.conf` |
| Le partizioni delle risorse host includono RAM e tmpfs | Previsto; l'agente le segnala come archiviazione |
| Il grafico della memoria è sfalsato di un fattore 1024 | Costruzione basata su OID non elaborati senza conversione |
| Lo script restituisce un valore da riga di comando, il poller registra sconosciuto | Mancata corrispondenza output/mappatura, errori delimitatori interni o nome interno non valido |
| Lo script funziona manualmente ma fallisce tramite poller | Viene eseguito con l'utente del poller, il suo ambiente e i suoi permessi |
