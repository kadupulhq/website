---
title: Szablony
description: Jak jedna definicja obsługuje sto urządzeń i co się dzieje po jej zmianie.
sidebar:
  order: 3
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
---

Szablony istnieją po to, aby dodanie setnego przełącznika wymagało takiego samego nakładu pracy, jak dodanie drugiego. Istnieją cztery rodzaje i nakładają się na siebie.

Praktyczną kolejność czynności opisano w przewodniku [Używanie i sprawdzanie poprawności szablonów](/pl/guides/template-workflow/).

**Szablony danych** określają, co należy zbierać i jak to zapisywać: pola, ich typy, granice, profil przechowywania oraz metodę wprowadzania pobierającą wartości liczbowe. Pola poszczególnych obiektów i istniejące pliki RRD mogą różnić się od bieżącego szablonu; szablon nie stanowi gwarancji fizycznego układu pliku.

**Szablony wykresów** określają sposób rysowania: które elementy, w jakiej kolejności, jakimi kolorami, jakie linie legendy oraz opisy osi.

**Szablony urządzeń** łączą zapytania o dane i szablony wykresów odpowiednie dla danej klasy sprzętu, dzięki czemu wybranie właściwego szablonu podczas dodawania urządzenia wykonuje większość pracy.

**Zapytania o dane** obsługują sytuacje, w których z góry nie wiadomo, ile obiektów istnieje. Przełącznik posiada pewną liczbę portów wykrywanych podczas odpytywania urządzenia, a zapytanie o dane rejestruje indeksowane wyniki na potrzeby tworzenia wykresów. Samo wykrywanie nie tworzy stałej liczby wykresów ani źródeł danych.

## Jak się nakładają

Te cztery elementy nie są czterema warstwami tego samego obiektu. Każdy wskazuje na kolejny w hierarchii.

| Rodzaj | Wskazuje na | Tworzy |
|---|---|---|
| Szablon urządzenia | Szablony wykresów i zapytania o dane | Nic bezpośrednio. Jest listą elementów oferowanych dla danego urządzenia |
| Zapytanie o dane | Definicje wykresów i mapowania dla indeksowanych wyników | Wykryte wiersze; operacja tworzenia wykresu może utworzyć lub ponownie wykorzystać źródła danych |
| Szablon wykresu | Pola szablonu danych tam, gdzie element wymaga danych | Wykres mogący odwoływać się do wielu źródeł danych |
| Szablon danych | Metodę wprowadzania i profil przechowywania | Metadane źródła danych; plik RRD jest tworzony, gdy ścieżka zapisu tego wymaga |

Elementy szablonu zawierające dane odwołują się do pól szablonu; utworzone elementy są mapowane na pola lokalne. Elementy tekstowe i stałe nie wymagają powiązania ze źródłem danych. Tworzenie wykresu rozwiązuje te mapowania, a późniejsze ponowne przypisanie szablonu lub modyfikacja elementów może je zmienić. Tworzenie wykresu może ponownie wykorzystywać zgodne źródła danych zamiast tworzyć nowy plik dla każdego wykresu.

## Z szablonu czy dla każdego obiektu

Wiele pól na poziomie wykresu i źródła danych posiada odpowiednie flagi w wierszu szablonu. W przypadku tych pól flaga kontroluje standardowe przekazywanie wartości do powiązanych obiektów podrzędnych. Inne pola, elementy wykresu i mapowania wejściowe podlegają osobnym regułom propagacji.

| Flaga | Znaczenie | Przy zapisie |
|---|---|---|
| Wyłączona | Pole pochodzi z szablonu | Wartość jest zapisywana do każdego obiektu podrzędnego, nadpisując dotychczasową |
| Włączona | Pole jest definiowane dla obiektu | Wartość pozostaje nienaruszona na każdym obiekcie podrzędnym |

Flaga działa dla każdego pola osobno. Szablon wykresu może narzucać etykietę osi powiązanym wykresom, pozostawiając tytuł i limit pionowy temu, kto utworzył dany wykres. Taka konfiguracja jest normą, a nie wyjątkiem.

Dwie cechy tej architektury bywają mylące.

Flaga znajduje się w szablonie i decyduje wyłącznie o tym, co nastąpi podczas kolejnego zapisu. Oznaczenie pola jako definiowanego dla obiektu po tym, jak wcześniejszy zapis je nadpisał, niczego nie przywraca. Poprzednie indywidualne wartości przepadły; flaga chroni dopiero przyszłe zmiany.

Sytuacja odwrotna niesie większe ryzyko. Wyłączenie flagi w polu, które przez lata było definiowane dla każdego obiektu, sprawia, że pojedynczy zapis nadpisze to pole we wszystkich obiektach podrzędnych wartością z szablonu – często wartością domyślną, której nikt nie sprawdzał.

### Nie każde pole posiada flagę

Pole bierze udział w tym mechanizmie tylko wtedy, gdy istnieje dla niego flaga. Na poziomie źródła danych cztery pola posiadają flagę, a dwa celowo jej nie mają.

| Pole | Flaga | Zachowanie |
|---|---|---|
| Nazwa | Tak | Z szablonu lub dla obiektu |
| Aktywne | Tak | Z szablonu lub dla obiektu |
| Krok | Tak | Z szablonu lub dla obiektu |
| Profil przechowywania | Tak | Z szablonu lub dla obiektu |
| Metoda wprowadzania | Nie, zawsze z szablonu | Procedura zapisu szablonu bezpośrednio aktualizuje powiązane wiersze źródeł danych |
| Ścieżka do pliku RRD | Nie, nigdy z szablonu | Standardowe propagacje szablonu ją pomijają; zmiana szablonu zachowuje istniejącą ścieżkę |

Zachowanie ścieżki chroni istniejące powiązanie z danymi historycznymi podczas standardowych modyfikacji szablonu. Nie oznacza to, że ścieżek nie można modyfikować ani przenosić w ramach innych operacji administracyjnych. Przed wprowadzeniem zmian należy sprawdzić tożsamość plików.

Wszystkie pola w elemencie źródła danych posiadają flagę: nazwa pola, jego typ, heartbeat, minimum, maksimum oraz pole wejściowe zasilające dane.

## Wejścia wykresu działają w przeciwnym kierunku

Szablon wykresu może zadeklarować nazwane wejście łączące kilka elementów wykresu z jednym edytowalnym polem, dzięki czemu zmiana jednej wartości na wykresie aktualizuje każdy powiązany element. Jest to mechanizm, dzięki któremu pojedyncze ustawienie koloru lub legendy steruje grupą powiązanych elementów.

Przekazywana wartość nie pochodzi bezpośrednio z szablonu. Mechanizm odczytuje bieżącą wartość z innych elementów należących do danego wejścia i ją przekazuje. Wejście wykresu rozchodzi się zatem w poprzek elementów danego wykresu, a nie w dół z szablonu, dlatego edycja takiego wejścia może zmienić wykres, którego szablon bezpośrednio nie modyfikował.

## Co i kiedy podlega propagacji

| Zmiana | Dociera do istniejących obiektów | Sposób |
|---|---|---|
| Pole szablonu wykresu, z szablonu | Tak, przy zapisie | Zapisywane do każdego wykresu utworzonego z tego szablonu |
| Pole szablonu wykresu, dla obiektu | Nie | Obiekt podrzędny zachowuje własną wartość |
| Wygląd elementu wykresu | Tak, przy zapisie | Kolor, przezroczystość, typ elementu, grubość linii, styl kreskowania, CDEF, VDEF, przesunięcie, funkcja konsolidacji, wyrównanie, tekst i format legendy |
| Element wykresu dodany, usunięty lub przekierowany na inne pole | Zależnie od operacji | Dopasowywanie, dodawanie, usuwanie i ponowne mapowanie wykorzystują różne ścieżki; należy zweryfikować mapowania lokalne |
| Pole szablonu danych, z szablonu | Tak, przy zapisie | Zapisywane do każdego źródła danych opartego na tym szablonie |
| Wartości pól wejściowych szablonu danych | Gdy z szablonu | Flagi szablonu i obiektów, pola indeksu zapytania oraz reguły pól hosta ograniczają propagację |
| Profil przechowywania, krok, archiwa szablonu danych | Tylko w bazie danych | Istniejące pliki zachowują strukturę nadaną podczas ich tworzenia |
| Pola dodane do szablonu danych | Tylko w bazie danych | W istniejących plikach brakuje miejsca na ich zapisanie |
| Zawartość szablonu urządzenia | Osobna synchronizacja | Sama modyfikacja powiązań nie synchronizuje automatycznie każdego istniejącego urządzenia |

Propagacja w bazie danych zależy od ścieżki zapisu i reguł nadpisywania. Aktualizacja metadanych szablonu nie migruje automatycznie istniejących plików RRD; obsługa plików stanowi osobną operację. Niektóre ustawienia strukturalne są zablokowane do odczytu w edytorze używanego szablonu danych. Zobacz [Tworzenie niestandardowych szablonów](/pl/guides/create-custom-templates/).

## Szablony urządzeń posiadają jawną ścieżkę synchronizacji

Modyfikacja powiązań szablonu urządzenia zmienia ofertę dla nowo dodawanych urządzeń. Istniejące urządzenia wymagają osobnej operacji ponownego zastosowania lub synchronizacji. Narzędzie masowe domyślnie wybiera urządzenia w stanie Up lub Recovering, chyba że wywołujący jawnie wskaże urządzenia niedostępne; przed uruchomieniem należy sprawdzić kryteria wyboru.

Synchronizacja dodaje brakujące powiązania z szablonami wykresów, odświeża wybrane zapytania o dane i może usuwać niepotrzebne powiązania. Nie kasuje automatycznie istniejących wykresów tylko dlatego, że ich szablon usunięto z szablonu urządzenia. Uruchamia także mechanizmy automatyzacji i wtyczek, co może wywołać skonfigurowane reguły automatycznego generowania wykresów.

Po zakończeniu synchronizacji należy sprawdzić powiązania urządzeń i stan wykresów. Nie muszą one stanowić trwałej sumy wszystkich wersji szablonu stosowanych w przeszłości.

## Indeksy i przyczyny przesuwania portów

Zapytanie o dane musi ustalić, który wykryty element odpowiada konkretnemu istniejącemu źródłu danych. To zadanie realizuje indeks. Indeksy numeryczne mogą ulec zmianie po modyfikacji sprzętu lub konfiguracji. Odpowiednio dobrane stabilne pole ułatwia zachowanie tożsamości, lecz nazwy interfejsów również mogą ulegać zmianie lub ponownemu użyciu. Należy sprawdzić unikalność, trwałość i zachowanie reindeksacji na samym urządzeniu; żadna nazwa pola sama w sobie nie zapewnia ciągłości.

Decyzja ta wydaje się prosta w momencie podejmowania i staje się kosztowna w razie pomyłki. Jest podejmowana dla każdego urządzenia podczas każdego uruchomienia, dlatego dwa identyczne przełączniki mogą zostać powiązane według różnych pól. Sposób wyboru pola, skutki zniknięcia indeksu i koszty wykrywania zmian numeracji opisano w dokumencie [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/).

## Późniejsza zmiana szablonu

Zmiany na wykresach wpływają na kolejne operacje renderowania po zakończeniu zapisu i propagacji. Nadpisania parametrów i buforowanie obrazów mogą wpływać na widok użytkownika, dlatego nie należy zakładać natychmiastowej zmiany każdego wykresu. Należy sprawdzić reprezentatywny wykres podrzędny i mapowania jego elementów; zobacz [Dostosowywanie wyglądu wykresu](/pl/guides/tune-graph-appearance/).

Zapisanie szablonu danych nie zmienia automatycznie struktury istniejących plików RRD. Rzeczywiste definicje i archiwa pliku mogą różnić się od profilu w bazie danych. Przed przystąpieniem do prac należy sprawdzić oba źródła; utworzenie nowego pliku stanowi tylko jedno z rozwiązań.

W zależności od charakteru zmian dopuszczalne modyfikacje narzędziami RRDtool, zmiana rozmiaru archiwów lub kontrolowany zrzut i odtworzenie danych mogą uratować całość lub część historii. Operacje te mają swoje ograniczenia i wymagają kopii zapasowych oraz weryfikacji; nie odtworzą danych, które nigdy nie zostały zapisane. Usunięcie i ponowne utworzenie pliku bezpowrotnie niszczy historię. Zobacz [Zarządzanie przechowywaniem danych](/pl/guides/manage-data-retention/) oraz [Źródła danych i archiwa round-robin](/pl/concepts/data-sources-and-rras/).

## Inne pojęcia nazywane szablonami

Cztery inne obiekty używają tego określenia, choć zachowują się inaczej niż cztery opisane powyżej. Szablony kolorów to nazwane palety stosowane w elementach wykresów. Szablony agregacji definiują łączenie kilku wykresów w jeden. Szablony automatyzacji dopasowują wykryte urządzenia do szablonu urządzenia. Definicje ustawień wstępnych wykresu dostarczają wielokrotnego użytku układy legendy.

Żaden z nich nie wchodzi w skład opisanego tutaj stosu. Warto o nich pamiętać głównie po to, aby poprawnie interpretować wyniki wyszukiwania zawierające słowo szablon.
