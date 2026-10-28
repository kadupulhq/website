---
title: Monitorare un host Windows
description: Creazione di grafici di CPU, dischi, interfacce e uptime su Windows tramite il servizio SNMP, quali oggetti delle risorse host trasmettono i dati e cosa fare quando SNMP non è disponibile.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 14
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

Windows tramite SNMP fornisce interfacce, processori, archiviazione e alcuni contatori. L'agente integrato di Microsoft non espone gli oggetti di carico, memoria e disco dei template UCD net-snmp. La memoria può tuttavia essere rappresentata dalle righe di archiviazione se l'agente le espone. Gli agenti di terze parti possono fornire altri oggetti; verificare l'agente effettivo prima di scegliere i template.

## Cosa fornisce il servizio SNMP

Il servizio SNMP di Windows è deprecato e opzionale. Per Windows 10 e 11, Microsoft ne documenta l'installazione tramite funzionalità facoltative o funzionalità Windows; un precedente errore del nome della funzionalità DISM non dimostra da solo che non sia disponibile. Verificare le istruzioni corrispondenti alla propria edizione di Windows. Vedere la [guida all'installazione di SNMP di Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Verificare quali di questi sottoalberi sono esposti dall'agente installato:

| Area | Sottoalbero | Fornisce |
|---|---|---|
| Sistema | `.1.3.6.1.2.1.1` | Descrizione, uptime, contatto, nome, posizione |
| Interfacce | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Traffico, errori, stato |
| Risorse host | `.1.3.6.1.2.1.25` | Processori, archiviazione, conteggio processi, utenti connessi |
| LAN Manager | `.1.3.6.1.4.1.77` | Dati su servizi e condivisioni Windows |

I template Windows forniti da Kadupul leggono le prime tre aree. Nulla nel set integrato legge il sottoalbero LAN Manager.

Due elementi di configurazione sull'host determinano la ricezione dei dati: la stringa di community e l'elenco dei manager da cui l'agente accetta pacchetti. Un host impostato per accettare SNMP solo da un singolo indirizzo manager risponderà solo a quel manager e scarterà tutto il resto.

Verificare ciascuna area dall'host del poller prima di creare grafici. Sostituire l'host e la community di esempio con i valori configurati; `public` ha solo scopo illustrativo.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Il secondo walk legge il carico del processore, il terzo legge l'elenco delle descrizioni dell'archiviazione. Se il primo comando funziona e gli altri due non restituiscono nulla, controllare le restrizioni di accesso, il supporto dell'agente e l'errore SNMP restituito.

## Aggiungere il dispositivo

Importare `install/templates/Windows_Device.xml.gz` se i template mancano, in base a [Importare ed esportare template](/it/guides/import-and-export-templates/). Selezionare il template del dispositivo Windows, verificare il rilevamento delle query, quindi creare esplicitamente i grafici desiderati. Il pacchetto contiene tre query di dati e i relativi template di grafici associati.

| Query di dati | Supportata da | Legge |
|---|---|---|
| SNMP - Statistiche interfaccia | `resource/snmp_queries/interface.xml` | `IF-MIB`, percorsa direttamente |
| SNMP - Ottieni informazioni processore | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` tramite `scripts/ss_host_cpu.php` |
| SNMP - Ottieni punti di montaggio | `resource/script_server/host_disk.xml` | `hrStorageTable` tramite `scripts/ss_host_disk.php` |

Le query su disco e processore sono query basate su server di script, a dispetto dei loro nomi. Vengono eseguite in un processo server di script PHP separato e persistente ed eseguono chiamate SNMP con le credenziali del record del dispositivo. La query di interfaccia è una pura query SNMP. La conseguenza pratica è che un server di script PHP non funzionante interrompe la raccolta di disco e CPU su Windows mentre i grafici di interfaccia continuano a funzionare.

## Cosa si ottiene senza query di dati

Due template di grafici leggono ciascuno un singolo OID fisso.

| Grafico | OID | Memorizzato come |
|---|---|---|
| MIB host - Processi | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| MIB host - Utenti connessi | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Altri due non leggono nulla dal dispositivo. I grafici relativi all'uptime e al tempo di polling chiamano `scripts/ss_hstats.php` e restituiscono una colonna dal record del dispositivo di Kadupul: `snmp_sysUpTimeInstance` per l'uptime, la durata di polling registrata per il tempo di polling. Leggono misurazioni memorizzate, non una risposta SNMP in tempo reale.

## Le tabelle delle risorse host

### Processori

`hrProcessorLoad` sotto `.1.3.6.1.2.1.25.3.3.1.2` restituisce una voce per processore logico esposto dall'agente. Il walk fornisce gli indici; non presumere che il numero di righe corrisponda sempre al numero di thread hardware pubblicizzato.

Il valore è già una percentuale. La MIB lo definisce come la media sull'ultimo minuto. Vedere la [definizione della MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Archiviazione

La query di archiviazione fornita utilizza `hrStorageTable` sotto `.1.3.6.1.2.1.25.2.3.1`. Legge sei colonne.

| Colonna | OID | Direzione |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Indice |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Indice ed etichetta visualizzata |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Input, il moltiplicatore |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Output |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Output |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Output |

La dimensione e lo spazio utilizzato sono conteggi di unità di allocazione, non byte. Lo script moltiplica ciascun valore per la dimensione dell'unità di allocazione memorizzata nella cache per quell'indice quando entrambi i valori sono validi.

Due aspetti causano frequentemente problemi su Windows.

**La tabella non è un elenco di dischi rigidi.** L'agente segnala tutto ciò che considera archiviazione. A seconda dell'agente, la memoria fisica e la memoria virtuale possono comparire accanto alle unità fisse. Etichette come `C:\`, `D:\`, `Physical Memory` e `Virtual Memory` sono esempi, non righe garantite. Selezionare le righe desiderate per i grafici.

**I valori di archiviazione grandi o non validi richiedono verifica.** La MIB definisce dimensione e utilizzo come valori Integer32 non negativi. Un agente che restituisce un valore negativo non rientra in tale intervallo. Lo script attuale utilizza `(abs(value) + 2147483647) * allocation_units`, che non rappresenta una reinterpretazione a 32 bit senza segno. Considerare i valori interessati come inaffidabili e reindicizzare dopo aver corretto il rilevamento. Vedere il [difetto di conversione dell'archiviazione](https://github.com/kadupulhq/kadupul/issues/243).

## Dove Windows differisce da Linux

| Caratteristica | Linux con net-snmp | Agente Windows integrato / template forniti |
|---|---|---|
| Media di carico | `.1.3.6.1.4.1.2021.10.1.3` | Nessun oggetto media di carico UCD |
| Memoria | `.1.3.6.1.4.1.2021.4` | Può essere tracciata dalle righe `hrStorage` esposte |
| CPU | Percentuali UCD o `hrProcessorLoad` | Solo `hrProcessorLoad` |
| Elenco dischi | `dskTable` dichiarata dall'utente o `hrStorage` | Solo `hrStorage`, non filtrata |
| I/O disco | `diskIOTable` | Nessun elemento fornito legge questo dato |
| Nomi interfacce | Nomi del kernel, brevi | Descrizioni lunghe delle schede, spesso duplicate |

L'agente Microsoft integrato non fornisce il sottoalbero UCD `.1.3.6.1.4.1.2021`. Vedere [Risoluzione dei dati mancanti](/it/guides/troubleshoot-missing-data/).

### Interfacce

La query dell'interfaccia è identica a quella utilizzata da uno switch. Il suo ordine di preferenza per l'indice è `ifName`, quindi `ifDescr`, quindi `ifHwAddr`, quindi `ifIndex`. Sceglie il primo campo presente e univoco su ciascuna interfaccia rilevata.

Windows è la piattaforma in cui ciò fallisce più frequentemente. Due schede di rete identiche possono restituire lo stesso `ifDescr` e alcuni agenti lasciano `ifName` vuoto. Quando la query ripiega su `ifIndex`, la cronologia dell'interfaccia è vincolata a un numero che Windows è libero di riassegnare.

Vedere [Monitorare uno switch](/it/guides/monitor-a-switch/) e [Query di dati e indici](/it/concepts/data-queries-and-indexes/).

## Quando SNMP non è disponibile

Molte installazioni Windows non hanno il servizio SNMP abilitato. La soluzione alternativa è un input da script.

Due elementi determinano il modo in cui si scrive lo script.

**Lo script viene eseguito sulla macchina su cui è in esecuzione il poller.** Raggiungere l'host Windows è compito dello script: WinRM, un agente, un endpoint HTTP, una condivisione o qualsiasi meccanismo in uso.

**Emettere le misurazioni sullo standard output.** Il percorso di comando esterno del poller PHP non utilizza lo stato di uscita come valore di misurazione. Emettere un numero, oppure `U` in caso di assenza di misurazione in questo ciclo. Non emettere `0` quando si intende segnalare che la misurazione è fallita.

Se è necessario un valore per interfaccia, per disco o per servizio anziché un singolo numero, lo stesso meccanismo di script fornisce una forma indicizzata. `resource/script_queries/host_cpu.xml` è un esempio pratico che richiama uno script PHP anziché il server di script.

Vedere [Scrivere uno script di raccolta dati](/it/guides/write-a-data-collection-script/) per il contratto di output e i vincoli di denominazione.

## Modalità di errore

| Sintomo | Causa comune |
|---|---|
| Descrizione di sistema letta, nient'altro raccolto | Verificare il supporto degli oggetti, le restrizioni di accesso e l'errore SNMP specifico |
| Nessuna risposta da un host online | Elenco dei manager accettati dall'agente o regola del firewall host su UDP 161 |
| L'elenco delle partizioni include la memoria | Previsto; l'agente segnala la memoria come archiviazione |
| Un volume di grandi dimensioni appare negativo o sconosciuto | Valori agente non validi o unità di allocazione obsolete; verificare il bug di conversione noto |
| Disco e CPU si arrestano, le interfacce continuano | Guasto al server di script; la query dell'interfaccia non lo utilizza |
| Template net-snmp assegnati, ogni misurazione sconosciuta | L'agente selezionato non fornisce gli oggetti UCD richiesti per tali template |
| La cronologia dell'interfaccia segue l'adattatore errato dopo una modifica | L'indice è ripiegato su `ifIndex` perché i nomi erano vuoti o duplicati |
| L'uptime ripete un vecchio valore | Verificare se il record del dispositivo è obsoleto; l'helper non estrapola l'uptime |
