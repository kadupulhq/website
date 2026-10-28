---
title: Rimuovere i picchi dai dati
description: Esaminare le correzioni dei picchi in anteprima, conservare copie di recupero e verificare le modifiche ai campioni RRD registrati.
banner:
  content: Kadupul è in fase pre-alpha. Convalidare queste procedure in un'installazione di test isolata.
sidebar:
  order: 19
---

:::caution[Convalidare prima dell'uso]
Il codice sorgente è disponibile, ma non esiste una versione o un percorso di
migrazione ufficialmente supportato per Kadupul. Testare queste procedure su una copia isolata
con backup prima di farvi affidamento. Consultare lo [stato del progetto](/it/project/status/).
:::

:::danger[Questa operazione riscrive lo storico; il ripristino richiede un backup]
La rimozione dei picchi esporta l'archivio, modifica i valori, ripristina un file temporaneo affiancato
e sostituisce l'originale previa convalida. Non esiste un annullamento automatico. Conservate
e verificate una copia di ripristino, eseguite prima `--dryrun` e confermate i campioni interessati
prima di rendere definitiva la modifica.
:::

Per picco in questo contesto si intende uno o due campioni talmente più grandi rispetto a tutto ciò
che li circonda da costringere l'asse verticale ad adattarsi a essi, appiattendo il resto del grafico
sulla linea di base. La misurazione è errata e risulta estremamente evidente.

## Da dove provengono

La maggior parte dei picchi su un'origine dati basata su contatore ha origine aritmetica e non da una reale misurazione.
Un'origine dati di tipo contatore memorizza un tasso calcolato dalla differenza tra due
letture. Qualsiasi fattore renda la seconda lettura sproporzionatamente superiore alla prima,
in relazione all'intervallo trascorso, può produrre un falso tasso. Azzeramenti del contatore,
gestione scorretta dei limiti di scala, reindicizzazioni delle interfacce che associano letture all'origine
dati errata o errori di timestamp possono generare questa situazione. Un normale superamento del limite
non è di per sé prova di un campione difettoso; verificate la tipologia dell'origine dati e le letture fornite.

Consultare [Origini dati e RRA](/it/concepts/data-sources-and-rras/) per comprendere come viene calcolato
il tasso.

Risolvete la causa quando possibile. Rimuovere il picco è una correzione meramente cosmetica; non impedirà
il verificarsi del successivo.

## I quattro metodi

Lo strumento interviene sull'intero file: estrae ciascun archivio nel file RRD, stabilisce
quali valori sostituire e ripristina il risultato.

| Metodo | Cosa seleziona | Richiede una finestra |
|---|---|---|
| `stddev` | Valori distanti più di N deviazioni standard dalla media | No |
| `variance` | Valori superiori di oltre N percento rispetto alla media dopo l'eliminazione dei valori anomali | No |
| `float` | Qualsiasi elemento compreso in una finestra temporale definita | Sì |
| `fill` | Campioni sconosciuti e con valore zero compresi in una finestra temporale definita | Sì |

`stddev` e `variance` operano in autonomia. `float` e `fill` eseguono quanto indicato all'interno di un
intervallo stabilito ed entrambi falliscono immediatamente se non vengono specificati inizio e fine.

`fill` non si limita ai dati mancanti: può rimpiazzare zeri misurati con
valori diversi da zero. Non utilizzatelo su un intervallo contenente rilevazioni legittimamente inattive o pari a zero,
a meno che tale modifica non sia voluta.

Il metodo di varianza esclude gli N campioni più elevati e più bassi prima di calcolare la
media di riferimento, dove N corrisponde all'impostazione degli outlier. Ciò impedisce
che il picco stesso alteri al rialzo la soglia deputata a intercettarlo.

Qualsiasi valore selezionato viene sostituito, con tre alternative disponibili:

| Sostituzione | Risultato |
|---|---|
| `last` | L'ultimo valore valido noto. Valore predefinito. |
| `avg` | Una media calcolata per il campo/archivio; il calcolo varia a seconda del metodo. |
| `nan` | Valore sconosciuto per i metodi statistici; consultare le limitazioni del metodo a finestra di seguito. |

Il valore sconosciuto registra che non è disponibile una misurazione utilizzabile. `last` e `avg`
introducono valori che potrebbero sembrare misurazioni reali a chi esaminerà il grafico successivamente.
Selezionate la sostituzione con consapevolezza e verificate il risultato effettivamente memorizzato.

**Metodi a finestra con NaN:** impostando `--avgnan=nan`, `float` sostituisce ogni valore noto
nella finestra con sconosciuto, e `fill` sostituisce i valori pari a zero o non numerici nella
finestra con sconosciuto. I metodi statistici con limiti temporali facoltativi sostituiscono unicamente le
anomalie rilevate, pertanto non equivalgono allo svuotamento di un'intera finestra.

## Anteprima, poi applicazione

```sh
# preview this exact method and replacement
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --dryrun

# after reviewing that preview, repeat its exact selection without --dryrun
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --avgnan=nan --backup

# narrow it to a known incident
php cli/removespikes.php --rrdfile=/path/to/file.rrd \
    --method=stddev --outlier-start='2026-03-14 02:00' --outlier-end='2026-03-14 03:00' \
    --avgnan=nan --dryrun

```

Una simulazione (dry run) esporta l'RRD e lo analizza senza riscrivere il file in uso. Richiede
comunque una directory di lavoro valida e permessi di manutenzione. Un'anteprima non blocca
il file fino all'applicazione definitiva: nuovi campioni o parametri modificati possono variare il
risultato. L'esempio con delimitazione temporale impiega comunque selezione statistica; non elimina
indiscriminatamente ogni valore presente nella finestra.

Gli argomenti temporali accettano sia timestamp Unix sia stringhe di data. Una stringa non
interpretabile viene rifiutata prima della riscrittura. Utilizzate timestamp Unix quando
l'interpretazione del fuso orario potrebbe risultare ambigua.

## Cosa accade realmente al file

Dettagli fondamentali prima di operare su dati rilevanti:

1. Il file viene esportato in formato XML nella directory di backup.
2. I commenti vengono rimossi e ogni archivio viene analizzato per le statistiche.
3. I valori selezionati vengono sostituiti nell'XML.
4. Il file originale viene copiato nella directory di backup.
5. L'XML modificato viene ripristinato in un file temporaneo affiancato, convalidato e rinominato
   sull'originale preservandone proprietario, gruppo e permessi.

Il passaggio 4 costituisce la misura di sicurezza obbligatoria: se la copia fallisce, il ripristino
non viene avviato. È da tale copia, e non da un'opzione di terminale, che potrete
ripristinare i dati. La sua denominazione si basa sull'originale e può acquisire un suffisso univoco per evitare
di sovrascrivere elementi già presenti. `--backup` richiede esplicitamente un'istantanea di
recupero permanente. Esaminate i percorsi indicati e verificate le copie prima di farvi
affidamento.

L'operazione richiede directory POSIX locali attendibili e lock di manutenzione;
i soli permessi di scrittura non sono sufficienti. Rifiuta storage non supportato e un
endpoint rrdcached configurato. Interrompete i processi di scrittura esterni, che non aderiscono al
protocollo di blocco di Kadupul. Eseguite l'operazione con l'account di servizio proprietario dello storage.
Consultare i [requisiti di installazione](/it/reference/requirements/) per l'accesso allo storage.

## Impostazioni che controllano i valori predefiniti

Gli argomenti da riga di comando hanno priorità. Qualsiasi parametro non specificato deriva dalle
impostazioni di sistema, e le preferenze per utente prevalgono su quelle di sistema quando lo strumento viene
lanciato dall'interfaccia.

| Impostazione | Predefinito | Azione svolta |
|---|---|---|
| Removal method | Variance with outliers removed | Metodo da impiegare |
| Replacement method | Last known good | Valore che sostituisce il dato rimosso |
| Number of standard deviations | 10 | Soglia per il metodo `stddev` |
| Variance percentage | 1000 | Soglia per il metodo `variance` |
| Variance number of outliers | 5 | Campioni massimi e minimi scartati prima del calcolo della media |
| Max kills per RRA | 5 | Limite previsto; attualmente non applicato in modo rigido |
| RRDfile backup directory | `cache/spikekill/` under the install | Percorso di destinazione per dump e copie |
| Backup retention | 3 months | Durata di conservazione delle copie |

È disponibile anche una modalità batch: una pianificazione (ogni 6, 12, 24 o 48 ore), un orario di
riferimento e un elenco di modelli di grafici su cui intervenire. La modalità batch è disattivata per impostazione predefinita.
Attivarla comporta che il sistema modifichi gli archivi senza una supervisione diretta sul
risultato. Limitate rigorosamente l'elenco dei modelli se decidete di abilitarla.

## Insidie

**Le soglie predefinite sono volutamente ampie.** Dieci deviazioni standard e una
varianza del 1000 percento rappresentano intervalli molto estesi. Un'esecuzione che non evidenzi picchi probabilmente
non è fallita; ha semplicemente confermato che i valori risiedono entro i margini richiesti. Riducete la
soglia anziché cambiare metodo in modo arbitrario.

**Max kills per RRA vincola unicamente i metodi statistici.** Per `stddev` e
`variance`, il conteggio interessa tutte le origini dati in un archivio e si azzera nel
successivo. I metodi a finestra `float` e `fill` sostituiscono ogni valore corrispondente nella
finestra. Il riepilogo complessivo include anche le sostituzioni con NaN. Esaminate l'anteprima completa
e utilizzate una finestra temporale circoscritta.

**Un valore consolidato non può essere recuperato.** Gli archivi più remoti conservano un valore per
intervallo, già mediato. Sostituire tale valore non restituisce la misurazione
autentica dell'intervallo; inserisce semplicemente una stima ragionevole. Più si risale indietro nel tempo,
più la correzione assume i tratti di un'ipotesi.

**La directory di backup deve essere configurata e affidabile.** Il dump e le
copie di recupero vengono collocati lì. Directory mancanti, non sicure o non verificabili vengono rifiutate; non
attribuite permessi di scrittura globali a una directory per aggirare un errore.

**Tenete un registro delle modifiche oltre ai log applicativi.** Annotate operatore,
comando, intervallo temporale, percorsi di backup e verifiche prima/dopo. I soli conteggi riepilogativi
non costituiscono una prova sufficiente delle modifiche apportate.

**Eseguite l'operazione con l'account di servizio indicato.** Una sostituzione riuscita mantiene la proprietà
e i permessi del file. Root non è una scorciatoia per eludere i controlli di attendibilità sulle directory;
verificate che il normale polling sia ancora in grado di aggiornare il risultato.

**Rimuovere il picco non sistema il grafico se l'origine dati è errata.** Se una
reindicizzazione ha spostato valori sull'origine dati sbagliata, il picco è solo un
sintomo. Consultare [Risoluzione problemi dati mancanti](/it/guides/troubleshoot-missing-data/)
prima di modificare gli archivi.
