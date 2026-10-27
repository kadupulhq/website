---
title: "Compatibilità con Cacti"
description: "Ambito, prove di verifica e limiti di compatibilità per pianificare il 2026–2027."
sidebar:
  order: 2
banner:
  content: "Kadupul è pre-alfa. Convalidate le procedure in un’installazione di prova isolata. Bozza di traduzione in attesa di revisione linguistica."
---

La compatibilità è un obiettivo di rilascio, non l’affermazione che ogni versione, plugin o modello Cacti funzioni senza modifiche. Kadupul rimane pre-alfa. Valutate l’esatta revisione sorgente e i componenti usati prima di fare affidamento sul comportamento.

## Che cosa comprende

Controllate hook dei plugin, comportamento di argomenti e ritorni e permessi; identità dei modelli, mappature di input e propagazione; semantica di schemi, valori predefiniti e riferimenti; percorsi RRD esistenti, campi, archivi e valori conservati. Un profilo database corrispondente non prova che il file RRD abbia la stessa struttura. I plugin eseguono codice applicativo attendibile, non in sandbox. Consultate modelli e valutazione dei plugin.

## Che cosa significa in pratica

Registrate ramo e revisione applicativa, PHP e dipendenze bloccate, versioni dei plugin, stato dello schema e configurazione dello spazio di archiviazione. Provate raccolta, rendering grafici, autorizzazione, errori e ripristino su una copia ripristinata isolata. Includete collettori remoti e lavoro in background se usati. Documentate differenze intenzionali e lacune residue; i test coprono solo i percorsi esercitati. Consultate prove di aggiornamento e backup.

## Che cosa non garantisce

Non esiste una garanzia generale di compatibilità binaria, di schema o plugin, né una versione di produzione supportata o un percorso convalidato di migrazione in produzione. Ripristinare solo il codice non annulla modifiche a schema o RRD; il recupero può richiedere il backup coerente. Usate i sorgenti mantenuti dal progetto e registratene la provenienza senza presumere che archivi di un altro progetto siano un pacchetto Kadupul testato. Kadupul non è affiliato a The Cacti Group né approvato da esso. Consultate lo stato.

[Modelli](/it/concepts/templates/) · [Valutazione dei plugin](/it/guides/install-and-vet-plugins/) · [Prova di aggiornamento](/it/guides/upgrade-safely/) · [Backup](/it/guides/back-up-and-restore/) · [Stato](/it/project/status/)

Base applicativa verificata il 26 ottobre 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
