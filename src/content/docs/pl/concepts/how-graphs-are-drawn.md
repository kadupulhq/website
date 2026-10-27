---
title: Jak rysowane są wykresy
description: Droga od pliku round-robin do wyrenderowanego obrazu i przyczyny, dla których te same zapisane liczby dają zupełnie różne obrazy.
sidebar:
  order: 4
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
---

Standardowe żądanie obrazu może złożyć polecenie RRDtool na podstawie konfiguracji wykresu i odczytać wskazane pliki RRD. Prawidłowy buforowany obraz może również obsłużyć żądanie, a przetwarzanie Boost na żądanie może zaktualizować pliki przed renderowaniem. Zobacz [Zapisy o dużej objętości](/pl/concepts/high-volume-writes/) w kwestii limitów świeżości danych.

## Kolejność operacji

W przypadku żądania przechodzącego do generowania poleceń:

1. Rozpoznanie żądanego okna czasowego i konfiguracji wykresu.
2. Oszacowanie rozdzielczości na podstawie profili w bazie danych i wybór funkcji konsolidacji.
3. Wygenerowanie unikalnych odwołań `DEF` dla wymaganych pól i funkcji.
4. Wygenerowanie wskazanych wyrażeń `CDEF` oraz `VDEF`.
5. Wygenerowanie elementów rysujących i drukujących w ustalonej kolejności wraz z opcjami i zmianami wtyczek.
6. Odczytanie rzeczywistych plików przez RRDtool i wyrenderowanie wyniku.

## Wybór archiwum

Kadupul korzysta z wierszy profilu bazy danych podczas wyliczania zakresów archiwów i opcji wykresu. Automatyczne oszacowanie bierze pod uwagę czas kroku pomnożony przez liczbę kroków i wierszy, żądany zakres oraz liczbę kroków archiwum; jawny wybór archiwum działa osobną ścieżką. Te obliczenia nie sprawdzają każdego fizycznego archiwum w każdym pliku i mogą różnić się od zawartości plików po zmianie profilu.

Wygenerowane polecenie `DEF` określa plik, nazwę źródła danych i funkcję konsolidacji. RRDtool wybiera dostępne archiwum o odpowiedniej rozdzielczości i może dodatkowo skonsolidować dane pod kątem szerokości wykresu i okna czasu. Oszacowanie aplikacji nie gwarantuje odczytu konkretnego archiwum fizycznego. Zobacz [dokumentację definicji danych RRDtool](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_data.en.html).

Rozszerzenie okna czasu lub zmiana szerokości obrazu może zmienić wyświetlaną rozdzielczość. Zgrubna seria oparta na średnich może ukryć krótkotrwały skok wartości, mimo że dokładniejsze archiwum nadal go zawiera. Należy porównywać rzeczywisty układ pliku i polecenie, a nie tylko profil. Zobacz [Źródła danych i archiwa round-robin](/pl/concepts/data-sources-and-rras/).

Gdy wywołujący nie poda czasu końcowego, standardowy mechanizm renderujący początkowo przyjmuje przesunięcie ostatniego uruchomienia głównego pollera względem chwili obecnej, cofając się do interwału odpytywania, gdy wartość ta jest niedostępna lub leży w przyszłości. Nowszy kod posiada także zabezpieczenie w postaci skonsolidowanego interwału, lecz nie jest to uniwersalna reguła. Jawny czas końcowy zastępuje tę inicjalizację; wykres kończący się przed chwilą obecną sam w sobie nie wskazuje wybranego archiwum ani nie dowodzi zapisu najnowszych próbek.

## Elementy wykresu

Wykres to uporządkowana lista elementów. Generowanie poleceń może pomijać elementy, ponownie wykorzystywać definicje lub rozwijać element w kilka instrukcji. Kolejność rysowania ma znaczenie nie tylko dla samego układu.

| Element | Rysuje | Uwagi |
|---|---|---|
| `AREA` | Wypełniony obszar od osi do wartości | Późniejsze obszary zasłaniają wcześniejsze |
| `STACK` | Wypełniony obszar rozpoczynający się na szczycie poprzedniego elementu | Emitowany jako obszar z flagą stosu |
| `LINE1`, `LINE2`, `LINE3` | Linię o szerokości jednego, dwóch lub trzech pikseli | Może być przerywana |
| `LINE:STACK` | Linię narysowaną na szczycie bieżącej sumy stosu | |
| `TICK` | Znaczniki wzdłuż krawędzi wykresu | Przydatne dla stanów, nie wartości liczbowych |
| `GPRINT` | Nic. Drukuje jedną liczbę w legendzie | |
| `COMMENT` | Nic. Drukuje dosłowny tekst w legendzie | Długie komentarze są zawijane |
| `HRULE` | Poziomą linię na stałej wartości | |
| `VRULE` | Pionową linię w stałym punkcie czasu | |
| `TEXTALIGN` | Nic. Ustawia wyrównanie następującego tekstu legendy | |

Pełna lista z przypisaniem kolumn konfiguracyjnych znajduje się w dokumencie [Elementy wykresu](/pl/reference/graph-items/).

`AREA` i `STACK` to para, która najczęściej prowadzi do pomyłek. Obszar zaczyna się od zera, więc dwa obszary nakładają się na siebie i wyższy zasłania niższy. Stos zaczyna się w miejscu zakończenia poprzedniego elementu, więc widoczna wysokość drugiego pasma odpowiada jego własnej wartości, lecz górna krawędź wyznacza łączną sumę. Wykres skumulowany należy odczytywać jako wysokość pasma, a nie pozycję na osi Y, w przeciwnym razie każda seria powyżej dolnej zostanie błędnie zinterpretowana.

`HRULE` przyjmuje wartość mogącą zawierać podstawienia szablonu. Znaki nieliczbowe są usuwane z wyniku, a jeśli nic numerycznego nie pozostanie, linia jest rysowana na poziomie zera zamiast przerwania renderowania. Linia na poziomie zera może być zamierzona lub wynikać z nieudanego podstawienia. Przed oceną sytuacji sprawdź przetłumaczone polecenie. Filtr numeryczny może również zmienić ciąg zawierający jednostki lub nieobsługiwany format liczb.

`VRULE` przyjmuje znacznik czasu Unix lub parę `hours:minutes`. Ujemna wartość godziny jest interpretowana jako przesunięcie wstecz od chwili obecnej zamiast godziny zegarowej.

## Dwa zadania, jedno słowo

Określenie funkcja konsolidacji służy do dwóch różnych celów, a te same cztery nazwy, `AVERAGE`, `MIN`, `MAX` i `LAST`, pojawiają się w obu miejscach.

Pierwszym zadaniem jest wybór archiwum. Polecenie `DEF` wskazuje plik, zawarte w nim źródło danych oraz funkcję konsolidacji. Funkcja ta zawęża rodzinę żądanych archiwów. Żądanie `MAX` wymaga odpowiednich zapisanych danych konsolidacji w RRDtool, z uwzględnieniem opisanego poniżej mechanizmu awaryjnego i doboru rozdzielczości.

Drugim zadaniem są obliczenia w legendzie. Instrukcja `GPRINT` redukuje całe wyrysowane okno do jednej wydrukowanej liczby, a jej funkcja decyduje o sposobie wyliczenia. Ta redukcja zachodzi na pobranej wcześniej serii; jest to agregacja prezentacyjna, a nie zapis danych.

Z tego powodu `GPRINT` pokazujący `MAX` na podstawie `DEF` odczytanego z funkcją `AVERAGE` wydrukuje największą wartość z tej uśrednionej serii w oknie renderowania, co nie musi odpowiadać najwyższej surowej próbce. Pięć minut to tylko przykład; rzeczywista rozdzielczość ulega zmianie. Są to różne liczby, a na obciążonym łączu różnice bywają znaczne. Oba odczyty są poprawne. Prawdopodobnie tylko jeden odpowiada intencji użytkownika.

## Cichy mechanizm awaryjny

W przypadku typów elementów korzystających z mechanizmu doboru najlepszej funkcji Kadupul odczytuje funkcje konsolidacji z pliku i stosuje żądaną, a w razie jej braku – pierwszą dostępną. Jeśli dla prawidłowego lokalnego źródła danych nie zostanie znaleziona żadna funkcja, następuje powrót do AVERAGE. Stałe warianty GPRINT korzystają z osobnej ścieżki i nie używają tego mechanizmu, więc nie stanowi to uniwersalnej gwarancji naprawy każdej brakującej funkcji.

Element rysujący żądający `MAX` może w efekcie odczytywać średnie, jeśli jego plik zawiera wyłącznie archiwa AVERAGE. Należy sprawdzić wygenerowane polecenie `DEF` oraz wynik `rrdtool info`. Konserwacja archiwów może zmienić układ pliku, lecz dodanie nowego archiwum nie odtworzy historycznych wartości szczytowych utraconych przez wcześniejsze uśrednianie. Zobacz [Zarządzanie przechowywaniem danych](/pl/guides/manage-data-retention/).

## GPRINT zapożycza archiwum od sąsiada

Zwykły element `GPRINT` nie posiada własnego archiwum. Wykorzystuje funkcję konsolidacji ostatniego pasującego elementu `AREA`, `STACK`, linii lub `TICK`, dopasowanego według nazwy źródła danych i identyfikatora pola szablonu. W przypadku braku wcześniejszego dopasowania używa mechanizmu doboru z własną skonfigurowaną funkcją. Warianty stałe korzystają bezpośrednio z własnej funkcji.

Oznacza to, że zmiana kolejności elementów w szablonie wykresu może zmienić dane wyświetlane w legendzie bez edycji samej legendy. Umieszczenie elementu `LINE` odczytującego `MAX` powyżej bloku `GPRINT` sprawi, że powiązane legendy podsumują wartości maksymalne. Przesunięcie go poniżej spowoduje, że serię wejściową określi wcześniejszy pasujący element lub domyślny mechanizm awaryjny. Jeśli liczba w legendzie zmieni się po niezwiązanej edycji szablonu, w pierwszej kolejności należy sprawdzić kolejność elementów.

## CDEF i VDEF

Oba mechanizmy przekształcają dane przed narysowaniem. Nie są tożsame.

| | CDEF | VDEF |
|---|---|---|
| Zwraca | Serię, po jednej wartości na przedział czasu | Wartość skalarną oraz dla niektórych funkcji powiązany czas |
| Możliwość narysowania jako linia lub obszar | Tak | Skalar może wyznaczać stały poziom |
| Zbudowany z | Funkcji, operatorów arytmetycznych, innych CDEF, specjalnych źródeł danych, stałych | Jednej funkcji zastosowanej do jednego odwołania |
| Zagnieżdżanie | CDEF może odwoływać się do innego CDEF | VDEF nie może zawierać operacji arytmetycznych |

CDEF to wyrażenie stosowe ewaluowane w odwrotnej notacji polskiej. Zestaw operacji jest obszerny i opisany szczegółowo w dokumencie [Elementy wykresu](/pl/reference/graph-items/): arytmetyka, operatory porównania i warunkowe, trygonometria, agregacja między źródłami danych, manipulacje stosem oraz funkcje czasu informujące o pozycji na osi X. Operatory `UN` oraz `UNKN` warto poznać na wczesnym etapie. Zastąpienie nieznanych wartości zerem zapobiega przerwom w rysowaniu, lecz ukrywa brak pomiarów; należy świadomie dokonać tego wyboru.

CDEF odczytuje także odwołania specjalne zamiast stałych nazw źródeł danych. Jedno z nich wskazuje źródło danych bieżącego elementu, co pozwala na wielokrotne wykorzystanie pojedynczego CDEF we wszystkich elementach szablonu. Inne wskazują wszystkie źródła na wykresie lub źródła podobne, co umożliwia wygenerowanie linii sumarycznej bez wymieniania jej składowych.

VDEF redukuje serię danych do wartości skalarnej: maksimum, minimum, średniej, odchylenia standardowego, pierwszej, ostatniej wartości, sumy, percentyla lub nachylenia i korelacji dopasowania liniowego. RRDtool nie obsługuje arytmetyki wewnątrz VDEF, dlatego gdy wymagana jest obliczona wartość wejściowa, Kadupul buduje ją na bazie CDEF danego elementu zamiast bezpośrednio na źródle danych. Jest to zalecana ścieżka: wykonanie obliczeń w CDEF, a następnie redukcja w VDEF.

Instrukcja `GPRINT` zasilana przez VDEF nie wymaga argumentu funkcji konsolidacji: VDEF dokonał już wymaganej redukcji. VDEF może również dostarczać wartości skalarne do rysowania; RRDtool obsługuje linię opartą na VDEF. Zobacz [dokumentację elementów wykresu](https://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html).

Eksport do pliku CSV wybiera obsługiwane typy rysowania jako kolumny serii; elementy legendy nie są eksportowane jako równoważne kolumny. Wbrew wcześniejszym opisom obecny kod zasadniczo nie pomija elementów rysujących opartych na VDEF. Może wyemitować nieprawidłowe polecenie `XPORT` skalarnego VDEF: test RRDtool poprawnie rysuje linię VDEF, lecz odrzuca taki eksport. Zobacz [błąd aplikacji #273](https://github.com/kadupulhq/kadupul/issues/273). Do eksportu należy używać elementów opartych na seriach i weryfikować wynikowe kolumny.

## Dlaczego te same dane wyglądają inaczej

Wszystkie poniższe czynniki zmieniają wygląd wykresu bez modyfikacji choćby jednej zapisanej próbki.

| Wybór | Skutek |
|---|---|
| Długość okna i szerokość obrazu | Może zmienić wybór archiwum i dodatkową konsolidację |
| Funkcja konsolidacji w `DEF` | Odczytuje szczyty, spadki, średnie lub ostatnie wartości |
| Brak funkcji konsolidacji | Niektóre ścieżki podstawiają inną funkcję; inne powodują błąd |
| `AREA` a `STACK` | Wysokości bezwzględne a wysokości skumulowane |
| Kolejność elementów | Nakładanie warstw, kolejność stosu i zapożyczanie archiwum przez `GPRINT` |
| Podstawa 1000 lub 1024 | Zmienia opisy osi. Wartości liczbowe są identyczne |
| Tryb autoskalowania, sztywne limity, skala logarytmiczna | Zmienia oś Y, co wpływa na wizualną skalę zmian |

W przypadku rozbieżności wykresów należy porównać wygenerowane polecenia, fizyczne pliki i ich układy, stan pamięci podręcznej oraz świeżość próbek. Czynniki prezentacji stanowią cenną wskazówkę, lecz nie wykluczają błędów zbierania, przechowywania lub mapowania danych. Instrukcję analizy takich przypadków zawiera przewodnik [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/).
