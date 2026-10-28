---
title: Wtyczki
description: Dlaczego powierzchnia rozszerzeń to lista nazwanych punktów wywołania, co wtyczka dziedziczy, działając wewnątrz procesu, oraz co zabezpieczenia blokują, a czego nie.
banner:
  content: Kadupul jest w wersji pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej.
sidebar:
  order: 11
---

Wtyczka to kod, który aplikacja włącza do własnego procesu i wywołuje w nazwanych punktach.
Każda inna właściwość modelu wtyczek wynika z tego jednego zdania.

Informacje o tym, co przeczytać przed zainstalowaniem cudzej wtyczki, zawiera dokument
[Instalowanie i weryfikacja wtyczek](/pl/guides/install-and-vet-plugins/).

## Dlaczego działa wewnątrz procesu

Spójrz na przeznaczenie wtyczek: dodanie kolumny do listy renderowanej przez aplikację, zmiana opcji
wykresu przed jego narysowaniem, reakcja na usunięcie urządzenia lub dołączenie karty. Każda z tych
czynności to modyfikacja elementu, który aplikacja w danym ułamku sekundy przechowuje w pamięci.

Izolowany proces roboczy wymagałby jawnego interfejsu i walidacji swoich wyników. Może to zachować
izolację uprawnień, ale nie taki mechanizm zastosowano w tym systemie: plik wtyczki jest dołączany,
a jego funkcja wywoływana bezpośrednio w procesie aplikacji.

## Co dziedziczy wtyczka

Kod wtyczki działa jako konto systemu operacyjnego wywołującego, z dostępem do połączenia z bazą
danych i uprawnień systemu plików procesu. Obiekt wywołujący przez interfejs sieciowy może również
posiadać sesję; wywołanie z poziomu CLI niekoniecznie ją ma. Mechanizm wtyczek nie zapewnia
oddzielnej tożsamości, piaskownicy ani weryfikacji podpisów.

Uprawnienia użytkowników i grup regulują dostęp do aplikacji; nie ograniczają dowolnego kodu PHP
wtyczki. Uprawnienia bazy danych, uprawnienia systemu plików i ograniczenia procesu nadal limitują
to, co ten proces może zrobić. Przejrzyj wtyczkę przed instalacją i utrzymuj ograniczone uprawnienia
konta aplikacji.

## Dwa style wywołań

| Styl | Aplikacja | Wtyczka, która nic nie zwraca |
|---|---|---|
| Powiadomienie | Przekazuje argumenty, ignoruje wynik | Wartość zwracana nie jest używana; skutki uboczne i wyjątki nadal mają znaczenie |
| Transformacja | Przekazuje wartość, używa tego, co wróci | Może zastąpić wartość wartością null i uszkodzić kolejne wywołania |

Styl transformacji pozwala wtyczce dodać przycisk, rozszerzyć listę akcji lub zmodyfikować wykres.
To również tutaj wtyczki stają się powiązane: dwie wtyczki w tym samym punkcie widzą dane wyjściowe
poprzedniej w skonfigurowanej kolejności wtyczek.

Dyspozytor ostrzega o zamianie tablicy na inną strukturę lub o zamianie wartości wcześniej niepustej
na wartość typu null tylko wtedy, gdy obecnych jest wiele pasujących wierszy punktów zaczepienia (hooków).
Ta kontrola nie stanowi pełnej walidacji kontraktu punktu zaczepienia; pojedyncza wtyczka może
uszkodzić wartość bez wywołania tego ostrzeżenia.

## Rejestracja jest stanem, a nie wykrywaniem

Punkty zaczepienia znajdują się w tabeli: która wtyczka, jaka nazwa punktu, jaki plik, jaka funkcja,
włączona czy nie. Procedury instalacji, uaktualnienia i konfiguracji mogą rejestrować punkty
zaczepienia; rejestracja nie ogranicza się do pierwszej instalacji.

Alternatywą byłoby wykrywanie w czasie żądania, co oznacza skanowanie katalogu wtyczek i dołączanie
kodu każdej wtyczki w celu zapytania o jej wymagania. Pojedyncza strona dociera do wielu punktów
zaczepienia. Dołączanie wszystkiego, aby dowiedzieć się, że nic nie jest podłączone, to kosztowne
rozwiązanie, dlatego aplikacja odpytuje tabelę, buforuje odpowiedź dla danego żądania i dołącza tylko
plik określony przez pasujący wiersz.

Ten wybór wiąże się z kosztem, o którym warto wiedzieć. Tabela może nie zgadzać się z systemem plików.
Ręcznie usunięty katalog wtyczki pozostawia swoje wiersze w bazie. Brakujące wywołania zwrotne
powiadomień mogą generować tłumione ostrzeżenia; dyspozytor transformacji nie ma odpowiednika takiego
ostrzeżenia dla brakujących wywołań zwrotnych. Cichy dziennik nie dowodzi, że rejestracja jest poprawna.

Kolejność wynika z kolejności rejestracji wtyczki i można ją dostosowywać. Łańcuch transformacji jest
zatem uporządkowany według parametrów kontrolowanych przez administratora.

## Po co wtyczka może sięgnąć

| Możliwość | Uwaga |
|---|---|
| Tworzenie własnych tabel | Zapisywane, aby deinstalator mógł je usunąć |
| Dodawanie kolumn do istniejących tabel, w tym bazowych | Zapisywane, aby deinstalator mógł je usunąć |
| Rejestrowanie obszarów uprawnień | Nowe sekcje interfejsu z kontrolą dostępu |
| Deklarowanie zależności od innych wtyczek | Wersja sprawdzana przed instalacją |
| Uruchamianie na zdalnych kolektorach | Przekazywanie zależy od punktu, stylu, możliwości i stanu połączenia |

Zarejestrowane zmiany schematu są powodem, dla którego deinstalacja ma charakter destrukcyjny.
Aplikacja może usunąć śledzone tabele i kolumny, w tym zawarte w nich dane. Przed czyszczeniem
wywołuje również procedurę zwrotną odinstalowania wtyczki. To wywołanie zwrotne może wprowadzić inne
zmiany; nieśledzone modyfikacje nie są automatycznie wycofywane, a katalog źródłowy wtyczki pozostaje.

Obszary zarejestrowane przez wtyczkę są przypisywane użytkownikom i grupom w taki sam sposób, jak
obszary bazowe. Nowe obszary mogą również przyznać dostęp głównemu administratorowi i użytkownikowi
bieżącej sesji, jeśli wymaga tego rejestracja. Przejrzyj przyznane uprawnienia po instalacji i
aktualizacji; nie zakładaj, że dotychczasowa polityka obejmuje nową powierzchnię.
Zobacz [Uprawnienia i dostęp](/pl/concepts/permissions-and-access/).

## Co faktycznie chronią zabezpieczenia

W systemie istnieją zabezpieczenia, a ich analiza ujawnia model zagrożeń.

Plik wskazany przez punkt zaczepienia jest rozwiązywany wewnątrz własnego katalogu danej wtyczki.
Ścieżka wychodząca poza ten katalog jest odrzucana i rejestrowana jako zdarzenie bezpieczeństwa. Nazwa
katalogu wtyczki jest ograniczona do liter, cyfr, podkreślenia i myślnika. Rejestracja punktów
zaczepienia i obszarów jest akceptowana tylko z funkcji, której nazwa przypomina procedurę
instalacji, uaktualnienia lub konfiguracji; wywołanie z innego miejsca jest odrzucane i logowane.

Ochrona ścieżki ogranicza pliki, które może dołączyć wiersz punktu zaczepienia. Sprawdzanie rejestracji
bada jedynie nazwę funkcji wywołującej pod kątem słów kluczowych instalacji, aktualizacji lub
konfiguracji; nie uwierzytelnia operacji cyklu życia. Kod wtyczki może użyć takiej nazwy podczas
zwykłego ładowania strony, dlatego ta konwencja nie stanowi granicy bezpieczeństwa.

Zabezpieczenia te nie kontrolują tego, co robi kod samej wtyczki po uruchomieniu. Nie tworzą granicy
izolacji i nie zostały zaprojektowane w tym celu.

## Wyłączona nie oznacza odcięta

Kilka rodzajów punktów zaczepienia jest rejestrowanych w stanie włączonym już w momencie instalacji:
te, które udostępniają strony ustawień, tablice konfiguracyjne i definicje formularzy. Wtyczka musi
być konfigurowalna przed jej włączeniem, więc te procedury działają w obu przypadkach.

Wyłączona wtyczka nadal posiada kod, który jest dołączany i wykonywany podczas niektórych żądań stron.
Wyłączenie to przełącznik funkcji, a bezpośrednie adresy URL wtyczek również wymagają weryfikacji.
W przypadku podejrzenia złośliwego kodu należy odizolować instalację i sprawdzić procedurę usuwania
przed wywołaniem deinstalacji, która sama wykonuje kod wtyczki. Samo usunięcie plików źródłowych nie
czyści rejestracji ani nie cofa zmian w bazie danych.

## Zdalne kolektory mają węższą powierzchnię

Wtyczka deklaruje swoje możliwości w pliku informacyjnym: czy działa, gdy kolektor ma połączenie z
główną instalacją, czy działa, gdy go nie ma, oraz czy uczestniczy w zbieraniu danych.

Na kolektorze wymienione punkty zaczepienia są sprawdzane pod kątem wymagań dotyczących możliwości.
Niewymienione punkty transformacji są nadal wywoływane; niewymienione punkty powiadomień mogą być
wywoływane w trybie online lub gdy wtyczka deklaruje obsługę zarządzania/przeglądania offline. Pominięcia
nie są powszechnie rejestrowane w dziennikach. Jest to logika routingu, a nie globalna biała lista
czy granica izolacji; zbadaj dokładny dyspozytor i stan połączenia dla używanego punktu zaczepienia.

Powodem jest to, że kolektor to inne środowisko. Jego konfiguracja jest repliką, która może mieć
kilka godzin, i może nie mieć żadnego połączenia z centralną bazą danych. Punkt zaczepienia napisany
przy założeniu, że centralna baza danych jest dostępna o jedno zapytanie stąd, zawodzi w tym miejscu,
dlatego model wymaga, aby wtyczka deklarowała przyjęte założenia, zamiast ich domniemywać.
Zobacz [Zdalne zbieranie danych](/pl/concepts/remote-data-collection/).

## Poller to kosztowne miejsce na punkty zaczepienia

Punkt zaczepienia w ścieżce odpytywania jest uruchamiany, gdy osiągnięty zostanie jego punkt wywołania.
Jego częstotliwość zależy od zdarzenia, procesu i routingu kolektora; nie każdy punkt działa w każdym
procesie w każdym cyklu. Powolny kod na często używanej ścieżce pochłania interwał odpytywania i może
przyczyniać się do powstawania przerw na wykresach.

Punkt zaczepienia na stronie jest renderowany raz dla osoby, która i tak czeka. W tabeli rejestracyjnej
oba wyglądają identycznie, ale różnią się o rzędy wielkości pod względem kosztu zasobów.

## Dlaczego powierzchnia wygląda nierównomiernie

API punktów zaczepienia udostępnia miejsca wywołań o różnych celach i strukturach argumentów.

Dlatego lista jest szeroka i nieregularna, dlatego niektóre punkty przekazują wartość do modyfikacji,
a inne tylko informują o zdarzeniu, i dlatego argumenty różnią się formą między punktami zaczepienia.
Zadeklarowana minimalna wersja rdzenia nie zapewnia kompatybilności z każdym punktem: zbadaj argumenty
i oczekiwania dotyczące zwracanych danych w każdym miejscu wywołania i przetestuj wtyczkę na wersji
docelowej. Ograniczenia kompatybilności z CLI i przyznawaniem obszarów opisane w
[Instalowanie i weryfikacja wtyczek](/pl/guides/install-and-vet-plugins/) również mają zastosowanie;
sama udana instalacja nie jest dowodem zgodności.

Wniosek praktyczny: wtyczka jest powiązana z wersją rdzenia, dla której została napisana, znacznie
ściślej, niż sugeruje zadeklarowane minimum. Sprawdź wtyczki przed aktualizacją rdzenia, a nie po niej.
