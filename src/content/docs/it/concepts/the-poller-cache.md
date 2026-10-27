---
title: La cache del poller
description: Perché il raccoglitore legge un elenco di lavoro precalcolato anziché la configurazione e perché questo è il motivo consueto per cui una modifica sembra non avere effetto.
banner:
  content: Kadupul è in fase pre-alpha. Convalida queste procedure in un'installazione di test isolata.
sidebar:
  order: 6
---

[Architettura](/it/concepts/architecture/) introduce la cache del poller in una sola frase:
l'elenco di lavoro viene precalcolato e il raccoglitore legge quello anziché riesaminare
la configurazione a ogni ciclo. Questa pagina spiega cosa comporta realmente questa scelta.

## Cosa dovrebbe fare altrimenti il raccoglitore

Determinare cosa raccogliere per un singolo valore richiede la risoluzione di un'intera
catena. La sorgente dati punta a un dispositivo e a un modello di dati. Il modello punta
a un input dati. L'input dati dispone di campi, alcuni dei quali sovrascritti per dispositivo
e altri ereditati dal modello. Se la sorgente dati proviene da una query di dati, l'indice
corrente deve essere risolto tramite la cache delle query. Quindi le credenziali SNMP devono
essere estratte dal dispositivo, a meno che un campo non le sovrascriva.

Si tratta di numerosi join per un solo valore. Un'installazione modesta conta decine di
migliaia di valori e un ciclo ogni cinque minuti. Eseguire tale risoluzione al momento della
raccolta significherebbe che il database, e non la rete, deciderebbe quanti dispositivi è
possibile monitorare.

Pertanto la risoluzione avviene una sola volta, quando qualcosa cambia, e il risultato
viene scritto in forma lineare.

## Cosa memorizza la cache

La cache precalcola le istruzioni di raccolta. Riduce la risoluzione ripetuta della
configurazione, ma non elimina i join né la lettura dello stato in tempo reale dei dispositivi.

| Presente nella riga | Perché si trova lì |
|---|---|
| Quale raccoglitore ne è proprietario | Ciascun raccoglitore seleziona solo le proprie righe |
| L'azione: SNMP, script o server di script | Decide quale percorso di codice eseguire |
| Nome host, versione SNMP, porta, timeout, community o credenziali | Campi di connessione memorizzati nella cache; viene letto anche lo stato reale dell'host |
| L'OID o l'intera riga di comando dello script | Già sostituiti, pronti per l'esecuzione |
| Il percorso del file RRD | Già risolto |
| Il nome del campo in quel file e quanti campi compongono una lettura completa | Consente di associare e convalidare l'output |
| Il passo (step) e un conto alla rovescia fino alla successiva scadenza | Vedere [Tempo e intervalli](/it/concepts/time-and-intervals/) |

`cmd.php` unisce `poller_item` a `host`, esclude i dispositivi disabilitati e utilizza
i campi in tempo reale del dispositivo per i controlli di disponibilità e reindicizzazione.
Gli OID memorizzati nella cache, i comandi e i metadati RRD devono comunque corrispondere
alla sorgente dati prevista.

Le credenziali memorizzate nella cache sono un'istantanea, ma il salvataggio delle
credenziali modificate tramite l'API del dispositivo normalmente aggiorna la cache
interessata. Le modifiche dirette al database aggirano tale percorso e possono lasciare
un'istantanea obsoleta. Verificare la cache effettiva anziché dare per scontato che ogni
modifica alle credenziali richieda una ricostruzione manuale.

Anche il percorso RRD è un'istantanea. Lo spostamento dei file o la modifica della loro
posizione lascia ogni riga memorizzata nella cache che punta alla vecchia posizione.

## Cosa la scrive

La cache viene mantenuta in modo incrementale dalle operazioni consapevoli di aver
apportato una modifica.

| Operazione | Righe riscritte |
|---|---|
| Salvataggio di un dispositivo | Le modifiche ai campi di connessione, al raccoglitore o allo stato disabilitato attivano una propagazione; i campi di raccolta invariati possono utilizzare il percorso di salvataggio rapido |
| Salvataggio di una sorgente dati | Le righe di quella sorgente dati |
| Creazione di grafici e sorgenti dati da un modello | Le righe appena create |
| Un'esecuzione di query dati che ha spostato o risolto un indice | Solo le sorgenti dati modificate |
| Ricostruzione da CLI | Dispositivi abilitati elaborati dai relativi worker; l'attuale difetto di inoltro di `--host-id` impedisce di fare affidamento sull'isolamento del dispositivo |

La riscrittura non è un inserimento cieco. Le righe relative alle sorgenti dati in fase
di ricostruzione vengono prima contrassegnate come assenti, quindi viene scritto il nuovo
insieme e infine viene eliminato tutto ciò che risulta ancora contrassegnato come assente.
Questo è il meccanismo che rimuove le righe per un campo che non esiste più. La pulizia del
buffer è delimitata dagli ID del raccoglitore e della sorgente dati. Ciò protegge le sorgenti
non correlate nel normale percorso mirato; non è una garanzia in caso di ricostruzioni
simultanee o scritture su database non riuscite. Verificare le righe risultanti dopo una
ricostruzione, includendo un dispositivo vicino non interessato durante l'analisi dell'ambito.

## Righe che non vengono mai scritte

Alcune configurazioni non producono alcuna nuova riga nella cache. Controllare sia i
registri che il grafico.

Il generatore salta i dispositivi disabilitati, ma l'azione di massa **Disabilita**
mantiene le righe della cache esistenti e la raccolta esclude il dispositivo. Una
ricostruzione mentre il dispositivo è disabilitato può rimuovere le righe. L'azione di
massa **Abilita** riutilizza una cache popolata o la inizializza quando è vuota; un
salvataggio aggiuntivo del dispositivo generalmente non è necessario. Una cache esistente
parziale o obsoleta richiede comunque un'indagine.

Un elemento SNMP il cui dispositivo non ha una configurazione SNMP utilizzabile non
produce alcuna riga. L'assenza di versione, una versione fuori intervallo o una community
vuota nella versione 1 o 2 fa sì che la riga venga saltata anziché scritta come voce che
fallirebbe a ogni ciclo.

Quando è configurata una whitelist di input, un file mancante o un input rifiutato
impedisce la creazione di nuove righe per quell'input. Una ricostruzione completata
elimina comunque le relative righe obsolete. Senza una configurazione `input_whitelist`,
questo controllo ammette gli input; non è una protezione sempre attiva. Esaminare il
comando rifiutato e i criteri configurati prima di modificare la whitelist.

L'interfaccia può ancora mostrare una sorgente dati la cui cache è vuota. Il relativo
grafico può mantenere lo storico precedente o mostrare interruzioni; una linea piatta
sullo zero non è un indicatore affidabile. Le credenziali mancanti e gli input rifiutati
sono condizioni di configurazione da risolvere.

## Perché una modifica può sembrare non fare nulla

Tre meccanismi diversi producono lo stesso sintomo.

**La riga non è stata ricostruita.** È stato modificato un elemento che l'interfaccia
non considera influente sulla raccolta, oppure la modifica è avvenuta all'esterno
dell'interfaccia. La cache conserva ancora la risposta precedente. Una ricostruzione
può aggiornare i campi memorizzati nella cache dopo aver verificato la configurazione prevista.

**La riga non è mai stata creata.** Trattato sopra. Anche una ricostruzione risolve
questo problema, ma solo dopo aver corretto la condizione di base; le indicazioni
diagnostiche appaiono spesso nei log anziché sul grafico.

**Il valore viene raccolto e quindi scartato.** L'output a più valori viene mappato
tramite le definizioni dei campi del modello e i campi non referenziati possono essere
tralasciati durante l'analisi. Controllare i nomi dei campi previsti, le mappature e le
associazioni ai grafici; questa regola non scarta indiscriminatamente tutti i campioni
numerici privi di riferimento grafico. Una ricostruzione della cache non può correggere
un contratto di output errato.

## Lo strumento drastico

Per un singolo dispositivo, utilizzare **Ripopolare la cache del poller** nella relativa
pagina legacy del dispositivo. Tale azione richiama il percorso `push_out_host()` limitato
al dispositivo. Controllare successivamente le righe risultanti e i dati diagnostici.

L'attuale script principale `rebuild_poller_cache.php` accetta `--host-id`, ma non
inoltra tale filtro al comando del worker. Una presunta ricostruzione da CLI per un
singolo dispositivo può quindi ricostruire anche altri dispositivi abilitati. Non fare
affidamento su tale opzione per l'isolamento fino a quando questo difetto dell'applicazione
non sarà corretto.

Una ricostruzione generale tramite CLI è disponibile dalla cartella principale
dell'applicazione, eseguita come utente del poller:

```bash
php cli/rebuild_poller_cache.php
```

Elabora i dispositivi abilitati; non è una riparazione per ogni sorgente priva di host o
disabilitata. Questa operazione scrive nelle tabelle di raccolta e può richiedere del tempo.
Evitare ricostruzioni sovrapposte e non interrompere il processo. L'argomento `--force`
della CLI sovrascrive il controllo di registrazione del processo e pertanto non è un'opzione
di ripristino ordinaria.

La ricostruzione aggiorna gli stati derivati; non ripristina la raggiungibilità dei
dispositivi, non sposta i file RRD, non corregge i comandi di input rifiutati né recupera
lo storico perso. Esaminare la cache risultante, i registri e la raccolta successiva
prima di considerare concluso il ripristino.

Kadupul registra il momento dell'ultima modifica della cache, consentendo ad altre parti
del sistema di rilevare la necessità di rileggerla.

## Raccoglitori multipli

In presenza di più raccoglitori, ciascuna riga appartiene esattamente a uno di essi e le
righe vengono trasmesse sia al database locale di quel raccoglitore sia a quello centrale.

Se un raccoglitore remoto non è raggiungibile quando si salva una modifica, la modifica
viene registrata a livello centrale e non da remoto, e Kadupul lo segnala: richiede una
sincronizzazione completa non appena il raccoglitore torna attivo. Fino a tale
sincronizzazione, il raccoglitore remoto esegue un elenco di lavoro più vecchio rispetto
a quello mostrato dall'interfaccia. Una discrepanza specifica del raccoglitore è motivo
per esaminare lo stato di replica, la connettività e la cache locale di ciascun raccoglitore.

L'ordine in un ciclo completo, compreso il punto in cui la cache viene letta e il momento
in cui vengono eseguiti i comandi di reindicizzazione, è descritto in
[Ciclo di vita del poller](/it/reference/poller-lifecycle/). Per il ridimensionamento dei
raccoglitori, vedere [Scalare il poller](/it/guides/scale-the-poller/).
