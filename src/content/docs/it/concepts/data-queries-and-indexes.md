---
title: Query sui dati e indici
description: Come una scansione di un dispositivo diventa molte origini dati, cos'è realmente un indice e cosa accade quando un dispositivo si rinumera.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 5
---

Un'origine dati semplice richiede di sapere cosa si sta misurando prima di configurarla.
Questo funziona per il carico medio del sistema. Non funziona per le porte degli switch,
i dischi, i sensori di temperatura o le macchine virtuali, poiché l'elenco cambia e non
è sotto il vostro controllo.

Una query sui dati individua gli oggetti disponibili. La creazione dei grafici — manuale
o tramite automazione configurata — seleziona quali oggetti ricevono origini dati; l'esecuzione
di una query da sola non genera tutti i grafici possibili.

## Cosa contiene una definizione di query

Una query sui dati è una descrizione XML composta da tre parti: dove risiede l'elenco degli
elementi, cosa leggere per ciascuno di essi e come decidere quale elemento corrisponda a cosa.

La query sulle interfacce fornita con Kadupul costituisce l'esempio pratico. Esegue una scansione
di `.1.3.6.1.2.1.2.2.1.1` per enumerare le interfacce, quindi legge un insieme di campi con nome
in ciascuna posizione restituita. Ciascun campo dichiara una direzione.

| Direzione | Significato | Esempi sulle interfacce |
|---|---|---|
| `input` | Letto per identificazione e denominazione. Non raccolto nel tempo | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Un valore che vale la pena raccogliere a ogni ciclo | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Entrambi | `ifOperStatus`, `ifAdminStatus` |

I campi dichiarano inoltre la modalità di lettura del valore. La maggior parte lo acquisisce
testualmente; alcuni applicano un'espressione regolare per estrarre un numero da un'enumerazione
SNMP, mentre altri richiedono che il valore sia decodificato come testo anziché come byte grezzi.

L'esecuzione della query memorizza una riga per indice e per campo: il dispositivo, la query,
il nome del campo, il valore e la posizione da cui il valore ha avuto origine. Tale tabella
costituisce la risposta alla domanda "cosa possiede questo dispositivo?", memorizzata nella cache
fino all'esecuzione successiva. La selezione dei grafici impiega tale cache, ma gli strumenti di
creazione dei grafici possono anche associare o rieseguire una query. Ispezionate i risultati del
rilevamento prima di aggiungere grafici.

## L'indice è un problema di identità

La posizione in una tabella SNMP non è un nome. È un numero di slot assegnato dall'agente, e gli
agenti riordinano gli slot a seguito di un riavvio, del reinserimento di una scheda, di un aggiornamento
del firmware o di una modifica di configurazione che rimuove un'interfaccia. Se un'origine dati ricorda
soltanto lo "slot 3", il giorno in cui lo slot 3 diventerà una porta differente sarà il giorno in cui
tre mesi di cronologia si collegheranno silenziosamente all'oggetto errato.

Kadupul memorizza il tipo di indice e il valore identificativo, insieme all'indice SNMP attualmente
risolto. La reindicizzazione sfrutta tale identità per risalire alla posizione attuale nella tabella;
i tipi di indice sovrascritti manualmente sono gestiti separatamente.

A ogni esecuzione della query viene cercato lo slot attuale corrispondente al valore di tale campo.

| Esito | Cosa accade |
|---|---|
| Stesso slot | Nulla da fare |
| Slot differente | L'origine dati viene rimappata sul nuovo slot e i relativi grafici la seguono |
| Valore non più presente | La gestione degli orfani dipende dalla query e dal percorso del codice; verificare il flag risultante e gli OID di polling anziché presumere l'interruzione della raccolta |

Di norma, la reindicizzazione preserva l'origine dati e la relativa cronologia. L'opzione
`index_transient` tratta le identità mancanti come previste e tralascia il consueto contrassegno
come orfano. `index_orphan_removal` elimina le voci di polling interessate e l'output di Boost;
non cancella l'origine dati né il file RRD stesso.

L'attuale gestione degli orfani presenta un'anomalia: quando un'identità scompare e nessun'altra
origine muta indice, il ramo privo di variazioni può cancellare nuovamente il contrassegno di orfano,
lasciando invariati l'indice precedente e gli OID di polling. Non fate affidamento sul mascheramento
automatico degli orfani per impedire la raccolta da un indice di porta riutilizzato. Verificate
l'identità memorizzata rispetto ai dati di rilevamento e disabilitate l'origine dati interessata fino
alla risoluzione.

## Scegliere il campo su cui basare la chiave

Non tutti i campi costituiscono una chiave utilizzabile. La definizione della query fornisce una
lista di preferenze ordinata; Kadupul la scorre e seleziona il primo candidato che supera una serie
di controlli.

| Controllo | Motivo della sua esistenza |
|---|---|
| Il campo è `input` o `input-output` | I campi identificativi devono essere disponibili durante il rilevamento |
| Nessun valore è condiviso da due indici | Una chiave duplicata non può identificare una singola riga |
| Il conteggio dei valori distinti è pari al conteggio degli indici | Respinge una copertura incompleta dei candidati |

Tali controlli prevedono eccezioni: un singolo candidato dichiarato viene restituito direttamente,
e l'OID dell'indice grezzo è accettato a parte. `index_type=nonunique` tralascia il rifiuto dei
duplicati, ma non esonera dal controllo sul conteggio dei valori distinti. Esaminate il campo scelto
e i valori memorizzati nella cache; l'etichetta del tipo nel codice XML non è di per sé prova di convalida.

La query sulle interfacce predilige `ifName`, poi `ifDescr`, quindi l'indirizzo hardware e infine
l'indice grezzo. Tale sequenza è intenzionale. `ifName` è breve e stabile sulla maggior parte delle
piattaforme. `ifDescr` è stabile ma a volte reca il numero di slot nel testo, vanificando lo scopo.
L'indice grezzo è posizionato per ultimo poiché basare la chiave su di esso equivale quasi a non averla affatto.

Questo è il passaggio che spesso coglie di sorpresa. La scelta viene effettuata per dispositivo e per
esecuzione, a partire dai dati correnti del dispositivo medesimo. Valori mancanti nella cache o nomi
duplicati possono rendere `ifName` non idoneo e determinare il ripiegamento su `ifDescr`. Un campo
vuoto non dimostra da solo quale verifica sia fallita; esaminate le righe reali del rilevamento. Due switch
identici possono finire indicizzati su campi differenti, e un dispositivo può cambiare campo tra un'esecuzione
e l'altra. Kadupul registra un avviso quando il campo prescelto muta, poiché è in quell'istante che gli
errori di rimappatura diventano possibili.

Il campo prescelto di solito assegna anche il nome ai grafici mediante un formato del titolo che vi fa
riferimento. Se i titoli dei vostri grafici variano di impostazione nell'infrastruttura, il campo di
ordinamento è il punto da cui partire.

## Rilevare che è necessaria una reindicizzazione

Rieseguire una query sui dati per ogni dispositivo a ogni ciclo risulterebbe oneroso e ampiamente
inutile, dato che la maggior parte dei dispositivi non varia numerazione per anni. Ciascuna coppia
dispositivo-query reca invece un metodo di reindicizzazione, che consiste in un'asserzione economica
verificata durante la normale raccolta. Quando l'asserzione fallisce, viene accodata una reindicizzazione.

| Metodo | Cosa verifica | Limiti e costo |
|---|---|---|
| Nessuno | Nessuna asserzione automatica | La riesecuzione delle query deve scaturire da un'azione manuale o esplicita |
| Uptime | Il tempo di attività non è regredito | Richiede SNMP funzionante; non intercetta variazioni prive di ripristino dell'uptime |
| Conteggio indici | Il conteggio attuale corrisponde agli indici nella cache | Un OID di conteggio può essere economico; in sua assenza, l'implementazione conta il risultato di una scansione o di uno script. Variazioni a parità di conteggio possono sfuggire |
| Verifica tutto | I valori chiave noti corrispondono ancora ai rispettivi indici nella cache | Il carico aumenta con le dimensioni della cache; non garantisce l'individuazione di nuovi indici o di variazioni semantiche che preservino tali valori |

«Verifica tutto» controlla le asserzioni durante il polling; non riesegue incondizionatamente l'intera
query di rilevamento a ogni ciclo. Valutatene il costo su dispositivi rappresentativi prima di un impiego
diffuso. L'uptime è un'impostazione predefinita frequente, ma non fornisce alcuna asserzione qualora SNMP
sia disabilitato. La definizione della query può offrire una propria sorgente di uptime o di conteggio.

## La reindicizzazione è asincrona

Un'asserzione fallita non avvia la reindicizzazione seduta stante. Scrive un'istruzione, e un passaggio
separato successivo al ciclo di raccolta la rileva per rieseguire la query. È opportuno tenere a mente
le implicazioni pratiche.

Il ciclo che rileva la modifica può continuare a utilizzare la vecchia cache, cosicché un valore può
finire sulla serie errata prima del completamento della reindicizzazione. La soppressione dei picchi
legata all'uptime sostituisce l'output a valore singolo con "sconosciuto" quando il relativo flag è attivo;
non rappresenta una garanzia per tutti gli output multivalore o per qualunque variazione d'indice.

La reindicizzazione non verrà eseguita per un dispositivo disattivato o non raggiungibile. Un dispositivo
che sia stato rinumerato mentre non era raggiungibile necessita ancora di un'asserzione o di una riesecuzione
esplicita una volta tornato in linea. Il primo ciclo di polling riuscito non prova di per sé che la
rimappatura sia completata. L'opzione `--force` non scavalca i controlli di dispositivo inattivo/disabilitato.

Non appena la query viene rieseguita, per le origini dati spostate vengono riscritte le voci nella
cache del poller, reindirizzando concretamente la raccolta. Tale meccanismo è
[La cache del poller](/it/concepts/the-poller-cache/), e la riesecuzione di una query è tra i pochi
processi che la mantengono in modo automatico.

Per gli aspetti operativi — aggiungere una query a un dispositivo e consultarne i risultati —,
consultate [Monitorare uno switch](/it/guides/monitor-a-switch/).
