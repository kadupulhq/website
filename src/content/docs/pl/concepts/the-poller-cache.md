---
title: Pamięć podręczna pollera
description: Dlaczego kolektor odczytuje wstępnie obliczoną listę zadań zamiast Twojej konfiguracji i dlaczego jest to typowy powód, dla którego zmiana wydaje się nic nie robić.
banner:
  content: Kadupul znajduje się w fazie pre-alpha. Sprawdź te procedury w wyizolowanej instalacji testowej.
sidebar:
  order: 6
---

[Architektura](/pl/concepts/architecture/) wprowadza pamięć podręczną pollera w jednym zdaniu:
lista zadań jest wstępnie obliczana, a kolektor odczytuje ją zamiast analizować Twoją
konfigurację przy każdym cyklu. Ta strona wyjaśnia, z czym w praktyce wiąże się ta decyzja.

## Co kolektor musiałby zrobić w przeciwnym razie

Ustalenie, co należy zebrać dla pojedynczej wartości, wymaga rozwiązania całego
łańcucha zależności. Źródło danych wskazuje na urządzenie i szablon danych. Szablon
wskazuje na metodę wprowadzania danych. Ta z kolei ma zdefiniowane pola, z których
część jest nadpisywana dla konkretnego urządzenia, a część dziedziczona z szablonu.
Jeśli źródło danych pochodzi z zapytania o dane, bieżący indeks musi zostać
rozwiązany przez pamięć podręczną zapytań. Następnie dane uwierzytelniające SNMP
muszą zostać pobrane z urządzenia, o ile dane pole ich nie nadpisuje.

To oznacza wykonanie wielu złączeń dla jednej wartości. Nawet skromna instalacja
obsługuje dziesiątki tysięcy wartości i wykonuje cykl co pięć minut. Wykonywanie
tych obliczeń w momencie zbierania danych oznaczałoby, że to baza danych, a nie
sieć, decyduje o tym, ile urządzeń można monitorować.

Dlatego rozwiązanie zależności następuje tylko raz, w momencie zmiany, a wynik
jest zapisywany w postaci płaskiej tabeli.

## Co przechowuje pamięć podręczna

Pamięć podręczna wstępnie oblicza instrukcje zbierania danych. Zmniejsza to liczbę
powtarzających się operacji parsowania konfiguracji, ale nie eliminuje złączeń ani
odczytu bieżącego stanu urządzeń.

| Zawarte w wierszu | Cel |
|---|---|
| Który kolektor jest właścicielem | Każdy kolektor wybiera wyłącznie własne wiersze |
| Akcja: SNMP, skrypt lub serwer skryptów | Decyduje, która ścieżka kodu zostanie wykonana |
| Nazwa hosta, wersja SNMP, port, limit czasu, community lub poświadczenia | Buforowane pola połączenia; odczytywany jest również bieżący stan hosta |
| OID lub pełna linia poleceń skryptu | Już podstawione, gotowe do natychmiastowego uruchomienia |
| Ścieżka do pliku RRD | Już rozwiązana |
| Nazwa pola w pliku i liczba pól w kompletnym odczycie | Umożliwia dopasowanie i walidację danych wyjściowych |
| Krok i odliczanie do następnego terminu wykonania | Zobacz [Czas i interwały](/pl/concepts/time-and-intervals/) |

`cmd.php` łączy `poller_item` z `host`, odfiltrowuje wyłączone urządzenia i używa
bieżących pól urządzenia do sprawdzania dostępności oraz ponownego indeksowania.
Zbuforowane identyfikatory OID, polecenia i metadane RRD nadal muszą odpowiadać
zamierzonemu źródłu danych.

Zbuforowane poświadczenia są migawką, jednak zapisanie zmienionych danych
uwierzytelniających przez interfejs API urządzenia zazwyczaj odświeża właściwy
bufor. Bezpośrednie modyfikacje bazy danych omijają tę ścieżkę i mogą pozostawić
nieaktualną migawkę. Sprawdź rzeczywisty stan pamięci podręcznej, zamiast zakładać,
że każda zmiana poświadczeń wymaga ręcznej przebudowy.

Ścieżka RRD jest również migawką. Przenoszenie plików lub zmiana ich lokalizacji
sprawia, że każdy zbuforowany wiersz nadal wskazuje na starą lokalizację.

## Co ją zapisuje

Pamięć podręczna jest utrzymywana przyrostowo przez operacje, które rejestrują zmiany.

| Operacja | Przepisane wiersze |
|---|---|
| Zapisanie urządzenia | Zmiany w polach połączenia, kolektorze lub stanie wyłączenia wyzwalają wypchnięcie; niezmienione pola zbierania mogą korzystać ze ścieżki szybkiego zapisu |
| Zapisanie źródła danych | Wiersze tego źródła danych |
| Tworzenie wykresów i źródeł danych z szablonu | Nowo utworzone wiersze |
| Uruchomienie zapytania o dane, które przeniosło lub rozwiązało indeks | Tylko te źródła danych, które uległy zmianie |
| Przebudowa przez CLI | Włączone urządzenia przetworzone przez procesy robocze; obecny błąd przekazywania `--host-id` uniemożliwia poleganie na izolacji urządzenia |

Przepisywanie nie jest ślepym wstawianiem. Wiersze dla przebudowywanych źródeł
danych są najpierw oznaczane jako nieobecne, następnie zapisywany jest nowy zestaw,
a wszystkie elementy nadal oznaczone jako nieobecne są usuwane. W ten sposób
usuwane są wiersze dla pól, które już nie istnieją. Czyszczenie bufora jest ograniczone
do identyfikatorów kolektora i źródeł danych. Chroni to niepowiązane źródła w
zwykłej ścieżce docelowej; nie stanowi to jednak gwarancji w przypadku współbieżnych
przebudów lub nieudanych zapisów do bazy danych. Zweryfikuj powstałe wiersze po
przebudowie, w tym sąsiednie, nienaruszone urządzenie podczas badania zakresu.

## Wiersze, które nigdy nie są zapisywane

Niektóre konfiguracje nie generują nowego wiersza pamięci podręcznej. Sprawdzaj
zarówno dzienniki, jak i wykres.

Konstruktor pomija wyłączone urządzenia, ale masowa akcja **Wyłącz** zachowuje
istniejące wiersze bufora, a proces zbierania odfiltrowuje urządzenie. Przebudowa
w stanie wyłączenia może usunąć wiersze. Masowa akcja **Włącz** ponownie wykorzystuje
wypełniony bufor lub inicjuje go, gdy jest pusty; dodatkowe zapisanie urządzenia
zazwyczaj nie jest wymagane. Istniejący częściowy lub nieaktualny bufor nadal
wymaga zbadania.

Element SNMP, którego urządzenie nie posiada użytecznej konfiguracji SNMP, nie generuje
żadnego wiersza. Brak wersji, wersja poza zakresem lub puste pole community w wersji
1 lub 2 powoduje pominięcie wiersza, zamiast zapisywania wpisu, który zawodziłby w
każdym cyklu.

Gdy skonfigurowana jest biała lista danych wejściowych, brakujący plik lub odrzucone
dane wejściowe uniemożliwiają tworzenie nowych wierszy dla tego wejścia. Zakończona
przebudowa nadal usuwa nieaktualne wiersze. Bez konfiguracji `input_whitelist` to
sprawdzenie zezwala na dane wejściowe; nie jest to ochrona włączona na stałe.
Przejrzyj odrzucone polecenie i skonfigurowane zasady przed modyfikacją białej listy.

Interfejs może nadal pokazywać źródło danych, którego pamięć podręczna jest pusta.
Jego wykres może zachować dawną historię lub wykazywać luki; płaska linia zerowa
nie jest wiarygodnym wskaźnikiem. Brakujące poświadczenia i odrzucone dane wejściowe
to problemy konfiguracyjne wymagające rozwiązania.

## Dlaczego zmiana może pozornie nic nie dawać

Trzy różne mechanizmy wywołują ten sam objaw.

**Wiersz nie został przebudowany.** Zmieniono parametr, którego interfejs nie traktuje
jako wpływającego na zbieranie danych, lub zmiana nastąpiła poza interfejsem. Pamięć
podręczna nadal przechowuje starą odpowiedź. Przebudowa może odświeżyć zbuforowane
pola po zweryfikowaniu zamierzonej konfiguracji.

**Wiersz nigdy nie został utworzony.** Omówiono wyżej. Przebudowa rozwiązuje również
ten problem, ale dopiero po usunięciu przyczyny źródłowej; diagnostyka pojawia się
często w dziennikach, a nie na wykresie.

**Wartość jest zbierana, a następnie odrzucana.** Dane wyjściowe o wielu wartościach
są mapowane przez definicje pól szablonu, a nieodwoływane pola mogą zostać pominięte
podczas analizowania. Sprawdź oczekiwane nazwy pól, mapowania i powiązania z
wykresami; reguła ta nie odrzuca bezwzględnie wszystkich próbek liczbowych bez
odniesienia do wykresu. Przebudowa pamięci podręcznej nie naprawi nieprawidłowego
kontraktu wyjściowego.

## Tępe narzędzie

W przypadku pojedynczego urządzenia użyj opcji **Wypełnij ponownie pamięć podręczną pollera**
na jego klasycznej stronie urządzenia. Ta akcja wywołuje ścieżkę `push_out_host()`
o zasięgu urządzenia. Następnie sprawdź wynikowe wiersze i komunikaty diagnostyczne.

Obecny skrypt nadrzędny `rebuild_poller_cache.php` przyjmuje opcję `--host-id`, ale
nie przekazuje tego filtra do polecenia procesu roboczego. Rzekoma przebudowa
jednego urządzenia przez CLI może zatem przebudować również inne włączone urządzenia.
Nie polegaj na tej opcji w celu zapewnienia izolacji, dopóki ten błąd aplikacji nie
zostanie naprawiony.

Szeroka przebudowa przez CLI jest dostępna z katalogu głównego aplikacji i uruchamiana
jako użytkownik pollera:

```bash
php cli/rebuild_poller_cache.php
```

Przetwarza ona włączone urządzenia; nie jest to rozwiązanie naprawcze dla każdego
źródła bez przypisanego hosta lub wyłączonego. Operacja ta zapisuje do tabel
zbierania danych i może wymagać czasu. Unikaj nakładających się przebudów i nie
przerywaj procesu. Opcja `--force` w CLI omija zabezpieczenie przed wielokrotną
rejestracją procesu, dlatego nie jest to opcja do rutynowych napraw.

Przebudowa odświeża stany pochodne; nie naprawia dostępności urządzeń, nie przenosi
plików RRD, nie naprawia odrzuconych poleceń wejściowych ani nie odzyskuje utraconej
historii. Sprawdź wynikowy stan pamięci podręcznej, dzienniki i kolejne cykle
zbierania danych przed uznaniem naprawy za zakończoną.

Kadupul rejestruje moment ostatniej zmiany w pamięci podręcznej, co pozwala innym
częściom systemu zauważyć potrzebę ponownego jej odczytania.

## Wielu kolektorów

Gdy działa więcej niż jeden kolektor, każdy wiersz należy dokładnie do jednego z nich,
a wiersze są przekazywane zarówno do własnej bazy danych tego kolektora, jak i do
bazy centralnej.

Jeśli zdalny kolektor jest nieosiągalny podczas zapisywania zmiany, zmiana trafia do
bazy centralnej, a nie zdalnej, o czym Kadupul informuje: żąda pełnej synchronizacji
po przywróceniu łączności z kolektorem. Do czasu tej synchronizacji zdalny kolektor
wykonuje starszą listę zadań niż ta, którą prezentuje interfejs. Rozbieżność specyficzna
dla kolektora stanowi powód do zbadania stanu replikacji, łączności i lokalnego
bufora każdego kolektora.

Kolejność operacji w pełnym cyklu, w tym moment odczytu pamięci podręcznej oraz
czas przetwarzania poleceń ponownego indeksowania, opisano w dokumencie
[Cykl życia pollera](/pl/reference/poller-lifecycle/). Informacje na temat skalowania
kolektorów znajdują się w przewodniku [Skalowanie pollera](/pl/guides/scale-the-poller/).
