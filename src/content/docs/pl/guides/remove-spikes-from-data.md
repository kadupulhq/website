---
title: Usuwanie skoków z danych
description: Podgląd korekt skoków, zachowywanie kopii ratunkowych i weryfikacja zmian w zachowanych próbkach RRD.
banner:
  content: Kadupul jest w fazie przedalfa. Sprawdź te procedury w izolowanej instalacji testowej.
sidebar:
  order: 19
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma oficjalnie wspieranego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na wyizolowanej kopii z kopiami zapasowymi przed
poleganiem na nich w środowisku produkcyjnym. Zobacz [status projektu](/pl/project/status/).
:::

:::danger[Ta operacja przepisuje historię; odzyskanie wymaga kopii zapasowej]
Usuwanie skoków zrzuca archiwum, modyfikuje wartości, przywraca tymczasowy plik równorzędny
i zastępuje nim oryginał po pomyślnej weryfikacji. Nie ma automatycznego cofania zmian. Zachowaj
i zweryfikuj kopię ratunkową, najpierw uruchom polecenie z flagą `--dryrun` i sprawdź próbki docelowe
przed zatwierdzeniem zmiany.
:::

Skok oznacza w tym kontekście jedną lub dwie próbki tak drastycznie większe od wszystkich wartości
wokół nich, że oś pionowa wykresu dopasowuje się do nich, spłaszczając resztę wykresu
do linii zerowej. Taki pomiar jest błędny, a dodatkowo całkowicie zaburza czytelność danych.

## Skąd się biorą

Większość skoków w źródłach danych opartych na licznikach wynika z arytmetyki, a nie z rzeczywistego pomiaru.
Licznikowe źródło danych przechowuje tempo zmian obliczane z różnicy między dwoma kolejnymi
odczytami. Wszystko, co sprawia, że drugi odczyt jest znacznie większy od pierwszego
w stosunku do czasu, jaki między nimi upłynął, może wygenerować fałszywą wartość. Mogą to spowodować:
zerowanie licznika, błędna obsługa przekroczenia zakresu, ponowne indeksowanie interfejsów przypisujące odczyty
do niewłaściwego źródła danych lub błędy znaczników czasu. Zwykłe przekroczenie zakresu licznika
nie jest samo w sobie dowodem na błędną próbkę; zweryfikuj typ źródła danych i odczyty wejściowe.

Zobacz [Źródła danych i RRA](/pl/concepts/data-sources-and-rras/), aby dowiedzieć się, jak wyliczane jest
tempo zmian.

Usuń przyczynę tam, gdzie to możliwe. Usunięcie samego skoku ma charakter wyłącznie kosmetyczny; nie zapobiegnie
wystąpieniu kolejnego.

## Cztery metody

Narzędzie przetwarza cały plik: zrzuca każde archiwum z pliku RRD, decyduje,
które wartości zastąpić, i przywraca zmodyfikowany wynik.

| Metoda | Co zaznacza | Wymaga okna czasowego |
|---|---|---|
| `stddev` | Wartości oddalone o więcej niż N odchyleń standardowych od średniej | Nie |
| `variance` | Wartości przekraczające średnią o ponad N procent po odrzuceniu wartości odstających | Nie |
| `float` | Wszystkie wartości wewnątrz określonego przedziału czasu | Tak |
| `fill` | Próbki nieznane oraz o wartości zero wewnątrz określonego przedziału czasu | Tak |

Metody `stddev` i `variance` same wyszukują anomalie. Metody `float` i `fill` wykonują dokładnie to, co im wskażesz
w wyznaczonym zakresie, i obie natychmiast kończą się błędem, jeśli nie podasz początku i końca.

Metoda `fill` nie ogranicza się wyłącznie do brakujących danych: może zastąpić zmierzone zera
wartościami niezerowymi. Nie używaj jej w zakresie zawierającym prawidłowe odczyty bezczynności lub zera,
chyba że taka modyfikacja jest w pełni zamierzona.

Metoda wariancji odrzuca N najwyższych i najniższych próbek przed obliczeniem
średniej porównawczej, gdzie N jest parametrem wartości odstających. Zapobiega to
sytuacji, w której sam skok zawyża próg mający go wykryć.

Wszystkie wybrane wartości podlegają wymianie, a dostępne są trzy opcje zastępcze.

| Wartość zastępcza | Wynik |
|---|---|
| `last` | Ostatnia znana poprawna wartość. Opcja domyślna. |
| `avg` | Obliczona średnia dla pola/archiwum; kalkulacja zależy od wybranej metody. |
| `nan` | Wartość nieznana dla metod statystycznych; zobacz ograniczenie metody oknem poniżej. |

Wartość nieznana rejestruje brak użytecznego pomiaru. Opcje `last` oraz `avg`
wstawiają wartości, które dla osoby oglądającej wykres w przyszłości mogą wyglądać na prawdziwe pomiary.
Wybieraj wartość zastępczą świadomie i weryfikuj faktycznie zapisany wynik.

**Metody okienkowe z opcją NaN:** przy użyciu parametru `--avgnan=nan` metoda `float` zastępuje każdą znaną wartość
w oknie wartością nieznaną, a metoda `fill` zastępuje wartości zerowe lub nieliczbowe w
oknie wartością nieznaną. Metody statystyczne z opcjonalnymi granicami czasu zastępują jedynie
wykryte anomalie, więc nie są równoznaczne z wyczyszczeniem całego okna.

## Podgląd, a następnie zatwierdzenie

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

Uruchomienie próbne (dry run) zrzuca plik RRD i analizuje go bez modyfikowania pliku produkcyjnego. Wymaga
ono sprawnego katalogu roboczego oraz odpowiednich uprawnień. Podgląd nie blokuje
pliku na wyłączność przed finalnym zatwierdzeniem: nowe próbki lub zmiana opcji mogą wpłynąć na
końcowy wynik. Przykład z oknem czasowym nadal stosuje selekcję statystyczną; nie usuwa
wszystkich wartości w tym oknie.

Argumenty czasu akceptują zarówno uniksowy znacznik czasu, jak i ciąg znaków daty. Ciąg, którego
nie można zinterpretować, jest odrzucany przed modyfikacją pliku. Używaj uniksowych znaczników czasu, gdy
interpretacja strefy czasowej mogłaby być dwuznaczna.

## Co faktycznie dzieje się z plikiem

Warto to wiedzieć przed uruchomieniem procedury na ważnych danych:

1. Plik jest zrzucany do formatu XML w katalogu kopii zapasowych.
2. Usuwane są komentarze, a każde archiwum jest skanowane w celu zebrania statystyk.
3. Wybrane wartości są zastępowane w pliku XML.
4. Oryginalny plik jest kopiowany do katalogu kopii zapasowych.
5. Zmodyfikowany plik XML jest przywracany do prywatnego pliku równorzędnego, weryfikowany i przenoszony
   na miejsce oryginału z zachowaniem właściciela, grupy i uprawnień.

Krok 4 stanowi kluczowe zabezpieczenie i nie jest opcjonalny: jeśli kopiowanie się nie powiedzie, przywracanie
nie zostanie uruchomione. To z tej kopii, a nie z jakiejkolwiek opcji wiersza poleceń,
można w razie potrzeby przywrócić dane. Jej nazwa bazuje na oryginale i może otrzymać unikalny przyrostek, aby uniknąć
nadpisania istniejącego pliku. Opcja `--backup` dodatkowo żąda utworzenia trwałej
migawki odzyskiwania. Sprawdź zgłoszone ścieżki i zweryfikuj kopie przed poleganiem
na nich.

Operacja wymaga zaufanych lokalnych katalogów POSIX i blokad konserwacyjnych;
same uprawnienia zapisu nie wystarczą. Narzędzie odrzuca nieobsługiwaną pamięć masową oraz
skonfigurowany punkt końcowy rrdcached. Zatrzymaj zewnętrzne procesy zapisu, które nie uczestniczą w
protokole blokad Kadupul. Wykonaj procedurę na wskazanym koncie usługi zarządzającym danymi.
Zobacz [wymagania instalacyjne](/pl/reference/requirements/) dotyczące dostępu do pamięci masowej.

## Ustawienia kontrolujące wartości domyślne

Argumenty wiersza poleceń mają pierwszeństwo. Wszystko, co pominiesz, pochodzi z
ustawień systemowych, a preferencje użytkownika nadpisują ustawienia systemowe, gdy narzędzie jest
uruchamiane z poziomu interfejsu.

| Ustawienie | Wartość domyślna | Działanie |
|---|---|---|
| Removal method | Variance with outliers removed | Wybrana metoda usuwania |
| Replacement method | Last known good | Wartość wstawiana na miejsce usuniętej |
| Number of standard deviations | 10 | Próg dla metody `stddev` |
| Variance percentage | 1000 | Próg dla metody `variance` |
| Variance number of outliers | 5 | Skrajne próbki odrzucane przed wyliczeniem średniej |
| Max kills per RRA | 5 | Zakładany limit; obecnie niewymuszany w sposób ścisły |
| RRDfile backup directory | `cache/spikekill/` under the install | Miejsce zapisu zrzutu i kopii |
| Backup retention | 3 months | Czas przechowywania kopii |

Dostępny jest również tryb wsadowy: harmonogram (co 6, 12, 24 lub 48 godzin), czas
bazowy oraz lista szablonów wykresów objętych działaniem. Tryb wsadowy jest domyślnie wyłączony.
Jego włączenie oznacza, że system modyfikuje archiwa bez bezpośredniego nadzoru człowieka nad
wynikiem. Ściśle ogranicz listę szablonów, jeśli zdecydujesz się go włączyć.

## Pułapki

**Domyślne progi są celowo bardzo szerokie.** Dziesięć odchyleń standardowych oraz
wariancja rzędu 1000 procent to szerokie kryteria. Przebieg, który nie wykaże żadnych skoków, najprawdopodobniej
nie zakończył się błędem; po prostu potwierdził, że wartości mieszczą się w wyznaczonym przedziale. Zaostrz
próg zamiast losowo zmieniać metody.

**Opcja Max kills per RRA ogranicza wyłącznie metody statystyczne.** Dla metod `stddev` i
`variance` licznik obejmuje wszystkie źródła danych w jednym archiwum i zeruje się w
kolejnym. Metody okienkowe `float` i `fill` zastępują każdą pasującą wartość w
danym oknie. Łączny licznik obejmuje również zamiany na NaN. Przejrzyj pełny podgląd
i stosuj wąskie okna czasowe.

**Skonsolidowanej wartości nie da się odtworzyć.** Starsze archiwa przechowują jedną wartość na
przedział, już uśrednioną. Zastąpienie tej wartości nie przywraca rzeczywistego
pomiaru dla danego przedziału; wstawia jedynie wiarygodną wartość szacunkową. Im dalej wstecz sięgasz,
tym bardziej korekta staje się domysłem.

**Katalog kopii zapasowych musi być poprawnie skonfigurowany i zaufany.** Trafiają tam
zrzuty oraz kopie ratunkowe. Brakujące, niezabezpieczone lub nieweryfikowalne katalogi są odrzucane; nie
nadawaj katalogowi globalnych praw zapisu, aby obejść błąd.

**Prowadź własny rejestr zmian niezależnie od logów aplikacji.** Zapisuj operatora,
polecenie, zakres czasu, ścieżki kopii zapasowych oraz wyniki weryfikacji przed i po. Same sumaryczne statystyki
nie stanowią wystarczającego dowodu wprowadzonych zmian.

**Uruchamiaj procedurę na docelowym koncie usługi.** Prawidłowe zastąpienie zachowuje
właściciela i uprawnienia pliku. Konto root nie zwalnia z testów zaufania do katalogów;
upewnij się, że zwykły proces odpytywania nadal może aktualizować wynikowy plik.

**Usunięcie skoku nie naprawi wykresu, jeśli źródło danych jest nieprawidłowe.** Jeśli
reindeksacja interfejsu przeniosła odczyty na niewłaściwe źródło danych, skok jest jedynie
objawem. Zobacz [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/)
przed przystąpieniem do edycji archiwów.
