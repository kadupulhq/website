---
title: Pytania
description: Krótkie odpowiedzi na pierwsze pytania zadawane przez nowych użytkowników i osoby korzystające z Cacti, wraz z odnośnikiem do odpowiedniej strony.
banner:
  content: Kadupul jest w fazie pre-alpha. Kod jest dostępny, ale nie ma wspieranego wydania produkcyjnego ani zweryfikowanej ścieżki migracji. Nie używaj go w środowisku produkcyjnym.
sidebar:
  order: 7
---

Krótkie odpowiedzi. Każda zawiera odnośnik do strony, która wyczerpująco opisuje dane zagadnienie.

## Projekt

### Czy mogę go zainstalować dzisiaj?

Kod źródłowy jest dostępny do celów programistycznych i izolowanych testów. Nie ma oficjalnie wspieranego wydania ani zweryfikowanej ścieżki instalacji produkcyjnej.

Strony instalacji i poradników wymagają weryfikacji w zestawieniu z używanym kodem. Zobacz [Status](/pl/project/status/).

### Czy jest gotowy do wdrożenia produkcyjnego?

Nie. Repozytorium określa Kadupul jako pre-alpha i projekt niegotowy do wdrożenia na produkcji. Status wydania nie informuje o tym, czy ktokolwiek wdrożył kod rozwojowy.

### Czy to jest zamiennik Cacti?

Kadupul jest niezależnym forkiem z własnymi priorytetami rozwojowymi i kanałami wsparcia. Jest w fazie pre-alpha; migracja wymaga weryfikacji pod kątem używanych wersji i rozszerzeń. Zobacz [Przejście z Cacti](/pl/guides/coming-from-cacti/).

### Dlaczego utworzono osobny projekt?

Kadupul stanowi przestrzeń do wymiany podsystemów, podniesienia bazowej wersji języka i modyfikacji wewnętrznych interfejsów zgodnie z własną polityką wydań. Zobacz [Dlaczego ten fork powstał](/pl/project/why-this-fork/).

### Z której wersji Cacti wywodzi się fork?

Aplikacja bazuje na Cacti 1.2.31. Repozytorium utrzymuje gałęzie `main` oraz `lts/1.2` o odmiennych celach wydawniczych. Zobacz [Status](/pl/project/status/).

### Kto nim zarządza?

Projekt Kadupul utrzymuje repozytorium. W pracach nad projektem korzystaj z systemu zgłoszeń i [procesu współtworzenia](/pl/project/contributing/).

### Czy istnieje mapa drogowa? Harmonogram wydań? Zasady wsparcia?

Repozytorium posiada cele wydań, politykę wersjonowania oraz proces współtworzenia. Nie ma jeszcze wspieranego wydania produkcyjnego. Zobacz [Status](/pl/project/status/) w celu rozróżnienia planowanych wersji od opublikowanych artefaktów.

### Czy jest powiązany z The Cacti Group?

Nie. Kadupul nie jest powiązany z The Cacti Group ani przez nią popierany. Określa się jako fork Cacti, ponieważ jest to stwierdzenie faktu na temat pochodzenia kodu. Cacti to ich projekt i ich nazwa.

### Skąd wzięła się ta nazwa?

Kadupul to syngaleska nazwa kaktusa kwitnącego nocą. Cacti czerpie nazwę od rodziny roślin; Kadupul to jeden z gatunków wewnątrz niej. Nazwa wskazuje pochodzenie projektu, nie roszcząc sobie prawa do reprezentowania całości. Szerszy opis znajduje się w rozdziale [Czym jest Kadupul](/pl/start/what-kadupul-is/).

## Przejście z Cacti

### Czy moje wtyczki będą działać?

Taki jest zamiar. API wtyczek jest jednym z czterech celów kompatybilności. Ładowanie i uruchamianie wtyczki Cacti bez modyfikacji musi zostać wykazane dla używanych wersji.

Zgodność to cel, a nie gwarancja dla każdej wtyczki. Przed zaplanowaniem migracji sprawdź wtyczki i wersje, od których rzeczywiście zależysz. Zobacz [Zgodność z Cacti](/pl/project/compatibility-with-cacti/) i [Przejście z Cacti](/pl/guides/coming-from-cacti/).

### Czy moje pliki RRD będą działać?

Zachowanie historii RRD jest celem kompatybilności. Pliki te przechowują dane historyczne, których nie można odtworzyć. Przed każdą migracją sprawdź odczyt istniejących plików na kopii zapasowej.

Wszelkie migracje wymagające ich usunięcia i utworzenia od nowa są nie do zaakceptowania. Zobacz [Przejście z Cacti](/pl/guides/coming-from-cacti/).

### Czy moje szablony i baza danych zostaną przeniesione?

Szablony mają importować się bez zmian. Schemat ma pozostać rozpoznawalny i możliwy do migracji bez konieczności eksportu do formatu pośredniego. Są to cele wymagające weryfikacji, podobnie jak w przypadku wtyczek i plików RRD.

### W jaki sposób dowiem się o różnicach między Kadupul a Cacti?

Dzięki temu, że zostaną spisane. Sytuacją niepożądaną, której projekt stara się uniknąć, nie jest sama rozbieżność, będąca sensem istnienia forka, lecz rozbieżność nieudokumentowana, zmieniająca każdą aktualizację w dochodzenie.

### Czy działa ze Spine?

Kadupul będzie utrzymywał forka Spine równolegle z modułem zbierającym w PHP. Lokalizacja jego repozytorium oraz zweryfikowane kompilacje nie są jeszcze tutaj udokumentowane. Spine jest budowany i instalowany oddzielnie. Odziedziczona integracja obejmuje ustawienie `poller_type` i ścieżki, wiersz poleceń nadrzędnego pollera, ustawienia odczytywane przez Spine oraz tabele, do których zapisuje.

Przed przełączeniem zweryfikuj łącznie wersje Kadupul i Spine. Zgłaszaj problemy w [systemie zgłoszeń Kadupul](https://github.com/kadupulhq/kadupul/issues). Zobacz [Spine, kolektor w C](/pl/reference/spine/) w celu uzyskania wskazówek dotyczących konfiguracji i budowania.

### Czy działa z proxy RRDtool?

Kadupul nie korzysta z demona proxy organizacji Cacti. Używaj lokalnego magazynu RRDtool. Dokument [Informacje o proxy RRDtool](/pl/reference/rrdproxy/) opisuje odziedziczony protokół klienta; nie jest to wspierana opcja wdrożeniowa. Własny zamiennik w Kadupul musi zostać opracowany i zweryfikowany, zanim wdrożenie proxy zostanie udokumentowane.

### Czego wymaga do działania?

Serwera WWW z PHP, bazy danych MySQL lub MariaDB, RRDtool oraz mechanizmu do cyklicznego uruchamiania pollera. Wymagane wersje i rozszerzenia wymieniono na stronie [Wymagania](/pl/reference/requirements/).

## Licencjonowanie

### Na jakiej licencji udostępniane jest oprogramowanie?

GPL-3.0-or-later.

### Cacti wskazuje na GPL-2. Jak fork może być objęty GPL-3?

Odziedziczona licencja aplikacji zezwala na stosowanie licencji GPL w wersji 2 lub późniejszej. Kadupul korzysta z opcji nowszej wersji w swojej dystrybucji. Zależności zachowują własne warunki licencji. Zobacz [Licencja](/pl/project/license/).

### Jaką licencją objęta jest ta dokumentacja?

CC BY-SA 4.0. Kod witryny pozostaje objęty licencją GPL-3.0-or-later wraz z resztą projektu. Możesz ponownie wykorzystywać tekst, jeśli podasz informacje o projekcie i udostępnisz swoje dzieło na tych samych warunkach.

### Skąd pochodzą te strony?

Strony te opisują zachowanie wywnioskowane z kodu źródłowego aplikacji. Treści podmiotów trzecich wymagają własnej weryfikacji licencyjnej przed ich ponownym wykorzystaniem.

To ograniczenie dotyczy również współtworzenia. Zmiany w dokumentacji opierają swoje twierdzenia na kodzie. Zobacz [Współtworzenie](/pl/project/contributing/).

## Udział w projekcie

### Jak zgłosić podatność dotyczącą bezpieczeństwa?

Poufnie, za pośrednictwem GitHub Security Advisories w odpowiednim repozytorium. Nie jako publiczne zgłoszenie issue.

Niewydany kod może być wdrożony i zawierać luki. Zgłaszaj je poufnie niezależnie od statusu wydania. Zobacz [Polityka bezpieczeństwa](/pl/project/security/).

### Podatność znaleziona tutaj prawdopodobnie dotyczy również Cacti. Co należy zrobić?

Zgłoś ją poufnie do Kadupul i dołącz informacje o wspólnym kodzie. Opiekunowie Kadupul zajmują się klasyfikacją i naprawą w Kadupul zgodnie z [polityką bezpieczeństwa repozytorium](https://github.com/kadupulhq/kadupul/blob/main/SECURITY.md).

### Jak mogę pomóc w rozwoju projektu?

Przeczytaj [Współtworzenie](/pl/project/contributing/) oraz przewodnik dla współtwórców w wybranej gałęzi. Przed wdrożeniem omów wszelkie istotne modyfikacje.

### Znalazłem błąd na tej stronie.

Bardzo dobrze. Każda strona tutaj została napisana na podstawie kodu źródłowego, a każdy błąd jest błędem wynikającym z konkretnych przyczyn. Każda strona zawiera link do edycji.
