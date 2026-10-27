---
title: Come contribuire
description: Di cosa ha bisogno il progetto, gli standard ingegneristici a cui si conformano le modifiche e i criteri in base ai quali vengono valutate.
banner:
  content: Kadupul è in fase pre-alpha. Il codice è disponibile, ma non esistono una versione supportata per la produzione né una migrazione convalidata. Non usarlo in produzione.
sidebar:
  order: 6
---

Il codice sorgente è disponibile e il repository documenta una procedura di contribuzione. Leggere [CONTRIBUTING.md](https://github.com/kadupulhq/kadupul/blob/main/CONTRIBUTING.md) prima di iniziare. Discutere le modifiche sostanziali nell'issue tracker prima dell'implementazione.

## Lo standard

Mantenere ogni pull request focalizzata su un unico scopo. Riprodurre un bug prima di risolverlo, verificare il comportamento modificato e includere i comandi di convalida e i risultati. Preservare le interfacce pubbliche a meno che la modifica non includa una migrazione documentata.

## Standard ingegneristici

Seguire le regole stabilite per il ramo su cui si sta lavorando. Controllare la guida per i contributori e la configurazione CI correnti, anziché presumere che entrambi i rami utilizzino le stesse regole.

### Stile

Su `main`, i file PHP modificati seguono le linee guida PHP-FIG PER-CS 2.0. Riformattare ciascun file interessato in un commit separato dedicato esclusivamente agli spazi vuoti e verificarlo con `tests/tools/check_php_style.sh`. Il ramo `lts/1.2` mantiene la formattazione a monte.

### Analisi statica

Eseguire i controlli richiesti dal ramo di destinazione. Questo sito non prescrive un livello PHPStan, un'interfaccia di registrazione o una migrazione di caricamento automatico che il repository non abbia adottato.

### Test

Verificare il comportamento modificato dalla patch. Includere un caso di regressione per la correzione di un bug e mostrare i comandi utilizzati. Il superamento di test non correlati non convalida la correzione.

### Dipendenze

Spiegare perché una dipendenza è necessaria, verificarne la licenza e aggiornare il manifest e il file di blocco corrispondenti. Seguire le regole del repository in materia di dipendenze e convalida.

### Commit e pull request

Utilizzare i Conventional Commits e firmare ogni commit con `git commit -s` in base al [Developer Certificate of Origin](https://developercertificate.org/). Separare la formattazione dai cambiamenti di comportamento affinché ciascuno possa essere esaminato in modo indipendente.

## L'albero ereditato non soddisfa questi standard

L'albero contiene convenzioni di formattazione e pattern di implementazione ereditati. L'adeguamento è regolato dalle norme del ramo di destinazione, non da una riscrittura indiscriminata del progetto.

### Quale regola prevale?

Seguire il file `CONTRIBUTING.md` del ramo di destinazione. Su `main`, si applica la regola PER-CS per i file modificati; su `lts/1.2`, mantenere lo stile ereditato.

## Documentazione

Verificare le affermazioni a fronte dell'implementazione e utilizzare materiale la cui licenza ne consenta l'inclusione. Non copiare testi di terze parti senza verificarne la licenza. Segnalare i problemi di sicurezza tramite la [procedura di segnalazione riservata](/it/project/security/).

## Compatibilità

Interfacce per plugin, modelli, compatibilità del database e dati RRD rappresentano obiettivi di rilascio. Documentare qualsiasi modifica all'interfaccia e fornire prove di migrazione e compatibilità. Consultare [Compatibilità con Cacti](/it/project/compatibility-with-cacti/).
