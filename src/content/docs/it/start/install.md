---
title: "Installazione"
description: "Ciò di cui Kadupul ha bisogno per funzionare e l'ordine in cui assemblare i componenti."
sidebar:
  order: 2
banner:
  content: "Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua."
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione supportata di Kadupul né
un percorso di migrazione. Verificate queste procedure su una copia isolata con backup
prima di farvi affidamento. Consultate lo [stato del progetto](/it/project/status/).
:::

Completate questa procedura una sola volta, nell'ordine indicato. Ogni passaggio termina con una
verifica. Eseguite la verifica prima di proseguire: ogni problema qui indicato è economico da
individuare adesso e costoso da scoprire dopo che il poller ha funzionato per una settimana.

Per i prerequisiti specifici dell’host, consulta [Linux su un host Windows](/it/guides/install-on-windows/) e [FreeBSD](/it/guides/install-on-freebsd/). Queste procedure non costituiscono una prova di collaudo completo.

## Ciò di cui avete bisogno prima

Kadupul è un'applicazione PHP che memorizza la configurazione in MySQL o MariaDB e
archivia le misurazioni in file RRD su disco. Questa pagina descrive una nuova installazione
del server principale a partire dal codice sorgente attuale del ramo `main`, non un aggiornamento
o la linea LTS archiviata. Quattro componenti devono essere presenti prima dell'esecuzione.

| Componente | Perché è necessario |
|---|---|
| PHP 8.4 o successivo, su una versione con supporto di sicurezza | Esegue l'interfaccia web e il poller |
| MySQL o MariaDB | Contiene dispositivi, modelli, utenti e la cache del poller |
| RRDtool | Crea e aggiorna gli archivi round-robin e genera i grafici |
| net-snmp | Fornisce gli strumenti client e le librerie utilizzate per interrogare i dispositivi |

PHP necessita inoltre delle estensioni richieste da
[il manifesto dell’applicazione](https://github.com/kadupulhq/kadupul/blob/main/composer.json),
tra cui `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`,
`pcntl`, `posix` e `sqlite3`. Installatele sia per l'ambiente a riga di comando che per quello
web. [Requisiti](/it/reference/requirements/) distingue tra i requisiti di Composer e
i controlli separati eseguiti dal programma di installazione.

## Passaggio 1: installare l'ambiente di runtime

Installate PHP con le relative estensioni, il server di database, RRDtool e net-snmp
dai pacchetti della vostra distribuzione.

**Verificatelo.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` deve elencare le estensioni richieste. L'estensione PHP `snmp` è facoltativa
quando sono disponibili gli strumenti a riga di comando di net-snmp. Composer verifica le proprie
estensioni richieste durante l'installazione delle dipendenze; il programma di installazione web
esegue un controllo separato delle estensioni. Una soluzione di ripiego a runtime non elimina
un requisito di Composer.

Le configurazioni di PHP per la riga di comando e per il server web possono differire. Verificatele
entrambe. Il programma di installazione raccomanda un valore di `memory_limit` di almeno 400M e
un `max_execution_time` di almeno 60 secondi; accetta anche i rispettivi valori illimitati
(`-1` e `0`). Valori inferiori a tali raccomandazioni generano avvisi, mentre l'assenza di
`date.timezone` costituisce un errore. Impostate un fuso orario esplicito, come ad esempio `UTC`,
e utilizzate `php --ini` per individuare la configurazione della riga di comando.

## Passaggio 2: creare il database e il relativo utente

Create un database vuoto e un utente con i privilegi per quel database. Per un database
locale, eseguite questa istruzione SQL come amministratore del database, sostituendo la password
di esempio prima dell'uso:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Utilizzate l'host corrispondente per l'account del database se PHP si connette da un'altra macchina.

Il server del database deve inoltre disporre delle tabelle dei fusi orari popolate, e l'utente Kadupul
deve disporre dell'accesso in lettura a esse nel database `mysql`. Questo è l'unico privilegio concesso
al di fuori del proprio schema. Nulla in un sistema di monitoraggio lascerebbe presagire ciò, e non è
facoltativo; il controllo seguente fallisce in sua assenza.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Verificatelo.** Accedete come utente del database Kadupul ed eseguite:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Un conteggio diverso da zero restituito senza errori di autorizzazione è il risultato atteso. Zero indica
che le tabelle non sono mai state caricate; un errore indica che l'utente non dispone dei permessi di lettura.
Entrambi i casi bloccano il programma di installazione.

Quattro delle impostazioni proprie del server sono sufficientemente importanti da dover essere corrette ora.

| Impostazione | Valore desiderato | Motivo |
|---|---|---|
| `max_allowed_packet` | 16M o superiore | Sincronizzazioni di grandi dimensioni tra il server principale e i collector remoti |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Le descrizioni dei dispositivi contengono caratteri multibyte |
| `innodb_file_per_table` | On | Mantiene gli spazi tabella separati e gestibili |
| `innodb_buffer_pool_size` | Circa un quarto della memoria di sistema | Mantiene il set di lavoro in memoria |

Il programma di installazione rileva autonomamente questi valori e segnala ciò che non è conforme,
pertanto non è necessario accettare la tabella a scatola chiusa. [Ottimizzare le prestazioni del
database](/it/guides/tune-database-performance/) approfondisce ulteriormente l'argomento una volta presente un carico di lavoro.

## Passaggio 3: estrarre l'archivio, correggere la proprietà e distribuirlo

Collocate l'applicazione in una posizione da cui il server web possa servirla, quindi decidete quale
utente di sistema ne sia il proprietario. Questa decisione è più importante della posizione stessa. Due
processi eseguono operazioni di scrittura qui: il server web e il processo che pianifica il poller. Eseguite
entrambi con lo stesso utente. Eseguite il poller senza privilegi elevati e assegnate a entrambi i processi
l'accesso di cui hanno bisogno. Proprietà o modalità non corrette possono impedire successivi aggiornamenti
anche quando i grafici vengono regolarmente generati.

### Se avete clonato il repository anziché estrarre una release

Un checkout Git necessita sia delle dipendenze PHP sia degli asset del browser generati. Con i runtime
del file `mise.toml` del repository installati, eseguite dalla directory radice del repository:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console asset-map:compile
mise exec -- php bin/console about
```

Composer popola `include/vendor/` e ripristina i file di compatibilità fissati.
La build npm crea gli asset in `include/js/`, `include/fa/` e
`include/vendor/flag-icons/`. Composer da solo non è sufficiente per un'installazione da sorgenti.

Un archivio offline completo di dipendenze è un artefatto di build separato. Un generico archivio sorgente
di GitHub non costituisce tale pacchetto. Seguite la
[procedura di compilazione e verifica offline](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation)
quando l'host di destinazione non dispone di accesso a Internet.

Preparate i percorsi scrivibili dopo l'installazione delle dipendenze:

| Gruppo | Directory | Scrivibile quando |
|---|---|---|
| Durante l'installazione | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Solo durante l'installazione o l'aggiornamento |
| Durante l'installazione | `include/vendor/csrf/` o la posizione configurata per `path_csrf_secret` | Il programma di installazione deve creare il segreto specifico per l'installazione; conservatelo successivamente |
| Sempre | `log`, `cache/boost`, `cache/mibcache`, `cache/realtime`, `cache/spikekill`, la directory temporanea di sistema | Per tutta la durata dell'installazione |
| Runtime di Symfony | `var/cache`, e `var/log` se è configurata la registrazione su file | Per il runtime PHP e l'utente che riscalda la cache |

Anche la directory RRD deve essere scrivibile per l'intera durata dell'installazione. Essa contiene
la vostra cronologia, quindi riservatele la stessa cura che dedichereste alla directory di un database.

L'attuale migrazione richiede ancora le rotte legacy per accesso, installatore e plugin. Per questa
installazione combinata, servite la radice del repository con regole esplicite che neghino l'accesso
alle directory private, alla configurazione, alle dipendenze e allo stato di esecuzione. Non spostate
l'intera installazione su `public/`: ciò rimuoverebbe le rotte legacy ancora in uso. L'endpoint separato
di Symfony presenta un routing diverso; consultate [le istruzioni per la migrazione](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

Per Nginx, iniziate dalle
[regole di posizione Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf)
del repository, adattando la radice e l'upstream PHP-FPM. Mantenete le regole di divieto prima della
gestione generica di PHP e preservate PATH_INFO per `/app.php/...`. Nginx non legge `.htaccess`.
Mantenete i file RRD, i log e i segreti inaccessibili tramite HTTP; verificate l'effettiva configurazione
del server anziché presumere che i permessi dei file ne impediscano l'erogazione.

**Verificatelo.** Passate all'utente del poller, scrivete un file in ciascuna directory del gruppo sempre
e poi eliminatelo. Un permesso che appare corretto in `ls -l` può comunque essere negato da SELinux
o AppArmor, e la scrittura del file è l'unica verifica che rileva tale condizione. Richiedete quindi un file
nella directory dei log tramite HTTP. Il comportamento atteso è un rifiuto di accesso.

## Passaggio 4: creare il file di configurazione

Per una nuova installazione, copiate il file di configurazione distribuito:

```bash
cp include/config.php.dist include/config.php
```

Non sovrascrivete la configurazione di un'installazione esistente. Impostate l'host del database, il nome,
l'utente e la password dal passaggio 2. Altri due valori sono importanti in una prima installazione:
`url_path`, il percorso con cui l'applicazione viene servita comprensivo di barre iniziale e finale, e
`poller_id`, che è `1` su un server principale e assume un valore diverso solo su un collector remoto.

Lasciate commentato il blocco del collector remoto. Non ne state ancora configurando uno;
[Raccolta dati remota](/it/concepts/remote-data-collection/) ne descrive la procedura per quando sarà necessario.
Tutte le altre impostazioni presentano un valore predefinito funzionante, pertanto leggete
[Configurazione](/it/reference/configuration/) prima di modificarne alcuna.

Configurate una chiave `APP_SECRET` specifica per l'ambiente nell'ambiente dei processi PHP per le
funzionalità di Symfony che la utilizzano. Il bootstrap adotta come predefiniti `APP_ENV=prod` e
`APP_DEBUG=0` e non carica file `.env`. Questo elemento è separato dal segreto CSRF del programma di
installazione legacy.

**Verificatelo.** Controllate la sintassi senza mostrare le credenziali:

```bash
php -l include/config.php
```

Importate lo schema nel passaggio successivo prima di aprire il programma di installazione in un browser.

## Passaggio 5: importare lo schema

Il programma di installazione presuppone che le tabelle siano già presenti. Caricate lo schema
fornito nel database creato:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Eseguite questa operazione una sola volta, su un database vuoto. Non si tratta di uno script di aggiornamento;
importarlo in un database già popolato può causare errori o lasciare dati incoerenti e parziali.

## Passaggio 6: eseguire il programma di installazione

Aprite il sito in un browser e seguite la procedura guidata. Il programma di installazione segue una
sequenza prestabilita, e ciascun passaggio abilita il successivo:

1. Benvenuto e licenza.
2. Controllo delle dipendenze: versione ed estensioni di PHP, impostazioni di PHP del passaggio 1 sia
   per la riga di comando che per il server web, tabelle dei fusi orari e impostazioni del database
   del passaggio 2. Gli errori bloccano il pulsante avanti. Gli avvisi non lo bloccano, ma leggeteli.
3. Tipo di installazione: un nuovo server principale o un collector remoto.
4. Controllo dei permessi: le directory del passaggio 3, verificate tramite tentativi di scrittura.
5. Percorsi dei binari: i percorsi di PHP, RRDtool e degli strumenti net-snmp.
6. Profilo dell'origine dati e intervallo del launcher.
7. Selezione dei modelli: quali modelli di dispositivo caricare.
8. Conversione delle tabelle, conferma e l'installazione vera e propria.

Il punto 6 di questo elenco è quello più difficile da annullare. Il profilo scelto stabilisce il passo
e il set di archivi scritti in ogni file RRD creato successivamente, e la modifica del profilo non migra i
file esistenti. Le modifiche alla conservazione dei dati richiedono una migrazione separata e collaudata;
non sempre comportano la perdita dello storico. Se i picchi sono rilevanti, assicuratevi che il profilo
conservi i massimi e non solo le medie: leggete [Origini dati e archivi round-robin](/it/concepts/data-sources-and-rras/)
prima di superare questo passaggio. L'intervallo del launcher proposto è di un minuto o cinque minuti. Il profilo
dell'origine dati definisce l'intervallo di raccolta; il launcher e il profilo devono essere configurati
in modo coerente.

## Passaggio 7: modificare le credenziali predefinite

Lo schema fornito crea un account amministratore denominato `admin` con password `admin`, configurato
in modo che il primo accesso imponga una modifica. Crea inoltre un account guest disabilitato. Modificate
la password prima che l'istanza sia raggiungibile da altri, ossia prima di collegarla a una rete instradabile
da terzi.

## Passaggio 8: pianificare il poller

Il poller deve essere avviato dall'esterno. Configurate l'intervallo di raccolta e l'intervallo del
launcher in modo coerente; il poller supporta intervalli del launcher di un minuto o cinque minuti e dispone
di un meccanismo di protezione contro esecuzioni ordinarie anticipate. Per un launcher a un minuto,
inserite questa voce nel crontab dell'utente non privilegiato del poller, sostituendo `php` e il percorso
dell'applicazione con i relativi percorsi assoluti:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

oppure eseguite il demone `cactid.php` fornito utilizzando `service/cactid.service`, opportunamente
adattato per il vostro percorso di installazione e per l'utente non privilegiato. Utilizzate un solo
meccanismo di avvio: disabilitate il cron job o il timer quando utilizzate il demone.

Allineate la pianificazione effettiva all'intervallo del launcher configurato. Per profili di raccolta
inferiori al minuto, il poller avviato esegue cicli di raccolta all'interno di tale intervallo; non
tentate di esprimere una frequenza inferiore al minuto tramite questa voce di cron.

**Verificatelo.** Eseguite manualmente un ciclo come utente del poller:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` ignora il controllo temporale di sicurezza per le esecuzioni anticipate. Utilizzate questa verifica
manuale con il pianificatore arrestato, in modo che non si sovrapponga a un'esecuzione programmata. Non
aggira altri controlli di manutenzione o sicurezza. L'esito atteso è un completamento pulito con una riga
riassuntiva. Abilitate quindi il pianificatore e lasciatelo operare indisturbato per due intervalli; confermate
che un'ulteriore esecuzione sia avvenuta in autonomia.

## Cosa può andare storto

Questi sono i problemi che si verificano effettivamente durante una prima installazione.

| Sintomo | Causa | Dove verificare |
|---|---|---|
| Il programma di installazione si blocca su impostazioni PHP che appaiono corrette | Il server web e la riga di comando leggono file `php.ini` differenti | `php --ini`, e il file segnalato dal SAPI web |
| Il programma di installazione si blocca sui fusi orari | Tabelle dei fusi orari non caricate, oppure l'utente Kadupul non può leggerle | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Il passaggio dei permessi fallisce su una directory che appare scrivibile | Proprietario errato, oppure SELinux e AppArmor | Scrivere un file come utente del poller |
| L'installazione si completa, ma i dati non arrivano mai | Poller mai pianificato | Eseguire manualmente `poller.php --force --debug` |
| Dati presenti per pochi cicli, poi nulla | Poller eseguito con l'utente errato, che lascia file non aggiornabili dall'utente web | Proprietario dei file nella directory RRD |
| Grafici con frequenti piccoli vuoti | L'intervallo pianificato e l'intervallo configurato non coincidono | Il crontab, rispetto all'intervallo configurato |
| Composer rifiuta l'installazione | La versione di PHP è inferiore a 8.4 o manca un'estensione richiesta dal manifesto | `php -v`, `php -m`, e l'output di errore di Composer |
| Il poller non può eseguire più di un processo | Mancanza di `pcntl` o `posix` | `php -m` |

[Registrazione dei log](/it/reference/logging/) descrive dove ciascun componente registra le informazioni.
[Risoluzione dei problemi relativi ai dati mancanti](/it/guides/troubleshoot-missing-data/) illustra il caso
in cui l'installazione sia corretta ma un singolo dispositivo presenti anomalie.

## Prima di esporlo

Il poller viene eseguito come utente di sistema ed esegue RRDtool e i vostri script di raccolta.
Trattate l'installazione come qualcosa che esegue comandi, perché di fatto è ciò che fa.

- Servite l'applicazione tramite TLS.
- Non lasciate la password di amministratore predefinita, neppure temporaneamente.
- Limitate l'utente del database al proprio database.
- Mantenete le directory RRD e dei log esterne alla radice dei documenti del web server.
- Lasciate l'account guest disabilitato, a meno che non decidiate diversamente.

[Proteggere un'installazione esposta a Internet](/it/guides/secure-an-internet-facing-install/)
fornisce le indicazioni rimanenti. Passaggio successivo: [Aggiungere il primo dispositivo](/it/start/first-device/).
