---
title: Model bezpieczeństwa
description: Gdzie niezaufane dane trafiają do Kadupul, który proces działa z jakimi uprawnieniami, co może zrobić konto bazy danych i które granice kod wymusza, zamiast jedynie zakładać.
banner:
  content: Kadupul jest w wersji pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej.
sidebar:
  order: 12
---

System monitorowania jest trudny do obrony z trzech powodów, które nie mają nic wspólnego z jakością
kodu.

Przechowuje poświadczenia do wszystkiego, co obserwuje. Wspólnoty SNMP, nazwy użytkowników i hasła
v3 oraz wszystko inne, czego potrzebuje urządzenie, są zapisywane, aby poller mógł z nich korzystać
bez nadzoru. Nie ma człowieka, który wpisywałby je ręcznie co pięć minut.

Wykonuje polecenia zgodnie z harmonogramem. Zebranie wartości, której SNMP nie udostępnia, oznacza
uruchomienie skryptu, a definicja tego skryptu to konfiguracja przechowywana w bazie danych i edytowalna
z poziomu interfejsu.

Pobiera dane wytwarzane przez monitorowane maszyny. Opis interfejsu, punkt montowania dysku, nazwa
czujnika: wszystko to pochodzi z urządzenia i wszystko trafia do bazy danych, do tytułów wykresów i
do argumentów przekazywanych innym programom. Przejęty przełącznik staje się źródłem danych wejściowych,
a nie tylko ofiarą.

Żadne z tych zjawisk nie jest wadą. Wynikają one z natury zadania. Poniżej przedstawiono miejsce
każdego z tych elementów w architekturze.

## Gdzie trafiają niezaufane dane wejściowe

Cztery punkty wejścia, w przybliżonej kolejności stopnia kontroli sprawowanej przez operatora.

| Punkt wejścia | Źródło | Dokąd trafia |
|---|---|---|
| Parametry HTTP | Każdy, kto ma dostęp do serwera WWW | Baza danych, wyjście strony i SQL |
| Wartości SNMP | Odpytywane urządzenie | `host_snmp_cache`, tytuły wykresów, granice RRD, argumenty skryptów |
| Dane wyjściowe skryptu | Lokalny skrypt lub cel, z którym się komunikował | `poller_output`, następnie pliki RRD |
| Przesłane szablony i pakiety | Każdy, kto posiada obszar importu | Wiersze szablonów oraz, w przypadku pakietów, pliki na dysku |

### Parametry HTTP

Funkcje pomocnicze żądań znajdują się w `lib/html_utility.php`. Funkcja `get_filter_request_var()`
domyślnie przeprowadza walidację liczb całkowitych, ale obsługuje również przypadki szczególne dla
wartości pustych, niezdefiniowanych i wyrażeń regularnych. Obiekt wywołujący nadal musi sprawdzić, czy
wartość jest wymagana i odpowiednia dla danej operacji. Filtrowanie nie ustanawia autoryzacji.

Funkcja `set_request_var()` buforuje wartość w `$_CACTI_REQUEST` i odzwierciedla ją w tablicach
żądań. Funkcja `get_nfilter_request_var()` odczytuje tę pamięć podręczną lub surowe żądanie i sama
nie sprawdza poprawności ani nie zapisuje wartości. Kolejne odczyty mogą zatem zaobserwować wcześniej
zapisaną wartość, a kolejność odczytu ma kluczowe znaczenie.

Przy włączonej opcji `log_validation` funkcja `get_request_var()` rejestruje niektóre niebuforowane
odczyty żądań. Bezpośrednie odczyty zmiennych superglobalnych oraz `get_nfilter_request_var()` nie są
w pełni objęte rejestracją. Jest to pomoc diagnostyczna, a nie kompletny audyt walidacji czy mechanizm
wymuszania reguł.

### Wartości SNMP

Wykrywanie zapytań o dane zapisuje wybrane indeksowane wartości w `host_snmp_cache`; zwykłe wyniki
odpytywania SNMP podążają ścieżką próbek. Funkcja `data_query_format_record()` w pliku
`lib/data_query.php` stosuje dwie transformacje przed zapisaniem: opcjonalną mapę `rewrite_value`
z definicji zapytania oraz `bin2hex()` dla każdej wartości, której kodowania funkcja
`mb_detect_encoding()` nie jest w stanie zidentyfikować. Ta druga operacja stanowi ochronę przed
ciągami bajtów binarnych, a nie przed złośliwą zawartością.

Stamtąd wartość przemieszcza się dalej. Nadaje nazwy wykresom poprzez `substitute_snmp_query_data()`.
Może ustawić maksimum w pliku RRD, ponieważ szablon danych może zadeklarować swoje maksimum jako
`|query_ifSpeed|`. Staje się argumentem zapytania skryptowego, gdzie funkcja
`get_script_query_path()` najpierw przepuszcza każdą część przez `cacti_escapeshellarg()`.

Ucieczka znaków oraz walidatory RRDtool opisane w
[Integracja z RRDtool](/pl/reference/rrdtool-integration/) stanowią tutaj granicę. Dane z urządzeń
muszą pozostać traktowane jako niezaufane. Walidacja i ucieczka znaków to właściwości każdego miejsca
wywołania; obecność funkcji pomocniczych nie dowodzi, że każdy konsument używa ich poprawnie. Sprawdź
zarówno strukturę polecenia, jak i podstawiany argument.

### Dane wyjściowe skryptu

Gałąź `popen()` funkcji `exec_poll()` odczytuje dane za pomocą `fgets(..., 8192)`, zwracając
maksymalnie 8191 bajtów lub do pierwszego znaku nowej linii. Jej wariant awaryjny `shell_exec()` ma
inne zachowanie wyjściowe, a zbieranie danych przez serwer skryptów podąża osobną ścieżką.

Funkcja `prepare_validate_result()` rozpoznaje wartości numeryczne i nieznane, formaty szesnastkowe
oraz niektóre struktury wyjściowe z wieloma polami. Może również usuwać tekst w celu uzyskania wartości
liczbowej; nie jest to uniwersalny, ścisły filtr skalarny. Dalsze parsowanie i walidacja RRDtool również
mają znaczenie. Zobacz [Metody wprowadzania danych](/pl/reference/data-input-methods/).

Kontrola danych wyjściowych nie zamyka w piaskownicy skryptu, który został już wykonany. Sprawdź
polecenie, białą listę danych wejściowych i uprawnienia systemu operacyjnego przed włączeniem zbierania.

### Szablony i pakiety

Dwa różne mechanizmy współdzielą jeden obszar uprawnień.

**Import szablonu** to zwykły plik XML bez podpisu. Tworzy szablony, zapytania o dane i metody
wprowadzania danych. Metoda wprowadzania danych to linia poleceń, więc jest to ścieżka od przesłanego
pliku do elementu, który wykona poller. Plik `lib/import.php` uruchamia
`cacti_input_string_is_safe()` na każdym zaimportowanym `input_string` i odrzuca metodę, jeśli
zawiera metaznaki powłoki, logując komunikat:

```
ERROR: Refusing to import data input method '<hash>' - input_string contains shell metacharacters
```

**Import pakietu** jest podpisany cyfrowo. Funkcja `import_read_package_data()` odczytuje klucz
publiczny osadzony w pakiecie i porównuje go z trzema kluczami skompilowanymi w `lib/import.php`:
dwoma kluczami Cacti i kluczem Kadupul. Każdy inny klucz kończy się błędem. Pakiet bez elementu
`<publickey>` jest odczytywany jako deklarujący starszy klucz Cacti, a następnie musi wygenerować
podpis, który zostanie pomyślnie zweryfikowany. Funkcja `import_read_package_data()` odrzuca każdy
klucz poniżej 2048 bitów przed próbą weryfikacji, czego starszy klucz (512 bitów) nie spełnia. Każdy
zawarty plik posiada własny podpis, weryfikowany osobno.

Pakiety mogą następnie zapisywać wybrane pliki. Akceptowane nazwy zaczynają się od `scripts/` lub
`resource/`, opcjonalnie z prawidłowym prefiksem `plugins/<name>/`. Importer odrzuca bajty NUL,
przechodzenie między katalogami i ścieżki bezwzględne oraz sprawdza ograniczenie do katalogu głównego
instalacji; samo zawieranie nazwy katalogu nie wystarcza. Uprawnienia zapisu w miejscu docelowym
również decydują o powodzeniu zapisu. Pakiet, który pomyślnie przejdzie weryfikację, celowo zapisuje
wykonywalny kod PHP w strukturze instalacji. Weryfikacja podpisu potwierdza akceptowaną tożsamość
i integralność, a nie nieszkodliwość kodu. Autoryzacja obszaru, ograniczenie ścieżek, wybrane pliki,
uprawnienia systemu plików i zasady białej listy poleceń również mają kluczowe znaczenie.

Oba mechanizmy znajdują się za obszarem 17. Standardowa rola Edytor Szablonów posiada obszar 17 i
obszar 2 (Metody wprowadzania danych). Konto z tymi uprawnieniami może definiować polecenia zbierania
danych, z zastrzeżeniem walidacji i obsługi białej listy. Do tego służy ta rola i warto o tym wiedzieć
przed jej przyznaniem. Zobacz [Importowanie i eksportowanie szablonów](/pl/guides/import-and-export-templates/)
w celu zapoznania się ze zwalidowanym przepływem pracy i znanymi ograniczeniami.

## Co działa z jakimi uprawnieniami

| Proces | Uruchamiany przez | Działa jako | Zadanie |
|---|---|---|---|
| Interfejs WWW | Serwer WWW | Użytkownik serwera WWW | Odczytuje i zapisuje w bazie danych, renderuje wykresy przez RRDtool, zapisuje pliki RRD na żądanie, zapisuje pliki pakietów podczas importu |
| `poller.php` | Harmonogram lub usługa | Konto usługi/harmonogramu | Odczytuje pamięć podręczną pollera, uruchamia kolektory, zapisuje pliki RRD |
| `cmd.php` | Poller lub ścieżka zbierania w czasie rzeczywistym | Konto uruchamiające | Wykonuje zapytania SNMP i polecenia zbierania |
| `script_server.php` | Kolektor | Konto uruchamiające | Dołącza plik PHP i wywołuje funkcję we własnym procesie |
| RRDtool | Proces WWW lub poller | Wywołujący proces | Odczytuje i zapisuje pliki w `rra/` |

Dwa z nich zasługują na bliższe przyjrzenie się:

**Serwer skryptów nie jest piaskownicą.** Dołącza plik docelowy do długo działającego procesu PHP i
wywołuje w nim funkcję. Ta funkcja współdzieli proces, jego pamięć i połączenie z bazą danych. Testy w
`script_server.php` decydują o tym, czy wywołanie w ogóle nastąpi: `realpath()` dołączanego pliku
musi rozwiązywać się wewnątrz `$config['base_path']` lub `$config['scripts_path']`, funkcja musi
istnieć po dołączeniu, `ReflectionFunction::isInternal()` musi zwracać false, a plik definiujący
funkcję musi również znajdować się pod dozwolonym katalogiem bazowym. Po spełnieniu tych warunków kod
działa z pełnymi uprawnieniami pollera. Metoda serwera skryptów to sposób uruchamiania PHP wewnątrz
Kadupul, a nie obok niego.

**Proces WWW może zapisywać pliki RRD.** Żądania wykresów mogą wyzwalać aktualizacje Boost na żądanie i
tworzenie plików. Ostrzeżenie odraczające tworzenie jednego katalogu do pollera nie oznacza, że dostęp
do zapisu przez serwer WWW jest całkowicie opcjonalny. Wstępna kontrola pamięci masowej i koordynacja
konserwacji sprawdzają również dostęp do konta oraz konfigurację zaufanych identyfikatorów UID/GID.
Tworzenie z poziomu konta root próbuje dopasować własność pamięci masowej, ale błędy mogą być
rejestrowane w dzienniku. Zobacz [Bezpieczna aktualizacja](/pl/guides/upgrade-safely/).

Konta serwera WWW i zaplanowanego pollera mogą się różnić. Zbieranie danych w czasie rzeczywistym
uruchomione z żądania WWW może dziedziczyć konto WWW, więc wykonywanie poleceń nie jest ograniczone do
tożsamości zaplanowanego pollera. Odziedziczona integracja ze Spine wymaga oddzielnej weryfikacji z
rzeczywistym plikiem binarnym; ta strona nie określa obsługiwanej kompilacji.

## Czego wymaga konto bazy danych

Procesy korzystające z tej samej konfiguracji bazy danych zwykle współdzielą jej konto. Zdalne
kolektory mogą mieć oddzielne poświadczenia lokalne i centralne; konfiguracja specyficzna dla wdrożenia
może się różnić. Sprawdź rzeczywiste uprawnienia dla każdego skonfigurowanego konta.

| Wymaganie | Dlaczego |
|---|---|
| Pełne uprawnienia DML w schemacie Kadupul | Zwykłe działanie |
| Uprawnienia DDL w schemacie Kadupul | Aktualizacje i operacje w czasie działania, takie jak rotacja tabel Boost, tabele tymczasowe i zmiany cyklu życia wtyczek |
| `SELECT` na `mysql.time_zone_name` | Listy stref czasowych witryny i kolektorów odczytują tę tabelę bezpośrednio |

Nie usuwaj uprawnień DDL przy założeniu, że tylko aktualizacje ich potrzebują. Aplikacja nie przełącza
się uniwersalnie na oddzielną tożsamość migracyjną; separacja kont wymaga walidacji specyficznej dla
danego wdrożenia we wszystkich dotkniętych ścieżkach wykonania.

Plik `include/config.php` zawiera poświadczenia bazy danych, a zdalne kolektory mogą również
przechowywać centralne poświadczenia `$rdatabase_*`. Uprawnienia systemu plików, reguły dostępu HTTP,
konfiguracja procedur obsługi PHP i ochrona kopii zapasowych są niezwykle istotne. PHP zwykle wykonuje
plik zamiast serwować jego kod źródłowy, ale nie zastępuje to ochrony przed bezpośrednim ujawnieniem.
Zobacz [Zabezpieczanie instalacji dostępnej z Internetu](/pl/guides/secure-an-internet-facing-install/).

Poświadczenia urządzeń są przechowywane w ten sam sposób. `host.snmp_community`, `host.snmp_password`
i `host.snmp_priv_passphrase` to zwykłe kolumny, zapisywane przez `api_device_save()` za
pośrednictwem `form_input_validate()` bez etapu szyfrowania, i kopiowane do wierszy `poller_item`
w celu odczytania przez poller. Dostęp do odczytu odpowiednich tabel może ujawnić przechowywane
poświadczenia; nie oznacza to dostępu do każdego zewnętrznego źródła danych. Hasła użytkowników stanowią
wyjątek: funkcja `compat_password_hash()` używa funkcji `password_hash()` w PHP z parametrem
`PASSWORD_DEFAULT`, a starszy skrót MD5, który nadal przechodzi weryfikację, jest ponownie haszowany
przy następnym logowaniu.

## Wymuszone i jedynie konwencjonalne

To rozróżnienie ma największe znaczenie podczas analizowania zmian w kodzie.

### Mechanizmy w kodzie i ich zakres

| Granica | Mechanizm |
|---|---|
| Uwierzytelnianie | Typowe strony interfejsu używają `include/auth.php`; wyspecjalizowane punkty końcowe mają własną obsługę |
| CSRF | Współdzielony bootstrap konfiguruje obsługę tokenów; nieprawidłowe tablice tokenów są odrzucane. Sprawdź każdy punkt końcowy zamiast zakładać uniwersalne pokrycie |
| Skrypty tylko dla CLI | `include/cli_check.php` zwraca błąd `404` i kończy działanie, gdy SAPI to nie `cli` |
| Lokalizacja XML zapytania o dane | `cacti_path_is_within()` względem `<base_path>/resource`, rejestrowana i odrzucana w przeciwnym razie |
| Autentyczność pakietu | Podpis weryfikowany względem wbudowanego klucza, minimum 2048 bitów, podpisy dla poszczególnych plików |
| Umieszczanie plików pakietu | Nieprawidłowe nazwy odrzucane; dozwolone prefiksy skryptów/zasobów i ograniczenie do katalogu głównego sprawdzane |
| Cele serwera skryptów | Ograniczenie przez `realpath()` oraz powyższe kontrole funkcji |
| Argumenty powłoki | Ucieczka znaków, ustrukturyzowane funkcje pomocnicze i walidatory tam, gdzie mają zastosowanie; sprawdź rzeczywiste miejsce wywołania |
| Argumenty RRDtool | Walidatory znaków sterujących i formatu w `lib/functions.php` |
| SQL | Przygotowane zapytania wiążą wartości; dynamiczny SQL, identyfikatory i wywołania nieprzygotowane nadal wymagają przeglądu |
| Wywołujący zdalnego agenta | Adres źródłowy musi odpowiadać włączonemu wierszowi w `poller`, przez dokładny adres IP lub potwierdzone wyszukiwanie wsteczne |

### Odpowiedzialność wdrożenia i miejsc wywołania

| Granica | Dlaczego nie jest wymuszana |
|---|---|
| Filtrowanie żądań | Strona wybiera `get_filter_request_var()` lub nie. `log_validation` raportuje, ale nie blokuje |
| Ucieczka danych wyjściowych | `html_escape()` i `html_purify()` są stosowane indywidualnie dla każdego miejsca wywołania |
| Autoryzacja na stronę | Kontrola obszaru używa `$user_auth_realm_filenames`, indeksowanego według nazwy pliku. Niezmapowana strona nie otrzymuje autoryzacji z samej tej mapy. Mogą mieć zastosowanie dodatkowe kontrole; strony wtyczek muszą rejestrować i egzekwować własne zasady |
| Blokada katalogów | Pliki `.htaccess` w `cli/`, `log/`, `rra/`, `scripts/`, `contrib/`, `mibs/` i `cache/*` to dyrektywy Apache. Pod nginx lub Apache z wyłączoną opcją `AllowOverride` żadna z nich nie ma zastosowania |
| Nagłówki bezpieczeństwa plików statycznych | `.htaccess.dist` jest dostarczany bez zmiany nazwy. Emisja nagłówków PHP zależy od ścieżki odpowiedzi i ustawień; odpowiedzi statyczne zależą od konfiguracji serwera/proxy |
| Rozdzielenie użytkowników WWW i pollera | Konwencja, a nie sztywny wymóg |
| Uprawnienia do `include/config.php` | Ustawiane przez osobę instalującą |

Pliki przekierowań `index.php` w katalogu `resource/` i jego podkatalogach zatrzymują listowanie
zawartości katalogu. Nie stanowią one kontroli dostępu i nie blokują bezpośredniego żądania o konkretny
plik.

## Punkty końcowe odpowiadające przed uwierzytelnieniem

Oto przykłady wyspecjalizowanych punktów wejścia, a nie wyczerpujący wykaz publicznych punktów
końcowych. Brak wspólnego pliku dołączanego nie dowodzi braku uwierzytelniania lub autoryzacji w innym
miejscu ścieżki żądania.

| Plik | Zachowanie |
|---|---|
| `auth_login.php`, `auth_changepassword.php` | Sam interfejs logowania |
| `csp_report.php` | Odbiera raporty o naruszeniach CSP z przeglądarki |
| `service_check.php` | Odpowiada `success` lub `fail` po jednym zapytaniu do tabeli `version`. Sonda aktywności bez uwierzytelniania |
| `link.php` | Ładuje wiersz łącza zewnętrznego, a następnie samodzielnie sprawdza `is_realm_allowed($page['id'] + 10000)` |
| `remote_agent.php` | RPC kolektora danych, autoryzowane na podstawie adresu źródłowego |

Skrypt `remote_agent.php` wymaga szczególnej uwagi. Jego autoryzacja opiera się na funkcji
`remote_client_authorized()`, która porównuje wynik `get_client_addr()` z nazwami hostów i
adresami w tabeli `poller`. Nie ma tu wspólnego sekretu. Wywołujący, którego adres odpowiada
wierszowi włączonego kolektora danych, może wywoływać akcje agenta: odpytywać dane, wykonywać zapytania
o dane, pingować urządzenie, wykonywać zapytania SNMP get i walk, żądać danych wykresów oraz uruchamiać
wykrywanie sieci. Kształtują to dwa zabezpieczenia. Po pierwsze, funkcja zwraca false, gdy zwrócony
zostanie co najwyżej jeden wiersz włączonego kolektora, co powoduje odrzucenie takiego przypadku. Po
drugie, gdy dopasowanie następuje według nazwy hosta, a nie dokładnego adresu IP, wyszukiwanie wsteczne
jest potwierdzane wyszukiwaniem w przód przed zaakceptowaniem.

Funkcja `get_client_addr()` odczytuje `REMOTE_ADDR` i nic więcej, chyba że w pliku
`include/config.php` ustawiono parametr `$proxy_headers`. Domyślną wartością jest `null`.
Włączenie obsługiwanych nagłówków proxy zmienia uporządkowane źródła, z których wybierany jest prawidłowy
adres klienta. Używaj tylko nagłówków kontrolowanych przez zaufany serwer proxy i uniemożliwiaj klientom
omijanie lub samodzielne dostarczanie tych wartości. Jest to pojedyncza linia konfiguracji, która
najbardziej zmienia znaczenie każdej decyzji opartej na adresie w systemie, w tym autoryzacji zdalnego
agenta i adresów zapisywanych w dzienniku.

## Dostęp gościnny

Ustawienie `guest_user` wskazuje konto, którego uprawnienia są używane dla stron wykresów bez
logowania. Domyślnie żaden użytkownik nie jest ustawiony, a przeglądanie wykresów wymaga wówczas
uwierzytelnienia, jak każda inna operacja. Ustawienie tej opcji publikuje wszystko, co to konto może
zobaczyć, każdemu, kto ma dostęp do serwera WWW. Taki jest zamysł tej funkcji. Konto nadal istnieje w
rekordach użytkowników; ustawienie gościa sprawia, że jego uprawnienia do wykresów stają się użyteczne
bez normalnego logowania. Weryfikuj rzeczywiste żądania i uprawnienia do obiektów, a nie tylko
skonfigurowaną nazwę konta.

## Jak analizować wprowadzaną zmianę

Zadaj trzy pytania w następującej kolejności:

Który proces to uruchomi i jako jaki użytkownik? Odpowiedzią dla metody wprowadzania danych jest zwykle
konto systemu operacyjnego uruchamiającego kolektora; zbieranie wyzwalane przez WWW może różnić się od
zbierania zaplanowanego.

Czego dotykają dane po drodze? Wartość z urządzenia, która trafia wyłącznie do pliku RRD, przekroczyła
jedną granicę. Ta sama wartość w tytule wykresu przekroczyła dwie, a w argumencie skryptu — trzy.

Czy granica, na której polegam, jest wymuszana przez kod, czy jedynie konwencjonalna? Jeśli jest
konwencjonalna, pisany kod stanowi jej jedyne faktyczne wymuszenie.

Powiązane dokumenty: [Uprawnienia i dostęp](/pl/concepts/permissions-and-access/) w celu poznania samego
modelu autoryzacji, [Metody wprowadzania danych](/pl/reference/data-input-methods/) w celu zapoznania się
z kontraktem wykonywania i białą listą danych wejściowych oraz
[Zdalne zbieranie danych](/pl/concepts/remote-data-collection/), aby sprawdzić, co kolektor danych robi
z powierzonym mu zaufaniem.
