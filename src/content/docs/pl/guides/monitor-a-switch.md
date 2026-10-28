---
title: Monitorowanie przełącznika
description: Wykrywanie portów przełącznika, tworzenie wykresów właściwych liczników i wybieranie indeksu, aby historia portu pozostała przypisana do portu po wymianie karty.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 2
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

Przełącznik to klasyczny przypadek użycia zapytań o dane. Nie wiesz z góry, ile portów jest obecnych, liczba ta może się zmieniać, a każdy port potrzebuje własnego źródła danych. Zobacz [Szablony](/pl/concepts/templates/), aby dowiedzieć się, jak działają zapytania o dane; ta strona dotyczy prawidłowej konfiguracji.

## Zanim zaczniesz

Upewnij się, że urządzenie odpowiada z przypisanego modułu zbierającego, najlepiej w kontekście użytkownika pollera. Użyj skonfigurowanych poświadczeń tylko do odczytu. Numeryczne identyfikatory OID zapobiegają zależności od lokalnie zainstalowanych nazw MIB.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.1
```

Używaj protokołu SNMP v2c lub v3. 64-bitowe liczniki interfejsów są obiektami SMIv2 i nie można ich odpytywać za pośrednictwem wersji v1. Urządzenie v1 zapewni tylko liczniki 32-bitowe i nic więcej.

## Wybór szablonu urządzenia

Szablon urządzenia określa, jakie zapytania o dane i szablony wykresów są oferowane po dodaniu urządzenia. Kadupul dziedziczy zestaw szablonów dostarczony przez Cacti, który zawiera ogólny szablon urządzenia SNMP oraz zestaw szablonów specyficznych dla dostawców.

Wykrywanie portów pochodzi z tego samego źródła bez względu na wybór: zapytania o dane interfejsu zdefiniowanego w `resource/snmp_queries/interface.xml`. Jeśli żaden szablon nie pasuje do Twojego sprzętu, wybierz szablon ogólny i powiąż z nim zapytanie o interfejs.

## Wykonywanie zapytania o dane

Zapytanie przechodzi przez `ifIndex`, aby znaleźć porty, i odczytuje `ifNumber`, aby wiedzieć, ilu się spodziewać. Następnie zbiera zestaw pól na port.

| Pole | OID | Używane do |
|---|---|---|
| `ifIndex` | `.1.3.6.1.2.1.2.2.1.1` | Pozycja w tabeli SNMP |
| `ifName` | `.1.3.6.1.2.1.31.1.1.1.1` | Krótka nazwa portu, `Gi1/0/3` |
| `ifDescr` | `.1.3.6.1.2.1.2.2.1.2` | Dłuższy opis |
| `ifAlias` | `.1.3.6.1.2.1.31.1.1.1.18` | Konfigurowany opis interfejsu |
| `ifHwAddr` | `.1.3.6.1.2.1.2.2.1.6` | Adres MAC portu |
| `ifSpeed` | `.1.3.6.1.2.1.2.2.1.5` | Prędkość w bitach/s, 32-bitowa |
| `ifHighSpeed` | `.1.3.6.1.2.1.31.1.1.1.15` | Prędkość w Mbitach/s |
| `ifOperStatus` | `.1.3.6.1.2.1.2.2.1.8` | Up lub Down |
| `ifInOctets` / `ifOutOctets` | `.1.3.6.1.2.1.2.2.1.10` / `.16` | 32-bitowe liczniki bajtów |
| `ifHCInOctets` / `ifHCOutOctets` | `.1.3.6.1.2.1.31.1.1.1.6` / `.10` | 64-bitowe liczniki bajtów |

Uruchom zapytanie raz na urządzeniu. Zwróci ono tabelę wykrytych portów. Przeczytaj tę tabelę przed utworzeniem wykresów, ponieważ stanowi ona podstawę każdej kolejnej decyzji.

## Wybór liczników 64-bitowych

Zapytanie o interfejs oferuje kilka szablonów wykresów ruchu. Główne z nich:

| Szablon wykresu | Odczytuje |
|---|---|
| In/Out Bits | `ifInOctets`, `ifOutOctets` |
| In/Out Bits (64-bit) | `ifHCInOctets`, `ifHCOutOctets` |
| In/Out Bits (64-bit, 95th) | To samo, z linią 95. percentyla |
| In/Out Bits (64-bit, BW) | To samo, w odniesieniu do prędkości interfejsu |
| Status (Up/Down) | `ifOperStatus` |
| In/Out (Errors/Discards) | `ifInErrors`, `ifInDiscards`, `ifOutDiscards`, `ifOutErrors` |

Użyj szablonu 64-bitowego, chyba że masz konkretny powód, aby tego nie robić. 32-bitowy licznik oktetów osiąga limit przy wartości 4294967295. Port gigabitowy pod pełnym obciążeniem zapełnia go w około 34 sekundy. Przy 300-sekundowym kroku poller nie jest w stanie odróżnić jednego przepełnienia od siedmiu przepełnień, a `COUNTER` koryguje tylko jedno przepełnienie między dwoma próbkami. Wykres nie wygląda na wyraźnie uszkodzony; po prostu stale wyświetla zaniżone wartości.

Sprawdź, czy liczniki są rzeczywiście wypełniane przed utworzeniem setek wykresów.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.31.1.1.1.6
```

Pusty lub nieudany walk wymaga zbadania: sprawdź zgłoszony błąd, widok dostępu i obsługę agenta.

## Sprawdzanie zapisanego maksimum po zmianach prędkości

Gdy źródło danych używa maksimum opartego na prędkości zapytania, proces tworzenia pobiera prędkość z danych wykrywania zapisanych w pamięci podręcznej. Preferowana jest wartość `ifHighSpeed`, `ifSpeed` jest używana w przypadku braku tej pierwszej, a skonfigurowana wartość domyślna ma zastosowanie, jeśli obie mają wartość zero.

Wartość ta jest zapisywana w pliku. Port wykryty przy 100 Mbps, a później wynegocjowany wyżej, może zachować limit poniżej rzeczywistego ruchu, a RRDtool zarejestruje wartości powyżej tego limitu jako nieznane. Porównaj prędkość w pamięci podręcznej, definicję źródła danych i rzeczywisty plik za pomocą `rrdtool info`.

## Decyzja o indeksie

W tym miejscu traci się historię w przypadku błędów.

Każde źródło danych przechowuje dwie informacje o swoim porcie: które pole go identyfikuje (typ indeksu) oraz wartość tego pola. Przy każdej reindeksacji ponownie odnajduje port, pytając, który indeks SNMP ma obecnie tę wartość w tym polu. Źródło danych podąża za wartością, a nie pozycją w tabeli.

Pytanie brzmi zatem, które pole niesie tę wartość.

Zapytanie o interfejs deklaruje kolejność preferencji: `ifName`, następnie `ifDescr`, potem `ifHwAddr`, a na końcu `ifIndex`. Kadupul zwykle wybiera spośród kandydatów o wystarczająco odrębnych wartościach i bez duplikatów.

| Pole | Przetrwa | Zawodzi gdy |
|---|---|---|
| `ifName` | Restart, wymiana karty, renumeracja | Agent pozostawia je puste lub powtarza w elementach stosu |
| `ifDescr` | Zwykle stabilne na sprzęcie przełącznika | Na serwerach nazwa jądra podatna na zmiany |
| `ifHwAddr` | Restart | Wymieniona karta ma nowe adresy MAC, co jest dokładnie przypadkiem, przed którym chciałeś się zabezpieczyć |
| `ifIndex` | Nic pewnego | Wymiana karty, restart lub zmiana oprogramowania układowego renumeruje tabelę |

Jeśli zapytanie powróci do `ifIndex`, potraktuj to jako problem, a nie normalny wynik. Historia Twojego portu jest wtedy powiązana z numerem, który przełącznik może swobodnie przypisać ponownie.

## Metoda reindeksacji

Ustawiana dla każdego urządzenia i zapytania o dane. Określa, kiedy Kadupul ponownie odczytuje pola indeksu.

| Metoda | Wyzwalana przez | Koszt |
|---|---|---|
| None | Nic; tylko ręcznie lub skryptowo | Brak |
| Uptime | Czas pracy SNMP urządzenia cofający się | Jedno porównanie na cykl |
| Index Count | Zmiana liczby wykrytych indeksów | Jedno zliczenie na cykl |
| Verify All | Niepowodzenie kontroli tożsamości w pamięci podręcznej | Odpytuje znane indeksy podczas cyklu |

Uptime jest wartością domyślną i jest odpowiednia dla większości przełączników, ponieważ ponowne uruchomienie jest zdarzeniem, które zmienia numerację indeksów. Index Count wychwytuje karty dodane lub usunięte bez restartu. Verify All może wykrywać zmienione tożsamości na znanych indeksach, ale nie gwarantuje wykrycia nowych portów.

Aby ponownie uruchomić wybrane urządzenie i zapytanie, zastąp oba identyfikatory identyfikatorami zainstalowanymi. Pomiń `--qid`, aby ponownie uruchomić wszystkie zapytania dla tego urządzenia:

```bash
php cli/poller_reindex_hosts.php --id=42 --qid=16
```

`--id=all` rozszerza uruchomienie na wszystkie włączone urządzenia. Unikaj nakładających się przebiegów reindeksacji. `--force` omija rejestrację procesów i odświeża pamięci podręczne tytułów.

## Gdy port znika

Nie zakładaj, że brakujący port automatycznie zatrzymuje zbieranie danych. Bieżący kod reindeksacji może zresetować flagę osierocenia i zachować stare identyfikatory OID odpytywania, gdy tożsamość jest nierozwiązana i żadne źródło nie zmienia indeksu. Porównaj zapisaną tożsamość z nową pamięcią podręczną wykrywania i wyłącz źródło, którego to dotyczy, do momentu potwierdzenia dopasowania. Zobacz [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/).

## Duże obudowy (chassis)

Dwa ustawienia dla każdego urządzenia stają się ważne, gdy liczba portów jest duża: sprawdź skonfigurowane identyfikatory OID na żądanie SNMP oraz liczbę wątków na urządzenie. Obsługa przetwarzania wsadowego i efektywny paralelizm zależą od modułu zbierającego i agenta; PHP `cmd.php` oraz Spine nie oferują identycznego zachowania wątków.

Zmieniaj tylko jedno ustawienie naraz i obserwuj czas trwania cyklu pollera.

## Tryby awarii

| Symptom | Przyczyna |
|---|---|
| Wykresy utworzone, każdy pomiar nieznany | Liczniki 64-bitowe niezaimplementowane lub urządzenie korzysta z SNMP v1 |
| Liczniki przeskakują do absurdalnych wartości | Licznik 32-bitowy przepełnia się częściej niż raz na interwał |
| Luki tylko przy dużym obciążeniu | Maksimum RRD zablokowane na nieaktualnej wykrytej prędkości |
| Historia portu przypisana do niewłaściwego portu po konserwacji | Niestabilna tożsamość, nieaktualne mapowanie lub nierozwiązana obsługa osierocenia |
| Poller rejestruje ostrzeżenia o nieprawidłowych indeksach SNMP | Źródła danych pozostawione bez indeksu; zindeksuj ponownie, usuń lub wyłącz |
| Porty wykryte, nic nie jest zbierane | Źródła danych z pustym indeksem nie tworzą wpisów w pamięci podręcznej pollera |
