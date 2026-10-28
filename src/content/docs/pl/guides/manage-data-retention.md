---
title: Zarządzanie retencją danych
description: Wybór retencji i rozdzielczości, szacowanie pamięci masowej oraz planowanie zmian w istniejących plikach RRD.
banner:
  content: Kadupul jest w fazie przedalfa. Sprawdź te procedury w izolowanej instalacji testowej.
sidebar:
  order: 24
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma oficjalnie wspieranego wydania Kadupul ani
ścieżki migracji. Przetestuj te procedury na wyizolowanej kopii z kopiami zapasowymi przed
poleganiem na nich w środowisku produkcyjnym. Zobacz [status projektu](/pl/project/status/).
:::

Retencja jest konfigurowana w momencie tworzenia pliku i pozostaje niezmienna podczas normalnych aktualizacji. Późniejsza
edycja profilu zmienia jedynie kształt kolejnego tworzonego pliku, pozostawiając każdy istniejący
plik dokładnie w takim stanie, w jakim był. Skonfiguruj to prawidłowo przed utworzeniem dziesięciu tysięcy źródeł
danych, ponieważ późniejsze modyfikacje wymagają jawnej konserwacji plików lub migracji.

Przeczytaj najpierw [Źródła danych i archiwa](/pl/concepts/data-sources-and-rras/), jeśli
pojęcia takie jak krok (step), heartbeat, archiwum i konsolidacja nie są Ci jeszcze znane.

## Co zawiera profil

Profil źródła danych stanowi politykę retencji. Jeden profil oznacza jedną strukturę przechowywania.

| Pole | Znaczenie |
|---|---|
| Interwał odpytywania (step) | Jak często oczekiwana jest wartość, w sekundach |
| Heartbeat | Maksymalny dozwolony odstęp między aktualizacjami, zanim dane wejściowe zostaną uznane za nieznane |
| Współczynnik X-Files | Jaka część okna konsolidacji może być nieznana, zanim skonsolidowana wartość stanie się nieznana |
| Funkcje konsolidacji | Które z funkcji `AVERAGE`, `MIN`, `MAX`, `LAST` są zachowywane |
| Archiwa | Jeden wiersz na rozdzielczość, każdy z poziomem agregacji i liczbą wierszy |
| Domyślny | Czy nowe źródła danych wybierają ten profil |

Krok domyślnie przyjmuje interwał pollera. Profil, którego krok jest bardziej szczegółowy niż
interwał odpytywania, nie może odzyskać szczegółów, które nigdy nie były próbkowane. To, czy jego wiersze
są nieznane, zależy od parametru heartbeat i normalizacji w RRDtool.

## Co jest dostarczane domyślnie

Domyślnie dostępne są trzy gotowe profile. Wszystkie trzy zachowują wszystkie cztery funkcje konsolidacji.

| Profil | Step | Heartbeat |
|---|---|---|
| 5 Minute Collection | 300s | 600s |
| 1 Minute Collection | 60s | 600s |
| 30 Second Collection | 30s | 1200s |

Profil 5 Minute jest profilem domyślnym.

Każdy z nich ma cztery archiwa. Poziom agregacji jest wyrażany jako mnożnik kroku,
więc rzeczywista rozdzielczość to mnożnik pomnożony przez krok profilu, a objęty okres to
ta rozdzielczość pomnożona przez liczbę wierszy.

### 5 Minute Collection

| Archiwum | Mnożnik | Wiersze | Rozdzielczość | Objęty okres |
|---|---|---|---|---|
| Daily | 1 | 600 | 5 minut | około 2 dni |
| Weekly | 6 | 700 | 30 minut | około 14 dni |
| Monthly | 24 | 775 | 2 godziny | około 64 dni |
| Yearly | 288 | 797 | 1 dzień | około 2 lata i 2 miesiące |

### 1 Minute Collection

| Archiwum | Mnożnik | Wiersze | Rozdzielczość | Objęty okres |
|---|---|---|---|---|
| Daily | 1 | 2900 | 1 minuta | około 2 dni |
| Weekly | 15 | 1440 | 15 minut | 15 dni |
| Monthly | 60 | 8784 | 1 godzina | około 366 dni |
| Yearly | 720 | 7305 | 12 godzin | około 10 lat |

### 30 Second Collection

| Archiwum | Mnożnik | Wiersze | Rozdzielczość | Objęty okres |
|---|---|---|---|---|
| Daily | 1 | 2900 | 30 sekund | około 1 dzień |
| Weekly | 30 | 1346 | 15 minut | około 14 dni |
| Monthly | 120 | 1445 | 1 godzina | około 60 dni |
| Yearly | 480 | 4380 | 4 godziny | 2 lata |

Nazwy są jedynie etykietami, a nie wymuszonym zachowaniem. Nic nie wymusza, aby archiwum nazwane
"Yearly" przechowywało dokładnie jeden rok.

## Jak profil staje się plikiem

Podczas tworzenia pliku archiwa i funkcje konsolidacji profilu są odczytywane i
przekształcane w polecenie create. Krok pochodzi z zapisanego parametru `rrd_step`
źródła danych, zwykle pobieranego z jego profilu. Każdy uwzględniony element źródła danych wnosi wiersz definicji
zawierający nazwę, typ, heartbeat, minimum i maksimum. Każde archiwum
wnosi jeden wiersz na funkcję konsolidacji, określający funkcję, współczynnik X-Files, mnożnik i liczbę wierszy.

Cztery archiwa pomnożone przez cztery funkcje konsolidacji dają szesnaście definicji archiwów
w pliku. To właśnie to mnożenie zużywa przestrzeń dyskową.

Jeśli plik już istnieje, normalna ścieżka tworzenia zatrzymuje się bez jego ponownego zapisywania.
Edycja profilu nie migruje plików automatycznie. Narzędzia do jawnej konserwacji
stanowią osobną operację, opisaną poniżej.

## Wybór polityki

Trzy pytania, dokładnie w tej kolejności:

**Jakie jest najbardziej szczegółowe pytanie, jakie kiedykolwiek zadasz?** To określa krok. Krok
30-sekundowy odpowiada na pytanie "co wydarzyło się podczas tego 90-sekundowego skoku". Krok 5-minutowy
nigdy na to nie odpowie, dla żadnego pliku utworzonego w tym profilu. Bardziej szczegółowe kroki wymagają pracy pollera
w każdym cyklu, a także większej przestrzeni dyskowej.

**Jak daleko wstecz będziesz zadawać to pytanie?** To określa liczbę wierszy archiwum dziennego. Większość
instalacji potrzebuje kilku dni w pełnej rozdzielczości, zadowalając się później
bardziej zagregowanymi danymi.

**Które pytania przetrwają konsolidację?** To określa funkcje konsolidacji.
`AVERAGE` odpowiada, co było typowe. `MAX` odpowiada, jak poważny był szczyt.
`MIN` odpowiada, czy kiedykolwiek nastąpił spadek. `LAST` odpowiada, jaka była końcowa wartość w
danym oknie, co ma znaczenie dla odczytów reprezentujących stany, a nie tempo zmian.

Pominięcie jednej z czterech funkcji konsolidacji zmniejsza rozmiar przechowywanych wartości w
nowych plikach o jedną czwartą przy każdej rozdzielczości. Jest to również
najczęstszy powód żalu zgłaszany później przez administratorów. Zachowaj `MAX`, chyba że masz pewność, że nikt
nigdy nie zapyta o wartość szczytową.

## Szacowanie rozmiaru dysku

Rozmiar pliku wynika bezpośrednio z wybranych liczb. Zgodnie ze wzorem stosowanym w
interfejsie:

```
file size = 284 + (data sources x (300 + total rows x 8 x consolidation functions))
```

Interfejs przyjmuje 284 i 300 bajtów jako szacunkowe stałe narzuty. Potraktuj to
jako przybliżenie wymiarowania, a nie dokładny opis każdego formatu pliku RRDtool.
Każda zapisana wartość zajmuje 8 bajtów, a całkowita liczba wierszy to suma wierszy we
wszystkich definicjach archiwów profilu przed pomnożeniem przez funkcje konsolidacji.
Przetestuj reprezentatywne pliki za pomocą zainstalowanego RRDtool przed dobraniem wielkości pamięci masowej.

Dla pliku z pojedynczym źródłem danych i wszystkimi czterema funkcjami konsolidacji:

| Profil | Całkowita liczba wierszy | Przybliżony rozmiar pliku |
|---|---|---|
| 5 Minute Collection | 2872 | 92 KB |
| 30 Second Collection | 10,071 | 323 KB |
| 1 Minute Collection | 20,429 | 654 KB |

Pomnóż tę wartość przez liczbę oczekiwanych źródeł danych, a nie przez liczbę wykresów. Wykres
może łączyć pola z jednego lub kilku plików. Zlicz rzeczywiste pliki RRD
oraz elementy źródeł danych zawarte w każdym z nich.

Dwadzieścia tysięcy źródeł danych w profilu domyślnym zajmuje około 1,8 GB. Te same
dwadzieścia tysięcy w profilu 1 Minute zajmuje około 13 GB. Ta proporcja odzwierciedla
zarówno rozdzielczość, jak i zróżnicowany okres retencji profili, a nie tylko sam krok.
Gęstsze próbkowanie zwiększa również częstotliwość zapisów. Zobacz [Zapisy o dużej objętości](/pl/concepts/high-volume-writes/) przed wybraniem
krótkiego kroku w dużej skali.

Zarówno edytor profili, jak i edytor archiwów wyświetlają obliczony rozmiar podczas modyfikowania wartości.
Korzystaj z nich. W tych obliczeniach łatwo pomylić się czterokrotnie.

## Co zmiana profilu robi, a czego nie robi

W tym miejscu administratorzy najczęściej tracą dane historyczne.

| Zmiana | Wpływ na nowe pliki | Wpływ na istniejące pliki |
|---|---|---|
| Dodanie lub usunięcie archiwum | Zastosowane | Brak |
| Zmiana liczby wierszy | Zastosowane | Brak |
| Zmiana poziomu agregacji | Zastosowane | Brak |
| Dodanie lub usunięcie funkcji konsolidacji | Zastosowane | Brak |
| Zmiana kroku | Nowe źródła danych go dziedziczą; tworzenie używa ich zapisanego kroku | Brak automatycznej migracji plików |
| Zmiana parametru heartbeat | Tworzenie używa metadanych elementu źródła danych; patrz poniżej | Brak automatycznego dostrajania plików |
| Usunięcie profilu | Odrzucane, dopóki odwołuje się do niego szablon lub źródło danych, oraz dla profilu domyślnego | Brak |

**Zmiana parametru heartbeat w używanym profilu aktualizuje wyłącznie metadane.** Zapisanie nowego
parametru heartbeat aktualizuje go w profilu oraz w elementach źródeł danych w szablonach i
lokalnych źródłach danych korzystających z profilu; inne szablony nie ulegają zmianie.

Zapisanie nie modyfikuje istniejących plików RRD. Wykonaj kopię zapasową metadanych oraz plików,
a następnie porównaj profil, elementy szablonów, lokalne elementy źródeł danych i rzeczywiste wyjście
polecenia `rrdtool info` po modyfikacji parametru heartbeat.

Narzędzie `cli/update_heartbeat.php` głównego kolektora może dostroić istniejące pliki
i zaktualizować metadane. Rozpocznij od `--help`, `--list-heartbeats`,
`--list-data-templates` oraz `--list-profiles`. Nowy heartbeat musi być obsługiwany
i wynosić co najmniej dwukrotność skonfigurowanego interwału pollera. Użyj opcji `--data-template-id`,
aby zawęzić wybór; narzędzie nie posiada opcji uruchomienia próbnego (dry-run).

Bez opcji `--force` wybrane profile muszą już posiadać żądany
heartbeat. Z opcją `--force` modyfikowane są również współdzielone wartości profili, więc przed kontynuowaniem
należy sporządzić wykaz wszystkich ich użytkowników. Opcja `--prev-heartbeat` filtruje wartości w bazie danych, a nie
heartbeat odczytany z każdego pliku RRD: po częściowym zapisie w interfejsie webowym wybranie starej wartości
z pliku może niczego nie dopasować. Zweryfikuj wybór i sprawdź wynikowe pliki.
W teście izolowanym pomyślnie dostrojono istniejący plik z 600 na 900
po ujednoliceniu metadanych jego profilu.

Obok kryją się dwie kolejne pułapki.

**Edytor blokuje zmiany strukturalne, gdy profil jest w użyciu.** Gdy tylko
z profilem powiązane zostanie rzeczywiste źródło danych, parametry takie jak krok, współczynnik X-Files, funkcje konsolidacji,
liczba wierszy i poziomy agregacji stają się w edytorze polami tylko do odczytu;
ukrywane są również kontrolki dodawania/usuwania archiwów. Skopiuj profil i
edytuj jego kopię. Te ograniczenia interfejsu nie zastępują walidacji nadsyłanych żądań po stronie serwera.

**Przypisz odwołania przed usunięciem profilu.** Lista uniemożliwia zaznaczenie,
gdy szablon lub lokalne źródło danych korzysta z danego profilu, a serwer odmawia
usunięcia profilu, do którego nadal istnieją odwołania.

## Przenoszenie źródeł danych między profilami

W szablonach danych dostępna jest akcja masowa umożliwiająca zmianę profilu. Przepisuje ona
zapisany w szablonie profil, krok i heartbeat, ograniczając się
celowo do wierszy szablonów. Już istniejące źródła danych nie są modyfikowane.

Prawidłowa kolejność rzeczywistej migracji wygląda następująco:

1. Utwórz nowy profil i zweryfikuj jego obliczony rozmiar.
2. Skieruj na niego szablon danych.
3. Zaakceptuj fakt, że wszystkie nowo tworzone elementy będą używać nowej struktury.
4. Zdecyduj osobno, co zrobić z plikami, które już posiadasz.

Krok czwarty oferuje kilka opcji, zależnie od wprowadzonej zmiany i zainstalowanej wersji RRDtool:

**Pozostawić je bez zmian.** Różne struktury retencji mogą ze sobą współistnieć. Zadbaj o to, aby metadane
odpytywania każdego istniejącego źródła danych były spójne z jego plikiem; sama zmiana referencji
do profilu w bazie danych nie migruje kroku, pól ani archiwów.

**Odbudować.** Usunąć i ponownie utworzyć źródło danych. Działa szybko, ale historia zostaje utracona.

**Połączyć (Splice).** Narzędzie wiersza poleceń splice scala stary plik z nowym i
może przy tym zmienić rozdzielczość, pod warunkiem że nowy plik posiada już
prawidłowy krok. Posiada tryb próbny (dry run). Przetestuj je na kopii przed użyciem na
istotnych danych.

**Konserwacja za pomocą RRDtool.** W zależności od zainstalowanej wersji i pożądanej zmiany polecenia
[rrdtool tune](https://oss.oetiker.ch/rrdtool/doc/rrdtune.en.html) lub
[rrdtool resize](https://oss.oetiker.ch/rrdtool/doc/rrdresize.en.html) mogą zmodyfikować
istniejący plik z zachowaniem zgromadzonych danych. Zatrzymaj konkurencyjne procesy zapisu, przygotuj
kopię zapasową i zweryfikuj wynik na kopii. Operacje te nie odtworzą szczegółów
utraconych wcześniej w wyniku konsolidacji.

## Profile zewnętrzne

Źródło danych można przypisać do profilu zewnętrznego, który rejestruje krok o wartości zero.
Oznacza to, że plik jest zarządzany poza standardową ścieżką, a lista źródeł danych
wyświetla go jako zewnętrzny zamiast podawać interwał. Stosuj go dla plików generowanych przez inny
proces. Nie używaj go jako oznaczenia "brak polityki", ponieważ retencja nadal odpowiada
strukturze, z jaką plik został utworzony; po prostu nie jest nigdzie jawnie opisana.

## Typowe problemy

| Symptom | Zwykła przyczyna |
|---|---|
| Edycja profilu nie przynosi żadnego skutku | Oczekiwane zachowanie. Istniejące pliki zachowują strukturę, z którą zostały utworzone |
| Liczba wierszy i poziom agregacji są zablokowane do edycji | Profil jest używany przez co najmniej jedno źródło danych. Utwórz jego kopię |
| Interfejs wskazuje jeden heartbeat, a plik zachowuje się według innego | Zmieniono heartbeat w profilu, lecz pliki nie zostały dostrojone |
| Tworzenie nowych źródeł danych kończy się błędem o braku przypisanych archiwów | Profil usunięto, gdy źródła danych nadal się do niego odwoływały |
| Najbardziej szczegółowe archiwum zawiera same nieznane wartości | Sprawdź brakujące aktualizacje, parametr heartbeat i reguły konsolidacji |
| Na tygodniowym wykresie pojawiają się luki co kilka godzin | Heartbeat zbyt bliski kroku przy opóźniającym się pollerze |
| Szczyty widoczne wczoraj zniknęły na widoku miesięcznym | Zachowywana jest tylko funkcja `AVERAGE` lub usunięto archiwum `MAX` w celu oszczędzania miejsca |
| Dysk zapełnił się cztery razy szybciej niż szacowano | Oszacowanie uwzględniało archiwa, lecz pominęło funkcje konsolidacji |
| Pożądana rozdzielczość jest niedostępna na liście nowego archiwum | Edytor oferuje archiwum o kroku profilu, a następnie tylko wartości mniej szczegółowe od istniejących |
