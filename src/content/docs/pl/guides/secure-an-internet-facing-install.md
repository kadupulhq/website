---
title: Zabezpieczanie instalacji wystawionej do Internetu
description: Co zmienić, zanim system monitorowania z dostępem powłoki do Twojej sieci zacznie odpowiadać na żądania z publicznego Internetu.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 9
---

:::caution[Sprawdź przed użyciem]
Kod źródłowy jest dostępny, ale nie ma obsługiwanego wydania Kadupul ani ścieżki
migracji. Przetestuj te procedury na odizolowanej kopii z kopiami zapasowymi, zanim
na nich polegasz. Zobacz [status projektu](/pl/project/status/).
:::

Zacznijmy od szczerej odpowiedzi: umieść go za VPN-em. Kadupul przechowuje dane uwierzytelniające
SNMP każdego monitorowanego urządzenia w postaci jawnego tekstu i wykonuje polecenia na własnym
hoście w ramach standardowego działania. Żadna konfiguracja nie sprawia, że wystawienie go do
publicznego Internetu staje się dobrym pomysłem.

Poniższe kontrole pomagają ocenić izolowaną instalację. Nie tworzą one obsługiwanego ani
bezpiecznego wdrożenia publicznego; interpretując wyniki, pamiętaj o powyższym zastrzeżeniu
dotyczącym statusu projektu.

## TLS

Kończ połączenia TLS na serwerze WWW lub na pośredniczącym serwerze proxy. Kadupul nie nasłuchuje
na własnym gnieździe sieciowym.

Następnie włącz ustawienie przekierowujące zwykłe żądania HTTP na HTTPS. Jest ono domyślnie
wyłączone (`off`). Bez niego formularz logowania jest serwowany przez HTTP, a hasło wędruje
przez sieć otwartym tekstem, zanim jakiekolwiek inne mechanizmy zdążą zadziałać.

Aplikacja ustawia flagę Secure pliku cookie sesji, gdy PHP otrzyma niepustą wartość zmiennej
`$_SERVER['HTTPS']` inną niż `off`. Za proxy kończącym TLS skonfiguruj zaufany serwer WWW
lub warstwę FastCGI tak, aby poprawnie przekazywały stan HTTPS, i sprawdź wynikowy nagłówek
`Set-Cookie` w przeglądarce.

Zmienna `$proxy_headers` kontroluje rozpoznawanie adresów klientów. Nie ustawia ona zmiennej
serwera HTTPS ani nie włącza plików cookie z flagą Secure. Ufaj wyłącznie nagłówkom adresowym
ustawianym przez Twoje proxy, usuwaj kopie przesyłane przez klientów i blokuj bezpośredni dostęp
do backendu. Wymuszaj przekierowania z HTTP na HTTPS na publicznym serwerze proxy przed przesłaniem poświadczeń.

Aplikacja ustawia parametry HttpOnly oraz SameSite=Strict dla swojego pliku cookie sesji. Sprawdź
rzeczywiste zachowanie plików cookie i przekierowań na granicy wdrożenia; flagi te nie gwarantują,
że wszystkie inne pliki cookie współdzielą tę samą konfigurację. Zobacz
[dokumentację konfiguracji sesji PHP](https://www.php.net/manual/en/session.configuration.php).

## Domyślne poświadczenia

Dostarczony schemat zawiera jedno konto administracyjne o nazwie `admin`, którego hashem hasła
jest MD5 ciągu `admin`. Jest ono oznaczone jako wymagające zmiany przy pierwszym logowaniu.
Upewnij się, że zmiana rzeczywiście nastąpiła, zamiast zakładać to z góry. Monit wymuszający zmianę
jest pomijany w przypadku uwierzytelniania HTTP Basic, w którym to serwer WWW zdecydował już o tożsamości użytkownika.

Następnie przejrzyj poświadczenia, które nie są kontami użytkowników:

- Konto bazy danych ma domyślnie nazwę `cactiuser` z hasłem `cactiuser` w dostarczonym szablonie konfiguracji.
- Podsystem automatyzacji dostarcza domyślne opcje SNMP zawierające community strings `public` i `private` oraz parę loginu i hasła SNMPv3. Są to wartości domyślne skanowania, a nie konfiguracja urządzeń, lecz to właśnie te ciągi zostaną wypróbowane w pierwszej kolejności podczas wykrywania.

Polityka haseł jest konfigurowalna. Wartości domyślne wymagają ośmiu znaków oraz mieszanej wielkości
liter. Wygasanie haseł oraz blokada konta po wielokrotnych nieudanych próbach są dostępne i obie te
funkcje są domyślnie wyłączone. W instalacji wystawionej do Internetu włącz blokadę konta.

## Uprawnienia bazy danych

Przykład instalacji korzysta z uprawnień na poziomie bazy danych oraz dostępu do tabeli stref
czasowych. Zastąp te przykładowe nazwy kont i baz danych oraz zweryfikuj uprawnienia pod kątem
rzeczywistych zadań wdrożeniowych i konserwacyjnych:

```sql
GRANT ALL ON kadupul.* TO 'someuser'@'localhost';
GRANT SELECT ON mysql.time_zone_name TO 'someuser'@'localhost';
```

To drugie uprawnienie nie jest opcjonalne. Obsługa stref czasowych odczytuje tę tabelę, a instalator
sprawdza dostęp i obecność danych o strefach. Przeanalizuj dodatkowe uprawnienia pod kątem
rzeczywistych wymagań konserwacyjnych i kolektorów przed ich usunięciem; ten przykład nie oznacza,
że każde wdrożenie wymaga dokładnie takich samych przywilejów.

Ważne uwagi dotyczące zakresu:

- Powiąż bazę danych z localhostem lub prywatnym interfejsem, a nie z adresem, na którym odpowiada serwer WWW.
- Nadaj każdemu zdalnemu kolektorowi danych odrębne konto bazy danych. Ich poświadczenia znajdują się w centralnej bazie danych oraz w ich własnym pliku konfiguracyjnym; odrębne konta ułatwiają atrybucję i unieważnianie uprawnień. Same w sobie nie izolują one przejętego kolektora, jeśli jego uprawnienia nadal pozwalają na zapis w centralnej bazie.
- Połączenie obsługuje protokół TLS, konfigurowany przy użyciu klucza, certyfikatu i ścieżki CA w pliku konfiguracyjnym. Korzystaj z niego zawsze, gdy baza danych znajduje się na osobnym hoście.
- Skonfiguruj plik konfiguracyjny tak, aby był czytelny dla użytkownika serwera WWW i niezapisywalny ani przez użytkownika WWW, ani przez użytkownika usługi pollera w trakcie normalnej pracy. Zachowaj jego własność na koncie administracyjnym. Instalator zdalnego pollera weryfikuje wprost, czy może zmodyfikować plik; nie zakładaj, że każda instalacja serwera głównego wymaga takich samych tymczasowych uprawnień zapisu.
- Klucz tajny CSRF może być przechowywany w pliku zamiast w bazie danych. Jeśli wybierzesz tę opcję, plik musi bezwzględnie znajdować się poza głównym katalogiem dokumentów (document root). Jest to wymóg, a nie sugestia.

## Trzymanie katalogów danych poza document rootem

We wdrożeniu opartym na katalogu głównym repozytorium prywatne dane i katalogi z kodem źródłowym
mogą znajdować się poniżej serwowanego katalogu głównego. Kilka katalogów zawiera reguły odmowy
`.htaccess`; zrób inwentaryzację rzeczywistego stanu repozytorium i konfiguracji serwera, zamiast
zakładać, że każda ścieżka jest zabezpieczona. Obecna częściowa migracja frameworka oznacza również,
że przestawienie całego serwisu na `public/` bez zachowania starych tras nie stanowi pełnej procedury wdrożenia.

Pliki te działają tylko na serwerze Apache i tylko wtedy, gdy konfiguracja zezwala na nadpisywanie
reguł w danym katalogu. Na serwerze nginx pozostają bezużyteczne. Na błędnie skonfigurowanym serwerze
Apache również. Bezużyteczna reguła deny-all przed katalogiem dzienników oznacza, że każdy może odczytać
dziennik Twojej aplikacji, który zawiera nazwy urządzeń, nazwy użytkowników, treść zapytań i szczegóły błędów.
Apache dokumentuje wymagane zachowanie w swoim [przewodniku po `.htaccess`](https://httpd.apache.org/docs/2.4/howto/htaccess.html).

Wykonaj oba poniższe kroki:

**Sprawdź ścieżki magazynu przed przeniesieniem danych.** Miejsca zapisu dzienników są konfigurowalne,
ale `include/global.php` ustawia bazę RRA na katalog `rra` instalacji; brak jest ogólnego ustawienia
katalogu RRA w interfejsie użytkownika. Oddzielnie zamontowany magazyn może zachować tę oczekiwaną
ścieżkę, lecz samo położenie w systemie plików nie blokuje dostępu przez HTTP za pośrednictwem serwowanego
katalogu lub dowiązania symbolicznego. Sprawdź łącznie istniejące ścieżki źródeł danych, uprawnienia
usług, kopie zapasowe i reguły blokowania HTTP. Nie przenoś struktur pamięci podręcznej bez sprawdzenia,
jak korzystające z nich komponenty rozwiązują pliki. Zobacz [Migracja na nowy sprzęt](/pl/guides/migrate-to-new-hardware/)
oraz [Bezpieczna aktualizacja](/pl/guides/upgrade-safely/).

**Zablokuj prywatne ścieżki na serwerze WWW.** Dostosuj zawarty w kodzie źródłowym
[przykład Nginx dla katalogu głównego repozytorium](https://github.com/kadupulhq/kadupul/blob/661a57ff43ebf275e6b07211d4284dd727103959/tests/e2e/nginx.conf)
do rzeczywistego prefiksu URL i serwera; reguły odmowy muszą mieć pierwszeństwo przed ogólną obsługą PHP.
Poniższa lista stanowi pomoc inwentaryzacyjną, a nie gotową konfigurację serwera:

| Katalog | Dlaczego |
|---|---|
| `rra/` | Pliki pomiarów |
| `log/` | Dziennik aplikacji, w tym szczegóły zapytań i błędów |
| `cache/` | Kontrola zamierzonego dostępu do zasobów; blokowanie wykonywania kodu PHP w ścieżkach pamięci podręcznej |
| `scripts/` | Kod zbierający nie może być bezpośrednio serwowany ani wywoływany przez HTTP |
| `cli/` | Narzędzia wiersza poleceń, które nie powinny być dostępne przez HTTP |
| `mibs/`, `contrib/`, `docs/` | Zasoby wewnętrzne i dokumentacja |
| `src/`, `config/`, `templates/`, `var/`, `lib/`, `bin/`, `tests/`, `tools/` | Elementy wewnętrzne aplikacji, stan i narzędzia |
| Pliki ukryte (dotfiles), manifesty zależności, wewnętrzne pliki PHP include/bootstrap | Metadane repozytorium i wewnętrzne punkty wejścia |

Zachowaj wymagane zasoby publiczne, takie jak `include/js` oraz `include/themes`; bezwzględne
zablokowanie całego katalogu includes może uszkodzić interfejs. Zweryfikuj odmowę dostępu przy użyciu
nieszkodliwych ścieżek testowych i upewnij się, że odpowiedzi nie ujawniają kodu źródłowego ani
zawartości plików. Nie wykonuj testów poprzez pobieranie prawdziwych danych poufnych do terminala lub dziennika.

Dostępny jest także opcjonalny plik nagłówków bezpieczeństwa dla zasobów statycznych. Odpowiedzi PHP
ustawiają własne nagłówki w kodzie; pliki statyczne tego nie robią, chyba że włączysz ten plik lub
umieścisz odpowiednie dyrektywy w konfiguracji serwera.

Polityka bezpieczeństwa treści (CSP) jest konfigurowalna. Domyślna polityka skryptów zezwala na
inline JavaScript bez nonce, ponieważ polegają na tym wtyczki. Bardziej rygorystyczny tryb z nonce,
widoczny w Ustawieniach, działa wyłącznie w trybie raportowania. Implementacja nagłówków akceptuje
również wymuszanie `nonce`, mimo [nieaktualnej pomocy w Ustawieniach](https://github.com/kadupulhq/kadupul/issues/265).
Wymuszanie a tryb samego raportowania to odrębne kwestie; sprawdź nagłówki i przetestuj wszystkie
wymagane strony oraz wtyczki przed zmianą trybu. Zaimplementowane wymuszanie nie oznacza pełnej kompatybilności z nonce.

## Poller wykonuje polecenia

To jest element, który diametralnie zmienia model zagrożeń.

Zbieranie danych to nie tylko SNMP. Metoda wprowadzania danych może definiować linię poleceń,
a poller ją wykonuje. Linia poleceń jest zapisywana w pamięci podręcznej pollera i wykonywana przez
kolektor w każdym interwale z uprawnieniami użytkownika systemu operacyjnego kolektora. Dane wejściowe
serwera skryptów PHP korzystają z osobnego, długo działającego procesu PHP. Polecenia zewnętrzne
i wejścia serwera skryptów to odrębne ścieżki; nie zakładaj, że każdy skrypt działa wewnątrz tego
serwera ani że kolektor C został zwalidowany dla tego wydania.

Traktuj poniższe uprawnienia jako wysoce uprzywilejowane obszary konfiguracji pozwalające na
wykonywanie kodu. Ich dokładne skutki zależą od włączonych funkcji i mechanizmów walidacji:

| Uprawnienie | Dlaczego |
|---|---|
| Metody wprowadzania danych | Definiuje bezpośrednio linię poleceń |
| Import szablonów | Zaimportowany szablon lub pakiet może zawierać metodę wprowadzania danych |
| Administracja wtyczkami | Kod wtyczki wykonuje się wewnątrz aplikacji |
| Ustawienia / Narzędzia | Kontroluje ścieżki do plików binarnych, które są uruchamiane |

Nie przyznawaj ich nikomu, kto nie posiada już dostępu do powłoki na tym hoście. Użytkownik z prawem
wyłącznie do odczytu, który może przeglądać wykresy, to zupełnie inna rola i to właśnie taką rolę
powinna posiadać niemal każda osoba.

Istnieją dwa mechanizmy kontrolne i warto stosować oba:

**Ograniczenie znaków specjalnych.** Metaznaki powłoki w ciągach poleceń wprowadzania danych są
domyślnie blokowane. Istnieje ustawienie pozwalające na ich dopuszczenie, wprowadzone dla starych
definicji wykorzystujących potoki powłoki. Pozostaw je wyłączone. Jeśli posiadasz definicje, które
tego wymagają, przenieś potok do skryptu w katalogu scripts i wywołuj ten skrypt.

**Biała lista wejść.** Plik wskazany w pliku konfiguracyjnym, zawierający zatwierdzone ciągi poleceń
przyporządkowane do metod wprowadzania danych. Gdy jest skonfigurowany, wykresy i źródła danych nie
mogą być tworzone na podstawie metody wprowadzania danych, której polecenie nie znajduje się na liście.
Zmiana zatwierdzonego polecenia powoduje błąd dopasowania, dopóki przejrzana biała lista nie zostanie
zaktualizowana. Ponowne wygenerowanie jest krokiem w wierszu poleceń i o to właśnie chodzi: wymaga
dostępu do powłoki na hoście, a nie sesji administracyjnej w przeglądarce.

Sprawdzanie jest ponawiane przy przebudowie pamięci podręcznej pollera. Dane wejściowe, które nie
przejdą weryfikacji, nie generują zadań pollera, a wszelkie pozostawione przez nie wiersze są usuwane
podczas następnej zatwierdzonej przebudowy/zrzutu. Reguluje to tworzenie i wypełnianie pamięci podręcznej;
nie stanowi natychmiastowego mechanizmu anulowania trwających prac ani dowodu, że każdy kolektor
przeładowuje zmienioną białą listę przed każdym uruchomieniem. Zweryfikuj zatwierdzony stan pamięci
podręcznej i zachowanie kolektora po zmianie zasad.

```sh
php cli/input_whitelist.php --audit
# After reviewing this data input's command; 42 is an example data-input ID.
php cli/input_whitelist.php --update --id=42
```

Opcja `--update` bez ograniczeń akceptuje bieżące definicje poleceń na białej liście; nie używaj
jej zamiast ich rzetelnego audytu. Chroń białą listę i jej katalog nadrzędny przed zapisem przez
użytkowników usług. Mechanizm jest nieaktywny, dopóki nie zostanie skonfigurowany. Zobacz
[Pisanie skryptu zbierającego dane](/pl/guides/write-a-data-collection-script/) w celu uzyskania
szczegółów dotyczących wyboru i formatu wyjściowego.
Podnosi to poprzeczkę dla przejęcia uprawnień administracyjnych z poziomu przeglądarki, ponieważ
wprowadzenie nowego polecenia do procesu zbierania danych wymaga teraz również uprawnień zapisu
w systemie plików na hoście pollera. Nadal nie zwalnia to z konieczności ograniczania uprawnień
z powyższej tabeli, gdyż atakujący mający dostęp do zatwierdzonego polecenia nie musi dodawać nowego.

## Uwierzytelnianie

Dostarczane są cztery metody. Ich dostępność zależy od zainstalowanych rozszerzeń PHP.

| Metoda | Gdzie weryfikowani są użytkownicy | Uwagi |
|---|---|---|
| Wbudowana | Lokalna baza danych | Hasła, zasady i blokady są obsługiwane lokalnie |
| HTTP Basic | Serwer WWW | Kadupul ufa informacjom o użytkowniku przekazanym przez serwer |
| LDAP | Pojedynczy katalog | Wymaga rozszerzenia PHP LDAP |
| Wiele domen LDAP/AD | Kilka katalogów | To samo wymaganie |

Przełącznik w Ustawieniach udostępnia te metody uwierzytelniania, z pominięciem przestarzałego
trybu zerowego. Skrypt startowy uwierzytelniania podejmuje próbę migracji starej konfiguracji bez
uwierzytelniania na uwierzytelnianie lokalne, lecz funkcje pomocnicze niższego poziomu nadal zawierają
gałęzie trybu zerowego. Sprawdź zapisaną metodę, skonfigurowane tożsamości i rzeczywiście chronione
trasy, zamiast traktować brak opcji w interfejsie jako powszechny dowód.

Kwestie do weryfikacji:

- **HTTP Basic deleguje walidację tożsamości.** Kadupul odczytuje zmienne tożsamości uwierzytelnione przez serwer po wybraniu tego trybu i nadal stosuje mapowanie kont, stan włączenia oraz reguły autoryzacji. Brakująca tożsamość nie oznacza automatycznie administratora. Skonfiguruj serwer tak, aby uwierzytelniał każdą zamierzoną trasę i uniemożliwiał klientom przesyłanie zaufanych zmiennych tożsamości; zweryfikuj trasy obrazów/eksportu oraz celowe zachowanie gości niezależnie.
- **Obsługa opcji „Nie wylogowuj mnie”** jest domyślnie włączona. Trwały token jest tworzony, gdy użytkownik wybierze tę opcję po uwierzytelnieniu, a nie automatycznie dla każdej sesji. Wygasa po dziewięćdziesięciu dniach bezczynności. W instalacji wystawionej do Internetu podejmij świadomą decyzję, czy chcesz z niej korzystać.
- **Ustaw użytkownika-gościa na brak (nobody)**, chyba że celowo wymagasz anonimowego przeglądania wykresów. Domyślnie żaden użytkownik nie jest ustawiony, co stanowi właściwy wybór; upewnij się, że nie zmieniono tego podczas instalacji.
- **Zastosuj uwierzytelnianie wieloskładnikowe (MFA) przed aplikacją.** Aplikacja nie posiada wbudowanego MFA. Właściwym miejscem na jego wdrożenie jest proxy uwzględniające tożsamość lub brama SSO.

## Punkty końcowe zdalnych kolektorów danych

W przypadku korzystania ze zdalnych kolektorów instalacja centralna udostępnia punkt końcowy,
z którym się łączą. Nie uwierzytelnia się on sesją użytkownika. Autoryzuje wywołania poprzez
rozpoznanie adresu wywołującego i dopasowanie go do nazw hostów zarejestrowanych kolektorów,
rejestrując niepowodzenia w kategorii bezpieczeństwa.

Wynikają z tego dwa wnioski. Po pierwsze, punkt ten nie powinien być dostępny z publicznego
Internetu; ogranicz go na serwerze WWW wyłącznie do adresów kolektorów. Po drugie, sprawdzany adres
klienta pochodzi z żądania, więc skonfigurowane wcześniej zaufanie do nagłówków przekazywania
ma zastosowanie również tutaj. Zaufanie do nagłówków, których nie kontrolujesz, pozwala wywołującemu
podszyć się pod adres kolektora.

Ponadto ustawienie zezwalające na samopodpisane certyfikaty i niezgodności nazw hostów podczas
komunikacji serwera centralnego z kolektorem jest domyślnie włączone. Wygeneruj prawdziwe certyfikaty
dla swoich kolektorów i wyłącz tę opcję.

## Minimalna lista kontrolna

1. Zakończony TLS, przekierowanie HTTP przed logowaniem, stan HTTPS w PHP skonfigurowany przez zaufany serwer oraz zweryfikowane pliki cookie Secure. Nagłówki adresów klientów ograniczone do tych, które ustawia i oczyszcza proxy.
2. Domyślne hasło administratora zmienione i potwierdzone. Blokada konta włączona.
3. Uprawnienia bazy danych zweryfikowane pod kątem ról instalacyjnych, konserwacyjnych i kolektorów; dostęp do stref czasowych potwierdzony, a dostęp sieciowy do bazy ograniczony do wymaganych klientów.
4. Ścieżki magazynu sprawdzone, prywatne katalogi i metadane zablokowane na serwerze WWW, a niezbędne zasoby statyczne w pełni funkcjonalne.
5. Plik konfiguracyjny niezapisywalny w czasie działania. Plik klucza CSRF, jeśli jest używany, poza katalogiem document root.
6. Uprawnienia do Metod wprowadzania danych, Importu szablonów i Administracji wtyczkami nieprzyznane nikomu bez powłoki na hoście pollera. Ograniczenie znaków specjalnych włączone. Biała lista wejść skonfigurowana.
7. Punkt końcowy zdalnego kolektora ograniczony według adresów IP. Weryfikacja certyfikatów włączona.
8. MFA wdrożone na serwerze proxy przed całą instalacją.
