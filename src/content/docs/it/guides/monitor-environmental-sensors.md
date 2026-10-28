---
title: Monitorare i sensori ambientali
description: Tracciare temperatura, umidità, flusso d'aria, potenza e stato dell'UPS tramite SNMP, individuare le OID corrette su una MIB del produttore e applicare impostazioni grafiche adatte a una misurazione piuttosto che a un contatore.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 23
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di
affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

Temperatura, umidità e potenza istantanea sono misurazioni, solitamente memorizzate come
`GAUGE`. L'energia cumulativa o i totali degli eventi possono richiedere invece una tipologia a contatore.
Verificare unità di misura, identità e semantica di ogni oggetto prima di scegliere un modello.

Verificare cosa viene già fornito prima di creare elementi personalizzati.

## Cosa viene fornito

Nella cartella nativa delle query risiedono unicamente quattro definizioni di query di dati,
e nessuna di esse riguarda l'ambiente.

| Query SNMP fornita | Ambito |
|---|---|
| `interface.xml` | Interfacce di rete |
| `host_disk.xml` | Archiviazione Host Resources |
| `net-snmp_disk.xml` | Partizioni dichiarate in UCD |
| `net-snmp_devio.xml` | I/O dei dispositivi a blocchi UCD |

La copertura per i sensori viene fornita attraverso due ulteriori modalità.

**Query del server di script, incluse nel pacchetto dispositivo Net-SNMP.** Importare
`install/templates/NetSNMP_Device.xml.gz` per distribuire i tre file XML di query lmSensors
nella directory `resource/script_server/`. L'helper
`scripts/ss_netsnmp_lmsensors.php` è anch'esso presente nel codice sorgente.

| Query | Tabella |
|---|---|
| Net-SNMP - Sensors - Get Thermal Sensors | `.1.3.6.1.4.1.2021.13.16.2.1` |
| Net-SNMP - Sensors - Get Fan Sensors | `.1.3.6.1.4.1.2021.13.16.3.1` |
| Net-SNMP - Sensors - Get Voltage Sensors | `.1.3.6.1.4.1.2021.13.16.4.1` |

L'helper impiega le colonne indice, nome e lettura. La query indicizza sul campo numerico
`sensorDevice`; `sensorName` fornisce una descrizione visualizzata che l'helper tronca a
18 caratteri. I nomi non garantiscono identità univoche per i sensori.

Il normale percorso `get sensorReading` restituisce valori grezzi: milligradi per l'oggetto
termico storico, millivolt per la tensione e RPM per le ventole. Il grafico termico
applica una CDEF `Divide by 1000`. Il grafico della tensione non possiede alcuna CDEF a dispetto della sua etichetta Volts,
un [bug di scala accertato](https://github.com/kadupulhq/kadupul/issues/247).

Il percorso indipendente `query sensorReading` scala temperatura e tensione e tenta
una conversione di tensione con segno adoperando l'errata costante 4294967294. Può inoltre
[sollevare un'eccezione su letture non disponibili](https://github.com/kadupulhq/kadupul/issues/248).
Non dedurre le unità di memorizzazione da questo output di rilevamento.

L'helper impiega ancora la colonna termica obsoleta `.2.1.3`. La versione a monte attuale di
[LM-SENSORS-MIB](https://raw.githubusercontent.com/net-snmp/net-snmp/master/mibs/LM-SENSORS-MIB.txt)
depreca tale oggetto senza segno a favore della colonna con segno `.2.1.4`; verificare il supporto
e il comportamento con temperature negative sull'agente reale prima di adattare un modello.

**Pacchetti di dispositivi, forniti come archivi importabili.** Diversi pacchetti includono i propri
file XML di query e li scrivono nelle relative cartelle in fase di importazione. Quelli rilevanti in questo contesto:

| Pacchetto | Funzionalità |
|---|---|
| SNMP UPS | Query di linea in ingresso e uscita UPS-MIB, oltre a modelli a OID fissa per batteria, autonomia, temperatura e allarmi |
| AKCP Device | Query di script per sensori di temperatura, umidità, flusso d'aria e 4-20 mA |
| APC InfraStruXure PDU | Query per statistiche di interruttori e fasi |
| APC InfraStruXure InRow CRAC | Query per statistiche di unità e gruppi, incluse temperatura, umidità, flusso d'aria e velocità delle ventole |
| BayTech PDU | Query per prese e circuiti trifase, con corrente, tensione, potenza e temperatura |

Esaminare il pacchetto corrispondente prima di scrivere manualmente una query. Seguire
[Importare ed esportare modelli](/it/guides/import-and-export-templates/), verificare la distribuzione dei file
e l'individuazione, quindi creare espressamente i grafici voluti. La presenza di un pacchetto
non dimostra la compatibilità del dispositivo né la corretta applicazione della scala; i difetti di UPS e
lmSensors descritti di seguito richiedono attenzione.

## Le due forme assunte da un sensore

Per la raccolta SNMP, occorre distinguere gli oggetti scalari dalle istanze di tabelle indicizzate.

**Un'OID fissa.** Un singolo valore scalare a un determinato indirizzo, il medesimo su ogni
dispositivo di quel tipo. Temperatura della batteria. Potenza totale di uscita. Utilizzare un'origine dati
a OID fissa: una richiesta SNMP get su una OID letterale e una sola origine dati per misurazione.

**Una tabella.** Un numero indefinito di letture individuate per ciascun apparato. Sonde rack,
multiprese, misurazioni per fase. Utilizzare una query di dati, che percorre la tabella,
apprende l'indice e consente di scegliere quali righe convertire in grafici.

Il pacchetto UPS fornito adotta entrambi i metodi. Seguire la struttura degli oggetti della MIB: un dispositivo
dotato di un solo sensore di corrente può comunque esporlo come riga di una tabella indicizzata.

| Misurazione UPS | Forma | OID |
|---|---|---|
| Temperatura della batteria | Fissa | `.1.3.6.1.2.1.33.1.2.7.0` |
| Autonomia residua stimata | Fissa | `.1.3.6.1.2.1.33.1.2.3.0` |
| Tempo a batteria | Fissa | `.1.3.6.1.2.1.33.1.2.2.0` |
| Tensione della batteria | Fissa | `.1.3.6.1.2.1.33.1.2.5.0` |
| Allarmi attivi | Fissa | `.1.3.6.1.2.1.33.1.6.1.0` |
| Tensione, corrente, potenza, frequenza in ingresso | Query | `.1.3.6.1.2.1.33.1.3.3.1` |
| Tensione, corrente, potenza, carico in uscita | Query | `.1.3.6.1.2.1.33.1.4.4.1` |

Ciascuna di queste origini dati è di tipo `GAUGE`. Nessuna è un contatore. L'archivio
di modelli fornito dichiara uno step di 60 secondi e un heartbeat di 600 secondi, un minimo pari
a zero e nessun massimo, ad eccezione della temperatura, che non prevede minimi. Verificare il profilo importato
e la configurazione reale del file RRD; tali dichiarazioni non vincolano la cadenza effettiva di interrogazione.
Una lettura negativa valida richiede inoltre un asse del grafico capace di rappresentarla.

## Individuare le OID

Interrogare il dispositivo prima di procedere con la stesura del modello. Si ricercano tre elementi: una
tabella di letture, una tabella parallela di etichette e il moltiplicatore adottato dal
produttore, oltre a eventuali oggetti di validità/stato.

```bash
snmpwalk -v2c -c public probe.example.net .1.3.6.1.2.1.33
# Replace this example enterprise number with the vendor's actual number.
vendor_oid='.1.3.6.1.4.1.318'
snmpwalk -v2c -c public probe.example.net "$vendor_oid"
```

Sostituire host e comunità di esempio con i valori configurati ed eseguire le verifiche dal poller.
Caricare la MIB appropriata e le relative dipendenze per verificare nomi, unità e semantica;
anche la documentazione tecnica del produttore può chiarire le OID numeriche. Una soglia contigua
o un codice di stato non sono equivalenti a una misurazione.

```bash
snmptranslate -m +UPS-MIB -Td -OS .1.3.6.1.2.1.33.1.2.7
```

È nella definizione della MIB che viene documentata la scala. Un produttore che riporta
decimi di grado lo espliciterà nella descrizione o nella clausola units dell'oggetto, nonché nella
documentazione associata. Tirare a indovinare da una singola lettura può trasformare 23,5 gradi
in un grafico a quota 235.

Le MIB standard coprono più casistiche di quanto si creda. La MIB UPS-MIB in `.1.3.6.1.2.1.33` è
comune a diversi produttori. ENTITY-SENSOR-MIB fornisce il valore di un sensore unitamente ai
propri campi di scala e precisione. È bene cercare questi standard prima di rivolgersi a un ramo proprietario.

Confrontare il rilevamento tra riavvii rappresentativi e sostituzioni di sonde in un'installazione di test.
Due verifiche immutate da sole non provano la stabilità degli indici. Registrare identificatori
stabili dei sensori quando disponibili prima di creare grafici definitivi.

## Creare un'origine dati a OID fissa

Un sensore a OID fissa necessita di un modello dati che utilizzi l'input dati SNMP get, con
la OID in formato letterale e una sola voce di origine dati. Impostare la tipologia su `GAUGE`,
assegnare un valore reale al limite minimo solo se il sensore non può scendere al di sotto di esso,
e lasciare il massimo non definito a meno che il produttore non specifichi un limite superiore.

I valori al di fuori dei limiti dell'origine dati RRD vengono considerati sconosciuti. Definire tali margini
nelle unità grezze memorizzate, non nelle unità convertite del grafico; altrimenti, letture
valide possono andare perdute prima dell'applicazione di una CDEF di visualizzazione.

## Creare una query di dati

Una query necessita di una OID di indice, di una procedura per convertire ciascuna OID scansionata in un indice, e di un
campo per ogni colonna richiesta.

La query di uscita dell'UPS rappresenta un sintetico esempio pratico. Indicizza sulla tabella delle linee,
estrae l'indice dal termine di ogni OID restituita tramite un'espressione regolare, e
dichiara un campo di input per l'indice e quattro campi di output per tensione,
corrente, potenza e carico. Le definizioni di output specificano metodo, origine, direzione e
OID di colonna. Una OID di colonna può costituire una radice valida per la scansione degli indici; la concordanza
tra il parser della query e le OID effettivamente restituite è l'aspetto decisivo. Vedere [Query di dati e indici](/it/concepts/data-queries-and-indexes/) per i dettagli su
come l'indice viene scelto e memorizzato.

Selezionare con cura il metodo di reindicizzazione. Le opzioni disponibili sono: nessuno, su uptime
decrescente, su variazione del numero di indici e Verifica tutti i campi (Verify All Fields). Le tabelle dei sensori
rappresentano il contesto in cui i metodi semplificati falliscono: scollegando una sonda da un'unità rack e inserendone un'altra,
il conteggio totale può rimanere immutato mentre ogni lettura associata all'indice appartiene ora a un
sensore differente. Una verifica completa comporta operazioni SNMP a ogni ciclo.
Verificare quali campi di identità la query sia in grado di controllare: indici numerici invariati
o etichette duplicate/troncate non possono garantire che una sonda fisica sia la medesima.
Aggiornare l'individuazione e verificare le associazioni dei grafici in seguito a ogni sostituzione.

## Scalare il valore

Stabilire dove effettuare la conversione e applicarla in un unico punto.

| Dove | Quando utilizzarlo |
|---|---|
| Nello script di raccolta | Rispettare il contratto documentato del collector; lmSensors get restituisce al momento unità grezze |
| In una CDEF sull'elemento del grafico | Il valore grezzo merita di essere salvato, e l'unità di misura mostrata è una scelta di presentazione |

Una CDEF è la risposta tipica a un moltiplicatore del produttore. I pacchetti forniti integrano
definizioni come `Divide By 10`, composte dall'origine dati corrente, `10` e
dalla divisione. Applicarle solo a oggetti con la corrispondente unità grezza.

Il pacchetto UPS include [CDEF di potenza e tempo errate](https://github.com/kadupulhq/kadupul/issues/249):
la sua serie On Battery divide i secondi per 6000 anziché per 60, e le serie Watt di ingresso/uscita
dividono i watt per 10. Per un agente conforme, 600 secondi devono mostrarsi come 10 minuti e 1000 watt come
1000 watt. La tensione della batteria e la corrente di linea richiedono effettivamente la divisione per 10;
l'autonomia stimata è già espressa in minuti. Vedere
[le unità degli oggetti UPS di RFC 1628](https://www.rfc-editor.org/rfc/rfc1628.html).

Memorizzare il dato grezzo ed effettuare la divisione sul grafico mantiene integro il file RRD e
consente di correggere un moltiplicatore di visualizzazione senza riscrivere la cronologia grezza,
a condizione che i campioni abbiano superato i limiti dell'origine dati e i criteri di conservazione. La conversione nel collector
modifica l'unità memorizzata e può ridurre la precisione; è fondamentale documentarla. Letture grezze prive di spiegazione
non dovrebbero essere esposte come unità ingegneristiche certificate.

Evitare di applicare la conversione due volte. Una CDEF su un grafico il cui script ha già scalato
il valore può produrre una lettura verosimile ma del tutto errata.

## Impostazioni del grafico adatte a una misurazione

Scegliere le impostazioni in base alla misurazione anziché replicare acriticamente i valori del traffico di rete.

| Impostazione | Traffico | Sensore |
|---|---|---|
| Tipo di origine dati | `COUNTER` | `GAUGE` |
| Valore base | 1000, affinché l'asse esprima k e M | Sempre 1000, ma il prefisso non ha senso per i gradi |
| Scala automatica | Opportuna, essendo l'intervallo ignoto | Generalmente sconsigliata, essendo l'intervallo noto |
| Limiti superiore e inferiore | Dipendono dalla modalità di scala automatica | Scegliere un intervallo visibile utile |

Impostare un limite superiore e inferiore esplicito assieme a un'etichetta verticale che nomini l'unità
effettiva. Il grafico di temperatura UPS incluso adotta questo approccio: limite inferiore a 0, limite superiore
a 100, e `C` come etichetta verticale.

L'opzione di scala automatica è un ventaglio di scelte e non un semplice interruttore. Quella utilizzata
dal grafico di temperatura fornito trasmette un limite inferiore con `--alt-autoscale-max`;
non invia il limite superiore memorizzato di 100. Senza limiti rigidi, una lettura fuori scala
può espandere il limite passato. Un limite configurato non è automaticamente bloccato. Scegliere la variante
che preserva la soglia di proprio interesse:

| Opzione | Effetto |
|---|---|
| Scala automatica ignorando i limiti | Entrambi i limiti fluttuano. Da usare se non si ha idea dell'intervallo |
| Scala automatica con limite inferiore | Trasmette il limite inferiore; il massimo segue i dati |
| Scala automatica con limite superiore | Trasmette il limite superiore; il minimo segue i dati |
| Scala automatica con entrambi i limiti | Trasmette entrambi i limiti; l'estensione dipende ancora dalla modalità rigida |

Esiste inoltre un'opzione per limiti rigidi (rigid boundaries) che impedisce all'asse di espandersi quando un
valore fuoriesce dai limiti prestabiliti. Attivarla se un asse fisso è prioritario rispetto
alla visualizzazione dei picchi anomali, e lasciarla disattivata in caso contrario, poiché un grafico rigido
può tagliare un picco al di fuori dell'intervallo visibile. Ciò non cancella il campione
memorizzato. Vedere la [guida di riferimento ai limiti dei grafici di RRDtool](https://rrdtool.org/rrdtool/doc/rrdgraph.en.html).

Per gradi o percentuali in cui i prefissi SI disorienterebbero i lettori, considerare un esponente delle unità pari a 0.
La base 1000 gestisce le grandezze dei prefissi; non disabilita di per sé i prefissi né converte le unità di misura.

### Il consolidamento ha un peso maggiore rispetto al traffico

Un contatore di interfaccia mediato su un'ora fornisce comunque un'indicazione complessiva dell'accaduto.
Una temperatura mediata su un'ora occulta l'escursione critica di dieci minuti.
Assicurarsi che il profilo di memorizzazione collegato a queste origini dati conservi un archivio `MAX`,
e configurare la serie tracciata per consultare la corretta consolidazione `MAX`.
Un massimo in legenda calcolato su una serie `AVERAGE` non recupera il picco originale.

Persino un archivio MAX preserva solo i picchi presenti nei campioni effettivamente raccolti;
non può ricostruire un'escursione verificatasi tra i cicli di polling o valori scartati prima del salvataggio. Vedere
[Gestire la conservazione dei dati](/it/guides/manage-data-retention/) e
[Origini dati e archivi](/it/concepts/data-sources-and-rras/).

## Quando non è presente una MIB fruibile

Molti apparati ambientali utilizzano Modbus, una linea seriale o un'API HTTP,
e il rispettivo agente SNMP non espone elementi utili. Tali apparati necessitano di un input dati basato su script. Lo
script viene eseguito sull'host del poller, non sul dispositivo, e raggiungere il dispositivo è di
competenza dello script. Vedere [Scrivere uno script di raccolta dati](/it/guides/write-a-data-collection-script/) per i dettagli sul
formato di output.

Restituire `U` anziché `0` se un sensore risulta irraggiungibile. Una sonda offline
non è una sonda che misura zero gradi.

## Modalità di errore

| Sintomo | Causa comune |
|---|---|
| La temperatura viene visualizzata dieci o cento volte più elevata | Moltiplicatore del produttore non diviso |
| La temperatura appare dieci volte inferiore | Divisa due volte, una nello script e una nella CDEF |
| Una linea di tensione mostra valori nell'ordine dei miliardi | Intero SNMP senza segno che contiene un valore negativo, non gestito |
| I grafici dei sensori si appiattiscono dopo la sostituzione di una sonda | La tabella si è reindicizzata e l'origine dati punta a un sensore diverso |
| Letture oltre una determinata soglia generano interruzioni | È stato impostato un limite massimo sull'origine dati superato dai valori reali |
| Asse graduato in k o M per letture in gradi | Valore base e configurazione delle unità ereditati da un modello di traffico |
| Un picco risulta invisibile nella vista settimanale | Verificare consolidamento, risoluzione mantenuta, intervallo di polling e campioni scartati |
| Una query non restituisce indici | Verificare OID restituite, parser, restrizioni di accesso e supporto; una radice di colonna può essere valida |
| Le query lmSensors non rilevano nulla su un host Linux | Verificare supporto dell'agente, accessi, righe dei sensori esposte ed errori SNMP precisi |
