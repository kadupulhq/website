---
title: "Requisiti"
description: "Requisiti di esecuzione, archiviazione e distribuzione per pianificare il 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul è in fase pre-alfa. Convalidate queste procedure in un’installazione di prova isolata. Bozza di traduzione in attesa della revisione di una persona che conosca bene la lingua."
---

Verificato il 26 ottobre 2026 rispetto alla revisione dell’applicazione indicata di seguito. Questa base serve alla pianificazione 2026–2027 e non costituisce un impegno di rilascio o assistenza.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Ambiente di esecuzione

`main` richiede PHP 8.4 o successivo e combina Symfony 7.4 con i punti di ingresso preesistenti. La linea `lts/1.2` ha requisiti separati. Installate MySQL o MariaDB, RRDtool e un raccoglitore PHP o una compilazione compatibile di Spine. Per compilare dai sorgenti, usate le versioni di `mise.toml` tramite `mise exec`; installate le dipendenze bloccate senza aggiornarle.

## PHP

Il manifesto richiede queste estensioni oltre a PHP:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Il programma di installazione verifica separatamente, tra le altre, `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` e `zlib`. Su Unix controlla `posix` e `pcntl` per CLI; su Windows, `com_dotnet`. Superare l’installazione non dimostra che i requisiti di Composer siano soddisfatti. Controllate separatamente PHP da riga di comando e sul server web. Impostate `date.timezone`; il programma di installazione raccomanda `memory_limit=400M` e `max_execution_time=60`, oppure valori illimitati. L’estensione facoltativa `snmp` permette interrogazioni nel processo; `gettext` abilita i cataloghi di traduzione.

## Database

Usate una versione di MySQL o MariaDB mantenuta dal fornitore e convalidatela con la revisione di destinazione. Le vecchie soglie del programma di installazione per MySQL 5.6 e MariaDB 10.0 non dimostrano supporto per il 2026–2027. In `main`, `poller_output`, `poller_output_boost` e `poller_output_realtime` usano InnoDB; alcune tabelle di coordinamento usano ancora MEMORY. Non convertite tutte le tabelle allo stesso motore. Popolate `mysql.time_zone_name` e concedete all’account dell’applicazione l’accesso SELECT alla tabella.

## RRDtool

Configurate il percorso assoluto dell’eseguibile e fate corrispondere la versione configurata a quella installata. `DCOUNTER` e `DDERIVE` richiedono RRDtool 1.5 o successivo. L’archiviazione locale Unix richiede verifiche di identità POSIX e `flock` funzionante sulle directory. Fermate i processi di scrittura esterni e i demoni di cache prima della manutenzione esclusiva. Il percorso proxy preesistente è presente, ma non garantisce una distribuzione convalidata.

## net-snmp

Installate gli strumenti Net-SNMP se PHP `snmp` è assente o disabilitato. Configurate `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` e `path_snmptrap` con i percorsi dei rispettivi eseguibili. Provate il percorso scelto con la versione SNMP del dispositivo, incluso SNMPv3 su IPv6 quando applicabile; il programma di installazione preesistente sconsiglia PHP `snmp` per questa combinazione.

## Server web

Eseguite PHP tramite l’ambiente web configurato e usate TLS. Conservate le rotte preesistenti insieme a `/app.php/...`; non spostate l’intera radice dei documenti in `public/` finché restano pagine preesistenti. Configurate PATH_INFO per il punto di ingresso di compatibilità. Nginx ignora `.htaccess`; applicate regole esplicite che neghino l’accesso a sorgenti, configurazione, dipendenze, strumenti, test, segreti e stato di esecuzione prima della gestione PHP. Il prefisso URL deve corrispondere a `$url_path`.

## Pianificazione

Usate un solo meccanismo di avvio: cron, Utilità di pianificazione o il servizio del demone raccoglitore fornito. Adeguate la frequenza all’intervallo di avvio configurato. La raccolta con intervalli inferiori al minuto avviene al suo interno; cron da solo non offre tale frequenza. Eseguite i controlli con l’account del poller, fermando l’avvio abituale per evitare sovrapposizioni.

## File system

Concedete solo agli account necessari l’accesso ai percorsi RRD effettivi, ai log, alle cache e alle directory di esecuzione Symfony. La directory RRD predefinita è `rra/`. Account Unix separati per web e poller richiedono identificativi numerici espliciti in `rrd_maintenance_trusted_uids` e, per i gruppi con accesso in scrittura, `rrd_maintenance_trusted_gids`, in `include/config.php`. Ogni membro di tali gruppi deve essere attendibile. I normali permessi restano validi; l’archiviazione scrivibile da tutti viene rifiutata. Usate le stesse impostazioni di fiducia per tutti i processi di scrittura e verificate entrambi gli account prima dell’aggiornamento.

## Privilegi

Eseguite il processo web e il poller con account dedicati non privilegiati. ICMP raw richiede privilegi aggiuntivi del sistema operativo; quando non disponibili usate controlli TCP, UDP o SNMP. Non eseguite l’intera applicazione come root per abilitare ping. Windows non dispone della convalida ACL necessaria per la manutenzione distruttiva degli RRD locali; gli aggiornamenti ordinari usano conferme sincrone di RRDtool. Le prove di throughput su Unix non convalidano la capacità di Windows.

## Sulla versione di PHP

Per pianificare il 2026–2027, PHP 8.4 riceve supporto attivo fino al 31 dicembre 2026 e correzioni di sicurezza fino al 31 dicembre 2028. PHP 8.5 riceve supporto attivo fino al 31 dicembre 2027 e correzioni di sicurezza fino al 31 dicembre 2029. Sono date del progetto PHP, non una matrice di compatibilità Kadupul. Provate gli ambienti più recenti con le dipendenze bloccate prima di adottarli. Il requisito minimo PHP inferiore di Symfony non abbassa il minimo 8.4 di Kadupul. Ricontrollate i calendari ufficiali e la revisione di destinazione prima della distribuzione.

[Ottimizzazione del database](/it/guides/tune-database-performance/) · [Integrazione RRDtool](/it/reference/rrdtool-integration/) · [SNMP](/it/reference/snmp/) · [Struttura dei file](/it/reference/file-layout/) · [Installazione](/it/start/install/) · [Prerequisiti per aggiornare l’archiviazione](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Versioni PHP supportate](https://www.php.net/supported-versions.php)
