---
title: Individuare i dispositivi automaticamente
description: Eseguire la scansione di un intervallo di rete, associare i dispositivi rilevati a un modello e consentire alle regole di creare grafici e rami dell'albero, mantenendo disabilitata la creazione di dispositivi per il passaggio iniziale.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 15
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di
affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

L'automazione si compone di due meccanismi distinti facili da confondere. L'individuazione (discovery) percorre
un intervallo di indirizzi e stabilisce cosa sia un dispositivo. Le regole decidono cosa costruire per un
dispositivo una volta che questo esiste. È possibile eseguire ciascun meccanismo separatamente, e la maggior parte dei danni
arrecati dagli utenti con l'automazione deriva dall'attivare entrambi contemporaneamente, scoprendo solo
in seguito le conseguenze.

## Definire l'intervallo

Un intervallo di rete è un elenco separato da virgole. Ciascuna voce assume una di tre forme.

| Forma | Esempio | Note |
|---|---|---|
| CIDR | `192.168.1.0/24` | Accetta anche una maschera decimale puntata, `192.168.1.0/255.255.255.0` |
| Carattere jolly | `192.168.*.*` | Convertito internamente nel CIDR equivalente |
| Indirizzo singolo | `192.168.1.10` | Scansiona esattamente quell'indirizzo |

Gli intervalli di inizio-fine formulati come `192.168.1.10-192.168.1.50` vengono rifiutati con un
errore. Non sono supportati.

Utilizzare intervalli non sovrapposti, anche tra reti che possono essere scansionate contemporaneamente.
La tabella di lavoro possiede una chiave univoca globale sull'indirizzo IP; un duplicato può
rifiutare un intero batch di inserimento, omettendo gli altri indirizzi di quel blocco. Vedere il
[problema #207](https://github.com/kadupulhq/kadupul/issues/207).

Tutto funziona su IPv4. I calcoli dell'intervallo impiegano conversioni a numeri interi a 32 bit,
pertanto qui non esiste un percorso IPv6.

Gli indirizzi di rete e di broadcast sono esclusi. Un `/24` scansiona 254 indirizzi, da
`.1` a `.254`. Una voce a indirizzo singolo ne scansiona uno solo. Anche gli indirizzi il cui ultimo ottetto è 255
vengono saltati durante la scansione.

Prima che una scansione si avvii, ciascun indirizzo dell'intervallo viene scritto in una tabella di lavoro, una
riga per indirizzo, e i thread prelevano righe da essa. Un `/16` scrive 65534 righe prima
del primo ping. Questo rappresenta un carico rilevante, ed è il motivo per cui la scansione di un intervallo ampio e vuoto
è lenta anche quando nessun host risponde.

Associare un set di opzioni SNMP a ogni intervallo. La modalità master registra un errore e salta
un intervallo il cui ID del set SNMP sia pari a zero. Un'esecuzione mirata non applica tale protezione;
avviarla direttamente non rende utilizzabili le opzioni SNMP mancanti.

## Regolare il ritmo della scansione

| Impostazione | Funzione | Valore predefinito |
|---|---|---|
| Discovery Threads | Worker paralleli che prelevano indirizzi | 1 |
| Run Limit | L'individuazione viene interrotta dopo questo tempo | 20 minutes |
| Schedule Type | Manuale, giornaliero, settimanale, mensile o mensile in un giorno fisso | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP o SNMP | Dalle impostazioni globali |
| Ping Retries, Timeout | Costo di errore per indirizzo | Dalle impostazioni globali |

I thread e il limite di esecuzione interagiscono male se non calibrati. Cinquanta thread
su un `/16` equivalgono a una scansione delle porte per qualunque sistema di rilevamento intrusioni.
Un singolo thread sullo stesso intervallo raggiungerà il limite di esecuzione e verrà terminato a metà,
lasciando un risultato parziale che appare completo.

Dimensionare l'intervallo in modo che una scansione termini entro il limite con un numero di thread
tollerabile dalla rete. Diversi intervalli contenuti sono preferibili a uno esteso, poiché ciascuno ottiene una propria
pianificazione e un proprio limite.

## Cosa esegue la scansione per ogni indirizzo

1. Risoluzione di un nome. I server DNS alternativi possono essere indicati come elenco separato da spazi; se
   non ne viene impostato alcuno, viene utilizzato il resolver locale del poller. La ricerca NetBIOS è un'opzione
   di riserva quando il DNS non restituisce nulla.
2. Verifica se l'indirizzo o quel nome corrispondano già a un dispositivo. In caso affermativo, l'indirizzo viene
   segnato come completato. Ciò sopprime un dispositivo esistente individuato tramite tali valori; non costituisce
   comunque una garanzia contro la creazione concorrente o alias divergenti.
3. Esecuzione del ping mediante il metodo configurato. Il metodo SNMP elude il ping separato.
4. Se il ping risponde o se è selezionato il metodo SNMP, tentare SNMP e raccogliere `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` e l'uptime.
5. Confrontare i dati di sistema raccolti con le regole dei dispositivi.

Un indirizzo che risponde al ping ma non a SNMP viene registrato come trovato e attivo. Un
indirizzo che risponde a SNMP ma non corrisponde ad alcuna regola viene registrato come trovato, unitamente ai suoi
dati di sistema, e non viene creato nulla. Entrambi finiscono nell'elenco dei dispositivi individuati.

La soppressione dei duplicati è attiva per impostazione predefinita. Se un `sysName` è già stato rilevato su
un altro indirizzo nei record di discovery memorizzati di questa rete, o appartiene a un dispositivo con un
diverso hostname, l'indirizzo viene ignorato. È l'impostazione ideale per un router dotato di molte
interfacce con indirizzo e inadatta per apparati identici dietro indirizzi NAT distinti;
è proprio per disattivare questo comportamento che esiste l'opzione per lo stesso sysName.

I dispositivi esistenti possono richiedere la rielaborazione delle proprie query di dati durante una scansione. Ciò è disattivato
per impostazione predefinita e si applica ai dispositivi registrati come attivi o in recupero. L'individuazione utilizza il loro
stato memorizzato per questa decisione; non interroga nuovamente da zero un dispositivo esistente.

## Le regole dei dispositivi decidono il modello

Una regola di dispositivo associa i dati di sistema a un modello di dispositivo. Ciascuna regola contiene un criterio per
`sysDescr`, `sysObjectID` e `sysName`. Il motore di confronto filtra su ciascun campo di sistema
restituito come non vuoto dal dispositivo; i criteri vuoti corrispondono a qualsiasi valore. Le regole
vengono valutate in ordine sequenziale e prevale la prima corrispondenza.

Utilizzare sottostringhe letterali semplici e verificare il modello selezionato nei risultati dell'individuazione.
L'attuale matcher SQL racchiude i pattern regex tra caratteri letterali `/`,
quindi un pattern ancorato come `^Linux.*fixture$` fallisce anche quando l'operatore regex del database
vi corrisponderebbe direttamente. Il ripiego della sottostringa non risolve tale problema. Vedere il
[problema #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE`
tratta inoltre `%` e `_` come caratteri jolly.

Nessuna corrispondenza equivale a nessun dispositivo. L'indirizzo viene registrato nell'elenco dei dispositivi individuati
con tutti i dati di sistema raccolti, ed è in quell'elenco che è possibile compilare la regola
mancante.

Collocare le regole specifiche al di sopra di quelle generali. Una regola che corrisponde alla sottostringa `Linux`
posizionata sopra una regola del produttore assegnerà ogni appliance che menziona Linux nella propria
descrizione.

## Visualizzare l'anteprima dell'individuazione prima di abilitare la creazione

Il comando per la creazione di dispositivi su un nuovo intervallo è disabilitato per impostazione predefinita. Mantenerlo disattivato
per la scansione iniziale e disabilitare l'opzione per rieseguire le query di dati dei dispositivi esistenti.
Questo passaggio aggiorna comunque i record di individuazione, le statistiche di scansione e i log, e può inviare
le notifiche configurate. Non simula l'esecuzione delle regole per grafici o alberi.

Eseguire la scansione, quindi consultare l'elenco dei dispositivi individuati. Mostra i rilevamenti memorizzati,
i dati SNMP raccolti e il modello associato, se disponibile. I dispositivi
esistenti, i duplicati soppressi e gli indirizzi ignorati non devono necessariamente comparirvi.
Esaminare sia l'output di debug per singolo indirizzo sia l'elenco.

Forzare una scansione dalla riga di comando anziché attendere una pianificazione:

```bash
php poller_automation.php --network=3 --force --debug
```

Il flag di debug stampa le decisioni per ogni indirizzo in tempo reale. Il processo master,
che avvia gli intervalli abilitati giunti a scadenza, costituisce una modalità separata:

```bash
php poller_automation.php -M
```

Il comando mirato con `--force` esegue anche una rete disabilitata. L'aggiunta di `--force` alla
modalità master elude il controllo della pianificazione e può avviare anche reti disabilitate.
Utilizzare la modalità mirata durante la convalida di un singolo intervallo.

Verificare tre elementi nel risultato prima di abilitare la creazione:

- Il conteggio dei dispositivi corrisponde alle aspettative. Un numero nettamente superiore al proprio inventario
  indica solitamente che l'intervallo è più ampio del previsto.
- I modelli selezionati sono corretti. Una colonna con lo stesso modello generico ovunque
  significa che le regole non stanno intercettando i dispositivi.
- Non mancano apparati critici. Per un dispositivo assente, verificare l'espansione dell'intervallo, il completamento dei worker,
  la soppressione di duplicati e dispositivi esistenti, la politica di ping e i risultati SNMP.
  La sola assenza dall'elenco non dimostra che il dispositivo sia irraggiungibile.

## Regole per grafici e alberi

Non appena un dispositivo esiste, le regole per i grafici e per gli alberi stabiliscono cosa costruire al suo interno.
L'individuazione può richiamare tale automazione dopo la creazione di un dispositivo, e la CLI può
applicarla ai dispositivi esistenti. Le singole regole per grafici e alberi devono essere abilitate.
Gli interruttori globali di automazione per grafici/alberi governano hook di creazione specifici;
non rappresentano un divieto assoluto all'automazione esplicita via CLI.

Una regola di grafico si compone di tre parti: a quali dispositivi si applica, a quali indici individuati
all'interno di una query di dati si applica, e quale tipo di grafico creare. Entrambe le sezioni
di corrispondenza sono costituite da elementi di regola, dove un elemento comprende un campo, un operatore e un
criterio, uniti da `AND` o `OR` con parentesi.

| Gruppo operatori | Membri |
|---|---|
| Sottostringa | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Uguaglianza | matches, is not equal to |
| Numerico | is less than, less than or equal, greater than, greater than or equal |
| Presenza | is unknown, is not unknown, is empty, is not empty |
| Pattern | matches regular expression, does not match regular expression |

Questi elementi confluiscono in una clausola SQL `WHERE`. Gli operatori per espressioni regolari seguono il
dialetto regex del database, non PCRE; un pattern che funziona in
`preg_match` non funzionerà necessariamente qui. I confronti numerici rispetto a criteri
numerici vengono passati senza virgolette; tutto il resto viene racchiuso tra virgolette e il database
applica le proprie regole di conversione del tipo. Verificare i filtri numerici sui valori effettivamente memorizzati
in cache; tali valori vengono normalmente salvati come testo. Gli operatori di sottostringa utilizzano SQL `LIKE`,
in cui `%` e `_` fungono da caratteri jolly.

È opportuno comprendere due comportamenti prima di effettuare il debug di una regola inattiva:

**Un filtro dispositivo/oggetto vuoto non corrisponde a nulla, ma un filtro indice vuoto
corrisponde a tutti gli indici in cache.** Il filtro di selezione del dispositivo ripiega su una condizione falsa
in assenza di elementi. Tuttavia, una volta che una regola di grafico trova corrispondenza con un dispositivo,
rimuovere tutte le sue condizioni di indice lascia la query di dati priva di filtri.
Ad esempio, rimuovere la condizione `ifDescr = eth0` può creare anche un grafico per `lo`.
Disabilitare la regola durante la modifica delle relative condizioni di indice.

**Una regola che richiama un campo non rilevato dal dispositivo viene abbandonata.** Se una
regola applica un filtro su un campo di query di dati non presente nella cache del dispositivo, l'esecuzione registra
un avviso indicando il campo e interrompe l'elaborazione di quella regola per quel dispositivo. La causa
comune è una regola formulata per una query di dati ed eseguita su un dispositivo la cui
query ha restituito un insieme differente di campi.

La pagina di modifica delle regole elenca gli oggetti e i grafici candidati. Esaminare tali elenchi prima
di abilitare una regola e dopo averla modificata. Si tratta di anteprime di selezione e non di una prova
completa di esecuzione: i controlli delle origini dati, il rilevamento dei grafici esistenti, gli hook di creazione
e l'inserimento nell'albero avvengono comunque durante l'esecuzione. La CLI non offre opzioni di simulazione.

Le regole dell'albero offrono tipi di foglia separati per dispositivi e grafici, nonché un albero
di destinazione e un nodo padre selezionati. I passaggi di intestazione possono impiegare stringhe fisse o valori
tratti dai campi di dispositivi/grafici. Le intestazioni derivate dai campi applicano una sostituzione regex PHP senza distinzione tra maiuscole e minuscole;
le sequenze letterali `\n` nel risultato lo suddividono in successive intestazioni nidificate.
Questa sintassi di sostituzione differisce dalle regex SQL adoperate per la corrispondenza degli oggetti.
Le intestazioni e le foglie esistenti vengono riutilizzate sul medesimo albero e padre; modificare il
percorso può aggiungere una nuova collocazione senza eliminare la precedente.

## Applicare regole a dispositivi già esistenti

L'individuazione non è l'unico punto di accesso. Le regole possono essere eseguite su dispositivi già presenti
nel sistema, selezionati in base a ID, nome host o descrizione:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Il nome host e la descrizione vengono confrontati come espressione regolare se il valore è valido,
e sempre anche come sottostringa. È richiesto almeno uno dei tre selettori;
richiamare il comando senza selettori genera un errore. Quando i selettori vengono combinati,
sono uniti da `AND`. Utilizzare ID di dispositivo positivi separati da spazi per una selezione
mirata; gli ID separati da virgole non sono supportati. I pattern possono rimanere ampi,
e il meccanismo di fallback SQL `LIKE` tratta `%` e `_` come caratteri jolly.

La query del selettore non esclude automaticamente i dispositivi disabilitati. L'opzione `--debug`
aggiunge messaggi diagnostici ma esegue comunque le creazioni. L'assenza di dispositivi corrispondenti costituisce una no-op
completata con successo, pertanto lo stato di uscita da solo non attesta che sia stato creato qualcosa.

Per ogni dispositivo corrispondente, l'elaborazione svolge tre azioni in ordine:

1. Tenta la creazione per i modelli di grafici collegati privi di grafico sul
   dispositivo, nel rispetto dell'idoneità del modello e dei controlli delle origini dati.
2. Esegue le regole dei grafici abilitate per le query di dati associate mediante la rispettiva cache degli indici
   memorizzata. Questo passaggio non riesegue l'individuazione in autonomia; aggiornare prima la query di dati
   se la cache risulta assente o non aggiornata.
3. Applica le regole dell'albero per foglie di dispositivo abilitate.

La creazione di nuovi grafici può richiamare regole dell'albero per foglie di grafici quando l'automazione
globale dell'albero è abilitata. La CLI non riapplica tali regole ai grafici che trova già
creati. Pertanto, una regola per foglia di grafico nuova o modificata non esegue il backfill sui grafici
esistenti per il solo fatto di aver rieseguito la CLI. Vedere il
[problema #211](https://github.com/kadupulhq/kadupul/issues/211). Verificare la loro collocazione
separatamente; non eliminare e ricreare grafici storici al solo scopo di attivare l'hook di creazione.

Le esecuzioni successive sopprimono un grafico non indicizzato esistente in base a dispositivo e modello di grafico.
I grafici indicizzati vengono verificati per dispositivo, query di dati, tipo di grafico e indice. Ciò
impedisce creazioni duplicate in esecuzioni sequenziali; non costituisce una garanzia contro la concorrenza.
Verificare l'elenco dei grafici e l'albero al termine, insieme ai messaggi di log `AUTOM8` relativi a
grafici saltati, dati non validi o errori di creazione.

Un elemento viene ignorato in modo abbastanza silenzioso da generare confusione: un modello di grafico con un campo
contrassegnato come sostituibile privo di valore predefinito non è idoneo all'automazione. L'esecuzione
registra che non è stato aggiunto poiché un campo sostituibile non ha un valore predefinito, e prosegue
oltre. Se un modello atteso non compare mai, questa è la prima verifica da compiere. Vedere
[Modelli](/it/concepts/templates/) per chiarimenti sui campi sostituibili.

## Trabocchetti

**La disabilitazione di una regola non ne annulla il lavoro.** Non rimuove i grafici o le voci
dell'albero già creati. L'eliminazione del dispositivo prevede comportamenti di pulizia distinti per
grafici e origini dati; esaminare le opzioni di eliminazione prima di rimuovere un dispositivo.

**Una scansione interrotta appare come una scansione regolare.** Il limite di esecuzione termina
l'individuazione nel punto in cui è arrivata. I totali registrati corrispondono alle operazioni effettivamente
portate a termine, e nulla contrassegna il risultato come parziale. Confrontare il numero di indirizzi scansionati
con le dimensioni dell'intervallo.

**Le regole agiscono sulla cache della query di dati, non sul dispositivo.** Una regola di grafico
che non corrisponde a nulla significa spesso che la query di dati non è mai stata eseguita, o è stata eseguita senza trovare indici.
Controllare la tabella degli indici rilevati prima di riformulare la regola.

**L'e-mail di notifica include sia i rilevamenti esistenti che quelli nuovi.** Un intervallo può inviare un messaggio
al completamento, raggruppando i rilevamenti a seconda che ciascun IP figurasse o meno
nello snapshot preliminare. Ciò non prova che ogni indirizzo richiesto sia stato effettivamente scansionato.

## Modalità di errore

| Sintomo | Causa comune |
|---|---|
| La scansione non trova nulla su un intervallo popolato | Ping bloccato, errore SNMP, esclusioni o soppressione duplicati |
| L'intervallo rifiuta la scansione, errore nei log | Nessun set di opzioni SNMP associato |
| Dispositivi rilevati ma nessuno creato | Interruttore di creazione disattivato o nessuna regola di dispositivo coincidente |
| Tutti i dispositivi ricevono il medesimo modello generico | Ordine delle regole, con una regola generica prima di quelle specifiche |
| Scansionata solo una porzione degli indirizzi | Limite di esecuzione raggiunto, o intervalli sovrapposti hanno respinto un blocco |
| Un dispositivo per router anziché uno per interfaccia, o viceversa | Impostazione di soppressione duplicati per lo stesso sysName |
| La regola non intercetta nulla e il log segnala una colonna | La regola filtra su un campo che la query di dati non ha restituito |
| Modello di grafico mai creato dalla regola | Valore predefinito obbligatorio assente, output non valido dell'origine dati o errore di creazione |
| Grafici imprevisti per interfacce supplementari | Filtro indice del grafico vuoto o più generico del previsto |
| Una nuova regola dell'albero non colloca i grafici esistenti | La CLI non applica retroattivamente le regole foglia-grafico ai grafici preesistenti |
