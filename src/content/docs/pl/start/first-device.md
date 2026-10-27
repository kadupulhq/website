---
title: Dodaj pierwsze urządzenie
description: Skonfiguruj odpytywanie jednego urządzenia i upewnij się, że dane spływają, zanim zaczniesz cokolwiek na tym budować.
sidebar:
  order: 3
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
---

Dodaj jedno urządzenie, upewnij się, że odpowiada, i dopiero wtedy przejdź dalej. Większość problemów z systemem monitorowania wynika z urządzenia, które tak naprawdę nigdy nie odpowiadało od samego początku.

Wybierz urządzenie, na którym możesz sobie pozwolić na błędy: przełącznik, którego jesteś właścicielem, w sieci, którą kontrolujesz, z włączonym już protokołem SNMP. Nie zaczynaj od urządzenia, o które ktoś cię właśnie pyta.

## Zanim zaczniesz

W tym przykładzie z SNMP urządzenie musi odpowiadać na zapytania z przypisanego do niego kolektora. Uruchom testy na tym kolektorze, najlepiej jako użytkownik pollera; żądanie z twojego laptopa może biec inną ścieżką przez zaporę sieciową. Zastąp przykładowy adres i ciąg community poświadczeniami tylko do odczytu skonfigurowanymi na twoim urządzeniu. Poniższe numeryczne identyfikatory OID działają również wtedy, gdy lokalne pliki nazw MIB nie są zainstalowane.

```bash
snmpget -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.1.1.0
```

Jeśli polecenie zwróci ciąg opisu, kontynuuj. Jeśli upłynie limit czasu, najpierw rozwiąż ten problem. Żadna konfiguracja w interfejsie webowym nie sprawi, że nieosiągalne urządzenie zacznie odpowiadać.

Następnie sprawdź tabelę, którą rzeczywiście chcesz przedstawić na wykresie, ponieważ urządzenie może odpowiadać na `sysDescr`, a mimo to odrzucać tabelę interfejsów.

```bash
snmpwalk -v2c -c 'your-read-only-community' switch.example.net .1.3.6.1.2.1.2.2.1.2
```

Drugi OID to kolumna `ifDescr`. Oczekujesz jednego wiersza dla każdego udostępnionego interfejsu. Pusty wynik może oznaczać ograniczony widok SNMP lub nieobsługiwaną tabelę; błąd autoryzacji wskazuje na poświadczenia lub zasady dostępu. Zbadaj zwrócony błąd przed wprowadzeniem zmian w urządzeniu lub w konfiguracji Kadupul.

Dwa fakty dotyczące wersji SNMP mają wpływ na późniejsze decyzje, dlatego ustal je teraz.

| Wersja | Co oznacza dla ciebie |
|---|---|
| v1 | Brak obsługi Counter64. Szybkie łącza mogą wielokrotnie przepełnić 32-bitowe liczniki oktetów między odpytaniami, co powoduje niejednoznaczność wyliczanej przepustowości |
| v2c | Obsługuje Counter64, gdy agent go udostępnia; ciągi community są przesyłane jawnym tekstem |
| v3 | Obsługuje uwierzytelnianie i szyfrowanie za pomocą `authPriv`; samo wybranie v3 nie włącza automatycznie obu tych funkcji |

Preferuj v3 z `authPriv` tam, gdzie jest obsługiwane, lub v2c w ograniczonej sieci zarządzającej. Wybierz typ wykresu dla interfejsów 64-bitowych oraz odpowiednią wersję SNMP. Jeśli urządzenie obsługuje tylko v1, weź pod uwagę interwał odpytywania oraz natężenie ruchu w tabeli awarii na dole tej strony. Dokument [SNMP](/pl/reference/snmp/) szczegółowo opisuje wszystkie pola poświadczeń.

## Zdecyduj o trzech rzeczach przed otwarciem formularza

**Poświadczenia.** Dokładnie te, które przetestowano powyżej, w tym port, jeśli różni się od domyślnego.

**Metoda sprawdzania dostępności.** W ten sposób Kadupul decyduje, czy urządzenie działa, niezależnie od tego, czy zbieranie danych funkcjonuje. Dostępne opcje to: brak (none), ping, czas działania SNMP (SNMP uptime), opis SNMP (SNMP description), SNMP getNext oraz dwie kombinacje pingu z czasem działania SNMP (jedna wymagająca obu, a druga akceptująca dowolny z nich).

Preferuj metodę SNMP dla urządzenia, które odpytujesz przez SNMP. Testuje ona mechanizm, na którym polegasz. Ping ICMP wymaga surowego gniazda (raw socket), do którego użytkownicy serwera webowego i pollera zazwyczaj nie mają uprawnień; dlatego urządzenie, które odpowiada na polecenie `ping` w twojej powłoce, może nadal być raportowane jako niedostępne w interfejsie. Ping TCP na port, o którym wiesz, że jest otwarty, pozwala tego uniknąć.

**Szablon urządzenia.** Wybierz szablon odpowiadający sprzętowi.

## Dodaj urządzenie

1. Na starszej stronie **Urządzenia** (`host.php`) wybierz **Dodaj**. Tworzenie urządzeń i konfiguracja wykresów nadal korzystają z tej strony w trakcie migracji do Symfony. Wprowadź opis, nazwę hosta lub adres, przypisany kolektor, wersję SNMP oraz poświadczenia.
2. Ustaw wybraną metodę sprawdzania dostępności.
3. Wybierz szablon urządzenia.
4. Zapisz, potwierdź, że urządzenie jest włączone, i odczytaj panel dostępności/SNMP. Zapisany rekord w bazie danych nie jest dowodem na to, że zbieranie danych zakończyło się powodzeniem.

## O czym decyduje szablon urządzenia

Szablon urządzenia wiąże z nim szablony wykresów i zapytania o dane. Zapytanie o dane przeszukuje tabelę na urządzeniu, taką jak lista interfejsów, i generuje jeden indeks dla każdego wiersza. Zastosowanie szablonu uruchamia również jego zapytania o dane, aby wypełnić te indeksy. Gdy automatyzacja wykresów jest wyłączona, same powiązania nie tworzą jeszcze wykresów. Gdy automatyzacja wykresów jest włączona, hooki szablonów/zapytań mogą generować wykresy według pasujących reguł; przejrzyj istniejące wykresy przed dodaniem kolejnej kopii.

Zmiana szablonu może zmienić powiązania i ponownie uruchomić te hooki. Nie powoduje to zresetowania istniejących wykresów ani źródeł danych. Sprawdź wybrany szablon i odpytane indeksy przed zastosowaniem go do urządzenia, które posiada już historię pomiarów.

Te indeksy są powodem, dla którego wybierasz interfejsy z listy zamiast ręcznie wpisywać identyfikatory OID. [Szablony](/pl/concepts/templates/) oraz [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/) wyczerpująco opisują oba zagadnienia.

## Odczytaj panel stanu

Gdy urządzenie zostanie zapisane z metodą dostępności SNMP, Kadupul otwiera sesję i raportuje wynik. Jest to kluczowe sprawdzenie, które użytkownicy często pomijają.

| Co widzisz | Co to oznacza |
|---|---|
| Zapytania o system i czas działania kończą się sukcesem | Panel może odczytać podstawowe metadane SNMP. Nie dowodzi to jeszcze pomyślnego zbierania danych z interfejsów |
| Lokalizacja lub Kontakt jest puste | Te opcjonalne pola metadanych mogą nie być ustawione; pusta wartość sama w sobie nie jest błędem zbierania danych |
| SNMP nie jest używane | Brak ciągu community lub nazwy użytkownika na urządzeniu albo wersja ustawiona na brak (none) |
| Błąd sesji SNMP | Nawiązanie sesji nie powiodło się; sprawdź wyświetlony błąd, poświadczenia, protokół i ustawienia połączenia |
| Błąd systemowy SNMP | Odczyt `sysDescr` nie powiódł się; sprawdź zwrócony błąd, widok agenta, poświadczenia i osiągalność |
| Błąd hosta SNMP | Nie zwrócono ani opisu, ani czasu działania |
| Czas działania wyświetlany jako `U` | Czas działania nie był możliwy do odczytania. Niektóre urządzenia w ogóle go nie raportują |

Jeśli metoda dostępności obejmuje ping, poniżej pojawia się osobny wynik pingu. Odczytaj oba. Urządzenie może przejść jeden test i nie zaliczyć drugiego, a to, który zawiódł, wskazuje właściwy kierunek poszukiwań.

Pusty opis systemu nie dowodzi, że zbieranie danych kończy się niepowodzeniem. Kod obsługuje agentów z pustym opisem i użytecznym czasem działania. Wyłączone urządzenia pomijają sprawdzanie dostępności, a metody dostępności inne niż SNMP nie wyświetlają tego panelu SNMP. W następnym kroku zweryfikuj rzeczywiste zapytanie i pamięć podręczną pollera.

## Utwórz źródła danych i wykresy

W przypadku nowego urządzenia bez wykresów utworzonych automatycznie kolejnym krokiem jest utworzenie wykresu i jego źródła danych. Sprawdź opcje **Lista źródeł danych** oraz **Wyświetl pamięć podręczną pollera** na stronie urządzenia, zamiast zakładać, że są puste.

Na stronie urządzenia wybierz **Utwórz wykresy dla tego urządzenia**. W przypadku przełącznika oznacza to uruchomienie zapytania o dane interfejsów, wybranie interesujących cię interfejsów i wskazanie dla nich typu wykresu. Wybierz dwa lub trzy interfejsy, a nie wszystkie czterdzieści osiem. Weryfikujesz poprawność ścieżki, a małą pierwszą partię znacznie łatwiej zinterpretować w kolejnym kroku.

Wykres indeksowany wiąże źródła danych z wybranym interfejsem i przygotowuje ich wpisy w pamięci podręcznej pollera; zgodne istniejące źródła mogą zostać użyte ponownie. Odpowiedź o utworzeniu wykresu nie jest dowodem na to, że odpytywanie działa. Sprawdź, czy pamięć podręczna zawiera oczekiwane urządzenie, identyfikatory OID interfejsów oraz ścieżkę RRD.

## Potwierdź zbieranie danych

Poczekaj na zaplanowane cykle zbierania danych, a następnie sprawdź zarówno znaczniki czasu, jak i wartości. Pusty wykres może oznaczać normalizację początkową, nieznaną wartość lub nieudane zbieranie danych. Do obliczenia przepustowości potrzebne są dwa odczyty licznika, ale dwa uruchomienia pollera nie gwarantują jeszcze kompletnego, prawidłowego przedziału w archiwum.

Sprawdź trzy rzeczy w następującej kolejności.

**Poller został uruchomiony.** Poszukaj podsumowania zakończenia przebiegu w skonfigurowanym dzienniku zdarzeń. Jeśli go brakuje, sprawdź harmonogram, miejsce docelowe i uprawnienia dziennika oraz to, czy poller nie zakończył działania przedwcześnie. Zobacz [Rejestrowanie zdarzeń](/pl/reference/logging/).

**Plik istnieje i jest aktualny.** Skopiuj rzeczywistą ścieżkę RRD ze źródła danych lub pamięci podręcznej pollera; nie zgaduj jej na podstawie nazwy hosta. Ścieżki i nazwy mogą być dostosowane. Zobacz [Układ plików](/pl/reference/file-layout/). Zapytaj RRDtool, kiedy plik był ostatnio zapisywany:

```bash
rrdtool last /path/to/rra/the_actual_file.rrd
rrdtool lastupdate /path/to/rra/the_actual_file.rrd
rrdtool fetch /path/to/rra/the_actual_file.rrd AVERAGE --start end-30m --end now
```

Znacznik czasu powinien przesuwać się do przodu przy udanych operacjach zapisu. Świeży znacznik czasu może nadal towarzyszyć nieznanej wartości, a buforowane operacje zapisu mogą opóźniać znacznik czasu na dysku. W przypadku `rrdcached` lub Boost sprawdź również stan opróżniania bufora tego komponentu.

**Wartość nie jest nieznana.** `lastupdate` pokazuje najnowsze dostarczone wartości; w przypadku liczników są to stany licznika, a nie obliczona przepustowość ruchu. Sprawdź zakończone wiersze z `fetch` pod kątem skończonych wartości liczbowych. Czas uruchomienia, wyrównanie kroków, heartbeat, granice i próg nieznanych danych w archiwum wpływają na to, kiedy pojawi się użyteczny wiersz. Nie diagnozuj usterki wyłącznie na podstawie pierwszych dwóch wierszy. Jeśli nieznane wartości utrzymują się, zbadaj zebrane wartości, typ źródła danych, heartbeat i błędy pollera.

## Typowe pierwsze problemy

| Objaw | Prawdopodobna przyczyna |
|---|---|
| Zapis powiódł się, ale zapytanie o opis systemu zgłasza błąd | Sprawdź poświadczenia, widok agenta i osiągalność kolektora; pusty opis sam w sobie nie jest wystarczającym dowodem |
| Błąd sesji SNMP z poziomu Kadupul, `snmpget` działa z laptopa | Różne ścieżki zapory sieciowej lub agent ogranicza dostęp według źródłowego adresu IP |
| Urządzenie widnieje jako nieaktywne, ale dane SNMP docierają | Dostępność ustawiona na ping ICMP, który nie może otworzyć surowego gniazda |
| Opis pojawia się, brak danych | Poller nie jest zaplanowany lub działa jako użytkownik niemający uprawnień do zapisu w katalogu RRD |
| Zapytanie o dane nie zwraca żadnych interfejsów | Widok agenta wyklucza tabelę interfejsów lub urządzenie wymaga ponownego indeksowania |
| Pierwsza wartość nieznana, potem poprawna | Normalne zjawisko dla licznika. Potrzebuje dwóch odczytów, aby wyliczyć przepustowość |
| Nieznane wartości utrzymują się | Nieudane zbieranie danych, nieprawidłowe wartości, niezgodność typu/granic, heartbeat lub normalizacja archiwum |
| Dane przez pewien czas, potem przerwy | Poller działa dłużej niż wynosi jego interwał lub urządzenie ogranicza tempo zapytań SNMP |
| Wartości z liczników są nieprawdopodobne | Wielokrotne przekroczenia zakresu 32 bitów, reset licznika, jednostki lub ustawienia źródła danych; użyj obsługiwanych liczników 64-bitowych na szybkich łączach |
| Wykresy interfejsów pokazują niewłaściwe porty po restarcie | Indeksy uległy przesunięciu. Zapytanie o dane potrzebuje metody ponownego indeksowania, która to zauważy |

Ostatni punkt warto zrozumieć, zanim będziesz zarządzać setką przełączników: indeksy interfejsów SNMP nie mają gwarancji stabilności po restarcie lub wymianie modułu. Metoda ponownego indeksowania w zapytaniu o dane dba o to, by wykres stale wskazywał ten sam port fizyczny. [Zapytania o dane i indeksy](/pl/concepts/data-queries-and-indexes/) wyjaśnia dostępne możliwości.

Gdy jedno urządzenie zbiera dane bez zakłóceń, dodaj pozostałe zbiorczo, a nie pojedynczo. [Automatyczne wykrywanie urządzeń](/pl/guides/discover-devices-automatically/) oraz narzędzia wiersza poleceń w [Narzędzia wiersza poleceń](/pl/reference/command-line-tools/) są znacznie szybsze niż pięćdziesięciokrotne powtarzanie kroków z tej strony.

Następny krok: [Odczytaj pierwszy wykres](/pl/start/first-graph/).
