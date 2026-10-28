---
title: Zapisy o dużym wolumenie
description: Dlaczego aktualizacje RRD są ograniczone liczbą zapisów, a nie ich rozmiarem, co daje ich grupowanie i ile kosztuje to pod względem świeżości danych.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 10
---

Aktualizacje RRD obejmują wiele plików i mogą być ograniczane przez opóźnienia pamięci masowej oraz
liczbę operacji we/wy, a nie tylko przepustowość transferu. Zapisy odroczone, zwane również Boost,
gromadzą próbki w bazie danych i grupują aktualizacje dla każdego pliku. Zmierz wydajność procesu
zapisu i bazy danych przed włączeniem tej opcji: luki na wykresach same w sobie nie wskazują na wąskie
gardło pamięci masowej.

## Ścieżka domyślna

Kolektory wstawiają wyniki do aktywnej kolejki `poller_output`. Proces zapisu grupuje próbki według
pliku i znacznika czasu, aktualizuje plik RRD i śledzi potwierdzenie przed usunięciem przetworzonych
próbek. Nieudane zapisy mogą pozostawić wiersze do ponowienia, więc kolejka nie ogranicza się wyłącznie
do bieżącego cyklu odpytywania.

W analizowanej wersji ta kolejka korzysta z silnika InnoDB. Weryfikacja wstępna zbierania danych
odrzuca kolejkę typu MEMORY; ponowne uruchomienie bazy danych nie powoduje utraty zatwierdzonych
wierszy, jak miałoby to miejsce w przypadku tabeli MEMORY. Trwałość nadal zależy od konfiguracji bazy
danych, kondycji pamięci masowej i kopii zapasowych. Zobacz
[Bezpieczna aktualizacja](/pl/guides/upgrade-safely/) w celu weryfikacji migracji kolejek i pamięci masowej.

Jako szacunkowe obciążenie: 10 000 odrębnych plików aktualizowanych co 300 sekund oznacza średnio około
33 aktualizacji plików na sekundę. Rzeczywiste zapisy pojawiają się w seriach; wiele pól źródła danych
może współdzielić jeden plik, kroki czasowe mogą się różnić, a liczba poleceń nie jest tożsama z fizyczną
liczbą operacji we/wy na dysku. Porównaj zmierzone opóźnienie zapisu i wiek kolejki z dostępnym oknem
odpytywania.

## Co zmienia przetwarzanie wsadowe

Po włączeniu zapisów odroczonych proces zbierania umieszcza próbki w tabeli `poller_output_boost`
do późniejszego przetworzenia. Moduł zapisu wsadowego grupuje próbki według źródła danych w kolejności
znaczników czasu i może wysłać kilka punktów czasowych w jednym poleceniu aktualizacji RRDtool. Dwanaście
próbek może zmieścić się w jednym poleceniu, lecz nie gwarantuje to wykonania pojedynczego fizycznego
zapisu na dysku.

Skonfigurowana maksymalna długość argumentu ogranicza ciągi aktualizacji; wartość domyślna to 2000.
Wpływa to na tworzenie partii. Nie należy wnioskować o określonym limicie systemu operacyjnego na
podstawie tego ustawienia: lokalne potwierdzone zapisy używają strumienia poleceń RRDtool, a rzeczywisty
transport i obsługiwany rozmiar polecenia mają kluczowe znaczenie.

Harmonogram zazwyczaj kwalifikuje się do uruchomienia, gdy upłynie jego czasomierz (domyślnie 60 minut)
lub gdy szacowana liczba wierszy w buforze przekroczy skonfigurowany próg (domyślnie 1 000 000). Szacunek
wierszy obejmuje tabele aktywne i archiwalne. Wywołanie harmonogramu musi jednak faktycznie nastąpić, a
kontrole procesów, przygotowanie lub błędy modułu zapisu mogą opóźnić pracę. Wymuszone uruchomienia,
opróżnianie po wyłączeniu oraz aktualizacje na żądanie przy przeglądaniu wykresów stanowią dodatkowe
ścieżki; wartości domyślne nie stanowią godzinnej gwarancji świeżości danych.

Interwał wynoszący zero lub niebędący dodatnią liczbą całkowitą jest zastępowany wartością 120 minut;
standardowa wartość domyślna to 60 minut.

## Rotacja i powód jej istnienia

Konfiguracja wsadowa tworzy pustą tabelę odpowiadającą aktywnemu buforowi, a następnie zamienia nazwy
za pomocą pojedynczej instrukcji `RENAME TABLE`. Poprzednia aktywna tabela staje się archiwum z
oznaczeniem czasu, a producenci kierują dane do nowej tabeli. Oddziela to przetwarzaną partię od nowych
wpisów, chociaż blokady bazy danych i rywalizacja o zasoby mogą nadal opóźniać zbieranie danych.

Procesy robocze (workers) przetwarzają bieżące i zachowane archiwa. Proces nadrzędny monitoruje ukończenie
i stan procesów podrzędnych; nieudane lub nieweryfikowalne przebiegi zachowują archiwa do ponownych prób.
Podczas kwalifikującego się czyszczenia puste archiwa mogą zostać usunięte, a pozostałe próbki mogą
zostać ponownie zakolejkowane w aktywnym buforze przed usunięciem archiwum. Niepuste archiwum nie jest
po prostu odrzucane z powodu zakończenia procesu. Podczas diagnozowania zaległości sprawdzaj zarówno
kolejki aktywne, jak i archiwalne.

Jest to mechanizm ponawiania prób, a nie uniwersalna gwarancja odporności na awarie. Błędy bazy danych,
współbieżne operacje, usterki pamięci masowej oraz spójność kopii zapasowych wymagają weryfikacji w
konkretnym środowisku produkcyjnym.

## Dlaczego wyświetlenie wykresu może zaktualizować jego pliki

Standardowa ścieżka wyświetlania wykresu może próbować wykonać aktualizacje na żądanie dla każdego źródła
danych powiązanego z wykresem przed jego wyrenderowaniem. Nie opróżnia ona bezwarunkowo każdej oczekującej
próbki: kontrole kolektora, kanały czasu rzeczywistego/źródła/błędów, limity aktywnego odpytywania, limity
zapytań oraz błędy aktualizacji wpływają na to, co zostanie przetworzone. Niedawne lub nieudane próbki mogą
pozostać w kolejce.

Wykres o aktualnym wyglądzie nie dowodzi zatem, że cała struktura plików RRD jest aktualna, a zażądanie
wykresu nie gwarantuje pomyślnego odtworzenia wszystkich danych. Sprawdzaj błędy zapisu, wiek kolejki oraz
rzeczywiste znaczniki czasu w plikach RRD. Kopie zapasowe obejmujące wyłącznie pliki pomijają próbki
oczekujące w bazie danych; zobacz [Tworzenie i przywracanie kopii zapasowych](/pl/guides/back-up-and-restore/).

## Z czego rezygnujesz

**Świeżość plików.** Próbki pozostają w bazie danych do czasu pomyślnego przetworzenia. Prawidłowo
działająca instalacja sterowana czasomierzem może opóźniać się o około jeden interwał opróżniania;
uszkodzony lub zbyt mały moduł zapisu może notować znacznie większe opóźnienia. Twórz spójne kopie zapasowe
zarówno oczekujących kolejek, jak i plików.

**Drugi harmonogram.** Monitoruj zbieranie danych i opróżnianie buforów niezależnie. Obserwuj aktywne
wiersze, zachowane archiwa, wiek najstarszej próbki, nieudane procesy robocze oraz przepustowość modułu
zapisu. Aktywna tabela nie musi stawać się pusta, dopóki producenci wciąż wstawiają dane, a sama rotacja
może sprawić, że wyda się mniejsza bez ukończenia jakichkolwiek aktualizacji w RRD.

**Kolejność czasowa.** Pliki RRD nie przyjmują starszych znaczników czasu po nowszych aktualizacjach.
Nowoczesna ścieżka Boost pomija aktualizacje z przeszłości, a ścieżka starszego typu filtruje znaczniki
względem ostatniej aktualizacji pliku. Pomyślnie potwierdzone polecenie może zatem pominąć przestarzałe
dane; późniejsze dostarczenie nie gwarantuje, że próbka pojawi się na wykresie.

**Złożoność operacyjna.** Wymaga to monitorowania bufora bazy danych, procesu opróżniania z limitem pamięci,
opcjonalnych równoległych procesów roboczych oraz zachowanych archiwów lub ponownie zakolejkowanych próbek.
Lokalne błędy zapisu zazwyczaj zachowują próbki do ponowienia, ale nie zapewnia to bezwzględnej bezstratności
na całej ścieżce. W przypadku zdalnego odzyskiwania danych zobacz
[Zdalne zbieranie danych](/pl/concepts/remote-data-collection/).

## Kiedy warto to zastosować

Rozważ zapisy odroczone, gdy pomiary wykażą, że moduł zapisu RRD stanowi wąskie gardło, a baza danych
dysponuje wolnymi zasobami na buforowanie i zapytania wsadowe. Nie eliminuje to opóźnień urządzeń ani nie
naprawia przeciążonej bazy danych. Porównaj przepustowość, wiek kolejki, świeżość plików oraz zużycie
zasobów przed i po włączeniu tej funkcji.

Główny poller automatycznie włącza odroczoną aktualizację, gdy skonfigurowany jest aktywny zdalny kolektor
danych. Samo to ustawienie nie tworzy jednak sprawdzonego wdrożenia zdalnego magazynu ani odzyskiwania;
zastosuj ograniczenia opisane w [Zdalne zbieranie danych](/pl/concepts/remote-data-collection/).

## Inna funkcja o tej samej nazwie

Wyrenderowane obrazy wykresów również mogą być buforowane w pamięci podręcznej. Buforowanie obrazów ogranicza
powtarzające się renderowanie; odroczone zapisy grupują próbki bazy danych w aktualizacje RRD. Ich ustawienia
są odrębne, lecz ich ścieżki wykonania wchodzą w interakcje: żądania wykresów mogą sprawdzać oczekujące próbki
przed użyciem buforowanego obrazu, a udane aktualizacje mogą zainicjować wyrenderowanie nowego obrazu.
Oceniaj świeżość obrazów niezależnie od świeżości kolejek i plików RRD.
