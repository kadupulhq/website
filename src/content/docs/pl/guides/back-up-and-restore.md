---
title: "Kopia zapasowa i przywracanie"
description: "Trzy elementy muszą zostać przechwycone razem, inaczej kopia nie jest kompletna, a kolejność ich przywracania ma znaczenie."
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
sidebar:
  order: 7
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Kompletny zestaw ratunkowy Kadupul składa się z trzech części. Częściowe kopie zapasowe mogą
przywrócić konfigurację lub pomiary, ale nie odtworzą całej instalacji.

| Część | Co zawiera | Gdzie się znajduje |
|---|---|---|
| Baza danych | Urządzenia, szablony, użytkowników, uprawnienia, pamięć podręczną pollera oraz ścieżkę każdego pliku RRD | MySQL lub MariaDB |
| Pliki RRD | Zachowane pomiary i skonsolidowane archiwa | Katalog RRA, domyślnie `rra/` w katalogu instalacji |
| Konfiguracja | Dane uwierzytelniające bazy danych, ścieżki, konfigurację kolektora, kod wtyczek i skryptów | `include/config.php`, plik konfiguracyjny spine, `plugins/`, `scripts/`, `resource/` |

## Co może przywrócić kopia zapasowa samej bazy danych

Baza danych zawiera definicje wykresów i konfigurację monitorowania, podczas gdy pliki RRD
przechowują historyczne archiwa wykresów. Po włączeniu Boost ostatnie odczyty mogą również
znajdować się w kolejkach bazy danych, dopóki nie zostaną zrzucone do plików. Zachowaj te
kolejki jako część kopii zapasowej bazy danych. Zobacz [Architektura](/pl/concepts/architecture/).

Przywrócenie samej bazy danych daje system, który wie o czterystu urządzeniach, ma zdefiniowany
każdy wykres i rysuje każdy z nich pusty. Rozpocznie zbieranie danych na nowo od momentu
uruchomienia pollera, a historia przepadnie.

## Czego brakuje w kopii zapasowej samych plików RRD

Plik RRD zawiera nazwane źródła danych, definicje archiwów i wartości, ale nie zawiera
pełnych metadanych Kadupul dotyczących urządzeń, zapytań, wykresów i uprawnień potrzebnych
do ponownego powiązania tych wartości z aplikacją.

Mapowanie z "bajtów przychodzących na porcie 3 przełącznika 12" na ścieżkę na dysku znajduje się
w bazie danych, w kolumnie źródła danych. Przywrócenie samego drzewa plików pozostawia kilka
tysięcy plików pełnych liczb, bez możliwości ustalenia, który jest który, poza ich ręczną
inżynierią wsteczną.

Te dwa elementy tworzą jedną kopię zapasową. Traktuj je w ten sposób.

## Spójność między nimi

W tym miejscu większość procedur tworzenia kopii zapasowych po cichu popełnia błąd.

Poller zapisuje dane do plików RRD w sposób ciągły. Plik kopiowany w trakcie trwania
aktualizacji może zostać przechwycony w połowie zapisu. W tym samym czasie trwa zapis
do bazy danych. Jeśli zrzucisz bazę danych o 02:00, a zaczniesz kopiować pliki o 02:20,
obie połówki opisują różne momenty, a każde źródło danych utworzone lub usunięte w międzyczasie
będzie niezgodne.

Odłożone zapisy RRD czynią tę sytuację jeszcze trudniejszą i ciekawszą. W tym trybie poller
nie zapisuje plików RRD przy każdym przebiegu. Wyniki gromadzą się w trwałej tabeli bazy
danych i są zrzucane zbiorczo później. Zatem baza danych może zasadnie wyprzedzać pliki RRD
nawet o interwał opróżniania, przechowując rzeczywiste pomiary, których nie ma nigdzie indziej
na dysku.

Wybierz jedno z poniższych rozwiązań, w kolejności malejących preferencji:

**Skoordynowana migawka.** Użyj procedury tworzenia kopii zapasowej lub wyciszania obsługiwanej
przez silnik bazy danych i skoordynuj ją z migawkami całej pamięci RRD oraz konfiguracji
aplikacji. Sama migawka systemu plików nie zapewnia spójności między osobnymi wolumenami,
zdalnymi kolektorami, oczekującymi kolejkami czy aktywną bazą danych.

**Wyciszona kopia logiczna.** Wyłącz zaplanowane programy uruchamiające i innych producentów,
poczekaj na zakończenie już działających kolektorów, następnie opróżnij odłożone zapisy i
poczekaj na procesy robocze zrzucania. Utrzymuj zmiany konfiguracji, konserwację i inne procesy
zapisujące do RRD w stanie zatrzymania przez cały czas przechwytywania. Przerwy w zbieraniu
danych mogą powodować brakujące próbki; ich widoczność zależy od interwału heartbeat i konsolidacji.

Przed uruchomieniem tego przykładu ukończ te kroki wyciszania i zweryfikuj stan kolejki oraz
procesów roboczych. Zwrócenie zera przez `poller_boost.php --force` samo w sobie nie jest dowodem
pełnego opróżnienia: już zarejestrowany proces Boost może spowodować jego zakończenie bez
wykonania pracy. Skoordynuj wszelkie usługi rrdcached lub zdalną pamięć masową osobno.

Ten przykład Bash zakłada lokalną pamięć masową, konto bazy danych skonfigurowane w prywatnym
pliku opcji klienta oraz katalog RRA zawierający wszystkie zarządzane pliki RRD. Zastąp każdą
ścieżkę. Zinwentaryzuj niestandardowe bezwzględne ścieżki RRD, cele dowiązań symbolicznych,
zewnętrzną konfigurację i zdalne kolektory, a także przechwyć je osobno.

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

Archiwum aplikacji obejmuje konfigurację i pasujący kod. Zapisz wersję źródłową, wersje bazy
danych i RRDtool, rzeczywiste ścieżki pamięci oraz stan wyłączenia/opróżnienia procesów
zapisujących obok zestawu. Przykład wyklucza zwykłe dzienniki, pamięć podręczną i metadane Git;
przejrzyj te wykluczenia dla swojej instalacji.

Tylko pomyślnie przechwycony i zweryfikowany sumami kontrolnymi zestaw otrzymuje ostateczną
nazwę katalogu. Nieudane polecenie może nadal pozostawić obcięty plik wewnątrz `.partial-*`;
`set -e` zatrzymuje kolejne polecenia, ale nie usuwa już utworzonych danych wyjściowych. Nie
promuj tego katalogu do ukończonej kopii zapasowej. Sumy kontrolne wykrywają późniejsze
zmiany, a nie logiczną kompletność; test przywracania jest nadal wymagany.

`--single-transaction` obejmuje tabele transakcyjne, a nie spójną migawkę nietransakcyjnych
tabel wtyczek czy równoległych zmian schematu. Utrzymuj procesy zapisujące i zmiany schematu
w stanie zatrzymania lub użyj metody tworzenia kopii odpowiedniej dla danego silnika. Wznów
zbieranie danych dopiero po potwierdzeniu, że przechwytywanie zostało zakończone, a pamięć
jest użyteczna. Zobacz [dokumentacji mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html),
aby poznać wymagania dotyczące transakcji i uprawnień. Pominięcia wcześniejszej receptury
są śledzone w [website #12](https://github.com/kadupulhq/website/issues/12).

**Zaakceptuj rozbieżność czasową i odnotuj ją.** Niezależnie od tego, którą część przechwycisz
jako pierwszą, będzie ona starsza, a żadna kolejność sama z siebie nie czyni aktywnej pary
spójną. Zapisz okno czasowe; to właśnie sprawia, że wynik nadaje się do odzyskania.

Jeśli najpierw wykonasz zrzut bazy danych, a potem skopiujesz pliki, pliki będą nowsze. Źródło
danych usunięte wewnątrz tego okna nadal znajduje się w zrzucie, ale jego plik zniknął,
pozostawiając odwołanie, które poller utworzy ponownie. Źródło danych utworzone wewnątrz okna
pojawi się jako plik, o którym baza danych nie wie, więc pozostanie bezczynny.

Jeśli najpierw skopiujesz pliki, a potem wykonasz zrzut bazy danych, baza danych będzie nowsza.
Źródło danych utworzone wewnątrz okna znajdzie się w zrzucie bez pliku za nim, co poller
odtworzy jako puste.

Każda z tych kolejności może doprowadzić do utraty historii sprzed okna, jeśli potrzebny plik
zostanie usunięty, zanim zostanie skopiowany. Może to również przechwycić częściowo zapisany plik
lub niespójne próbki w kolejce. Zarejestrowanie rozbieżności dokumentuje ograniczenie; nie czyni
ono niespójnej pary kompletną ani nie gwarantuje możliwości odzyskania.

## Co znajduje się w kopii zapasowej, o czym nie pomyślano

Dane uwierzytelniające urządzeń znajdują się w bazie danych w postaci jawnego tekstu. Pamięć
podręczna pollera zawiera ciągi community SNMP oraz nazwy użytkowników, hasła i hasła klucza SNMPv3
jako zwykłe kolumny, ponieważ kolektor potrzebuje ich przy każdym przebiegu. Plik konfiguracyjny
zawiera hasło do bazy danych.

Kopia zapasowa Kadupul jest zatem magazynem danych uwierzytelniających dla każdego monitorowanego
urządzenia. Szyfruj ją w spoczynku, ogranicz uprawnienia do jej odczytu i nie umieszczaj jej
na ogólnodostępnym udziale plików.

## Kolejność przywracania

Kolejność ma znaczenie, ponieważ każdy krok zależy od poprzedniego.

1. **Najpierw przywróć konfigurację.** Bez danych uwierzytelniających bazy danych i ścieżki
   RRA nic innego nie może zostać sprawdzone. Jeśli przywracanie odbywa się na innym sprzęcie,
   popraw ścieżki teraz, a nie później.

2. **Przywróć drzewo RRD.** Umieść je tam, gdzie wskazuje konfiguracja. Sprawdź prawo własności
   i uprawnienia: poller zapisuje te pliki jako użytkownik pollera, a interfejs WWW odczytuje je
   jako użytkownik serwera WWW. Przywrócenie, które zachowuje zawartość, ale nie prawa własności,
   daje system, który poprawnie rysuje wykresy, ale niczego nie zbiera.

3. **Przywróć bazę danych.** Tabela wersji w zrzucie musi być zgodna z kodem, na który następuje
   przywracanie. Pozostaw wszystkie programy uruchamiające i zapisujące wyłączone, dopóki
   przywrócone komponenty nie zostaną sprawdzone razem. Zrzut ze starszego wydania przywrócony
   na nowszym kodzie kieruje interfejs WWW do instalatora, co jest prawidłowym zachowaniem,
   ale niepożądanym w trakcie odzyskiwania systemu. Najpierw przywróć pasujący kod.

4. **Odbuduj pamięć podręczną pollera.** Pamięć podręczna jest generowana wtórnie, a przywracanie
   jest dokładnie taką sytuacją, w której może być nieaktualna. Odbudowa kosztuje jedno
   uruchomienie i eliminuje całą kategorię mylących objawów.

5. **Uruchom poller, a następnie sprawdź jeden plik.** Potwierdź, że czas ostatniej aktualizacji
   pliku RRD przesuwa się po pierwszym uruchomieniu. Jeśli wykresy są wypełnione do punktu
   przywrócenia, a potem płaskie, sprawdź wyniki zbierania, kolejki, znaczniki czasu, ścieżki
   i uprawnienia. Sam płaski wykres nie wskazuje przyczyny."

## Pułapki

**Pliki RRD odrzucają aktualizacje z przeszłości.** Plik RRD nie zaakceptuje próbki z sygnaturą
czasu wcześniejszą lub równą tej, którą już posiada. Przywrócenie starszego zestawu plików wobec
nowszej bazy danych samo z siebie nie uzupełni utraconych próbek. Zachowane odłożone kolejki
lub inne źródła mogą zawierać możliwe do odzyskania odczyty, ale ich ponowne zastosowanie wymaga
osobnej weryfikacji i uporządkowania według znaczników czasu. Bez tych odczytów zbieranie danych
będzie kontynuowane z luką. Jest to również powód, dla którego nie można połączyć dwóch kopii
zapasowych poprzez kopiowanie plików między nimi.

**Sprawdź, czy przechowywane ścieżki są stokenizowane, zanim cokolwiek zmodyfikujesz.**
Wygenerowane źródła danych przechowują ścieżkę jako `<path_rra>/name.rrd`, a token jest
rozwijany podczas odczytu na podstawie ustawienia ścieżki RRD. W ich przypadku przeniesienie
instalacji oznacza zmianę ustawienia i przebudowę pamięci podręcznej pollera, a nie modyfikację
wierszy. Ścieżki wprowadzone ręcznie są przechowywane dosłownie i wymagają modyfikacji. Sprawdź
to przed uruchomieniem aktualizacji w całej tabeli, ponieważ zamiana stokenizowanych ścieżek
na bezwzględne to zmiana, która utrudnia kolejną przeprowadzkę.

**Zdalne kolektory mają własny plik konfiguracyjny.** Każdy z nich przechowuje własne dane
uwierzytelniające bazy danych oraz identyfikator kolektora. Nie ma ich w centralnej kopii
zapasowej bazy danych. Zapisuj je osobno dla każdego hosta.

**Dane wtyczek znajdują się w tej samej bazie danych.** Wtyczki tworzą własne tabele w momencie
instalacji, więc pełny zrzut bazy danych je obejmuje. Kod wtyczek nie znajduje się w bazie danych.
Jeśli przywrócisz bazę danych bez pasującego katalogu `plugins/`, instalacja wyłączy to, czego
nie może znaleźć.

**Kopia zapasowa, której nie przywrócono, jest tylko hipotezą.** Przeprowadzaj przywracanie do
instancji tymczasowej zgodnie z harmonogramem. Najczęstszym problemem wykrywanym w ten sposób
nie jest uszkodzenie danych; jest to kopia zapasowa, która od początku przechwytywała tylko
jedną z trzech części.
