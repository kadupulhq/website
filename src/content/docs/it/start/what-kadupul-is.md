---
title: "Che cos’è Kadupul"
description: "Interroga i dispositivi tramite SNMP e script, conserva le misurazioni nei file RRD e crea grafici."
banner:
  content: "Kadupul è in fase pre-alpha. Il codice è disponibile, ma non esistono una versione supportata per la produzione né una migrazione convalidata. Non usarlo in produzione."
---

Kadupul è una derivazione indipendente di Cacti. Interroga i dispositivi a intervalli regolari e usa RRDtool per conservare e rappresentare le misurazioni.

Questa pagina è un riepilogo. Consulta la pagina completa in inglese per i dettagli. [English](/start/what-kadupul-is/)

## Che cos’è Kadupul

PHP fornisce l’interfaccia e il programma di installazione. MySQL o MariaDB conserva configurazione, utenti e cache del raccoglitore. I file RRD conservano le misurazioni secondo i periodi di conservazione e le regole di consolidamento configurati, non tutti i dati per sempre. Gli script di raccolta vengono eseguiti con i permessi del proprio account di sistema.

## Primi passi

Inizia con un’installazione di prova isolata, aggiungi un dispositivo e verifica che arrivino dati prima di interpretare i grafici. Conserva copie di sicurezza e prova il ripristino.

- [Installazione](/it/start/install/)
- [Aggiungere il primo dispositivo](/it/start/first-device/)
- [Interpretare il primo grafico](/it/start/first-graph/)
