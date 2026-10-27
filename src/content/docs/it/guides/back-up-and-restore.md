---
title: "Backup e ripristino"
description: "Tre elementi devono essere acquisiti insieme affinché il backup sia valido, e l'ordine di ripristino è fondamentale."
banner:
  content: "Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua."
sidebar:
  order: 7
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Un set di ripristino completo di Kadupul è composto da tre parti. I backup parziali possono
ripristinare la configurazione o le misurazioni, ma non possono riprodurre l'intera installazione.

| Parte | Cosa contiene | Dove risiede |
|---|---|---|
| Database | Dispositivi, modelli, utenti, permessi, la cache del poller e il percorso di ciascun file RRD | MySQL o MariaDB |
| File RRD | Misurazioni conservate e archivi consolidati | La directory RRA, per impostazione predefinita `rra/` all'interno dell'installazione |
| Configurazione | Credenziali del database, percorsi, configurazione del raccoglitore, codice di plugin e script | `include/config.php`, il file di configurazione di spine, `plugins/`, `scripts/`, `resource/` |

## Cosa può ripristinare un backup della sola base di dati

Il database contiene le definizioni dei grafici e la configurazione del monitoraggio, mentre
i file RRD conservano gli archivi storici dei grafici. Con Boost abilitato, le letture recenti
possono anche rimanere nelle code del database fino a quando non vengono scaricate nei file. Conservate
queste code come parte del backup del database. Consultate [Architettura](/it/concepts/architecture/).

Ripristinando solo il database si ottiene un sistema che conosce quattrocento dispositivi, ha ogni
grafico definito e disegna ciascuno di essi completamente vuoto. Riprenderà la raccolta dati dal
momento in cui avviate il poller, ma la cronologia precedente è perduta.

## Cosa manca a un backup dei soli file RRD

Un file RRD contiene origini dati denominate, definizioni di archivi e valori, ma non i metadati
completi di Kadupul relativi a dispositivi, interrogazioni, grafici e autorizzazioni necessari per
ricollegare tali valori all'applicazione.

La mappatura da "byte in entrata sulla porta 3 dello switch 12" a un percorso su disco si trova
nel database, in una colonna dell'origine dati. Ripristinando solo l'albero dei file vi ritroverete
con diverse migliaia di file pieni di numeri, senza alcun modo di capire a cosa corrispondano se
non decodificandoli faticosamente a mano.

I due elementi formano un unico backup. Trattateli come tale.

## Coerenza tra i componenti

È qui che la maggior parte delle procedure di backup commette silenziosamente errori.

Il poller scrive nei file RRD in modo continuo. Un file copiato mentre è in corso un aggiornamento
può essere acquisito a metà scrittura. Nello stesso momento si sta scrivendo nel database. Se eseguite
un dump del database alle 02:00 e iniziate a copiare i file alle 02:20, le due metà descrivono momenti
diversi e ogni origine dati creata o eliminata nel frattempo costituirà una discrepanza.

Le scritture RRD differite rendono la situazione ancora più critica e interessante. In questa modalità
il poller non scrive nei file RRD a ogni passaggio. I risultati si accumulano in una tabella durevole
del database e vengono scaricati in blocco successivamente. Di conseguenza, il database può legittimamente
trovarsi più avanti rispetto ai file RRD fino all'intervallo di svuotamento, conservando misurazioni reali
che non sono presenti su disco in nessun altro posto.

Scegliete una delle seguenti opzioni, in ordine decrescente di preferenza:

**Snapshot coordinato.** Utilizzate la procedura di backup o di messa in stato di quiescenza supportata
dal motore del database e coordinatela con snapshot di tutto lo storage RRD e della configurazione
dell'applicazione. Uno snapshot del solo file system non garantisce la coerenza tra volumi separati,
raccoglitori remoti, code in sospeso o un database attivo.

**Backup logico quiescente.** Disabilitate gli avviatori pianificati e gli altri produttori, attendete
che i raccoglitori già in esecuzione terminino, quindi svuotate le scritture differite e attendete i
worker di flush. Mantenete fermi le modifiche alla configurazione, le attività di manutenzione e gli
altri processi di scrittura RRD durante l'intera acquisizione. Le pause nella raccolta possono causare
la perdita di campioni; la loro visibilità dipende da heartbeat e consolidamento.

Prima di eseguire l'esempio, completate questi passaggi di quiescenza e verificate lo stato di code e
worker. Il fatto che `poller_boost.php --force` restituisca zero non è di per sé una prova di uno
svuotamento completo: un processo Boost già registrato può farlo uscire senza eseguire il lavoro.
Coordinate separatamente qualsiasi servizio rrdcached o storage remoto.

Questo esempio Bash presuppone uno storage locale, un account di database configurato in un file di
opzioni client privato e una directory RRA contenente tutti gli RRD gestiti. Sostituite ciascun percorso.
Censite i percorsi RRD assoluti personalizzati, le destinazioni dei collegamenti simbolici, la configurazione
esterna e i raccoglitori remoti, e acquisite anch'essi separatamente.

```bash
set -euo pipefail
umask 077

APP=/path/to/kadupul
RRA=/path/to/kadupul/rra             # use the actual configured storage path
DEST=/var/backups/kadupul            # outside the served tree
MYSQL_CNF=/secure/path/backup-client.cnf
DB=$(php -r 'require $argv[1]; echo $database_default;' "$APP/include/config.php")
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

install -d -m 0700 "$DEST"
STAGE=$(mktemp -d "$DEST/.partial-XXXXXXXX")
FINAL="$DEST/backup-$STAMP-${STAGE##*partial-}"

# All writers must already be stopped and deferred queues handled.
mysqldump --defaults-extra-file="$MYSQL_CNF" \
  --single-transaction --routines --events --triggers "$DB" > "$STAGE/db.sql"
tar -C "$RRA" -cf "$STAGE/rrd.tar" .
tar --exclude='./rra' --exclude='./log' --exclude='./cache' --exclude='./.git' \
  -C "$APP" -cf "$STAGE/application.tar" .

( cd "$STAGE"
  sha256sum db.sql rrd.tar application.tar > SHA256SUMS
  sha256sum --check SHA256SUMS )
test ! -e "$FINAL"
mv "$STAGE" "$FINAL"
```

L'archivio dell'applicazione include la configurazione e il codice corrispondente. Registrate la revisione
del codice sorgente, le versioni del database e di RRDtool, i percorsi effettivi di archiviazione e lo
stato di arresto/svuotamento dei processi di scrittura insieme al set. L'esempio esclude i registri ordinari,
la cache e i metadati di Git; verificate queste esclusioni per la vostra installazione.

Solo un set acquisito con successo e verificato tramite checksum riceve il nome definitivo della directory.
Un comando fallito può comunque lasciare un file tronco all'interno di `.partial-*`; `set -e` interrompe
i comandi successivi ma non rimuove l'output già creato. Non promuovete tale directory a backup completato.
I checksum rilevano modifiche successive, non la completezza logica; un test di ripristino resta comunque
necessario.

`--single-transaction` copre le tabelle transazionali, non uno snapshot coerente di tabelle di plugin non
transazionali o modifiche concorrenti dello schema. Mantenete fermi i processi di scrittura e le modifiche
dello schema, oppure utilizzate un metodo di backup appropriato per il motore. Riprendete la raccolta dati
solo dopo aver confermato che l'acquisizione è terminata e lo storage è utilizzabile. Consultate la
[documentazione di mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html) per i requisiti
relativi a transazioni e privilegi. Le omissioni della procedura precedente sono tracciate nella
[website #12](https://github.com/kadupulhq/website/issues/12).

**Accettate il disallineamento temporale e registratelo.** Qualunque parte venga acquisita per prima sarà
la più vecchia, e nessun ordine rende coerente di per sé una coppia attiva. Prendete nota della finestra
temporale; è questo che rende il risultato recuperabile.

Se eseguite prima il dump del database e poi copiate i file, i file saranno più recenti. Un'origine dati
eliminata all'interno di tale intervallo sarà ancora presente nel dump ma il suo file sarà scomparso,
lasciando un riferimento che il poller ricreerà. Un'origine dati creata all'interno dell'intervallo arriverà
come un file sconosciuto al database, rimanendo inerte.

Se copiate prima i file ed eseguite il dump del database per secondo, il database sarà più recente.
Un'origine dati creata nell'intervallo sarà presente nel dump senza alcun file sottostante, che il poller
ricreerà vuoto.

Entrambi gli ordini possono causare la perdita della cronologia precedente alla finestra se un file
necessario viene eliminato prima di essere copiato. Possono anche acquisire un file scritto solo parzialmente
o campioni in coda incoerenti. Registrare il disallineamento documenta una limitazione; non rende completa
una coppia incoerente né garantisce la recuperabilità.

## Cosa c'è nel backup a cui non avevate pensato

Le credenziali dei dispositivi sono memorizzate nel database in testo non cifrato. La cache del poller
contiene stringhe di community SNMP e nomi utente, password e passphrase SNMPv3 come normali colonne,
poiché il raccoglitore ne ha bisogno a ogni passaggio. Il file di configurazione contiene la password del
database.

Un backup di Kadupul costituisce quindi un archivio di credenziali per ogni dispositivo monitorato.
Crittografatelo a riposo, limitatene l'accesso in lettura e non caricatelo su una condivisione file ad uso
generale.

## Ordine di ripristino

L'ordine è fondamentale perché ogni passaggio dipende da quello precedente.

1. **Ripristinare prima la configurazione.** Senza le credenziali del database e il percorso
   RRA, non è possibile verificare nient'altro. Se il ripristino avviene su hardware differente,
   correggete i percorsi ora anziché successivamente.

2. **Ripristinare l'albero RRD.** Collocatelo dove specificato dalla configurazione. Verificate
   proprietà e permessi: il poller scrive questi file con l'utente del poller e l'interfaccia web li
   legge con l'utente del server web. Un ripristino che preserva i contenuti ma non la proprietà
   produce un sistema che visualizza correttamente i grafici ma non raccoglie nulla.

3. **Ripristinare il database.** La tabella delle versioni nel dump deve corrispondere al codice
   sul quale si sta effettuando il ripristino. Mantenete disabilitati tutti gli avviatori e i processi di
   scrittura finché i componenti ripristinati non saranno stati verificati insieme. Un dump di una versione
   precedente ripristinato su codice più recente reindirizza l'interfaccia web al programma di installazione,
   il che è un comportamento corretto ma non quello desiderato nel bel mezzo di un ripristino.
   Ripristinate prima il codice corrispondente.

4. **Ricostruire la cache del poller.** La cache è un dato derivato, e un ripristino è esattamente
   la circostanza in cui può risultare obsoleta. La ricostruzione richiede una sola esecuzione ed
   elimina un'intera categoria di sintomi fuorvianti.

5. **Avviare il poller, quindi verificare un file.** Verificate che l'orario di ultimo aggiornamento
   di un file RRD avanzi dopo la prima esecuzione. Se i grafici risultano popolati fino al punto di
   ripristino e poi rimangono piatti, ispezionate i risultati della raccolta, le code, i timestamp, i
   percorsi e i permessi. Un grafico piatto da solo non identifica la causa.

## Trappole

**I file RRD rifiutano gli aggiornamenti nel passato.** Un file RRD non accetta un campione con timestamp
pari o precedente a quello già registrato. Il ripristino di un set di file più vecchio a fronte di un database
più recente non reinserisce automaticamente i campioni perduti. Code differite conservate o altre origini
possono contenere letture recuperabili, ma la loro riproduzione richiede una validazione separata e
l'ordinamento temporale. Senza tali letture, la raccolta riprenderà con un'interruzione nei dati. Questo è
anche il motivo per cui non è possibile unire due backup copiando file dall'uno all'altro.

**Verificate se i percorsi memorizzati sono tokenizzati prima di riscrivere qualsiasi dato.**
Le origini dati generate memorizzano il percorso come `<path_rra>/name.rrd`, e il token viene espanso
in fase di lettura in base all'impostazione del percorso RRD. Per queste, spostare l'installazione significa
modificare l'impostazione e ricostruire la cache del poller, non riscrivere le righe nel database. I percorsi
inseriti manualmente sono memorizzati in modo letterale e richiedono una riscrittura. Verificate questo aspetto
prima di eseguire un aggiornamento sull'intera tabella, poiché la conversione di percorsi tokenizzati in percorsi
assoluti è la modifica che renderà più difficile il successivo spostamento.

**I raccoglitori remoti dispongono di un proprio file di configurazione.** Ciascuno conserva le proprie
credenziali di database e l'ID del raccoglitore. Non sono inclusi nel backup centrale del database. Acquisiteli
per ciascun host.

**I dati dei plugin si trovano nello stesso database.** I plugin creano le proprie tabelle al momento
dell'installazione, quindi un dump completo del database li include. Il codice dei plugin non risiede nel
database. Se ripristinate il database senza la corrispondente directory `plugins/`, l'installazione disabiliterà
ciò che non riesce a trovare.

**Un backup mai ripristinato è solo un'ipotesi.** Eseguite periodicamente un ripristino in un'istanza di test.
Il problema che questa pratica rileva più spesso non è il danneggiamento dei file; è un backup che ha sempre
acquisito solo una delle tre parti necessarie.
