---
title: Odczytaj pierwszy wykres
description: Co w rzeczywistości oznaczają linie i trzy błędy, przez które ludzie błędnie je odczytują.
sidebar:
  order: 4
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
---

Wykres w tym systemie nie jest bezpośrednim obrazem twoich danych. Jest obrazem podsumowania twoich danych, a zrozumienie, które podsumowanie oglądasz, ma kluczowe znaczenie.

## Na co patrzysz

Każdy wykres jest rysowany na podstawie archiwum round-robin. Archiwum przechowuje ostatnie próbki w pełnej rozdzielczości, a starsze próbki konsoliduje w grubsze przedziały. Kiedy oddalasz widok do skali roku, nie widzisz każdego pięciominutowego pomiaru. Widzisz jedną wartość na przedział, wybraną przez funkcję konsolidacji.

Tą funkcją jest zazwyczaj średnia. Może to być również maksimum lub minimum. Ma to większe znaczenie niż cokolwiek innego na tej stronie.

W przypadku standardowego żądania wykresu na żądanie Kadupul składa polecenie RRDtool na podstawie konfiguracji wykresu i uruchamia je względem plików na dysku. Na to polecenie składają się trzy rodzaje wierszy i warto wiedzieć, do czego każdy z nich służy.

| Część | Co robi |
|---|---|
| Definicja | Wskazuje plik, znajdujące się w nim źródło danych oraz funkcję konsolidacji |
| Element rysujący | Przekształca serię w linię, obszar lub pasmo na stosie |
| Element legendy | Wypisuje pojedynczą liczbę, obliczoną dla aktualnie wyświetlanego okna czasowego |

Cała ta konstrukcja została opisana w dokumencie [Jak rysowane są wykresy](/pl/concepts/how-graphs-are-drawn/). Nie musisz tego dziś szczegółowo analizować. Wystarczy wiedzieć, że definicja wykresu i żądany zakres czasu determinują generowany obraz. Buforowanie i ścieżki wykresów w czasie rzeczywistym mogą zachowywać się inaczej.

## Zacznij od ostatnich czterech godzin

Zacznij od krótkiego, niedawnego okna czasowego. Wybrane archiwum zależy od retencji, kroku i rozdzielczości wykresu; cztery godziny nie gwarantują danych surowych ani nieskonsolidowanych. Nawet najbardziej szczegółowe archiwum zawiera wartości znormalizowane czasowo. Użyj polecenia debugowania wykresu oraz `rrdtool info`, aby sprawdzić żądaną funkcję i dostępne kroki archiwum przed porównywaniem wartości.

Dwie cechy nowego wykresu są zupełnie normalne, choć często niepotrzebnie niepokoją użytkowników.

**Linia może kończyć się przed chwilą obecną.** Bieżący przedział może być jeszcze niekompletny. Czas zbierania danych, buforowanie i normalizacja mogą również opóźniać widoczny punkt końcowy. Sprawdzaj, czy znaczniki czasu aktualizacji przesuwają się naprzód, zamiast traktować stałe opóźnienie jako dowód prawidłowego działania.

**Pierwszy odcinek może być pusty.** Źródło danych utworzone godzinę temu zawiera godzinę danych i jedenaście miesięcy pustki. Archiwum jest w całości alokowane w momencie utworzenia, więc pusta część to rzeczywiste miejsce w pamięci masowej oczekujące na wykorzystanie.

## Następnie rozszerz zakres i obserwuj zmianę szczytów

Rozszerz zakres do jednego tygodnia. Wartości szczytowe mogą się zmniejszyć, gdy wykres wybierze grubsze średnie. Na przykład, jeśli utylizacja wynosi 100% przez pięć minut i zero przez pozostałe 55 minut, średnia godzinowa wynosi około 8,3%. Czterominutowy skok w skądinąd bezczynnej godzinie daje średnią około 6,7%. Krótkie szczyty mogą zostać wygładzone już w ramach pierwotnego interwału próbkowania.

Konsolidacja odrzuca szczegóły. Jeśli historia o wysokiej rozdzielczości wygasła, przybliżenie widoku nie odtworzy jej z archiwum średnich.

Jest to pierwszy z trzech błędów i ten, który wywołuje najwięcej sporów.

**Odczytywanie średniej jako wartości szczytowej.** Jeśli zależy ci na nasyceniu łącza, spójrz na wykres oparty na wartościach maksymalnych, a nie na średniej. Działa to tylko wtedy, gdy archiwa przechowują maksima. Jeśli pozostały tylko zgrubne średnie, pierwotnych szczytów nie da się zrekonstruować. Archiwum MAX zachowuje maksima swoich znormalizowanych czasowo punktów wejściowych, a nie niezarejestrowany chwilowy szczyt między odpytaniami.

Warto wiedzieć o pewnym cichym zachowaniu: jeśli element wykresu żąda wartości maksymalnych, a plik ich nie zawiera, mechanizm wyboru Kadupul może powrócić do pierwszej dostępnej funkcji lub do AVERAGE, gdy nie jest w stanie ustalić dostępnych funkcji. Obraz wygląda poprawnie, ale odpowiada na zupełnie inne pytanie.

**Odczytywanie przerwy jako zera.** Przerwa oznacza nieznaną naniesioną wartość. Przyczyny obejmują brakujące aktualizacje, jawnie nieznane dane wejściowe, odrzucone wartości i wyrażenia wykresów. Nie identyfikuje to jednoznacznie niedostępnego urządzenia.

Heartbeat to maksymalny dozwolony czas między aktualizacjami, a nie dodatkowy czas dodawany do kroku. Na przykład krok 300 sekund z heartbeat wynoszącym 600 sekund zezwala na maksymalnie 600 sekund między aktualizacjami, a nie 900. Progi nieznanych danych w archiwum również wpływają na widoczne przerwy. Zobacz [RRDtool’s data-source definitions](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html) oraz [Czas i interwały](/pl/concepts/time-and-intervals/).

Uważaj na wykresy skumulowane. Niektóre szablony zastępują nieznane wartości zerem w swoich wyrażeniach wykresów. Na takich wykresach awaria i okres bezczynności wyglądają z założenia tak samo. Sprawdź widok nieskumulowany przed wyciągnięciem wniosku, że usługa przestała generować ruch.

**Porównywanie dwóch wykresów o różnych skalach pionowych.** Dwa wykresy obok siebie będą skalować się każdy do własnych danych. Niewielki wzrost i duży skok mogą wyglądać identycznie. Sprawdź oś przed wyciągnięciem jakichkolwiek wniosków.

Patrząc na oś, sprawdź również jej podstawę. Wykres może opisywać wartości w tysiącach lub w jednostkach 1024. Zapisane liczby są identyczne; zmieniają się tylko etykiety. Różnica zależy od przedrostka: 1024 w stosunku do 1000 to 2,4% dla pierwszej potęgi i rośnie przy większych przedrostkach. Sprawdź również bity w odniesieniu do bajtów, wyrażenia wykresów i konsolidację; sama różnica procentowa nie wyjaśnia przyczyny.

## Odczytywanie legendy

Legenda zawiera liczby, które mają większe znaczenie niż sam kształt wykresu. „Bieżący” to zazwyczaj redukcja LAST wybranej serii, która nie musi być pomiarem wykonanym dokładnie w momencie przeglądania wykresu. Średnia i maksimum są obliczane w wyświetlanym oknie czasowym, a nie w całym czasie, więc zmieniają się wraz z przybliżaniem lub oddalaniem.

Domyślnie dostarczane pozycje legendy to minimum, maksimum, średnia oraz ostatnia wartość, oznaczona jako bieżąca. Dwie kwestie z nimi związane często zaskakują użytkowników.

**Liczba w legendzie jest redukcją tego, co narysowano, a nie tego, co zapisano.** Maksimum wypisane nad serią odczytaną za pomocą średnich jest maksimum z tych wyliczonych średnich przy wybranej rozdzielczości. Nie jest to najwyższa pojedyncza próbka w historii. Na obciążonym łączu są to zupełnie różne liczby i obie są trafnymi odpowiedziami na odmienne pytania.

**Sprawdź, z której serii korzysta legenda.** Zwykłe wpisy GPRINT mogą dziedziczyć serię poprzedzającego narysowanego elementu; dedykowane elementy minimum, maksimum, średniej i ostatniej wartości mają osobną obsługę. Zmiana kolejności elementów w szablonie wykresu może zatem zmienić wartości raportowane przez legendę, nawet jeśli nikt nie edytował samej legendy. Jeśli liczba ulegnie zmianie po niepowiązanej edycji szablonu, najpierw sprawdź kolejność elementów.

## Gdy wykres wygląda niepoprawnie

Sprawdź ścieżkę zbierania danych w następującej kolejności; usterka może wystąpić na więcej niż jednym etapie.

1. Czy urządzenie odpowiada w tej chwili?
2. Czy poller działa i kończy pracę w swoim interwale?
3. Czy plik RRD ma aktualny czas modyfikacji?
4. Czy wykres odczytuje to źródło danych, o którym myślisz?

Konkretnie:

**Krok 1.** Uruchom to samo polecenie `snmpget`, które wykonano podczas dodawania urządzenia, z przypisanego kolektora. Jeśli się nie powiedzie, rozwiąż ten problem ze zbieraniem danych przed oceną wykresu.

**Krok 2.** Poszukaj podsumowania zakończenia przebiegu. Jeśli go brakuje, sprawdź harmonogram zadań, skonfigurowane miejsce docelowe dziennika oraz przedwczesne awarie pollera. Przebieg trwający dłużej niż interwał może opóźniać aktualizacje; porównaj powstałą przerwę w aktualizacjach z wartością heartbeat.

**Krok 3.** Zapytaj bezpośrednio RRDtool:

```bash
rrdtool last /path/to/rra/the_file.rrd
rrdtool info /path/to/rra/the_file.rrd
```

Polecenie `last` raportuje znacznik czasu ostatniej aktualizacji, w tym aktualizacji z nieznanymi wartościami; buforowane zapisy mogą go opóźnić. Użyj `lastupdate` oraz `fetch`, aby zbadać wartości zgodnie z opisem w przewodniku po urządzeniach. Polecenie `info` informuje o kroku, parametrze heartbeat, typie źródła danych oraz o tym, które archiwa istnieją. Jeśli plik nie zawiera archiwum wartości maksymalnych, rozstrzyga to opisaną wyżej kwestię szczytów.

**Krok 4.** Włącz tryb debugowania wykresu i odczytaj polecenie generowane przez wykres. Wymienia ono pliki, znajdujące się w nich źródła danych oraz funkcję konsolidacji dla każdego z nich. Sytuacja, w której wykres wskazuje inne źródło danych niż zakładasz, zdarza się często po ponownym zastosowaniu szablonów lub ponownym zaindeksowaniu interfejsów.

## Objawy i co zazwyczaj oznaczają

| Co widzisz | Zazwyczaj |
|---|---|
| Płaska linia na poziomie zera | Może to być rzeczywiste zero lub wyrażenie zastępujące nieznane wartości zerem |
| Linia urywa się, a potem wznawia | Nieznana wartość przerwała rysowaną serię; sprawdź zbieranie danych i wyrażenia wykresów |
| Drobne przerwy na całym wykresie | Poller kończy pracę zbyt późno lub heartbeat jest ustawiony zbyt blisko kroku |
| Szczyt widoczny przy czterech godzinach, nieobecny przy jednym tygodniu | Sprawdź rozdzielczość archiwum i konsolidację przed założeniem utraty danych lub błędu zbierania |
| Maksimum w legendzie niższe niż narysowany szczyt | Legenda redukuje inną serię niż przypuszczasz |
| Cały wykres pusty, brak błędu | Brak powiązanego źródła danych lub brak zebranych dotąd danych |
| Wartości odbiegające o rząd wielkości | Błędny typ źródła danych lub przepełnienie 32-bitowych liczników |
| Dwa wykresy jednego łącza nieznacznie się różnią | Inna podstawa osi lub inna konsolidacja |

Dokument [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/) omawia tę ścieżkę bardziej szczegółowo. Przewodnik [Dostosowywanie wyglądu wykresów](/pl/guides/tune-graph-appearance/) opisuje modyfikowanie wyglądu wykresu, gdy masz już pewność co do prezentowanych na nim danych.

To zamyka samouczek. Masz działającą instalację, odpowiadające urządzenie i wykres, który potrafisz zinterpretować. Dalej [Poradniki](/pl/guides/monitor-a-switch/) prowadzą przez konkretne zadania, a [Pojęcia](/pl/concepts/architecture/) wyjaśniają, dlaczego system działa w taki sposób.
