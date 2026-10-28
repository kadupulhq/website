---
title: Monitorare uno switch
description: Rilevare le porte di uno switch, creare grafici dei contatori corretti e scegliere un indice in modo che la cronologia delle porte rimanga associata alla porta corretta dopo la sostituzione di una scheda.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 2
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

Uno switch rappresenta il caso d'uso classico per le query di dati. Non si conosce in anticipo il numero di porte presenti, il conteggio può variare e ogni porta richiede la propria origine dati. Vedere [Template](/it/concepts/templates/) per comprendere come funzionano le query di dati; questa pagina riguarda la corretta configurazione.

## Prima di iniziare

Assicurarsi che il dispositivo risponda dal collettore assegnato, preferibilmente con l'utente del poller. Utilizzare le credenziali in sola lettura configurate. Gli OID numerici evitano la dipendenza dai nomi MIB installati localmente.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Utilizzare SNMP v2c o v3. I contatori di interfaccia a 64 bit sono oggetti SMIv2 e non possono essere interrogati tramite v1. Un dispositivo v1 fornirà solo i contatori a 32 bit e nient'altro.

## Scegliere un template di dispositivo

Il template di dispositivo determina quali query di dati e quali template di grafici vengono offerti quando si aggiunge il dispositivo. Kadupul eredita il set di template fornito da Cacti, che include un template generico per dispositivi SNMP e un set di template specifici dei fornitori.

Il rilevamento delle porte proviene dalla stessa origine indipendentemente dalla scelta: la query dei dati dell'interfaccia definita in `resource/snmp_queries/interface.xml`. Se nessun template corrisponde all'hardware in uso, scegliere il template generico e associare ad esso la query dell'interfaccia.

## Eseguire la query di dati

La query attraversa `ifIndex` per trovare le porte e legge `ifNumber` per sapere quante aspettarsene. Raccoglie quindi un set di campi per ciascuna porta.

| Campo | OID | Utilizzato per |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | La posizione nella tabella SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Nome breve della porta, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Descrizione più lunga |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | La descrizione dell'interfaccia configurata |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Indirizzo MAC della porta |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Velocità in bit/sec, 32 bit |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Velocità in Mbit/sec |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up o Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | Contatori di byte a 32 bit |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | Contatori di byte a 64 bit |

Eseguire la query una volta sul dispositivo. Restituirà una tabella delle porte rilevate. Leggere questa tabella prima di creare grafici, poiché costituisce la base di ogni decisione successiva.

## Scegliere i contatori a 64 bit

La query dell'interfaccia offre diversi template di grafici del traffico. I principali:

| Template grafico | Legge |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | Stessa cosa, con una linea al 95° percentile |
| In/Out Bits (64-bit, BW) | Stessa cosa, in rapporto alla velocità dell'interfaccia |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Utilizzare un template a 64 bit a meno che non vi sia una ragione specifica per non farlo. Un contatore di ottetti a 32 bit raggiunge il limite a 4294967295. Una porta gigabit a pieno carico lo riempie in circa 34 secondi. Con un intervallo di 300 secondi, il poller non può distinguere un singolo overflow da sette overflow e `COUNTER` corregge solo un singolo overflow tra due campioni. Il grafico non appare visibilmente danneggiato; mostra semplicemente valori perennemente troppo bassi.

Verificare che i contatori vengano effettivamente popolati prima di creare centinaia di grafici.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Un walk vuoto o non riuscito richiede indagini: verificare l'errore segnalato, la vista di accesso e il supporto dell'agente.

## Verificare il massimo memorizzato dopo le variazioni di velocità

Quando l'origine dati utilizza un massimo basato sulla velocità della query, la creazione recupera la velocità dai dati di rilevamento memorizzati nella cache. `ifHighSpeed` ha la preferenza, `ifSpeed` viene utilizzato se il primo è assente e un valore predefinito configurato viene applicato se entrambi sono pari a zero.

Tale valore viene scritto nel file. Una porta rilevata a 100 Mbps e successivamente negoziata a una velocità superiore può mantenere un limite massimo inferiore al suo traffico effettivo, e RRDtool registrerà le frequenze superiori a tale limite come sconosciute. Confrontare la velocità memorizzata nella cache, la definizione dell'origine dati e il file effettivo con `rrdtool info`.

## La scelta dell'indice

È qui che la cronologia viene persa in caso di errore.

Ogni origine dati memorizza due elementi sulla propria porta: quale campo la identifica (il tipo di indice) e il valore di quel campo. Ad ogni reindicizzazione ritrova la porta chiedendo quale indice SNMP ha attualmente quel valore in quel campo. L'origine dati segue il valore, non la posizione nella tabella.

La domanda è quindi quale campo contenga il valore.

La query dell'interfaccia dichiara un ordine di preferenza: `ifName`, quindi `ifDescr`, quindi `ifHwAddr`, quindi `ifIndex`. Kadupul sceglie normalmente tra i candidati che hanno valori sufficientemente distinti e nessun duplicato.

| Campo | Sopravvive a | Fallisce quando |
|---|---|---|
| `ifName` | Riavvii, sostituzione schede, rinumerazione | L'agente lo lascia vuoto o lo ripete tra i membri dello stack |
| `ifDescr` | Generalmente stabile sull'hardware dello switch | Sui server, un nome del kernel soggetto a modifiche |
| `ifHwAddr` | Riavvii | Una scheda sostituita presenta nuovi indirizzi MAC, che è esattamente il caso da cui ci si voleva proteggere |
| `ifIndex` | Nulla di affidabile | La sostituzione di una scheda, un riavvio o una modifica del firmware rinumerano la tabella |

Se la query ripiega su `ifIndex`, considerare ciò come un'anomalia e non come un risultato normale. La cronologia delle porte è legata a un numero che lo switch è libero di riassegnare.

## Metodo di reindicizzazione

Impostato per dispositivo e per query di dati. Determina quando Kadupul rilegge i campi indice.

| Metodo | Si attiva su | Costo |
|---|---|---|
| None | Niente; solo manuale o script | Nessuno |
| Uptime | Uptime SNMP del dispositivo che va a ritroso | Un confronto per ciclo |
| Index Count | Modifica del conteggio degli indici rilevati | Un conteggio per ciclo |
| Verify All | Errore in un controllo di identità memorizzato nella cache | Interroga gli indici noti durante il polling |

Uptime è l'impostazione predefinita ed è adatta alla maggior parte degli switch, poiché un riavvio è l'evento che rinumera gli indici. Index Count rileva schede aggiunte o rimosse senza riavvio. Verify All può rilevare identità modificate su indici noti, ma non garantisce il rilevamento di nuove porte.

Per rieseguire un dispositivo e una query selezionati, sostituire entrambi gli ID con gli ID installati. Omettere `--qid` per rieseguire tutte le query per quel dispositivo:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` estende l'esecuzione a tutti i dispositivi abilitati. Evitare esecuzioni di reindicizzazione sovrapposte. `--force` ignora la registrazione dei processi e aggiorna le cache dei titoli.

## Quando una porta scompare

Non presumere che una porta mancante interrompa automaticamente la raccolta. Il codice di reindicizzazione corrente può reimpostare un flag orfano e mantenere i vecchi OID di polling quando un'identità non è risolta e nessuna origine modifica l'indice. Confrontare l'identità memorizzata con la nuova cache di rilevamento e disabilitare l'origine interessata fino alla conferma della corrispondenza. Vedere [Query di dati e indici](/it/concepts/data-queries-and-indexes/).

## Chassis di grandi dimensioni

Due impostazioni per dispositivo diventano importanti quando il conteggio delle porte è elevato: verificare gli OID configurati per richiesta SNMP e il conteggio dei thread per dispositivo. Il supporto al batching e il parallelismo effettivo dipendono dal collettore e dall'agente; PHP `cmd.php` e Spine non offrono un comportamento di threading identico.

Modificare una sola impostazione alla volta e monitorare la durata dell'esecuzione del poller.

## Modalità di errore

| Sintomo | Causa |
|---|---|
| Grafici creati, ogni misurazione sconosciuta | Contatori a 64 bit non implementati, o il dispositivo utilizza SNMP v1 |
| I contatori saltano a valori assurdi | Il contatore a 32 bit va in overflow più di una volta per intervallo |
| Vuoti solo a carico elevato | Massimo RRD vincolato a una velocità rilevata obsoleta |
| Cronologia della porta associata alla porta errata dopo manutenzione | Identità instabile, corrispondenza obsoleta o gestione orfani non risolta |
| Il poller segnala avvisi su indici SNMP non validi | Origini dati lasciate senza indice; reindicizzare, eliminare o disabilitare |
| Porte rilevate, non viene raccolto nulla | Le origini dati con un indice vuoto non creano voci nella cache del poller |
