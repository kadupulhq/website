---
title: Zapytania o dane i indeksy
description: Jak pojedyncze przejście po urządzeniu staje się wieloma źródłami danych, czym naprawdę jest indeks i co się dzieje, gdy urządzenie zmienia numerację.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 5
---

Zwykłe źródło danych wymaga wcześniejszej wiedzy o tym, co mierzysz, zanim je skonfigurujesz.
Sprawdza się to przy średnim obciążeniu procesora. Nie działa to jednak w przypadku portów
przełączników, dysków, czujników temperatury czy maszyn wirtualnych, ponieważ ich lista się
zmienia i nie masz nad nią bezpośredniej kontroli.

Zapytanie o dane (data query) odkrywa dostępne obiekty. Tworzenie wykresów — ręczne lub
poprzez skonfigurowaną automatyzację — wybiera, które obiekty otrzymają źródła danych; samo
wykonanie zapytania nie tworzy automatycznie każdego możliwego wykresu.

## Co zawiera definicja zapytania

Zapytanie o dane to opis XML składający się z trzech części: gdzie znajduje się lista elementów,
co należy odczytać o każdym z nich oraz jak rozstrzygnąć, który element jest którym.

Zapytanie dotyczące interfejsów dostarczane z Kadupul stanowi praktyczny przykład. Przechodzi
ono po gałęzi `.1.3.6.1.2.1.2.2.1.1`, aby wyliczyć interfejsy, a następnie odczytuje zestaw
nazwanych pól na każdej zwróconej pozycji. Każde pole deklaruje swój kierunek.

| Kierunek | Znaczenie | Przykłady interfejsu |
|---|---|---|
| `input` | Odczytywane w celu identyfikacji i nazewnictwa. Nie jest zbierane w czasie | `ifName`, `ifDescr`, `ifAlias`, `ifType`, `ifSpeed` |
| `output` | Wartość warta zbierania w każdym cyklu | `ifHCInOctets`, `ifHCOutOctets` |
| `input-output` | Oba zastosowania | `ifOperStatus`, `ifAdminStatus` |

Pola deklarują również sposób odczytu wartości. Większość przyjmuje ją dosłownie; niektóre
stosują wyrażenie regularne, aby wyodrębnić liczbę z wyliczenia SNMP, a inne wymagają
zdekodowania wartości jako tekstu, a nie surowych bajtów.

Uruchomienie zapytania zapisuje jeden wiersz na indeks i na pole: urządzenie, zapytanie, nazwę
pola, wartość oraz pozycję, z której wartość pochodzi. Ta tabela stanowi odpowiedź na pytanie
„co posiada to urządzenie?”, zapisaną w pamięci podręcznej do następnego uruchomienia. Wybór
wykresów korzysta z tej pamięci podręcznej, ale narzędzia do tworzenia wykresów mogą również
dołączać lub ponownie uruchamiać zapytanie. Sprawdź wyniki wykrywania przed dodaniem wykresów.

## Indeks to problem tożsamości

Pozycja w tabeli SNMP nie jest nazwą. Jest to numer gniazda przydzielony przez agenta, a agenci
zmieniają kolejność gniazd po ponownym uruchomieniu, ponownym włożeniu karty, aktualizacji
oprogramowania układowego lub zmianie konfiguracji, która usuwa interfejs. Jeśli źródło danych
pamięta jedynie „gniazdo 3”, to w dniu, w którym gniazdo 3 stanie się innym portem, trzymiesięczna
historia po cichu przypisze się do niewłaściwego obiektu.

Kadupul przechowuje typ indeksu oraz wartość identyfikacyjną wraz z aktualnie rozpoznanym indeksem
SNMP. Ponowne indeksowanie (reindexing) używa tej tożsamości do wyszukania bieżącej pozycji w
tabeli; ręcznie nadpisane typy indeksów podlegają odrębnej obsłudze.

Przy każdym uruchomieniu zapytania wyszukiwane jest aktualne gniazdo dla danej wartości pola.

| Wynik | Co się dzieje |
|---|---|
| To samo gniazdo | Brak działań |
| Inne gniazdo | Źródło danych zostaje przypisane do nowego gniazda, a jego wykresy podążają za nim |
| Wartość nie jest już obecna | Obsługa osieroconych wpisów zależy od zapytania i ścieżki kodu; sprawdź wynikową flagę i OID-y odpytywania zamiast zakładać, że zbieranie zostało wstrzymane |

Ponowne indeksowanie zwykle zachowuje źródło danych i jego dotychczasową historię. Opcja
`index_transient` traktuje brakujące tożsamości jako oczekiwane i pomija zwykłe oznaczanie
jako osierocone. `index_orphan_removal` usuwa powiązane wpisy odpytywania i dane wyjściowe Boost;
nie usuwa samego źródła danych ani pliku RRD.

Obecna obsługa osieroconych wpisów ma wadę: gdy tożsamość znika i żadne inne źródło nie zmienia
indeksu, gałąź braku zmian może ponownie wyczyścić flagę osierocenia, pozostawiając poprzedni indeks
i OID-y odpytywania na miejscu. Nie polegaj na automatycznym maskowaniu sierot, aby zapobiec
zbieraniu danych z ponownie użytego indeksu portu. Zweryfikuj zapisaną tożsamość z wynikami
wykrywania i wyłącz dane źródło do czasu rozwiązania problemu.

## Wybór pola klucza

Nie każde pole nadaje się na klucz. Definicja zapytania zawiera uporządkowaną listę preferencji,
a Kadupul przegląda ją i wybiera pierwszego kandydata, który spełnia zestaw warunków.

| Warunek | Dlaczego istnieje |
|---|---|
| Pole jest typu `input` lub `input-output` | Pola identyfikujące muszą być dostępne podczas wykrywania |
| Żadne dwa indeksy nie dzielą tej samej wartości | Zduplikowany klucz nie pozwala jednoznacznie zidentyfikować wiersza |
| Liczba unikalnych wartości jest równa liczbie indeksów | Odrzuca niepełne pokrycie kandydatów |

Sprawdzanie to przewiduje wyjątki: pojedynczy zadeklarowany kandydat jest zwracany bezpośrednio,
a surowy OID indeksu jest akceptowany oddzielnie. `index_type=nonunique` pomija odrzucanie
duplikatów, ale nie pomija sprawdzania liczby unikalnych wartości. Sprawdź wybrane pole i wartości
w pamięci podręcznej; sama etykieta typu XML nie stanowi dowodu walidacji.

Zapytanie o interfejsy preferuje `ifName`, następnie `ifDescr`, potem adres sprzętowy, a na
końcu surowy indeks. Ta kolejność jest celowa. `ifName` jest krótkie i stabilne na większości
platform. `ifDescr` jest stabilne, lecz czasami zawiera w tekście numer gniazda, co niweczy
jego cel. Surowy indeks jest na końcu, ponieważ opieranie się na nim jest niewiele lepsze od
braku klucza w ogóle.

Oto kwestia, która często zaskakuje użytkowników. Wybór dokonywany jest dla każdego urządzenia
i każdego uruchomienia na podstawie bieżących danych tego urządzenia. Brakujące wartości w pamięci
podręcznej lub zduplikowane nazwy mogą wykluczyć `ifName` i spowodować powrót do `ifDescr`. Puste
pole samo w sobie nie wskazuje, który test zawiódł; zbadaj rzeczywiste wiersze wykrywania. Dwa
identyczne przełączniki mogą zostać powiązane z różnymi polami, a urządzenie może zmienić używane
pole między uruchomieniami. Kadupul rejestruje ostrzeżenie, gdy wybrane pole ulega zmianie, ponieważ
wtedy pojawia się ryzyko błędów remapowania.

Wybrane pole zwykle określa również nazwy wykresów poprzez format tytułu, który się do niego odwołuje.
Jeśli tytuły wykresów w Twojej flocie zmieniają strukturę, pole sortowania jest miejscem, w którym
należy szukać przyczyny.

## Wykrywanie konieczności reindeksacji

Ponowne uruchamianie zapytania o dane dla każdego urządzenia w każdym cyklu byłoby kosztowne i
w większości bezcelowe, ponieważ większość urządzeń nie zmienia numeracji przez lata. Zamiast tego
każda para urządzenie-zapytanie posiada metodę reindeksacji, która jest niedrogą asercją
sprawdzaną podczas normalnego zbierania danych. Gdy asercja zawiedzie, reindeksacja trafia do kolejki.

| Metoda | Co sprawdza | Ograniczenia i koszt |
|---|---|---|
| Brak | Brak automatycznej asercji | Ponowne uruchomienie zapytania musi wynikać z ręcznego lub innego jawnego działania |
| Czas pracy (Uptime) | Czas pracy nie cofnął się | Wymaga działającego SNMP; pomija zmiany bez cofnięcia czasu pracy |
| Liczba indeksów | Bieżąca liczba zgadza się z zapisanymi indeksami | OID zliczający może być tani; bez niego implementacja liczy wyniki przejścia lub skryptu. Zmiany przy zachowaniu tej samej liczby mogą zostać pominięte |
| Weryfikuj wszystko | Znane wartości kluczy nadal pasują do ich zapisanych indeksów | Koszt rośnie wraz z rozmiarem zestawu w pamięci podręcznej; nie gwarantuje wykrycia nowo dodanych indeksów ani zmian semantycznych zachowujących te wartości |

„Weryfikuj wszystko” sprawdza asercje podczas odpytywania; nie uruchamia bezwarunkowo całego
zapytania wykrywającego w każdym cyklu. Zmierz jego koszt na reprezentatywnych urządzeniach przed
szerszym wdrożeniem. Czas pracy jest powszechnym ustawieniem domyślnym, ale nie zapewnia żadnej
asercji, gdy SNMP jest wyłączone. Definicja zapytania może dostarczyć własne źródło czasu pracy lub zliczania.

## Reindeksacja jest asynchroniczna

Nieudana asercja nie uruchamia reindeksacji natychmiast. Zapisuje polecenie, a oddzielny przebieg
po cyklu zbierania danych podejmuje to polecenie i ponownie uruchamia zapytanie. Warto pamiętać o
praktycznych konsekwencjach.

Cykl wykrywający może nadal korzystać ze starej pamięci podręcznej, co oznacza, że wartość może trafić
do niewłaściwej serii przed zakończeniem reindeksacji. Tłumienie skoków powiązane z czasem pracy
zastępuje pojedynczy wynik wartością nieznaną, gdy flaga jest ustawiona; nie stanowi to jednak
gwarancji dla wszystkich danych wielowartościowych ani każdej zmiany indeksu.

Reindeksacja nie zostanie uruchomiona dla urządzenia, które jest niedostępne lub wyłączone. Urządzenie,
które zmieniło numerację w czasie niedostępności, nadal wymaga asercji lub jawnego ponownego uruchomienia
po odzyskaniu łączności. Pierwsze udane odpytanie samo w sobie nie dowodzi, że ponowne mapowanie zostało
zakończone. Opcja `--force` nie omija kontroli stanu niedostępności/wyłączenia.

Po ponownym uruchomieniu zapytania wpisy w pamięci podręcznej pollera dla przeniesionych źródeł danych
zostają przepisane, co faktycznie przekierowuje zbieranie danych. Mechanizm ten to
[Pamięć podręczna pollera](/pl/concepts/the-poller-cache/), a ponowne uruchomienie zapytania jest jedną
z niewielu operacji, które aktualizują go automatycznie.

W kwestiach operacyjnych — dodawania zapytania do urządzenia i odczytywania wyników — zobacz
[Monitorowanie przełącznika](/pl/guides/monitor-a-switch/).
