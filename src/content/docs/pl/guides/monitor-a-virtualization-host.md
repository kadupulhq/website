---
title: Monitorowanie hosta wirtualizacji
description: Co hipernadzorca udostępnia przez SNMP, co jest dostarczane dla ESXi i dlaczego zliczanie maszyn gości, procesora i pamięci w zwirtualizowanym środowisku jest trudniejsze niż się wydaje.
banner:
  content: Kadupul jest w fazie przed-alfa. Należy zweryfikować te procedury w izolowanej instalacji testowej. To jest wersja robocza tłumaczenia, która oczekuje na weryfikację przez osobę biegle władającą językiem.
sidebar:
  order: 27
---

:::caution[Zweryfikuj przed użyciem]
Kod źródłowy jest dostępny, ale nie ma jeszcze oficjalnego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi przed ich
wdrożeniem. Zobacz [status projektu](/pl/project/status/).
:::

Dostarczony pakiet ESXi zbiera pomiary hosta i zlicza maszyny wirtualne (gości).
Nie zapewnia pomiarów procesora, pamięci ani rywalizacji (contention) w przeliczeniu na gościa. Sprawdź
obiekty udostępniane przez wersję Twojego hipernadzorcy przed wybraniem wykresów.

## Co zawiera instalacja

Dostarczany jest jeden szablon urządzenia dla hipernadzorcy: **ESXi Device**. Jest to pakiet urządzenia, więc
`install/templates/ESXi_Device.xml.gz` zawiera odpowiednie skrypty i pliki zapytań o dane.
Postępuj zgodnie z przewodnikiem [Importowanie i eksportowanie szablonów](/pl/guides/import-and-export-templates/) i sprawdź, czy
import został zakończony, łącznie z wdrożeniem plików. Wybierz szablon urządzenia,
przejrzyj wykrywanie i jawnie utwórz pożądane wykresy; zaimportowanie pakietu
lub samo przypisanie szablonu urządzenia nie tworzy ich automatycznie.

| Element | Przeznaczenie |
|---|---|
| `resource/snmp_queries/esxi_cpu.xml` | Wykrywa procesory i odczytuje obciążenie każdego procesora |
| `resource/snmp_queries/esxi_hw.xml` | Wykrywa komponenty sprzętowe i odczytuje ich stan |
| `resource/snmp_queries/interface.xml` | Standardowe zapytanie o statystyki interfejsów |
| `resource/script_server/host_disk.xml` | Zamontowane partycje, poprzez tabelę pamięci masowej Host Resources |
| `scripts/ss_esxi_vhosts.php` | Zawarty w `install/templates/ESXi_Device.xml.gz`; zlicza gości, uruchomionych gości i stan narzędzi gościa |
| `scripts/ss_multicpu_avg.php` | Uśrednia obciążenie wszystkich procesorów do jednej wartości |
| `scripts/ss_hstats.php` | Odczytuje statystyki odpytywania, które Kadupul już przechowuje dla urządzenia |
| `scripts/ss_host_disk.php` | Obsługuje zapytanie o partycje |

W tym wydaniu nie ma dedykowanego pakietu urządzeń dla Hyper-V, KVM/libvirt, Xen ani Proxmox.
Ogólne szablony Linux/Windows mogą obejmować metryki hosta obsługiwane przez ich
agentów; zbieranie danych specyficznych dla hipernadzorcy wymaga odpowiednich szablonów i modułów zbierających. Zobacz
[Napisz skrypt do zbierania danych](/pl/guides/write-a-data-collection-script/).

## Najpierw włącz agenta

Przejrzyj istniejącą konfigurację agenta i postępuj zgodnie z instrukcjami dla swojej wersji ESXi.
Uwagi do pakietu zawierają przywrócenie ustawień fabrycznych; nie jest to rutynowy warunek wstępny i
spowodowałoby usunięcie istniejącej konfiguracji SNMP. W przypadku konfiguracji opartej na community string poniższe
polecenia ustawiają wartości agenta; zastąp przykłady i zachowaj wymagane istniejące
społeczności podczas konfigurowania listy.

```bash
esxcli system snmp get
esxcli system snmp set -c YOUR_STRING
esxcli system snmp set -p 161
esxcli system snmp set -L "City, State, Country"
esxcli system snmp set -C noc@example.com
esxcli system snmp set -e yes
```

Pierwsze polecenie wyświetla konfigurację; ostatnie włącza agenta. Opcja community
zastępuje skonfigurowaną listę. Sprawdź wymagany dostęp w zaporze sieciowej z pollera
i zapoznaj się z [dokumentacją poleceń SNMP ESXCLI](https://developer.broadcom.com/xapis/esxcli-command-reference/latest/namespace/esxcli_system.html).
Polecenia te konfigurują odpytywanie oparte na community string; nie konfigurują SNMPv3.
Sprawdź łączność z maszyny, na której działa poller, przed dodaniem urządzenia.

```bash
snmpget  -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.1.1.0
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.2.1.25.3.3.1.2
snmpwalk -v2c -c YOUR_STRING esxi.example.net .1.3.6.1.4.1.6876.2.1.1.6
```

Jeśli pierwsze polecenie działa, a trzecie nic nie zwraca, zbadaj błąd SNMP,
politykę dostępu i obsługę agenta; samo puste przejście (walk) nie identyfikuje przyczyny. Dołączony
skrypt gości używa SNMPv1, więc udana próba v2c nie potwierdza jego ścieżki
zbierania danych. Puste przejścia dla gości zwracają wartości zerowe, a niekoniecznie przerwy na wykresach;
zobacz [błąd pustego wyniku](https://github.com/kadupulhq/kadupul/issues/245).

## Co udostępnia host

| Obszar | Poddrzewo | Co zapewnia |
|---|---|---|
| Procesory | `.1.3.6.1.2.1.25.3.3.1` | Obciążenie każdego procesora udostępnianego przez agenta |
| Komponenty sprzętowe | `.1.3.6.1.2.1.25.3.2.1` | Indeks, opis i stan komponentu |
| Pamięć masowa | `.1.3.6.1.2.1.25.2.3.1` | Magazyny danych i lokalne systemy plików, zgodnie z raportem agenta |
| Interfejsy | `.1.3.6.1.2.1.2` oraz `.1.3.6.1.2.1.31` | Ruch, błędy, stan |
| Inwentarz gości | `.1.3.6.1.4.1.6876` | Stan zasilania i narzędzi dla każdego gościa |

Pierwsze cztery to standardowe tabele Host Resources i interfejsów, te same, na które odpowiada
host z systemem Linux. Zobacz [Monitorowanie serwera Linux](/pl/guides/monitor-a-linux-server/),
aby dowiedzieć się, jak się zachowują i którą tabelę dysków preferować.

Piąte to poddrzewo producenta używane przez dostarczony skrypt zliczania gości.

## Szablony wykresów

| Wykres | Źródło | Co odczytuje |
|---|---|---|
| ESXi - CPU | Zapytanie o dane | Obciążenie jednego wykrytego procesora |
| ESXi - MultiCPU Average | Skrypt | Średnia obciążenia wszystkich procesorów |
| ESXi - Hardware | Zapytanie o dane | Stan jednego wykrytego komponentu |
| ESXi - VHosts | Skrypt | Liczba gości i stan narzędzi gościa |
| Host MIB - Processes | Stałe OID | Liczba procesów na hoście |
| Host MIB - Logged in Users | Stałe OID | Liczba zalogowanych sesji na hoście |
| Device - Uptime | Skrypt | Uptime zarejestrowany ostatnio przez Kadupul |
| Device - Polling Time | Skrypt | Czas potrzebny Kadupul na odpytanie tego urządzenia |
| Wykresy interfejsów | Zapytanie o dane | Ruch, błędy, pakiety, stan na interfejs |

Zapytanie o procesory odczytuje obciążenie dla każdego wykrytego wpisu. Nie zakładaj, że liczba
jego wierszy odpowiada wątkom sprzętowym hosta: spakowany wzorzec indeksu akceptuje tylko
jedno- lub dwucyfrowe indeksy i odrzuca 100 lub większe, nawet na hoście z niewielką liczbą procesorów.
Porównaj wykrywanie z surowym przejściem; zobacz [błąd indeksu CPU](https://github.com/kadupulhq/kadupul/issues/246).
Skrypt średniej niezależnie sprawdza obciążenia procesorów i uśrednia zwrócone wiersze.

Device - Uptime i Device - Polling Time odczytują zapisany rekord urządzenia w Kadupul.
Moduł pomocniczy czasu pracy zwraca zapisaną wartość SNMP bez ekstrapolacji upływającego czasu;
czas odpytywania opisuje pracę zbierania danych przez Kadupul. Stara zapisana wartość nie dowodzi
bieżącej dostępności. Jeśli zbieranie ustanie, skrypty te nie generują nowych próbek.

## Problemy ze zliczaniem

To jest część, która odróżnia wirtualizację od serwera fizycznego, i niczego
z tego nie rozwiązuje sam szablon wykresu.

**Maszyny gości przemieszczają się.** Gość migrujący na inny host znika z inwentarza pierwszego
i pojawia się na drugim. Próbki pobrane w różnych momentach mogą tymczasowo
podwójnie zliczyć lub pominąć tego gościa. Same zmiany liczby nie dowodzą migracji: użyj
identyfikatorów inwentarza hipernadzorcy i zdarzeń, aby je wyjaśnić.

**Zasoby są współdzielone, więc przypisanie per gość jest szacunkiem.** Host raportuje
fizyczne obciążenie procesora. Nie zgłasza, który gość je spowodował. Dzielenie procesora hosta
przez liczbę gości daje liczbę poprawną arytmetycznie, która nie odpowiada na żadne sensowne pytanie.

**Overcommit sprawia, że alokacja i użycie to różne wielkości.** Przypisane wirtualne procesory
mogą przekraczać rdzenie fizyczne, a przydzielona pamięć może celowo przekraczać pamięć fizyczną. Wykres
przypisanych zasobów opisuje alokację, a nie zmierzone zapotrzebowanie.
Porównaj go z pojemnością fizyczną, skonfigurowanymi limitami i rzeczywistym użyciem.

**Rywalizacja (contention) nie pojawia się w tych tabelach.** Pomiary informujące o tym, że gość
jest głodzony – czas oczekiwania na fizyczny procesor i pamięć odzyskana przez hosta –
nie znajdują się w danych zbieranych przez ten szablon. Host z 60% obciążenia
procesora z gośćmi w stanie ostrej rywalizacji wygląda tutaj identycznie jak host z 60% obciążenia
z bezproblemowo działającymi gośćmi.

**Pomiary gościa i hosta odpowiadają na różne pytania.** Samo wykorzystanie zasobów przez gościa
może nie wyjaśniać opóźnień w szeregowaniu zadań przez hosta. Skorelować pomiary aplikacji/gościa
ze wskaźnikami rywalizacji hipernadzorcy, zamiast wyprowadzać przypisanie z ogólnego obciążenia hosta.

### Co należy zrobić zamiast tego

| Pytanie | Gdzie znajduje się odpowiedź |
|---|---|
| Czy host jest nasycony | Obciążenie procesora hosta, bezpośrednio z hosta |
| Czy gość jest nasycony | Wewnątrz gościa, plus metryka rywalizacji przechowywana przez hipernadzorcę |
| Ilu gości jest uruchomionych | Inwentarz maszyn gości hosta, jako liczba |
| Czy środowisko przekracza pojemność | Nie z tych wykresów. Wymaga danych alokacji, których host nie ujawnia |
| Czy gość zmienił hosta | Identyfikatory inwentarza hipernadzorcy i zdarzenia migracji; same skoki liczbowe to za mało |

Monitoruj gości jako ich własne urządzenia dla wszystkiego, co dotyczy gościa, i monitoruj hosta
dla wszystkiego, co dotyczy hosta. Wystrzegaj się tworzenia wykresów per gość na podstawie liczb na poziomie hosta:
są one pochodne, sprawiają wrażenie miarodajnych i są błędne w sposób, którego nikt później nie zdoła wykryć.

## Pułapki w dostarczonym zliczaniu gości

Skrypt inwentaryzacji gości warto zrozumieć przed zaufaniem jego danym wyjściowym.

**Wykonuje przejście wyłącznie za pomocą SNMP w wersji 1 i ciągu community.** Wersja jest na stałe
ustawiona w skrypcie, a poświadczenia v3 urządzenia nie są przekazywane. Urządzenie skonfigurowane dla
v3 może zbierać dane innymi ścieżkami, podczas gdy zbieranie gości kończy się niepowodzeniem. Zbieranie gości może
nadal zakończyć się sukcesem, jeśli ten agent niezależnie akceptuje zapisaną społeczność przez v1;
wybór v3 na urządzeniu sam w sobie nie decyduje o wyniku. Puste przejścia gości
są zwracane jako zera. Zbadaj tę rozbieżność protokołów bez obniżania zasad bezpieczeństwa
agenta na rzecz skryptu pomocniczego.

**Liczba pochodzi z tabeli stanu zasilania.** Liczba zgłoszona jako suma gości
to liczba wpisów zwróconych przez przejście poddrzewa stanu zasilania, a nie
osobnego obiektu inwentarza. Gość, którego host wymienia, ale który nie ma wpisu stanu zasilania,
nie jest liczony.

**Stan uruchomienia jest dopasowywany na podstawie tekstu.** Po przycięciu spacji i zamianie na małe litery
tylko `powered on` i `poweredon` zwiększają licznik uruchomionych maszyn. Inne reprezentacje
tego nie robią; porównaj surową odpowiedź agenta przed interpretacją zera.

**Klasyfikacja narzędzi gościa ma potwierdzoną wadę.** Dosłowny ciąg `not installed`
jest liczony jako działający, ponieważ dopasowanie rozpoczyna się od pozycji zero. Nierozpoznany tekst
również kwalifikuje się jako uruchomiony. Nie traktuj tej liczby jako dowodu sprawnego działania narzędzi;
zobacz [błąd stanu narzędzi](https://github.com/kadupulhq/kadupul/issues/244).

**Wykonuje trzy przejścia na wywołanie.** Odczytuje tabelę stanu zasilania dwukrotnie, a następnie tabelę
narzędzi, więc nawet jego własne zliczenia nie są atomową migawką inwentarza. Na hoście
z wieloma gośćmi należy zmierzyć ten koszt zbierania danych. Jeśli poller ma mało zasobów, jest to kandydat na dłuższy interwał,
zanim pomyślisz o większej liczbie wątków. Zobacz [Skalowanie pollera](/pl/guides/scale-the-poller/).

Skrypt zwykle emituje wszystkie pięć nazwanych wartości, w tym zera dla pustych przejść.
Nieudane przejście może zatem dać syntaktycznie kompletną, ale wprowadzającą w błąd próbkę.
W przypadku niekompletnych danych wyjściowych procesor PHP sprawdza pola wymagane przez
powiązane źródło danych i wstrzymuje niekompletne grupy sygnatur czasowych; niekoniecznie
odrzuca je natychmiast. Zobacz [Pamięć podręczna pollera](/pl/concepts/the-poller-cache/).

## Pułapki w pozostałych kwestiach

**Średnia procesorów ukrywa asymetrię.** Host z jednym przeciążonym rdzeniem i 63 bezczynnymi
daje niską średnią. Zachowaj zweryfikowane wykresy dla poszczególnych procesorów tam, gdzie ma to znaczenie. Pomocniczy
skrypt średniej zwraca również `load:0` dla pustego przejścia, co jest nie do odróżnienia od zmierzonego bezczynnego CPU;
skoreluj to ze statusem zbierania danych i znanym błędem pustego wyniku.

**Indeksy procesorów są pozycyjne.** Są wykrywane przez przeszukiwanie tabeli
procesorów. Jeśli indeksy agenta ulegną zmianie, zweryfikuj mapowania tożsamości przed zaufaniem ciągłości danych.
Ograniczenie do jednej lub dwóch cyfr w pakiecie to osobna usterka wykrywania.

**Wpisy pamięci masowej to wszystko, co agent nazywa pamięcią masową.** Spodziewaj się magazynów danych wymieszanych z
niepożądanymi elementami, w jednostkach alokacji wymagających mnożenia. Jest to standardowe
zachowanie Host Resources, a nie anomalia ESXi. Zweryfikuj zbuforowane jednostki alokacji przed
interpretacją bajtów; współdzielony skrypt zawiera [znany błąd konwersji](https://github.com/kadupulhq/kadupul/issues/243)
dla nieprawidłowych ujemnych próbek lub brakujących mnożników.

**Nazwy interfejsów na hipernadzorcy są stabilne, dopóki się nie zmienią.** Aktualizacja sterownika lub
rekonfiguracja może zmienić ich numerację. Zobacz [Monitorowanie przełącznika](/pl/guides/monitor-a-switch/),
aby dowiedzieć się, jak wybierany jest indeks i dlaczego ma to znaczenie.

**Skrypty działają na hoście pollera.** Same łączą się z hipernadzorcą, używając
identyfikatora urządzenia przekazanego przez polecenie w pamięci podręcznej. Skrypty gości i średniej CPU pobierają
bieżący wiersz urządzenia przy każdym wywołaniu; zmiana community nie wymaga przebudowy
tych argumentów polecenia. Inne moduły zbierające mogą osadzać poświadczenia w swoich zadaniach.
Zobacz [Pamięć podręczna pollera](/pl/concepts/the-poller-cache/).

## Typowe usterki

| Symptom | Zwykła przyczyna |
|---|---|
| Zbierane jest wszystko oprócz liczby gości | Urządzenie jest skonfigurowane dla SNMPv3, a skrypt gości obsługuje v1 |
| Liczba gości poprawna, liczba uruchomionych wynosi zero | Sprawdź dokładny tekst stanu zasilania i czy drugie przejście się powiodło |
| Liczba gości spada do zera i wraca do normy | Sprawdź nieudane/puste przejścia; moduł może wyemitować pełną linię zer |
| Wykresy procesora znikają po zmianie sprzętowej | Sprawdź zmienione indeksy i ograniczenie do indeksów jedno- lub dwucyfrowych |
| CPU hosta płaskie i niskie, podczas gdy goście działają wolno | Sprawdź błędy zbierania danych i rywalizację; puste przejście średniej daje zero |
| Wykresy magazynów danych obejmują niechciane partycje | Agent raportuje je jako pamięć masową |
| Wykres czasu pracy wygląda niepoprawnie po awarii pollera | Raportuje ostatnią wartość zarejestrowaną przez Kadupul, a nie odczyt na żywo |
| Całkowita liczba gości na hostach skacze podczas prac konserwacyjnych | Migrujący goście są krótko liczeni podwójnie lub wcale |
