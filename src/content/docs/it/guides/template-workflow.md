---
title: "Usare e convalidare i modelli"
description: "Scegliere identità, vedere l’anteprima degli import e verificare la propagazione senza perdere la cronologia RRD."
banner:
  content: "Kadupul è pre-alfa. Convalidate le procedure in un’installazione di prova isolata. Bozza di traduzione in attesa di revisione linguistica."
---

## Scegliere le definizioni corrette

I modelli di dispositivo offrono modelli di grafici e query di dati; quelli di dati definiscono ingressi delle misure e archiviazione. Duplicate un modello simile quando serve un’identità distinta e controllate le dipendenze condivise. Duplicare non rende indipendente ogni ingresso o profilo referenziato. Conservate un export e un backup coerente di database e RRD prima di modificare definizioni in uso. Consultate i concetti dei modelli.

## Anteprima e applicazione consapevole

Su un’installazione isolata, esaminate origine XML, identità di destinazione e profilo di archiviazione. Dalla radice dell’applicazione visualizzate l’anteprima del semplice XML di modello:

```sh
php cli/import_template.php --filename=/secure/template.xml --preview
```

L’attuale `main` restituisce uno stato non nullo per input illeggibile, XML malformato ed errori di oggetto registrati. Controllate anche diagnostica e risultati per oggetto; un import può aggiornare identità esistenti. Gli import di pacchetti hanno un percorso distinto di scrittura dei file. Consultate import ed export.

## Verificare oggetti derivati e cronologia

Dopo l’applicazione controllate dispositivi rappresentativi, mappature locali degli elementi grafici, personalizzazioni e valori raccolti. Le modifiche alle associazioni dei modelli di dispositivo richiedono una sincronizzazione separata. Salvare un modello dati non ristruttura gli RRD esistenti; ispezionate il file reale prima di cambiare passo, heartbeat o conservazione. Fermate i processi di scrittura prima di un recupero coordinato e ripristinate il backup coerente se necessario. Consultate modelli personalizzati e conservazione.

[Concetti dei modelli](/it/concepts/templates/) · [Import ed export](/it/guides/import-and-export-templates/) · [Modelli personalizzati](/it/guides/create-custom-templates/) · [Conservazione](/it/guides/manage-data-retention/)

Base applicativa verificata il 26 ottobre 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
