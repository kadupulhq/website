---
title: Domande frequenti
description: Risposte sintetiche ai primi quesiti di nuovi arrivati ed utenti attuali di Cacti, con rimando alla pagina di approfondimento per ciascuno.
banner:
  content: Kadupul è in fase pre-alpha. Il codice è disponibile, ma non esistono una versione supportata per la produzione né una migrazione convalidata. Non usarlo in produzione.
sidebar:
  order: 7
---

Risposte brevi. Ciascuna rimanda alla pagina che tratta l'argomento per intero.

## Il progetto

### Posso installarlo oggi stesso?

Il codice sorgente è disponibile per lo sviluppo e per test isolati. Non esiste una versione supportata né una procedura convalidata per l'installazione in produzione.

Le guide di installazione e d'uso richiedono una verifica rispetto al codice effettivamente utilizzato. Vedere [Stato del progetto](/it/project/status/).

### È pronto per l'uso in produzione?

No. Il repository descrive Kadupul come pre-alpha e non pronto per la produzione. Lo stato di rilascio non indica se qualcuno abbia comunque implementato codice di sviluppo.

### È un sostituto per Cacti?

Kadupul è un fork indipendente con priorità di sviluppo e canali di supporto propri. È in fase pre-alpha; una migrazione richiede la convalida per le versioni e le estensioni in uso. Consultare [Provenendo da Cacti](/it/guides/coming-from-cacti/).

### Perché creare un progetto separato?

Kadupul offre uno spazio per sostituire sottosistemi, innalzare i requisiti minimi del linguaggio e modificare le interfacce interne secondo una propria politica di rilascio. Vedere [Perché esiste questo fork](/it/project/why-this-fork/).

### Da quale versione di Cacti è stato effettuato il fork?

L'applicazione deriva da Cacti 1.2.31. Il repository mantiene i rami `main` e `lts/1.2` con diversi obiettivi di rilascio. Consultare [Stato del progetto](/it/project/status/).

### Chi lo gestisce?

Il progetto Kadupul gestisce il repository. Utilizzare l'issue tracker e il [processo di contribuzione](/it/project/contributing/) per le attività del progetto.

### Esistono una roadmap, una cadenza di rilascio o una politica di supporto?

Il repository definisce obiettivi di rilascio, una politica di versionamento e una procedura per contribuire. Non esiste ancora una versione di produzione supportata. Vedere [Stato del progetto](/it/project/status/) per chiarire la differenza tra versioni pianificate e artefatti pubblicati.

### È affiliato con The Cacti Group?

No. Kadupul non è affiliato né approvato da The Cacti Group. Si definisce fork di Cacti poiché si tratta di un'affermazione di fatto sull'origine del codice. Cacti è il loro progetto ed il loro nome.

### Da dove deriva il nome?

Kadupul è il nome singalese di un cactus a fioritura notturna. Cacti prende il nome dalla famiglia botanica; Kadupul è una specie al suo interno. Il nome evidenzia da dove nasce il progetto senza pretendere di rappresentarlo nella sua interezza. Una spiegazione più approfondita si trova in [Cos'è Kadupul](/it/start/what-kadupul-is/).

## Provenendo da Cacti

### I miei plugin funzioneranno?

Questo è l'intento. L'API dei plugin è uno dei quattro obiettivi di compatibilità. Il caricamento e l'esecuzione invariati di un plugin Cacti devono essere dimostrati per le versioni specifiche in uso.

La compatibilità è un obiettivo, non una garanzia assoluta per ogni plugin. Verificare i plugin e le versioni dai quali si dipende effettivamente prima di pianificare una migrazione. Consultare [Compatibilità con Cacti](/it/project/compatibility-with-cacti/) e [Provenendo da Cacti](/it/guides/coming-from-cacti/).

### I miei file RRD continueranno a funzionare?

Preservare lo storico RRD è un obiettivo di compatibilità. I file contengono dati storici che non è possibile rigenerare. Convalidare la lettura dei file esistenti su una copia prima di qualsiasi migrazione.

Qualsiasi migrazione che richieda di scartarli e ricrearli richiede qualcosa che si dovrebbe rifiutare. Vedere [Provenendo da Cacti](/it/guides/coming-from-cacti/).

### I miei modelli e il database verranno trasferiti?

I modelli sono progettati per essere importati senza modifiche. Lo schema è concepito per rimanere riconoscibile e migrabile senza esportazione verso un formato intermedio. Si tratta di obiettivi che richiedono una convalida, così come per i plugin e i file RRD.

### In che modo verranno segnalate le differenze tra Kadupul e Cacti?

Documentandole per iscritto. La situazione sfavorevole che il progetto intende evitare non è la divergenza, che rappresenta il motivo stesso del fork, bensì una divergenza non documentata, che trasforma ogni aggiornamento in un'indagine.

### Funziona con Spine?

Kadupul manterrà un fork di Spine insieme al collettore PHP. La posizione del repository e le build convalidate non sono ancora documentate in questa sede. Spine viene compilato e installato separatamente. L'integrazione ereditata include l'impostazione per `poller_type` e i percorsi, la riga di comando del poller principale, le impostazioni lette da Spine e le tabelle in cui scrive.

Convalidare le versioni di Kadupul e Spine congiuntamente prima del passaggio definitivo. Segnalare eventuali anomalie nell'[issue tracker di Kadupul](https://github.com/kadupulhq/kadupul/issues). Vedere [Spine, il collettore in C](/it/reference/spine/) per le linee guida di configurazione e compilazione.

### Funziona con il proxy RRDtool?

Kadupul non utilizza il demone proxy dell'organizzazione Cacti. Utilizzare l'archiviazione locale di RRDtool. Il documento [Riferimento al proxy RRDtool](/it/reference/rrdproxy/) riporta il protocollo client ereditato; non si tratta di un'opzione di distribuzione supportata. Un sostituto sviluppato da Kadupul dovrà essere creato e convalidato prima di documentare l'implementazione del proxy.

### Di cosa ha bisogno per funzionare?

Un server web con PHP, MySQL o MariaDB, RRDtool e un meccanismo per eseguire il poller secondo una pianificazione. Le versioni e le estensioni necessarie sono riportate in [Requisiti](/it/reference/requirements/).

## Gestione delle licenze

### Sotto quale licenza è rilasciato il software?

GPL-3.0-or-later.

### Cacti indica GPL-2. In che modo un fork può essere rilasciato come GPL-3?

La licenza dell'applicazione ereditata consente l'adozione della GPL versione 2 o successiva. Kadupul adotta l'opzione della versione successiva per la propria distribuzione. Le dipendenze mantengono i rispettivi termini di licenza. Vedere [Licenza](/it/project/license/).

### Qual è la licenza di questa documentazione?

CC BY-SA 4.0. Il codice del sito web resta sotto GPL-3.0-or-later assieme al resto del progetto. Il testo può essere riutilizzato attribuendo il merito al progetto e concedendo quanto realizzato sotto la medesima licenza.

### Da dove provengono queste pagine?

Queste pagine descrivono il comportamento dedotto dal codice sorgente dell'applicazione. Testi di terze parti richiedono una verifica specifica della licenza prima del riutilizzo.

Tale vincolo si applica anche ai contributi. Le modifiche alla documentazione fondano le proprie affermazioni sul codice. Vedere [Come contribuire](/it/project/contributing/).

## Partecipazione

### Come posso segnalare una vulnerabilità di sicurezza?

In modo riservato, tramite le GitHub Security Advisories nel repository interessato. Non aprendo un issue pubblico.

Il codice non ancora rilasciato può essere in uso ed ospitare vulnerabilità. Segnalare privatamente indipendentemente dallo stato della release. Vedere [Politica di sicurezza](/it/project/security/).

### Una vulnerabilità riscontrata qui riguarda probabilmente anche Cacti. Cosa succede?

Segnalarla privatamente a Kadupul, includendo ciò che si conosce sul codice condiviso. I manutentori di Kadupul si occupano dell'analisi e della risoluzione per Kadupul secondo la [politica di sicurezza del repository](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Come posso contribuire?

Leggere [Come contribuire](/it/project/contributing/) e la guida per i contributori nel ramo di riferimento. Discutere le modifiche sostanziali prima di procedere all'implementazione.

### Ho trovato un errore su questo sito.

Ottimo. Ogni pagina è stata redatta analizzando il codice sorgente e qualsiasi imprecisione viene valutata in base ai fatti. Ciascuna pagina dispone di un link per la modifica.
