---
title: Zdalne zbieranie danych
description: Dlaczego zbieranie danych jest dystrybuowane, a przechowywanie nie, czym zarządza zdalny kolektor i ile kosztuje posiadanie drugiej kopii konfiguracji.
banner:
  content: Kadupul jest w wersji pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej.
sidebar:
  order: 9
---

:::caution[Odziedziczone zachowanie serwera proxy RRDtool]
Wdrożenie serwera proxy RRDtool nie jest obsługiwane w Kadupul. Użyj lokalnego magazynu RRDtool
(`storage_location = 0`). Ustawienia proxy, opisy protokołów i przepływy pracy na tej stronie
dokumentują odziedziczone zachowanie, a nie obsługiwaną ścieżkę wdrożenia lub migracji.
Zobacz [Proxy RRDtool](/pl/reference/rrdproxy/).
:::

Zbieranie danych to część, która nie mieści się na jednej maszynie. Większość przebiegu odpytywania
upływa na oczekiwaniu na odpowiedź urządzeń, a oczekiwania nie da się skompresować. Można nałożyć na
siebie więcej tego czasu przy użyciu większej liczby procesów i wątków, aż do momentu, gdy host
zbierający wyczerpie zasoby procesora lub czas podróży pakietu (round-trip) do odległej lokalizacji
zdominuje całość operacji.

Zdalny kolektor to ten sam kod z innym identyfikatorem kolektora, odpytujący podzbiór urządzeń. Każde
urządzenie wskazuje kolektor odpowiedzialny za jego obsługę. To przypisanie stanowi standardowy
podział harmonogramu. Utrzymuj spójność przypisania urządzeń i replikowanej pamięci podręcznej pollera;
ten wybór harmonogramu nie dowodzi, że każdy zapis wyniku wymusza własność kolektora.

W kwestii tego, *kiedy* sięgnąć po kolektor, zobacz
[Skalowanie pollera](/pl/guides/scale-the-poller/). Ta strona wyjaśnia, czym kolektor w istocie jest.

## Dlaczego kolektor posiada własną bazę danych

Kolektor, który odczytuje listę zadań z centralnej bazy danych przez sieć, przestaje zbierać dane,
gdy zawiedzie łączność sieciowa. To dokładne przeciwieństwo celu, dla którego wdrożono zdalny kolektor.

Dlatego posiada lokalną bazę danych zawierającą własną kopię konfiguracji: ustawienia, szablony,
metody wprowadzania danych, zapytania o dane, swoją część pamięci podręcznej pollera, swoje urządzenia,
konfigurację wtyczek oraz tabele użytkowników i uprawnień. Ta kopia jest przesyłana z głównej
instalacji. Traktuj główną instalację jako autorytet konfiguracyjny, podczas gdy kolektor utrzymuje
lokalny stan operacyjny i ustawienia maszyny.

Ustawienia ścieżek są wykluczone z kopii, podobnie jak statystyki poszczególnych przebiegów, które
główna instalacja zachowuje dla siebie. Ścieżki są właściwościami konkretnej maszyny, a nie całej
instalacji.

## Replikacja jest okresowa, więc konfiguracja ma opóźnienia

Główny poller sprawdza włączone zdalne kolektory z nielokalnym hostem bazy danych i niezerowym
interwałem synchronizacji. Kolektor kwalifikuje się do synchronizacji, jeśli nigdy nie był
synchronizowany, upłynął jego interwał lub jest oznaczony jako wymagający synchronizacji. Zerowy
interwał wyklucza go z tej okresowej kontroli, nawet jeśli wymaga synchronizacji.

Globalna wartość domyślna to dwie godziny; kolektor może mieć własny interwał. Nie gwarantuje to, że
każda zmiana czeka dwie godziny: operacje na urządzeniach i wtyczkach mają również ukierunkowane
ścieżki replikacji. Pomyślna propagacja zależy od danej operacji, łączności i wybranych tabel.
Sprawdź rzeczywistą konfigurację i pamięć podręczną kolektora, zamiast zakładać natychmiastową
spójność lub stałe opóźnienie.

Pełną replikację można wywołać z głównego kolektora za pomocą `php cli/poller_replicate.php`, gdy
skonfigurowane są włączone zdalne kolektory. Replikuje ona każdy włączony zdalny kolektor, chyba że
opcja `--poller=N` wybiera jeden konkretny.
Zobacz [Skalowanie pollera](/pl/guides/scale-the-poller/) oraz
[Migracja na nowy sprzęt](/pl/guides/migrate-to-new-hardware/) w celu uzyskania kontekstu operacyjnego.

## Trzy tryby połączenia

Kolektor decyduje podczas uruchamiania o swoim zachowaniu na podstawie tego, czy centralna baza danych
odpowiada i czy przechowuje próbki, które nie zostały jeszcze dostarczone.

| Tryb | Warunek | Zachowanie |
|---|---|---|
| Online | Centralna baza łączy się i nie wykryto lokalnych zaległości Boost | Zapisy wyników trafiają do centralnej bazy danych |
| Offline | Połączenie centralne kończy się niepowodzeniem lub jest wymuszone | Zbieranie korzysta z lokalnego buforowania, jeśli lokalne usługi działają poprawnie |
| Odzyskiwanie | Centralna baza łączy się i pozostają lokalne wiersze Boost | Nowe próbki pozostają lokalne, podczas gdy proces w tle przesyła zaległości |

Tryb offline nie jest stanem błędu. Jest to zamierzone zachowanie kolektora, którego łącze zostało
zerwane, i jest powodem, dla którego kolektor w ogóle posiada lokalną bazę danych. Zbieranie trwa
w oparciu o konfigurację dostępną lokalnie. Pojemność lokalnej bazy danych, dostęp do urządzeń,
sprawność harmonogramu i poprawne poświadczenia są nadal wymagane; tryb offline nie gwarantuje
nieprzerwanego zbierania danych ani ich ostatecznego dostarczenia.

## Jak wyniki docierają do głównej instalacji

Wyniki nie przemieszczają się jako zapisy do plików RRD. Przemieszczają się jako wiersze bazy danych.

Odłożony zapis do RRD jest wymagany w przypadku obecności więcej niż jednego kolektora, a dodanie
włączonego zdalnego kolektora powoduje włączenie odłożonych aktualizacji przez główny poller. Ścieżka
uruchamiania włącza również buforowanie Boost i przekierowywanie, gdy istnieje wiele rekordów
kolektorów. Ustawienia te same w sobie nie potwierdzają poprawności wdrożenia.
Zobacz [Zapisy o dużej objętości](/pl/concepts/high-volume-writes/), aby dowiedzieć się, co robi ten tryb.

W trybie online kolektor wstawia swoje próbki bezpośrednio do centralnej tabeli bufora. Główna
instalacja zapisuje je do plików RRD według własnego harmonogramu, dokładnie tak samo, jak w przypadku
próbek zebranych samodzielnie. Próbki kolektora po dotarciu nie są traktowane w żaden specjalny sposób.

W trybie offline i podczas odzyskiwania próbki gromadzą się w lokalnej kolejce Boost. Gdy centralna baza
danych stanie się ponownie dostępna, skrypt `poller_recovery.php` wstawia zbuforowane wiersze do
centralnej kolejki Boost, aktualizując dane wyjściowe wiersza, który już tam istnieje.

Odzyskiwanie usuwa lokalny wiersz dopiero po pomyślnym wstawieniu jego pakietu do centralnej bazy i
tylko wtedy, gdy lokalny wiersz nadal odpowiada temu, co wysłano. Nieudane wstawienie, zbyt duża próbka
lub wiersz zmodyfikowany podczas czyszczenia pozostawia lokalne próbki na miejscu do następnej próby.
Ta strona nie określa w pełni zwalidowanej procedury odzyskiwania dla wielu kolektorów.

Wstawienia odzyskiwania przenoszą identyfikatory źródeł danych, nazwy, znaczniki czasu i wartości;
nie sprawdzają tych wierszy pod kątem przypisań kolektorów. Nie należy polegać na powszechnym
odrzucaniu przekazań w celu ochrony przed nieaktualnymi przypisaniami lub nakładającymi się
producentami. Przed włączeniem zbierania sprawdź przypisania i stan pamięci podręcznej.

## Przechowywanie danych nie podlega dystrybucji

Odziedziczony przepływ pracy oparty na proxy utrzymuje pliki RRD centralnie i zakłada, że kolektory
uzyskują do nich dostęp za pośrednictwem serwera proxy RRDtool. Ten przepływ pracy nie jest obsługiwany
w Kadupul; nie należy traktować go jako wytycznych wdrożeniowych. Zwalidowana ścieżka przechowywania dla
wielu kolektorów przy użyciu lokalnego RRDtool musi zostać udokumentowana przed zaleceniem zamiennika.

To jest kwestia, która najczęściej zaskakuje administratorów, dlatego warto postawić sprawę jasno:
**Zdalne kolektory dystrybuują oczekiwanie, a nie zapisywanie.** Jeśli napotkanym wąskim gardłem był
dysk pod drzewem plików RRD, dodatkowa pojemność zbierania danych nie eliminuje tego ograniczenia.
Większa liczba przychodzących próbek może zwiększyć obciążenie centralnej bazy danych i zaległości zapisu.

## Co jeszcze wraca do bazy głównej

Kolektor zarządza stanem operacyjnym swoich urządzeń: osiągalnością, ostatnim błędem, czasem podróży
pakietów, liczbą odpytań i dostępnością. Zapisuje te informacje lokalnie podczas odpytywania i
zbiorczo przesyła wybrane kolumny operacyjne do głównej instalacji. Aktualizuje to te konkretne
kolumny, a nie cały wiersz konfiguracji urządzenia.

Zatem to, co główna instalacja wyświetla jako dostępność urządzenia, jest widokiem kolektora z momentu
ostatniego pomyślnego przesłania. Kolektor będący w trybie offline posiada aktualny widok własnych
urządzeń, którego nikt w instalacji głównej nie może zobaczyć.

Główna instalacja śledzi kolektory w taki sam sposób, w jaki kolektor śledzi urządzenia. Funkcja
pomocnicza uznaje włączony zdalny kolektor za działający tylko wtedy, gdy znacznik czasu jego ostatniego
stanu jest młodszy niż dwukrotność skonfigurowanego interwału odpytywania. Ta kontrola nie dowodzi
dostarczenia próbek, udanej replikacji ani aktualności wykresów.

## Typowe awarie

| Co zawodzi | Co się dzieje | Co zauważasz |
|---|---|---|
| Łącze do głównej instalacji | Kolektor działa lokalnie, dopóki baza i harmonogram pozostają sprawne | Opóźnione wykresy i rosnąca kolejka; należy zweryfikować dostarczanie i straty |
| Sam kolektor | Przypisane urządzenia mogą przestać być odpytywane | Brakujące próbki; zdiagnozuj stan harmonogramu, urządzeń i kolektora |
| Replikacja | Kolektor działa na starszej konfiguracji | Zmiany konfiguracji wydają się nie przynosić efektu |
| Centralna baza danych | Zdalne procesy mogą wejść w tryb offline, jeśli połączenie zawiedzie | Centralne pobieranie danych przerwane; buforowanie zależy od lokalnego stanu |
| Nakładające się lub nieaktualne przypisania | Więcej niż jeden producent może przesyłać powiązane próbki | Brak automatycznego odrzucania; sprawdź przypisania, znaczniki czasu i błędy |

Buforowanie może zamienić niektóre awarie w opóźnienia, ale nie czyni dostarczania bezstratnym.
Sprawdzaj wiek kolejki, pojemność bazy danych, błędy odzyskiwania i wynikowe znaczniki czasu RRD. Płaski
wykres sam w sobie nie pozwala odróżnić awarii urządzenia od opóźnionego lub nieudanego dostarczenia danych.

## Jakie są koszty

W porównaniu z pojedynczym centralnym pollerem:

**Zyskujesz** równoległe czasy odpowiedzi urządzeń na wielu maszynach, odpytywanie odbywające się blisko
urządzeń zamiast przez sieć rozległą (WAN) oraz możliwość kontynuowania lokalnego zbierania danych, gdy
główna instalacja jest nieosiągalna, z zastrzeżeniem limitów odzyskiwania i sprawności lokalnej.

**Płacisz** replikacją konfiguracji, która może mieć opóźnienia, drugą bazą danych do obsługi,
monitorowania i tworzenia kopii zapasowych na każdy kolektor, trybem odłożonego zapisu, który nie jest
już opcjonalny, oraz centralną bazą danych, która przyjmuje współbieżne zapisy z każdego kolektora.

Uczciwe podsumowanie jest takie, że zdalny kolektor to dodatkowa maszyna, którą trzeba zarządzać. Jeden
poller z większą liczbą procesów to tylko ustawienie. Kolektor to infrastruktura z własną bazą danych,
własnymi poświadczeniami, własnym zegarem i własną wersją prawdy przez cały czas, gdy replikacja się nie
wykonała.
