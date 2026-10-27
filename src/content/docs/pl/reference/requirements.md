---
title: "Wymagania"
description: "Wymagania środowiska, pamięci masowej i wdrożenia przy planowaniu na lata 2026–2027."
sidebar:
  order: 1
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
---

Sprawdzono 26 października 2026 r. względem wskazanej poniżej rewizji aplikacji. Ta podstawa służy planowaniu na lata 2026–2027; nie stanowi zobowiązania do wydania ani wsparcia.
[`d579c33c6`](https://github.com/kadupulhq/kadupul/tree/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf).

## Środowisko uruchomieniowe

`main` wymaga PHP 8.4 lub nowszego i łączy Symfony 7.4 ze starszymi punktami wejścia. Linia `lts/1.2` ma odrębne wymagania. Zainstaluj MySQL lub MariaDB, RRDtool oraz kolektor PHP albo zgodną kompilację Spine. Przy budowaniu ze źródeł używaj wersji z `mise.toml` przez `mise exec`; instaluj zależności zapisane w pliku blokady bez ich aktualizowania.

## PHP

Manifest wymaga oprócz PHP następujących rozszerzeń:

`PDO`, `Phar`, `dom`, `gd`, `gmp`, `intl`, `json`, `ldap`, `mbstring`, `mysqlnd`, `openssl`, `pcntl`, `pdo_mysql`, `posix`, `sockets`, `sqlite3`, `xml`.

Instalator osobno sprawdza między innymi `ctype`, `date`, `filter`, `hash`, `pcre`, `session`, `simplexml`, `spl`, `standard` i `zlib`. W systemie Unix sprawdza `posix` i `pcntl` dla CLI; w Windows `com_dotnet`. Przejście instalatora nie dowodzi spełnienia wymagań Composera. Sprawdź osobno PHP w CLI i na serwerze WWW. Ustaw `date.timezone`; instalator zaleca `memory_limit=400M` i `max_execution_time=60` lub wartości bez limitu. Opcjonalne `snmp` umożliwia zapytania wewnątrz procesu; `gettext` włącza katalogi tłumaczeń.

## Baza danych

Używaj wydania MySQL lub MariaDB utrzymywanego przez dostawcę i sprawdź je z docelową rewizją. Stare progi instalatora dla MySQL 5.6 i MariaDB 10.0 nie oznaczają wsparcia na lata 2026–2027. W `main` tabele `poller_output`, `poller_output_boost` i `poller_output_realtime` używają InnoDB; niektóre tabele koordynacyjne nadal używają MEMORY. Nie zmieniaj wszystkich tabel na jeden silnik. Wypełnij `mysql.time_zone_name` i przyznaj kontu aplikacji dostęp SELECT do tej tabeli.

## RRDtool

Skonfiguruj bezwzględną ścieżkę pliku wykonywalnego i dopasuj ustawioną wersję do zainstalowanej. `DCOUNTER` i `DDERIVE` wymagają RRDtool 1.5 lub nowszego. Lokalna pamięć masowa w Unix wymaga sprawdzania tożsamości POSIX i działającego `flock` na katalogach. Zatrzymaj zewnętrzne procesy zapisujące i demony pamięci podręcznej przed konserwacją wymagającą wyłączności. Starsza ścieżka proxy istnieje, ale nie gwarantuje zweryfikowanego wdrożenia.

## net-snmp

Zainstaluj narzędzia Net-SNMP, gdy PHP `snmp` jest niedostępne lub wyłączone. Ustaw `path_snmpget`, `path_snmpgetnext`, `path_snmpwalk`, `path_snmpbulkwalk` i `path_snmptrap` na ścieżki odpowiednich plików wykonywalnych. Sprawdź wybraną ścieżkę z wersją SNMP urządzenia, w tym SNMPv3 przez IPv6, jeśli dotyczy; starszy instalator odradza PHP `snmp` w takim połączeniu.

## Serwer WWW

Uruchamiaj PHP przez skonfigurowane środowisko WWW i używaj TLS. Zachowaj starsze trasy obok `/app.php/...`; nie zmieniaj całego katalogu głównego dokumentów na `public/`, dopóki pozostają starsze strony. Skonfiguruj PATH_INFO dla punktu zgodności. Nginx ignoruje `.htaccess`; przed obsługą PHP zastosuj jawne reguły blokujące źródła, konfigurację, zależności, narzędzia, testy, sekrety i stan wykonania. Prefiks URL musi odpowiadać `$url_path`.

## Harmonogram

Używaj jednego mechanizmu uruchamiania: cron, Harmonogramu zadań albo dostarczonej usługi demona kolektora. Dopasuj częstotliwość do skonfigurowanego odstępu uruchamiania. Zbieranie częstsze niż raz na minutę działa wewnątrz tego odstępu; sam cron nie zapewnia takiej częstotliwości. Wykonuj kontrole z konta pollera po zatrzymaniu zwykłego mechanizmu uruchamiania, aby uniknąć nakładania się zadań.

## System plików

Przyznaj dostęp do faktycznych ścieżek RRD, dzienników, pamięci podręcznych i katalogów wykonawczych Symfony tylko potrzebnym kontom. Domyślny katalog RRD to `rra/`. Oddzielne konta Unix dla WWW i pollera wymagają jawnych identyfikatorów numerycznych w `rrd_maintenance_trusted_uids`, a dla grup z prawem zapisu w `rrd_maintenance_trusted_gids`, w `include/config.php`. Każdy członek tych grup musi być zaufany. Zwykłe uprawnienia nadal obowiązują; pamięć masowa zapisywalna dla wszystkich jest odrzucana. Stosuj te same ustawienia zaufania dla wszystkich procesów zapisujących i sprawdź oba konta przed aktualizacją.

## Uprawnienia

Uruchamiaj proces WWW i poller na dedykowanych kontach bez podwyższonych uprawnień. Surowy ICMP wymaga dodatkowych uprawnień systemu operacyjnego; bez nich używaj kontroli TCP, UDP lub SNMP. Nie uruchamiaj całej aplikacji jako root tylko po to, aby włączyć ping. Windows nie ma walidacji ACL wymaganej do destrukcyjnej konserwacji lokalnych RRD; zwykłe aktualizacje używają synchronicznych potwierdzeń RRDtool. Wyniki przepustowości w Unix nie potwierdzają wydajności Windows.

## O wersji PHP

Przy planowaniu na lata 2026–2027 PHP 8.4 otrzymuje aktywne wsparcie do 31 grudnia 2026 r. i poprawki bezpieczeństwa do 31 grudnia 2028 r. PHP 8.5 otrzymuje aktywne wsparcie do 31 grudnia 2027 r. i poprawki bezpieczeństwa do 31 grudnia 2029 r. To terminy projektu PHP, nie macierz zgodności Kadupul. Przetestuj nowe środowiska z zablokowanymi zależnościami przed wdrożeniem. Niższe minimum PHP samego Symfony nie obniża minimum 8.4 dla Kadupul. Przed wdrożeniem ponownie sprawdź oficjalne harmonogramy i docelową rewizję.

[Strojenie bazy danych](/pl/guides/tune-database-performance/) · [Integracja RRDtool](/pl/reference/rrdtool-integration/) · [SNMP](/pl/reference/snmp/) · [Układ plików](/pl/reference/file-layout/) · [Instalacja](/pl/start/install/) · [Wymagania aktualizacji pamięci masowej](https://github.com/kadupulhq/kadupul/blob/d579c33c60cca7e4c9d84dbd9e1b2c6ba5492daf/docs/testing/spikekill-safety.md) · [Wspierane wersje PHP](https://www.php.net/supported-versions.php)
