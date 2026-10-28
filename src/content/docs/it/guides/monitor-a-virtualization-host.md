---
title: Monitorare un host di virtualizzazione
description: Cosa espone un hypervisor tramite SNMP, cosa viene fornito per ESXi e perché contare guest, CPU e memoria in un'infrastruttura virtualizzata è più complesso di quanto sembri.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata. Questa è una bozza di traduzione in attesa di revisione da parte di un madrelingua.
sidebar:
  order: 27
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Testare queste procedure su una copia isolata con backup prima di
affidarsi ad esse. Vedere lo [stato del progetto](/it/project/status/).
:::

Il pacchetto ESXi fornito raccoglie misurazioni dell'host e inventario dei guest.
Non fornisce misurazioni di CPU, memoria o contesa per singolo guest. Verificare gli
oggetti esposti dalla propria versione di hypervisor prima di selezionare i grafici.

## Cosa viene fornito

Viene fornito un solo modello di dispositivo per hypervisor: **ESXi Device**. Trattandosi di un pacchetto dispositivo,
`install/templates/ESXi_Device.xml.gz` contiene i relativi script e file di query di dati.
Seguire [Importare ed esportare modelli](/it/guides/import-and-export-templates/) e verificare che
l'importazione sia terminata, inclusa l'installazione dei file. Selezionare il modello di dispositivo,
ispezionare l'individuazione e creare esplicitamente i grafici desiderati; l'importazione del pacchetto
o la semplice associazione di un modello di dispositivo non li crea automaticamente.

| Fornito | Scopo |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Rileva i processori e legge il carico per ciascun processore |
| `resource/snmp_queries/esxi_hw.xml` | Rileva i componenti hardware e ne legge lo stato |
| `resource/snmp_queries/interface.xml` | La query standard delle statistiche delle interfacce |
| `resource/script_server/host_disk.xml` | Partizioni montate, attraverso la tabella di archiviazione Host Resources |
| `scripts/ss_esxi_vhosts.php` | Incluso in `install/templates/ESXi_Device.xml.gz`; conta guest, guest accesi e stato dei tool guest |
| `scripts/ss_multicpu_avg.php` | Calcola la media del carico di tutti i processori in un unico valore |
| `scripts/ss_hstats.php` | Legge le statistiche di polling che Kadupul gestisce già per il dispositivo |
| `scripts/ss_host_disk.php` | Gestisce la query delle partizioni |

Non viene fornito alcun pacchetto dispositivo dedicato per Hyper-V, KVM/libvirt, Xen o Proxmox in questa
versione. I modelli generici Linux/Windows possono coprire le metriche host supportate dai rispettivi
agenti; la raccolta specifica per hypervisor richiede modelli e collector appropriati. Vedere
[Scrivere uno script di raccolta dati](/it/guides/write-a-data-collection-script/).

## Attivare prima l'agente

Verificare la configurazione attuale dell'agente e seguire le istruzioni relative alla propria versione di ESXi.
Le note del pacchetto menzionano un ripristino alle impostazioni di fabbrica; non è un prerequisito ordinario ed
eliminerebbe la configurazione SNMP esistente. Per una configurazione basata su stringhe di comunità, i seguenti
comandi impostano i parametri dell'agente; sostituire gli esempi e preservare le comunità richieste
durante la definizione dell'elenco.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Il primo comando mostra la configurazione; l'ultimo attiva l'agente. L'opzione di comunità
sostituisce l'elenco configurato. Verificare l'accesso firewall richiesto dal poller
e consultare la [guida di riferimento ai comandi SNMP di ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Questi comandi configurano un'interrogazione basata su comunità; non configurano SNMPv3.
Effettuare una verifica dalla macchina in cui viene eseguito il poller prima di aggiungere il dispositivo.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Se il primo comando funziona e il terzo non restituisce nulla, analizzare l'errore SNMP,
i permessi di accesso e il supporto dell'agente; un walk vuoto da solo non ne individua la causa. Lo
script guest incluso utilizza SNMPv1, pertanto una prova v2c riuscita non convalida il percorso di
raccolta. I walk vuoti per i guest producono conteggi a zero, non necessariamente interruzioni nei grafici;
vedere il [bug del risultato vuoto](https://github.com/kadupulhq/kadupul/issues/245).

## Cosa espone l'host

| Area | Sottoalbero | Cosa fornisce |
|---|---|---|
| Processori | `.1.3.6.1.2.1.25.3.3.1` | Carico di ciascun processore esposto dall'agente |
| Componenti hardware | `.1.3.6.1.2.1.25.3.2.1` | Indice, descrizione e stato del componente |
| Archiviazione | `.1.3.6.1.2.1.25.2.3.1` | Datastore e filesystem locali, secondo quanto riportato dall'agente |
| Interfacce | `.1.3.6.1.2.1.2` e `.1.3.6.1.2.1.31` | Traffico, errori, stato |
| Inventario guest | `.1.3.6.1.4.1.6876` | Stato di alimentazione e dei tool per ogni macchina guest |

I primi quattro corrispondono alle tabelle standard Host Resources e interfacce, le medesime restituite
da un host Linux. Vedere [Monitorare un server Linux](/it/guides/monitor-a-linux-server/)
per il relativo comportamento e per la tabella disco da preferire.

Il quinto è il sottoalbero del produttore utilizzato dallo script fornito per il conteggio dei guest.

## I modelli di grafici

| Grafico | Origine | Cosa legge |
|---|---|---|
| ESXi - CPU | Query di dati | Carico per un processore rilevato |
| ESXi - MultiCPU Average | Script | Media del carico di tutti i processori |
| ESXi - Hardware | Query di dati | Stato di un componente rilevato |
| ESXi - VHosts | Script | Conteggio dei guest e stato dei tool guest |
| Host MIB - Processes | OID fissa | Numero di processi sull'host |
| Host MIB - Logged in Users | OID fissa | Numero di sessioni sull'host |
| Device - Uptime | Script | Uptime registrato nell'ultima interrogazione di Kadupul |
| Device - Polling Time | Script | Tempo impiegato da Kadupul per interrogare il dispositivo |
| Grafici interfacce | Query di dati | Traffico, errori, pacchetti e stato per interfaccia |

La query dei processori rileva il carico per ciascuna voce individuata. Non bisogna dare per scontato che il
numero di righe coincida con i thread hardware dell'host: il pattern di indici incluso accetta solo
indici a una o due cifre e rifiuta valori da 100 in su, persino su un host con poche CPU.
Confrontare l'individuazione con un walk diretto; vedere il [bug dell'indice CPU](https://github.com/kadupulhq/kadupul/issues/246).
Lo script per il calcolo medio esamina in modo indipendente i carichi dei processori e calcola la media delle righe ottenute.

Device - Uptime e Device - Polling Time leggono il record memorizzato del dispositivo in Kadupul.
L'helper dell'uptime restituisce il valore SNMP memorizzato senza estrapolare il tempo trascorso;
il tempo di polling descrive il lavoro di raccolta svolto da Kadupul. Un valore storico memorizzato non dimostra
la raggiungibilità attuale. Se la raccolta si arresta, questi helper non generano nuovi campioni.

## I problemi di conteggio

Questo è l'aspetto che distingue la virtualizzazione da un server fisico, e nulla
di tutto ciò viene risolto da un modello di grafico.

**I guest si spostano.** Un guest che migra verso un altro host scompare dall'inventario del primo
e compare su quello del secondo. Campioni raccolti con tempistiche sfasate possono conteggiare
temporaneamente due volte o omettere quel guest. Le variazioni nel conteggio da sole non attestano una migrazione: utilizzare
gli identificatori dell'inventario e gli eventi dell'hypervisor per chiarirle.

**Le risorse sono condivise, quindi l'attribuzione per guest è una stima.** L'host segnala il
carico fisico del processore. Non segnala quale guest lo abbia causato. Dividere la CPU dell'host
per il numero di guest produce un numero aritmeticamente esatto che non risponde ad alcuna domanda utile.

**L'overcommit rende allocazione e utilizzo grandezze distinte.** Le CPU virtuali assegnate
possono superare i core fisici, e la memoria allocata può intenzionalmente eccedere quella fisica. Un
grafico delle risorse assegnate descrive un'allocazione e non una domanda effettiva misurata.
Occorre confrontarlo con la capacità fisica, i limiti configurati e l'uso reale.

**La contesa non compare in queste tabelle.** Le misurazioni che indicano se un guest
è in sofferenza – il tempo trascorso in attesa di una CPU fisica e la memoria che l'host gli
ha sottratto – non fanno parte di ciò che questo modello raccoglie. Un host con CPU al 60 percento
con guest soggetti a forte contesa appare identico qui a un host al 60 percento con
guest perfettamente operativi.

**Le misurazioni di guest e host rispondono a esigenze differenti.** L'utilizzo del guest da solo
potrebbe non spiegare i ritardi di pianificazione dell'host. È opportuno correlare le misurazioni di guest e applicazioni
con le metriche di contesa dell'hypervisor anziché dedurre l'attribuzione dal carico dell'host.

### Cosa fare in alternativa

| Domanda | Dove trovare la risposta |
|---|---|
| L'host è saturo? | Carico del processore dell'host, rilevato dall'host stesso |
| Un guest è saturo? | All'interno del guest, assieme a una metrica di contesa dell'hypervisor |
| Quanti guest sono in esecuzione? | Inventario dei guest dell'host, come conteggio |
| L'infrastruttura è sovraccarica? | Non da questi grafici. Richiede dati di allocazione non esposti dall'host |
| Un guest si è spostato? | Identificatori d'inventario ed eventi di migrazione dell'hypervisor; i conteggi da soli non bastano |

Monitorare i guest come dispositivi a sé stanti per tutto ciò che riguarda il guest, e monitorare l'host
per tutto ciò che riguarda l'host. Evitare di costruire grafici per guest derivati da numeri globali dell'host:
sono cifre derivate, appaiono autorevoli e risultano errate in modi che nessuno potrà accertare a posteriori.

## Trabocchetti nel conteggio dei guest fornito

Lo script dell'inventario dei guest deve essere compreso appieno prima di affidarsi al suo output.

**Esegue il walk esclusivamente con SNMP versione 1 e la stringa di comunità.** La versione è fissata nel
codice dello script e le credenziali v3 configurate sul dispositivo non vengono passate. Un dispositivo configurato per
v3 può effettuare la raccolta per altre vie mentre la raccolta dei guest fallisce. La raccolta dei guest può
comunque andare a buon fine se l'agente accetta autonomamente la comunità memorizzata su v1;
la selezione di v3 sul dispositivo non determina di per sé l'esito. I walk vuoti per i guest
vengono restituiti come zeri. Verificare questa discrepanza di protocolli senza degradare la politica di sicurezza
dell'agente per accomodare l'helper.

**Il conteggio deriva dalla tabella dello stato di alimentazione.** Il totale riportato per i guest
corrisponde al numero di voci restituite dal walk del sottoalbero dello stato di alimentazione, non di un
oggetto d'inventario distinto. Un guest elencato dall'host privo di voce di stato di alimentazione
non viene conteggiato.

**Lo stato di accensione viene confrontato sulla stringa di testo.** Dopo la rimozione degli spazi e la conversione in minuscolo,
soltanto `powered on` e `poweredon` incrementano il conteggio delle macchine attive. Altre rappresentazioni
non lo fanno; confrontare la risposta grezza dell'agente prima di interpretare uno zero.

**La classificazione dei tool guest presenta un difetto noto.** La stringa letterale `not installed`
viene conteggiata come in esecuzione poiché la corrispondenza inizia all'offset zero. Anche le stringhe non riconosciute
vengono considerate come in esecuzione. Non interpretare tale conteggio come prova di tool integri;
vedere il [bug dello stato dei tool](https://github.com/kadupulhq/kadupul/issues/244).

**Esegue tre walk per ogni chiamata.** Legge la tabella di alimentazione due volte, quindi la tabella
dei tool, per cui i suoi stessi conteggi non costituiscono uno snapshot atomico dell'inventario. Su un host
con numerosi guest, misurare questo carico di raccolta. Se il poller è sotto pressione, questo script rappresenta un candidato per un intervallo più lungo prima
di valutare l'aumento dei thread. Vedere [Scalare il poller](/it/guides/scale-the-poller/).

Lo script emette normalmente tutti e cinque i valori nominati, inclusi zeri in caso di walk vuoti.
Un walk non riuscito può quindi generare un campione sintatticamente completo ma ingannevole.
In caso di output incompleto, il processore PHP verifica i campi richiesti dall'origine dati
associata e trattiene i gruppi di timestamp incompleti; non li elimina
necessariamente subito. Vedere [La cache del poller](/it/concepts/the-poller-cache/).

## Trabocchetti per gli altri elementi

**La media dei processori occulta gli sbilanciamenti.** Un host con un core saturato e 63 core inattivi
mostra una media contenuta. Mantenere grafici validati per singolo processore dove necessario. L'helper
della media restituisce inoltre `load:0` per un walk vuoto, non distinguibile da una CPU realmente inattiva;
è importante correlarlo con lo stato di raccolta e il noto bug del risultato vuoto.

**Gli indici dei processori sono posizionali.** Vengono individuati percorrendo la tabella
dei processori. Se gli indici dell'agente cambiano, verificare le mappature d'identità prima di confidare nella continuità.
La restrizione a una o due cifre rappresenta un difetto di individuazione indipendente.

**Le voci di archiviazione sono tutto ciò che l'agente definisce tale.** Occorre attendersi datastore mescolati con
elementi non desiderati, in unità di allocazione che richiedono moltiplicazione. È il comportamento ordinario di
Host Resources, non una stranezza di ESXi. Verificare le unità di allocazione in cache prima
di interpretare i byte; lo script condiviso presenta un [difetto di conversione noto](https://github.com/kadupulhq/kadupul/issues/243)
in caso di campioni negativi non validi o moltiplicatori mancanti.

**I nomi delle interfacce su un hypervisor sono stabili fino a quando non cambiano.** Un aggiornamento dei driver o una
riconfigurazione può rinumerarli. Vedere [Monitorare uno switch](/it/guides/monitor-a-switch/) per
comprendere come viene scelto l'indice e perché è rilevante.

**Gli script vengono eseguiti sull'host del poller.** Raggiungono direttamente l'hypervisor adoperando
l'ID del dispositivo passato dal comando in cache. Gli helper per i guest e la media della CPU interrogano la
riga corrente del dispositivo a ogni invocazione; modificare la comunità non richiede la ricostruzione
di tali argomenti di comando. Altri collector possono incorporare le credenziali nei propri task.
Vedere [La cache del poller](/it/concepts/the-poller-cache/).

## Modalità di errore

| Sintomo | Causa comune |
|---|---|
| Tutto viene raccolto tranne il conteggio dei guest | Il dispositivo è configurato per SNMPv3 e lo script guest usa v1 |
| Conteggio guest corretto, conteggio accesi a zero | Controllare la stringa esatta dello stato di alimentazione e se il secondo walk è riuscito |
| Il conteggio dei guest scende a zero e poi risale | Verificare walk falliti o vuoti; l'helper può emettere un'intera riga di zeri |
| I grafici della CPU cessano dopo una modifica hardware | Controllare gli indici modificati e il vincolo a indici di una o due cifre |
| CPU dell'host piatta e bassa mentre i guest rallentano | Verificare fallimenti di raccolta e contesa; un walk medio vuoto è riportato come zero |
| I grafici dei datastore includono partizioni non richieste | L'agente le qualifica come archiviazione |
| Il grafico dell'uptime appare errato dopo un'interruzione del poller | Riporta l'ultimo valore registrato da Kadupul, non una lettura in tempo reale |
| Il totale dei guest tra host varia sensibilmente durante la manutenzione | I guest in migrazione vengono temporaneamente contati due volte o omessi |
