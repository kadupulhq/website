---
title: "Czym jest Kadupul"
description: "Zbieranie, przechowywanie, architektura i ograniczenia projektu przy planowaniu na lata 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekuje na weryfikację przez osobę biegle znającą język."
---

Kadupul to aplikacja do monitorowania sieci i tworzenia wykresów. Zbiera pomiary przez SNMP i skrypty, przechowuje szeregi czasowe w plikach RRD i tworzy wykresy za pomocą RRDtool. Ten przegląd sprawdzono 26 października 2026 r. względem wskazanej poniżej rewizji aplikacji.
[`005d797cc`](https://github.com/kadupulhq/kadupul/tree/005d797cca3884f7f60e7778f631f2fcfedad4cf).

## Status projektu na lata 2026–2027

Kadupul jest w fazie pre-alpha, bez wspieranego wydania produkcyjnego ani zweryfikowanej migracji do produkcji. Używaj odizolowanej instalacji testowej. Daty w dokumentacji są kontekstem planowania, nie zobowiązaniami terminowymi. Przed wyborem rewizji do oceny sprawdź status projektu.

[Status projektu](/pl/project/status/)

## Zbieranie i harmonogram

Zewnętrzny harmonogram uruchamia poller. Poller czyta przygotowaną listę zbierania, wywołuje kolektor PHP lub zgodną kompilację Spine i przetwarza wyniki. Odstępy zbierania są konfigurowalne; pięć minut jest przykładem, nie zasadą. Mechanizm uruchamiania może wykonać kilka krótszych cykli w swoim przedziale. Limity czasu, ponowienia i opóźnienia urządzeń zużywają ten budżet czasu.

[Cykl pollera](/pl/reference/poller-lifecycle/)

## Retencja i przechowywanie

Układ przechowywania pliku RRD wybiera się podczas tworzenia. Nowsze pomiary mogą zachowywać więcej szczegółów niż starsze wartości skonsolidowane; retencję ograniczają skonfigurowane archiwa. Plik nie zachowuje każdej próbki na zawsze. Wartości nieznane oznaczają brakujące lub nieużyteczne obserwacje, nie zero. Kolejki bazy danych, dzienniki i statystyki mogą rosnąć, nawet gdy istniejące pliki RRD zachowują stały rozmiar.

[Źródła danych i archiwa](/pl/concepts/data-sources-and-rras/)

## Wykresy i wspólne pojęcia

Urządzenie to monitorowany punkt końcowy. Zapytanie o dane wykrywa elementy, na przykład interfejsy. Źródło danych opisuje pomiar i jego przechowywanie; wykres opisuje sposób prezentacji. Szablony umożliwiają ponowne użycie definicji, drzewa organizują nawigację. To osobne rekordy: przed usunięciem sprawdź opcje kasowania i zależności. Wykresy powstają na żądanie z zachowanych danych; pamięć podręczna obrazów może ponownie wykorzystać wyrenderowany wynik.

[Słownik](/pl/reference/glossary/)

## Elementy instalacji

Działająca instalacja łączy aplikację WWW w PHP, MySQL lub MariaDB, pamięć masową RRD, RRDtool i mechanizm uruchamiania zbierania. Dane uwierzytelniające urządzeń i konfiguracja znajdują się w bazie lub chronionych plikach konfiguracyjnych. Wykonuj spójny zestaw kopii kodu, konfiguracji, kolejek bazy i historii RRD, a potem ćwicz odtwarzanie. Sam zrzut bazy nie odtwarza historycznych wykresów.

[Kopie i odtwarzanie](/pl/guides/back-up-and-restore/)

## Main i migracja Symfony

Gałąź aplikacji `main` wymaga PHP 8.4 lub nowszego i łączy usługi Symfony 7.4 ze starszymi punktami wejścia WWW, pollera i CLI. Linia utrzymaniowa `lts/1.2` ma osobne wymagania. Zmigrowane i starsze trasy współistnieją; usługa Symfony nie dowodzi wycofania starego przepływu. Kopie kodu źródłowego wymagają zablokowanych zależności PHP i wygenerowanych zasobów przeglądarki. Używaj środowisk z pliku `mise.toml` aplikacji.

[Przewodnik migracji](https://github.com/kadupulhq/kadupul/blob/005d797cca3884f7f60e7778f631f2fcfedad4cf/docs/symfony-migration.md)

## Konta, wtyczki i dostęp do pamięci masowej

Widoczność urządzeń i wykresów zależy od uprawnień użytkowników i grup. Wtyczki działają jako zaufany kod aplikacji z dostępem konta procesu; nie są izolowane w piaskownicy. Przed włączeniem sprawdź pochodzenie, hooki i zachowanie podczas instalacji i odinstalowania. Lokalne procesy zapisujące RRD w Unix wymagają sprawdzania tożsamości POSIX i jawnego zaufania, gdy konta WWW i pollera są różne. Windows nie obsługuje destrukcyjnej konserwacji lokalnych RRD.

[Ocena wtyczek](/pl/guides/install-and-vet-plugins/)

## Zastosowania i ograniczenia

Oceń Kadupul dla interfejsów sieciowych, liczników urządzeń, czujników środowiskowych i innych pomiarów dostępnych metodami zbierania, które możesz zweryfikować. To samodzielnie hostowane oprogramowanie wymagające utrzymania bazy, WWW i harmonogramu. Podstawowe zbieranie liczbowe nie jest magazynem logów, systemem rozproszonego śledzenia ani uniwersalnym silnikiem zapytań po etykietach o wysokiej kardynalności. Alarmy progowe zależą od odpowiednich wtyczek; sprawdź zgodność zamiast zakładać działanie alarmów zaraz po instalacji.

## Pochodzenie, nazwa i zgodność

Kadupul jest niezależnym forkiem Cacti na licencji GPL-3.0-or-later, bez powiązania z The Cacti Group ani jego aprobaty. Syngaleska nazwa කඩුපුල් oznacza *Epiphyllum oxypetalum*, kaktus kwitnący nocą. Zachowanie interfejsów wtyczek, szablonów, schematów i istniejącej historii RRD jest celem wydania wymagającym dowodów dla każdej rewizji źródłowej i kombinacji wtyczek.

[Zgodność](/pl/project/compatibility-with-cacti/)

## Zacznij od jednego sprawdzonego urządzenia

Wykonaj kolejno instalację, pierwsze urządzenie i pierwszy wykres. Sprawdź dzienniki, znaczniki czasu zbierania i użyteczne wartości, zanim zaufasz obrazowi. Zmierz czas cyklu i pracę w kolejce z własnymi urządzeniami przed rozbudową. Pojęcia wyjaśniają projekt, a wymagania wskazują warunki wstępne.

[Instalacja](/pl/start/install/) · [Pierwsze urządzenie](/pl/start/first-device/) · [Pierwszy wykres](/pl/start/first-graph/) · [Pojęcia](/pl/concepts/architecture/) · [Wymagania](/pl/reference/requirements/)
