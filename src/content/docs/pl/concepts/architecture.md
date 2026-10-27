---
title: Architektura
description: Cztery ruchome elementy i który z nich jest zwykle przyczyną problemów.
sidebar:
  order: 1
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
---

:::caution[Odziedziczone zachowanie proxy RRDtool]
Wdrożenie proxy RRDtool nie jest obsługiwane w Kadupul. Używaj lokalnego magazynu RRDtool
(`storage_location = 0`). Ustawienia proxy, opisy protokołów i przepływy pracy
na tej stronie dokumentują odziedziczone zachowanie, a nie obsługiwane wdrożenie czy ścieżkę migracji.
Zobacz [RRDtool proxy](/pl/reference/rrdproxy/).
:::

Aplikacja internetowa, baza danych, zaplanowane zbieranie danych i magazyn RRD w systemie Kadupul
pełnią różne zadania, ale ich ścieżki wykonania nakładają się na siebie. Wiedza o tym, która operacja
zakończyła się niepowodzeniem, ułatwia diagnozę; działający interfejs nie dowodzi, że zbieranie danych działa.

**Interfejs internetowy** to aplikacja PHP. Zarządza konfiguracją oraz renderuje lub
udostępnia wykresy z pamięci podręcznej. Niektóre akcje internetowe wyzwalają także zbieranie danych,
takie jak żądania wykresów w czasie rzeczywistym, a standardowe żądania wykresów mogą wyzwalać oczekujące aktualizacje RRD.

**Baza danych** przechowuje konfigurację, uprawnienia, stan operacyjny, pamięć podręczną pollera
i kolejki pomiarów. Zebrane wartości mogą w niej oczekiwać na zapis do RRD lub ponowną próbę;
nie jest ona jedynie magazynem konfiguracji.

**Poller** koordynuje zaplanowaną pracę i procesy potomne zbierające dane. Wyniki przechodzą
przez kolejki bazy danych, zanim standardowy lub odroczony proces zapisujący zaktualizuje pliki RRD.

**Pliki RRD** przechowują ograniczone szeregi historyczne. Źródło danych zazwyczaj posiada jeden plik RRD
zawierający jego pola; tworzenie wykresów może ponownie wykorzystywać źródła, a utworzenie metadanych
nie gwarantuje, że plik już istnieje.

## Granice

| Granica | Co przez nią przechodzi | Nośnik |
|---|---|---|
| Interfejs do bazy danych | Konfiguracja, sesje, autoryzacja, zadania w pamięci podręcznej i dane operacyjne | SQL; baza danych może znajdować się na zdalnym hoście |
| Interfejs do plików | Odczyty wykresów, obrazy w pamięci podręcznej oraz kwalifikujące się aktualizacje lub tworzenie RRD na żądanie | System plików i RRDtool |
| Poller do bazy danych | Listy zadań, zebrane wartości, zachowane kolejki, stan i odliczanie | SQL |
| Zbieranie danych do urządzeń | SNMP, skrypty zbierające i kontrole dostępności | Sieć lub polecenia lokalne; możliwe jest także zbieranie wyzwalane przez interfejs WWW |
| Zapisujący do plików | Pogrupowane próbki, potencjalnie kilka sygnatur czasowych na jedną aktualizację | Polecenia RRDtool i potwierdzane potoki |
| Serwer bazy danych do plików RRD | Brak bezpośrednich aktualizacji RRD w standardowej ścieżce aplikacji | Kod zapisujący aplikacji koordynuje oba magazyny |

Wiersze bazy danych łączą źródło danych z urządzeniem i jego skonfigurowaną ścieżką pliku.
Pliki RRDtool opisują szeregi i archiwa; nie zastępują one tego mapowania na poziomie aplikacji.
Ruch sieciowy nie ogranicza się do odpytywania urządzeń: połączenia z bazą danych, zdalni zbieracze
i inne skonfigurowane integracje również mogą łączyć różne hosty.

Twórz spójne kopie zapasowe stanu bazy danych, oczekujących próbek i plików RRD. Przywrócenie
samej bazy danych nie przywraca historycznej zawartości RRD, a przywrócenie samych plików
pomija konfigurację i niewypchnięte próbki. Przenoszenie plików bez uzgodnienia ścieżek
może prowadzić do błędów brakujących plików lub zablokowanych zapisów; nie jest to gwarantowana
cicha awaria zbierania danych. Zobacz [Tworzenie i przywracanie kopii zapasowych](/pl/guides/back-up-and-restore/) oraz
[Migracja na nowy sprzęt](/pl/guides/migrate-to-new-hardware/).

<span id="why-measurements-are-not-in-the-database"></span>

## Dlaczego historia długoterminowa korzysta z plików RRD

Historia wykresów długoterminowych jest przechowywana w plikach RRD, ale kolejki pomiarów znajdują się w bazie danych.
Standardową kolejką w locie w tej wersji jest InnoDB, a odroczone zapisy przechowują
próbki w tabelach Boost. Nieudane zapisy lub opóźnione dostarczanie zdalne mogą powodować rozrost tych
kolejek. Zobacz [Zapisy o dużym wolumenie](/pl/concepts/high-volume-writes/).

Plik RRD przydziela określoną liczbę wierszy przy wybranych rozdzielczościach. Zwykłe aktualizacje
wykorzystują to miejsce ponownie, zamiast bez końca dopisywać nową historię. Rozmiar pliku jest ograniczony
w przypadku niezmienionego układu; dodawanie źródeł danych, zmiana układów, zachowywanie kopii ratunkowych
lub kumulowanie kolejek nadal zwiększa łączne zapotrzebowanie na przestrzeń dyskową.

Kompromisem jest retencja określona z góry. Gdy szczegółowa historia wygaśnie lub
zostanie skonsolidowana, późniejsza zmiana układu nie odtworzy odrzuconych szczegółów. Zobacz
[Źródła danych i archiwa round-robin](/pl/concepts/data-sources-and-rras/).

Konfiguracja i stan operacyjny korzystają z bazy danych, ponieważ aplikacja wymaga współdzielonych aktualizacji
i zapytań relacyjnych. Nie oznacza to, że każda relacja jest wymuszana przez klucz obcy
w bazie danych ani że magazyn wierszy musi stale rosnąć; opisuje to podział odpowiedzialności w tej aplikacji.

## Dwie ścieżki dzielące dwie części

Standardowe żądanie strony lub wykresu zazwyczaj przebiega następującą ścieżką:

1. Przeglądarka wysyła żądanie; PHP ładuje konfigurację i łączy się z bazą danych.
2. Żądanie stosuje uwierzytelnianie i odpowiednią autoryzację sfery/obiektu.
3. Akcje konsoli odczytują lub aktualizują konfigurację i mogą wyzwalać dodatkowe zadania.
4. Żądanie wykresu może sprawdzić oczekujące próbki Boost i pamięć podręczną obrazów lub
   zbudować polecenie RRDtool i odczytać skonfigurowane pliki. Zobacz
   [Jak rysowane są wykresy](/pl/concepts/how-graphs-are-drawn/).
5. Żądania wykresów w czasie rzeczywistym mogą uruchomić moduł zbierający w czasie rzeczywistym i używać
   osobnych danych tymczasowych. Płaski wykres sam w sobie nie dowodzi, że plik jest pusty ani że zbieranie
   i renderowanie zakończyło się powodzeniem.

Zaplanowane odpytywanie zazwyczaj przebiega następującą ścieżką:

1. Harmonogram uruchamia poller, który sprawdza stan włączenia, czas i magazyn.
2. Wybiera on oczekujące zadania z pamięci podręcznej pollera i uruchamia procesy potomne zbierające dane.
3. Procesy potomne odpytują urządzenia lub uruchamiają skrypty zbierające i zapisują wyniki przejściowe w bazie danych.
4. Właściwy proces zapisujący przetwarza zgrupowane próbki, używając odroczonych kolejek, jeśli
   zostały skonfigurowane, i zachowując błędy kwalifikujące się do ponowienia.
5. Stan operacyjny i stan harmonogramu są aktualizowane w bazie danych.

Zobacz [Cykl życia pollera](/pl/reference/poller-lifecycle/) pod kątem kolejności i obsługi błędów.
Te ścieżki współdzielą zasoby bazy danych i pamięci masowej oraz mogą o nie rywalizować. Restart
serwera WWW nie naprawia osobno zaplanowanego pollera, ale żądania WWW mogą brać udział w zbieraniu
i zapisywaniu danych; należy zdiagnozować rzeczywiście wadliwy proces.

## Co działa jako który użytkownik

| Proces | Działa jako | Uruchamiany przez |
|---|---|---|
| Aplikacja internetowa PHP | Serwer WWW lub konto puli PHP-FPM | Serwer WWW |
| Zaplanowany poller | Skonfigurowane konto harmonogramu | cron, Harmonogram zadań lub skonfigurowana usługa |
| RRDtool | Zwykle dziedziczy konto procesu uruchamiającego | Ścieżka WWW, pollera lub konserwacji |
| Skrypty zbierające dane | Zwykle dziedziczą konto swojego modułu zbierającego | Zaplanowane lub wyzwalane przez interfejs WWW zbieranie danych |

Wszystkie uczestniczące konta zapisujące wymagają odpowiedniego dostępu do skonfigurowanego magazynu.
Zwykłe utworzenie źródła danych zapisuje metadane; plik RRD może zostać utworzony później, gdy
będzie potrzebny procesowi zapisującemu. Brakujący plik może wskazywać, że zbieranie danych nie dotarło
jeszcze do tego etapu, jak również na błąd ścieżki, zaufania, uprawnień lub tworzenia.

Niektóre ścieżki tworzenia uruchamiane jako root próbują zastosować właściciela i grupę katalogu RRA.
Próby te mogą się nie powieść i wygenerować błędy w dziennikach; nie zastępują one prawidłowego
skonfigurowania kont usługowych. Własność inna niż root podlega regułom systemu operacyjnego,
w tym dziedziczeniu grup katalogów i listom ACL. Sprawdź uprawnienia do magazynu oraz numeryczne
zaufane ustawienia UID/GID dla każdego konta zapisującego serwera WWW i pollera. Zobacz
[Bezpieczna aktualizacja](/pl/guides/upgrade-safely/).

Przeanalizowana implementacja PHP ICMP wywołuje narzędzie ping systemu operacyjnego.
Jego zdolność do wysyłania sond zależy od tego narzędzia i zasad systemu operacyjnego; obecność
przestarzałych funkcji pomocniczych efektywnego identyfikatora UID nie oznacza, że każda sonda ICMP
podnosi uprawnienia PHP do poziomu root. Nie uruchamiaj aplikacji jako root tylko po to, aby włączyć ping.
Sprawdź rzeczywiste polecenie, konto i wygenerowane błędy; testy TCP lub UDP mają inną semantykę osiągalności.

## Lista zadań jest obliczana wstępnie

Pamięć podręczna pollera przechowuje przetworzone zadania zbierania danych, dzięki czemu każde uruchomienie
nie musi wyprowadzać każdego polecenia z relacji szablonów. Operacje konfiguracji mogą przebudować
dotknięte wpisy; w razie potrzeby dostępne są jawne narzędzia do przebudowy.

Zmiany odzwierciedlone w polach pamięci podręcznej muszą dotrzeć do tych wpisów, zanim zbieranie danych
ich użyje. Inne ustawienia są odczytywane oddzielnie, więc nie każda zmiana konfiguracji wymaga ręcznej
przebudowy pamięci podręcznej. Zbadaj zawartość pamięci podręcznej, błędy zbierania i stan replikacji
zdalnej, zamiast zakładać jedną przyczynę. Zobacz [Pamięć podręczna pollera](/pl/concepts/the-poller-cache/) oraz
[Zdalne zbieranie danych](/pl/concepts/remote-data-collection/).

## Gdzie zwykle pojawiają się problemy

| Symptom | Przydatne kontrole |
|---|---|
| Interfejs działa, wykresy są płaskie | Praca harmonogramu, błędy zbierania, kolejki, świeżość próbek i okno wykresu |
| Poller działa, pliki nie zmieniają się | Potwierdzenia/błędy procesu zapisującego, zaufanie i uprawnienia magazynu, zaległości w kolejce odroczonej |
| Jedno źródło danych jest płaskie | Odpowiedź urządzenia, wiersz pamięci podręcznej, mapowanie pliku, nieznane próbki i wyrażenia rysowania |
| Zmiana konfiguracji wydaje się nieskuteczna | Wynik zapisu, nadpisania szablonów, zmienione wpisy pamięci podręcznej i replikacja |
| Regularne luki | Czas, heartbeat, limity czasu, dostępność urządzenia i błędy zapisu |
| Nieoczekiwany kształt wykresu | Wygenerowane polecenie, wybór CDEF/CF, rzeczywiste dane w pliku, pamięć podręczna obrazów i mapowanie |
| Historia portu wydaje się przypisana do innego interfejsu | Tożsamość zapytania, zmiana numeracji i wyniki ponownego indeksowania |
| Konto widzi konsolę, ale nie widzi wykresów | Sfera strony wykresu, autoryzacja obiektów i żądana tożsamość wykresu |
| Zbieracze różnią się od siebie | Przypisanie, zreplikowana konfiguracja, lokalne nadpisania i stan połączenia |
| Wszystko działa powoli | Oczekiwanie na bazę danych, rywalizacja o zapis/magazyn, czas działania zbieracza i obciążenie WWW |
| Metadane źródła danych istnieją, ale plik nie | Pierwsze zbieranie/zapis, skonfigurowana ścieżka, błędy zaufania i tworzenia |

Są to punkty wyjścia, a nie ostateczne diagnozy. Podążaj za dowodami przez odpowiednią granicę
i weryfikuj wynik po wprowadzeniu zmiany. Zobacz [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/).
