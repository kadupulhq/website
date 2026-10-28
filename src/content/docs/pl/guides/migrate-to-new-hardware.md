---
title: Migracja na nowy sprzęt
description: Przenoszenie działającej instalacji na inny serwer bez utraty historii, w kolejności zapewniającej weryfikowalność każdego kroku.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 20
---

:::caution[Odziedziczone zachowanie proxy RRDtool]
Wdrożenie proxy RRDtool nie jest obsługiwane w Kadupul. Używaj lokalnego magazynu
RRDtool (`storage_location = 0`). Ustawienia proxy, opisy protokołów i procedury
na tej stronie dokumentują odziedziczone zachowanie, a nie obsługiwane wdrożenie
lub ścieżkę migracji. Zobacz [proxy RRDtool](/pl/reference/rrdproxy/).
:::

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Migracja to przywrócenie na maszynę różniącą się od tej, z której pochodzi kopia zapasowa.
Wszystko opisane w rozdziale [Kopia zapasowa i przywracanie](/pl/guides/back-up-and-restore/)
ma zastosowanie tutaj; ta strona omawia wyłącznie kwestie wynikające z faktu, że miejsce docelowe
nie jest tożsame ze źródłem.

Trzy kwestie ulegają zmianie i każda niesie za sobą własny rodzaj awarii.

| Różnica | Co powoduje awarię |
|---|---|
| Różne ścieżki | Zapisane ścieżki plików w bazie danych oraz w pamięci podręcznej pollera |
| Różne identyfikatory użytkowników i grup | Dostęp do plików i kontrole zaufania magazynu mogą zakończyć się błędem |
| Różne wersje środowiska uruchomieniowego | Rozszerzenia, zachowanie bazy danych i kompatybilność RRD mogą się różnić |

## Zanim czegokolwiek dotkniesz

Zbuduj najpierw środowisko docelowe i doprowadź je do stanu, w którym zadziałałaby świeża
instalacja: działający serwer bazy danych, zainstalowane wymagane rozszerzenia PHP, obecny RRDtool,
dostępny wybrany kolektor oraz skonfigurowany serwer WWW. Pozostaw jego poller, zaplanowane zadania,
zdalną replikację i wychodzące powiadomienia wyłączone. Nie uruchamiaj instalatora. Będziesz
zastępować bazę danych, a częściowo zainstalowany schemat jest trudniejszy do diagnozowania niż pusty.

Dopasuj dokładnie wersję aplikacji i jej zależności, w tym lokalne modyfikacje i wtyczki. Tabela
`version` w bazie danych przechowuje wersję schematu, a nie każdą zmianę w kodzie źródłowym;
dopasowanie wyłącznie tej wartości jest niewystarczające. Przekierowanie do instalatora może
wskazywać na niezgodność schematu lub niekompletne przywrócenie danych. Zainstaluj dokładnie ten
sam kod, który opuszczasz, przeprowadź migrację, upewnij się, że działa, a następnie zaktualizuj
go w osobnym kroku zgodnie z instrukcją [Bezpieczna aktualizacja](/pl/guides/upgrade-safely/).

Zdecyduj o ścieżce instalacji już teraz. Utrzymanie jej w identycznej postaci na obu maszynach
eliminuje większość opisanych poniżej prac. Jeśli nie możesz tego zrobić, przeczytaj sekcję
o ścieżkach przed rozpoczęciem prac.

## Kolejność operacji

Każdy krok sprawdza wynik poprzedniego, dlatego nie zmieniaj ich kolejności.

1. **Zatrzymaj wszystkich producentów danych na źródle i celu.** Zatrzymaj zbieranie danych i konserwację: planowane, zdalne, wyzwalane przez sieć WWW i ręczne; pozwól dokończyć działanie bieżącym przebiegom. Zrzucaj odroczone zapisy dopiero po zatrzymaniu producentów. Zachowaj niepotwierdzone wiersze kolejki wraz z powiązaną kopią zapasową bazy danych i plików RRD; nie czyść ich poleceniem truncate.
2. **Wykonaj kopię zapasową.** Baza danych, drzewo RRD, konfiguracja, zarejestrowane łącznie. Zasady spójności z rozdziału [Kopia zapasowa i przywracanie](/pl/guides/back-up-and-restore/) to podstawa całego procesu.
3. **Przenieś drzewo RRD.** Szczegóły znajdziesz poniżej.
4. **Przenieś bazę danych.**
5. **Przenieś kod, konfigurację i wszystko, na co wskazuje konfiguracja.** Obejmuje to `plugins/`, `scripts/`, `resource/` oraz każdy lokalny plik wywoływany przez metodę wprowadzania danych.
6. **Zastosuj ponownie konfigurację docelową po ostatecznym przywróceniu.** Skoryguj ścieżki, punkty końcowe bazy danych, uprawnienia własności usług oraz numeryczne ustawienia zaufania magazynu.
7. **Przebuduj pamięć podręczną pollera.**
8. **Wykonaj kontrole magazynu na każdym koncie usługowym, a następnie uruchom zbieranie danych wyłącznie na maszynie docelowej.** Obserwuj reprezentatywne pliki oraz głębokość zachowanej kolejki.

## Przenoszenie drzewa RRD

Plik RRD to plik binarny o układzie wewnętrznym zależnym od środowiska, w którym powstał. Kopia
binarna wymaga w pełni zgodnej architektury i formatu RRDtool; zgodność samej nazwy systemu
operacyjnego lub szerokości słowa nie stanowi wystarczającego dowodu. Brak kompatybilności może
skutkować błędami odczytu. Sprawdź skopiowane pliki przy użyciu narzędzia RRDtool na maszynie docelowej.

Jeśli nie masz pewności, czy oba systemy są zgodne, wykonaj konwersję zamiast bezpośredniego kopiowania.
Natywne polecenia dump i restore narzędzia RRDtool tworzą przenośną postać tekstową; Kadupul używa
wewnętrznie tej samej pary operacji, gdy zachodzi potrzeba przepisania archiwum.

Na maszynie źródłowej, po wstrzymaniu procesów zapisujących, użyj nowego prywatnego katalogu roboczego:

```sh
set -eu
umask 077
rrdtool dump /path/to/source/file.rrd > /private/staging/file.xml.partial
mv /private/staging/file.xml.partial /private/staging/file.xml
```

Prześlij bezpiecznie wygenerowany plik XML. Przywróć go na maszynie docelowej do nowego pliku testowego:

```sh
set -eu
umask 077
rrdtool restore /private/staging/file.xml /private/staging/file.candidate.rrd
rrdtool info /private/staging/file.candidate.rrd
```

Powtórz operację dla każdego pliku wymagającego konwersji i sprawdzaj kod zakończenia każdego
polecenia. Nie instaluj częściowych zrzutów ani niezweryfikowanych kandydatów. RRDtool dokumentuje
format XML jako [format transferu między różnymi architekturami](https://oss.oetiker.ch/rrdtool/doc/rrddump.en.html).

Upewnij się, zanim zdecydujesz się na powolną ścieżkę. Skopiuj jeden plik, uruchom na nim `rrdtool info`
w miejscu docelowym i porównaj krok, archiwa, czas ostatniej aktualizacji oraz nazwy źródeł danych.
Porównaj również wyniki polecenia `fetch` w znanym przedziale wypełnionym danymi. Powtórz to dla
reprezentatywnych struktur archiwów przed przetransferowaniem całego drzewa, a następnie zweryfikuj
pełną listę plików. Zobacz [Naprawa uszkodzonego pliku RRD](/pl/guides/recover-a-corrupted-rrd/)
w celu zapoznania się z walidacją kandydatów i wymaganiami dotyczącymi uprawnień.

Niezależnie od sposobu transferu, zachowaj strukturę katalogów w niezmienionej postaci. Zagnieżdżone
podkatalogi wewnątrz katalogu RRA nie są ozdobą; ścieżka każdego pliku jest rejestrowana dla danego
źródła danych, a spłaszczenie drzewa uniemożliwi działanie każdego z nich.

## Baza danych

Zrzut i załadowanie. Dwie rzeczy do sprawdzenia po drugiej stronie.

Zbadaj zestawy znaków, metody porównywania znaków (collation) i silniki pamięci przywróconych tabel,
a nie tylko wartości domyślne serwera. Zachowaj definicje źródłowe i sprawdź zgodność z wersją
bazy danych w miejscu docelowym przed ostatecznym przełączeniem.

**Kolejki kolektora to nie tymczasowe pamięci podręczne.** Bieżąca kolejka `poller_output` musi
bezwzględnie korzystać z InnoDB. Wstępna weryfikacja magazynu odrzuca kolejkę MEMORY. Zachowaj jej
wiersze oraz kolejki boost i czasu rzeczywistego do momentu potwierdzenia próbek; kopia zapasowa RRD
może jeszcze nie zawierać tych pomiarów. Nie zakładaj, że przywrócona tabela MEMORY jest pusta:
zrzut logiczny może zawierać polecenia insert, które ponownie ją zapełnią.

Przy zatrzymanych procesach zapisujących i zabezpieczonych kopiach zapasowych odziedziczona
kolejka inna niż InnoDB może zostać jawnie przekonwertowana:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Uruchom weryfikację magazynu pod każdym rzeczywistym kontem WWW i pollera. Sprawdza ona dostęp do
lokalnego magazynu oraz wybraną kolejkę; powodzenie z uprawnieniami roota nie gwarantuje dostępu
usług. Aktywne zdalne kolektory standardowo komunikują się z kolejką główną; używaj `--local`
tylko wtedy, gdy celowo testujesz ich lokalną kolejkę. Pozostałe tabele pomocnicze i pamięci
podręcznej wymagają sprecyzowanego planu zachowania lub przebudowy. Zobacz [wymagania systemowe](/pl/reference/requirements/).

## Ścieżki po drugiej stronie

W tym miejscu migracje najczęściej zawodzą, ponieważ większość tych elementów pozostaje niewidoczna
aż do pierwszego przebiegu zbierania danych.

**Ścieżka RRA.** Standardowe ścieżki źródeł danych korzystają ze znacznika `<path_rra>`. W tej
wersji mechanizm startowy wyprowadza `$config['rra_path']` z katalogu aplikacji i sufiksu `/rra`;
nie jest to ogólne ustawienie bazy danych służące do swobodnego wyboru katalogu lokalnego. Potwierdź
rzeczywistą ścieżkę przed przeniesieniem plików. Bezwzględne ścieżki niestandardowe muszą zostać
sprawdzone i poprawione indywidualnie. Zachowaj zagnieżdżone struktury katalogów.

**Pamięć podręczna pollera przechowuje ścieżki bezwzględne.** Podczas budowania pamięci podręcznej
znacznik jest rozwijany, a pełna ścieżka trafia do wiersza pamięci podręcznej. Zmień katalog RRA,
a pamięć podręczna nadal będzie wskazywać na starą lokalizację. Poller będzie działał dalej, nie
zapisując niczego, co dałoby się odnaleźć. Przebuduj ją:

```sh
php cli/rebuild_poller_cache.php
```

**Ustawienia przechowujące ścieżki.** Każde z nich znajduje się w bazie danych, więc każde trafia
ze starej maszyny, wskazując na jej dawną strukturę. Sprawdź je wszystkie przed pierwszym uruchomieniem:
plik binarny RRDtool, plik binarny kolektora wraz z jego plikiem konfiguracyjnym, plik binarny PHP,
narzędzia SNMP, ścieżki dzienników, domyślną czcionkę oraz katalog kopii zapasowych usuwania skoków (spike removal).
Przejrzyj również ścieżki i zmienne środowiskowe w plikach konfiguracyjnych, jednostkach systemowych,
zadaniach harmonogramu i na serwerze WWW.

**Metody wprowadzania danych zawierają linie poleceń.** Wykorzystują one znacznik katalogu instalacji,
dzięki czemu przeniesienie zachowujące strukturę katalogów nie wymaga żadnych zmian. Przeniesienie
zmieniające układ wymaga sprawdzenia każdego wpisu. To samo dotyczy zasobów plików XML stojących za zapytaniami o dane.

**Zdalne kolektory posiadają własny plik konfiguracyjny**, zawierający ich poświadczenia bazy danych
oraz ich identyfikator kolektora. Nie ma ich w centralnym zrzucie bazy. Jeśli centralna baza danych
zmieniła lokalizację, zaktualizuj odpowiednie punkty końcowe i zweryfikuj połączenie każdego kolektora.
Pełna replikacja to osobna operacja, uruchamiana na głównym kolektorze tylko wtedy, gdy skonfigurowano
aktywne zdalne kolektory:

```sh
php cli/poller_replicate.php
```

Bez włączonego zdalnego kolektora to polecenie zakończy się błędem. Nie dodawaj go do migracji
pojedynczego kolektora jako wymaganego sprawdzianu powodzenia. Zweryfikuj zdalną konfigurację
i replikację przed wznowieniem zdalnego zbierania danych.

## Własność i uprawnienia

Poller zapisuje pliki RRD jako konto, które go uruchamia. Interfejs WWW odczytuje je jako konto
serwera WWW. Kopia, która zachowała identyfikatory numeryczne między maszynami o różnych wpisach
w `/etc/passwd`, spowoduje, że pliki będą należeć do niewłaściwego konta.

Wykresy, które urywają się w momencie migracji, mogą wskazywać na uprawnienia, nieaktualne ścieżki,
brak zbierania danych, znaczniki czasu lub odrzucone próbki. Przejrzyj dzienniki pollera i zachowane
kolejki przed wyborem metody naprawy; sam wykres nie wskazuje przyczyny.

Sprawdź uprawnienia do samego katalogu RRA oraz do zagnieżdżonych podkatalogów, a nie tylko do
pojedynczego pliku próbnego. Nowe pliki są tworzone w tych katalogach w trakcie zbierania danych,
więc katalog, do którego poller nie ma prawa zapisu, zawiedzie w przypadku źródeł danych, które nie
istniały w momencie migracji, nawet jeśli istniejące pliki działają poprawnie. Zmapuj ponownie
`rrd_maintenance_trusted_uids` oraz `rrd_maintenance_trusted_gids` w `include/config.php` na
rzeczywiste numeryczne tożsamości maszyny docelowej i sprawdź zaufane katalogi nadrzędne.
Zobacz [wymagania systemowe](/pl/reference/requirements/).

## Przełączenie z minimalną utratą danych

Plik RRD odrzuca aktualizacje ze znacznikiem czasu równym lub wcześniejszym niż czas jego ostatniej
aktualizacji. Ogranicza to możliwość ponownego odtworzenia danych; nie oznacza to jednak, że każda
migracja musi wiązać się z utratą próbek. Rozmiar luki zależy od czasów próbkowania, czasu przestoju
oraz tego, które zakolejkowane pomiary zostały zachowane. Procedura ta zakłada jednego właściciela
zbierania danych i nie łączy niezależnie zebranej historii próbnej z ostatecznym zbiorem archiwum.

1. Przeprowadź pełną próbę generalną z wyprzedzeniem, korzystając z kopii zapasowej z poprzedniego dnia. Skopiuj wszystko, popraw każdą ścieżkę i przetestuj aktualizacje na odizolowanych urządzeniach testowych z wyłączonymi powiadomieniami. Zapisz zmiany w środowisku docelowym w formie powtarzalnej procedury. Zatrzymaj procesy próbne po zakończeniu testów.
2. Utrzymuj środowisko próbne w pełnej izolacji. Zastąp jego bazę danych i pliki RRD ostateczną, spójną kopią zapasową; nie mieszaj wierszy próbnych ani zakolejkowanych próbek z właściwym przywracaniem.
3. W celu właściwego przełączenia zatrzymaj procesy zbierające na źródle i zrzuć lub zachowaj oczekujące próbki, a następnie wykonaj i prześlij ostateczną kopię zapasową. Zastosuj ponownie modyfikacje docelowe: przywrócenie bazy danych przywraca źródłowe ścieżki w `settings`, a przywrócenie plików konfiguracyjnych może nadpisać także punkty końcowe i ustawienia zaufania z próby generalnej.
4. Przebuduj pamięć podręczną pollera, wykonaj kontrole magazynu, zweryfikuj listę plików i włącz zbieranie danych na maszynie docelowej dopiero po pomyślnym zaliczeniu tych testów.

Zmierz czas trwania próby generalnej i przewidź rezerwę na walidację oraz ewentualny powrót. Utrzymuj
źródło w stanie zatrzymania do czasu pomyślnego zakończenia przełączenia lub podjęcia decyzji
o kontrolowanym wycofaniu zmian i ponownym wyznaczeniu go na właściciela zbierania danych.

## Weryfikuj w tej kolejności

1. Interfejs WWW ładuje się bez przekierowania do instalatora. Zbadaj rozbieżność kodu/schematu, łączność z bazą danych lub niekompletne przywrócenie danych, jeśli nastąpi przekierowanie.
2. Urządzenie testowe odpowiada na nową próbę zbierania danych; przywrócony status „up” może być nieaktualny.
3. Czas ostatniej aktualizacji pliku RRD przesuwa się do przodu po pierwszym przebiegu zbierania danych. Sprawdź plik na dysku, a nie wykres.
4. Wykres wygenerowany dla ostatniej godziny pokazuje ciągłą linię, a nie lukę.

Jeśli krok 3 zakończy się niepowodzeniem, sprawdź ścieżki, uprawnienia, weryfikację wstępną magazynu,
głębokość kolejki i błędy RRDtool. Jeśli krok 4 zakończy się niepowodzeniem, sprawdź zachowane wartości,
definicje wykresów, wybrany zakres czasu i uprawnienia konta WWW. Jeden poprawny plik nie stanowi
dowodu prawidłowego działania każdego urządzenia, metody wprowadzania danych czy zdalnego kolektora.

## Pułapki

**Nie uruchamiaj obu instalacji na tym samym drzewie plików RRD.** Dwa pollery zapisujące do tych
samych plików powodują odrzucanie aktualizacji i powstawanie luk, a nie scalanie danych.

**Nie przywracaj starszego drzewa RRD na nowszą bazę danych.** Pliki nie uzupełnią się wstecz.
Zbieranie danych zostanie wznowione od bieżącego momentu, a okres pomiędzy nimi stanie się trwałą luką.

**Kopia zapasowa zawiera poświadczenia urządzeń w postaci jawnego tekstu.** Przenoszenie sprzętu
oznacza, że poświadczenia te wędrują przez sieć i znajdują się na dwóch maszynach. Ogranicz dostęp
do kopii zapasowej i szyfruj transmisję. Zachowaj zabezpieczoną kopię awaryjną do momentu akceptacji
i zakończenia okresu retencji zezwalającego na wycofanie starego systemu; nie kasuj jej podczas przełączania.

**Tabele wtyczek znajdują się w bazie danych; kod wtyczek – nie.** Przywrócenie bazy danych bez
odpowiedniego kodu wtyczek i ich zależności może unieruchomić strony wtyczek, hooki lub zadania.
Sprawdź każdą wymaganą wtyczkę indywidualnie.

**Istniejący magazyn proxy wykracza poza ramy tej procedury migracji.** Wdrożenie proxy nie jest
obsługiwane. Zlokalizuj i wykonaj kopię zapasową rzeczywistych plików RRD, a następnie przeprowadź
osobną migrację na lokalny magazyn na odizolowanej kopii testowej. Lokalny katalog `rra/` może
zawierać jedynie pozostałości.

**Wyłącz starą maszynę na samym końcu i nigdy tego samego dnia.** Pozostaw ją wyłączoną lub ze
wstrzymanymi wszystkimi procesami zbierającymi i zachowaj jej spójną kopię zapasową do czasu, aż
nowy system pomyślnie przejdzie wszystkie wymagane testy zbierania danych, wykresów, kolektorów
zdalnych i wtyczek. Określ czas obserwacji na podstawie profilu obciążenia i polityki wycofywania zmian;
pojedynczy, najkrótszy cykl archiwizacji nie dowodzi poprawnego działania wszystkich podsystemów.
