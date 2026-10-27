---
title: "Bezpieczna aktualizacja"
description: "Przećwicz aktualizację, zachowaj dopasowane kopie zapasowe, sprawdź stan bazy i pamięci oraz zaplanuj wycofanie zmian."
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
sidebar:
  order: 8
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Aktualizacja zmienia trzy rzeczy w różnym czasie i z różną odwracalnością.

| Zmiany | Odwracalne | W jaki sposób |
|---|---|---|
| Kod, zależności i konfiguracja | Z zachowanej kopii | Przywróć pasującą wersję i ustawienia |
| Schemat bazy danych i próbki w kolejce | Z dopasowanej kopii zapasowej | Przywróć bazę danych; brak automatycznej migracji wstecznej |
| Pliki RRD | Z dopasowanej kopii zapasowej | Przywróć zachowaną historię; próbek nieobecnych w kopii nie można odtworzyć przez wycofanie zmian |

Ta procedura służy do utrzymania synchronizacji tych trzech elementów.

## Zanim zaczniesz

**Wykonaj pełną kopię zapasową.** Wszystkie trzy części, spójne ze sobą. Postępuj zgodnie z
[Kopia zapasowa i przywracanie](/pl/guides/back-up-and-restore/). Zatrzymaj wszystkie procesy
zapisujące przed ostatecznym przechwyceniem i zachowaj chronioną kopię zapasową aż do zatwierdzenia
aktualizacji.

**Zapisz bieżącą wersję kodu i wersję schematu.** Uwzględnij zależności, lokalne modyfikacje,
wtyczki i konfigurację. Wiele wydań kodu źródłowego może zgłaszać tę samą wersję schematu.
Przetestuj wersję docelową na odizolowanej, przywróconej kopii.

**Sprawdź każdą wtyczkę.** Sprawdź deklarację zgodności, kod i zależności, a następnie przetestuj
potrzebne funkcje z wersją docelową. Sama deklaracja wersji minimalnej nie oznacza pełnej zgodności.
Zobacz [Weryfikacja wtyczek](/pl/guides/install-and-vet-plugins/).

**Sprawdź środowisko uruchomieniowe.** Wersję PHP, rozszerzenia PHP oraz wersję serwera bazy danych.
Sprawdź [wymagania](/pl/reference/requirements/) wersji docelowej przed wdrożeniem. Nie zakładaj,
że narzędzie CLI schematu wykonuje każdy test sprawdzany przez instalator webowy.

**Sprawdź, czy konto bazy danych może modyfikować schemat.** W środowisku uruchomieniowym konto
musi czytać i zapisywać dane we własnej bazie danych. W trakcie aktualizacji musi także tworzyć,
zmieniać i usuwać tabele oraz indeksy. Instalacje, które ograniczyły uprawnienia po wstępnej
konfiguracji, odkrywają to właśnie w tym momencie.

**Zatrzymaj wszystkich producentów.** Zatrzymaj zaplanowane zbieranie danych, zdalne kolektory,
odpytywanie wywoływane przez interfejs WWW oraz ręczną konserwację; poczekaj na zakończenie trwających
zadań. Opróżnij odłożone zapisy dopiero po zatrzymaniu producentów i zachowaj wszelkie niepotwierdzone
wiersze kolejki w powiązanej kopii zapasowej. Utrzymuj producentów w stanie zatrzymania przez cały czas
wdrażania i weryfikacji schematu.

## Wymiana aplikacji

Kopiowanie nakładkowe ma określone ograniczenia:

```bash
# Copies the contents of the new tree over the old one.
cp -a /path/to/new-release/. /path/to/kadupul/
```

Bez tego `cp -a /path/to/new-release /path/to/kadupul` utworzy katalog
`kadupul/new-release/` i pozostawi każdy plik starej aplikacji dokładnie tam, gdzie był.
Aktualizacja wydaje się udana, interfejs nadal uruchamia stary kod, a pierwszym objawem
kłopotów jest migracja schematu odmawiająca dopasowania do wersji, którą rzekomo zastąpiono.

Kopiowanie na istniejący katalog zachowuje pliki nieobecne w nowym drzewie, w tym przestarzałe
pliki aplikacji. Może nadpisać wszelkie pasujące ścieżki, dlatego zbadaj artefakt zamiast
zakładać, że konfiguracja lub dane są wykluczone. Preferuj zweryfikowane drzewo przejściowe
z pasującymi zależnościami, konfiguracją i wtyczkami. W przypadku przełączania wydań za pomocą
dowiązania symbolicznego sprawdź rzeczywistą ścieżkę RRA i dostęp do pamięci przed przełączeniem;
obecny skrypt startowy wyprowadza ją z katalogu aplikacji plus `/rra`. Samo przełączenie dowiązania
symbolicznego nie jest wycofaniem zmian w bazie danych.

**Sprawdź, co faktycznie uruchamiasz, zanim przejdziesz dalej.**

```bash
cat /path/to/kadupul/include/cacti_version
```

Jeśli polecenie to nie zwróci wydania, które przed chwilą wdrożono, zatrzymaj się. Wszystko
po tym punkcie zakłada, że wdrożony jest zamierzony kod. Porównaj także wersję źródłową lub sumę
kontrolną artefaktu z rejestrem wydania; sam ciąg wersji nie wystarczy.

## Migracja schematu

Baza danych posiada własną wersję, niezależną od wersji w kodzie. Zastąpienie kodu niczego
w niej nie zmienia.

Starsze uwierzytelnione strony przekierowują do instalatora, gdy wersje kodu i bazy danych
się nie zgadzają. Nie jest to uniwersalna ochrona dla każdego punktu końcowego lub narzędzia CLI,
a pasujące ciągi wersji nie dowodzą, że każda migracja została zakończona. Sprawdź stan schematu
bezpośrednio.

Instalator i CLI wykonują uporządkowane kroki migracji. Przed standardową aktualizacją schematu
sprawdź trwałą kolejkę oraz uprawnienia konta usługi do pamięci masowej. Jeśli odziedziczona kolejka
`poller_output` nie korzysta z InnoDB, przekonwertuj ją jawnie przy zatrzymanych procesach
zapisujących i zachowanej kopii zapasowej:

```sh
php cli/upgrade_database.php --migrate-poller-queue
```

Następnie uruchom to polecenie na każdym rzeczywistym koncie serwera WWW i pollera:

```sh
php cli/upgrade_database.php --check-rrd-storage
```

Te dwie flagi to osobne operacje i nie można ich łączyć. Konwersja kolejki zachowuje oczekujące
próbki; nie obcinaj wierszy, aby przejść weryfikację. Skonfiguruj prawo własności i numeryczne zaufane
UID/GID zgodnie z [wymaganiami dotyczącymi pamięci](/pl/reference/requirements/). Zdalne kolektory online
zazwyczaj wybierają kolejkę główną; użyj `--local` tylko w przypadku celowego sprawdzania lub konwersji
kolejki lokalnej. Gdy te kontrole zakończą się sukcesem, uruchom aktualizację schematu z katalogu
głównego aplikacji:

```sh
php cli/upgrade_database.php
```

Uruchom to polecenie jako skonfigurowane konto usługi z wymaganym dostępem do systemu plików
i uprawnieniami do bazy danych. Pomyślny test z poziomu roota nie dowodzi dostępu konta usługi.
Istnieje opcja `--forcever` pozwalająca jawnie ustawić wersję początkową, która służy do
ponownego uruchomienia migracji podczas testów przedpremierowych. Nie jest ona częścią normalnej
aktualizacji, a jej użycie w celu pominięcia nieudanego kroku pozostawi schemat częściowo
zmigrowany.

Przechwyć kod wyjścia i dane wyjściowe, a następnie zweryfikuj wersję bazy danych i wymagane zmiany
schematu. Obecne narzędzie CLI może odrzucić nieznaną lub nieobsługiwaną starszą wersję początkową,
a mimo to zakończyć się kodem 0; sam pomyślny status powłoki nie wystarczy. Jeśli migracja nie
powiedzie się w trakcie działania, utrzymuj producentów w stanie zatrzymania i przywróć dopasowany
zestaw kopii zapasowej zamiast próbować pominąć nieudany krok.

## Co psuje wtyczki

Testy wtyczek instalatora WWW mogą wyłączyć niekompatybilne lub brakujące wtyczki. Nie zakładaj,
że narzędzie CLI schematu wykonuje te same testy cyklu życia wtyczek.

**Zadeklarowana wersja minimalna jest wyższa niż nowa wersja rdzenia.** Wyłączona. Jest to normalny
przypadek, który powinien zostać wychwycony podczas weryfikacji przed aktualizacją.

**Brak katalogu wtyczki, jej pliku instalacyjnego lub pliku deklaracji.** Wyłączona. Dotyczy to
wtyczki, której pliki zostały usunięte, podczas gdy w bazie danych była nadal oznaczona jako włączona.

**Wtyczka w ogóle nie posiada pliku deklaracji.** Może nie przejść testu zgodności instalatora.
Przetestuj utrzymywany, zgodny pakiet wtyczki, zamiast zakładać, że można ją ponownie włączyć
bez zmian.

Istnieje czwarty przypadek, który nie jest awarią. Funkcjonalność, która kiedyś była wtyczką,
a od tego czasu została włączona do rdzenia, jest całkowicie usuwana, a nie wyłączana: jej haki
i wpisy uprawnień są usuwane, a jej wiersz skasowany. Jeśli zauważysz, że wtyczka znika, zamiast
stać się szara, sprawdź dzienniki migracji oraz status danej wtyczki przed wyciągnięciem wniosku,
że dostępne są równoważne funkcje.

Wyłączenie wtyczki różni się od jej odinstalowania. Haki i migracje wtyczek mogą modyfikować
własne tabele i uprawnienia; zachowaj pasujący kod wtyczki oraz dane i zweryfikuj konkretną
ścieżkę aktualizacji. Nie obiecuj uniwersalnego zachowania danych.

## Planowanie wycofania zmian

Zaplanuj wycofanie zmian, zanim zaczniesz, ponieważ decyzja zależy od tego, jak daleko dotrzesz.

| Punkt awarii | Sposób wycofania |
|---|---|
| Kod zastąpiony, żadna operacja zmieniająca stan ani proces zapisujący nie zostały uruchomione | Przywróć poprzedni kod, zależności i konfigurację po potwierdzeniu, że stan się nie zmienił |
| Rozpoczęto konwersję kolejki lub migrację, w tym częściowe niepowodzenie | Zatrzymaj procesy zapisujące i przywróć pasujący kod, konfigurację, bazę danych oraz kopie RRD |
| Migracja ukończona, aplikacja działa nieprawidłowo | Zatrzymaj procesy zapisujące i przywróć dopasowany zestaw kopii zapasowych; uwzględnij próbki zebrane po wykonaniu kopii |
| Uszkodzona jest tylko wtyczka | Pozostaw ją wyłączoną, oceniając naprawę w porównaniu ze skoordynowanym wycofaniem na podstawie kryteriów akceptacji |

Podstawowa zasada pod tabelą: kod i schemat wycofuje się razem albo wcale. Stary kod w połączeniu
z nowym schematem nie jest stanem obsługiwanym. Nie polegaj na sprawdzaniu wersji przez interfejs WWW,
aby zapobiec każdej niekompatybilnej operacji.

Wyznacz sobie limit czasu. Zdecyduj z góry, ile czasu poświęcisz na debugowanie przed podjęciem
decyzji o przywróceniu, i trzymaj się tego. Kopia zapasowa staje się tym mniej użyteczna, im dłużej
system działa w stanie częściowo zaktualizowanym.

## Dlaczego pliki RRD to część, której nie wolno stracić

Nie zakładaj, że wdrożenie, konserwacja lub wznowione zbieranie danych pozostawia pliki RRD
w stanie nienaruszonym. Twórz ich kopie zapasowe razem z bazą danych i przywracaj dopasowany
zestaw podczas wycofywania zmian stanu. Próbki zachowane w kolejce mogą jeszcze nie istnieć
w tych plikach. Zweryfikowana kopia zapasowa RRD pozwala odzyskać zapisaną w niej historię;
brakującej próbki nie da się zrekonstruować przez samo przywrócenie schematu lub kodu. Zobacz
[Źródła danych i archiwa round-robin](/pl/concepts/data-sources-and-rras/), aby dowiedzieć się,
dlaczego zawartej w nich rozdzielczości również nie da się odtworzyć.

Trzy typowe sytuacje, w których dochodzi do utraty plików RRD podczas aktualizacji:

**Wdrożenie przez zastąpienie katalogu instalacyjnego.** Katalog RRA domyślnie jest
podkatalogiem instalacji. Usunięcie starego katalogu i rozpakowanie nowego w jego miejsce
może usunąć zachowane pomiary. Zabezpiecz drzewo RRA za pomocą przetestowanego układu pamięci
masowej przed wymianą aplikacji. Zweryfikuj rzeczywistą wartość `$config['rra_path']`, zagnieżdżone
ścieżki oraz kontrole zaufania konta usługi; ta wersja nie zapewnia ogólnego ustawienia bazy
danych dla dowolnego lokalnego katalogu głównego RRA.

**Wdrożenie z repozytorium lub pakietu, który zarządza całym drzewem katalogów.** Ten sam błąd,
tyle że zautomatyzowany. Sprawdź, co Twoja metoda wdrażania uznaje za elementy podlegające usunięciu.

**Naprawianie uprawnień przez rekursywną zmianę właściciela.** Nieszkodliwe dla danych, ale może
pozbawić poller możliwości zapisu, co objawia się systemem, który idealnie rysuje historię,
ale nie zbiera żadnych nowych danych."

## Po aktualizacji

1. Przejrzyj wyniki aktualizacji, wersję bazy danych i wymagane zmiany schematu, a następnie
   potwierdź, że interfejs się ładuje. Brak przekierowania sam w sobie nie jest wystarczający.
2. Dokończ planowane aktualizacje kodu i konfiguracji zdalnych kolektorów oraz zweryfikuj ich
   cele bazodanowe, podczas gdy ich producenci pozostają zatrzymani.
3. Powtórz kontrole pamięci masowej konta usługi, wznów wyznaczone kolektory i zweryfikuj
   reprezentatywne czasy ostatnich aktualizacji RRD oraz użyteczność zachowanych wartości.
4. Sprawdź w dzienniku linię ze statystykami przebiegu i porównaj upływający czas z wartościami
   sprzed aktualizacji. Nowe wydanie może zmienić koszt zbierania danych.
5. Włączaj ponownie wyłączone wtyczki, pojedynczo, po zainstalowaniu wersji deklarujących
   zgodność z nowym rdzeniem.
6. Sprawdzaj głębokość zachowanej kolejki, zdalne zbieranie danych oraz zadania wtyczek
   w uzgodnionym oknie akceptacji. Zachowaj kopię zapasową do wycofania zmian, dopóki te testy
   nie zakończą się powodzeniem.
