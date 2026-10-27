---
title: Źródła danych i archiwa round-robin
description: Co jest przechowywane, jak działa retencja i dlaczego edycja profili nie migruje istniejących plików RRD.
sidebar:
  order: 2
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
---

Źródło danych Kadupul grupuje pomiary w czasie i zazwyczaj jest powiązane z jednym plikiem RRD.
Każde nazwane pole w tym pliku jest również nazywane przez RRDtool źródłem danych (DS).
Porównując liczby lub ustawienia, należy odróżnić obiekt aplikacji od jego pól.

Jeden plik nie zawsze oznacza jedną liczbę. Źródło danych może zawierać kilka pól, a interfejs
sieciowy jest typowym przypadkiem: bajty przychodzące i wychodzące dzielą jeden plik, są zbierane
jako oddzielne zadania i zapisywane razem w ramach jednej aktualizacji. Łączy je krok (step),
zestaw archiwów i wspólny los. Nie można zachować jednego z nich dłużej niż drugiego, ponieważ retencja
jest właściwością pliku, a nie pojedynczego pola.

## Co znajduje się wewnątrz pliku

Plik RRD składa się z nagłówka i dwóch list.

Pierwsza lista zawiera pola: nazwę, typ, interwał heartbeat oraz wartość minimalną i maksymalną dla każdego pola.
Druga lista to archiwa: funkcja konsolidacji, liczba kroków surowych danych przypadających na jeden slot,
liczba dostępnych slotów oraz informacja, jaka część slotu może być nieznana, zanim sam slot stanie się nieznany.

Podczas tworzenia definicje te są zapisywane w pliku. Metadane bazy danych i rzeczywiste definicje
plików mogą się później rozejść; sprawdź plik za pomocą `rrdtool info`, zamiast zakładać,
że bieżący szablon opisuje go dokładnie.

<span id="the-decisions-that-are-permanent"></span>

## Decyzje przy tworzeniu i późniejsza konserwacja

Plik RRD jest alokowany w momencie tworzenia. Edycje profili nie migrują istniejących plików.
RRDtool udostępnia operacje dostrajania i zmiany rozmiaru, które mogą zachować zapisane dane,
ale wymagają one oddzielnej weryfikacji i kopii zapasowych. Zwykła ścieżka tworzenia sprawdza, czy plik
już istnieje, i powraca bez jego zastępowania. Zabezpieczenie to nie zabrania jawnego dostrajania ani migracji.
Samo zapisanie szablonu nie aktualizuje układu istniejących plików.

W tym momencie utrwalane są cztery wybory.

**Krok (step).** Jak często oczekiwana jest wartość, zwykle co 300 sekund. RRDtool normalizuje aktualizacje
do granic kroków; częstsze odczyty nie są po prostu odrzucane. To, czy wolniejsze aktualizacje generują
dane nieznane (unknown), zależy od reguł heartbeat i konsolidacji. Krok zwykle pochodzi z profilu
źródła danych. Tworzenie pliku odczytuje zapisany krok źródła danych i archiwa wskazanego profilu,
dlatego przy zmianie metadanych lub planowaniu migracji należy sprawdzić oba te elementy.

**Typ źródła danych.** Patrz poniżej. Jest to ustawienie, które zawodzi po cichu.

**Granice.** Wartość minimalna i maksymalna ograniczają dopuszczalne wartości; w przypadku typów DS generujących
tempo zmian limity te odnoszą się do obliczonego wskaźnika, a nie do surowej sumy licznika. Dane spoza zakresu
stają się nieznane (unknown), zamiast być obcinane do limitu. Wartości maksymalne oparte na zapytaniach
mogą rozwiązywać symbole zastępcze prędkości interfejsu; nie każde źródło interfejsu automatycznie otrzymuje
poprawny limit prędkości łącza. Sprawdź jednostki szablonu i rzeczywistą definicję pliku.

Tworzenie posiada określone gałęzie normalizacji. W przypadku dosłownej wartości maksymalnej równej lub
mniejszej od minimalnej, GAUGE i ABSOLUTE stosują niezdefiniowane maksimum; inne typy przyjmują minimum plus
jeden. Podstawienia zapytań trafiają do osobnej gałęzi. Późniejsze sprawdzenie zero/zero zmienia wyłącznie
wartość maksymalną, a wcześniejsza normalizacja mogła ją już zmodyfikować. Nie należy traktować tego jako
ogólnego walidatora ani zakładać, że obie granice staną się niezdefiniowane.

**Archiwa.** Ile próbek należy zachować przy jakich rozdzielczościach i jakiej funkcji konsolidacji użyć
dla każdej z nich. To decyduje o tym, czy za dwa lata będzie można odpowiedzieć na dane pytanie.

## Typy źródeł danych

| Typ | Przechowuje | Przeznaczenie |
|---|---|---|
| `GAUGE` | Poziom znormalizowany do kroku pliku | Temperatura, średnie obciążenie, użycie pamięci, długość kolejki |
| `COUNTER` | Tempo zmian na sekundę, z korektą przepełnienia licznika przy 32 lub 64 bitach | Oktety interfejsu, liczniki pakietów i błędów |
| `DERIVE` | Tempo zmian na sekundę, może być ujemne | Licznik, który może zgodnie z oczekiwaniami spadać lub być resetowany |
| `ABSOLUTE` | Wartość podana, podzielona przez czas od ostatniego odczytu | Wartość, którą urządzenie resetuje przy każdym odczycie |
| `COMPUTE` | Wartość obliczona z innych pól w tym samym pliku, a nie zbierana | Pole pochodne, takie jak suma lub proporcja |

Kadupul udostępnia `DCOUNTER` i `DDERIVE`, gdy skonfigurowana wersja RRDtool to 1.5 lub nowsza.
Akceptują one liczniki zmiennoprzecinkowe; DCOUNTER wykrywa również kierunek zliczania i resety,
więc nie jest po prostu typem COUNTER z ułamkami dziesiętnymi. Tabela opisuje semantykę RRDtool,
a nie gwarancję, że każdy typ jest obsługiwany przez każdy edytor lub ścieżkę tworzenia Kadupul;
należy zweryfikować wygenerowaną definicję, szczególnie w przypadku wyrażeń COMPUTE. Zobacz dokumentację
zewnętrzną [RRDtool creation reference](https://oss.oetiker.ch/rrdtool/doc/rrdcreate.en.html).

### Wybór nieprawidłowego typu

Poniższe przykłady ilustrują błędy konfiguracji; ich widoczność zależy od danych i granic.

`GAUGE` na rosnącym liczniku przedstawia na wykresie jego poziom zamiast przepustowości. Może rosnąć
aż do przepełnienia lub resetu; może to być zauważalne, ale w krótkim oknie czasowym nie musi wyglądać
ewidentnie błędnie.

`COUNTER` interpretuje spadki za pomocą korekty przepełnienia, więc reset może przekształcić się w ogromną
wartość dodatnią lub zostać odrzucony przez maksimum. `DERIVE` z minimum równym zero odrzuca ujemne tempa zmian,
w tym autentyczne przepełnienia; wybieraj go tylko wtedy, gdy ten kompromis odpowiada metryce. Maksimum
nie odróżnia każdego resetu od prawidłowego przepełnienia.

`COUNTER` zastosowany do wartości poziomu (gauge) jest szczególnie niebezpieczny. Zapisana wartość staje się
zmianą poziomu podzieloną przez upływający czas. Urządzenie utrzymujące stabilną temperaturę 40 stopni
zapisze zero. Wzrost o jeden stopień w ciągu pięciu minut da odczyt 0,0033. Wykres może wyglądać wiarygodnie,
mierząc zmianę zamiast rzeczywistej temperatury. Taki wskaźnik jest przydatny tylko wtedy, gdy o taką wielkość
chodziło; nie odzwierciedla on pierwotnego poziomu temperatury.

`ABSOLUTE` na liczniku, który nie resetuje się przy odczycie, generuje ten sam typ cichego błędu
w przeciwnym kierunku, dając wartości rosnące wraz z czasem działania urządzenia.

Reguła, jaka z tego wynika, to ustalanie typu na podstawie tego, jak urządzenie generuje daną liczbę,
a nie tego, co ta liczba oznacza. To, czy odczyt jest tempem zmian, jest właściwością licznika, a nie samej metryki.

## Heartbeat

Heartbeat to maksymalny dopuszczalny czas między aktualizacjami dla danego pola, zanim RRDtool potraktuje
dany interwał jako nieznany. Jest mierzony między aktualizacjami, a nie jako dodatkowy czas dodany po kroku.

Sprawdź skonfigurowany profil i rzeczywisty plik. Dostarczony profil 5-minutowy używa heartbeat o długości
600 sekund, profil 1-minutowy również używa 600 sekund, a profil 30-sekundowy używa 1200 sekund. Tolerancji
na pominięte odpytania nie można zatem opisać jedną stałą liczbą; normalizacja i konsolidacja również
wpływają na to, które interwały wykresu staną się nieznane.

Heartbeat jest określany dla każdego pola osobno, a nie dla całego pliku. Wartości profilu zasilają metadane,
ale tworzenie pliku odczytuje lokalny heartbeat elementu, który może różnić się od profilu. Dostarczone
profile nie stosują jednego współczynnika, a uzasadnienie każdego z nich oraz skutki ustawienia heartbeat
zbyt blisko kroku omówiono w artykule [Czas i interwały](/pl/concepts/time-and-intervals/).

## Konsolidacja

W miarę napływu aktualizacji RRDtool konsoliduje je również w większe przedziały czasowe; nie czeka na wygaśnięcie
najdokładniejszego archiwum. Funkcja jest wybierana dla każdego archiwum, a każda funkcja odpowiada na inne pytanie:

- `AVERAGE` podsumowuje dane cząstkowe (punkty podstawowe).
- `MAX` zachowuje ich największą wartość.
- `MIN` zachowuje ich najmniejszą wartość.
- `LAST` zachowuje ich ostatnią wartość zgodnie z regułami konsolidacji RRDtool.

Funkcje te operują na znormalizowanych podstawowych punktach danych, niekoniecznie na pierwotnych surowych
odczytach. Archiwum MAX nie może odtworzyć chwilowego szczytu, który został już uśredniony w ramach
podstawowego interwału; MIN nie jest niezawodnym wykrywaczem każdej przerwy w działaniu.

Plik przechowuje jedno archiwum na funkcję na daną rozdzielczość, więc zachowanie wszystkich czterech funkcji
przy czterech rozdzielczościach oznacza szesnaście archiwów i czterokrotnie większy rozmiar danych wartości
w porównaniu z samymi średnimi przy tej samej liczbie wierszy. Narzut nagłówka i stanu przygotowania
również zajmuje miejsce. Wszystkie trzy dostarczone profile wybierają cztery funkcje; dobieraj retencję
zgodnie z pytaniami analitycznymi i wymaganiami pojemnościowymi środowiska.

Jeśli zachowujesz tylko średnie, nie będziesz mógł później zapytać o wartości szczytowe. Szczyty nigdy
nie zostały zapisane. Jest to najczęstszy powód rozczarowań w długo działających instalacjach, którego
nie da się naprawić z mocą wsteczną.

Niektóre ścieżki rysowania zastępują brakującą funkcję inną dostępną; inne ścieżki mogą zgłosić błąd.
Sprawdź wygenerowaną definicję DEF i rzeczywiste archiwa zgodnie z opisem w artykule
[Jak rysowane są wykresy](/pl/concepts/how-graphs-are-drawn/).

## Nieznane to rzeczywista wartość

RRD precyzyjnie odróżnia zero od wartości nieznanej (unknown). Zero może być zgłoszonym poziomem lub
obliczonym tempem zmian, na przykład przy niezmienionym liczniku. Wartość nieznana może wynikać z brakujących
aktualizacji, wygaśnięcia heartbeat, jawnego nieznanego wejścia, odrzuconych limitów lub niewystarczających
danych do konsolidacji. Zastąpienie wartości nieznanej zerem może sprawić, że brakujące lub nieprawidłowe
pomiary będą wyglądać jak brak aktywności.

Wartość nieznana propaguje się przez konsolidację zgodnie z progiem określonym dla każdego archiwum.
Domyślne profile ustawiają go na połowę: zagregowany slot zbudowany z częściowo brakujących danych pozostaje
liczbą rzeczywistą, dopóki ponad połowa jego danych wejściowych nie jest nieznana; w tym momencie cały slot
staje się nieznany. Widoczność zależy od dopasowania slotów, heartbeat, normalizacji, konsolidacji i prezentacji
wykresu. Nie ma uniwersalnego czasu trwania awarii, który gwarantowałby pojawienie się lub zniknięcie luki
w każdym archiwum.

Wartość nieznana jest również wynikiem przekroczenia limitów. Odczyt powyżej skonfigurowanego maksimum
nie jest przycinany do maksimum. Reset licznika może wygenerować wskaźnik spoza zakresu i spowodować lukę,
ale limity nie wyłapują każdego resetu. Same nieznane dane nie wskazują przyczyny; porównaj błędy zbierania
danych i znaczniki czasu.

## Rozmiar i alokacja

W przypadku niezmienionego układu rozmiar danych wartości w archiwach jest iloczynem łącznej liczby slotów
we wszystkich archiwach, liczby pól i ośmiu bajtów. Całkowity rozmiar pliku i wdrożenia obejmuje również
nagłówki, stan przygotowania, alokację systemu plików, kolejki i kopie zapasowe. Jawna modyfikacja układu
może zmienić rozmiar pliku.

Trzy dostarczone profile różnią się bardziej, niż sugerują ich nazwy:

| Profil | Krok | Slotów na pole | Rozmiar danych na pole | Koszt względny |
|---|---|---|---|---|
| 5 Minute Collection | 300 s | 11 488 | około 90 KiB | 1 |
| 30 Second Collection | 30 s | 40 284 | około 315 KiB | 3,5 |
| 1 Minute Collection | 60 s | 81 716 | około 640 KiB | 7 |

Źródło danych interfejsu z dwoma polami podwaja każdą z tych wartości. Dziesięć tysięcy interfejsów
w profilu 5-minutowym zajmuje około 1,8 GB danych w archiwach. Te same dziesięć tysięcy w profilu
1-minutowym to blisko 13 GB, a powodem nie jest sam krok; profil ten utrzymuje również znacznie głębsze
archiwum miesięczne i 10-letnie archiwum roczne.

Rzeczywisty zakres każdego archiwum warto sprawdzić w zestawieniu z jego nazwą. Archiwa profilu
5-minutowego są oznaczone jako Daily, Weekly, Monthly i Yearly, a okresy, które obejmują, to odpowiednio
50 godzin, 14,6 dnia, 64,6 dnia i 2,2 roku. Nazwy opisują ustawienie wykresu, dla którego archiwum zostało
zwymiarowane, a nie samą retencję. Jeśli potrzebujesz danych z zeszłego kwietnia w rozdzielczości 5 minut,
etykieta obiecuje taką możliwość, ale archiwum jej nie zapewni.

Obciążenie zapisem również zmienia się wraz z profilem i pojawia się na długo przed wyczerpaniem dysku.
Przy pełnej częstotliwości zbierania krok 30-sekundowy generuje dziesięciokrotnie więcej interwałów próbkowania
niż krok 5-minutowy. Grupowanie, współdzielone pola, wybór zadań do wykonania i nieudane ponowne próby
wpływają na liczbę poleceń i fizycznych zapisów; nie jest to stały stosunek. Zobacz
[Zapisy o dużym wolumenie](/pl/concepts/high-volume-writes/).

## Które pola trafiają do pliku

Źródło danych utworzone z szablonu danych otrzymuje pole w pliku tylko dla tych pól, do których odwołuje
się element wykresu w standardowej ścieżce tworzenia. Kod aktualizujący może wykluczyć nieużywane pola
szablonu; to, czy są one zbierane, zależy od metody wprowadzania i pamięci podręcznej, a nie tylko od tego,
czy linia jest widoczna. Źródło danych bez szablonu otrzymuje wszystkie pola, z założenia, że w przyszłości
może pojawić się wykres odpytujący o te dane.

Odwołanie nie musi oznaczać narysowania widocznej linii: sprawdź mapowania elementów wykresu, a także
pamięć podręczną i definicję pliku. Samo dodanie pola szablonu nie dowodzi, że zbieranie, mapowanie
wykresu i magazyn są gotowe. Przebudowa pamięci podręcznej aktualizuje metadane zbierania; nie dodaje
pól do istniejącego pliku RRD.

Oznacza to również, że dodanie pola do szablonu nie dodaje go automatycznie do istniejących plików,
nawet jeśli element wykresu się do niego odwołuje. Dodanie pola wymaga jawnej konserwacji lub migracji.
W zależności od zainstalowanej wersji RRDtool dostrajanie może dodać źródła danych z zachowaniem
istniejących danych; usunięcie i ponowne utworzenie pliku powoduje utratę historii. Sprawdź opcje
konserwacji i procedury w artykule [Zarządzanie retencją danych](/pl/guides/manage-data-retention/).
