---
title: "Perché esiste questo fork"
description: "Priorità indipendenti e criteri di accettazione delle migrazioni per il 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul è pre-alfa. Convalidate le procedure in un’installazione di prova isolata. Bozza di traduzione in attesa di revisione linguistica."
---

Kadupul è un fork indipendente di Cacti con proprie decisioni di sviluppo, rilascio e supporto. Le priorità guidano la pianificazione 2026–2027; non sono date di consegna o prove di idoneità alla produzione.

## Priorità di sviluppo

Il ramo applicativo `main` richiede PHP 8.4+ e combina servizi Symfony 7.4 con percorsi web, poller e CLI preesistenti. La linea di manutenzione `lts/1.2` ha requisiti separati. La migrazione mira a rendere espliciti confini dei casi d’uso, autorizzazione, gestione degli errori e verifica, mantenendo i contratti necessari di raccolta e grafici. Un servizio moderno o test riusciti non provano la migrazione di un intero flusso. Consultate l’architettura.

## Compatibilità e migrazione

Preservare plugin, modelli, schemi e cronologia RRD è un obiettivo di rilascio che richiede prove per versione. Ogni migrazione deve identificare il percorso di scrittura attivo, mantenere le correzioni di manutenzione applicabili e considerare lavoro in coda o in corso. Provate installazione, ripristino e modifiche allo schema su una copia isolata con backup coerenti. Oggi non esiste un percorso convalidato di migrazione in produzione. Consultate compatibilità e stato.

Queste priorità descrivono Kadupul, non i piani di un altro progetto o un accordo con i suoi responsabili. Kadupul non è affiliato a The Cacti Group né approvato da esso.

[Architettura](https://github.com/kadupulhq/kadupul/blob/cbd6117d6e1092ef887c66f9844bef004a65119e/docs/architecture.md) · [Compatibilità](/it/project/compatibility-with-cacti/) · [Stato](/it/project/status/)

Base applicativa verificata il 26 ottobre 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
