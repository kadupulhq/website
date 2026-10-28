---
title: Automatyczne wykrywanie urządzeń
description: Skanuj zakres sieci, dopasowuj znalezione urządzenia do szablonu i pozwól regułom tworzyć wykresy oraz gałęzie drzewa, z wyłączonym tworzeniem urządzeń podczas wstępnego przebiegu wykrywania.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 15
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich
wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

Automatyzacja to dwa odrębne mechanizmy, które łatwo pomylić. Wykrywanie (discovery) przeszukuje
zakres adresów i decyduje, co jest urządzeniem. Reguły decydują o tym, co zostanie utworzone dla
urządzenia, gdy już istnieje. Można uruchamiać każdy mechanizm niezależnie, a większość szkód,
jakie użytkownicy wyrządzają w automatyzacji, wynika z włączenia obu naraz i odkrywania
skutków po fakcie.

## Zdefiniuj zakres

Zakres sieci to lista oddzielona przecinkami. Każdy wpis ma jedną z trzech postaci.

| Postać | Przykład | Uwagi |
|---|---|---|
| CIDR | `192.168.1.0/24` | Akceptuje również maskę dziesiętną z kropkami, `192.168.1.0/255.255.255.0` |
| Symbol wieloznaczny | `192.168.*.*` | Konwertowany wewnętrznie na równoważny CIDR |
| Pojedynczy adres | `192.168.1.10` | Skanuje dokładnie ten adres |

Zakresy od początku do końca zapisane jako `192.168.1.10-192.168.1.50` są odrzucane z
błędem. Nie są obsługiwane.

Używaj nienakładających się zakresów, w tym pomiędzy sieciami, które mogą działać współbieżnie.
Tabela robocza posiada globalny klucz unikalny dla adresu IP; duplikat może
odrzucić cały pakiet wstawiania, pomijając inne adresy w tym pakiecie. Zobacz
[zgłoszenie #207](https://github.com/kadupulhq/kadupul/issues/207).

Wszystko opiera się na IPv4. Obliczenia zakresów wykorzystują w całości konwersję 32-bitowych liczb całkowitych,
więc nie ma tutaj ścieżki IPv6.

Adresy sieci i rozgłoszeniowe są wykluczone. `/24` skanuje 254 adresy, od
`.1` do `.254`. Wpis pojedynczego adresu skanuje jeden. Adresy, których ostatni oktet to 255,
są również pomijane podczas skanowania.

Zanim rozpocznie się skanowanie, każdy adres w zakresie jest zapisywany w tabeli roboczej, po jednym
wierszu na adres, a wątki pobierają z niej wiersze. Zakres `/16` zapisuje 65534 wiersze przed
pierwszym pingiem. Jest to realny koszt i dlatego skanowanie dużego, rzadko obsadzonego zakresu jest
powolne, nawet jeśli nic nie odpowiada.

Przypisz zestaw opcji SNMP do każdego zakresu. Tryb główny (master) rejestruje błąd i pomija
zakres, którego identyfikator zestawu SNMP wynosi zero. Przebieg docelowy nie stosuje tego zabezpieczenia;
uruchomienie go bezpośrednio nie sprawi, że brakujące opcje SNMP staną się użyteczne.

## Dostosuj tempo skanowania

| Ustawienie | Działanie | Wartość domyślna |
|---|---|---|
| Discovery Threads | Równoległe procesy robocze pobierające adresy | 1 |
| Run Limit | Wykrywanie jest przerywane po tym czasie | 20 minutes |
| Schedule Type | Ręczny, dzienny, tygodniowy, miesięczny lub miesięczny w ustalony dzień | Manual |
| Ping Method | ICMP, TCP, TCP closed, UDP lub SNMP | Z ustawień globalnych |
| Ping Retries, Timeout | Koszt niepowodzenia na adres | Z ustawień globalnych |

Wątki i limit czasu wykonania kolidują ze sobą, jeśli nie zostaną dobrze zaplanowane. Pięćdziesiąt wątków
wobec `/16` to skanowanie portów dla dowolnego systemu wykrywania intruzów.
Jeden wątek w tym samym zakresie osiągnie limit wykonania i zostanie przerwany w połowie,
pozostawiając częściowy wynik, który wygląda na kompletny.

Dobierz rozmiar zakresu tak, aby skanowanie zakończyło się w wyznaczonym limicie przy liczbie wątków
akceptowalnej dla Twojej sieci. Kilka mniejszych zakresów jest lepszych niż jeden duży, ponieważ każdy otrzymuje własny
harmonogram i własny limit.

## Co skanowanie wykonuje dla każdego adresu

1. Rozwiązuje nazwę. Alternatywne serwery DNS można podać jako listę rozdzieloną spacjami; jeśli
   żaden nie jest ustawiony, używany jest własny resolver pollera. Wyszukiwanie NetBIOS jest opcjonalnym
   rozwiązaniem rezerwowym, gdy DNS niczego nie zwróci.
2. Sprawdza, czy adres lub ta nazwa jest już urządzeniem. Jeśli tak, adres jest
   oznaczany jako ukończony. Tłumi to istniejące urządzenie znalezione na podstawie tych wartości; nie jest
   to jednak gwarancja przed współbieżnym tworzeniem lub rozbieżnymi aliasami.
3. Wykonuje ping skonfigurowaną metodą. Metoda SNMP omija oddzielny ping.
4. Jeśli ping odpowie lub wybrano metodę SNMP, podejmuje próbę SNMP i zbiera `sysDescr`, `sysObjectID`, `sysName`,
   `sysLocation`, `sysContact` oraz czas pracy (uptime).
5. Porównuje zebrane dane systemowe z regułami urządzeń.

Adres, który odpowiada na ping, ale nie odpowiada na SNMP, jest rejestrowany jako znaleziony i aktywny. Adres,
który odpowiada na SNMP, ale nie pasuje do żadnej reguły urządzenia, jest rejestrowany jako znaleziony wraz ze swoimi
danymi systemowymi i nic nie jest tworzone. Oba trafiają na listę wykrytych urządzeń.

Tłumienie duplikatów jest domyślnie włączone. Jeśli `sysName` został już zarejestrowany na
innym adresie w zapisanych rekordach wykrywania tej sieci lub istnieje na urządzeniu o innej
nazwie hosta, adres jest pomijany. Jest to właściwe zachowanie dla routera z wieloma
zaadresowanymi interfejsami i niewłaściwe dla identycznych urządzeń za osobnymi adresami NAT;
właśnie po to istnieje opcja tego samego sysName, aby to wyłączyć.

Istniejące urządzenia mogą mieć ponownie uruchamiane zapytania o dane podczas skanowania. Jest to domyślnie
wyłączone i dotyczy urządzeń zarejestrowanych jako aktywne lub w trakcie odzyskiwania. Wykrywanie używa ich
zapisanego stanu do tej decyzji; nie sonduje ponownie od zera istniejącego urządzenia.

## Reguły urządzeń decydują o szablonie

Reguła urządzenia mapuje dane systemowe na szablon urządzenia. Każda reguła zawiera wzorzec dla
`sysDescr`, `sysObjectID` i `sysName`. Mechanizm dopasowywania filtruje według każdego pola systemowego,
które urządzenie zwróciło jako niepuste; puste wzorce reguł pasują do dowolnej wartości. Reguły
są oceniane sekwencyjnie i wygrywa pierwsze dopasowanie.

Używaj prostych podciągów dosłownych i weryfikuj wybrany szablon w wynikach wykrywania.
Obecny mechanizm SQL ujmuje wzorce regex w dosłowne znaki `/`,
więc zakotwiczony wzorzec, taki jak `^Linux.*fixture$`, kończy się niepowodzeniem, nawet jeśli operator regex bazy danych
dopasowuje go bezpośrednio. Mechanizm rezerwowy podciągów tego nie naprawia. Zobacz
[zgłoszenie #206](https://github.com/kadupulhq/kadupul/issues/206). SQL `LIKE`
traktuje również `%` i `_` jako symbole wieloznaczne.

Brak dopasowania oznacza brak urządzenia. Adres jest rejestrowany na liście wykrytych urządzeń
wraz ze wszystkimi zebranymi danymi systemowymi, i ta lista jest miejscem, w którym tworzy się brakującą
regułę.

Umieszczaj reguły szczegółowe nad ogólnymi. Reguła dopasowująca podciąg `Linux`
umieszczona nad regułą producenta przejmie każde urządzenie, które wspomina o Linuksie w swoim
opisie.

## Przejrzyj wykrywanie przed włączeniem tworzenia

Przełącznik tworzenia urządzeń w nowym zakresie jest domyślnie wyłączony. Pozostaw go wyłączonym
podczas pierwszego przebiegu i wyłącz opcję ponownego uruchamiania zapytań o dane istniejących urządzeń.
Ten przebieg nadal aktualizuje rekordy wykrywania, statystyki skanowania i dzienniki oraz może wysyłać
skonfigurowane powiadomienia. Nie symuluje on jednak wykonania reguł wykresów ani drzewa.

Uruchom skanowanie, a następnie przejrzyj listę wykrytych urządzeń. Pokazuje ona zapisane odkrycia,
zebrane dane SNMP oraz dopasowany szablon, jeśli jest dostępny. Istniejące
urządzenia, stłumione duplikaty i pominięte adresy nie muszą się tam pojawiać.
Przeanalizuj dane wyjściowe debugowania dla poszczególnych adresów, a także samą listę.

Wymuś skanowanie z wiersza poleceń zamiast czekać na harmonogram:

```bash
php poller_automation.php --network=3 --force --debug
```

Flaga debugowania wypisuje decyzje dla poszczególnych adresów na bieżąco. Proces nadrzędny (master),
który uruchamia włączone zakresy, których harmonogram nadszedł, stanowi osobny tryb:

```bash
php poller_automation.php -M
```

Ukierunkowane polecenie z `--force` uruchamia również wyłączoną sieć. Dodanie `--force` do
trybu nadrzędnego omija sprawdzanie harmonogramu i może uruchamiać również sieci wyłączone.
Używaj formy ukierunkowanej podczas sprawdzania pojedynczego zakresu.

Przed włączeniem tworzenia sprawdź w wyniku trzy rzeczy:

- Liczba urządzeń jest zgodna z oczekiwaniami. Liczba znacznie wyższa niż lista zasobów
  oznacza zazwyczaj, że zakres jest szerszy niż sądzono.
- Wybrane szablony są prawidłowe. Kolumna z tym samym ogólnym szablonem na
  wszystkim oznacza, że Twoje reguły nie działają prawidłowo.
- Nie brakuje niczego istotnego. W przypadku brakującego urządzenia sprawdź rozszerzenie zakresu, zakończenie pracy procesów roboczych,
  tłumienie istniejących urządzeń i duplikatów, politykę ping oraz wyniki SNMP.
  Sama nieobecność na liście nie dowodzi, że urządzenie jest nieosiągalne.

## Reguły wykresów i drzew

Gdy urządzenie już istnieje, reguły wykresów i reguły drzew decydują o tym, co zostanie na nim zbudowane.
Wykrywanie może wywołać tę automatyzację po utworzeniu urządzenia, a CLI może
zastosować ją do istniejących urządzeń. Poszczególne reguły wykresów i drzew muszą być włączone.
Globalne przełączniki automatyzacji wykresów/drzew zarządzają konkretnymi punktami zaczepienia (hooks);
nie stanowią one bezwzględnego zakazu jawnej automatyzacji CLI.

Reguła wykresu składa się z trzech części: do jakich urządzeń ma zastosowanie, do jakich wykrytych indeksów
w ramach zapytania o dane ma zastosowanie oraz jaki typ wykresu utworzyć. Obie części
dopasowujące są budowane z elementów reguły, a element reguły to pole, operator i
wzorzec, połączone za pomocą `AND` lub `OR` z nawiasami.

| Grupa operatorów | Składniki |
|---|---|
| Podciąg | contains, does not contain, begins with, does not begin with, ends with, does not end with |
| Równość | matches, is not equal to |
| Liczbowe | is less than, less than or equal, greater than, greater than or equal |
| Obecność | is unknown, is not unknown, is empty, is not empty |
| Wzorzec | matches regular expression, does not match regular expression |

Stają się one klauzulą SQL `WHERE`. Operatory wyrażeń regularnych wykorzystują
dialekt regex bazy danych, a nie PCRE, więc wzorzec działający w
`preg_match` niekoniecznie zadziała tutaj. Porównania liczbowe ze wzorcami
liczbowymi są przekazywane bez cudzysłowów; wszystko inne jest ujmowane w cudzysłowy, a baza danych
stosuje własne reguły konwersji typów. Przetestuj filtry liczbowe na rzeczywistych wartościach z
pamięci podręcznej; wartości te są zwykle przechowywane jako tekst. Operatory podciągów używają SQL `LIKE`,
gdzie `%` i `_` mają znaczenie symboli wieloznacznych.

Przed debugowaniem reguły, która nic nie robi, warto poznać dwa zachowania:

**Pusty filtr urządzenia/obiektu nie pasuje do niczego, ale pusty filtr indeksu
pasuje do wszystkich zbuforowanych indeksów.** Filtr wyboru urządzenia cofa się do fałszywego warunku,
gdy nie zawiera żadnych elementów dopasowania. Jednak gdy reguła wykresu dopasuje urządzenie,
usunięcie wszystkich jej warunków indeksu wykresu pozostawia zapytanie o dane bez filtrowania.
Na przykład usunięcie warunku `ifDescr = eth0` może również utworzyć wykres dla `lo`.
Wyłącz regułę podczas edycji jej warunków indeksu.

**Reguła odwołująca się do pola, którego urządzenie nie wykryło, jest porzucana.** Jeśli
reguła filtruje według pola zapytania o dane, którego nie ma w pamięci podręcznej tego urządzenia, przebieg rejestruje
ostrzeżenie z nazwą pola i zatrzymuje przetwarzanie tej reguły dla tego urządzenia. Typową
przyczyną jest reguła napisana dla jednego zapytania o dane oceniana na urządzeniu, którego
zapytanie zwróciło inny zestaw pól.

Strona edycji reguły wyświetla listę potencjalnych obiektów i wykresów. Przejrzyj te listy przed
włączeniem reguły i po jej edycji. Są to podglądy selekcji, a nie pełna
próba wykonania: sprawdzanie źródeł danych, wykrywanie istniejących wykresów, punkty zaczepienia
i wstawianie do drzewa nadal odbywają się podczas wykonywania. CLI nie ma opcji przebiegu próbnego.

Reguły drzewa mają oddzielne typy liści urządzeń i wykresów oraz wybrane drzewo
docelowe i węzeł nadrzędny. Kroki nagłówka mogą używać stałych ciągów znaków lub wartości z
pól urządzeń/wykresów. Nagłówki pochodzące z pól stosują zastępowanie regex PHP bez uwzględniania wielkości liter;
dosłowne sekwencje `\n` w wyniku dzielą go na kolejne zagnieżdżone nagłówki.
Ta składnia zastępowania różni się od SQL regex używanego do dopasowywania obiektów.
Istniejące nagłówki i liście są ponownie wykorzystywane w tym samym drzewie i węźle nadrzędnym; zmiana
ścieżki może dodać nowe umiejscowienie bez usuwania starego.

## Zastosuj reguły do urządzeń, które już istnieją

Wykrywanie nie jest jedyną drogą. Reguły można uruchamiać na urządzeniach znajdujących się już w
systemie, wybieranych według identyfikatora, nazwy hosta lub opisu:

```bash
php cli/apply_automation_rules.php --ids="12 13 14" --debug
php cli/apply_automation_rules.php --hostname="^edge-" --debug
php cli/apply_automation_rules.php --description="branch office"
```

Nazwa hosta i opis są dopasowywane jako wyrażenie regularne, jeśli wartość jest prawidłowa,
oraz zawsze także jako podciąg. Wymagany jest co najmniej jeden z trzech selektorów;
wywołanie bez selektorów kończy się błędem. Gdy selektory są łączone,
są powiązane za pomocą `AND`. Używaj dodatnich identyfikatorów urządzeń oddzielonych spacjami dla wąskiego
wyboru; identyfikatory rozdzielone przecinkami nie są obsługiwane. Wzorce mogą być szerokie,
a mechanizm rezerwowy SQL `LIKE` traktuje `%` i `_` jako symbole wieloznaczne.

Zapytanie selektora nie wyklucza automatycznie wyłączonych urządzeń. Opcja `--debug`
dodaje diagnostykę, ale nadal przeprowadza tworzenie. Brak pasujących urządzeń to pomyślna
operacja no-op, więc sam kod wyjścia nie świadczy o tym, że cokolwiek zostało utworzone.

Dla każdego pasującego urządzenia przebieg wykonuje kolejno trzy czynności:

1. Podejmuje próbę utworzenia dla dołączonych szablonów wykresów, które nie mają wykresu na
   urządzeniu, z zastrzeżeniem kwalifikowalności szablonu i sprawdzenia źródeł danych.
2. Uruchamia włączone reguły wykresów dla dołączonych zapytań o dane przy użyciu ich zapisanego bufora
   indeksów. Ten krok sam w sobie nie uruchamia ponownie wykrywania; odśwież najpierw zapytanie o dane,
   jeśli pamięć podręczna jest niedostępna lub nieaktualna.
3. Stosuje włączone reguły drzewa liści urządzeń.

Tworzenie nowego wykresu może wywołać reguły drzewa liści wykresów, gdy globalna automatyzacja drzewa
jest włączona. CLI nie stosuje ponownie tych reguł do wykresów, które zastanie już
utworzone. Nowa lub zmieniona reguła liścia wykresu nie uzupełnia zatem wstecznie istniejących
wykresów tylko dlatego, że CLI zostanie ponownie uruchomione. Zobacz
[zgłoszenie #211](https://github.com/kadupulhq/kadupul/issues/211). Zweryfikuj ich umiejscowienie
osobno; nie usuwaj i nie twórz na nowo historycznych wykresów tylko po to, aby wywołać punkt zaczepienia tworzenia.

Powtarzające się przebiegi tłumią istniejący nieindeksowany wykres według urządzenia i szablonu wykresu.
Wykresy indeksowane są sprawdzane według urządzenia, zapytania o dane, typu wykresu i indeksu. Zapobiega
to powielaniu tworzenia w kolejnych przebiegach; nie jest to jednak gwarancja współbieżności.
Sprawdź listę wykresów i drzewo po uruchomieniu, wraz z komunikatami dziennika `AUTOM8` dotyczącymi
pominiętych wykresów, nieprawidłowych danych lub niepowodzeń tworzenia.

Jedna rzecz jest pomijana na tyle cicho, że może wprowadzać w błąd: szablon wykresu z polem
oznaczonym jako nadpisywalne, które nie ma wartości domyślnej, nie kwalifikuje się do automatyzacji. Przebieg
rejestruje, że nie został dodany, ponieważ nadpisywalne pole nie ma wartości domyślnej, i przechodzi
dalej. Jeśli oczekiwany szablon nigdy się nie pojawia, należy to sprawdzić w pierwszej kolejności. Zobacz
[Szablony](/pl/concepts/templates/), aby dowiedzieć się, czym jest pole nadpisywalne.

## Pułapki

**Wyłączenie reguły nie cofa jej działania.** Nie usuwa wykresów ani wpisów
drzewa już utworzonych. Usuwanie urządzeń ma oddzielne zachowanie czyszczenia wykresów i
źródeł danych; przejrzyj opcje usuwania przed skasowaniem urządzenia.

**Przerwane skanowanie wygląda na prawidłowe.** Limit czasu wykonania kończy
wykrywanie w miejscu, do którego dotarło. Zarejestrowane sumy to sumy pracy, która została
ukończona, i nic nie oznacza wyniku jako częściowego. Porównaj liczbę przeskanowanych adresów
z rozmiarem zakresu.

**Reguły działają na pamięci podręcznej zapytań o dane, a nie na urządzeniu.** Reguła wykresu, która
do niczego nie pasuje, często oznacza, że zapytanie o dane nigdy nie zostało uruchomione lub nie znalazło indeksów.
Sprawdź tabelę wykrytych indeksów przed ponownym pisaniem reguły.

**Wiadomość e-mail z powiadomieniem zawiera istniejące i nowe odkrycia.** Zakres może wysłać wiadomość
po zakończeniu, grupując zarejestrowane odkrycia według tego, czy dany adres IP pojawił się
w migawce przed skanowaniem. Nie jest to dowód na to, że każdy żądany adres został przeskanowany.

## Typowe usterki

| Symptom | Zwykła przyczyna |
|---|---|
| Skanowanie niczego nie znajduje w zapełnionym zakresie | Zablokowany ping, awaria SNMP, wykluczenia lub tłumienie duplikatów |
| Zakres odmawia skanowania, błąd w dzienniku | Brak przypisanego zestawu opcji SNMP |
| Urządzenia znalezione, ale żadne nie zostało utworzone | Wyłącznik tworzenia nieaktywny lub żadna reguła nie pasowała |
| Wszystko otrzymuje ten sam ogólny szablon | Kolejność reguł, z regułą ogólną powyżej szczegółowych |
| Przeskanowano tylko część adresów | Osiągnięto limit wykonania lub nakładające się zakresy odrzuciły pakiet adresów |
| Jedno urządzenie na router zamiast jednego na interfejs lub odwrotnie | Ustawienie tłumienia duplikatów dla tego samego sysName |
| Reguła do niczego nie pasuje, a dziennik ostrzega o kolumnie | Reguła filtruje według pola, którego zapytanie o dane nie zwróciło |
| Szablon wykresu nigdy nie został utworzony przez regułę | Brak wymaganej wartości domyślnej, nieprawidłowe wyjście źródła danych lub błąd tworzenia |
| Nieoczekiwane wykresy dla dodatkowych interfejsów | Filtr indeksu wykresu jest pusty lub szerszy niż zamierzono |
| Nowa reguła drzewa nie umieszcza istniejących wykresów | CLI nie uzupełnia wstecznie reguł liści wykresów dla istniejących wykresów |
