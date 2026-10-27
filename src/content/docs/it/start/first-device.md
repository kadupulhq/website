---
title: Aggiungere il primo dispositivo
description: Avviate il polling su un dispositivo e verificate che i dati arrivino prima di costruire qualsiasi altra cosa.
sidebar:
  order: 3
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
---

Aggiungete un dispositivo, verificate che risponda e solo allora andate avanti. La maggior parte dei problemi con un sistema di monitoraggio è riconducibile a un dispositivo che in realtà non ha mai risposto fin dall’inizio.

Scegliete un dispositivo con cui potete permettervi di sbagliare. Uno switch di vostra proprietà, su una rete che controllate, con SNMP già abilitato. Non iniziate con il dispositivo su cui qualcuno vi sta facendo domande.

## Prima di iniziare

Per questo esempio SNMP, il dispositivo deve rispondere alle interrogazioni del suo collector assegnato. Eseguite i controlli su tale collector, preferibilmente come utente del poller; una richiesta proveniente dal vostro portatile può seguire un percorso di firewall differente. Sostituite l’indirizzo e la community dell’esempio con le credenziali di sola lettura configurate sul dispositivo. Gli OID numerici riportati di seguito funzionano anche quando i file locali dei nomi MIB non sono installati.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Se il comando restituisce una stringa descrittiva, proseguite. Se va in timeout, risolvete prima questo problema. Nessun intervento di configurazione nell’interfaccia web farà rispondere un dispositivo irraggiungibile.

Verificate poi la tabella che desiderate effettivamente visualizzare in grafico, poiché un dispositivo può rispondere a `sysDescr` e tuttavia rifiutare la tabella delle interfacce.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

Il secondo OID corrisponde alla colonna `ifDescr`. È necessario ottenere una riga per ogni interfaccia esposta. Un risultato vuoto può indicare una vista SNMP ristretta o una tabella non supportata; un errore di autorizzazione rimanda alle credenziali o ai criteri di accesso. Esaminate l’errore restituito prima di modificare la configurazione del dispositivo o di Kadupul.

Due aspetti relativi alle versioni SNMP determinano scelte successive, pertanto è opportuno definirli subito.

| Versione | Cosa significa per voi |
|---|---|
| v1 | Nessun supporto per Counter64. I collegamenti veloci possono azzerare i contatori di ottetti a 32 bit più volte tra un polling e l’altro, rendendo la velocità ambigua |
| v2c | Supporta Counter64 quando l’agent lo espone; le stringhe di community vengono trasmesse in chiaro |
| v3 | Supporta autenticazione e crittografia con `authPriv`; la sola scelta di v3 non abilita automaticamente entrambe |

Preferite v3 con `authPriv` dove supportato, oppure v2c su una rete di gestione protetta. Selezionate il tipo di grafico di interfaccia a 64 bit oltre alla versione SNMP. Se il dispositivo supporta unicamente v1, considerate l’intervallo di polling e la velocità di traffico indicati nella tabella dei problemi in fondo a questa pagina. [SNMP](/it/reference/snmp/) illustra tutti i campi relativi alle credenziali.

## Decidere tre aspetti prima di aprire il modulo

**Le credenziali.** Esattamente quelle verificate sopra, inclusa la porta se non è quella predefinita.

**Il metodo di disponibilità.** È il modo in cui Kadupul stabilisce se il dispositivo è attivo, ed è indipendente dal corretto funzionamento della raccolta. Le scelte disponibili sono none, ping, SNMP uptime, SNMP description, SNMP getNext e due combinazioni di ping con SNMP uptime: una che richiede entrambi e una che accetta l’uno o l’altro.

Preferite un metodo SNMP per un dispositivo interrogato via SNMP. Esso verifica direttamente l’elemento da cui dipendete. Il ping ICMP richiede un raw socket, che necessita di privilegi normalmente non assegnati agli utenti web e di polling; pertanto un dispositivo che risponde a `ping` dalla vostra shell può comunque risultare inattivo. Un ping TCP su una porta notoriamente aperta evita questo inconveniente.

**Il modello di dispositivo.** Sceglietene uno corrispondente all’hardware.

## Aggiungerlo

1. Nella pagina legacy **Devices** (`host.php`), scegliete **Add**. La creazione dei dispositivi e la configurazione dei grafici utilizzano ancora questa pagina durante la migrazione a Symfony. Inserite una descrizione, il nome host o l’indirizzo, il collector assegnato, la versione SNMP e le credenziali.
2. Impostate il metodo di disponibilità prescelto.
3. Selezionate il modello di dispositivo.
4. Salvate, verificate che il dispositivo sia abilitato e consultate il relativo pannello di disponibilità/SNMP. Un record salvato nel database non è una prova dell’avvenuta raccolta dei dati.

## Cosa stabilisce il modello di dispositivo

Un modello di dispositivo associa modelli di grafico e data query al dispositivo stesso. Una data query esamina una tabella sul dispositivo, come le sue interfacce, e produce un indice per ogni riga. L’applicazione del modello esegue anche le relative data query per popolare tali indici. Con l’automazione dei grafici disabilitata, queste associazioni non creano grafici da sole. Quando l’automazione dei grafici è attiva, gli hook del modello o della query possono creare grafici in base a regole di corrispondenza; ispezionate i grafici esistenti prima di aggiungere un duplicato.

La modifica di un modello può alterare le associazioni ed eseguire nuovamente tali hook. Non si tratta di un ripristino dei grafici o delle origini dati esistenti. Verificate il modello selezionato e gli indici interrogati prima di applicarlo a un dispositivo con una cronologia pregressa.

Tali indici spiegano perché si selezionano le interfacce da un elenco anziché digitare manualmente gli OID. [Modelli](/it/concepts/templates/) e [Data query e indici](/it/concepts/data-queries-and-indexes/) approfondiscono entrambi gli argomenti in modo esauriente.

## Leggere il pannello di stato

Quando il dispositivo viene salvato con un metodo di disponibilità SNMP, Kadupul apre una sessione e ne restituisce l’esito. Questo è il controllo davvero fondamentale, ed è quello che spesso viene trascurato.

| Cosa si vede | Cosa significa |
|---|---|
| Le query di sistema e di uptime hanno successo | Il pannello può leggere i metadati SNMP di base. Questo non dimostra ancora la raccolta dei dati delle interfacce |
| Posizione o Contatto è vuoto | Questi campi facoltativi di metadati possono non essere impostati; la loro assenza non costituisce un errore di raccolta |
| SNMP non in uso | Nessuna community o utente presente sul dispositivo, oppure la versione è impostata su none |
| Errore SNMP di sessione | Inizializzazione della sessione non riuscita; esaminate l’errore mostrato, le credenziali, il protocollo e i parametri di connessione |
| Errore SNMP di sistema | Lettura di `sysDescr` non riuscita; verificate l’errore restituito, la vista dell’agent, le credenziali e la raggiungibilità |
| Errore SNMP dell’host | Non sono stati restituiti né la descrizione né l’uptime |
| Uptime indicato come `U` | L’uptime non è leggibile. Alcuni dispositivi non lo comunicano affatto |

Se il metodo di disponibilità include il ping, in basso comparirà un esito separato per il ping. Leggeteli entrambi. Un dispositivo può superarne uno e fallire l’altro; l’esito negativo indica con precisione dove indagare.

Una descrizione di sistema vuota non dimostra che la raccolta stia fallendo. Il codice supporta agent con una descrizione vuota e un uptime utilizzabile. I dispositivi disabilitati ignorano il controllo di disponibilità e i metodi di disponibilità non SNMP non mostrano questo pannello SNMP. Verificate successivamente l’interrogazione effettiva e la cache del poller.

## Creare le origini dati e i grafici

Per un nuovo dispositivo privo di grafici generati automaticamente, il passaggio successivo consiste nel creare il grafico e la relativa origine dati. Controllate **Data Source List** e **View Poller Cache** nella pagina del dispositivo anziché dare per scontato che siano vuoti.

Dalla pagina del dispositivo, scegliete **Create Graphs for this Device**. Per uno switch questo comporta l’esecuzione della data query delle interfacce, la selezione delle interfacce d’interesse e la scelta del tipo di grafico desiderato. Scegliete due o tre interfacce, non tutte le quarantotto. L’obiettivo è verificare che il percorso funzioni; un primo lotto ridotto è molto più semplice da interpretare nel passaggio successivo.

Un grafico indicizzato associa le origini dati all’interfaccia scelta e ne predispone le voci nella cache del poller; le origini compatibili esistenti possono essere riutilizzate. La risposta di creazione del grafico non garantisce l’avvenuta raccolta. Verificate che la cache contenga il dispositivo atteso, gli OID dell’interfaccia e il percorso RRD.

## Verificare che la raccolta sia attiva

Attendete i cicli di raccolta pianificati, quindi verificate sia i timestamp sia i valori. Un grafico vuoto può dipendere dalla normalizzazione iniziale, da un valore sconosciuto o da una raccolta non riuscita. Sono necessarie due letture del contatore per calcolare una velocità, ma due esecuzioni del poller non garantiscono un intervallo di archivio completo e valido.

Verificate tre aspetti, in questo ordine.

**Il poller è stato eseguito.** Cercate il riepilogo di fine esecuzione nel log configurato. Se manca, verificate la pianificazione, la destinazione del log, i permessi e l’eventuale uscita anticipata del poller. Consultate [Logging](/it/reference/logging/).

**Il file esiste ed è recente.** Copiate il percorso RRD reale dall’origine dati o dalla cache del poller; non deducetelo dal nome host. I percorsi e i nomi possono essere personalizzati. Consultate [Struttura dei file](/it/reference/file-layout/). Chiedete a RRDtool quando il file è stato scritto l’ultima volta:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Il timestamp deve avanzare a ogni scrittura riuscita. Un timestamp recente può comunque accompagnarsi a un valore sconosciuto, e le scritture memorizzate nel buffer possono ritardare l’aggiornamento su disco. Per `rrdcached` o Boost, verificate anche lo stato di svuotamento (flush) di tale componente.

**Il valore non è sconosciuto.** `lastupdate` mostra i valori più recenti forniti; per un contatore si tratta di valori grezzi e non di velocità di traffico calcolate. Ispezionate le righe completate di `fetch` per individuare velocità finite. L’istante di avvio, l’allineamento degli step, l’heartbeat, i limiti e la soglia di dati sconosciuti dell’archivio influiscono tutti sul momento in cui compare una riga utilizzabile. Non diagnosticate un’anomalia basandovi unicamente sulle prime due righe. Se i valori sconosciuti persistono, esaminate i valori raccolti, il tipo di origine dati, l’heartbeat e gli errori del poller.

## Problemi iniziali più comuni

| Sintoma | Causa abituale |
|---|---|
| Il salvataggio riesce, ma la lettura della descrizione di sistema segnala un errore | Verificate credenziali, vista dell’agent e raggiungibilità del collector; una descrizione vuota non costituisce prova sufficiente |
| Errore SNMP di sessione da Kadupul, ma `snmpget` funziona dal vostro portatile | Il percorso del firewall differisce o l’agent limita l’accesso in base all’indirizzo di origine |
| Il dispositivo risulta inattivo, ma i dati SNMP arrivano | La disponibilità è impostata su ping ICMP, che non può aprire un raw socket |
| La descrizione compare, ma nessun dato | Il poller non è pianificato o viene eseguito con un utente privo di permessi di scrittura nella directory RRD |
| La data query non restituisce interfacce | La vista dell’agent esclude la tabella delle interfacce o il dispositivo richiede una reindicizzazione |
| Il primo valore è sconosciuto, poi regolare | Normale per un contatore. Necessita di due letture per produrre una velocità |
| I valori sconosciuti persistono | Raccolta non riuscita, valori non validi, mancata corrispondenza di tipo/limiti, heartbeat o normalizzazione dell’archivio |
| Dati presenti per un periodo, poi interruzioni | Il poller impiega più tempo del proprio intervallo oppure il dispositivo limita la frequenza SNMP |
| Le velocità del contatore non sono plausibili | Più azzeramenti a 32 bit, reset del contatore, unità o impostazioni dell’origine dati; usate contatori a 64 bit supportati sui link veloci |
| Le interfacce mostrano le porte errate dopo un riavvio | Gli indici sono cambiati. La data query necessita di un metodo di reindicizzazione che rilevi il cambiamento |

Vale la pena comprendere quest’ultimo aspetto prima di gestire centinaia di switch: la stabilità degli indici di interfaccia SNMP non è garantita dopo un riavvio o la sostituzione di un modulo. Il metodo di reindicizzazione su una data query è ciò che mantiene un grafico associato alla stessa porta fisica. [Data query e indici](/it/concepts/data-queries-and-indexes/) descrive le opzioni disponibili.

Quando un dispositivo raccoglie i dati in modo pulito, aggiungete gli altri in blocco anziché uno alla volta. [Rilevare i dispositivi automaticamente](/it/guides/discover-devices-automatically/) e gli strumenti da riga di comando illustrati in [Strumenti da riga di comando](/it/reference/command-line-tools/) sono entrambi preferibili rispetto a ripetere questa pagina cinquanta volte.

Passaggio successivo: [Interpretare il primo grafico](/it/start/first-graph/).
