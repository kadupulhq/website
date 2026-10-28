---
title: Odzyskiwanie uszkodzonego pliku RRD
description: Jak odróżnić uszkodzone archiwum round-robin od błędnie skonfigurowanego, jak zbadać plik, jak dump i restore go naprawiają oraz jakie dane historyczne można zachować w razie konieczności odbudowy.
banner:
  content: Kadupul jest w fazie przedalfa. Sprawdź te procedury w izolowanej instalacji testowej.
sidebar:
  order: 25
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma oficjalnie wspieranego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na wyizolowanej kopii z kopiami zapasowymi przed
poleganiem na nich w środowisku produkcyjnym. Zobacz [status projektu](/pl/project/status/).
:::

Rzeczywiste uszkodzenie pliku zdarza się rzadko. Większość plików zgłaszanych jako uszkodzone jest nienaruszona,
lecz niespójna z bazą danych, niedostępna do zapisu dla pollera lub przestała otrzymywać
dane z przyczyny niemającej nic wspólnego z samym plikiem. Ustal, z którym przypadkiem
masz do czynienia przed podjęciem działań, ponieważ naprawa właściwa dla jednego z nich pogarsza pozostałe.

:::danger[Zachowaj oryginał]
**Wykonaj kopię pliku przed każdą procedurą naprawczą opisaną na tej stronie.** Przywracaj dane do osobnego pliku
kandydata i sprawdź go przed zastąpieniem pliku produkcyjnego. Zmniejszenie lub usunięcie archiwum
bezpowrotnie usuwa zgromadzoną historię. Zmiana wartości maksymalnej wpływa na późniejszą walidację danych; nie
usuwa wstecznie zapisanych próbek. W plikach RRD nie ma automatycznej funkcji cofania zmian.
:::

## 1. Nazwij usterkę

| Co widzisz | Zwykle oznacza | Przejdź do |
|---|---|---|
| Wykres wyświetla błąd zamiast obrazu | Plik nie istnieje, jest nieczytelny lub katalog nie ma praw zapisu | Krok 2 |
| Wykres jest pusty, lecz bez błędu | Brak użytecznych wartości w wybranym zakresie lub problem z definicją wykresu | [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/) |
| Wykres zatrzymuje się w określonym momencie i nie wznawia pracy | Poller, uprawnienia lub parametr heartbeat | Krok 3 |
| Wykres zawiera dane, lecz jego kształt uległ nagłej zmianie bez modyfikacji konfiguracji | Rozbieżność między plikiem a bazą danych | Krok 4 |
| Zapisane wartości to wyłącznie dane nieznane | Zbieranie danych, taktowanie, limity lub konfiguracja źródła danych wymagają weryfikacji | [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/) |
| `rrdtool` odmawia odczytu pliku | Brak ścieżki, błąd uprawnień, niekompatybilny format lub fizyczne uszkodzenie | Kroki 2 i 3, następnie 5 |

Kadupul przekształca pierwszy przypadek w czytelny komunikat zamiast uszkodzonego obrazu,
rozróżniając katalog bez praw zapisu od niezapisanego pliku i informując o braku
pliku jako potencjalnym znaku, że poller jeszcze się nie uruchomił. Komunikat ten jest wskazówką, a nie
diagnozą: usunięcie, zmiana ścieżki lub niekompletne przywrócenie również mogą być przyczyną jego braku.

## 2. Zbadaj plik

Na stronie danego źródła danych dostępne są dwa widoki, włączane dla bieżącej sesji.
Widok debugowania wyświetla polecenie `rrdtool create`, które Kadupul wygenerowałby dla tego źródła
danych dzisiaj. Widok informacyjny jest tutaj kluczowy: odczytuje plik za pomocą
`rrdtool info`, pobiera definicję źródła danych z bazy i wypisuje
różnice. Gdy rozbieżność można usunąć bez konieczności odbudowywania pliku, wyświetla polecenie
`rrdtool tune` lub `rrdtool resize`, które należy wykonać
ręcznie.

Z poziomu powłoki wykonaj ten sam pierwszy krok:

```bash
rrdtool info /path/to/rra/42/1337.rrd
```

Nagłówek podaje krok, czas ostatniej aktualizacji, nazwę każdego źródła danych wraz z typem,
heartbeat, minimum i maksimum, a także każde archiwum z funkcją konsolidacji, liczbą wierszy
i rozdzielczością. Jeśli polecenie zakończy się błędem, zachowaj komunikat i sprawdź ścieżkę,
uprawnienia oraz wersję RRDtool przed zdiagnozowaniem uszkodzenia. Pomyślne wykonanie
`info` bada metadane; zbadaj również wynik polecenia `fetch` i przetestuj zrzut w celu weryfikacji historii.

## 3. Najpierw sprawdź przyczyny mechaniczne

| Sprawdzenie | Dlaczego wykonuje się je przed naprawą |
|---|---|
| Właściciel i uprawnienia pliku | Plik utworzony przez roota podczas prac staje się od tego momentu niezapisywalny dla pollera |
| Właściciel i uprawnienia katalogu | Poller nie może utworzyć pliku zastępczego w katalogu, do którego nie ma praw zapisu |
| Wolne miejsce i i-węzły | Przepełniony system plików powoduje ucięte zapisy przypominające uszkodzenie danych |
| Obecność drugiego procesu zapisującego | Równoległe lub niespójne aktualizacje mogą zepsuć migawkę; sprawdź dzienniki zdarzeń |

Prace konserwacyjne wykonuj na koncie będącym właścicielem pliku RRD, zachowując jego uprawnienia,
właściciela i grupę. Zatrzymaj wszystkie procesy zapisu przed kopiowaniem lub zastępowaniem plików, w tym
zdalne kolektory, zadania harmonogramu i ręczne skrypty. Opróżnij oczekujące zapisy dopiero po
zatrzymaniu procesów generujących dane. Zwykłe polecenia powłoki nie zakładają blokad Kadupul.
Zobacz [wymagania dotyczące pamięci masowej](/pl/reference/requirements/) oraz procedurę wyciszania w
[Tworzenie i przywracanie kopii zapasowych](/pl/guides/back-up-and-restore/).

## 4. Przeczytaj, co wykrył moduł sprawdzający

Kadupul może okresowo sprawdzać źródła danych powiązane z wykresami na aktywnych urządzeniach i
rejestrować wykryte nieprawidłowości; nie jest to pełny skan każdego pliku na dysku. Funkcja ta jest domyślnie
wyłączona. Interfejs wskazuje miejsce jej włączenia: Configuration -> Settings -> Data.

| Ustawienie | Wartość domyślna | Działanie |
|---|---|---|
| Enable RRDfile Check | off | Żadne testy nie są wykonywane, dopóki opcja nie zostanie włączona |
| Check Frequency | 4 hours | Dostępne również: 1 hour, 24 hours lub uruchamianie po każdym cyklu boost |
| Number of RRDfile Check Processes | 1 process | Dzieli listę plików pomiędzy procesy równoległe |
| RRDChecker Timeout | 1 hour | Przekroczenie tego czasu przerywa zadanie |

Wyniki gromadzą się na liście zawierającej urządzenie, źródło danych, wewnętrzny identyfikator źródła,
komunikat i datę. Listę można filtrować według wieku, przeszukiwać tekstowo oraz
czyścić po podjęciu działań naprawczych.

Komunikaty, które mogą zostać zarejestrowane, oraz ich znaczenie:

| Komunikat | Znaczenie |
|---|---|
| RRDfile does not exist | Plik nigdy nie powstał, został przeniesiony lub usunięty, albo zmieniono ścieżkę |
| RRDfile is not writable | Użytkownik pollera nie posiada uprawnień do zapisu w pliku |
| RRDfile modify time older than hour | Do pliku nic nie zapisano od co najmniej godziny |
| Last update value in RRDfile is older than 1 hour | Znacznik czasu ostatniej aktualizacji w samym pliku jest przestarzały, co stanowi silniejszy dowód niż czas modyfikacji |
| The RRDfile step does not match the Data Source Profile step | Plik został utworzony przy innym interwale |
| There are more, or less, Data Sources in the database than in the RRDfile | Szablon zyskał lub utracił pola po utworzeniu pliku |
| The Data Source '...' exists in RRDfile, but not in database | Wskazuje pole z perspektywy pliku |
| Data Source name '...' exists in the Database, but not in RRDfile | Wskazuje pole zapisywane przez poller, które nie ma swojego miejsca w pliku |
| The RRDfile Minimal Heart... is lower than polling interval | Wskazuje heartbeat mniejszy lub równy interwałowi odpytywania; opóźnione próbki mogą stać się nieznane |
| The RRDfile minimal heartbeat... should be 'N' and is currently 'M' | Heartbeat pliku jest mniejszy niż w profilu; test nie ostrzega przed większymi wartościami |
| Stale values for last 24 hours, or last hour | Wszystkie próbki odczytane w tym oknie czasowym miały wartość nieznaną |
| More than 50% (n/m) values are NaN in last 24 hours, or last hour | Częściowa awaria zbierania danych |
| No data returned, maybe corrupted Data Source | Polecenie fetch wykonane na pliku nie zwróciło żadnych danych |

Podczas skanowania moduł automatycznie koryguje krok i heartbeat zapisane w bazie danych, aby odpowiadały profilowi,
co rozwiązuje rozbieżności między profilem a wierszami źródła danych, lecz nie modyfikuje
samego pliku. Niezgodności liczby pól między plikiem a bazą danych są raportowane, a nie
naprawiane automatycznie, ponieważ każda ze stron może być tą nieprawidłową.

## 5. Zrzut, edycja i przywrócenie

RRDtool umożliwia serializację pliku do formatu XML oraz odbudowę kandydata na jego podstawie.
Może to pomóc w przypadku znanych rozbieżności strukturalnych, lecz nie odtworzy utraconych próbek
ani nie gwarantuje, że uszkodzony plik uda się przetworzyć. Kadupul również korzysta z narzędzi dump/restore
przy modyfikacjach strukturalnych. Lokalne narzędzie tworzy tymczasowy plik równorzędny i
zastępuje nim plik docelowy po pomyślnej weryfikacji; nie zastępuje to jednak kopii zapasowej.

Po zatrzymaniu procesów zapisu wykonaj poniższe czynności jako właściciel pliku RRD. Zastąp przykładową ścieżkę
rzeczywistą ścieżką do źródła danych. Prywatny katalog roboczy tworzony jest obok pliku źródłowego,
aby plik kandydata znajdował się w tym samym systemie plików:

```bash
set -eu
umask 077
rrd=/path/to/rra/42/1337.rrd
work=$(mktemp -d "$(dirname "$rrd")/rrd-recovery.XXXXXX")
cp -p "$rrd" "$work/original.rrd"
rrdtool dump "$work/original.rrd" > "$work/recovery.xml"
# Edit recovery.xml only when the required correction is understood.
rrdtool restore "$work/recovery.xml" "$work/candidate.rrd"
rrdtool info "$work/candidate.rrd"
rrdtool fetch "$work/candidate.rrd" AVERAGE --start end-1h --end now
```

Wybierz zakres fetch oraz funkcję konsolidacji zawierające znane, poprawne dane;
ostatnia godzina to tylko przykład. Porównaj nazwy źródeł danych w oryginale i kandydacie,
krok, archiwa, znacznik ostatniej aktualizacji oraz wartości próbek. Niezmieniony proces dump/restore
może wpłynąć na układ binarny pliku, dlatego porównuj wartości zamiast wymagać identycznych sum kontrolnych.

Zachowaj oryginalną kopię. Dopiero po pełnej walidacji przywróć wymagany tryb uprawnień,
właściciela i grupę kandydata, a następnie przenieś go w docelowe miejsce przy wciąż zatrzymanych procesach zapisu. Upewnij
się, że konto pollera może odczytywać i aktualizować plik przed wznowieniem zbierania danych. Ten przykład
zatrzymuje się przed instalacją, aby nie wdrożyć czytelnego, lecz nieprawidłowego kandydata.

Plik XML i plik kandydata wymagają dodatkowej przestrzeni dyskowej. Nieudany zrzut może pozostawić
niekompletny plik XML; nie próbuj go przywracać. Sprawdź dostęp, wolne miejsce i zgłoszony błąd. Jeśli po tych testach
oryginału nadal nie można zrzucić, przywróć zweryfikowaną kopię zapasową. Opcja
[`restore -f`](https://oss.oetiker.ch/rrdtool/doc/rrdrestore.en.html) w RRDtool pozwala na nadpisanie
pliku docelowego; w przykładzie etapowym celowo zastosowano osobną ścieżkę.

## 6. Co przetrwa, a co nie

| Uszkodzenie | Możliwość odzyskania historii |
|---|---|
| Plik bez praw zapisu, poza tym nienaruszony | Zgromadzona historia przetrwa. Utracone aktualizacje nie zostaną odzyskane przez samo nadanie uprawnień |
| Błędny heartbeat, minimum lub maksimum | Tak. `rrdtool tune` modyfikuje nagłówek bez ingerencji w zapisane wartości |
| Błędny krok | Wymaga jawnej, zweryfikowanej konwersji; sama zmiana profilu w bazie nie konwertuje pliku |
| Brakujące źródło danych w pliku | Istniejące pola zachowują historię. Nowe pole rozpoczyna z pustymi danymi |
| Archiwum usunięte lub nigdy nieutworzone | Nie. Rozdzielczość, która nigdy nie była zapisana, nie może zostać odtworzona |
| Liczba wierszy zmniejszona przez polecenie resize | Nie. Odrzucone wiersze przepadają bezpowrotnie w momencie wykonania polecenia |
| Plik obcięty, zrzut nie powodzi się | Nie. Przywróć dane z kopii zapasowej |
| Nagłówek nienaruszony, koniec pliku obcięty | Nie zakładaj, że czytelny nagłówek oznacza kompletny zrzut; użyj kopii zapasowej w razie błędu zrzutu |

Zmiana interwału pollera lub przeniesienie źródła danych do innego profilu retencji
nie przekształca automatycznie istniejących plików. RRDtool udostępnia również strukturalne
[operacje `tune`](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html), w tym opcję
zmiany kroku; zweryfikuj działanie konwersji dla posiadanej wersji i układu
archiwów przed założeniem bezstratnej zmiany interwału. Zobacz
[Źródła danych i archiwa](/pl/concepts/data-sources-and-rras/) oraz
[Zarządzanie retencją danych](/pl/guides/manage-data-retention/). Zwiększenie wartości maksymalnej za pomocą `tune`
jest bezpieczne; jej zmniejszenie spowoduje oznaczenie każdej kolejnej wartości powyżej nowego limitu jako nieznanej.

## 7. Odbudowa z zachowaniem dostępnych danych

Kadupul dostarcza narzędzie splice, które potrafi wypełnić nowy plik danymi ze starszego,
czytelnego pliku. Potraktuj wynik jako kandydata: może on wypełniać luki i zastępować prawidłowe zera,
przez co nie stanowi bezstratnej kopii rzeczywistej historii pomiarów. Uruchamiaj je z katalogu głównego aplikacji na
głównym kolektorze danych, korzystając z odizolowanych kopii w zaufanych katalogach z prawem zapisu.

Utwórz plik `new.rrd` o docelowej strukturze w prywatnym katalogu `$work`
z kroku 5, a następnie podejrzyj operację łączenia:

```bash
php cli/splice_rrd.php --oldrrd="$work/original.rrd" \
                       --newrrd="$work/new.rrd" \
                       --finrrd="$work/merged.rrd" --dryrun
```

Oba pliki wejściowe muszą już istnieć i przejść testy uprawnień zapisu.
Nowy plik dostarcza strukturę. Bez opcji `--finrrd` ścieżką wyjściową jest ścieżka nowego pliku
z rozszerzeniem `.new`; użyj jawnej nowej ścieżki, aby uniknąć nadpisania poprzedniego
kandydata. Tryb `--dryrun` przetwarza i scala dane przy użyciu tymczasowego pliku XML i bazy SQLite (jeśli jest dostępna),
lecz pomija ostateczne przywracanie do RRD. Nie daje to gwarancji, że finalne
przywrócenie zakończy się sukcesem. Usuń flagę `--dryrun`, aby wygenerować niezależnego kandydata.
Unikaj opcji `--owner` podczas testów i uruchamiaj skrypt jako wymagane konto usługowe; sprawdź
rzeczywiste uprawnienia pliku wyjściowego przed instalacją.

:::caution[Narzędzie splice traktuje zero jako lukę]
Proces łączenia przegląda nowy plik i dla każdego miejsca zawierającego wartość nieznaną **lub zero** szuka
najbliższej pasującej wartości w starym pliku, wpisując ją w to miejsce. Prawdziwe zero w
nowym pliku zostanie więc zastąpione starymi danymi. W przypadku metryk, które naturalnie przez długi czas
mają wartość zero (nieużywany port, pusta kolejka, licznik w stanie spoczynku), dokładnie zbadaj
wynik przed jego wdrożeniem. Wartości nieznane w starym pliku są uzupełniane wartościami
poprzedzającymi, przez co wynikowy plik może stworzyć sztuczną ciągłość danych w miejscach rzeczywistych przerw.
:::

Po zakończeniu łączenia umieść plik w miejscu docelowym wymaganym przez źródło danych, z uprawnieniami
potrzebnymi pollerowi, i sprawdź, czy wykres generuje się prawidłowo.

## 8. Uzupełnianie luk i dlaczego warto to przemyśleć

| Narzędzie | Co zapisuje |
|---|---|
| `cli/batchgapfix.php` | Wypełnia zakres dat na wielu urządzeniach równolegle, używając ostatniej znanej wartości lub średniej |
| `cli/float_rrdfiles.php` | Przesuwa zakres na wybranych wykresach za pomocą tej samej ścieżki dump i restore |

Oba narzędzia generują sztuczne pomiary. W podanych punktach czasowych nie zebrano żadnych danych, a po
zakończeniu operacji w pliku nie da się odróżnić wartości sztucznych od prawdziwych. Używaj ich wyłącznie wtedy,
gdy wiesz, że przerwa nie wynikała z awarii infrastruktury: poller wyłączony na czas prac, okno migracyjne.
Nigdy na danych służących do rozliczeń lub planowania pojemności. Ta sama ostrożność dotyczy
[usuwaniu skoków](/pl/guides/remove-spikes-from-data/).

## 9. Zautomatyzowane debugowanie pojedynczego źródła danych

Dla źródła danych zachowującego się nietypowo Kadupul może przeprowadzić procedurę diagnostyczną przez kilka
kolejnych cykli odpytywania i wydać werdykt: czy plik istnieje, czy on i jego
katalog są zapisywalne, jakie konto jest jego właścicielem w porównaniu z kontem pollera,
czy źródło danych jest aktywne, czy plik odpowiada definicji źródła danych,
czy znacznik ostatniej aktualizacji zmienił się po cyklu i czy wartości były poprawne. Zakres
naprawy jest wąski. Skrypt wykonuje jedynie zalecenia `rrdtool tune` wygenerowane przez
porównanie, odmawiając działania i rejestrując powód, gdy lista jest pusta lub plik
jest niezapisywalny. Nie odtwarza plików, nie dodaje źródeł danych ani nie modyfikuje archiwów.

## 10. Usuwanie to odrębne zagrożenie

Kadupul śledzi pliki archiwów, których źródło danych już nie istnieje, i oferuje możliwość
ich usunięcia. Może także działać automatycznie po skasowaniu źródła danych, stosując dwie
metody: usunięcie lub przeniesienie do katalogu archiwum.

:::danger[Usunięcie jest bezpowrotne]
Metoda usuwania kasuje plik z dysku. Nie ma kosza, a dane
nie znajdują się w bazie danych. Jeśli nie masz pewności, że każdy plik na liście jest rzeczywiście osierocony,
wybierz metodę archiwizacji, która przenosi pliki do wskazanego katalogu, a następnie uporządkuj
ten katalog ręcznie.
:::

Plik może wyglądać na osierocony, choć w rzeczywistości nim nie jest. Źródło danych przeniesione pod nową ścieżkę,
częściowo ukończone przywracanie lub urządzenie utworzone pod nowym identyfikatorem pozostawiają pliki, do których
nic się nie odwołuje. Przed podjęciem działań zestaw listę z własnym rejestrem zmian.

## Typowe problemy

| Symptom | Przyczyna |
|---|---|
| Naprawa powiodła się, lecz wykres nadal jest pusty | Sprawdź uprawnienia, wybrany zakres czasu, zbieranie danych i definicję wykresu |
| Polecenie `rrdtool dump` zgłasza błąd pliku | Sprawdź ścieżkę, uprawnienia, pamięć masową i format przed uznaniem pliku za uszkodzony |
| Zastosowano Tune, lecz nic się nie zmieniło | Zmiany w nagłówku nie uzupełniają wstecznie historycznych wartości nieznanych; zweryfikuj definicje w pliku i bazie |
| Drobne luki na wykresach po zmianie interwału | Pliki nadal zachowują stary krok i parametr heartbeat |
| Scalony plik zawiera stare dane w miejscach, gdzie nowy miał zero | Oczekiwane zachowanie. Narzędzie splice uzupełnia zera tak samo jak wartości nieznane |
| Lista kontrolera rośnie i nie zmniejsza się | Wyniki są przechowywane do momentu wyczyszczenia; usunięcie przyczyny nie kasuje wpisów |

Twórz kopie zapasowe katalogu archiwów oraz bazy danych wspólnie, według jednego harmonogramu, i regularnie testuj
ich przywracanie. Odzyskanie danych ogranicza się do tego, co kopia zapasowa zawierała w momencie utworzenia. Zobacz
[Tworzenie i przywracanie kopii zapasowych](/pl/guides/back-up-and-restore/).
