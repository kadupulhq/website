---
title: "Che cos’è Kadupul"
description: "Raccolta, archiviazione, architettura e limiti del progetto per pianificare il 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul è in fase pre-alfa. Convalidate le procedure in un’installazione di prova isolata. Bozza di traduzione in attesa di revisione linguistica."
---

Kadupul è un’applicazione di monitoraggio di rete e creazione di grafici. Raccoglie misure tramite SNMP e script, conserva serie temporali nei file RRD e genera grafici con RRDtool. Questa panoramica è stata verificata il 26 ottobre 2026 sulla revisione dell’applicazione indicata di seguito.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Stato del progetto per il 2026–2027

Kadupul è in fase pre-alfa, senza una versione supportata in produzione né un percorso convalidato di migrazione alla produzione. Usate un’installazione di prova isolata. Le date nella documentazione servono alla pianificazione e non sono impegni di consegna. Controllate lo stato del progetto prima di scegliere una revisione da valutare.

[Stato del progetto](/it/project/status/)

## Raccolta e pianificazione

Un pianificatore esterno avvia il poller. Questo legge un elenco di raccolta preparato, richiama il raccoglitore PHP o una compilazione compatibile di Spine e tratta i risultati. Gli intervalli di raccolta sono configurabili; cinque minuti è un esempio, non una regola universale. Un meccanismo di avvio può eseguire più cicli brevi nel proprio intervallo. Timeout, tentativi e latenza dei dispositivi consumano quel tempo disponibile.

[Ciclo del poller](/it/reference/poller-lifecycle/)

## Conservazione e archiviazione

La struttura di archiviazione di un file RRD è scelta alla creazione. Le misure recenti possono mantenere più dettagli dei valori consolidati più vecchi; la conservazione è limitata dagli archivi configurati. Non mantiene ogni campione per sempre. I valori sconosciuti rappresentano osservazioni mancanti o inutilizzabili, non zero. Code, log e statistiche del database possono crescere anche se i file RRD esistenti mantengono dimensioni fisse.

[Sorgenti dati e archivi](/it/concepts/data-sources-and-rras/)

## Grafici e termini comuni

Un dispositivo è un endpoint monitorato. Una query di dati scopre elementi come le interfacce. Una sorgente dati descrive una misura e la sua archiviazione; un grafico descrive come rappresentarla. I modelli riutilizzano definizioni e gli alberi organizzano la navigazione. Sono record separati: controllate le opzioni di eliminazione e le dipendenze prima di rimuoverli. I grafici sono generati su richiesta dai dati conservati; la cache delle immagini può riutilizzare un risultato già renderizzato.

[Glossario](/it/reference/glossary/)

## Componenti dell’installazione

Un’installazione funzionante combina applicazione web PHP, MySQL o MariaDB, archiviazione RRD, RRDtool e un meccanismo di avvio della raccolta. Credenziali dei dispositivi e configurazione risiedono nel database o in file protetti. Salvate codice, configurazione, code del database e cronologia RRD come un insieme coerente, poi provate il ripristino. Un dump del solo database non ripristina i grafici storici.

[Backup e ripristino](/it/guides/back-up-and-restore/)

## Main e la migrazione Symfony

Il ramo `main` dell’applicazione richiede PHP 8.4 o successivo e combina servizi Symfony 7.4 con punti di ingresso web, poller e CLI preesistenti. La linea di manutenzione `lts/1.2` ha requisiti separati. Le rotte migrate coesistono con quelle precedenti; un servizio Symfony non dimostra che il vecchio flusso sia stato ritirato. Le copie dei sorgenti richiedono dipendenze PHP bloccate e risorse del browser generate. Usate gli ambienti indicati nel file `mise.toml` dell’applicazione.

[Guida alla migrazione](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Account, plugin e accesso allo spazio di archiviazione

La visibilità di dispositivi e grafici dipende dai permessi degli utenti e dei gruppi. I plugin operano come codice applicativo attendibile con l’accesso dell’account del processo; non sono isolati in sandbox. Esaminatene provenienza, hook e comportamento di installazione e disinstallazione prima di attivarli. I processi che scrivono RRD locali su Unix richiedono controlli di identità POSIX e impostazioni di fiducia esplicite se gli account web e poller differiscono. Windows non supporta manutenzione distruttiva degli RRD locali.

[Valutazione dei plugin](/it/guides/install-and-vet-plugins/)

## Impieghi adatti e limiti

Valutate Kadupul per interfacce di rete, contatori di dispositivi, sensori ambientali e altre misure disponibili con metodi di raccolta che potete convalidare. È software autogestito che richiede manutenzione di database, web e pianificatore. La raccolta numerica del nucleo non è un archivio di log, un sistema di tracciamento distribuito o un motore generale di query con etichette ad alta cardinalità. Gli avvisi a soglia dipendono da plugin adatti; verificatene la compatibilità senza presumere che funzionino subito dopo l’installazione.

## Origine, nome e compatibilità

Kadupul è un fork indipendente di Cacti con licenza GPL-3.0-or-later, senza affiliazione o approvazione di The Cacti Group. Il suo nome singalese, කඩුපුල්, indica *Epiphyllum oxypetalum*, un cactus a fioritura notturna. Preservare interfacce dei plugin, modelli, schemi e cronologia RRD esistente è un obiettivo di rilascio che richiede prove per ogni revisione sorgente e combinazione di plugin.

[Compatibilità](/it/project/compatibility-with-cacti/)

## Iniziate con un dispositivo verificato

Seguite installazione, primo dispositivo e primo grafico in ordine. Controllate log, timestamp di raccolta e valori utilizzabili prima di fidarvi dell’immagine. Misurate durata dei cicli e lavoro in coda sui vostri dispositivi prima di ampliare l’installazione. Consultate i concetti per capire il progetto e i requisiti per conoscere i prerequisiti.

[Installazione](/it/start/install/) · [Primo dispositivo](/it/start/first-device/) · [Primo grafico](/it/start/first-graph/) · [Concetti](/it/concepts/architecture/) · [Requisiti](/it/reference/requirements/)
