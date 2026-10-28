---
title: Monitorowanie serwera Linux
description: Tworzenie wykresów CPU, pamięci, dysku i obciążenia na hoście Linux za pomocą net-snmp, co snmpd musi udostępniać i jak używać skryptu, gdy SNMP nie wystarcza.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 3
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

Host Linux z uruchomionym net-snmp zapewnia większość metryk bez żadnego dodatkowego kodu. Praca polega na skłonieniu `snmpd` do udostępnienia właściwych poddrzew oraz na wiedzy, na które z dwóch nakładających się MIB dyskowych patrzysz.

## Co snmpd musi udostępniać

Kadupul odpytuje cztery obszary. Przydziel tożsamości monitorującej poddrzewa wymagane dla wybranych wykresów; nie każde wdrożenie wymaga każdego poddrzewa.

| Obszar | Poddrzewo | Zapewnia |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Opis, czas pracy (uptime), kontakt, nazwa, lokalizacja |
| Interfejsy | `.1.3.6.1.2.1.2` i `.1.3.6.1.2.1.31` | Ruch, błędy, status |
| Zasoby hosta | `.1.3.6.1.2.1.25` | Procesy, zalogowani użytkownicy, pamięć masowa, procesory |
| UCD / net-snmp | `.1.3.6.1.4.1.2021` | Średnie obciążenie, pamięć, czas procesora, we/wy dysku, zadeklarowane partycje |

Wiele dystrybucji dostarcza domyślny plik `snmpd.conf` przyznający widok obejmujący wyłącznie poddrzewo systemowe. Urządzenie odpowie, zgłosi opis systemowy i niczego nie zbierze. Ta kombinacja jest najczęstszym początkowym błędem na hoście Linux i wygląda dokładnie jak problem z szablonem.

Sprawdź wymagane obszary z hosta pollera, używając tej samej tożsamości SNMP, która została skonfigurowana na urządzeniu. Poniższe przykłady używają przykładowej wspólnoty (community); zastąp ją skonfigurowaną wartością. Numeryczne identyfikatory OID zapobiegają konieczności posiadania lokalnych definicji symbolicznych MIB.

```bash
snmpget  -v2c -c public server.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public server.example.net .1.3.6.1.4.1.2021.10.1.3
snmpwalk -v2c -c public server.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Jeśli działa tylko pierwsze polecenie, zbadaj dokładną odpowiedź: ograniczony widok, niedostępny moduł agenta, inny kontekst SNMP lub pusta tabela mogą wyjaśniać wynik. Przed modyfikacją szablonu Kadupul sprawdź konfigurację agenta i uprawnienia dostępu.

## Dodawanie urządzenia

Dostarczony pakiet `install/templates/NetSNMP_Device.xml.gz` zawiera szablon urządzenia Net-SNMP i jego zależności. Zaimportuj go, jeśli brakuje szablonu, a następnie wybierz go podczas dodawania urządzenia. Potwierdź indeksy zapytań i jawnie utwórz żądane wykresy; wybór szablonu urządzenia nie dowodzi, że zbieranie danych działa. Zobacz [Importowanie szablonów](/pl/guides/import-and-export-templates/) oraz [Twój pierwszy wykres](/pl/start/first-graph/).

## Co otrzymujesz bez zapytania o dane

Te szablony danych o stałym OID są dołączone do pakietu. Wykres może łączyć kilka z nich; dostępność zależy od agenta docelowego. Nie wymagają one wykrywania indeksów.

| Wykres | OID | Przechowywane jako |
|---|---|---|
| Średnie obciążenie 1-minutowe | `.1.3.6.1.4.1.2021.10.1.3.1` | `GAUGE` |
| Średnie obciążenie 5-minutowe | `.1.3.6.1.4.1.2021.10.1.3.2` | `GAUGE` |
| Średnie obciążenie 15-minutowe | `.1.3.6.1.4.1.2021.10.1.3.3` | `GAUGE` |
| Całkowita pamięć | `.1.3.6.1.4.1.2021.4.5.0` | `GAUGE` |
| Wolna pamięć | `.1.3.6.1.4.1.2021.4.6.0` | `GAUGE` |
| Pamięć buforów | `.1.3.6.1.4.1.2021.4.14.0` | `GAUGE` |
| Pamięć podręczna | `.1.3.6.1.4.1.2021.4.15.0` | `GAUGE` |
| CPU użytkownika | `.1.3.6.1.4.1.2021.11.9.0` | `GAUGE` |
| CPU systemowy | `.1.3.6.1.4.1.2021.11.10.0` | `GAUGE` |
| CPU bezczynny | `.1.3.6.1.4.1.2021.11.11.0` | `GAUGE` |
| Przerwania | `.1.3.6.1.4.1.2021.11.7.0` | `GAUGE` |
| Przełączenia kontekstu | `.1.3.6.1.4.1.2021.11.8.0` | `GAUGE` |
| Procesy | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Zalogowani użytkownicy | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Obiekty pamięci są wyrażone w kilobajtach. Spakowany wykres pamięci stosuje konwersję, dzięki czemu oś jest wyświetlana w bajtach. Jeśli tworzysz własny wykres z tych identyfikatorów OID, odpowiedzialność za tę konwersję spoczywa na Tobie.

Wymienione obiekty procesora są przestarzałymi wartościami procentowymi, a nie skumulowanymi licznikami czasu procesora. Nie zakładaj, że te trzy wartości samodzielnie pokrywają każdy stan procesora. Net-SNMP wycofuje je na rzecz surowych liczników; surowe liczniki wymagają właściwych obliczeń wskaźników i wartości procentowych, a nie prostego wstawienia do szablonu typu gauge. Zobacz [UCD-SNMP MIB](https://www.net-snmp.org/docs/mibs/ucdavis.html).

## Co wymaga zapytania o dane

| Zapytanie | Wykrywa | Oparte na |
|---|---|---|
| SNMP - Pobierz punkty montowania | Wszystko, co agent nazywa pamięcią masową | `hrStorageTable`, `.1.3.6.1.2.1.25.2.3.1` |
| Net-SNMP - Pobierz monitorowane partycje | Tylko partycje zadeklarowane w `snmpd.conf` | `dskTable`, `.1.3.6.1.4.1.2021.9.1` |
| SNMP - Pobierz informacje o procesorze | Jeden wpis na procesor | Obciążenie procesora z zasobów hosta |
| Net-SNMP - Pobierz we/wy urządzeń | Urządzenia blokowe | `diskIOTable`, `.1.3.6.1.4.1.2021.13.15.1.1` |
| SNMP - Statystyki interfejsu | Interfejsy sieciowe | `IF-MIB` |

### Którego zapytania o dysk użyć

To nie są dwa widoki tych samych danych.

Zapytanie o zasoby hosta przechodzi przez wszystko, co agent zgłasza jako pamięć masową. Na większości hostów Linux obejmuje to fizyczną pamięć, swap, punkty montowania tmpfs i rzeczywiste systemy plików na jednej liście. Rozmiary są zwracane w jednostkach alokacji, a zapytanie odczytuje rozmiar jednostki alokacji jako osobne pole, aby wykres mógł dokonać mnożenia. Otrzymujesz wszystko bez konfigurowania czegokolwiek, ale również długą listę niepożądanych wpisów.

Zapytanie net-snmp odczytuje tabelę dysków UCD, wypełnianą przez dyrektywy `disk` lub `includeAllDisks`. Wybierz jawne partycje lub szerokie wykrywanie; reprezentują one różne zasady.

```
disk /      10%
disk /var   10%
```

Alternatywnie dyrektywa `includeAllDisks 10%` zapełnia dyski znalezione podczas uruchamiania agenta. Wartość 10% konfiguruje próg wolnego miejsca; nie jest filtrem wyboru i sama w sobie nie konfiguruje alertów Kadupul. Przeładuj lub zrestartuj agenta, a następnie przejrzyj indeksy. Puste zapytanie może również odzwierciedlać problemy z dostępem lub dostępnością modułów. Zobacz [konfigurację snmpd](https://www.net-snmp.org/docs/man/snmpd.conf.html).

Preferuj zapytanie o zasoby hosta, gdy zależy Ci na kompletności i możesz przefiltrować wpisy. Preferuj zapytanie net-snmp z jawnymi wpisami `disk`, gdy zależy Ci na ukierunkowanej liście. `includeAllDisks` rozszerza tę listę; sprawdź ponownie indeksy po restartach agenta.

### Interfejsy

Zapytanie o dane interfejsu na serwerze zachowuje się dokładnie tak samo jak na przełączniku, z jednym zastrzeżeniem: `ifDescr` w systemie Linux to nazwa interfejsu jądra, która może ulec zmianie po restarcie lub aktualizacji sterownika. Zobacz [Monitorowanie przełącznika](/pl/guides/monitor-a-switch/), aby uzyskać szczegółowe informacje o wyborze indeksu.

## Gdy SNMP nie wystarcza

Niektóre metryki nie mają użytecznej MIB. Głębokość kolejki, licznik aplikacji lub liczba w pliku wymagają danych wejściowych ze skryptu.

Dwa fakty decydują o sposobie pisania skryptu.

**Skrypt działa na maszynie, na której działa poller, a nie na monitorowanym hoście.** Dotarcie do celu to zadanie Twojego skryptu: SSH, wywołanie HTTP, agent lub jakikolwiek mechanizm już wdrożony.

**Poller odczytuje standardowe wyjście i nic więcej.** Status zakończenia nie jest ewaluowany.

Kontrakt wyjściowy:

| Wyjście | Znaczenie |
|---|---|
| `42` lub `3.7` | Pojedyncza wartość dla pojedynczego źródła danych |
| `U` | Brak wartości w tym cyklu, rejestrowane jako nieznane |
| `in:1420 out:980` | Wiele wartości, po jednej na źródło danych |

W przypadku formatu z wieloma wartościami pary są rozdzielane pojedynczymi spacjami, a nazwa jest oddzielana od wartości dwukropkiem. Parser zlicza ograniczniki względem spacji, więc dodatkowe wewnętrzne spacje mogą spowodować niepowodzenie walidacji. Poller PHP obcina końcowe białe znaki. Emituj format kanoniczny z pojedynczymi spacjami i przekierowuj komunikaty diagnostyczne poza stdout.

Wewnętrzne nazwy źródeł danych RRD akceptowane przez edytor szablonów odpowiadają wzorcowi `[a-zA-Z0-9_]{1,19}`; myślniki nie są tam akceptowane. Etykiety wyjściowe skryptu muszą być zgodne z nazwami pól wejściowych danych i być mapowane na zamierzone elementy wewnętrzne. Cały wiersz wyjściowy jest przechowywany w kolumnie o długości 512 znaków. Zobacz [Skrypty zbierania danych](/pl/guides/write-a-data-collection-script/), aby poznać sprawdzony kontrakt pollera PHP.

Zwróć `U` zamiast `0`, gdy nie możesz czegoś zmierzyć. Zero jest pomiarem i zostanie w ten sposób zinterpretowane. Zobacz [Źródła danych i archiwa RRA](/pl/concepts/data-sources-and-rras/), aby dowiedzieć się, dlaczego oba stany są rozdzielone.

### Serwer skryptów

Prosty skrypt jest uruchamiany raz na źródło danych na interwał. W przypadku skryptu napisanego w języku PHP forma serwera skryptów wywołuje funkcję w osobnym, długo działającym procesie PHP, zmniejszając narzut związany z uruchamianiem interpretera.

### Pułapka białej listy

Gdy używany jest plik białej listy wprowadzania danych, poller porównuje ciąg polecenia każdego wprowadzenia z zapisanym. Ciąg polecenia, który uległ zmianie bez ponownego wygenerowania białej listy, przestaje tworzyć wpisy w pamięci podręcznej pollera, a źródło danych milknie bez błędu na wykresie. Dziennik to zgłasza, interfejs użytkownika nie.

```bash
php cli/input_whitelist.php --audit
php cli/input_whitelist.php --update --id=42
```

Zastąp `42` identyfikatorem kontrolowanej metody wprowadzania danych, a nie identyfikatorem urządzenia. Aktualizacja bez `--id` akceptuje bieżące ciągi poleceń w całym magazynie wprowadzania danych. Przeprowadź audyt zmian z wyprzedzeniem. Po aktualizacji sprawdź włączenie źródła i efektywne wpisy w pamięci podręcznej pollera.

## Tryby awarii

| Symptom | Częsta przyczyna |
|---|---|
| Opis systemu odczytany, nic innego nie jest zbierane | Widok `snmpd` ograniczony do poddrzewa systemowego |
| Zapytanie o partycje net-snmp nie znajduje indeksów | Brak wierszy `disk` lub `includeAllDisks` w `snmpd.conf` |
| Partycje zasobów hosta zawierają RAM i tmpfs | Oczekiwane; agent zgłasza je jako pamięć masową |
| Wykres pamięci przesunięty o współczynnik 1024 | Tworzenie w oparciu o surowe identyfikatory OID bez konwersji |
| Skrypt zwraca wartość w wierszu poleceń, poller rejestruje nieznaną | Niezgodność wyjścia/mapowania, błędy wewnętrznych ograniczników lub nieprawidłowa nazwa |
| Skrypt działa ręcznie, ale zawodzi przez poller | Uruchamia się jako użytkownik pollera z jego środowiskiem i uprawnieniami |
