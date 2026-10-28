---
title: Skalowanie pollera
description: Co zmienić, gdy zbieranie danych przestaje mieścić się w swoim interwale, i jak ustalić, który limit został faktycznie osiągnięty.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 6
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Skalowanie pollera sprowadza się do jednego pytania: czy przebieg zbierania danych
kończy się przed rozpoczęciem kolejnego? Wszystko poniżej służy odpowiedzi na to pytanie
i przywróceniu stanu, w którym odpowiedź brzmi: tak.

Przeczytaj najpierw rozdział [Architektura](/pl/concepts/architecture/), jeśli nie jest dla
Ciebie jasne, która część odpowiada za zbieranie danych.

## Dwa zegary

Istnieją dwa interwały i nie oznaczają one tego samego ustawienia.

| | Czym jest | Dozwolone wartości |
|---|---|---|
| Interwał launchera | Jak często system operacyjny uruchamia kolektor, z crona lub usługi `cactid` | 60 lub 300 sekund |
| Interwał pollera | Bazowa częstotliwość zbierania; kroki poszczególnych źródeł danych mogą być dłuższe | 10, 15, 20, 30, 60 lub 300 sekund |

Gdy interwał pollera jest krótszy niż interwał launchera, jedno uruchomienie wykonuje
kilka przejść zbierania danych w pętli. Liczba przejść to interwał launchera podzielony
przez interwał pollera.

Budżet czasowy na całe uruchomienie wynika z tych dwóch liczb: liczba przejść pomnożona
przez interwał pollera, minus dwie sekundy. To jest rzeczywisty czas zegarowy, względem
którego mierzony jest przebieg.

## Co się dzieje, gdy przebieg przekroczy czas

Trzy różne zjawiska, które generują trzy różne linie dziennika.

**Przebieg zostaje przerwany.** Gdy upływający czas przekroczy budżet, poller zapisuje
w dzienniku informację o przekroczeniu maksymalnego czasu wykonania, zapisuje swoje
statystyki i kończy działanie. Zadania, które nie zdążyły wygenerować próbki, mogą pozostawić
lukę. Próbki przyjęte już do trwałej kolejki mogą pozostać w stanie oczekiwania na późniejszy
pomyślny zapis RRD; przekroczenie czasu nie oznacza, że każdy niezrzucony pomiar został
odrzucony. Sprawdź głębokość kolejki oraz dzienniki równolegle z wykresem i nie czyść
zachowanych wierszy tylko po to, aby kolejny przebieg wyglądał na czysty.

**Kolejny przebieg zauważa pozostałości.** Przy starcie poller zlicza wiersze procesów,
które nigdy nie zostały zamknięte, i ostrzega o wykryciu procesów przekraczających cykl
odpytywania. Zbadaj niedokończone lub nieaktualne rekordy procesów oraz rzeczywiście działające
procesy potomne; samo ostrzeżenie nie wskazuje wąskiego gardła.

**Zegary się rozjeżdżają.** Jeśli od ostatniego przebiegu minęło więcej czasu, niż pozwala
na to budżet, poller ostrzega, że launcher utracił synchronizację z interwałem pollera.
Zwykle odpowiada za to launcher, a nie poller: wpis cron o niewłaściwej częstotliwości,
zatrzymana usługa lub uśpiony host.

Te ścieżki wywołują mechanizm powiadomień administratora. Doręczenie zależy od skonfigurowanych
odbiorców, ustawień powiadomień oraz sprawnego transportu poczty; ostrzeżenie w dzienniku
nie dowodzi, że wiadomość e-mail dotarła. Zobacz [Powiadomienia e-mail](/pl/guides/send-email-notifications/).

Istnieje czwarty przypadek, który nie jest przekroczeniem czasu. Jeśli poller zostanie uruchomiony
ponownie wcześniej, niż się spodziewał, rejestruje w dzienniku, że jest skonfigurowany do zbyt
częstego uruchamiania, i kończy działanie bez zbierania danych. Opcja `--force` omija ten
sprawdzian czasu; używaj jej wyłącznie podczas kontrolowanej diagnostyki przy wstrzymanych
uruchomieniach planowanych i ręcznych. Nie zwiększa ona wydajności ani nie czyni nakładających
się operacji bezpiecznymi.

## Linia statystyk

Każdy zakończony przebieg zapisuje do dziennika jedną linię statystyk. Zawiera ona czas trwania,
metodę zbierania, liczbę procesów i wątków, liczbę urządzeń, liczbę urządzeń na proces,
źródła danych oraz przetworzone pliki RRD.

Obserwuj trendy czasu trwania, opóźnień skrajnych (tail latency), głębokości kolejki oraz nieudanych
aktualizacji. Zbadaj nawet pojedynczy przebieg bliski limitu budżetu, gdy powoduje on luki; trwały
wzrost pomaga zidentyfikować moment, w którym pojemność lub charakter zbierania danych wymagają zmian.

## Procesy i wątki

Dwa pokrętła, które realizują różne zadania.

| Pokrętło | Jednostka pracy, którą dzieli | Który kolektor go używa |
|---|---|---|
| Procesy | Urządzenia, podzielone na ciągłe zakresy identyfikatorów urządzeń | Oba |
| Wątki | Elementy w ramach jednego urządzenia | Tylko Spine |

Konsekwencja jest punktem, na którym wielu się potyka: **do procesu przypisywane są całe
urządzenia.** Urządzenie z pięcioma tysiącami źródeł danych nie może zostać rozdzielone między
procesy. Trafia do jednego procesu i ten proces trwa tyle, ile musi. Dodanie procesów nic tu nie pomoże.

Obie wartości są przechowywane dla każdego kolektora danych, a nie globalnie. Wartości na stronie
ustawień to szablony stosowane podczas tworzenia nowego kolektora danych. Zmiana szablonu nie
modyfikuje istniejącego kolektora.

Istnieje także liczba wątków przypadająca na urządzenie, która określa podział pojedynczego dużego
urządzenia. Dotyczy ona wyłącznie kolektora w C.

Balance Process Load wykorzystuje skumulowaną liczbę elementów do wyznaczania granic między
całymi urządzeniami w kolejności ich identyfikatorów. Nie dzieli pojedynczego urządzenia ani nie
gwarantuje równej liczby elementów, a liczba elementów nie jest tożsama z czasem wykonania.
Porównaj czasy procesów przed i po włączeniu tej opcji na izolowanym, reprezentatywnym obciążeniu.

## Kolektor PHP a kolektor C

Kolektor PHP, `cmd.php`, jest dostarczany z aplikacją. Kadupul planuje utrzymywać forka
projektu Spine, lecz lokalizacja jego źródeł oraz zweryfikowane kompilacje nie zostały jeszcze
udokumentowane. Używaj PHP, dopóki dowody te nie będą dostępne. Poniższe porównania Spine,
ustawienia wątków i polecenia opisują odziedziczone zachowanie, a nie gotowe lub wspierane wdrożenie Kadupul.

| | Kolektor PHP | Spine |
|---|---|---|
| Zrównoleglenie | Tylko procesy | Procesy i wątki |
| Ustawienie wątków | Wymuszone na 1 bez względu na konfigurację | Honorowane |
| Serwer skryptów | Jeden na proces, brak możliwości konfiguracji | Od 1 do 15 na proces, konfigurowalny |
| Limit czasu skryptu | Niestosowany | Stosowany, domyślnie 25 sekund |
| Instalacja | Dostarczany z kodem | Planowany fork; brak udokumentowanej zweryfikowanej kompilacji |

Wymuszoną liczbę wątków warto ująć jednoznacznie: jeśli kolektor jest ustawiony na PHP, zmienna
wykonawcza wątków jest ustawiana na 1; nie nadpisuje to zapisanego ustawienia wątków kolektora.
Skalowanie kolektora PHP może wymagać większej liczby procesów, a wskazówka w kodzie źródłowym
zaleca utrzymanie ich liczby na poziomie nieprzekraczającym dwukrotności liczby rdzeni procesora.

Konfiguracja Spine oraz zachowanie poleceń wymagają walidacji względem konkretnego ocenianego
pliku binarnego. Sam kod źródłowy aplikacji PHP nie dowodzi kolejności wyszukiwania konfiguracji,
obsługi wątków ani efektów ubocznych.

Odziedziczone przykłady dla izolowanej oceny Spine, a nie zweryfikowane polecenia Kadupul:

```sh
spine --first=42 --last=42 --threads=1 --verbosity=HIGH --stdout
spine --hostlist='42,43,51' --readonly
```

Opcja `--readonly` ma na celu uniknięcie zapisu wyników. Nadal łączy się ona z urządzeniami
i wykonuje skrypty zbierające; sprawdź najpierw jej efekty uboczne w izolowanym teście.

## Połączenia z bazą danych

Wątki nie są darmowe. Każdy wątek Spine utrzymuje własne połączenie z bazą danych, podobnie
jak każdy serwer skryptów.

```
estimated worker connections = processes * (threads + script_servers)
```

Jest to szacunek z pomocy ustawień aplikacji, a nie zmierzona górna granica. Zsumuj tę wartość
dla wszystkich kolektorów i dodaj rezerwę na procesy nadrzędne pollera, żądania internetowe,
konserwację oraz innych klientów. Zmierz rzeczywiste szczytowe wartości oraz odrzucone połączenia
przed ustaleniem limitu bazy danych; jego zwiększenie również zużywa zasoby.

Wyczerpanie połączeń może skutkować brakiem próbek, lecz rotacyjne luki w danych nie stanowią
jednoznacznej diagnozy. Potwierdź to za pomocą wskaźników połączeń bazy danych i błędów aplikacji.

## Odroczone zapisy RRD

Dostępny jest tryb, który powstrzymuje poller przed zapisywaniem do plików RRD przy każdym przebiegu.
Wyniki gromadzą się zamiast tego w tabeli bazy danych i są zrzucane zbiorczo – według harmonogramu
czasowego lub gdy wykres zażąda pliku. Zastępuje to dużą liczbę małych zapisów małą liczbą dużych operacji.

Dwa fakty o kluczowym znaczeniu operacyjnym:

- Tryb ten jest wymagany w przypadku posiadania zdalnych kolektorów danych. To nie porada,
  lecz warunek stawiany przez oprogramowanie.
- Tabela buforowa jest trwała, a nie w pamięci RAM, więc niezrzucone próbki przetrwają restart.
  Oznacza to również, że Twoje pliki RRD pozostają w tyle za bazą danych. Zobacz
  [Kopia zapasowa i przywracanie](/pl/guides/back-up-and-restore/) przed wykonaniem migawki.

Główna bieżąca kolejka `poller_output` w tej wersji również korzysta z silnika InnoDB. Wstępna
weryfikacja magazynu odrzuca kolejkę typu MEMORY; podniesienie limitu tabel pamięciowych nie
rozwiązuje tej odmowy. Przy zatrzymanych producentach danych i zachowanej spójnej kopii zapasowej
przekonwertuj odziedziczoną nieodpowiednią kolejkę jawnie, a następnie sprawdź stan pamięci
masowej pod każdym kontem usługowym:

```sh
php cli/upgrade_database.php --migrate-poller-queue
php cli/upgrade_database.php --check-rrd-storage
```

Są to niezależne operacje. Zachowaj oczekujące wiersze i monitoruj ilość wolnego miejsca na dysku
bazy danych oraz wiek kolejki obok liczby wierszy. Zobacz [Bezpieczna aktualizacja](/pl/guides/upgrade-safely/)
w celu zapoznania się z doborem kolejek, weryfikacją zaufania kont usługowych i warunkami restartu.

## Kiedy przejść na zdalne kolektory

Zdalny kolektor danych to druga maszyna uruchamiająca ten sam kod z innym identyfikatorem kolektora,
odpytująca podzbiór urządzeń i przesyłająca wyniki z powrotem do centralnej bazy danych.

Przejdź na zdalny kolektor, gdy wąskie gardło znajduje się po stronie zbierania, a nie po stronie zapisu:

- Procesor hosta pollera jest nasycony podczas przebiegu i bezczynny między przebiegami.
- Czas podróży pakietu (RTT) do grupy urządzeń dominuje czas przebiegu, a grupa ta znajduje się
  za pojedynczym łączem.
- Lokalizacja znajduje się na odległym końcu sieci WAN, przez którą nie chcesz bezpośrednio odpytywać.
- Wymagane jest zbieranie danych w odizolowanym oddziale, a przed wdrożeniem zweryfikowano buforowanie
  offline i procedurę odzyskiwania dla danego kolektora.

Zdalne kolektory nie znoszą ograniczeń centralnej bazy danych ani limitów zapisu RRD. Zmierz centralną
przepustowość przyjmowania i zrzutu danych przed zwiększeniem tempa zbierania; dodatkowi producenci
mogą jedynie powiększyć istniejące zaległości.

Każdy kolektor ma własną liczbę procesów i wątków, własne poświadczenia bazy danych oraz interwał
synchronizacji, który domyślnie wynosi dwie godziny. Narzędzie wiersza poleceń umożliwia wymuszenie
pełnej synchronizacji zamiast oczekiwania.

Instalacja centralna może replikować kod serwisu WWW i wtyczek do zdalnych kolektorów, aby aktualizowały
się one samoczynnie. Tę replikację można wyłączyć, jeśli kod jest wdrażany inną metodą.

## Jaki limit został osiągnięty

Skorzystaj z tej tabeli, aby sformułować hipotezy, a następnie zweryfikuj je za pomocą dzienników
i pomiarów. Wiele limitów może występować jednocześnie. Opcje Spine pozostają tutaj niezweryfikowane.

| Obserwacja | Limit | Co zmienić |
|---|---|---|
| Ostrzeżenie o braku synchronizacji launchera, poller poza tym szybki | Opóźnienie harmonogramu, wcześniejsze przekroczenie czasu lub przerwa w pracy hosta | Zbadać historię uruchomień i stan procesów |
| Czas przebiegu stabilny, jedno urządzenie stale spóźnione | Powolne odpowiedzi, obciążające skrypty lub skumulowana praca | Zmierzyć metody wejściowe i przejrzeć limity czasu/ponowień |
| Czas przebiegu skaluje się z liczbą urządzeń, procesor nasycony | Obciążenie procesora przez kolektor | Zmierzyć, czy dodatkowe procesy pomagają; rozważyć rozmieszczenie kolektorów |
| Czas przebiegu skaluje się z liczbą urządzeń, procesor bezczynny | Oczekiwanie na sieć, skrypty lub bazę danych | Zmierzyć źródła opóźnień przed zmianą współbieżności |
| Brakujące próbki na rotacyjnym zbiorze urządzeń | Połączenia, limity czasu lub inne awarie zbierania | Sprawdzić błędy, metryki połączeń i zachowane kolejki |
| Czas przebiegu poprawny, zapisy RRD powolne, dysk zajęty | Pamięć masowa | Odroczone zapisy RRD lub szybszy dysk |
| Wszystko działa powolnie, włącznie z interfejsem WWW | Baza danych | Rozmiar bufora (buffer pool), następnie maszyna bazy danych |

Dwie pułapki warte odnotowania.

**Zmiana bazowego interwału to nie to samo, co zmiana kroku każdego źródła danych.**
Dostosuj profile, zapisane w pamięci podręcznej kroki elementów oraz definicje kroku i heartbeat RRD.
Przebudowa pamięci podręcznej nie przekształca istniejących plików RRD. Zobacz
[Retencja danych](/pl/guides/manage-data-retention/) oraz
[Czas i interwały](/pl/concepts/time-and-intervals/).

**Krótszy interwał multiplikuje wszystko.** Przejście z 300 sekund na 60 nie czyni pracy
pięciokrotnie tańszą. Źródła skonfigurowane na szybszy cykl są odpytywane częściej; źródła
zachowujące dłuższe kroki nie muszą działać przy każdym przebiegu bazowym. Zmierz wynikowe
obciążenie zamiast zakładać, że każde przejście wymaga tyle samo pracy.
