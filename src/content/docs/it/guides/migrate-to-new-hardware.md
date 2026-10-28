---
title: Migrare su nuovo hardware
description: Trasferire un'installazione attiva su un altro server preservando lo storico dei dati, seguendo una sequenza che renda verificabile ogni passaggio.
banner:
  content: Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua.
sidebar:
  order: 20
---

:::caution[Comportamento ereditato del proxy RRDtool]
La configurazione del proxy RRDtool non è supportata in Kadupul. Adoperate l'archiviazione
locale per RRDtool (`storage_location = 0`). Le impostazioni, i dettagli del protocollo
e le procedure illustrate in questa pagina riflettono funzionalità ereditate e non
rappresentano un'architettura supportata. Consultate [il proxy RRDtool](/it/reference/rrdproxy/).
:::

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Una migrazione rappresenta un ripristino su un sistema differente rispetto a quello su cui è stato
generato il backup. Tutte le raccomandazioni presenti in [Backup e ripristino](/it/guides/back-up-and-restore/)
rimangono valide; questo documento illustra le peculiarità legate al fatto che il sistema di arrivo
differisce da quello di partenza.

Tre aspetti cambiano tra i sistemi, e ciascuno comporta un potenziale malfunzionamento.

| Differenza | Componente interessato |
|---|---|
| Percorsi differenti | Percorsi dei file memorizzati all'interno del database e nella cache del poller |
| Identificativi di utenti e gruppi diversi | I permessi sui file e le verifiche di conformità dell'archiviazione possono fallire |
| Versioni differenti dell'ambiente | Estensioni, comportamenti del database e compatibilità con RRD possono divergere |

## Prima di effettuare modifiche

Predisponete prima il server di destinazione fino a renderlo idoneo per una nuova installazione:
servizio database attivo, estensioni PHP necessarie installate, RRDtool presente, il collector
scelto disponibile e server web configurato. Mantenete disattivati il poller, i processi schedulati,
la replica remota e le notifiche in uscita. Non avviate la procedura di installazione guidata.
Andrete a sostituire l'intero database, e uno schema installato a metà risulta molto più difficile
da analizzare rispetto a un database vuoto.

Allineate puntualmente la versione del software e le dipendenze, inclusi plugin e modifiche locali.
La tabella `version` nel database memorizza la revisione dello schema e non ogni modifica al codice;
verificare questo singolo parametro non basta. Un reindirizzamento verso l'installer può indicare
incongruenze nello schema o un ripristino incompleto. Installate la medesima versione del codice in
uso, portate a termine la migrazione, verificatene il funzionamento e solo in seguito procedete
all'aggiornamento seguendo la guida [Aggiornare in sicurezza](/it/guides/upgrade-safely/).

Stabilite fin d'ora la cartella di installazione. Mantenerla identica su entrambe le macchine semplifica
gran parte delle attività descritte in seguito. Se questo non fosse possibile, leggete la sezione sui
percorsi prima di procedere.

## Sequenza delle operazioni

Ciascuna fase convalida la riuscita di quella precedente: non alteratene l'ordine.

1. **Arrestate tutti i processi di generazione dati su sorgente e destinazione.** Sospendete i processi pianificati, remoti, via web o manuali, oltre alle manutenzioni; consentite ai cicli in corso di terminare. Scaricate le scritture differite solo dopo aver interrotto i generatori di dati. Preservate le righe rimaste in coda unitamente al backup coerente di database e file RRD; non svuotatele con un truncate.
2. **Eseguite il backup.** Database, albero dei file RRD e configurazione, acquisiti nel medesimo istante. Il rispetto dei vincoli di coerenza illustrati in [Backup e ripristino](/it/guides/back-up-and-restore/) è l'elemento essenziale.
3. **Trasferite la cartella dei file RRD.** Consultate i paragrafi successivi per i dettagli.
4. **Trasferite il database.**
5. **Trasferite il codice sorgente, i file di configurazione e tutte le risorse a cui essi puntano.** Sono inclusi `plugins/`, `scripts/`, `resource/` e ogni script richiamato dai metodi di input dati.
6. **Riconfigurate i parametri della macchina di destinazione al termine del ripristino.** Rettificate percorsi, endpoint del database, proprietà dei file e ID numerici per l'archiviazione.
7. **Rigenerate la cache del poller.**
8. **Eseguite i controlli di archiviazione per ogni account di servizio, quindi avviate la raccolta solo sul server di destinazione.** Monitorate un campione di file e l'andamento della coda accumulata.

## Trasferimento dell'albero RRD

I file RRD sono archivi binari la cui struttura interna riflette le caratteristiche del sistema su cui
sono stati creati. Il trasferimento diretto in formato binario impone la piena compatibilità tra le
architetture e le versioni di RRDtool; la concordanza del sistema operativo o del tipo di architettura
da sola non basta. Incompatibilità a questo livello determinano errori di lettura. Convalidate i file
copiati mediante il comando RRDtool della macchina di arrivo.

Nel dubbio, preferite la conversione rispetto alla copia binaria. Le funzioni native dump e restore di
RRDtool generano un formato testuale privo di vincoli di piattaforma; Kadupul si basa sul medesimo
approccio quando deve rigenerare un archivio.

Sul server di partenza, a processi di scrittura fermi, operate all'interno di una cartella temporanea protetta:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Trasferite il file XML in modo cifrato. Procedete al ripristino sul server di destinazione generando un file di test:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Ripetete la sequenza per ogni file da convertire verificando il codice di ritorno di ogni comando.
Non installate conversioni parziali o file privi di verifica. Il manuale di RRDtool indica il formato XML
come lo standard per il [trasferimento tra differenti architetture](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Fate una prova prima di intraprendere questa procedura su larga scala. Trasferite un singolo file,
eseguite `rrdtool info` sul server di arrivo e mettete a confronto passo, archivi consolidati, data
dell'ultima modifica e denominazione delle origini dati. Esaminate anche i dati estratti tramite
`fetch` su un intervallo temporale noto. Estendete la prova a un insieme rappresentativo di file
prima di avviare il trasferimento complessivo, quindi convalidate l'elenco finale dei file.
Consultate la guida al [ripristino dei file RRD](/it/guides/recover-a-corrupted-rrd/) per le verifiche
di integrità e di proprietà dei file.

Qualunque sia la modalità di trasporto adottata, rispettate scrupolosamente la gerarchia delle directory.
Le sottocartelle annidate nella directory RRA svolgono un ruolo strutturale; il percorso relativo di
ogni file è registrato all'interno delle origini dati e appiattire l'albero compromette il funzionamento del sistema.

## Il database

Un dump seguito da un'operazione di caricamento. Due aspetti da convalidare sul nuovo sistema.

Ispezionate charset, collation e storage engine delle tabelle ripristinate, senza limitarvi ai soli
valori predefiniti del server. Conservate le caratteristiche originali e assicuratevi della piena
compatibilità con la versione del database di destinazione prima del passaggio definitivo.

**Le code del collector non sono cache sacrificabili.** La coda operativa `poller_output` deve
adottare il motore InnoDB. I controlli preliminari rifiutano l'uso del motore MEMORY. Mantenete i dati
in essa contenuti e quelli delle code di boost e real-time finché le letture non risultano registrate;
un backup dei file RRD potrebbe non comprendere ancora quelle misurazioni. Non presumete che una tabella
MEMORY ripristinata sia vuota: un backup logico può contenere istruzioni per ripopolarla.

A processi fermi e con i backup al sicuro, una coda non InnoDB può essere convertita manualmente:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Eseguite il test di conformità dell'archiviazione con ciascun account adoperato dal web server e dal
poller. Viene verificato l'accesso al disco locale e alla coda di polling; l'esito positivo con utente
root non prova che i servizi riescano ad accedervi. I collector remoti comunicano normalmente con la coda
centrale; ricorrete a `--local` soltanto per collaudare intenzionalmente la coda locale. Le altre
tabelle temporanee necessitano di un piano chiaro di conservazione o rigenerazione. Consultate i
[requisiti di archiviazione](/it/reference/requirements/).

## Percorsi sul server di destinazione

È in questa fase che si manifestano i problemi più frequenti, dal momento che molti errori rimangono
invisibili fino al primo ciclo di polling.

**Il percorso della directory RRA.** Le origini dati standard adoperano il segnaposto `<path_rra>`.
Nelle ultime versioni, il bootstrap ricava la variabile `$config['rra_path']` a partire dalla cartella
dell'applicazione con l'aggiunta di `/rra`; non si tratta di un parametro libero per scegliere una
cartella qualsiasi sul server. Verificate il percorso reale prima di muovere i file. Eventuali percorsi
assoluti personalizzati vanno individuati e modificati singolarmente. Mantenete la struttura ad albero
delle cartelle annidate.

**La cache del poller registra percorsi assoluti.** Al momento della generazione della cache, il
segnaposto viene espanso e il percorso assoluto viene memorizzato all'interno delle righe. Se spostate la
directory RRA, la cache continuerà a referenziare la vecchia posizione. Il poller continuerà a girare
senza scrivere alcun file reperibile. Rigenerate la cache:

```sh
php cli/rebuild_poller_cache.php
```

**Impostazioni contenenti percorsi di sistema.** Ognuna di esse è memorizzata nel database, per cui
arriverà dalla vecchia macchina puntando ai percorsi di quest'ultima. Controllatele tutte prima di avviare
il sistema: il binario di RRDtool, il binario del collector e la relativa configurazione, il comando
PHP, i tool SNMP, i file di log, il font di default e la directory di backup per la rimozione dei picchi.
Controllate anche i percorsi e le variabili d'ambiente nei file di configurazione, nelle unit dei servizi,
nei cron job e nel web server.

**I metodi di input dati memorizzano comandi di sistema.** Utilizzano un segnaposto per indicare la
radice del software, quindi un trasferimento che conservi la struttura non esige modifiche. Un cambio di
struttura impone invece il controllo di ogni singolo metodo. Lo stesso vale per i file XML contenenti le
query di interrogazione.

**I collector remoti adoperano un file di configurazione locale proprio**, contenente le credenziali
del database e l'identificativo assegnato. Non fanno parte del dump centrale. Se il server del database
ha cambiato indirizzo, aggiornate i riferimenti e convalidate la connessione per ciascun collector.
La sincronizzazione completa è un'operazione autonoma, da lanciare sul collector principale solo se sono
stati configurati collector remoti attivi:

```sh
php cli/poller_replicate.php
```

In assenza di collector remoti attivi, il comando termina restituendo un errore. Non inseritelo come test
obbligatorio in migrazioni su singolo server. Convalidate la configurazione e la replica dei nodi remoti
prima di autorizzare la ripresa della raccolta.

## Proprietà e permessi dei file

Il poller scrive i file RRD con l'account di sistema con cui viene eseguito. L'interfaccia web li consulta
con i privilegi del server web. Una copia che abbia conservato gli identificativi numerici tra macchine
con file `/etc/passwd` differenti produrrà file intestati all'account scorretto.

Grafici che smettono di aggiornarsi dopo la migrazione possono dipendere da permessi errati, percorsi
obsoleti, mancata raccolta, orologi di sistema disallineati o dati rifiutati. Analizzate i log del
poller e le code pendenti prima di effettuare correzioni; il solo grafico non consente di individuare la causa.

Accertatevi dei permessi della cartella RRA e delle sue sottocartelle, non solo di un file di esempio.
Nuovi file vengono creati durante la raccolta dati, per cui una directory non scrivibile dal poller
fallirà per le origini dati create successivamente alla migrazione, anche se i file preesistenti risultano
leggibili. Riconfigurate `rrd_maintenance_trusted_uids` e `rrd_maintenance_trusted_gids` all'interno
di `include/config.php` con gli ID numerici della nuova macchina e verificate le cartelle superiori.
Consultate i [requisiti di archiviazione](/it/reference/requirements/).

## Passaggio definitivo con perdita minima di dati

I file RRD non accettano aggiornamenti con marcatura oraria pari o precedente all'ultimo aggiornamento
memorizzato. Questa caratteristica vincola il recupero dei dati; non significa però che ogni migrazione
debba comportare perdite. L'ampiezza dell'interruzione dipende dai tempi di campionamento, dalla durata
del fermo e dalle misurazioni salvaguardate in coda. Questa procedura assegna la raccolta a un unico nodo
e non tenta di fondere storici raccolti separatamente durante i test con l'archivio definitivo.

1. Conducete una simulazione preventiva con un backup del giorno precedente. Copiate l'intero ambiente, modificate i percorsi e convalidate la raccolta su apparati di test isolati disattivando le notifiche. Trascrivete le modifiche necessarie come sequenza documentata e ripetibile. Arrestate i processi di test al termine della prova.
2. Mantenete isolato l'ambiente di prova. Sostituite il database e i file RRD con il backup coerente finale; non mischiate dati di prova o campioni temporanei con il ripristino effettivo.
3. Per la transizione definitiva, fermate la raccolta sulla macchina di partenza, scaricate o mettete al sicuro i dati pendenti, quindi acquisite e trasferite il backup finale. Applicate nuovamente le modifiche al nuovo server: il ripristino del database riscrive i percorsi originali nella tabella `settings`, e il ripristino dei file di configurazione può alterare gli indirizzi e le autorizzazioni definiti nei test.
4. Rigenerate la cache del poller, eseguite le verifiche di archiviazione, controllate l'elenco dei file e attivate il poller sulla destinazione solo a verifiche completate.

Misurate il tempo impiegato per le prove e pianificate un margine adeguato per controlli o rollback.
Mantenete la macchina di origine inattiva finché il passaggio non è confermato o finché una decisione di
rollback non la riattivi come nodo primario di raccolta.

## Ordine di verifica

1. L'interfaccia web si apre senza proporre la pagina di installazione. Se appare il wizard, indagate su incongruenze tra codice e schema, errori di connessione al database o backup parziale.
2. Un dispositivo di test risponde a una nuova interrogazione; lo stato "up" recuperato dal database potrebbe non essere aggiornato.
3. L'orario di modifica di un file RRD avanza al completamento del primo ciclo di raccolta. Controllate il file sul disco, non il grafico a video.
4. Il grafico relativo all'ultima ora mostra una linea continua senza buchi.

In caso di fallimento al punto 3, controllate percorsi, permessi, verifiche di archiviazione, code e
messaggi d'errore di RRDtool. In caso di fallimento al punto 4, controllate dati pendenti, definizioni del
grafico, arco temporale e autorizzazioni dell'account web. L'esito positivo su un singolo file non
garantisce che tutti i dispositivi, metodi di input o nodi remoti stiano operando correttamente.

## Errori tipici da evitare

**Non fate operare entrambi i server sullo stesso albero di file RRD.** Due poller concorrenti sugli
stessi archivi causano scritture rifiutate e discontinuità nei grafici, non unione dei dati.

**Non sovrascrivete un database aggiornato con un albero RRD più vecchio.** I file non possono essere
ricostruiti retroattivamente. La raccolta riprenderà dall'istante presente e il tempo intermedio
resterà un'interruzione insanabile.

**Il backup conserva credenziali dei dispositivi in testo chiaro.** Spostare l'ambiente comporta il
transito di queste chiavi in rete e la loro presenza su due apparati. Limitate l'accesso al backup e
cifrate il canale di copia. Trattenete la copia di ripristino fino al collaudo finale e nei limiti delle
politiche aziendali; non cancellatela durante la migrazione.

**Le tabelle dei plugin risiedono nel database; il codice dei plugin no.** Ripristinare il database
senza allineare codice e dipendenze dei plugin può compromettere pagine web, hook o task schedulati.
Controllate singolarmente ogni plugin richiesto.

**Le architetture proxy preesistenti esulano da questa sequenza di migrazione.** L'uso di proxy non
è supportato. Individuate ed esportate i veri file RRD, quindi pianificate una transizione autonoma su
disco locale all'interno di un'istanza di test. Una cartella `rra/` locale potrebbe ospitare unicamente file residui.

**Dismettete il vecchio server solo come ultima operazione, e mai lo stesso giorno.** Lasciatelo spento
o con i servizi di raccolta interrotti e conservatene il backup coerente finché tutti i test di raccolta,
grafici, nodi remoti e plugin non siano stati superati. Stabilite la durata dell'osservazione in base al
carico operativo e ai requisiti di ripristino; un singolo ciclo di raccolta privo di errori non garantisce
che l'intera piattaforma funzioni a dovere.
