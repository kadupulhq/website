---
title: Uprawnienia i dostęp
description: Dlaczego dostęp jest podzielony na dwa niezależne systemy, dlaczego uprawnienie jest przechowywane jako domyślne plus wyjątki i dlaczego drzewo wygląda inaczej dla każdego konta.
banner:
  content: Kadupul jest w fazie pre-alpha. Sprawdź te procedury w odizolowanej instalacji testowej. Tłumaczenie robocze oczekujące na weryfikację przez osobę biegle znającą język.
sidebar:
  order: 8
---

Kontrola dostępu obejmuje oddzielne testy obszarów (realms) oraz zasad obiektów. Obszary określają, z jakich
funkcji interfejsu konto może korzystać; zasady obiektów decydują o dozwolonych wykresach, urządzeniach,
szablonach i drzewach. Żądanie może zależeć od obu tych elementów. Przyznanie obszaru nie daje samo w sobie
dostępu do wykresów, a przyznanie dostępu do wykresów nie daje uprawnień do funkcji konsoli. Stan konta,
tryb uwierzytelniania i ustawienia widoku również mają znaczenie.

Ta strona wyjaśnia, dlaczego model ma taki kształt. Informacje o praktycznych aspektach tworzenia konta
znajdziesz w [Zarządzanie użytkownikami i uprawnieniami](/pl/guides/manage-users-and-permissions/).

## Dlaczego dwa systemy

Te dwa pytania dotyczą zupełnie różnych zagadnień.

Dostęp do strony dotyczy kodu. Konto ma uprawnienia do uruchomienia edytora urządzeń albo ich nie ma, i
istnieje jedna odpowiedź dla całej instalacji. Wyświetlenie urządzenia dotyczy danych. Istnieją tysiące
urządzeń i odpowiedź jest inna dla każdego z nich.

Ich połączenie oznaczałoby konieczność definiowania uprawnienia dla każdej strony dla każdego obiektu,
co stanowi iloczyn dwóch stale rosnących list. Rozdzielenie ich daje jedną stałą i niewielką listę sekcji
interfejsu oraz jeden zestaw reguł dla poszczególnych obiektów. Kosztem tego podziału jest konieczność
skonfigurowania obu obszarów; konto błędnie skonfigurowane w którymkolwiek z nich objawia się taką samą blokadą dostępu.

## Obszary (realms) to stała numerowana lista

Obszar identyfikuje uprawnienie do interfejsu za pomocą liczby. Mapowania rdzenne wiążą strony z obszarami,
podczas gdy wtyczki mogą rejestrować dodatkowe obszary. Sprawdzaj wymagane obszary i tożsamość dla
rzeczywistej trasy, zamiast traktować dostęp do strony jako pełną decyzję o autoryzacji obiektów.

Używane są liczby, a nie nazwy plików, ponieważ obszar obejmuje kilka stron, a nazwy stron mogą ulec zmianie.
Liczba pozostaje stała; powiązana z nią lista plików to mapowanie, które można zmienić bez modyfikowania kont.

Obszary konta pochodzą z niego samego oraz z włączonych grup, do których ono należy, połączonych w relacji
sumy. Role to zestawy numerów obszarów stosowane w jednej operacji. Rola przypisuje swoje numery do konta
i jej działanie się kończy: stanowi punkt wyjścia, a nie dynamiczne łącze, więc konto utworzone na podstawie
roli nie ulega zmianie, gdy sama rola zostanie zmodyfikowana.

Wtyczki dodają własne obszary, przechowywane oddzielnie i posiadane przez konta dokładnie tak samo jak
obszary bazowe. Wtyczka wprowadza zatem nową przestrzeń podlegającą kontroli dostępu, którą Twoje zasady
muszą wyraźnie zweryfikować. Zobacz [Wtyczki](/pl/concepts/plugins/).

## Obiekty są przechowywane jako domyślne plus wyjątki

Cztery rodzaje obiektów posiadają uprawnienia: wykresy, urządzenia, szablony wykresów oraz drzewa.

Dla każdego rodzaju konto (lub grupa) posiada jedną zasadę domyślną oraz listę wyjątków. Wyjątek to
pojedynczy wiersz: kto, jaki obiekt, jaki rodzaj. Wiersz ten wygląda identycznie w obu trybach zasad.
To zasada decydują o tym, co dany wiersz oznacza.

Jest to kluczowa decyzja konstrukcyjna w całym modelu. W tabelach wyjątków zapisywane są wyłącznie
odstępstwa od reguły domyślnej. Domyślne zasady Zezwalaj (Allow) bez wyjątków mogą zapewnić szeroki
dostęp bez wierszy wyjątków; wiersze konta, wartości domyślnych i obszarów nadal istnieją. Pięć wyraźnie
dozwolonych urządzeń przy domyślnej zasadzie Odmawiaj (Deny) wymaga pięciu wyjątków dla urządzeń, chociaż
inne uprawnienia i metody wykresów mogą wpłynąć na widoczność. Niezależnie od przyjętego podejścia,
przechowywane dane zachowują rozmiar odpowiadający części istotnej, a nie całemu inwentarzowi.

## Dlaczego istnieją oba tryby zasad

| Tryb | Znaczenie | Zachowanie przy dodaniu urządzenia |
|---|---|---|
| Zezwalaj, z wyjątkami | Obiekty tego rodzaju z wyjątkiem wymienionych wykluczeń | Zasada urządzeń zezwala na nowy obiekt; inne kontrole nadal obowiązują |
| Odmawiaj, z wyjątkami | Wyłącznie wymienione obiekty tego rodzaju | To źródło nie przyznaje nowego urządzenia; inne źródła lub uprawnienia do wykresów mogą zezwolić na dostęp |

Zasady domyślne różnią się sposobem traktowania nowych obiektów. Dobieraj zakres zasad i zachowanie w
przypadku błędów w sposób przemyślany; żadne z tych ustawień nie opisuje samodzielnie całości kontroli dostępu.

„Wszyscy w dziale sieciowym, z wyjątkiem dwóch szaf należących do księgowości” to dwa wiersze przy Zezwalaj
i cztery tysiące przy Odmawiaj. „Ten zewnętrzny wykonawca i tylko te pięć urządzeń” to pięć wierszy przy
Odmawiaj i cztery tysiące przy Zezwalaj. Wymuszenie jednego trybu sprawiłoby, że połowa rzeczywistych
zasad musiałaby być tworzona poprzez wypisanie całego inwentarza, a tak długa lista nigdy nie jest utrzymywana w czystości.

Domyślna zasada Zezwalaj obejmuje nowo dodane obiekty danego rodzaju, chyba że zostaną wykluczone. Domyślna
zasada Odmawiaj wymaga jawnego wyjątku z tego źródła. Są to reguły semantyczne zasad domyślnych, a nie
gwarancje dotyczące obsługi błędów. Przeanalizuj innych użytkowników/grupy oraz metody uprawnień do wykresów,
zanim uznasz, że domyślne Odmawiaj na urządzeniach ukrywa powiązane wykresy.

## Dostęp jest sumą i nie ma odmowy

Efektywny dostęp jest oceniany dla własnej zasady konta oraz dla każdej włączonej grupy, do której ono
należy. W przypadku dostępu do wykresów najpierw zastosuj wybraną metodę w ramach każdego źródła osobno,
a następnie zsumuj te wyniki. W metodzie Restrykcyjnej (Restrictive) uprawnienie do urządzenia w jednej
grupie i do szablonu w innej nie tworzą wymaganej pary.

Nie istnieje odmowa grupowa, która unieważniałaby uprawnienie przyznane z innego źródła. Wykluczenie
w ramach domyślnej zasady Zezwalaj usuwa jedynie wkład tego konkretnego źródła; nie jest to odmowa
globalna. Usunięcie takiego wykluczenia rozszerza dostęp, w przeciwieństwie do usunięcia uprawnienia
przy zasadzie Odmawiaj. Jest to świadome uproszczenie: model zawierający zarówno zezwolenia, jak i zakazy
wymaga reguł pierwszeństwa, a reguły pierwszeństwa sprawiają, że audyt systemów uprawnień na podstawie
samej lektury staje się niemożliwy.

Konsekwencje tego podejścia warto sformułować bezpośrednio.

Odwołanie dostępu oznacza usunięcie go z konta oraz ze wszystkich grup, które go przyznają. Usunięcie go
w jednym miejscu niczego nie zmienia, jeśli inne miejsce nadal go udziela.

Wyłączenie grupy odbiera jej uprawnienia wszystkim członkom jednocześnie, co czyni grupę znacznie lepszym
punktem odwoływania uprawnień niż seria pojedynczych edycji.

Nie można odpowiedzieć na pytanie „co widzi to konto?”, patrząc na jeden wiersz. Należy połączyć cztery
zasady i cztery listy konta z analogicznymi danymi z każdej grupy.

## Dlaczego uprawnienia do wykresów mają cztery metody

Wykres posiada potrójną tożsamość. Jest sobą, należy do urządzenia i został utworzony na podstawie
szablonu wykresu. Wszystkie trzy elementy mogą posiadać uprawnienia, więc model musi zdecydować, która
kombinacja jest wiążąca. Decyzja ta stanowi ustawienie dla całej instalacji.

| Metoda | Zadawane pytanie | Konsultowane zestawy wyjątków |
|---|---|---|
| Permisywna (Permissive) | Czy którykolwiek z trzech elementów jest dozwolony? | Trzy |
| Restrykcyjna (Restrictive) | Czy wykres jest dozwolony, czy też urządzenie i szablon są dozwolone w ramach jednego źródła? | Trzy |
| Oparta na urządzeniu (Device based) | Czy wykres lub urządzenie jest dozwolone? | Dwa |
| Oparta na szablonie (Graph template based) | Czy wykres lub szablon jest dozwolony? | Dwa |

Zasady te opisują zaimplementowane mechanizmy autoryzacji. Bezpośrednie uprawnienia do wykresów pozostają
skuteczne we wszystkich czterech metodach; wybór metody opartej na urządzeniu ich nie unieważnia. Zmierz
wydajność przy rzeczywistych zasadach i inwentarzu zamiast zakładać, że liczba zestawów wyjątków pozwala
przewidzieć koszt zapytania.

Metoda Permisywna jest ustawieniem domyślnym i to ona najczęściej zaskakuje administratorów. Przy tej
metodzie zezwolenie na szablon wykresu pozwala na dostęp do każdego wykresu na nim opartego, na każdym
urządzeniu, w tym na urządzeniach, do których konto nigdy nie otrzymało praw. Model działa dokładnie
tak, jak opisano. Po prostu ten opis rozmija się z intuicją większości osób.

## Uprawnienia są kompilowane do zapytań

Filtrowanie uprawnień do list wykresów jest wbudowane bezpośrednio w zapytania bazodanowe. Strona
wyświetlająca dwadzieścia z czterech tysięcy wykresów nie może pobrać czterech tysięcy wierszy i odrzucić
tych, do których konto nie ma praw, ponieważ wtedy liczba elementów byłaby błędna, stronicowanie uległoby
awarii, a narzut rósłby wraz z rozmiarem inwentarza, a nie rozmiarem strony.

Z tego powodu zasady i listy wyjątków są przekształcane w klauzule złączeń (join) i warunków (where)
przekazywane do bazy danych. Model uprawnień został skonstruowany po części tak, aby przetrwać to
tłumaczenie. Zestawy identyfikatorów i flaga domyślna kompilują się bez problemu do SQL. Dowolna logika
obiektowa nie ma takiej właściwości.

Ścieżka wykresów posiada skrót dla szerokich uprawnień, w tym domyślnej zasady Zezwalaj na wykresy dla
użytkownika bez wyjątków. Nie uogólniaj tego zachowania na każdy rodzaj obiektu ani na każdą trasę.
Weryfikacja obszarów, stanu konta i widoków nadal jest konieczna; optymalizacja zapytań o uprawnienia
nie zastępuje testów dostępu.

## Drzewa to oddzielna oś

Uprawnienia do drzew i uprawnienia do wykresów są weryfikowane niezależnie. Przyznanie dostępu do drzewa
nie daje praw do jego zawartości. Posiadanie praw do wykresu nie wymaga dostępu do drzewa.

Drzewo jest prezentacją obiektów, a nie kontenerem będącym ich właścicielem. Ten sam wykres może pojawiać
się na pięciu drzewach. Gdyby drzewo przyznawało prawa do swojej zawartości, edycja drzewa byłaby edycją
uprawnień, a każdy uprawniony do organizowania wykresów mógłby je publikować.

Zamiast tego drzewo ukrywa gałęzie puste. Gałąź jest wyświetlana, gdy zawiera element widoczny dla danego
konta, a sprawdzanie schodzi w głąb: gałąź, której wszystkie podgałęzie są puste dla tego konta, sama zostaje
ukryta. Dwie osoby otwierające to samo drzewo widzą odmienne struktury i żadna z nich nie widzi symbolu
zastępczego sugerującego, co posiada druga.

Sprawdzanie pustych gałęzi nie jest bezpłatne obliczeniowo. Przechodzi ono gałąź i rekurencyjnie sprawdza
prawa do znalezionych wykresów i urządzeń. Głębokie drzewo w połączeniu z kosztowną metodą uprawnień do
wykresów negatywnie wpływa na wydajność, co stanowi kolejny powód istnienia metod uproszczonych.

Wymiar audytowy ma większe znaczenie niż wydajnościowy. **Widok drzewa nie jest raportem tego, do czego
konto ma dostęp.** Jest to raport tego, do czego konto ma dostęp *i co ktoś umieścił na tym drzewie*. Aby
przeprowadzić audyt dostępu, zbadaj zasady i sprawdź rzeczywiste dopuszczone i odrzucone żądania. Widok
Efektywnej Zasady (Effective Policy) pochodzi z implementacji odrębnej od właściwych kontroli autoryzacji,
więc jego etykieta i podpowiedź nie powinny stanowić jedynego dowodu. Zobacz
[Audyt tego, kto co widzi](/pl/guides/audit-who-can-see-what/).

## Buforowanie i dlaczego zmiany pojawiają się w nietypowych momentach

Odpowiedzi dotyczące uprawnień są buforowane w sesji, ponieważ alternatywą byłoby ponawianie tego samego
pytania na każdej stronie. Zmiana wprowadzona przez administratora oznacza buforowane odpowiedzi danego
konta jako nieaktualne, a kolejna strona załadowana przez to konto odbudowuje je bez konieczności
ponownego logowania.

Wyłączenie konta czyści trwałe dane logowania, uprawnienia w pamięci podręcznej oraz sesje po stronie
serwera. Chronione żądania sprawdzają również stan włączenia/zablokowania; strona już załadowana w
przeglądarce nie zostaje wyczyszczona automatycznie. Trasy obsługujące gości mogą rozpoznać odrębną
tożsamość gościa, jeśli zostały tak skonfigurowane, więc pomyślna odpowiedź sama w sobie nie dowodzi,
że wyłączone konto nadal posiada uprawnienia.

Weryfikuj zmiany przy użyciu istniejących oraz nowych sesji, kontrolując zarówno zachowany, jak i
odwołany dostęp oraz rejestrując treść odpowiedzi i tożsamość. Nie traktuj samego kodu stanu HTTP jako
dowodu autoryzacji ani nie zakładaj, że każdy odbiorca pamięci podręcznej odświeża dane w identyczny sposób.
