---
title: "Instalacja"
description: "Czego Kadupul potrzebuje do działania i kolejność składania całości."
sidebar:
  order: 2
banner:
  content: "Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język."
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Przejdź przez to jeden raz, po kolei. Każdy krok kończy się weryfikacją. Wykonaj
weryfikację przed przejściem dalej: każdy wymieniony tutaj błąd łatwo znaleźć teraz,
a bardzo trudno po tym, jak poller działał już przez tydzień.

## Czego potrzebujesz na początek

Kadupul to aplikacja PHP, która przechowuje konfigurację w bazie danych MySQL lub MariaDB,
a pomiary zapisuje w plikach RRD na dysku. Ta strona opisuje nową instalację na serwerze
głównym z bieżącego kodu źródłowego gałęzi `main`, a nie uaktualnienie czy zarchiwizowaną
linię LTS. Zanim aplikacja zadziała, muszą istnieć cztery elementy.

| Komponent | Dlaczego jest potrzebny |
|---|---|
| PHP 8.4 lub nowsze, w wydaniu wspieranym pod kątem bezpieczeństwa | Uruchamia interfejs webowy i poller |
| MySQL lub MariaDB | Przechowuje urządzenia, szablony, użytkowników oraz pamięć podręczną pollera |
| RRDtool | Tworzy i aktualizuje archiwa round-robin oraz renderuje wykresy |
| net-snmp | Zapewnia narzędzia klienckie i biblioteki używane do odpytywania urządzeń |

PHP wymaga również rozszerzeń określonych w
[manifeście aplikacji](https://github.com/kadupulhq/kadupul/blob/main/composer.json),
w tym `pdo_mysql`, `gd`, `sockets`, `gmp`, `intl`, `ldap`, `mbstring`,
`pcntl`, `posix` oraz `sqlite3`. Zainstaluj je zarówno dla środowiska wiersza poleceń,
jak i serwera WWW. Dokument [Wymagania](/pl/reference/requirements/) rozróżnia wymagania
Composera od osobnych testów instalatora.

## Krok 1: zainstaluj środowisko uruchomieniowe

Zainstaluj PHP wraz z rozszerzeniami, serwer bazy danych, RRDtool oraz net-snmp
z pakietów swojej dystrybucji.

**Sprawdź to.**

```bash
php -v
php -m | sort
rrdtool --version
snmpget --version
```

`php -m` musi zawierać wymagane rozszerzenia. Rozszerzenie PHP `snmp` jest opcjonalne,
gdy dostępne są narzędzia wiersza poleceń net-snmp. Composer sprawdza własne wymagane
rozszerzenia podczas instalacji zależności; instalator webowy wykonuje osobne sprawdzenie
rozszerzeń. Mechanizm zapasowy w czasie wykonywania nie usuwa wymogu Composera.

Konfiguracje PHP dla wiersza poleceń i serwera WWW mogą się różnić. Sprawdź obie.
Instalator zaleca `memory_limit` o wartości co najmniej 400M oraz
`max_execution_time` wynoszący co najmniej 60 sekund; akceptuje także wartości bez limitu
(odpowiednio `-1` oraz `0`). Wartości poniżej tych zaleceń generują ostrzeżenia,
natomiast brakujące `date.timezone` jest błędem. Ustaw jawną strefę czasową,
taką jak `UTC`, i użyj `php --ini`, aby zidentyfikować konfigurację wiersza poleceń.

## Krok 2: utwórz bazę danych i jej użytkownika

Utwórz jedną pustą bazę danych oraz jednego użytkownika z uprawnieniami do tej bazy.
W przypadku lokalnej bazy danych uruchom ten kod SQL jako administrator bazy danych,
zmieniając przykładowe hasło przed użyciem:

```sql
CREATE DATABASE kadupul CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kadupul'@'localhost' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON kadupul.* TO 'kadupul'@'localhost';
```

Użyj odpowiedniego hosta konta bazy danych, jeśli PHP łączy się z innej maszyny.

Serwer bazy danych wymaga również wypełnienia tabel stref czasowych, a użytkownik Kadupul
potrzebuje do nich dostępu do odczytu w bazie danych `mysql`. Jest to jedyne uprawnienie
poza jego własnym schematem. Nic w systemie monitorowania na to nie wskazuje, a wymóg
ten nie jest opcjonalny; poniższy test bez tego zakończy się niepowodzeniem.

```bash
# Populate the tables, then grant the one extra read the installer needs.
mysql_tzinfo_to_sql /usr/share/zoneinfo | mysql -u root -p mysql
mysql -u root -p -e "GRANT SELECT ON mysql.time_zone_name TO 'kadupul'@'localhost';"
```

**Sprawdź to.** Zaloguj się jako użytkownik bazy danych Kadupul i uruchom:

```sql
SELECT COUNT(*) FROM mysql.time_zone_name;
```

Oczekiwany wynik to liczba większa od zera zwrócona bez błędu uprawnień. Zero oznacza,
że tabele nigdy nie zostały załadowane; błąd oznacza, że użytkownik nie może ich odczytać.
Oba przypadki zatrzymują instalator.

Cztery ustawienia samego serwera są na tyle istotne, że należy je skorygować już teraz.

| Ustawienie | Oczekiwane | Dlaczego |
|---|---|---|
| `max_allowed_packet` | 16M lub więcej | Duże synchronizacje między serwerem głównym a zdalnymi kolektorami |
| `character_set_server`, `collation_server` | `utf8mb4`, `utf8mb4_unicode_ci` | Opisy urządzeń zawierają znaki wielobajtowe |
| `innodb_file_per_table` | On | Utrzymuje przestrzenie tabel oddzielnie i ułatwia zarządzanie |
| `innodb_buffer_pool_size` | Około jednej czwartej pamięci systemowej | Utrzymuje aktywny zbiór roboczy w pamięci RAM |

Instalator sam odczytuje te wartości i wskazuje braki, więc nie musisz przyjmować tej tabeli
na wiarę. Dokument [Strojenie wydajności bazy danych](/pl/guides/tune-database-performance/)
omawia ten temat szczegółowiej, gdy pojawi się obciążenie.

## Krok 3: rozpakuj, popraw prawa własności i udostępnij

Umieść aplikację w miejscu, z którego serwer WWW może ją udostępniać, a następnie zdecyduj,
który użytkownik systemowy jest jej właścicielem. Ta decyzja ma większe znaczenie niż lokalizacja.
Dwa procesy zapisują tutaj dane: serwer WWW oraz cokolwiek harmonogramuje poller. Uruchamiaj
oba jako tego samego użytkownika. Uruchamiaj poller bez podwyższonych uprawnień i nadaj obu
procesom dostęp, którego potrzebują. Nieprawidłowe uprawnienia lub prawa własności mogą
uniemożliwić późniejsze aktualizacje, nawet jeśli wykresy się generują.

### Jeśli sklonowano repozytorium zamiast rozpakować wydanie

Kopia z Gita wymaga zarówno zależności PHP, jak i wygenerowanych zasobów przeglądarkowych. Po
zainstalowaniu środowisk wykonawczych z pliku `mise.toml` repozytorium uruchom w katalogu głównym:

```bash
mise exec -- php "$(command -v composer)" install --no-dev --optimize-autoloader
mise exec -- npm ci --ignore-scripts
mise exec -- npm run build
mise exec -- php bin/console about
```

Composer wypełnia `include/vendor/` i przywraca przypięte pliki zgodności.
Kompilacja npm tworzy zasoby w katalogach `include/js/`, `include/fa/` oraz
`include/vendor/flag-icons/`. Sam Composer nie wystarcza do instalacji ze źródeł.

Kompletna paczka offline z zależnościami to odrębny artefakt budowania. Zwykłe archiwum
kodu z GitHuba nie jest tą paczką. Skorzystaj z
[procedury kompilacji i weryfikacji offline](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md#offline-installation),
gdy host docelowy nie ma dostępu do Internetu.

Przygotuj ścieżki zapisu po zainstalowaniu zależności:

| Grupa | Katalogi | Zapisywalne kiedy |
|---|---|---|
| Podczas instalacji | `resource/snmp_queries`, `resource/script_server`, `resource/script_queries`, `scripts` | Tylko podczas instalacji lub aktualizacji |
| Podczas instalacji | `include/vendor/csrf/` lub skonfigurowana lokalizacja `path_csrf_secret` | Instalator musi utworzyć sekret specyficzny dla instalacji; zachowaj go później |
| Zawsze | `log`, `cache/boost`, `cache/mibcache`, `cache/purifier`, `cache/realtime`, `cache/spikekill`, systemowy katalog tymczasowy | Przez cały okres działania instalacji |
| Środowisko Symfony | `var/cache` oraz `var/log`, jeśli skonfigurowano logowanie do plików | Dla środowiska PHP i użytkownika rozgrzewającego pamięć podręczną |

Katalog RRD również musi być zapisywalny przez cały okres działania instalacji. Zawiera on
twoją historię, więc zadbaj o niego tak samo, jak o katalog bazy danych.

Obecna migracja nadal wymaga starszych tras logowania, instalatora i wtyczek. W przypadku tej
połączonej instalacji udostępniaj katalog główny repozytorium z jawnymi regułami blokującymi dostęp
do katalogów prywatnych, konfiguracji, zależności i stanu wykonania. Nie przestawiaj całej instalacji
na `public/`: usunęłoby to starsze trasy będące w ciągłym użyciu. Osobny punkt końcowy Symfony
ma inny routing; zobacz [instrukcje migracji](https://github.com/kadupulhq/kadupul/blob/main/docs/symfony-migration.md).

W przypadku Nginx zacznij od
[reguł lokalizacji Nginx](https://github.com/kadupulhq/kadupul/blob/main/tests/e2e/nginx.conf)
z repozytorium, dostosowując katalog główny oraz upstream PHP-FPM. Umieść reguły odrzucania przed
ogólną obsługą PHP i zachowaj PATH_INFO dla `/app.php/...`. Nginx nie odczytuje pliku `.htaccess`.
Zadbaj o to, aby pliki RRD, dzienniki i sekrety były niedostępne przez HTTP; zweryfikuj rzeczywistą
konfigurację serwera, zamiast zakładać, że same uprawnienia plików uniemożliwiają ich serwowanie.

**Sprawdź to.** Przełącz się na użytkownika pollera, zapisz plik w każdym katalogu grupy stałej,
a następnie go usuń. Uprawnienie, które wygląda poprawnie w `ls -l`, może być nadal blokowane przez
SELinux lub AppArmor, a zapisanie pliku to jedyny test, który to weryfikuje. Następnie zażądaj pliku
z katalogu dzienników przez HTTP. Oczekujesz odmowy dostępu.

## Krok 4: utwórz plik konfiguracyjny

W przypadku nowej instalacji skopiuj dostarczony plik konfiguracyjny:

```bash
cp include/config.php.dist include/config.php
```

Nie nadpisuj konfiguracji istniejącej instalacji. Ustaw hosta bazy danych, nazwę, użytkownika
i hasło z kroku 2. Dwie inne wartości mają znaczenie przy pierwszej instalacji: `url_path`,
czyli ścieżka, pod którą udostępniana jest aplikacja (z początkowym i końcowym ukośnikiem),
oraz `poller_id`, który wynosi `1` na serwerze głównym, a inną wartość przyjmuje tylko na zdalnym kolektorze.

Pozostaw blok zdalnego kolektora zakomentowany. Jeszcze go nie konfigurujesz; dokument
[Zdalne zbieranie danych](/pl/concepts/remote-data-collection/) opisuje to, kiedy nadejdzie czas.
Każde inne ustawienie ma działającą wartość domyślną, więc przeczytaj
[Konfiguracja](/pl/reference/configuration/) przed wprowadzeniem jakichkolwiek zmian.

Skonfiguruj specyficzny dla wdrożenia `APP_SECRET` w środowisku procesów PHP dla funkcji
Symfony, które z niego korzystają. Bootstrap domyślnie przyjmuje `APP_ENV=prod` oraz
`APP_DEBUG=0` i nie ładuje plików `.env`. Jest to niezależne od sekretu CSRF starszego instalatora.

**Sprawdź to.** Sprawdź składnię bez wyświetlania danych uwierzytelniających:

```bash
php -l include/config.php
```

Zaimportuj schemat w następnym kroku przed otwarciem instalatora w przeglądarce.

## Krok 5: zaimportuj schemat

Instalator oczekuje, że tabele już istnieją. Załaduj dostarczony schemat do utworzonej bazy danych:

```bash
mysql -u kadupul -p kadupul < cacti.sql
```

Zrób to jeden raz, na pustej bazie danych. To nie jest skrypt aktualizacyjny; zaimportowanie
go do bazy zawierającej dane może zakończyć się błędem lub pozostawić sprzeczne i niekompletne dane.

## Krok 6: uruchom instalator

Otwórz witrynę w przeglądarce i przejdź przez proces instalacji. Instalator prowadzi przez
ustaloną sekwencję kroków, z których każdy warunkuje kolejny:

1. Powitanie i licencja.
2. Sprawdzenie zależności: wersja i rozszerzenia PHP, ustawienia PHP z kroku 1 zarówno
   dla wiersza poleceń, jak i serwera WWW, tabele stref czasowych oraz ustawienia bazy danych
   z kroku 2. Błędy blokują przycisk dalej. Ostrzeżenia tego nie robią, ale należy je przeczytać.
3. Typ instalacji: nowy serwer główny lub zdalny kolektor.
4. Sprawdzenie uprawnień: katalogi z kroku 3, testowane przez próbę zapisu.
5. Lokalizacje plików binarnych: ścieżki do PHP, RRDtool i narzędzi net-snmp.
6. Profil źródeł danych i interwał uruchamiania.
7. Wybór szablonów: które szablony urządzeń załadować.
8. Konwersja tabel, potwierdzenie i właściwa instalacja.

Punkt 6 na tej liście to ten, który trudno cofnąć. Wybrany profil określa krok i zestaw archiwów
zapisywany w każdym pliku RRD utworzonym w przyszłości, a edycja profilu nie migruje istniejących
plików. Zmiany retencji wymagają osobnej, przetestowanej migracji; nie zawsze wymagają one odrzucania
historii. Jeśli liczą się wartości szczytowe, upewnij się, że profil zachowuje maksima, a nie tylko
średnie: przeczytaj [Źródła danych i archiwa round-robin](/pl/concepts/data-sources-and-rras/)
przed przejściem dalej. Oferowany tam interwał uruchamiania to jedna minuta lub pięć minut. Profil
źródła danych określa interwał zbierania; mechanizm uruchamiający i profil muszą być skonfigurowane spójnie.

## Krok 7: zmień domyślne poświadczenia

Dostarczony schemat tworzy konto administratora o nazwie `admin` z hasłem `admin`, oznaczone tak,
że pierwsze logowanie wymusza zmianę hasła. Tworzy także wyłączone konto gościa. Zmień hasło,
zanim instancja stanie się dostępna dla kogokolwiek innego – czyli zanim podłączysz ją do sieci,
z której inni mogą uzyskać do niej dostęp.

## Krok 8: zaplanuj poller

Poller musi być uruchamiany z zewnątrz. Skonfiguruj jego interwał zbierania oraz interwał
uruchamiania w spójny sposób; poller obsługuje interwały uruchamiania wynoszące jedną minutę
lub pięć minut i posiada zabezpieczenie przed zbyt wczesnym uruchomieniem kolejnego cyklu. W przypadku
uruchamiania co minutę dodaj ten wpis do tabeli crontab nieuprzywilejowanego użytkownika pollera,
zastępując `php` i ścieżkę do aplikacji ich ścieżkami bezwzględnymi:

```
* * * * * php -q /path/to/kadupul/poller.php > /dev/null 2>&1
```

lub uruchom dostarczonego demona `cactid.php` za pomocą `service/cactid.service`, dostosowanego
do ścieżki instalacji i nieuprzywilejowanego użytkownika. Używaj jednego mechanizmu uruchamiania:
wyłącz zadanie cron lub timer w przypadku korzystania z demona.

Dopasuj rzeczywisty harmonogram do skonfigurowanego interwału uruchamiania. W przypadku profili
zbierania danych częstszych niż minuta uruchomiony poller wykonuje cykle zbierania wewnątrz tego
interwału; nie próbuj definiować częstotliwości poniżej jednej minuty za pomocą tego wpisu cron.

**Sprawdź to.** Uruchom ręcznie jeden cykl jako użytkownik pollera:

```bash
php -q /path/to/kadupul/poller.php --force --debug
```

`--force` pomija blokadę czasową chroniącą przed zbyt wczesnym uruchomieniem. Przeprowadź to
ręczne sprawdzenie przy zatrzymanym harmonogramie, aby nie nakładało się na zaplanowane zadanie.
Nie omija to innych kontroli konserwacyjnych ani bezpieczeństwa. Oczekujesz czystego zakończenia
z wierszem podsumowania. Następnie włącz harmonogram i pozostaw go na dwa interwały; upewnij się,
że kolejny przebieg odbył się bez twojego udziału.

## Co może pójść nie tak

Oto problemy, na które rzeczywiście można natrafić podczas pierwszej instalacji.

| Symptom | Przyczyna | Gdzie szukać |
|---|---|---|
| Instalator zatrzymuje się na poprawnie wyglądających ustawieniach PHP | Serwer WWW i wiersz poleceń czytają różne pliki `php.ini` | `php --ini` oraz plik zgłaszany przez SAPI serwera WWW |
| Instalator zatrzymuje się na strefach czasowych | Tabele stref czasowych nie zostały załadowane lub użytkownik Kadupul nie może ich odczytać | `SELECT COUNT(*) FROM mysql.time_zone_name` |
| Krok uprawnień kończy się błędem w katalogu, który wydaje się zapisywalny | Nieprawidłowy właściciel lub SELinux i AppArmor | Zapisz plik jako użytkownik pollera |
| Instalacja zakończona, dane nigdy nie napływają | Poller nigdy nie został zaplanowany | Uruchom `poller.php --force --debug` ręcznie |
| Dane spływają przez kilka cykli, potem nic | Poller działa jako niewłaściwy użytkownik, pozostawiając pliki, których użytkownik WWW nie może zaktualizować | Właściciel plików w katalogu RRD |
| Wykresy pełne małych przerw | Zaplanowany interwał i skonfigurowany interwał są niezgodne | Crontab w odniesieniu do skonfigurowanego interwału |
| Composer odmawia instalacji | Wersja PHP jest niższa niż 8.4 lub brakuje rozszerzenia wymaganego przez manifest | `php -v`, `php -m` oraz komunikat błędu Composera |
| Poller nie może uruchomić więcej niż jednego procesu | Brak `pcntl` lub `posix` | `php -m` |

Dokument [Dzienniki](/pl/reference/logging/) omawia miejsca rejestrowania zdarzeń. Dokument
[Rozwiązywanie problemów z brakującymi danymi](/pl/guides/troubleshoot-missing-data/) omawia przypadek,
gdy instalacja jest prawidłowa, a problem dotyczy jednego urządzenia.

## Zanim udostępnisz instalację

Poller działa jako użytkownik systemowy i wykonuje RRDtool oraz twoje skrypty zbierające dane.
Traktuj tę instalację jako środowisko wykonujące polecenia – bo dokładnie tym ona jest.

- Udostępniaj ją przez TLS.
- Nie pozostawiaj domyślnego hasła administratora, nawet na chwilę.
- Ogranicz użytkownika bazy danych wyłącznie do jego własnej bazy danych.
- Trzymaj katalogi RRD i dzienników poza głównym katalogiem dokumentów serwera WWW (document root).
- Pozostaw konto gościa wyłączone, chyba że wyraźnie zdecydujesz inaczej.

Dokument [Zabezpieczanie instalacji dostępnej z Internetu](/pl/guides/secure-an-internet-facing-install/)
omawia pozostałe kwestie. Dalej: [Dodaj pierwsze urządzenie](/pl/start/first-device/).
