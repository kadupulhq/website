---
title: Czas i interwały
description: Interwał odpytywania, krok RRD, heartbeat i rozbieżność zegarów, oraz dlaczego znacznik czasu próbki decyduje o więcej niż się oczekuje.
sidebar:
  order: 7
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
---

Gromadzenie danych opiera się na trzech zegarach: takcie programu uruchamiającego, interwale odpytywania w ramach każdego wywołania oraz kroku RRD. Wymagają one spójnych ustawień.

| Wartość | Przypisana do | Sposób wykorzystania |
|---|---|---|
| Interwał programu uruchamiającego | Cron, Harmonogram zadań lub `cactid.php` | Musi odpowiadać `cron_interval`, interpretowanemu przez `poller.php` jako 60 lub 300 sekund |
| Interwał odpytywania | Przebiegi zbierania danych | `poller.php` wylicza całkowitą liczbę przebiegów na interwał programu uruchamiającego |
| Krok | Plik RRD | Bazowy interwał normalizacji, ustawiany na podstawie profilu źródła danych podczas tworzenia |
| Heartbeat | Pole w pliku RRD | Maksymalna dozwolona przerwa między aktualizacjami; odczytywany z definicji pola źródła danych |

Dla przykładu, program uruchamiający co 60 sekund i 10-sekundowy interwał odpytywania dają sześć przebiegów na wywołanie. Program uruchamiający co 300 sekund i 300-sekundowy interwał odpytywania dają jeden przebieg. Nie należy konfigurować interwału programu uruchamiającego na wartość niższą niż interwał odpytywania: dzielenie 60/300 daje zero przebiegów. Należy używać jednego harmonogramu i zatrzymać go przed ręcznym uruchomieniem z opcją `--force`. Zobacz [Instalacja](/pl/start/install/).

Modyfikacja profilu nie powoduje automatycznej migracji istniejących plików. Heartbeat można skorygować; zmiana kroku wymaga zaplanowanej migracji przy użyciu narzędzi RRDtool. Po zakończeniu należy sprawdzić definicje w bazie danych oraz wynik polecenia `rrdtool info`.

## Kiedy wartości są zgodne

Źródło danych, którego krok odpowiada interwałowi odpytywania, kwalifikuje się do odpytania w każdym przebiegu, zależnie od stanu urządzenia, zawartości pamięci podręcznej i limitów czasu wykonania. Domyślna konfiguracja stosuje 300 sekund dla obu parametrów. Kwalifikacja nie gwarantuje pomyślnego odczytu.

## Kiedy krok jest dłuższy niż interwał

Kolektor PHP wykorzystuje `rrd_next_step` dla każdego wiersza listy roboczej, gdy wymaga tego wiele aktywnych harmonogramów. Wybiera wiersze z wartością zero lub mniejszą, a następnie aktualizuje liczniki dla swojego zakresu kolektora i hostów. Wiersze, których krok jest równy interwałowi odpytywania, pozostają na poziomie zero. W pozostałych wierszach wartość zmniejsza się o interwał odpytywania; po osiągnięciu wartości ujemnej reset zależy od trybu wywołania: normalny przebieg pomocniczy resetuje licznik do wartości kroku pomniejszonej o interwał, natomiast równe interwały i ścieżka wszystkich hostów resetują do pełnego kroku. Nie należy zakładać, że krok 10-minutowy zawsze oznacza co drugie wywołanie 5-minutowe; należy weryfikować oczekujące wiersze i znaczniki czasu.

Po włączeniu opcji **Równoważenie obciążenia procesów** budowanie pamięci podręcznej przypisuje przesunięcia kolejnym źródłom danych na urządzeniu na podstawie kroku i interwału odpytywania. Pola tego samego źródła dzielą wspólne przesunięcie. Może to rozłożyć zadania pomiędzy przebiegi, lecz nie gwarantuje równego czasu wykonania ze względu na opóźnienia, limity czasu i skrypty. Program uruchamiający koryguje ponadto niespójne liczniki pól w ramach danego źródła danych.

Zanim wyciągnie się wniosek o awarii elementu z powodu braku danych w jednym przebiegu, należy sprawdzić stan jego oczekiwania i kolejne przebiegi. Zobacz [Pamięć podręczna pollera](/pl/concepts/the-poller-cache/) pod kątem ograniczeń przebudowy.

## Kiedy krok jest krótszy niż interwał

Krótszy krok nie wygeneruje pomiarów, których kolektor nigdy nie pobrał. Kadupul ostrzega podczas tworzenia pamięci podręcznej, gdy zbieranie danych jest zbyt wolne w stosunku do kroku; należy skorygować ustawienia i przebudować pamięć podręczną.

Taka rozbieżność nie musi prowadzić do powstania wykresu o wyglądzie grzebienia. RRDtool potrafi znormalizować rzadsze aktualizacje do mniejszych kroków, jeśli pozwala na to heartbeat, lecz nie odtworzy to utraconych szczegółów pomiarowych.

## Heartbeat nie zawsze wynosi dwukrotność kroku

Heartbeat to maksymalny dopuszczalny odstęp między aktualizacjami, zanim dane wejściowe zostaną uznane za nieznane. Tworzenie pliku RRD odczytuje heartbeat z definicji pola źródła danych, która może dziedziczyć parametry profilu lub szablonu. Nie jest to dodatkowy okres karencji dodawany do kroku; należy sprawdzić pole i plik w razie rozbieżności z profilem.

Standardowe profile nie stosują jednej reguły.

| Profil | Krok | Heartbeat | Limit interwału aktualizacji |
|---|---|---|---|
| Pięć minut | 300 | 600 | 10 minut |
| Jedna minuta | 60 | 600 | 10 minut |
| Trzydzieści sekund | 30 | 1200 | 20 minut |

Są to fabryczne wartości profilu, a nie mechanizm wykrywania awarii. Jawne nieznane dane wejściowe mogą utworzyć luki przed upływem wartości heartbeat; normalizacja i progi archiwów decydują o widoczności danych. Większy heartbeat toleruje większą przerwę. Wartość równa lub mniejsza od normalnego interwału aktualizacji nie pozostawia marginesu na opóźnienia.

Należy sprawdzać rzeczywisty plik oraz jego profil. Istniejące pliki RRD mogą różnić się od zmodyfikowanych definicji w bazie danych; audyt plików raportuje takie rozbieżności. Przed modyfikacją plików zapoznaj się z [definicją heartbeat w RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) oraz [przewodnikiem po dostrajaniu](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html).

## Zapisane dane różnią się od wskazań urządzenia

RRDtool normalizuje aktualizacje do stałych granic kroków. Wartości leżące pomiędzy granicami mogą zasilić więcej niż jeden podstawowy punkt danych. Heartbeat, jawne wartości nieznane i limity wpływają na poprawność danych; konsolidacja archiwów stosuje własny próg danych nieznanych. Krok nie musi zawierać osobnej surowej próbki, aby zachować znaną wartość.

Wartości liczników stają się wskaźnikami tempa w czasie, z uwzględnieniem resetów i przekroczeń zakresu. Wartości mierników są również normalizowane w czasie. Krótkie skoki mogą ulec osłabieniu lub całkowitemu pominięciu w procesie próbkowania. Ustawienia archiwów nie zrekonstruują szczegółów, które nigdy nie zostały zebrane lub przepadły podczas normalizacji.

## Który zegar decyduje

W standardowym trybie zbierania `cmd.php` funkcja SQL `CURRENT_TIMESTAMP()` określa wyjściowy znacznik czasu podczas wstawiania partii danych. Nie jest to znacznik czasu pochodzący z urządzenia ani dokładny moment odebrania odpowiedzi. Inne mechanizmy zbierania i ścieżki czasu rzeczywistego wymagają osobnej weryfikacji.

Kolektor PHP buforuje wyniki i zapisuje je partiami, opróżniając bufor po zmianie urządzenia lub jego zapełnieniu. Znacznik czasu jest wyznaczany raz na partię, więc wszystkie wartości w danej partii otrzymują ten sam czas.

Konsekwencje tego rozwiązania nie są oczywiste, dlatego warto je wyjaśnić.

**Zegar urządzenia nie oznacza tych próbek SNMP.** Kolektor używa czasu wstawienia do bazy danych. Czas urządzenia może mieć znaczenie dla skryptów lub interpretacji metryk, co nie zwalnia z dbałości o synchronizację zegarów.

**Błędny zegar kolektora lub bazy danych przesuwa dane.** Wartości trafiają w niewłaściwe przedziały czasowe, a plik częściowo zapisany odrzuci aktualizację, której czas nie jest późniejszy od poprzedniego zapisu. Jeśli znaczniki cofną się za ostatnią aktualizację pliku, nowe dane nie przesuną stanu pliku, dopóki ich czas go nie przewyższy. Należy sprawdzić zegar bazy danych, zegar kolektora i czas pliku; sama zmiana zegara kolektora nie musi wpłynąć na znaczniki generowane przez bazę danych.

**Czas w ramach cyklu staje się zniekształceniem.** Urządzenie odpytane pod koniec długiego przebiegu otrzymuje późniejszy znacznik niż odpytane na początku, mimo że należą do tego samego cyklu. Przy dużym obciążeniu kolektora to przesunięcie może stanowić istotną część interwału i przy zbyt ciasnym parametrze heartbeat powodować powstawanie luk.

**Strefa czasowa bazy danych leży pośrodku całego procesu.** Znacznik jest zapisywany jako czas bazy danych i przekształcany z powrotem do czasu bezwzględnego podczas odczytu. Niespójna obsługa stref czasowych w sesjach może zmienić tę interpretację. Należy sprawdzić ustawienia sesji zapisu i odczytu oraz konwersję epoki; zmiana strefy wyświetlania nie świadczy o przesunięciu zapisanych danych.

## Odczyty są łączone według znacznika czasu

Źródło danych posiadające wiele pól, np. interfejs z bajtami wejściowymi i wyjściowymi, może korzystać z osobnych zadań SNMP lub skryptu zwracającego kilka nazwanych wartości. Przetworzone pola są grupowane według źródła danych i znacznika czasu na potrzeby aktualizacji RRD.

Niekompletny zestaw jest wstrzymywany zamiast zapisywania wybrakowanych danych, dopóki nie zostanie zebrana oczekiwana liczba pól. Jest to kontrola spójności, a nie gwarancja poprawności numerycznej; jawne wartości nieznane nadal mogą zostać zapisane. Zwykle obie części znajdują się w tej samej partii i dzielą znacznik czasu. Partie zapisane w obrębie tej samej sekundy również mogą się połączyć. Przy różnych znacznikach grupy mogą pozostać niekompletne i nie wygenerować aktualizacji. Bieżący kod przechowuje niekompletne grupy między cyklami, po czym rejestruje błąd i usuwa je po `5 * max(60, poller_interval)` sekundach. Granica strony odczytu jest rozszerzana, aby objąć ostatnią grupę czasową.

Aktualizacje są ponadto sortowane rosnąco według czasu przed zapisem, ponieważ plik nie przyjmie wartości starszej niż jego ostatnia aktualizacja.

## Odroczone zapisy zachowują znaczniki czasu

Gdy zapisy do RRD są odraczane i wykonywane zbiorczo w późniejszym czasie, zarejestrowany znacznik czasu towarzyszy wartości, a partia jest zapisywana w porządku chronologicznym. Południowy znacznik czasu zostaje zachowany, gdy próba aktualizacji następuje o pierwszej; nie zastępuje go czas opróżnienia bufora. RRDtool normalizuje zaakceptowane aktualizacje do granic kroków.

Kolejka zaległości może zaktualizować plik przy użyciu znaczników nowszych niż jego ostatni stan. Nie potrafi jednak wypełnić luk powstałych przed tym znacznikiem. Moduł Boost filtruje próbki ze znacznikiem równym lub wcześniejszym niż ostatnia aktualizacja pliku; opróżniona kolejka nie stanowi dowodu, że każda próbka została zastosowana. Zobacz [Zapisy o dużej objętości](/pl/concepts/high-volume-writes/) oraz [dokumentację aktualizacji RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdupdate.en.html). Odroczone zapisy zależą od pomyślnego zapisu i właściwej kolejności czasowej; nie gwarantują naprawy każdego błędu. W razie problemów z kolejką należy sprawdzić dane zatrzymane i odrzucone.

## Kiedy cykl nie dobiega końca

Kolektor PHP weryfikuje czas wykonania między zadaniami i przerywa pętlę po przekroczeniu interwału odpytywania, rejestrując ostrzeżenie. Nie jest to sztywne przerwanie w wyznaczonym momencie: trwająca operacja może przekroczyć limit przed dokonaniem kontroli. Zadania, do których kolektor nie dotarł, nie generują wartości w danym cyklu. Powstałą lukę można zniwelować, jeśli pozwalają na to heartbeat i progi archiwów. Powtarzające się przekroczenia czasu stanowią powód do zbadania wydajności, limitów czasu i błędów zbierania danych, a nie dowód na wspólną przyczynę każdej luki.

Informacje o rozwiązywaniu tych problemów zawiera przewodnik [Skalowanie pollera](/pl/guides/scale-the-poller/). Kolejność wykonywania zadań wraz z zabezpieczeniami opisano w artykule [Cykl życia pollera](/pl/reference/poller-lifecycle/).
