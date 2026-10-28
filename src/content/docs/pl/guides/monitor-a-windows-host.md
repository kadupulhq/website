---
title: Monitorowanie hosta Windows
description: Tworzenie wykresów CPU, dysków, interfejsów i czasu pracy w systemie Windows za pośrednictwem usługi SNMP, jakie obiekty zasobów hosta przenoszą dane i co zrobić, gdy SNMP jest niedostępne.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 14
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

System Windows za pośrednictwem protokołu SNMP udostępnia interfejsy, procesory, pamięć masową i niektóre liczniki. Wbudowany agent firmy Microsoft nie udostępnia obiektów obciążenia, pamięci i dysków szablonów UCD net-snmp. Pamięć można jednak wykreślić z wierszy pamięci masowej, jeśli agent je uwidacznia. Agenci innych firm mogą dostarczać inne obiekty; sprawdź rzeczywistego agenta przed wyborem szablonów.

## Co zapewnia usługa SNMP

Usługa SNMP systemu Windows jest przestarzała i opcjonalna. W systemach Windows 10 i 11 firma Microsoft dokumentuje jej instalację za pośrednictwem funkcji opcjonalnych lub funkcji systemu Windows; starszy błąd nazwy funkcji DISM nie dowodzi sam w sobie, że jest ona niedostępna. Sprawdź instrukcje odpowiednie dla danej edycji systemu Windows. Zobacz [przewodnik instalacji SNMP firmy Microsoft](https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-install-snmp-wmisnmpprovider).

Sprawdź, które z tych poddrzew udostępnia zainstalowany agent:

| Obszar | Poddrzewo | Zapewnia |
|---|---|---|
| System | `.1.3.6.1.2.1.1` | Opis, czas pracy (uptime), kontakt, nazwa, lokalizacja |
| Interfejsy | `.1.3.6.1.2.1.2` i `.1.3.6.1.2.1.31` | Ruch, błędy, status |
| Zasoby hosta | `.1.3.6.1.2.1.25` | Procesory, pamięć masowa, liczba procesów, zalogowani użytkownicy |
| LAN Manager | `.1.3.6.1.4.1.77` | Dane usług i udziałów systemu Windows |

Szablony Windows dostarczane przez Kadupul odczytują pierwsze trzy obszary. Nic w dołączonym zestawie nie odczytuje poddrzewa LAN Manager.

Dwa elementy konfiguracji na hoście decydują o tym, czy otrzymujesz dane: ciąg wspólnoty (community) oraz lista menedżerów, od których agent akceptuje pakiety. Host skonfigurowany do akceptowania protokołu SNMP tylko z jednego adresu menedżera odpowie tylko temu menedżerowi i odrzuci wszystko inne.

Sprawdź każdy obszar z poziomu hosta pollera przed utworzeniem wykresów. Zastąp przykładowy host i wspólnotę skonfigurowanymi wartościami; nazwa `public` służy wyłącznie do celów ilustracyjnych.

```bash
snmpget  -v2c -c public win.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c public win.example.net .1.3.6.1.2.1.25.2.3.1.3
```

Drugi walk odczytuje obciążenie procesora, a trzeci odczytuje listę opisów pamięci masowej. Jeśli pierwsze polecenie działa, a dwa pozostałe nic nie zwracają, sprawdź ograniczenia dostępu, obsługę agenta i zwrócony błąd SNMP.

## Dodawanie urządzenia

Zaimportuj `install/templates/Windows_Device.xml.gz`, jeśli brakuje szablonów, zgodnie z artykułem [Importowanie i eksportowanie szablonów](/pl/guides/import-and-export-templates/). Wybierz szablon urządzenia Windows, zweryfikuj wykrywanie zapytań, a następnie jawnie utwórz żądane wykresy. Pakiet zawiera trzy zapytania o dane i powiązane z nimi szablony wykresów.

| Zapytanie o dane | Oparte na | Odczytuje |
|---|---|---|
| SNMP - Statystyki interfejsu | `resource/snmp_queries/interface.xml` | `IF-MIB`, bezpośrednio przeszukiwana |
| SNMP - Pobierz informacje o procesorze | `resource/script_server/host_cpu.xml` | `hrProcessorLoad` za pośrednictwem `scripts/ss_host_cpu.php` |
| SNMP - Pobierz punkty montowania | `resource/script_server/host_disk.xml` | `hrStorageTable` za pośrednictwem `scripts/ss_host_disk.php` |

Zapytania o dysk i procesor są zapytaniami serwera skryptów pomimo swoich nazw. Działają w osobnym, długo działającym procesie serwera skryptów PHP i wykonują wywołania SNMP z poświadczeniami rekordu urządzenia. Zapytanie o interfejs to czyste zapytanie SNMP. Praktyczną konsekwencją jest to, że awaria serwera skryptów PHP zatrzymuje zbieranie danych o dysku i procesorze w systemie Windows, podczas gdy wykresy interfejsów nadal działają.

## Co otrzymujesz bez zapytania o dane

Dwa szablony wykresów odczytują po jednym stałym OID.

| Wykres | OID | Przechowywane jako |
|---|---|---|
| Host MIB - Procesy | `.1.3.6.1.2.1.25.1.6.0` | `GAUGE` |
| Host MIB - Zalogowani użytkownicy | `.1.3.6.1.2.1.25.1.5.0` | `GAUGE` |

Dwa pozostałe w ogóle nic nie odczytują z urządzenia. Wykresy czasu pracy i czasu odpytywania wywołują `scripts/ss_hstats.php` i zwracają kolumnę z własnego rekordu urządzenia Kadupul: `snmp_sysUpTimeInstance` dla czasu pracy, a zarejestrowany czas trwania odpytywania dla czasu odpowiedzi. Odczytują one zapisane pomiary, a nie świeżą odpowiedź SNMP.

## Tabele zasobów hosta

### Procesory

`hrProcessorLoad` w gałęzi `.1.3.6.1.2.1.25.3.3.1.2` zwraca jeden wpis na procesor logiczny udostępniany przez agenta. Przeglądanie (walk) zapewnia indeksy; nie zakładaj, że liczba wierszy zawsze odpowiada deklarowanej liczbie wątków sprzętowych.

Wartość jest już wyrażona w procentach. MIB definiuje ją jako średnią z ostatniej minuty. Zobacz [definicję MIB Host Resources](https://www.rfc-editor.org/rfc/rfc2790.html).

### Pamięć masowa

Dołączone zapytanie o pamięć masową wykorzystuje tabelę `hrStorageTable` w gałęzi `.1.3.6.1.2.1.25.2.3.1`. Odczytuje sześć kolumn.

| Kolumna | OID | Kierunek |
|---|---|---|
| `hrStorageIndex` | `.1.3.6.1.2.1.25.2.3.1.1` | Indeks |
| `hrStorageDescr` | `.1.3.6.1.2.1.25.2.3.1.3` | Indeks i wyświetlana etykieta |
| `hrStorageAllocationUnits` | `.1.3.6.1.2.1.25.2.3.1.4` | Dane wejściowe, mnożnik |
| `hrStorageSize` | `.1.3.6.1.2.1.25.2.3.1.5` | Dane wyjściowe |
| `hrStorageUsed` | `.1.3.6.1.2.1.25.2.3.1.6` | Dane wyjściowe |
| `hrStorageAllocationFailures` | `.1.3.6.1.2.1.25.2.3.1.7` | Dane wyjściowe |

Rozmiar i używane miejsce to liczby jednostek alokacji, a nie bajty. Skrypt mnoży każdą wartość przez rozmiar jednostki alokacji zapisany w pamięci podręcznej dla tego indeksu, gdy obie wartości są prawidłowe.

Dwie kwestie często powodują problemy w systemie Windows.

**Tabela nie jest listą dysków twardych.** Agent zgłasza wszystko, co uważa za pamięć masową. W zależności od agenta pamięć fizyczna i wirtualna mogą pojawiać się obok dysków stałych. Etykiety takie jak `C:\`, `D:\`, `Physical Memory` i `Virtual Memory` są przykładami, a nie gwarantowanymi wierszami. Wybierz wiersze, które chcesz wykreślić.

**Duże lub nieprawidłowe wartości pamięci masowej wymagają weryfikacji.** MIB definiuje rozmiar i użycie jako nieujemne 32-bitowe liczby całkowite ze znakiem (Integer32). Agent zwracający wartość ujemną wykracza poza ten zakres. Bieżący skrypt używa operacji `(abs(value) + 2147483647) * allocation_units`, co nie reprezentuje 32-bitowej reinterpretacji bez znaku. Traktuj wartości, których to dotyczy, jako niewiarygodne i zindeksuj ponownie po naprawieniu wykrywania. Zobacz [błąd konwersji pamięci masowej](https://github.com/kadupulhq/kadupul/issues/243).

## Czym system Windows różni się od Linuksa

| Cecha | Linux z net-snmp | Wbudowany agent Windows / dołączone szablony |
|---|---|---|
| Średnie obciążenie | `.1.3.6.1.4.1.2021.10.1.3` | Brak obiektów średniego obciążenia UCD |
| Pamięć RAM | `.1.3.6.1.4.1.2021.4` | Można wykreślić z udostępnionych wierszy `hrStorage` |
| CPU | Procenty UCD lub `hrProcessorLoad` | Tylko `hrProcessorLoad` |
| Lista dysków | Zadeklarowana przez użytkownika `dskTable` lub `hrStorage` | Tylko `hrStorage`, niefiltrowana |
| We/Wy dysku | `diskIOTable` | Nic z dołączonego zestawu tego nie odczytuje |
| Nazwy interfejsów | Nazwy jądra, krótkie | Długie opisy kart sieciowych, często zduplikowane |

Wbudowany agent firmy Microsoft nie udostępnia poddrzewa UCD `.1.3.6.1.4.1.2021`. Zobacz [Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/).

### Interfejsy

Zapytanie o interfejs jest identyczne z tym używanym przez przełącznik. Jego preferowana kolejność indeksowania to `ifName`, następnie `ifDescr`, `ifHwAddr`, a na końcu `ifIndex`. Wybiera pierwsze pole obecne i unikalne na każdym wykrytym interfejsie.

System Windows jest platformą, na której to najczęściej zawodzi. Dwie identyczne karty sieciowe mogą zwracać ten sam `ifDescr`, a niektórzy agenci pozostawiają `ifName` puste. Gdy zapytanie powraca do `ifIndex`, historia interfejsu jest powiązana z numerem, który system Windows może swobodnie przypisać ponownie.

Zobacz [Monitorowanie przełącznika](/pl/guides/monitor-a-switch/) i [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/).

## Gdy SNMP jest niedostępne

W wielu instalacjach systemu Windows usługa SNMP nie jest włączona. Zamiennikiem jest wejście skryptowe.

Dwa fakty decydują o sposobie pisania skryptu.

**Skrypt działa na maszynie, na której działa poller.** Dotarcie do hosta Windows to zadanie Twojego skryptu: WinRM, agent, punkt końcowy HTTP, udział sieciowy lub cokolwiek innego.

**Emituj pomiary na standardowe wyjście.** Ścieżka poleceń zewnętrznych pollera PHP nie używa statusu wyjścia jako wartości pomiaru. Wyemituj liczbę lub `U` w przypadku braku pomiaru w danym cyklu. Nie emituj `0`, gdy chcesz zasygnalizować, że pomiar zakończył się niepowodzeniem.

Jeśli potrzebujesz wartości na interfejs, dysk lub usługę zamiast pojedynczej liczby, ten sam mechanizm skryptowy oferuje formę indeksowaną. Plik `resource/script_queries/host_cpu.xml` to praktyczny przykład, który wywołuje skrypt PHP zamiast serwera skryptów.

Zobacz [Pisanie skryptu zbierania danych](/pl/guides/write-a-data-collection-script/), aby zapoznać się z kontraktem wyjściowym i ograniczeniami nazewnictwa.

## Tryby awarii

| Symptom | Częsta przyczyna |
|---|---|
| Opis systemu odczytany, nic innego nie jest zbierane | Sprawdź obsługę obiektów, ograniczenia dostępu i konkretny błąd SNMP |
| Brak jakiejkolwiek odpowiedzi z hosta, który jest online | Lista akceptowanych menedżerów agenta lub reguła zapory hosta dla UDP 161 |
| Lista partycji zawiera pamięć RAM | Oczekiwane; agent zgłasza pamięć jako pamięć masową |
| Duży wolumen wyświetla się ujemnie lub jako nieznany | Nieprawidłowe wartości agenta lub nieaktualne jednostki alokacji; sprawdź znany błąd |
| Dysk i procesor zatrzymują się, interfejsy działają dalej | Awaria serwera skryptów; zapytanie o interfejs z niego nie korzysta |
| Przypisano szablony Net-snmp, każdy pomiar nieznany | Wybrany agent nie udostępnia obiektów UCD wymaganych przez te szablony |
| Historia interfejsu podąża za niewłaściwą kartą po zmianie | Indeks powrócił do `ifIndex`, ponieważ nazwy były puste lub zduplikowane |
| Czas pracy powtarza starą wartość | Sprawdź, czy rekord urządzenia nie jest nieaktualny; pomocnik nie dokonuje ekstrapolacji |
